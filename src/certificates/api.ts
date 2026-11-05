import { learningRequestSession, readStoredSession } from '../cloudAccount';
import { CURRICULUM_VERSION } from '../../supabase/functions/_shared/curriculum/programs.ts';
import type { CurriculumSubject } from '../../supabase/functions/_shared/curriculum/programs.ts';
import type { AcademyLevel } from '../learningTypes';
import type { Certificate } from './types';

export type VerifiedSkillResult = { subject: CurriculumSubject; level: AcademyLevel; skill: string; version: number; correct: number; total: number; score: number; completedAt: string };
export type Qualification = { subject: CurriculumSubject; level: AcademyLevel; version: number; skillsPassed: number; skillCount: number; eligible: boolean };
export type CertificateCollection = { certificates: Certificate[]; results: VerifiedSkillResult[]; qualifications: Qualification[] };
const base = (import.meta.env.VITE_SUPABASE_URL || '').replace(/\/$/, '');
const publicKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';
async function request(payload: Record<string, unknown>): Promise<Record<string, unknown>> {
  if (!base.startsWith('https://') || !publicKey) throw new Error('The certificate service is not available in this build. Your answers stay saved in this browser.');
  const session = await learningRequestSession();
  let response: Response;
  try {
    response = await fetch(base + '/functions/v1/learning-certificates', { method: 'POST', headers: { apikey: publicKey, Authorization: 'Bearer ' + session.access_token, 'Content-Type': 'application/json' }, body: JSON.stringify(payload), signal: AbortSignal.timeout(20_000) });
  } catch { throw new Error('We could not reach the certificate service. Your answers are saved; please try again.'); }
  if (readStoredSession()?.refresh_token !== session.refresh_token) throw new Error('Your account changed. Please open this page again.');
  const result = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(typeof result.error === 'string' ? result.error : 'We could not complete this request. Please try again.');
  return result;
}
export async function listCertificates(): Promise<CertificateCollection> {
  const body = await request({ action: 'list' });
  if (!Array.isArray(body.certificates) || !Array.isArray(body.results) || !Array.isArray(body.qualifications)) throw new Error('Your certificate collection could not be read.');
  return body as CertificateCollection;
}
export async function submitSkill(subject: CurriculumSubject, level: AcademyLevel, skill: string, answers: Record<string,string>) {
  const body = await request({ action: 'submit', subject, level, skill, version: CURRICULUM_VERSION, answers });
  if (!body.result || !body.attempt) throw new Error('This skill result could not be verified. Please try again.');
  return body as unknown as { result: VerifiedSkillResult; attempt: { correct: number; total: number; score: number } };
}
export async function claimCertificate(subject: CurriculumSubject, level: AcademyLevel, fullName: string) {
  const result = await request({ action: 'claim', subject, level, version: CURRICULUM_VERSION, fullName });
  if (!result.certificate) throw new Error('Your certificate could not be issued.');
  return result.certificate as Certificate;
}
export async function setCertificateSharing(certificate: string, enabled: boolean) {
  const result = await request({ action: 'share', certificate, enabled });
  if (!result.certificate) throw new Error('The sharing setting could not be saved.');
  return result.certificate as Certificate;
}
export async function verifyPublicCertificate(token: string): Promise<Certificate> {
  const response = await fetch(base + '/functions/v1/certificate-verification?token=' + encodeURIComponent(token), { signal: AbortSignal.timeout(15_000) });
  const body = await response.json().catch(() => ({}));
  if (!response.ok || !body.certificate) throw new Error(typeof body.error === 'string' ? body.error : 'This certificate is not publicly available.');
  return body.certificate as Certificate;
}
