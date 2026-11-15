import {useState} from 'react';
import {Bell,BellRing} from 'lucide-react';
import {Dialog,DialogContent,DialogHeader,DialogTitle,DialogDescription} from '../../components/ui/dialog';
import {alertsEnabled,enableAlerts,disableAlerts,sendNewsNotification} from './runtime';
export async function subscribeToDiscussionAnswers():Promise<never>{throw Error('Reply alerts are not available in this platform preview. You can read replies in Discussions.');}
export default function AppNotifications(){
 const [open,setOpen]=useState(false),[enabled,setEnabled]=useState(alertsEnabled),[busy,setBusy]=useState(false),[message,setMessage]=useState('');
 async function toggle(){setBusy(true);setMessage('');try{if(enabled){disableAlerts();setEnabled(false)}else{await enableAlerts();setEnabled(true)}}catch(e){setMessage((e as Error).message)}finally{setBusy(false)}}
 async function test(){setBusy(true);try{setMessage(await sendNewsNotification())}catch(e){setMessage((e as Error).message)}finally{setBusy(false)}}
 return <><div className="app-notification-actions"><button aria-label="App notifications" onClick={()=>setOpen(true)}>{enabled?<BellRing size={19}/>:<Bell size={19}/>}<span>Notifications</span></button></div><Dialog open={open} onOpenChange={setOpen}><DialogContent className="subscription-dialog"><DialogHeader><DialogTitle>App notifications</DialogTitle><DialogDescription>Get news alerts while PMSV is open. Background alerts when the app is closed are not included in this platform preview.</DialogDescription></DialogHeader><button className="subscription-submit" disabled={busy} onClick={()=>void toggle()}>{enabled?'Turn off notifications':'Allow notifications'}</button>{enabled&&<button className="subscription-submit" disabled={busy} onClick={()=>void test()}>Send latest news notification</button>}<p role="status" className="push-status">{message}</p></DialogContent></Dialog></>;
}
