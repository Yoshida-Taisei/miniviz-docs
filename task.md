# miniviz-docs 運用メモ

ドキュメントのソースは **`website/`**（Docusaurus 3）。Jekyll 由来の `docs/` ディレクトリ・GitHub Pages ワークフローは削除済み。

## 実施済み

- [x] Docusaurus、`en` / `ja`、画像は `website/static/images` + `/images/...`
- [x] Jekyll（`docs/`、Gemfile、`.github/workflows/deploy.yml`）削除
- [x] `baseUrl: '/docs/'` と Vercel rewrite で `/docs` 配信に対応

## 残タスク（任意）

- [ ] Vercel 本番で `miniviz.net/docs` を正規URLとして公開
- [ ] `docs.miniviz.net/*` から `miniviz.net/docs/*` への `301` リダイレクトを設定
- [ ] 壊れたアンカー修正（例: `ja/hardware/raspi_pico_1` 内の目次リンク）

## ローカル

```bash
cd website && npm install && npm start
```

## URL 互換

旧 Jekyll のパス（例: `/en/quickstart`）や旧 docs サブドメインのパスと完全一致しない場合は、Vercel の `redirects`（`vercel.json`）やドメイン設定側でリダイレクトを列挙する。
