import {NextResponse} from 'next/server';
export function middleware(){
 const response=NextResponse.next();
 response.headers.set('X-Content-Type-Options','nosniff');
 response.headers.set('Referrer-Policy','strict-origin-when-cross-origin');
 response.headers.set('Permissions-Policy','camera=(), microphone=(), geolocation=()');
 // Permit the owner's ChatGPT Site view while blocking embedding by arbitrary sites.
 response.headers.set('Content-Security-Policy',"object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'self' https://chatgpt.com");
 response.headers.set('Strict-Transport-Security','max-age=31536000');
 return response;
}
