import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import ProblemCard from "@/features/courses/[courseId]/components/card-content";
import { authOptions } from "@/lib/auth";
import { client } from "@/lib/hono";
import { getServerSession } from "next-auth";
import { cookies } from "next/headers";
import Image from "next/image";
import { notFound } from "next/navigation";

export default async function ProblemList({ params }: { params: Promise<{ courseId: string }> }) {
  const cookieStore = await cookies();
  const allCookies = cookieStore.getAll();
  const headers: Record<string, string> = {};
  if (allCookies.length > 0) {
    headers.Cookie = allCookies.map((c) => `${c.name}=${c.value}`).join("; ");
  }
  const { courseId } = await params;
  const res = await client.api.courses[":course_id"].$get(
    { param: { course_id: courseId } },
    {
      headers,
    },
  );

  if (!res.ok) {
    notFound();
  }

  const course = await res.json();
  const session = await getServerSession(authOptions);
  const userProblems = course.problems.map((problem) => ({
    ...problem,
    submissions: problem.submissions.filter((s) => s.userId === session?.user.id),
  }));
  const progress = userProblems.filter((problem) => problem.submissions.length > 0).length;
  const totalProblems = userProblems.length;

  return (
    <>
      <header className="flex h-16 items-center gap-2 ease-linear bg-primary/20 dark:bg-primary/40">
        <div className="flex items-center gap-2 px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <h2 className="text-2xl font-bold">{course.title}</h2>
        </div>
      </header>

      <div className="space-y-6 container mx-auto px-4 py-8">
        <h2 className="text-sm font-bold">問題集の進捗状況</h2>
        <div className="flex flex-row items-center space-x-4">
          <p className="text-center min-w-36 text-xl font-bold">
            {progress} / {totalProblems}問
          </p>
          <Image src={"/students/courses/AskingAQuestion2.svg"} alt="AskingAQuestion2" width={96} height={102} />
          <Progress value={totalProblems === 0 ? 0 : (progress / totalProblems) * 100} />
          <Image src={"/students/courses/BeingVip.svg"} alt="BeingVip" width={105} height={102} />
        </div>
        {userProblems.map((problem) => (
          <ProblemCard key={problem.id} problem={problem} />
        ))}
      </div>
    </>
  );
}
