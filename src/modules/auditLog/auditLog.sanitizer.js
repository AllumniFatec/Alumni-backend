const SENSITIVE_KEYS = new Set([
  'password',
  'senha',
  'hash',
  'jwt',
  'token',
  'access_token',
  'refresh_token',
  'resetToken',
  'token_password_reset',
  'authorization',
]);

/**
 * Remove informações sensíveis de um objeto arbitrário antes de logar.
 * - Evita logar senha/hash/jwt/tokens (requisito)
 * - Mantém o formato do objeto para debugging seguro
 *
 * @param {unknown} value
 * @param {number} depth
 * @returns {unknown}
 */
export function sanitizeAuditMetadata(value, depth = 0) {
  if (depth > 5) return '[Truncated]';

  if (value == null) return value;

  if (Array.isArray(value)) {
    return value.map((v) => sanitizeAuditMetadata(v, depth + 1));
  }

  if (typeof value === 'object') {
    /** @type {Record<string, unknown>} */
    const out = {};
    for (const [k, v] of Object.entries(value)) {
      if (SENSITIVE_KEYS.has(k.toLowerCase())) {
        out[k] = '[REDACTED]';
      } else {
        out[k] = sanitizeAuditMetadata(v, depth + 1);
      }
    }
    return out;
  }

  return value;
}

