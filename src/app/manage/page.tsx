import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileQuestion } from "lucide-react";
import Link from "next/link";

export default function ManageTopPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-8 text-2xl font-bold">管理トップ</h1>
      <div className="grid gap-4 md:grid-cols-2">
        <Link href="/manage/courses">
          <Card className="transition-colors hover:bg-muted/50">
            <CardHeader className="flex flex-row items-center gap-2">
              <FileQuestion className="h-8 w-8" />
              <CardTitle>コース管理</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">コース一覧とその下にある問題の一覧・編集・模範解答の管理</p>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  );
}
