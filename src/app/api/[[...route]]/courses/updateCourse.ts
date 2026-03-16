import { prisma } from "@/lib/prisma";
import { zValidator } from "@hono/zod-validator";
import { createFactory } from "hono/factory";
import type { Session } from "next-auth";
import { z } from "zod";
import { withSession } from "~/middleware/auth";
import { recoverFromNotFound } from "~/utils";

type Variables = {
  session: Session;
};

const factory = createFactory<{ Variables: Variables }>();

export const updateCourse = factory.createHandlers(
  withSession,
  zValidator(
    "param",
    z.object({
      course_id: z.string().cuid(),
    }),
  ),
  zValidator(
    "json",
    z.object({
      title: z.string().optional(),
      description: z.string().optional(),
      isPublic: z.boolean().optional(),
    }),
  ),
  async (c) => {
    const { course_id } = c.req.valid("param");
    const { title, description, isPublic } = c.req.valid("json");
    const session = c.get("session");

    const isAdmin = session?.user.role === "ADMIN";
    if (!isAdmin) {
      return c.json({ error: "権限がありません" }, 403);
    }

    try {
      const updated = await recoverFromNotFound(
        prisma.course.update({
          where: {
            id: course_id,
          },
          data: {
            title,
            description,
            isPublic,
          },
        }),
      );

      if (!updated) {
        return c.notFound();
      }

      return c.json(updated);
    } catch (error) {
      console.error("コースの更新中にエラーが発生しました:", error);
      return c.json(
        {
          error: "コースの更新中にエラーが発生しました",
        },
        500,
      );
    }
  },
);
