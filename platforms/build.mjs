import { build,mergeConfig } from 'vite';
import {cp,mkdir,readFile,writeFile,readdir,rm} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import wp from '../wordpress/vite.config.mjs';
import tailwind from '@tailwindcss/postcss';
const here=path.dirname(fileURLToPath(import.meta.url));const root=path.resolve(here,'..');const out=path.join(here,'www');
await build(mergeConfig(wp,{
 root:here,base:'/',css:{postcss:{plugins:[tailwind({base:root})]}},
 plugins:[{name:'pmsv-native-notifications',enforce:'pre',resolveId(source,importer){if(source==='./app-notifications'&&importer?.replaceAll('\\','/').startsWith(root.replaceAll('\\','/')+'/app/'))return path.join(here,'shared/notifications.tsx');}}],
 build:{outDir:out,emptyOutDir:true,manifest:true,rollupOptions:{input:{app:path.join(here,'index.html'),runtime:path.join(here,'shared/runtime.ts')},output:{entryFileNames:'native/[name].js',chunkFileNames:'native/[name]-[hash].js',assetFileNames:'native/[name]-[hash][extname]'}}}
}));
await cp(path.join(root,'wordpress/plugin/public'),out,{recursive:true});
await cp(path.join(root,'wordpress/plugin/archive-seed.json'),path.join(out,'archive-seed.json'));
await rm(path.join(out,'sw.js'),{force:true});
await rm(path.join(out,'manifest.webmanifest'),{force:true});
async function instrument(dir){for(const e of await readdir(dir,{withFileTypes:true})){const file=path.join(dir,e.name);if(e.isDirectory())await instrument(file);else if(e.name.endsWith('.html')&&file!==path.join(out,'index.html')){let html=await readFile(file,'utf8');html=html.replace('</head>','<script type="module" src="/native/runtime.js"></script></head>');await writeFile(file,html);}}}
await instrument(out);
await writeFile(path.join(out,'platform-build.json'),JSON.stringify({version:'2.2.0',bundled:true,source:process.env.GITHUB_SHA||'local',newsAndDiscussionsRequireNetwork:true}));
console.log('Packaged website interface and offline audit/licence tools.');
