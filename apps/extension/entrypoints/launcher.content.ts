import '../shell/style.css';
import { defineContentScript } from 'wxt/utils/define-content-script';
import { createShell } from '../shell/mount';

export default defineContentScript({
  matches: ['http://*/*', 'https://*/*'],
  allFrames: false,
  cssInjectionMode: 'ui',
  async main(ctx) {
    const shell = await createShell(ctx);
    shell.mount();
  },
});
