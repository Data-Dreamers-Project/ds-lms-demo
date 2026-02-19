import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { client } from "@/lib/hono";
import dayjs from "dayjs";
import { ArrowLeft } from "lucide-react";
import { cookies } from "next/headers";
import Link from "next/link";
import { notFound } from "next/navigation";

type ProblemRow = {
  id: string;
  title: string;
  isPublic: boolean;
  updatedAt: string;
};

export default async function ManageCourseDetailPage({
  params,
}: {
  params: Promise<{ courseId: string }>;
}) {
  const { courseId } = await params;
  const cookieStore = await cookies();
  const allCookies = cookieStore.getAll();
  const headers: Record<string, string> = {};
  if (allCookies.length > 0) {
    headers.Cookie = allCookies.map((c) => `${c.name}=${c.value}`).join("; ");
  }

  const res = await client.api.courses[":course_id"].$get({ param: { course_id: courseId } }, { headers });
  if (res.status === 404) return notFound();
  if (!res.ok) throw new Error("Failed to fetch course");
  const course = await res.json();
  const problems = (course.problems ?? []) as ProblemRow[];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6 flex flex-col gap-2">
        <Link
          href="/manage/courses"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          コース一覧に戻る
        </Link>
        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-2">
            <h1 className="text-2xl font-bold">{course.title}</h1>
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant={course.isPublic ? "default" : "secondary"}>{course.isPublic ? "公開" : "非公開"}</Badge>
              <p className="text-muted-foreground">問題一覧（{problems.length}件）</p>
            </div>
          </div>
          <Link href={`/manage/courses/${courseId}/edit`}>
            <Button variant="outline">コースを編集</Button>
          </Link>
        </div>
      </div>

      <div className="mb-4 flex justify-end">
        <Link href={`/manage/courses/${courseId}/new`}>
          <Button>新規問題を追加</Button>
        </Link>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>問題名</TableHead>
              <TableHead className="w-24">公開</TableHead>
              <TableHead className="w-40">更新日</TableHead>
              <TableHead className="w-64 text-right">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {problems.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                  このコースにはまだ問題がありません。「新規問題を追加」から作成してください。
                </TableCell>
              </TableRow>
            ) : (
              problems.map((problem) => (
                <TableRow key={problem.id}>
                  <TableCell className="font-medium">
                    <Link href={`/manage/problems/${problem.id}`} className="hover:underline">
                      {problem.title}
                    </Link>
                  </TableCell>
                  <TableCell>
                    <Badge variant={problem.isPublic ? "default" : "secondary"}>
                      {problem.isPublic ? "公開" : "非公開"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {dayjs(problem.updatedAt).format("YYYY/MM/DD HH:mm")}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Link href={`/manage/problems/${problem.id}/edit`}>
                        <Button variant="outline" size="sm">
                          編集
                        </Button>
                      </Link>
                      <Link href={`/manage/problems/${problem.id}/debug`}>
                        <Button variant="outline" size="sm">
                          デバッグ
                        </Button>
                      </Link>
                      <Link href={`/manage/problems/${problem.id}/answers`}>
                        <Button variant="outline" size="sm">
                          模範解答
                        </Button>
                      </Link>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
