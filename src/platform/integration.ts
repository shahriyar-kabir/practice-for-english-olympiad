/** A small optional bridge keeps native dependencies out of the website entry. */
export type PlatformIntegration = {
  siteOrigin: string;
  authRedirect: string;
  session: { read: () => string | null; write: (value: string | null) => void; flush: () => Promise<void> };
  credentialsAccepted: (path: string) => void;
  saveFile: (blob: Blob, filename: string) => Promise<void>;
  shareURL: (url: string, title: string, text: string) => Promise<void>;
};
let integration: PlatformIntegration | undefined;
export function configurePlatform(value: PlatformIntegration | undefined) { integration = value; }
export function platformIntegration() { return integration; }
export function authRedirectURL() { return integration?.authRedirect || window.location.origin + window.location.pathname; }
