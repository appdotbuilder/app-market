
import { serial, text, pgTable, timestamp, numeric, integer, boolean, pgEnum } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Enums
export const userRoleEnum = pgEnum('user_role', ['user', 'developer', 'admin']);
export const applicationStatusEnum = pgEnum('application_status', ['draft', 'published', 'suspended']);
export const paymentStatusEnum = pgEnum('payment_status', ['pending', 'completed', 'failed', 'refunded']);

// Users table
export const usersTable = pgTable('users', {
  id: serial('id').primaryKey(),
  email: text('email').notNull().unique(),
  username: text('username').notNull().unique(),
  full_name: text('full_name').notNull(),
  avatar_url: text('avatar_url'),
  role: userRoleEnum('role').notNull().default('user'),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull()
});

// Categories table
export const categoriesTable = pgTable('categories', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  slug: text('slug').notNull().unique(),
  description: text('description'),
  icon_url: text('icon_url'),
  created_at: timestamp('created_at').defaultNow().notNull()
});

// Applications table
export const applicationsTable = pgTable('applications', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  slug: text('slug').notNull().unique(),
  description: text('description').notNull(),
  short_description: text('short_description'),
  developer_id: integer('developer_id').notNull(),
  category_id: integer('category_id').notNull(),
  price: numeric('price', { precision: 10, scale: 2 }).notNull(),
  is_free: boolean('is_free').notNull().default(false),
  is_featured: boolean('is_featured').notNull().default(false),
  rating: numeric('rating', { precision: 3, scale: 2 }),
  download_count: integer('download_count').notNull().default(0),
  app_icon_url: text('app_icon_url'),
  status: applicationStatusEnum('status').notNull().default('draft'),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull()
});

// Screenshots table
export const screenshotsTable = pgTable('screenshots', {
  id: serial('id').primaryKey(),
  application_id: integer('application_id').notNull(),
  url: text('url').notNull(),
  alt_text: text('alt_text'),
  display_order: integer('display_order').notNull().default(0),
  created_at: timestamp('created_at').defaultNow().notNull()
});

// Reviews table
export const reviewsTable = pgTable('reviews', {
  id: serial('id').primaryKey(),
  application_id: integer('application_id').notNull(),
  user_id: integer('user_id').notNull(),
  rating: integer('rating').notNull(),
  comment: text('comment'),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull()
});

// Purchases table
export const purchasesTable = pgTable('purchases', {
  id: serial('id').primaryKey(),
  application_id: integer('application_id').notNull(),
  user_id: integer('user_id').notNull(),
  price_paid: numeric('price_paid', { precision: 10, scale: 2 }).notNull(),
  payment_status: paymentStatusEnum('payment_status').notNull().default('pending'),
  purchase_date: timestamp('purchase_date').defaultNow().notNull(),
  download_url: text('download_url')
});

// Relations
export const usersRelations = relations(usersTable, ({ many }) => ({
  applications: many(applicationsTable),
  reviews: many(reviewsTable),
  purchases: many(purchasesTable)
}));

export const categoriesRelations = relations(categoriesTable, ({ many }) => ({
  applications: many(applicationsTable)
}));

export const applicationsRelations = relations(applicationsTable, ({ one, many }) => ({
  developer: one(usersTable, {
    fields: [applicationsTable.developer_id],
    references: [usersTable.id]
  }),
  category: one(categoriesTable, {
    fields: [applicationsTable.category_id],
    references: [categoriesTable.id]
  }),
  screenshots: many(screenshotsTable),
  reviews: many(reviewsTable),
  purchases: many(purchasesTable)
}));

export const screenshotsRelations = relations(screenshotsTable, ({ one }) => ({
  application: one(applicationsTable, {
    fields: [screenshotsTable.application_id],
    references: [applicationsTable.id]
  })
}));

export const reviewsRelations = relations(reviewsTable, ({ one }) => ({
  application: one(applicationsTable, {
    fields: [reviewsTable.application_id],
    references: [applicationsTable.id]
  }),
  user: one(usersTable, {
    fields: [reviewsTable.user_id],
    references: [usersTable.id]
  })
}));

export const purchasesRelations = relations(purchasesTable, ({ one }) => ({
  application: one(applicationsTable, {
    fields: [purchasesTable.application_id],
    references: [applicationsTable.id]
  }),
  user: one(usersTable, {
    fields: [purchasesTable.user_id],
    references: [usersTable.id]
  })
}));

// Export all tables for relation queries
export const tables = {
  users: usersTable,
  categories: categoriesTable,
  applications: applicationsTable,
  screenshots: screenshotsTable,
  reviews: reviewsTable,
  purchases: purchasesTable
};
