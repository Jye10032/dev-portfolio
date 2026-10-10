---
name: blog-post
description: 给这个博客写文章或札记时使用。当用户说「写一篇」「加一篇文章」「发个札记」「改那篇文章」「配图放哪」「加个英文版」，或要新建、移动、翻译 src/content/blog/ 下的内容时触发。管文件命名、frontmatter 字段、URL 稳定性、图片位置和双语配对。
---

# 写作模块

文章和札记同住 `src/content/blog/`，用 frontmatter 的 `type` 区分，不靠目录。

## 文件与 URL

- 扁平存放，**不要**建年份、类型或分类子目录
- 文件名就是 slug：小写 kebab-case，例如 `src/content/blog/ai-agent-workflow.md`
- 公开 URL 是 `/blog/<slug>`
- 详情页路由是 `src/pages/blog/[id].astro`。嵌套 URL 需要改成 `[...id]` 的 rest 参数并处理旧链接重定向，属于有意的路由迁移，不要顺手做

**URL 一旦公开就不能变。** 日期、类型、标签都可能改，所以它们只能是 frontmatter，不能进 URL。标题改了也不要改文件名——需要换显示标题就只改 `title`。

如果必须换 slug，用 `publicSlug` 字段钉住原 URL，别动文件名。

## frontmatter

schema 在 `src/content.config.ts` 的 `blog` collection。必填只有 `title` 和 `publishDate`。

```yaml
---
title: 标题
excerpt: 一到两句说清这篇讲什么。会用于列表页摘要和 meta description
publishDate: 2026-10-09
updatedDate: 2026-10-20        # 实质性修改才加，改错别字不算
type: article                  # article（长文）| note（札记），默认 article
tags:
    - FEMentor
    - 知识图谱
draft: false
readingTime: 12                # 分钟，手填
isFeatured: false              # 首页推荐候选
seo:
    image:
        src: '../../assets/images/blog/<slug>/cover.jpg'
        alt: 描述图片内容的文字
---
```

`type` 的判断：有结构、有论证过程的是 `article`；单点记录、短笔记是 `note`。它决定列表页归属（`/blog/articles` 还是 `/blog/notes`）和详情页是否显示目录——**目录只在 `type: article` 且有 3 个以上二级标题时出现**，见 `BlogPost.astro`。

`tags` 用中文或项目代号，会生成 `/tags/<slug>`。`slugify` 保留中文，所以 `#知识图谱` 的路由就是 `/tags/知识图谱`。先查 `/tags` 有没有同义的已有标签，能复用就别造新的。

## 图片

每篇文章一个目录：`src/assets/images/blog/<slug>/`。

- 封面用 `cover.jpg` 或 `cover.webp`
- 正文图用语义化的小写 kebab-case 名，例如 `agent-lifecycle.webp`
- 正文引用（注意是两层 `../`，因为内容文件是扁平的）：

  ```md
  ![AI Agent 工作流](../../assets/images/blog/ai-agent-workflow/agent-lifecycle.webp)
  ```

- `alt` 必须写出图片的内容或作用。纯装饰图才用空 `alt`

放 `src/assets/` 而不是 `public/`，这样 Astro 在构建时校验路径并压缩。只有需要稳定且不经处理的 URL 时才用 `public/`（可下载文档、favicon、外部引用的默认分享图），那些从站点根引用，例如 `/images/share/default-og.png`。

## 双语文章

两个独立文件，用 `translationKey` 配对：

```yaml
# src/content/blog/fementor-2-context-and-memory.md
lang: zh-CN
translationKey: fementor-2-context-and-memory

# src/content/blog/fementor-2-context-and-memory-en.md
lang: en
translationKey: fementor-2-context-and-memory
publicSlug: fementor-2-context-and-memory
```

中文走 `/blog/<slug>`，英文走 `/en/blog/<slug>`。`lang` 默认 `zh-CN`，英文文件必须显式写 `lang: en`。配对后详情页出现语言切换，`<head>` 自动生成 `hreflang`。

**中文版的 URL 不因为加了英文版而改变**——这是 `publicSlug` 存在的原因，让英文文件名带 `-en` 后缀但 URL 不带。

## 验证

```sh
npm run build
npm test
```

确认 `/blog/<slug>` 生成成功，正文图和 SEO 图都没有断链。构建会在图片路径写错时直接报错，所以构建通过就说明图片是通的。

## 相关

- 改观感或配色：`design-tokens`
- 收藏外部方法而不是自己写：`album-curation`
