import crypto from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath, pathToFileURL} from 'node:url';

const SCRIPT_DIR = path.dirname(fileURLToPath(import.meta.url));
const DEFAULT_WEBSITE_DIR = path.resolve(SCRIPT_DIR, '..');
const DEFAULT_OUTPUT_DIR = path.join(
  DEFAULT_WEBSITE_DIR,
  'generated',
  'mcp-static',
  'mcp-docs',
);

const PUBLIC_DOCS = [
  {
    language: 'en',
    sourceDir: 'docs',
    aiGuide: 'miniviz-public/llms-full.txt',
  },
  {
    language: 'ja',
    sourceDir: 'i18n/ja/docusaurus-plugin-content-docs/current',
    aiGuide: 'miniviz-public/llms-full.ja.txt',
  },
];

const CANONICAL_ORIGIN = 'https://miniviz.net';
const CONTENT_PATH_PREFIX = '/docs/mcp-docs';
const MAX_DOCUMENT_BYTES = 64 * 1024;
const MAX_HEADINGS = 64;
const MAX_SEARCH_TEXT_CHARACTERS = 8_000;

function parseFrontmatter(source) {
  const normalized = source.replace(/\r\n/g, '\n');
  const frontmatterStart = normalized.search(/\S/);
  if (
    frontmatterStart === -1 ||
    !normalized.startsWith('---\n', frontmatterStart)
  ) {
    return {attributes: {}, body: normalized};
  }

  const end = normalized.indexOf('\n---\n', frontmatterStart + 4);
  if (end === -1) {
    throw new Error('Unterminated frontmatter');
  }

  const attributes = {};
  for (
    const line of normalized.slice(frontmatterStart + 4, end).split('\n')
  ) {
    const match = line.match(/^([a-zA-Z0-9_-]+):\s*(.*)$/);
    if (!match) {
      continue;
    }
    const value = match[2].trim().replace(/^(['"])(.*)\1$/, '$2');
    attributes[match[1]] = value;
  }

  return {
    attributes,
    body: normalized.slice(end + 5),
  };
}

function stripMdxWrappers(body, aiGuide) {
  const output = [];
  let inFence = false;
  let skippingFaqItems = false;

  for (const line of body.split('\n')) {
    if (/^\s*```/.test(line)) {
      inFence = !inFence;
      output.push(line);
      continue;
    }

    if (inFence) {
      output.push(line);
      continue;
    }

    if (skippingFaqItems) {
      if (/^\s*];\s*$/.test(line)) {
        skippingFaqItems = false;
      }
      continue;
    }

    if (/^\s*export const faqItems\s*=\s*\[\s*$/.test(line)) {
      skippingFaqItems = true;
      continue;
    }

    if (/^\s*import\s+.+;\s*$/.test(line)) {
      continue;
    }

    if (/^\s*<FaqPageJsonLd\b.*\/>\s*$/.test(line)) {
      continue;
    }

    if (/^\s*<AiGuideTabs\b.*\/>\s*$/.test(line)) {
      output.push(aiGuide.trim());
      continue;
    }

    if (/^\s*<\/?(Tabs|TabItem)\b[^>]*>\s*$/.test(line)) {
      continue;
    }

    output.push(line);
  }

  if (inFence) {
    throw new Error('Unterminated code fence');
  }
  if (skippingFaqItems) {
    throw new Error('Unterminated faqItems export');
  }

  return `${output.join('\n').trim()}\n`;
}

function findTitle(attributes, content, docId) {
  if (attributes.title) {
    return attributes.title;
  }
  const heading = content.match(/^#\s+(.+)$/m);
  return heading?.[1]?.trim() ?? docId;
}

function collectHeadings(content) {
  const headings = [];
  let inFence = false;

  for (const line of content.split('\n')) {
    if (/^\s*```/.test(line)) {
      inFence = !inFence;
      continue;
    }
    if (inFence) {
      continue;
    }

    const match = line.match(/^#{1,4}\s+(.+)$/);
    if (match) {
      headings.push(match[1].replace(/[`*_]/g, '').trim());
    }
    if (headings.length >= MAX_HEADINGS) {
      break;
    }
  }

  return headings;
}

function collectSearchText(content) {
  const lines = [];
  let inFence = false;

  for (const line of content.split('\n')) {
    if (/^\s*```/.test(line)) {
      inFence = !inFence;
      continue;
    }
    if (inFence || /^\s*:::[a-z]*\s*$/.test(line)) {
      continue;
    }

    lines.push(
      line
        .replace(/!\[([^\]]*)\]\([^)]+\)/g, '$1')
        .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
        .replace(/<[^>]+>/g, ' ')
        .replace(/^[\s#>*+-]+/, '')
        .replace(/[`*]/g, ''),
    );
  }

  return lines
    .join(' ')
    .normalize('NFKC')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, MAX_SEARCH_TEXT_CHARACTERS);
}

function routeForDocument(language, docId, attributes) {
  const route = attributes.slug === '/' ? '' : docId;
  const localePrefix = language === 'ja' ? '/ja' : '';
  return `/docs${localePrefix}/${route}`.replace(/\/+$/, '/');
}

async function listMarkdownFiles(rootDir) {
  const files = [];

  async function walk(currentDir) {
    const entries = await fs.readdir(currentDir, {withFileTypes: true});
    entries.sort((left, right) => left.name.localeCompare(right.name));

    for (const entry of entries) {
      const absolutePath = path.join(currentDir, entry.name);
      if (entry.isDirectory()) {
        await walk(absolutePath);
      } else if (entry.isFile() && /\.(md|mdx)$/.test(entry.name)) {
        files.push(absolutePath);
      }
    }
  }

  await walk(rootDir);
  return files;
}

export function normalizeMarkdown(source, aiGuide) {
  const {attributes, body} = parseFrontmatter(source);
  return {
    attributes,
    content: stripMdxWrappers(body, aiGuide),
  };
}

export async function buildMcpDocs({
  websiteDir = DEFAULT_WEBSITE_DIR,
  outputDir = DEFAULT_OUTPUT_DIR,
  publicBaseUrl = resolvePublicBaseUrl(),
} = {}) {
  await fs.rm(outputDir, {recursive: true, force: true});
  await fs.mkdir(outputDir, {recursive: true});

  const documents = [];

  for (const sourceConfig of PUBLIC_DOCS) {
    const sourceRoot = path.join(websiteDir, sourceConfig.sourceDir);
    const aiGuide = await fs.readFile(
      path.join(websiteDir, sourceConfig.aiGuide),
      'utf8',
    );
    const sourceFiles = await listMarkdownFiles(sourceRoot);

    for (const sourcePath of sourceFiles) {
      const relativePath = path.relative(sourceRoot, sourcePath);
      const docId = relativePath.replace(/\.(md|mdx)$/, '').split(path.sep).join('/');
      const source = await fs.readFile(sourcePath, 'utf8');
      const {attributes, content} = normalizeMarkdown(source, aiGuide);

      if (attributes.draft === 'true') {
        continue;
      }

      const contentBytes = Buffer.byteLength(content, 'utf8');
      if (contentBytes > MAX_DOCUMENT_BYTES) {
        throw new Error(
          `${sourceConfig.language}/${docId} exceeds ${MAX_DOCUMENT_BYTES} bytes`,
        );
      }

      const languageOutputDir = path.join(outputDir, sourceConfig.language);
      const contentPath = path.join(languageOutputDir, `${docId}.md`);
      await fs.mkdir(path.dirname(contentPath), {recursive: true});
      await fs.writeFile(contentPath, content, 'utf8');

      const canonicalPath = routeForDocument(
        sourceConfig.language,
        docId,
        attributes,
      );

      documents.push({
        doc_id: docId,
        language: sourceConfig.language,
        title: findTitle(attributes, content, docId),
        description: attributes.description ?? '',
        headings: collectHeadings(content),
        search_text: collectSearchText(content),
        canonical_url: new URL(canonicalPath, CANONICAL_ORIGIN).toString(),
        content_url: new URL(
          `${sourceConfig.language}/${docId}.md`,
          `${publicBaseUrl}/`,
        ).toString(),
        content_hash: `sha256:${crypto.createHash('sha256').update(content).digest('hex')}`,
        content_bytes: contentBytes,
        entrypoint: docId === 'quickstart_for_ai',
      });
    }
  }

  documents.sort((left, right) => {
    if (left.entrypoint !== right.entrypoint) {
      return left.entrypoint ? -1 : 1;
    }
    return (
      left.language.localeCompare(right.language) ||
      left.doc_id.localeCompare(right.doc_id)
    );
  });

  const manifest = {
    schema_version: 1,
    source: 'miniviz-docs',
    content_path_prefix: `${publicBaseUrl}/`,
    entrypoint_doc_id: 'quickstart_for_ai',
    languages: PUBLIC_DOCS.map(({language}) => language),
    documents,
  };

  await fs.writeFile(
    path.join(outputDir, 'manifest.json'),
    `${JSON.stringify(manifest, null, 2)}\n`,
    'utf8',
  );

  return manifest;
}

export function resolvePublicBaseUrl(env = process.env) {
  const explicit = env.MCP_DOCS_PUBLIC_BASE_URL;
  if (explicit) {
    return validatePublicBaseUrl(explicit);
  }

  if (env.VERCEL_ENV === 'preview' && env.VERCEL_URL) {
    const previewOrigin =
      `https://${env.VERCEL_URL.replace(/^https?:\/\//, '').replace(/\/+$/, '')}`;
    return validatePublicBaseUrl(`${previewOrigin}/mcp-docs`);
  }

  return `${CANONICAL_ORIGIN}${CONTENT_PATH_PREFIX}`;
}

function validatePublicBaseUrl(value) {
  const url = new URL(value);
  if (
    !['http:', 'https:'].includes(url.protocol) ||
    url.username ||
    url.password ||
    url.search ||
    url.hash ||
    !url.pathname.endsWith('/mcp-docs')
  ) {
    throw new Error('MCP_DOCS_PUBLIC_BASE_URL must end with /mcp-docs');
  }
  return url.href.replace(/\/+$/, '');
}

const invokedPath = process.argv[1]
  ? pathToFileURL(path.resolve(process.argv[1])).href
  : '';

if (import.meta.url === invokedPath) {
  const manifest = await buildMcpDocs();
  process.stdout.write(
    `Generated ${manifest.documents.length} MCP documents in ${DEFAULT_OUTPUT_DIR}\n`,
  );
}
