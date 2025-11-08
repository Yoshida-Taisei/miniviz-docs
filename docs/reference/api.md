---
layout: default
title: コア API
parent: リファレンス
nav_order: 1
---

# コア API

Miniviz が提供する主要な関数の概要です。

## `createChart(selector, config)`

- `selector` — チャートを描画する DOM セレクタまたは要素
- `config.type` — `bar` / `line` / `scatter` などチャートタイプ
- `config.data` — `{ label: string; value: number }[]` 形式のデータ
- `config.options` — 軸、色、凡例などの設定

戻り値として `ChartInstance` を返します。`update` や `destroy` メソッドを持ちます。

## `update(partialConfig)`

チャートインスタンスの状態を更新します。`data` や `options` の差分のみ指定できます。

```ts
chart.update({
  data: nextData,
  options: {
    colors: ["#F97316", "#10B981"],
  },
});
```

## `usePlugin(plugin)`

プラグインを登録して機能を拡張します。

```ts
import { tooltipPlugin } from "miniviz/plugins";

chart.usePlugin(tooltipPlugin());
```

