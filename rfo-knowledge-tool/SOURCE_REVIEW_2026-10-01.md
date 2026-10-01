# FORGE source review — 1 October 2026

Last prior source-branch commit: `72df17b`, 22 July 2026. The old overall
`meta.lastUpdated` date was 21 May despite subsequent updates. Project dates,
source editions, publication dates, and effective dates now have separate roles.

## Army award reporting

Official Army publications, effective 31 August 2026:

- [AFARS](https://api.army.mil/e2/c/downloads/2026/09/08/2f80cf4d/afars-combined-31aug2026.pdf)
- [AFARS PGI](https://api.army.mil/e2/c/downloads/2026/09/08/999267c5/pgi-combined-31aug2026.pdf#page=22)
- [Army publication index](https://www.army.mil/armycontracting)
- [Historical Acquisition.gov 5105.303](https://www.acquisition.gov/afars/5105.303-announcement-contract-awards.)

Part 5105 / PGI 5105 was revised 29 June 2026. PGI 5105.302(a)(1) requires the
initial announcement package by noon Eastern three business days before award.
Paragraph (a)(2) requires confirming the award schedule by **8 p.m. Eastern the
day before proposed award**, replacing the former noon-on-award-day confirmation.
This is a confirmation requirement, not permission for early public release.
Formal ODASA(P) approval remains required for actions meeting the reporting
threshold. AFARS 5105.302 retains the written approval requirement for the
urgency exception and reporting within one business day after that award.

The current Army source refers to DFARS 205.302 / PGI 205.302. The codified
DFARS page on Acquisition.gov still uses 205.303. Preserve this source distinction
and verify the applicable DoD/Army deviation when applying the requirements.

## Selected supplement refresh

All eight existing DFARS cards were refreshed from their official Acquisition.gov
source pages in **Change 7 May 2026**. Their FY2020 left-pane text is preserved.
This is a codified DFARS refresh, not a certification of DoD RFO deviations.

All eight existing AFARS topic cards use selected current text from the official
31 August 2026 Army edition. The old left-pane source text remains for historical
comparison; old citation keywords remain searchable. Notes explain renumbering
and topic counterparts. Two historical placeholders have their unsupported
editorial bullets replaced with source-limit notices. A new 5105.302 award card
compares the historical 5105.303 text with the current AFARS and PGI procedures.

The original DFARS 225.7002 card incorrectly referred to specialty metals; its
title now correctly identifies the Berry Amendment. Specialty metals are
separately addressed in 225.7003. The 252.204-7012 card now distinguishes covered
defense information / incident reporting from CMMC requirements.

## CAS final rules

- [Acquisition.gov release](https://www.acquisition.gov/content/cost-accounting-standards-board-issues-two-new-final-rules)
- [91 FR 56056 — monetary thresholds](https://www.federalregister.gov/documents/2026/09/01/2026-17901/increase-of-monetary-thresholds-and-other-matters-related-to-cost-accounting-standards-program)
- [91 FR 56061 — CAS 407](https://www.federalregister.gov/documents/2026/09/01/2026-17903/conformance-of-cost-accounting-standards-to-generally-accepted-accounting-principles-for-cas-407-use)

Both were published 1 September and are effective 1 October 2026. Added two
summary notices under the cost-accounting topic, without silently overwriting
FAR/RFO text. Basic applicability increases to $35 million and full-coverage /
disclosure thresholds to $100 million, with exemptions and transition conditions.
CAS 407 is removed and reserved; retained requirements move to CAS 418.

## September proposals

[Acquisition.gov official case list](https://www.acquisition.gov/requesting_comments)

Published 18 September 2026; comments due 19 October 2026:

| Case | Parts |
| --- | --- |
| 2026-003 | 8, 12, 13, 15, 38, 44, 51, 52 |
| 2026-006 | 16, 17, 35, 52 |
| 2026-010 | 14, 28, 36, 52 |
| 2026-011 | 9, 27, 47, 52 |

These are front-page tracking notices marked **Proposed — not final**. Existing
FAR/RFO regulatory text has not been replaced by proposed text.

## Scope and maintenance

The FAR/RFO corpus retains its prior source baseline and Part dates; this review
does not certify every paragraph as current. Removed the misleading blanket
17 April 2026 effective-date label and retain it as a source-baseline date.

Update `meta.updates` for front-page release notes. New offline-cache behavior
prefers network data while online and falls back to the current release's cache
while offline. Cache cleanup is restricted to FORGE cache names.

Run `node tests/verify-forge-updates.mjs` for content/source invariants.

Functional validation also identified and fixed duplicate-label paragraph loss in
the diff renderer. Current and historical paragraph counts are preserved. DOM
checks cover all 19 refreshed/new cards and release-note links. Service-worker
checks cover live-data preference, offline fallback, and cache-write failure.
Browser screenshot validation was unavailable because Chrome could not start in
this runtime; visual layout has not been certified.

## Publication data layout

`kb.json` preserves the large historical baseline. `updates.json` contains current
metadata and the 19 refreshed/new entries, merged by ID at load time. Edit
`updates.json` for current entries and front-page release notes. Both files are
required for deployment and offline caching. This avoids replacing the 5 MB
baseline through the connector.
