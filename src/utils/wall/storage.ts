/**
 * 便利贴墙存储边界层。
 *
 * 这是整个 wall 模块唯一接触 localStorage 的地方。
 * UI / store 只能通过下面五个方法 + debounceSave 读写状态,
 * 未来如果换成云后端,只要保持这几个签名不变,上层代码零改动。
 *
 * 注意:createNote / updateNote / deleteNote 是纯函数,
 * 只返回新的 WallState,不做持久化 —— 落盘时机交给调用方(store)决定。
 */

import type { Note, WallState } from './types';

const STORAGE_KEY = 'misaka.wall.v1';

export function loadWall(): WallState | null {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return null;
        const parsed = JSON.parse(raw) as WallState;
        if (parsed?.version !== 1 || !Array.isArray(parsed.notes)) return null;
        return parsed;
    } catch {
        return null;
    }
}

export function saveWall(state: WallState): void {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
        // 静默失败:隐私模式 / 配额满等情况不影响内存态
    }
}

export function createNote(state: WallState, partial: Partial<Note>): WallState {
    const now = Date.now();
    const maxZ = state.notes.reduce((max, n) => Math.max(max, n.zIndex), 0);
    const note: Note = {
        id: crypto.randomUUID(),
        content: '',
        color: 'yellow',
        style: 'plain',
        size: 'md',
        x: 80,
        y: 80,
        zIndex: maxZ + 1,
        icon: null,
        createdAt: now,
        updatedAt: now,
        ...partial
    };
    return {
        ...state,
        notes: [...state.notes, note]
    };
}

export function updateNote(state: WallState, id: string, patch: Partial<Note>): WallState {
    const now = Date.now();
    return {
        ...state,
        notes: state.notes.map((n) => (n.id === id ? { ...n, ...patch, id: n.id, updatedAt: now } : n))
    };
}

export function deleteNote(state: WallState, id: string): WallState {
    return {
        ...state,
        notes: state.notes.filter((n) => n.id !== id),
        selectedId: state.selectedId === id ? null : state.selectedId
    };
}

let saveTimer: ReturnType<typeof setTimeout> | null = null;

export function debounceSave(state: WallState, ms: number = 300): void {
    if (saveTimer !== null) clearTimeout(saveTimer);
    saveTimer = setTimeout(() => {
        saveWall(state);
        saveTimer = null;
    }, ms);
}
