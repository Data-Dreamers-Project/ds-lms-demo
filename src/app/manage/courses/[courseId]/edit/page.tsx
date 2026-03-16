import { CourseForm } from "@/features/manage/course/components/course-form";
import { client } from "@/lib/hono";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";

export default async function CourseEditPage({
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

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mx-auto max-w-2xl">
        <h1 className="mb-6 text-2xl font-bold">コースを編集</h1>
        <CourseForm course={course} />
      </div>
    </div>
  );
}
