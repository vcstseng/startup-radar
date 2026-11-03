import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { createHash } from 'node:crypto';
import { duplicateIndex, uniqueDisplayCount, collapseRecords, duplicateIds } from '../src/lib/duplicates.js';
import { categoryCounts, distributionCounts, matchingIds, parseSelection, emptySelection } from '../src/lib/filter.js';
import { AXES, type CatalogRecord, type Facets, type Taxonomy } from '../src/types.js';
import { paginate } from '../src/lib/route.js';

const root = resolve(process.cwd(), '..');
const read = (file: string) => JSON.parse(readFileSync(resolve(root, file), 'utf8'));
const catalog = read('data/processed/catalog/v1/records.json') as {dataset_id: string; records: CatalogRecord[]};
const source = read('data/processed/catalog/v1/manifest.json');
const facets = read('data/processed/catalog/v1/facets.json') as Facets;
const taxonomy = read('data/processed/catalog/v1/taxonomy.json') as Taxonomy;
const artifact = read('data/processed/display/v1/duplicates.json');
const all = new Set(catalog.records.map(record => record.id));
const index = duplicateIndex(artifact, catalog.dataset_id, source.build_id, all);

test('distribution counts the actual current intersection, grouped only after original-record matching', () => {
  for (const query of ['', '?industry=healthcare&solution=voice-conversation', '?industry=healthcare&industry=life-sciences&solution=voice-conversation', '?industry=aerospace&work=sales-marketing&solution=software-platforms']) {
    const selected = parseSelection(query, taxonomy);
    const matches = matchingIds(selected, facets, all);
    const distribution = distributionCounts(matches, facets, index);
    const total = uniqueDisplayCount(matches, index);
    for (const axis of AXES) for (const c of taxonomy.dimensions[axis].categories) {
      const sourceMatches = catalog.records.filter(r => matches.has(r.id) && r.categories[axis].includes(c.id));
      assert.equal(distribution[axis][c.id], collapseRecords(sourceMatches, index).length);
      assert(distribution[axis][c.id] <= total);
    }
    if (query === '?industry=healthcare&solution=voice-conversation') {
      assert.equal(distribution.solution['ml-prediction'], 0);
      assert(categoryCounts(selected, facets, all, index).solution['ml-prediction'] > 0);
    }
  }
  assert(AXES.every(axis => Object.values(distributionCounts(new Set(), facets, index)[axis]).every(n => n === 0)));
});

test('exact duplicate audit covers all source records and contains only complete identical triples', () => {
  const batches = new Map<string, any>();
  const expected = new Map<string, string[]>();
  for (const record of catalog.records) {
    if (!batches.has(record.detail_file)) batches.set(record.detail_file, read('data/processed/catalog/v1/' + record.detail_file));
    const evidence = batches.get(record.detail_file).records_by_id[record.id].evidence.text as string;
    if (!record.name.trim() || !record.website || !evidence.trim()) continue;
    const key = JSON.stringify([record.name, record.website, evidence]);
    expected.set(key, [...(expected.get(key) ?? []), record.id]);
  }
  const groups = [...expected.values()].filter(ids => ids.length > 1).map(ids => ids.sort()).sort((a,b) => a[0].localeCompare(b[0]));
  assert.deepEqual([...index.groups.values()], groups);
  assert.equal(index.groups.size, 84);
  assert.equal(index.canonicalById.size, 169);
  assert.equal(index.sourceRecordCount, 4085);
  assert.equal(index.displayRecordCount, 4000);
  assert.equal(uniqueDisplayCount(all, index), 4000);
  assert.equal(collapseRecords(catalog.records, index).length, 4000);
  assert.equal(paginate(collapseRecords(catalog.records, index), 205).page, 200);
  const manifest = read('data/processed/display/v1/manifest.json');
  for (const [file, hash] of Object.entries(manifest.inputs)) {
    assert.equal(createHash('sha256').update(readFileSync(resolve(root, file))).digest('hex'), hash);
  }
  for (const [file, hash] of Object.entries(manifest.outputs)) {
    assert.equal(createHash('sha256').update(readFileSync(resolve(root, 'data/processed/display/v1', file))).digest('hex'), hash);
  }
});
test('Flyr displays once while both old IDs and the non-primary matching variant remain available', () => {
  const both = catalog.records.filter(record => record.name === 'Flyr');
  assert.equal(both.length, 2);
  assert.equal(collapseRecords(both, index).length, 1);
  assert.deepEqual(duplicateIds('upstream-21284', index), ['upstream-20666','upstream-21284']);
  const selected = parseSelection('?industry=aerospace&work=sales-marketing&solution=software-platforms', taxonomy);
  const ids = matchingIds(selected, facets, all);
  assert(!ids.has('upstream-20666'));
  assert(ids.has('upstream-21284'));
  const shown = collapseRecords(catalog.records.filter(record => ids.has(record.id)), index).filter(record => record.name === 'Flyr');
  assert.equal(shown.length, 1);
  assert.equal(shown[0].id, 'upstream-21284');
  assert(shown[0].tags.solution.includes('管理系統'));
});
test('category counts use the same source-first grouping as result counts', () => {
  for (const selected of [emptySelection(), parseSelection('?industry=aerospace&work=sales-marketing', taxonomy)]) {
    const counts = categoryCounts(selected, facets, all, index);
    for (const axis of AXES) {
      const context = matchingIds(selected, facets, all, axis);
      for (const [category, bucket] of Object.entries(facets.dimensions[axis])) {
        const ids = bucket.record_ids.filter(id => context.has(id));
        assert.equal(counts[axis][category], uniqueDisplayCount(ids,index));
      }
    }
  }
});
test('never manufacture cross-record intersections by joining tags within a duplicate group', () => {
  const template = catalog.records[0];
  const a: CatalogRecord = {...template,id:'a',categories:{industry_customer:['i'],problem_workflow:['x'],solution:['m']}};
  const b: CatalogRecord = {...template,id:'b',categories:{industry_customer:['i'],problem_workflow:['y'],solution:['n']}};
  const fake = {dimensions:Object.fromEntries(AXES.map(axis => [axis, Object.fromEntries([...new Set([...a.categories[axis],...b.categories[axis]])].map(id =>
    [id,{record_ids:[a,b].filter(record => record.categories[axis].includes(id)).map(record => record.id)}]))]))} as Facets;
  const testIds = new Set(['a','b']);
  const grouped = duplicateIndex({schema_version:'1.0',dataset_id:'test',build_id:'test',rule:'exact_nonempty_name_website_evidence',source_record_count:2,display_record_count:1,groups:{a:['a','b']}},'test','test',testIds);
  const ids = matchingIds({industry_customer:['i'],problem_workflow:['x'],solution:['n']},fake,testIds);
  assert.equal(ids.size,0);
  assert.equal(uniqueDisplayCount(ids,grouped),0);
  assert.equal(collapseRecords([a,b].filter(record=>ids.has(record.id)),grouped).length,0);
});
test('stale or overlapping duplicate indexes fail rather than silently altering counts', () => {
  assert.throws(()=>duplicateIndex({...artifact,build_id:'wrong'},catalog.dataset_id,source.build_id,all));
  assert.throws(()=>duplicateIndex({...artifact,display_record_count:4085},catalog.dataset_id,source.build_id,all));
  assert.throws(()=>duplicateIndex({...artifact,groups:{unknown:['unknown','upstream-20666']}},catalog.dataset_id,source.build_id,all));
  assert.throws(()=>duplicateIndex({...artifact,groups:{'upstream-20666':['upstream-20666','upstream-21284'],'upstream-21284':['upstream-21284','upstream-21301']}},catalog.dataset_id,source.build_id,all));
});
