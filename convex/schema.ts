import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

export default defineSchema({
  // Auth tables from @convex-dev/auth
  ...authTables,

  // ─── Users ───
  users: defineTable({
    // Basic info
    email: v.string(),
    name: v.optional(v.string()),
    avatarUrl: v.optional(v.string()),

    // Billing
    plan: v.union(v.literal('free'), v.literal('pro'), v.literal('enterprise')),
    subscriptionId: v.optional(v.string()),
    dodoCustomerId: v.optional(v.string()),
    subscriptionActivatedAt: v.optional(v.number()),
    subscriptionCancelledAt: v.optional(v.number()),

    // Usage tracking
    exportsThisMonth: v.optional(v.number()),
    totalExports: v.optional(v.number()),
    lastExportAt: v.optional(v.number()),

    // Timestamps
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index('by_email', ['email'])
    .index('by_plan', ['plan'])
    .index('by_subscription', ['subscriptionId']),

  // ─── Projects ───
  projects: defineTable({
    userId: v.id('users'),
    title: v.string(),

    // Audio file
    audioStorageId: v.optional(v.id('_storage')),
    audioUrl: v.optional(v.string()),
    duration: v.optional(v.number()),
    sampleRate: v.optional(v.number()),

    // Editor settings
    settings: v.optional(v.any()),

    // Status
    status: v.union(
      v.literal('uploading'),
      v.literal('processing'),
      v.literal('transcribing'),
      v.literal('ready'),
      v.literal('failed')
    ),

    // Timestamps
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index('by_user_id', ['userId'])
    .index('by_status', ['status'])
    .index('by_created_at', ['createdAt']),

  // ─── Exports ───
  exports: defineTable({
    projectId: v.id('projects'),
    userId: v.id('users'),

    // Output
    downloadUrl: v.optional(v.string()),
    storageId: v.optional(v.id('_storage')),

    // Settings
    format: v.optional(v.union(
      v.literal('square'),
      v.literal('vertical'),
      v.literal('horizontal')
    )),
    resolution: v.optional(v.string()),
    settings: v.optional(v.any()),

    // Status
    status: v.union(
      v.literal('processing'),
      v.literal('completed'),
      v.literal('failed')
    ),
    fileSize: v.optional(v.number()),
    errorMessage: v.optional(v.string()),

    // Timestamps
    createdAt: v.number(),
    completedAt: v.optional(v.number()),
  }).index('by_project_id', ['projectId'])
    .index('by_user_id', ['userId'])
    .index('by_status', ['status']),

  // ─── Captions ───
  captions: defineTable({
    projectId: v.id('projects'),

    // Segment data
    text: v.string(),
    startTime: v.number(),
    endTime: v.number(),

    // Optional metadata
    speakerId: v.optional(v.string()),
    confidence: v.optional(v.number()),

    // Styling
    style: v.optional(v.object({
      fontSize: v.optional(v.number()),
      fontFamily: v.optional(v.string()),
      color: v.optional(v.string()),
      backgroundColor: v.optional(v.string()),
      position: v.optional(v.string()),
    })),

    // Timestamps
    createdAt: v.number(),
    updatedAt: v.optional(v.number()),
  }).index('by_project_id', ['projectId'])
    .index('by_time_range', ['startTime', 'endTime']),

  // ─── Payments (Dodo Payments) ───
  payments: defineTable({
    paymentId: v.string(),
    email: v.string(),
    amount: v.number(),
    currency: v.string(),
    status: v.optional(v.string()),
    productId: v.optional(v.string()),

    // Timestamps
    createdAt: v.number(),
  }).index('by_payment_id', ['paymentId'])
    .index('by_email', ['email']),
});

