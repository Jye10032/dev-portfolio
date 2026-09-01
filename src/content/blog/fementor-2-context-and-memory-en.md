---
title: 'FEMentor (II): Context Compression and Long-Term Memory'
publishDate: '2026-03-17'
type: article
draft: false
lang: en
publicSlug: 'fementor-2-context-and-memory'
translationKey: 'fementor-2-context-and-memory'
tags: ['FEMentor', 'Context Engineering', 'Long-Term Memory']
excerpt: 'Earlier answers cannot stay in the prompt forever, but discarding them outright makes the interviewer forget what it has already learned. FEMentor separates in-session context from memory that persists across interviews.'
readingTime: 7
---

As a mock interview continues, its history accumulates questions, answers, scores, and identified weaknesses. Including every original response in each LLM request steadily increases both cost and noise. Keeping only the latest few turns creates the opposite problem: the interviewer forgets information it had already established.

FEMentor addresses this by separating short-term context from long-term memory.

## Recent Turns and Earlier Summaries

`buildInterviewContextWindow` reads the current interview's answers in reverse chronological order. Within a character budget, recent turns retain the original question, answer, score, and weaknesses. Earlier turns that exceed the budget move into `overflowTurns` and are compressed into this structure:

```json
{
  "summary": "Summary of earlier interview history",
  "open_points": ["Questions that still need to be addressed"]
}
```

The current implementation allocates approximately 2,200 characters to recent original turns and caps the summary at roughly 900 characters. The final context combines the earlier summary with the recent verbatim history.

This is not lossless compression. It deliberately gives up word-for-word reproduction in favor of information that later scoring and follow-up questions still need. `open_points` also prevents a summary from recording only what has already happened while forgetting what remains unresolved.

## Context Must Survive LLM Failures

Compression should not become a new single point of failure in the main interview flow. FEMentor therefore keeps rule-based fallbacks for both summaries and long-term memory. Even when a model call fails, the system can still produce a simpler result from the topics discussed and the strengths and weaknesses it has identified.

The fallback may not match the quality of a model-generated summary, but it ensures that one failed compression request does not interrupt the entire interview.

## Long-Term Memory Is Generated After the Session

Short-term context supports the interview in progress. Long-term memory is distilled during the retrospective stage. Instead of preserving every slip of the tongue, it records structures that remain useful across sessions:

- `stable_strengths`: strengths demonstrated consistently across multiple turns;
- `stable_weaknesses`: weaknesses that appear repeatedly;
- `project_signals`: evidence of project-related ability;
- `role_fit_signals`: signals relevant to the target role;
- `recommended_focus`: priorities for the next stage of practice.

The structured result drives retrospectives and future practice. A Markdown memory file serves only as a supplementary log, not as the sole source of truth.

## Memory Is First a Lifecycle Design Problem

I ultimately decided that "remember every conversation" was the wrong goal. The current session needs fidelity, older turns need compression, and information carried across sessions needs stability. These three categories have different lifecycles.

The value of a memory system does not come from retaining the most text. It comes from knowing which information remains useful at which point in time, and how much capability the system can preserve when the model fails.
