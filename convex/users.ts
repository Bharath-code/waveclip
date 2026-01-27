import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { auth } from "./auth";

export const viewer = query({
  args: {},
  handler: async (ctx) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) {
      return null;
    }
    return await ctx.db.get(userId);
  },
});

// Sync user data from auth provider (call this after login/signup)
export const syncUser = mutation({
  args: {
    email: v.string(),
    name: v.optional(v.string()),
    avatarUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    // Check if user already exists
    const existingUser = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();

    const now = Date.now();

    if (existingUser) {
      // Update existing user
      await ctx.db.patch(existingUser._id, {
        name: args.name ?? existingUser.name,
        avatarUrl: args.avatarUrl ?? existingUser.avatarUrl,
        updatedAt: now,
      });
      return existingUser._id;
    }

    // Create new user with free plan
    const newUserId = await ctx.db.insert("users", {
      email: args.email,
      name: args.name,
      avatarUrl: args.avatarUrl,
      plan: "free",
      exportsThisMonth: 0,
      totalExports: 0,
      createdAt: now,
      updatedAt: now,
    });

    return newUserId;
  },
});

// Get or create user by email (for webhook handlers)
export const getOrCreateUserByEmail = mutation({
  args: {
    email: v.string(),
  },
  handler: async (ctx, args) => {
    const existingUser = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();

    if (existingUser) {
      return existingUser;
    }

    const now = Date.now();
    const newUserId = await ctx.db.insert("users", {
      email: args.email,
      plan: "free",
      exportsThisMonth: 0,
      totalExports: 0,
      createdAt: now,
      updatedAt: now,
    });

    return await ctx.db.get(newUserId);
  },
});
