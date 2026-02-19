import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { MarkdownViewer } from "@/components/ui/markdown";
import { Separator } from "@/components/ui/separator";
import { client } from "@/lib/hono";
import dayjs from "dayjs";
import { cookies } from "next/headers";
import Link from "next/link";
import { notFound } from "next/navigation";

export default async function ProblemDetail({ params }: { params: Promise<{ problemId: string }> }) {
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
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">{problem.title}</h1>
        <Link href={`/students/problems/${problemId}/answers`}>
          <Button variant="outline">解説を見る</Button>
        </Link>
      </div>
      <Separator className="my-6" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="space-y-2 md:col-span-2">
          <p>
            実行時間制限: {problem.timeLimit} sec / メモリ制限: {problem.memoryLimit} MB
          </p>
          <h2 className="text-2xl font-bold mb-6">問題文</h2>
          <MarkdownViewer content={problem.description} />

          <h2 className="text-2xl font-bold mb-6">制約</h2>
          <MarkdownViewer content={problem.constraints} />
          <div className="w-72 py-4">
            <Link href={`/students/problems/${problemId}/challenge`}>
              <Button className="w-full">挑戦する</Button>
            </Link>
          </div>
        </div>
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">挑戦履歴</CardTitle>
              <Separator className="my-2" />
              {problem.submissions.length > 0 ? (
                problem.submissions.map((submission) => (
                  <div key={submission.id} className="p-4 flex flex-col gap-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant="default">{submission.status}</Badge>
                      <p className="text-sm text-gray-500">{dayjs(submission.createdAt).format("YYYY/MM/DD HH:mm")}</p>
                    </div>
                    <p>
                      Score: {submission.status === "EVALUATED" ? `${submission.score}点` : "まだ評価されていません"}
                    </p>

                    <Link href={`/students/submissions/${submission.id}`}>
                      <Button variant="outline" className="mt-2 w-full">
                        詳細を見る
                      </Button>
                    </Link>
                  </div>
                ))
              ) : (
                <div className="p-4 text-center text-gray-500">
                  <p>まだ挑戦履歴はありません</p>
                </div>
              )}
            </CardHeader>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">関連する問題</CardTitle>
              <Separator className="my-2" />
              {/* TODO:  */}
              <div className="p-4 text-center text-gray-500">
                <p>Coming Soon...</p>
              </div>
            </CardHeader>
          </Card>
        </div>
      </div>
    </div>
  );
}
