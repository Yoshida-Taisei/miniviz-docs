import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const websiteDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

const files = {
  quickstartEn: path.join(websiteDir, 'docs/quickstart.md'),
  quickstartJa: path.join(websiteDir, 'i18n/ja/docusaurus-plugin-content-docs/current/quickstart.md'),
  fromAmbientEn: path.join(websiteDir, 'docs/migration/from_ambient.md'),
  fromAmbientJa: path.join(
    websiteDir,
    'i18n/ja/docusaurus-plugin-content-docs/current/migration/from_ambient.md'
  ),
  esp32En: path.join(websiteDir, 'docs/hardware/esp32_temp_humidity.md'),
  esp32Ja: path.join(
    websiteDir,
    'i18n/ja/docusaurus-plugin-content-docs/current/hardware/esp32_temp_humidity.md'
  ),
  llmsEn: path.join(websiteDir, 'miniviz-public/llms-full.txt'),
  llmsJa: path.join(websiteDir, 'miniviz-public/llms-full.ja.txt'),
};

async function read(key) {
  return readFile(files[key], 'utf8');
}

test('docs do not describe the event interval as device rotation', async () => {
  for (const key of Object.keys(files)) {
    const text = await read(key);
    assert.doesNotMatch(text, /ローテーション/, `${key} must not contain ローテーション`);
    assert.doesNotMatch(text, /rotate devices/i, `${key} must not contain "rotate devices"`);
    assert.doesNotMatch(text, /Rotation does not increase/i, `${key} must not contain rotation guidance`);
  }
});

test('quickstart explains the project-wide interval and multiple devices', async () => {
  const en = await read('quickstartEn');
  assert.match(en, /whole project/);
  assert.match(en, /label_key/);

  const ja = await read('quickstartJa');
  assert.match(ja, /プロジェクト全体/);
  assert.match(ja, /label_key/);
});

test('AI guide states that event rate limiting is per project', async () => {
  const en = await read('llmsEn');
  assert.match(en, /Event rate limiting is enforced per project/);

  const ja = await read('llmsJa');
  assert.match(ja, /データ送信周期制限はプロジェクト単位/);
});

test('docs use the current plan intervals', async () => {
  for (const key of ['quickstartEn', 'quickstartJa', 'llmsEn', 'llmsJa']) {
    const text = await read(key);
    assert.match(text, /60/, `${key} must mention the Free interval`);
    assert.match(text, /15/, `${key} must mention the Pro interval`);
  }
});

test('docs copy of the AI guide matches frontend/public when available', async (t) => {
  const frontendPublic = path.resolve(websiteDir, '../../../frontend/public');
  if (!existsSync(frontendPublic)) {
    t.skip('frontend/public is not available in this checkout');
    return;
  }

  for (const name of ['llms-full.txt', 'llms-full.ja.txt']) {
    const fromFrontend = await readFile(path.join(frontendPublic, name), 'utf8');
    const fromDocs = await readFile(path.join(websiteDir, 'miniviz-public', name), 'utf8');
    assert.equal(fromDocs, fromFrontend, `${name} differs from frontend/public`);
  }
});
