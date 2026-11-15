'use client';
import {useEffect,useId,useRef,useState} from 'react';
import {Bookmark,Copy} from 'lucide-react';
import {Dialog,DialogTrigger,DialogContent,DialogHeader,DialogTitle,DialogDescription} from '@/components/ui/dialog';

export default function WebsiteBookmark({footer=false}:{footer?:boolean}){
 const [open,setOpen]=useState(false),[platform,setPlatform]=useState('desktop'),[url,setUrl]=useState('https://pmsvgroup.com/'),[message,setMessage]=useState('');
 const inputId=useId(),input=useRef<HTMLInputElement>(null);
 useEffect(()=>{
  const ua=navigator.userAgent;
  setPlatform(/iPad|iPhone|iPod/.test(ua)||(/Macintosh/.test(ua)&&navigator.maxTouchPoints>1)?'ios':/Android/.test(ua)?'android':/Macintosh|Mac OS X/.test(ua)?'mac':'desktop');
  const base=(window as Window&{PMSV?:{base?:string}}).PMSV?.base||'';
  setUrl(new URL(base.replace(/\/$/,'')+'/',location.origin).href);
 },[]);
 async function copyLink(){
  try{await navigator.clipboard.writeText(url);setMessage('Website link copied.');}
  catch{input.current?.focus();input.current?.select();setMessage('Select and copy the website address below.');}
 }
 return <Dialog open={open} onOpenChange={value=>{setOpen(value);setMessage('')}}>
  <DialogTrigger asChild><button type="button" className={footer?'footer-bookmark':undefined} aria-label="Bookmark PMSV website" title="Bookmark this website"><Bookmark size={18} aria-hidden="true"/><span>Bookmark</span></button></DialogTrigger>
  <DialogContent className="subscription-dialog bookmark-dialog">
   <DialogHeader><DialogTitle>Bookmark PMSV</DialogTitle><DialogDescription>Save the website in your browser for easy access.</DialogDescription></DialogHeader>
   <div className="bookmark-instructions">
    {platform==='ios'?<><strong>Safari on iPhone or iPad</strong><p>Open the page menu, choose <b>Share</b>, then <b>Add Bookmark</b> and <b>Save</b>. On some versions, Share is directly in the toolbar.</p></>:platform==='android'?<><strong>Chrome on Android</strong><p>Open the browser menu <b>⋮</b>, then tap the <b>star ★</b> to bookmark PMSV. Other browsers may call this <b>Add bookmark</b>.</p></>:<><strong>{platform==='mac'?'On your Mac':'On your computer'}</strong><p>Press <kbd>{platform==='mac'?'⌘ Command':'Ctrl'}</kbd> + <kbd>D</kbd>, then confirm to save PMSV in your bookmarks.</p></>}
   </div>
   <p className="bookmark-note">Your browser saves the bookmark. This button shows you how.</p>
   <div className="bookmark-address"><label htmlFor={inputId}>Website address</label><input ref={input} id={inputId} readOnly value={url} onFocus={event=>event.currentTarget.select()}/></div>
   <button type="button" className="subscription-submit bookmark-copy" onClick={()=>{void copyLink()}}><Copy size={17} aria-hidden="true"/>Copy website link</button>
   <p className="push-status" role="status">{message}</p>
  </DialogContent>
 </Dialog>;
}
