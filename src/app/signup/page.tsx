"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AuraLogo } from "@/components/aura-logo";
import { FormField } from "@/components/form-field";

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

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden>
      <path
        fill="#4285F4"
        d="M23.5 12.27c0-.85-.08-1.66-.22-2.45H12v4.64h6.45a5.52 5.52 0 0 1-2.39 3.62v3h3.87c2.26-2.09 3.57-5.16 3.57-8.81Z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.24 0 5.96-1.07 7.93-2.91l-3.87-3a7.18 7.18 0 0 1-10.71-3.77H1.34v3.09A12 12 0 0 0 12 24Z"
      />
      <path
        fill="#FBBC05"
        d="M5.35 14.32a7.21 7.21 0 0 1 0-4.63V6.59H1.34a12.01 12.01 0 0 0 0 10.82l4.01-3.09Z"
      />
      <path
        fill="#EA4335"
        d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.43-3.43A11.97 11.97 0 0 0 1.34 6.59l4 3.1A7.17 7.17 0 0 1 12 4.75Z"
      />
    </svg>
  );
}

function AppleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4 fill-foreground" aria-hidden>
      <path d="M16.36 12.79c.03 3.26 2.86 4.35 2.9 4.36-.03.08-.46 1.55-1.5 3.07-.9 1.32-1.84 2.63-3.32 2.66-1.45.03-1.92-.86-3.58-.86-1.66 0-2.18.83-3.55.89-1.43.05-2.51-1.42-3.42-2.73C2 17.5.6 12.6 2.5 9.39a5.3 5.3 0 0 1 4.47-2.71c1.4-.03 2.72.94 3.58.94.85 0 2.46-1.16 4.15-1 .7.04 2.69.29 3.96 2.15-.1.06-2.36 1.38-2.3 4.02ZM13.6 4.83c.76-.92 1.27-2.19 1.13-3.46-1.09.04-2.41.73-3.19 1.64-.7.81-1.32 2.11-1.15 3.35 1.21.1 2.45-.62 3.21-1.53Z" />
    </svg>
  );
}

function SocialButton({
  provider,
  icon,
}: {
  provider: string;
  icon: React.ReactNode;
}) {
  return (
    <button
      type="button"
      className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-edge bg-card py-2.5 text-sm font-medium transition-colors hover:bg-card-hover"
    >
      {icon} {provider}
    </button>
  );
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
    // TODO: replace with Supabase auth sign-up once the backend is wired up.
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

          <div className="mt-6 flex gap-3">
            <SocialButton provider="Google" icon={<GoogleIcon />} />
            <SocialButton provider="Apple" icon={<AppleIcon />} />
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

            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-2xl bg-accent py-3 text-sm font-semibold shadow-[0_0_30px_-8px] shadow-accent/60 transition-all hover:bg-accent-soft disabled:opacity-60"
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
