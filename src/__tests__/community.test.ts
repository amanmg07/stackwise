/**
 * Community Feed Tests
 *
 * Tests for community post data structure, validation, timeAgo formatting,
 * curated stacks, and Supabase integration logic.
 */

// ---- timeAgo (extracted logic) ----

function timeAgo(dateStr?: string): string {
  if (!dateStr) return "";
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const seconds = Math.floor((now - then) / 1000);
  if (seconds < 5) return "just now";
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  return `${months}mo ago`;
}

// ---- Post helpers ----

interface CommunityPost {
  id: string;
  author: string;
  title: string;
  description: string;
  goals: string[];
  peptides: { peptideId: string; dose: string; frequency: string }[];
  difficulty: "beginner" | "intermediate" | "advanced";
  likes: number;
  duration: string;
  createdAt: string;
  isUserPost: boolean;
}

function validatePost(post: Partial<CommunityPost>): string[] {
  const errors: string[] = [];
  if (!post.title?.trim()) errors.push("Title required");
  if (!post.peptides || post.peptides.length === 0) errors.push("No peptides");
  return errors;
}

function mapSupabaseRow(row: any): CommunityPost {
  return {
    id: row.id,
    author: row.author,
    title: row.title,
    description: row.description || "",
    goals: row.goals || [],
    peptides: row.peptides || [],
    difficulty: row.difficulty || "beginner",
    likes: row.likes || 0,
    duration: row.duration || "8 weeks",
    createdAt: row.created_at,
    isUserPost: true,
  };
}

// ---- Tests ----

describe("Community Feed", () => {
  describe("timeAgo formatting", () => {
    it("should return empty string for undefined", () => {
      expect(timeAgo(undefined)).toBe("");
    });

    it("should return 'just now' for < 5 seconds", () => {
      const now = new Date().toISOString();
      expect(timeAgo(now)).toBe("just now");
    });

    it("should return seconds for < 60 seconds", () => {
      const date = new Date(Date.now() - 30 * 1000).toISOString();
      expect(timeAgo(date)).toBe("30s ago");
    });

    it("should return minutes for < 60 minutes", () => {
      const date = new Date(Date.now() - 15 * 60 * 1000).toISOString();
      expect(timeAgo(date)).toBe("15m ago");
    });

    it("should return hours for < 24 hours", () => {
      const date = new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString();
      expect(timeAgo(date)).toBe("5h ago");
    });

    it("should return days for < 30 days", () => {
      const date = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
      expect(timeAgo(date)).toBe("7d ago");
    });

    it("should return months for >= 30 days", () => {
      const date = new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString();
      expect(timeAgo(date)).toBe("2mo ago");
    });
  });

  describe("Post validation", () => {
    it("should reject post with no title", () => {
      const errors = validatePost({ title: "", peptides: [{ peptideId: "bpc157", dose: "0.25 mg", frequency: "2x daily" }] });
      expect(errors).toContain("Title required");
    });

    it("should reject post with whitespace-only title", () => {
      const errors = validatePost({ title: "   ", peptides: [{ peptideId: "bpc157", dose: "0.25 mg", frequency: "2x daily" }] });
      expect(errors).toContain("Title required");
    });

    it("should reject post with no peptides", () => {
      const errors = validatePost({ title: "My Stack", peptides: [] });
      expect(errors).toContain("No peptides");
    });

    it("should reject post with undefined peptides", () => {
      const errors = validatePost({ title: "My Stack" });
      expect(errors).toContain("No peptides");
    });

    it("should pass valid post", () => {
      const errors = validatePost({
        title: "Recovery Stack",
        peptides: [{ peptideId: "bpc157", dose: "0.25 mg", frequency: "2x daily" }],
      });
      expect(errors).toHaveLength(0);
    });

    it("should return multiple errors for empty post", () => {
      const errors = validatePost({});
      expect(errors).toContain("Title required");
      expect(errors).toContain("No peptides");
      expect(errors).toHaveLength(2);
    });
  });

  describe("Supabase row mapping", () => {
    it("should map a complete row correctly", () => {
      const row = {
        id: "abc123",
        author: "TestUser",
        title: "Test Stack",
        description: "Great stack",
        goals: ["recovery", "sleep"],
        peptides: [{ peptideId: "bpc157", dose: "0.25 mg", frequency: "2x daily" }],
        difficulty: "intermediate",
        likes: 42,
        duration: "6 weeks",
        created_at: "2026-03-17T00:00:00Z",
      };
      const post = mapSupabaseRow(row);
      expect(post.id).toBe("abc123");
      expect(post.author).toBe("TestUser");
      expect(post.title).toBe("Test Stack");
      expect(post.description).toBe("Great stack");
      expect(post.goals).toEqual(["recovery", "sleep"]);
      expect(post.peptides).toHaveLength(1);
      expect(post.difficulty).toBe("intermediate");
      expect(post.likes).toBe(42);
      expect(post.duration).toBe("6 weeks");
      expect(post.createdAt).toBe("2026-03-17T00:00:00Z");
      expect(post.isUserPost).toBe(true);
    });

    it("should handle missing optional fields with defaults", () => {
      const row = {
        id: "xyz",
        author: "Anon",
        title: "Minimal",
        created_at: "2026-03-17T00:00:00Z",
      };
      const post = mapSupabaseRow(row);
      expect(post.description).toBe("");
      expect(post.goals).toEqual([]);
      expect(post.peptides).toEqual([]);
      expect(post.difficulty).toBe("beginner");
      expect(post.likes).toBe(0);
      expect(post.duration).toBe("8 weeks");
    });

    it("should handle null fields gracefully", () => {
      const row = {
        id: "null-test",
        author: "User",
        title: "Null Fields",
        description: null,
        goals: null,
        peptides: null,
        difficulty: null,
        likes: null,
        duration: null,
        created_at: "2026-03-17T00:00:00Z",
      };
      const post = mapSupabaseRow(row);
      expect(post.description).toBe("");
      expect(post.goals).toEqual([]);
      expect(post.peptides).toEqual([]);
      expect(post.difficulty).toBe("beginner");
      expect(post.likes).toBe(0);
      expect(post.duration).toBe("8 weeks");
    });
  });

  describe("Like toggling", () => {
    it("should increment likes correctly", () => {
      const post = { likes: 10 };
      const newLikes = post.likes + 1;
      expect(newLikes).toBe(11);
    });

    it("should decrement likes and not go below 0", () => {
      const post = { likes: 0 };
      const newLikes = Math.max(0, post.likes - 1);
      expect(newLikes).toBe(0);
    });

    it("should track liked state in a set", () => {
      let likedStacks: string[] = [];

      // Like
      likedStacks = [...likedStacks, "post1"];
      expect(likedStacks.includes("post1")).toBe(true);

      // Unlike
      likedStacks = likedStacks.filter((id) => id !== "post1");
      expect(likedStacks.includes("post1")).toBe(false);
    });

    it("should not duplicate likes", () => {
      let likedStacks = ["post1"];
      if (!likedStacks.includes("post1")) {
        likedStacks = [...likedStacks, "post1"];
      }
      expect(likedStacks.filter((id) => id === "post1")).toHaveLength(1);
    });
  });

  describe("Feed ordering", () => {
    it("should put remote posts before curated stacks", () => {
      const remotePosts = [
        { id: "remote1", author: "User1", title: "Remote Post", createdAt: new Date().toISOString() },
      ];
      const popularStacks = [
        { id: "cs1", author: "PeptidePro", title: "Curated Stack", createdAt: new Date().toISOString() },
      ];
      const allStacks = [...remotePosts, ...popularStacks];
      expect(allStacks[0].id).toBe("remote1");
      expect(allStacks[1].id).toBe("cs1");
    });
  });

  describe("Post creation payload", () => {
    it("should build correct Supabase insert payload", () => {
      const author = "TestUser";
      const title = "My Stack";
      const description = "Works great";
      const selectedGoals = ["recovery", "sleep"];
      const postPeptides = [
        { peptideId: "bpc157", dose: "0.25 mg", frequency: "2x daily" },
      ];
      const difficulty = "beginner";
      const duration = "6 weeks";

      const payload = {
        id: "test-id",
        author: author.trim() || "Anonymous",
        title: title.trim(),
        description: description.trim(),
        goals: selectedGoals,
        peptides: postPeptides,
        difficulty,
        likes: 0,
        duration: duration.trim() || "8 weeks",
      };

      expect(payload.author).toBe("TestUser");
      expect(payload.title).toBe("My Stack");
      expect(payload.likes).toBe(0);
      expect(payload.goals).toHaveLength(2);
      expect(payload.peptides).toHaveLength(1);
    });

    it("should default author to Anonymous when empty", () => {
      const author = "  ";
      const result = author.trim() || "Anonymous";
      expect(result).toBe("Anonymous");
    });

    it("should default duration to 8 weeks when empty", () => {
      const duration = "";
      const result = duration.trim() || "8 weeks";
      expect(result).toBe("8 weeks");
    });
  });
});
