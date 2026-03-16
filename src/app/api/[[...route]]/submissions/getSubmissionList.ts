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

export const getSubmissionList = factory.createHandlers(
  getSession,
  zValidator(
    "query",
    z.object({
      user_id: z.string().cuid().optional(),
      status: z.enum(["PENDING", "EVALUATED"]).optional(),
      problem_id: z.string().cuid().optional(),
      languages: z.array(z.string()).default(["python3"]),
      limit: z.string().default("10"),
      offset: z.string().default("0"),
    }),
  ),
  async (c) => {
    const session = c.get("session");
    const { user_id, status, problem_id, languages, limit, offset } = c.req.valid("query");

    try {
      const data = await prisma.submission.findMany({
        where: {
          userId: user_id || session?.user.id,
          status,
          problemId: problem_id,
          language: {
            in: languages,
          },
        },
        include: {
          TestResult: true,
          problem: {
            select: {
              id: true,
              title: true,
              courseId: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
        take: Number(limit),
        skip: Number(offset),
      });

      if (!data) {
        return c.json({ error: "指定された挑戦履歴が見つかりませんでした" }, 404);
      }
      return c.json(data);
    } catch (error) {
      console.error("挑戦履歴の取得中にエラーが発生しました:", error);
      return c.json({ error: "挑戦履歴の取得中にエラーが発生しました" }, 500);
    }
  },
);
