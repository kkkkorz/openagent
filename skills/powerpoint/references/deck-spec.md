# Deck Specification Reference

Use this reference before writing a PptxGenJS script. The goal is to plan the presentation as structured content first, then render it.

## Deck Spec Shape

Create this structure mentally or in `ctx.data` when helpful:

```json
{
  "title": "Deck title",
  "audience": "Who will read or hear this",
  "goal": "What the deck should make the audience understand or do",
  "language": "Language and terminology policy",
  "thesis": "One sentence that the deck proves",
  "style": {
    "tone": "executive|educational|technical|sales|workshop|research",
    "palette": ["primary", "support", "accent"],
    "typography": "font direction",
    "motif": "repeated visual device"
  },
  "slides": [
    {
      "type": "cover|agenda|section|two_column|cards|timeline|process|chart|table|case|summary|closing",
      "role": "orient|compare|explain|prove|decide|summarize|act",
      "message": "The one idea this slide must land",
      "title": "Conclusion-oriented slide title",
      "content": ["short on-slide point"],
      "visual": {
        "kind": "icon|diagram|chart|table|image|callout|timeline|none",
        "description": "What the visual shows and why"
      },
      "speakerNotes": "Optional fuller explanation"
    }
  ]
}
```

## Planning Steps

1. Infer audience and situation.
   Decide whether the deck is for an executive decision, teaching, sales, research, internal planning, or public storytelling.

2. Write the thesis.
   A good deck is not a pile of related facts; it has a point of view.

3. Choose slide roles.
   Each slide should do one job: orient, compare, explain, prove, decide, summarize, or prompt action.

4. Select slide types.
   Use varied slide types. Avoid repeating title-plus-bullets for more than two consecutive slides.

5. Assign visuals deliberately.
   If the content has numbers, use a chart or stat callout. If it has steps, use a process. If it has alternatives, use a table or comparison cards.

6. Move narration into notes.
   On-slide text should be short and scannable; speaker notes can carry nuance and explanation.

## Slide Type Guidance

- `cover`: title, subtitle, context, date or owner when relevant.
- `agenda`: 3-5 sections with short labels.
- `section`: transition slide with a strong section claim.
- `two_column`: explanation plus evidence, image, diagram, or comparison.
- `cards`: 2-6 parallel ideas, each with icon/header/one-sentence body.
- `timeline`: events, milestones, roadmap, or phased plan.
- `process`: causal chain, workflow, decision path, or system flow.
- `chart`: quantitative evidence with a takeaway title.
- `table`: structured comparison, criteria matrix, options, or risks.
- `case`: example, scenario, before/after, or mini-story.
- `summary`: key takeaways, decision, risks, or next steps.
- `closing`: final statement and call to action.

## Spec Quality Checklist

- The deck has one thesis, not just a topic.
- Every slide has one message.
- Slide titles state the takeaway when possible.
- Content uses short phrases, not paragraphs.
- Detailed explanation is in speaker notes.
- The layout sequence has rhythm: simple, dense, visual, summary.
- Visual choices match the information type.
- The language matches the user request and audience.
- No placeholder, filler, or generic business wording remains.
