import nodemailer from "nodemailer";

function createTransporter() {
  const user = process.env["ADMIN_EMAIL"] || "re32vo@gmail.com";
  const pass = process.env["GMAIL_APP_PASSWORD"];
  if (!user || !pass) return null;
  return nodemailer.createTransport({ service: "gmail", auth: { user, pass } });
}

const ADMIN_EMAIL = process.env["ADMIN_EMAIL"] || "re32vo@gmail.com";

export async function sendOrderNotification(order: {
  customerName: string; packageName: string; packageId: string;
  orderId: number; hasReceipt: boolean; customerEmail?: string;
}) {
  const transporter = createTransporter();
  if (!transporter) { console.warn("Email not configured"); return false; }

  await transporter.sendMail({
    from: `"ستوديو.كود" <${ADMIN_EMAIL}>`,
    to: ADMIN_EMAIL,
    subject: `طلب جديد #${order.orderId} - ${order.packageName}`,
    html: `
      <div dir="rtl" style="font-family:Arial,sans-serif;max-width:600px;margin:auto;background:#0d0020;color:white;border-radius:12px;padding:32px;">
        <h2 style="color:#7c3aed;">طلب جديد وصل!</h2>
        <hr style="border-color:#ffffff20;"/>
        <table style="width:100%;border-collapse:collapse;margin-top:16px;">
          <tr><td style="padding:8px;color:#aaa;">رقم الطلب:</td><td style="padding:8px;font-weight:bold;">#${order.orderId}</td></tr>
          <tr><td style="padding:8px;color:#aaa;">اسم العميل:</td><td style="padding:8px;font-weight:bold;">${order.customerName}</td></tr>
          <tr><td style="padding:8px;color:#aaa;">البريد الإلكتروني:</td><td style="padding:8px;">${order.customerEmail || "—"}</td></tr>
          <tr><td style="padding:8px;color:#aaa;">الباقة المطلوبة:</td><td style="padding:8px;font-weight:bold;">${order.packageName}</td></tr>
          <tr><td style="padding:8px;color:#aaa;">إيصال:</td><td style="padding:8px;">${order.hasReceipt ? "تم إرفاق إيصال" : "لا يوجد"}</td></tr>
        </table>
        <p style="margin-top:24px;color:#888;font-size:14px;">يمكنك الاطلاع على الطلب من لوحة التحكم والتحقق من التحويل.</p>
      </div>
    `,
  });
  return true;
}

export async function sendOtpEmail(otp: string) {
  const transporter = createTransporter();
  if (!transporter) { console.warn("Email not configured — OTP:", otp); return false; }
  await transporter.sendMail({
    from: `"ستوديو.كود" <${ADMIN_EMAIL}>`,
    to: ADMIN_EMAIL,
    subject: "كود تسجيل الدخول - ستوديو.كود",
    html: `
      <div dir="rtl" style="font-family:Arial,sans-serif;max-width:400px;margin:auto;background:#0d0020;color:white;border-radius:12px;padding:32px;text-align:center;">
        <h2 style="color:#7c3aed;">كود التحقق</h2>
        <p style="color:#aaa;">استخدم الكود التالي لتسجيل الدخول. صالح لمدة 10 دقائق.</p>
        <div style="font-size:48px;font-weight:bold;letter-spacing:12px;color:#00aaff;margin:24px 0;">${otp}</div>
      </div>
    `,
  });
  return true;
}

const statusLabels: Record<string, string> = {
  pending_review: "تحت المراجعة",
  in_progress: "جاري التجهيز",
  completed: "مكتمل",
  cancelled: "ملغي",
};

export async function sendOrderStatusEmail(to: string, order: {
  orderId: number; packageName: string; status: string; customerName: string;
}) {
  const transporter = createTransporter();
  if (!transporter) return false;

  const label = statusLabels[order.status] || order.status;
  const color = order.status === "completed" ? "#22c55e" : order.status === "cancelled" ? "#ef4444" : order.status === "in_progress" ? "#3b82f6" : "#f59e0b";

  await transporter.sendMail({
    from: `"ستوديو.كود" <${ADMIN_EMAIL}>`,
    to,
    subject: `تحديث طلبك #${order.orderId} - ${label}`,
    html: `
      <div dir="rtl" style="font-family:Arial,sans-serif;max-width:500px;margin:auto;background:#0d0020;color:white;border-radius:12px;padding:32px;">
        <div style="text-align:center;margin-bottom:24px;">
          <div style="width:60px;height:60px;border-radius:50%;background:${color}20;border:2px solid ${color};display:inline-flex;align-items:center;justify-content:center;font-size:28px;">
            ${order.status === "completed" ? "✓" : order.status === "cancelled" ? "✕" : order.status === "in_progress" ? "⚡" : "🔍"}
          </div>
        </div>
        <h2 style="text-align:center;color:${color};">تم تحديث حالة طلبك</h2>
        <p style="text-align:center;color:#aaa;">مرحباً ${order.customerName}، تم تحديث حالة طلبك إلى:</p>
        <div style="text-align:center;margin:20px 0;">
          <span style="background:${color}20;border:1px solid ${color};color:${color};padding:8px 24px;border-radius:20px;font-weight:bold;font-size:18px;">${label}</span>
        </div>
        <table style="width:100%;border-collapse:collapse;margin-top:16px;background:#ffffff08;border-radius:8px;padding:16px;">
          <tr><td style="padding:8px;color:#aaa;">رقم الطلب:</td><td style="padding:8px;font-weight:bold;">#${order.orderId}</td></tr>
          <tr><td style="padding:8px;color:#aaa;">الباقة:</td><td style="padding:8px;">${order.packageName}</td></tr>
        </table>
        <p style="margin-top:24px;color:#555;font-size:12px;text-align:center;">ستوديو.كود — لأي استفسار تواصل معنا عبر واتساب</p>
      </div>
    `,
  });
  return true;
}
