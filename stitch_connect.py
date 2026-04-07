#!/usr/bin/env python3
"""
stitch_connect.py — Connect to Stitch by Google via the Gemini API.

Stitch (stitch.withgoogle.com) is Google Labs' AI UI designer, powered by
Gemini 2.5. This script replicates the Stitch workflow programmatically:
  1. Reads brand-intel.json + design-brief.json
  2. Sends a structured prompt to the Gemini API
  3. Writes the generated HTML/CSS/JS into website-redesign/

Usage:
    export GOOGLE_API_KEY="your-api-key"
    python stitch_connect.py

Optional flags:
    --out-dir  PATH   Output directory (default: website-redesign/)
    --model    NAME   Gemini model to use (default: gemini-2.5-pro)
    --dry-run         Print the prompt only, do not call the API
"""

import argparse
import json
import os
import re
import sys
from pathlib import Path

# Auto-load .env if present (no dependency on python-dotenv required)
_env_file = Path(__file__).parent / ".env"
if _env_file.exists():
    for _line in _env_file.read_text().splitlines():
        _line = _line.strip()
        if _line and not _line.startswith("#") and "=" in _line:
            _k, _v = _line.split("=", 1)
            os.environ.setdefault(_k.strip(), _v.strip())


# ── Prompt template sent to Gemini (mirrors Stitch's design-to-code pipeline) ──

SYSTEM_PROMPT = """\
You are an expert UI/UX engineer who produces production-ready, single-file \
HTML pages. Your output must:
- Use semantic HTML5
- Include all CSS inside a <style> tag (no external sheets)
- Include all JS inside a <script> tag at the bottom of <body>
- Be fully responsive (mobile-first, ≥ 375 px)
- Use CSS custom properties for the design token system
- Add smooth scroll-reveal entrance animations via IntersectionObserver
- Generate zero placeholder or lorem ipsum content — every word comes from \
the brand data provided
- Output ONLY the HTML document — no markdown fences, no explanations
"""

USER_PROMPT_TEMPLATE = """\
Generate a production-ready, single-file HTML homepage for the business \
described below.

──────────────────────────────────────────
BRAND INTELLIGENCE
──────────────────────────────────────────
{brand_intel}

──────────────────────────────────────────
DESIGN BRIEF
──────────────────────────────────────────
{design_brief}

──────────────────────────────────────────
REQUIREMENTS
──────────────────────────────────────────
- Implement every section defined in the design brief's section_specs
- Use the exact color hex values from the design brief's color_system
- Load the Google Fonts specified in the typography section
- All CTA text, phone numbers, addresses, and award copy must come verbatim \
from brand_intelligence
- No images (use CSS gradients / SVG placeholders instead)
- Output the complete <!DOCTYPE html> … </html> document only
"""


def load_json(path: Path) -> dict:
    with open(path, encoding="utf-8") as f:
        return json.load(f)


def build_prompt(brand_intel: dict, design_brief: dict) -> str:
    return USER_PROMPT_TEMPLATE.format(
        brand_intel=json.dumps(brand_intel, indent=2),
        design_brief=json.dumps(design_brief, indent=2),
    )


def call_gemini(prompt: str, model: str) -> str:
    """Call the Gemini API and return the generated text."""
    try:
        import google.generativeai as genai
    except ImportError:
        sys.exit(
            "ERROR: google-generativeai is not installed.\n"
            "Run:  pip install google-generativeai"
        )

    api_key = os.environ.get("GOOGLE_API_KEY")
    if not api_key:
        sys.exit(
            "ERROR: GOOGLE_API_KEY environment variable is not set.\n"
            "Get a key at https://aistudio.google.com/app/apikey"
        )

    genai.configure(api_key=api_key)

    gemini = genai.GenerativeModel(
        model_name=model,
        system_instruction=SYSTEM_PROMPT,
    )

    print(f"[stitch] Calling Gemini model: {model} …")
    response = gemini.generate_content(
        prompt,
        generation_config=genai.types.GenerationConfig(
            temperature=0.4,
            max_output_tokens=32768,
        ),
    )
    return response.text


def extract_html(raw: str) -> str:
    """Strip markdown fences if the model wrapped the output anyway."""
    match = re.search(r"```(?:html)?\s*(<!DOCTYPE.*?)</?\s*```", raw, re.DOTALL | re.IGNORECASE)
    if match:
        return match.group(1).strip()
    # If the response starts with <!DOCTYPE directly, return as-is
    stripped = raw.strip()
    if stripped.lower().startswith("<!doctype"):
        return stripped
    return raw  # return whatever we got


def write_output(html: str, out_dir: Path) -> None:
    out_dir.mkdir(parents=True, exist_ok=True)
    out_file = out_dir / "stitch-output.html"
    out_file.write_text(html, encoding="utf-8")
    print(f"[stitch] Written → {out_file}")


def main() -> None:
    parser = argparse.ArgumentParser(description="Connect to Stitch by Google via Gemini API")
    parser.add_argument("--out-dir", default="website-redesign", help="Output directory")
    parser.add_argument("--model", default="gemini-2.5-pro", help="Gemini model name")
    parser.add_argument("--dry-run", action="store_true", help="Print prompt only, no API call")
    args = parser.parse_args()

    root = Path(__file__).parent
    brand_intel = load_json(root / "brand-intel.json")
    design_brief = load_json(root / "design-brief.json")

    prompt = build_prompt(brand_intel, design_brief)

    if args.dry_run:
        print("── SYSTEM PROMPT ──────────────────────────────────")
        print(SYSTEM_PROMPT)
        print("\n── USER PROMPT (first 2000 chars) ─────────────────")
        print(prompt[:2000])
        return

    html = call_gemini(prompt, model=args.model)
    html = extract_html(html)
    write_output(html, Path(args.out_dir))
    print("[stitch] Done.")


if __name__ == "__main__":
    main()
