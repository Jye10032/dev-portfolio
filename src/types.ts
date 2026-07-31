export type ImageInput = {
    src: ImageMetadata | string;
    alt?: string;
    caption?: string;
};

export type Link = {
    text: string;
    href: string;
};

export type Hero = {
    title?: string;
    text?: string;
    image?: ImageInput;
    actions?: Link[];
};

export type HomeIntro = {
    lead?: string;
    text?: string;
};

export type HomeNowItem = {
    label: '最近在做' | '最近在读' | '最近思考';
    text: string;
    href?: string;
};

export type SubscribeForm = {
    action: string;
    emailFieldName?: string;
    hiddenFields?: { name: string; value: string }[];
    honeypotFieldName?: string;
};

export type Subscribe = {
    enabled?: boolean;
    title?: string;
    text?: string;
    form?: SubscribeForm;
};

export type SiteConfig = {
    website: string;
    avatar?: ImageInput;
    title: string;
    subtitle?: string;
    description: string;
    image?: ImageInput;
    headerNavLinks?: Link[];
    footerNavLinks?: Link[];
    socialLinks?: Link[];
    hero?: Hero;
    homeIntro?: HomeIntro;
    homeNow?: HomeNowItem[];
    subscribe?: Subscribe;
    postsPerPage?: number;
    projectsPerPage?: number;
};
