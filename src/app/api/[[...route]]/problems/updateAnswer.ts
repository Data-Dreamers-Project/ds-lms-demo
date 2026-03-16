import { answerSchema } from "@/features/manage/problem/types/schema";
import { prisma } from "@/lib/prisma";
import { zValidator } from "@hono/zod-validator";
import { createFactory } from "hono/factory";
import type { Session } from "next-auth";
import { z } from "zod";
import { withAdmin } from "~/middleware/auth";
import { recoverFromNotFound } from "~/utils";

type Variables = {
  session: Session;
};

const factory = createFactory<{ Variables: Variables }>();

export const updateAnswer = factory.createHandlers(
  withAdmin,
  zValidator("param", z.object({ answer_id: z.string().cuid() })),
  zValidator("json", answerSchema),
  async (c) => {
    const { answer_id } = c.req.valid("param");
    const json = c.req.valid("json");
    const session = c.get("session");

    try {
      const data = await prisma.answer
        .update({
          where: {
            id: answer_id,
          },
          data: {
            ...json,
            updatedById: session.user.id,
          },
        })
        .catch(recoverFromNotFound);

      if (!data) {
        return c.json({ error: "指定された解答が見つかりません" }, 404);
      }
      return c.json(data);
    } catch (error) {
      console.error("Error updating answer:", error);
      return c.json(
        {
          error: "解答の更新中にエラーが発生しました",
        },
        500,
      );
    }
  },
);
