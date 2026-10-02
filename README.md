# dev-portfolio

[misaka.design](https://misaka.design) 的源码。Astro 5 + Tailwind 4，部署在 Netlify。

一个按 skill 组织内容模块的博客：每个模块自带内容目录、schema、路由和一份告诉 AI agent
「怎么往里写内容」的规范。

## 本地命令

```sh
npm install
npm run dev      # http://127.0.0.1:4321/
npm run build
npm run preview
npm test
```

## 内容模块

| 模块   | 内容目录                | 路由               | Skill                            |
| ------ | ----------------------- | ------------------ | -------------------------------- |
| 写作   | `src/content/blog/`     | `/blog/<slug>`     | —                                |
| 专辑   | `src/content/albums/`   | `/albums/<slug>`   | `.claude/skills/album-curation/` |
| 项目   | `src/content/projects/` | `/projects/<slug>` | —                                |
| 独立页 | `src/content/pages/`    | `/<slug>`          | —                                |

另有三个无内容目录的模块：首页滚动叙事（`src/components/home/`）、便利贴墙（`src/components/wall/`）、时间线（`src/pages/timeline.astro`）。

`AGENTS.md` 是模块索引，各模块的写作规范在对应 skill 里。

### 项目在线演示

在 `src/content/projects/` 新增 Markdown 文件，通过 frontmatter 配置已部署的项目：

```yaml
title: '我的项目'
description: '项目简介'
publishDate: '2026-10-02'
demo: 'https://example.com/'
embed: true
demoHeight: 760
```

`demo` 需要使用 HTTPS；`embed: true` 会在项目列表和详情页显示可操作的演示窗口。省略 `embed` 时只提供网站链接。
`demoHeight` 是桌面演示高度，默认 640，取值范围为 320–1200 像素，手机端会根据屏幕高度调整。

`/projects/` 按项目逐行展示：桌面端左侧是简介和详情入口，右侧是 H5 演示，手机端改为上下排列。
每个项目使用独立的演示窗口并延迟加载；继续向 `src/content/projects/` 添加项目文件即可增加展示行。

FEMentor 详情页位于 `/projects/fementor/`。详情页的「展开体验」会加宽演示区域并保留窗口内的操作状态。
演示组件支持站内路由切换，边框、按钮和说明文字跟随博客亮暗主题；演示网站使用自己的主题。

只嵌入可信项目。目标网站需要允许博客来源通过 iframe 加载；如果设置了 `Content-Security-Policy: frame-ancestors`
或 `X-Frame-Options`，需要在目标网站的部署配置中调整。跨站登录可能受到浏览器 Cookie 策略限制，页面始终保留
「新窗口打开」入口。iframe 的 `load` 事件无法可靠判断跨站内容是否加载成功，因此不把它作为成功提示。

## 主题定制

整套观感收敛成 `src/styles/global.css` 里的 CSS 自定义属性（`--text-main`、`--bg-main`、
`--border-main`、`--accent`、`--note-*`、字体栈），亮暗各一套。改主题只需重写
`:root` 和 `html.dark` 两个块，组件不应出现字面色值。

其他配置：

- 站点信息与导航：`src/data/site-config.ts`
- 内容 schema：`src/content.config.ts`
- 静态文件：`public/`

## License

MIT，见 `LICENSE`。
