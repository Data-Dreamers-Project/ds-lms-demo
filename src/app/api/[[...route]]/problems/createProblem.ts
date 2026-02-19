import { prisma } from "@/lib/prisma";
import { zValidator } from "@hono/zod-validator";
import { createFactory } from "hono/factory";
import type { Session } from "next-auth";
import { z } from "zod";
import { withAdmin } from "~/middleware/auth";

type Variables = {
  session: Session;
};

const factory = createFactory<{ Variables: Variables }>();

export const createProblem = factory.createHandlers(
  withAdmin,
  zValidator(
    "json",
    z.object({
      title: z.string(),
      description: z.string(),
      difficultyLevel: z.number(),
      constraints: z.string(),
      timeLimit: z.number().optional(),
      memoryLimit: z.number().optional(),
      version: z.number().optional(),
      isPublic: z.boolean(),
      isArchived: z.boolean(),
      courseId: z.string().cuid(),
      defaultCode: z.string().optional(),
      testCases: z
        .array(
          z.object({
            input: z.string(),
            output: z.string(),
            isExample: z.boolean(),
            isHidden: z.boolean(),
          }),
        )
        .min(2, {
          message: "テストケースは最低2つ必要です",
        }),
    }),
  ),
  async (c) => {
    const { testCases, ...json } = c.req.valid("json");
    const session = c.get("session");

    try {
      const data = await prisma.problem.create({
        data: {
          timeLimit: json.timeLimit ?? 3,
          memoryLimit: json.memoryLimit ?? 1024,
          ...json,
          createdById: session.user.id,
          updatedById: session.user.id,
          testCases: {
            createMany: {
              data: testCases,
            },
          },
        },
      });
      return c.json(data);
    } catch (error) {
      console.error("Error creating problem:", error);
      return c.json(
        {
          error: "問題の作成中にエラーが発生しました",
        },
        500,
      );
    }
  },
);
