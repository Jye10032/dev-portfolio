const DIACRITICS = /[̀-ͯ]/g;
const DISALLOWED = /[^\p{Letter}\p{Number}\s-]/gu;
const SEPARATORS = /[\s-]+/g;

/**
 * Builds a URL-safe slug. CJK characters are letters under `\p{Letter}`, so they
 * survive intact — tag routes such as `/tags/个人成长` depend on that.
 */
export function slugify(input?: string): string {
    if (!input) return '';

    return input
        .toLowerCase()
        .normalize('NFD')
        .replace(DIACRITICS, '')
        .replace(DISALLOWED, ' ')
        .trim()
        .replace(SEPARATORS, '-')
        .replace(/^-+|-+$/g, '');
}
