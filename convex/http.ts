import { createDodoWebhookHandler } from "@dodopayments/convex";
import { httpRouter } from "convex/server";
import { internal } from "./_generated/api";

const http = httpRouter();

// ─── Dodo Payments Webhook Handler ───
http.route({
    path: "/dodopayments-webhook",
    method: "POST",
    handler: createDodoWebhookHandler({
        onPaymentSucceeded: async (ctx, payload) => {
            console.log("🎉 Payment Succeeded!");
            await ctx.runMutation(internal.billing.handlePaymentSuccess, {
                paymentId: payload.data.payment_id,
                customerEmail: payload.data.customer.email,
                amount: payload.data.total_amount,
                currency: payload.data.currency,
            });
        },

        onSubscriptionActive: async (ctx, payload) => {
            console.log("🎉 Subscription Activated!");
            await ctx.runMutation(internal.billing.activateSubscription, {
                subscriptionId: payload.data.subscription_id,
                customerEmail: payload.data.customer.email,
                productId: payload.data.product_id,
                customerId: payload.data.customer.customer_id,
            });
        },

        onSubscriptionCancelled: async (ctx, payload) => {
            console.log("📉 Subscription Cancelled");
            await ctx.runMutation(internal.billing.cancelSubscription, {
                subscriptionId: payload.data.subscription_id,
            });
        },

        onSubscriptionPaused: async (ctx, payload) => {
            console.log("⏸️ Subscription Paused:", payload.data.subscription_id);
        },

        onSubscriptionRenewed: async (ctx, payload) => {
            console.log("🔄 Subscription Renewed:", payload.data.subscription_id);
        },

        onPaymentFailed: async (ctx, payload) => {
            console.log("❌ Payment Failed:", payload.data.payment_id);
        },
    }),
});

export default http;
