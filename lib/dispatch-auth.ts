import {digest} from './push-protocol';
export async function authorizedDispatch(request:Request,secret:unknown){
 if(typeof secret!=='string'||secret.length<32)return false;
 const token=request.headers.get('authorization');
 if(!token?.startsWith('Bearer ')||token.length>256)return false;
 return await digest(token.slice(7))===await digest(secret);
}
