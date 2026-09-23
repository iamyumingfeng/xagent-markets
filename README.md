# xagent-markets

XAgent 模板市场的静态内容仓。模板以 JSON manifest 描述，经构建脚本校验并生成索引与详情，发布到 GitHub Pages；二进制素材放 sibling 仓 [`xagent-market-assets`](https://github.com/iamyumingfeng/xagent-market-assets)，经 jsDelivr CDN 提供。

## 分类

`image` / `video` / `workflow` / `agent` / `plugin`（插件首版仅预留 schema）。

## 本地开发

```bash
pnpm install
pnpm validate   # 仅校验 templates/ 下 manifest
pnpm test       # vitest 单测
pnpm build      # 生成 dist/（index + detail）
```

## 新增模板

1. 在 `templates/{category}/` 新建 `{id}.json`，遵循 `schema/manifest.schema.json`。
2. `id` 全仓唯一（小写字母数字与连字符）；`version` 用 semver。
3. 素材（封面/参考图/工作流 DSL/插件包）提交到 `xagent-market-assets`，manifest 内写相对路径。
4. `pnpm validate && pnpm build` 通过后提 PR。

## 产物结构

```
dist/
├── index/{category}.json          # 轻量索引（含 detailUrl）
└── detail/{category}/{id}.json    # 完整详情（素材路径已解析为绝对 CDN URL）
```

## 契约

manifest / index 的字段定义见 `schema/`，与客户端 `lib/models/market/` 逐字对应。修改 Schema 必须同步客户端解析模型。
