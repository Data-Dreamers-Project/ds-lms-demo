import ProblemCreator from "@/features/manage/problem/components";
import { client } from "@/lib/hono";
import { notFound } from "next/navigation";

export default async function ProblemEditPage({ params }: { params: Promise<{ problemId: string }> }) {
  const { problemId } = await params;
  const res = await client.api.problems[":problem_id"].$get({ param: { problem_id: problemId } });

  if (res.status === 404) return notFound();
  if (!res.ok) throw new Error("Failed to fetch problem");
  const problem = await res.json();

  // courseIdを取得する必要がある場合は、problemから取得するか、別途APIを呼び出す
  const courseId = problem.courseId || "";

  return (
    <div className="p-4 flex justify-center">
      <ProblemCreator courseId={courseId} problem={problem} />
    </div>
  );
}
