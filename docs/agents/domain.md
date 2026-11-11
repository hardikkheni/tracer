# Domain Docs

## Layout

Single-context: `GLOSSARY.md` at the repo root and ADRs under `docs/adr/`.

## Before exploring

- Read the root `GLOSSARY.md`.
- Read ADRs in `docs/adr/` that touch the area being explored.

If these files do not exist, proceed silently. Domain modeling creates
them lazily when terms or decisions are resolved.

## Use the glossary's vocabulary

Use glossary terms when naming domain concepts in issue titles, proposals,
hypotheses, and tests. Avoid synonyms the glossary explicitly rejects.

If a concept is missing, reconsider whether it belongs to the project's
language; note genuine gaps for `/domain-modeling`.

## Flag ADR conflicts

Explicitly surface any proposed contradiction of an existing ADR:

> Contradicts ADR-0007 (event-sourced orders), but worth reopening because…
