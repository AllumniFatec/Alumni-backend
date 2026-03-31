/**
 * Ações padronizadas de auditoria (Audit Log).
 * Mantém compatibilidade com runtime JS e permite inferência de tipos via JSDoc/TS.
 */
export const AUTH_LOGIN = 'AUTH_LOGIN';
export const AUTH_LOGIN_FAILED = 'AUTH_LOGIN_FAILED';
export const AUTH_LOGOUT = 'AUTH_LOGOUT';
export const PASSWORD_RESET_REQUEST = 'PASSWORD_RESET_REQUEST';
export const PASSWORD_RESET_SUCCESS = 'PASSWORD_RESET_SUCCESS';

export const USER_APPROVED = 'USER_APPROVED';
export const USER_REJECTED = 'USER_REJECTED';
export const PROFILE_UPDATED = 'PROFILE_UPDATED';
export const PROFILE_DELETED = 'PROFILE_DELETED';

export const JOB_CREATED = 'JOB_CREATED';
export const JOB_UPDATED = 'JOB_UPDATED';
export const JOB_DELETED = 'JOB_DELETED';
export const JOB_CLOSED = 'JOB_CLOSED';

export const EVENT_CREATED = 'EVENT_CREATED';
export const EVENT_UPDATED = 'EVENT_UPDATED';
export const EVENT_DELETED = 'EVENT_DELETED';
export const EVENT_CLOSED = 'EVENT_CLOSED';

export const POST_CREATED = 'POST_CREATED';
export const POST_UPDATED = 'POST_UPDATED';
export const POST_DELETED = 'POST_DELETED';

export const WORKPLACE_CREATED = 'WORKPLACE_CREATED';

/**
 * @typedef {typeof AUTH_LOGIN
 * | typeof AUTH_LOGIN_FAILED
 * | typeof AUTH_LOGOUT
 * | typeof PASSWORD_RESET_REQUEST
 * | typeof PASSWORD_RESET_SUCCESS
 * | typeof USER_APPROVED
 * | typeof USER_REJECTED
 * | typeof PROFILE_UPDATED
 * | typeof PROFILE_DELETED
 * | typeof JOB_CREATED
 * | typeof JOB_UPDATED
 * | typeof JOB_DELETED
 * | typeof JOB_CLOSED
 * | typeof EVENT_CREATED
 * | typeof EVENT_UPDATED
 * | typeof EVENT_DELETED
 * | typeof EVENT_CLOSED
 * | typeof POST_CREATED
 * | typeof POST_UPDATED
 * | typeof POST_DELETED
 * | typeof WORKPLACE_CREATED} AuditAction
 */

