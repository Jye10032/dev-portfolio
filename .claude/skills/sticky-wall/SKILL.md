---
name: sticky-wall
description: 改便利贴墙（/wall）时使用。当用户说「便利贴」「贴纸墙」「加个颜色/样式」「改便签」「便利贴存到服务端」「共享便利贴墙」，或要动 src/utils/wall/ 和 src/components/wall/ 时触发。管分层边界、给便签加属性的改动路径，以及换成云端存储前必须先定的事。
---

# 便利贴墙模块

`/wall` 上一块可拖拽的便签画布。**纯客户端，纯 localStorage。**

## 当前的真实状态

存储键 `misaka.wall.v1`，只在每个访客自己的浏览器里。所以：

- 访客之间互不可见，你写的别人看不到
- 换浏览器、换设备、清站点数据就全部丢失
- 线上写的内容不会回到仓库

首次访问时 `loadWall()` 返回 `null`，`store` 会生成 `seed.ts` 里的示例墙并立即落盘。要改所有访客看到的初始内容，改 `seed.ts`。

## 分层

```
components/wall/WallCanvas.astro   画布 + 便签样式（便签 DOM 由 JS 生成，样式用 :global 穿透）
components/wall/WallPanel.astro    选中便签后的属性面板
utils/wall/types.ts                Note / WallState + 颜色、样式、尺寸、图标的枚举
utils/wall/storage.ts              唯一接触 localStorage 的地方
utils/wall/store.ts                发布订阅，持有运行时状态
utils/wall/seed.ts                 首次访问的示例墙
utils/wall/wall-app.ts             initWall(root)：DOM 渲染 + interactjs 拖拽
pages/wall.astro                   装载，含 astro:page-load / before-swap 生命周期
```

**边界规则**：只有 `storage.ts` 碰 `localStorage`。`createNote` / `updateNote` / `deleteNote` 是纯函数，只返回新的 `WallState`，不落盘——落盘时机由 `store.setState` 通过 `debounceSave` 决定。UI 层只读 `store`，不直接读存储。

改动时别打破这条。它是后面换后端的唯一指望。

## 给便签加一个属性

以加一种新颜色为例，顺序是固定的：

1. `types.ts` — 往 `NoteColor` 加成员，往 `NOTE_COLORS` 数组加值
2. `global.css` — `:root` 和 `html.dark` 各加一个 `--note-<name>` token（成对，否则 `npm test` 会失败。见 `design-tokens` skill）
3. `WallCanvas.astro` — 加 `:global(.wall-note[data-color='<name>'])` 规则，只写 `var(--note-<name>)`
4. `WallPanel.astro` — 面板里加对应的选择按钮，带 `data-color="<name>"`

加样式（`NoteStyle`）或尺寸（`NoteSize`）是同一条路径，换成 `data-style` / `data-size`。`wall-app.ts` 用 `btn.dataset.color === note.color` 这类比较来同步面板激活态，所以 `data-*` 的值必须和枚举字面量完全一致。

加图标只改 `NOTE_ICONS`。

## 版本与迁移

`WallState.version` 现在是 `1`，`loadWall()` 对 `version !== 1` 直接返回 `null`。

**这意味着改 `Note` 的结构会让所有访客的便签被静默丢弃**，退回示例墙。加可选字段不要紧（旧数据读出来是 `undefined`）；改字段名或改必填字段就要升 `version` 并在 `loadWall` 里写迁移分支，别直接丢。

## 换成共享存储之前

技术上不难：已经跑在 Netlify SSR 上，`src/pages/api/visitors.ts` 是现成的 API 路由范例，Netlify Blobs 也已启用，够当 KV 用。

但有两件事必须先解决：

**一、签名要变成异步。** `storage.ts` 的注释说「保持签名不变上层零改动」，这一点不成立——`loadWall(): WallState | null` 换成网络请求后必须返回 Promise，`store.ts` 的 `ensureState()` 是同步的，调用链要一路改成 async。这是实际工作量所在。

**二、公开可写的接口必须有访问控制。** 没有鉴权的写入端点挂在自己域名上，等于任何人都能往站点贴任意内容并对所有访客可见。公开留言板一定会被扫到。至少要有一种：

- **只读共享**：你的便签构建时写死进 `seed.ts` 或一个内容集合，访客只能在本地摆自己的。零风险，但算不上互动
- **写入先审**：新便签进待审状态，批准后才公开
- **登录才能写**：接 GitHub OAuth 之类

**这个决定是用户的，不要替他选，也不要在没定之前实现写接口。**

## 验证

```sh
npm test            # tests/wall/store.test.ts 和 wall-app.test.ts
npm run build
```

跑完在浏览器里实测：新建、拖拽、双击编辑、改属性、删除、刷新后是否还在、切换亮暗模式便签纹理是否都看得见。拖拽用 interactjs，测试覆盖不到真实指针行为。

## 相关

- 便签配色和纹理：`design-tokens`
