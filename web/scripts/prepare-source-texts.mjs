import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { resolve } from 'node:path';
export async function prepareSourceTexts() {
  const catalog = resolve(import.meta.dirname, '../../data/processed/catalog/v1');
  const index = JSON.parse(await readFile(resolve(catalog, 'index.json'), 'utf8'));
  const {records} = JSON.parse(await readFile(resolve(catalog, 'records.json'), 'utf8'));
  const batches = new Map();
  const texts = {};
  for (const record of records) {
    if (!batches.has(record.detail_file)) batches.set(record.detail_file, JSON.parse(await readFile(resolve(catalog, record.detail_file), 'utf8')));
    const detail = batches.get(record.detail_file).records_by_id[record.id];
    texts[record.id] = detail.evidence.text;
  }
  const folder = resolve(import.meta.dirname, '../public/data/localization');
  await mkdir(folder, {recursive:true});
  await writeFile(resolve(folder, 'source-texts.json'), JSON.stringify({build_id:index.build_id, records_by_id:texts}));
}
import { fileURLToPath } from 'node:url';
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) await prepareSourceTexts();
