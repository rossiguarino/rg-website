import { auditRepository } from '../repositories/audit';
import type { UserRow } from '../repositories/users';

/**
 * Log an action to the audit trail.
 * Provides a convenient wrapper around the audit repository
 * that accepts a user object directly.
 *
 * @param user - The user performing the action
 * @param action - The action being performed (e.g. 'create', 'update', 'delete', 'login')
 * @param entityType - The type of entity affected (e.g. 'property', 'user')
 * @param entityUuid - The UUID of the affected entity (optional)
 * @param entityName - A human-readable name for the entity (optional)
 * @param details - Additional details or JSON string with change data (optional)
 */
export function logAudit(
  user: Pick<UserRow, 'uuid' | 'first_name' | 'last_name'>,
  action: string,
  entityType: string,
  entityUuid?: string,
  entityName?: string,
  details?: string
): void {
  auditRepository.log({
    user_uuid: user.uuid,
    user_name: `${user.first_name} ${user.last_name}`,
    action,
    entity_type: entityType,
    entity_uuid: entityUuid,
    entity_name: entityName,
    details,
  });
}

/**
 * Log an action with structured detail data that will be JSON-stringified.
 *
 * @param user - The user performing the action
 * @param action - The action being performed
 * @param entityType - The type of entity affected
 * @param entityUuid - The UUID of the affected entity
 * @param entityName - A human-readable name for the entity
 * @param detailsObj - An object that will be JSON.stringify'd for storage
 */
export function logAuditWithDetails(
  user: Pick<UserRow, 'uuid' | 'first_name' | 'last_name'>,
  action: string,
  entityType: string,
  entityUuid: string | undefined,
  entityName: string | undefined,
  detailsObj: Record<string, unknown>
): void {
  logAudit(user, action, entityType, entityUuid, entityName, JSON.stringify(detailsObj));
}
