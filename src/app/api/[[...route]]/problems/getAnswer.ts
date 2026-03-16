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

export const getAnswer = factory.createHandlers(
  getSession,
  zValidator(
    "param",
    z.object({
      answer_id: z.string().cuid(),
    }),
  ),
  async (c) => {
    const { answer_id } = c.req.valid("param");

    const session = c.get("session");
    const isAdmin = session?.user.role === "ADMIN";

    try {
      const data = await prisma.answer.findFirst({
        include: {
          createdBy: isAdmin
            ? true
            : {
                select: {
                  name: true,
                  displayName: true,
                },
              },
          updatedBy: isAdmin
            ? true
            : {
                select: {
                  name: true,
                  displayName: true,
                },
              },
          problem: {
            select: {
              id: true,
              title: true,
              description: true,
              difficultyLevel: true,
              courseId: true,
            },
          },
        },
        where: {
          id: answer_id,
          AND: isAdmin
            ? undefined
            : {
                isPublic: true,
              },
        },
      });

      if (!data) {
        return c.json({ error: "指定された回答が見つかりませんでした" }, 404);
      }
      return c.json(data);
    } catch (error) {
      console.error("データの取得中にエラーが発生しました:", error);
      return c.json({ error: "データの取得中にエラーが発生しました" }, 500);
    }
  },
);
