import { pgTable, text, integer, timestamp, boolean, uuid, varchar, jsonb } from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'

// Users table
export const users = pgTable('users', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: varchar('name', { length: 100 }).notNull(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  username: varchar('username', { length: 50 }).notNull().unique(),
  bio: text('bio').default(''),
  profileImage: text('profile_image').default(''),
  theme: varchar('theme', { length: 50 }).default('default'),
  isAdmin: boolean('is_admin').default(false).notNull(),
  isBanned: boolean('is_banned').default(false).notNull(),
  emailVerified: boolean('email_verified').default(false).notNull(),
  verifyToken: varchar('verify_token', { length: 6 }),
  verifyTokenExpiry: timestamp('verify_token_expiry'),
  // Password reset
  resetToken: varchar('reset_token', { length: 6 }),
  resetTokenExpiry: timestamp('reset_token_expiry'),
  // Profile extras
  profileViews: integer('profile_views').default(0).notNull(),
  socialLinks: jsonb('social_links').default({}).$type<Record<string, string>>(),
  newsletterEnabled: boolean('newsletter_enabled').default(false).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

// Links table
export const links = pgTable('links', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  title: varchar('title', { length: 100 }).notNull(),
  url: text('url').notNull(),
  icon: varchar('icon', { length: 50 }).default('link'),
  category: varchar('category', { length: 50 }).default('general'),
  position: integer('position').default(0).notNull(),
  clicks: integer('clicks').default(0).notNull(),
  isActive: boolean('is_active').default(true).notNull(),
  // Scheduling
  scheduledStart: timestamp('scheduled_start'),
  scheduledEnd: timestamp('scheduled_end'),
  // Password protection
  linkPassword: varchar('link_password', { length: 100 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

// Newsletter subscribers table
export const subscribers = pgTable('subscribers', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  email: varchar('email', { length: 255 }).notNull(),
  subscribedAt: timestamp('subscribed_at').defaultNow().notNull(),
})

// Login activity log table
export const loginLogs = pgTable('login_logs', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  ip: varchar('ip', { length: 45 }).default('unknown'),
  country: varchar('country', { length: 60 }).default('unknown'),
  device: varchar('device', { length: 50 }).default('unknown'),
  browser: varchar('browser', { length: 100 }).default('unknown'),
  os: varchar('os', { length: 50 }).default('unknown'),
  success: boolean('success').default(true).notNull(),
  failReason: varchar('fail_reason', { length: 100 }),
  loggedAt: timestamp('logged_at').defaultNow().notNull(),
})

// Analytics table
export const analytics = pgTable('analytics', {
  id: uuid('id').defaultRandom().primaryKey(),
  linkId: uuid('link_id').notNull().references(() => links.id, { onDelete: 'cascade' }),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  visitorIp: varchar('visitor_ip', { length: 45 }).default(''),
  device: varchar('device', { length: 50 }).default('unknown'),
  browser: varchar('browser', { length: 50 }).default('unknown'),
  country: varchar('country', { length: 60 }).default('unknown'),
  clickedAt: timestamp('clicked_at').defaultNow().notNull(),
})

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  links: many(links),
  analytics: many(analytics),
}))

export const linksRelations = relations(links, ({ one, many }) => ({
  user: one(users, { fields: [links.userId], references: [users.id] }),
  analytics: many(analytics),
}))

export const analyticsRelations = relations(analytics, ({ one }) => ({
  link: one(links, { fields: [analytics.linkId], references: [links.id] }),
  user: one(users, { fields: [analytics.userId], references: [users.id] }),
}))

export const subscribersRelations = relations(subscribers, ({ one }) => ({
  user: one(users, { fields: [subscribers.userId], references: [users.id] }),
}))

export const loginLogsRelations = relations(loginLogs, ({ one }) => ({
  user: one(users, { fields: [loginLogs.userId], references: [users.id] }),
}))

export type User = typeof users.$inferSelect
export type NewUser = typeof users.$inferInsert
export type Link = typeof links.$inferSelect
export type NewLink = typeof links.$inferInsert
export type Analytics = typeof analytics.$inferSelect
export type NewAnalytics = typeof analytics.$inferInsert
export type Subscriber = typeof subscribers.$inferSelect
export type NewSubscriber = typeof subscribers.$inferInsert
export type LoginLog = typeof loginLogs.$inferSelect
export type NewLoginLog = typeof loginLogs.$inferInsert
