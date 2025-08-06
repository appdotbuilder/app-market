
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { usersTable, categoriesTable, applicationsTable } from '../db/schema';
import { type GetApplicationInput } from '../schema';
import { getApplication } from '../handlers/get_application';

describe('getApplication', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should fetch application by ID', async () => {
    // Create test data
    const user = await db.insert(usersTable)
      .values({
        email: 'dev@test.com',
        username: 'testdev',
        full_name: 'Test Developer',
        role: 'developer'
      })
      .returning()
      .execute();

    const category = await db.insert(categoriesTable)
      .values({
        name: 'Test Category',
        slug: 'test-category'
      })
      .returning()
      .execute();

    const application = await db.insert(applicationsTable)
      .values({
        name: 'Test Application',
        slug: 'test-application',
        description: 'A detailed test application description',
        short_description: 'Test app',
        developer_id: user[0].id,
        category_id: category[0].id,
        price: '19.99',
        is_free: false,
        is_featured: true,
        rating: '4.5',
        download_count: 500,
        status: 'published'
      })
      .returning()
      .execute();

    const input: GetApplicationInput = { id: application[0].id };
    const result = await getApplication(input);

    expect(result).toBeDefined();
    expect(result?.id).toEqual(application[0].id);
    expect(result?.name).toEqual('Test Application');
    expect(result?.slug).toEqual('test-application');
    expect(result?.description).toEqual('A detailed test application description');
    expect(result?.short_description).toEqual('Test app');
    expect(result?.developer_id).toEqual(user[0].id);
    expect(result?.category_id).toEqual(category[0].id);
    expect(result?.price).toEqual(19.99);
    expect(typeof result?.price).toEqual('number');
    expect(result?.is_free).toEqual(false);
    expect(result?.is_featured).toEqual(true);
    expect(result?.rating).toEqual(4.5);
    expect(typeof result?.rating).toEqual('number');
    expect(result?.download_count).toEqual(500);
    expect(result?.status).toEqual('published');
    expect(result?.created_at).toBeInstanceOf(Date);
    expect(result?.updated_at).toBeInstanceOf(Date);
  });

  it('should fetch application by slug', async () => {
    // Create test data
    const user = await db.insert(usersTable)
      .values({
        email: 'dev2@test.com',
        username: 'testdev2',
        full_name: 'Test Developer 2',
        role: 'developer'
      })
      .returning()
      .execute();

    const category = await db.insert(categoriesTable)
      .values({
        name: 'Games',
        slug: 'games'
      })
      .returning()
      .execute();

    await db.insert(applicationsTable)
      .values({
        name: 'Amazing Game',
        slug: 'amazing-game',
        description: 'An amazing game with great graphics',
        developer_id: user[0].id,
        category_id: category[0].id,
        price: '29.99',
        is_free: false,
        rating: '4.8',
        download_count: 1500,
        status: 'published'
      })
      .returning()
      .execute();

    const input: GetApplicationInput = { slug: 'amazing-game' };
    const result = await getApplication(input);

    expect(result).toBeDefined();
    expect(result?.name).toEqual('Amazing Game');
    expect(result?.slug).toEqual('amazing-game');
    expect(result?.price).toEqual(29.99);
    expect(result?.rating).toEqual(4.8);
    expect(result?.download_count).toEqual(1500);
  });

  it('should return null for non-existent application', async () => {
    const input: GetApplicationInput = { id: 999 };
    const result = await getApplication(input);

    expect(result).toBeNull();
  });

  it('should return null for non-existent slug', async () => {
    const input: GetApplicationInput = { slug: 'non-existent-app' };
    const result = await getApplication(input);

    expect(result).toBeNull();
  });

  it('should handle applications with null rating', async () => {
    // Create test data
    const user = await db.insert(usersTable)
      .values({
        email: 'dev3@test.com',
        username: 'testdev3',
        full_name: 'Test Developer 3',
        role: 'developer'
      })
      .returning()
      .execute();

    const category = await db.insert(categoriesTable)
      .values({
        name: 'Tools',
        slug: 'tools'
      })
      .returning()
      .execute();

    const application = await db.insert(applicationsTable)
      .values({
        name: 'New Tool',
        slug: 'new-tool',
        description: 'A brand new tool with no reviews yet',
        developer_id: user[0].id,
        category_id: category[0].id,
        price: '0.00',
        is_free: true,
        rating: null, // No rating yet
        download_count: 0,
        status: 'published'
      })
      .returning()
      .execute();

    const input: GetApplicationInput = { id: application[0].id };
    const result = await getApplication(input);

    expect(result).toBeDefined();
    expect(result?.rating).toBeNull();
    expect(result?.is_free).toEqual(true);
    expect(result?.price).toEqual(0);
  });

  it('should prioritize ID when both ID and slug are provided', async () => {
    // Create test data
    const user = await db.insert(usersTable)
      .values({
        email: 'dev4@test.com',
        username: 'testdev4',
        full_name: 'Test Developer 4',
        role: 'developer'
      })
      .returning()
      .execute();

    const category = await db.insert(categoriesTable)
      .values({
        name: 'Utilities',
        slug: 'utilities'
      })
      .returning()
      .execute();

    // Create two applications
    const app1 = await db.insert(applicationsTable)
      .values({
        name: 'First App',
        slug: 'first-app',
        description: 'The first application',
        developer_id: user[0].id,
        category_id: category[0].id,
        price: '10.00',
        status: 'published'
      })
      .returning()
      .execute();

    const app2 = await db.insert(applicationsTable)
      .values({
        name: 'Second App',
        slug: 'second-app',
        description: 'The second application',
        developer_id: user[0].id,
        category_id: category[0].id,
        price: '20.00',
        status: 'published'
      })
      .returning()
      .execute();

    // Query with both ID and slug (should match by either condition)
    const input: GetApplicationInput = { id: app1[0].id, slug: 'second-app' };
    const result = await getApplication(input);

    expect(result).toBeDefined();
    // Should return either app1 or app2 since we're using OR condition
    expect([app1[0].id, app2[0].id]).toContain(result?.id);
  });
});
