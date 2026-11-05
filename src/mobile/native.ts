import { Capacitor, registerPlugin } from '@capacitor/core';
import { App as NativeApp } from '@capacitor/app';
import { Browser } from '@capacitor/browser';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { Keyboard } from '@capacitor/keyboard';
import { Network } from '@capacitor/network';
import { Share } from '@capacitor/share';
import { StatusBar, Style } from '@capacitor/status-bar';
import { configurePlatform } from '../platform/integration';
import { appLinkPath, certificateFilename, externalLink } from './policies';
import { secureSession } from './secureSession';

type DevicePlugin = {
  getSession: () => Promise<{ value?: string }>;
  setSession: (options: { value: string }) => Promise<void>;
  clearSession: () => Promise<void>;
  saveDocument: (options: { data: string; filename: string }) => Promise<void>;
};
const device = registerPlugin<DevicePlugin>('WizpikoDevice');
export function navigateApp(path: string) {
  window.history.pushState(null, '', path);
  window.dispatchEvent(new PopStateEvent('popstate'));
}
function fileBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => { const reader = new FileReader(); reader.onload = () => resolve(String(reader.result).split(',')[1]); reader.onerror = () => reject(new Error('The file could not be prepared.')); reader.readAsDataURL(blob); });
}
function setConnected(connected: boolean) { window.dispatchEvent(new CustomEvent('wizpiko-connectivity', { detail: connected })); document.documentElement.classList.toggle('wi-offline', !connected); }

export async function prepareNativeApp() {
  if (!Capacitor.isNativePlatform()) return;
  const session = await secureSession(device);
  configurePlatform({
    siteOrigin: 'https://wizpiko.com', authRedirect: 'https://wizpiko.com/', session,
    credentialsAccepted(path) { window.history.replaceState(null, '', path); window.dispatchEvent(new Event('wizpiko-session-changed')); },
    async saveFile(blob, filename) { await device.saveDocument({ data: await fileBase64(blob), filename: certificateFilename(filename) }); },
    async shareURL(url, title, text) { await Share.share({ title, text, url, dialogTitle: 'Share your achievement' }); },
  });
  const handleLink = async (url: string) => { const path = appLinkPath(url); if (!path) return; await Browser.close().catch(() => {}); navigateApp(path); };
  await NativeApp.addListener('appUrlOpen', event => { void handleLink(event.url); });
  const launch = await NativeApp.getLaunchUrl();
  if (launch?.url) { const path = appLinkPath(launch.url); if (path) window.history.replaceState(null, '', path); }
  await Network.addListener('networkStatusChange', status => setConnected(status.connected));
  setConnected((await Network.getStatus()).connected);
  await NativeApp.addListener('appStateChange', state => { if (state.isActive) void Network.getStatus().then(status => setConnected(status.connected)); });
  await Keyboard.addListener('keyboardWillShow', () => document.documentElement.classList.add('wi-keyboard-open'));
  await Keyboard.addListener('keyboardWillHide', () => document.documentElement.classList.remove('wi-keyboard-open'));
  await StatusBar.setStyle({ style: Style.Dark }).catch(() => {});
  document.addEventListener('click', event => {
    if (!(event.target instanceof Element)) return;
    const link = event.target.closest<HTMLAnchorElement>('a[href]');
    if (link && link.origin !== window.location.origin) {
      event.preventDefault();
      const url = externalLink(link.href);
      if (url) void Browser.open({ url, presentationStyle: 'popover', toolbarColor: '#f5f8ff' }).catch(() => {});
    }
    const button = event.target.closest<HTMLButtonElement>('button');
    if (button && !button.disabled) void Haptics.impact({ style: ImpactStyle.Light }).catch(() => {});
  });
}
