import { action, mutation, query, internalMutation } from "./_generated/server";
import { v } from "convex/values";
import { components } from "./_generated/api";
import { DodoPayments } from "@dodopayments/convex";

// ─── Initialize Dodo Payments Client ───
const dodo = new DodoPayments(components.dodopayments, {
    apiKey: process.env.DODO_PAYMENTS_API_KEY!,
    environment: (process.env.DODO_PAYMENTS_ENVIRONMENT as "test_mode" | "live_mode") || "test_mode",
    identify: async () => null, // We'll handle customer ID separately
});

// ─── Plan Configuration ───
export const PLANS = {
    free: {
        exportsPerMonth: 5,
        maxAudioLength: 120,
        maxFileSize: 25 * 1024 * 1024,
    },
    pro: {
        exportsPerMonth: 50,
        maxAudioLength: 600,
        maxFileSize: 100 * 1024 * 1024,
    },
    enterprise: {
        exportsPerMonth: -1, // Unlimited
        maxAudioLength: 1800,
        maxFileSize: 500 * 1024 * 1024,
    },
} as const;

// ─── Create Checkout Session ───
export const createSubscriptionCheckout = action({
    args: {
        productId: v.string(),
        email: v.string(),
        successUrl: v.string(),
    },
    handler: async (ctx, args) => {
        const result = await dodo.api().checkout(ctx, {
            payload: {
                product_cart: [{ product_id: args.productId, quantity: 1 }],
                customer: { email: args.email },
            },
        });
        return result;
    },
});

// ─── Create Customer Portal Session ───
export const createPortalSession = action({
    args: {
        customerId: v.string(),
    },
    handler: async (ctx, _args) => {
        const result = await dodo.api().customerPortal(ctx);
        return result;
    },
});

// ─── Get User Subscription ───
export const getSubscription = query({
    args: {},
    handler: async (ctx) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) return null;

        const user = await ctx.db
            .query("users")
            .withIndex("by_email", (q) => q.eq("email", identity.email!))
            .first();

        if (!user) return null;

        const planKey = (user.plan || "free") as keyof typeof PLANS;

        return {
            plan: user.plan || "free",
            subscriptionId: user.subscriptionId,
            customerId: user.dodoCustomerId,
            exportsThisMonth: user.exportsThisMonth || 0,
            exportsLimit: PLANS[planKey]?.exportsPerMonth || 5,
        };
    },
});

// ─── Check Export Limit ───
export const canExport = query({
    args: {},
    handler: async (ctx) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) return { allowed: false, reason: "Not authenticated" };

        const user = await ctx.db
            .query("users")
            .withIndex("by_email", (q) => q.eq("email", identity.email!))
            .first();

        if (!user) return { allowed: false, reason: "User not found" };

        const planKey = (user.plan || "free") as keyof typeof PLANS;
        const plan = PLANS[planKey] || PLANS.free;
        const currentUsage = user.exportsThisMonth || 0;

        if (plan.exportsPerMonth === -1) {
            return { allowed: true };
        }

        if (currentUsage >= plan.exportsPerMonth) {
            return {
                allowed: false,
                reason: `You've used all ${plan.exportsPerMonth} exports this month. Upgrade to continue.`,
            };
        }

        return { allowed: true, remaining: plan.exportsPerMonth - currentUsage };
    },
});

// ─── Increment Export Usage ───
export const incrementExportUsage = mutation({
    args: {},
    handler: async (ctx) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new Error("Not authenticated");

        const user = await ctx.db
            .query("users")
            .withIndex("by_email", (q) => q.eq("email", identity.email!))
            .first();

        if (!user) throw new Error("User not found");

        await ctx.db.patch(user._id, {
            exportsThisMonth: (user.exportsThisMonth || 0) + 1,
            lastExportAt: Date.now(),
            totalExports: (user.totalExports || 0) + 1,
        });

        return { success: true };
    },
});

// ─── Internal: Handle Payment Success ───
export const handlePaymentSuccess = internalMutation({
    args: {
        paymentId: v.string(),
        customerEmail: v.string(),
        amount: v.number(),
        currency: v.string(),
    },
    handler: async (ctx, args) => {
        console.log("Payment succeeded:", args);
        // Log the payment for records
        await ctx.db.insert("payments", {
            paymentId: args.paymentId,
            email: args.customerEmail,
            amount: args.amount,
            currency: args.currency,
            createdAt: Date.now(),
        });
    },
});

// ─── Internal: Activate Subscription ───
export const activateSubscription = internalMutation({
    args: {
        subscriptionId: v.string(),
        customerEmail: v.string(),
        productId: v.string(),
        customerId: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        console.log("Activating subscription:", args);

        const user = await ctx.db
            .query("users")
            .withIndex("by_email", (q) => q.eq("email", args.customerEmail))
            .first();

        if (!user) {
            console.error("User not found for subscription activation:", args.customerEmail);
            return;
        }

        // Determine plan from product ID
        // TODO: Map your actual Dodo product IDs to plans
        let plan: "free" | "pro" | "enterprise" = "pro";
        if (args.productId.includes("enterprise")) {
            plan = "enterprise";
        }

        await ctx.db.patch(user._id, {
            plan,
            subscriptionId: args.subscriptionId,
            dodoCustomerId: args.customerId,
            subscriptionActivatedAt: Date.now(),
        });

        console.log(`User ${args.customerEmail} upgraded to ${plan}`);
    },
});

// ─── Internal: Cancel Subscription ───
export const cancelSubscription = internalMutation({
    args: {
        subscriptionId: v.string(),
    },
    handler: async (ctx, args) => {
        console.log("Cancelling subscription:", args);

        const user = await ctx.db
            .query("users")
            .filter((q) => q.eq(q.field("subscriptionId"), args.subscriptionId))
            .first();

        if (!user) {
            console.error("User not found for subscription cancellation:", args.subscriptionId);
            return;
        }

        await ctx.db.patch(user._id, {
            plan: "free",
            subscriptionId: undefined,
            subscriptionCancelledAt: Date.now(),
        });

        console.log(`User ${user.email} downgraded to free`);
    },
});

// ─── Reset Monthly Usage (cron job) ───
export const resetMonthlyUsage = internalMutation({
    args: {},
    handler: async (ctx) => {
        const users = await ctx.db.query("users").collect();

        for (const user of users) {
            await ctx.db.patch(user._id, {
                exportsThisMonth: 0,
            });
        }

        console.log(`Reset monthly usage for ${users.length} users`);
    },
});
