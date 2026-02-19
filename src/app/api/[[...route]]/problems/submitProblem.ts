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

export const submitProblem = factory.createHandlers(
  withSession,
  zValidator(
    "param",
    z.object({
      problem_id: z.string().cuid(),
    }),
  ),
  zValidator(
    "json",
    z.object({
      code: z.string(),
      startedAt: z.string().nullable(),
    }),
  ),
  async (c) => {
    const { problem_id } = c.req.valid("param");
    const json = c.req.valid("json");
    const session = c.get("session");

    try {
      const data = await prisma.submission.create({
        data: {
          ...json,
          status: "PENDING",
          userId: session.user.id,
          problemId: problem_id,
        },
      });
      return c.json(data);
    } catch (error) {
      console.error("解答提出中にエラーが発生しました:", error);
      return c.json(
        {
          error: "解答提出中にエラーが発生しました",
        },
        500,
      );
    }
  },
);
