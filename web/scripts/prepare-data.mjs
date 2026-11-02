import { mkdir, copyFile, readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const source = resolve(import.meta.dirname, '../../data/processed/catalog/v1');
const target = resolve(import.meta.dirname, '../public/data/catalog');
const manifest = JSON.parse(await readFile(resolve(source, 'manifest.json'), 'utf8'));
await mkdir(target, { recursive: true });
// Copy only website assets, not raw, review audits or local manifests.
const files = ['index.json', 'taxonomy.json', 'summary.json', 'facets.json', 'records.json',
  ...Object.keys(manifest.outputs).filter(name => name.startsWith('details/'))];
for (const file of files) {
  await mkdir(resolve(target, file, '..'), { recursive: true });
  await copyFile(resolve(source, file), resolve(target, file));
}
console.log(`Prepared ${files.length} catalog assets.`);
