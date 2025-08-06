
import { db } from '../db';
import { purchasesTable } from '../db/schema';
import { type Purchase } from '../schema';
import { eq } from 'drizzle-orm';

export const getUserPurchases = async (userId: number): Promise<Purchase[]> => {
  try {
    const results = await db.select()
      .from(purchasesTable)
      .where(eq(purchasesTable.user_id, userId))
      .execute();

    // Convert numeric fields back to numbers
    return results.map(purchase => ({
      ...purchase,
      price_paid: parseFloat(purchase.price_paid)
    }));
  } catch (error) {
    console.error('Failed to get user purchases:', error);
    throw error;
  }
};
