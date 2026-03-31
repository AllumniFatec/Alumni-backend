import { PrismaClient } from '../../generated/prisma/index.js';
import { sanitizeAuditMetadata } from './auditLog.sanitizer.js';

const prisma = new PrismaClient();

/**
 * @typedef {import('express').Request} Request
 *
 * @typedef {Object} LogActionInput
 * @property {string | undefined | null} [userId]
 * @property {string} action
 * @property {string} entity
 * @property {string | undefined | null} [entityId]
 * @property {string} description
 * @property {unknown} [metadata]
 * @property {Request} req
 */

/**
 * Centraliza a escrita do Audit Log.
 * Requisitos:
 * - captura ip / user-agent automaticamente
 * - metadata opcional
 * - nunca quebra a aplicação (try/catch silencioso)
 *
 * @param {LogActionInput} input
 * @returns {Promise<void>}
 */
export async function logAction({
  userId,
  action,
  entity,
  entityId,
  description,
  metadata,
  req,
}) {
  try {
    const ipAddress =
      (req.headers['x-forwarded-for'] && String(req.headers['x-forwarded-for']).split(',')[0]?.trim()) ||
      req.ip ||
      null;

    const userAgent = req.headers['user-agent'] ? String(req.headers['user-agent']) : null;

    await prisma.auditLog.create({
      data: {
        user_id: userId ?? null,
        action,
        entity,
        entity_id: entityId ?? null,
        description,
        metadata: metadata == null ? undefined : sanitizeAuditMetadata(metadata),
        ip_address: ipAddress,
        user_agent: userAgent,
      },
    });
  } catch (_) {
    // Silencioso por requisito: auditoria nunca deve quebrar o fluxo
  }
}

