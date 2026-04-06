# miniviz-docs

Miniviz のドキュメントです。  
本番: https://docs.miniviz.net/

ソースは **`website/`** のみ（Docusaurus）。英語がデフォルト、日本語は `/ja/`。

## 前提

- Node.js 20 以上（`website/.nvmrc`）

## 開発

```bash
cd website
npm install
npm start
```

http://localhost:3000

## 本番ビルド

```bash
cd website
npm run build
npm run serve
```

## Vercel

プロジェクトの **Root Directory** を **`website`** に指定。`website/vercel.json` 参照。

## 画像

スクリーンショットは **`website/static/images/`** に置き、Markdown では **`/images/...`** で参照します。

## 作業メモ

詳細なチェックリストは `task.md` を参照。
