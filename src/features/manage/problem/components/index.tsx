"use client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import ThemeEditor from "@/components/ui/editor";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { MarkdownViewer } from "@/components/ui/markdown";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { client } from "@/lib/hono";
import { zodResolver } from "@hookform/resolvers/zod";
import type { InferResponseType } from "hono/client";
import { Plus, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useFieldArray, useForm } from "react-hook-form";
import { toast } from "sonner";
import type { z } from "zod";
import { formSchema } from "../types/schema";

const sampleProblemStatement = `入力例: 
長さ $N$ の正整数列 $A = (A_1, A_2, \ldots, A_N)$ が与えられます。
$A$ の奇数番目の要素の総和を求めてください。すなわち、$N$ 以下の最大の奇数を $m$ としたとき、
$A_1 + A_3 + A_5 + \ldots + A_m$ を求めてください。`;

const sampleConstraints = `入力例: 
- $1 \leq N \leq 10^5$
- $1 \leq A_i \leq 10^9$`;

const sampleInput = `5
1 2 3 4 5`;

const sampleDefaultCode = `入力例: 
# 問題文を参考にして、以下のコードを完成させてください。
A = list(map(int, input().split(",")))
`;

const difficultyLevels = [
  { value: 1, label: "簡単" },
  { value: 2, label: "普通" },
  { value: 3, label: "難しい" },
];

const req = client.api.problems[":problem_id"].$get;

type ProblemCreatorProps = {
  courseId: string;
  // 編集時のみ問題のデータを受け取る
  problem?: InferResponseType<typeof req, 200>;
};

export default function ProblemCreator({ courseId, problem }: ProblemCreatorProps) {
  const router = useRouter();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: problem
      ? {
          title: problem.title,
          description: problem.description,
          defaultCode: problem.defaultCode || "",
          difficultyLevel: problem.difficultyLevel,
          isPublic: problem.isPublic,
          isArchived: false,
          constraints: problem.constraints,
          testCases: problem.testCases.map((testCase) => ({
            id: testCase.id,
            input: testCase.input,
            output: testCase.output,
            isExample: testCase.isExample,
            isHidden: testCase.isHidden,
          })),
        }
      : {
          title: "",
          description: "",
          defaultCode: "",
          isPublic: false,
          isArchived: false,
          difficultyLevel: 1,
          constraints: "",
          testCases: [
            { input: "", output: "", isExample: true, isHidden: false },
            { input: "", output: "", isExample: false, isHidden: false },
          ],
        },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "testCases",
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    const toastId = toast.loading("問題を作成中...", {
      description: "しばらくお待ちください",
    });

    if (problem) {
      // 編集時
      const res = await client.api.problems[":problem_id"].$patch({
        param: {
          problem_id: problem.id,
        },
        json: {
          title: values.title,
          description: values.description,
          constraints: values.constraints || "",
          defaultCode: values.defaultCode,
          difficultyLevel: Number(values.difficultyLevel),
          timeLimit: problem.timeLimit,
          memoryLimit: problem.memoryLimit,
          isPublic: values.isPublic,
          isArchived: false,
          testCases: values.testCases.map((testCase) => ({
            id: testCase.id,
            input: testCase.input || "",
            output: testCase.output || "",
            isExample: testCase.isExample,
            isHidden: testCase.isHidden,
          })),
        },
      });

      if (res.ok) {
        toast.success("問題情報を更新しました", {
          description: "デバッグページに移動しますか？",
          id: toastId,
          action: {
            label: "移動する",
            onClick: () => {
              router.push(`/manage/problems/${problem.id}/debug`);
            },
          },
        });
      } else {
        console.error("問題の更新に失敗しました", res.status, await res.json());
        toast.error("問題の更新に失敗しました", {
          description: "もう一度お試しください",
          id: toastId,
          action: {
            label: "リトライ",
            onClick: () => {
              toast.dismiss(toastId);
              onSubmit(values);
            },
          },
        });
      }

      return;
    }
    // 新規作成時

    const res = await client.api.problems.$post({
      json: {
        title: values.title,
        description: values.description,
        constraints: values.constraints || "",
        defaultCode: values.defaultCode,
        difficultyLevel: Number(values.difficultyLevel),
        timeLimit: 3,
        memoryLimit: 1024,
        isPublic: values.isPublic,
        isArchived: false,
        courseId: courseId,
        testCases: values.testCases.map((testCase) => ({
          input: testCase.input || "",
          output: testCase.output || "",
          isExample: testCase.isExample,
          isHidden: testCase.isHidden,
        })),
      },
    });
    if (res.ok) {
      toast.success("問題を作成しました", {
        description: "問題の詳細ページに移動します",
        id: toastId,
      });

      // 1秒後にリダイレクト
      await new Promise((resolve) => setTimeout(resolve, 1000));
      const data = await res.json();
      router.push(`/manage/courses/${courseId}/${data.id}/debug`);
      return;
    }

    toast.error("問題の作成に失敗しました", {
      description: "もう一度お試しください",
      id: toastId,
      action: {
        label: "リトライ",
        onClick: () => {
          toast.dismiss(toastId);
          onSubmit(values);
        },
      },
    });
  }

  const problemStatementValue = form.getValues("description");
  const constraintsValue = form.getValues("constraints");

  return (
    <div className="container py-10 relative">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <div className="flex items-start justify-between gap-2">
            <h1 className="text-2xl font-bold mb-6">問題作成</h1>

            <FormField
              control={form.control}
              name="isPublic"
              render={({ field }) => (
                <FormItem className="flex flex-row items-end justify-between rounded-lg border p-3 gap-3 shadow-xs">
                  <div className="space-y-0.5">
                    <FormLabel>公開する</FormLabel>
                  </div>
                  <FormControl>
                    <Switch checked={field.value} onCheckedChange={field.onChange} className="mt-0" />
                  </FormControl>
                </FormItem>
              )}
            />
          </div>

          <div className="space-y-8">
            <div className="flex items-start justify-between gap-2">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem className="w-9/12">
                    <FormLabel>問題タイトル</FormLabel>
                    <FormControl>
                      <Input placeholder="例: 二分探索の実装" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="difficultyLevel"
                render={({ field }) => (
                  <FormItem className="w-2/12">
                    <FormLabel>難易度</FormLabel>
                    <Select onValueChange={(value) => field.onChange(Number(value))} defaultValue={String(field.value)}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a verified email to display" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {difficultyLevels.map((level) => (
                          <SelectItem key={level.value} value={String(level.value)}>
                            {level.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="space-y-6">
              <h2 className="text-xl font-semibold">問題文と制約</h2>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* 編集エリア */}
                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>問題文</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder={sampleProblemStatement}
                            className="min-h-[200px] font-mono"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>Markdown + KaTeX を使用できます</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="constraints"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>制約</FormLabel>
                        <FormControl>
                          <Textarea placeholder={sampleConstraints} className="min-h-[150px] font-mono" {...field} />
                        </FormControl>
                        <FormDescription>Markdown + KaTeX を使用できます</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* プレビューエリア */}
                <div>
                  <h3 className="text-lg font-medium mb-2">プレビュー</h3>
                  <Card>
                    <CardContent>
                      <div className="prose max-w-none dark:prose-invert">
                        <h2 className="text-2xl">問題文</h2>
                        <MarkdownViewer content={problemStatementValue} className="p-4" />

                        {constraintsValue && (
                          <>
                            <h2 className="text-2xl">制約</h2>
                            <MarkdownViewer content={constraintsValue} className="p-4" />
                          </>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h2 className="text-xl font-semibold">デフォルトコード</h2>
              <FormField
                control={form.control}
                name="defaultCode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>この入力が解答欄に最初から表示された状態で始まります。</FormLabel>
                    <FormControl>
                      <ThemeEditor
                        value={field.value}
                        onChange={field.onChange}
                        height="300px"
                        language="python"
                        defaultValue={sampleDefaultCode}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="space-y-4">
              <h2 className="text-xl font-semibold">テストケース</h2>

              <div className="space-y-6">
                {fields.map((field, index) => (
                  <Card key={field.id}>
                    <CardContent>
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-medium">テストケース {index + 1}</h3>
                        {fields.length > 2 && (
                          <Button type="button" variant="destructive" size="icon" onClick={() => remove(index)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>

                      <div className="grid gap-4">
                        <FormField
                          control={form.control}
                          name={`testCases.${index}.input`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>入力</FormLabel>
                              <FormControl>
                                <Textarea placeholder={sampleInput} className="font-mono" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name={`testCases.${index}.output`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>期待する出力</FormLabel>
                              <FormControl>
                                <Textarea placeholder="15" className="font-mono" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <div className="flex space-x-6">
                          <FormField
                            control={form.control}
                            name={`testCases.${index}.isExample`}
                            render={({ field }) => (
                              <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                                <FormControl>
                                  <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                                </FormControl>
                                <div className="space-y-1 leading-none">
                                  <FormLabel>サンプルケース</FormLabel>
                                  <FormDescription>評価前の挑戦中で表示されます。1つ以上必要</FormDescription>
                                </div>
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name={`testCases.${index}.isHidden`}
                            render={({ field }) => (
                              <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                                <FormControl>
                                  <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                                </FormControl>
                                <div className="space-y-1 leading-none">
                                  <FormLabel>隠しケース</FormLabel>
                                  <FormDescription>入力や期待する出力をユーザーに表示しない</FormDescription>
                                </div>
                              </FormItem>
                            )}
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}

                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={() => append({ input: "", output: "", isExample: false, isHidden: true })}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  テストケースを追加
                </Button>
              </div>
            </div>

            <div className="bottom-0 left-0 right-0 flex justify-end p-4 bg-white dark:bg-neutral-950">
              <Button type="submit" size="lg">
                問題を作成
              </Button>
            </div>
          </div>
        </form>
      </Form>
    </div>
  );
}
