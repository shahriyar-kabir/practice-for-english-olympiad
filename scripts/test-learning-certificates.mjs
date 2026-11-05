import { PGlite } from '@electric-sql/pglite';
import { readFile } from 'node:fs/promises';
import assert from 'node:assert/strict';

const db = new PGlite(), a='11111111-1111-4111-8111-111111111111', b='22222222-2222-4222-8222-222222222222';
const skills=['sounds','vocabulary','grammar','reading','listening','writing'];
async function role(name, query, args=[]) { await db.exec(`set role ${name}`); try { return await db.query(query,args); } finally { await db.exec('reset role'); } }
async function rpc(name,args) { const params=args.map((_,index)=>'$'+(index+1)).join(',');const result=await role('service_role',`select public.${name}(${params}) as value`,args);return result.rows[0].value; }
const save=(user,skill,correct,subject='english',level='starter',version=2)=>rpc('wizpiko_learning_save_result',[user,subject,level,version,skill,correct]);
const claim=(user,name='Alex Morgan',subject='english',level='starter')=>rpc('wizpiko_learning_claim_certificate',[user,subject,level,2,name]);
try {
  await db.exec(`create role anon; create role authenticated; create role service_role bypassrls; create schema auth; grant usage on schema public,auth to service_role,anon,authenticated; create table auth.users(id uuid primary key);`);
  await db.query('insert into auth.users values ($1),($2)',[a,b]);
  const migration=await readFile(new URL('../supabase/migrations/20261104225407_learning_certificates.sql',import.meta.url),'utf8');
  await db.exec(migration);await db.exec(migration);
  const rls=await db.query("select count(*)::int n from pg_class c join pg_namespace n on n.oid=c.relnamespace where n.nspname='wizpiko_learning' and c.relkind='r' and c.relrowsecurity");
  assert.equal(rls.rows[0].n,3);
  for(const userRole of ['anon','authenticated']) {
    await assert.rejects(()=>role(userRole,'select * from wizpiko_learning.certificates'));
    await assert.rejects(()=>role(userRole,'insert into wizpiko_learning.skill_results(user_id,subject,level,version,skill,best_correct) values ($1,$2,$3,2,$4,20)',[a,'english','starter','sounds']));
    await assert.rejects(()=>role(userRole,'select public.wizpiko_learning_claim_certificate($1,$2,$3,2,$4)',[a,'english','starter','Forged Name']));
    await assert.rejects(()=>role(userRole,'select public.wizpiko_learning_public_certificate($1)',[a]));
  }
  console.log('PASS RLS, unexposed schema and service-only grants');
  await assert.rejects(()=>claim(a),/level_not_qualified/);
  await assert.rejects(()=>save(a,'sounds',21),/invalid_skill_submission/);
  await assert.rejects(()=>save(a,'sounds',20,'english','starter',1),/invalid_skill_submission/);
  for(const skill of skills.slice(0,5))await save(a,skill,20);
  await assert.rejects(()=>claim(a),/level_not_qualified/);
  await save(a,'writing',15);
  await assert.rejects(()=>claim(a),/level_not_qualified/);
  await save(a,'writing',16);
  await assert.rejects(()=>claim(a,''),/full_name_required/);
  await assert.rejects(()=>claim(a,null),/full_name_required/);
  await assert.rejects(()=>claim(a,'<script>name</script>'),/full_name_required/);
  const certificate=await claim(a,'  Alex   Morgan  ');
  assert.equal(certificate.full_name,'Alex Morgan');assert.equal(certificate.public_token,null);
  assert.equal(certificate.skill_count,6);assert.equal(certificate.question_count,120);assert.equal(certificate.pass_mark,80);
  assert.equal((await claim(a,'Different Name')).id,certificate.id);
  assert.equal((await claim(a,'Different Name')).full_name,'Alex Morgan');
  await assert.rejects(()=>claim(b),/level_not_qualified/);
  await assert.rejects(()=>claim(a,'Alex Morgan','maths'),/level_not_qualified/);
  await assert.rejects(()=>claim(a,'Alex Morgan','english','beginner'),/level_not_qualified/);
  console.log('PASS 20-question version, every-skill 80% requirement, full name and idempotent issuance');
  const list=await rpc('wizpiko_learning_list',[a]);
  assert.equal(list.certificates.length,1);assert.equal(list.qualifications.find(q=>q.subject==='english'&&q.level==='starter').eligible,true);
  const other=await rpc('wizpiko_learning_list',[b]);assert.equal(other.certificates.length,0);assert.equal(other.results.length,0);
  await assert.rejects(()=>rpc('wizpiko_learning_share_certificate',[b,certificate.id,true]),/certificate_not_found/);
  assert.equal(await rpc('wizpiko_learning_public_certificate',[certificate.id]),null);
  const shared=await rpc('wizpiko_learning_share_certificate',[a,certificate.id,true]);
  assert.ok(shared.public_token);assert.notEqual(shared.public_token,shared.id);
  const publicRecord=await rpc('wizpiko_learning_public_certificate',[shared.public_token]);
  assert.equal(publicRecord.full_name,'Alex Morgan');
  assert.deepEqual(Object.keys(publicRecord).sort(),['id','subject','level','version','full_name','issued_at','skill_count','question_count','pass_mark','public_token'].sort());
  assert.equal((await rpc('wizpiko_learning_share_certificate',[a,certificate.id,true])).public_token,shared.public_token);
  const privateRecord=await rpc('wizpiko_learning_share_certificate',[a,certificate.id,false]);assert.equal(privateRecord.public_token,null);
  assert.equal(await rpc('wizpiko_learning_public_certificate',[shared.public_token]),null);
  const reShared=await rpc('wizpiko_learning_share_certificate',[a,certificate.id,true]);assert.notEqual(reShared.public_token,shared.public_token);
  console.log('PASS account ownership, private by default, public projection and revocable tokens');
  assert.equal((await save(a,'writing',0)).correct,16);assert.equal((await save(a,'writing',20)).correct,20);
  const claims=await Promise.all(Array.from({length:8},()=>claim(a)));assert.equal(new Set(claims.map(item=>item.id)).size,1);
  await db.query('delete from auth.users where id=$1',[a]);assert.equal(await rpc('wizpiko_learning_public_certificate',[reShared.public_token]),null);
  console.log('PASS best-score retention, unique issuance and deleted-account cleanup');
} finally { await db.close(); }
console.log('Learning certificate SQL checks passed in a disposable local database. No live project was changed.');
