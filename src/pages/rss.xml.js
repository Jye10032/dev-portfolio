import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import siteConfig from '../data/site-config.ts';
import { getPostHref, sortItemsByDateDesc } from '../utils/data-utils.ts';

/** Chinese-language published posts, newest first. */
export async function GET(context) {
    const posts = (await getCollection('blog', ({ data }) => !data.draft && data.lang === 'zh-CN')).sort(sortItemsByDateDesc);

    return rss({
        title: siteConfig.title,
        description: siteConfig.description,
        site: context.site,
        items: posts.map((post) => {
            const pubDate = new Date(post.data.publishDate);
            pubDate.setUTCHours(0, 0, 0, 0);

            return {
                title: post.data.title,
                description: post.data.excerpt,
                link: getPostHref(post),
                pubDate
            };
        })
    });
}
