export function requireFields(body, ...fields) {
  const missing = fields.filter((f) => !body[f] && body[f] !== false);
  if (missing.length) {
    const err = new Error(`Missing required fields: ${missing.join(", ")}`);
    err.status = 400;
    throw err;
  }
}

export function asEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}
