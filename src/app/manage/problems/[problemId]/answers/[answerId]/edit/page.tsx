import { AnswerForm } from "@/features/manage/answer/components/answer-form";
import { client } from "@/lib/hono";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";

export default async function EditAnswerPage({
  params,
}: {
  params: Promise<{ problemId: string; answerId: string }>;
}) {
  const { problemId, answerId } = await params;
  const cookieStore = await cookies();
  const allCookies = cookieStore.getAll();
  const headers: Record<string, string> = {};
  if (allCookies.length > 0) {
    headers.Cookie = allCookies.map((c) => `${c.name}=${c.value}`).join("; ");
  }

  const res = await client.api.problems.answers[":answer_id"].$get({ param: { answer_id: answerId } }, { headers });
  if (res.status === 404) return notFound();
  if (!res.ok) throw new Error("Failed to fetch answer");
  const answer = await res.json();

  if (answer.problemId !== problemId) return notFound();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">模範解答を編集</h1>
        <p className="text-muted-foreground">{answer.title}</p>
      </div>
      <AnswerForm
        problemId={problemId}
        answer={{
          id: answer.id,
          title: answer.title,
          description: answer.description,
          code: answer.code,
          isPublic: answer.isPublic,
        }}
      />
    </div>
  );
}
