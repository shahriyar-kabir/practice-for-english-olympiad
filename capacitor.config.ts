import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.wizpiko.app',
  appName: 'Wizpiko',
  webDir: 'dist-ios',
  backgroundColor: '#f5f8ff',
  loggingBehavior: 'debug',
  ios: { contentInset: 'never', preferredContentMode: 'mobile', backgroundColor: '#f5f8ff', webContentsDebuggingEnabled: false },
  server: { iosScheme: 'capacitor', hostname: 'localhost' },
  plugins: {
    // Requests use the native TLS stack, so existing HTTPS APIs work without
    // widening the website's CORS origins or loading remote application code.
    CapacitorHttp: { enabled: true },
    Keyboard: { resize: 'native' },
    StatusBar: { style: 'DARK' },
  },
};
export default config;
