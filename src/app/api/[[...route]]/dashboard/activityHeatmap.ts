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

export const activityHeatmap = factory.createHandlers(
  withSession,
  zValidator(
    "query",
    z.object({
      user_id: z.string().cuid().optional(),
      from: z.string(),
      to: z.string(),
    }),
  ),
  async (c) => {
    const { user_id, from, to } = c.req.valid("query");
    const session = c.get("session");
    const userId = user_id || session?.user.id;

    try {
      // PrismaのgroupByを使って日付ごとに集計
      const groupedData = await prisma.submission.groupBy({
        by: ["createdAt"],
        where: {
          userId: userId,
          createdAt: {
            gte: from,
            lte: to,
          },
        },
        _count: {
          createdAt: true,
        },
      });

      // 日付部分のみ抽出して整形
      const data = groupedData.reduce(
        (acc, item) => {
          const date = item.createdAt.toISOString().split("T")[0];
          acc[date] = item._count.createdAt;
          return acc;
        },
        {} as Record<string, number>,
      );

      return c.json(data);
    } catch (error) {
      console.error("問題の取得中にエラーが発生しました:", error);
      return c.json({ error: "問題の取得中にエラーが発生しました" }, 500);
    }
  },
);
