import { authOptions } from "@/lib/auth";
import { $Enums } from "@prisma/client";
import { createFactory } from "hono/factory";
import type { Session } from "next-auth";
import { getServerSession } from "next-auth";

type Variables = {
  session: Session | null;
};

const factory = createFactory<{ Variables: Variables }>();

/**
 * @function getSession
 * @description
 * セッション情報を取得し、コンテキストに設定するミドルウェア。
 * 次のミドルウェアを呼び出す前に、セッション情報を取得してコンテキストに保存します。
 *
 * @param c - Honoのコンテキストオブジェクト
 * @param next - 次のミドルウェアを呼び出すための関数
 */
export const getSession = factory.createMiddleware(async (c, next) => {
  const session = await getServerSession(authOptions);

  c.set("session", session);
  await next();
});

/**
 * @function withSession
 * @description
 * セッションが存在することを確認するミドルウェア。
 * セッションが存在しない場合は、401 Unauthorizedエラーを返します。
 * セッションが存在する場合は、コンテキストにセッション情報を設定し、次のミドルウェアを呼び出します。
 *
 * @param c - Honoのコンテキストオブジェクト
 * @param next - 次のミドルウェアを呼び出すための関数
 */
export const withSession = factory.createMiddleware(async (c, next) => {
  const session = await getServerSession(authOptions);

  if (!session) {
    return c.json({ error: "Unauthorized" }, 401);
  }
  c.set("session", session);
  await next();
});

/**
 * @function withAdmin
 * @description
 * 管理者権限を確認するミドルウェア。
 * セッションが存在しない場合は401 Unauthorizedエラーを返し、
 * セッションが存在してもユーザーの役割が管理者でない場合は403 Forbiddenエラーを返します。
 * 管理者権限が確認できた場合は、コンテキストにセッション情報を設定し、次のミドルウェアを呼び出します。
 *
 * @param c - Honoのコンテキストオブジェクト
 * @param next - 次のミドルウェアを呼び出すための関数
 */
export const withAdmin = factory.createMiddleware(async (c, next) => {
  const session = await getServerSession(authOptions);

  if (!session) {
    return c.json({ error: "Unauthorized" }, 401);
  }
  if (session.user.role !== $Enums.SystemRole.ADMIN) {
    return c.json({ error: "Forbidden" }, 403);
  }
  c.set("session", session);
  await next();
});
