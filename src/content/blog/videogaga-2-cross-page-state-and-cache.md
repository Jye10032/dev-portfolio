---
title: "VideoGaga（二）：跨页面状态与缓存"
publishDate: "2026-03-22"
type: article
draft: false
tags: ["VideoGaga", "缓存", "Service Worker"]
excerpt: "统一状态只能解决运行时协作，刷新恢复、媒体加载和 localStorage 不可用等问题，还需要分别设计缓存边界。"
readingTime: 6
---

状态集中以后，VideoGaga 的工作流可以在多个步骤间共享数据，但“内存里有一份状态”并不等于“用户下次回来还能继续”。刷新页面、切换项目、浏览器限制存储，都会重新暴露数据生命周期问题。

## 从表单状态扩展到完整项目状态

早期 store 只保存故事、参数和步骤进度。随着创作链路继续完善，场景、角色、道具和分镜也需要跨页面恢复。

提交 `51858b8` 将项目状态扩展为：

```ts
type ProjectState = {
  projectId?: string;
  storySetting: StorySettingState;
  params: WorkflowParamsState;
  assets: WorkflowAssetsState;
  storyboards: WorkflowStoryboardsState;
  progress: Record<number, "done" | "skipped">;
};
```

这次没有把所有临时 UI 状态都塞进缓存，而是围绕“恢复一个项目需要什么”来选择字段。资产列表、生成结果、上传状态和分镜进入项目状态；纯视觉交互仍留在组件内部。

持久化层也增加了安全包装。直接访问 `localStorage` 在服务端渲染、隐私模式或存储被禁用时可能抛错，因此 `safeLocalStorage` 对读取、写入和删除分别做了环境判断与异常兜底。缓存不可用时，页面仍能以无持久化模式运行。

## 数据缓存与媒体缓存不是同一件事

首页背景视频是另一类问题。它不属于项目状态，文件较大，重复下载会直接影响再次访问的体验。

提交 `bf574b4` 为首页视频增加 Service Worker：

1. 安装阶段尝试预热固定视频资源；
2. 请求阶段优先读取 Cache Storage；
3. 未命中时请求网络并写入缓存；
4. 激活新版本时清理旧版本缓存。

数据状态使用 Zustand persist，静态媒体使用 Service Worker。两者都叫“缓存”，但失效条件、存储位置和失败策略完全不同。

## 缓存首先是一组边界

这次调整让我更明确地把缓存看成四个问题：

- 哪些数据值得恢复；
- 数据以什么维度隔离；
- 什么时候失效；
- 缓存不可用时系统是否还能工作。

如果只追求“刷新后还在”，很容易把临时状态、旧接口数据甚至错误结果长期留下。缓存的价值不是存得越多，而是在不破坏正确性的前提下减少重复工作。
