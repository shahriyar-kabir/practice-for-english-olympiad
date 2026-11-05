export type Certificate = {
  id: string;
  subject: string;
  level: string;
  version: number;
  full_name: string;
  issued_at: string;
  skill_count: number;
  question_count: number;
  pass_mark: number;
  public_token: string | null;
};
export function cleanCertificateName(value: string): string {
  const name = value.normalize('NFC').trim().replace(/\s+/g, ' ');
  if (!name || name.length > 100 || /[\u0000-\u001f\u007f-\u009f<>]/.test(value) || !/\p{L}/u.test(name)) {
    throw new Error('Enter your full name using up to 100 characters.');
  }
  return name;
}
