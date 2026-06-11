import Link from "next/link";
import { AuraLogo } from "@/components/aura-logo";

type PreviewPost = {
  username: string;
  timeAgo: string;
  title: string;
  description: string;
  auraChange: number;
  ratioLabel: string;
  comments: number;
  float?: "normal" | "delayed";
};

const previewPosts: PreviewPost[] = [
  {
    username: "jayden",
    timeAgo: "2h",
    title: "Accidentally called my teacher bro.",
    description: "I was asking a question and said “bro wait” without thinking.",
    auraChange: -34,
    ratioLabel: "72% said aura lost",
    comments: 41,
    float: "normal",
  },
  {
    username: "lucas",
    timeAgo: "5h",
    title: "Hit a game winner in basketball today.",
    description: "Buzzer beater from the three-point line. Whole court went silent.",
    auraChange: 88,
    ratioLabel: "91% said aura gained",
    comments: 67,
    float: "delayed",
  },
  {
    username: "isaac",
    timeAgo: "8h",
    title: "Waved back at someone who wasn’t waving at me.",
    description: "They were waving at the person behind me. I committed to the wave anyway.",
    auraChange: -22,
    ratioLabel: "64% said aura lost",
    comments: 28,
    float: "normal",
  },
];

function PostPreviewCard({ post }: { post: PreviewPost }) {
  const gained = post.auraChange >= 0;
  return (
    <article
      className={`rounded-2xl border border-edge bg-card p-5 shadow-[0_0_40px_-12px] shadow-accent/20 transition-colors hover:bg-card-hover ${
        post.float === "delayed" ? "aura-float-delayed" : "aura-float"
      }`}
    >
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-accent/20 text-sm font-semibold text-accent-soft">
          {post.username[0].toUpperCase()}
        </div>
        <div className="text-sm">
          <span className="font-medium">@{post.username}</span>
          <span className="text-muted"> · {post.timeAgo} ago</span>
        </div>
      </div>

      <h3 className="mt-4 font-semibold leading-snug">“{post.title}”</h3>
      <p className="mt-1.5 text-sm leading-relaxed text-muted">{post.description}</p>

      <div className="mt-4 flex gap-2">
        <button
          type="button"
          className="flex-1 rounded-xl border border-positive/30 bg-positive/10 py-2 text-sm font-semibold text-positive transition-colors hover:bg-positive/20"
        >
          + Aura
        </button>
        <button
          type="button"
          className="flex-1 rounded-xl border border-negative/30 bg-negative/10 py-2 text-sm font-semibold text-negative transition-colors hover:bg-negative/20"
        >
          − Aura
        </button>
      </div>

      <div className="mt-4 flex items-center justify-between text-sm">
        <span className={`font-semibold ${gained ? "text-positive" : "text-negative"}`}>
          {gained ? "+" : ""}
          {post.auraChange} aura
        </span>
        <span className="text-muted">{post.ratioLabel}</span>
      </div>

      <div className="mt-3 flex gap-4 border-t border-edge pt-3 text-xs text-muted">
        <span>💬 {post.comments} comments</span>
        <span>↗ Share</span>
      </div>
    </article>
  );
}

const steps = [
  {
    emoji: "📝",
    title: "Post your moment",
    body: "One public post a day. A win, an L, or something you can’t explain. No filters, no pressure.",
  },
  {
    emoji: "⚖️",
    title: "The people vote",
    body: "Everyone decides: aura gained or aura lost. Your score moves with the vote ratio.",
  },
  {
    emoji: "👑",
    title: "Build your aura",
    body: "Climb from NPC Energy to Main Character. Start private groups and judge your friends too.",
  },
];

export default function LandingPage() {
  return (
    <main className="relative flex-1 overflow-hidden">
      {/* Background glow */}
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        <div className="absolute -top-40 left-1/2 h-130 w-130 -translate-x-1/2 rounded-full bg-accent/15 blur-3xl" />
        <div className="absolute top-1/2 -left-40 h-100 w-100 rounded-full bg-accent/10 blur-3xl" />
        <div className="absolute -right-40 bottom-0 h-100 w-100 rounded-full bg-accent/10 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-6xl px-6">
        {/* Header */}
        <header className="flex items-center justify-between py-6">
          <AuraLogo />
          <nav className="flex items-center gap-3">
            <Link
              href="/login"
              className="rounded-xl px-4 py-2 text-sm font-medium text-muted transition-colors hover:text-foreground"
            >
              Log in
            </Link>
            <Link
              href="/signup"
              className="rounded-xl bg-accent px-4 py-2 text-sm font-semibold transition-colors hover:bg-accent-soft"
            >
              Sign up
            </Link>
          </nav>
        </header>

        {/* Hero */}
        <section className="flex flex-col items-center pt-16 pb-20 text-center sm:pt-24">
          <span className="rounded-full border border-accent/30 bg-accent/10 px-4 py-1.5 text-xs font-medium text-accent-soft">
            ✦ The daily aura check
          </span>
          <h1 className="mt-6 max-w-3xl text-4xl font-bold tracking-tight sm:text-6xl">
            Did you gain aura today?
          </h1>
          <p className="mt-5 max-w-xl text-lg leading-relaxed text-muted">
            Post your daily moment — the win, the fail, the unexplainable — and
            let the world decide if you gained or lost aura.
          </p>

          <div className="mt-9 flex flex-col items-center gap-3 sm:flex-row">
            <Link
              href="/signup"
              className="w-full rounded-2xl bg-accent px-8 py-3.5 text-base font-semibold shadow-[0_0_30px_-5px] shadow-accent/60 transition-all hover:bg-accent-soft hover:shadow-accent/80 sm:w-auto"
            >
              Start tracking your aura
            </Link>
            <Link
              href="/login"
              className="w-full rounded-2xl border border-edge bg-card px-8 py-3.5 text-base font-semibold transition-colors hover:bg-card-hover sm:w-auto"
            >
              Log in
            </Link>
          </div>
          <Link
            href="/feed"
            className="mt-4 text-sm text-muted underline-offset-4 transition-colors hover:text-foreground hover:underline"
          >
            Continue as guest →
          </Link>
        </section>

        {/* Preview cards */}
        <section className="pb-20">
          <p className="mb-6 text-center text-sm font-medium tracking-widest text-muted uppercase">
            The court of public opinion is in session
          </p>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {previewPosts.map((post) => (
              <PostPreviewCard key={post.username} post={post} />
            ))}
          </div>
        </section>

        {/* How it works */}
        <section className="pb-20">
          <h2 className="text-center text-2xl font-bold tracking-tight sm:text-3xl">
            How it works
          </h2>
          <div className="mt-10 grid gap-5 sm:grid-cols-3">
            {steps.map((step) => (
              <div
                key={step.title}
                className="rounded-2xl border border-edge bg-card p-6"
              >
                <div className="text-3xl">{step.emoji}</div>
                <h3 className="mt-4 font-semibold">{step.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">{step.body}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Private mode teaser */}
        <section className="pb-20">
          <div className="overflow-hidden rounded-3xl border border-edge bg-card p-8 sm:p-12">
            <div className="grid items-center gap-10 lg:grid-cols-2">
              <div>
                <span className="rounded-full border border-accent/30 bg-accent/10 px-3 py-1 text-xs font-medium text-accent-soft">
                  Private groups
                </span>
                <h2 className="mt-4 text-2xl font-bold tracking-tight sm:text-3xl">
                  Your friend group, but with consequences.
                </h2>
                <p className="mt-3 leading-relaxed text-muted">
                  Make a private group, post aura incidents about yourself — or
                  about your friends. The group votes, the leaderboard never
                  lies, and somebody is always in aura debt.
                </p>
                <Link
                  href="/signup"
                  className="mt-6 inline-block rounded-2xl bg-accent px-6 py-3 text-sm font-semibold transition-colors hover:bg-accent-soft"
                >
                  Create your group
                </Link>
              </div>

              <div className="rounded-2xl border border-edge bg-background p-5">
                <p className="text-sm text-muted">
                  Posted by <span className="text-foreground">@lucas</span> ·
                  Target: <span className="text-accent-soft">@jayden</span>
                </p>
                <p className="mt-3 font-medium">
                  “Jayden missed the MRT because he was doing a fit check.”
                </p>
                <div className="mt-4 flex items-center justify-between text-sm">
                  <span className="font-semibold text-negative">−22 aura</span>
                  <span className="text-muted">74% said aura lost</span>
                </div>
                <div className="mt-4 space-y-2 border-t border-edge pt-4 text-sm">
                  <p className="font-medium text-muted">Group leaderboard</p>
                  {[
                    { name: "Lucas", score: "+420" },
                    { name: "Jayden", score: "+300" },
                    { name: "Joash", score: "−180" },
                  ].map((row, i) => (
                    <div key={row.name} className="flex justify-between">
                      <span>
                        <span className="text-muted">{i + 1}.</span> {row.name}
                      </span>
                      <span
                        className={
                          row.score.startsWith("+")
                            ? "font-semibold text-positive"
                            : "font-semibold text-negative"
                        }
                      >
                        {row.score} aura
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="pb-24 text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Your aura won’t track itself.
          </h2>
          <p className="mx-auto mt-3 max-w-md text-muted">
            One post a day. Infinite judgement. Join before your friends start
            posting about you.
          </p>
          <Link
            href="/signup"
            className="mt-8 inline-block rounded-2xl bg-accent px-10 py-4 text-base font-semibold shadow-[0_0_40px_-5px] shadow-accent/60 transition-all hover:bg-accent-soft hover:shadow-accent/80"
          >
            Sign up free
          </Link>
        </section>

        {/* Footer */}
        <footer className="flex flex-col items-center justify-between gap-4 border-t border-edge py-8 text-sm text-muted sm:flex-row">
          <AuraLogo />
          <p>© {new Date().getFullYear()} Aura Tracker. Judge responsibly.</p>
        </footer>
      </div>
    </main>
  );
}
