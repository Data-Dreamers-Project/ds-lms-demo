import { formSchema } from "@/features/manage/problem/types/schema";
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

export const updateProblem = factory.createHandlers(
  withAdmin,
  zValidator("param", z.object({ problem_id: z.string().cuid() })),
  zValidator("json", formSchema),
  async (c) => {
    const { problem_id } = c.req.valid("param");
    const { testCases, ...json } = c.req.valid("json");
    const session = c.get("session");

    try {
      const data = await prisma.problem.update({
        where: {
          id: problem_id,
        },
        data: {
          ...json,
          updatedById: session.user.id,
          testCases: {
            deleteMany: {
              id: {
                notIn: testCases.map((testCase) => testCase.id || "").filter(Boolean),
              },
            },
            upsert: testCases.map((testCase) => ({
              where: { id: testCase.id ?? "" },
              update: {
                input: testCase.input || "",
                output: testCase.output || "",
                isExample: testCase.isExample,
                isHidden: testCase.isHidden,
              },
              create: {
                input: testCase.input || "",
                output: testCase.output || "",
                isExample: testCase.isExample,
                isHidden: testCase.isHidden,
              },
            })),
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
