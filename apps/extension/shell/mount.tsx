import { createRoot } from 'react-dom/client';
import type { ContentScriptContext } from 'wxt/utils/content-script-context';
import { createShadowRootUi } from 'wxt/utils/content-script-ui/shadow-root';
import { FloatingLauncher } from './launcher';

export async function createShell(ctx: ContentScriptContext) {
  const ui = await createShadowRootUi(ctx, {
    name: 'tracer-shell',
    position: 'inline',
    anchor: 'body',
    mode: 'open',
    onMount(container) {
      const app = document.createElement('div');
      app.className = 'tracer-shell';
      container.append(app);
      const root = createRoot(app);
      root.render(<FloatingLauncher />);
      return root;
    },
    onRemove(root) {
      root?.unmount();
    },
  });

  return {
    shadow: ui.shadow,
    shadowHost: ui.shadowHost,
    uiContainer: ui.uiContainer,
    mount() {
      if (ctx.isValid && !ui.mounted) ui.mount();
    },
    remove: ui.remove,
  };
}
