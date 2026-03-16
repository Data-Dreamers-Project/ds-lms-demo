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

export const updateUser = factory.createHandlers(
  withSession,
  zValidator(
    "param",
    z.object({
      user_id: z.string().cuid(),
    }),
  ),
  zValidator(
    "json",
    z.object({
      name: z.string().optional(),
      displayName: z.string().optional(),
      grade: z.enum(["B1", "B2", "B3", "B4", "M1", "M2", "D1", "D2", "D3"]).optional(),
      group: z
        .enum(["行政", "金融", "LLM", "スポーツ", "マルチモーダル", "アプリ開発", "コンペ参加", "その他"])
        .optional(),
      image: z.string().optional(),
      role: z.enum(["USER", "ADMIN"]).optional(),
    }),
  ),
  async (c) => {
    const { user_id } = c.req.valid("param");
    const { image, name, displayName, grade, group, role } = c.req.valid("json");
    const session = c.get("session");
    const isAdmin = session?.user.role === "ADMIN";

    // ADMINでない場合、ユーザー自身の情報のみ更新可能
    if (!isAdmin && session?.user.id !== user_id) {
      return c.json({ error: "権限がありません" }, 403);
    }
    try {
      const data = await prisma.user.update({
        where: {
          id: user_id,
        },
        data: {
          // roleを変更できるのはADMINのみ
          role: isAdmin ? role : undefined,
          name,
          displayName,
          grade,
          image,
          group,
        },
      });

      if (!data) {
        return c.json({ error: "指定されたコースが見つかりませんでした" }, 404);
      }
      return c.json(data);
    } catch (error) {
      console.error("データの取得中にエラーが発生しました:", error);
      return c.json({ error: "データの取得中にエラーが発生しました" }, 500);
    }
  },
);
