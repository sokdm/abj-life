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
      <button className="soft-button w-full rounded-full px-6 py-3 font-black">
        NEW LIFE
      </button>
    </form>
  );
}

export default async function HomePage() {
  const userId = await getSessionUserId();

  return (
    <main className="relative grid min-h-screen place-items-center overflow-hidden px-5">
      <div className="absolute inset-0 city-grid opacity-30" />
      <div className="absolute left-1/2 top-20 h-80 w-[720px] -translate-x-1/2 rounded-full bg-sky-200/60 blur-3xl" />
      <div className="absolute bottom-10 left-1/2 h-72 w-[760px] -translate-x-1/2 rotate-45 rounded-[48px] border border-white/70 bg-gradient-to-br from-amber-100 to-emerald-100 shadow-2xl" />
      <div className="absolute bottom-36 left-[42%] h-24 w-40 rotate-45 rounded-[22px] bg-white/80 shadow-lg" />
      <div className="absolute bottom-48 right-[34%] h-28 w-28 rotate-45 rounded-[22px] bg-sky-100 shadow-lg" />
      <div className="relative z-10 w-full max-w-sm rounded-[32px] border border-slate-200 bg-white/95 p-6 text-center shadow-2xl">
        <div className="mx-auto grid h-16 w-16 place-items-center rounded-[18px] bg-emerald-400 font-black text-slate-900 shadow-glow">
          ABJ
        </div>
        <h1 className="mt-6 text-4xl font-black tracking-wide text-slate-900">ABJ LIFE STYLE</h1>
        <p className="mt-2 text-sm font-black text-emerald-600">Live your Abuja story.</p>
        {userId && (
          <div className="mx-auto mt-5 grid w-fit grid-cols-[48px_1fr] items-center gap-3 rounded-2xl bg-slate-50 px-4 py-3 text-left">
            <div className="grid h-12 w-12 place-items-center rounded-full bg-emerald-300 font-black">ABJ</div>
            <div>
              <p className="text-sm font-black text-slate-900">Welcome back</p>
              <p className="text-xs font-bold text-slate-500">Level ready · Nigeria time</p>
            </div>
          </div>
        )}

        <div className="mt-9 grid gap-3">
          {userId ? (
            <>
              <Link className="rounded-full bg-emerald-500 px-6 py-3 font-black text-white shadow-glow" href="/dashboard">
                CONTINUE LIFE
              </Link>
              <NewLifeButton />
            </>
          ) : (
            <>
              <Link className="rounded-full bg-emerald-500 px-6 py-3 font-black text-white shadow-glow" href="/register">
                CREATE ACCOUNT
              </Link>
              <Link className="soft-button rounded-full px-6 py-3 font-black" href="/login">
                LOGIN
              </Link>
            </>
          )}
        </div>
      </div>
    </main>
  );
}
