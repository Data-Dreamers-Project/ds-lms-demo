import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { client } from "@/lib/hono";
import { ArrowLeft, FileCode, FileEdit, Play } from "lucide-react";
import { cookies } from "next/headers";
import Link from "next/link";
import { notFound } from "next/navigation";

export default async function ManageProblemDetailPage({
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

  const answersRes = await client.api.problems[":problem_id"].answers.$get(
    { param: { problem_id: problemId } },
    { headers },
  );
  const answers = answersRes.ok ? await answersRes.json() : [];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6 flex flex-col gap-2">
        <Link
          href={problem.course ? `/manage/courses/${problem.course.id}` : "/manage/courses"}
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          {problem.course ? `${problem.course.title} の問題一覧に戻る` : "コース一覧に戻る"}
        </Link>
        <h1 className="text-2xl font-bold">{problem.title}</h1>
        <div className="flex flex-wrap gap-2">
          <Badge variant={problem.isPublic ? "default" : "secondary"}>{problem.isPublic ? "公開" : "非公開"}</Badge>
          {problem.course && <Badge variant="outline">コース: {problem.course.title}</Badge>}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Link href={`/manage/problems/${problemId}/edit`}>
          <Card className="transition-colors hover:bg-muted/50">
            <CardHeader className="flex flex-row items-center gap-2">
              <FileEdit className="h-6 w-6" />
              <CardTitle className="text-xl">問題を編集</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">問題文・制約・テストケース・公開設定を編集</p>
            </CardContent>
          </Card>
        </Link>

        <Link href={`/manage/problems/${problemId}/debug`}>
          <Card className="transition-colors hover:bg-muted/50">
            <CardHeader className="flex flex-row items-center gap-2">
              <Play className="h-6 w-6" />
              <CardTitle className="text-xl">デバッグ</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">コード実行・提出テスト</p>
            </CardContent>
          </Card>
        </Link>

        <Link href={`/manage/problems/${problemId}/answers`} className="md:col-span-2">
          <Card className="transition-colors hover:bg-muted/50">
            <CardHeader className="flex flex-row items-center justify-between">
              <div className="flex flex-row items-center gap-2">
                <FileCode className="h-6 w-6" />
                <CardTitle className="text-xl">模範解答（解説）</CardTitle>
              </div>
              <span className="text-sm text-muted-foreground">{answers.length}件</span>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">模範解答の一覧・追加・編集・削除</p>
              <Button variant="secondary" className="mt-2">
                模範解答を管理
              </Button>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  );
}
