# STYLEGUIDE FOR AI EDITORS

このファイルは、Miniviz ドキュメントを AI が編集するときの唯一の基準です。
判断に迷った場合は、このファイルを優先してください。

## 1. Goal

- 目的は、Docusaurus 3 ベースのドキュメントを「わかりやすく、統一された構造」で保つことです。
- 特に、ユースケース記事は「何をしたいか」で探しやすいことを重視します。
- 解説とサンプルコードは分離せず、原則として 1 記事内で完結させます。

## 2. Scope

- 英語の原本は `docs/` 配下にあります。
- 日本語版は `i18n/ja/docusaurus-plugin-content-docs/current/` 配下にあります。
- サイドバー構成は `sidebars.ts` で管理します。
- 日本語サイドバーの翻訳は `i18n/ja/docusaurus-plugin-content-docs/current.json` で管理します。

## 3. Global Rules

### MUST

- 変更時は、英語と日本語の両方をそろえること。
- 記事タイトル（H1）は内容がひと目で分かる形にすること。
- 解説とサンプルコードは同じ記事内に置くこと。
- サンプルコードは記事の巻末に置くこと。
- コードは Docusaurus の `Tabs` を使って言語別に表示すること。
- コードブロックには必ず言語指定を付けること。
- 必要に応じて `:::info`、`:::tip`、`:::caution` を使い、短い補足を読みやすくすること。

### MUST NOT

- `What is Miniviz?` / `Minivizとは？` のような共通紹介セクションを各記事に入れないこと。
- 記事内に手動の目次を置かないこと。
- サンプルコードを別ページへ誘導する冒頭リンクを置かないこと。
- `samplecode/` へのリンクを新規追加しないこと。
- 英日どちらか片方だけを更新して放置しないこと。

## 4. Information Architecture

サイドバーは次の構造を基本とします。

- `はじめに`: プロジェクトの入口。`intro.mdx`
- `クイックスタート`: 最短手順で動作確認する記事
- `ユースケース`: 目的別の実践ガイド
- `API`: 技術リファレンス

ユースケースは、少なくとも次の単位で整理します。

- 温湿度データを送る
- 画像を送る
- 外部サービスと連携する

## 5. Title Rules

### Japanese

- ハードウェア記事の H1 は、原則として `（デバイス名）で（何をするか）` の形式にすること。
- 例: `Raspberry Pi で温湿度データを送る`
- 例: `Raspberry Pi × USBカメラで画像を送る`

### English

- 英語タイトルも同じ粒度で、デバイス名と目的が分かる形にすること。
- 例: `Send temperature & humidity data with ESP32`
- 例: `Send images with Raspberry Pi and USB camera`

### Notes

- サイドバーの表示名は、原則として H1 と整合していること。
- ファイル名もできるだけ目的が分かる形で統一すること。

## 6. Article Content Rules

### Recommended Structure

- H1
- 何をする記事かの短い導入
- 必要なもの
- 手順
- 必要なら注意事項
- 巻末のサンプルコード

### Writing Style

- 冗長な説明より、短く直接的な説明を優先すること。
- 1 行だけの補足が浮いて見える場合は、通常文ではなくアドモニション化を検討すること。
- 「ここで行うこと」のような導入は簡潔に保つこと。

## 7. Sample Code Rules

- サンプルコードは記事の巻末に置くこと。
- 複数言語を載せる場合は `Tabs` を使うこと。
- 1 言語のみでも、将来の拡張を考えて `Tabs` を使ってよいです。

````markdown
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

<Tabs>
  <TabItem value="python" label="Python" default>

```python
# code
```

  </TabItem>
</Tabs>
````

## 8. Translation Rules

- 英語記事を変更したら、日本語記事も対応する内容に更新すること。
- 日本語記事を変更したら、英語記事も対応する内容に更新すること。
- サイドバー名を変更した場合は、`current.json` の翻訳キーも追従させること。

## 9. Pre-Publish Checks

変更完了前に、少なくとも次を確認します。

- 誤字脱字がないか
- 表記揺れがないか
- リンク切れがないか
- 英語・日本語の対応記事が両方存在するか
- サイドバーと記事タイトルの整合が取れているか
- 不要な `Minivizとは？` / `What is Miniviz?` セクションが入っていないか
- 手動目次が入っていないか
- `samplecode/` リンクが残っていないか