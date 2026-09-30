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

| 模块 | 内容目录 | 路由 | Skill |
| --- | --- | --- | --- |
| 写作 | `src/content/blog/` | `/blog/<slug>` | — |
| 专辑 | `src/content/albums/` | `/albums/<slug>` | `.claude/skills/album-curation/` |
| 项目 | `src/content/projects/` | `/projects/<slug>` | — |
| 独立页 | `src/content/pages/` | `/<slug>` | — |

另有三个无内容目录的模块：首页滚动叙事（`src/components/home/`）、便利贴墙（`src/components/wall/`）、时间线（`src/pages/timeline.astro`）。

`AGENTS.md` 是模块索引，各模块的写作规范在对应 skill 里。

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
