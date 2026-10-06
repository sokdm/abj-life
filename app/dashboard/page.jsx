import { redirect } from "next/navigation";
import { Brand } from "@/components/Brand";
import { DashboardClient } from "@/components/DashboardClient";
import { connectDb } from "@/lib/db";
import { getSessionUserId } from "@/lib/auth";
import User from "@/models/User";
import { getPlayerForUser } from "@/services/playerService";
import { getWorldState } from "@/services/worldService";
import { getEconomyState } from "@/services/economyService";

export default async function DashboardPage() {
  const userId = await getSessionUserId();
  if (!userId) redirect("/login");

  await connectDb();
  const [user, player, world, economyState] = await Promise.all([
    User.findById(userId).lean(),
    getPlayerForUser(userId),
    getWorldState(userId),
    getEconomyState(userId)
  ]);
  if (!user || !player) redirect("/login");
  if (!player.character?.name) redirect("/character");

  return (
    <main className="min-h-screen px-5 py-6">
      <div className="mx-auto max-w-7xl">
        <Brand />
        <div className="mt-8">
          <DashboardClient
            initialPlayer={JSON.parse(JSON.stringify(player))}
            username={user.username}
            initialNotifications={JSON.parse(JSON.stringify(world.notifications))}
            initialTransactions={JSON.parse(JSON.stringify(world.transactions))}
            economyState={JSON.parse(JSON.stringify(economyState))}
          />
        </div>
      </div>
    </main>
  );
}
