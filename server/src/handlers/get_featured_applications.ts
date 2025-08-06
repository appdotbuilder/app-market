
import { db } from '../db';
import { applicationsTable } from '../db/schema';
import { type Application } from '../schema';
import { eq, desc } from 'drizzle-orm';

export const getFeaturedApplications = async (): Promise<Application[]> => {
  try {
    const results = await db.select()
      .from(applicationsTable)
      .where(eq(applicationsTable.is_featured, true))
      .orderBy(desc(applicationsTable.download_count))
      .execute();

    // Convert numeric fields back to numbers before returning
    return results.map(app => ({
      ...app,
      price: parseFloat(app.price),
      rating: app.rating ? parseFloat(app.rating) : null
    }));
  } catch (error) {
    console.error('Featured applications fetch failed:', error);
    throw error;
  }
};
