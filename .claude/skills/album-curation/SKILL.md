---
name: album-curation
description: 把一次研究结果收进博客的「专辑」栏目。当用户说「加到我的收藏」「收进专辑」「存到知识库」「整理成专辑」，或者刚做完一轮方法/工具/框架的调研并希望留存时使用。负责抽取条目、校验原文链接、写入 src/content/albums/ 并跑构建验证。
---

# 专辑收藏

专辑（`/albums`）收藏网上值得吸收的方法，每条保留原文出处，并附上「核心内容 / 我的总结 / 如何应用」三层内容。它不是书签列表——**没有个人总结的条目不要收**。

## 文件位置

| 用途 | 路径 |
| --- | --- |
| 专辑内容 | `src/content/albums/<slug>.mdx`（一个专辑一个文件，扁平，不建子目录） |
| Schema | `src/content.config.ts` 的 `albums` collection |
| 列表页 | `src/pages/albums/index.astro` |
| 详情页 | `src/pages/albums/[id].astro` |
| 公开 URL | `/albums/<slug>` |

`<slug>` 用小写 kebab-case，稳定不变。改标题不要改 slug。

## 工作流程

1. **先找已有专辑**。`ls src/content/albums/` 看是否有同专题的文件。同一专题一律追加到已有专辑的 `entries` 数组，不要新建。新建只在确实是新专题时。
2. **抽取条目**。每个来源一条 `entries` 项。只收有明确出处的一手资料——方法提出者的原文、研究机构的文章、官方文档。二手转述和聚合博客不收。
3. **校验每个 URL**，逐条跑：
   ```sh
   curl -sS -o /dev/null -w '%{http_code} %{url_effective}\n' -L --max-time 20 -A 'Mozilla/5.0' "<url>"
   ```
   只接受 200。如果 `url_effective` 和原 URL 不同，**写入重定向后的规范 URL**。
4. **写 frontmatter**，字段见下。新建专辑时 `publishDate` 用今天；追加条目时补 `updatedDate` 为今天。
5. **写正文**（MDX body）= 你的综述。说清这些方法之间的关系和使用顺序，不要复述各条的 `core`。
6. **验证**：
   ```sh
   npm run build
   npx vitest run --environment jsdom tests/album
   ```
   确认 `/albums/<slug>` 页面生成成功。

## Frontmatter 字段

专辑级：

- `title` — 专题名
- `question` — **触发这次收藏的原始问题，照原话写**。这是专辑的锚点，详情页会突出展示
- `excerpt` — 一句话说明这个专辑解决什么
- `accent` — `yellow` `mint` `blue` `coral` `lavender` `cream`，复用便利贴色板。同类专题用同色
- `status` — `collecting`（还在收）/ `synthesized`（综述写完了）/ `archived`
- `skill` — 维护此专辑的 skill slug，通常填 `album-curation`
- `publishDate` / `updatedDate` — `YYYY-MM-DD`
- `tags` — 中文主题词，2-4 个。会成为列表页的筛选项
- `draft` — 默认 false

条目级（`entries` 数组）：

- `title` — 方法名，用原文的叫法。中英混排时写「中文名 English Name」
- `url` — 校验过的规范 URL
- `source` — 机构或站点名（`NN/g`、`Intercom`、`Atlassian`）
- `author` — 有具名作者时填
- `kind` — `method` `framework` `template` `article` `tool`
- `core` — 原文说了什么。客观转述，一到两句
- `takeaway` — **你的总结与判断**。必填
- `apply` — 具体怎么用在手上的事情上
- `quote` — 值得直接引用的原文片段，可选
- `deepDive` — 这条展开成文章后，填 `/blog/<slug>`，可选

## 写作约束

**`core` 和 `takeaway` 必须是两件事。** `core` 是原文说了什么，`takeaway` 是你的判断——为什么值得收、什么情况下不适用、和别的方法什么关系、使用门槛在哪。如果 `takeaway` 只是把 `core` 换个说法，这条不合格，重写或者别收。

**`apply` 要落到具体对象上。** 「用于需求分析」不合格，「把『优化房型展示』转成具体的用户决策问题」才合格。想不出具体应用就留空，不要凑。

**不要替用户编造判断。** `takeaway` 是用户的观点。如果没有足够上下文判断一个方法好不好用，就写清它的适用前提和门槛（客观可查），把评价留给用户补。尤其不要凭空写「用户痛点」「用户感受」这类需要研究材料支撑的内容。

**一条条目撑不住时升级成文章。** `takeaway` 超过三四句话说明它该独立成文：在 `src/content/blog/` 写文章，条目里用 `deepDive` 链过去，`takeaway` 缩回一句结论。

## 追加条目到已有专辑

只改 `entries` 数组和 `updatedDate`，其他字段不动。新条目追加到数组末尾，除非用户要求按重要性排序。如果新条目和已有条目讲同一个方法，合并而不是新增。
