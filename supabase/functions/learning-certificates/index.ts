import { createLearningHandler } from './handler.ts';
import { createLearningBackend } from './supabase.ts';
const config = {
  supabaseUrl: Deno.env.get('SUPABASE_URL') || '', serviceRoleKey: Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '',
  publicKey: Deno.env.get('SUPABASE_ANON_KEY') || '', appOrigin: Deno.env.get('APP_ORIGIN') || 'https://wizpiko.com',
  allowedOrigins: Deno.env.get('LEARNING_ALLOWED_ORIGINS') || '',
};
// Platform JWT verification stays on. The handler also resolves the live Auth user.
Deno.serve(createLearningHandler(config, createLearningBackend(config)));
