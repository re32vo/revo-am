import { Router } from "express";
import crypto from "crypto";
import pkg from "pg";
import { sendOtpEmail } from "../lib/email.js";

const { Pool } = pkg;
const pool = new Pool({ connectionString: process.env["DATABASE_URL"] });

const ADMIN_EMAIL = process.env["ADMIN_EMAIL"] || "re32vo@gmail.com";

const router = Router();

router.post("/auth/send-otp", async (req, res) => {
  try {
    const { email } = req.body as { email: string };

    if (!email || email.toLowerCase() !== ADMIN_EMAIL.toLowerCase()) {
      res.status(403).json({ error: "البريد الإلكتروني غير مصرح به" });
      return;
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    await pool.query(
      `INSERT INTO otp_codes (code, expires_at) VALUES ($1, $2)`,
      [otp, expiresAt]
    );

    const sent = await sendOtpEmail(otp);

    if (!sent) {
      // Dev fallback — return OTP in response (remove in production)
      res.json({ success: true, devOtp: process.env["NODE_ENV"] === "development" ? otp : undefined });
      return;
    }

    res.json({ success: true });
  } catch (err) {
    console.error("OTP error:", err);
    res.status(500).json({ error: "حدث خطأ في إرسال الكود" });
  }
});

router.post("/auth/verify-otp", async (req, res) => {
  try {
    const { otp } = req.body as { otp: string };

    if (!otp) {
      res.status(400).json({ error: "الكود مطلوب" });
      return;
    }

    const result = await pool.query(
      `SELECT id FROM otp_codes WHERE code = $1 AND used = FALSE AND expires_at > NOW() ORDER BY created_at DESC LIMIT 1`,
      [otp]
    );

    if (result.rows.length === 0) {
      res.status(401).json({ error: "الكود غير صحيح أو منتهي الصلاحية" });
      return;
    }

    await pool.query(`UPDATE otp_codes SET used = TRUE WHERE id = $1`, [result.rows[0].id]);

    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    await pool.query(
      `INSERT INTO admin_sessions (token, expires_at) VALUES ($1, $2)`,
      [token, expiresAt]
    );

    res.cookie("admin_token", token, {
      httpOnly: true,
      secure: process.env["NODE_ENV"] === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.json({ success: true });
  } catch (err) {
    console.error("Verify OTP error:", err);
    res.status(500).json({ error: "حدث خطأ" });
  }
});

router.post("/auth/logout", async (req, res) => {
  const token = req.cookies?.admin_token as string | undefined;
  if (token) {
    await pool.query(`DELETE FROM admin_sessions WHERE token = $1`, [token]);
  }
  res.clearCookie("admin_token");
  res.json({ success: true });
});

router.get("/auth/me", async (req, res) => {
  const token = req.cookies?.admin_token as string | undefined;
  if (!token) { res.json({ authenticated: false }); return; }

  const result = await pool.query(
    `SELECT id FROM admin_sessions WHERE token = $1 AND expires_at > NOW()`,
    [token]
  );

  res.json({ authenticated: result.rows.length > 0 });
});

export default router;
