// import { useCallback, useEffect, useMemo, useState } from "react";
// import type { Session, User as SupabaseUser } from "@supabase/supabase-js";
// import { supabase, hasSupabaseConfig } from "./supabase";

// type Profile = { id: string; username: string; display_name: string | null; avatar_url: string | null };
// type EventRow = { id: number; user_id: string; created_at: string };
// type Friendship = { user_id: string; friend_user_id: string };
// export type LeaderboardEntry = { id: string; username: string; initials: string; count: number; rank: number; isCurrentUser: boolean };
// export type FriendSummary = { id: string; username: string; initials: string; monthlyCount: number; streak: number; rank: number };
// export type DashboardData = {
//   user: { id: string; username: string; initials: string };
//   stats: { todayCount: number; weekCount: number; monthCount: number; total: number; streak: number; friendsCount: number };
//   daily: Array<{ label: string; date: string; count: number }>;
//   weekday: Array<{ label: string; count: number }>;
//   leaderboard: LeaderboardEntry[];
//   leaderboards: { monthly: LeaderboardEntry[]; weekly: LeaderboardEntry[]; allTime: LeaderboardEntry[] };
//   friends: FriendSummary[];
//   history: Array<{ id: number; timestamp: string }>;
// };

// function initials(name: string | null | undefined) {
//   const parts = name?.trim().split(/\s+/).filter(Boolean) ?? [];
//   return parts.slice(0, 2).map((part) => part[0]).join("").toUpperCase() || "G";
// }
// function dayKey(date: Date) { return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`; }
// function startOfDay(date: Date) { const result = new Date(date); result.setHours(0, 0, 0, 0); return result; }
// function startOfWeek(date: Date) { const result = startOfDay(date); result.setDate(result.getDate() - ((result.getDay() + 6) % 7)); return result; }
// function startOfMonth(date: Date) { return new Date(date.getFullYear(), date.getMonth(), 1); }
// function streak(events: EventRow[]) { const days = new Set(events.map((event) => dayKey(new Date(event.created_at)))); const cursor = startOfDay(new Date()); let count = 0; while (days.has(dayKey(cursor))) { count += 1; cursor.setDate(cursor.getDate() - 1); } return count; }
// function displayName(profile: Profile | undefined, authUser: SupabaseUser) { return profile?.username || profile?.display_name || authUser.user_metadata?.user_name || authUser.user_metadata?.name || authUser.email?.split("@")[0] || "Gooner"; }

// export function useGoonCounter() {
//   const [session, setSession] = useState<Session | null>(null);
//   const [profile, setProfile] = useState<Profile | null>(null);
//   const [data, setData] = useState<DashboardData | null>(null);
//   const [loading, setLoading] = useState(true);
//   const [dataLoading, setDataLoading] = useState(false);
//   const [error, setError] = useState<string | null>(null);

//   const loadDashboard = useCallback(async (activeSession = session) => {
//     if (!activeSession?.user) { setData(null); setLoading(false); return; }
//     setDataLoading(true);
//     setError(null);
//     try {
//       const userId = activeSession.user.id;
//       const [profileResult, eventsResult, allEventsResult, profilesResult, friendshipsResult] = await Promise.all([
//         supabase.from("profiles").select("id, username, display_name, avatar_url").eq("id", userId).single(),
//         supabase.from("goon_events").select("id, user_id, created_at").eq("user_id", userId).order("created_at", { ascending: false }),
//         supabase.from("goon_events").select("id, user_id, created_at").order("created_at", { ascending: false }),
//         supabase.from("profiles").select("id, username, display_name, avatar_url"),
//         supabase.from("friendships").select("user_id, friend_user_id").or(`user_id.eq.${userId},friend_user_id.eq.${userId}`),
//       ]);
//       const firstError = [profileResult, eventsResult, allEventsResult, profilesResult, friendshipsResult].find((result) => result.error)?.error;
//       if (firstError) throw firstError;
//       const currentProfile = (profileResult.data as Profile | null) ?? { id: userId, username: displayName(undefined, activeSession.user), display_name: null, avatar_url: null };
//       const myEvents = (eventsResult.data ?? []) as EventRow[];
//       const allEvents = (allEventsResult.data ?? []) as EventRow[];
//       const profiles = (profilesResult.data ?? []) as Profile[];
//       const friendshipRows = (friendshipsResult.data ?? []) as Friendship[];
//       setProfile(currentProfile);
//       const profileMap = new Map(profiles.map((item) => [item.id, item]));
//       const now = new Date();
//       const today = dayKey(now);
//       const weekStart = startOfWeek(now).getTime();
//       const monthStart = startOfMonth(now).getTime();
//       const myMonth = myEvents.filter((event) => new Date(event.created_at).getTime() >= monthStart);
//       const myWeek = myEvents.filter((event) => new Date(event.created_at).getTime() >= weekStart);
//       const todayCount = myEvents.filter((event) => dayKey(new Date(event.created_at)) === today).length;
//       const eventDays = new Map<string, number>();
//       myEvents.forEach((event) => eventDays.set(dayKey(new Date(event.created_at)), (eventDays.get(dayKey(new Date(event.created_at))) ?? 0) + 1));
//       const daily = Array.from({ length: 14 }, (_, index) => { const date = new Date(now); date.setDate(now.getDate() - (13 - index)); return { label: new Intl.DateTimeFormat("en-US", { weekday: "short" }).format(date), date: `${date.getMonth() + 1}/${date.getDate()}`, count: eventDays.get(dayKey(date)) ?? 0 }; });
//       const weekdayCounts = [0, 0, 0, 0, 0, 0, 0];
//       myEvents.forEach((event) => { weekdayCounts[(new Date(event.created_at).getDay() + 6) % 7] += 1; });
//       const weekday = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((label, index) => ({ label, count: weekdayCounts[index] }));
//       const leaderboards = {
//         monthly: buildLeaderboard(allEvents.filter((event) => new Date(event.created_at).getTime() >= monthStart), profiles, userId),
//         weekly: buildLeaderboard(allEvents.filter((event) => new Date(event.created_at).getTime() >= weekStart), profiles, userId),
//         allTime: buildLeaderboard(allEvents, profiles, userId),
//       };
//       const leaderboard = leaderboards.monthly;
//       const friendIds = friendshipRows.map((row) => row.user_id === userId ? row.friend_user_id : row.user_id);
//       const friends = friendIds.map((friendId, index) => { const friendEvents = allEvents.filter((event) => event.user_id === friendId); const friendProfile = profileMap.get(friendId); return { id: friendId, username: friendProfile ? displayName(friendProfile, activeSession.user) : "Gooner", initials: initials(friendProfile?.username || friendProfile?.display_name), monthlyCount: friendEvents.filter((event) => new Date(event.created_at).getTime() >= monthStart).length, streak: streak(friendEvents), rank: leaderboard.find((entry) => entry.id === friendId)?.rank ?? leaderboard.length + index + 1 }; });
//       setData({ user: { id: userId, username: displayName(currentProfile, activeSession.user), initials: initials(currentProfile.username || currentProfile.display_name) }, stats: { todayCount, weekCount: myWeek.length, monthCount: myMonth.length, total: myEvents.length, streak: streak(myEvents), friendsCount: friends.length }, daily, weekday, leaderboard, leaderboards, friends, history: myEvents.slice(0, 50).map((event) => ({ id: event.id, timestamp: event.created_at })) });
//     } catch (loadError) {
//       setError(loadError instanceof Error ? loadError.message : "Could not load your Supabase data.");
//     } finally { setLoading(false); setDataLoading(false); }
//   }, [session]);

//   useEffect(() => {
//     if (!hasSupabaseConfig) { setLoading(false); setError("Supabase is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to .env."); return; }
//     let mounted = true;
//     supabase.auth.getSession().then(({ data: { session: nextSession } }) => { if (mounted) { setSession(nextSession); setLoading(false); void loadDashboard(nextSession); } });
//     const { data: listener } = supabase.auth.onAuthStateChange((_event, nextSession) => { setSession(nextSession); setLoading(false); void loadDashboard(nextSession); });
//     return () => { mounted = false; listener.subscription.unsubscribe(); };
//   }, [loadDashboard]);

//   useEffect(() => {
//     if (!session?.user) return;
//     const channel = supabase.channel("goon-counter-live").on("postgres_changes", { event: "*", schema: "public", table: "goon_events" }, () => void loadDashboard()).on("postgres_changes", { event: "*", schema: "public", table: "friendships" }, () => void loadDashboard()).subscribe();
//     return () => { void supabase.removeChannel(channel); };
//   }, [session, loadDashboard]);

//   const signIn = useCallback(async () => { const { error: signInError } = await supabase.auth.signInWithOAuth({ provider: "google", options: { redirectTo: `${window.location.origin}/auth/callback` } }); if (signInError) throw signInError; }, []);
//   const signOut = useCallback(async () => { const { error: signOutError } = await supabase.auth.signOut(); if (signOutError) throw signOutError; }, []);
//   const logEvent = useCallback(async () => { if (!session?.user) throw new Error("Please sign in first."); const { error: insertError } = await supabase.from("goon_events").insert({ user_id: session.user.id }); if (insertError) throw insertError; await loadDashboard(); }, [session, loadDashboard]);
//   const addFriend = useCallback(async (username: string) => { if (!session?.user) throw new Error("Please sign in first."); const { data: friend, error: findError } = await supabase.from("profiles").select("id").ilike("username", username.trim()).neq("id", session.user.id).maybeSingle(); if (findError) throw findError; if (!friend) throw new Error("No signed-in user with that username was found."); const { error: insertError } = await supabase.from("friendships").insert({ user_id: session.user.id, friend_user_id: friend.id }); if (insertError) throw insertError; await loadDashboard(); }, [session, loadDashboard]);

//   return { user: session?.user ?? null, profile, data, loading, dataLoading, error, isAuthenticated: Boolean(session?.user), signIn, signOut, logEvent, addFriend, refresh: () => loadDashboard() };
// }

// export function buildLeaderboard(events: EventRow[], profiles: Profile[], currentUserId: string): LeaderboardEntry[] {
//   const counts = new Map<string, number>();
//   events.forEach((event) => counts.set(event.user_id, (counts.get(event.user_id) ?? 0) + 1));
//   if (!counts.has(currentUserId)) counts.set(currentUserId, 0);
//   const profileMap = new Map(profiles.map((profile) => [profile.id, profile]));
//   return Array.from(counts.entries()).map(([id, count]) => { const profile = profileMap.get(id); const username = profile?.username || profile?.display_name || "Gooner"; return { id, username, initials: initials(username), count, rank: 0, isCurrentUser: id === currentUserId }; }).sort((a, b) => b.count - a.count || Number(b.isCurrentUser) - Number(a.isCurrentUser)).map((entry, index) => ({ ...entry, rank: index + 1 }));
// }

import { useCallback, useEffect, useRef, useState } from "react";
import type { Session, User as SupabaseUser } from "@supabase/supabase-js";
import { supabase, hasSupabaseConfig } from "./supabase";

type Profile = {
  id: string;
  username: string;
  display_name: string | null;
  avatar_url: string | null;
};

type EventRow = {
  id: number;
  user_id: string;
  created_at: string;
};

type Friendship = {
  user_id: string;
  friend_user_id: string;
};

export type LeaderboardEntry = {
  id: string;
  username: string;
  initials: string;
  count: number;
  rank: number;
  isCurrentUser: boolean;
};

export type FriendSummary = {
  id: string;
  username: string;
  initials: string;
  monthlyCount: number;
  streak: number;
  rank: number;
};

export type DashboardData = {
  user: {
    id: string;
    username: string;
    initials: string;
  };
  stats: {
    todayCount: number;
    weekCount: number;
    monthCount: number;
    total: number;
    streak: number;
    friendsCount: number;
  };
  daily: Array<{
    label: string;
    date: string;
    count: number;
  }>;
  weekday: Array<{
    label: string;
    count: number;
  }>;
  leaderboard: LeaderboardEntry[];
  leaderboards: {
    monthly: LeaderboardEntry[];
    weekly: LeaderboardEntry[];
    allTime: LeaderboardEntry[];
  };
  friends: FriendSummary[];
  history: Array<{
    id: number;
    timestamp: string;
  }>;
};

function initials(name: string | null | undefined) {
  const parts = name?.trim().split(/\s+/).filter(Boolean) ?? [];

  return (
    parts
      .slice(0, 2)
      .map(part => part[0])
      .join("")
      .toUpperCase() || "G"
  );
}

function dayKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
    2,
    "0"
  )}-${String(date.getDate()).padStart(2, "0")}`;
}

function startOfDay(date: Date) {
  const result = new Date(date);
  result.setHours(0, 0, 0, 0);
  return result;
}

function startOfWeek(date: Date) {
  const result = startOfDay(date);
  result.setDate(result.getDate() - ((result.getDay() + 6) % 7));
  return result;
}

function startOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function streak(events: EventRow[]) {
  const days = new Set(events.map(event => dayKey(new Date(event.created_at))));

  const cursor = startOfDay(new Date());
  let count = 0;

  while (days.has(dayKey(cursor))) {
    count += 1;
    cursor.setDate(cursor.getDate() - 1);
  }

  return count;
}

function displayName(profile: Profile | undefined, authUser: SupabaseUser) {
  return (
    profile?.username ||
    profile?.display_name ||
    authUser.user_metadata?.user_name ||
    authUser.user_metadata?.name ||
    authUser.email?.split("@")[0] ||
    "Gooner"
  );
}

export function useGoonCounter() {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [data, setData] = useState<DashboardData | null>(null);

  // Authentication loading and dashboard loading are independent.
  const [loading, setLoading] = useState(true);
  const [dataLoading, setDataLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Keep the latest session without making callbacks depend on session state.
  const sessionRef = useRef<Session | null>(null);

  // Prevent older requests from overwriting newer results.
  const requestIdRef = useRef(0);

  // --------------------------------------------------
  // DASHBOARD DATA FETCHING
  // --------------------------------------------------

  const loadDashboard = useCallback(async (activeSession: Session | null) => {
    if (!activeSession?.user) {
      requestIdRef.current += 1;

      setData(null);
      setProfile(null);
      setError(null);
      setDataLoading(false);

      return;
    }

    const requestId = ++requestIdRef.current;
    const userId = activeSession.user.id;

    setDataLoading(true);
    setError(null);

    try {
      const [
        profileResult,
        eventsResult,
        allEventsResult,
        profilesResult,
        friendshipsResult,
      ] = await Promise.all([
        supabase
          .from("profiles")
          .select("id, username, display_name, avatar_url")
          .eq("id", userId)
          .maybeSingle(),

        supabase
          .from("goon_events")
          .select("id, user_id, created_at")
          .eq("user_id", userId)
          .order("created_at", { ascending: false }),

        supabase
          .from("goon_events")
          .select("id, user_id, created_at")
          .order("created_at", { ascending: false }),

        supabase
          .from("profiles")
          .select("id, username, display_name, avatar_url"),

        supabase
          .from("friendships")
          .select("user_id, friend_user_id")
          .or(`user_id.eq.${userId},friend_user_id.eq.${userId}`),
      ]);

      const firstError = [
        profileResult,
        eventsResult,
        allEventsResult,
        profilesResult,
        friendshipsResult,
      ].find(result => result.error)?.error;

      if (firstError) {
        throw firstError;
      }

      const currentProfile = (profileResult.data as Profile | null) ?? {
        id: userId,
        username: displayName(undefined, activeSession.user),
        display_name: null,
        avatar_url: null,
      };

      const myEvents = (eventsResult.data ?? []) as EventRow[];
      const allEvents = (allEventsResult.data ?? []) as EventRow[];
      const profiles = (profilesResult.data ?? []) as Profile[];
      const friendshipRows = (friendshipsResult.data ?? []) as Friendship[];

      const profileMap = new Map(profiles.map(item => [item.id, item]));

      const now = new Date();
      const today = dayKey(now);

      const weekStart = startOfWeek(now).getTime();
      const monthStart = startOfMonth(now).getTime();

      const myMonth = myEvents.filter(
        event => new Date(event.created_at).getTime() >= monthStart
      );

      const myWeek = myEvents.filter(
        event => new Date(event.created_at).getTime() >= weekStart
      );

      const todayCount = myEvents.filter(
        event => dayKey(new Date(event.created_at)) === today
      ).length;

      // Daily activity for the last 14 days.
      const eventDays = new Map<string, number>();

      myEvents.forEach(event => {
        const key = dayKey(new Date(event.created_at));

        eventDays.set(key, (eventDays.get(key) ?? 0) + 1);
      });

      const daily = Array.from({ length: 14 }, (_, index) => {
        const date = new Date(now);

        date.setDate(now.getDate() - (13 - index));

        return {
          label: new Intl.DateTimeFormat("en-US", {
            weekday: "short",
          }).format(date),

          date: `${date.getMonth() + 1}/${date.getDate()}`,

          count: eventDays.get(dayKey(date)) ?? 0,
        };
      });

      // Activity grouped by weekday.
      const weekdayCounts = [0, 0, 0, 0, 0, 0, 0];

      myEvents.forEach(event => {
        const index = (new Date(event.created_at).getDay() + 6) % 7;

        weekdayCounts[index] += 1;
      });

      const weekday = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map(
        (label, index) => ({
          label,
          count: weekdayCounts[index],
        })
      );

      // Leaderboards.
      const leaderboards = {
        monthly: buildLeaderboard(
          allEvents.filter(
            event => new Date(event.created_at).getTime() >= monthStart
          ),
          profiles,
          userId
        ),

        weekly: buildLeaderboard(
          allEvents.filter(
            event => new Date(event.created_at).getTime() >= weekStart
          ),
          profiles,
          userId
        ),

        allTime: buildLeaderboard(allEvents, profiles, userId),
      };

      const leaderboard = leaderboards.monthly;

      // Friends.
      const friendIds = friendshipRows.map(row =>
        row.user_id === userId ? row.friend_user_id : row.user_id
      );

      const friends = friendIds.map((friendId, index) => {
        const friendEvents = allEvents.filter(
          event => event.user_id === friendId
        );

        const friendProfile = profileMap.get(friendId);

        return {
          id: friendId,

          username: friendProfile
            ? displayName(friendProfile, activeSession.user)
            : "Gooner",

          initials: initials(
            friendProfile?.username || friendProfile?.display_name
          ),

          monthlyCount: friendEvents.filter(
            event => new Date(event.created_at).getTime() >= monthStart
          ).length,

          streak: streak(friendEvents),

          rank:
            leaderboard.find(entry => entry.id === friendId)?.rank ??
            leaderboard.length + index + 1,
        };
      });

      // Ignore results from requests that are no longer current.
      if (requestId !== requestIdRef.current) {
        return;
      }

      setProfile(currentProfile);

      setData({
        user: {
          id: userId,
          username: displayName(currentProfile, activeSession.user),
          initials: initials(
            currentProfile.username || currentProfile.display_name
          ),
        },

        stats: {
          todayCount,
          weekCount: myWeek.length,
          monthCount: myMonth.length,
          total: myEvents.length,
          streak: streak(myEvents),
          friendsCount: friends.length,
        },

        daily,
        weekday,
        leaderboard,
        leaderboards,
        friends,

        history: myEvents.slice(0, 50).map(event => ({
          id: event.id,
          timestamp: event.created_at,
        })),
      });
    } catch (loadError) {
      if (requestId !== requestIdRef.current) {
        return;
      }

      setError(
        loadError instanceof Error
          ? loadError.message
          : "Could not load your Supabase data."
      );
    } finally {
      // An older request must not stop a newer request's loader.
      if (requestId === requestIdRef.current) {
        setDataLoading(false);
      }
    }
  }, []);

  // --------------------------------------------------
  // AUTHENTICATION INITIALIZATION
  // --------------------------------------------------

  useEffect(() => {
    if (!hasSupabaseConfig) {
      setLoading(false);

      setError(
        "Supabase is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to .env."
      );

      return;
    }

    let mounted = true;

    // Supabase automatically emits INITIAL_SESSION after
    // restoring the session from storage or OAuth redirect.
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      if (!mounted) return;

      // Update the ref immediately for other callbacks.
      sessionRef.current = nextSession;

      // Avoid unnecessary React updates for token refreshes
      // and repeated events for the same authenticated user.
      setSession(currentSession => {
        const currentUserId = currentSession?.user.id ?? null;

        const nextUserId = nextSession?.user.id ?? null;

        if (currentUserId === nextUserId) {
          return currentSession ?? nextSession;
        }

        return nextSession;
      });

      setLoading(false);
    });

    return () => {
      mounted = false;

      subscription.unsubscribe();

      // Invalidate any pending dashboard request.
      requestIdRef.current += 1;
    };
  }, []);

  // --------------------------------------------------
  // DASHBOARD INITIAL LOAD / USER SWITCH
  // --------------------------------------------------

  const userId = session?.user?.id ?? null;

  useEffect(() => {
    if (!userId) {
      requestIdRef.current += 1;

      setData(null);
      setProfile(null);
      setError(null);
      setDataLoading(false);

      return;
    }

    const activeSession = sessionRef.current;

    if (!activeSession?.user) return;

    // Clear previous user's information when switching accounts.
    setData(null);
    setProfile(null);

    void loadDashboard(activeSession);
  }, [userId, loadDashboard]);

  // --------------------------------------------------
  // REALTIME SUBSCRIPTIONS
  // --------------------------------------------------

  useEffect(() => {
    if (!userId) return;

    let refreshTimer: ReturnType<typeof setTimeout> | undefined;

    // Debounce bursts of Realtime events.
    const scheduleRefresh = () => {
      if (refreshTimer) {
        clearTimeout(refreshTimer);
      }

      refreshTimer = setTimeout(() => {
        const activeSession = sessionRef.current;

        if (activeSession?.user) {
          void loadDashboard(activeSession);
        }
      }, 300);
    };

    const channel = supabase
      .channel("goon-counter-live")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "goon_events",
        },
        () => scheduleRefresh()
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "friendships",
        },
        () => scheduleRefresh()
      )
      .subscribe();

    return () => {
      if (refreshTimer) {
        clearTimeout(refreshTimer);
      }

      void supabase.removeChannel(channel);
    };
  }, [userId, loadDashboard]);

  // --------------------------------------------------
  // AUTHENTICATION ACTIONS
  // --------------------------------------------------

  const signIn = useCallback(async () => {
    const { error: signInError } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (signInError) {
      throw signInError;
    }
  }, []);

  const signOut = useCallback(async () => {
    const { error: signOutError } = await supabase.auth.signOut();

    if (signOutError) {
      throw signOutError;
    }
  }, []);

  // --------------------------------------------------
  // EVENT LOGGING
  // --------------------------------------------------

  const logEvent = useCallback(async () => {
    const activeSession = sessionRef.current;

    if (!activeSession?.user) {
      throw new Error("Please sign in first.");
    }

    const { error: insertError } = await supabase.from("goon_events").insert({
      user_id: activeSession.user.id,
    });

    if (insertError) {
      throw insertError;
    }

    await loadDashboard(activeSession);
  }, [loadDashboard]);

  // --------------------------------------------------
  // FRIEND MANAGEMENT
  // --------------------------------------------------

  const addFriend = useCallback(
    async (username: string) => {
      const activeSession = sessionRef.current;

      if (!activeSession?.user) {
        throw new Error("Please sign in first.");
      }

      const userId = activeSession.user.id;

      const { data: friend, error: findError } = await supabase
        .from("profiles")
        .select("id")
        .ilike("username", username.trim())
        .neq("id", userId)
        .maybeSingle();

      if (findError) {
        throw findError;
      }

      if (!friend) {
        throw new Error("No signed-in user with that username was found.");
      }

      const { error: insertError } = await supabase.from("friendships").insert({
        user_id: userId,
        friend_user_id: friend.id,
      });

      if (insertError) {
        throw insertError;
      }

      await loadDashboard(activeSession);
    },
    [loadDashboard]
  );

  // --------------------------------------------------
  // MANUAL REFRESH
  // --------------------------------------------------

  const refresh = useCallback(() => {
    return loadDashboard(sessionRef.current);
  }, [loadDashboard]);

  return {
    user: session?.user ?? null,
    profile,
    data,
    loading,
    dataLoading,
    error,
    isAuthenticated: Boolean(session?.user),
    signIn,
    signOut,
    logEvent,
    addFriend,
    refresh,
  };
}

// --------------------------------------------------
// LEADERBOARD BUILDER
// --------------------------------------------------

export function buildLeaderboard(
  events: EventRow[],
  profiles: Profile[],
  currentUserId: string
): LeaderboardEntry[] {
  const counts = new Map<string, number>();

  events.forEach(event => {
    counts.set(event.user_id, (counts.get(event.user_id) ?? 0) + 1);
  });

  if (!counts.has(currentUserId)) {
    counts.set(currentUserId, 0);
  }

  const profileMap = new Map(profiles.map(profile => [profile.id, profile]));

  return Array.from(counts.entries())
    .map(([id, count]) => {
      const profile = profileMap.get(id);

      const username = profile?.username || profile?.display_name || "Gooner";

      return {
        id,
        username,
        initials: initials(username),
        count,
        rank: 0,
        isCurrentUser: id === currentUserId,
      };
    })
    .sort(
      (a, b) =>
        b.count - a.count || Number(b.isCurrentUser) - Number(a.isCurrentUser)
    )
    .map((entry, index) => ({
      ...entry,
      rank: index + 1,
    }));
}
