import { createCertificateVerificationHandler } from '../learning-certificates/handler.ts';
import { createLearningBackend } from '../learning-certificates/supabase.ts';
const backend = createLearningBackend({ supabaseUrl: Deno.env.get('SUPABASE_URL') || '', serviceRoleKey: Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '', publicKey: Deno.env.get('SUPABASE_ANON_KEY') || '' });
// Anonymous read by an unguessable, explicitly enabled token; no private actions.
Deno.serve(createCertificateVerificationHandler(backend));
