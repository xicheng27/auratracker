"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { BottomNav, TopNav } from "@/components/app-nav";
import { createIncident, fetchGroupDetail, getCurrentUser, uploadImage } from "@/lib/api";
import type { GroupMember } from "@/lib/mock-group-detail";
import type { Group } from "@/lib/mock-groups";

const DESCRIPTION_MAX = 280;

type PostType = "self" | "friend";

export default function CreateIncidentPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [group, setGroup] = useState<Group | null>(null);
  const [members, setMembers] = useState<GroupMember[]>([]);
  const [loading, setLoading] = useState(true);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [postType, setPostType] = useState<PostType>("self");
  const [target, setTarget] = useState<string | null>(null);
  const [description, setDescription] = useState("");
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    Promise.all([fetchGroupDetail(id), getCurrentUser()]).then(
      ([detail, user]) => {
        if (detail) {
          setGroup(detail.group);
          setMembers(
            detail.members.filter((m) => m.username !== user?.username),
          );
        }
        setLoading(false);
      },
    );
  }, [id]);

  if (loading) {
    return (
      <>
        <TopNav />
        <main className="mx-auto w-full max-w-2xl flex-1 px-4 pt-5 pb-32">
          <div className="rounded-2xl border border-edge bg-card p-8 text-center text-sm text-muted">
            Summoning the council…
          </div>
        </main>
        <BottomNav />
      </>
    );
  }

  if (!group) {
    return (
      <>
        <TopNav />
        <main className="mx-auto w-full max-w-2xl flex-1 px-4 pt-5 pb-32">
          <div className="rounded-3xl border border-edge bg-card p-8 text-center">
            <p className="text-4xl">🔒</p>
            <h1 className="mt-4 text-xl font-bold tracking-tight">
              No such council
            </h1>
            <p className="mt-2 text-sm text-muted">
              This group doesn’t exist, or you’re not a member.
            </p>
            <Link
              href="/groups"
              className="mt-6 inline-block rounded-2xl bg-accent px-6 py-3 text-sm font-semibold text-background transition-colors hover:bg-accent-soft"
            >
              Back to groups
            </Link>
          </div>
        </main>
        <BottomNav />
      </>
    );
  }

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (imagePreview) URL.revokeObjectURL(imagePreview);
    setImagePreview(URL.createObjectURL(file));
    setImageFile(file);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (postType === "friend" && !target) {
      setError("Pick whose aura is on trial.");
      return;
    }
    if (!description.trim()) {
      setError("Describe the incident. The council needs evidence.");
      return;
    }
    setSubmitting(true);
    let imageUrl: string | null = null;
    if (imageFile) {
      const upload = await uploadImage("post-images", imageFile);
      if (upload.error) {
        setError(upload.error);
        setSubmitting(false);
        return;
      }
      imageUrl = upload.url ?? null;
    }
    const targetMember = members.find((m) => m.username === target);
    const { error: submitError } = await createIncident({
      groupId: id,
      targetUserId: targetMember?.userId ?? targetMember?.username ?? "",
      type: postType === "self" ? "self_post" : "friend_post",
      description: description.trim(),
      imageUrl,
    });
    if (submitError) {
      setError(submitError);
      setSubmitting(false);
      return;
    }
    router.push(`/groups/${id}`);
  }

  const targetName =
    postType === "self"
      ? "you"
      : target
        ? `@${target}`
        : "your friend";

  return (
    <>
      <TopNav />
      <main className="mx-auto w-full max-w-2xl flex-1 px-4 pt-5 pb-32">
        <Link
          href={`/groups/${id}`}
          className="text-sm text-muted transition-colors hover:text-foreground"
        >
          ← {group.name}
        </Link>
        <h1 className="mt-3 text-xl font-bold tracking-tight">
          Report an aura incident
        </h1>
        <p className="mt-1 text-sm text-muted">
          The council votes. {targetName === "you" ? "Your" : `${targetName}’s`}{" "}
          aura hangs in the balance.
        </p>

        <form onSubmit={handleSubmit} noValidate className="mt-5 space-y-5">
          {/* Post type */}
          <div className="rounded-2xl border border-edge bg-card p-5">
            <p className="text-sm font-medium">Who is this about?</p>
            <div className="mt-2.5 grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => {
                  setPostType("self");
                  setTarget(null);
                  setError(null);
                }}
                aria-pressed={postType === "self"}
                className={`rounded-xl border px-4 py-3 text-sm transition-colors ${
                  postType === "self"
                    ? "border-accent bg-foreground font-semibold text-background"
                    : "border-edge bg-background text-muted hover:text-foreground"
                }`}
              >
                🙋 About myself
              </button>
              <button
                type="button"
                onClick={() => {
                  setPostType("friend");
                  setError(null);
                }}
                aria-pressed={postType === "friend"}
                className={`rounded-xl border px-4 py-3 text-sm transition-colors ${
                  postType === "friend"
                    ? "border-accent bg-foreground font-semibold text-background"
                    : "border-edge bg-background text-muted hover:text-foreground"
                }`}
              >
                👉 About a friend
              </button>
            </div>

            {/* Target picker */}
            {postType === "friend" && (
              <div className="mt-4">
                <p className="text-sm font-medium">Target</p>
                <div className="mt-2.5 flex flex-wrap gap-2">
                  {members.map((member) => {
                    const selected = target === member.username;
                    return (
                      <button
                        key={member.username}
                        type="button"
                        onClick={() => {
                          setTarget(selected ? null : member.username);
                          setError(null);
                        }}
                        aria-pressed={selected}
                        className={`flex items-center gap-2 rounded-full border py-1.5 pr-3.5 pl-1.5 text-sm transition-colors ${
                          selected
                            ? "border-accent bg-foreground font-semibold text-background"
                            : "border-edge bg-background text-muted hover:border-accent/50 hover:text-foreground"
                        }`}
                      >
                        <span
                          className={`flex h-7 w-7 items-center justify-center rounded-full border text-xs font-semibold ${
                            selected
                              ? "border-background/30 text-background"
                              : "border-edge text-foreground"
                          }`}
                        >
                          {member.displayName[0]}
                        </span>
                        {member.displayName}
                      </button>
                    );
                  })}
                </div>
                <p className="mt-3 text-xs text-muted">
                  ⚠️ {target ? `@${target}` : "They"} will be notified. Rules
                  are rules.
                </p>
              </div>
            )}
          </div>

          {/* Incident */}
          <div className="rounded-2xl border border-edge bg-card p-5">
            <label htmlFor="description" className="block text-sm font-medium">
              What happened?
            </label>
            <textarea
              id="description"
              rows={4}
              maxLength={DESCRIPTION_MAX}
              placeholder={
                postType === "self"
                  ? "I talked to the cashier without stuttering."
                  : "Jayden missed the MRT because he was doing a fit check."
              }
              value={description}
              onChange={(e) => {
                setDescription(e.target.value);
                setError(null);
              }}
              aria-invalid={!!error}
              className={`mt-1.5 w-full resize-none rounded-xl border bg-background px-4 py-2.5 text-sm outline-none transition-colors placeholder:text-muted/60 focus:border-accent ${
                error ? "border-negative/60" : "border-edge"
              }`}
            />
            <div className="mt-1.5 flex items-center justify-between text-xs">
              <span className="text-negative">{error}</span>
              <span className="text-muted">
                {description.length}/{DESCRIPTION_MAX}
              </span>
            </div>
          </div>

          {/* Image */}
          <div className="rounded-2xl border border-edge bg-card p-5">
            <p className="text-sm font-medium">
              Evidence <span className="font-normal text-muted">(optional)</span>
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
                  alt="Incident evidence preview"
                  className="max-h-72 w-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => {
                    URL.revokeObjectURL(imagePreview);
                    setImagePreview(null);
                    setImageFile(null);
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

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-2xl bg-accent py-3.5 text-sm font-semibold text-background shadow-[0_0_30px_-8px] shadow-accent/60 transition-all hover:bg-accent-soft disabled:opacity-60"
          >
            {submitting ? "Submitting…" : "Submit to the council"}
          </button>
        </form>
      </main>
      <BottomNav />
    </>
  );
}
