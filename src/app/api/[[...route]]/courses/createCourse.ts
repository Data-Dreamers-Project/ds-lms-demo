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

export const createCourse = factory.createHandlers(
  withAdmin,
  zValidator(
    "json",
    z.object({
      title: z.string(),
      image: z.string().optional(),
      description: z.string().optional(),
      isPublic: z.boolean().optional(),
    }),
  ),
  async (c) => {
    const json = c.req.valid("json");

    try {
      const data = await prisma.course.create({
        data: {
          ...json,
        },
      });
      return c.json(data);
    } catch (error) {
      console.error("コースの作成中にエラーが発生しました:", error);
      return c.json({ error: "コースの作成中にエラーが発生しました" }, 500);
    }
  },
);
