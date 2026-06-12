import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { mockComments, type PostComment } from "@/lib/mock-comments";
import {
  mockFriends,
  mockFriendRequests,
  type FriendEntry,
  type FriendRequest,
  type FriendStatus,
  type UserSearchResult,
} from "@/lib/mock-friends";
import {
  mockMembers,
  mockPrivatePosts,
  type GroupMember,
  type PrivatePost,
} from "@/lib/mock-group-detail";
import { mockGroups, type Group } from "@/lib/mock-groups";
import {
  mockRankings,
  mostControversialPost,
  type RankedUser,
} from "@/lib/mock-leaderboard";
import { mockNotifications, type AppNotification } from "@/lib/mock-notifications";
import { mockPosts, type PublicPost } from "@/lib/mock-posts";
import { mockProfile } from "@/lib/mock-profile";

export type Vote = "up" | "down" | null;

export type CurrentUser = {
  id: string;
  username: string;
  displayName: string;
  totalAura: number;
  avatarUrl: string | null;
};

export type ProfileData = typeof mockProfile & {
  avatarUrl: string | null;
  groupAura: { id: string; name: string; icon: string; myAura: number }[];
};

export type ControversialPost = typeof mostControversialPost | null;

function timeAgo(iso: string): string {
  const seconds = Math.max(0, (Date.now() - new Date(iso).getTime()) / 1000);
  if (seconds < 60) return "now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

function hoursSince(iso: string): number {
  return (Date.now() - new Date(iso).getTime()) / 3_600_000;
}

function todayUtc(): string {
  return new Date().toISOString().slice(0, 10);
}

// ============================================================
// Current user
// ============================================================
export async function getCurrentUser(): Promise<CurrentUser | null> {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) {
    return {
      id: mockProfile.username,
      username: mockProfile.username,
      displayName: mockProfile.displayName,
      totalAura: mockProfile.totalPublicAura,
      avatarUrl: null,
    };
  }
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;
  const { data: profile } = await supabase
    .from("profiles")
    .select("username, display_name, total_public_aura, profile_image_url")
    .eq("id", user.id)
    .maybeSingle();
  if (!profile) return null;
  return {
    id: user.id,
    username: profile.username,
    displayName: profile.display_name || profile.username,
    totalAura: profile.total_public_aura,
    avatarUrl: profile.profile_image_url,
  };
}

// ============================================================
// Image uploads
// ============================================================
export async function uploadImage(
  bucket: "avatars" | "post-images",
  file: File,
): Promise<{ url?: string; error?: string }> {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) return {}; // Mock mode: nothing to upload.
  const user = await getCurrentUser();
  if (!user) return { error: "Log in first." };
  const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
  const path = `${user.id}/${crypto.randomUUID()}.${ext}`;
  const { error } = await supabase.storage.from(bucket).upload(path, file);
  if (error) return { error: error.message };
  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return { url: data.publicUrl };
}

async function fetchFriendIdSet(userId: string): Promise<Set<string>> {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) return new Set();
  const { data } = await supabase
    .from("friendships")
    .select("requester_id, receiver_id")
    .eq("status", "accepted")
    .or(`requester_id.eq.${userId},receiver_id.eq.${userId}`);
  return new Set(
    (data ?? []).map((f) =>
      f.requester_id === userId ? f.receiver_id : f.requester_id,
    ),
  );
}

// ============================================================
// Public posts
// ============================================================
export async function fetchPublicPosts(): Promise<PublicPost[]> {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) return mockPosts;

  const [{ data: rows }, user] = await Promise.all([
    supabase
      .from("public_posts")
      .select(
        "id, user_id, title, description, category, image_url, up_votes_count, down_votes_count, created_at, profiles(username, profile_image_url), public_comments(count)",
      )
      .eq("status", "active")
      .order("created_at", { ascending: false })
      .limit(50),
    getCurrentUser(),
  ]);
  if (!rows) return [];

  let myVotes: Record<string, Vote> = {};
  let friendIds = new Set<string>();
  if (user) {
    const [{ data: votes }, friends] = await Promise.all([
      supabase
        .from("public_votes")
        .select("post_id, vote_type")
        .eq("voter_id", user.id),
      fetchFriendIdSet(user.id),
    ]);
    myVotes = Object.fromEntries(
      (votes ?? []).map((v) => [v.post_id, v.vote_type === "aura_up" ? "up" : "down"]),
    );
    friendIds = friends;
  }

  /* eslint-disable @typescript-eslint/no-explicit-any */
  return rows.map((row: any) => ({
    id: row.id,
    username: row.profiles?.username ?? "unknown",
    timeAgo: timeAgo(row.created_at),
    hoursAgo: hoursSince(row.created_at),
    title: row.title,
    description: row.description,
    category: row.category ?? "Random",
    upVotes: row.up_votes_count,
    downVotes: row.down_votes_count,
    comments: row.public_comments?.[0]?.count ?? 0,
    isFriend: friendIds.has(row.user_id),
    myVote: myVotes[row.id] ?? null,
    imageUrl: row.image_url,
    avatarUrl: row.profiles?.profile_image_url ?? null,
  }));
  /* eslint-enable @typescript-eslint/no-explicit-any */
}

export async function hasPostedToday(): Promise<boolean> {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) return false;
  const user = await getCurrentUser();
  if (!user) return false;
  const { data } = await supabase
    .from("public_posts")
    .select("id")
    .eq("user_id", user.id)
    .eq("post_date", todayUtc())
    .maybeSingle();
  return Boolean(data);
}

export async function createPublicPost(input: {
  title: string;
  description: string;
  category: string | null;
  imageUrl?: string | null;
}): Promise<{ error?: string }> {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) return {};
  const user = await getCurrentUser();
  if (!user) return { error: "Log in to post." };
  const { error } = await supabase.from("public_posts").insert({
    user_id: user.id,
    title: input.title,
    description: input.description,
    category: input.category,
    image_url: input.imageUrl ?? null,
  });
  if (error) {
    return {
      error: error.code === "23505"
        ? "You’ve already posted today. One moment per day."
        : error.message,
    };
  }
  return {};
}

export async function castPublicVote(postId: string, vote: Vote): Promise<void> {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) return;
  const user = await getCurrentUser();
  if (!user) return;
  if (vote === null) {
    await supabase
      .from("public_votes")
      .delete()
      .eq("post_id", postId)
      .eq("voter_id", user.id);
    return;
  }
  await supabase.from("public_votes").upsert(
    {
      post_id: postId,
      voter_id: user.id,
      vote_type: vote === "up" ? "aura_up" : "aura_down",
    },
    { onConflict: "post_id,voter_id" },
  );
}

export async function fetchPostDetail(
  id: string,
): Promise<{ post: PublicPost; comments: PostComment[] } | null> {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) {
    const post = mockPosts.find((p) => p.id === id);
    if (!post) return null;
    return { post, comments: mockComments[id] ?? [] };
  }

  const { data: row } = await supabase
    .from("public_posts")
    .select(
      "id, title, description, category, image_url, up_votes_count, down_votes_count, created_at, profiles(username, profile_image_url)",
    )
    .eq("id", id)
    .neq("status", "removed")
    .maybeSingle();
  if (!row) return null;

  const [{ data: commentRows }, user] = await Promise.all([
    supabase
      .from("public_comments")
      .select("id, comment_text, created_at, profiles(username)")
      .eq("post_id", id)
      .eq("status", "active")
      .order("created_at", { ascending: true }),
    getCurrentUser(),
  ]);

  let myVote: Vote = null;
  if (user) {
    const { data: voteRow } = await supabase
      .from("public_votes")
      .select("vote_type")
      .eq("post_id", id)
      .eq("voter_id", user.id)
      .maybeSingle();
    if (voteRow) myVote = voteRow.vote_type === "aura_up" ? "up" : "down";
  }

  /* eslint-disable @typescript-eslint/no-explicit-any */
  const r = row as any;
  return {
    post: {
      id: r.id,
      username: r.profiles?.username ?? "unknown",
      timeAgo: timeAgo(r.created_at),
      hoursAgo: hoursSince(r.created_at),
      title: r.title,
      description: r.description,
      category: r.category ?? "Random",
      upVotes: r.up_votes_count,
      downVotes: r.down_votes_count,
      comments: commentRows?.length ?? 0,
      isFriend: false,
      myVote,
      imageUrl: r.image_url,
      avatarUrl: r.profiles?.profile_image_url ?? null,
    },
    comments: (commentRows ?? []).map((c: any) => ({
      id: c.id,
      username: c.profiles?.username ?? "unknown",
      timeAgo: timeAgo(c.created_at),
      text: c.comment_text,
    })),
  };
  /* eslint-enable @typescript-eslint/no-explicit-any */
}

export async function addPublicComment(
  postId: string,
  text: string,
): Promise<PostComment | null> {
  const supabase = getSupabaseBrowserClient();
  const user = await getCurrentUser();
  if (!user) return null;
  if (!supabase) {
    return { id: `local-${Date.now()}`, username: user.username, timeAgo: "now", text };
  }
  const { data, error } = await supabase
    .from("public_comments")
    .insert({ post_id: postId, user_id: user.id, comment_text: text })
    .select("id")
    .maybeSingle();
  if (error || !data) return null;
  return { id: data.id, username: user.username, timeAgo: "now", text };
}

export async function reportContent(
  contentType: "public_post" | "private_post" | "comment" | "user",
  contentId: string,
): Promise<void> {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) return;
  const user = await getCurrentUser();
  if (!user) return;
  await supabase.from("reports").insert({
    reporter_id: user.id,
    content_type: contentType,
    content_id: contentId,
    reason: "Reported from the app",
  });
}

// ============================================================
// Groups
// ============================================================
export async function fetchGroups(): Promise<Group[]> {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) return mockGroups;
  const user = await getCurrentUser();
  if (!user) return [];

  const { data: memberships } = await supabase
    .from("group_members")
    .select(
      "group_aura_score, groups(id, name, description, icon_url, invite_code)",
    )
    .eq("user_id", user.id)
    .eq("status", "active");
  if (!memberships || memberships.length === 0) return [];

  /* eslint-disable @typescript-eslint/no-explicit-any */
  const groupIds = memberships.map((m: any) => m.groups.id);

  const [{ data: roster }, { data: latestPosts }] = await Promise.all([
    supabase
      .from("group_members")
      .select("group_id")
      .in("group_id", groupIds)
      .eq("status", "active"),
    supabase
      .from("private_posts")
      .select("group_id, description, created_at")
      .in("group_id", groupIds)
      .order("created_at", { ascending: false })
      .limit(60),
  ]);

  const counts: Record<string, number> = {};
  for (const r of roster ?? []) counts[r.group_id] = (counts[r.group_id] ?? 0) + 1;

  const latest: Record<string, { description: string; created_at: string }> = {};
  for (const p of latestPosts ?? []) {
    if (!latest[p.group_id]) latest[p.group_id] = p;
  }

  return memberships.map((m: any) => ({
    id: m.groups.id,
    name: m.groups.name,
    icon: m.groups.icon_url ?? "✦",
    description: m.groups.description,
    members: counts[m.groups.id] ?? 1,
    myAura: m.group_aura_score,
    inviteCode: m.groups.invite_code,
    recentActivity: latest[m.groups.id]?.description ?? "No incidents reported yet.",
    lastActive: latest[m.groups.id]
      ? timeAgo(latest[m.groups.id].created_at)
      : "—",
  }));
  /* eslint-enable @typescript-eslint/no-explicit-any */
}

export async function joinGroupByCode(
  code: string,
): Promise<{ groupId?: string; error?: string }> {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) {
    return { error: `No group found for “${code}” yet. Codes go live with the backend.` };
  }
  const { data, error } = await supabase.rpc("join_group_with_code", { code });
  if (error) return { error: error.message };
  if (!data) return { error: "No group with that code. Check with your friend." };
  return { groupId: data as string };
}

export async function createGroup(input: {
  name: string;
  description: string;
  icon: string;
  inviteCode: string;
}): Promise<{ groupId?: string; error?: string }> {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) return {};
  const user = await getCurrentUser();
  if (!user) return { error: "Log in to create a group." };

  const { data: group, error } = await supabase
    .from("groups")
    .insert({
      name: input.name,
      description: input.description,
      icon_url: input.icon,
      invite_code: input.inviteCode,
      created_by: user.id,
    })
    .select("id")
    .maybeSingle();
  if (error || !group) return { error: error?.message ?? "Could not create group." };

  const { error: memberError } = await supabase.from("group_members").insert({
    group_id: group.id,
    user_id: user.id,
    role: "owner",
  });
  if (memberError) return { error: memberError.message };
  return { groupId: group.id };
}

export async function fetchGroupDetail(id: string): Promise<{
  group: Group;
  members: GroupMember[];
  posts: PrivatePost[];
} | null> {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) {
    const group = mockGroups.find((g) => g.id === id);
    if (!group) return null;
    return {
      group,
      members: (mockMembers[id] ?? []).map((m) => ({ ...m, userId: m.username })),
      posts: mockPrivatePosts[id] ?? [],
    };
  }

  const { data: groupRow } = await supabase
    .from("groups")
    .select("id, name, description, icon_url, invite_code")
    .eq("id", id)
    .maybeSingle();
  if (!groupRow) return null;

  const [{ data: memberRows }, { data: postRows }, user] = await Promise.all([
    supabase
      .from("group_members")
      .select("user_id, role, group_aura_score, profiles(username, display_name)")
      .eq("group_id", id)
      .eq("status", "active"),
    supabase
      .from("private_posts")
      .select(
        "id, post_type, description, image_url, up_votes_count, down_votes_count, created_at, posted_by:profiles!private_posts_posted_by_user_id_fkey(username), target:profiles!private_posts_target_user_id_fkey(username), private_comments(count)",
      )
      .eq("group_id", id)
      .neq("status", "removed")
      .order("created_at", { ascending: false }),
    getCurrentUser(),
  ]);

  /* eslint-disable @typescript-eslint/no-explicit-any */
  let myVotes: Record<string, Vote> = {};
  if (user && postRows && postRows.length > 0) {
    const { data: votes } = await supabase
      .from("private_votes")
      .select("private_post_id, vote_type")
      .eq("voter_id", user.id)
      .in("private_post_id", postRows.map((p: any) => p.id));
    myVotes = Object.fromEntries(
      (votes ?? []).map((v) => [
        v.private_post_id,
        v.vote_type === "aura_up" ? "up" : "down",
      ]),
    );
  }

  const members: GroupMember[] = (memberRows ?? []).map((m: any) => ({
    userId: m.user_id,
    username: m.profiles?.username ?? "unknown",
    displayName: m.profiles?.display_name || m.profiles?.username || "Unknown",
    role: m.role,
    aura: m.group_aura_score,
  }));

  const myMembership = (memberRows ?? []).find((m: any) => m.user_id === user?.id);

  return {
    group: {
      id: groupRow.id,
      name: groupRow.name,
      icon: groupRow.icon_url ?? "✦",
      description: groupRow.description,
      members: members.length,
      myAura: (myMembership as any)?.group_aura_score ?? 0,
      inviteCode: groupRow.invite_code,
      recentActivity: "",
      lastActive: "",
    },
    members,
    posts: (postRows ?? []).map((p: any) => ({
      id: p.id,
      postedBy: p.posted_by?.username ?? "unknown",
      target: p.target?.username ?? "unknown",
      type: p.post_type,
      description: p.description,
      upVotes: p.up_votes_count,
      downVotes: p.down_votes_count,
      comments: p.private_comments?.[0]?.count ?? 0,
      timeAgo: timeAgo(p.created_at),
      myVote: myVotes[p.id] ?? null,
      imageUrl: p.image_url,
    })),
  };
  /* eslint-enable @typescript-eslint/no-explicit-any */
}

export async function castPrivateVote(postId: string, vote: Vote): Promise<void> {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) return;
  const user = await getCurrentUser();
  if (!user) return;
  if (vote === null) {
    await supabase
      .from("private_votes")
      .delete()
      .eq("private_post_id", postId)
      .eq("voter_id", user.id);
    return;
  }
  await supabase.from("private_votes").upsert(
    {
      private_post_id: postId,
      voter_id: user.id,
      vote_type: vote === "up" ? "aura_up" : "aura_down",
    },
    { onConflict: "private_post_id,voter_id" },
  );
}

export async function createIncident(input: {
  groupId: string;
  targetUserId: string;
  type: "self_post" | "friend_post";
  description: string;
  imageUrl?: string | null;
}): Promise<{ error?: string }> {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) return {};
  const user = await getCurrentUser();
  if (!user) return { error: "Log in to post." };
  const { error } = await supabase.from("private_posts").insert({
    group_id: input.groupId,
    posted_by_user_id: user.id,
    target_user_id: input.type === "self_post" ? user.id : input.targetUserId,
    post_type: input.type,
    description: input.description,
    image_url: input.imageUrl ?? null,
  });
  return error ? { error: error.message } : {};
}

// ============================================================
// Profile
// ============================================================
export async function fetchProfileData(): Promise<ProfileData | null> {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) {
    return {
      ...mockProfile,
      avatarUrl: null,
      groupAura: mockGroups.map((g) => ({
        id: g.id,
        name: g.name,
        icon: g.icon,
        myAura: g.myAura,
      })),
    };
  }

  const user = await getCurrentUser();
  if (!user) return null;

  const [
    { data: profile },
    { data: posts },
    { data: history },
    groups,
    { count: votesGivenPublic },
    { count: votesGivenPrivate },
  ] = await Promise.all([
    supabase
      .from("profiles")
      .select("username, display_name, bio, total_public_aura, profile_image_url")
      .eq("id", user.id)
      .maybeSingle(),
    supabase
      .from("public_posts")
      .select("id, title, aura_score, total_votes_count, created_at, post_date")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(50),
    supabase
      .from("aura_history")
      .select("aura_change")
      .eq("user_id", user.id)
      .is("group_id", null)
      .order("created_at", { ascending: false })
      .limit(12),
    fetchGroups(),
    supabase
      .from("public_votes")
      .select("id", { count: "exact", head: true })
      .eq("voter_id", user.id),
    supabase
      .from("private_votes")
      .select("id", { count: "exact", head: true })
      .eq("voter_id", user.id),
  ]);
  if (!profile) return null;

  const allPosts = posts ?? [];
  const best = allPosts.reduce(
    (a, b) => (b.aura_score > (a?.aura_score ?? -Infinity) ? b : a),
    allPosts[0],
  );
  const worst = allPosts.reduce(
    (a, b) => (b.aura_score < (a?.aura_score ?? Infinity) ? b : a),
    allPosts[0],
  );

  // Posting streak: consecutive UTC days ending today or yesterday.
  const postDates = new Set(allPosts.map((p) => p.post_date));
  let streak = 0;
  const cursor = new Date();
  if (!postDates.has(cursor.toISOString().slice(0, 10))) {
    cursor.setUTCDate(cursor.getUTCDate() - 1);
  }
  while (postDates.has(cursor.toISOString().slice(0, 10))) {
    streak += 1;
    cursor.setUTCDate(cursor.getUTCDate() - 1);
  }

  const totalAura = profile.total_public_aura;
  const votesGiven = (votesGivenPublic ?? 0) + (votesGivenPrivate ?? 0);

  const badges: { emoji: string; label: string }[] = [];
  if (streak >= 3) badges.push({ emoji: "🔥", label: `${streak}-day streak` });
  if (votesGiven >= 100) badges.push({ emoji: "⚖️", label: `${votesGiven}+ votes cast` });
  if ((worst?.aura_score ?? 0) <= -80) badges.push({ emoji: "💀", label: `Survived a ${worst.aura_score}` });
  if (allPosts.length >= 10) badges.push({ emoji: "📮", label: `${allPosts.length} posts` });

  return {
    username: profile.username,
    displayName: profile.display_name || profile.username,
    bio: profile.bio,
    avatarUrl: profile.profile_image_url,
    totalPublicAura: totalAura,
    streakDays: streak,
    postCount: allPosts.length,
    votesReceived: allPosts.reduce((sum, p) => sum + p.total_votes_count, 0),
    votesGiven,
    bestMoment: best
      ? { title: best.title, aura: best.aura_score }
      : { title: "No moments yet.", aura: 0 },
    worstMoment: worst
      ? { title: worst.title, aura: worst.aura_score }
      : { title: "No moments yet.", aura: 0 },
    badges,
    auraHistory: (history ?? []).map((h) => h.aura_change).reverse(),
    recentPosts: allPosts.slice(0, 4).map((p) => ({
      id: p.id,
      title: p.title,
      aura: p.aura_score,
      daysAgo: timeAgo(p.created_at),
    })),
    groupAura: groups.map((g) => ({
      id: g.id,
      name: g.name,
      icon: g.icon,
      myAura: g.myAura,
    })),
  };
}

// ============================================================
// Leaderboard
// ============================================================
export async function fetchLeaderboard(): Promise<{
  rankings: RankedUser[];
  controversial: ControversialPost;
}> {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) {
    return { rankings: mockRankings, controversial: mostControversialPost };
  }

  const me = await getCurrentUser();
  const friendIds = me ? await fetchFriendIdSet(me.id) : new Set<string>();
  const startOfDay = `${todayUtc()}T00:00:00Z`;
  const [{ data: profiles }, { data: todayHistory }, { data: votedPosts }] =
    await Promise.all([
      supabase
        .from("profiles")
        .select("id, username, display_name, total_public_aura")
        .order("total_public_aura", { ascending: false })
        .limit(50),
      supabase
        .from("aura_history")
        .select("user_id, aura_change")
        .is("group_id", null)
        .gte("created_at", startOfDay),
      supabase
        .from("public_posts")
        .select("title, total_votes_count, vote_ratio, profiles(username)")
        .gte("total_votes_count", 10)
        .order("total_votes_count", { ascending: false })
        .limit(50),
    ]);

  const todayChange: Record<string, number> = {};
  for (const h of todayHistory ?? []) {
    todayChange[h.user_id] = (todayChange[h.user_id] ?? 0) + h.aura_change;
  }

  /* eslint-disable @typescript-eslint/no-explicit-any */
  const controversialRow = (votedPosts ?? []).reduce<any>(
    (closest, p: any) =>
      closest === null || Math.abs(p.vote_ratio) < Math.abs(closest.vote_ratio)
        ? p
        : closest,
    null,
  );

  return {
    rankings: (profiles ?? []).map((p) => ({
      username: p.username,
      displayName: p.display_name || p.username,
      totalAura: p.total_public_aura,
      todayChange: todayChange[p.id] ?? 0,
      streakDays: 0, // Streaks aren't tracked globally yet.
      isFriend: friendIds.has(p.id),
    })),
    controversial: controversialRow
      ? {
          username: controversialRow.profiles?.username ?? "unknown",
          title: controversialRow.title,
          upPercent: Math.round(((controversialRow.vote_ratio as number) + 1) * 50),
          totalVotes: controversialRow.total_votes_count,
        }
      : null,
  };
  /* eslint-enable @typescript-eslint/no-explicit-any */
}

// ============================================================
// Friends
// ============================================================
export async function fetchFriends(): Promise<FriendEntry[]> {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) return mockFriends;
  const user = await getCurrentUser();
  if (!user) return [];

  const { data: rows } = await supabase
    .from("friendships")
    .select("id, requester_id, receiver_id")
    .eq("status", "accepted")
    .or(`requester_id.eq.${user.id},receiver_id.eq.${user.id}`);
  if (!rows || rows.length === 0) return [];

  const otherIds = rows.map((f) =>
    f.requester_id === user.id ? f.receiver_id : f.requester_id,
  );
  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, username, display_name, profile_image_url, total_public_aura")
    .in("id", otherIds);

  return rows.flatMap((f) => {
    const otherId = f.requester_id === user.id ? f.receiver_id : f.requester_id;
    const profile = (profiles ?? []).find((p) => p.id === otherId);
    if (!profile) return [];
    return [{
      friendshipId: f.id,
      userId: profile.id,
      username: profile.username,
      displayName: profile.display_name || profile.username,
      avatarUrl: profile.profile_image_url,
      totalAura: profile.total_public_aura,
    }];
  });
}

export async function fetchFriendRequests(): Promise<FriendRequest[]> {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) return mockFriendRequests;
  const user = await getCurrentUser();
  if (!user) return [];

  const { data: rows } = await supabase
    .from("friendships")
    .select("id, requester_id, receiver_id")
    .eq("status", "pending")
    .or(`requester_id.eq.${user.id},receiver_id.eq.${user.id}`);
  if (!rows || rows.length === 0) return [];

  const otherIds = rows.map((f) =>
    f.requester_id === user.id ? f.receiver_id : f.requester_id,
  );
  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, username, display_name, profile_image_url")
    .in("id", otherIds);

  return rows.flatMap((f) => {
    const incoming = f.receiver_id === user.id;
    const otherId = incoming ? f.requester_id : f.receiver_id;
    const profile = (profiles ?? []).find((p) => p.id === otherId);
    if (!profile) return [];
    return [{
      friendshipId: f.id,
      userId: profile.id,
      username: profile.username,
      displayName: profile.display_name || profile.username,
      avatarUrl: profile.profile_image_url,
      direction: incoming ? ("incoming" as const) : ("outgoing" as const),
    }];
  });
}

export async function searchUsers(query: string): Promise<UserSearchResult[]> {
  const trimmed = query.trim();
  if (trimmed.length < 2) return [];

  const supabase = getSupabaseBrowserClient();
  if (!supabase) {
    const friendUsernames = new Set(mockFriends.map((f) => f.username));
    const requestByUsername = new Map(
      mockFriendRequests.map((r) => [r.username, r.direction]),
    );
    return mockRankings
      .filter(
        (u) =>
          u.username.toLowerCase().includes(trimmed.toLowerCase()) ||
          u.displayName.toLowerCase().includes(trimmed.toLowerCase()),
      )
      .slice(0, 10)
      .map((u) => ({
        userId: u.username,
        username: u.username,
        displayName: u.displayName,
        avatarUrl: null,
        totalAura: u.totalAura,
        status:
          u.username === mockProfile.username
            ? ("self" as const)
            : friendUsernames.has(u.username)
              ? ("friends" as const)
              : requestByUsername.get(u.username) === "incoming"
                ? ("incoming" as const)
                : requestByUsername.get(u.username) === "outgoing"
                  ? ("outgoing" as const)
                  : ("none" as const),
      }));
  }

  const user = await getCurrentUser();
  const escaped = trimmed.replace(/[%_,]/g, "");
  const [{ data: profiles }, { data: friendships }] = await Promise.all([
    supabase
      .from("profiles")
      .select("id, username, display_name, profile_image_url, total_public_aura")
      .or(`username.ilike.%${escaped}%,display_name.ilike.%${escaped}%`)
      .limit(10),
    user
      ? supabase
          .from("friendships")
          .select("requester_id, receiver_id, status")
          .or(`requester_id.eq.${user.id},receiver_id.eq.${user.id}`)
      : Promise.resolve({ data: [] }),
  ]);

  function statusFor(otherId: string): FriendStatus {
    if (user && otherId === user.id) return "self";
    const match = (friendships ?? []).find(
      (f) => f.requester_id === otherId || f.receiver_id === otherId,
    );
    if (!match || match.status === "rejected") return "none";
    if (match.status === "accepted") return "friends";
    if (match.status === "blocked") return "none";
    return match.requester_id === otherId ? "incoming" : "outgoing";
  }

  return (profiles ?? []).map((p) => ({
    userId: p.id,
    username: p.username,
    displayName: p.display_name || p.username,
    avatarUrl: p.profile_image_url,
    totalAura: p.total_public_aura,
    status: statusFor(p.id),
  }));
}

export async function sendFriendRequest(
  targetUserId: string,
): Promise<{ error?: string }> {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) return {};
  const user = await getCurrentUser();
  if (!user) return { error: "Log in first." };

  const { data: existing } = await supabase
    .from("friendships")
    .select("id, status")
    .or(
      `and(requester_id.eq.${user.id},receiver_id.eq.${targetUserId}),and(requester_id.eq.${targetUserId},receiver_id.eq.${user.id})`,
    )
    .maybeSingle();
  if (existing && existing.status !== "rejected") {
    return { error: "There's already a request between you two." };
  }

  const { error } = await supabase.from("friendships").insert({
    requester_id: user.id,
    receiver_id: targetUserId,
  });
  return error ? { error: error.message } : {};
}

export async function respondToFriendRequest(
  friendshipId: string,
  accept: boolean,
): Promise<void> {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) return;
  await supabase
    .from("friendships")
    .update({
      status: accept ? "accepted" : "rejected",
      updated_at: new Date().toISOString(),
    })
    .eq("id", friendshipId);
}

export async function removeFriendship(friendshipId: string): Promise<void> {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) return;
  await supabase.from("friendships").delete().eq("id", friendshipId);
}

// ============================================================
// Notifications
// ============================================================
export async function fetchNotifications(): Promise<AppNotification[]> {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) return mockNotifications;
  const user = await getCurrentUser();
  if (!user) return [];

  const { data } = await supabase
    .from("notifications")
    .select("id, type, title, message, related_post_id, related_group_id, is_read, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(50);

  return (data ?? []).map((n) => ({
    id: n.id,
    type: n.type,
    title: n.title,
    message: n.message,
    timeAgo: timeAgo(n.created_at),
    href:
      n.type === "friend_request" || n.type === "friend_accepted"
        ? "/friends"
        : n.related_group_id
          ? `/groups/${n.related_group_id}`
          : n.related_post_id
            ? `/post/${n.related_post_id}`
            : "/feed",
    unread: !n.is_read,
  }));
}

export async function markNotificationRead(id: string): Promise<void> {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) return;
  await supabase.from("notifications").update({ is_read: true }).eq("id", id);
}

export async function markAllNotificationsRead(): Promise<void> {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) return;
  const user = await getCurrentUser();
  if (!user) return;
  await supabase
    .from("notifications")
    .update({ is_read: true })
    .eq("user_id", user.id)
    .eq("is_read", false);
}
