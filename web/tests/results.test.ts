import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { paginate, parseRoute, routeQuery } from '../src/lib/route.js';
import { validateSupplements } from '../src/lib/supplements.js';
import { matchingIds } from '../src/lib/filter.js';
import type { CatalogRecord, Facets, Taxonomy } from '../src/types.js';

const read = (file: string) => JSON.parse(readFileSync(resolve(process.cwd(), '..', file), 'utf8'));
const folder = 'data/processed/catalog/v1/';
const taxonomy = read(folder + 'taxonomy.json') as Taxonomy;
const facets = read(folder + 'facets.json') as Facets;
const catalog = read(folder + 'records.json') as {dataset_id: string; records: CatalogRecord[]};
const ids = new Set(catalog.records.map(record => record.id));

test('results URLs preserve filters and page, while portal URLs contain no result-only state', () => {
  const route = parseRoute('?view=results&industry=healthcare&solution=voice-conversation&page=2', taxonomy);
  assert.deepEqual(parseRoute('?' + routeQuery(route), taxonomy), route);
  assert.equal(route.view, 'results');
  assert.equal(route.page, 2);
  assert(!routeQuery({ ...route, view: 'portal' }).includes('page='));
  assert.equal(parseRoute('?view=company&page=NaN', taxonomy).view, 'portal');
  for (const value of ['0', '-5', '1.5', 'Infinity', '99999999999999999999']) {
    assert.equal(parseRoute('?view=results&page=' + value, taxonomy).page, 1);
  }
});
test('20-record pages preserve catalog order and cover every matching record once', () => {
  const route = parseRoute('?view=results&industry=healthcare&solution=voice-conversation', taxonomy);
  const matches = matchingIds(route.selected, facets, ids);
  const records = catalog.records.filter(record => matches.has(record.id));
  assert.equal(records.length, 24);
  const first = paginate(records, 1);
  const second = paginate(records, 2);
  assert.equal(first.records.length, 20);
  assert.equal(second.records.length, 4);
  assert.equal(second.first, 21);
  assert.equal(second.last, 24);
  assert.deepEqual([...first.records, ...second.records], records);
  assert.equal(paginate(records, 99999).page, 2);
  assert.equal(paginate([], 99999).page, 1);
  assert.equal(paginate([], 1).first, 0);
});
test('the committed supplement file targets this dataset without adding invented records', () => {
  const manual = read('data/supplements/v1/companies.json');
  assert.equal(validateSupplements(manual, catalog.dataset_id, ids), manual);
});
test('manual summaries require matching dataset, valid record, HTTP source and real date', () => {
  const id = catalog.records[0].id;
  const valid = { schema_version: '1.0', dataset_id: catalog.dataset_id, records_by_id: {
    [id]: { summary_zh: '測試用補充摘要，不寫入產品資料。', source_url: 'https://example.com/product', updated_at: '2026-11-03' },
  } };
  assert.equal(validateSupplements(valid, catalog.dataset_id, ids), valid);
  for (const patch of [ {source_url:'javascript:alert(1)'}, {summary_zh:''}, {updated_at:'2026-02-30'}, {updated_at:'yesterday'}, {summary_zh:35}, {source_url:'https://user:password@example.com'}, {unapproved_field:'value'} ]) {
    const invalid = structuredClone(valid);
    Object.assign(invalid.records_by_id[id], patch);
    assert.throws(() => validateSupplements(invalid, catalog.dataset_id, ids));
  }
  assert.throws(() => validateSupplements({...valid, dataset_id:'another-snapshot'}, catalog.dataset_id, ids));
  assert.throws(() => validateSupplements({...valid, records_by_id:{unknown:valid.records_by_id[id]}}, catalog.dataset_id, ids));
});
