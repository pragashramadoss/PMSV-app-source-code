const ISSUER='https://token.actions.githubusercontent.com';
const REPO='pragashramadoss/pmsv-updater';
export function validUpdaterClaims(c:Record<string,unknown>,now=Date.now()/1000){
 return c.iss===ISSUER&&c.aud==='pmsv-updater'&&c.repository===REPO&&c.repository_id==='1370842496'&&c.repository_owner_id==='329360973'&&c.ref==='refs/heads/main'&&c.workflow_ref===REPO+'/.github/workflows/update.yml@refs/heads/main'&&['schedule','workflow_dispatch','push'].includes(String(c.event_name))&&typeof c.exp==='number'&&c.exp>now&&typeof c.nbf==='number'&&c.nbf<=now+30&&typeof c.iat==='number'&&c.iat<=now+30&&now-c.iat<600;
}
function bytes(s:string){return Uint8Array.from(atob(s.replace(/-/g,'+').replace(/_/g,'/')),c=>c.charCodeAt(0))}
export async function authorizedUpdater(request:Request){
 let stage='header';
 const fail=(reason:string)=>{console.warn('Updater authorization rejected:',reason);return false};
 try{
  const auth=request.headers.get('authorization');if(!auth?.startsWith('Bearer ')||auth.length>16000)return fail('missing-or-invalid-header');
  stage='decode';
  const parts=auth.slice(7).split('.');if(parts.length!==3)return fail('token-format');
  const h=JSON.parse(new TextDecoder().decode(bytes(parts[0]))),claims=JSON.parse(new TextDecoder().decode(bytes(parts[1])));
  if(h.alg!=='RS256'||typeof h.kid!=='string')return fail('algorithm');
  if(!validUpdaterClaims(claims))return fail('claims');
  stage='public-key-fetch';
  const response=await fetch(ISSUER+'/.well-known/jwks',{signal:AbortSignal.timeout(10000),redirect:'manual'});if(!response.ok)return fail('public-key-http-'+response.status);
  const data=await response.json() as {keys:(JsonWebKey&{kid?:string})[]};const jwk=data.keys.find(k=>k.kid===h.kid&&k.kty==='RSA');if(!jwk)return fail('unknown-key');
  stage='signature';
  const key=await crypto.subtle.importKey('jwk',jwk,{name:'RSASSA-PKCS1-v1_5',hash:'SHA-256'},false,['verify']);
  return await crypto.subtle.verify('RSASSA-PKCS1-v1_5',key,bytes(parts[2]),new TextEncoder().encode(parts[0]+'.'+parts[1]));
 }catch(error){if(stage==='public-key-fetch')console.warn('Updater public key retrieval:',error instanceof Error?error.message.slice(0,200):'unknown error');return fail(stage)}
}
