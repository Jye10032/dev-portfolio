import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createHomeStoryController } from '../../src/utils/home-story-controller';

const sceneIds = ['open', 'interests', 'growth', 'now', 'reading', 'scroll', 'enter'];

function buildStoryRoot() {
    document.body.innerHTML = `
        <section data-home-story data-home-scene="open">
            <div class="home-story__stage-column">
                <div data-home-stage><span data-home-command></span><span data-home-status></span></div>
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

        controller.setScene('growth');

        expect(root.dataset.homeScene).toBe('growth');
        expect(root.querySelector('[data-home-command]')?.textContent).toContain('此园非库');
        controller.destroy();
    });

    it('restores a previous scene without waiting for typing', () => {
        const root = buildStoryRoot();
        const controller = createHomeStoryController(root, { reducedMotion: true });

        controller.setScene('scroll');
        controller.setScene('interests');

        expect(root.dataset.homeScene).toBe('interests');
        expect(root.querySelector('[data-home-status]')?.textContent).toBe('四志已列。');
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

        controller.setScene('growth');

        const growthStage = root.querySelector('[data-home-story-scene="growth"] [data-home-command]');
        const desktopStage = root.querySelector('.home-story__stage-column [data-home-command]');
        expect(growthStage?.textContent).toContain('此园非库');
        expect(desktopStage?.textContent).toBe('');
        controller.destroy();
    });

    it('shows completed commands immediately for reduced motion', () => {
        const root = buildStoryRoot();
        const controller = createHomeStoryController(root, { reducedMotion: true });

        controller.setScene('scroll');

        expect(root.querySelector('[data-home-command]')?.textContent).toBe('今添吾色，易其字，展此长卷。');
        expect(root.querySelector('[data-home-status]')?.textContent).toBe('墨色已定。长卷已展。');
        controller.destroy();
    });
});
