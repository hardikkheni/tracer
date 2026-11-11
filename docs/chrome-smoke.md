# Chrome smoke results

## Ticket 02 — accessible Console Panel

Verified on **2026-11-12** using installed **Google Chrome 157.0.8103.50** on
macOS arm64, headless with an isolated temporary profile. A one-off DevTools
Protocol harness loaded the actual production build with `Extensions.loadUnpacked`
and navigated to locally served, permitted HTTP pages. Automatic injection came
from the declarative content script, not harness-injected application code.
This is not a committed E2E suite or human visual inspection.

Both pages had aggressive global `button`, `section`, `h2`, and `p` styles using
`!important`; root font sizes were 16px and 32px respectively. Actual results:

| Check | Result |
| --- | --- |
| Automatic appearance, no toolbar click | One Floating Launcher; Console Panel initially absent; `aria-expanded=false` |
| Real Tab navigation across Shadow DOM | Reached launcher with visible focus indicator |
| Enter opens | One Console Panel; `aria-expanded=true`; focus on visible-focus close button |
| Honest placeholder | States log capture is not yet implemented and no collection/access to native DevTools history |
| Escape inside panel | Closed panel and restored launcher focus |
| Space reopens; Enter on close button | Reopened, then closed with launcher focus restored |
| Pointer activation | Launcher open/toggle-close/reopen and close-button interactions succeeded |
| Repeated opening and page reload | One shell/launcher, no duplicate panels; reload starts closed |
| Navigation / popup | Same page URL, no additional non-blank page targets |
| Launcher styling on both pages | 56 × 56px, 24px bottom/right, 14px Arial, dark background |
| Panel styling on both pages | 480 × 130px, 24px right / 96px bottom, 14px Arial, white background, no horizontal overflow |
| Close control styling | 32px high, 12px Arial, dark background; unaffected by host 40px/red button rules |
| Host page styling | Host button remained 300px/red/40px; host paragraph remained 20px |
| UI boundary | Panel remained inside Shadow DOM, absent from host body queries; no portal-based controls used |

The harness initially omitted Enter's text payload in its DevTools Protocol key
event, so Chrome did not activate the button. Adding the real Enter payload
(`text: '\r'`) corrected the harness; the entire check then passed. No application
change was needed for this harness issue.

Human visual inspection, screen-reader output, site-access settings UI,
withheld/restored permissions, protected pages, remote HTTPS, and host-form
submission were **not** exercised. These remain manual checks in `README.md`.
The headless run proves the measured layout and keyboard interactions on these
two pages, not immunity to every hostile host page.

## Ticket 01 — historical launcher-only baseline

### Environment and method

Verified on **2026-11-12** using installed **Google Chrome 157.0.8103.50** on
macOS arm64. Chrome ran headless with an isolated temporary profile and
`--enable-unsafe-extension-debugging`. The DevTools Protocol
`Extensions.loadUnpacked` command loaded the actual production directory,
`apps/extension/.output/chrome-mv3/`.

A temporary HTTP server served two real pages on `127.0.0.1`. Chrome navigated to
them normally; the harness did **not** inject Tracer's JavaScript, call its mount
function, or click a toolbar control. The extension's declarative content script
performed injection. This was a one-off real-browser smoke check, not a committed
E2E suite and not a jsdom simulation.

### Actual results

| Check | Result |
| --- | --- |
| Automatic appearance after navigation | Exactly one accessibly named Floating Launcher |
| Position and dimensions | Fixed; 56 × 56px; 24px from bottom and right; round |
| Default 16px versus aggressive 32px root font | Identical launcher dimensions, position, and 14px Arial typography |
| Host `button` rules with `!important` | Host button stayed 300px wide/red; launcher stayed 56px wide/dark |
| Host paragraph | Retained its explicit 20px font size |
| Real Tab key events across shadow boundary | Launcher received focus and matched `:focus-visible` |
| Focus indicator | Computed blue 4px ring with white 2px offset |
| Enter and Space on launcher | No navigation; no Console Panel (ticket 02 is separate) |
| Full page reload | Exactly one launcher again |

The first browser pass exposed that WXT's `:host { all: initial !important }`
overrode typography declared on `:host`. Typography was moved to the inner shell
root, and the complete check was rerun successfully.

The generated production manifest was also inspected: Manifest V3, explicit
HTTP/HTTPS content-script matches, `all_frames: false`, no extra `permissions`
or `host_permissions`, and only the UI stylesheet as a web-accessible resource.
The stylesheet is fetched into WXT's shadow boundary rather than declared as
page-wide content-script CSS.

### Remaining manual checks

No human-operated Chrome **Load unpacked** dialog or visual inspection was
performed. The headless check did not exercise Chrome's site-access settings UI,
withheld/restored access, protected pages, the Chrome Web Store, or a remote HTTPS
website. Those are not claimed as verified. Follow the smoke checklist in
`README.md` for those checks. Protected pages remain unsupported regardless of
the smoke environment. File, incognito, and iframe support are not claimed.
