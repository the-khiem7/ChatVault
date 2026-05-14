# Extension Platform Hallucination Log

Updated: 2026-05-15

This file keeps only decisions that required explicit user choice or previously carried ambiguity. All major platform-direction risks below are now closed.

## FF-001: Firefox Export Persistence Mode

Status: Closed

Why decision was required:

Firefox support raised ambiguity between forcing Chrome-like direct folder writing and accepting a different save mechanism.

Options considered:

1. Force direct folder write parity with Chrome.
2. Use packaged artifact download for Firefox.

Decision record:

- Date: 2026-05-15
- Chosen option: 2
- Decision: Firefox uses packaged export artifact download.
- Impact: save layer must accept normalized artifacts and browser-specific strategy selection.

## FF-002: Browser Support Delivery Model

Status: Closed

Why decision was required:

Poly-browser support could have pushed the project toward separate repos or divergent implementations.

Options considered:

1. Separate repo per browser.
2. One repo with browser-specific manifests/build outputs.

Decision record:

- Date: 2026-05-15
- Chosen option: 2
- Decision: one codebase, shared source, browser-specific builds.
- Impact: manifest/build/package/release become browser-aware; core source stays shared.

## FF-003: Browser Save Abstraction

Status: Closed

Why decision was required:

Folder export assumptions were too tightly coupled to the initial Chrome implementation.

Options considered:

1. Hard-code save behavior per browser name.
2. Introduce browser API/capability/save strategy contracts.

Decision record:

- Date: 2026-05-15
- Chosen option: 2
- Decision: use `BrowserApi`, `BrowserCapabilities`, and `SaveStrategy` style abstractions.
- Impact: save behavior becomes capability-aware and portable.

## Current Open Risks

None recorded for the accepted platform direction in this baseline update.
