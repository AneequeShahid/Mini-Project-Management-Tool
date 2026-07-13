import { z } from "zod";

export function validate(schema) {
  return (req, res, next) => {
    try {
      schema.parse({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      next();
    } catch (err) {
      if (err instanceof z.ZodError) {
        const hasMissingFields = err.errors.some(
          (e) => e.message === "Required" || e.message.toLowerCase().includes("required")
        );
        const message = hasMissingFields
          ? "Missing required fields"
          : err.errors[0]?.message || "Validation failed";
        return res.status(400).json({
          message,
          errors: err.errors.map((e) => ({
            path: e.path.join("."),
            message: e.message,
          })),
        });
      }
      next(err);
    }
  };
}
