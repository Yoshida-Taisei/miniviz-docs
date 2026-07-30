---
description: Copy-ready Miniviz guide for AI tools, using the same core text as the public llms-full.txt file.
---

import AiGuideTabs from '@site/src/components/AiGuideTabs';

# Miniviz Quick Start Guide (For AI)

Use the text below when you want an AI tool to understand the current public Miniviz workflow and API constraints.

The text shown on this page is the same core content published for agents at `https://miniviz.net/llms-full.txt`.

## How to use

1. Copy the text from the appropriate language tab.
2. Paste it into your AI tool.
3. Add a concrete request such as "Send temperature and humidity from an ESP32 to Miniviz" or "Show a valid Miniviz image API example".

<AiGuideTabs defaultTab="en" />

## Connect MiniViz MCP from Codex

MiniViz MCP is a Public Beta that lets compatible AI clients read only the projects you choose. It can inspect project data and settings, but it cannot send, change, or delete data, send notifications, or read images, project tokens, or credentials.

To connect it in Codex:

1. Sign in to MiniViz and open **AI connections**.
2. Copy the displayed **Server URL**.
3. In Codex, open **Plugins** → **MCPs** → **Add server**, choose a streaming HTTP server, and paste the Server URL.
4. Start authentication, sign in to MiniViz, and select the projects Codex may read.

For screenshots, troubleshooting, and more compatible-client guidance, see [Connect MiniViz MCP](./mcp/connect).
