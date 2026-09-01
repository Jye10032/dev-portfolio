import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const homeComponent = readFileSync(resolve('src/components/home/HomeStory.astro'), 'utf8');
const homeStyles = readFileSync(resolve('src/styles/home-story.css'), 'utf8');
const globalStyles = readFileSync(resolve('src/styles/global.css'), 'utf8');

describe('homepage layout contract', () => {
    it('uses the homepage paper color as the global page background', () => {
        expect(globalStyles).toMatch(/:root\s*\{[\s\S]*?--bg-main:\s*#f7f5ef/);
        expect(globalStyles).toMatch(/html\.dark\s*\{[\s\S]*?--bg-main:\s*#24231f/);
        expect(homeStyles).not.toMatch(/body:has\(\.home-story\)\s*\{[\s\S]*?--bg-main:/);
    });

    it('restores the editor-led scroll story around current homepage content', () => {
        expect(homeComponent).toContain('data-home-story');
        expect(homeComponent).toContain('HomeStoryStage');
        expect(homeComponent).toContain('focusAreas.map');
        expect(homeComponent).toContain('homeNow.map');
        expect(homeComponent).toContain('recommendations.map');
        expect(homeComponent).toContain('proofItems.map');
    });

    it('keeps the sticky desktop editor and switches to inline editors on mobile', () => {
        expect(homeStyles).toMatch(/\.home-story__sticky[\s\S]*?position:\s*sticky/);
        expect(homeStyles).toMatch(/@media \(max-width: 1023px\)[\s\S]*?\.home-story__stage-column[\s\S]*?display:\s*none/);
        expect(homeStyles).toMatch(/@media \(max-width: 1023px\)[\s\S]*?\.home-scene__mobile-stage[\s\S]*?display:\s*block/);
    });

    it('scopes the warm paper and vermilion visual language to the homepage', () => {
        expect(homeStyles).toContain('body:has(.home-story)');
        expect(homeStyles).toContain('--home-paper: #f7f5ef');
        expect(homeStyles).toContain('--home-vermilion: #a33a2b');
        expect(homeStyles).toMatch(/body:has\(\.home-story\) > div > nav[\s\S]*?border-bottom:\s*0/);
    });
});
