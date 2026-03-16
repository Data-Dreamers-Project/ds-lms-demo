"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";
import { Clock, Mail, RefreshCw, Settings, Wrench } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

type MaintenanceProps = {
  startedTime?: string;
  estimatedEndTime?: string;
};

const calculateProgress = (startedTime?: string, estimatedEndTime?: string): number => {
  if (!startedTime || !estimatedEndTime) return 0;
  const start = new Date(startedTime).getTime();
  const end = new Date(estimatedEndTime).getTime();
  const now = Date.now();
  if (Number.isNaN(start) || Number.isNaN(end) || end <= start) return 0;
  const percent = Math.min(100, Math.max(0, ((now - start) / (end - start)) * 100));
  return percent;
};

export default function Maintenance({ startedTime, estimatedEndTime }: MaintenanceProps) {
  const router = useRouter();
  const progressPercent = calculateProgress(startedTime, estimatedEndTime);

  return (
    <div className="min-h-screen bg-linear-to-br from-background via-secondary/20 to-primary/10 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="w-full max-w-md mx-auto"
      >
        <Card className="border-2 border-primary/20 shadow-lg bg-card/80 backdrop-blur-xs">
          <CardContent className="p-6 space-y-4">
            {/* Icon Animation */}
            <div className="flex justify-center">
              <motion.div
                animate={{
                  rotate: 360,
                }}
                transition={{
                  duration: 8,
                  repeat: Number.POSITIVE_INFINITY,
                  ease: "linear",
                }}
                className="relative"
              >
                <Settings className="h-16 w-16 text-primary" aria-hidden="true" />
                <motion.div
                  className="absolute -top-1 -right-1"
                  animate={{
                    scale: [1, 1.2, 1],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Number.POSITIVE_INFINITY,
                    ease: "easeInOut",
                  }}
                >
                  <Wrench className="h-6 w-6 text-primary" />
                </motion.div>
              </motion.div>
            </div>

            {/* Main Title */}
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              transition={{
                type: "spring",
                stiffness: 200,
                damping: 10,
              }}
              className="text-center"
            >
              <h1 className="text-2xl md:text-4xl font-bold text-foreground">メンテナンス中</h1>
            </motion.div>

            {/* Description */}
            <p className="text-center text-muted-foreground">
              現在、システムのメンテナンスを行っております。
              <br />
              ご不便をおかけして申し訳ございません。
            </p>

            {/* Estimated Time */}
            <div className="bg-secondary/50 rounded-lg p-3 border border-primary/20">
              <div className="flex items-center justify-center gap-2 text-foreground">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{
                    duration: 8,
                    repeat: Number.POSITIVE_INFINITY,
                    ease: "linear",
                  }}
                >
                  <Clock className="h-4 w-4 text-primary" />
                </motion.div>
                <span className="font-medium text-sm">
                  {estimatedEndTime ? `推定終了時刻: ${estimatedEndTime}` : "終了時刻は未定です"}
                </span>
              </div>
            </div>

            {/* Progress bar */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1, duration: 0.6 }}
              className="space-y-2"
            >
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>進捗状況</span>
                {progressPercent.toFixed(0)}%
              </div>
              <div className="w-full bg-secondary rounded-full h-3 overflow-hidden">
                <motion.div
                  className="h-full bg-linear-to-r from-primary to-primary/80 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${progressPercent.toFixed(0)}%` }}
                  transition={{
                    duration: 2,
                    ease: "easeOut",
                    delay: 1.2,
                  }}
                />
              </div>
            </motion.div>

            {/* Buttons */}
            <div className="flex justify-center gap-3 pt-2">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link href="/contact" className="w-full">
                  <Button variant="outline" size="sm" className="flex items-center gap-2">
                    <Mail className="h-3 w-3" />
                    お問い合わせ
                  </Button>
                </Link>
              </motion.div>

              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  variant="default"
                  size="sm"
                  className="flex items-center gap-2"
                  onClick={() => router.refresh()}
                >
                  <RefreshCw className="h-3 w-3" />
                  更新
                </Button>
              </motion.div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
