
import { db } from '../db';
import { applicationsTable } from '../db/schema';
import { type GetApplicationsInput, type Application } from '../schema';
import { eq, ilike, and, desc, SQL } from 'drizzle-orm';

export const getApplications = async (input: GetApplicationsInput): Promise<Application[]> => {
  try {
    // Build conditions array for filtering
    const conditions: SQL<unknown>[] = [];

    // Filter by category
    if (input.category_id !== undefined) {
      conditions.push(eq(applicationsTable.category_id, input.category_id));
    }

    // Filter by featured status
    if (input.is_featured !== undefined) {
      conditions.push(eq(applicationsTable.is_featured, input.is_featured));
    }

    // Filter by free/paid status
    if (input.is_free !== undefined) {
      conditions.push(eq(applicationsTable.is_free, input.is_free));
    }

    // Only show published applications
    conditions.push(eq(applicationsTable.status, 'published'));

    // Text search across name and description
    if (input.search) {
      const searchTerm = `%${input.search}%`;
      conditions.push(
        ilike(applicationsTable.name, searchTerm)
      );
    }

    // Build and execute the query in one go
    const results = await db.select()
      .from(applicationsTable)
      .where(conditions.length === 1 ? conditions[0] : and(...conditions))
      .orderBy(desc(applicationsTable.is_featured), desc(applicationsTable.created_at))
      .limit(input.limit)
      .offset(input.offset)
      .execute();

    // Convert numeric fields back to numbers
    return results.map(app => ({
      ...app,
      price: parseFloat(app.price),
      rating: app.rating ? parseFloat(app.rating) : null
    }));
  } catch (error) {
    console.error('Applications query failed:', error);
    throw error;
  }
};
