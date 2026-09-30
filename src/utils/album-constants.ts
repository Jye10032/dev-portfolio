// Shared album constants. Keep this module free of `astro:content` imports so
// `src/content.config.ts` can import it without pulling the content layer into itself.

export const ALBUM_ACCENTS = ['yellow', 'mint', 'blue', 'coral', 'lavender', 'cream'] as const;
export type AlbumAccent = (typeof ALBUM_ACCENTS)[number];

export const ALBUM_STATUSES = ['collecting', 'synthesized', 'archived'] as const;
export type AlbumStatus = (typeof ALBUM_STATUSES)[number];

export const ALBUM_ENTRY_KINDS = ['method', 'framework', 'template', 'article', 'tool'] as const;
export type AlbumEntryKind = (typeof ALBUM_ENTRY_KINDS)[number];

export const ALBUM_STATUS_LABELS: Record<AlbumStatus, string> = {
    collecting: '收集中',
    synthesized: '已成文',
    archived: '已归档'
};

export const ALBUM_ENTRY_KIND_LABELS: Record<AlbumEntryKind, string> = {
    method: '方法',
    framework: '框架',
    template: '模板',
    article: '文章',
    tool: '工具'
};
