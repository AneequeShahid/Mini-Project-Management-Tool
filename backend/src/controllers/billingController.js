export async function getBilling(req, res) {
  res.json({ message: "Billing endpoint placeholder", billing: [] });
}

export async function createBillingPortalSession(req, res) {
  res.json({ message: "Billing portal placeholder" });
}

export async function createBillingCustomer(req, res) {
  res.json({ message: "Billing customer placeholder" });
}

export async function createSubscriptionSession(req, res) {
  res.json({ message: "Subscription session placeholder" });
}

export async function cancelSubscription(req, res) {
  res.json({ message: "Subscription cancel placeholder" });
}

export async function getSubscriptionStatus(req, res) {
  res.json({ message: "Subscription status placeholder" });
}
