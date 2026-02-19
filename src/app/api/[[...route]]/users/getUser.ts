import { prisma } from "@/lib/prisma";
import { zValidator } from "@hono/zod-validator";
import { createFactory } from "hono/factory";
import type { Session } from "next-auth";
import { z } from "zod";
import { withSession } from "~/middleware/auth";

type Variables = {
  session: Session;
};

const factory = createFactory<{ Variables: Variables }>();

export const getUser = factory.createHandlers(
  withSession,
  zValidator(
    "param",
    z.object({
      user_id: z.string().cuid(),
    }),
  ),
  async (c) => {
    const { user_id } = c.req.valid("param");

    try {
      const data = await prisma.user.findFirst({
        where: {
          id: user_id,
        },
      });

      if (!data) {
        return c.json({ error: "指定されたユーザーが見つかりませんでした" }, 404);
      }
      return c.json(data);
    } catch (error) {
      console.error("ユーザーの取得中にエラーが発生しました:", error);
      return c.json({ error: "ユーザーの取得中にエラーが発生しました" }, 500);
    }
  },
);
