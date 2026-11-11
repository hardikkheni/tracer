# Chrome smoke results — ticket 01

## Environment and method

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

## Actual results

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

## Remaining manual checks

No human-operated Chrome **Load unpacked** dialog or visual inspection was
performed. The headless check did not exercise Chrome's site-access settings UI,
withheld/restored access, protected pages, the Chrome Web Store, or a remote HTTPS
website. Those are not claimed as verified. Follow the smoke checklist in
`README.md` for those checks. Protected pages remain unsupported regardless of
the smoke environment. File, incognito, and iframe support are not claimed.
