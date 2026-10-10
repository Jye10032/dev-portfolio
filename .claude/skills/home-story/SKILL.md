---
name: home-story
description: 改首页时使用。当用户说「首页」「滚动叙事」「改首页文案」「加一幕/改一幕」「首页推荐哪几篇」「终端打字效果」，或要动 src/data/home-story.ts、src/utils/home-story-controller.ts、src/styles/home-story.css、src/components/home/ 时触发。管幕的数据结构、滚动驱动机制和降级行为。
---

# 首页滚动叙事

首页是一条按滚动推进的六幕叙事，右侧有个终端模拟器逐字打出每一幕的「命令」。

## 分层

```
data/home-story.ts            幕的文案、三个方向、推荐文章 id —— 改内容只改这里
components/home/HomeStory.astro       整体骨架
components/home/HomeStoryScene.astro  单幕
components/home/HomeStoryStage.astro  终端
components/home/VisitorStats.astro    访客统计（走 /api/visitors）
utils/home-story-controller.ts        滚动监听、幕切换、打字机
scripts/home-story.ts                 装载入口
styles/home-story.css                 模块样式 + 自带 token 块
pages/index.astro                     组装
```

**改文案只动 `data/home-story.ts`。** 控制器和样式都是从数据派生的，不要把文字写进组件。

## 幕的结构

`HOME_SCENE_IDS` 定死了顺序：`open` `focus` `now` `reading` `proof` `enter`。每一幕：

```ts
{
    id: 'focus',
    eyebrow: '方向',        // 章节标签，显示在进度指示器
    title: '三个持续投入的方向',
    command: '不列泛泛所好，以作品为证。',   // 终端里逐字打出
    response: '三条实践脉络已列。'           // 打完后的回应
}
```

文案是文言偏古的调性，`command` 写成「吩咐」，`response` 写成「回报」。改的时候保持这个语气，别混进口语。

**加一幕**要同时改四处：`HOME_SCENE_IDS` 加 id、`HOME_STORY_SCENES` 加对象、`index.astro` 加对应的 `HomeStoryScene` 区块、`home-story.css` 里如果该幕有专属视觉就加 `[data-home-scene='<id>']` 规则。`id` 必须和数组顺序一致，控制器靠 `findIndex` 定位。

`proof` 这一幕是特殊的：它是唯一使用 `--home-scroll-progress` 的幕，控制器按滚动位置算出 0–1 的进度写进 CSS 变量，驱动一个逐帧的 transform。改它的高度会改变动画节奏。

## 另外两组数据

`HOME_FOCUS_AREAS` —— 三个方向，每个有 `tag` 和 `href`。`tag` 必须是真实存在的博客标签，`getHomepageFocusAreas` 会按标签统计文章数，**count 为 0 的方向会被过滤掉不显示**。所以加方向前先确认有文章挂了那个标签。

`HOME_RECOMMENDATION_IDS` —— 三篇代表作，填博客文件的 slug。`getHomepageRecommendations` 按这个顺序优先取，取不到的（slug 写错或文章被删）会静默回退到最新文章。改完检查首页显示的是不是你指定的那三篇。

## 滚动与降级

控制器用 `window.innerHeight * 0.58` 作为激活线，哪一幕的顶部越过这条线就激活哪一幕。滚动和 resize 事件都经 `requestAnimationFrame` 合并。

三条降级路径，改动时都要保住：

- **无 JS**：`root.classList.add('is-enhanced')` 只在控制器初始化后才加。所有幕的内容在 HTML 里本来就是完整可读的，CSS 的增强效果挂在 `.is-enhanced` 下
- **`prefers-reduced-motion: reduce`**：跳过打字机，直接 `writeCompleted` 写出最终文本
- **往回滚**：`nextIndex <= previousIndex` 时也直接写最终文本，不重播打字动画

还有一条布局分支：`max-width: 1023px` 时 `inline` 为真，终端跟在每一幕里面；宽屏时共用右侧那一个固定终端。改终端的 DOM 结构要同时顾到两种模式，`stagesForScene` 是分叉点。

## 这个模块会覆盖全局 token

`home-story.css` 顶部用 `body:has(.home-story)` 把 `--text-main`、`--border-main`、`--accent` 换成了自己的暖色 + 朱红一套，所以首页的导航和页脚观感和其余页面不同，这是刻意的。

模块自己的 token（`--home-paper`、`--home-ink`、`--home-vermilion`、`--home-terminal-*`、`--home-shadow-*`）必须在浅色块和 `.dark .home-story, .dark body:has(.home-story)` 块里成对出现，`npm test` 会检查。终端那三个 token 深浅同值是刻意的（它是终端仿真，不是页面表面），测试里显式豁免。

细节见 `design-tokens` skill。

## 验证

```sh
npm test            # tests/home-story/ 和 tests/design-tokens.test.ts
npm run build
```

跑完在浏览器里滚一遍首页：六幕都切得到、终端打字正常、往回滚不重播、`proof` 那幕的进度动画跟手、切亮暗模式、以及在系统里开启「减弱动态效果」后文字仍然完整出现。
