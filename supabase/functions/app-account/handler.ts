type Actor={id:string;email:string};
export type AccountBackend={actor:(jwt:string)=>Promise<Actor|null>;reauthenticate:(email:string,password:string)=>Promise<{id:string;token:string}|null>;revoke:(jwt:string)=>Promise<void>;remove:(id:string)=>Promise<void>};
export function accountHandler(backend:AccountBackend,origin='https://wizpiko.com'){
  return async(request:Request)=>{
    const allowed=request.headers.get('Origin');
    const headers:Record<string,string>={'Content-Type':'application/json','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'};
    if(allowed===origin){headers['Access-Control-Allow-Origin']=origin;headers.Vary='Origin';}
    const reply=(status:number,error:string)=>new Response(JSON.stringify({error}),{status,headers});
    if(allowed&&allowed!==origin)return reply(403,'This origin is not permitted.');
    if(request.method==='OPTIONS')return new Response(null,{status:204,headers:{...headers,'Access-Control-Allow-Methods':'POST, OPTIONS','Access-Control-Allow-Headers':'authorization,apikey,content-type'}});
    if(request.method!=='POST')return reply(405,'Use POST.');
    const jwt=request.headers.get('Authorization')?.match(/^Bearer (\S+)$/i)?.[1];
    if(!jwt||jwt.length>8192)return reply(401,'Sign in to manage your account.');
    if(!request.headers.get('Content-Type')?.startsWith('application/json'))return reply(415,'Send JSON.');
    try{
      const actor=await backend.actor(jwt);if(!actor)return reply(401,'Sign in again to manage your account.');
      const reader=request.body?.getReader();if(!reader)return reply(400,'Confirm your account deletion.');
      let size=0;const chunks:Uint8Array[]=[];
      try{while(true){const part=await reader.read();if(part.done)break;size+=part.value.length;if(size>4096){await reader.cancel();return reply(413,'The request is too large.');}chunks.push(part.value);}}finally{reader.releaseLock();}
      const bytes=new Uint8Array(size);let offset=0;for(const chunk of chunks){bytes.set(chunk,offset);offset+=chunk.length;}
      let body;try{body=JSON.parse(new TextDecoder().decode(bytes));}catch{return reply(400,'Confirm your account deletion.');}
      if(body?.action!=='delete-account'||body.confirmation!=='DELETE'||typeof body.password!=='string'||!body.password||body.password.length>256)return reply(400,'Enter your password and type DELETE to confirm.');
      const proof=await backend.reauthenticate(actor.email,body.password);
      if(!proof||proof.id!==actor.id)return reply(403,'Your password could not be confirmed. Please try again.');
      await backend.revoke(proof.token);
      await backend.remove(actor.id);
      return new Response(JSON.stringify({deleted:true}),{status:200,headers});
    }catch{return reply(503,'Your account could not be deleted. Please sign in again and try later.');}
  };
}
