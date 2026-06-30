import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.morningchanges.app',
  appName: 'Morning Changes',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  }
};

export default config;
