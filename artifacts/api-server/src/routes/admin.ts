import { Router, type Request, type Response, type NextFunction } from "express";
import pkg from "pg";
import { sendOrderStatusEmail } from "../lib/email.js";

const { Pool } = pkg;
const pool = new Pool({ connectionString: process.env["DATABASE_URL"] });

const ALLOWED_STATUSES = ["pending_review", "in_progress", "completed", "cancelled"];

const router = Router();

async function requireAdmin(req: Request, res: Response, next: NextFunction) {
  const token = req.cookies?.admin_token as string | undefined;
  if (!token) { res.status(401).json({ error: "غير مصرح" }); return; }
  const result = await pool.query(`SELECT id FROM admin_sessions WHERE token = $1 AND expires_at > NOW()`, [token]);
  if (result.rows.length === 0) { res.status(401).json({ error: "الجلسة منتهية" }); return; }
  next();
}

router.get("/admin/orders", requireAdmin, async (_req, res) => {
  const result = await pool.query(`
    SELECT o.id, o.package_id, o.package_name, o.customer_name, o.customer_email,
           o.receipt_filename, o.receipt_mimetype,
           CASE WHEN o.receipt_data IS NOT NULL THEN TRUE ELSE FALSE END as has_receipt,
           o.status, o.created_at, o.notes,
           c.full_name as c_full_name, c.phone as c_phone
    FROM orders o
    LEFT JOIN customers c ON c.id = o.customer_id
    ORDER BY o.created_at DESC
  `);
  res.json({ orders: result.rows });
});

router.patch("/admin/orders/:id", requireAdmin, async (req, res) => {
  const { id } = req.params;
  const { status, notes } = req.body as { status: string; notes?: string };

  if (!ALLOWED_STATUSES.includes(status)) {
    res.status(400).json({ error: "حالة غير صحيحة" });
    return;
  }

  // Get order info before updating for email
  const orderResult = await pool.query(
    `SELECT o.package_name, o.customer_name, o.customer_email, c.email as reg_email
     FROM orders o LEFT JOIN customers c ON c.id = o.customer_id WHERE o.id = $1`,
    [id]
  );

  if (orderResult.rows.length === 0) { res.status(404).json({ error: "الطلب غير موجود" }); return; }

  const order = orderResult.rows[0];

  await pool.query(
    `UPDATE orders SET status = $1, notes = COALESCE($2, notes) WHERE id = $3`,
    [status, notes || null, id]
  );

  // Send email to customer
  const emailTo = (order.customer_email || order.reg_email) as string | null;
  if (emailTo) {
    await sendOrderStatusEmail(emailTo, {
      orderId: Number(id),
      packageName: order.package_name as string,
      status,
      customerName: order.customer_name as string,
    });
  }

  res.json({ success: true });
});

router.get("/admin/orders/:id/receipt", requireAdmin, async (req, res) => {
  const result = await pool.query(`SELECT receipt_filename, receipt_mimetype, receipt_data FROM orders WHERE id = $1`, [req.params.id]);
  if (result.rows.length === 0 || !result.rows[0].receipt_data) { res.status(404).json({ error: "لا يوجد إيصال" }); return; }
  const row = result.rows[0];
  res.setHeader("Content-Type", row.receipt_mimetype as string);
  res.setHeader("Content-Disposition", `inline; filename="${row.receipt_filename}"`);
  res.send(row.receipt_data as Buffer);
});

router.get("/admin/stats", requireAdmin, async (_req, res) => {
  const result = await pool.query(`
    SELECT
      COUNT(*) as total,
      COUNT(*) FILTER (WHERE status = 'pending_review') as pending_review,
      COUNT(*) FILTER (WHERE status = 'in_progress') as in_progress,
      COUNT(*) FILTER (WHERE status = 'completed') as completed,
      COUNT(*) FILTER (WHERE status = 'cancelled') as cancelled
    FROM orders
  `);
  const customers = await pool.query(`SELECT COUNT(*) as total FROM customers`);
  res.json({ ...result.rows[0], total_customers: customers.rows[0].total });
});

router.get("/admin/customers", requireAdmin, async (_req, res) => {
  const result = await pool.query(`
    SELECT c.id, c.email, c.full_name, c.phone, c.created_at,
           COUNT(o.id) as order_count
    FROM customers c
    LEFT JOIN orders o ON o.customer_id = c.id
    GROUP BY c.id ORDER BY c.created_at DESC
  `);
  res.json({ customers: result.rows });
});

export default router;
