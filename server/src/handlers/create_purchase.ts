
import { db } from '../db';
import { purchasesTable, applicationsTable, usersTable } from '../db/schema';
import { type CreatePurchaseInput, type Purchase } from '../schema';
import { eq } from 'drizzle-orm';

export const createPurchase = async (input: CreatePurchaseInput): Promise<Purchase> => {
  try {
    // Verify application exists
    const application = await db.select()
      .from(applicationsTable)
      .where(eq(applicationsTable.id, input.application_id))
      .execute();

    if (application.length === 0) {
      throw new Error(`Application with id ${input.application_id} not found`);
    }

    // Verify user exists
    const user = await db.select()
      .from(usersTable)
      .where(eq(usersTable.id, input.user_id))
      .execute();

    if (user.length === 0) {
      throw new Error(`User with id ${input.user_id} not found`);
    }

    // Insert purchase record
    const result = await db.insert(purchasesTable)
      .values({
        application_id: input.application_id,
        user_id: input.user_id,
        price_paid: input.price_paid.toString(), // Convert number to string for numeric column
        payment_status: 'pending'
      })
      .returning()
      .execute();

    // Convert numeric fields back to numbers before returning
    const purchase = result[0];
    return {
      ...purchase,
      price_paid: parseFloat(purchase.price_paid) // Convert string back to number
    };
  } catch (error) {
    console.error('Purchase creation failed:', error);
    throw error;
  }
};
