import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import Image from "next/image";
import Link from "next/link";

export default function CoursesCarouselCard({
  id,
  title,
  description,
  achievementLevel,
  maxAchievementLevel,
}: { id: string; title: string; description: string; achievementLevel: number; maxAchievementLevel: number }) {
  const progressValue = (achievementLevel / maxAchievementLevel) * 100;

  return (
    <Card className="w-full max-w-[255px] shadow-md rounded-t-2xl mb-11 p-0 overflow-hidden">
      <div className="relative w-full h-[184px]">
        <Image src={"/courseLogo.webp"} alt={title} fill className="object-cover" />
      </div>

      <CardHeader className="pl-3 pb-2 pt-2">
        <CardTitle className="text-lg font-semibold leading-tight truncate">{title}</CardTitle>
        <CardDescription className="text-sm text-gray-500 leading-normal">{description}</CardDescription>
      </CardHeader>

      <CardContent className="flex flex-col gap-2">
        {/* プログレスバー */}
        <div className="w-full flex items-center justify-between">
          <Progress value={progressValue} className="h-2 bg-gray-200 w-full" />
          <p className="min-w-[50px] max-w-[70px] text-[9px] text-right text-gray-500 ml-2">
            {achievementLevel} / {maxAchievementLevel} 完了
          </p>
        </div>

        {/* コース開始ボタン */}
        <div className="w-full flex justify-center mt-2">
          <Link href={`/students/courses/${id}`} className="rounded-md shadow-md">
            <Button>はじめる</Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
