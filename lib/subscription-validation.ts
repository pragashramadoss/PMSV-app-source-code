export function validateSubscription(input:unknown){
 const d=input as Record<string,unknown>;
 if(!d||!['email','whatsapp'].includes(String(d.channel)))throw Error('Choose email or WhatsApp.');
 if(d.consent!==true)throw Error('Please agree before joining the interest list.');
 if(typeof d.official!=='boolean'||typeof d.general!=='boolean'||!d.official&&!d.general)throw Error('Choose at least one type of update.');
 if(typeof d.contact!=='string'||d.contact.length>254)throw Error('Enter a valid contact.');
 let contact=d.contact.trim();
 if(d.channel==='email'){
  contact=contact.toLowerCase();
  if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact))throw Error('Enter a valid email address.');
 }else{
  contact=contact.replace(/[\s().-]/g,'');
  if(!/^\+[1-9]\d{7,14}$/.test(contact))throw Error('Include the country code, for example +91 followed by your number.');
 }
 return {channel:d.channel as string,contact,topics:[...(d.official?['fssai']:[]),...(d.general?['general']:[])]};
}
export async function hash(value:string){return [...new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(value)))].map(x=>x.toString(16).padStart(2,'0')).join('')}
export function sameOrigin(request:Request){const o=request.headers.get('origin');return !!o&&o===new URL(request.url).origin}
