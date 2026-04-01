import { Router } from "express";
import multer from "multer";
import pkg from "pg";
import { sendOrderNotification } from "../lib/email.js";

const { Pool } = pkg;
const pool = new Pool({ connectionString: process.env["DATABASE_URL"] });

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowed = ["image/jpeg", "image/jpg", "image/png", "application/pdf"];
    cb(null, allowed.includes(file.mimetype));
  },
});

const router = Router();

router.post("/orders", upload.single("receipt"), async (req, res) => {
  try {
    const { packageId, packageName, customerName } = req.body as {
      packageId: string; packageName: string; customerName: string;
    };

    if (!packageId || !packageName || !customerName) {
      res.status(400).json({ error: "البيانات المطلوبة ناقصة" });
      return;
    }

    // Get customer from session if logged in
    let customerId: number | null = null;
    let customerEmail: string | null = null;
    const customerToken = req.cookies?.customer_token as string | undefined;
    if (customerToken) {
      const sessionResult = await pool.query(
        `SELECT c.id, c.email FROM customer_sessions cs
         JOIN customers c ON c.id = cs.customer_id
         WHERE cs.token = $1 AND cs.expires_at > NOW()`,
        [customerToken]
      );
      if (sessionResult.rows.length > 0) {
        customerId = sessionResult.rows[0].id as number;
        customerEmail = sessionResult.rows[0].email as string;
      }
    }

    const file = req.file;
    let result;
    if (file) {
      result = await pool.query(
        `INSERT INTO orders (package_id, package_name, customer_name, customer_id, customer_email,
                             receipt_filename, receipt_mimetype, receipt_data, status)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'pending_review') RETURNING id`,
        [packageId, packageName, customerName, customerId, customerEmail,
         file.originalname, file.mimetype, file.buffer]
      );
    } else {
      result = await pool.query(
        `INSERT INTO orders (package_id, package_name, customer_name, customer_id, customer_email, status)
         VALUES ($1, $2, $3, $4, $5, 'pending_review') RETURNING id`,
        [packageId, packageName, customerName, customerId, customerEmail]
      );
    }

    const orderId = result.rows[0].id as number;
    await sendOrderNotification({ customerName, packageName, packageId, orderId, hasReceipt: !!file, customerEmail: customerEmail || undefined });

    res.json({ success: true, orderId });
  } catch (err) {
    console.error("Order error:", err);
    res.status(500).json({ error: "حدث خطأ" });
  }
});

export default router;
