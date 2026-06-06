---
name: powerpoint
description: Create designed, editable PowerPoint .pptx presentations with PptxGenJS. Use when the user asks to create, generate, update, or inspect a deck, slide deck, presentation, or .pptx file.
---

# PowerPoint

Use this skill whenever a PowerPoint deck is involved. For new decks, first design a structured deck specification, then pass a trusted PptxGenJS build script to the `pptx_write` tool.

## Workflow

1. Infer the audience, goal, language, level of detail, and likely presentation setting from the user's request. Make conservative defaults when details are missing.
2. Create an internal deck specification before writing code: deck thesis, visual system, slide rhythm, slide types, per-slide message, on-slide content, visual treatment, and speaker notes.
3. Check the deck specification for content quality: each slide has one job, titles are conclusion-oriented, slide text is scannable, layouts vary, and visuals support the message.
4. Write JavaScript module content that exports `default async function build(pptx, ctx)` or named `build(pptx, ctx)`.
5. In the script, add slides directly with PptxGenJS. Do not generate HTML for this workflow.
6. Call `pptx_write` with `path`, `script`, optional `assets_dir`, and optional `data`.
7. Verify the result with `pptx_read`; for visual QA, convert the PPTX to images if the environment has LibreOffice and Poppler.

## Planning Gate

Do not jump straight from the user request to PptxGenJS code. First form a compact deck spec, even if it remains internal. The spec is the quality control layer: it prevents repetitive title-plus-bullet decks and keeps the script focused on rendering a coherent presentation.

When a deck is more than three slides, use `deck-spec.md` and `content-quality.md` as the planning references. For API syntax, use `pptxgenjs.md`.

## Script Creation

- Put the complete JavaScript module in the `script` argument.
- Do not use `local_file_write` or shell commands to create a temporary `.mjs` file for this workflow.
- If revising a deck, update the `script` content and call `pptx_write` again.

## Tool Contract

```json
{
  "tool": "pptx_write",
  "arguments": {
    "path": "deck.pptx",
    "script": "export default async function build(pptx, ctx) {\\n  pptx.layout = \"LAYOUT_WIDE\";\\n}",
    "assets_dir": "/absolute/path/to/assets",
    "data": {"title": "Quarterly Review"}
  }
}
```

The worker creates the PptxGenJS instance and writes the output file. The script only adds slides and content.

```javascript
export default async function build(pptx, ctx) {
  pptx.layout = "LAYOUT_WIDE";
  pptx.author = "OpenAgent";

  const slide = pptx.addSlide();
  slide.background = { color: "FFFFFF" };
  slide.addText("Title", {
    x: 0.6, y: 0.4, w: 8, h: 0.6,
    fontSize: 36, bold: true, color: "1F2937",
    margin: 0,
  });
  slide.addNotes("speaker notes");
}
```

`ctx` includes:

- `ctx.data`: JSON data passed from the tool call.
- `ctx.assetsDir`: resolved asset directory.
- `ctx.outPath`: final PPTX path.
- `ctx.resolveAsset("image.png")`: absolute path under `assets_dir`.
- `ctx.imageData("image.png")`: base64 image data URL.
- `ctx.iconSvgData("check", "16A34A")`: Font Awesome solid icon as SVG data.

## Design Rules

- Avoid plain white bullet decks. Every slide should have a visual element: shape, image, chart, icon, timeline, stat callout, or diagram.
- Vary layouts across the deck: title, divider, two-column, card grid, process flow, quote/callout, and conclusion.
- Pick topic-specific colors. Use one dominant color, one or two supporting tones, and one accent.
- Use strong hierarchy: titles around 36-44 pt, section labels around 20-24 pt, body text around 14-18 pt.
- Keep at least 0.5 inch margins and consistent gaps around 0.3-0.5 inch.
- Use editable text wherever practical; use images for photos, screenshots, logos, or complex visual backgrounds.
- Add speaker notes when useful; `pptx_read` can surface them later.
- Slides are visual aids, not lecture scripts. Keep on-slide copy concise; move detailed explanation to notes.
- Prefer message titles over topic labels. Use "Retention improves after onboarding fixes" instead of "Retention".
- Every slide needs a clear information role: orient, compare, explain, prove, decide, summarize, or prompt action.
- Use charts for quantities, tables for structured comparison, timelines/process flows for sequences, and card grids for parallel ideas.
- Never include placeholder text, speaker self-references, or generic filler such as "More details here".

## PptxGenJS Reference

For API patterns, chart examples, bullets, image sizing, icons, and common file-corruption pitfalls, load `pptxgenjs.md`.

## Content References

- Load `deck-spec.md` when planning a new deck or revising the structure of an existing deck.
- Load `content-quality.md` when the user asks for a polished, executive, educational, sales, research, or high-stakes deck.
- Load `pptxgenjs.md` when implementing the final PptxGenJS script.

## Required QA

- Run `pptx_read` on the generated file and check slide order, missing text, typo risk, and notes.
- Inspect generated XML or render slides when visual precision matters.
- Watch for overlap, text overflow, low contrast, cramped spacing, repeated layouts, and leftover placeholder text.
- Check that slide titles, key messages, and notes match the user's requested language and level of detail.
- Confirm that at least 70% of non-cover slides use a layout richer than title-plus-bullets.
- If a visual issue is found, edit the `.mjs` script and rewrite the PPTX.
