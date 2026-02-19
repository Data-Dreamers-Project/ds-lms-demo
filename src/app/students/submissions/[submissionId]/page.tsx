import { Card, CardContent, CardTitle } from "@/components/ui/card";
import ThemeEditor from "@/components/ui/editor";
import EvaluationResultContainer from "@/features/problems/components/evaluation-result";
import { TestResultItem } from "@/features/problems/components/test-result-item";
import { client } from "@/lib/hono";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";

export default async function ({ params }: { params: Promise<{ submissionId: string }> }) {
  const { submissionId } = await params;
  const cookieStore = await cookies();
  const allCookies = cookieStore.getAll();
  const headers: Record<string, string> = {};
  if (allCookies.length > 0) {
    headers.Cookie = allCookies.map((c) => `${c.name}=${c.value}`).join("; ");
  }
  const res = await client.api.submissions[":submission_id"].$get(
    {
      param: { submission_id: submissionId },
    },
    { headers },
  );

  if (400 <= res.status && res.status < 500) return notFound();
  if (!res.ok) {
    const errorData = await res.json();
    console.error(res.status, errorData);
    throw new Error("Failed to fetch submission");
  }
  const submission = await res.json();

  return (
    <div className="flex flex-col gap-4 p-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{submission.problem.title}</h1>
        <span className="text-xl font-semibold">
          {submission.status === "PENDING" ? "" : submission.score != null ? `${submission.score} 点` : ""}
        </span>
      </div>
      <Card className="p-4 h-[300px] flex flex-col">
        <CardTitle className="text-lg font-bold">提出されたコード</CardTitle>
        <CardContent className="flex-1 overflow-hidden p-4">
          <ThemeEditor
            className="w-full h-full"
            defaultValue={submission.code}
            language={"python"}
            options={{
              readOnly: true,
            }}
          />
        </CardContent>
      </Card>
      {submission.status === "PENDING" ? (
        <EvaluationResultContainer submission={submission} />
      ) : (
        <>
          {submission.TestResult.map((result, index) => (
            <TestResultItem key={result.id} index={index + 1} result={result} testCase={result.testCase} />
          ))}
        </>
      )}
    </div>
  );
}
