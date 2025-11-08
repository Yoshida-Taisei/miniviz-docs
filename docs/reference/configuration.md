---
layout: default
title: 設定オプション
parent: リファレンス
nav_order: 2
---

# 設定オプション

チャート外観や振る舞いを制御する主なオプションを紹介します。

## 軸 (`axis`)

```ts
options: {
  axis: {
    x: { title: "Category", tickFormat: (value) => value.toUpperCase() },
    y: { title: "Value", min: 0, max: 200 },
  },
}
```

## 凡例 (`legend`)

```ts
options: {
  legend: {
    position: "bottom",
    align: "center",
    clickable: true,
  },
}
```

## トランジション (`transition`)

```ts
options: {
  transition: {
    duration: 400,
    easing: "easeInOutQuad",
    stagger: 40,
  },
}
```

## レスポンシブ (`responsive`)

```ts
options: {
  responsive: {
    breakpoints: {
      768: { legend: { position: "top" } },
      480: { axis: { x: { tickRotation: -45 } } },
    },
  },
}
```

