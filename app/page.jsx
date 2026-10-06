import Link from "next/link";
import { redirect } from "next/navigation";
import { getSessionUserId } from "@/lib/auth";

async function NewLifeButton() {
  async function logout() {
    "use server";
    const { clearSessionCookie } = await import("@/lib/auth");
    await clearSessionCookie();
    redirect("/register");
  }

  return (
    <form action={logout}>
      <button className="w-full rounded border border-white/15 px-6 py-3 font-black text-white/85">
        NEW LIFE
      </button>
    </form>
  );
}

export default async function HomePage() {
  const userId = await getSessionUserId();

  return (
    <main className="relative grid min-h-screen place-items-center overflow-hidden px-5">
      <div className="absolute inset-0 city-grid opacity-20" />
      <div className="absolute inset-x-0 bottom-0 mx-auto h-56 max-w-3xl rounded-t-[80px] border border-white/10 bg-black/25" />
      <div className="relative z-10 w-full max-w-sm text-center">
        <div className="mx-auto grid h-16 w-16 place-items-center rounded bg-abj-green font-black text-abj-night shadow-glow">
          ABJ
        </div>
        <h1 className="mt-6 text-4xl font-black tracking-wide">WELCOME</h1>
        <p className="mt-2 text-sm font-bold uppercase tracking-[0.28em] text-abj-gold">
          ABJ LIFE STYLE
        </p>

        <div className="mt-9 grid gap-3">
          {userId ? (
            <>
              <Link className="rounded bg-abj-green px-6 py-3 font-black text-abj-night shadow-glow" href="/dashboard">
                CONTINUE LIFE
              </Link>
              <NewLifeButton />
            </>
          ) : (
            <>
              <Link className="rounded bg-abj-green px-6 py-3 font-black text-abj-night shadow-glow" href="/login">
                LOGIN
              </Link>
              <Link className="rounded border border-white/15 px-6 py-3 font-black text-white/85" href="/register">
                CREATE ACCOUNT
              </Link>
            </>
          )}
        </div>
      </div>
    </main>
  );
}
