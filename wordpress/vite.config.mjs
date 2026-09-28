import {defineConfig} from 'vite';
import react from '@vitejs/plugin-react';
import {transformAsync} from '@babel/core';
import path from 'node:path';
const root=path.resolve(import.meta.dirname,'..');
export default defineConfig({
 root:path.join(root,'wordpress'), base:'./', publicDir:false,
 resolve:{alias:{'@':root,'next/link':path.join(root,'wordpress/src/link.tsx')}},
 plugins:[{
  name:'pmsv-wordpress-original-source-adapter', enforce:'pre',
  async transform(code,id){
   if(!id.startsWith(root+'/app/')||!id.endsWith('.tsx'))return;
   // app-notifications contains URL/path string literals used as data, not links.
   // Rewriting "/" inside those helpers corrupts service-worker and VAPID logic.
   if(id===root+'/app/app-notifications.tsx')return;
   const result=await transformAsync(code,{filename:id,configFile:false,babelrc:false,parserOpts:{plugins:['typescript','jsx']},plugins:[({types:t})=>({visitor:{StringLiteral(p){
    if(!p.node.value.startsWith('/')||p.node.value.startsWith('//'))return;
    const isPublicAsset=['/brand/','/logos/','/icons/'].some(prefix=>p.node.value.startsWith(prefix));
    const helperCall=isPublicAsset&&p.parentPath.isCallExpression()&&t.isIdentifier(p.parentPath.node.callee)&&['publicAsset','assetUrl'].includes(p.parentPath.node.callee.name);
    if(helperCall)return;
    const suffix=isPublicAsset?p.node.value.slice(1):p.node.value;
    const left=t.memberExpression(t.memberExpression(t.identifier('window'),t.identifier('PMSV')),t.identifier(isPublicAsset?'publicBase':'base'));
    const expr=t.binaryExpression('+',left,t.stringLiteral(suffix));
    if(p.parentPath.isJSXAttribute())p.replaceWith(t.jsxExpressionContainer(expr));else p.replaceWith(expr);
    p.skip();
   }}})]});
   return {code:result.code,map:null};
  }
 },react()],
 build:{outDir:'plugin/assets',emptyOutDir:true,manifest:true,rollupOptions:{input:path.join(root,'wordpress/index.html')}},
});
