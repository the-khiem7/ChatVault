# Risks

Updated: 2026-04-30

## ChatGPT DOM Changes

Risk:

ChatGPT markup can change without notice, breaking selectors.

Mitigation:

- use layered extraction strategies
- keep selectors isolated in `src/content/`
- add fallback visible text extraction
- report warnings when confidence is low

## Runtime Boundary Drift

Risk:

Business logic may drift into popup, content script, or service worker, making the extension harder to test and more fragile under MV3.

Mitigation:

- keep export and validation logic in pure modules
- route Chrome APIs through runtime adapters
- add architecture boundary checks where practical
- update [architecture.md](architecture.md) before changing runtime ownership

## Asset Download Restrictions

Risk:

Image URLs may be protected by CORS, expiring tokens, blob URL constraints, or host permission limits.

Mitigation:

- support data/blob URL conversion where available
- fetch only policy-approved asset candidates
- keep remote URL fallback with warning
- validate local asset references before ZIP download
- avoid broad permissions as the default response

## Permission Creep

Risk:

Future features may expand extension permissions beyond what the product needs.

Mitigation:

- keep MVP permissions limited to ChatGPT hosts
- document permission changes in [decisions.md](decisions.md)
- avoid `<all_urls>`
- treat `offscreen` as conditional, not default

## Silent Data Loss

Risk:

Unsupported DOM blocks may be dropped during conversion.

Mitigation:

- unknown blocks must preserve visible text
- warnings must be generated for unsupported structures
- validation must reject empty or clearly incomplete exports

## Service Worker Lifecycle

Risk:

Manifest V3 service workers are ephemeral. Long-running export or ZIP operations can be interrupted if state is held only in globals.

Mitigation:

- keep the service worker as orchestrator, not state store
- avoid long-lived global state
- use structured runtime messages
- add offscreen document only when evidence shows it is needed
- test popup close and worker restart scenarios

## Page-Controlled Privileged Fetch

Risk:

A malicious or compromised page could cause the extension to fetch arbitrary URLs if asset fetching trusts raw page data.

Mitigation:

- fetch only extracted asset candidates tied to message/block ids
- reject unsupported schemes
- validate active tab origin
- do not expose arbitrary `fetchUrl` style message handlers

## Scope Expansion

Risk:

Bulk export, cloud sync, RAG, and multi-platform support can distract from the MVP.

Mitigation:

- keep MVP limited to current ChatGPT conversation export
- track future ideas outside the active roadmap
- do not implement non-goals without updating product requirements

