import { createApplication } from "@specific-dev/framework";
import * as schema from './db/schema.js';
import * as daysRoutes from './routes/days.js';
import * as remindersRoutes from './routes/reminders.js';

// Create application with schema for full database type support
export const app = await createApplication(schema);

// Export App type for use in route files
export type App = typeof app;

// Register routes - add your route modules here
// IMPORTANT: Always use registration functions to avoid circular dependency issues
daysRoutes.register(app, app.fastify);
remindersRoutes.register(app, app.fastify);

await app.run();
app.logger.info('Application running');
