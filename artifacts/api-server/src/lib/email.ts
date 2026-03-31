import nodemailer from "nodemailer";

function createTransporter() {
  const user = process.env["GMAIL_USER"] || process.env["ADMIN_EMAIL"];
  const pass = process.env["GMAIL_APP_PASSWORD"];

  if (!user || !pass) {
    return null;
  }

  return nodemailer.createTransport({
    service: "gmail",
    auth: { user, pass },
  });
}

export async function sendOrderNotification(order: {
  customerName: string;
  packageName: string;
  packageId: string;
  orderId: number;
  hasReceipt: boolean;
}) {
  const transporter = createTransporter();
  if (!transporter) {
    console.warn("Email not configured: GMAIL_APP_PASSWORD missing");
    return false;
  }

  const adminEmail = process.env["ADMIN_EMAIL"] || "re32vo@gmail.com";

  await transporter.sendMail({
    from: `"ستوديو.كود" <${adminEmail}>`,
    to: adminEmail,
    subject: `طلب جديد #${order.orderId} - ${order.packageName}`,
    html: `
      <div dir="rtl" style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; background: #0d0020; color: white; border-radius: 12px; padding: 32px;">
        <h2 style="color: #7c3aed;">طلب جديد وصل!</h2>
        <hr style="border-color: #ffffff20;" />
        <table style="width: 100%; border-collapse: collapse; margin-top: 16px;">
          <tr><td style="padding: 8px; color: #aaa;">رقم الطلب:</td><td style="padding: 8px; font-weight: bold;">#${order.orderId}</td></tr>
          <tr><td style="padding: 8px; color: #aaa;">اسم العميل:</td><td style="padding: 8px; font-weight: bold;">${order.customerName}</td></tr>
          <tr><td style="padding: 8px; color: #aaa;">الباقة المطلوبة:</td><td style="padding: 8px; font-weight: bold;">${order.packageName}</td></tr>
          <tr><td style="padding: 8px; color: #aaa;">الإيصال:</td><td style="padding: 8px;">${order.hasReceipt ? "تم إرفاق إيصال" : "لا يوجد إيصال"}</td></tr>
        </table>
        <p style="margin-top: 24px; color: #888; font-size: 14px;">يمكنك الاطلاع على الطلب من لوحة التحكم.</p>
      </div>
    `,
  });

  return true;
}

export async function sendOtpEmail(otp: string) {
  const transporter = createTransporter();
  const adminEmail = process.env["ADMIN_EMAIL"] || "re32vo@gmail.com";

  if (!transporter) {
    console.warn("Email not configured — OTP:", otp);
    return false;
  }

  await transporter.sendMail({
    from: `"ستوديو.كود" <${adminEmail}>`,
    to: adminEmail,
    subject: "كود تسجيل الدخول - ستوديو.كود",
    html: `
      <div dir="rtl" style="font-family: Arial, sans-serif; max-width: 400px; margin: auto; background: #0d0020; color: white; border-radius: 12px; padding: 32px; text-align: center;">
        <h2 style="color: #7c3aed;">كود التحقق</h2>
        <p style="color: #aaa;">استخدم الكود التالي لتسجيل الدخول. صالح لمدة 10 دقائق.</p>
        <div style="font-size: 48px; font-weight: bold; letter-spacing: 12px; color: #00aaff; margin: 24px 0;">${otp}</div>
        <p style="color: #666; font-size: 12px;">إذا لم تطلب هذا الكود، تجاهل هذا البريد.</p>
      </div>
    `,
  });

  return true;
}
