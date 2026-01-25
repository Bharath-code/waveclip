/**
 * Dodo Payments Integration for Waveclip
 * 
 * This file contains helper functions for integrating Dodo Payments
 * with the Waveclip audiogram SaaS application.
 * 
 * Setup Instructions:
 * 1. Install: npm install @dodopayments/convex
 * 2. Add to convex/convex.config.ts
 * 3. Set environment variables in Convex dashboard
 * 4. Create products in Dodo Payments dashboard
 */

// ─── Plan Configuration ───
export const PLANS = {
    free: {
        id: 'free',
        name: 'Free',
        priceMonthly: 0,
        priceYearly: 0,
        currency: 'INR',
        features: [
            '5 exports per month',
            'Basic waveform styles',
            'Standard quality (720p)',
            'Watermark included',
        ],
        limits: {
            exportsPerMonth: 5,
            maxAudioLength: 120, // seconds
            maxFileSize: 25, // MB
            hasWatermark: true,
            resolution: '720p',
        },
    },
    pro: {
        id: 'pro',
        name: 'Pro',
        priceMonthly: 999, // ₹999/month
        priceYearly: 9990, // ₹9990/year (save 2 months)
        currency: 'INR',
        dodoProductId: '', // Fill in after creating in Dodo dashboard
        features: [
            '50 exports per month',
            'All waveform styles',
            'HD quality (1080p)',
            'No watermark',
            'AI captions included',
            'Priority support',
        ],
        limits: {
            exportsPerMonth: 50,
            maxAudioLength: 600, // 10 minutes
            maxFileSize: 100, // MB
            hasWatermark: false,
            resolution: '1080p',
        },
    },
    enterprise: {
        id: 'enterprise',
        name: 'Enterprise',
        priceMonthly: 2999, // ₹2999/month
        priceYearly: 29990, // ₹29990/year
        currency: 'INR',
        dodoProductId: '', // Fill in after creating in Dodo dashboard
        features: [
            'Unlimited exports',
            'All waveform styles',
            '4K quality (2160p)',
            'No watermark',
            'AI captions included',
            'Custom branding',
            'API access',
            'Dedicated support',
        ],
        limits: {
            exportsPerMonth: -1, // Unlimited
            maxAudioLength: 1800, // 30 minutes
            maxFileSize: 500, // MB
            hasWatermark: false,
            resolution: '4k',
        },
    },
} as const;

export type PlanId = keyof typeof PLANS;
export type Plan = typeof PLANS[PlanId];

// ─── Format Currency ───
export function formatCurrency(amount: number, currency = 'INR'): string {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency,
        minimumFractionDigits: 0,
    }).format(amount);
}

// ─── Get Plan by ID ───
export function getPlan(planId: PlanId): Plan {
    return PLANS[planId];
}

// ─── Check if User Can Export ───
export function canUserExport(
    planId: PlanId,
    currentUsage: number
): { allowed: boolean; reason?: string } {
    const plan = PLANS[planId];

    if (plan.limits.exportsPerMonth === -1) {
        return { allowed: true };
    }

    if (currentUsage >= plan.limits.exportsPerMonth) {
        return {
            allowed: false,
            reason: `You've reached your monthly limit of ${plan.limits.exportsPerMonth} exports. Upgrade to continue.`,
        };
    }

    return { allowed: true };
}

// ─── Calculate Savings ───
export function calculateYearlySavings(planId: Exclude<PlanId, 'free'>): {
    monthlyTotal: number;
    yearlyTotal: number;
    savings: number;
    savingsPercent: number;
} {
    const plan = PLANS[planId];
    const monthlyTotal = plan.priceMonthly * 12;
    const yearlyTotal = plan.priceYearly;
    const savings = monthlyTotal - yearlyTotal;
    const savingsPercent = Math.round((savings / monthlyTotal) * 100);

    return { monthlyTotal, yearlyTotal, savings, savingsPercent };
}

/**
 * CONVEX SETUP TEMPLATE
 * 
 * Create these files in your convex/ directory:
 */

export const CONVEX_CONFIG_TEMPLATE = `
// convex/convex.config.ts
import { defineApp } from "convex/server";
import dodopayments from "@dodopayments/convex/convex.config";

const app = defineApp();
app.use(dodopayments);

export default app;
`;

export const CONVEX_BILLING_TEMPLATE = `
// convex/billing.ts
import { action, mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { createCheckout, createCustomerPortal } from "@dodopayments/convex";

// Create checkout session for subscription
export const createSubscriptionCheckout = action({
  args: {
    productId: v.string(),
    email: v.string(),
    successUrl: v.string(),
    cancelUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const result = await createCheckout(ctx, {
      items: [{ product_id: args.productId, quantity: 1 }],
      customer: { email: args.email },
      success_url: args.successUrl,
      ...(args.cancelUrl && { payment_link: false }),
    });
    return result;
  },
});

// Create customer portal session
export const createPortalSession = action({
  args: {
    customerId: v.string(),
    returnUrl: v.string(),
  },
  handler: async (ctx, args) => {
    const result = await createCustomerPortal(ctx, {
      customer_id: args.customerId,
      send_email: false,
    });
    return result;
  },
});

// Get user's subscription status
export const getSubscription = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    if (!user) return null;
    
    return {
      plan: user.plan || "free",
      subscriptionId: user.subscriptionId,
      customerId: user.dodoCustomerId,
      exportsThisMonth: user.exportsThisMonth || 0,
    };
  },
});

// Track export usage
export const incrementExportUsage = mutation({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    if (!user) throw new Error("User not found");
    
    await ctx.db.patch(args.userId, {
      exportsThisMonth: (user.exportsThisMonth || 0) + 1,
      lastExportAt: Date.now(),
    });
  },
});
`;

export const CONVEX_HTTP_WEBHOOK_TEMPLATE = `
// convex/http.ts
import { createDodoWebhookHandler } from "@dodopayments/convex";
import { httpRouter } from "convex/server";
import { internal } from "./_generated/api";

const http = httpRouter();

http.route({
  path: "/dodopayments-webhook",
  method: "POST",
  handler: createDodoWebhookHandler({
    onPaymentSucceeded: async (ctx, payload) => {
      console.log("🎉 Payment Succeeded!");
      // Handle one-time payment
      await ctx.runMutation(internal.billing.handlePaymentSuccess, {
        paymentId: payload.data.payment_id,
        customerEmail: payload.data.customer.email,
        amount: payload.data.total_amount,
        currency: payload.data.currency,
      });
    },
    
    onSubscriptionActive: async (ctx, payload) => {
      console.log("🎉 Subscription Activated!");
      // Upgrade user's plan
      await ctx.runMutation(internal.billing.activateSubscription, {
        subscriptionId: payload.data.subscription_id,
        customerEmail: payload.data.customer.email,
        productId: payload.data.product_id,
      });
    },
    
    onSubscriptionCancelled: async (ctx, payload) => {
      console.log("📉 Subscription Cancelled");
      // Downgrade user to free plan
      await ctx.runMutation(internal.billing.cancelSubscription, {
        subscriptionId: payload.data.subscription_id,
      });
    },
  }),
});

export default http;
`;

export const ENV_VARIABLES_TEMPLATE = `
# Dodo Payments Environment Variables
# Add these to your Convex dashboard: npx convex dashboard

DODO_PAYMENTS_API_KEY=your_api_key_here
DODO_PAYMENTS_ENVIRONMENT=test_mode  # or live_mode for production
DODO_PAYMENTS_WEBHOOK_SECRET=your_webhook_secret_here
`;
