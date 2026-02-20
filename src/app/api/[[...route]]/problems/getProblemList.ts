import { prisma } from "@/lib/prisma";
import { zValidator } from "@hono/zod-validator";
import { createFactory } from "hono/factory";
import { z } from "zod";

const factory = createFactory();

export const getProblemList = factory.createHandlers(
  zValidator(
    "query",
    z.object({
      search: z.string().optional(),
      difficulty: z.array(z.number()).optional(),
      createdById: z.string().optional(),
      updatedById: z.string().optional(),
    }),
  ),
  async (c) => {
    try {
      const data = await prisma.problem.findMany({
        include: {
          course: {
            select: { id: true, title: true },
          },
        },
      });
      return c.json(data);
    } catch (error) {
      console.error("問題の取得中にエラーが発生しました:", error);
      return c.json({ error: "問題の取得中にエラーが発生しました" }, 500);
    }
  },
);
