import avatar from '../assets/images/avatar-quiet-anime-v2.png';
import type { SiteConfig } from '../types';

const siteConfig: SiteConfig = {
    website: 'https://misaka.design',
    avatar: {
        src: avatar,
        alt: 'misaka.design 二次元头像'
    },
    title: 'misaka',
    subtitle: '前端工程、AI 与持续实践',
    description: '一个前端工程师关于 AI 工作流、复杂状态与工程复盘的持续记录。',
    // Content destinations only. `/` is reached through the nav identity, and
    // the index-style and contact entries live in the footer, so the top row
    // stays on one line at every width.
    headerNavLinks: [
        {
            text: '写作',
            href: '/blog'
        },
        {
            text: '项目',
            href: '/projects'
        },
        {
            text: '专辑',
            href: '/albums'
        },
        {
            text: '时间线',
            href: '/timeline'
        },
        {
            text: '便利贴墙',
            href: '/wall'
        }
    ],
    // `/tags` is also linked from BlogHeader, but a tag archive has no way back
    // to the directory, so the footer keeps it reachable from every page.
    footerNavLinks: [
        {
            text: '关于',
            href: '/about'
        },
        {
            text: '主题',
            href: '/tags'
        },
        {
            text: '联系我',
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
        lead: '关于前端工程、AI 工作流与持续实践。',
        text: '记录可验证的项目、技术判断与工程复盘。'
    },
    homeNow: [
        {
            label: '当前项目',
            text: 'FEMentor：把固定题单扩展为具备追问、记忆与检索能力的模拟面试 Agent。',
            href: '/tags/fementor'
        },
        {
            label: '研究主题',
            text: 'AI Agent 的上下文压缩、长期记忆与知识结构治理。',
            href: '/blog/fementor-2-context-and-memory'
        },
        {
            label: '近期整理',
            text: 'VideoGaga 的状态模型、跨页面缓存与 Hydration 一致性。',
            href: '/tags/videogaga'
        }
    ],
    umami: {
        websiteId: 'f4bacde3-1afc-45e7-84c3-1a3a6ea8361c',
        scriptUrl: 'https://cloud.umami.is/script.js',
        shareId: '9iiz26oQSHf4SGZS'
    },
    postsPerPage: 8,
    projectsPerPage: 8
};

export default siteConfig;
