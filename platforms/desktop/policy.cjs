const path = require('node:path');
const ORIGIN = 'pmsv://app';
function localURL(value) {
  try { const u = new URL(value); return u.protocol === 'pmsv:' && u.hostname === 'app' && !u.username && !u.password && !u.port; } catch { return false; }
}
function externalURL(value) {
  try { const u = new URL(value); return ['https:', 'mailto:'].includes(u.protocol) && !u.username && !u.password; } catch { return false; }
}
function apiPath(value, method = 'GET') {
  if (typeof value !== 'string' || value.includes('..') || /[?#%\\]/.test(value)) return false;
  if (method === 'GET') return /^\/api\/(news|updater|discussions(?:\/[0-9]+)?)$/.test(value);
  return method === 'POST' && /^\/api\/discussions(?:\/report|\/[0-9]+\/answers)?$/.test(value);
}
function assetPath(root, value) {
  let decoded; try { decoded = decodeURIComponent(value); } catch { return null; }
  if (decoded.includes('\\') || decoded.includes('\0') || decoded.split('/').includes('..')) return null;
  const result = path.resolve(root, '.' + (decoded.startsWith('/') ? decoded : '/' + decoded));
  return result === root || result.startsWith(root + path.sep) ? result : null;
}
function fileName(value) {
  return String(value || 'PMSV-report').replace(/[\\/:*?"<>|\u0000-\u001f]/g, '-').slice(0, 150);
}
module.exports = { ORIGIN, localURL, externalURL, apiPath, assetPath, fileName };
