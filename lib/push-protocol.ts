export const encode=(bytes:Uint8Array)=>btoa(String.fromCharCode(...bytes)).replace(/=/g,'').replace(/\+/g,'-').replace(/\//g,'_');
export const decode=(value:string)=>Uint8Array.from(atob(value.replace(/-/g,'+').replace(/_/g,'/')),c=>c.charCodeAt(0));
export async function digest(value:string){return encode(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(value))))}
export function validEndpoint(value:unknown):value is string{
 if(typeof value!=='string'||value.length>2048)return false;
 try{const u=new URL(value);return u.protocol==='https:'&&!u.username&&!u.password&&!u.port&&!u.hash&&(u.hostname==='fcm.googleapis.com'||u.hostname==='updates.push.services.mozilla.com'||u.hostname==='web.push.apple.com'||/^updates\.push\.services\.mozilla\.com$/.test(u.hostname))&&u.pathname.length>10}catch{return false}
}
export async function authorization(endpoint:string,jwk:JsonWebKey,publicKey:string){
 const header=encode(new TextEncoder().encode(JSON.stringify({typ:'JWT',alg:'ES256'})));
 const payload=encode(new TextEncoder().encode(JSON.stringify({aud:new URL(endpoint).origin,exp:Math.floor(Date.now()/1000)+3600,sub:'mailto:pragash.ramadoss@gmail.com'})));
 const key=await crypto.subtle.importKey('jwk',jwk,{name:'ECDSA',namedCurve:'P-256'},false,['sign']);
 const signature=await crypto.subtle.sign({name:'ECDSA',hash:'SHA-256'},key,new TextEncoder().encode(header+'.'+payload));
 return 'vapid t='+header+'.'+payload+'.'+encode(new Uint8Array(signature))+', k='+publicKey;
}
