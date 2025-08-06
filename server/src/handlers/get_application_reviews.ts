
import { db } from '../db';
import { reviewsTable, usersTable } from '../db/schema';
import { eq, desc } from 'drizzle-orm';
import { type Review } from '../schema';

export const getApplicationReviews = async (applicationId: number): Promise<Review[]> => {
  try {
    const results = await db.select()
      .from(reviewsTable)
      .where(eq(reviewsTable.application_id, applicationId))
      .orderBy(desc(reviewsTable.created_at))
      .execute();

    return results.map(review => ({
      id: review.id,
      application_id: review.application_id,
      user_id: review.user_id,
      rating: review.rating,
      comment: review.comment,
      created_at: review.created_at,
      updated_at: review.updated_at
    }));
  } catch (error) {
    console.error('Failed to get application reviews:', error);
    throw error;
  }
};
