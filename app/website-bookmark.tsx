'use client';
import {useEffect,useState} from 'react';
import {BookmarksLink,SaveBookmark} from './bookmark-controls';
export default function WebsiteBookmark({footer=false}:{footer?:boolean}){
 const [url,setUrl]=useState('');
 useEffect(()=>{setUrl(location.origin+location.pathname);},[]);
 if(footer||/\/bookmarks\/?$/.test(url))return <BookmarksLink className={footer?'footer-bookmark':'header-bookmarks'} current={!footer}/>;
 return <SaveBookmark item={{url,title:'PMSV',kind:'page'}} label="this page" className="page-bookmark" resolveItem={()=>({url,title:(document.querySelector('[data-bookmark-title]')?.textContent||document.querySelector('main h1')?.textContent||document.title).trim()+' · PMSV',kind:'page',source:'PMSV'})}/>;
}
