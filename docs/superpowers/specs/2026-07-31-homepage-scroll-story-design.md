# misaka.design Homepage Scroll Story Design

## Summary

Turn the existing homepage into a seven-scene native-scroll narrative inspired by pi.dev. On desktop, a sticky stage on the left automatically performs readable pseudo-classical-Chinese commands while the right side reveals the site's identity, topics, living-note model, current activity, and recommended reading. The stage begins as a modern terminal and gradually becomes a horizontal handscroll. After the visual climax, the sticky experience releases into the site's normal writing and topic navigation.

The experience is a scripted presentation. Visitors scroll to advance it, but they never type commands or operate a real terminal.

## Goals

- Give `misaka.design` a distinctive first-visit experience without abandoning its writing-first identity.
- Explain what the site is before explaining the author: a place where ideas continue to grow.
- Use pseudo-classical-Chinese commands as a personal narrative device that remains understandable to modern readers.
- Preserve the current Astro content collections, routes, navigation, avatar slot, and static deployment model.
- Keep the first five scenes restrained and readable, then concentrate the visual expression in one Eastern handscroll climax.
- End in a conventional browsing surface so repeat visitors can reach writing quickly.

## Non-goals

- No real command parser, terminal input, autocomplete, command history, or clickable commands.
- No arbitrary CSS execution. Every visual change maps to a finite, predefined scene.
- No full-page pagination or vertical scroll snapping.
- No CMS, database, live AI generation, or network dependency.
- No replacement of the site's article, note, tag, sticky-wall, RSS, or theme systems.
- No final avatar generation in this phase. The current avatar slot remains replaceable.

## Experience principles

### Modern content, pseudo-classical shell

The terminal commands carry the classical tone. The actual homepage copy remains concise modern Chinese so it does not become difficult to scan or feel like a costume theme.

### Quiet first, expressive later

Scenes one through five use a stable editorial grid, restrained color, and small transitions. Scene six releases the Eastern handscroll treatment: paper, ink, vermilion, title slips, annotations, and a personal seal. Scene seven immediately restores a calm browsing layout.

### Scroll controls time, not interaction

Native scrolling determines which scene is active. Entering a scene starts an automatic command sequence: type the command, show a short working state, apply the scene, and reveal its content. Scrolling backward restores the previous scene deterministically instead of replaying long animations.

## Page architecture

### Desktop

The story region uses two columns inside a wider homepage-only container:

- Left: a sticky stage, approximately 40% of the available width.
- Right: seven vertically stacked narrative sections, approximately 60% of the width.
- Each section provides enough vertical runway for reading and activation without behaving like a forced viewport page.
- The sticky stage stays inside its column. The horizontal handscroll expands within that allocated stage and never covers right-side content.
- After scene seven, the story region ends and the stage releases. The existing featured writing, latest updates, and topic entry points continue as a normal document flow.

The global header, navigation, footer, and existing routes remain intact. The homepage may opt into `BaseLayout`'s wide variant, but other pages keep the current narrow reading width.

### Mobile and tablet

At widths below the desktop breakpoint, the two-column sticky treatment is removed:

- Each command stage appears inline above its related content.
- The terminal-to-scroll transformation is represented as a short horizontal scroll fragment, not an element wider than the viewport.
- There is no horizontal page scrolling.
- Commands may type only on first entry; revisiting a scene displays its completed state immediately.
- Normal writing navigation follows the story without an artificial spacer.

## Seven-scene narrative

### Scene 1: Open the garden

Command:

```wenyan
吾有一园，名曰「misaka.design」。启之。
```

Terminal response:

```text
园门已启。
```

Right-side content:

- Title: `思想生长之处`
- Supporting copy: `收录设计、AI、前端，以及尚未想明白的问题。`
- A square anime-avatar placeholder in a bookplate treatment.
- The avatar remains clear and lightly filtered: reduced saturation and contrast, warm paper tint, soft shadow, and no heavy vintage yellowing.

Visual state:

- Modern terminal with dark neutral background, monospace text, fine border, and restrained status color.
- Right side uses the site's modern editorial typography and neutral paper background.

### Scene 2: State the interests

Command:

```wenyan
列吾所好：设计、智能、前端、成长。陈之。
```

Terminal response:

```text
四志已列。
```

Right-side content:

- `设计如何解决问题`
- `AI 如何参与创造`
- `代码如何承载体验`
- `人在实践中如何成长`

Visual state:

- The four themes enter as an unframed editorial list or grid, not a set of decorative cards.
- A restrained accent derived from the future avatar may mark indexes, links, or short rules.
- The terminal is still recognizably modern.

### Scene 3: Show growth states

Command:

```wenyan
此园非库，乃思绪生长之地。润其形。
```

Terminal response:

```text
脉络渐生。
```

Right-side content:

- `种子`
- `生长中`
- `已成文`
- `持续修订`

These are explanatory content states, not a promise that every state already has populated public entries. Existing article and note data remains authoritative.

Visual state:

- Fine connectors, revision marks, or metadata establish the garden metaphor without drawing a complex knowledge graph.
- The terminal background warms toward paper white and gains a subtle paper texture.

### Scene 4: Show the present

Command:

```wenyan
吾有所行，亦有所问。示其近况。
```

Terminal response:

```text
近况已录。
```

Right-side content:

- `最近在做`
- `最近在读`
- `最近思考`

Each group shows at most one real item. Empty groups are omitted rather than filled with invented content.

Visual state:

- The terminal title bar and window controls begin to fade.
- Status marks start resembling title slips or marginal notes while all text remains horizontal and readable.

### Scene 5: Recommend a starting point

Command:

```wenyan
择文三篇，以待初访之人。置于前。
```

Terminal response:

```text
荐读已置。
```

Right-side content:

- Up to three real entries: one representative long-form article, one recent article, and one short note.
- If fewer suitable entries exist, render fewer entries. Do not duplicate posts or publish draft/sample content to satisfy the count.
- Existing featured and latest-post helpers remain the source of truth unless the implementation plan introduces a narrow selector dedicated to this scene.

Visual state:

- Syntax colors collapse toward ink-black hierarchy.
- The caret becomes a small vermilion annotation point.
- The layout hints at an impending handscroll but remains structurally stable.

### Scene 6: Unroll the handscroll

Command:

```wenyan
今添吾色，易其字，展此长卷。
```

Terminal response:

```text
墨色已定。长卷已展。
```

Right-side content:

- The existing identity, themes, growth states, current activity, and recommended entries are recomposed as one visual index rather than introducing new information.
- Display titles may adopt a Song-style or FangSong-style Chinese serif stack. Body copy stays in the site's readable modern text stack.

Visual state:

- The left terminal completes its transformation into a horizontal handscroll.
- Main palette: paper white, ink black, and a small amount of vermilion red.
- Title slips, marginal annotations, thin ink rules, and slight organic offsets replace modern terminal chrome.
- The square avatar gains a subtle seal-album border and faint paper grain. Its image remains recognizable.
- A vermilion square seal reading `御坂` lands near a title slip, never over the avatar or body copy.
- The seal uses a short press and restrained ink-spread effect, with no bounce.
- The handscroll remains inside the left stage; the sense of unfolding comes from internal clipping and translation rather than uncontrolled width growth.

### Scene 7: Enter the garden

Command:

```wenyan
园门既开，请君自游。
```

Terminal response:

```text
请君自游。
```

Right-side content:

- A concise transition into the normal site surfaces.
- Clear links to writing, topics, and the sticky wall.

Visual state:

- The handscroll rolls up and the sticky stage releases naturally.
- The page returns to the calm editorial system used by the rest of the site.
- A small `御坂` seal may remain beside the wordmark or in the footer as a persistent personal signature, subject to visual validation during implementation.

## Terminal and handscroll behavior

The stage is a finite state machine with seven named scenes. Each scene owns:

- command text;
- completion text;
- stage appearance;
- right-side content state;
- optional one-time entrance motion.

On forward activation:

1. Type the command automatically.
2. Show a short `推演中…` or equivalent working state for roughly 300–600 ms.
3. Apply the target scene styles.
4. Reveal the related right-side content.
5. Leave the completed command visible until the next activation.

Typing is decorative, not the source of application state. The final scene state must be set directly so fast scrolling, page restoration, and backward navigation never depend on every character animation having completed.

## Scroll activation

- Use native document scrolling.
- Observe each right-side scene against a stable activation line around the middle-to-lower portion of the viewport.
- Use `IntersectionObserver` for coarse visibility and a passive scroll listener scheduled through `requestAnimationFrame` only where progress-dependent handscroll motion is required.
- Store the active scene on the story root as a finite attribute such as `data-home-scene="open"`.
- CSS variables may express bounded progress values, but the implementation must not construct or execute CSS from command strings.
- The first scene initializes immediately when the story enters the viewport.
- The final scene includes enough release runway for the sticky stage to end without a jump.

## Content and data rules

- Pull public entries from the existing Astro `blog` collection and continue excluding `draft: true` content.
- Reuse the established distinctions between long-form articles and notes.
- Keep tags as topic-entry destinations.
- Keep the sticky wall as a separate route and surface it only as an entry point in scene seven.
- Keep all scripted command and scene copy in a small typed data structure so copy can change without rewriting event logic.
- Keep temporary `最近在做 / 最近在读 / 最近思考` content close to homepage configuration rather than embedding it throughout the template.
- Render empty optional groups safely; the narrative must remain coherent even with a small content inventory.

## Visual system

### Base state

- Neutral paper-like light background and charcoal dark mode.
- Modern sans-serif body typography and restrained serif emphasis.
- Thin rules, strong whitespace, and unframed content groups.
- No nested cards, decorative blobs, or oversized marketing hero.

### Handscroll state

- Paper white rather than beige as the dominant surface.
- Ink black for text and structure.
- Vermilion only for the `御坂` seal, caret/annotation point, and very small emphasis marks.
- Subtle raster or CSS texture is acceptable only if it does not reduce contrast or add visible tiling artifacts.
- Slight offsets and unfolding motion are permitted; text must never rotate enough to impair reading.

### Dark mode

The handscroll does not become a bright white flash in dark mode. Use a dark ink-paper interpretation with warm charcoal surfaces, pale text, and restrained vermilion. The conceptual transformation remains, but user theme preference wins over literal paper color.

## Accessibility and fallbacks

- The narrative content exists in semantic HTML and remains readable with JavaScript disabled.
- Commands are presentation text, not form fields. Do not expose a fake editable textbox to assistive technology.
- Scene headings follow a valid heading hierarchy.
- Keyboard users can reach all links in document order without interacting with the stage.
- Focus indicators remain visible in both editorial and handscroll states.
- Decorative paper grain, scroll rods, and seal effects are hidden from accessibility APIs.
- Color is never the only indicator of content state.
- The avatar receives meaningful alt text once the final image is supplied.

### Reduced motion

With `prefers-reduced-motion: reduce`:

- Commands appear complete with no character typing.
- Scene content uses no translate, scale, roll, ink-spread, or long fades.
- The terminal-to-handscroll change becomes an immediate style swap.
- Sticky behavior may remain if it does not create motion discomfort, but inline static presentation is an acceptable fallback.

### JavaScript failure

- Show all scene copy in normal document order.
- Keep the stage at its initial or completed static appearance.
- Continue rendering featured writing, latest updates, tags, and navigation normally.

## Component boundaries

The implementation should keep responsibilities separate:

- Homepage page: fetches content and composes the story plus normal browse sections.
- Story shell: owns desktop/mobile layout and semantic scene markup.
- Stage component: renders terminal, working state, handscroll chrome, and seal.
- Scene data module: owns commands, responses, scene identifiers, and static copy.
- Client script: activates finite scenes and manages bounded progress only.
- Homepage styles: own story-specific layout and transformations without leaking into article pages.

Exact filenames should follow existing Astro conventions and will be finalized in the implementation plan after checking adjacent component and script patterns.

## Performance constraints

- Do not introduce a frontend framework solely for the story.
- Prefer Astro-rendered HTML plus a small vanilla client script.
- Avoid per-scroll layout reads across many elements; gather geometry in a scheduled frame and write state once.
- Do not load a large animation library.
- Lazy-load the avatar and optional texture where doing so does not cause first-scene layout shift.
- Give the sticky stage and avatar stable dimensions across states.

## Verification requirements

- Build succeeds with the repository's existing Astro build command.
- Desktop checks cover initial scene, middle scenes, handscroll climax, sticky release, backward scrolling, and fast scrolling.
- Mobile checks confirm inline order, no horizontal overflow, no overlapping text, and access to normal browse links.
- Light and dark themes preserve readable contrast in every scene.
- Reduced-motion mode removes typing and transformation motion.
- JavaScript-disabled rendering preserves all essential content and links.
- Draft/sample posts do not leak into recommendations.

## Success criteria

- A first-time visitor understands within the first scene that `misaka.design` is a place where ideas grow.
- The terminal feels automatic and intentional, never like an unfinished interactive control.
- The seven scenes form a clear progression from identity to interests, growth, present activity, recommended reading, personal expression, and open exploration.
- The handscroll climax feels Eastern and personal without turning the entire site into an antique-themed interface.
- After the story, normal writing discovery is immediate and familiar.
- The implementation remains static-hosting friendly and consistent with the existing Dante/Astro codebase.

## Deferred decisions

- Final anime-avatar artwork and crop.
- Exact Chinese display font after licensing and loading-cost review.
- Exact paper texture source and whether texture is needed after browser testing.
- Whether the small `御坂` seal persists beside the wordmark or in the footer after scene seven.
- Final real entries for current activity and recommended reading at publication time.
