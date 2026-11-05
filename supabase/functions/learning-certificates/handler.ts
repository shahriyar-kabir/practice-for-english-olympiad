import { CURRICULUM_VERSION, isCurriculumLevel, isCurriculumSubject, learningPrograms, loadCurriculumLesson, QUESTIONS_PER_SKILL, taskCorrect } from '../_shared/curriculum/programs.ts';
import { cleanCertificateName } from '../_shared/curriculum/certificateName.ts';

export type LearningBackend = { user: (jwt: string) => Promise<{ id: string } | null>; rpc: (name: string, args: Record<string, unknown>) => Promise<unknown> };
export type LearningConfig = { appOrigin: string; allowedOrigins?: string };
const uuid = (value: unknown): value is string => typeof value === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
const object = (value: unknown): value is Record<string, unknown> => !!value && typeof value === 'object' && !Array.isArray(value);
const publicHeaders = { 'Content-Type': 'application/json', 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' };
async function boundedBody(request:Request):Promise<string> {
  const reader=request.body?.getReader();if(!reader)return '';
  let length=0;const chunks:Uint8Array[]=[];
  try { while(true){const {done,value}=await reader.read();if(done)break;length+=value.byteLength;if(length>20_000){await reader.cancel();throw new Error('payload_too_large');}chunks.push(value);} }
  finally{reader.releaseLock();}
  const bytes=new Uint8Array(length);let offset=0;for(const chunk of chunks){bytes.set(chunk,offset);offset+=chunk.length;}
  return new TextDecoder('utf-8',{fatal:true}).decode(bytes);
}

export function createLearningHandler(config: LearningConfig, backend: LearningBackend) {
  const origins = new Set([config.appOrigin, ...(config.allowedOrigins || '').split(',')].map(value => value.trim()).filter(Boolean));
  return async (request: Request): Promise<Response> => {
    const origin = request.headers.get('Origin');
    const cors: Record<string, string> = origin && origins.has(origin) ? { 'Access-Control-Allow-Origin': origin, Vary: 'Origin' } : {};
    const reply = (status: number, result: unknown) => new Response(JSON.stringify(result), { status, headers: { ...publicHeaders, ...cors } });
    const error = (status: number, code: string, message: string) => reply(status, { code, error: message });
    if (origin && !origins.has(origin)) return error(403, 'origin_not_allowed', 'This website is not permitted to use the learning service.');
    if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: { ...cors, 'Access-Control-Allow-Headers': 'authorization, apikey, content-type', 'Access-Control-Allow-Methods': 'POST, OPTIONS', 'Cache-Control': 'no-store' } });
    if (request.method !== 'POST') return error(405, 'method_not_allowed', 'Use POST for this request.');
    const jwt = request.headers.get('Authorization')?.match(/^Bearer ([^\s]+)$/i)?.[1];
    if (!jwt || jwt.length > 8192) return error(401, 'sign_in_required', 'Please sign in again to save verified results.');
    if (!request.headers.get('Content-Type')?.toLowerCase().startsWith('application/json')) return error(415, 'invalid_content_type', 'Send JSON for this request.');
    try {
      const actor = await backend.user(jwt);
      if (!actor || !uuid(actor.id)) return error(401, 'sign_in_required', 'Please sign in again to save verified results.');
      const raw = await boundedBody(request);
      let body: unknown; try { body = JSON.parse(raw); } catch { return error(400, 'invalid_input', 'The request could not be read.'); }
      if (!object(body)) return error(400, 'invalid_input', 'Choose a supported learning action.');
      if (body.action === 'list') return reply(200, await backend.rpc('wizpiko_learning_list', { p_user: actor.id }));
      if (body.action === 'share') {
        if (!uuid(body.certificate) || typeof body.enabled !== 'boolean') return error(400, 'invalid_input', 'Choose a certificate and a sharing option.');
        return reply(200, { certificate: await backend.rpc('wizpiko_learning_share_certificate', { p_user: actor.id, p_certificate: body.certificate, p_enabled: body.enabled }) });
      }
      if (!isCurriculumSubject(body.subject) || !isCurriculumLevel(body.level) || body.version !== CURRICULUM_VERSION) return error(400, 'invalid_programme', 'Open the current version of a learning level.');
      const { subject, level } = body;
      if (body.action === 'claim') {
        let name: string; try { name = cleanCertificateName(body.fullName); } catch { return error(400, 'full_name_required', 'Enter your full name using up to 100 characters.'); }
        return reply(200, { certificate: await backend.rpc('wizpiko_learning_claim_certificate', { p_user: actor.id, p_subject: subject, p_level: level, p_version: CURRICULUM_VERSION, p_full_name: name }) });
      }
      if (body.action !== 'submit' || typeof body.skill !== 'string' || !learningPrograms[subject].skills.some(skill => skill.id === body.skill)) return error(400, 'invalid_skill', 'Choose a published skill.');
      const lesson = await loadCurriculumLesson(subject, level, body.skill);
      if (!object(body.answers) || Object.keys(body.answers).length !== QUESTIONS_PER_SKILL || lesson.tasks.some(task => !Object.hasOwn(body.answers as object, task.id))) return error(400, 'all_questions_required', 'Answer all 20 questions before completing this skill.');
      const answers = body.answers;
      if (Object.values(answers).some(answer => typeof answer !== 'string' || !answer.trim() || answer.length > 400)) return error(400, 'all_questions_required', 'Answer every question using up to 400 characters.');
      if (lesson.tasks.some(task => task.type === 'choice' && !task.choices.includes(answers[task.id] as string))) return error(400, 'invalid_answer', 'Choose an answer from the displayed options.');
      // Scores and account IDs from the browser are deliberately ignored.
      const correct = lesson.tasks.filter(task => taskCorrect(task, answers[task.id])).length;
      const result = await backend.rpc('wizpiko_learning_save_result', { p_user: actor.id, p_subject: subject, p_level: level, p_version: CURRICULUM_VERSION, p_skill: body.skill, p_correct: correct });
      return reply(200, { result, attempt: { correct, total: QUESTIONS_PER_SKILL, score: correct * 5 } });
    } catch (cause) {
      const code = cause instanceof Error ? cause.message : '';
      if (code === 'payload_too_large') return error(413,code,'The submitted answers are too large.');
      if (code === 'level_not_qualified') return error(409, code, 'Finish every skill with at least 16 correct answers out of 20 to earn this certificate.');
      if (code === 'certificate_not_found') return error(404, code, 'This certificate is not available in your profile.');
      return error(503, 'service_unavailable', 'The learning and certificate service is temporarily unavailable. Please try again.');
    }
  };
}

export function createCertificateVerificationHandler(backend: Pick<LearningBackend, 'rpc'>) {
  return async (request: Request): Promise<Response> => {
    const headers = { ...publicHeaders, 'Access-Control-Allow-Origin': '*' };
    const reply = (status: number, body: unknown) => new Response(JSON.stringify(body), { status, headers });
    if (request.method === 'OPTIONS') return new Response(null,{status:204,headers:{...headers,'Access-Control-Allow-Methods':'GET, OPTIONS','Access-Control-Allow-Headers':'apikey, authorization, content-type'}});
    if (request.method !== 'GET') return reply(405, { error: 'Use GET to view a public certificate.' });
    const token = new URL(request.url).searchParams.get('token');
    if (!uuid(token)) return reply(404, { error: 'This certificate is not publicly available.' });
    try {
      const certificate = await backend.rpc('wizpiko_learning_public_certificate', { p_token: token });
      if (!object(certificate) || !certificate.full_name) return reply(404, { error: 'This certificate is not publicly available.' });
      return reply(200, { certificate });
    } catch { return reply(503, { error: 'We could not verify this certificate. Please try again later.' }); }
  };
}
