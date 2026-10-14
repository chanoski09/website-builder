# FORGE — FAR Overhaul Reference & Guidance Engine

## What This Is
A hosted single-file HTML app for the **411th Contract Support Brigade** comparing Legacy FAR, RFO, DFARS, and AFARS side-by-side with word-level diff highlighting.

**Developed by:** SFC Ho Tony & SFC Napit Rabin — 411th CSB

## Working Files
| File | Purpose |
|------|---------|
| `RFO_tool.html` | App shell — styles, markup, all JavaScript logic |
| `kb.json` | Knowledge-base entries, source editions, and `meta.updates` release notes — **edit this to update content** |

The app fetches `kb.json` at load time. Update the JSON, push to GitHub, and every visitor gets fresh data on their next page load. No app code changes needed.

## Architecture
```
RFO_tool.html          ← app shell (styles + JS engine, no KB data)
kb.json                ← all KB entries (edit to update content)

RFO_tool.html
├── <style nonce="rfo2026">   CSS (tokens, layout, components, dark mode, print)
├── <body>                    Header, sidebar, reg-filter, chips, results, footer
└── <script nonce="rfo2026"> All JS logic
    ├── let KB = []           populated at load from kb.json
    ├── Diff engine           stripMarkers → diffTokenize → diffTokens (LCS)
    ├── Rendering             makeDiffDetail, buildLegacyBlock, buildRfoBlock
    ├── Alignment             wordSet, jaccard, alignBullets, alignByLabel
    ├── FAR parser            parseFarSubparas (handles (a),(b),(1) labels)
    ├── Entry renderer        renderEntry (FAR-text path + editorial fallback)
    └── UI                    showResults, runSearch, buildChips, buildSubpartChips,
                              buildTocSelect, buildTocSelect, dark mode, typewriter
```

## KB Entry Schema
```json
{
  "id":        "far-6-001",
  "group":     "Part 6 — Competition Requirements",
  "title":     "FAR 6.001 — Applicability",
  "keywords":  ["applicability", "6.001", "competition"],
  "summary":   "Short editorial summary shown in collapsed card.",
  "deepLinks": [{ "label": "acquisition.gov", "url": "https://www.acquisition.gov/far-overhaul" }],
  "sources":   ["eCFR (48 C.F.R. 6.001)", "FAR Overhaul Apr. 2025"],

  "legacyText": "TODO: paste legacy FAR sub-paragraph text here",
  "rfoText":    "TODO: paste RFO sub-paragraph text here",

  "legacy": [{ "t": "Summary of legacy provision.", "s": "eCFR (48 C.F.R. 6.001)" }],
  "rfo":    [{ "t": "Summary of RFO change.",       "s": "FAR Overhaul Apr. 2025" }]
}
```

**DFARS entries** use group `"DFARS Part 206 — ..."`, title `"DFARS 206.001 — ..."`.  
**AFARS entries** use group `"AFARS Part 5106 — ..."`, title `"AFARS 5106.001 — ..."`.

## Updating Content (Monthly RFO Updates)

### Edit a single entry
1. Open `kb.json` in GitHub → click pencil icon
2. Find entry by `id` (Ctrl+F)
3. Replace `"TODO: paste..."` in `legacyText` / `rfoText` with actual regulatory text
4. Commit to the FORGE source branch for GitHub Pages, or `main` for cPanel. FORGE fetches current data while online and uses its cached copy while offline.

### Add a new entry
1. Copy any existing entry block in `kb.json`
2. Assign a new unique `id`
3. Fill in all fields; add to the array
4. Commit to `main`

### Multiline text in legacyText / rfoText
Use `\n` for line breaks within JSON strings:
```json
"legacyText": "This part applies to all acquisitions except—\n(a) Contracts awarded using simplified acquisition..."
```

## Monthly Reminder
A GitHub Action (`.github/workflows/forge-data-reminder.yml`) automatically opens an issue on the 1st of every month listing the sources to check and step-by-step update instructions.

## Updates / New (added 1 October 2026)

The front-page section is built from `meta.updates` in `kb.json`. Each record has
an `id`, project `date`, `title`, `summary`, `status` (`effective`, `proposed`, or
`project`), `details`, `entryIds`, and official `links`. Use `sourceDate`,
`effectiveDate`, and `commentDeadline` where applicable. Never label publication
dates or project refresh dates as a blanket regulatory effective date.

- Selected DFARS entries: codified Acquisition.gov Change 7 May 2026. These are
  not separately verified DoD RFO deviation text.
- Selected Army AFARS / PGI entries: official Army edition effective 31 August
  2026, newer than the AFARS edition still displayed on Acquisition.gov.
- Award schedule confirmation: PGI 5105.302(a)(2), 8 p.m. Eastern the day before
  proposed award. Initial announcement package: (a)(1), noon Eastern three
  business days before award. Formal ODASA(P) approval remains required.
- CAS final-rule notices: effective 1 October 2026. FAR/RFO text is not silently
  rewritten from these notices or from proposed rules.

Entry-specific `sourceEditions` override the global pane subtitles. `sourceNote`
explains renumbering, topic counterparts, and any source limits. Keep the historic
left pane and refresh only verified current text. Search also retains former
AFARS citations after renumbering. See `SOURCE_REVIEW_2026-10-01.md` for sources.

## Security Constraints (must never remove)
| Item | Location | Why |
|------|----------|-----|
| `nonce="rfo2026"` | All `<script>` and `<style>` tags | CSP requires it |
| `connect-src 'self'` | CSP meta tag | Allows fetch of kb.json |
| `sanitize()` | Search input + error messages | XSS prevention |
| `safeUrl()` | All external links | Rejects non-http/https |

## PR / Branch
- Branch: `claude/far-rfo-handoff-plan-ySZSe`
- PR: `chanoski09/website-builder#2`

## Publication data layout

`kb.json` preserves the large historical baseline. `updates.json` contains current
metadata and the 19 refreshed/new entries, merged by ID at load time. Edit
`updates.json` for current entries and front-page release notes. Both files are
required for deployment and offline caching. This avoids replacing the 5 MB
baseline through the connector.
