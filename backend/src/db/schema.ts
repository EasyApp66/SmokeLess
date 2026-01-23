import {
  pgTable,
  uuid,
  text,
  date,
  integer,
  boolean,
  timestamp,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

export const days = pgTable('days', {
  id: uuid('id').primaryKey().defaultRandom(),
  date: date('date', { mode: 'string' }).notNull().unique(),
  wakeTime: text('wake_time').notNull(),
  sleepTime: text('sleep_time').notNull(),
  targetCigarettes: integer('target_cigarettes').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const reminders = pgTable('reminders', {
  id: uuid('id').primaryKey().defaultRandom(),
  dayId: uuid('day_id')
    .notNull()
    .references(() => days.id, { onDelete: 'cascade' }),
  time: text('time').notNull(),
  completed: boolean('completed').default(false).notNull(),
  completedAt: timestamp('completed_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Relations
export const daysRelations = relations(days, ({ many }) => ({
  reminders: many(reminders),
}));

export const remindersRelations = relations(reminders, ({ one }) => ({
  day: one(days, {
    fields: [reminders.dayId],
    references: [days.id],
  }),
}));
