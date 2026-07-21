/**
 * 便利贴墙运行时 store:极简发布订阅。
 * 持有 WallState,所有变更统一走 setState → 通知订阅者 + debounceSave。
 */

import { buildSeedWall } from './seed';
import { createNote, debounceSave, deleteNote, loadWall, saveWall, updateNote } from './storage';
import type { Note, WallState } from './types';

type Listener = (state: WallState) => void;

let state: WallState | null = null;
const listeners = new Set<Listener>();

// 懒初始化:首次访问时若 localStorage 为空则生成示例墙并立即落盘
function ensureState(): WallState {
    if (!state) {
        state = loadWall();
        if (!state) {
            state = buildSeedWall();
            saveWall(state);
        }
    }
    return state;
}

export function getState(): WallState {
    return ensureState();
}

export function setState(next: WallState): void {
    state = next;
    listeners.forEach((listener) => listener(next));
    debounceSave(next);
}

export function subscribe(listener: Listener): () => void {
    listeners.add(listener);
    return () => {
        listeners.delete(listener);
    };
}

export function select(id: string | null): void {
    const current = ensureState();
    if (current.selectedId === id) return;
    let notes = current.notes;
    // 选中时把该便签的 zIndex 提升为最大 +1,使其浮到最上层
    if (id) {
        const maxZ = notes.reduce((max, n) => Math.max(max, n.zIndex), 0);
        notes = notes.map((n) => (n.id === id ? { ...n, zIndex: maxZ + 1 } : n));
    }
    setState({ ...current, notes, selectedId: id });
}

export function addNote(partial: Partial<Note> = {}): Note {
    const defaults: Partial<Note> = { content: '写点什么……', x: 120, y: 120 };
    const next = createNote(ensureState(), { ...defaults, ...partial });
    const note = next.notes[next.notes.length - 1];
    setState({ ...next, selectedId: note.id });
    return note;
}

export function patchNote(id: string, patch: Partial<Note>): void {
    setState(updateNote(ensureState(), id, patch));
}

export function removeNote(id: string): void {
    setState(deleteNote(ensureState(), id));
}

export function duplicateNote(id: string): Note | null {
    const current = ensureState();
    const source = current.notes.find((n) => n.id === id);
    if (!source) return null;
    const now = Date.now();
    const maxZ = current.notes.reduce((max, n) => Math.max(max, n.zIndex), 0);
    const copy: Note = {
        ...source,
        id: crypto.randomUUID(),
        x: source.x + 24,
        y: source.y + 24,
        zIndex: maxZ + 1,
        createdAt: now,
        updatedAt: now
    };
    setState({ ...current, notes: [...current.notes, copy], selectedId: copy.id });
    return copy;
}

export function resetWall(): void {
    const seed = buildSeedWall();
    state = seed;
    saveWall(seed);
    listeners.forEach((listener) => listener(seed));
}
