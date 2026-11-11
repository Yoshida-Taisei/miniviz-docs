---
description: Embed a MiniViz line or bar chart on your own website with an iframe.
---

# Embed charts on your site

You can embed a line or bar chart from MiniViz on any website that allows iframes.

1. Open the chart from the Visualize menu.
2. Select the share icon on the chart card.
3. Turn on **Enable site embed**.
4. Select **Copy** to copy the embed code.
5. Paste the code into your website's HTML.

![Share icon on a chart card](/images/embed_chart_1.png)

![Enable site embed and copy the embed code](/images/embed_chart_2.png)

## Notes

- Only line and bar charts can be embedded.
- Anyone with the URL can view the chart. Turn off **Enable site embed** to stop sharing it.
- Turning embedding off and on again issues a new URL. The old URL stops working.
- The embedded chart does not update in real time. Reload the page to get the latest data. Use the `‹` and `›` arrows to move the 24-bucket window.
- If the page that embeds the chart sets a Content Security Policy, allow `https://miniviz.net` in `frame-src`.
