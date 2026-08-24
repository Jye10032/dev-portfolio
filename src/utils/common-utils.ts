export function slugify(input?: string) {
    if (!input) return '';

    let slug = input.toLowerCase().trim();

    slug = slug.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    slug = slug.replace(/[^\p{Letter}\p{Number}\s-]/gu, ' ').trim();
    slug = slug.replace(/[\s-]+/g, '-');

    return slug;
}
