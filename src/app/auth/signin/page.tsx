import SigninButton from "@/app/auth/signin/signinButton";
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";

// Dead Code
export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const session = await getServerSession(authOptions);
  const params = await searchParams;
  // ログイン済みの場合はリダイレクト
  if (session?.user) {
    if (typeof params.callbackUrl === "string") {
      redirect(params.callbackUrl);
    } else if (typeof params.callbackUrl === "object") {
      redirect(params.callbackUrl[0]);
    }
    redirect("/students");
  }

  return (
    <div className="flex min-h-screen">
      <div className="relative hidden w-1/2 lg:block">
        <Image
          src="/red-ink-on-yellow-and-blue.jpg"
          alt="Signin page image"
          fill
          sizes="50vw"
          priority
          style={{ objectFit: "cover" }}
        />
      </div>
      <div className="flex w-full items-center justify-center lg:w-1/2">
        <div className="w-full max-w-md space-y-8 px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="mt-6 text-2xl font-extrabold text-gray-900">Sign in to your account</h2>
          </div>
          <div className="flex flex-col space-y-4">
            <SigninButton provider="azure-ad">
              <svg width="16" height="16" aria-hidden="true">
                <rect x="0" y="0" width="6" height="6" fill="#F25022" />
                <rect x="0" y="8" width="6" height="6" fill="#00A4EF" />
                <rect x="8" y="0" width="6" height="6" fill="#7FBA00" />
                <rect x="8" y="8" width="6" height="6" fill="#FFB900" />
              </svg>
              Sign in with Microsoft
            </SigninButton>
            {/* TODO: Add Other Provider */}
            {/* <SigninButton provider="github">Sign in with GitHub</SigninButton> */}
          </div>
          <div className="text-balance text-center text-xs text-muted-foreground [&_a]:underline [&_a]:underline-offset-4 hover:[&_a]:text-primary">
            By clicking continue, you agree to our <Link href="/terms">Terms of Service</Link> and{" "}
            <Link href="/privacy">Privacy Policy</Link>.
          </div>
        </div>
      </div>
    </div>
  );
}
