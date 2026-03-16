import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { client } from "@/lib/hono";
import { cookies } from "next/headers";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CourseListActions } from "./course-list-actions";

type CourseRow = {
  id: string;
  title: string;
  isPublic: boolean;
  _count: { problems: number };
};

export default async function ManageCoursesPage() {
  const cookieStore = await cookies();
  const allCookies = cookieStore.getAll();
  const headers: Record<string, string> = {};
  if (allCookies.length > 0) {
    headers.Cookie = allCookies.map((c) => `${c.name}=${c.value}`).join("; ");
  }

  const res = await client.api.courses.$get({}, { headers });
  if (!res.ok) {
    if (res.status === 403) return notFound();
    throw new Error("Failed to fetch courses");
  }
  const courses = (await res.json()) as CourseRow[];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold">コース一覧</h1>
        <Link href="/manage">
          <Button variant="outline">管理トップに戻る</Button>
        </Link>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>コース名</TableHead>
              <TableHead className="w-24">公開</TableHead>
              <TableHead className="w-24 text-right">問題数</TableHead>
              <TableHead className="w-64 text-right">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {courses.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                  コースがありません
                </TableCell>
              </TableRow>
            ) : (
              courses.map((course) => (
                <TableRow key={course.id}>
                  <TableCell className="font-medium">{course.title}</TableCell>
                  <TableCell>
                    <Badge variant={course.isPublic ? "default" : "secondary"}>
                      {course.isPublic ? "公開" : "非公開"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">{course._count?.problems ?? 0}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Link href={`/manage/courses/${course.id}`}>
                        <Button variant="outline" size="sm">
                          問題一覧
                        </Button>
                      </Link>
                      <CourseListActions courseId={course.id} courseTitle={course.title} />
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
