"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AuraLogo } from "@/components/aura-logo";
import { FormField } from "@/components/form-field";
import { uploadImage } from "@/lib/api";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

const auraTypes = [
  { label: "Mysterious", emoji: "🌫️" },
  { label: "Chaotic", emoji: "🌀" },
  { label: "Main character", emoji: "🎬" },
  { label: "NPC", emoji: "🧍" },
  { label: "Villain arc", emoji: "🃏" },
  { label: "Golden retriever", emoji: "🐶" },
];

type Errors = Partial<{ displayName: string; username: string }>;

function validate(form: { displayName: string; username: string }): Errors {
  const errors: Errors = {};
  if (!form.displayName.trim()) {
    errors.displayName = "Display name is required.";
  } else if (form.displayName.trim().length > 30) {
    errors.displayName = "Keep it under 30 characters.";
  }
  if (!form.username.trim()) {
    errors.username = "Username is required.";
  } else if (!/^[a-z0-9_]{3,20}$/i.test(form.username.trim())) {
    errors.username = "3–20 characters, letters, numbers, and underscores only.";
  }
  return errors;
}

export default function OnboardingPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [form, setForm] = useState({ displayName: "", username: "", bio: "" });
  const [auraType, setAuraType] = useState<string | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [errors, setErrors] = useState<Errors>({});
  const [submitting, setSubmitting] = useState(false);

  function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (avatarPreview) URL.revokeObjectURL(avatarPreview);
    setAvatarPreview(URL.createObjectURL(file));
    setAvatarFile(file);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const nextErrors = validate(form);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setSubmitting(true);

    const supabase = getSupabaseBrowserClient();
    if (supabase) {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        let avatarUrl: string | null = null;
        if (avatarFile) {
          const upload = await uploadImage("avatars", avatarFile);
          if (upload.error) {
            setErrors({ displayName: upload.error });
            setSubmitting(false);
            return;
          }
          avatarUrl = upload.url ?? null;
        }
        const { error } = await supabase
          .from("profiles")
          .update({
            display_name: form.displayName.trim(),
            username: form.username.trim(),
            bio: form.bio.trim(),
            ...(avatarUrl ? { profile_image_url: avatarUrl } : {}),
            updated_at: new Date().toISOString(),
          })
          .eq("id", user.id);
        if (error) {
          setErrors({
            username: error.message.includes("unique")
              ? "That username is taken."
              : error.message,
          });
          setSubmitting(false);
          return;
        }
      }
    }
    router.push("/feed");
  }

  const initial =
    form.displayName.trim()[0]?.toUpperCase() ??
    form.username.trim()[0]?.toUpperCase() ??
    "?";

  return (
    <main className="relative flex flex-1 items-center justify-center overflow-hidden px-6 py-12">
      {/* Background glow */}
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        <div className="absolute -top-40 left-1/2 h-130 w-130 -translate-x-1/2 rounded-full bg-accent/15 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 h-100 w-100 rounded-full bg-accent/10 blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">
        <div className="flex justify-center">
          <AuraLogo href="/" />
        </div>

        <div className="mt-8 rounded-3xl border border-edge bg-card p-8 shadow-[0_0_60px_-20px] shadow-accent/30">
          <h1 className="text-2xl font-bold tracking-tight">Set up your aura</h1>
          <p className="mt-1.5 text-sm text-muted">
            This is how the world will see you when they judge you.
          </p>

          <form onSubmit={handleSubmit} noValidate className="mt-6 space-y-5">
            {/* Avatar picker */}
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="group relative flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-full border border-edge bg-background transition-colors hover:border-accent/50"
                aria-label="Upload profile picture"
              >
                {avatarPreview ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={avatarPreview}
                    alt="Profile preview"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span className="text-2xl font-semibold text-muted group-hover:text-foreground">
                    {initial}
                  </span>
                )}
                <span className="absolute inset-x-0 bottom-0 bg-foreground/90 py-0.5 text-center text-[10px] font-medium text-background opacity-0 transition-opacity group-hover:opacity-100">
                  Edit
                </span>
              </button>
              <div className="text-sm">
                <p className="font-medium">Profile picture</p>
                <p className="mt-0.5 text-xs text-muted">
                  Optional. Faces with aura preferred.
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  className="hidden"
                />
              </div>
            </div>

            <FormField
              label="Display name"
              type="text"
              name="displayName"
              placeholder="Xi Cheng"
              autoComplete="name"
              value={form.displayName}
              onChange={(e) => {
                setForm((p) => ({ ...p, displayName: e.target.value }));
                setErrors((p) => ({ ...p, displayName: undefined }));
              }}
              error={errors.displayName}
            />
            <FormField
              label="Username"
              type="text"
              name="username"
              placeholder="aura_haver"
              autoComplete="username"
              value={form.username}
              onChange={(e) => {
                setForm((p) => ({ ...p, username: e.target.value }));
                setErrors((p) => ({ ...p, username: undefined }));
              }}
              error={errors.username}
              hint="Your @handle on the feed and leaderboards."
            />

            {/* Bio */}
            <div>
              <label htmlFor="bio" className="block text-sm font-medium">
                Bio <span className="font-normal text-muted">(optional)</span>
              </label>
              <textarea
                id="bio"
                name="bio"
                rows={3}
                maxLength={160}
                placeholder="Certified aura holder since 2026."
                value={form.bio}
                onChange={(e) => setForm((p) => ({ ...p, bio: e.target.value }))}
                className="mt-1.5 w-full resize-none rounded-xl border border-edge bg-background px-4 py-2.5 text-sm outline-none transition-colors placeholder:text-muted/60 focus:border-accent"
              />
              <p className="mt-1 text-right text-xs text-muted">
                {form.bio.length}/160
              </p>
            </div>

            {/* Aura type */}
            <div>
              <p className="text-sm font-medium">
                What kind of aura do you usually have?{" "}
                <span className="font-normal text-muted">(optional)</span>
              </p>
              <div className="mt-2.5 flex flex-wrap gap-2">
                {auraTypes.map((type) => {
                  const selected = auraType === type.label;
                  return (
                    <button
                      key={type.label}
                      type="button"
                      onClick={() =>
                        setAuraType(selected ? null : type.label)
                      }
                      aria-pressed={selected}
                      className={`rounded-full border px-3.5 py-1.5 text-sm transition-colors ${
                        selected
                          ? "border-accent bg-foreground font-semibold text-background"
                          : "border-edge bg-background text-muted hover:border-accent/50 hover:text-foreground"
                      }`}
                    >
                      {type.emoji} {type.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-2xl bg-accent py-3 text-sm font-semibold text-background shadow-[0_0_30px_-8px] shadow-accent/60 transition-all hover:bg-accent-soft disabled:opacity-60"
            >
              {submitting ? "Saving…" : "Enter the feed"}
            </button>
          </form>
        </div>

        <p className="mt-6 text-center text-xs text-muted">
          You can change all of this later in Settings.
        </p>
      </div>
    </main>
  );
}
