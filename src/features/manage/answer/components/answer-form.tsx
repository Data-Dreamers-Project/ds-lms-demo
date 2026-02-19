"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import ThemeEditor from "@/components/ui/editor";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { MarkdownViewer } from "@/components/ui/markdown";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { client } from "@/lib/hono";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import type { z } from "zod";
import { answerFormSchema } from "../types/schema";

type AnswerFormProps = {
  problemId: string;
  answer?: {
    id: string;
    title: string;
    description: string;
    code: string;
    isPublic: boolean;
  };
};

export function AnswerForm({ problemId, answer }: AnswerFormProps) {
  const router = useRouter();
  const isEdit = !!answer;

  const form = useForm<z.infer<typeof answerFormSchema>>({
    resolver: zodResolver(answerFormSchema),
    defaultValues: answer
      ? {
          title: answer.title,
          description: answer.description,
          code: answer.code,
          isPublic: answer.isPublic,
        }
      : {
          title: "",
          description: "",
          code: "",
          isPublic: true,
        },
  });

  const descriptionValue = form.watch("description");

  async function onSubmit(values: z.infer<typeof answerFormSchema>) {
    const toastId = toast.loading(isEdit ? "更新中..." : "作成中...");

    if (isEdit && answer) {
      const answerId = answer.id;
      const res = await client.api.problems.answers[":answer_id"].$patch({
        param: { answer_id: answerId },
        json: values,
      });
      if (res.ok) {
        toast.success("模範解答を更新しました", { id: toastId });
        router.push(`/manage/problems/${problemId}/answers`);
        router.refresh();
      } else {
        toast.error("更新に失敗しました", { id: toastId });
      }
    } else {
      const res = await client.api.problems[":problem_id"].answers.$post({
        param: { problem_id: problemId },
        json: values,
      });
      if (res.ok) {
        toast.success("模範解答を作成しました", { id: toastId });
        router.push(`/manage/problems/${problemId}/answers`);
        router.refresh();
      } else {
        toast.error("作成に失敗しました", { id: toastId });
      }
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>タイトル</FormLabel>
              <FormControl>
                <Input placeholder="例: 解説（想定解）" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="isPublic"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div>
                <FormLabel>公開する</FormLabel>
              </div>
              <FormControl>
                <Switch checked={field.value} onCheckedChange={field.onChange} />
              </FormControl>
            </FormItem>
          )}
        />

        <div className="grid gap-6 lg:grid-cols-2">
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>解説（Markdown）</FormLabel>
                <FormControl>
                  <Textarea placeholder="考え方・解説を記述..." className="min-h-[200px] font-mono" {...field} />
                </FormControl>
                <FormDescription>Markdown + KaTeX が使えます</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <div>
            <p className="mb-2 text-sm font-medium">プレビュー</p>
            <Card>
              <CardContent className="pt-4">
                <MarkdownViewer content={descriptionValue || "*（未入力）*"} />
              </CardContent>
            </Card>
          </div>
        </div>

        <FormField
          control={form.control}
          name="code"
          render={({ field }) => (
            <FormItem>
              <FormLabel>コード</FormLabel>
              <FormControl>
                <div className="h-[300px] w-full rounded-md border">
                  <ThemeEditor
                    height="300px"
                    language="python"
                    value={field.value}
                    onChange={(v) => field.onChange(v ?? "")}
                  />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex gap-2">
          <Button type="submit">{isEdit ? "更新する" : "作成する"}</Button>
          <Button type="button" variant="outline" onClick={() => router.push(`/manage/problems/${problemId}/answers`)}>
            キャンセル
          </Button>
        </div>
      </form>
    </Form>
  );
}
