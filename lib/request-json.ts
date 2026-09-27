export async function readBoundedJson(request:Request,maxBytes:number):Promise<unknown>{
 const size=request.headers.get('content-length');
 if(size&&Number(size)>maxBytes)throw Error('Request too large');
 const reader=request.body?.getReader();if(!reader)throw Error('Request body required');
 const chunks:Uint8Array[]=[];let sizeRead=0;
 try{while(true){const {done,value}=await reader.read();if(done)break;sizeRead+=value.byteLength;if(sizeRead>maxBytes){await reader.cancel();throw Error('Request too large')}chunks.push(value)}}finally{reader.releaseLock()}
 const bytes=new Uint8Array(sizeRead);let offset=0;for(const chunk of chunks){bytes.set(chunk,offset);offset+=chunk.length}
 return JSON.parse(new TextDecoder().decode(bytes));
}
