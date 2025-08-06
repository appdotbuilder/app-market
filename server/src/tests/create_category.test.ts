
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { categoriesTable } from '../db/schema';
import { type CreateCategoryInput } from '../schema';
import { createCategory } from '../handlers/create_category';
import { eq } from 'drizzle-orm';

// Simple test input
const testInput: CreateCategoryInput = {
  name: 'Test Category',
  slug: 'test-category',
  description: 'A category for testing',
  icon_url: 'https://example.com/icon.png'
};

describe('createCategory', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should create a category', async () => {
    const result = await createCategory(testInput);

    // Basic field validation
    expect(result.name).toEqual('Test Category');
    expect(result.slug).toEqual('test-category');
    expect(result.description).toEqual('A category for testing');
    expect(result.icon_url).toEqual('https://example.com/icon.png');
    expect(result.id).toBeDefined();
    expect(result.created_at).toBeInstanceOf(Date);
  });

  it('should save category to database', async () => {
    const result = await createCategory(testInput);

    // Query using proper drizzle syntax
    const categories = await db.select()
      .from(categoriesTable)
      .where(eq(categoriesTable.id, result.id))
      .execute();

    expect(categories).toHaveLength(1);
    expect(categories[0].name).toEqual('Test Category');
    expect(categories[0].slug).toEqual('test-category');
    expect(categories[0].description).toEqual('A category for testing');
    expect(categories[0].icon_url).toEqual('https://example.com/icon.png');
    expect(categories[0].created_at).toBeInstanceOf(Date);
  });

  it('should handle optional fields', async () => {
    const inputWithoutOptionals: CreateCategoryInput = {
      name: 'Minimal Category',
      slug: 'minimal-category'
    };

    const result = await createCategory(inputWithoutOptionals);

    expect(result.name).toEqual('Minimal Category');
    expect(result.slug).toEqual('minimal-category');
    expect(result.description).toBeNull();
    expect(result.icon_url).toBeNull();
    expect(result.id).toBeDefined();
    expect(result.created_at).toBeInstanceOf(Date);
  });

  it('should enforce unique slug constraint', async () => {
    // Create first category
    await createCategory(testInput);

    // Try to create second category with same slug
    const duplicateInput: CreateCategoryInput = {
      name: 'Different Name',
      slug: 'test-category', // Same slug
      description: 'Different description'
    };

    expect(createCategory(duplicateInput)).rejects.toThrow(/unique/i);
  });
});
