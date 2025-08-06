
import { db } from '../db';
import { applicationsTable } from '../db/schema';
import { type GetApplicationInput, type Application } from '../schema';
import { eq, or } from 'drizzle-orm';

export const getApplication = async (input: GetApplicationInput): Promise<Application | null> => {
  try {
    // Build conditions based on input
    const conditions = [];
    
    if (input.id) {
      conditions.push(eq(applicationsTable.id, input.id));
    }
    
    if (input.slug) {
      conditions.push(eq(applicationsTable.slug, input.slug));
    }

    // Execute query with OR condition if both ID and slug are provided
    const result = await db.select()
      .from(applicationsTable)
      .where(conditions.length === 1 ? conditions[0] : or(...conditions))
      .limit(1)
      .execute();

    if (result.length === 0) {
      return null;
    }

    const application = result[0];

    // Convert numeric fields back to numbers
    return {
      ...application,
      price: parseFloat(application.price),
      rating: application.rating ? parseFloat(application.rating) : null
    };
  } catch (error) {
    console.error('Application fetch failed:', error);
    throw error;
  }
};
