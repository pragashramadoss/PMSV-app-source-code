'use strict';
const fs = require('node:fs');
const path = require('node:path');
const {execFileSync} = require('node:child_process');

const root = path.resolve(__dirname, '..');
const helper = path.join(root, 'fssai-helper');

function writeHelperDownload(output) {
  const revision = execFileSync('git', ['rev-parse','HEAD'], {cwd:root, encoding:'utf8'}).trim();
  if (!/^[0-9a-f]{40}$/.test(revision)) throw new Error('Cannot resolve the source revision for this download.');
  const sourceBase = 'https://github.com/pragashramadoss/PMSV-app-source-code/blob/' + revision + '/fssai-helper/';
  const template = fs.readFileSync(path.join(helper, 'index.html'), 'utf8');
  const html = template.replace('<meta charset="utf-8">', '<meta charset="utf-8"><base href="' + sourceBase + '">')
    .replace(/<script src="([a-z0-9-]+\.js)(?:\?[^"]*)?"><\/script>/g, (_, name) => {
      const code = fs.readFileSync(path.join(helper, name), 'utf8').replace(/<\/script/gi, '<\\/script');
      return '<script>\n' + code + '\n</script>';
    });
  if (!html.includes('<base href="' + sourceBase + '">') || /<script\b[^>]*\bsrc=/i.test(html)) {
    throw new Error('The portable Helper still needs an external application asset.');
  }
  fs.writeFileSync(output, html);
  return sourceBase;
}

if (require.main === module) {
  if (!process.argv[2]) throw new Error('Supply an output HTML filename.');
  writeHelperDownload(process.argv[2]);
}

module.exports = {writeHelperDownload};
