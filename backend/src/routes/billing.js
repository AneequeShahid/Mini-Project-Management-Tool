import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import { createBillingCustomer, createSubscriptionSession, cancelSubscription, getSubscriptionStatus } from "../controllers/billingController.js";

const router = Router();
router.use(requireAuth);

router.post("/customer", createBillingCustomer);
router.post("/subscribe", createSubscriptionSession);
router.post("/cancel", cancelSubscription);
router.get("/status", getSubscriptionStatus);

export default router;
