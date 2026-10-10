import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { globSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const COLOUR = /#[0-9a-fA-F]{3,8}\b|rgba?\(\s*[\d.]|hsla?\(\s*[\d.]/;
const COMMENT = /\/\*[\s\S]*?\*\//g;

/** Line numbers inside blocks that declare nothing but custom properties. */
function tokenBlockLines(source: string): Set<number> {
    const lines = new Set<number>();

    for (const match of source.matchAll(/\{[^{}]*\}/g)) {
        const body = match[0].slice(1, -1).replace(COMMENT, '');
        const declarations = body
            .split(';')
            .map((part) => part.trim())
            .filter(Boolean);

        if (declarations.length === 0 || !declarations.every((part) => part.startsWith('--'))) continue;

        const start = source.slice(0, match.index).split('\n').length - 1;
        const end = source.slice(0, match.index + match[0].length).split('\n').length - 1;
        for (let line = start; line <= end; line += 1) lines.add(line);
    }

    return lines;
}

function literalColoursOutsideTokenBlocks(file: string): string[] {
    const source = readFileSync(resolve(file), 'utf8');
    const allowed = tokenBlockLines(source);

    return source
        .split('\n')
        .map((line, index) => ({ line, index }))
        .filter(({ line, index }) => COLOUR.test(line) && !allowed.has(index))
        .map(({ line, index }) => `${file}:${index + 1}: ${line.trim()}`);
}

/** Token names in a block whose value carries a colour. Numeric tokens such as
 *  `--home-scroll-progress` need no dark counterpart, so they are skipped. */
function colourTokensIn(blockBody: string): Set<string> {
    const names = new Set<string>();
    for (const [, name, value] of blockBody.replace(COMMENT, '').matchAll(/(--[\w-]+)\s*:([^;]*)/g)) {
        if (COLOUR.test(value)) names.add(name);
    }
    return names;
}

const styleFiles = globSync('src/**/*.{css,astro}').sort();

describe('design token contract', () => {
    it('declares no literal colour outside a token block', () => {
        // Retheming must only ever mean editing a token block. Any literal
        // colour in a rule is a value a theme switch cannot reach, and in
        // practice becomes a dark-mode bug.
        // A missing scan target must not silently pass, regardless of file count.
        expect(styleFiles.length).toBeGreaterThan(0);
        const violations = styleFiles.flatMap(literalColoursOutsideTokenBlocks);
        expect(violations).toEqual([]);
    });

    it('pairs every global colour token with a dark counterpart', () => {
        const source = readFileSync(resolve('src/styles/global.css'), 'utf8');
        const blockFor = (selector: string) => {
            const block = source.match(new RegExp(`${selector}\\s*\\{([^}]*)\\}`));
            if (!block) throw new Error(`missing ${selector} token block`);
            return colourTokensIn(block[1]);
        };

        const light = blockFor(':root');
        const dark = blockFor('html\\.dark');

        expect(light.size).toBeGreaterThan(10);
        expect([...light].filter((token) => !dark.has(token))).toEqual([]);
    });

    it('pairs every home-story colour token with a dark counterpart', () => {
        const source = readFileSync(resolve('src/styles/home-story.css'), 'utf8');

        const lightBlock = source.match(/\.home-story,\s*\nbody:has\(\.home-story\)\s*\{([^}]*)\}/);
        const darkBlock = source.match(/\.dark \.home-story,[\s\S]*?\{([^}]*)\}/);
        expect(lightBlock).not.toBeNull();
        expect(darkBlock).not.toBeNull();

        const light = colourTokensIn(lightBlock![1]);
        const dark = colourTokensIn(darkBlock![1]);

        // The terminal is a terminal mock, intentionally dark in both modes.
        const intentionallyShared = new Set(['--home-terminal-bg', '--home-terminal-ink', '--home-terminal-accent']);
        expect([...light].filter((token) => !dark.has(token) && !intentionallyShared.has(token))).toEqual([]);
    });
});
