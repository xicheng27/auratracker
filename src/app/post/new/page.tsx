"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { BottomNav, TopNav } from "@/components/app-nav";

const categories = [
  "Social",
  "School",
  "Work",
  "Sports",
  "Relationship",
  "Funny",
  "Embarrassing",
  "Random",
  "Major aura gain",
  "Major aura loss",
];

const TITLE_MAX = 80;
const DESCRIPTION_MAX = 280;

export default function CreatePublicPostPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [titleError, setTitleError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Placeholder until the daily-post check comes from the database.
  const hasPostedToday = false;

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (imagePreview) URL.revokeObjectURL(imagePreview);
    setImagePreview(URL.createObjectURL(file));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) {
      setTitleError("Give your moment a title. The people need context.");
      return;
    }
    setSubmitting(true);
    // TODO: create the post via the backend, enforcing one post per day.
    router.push("/feed");
  }

  if (hasPostedToday) {
    return (
      <>
        <TopNav />
        <main className="mx-auto w-full max-w-2xl flex-1 px-4 pt-5 pb-32">
          <div className="rounded-3xl border border-edge bg-card p-8 text-center">
            <p className="text-4xl">⏳</p>
            <h1 className="mt-4 text-xl font-bold tracking-tight">
              You’ve already posted today
            </h1>
            <p className="mx-auto mt-2 max-w-sm text-sm text-muted">
              One public aura moment per day — that’s the rule. Come back
              tomorrow, or go judge everyone else in the meantime.
            </p>
            <Link
              href="/feed"
              className="mt-6 inline-block rounded-2xl bg-accent px-6 py-3 text-sm font-semibold text-background transition-colors hover:bg-accent-soft"
            >
              Back to the feed
            </Link>
          </div>
        </main>
        <BottomNav />
      </>
    );
  }

  return (
    <>
      <TopNav />
      <main className="mx-auto w-full max-w-2xl flex-1 px-4 pt-5 pb-32">
        <h1 className="text-xl font-bold tracking-tight">
          Today’s aura moment
        </h1>
        <p className="mt-1 text-sm text-muted">
          One post per day. Make it count — the world decides if you gained or
          lost aura.
        </p>

        <form onSubmit={handleSubmit} noValidate className="mt-5 space-y-5">
          {/* Title */}
          <div className="rounded-2xl border border-edge bg-card p-5">
            <label htmlFor="title" className="block text-sm font-medium">
              Title
            </label>
            <input
              id="title"
              type="text"
              maxLength={TITLE_MAX}
              placeholder="Accidentally called my teacher bro."
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                setTitleError(null);
              }}
              aria-invalid={!!titleError}
              className={`mt-1.5 w-full rounded-xl border bg-background px-4 py-2.5 text-sm outline-none transition-colors placeholder:text-muted/60 focus:border-accent ${
                titleError ? "border-negative/60" : "border-edge"
              }`}
            />
            <div className="mt-1.5 flex items-center justify-between text-xs">
              <span className="text-negative">{titleError}</span>
              <span className="text-muted">
                {title.length}/{TITLE_MAX}
              </span>
            </div>

            <label
              htmlFor="description"
              className="mt-3 block text-sm font-medium"
            >
              What happened?{" "}
              <span className="font-normal text-muted">(optional)</span>
            </label>
            <textarea
              id="description"
              rows={4}
              maxLength={DESCRIPTION_MAX}
              placeholder="Set the scene. Details decide votes."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="mt-1.5 w-full resize-none rounded-xl border border-edge bg-background px-4 py-2.5 text-sm outline-none transition-colors placeholder:text-muted/60 focus:border-accent"
            />
            <p className="mt-1 text-right text-xs text-muted">
              {description.length}/{DESCRIPTION_MAX}
            </p>
          </div>

          {/* Category */}
          <div className="rounded-2xl border border-edge bg-card p-5">
            <p className="text-sm font-medium">
              Category <span className="font-normal text-muted">(optional)</span>
            </p>
            <div className="mt-2.5 flex flex-wrap gap-2">
              {categories.map((c) => {
                const selected = category === c;
                return (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setCategory(selected ? null : c)}
                    aria-pressed={selected}
                    className={`rounded-full border px-3.5 py-1.5 text-sm transition-colors ${
                      selected
                        ? "border-accent bg-foreground font-semibold text-background"
                        : "border-edge bg-background text-muted hover:border-accent/50 hover:text-foreground"
                    }`}
                  >
                    {c}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Image */}
          <div className="rounded-2xl border border-edge bg-card p-5">
            <p className="text-sm font-medium">
              Photo evidence{" "}
              <span className="font-normal text-muted">(optional)</span>
            </p>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
            />
            {imagePreview ? (
              <div className="relative mt-2.5 overflow-hidden rounded-xl border border-edge">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={imagePreview}
                  alt="Post attachment preview"
                  className="max-h-72 w-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => {
                    URL.revokeObjectURL(imagePreview);
                    setImagePreview(null);
                    if (fileInputRef.current) fileInputRef.current.value = "";
                  }}
                  className="absolute top-2 right-2 rounded-full bg-background/80 px-3 py-1 text-xs font-medium backdrop-blur transition-colors hover:bg-background"
                >
                  Remove
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="mt-2.5 flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-edge py-8 text-sm text-muted transition-colors hover:border-accent/50 hover:text-foreground"
              >
                + Add a photo
              </button>
            )}
          </div>

          {/* Visibility + submit */}
          <div className="flex items-center justify-between rounded-2xl border border-edge bg-card p-5">
            <div className="text-sm">
              <p className="font-medium">Visibility</p>
              <p className="mt-0.5 text-xs text-muted">
                Public · everyone can vote for 24 hours
              </p>
            </div>
            <span className="rounded-full border border-edge px-3 py-1 text-xs font-medium">
              🌍 Public
            </span>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-2xl bg-accent py-3.5 text-sm font-semibold text-background shadow-[0_0_30px_-8px] shadow-accent/60 transition-all hover:bg-accent-soft disabled:opacity-60"
          >
            {submitting ? "Posting…" : "Post it. No takebacks."}
          </button>
        </form>
      </main>
      <BottomNav />
    </>
  );
}
