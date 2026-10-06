import Link from "next/link";

export function Brand() {
  return (
    <Link href="/" className="flex items-center gap-3">
      <span className="grid h-10 w-10 place-items-center rounded bg-abj-green font-black text-abj-night">ABJ</span>
      <span>
        <span className="block text-lg font-black tracking-wide">ABJ Life Style</span>
        <span className="block text-xs text-white/55">Abuja life simulator</span>
      </span>
    </Link>
  );
}
