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
    label: '当前项目' | '研究主题' | '近期整理';
    text: string;
    href?: string;
};

export type HomeFocusArea = {
    title: string;
    description: string;
    href: string;
    count: number;
};

export type HomeProofItem = {
    value: string;
    label: string;
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

export type UmamiAnalytics = {
    websiteId: string;
    scriptUrl?: string;
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
    umami?: UmamiAnalytics;
    postsPerPage?: number;
    projectsPerPage?: number;
};
