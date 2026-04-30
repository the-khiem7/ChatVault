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

## Asset Download Restrictions

Risk:

Image URLs may be protected by CORS, expiring tokens, or blob URL constraints.

Mitigation:

- support data/blob URL conversion
- fetch binaries when browser policy allows
- keep remote URL fallback with warning
- validate local asset references before ZIP download

## Permission Creep

Risk:

Future features may expand extension permissions beyond what the product needs.

Mitigation:

- keep MVP permissions limited to ChatGPT hosts
- document permission changes in [decisions.md](decisions.md)
- avoid `<all_urls>`

## Silent Data Loss

Risk:

Unsupported DOM blocks may be dropped during conversion.

Mitigation:

- unknown blocks must preserve visible text
- warnings must be generated for unsupported structures
- validation must reject empty or clearly incomplete exports

## Service Worker Lifetime

Risk:

Manifest V3 service workers are not persistent, so long-running workflows can be interrupted if state is not handled carefully.

Mitigation:

- keep export workflow bounded and restartable
- avoid relying on long-lived in-memory service worker state
- keep state serializable between popup/content/background messages

## Scope Expansion

Risk:

Bulk export, cloud sync, RAG, and multi-platform support can distract from the MVP.

Mitigation:

- keep MVP limited to current ChatGPT conversation export
- track future ideas outside the active roadmap
- do not implement non-goals without updating product requirements

