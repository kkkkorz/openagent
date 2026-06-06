# HTML Slides Reference

Use this reference when creating visual-first PowerPoint decks with `pptx_write` HTML mode. This mode renders each HTML slide in a headless browser, screenshots it as PNG, and embeds the image full-slide in a `.pptx`.

## When to Use

Use HTML mode when:

- The user wants a polished, modern, highly visual deck.
- CSS layout, gradients, cards, complex grids, or precise typography matter.
- Fast visual composition is more important than PowerPoint editability.
- The deck is for presenting or sharing as final output rather than heavy manual editing.

Use PptxGenJS script mode instead when:

- The user needs editable text, tables, charts, and shapes in PowerPoint.
- The deck will be revised manually by non-technical users.
- File size must stay small.

## Tool Contract

Single slide:

```json
{
  "tool": "pptx_write",
  "arguments": {
    "path": "deck.pptx",
    "width": 1280,
    "height": 720,
    "html": "<!doctype html><html>...</html>"
  }
}
```

Multiple slides:

```json
{
  "tool": "pptx_write",
  "arguments": {
    "path": "deck.pptx",
    "width": 1280,
    "height": 720,
    "assets_dir": "/absolute/path/to/assets",
    "slides": [
      {
        "title": "Cover",
        "html": "<!doctype html><html>...</html>",
        "notes": "Opening narration."
      }
    ]
  }
}
```

Defaults:

- `width`: 1280
- `height`: 720
- Aspect ratio is preserved in the generated PPTX layout.
- Relative image/font paths in HTML resolve from `assets_dir` when provided.

## HTML Requirements

- Provide complete HTML for each slide, including `<!doctype html>`, `<html>`, `<head>`, `<meta charset="utf-8">`, and `<style>`.
- Set fixed slide dimensions in CSS matching the viewport:

```html
<style>
  html, body {
    margin: 0;
    width: 1280px;
    height: 720px;
    overflow: hidden;
  }
  .slide {
    width: 1280px;
    height: 720px;
    position: relative;
    box-sizing: border-box;
  }
</style>
```

- Use system fonts or local assets. Avoid remote web fonts unless the environment can access them.
- Keep all content inside the slide bounds. Anything outside the viewport will be clipped.
- Use SVG, CSS shapes, icon text, or local images for visual elements.
- Use speaker notes in the `notes` field instead of placing long narration on the slide.

## Design Guidance

- Treat each HTML page as a finished slide, not a scrolling web page.
- Use CSS grid/flex for layout, but keep dimensions deterministic.
- Use strong hierarchy: title, key message, supporting evidence, visual.
- Prefer concise, high-contrast text.
- Avoid tiny text; body copy should usually be at least 22px at 1280x720.
- Use 48-72px outer margins unless making an intentional full-bleed design.
- Vary slide layouts across the deck.

## Tradeoffs

HTML mode creates screenshot-based slides:

- Visual fidelity: high
- PowerPoint editability: low
- Text selection/editing: unavailable
- Speaker notes: supported
- Local image assets: supported through `assets_dir`

Make this tradeoff clear when the user asks for an editable deck.
