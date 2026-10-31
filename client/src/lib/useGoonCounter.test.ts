import { describe, expect, it } from "vitest";
import { buildLeaderboard } from "./useGoonCounter";

describe("Supabase leaderboard aggregation", () => {
  it("counts events, includes the current user, and ranks highest first", () => {
    const entries = buildLeaderboard(
      [
        { id: 1, user_id: "alex", created_at: "2026-10-01T10:00:00Z" },
        { id: 2, user_id: "alex", created_at: "2026-10-02T10:00:00Z" },
        { id: 3, user_id: "sai", created_at: "2026-10-03T10:00:00Z" },
      ],
      [
        { id: "alex", username: "Alex", display_name: "Alex", avatar_url: null },
        { id: "sai", username: "Sai", display_name: "Sai", avatar_url: null },
      ],
      "sai",
    );

    expect(entries.map((entry) => [entry.username, entry.count, entry.rank])).toEqual([
      ["Alex", 2, 1],
      ["Sai", 1, 2],
    ]);
  });

  it("shows a zero-count current user on an empty board", () => {
    const entries = buildLeaderboard([], [], "new-user");
    expect(entries).toEqual([
      { id: "new-user", username: "Gooner", initials: "G", count: 0, rank: 1, isCurrentUser: true },
    ]);
  });
});
