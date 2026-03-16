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

export const deleteProblem = factory.createHandlers(
  withAdmin,
  zValidator(
    "param",
    z.object({
      problem_id: z.string().cuid(),
    }),
  ),
  async (c) => {
    const { problem_id } = c.req.valid("param");

    try {
      const problem = await recoverFromNotFound(
        prisma.problem.delete({
          where: {
            id: problem_id,
          },
        }),
      );

      if (!problem) {
        return c.notFound();
      }

      return c.body(null, 204);
    } catch (error) {
      return c.json({ error: "問題の削除中にエラーが発生しました" }, 500);
    }
  },
);
