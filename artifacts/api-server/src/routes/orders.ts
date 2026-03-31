import { Router } from "express";
import multer from "multer";
import pkg from "pg";
import { sendOrderNotification } from "../lib/email.js";

const { Pool } = pkg;
const pool = new Pool({ connectionString: process.env["DATABASE_URL"] });

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (_req, file, cb) => {
    const allowed = ["image/jpeg", "image/jpg", "image/png", "application/pdf"];
    cb(null, allowed.includes(file.mimetype));
  },
});

const router = Router();

router.post("/orders", upload.single("receipt"), async (req, res) => {
  try {
    const { packageId, packageName, customerName } = req.body as {
      packageId: string;
      packageName: string;
      customerName: string;
    };

    if (!packageId || !packageName || !customerName) {
      res.status(400).json({ error: "البيانات المطلوبة ناقصة" });
      return;
    }

    const file = req.file;
    
    let result;
    if (file) {
      result = await pool.query(
        `INSERT INTO orders (package_id, package_name, customer_name, receipt_filename, receipt_mimetype, receipt_data, status)
         VALUES ($1, $2, $3, $4, $5, $6, 'pending') RETURNING id`,
        [packageId, packageName, customerName, file.originalname, file.mimetype, file.buffer]
      );
    } else {
      result = await pool.query(
        `INSERT INTO orders (package_id, package_name, customer_name, status)
         VALUES ($1, $2, $3, 'pending') RETURNING id`,
        [packageId, packageName, customerName]
      );
    }

    const orderId = result.rows[0].id as number;

    await sendOrderNotification({
      customerName,
      packageName,
      packageId,
      orderId,
      hasReceipt: !!file,
    });

    res.json({ success: true, orderId });
  } catch (err) {
    console.error("Order error:", err);
    res.status(500).json({ error: "حدث خطأ, الرجاء المحاولة لاحقاً" });
  }
});

export default router;
