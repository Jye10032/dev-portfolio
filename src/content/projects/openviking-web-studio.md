---
title: 'OpenViking Web Studio'
description: '面向 AI Agent 上下文管理的可视化工作台。我的开源贡献覆盖页面结构、国际化、主题切换、新手引导、用量统计与请求审计。'
publishDate: 2026-10-09
isFeatured: true
order: 2
demo: 'https://openviking-production-1b92.up.railway.app/'
embed: true
demoHeight: 760
seo:
    title: 'OpenViking Web Studio：AI Agent 上下文工作台与开源贡献'
    description: '我在 OpenViking Web Studio 中参与的页面布局、国际化、新手引导、用量统计和请求审计开发，以及可核验的开源 PR。'
---

OpenViking 是面向 AI Agent 的开源上下文数据库，通过文件系统的组织方式统一管理记忆、资源和技能。Web Studio 是它的可视化工作台，把资源浏览、检索、会话和运行状态放到一个浏览器界面里，帮助开发者理解 Agent 正在使用什么上下文，以及一次调用发生了什么。

我以开源贡献者的身份参与其中，主要关注前端使用体验，以及支撑界面展示的统计和审计能力。

## 项目入口

- [打开 Web Studio](https://openviking-production-1b92.up.railway.app/)
- [OpenViking 官方仓库](https://github.com/volcengine/OpenViking)
- [我的 fork](https://github.com/Jye10032/OpenViking)
- [Web Studio 使用与部署说明](https://github.com/volcengine/OpenViking/blob/main/web-studio/README.md)

在线入口部署在独立的 Railway 项目中。前端来自我的 fork `Jye10032/OpenViking` 的 `main` 分支，配套后端使用同一提交对应的官方 `main` 镜像，并挂载持久化数据盘。在线演示自动连接到我公开的 `default/jye10032` 数据，访客无需填写密钥，即可浏览现有资源、记忆、会话、用量与运行状态。展示入口由服务端限制为只读，新增、编辑、删除、管理和发起对话均已停用；真实用户凭据仅保存在 Railway 服务端。

## 我参与的工作

### 让功能更容易找到

早期工作集中在页面结构：搭建顶栏、侧边栏和内容区组成的三段式布局，把集中在一个页面里的文件系统、检索、记忆写入和设置拆分为独立路由，并提取共享工具函数。

在此基础上，我接入中英文国际化和语言切换，完善明暗主题切换及偏好保留，让导航和交互在不同语言、主题下保持一致。

### 让第一次使用有明确的起点

新用户面对空的知识库时，需要知道下一步可以做什么。我补充了首次访问的欢迎引导、资源列表的上传入口，以及检索和请求日志的空状态文案，并同步维护中英文内容。

### 让运行过程可以观察

我参与了首页用量仪表盘和请求审计日志的开发，包括统计接口、模型调用用量事件记录，以及对应的界面展示；也单独补充过聚合会话 Token 用量的 API，用于区分 LLM 和 Embedding 的消耗。

这些工作把“能发起调用”延伸到“能查看调用过程与消耗”，方便开发者排查检索行为和运行问题。

## 我的 PR

以下 Web Studio 相关贡献均已合并到协作仓库 **Ferry-200/OpenViking**。链接保留各次变更的讨论与代码，合并状态不等同于每项改动均以原样进入官方主线。

| 贡献 | PR |
| --- | --- |
| 三段式布局、功能页拆分与共享工具整理 | [#1](https://github.com/Ferry-200/OpenViking/pull/1) |
| 中英文国际化与明暗主题切换 | [#3](https://github.com/Ferry-200/OpenViking/pull/3) |
| 会话 Token 用量统计 API | [#7](https://github.com/Ferry-200/OpenViking/pull/7) |
| 首次使用引导与空状态 | [#32](https://github.com/Ferry-200/OpenViking/pull/32) |
| 用量仪表盘、请求审计与资源检索改进 | [#38](https://github.com/Ferry-200/OpenViking/pull/38) |

此外，我向官方 **volcengine/OpenViking** 提交的 [PR #2203](https://github.com/volcengine/OpenViking/pull/2203) 已合并：修复远程 URL 导入时的二进制类型识别，结合响应头与文件签名判断无扩展名资源，并区分 Office、EPUB 等 ZIP 容器格式。

## 技术与边界

Web Studio 使用 React、TypeScript、Vite 和 TanStack Router，界面基于 Tailwind CSS 与组件库构建，国际化使用 i18next。前端通过 OpenViking API 访问数据；存储、索引、检索和 Bot 运行在服务端。

本页展示的是我参与开源项目的具体贡献，项目整体由 OpenViking 社区共同维护。
