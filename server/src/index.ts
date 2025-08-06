
import { initTRPC } from '@trpc/server';
import { createHTTPServer } from '@trpc/server/adapters/standalone';
import 'dotenv/config';
import cors from 'cors';
import superjson from 'superjson';
import { z } from 'zod';

// Schema imports
import { 
  createUserInputSchema,
  createCategoryInputSchema,
  createApplicationInputSchema,
  createReviewInputSchema,
  createPurchaseInputSchema,
  getApplicationsInputSchema,
  getApplicationInputSchema
} from './schema';

// Handler imports
import { createUser } from './handlers/create_user';
import { getCategories } from './handlers/get_categories';
import { createCategory } from './handlers/create_category';
import { getApplications } from './handlers/get_applications';
import { getApplication } from './handlers/get_application';
import { createApplication } from './handlers/create_application';
import { getFeaturedApplications } from './handlers/get_featured_applications';
import { createReview } from './handlers/create_review';
import { getApplicationReviews } from './handlers/get_application_reviews';
import { createPurchase } from './handlers/create_purchase';
import { getUserPurchases } from './handlers/get_user_purchases';

const t = initTRPC.create({
  transformer: superjson,
});

const publicProcedure = t.procedure;
const router = t.router;

const appRouter = router({
  healthcheck: publicProcedure.query(() => {
    return { status: 'ok', timestamp: new Date().toISOString() };
  }),
  
  // User operations
  createUser: publicProcedure
    .input(createUserInputSchema)
    .mutation(({ input }) => createUser(input)),
  
  // Category operations
  getCategories: publicProcedure
    .query(() => getCategories()),
  createCategory: publicProcedure
    .input(createCategoryInputSchema)
    .mutation(({ input }) => createCategory(input)),
  
  // Application operations
  getApplications: publicProcedure
    .input(getApplicationsInputSchema)
    .query(({ input }) => getApplications(input)),
  getApplication: publicProcedure
    .input(getApplicationInputSchema)
    .query(({ input }) => getApplication(input)),
  createApplication: publicProcedure
    .input(createApplicationInputSchema)
    .mutation(({ input }) => createApplication(input)),
  getFeaturedApplications: publicProcedure
    .query(() => getFeaturedApplications()),
  
  // Review operations
  createReview: publicProcedure
    .input(createReviewInputSchema)
    .mutation(({ input }) => createReview(input)),
  getApplicationReviews: publicProcedure
    .input(z.number())
    .query(({ input }) => getApplicationReviews(input)),
  
  // Purchase operations
  createPurchase: publicProcedure
    .input(createPurchaseInputSchema)
    .mutation(({ input }) => createPurchase(input)),
  getUserPurchases: publicProcedure
    .input(z.number())
    .query(({ input }) => getUserPurchases(input))
});

export type AppRouter = typeof appRouter;

async function start() {
  const port = process.env['SERVER_PORT'] || 2022;
  const server = createHTTPServer({
    middleware: (req, res, next) => {
      cors()(req, res, next);
    },
    router: appRouter,
    createContext() {
      return {};
    },
  });
  server.listen(port);
  console.log(`TRPC server listening at port: ${port}`);
}

start();
