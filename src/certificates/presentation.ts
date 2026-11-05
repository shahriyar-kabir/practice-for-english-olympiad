import { appHref } from '../routes';
import { learningPrograms, levelLabels } from '../../supabase/functions/_shared/curriculum/programs.ts';
import type { Certificate } from './types';
import type { CertificateDesignData } from './design';
// GitHub Pages serves its root with HTTP 200, including for social link crawlers.
export function publicCertificateURL(token: string) { return window.location.origin + appHref('/') + '?certificate=' + encodeURIComponent(token); }
export function certificatePresentation(certificate: Certificate): CertificateDesignData {
  return {
    fullName: certificate.full_name,
    subject: learningPrograms[certificate.subject as keyof typeof learningPrograms]?.name || certificate.subject,
    level: levelLabels[certificate.level as keyof typeof levelLabels] || certificate.level,
    issuedDate: new Intl.DateTimeFormat('en-GB',{ day:'numeric',month:'long',year:'numeric',timeZone:'Asia/Dhaka' }).format(new Date(certificate.issued_at)),
    credential: 'Certificate ID: ' + certificate.id,
    verification: certificate.public_token ? publicCertificateURL(certificate.public_token) : 'Saved privately in your Wizpiko profile',
  };
}
