import { Router, type Request, type Response, type NextFunction } from "express";
import pkg from "pg";

const { Pool } = pkg;
const pool = new Pool({ connectionString: process.env["DATABASE_URL"] });

const router = Router();

async function requireAdmin(req: Request, res: Response, next: NextFunction) {
  const token = req.cookies?.admin_token as string | undefined;
  if (!token) { res.status(401).json({ error: "غير مصرح" }); return; }

  const result = await pool.query(
    `SELECT id FROM admin_sessions WHERE token = $1 AND expires_at > NOW()`,
    [token]
  );

  if (result.rows.length === 0) { res.status(401).json({ error: "الجلسة منتهية" }); return; }
  next();
}

router.get("/admin/orders", requireAdmin, async (_req, res) => {
  const result = await pool.query(
    `SELECT id, package_id, package_name, customer_name,
            receipt_filename, receipt_mimetype,
            CASE WHEN receipt_data IS NOT NULL THEN TRUE ELSE FALSE END as has_receipt,
            status, created_at
     FROM orders ORDER BY created_at DESC`
  );
  res.json({ orders: result.rows });
});

router.patch("/admin/orders/:id", requireAdmin, async (req, res) => {
  const { id } = req.params;
  const { status } = req.body as { status: string };

  const allowed = ["pending", "confirmed", "delivered", "cancelled"];
  if (!allowed.includes(status)) {
    res.status(400).json({ error: "حالة غير صحيحة" });
    return;
  }

  await pool.query(`UPDATE orders SET status = $1 WHERE id = $2`, [status, id]);
  res.json({ success: true });
});

router.get("/admin/orders/:id/receipt", requireAdmin, async (req, res) => {
  const { id } = req.params;
  const result = await pool.query(
    `SELECT receipt_filename, receipt_mimetype, receipt_data FROM orders WHERE id = $1`,
    [id]
  );

  if (result.rows.length === 0 || !result.rows[0].receipt_data) {
    res.status(404).json({ error: "لا يوجد إيصال" });
    return;
  }

  const row = result.rows[0];
  res.setHeader("Content-Type", row.receipt_mimetype);
  res.setHeader("Content-Disposition", `inline; filename="${row.receipt_filename}"`);
  res.send(row.receipt_data);
});

router.get("/admin/stats", requireAdmin, async (_req, res) => {
  const result = await pool.query(`
    SELECT 
      COUNT(*) as total,
      COUNT(*) FILTER (WHERE status = 'pending') as pending,
      COUNT(*) FILTER (WHERE status = 'confirmed') as confirmed,
      COUNT(*) FILTER (WHERE status = 'delivered') as delivered
    FROM orders
  `);
  res.json(result.rows[0]);
});

export default router;
