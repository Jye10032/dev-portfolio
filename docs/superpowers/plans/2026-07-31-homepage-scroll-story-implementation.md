# misaka.design Homepage Scroll Story Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a seven-scene, native-scroll homepage narrative in which an automatic pseudo-classical-Chinese terminal transforms into a horizontal Eastern handscroll before releasing visitors into normal writing discovery.

**Architecture:** Keep Astro responsible for semantic HTML and content selection, with no client framework. Put immutable scene copy in a typed data module, render the desktop sticky stage and mobile inline stages through focused Astro components, and drive only finite `data-home-scene` states from a small TypeScript controller. Keep story styles isolated in a homepage stylesheet and preserve the existing featured/latest/topic sections as the non-JavaScript and post-story browsing surface.

**Tech Stack:** Astro 5, Astro content collections, TypeScript, vanilla DOM APIs, Tailwind CSS 4, CSS custom properties, Vitest 4, jsdom.

---

## File map

### Scene model and selection

- Create: `src/data/home-story.ts` - typed seven-scene command, response, labels, interests, growth states, and current-activity copy.
- Modify: `src/data/site-config.ts` - add truthful optional `homeNow` values close to site configuration.
- Modify: `src/types.ts` - define the optional current-activity configuration shape.
- Modify: `src/utils/data-utils.ts` - select up to three unique public recommendations without inventing content.
- Create: `tests/home-story/data-utils.test.ts` - verify recommendation order, uniqueness, fallback, and empty inventories.

### Story rendering

- Create: `src/components/home/HomeStoryStage.astro` - render the automatic terminal/handscroll stage and decorative seal.
- Create: `src/components/home/HomeStoryScene.astro` - render one semantic scene and its mobile inline command stage.
- Create: `src/components/home/HomeStory.astro` - compose the seven scenes and pass real content into recommendation/current-activity slots.
- Modify: `src/pages/index.astro` - fetch public posts, mount the story, retain normal featured/latest/topic browsing, and opt into the wide homepage layout.
- Modify: `src/layouts/BaseLayout.astro` - add an optional body/page class contract if homepage story styling needs a root hook.

### Behavior

- Create: `src/utils/home-story-controller.ts` - finite scene activation, typing lifecycle, backward/fast-scroll restoration, reduced-motion handling, and cleanup.
- Create: `src/scripts/home-story.ts` - initialize and destroy controllers on Astro page lifecycle events.
- Create: `tests/home-story/controller.test.ts` - jsdom tests for initialization, scene activation, stale-animation cancellation, backward scrolling, and reduced motion.

### Styling and verification

- Create: `src/styles/home-story.css` - desktop sticky grid, mobile inline fallback, terminal-to-handscroll states, seal treatment, dark mode, no-JavaScript baseline, and reduced motion.
- Modify: `src/pages/index.astro` - import story CSS and client script.
- Modify: `package.json` - expose focused `test` and `test:home-story` scripts using the already-installed Vitest dependency.
- Use: `npm run test:home-story`, `npm run test`, `npm run build`, and `npm run dev` for verification.

---

## Task 1: Define typed scenes and homepage activity data

**Files:**
- Create: `src/data/home-story.ts`
- Modify: `src/data/site-config.ts`
- Modify: `src/types.ts`
- Test: `npm run build`

- [ ] **Step 1: Add the optional current-activity type**

Add this shape to `src/types.ts` and add `homeNow?: HomeNowItem[]` to `SiteConfig`:

```ts
export type HomeNowItem = {
    label: '最近在做' | '最近在读' | '最近思考';
    text: string;
    href?: string;
};
```

Keep this list optional so an empty or not-yet-curated homepage remains truthful.

- [ ] **Step 2: Add the homepage activity configuration**

Add `homeNow` to `src/data/site-config.ts` with only real, publishable statements. If no item is ready, use an empty list rather than temporary filler:

```ts
homeNow: [],
```

- [ ] **Step 3: Create the finite scene data module**

Create `src/data/home-story.ts` with explicit identifiers and exactly seven entries:

```ts
export const HOME_SCENE_IDS = ['open', 'interests', 'growth', 'now', 'reading', 'scroll', 'enter'] as const;

export type HomeSceneId = (typeof HOME_SCENE_IDS)[number];

export type HomeStoryScene = {
    id: HomeSceneId;
    eyebrow: string;
    title: string;
    command: string;
    response: string;
};

export const HOME_STORY_SCENES: readonly HomeStoryScene[] = [
    {
        id: 'open',
        eyebrow: '启园',
        title: '思想生长之处',
        command: '吾有一园，名曰「misaka.design」。启之。',
        response: '园门已启。'
    },
    {
        id: 'interests',
        eyebrow: '列志',
        title: '所关注的事',
        command: '列吾所好：设计、智能、前端、成长。陈之。',
        response: '四志已列。'
    },
    {
        id: 'growth',
        eyebrow: '生长',
        title: '思绪并非一次写定',
        command: '此园非库，乃思绪生长之地。润其形。',
        response: '脉络渐生。'
    },
    {
        id: 'now',
        eyebrow: '近况',
        title: '此刻正在发生',
        command: '吾有所行，亦有所问。示其近况。',
        response: '近况已录。'
    },
    {
        id: 'reading',
        eyebrow: '荐读',
        title: '从这里开始',
        command: '择文三篇，以待初访之人。置于前。',
        response: '荐读已置。'
    },
    {
        id: 'scroll',
        eyebrow: '展卷',
        title: '一卷未完的索引',
        command: '今添吾色，易其字，展此长卷。',
        response: '墨色已定。长卷已展。'
    },
    {
        id: 'enter',
        eyebrow: '入园',
        title: '园门既开',
        command: '园门既开，请君自游。',
        response: '请君自游。'
    }
] as const;

export const HOME_INTERESTS = [
    '设计如何解决问题',
    'AI 如何参与创造',
    '代码如何承载体验',
    '人在实践中如何成长'
] as const;

export const HOME_GROWTH_STATES = ['种子', '生长中', '已成文', '持续修订'] as const;
```

- [ ] **Step 4: Build to verify the data contract**

Run:

```bash
npm run build
```

Expected: Astro completes successfully with no content schema or TypeScript errors.

- [ ] **Step 5: Commit the scene model**

```bash
git add src/data/home-story.ts src/data/site-config.ts src/types.ts
git commit -m "feat: define homepage story scenes"
```

---

## Task 2: Select truthful, unique recommended reading

**Files:**
- Modify: `src/utils/data-utils.ts`
- Create: `tests/home-story/data-utils.test.ts`
- Modify: `package.json`

- [ ] **Step 1: Add focused test scripts**

Add these scripts to `package.json` without removing existing scripts:

```json
"test": "vitest run",
"test:home-story": "vitest run tests/home-story"
```

- [ ] **Step 2: Write failing recommendation tests**

Create `tests/home-story/data-utils.test.ts`. Use a small fixture helper cast to `CollectionEntry<'blog'>`, then cover all required behavior:

```ts
import { describe, expect, it } from 'vitest';
import type { CollectionEntry } from 'astro:content';
import { getHomepageRecommendations } from '../../src/utils/data-utils';

function post(id: string, type: 'article' | 'note', publishDate: string, isFeatured = false) {
    return {
        id,
        data: { type, publishDate: new Date(publishDate), isFeatured }
    } as CollectionEntry<'blog'>;
}

describe('getHomepageRecommendations', () => {
    it('orders a featured article, latest other article, then latest note', () => {
        const result = getHomepageRecommendations([
            post('featured', 'article', '2026-01-01', true),
            post('article', 'article', '2026-03-01'),
            post('note', 'note', '2026-04-01')
        ]);

        expect(result.map(({ id }) => id)).toEqual(['featured', 'article', 'note']);
    });

    it('never duplicates a post when inventory is small', () => {
        const result = getHomepageRecommendations([post('only', 'article', '2026-01-01', true)]);
        expect(result.map(({ id }) => id)).toEqual(['only']);
    });

    it('falls back to newest available public entries', () => {
        const result = getHomepageRecommendations([
            post('older-note', 'note', '2026-01-01'),
            post('newer-note', 'note', '2026-02-01')
        ]);
        expect(result.map(({ id }) => id)).toEqual(['newer-note', 'older-note']);
    });

    it('returns an empty array for an empty inventory', () => {
        expect(getHomepageRecommendations([])).toEqual([]);
    });
});
```

- [ ] **Step 3: Run the focused test and verify it fails**

Run:

```bash
npm run test:home-story
```

Expected: FAIL because `getHomepageRecommendations` is not exported.

- [ ] **Step 4: Implement the recommendation selector**

Add `getHomepageRecommendations` to `src/utils/data-utils.ts`. It must pick a featured article, latest distinct article, and latest distinct note, then fill remaining slots from newest distinct posts:

```ts
export function getHomepageRecommendations(posts: CollectionEntry<'blog'>[], count: number = 3): CollectionEntry<'blog'>[] {
    const sorted = [...posts].sort(sortItemsByDateDesc);
    const selected: CollectionEntry<'blog'>[] = [];

    const add = (candidate?: CollectionEntry<'blog'>) => {
        if (candidate && selected.length < count && !selected.some(({ id }) => id === candidate.id)) {
            selected.push(candidate);
        }
    };

    add(getFeaturedArticle(sorted));
    add(sorted.find((candidate) => isArticle(candidate) && !selected.some(({ id }) => id === candidate.id)));
    add(sorted.find((candidate) => isNote(candidate) && !selected.some(({ id }) => id === candidate.id)));
    sorted.forEach(add);

    return selected.slice(0, count);
}
```

- [ ] **Step 5: Run the focused test and verify it passes**

Run:

```bash
npm run test:home-story
```

Expected: all four recommendation tests PASS.

- [ ] **Step 6: Commit the selector**

```bash
git add package.json src/utils/data-utils.ts tests/home-story/data-utils.test.ts
git commit -m "test: define homepage recommendation behavior"
```

---

## Task 3: Render the stage and seven semantic scenes

**Files:**
- Create: `src/components/home/HomeStoryStage.astro`
- Create: `src/components/home/HomeStoryScene.astro`
- Create: `src/components/home/HomeStory.astro`
- Modify: `src/pages/index.astro`
- Modify: `src/layouts/BaseLayout.astro`

- [ ] **Step 1: Create the reusable stage component**

Create `src/components/home/HomeStoryStage.astro`. Accept `inline?: boolean`, render no inputs, and expose stable hooks for the controller:

```astro
---
const { inline = false } = Astro.props;
---

<div class:list={['home-stage', inline && 'home-stage--inline']} data-home-stage aria-live={inline ? undefined : 'polite'}>
    <div class="home-stage__terminal" aria-hidden={inline ? undefined : 'true'}>
        <div class="home-stage__chrome" aria-hidden="true">
            <span></span><span></span><span></span>
        </div>
        <p class="home-stage__prompt"><span aria-hidden="true">›</span> <span data-home-command></span></p>
        <p class="home-stage__status" data-home-status></p>
        <span class="home-stage__caret" aria-hidden="true"></span>
        <div class="home-stage__seal" aria-hidden="true">御坂</div>
    </div>
</div>
```

Desktop stage text is decorative because each command is repeated semantically in its scene. Inline mobile stages remain readable in local context.

- [ ] **Step 2: Create the semantic scene wrapper**

Create `src/components/home/HomeStoryScene.astro` with typed scene input and a default slot:

```astro
---
import type { HomeStoryScene } from '../../data/home-story';
import HomeStoryStage from './HomeStoryStage.astro';

type Props = { scene: HomeStoryScene };
const { scene } = Astro.props;
---

<section class="home-scene" data-home-story-scene={scene.id} aria-labelledby={`home-scene-${scene.id}`}>
    <div class="home-scene__mobile-stage">
        <HomeStoryStage inline />
        <p class="sr-only">{scene.command} {scene.response}</p>
    </div>
    <p class="home-scene__eyebrow">{scene.eyebrow}</p>
    <h2 id={`home-scene-${scene.id}`} class="home-scene__title">{scene.title}</h2>
    <div class="home-scene__content"><slot /></div>
</section>
```

- [ ] **Step 3: Compose all seven scenes**

Create `src/components/home/HomeStory.astro` with props for recommendations, tags, avatar data, and `homeNow`. Render:

- scene one: square bookplate avatar, `思想生长之处`, and approved supporting copy;
- scene two: `HOME_INTERESTS` as a numbered unframed list;
- scene three: `HOME_GROWTH_STATES` with text labels, not color-only markers;
- scene four: only non-empty `homeNow` items;
- scene five: up to three `PostPreview` entries, or a concise link to `/blog` when empty;
- scene six: a compact index that recomposes the same themes/states/recommendation titles without creating new claims;
- scene seven: links to `/blog`, `/tags`, and `/wall`.

The root markup must use these hooks:

```astro
<section class="home-story" data-home-story data-home-scene="open">
    <div class="home-story__stage-column">
        <div class="home-story__sticky"><HomeStoryStage /></div>
    </div>
    <div class="home-story__scenes">
        <!-- seven HomeStoryScene instances -->
    </div>
</section>
```

- [ ] **Step 4: Mount the story on the homepage**

Modify `src/pages/index.astro` to:

```ts
const recommendations = getHomepageRecommendations(posts);
```

Then render `<BaseLayout description={siteConfig.description} wide>` and place `<HomeStory ... />` before the existing normal browsing sections. Keep featured writing, latest updates, and topic entry points after the story; do not duplicate the old brand-introduction block above it.

- [ ] **Step 5: Add an optional root class only if required**

If story styles need body-level containment, extend `BaseLayout` with an optional `pageClass?: string` prop and apply it to the outer layout wrapper. Do not hard-code homepage behavior into all pages.

- [ ] **Step 6: Build the semantic version**

Run:

```bash
npm run build
```

Expected: Astro builds all routes; the homepage contains all seven scenes and normal browse sections even before the controller is added.

- [ ] **Step 7: Commit semantic rendering**

```bash
git add src/components/home/HomeStoryStage.astro src/components/home/HomeStoryScene.astro src/components/home/HomeStory.astro src/pages/index.astro src/layouts/BaseLayout.astro
git commit -m "feat: render homepage scroll narrative"
```

---

## Task 4: Implement deterministic scene activation

**Files:**
- Create: `src/utils/home-story-controller.ts`
- Create: `src/scripts/home-story.ts`
- Create: `tests/home-story/controller.test.ts`
- Modify: `src/pages/index.astro`

- [ ] **Step 1: Write controller tests with jsdom**

Create `tests/home-story/controller.test.ts`. Build a seven-section fixture and mock `matchMedia`, `requestAnimationFrame`, and element rectangles. Test these contracts:

```ts
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createHomeStoryController } from '../../src/utils/home-story-controller';

describe('home story controller', () => {
    beforeEach(() => {
        document.body.innerHTML = `
            <section data-home-story data-home-scene="open">
                <div data-home-stage><span data-home-command></span><span data-home-status></span></div>
                ${['open', 'interests', 'growth', 'now', 'reading', 'scroll', 'enter']
                    .map((id) => `<section data-home-story-scene="${id}"><div data-home-stage><span data-home-command></span><span data-home-status></span></div></section>`)
                    .join('')}
            </section>`;
        vi.stubGlobal('requestAnimationFrame', (callback: FrameRequestCallback) => {
            callback(0);
            return 1;
        });
        vi.stubGlobal('cancelAnimationFrame', vi.fn());
    });

    it('initializes directly to the active scene state', () => {
        const root = document.querySelector<HTMLElement>('[data-home-story]')!;
        const controller = createHomeStoryController(root, { reducedMotion: true });
        controller.setScene('growth');
        expect(root.dataset.homeScene).toBe('growth');
        expect(root.querySelector('[data-home-command]')?.textContent).toContain('此园非库');
    });

    it('restores a previous scene without waiting for typing', () => {
        const root = document.querySelector<HTMLElement>('[data-home-story]')!;
        const controller = createHomeStoryController(root, { reducedMotion: true });
        controller.setScene('scroll');
        controller.setScene('interests');
        expect(root.dataset.homeScene).toBe('interests');
        expect(root.querySelector('[data-home-status]')?.textContent).toBe('四志已列。');
    });

    it('cancels stale typing before applying a fast-scrolled scene', async () => {
        vi.useFakeTimers();
        const root = document.querySelector<HTMLElement>('[data-home-story]')!;
        const controller = createHomeStoryController(root, { reducedMotion: false, typeDelay: 20, workDelay: 40 });
        controller.setScene('open');
        controller.setScene('enter');
        await vi.runAllTimersAsync();
        expect(root.dataset.homeScene).toBe('enter');
        expect(root.querySelector('[data-home-status]')?.textContent).toBe('请君自游。');
        vi.useRealTimers();
    });

    it('shows completed commands immediately for reduced motion', () => {
        const root = document.querySelector<HTMLElement>('[data-home-story]')!;
        const controller = createHomeStoryController(root, { reducedMotion: true });
        controller.setScene('scroll');
        expect(root.querySelector('[data-home-command]')?.textContent).toBe('今添吾色，易其字，展此长卷。');
        expect(root.querySelector('[data-home-status]')?.textContent).toBe('墨色已定。长卷已展。');
    });
});
```

- [ ] **Step 2: Run the focused tests and verify they fail**

Run:

```bash
npm run test:home-story
```

Expected: FAIL because `createHomeStoryController` does not exist.

- [ ] **Step 3: Implement the finite controller**

Create `src/utils/home-story-controller.ts` and export:

```ts
export type HomeStoryController = {
    setScene(sceneId: HomeSceneId): void;
    refresh(): void;
    destroy(): void;
};

export function createHomeStoryController(
    root: HTMLElement,
    options?: { reducedMotion?: boolean; typeDelay?: number; workDelay?: number }
): HomeStoryController;
```

Implementation requirements:

- import `HOME_STORY_SCENES` and reject unknown identifiers;
- write `root.dataset.homeScene` immediately on every activation;
- update both the desktop stage and the active scene's inline stage;
- abort the previous animation with an `AbortController` before starting another;
- type by Unicode code points with `Array.from(scene.command)`;
- show `推演中…` only while a forward non-reduced-motion sequence is active;
- write the final command and response immediately for backward movement, fast replacement, initial restoration, and reduced motion;
- calculate active sections from cached element references and an activation line at `window.innerHeight * 0.58`;
- schedule scroll work through one `requestAnimationFrame` and register the listener as passive;
- set a bounded `--home-scroll-progress` value only for the `scroll` scene;
- remove scroll/resize listeners, cancel the frame, and abort typing in `destroy()`.

- [ ] **Step 4: Add Astro lifecycle initialization**

Create `src/scripts/home-story.ts`:

```ts
import { createHomeStoryController, type HomeStoryController } from '../utils/home-story-controller';

let controller: HomeStoryController | undefined;

function setup() {
    controller?.destroy();
    const root = document.querySelector<HTMLElement>('[data-home-story]');
    controller = root ? createHomeStoryController(root) : undefined;
}

document.addEventListener('astro:page-load', setup);
document.addEventListener('astro:before-swap', () => controller?.destroy());
```

Import this script from `src/pages/index.astro` using Astro's bundled script handling rather than placing it in `public/`.

- [ ] **Step 5: Run focused tests**

Run:

```bash
npm run test:home-story
```

Expected: recommendation and controller tests PASS.

- [ ] **Step 6: Commit deterministic behavior**

```bash
git add src/utils/home-story-controller.ts src/scripts/home-story.ts tests/home-story/controller.test.ts src/pages/index.astro
git commit -m "feat: activate homepage story on scroll"
```

---

## Task 5: Style the editorial story and horizontal handscroll

**Files:**
- Create: `src/styles/home-story.css`
- Modify: `src/pages/index.astro`

- [ ] **Step 1: Import the isolated stylesheet**

Import `../styles/home-story.css` in the frontmatter of `src/pages/index.astro`. Do not place homepage-specific selectors in `src/styles/global.css`.

- [ ] **Step 2: Establish stable desktop geometry**

In `src/styles/home-story.css`, define:

```css
.home-story {
    --home-paper: #f7f5ef;
    --home-ink: #20201e;
    --home-vermilion: #a33a2b;
    display: grid;
    grid-template-columns: minmax(20rem, 0.8fr) minmax(0, 1.2fr);
    gap: clamp(3rem, 7vw, 7rem);
    align-items: start;
}

.home-story__sticky {
    position: sticky;
    top: clamp(6rem, 14vh, 9rem);
    min-height: 28rem;
}

.home-scene {
    min-height: clamp(34rem, 82vh, 48rem);
    display: flex;
    flex-direction: column;
    justify-content: center;
}

.home-scene__mobile-stage {
    display: none;
}
```

Use stable `min-height`, `aspect-ratio`, and `overflow: clip` values so typing and stage transitions never shift the grid.

- [ ] **Step 3: Style scenes one through five with restrained state changes**

Add finite selectors based on `data-home-scene`, including:

```css
.home-story[data-home-scene='open'] .home-stage__terminal,
.home-story[data-home-scene='interests'] .home-stage__terminal {
    background: #181918;
    color: #f4f2eb;
}

.home-story[data-home-scene='growth'] .home-stage__terminal,
.home-story[data-home-scene='now'] .home-stage__terminal,
.home-story[data-home-scene='reading'] .home-stage__terminal {
    background: var(--home-paper);
    color: var(--home-ink);
}
```

Fade terminal chrome gradually, move syntax emphasis toward ink hierarchy, and turn the caret into a small vermilion annotation point by scene five. Keep right-side lists unframed and avoid nested cards.

- [ ] **Step 4: Build the handscroll climax**

For `data-home-scene='scroll'`:

- clip an internal scroll sheet and translate it from left to right using `--home-scroll-progress`;
- add scroll rods with pseudo-elements marked decorative by their containing markup;
- use a Song/FangSong-compatible system serif stack for display text only;
- reveal the `御坂` square seal near the title slip;
- keep seal scale between `0.96` and `1`, with a short opacity/ink-softening transition and no bounce;
- keep the stage width fixed inside its grid column;
- do not rotate body copy.

For `data-home-scene='enter'`, reduce the scroll sheet, hide decorative rods, and return the stage to a compact settled state before sticky release.

- [ ] **Step 5: Add dark-mode handscroll tokens**

Under the repository's existing `.dark` class, override the story tokens:

```css
.dark .home-story {
    --home-paper: #24231f;
    --home-ink: #ece8dc;
    --home-vermilion: #d46a55;
}
```

Ensure scene six does not flash a bright white surface in dark mode.

- [ ] **Step 6: Add mobile and tablet inline layout**

At `max-width: 1023px`:

- switch `.home-story` to one column;
- hide `.home-story__stage-column`;
- display `.home-scene__mobile-stage`;
- reduce each scene to content-driven height with generous block spacing;
- constrain each inline stage to `width: 100%` and `overflow: clip`;
- represent the handscroll with internal clipping only;
- enforce `max-width: 100%` on long commands and allow wrapping;
- prevent horizontal document overflow.

- [ ] **Step 7: Add reduced-motion and no-JavaScript-safe states**

Use CSS so all scene content is visible by default. Only apply entrance transforms beneath a root enhancement class set by the controller, such as `.home-story.is-enhanced`. Under `prefers-reduced-motion: reduce`, remove transforms, keyframes, scroll-sheet translation, caret blinking, and seal press effects.

- [ ] **Step 8: Format and build**

Run:

```bash
npx prettier --write src/pages/index.astro src/components/home/*.astro src/styles/home-story.css
npm run build
```

Expected: formatting completes and Astro builds successfully.

- [ ] **Step 9: Commit the visual states**

```bash
git add src/styles/home-story.css src/pages/index.astro src/components/home
git commit -m "feat: style terminal to handscroll transition"
```

---

## Task 6: Verify behavior, accessibility, and responsive layout

**Files:**
- Modify only files implicated by verification failures.
- Test: `tests/home-story/data-utils.test.ts`
- Test: `tests/home-story/controller.test.ts`

- [ ] **Step 1: Run all automated tests**

Run:

```bash
npm run test
```

Expected: existing wall tests and new homepage-story tests all PASS.

- [ ] **Step 2: Run the production build**

Run:

```bash
npm run build
```

Expected: Astro builds every route with no content collection, TypeScript, or duplicate-id errors.

- [ ] **Step 3: Start the local development server**

Run:

```bash
npm run dev -- --host 127.0.0.1
```

Expected: Astro reports a local URL. Keep the server running through visual verification.

- [ ] **Step 4: Verify desktop states in a browser**

At approximately `1440x900`, inspect and capture the following states:

- first scene initializes with the automatic terminal and square bookplate avatar;
- scenes two through five activate at a stable line without content overlap;
- scene six becomes a horizontal handscroll inside the left column and lands the `御坂` seal away from text/avatar;
- scene seven settles and releases into normal featured/latest/topic browsing;
- fast scrolling directly from scene one to seven ends with correct command and response;
- scrolling backward restores completed prior scenes immediately;
- light and dark themes remain readable.

- [ ] **Step 5: Verify mobile layout**

At approximately `390x844`, confirm:

- scenes appear in document order with inline command stages;
- no page-level horizontal scroll exists;
- the longest command wraps without escaping its stage;
- no sticky desktop rail occupies space;
- scene-six title, seal, avatar, and links do not overlap;
- normal browse links remain reachable after scene seven.

- [ ] **Step 6: Verify accessibility fallbacks**

In browser developer tools:

- emulate `prefers-reduced-motion: reduce` and confirm commands/states appear complete with no typing or rolling motion;
- disable JavaScript and confirm every heading, scene copy, recommendation, and final browse link remains present;
- tab through the page and confirm visible focus indicators and logical link order;
- inspect the accessibility tree and confirm decorative chrome, rods, grain, and seal are not announced as controls.

- [ ] **Step 7: Check rendered layout bounds**

Use browser automation or DevTools console checks to assert:

```js
document.documentElement.scrollWidth === document.documentElement.clientWidth
```

Expected: `true` at desktop and mobile widths. Also confirm every `[data-home-story-scene]` has a non-zero bounding box and the stage remains inside the story grid bounds.

- [ ] **Step 8: Re-run focused checks after visual fixes**

After any correction, run:

```bash
npm run test:home-story
npm run build
```

Expected: both commands PASS.

- [ ] **Step 9: Commit verification fixes**

Stage only homepage-story files changed during verification:

```bash
git add src/components/home src/data/home-story.ts src/scripts/home-story.ts src/styles/home-story.css src/utils/home-story-controller.ts src/utils/data-utils.ts src/pages/index.astro src/layouts/BaseLayout.astro src/data/site-config.ts src/types.ts tests/home-story package.json
git commit -m "fix: polish homepage story fallbacks"
```

Skip this commit when verification requires no fixes.

---

## Plan self-review

### Spec coverage

- Seven approved commands, responses, and narrative scenes are defined in Task 1 and rendered in Task 3.
- Real-content selection, empty-state honesty, and no duplicate recommendations are tested in Task 2.
- Automatic typing, finite scene state, backward restoration, fast scrolling, and reduced motion are covered in Task 4.
- Desktop sticky layout, mobile inline fallback, terminal-to-handscroll evolution, dark mode, `御坂` seal, and no-overflow constraints are covered in Task 5.
- Semantic HTML, no-JavaScript content, keyboard order, accessibility-tree behavior, and reduced-motion verification are covered in Tasks 3, 5, and 6.
- Existing featured writing, latest updates, topic links, sticky wall, Astro collections, and static hosting remain intact through Tasks 2 and 3.

### Placeholder scan

- No `TBD`, `TODO`, `implement later`, unspecified test step, or invented publication content remains.
- Final avatar generation, font licensing, and optional texture remain outside implementation scope exactly as deferred by the design.

### Type consistency

- Scene identifiers use `HomeSceneId` everywhere.
- Scene records use `HomeStoryScene` everywhere.
- The controller accepts only finite scene identifiers and writes the same values to `data-home-scene`.
- Current activity uses `HomeNowItem[]` in types, site configuration, and `HomeStory` props.
- Recommendations remain `CollectionEntry<'blog'>[]` from selector through rendering.

### Worktree safety

- The repository already contains unrelated uncommitted user changes. Each commit step stages explicit task files only.
- Before every commit, inspect `git diff -- <task files>` and do not overwrite or revert pre-existing modifications in shared files such as `src/pages/index.astro`, `src/layouts/BaseLayout.astro`, `src/data/site-config.ts`, `src/types.ts`, `src/utils/data-utils.ts`, or `package.json`.
