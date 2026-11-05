import { describe,expect,it,vi } from 'vitest';
import { createCertificateVerificationHandler,createLearningHandler } from './handler';
import { createLearningBackend } from './supabase';
import { loadCurriculumLesson } from '../_shared/curriculum/programs';

const actor='11111111-1111-4111-8111-111111111111',other='22222222-2222-4222-8222-222222222222';
function setup(){const backend={user:vi.fn().mockResolvedValue({id:actor}),rpc:vi.fn().mockResolvedValue({})};return {backend,handler:createLearningHandler({appOrigin:'https://wizpiko.com'},backend)};}
const request=(body:unknown,headers:Record<string,string>={})=>new Request('https://example.supabase.co/functions/v1/learning-certificates',{method:'POST',headers:{Origin:'https://wizpiko.com',Authorization:'Bearer valid-user','Content-Type':'application/json',...headers},body:JSON.stringify(body)});
describe('Server-graded learning and certificate actions',()=>{
  it.each(['english','maths'] as const)('checks every answer itself for %s and ignores client scores and account IDs',async subject=>{
    const {handler,backend}=setup(),skill=subject==='english'?'sounds':'numbers';
    const lesson=await loadCurriculumLesson(subject,'starter',skill);
    const answers=Object.fromEntries(lesson.tasks.map((task,index)=>[task.id,index<16?(task.type==='fill'?task.answers[0]:task.answer):task.type==='choice'?task.choices.find(c=>c!==task.answer)!:'definitely wrong']));
    const response=await handler(request({action:'submit',subject,level:'starter',skill,version:2,answers,userId:other,score:100,correct:20}));
    expect(response.status).toBe(200);expect(backend.rpc).toHaveBeenCalledWith('wizpiko_learning_save_result',expect.objectContaining({p_user:actor,p_correct:16,p_version:2}));
    expect((await response.json()).attempt).toEqual({correct:16,total:20,score:80});
  });
  it('requires twenty real answers and the current content version',async()=>{
    const {handler,backend}=setup();
    for(const payload of [{action:'submit',subject:'english',level:'starter',skill:'sounds',version:1,answers:{}},{action:'submit',subject:'english',level:'starter',skill:'sounds',version:2,answers:{}},{action:'submit',subject:'science',level:'starter',skill:'sounds',version:2,answers:{}}])expect((await handler(request(payload))).status).toBe(400);
    expect(backend.rpc).not.toHaveBeenCalled();
  });
  it('requires the full name, rather than issuing from a nickname or score',async()=>{
    const {handler,backend}=setup();
    for(const fullName of ['',undefined,'<name>'])expect((await handler(request({action:'claim',subject:'english',level:'starter',version:2,fullName}))).status).toBe(400);
    expect(backend.rpc).not.toHaveBeenCalled();
    expect((await handler(request({action:'claim',subject:'english',level:'starter',version:2,fullName:'  Alex   Morgan  ',userId:other}))).status).toBe(200);
    expect(backend.rpc).toHaveBeenCalledWith('wizpiko_learning_claim_certificate',{p_user:actor,p_subject:'english',p_level:'starter',p_version:2,p_full_name:'Alex Morgan'});
  });
  it('does not issue when one skill misses the pass mark',async()=>{
    const {handler,backend}=setup();backend.rpc.mockRejectedValue(new Error('level_not_qualified'));
    const response=await handler(request({action:'claim',subject:'maths',level:'advanced',version:2,fullName:'Alex Morgan'}));expect(response.status).toBe(409);expect((await response.json()).code).toBe('level_not_qualified');
  });
  it('validates identity and origin before any privileged write',async()=>{
    const {handler,backend}=setup();
    expect((await handler(request({action:'list'},{Origin:'https://elsewhere.test'}))).status).toBe(403);
    expect((await handler(request({action:'list'},{Authorization:''}))).status).toBe(401);
    backend.user.mockResolvedValue(null);expect((await handler(request({action:'list'}))).status).toBe(401);expect(backend.rpc).not.toHaveBeenCalled();
  });
  it('uses the authenticated owner for share changes and requires an explicit boolean',async()=>{
    const {handler,backend}=setup();expect((await handler(request({action:'share',certificate:other,enabled:'true'}))).status).toBe(400);
    expect((await handler(request({action:'share',certificate:other,enabled:false,userId:other}))).status).toBe(200);
    expect(backend.rpc).toHaveBeenCalledWith('wizpiko_learning_share_certificate',{p_user:actor,p_certificate:other,p_enabled:false});
  });
  it('bounds streamed bodies rather than trusting content-length',async()=>{
    const {handler,backend}=setup();expect((await handler(request({action:'list',padding:'x'.repeat(21_000)}))).status).toBe(413);expect(backend.rpc).not.toHaveBeenCalled();
  });
  it('rejects anonymous Auth users at the authoritative identity lookup',async()=>{
    const fetcher=vi.fn().mockResolvedValue(Response.json({id:actor,is_anonymous:true}));
    const backend=createLearningBackend({supabaseUrl:'https://example.supabase.co',publicKey:'public',serviceRoleKey:'server-only'},fetcher);
    expect(await backend.user('jwt')).toBeNull();
  });
});
describe('Anonymous certificate verification',()=>{
  it('returns only a token-selected public record and never accepts private actions',async()=>{
    const rpc=vi.fn().mockResolvedValue({id:actor,full_name:'Alex Morgan',public_token:other});const handler=createCertificateVerificationHandler({rpc});
    const response=await handler(new Request('https://example.test/?token='+other));expect(response.status).toBe(200);expect(response.headers.get('Cache-Control')).toBe('no-store');expect(rpc).toHaveBeenCalledWith('wizpiko_learning_public_certificate',{p_token:other});
    expect((await handler(request({action:'list'}))).status).toBe(405);
  });
  it('keeps private, revoked and invalid tokens unavailable',async()=>{
    const rpc=vi.fn().mockResolvedValue(null),handler=createCertificateVerificationHandler({rpc});
    expect((await handler(new Request('https://example.test/?token=not-a-token'))).status).toBe(404);expect(rpc).not.toHaveBeenCalled();
    expect((await handler(new Request('https://example.test/?token='+other))).status).toBe(404);
  });
});
