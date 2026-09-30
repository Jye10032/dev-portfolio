import { beforeEach, describe, expect, it } from 'vitest';
import { initAlbumFilter, matchesTag, readTagFromSearch } from '../../src/scripts/album-filter';
import { initAlbumView, readStoredMode } from '../../src/scripts/album-view';

beforeEach(() => {
    document.body.innerHTML = '';
    localStorage.clear();
});

function mountEntries(view = 'table') {
    document.body.innerHTML = `
        <section data-album-entries data-album-view="${view}">
            <button data-album-view-button="table" aria-pressed="true">表格</button>
            <button data-album-view-button="cards" aria-pressed="false">卡片</button>
        </section>
    `;
    return document.querySelector<HTMLElement>('[data-album-entries]')!;
}

function mountIndex() {
    document.body.innerHTML = `
        <div data-album-index>
            <p data-album-filter-status></p>
            <button data-album-filter="all" aria-pressed="true">全部</button>
            <button data-album-filter="prd" aria-pressed="false">prd</button>
            <button data-album-filter="research" aria-pressed="false">research</button>
            <article data-album-tags="prd research"></article>
            <article data-album-tags="research"></article>
            <article data-album-tags=""></article>
        </div>
    `;
    return document.querySelector<HTMLElement>('[data-album-index]')!;
}

describe('initAlbumView', () => {
    it('switches the view mode and persists the choice', () => {
        const root = mountEntries();
        initAlbumView(root, localStorage);

        root.querySelector<HTMLButtonElement>('[data-album-view-button="cards"]')!.click();

        expect(root.dataset.albumView).toBe('cards');
        expect(root.querySelector('[data-album-view-button="cards"]')!.getAttribute('aria-pressed')).toBe('true');
        expect(root.querySelector('[data-album-view-button="table"]')!.getAttribute('aria-pressed')).toBe('false');
        expect(readStoredMode(localStorage)).toBe('cards');
    });

    it('restores the stored mode over the markup default', () => {
        localStorage.setItem('album-view-mode', 'cards');
        const root = mountEntries('table');

        initAlbumView(root, localStorage);

        expect(root.dataset.albumView).toBe('cards');
    });

    it('ignores an unknown stored value', () => {
        localStorage.setItem('album-view-mode', 'carousel');
        expect(readStoredMode(localStorage)).toBeNull();
    });

    it('returns null when the toggle markup is absent', () => {
        document.body.innerHTML = '<section data-album-entries></section>';
        expect(initAlbumView(document.querySelector<HTMLElement>('[data-album-entries]')!, localStorage)).toBeNull();
    });

    it('cleanup detaches the listeners', () => {
        const root = mountEntries();
        const cleanup = initAlbumView(root, localStorage);
        cleanup?.();

        root.querySelector<HTMLButtonElement>('[data-album-view-button="cards"]')!.click();

        expect(root.dataset.albumView).toBe('table');
    });
});

describe('matchesTag and readTagFromSearch', () => {
    it('matches only whole tag tokens', () => {
        expect(matchesTag('prd research', 'prd')).toBe(true);
        expect(matchesTag('prd research', 'pr')).toBe(false);
        expect(matchesTag('', 'all')).toBe(true);
    });

    it('falls back to all when no tag param is present', () => {
        expect(readTagFromSearch('?tag=prd')).toBe('prd');
        expect(readTagFromSearch('')).toBe('all');
    });
});

describe('initAlbumFilter', () => {
    it('hides cards that do not carry the selected tag', () => {
        const root = mountIndex();
        initAlbumFilter(root, '');

        root.querySelector<HTMLButtonElement>('[data-album-filter="prd"]')!.click();

        const cards = Array.from(root.querySelectorAll<HTMLElement>('[data-album-tags]'));
        expect(cards.map((card) => card.hidden)).toEqual([false, true, true]);
        expect(root.querySelector('[data-album-filter-status]')!.textContent).toBe('筛选出 1 个专辑');
    });

    it('applies a deep-linked tag on init', () => {
        const root = mountIndex();
        initAlbumFilter(root, '?tag=research');

        const cards = Array.from(root.querySelectorAll<HTMLElement>('[data-album-tags]'));
        expect(cards.map((card) => card.hidden)).toEqual([false, false, true]);
        expect(root.querySelector('[data-album-filter="research"]')!.getAttribute('aria-pressed')).toBe('true');
    });

    it('ignores a deep-linked tag that has no button', () => {
        const root = mountIndex();
        initAlbumFilter(root, '?tag=nope');

        const cards = Array.from(root.querySelectorAll<HTMLElement>('[data-album-tags]'));
        expect(cards.every((card) => !card.hidden)).toBe(true);
        expect(root.querySelector('[data-album-filter-status]')!.textContent).toBe('共 3 个专辑');
    });

    it('cleanup restores every card to visible', () => {
        const root = mountIndex();
        const cleanup = initAlbumFilter(root, '?tag=prd');
        cleanup?.();

        expect(Array.from(root.querySelectorAll<HTMLElement>('[data-album-tags]')).every((card) => !card.hidden)).toBe(true);
    });
});
