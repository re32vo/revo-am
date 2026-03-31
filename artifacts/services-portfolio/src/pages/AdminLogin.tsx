import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation } from "wouter";
import { Mail, KeyRound, Loader2, TerminalSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

const ADMIN_EMAIL = "re32vo@gmail.com";

export default function AdminLogin() {
  const [, navigate] = useLocation();
  const { toast } = useToast();

  const [step, setStep] = useState<"email" | "otp">("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (email.toLowerCase() !== ADMIN_EMAIL.toLowerCase()) {
      toast({ title: "البريد غير مصرح", description: "هذا البريد غير مخول للدخول", variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
        credentials: "include",
      });
      const data = await res.json() as { success: boolean; error?: string; devOtp?: string };
      if (!res.ok) throw new Error(data.error || "حدث خطأ");

      if (data.devOtp) {
        toast({ title: "وضع التطوير", description: `الكود: ${data.devOtp}` });
      } else {
        toast({ title: "تم إرسال الكود", description: "تحقق من بريدك الإلكتروني" });
      }
      setStep("otp");
    } catch (err) {
      toast({ title: "خطأ", description: err instanceof Error ? err.message : "حاول مرة أخرى", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ otp }),
        credentials: "include",
      });
      const data = await res.json() as { success: boolean; error?: string };
      if (!res.ok) throw new Error(data.error || "الكود غير صحيح");
      navigate("/admin/dashboard");
    } catch (err) {
      toast({ title: "خطأ", description: err instanceof Error ? err.message : "حاول مرة أخرى", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4" dir="rtl">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-primary/15 blur-[100px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        className="w-full max-w-md glass-panel p-10 rounded-3xl border border-white/10 relative z-10"
      >
        <div className="text-center mb-10">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center mx-auto mb-4 shadow-[0_0_20px_rgba(124,58,237,0.5)]">
            <TerminalSquare className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-2xl font-bold">لوحة التحكم</h1>
          <p className="text-white/50 text-sm mt-2">ستوديو.كود — المدير</p>
        </div>

        <AnimatePresence mode="wait">
          {step === "email" ? (
            <motion.form
              key="email"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              onSubmit={handleSendOtp}
              className="space-y-5"
            >
              <div className="space-y-2">
                <label className="text-sm font-semibold text-white/70 block">البريد الإلكتروني</label>
                <div className="relative">
                  <Mail className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                  <Input
                    type="email"
                    required
                    placeholder="أدخل بريدك الإلكتروني"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pr-11 bg-white/5 border-white/15 h-13 rounded-xl text-white placeholder:text-white/25 focus-visible:border-primary"
                  />
                </div>
              </div>
              <Button
                type="submit"
                disabled={loading}
                className="w-full h-13 rounded-xl bg-gradient-to-r from-primary to-secondary text-white font-bold flex items-center justify-center gap-2"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                إرسال كود التحقق
              </Button>
            </motion.form>
          ) : (
            <motion.form
              key="otp"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              onSubmit={handleVerifyOtp}
              className="space-y-5"
            >
              <div className="text-center mb-6 p-4 rounded-xl bg-primary/10 border border-primary/20">
                <p className="text-sm text-white/70">
                  تم إرسال كود التحقق إلى
                </p>
                <p className="font-bold text-primary mt-1">{email}</p>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-white/70 block">كود التحقق</label>
                <div className="relative">
                  <KeyRound className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                  <Input
                    type="text"
                    required
                    placeholder="أدخل الكود المكون من 6 أرقام"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                    className="pr-11 bg-white/5 border-white/15 h-13 rounded-xl text-white placeholder:text-white/25 focus-visible:border-primary tracking-[0.3em] text-center text-xl"
                    maxLength={6}
                  />
                </div>
              </div>
              <Button
                type="submit"
                disabled={loading || otp.length < 6}
                className="w-full h-13 rounded-xl bg-gradient-to-r from-primary to-secondary text-white font-bold flex items-center justify-center gap-2"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                دخول
              </Button>
              <button
                type="button"
                onClick={() => { setStep("email"); setOtp(""); }}
                className="w-full text-center text-sm text-white/40 hover:text-white/70 transition-colors"
              >
                العودة لإدخال البريد
              </button>
            </motion.form>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
