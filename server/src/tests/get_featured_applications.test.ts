
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { usersTable, categoriesTable, applicationsTable } from '../db/schema';
import { getFeaturedApplications } from '../handlers/get_featured_applications';

describe('getFeaturedApplications', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return only featured applications', async () => {
    // Create test user
    const userResult = await db.insert(usersTable)
      .values({
        email: 'dev@example.com',
        username: 'developer',
        full_name: 'Test Developer',
        role: 'developer'
      })
      .returning()
      .execute();

    // Create test category
    const categoryResult = await db.insert(categoriesTable)
      .values({
        name: 'Games',
        slug: 'games',
        description: 'Gaming applications'
      })
      .returning()
      .execute();

    // Create featured application
    await db.insert(applicationsTable)
      .values({
        name: 'Featured Game',
        slug: 'featured-game',
        description: 'An amazing featured game',
        developer_id: userResult[0].id,
        category_id: categoryResult[0].id,
        price: '19.99',
        is_featured: true,
        download_count: 5000,
        status: 'published'
      })
      .execute();

    // Create non-featured application
    await db.insert(applicationsTable)
      .values({
        name: 'Regular Game',
        slug: 'regular-game',
        description: 'A regular game',
        developer_id: userResult[0].id,
        category_id: categoryResult[0].id,
        price: '9.99',
        is_featured: false,
        download_count: 1000,
        status: 'published'
      })
      .execute();

    const result = await getFeaturedApplications();

    expect(result).toHaveLength(1);
    expect(result[0].name).toEqual('Featured Game');
    expect(result[0].is_featured).toBe(true);
    expect(result[0].price).toEqual(19.99);
    expect(typeof result[0].price).toBe('number');
  });

  it('should order featured applications by download count descending', async () => {
    // Create test user and category
    const userResult = await db.insert(usersTable)
      .values({
        email: 'dev@example.com',
        username: 'developer',
        full_name: 'Test Developer',
        role: 'developer'
      })
      .returning()
      .execute();

    const categoryResult = await db.insert(categoriesTable)
      .values({
        name: 'Games',
        slug: 'games'
      })
      .returning()
      .execute();

    // Create multiple featured apps with different download counts
    await db.insert(applicationsTable)
      .values([
        {
          name: 'Popular App',
          slug: 'popular-app',
          description: 'Very popular app',
          developer_id: userResult[0].id,
          category_id: categoryResult[0].id,
          price: '0.00',
          is_featured: true,
          download_count: 10000,
          status: 'published'
        },
        {
          name: 'Less Popular App',
          slug: 'less-popular-app',
          description: 'Less popular app',
          developer_id: userResult[0].id,
          category_id: categoryResult[0].id,
          price: '5.99',
          is_featured: true,
          download_count: 2000,
          status: 'published'
        }
      ])
      .execute();

    const result = await getFeaturedApplications();

    expect(result).toHaveLength(2);
    expect(result[0].name).toEqual('Popular App');
    expect(result[0].download_count).toEqual(10000);
    expect(result[1].name).toEqual('Less Popular App');
    expect(result[1].download_count).toEqual(2000);
  });

  it('should return empty array when no featured applications exist', async () => {
    const result = await getFeaturedApplications();
    expect(result).toHaveLength(0);
  });

  it('should handle numeric conversions correctly', async () => {
    // Create prerequisites
    const userResult = await db.insert(usersTable)
      .values({
        email: 'dev@example.com',
        username: 'developer',
        full_name: 'Test Developer',
        role: 'developer'
      })
      .returning()
      .execute();

    const categoryResult = await db.insert(categoriesTable)
      .values({
        name: 'Games',
        slug: 'games'
      })
      .returning()
      .execute();

    // Create featured app with rating
    await db.insert(applicationsTable)
      .values({
        name: 'Rated App',
        slug: 'rated-app',
        description: 'App with rating',
        developer_id: userResult[0].id,
        category_id: categoryResult[0].id,
        price: '15.50',
        rating: '4.75',
        is_featured: true,
        download_count: 3000,
        status: 'published'
      })
      .execute();

    const result = await getFeaturedApplications();

    expect(result).toHaveLength(1);
    expect(typeof result[0].price).toBe('number');
    expect(result[0].price).toEqual(15.50);
    expect(typeof result[0].rating).toBe('number');
    expect(result[0].rating).toEqual(4.75);
  });
});
