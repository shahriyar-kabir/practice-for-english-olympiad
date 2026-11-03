// Real PostgreSQL SQL/grant checks in a disposable PGlite database. PGlite queues
// submitted transactions; the burst check verifies quota accounting under queued
// calls, not independent concurrent PostgreSQL connections.
import { PGlite } from '@electric-sql/pglite';
import { readFile } from 'node:fs/promises';

const database=new PGlite();
const read=file=>readFile(new URL('../'+file,import.meta.url),'utf8');
try {
  await database.exec(`
    create role anon;
    create role authenticated;
    create role service_role bypassrls;
    create schema auth;
    grant usage on schema auth,public to anon,authenticated,service_role;
    create table auth.users(id uuid primary key,email text);
  `);
  const migration=await read('supabase/migrations/20261104000000_public_support.sql');
  await database.exec(migration);
  await database.exec(migration);
  await database.exec(await read('supabase/tests/public_support.sql'));
  console.log('PASS public support SQL, service-only grants, privacy and migration rerun');
  const burst=await Promise.all(Array.from({length:20},()=>database.query(`
    select public.wizpiko_public_support_take_buckets(
      array[repeat('e',64),repeat('f',64)],array[3,3],array[86400,86400]
    ) as result;
  `)));
  const accepted=burst.filter(({rows})=>rows[0].result.allowed===true).length;
  if (accepted!==3) throw new Error('Burst quota accepted '+accepted+' requests instead of 3');
  const {rows}=await database.query('select count(*)::integer as buckets,min(attempts)::integer as minimum,max(attempts)::integer as maximum from public.public_support_rate_buckets');
  if (rows[0].buckets!==2||rows[0].minimum!==3||rows[0].maximum!==3) throw new Error('Quota dimensions were partially charged');
  console.log('PASS queued burst: 3 accepted of 20; both quota dimensions charged exactly 3');
} finally {
  await database.close();
}
console.log('Public support SQL tests passed. Disposable database discarded.');
