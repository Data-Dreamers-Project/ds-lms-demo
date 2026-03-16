import { z } from "zod";

export const answerFormSchema = z.object({
  title: z.string().min(1, { message: "タイトルは必須です" }),
  description: z.string(),
  code: z.string(),
  isPublic: z.boolean(),
});

export type AnswerFormValues = z.infer<typeof answerFormSchema>;
