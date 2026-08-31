import { describe, it, expect } from 'vitest';
import { CATEGORY_ICONS_LIST, getCategoryIconDefinition, renderCategoryIcon } from '../src/utils/categoryIcons';
import { initialCategories } from '../src/data/initialMenu';

describe('Category Icons Suite', () => {
  it('should have a rich collection of at least 25 food and drink icons', () => {
    expect(CATEGORY_ICONS_LIST.length).toBeGreaterThanOrEqual(25);
  });

  it('should cover all initialCategories icons', () => {
    initialCategories.forEach((cat) => {
      const def = getCategoryIconDefinition(cat.icon);
      expect(def).toBeDefined();
      expect(def.id.toLowerCase()).toBe(cat.icon.toLowerCase());
      expect(def.icon).toBeDefined();
    });
  });

  it('should gracefully fall back for unknown or empty icon names', () => {
    const emptyDef = getCategoryIconDefinition('');
    expect(emptyDef).toBeDefined();
    expect(emptyDef.icon).toBeDefined();

    const unknownDef = getCategoryIconDefinition('nonexistent_icon_12345');
    expect(unknownDef).toBeDefined();
    expect(unknownDef.icon).toBeDefined();
  });

  it('should render React elements without error for all registered icons', () => {
    CATEGORY_ICONS_LIST.forEach((item) => {
      const rendered = renderCategoryIcon(item.id, 'w-5 h-5');
      expect(rendered).toBeDefined();
      expect(rendered.props.className).toContain('w-5 h-5');
    });
  });
});
