import { AnswerForm } from "@/features/manage/answer/components/answer-form";
import { client } from "@/lib/hono";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";

export default async function NewAnswerPage({
  params,
}: {
  params: Promise<{ problemId: string }>;
}) {
  const { problemId } = await params;
  const cookieStore = await cookies();
  const allCookies = cookieStore.getAll();
  const headers: Record<string, string> = {};
  if (allCookies.length > 0) {
    headers.Cookie = allCookies.map((c) => `${c.name}=${c.value}`).join("; ");
  }

  const res = await client.api.problems[":problem_id"].$get({ param: { problem_id: problemId } }, { headers });
  if (res.status === 404) return notFound();
  if (!res.ok) throw new Error("Failed to fetch problem");
  const problem = await res.json();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">模範解答を追加</h1>
        <p className="text-muted-foreground">問題: {problem.title}</p>
      </div>
      <AnswerForm problemId={problemId} />
    </div>
  );
}
