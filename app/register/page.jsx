import Link from "next/link";
import { AuthForm } from "@/components/AuthForm";
import { Brand } from "@/components/Brand";

export default function RegisterPage() {
  return (
    <main className="min-h-screen px-5 py-6">
      <Brand />
      <div className="grid min-h-[78vh] place-items-center">
        <div className="w-full">
          <AuthForm mode="register" />
          <p className="mt-5 text-center text-sm text-white/60">Already playing? <Link className="font-bold text-abj-green" href="/login">Login</Link></p>
        </div>
      </div>
    </main>
  );
}
