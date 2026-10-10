export const BLOG_SERIES_IDS = ['fementor', 'videogaga'] as const;

export const BLOG_SERIES: Record<(typeof BLOG_SERIES_IDS)[number], { title: string; projectHref?: string }> = {
    fementor: { title: 'FEMentor', projectHref: '/projects/fementor/' },
    videogaga: { title: 'VideoGaga' }
};
