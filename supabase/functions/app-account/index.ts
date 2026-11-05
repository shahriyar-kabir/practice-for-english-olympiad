import { accountHandler } from './handler.ts';
const base=(Deno.env.get('SUPABASE_URL')||'').replace(/\/$/,'');
const key=Deno.env.get('SUPABASE_ANON_KEY')||'',admin=Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')||'';
const request=(path:string,token:string,init:RequestInit={})=>fetch(base+'/auth/v1/'+path,{...init,headers:{apikey:key,Authorization:'Bearer '+token,'Content-Type':'application/json',...init.headers},signal:AbortSignal.timeout(10_000)});
Deno.serve(accountHandler({
  async actor(jwt){const response=await request('user',jwt);if(!response.ok)return null;const user=await response.json();return typeof user.id==='string'&&typeof user.email==='string'&&user.is_anonymous!==true?{id:user.id,email:user.email}:null;},
  async reauthenticate(email,password){const response=await request('token?grant_type=password',key,{method:'POST',body:JSON.stringify({email,password})});if(!response.ok)return null;const result=await response.json();return typeof result.user?.id==='string'&&typeof result.access_token==='string'?{id:result.user.id,token:result.access_token}:null;},
  async revoke(jwt){const response=await request('logout?scope=global',jwt,{method:'POST'});if(!response.ok)throw new Error('revoke_failed');},
  async remove(id){const response=await request('admin/users/'+encodeURIComponent(id),admin,{method:'DELETE',headers:{apikey:admin},body:JSON.stringify({should_soft_delete:false})});if(!response.ok)throw new Error('delete_failed');},
},Deno.env.get('APP_ORIGIN')||'https://wizpiko.com'));
