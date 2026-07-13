import { z } from "zod";

export const authSchemas = {
  register: z.object({
    body: z.object({
      name: z.string().min(2),
      email: z.string().email(),
      password: z.string().min(6),
    }),
  }),
  login: z.object({
    body: z.object({
      email: z.string().email(),
      password: z.string().min(1),
    }),
  }),
};

export const projectSchemas = {
  create: z.object({
    body: z.object({
      name: z.string().min(1),
      description: z.string().optional(),
      workspace: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid workspace ID"),
      isTemplate: z.boolean().optional(),
    }),
  }),
  update: z.object({
    params: z.object({ id: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid project ID") }),
    body: z.object({
      name: z.string().optional(),
      description: z.string().optional(),
      status: z.enum(["Active", "Archived"]).optional(),
      isTemplate: z.boolean().optional(),
    }),
  }),
};

export const taskSchemas = {
  create: z.object({
    body: z.object({
      title: z.string().min(1),
      description: z.string().optional(),
      project: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid project ID"),
      sprint: z.string().regex(/^[0-9a-fA-F]{24}$/).optional().or(z.literal("")),
      priority: z.enum(["Low", "Medium", "High", "Critical"]).optional(),
      status: z.enum(["Backlog", "Todo", "In Progress", "In Review", "Done"]).optional(),
      assignee: z.string().regex(/^[0-9a-fA-F]{24}$/).optional().or(z.literal("")),
      storyPoints: z.preprocess((val) => Number(val), z.number().min(0).default(0)),
      dueDate: z.string().datetime().optional().or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/)),
      customFields: z.record(z.any()).optional(),
    }),
  }),
};
