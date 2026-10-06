import Link from "next/link";
import { AuthForm } from "@/components/AuthForm";
import { Brand } from "@/components/Brand";

export default function LoginPage() {
  return (
    <main className="min-h-screen px-5 py-6">
      <Brand />
      <div className="grid min-h-[78vh] place-items-center">
        <div className="w-full">
          <AuthForm mode="login" />
          <p className="mt-5 text-center text-sm text-white/60">New here? <Link className="font-bold text-abj-green" href="/register">Create an account</Link></p>
        </div>
      </div>
    </main>
  );
}
