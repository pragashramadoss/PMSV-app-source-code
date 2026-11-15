export const BOOKMARK_KEY='pmsv-bookmarks-v1';
export const BOOKMARK_LIMIT=500;
export type BookmarkInput={url:string;title:string;kind:'article'|'page';source?:string;summary?:string;published?:string};
export type SavedBookmark=BookmarkInput&{savedAt:string};
type BookmarkStorage=Pick<Storage,'getItem'|'setItem'>;

export function bookmarkUrl(value:string){
 try{const url=new URL(value);if(!['https:','http:'].includes(url.protocol)||url.username||url.password||url.href.length>4096)return '';url.hash='';return url.href;}catch{return '';}
}
function cleanInput(input:BookmarkInput):BookmarkInput{
 const url=bookmarkUrl(input.url);
 if(!url||typeof input.title!=='string'||!input.title.trim()||!['article','page'].includes(input.kind))throw Error('This item cannot be bookmarked.');
 return {url,title:input.title.trim().slice(0,500),kind:input.kind,source:(input.source||'').slice(0,200),summary:(input.summary||'').slice(0,2000),published:(input.published||'').slice(0,40)};
}
export function readBookmarks(storage:Pick<Storage,'getItem'>):SavedBookmark[]{
 const raw=storage.getItem(BOOKMARK_KEY);if(raw===null)return [];
 try{
  const data=JSON.parse(raw);
  if(data?.version!==1||!Array.isArray(data.items))throw Error();
  const seen=new Set<string>();
  return data.items.map((item:SavedBookmark)=>{
   if(!item||typeof item.savedAt!=='string'||!Number.isFinite(Date.parse(item.savedAt)))throw Error();
   for(const field of ['source','summary','published'] as const)if(item[field]!==undefined&&typeof item[field]!=='string')throw Error();
   return {...cleanInput(item),savedAt:item.savedAt};
  }).filter((item:SavedBookmark)=>{if(seen.has(item.url))return false;seen.add(item.url);return true;})
    .sort((a:SavedBookmark,b:SavedBookmark)=>b.savedAt.localeCompare(a.savedAt));
 }catch{throw Error('Your saved bookmarks could not be read. They have not been changed.');}
}
// Read the latest stored list before every change; never claim success before setItem succeeds.
export function writeBookmark(storage:BookmarkStorage,input:BookmarkInput,save:boolean,now=new Date().toISOString()){
 const item=cleanInput(input),current=readBookmarks(storage),exists=current.some(b=>b.url===item.url);
 if(save===exists)return current;
 if(save&&current.length>=BOOKMARK_LIMIT)throw Error('Your bookmarks are full. Remove an item before saving another.');
 const next=save?[{...item,savedAt:now},...current]:current.filter(b=>b.url!==item.url);
 storage.setItem(BOOKMARK_KEY,JSON.stringify({version:1,items:next}));
 return next;
}
