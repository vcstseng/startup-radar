import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { paginate, parseRoute, routeQuery } from '../src/lib/route.js';
import { validateSupplements } from '../src/lib/supplements.js';
import { matchingIds } from '../src/lib/filter.js';
import { selectionGroups } from '../src/lib/selectionGroups.js';
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
  assert.equal(parseRoute('?view=unknown&page=NaN', taxonomy).view, 'portal');
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

test('selected conditions group by dimension and company tags include only its actual selected matches', () => {
  const route = parseRoute('?industry=healthcare&industry=education&solution=voice-conversation&solution=vision-imaging', taxonomy);
  assert.equal(route.selected.industry_customer.length, 2);
  assert.equal(route.selected.solution.length, 2);
  const groups = selectionGroups(route.selected, taxonomy);
  assert.deepEqual(groups.map(group => group.axis), ['industry_customer', 'solution']);
  assert.equal(groups[0].categories.length, 2);
  assert.equal(groups[1].categories.length, 2);
  const matches = matchingIds(route.selected, facets, ids);
  assert(matches.size > 0);
  const matching = catalog.records.filter(record => matches.has(record.id));
  let excludesSelectedAlternatives = false;
  for (const record of matching) {
    const actual = selectionGroups(route.selected, taxonomy, record);
    assert.equal(actual.length, 2);
    for (const group of actual) {
      const expected = taxonomy.dimensions[group.axis].categories.filter(category =>
        route.selected[group.axis].includes(category.id) && record.categories[group.axis].includes(category.id));
      assert.deepEqual(group.categories, expected);
      if (group.categories.length < route.selected[group.axis].length) excludesSelectedAlternatives = true;
    }
  }
  assert(excludesSelectedAlternatives, 'Do not stamp every selected alternative onto every company');
});

test('unfiltered records show no matching-condition tags and selected system categories retain readable names', () => {
  const empty = parseRoute('', taxonomy).selected;
  assert.deepEqual(selectionGroups(empty, taxonomy), []);
  assert.deepEqual(selectionGroups(empty, taxonomy, catalog.records[0]), []);
  const missing = parseRoute('?work=__missing', taxonomy).selected;
  const record = catalog.records.find(record => record.categories.problem_workflow.includes('__missing'))!;
  const groups = selectionGroups(missing, taxonomy, record);
  assert.equal(groups.length, 1);
  assert.equal(groups[0].categories[0].label_zh, '原始資訊不足');
});
