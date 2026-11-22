# FORGE Option 2 source review — November 22, 2026

Partial review against the November 8, 2026 review. The original interface and baseline files are preserved.

## Verified model-deviation text update — SAM Integrity Records transition

Acquisition.gov's November 18 announcement states that the FAR Council updated model-deviation text for Parts 9 and 42.11 for the Integrity Records transition from CPARS to SAM.gov, effective November 17, 2026. The current Part 9 and Part 52 model text uses SAM.gov Workspace Integrity Records; past-performance reviews remain separate from integrity records.

The alternate-only text for FAR 52.209-7 and 52.209-9 was updated from the current Acquisition.gov Part 52 model-deviation text. The legacy/codified baseline text is unchanged.

This is model-deviation text, not a codified FAR amendment. Agency-specific implementation is required. GSA's November 16 supplements apply to GSA procurements; other agencies are expected to issue their own supplements. DoD adoption was not verified. DARS still lists the DoD RFO Part 9/DFARS 209 deviation (2026-O0042, February 3) and Part 42/DFARS 242 deviation (2026-O0050, March 6) without a revised listing.

The stored corpus does not contain full section entries for FAR 9.104-6 or 42.11. This patch is limited to the existing 52.209-7 and 52.209-9 entries. No new entries or DFARS/PGI/AFARS mappings were added.

## DARS source-index review

Current DARS pages returned HTTP 502 when opened. The production current class-deviation index confirms the 2026-O0051 and 2024-O0006 Revision 2 leads; the DARS staging index also lists 2027-O0001, which was not confirmed on the production index. Full memoranda and attachments remain pending:

- DARS staging index: Class Deviation 2027-O0001, Streamlining Contractor Business Systems, listed November 18, 2026; the production index did not confirm the listing.
- Class Deviation 2026-O0051, Implementation of Vendor Threat Mitigation Support Authorities, listed June 11, 2026.
- Class Deviation 2024-O0006 Revision 2, Russian fossil fuel and fossil fuel business operations, listed October 7, 2026.
- RFO Class Deviation 2026-O0027 Revision 1 (Part 17/DFARS 217), listed October 7, 2026.
- RFO Class Deviation 2026-O0028 Revision 1 (Part 12/DFARS 212), listed October 22, 2026. The memo text indicates immediate effect and replacement DFARS/PGI Part 212, but its superseded-date text (December 18, 2026) conflicts with the October 22 listing; the full attachments were not retrieved. No content mapping was changed.
- RFO Class Deviation 2026-O0052 (Part 270), listed August 4, 2026.

No individual deviation text was imported based on listing dates alone.

## DFARS publication notices — proposals and ANPR

DARS publication notices identify:

- DFARS Case 2024-D013 — Small Purchase Exception for the Acquisition of U.S. Flags: proposed rule.
- DFARS Case 2024-D022 — Certification Requirement for Military Recruitment Advertising: proposed rule.
- DFARS Case 2022-D011 — Modifications to Printed Circuit Board Acquisition Restrictions: advance notice of proposed rulemaking.

These are proposals/ANPR, not codified changes. The current DFARS/PGI publication edition check remains May 7, 2026; no new codified DFARS/PGI text was verified.

## FAR proposals and PRA notices

The September RFO Cases 2026-003, 006, 010 and 011 remain proposed. Their substantive comment deadline of October 19, 2026 has passed; no final rule was verified.

Separate Paperwork Reduction Act notices for Cases 2026-006, 010 and 011 have comments due November 23, 2026. These are information-collection comments, not changes to the substantive proposed rules.

## Army AFARS/PGI

Army Connect still publishes AFARS and PGI effective August 31, 2026. The PGI 5105.302 award-announcement procedure remains the stored procedure. No newer Army source edition or topic mapping was verified.

## Baseline and limitations

- FAR publication edition: FAC 2026-01, effective March 13, 2026.
- DFARS and DFARS PGI publication edition: Change May 7, 2026.
- Army AFARS and PGI publication edition: August 31, 2026.
- Stored regulatory-text baseline remains October 1, 2026; only two alternate clause overlays were updated from the November 17 model text.
- No DFARS/PGI/AFARS topic mappings changed.
- The original interface, baseline `kb.json`, common `updates.json`, and main service worker remain unchanged.

## Official sources

- FAR publication index: https://www.acquisition.gov/browse/index/far
- DFARS publication index: https://www.acquisition.gov/dfars
- DFARS PGI publication index: https://www.acquisition.gov/dfarspgi
- Army AFARS and PGI: https://www.army.mil/armycontracting
- Army PGI — August 31, 2026: https://api.army.mil/e2/c/downloads/2026/09/08/999267c5/pgi-combined-31aug2026.pdf
- DARS current class deviations: https://www.acq.osd.mil/dpap/dars/class_deviations.html
- DARS staging class-deviation index (2027-O0001 lead only): https://acqweb.staging.acqebiz.mil/dpap/dars/class_deviations.html
- DARS RFO deviations: https://www.acq.osd.mil/dpap/dars/dfars_far_overhaul_class_deviations.html
- DARS publication notices: https://www.acq.osd.mil/dpap/dars/change_notices.html
- DARS current DFARS and PGI: https://www.acq.osd.mil/dpap/dars/dfarspgi/current/index.html
- FAR Overhaul model-deviation guide: https://www.acquisition.gov/far-overhaul/far-part-deviation-guide
- FAR Part 9 model text: https://www.acquisition.gov/far-overhaul/far-part-deviation-guide/far-overhaul-part-9
- FAR Part 42 model text: https://www.acquisition.gov/far-overhaul/far-part-deviation-guide/far-overhaul-part-42
- FAR Part 52 model text: https://www.acquisition.gov/far-overhaul/far-part-deviation-guide/far-overhaul-part-52
- FAR Council announcement — SAM Integrity Records transition: https://www.acquisition.gov/content/far-updates-align-integrity-records-transition-sam.gov
- GSA Part 9 supplement: https://www.acquisition.gov/sites/default/files/page_file_uploads/GSA_RFO_Deviation_Part-9_Supplement_1-3.pdf
- GSA Part 42 supplement: https://www.acquisition.gov/sites/default/files/page_file_uploads/GSA_RFO_Deviation_Part-42_Supplement_1.pdf
- RFO case comments: https://www.acquisition.gov/requesting_comments
