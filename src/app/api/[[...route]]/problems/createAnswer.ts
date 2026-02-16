import { prisma } from "@/lib/prisma";
import { zValidator } from "@hono/zod-validator";
import { createFactory } from "hono/factory";
import type { Session } from "next-auth";
import { z } from "zod";
import { withAdmin } from "~/middleware/auth";

type Variables = {
  session: Session;
};

const factory = createFactory<{ Variables: Variables }>();

export const createAnswer = factory.createHandlers(
  withAdmin,
  zValidator(
    "json",
    z.object({
      title: z.string(),
      description: z.string(),
      code: z.string(),
      problemId: z.string(),

      isPublic: z.boolean().default(false),
    }),
  ),

  async (c) => {
    const json = c.req.valid("json");
    const session = c.get("session");

    try {
      const data = await prisma.answer.create({
        data: {
          ...json,
          createdById: session.user.id,
          updatedById: session.user.id,
        },
      });
      return c.json(data);
    } catch (error) {
      console.error("Error creating answer:", error);
      return c.json(
        {
          error: "解答の作成中にエラーが発生しました",
          details: error instanceof Error ? error.message : String(error),
        },
        500,
      );
    }
  },
);
