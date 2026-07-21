import { beforeEach, describe, expect, it, vi } from 'vitest';

beforeEach(() => {
    vi.resetModules();
    localStorage.clear();
    vi.unstubAllGlobals();
    vi.stubGlobal('crypto', { randomUUID: () => 'test-uuid' });
});

describe('wall store lifecycle', () => {
    it('unsubscribe stops future notifications', async () => {
        const store = await import('../../src/utils/wall/store');

        const listener = vi.fn();
        const unsubscribe = store.subscribe(listener);

        store.select('seed-1');
        expect(listener).toHaveBeenCalledTimes(1);

        unsubscribe();
        store.select('seed-2');
        expect(listener).toHaveBeenCalledTimes(1);
    });

    it('can reset back to the seed wall state', async () => {
        const store = await import('../../src/utils/wall/store');

        store.addNote({ content: 'extra note' });
        expect(store.getState().notes.length).toBeGreaterThan(4);

        expect(typeof (store as { resetWall?: () => void }).resetWall).toBe('function');
        (store as { resetWall: () => void }).resetWall();

        expect(store.getState().notes.map((note) => note.id)).toEqual(['seed-1', 'seed-2', 'seed-3', 'seed-4']);
        expect(store.getState().selectedId).toBeNull();
    });
});
