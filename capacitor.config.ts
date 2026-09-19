import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.goreactive.app',
  appName: 'GoReactive',
  webDir: 'dist',
  server: {
    // Important pour Android WebView : garder localhost aide les API Web sensibles
    // comme navigator.mediaDevices/getUserMedia à se comporter comme en contexte sécurisé.
    androidScheme: 'http',
    hostname: 'localhost'
  },
  android: {
    allowMixedContent: true,
    captureInput: true,
    webContentsDebuggingEnabled: true
  }
};

export default config;
