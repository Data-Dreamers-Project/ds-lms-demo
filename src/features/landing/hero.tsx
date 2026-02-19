"use client";

import { Button } from "@/components/ui/button";
import { FlipWords } from "@/components/ui/flip-words";
import { signIn } from "next-auth/react";

const words = ["In somnis esne?", "Somnia tua germinantne?", "Somnia tua perficisne?"];

export default function Hero() {
  return (
    <section className="min-h-[calc(100vh-250px)] w-full flex flex-col justify-center items-center py-12 md:py-24 lg:py-32 xl:py-48 bg-linear-to-r from-purple-600 to-blue-600">
      <div className="w-full container px-4 md:px-6">
        <div className="flex flex-col items-center space-y-4 text-center">
          <div className="space-y-8">
            <span>
              <h1 className="text-2xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none text-white">
                <FlipWords words={words} className="text-white" duration={5000} />
              </h1>
            </span>
            <p className="mx-auto max-w-[700px] text-gray-200 md:text-xl">あなたはデータサイエンスの夢を見ますか？</p>
            <div className="space-x-4">
              <Button
                variant="default"
                size={"lg"}
                onClick={() => signIn("azure-ad-b2c", { callbackUrl: "/students" })}
              >
                無料で始める
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
