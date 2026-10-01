# FORGE alternate interface — leadership review

The original `RFO_tool.html` remains unchanged at the Pages root. This complete alternate UI is published at `/website-builder/alternate/`. `/website-builder/options.html` provides both leadership-review links.

Both interfaces load the exact same baseline `../kb.json` and reviewed `../updates.json`, merging by entry ID. The alternate currently exposes all 1,129 sections and four release notes. It supports citation/topic/keyword and stored-text search, regulation/part filtering, paginated results, overview/full stored text, paired paragraph alignment, changes-only filtering, highlights, reading layout, saved sections, deep links, printing, theme selection, source notes and supplementary PGI procedures.

No sample regulatory text from the mockup is used. Entries without full stored text clearly show editorial summaries; the redesign does not expand or certify the underlying regulatory coverage. Overview bullets are paired in their stored order; full source text uses paragraph alignment. Unmatched paragraphs are displayed without deletion/addition markup. Unmatched paragraphs and likely renumbering are marked as alignment observations, not assertions of legal deletion. The comparison core is derived from the original parser/alignment implementation; equal diff tokens retain the original capitalization for each side.

Saved sections and theme use separate `forge-alt-*` device-storage keys. The alternate service worker is scoped to its directory and uses a separate `forgealt-*` cache; it cannot replace the original app or delete the original cache. Offline use requires a successful first online visit. Source files use no remote fonts, images, JavaScript libraries, or build dependencies.

Run locally from the project root with `python -m http.server 8000`, then open `http://localhost:8000/rfo-knowledge-tool/alternate/`.

Leadership comparison tasks: find a FAR citation or topic, compare a section in both versions, check source editions/applicability, and review AFARS 5105.302 with its current PGI procedure. Select an interface based on ease of finding requirements, comparison readability, and source transparency.
