"""Audit exact name + nonempty website + original text duplicates; never edit catalog."""
import hashlib
import json
from collections import defaultdict
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
CATALOG = ROOT / 'data/processed/catalog/v1'
OUT = ROOT / 'data/processed/display/v1'
AXES = ('industry_customer', 'problem_workflow', 'solution')

def read(path):
    return json.loads(path.read_text(encoding='utf-8-sig'))

def sha(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()

def write(name, value):
    (OUT / name).write_text(json.dumps(value, ensure_ascii=False, indent=2) + '\n', encoding='utf-8', newline='\n')

def main():
    manifest = read(CATALOG / 'manifest.json')
    catalog = read(CATALOG / 'records.json')
    for name in ['records.json'] + sorted(n for n in manifest['outputs'] if n.startswith('details/')):
        assert sha(CATALOG / name) == manifest['outputs'][name], name
    cache = {name: read(CATALOG / name)['records_by_id'] for name in manifest['outputs'] if name.startswith('details/')}
    rows = catalog['records']
    buckets = defaultdict(list)
    skipped = []
    for record in rows:
        detail = cache[record['detail_file']][record['id']]
        assert detail['id'] == record['id'] and detail['tags'] == record['tags']
        text = detail['evidence']['text']
        if not record['name'].strip() or not record['website'] or not text.strip():
            skipped.append(record['id'])
            continue
        buckets[(record['name'], record['website'], text)].append(record)
    groups, audit = {}, []
    for key, members in sorted(buckets.items(), key=lambda item: min(r['id'] for r in item[1])):
        if len(members) < 2:
            continue
        members = sorted(members, key=lambda r: r['id'])
        canonical = members[0]['id']
        groups[canonical] = [r['id'] for r in members]
        variants = [{**{k: r[k] for k in ('id', 'summary_zh', 'tags', 'categories', 'source', 'detail_file')},
                     'notes': cache[r['detail_file']][r['id']]['notes']} for r in members]
        def differs(field):
            return len({json.dumps(v[field], ensure_ascii=False, sort_keys=True) for v in variants}) > 1
        audit.append({'name': key[0], 'website': key[1], 'evidence_text': key[2], 'canonical_id': canonical,
                      'record_ids': groups[canonical], 'summary_differs': differs('summary_zh'),
                      'tags_differ': differs('tags'), 'categories_differ': differs('categories'),
                      'notes_differ': differs('notes'), 'variants': variants})
    suppressed = sum(len(ids) - 1 for ids in groups.values())
    canonical_by_id = {identifier: canonical for canonical, ids in groups.items() for identifier in ids}
    names = defaultdict(list)
    for row in rows:
        names[row['name']].append(row)
    unmerged = []
    for name, members in sorted(names.items()):
        if len(members) < 2 or len({canonical_by_id.get(r['id'], r['id']) for r in members}) < 2:
            continue
        unmerged.append({'name': name, 'reason': 'same_name_but_url_or_original_differs_or_is_missing',
                         'records': [{'id': r['id'], 'website': r['website'], 'source': r['source'],
                                      'evidence_sha256': hashlib.sha256(cache[r['detail_file']][r['id']]['evidence']['text'].encode('utf-8')).hexdigest()}
                                     for r in members]})
    index = {'schema_version': '1.0', 'dataset_id': catalog['dataset_id'], 'build_id': manifest['build_id'],
             'rule': 'exact_nonempty_name_website_evidence', 'source_record_count': len(rows),
             'display_record_count': len(rows) - suppressed, 'groups': groups}
    summary = {'source_records': len(rows), 'display_records': len(rows) - suppressed,
               'duplicate_groups': len(groups), 'duplicate_members': sum(map(len, groups.values())),
               'suppressed_display_rows': suppressed, 'skipped_missing_key_records': len(skipped),
               'groups_with_different_summary': sum(g['summary_differs'] for g in audit),
               'groups_with_different_tags': sum(g['tags_differ'] for g in audit),
               'groups_with_different_categories': sum(g['categories_differ'] for g in audit),
               'groups_with_different_notes': sum(g['notes_differ'] for g in audit),
               'same_name_families_not_fully_merged': len(unmerged)}
    OUT.mkdir(parents=True, exist_ok=True)
    write('duplicates.json', index)
    write('audit.json', {'schema_version': '1.0', 'dataset_id': catalog['dataset_id'], 'summary': summary,
                       'skipped_missing_keys': skipped, 'unmerged_same_names': unmerged, 'groups': audit})
    inputs = {'scripts/analyze/build_exact_duplicates.py': sha(Path(__file__)),
              'data/processed/catalog/v1/manifest.json': sha(CATALOG / 'manifest.json')}
    write('manifest.json', {'inputs': inputs, 'outputs': {n: sha(OUT / n) for n in ('duplicates.json', 'audit.json')}})
    print(json.dumps(summary, ensure_ascii=True))

if __name__ == '__main__':
    main()
