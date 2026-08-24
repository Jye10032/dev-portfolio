import { HOME_STORY_SCENES, type HomeSceneId } from '../data/home-story';

type ControllerOptions = {
    reducedMotion?: boolean;
    typeDelay?: number;
    workDelay?: number;
    inline?: boolean;
};

export type HomeStoryController = {
    setScene(sceneId: HomeSceneId): void;
    refresh(): void;
    destroy(): void;
};

const sceneById = new Map(HOME_STORY_SCENES.map((scene) => [scene.id, scene]));

function wait(delay: number, signal: AbortSignal) {
    return new Promise<void>((resolve) => {
        if (signal.aborted || delay <= 0) {
            resolve();
            return;
        }

        const timer = window.setTimeout(resolve, delay);
        signal.addEventListener(
            'abort',
            () => {
                window.clearTimeout(timer);
                resolve();
            },
            { once: true }
        );
    });
}

export function createHomeStoryController(root: HTMLElement, options: ControllerOptions = {}): HomeStoryController {
    const scenes = Array.from(root.querySelectorAll<HTMLElement>('[data-home-story-scene]'));
    const desktopStage =
        root.querySelector<HTMLElement>(':scope > .home-story__stage-column [data-home-stage]') ?? root.querySelector<HTMLElement>('[data-home-stage]');
    const chapterIndex = root.querySelector<HTMLElement>('[data-home-chapter-index]');
    const chapterLabel = root.querySelector<HTMLElement>('[data-home-chapter-label]');
    const reducedMotion = options.reducedMotion ?? window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
    const typeDelay = options.typeDelay ?? 24;
    const workDelay = options.workDelay ?? 420;
    const inline = options.inline ?? window.matchMedia?.('(max-width: 1023px)').matches ?? false;
    let currentIndex = -1;
    let animation: AbortController | undefined;
    let frameId = 0;
    let destroyed = false;

    root.classList.add('is-enhanced');

    const stageForScene = (sceneId: HomeSceneId) => {
        const scene = scenes.find((element) => element.dataset.homeStoryScene === sceneId);
        return scene?.querySelector<HTMLElement>('[data-home-stage]');
    };

    const writeStage = (stage: HTMLElement | null | undefined, command: string, status: string) => {
        if (!stage) return;
        const commandElement = stage.querySelector<HTMLElement>('[data-home-command]');
        const statusElement = stage.querySelector<HTMLElement>('[data-home-status]');
        if (commandElement) commandElement.textContent = command;
        if (statusElement) statusElement.textContent = status;
    };

    const stagesForScene = (sceneId: HomeSceneId) => (inline ? [stageForScene(sceneId)] : [desktopStage]).filter(Boolean) as HTMLElement[];

    const writeCompleted = (sceneId: HomeSceneId) => {
        const scene = sceneById.get(sceneId);
        if (!scene) return;
        stagesForScene(sceneId).forEach((stage) => writeStage(stage, scene.command, scene.response));
    };

    const typeScene = async (sceneId: HomeSceneId, signal: AbortSignal) => {
        const scene = sceneById.get(sceneId);
        if (!scene) return;
        const targets = stagesForScene(sceneId);

        targets.forEach((stage) => writeStage(stage, '', ''));
        let command = '';
        for (const character of Array.from(scene.command)) {
            if (signal.aborted) return;
            command += character;
            targets.forEach((stage) => writeStage(stage, command, ''));
            await wait(typeDelay, signal);
        }
        if (signal.aborted) return;
        targets.forEach((stage) => writeStage(stage, scene.command, '推演中…'));
        await wait(workDelay, signal);
        if (signal.aborted) return;
        targets.forEach((stage) => writeStage(stage, scene.command, scene.response));
    };

    const setScene = (sceneId: HomeSceneId) => {
        const nextIndex = HOME_STORY_SCENES.findIndex(({ id }) => id === sceneId);
        if (nextIndex < 0 || destroyed) return;

        const previousIndex = currentIndex;
        currentIndex = nextIndex;
        root.dataset.homeScene = sceneId;
        root.style.setProperty('--home-scene-index', String(nextIndex));
        if (chapterIndex) chapterIndex.textContent = String(nextIndex + 1).padStart(2, '0');
        if (chapterLabel) chapterLabel.textContent = HOME_STORY_SCENES[nextIndex].eyebrow;
        animation?.abort();
        animation = new AbortController();

        if (reducedMotion || (previousIndex >= 0 && nextIndex <= previousIndex)) {
            writeCompleted(sceneId);
            return;
        }

        void typeScene(sceneId, animation.signal);
    };

    const updateFromScroll = () => {
        frameId = 0;
        if (destroyed || scenes.length === 0) return;
        const activationLine = window.innerHeight * 0.58;
        let activeIndex = 0;

        scenes.forEach((scene, index) => {
            if (scene.getBoundingClientRect().top <= activationLine) activeIndex = index;
        });

        const activeScene = HOME_STORY_SCENES[activeIndex];
        if (activeScene && activeIndex !== currentIndex) setScene(activeScene.id);

        if (activeScene?.id === 'scroll') {
            const rect = scenes[activeIndex].getBoundingClientRect();
            const travel = Math.max(rect.height - window.innerHeight * 0.42, 1);
            const progress = Math.min(1, Math.max(0, (activationLine - rect.top) / travel));
            root.style.setProperty('--home-scroll-progress', progress.toFixed(3));
        } else {
            root.style.setProperty('--home-scroll-progress', '0');
        }
    };

    const refresh = () => {
        if (destroyed || frameId) return;
        frameId = window.requestAnimationFrame(updateFromScroll);
    };

    window.addEventListener('scroll', refresh, { passive: true });
    window.addEventListener('resize', refresh);
    const initialScene = HOME_STORY_SCENES.find(({ id }) => id === root.dataset.homeScene) ?? HOME_STORY_SCENES[0];
    setScene(initialScene.id);
    refresh();

    return {
        setScene,
        refresh,
        destroy() {
            destroyed = true;
            animation?.abort();
            window.removeEventListener('scroll', refresh);
            window.removeEventListener('resize', refresh);
            if (frameId) window.cancelAnimationFrame(frameId);
        }
    };
}
