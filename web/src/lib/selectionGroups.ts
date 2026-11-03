import { AXES, type CatalogRecord, type Selection, type Taxonomy } from '../types.js';

// With a record, include only selected broad categories this record actually has.
export function selectionGroups(selected: Selection, taxonomy: Taxonomy, record?: CatalogRecord) {
  return AXES.flatMap(axis => {
    const categories = taxonomy.dimensions[axis].categories.filter(category =>
      selected[axis].includes(category.id) && (!record || record.categories[axis].includes(category.id)));
    return categories.length ? [{ axis, categories }] : [];
  });
}
