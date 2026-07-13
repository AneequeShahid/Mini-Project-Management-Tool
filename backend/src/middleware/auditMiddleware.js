import { audit } from "./auditLog.js";

export const auditMiddleware = (entityType) => {
  return async (req, res, next) => {
    // Only log write actions
    if (["POST", "PUT", "PATCH", "DELETE"].includes(req.method)) {
      const action = `${req.method} ${req.originalUrl}`;
      const entityId = req.params.id || null;
      const details = { body: req.body, query: req.query };
      
      // Call the audit function to log it
      await audit(req, action, entityType, entityId, details);
    }
    next();
  };
};
