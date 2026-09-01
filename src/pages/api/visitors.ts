import type { APIRoute } from 'astro';
import siteConfig from '../../data/site-config';
import { getVisitorStats } from '../../utils/umami';

export const prerender = false;

export const GET: APIRoute = async () => {
    const umami = siteConfig.umami;

    if (!umami?.websiteId || !umami.shareId) {
        return Response.json({ error: 'Visitor statistics are not configured' }, { status: 503 });
    }

    try {
        const stats = await getVisitorStats({ websiteId: umami.websiteId, shareId: umami.shareId });
        return Response.json(stats, {
            headers: { 'Cache-Control': 'public, max-age=0, s-maxage=300, stale-while-revalidate=600' }
        });
    } catch (error) {
        console.error('Unable to load Umami visitor statistics', error);
        return Response.json({ error: 'Visitor statistics are temporarily unavailable' }, { status: 502 });
    }
};
