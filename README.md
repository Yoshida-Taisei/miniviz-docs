# miniviz-docs

Miniviz のドキュメントです。  
正規URL: https://miniviz.net/docs

ソースは **`website/`** のみ（Docusaurus）。英語がデフォルト、日本語は **`/docs/ja/`**。

## 前提

- Node.js 20 以上（`website/.nvmrc`）

## 開発（英語デフォルト）

```bash
cd website
npm install
npm start
```

- 英語: http://localhost:3000/docs/
- **このモードでは `http://localhost:3000/docs/ja` はルートが無く 404 になります**（Docusaurus の開発サーバーは起動時に **1 ロケールだけ** 扱うため）。**英語と日本語を同じプロセスで開きたい場合は、下の `npm run preview` を使ってください。**

## 開発（日本語だけ見る）

```bash
cd website
npm run start:ja
```

起動メッセージの URL（通常は **`http://localhost:3000/docs/ja/`**）を開いてください。

## 本番に近いローカル起動（`npm run preview`）

`docusaurus build` のあと `docusaurus serve` で静的成果物を配信します。**デフォルトの英語（`/docs/`）と日本語（`/docs/ja/`）が同時に使える**ので、Vercel 本番に近い確認向きです。

```bash
cd website
npm run preview
```

ターミナルに表示される URL（通常 **`http://localhost:3000/docs/`**）を開き、`/docs/` と `/docs/ja/` を切り替えてください。

## 本番ビルドのみ

```bash
cd website
npm run build
npm run serve
```

## Vercel

プロジェクトの **Root Directory** を **`website`** に指定。`website/vercel.json` 参照（`buildCommand`: `npm run build`、`outputDirectory`: `build`）。

`docusaurus build` の静的成果物は `build/` 直下に出力されますが、`website/vercel.json` で **`/docs/* -> /*`** の rewrite を入れ、`/docs` 配下として配信できるようにしています。

**多言語（i18n）について:** ビルド成果物そのものは **英語が `build/` ルート**、**日本語が `build/ja/`** ですが、公開URLは `https://miniviz.net/docs/...` と `https://miniviz.net/docs/ja/...` を正規形として扱います。

## MCP向け公開Docs artifact

`npm run build`はDocusaurus buildの前に、公開DocsをMCPから安全に参照するためのmanifestとmachine-readable Markdownを生成します。

```bash
cd website
npm run test:mcp-docs
npm run docs:mcp:build
```

生成物は`website/generated/mcp-static/mcp-docs/`へ出力され、git管理しません。Vercel deploy後の公開URLは次の形です。

- `https://miniviz.net/docs/mcp-docs/manifest.json`
- `https://miniviz.net/docs/mcp-docs/en/{doc_id}.md`
- `https://miniviz.net/docs/mcp-docs/ja/{doc_id}.md`

公開対象は英語の`website/docs`と日本語translation directoryにあるDocusaurus Docsだけです。`draft: true`は除外されます。内部task、deployment資料、repository全体は列挙しません。AI向けentrypointは`quickstart_for_ai`です。

Source MDXのDocusaurus componentは生成時に除去または公開本文へ展開されますが、code fence内のサンプルコードは保持されます。Manifestにはcode fenceを除いたbounded search textも含まれ、SHA-256とbyte数はGateway取得時の整合性検証に使われます。

Vercel Previewでは`VERCEL_URL`からpreview固有の`/mcp-docs` URLをmanifestへ設定します。ローカルや他のcontrolled previewで公開先を変える場合は、build時だけ`MCP_DOCS_PUBLIC_BASE_URL`へ`/mcp-docs`で終わるbase URLを指定します。Canonical page URLは常に`miniviz.net/docs`を示します。

## 画像

スクリーンショットは **`website/static/images/`** に置き、Markdown では **`/images/...`** で参照します。

## 作業メモ

詳細なチェックリストは `task.md` を参照。
