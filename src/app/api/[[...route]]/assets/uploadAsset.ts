import { supabase } from "@/lib/supabase";
import { zValidator } from "@hono/zod-validator";
import { createFactory } from "hono/factory";
import type { Session } from "next-auth";
import { z } from "zod";
import { withSession } from "~/middleware/auth";

type Variables = {
  session: Session;
};

const factory = createFactory<{ Variables: Variables }>();

export const uploadAsset = factory.createHandlers(
  withSession,
  zValidator(
    "form",
    z.object({
      file: z.instanceof(File),
      fileName: z.string(),
      bucket: z.enum(["csv-tsv", "image", "pdf"]),
    }),
  ),
  async (c) => {
    try {
      const { file, fileName, bucket } = c.req.valid("form");
      if (!file) {
        return c.json({ error: "ファイルが見つかりません" }, 400);
      }

      // Supabase にアップロード
      const { error } = await supabase.storage.from(bucket).upload(fileName, file, {
        cacheControl: "3600",
        upsert: true,
      });

      if (error) {
        console.error(error);
        return c.json({ error: error.message }, 500);
      }

      // 公開 URL の取得
      const { data: publicUrlData } = supabase.storage.from(bucket).getPublicUrl(fileName);

      return c.json({ url: publicUrlData.publicUrl });
    } catch (error) {
      if (error instanceof Error) {
        return c.json({ error: error.message }, 500);
      }
      return c.json({ error: "Unknown error" }, 500);
    }
  },
);
