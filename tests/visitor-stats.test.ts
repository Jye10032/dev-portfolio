import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it, vi } from 'vitest';
import { fetchVisitorStats } from '../src/utils/umami';

const visitorComponent = readFileSync(resolve('src/components/home/VisitorStats.astro'), 'utf8');
const homePage = readFileSync(resolve('src/pages/index.astro'), 'utf8');

describe('visitor statistics', () => {
    it('renders the visitor module before the latest and topic sections', () => {
        expect(homePage).toContain("import VisitorStats from '../components/home/VisitorStats.astro'");
        expect(homePage).toContain('<VisitorStats />');
        expect(homePage.indexOf('<VisitorStats />')).toBeLessThan(homePage.indexOf('<!-- 最新动态 -->'));
        expect(visitorComponent).toContain('今日浏览');
        expect(visitorComponent).toContain('累计浏览');
        expect(visitorComponent).toContain('独立访客');
    });

    it('reads public share metadata before requesting overview statistics', async () => {
        const fetchImpl = vi
            .fn<typeof fetch>()
            .mockResolvedValueOnce(Response.json({ websiteId: 'website-id', token: 'public-share-token', parameters: { overview: true } }))
            .mockResolvedValueOnce(Response.json({ pageviews: 5, visitors: 2, visits: 3 }))
            .mockResolvedValueOnce(Response.json({ pageviews: 30, visitors: 8, visits: 10 }));

        const stats = await fetchVisitorStats({
            websiteId: 'website-id',
            shareId: 'share-id',
            now: new Date('2026-09-01T07:00:00.000Z'),
            fetchImpl
        });

        expect(stats.today.pageviews).toBe(5);
        expect(stats.total.visitors).toBe(8);
        expect(fetchImpl).toHaveBeenCalledTimes(3);
        expect(fetchImpl.mock.calls[1][0]).toContain('startAt=1788192000000');
        expect(fetchImpl.mock.calls[1][1]).toMatchObject({
            headers: { 'x-umami-share-token': 'public-share-token', 'x-umami-share-context': '1' }
        });
        expect(fetchImpl.mock.calls[2][0]).toContain('startAt=0');
    });

    it('rejects a share that belongs to another website', async () => {
        const fetchImpl = vi.fn<typeof fetch>().mockResolvedValueOnce(Response.json({ websiteId: 'other-id', token: 'token' }));

        await expect(fetchVisitorStats({ websiteId: 'website-id', shareId: 'share-id', fetchImpl })).rejects.toThrow('does not allow website overview access');
    });
});
