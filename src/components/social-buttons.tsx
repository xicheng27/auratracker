function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4 fill-foreground" aria-hidden>
      <path d="M23.5 12.27c0-.85-.08-1.66-.22-2.45H12v4.64h6.45a5.52 5.52 0 0 1-2.39 3.62v3h3.87c2.26-2.09 3.57-5.16 3.57-8.81Z" />
      <path d="M12 24c3.24 0 5.96-1.07 7.93-2.91l-3.87-3a7.18 7.18 0 0 1-10.71-3.77H1.34v3.09A12 12 0 0 0 12 24Z" />
      <path d="M5.35 14.32a7.21 7.21 0 0 1 0-4.63V6.59H1.34a12.01 12.01 0 0 0 0 10.82l4.01-3.09Z" />
      <path d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.43-3.43A11.97 11.97 0 0 0 1.34 6.59l4 3.1A7.17 7.17 0 0 1 12 4.75Z" />
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

export function SocialButtons() {
  return (
    <div className="flex gap-3">
      <SocialButton provider="Google" icon={<GoogleIcon />} />
      <SocialButton provider="Apple" icon={<AppleIcon />} />
    </div>
  );
}
