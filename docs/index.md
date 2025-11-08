---
layout: default
title: Miniviz Docs
nav_order: 1
permalink: /
---

# Miniviz Docs

Miniviz はブラウザ向けのビジュアライゼーションライブラリです。D3.js をベースに、宣言的な API でチャートを構築・更新できます。

## 特長

- D3.js のパワーをラップしたシンプルな API
- React / Vue / Svelte など主要フレームワークと容易に連携
- 型定義・Storybook 連携など開発者体験を重視

## クイックスタート

Miniviz を利用するには npm あるいは yarn からインストールします。

```bash
npm install miniviz
```

インストール後は、`createChart` 関数を使って最初のチャートを描画できます。

```ts
import { createChart } from "miniviz";

createChart("#app", {
  type: "bar",
  data: [
    { label: "A", value: 30 },
    { label: "B", value: 55 },
    { label: "C", value: 80 },
  ],
});
```

このドキュメントでは、導入から応用的なチャート構築、データ更新パターンまで段階的に紹介します。