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

export const deleteAnswer = factory.createHandlers(
  withAdmin,
  zValidator(
    "param",
    z.object({
      answer_id: z.string().cuid(),
    }),
  ),
  async (c) => {
    const { answer_id } = c.req.valid("param");

    try {
      const answer = await recoverFromNotFound(
        prisma.answer.delete({
          where: { id: answer_id },
        }),
      );

      if (!answer) {
        return c.notFound();
      }

      return c.body(null, 204);
    } catch (error) {
      console.error("Error deleting answer:", error);
      return c.json(
        {
          error: "解答の削除中にエラーが発生しました",
        },
        500,
      );
    }
  },
);
