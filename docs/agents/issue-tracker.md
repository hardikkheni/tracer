# Issue tracker: Local Markdown

Issues and specs for this repo live as Markdown files in `.scratch/`.

## Conventions

- One feature per directory: `.scratch/<feature-slug>/`
- Spec: `.scratch/<feature-slug>/spec.md`
- Implementation issues: `.scratch/<feature-slug>/issues/<NN>-<slug>.md`,
  numbered from `01`, one file per ticket.
- Triage state: a `Status:` line near the top of each issue file.
  Use the role strings in `triage-labels.md`.
- Comments and conversation history: append under `## Comments`.

## Publishing and fetching

When a skill says "publish to the issue tracker", create the appropriate
spec or issue file using the conventions above, creating directories as needed.

When a skill says "fetch the relevant ticket", read the referenced file.
For a bare issue number, resolve it within the current feature; ask if ambiguous.

## Wayfinding operations

Used by `/wayfinder`. The map has one child file per ticket.

- Map: `.scratch/<effort>/map.md` (Notes / Decisions-so-far / Fog).
- Child ticket: `.scratch/<effort>/issues/NN-<slug>.md`, numbered from `01`,
  with the question in the body.
- `Type:` records `research`, `prototype`, `grilling`, or `task`.
- Wayfinding uses its own lifecycle: open tickets have `Status: open`;
  claiming sets `Status: claimed`; resolving sets `Status: resolved`.
- Blocking: `Blocked by: NN, NN` near the top. A ticket is unblocked
  when every listed ticket is resolved.
- Frontier: scan for open, unblocked, unclaimed tickets; first by number wins.
- Claim: set `Status: claimed` and save before starting work.
- Resolve: append the answer under `## Answer`, set `Status: resolved`,
  then append a gist and link to Decisions-so-far in the map.
