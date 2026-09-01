/**
 * 便利贴墙客户端入口。
 * 负责:初始化 store、把 WallState 渲染成便签 DOM、绑定拖拽/编辑/面板交互。
 * 幂等:同一 #wall-root 重复调用 initWall 会直接跳过(ClientRouter 下 DOM 每次是新节点,不受影响)。
 */

import interact from 'interactjs';
import { addNote, duplicateNote, getState, patchNote, removeNote, resetWall, select, subscribe } from './store';
import type { Note, WallState } from './types';

function clamp(value: number, min: number, max: number): number {
    return Math.min(Math.max(value, min), max);
}

export function initWall(root: HTMLElement): (() => void) | void {
    if (root.dataset.wallInit === 'true') return;
    root.dataset.wallInit = 'true';

    const notesLayer = root.querySelector<HTMLElement>('#wall-notes');
    const addButton = root.querySelector<HTMLButtonElement>('#wall-add');
    const resetButton = root.querySelector<HTMLButtonElement>('#wall-reset');
    const emptyState = root.querySelector<HTMLElement>('#wall-empty');
    const panel = root.querySelector<HTMLElement>('.wall-panel');
    if (!notesLayer || !addButton || !resetButton || !panel) return;

    const hint = panel.querySelector<HTMLElement>('.wall-panel__hint');
    // 正在编辑的便签 id:全量重渲染时跳过,避免打断输入
    let editingId: string | null = null;

    function getClampedPosition(noteEl: HTMLElement, x: number, y: number) {
        const layerRect = notesLayer!.getBoundingClientRect();
        const noteRect = noteEl.getBoundingClientRect();
        const minX = 16;
        const minY = 64;
        const maxX = Math.max(minX, layerRect.width - noteRect.width - 16);
        const maxY = Math.max(minY, layerRect.height - noteRect.height - 16);

        return {
            x: clamp(x, minX, maxX),
            y: clamp(y, minY, maxY)
        };
    }

    function clampRenderedNotes(): void {
        notesLayer!.querySelectorAll<HTMLElement>('.wall-note').forEach((el) => {
            const x = parseFloat(el.dataset.x ?? '0') || 0;
            const y = parseFloat(el.dataset.y ?? '0') || 0;
            const position = getClampedPosition(el, x, y);
            el.dataset.x = String(position.x);
            el.dataset.y = String(position.y);
            el.style.transform = `translate(${position.x}px, ${position.y}px)`;
        });
    }

    function noteElement(note: Note): HTMLElement {
        const el = document.createElement('article');
        el.className = 'wall-note';
        el.dataset.id = note.id;
        el.dataset.color = note.color;
        el.dataset.style = note.style;
        el.dataset.size = note.size;
        el.style.transform = `translate(${note.x}px, ${note.y}px)`;
        // 同步写 dataset,dragmove 会从这里读增量起点,避免首次拖动瞬移
        el.dataset.x = String(note.x);
        el.dataset.y = String(note.y);
        el.style.zIndex = String(note.zIndex);
        el.tabIndex = 0;

        if (note.icon) {
            const icon = document.createElement('span');
            icon.className = 'wall-note__icon';
            icon.textContent = note.icon;
            el.appendChild(icon);
        }

        const content = document.createElement('div');
        content.className = 'wall-note__content wall-note__drag';
        content.textContent = note.content;
        el.appendChild(content);
        return el;
    }

    function render(state: WallState): void {
        const existing = new Map<string, HTMLElement>();
        notesLayer!.querySelectorAll<HTMLElement>('.wall-note').forEach((el) => {
            existing.set(el.dataset.id!, el);
        });

        const fragment = document.createDocumentFragment();
        for (const note of state.notes) {
            // 编辑中的便签保留原 DOM,仅同步选中态
            if (note.id === editingId && existing.has(note.id)) {
                const el = existing.get(note.id)!;
                el.classList.toggle('is-selected', note.id === state.selectedId);
                el.style.zIndex = String(note.zIndex);
                el.style.transform = `translate(${note.x}px, ${note.y}px)`;
                el.dataset.x = String(note.x);
                el.dataset.y = String(note.y);
                fragment.appendChild(el);
                continue;
            }
            const el = noteElement(note);
            el.classList.toggle('is-selected', note.id === state.selectedId);
            fragment.appendChild(el);
        }
        notesLayer!.replaceChildren(fragment);
        if (emptyState) emptyState.hidden = state.notes.length > 0;
        requestAnimationFrame(clampRenderedNotes);
        renderPanel(state);
    }

    function renderPanel(state: WallState): void {
        const note = state.notes.find((n) => n.id === state.selectedId) ?? null;
        if (note) {
            panel!.hidden = false;
            requestAnimationFrame(() => panel!.classList.add('wall-panel--open'));
        } else {
            panel!.classList.remove('wall-panel--open');
        }
        if (hint) hint.textContent = note ? '已选中便签' : '未选中便签';
        if (!note) return;

        panel!.querySelectorAll<HTMLElement>('[data-color]').forEach((btn) => {
            btn.classList.toggle('is-active', btn.dataset.color === note.color);
        });
        panel!.querySelectorAll<HTMLElement>('[data-style]').forEach((btn) => {
            btn.classList.toggle('is-active', btn.dataset.style === note.style);
        });
        panel!.querySelectorAll<HTMLElement>('[data-size]').forEach((btn) => {
            btn.classList.toggle('is-active', btn.dataset.size === note.size);
        });
        panel!.querySelectorAll<HTMLElement>('[data-icon]').forEach((btn) => {
            btn.classList.toggle('is-active', (btn.dataset.icon || null) === note.icon);
        });
    }

    function enterEdit(id: string): void {
        const escapedId = typeof CSS !== 'undefined' && typeof CSS.escape === 'function' ? CSS.escape(id) : id.replace(/[\']/g, '\$&');
        const el = notesLayer!.querySelector<HTMLElement>(`.wall-note[data-id='${escapedId}']`);
        const content = el?.querySelector<HTMLElement>('.wall-note__content');
        if (!el || !content || editingId === id) return;
        editingId = id;
        content.contentEditable = 'true';
        content.focus();
        // 全选现有文字,方便直接覆盖输入
        const range = document.createRange();
        range.selectNodeContents(content);
        const selection = window.getSelection();
        selection?.removeAllRanges();
        selection?.addRange(range);

        const exit = () => {
            content.removeEventListener('blur', exit);
            content.removeEventListener('keydown', onKey);
            content.contentEditable = 'false';
            const text = content.innerText.replace(/\n$/, '');
            editingId = null;
            if (text !== getState().notes.find((n) => n.id === id)?.content) {
                patchNote(id, { content: text });
            } else {
                render(getState());
            }
        };
        const onKey = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                event.preventDefault();
                content.blur();
            }
        };
        content.addEventListener('blur', exit);
        content.addEventListener('keydown', onKey);
    }

    // 拖拽:位移写在 transform 上,dragend 统一写回 store
    const draggable = interact('.wall-note', { context: notesLayer }).draggable({
        inertia: false,
        allowFrom: '.wall-note__drag',
        ignoreFrom: '[contenteditable]',
        listeners: {
            move(event) {
                const target = event.target as HTMLElement;
                const nextX = (parseFloat(target.dataset.x ?? '0') || 0) + event.dx;
                const nextY = (parseFloat(target.dataset.y ?? '0') || 0) + event.dy;
                const { x, y } = getClampedPosition(target, nextX, nextY);
                target.dataset.x = String(x);
                target.dataset.y = String(y);
                target.style.transform = `translate(${x}px, ${y}px)`;
            },
            end(event) {
                const target = event.target as HTMLElement;
                const id = target.dataset.id;
                if (!id) return;
                const { x, y } = getClampedPosition(target, parseFloat(target.dataset.x ?? '0') || 0, parseFloat(target.dataset.y ?? '0') || 0);
                patchNote(id, { x, y });
            }
        }
    });

    // 选中:点击便签选中,点击画布空白取消选中
    const onNotesClick = (event: Event) => {
        const noteEl = (event.target as HTMLElement).closest<HTMLElement>('.wall-note');
        if (noteEl?.dataset.id) {
            select(noteEl.dataset.id);
        } else if ((event.target as HTMLElement) === notesLayer) {
            select(null);
        }
    };
    notesLayer.addEventListener('click', onNotesClick);

    // 双击内容区进入编辑
    const onNotesDoubleClick = (event: Event) => {
        const content = (event.target as HTMLElement).closest<HTMLElement>('.wall-note__content');
        const noteEl = (event.target as HTMLElement).closest<HTMLElement>('.wall-note');
        if (content && noteEl?.dataset.id) {
            enterEdit(noteEl.dataset.id);
        }
    };
    notesLayer.addEventListener('dblclick', onNotesDoubleClick);

    // 键盘:Enter 选中,Delete 删除
    const onNotesKeyDown = (event: KeyboardEvent) => {
        const noteEl = (event.target as HTMLElement).closest<HTMLElement>('.wall-note');
        if (!noteEl?.dataset.id || editingId) return;
        if (event.key === 'Enter') {
            event.preventDefault();
            select(noteEl.dataset.id);
        } else if (event.key === 'Delete' || event.key === 'Backspace') {
            event.preventDefault();
            if (window.confirm('确定删除这张便利贴吗？')) {
                removeNote(noteEl.dataset.id);
            }
        }
    };
    notesLayer.addEventListener('keydown', onNotesKeyDown);

    // 新建:默认出现在画布可视中心附近,并直接进入编辑
    const onAddClick = () => {
        const rect = notesLayer!.getBoundingClientRect();
        const note = addNote({
            x: Math.max(16, rect.width / 2 - 112),
            y: Math.max(16, rect.height / 2 - 60)
        });
        enterEdit(note.id);
    };
    addButton.addEventListener('click', onAddClick);

    const onResetClick = () => {
        if (window.confirm('确定重置整面便利贴墙吗？这会恢复为示例状态。')) {
            resetWall();
        }
    };
    resetButton.addEventListener('click', onResetClick);

    // 面板:颜色/样式/尺寸/角标/复制/删除
    const onPanelClick = (event: Event) => {
        const btn = (event.target as HTMLElement).closest<HTMLButtonElement>('button');
        if (!btn) return;
        const selectedId = getState().selectedId;
        if (!selectedId) return;

        if (btn.dataset.color) {
            patchNote(selectedId, { color: btn.dataset.color as Note['color'] });
        } else if (btn.dataset.style) {
            patchNote(selectedId, { style: btn.dataset.style as Note['style'] });
        } else if (btn.dataset.size) {
            patchNote(selectedId, { size: btn.dataset.size as Note['size'] });
        } else if (btn.dataset.icon !== undefined) {
            patchNote(selectedId, { icon: btn.dataset.icon || null });
        } else if (btn.dataset.action === 'duplicate') {
            duplicateNote(selectedId);
        } else if (btn.dataset.action === 'delete') {
            if (window.confirm('确定删除这张便利贴吗？')) {
                removeNote(selectedId);
            }
        }
    };
    panel.addEventListener('click', onPanelClick);

    const onPanelTransitionEnd = () => {
        if (!panel.classList.contains('wall-panel--open')) {
            panel.hidden = true;
        }
    };
    panel.addEventListener('transitionend', onPanelTransitionEnd);

    const onResize = () => {
        requestAnimationFrame(clampRenderedNotes);
    };
    window.addEventListener('resize', onResize, { passive: true });

    const unsubscribe = subscribe(render);
    render(getState());

    return () => {
        unsubscribe();
        notesLayer.removeEventListener('click', onNotesClick);
        notesLayer.removeEventListener('dblclick', onNotesDoubleClick);
        notesLayer.removeEventListener('keydown', onNotesKeyDown);
        addButton.removeEventListener('click', onAddClick);
        resetButton.removeEventListener('click', onResetClick);
        panel.removeEventListener('click', onPanelClick);
        panel.removeEventListener('transitionend', onPanelTransitionEnd);
        window.removeEventListener('resize', onResize);
        draggable.unset();
        root.dataset.wallInit = 'false';
    };
}
