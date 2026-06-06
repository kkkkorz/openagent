# PowerPoint Content Quality Reference

Use this reference to improve the quality of generated presentation content. It adapts the structured slide-planning discipline used by high-quality lesson and deck generators, while staying compatible with the `pptx_write` PptxGenJS workflow.

## Core Principle

Slides are visual aids, not lecture scripts. A strong deck separates:

- on-slide content: keywords, short phrases, labels, data, diagrams, formulas, and concise claims
- speaker notes: context, transitions, examples, caveats, and spoken explanation

If a sentence sounds like something the presenter would say aloud, move it to notes or rewrite it as a shorter visual phrase.

## Content Rules

1. One slide, one job.
   A slide should orient, compare, explain, prove, decide, summarize, or prompt action. Mixed-purpose slides become crowded.

2. Use message titles.
   Prefer "Three bottlenecks explain the delay" over "Project Status".

3. Keep text scannable.
   Use 3-5 points per slide. Keep each point under about 14 English words or 28 Chinese characters when practical.

4. Use specific nouns and verbs.
   Replace "Improve efficiency" with "Reduce review time from days to hours" when the user's context supports it.

5. Match visuals to information.
   - quantities: chart, stat callout, or annotated number
   - comparisons: table, matrix, or side-by-side cards
   - sequences: timeline or process flow
   - systems: diagram with labeled parts and arrows
   - concepts: icon cards, metaphor image, or before/after
   - decisions: options table, scorecard, or recommendation slide

6. Vary slide rhythm.
   A typical 8-slide deck might use: cover, agenda, section, two-column, chart, cards, process, summary.

7. Preserve audience fit.
   Executive decks need conclusions, implications, and decisions. Educational decks need scaffolding, examples, and checks for understanding. Technical decks need precision, assumptions, and tradeoffs.

8. Avoid speaker identity on slides.
   Do not write "teacher's tip", "my advice", or named-presenter comments as slide content. Use neutral labels such as "Tip", "Note", "Key Takeaway", or "Reminder".

## Layout Content Patterns

### Cover

- Big literal title or offer
- Short subtitle with context
- Optional date, audience, or owner

### Section Divider

- Section label
- One claim that previews the section
- Minimal body text

### Two Column

- Left: claim and 2-3 supporting points
- Right: visual evidence, image, chart, or diagram
- Title states the takeaway

### Card Grid

- 2x2 or 3x2 cards
- Each card has icon, header, and one short body line
- Cards should be parallel in grammar and length

### Timeline or Process

- 3-6 steps
- Each step has verb-led title and short description
- Use arrows or connectors only when they clarify sequence

### Chart Slide

- Title states what the data means
- Chart uses minimal legend and direct labels when possible
- Add one or two callouts for interpretation

### Table Slide

- Use for criteria-based comparison
- Keep columns few enough to read
- Highlight the recommended or important row

### Summary

- 3 takeaways or 3 next actions
- Avoid repeating the agenda
- Make the final implication clear

## Language and Terminology

- Follow the language of the user's request unless explicitly asked otherwise.
- Preserve product names, code terms, model names, and established acronyms in their usual form.
- For bilingual or learning contexts, introduce terminology once, then use consistently.
- Use audience-appropriate vocabulary; do not overcomplicate beginner decks.

## Pre-Script Quality Gate

Before writing PptxGenJS code, verify the deck spec:

- The deck thesis is clear.
- Every slide has a message and role.
- No slide has more than one dense text block.
- Slide titles are not generic labels only.
- At least 70% of content slides include a meaningful visual element.
- Consecutive slide layouts are not repetitive.
- Notes carry the deeper explanation.
- No placeholders or filler phrases remain.

## Final QA Gate

After generating the PPTX and reading it back:

- Slide order follows the planned narrative.
- Text content matches the requested language.
- Important slide titles and takeaways are present.
- Notes are present when the on-slide text is intentionally concise.
- No leftover scaffold labels such as "TODO", "placeholder", "insert chart", or "more details" appear.
