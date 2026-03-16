import ProgrammingInterface from "@/features/problems/components/programming-interface";
import { client } from "@/lib/hono";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";

export default async function ({ params }: { params: Promise<{ problemId: string }> }) {
  const { problemId } = await params;
  const cookieStore = await cookies();
  const allCookies = cookieStore.getAll();
  const headers: Record<string, string> = {};
  if (allCookies.length > 0) {
    headers.Cookie = allCookies.map((c) => `${c.name}=${c.value}`).join("; ");
  }
  const res = await client.api.problems[":problem_id"].$get(
    {
      param: { problem_id: problemId },
      query: { includeExamplesOnly: "true" },
    },
    {
      headers,
    },
  );

  if (res.status === 404) return notFound();
  if (!res.ok) throw new Error("Failed to fetch problem");
  const problem = await res.json();

  return <ProgrammingInterface problem={problem} />;
}
