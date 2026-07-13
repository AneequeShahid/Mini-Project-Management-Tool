import { z } from "zod";

export const authSchemas = {
  register: z.object({
    body: z.object({
      name: z.string().min(2, "Name must be at least 2 characters"),
      email: z.string().email("Invalid email format"),
      password: z.string().min(6, "Password must be at least 6 characters"),
    }),
  }),
  login: z.object({
    body: z.object({
      email: z.string().email("Invalid email format"),
      password: z.string().min(1, "Password is required"),
    }),
  }),
  oauthCallback: z.object({
    body: z.object({
      provider: z.enum(["github", "google", "keycloak"]),
      code: z.string().min(1, "Authorization code is required"),
    }),
  }),
  forgotPassword: z.object({
    body: z.object({
      email: z.string().email("Invalid email format"),
    }),
  }),
  resetPassword: z.object({
    body: z.object({
      token: z.string().min(1, "Token is required"),
      password: z.string().min(6, "Password must be at least 6 characters"),
    }),
  }),
};
