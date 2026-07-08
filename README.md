# 古诗源

回到原点的古诗阅读站。一屏一首诗，安静、克制。

## 本地开发

```bash
npm install
npm run dev
```

打开 [http://localhost:3000](http://localhost:3000)，首页为朝代分卷目录。

## 浏览结构

按《古诗源》原书分卷组织：**卷 → 诗人 → 诗 → 阅读页**。

| 路径 | 说明 |
|------|------|
| `/` | 卷目录 |
| `/v/[volumeSlug]` | 该卷下的诗人 |
| `/v/[volumeSlug]/[authorSlug]` | 该诗人的诗作 |
| `/p/[slug]` | 阅读页 |

## 构建

```bash
npm run build
```

产出纯静态站点，位于 `out/` 目录，无运行时服务端依赖。

## 测试

```bash
npm test
npm run typecheck
```

## 诗的数据格式

每首诗一个 Markdown 文件，放在 `content/poems/` 目录。文件名即 URL slug（如 `duan-ge-xing.md` → `/p/duan-ge-xing`）。

Frontmatter 字段：

| 字段 | 必填 | 说明 |
|------|------|------|
| `title` | 是 | 诗题 |
| `author` | 是 | 作者 |
| `authorSlug` | 是 | 作者 URL 标识（如 `cao-cao`） |
| `dynasty` | 是 | 朝代 |
| `volume` | 是 | 所属卷 slug，见 `content/volumes.json` |

正文为诗的原文，一行一句，无需改组件代码。

示例：

```markdown
---
title: 短歌行
author: 曹操
authorSlug: cao-cao
dynasty: 魏
volume: wei
---

对酒当歌，人生几何！
譬如朝露，去日苦多。
```

新增一首诗：在 `content/poems/` 下新建 `.md` 文件，重新 `npm run build` 即可。新增一卷：在 `content/volumes.json` 追加条目。

## 部署到 Cloudflare Pages

线上地址：**https://gsy.aiwayfarer.net**

### 自定义域名

在 Cloudflare Dashboard 中为 Pages 项目绑定 `gsy.aiwayfarer.net`：

1. 打开 [Cloudflare Dashboard](https://dash.cloudflare.com/) → **Workers & Pages** → 选择 **gushiyuan** 项目
2. 进入 **Custom domains** → **Set up a custom domain**
3. 输入 `gsy.aiwayfarer.net` 并确认

若 `aiwayfarer.net` 已在同一 Cloudflare 账号下，DNS 记录会自动创建（`gsy` CNAME 指向 Pages）。若未自动创建，手动添加：

| 类型 | 名称 | 目标 | 代理 |
|------|------|------|------|
| CNAME | `gsy` | `<项目名>.pages.dev` | 已代理（橙色云） |

项目名可在 Pages 项目概览页的 `*.pages.dev` 地址中查看。

### Git 连接（推荐）

1. 将仓库推送到 GitHub
2. 在 Cloudflare Dashboard → Workers & Pages → Create → Connect to Git
3. 构建设置：
   - **Build command**: `npm run build`
   - **Build output directory**: `out`
   - **Deploy command**: **留空**（不要填 `npx wrangler deploy`）
   - **Node.js version**: 20 或更高

   Git 连接的 Pages 会在构建完成后自动发布 `out/` 目录，无需额外 deploy 命令。若误填 `wrangler deploy`，会把它当成 Worker 项目而失败。

4. 推送即自动部署

### Wrangler CLI

```bash
npm run build
npx wrangler pages deploy out --project-name=gushiyuan
```

## 技术栈

- Next.js（SSG 静态导出）
- Tailwind CSS（页面骨架）
- 自定义 CSS（中文阅读排版）
- LXGW WenKai 字体

详细产品定位见根目录 [《古诗源》网站 PRD](./《古诗源》网站 PRD ｜ 回到原点.md)。
