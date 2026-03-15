import {
  pgTable,
  text,
  timestamp,
  uuid,
  integer,
  primaryKey,
  unique,
} from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'

// ---------------------------------------------------------------------------
// Auth.js tables (required by @auth/drizzle-adapter)
// ---------------------------------------------------------------------------

export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name'),
  email: text('email').notNull().unique(),
  emailVerified: timestamp('emailVerified', { mode: 'date' }),
  image: text('image'),
  createdAt: timestamp('createdAt', { mode: 'date' }).defaultNow(),
})

export const accounts = pgTable('accounts', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('userId')
    .notNull()
    .references(() => users.id),
  type: text('type').notNull(),
  provider: text('provider').notNull(),
  providerAccountId: text('providerAccountId').notNull(),
  refresh_token: text('refresh_token'),
  access_token: text('access_token'),
  expires_at: integer('expires_at'),
  token_type: text('token_type'),
  scope: text('scope'),
  id_token: text('id_token'),
  session_state: text('session_state'),
})

export const sessions = pgTable('sessions', {
  id: uuid('id').primaryKey().defaultRandom(),
  sessionToken: text('sessionToken').notNull().unique(),
  userId: uuid('userId')
    .notNull()
    .references(() => users.id),
  expires: timestamp('expires', { mode: 'date' }).notNull(),
})

export const verificationTokens = pgTable(
  'verificationTokens',
  {
    identifier: text('identifier').notNull(),
    token: text('token').notNull().unique(),
    expires: timestamp('expires', { mode: 'date' }).notNull(),
  },
  (table) => [primaryKey({ columns: [table.identifier, table.token] })],
)

// ---------------------------------------------------------------------------
// Application tables
// ---------------------------------------------------------------------------

export const licenses = pgTable('licenses', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('userId')
    .notNull()
    .references(() => users.id),
  licenseKey: text('licenseKey').notNull().unique(),
  plan: text('plan').default('annual'),
  maxDevices: integer('maxDevices').default(3),
  status: text('status').default('active'), // active | suspended | expired | revoked
  createdAt: timestamp('createdAt', { mode: 'date' }).defaultNow(),
  expiresAt: timestamp('expiresAt', { mode: 'date' }).notNull(),
})

export const activations = pgTable(
  'activations',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    licenseId: uuid('licenseId')
      .notNull()
      .references(() => licenses.id),
    machineId: text('machineId').notNull(),
    machineName: text('machineName'),
    os: text('os'),
    activatedAt: timestamp('activatedAt', { mode: 'date' }).defaultNow(),
    lastHeartbeatAt: timestamp('lastHeartbeatAt', { mode: 'date' }).defaultNow(),
    deactivatedAt: timestamp('deactivatedAt', { mode: 'date' }),
  },
  (table) => [unique().on(table.licenseId, table.machineId)],
)

export const orders = pgTable('orders', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('userId')
    .notNull()
    .references(() => users.id),
  licenseId: uuid('licenseId').references(() => licenses.id),
  stripeCustomerId: text('stripeCustomerId'),
  stripeSessionId: text('stripeSessionId'),
  stripeSubscriptionId: text('stripeSubscriptionId'),
  amount: integer('amount').notNull(), // cents
  currency: text('currency').default('usd'),
  createdAt: timestamp('createdAt', { mode: 'date' }).defaultNow(),
})

// ---------------------------------------------------------------------------
// Relations
// ---------------------------------------------------------------------------

export const usersRelations = relations(users, ({ many }) => ({
  accounts: many(accounts),
  sessions: many(sessions),
  licenses: many(licenses),
  orders: many(orders),
}))

export const accountsRelations = relations(accounts, ({ one }) => ({
  user: one(users, { fields: [accounts.userId], references: [users.id] }),
}))

export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, { fields: [sessions.userId], references: [users.id] }),
}))

export const licensesRelations = relations(licenses, ({ one, many }) => ({
  user: one(users, { fields: [licenses.userId], references: [users.id] }),
  activations: many(activations),
  orders: many(orders),
}))

export const activationsRelations = relations(activations, ({ one }) => ({
  license: one(licenses, {
    fields: [activations.licenseId],
    references: [licenses.id],
  }),
}))

export const ordersRelations = relations(orders, ({ one }) => ({
  user: one(users, { fields: [orders.userId], references: [users.id] }),
  license: one(licenses, {
    fields: [orders.licenseId],
    references: [licenses.id],
  }),
}))
