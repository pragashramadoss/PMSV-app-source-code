'use client';
import {useSyncExternalStore} from 'react';
import {BOOKMARK_KEY,readBookmarks,writeBookmark,type BookmarkInput,type SavedBookmark} from './bookmark-store';

type State={items:SavedBookmark[];ready:boolean;error:string;message:string};
const initial:State={items:[],ready:false,error:'',message:''};
let state=initial,watching=false;
const listeners=new Set<()=>void>();
function publish(next:State){state=next;listeners.forEach(listener=>listener());}
function errorMessage(error:unknown){
 if(error instanceof Error&&error.message.startsWith('Your '))return error.message;
 return 'Bookmarks are unavailable because this browser could not save website data. Check your browser storage settings and try again.';
}
function refresh(){
 try{publish({...state,items:readBookmarks(window.localStorage),ready:true,error:''});}
 catch(error){publish({...state,ready:true,error:errorMessage(error)});}
}
function subscribe(listener:()=>void){
 listeners.add(listener);
 if(!watching){watching=true;refresh();window.addEventListener('storage',event=>{if(event.key===BOOKMARK_KEY||event.key===null)refresh();});window.addEventListener('pageshow',refresh);}
 return()=>{listeners.delete(listener);};
}
export function useBookmarks(){return useSyncExternalStore(subscribe,()=>state,()=>initial);}
export async function saveBookmark(input:BookmarkInput,save:boolean){
 const update=()=>{
  try{
   const items=writeBookmark(window.localStorage,input,save);
   publish({items,ready:true,error:'',message:save?'Saved to Bookmarks.':'Removed from Bookmarks.'});return true;
  }catch(error){publish({...state,ready:true,error:errorMessage(error),message:''});return false;}
 };
 try{return navigator.locks?await navigator.locks.request(BOOKMARK_KEY,update):update();}
 catch(error){publish({...state,error:errorMessage(error),message:''});return false;}
}
export function dismissBookmarkMessage(){publish({...state,message:''});}
