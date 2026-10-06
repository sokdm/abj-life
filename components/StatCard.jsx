export function StatCard({ label, value, tone = "green" }) {
  const tones = {
    green: "text-abj-green",
    gold: "text-abj-gold",
    sky: "text-abj-sky",
    coral: "text-abj-coral"
  };

  return (
    <div className="game-card rounded-lg p-4">
      <p className="text-xs uppercase tracking-[0.18em] text-white/45">{label}</p>
      <p className={`mt-2 text-2xl font-black ${tones[tone]}`}>{value}</p>
    </div>
  );
}
