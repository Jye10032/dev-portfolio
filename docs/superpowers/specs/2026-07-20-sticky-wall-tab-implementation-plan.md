# 便利贴墙(Sticky Wall)实施方案

基于设计文档 `docs/superpowers/specs/2026-07-20-sticky-wall-tab-design.md`(源文件位于 codex worktree,实施前建议先将其拷贝到本仓库 `docs/superpowers/specs/` 以便存档)。

## 0. 背景与现状摸底

设计文档要求的五个关键边界,与当前代码的契合情况:

| 设计要求 | 当前现状 | 需要做的事 |
|---|---|---|
| 顶部导航新增 `便利贴墙` | `site-config.ts` 只有 首页/写作/主题 三项 | 在 `headerNavLinks` 追加 `{ text: '便利贴墙', href: '/wall' }` |
| 页面要「宽画布」,而不是阅读页的窄栏 | `BaseLayout.astro` 的 `<main>` 与 `Header`/`Footer` 都写死 `max-w-3xl` | 给 `BaseLayout` 增加可选的宽版变体(见 §2) |
| 复用拖拽库 `interactjs`,不引入白板框架 | `package.json` 无任何拖拽依赖 | `npm i interactjs` |
| 客户端交互模块只挂在 `/wall` | 项目目前没有 React/Vue 岛,全部是 Astro + 原生 `<script>` | 用 Astro `<script>` 挂载一个 ES module 即可,**不引入框架岛**(见 §4 的技术选型说明) |
| localStorage 薄适配层 | 无现成代码 | 新建 `src/utils/wall/`(纯 TS,不依赖 Astro,便于未来抽离) |

**技术选型说明(对设计文档的落地决策):** 设计文档明确不引入 tldraw/Excalidraw,也建议不强行上 React 岛。当前站点是纯 Astro + 原生脚本(参考 `Nav.astro` 的 `<script>` 用法),因此 v1 用**原生 TS 模块 + interactjs**实现,单文件组件用 `.astro` 表达,状态管理用一个小的发布订阅 store。这既满足「storage/interaction 边界干净」,也避免为单页引入一个框架运行时。

## 1. 实施顺序总览

```
① 设计文档归档 + 依赖安装 + 站点配置(导航/类型)
② BaseLayout 支持宽版布局
③ /wall 路由与页面骨架(标题、+新建、画布容器、属性面板占位)
④ 数据层:Note 类型 + localStorage 适配器 + 示例墙种子数据
⑤ 交互层:wall store(状态/选中/持久化)+ interactjs 拖拽
⑥ 便签组件与属性面板(颜色/样式/尺寸/emoji/复制/删除)
⑦ 编辑态(双击进入编辑)+ 空态种子墙 + 自动保存串联
⑧ 移动端底部抽屉适配 + 可访问性(焦点、reduced-motion)
⑨ 构建验证 + 真机/浏览器自测清单
```

每一步都是可独立验收的切片,①–④ 可以一次提交,⑤–⑦ 是核心交互,⑧–⑨ 收尾。

## 2. 布局改造(BaseLayout 宽版变体)

**问题:** 现状 `BaseLayout.astro` 里 `Nav`、`Header`、`main`、`Footer` 全部 `max-w-3xl`,画布页需要更宽。

**方案(最小侵入):** 给 `BaseLayout` 增加一个可选 prop:

```ts
export type Props = HeadProps & {
    showHeader?: boolean;
    wide?: boolean; // 新增:宽版页面(如便利贴墙)
};
```

- `wide === true` 时:`Header`/`main`/`Footer` 的容器从 `max-w-3xl` 换成 `max-w-6xl`(Nav 也同步,保证导航对齐)。
- 默认值保持 `false`,现有所有页面零影响。
- 画布页 `/wall` 使用 `<BaseLayout wide>`。

**备选(不推荐):** 单独写一个 `WallLayout.astro` 复制 BaseLayout——会产生两份 shell,后续改动要同步两处,违背「仍然是同一个站点」的设计意图。

## 3. 路由与信息架构

- 路由:`/wall`,对应文件 `src/pages/wall.astro`。设计文档把「route 命名」列为 deferred,直接用 `/wall`。
- 导航:`src/data/site-config.ts` 的 `headerNavLinks` 追加 `{ text: '便利贴墙', href: '/wall' }`,放在「主题」之后。
- 页头:页面顶部展示标题 `便利贴墙` + 一句副标题(如「灵感、碎片与实验的落脚点」),左上角放 `+ 新建` 按钮。
- 保留全局 `Nav` / `Header` / `Footer`,确保视觉上仍是 misaka.design 的一部分。

## 4. 代码结构(新增文件)

```
src/
├─ pages/
│  └─ wall.astro                    # 路由 + 页面骨架(SSR 出空画布容器)
├─ components/wall/
│  ├─ WallCanvas.astro              # 点阵背景 + 便签层容器 + 「+ 新建」按钮
│  ├─ WallNote.astro                # 单张便签的静态结构(由客户端 hydrate 接管)
│  └─ WallPanel.astro               # 右侧属性面板(移动端变底部抽屉)
├─ utils/wall/
│  ├─ types.ts                      # Note / WallState / NoteColor / NoteStyle / NoteSize
│  ├─ storage.ts                    # localStorage 适配器:loadWall/saveWall + CRUD
│  ├─ seed.ts                       # 首次访问的示例墙数据
│  ├─ store.ts                      # 运行时 store:notes Map、selectedId、订阅发布
│  └─ wall-app.ts                   # 入口:挂载 store、绑定 interactjs、渲染/重渲染
```

**为什么把 `utils/wall/*` 写成不依赖 Astro 的纯 TS:** 设计文档明确要求「storage 边界干净,未来可替换为云后端」。`storage.ts` 只暴露 `loadWall()/saveWall()/createNote()/updateNote()/deleteNote()` 五个方法,内部用 localStorage 实现;未来换后端时,只要这五个方法签名不变,UI 一行不用改。

## 5. 数据模型与存储

### 5.1 类型(`utils/wall/types.ts`)

```ts
export type NoteColor = 'yellow' | 'mint' | 'blue' | 'coral' | 'lavender' | 'cream';
export type NoteStyle = 'plain' | 'lined' | 'grid' | 'taped';   // v1 先做 3~4 种
export type NoteSize  = 'sm' | 'md' | 'lg';

export interface Note {
    id: string;          // crypto.randomUUID()
    content: string;
    color: NoteColor;
    style: NoteStyle;
    size: NoteSize;
    x: number;           // 相对画布的 px
    y: number;
    zIndex: number;
    icon: string | null; // 单个 emoji
    createdAt: number;
    updatedAt: number;
}

export interface WallState {
    version: 1;                 // 存储版本,便于将来迁移
    notes: Note[];
    selectedId: string | null;
}
```

### 5.2 存储适配器(`utils/wall/storage.ts`)

- key:`misaka.wall.v1`(带版本号,将来 `v2` 可做 migrate)。
- `loadWall(): WallState | null` — 读取 + JSON.parse + 版本校验,失败/为空返回 `null`。
- `saveWall(state)` — 防抖(约 300ms)写 localStorage,避免拖拽/输入过程中高频写。
- `createNote / updateNote / deleteNote` — 在内存 state 上操作后统一走 `saveWall`,UI 不直接碰 localStorage。
- 首次访问 `loadWall()` 返回 `null` 时,由 `seed.ts` 生成 3~4 张示例便签(介绍玩法的一句话、一条 todo、一句名言之类),立即 `saveWall` 落盘,满足「第一次访问不能是空墙」。

## 6. 交互实现

### 6.1 拖拽(interactjs)

- 只对 `.wall-note` 启用 `draggable`,`inertia: false`(减少眩晕,配合 reduced-motion),`modifiers` 用 `restrictRect` 限制在画布内。
- 监听 `dragmove`:更新 transform,**不写存储**;`dragend`:把最终 x/y 写回 store → 触发 `saveWall`。
- 点击便签:设为 `selectedId` 并把 `zIndex` 提升为当前最大值+1(设计文档要求「点击置顶」)。

### 6.2 编辑

- 双击便签正文进入编辑:把 `<p>` 换成 `contenteditable` 的 `<div>`(或 `<textarea>`),失焦/`Escape` 退出并保存。
- 新建便签:默认文案 `写点什么……`,创建后自动进入编辑态并聚焦(设计文档要求「focus quickly」)。
- `Enter` 换行、`Cmd/Ctrl+Enter` 提交,避免和「双击编辑」冲突;**v1 不做复杂快捷键系统**。

### 6.3 属性面板(`WallPanel.astro`)

- 桌面端:选中便签时,右侧浮出窄面板(宽 ~240px),包含:颜色(6 色圆点)、样式(3~4 个图标切换)、尺寸(sm/md/lg 三段)、emoji(常见 8~12 个一排)、`复制`、`删除` 按钮。
- 移动端(<md):同一面板改成底部抽屉,从屏幕底部上滑出现,避免遮挡画布。
- 所有修改直接调 `store.updateNote(id, patch)`,由 store 统一防抖落盘。
- `复制`:在原件 (x+24, y+24) 处生成副本并选中新副本。
- `删除`:从 store 移除并清空 `selectedId`,**v1 不做二次确认**(数据仅在本地,误删成本低;若后续担心可加 `Undo` toast,列入 deferred)。

### 6.4 渲染策略

- 便签的 DOM 由 `wall-app.ts` 根据 store 数据**程序化渲染**(创建/更新/移除 `<article class="wall-note">`),`WallNote.astro` 只作为 SSR 时的结构模板/样式定义,避免「Astro 组件 + 客户端状态」来回同步的复杂度。
- store 用一个极简发布订阅(约 30 行):`subscribe(listener)` + `setState(patch)`,面板和画布各自订阅。

## 7. 视觉与可访问性

- 画布背景:在 `WallCanvas.astro` 用 radial-gradient 画点阵(`background-image: radial-gradient(circle, var(--bg-muted) 1px, transparent 1px); background-size: 24px 24px;`),颜色沿用 `--bg-muted`,深浅两色模式自动适配。
- 便签配色:6 色全部走 CSS 变量,在 `global.css` 新增一组 `--note-*` 变量,并提供 `html.dark` 下的暗色变体(降低饱和度,保持文字对比)。
- 选中态:便签外框用 `--accent`(品牌蓝),面板主按钮也用 `--accent`,和全站一致。
- 字体:便签正文沿用 `--font-serif`,保持品牌感。
- 可访问性:
  - `+ 新建`、面板按钮都是原生 `<button>`,保留 `:focus-visible` 样式。
  - 便签本身 `role="button"` + `tabindex="0"`,键盘 `Enter` 也可选中,`Delete` 键删除选中项(这是设计文档允许的「quality-of-life 快捷键」)。
  - 所有动画遵守现有 `prefers-reduced-motion` 约定(global.css 已有全局规则),拖拽位移本身不算动画,不额外加过渡。
  - 便签最小触控目标 ≥ 44px,面板按钮 ≥ 36px。

## 8. 构建与验证

1. `npm i interactjs` 后 `npm run build` 通过,无 TS/astro check 报错。
2. `npm run dev` 自测清单:
   - [ ] 顶部导航出现「便利贴墙」,点击直达 `/wall`
   - [ ] 首次访问看到 3~4 张示例便签,刷新后仍在
   - [ ] `+ 新建` 生成便签并进入编辑态
   - [ ] 拖拽后位置被记住(刷新不丢)
   - [ ] 双击编辑、改颜色/样式/尺寸/emoji 均即时生效并落盘
   - [ ] 复制产生偏移副本;删除后刷新不出现
   - [ ] 移动端(<md)下面板变为底部抽屉,便签可拖
   - [ ] 深色模式下画布点阵与便签颜色对比正常
3. 部署走现有 GitHub → Netlify 流程,无新增环境变量/服务端逻辑。

## 9. 明确不做(与设计文档对齐)

- 不做图片/附件、任意缩放手柄、多选、连线、无限缩放画布
- 不做键盘快捷键系统(仅保留 Enter/Delete/Escape 这种基础可用性)
- 不做云同步、登录、协作
- 不引入 React/Vue 岛、不引入 tldraw/Excalidraw

## 10. 后续可扩展点(本方案已预留)

- 换云后端:只需重写 `utils/wall/storage.ts` 的五个方法。
- 抽出独立产品:`utils/wall/*` 与 `components/wall/*` 已经是自包含边界。
- 加更多便签字段(如 `pinType`、`rotation`):`Note` 接口加字段 + 存储版本号 +1 + `loadWall` 做 migrate 即可。

## 11. 建议的提交切分

1. `docs: archive sticky wall design spec` — 把 spec 拷入本仓库
2. `feat: add /wall route and layout support` — ①②③
3. `feat(wall): local storage adapter and seed data` — ④
4. `feat(wall): drag, select, and panel interactions` — ⑤⑥
5. `feat(wall): edit mode and empty-state polish` — ⑦⑧
6. `chore: verify build and mobile a11y` — ⑨
