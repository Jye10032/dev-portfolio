export const HOME_SCENE_IDS = ['open', 'focus', 'now', 'reading', 'proof', 'enter'] as const;

export type HomeSceneId = (typeof HOME_SCENE_IDS)[number];

export type HomeStoryScene = {
    id: HomeSceneId;
    eyebrow: string;
    title: string;
    command: string;
    response: string;
};

export const HOME_STORY_SCENES: readonly HomeStoryScene[] = [
    {
        id: 'open',
        eyebrow: '启园',
        title: '前端工程 × AI',
        command: '吾有一园，记工程实践与未竟之思。启之。',
        response: '技术档案已展开。'
    },
    {
        id: 'focus',
        eyebrow: '方向',
        title: '三个持续投入的方向',
        command: '不列泛泛所好，以作品为证。',
        response: '三条实践脉络已列。'
    },
    {
        id: 'now',
        eyebrow: '近况',
        title: '此刻在做什么',
        command: '列当前项目、研究主题与近期整理。',
        response: '近况已录。'
    },
    {
        id: 'reading',
        eyebrow: '荐读',
        title: '三篇代表作',
        command: '各择一篇，见智能、工程与判断。',
        response: '代表作已置。'
    },
    {
        id: 'proof',
        eyebrow: '积累',
        title: '时间留下的证据',
        command: '计其年月、文章、专题与题解。',
        response: '积累已有据可查。'
    },
    {
        id: 'enter',
        eyebrow: '入园',
        title: '园门既开',
        command: '园门既开，请君自游。',
        response: '请君自游。'
    }
] as const;

export type HomeFocusDefinition = {
    title: string;
    description: string;
    tag: string;
    href: string;
};

export const HOME_FOCUS_AREAS: readonly HomeFocusDefinition[] = [
    {
        title: 'AI Agent 与知识系统',
        description: '动态追问、上下文压缩、长期记忆、RAG 与知识图谱。',
        tag: 'FEMentor',
        href: '/tags/fementor'
    },
    {
        title: '前端系统与状态边界',
        description: '复杂流程状态、跨页面缓存、Service Worker 与 Hydration 一致性。',
        tag: 'VideoGaga',
        href: '/tags/videogaga'
    },
    {
        title: '基础能力与工程复盘',
        description: '算法、数据结构、JavaScript 边界，以及对实验结论的重新审视。',
        tag: '题解',
        href: '/tags/题解'
    }
] as const;

export const HOME_RECOMMENDATION_IDS = [
    'fementor-2-context-and-memory',
    'videogaga-3-theme-hydration-consistency',
    'lianjia-crawler-performance-experiment-review'
] as const;
