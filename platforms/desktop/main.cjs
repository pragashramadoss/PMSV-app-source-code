const { app, BrowserWindow, protocol, net, ipcMain, dialog, Notification, shell, Menu, session } = require('electron');
const fs = require('node:fs/promises');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
const policy = require('./policy.cjs');
const root = path.join(__dirname, '..', 'www');
const offline = process.argv.includes('--pmsv-offline');
const dataArg = process.argv.find(x => x.startsWith('--pmsv-test-data='));
if (dataArg) app.setPath('userData', dataArg.slice('--pmsv-test-data='.length));
app.setName('PMSV');
app.setAppUserModelId('com.pmsvgroup.foodsafety.desktop');
protocol.registerSchemesAsPrivileged([{ scheme: 'pmsv', privileges: { standard: true, secure: true, supportFetchAPI: true, stream: true } }]);
let window;
const notifications = new Set();
function caller(event) {
  if (!event.senderFrame || event.senderFrame !== event.sender.mainFrame || !policy.localURL(event.senderFrame.url)) throw Error('Untrusted app frame');
}
async function request(route, method = 'GET', body) {
  if (!policy.apiPath(route, method)) return { status: 403, data: { error: 'This action is not available in the installed app.' } };
  const cache = path.join(app.getPath('userData'), 'news-cache.json');
  try {
    if (offline) throw Error('Offline mode');
    const options = { method, credentials: 'omit', redirect: 'error', signal: AbortSignal.timeout(18000), headers: { 'Accept': 'application/json', 'X-PMSV-App': 'desktop-2.2.0' } };
    if (method === 'POST') {
      options.body = JSON.stringify(body); if (options.body.length > 65536) throw Error('Message is too large');
      // This first-party native client has no browser cookies. Only public forum
      // routes are exposed; administrator, push and private report routes are excluded.
      options.headers['Content-Type'] = 'application/json'; options.headers.Origin = 'https://pmsvgroup.com';
    }
    const response = await net.fetch('https://pmsvgroup.com' + route, options);
    const text = await response.text(); if (text.length > 12 * 1024 * 1024) throw Error('Response is too large');
    const data = JSON.parse(text);
    if (route === '/api/news' && response.ok && Array.isArray(data.news)) {
      await fs.mkdir(path.dirname(cache), { recursive: true });
      await fs.writeFile(cache + '.tmp', JSON.stringify(data)); await fs.rename(cache + '.tmp', cache);
    }
    return { status: response.status, data };
  } catch (error) {
    if (route === '/api/news') {
      let data; try { data = JSON.parse(await fs.readFile(cache, 'utf8')); } catch { data = { news: JSON.parse(await fs.readFile(path.join(root, 'archive-seed.json'), 'utf8')) }; }
      return { status: 200, data: { ...data, offline: true } };
    }
    if (route === '/api/updater') return { status: 200, data: { active: false, checks: [] } };
    return { status: 503, data: { error: 'Connect to the internet to use Discussions. Your saved audits remain on this device.' } };
  }
}
function createWindow() {
  window = new BrowserWindow({ width: 1280, height: 850, minWidth: 390, minHeight: 600, title: 'PMSV', backgroundColor: '#f4f7fc', icon: path.join(root, 'icons/pmsv-family-512.png'), webPreferences: { preload: path.join(__dirname, 'preload.cjs'), sandbox: true, contextIsolation: true, nodeIntegration: false, webSecurity: true, spellcheck: true } });
  window.webContents.setWindowOpenHandler(({ url }) => { if (policy.externalURL(url)) void shell.openExternal(url); return { action: 'deny' }; });
  window.webContents.on('will-navigate', (event, url) => { if (!policy.localURL(url)) { event.preventDefault(); if (policy.externalURL(url)) void shell.openExternal(url); } });
  window.webContents.on('will-attach-webview', event => event.preventDefault());
  void window.loadURL(policy.ORIGIN + '/');
  window.on('closed', () => { window = null; });
}
app.whenReady().then(async () => {
  session.defaultSession.setPermissionRequestHandler((_wc, _permission, callback) => callback(false));
  session.defaultSession.setPermissionCheckHandler(() => false);
  protocol.handle('pmsv', async request => {
    if (!policy.localURL(request.url) || request.method !== 'GET') return new Response('Not found', { status: 404 });
    const u = new URL(request.url); let file = policy.assetPath(root, u.pathname);
    if (!file) return new Response('Not found', { status: 404 });
    try { if ((await fs.stat(file)).isDirectory()) file = path.join(file, 'index.html'); } catch {
      if (path.extname(file)) return new Response('Not found', { status: 404 });
      file = path.join(root, 'index.html');
    }
    const response = await net.fetch(pathToFileURL(file).toString());
    const headers = new Headers(response.headers);
    headers.set('Content-Security-Policy', "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' blob:; frame-src 'self'; object-src 'none'; base-uri 'self'");
    return new Response(response.body, { status: response.status, headers });
  });
  ipcMain.handle('pmsv:request', (event, args) => { caller(event); return request(args.path, args.method, args.body); });
  ipcMain.handle('pmsv:open', (event, url) => { caller(event); if (!policy.externalURL(url)) throw Error('Unsupported link'); return shell.openExternal(url); });
  ipcMain.handle('pmsv:save', async (event, { name, base64 }) => {
    caller(event); if (typeof base64 !== 'string' || base64.length > 30 * 1024 * 1024 || !/^[A-Za-z0-9+/=\r\n]*$/.test(base64)) throw Error('Invalid report');
    const result = await dialog.showSaveDialog(window, { title: 'Save PMSV report', defaultPath: policy.fileName(name) });
    if (result.canceled || !result.filePath) return false;
    await fs.writeFile(result.filePath, Buffer.from(base64, 'base64')); return true;
  });
  ipcMain.handle('pmsv:print', async (event, { html }) => {
    caller(event);
    if (!html) { window.webContents.print({ printBackground: true }); return true; }
    if (typeof html !== 'string' || html.length > 4 * 1024 * 1024) throw Error('Report is too large');
    const report = new BrowserWindow({ show: false, webPreferences: { sandbox: true, contextIsolation: true, nodeIntegration: false, javascript: false } });
    report.webContents.setWindowOpenHandler(() => ({ action: 'deny' }));
    await report.loadURL('data:text/html;charset=utf-8,' + encodeURIComponent(html));
    report.webContents.print({ printBackground: true }, () => report.destroy()); return true;
  });
  ipcMain.handle('pmsv:notify', (event, { title, body }) => {
    caller(event); if (!Notification.isSupported()) return false;
    const n = new Notification({ title: String(title).slice(0, 120), body: String(body).slice(0, 500), icon: path.join(root, 'icons/pmsv-family-512.png') });
    notifications.add(n);
    n.on('close', () => notifications.delete(n));
    n.on('click', () => { if (!window) createWindow(); window.show(); window.focus(); void window.loadURL(policy.ORIGIN + '/updates'); notifications.delete(n); }); n.show(); return true;
  });
  Menu.setApplicationMenu(Menu.buildFromTemplate([
    ...(process.platform === 'darwin' ? [{ role: 'appMenu' }] : []),
    { label: 'File', submenu: [{ label: 'Home', click: () => window.loadURL(policy.ORIGIN + '/') }, { label: 'Print', accelerator: 'CmdOrCtrl+P', click: () => window.webContents.print({ printBackground: true }) }, { type: 'separator' }, { role: 'quit' }] },
    { role: 'editMenu' }, { label: 'View', submenu: [{ role: 'reload' }, { role: 'resetZoom' }, { role: 'zoomIn' }, { role: 'zoomOut' }, { role: 'togglefullscreen' }] }
  ]));
  createWindow(); app.on('activate', () => { if (!BrowserWindow.getAllWindows().length) createWindow(); });
});
app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit(); });
