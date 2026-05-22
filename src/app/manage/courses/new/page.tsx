import { CourseForm } from "@/features/manage/course/components/course-form";

export default function CourseNewPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mx-auto max-w-2xl">
        <h1 className="mb-6 text-2xl font-bold">コースを新規作成</h1>
        <CourseForm />
      </div>
    </div>
  );
}
