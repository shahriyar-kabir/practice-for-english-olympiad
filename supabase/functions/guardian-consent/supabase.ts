import type { Backend, Config, RpcResult } from './handler.ts';

// Service credentials stay in this adapter. The browser cannot choose a learner
// ID, recipient, redirect URL or consent status.
export function createSupabaseBackend(config: Config, fetcher: typeof fetch = fetch): Backend {
  const base = config.supabaseUrl.replace(/\/$/, '');
  return {
    async authenticate(jwt) {
      const response = await fetcher(base + '/auth/v1/user', {
        headers: { apikey: config.serviceRoleKey, Authorization: 'Bearer ' + jwt },
        signal: AbortSignal.timeout(10_000),
      });
      if (response.status === 401 || response.status === 403) return null;
      if (!response.ok) throw new Error('auth_unavailable');
      const user = await response.json();
      if (!user.id || !user.email_confirmed_at || user.is_anonymous) return null;
      // An auto-confirmed timestamp does not prove control of the learner inbox.
      // Fail closed if the project's email verification policy is disabled or
      // cannot be determined. New guardian sends require actual email verification.
      const settingsResponse = await fetcher(base + '/auth/v1/settings', {
        headers: { apikey: config.serviceRoleKey },
        signal: AbortSignal.timeout(10_000),
      });
      if (!settingsResponse.ok) throw new Error('auth_unavailable');
      const settings = await settingsResponse.json();
      if (settings.mailer_autoconfirm !== false) throw new Error('email_confirmation_disabled');
      return { id: user.id };
    },
    async rpc(name, args) {
      const response = await fetcher(base + '/rest/v1/rpc/' + name, {
        method: 'POST',
        headers: { apikey: config.serviceRoleKey, Authorization: 'Bearer ' + config.serviceRoleKey, 'Content-Type': 'application/json' },
        body: JSON.stringify(args), signal: AbortSignal.timeout(10_000),
      });
      if (!response.ok) throw new Error('database_unavailable');
      return await response.json() as RpcResult;
    },
    fetch: fetcher,
  };
}
