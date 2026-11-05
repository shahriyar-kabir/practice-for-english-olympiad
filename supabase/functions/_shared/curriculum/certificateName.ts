export function cleanCertificateName(value: unknown): string {
  if (typeof value !== 'string') throw new Error('full_name_required');
  const name = value.normalize('NFC').trim().replace(/\s+/g, ' ');
  if (!name || name.length > 100 || /[\u0000-\u001f\u007f-\u009f<>]/.test(value) || !/\p{L}/u.test(name)) throw new Error('full_name_required');
  return name;
}
