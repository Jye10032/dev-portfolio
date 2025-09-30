---
layout: ../layouts/BlogLayout.astro
title: 从 Astro 开始撰写博客
description: 一份示例性的内容布局，展示如何在三栏结构中呈现正文与目录。
date: 2025-09-29
author: Jye
readingTime: "5 min"
tags:
  - Astro
  - 前端开发
  - 博客
---

## 为什么选择 Astro

Astro 帮助我们以静态导出为核心的方式构建内容站点，同时还能按需引入交互式组件。

- **性能表现**：默认只输出纯 HTML，首次加载更快。
- **组件生态**：可以混用 React、Vue、Svelte 等框架。
- **内容驱动**：与 Markdown 内容和 CMS 集成顺畅。

## 构建你的第一篇文章

要创建一篇文章，只需要在 `src/pages/blog/` 下新增一个 Markdown 文件，并在头部设置好布局与元信息。

### Frontmatter 字段

常见字段包括：

- `title`：文章标题
- `description`：用于 SEO 和摘要显示的描述
- `date`：发布日期，可用于排序
- `tags`：一组用于分类和筛选的标签

### 添加三级标题

使用 Markdown 的 `###` 语法可以创建三级标题，它们同样会被收录到右侧目录中。

## 加入更多内容

你可以在正文中自由写作，支持列表、引用、代码块等 Markdown 特性。右侧的目录会根据二级、三级标题自动刷新。

> 提示：目录的锚点由 Astro 自动生成，无需手动处理。

### 下一步要做什么？

- 将这份模板复制为下一篇文章
- 在 `post-meta` 中加入更多自定义字段（例如阅读时长）
- 尝试将文章数据迁移到 `src/content` 目录，解锁 Astro Content Collections
