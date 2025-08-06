
import { db } from '../db';
import { reviewsTable, applicationsTable, usersTable } from '../db/schema';
import { type CreateReviewInput, type Review } from '../schema';
import { eq } from 'drizzle-orm';

export const createReview = async (input: CreateReviewInput): Promise<Review> => {
  try {
    // Verify application exists
    const application = await db.select()
      .from(applicationsTable)
      .where(eq(applicationsTable.id, input.application_id))
      .execute();

    if (application.length === 0) {
      throw new Error('Application not found');
    }

    // Verify user exists
    const user = await db.select()
      .from(usersTable)
      .where(eq(usersTable.id, input.user_id))
      .execute();

    if (user.length === 0) {
      throw new Error('User not found');
    }

    // Insert review record
    const result = await db.insert(reviewsTable)
      .values({
        application_id: input.application_id,
        user_id: input.user_id,
        rating: input.rating,
        comment: input.comment || null
      })
      .returning()
      .execute();

    const review = result[0];
    return {
      ...review,
      comment: review.comment
    };
  } catch (error) {
    console.error('Review creation failed:', error);
    throw error;
  }
};
