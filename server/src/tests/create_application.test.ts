
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { applicationsTable, usersTable, categoriesTable } from '../db/schema';
import { type CreateApplicationInput } from '../schema';
import { createApplication } from '../handlers/create_application';
import { eq } from 'drizzle-orm';

describe('createApplication', () => {
  let testUserId: number;
  let testCategoryId: number;

  beforeEach(async () => {
    await createDB();

    // Create prerequisite user (developer)
    const userResult = await db.insert(usersTable)
      .values({
        email: 'dev@example.com',
        username: 'testdev',
        full_name: 'Test Developer',
        role: 'developer'
      })
      .returning()
      .execute();
    testUserId = userResult[0].id;

    // Create prerequisite category
    const categoryResult = await db.insert(categoriesTable)
      .values({
        name: 'Test Category',
        slug: 'test-category'
      })
      .returning()
      .execute();
    testCategoryId = categoryResult[0].id;
  });

  afterEach(resetDB);

  const testInput: CreateApplicationInput = {
    name: 'Test App',
    slug: 'test-app',
    description: 'A comprehensive test application with detailed features',
    short_description: 'Test app for testing',
    developer_id: 0, // Will be set to testUserId in tests
    category_id: 0, // Will be set to testCategoryId in tests
    price: 9.99,
    is_free: false,
    app_icon_url: 'https://example.com/icon.png'
  };

  it('should create an application', async () => {
    const input = { ...testInput, developer_id: testUserId, category_id: testCategoryId };
    const result = await createApplication(input);

    // Basic field validation
    expect(result.name).toEqual('Test App');
    expect(result.slug).toEqual('test-app');
    expect(result.description).toEqual(input.description);
    expect(result.short_description).toEqual('Test app for testing');
    expect(result.developer_id).toEqual(testUserId);
    expect(result.category_id).toEqual(testCategoryId);
    expect(result.price).toEqual(9.99);
    expect(typeof result.price).toBe('number');
    expect(result.is_free).toBe(false);
    expect(result.app_icon_url).toEqual('https://example.com/icon.png');

    // Default values
    expect(result.is_featured).toBe(false);
    expect(result.rating).toBeNull();
    expect(result.download_count).toEqual(0);
    expect(result.status).toEqual('draft');

    // Auto-generated fields
    expect(result.id).toBeDefined();
    expect(result.created_at).toBeInstanceOf(Date);
    expect(result.updated_at).toBeInstanceOf(Date);
  });

  it('should save application to database', async () => {
    const input = { ...testInput, developer_id: testUserId, category_id: testCategoryId };
    const result = await createApplication(input);

    const applications = await db.select()
      .from(applicationsTable)
      .where(eq(applicationsTable.id, result.id))
      .execute();

    expect(applications).toHaveLength(1);
    const app = applications[0];
    expect(app.name).toEqual('Test App');
    expect(app.slug).toEqual('test-app');
    expect(app.description).toEqual(input.description);
    expect(parseFloat(app.price)).toEqual(9.99);
    expect(app.is_free).toBe(false);
    expect(app.is_featured).toBe(false);
    expect(app.download_count).toEqual(0);
    expect(app.status).toEqual('draft');
    expect(app.created_at).toBeInstanceOf(Date);
    expect(app.updated_at).toBeInstanceOf(Date);
  });

  it('should create free application', async () => {
    const freeInput = {
      ...testInput,
      developer_id: testUserId,
      category_id: testCategoryId,
      price: 0,
      is_free: true
    };

    const result = await createApplication(freeInput);

    expect(result.price).toEqual(0);
    expect(typeof result.price).toBe('number');
    expect(result.is_free).toBe(true);
  });

  it('should handle optional fields', async () => {
    const minimalInput: CreateApplicationInput = {
      name: 'Minimal App',
      slug: 'minimal-app',
      description: 'A minimal application with only required fields provided',
      developer_id: testUserId,
      category_id: testCategoryId,
      price: 5.99,
      is_free: false
      // short_description and app_icon_url are optional
    };

    const result = await createApplication(minimalInput);

    expect(result.short_description).toBeNull();
    expect(result.app_icon_url).toBeNull();
    expect(result.name).toEqual('Minimal App');
    expect(result.price).toEqual(5.99);
  });

  it('should handle slug uniqueness constraint', async () => {
    const input1 = { ...testInput, developer_id: testUserId, category_id: testCategoryId };
    await createApplication(input1);

    const input2 = {
      ...testInput,
      name: 'Another App',
      slug: 'test-app', // Same slug as first app
      developer_id: testUserId,
      category_id: testCategoryId
    };

    await expect(createApplication(input2)).rejects.toThrow(/unique/i);
  });
});
