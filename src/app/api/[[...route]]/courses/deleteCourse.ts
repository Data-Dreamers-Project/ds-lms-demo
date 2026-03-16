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

export const deleteCourse = factory.createHandlers(
  withAdmin,
  zValidator(
    "param",
    z.object({
      course_id: z.string().cuid(),
    }),
  ),
  async (c) => {
    const { course_id } = c.req.valid("param");
    try {
      const course = await recoverFromNotFound(
        prisma.course.delete({
          where: {
            id: course_id,
          },
        }),
      );

      if (!course) {
        return c.notFound();
      }

      return c.body(null, 204);
    } catch (error) {
      console.error(error);
      return c.json({ error: "コースの削除中にエラーが発生しました" }, 500);
    }
  },
);
