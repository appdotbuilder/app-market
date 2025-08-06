
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { purchasesTable, usersTable, applicationsTable, categoriesTable } from '../db/schema';
import { type CreatePurchaseInput } from '../schema';
import { createPurchase } from '../handlers/create_purchase';
import { eq } from 'drizzle-orm';

// Test data setup
const testCategory = {
  name: 'Test Category',
  slug: 'test-category',
  description: 'Category for testing',
  icon_url: null
};

const testDeveloper = {
  email: 'dev@example.com',
  username: 'testdev',
  full_name: 'Test Developer',
  avatar_url: null,
  role: 'developer' as const
};

const testUser = {
  email: 'user@example.com',
  username: 'testuser',
  full_name: 'Test User',
  avatar_url: null,
  role: 'user' as const
};

const testApplication = {
  name: 'Test App',
  slug: 'test-app',
  description: 'A test application for purchase testing',
  short_description: 'Test app',
  developer_id: 1,
  category_id: 1,
  price: '9.99',
  is_free: false,
  is_featured: false,
  rating: null,
  download_count: 0,
  app_icon_url: null,
  status: 'published' as const
};

describe('createPurchase', () => {
  beforeEach(async () => {
    await createDB();
    
    // Create prerequisite data
    await db.insert(categoriesTable).values(testCategory).execute();
    await db.insert(usersTable).values(testDeveloper).execute();
    await db.insert(usersTable).values(testUser).execute();
    await db.insert(applicationsTable).values(testApplication).execute();
  });

  afterEach(resetDB);

  it('should create a purchase', async () => {
    const testInput: CreatePurchaseInput = {
      application_id: 1,
      user_id: 2, // Second user (testUser)
      price_paid: 9.99
    };

    const result = await createPurchase(testInput);

    // Basic field validation
    expect(result.application_id).toEqual(1);
    expect(result.user_id).toEqual(2);
    expect(result.price_paid).toEqual(9.99);
    expect(typeof result.price_paid).toEqual('number');
    expect(result.payment_status).toEqual('pending');
    expect(result.id).toBeDefined();
    expect(result.purchase_date).toBeInstanceOf(Date);
    expect(result.download_url).toBeNull();
  });

  it('should save purchase to database', async () => {
    const testInput: CreatePurchaseInput = {
      application_id: 1,
      user_id: 2,
      price_paid: 9.99
    };

    const result = await createPurchase(testInput);

    // Query using proper drizzle syntax
    const purchases = await db.select()
      .from(purchasesTable)
      .where(eq(purchasesTable.id, result.id))
      .execute();

    expect(purchases).toHaveLength(1);
    expect(purchases[0].application_id).toEqual(1);
    expect(purchases[0].user_id).toEqual(2);
    expect(parseFloat(purchases[0].price_paid)).toEqual(9.99);
    expect(purchases[0].payment_status).toEqual('pending');
    expect(purchases[0].purchase_date).toBeInstanceOf(Date);
  });

  it('should throw error for non-existent application', async () => {
    const testInput: CreatePurchaseInput = {
      application_id: 999, // Non-existent application
      user_id: 2,
      price_paid: 9.99
    };

    await expect(createPurchase(testInput))
      .rejects.toThrow(/Application with id 999 not found/i);
  });

  it('should throw error for non-existent user', async () => {
    const testInput: CreatePurchaseInput = {
      application_id: 1,
      user_id: 999, // Non-existent user
      price_paid: 9.99
    };

    await expect(createPurchase(testInput))
      .rejects.toThrow(/User with id 999 not found/i);
  });

  it('should handle zero price for free applications', async () => {
    const testInput: CreatePurchaseInput = {
      application_id: 1,
      user_id: 2,
      price_paid: 0 // Free purchase
    };

    const result = await createPurchase(testInput);

    expect(result.price_paid).toEqual(0);
    expect(typeof result.price_paid).toEqual('number');
    expect(result.payment_status).toEqual('pending');
  });
});
