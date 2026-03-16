import { prisma } from "@/lib/prisma";
import { zValidator } from "@hono/zod-validator";
import { $Enums } from "@prisma/client";
import { createFactory } from "hono/factory";
import type { Session } from "next-auth";
import { z } from "zod";
import { withSession } from "~/middleware/auth";

type Variables = {
  session: Session;
};

const factory = createFactory<{ Variables: Variables }>();

export const updateSubmission = factory.createHandlers(
  withSession,
  zValidator(
    "param",
    z.object({
      submission_id: z.string().cuid(),
    }),
  ),
  zValidator(
    "json",
    z.object({
      TestResult: z.array(
        z.object({
          testCaseId: z.string().cuid(),
          status: z.enum([
            $Enums.ResultStatus.AC,
            $Enums.ResultStatus.WA,
            $Enums.ResultStatus.TLE,
            $Enums.ResultStatus.RE,
            $Enums.ResultStatus.CE,
          ]),
          output: z.string(),
          error: z.string().optional(),
        }),
      ),
      score: z.number().min(0).max(100),
      status: z.enum(["PENDING", "EVALUATED"]),
    }),
  ),
  async (c) => {
    const { submission_id } = c.req.valid("param");
    const { TestResult, ...json } = c.req.valid("json");
    const session = c.get("session");

    try {
      const upsertTestResults = TestResult.map((result) => {
        return prisma.testResult.upsert({
          where: {
            submissionId_testCaseId: {
              submissionId: submission_id,
              testCaseId: result.testCaseId,
            },
          },
          create: {
            testCaseId: result.testCaseId,
            submissionId: submission_id,
            status: result.status,
            actualOutput: result.output,
            errorLog: result.error ?? null,
          },
          update: {
            status: result.status,
            actualOutput: result.output,
            errorLog: result.error ?? null,
          },
        });
      });
      await prisma.$transaction(upsertTestResults);

      const data = await prisma.submission.update({
        where: {
          id: submission_id,
          userId: session.user.role === "ADMIN" ? undefined : session.user.id,
        },
        data: json,
        include: {
          problem: true,
        },
      });

      // 初挑戦かどうか
      const isFirstSubmission =
        (await prisma.submission.count({
          where: {
            userId: session.user.id,
            problemId: data.problemId,
          },
        })) === 1;

      // course内の全ての問題が提出されたかどうか
      const isCompleted =
        (await prisma.problem.count({
          where: {
            courseId: data.problem.courseId,
            submissions: {
              some: {
                userId: session.user.id,
                status: "EVALUATED",
              },
            },
          },
        })) ===
        (await prisma.problem.count({
          where: {
            courseId: data.problem.courseId,
          },
        }));

      // ユーザープログレスの更新
      if (isFirstSubmission) {
        await prisma.userProgress.upsert({
          where: {
            userId_courseId: {
              userId: session.user.id,
              courseId: data.problem.courseId,
            },
          },
          create: {
            userId: session.user.id,
            courseId: data.problem.courseId,
            progress: 1,
          },
          update: {
            progress: { increment: 1 },
            isCompleted,
          },
        });
      }
      return c.json(data);
    } catch (error) {
      return c.json(
        {
          error: "提出内容の更新中にエラーが発生しました",
        },
        500,
      );
    }
  },
);
