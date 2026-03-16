import { client } from "@/lib/hono";
import type { InferResponseType } from "hono";

// 模範解答一覧 API レスポンスの型
const getAnswersReq = client.api.problems[":problem_id"].answers.$get;
export type AnswerListItem = InferResponseType<typeof getAnswersReq, 200>[number];

// 模範解答1件取得 API レスポンスの型
const getAnswerReq = client.api.problems.answers[":answer_id"].$get;
export type AnswerDetail = InferResponseType<typeof getAnswerReq, 200>;

// テストケース結果の型定義
export type TestResult = {
  id: string;
  index: number;
  status: "AC" | "WA" | "CE" | "RE" | "TLE";
  input: string;
  isHidden?: boolean;
  expectedOutput: string;
  actualOutput: string;
  errorLog: string | null;
};

// 実行履歴の型定義
export type ExecutionHistory = {
  id: number;
  timestamp: string; // hh:mm:ss
  results: TestResult[];
  isRunning: boolean;
  hasError: boolean;
};

// 結果ステータスの情報
export type StatusInfo = {
  color: string;
  text: string;
  label: string;
};
