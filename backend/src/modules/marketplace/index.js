import { Router } from "express";
import { requireAuth } from "../../middleware/auth.js";
import {
  listPlugins, getPlugin, installPlugin, uninstallPlugin, publishPlugin,
} from "../../controllers/marketplaceController.js";

const router = Router();
router.use(requireAuth);

router.get("/", listPlugins);
router.get("/:id", getPlugin);
router.post("/publish", publishPlugin);
router.post("/:id/install", installPlugin);
router.post("/:id/uninstall", uninstallPlugin);

export default router;
