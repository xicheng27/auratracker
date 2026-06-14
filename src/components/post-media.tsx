// Renders a post's attached media in feeds and detail views. Photos crop
// nicely without distortion; videos play inline with controls and never
// autoplay with sound.
export function PostMedia({
  url,
  type,
  className = "mt-3 max-h-80",
}: {
  url?: string | null;
  type?: "photo" | "video" | null;
  className?: string;
}) {
  if (!url) return null;

  if (type === "video") {
    return (
      <video
        src={url}
        controls
        playsInline
        preload="metadata"
        className={`w-full rounded-xl border border-edge bg-background object-contain ${className}`}
      />
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={url}
      alt="Post attachment"
      loading="lazy"
      className={`w-full rounded-xl border border-edge object-cover ${className}`}
    />
  );
}
