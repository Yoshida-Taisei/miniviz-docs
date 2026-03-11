---
layout: default
title: Miniviz Docs
nav_order: 1
permalink: /en/
---

<div style="text-align: right; margin-bottom: 20px;">
  <a href="/ja/" style="color: #2563eb; text-decoration: none; font-size: 14px;">日本語</a>
</div>

# Miniviz Docs

Miniviz is a BI platform for IoT systems.

## Table of Contents

* [Quick Start](quickstart)
* Hardware Guides
  * [Raspberry Pi (Sensor Data Transmission)](hardware/raspi_1)
  * [Raspberry Pi (Image Transmission)](hardware/rapi_2_cam)
  * [ESP32](hardware/esp32_1)
  * [SwitchBot CO2 Sensor](hardware/swbot_co2)
* Sample Code
  * [Python Sample 1 (Data Sending Test)](samplecode/python_ex1)
  * [Python Sample 2 (Temperature & Humidity API)](samplecode/python_ex2)
  * [ESP32 Sample (Data Sending Test)](samplecode/esp32_ex1)
  * [Raspberry Pi Camera Sample (Image Transmission)](samplecode/raspi_cam_ex1)
* API Endpoints
  * [API Endpoint (Data Transmission)](api_endpoint/api_reference)
  * [API Endpoint (Image Transmission)](api_endpoint/api_image_reference)

---

## AI Quick Start Guide

This is a complete quick start guide that you can use when asking questions to AI. Copy the text below and paste it into AI.

{% capture ai_guide_content_ja %}{% include quickstart_for_ai_raw.txt %}{% endcapture %}
{% capture ai_guide_content_en %}{% include quickstart_for_ai_en_raw.txt %}{% endcapture %}

<div style="margin: 20px 0;">
  <!-- Tabs -->
  <div style="display: flex; border-bottom: 2px solid #e5e7eb; margin-bottom: 0;">
    <button id="tab-ja" onclick="window.switchTab('ja')" style="padding: 12px 24px; background: #e5e7eb; color: #6b7280; border: none; border-top-left-radius: 8px; border-top-right-radius: 8px; cursor: pointer; font-size: 14px; font-weight: 600;">日本語</button>
    <button id="tab-en" onclick="window.switchTab('en')" style="padding: 12px 24px; background: #2563eb; color: white; border: none; border-top-left-radius: 8px; border-top-right-radius: 8px; cursor: pointer; font-size: 14px; font-weight: 600; margin-left: 4px;">English</button>
  </div>
  
  <!-- Content Area -->
  <div style="background: #f5f5f5; padding: 20px; border-radius: 0 8px 8px 8px; overflow-x: auto; font-size: 13px; line-height: 1.6; max-height: 600px; overflow-y: auto;">
    <pre id="content-ja" style="margin: 0; white-space: pre-wrap; word-wrap: break-word; font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace; display: none;"><code>{{ ai_guide_content_ja | escape }}</code></pre>
    <pre id="content-en" style="margin: 0; white-space: pre-wrap; word-wrap: break-word; font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;"><code>{{ ai_guide_content_en | escape }}</code></pre>
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

// Set event listeners
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

// Execute on page load
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initTabs);
} else {
  initTabs();
}
</script>

**How to Use:**
1. Select and copy the text above (Ctrl+A / Cmd+A to select all, Ctrl+C / Cmd+C to copy)
2. Paste it into an AI chat
3. Ask specific questions like "I want to implement XX with Miniviz"

For more details, see the [Quick Start Guide (for AI)](quickstart_for_ai) page.

