import avatar from '../assets/images/avatar-quiet-anime-v2.png';
import type { SiteConfig } from '../types';

const siteConfig: SiteConfig = {
    website: 'https://misaka.design',
    avatar: {
        src: avatar,
        alt: 'misaka.design 二次元头像'
    },
    title: 'misaka.design',
    subtitle: '设计、AI 与持续成长',
    description: '关于设计、AI，以及一个前端工程师如何持续成长。',
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
        },
        {
            text: '便利贴墙',
            href: '/wall'
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
            text: 'RSS',
            href: '/rss.xml'
        }
    ],
    homeIntro: {
        lead: '关于设计、AI，以及一个前端工程师如何持续成长。',
        text: '这里先以中文写作为主，记录长文、札记和持续生长中的思考脉络。'
    },
    homeNow: [],
    subscribe: {
        enabled: false
    },
    postsPerPage: 8,
    projectsPerPage: 8
};

export default siteConfig;
