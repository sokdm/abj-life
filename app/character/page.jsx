import { redirect } from "next/navigation";
import { getSessionUserId } from "@/lib/auth";
import { Brand } from "@/components/Brand";
import { CharacterForm } from "@/components/CharacterForm";

export default async function CharacterPage() {
  const userId = await getSessionUserId();
  if (!userId) redirect("/login");

  return (
    <main className="min-h-screen px-5 py-6">
      <Brand />
      <section className="mx-auto mt-10 max-w-6xl">
        <CharacterForm />
      </section>
    </main>
  );
}
