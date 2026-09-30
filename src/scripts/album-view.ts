export type AlbumViewMode = 'table' | 'cards';

const STORAGE_KEY = 'album-view-mode';
const MODES: AlbumViewMode[] = ['table', 'cards'];

export function readStoredMode(storage: Pick<Storage, 'getItem'> | null): AlbumViewMode | null {
    try {
        const value = storage?.getItem(STORAGE_KEY);
        return MODES.includes(value as AlbumViewMode) ? (value as AlbumViewMode) : null;
    } catch {
        return null;
    }
}

function writeStoredMode(storage: Pick<Storage, 'setItem'> | null, mode: AlbumViewMode): void {
    try {
        storage?.setItem(STORAGE_KEY, mode);
    } catch {
        // Private mode or blocked storage: the toggle still works for this page view.
    }
}

/**
 * Wires the table/cards toggle for an album's entry list.
 * Returns a cleanup function, or null when the expected markup is missing.
 */
export function initAlbumView(root: HTMLElement, storage: (Pick<Storage, 'getItem' | 'setItem'> | null) = globalThis.localStorage ?? null) {
    const buttons = Array.from(root.querySelectorAll<HTMLButtonElement>('[data-album-view-button]'));
    if (buttons.length === 0) return null;

    const apply = (mode: AlbumViewMode) => {
        root.dataset.albumView = mode;
        for (const button of buttons) {
            const isActive = button.dataset.albumViewButton === mode;
            button.setAttribute('aria-pressed', String(isActive));
        }
    };

    apply(readStoredMode(storage) ?? (root.dataset.albumView as AlbumViewMode | undefined) ?? 'table');

    const onClick = (event: Event) => {
        const target = (event.currentTarget as HTMLButtonElement).dataset.albumViewButton;
        if (!MODES.includes(target as AlbumViewMode)) return;
        const mode = target as AlbumViewMode;
        apply(mode);
        writeStoredMode(storage, mode);
    };

    for (const button of buttons) {
        button.addEventListener('click', onClick);
    }

    return () => {
        for (const button of buttons) {
            button.removeEventListener('click', onClick);
        }
    };
}
