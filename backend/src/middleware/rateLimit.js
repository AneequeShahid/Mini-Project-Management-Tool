import rateLimit from "express-rate-limit";

const isDevOrTest = process.env.NODE_ENV === "test" || process.env.NODE_ENV === "development" || !process.env.NODE_ENV;

export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: isDevOrTest ? 100000 : 100, // Limit each IP to 100 requests per windowMs
  message: { message: "Too many requests from this IP, please try again after 15 minutes" },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

export const authLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: isDevOrTest ? 100000 : 5, // Limit each IP to 5 attempts per hour
  message: { message: "Too many attempts, please try again after an hour" },
  standardHeaders: true,
  legacyHeaders: false,
});
