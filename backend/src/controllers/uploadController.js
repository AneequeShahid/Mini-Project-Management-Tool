import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function uploadFile(req, res) {
  if (!req.file) return res.status(400).json({ message: "No file provided" });

  if (!process.env.CLOUDINARY_CLOUD_NAME) {
    return res.json({
      url: `data:${req.file.mimetype};base64,${req.file.buffer.toString("base64")}`,
      name: req.file.originalname,
      size: req.file.size,
      type: req.file.mimetype,
    });
  }

  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: "project-manager", resource_type: "auto" },
      (err, result) => {
        if (err) return res.status(500).json({ message: "Upload failed" });
        res.json({
          url: result.secure_url,
          name: req.file.originalname,
          size: req.file.size,
          type: req.file.mimetype,
          publicId: result.public_id,
        });
      }
    );
    stream.end(req.file.buffer);
  });
}

export async function deleteFile(req, res) {
  const { publicId } = req.body || {};
  if (publicId && process.env.CLOUDINARY_CLOUD_NAME) {
    await cloudinary.uploader.destroy(publicId);
  }
  res.json({ message: "File deleted" });
}
