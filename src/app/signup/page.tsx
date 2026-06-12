"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AuraLogo } from "@/components/aura-logo";
import { FormField } from "@/components/form-field";
import { SocialButtons } from "@/components/social-buttons";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

type Errors = Partial<{
  email: string;
  username: string;
  password: string;
  confirmPassword: string;
}>;

function validate(form: {
  email: string;
  username: string;
  password: string;
  confirmPassword: string;
}): Errors {
  const errors: Errors = {};

  if (!form.email.trim()) {
    errors.email = "Email is required.";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
    errors.email = "Enter a valid email address.";
  }

  if (!form.username.trim()) {
    errors.username = "Username is required.";
  } else if (!/^[a-z0-9_]{3,20}$/i.test(form.username.trim())) {
    errors.username =
      "3–20 characters, letters, numbers, and underscores only.";
  }

  if (!form.password) {
    errors.password = "Password is required.";
  } else if (form.password.length < 8) {
    errors.password = "Password must be at least 8 characters.";
  }

  if (!form.confirmPassword) {
    errors.confirmPassword = "Confirm your password.";
  } else if (form.confirmPassword !== form.password) {
    errors.confirmPassword = "Passwords don’t match.";
  }

  return errors;
}

export default function SignUpPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    email: "",
    username: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState<Errors>({});
  const [submitting, setSubmitting] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  function update(field: keyof typeof form) {
    return (e: React.ChangeEvent<HTMLInputElement>) => {
      setForm((prev) => ({ ...prev, [field]: e.target.value }));
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    };
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const nextErrors = validate(form);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setSubmitting(true);
    setAuthError(null);

    const supabase = getSupabaseBrowserClient();
    if (!supabase) {
      // Mock mode: no backend configured yet.
      router.push("/onboarding");
      return;
    }

    const { error } = await supabase.auth.signUp({
      email: form.email.trim(),
      password: form.password,
      options: {
        data: { username: form.username.trim() },
      },
    });

    if (error) {
      setAuthError(error.message);
      setSubmitting(false);
      return;
    }
    router.push("/onboarding");
  }

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
          <h1 className="text-2xl font-bold tracking-tight">
            Create your account
          </h1>
          <p className="mt-1.5 text-sm text-muted">
            Start tracking your aura. It only goes up from here. Probably.
          </p>

          <div className="mt-6">
            <SocialButtons />
          </div>

          <div className="mt-6 flex items-center gap-3 text-xs text-muted">
            <span className="h-px flex-1 bg-edge" />
            or sign up with email
            <span className="h-px flex-1 bg-edge" />
          </div>

          <form onSubmit={handleSubmit} noValidate className="mt-6 space-y-4">
            <FormField
              label="Email"
              type="email"
              name="email"
              placeholder="you@example.com"
              autoComplete="email"
              value={form.email}
              onChange={update("email")}
              error={errors.email}
            />
            <FormField
              label="Username"
              type="text"
              name="username"
              placeholder="aura_haver"
              autoComplete="username"
              value={form.username}
              onChange={update("username")}
              error={errors.username}
              hint="This is your @handle. Choose wisely."
            />
            <FormField
              label="Password"
              type="password"
              name="password"
              placeholder="At least 8 characters"
              autoComplete="new-password"
              value={form.password}
              onChange={update("password")}
              error={errors.password}
            />
            <FormField
              label="Confirm password"
              type="password"
              name="confirmPassword"
              placeholder="Same one again"
              autoComplete="new-password"
              value={form.confirmPassword}
              onChange={update("confirmPassword")}
              error={errors.confirmPassword}
            />

            {authError && (
              <p className="rounded-xl border border-negative/40 bg-background px-4 py-2.5 text-xs text-negative">
                {authError}
              </p>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-2xl bg-accent py-3 text-sm text-background font-semibold shadow-[0_0_30px_-8px] shadow-accent/60 transition-all hover:bg-accent-soft disabled:opacity-60"
            >
              {submitting ? "Creating account…" : "Sign up"}
            </button>
          </form>
        </div>

        <p className="mt-6 text-center text-sm text-muted">
          Already have an account?{" "}
          <Link
            href="/login"
            className="font-medium text-accent-soft underline-offset-4 hover:underline"
          >
            Log in
          </Link>
        </p>
      </div>
    </main>
  );
}
