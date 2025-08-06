
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { categoriesTable } from '../db/schema';
import { type CreateCategoryInput } from '../schema';
import { getCategories } from '../handlers/get_categories';

const testCategory1: CreateCategoryInput = {
  name: 'Productivity',
  slug: 'productivity',
  description: 'Apps to boost your productivity',
  icon_url: 'https://example.com/productivity-icon.png'
};

const testCategory2: CreateCategoryInput = {
  name: 'Entertainment',
  slug: 'entertainment',
  description: 'Games and entertainment apps',
  icon_url: null
};

describe('getCategories', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return empty array when no categories exist', async () => {
    const result = await getCategories();
    
    expect(result).toEqual([]);
  });

  it('should fetch all categories from database', async () => {
    // Create test categories
    await db.insert(categoriesTable)
      .values([testCategory1, testCategory2])
      .execute();

    const result = await getCategories();

    expect(result).toHaveLength(2);
    
    // Find categories by name to avoid order dependency
    const productivityCategory = result.find(cat => cat.name === 'Productivity');
    const entertainmentCategory = result.find(cat => cat.name === 'Entertainment');

    // Verify productivity category
    expect(productivityCategory).toBeDefined();
    expect(productivityCategory?.slug).toEqual('productivity');
    expect(productivityCategory?.description).toEqual('Apps to boost your productivity');
    expect(productivityCategory?.icon_url).toEqual('https://example.com/productivity-icon.png');
    expect(productivityCategory?.id).toBeDefined();
    expect(productivityCategory?.created_at).toBeInstanceOf(Date);

    // Verify entertainment category
    expect(entertainmentCategory).toBeDefined();
    expect(entertainmentCategory?.slug).toEqual('entertainment');
    expect(entertainmentCategory?.description).toEqual('Games and entertainment apps');
    expect(entertainmentCategory?.icon_url).toBeNull();
    expect(entertainmentCategory?.id).toBeDefined();
    expect(entertainmentCategory?.created_at).toBeInstanceOf(Date);
  });

  it('should return categories with all required fields', async () => {
    await db.insert(categoriesTable)
      .values(testCategory1)
      .execute();

    const result = await getCategories();

    expect(result).toHaveLength(1);
    const category = result[0];

    // Verify all required fields are present
    expect(typeof category.id).toBe('number');
    expect(typeof category.name).toBe('string');
    expect(typeof category.slug).toBe('string');
    expect(category.description === null || typeof category.description === 'string').toBe(true);
    expect(category.icon_url === null || typeof category.icon_url === 'string').toBe(true);
    expect(category.created_at).toBeInstanceOf(Date);
  });
});
