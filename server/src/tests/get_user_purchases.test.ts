
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { usersTable, categoriesTable, applicationsTable, purchasesTable } from '../db/schema';
import { getUserPurchases } from '../handlers/get_user_purchases';

describe('getUserPurchases', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return purchases for a specific user', async () => {
    // Create test user
    const userResult = await db.insert(usersTable)
      .values({
        email: 'test@example.com',
        username: 'testuser',
        full_name: 'Test User',
        role: 'user'
      })
      .returning()
      .execute();
    const userId = userResult[0].id;

    // Create another user
    const otherUserResult = await db.insert(usersTable)
      .values({
        email: 'other@example.com',
        username: 'otheruser',
        full_name: 'Other User',
        role: 'user'
      })
      .returning()
      .execute();
    const otherUserId = otherUserResult[0].id;

    // Create category
    const categoryResult = await db.insert(categoriesTable)
      .values({
        name: 'Test Category',
        slug: 'test-category'
      })
      .returning()
      .execute();
    const categoryId = categoryResult[0].id;

    // Create applications
    const appResult = await db.insert(applicationsTable)
      .values([
        {
          name: 'Test App 1',
          slug: 'test-app-1',
          description: 'Test application 1',
          developer_id: userId,
          category_id: categoryId,
          price: '9.99'
        },
        {
          name: 'Test App 2',
          slug: 'test-app-2',
          description: 'Test application 2',
          developer_id: userId,
          category_id: categoryId,
          price: '19.99'
        }
      ])
      .returning()
      .execute();
    const app1Id = appResult[0].id;
    const app2Id = appResult[1].id;

    // Create purchases for test user
    await db.insert(purchasesTable)
      .values([
        {
          application_id: app1Id,
          user_id: userId,
          price_paid: '9.99',
          payment_status: 'completed',
          download_url: 'https://example.com/download/app1'
        },
        {
          application_id: app2Id,
          user_id: userId,
          price_paid: '19.99',
          payment_status: 'completed',
          download_url: 'https://example.com/download/app2'
        }
      ])
      .execute();

    // Create purchase for other user
    await db.insert(purchasesTable)
      .values({
        application_id: app1Id,
        user_id: otherUserId,
        price_paid: '9.99',
        payment_status: 'completed'
      })
      .execute();

    // Get purchases for test user
    const purchases = await getUserPurchases(userId);

    expect(purchases).toHaveLength(2);
    
    // Verify first purchase
    expect(purchases[0].user_id).toEqual(userId);
    expect(purchases[0].application_id).toEqual(app1Id);
    expect(purchases[0].price_paid).toEqual(9.99);
    expect(typeof purchases[0].price_paid).toEqual('number');
    expect(purchases[0].payment_status).toEqual('completed');
    expect(purchases[0].download_url).toEqual('https://example.com/download/app1');
    expect(purchases[0].purchase_date).toBeInstanceOf(Date);
    expect(purchases[0].id).toBeDefined();

    // Verify second purchase
    expect(purchases[1].user_id).toEqual(userId);
    expect(purchases[1].application_id).toEqual(app2Id);
    expect(purchases[1].price_paid).toEqual(19.99);
    expect(typeof purchases[1].price_paid).toEqual('number');
    expect(purchases[1].payment_status).toEqual('completed');
    expect(purchases[1].download_url).toEqual('https://example.com/download/app2');
  });

  it('should return empty array for user with no purchases', async () => {
    // Create test user
    const userResult = await db.insert(usersTable)
      .values({
        email: 'test@example.com',
        username: 'testuser',
        full_name: 'Test User',
        role: 'user'
      })
      .returning()
      .execute();
    const userId = userResult[0].id;

    const purchases = await getUserPurchases(userId);

    expect(purchases).toHaveLength(0);
    expect(purchases).toEqual([]);
  });

  it('should handle different payment statuses correctly', async () => {
    // Create test user
    const userResult = await db.insert(usersTable)
      .values({
        email: 'test@example.com',
        username: 'testuser',
        full_name: 'Test User',
        role: 'user'
      })
      .returning()
      .execute();
    const userId = userResult[0].id;

    // Create category
    const categoryResult = await db.insert(categoriesTable)
      .values({
        name: 'Test Category',
        slug: 'test-category'
      })
      .returning()
      .execute();
    const categoryId = categoryResult[0].id;

    // Create application
    const appResult = await db.insert(applicationsTable)
      .values({
        name: 'Test App',
        slug: 'test-app',
        description: 'Test application',
        developer_id: userId,
        category_id: categoryId,
        price: '9.99'
      })
      .returning()
      .execute();
    const appId = appResult[0].id;

    // Create purchases with different statuses
    await db.insert(purchasesTable)
      .values([
        {
          application_id: appId,
          user_id: userId,
          price_paid: '9.99',
          payment_status: 'pending'
        },
        {
          application_id: appId,
          user_id: userId,
          price_paid: '9.99',
          payment_status: 'failed'
        },
        {
          application_id: appId,
          user_id: userId,
          price_paid: '9.99',
          payment_status: 'refunded'
        }
      ])
      .execute();

    const purchases = await getUserPurchases(userId);

    expect(purchases).toHaveLength(3);
    
    const statuses = purchases.map(p => p.payment_status).sort();
    expect(statuses).toEqual(['failed', 'pending', 'refunded']);

    // Verify all purchases have correct user_id and numeric price
    purchases.forEach(purchase => {
      expect(purchase.user_id).toEqual(userId);
      expect(purchase.price_paid).toEqual(9.99);
      expect(typeof purchase.price_paid).toEqual('number');
    });
  });
});
