# FORGE alternate interface — leadership review

The original `RFO_tool.html` remains unchanged at the Pages root. This complete alternate UI is published at `/website-builder/alternate/`. `/website-builder/options.html` provides both leadership-review links.

Both interfaces load the exact same baseline `../kb.json` and reviewed `../updates.json`, merging by entry ID. The alternate currently exposes all 1,129 sections and four release notes. It supports citation/topic/keyword and stored-text search, regulation/part filtering, paginated results, overview/full stored text, paired paragraph alignment, changes-only filtering, highlights, reading layout, saved sections, deep links, printing, theme selection, source notes and supplementary PGI procedures.

No sample regulatory text from the mockup is used. Entries without full stored text clearly show editorial summaries; the redesign does not expand or certify the underlying regulatory coverage. Overview bullets are paired in their stored order; full source text uses paragraph alignment. Unmatched paragraphs are displayed without deletion/addition markup. Unmatched paragraphs and likely renumbering are marked as alignment observations, not assertions of legal deletion. The comparison core is derived from the original parser/alignment implementation; equal diff tokens retain the original capitalization for each side.

Saved sections and theme use separate `forge-alt-*` device-storage keys. The alternate service worker is scoped to its directory and uses a separate `forgealt-*` cache; it cannot replace the original app or delete the original cache. Offline use requires a successful first online visit. Source files use no remote fonts, images, JavaScript libraries, or build dependencies.

Run locally from the project root with `python -m http.server 8000`, then open `http://localhost:8000/rfo-knowledge-tool/alternate/`.

Leadership comparison tasks: find a FAR citation or topic, compare a section in both versions, check source editions/applicability, and review AFARS 5105.302 with its current PGI procedure. Select an interface based on ease of finding requirements, comparison readability, and source transparency.

## Alignment correction — October 1, 2026

The alternate now recognizes indented parent paragraphs, groups wrapped preambles, and handles single-letter (c)/(d) labels as alphabetic context. Unaligned paragraphs are retained in collapsed source groups, without repeated opposite-pane warnings or automatic deletion markup. Paired text remains visible; “Changes only” does not discard unaligned source groups.

`mappings.json` holds reviewed alternate-only comparison corrections. FAR 14.205 (RFO bid samples) uses codified Legacy FAR 14.202-4 bid samples (FAC 2026-01, checked against Acquisition.gov on October 1), with explicit source labels. Paragraph topic mappings: legacy (a)+(b) → revised (a); (d) → (b); (e) → (c); (f) → (d); (g) → (e). Legacy justification (c) and unpaired headings remain in source groups. These are reading mappings, not determinations that unpaired requirements were repealed. The original app, baseline and common update files remain unchanged. This correction does not certify other section mappings across the corpus.
