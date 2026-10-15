import { HOME_STORY_SCENES, type HomeSceneId } from '../data/home-story';

type ControllerOptions = {
    reducedMotion?: boolean;
    typeDelay?: number;
    inline?: boolean;
};

export type HomeStoryController = {
    setScene(sceneId: HomeSceneId): void;
    refresh(): void;
    destroy(): void;
};

const sceneById = new Map(HOME_STORY_SCENES.map((scene) => [scene.id, scene]));
const SCROLL_SETTLE_MS = 140;
const FAST_SCROLL_PX_PER_MS = 1.2;

function wait(delay: number, signal: AbortSignal) {
    return new Promise<void>((resolve) => {
        if (signal.aborted || delay <= 0) {
            resolve();
            return;
        }
        const finish = () => {
            window.clearTimeout(timer);
            signal.removeEventListener('abort', finish);
            resolve();
        };
        const timer = window.setTimeout(finish, delay);
        signal.addEventListener('abort', finish, { once: true });
    });
}

export function createHomeStoryController(root: HTMLElement, options: ControllerOptions = {}): HomeStoryController {
    const scenes = Array.from(root.querySelectorAll<HTMLElement>('[data-home-story-scene]'));
    const stages = Array.from(root.querySelectorAll<HTMLElement>('[data-home-stage]'));
    const desktopStage = root.querySelector<HTMLElement>(':scope > .home-story__stage-column [data-home-stage]');
    const chapterIndex = root.querySelector<HTMLElement>('[data-home-chapter-index]');
    const chapterLabel = root.querySelector<HTMLElement>('[data-home-chapter-label]');
    const motionQuery = window.matchMedia?.('(prefers-reduced-motion: reduce)');
    const reducedMotion = () => options.reducedMotion ?? motionQuery?.matches ?? false;
    const inlineQuery = window.matchMedia?.('(max-width: 1023px)');
    const isInline = () => options.inline ?? inlineQuery?.matches ?? false;
    const visited = new Set<HomeSceneId>();
    const visible = new Map<HTMLElement, boolean>();
    let inline = isInline();
    let currentIndex = -1;
    let typing: AbortController | undefined;
    let entrance: Animation | undefined;
    let pendingScene: HomeSceneId | undefined;
    let frameId = 0;
    let settleTimer = 0;
    let scrolling = false;
    let fastScrolling = false;
    let lastScrollY = window.scrollY;
    let lastScrollTime = performance.now();
    let destroyed = false;

    root.classList.add('is-enhanced');

    const stageForScene = (sceneId: HomeSceneId) =>
        inline ? scenes.find((scene) => scene.dataset.homeStoryScene === sceneId)?.querySelector<HTMLElement>('[data-home-stage]') : desktopStage;

    const measureVisible = (stage: HTMLElement) => {
        const rect = stage.getBoundingClientRect();
        return rect.width > 0 && rect.height > 0 && rect.bottom > 0 && rect.top < window.innerHeight;
    };
    const canAnimate = (stage: HTMLElement) => !reducedMotion() && !document.hidden && (visible.get(stage) ?? measureVisible(stage));
    const syncMotion = () => {
        stages.forEach((stage) => {
            stage.dataset.homeMotion = canAnimate(stage) ? 'running' : 'paused';
        });
    };

    const writeStage = (sceneId: HomeSceneId, command: string, isTyping = false) => {
        const scene = sceneById.get(sceneId);
        const stage = stageForScene(sceneId);
        if (!scene || !stage) return;
        const commandElement = stage.querySelector<HTMLElement>('[data-home-command]');
        const reserve = stage.querySelector<HTMLElement>('[data-home-command-space]');
        const status = stage.querySelector<HTMLElement>('[data-home-status]');
        if (commandElement) commandElement.textContent = command;
        // The full command and response keep their space while the decorative text types.
        if (reserve && reserve.textContent !== scene.command) reserve.textContent = scene.command;
        if (status && status.textContent !== scene.response) status.textContent = scene.response;
        if (stage.dataset.homeActiveScene !== sceneId) {
            stage.dataset.homeActiveScene = sceneId;
            stage.querySelectorAll<HTMLElement>('[data-home-output-scene]').forEach((panel) => {
                panel.toggleAttribute('data-active', panel.dataset.homeOutputScene === sceneId);
            });
        }
        stage.dataset.homeTyping = String(isTyping);
    };

    const completeCurrent = () => {
        typing?.abort();
        typing = undefined;
        entrance?.cancel();
        entrance = undefined;
        pendingScene = undefined;
        const scene = HOME_STORY_SCENES[currentIndex];
        if (scene) {
            writeStage(scene.id, scene.command);
            visited.add(scene.id);
        }
    };

    const typeScene = async (sceneId: HomeSceneId, signal: AbortSignal) => {
        const scene = sceneById.get(sceneId)!;
        const characters = Array.from(scene.command);
        const delay = Math.min(options.typeDelay ?? 18, 360 / characters.length);
        let command = '';
        for (const character of characters) {
            if (signal.aborted) return;
            command += character;
            writeStage(sceneId, command, true);
            await wait(delay, signal);
        }
        if (!signal.aborted) {
            writeStage(sceneId, scene.command);
            typing = undefined;
        }
    };

    const playScene = (sceneId: HomeSceneId) => {
        pendingScene = undefined;
        const stage = stageForScene(sceneId);
        if (!stage || !canAnimate(stage)) {
            completeCurrent();
            return;
        }
        visited.add(sceneId);
        const content = stage.querySelector<HTMLElement>('[data-home-stage-content]');
        entrance = content?.animate?.(
            [
                { opacity: 0, transform: 'translateY(6px)' },
                { opacity: 1, transform: 'translateY(0)' }
            ],
            { duration: 280, easing: 'cubic-bezier(0.22, 1, 0.36, 1)' }
        );
        typing = new AbortController();
        void typeScene(sceneId, typing.signal);
    };

    const applyScene = (sceneId: HomeSceneId, layoutChanged = false) => {
        const nextIndex = HOME_STORY_SCENES.findIndex(({ id }) => id === sceneId);
        if (nextIndex < 0 || destroyed || (nextIndex === currentIndex && !layoutChanged)) return;
        const previousIndex = currentIndex;
        completeCurrent();
        currentIndex = nextIndex;
        root.dataset.homeScene = sceneId;
        root.style.setProperty('--home-scene-index', String(nextIndex));
        if (chapterIndex) chapterIndex.textContent = String(nextIndex + 1).padStart(2, '0');
        if (chapterLabel) chapterLabel.textContent = HOME_STORY_SCENES[nextIndex].eyebrow;
        const stage = stageForScene(sceneId);
        const skippedScenes = previousIndex >= 0 && nextIndex > previousIndex + 1;
        if (layoutChanged || nextIndex <= previousIndex || visited.has(sceneId) || fastScrolling || skippedScenes || !stage || !canAnimate(stage)) {
            writeStage(sceneId, HOME_STORY_SCENES[nextIndex].command);
            visited.add(sceneId);
            return;
        }
        writeStage(sceneId, '', true);
        if (scrolling) pendingScene = sceneId;
        else playScene(sceneId);
    };

    const updateFromScroll = () => {
        frameId = 0;
        if (destroyed || scenes.length === 0) return;
        const nextInline = isInline();
        const layoutChanged = nextInline !== inline;
        if (layoutChanged) {
            completeCurrent();
            inline = nextInline;
            stages.forEach((stage) => visible.set(stage, measureVisible(stage)));
            syncMotion();
        }
        const activationLine = window.innerHeight * 0.58;
        const bounds = scenes.map((scene) => scene.getBoundingClientRect());
        let activeIndex = 0;
        bounds.forEach((rect, index) => {
            if (rect.top <= activationLine) activeIndex = index;
        });
        const activeScene = HOME_STORY_SCENES[activeIndex];
        if (activeScene) applyScene(activeScene.id, layoutChanged);
        const rect = bounds[activeIndex];
        const progress =
            activeScene?.id === 'proof' ? Math.min(1, Math.max(0, (activationLine - rect.top) / Math.max(rect.height - window.innerHeight * 0.42, 1))) : 0;
        const value = progress.toFixed(3);
        if (root.style.getPropertyValue('--home-scroll-progress') !== value) root.style.setProperty('--home-scroll-progress', value);
    };

    const refresh = () => {
        if (!destroyed && !frameId) frameId = window.requestAnimationFrame(updateFromScroll);
    };

    const onScroll = () => {
        const now = performance.now();
        const distance = Math.abs(window.scrollY - lastScrollY);
        const elapsed = Math.max(16, Math.min(now - lastScrollTime, 80));
        fastScrolling ||= distance / elapsed > FAST_SCROLL_PX_PER_MS;
        lastScrollY = window.scrollY;
        lastScrollTime = now;
        scrolling = true;
        // Once the reader moves on, finish rather than restart the current typing.
        if (typing || (fastScrolling && pendingScene)) completeCurrent();
        window.clearTimeout(settleTimer);
        settleTimer = window.setTimeout(() => {
            settleTimer = 0;
            scrolling = false;
            fastScrolling = false;
            if (!destroyed && pendingScene) playScene(pendingScene);
        }, SCROLL_SETTLE_MS);
        refresh();
    };

    const onVisibilityChange = () => {
        syncMotion();
        const scene = HOME_STORY_SCENES[currentIndex];
        const stage = scene && stageForScene(scene.id);
        if (stage && !canAnimate(stage)) completeCurrent();
    };
    stages.forEach((stage) => visible.set(stage, measureVisible(stage)));
    const observer =
        typeof IntersectionObserver === 'undefined'
            ? undefined
            : new IntersectionObserver((entries) => {
                  if (destroyed) return;
                  entries.forEach((entry) => visible.set(entry.target as HTMLElement, entry.isIntersecting));
                  onVisibilityChange();
              });
    stages.forEach((stage) => observer?.observe(stage));
    syncMotion();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', refresh);
    document.addEventListener('visibilitychange', onVisibilityChange);
    motionQuery?.addEventListener?.('change', onVisibilityChange);
    // Pick the restored scroll position before starting any decorative animation.
    updateFromScroll();

    return {
        setScene: applyScene,
        refresh,
        destroy() {
            destroyed = true;
            completeCurrent();
            stages.forEach((stage) => {
                stage.dataset.homeMotion = 'paused';
            });
            observer?.disconnect();
            window.clearTimeout(settleTimer);
            window.removeEventListener('scroll', onScroll);
            window.removeEventListener('resize', refresh);
            document.removeEventListener('visibilitychange', onVisibilityChange);
            motionQuery?.removeEventListener?.('change', onVisibilityChange);
            if (frameId) window.cancelAnimationFrame(frameId);
        }
    };
}
