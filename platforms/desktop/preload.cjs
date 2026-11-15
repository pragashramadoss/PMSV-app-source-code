const { contextBridge, ipcRenderer } = require('electron');
contextBridge.exposeInMainWorld('pmsvDesktop', {
  platform: process.platform,
  request: (path, method, body) => ipcRenderer.invoke('pmsv:request', { path, method, body }),
  save: (name, base64) => ipcRenderer.invoke('pmsv:save', { name, base64 }),
  print: html => ipcRenderer.invoke('pmsv:print', { html }),
  notify: (title, body) => ipcRenderer.invoke('pmsv:notify', { title, body }),
  open: url => ipcRenderer.invoke('pmsv:open', url),
});
