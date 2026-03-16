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

export const getProblem = factory.createHandlers(
  getSession,
  zValidator(
    "query",
    z
      .object({
        includeExamplesOnly: z.string().optional(),
      })
      .optional(),
  ),
  zValidator(
    "param",
    z.object({
      problem_id: z.string().cuid(),
    }),
  ),
  async (c) => {
    const query = c.req.valid("query");
    const { problem_id } = c.req.valid("param");

    const session = c.get("session");
    const isAdmin = session?.user.role === "ADMIN";

    try {
      const data = await prisma.problem.findFirst({
        include: {
          course: {
            select: { id: true, title: true },
          },
          createdBy: isAdmin,
          updatedBy: isAdmin,
          tags: true,
          testCases: {
            where: query?.includeExamplesOnly === "true" ? { isExample: true } : undefined,
          },
          submissions: isAdmin
            ? true
            : {
                where: {
                  userId: session?.user.id,
                },
              },
        },
        where: {
          id: problem_id,
        },
      });

      if (!data) {
        return c.json({ error: "指定された問題が見つかりませんでした" }, 404);
      }
      return c.json(data);
    } catch (error) {
      console.error("データの取得中にエラーが発生しました:", error);
      return c.json({ error: "データの取得中にエラーが発生しました" }, 500);
    }
  },
);
