export type TimelineEntry = {
    id: string;
    year: number;
    month?: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;
    kind: '项目' | '开源' | '学习' | '工作' | '生活';
    title: string;
    description: string;
    postIds?: readonly string[];
    projectId?: string;
};

/**
 * Experiences are curated independently of blog publication dates.
 * Use only the known date precision; omit month when only the year is known.
 * Years render newest first; entries within a year keep this editorial order.
 * postIds/projectId reference content IDs, so titles and public URLs stay in sync.
 * An experience can have zero or more related posts, with or without a project.
 */
export const timelineEntries: readonly TimelineEntry[] = [
    {
        id: 'openviking-contributions',
        year: 2026,
        kind: '开源',
        title: '参与 OpenViking 的开源开发',
        description: '为 Web Studio 完善页面结构、国际化、主题切换和首次使用引导，也参与用量统计与请求审计，让 Agent 的上下文和调用过程更容易被理解。',
        projectId: 'openviking-web-studio'
    },
    {
        id: 'fementor',
        year: 2026,
        kind: '项目',
        title: '开发 FEMentor，探索 AI 模拟面试',
        description:
            '从一份固定题单出发，逐步加入动态追问、上下文压缩和长期记忆。在面经检索与知识图谱的实践中，继续梳理模型能力、真实数据和产品流程之间的边界。',
        postIds: [
            'fementor-1-dynamic-follow-up',
            'fementor-2-context-and-memory',
            'fementor-3-retrieval-and-knowledge-graph',
            'fementor-4-knowledge-structure-governance'
        ],
        projectId: 'fementor'
    },
    {
        id: 'videogaga',
        year: 2026,
        kind: '项目',
        title: '梳理 VideoGaga 的多步骤创作流程',
        description: '把七步创作流程中分散的状态收拢到项目级模型，再处理跨页面恢复、缓存边界和主题一致性，让页面之间的协作更可靠。',
        postIds: ['videogaga-1-unified-workflow-state', 'videogaga-2-cross-page-state-and-cache', 'videogaga-3-theme-hydration-consistency']
    },
    {
        id: 'lianjia-crawler',
        year: 2025,
        month: 11,
        kind: '项目',
        title: '优化爬虫，也重新审视性能实验',
        description:
            '为 Lianjia-crawler 加入线程池、限速器和请求指标，做了三轮串行与并行对比。复盘时发现实验条件与样本不足，于是收回过度确定的结论，重新明确证据能说明什么。',
        postIds: ['lianjia-crawler-performance-experiment-review']
    },
    {
        id: 'logic-and-ai',
        year: 2024,
        month: 8,
        kind: '学习',
        title: '阅读逻辑与人工智能，留下问题和笔记',
        description: '整理关于相关逻辑、经典数理逻辑与人工智能的阅读记录，尝试理解逻辑推理与智能之间的联系。',
        postIds: ['logic-and-artificial-intelligence']
    },
    {
        id: 'frontend-foundations',
        year: 2024,
        month: 5,
        kind: '学习',
        title: '用练习和笔记补齐工程基础',
        description: '通过 Learn Git Branching 练习分支操作，整理操作系统课程笔记，也把布局、缓存和数据结构的练习记录下来。',
        postIds: ['learn-git-branching', 'operating-system-review', 'problem-solving-6-lru-lfu']
    },
    {
        id: 'frontend-interviews',
        year: 2024,
        month: 4,
        kind: '学习',
        title: '参加前端面试，记录每一次问答',
        description: '把腾讯文档、美团、淘天、京东和博乐科技的面试问题整理成笔记，留下当时被问到的知识点与项目问题。',
        postIds: [
            'tencent-docs-frontend-interview-notes',
            'meituan-frontend-interview-notes',
            'taotian-frontend-interview-notes',
            'jd-frontend-interview-notes',
            'bole-frontend-interview-notes'
        ]
    },
    {
        id: 'deep-thinking',
        year: 2023,
        month: 6,
        kind: '生活',
        title: '读《深度思考》，想一想如何做选择',
        description: '读完后写下关于选择、沉没成本和自我判断的感受，提醒自己从经历中学习，也给新的可能留一点空间。',
        postIds: ['deep-thinking-reading-notes']
    }
];
