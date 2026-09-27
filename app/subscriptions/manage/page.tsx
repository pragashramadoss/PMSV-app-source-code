'use client';
import {useState,useEffect} from 'react';
export default function Manage(){
 const [token,setToken]=useState(''),[done,setDone]=useState(false),[busy,setBusy]=useState(false),[error,setError]=useState('');
 useEffect(()=>{setToken(location.hash.slice(1));},[]);
 async function remove(){setBusy(true);setError('');try{const r=await fetch('/api/subscriptions/cancel',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({token})});const d=await r.json() as {error?:string;manageUrl?:string};if(!r.ok)throw Error(d.error||'Request failed.');setDone(true);history.replaceState(null,'',location.pathname)}catch(e){setError(e instanceof Error?e.message:'Please try again.')}finally{setBusy(false)}}
 return <main className="subscription-manage"><h1>{done?'Request removed':'Manage your alert request'}</h1><p>{done?'Your saved contact has been removed from the interest list.':'Remove your saved contact from the PMSV Food Safety Updates interest list.'}</p>{!done&&<button className="subscription-submit" disabled={!token||busy} onClick={remove}>{busy?'Removing…':'Remove my request'}</button>}{!token&&!done&&<p>Open the private management link you received after signing up.</p>}{error&&<p role="alert">{error}</p>}<a href="/">Return to food safety updates</a></main>
}
