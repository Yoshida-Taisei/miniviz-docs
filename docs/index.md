---
layout: default
title: Miniviz Docs
nav_order: 1
permalink: /
---

# Miniviz Docs

Miniviz はIoTシステム向けのBIプラットフォームです。

## 目次

* [クイックスタート](quickstart)
* [ハードウェア別ガイド](hardware)
  * [Raspberry Pi(センサーデータ送信)](hardware/raspi_1)
  * [Raspberry Pi(画像送信)](hardware/rapi_2_cam)
  * [ESP32](hardware/esp32_1)
* [サンプルコード](samplecode)
  * [Pythonサンプル1(データ送信確認用)](samplecode/python_ex1)
  * [Pythonサンプル2(温度・湿度API)](samplecode/python_ex2)
  * [ESP32サンプル(データ送信確認用)](samplecode/esp32_ex1)
  * [ラズパイカメラサンプル(画像送信)](samplecode/raspi_cam_ex1)
* [APIエンドポイント](api_endpoint/api_reference)
  * [APIエンドポイント(画像)](api_endpoint/api_image_reference)

---

## AI用クイックスタートガイド

AIに質問する際に使用できる完全なクイックスタートガイドです。以下のテキストをコピーしてAIに貼り付けて使用してください。

{% capture ai_guide_content_ja %}{% include quickstart_for_ai_raw.txt %}{% endcapture %}
{% capture ai_guide_content_en %}{% include quickstart_for_ai_en_raw.txt %}{% endcapture %}

<div style="margin: 20px 0;">
  <!-- タブ -->
  <div style="display: flex; border-bottom: 2px solid #e5e7eb; margin-bottom: 0;">
    <button id="tab-ja" onclick="window.switchTab('ja')" style="padding: 12px 24px; background: #2563eb; color: white; border: none; border-top-left-radius: 8px; border-top-right-radius: 8px; cursor: pointer; font-size: 14px; font-weight: 600;">日本語</button>
    <button id="tab-en" onclick="window.switchTab('en')" style="padding: 12px 24px; background: #e5e7eb; color: #6b7280; border: none; border-top-left-radius: 8px; border-top-right-radius: 8px; cursor: pointer; font-size: 14px; font-weight: 600; margin-left: 4px;">English</button>
  </div>
  
  <!-- コンテンツエリア -->
  <div style="background: #f5f5f5; padding: 20px; border-radius: 0 8px 8px 8px; overflow-x: auto; font-size: 13px; line-height: 1.6; max-height: 600px; overflow-y: auto;">
    <pre id="content-ja" style="margin: 0; white-space: pre-wrap; word-wrap: break-word; font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;"><code>{{ ai_guide_content_ja | escape }}</code></pre>
    <pre id="content-en" style="margin: 0; white-space: pre-wrap; word-wrap: break-word; font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace; display: none;"><code>{{ ai_guide_content_en | escape }}</code></pre>
  </div>
</div>

<script>
window.switchTab = function(lang) {
  const tabJa = document.getElementById('tab-ja');
  const tabEn = document.getElementById('tab-en');
  const contentJa = document.getElementById('content-ja');
  const contentEn = document.getElementById('content-en');
  
  if (!tabJa || !tabEn || !contentJa || !contentEn) {
    console.error('Tab elements not found');
    return;
  }
  
  if (lang === 'ja') {
    tabJa.style.background = '#2563eb';
    tabJa.style.color = 'white';
    tabEn.style.background = '#e5e7eb';
    tabEn.style.color = '#6b7280';
    contentJa.style.display = 'block';
    contentEn.style.display = 'none';
  } else {
    tabEn.style.background = '#2563eb';
    tabEn.style.color = 'white';
    tabJa.style.background = '#e5e7eb';
    tabJa.style.color = '#6b7280';
    contentEn.style.display = 'block';
    contentJa.style.display = 'none';
  }
};

// イベントリスナーを設定
function initTabs() {
  const tabJa = document.getElementById('tab-ja');
  const tabEn = document.getElementById('tab-en');
  
  if (tabJa) {
    tabJa.onclick = function() { window.switchTab('ja'); };
  }
  
  if (tabEn) {
    tabEn.onclick = function() { window.switchTab('en'); };
  }
}

// ページ読み込み時に実行
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initTabs);
} else {
  initTabs();
}
</script>

**使用方法:**
1. 上記のテキストを選択してコピー（Ctrl+A / Cmd+A で全選択、Ctrl+C / Cmd+C でコピー）
2. AIチャットに貼り付ける
3. 「Minivizで〇〇を実装したい」など、具体的な質問をする

詳細は[クイックスタートガイド（AI用）](quickstart_for_ai)ページもご覧ください。



