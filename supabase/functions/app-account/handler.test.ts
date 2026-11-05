import { describe,it,expect,vi } from 'vitest';
import { accountHandler } from './handler';
const id='00000000-0000-4000-8000-000000000001';
function setup(){const calls:string[]=[];const backend={actor:vi.fn(async()=>({id,email:'learner@example.test'})),reauthenticate:vi.fn(async()=>({id,token:'reauthenticated'})),revoke:vi.fn(async()=>{calls.push('revoke');}),remove:vi.fn(async()=>{calls.push('delete');})};return {backend,calls,handle:accountHandler(backend)};}
function request(body:unknown,headers:Record<string,string>={}){return new Request('https://example.test',{method:'POST',headers:{Authorization:'Bearer current','Content-Type':'application/json',...headers},body:JSON.stringify(body)});}
const valid={action:'delete-account',confirmation:'DELETE',password:'example-password'};
describe('In-app account deletion',()=>{
  it('requires a real session and allowed origin',async()=>{const {handle,backend}=setup();expect((await handle(new Request('https://example.test',{method:'POST'}))).status).toBe(401);expect((await handle(request(valid,{Origin:'https://evil.test'}))).status).toBe(403);expect(backend.remove).not.toHaveBeenCalled();});
  it('requires an explicit confirmation and password',async()=>{const {handle,backend}=setup();for(const body of [{}, {...valid,confirmation:'delete'},{...valid,password:''}])expect((await handle(request(body))).status).toBe(400);expect(backend.remove).not.toHaveBeenCalled();});
  it('uses verified actor identity and revokes sessions before deletion',async()=>{const {handle,backend,calls}=setup();const response=await handle(request({...valid,userId:'victim-id',email:'victim@example.test'}));expect(response.status).toBe(200);expect(backend.reauthenticate).toHaveBeenCalledWith('learner@example.test','example-password');expect(backend.remove).toHaveBeenCalledWith(id);expect(calls).toEqual(['revoke','delete']);});
  it('refuses a password response for another account',async()=>{const {handle,backend}=setup();backend.reauthenticate.mockResolvedValue({id:'different',token:'wrong'});expect((await handle(request(valid))).status).toBe(403);expect(backend.remove).not.toHaveBeenCalled();});
  it('does not claim success or expose details after a server error',async()=>{const {handle,backend}=setup();backend.remove.mockRejectedValue(new Error('private service detail'));const response=await handle(request(valid));expect(response.status).toBe(503);expect(await response.text()).not.toContain('private service detail');});
  it('bounds request size and avoids destructive calls for large payloads',async()=>{const {handle,backend}=setup();expect((await handle(request({...valid,extra:'x'.repeat(5000)}))).status).toBe(413);expect(backend.remove).not.toHaveBeenCalled();});
});
