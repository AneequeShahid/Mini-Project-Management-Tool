import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "sk_test_mock");

export const billingService = {
  async createCustomer(userId, email) {
    const customer = await stripe.customers.create({ email });
    return customer.id;
  },

  async createSubscription(customerId, priceId) {
    const subscription = await stripe.subscriptions.create({
      customer: customerId,
      items: [{ price: priceId }],
      payment_behavior: "default_incomplete",
      payment_settings: { save_default_payment_method: "on_subscription" },
      expand: ["latest_invoice.payment_intent"],
    });
    return subscription;
  },

  async createCheckoutSession(customerId, priceId) {
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ["card"],
      line_items: [{ price: priceId, quantity: 1 }],
      mode: "subscription",
      success_url: `${process.env.CLIENT_URL}/settings?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.CLIENT_URL}/settings`,
    });
    return session.url;
  },

  async cancelSubscription(subscriptionId) {
    const subscription = await stripe.subscriptions.update(subscriptionId, { cancel_at_period_end: true });
    return subscription;
  },
};
