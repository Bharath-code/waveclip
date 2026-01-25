import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    email: v.string(),
    name: v.string(),
    plan: v.union(v.literal('free'), v.literal('pro'), v.literal('enterprise')),
    usageCount: v.number(),
    subscriptionId: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index('by_email', ['email'])
    .index('by_plan', ['plan']),

  projects: defineTable({
    userId: v.id('users'),
    title: v.string(),
    audioUrl: v.optional(v.string()),
    duration: v.optional(v.number()),
    settings: v.any(), 
    status: v.union(
      v.literal('uploading'),
      v.literal('processing'),
      v.literal('ready'),
      v.literal('failed')
    ),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index('by_user_id', ['userId'])
    .index('by_status', ['status'])
    .index('by_created_at', ['createdAt']),

  exports: defineTable({
    projectId: v.id('projects'),
    downloadUrl: v.optional(v.string()),
    settings: v.any(),
    status: v.union(
      v.literal('processing'),
      v.literal('completed'),
      v.literal('failed')
    ),
    fileSize: v.optional(v.number()),
    createdAt: v.number(),
  }).index('by_project_id', ['projectId'])
    .index('by_status', ['status']),

  captions: defineTable({
    projectId: v.id('projects'),
    text: v.string(),
    startTime: v.number(),
    endTime: v.number(),
    speakerId: v.optional(v.string()),
    confidence: v.optional(v.number()),
    createdAt: v.number(),
  }).index('by_project_id', ['projectId'])
    .index('by_time_range', ['startTime', 'endTime']),
});
