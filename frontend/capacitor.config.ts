import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.custconnect.app',
  appName: 'CustConnect',
  webDir: 'out',
  server: {
    // Point to live Vercel deployment so token/localStorage persists correctly
    url: 'https://cust-connect.vercel.app',
    cleartext: false,
    androidScheme: 'https',
  },
};

export default config;
