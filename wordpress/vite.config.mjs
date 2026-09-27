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
   if(id.endsWith('/newsroom.tsx')){
    const start=code.indexOf(' useEffect(()=>{\n  type Context=');
    const end=code.indexOf('\n function Recent',start);
    if(start<0||end<0)throw Error('Source changed: review optional browser-tool adapter');
    code=code.slice(0,start)+code.slice(end);
   }
   if(id.endsWith('/privacy/page.tsx'))code=code.replace('PMSV uses OpenAI Sites and Cloudflare hosting and database infrastructure.','PMSV uses WordPress.com hosting and WordPress database infrastructure.');
   const result=await transformAsync(code,{filename:id,configFile:false,babelrc:false,parserOpts:{plugins:['typescript','jsx']},plugins:[({types:t})=>({visitor:{StringLiteral(p){
    if(!p.node.value.startsWith('/')||p.node.value.startsWith('//'))return;
    const isPublicAsset=['/brand/','/logos/','/icons/'].some(prefix=>p.node.value.startsWith(prefix));
    const prop=isPublicAsset?'publicBase':'base';
    const suffix=isPublicAsset?p.node.value.slice(1):p.node.value;
    const expr=t.binaryExpression('+',t.memberExpression(t.memberExpression(t.identifier('window'),t.identifier('PMSV')),t.identifier(prop)),t.stringLiteral(suffix));
    if(p.parentPath.isJSXAttribute())p.replaceWith(t.jsxExpressionContainer(expr));else p.replaceWith(expr);
    p.skip();
   }}})]});
   return {code:result.code,map:null};
  }
 },react()],
 build:{outDir:'plugin/assets',emptyOutDir:true,manifest:true,rollupOptions:{input:path.join(root,'wordpress/index.html')}},
});
