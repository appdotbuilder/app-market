
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { usersTable, categoriesTable, applicationsTable, reviewsTable } from '../db/schema';
import { getApplicationReviews } from '../handlers/get_application_reviews';
import { eq } from 'drizzle-orm';

describe('getApplicationReviews', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return reviews for the specified application', async () => {
    // Create test user
    const userResult = await db.insert(usersTable)
      .values({
        email: 'testuser@example.com',
        username: 'testuser',
        full_name: 'Test User',
        role: 'user'
      })
      .returning()
      .execute();
    const userId = userResult[0].id;

    // Create test developer
    const developerResult = await db.insert(usersTable)
      .values({
        email: 'developer@example.com',
        username: 'developer',
        full_name: 'Test Developer',
        role: 'developer'
      })
      .returning()
      .execute();
    const developerId = developerResult[0].id;

    // Create test category
    const categoryResult = await db.insert(categoriesTable)
      .values({
        name: 'Test Category',
        slug: 'test-category'
      })
      .returning()
      .execute();
    const categoryId = categoryResult[0].id;

    // Create test application
    const appResult = await db.insert(applicationsTable)
      .values({
        name: 'Test App',
        slug: 'test-app',
        description: 'A test application for review testing',
        developer_id: developerId,
        category_id: categoryId,
        price: '19.99',
        is_free: false
      })
      .returning()
      .execute();
    const applicationId = appResult[0].id;

    // Create test reviews
    await db.insert(reviewsTable)
      .values([
        {
          application_id: applicationId,
          user_id: userId,
          rating: 5,
          comment: 'Excellent app!'
        },
        {
          application_id: applicationId,
          user_id: userId,
          rating: 4,
          comment: 'Good but could be better'
        }
      ])
      .execute();

    const reviews = await getApplicationReviews(applicationId);

    expect(reviews).toHaveLength(2);
    expect(reviews[0].application_id).toBe(applicationId);
    expect(reviews[0].user_id).toBe(userId);
    expect(reviews[0].rating).toBe(5);
    expect(reviews[0].comment).toBe('Excellent app!');
    expect(reviews[0].created_at).toBeInstanceOf(Date);
    expect(reviews[0].updated_at).toBeInstanceOf(Date);
  });

  it('should return reviews ordered by created_at descending', async () => {
    // Create test user
    const userResult = await db.insert(usersTable)
      .values({
        email: 'testuser@example.com',
        username: 'testuser',
        full_name: 'Test User',
        role: 'user'
      })
      .returning()
      .execute();
    const userId = userResult[0].id;

    // Create test developer
    const developerResult = await db.insert(usersTable)
      .values({
        email: 'developer@example.com',
        username: 'developer',
        full_name: 'Test Developer',
        role: 'developer'
      })
      .returning()
      .execute();
    const developerId = developerResult[0].id;

    // Create test category
    const categoryResult = await db.insert(categoriesTable)
      .values({
        name: 'Test Category',
        slug: 'test-category'
      })
      .returning()
      .execute();
    const categoryId = categoryResult[0].id;

    // Create test application
    const appResult = await db.insert(applicationsTable)
      .values({
        name: 'Test App',
        slug: 'test-app',
        description: 'A test application for review testing',
        developer_id: developerId,
        category_id: categoryId,
        price: '19.99',
        is_free: false
      })
      .returning()
      .execute();
    const applicationId = appResult[0].id;

    // Create reviews with different timestamps
    const firstReview = await db.insert(reviewsTable)
      .values({
        application_id: applicationId,
        user_id: userId,
        rating: 3,
        comment: 'First review'
      })
      .returning()
      .execute();

    // Wait a moment to ensure different timestamps
    await new Promise(resolve => setTimeout(resolve, 10));

    await db.insert(reviewsTable)
      .values({
        application_id: applicationId,
        user_id: userId,
        rating: 5,
        comment: 'Second review'
      })
      .execute();

    const reviews = await getApplicationReviews(applicationId);

    expect(reviews).toHaveLength(2);
    // More recent review should come first (descending order)
    expect(reviews[0].comment).toBe('Second review');
    expect(reviews[1].comment).toBe('First review');
    expect(reviews[0].created_at >= reviews[1].created_at).toBe(true);
  });

  it('should return empty array when application has no reviews', async () => {
    // Create test developer
    const developerResult = await db.insert(usersTable)
      .values({
        email: 'developer@example.com',
        username: 'developer',
        full_name: 'Test Developer',
        role: 'developer'
      })
      .returning()
      .execute();
    const developerId = developerResult[0].id;

    // Create test category
    const categoryResult = await db.insert(categoriesTable)
      .values({
        name: 'Test Category',
        slug: 'test-category'
      })
      .returning()
      .execute();
    const categoryId = categoryResult[0].id;

    // Create test application without reviews
    const appResult = await db.insert(applicationsTable)
      .values({
        name: 'Test App',
        slug: 'test-app',
        description: 'A test application with no reviews',
        developer_id: developerId,
        category_id: categoryId,
        price: '19.99',
        is_free: false
      })
      .returning()
      .execute();
    const applicationId = appResult[0].id;

    const reviews = await getApplicationReviews(applicationId);

    expect(reviews).toHaveLength(0);
    expect(reviews).toEqual([]);
  });

  it('should only return reviews for the specified application', async () => {
    // Create test user
    const userResult = await db.insert(usersTable)
      .values({
        email: 'testuser@example.com',
        username: 'testuser',
        full_name: 'Test User',
        role: 'user'
      })
      .returning()
      .execute();
    const userId = userResult[0].id;

    // Create test developer
    const developerResult = await db.insert(usersTable)
      .values({
        email: 'developer@example.com',
        username: 'developer',
        full_name: 'Test Developer',
        role: 'developer'
      })
      .returning()
      .execute();
    const developerId = developerResult[0].id;

    // Create test category
    const categoryResult = await db.insert(categoriesTable)
      .values({
        name: 'Test Category',
        slug: 'test-category'
      })
      .returning()
      .execute();
    const categoryId = categoryResult[0].id;

    // Create two test applications
    const app1Result = await db.insert(applicationsTable)
      .values({
        name: 'Test App 1',
        slug: 'test-app-1',
        description: 'First test application',
        developer_id: developerId,
        category_id: categoryId,
        price: '19.99',
        is_free: false
      })
      .returning()
      .execute();
    const app1Id = app1Result[0].id;

    const app2Result = await db.insert(applicationsTable)
      .values({
        name: 'Test App 2',
        slug: 'test-app-2',
        description: 'Second test application',
        developer_id: developerId,
        category_id: categoryId,
        price: '29.99',
        is_free: false
      })
      .returning()
      .execute();
    const app2Id = app2Result[0].id;

    // Create reviews for both applications
    await db.insert(reviewsTable)
      .values([
        {
          application_id: app1Id,
          user_id: userId,
          rating: 5,
          comment: 'Review for app 1'
        },
        {
          application_id: app2Id,
          user_id: userId,
          rating: 3,
          comment: 'Review for app 2'
        }
      ])
      .execute();

    const app1Reviews = await getApplicationReviews(app1Id);

    expect(app1Reviews).toHaveLength(1);
    expect(app1Reviews[0].application_id).toBe(app1Id);
    expect(app1Reviews[0].comment).toBe('Review for app 1');
  });
});
