import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { AXES, type Facets, type Taxonomy, type CatalogRecord } from '../src/types.js';
import { availableCategories, emptySelection, matchingIds, categoryCounts, parseSelection, selectionQuery, toggleSelection } from '../src/lib/filter.js';

const folder = resolve(process.cwd(), '../data/processed/catalog/v1');
const read = (name: string) => JSON.parse(readFileSync(resolve(folder, name), 'utf8'));
const facets = read('facets.json') as Facets;
const taxonomy = read('taxonomy.json') as Taxonomy;
const rows = (read('records.json') as { records: CatalogRecord[] }).records;
const all = new Set(rows.map(r => r.id));

test('the portal uses all 4085 records and exactly 25 / 22 / 28 normal categories', () => {
  assert.equal(all.size, 4085);
  assert.deepEqual(AXES.map(axis => taxonomy.dimensions[axis].categories.filter(c => !c.id.startsWith('__')).length), [25, 22, 28]);
  assert.equal(matchingIds(emptySelection(), facets, all).size, 4085);
});
test('cross-dimension AND and within-dimension OR match the actual catalog', () => {
  let selected = toggleSelection(emptySelection(), 'industry_customer', 'healthcare');
  selected = toggleSelection(selected, 'industry_customer', 'life-sciences');
  selected = toggleSelection(selected, 'solution', 'voice-conversation');
  selected = toggleSelection(selected, 'problem_workflow', 'finance-accounting');
  const expected = rows.filter(r =>
    (r.categories.industry_customer.includes('healthcare') || r.categories.industry_customer.includes('life-sciences')) &&
    r.categories.solution.includes('voice-conversation') && r.categories.problem_workflow.includes('finance-accounting')).map(r => r.id).sort();
  assert.deepEqual([...matchingIds(selected, facets, all)].sort(), expected);
});
test('every category resolves to its complete index without duplicate records', () => {
  for (const axis of AXES) for (const category of taxonomy.dimensions[axis].categories) {
    const selected = toggleSelection(emptySelection(), axis, category.id);
    const found = matchingIds(selected, facets, all);
    assert.equal(found.size, facets.dimensions[axis][category.id].record_count);
    assert.deepEqual([...found].sort(), [...new Set(facets.dimensions[axis][category.id].record_ids)].sort());
  }
});
test('each column preserves OR alternatives that satisfy the other two columns', () => {
  const selected = toggleSelection(toggleSelection(emptySelection(), 'industry_customer', 'healthcare'), 'solution', 'voice-conversation');
  const counts = categoryCounts(selected, facets, all);
  assert.equal(matchingIds(selected, facets, all).size, 24);
  for (const axis of AXES) for (const category of taxonomy.dimensions[axis].categories) {
    const expected = rows.filter(r => r.categories[axis].includes(category.id) &&
      AXES.every(other => other === axis || selected[other].length === 0 || selected[other].some(id => r.categories[other].includes(id)))).length;
    assert.equal(counts[axis][category.id], expected);
  }
  const alternatives = availableCategories(taxonomy.dimensions.solution.categories, selected.solution, counts.solution);
  assert(alternatives.some(c => c.id === 'vision-imaging'));
  const expanded = toggleSelection(selected, 'solution', 'vision-imaging');
  assert(matchingIds(expanded, facets, all).size > 24);
});

test('healthcare work plus physical robotics does not include a chatbot', () => {
  const selected = toggleSelection(toggleSelection(emptySelection(), 'problem_workflow', 'healthcare-care'), 'solution', 'robotics');
  const matches = matchingIds(selected, facets, all);
  assert.equal(matches.size, 0);
  const chatbot = rows.find(r => r.id === 'upstream-12167')!;
  assert(chatbot.tags.solution.includes('AI 聊天機器人'));
  assert(!chatbot.categories.solution.includes('robotics'));
  assert(rows.some(r => r.tags.solution.includes('機器人') && r.categories.solution.includes('robotics')));
});
test('shared URLs round-trip, deduplicate inputs and ignore unknown IDs', () => {
  const selected = parseSelection('?industry=healthcare&industry=life-sciences&solution=voice-conversation', taxonomy);
  assert.deepEqual(parseSelection('?' + selectionQuery(selected), taxonomy), selected);
  assert.deepEqual(parseSelection('?industry=healthcare&industry=healthcare&industry=not-real&work=bad', taxonomy).industry_customer, ['healthcare']);
  assert.equal(selectionQuery(emptySelection()), '');
});
test('unknown-data filters are selectable and removal restores the prior state', () => {
  const selected = toggleSelection(emptySelection(), 'problem_workflow', '__missing');
  assert.equal(matchingIds(selected, facets, all).size, 493);
  assert.deepEqual(toggleSelection(selected, 'problem_workflow', '__missing'), emptySelection());
});

test('zero options hide, selected zero options remain removable, and clearing restores options', () => {
  const selected = toggleSelection(toggleSelection(emptySelection(), 'industry_customer', 'healthcare'), 'solution', 'voice-conversation');
  const counts = categoryCounts(selected, facets, all);
  const categories = taxonomy.dimensions.problem_workflow.categories;
  const available = availableCategories(categories, [], counts.problem_workflow);
  assert(available.length < categories.length);
  assert(available.every(c => counts.problem_workflow[c.id] > 0));
  const zero = categories.find(c => counts.problem_workflow[c.id] === 0)!;
  assert(zero);
  assert(availableCategories(categories, [zero.id], counts.problem_workflow).some(c => c.id === zero.id));
  const cleared = categoryCounts(emptySelection(), facets, all);
  assert(availableCategories(categories, [], cleared.problem_workflow).some(c => c.id === zero.id));
});
