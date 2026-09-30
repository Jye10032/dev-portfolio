import { describe, expect, it } from 'vitest';
import { slugify } from '../src/utils/common-utils';

describe('slugify', () => {
    it('keeps the existing kebab-case behavior for Latin text', () => {
        expect(slugify('Personal Growth')).toBe('personal-growth');
    });

    it('preserves Chinese tag names for valid tag routes', () => {
        expect(slugify('个人成长')).toBe('个人成长');
    });

    it('removes punctuation without returning an empty slug', () => {
        expect(slugify('C++')).toBe('c');
    });

    it('strips diacritics', () => {
        expect(slugify('Café Déjà')).toBe('cafe-deja');
    });

    it('does not leave leading or trailing hyphens that would break routes', () => {
        expect(slugify('  -- Hello, World! -- ')).toBe('hello-world');
        expect(slugify('***')).toBe('');
    });

    it('returns an empty slug for missing input', () => {
        expect(slugify()).toBe('');
        expect(slugify('')).toBe('');
    });
});
