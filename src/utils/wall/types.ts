export type NoteColor = 'yellow' | 'mint' | 'blue' | 'coral' | 'lavender' | 'cream';
export type NoteStyle = 'plain' | 'lined' | 'grid' | 'taped';
export type NoteSize = 'sm' | 'md' | 'lg';

export interface Note {
    id: string;
    content: string;
    color: NoteColor;
    style: NoteStyle;
    size: NoteSize;
    x: number;
    y: number;
    zIndex: number;
    icon: string | null;
    createdAt: number;
    updatedAt: number;
}

export interface WallState {
    version: 1;
    notes: Note[];
    selectedId: string | null;
}

export const NOTE_COLORS: NoteColor[] = ['yellow', 'mint', 'blue', 'coral', 'lavender', 'cream'];
export const NOTE_STYLES: NoteStyle[] = ['plain', 'lined', 'grid', 'taped'];
export const NOTE_SIZES: NoteSize[] = ['sm', 'md', 'lg'];
export const NOTE_ICONS: string[] = ['💡', '📌', '✏️', '🔥', '🌱', '⭐', '🎯', '☕', '📖', '🧠', '🎨', '🚀'];
