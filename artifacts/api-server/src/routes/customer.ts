import { Router, type Request, type Response, type NextFunction } from "express";
import pkg from "pg";

const { Pool } = pkg;
const pool = new Pool({ connectionString: process.env["DATABASE_URL"] });

const router = Router();

async function requireCustomer(req: Request, res: Response, next: NextFunction) {
  const token = req.cookies?.customer_token as string | undefined;
  if (!token) { res.status(401).json({ error: "يجب تسجيل الدخول" }); return; }

  const result = await pool.query(
    `SELECT c.id, c.email, c.full_name FROM customer_sessions cs
     JOIN customers c ON c.id = cs.customer_id
     WHERE cs.token = $1 AND cs.expires_at > NOW()`,
    [token]
  );

  if (result.rows.length === 0) { res.status(401).json({ error: "الجلسة منتهية" }); return; }
  (req as Request & { customer: { id: number; email: string; fullName: string } }).customer = {
    id: result.rows[0].id as number,
    email: result.rows[0].email as string,
    fullName: result.rows[0].full_name as string,
  };
  next();
}

router.get("/customer/orders", requireCustomer, async (req, res) => {
  const customer = (req as Request & { customer: { id: number } }).customer;
  const result = await pool.query(
    `SELECT id, package_id, package_name, status, created_at,
            CASE WHEN receipt_data IS NOT NULL THEN TRUE ELSE FALSE END as has_receipt
     FROM orders WHERE customer_id = $1 ORDER BY created_at DESC`,
    [customer.id]
  );
  res.json({ orders: result.rows });
});

export { requireCustomer };
export default router;
