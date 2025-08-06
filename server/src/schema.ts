
import { z } from 'zod';

// User schema
export const userSchema = z.object({
  id: z.number(),
  email: z.string().email(),
  username: z.string(),
  full_name: z.string(),
  avatar_url: z.string().nullable(),
  role: z.enum(['user', 'developer', 'admin']),
  created_at: z.coerce.date(),
  updated_at: z.coerce.date()
});

export type User = z.infer<typeof userSchema>;

// Category schema
export const categorySchema = z.object({
  id: z.number(),
  name: z.string(),
  slug: z.string(),
  description: z.string().nullable(),
  icon_url: z.string().nullable(),
  created_at: z.coerce.date()
});

export type Category = z.infer<typeof categorySchema>;

// Application schema
export const applicationSchema = z.object({
  id: z.number(),
  name: z.string(),
  slug: z.string(),
  description: z.string(),
  short_description: z.string().nullable(),
  developer_id: z.number(),
  category_id: z.number(),
  price: z.number(), // Stored as numeric, converted to number
  is_free: z.boolean(),
  is_featured: z.boolean(),
  rating: z.number().nullable(),
  download_count: z.number(),
  app_icon_url: z.string().nullable(),
  status: z.enum(['draft', 'published', 'suspended']),
  created_at: z.coerce.date(),
  updated_at: z.coerce.date()
});

export type Application = z.infer<typeof applicationSchema>;

// Application screenshot schema
export const screenshotSchema = z.object({
  id: z.number(),
  application_id: z.number(),
  url: z.string(),
  alt_text: z.string().nullable(),
  display_order: z.number(),
  created_at: z.coerce.date()
});

export type Screenshot = z.infer<typeof screenshotSchema>;

// Review schema
export const reviewSchema = z.object({
  id: z.number(),
  application_id: z.number(),
  user_id: z.number(),
  rating: z.number().int().min(1).max(5),
  comment: z.string().nullable(),
  created_at: z.coerce.date(),
  updated_at: z.coerce.date()
});

export type Review = z.infer<typeof reviewSchema>;

// Purchase schema
export const purchaseSchema = z.object({
  id: z.number(),
  application_id: z.number(),
  user_id: z.number(),
  price_paid: z.number(),
  payment_status: z.enum(['pending', 'completed', 'failed', 'refunded']),
  purchase_date: z.coerce.date(),
  download_url: z.string().nullable()
});

export type Purchase = z.infer<typeof purchaseSchema>;

// Input schemas
export const createUserInputSchema = z.object({
  email: z.string().email(),
  username: z.string().min(3).max(50),
  full_name: z.string().min(1).max(100),
  avatar_url: z.string().url().nullable().optional(),
  role: z.enum(['user', 'developer']).default('user')
});

export type CreateUserInput = z.infer<typeof createUserInputSchema>;

export const createCategoryInputSchema = z.object({
  name: z.string().min(1).max(50),
  slug: z.string().min(1).max(50),
  description: z.string().max(500).nullable().optional(),
  icon_url: z.string().url().nullable().optional()
});

export type CreateCategoryInput = z.infer<typeof createCategoryInputSchema>;

export const createApplicationInputSchema = z.object({
  name: z.string().min(1).max(100),
  slug: z.string().min(1).max(100),
  description: z.string().min(10),
  short_description: z.string().max(200).nullable().optional(),
  developer_id: z.number(),
  category_id: z.number(),
  price: z.number().min(0),
  is_free: z.boolean().default(false),
  app_icon_url: z.string().url().nullable().optional()
});

export type CreateApplicationInput = z.infer<typeof createApplicationInputSchema>;

export const createReviewInputSchema = z.object({
  application_id: z.number(),
  user_id: z.number(),
  rating: z.number().int().min(1).max(5),
  comment: z.string().max(1000).nullable().optional()
});

export type CreateReviewInput = z.infer<typeof createReviewInputSchema>;

export const createPurchaseInputSchema = z.object({
  application_id: z.number(),
  user_id: z.number(),
  price_paid: z.number().min(0)
});

export type CreatePurchaseInput = z.infer<typeof createPurchaseInputSchema>;

// Query input schemas
export const getApplicationsInputSchema = z.object({
  category_id: z.number().optional(),
  is_featured: z.boolean().optional(),
  is_free: z.boolean().optional(),
  search: z.string().optional(),
  limit: z.number().min(1).max(100).default(20),
  offset: z.number().min(0).default(0)
});

export type GetApplicationsInput = z.infer<typeof getApplicationsInputSchema>;

export const getApplicationInputSchema = z.object({
  id: z.number().optional(),
  slug: z.string().optional()
}).refine(data => data.id || data.slug, {
  message: "Either id or slug must be provided"
});

export type GetApplicationInput = z.infer<typeof getApplicationInputSchema>;
