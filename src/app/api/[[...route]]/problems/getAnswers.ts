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

//
export const getAnswers = factory.createHandlers(
  getSession,
  zValidator(
    "param",
    z.object({
      problem_id: z.string().cuid(),
    }),
  ),
  async (c) => {
    const { problem_id } = c.req.valid("param");

    const session = c.get("session");
    const isAdmin = session?.user.role === "ADMIN";

    try {
      const data = await prisma.answer.findMany({
        include: {
          createdBy: isAdmin
            ? {
                select: {
                  id: true,
                  name: true,
                  displayName: true,
                  email: true,
                },
              }
            : {
                select: {
                  name: true,
                  displayName: true,
                },
              },
          updatedBy: isAdmin
            ? {
                select: {
                  id: true,
                  name: true,
                  displayName: true,
                  email: true,
                },
              }
            : {
                select: {
                  name: true,
                  displayName: true,
                },
              },
        },
        where: {
          problemId: problem_id,
          AND: isAdmin
            ? undefined
            : {
                isPublic: true,
              },
        },
        orderBy: {
          createdAt: "desc",
        },
      });

      return c.json(data);
    } catch (error) {
      console.error("データの取得中にエラーが発生しました:", error);
      return c.json({ error: "データの取得中にエラーが発生しました" }, 500);
    }
  },
);
