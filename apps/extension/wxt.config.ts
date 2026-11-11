import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'wxt';

export default defineConfig({
  modules: ['@wxt-dev/module-react'],
  imports: false,
  // Load the development build unpacked; do not download a separate browser runner.
  webExt: { disabled: true },
  manifestVersion: 3,
  manifest: {
    name: 'Tracer',
    description: 'An on-page Floating Launcher for Tracer. Console Panel coming next.',
  },
  vite: () => ({ plugins: [tailwindcss()] }),
});
