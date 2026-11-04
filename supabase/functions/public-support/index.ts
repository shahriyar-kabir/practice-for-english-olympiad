import { createPublicSupportHandler } from './handler.ts';
import { createPublicSupportBackend } from './supabase.ts';
import { createNodemailerTransport } from './nodemailer.ts';

// This endpoint is intentionally public and independently rate-limited. Configure
// verify_jwt=false for this function only; browser callers never receive service keys.
const config = {
  supabaseUrl:Deno.env.get('SUPABASE_URL') || '',
  serviceRoleKey:Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '',
  appOrigin:Deno.env.get('APP_ORIGIN') || '',
  allowedOrigins:Deno.env.get('PUBLIC_SUPPORT_ALLOWED_ORIGINS') || '',
  rateLimitSalt:Deno.env.get('PUBLIC_SUPPORT_RATE_LIMIT_SALT') || '',
  mailTransport:Deno.env.get('PUBLIC_SUPPORT_MAIL_TRANSPORT') || '',
  smtpHost:Deno.env.get('PUBLIC_SUPPORT_SMTP_HOST') || '',
  smtpPort:Deno.env.get('PUBLIC_SUPPORT_SMTP_PORT') || '',
  smtpUsername:Deno.env.get('PUBLIC_SUPPORT_SMTP_USERNAME') || '',
  smtpPassword:Deno.env.get('PUBLIC_SUPPORT_SMTP_PASSWORD') || '',
  resendApiKey:Deno.env.get('RESEND_API_KEY') || '',
  fromEmail:Deno.env.get('PUBLIC_SUPPORT_FROM_EMAIL') || '',
};
Deno.serve(createPublicSupportHandler(config,createPublicSupportBackend(config,fetch,createNodemailerTransport)));
