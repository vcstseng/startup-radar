import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { parseRoute, routeQuery } from '../src/lib/route.js';
import { detailFromBatch, safeWebsite } from '../src/lib/company.js';
import type { CatalogRecord, Taxonomy } from '../src/types.js';

const folder = resolve(process.cwd(), '../data/processed/catalog/v1');
const read = (file: string) => JSON.parse(readFileSync(resolve(folder, file), 'utf8'));
const catalog = read('records.json') as { dataset_id: string; records: CatalogRecord[] };
const taxonomy = read('taxonomy.json') as Taxonomy;
const batches = new Map<string, ReturnType<typeof read>>();
for (const record of catalog.records) if (!batches.has(record.detail_file)) batches.set(record.detail_file, read(record.detail_file));

test('company URLs preserve record, filters and results page while results URLs drop company ID', () => {
  const company = parseRoute('?view=company&id=upstream-10109&industry=healthcare&work=sales-marketing&solution=agents&page=2', taxonomy);
  assert.equal(company.view, 'company');
  assert.equal(company.id, 'upstream-10109');
  assert.deepEqual(parseRoute('?' + routeQuery(company), taxonomy), company);
  const back = parseRoute('?' + routeQuery({ ...company, view: 'results' }), taxonomy);
  assert.equal(back.view, 'results');
  assert.equal(back.page, 2);
  assert.equal(back.id, undefined);
  assert.deepEqual(back.selected, company.selected);
  const direct = parseRoute('?view=company&id=upstream-10109', taxonomy);
  assert.equal(direct.page, 1);
  assert(direct.selected.industry_customer.length === 0 && direct.selected.solution.length === 0);
});
test('every one of the 4085 records resolves to the correct original detail in 21 shared batches', () => {
  assert.equal(batches.size, 21);
  for (const record of catalog.records) {
    const detail = detailFromBatch(batches.get(record.detail_file), catalog.dataset_id, record);
    assert.equal(detail.id, record.id);
    assert.deepEqual(detail.tags, record.tags);
    assert.equal(detail.summary_zh, record.summary_zh);
    assert.equal(typeof detail.evidence.text, 'string');
  }
});
test('wrong datasets, records and damaged source content are rejected instead of shown on the wrong company', () => {
  const record = catalog.records.find(record => record.id === 'upstream-10109')!;
  const original = batches.get(record.detail_file);
  const valid = detailFromBatch(original, catalog.dataset_id, record);
  const batch = (detail: unknown) => ({ dataset_id: catalog.dataset_id, records_by_id: { [record.id]: detail } });
  assert.throws(() => detailFromBatch({...original,dataset_id:'different-snapshot'},catalog.dataset_id,record));
  assert.throws(() => detailFromBatch(batch(undefined),catalog.dataset_id,record));
  for (const change of [{id:'wrong-id'}, {name:'Another company'}, {notes:[{}]}, {evidence:{field:'description',text:35}}, {tags:{}}]) {
    assert.throws(() => detailFromBatch(batch({...valid,...change}),catalog.dataset_id,record));
  }
});
test('external website links accept only HTTP or HTTPS without embedded credentials', () => {
  assert.equal(safeWebsite('https://example.com/product'), 'https://example.com/product');
  assert.equal(safeWebsite('http://example.com'), 'http://example.com/');
  for (const url of [null,'','javascript:alert(1)','data:text/html,test','file:///D:/private','https://user:pass@example.com','not a url']) assert.equal(safeWebsite(url),null);
});
