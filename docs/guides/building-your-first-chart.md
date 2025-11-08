---
layout: default
title: 最初の棒グラフ
parent: ガイド
nav_order: 1
---

# 最初の棒グラフ

シンプルな棒グラフを作り、色やアニメーションを付けてみましょう。

## データセットの定義

```ts
const data = [
  { label: "Q1", value: 120 },
  { label: "Q2", value: 90 },
  { label: "Q3", value: 150 },
  { label: "Q4", value: 110 },
];
```

## チャートの描画

```ts
createChart("#chart", {
  type: "bar",
  data,
  options: {
    colors: ["#3B82F6"],
    axis: {
      x: { title: "Quarter" },
      y: { title: "Revenue (k$)" },
    },
  },
});
```

## ホバーインタラクション

```ts
chart.on("bar:mouseenter", (event) => {
  const { datum } = event.detail;
  tooltip.show(`${datum.label}: ${datum.value}k$`);
});

chart.on("bar:mouseleave", () => {
  tooltip.hide();
});
```

`chart.on` によるイベント購読で、チャートに簡単にインタラクションを追加できます。

