import type { FastifyInstance } from 'fastify';
import { eq } from 'drizzle-orm';
import * as schema from '../db/schema.js';
import type { App } from '../index.js';

// Helper function to convert time string (HH:MM) to minutes since midnight
function timeToMinutes(time: string): number {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
}

// Helper function to convert minutes since midnight to time string (HH:MM)
function minutesToTime(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = Math.round(minutes % 60);
  return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;
}

// Helper function to generate reminders for a day
async function generateReminders(
  app: App,
  dayId: string,
  wakeTime: string,
  sleepTime: string,
  targetCigarettes: number,
) {
  // Delete existing reminders for this day
  await app.db.delete(schema.reminders).where(eq(schema.reminders.dayId, dayId));

  const wakeMinutes = timeToMinutes(wakeTime);
  const sleepMinutes = timeToMinutes(sleepTime);
  const totalWakeMinutes = sleepMinutes - wakeMinutes;
  const interval = totalWakeMinutes / targetCigarettes;

  // Generate reminders
  const reminderTimes: string[] = [];
  for (let i = 0; i < targetCigarettes; i++) {
    const reminderMinutes = wakeMinutes + interval * i + interval / 2;
    reminderTimes.push(minutesToTime(reminderMinutes));
  }

  // Insert reminders
  if (reminderTimes.length > 0) {
    await app.db.insert(schema.reminders).values(
      reminderTimes.map((time) => ({
        dayId,
        time,
      })),
    );
  }
}

export function register(app: App, fastify: FastifyInstance) {
  // GET /api/days - Returns all days
  fastify.get(
    '/api/days',
    {
      schema: {
        description: 'Get all days',
        tags: ['days'],
        response: {
          200: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                id: { type: 'string' },
                date: { type: 'string' },
                wakeTime: { type: 'string' },
                sleepTime: { type: 'string' },
                targetCigarettes: { type: 'number' },
                createdAt: { type: 'string' },
              },
            },
          },
        },
      },
    },
    async () => {
      app.logger.info('Fetching all days');
      const result = await app.db.select().from(schema.days);
      app.logger.info({ count: result.length }, 'Retrieved days');
      return result;
    },
  );

  // GET /api/days/:date - Returns day by date
  fastify.get<{ Params: { date: string } }>(
    '/api/days/:date',
    {
      schema: {
        description: 'Get day by date',
        tags: ['days'],
        params: {
          type: 'object',
          properties: {
            date: { type: 'string', description: 'Date in YYYY-MM-DD format' },
          },
        },
        response: {
          200: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              date: { type: 'string' },
              wakeTime: { type: 'string' },
              sleepTime: { type: 'string' },
              targetCigarettes: { type: 'number' },
              createdAt: { type: 'string' },
            },
          },
        },
      },
    },
    async (request, reply) => {
      const { date } = request.params;
      app.logger.info({ date }, 'Fetching day by date');

      const result = await app.db.query.days.findFirst({
        where: eq(schema.days.date, date),
      });

      if (!result) {
        app.logger.warn({ date }, 'Day not found');
        return reply.code(404).send({ error: 'Day not found' });
      }

      app.logger.info({ dayId: result.id }, 'Retrieved day');
      return result;
    },
  );

  // POST /api/days - Create a new day with auto-generated reminders
  fastify.post<{
    Body: {
      date: string;
      wakeTime: string;
      sleepTime: string;
      targetCigarettes: number;
    };
  }>(
    '/api/days',
    {
      schema: {
        description: 'Create a new day with auto-generated reminders',
        tags: ['days'],
        body: {
          type: 'object',
          required: ['date', 'wakeTime', 'sleepTime', 'targetCigarettes'],
          properties: {
            date: { type: 'string', description: 'Date in YYYY-MM-DD format' },
            wakeTime: { type: 'string', description: 'Wake time in HH:MM format' },
            sleepTime: { type: 'string', description: 'Sleep time in HH:MM format' },
            targetCigarettes: { type: 'number', description: 'Target number of cigarettes' },
          },
        },
        response: {
          200: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              date: { type: 'string' },
              wakeTime: { type: 'string' },
              sleepTime: { type: 'string' },
              targetCigarettes: { type: 'number' },
              createdAt: { type: 'string' },
            },
          },
        },
      },
    },
    async (request, reply) => {
      const { date, wakeTime, sleepTime, targetCigarettes } = request.body;
      app.logger.info(
        { date, wakeTime, sleepTime, targetCigarettes },
        'Creating new day',
      );

      try {
        const [result] = await app.db
          .insert(schema.days)
          .values({
            date,
            wakeTime,
            sleepTime,
            targetCigarettes,
          })
          .returning();

        // Generate reminders
        await generateReminders(app, result.id, wakeTime, sleepTime, targetCigarettes);

        app.logger.info({ dayId: result.id, targetCigarettes }, 'Day created with reminders');
        return result;
      } catch (error) {
        app.logger.error({ err: error, date }, 'Failed to create day');
        return reply.code(400).send({ error: 'Failed to create day' });
      }
    },
  );

  // PUT /api/days/:id - Update a day and regenerate reminders
  fastify.put<{
    Params: { id: string };
    Body: {
      wakeTime?: string;
      sleepTime?: string;
      targetCigarettes?: number;
    };
  }>(
    '/api/days/:id',
    {
      schema: {
        description: 'Update a day and regenerate reminders',
        tags: ['days'],
        params: {
          type: 'object',
          properties: {
            id: { type: 'string' },
          },
        },
        body: {
          type: 'object',
          properties: {
            wakeTime: { type: 'string', description: 'Wake time in HH:MM format' },
            sleepTime: { type: 'string', description: 'Sleep time in HH:MM format' },
            targetCigarettes: { type: 'number', description: 'Target number of cigarettes' },
          },
        },
        response: {
          200: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              date: { type: 'string' },
              wakeTime: { type: 'string' },
              sleepTime: { type: 'string' },
              targetCigarettes: { type: 'number' },
              createdAt: { type: 'string' },
            },
          },
        },
      },
    },
    async (request, reply) => {
      const { id } = request.params;
      const { wakeTime, sleepTime, targetCigarettes } = request.body;

      app.logger.info({ id, wakeTime, sleepTime, targetCigarettes }, 'Updating day');

      try {
        // Fetch current day
        const currentDay = await app.db.query.days.findFirst({
          where: eq(schema.days.id, id),
        });

        if (!currentDay) {
          app.logger.warn({ id }, 'Day not found');
          return reply.code(404).send({ error: 'Day not found' });
        }

        // Update day
        const updateData: Partial<typeof schema.days.$inferInsert> = {};
        if (wakeTime) updateData.wakeTime = wakeTime;
        if (sleepTime) updateData.sleepTime = sleepTime;
        if (targetCigarettes !== undefined) updateData.targetCigarettes = targetCigarettes;

        const [result] = await app.db
          .update(schema.days)
          .set(updateData)
          .where(eq(schema.days.id, id))
          .returning();

        // Regenerate reminders with new values
        const finalWakeTime = wakeTime || currentDay.wakeTime;
        const finalSleepTime = sleepTime || currentDay.sleepTime;
        const finalTargetCigarettes = targetCigarettes ?? currentDay.targetCigarettes;

        await generateReminders(
          app,
          id,
          finalWakeTime,
          finalSleepTime,
          finalTargetCigarettes,
        );

        app.logger.info({ dayId: id }, 'Day updated with regenerated reminders');
        return result;
      } catch (error) {
        app.logger.error({ err: error, id }, 'Failed to update day');
        return reply.code(400).send({ error: 'Failed to update day' });
      }
    },
  );
}
