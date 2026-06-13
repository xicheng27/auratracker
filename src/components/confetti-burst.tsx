"use client";

// A short, self-contained confetti burst. Render it (keyed by a counter) when
// a big aura gain happens; it removes itself after the animation.
const PIECES = Array.from({ length: 14 }, (_, i) => i);
const SHADES = ["#ffffff", "#d4d4d8", "#a1a1aa"];

export function ConfettiBurst() {
  return (
    <div
      className="pointer-events-none absolute inset-x-0 -top-2 flex justify-center overflow-visible"
      aria-hidden
    >
      <div className="relative h-0 w-full max-w-[260px]">
        {PIECES.map((i) => {
          const left = (i / (PIECES.length - 1)) * 100;
          const delay = (i % 5) * 0.04;
          const drift = (i % 2 === 0 ? 1 : -1) * (4 + (i % 3) * 4);
          return (
            <span
              key={i}
              className="confetti-piece"
              style={{
                left: `${left}%`,
                marginLeft: `${drift}px`,
                background: SHADES[i % SHADES.length],
                animationDelay: `${delay}s`,
              }}
            />
          );
        })}
      </div>
    </div>
  );
}
