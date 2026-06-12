# Hero repositioning — generalist architect (2026-06-12)

## Problem

The hero headline ("Helping businesses scale with AI…") positions Sebin as an
AI-vertical specialist. The intended read is the opposite: a generalist
engineer-turned-EM who can be entrusted with *any* technical problem — legacy
migrations, Kafka streaming, data pipelines, mobile and web, crawlers and
automation, AI. One look should conclude "hand this person the problem."

## Direction (user-approved)

Blend of "Fixer" headline energy and "Architect" trust scaffolding. The page
never self-praises ("genius", "talented") — confidence is carried by specific
range stated calmly. The descent narrative is kept: the summit framing IS the
mastery claim.

## Copy spec

- **Kicker**: unchanged (factual title line).
- **H1**: `If it runs on computers, I can <span class="hi">build it, fix it,
  or scale it</span>.` Highlight moves from "AI" to the verb triplet.
- **Sub**: "Engineering manager who never stopped being an engineer.
  [9+ years] of architecting end to end — legacy migrations, Kafka streaming,
  data pipelines, mobile and web, crawlers and automation, and now AI —
  because at some point I've built every layer of it myself. The story is told
  from the summit down — scroll to descend." (keeps the `#experience` span)
- **Chips**: 9 → 11. AI / ML · LLM orchestration · Kafka streaming ·
  Data pipelines · Legacy migrations · Mobile development · Web platforms ·
  Crawlers & automation · DevOps · Kubernetes · Team leadership.
  Denser summit reinforces the top-heavy density gradient.
- **`<title>` / og / twitter titles**: "Sebin P Johnson — Engineering Manager
  · Software Architect" (positioning lives in the title, jobTitle stays
  factual).
- **Meta description**: generalist-architect thesis + the headline line.
- **og/twitter descriptions**: headline line + range + summit framing.
- **JSON-LD**: add `knowsAbout` array mirroring the chips; `jobTitle`
  unchanged.
- **llms.txt**: opening blockquote rewritten to the same thesis.

## Invariants

- Zero CJK / cultivation jargon (grep `realm|cultivat|\bqi\b|\bdao\b|[一-鿿]`
  stays empty on dist).
- Section IDs, animation system, lower chapters untouched.
- 390px: chip cloud must not blow the hero past ~92svh.
- og.png regenerated from the new hero.
