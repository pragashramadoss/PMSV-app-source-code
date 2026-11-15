import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {stripTypeScriptTypes} from 'node:module';
const code=stripTypeScriptTypes(await readFile(new URL('../../lib/bookmark-store.ts',import.meta.url),'utf8'));
const {BOOKMARK_KEY,BOOKMARK_LIMIT,bookmarkUrl,readBookmarks,writeBookmark}=await import('data:text/javascript,'+encodeURIComponent(code));
const article={url:'https://example.org/story#details',title:'Food safety update',kind:'article',source:'Official source',summary:'Saved article details',published:'2026-11-15'};
function storage(raw=null){return {raw,getItem(key){assert.equal(key,BOOKMARK_KEY);return this.raw;},setItem(key,value){assert.equal(key,BOOKMARK_KEY);this.raw=value;}};}
test('saved article details survive serialization and source-feed removal',()=>{
 const s=storage();writeBookmark(s,article,true,'2026-11-15T12:00:00.000Z');
 assert.deepEqual(readBookmarks(s),[{...article,url:'https://example.org/story',savedAt:'2026-11-15T12:00:00.000Z'}]);
});
test('same article deduplicates across views and fragments without losing its original save date',()=>{
 const s=storage();writeBookmark(s,article,true,'2026-11-15T12:00:00.000Z');writeBookmark(s,{...article,url:'https://example.org/story#other'},true);
 assert.equal(readBookmarks(s).length,1);assert.equal(readBookmarks(s)[0].savedAt,'2026-11-15T12:00:00.000Z');
 writeBookmark(s,{...article,url:'https://example.org/story'},false);assert.deepEqual(readBookmarks(s),[]);
});
test('successive writers read the current store and keep unrelated bookmarks',()=>{
 const s=storage();writeBookmark(s,article,true);writeBookmark(s,{...article,url:'https://example.org/second'},true);writeBookmark(s,article,false);
 assert.equal(readBookmarks(s).length,1);assert.equal(readBookmarks(s)[0].url,'https://example.org/second');
});
test('unsafe URLs and embedded credentials never become saved links',()=>{
 for(const url of ['javascript:alert(1)','data:text/html,bad','file:///etc/passwd','https://user:secret@example.org/','/relative']){
  const s=storage();assert.equal(bookmarkUrl(url),'');assert.throws(()=>writeBookmark(s,{...article,url},true));assert.equal(s.raw,null);
 }
});
test('malformed or future-version data is preserved on failed edits',()=>{
 for(const raw of ['{bad',JSON.stringify({version:2,items:[]}),JSON.stringify({version:1,items:[{...article,savedAt:'bad'}]})]){
  const s=storage(raw);assert.throws(()=>writeBookmark(s,article,true),/not been changed/);assert.equal(s.raw,raw);
 }
});
test('blocked writes do not claim success or overwrite existing records',()=>{
 const s=storage();writeBookmark(s,article,true);const before=s.raw;
 s.setItem=()=>{throw new DOMException('Full','QuotaExceededError');};
 assert.throws(()=>writeBookmark(s,{...article,url:'https://example.org/new'},true));assert.equal(s.raw,before);
 assert.throws(()=>writeBookmark(s,article,false));assert.equal(s.raw,before);
});
test('full storage gives a removable limit rather than silently evicting saved items',()=>{
 const s=storage(JSON.stringify({version:1,items:Array.from({length:BOOKMARK_LIMIT},(_,i)=>({...article,url:'https://example.org/'+i,savedAt:'2026-11-15T12:00:00.000Z'}))}));
 assert.throws(()=>writeBookmark(s,article,true),/full/);assert.equal(readBookmarks(s).length,BOOKMARK_LIMIT);
 writeBookmark(s,{...article,url:'https://example.org/0'},false);writeBookmark(s,article,true);assert.equal(readBookmarks(s).length,BOOKMARK_LIMIT);
});
