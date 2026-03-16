"use client";

import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { client } from "@/lib/hono";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import type { z } from "zod";
import { courseFormSchema } from "../types/schema";

type CourseFormProps = {
  course?: {
    id: string;
    title: string;
    description: string | null;
    isPublic: boolean;
  };
};

export function CourseForm({ course }: CourseFormProps) {
  const router = useRouter();
  const isEdit = !!course;

  const form = useForm<z.infer<typeof courseFormSchema>>({
    resolver: zodResolver(courseFormSchema),
    defaultValues: course
      ? {
          title: course.title,
          description: course.description || "",
          isPublic: course.isPublic,
        }
      : {
          title: "",
          description: "",
          isPublic: false,
        },
  });

  async function onSubmit(values: z.infer<typeof courseFormSchema>) {
    const toastId = toast.loading(isEdit ? "更新中..." : "作成中...");

    if (isEdit && course) {
      const res = await client.api.courses[":course_id"].$patch({
        param: { course_id: course.id },
        json: values,
      });

      if (!res.ok) {
        toast.error("更新に失敗しました", { id: toastId });
        return;
      }

      toast.success("コースを更新しました", { id: toastId });
      router.push(`/manage/courses/${course.id}`);
      router.refresh();
    } else {
      const res = await client.api.courses.$post({
        json: values,
      });

      if (!res.ok) {
        toast.error("作成に失敗しました", { id: toastId });
        return;
      }

      const created = await res.json();
      toast.success("コースを作成しました", { id: toastId });
      router.push(`/manage/courses/${created.id}`);
      router.refresh();
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
              <FormLabel>コース名</FormLabel>
              <FormControl>
                <Input placeholder="例: Python基礎" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>説明</FormLabel>
              <FormControl>
                <Textarea placeholder="コースの説明を入力してください" {...field} />
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

        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={() => router.back()}>
            キャンセル
          </Button>
          <Button type="submit">{isEdit ? "更新" : "作成"}</Button>
        </div>
      </form>
    </Form>
  );
}
