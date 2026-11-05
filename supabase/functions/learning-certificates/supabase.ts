import type { LearningBackend } from './handler.ts';
export function createLearningBackend(config: { supabaseUrl: string; serviceRoleKey: string; publicKey: string }, fetcher: typeof fetch = fetch): LearningBackend {
  const base = config.supabaseUrl.replace(/\/$/, '');
  const allowed = new Set(['wizpiko_learning_list','wizpiko_learning_save_result','wizpiko_learning_claim_certificate','wizpiko_learning_share_certificate','wizpiko_learning_public_certificate']);
  return {
    async user(jwt) {
      const response = await fetcher(base + '/auth/v1/user', { headers: { apikey: config.publicKey, Authorization: 'Bearer ' + jwt }, signal: AbortSignal.timeout(10_000) });
      if (!response.ok) return null;
      const user = await response.json();
      return typeof user?.id === 'string' && user.is_anonymous !== true ? { id: user.id } : null;
    },
    async rpc(name, args) {
      if (!allowed.has(name)) throw new Error('unsupported_rpc');
      const response = await fetcher(base + '/rest/v1/rpc/' + name, { method: 'POST', headers: { apikey: config.serviceRoleKey, Authorization: 'Bearer ' + config.serviceRoleKey, 'Content-Type': 'application/json' }, body: JSON.stringify(args), signal: AbortSignal.timeout(10_000) });
      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        throw new Error(['level_not_qualified','certificate_not_found'].includes(body?.message) ? body.message : 'service_unavailable');
      }
      return await response.json();
    },
  };
}
