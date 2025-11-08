---
layout: default
title: はじめに
nav_order: 2
---

# はじめに

Miniviz を導入し、最初のチャートを描画するまでの流れを解説します。

## インストール

```bash
npm install miniviz
# もしくは
yarn add miniviz
```

TypeScript プロジェクトの場合は、型定義がパッケージに同梱されているため追加設定は不要です。

## 最小構成

```html
<div id="chart"></div>
<script type="module">
  import { createChart } from "miniviz";

  createChart("#chart", {
    type: "line",
    data: [
      { label: "Jan", value: 12 },
      { label: "Feb", value: 18 },
      { label: "Mar", value: 9 },
    ],
  });
</script>
```

## 推奨ディレクトリ構成

```
src/
  charts/
    salesChart.ts
  data/
    sales.json
  index.ts
```

チャートごとにコンポーネント化しておくことで、プロジェクト規模が大きくなっても保守性を保てます。

