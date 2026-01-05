import { defineManifest } from '@crxjs/vite-plugin'
import pkg from './package.json'

export default defineManifest({
  manifest_version: 3,
  name: pkg.name,
  version: pkg.version,
  icons: {
    48: 'public/logo.png',
  },
  action: {
    default_icon: {
      48: 'public/logo.png',
    },
    default_popup: 'src/popup/index.html',
  },
  permissions: [
    'sidePanel',
    'contentSettings',
    'activeTab',
    'storage',
    'tabs',
    'scripting',
  ],
  host_permissions: [
    'https://ei6f81nri4.execute-api.us-east-1.amazonaws.com/*',
    'http://my-app-tracker.s3-website-us-east-1.amazonaws.com/*',
    'http://localhost:*/*',
  ],
  content_scripts: [{
    js: ['src/content/main.ts'],
    matches: ['https://*/*', 'http://localhost:*/*', 'http://127.0.0.1:*/*', 'http://my-app-tracker.s3-website-us-east-1.amazonaws.com/*'],
  }],
  side_panel: {
    default_path: 'src/sidepanel/index.html',
  },
  background: {
    service_worker: 'src/background/background.ts',
  },
})
