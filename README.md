# Tracer

A Chrome Manifest V3 extension with an automatically injected **Floating Launcher**
that opens an on-page **Console Panel**. The panel is an honest placeholder:
log capture is not yet implemented. There is no command execution or persistence.

## Install

Use Node **24.14.0** (Node 24 LTS) and pnpm **12.11.2**, pinned in `.nvmrc`
and `package.json`. With nvm and Corepack installed:

```sh
nvm install
nvm use
corepack enable
corepack prepare pnpm@12.11.2 --activate
pnpm install --frozen-lockfile
```

The committed lockfile fixes dependency resolution. Installation runs WXT's
preparation lifecycle; commands also prepare framework types themselves.

## Root commands

| Command | Purpose |
| --- | --- |
| `pnpm dev` | Persistent, uncached WXT/Vite development server for Chrome |
| `pnpm build` | Chrome production build in `apps/extension/.output/chrome-mv3/` |
| `pnpm typecheck` | Prepare WXT types, then strict TypeScript checking |
| `pnpm test` | Prepare WXT types, then non-watch Vitest tests |

Turborepo orders preparation before build, type-checking, and tests, and tracks
workspace dependencies for build/type-check tasks. Build output is cached;
development and preparation are not. No earlier development run is needed.

Development intentionally does **not** open a browser. Run `pnpm dev`, then load
`apps/extension/.output/chrome-mv3-dev/` unpacked using the steps below. Keep the
server running. After restarting it, reload the extension and the website tab.
The development build has WXT live-reload plumbing; use the production build for
permission and injection smoke checks.

## Workspace

- `apps/extension`: WXT entrypoint and lifecycle, React UI, Tailwind styles,
  a vendored [shadcn Button](https://ui.shadcn.com/docs/components/button),
  and mounted-shell tests. `components.json` records the shadcn configuration.
- `packages/tsconfig`: private `@tracer/tsconfig` package containing shared strict
  compiler defaults, not runtime code. The application extends **both** WXT's
  generated config and these defaults, retaining WXT aliases and framework types.

Generated `.wxt/` types, `.output/` builds, `node_modules/`, `.turbo/` task caches,
and coverage are ignored. Do not commit them. The shell uses WXT's Shadow DOM
UI with styles injected into that boundary, explicit inner typography, and
pixel-based spacing/text tokens so host root-font changes do not rescale it.
Shadow DOM is not immunity to every hostile host-page influence.

The Console Panel starts closed. Activate the launcher with a click, Enter, or
Space to open it; focus moves to **Close Console Panel**. That button, Escape
while focus is inside the panel, or toggling the launcher closes it and returns
focus to the launcher. Reopening is supported. The panel is non-modal: Tab can
leave it and the host page stays interactive. It does not open a browser popup
or native DevTools, collect page logs, or access native DevTools history.

Keep shell components in `apps/extension` and styles inside the existing Shadow
DOM boundary. The current shell uses no portals. If a future control needs a
portal, give it a container inside that same boundary, not `document.body`.

## Load the production extension

1. Run `pnpm build`.
2. Open `chrome://extensions` in Chrome and enable **Developer mode**.
3. Choose **Load unpacked** and select `apps/extension/.output/chrome-mv3/`
   (the directory containing `manifest.json`).
4. In Tracer's **Details → Site access**, permit the test website, or choose
   **On all sites**. Withheld access / **On click** can prevent automatic injection.
5. Visit or reload a permitted HTTP/HTTPS page. One round, bottom-right launcher
   should appear **without clicking the extension toolbar**.

After rebuilding, reload Tracer in `chrome://extensions` and reload existing
website tabs. Installation or extension reload does not promise immediate
injection into already-open documents.

Chrome-controlled pages such as `chrome://extensions`, other protected browser
pages, and the Chrome Web Store do not support this content script. File pages,
incognito, and iframes are not supported by this slice. Firefox compatibility
is not claimed. Production injection uses declarative top-level HTTP/HTTPS
content scripts, not `activeTab`, `scripting`, debugger access, or duplicated
host permissions.

## Verification

Vitest uses WXT's test integration, jsdom, React Testing Library, and user-event.
Tests exercise the complete mounted shell through accessible queries: initial
closed state, opening and placeholder, closing/reopening, Enter/Space/Escape,
focus restoration, repeated mount/open/remove, invalidation, and replacement
contexts. They do not prove real browser injection, layout, or keyboard Tab order.
Extend this integration seam rather than testing private hooks or exact component
markup; add unit tests only for independently meaningful standalone behavior.

For a focused run:

```sh
pnpm --filter @tracer/extension test shell/mount.test.tsx
```

### Chrome smoke checklist

- Load the **production** output unpacked; visit/reload a permitted HTTP/HTTPS
  page and confirm exactly one launcher without a toolbar click.
- Confirm it is round, 56 × 56 pixels, and 24 pixels from the bottom/right.
- Confirm the Console Panel starts closed. Click the launcher: exactly one named
  Console Panel opens on the page, without a popup, navigation, or native DevTools.
- Confirm it says **Log capture is not yet implemented**, with no fabricated logs
  or suggestion that it can read native DevTools history.
- Close using **Close Console Panel**, reopen, then close by toggling the launcher.
  Repeated interactions must not duplicate controls or panels.
- Tab to the launcher and check its visible focus ring. Enter/Space opens the
  panel and moves focus to its close button. Escape inside the panel and
  Enter/Space on the close button close it and restore focus to the launcher.
  Reopen using the keyboard; Tab must still allow reaching the host page.
  Controls must not navigate or submit host forms.
- Reload the page: still exactly one launcher, with the panel closed again.
- Try a page with aggressive global button styles and a non-default HTML font
  size (for example 32px). Open/close/reopen the panel: launcher and panel should
  retain their typography, focus indicators, and usable layout. Host content
  should retain its own styles. Confirm the panel stays within the Shadow DOM;
  any portal controls in future changes must stay in that boundary too (none are
  used currently).
- Withhold site access, reload, and confirm no automatic injection. Restore site
  access and reload. Check protected pages and the Chrome Web Store separately;
  no launcher is expected there.

Recorded checks and remaining manual limitations: [Chrome smoke results](docs/chrome-smoke.md).
