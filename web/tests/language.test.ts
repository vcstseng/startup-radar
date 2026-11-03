import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { resolve } from 'node:path';
import ts from 'typescript';
import { EN, translate, sourceExcerpt } from '../src/lib/translations.js';
import { parseRoute, routeQuery } from '../src/lib/route.js';
import type { Taxonomy } from '../src/types.js';
const root = resolve(process.cwd(), '..');
const read = (path: string) => JSON.parse(readFileSync(resolve(root,path),'utf8'));
const taxonomy = read('data/processed/catalog/v1/taxonomy.json') as Taxonomy;

test('English covers all taxonomy labels and explicit interface translation keys', () => {
  const keys = new Set<string>();
  for (const dimension of Object.values(taxonomy.dimensions)) for (const c of dimension.categories) {
    keys.add(c.label_zh); if(c.description_zh) keys.add(c.description_zh);
  }
  const files = ['web/src/App.tsx',...readdirSync(resolve(root,'web/src/components')).filter(f=>f.endsWith('.tsx')).map(f=>'web/src/components/'+f)];
  for(const file of files) {
    const code = ts.createSourceFile(file,readFileSync(resolve(root,file),'utf8'),ts.ScriptTarget.Latest,true,ts.ScriptKind.TSX);
    const visit = (n: ts.Node) => { if(ts.isCallExpression(n)&&n.expression.getText(code)==='t'&&n.arguments[0]&&ts.isStringLiteral(n.arguments[0])) keys.add(n.arguments[0].text); ts.forEachChild(n,visit); };visit(code);
  }
  for(const key of keys) {
    assert(Object.hasOwn(EN,key),'Missing translation: '+key);
    assert(!/[\u3400-\u9fff]/.test(EN[key]) || key === '中文','Chinese in English UI: '+key);
    assert.equal(translate('zh',key),key);
  }
});
test('language URLs retain company, filters and page while Chinese legacy URLs stay valid', () => {
  const route = parseRoute('?lang=en&industry=healthcare&solution=voice-conversation&view=company&id=upstream-10109&page=2',taxonomy);
  assert.equal(route.lang,'en');assert.deepEqual(parseRoute('?'+routeQuery(route),taxonomy),route);
  const portal={...route,view:'portal' as const};assert(routeQuery(portal).includes('lang=en'));assert(!routeQuery(portal).includes('page='));
  const chinese = {...route,lang:undefined};assert(!routeQuery(chinese).includes('lang='));assert.equal(parseRoute('?lang=bad',taxonomy).lang,undefined);
});
test('all 4085 localized descriptions are exact source text, with a matching catalog build', () => {
  const texts=read('web/public/data/localization/source-texts.json');
  const index=read('data/processed/catalog/v1/index.json');
  const records=read('data/processed/catalog/v1/records.json').records;
  assert.equal(texts.build_id,index.build_id);assert.equal(Object.keys(texts.records_by_id).length,4085);
  const batches=new Map<string,any>();
  for(const r of records){if(!batches.has(r.detail_file))batches.set(r.detail_file,read('data/processed/catalog/v1/'+r.detail_file));assert.equal(texts.records_by_id[r.id],batches.get(r.detail_file).records_by_id[r.id].evidence.text);}
  assert.equal(sourceExcerpt(''), '');assert.equal(sourceExcerpt('Original text.'),'Original text.');
  const long='Original words. '.repeat(50);assert(long.startsWith(sourceExcerpt(long).slice(0,-1)));assert(sourceExcerpt(long).endsWith('…'));
});
