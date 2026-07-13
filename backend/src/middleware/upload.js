import multer from "multer";

const storage = multer.memoryStorage();

export const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|gif|webp|pdf|doc|docx|zip|fig/i;
    const ext = allowed.test(file.originalname.split(".").pop());
    cb(null, ext ? true : new Error("File type not allowed"));
  },
});
