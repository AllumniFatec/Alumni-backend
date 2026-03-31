/**
 * @typedef {import('express').Request} Request
 * @typedef {import('express').Response} Response
 * @typedef {import('express').NextFunction} NextFunction
 *
 * @typedef {Object} AuditConfig
 * @property {string} action
 * @property {string} entity
 */

/**
 * Middleware opcional para anexar configuração de auditoria na request.
 *
 * Exemplo:
 * router.post('/job', attachAudit({ action: JOB_CREATED, entity: 'JOB' }), controller.createJob)
 *
 * @param {AuditConfig} actionConfig
 */
export function attachAudit(actionConfig) {
  /**
   * @param {Request & { auditConfig?: AuditConfig }} req
   * @param {Response} _res
   * @param {NextFunction} next
   */
  return (req, _res, next) => {
    req.auditConfig = actionConfig;
    next();
  };
}

