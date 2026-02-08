"use client";

import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { client } from "@/lib/hono";
import type { InferResponseType } from "hono";
import { useRef, useState } from "react";
import { toast } from "sonner";

const gradeOptions = ["B1", "B2", "B3", "B4", "M1", "M2", "D1", "D2", "D3"] as const;

const GRADE_LABELS = [
  "学部1年",
  "学部2年",
  "学部3年",
  "学部4年",
  "修士1年",
  "修士2年",
  "博士1年",
  "博士2年",
  "博士3年",
] as const;

type Grade = (typeof gradeOptions)[number];

const groupOptions = ["行政", "金融", "LLM", "スポーツ", "マルチモーダル", "アプリ開発", "その他"] as const;

type Group = (typeof groupOptions)[number];

const req = client.api.users[":user_id"].$get;

type Props = {
  userId: string;
  data: InferResponseType<typeof req, 200>;
};

export default function ProfilePage({ userId, data }: Props) {
  const [name, setName] = useState(data.name ?? "");
  const [displayname, setDisplayName] = useState(data.displayName ?? "");
  const [grade, setGrade] = useState<Grade | "">(
    gradeOptions.includes(data.grade as Grade) ? (data.grade as Grade) : "",
  );
  const [group, setGroup] = useState<Group | "">(
    groupOptions.includes(data.group as Group) ? (data.group as Group) : "",
  );
  const [imageUrl, setImageUrl] = useState(data.image ?? "/logo.png");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [savedValues, setSavedValues] = useState({
    name,
    displayname,
    grade,
    group,
    imageUrl,
  });

  const isChanged =
    name !== savedValues.name ||
    displayname !== savedValues.displayname ||
    grade !== savedValues.grade ||
    group !== savedValues.group ||
    imageUrl !== savedValues.imageUrl;

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const toastId = toast.loading("アップロード中...");
    const file = event.target.files?.[0];
    if (!file) {
      toast.dismiss(toastId);
      return;
    }

    const filename = `${userId}/${Date.now()}`;
    const formData = new FormData();
    formData.append("file", file);
    formData.append("fileName", filename);
    formData.append("bucket", "image");

    try {
      const res = await client.api.assets.$post({
        form: {
          file: file,
          fileName: filename,
          bucket: "image",
        },
      });

      const result = await res.json();

      if (!res.ok) {
        toast.error("アップロードに失敗しました", {
          id: toastId,
        });
        return;
      }

      if ("url" in result) {
        // URLが含まれている場合
        setImageUrl(result.url);
        toast.success("アップロードが完了しました！", { id: toastId });
      } else {
        toast.error(`アップロードに失敗しました: + ${result.error}`, { id: toastId });
      }
    } catch (error) {
      console.error(error);
      toast.error("アップロード中にエラーが発生しました", {
        id: toastId,
      });
    }
  };

  const handleSave = async () => {
    const toastId = toast.loading("保存中...");
    const res = await client.api.users[":user_id"].$patch({
      param: { user_id: userId },
      json: {
        displayName: displayname,
        grade: grade === "" ? undefined : grade,
        group: group === "" ? undefined : group,
        image: imageUrl,
      },
    });

    if (!res.ok) {
      toast.error("保存に失敗しました", {
        id: toastId,
      });
      return;
    }

    setSavedValues({
      name,
      displayname,
      grade,
      group,
      imageUrl,
    });

    toast.success("プロフィールを保存しました！", {
      id: toastId,
    });
  };

  const handleReset = () => {
    // ★重要：ここも .current をすべて消しました！
    setName(savedValues.name);
    setDisplayName(savedValues.displayname);
    setGrade(savedValues.grade);
    setGroup(savedValues.group);
    setImageUrl(savedValues.imageUrl);
  };

  return (
    <div className="flex flex-col mx-10">
      <div className="border-b border-gray-300 mt-5">
        <h1 className="text-2xl font-bold mb-4">プロフィール設定</h1>
      </div>

      <div className="mt-10">
        <Label className="block font-semibold mb-2">アイコン</Label>
        <Avatar className="h-32 w-32 rounded-lg">
          <AvatarImage src={imageUrl} alt={name} className="cursor-pointer" onClick={handleAvatarClick} />
        </Avatar>
      </div>

      <Input type="file" accept="image/*" ref={fileInputRef} onChange={handleFileChange} hidden />

      <InputField id="displayname" label="表示名" value={displayname} onChange={setDisplayName} />
      <InputField id="name" label="名前" value={name} onChange={setName} />

      {/* 学年（Grade） */}
      <div className="mt-5">
        <Label htmlFor="grade" className="block font-semibold">
          学年
        </Label>
        <Select
          value={grade}
          onValueChange={(value) => {
            if (gradeOptions.includes(value as Grade)) {
              setGrade(value as Grade);
            }
          }}
        >
          <SelectTrigger className="border border-gray-300 p-2 rounded-md w-full">
            <SelectValue placeholder="選択してください" />
          </SelectTrigger>
          <SelectContent>
            {gradeOptions.map((g, index) => (
              <SelectItem key={g} value={g}>
                {GRADE_LABELS[index]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* 所属班 */}
      <div className="mt-5">
        <Label htmlFor="group" className="block font-semibold">
          所属班
        </Label>
        <Select
          value={group}
          onValueChange={(value) => {
            if (groupOptions.includes(value as Group)) {
              setGroup(value as Group);
            }
          }}
        >
          <SelectTrigger className="border border-gray-300 p-2 rounded-md w-full">
            <SelectValue placeholder="選択してください" />
          </SelectTrigger>
          <SelectContent>
            {groupOptions.map((g) => (
              <SelectItem key={g} value={g}>
                {g}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {isChanged && (
        <div className="w-fit p-2 rounded-md flex justify-end mt-10 gap-1 ml-auto">
          <Button onClick={handleReset} type="button" variant="outline">
            リセット
          </Button>
          <Button onClick={handleSave} type="submit" variant="default" className="bg-orange-500">
            保存
          </Button>
        </div>
      )}
    </div>
  );
}

function InputField({
  id,
  label,
  value,
  onChange,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (val: string) => void;
}) {
  return (
    <div className="mt-5">
      <Label htmlFor={id} className="block font-semibold">
        {label}
      </Label>
      <Input
        id={id}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="border border-gray-300 p-2 rounded-md w-full"
      />
    </div>
  );
}
