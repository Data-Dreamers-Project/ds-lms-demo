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
import { client } from "@/lib/hono";
import dayjs from "dayjs";
import { cookies } from "next/headers";
import Link from "next/link";
import { notFound } from "next/navigation";

export default async function ProblemAnswersPage({
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
  const answers = await answersRes.json();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6 flex flex-col gap-2">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href={`/students/problems/${problemId}`}>{problem.title}</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>模範解答一覧</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <h1 className="text-3xl font-bold">模範解答一覧</h1>
        <p className="text-muted-foreground">問題: {problem.title}</p>
      </div>

      {answers.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center gap-4 py-12">
            <p className="text-muted-foreground">この問題にはまだ模範解答がありません。</p>
            <Link href={`/students/problems/${problemId}`}>
              <Button variant="outline">問題に戻る</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <ul className="grid gap-4 md:grid-cols-2">
          {answers.map((answer) => (
            <li key={answer.id}>
              <Link href={`/students/problems/${problemId}/answers/${answer.id}`}>
                <Card className="transition-colors hover:bg-muted/50">
                  <CardHeader>
                    <CardTitle className="text-lg">{answer.title}</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      {dayjs(answer.updatedAt).format("YYYY/MM/DD HH:mm")}
                    </p>
                  </CardHeader>
                  <CardContent>
                    <p className="line-clamp-2 text-sm text-muted-foreground">
                      {answer.description.replace(/#+/g, "").trim().slice(0, 100)}
                      {answer.description.length > 100 ? "…" : ""}
                    </p>
                  </CardContent>
                </Card>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
