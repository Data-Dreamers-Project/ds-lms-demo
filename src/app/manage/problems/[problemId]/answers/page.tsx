import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { client } from "@/lib/hono";
import dayjs from "dayjs";
import { ArrowLeft } from "lucide-react";
import { cookies } from "next/headers";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AnswerListActions } from "./answer-list-actions";

type AnswerRow = {
  id: string;
  title: string;
  description: string;
  isPublic: boolean;
  updatedAt: string;
};

export default async function ManageProblemAnswersPage({
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

  const [problemRes, answersRes] = await Promise.all([
    client.api.problems[":problem_id"].$get({ param: { problem_id: problemId } }, { headers }),
    client.api.problems[":problem_id"].answers.$get({ param: { problem_id: problemId } }, { headers }),
  ]);

  if (problemRes.status === 404) return notFound();
  if (!problemRes.ok) throw new Error("Failed to fetch problem");
  if (!answersRes.ok) throw new Error("Failed to fetch answers");

  const problem = await problemRes.json();
  const answers = (await answersRes.json()) as AnswerRow[];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6 flex flex-col gap-2">
        <Link
          href={`/manage/problems/${problemId}`}
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          {problem.title} に戻る
        </Link>
        <h1 className="text-2xl font-bold">模範解答（解説）</h1>
        <p className="text-muted-foreground">問題: {problem.title}</p>
      </div>

      <div className="mb-4 flex justify-end">
        <Link href={`/manage/problems/${problemId}/answers/new`}>
          <Button>新規追加</Button>
        </Link>
      </div>

      {answers.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            <p>この問題にはまだ模範解答がありません。</p>
            <Link href={`/manage/problems/${problemId}/answers/new`}>
              <Button className="mt-4">最初の模範解答を追加</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>タイトル</TableHead>
                <TableHead className="max-w-[200px]">解説（抜粋）</TableHead>
                <TableHead className="w-24">公開</TableHead>
                <TableHead className="w-40">更新日</TableHead>
                <TableHead className="w-40 text-right">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {answers.map((answer) => (
                <TableRow key={answer.id}>
                  <TableCell className="font-medium">
                    <Link href={`/manage/problems/${problemId}/answers/${answer.id}/edit`} className="hover:underline">
                      {answer.title}
                    </Link>
                  </TableCell>
                  <TableCell className="max-w-[200px] truncate text-muted-foreground text-sm">
                    {answer.description.replace(/#+/g, "").trim().slice(0, 80)}
                    {answer.description.length > 80 ? "…" : ""}
                  </TableCell>
                  <TableCell>
                    <Badge variant={answer.isPublic ? "default" : "secondary"}>
                      {answer.isPublic ? "公開" : "非公開"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {dayjs(answer.updatedAt).format("YYYY/MM/DD HH:mm")}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Link href={`/manage/problems/${problemId}/answers/${answer.id}/edit`}>
                        <Button variant="outline" size="sm">
                          編集
                        </Button>
                      </Link>
                      <AnswerListActions problemId={problemId} answerId={answer.id} answerTitle={answer.title} />
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
