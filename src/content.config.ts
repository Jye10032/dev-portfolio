import { glob } from 'astro/loaders';
import { defineCollection, z, type ImageFunction } from 'astro:content';
import { ALBUM_ACCENTS, ALBUM_ENTRY_KINDS, ALBUM_STATUSES } from './utils/album-constants';

/** Every collection loads flat Markdown/MDX from its own directory. */
const markdownIn = (directory: string) => glob({ pattern: '**/*.{md,mdx}', base: `./src/content/${directory}` });

/**
 * Optional per-entry SEO overrides. Length bounds are advisory limits that keep
 * titles and descriptions inside what search engines and social cards display.
 */
const seo = (image: ImageFunction) =>
    z
        .object({
            title: z.string().min(5).max(120).optional(),
            description: z.string().min(15).max(160).optional(),
            image: z
                .object({
                    src: image(),
                    alt: z.string().optional()
                })
                .optional(),
            pageType: z.enum(['website', 'article']).default('website')
        })
        .optional();

const PUBLIC_SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

const blog = defineCollection({
    loader: markdownIn('blog'),
    schema: ({ image }) =>
        z.object({
            title: z.string(),
            excerpt: z.string().optional(),
            publishDate: z.coerce.date(),
            updatedDate: z.coerce.date().optional(),
            draft: z.boolean().default(false),
            isFeatured: z.boolean().default(false),
            type: z.enum(['article', 'note']).default('article'),
            tags: z.array(z.string()).default([]),
            // Bilingual pairing: `translationKey` links the two editions,
            // `publicSlug` pins the URL so it survives a filename change.
            lang: z.enum(['zh-CN', 'en']).default('zh-CN'),
            translationKey: z.string().optional(),
            publicSlug: z.string().regex(PUBLIC_SLUG).optional(),
            readingTime: z.number().optional(),
            seo: seo(image)
        })
});

const pages = defineCollection({
    loader: markdownIn('pages'),
    schema: ({ image }) =>
        z.object({
            title: z.string(),
            draft: z.boolean().default(false),
            seo: seo(image)
        })
});

const projects = defineCollection({
    loader: markdownIn('projects'),
    schema: ({ image }) =>
        z
            .object({
                title: z.string(),
                description: z.string().optional(),
                publishDate: z.coerce.date(),
                draft: z.boolean().default(false),
                isFeatured: z.boolean().default(false),
                demo: z
                    .string()
                    .url()
                    .refine((url) => url.startsWith('https://'), '演示地址必须使用 HTTPS')
                    .optional(),
                embed: z.boolean().default(false),
                demoHeight: z.number().int().min(320).max(1200).default(640),
                seo: seo(image)
            })
            .refine((project) => !project.embed || Boolean(project.demo), {
                message: '开启内嵌演示时需要填写 demo 地址',
                path: ['demo']
            })
});

const albumEntrySchema = z.object({
    title: z.string(),
    url: z.string().url(),
    source: z.string(),
    author: z.string().optional(),
    kind: z.enum(ALBUM_ENTRY_KINDS).default('method'),
    core: z.string(),
    takeaway: z.string(),
    apply: z.string().optional(),
    quote: z.string().optional(),
    addedAt: z.coerce.date().optional(),
    deepDive: z.string().optional()
});

const albums = defineCollection({
    loader: markdownIn('albums'),
    schema: ({ image }) =>
        z.object({
            title: z.string(),
            question: z.string(),
            excerpt: z.string().optional(),
            accent: z.enum(ALBUM_ACCENTS).default('yellow'),
            status: z.enum(ALBUM_STATUSES).default('collecting'),
            skill: z.string().optional(),
            publishDate: z.coerce.date(),
            updatedDate: z.coerce.date().optional(),
            draft: z.boolean().default(false),
            tags: z.array(z.string()).default([]),
            entries: z.array(albumEntrySchema).default([]),
            seo: seo(image)
        })
});

export const collections = { albums, blog, pages, projects };
