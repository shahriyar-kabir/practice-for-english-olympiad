type Store = { getSession: () => Promise<{ value?: string }>; setSession: (options: { value: string }) => Promise<void>; clearSession: () => Promise<void> };
/** Serialize Keychain mutations so an old refresh cannot overwrite sign-out. */
export async function secureSession(store: Store) {
  let value: string | null = (await store.getSession()).value || null;
  let queue: Promise<void> = Promise.resolve();
  let failure: unknown;
  return {
    read: () => value,
    write(next: string | null) {
      value = next;
      let persisted = next;
      try { if (next && JSON.parse(next).remember === false) persisted = null; } catch { /* Native validation rejects malformed values. */ }
      queue = queue.catch(() => {}).then(async () => {
        try { if (persisted) await store.setSession({ value: persisted }); else await store.clearSession(); failure = undefined; }
        catch (error) { failure = error; }
      });
    },
    async flush() { await queue; if (failure) throw new Error('Your secure sign-in could not be saved. Please try again.'); },
  };
}
