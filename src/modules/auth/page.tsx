import { Suspense } from "react";
import Link from "next/link";
import { LoginForm } from "./components/login-form";

export default function LoginPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-muted/30 px-4 py-10">
      <Suspense fallback={<div className="h-80 w-full max-w-md rounded-xl bg-card" />}>
        <LoginForm />
      </Suspense>

      <p className="mt-6 text-sm text-muted-foreground">
        <Link href="/" className="underline-offset-4 hover:underline">
          Back to store
        </Link>
      </p>
    </div>
  );
}
