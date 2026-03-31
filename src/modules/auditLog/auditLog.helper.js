import { logAction } from './auditLog.service.js';

/**
 * @typedef {import('express').Request} Request
 *
 * @typedef {Object} LogUserActionConfig
 * @property {string} action
 * @property {string} entity
 * @property {string | undefined | null} [entityId]
 * @property {string} description
 * @property {unknown} [metadata]
 */

/**
 * Helper para reduzir repetição nos controllers.
 * - pega `userId` de `req.user?.id` (quando existir)
 * - aplica `req.auditConfig` (quando middleware `attachAudit` for usado)
 *
 * @param {Request & { user?: { id?: string }, auditConfig?: { action: string, entity: string } }} req
 * @param {Partial<LogUserActionConfig> & { description: string }} config
 */
export async function logUserAction(req, config) {
  const userId = req.user?.id ?? undefined;
  const action = config.action ?? req.auditConfig?.action;
  const entity = config.entity ?? req.auditConfig?.entity;

  if (!action || !entity) return;

  await logAction({
    userId,
    action,
    entity,
    entityId: config.entityId,
    description: config.description,
    metadata: config.metadata,
    req,
  });
}

