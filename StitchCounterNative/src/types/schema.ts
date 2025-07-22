import { z } from "zod";

export const counterSchema = z.object({
  id: z.string(),
  name: z.string().min(1, "Counter name is required"),
  value: z.number(),
  min: z.number(),
  max: z.number(),
  step: z.number().min(1),
  linkedToCounterId: z.string().optional(),
  triggerValue: z.number().optional(),
  isManuallyDisabled: z.boolean().default(false),
});

export const projectSchema = z.object({
  id: z.string(),
  name: z.string().min(1, "Project name is required"),
  description: z.string().optional(),
  isExpanded: z.boolean().default(true),
  counters: z.array(counterSchema),
  createdAt: z.date(),
  isActive: z.boolean().default(true),
});

export const insertCounterSchema = counterSchema.omit({ id: true });
export const insertProjectSchema = projectSchema.omit({ id: true, createdAt: true });

export type Counter = z.infer<typeof counterSchema>;
export type Project = z.infer<typeof projectSchema>;
export type InsertCounter = z.infer<typeof insertCounterSchema>;
export type InsertProject = z.infer<typeof insertProjectSchema>;