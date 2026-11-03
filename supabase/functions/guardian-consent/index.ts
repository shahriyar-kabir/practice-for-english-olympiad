import { createGuardianHandler } from './handler.ts';
import { createSupabaseBackend } from './supabase.ts';

// Public preflight and guardian token pages require verify_jwt=false. The request
// action authenticates its learner JWT against Supabase Auth on every call.
const config = {
  supabaseUrl: Deno.env.get('SUPABASE_URL') || '',
  serviceRoleKey: Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '',
  resendApiKey: Deno.env.get('RESEND_API_KEY') || '',
  fromEmail: Deno.env.get('GUARDIAN_FROM_EMAIL') || '',
  appOrigin: Deno.env.get('APP_ORIGIN') || '',
  allowedOrigins: Deno.env.get('GUARDIAN_ALLOWED_ORIGINS') || '',
};
Deno.serve(createGuardianHandler(config, createSupabaseBackend(config)));
