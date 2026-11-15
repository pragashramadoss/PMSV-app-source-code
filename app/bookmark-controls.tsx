'use client';
import {useState} from 'react';
import {Bookmark,BookmarkCheck,X} from 'lucide-react';
import {bookmarkUrl,type BookmarkInput} from '@/lib/bookmark-store';
import {useBookmarks,saveBookmark,dismissBookmarkMessage} from '@/lib/use-bookmarks';

export function bookmarksPath(){const base=typeof window!=='undefined'?window.PMSV?.base||'':'';return `${base}/bookmarks`;}
export function BookmarksLink({className='',current=false}:{className?:string;current?:boolean}){
 return <a href={bookmarksPath()} className={className} aria-label="Bookmarks" aria-current={current?'page':undefined}><Bookmark size={18} aria-hidden="true"/><span className="nav-full">Bookmarks</span><span className="nav-short" aria-hidden="true">Saved</span></a>;
}
export function SaveBookmark({item,resolveItem,className='bookmark-save',label}:{item:BookmarkInput;resolveItem?:()=>BookmarkInput;className?:string;label?:string}){
 const {items,ready}=useBookmarks(),[busy,setBusy]=useState(false);
 const saved=items.some(b=>b.url===bookmarkUrl(item.url)),Icon=saved?BookmarkCheck:Bookmark;
 const name=label||item.title;
 return <button type="button" className={className} aria-pressed={saved} aria-label={(saved?'Remove bookmark: ':'Save bookmark: ')+name} title={saved?'Remove from Bookmarks':'Save to Bookmarks'} disabled={!ready||busy||!item.url} onClick={async()=>{setBusy(true);try{await saveBookmark(resolveItem?resolveItem():item,!saved);}finally{setBusy(false);}}}><Icon size={18} aria-hidden="true"/><span>{saved?'Saved':'Save'}</span></button>;
}
export function BookmarkFeedback(){
 const {message,error}=useBookmarks();
 return <><div className="bookmark-error" role="alert">{error}</div><div className={'bookmark-feedback'+(message?' visible':'')} role="status">{message&&<><span>{message}</span><a href={bookmarksPath()}>View bookmarks</a><button type="button" aria-label="Dismiss bookmark message" onClick={dismissBookmarkMessage}><X size={16}/></button></>}</div></>;
}
