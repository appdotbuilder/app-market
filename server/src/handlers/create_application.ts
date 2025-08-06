
import { db } from '../db';
import { applicationsTable } from '../db/schema';
import { type CreateApplicationInput, type Application } from '../schema';

export const createApplication = async (input: CreateApplicationInput): Promise<Application> => {
  try {
    // Insert application record
    const result = await db.insert(applicationsTable)
      .values({
        name: input.name,
        slug: input.slug,
        description: input.description,
        short_description: input.short_description,
        developer_id: input.developer_id,
        category_id: input.category_id,
        price: input.price.toString(), // Convert number to string for numeric column
        is_free: input.is_free,
        app_icon_url: input.app_icon_url
        // Other fields use database defaults:
        // is_featured: false, rating: null, download_count: 0, status: 'draft'
      })
      .returning()
      .execute();

    // Convert numeric fields back to numbers before returning
    const application = result[0];
    return {
      ...application,
      price: parseFloat(application.price), // Convert string back to number
      rating: application.rating ? parseFloat(application.rating) : null
    };
  } catch (error) {
    console.error('Application creation failed:', error);
    throw error;
  }
};
