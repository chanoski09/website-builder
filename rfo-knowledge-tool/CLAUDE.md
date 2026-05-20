# RFO Knowledge Tool — Project Context

## What This Is
A single-file, offline, self-contained HTML knowledge base for the **411th Contract Support Brigade** comparing the **Legacy FAR (48 C.F.R.)** side-by-side against the **Revolutionary FAR Overhaul (RFO, April 2025)** with word-level diff highlighting.

## Working File
`RFO_tool.html` — everything lives here: styles, markup, KB data, and all JavaScript. No build step, no server, no dependencies. Open in any browser by double-clicking.

## Architecture
```
RFO_tool.html
├── <style nonce="rfo2026">   CSS (tokens, layout, components, dark mode, print)
├── <body>                    Header, sidebar, search section, results, footer
└── <script nonce="rfo2026"> KB data + all JS logic
    ├── const KB = [...]      ~55 knowledge base entries
    ├── Diff engine           stripMarkers → diffTokenize → diffTokens (LCS)
    ├── Rendering             renderDiffOps, renderPlain, buildLegacyBlock, buildRfoBlock
    ├── Alignment             wordSet, jaccard, alignBullets (Jaccard fallback)
    ├── FAR parser            parseFarSubparas, alignByLabel (label-first alignment)
    ├── Entry renderer        renderEntry (branches on legacyText/rfoText presence)
    └── UI                    showResults, runSearch, buildChips, buildTOC, dark mode, typewriter
```

## KB Entry Schema
```js
{
  id:          "far-6-001",
  group:       "Part 6 — Competition Requirements",
  title:       "FAR 6.001 — Applicability",
  keywords:    ["applicability", "6.001", "competition"],
  summary:     "Short editorial summary shown in collapsed card.",
  deepLinks:   [{ label: "acquisition.gov", url: "https://www.acquisition.gov/far-overhaul" }],
  sources:     ["eCFR (48 C.F.R. 6.001)", "FAR Overhaul Apr. 2025"],

  // ── REAL FAR TEXT (unlocks word-level sub-paragraph diff) ──
  legacyText:  `This part applies to all acquisitions except— (a) ...`,
  rfoText:     `This part applies to all acquisitions except— (a) ... (but see 13.501)`,

  // ── EDITORIAL BULLETS (drive search + fallback display) ──
  legacy: [{ t: "Summary of legacy provision.", s: "eCFR (48 C.F.R. 6.001)" }],
  rfo:    [{ t: "Summary of RFO change.",       s: "FAR Overhaul Apr. 2025" }]
}
```

## Loading Real FAR Text
- Find the entry in `const KB = [...]` by its `id`
- Replace `legacyText: "TODO: paste..."` with the actual FAR prose (use template literals)
- Replace `rfoText:    "TODO: paste..."` with the actual RFO prose
- Sub-paragraphs labeled `(a)`, `(b)`, `(1)`, `(2)` etc. are parsed and aligned automatically
- The full word-level diff activates immediately — no other code changes needed

## Currently Seeded
- **FAR 6.001 Applicability** — full legacy + RFO text loaded, sub-paragraphs (a)–(f) diff live

## Security Constraints (must never remove)
| Item | Location | Why |
|------|----------|-----|
| `nonce="rfo2026"` | All `<script>` and `<style>` tags | CSP requires it |
| `sanitize()` | Search input handler | XSS prevention |
| `safeUrl()` | All external links | Rejects non-http/https |

## Key Design Decisions
- **Dark mode** — `localStorage` persistence + `prefers-color-scheme` detection
- **Typewriter placeholder** — respects `prefers-reduced-motion`, pauses on focus
- **`/` shortcut** — focuses search from anywhere on the page
- **Backward compatible** — entries without `legacyText`/`rfoText` fall back to editorial bullet diff
- **Print styles** — sidebar and controls hidden; diff panes shown in clean two-column layout

## Data Source
**Workbook: RFO/Legacy FAR Workbook 26055** — not yet loaded. To add data:
1. Open the workbook, copy legacy + RFO text for a section
2. Find the matching KB entry (search by `id` in the source)
3. Paste into `legacyText` / `rfoText` as a template literal
4. Upload/share the updated file

## PR / Branch
- Branch: `claude/far-rfo-handoff-plan-ySZSe`
- PR: `chanoski09/website-builder#2`
