export const HOME_SCENE_IDS = ['open', 'interests', 'growth', 'now', 'reading', 'scroll', 'enter'] as const;

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
        title: '思想生长之处',
        command: '吾有一园，名曰「misaka.design」。启之。',
        response: '园门已启。'
    },
    {
        id: 'interests',
        eyebrow: '列志',
        title: '所关注的事',
        command: '列吾所好：设计、智能、前端、成长。陈之。',
        response: '四志已列。'
    },
    {
        id: 'growth',
        eyebrow: '生长',
        title: '思绪并非一次写定',
        command: '此园非库，乃思绪生长之地。润其形。',
        response: '脉络渐生。'
    },
    {
        id: 'now',
        eyebrow: '近况',
        title: '此刻正在发生',
        command: '吾有所行，亦有所问。示其近况。',
        response: '近况已录。'
    },
    {
        id: 'reading',
        eyebrow: '荐读',
        title: '从这里开始',
        command: '择文三篇，以待初访之人。置于前。',
        response: '荐读已置。'
    },
    {
        id: 'scroll',
        eyebrow: '展卷',
        title: '一卷未完的索引',
        command: '今添吾色，易其字，展此长卷。',
        response: '墨色已定。长卷已展。'
    },
    {
        id: 'enter',
        eyebrow: '入园',
        title: '园门既开',
        command: '园门既开，请君自游。',
        response: '请君自游。'
    }
] as const;

export const HOME_INTERESTS = ['设计如何解决问题', 'AI 如何参与创造', '代码如何承载体验', '人在实践中如何成长'] as const;

export const HOME_GROWTH_STATES = ['种子', '生长中', '已成文', '持续修订'] as const;
