'use client';
import {useState} from 'react';
import {Mail,MessageCircle,CheckCircle2} from 'lucide-react';
import {Dialog,DialogContent,DialogHeader,DialogTitle,DialogDescription} from '@/components/ui/dialog';
import {Tabs,TabsList,TabsTrigger,TabsContent} from '@/components/ui/tabs';
import {Checkbox} from '@/components/ui/checkbox';
export default function Subscriptions(){
 const [open,setOpen]=useState(false),[channel,setChannel]=useState('email'),[contact,setContact]=useState(''),[official,setOfficial]=useState(true),[general,setGeneral]=useState(true),[consent,setConsent]=useState(false),[busy,setBusy]=useState(false),[error,setError]=useState(''),[success,setSuccess]=useState(false),[manageUrl,setManageUrl]=useState('');
 function start(c:string){setChannel(c);setContact('');setConsent(false);setError('');setSuccess(false);setManageUrl('');setOpen(true)}
 function changeChannel(c:string){setChannel(c);setContact('');setError('');setConsent(false)}
 async function submit(e:React.FormEvent){
  e.preventDefault();setError('');setBusy(true);
  try{const r=await fetch('/api/subscriptions',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({channel,contact,official,general,consent})});const d=await r.json() as {error?:string;manageUrl?:string};if(!r.ok)throw Error(d.error||'Could not save your request. Please try again.');setManageUrl(d.manageUrl||'');setSuccess(true);setContact('');}catch(e){setError(e instanceof Error?e.message:'Could not save your request.');}finally{setBusy(false)}
 }
 return <><div className="subscribe-actions"><span>Get updates</span><button onClick={()=>start('email')}><Mail size={16}/>Email</button><button onClick={()=>start('whatsapp')}><MessageCircle size={16}/>WhatsApp</button></div>
 <Dialog open={open} onOpenChange={setOpen}><DialogContent className="subscription-dialog"><DialogHeader><DialogTitle>{success?'Request saved':'Get food safety updates'}</DialogTitle><DialogDescription>{success?'You have joined the alerts interest list.':'Choose where you would like to receive new headlines and links.'}</DialogDescription></DialogHeader>
 {success?<div className="subscribe-success"><CheckCircle2 size={32}/><p>Alerts are not active yet. Once delivery is ready, we’ll ask you to verify your contact before activating updates.</p>{manageUrl&&<div><p>Keep this private link to remove your request:</p><a href={manageUrl}>Manage this request</a><button type="button" className="text-button" onClick={()=>navigator.clipboard.writeText(new URL(manageUrl,location.origin).href).then(()=>setError('Management link copied.')).catch(()=>setError('Open the management link and copy its address.'))}>Copy link</button></div>}<button className="subscription-submit" onClick={()=>setOpen(false)}>Done</button></div>:<>
 <p className="subscription-setup">Coming soon · Email and WhatsApp delivery are being set up. Join the interest list; no alerts will be sent yet.</p>
 <Tabs value={channel} onValueChange={changeChannel}><TabsList className="subscription-channels"><TabsTrigger value="email"><Mail size={16}/>Email</TabsTrigger><TabsTrigger value="whatsapp"><MessageCircle size={16}/>WhatsApp</TabsTrigger></TabsList><TabsContent value={channel}>
 <form onSubmit={submit} className="subscription-form"><label htmlFor="subscription-contact">{channel==='email'?'Email address':'WhatsApp number (with country code)'}</label><input id="subscription-contact" type={channel==='email'?'email':'tel'} autoComplete={channel==='email'?'email':'tel'} value={contact} onChange={e=>setContact(e.target.value)} placeholder={channel==='email'?'you@example.com':'+91 98765 43210'} maxLength={254} required/>
 <fieldset><legend>Updates you’re interested in</legend><label><Checkbox checked={official} onCheckedChange={v=>setOfficial(v===true)}/>FSSAI notifications, advisories and releases</label><label><Checkbox checked={general} onCheckedChange={v=>setGeneral(v===true)}/>Inspections, enforcement and court news</label></fieldset>
 <label className="subscription-consent"><Checkbox checked={consent} onCheckedChange={v=>setConsent(v===true)}/><span>This is my contact. I agree to a verification message when alerts launch and to receive the selected PMSV updates after I verify. I can unsubscribe at any time.</span></label>
 <p className="subscription-privacy">Your contact is stored privately for PMSV alerts. It is not displayed in the news feed. Alerts will cover new items, not repeat the old archive.</p>
 <button className="subscription-submit" type="submit" disabled={busy||!consent||(!official&&!general)}>{busy?'Saving…':`Join ${channel==='email'?'email':'WhatsApp'} interest list`}</button>
 </form></TabsContent></Tabs></>}{error&&<p className="subscription-error" role="status">{error}</p>}
 </DialogContent></Dialog></>;
}
