"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AuraLogo } from "@/components/aura-logo";
import { FormField } from "@/components/form-field";
import { SocialButtons } from "@/components/social-buttons";

type Errors = Partial<{
  identifier: string;
  password: string;
}>;

function validate(form: { identifier: string; password: string }): Errors {
  const errors: Errors = {};
  if (!form.identifier.trim()) {
    errors.identifier = "Enter your email or username.";
  }
  if (!form.password) {
    errors.password = "Password is required.";
  }
  return errors;
}

export default function LoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ identifier: "", password: "" });
  const [errors, setErrors] = useState<Errors>({});
  const [submitting, setSubmitting] = useState(false);

  function update(field: keyof typeof form) {
    return (e: React.ChangeEvent<HTMLInputElement>) => {
      setForm((prev) => ({ ...prev, [field]: e.target.value }));
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    };
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const nextErrors = validate(form);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setSubmitting(true);
    // TODO: replace with Supabase auth sign-in once the backend is wired up.
    router.push("/feed");
  }

  return (
    <main className="relative flex flex-1 items-center justify-center overflow-hidden px-6 py-12">
      {/* Background glow */}
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        <div className="absolute -top-40 left-1/2 h-130 w-130 -translate-x-1/2 rounded-full bg-accent/15 blur-3xl" />
        <div className="absolute -bottom-40 -right-40 h-100 w-100 rounded-full bg-accent/10 blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">
        <div className="flex justify-center">
          <AuraLogo href="/" />
        </div>

        <div className="mt-8 rounded-3xl border border-edge bg-card p-8 shadow-[0_0_60px_-20px] shadow-accent/30">
          <h1 className="text-2xl font-bold tracking-tight">Welcome back</h1>
          <p className="mt-1.5 text-sm text-muted">
            Your aura missed you. Log in to check the damage.
          </p>

          <div className="mt-6">
            <SocialButtons />
          </div>

          <div className="mt-6 flex items-center gap-3 text-xs text-muted">
            <span className="h-px flex-1 bg-edge" />
            or log in with email
            <span className="h-px flex-1 bg-edge" />
          </div>

          <form onSubmit={handleSubmit} noValidate className="mt-6 space-y-4">
            <FormField
              label="Email or username"
              type="text"
              name="identifier"
              placeholder="you@example.com or aura_haver"
              autoComplete="username"
              value={form.identifier}
              onChange={update("identifier")}
              error={errors.identifier}
            />
            <div>
              <FormField
                label="Password"
                type="password"
                name="password"
                placeholder="Your password"
                autoComplete="current-password"
                value={form.password}
                onChange={update("password")}
                error={errors.password}
              />
              <div className="mt-2 text-right">
                <Link
                  href="/forgot-password"
                  className="text-xs text-muted underline-offset-4 transition-colors hover:text-foreground hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-2xl bg-accent py-3 text-sm font-semibold text-background shadow-[0_0_30px_-8px] shadow-accent/60 transition-all hover:bg-accent-soft disabled:opacity-60"
            >
              {submitting ? "Logging in…" : "Log in"}
            </button>
          </form>
        </div>

        <p className="mt-6 text-center text-sm text-muted">
          New here?{" "}
          <Link
            href="/signup"
            className="font-medium text-accent-soft underline-offset-4 hover:underline"
          >
            Create an account
          </Link>
        </p>
      </div>
    </main>
  );
}
