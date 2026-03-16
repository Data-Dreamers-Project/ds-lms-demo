"use client";

import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { signIn } from "next-auth/react";

export default function CTA() {
  return (
    <section
      id="cta"
      className="w-full flex flex-col items-center py-12 md:py-24 lg:py-32 bg-linear-to-br from-teal-500 to-blue-500"
    >
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center gap-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="space-y-2"
          >
            <h2 className="text-2xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none text-white">
              今すぐ始めよう
            </h2>
            <p className="mx-auto max-w-[700px] text-gray-200 md:text-xl">Somniで、必要な力を手に入れよう。</p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            viewport={{ once: true }}
            className="space-x-4"
          >
            <Button asChild size={"lg"} onClick={() => signIn("azure-ad-b2c", { callbackUrl: "/students" })}>
              無料で始める
            </Button>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
