import { Router } from "express";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import pkg from "pg";

const { Pool } = pkg;
const pool = new Pool({ connectionString: process.env["DATABASE_URL"] });

const router = Router();

// Check if email exists
router.post("/customer/check-email", async (req, res) => {
  const { email } = req.body as { email: string };
  if (!email) { res.status(400).json({ error: "البريد مطلوب" }); return; }
  const result = await pool.query(`SELECT id FROM customers WHERE email = $1`, [email.toLowerCase()]);
  res.json({ exists: result.rows.length > 0 });
});

// Register
router.post("/customer/register", async (req, res) => {
  try {
    const { email, password, fullName } = req.body as { email: string; password: string; fullName: string };
    if (!email || !password || !fullName) { res.status(400).json({ error: "جميع الحقول مطلوبة" }); return; }
    if (password.length < 6) { res.status(400).json({ error: "كلمة المرور يجب أن تكون 6 أحرف على الأقل" }); return; }

    const exists = await pool.query(`SELECT id FROM customers WHERE email = $1`, [email.toLowerCase()]);
    if (exists.rows.length > 0) { res.status(409).json({ error: "البريد مستخدم بالفعل" }); return; }

    const hash = await bcrypt.hash(password, 10);
    const insert = await pool.query(
      `INSERT INTO customers (email, password_hash, full_name) VALUES ($1, $2, $3) RETURNING id, email, full_name`,
      [email.toLowerCase(), hash, fullName]
    );
    const customer = insert.rows[0];
    const token = await createSession(customer.id as number);

    res.cookie("customer_token", token, { httpOnly: true, secure: process.env["NODE_ENV"] === "production", sameSite: "lax", maxAge: 30 * 24 * 60 * 60 * 1000 });
    res.json({ success: true, customer: { id: customer.id, email: customer.email, fullName: customer.full_name } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "حدث خطأ" });
  }
});

// Login
router.post("/customer/login", async (req, res) => {
  try {
    const { email, password } = req.body as { email: string; password: string };
    if (!email || !password) { res.status(400).json({ error: "البريد وكلمة المرور مطلوبان" }); return; }

    const result = await pool.query(`SELECT id, email, full_name, password_hash FROM customers WHERE email = $1`, [email.toLowerCase()]);
    if (result.rows.length === 0) { res.status(401).json({ error: "البريد أو كلمة المرور غير صحيحة" }); return; }

    const customer = result.rows[0];
    const match = await bcrypt.compare(password, customer.password_hash as string);
    if (!match) { res.status(401).json({ error: "البريد أو كلمة المرور غير صحيحة" }); return; }

    const token = await createSession(customer.id as number);
    res.cookie("customer_token", token, { httpOnly: true, secure: process.env["NODE_ENV"] === "production", sameSite: "lax", maxAge: 30 * 24 * 60 * 60 * 1000 });
    res.json({ success: true, customer: { id: customer.id, email: customer.email, fullName: customer.full_name } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "حدث خطأ" });
  }
});

// Me
router.get("/customer/me", async (req, res) => {
  const token = req.cookies?.customer_token as string | undefined;
  if (!token) { res.json({ authenticated: false }); return; }

  const result = await pool.query(
    `SELECT c.id, c.email, c.full_name FROM customer_sessions cs
     JOIN customers c ON c.id = cs.customer_id
     WHERE cs.token = $1 AND cs.expires_at > NOW()`,
    [token]
  );

  if (result.rows.length === 0) { res.json({ authenticated: false }); return; }
  const c = result.rows[0];
  res.json({ authenticated: true, customer: { id: c.id, email: c.email, fullName: c.full_name } });
});

// Logout
router.post("/customer/logout", async (req, res) => {
  const token = req.cookies?.customer_token as string | undefined;
  if (token) await pool.query(`DELETE FROM customer_sessions WHERE token = $1`, [token]);
  res.clearCookie("customer_token");
  res.json({ success: true });
});

async function createSession(customerId: number): Promise<string> {
  const token = crypto.randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
  await pool.query(`INSERT INTO customer_sessions (customer_id, token, expires_at) VALUES ($1, $2, $3)`, [customerId, token, expiresAt]);
  return token;
}

export default router;
