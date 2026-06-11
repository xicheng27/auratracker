import Link from "next/link";

export function AuraLogo({ href }: { href?: string }) {
  const logo = (
    <span className="flex items-center gap-2.5">
      <span className="relative flex h-9 w-9 items-center justify-center">
        <span className="absolute inset-0 rounded-full bg-accent/40 blur-md aura-pulse" />
        <span className="relative flex h-9 w-9 items-center justify-center rounded-full border border-accent/50 bg-card text-lg">
          ✦
        </span>
      </span>
      <span className="text-lg font-semibold tracking-tight">
        Aura<span className="text-accent-soft">Tracker</span>
      </span>
    </span>
  );

  if (href) {
    return (
      <Link href={href} className="inline-flex">
        {logo}
      </Link>
    );
  }
  return logo;
}
