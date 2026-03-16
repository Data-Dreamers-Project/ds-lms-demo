import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import ThemeEditor from "@/components/ui/editor";
import { MarkdownViewer } from "@/components/ui/markdown";
import { client } from "@/lib/hono";
import { cookies } from "next/headers";
import Link from "next/link";
import { notFound } from "next/navigation";

export default async function AnswerDetailPage({
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
    <div className="container mx-auto flex flex-col gap-6 px-4 py-8">
      <div className="flex flex-col gap-2">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href={`/students/problems/${problemId}`}>{answer.problem.title}</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href={`/students/problems/${problemId}/answers`}>模範解答一覧</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{answer.title}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <h1 className="text-2xl font-bold">{answer.title}</h1>
      </div>

      {answer.description && (
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">解説</CardTitle>
          </CardHeader>
          <CardContent>
            <MarkdownViewer content={answer.description} className="p-4" />
          </CardContent>
        </Card>
      )}

      <Card className="flex flex-col">
        <CardHeader>
          <CardTitle className="text-xl">コード</CardTitle>
        </CardHeader>
        <CardContent className="flex-1 overflow-hidden p-4">
          <div className="h-[400px] w-full">
            <ThemeEditor
              className="h-full w-full"
              defaultValue={answer.code}
              language="python"
              options={{ readOnly: true }}
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-wrap gap-2">
        <Link href={`/students/problems/${problemId}/answers`}>
          <Button variant="outline">一覧に戻る</Button>
        </Link>
        <Link href={`/students/problems/${problemId}`}>
          <Button variant="outline">問題に戻る</Button>
        </Link>
      </div>
    </div>
  );
}
