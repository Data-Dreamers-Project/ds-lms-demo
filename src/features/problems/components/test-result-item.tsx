"use client";
import { Textarea } from "@/components/ui/textarea";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import type { ConvertDateToString } from "@/types/utils";
import type { TestResult } from "@prisma/client";
import { Copy, Info } from "lucide-react";
import { useEffect, useState } from "react";
import { useCopyToClipboard } from "usehooks-ts";
import type { TestResult as TestResultType } from "../types/index";
import { getStatusInfo } from "../utils";

interface TestResultItemProps {
  index: number;
  result: ConvertDateToString<TestResult> | TestResultType;
  testCase: {
    isHidden?: boolean;
    input: string;
    output: string;
  };
}

export function TestResultItem({ index, result, testCase }: TestResultItemProps) {
  const statusInfo = getStatusInfo(result.status);
  const [copiedText, copy] = useCopyToClipboard();
  const [isCopied, setIsCopied] = useState(false);

  useEffect(() => {
    if (isCopied) {
      const timer = setTimeout(() => setIsCopied(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [isCopied]);
  const handleCopy = (text: string) => {
    copy(text).then(() => setIsCopied(true));
  };

  return (
    <div className="rounded border p-3">
      <div className="flex items-center justify-between mb-2">
        <span className="flex items-center gap-2">
          <h3 className="text-sm font-medium">テストケース {index}</h3>
          {testCase.isHidden && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <Info className="h-4 w-4" />
                </TooltipTrigger>
                <TooltipContent>
                  このテストケースは、管理者によって 入力 及び 期待する出力 が非表示に設定されています。
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </span>
        <div className="flex items-center gap-1">
          <div className={`h-2 w-2 rounded-full ${statusInfo.color}`} />
          <span className={`text-xs font-medium ${statusInfo.text}`}>{statusInfo.label}</span>
        </div>
      </div>
      <div className="space-y-3">
        {testCase.isHidden || (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            <div className="space-y-1">
              <div className="text-xs font-medium">入力:</div>
              <pre className="text-xs bg-muted p-2 rounded overflow-auto max-h-20">{testCase.input}</pre>
            </div>
            <div className="space-y-1.5">
              <div className="text-xs font-medium">期待する出力:</div>
              <Textarea readOnly value={testCase.output} className="resize-y min-h-[40px] bg-muted text-xs" />
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          <div className="space-y-1">
            <div className="text-xs font-medium">実際の出力</div>
            <pre className="text-xs bg-muted p-2 rounded overflow-auto max-h-20">{result.actualOutput}</pre>
          </div>
          <div className="space-y-1">
            <div className="text-xs font-medium">エラー</div>
            <div className="relative group">
              <Textarea
                readOnly
                value={result.errorLog || ""}
                className="resize-y min-h-[80px] bg-muted text-xs pr-10"
              />
              <div className="absolute top-2 right-4">
                <button
                  type="button"
                  onClick={() => handleCopy(result.errorLog || "")}
                  className="flex items-center gap-1.5 px-2 py-1 text-[10px] bg-muted"
                >
                  {isCopied ? (
                    <>
                      <span className="text-green-600 font-medium">コピー完了</span>
                    </>
                  ) : (
                    <Copy className="h-3.5 w-3.5" />
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
