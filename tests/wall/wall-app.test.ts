import { beforeEach, describe, expect, it, vi } from 'vitest';

function buildWallRoot() {
    document.body.innerHTML = [
        '<div id="wall-root">',
        '  <div class="wall-canvas">',
        '    <button id="wall-add" type="button">+ 新建</button>',
        '    <button id="wall-reset" type="button">重置墙</button>',
        '    <p id="wall-empty" hidden>墙上还没有便利贴。</p>',
        '    <div id="wall-notes"></div>',
        '  </div>',
        '  <aside class="wall-panel" hidden>',
        '    <p class="wall-panel__hint"></p>',
        '    <button data-action="delete">删除</button>',
        '    <button data-color="yellow">yellow</button>',
        '    <button data-style="plain">plain</button>',
        '    <button data-size="md">md</button>',
        '    <button data-icon="">none</button>',
        '  </aside>',
        '</div>'
    ].join('');
    return document.getElementById('wall-root') as HTMLElement;
}

beforeEach(() => {
    vi.resetModules();
    localStorage.clear();
    vi.unstubAllGlobals();
    vi.stubGlobal('crypto', { randomUUID: () => 'test-uuid' });
    vi.stubGlobal('requestAnimationFrame', (cb: FrameRequestCallback) => {
        cb(0);
        return 1;
    });
});

describe('wall app interactions', () => {
    it('creates a note and enters editing when the add button is clicked', async () => {
        const root = buildWallRoot();
        const { initWall } = await import('../../src/utils/wall/wall-app');
        const store = await import('../../src/utils/wall/store');

        initWall(root);
        const initialCount = store.getState().notes.length;
        const addButton = root.querySelector('#wall-add') as HTMLButtonElement;
        addButton.click();

        const newNote = root.querySelector('.wall-note[data-id="test-uuid"]') as HTMLElement;
        const content = newNote.querySelector('.wall-note__content') as HTMLElement;
        expect(store.getState().notes).toHaveLength(initialCount + 1);
        expect(newNote).not.toBeNull();
        expect(content.contentEditable).toBe('true');
    });

    it('requires confirmation before deleting a selected note', async () => {
        const confirmSpy = vi.fn(() => false);
        vi.stubGlobal('confirm', confirmSpy);

        const root = buildWallRoot();
        const { initWall } = await import('../../src/utils/wall/wall-app');
        const store = await import('../../src/utils/wall/store');

        initWall(root);
        store.select('seed-1');

        const deleteButton = root.querySelector('[data-action="delete"]') as HTMLButtonElement;
        deleteButton.click();

        expect(confirmSpy).toHaveBeenCalledTimes(1);
        expect(store.getState().notes.some((note) => note.id === 'seed-1')).toBe(true);
    });

    it('returns a cleanup function so a wall instance can be torn down on route leave', async () => {
        const root = buildWallRoot();
        const { initWall } = await import('../../src/utils/wall/wall-app');

        const cleanup = initWall(root);

        expect(typeof cleanup).toBe('function');
        cleanup?.();
    });

    it('keeps the panel mounted until transition end when selection is cleared', async () => {
        const root = buildWallRoot();
        const { initWall } = await import('../../src/utils/wall/wall-app');
        const store = await import('../../src/utils/wall/store');

        initWall(root);
        store.select('seed-1');

        const panel = root.querySelector('.wall-panel') as HTMLElement;
        expect(panel.hidden).toBe(false);

        store.select(null);
        expect(panel.hidden).toBe(false);
        expect(panel.classList.contains('wall-panel--open')).toBe(false);

        panel.dispatchEvent(new Event('transitionend'));
        expect(panel.hidden).toBe(true);
    });

    it('uses Enter for newline while editing and only exits on blur or Escape', async () => {
        const root = buildWallRoot();
        const { initWall } = await import('../../src/utils/wall/wall-app');
        const store = await import('../../src/utils/wall/store');

        initWall(root);
        const noteEl = root.querySelector('.wall-note[data-id="seed-1"] .wall-note__content') as HTMLElement;
        noteEl.dispatchEvent(new MouseEvent('dblclick', { bubbles: true }));

        expect(noteEl.contentEditable).toBe('true');

        const enterEvent = new KeyboardEvent('keydown', { key: 'Enter', bubbles: true, cancelable: true });
        noteEl.dispatchEvent(enterEvent);
        expect(enterEvent.defaultPrevented).toBe(false);

        noteEl.blur();
        expect(store.getState().notes.some((note) => note.id === 'seed-1')).toBe(true);
    });

    it('resets the wall after confirmation', async () => {
        const confirmSpy = vi.fn(() => true);
        vi.stubGlobal('confirm', confirmSpy);

        const root = buildWallRoot();
        const { initWall } = await import('../../src/utils/wall/wall-app');
        const store = await import('../../src/utils/wall/store');

        initWall(root);
        store.addNote({ content: 'extra note' });

        const resetButton = root.querySelector('#wall-reset') as HTMLButtonElement;
        resetButton.click();

        expect(confirmSpy).toHaveBeenCalledTimes(1);
        expect(store.getState().notes.map((note) => note.id)).toEqual(['seed-1', 'seed-2', 'seed-3', 'seed-4']);
    });

    it('shows an explicit empty state without restoring deleted notes', async () => {
        const root = buildWallRoot();
        const store = await import('../../src/utils/wall/store');
        store.setState({ version: 1, selectedId: null, notes: [] });

        const { initWall } = await import('../../src/utils/wall/wall-app');
        initWall(root);

        const emptyState = root.querySelector('#wall-empty') as HTMLElement;
        expect(emptyState.hidden).toBe(false);
        expect(root.querySelectorAll('.wall-note')).toHaveLength(0);
        expect(store.getState().notes).toHaveLength(0);
    });

    it('keeps rendered notes inside the visible canvas on load and resize', async () => {
        const root = buildWallRoot();
        const notesLayer = root.querySelector('#wall-notes') as HTMLElement;
        let layerWidth = 360;
        let layerHeight = 420;
        vi.spyOn(notesLayer, 'getBoundingClientRect').mockImplementation(
            () =>
                ({ width: layerWidth, height: layerHeight, top: 0, right: layerWidth, bottom: layerHeight, left: 0, x: 0, y: 0, toJSON: () => ({}) }) as DOMRect
        );

        const originalRect = HTMLElement.prototype.getBoundingClientRect;
        vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(function () {
            if ((this as HTMLElement).classList?.contains('wall-note')) {
                return { width: 224, height: 120, top: 0, right: 224, bottom: 120, left: 0, x: 0, y: 0, toJSON: () => ({}) } as DOMRect;
            }
            return originalRect.call(this);
        });

        const { initWall } = await import('../../src/utils/wall/wall-app');
        initWall(root);

        const farNote = root.querySelector('.wall-note[data-id="seed-4"]') as HTMLElement;
        expect(farNote.style.transform).toBe('translate(120px, 284px)');

        layerWidth = 300;
        layerHeight = 340;
        window.dispatchEvent(new Event('resize'));
        expect(farNote.style.transform).toBe('translate(60px, 204px)');
    });
});
