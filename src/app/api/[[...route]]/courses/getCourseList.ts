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

export const getCourseList = factory.createHandlers(
  getSession,
  zValidator(
    "query",
    z
      .object({
        search: z.string().optional(),
        user_id: z.string().cuid().optional(),
        limit: z.string().default("10"),
        offset: z.string().default("0"),
      })
      .optional(), // query全体をオプショナルにする
  ),
  async (c) => {
    const query = c.req.valid("query");
    const search = query?.search;
    const session = c.get("session");
    const userId = query?.user_id || session?.user.id;

    try {
      const data = await prisma.course.findMany({
        where: {
          ...(search && { title: { contains: search } }),
          ...(session?.user.role !== "ADMIN" && { isPublic: true }),
        },
        include: {
          problems: {
            include: {
              submissions: {
                where: {
                  userId: userId,
                },
              },
            },
          },
          _count: { select: { problems: true } },
        },
      });

      const result = data.map(({ problems, ...course }) => ({
        ...course,
        UserProgress: {
          progress: problems.filter((problem) => problem.submissions.length > 0).length,
        },
      }));

      return c.json(result);
    } catch (error) {
      console.error("問題の取得中にエラーが発生しました:", error);
      return c.json({ error: "問題の取得中にエラーが発生しました" }, 500);
    }
  },
);
