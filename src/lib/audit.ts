/**
 * Audit Logging Service
 *
 * Tracks admin and member actions for accountability and debugging.
 */

import { DrizzleD1Database } from "drizzle-orm/d1";
import { auditLog } from "../db/schema";
import { generateId } from "./utils";
import { log } from "./logger";
import type * as schema from "../db/schema";

type DbType = DrizzleD1Database<typeof schema>;

export type AuditAction =
  | 'member.create'
  | 'member.update'
  | 'member.delete'
  | 'member.suspend'
  | 'member.activate'
  | 'application.approve'
  | 'application.reject'
  | 'application.waitlist'
  | 'event.create'
  | 'event.update'
  | 'event.cancel'
  | 'event.delete'
  | 'range.status.update'
  | 'payment.process'
  | 'payment.refund'
  | 'settings.update'
  | 'guest.signin'
  | 'admin.login'
  | 'admin.action';

export interface AuditEntry {
  action: string; // Extended to allow any action string
  actorId?: string; // User/member who performed the action
  actorType?: 'member' | 'admin' | 'system';
  performedBy?: string; // Alternative to actorId for convenience
  targetType: string; // Type of entity affected
  targetId: string; // ID of entity affected
  details?: Record<string, unknown>; // Additional context
  ipAddress?: string;
  userAgent?: string;
}

/**
 * Log an audit event
 */
export async function logAudit(
  db: DbType,
  entry: AuditEntry
): Promise<void> {
  try {
    const userId = entry.actorId || entry.performedBy;
    await db.insert(auditLog).values({
      id: generateId(),
      userId: userId || 'system',
      action: entry.action,
      targetType: entry.targetType,
      targetId: entry.targetId,
      details: entry.details ? JSON.stringify(entry.details) : null,
      ipAddress: entry.ipAddress || null,
      userAgent: entry.userAgent || null,
      createdAt: new Date(),
    });
  } catch (error) {
    // Don't let audit logging failures break the main operation
    log.error('Audit log failed', error instanceof Error ? error : new Error(String(error)), {
      action: entry.action,
      targetType: entry.targetType,
      targetId: entry.targetId,
    });
  }
}

/**
 * Helper to create audit log from Hono context
 */
export function createAuditLogger(
  db: DbType,
  actorId: string,
  actorType: 'member' | 'admin' | 'system',
  ipAddress?: string,
  userAgent?: string
) {
  return async (
    action: string,
    targetType: string,
    targetId: string,
    details?: Record<string, unknown>
  ) => {
    await logAudit(db, {
      action,
      actorId,
      actorType,
      targetType,
      targetId,
      details,
      ipAddress,
      userAgent,
    });
  };
}
