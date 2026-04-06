# miniviz-docs

Miniviz のドキュメントです。  
本番: https://docs.miniviz.net/

ソースは **`website/`** のみ（Docusaurus）。英語がデフォルト、日本語は **`/ja/`**。

## 前提

- Node.js 20 以上（`website/.nvmrc`）

## 開発（英語デフォルト）

```bash
cd website
npm install
npm start
```

- 英語: http://localhost:3000/
- **このモードでは `http://localhost:3000/ja` はルートが無く 404 になります**（Docusaurus の開発サーバーは起動時に **1 ロケールだけ** 扱うため）。**英語と日本語を同じプロセスで開きたい場合は、下の `npm run preview` を使ってください。**

## 開発（日本語だけ見る）

```bash
cd website
npm run start:ja
```

起動メッセージの URL（通常は **`http://localhost:3000/ja/`**）を開いてください。

## 本番に近いローカル起動（`npm run preview`）

`docusaurus build` のあと `docusaurus serve` で静的成果物を配信します。**デフォルトの英語（`/`）と日本語（`/ja/`）が同時に使える**ので、Vercel 本番に近い確認向きです。

```bash
cd website
npm run preview
```

ターミナルに表示される URL（通常 **`http://localhost:3000/`**）を開き、`/` と `/ja/` を切り替えてください。

## 本番ビルドのみ

```bash
cd website
npm run build
npm run serve
```

## Vercel

プロジェクトの **Root Directory** を **`website`** に指定。`website/vercel.json` 参照（`buildCommand`: `npm run build`、`outputDirectory`: `build`）。

**多言語（i18n）について:** このままデプロイして問題ありません。`npm run build` の出力は **英語が `build/` 配下のルート**、**日本語が `build/ja/`** という静的ファイル構成になり、Vercel の静的ホスティングでそのまま配信されます。追加のリライトやエッジ設定は不要です（ドキュメント URL は `https://example.com/quickstart` と `https://example.com/ja/quickstart` のような形）。

## 画像

スクリーンショットは **`website/static/images/`** に置き、Markdown では **`/images/...`** で参照します。

## 作業メモ

詳細なチェックリストは `task.md` を参照。
