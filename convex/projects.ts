import { mutation, query, action } from "./_generated/server";
import { v } from "convex/values";

// ─── Generate Upload URL ───
export const generateUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    return await ctx.storage.generateUploadUrl();
  },
});

// ─── Create Project from Upload ───
export const createFromUpload = mutation({
  args: {
    title: v.string(),
    storageId: v.id("_storage"),
    duration: v.optional(v.number()),
    sampleRate: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    // Get or create user
    let user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", identity.email!))
      .first();

    if (!user) {
      // Create new user with free plan
      const userId = await ctx.db.insert("users", {
        email: identity.email!,
        name: identity.name,
        plan: "free",
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
      user = await ctx.db.get(userId);
    }

    if (!user) throw new Error("Failed to create user");

    // Get the audio URL from storage
    const audioUrl = await ctx.storage.getUrl(args.storageId);

    // Create the project
    const projectId = await ctx.db.insert("projects", {
      userId: user._id,
      title: args.title,
      audioStorageId: args.storageId,
      audioUrl: audioUrl || undefined,
      duration: args.duration,
      sampleRate: args.sampleRate,
      status: "ready",
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    return { projectId, audioUrl };
  },
});

// ─── Get Project ───
export const get = query({
  args: { projectId: v.id("projects") },
  handler: async (ctx, args) => {
    const project = await ctx.db.get(args.projectId);
    if (!project) return null;

    // If audio URL is missing, try to get it from storage
    if (project.audioStorageId && !project.audioUrl) {
      const audioUrl = await ctx.storage.getUrl(project.audioStorageId);
      return { ...project, audioUrl };
    }

    return project;
  },
});

// ─── List User Projects ───
export const list = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", identity.email!))
      .first();

    if (!user) return [];

    const projects = await ctx.db
      .query("projects")
      .withIndex("by_user_id", (q) => q.eq("userId", user._id))
      .order("desc")
      .take(args.limit || 50);

    // Resolve audio URLs for each project
    const projectsWithUrls = await Promise.all(
      projects.map(async (project) => {
        let audioUrl = project.audioUrl;
        if (project.audioStorageId && !audioUrl) {
          audioUrl = await ctx.storage.getUrl(project.audioStorageId) || undefined;
        }
        return { ...project, audioUrl };
      })
    );

    return projectsWithUrls;
  },
});

// ─── Update Project ───
export const update = mutation({
  args: {
    projectId: v.id("projects"),
    title: v.optional(v.string()),
    settings: v.optional(v.any()),
    status: v.optional(v.union(
      v.literal("uploading"),
      v.literal("processing"),
      v.literal("transcribing"),
      v.literal("ready"),
      v.literal("failed")
    )),
  },
  handler: async (ctx, args) => {
    const { projectId, ...updates } = args;

    const existing = await ctx.db.get(projectId);
    if (!existing) throw new Error("Project not found");

    await ctx.db.patch(projectId, {
      ...updates,
      updatedAt: Date.now(),
    });

    return { success: true };
  },
});

// ─── Delete Project ───
export const remove = mutation({
  args: { projectId: v.id("projects") },
  handler: async (ctx, args) => {
    const project = await ctx.db.get(args.projectId);
    if (!project) throw new Error("Project not found");

    // Delete audio file from storage
    if (project.audioStorageId) {
      await ctx.storage.delete(project.audioStorageId);
    }

    // Delete associated captions
    const captions = await ctx.db
      .query("captions")
      .withIndex("by_project_id", (q) => q.eq("projectId", args.projectId))
      .collect();

    for (const caption of captions) {
      await ctx.db.delete(caption._id);
    }

    // Delete associated exports
    const exports = await ctx.db
      .query("exports")
      .withIndex("by_project_id", (q) => q.eq("projectId", args.projectId))
      .collect();

    for (const exp of exports) {
      if (exp.storageId) {
        await ctx.storage.delete(exp.storageId);
      }
      await ctx.db.delete(exp._id);
    }

    // Delete the project
    await ctx.db.delete(args.projectId);

    return { success: true };
  },
});

// ─── Get Project Stats ───
export const getStats = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;

    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", identity.email!))
      .first();

    if (!user) return null;

    const projects = await ctx.db
      .query("projects")
      .withIndex("by_user_id", (q) => q.eq("userId", user._id))
      .collect();

    const exports = await ctx.db
      .query("exports")
      .withIndex("by_user_id", (q) => q.eq("userId", user._id))
      .collect();

    const totalDuration = projects.reduce((sum, p) => sum + (p.duration || 0), 0);
    const completedExports = exports.filter((e) => e.status === "completed").length;

    return {
      totalProjects: projects.length,
      totalDuration,
      totalExports: completedExports,
      exportsThisMonth: user.exportsThisMonth || 0,
    };
  },
});
