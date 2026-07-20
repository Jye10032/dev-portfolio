import avatar from '../assets/images/avatar.jpg';
import hero from '../assets/images/hero.jpg';
import type { SiteConfig } from '../types';

const siteConfig: SiteConfig = {
    website: 'https://misaka.design',
    avatar: {
        src: avatar,
        alt: 'misaka'
    },
    title: 'misaka.design',
    subtitle: '写作与思考',
    description: '一个关于设计、技术与生活的中文写作空间',
    image: {
        src: '/dante-preview.jpg',
        alt: 'misaka.design - 中文写作空间'
    },
    headerNavLinks: [
        {
            text: '首页',
            href: '/'
        },
        {
            text: '写作',
            href: '/blog'
        },
        {
            text: '主题',
            href: '/tags'
        }
    ],
    footerNavLinks: [
        {
            text: '关于',
            href: '/about'
        },
        {
            text: '联系',
            href: '/contact'
        }
    ],
    socialLinks: [
        {
            text: 'GitHub',
            href: 'https://github.com/'
        },
        {
            text: 'Twitter',
            href: 'https://twitter.com/'
        }
    ],
    hero: {
        title: '记录与思考',
        text: '在这里，我分享关于设计、技术与生活的观察与想法。\n\n写作是一种梳理，也是一种对话。',
        image: {
            src: hero,
            alt: 'misaka 的写作空间'
        },
        actions: [
            {
                text: '开始阅读',
                href: '/blog'
            }
        ]
    },
    homeIntro: {
        lead: '写作是一种梳理，也是一种对话。',
        text: '在这里，我分享关于设计、技术与生活的观察与想法。'
    },
    subscribe: {
        enabled: true,
        title: '订阅更新',
        text: '每周一封，获取最新文章。',
        form: {
            action: '#'
        }
    },
    postsPerPage: 8,
    projectsPerPage: 8
};

export default siteConfig;
