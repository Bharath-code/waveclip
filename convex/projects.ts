import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { auth } from "./auth";

export const getUserProjects = query({
  args: {},
  handler: async (ctx) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) throw new Error('Not authenticated');

    return await ctx.db.query('projects')
      .withIndex('by_user_id', (q) => q.eq('userId', userId))
      .collect();
  },
});

export const createProject = mutation({
  args: {
    title: v.string(),
    audioUrl: v.optional(v.string()),
    duration: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) throw new Error('Not authenticated');

    return await ctx.db.insert('projects', {
      userId,
      title: args.title,
      audioUrl: args.audioUrl,
      duration: args.duration,
      settings: {},
      status: 'uploading',
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
  },
});

export const getProject = query({
  args: { projectId: v.id('projects') },
  handler: async (ctx, args) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) throw new Error('Not authenticated');

    const project = await ctx.db.get(args.projectId);
    if (!project || project.userId !== userId) {
      return null;
    }

    return project;
  },
});
