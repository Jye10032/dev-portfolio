import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createHomeStoryController } from '../../src/utils/home-story-controller';

const sceneIds = ['open', 'focus', 'now', 'reading', 'proof', 'enter'];

function buildStoryRoot() {
    document.body.innerHTML = `
        <section data-home-story data-home-scene="open">
            <div class="home-story__stage-column">
                <div data-home-stage><span data-home-command></span><span data-home-status></span></div>
                <div><span data-home-chapter-index>01</span><span data-home-chapter-label>启园</span></div>
            </div>
            ${sceneIds
                .map(
                    (id) => `
                        <section data-home-story-scene="${id}">
                            <div data-home-stage><span data-home-command></span><span data-home-status></span></div>
                        </section>`
                )
                .join('')}
        </section>`;
    return document.querySelector<HTMLElement>('[data-home-story]')!;
}

beforeEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
    vi.stubGlobal('requestAnimationFrame', (callback: FrameRequestCallback) => {
        callback(0);
        return 1;
    });
    vi.stubGlobal('cancelAnimationFrame', vi.fn());
    vi.stubGlobal(
        'matchMedia',
        vi.fn(() => ({ matches: false }))
    );
});

describe('home story controller', () => {
    it('initializes directly to the active scene state', () => {
        const root = buildStoryRoot();
        const controller = createHomeStoryController(root, { reducedMotion: true });

        controller.setScene('focus');

        expect(root.dataset.homeScene).toBe('focus');
        expect(root.querySelector('[data-home-command]')?.textContent).toContain('作品为证');
        controller.destroy();
    });

    it('restores a previous scene without waiting for typing', () => {
        const root = buildStoryRoot();
        const controller = createHomeStoryController(root, { reducedMotion: true });

        controller.setScene('proof');
        controller.setScene('focus');

        expect(root.dataset.homeScene).toBe('focus');
        expect(root.querySelector('[data-home-status]')?.textContent).toBe('三条实践脉络已列。');
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
        const controller = createHomeStoryController(root, { reducedMotion: false, typeDelay: 20, workDelay: 40 });

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

        const controller = createHomeStoryController(root, { reducedMotion: false, typeDelay: 20, workDelay: 40 });

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
});
