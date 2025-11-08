---
layout: default
title: データ更新のアニメーション
parent: ガイド
nav_order: 2
---

# データ更新のアニメーション

リアルタイムダッシュボード向けに、データ更新時のトランジションを設定します。

## 更新処理

```ts
const chart = createChart("#chart", {
  type: "line",
  data: initialData,
});

setInterval(async () => {
  const next = await fetchLatestMetrics();
  chart.update({
    data: next,
    transition: { duration: 600, easing: "easeOutCubic" },
  });
}, 5000);
```

`transition` オプションを指定することで、データ差分に基づくアニメーションが自動で適用されます。

## 差分ハイライト

```ts
chart.update({
  data: next,
  transition: {
    duration: 600,
    onEnd: () => chart.highlight(({ datum }) => datum.delta > 0),
  },
});
```

トランジション完了後にコールバックを指定し、増加したデータポイントのみをハイライトする例です。

