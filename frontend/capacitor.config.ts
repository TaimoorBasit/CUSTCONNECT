import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.custconnect.app',
  appName: 'CustConnect',
  webDir: 'out',
  server: {
    androidScheme: 'https',
    cleartext: false
  }
};

export default config;
