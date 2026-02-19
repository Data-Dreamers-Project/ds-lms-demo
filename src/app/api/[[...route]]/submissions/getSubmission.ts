import { prisma } from "@/lib/prisma";
import { zValidator } from "@hono/zod-validator";
import { createFactory } from "hono/factory";
import type { Session } from "next-auth";
import { z } from "zod";
import { getSession } from "~/middleware/auth";

type Variables = {
  session: Session;
};

const factory = createFactory<{ Variables: Variables }>();

export const getSubmission = factory.createHandlers(
  getSession,
  zValidator(
    "param",
    z.object({
      submission_id: z.string().cuid(),
    }),
  ),
  async (c) => {
    const { submission_id } = c.req.valid("param");

    const session = c.get("session");
    const isAdmin = session?.user.role === "ADMIN";

    try {
      const data = await prisma.submission.findFirst({
        include: {
          TestResult: {
            include: {
              testCase: true,
            },
          },
          problem: {
            include: {
              tags: true,
              testCases: true,
            },
          },
        },
        where: {
          id: submission_id,
          userId: isAdmin ? undefined : session?.user.id,
        },
      });

      if (!data) {
        return c.json({ error: "指定された解答が見つかりませんでした" }, 404);
      }
      return c.json(data);
    } catch (error) {
      console.error("データの取得中にエラーが発生しました:", error);
      return c.json({ error: "データの取得中にエラーが発生しました" }, 500);
    }
  },
);
