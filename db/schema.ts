import {sqliteTable,text,index,integer} from 'drizzle-orm/sqlite-core';
export const newsArchive=sqliteTable('news_archive',{
 id:text('id').primaryKey(),tab:text('tab').notNull(),region:text('region').notNull().default('india'),title:text('title').notNull(),summary:text('summary').notNull(),published:text('published').notNull(),category:text('category').notNull(),source:text('source').notNull(),url:text('url').notNull(),sourceType:text('source_type').notNull(),firstSeen:text('first_seen').notNull(),verifiedAt:text('verified_at').notNull()
},t=>[index('idx_news_tab_date').on(t.tab,t.published)]);
export const editions=sqliteTable('editions',{id:text('id').primaryKey(),importedAt:text('imported_at').notNull()});

export const subscriptions=sqliteTable('subscriptions',{
 id:text('id').primaryKey(),channel:text('channel').notNull(),contact:text('contact').notNull(),topics:text('topics').notNull(),status:text('status').notNull().default('pending_setup'),consentVersion:text('consent_version').notNull(),createdAt:text('created_at').notNull(),cancelTokenHash:text('cancel_token_hash').notNull()
},t=>[index('idx_subscriptions_cancel_token').on(t.cancelTokenHash)]);
export const subscriptionLimits=sqliteTable('subscription_limits',{id:text('id').primaryKey(),attempts:integer('attempts').notNull(),expiresAt:text('expires_at').notNull()});

export const pushSettings=sqliteTable('push_settings',{id:text('id').primaryKey(),value:text('value').notNull()});
export const pushDevices=sqliteTable('push_devices',{id:text('id').primaryKey(),endpoint:text('endpoint').notNull(),tokenHash:text('token_hash').notNull(),seenAt:integer('seen_at').notNull(),retryAt:integer('retry_at').notNull().default(0)},t=>[index('idx_push_due').on(t.seenAt,t.retryAt)]);
