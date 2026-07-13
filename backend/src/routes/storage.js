import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import multer from "multer";
import { uploadFile, getFile, deleteFile, listFiles, getSignedDownloadUrl } from "../services/storage.js";

const router = Router();
router.use(requireAuth);
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 50 * 1024 * 1024 } });

router.post("/upload", upload.single("file"), async (req, res) => {
  if (!req.file) return res.status(400).json({ message: "No file provided" });
  const key = `${req.user.activeWorkspace || "shared"}/${Date.now()}-${req.file.originalname}`;
  const result = await uploadFile(key, req.file.buffer, req.file.mimetype);
  res.status(201).json({ ...result, url: `/api/storage/download?key=${encodeURIComponent(key)}` });
});

router.get("/download", async (req, res) => {
  const key = req.query.key;
  if (!key) return res.status(400).json({ message: "key query param required" });
  const file = await getFile(key);
  if (!file) return res.status(404).json({ message: "File not found" });
  res.set("Content-Type", file.contentType);
  res.send(file.buffer);
});

router.get("/signed-url", async (req, res) => {
  const key = req.query.key;
  if (!key) return res.status(400).json({ message: "key query param required" });
  const expiresIn = parseInt(req.query.expiresIn) || 3600;
  const url = await getSignedDownloadUrl(key, expiresIn);
  if (!url) return res.status(400).json({ message: "Signed URL not available" });
  res.json({ url });
});

router.delete("/", async (req, res) => {
  const key = req.query.key;
  if (!key) return res.status(400).json({ message: "key query param required" });
  await deleteFile(key);
  res.json({ message: "Deleted" });
});

router.get("/list", async (req, res) => {
  const prefix = req.query.prefix || `${req.user.activeWorkspace || "shared"}/`;
  const files = await listFiles(prefix);
  res.json(files);
});

export default router;
