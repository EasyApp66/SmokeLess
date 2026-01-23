import type { FastifyInstance } from 'fastify';
import { eq } from 'drizzle-orm';
import * as schema from '../db/schema.js';
import type { App } from '../index.js';

export function register(app: App, fastify: FastifyInstance) {
  // GET /api/reminders/day/:dayId - Returns reminders for a day
  fastify.get<{ Params: { dayId: string } }>(
    '/api/reminders/day/:dayId',
    {
      schema: {
        description: 'Get reminders for a specific day',
        tags: ['reminders'],
        params: {
          type: 'object',
          properties: {
            dayId: { type: 'string' },
          },
        },
        response: {
          200: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                id: { type: 'string' },
                dayId: { type: 'string' },
                time: { type: 'string' },
                completed: { type: 'boolean' },
                completedAt: { type: ['string', 'null'] },
                createdAt: { type: 'string' },
              },
            },
          },
        },
      },
    },
    async (request) => {
      const { dayId } = request.params;
      app.logger.info({ dayId }, 'Fetching reminders for day');

      const result = await app.db
        .select()
        .from(schema.reminders)
        .where(eq(schema.reminders.dayId, dayId));

      app.logger.info({ dayId, count: result.length }, 'Retrieved reminders');
      return result;
    },
  );

  // PUT /api/reminders/:id/complete - Marks reminder as completed
  fastify.put<{ Params: { id: string }; Body: Record<string, never> }>(
    '/api/reminders/:id/complete',
    {
      schema: {
        description: 'Mark a reminder as completed',
        tags: ['reminders'],
        params: {
          type: 'object',
          properties: {
            id: { type: 'string' },
          },
        },
        response: {
          200: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              dayId: { type: 'string' },
              time: { type: 'string' },
              completed: { type: 'boolean' },
              completedAt: { type: ['string', 'null'] },
              createdAt: { type: 'string' },
            },
          },
        },
      },
    },
    async (request, reply) => {
      const { id } = request.params;
      app.logger.info({ reminderId: id }, 'Marking reminder as completed');

      try {
        const [result] = await app.db
          .update(schema.reminders)
          .set({
            completed: true,
            completedAt: new Date(),
          })
          .where(eq(schema.reminders.id, id))
          .returning();

        if (!result) {
          app.logger.warn({ reminderId: id }, 'Reminder not found');
          return reply.code(404).send({ error: 'Reminder not found' });
        }

        app.logger.info({ reminderId: id }, 'Reminder marked as completed');
        return result;
      } catch (error) {
        app.logger.error({ err: error, reminderId: id }, 'Failed to complete reminder');
        return reply.code(400).send({ error: 'Failed to complete reminder' });
      }
    },
  );

  // DELETE /api/reminders/:id - Deletes a reminder
  fastify.delete<{ Params: { id: string } }>(
    '/api/reminders/:id',
    {
      schema: {
        description: 'Delete a reminder',
        tags: ['reminders'],
        params: {
          type: 'object',
          properties: {
            id: { type: 'string' },
          },
        },
        response: {
          200: {
            type: 'object',
            properties: {
              success: { type: 'boolean' },
            },
          },
        },
      },
    },
    async (request, reply) => {
      const { id } = request.params;
      app.logger.info({ reminderId: id }, 'Deleting reminder');

      try {
        const result = await app.db
          .delete(schema.reminders)
          .where(eq(schema.reminders.id, id))
          .returning();

        if (result.length === 0) {
          app.logger.warn({ reminderId: id }, 'Reminder not found');
          return reply.code(404).send({ error: 'Reminder not found' });
        }

        app.logger.info({ reminderId: id }, 'Reminder deleted successfully');
        return { success: true };
      } catch (error) {
        app.logger.error({ err: error, reminderId: id }, 'Failed to delete reminder');
        return reply.code(400).send({ error: 'Failed to delete reminder' });
      }
    },
  );
}
