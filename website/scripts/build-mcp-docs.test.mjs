import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';

import {
  buildMcpDocs,
  normalizeMarkdown,
  resolvePublicBaseUrl,
} from './build-mcp-docs.mjs';

test('normalizeMarkdown removes MDX wrappers but preserves fenced code', () => {
  const source = `
---
title: Example
description: Example description
---

import Tabs from '@theme/Tabs';

# Example

<AiGuideTabs defaultTab="en" />

<Tabs>
  <TabItem value="python">

\`\`\`python
import os
print("<Tabs>")
\`\`\`

  </TabItem>
</Tabs>
`;

  const normalized = normalizeMarkdown(source, '# AI Guide\n\nUse this guide.');

  assert.equal(normalized.attributes.title, 'Example');
  assert.match(normalized.content, /# AI Guide/);
  assert.match(normalized.content, /import os/);
  assert.match(normalized.content, /print\("<Tabs>"\)/);
  assert.doesNotMatch(normalized.content, /import Tabs from/);
  assert.doesNotMatch(normalized.content, /<TabItem/);
  assert.doesNotMatch(normalized.content, /^\s*---\n[a-zA-Z0-9_-]+:/);
});

test('buildMcpDocs exports the public English and Japanese corpus', async (t) => {
  const outputDir = await fs.mkdtemp(path.join(os.tmpdir(), 'miniviz-mcp-docs-'));
  t.after(() => fs.rm(outputDir, {recursive: true, force: true}));

  const websiteDir = path.resolve(import.meta.dirname, '..');
  const manifest = await buildMcpDocs({websiteDir, outputDir});

  assert.equal(manifest.schema_version, 1);
  assert.deepEqual(manifest.languages, ['en', 'ja']);
  assert.equal(manifest.documents.length, 28);
  const apiReference = manifest.documents.find(
    (document) =>
      document.language === 'en' &&
      document.doc_id === 'api_endpoint/api_reference',
  );
  assert.match(apiReference.search_text, /label_key/);
  assert.match(apiReference.search_text, /boolean/i);

  for (const language of manifest.languages) {
    const entrypoint = manifest.documents.find(
      (document) =>
        document.language === language &&
        document.doc_id === manifest.entrypoint_doc_id,
    );
    assert.ok(entrypoint);
    assert.equal(entrypoint.entrypoint, true);

    const content = await fs.readFile(
      path.join(outputDir, language, 'quickstart_for_ai.md'),
      'utf8',
    );
    assert.doesNotMatch(content, /<AiGuideTabs/);
    assert.ok(content.length > 1_000);
  }

  for (const document of manifest.documents) {
    const content = await fs.readFile(
      path.join(outputDir, document.language, `${document.doc_id}.md`),
      'utf8',
    );
    const hash = crypto.createHash('sha256').update(content).digest('hex');
    assert.equal(document.content_hash, `sha256:${hash}`);
    assert.equal(document.content_bytes, Buffer.byteLength(content, 'utf8'));
    assert.match(document.canonical_url, /^https:\/\/miniviz\.net\/docs\//);
    assert.match(
      document.content_url,
      /^https:\/\/miniviz\.net\/docs\/mcp-docs\//,
    );
    assert.ok(document.search_text.length <= 8_000);
    assert.doesNotMatch(content, /^\s*---\n[a-zA-Z0-9_-]+:/);
    assert.doesNotMatch(content, /^import .+ from /m);
    assert.doesNotMatch(content, /^export const faqItems/m);
  }

  const serializedManifest = await fs.readFile(
    path.join(outputDir, 'manifest.json'),
  );
  assert.ok(serializedManifest.byteLength <= 262_144);
});

test('resolvePublicBaseUrl uses the Vercel preview artifact path', () => {
  expectUrl(
    resolvePublicBaseUrl({
      VERCEL_ENV: 'preview',
      VERCEL_URL: 'miniviz-docs-git-feature.vercel.app',
    }),
    'https://miniviz-docs-git-feature.vercel.app/mcp-docs',
  );
});

function expectUrl(actual, expected) {
  assert.equal(actual, expected);
}
