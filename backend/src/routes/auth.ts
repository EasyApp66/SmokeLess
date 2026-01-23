import type { App } from '../index.js';

export function registerAuthRoutes(app: App) {
  const requireAuth = app.requireAuth();

  // GET /api/auth/profile - Get current user profile
  app.fastify.get(
    '/api/auth/profile',
    {
      schema: {
        description: 'Get current authenticated user profile',
        tags: ['auth'],
        response: {
          200: {
            type: 'object',
            properties: {
              user: {
                type: 'object',
                properties: {
                  id: { type: 'string' },
                  name: { type: 'string' },
                  email: { type: 'string' },
                  emailVerified: { type: 'boolean' },
                  image: { type: ['string', 'null'] },
                  createdAt: { type: 'string' },
                  updatedAt: { type: 'string' },
                },
              },
            },
          },
        },
      },
    },
    async (request, reply) => {
      const auth = await requireAuth(request, reply);
      if (!auth) return;

      const { user } = auth as any;
      app.logger.info({ userId: user.id }, 'Fetching user profile');
      return { user };
    },
  );

  // GET /api/auth/session - Get current session
  app.fastify.get(
    '/api/auth/session',
    {
      schema: {
        description: 'Get current session information',
        tags: ['auth'],
        response: {
          200: {
            type: 'object',
            properties: {
              session: {
                type: 'object',
                properties: {
                  id: { type: 'string' },
                  expiresAt: { type: 'string' },
                  userId: { type: 'string' },
                  createdAt: { type: 'string' },
                  updatedAt: { type: 'string' },
                },
              },
              user: {
                type: 'object',
                properties: {
                  id: { type: 'string' },
                  name: { type: 'string' },
                  email: { type: 'string' },
                  emailVerified: { type: 'boolean' },
                  image: { type: ['string', 'null'] },
                  createdAt: { type: 'string' },
                  updatedAt: { type: 'string' },
                },
              },
            },
          },
        },
      },
    },
    async (request, reply) => {
      const auth = await requireAuth(request, reply);
      if (!auth) return;

      const { session, user } = auth as any;
      app.logger.info({ userId: user.id }, 'Fetching session information');
      return {
        session: {
          id: session.id,
          expiresAt: session.expiresAt,
          userId: session.userId,
          createdAt: session.createdAt,
          updatedAt: session.updatedAt,
        },
        user,
      };
    },
  );
}
