import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createHomeStoryController } from '../../src/utils/home-story-controller';

const sceneIds = ['open', 'focus', 'now', 'reading', 'proof', 'enter'];

function buildStoryRoot() {
    document.body.innerHTML = `
        <section data-home-story data-home-scene="open">
            <div class="home-story__stage-column">
                <div data-home-stage><div data-home-stage-content><span data-home-command-space></span><span data-home-command></span><span data-home-status></span>
                    ${sceneIds.map((id) => `<dl data-home-output-scene="${id}"></dl>`).join('')}
                </div></div>
                <div><span data-home-chapter-index>01</span><span data-home-chapter-label>启园</span></div>
            </div>
            ${sceneIds
                .map(
                    (id) => `
                        <section data-home-story-scene="${id}">
                            <div data-home-stage><div data-home-stage-content><span data-home-command-space></span><span data-home-command></span><span data-home-status></span></div></div>
                        </section>`
                )
                .join('')}
        </section>`;
    const root = document.querySelector<HTMLElement>('[data-home-story]')!;
    root.querySelectorAll<HTMLElement>('[data-home-story-scene]').forEach((scene, index) => {
        scene.getBoundingClientRect = () => ({ top: index * 1000, height: 600 }) as DOMRect;
    });
    root.querySelectorAll<HTMLElement>('[data-home-stage]').forEach((stage) => {
        stage.getBoundingClientRect = () => ({ top: 100, bottom: 400, width: 400, height: 300 }) as DOMRect;
    });
    return root;
}

beforeEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
    vi.stubGlobal('requestAnimationFrame', (callback: FrameRequestCallback) => {
        return window.setTimeout(() => callback(performance.now()), 16);
    });
    vi.stubGlobal('cancelAnimationFrame', (id: number) => window.clearTimeout(id));
    vi.stubGlobal('scrollY', 0);
    vi.spyOn(document, 'hidden', 'get').mockReturnValue(false);
    vi.stubGlobal(
        'matchMedia',
        vi.fn(() => ({ matches: false }))
    );
});

afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
});

function moveToScene(root: HTMLElement, id: string, scrollY: number) {
    const activeIndex = sceneIds.indexOf(id);
    root.querySelectorAll<HTMLElement>('[data-home-story-scene]').forEach((scene, index) => {
        scene.getBoundingClientRect = () => ({ top: (index - activeIndex) * 1000, height: 600 }) as DOMRect;
    });
    vi.stubGlobal('scrollY', scrollY);
    window.dispatchEvent(new Event('scroll'));
}

describe('home story controller', () => {
    it('initializes directly to the active scene state', () => {
        const root = buildStoryRoot();
        const controller = createHomeStoryController(root, { reducedMotion: true });

        controller.setScene('focus');

        expect(root.dataset.homeScene).toBe('focus');
        expect(root.querySelector('[data-home-command]')?.textContent).toContain('作品为证');
        expect(root.querySelector('[data-home-stage]')?.getAttribute('data-home-active-scene')).toBe('focus');
        expect(Array.from(root.querySelectorAll('[data-home-output-scene][data-active]')).map((el) => el.getAttribute('data-home-output-scene'))).toEqual([
            'focus'
        ]);
        controller.destroy();
    });

    it('restores a previous scene without waiting for typing', () => {
        const root = buildStoryRoot();
        const controller = createHomeStoryController(root, { reducedMotion: true });

        controller.setScene('proof');
        controller.setScene('focus');

        expect(root.dataset.homeScene).toBe('focus');
        expect(root.querySelector('[data-home-status]')?.textContent).toBe('三条实践脉络已列。');
        expect(root.querySelector('[data-home-output-scene][data-active]')?.getAttribute('data-home-output-scene')).toBe('focus');
        controller.destroy();
    });

    it('updates the chapter indicator with the active scene', () => {
        const root = buildStoryRoot();
        const controller = createHomeStoryController(root, { reducedMotion: true });

        controller.setScene('focus');

        expect(root.querySelector('[data-home-chapter-index]')?.textContent).toBe('02');
        expect(root.querySelector('[data-home-chapter-label]')?.textContent).toBe('方向');
        controller.destroy();
    });

    it('cancels stale typing before applying a fast-scrolled scene', async () => {
        vi.useFakeTimers();
        const root = buildStoryRoot();
        const controller = createHomeStoryController(root, { reducedMotion: false, typeDelay: 20 });

        controller.setScene('open');
        controller.setScene('enter');
        await vi.runAllTimersAsync();

        expect(root.dataset.homeScene).toBe('enter');
        expect(root.querySelector('[data-home-status]')?.textContent).toBe('请君自游。');
        controller.destroy();
    });

    it('types the initial scene when motion is allowed', () => {
        vi.useFakeTimers();
        const root = buildStoryRoot();

        const controller = createHomeStoryController(root, { reducedMotion: false, typeDelay: 20 });

        expect(root.querySelector('[data-home-command]')?.textContent).toBe('吾');
        controller.destroy();
    });

    it('updates only the active inline stage on mobile', () => {
        const root = buildStoryRoot();
        const controller = createHomeStoryController(root, { reducedMotion: true, inline: true });

        controller.setScene('focus');

        const focusStage = root.querySelector('[data-home-story-scene="focus"] [data-home-command]');
        const desktopStage = root.querySelector('.home-story__stage-column [data-home-command]');
        expect(focusStage?.textContent).toContain('作品为证');
        expect(desktopStage?.textContent).toBe('');
        expect(root.querySelector('[data-home-story-scene="focus"] [data-home-stage]')?.getAttribute('data-home-active-scene')).toBe('focus');
        controller.destroy();
    });

    it('syncs the active scene when crossing into the mobile breakpoint', () => {
        let mobile = false;
        let queuedFrame: FrameRequestCallback | undefined;
        vi.stubGlobal(
            'matchMedia',
            vi.fn((query: string) => ({
                get matches() {
                    return query === '(max-width: 1023px)' ? mobile : false;
                }
            }))
        );
        vi.stubGlobal('requestAnimationFrame', (callback: FrameRequestCallback) => {
            queuedFrame = callback;
            return 1;
        });

        const root = buildStoryRoot();
        root.querySelectorAll<HTMLElement>('[data-home-story-scene]').forEach((scene) => {
            const top = scene.dataset.homeStoryScene === 'open' ? -1000 : scene.dataset.homeStoryScene === 'focus' ? 0 : 1000;
            scene.getBoundingClientRect = () => ({ top, height: 600 }) as DOMRect;
        });
        const controller = createHomeStoryController(root, { reducedMotion: true });
        controller.setScene('focus');

        mobile = true;
        window.dispatchEvent(new Event('resize'));
        queuedFrame?.(0);

        const focusStage = root.querySelector('[data-home-story-scene="focus"] [data-home-command]');
        expect(focusStage?.textContent).toContain('作品为证');
        expect(root.dataset.homeScene).toBe('focus');
        controller.destroy();
    });

    it('shows completed commands immediately for reduced motion', () => {
        const root = buildStoryRoot();
        const controller = createHomeStoryController(root, { reducedMotion: true });

        controller.setScene('proof');

        expect(root.querySelector('[data-home-command]')?.textContent).toBe('计其年月、文章、专题与题解。');
        expect(root.querySelector('[data-home-status]')?.textContent).toBe('积累已有据可查。');
        controller.destroy();
    });

    it('waits for slow scrolling to settle before typing a new scene', async () => {
        vi.useFakeTimers();
        const root = buildStoryRoot();
        const controller = createHomeStoryController(root);
        await vi.runAllTimersAsync();

        moveToScene(root, 'focus', 4);
        await vi.advanceTimersByTimeAsync(16);
        expect(root.dataset.homeScene).toBe('focus');
        expect(root.querySelector('[data-home-command]')?.textContent).toBe('');
        expect(root.querySelector('[data-home-command-space]')?.textContent).toBe('不列泛泛所好，以作品为证。');
        expect(root.querySelector('[data-home-status]')?.textContent).toBe('三条实践脉络已列。');

        await vi.advanceTimersByTimeAsync(124);
        expect(root.querySelector('[data-home-command]')?.textContent).toBe('不');
        await vi.runAllTimersAsync();
        expect(root.querySelector('[data-home-stage]')?.getAttribute('data-home-typing')).toBe('false');
        controller.destroy();
    });

    it('renders fast-scrolled scenes immediately without replaying after stopping', async () => {
        vi.useFakeTimers();
        const root = buildStoryRoot();
        const controller = createHomeStoryController(root);

        moveToScene(root, 'focus', 700);
        await vi.advanceTimersByTimeAsync(16);
        expect(root.querySelector('[data-home-command]')?.textContent).toBe('不列泛泛所好，以作品为证。');
        expect(root.querySelector('[data-home-stage]')?.getAttribute('data-home-typing')).toBe('false');
        await vi.runAllTimersAsync();
        expect(root.querySelector('[data-home-command]')?.textContent).toBe('不列泛泛所好，以作品为证。');
        controller.destroy();
    });

    it('restores backward and revisited scenes without starting new typing', async () => {
        vi.useFakeTimers();
        const root = buildStoryRoot();
        const controller = createHomeStoryController(root);
        controller.setScene('focus');
        await vi.runAllTimersAsync();
        controller.setScene('open');
        controller.setScene('focus');
        expect(root.querySelector('[data-home-command]')?.textContent).toBe('不列泛泛所好，以作品为证。');
        expect(vi.getTimerCount()).toBe(0);
        controller.destroy();
    });

    it('finishes typing and pauses the caret when the stage leaves the viewport', async () => {
        vi.useFakeTimers();
        let observeVisibility: IntersectionObserverCallback;
        const disconnect = vi.fn();
        vi.stubGlobal(
            'IntersectionObserver',
            class {
                constructor(callback: IntersectionObserverCallback) {
                    observeVisibility = callback;
                }
                observe() {}
                disconnect = disconnect;
            }
        );
        const root = buildStoryRoot();
        const controller = createHomeStoryController(root);
        const stage = root.querySelector<HTMLElement>('[data-home-stage]')!;
        observeVisibility!([{ target: stage, isIntersecting: false } as IntersectionObserverEntry], {} as IntersectionObserver);

        expect(stage.dataset.homeMotion).toBe('paused');
        expect(stage.dataset.homeTyping).toBe('false');
        expect(stage.querySelector('[data-home-command]')?.textContent).toBe('吾有一园，记工程实践与未竟之思。启之。');
        expect(vi.getTimerCount()).toBe(0);
        controller.destroy();
        expect(disconnect).toHaveBeenCalledOnce();
    });

    it('settles pending content when the document becomes hidden', async () => {
        vi.useFakeTimers();
        const root = buildStoryRoot();
        const controller = createHomeStoryController(root);
        moveToScene(root, 'focus', 4);
        await vi.advanceTimersByTimeAsync(16);
        vi.spyOn(document, 'hidden', 'get').mockReturnValue(true);
        document.dispatchEvent(new Event('visibilitychange'));
        await vi.runAllTimersAsync();

        expect(root.querySelector('[data-home-command]')?.textContent).toBe('不列泛泛所好，以作品为证。');
        expect(root.querySelector('[data-home-stage]')?.getAttribute('data-home-motion')).toBe('paused');
        controller.destroy();
    });

    it('leaves complete text and no scheduled work after navigation teardown', async () => {
        vi.useFakeTimers();
        const root = buildStoryRoot();
        const controller = createHomeStoryController(root);
        moveToScene(root, 'focus', 4);
        await vi.advanceTimersByTimeAsync(16);
        controller.destroy();
        const completed = root.textContent;
        window.dispatchEvent(new Event('scroll'));
        await vi.runAllTimersAsync();
        expect(root.textContent).toBe(completed);
        expect(root.querySelector('[data-home-command]')?.textContent).toBe('不列泛泛所好，以作品为证。');
        expect(vi.getTimerCount()).toBe(0);
    });
});
