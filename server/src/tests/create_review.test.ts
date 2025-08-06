
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { reviewsTable, usersTable, applicationsTable, categoriesTable } from '../db/schema';
import { type CreateReviewInput } from '../schema';
import { createReview } from '../handlers/create_review';
import { eq } from 'drizzle-orm';

describe('createReview', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  let testUserId: number;
  let testApplicationId: number;

  beforeEach(async () => {
    // Create prerequisite user
    const userResult = await db.insert(usersTable)
      .values({
        email: 'testuser@example.com',
        username: 'testuser',
        full_name: 'Test User',
        role: 'user'
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

    // Create prerequisite application
    const applicationResult = await db.insert(applicationsTable)
      .values({
        name: 'Test App',
        slug: 'test-app',
        description: 'A test application for review testing',
        developer_id: testUserId,
        category_id: categoryResult[0].id,
        price: '9.99'
      })
      .returning()
      .execute();
    testApplicationId = applicationResult[0].id;
  });

  const testInput: CreateReviewInput = {
    application_id: 0, // Will be set in tests
    user_id: 0, // Will be set in tests
    rating: 5,
    comment: 'Great app! Very useful and well designed.'
  };

  it('should create a review with comment', async () => {
    const input = {
      ...testInput,
      application_id: testApplicationId,
      user_id: testUserId
    };

    const result = await createReview(input);

    expect(result.application_id).toEqual(testApplicationId);
    expect(result.user_id).toEqual(testUserId);
    expect(result.rating).toEqual(5);
    expect(result.comment).toEqual('Great app! Very useful and well designed.');
    expect(result.id).toBeDefined();
    expect(result.created_at).toBeInstanceOf(Date);
    expect(result.updated_at).toBeInstanceOf(Date);
  });

  it('should create a review without comment', async () => {
    const input = {
      application_id: testApplicationId,
      user_id: testUserId,
      rating: 4
    };

    const result = await createReview(input);

    expect(result.application_id).toEqual(testApplicationId);
    expect(result.user_id).toEqual(testUserId);
    expect(result.rating).toEqual(4);
    expect(result.comment).toBeNull();
    expect(result.id).toBeDefined();
  });

  it('should save review to database', async () => {
    const input = {
      ...testInput,
      application_id: testApplicationId,
      user_id: testUserId
    };

    const result = await createReview(input);

    const reviews = await db.select()
      .from(reviewsTable)
      .where(eq(reviewsTable.id, result.id))
      .execute();

    expect(reviews).toHaveLength(1);
    expect(reviews[0].application_id).toEqual(testApplicationId);
    expect(reviews[0].user_id).toEqual(testUserId);
    expect(reviews[0].rating).toEqual(5);
    expect(reviews[0].comment).toEqual('Great app! Very useful and well designed.');
    expect(reviews[0].created_at).toBeInstanceOf(Date);
  });

  it('should throw error when application does not exist', async () => {
    const input = {
      ...testInput,
      application_id: 999999, // Non-existent application ID
      user_id: testUserId
    };

    await expect(createReview(input)).rejects.toThrow(/application not found/i);
  });

  it('should throw error when user does not exist', async () => {
    const input = {
      ...testInput,
      application_id: testApplicationId,
      user_id: 999999 // Non-existent user ID
    };

    await expect(createReview(input)).rejects.toThrow(/user not found/i);
  });
});
