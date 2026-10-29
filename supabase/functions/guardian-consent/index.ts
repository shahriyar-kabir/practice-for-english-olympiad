// Deploy as Supabase Edge Function "guardian-consent". Set verify_jwt = false
// for this function: the request action validates its own Supabase user JWT,
// while one-time approval links use random bearer tokens, not learner sessions.
// Secrets: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, RESEND_API_KEY,
// GUARDIAN_FROM_EMAIL (verified sending domain), APP_ORIGIN.
import { createClient } from 'npm:@supabase/supabase-js@2';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL') || '';
const SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
const RESEND_KEY = Deno.env.get('RESEND_API_KEY') || '';
const FROM = Deno.env.get('GUARDIAN_FROM_EMAIL') || '';
const ORIGIN = Deno.env.get('APP_ORIGIN') || '';
const supabase = createClient(SUPABASE_URL, SERVICE_KEY, { auth: { persistSession: false } });
const headers = { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': ORIGIN, 'Access-Control-Allow-Headers': 'authorization, apikey, content-type', 'Access-Control-Allow-Methods':'GET, POST, OPTIONS' };
const json = (data:unknown,status=200)=>new Response(JSON.stringify(data),{status,headers});
const safe = (s:string)=>s.replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]||c));
async function digest(token:string) {
  const bytes = await crypto.subtle.digest('SHA-256',new TextEncoder().encode(token));
  return [...new Uint8Array(bytes)].map(b=>b.toString(16).padStart(2,'0')).join('');
}
function html(body:string,status=200) { return new Response('<!doctype html><html lang="en"><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/><title>Wizpiko Guardian Approval</title><body style="font:16px system-ui;background:#eff6ff;color:#183469;display:grid;place-items:center;min-height:90vh"><main style="background:white;padding:36px;max-width:480px;border-radius:23px;box-shadow:0 10px 40px #1235a220"><h1>Wizpiko</h1>'+body+'</main></body></html>',{status,headers:{'Content-Type':'text/html; charset=utf-8'}}); }
Deno.serve(async request=>{
  if(request.method==='OPTIONS')return new Response(null,{headers});
  if(!SUPABASE_URL||!SERVICE_KEY)return json({error:'Guardian approval is not configured.'},503);
  const url=new URL(request.url);
  if(request.method==='GET'){
    const token=url.searchParams.get('token')||'';
    if(!/^[a-f0-9]{64}$/.test(token))return html('<p>Invalid verification link.</p>',400);
    const { data:approval }=await supabase.from('guardian_approvals').select('id,expires_at,approved_at').eq('token_hash',await digest(token)).maybeSingle();
    if(!approval||approval.approved_at||new Date(approval.expires_at).getTime()<=Date.now())return html('<p>This link is invalid, expired or already used. Ask the learner to resend it.</p>',400);
    // GET is deliberately read-only; a mail scanner cannot silently approve.
    return html('<h2>Guardian email verification</h2><p>A Wizpiko learner requested permission to create an account. Only continue if you are their parent or legal guardian and understand the Wizpiko privacy information.</p><p>This verifies access to this email address; it does not constitute every form of legally required parental identity verification.</p><form method="POST"><input type="hidden" name="token" value="'+safe(token)+'"/><input type="hidden" name="action" value="approve"/><button style="background:#1265ea;color:white;border:0;padding:13px 23px;border-radius:22px;font-size:16px;cursor:pointer" type="submit">Approve this learner account</button></form><p>If you did not request this, close the page. No account access will be granted.</p>');
  }
  if(request.method!=='POST')return json({error:'Method not allowed'},405);
  const contentType=request.headers.get('content-type')||'';
  const body=contentType.includes('application/x-www-form-urlencoded')?Object.fromEntries((await request.formData()).entries()):await request.json().catch(()=>({})) as Record<string,unknown>;
  if(body.action==='approve'){
    const token=String(body.token||'');
    if(!/^[a-f0-9]{64}$/.test(token))return html('<p>Invalid link.</p>',400);
    const {data:item}=await supabase.from('guardian_approvals').select('id,learner_id,sent_to,expires_at,approved_at').eq('token_hash',await digest(token)).maybeSingle();
    if(!item||item.approved_at||new Date(item.expires_at).getTime()<=Date.now())return html('<p>This link has expired or already been used.</p>',400);
    const {data:profile}=await supabase.from('learner_profiles').select('guardian_email,consent_status').eq('user_id',item.learner_id).maybeSingle();
    if(!profile||profile.guardian_email!==item.sent_to||profile.consent_status!=='pending')return html('<p>Approval cannot be completed. Please contact support.</p>',400);
    const {error:updateError}=await supabase.from('learner_profiles').update({consent_status:'verified',consent_at:new Date().toISOString()}).eq('user_id',item.learner_id).eq('consent_status','pending');
    if(updateError)return html('<p>Could not save approval. Try again later.</p>',500);
    await supabase.from('guardian_approvals').update({approved_at:new Date().toISOString()}).eq('id',item.id);
    return html('<h2>Thank you!</h2><p>The guardian email approval has been recorded. The learner can sign in again to refresh their account.</p><p>Additional guardian identity or consent steps may be necessary based on your local law.</p>');
  }
  if(body.action!=='request')return json({error:'Unsupported action'},400);
  const jwt=request.headers.get('authorization')?.replace(/^Bearer\s+/i,'');
  if(!jwt)return json({error:'Please sign in first.'},401);
  const {data:{user},error:userError}=await supabase.auth.getUser(jwt);
  if(userError||!user)return json({error:'Invalid learner session.'},401);
  const {data:profile}=await supabase.from('learner_profiles').select('display_name,guardian_email,consent_status').eq('user_id',user.id).maybeSingle();
  if(!profile||profile.consent_status!=='pending'||!profile.guardian_email)return json({error:'This account does not require or cannot request guardian verification.'},400);
  if(!RESEND_KEY||!FROM)return json({error:'Guardian email is not yet configured by Wizpiko.'},503);
  const {data:recent}=await supabase.from('guardian_approvals').select('created_at').eq('learner_id',user.id).order('created_at',{ascending:false}).limit(1);
  if(recent?.[0]&&Date.now()-new Date(recent[0].created_at).getTime()<10*60*1000)return json({error:'An email was recently sent. Please try again in 10 minutes.'},429);
  const bytes=crypto.getRandomValues(new Uint8Array(32));
  const token=[...bytes].map(b=>b.toString(16).padStart(2,'0')).join('');
  const {error:insertError}=await supabase.from('guardian_approvals').insert({learner_id:user.id,token_hash:await digest(token),sent_to:profile.guardian_email,expires_at:new Date(Date.now()+24*60*60*1000).toISOString()});
  if(insertError)return json({error:'Could not create approval request.'},500);
  const link=SUPABASE_URL+'/functions/v1/guardian-consent?token='+token;
  const send=await fetch('https://api.resend.com/emails',{method:'POST',headers:{Authorization:'Bearer '+RESEND_KEY,'Content-Type':'application/json'},body:JSON.stringify({from:FROM,to:[profile.guardian_email],subject:'Wizpiko – guardian approval request',html:'<p>Hello,</p><p>A Wizpiko learner ('+safe(profile.display_name)+') has asked you to review their account request.</p><p>If you are their parent/guardian and wish to review, <a href="'+safe(link)+'">open the guardian approval page</a>. This link expires after 24 hours.</p><p>If this was not expected, ignore this email.</p>'})});
  if(!send.ok)return json({error:'Email delivery failed. Please try later.'},502);
  return json({ok:true,message:'Guardian email sent.'});
});
