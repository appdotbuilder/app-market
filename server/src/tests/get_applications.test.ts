
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { usersTable, categoriesTable, applicationsTable } from '../db/schema';
import { type GetApplicationsInput } from '../schema';
import { getApplications } from '../handlers/get_applications';

// Test input with all defaults
const testInput: GetApplicationsInput = {
  limit: 20,
  offset: 0
};

describe('getApplications', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return empty array when no applications exist', async () => {
    const result = await getApplications(testInput);
    expect(result).toEqual([]);
  });

  it('should return published applications with correct data types', async () => {
    // Create prerequisites
    const [user] = await db.insert(usersTable)
      .values({
        email: 'dev@example.com',
        username: 'developer',
        full_name: 'Test Developer',
        role: 'developer'
      })
      .returning()
      .execute();

    const [category] = await db.insert(categoriesTable)
      .values({
        name: 'Games',
        slug: 'games'
      })
      .returning()
      .execute();

    // Create test application
    await db.insert(applicationsTable)
      .values({
        name: 'Test Game',
        slug: 'test-game',
        description: 'A fun test game',
        developer_id: user.id,
        category_id: category.id,
        price: '29.99',
        status: 'published',
        is_featured: true
      })
      .execute();

    const result = await getApplications(testInput);

    expect(result).toHaveLength(1);
    const app = result[0];
    expect(app.name).toEqual('Test Game');
    expect(app.description).toEqual('A fun test game');
    expect(typeof app.price).toBe('number');
    expect(app.price).toEqual(29.99);
    expect(app.is_featured).toBe(true);
    expect(app.status).toEqual('published');
    expect(app.created_at).toBeInstanceOf(Date);
  });

  it('should filter by category_id', async () => {
    // Create prerequisites
    const [user] = await db.insert(usersTable)
      .values({
        email: 'dev@example.com',
        username: 'developer',
        full_name: 'Test Developer',
        role: 'developer'
      })
      .returning()
      .execute();

    const [category1] = await db.insert(categoriesTable)
      .values({
        name: 'Games',
        slug: 'games'
      })
      .returning()
      .execute();

    const [category2] = await db.insert(categoriesTable)
      .values({
        name: 'Productivity',
        slug: 'productivity'
      })
      .returning()
      .execute();

    // Create apps in different categories
    await db.insert(applicationsTable)
      .values([
        {
          name: 'Game App',
          slug: 'game-app',
          description: 'A game',
          developer_id: user.id,
          category_id: category1.id,
          price: '9.99',
          status: 'published'
        },
        {
          name: 'Productivity App',
          slug: 'productivity-app',
          description: 'A productivity tool',
          developer_id: user.id,
          category_id: category2.id,
          price: '19.99',
          status: 'published'
        }
      ])
      .execute();

    const result = await getApplications({
      ...testInput,
      category_id: category1.id
    });

    expect(result).toHaveLength(1);
    expect(result[0].name).toEqual('Game App');
    expect(result[0].category_id).toEqual(category1.id);
  });

  it('should filter by is_featured', async () => {
    // Create prerequisites
    const [user] = await db.insert(usersTable)
      .values({
        email: 'dev@example.com',
        username: 'developer',
        full_name: 'Test Developer',
        role: 'developer'
      })
      .returning()
      .execute();

    const [category] = await db.insert(categoriesTable)
      .values({
        name: 'Games',
        slug: 'games'
      })
      .returning()
      .execute();

    // Create featured and non-featured apps
    await db.insert(applicationsTable)
      .values([
        {
          name: 'Featured App',
          slug: 'featured-app',
          description: 'A featured app',
          developer_id: user.id,
          category_id: category.id,
          price: '9.99',
          status: 'published',
          is_featured: true
        },
        {
          name: 'Regular App',
          slug: 'regular-app',
          description: 'A regular app',
          developer_id: user.id,
          category_id: category.id,
          price: '9.99',
          status: 'published',
          is_featured: false
        }
      ])
      .execute();

    const result = await getApplications({
      ...testInput,
      is_featured: true
    });

    expect(result).toHaveLength(1);
    expect(result[0].name).toEqual('Featured App');
    expect(result[0].is_featured).toBe(true);
  });

  it('should filter by is_free', async () => {
    // Create prerequisites
    const [user] = await db.insert(usersTable)
      .values({
        email: 'dev@example.com',
        username: 'developer',
        full_name: 'Test Developer',
        role: 'developer'
      })
      .returning()
      .execute();

    const [category] = await db.insert(categoriesTable)
      .values({
        name: 'Games',
        slug: 'games'
      })
      .returning()
      .execute();

    // Create free and paid apps
    await db.insert(applicationsTable)
      .values([
        {
          name: 'Free App',
          slug: 'free-app',
          description: 'A free app',
          developer_id: user.id,
          category_id: category.id,
          price: '0.00',
          status: 'published',
          is_free: true
        },
        {
          name: 'Paid App',
          slug: 'paid-app',
          description: 'A paid app',
          developer_id: user.id,
          category_id: category.id,
          price: '9.99',
          status: 'published',
          is_free: false
        }
      ])
      .execute();

    const result = await getApplications({
      ...testInput,
      is_free: true
    });

    expect(result).toHaveLength(1);
    expect(result[0].name).toEqual('Free App');
    expect(result[0].is_free).toBe(true);
  });

  it('should search by application name', async () => {
    // Create prerequisites
    const [user] = await db.insert(usersTable)
      .values({
        email: 'dev@example.com',
        username: 'developer',
        full_name: 'Test Developer',
        role: 'developer'
      })
      .returning()
      .execute();

    const [category] = await db.insert(categoriesTable)
      .values({
        name: 'Games',
        slug: 'games'
      })
      .returning()
      .execute();

    // Create apps with different names
    await db.insert(applicationsTable)
      .values([
        {
          name: 'Super Game',
          slug: 'super-game',
          description: 'A super game',
          developer_id: user.id,
          category_id: category.id,
          price: '9.99',
          status: 'published'
        },
        {
          name: 'Awesome Tool',
          slug: 'awesome-tool',
          description: 'An awesome productivity tool',
          developer_id: user.id,
          category_id: category.id,
          price: '19.99',
          status: 'published'
        }
      ])
      .execute();

    const result = await getApplications({
      ...testInput,
      search: 'game'
    });

    expect(result).toHaveLength(1);
    expect(result[0].name).toEqual('Super Game');
  });

  it('should apply pagination correctly', async () => {
    // Create prerequisites
    const [user] = await db.insert(usersTable)
      .values({
        email: 'dev@example.com',
        username: 'developer',
        full_name: 'Test Developer',
        role: 'developer'
      })
      .returning()
      .execute();

    const [category] = await db.insert(categoriesTable)
      .values({
        name: 'Games',
        slug: 'games'
      })
      .returning()
      .execute();

    // Create multiple apps
    const apps = Array.from({ length: 5 }, (_, i) => ({
      name: `App ${i + 1}`,
      slug: `app-${i + 1}`,
      description: `Description for app ${i + 1}`,
      developer_id: user.id,
      category_id: category.id,
      price: '9.99',
      status: 'published' as const
    }));

    await db.insert(applicationsTable).values(apps).execute();

    // Test limit
    const limitedResult = await getApplications({
      limit: 2,
      offset: 0
    });

    expect(limitedResult).toHaveLength(2);

    // Test offset
    const offsetResult = await getApplications({
      limit: 2,
      offset: 2
    });

    expect(offsetResult).toHaveLength(2);
    expect(offsetResult[0].name).not.toEqual(limitedResult[0].name);
  });

  it('should only return published applications', async () => {
    // Create prerequisites
    const [user] = await db.insert(usersTable)
      .values({
        email: 'dev@example.com',
        username: 'developer',
        full_name: 'Test Developer',
        role: 'developer'
      })
      .returning()
      .execute();

    const [category] = await db.insert(categoriesTable)
      .values({
        name: 'Games',
        slug: 'games'
      })
      .returning()
      .execute();

    // Create apps with different statuses
    await db.insert(applicationsTable)
      .values([
        {
          name: 'Published App',
          slug: 'published-app',
          description: 'A published app',
          developer_id: user.id,
          category_id: category.id,
          price: '9.99',
          status: 'published'
        },
        {
          name: 'Draft App',
          slug: 'draft-app',
          description: 'A draft app',
          developer_id: user.id,
          category_id: category.id,
          price: '9.99',
          status: 'draft'
        },
        {
          name: 'Suspended App',
          slug: 'suspended-app',
          description: 'A suspended app',
          developer_id: user.id,
          category_id: category.id,
          price: '9.99',
          status: 'suspended'
        }
      ])
      .execute();

    const result = await getApplications(testInput);

    expect(result).toHaveLength(1);
    expect(result[0].name).toEqual('Published App');
    expect(result[0].status).toEqual('published');
  });
});
