import { z } from "zod";

export const courseFormSchema = z.object({
  title: z.string().min(1, { message: "コース名は必須です" }),
  description: z.string().optional(),
  isPublic: z.boolean(),
});

export type CourseFormValues = z.infer<typeof courseFormSchema>;
