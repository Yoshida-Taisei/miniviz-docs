# miniviz-docs 運用メモ

ドキュメントのソースは **`website/`**（Docusaurus 3）。Jekyll 由来の `docs/` ディレクトリ・GitHub Pages ワークフローは削除済み。

## 実施済み

- [x] Docusaurus、`en` / `ja`、画像は `website/static/images` + `/images/...`
- [x] Jekyll（`docs/`、Gemfile、`.github/workflows/deploy.yml`）削除

## 残タスク（任意）

- [ ] Vercel 本番・`docs.miniviz.net` の DNS
- [ ] 壊れたアンカー修正（例: `ja/hardware/raspi_pico_1` 内の目次リンク）

## ローカル

```bash
cd website && npm install && npm start
```

## URL 互換

旧 Jekyll のパス（例: `/en/quickstart`）と完全一致しない場合は、Vercel の `redirects`（`vercel.json`）でリダイレクトを列挙する。
