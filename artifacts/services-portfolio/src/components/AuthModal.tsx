import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Mail, Lock, User, Loader2, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

interface AuthModalProps {
  onSuccess: () => void;
  onClose: () => void;
  packageName: string;
}

type Step = "email" | "login" | "register";

export default function AuthModal({ onSuccess, onClose, packageName }: AuthModalProps) {
  const { refetch } = useAuth();
  const { toast } = useToast();

  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  const checkEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    try {
      const res = await fetch(`${BASE}/api/auth/customer/check-email`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
        credentials: "include",
      });
      const data = await res.json() as { exists: boolean };
      setStep(data.exists ? "login" : "register");
    } catch {
      toast({ title: "حدث خطأ", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`${BASE}/api/auth/customer/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), password }),
        credentials: "include",
      });
      const data = await res.json() as { error?: string };
      if (!res.ok) throw new Error(data.error || "خطأ في تسجيل الدخول");
      refetch();
      onSuccess();
    } catch (err) {
      toast({ title: err instanceof Error ? err.message : "خطأ", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) { toast({ title: "الاسم مطلوب", variant: "destructive" }); return; }
    if (password.length < 6) { toast({ title: "كلمة المرور 6 أحرف على الأقل", variant: "destructive" }); return; }
    setLoading(true);
    try {
      const res = await fetch(`${BASE}/api/auth/customer/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), password, fullName: fullName.trim() }),
        credentials: "include",
      });
      const data = await res.json() as { error?: string };
      if (!res.ok) throw new Error(data.error || "خطأ في إنشاء الحساب");
      refetch();
      onSuccess();
    } catch (err) {
      toast({ title: err instanceof Error ? err.message : "خطأ", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(8px)" }}
        onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="w-full max-w-md relative"
          style={{
            background: "linear-gradient(135deg, rgba(13,0,32,0.98), rgba(30,0,60,0.98))",
            border: "1px solid rgba(124,58,237,0.3)",
            borderRadius: "24px",
            padding: "40px",
            boxShadow: "0 0 60px rgba(124,58,237,0.2)",
          }}
          dir="rtl"
        >
          {/* Close */}
          <button
            onClick={onClose}
            className="absolute top-4 left-4 text-white/40 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Logo glow */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-60 h-24 rounded-full bg-purple-600/20 blur-2xl pointer-events-none" />

          {/* Content */}
          <div className="relative">
            <div className="text-center mb-8">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center mx-auto mb-4">
                {step === "email" ? <Mail className="w-7 h-7 text-white" /> :
                 step === "login" ? <Lock className="w-7 h-7 text-white" /> :
                 <User className="w-7 h-7 text-white" />}
              </div>
              {step === "email" && (
                <>
                  <h2 className="text-2xl font-black mb-2">أكمل طلبك</h2>
                  <p className="text-white/50 text-sm">أدخل بريدك الإلكتروني للمتابعة وشراء</p>
                  <p className="text-primary text-sm font-semibold mt-1">{packageName}</p>
                </>
              )}
              {step === "login" && (
                <>
                  <h2 className="text-2xl font-black mb-2">مرحباً بعودتك</h2>
                  <p className="text-white/50 text-sm">أدخل كلمة المرور للدخول إلى حسابك</p>
                  <p className="text-white/40 text-xs mt-1">{email}</p>
                </>
              )}
              {step === "register" && (
                <>
                  <h2 className="text-2xl font-black mb-2">أنشئ حسابك</h2>
                  <p className="text-white/50 text-sm">مرحباً! لم نجد حساباً لهذا البريد</p>
                  <p className="text-white/40 text-xs mt-1">{email}</p>
                </>
              )}
            </div>

            {step === "email" && (
              <form onSubmit={checkEmail} className="space-y-4">
                <div className="relative">
                  <Mail className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                  <Input
                    type="email"
                    placeholder="بريدك الإلكتروني"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="bg-white/5 border-white/15 rounded-xl text-white placeholder:text-white/25 focus-visible:border-primary pr-10 h-12"
                    dir="ltr"
                  />
                </div>
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full h-12 rounded-xl bg-gradient-to-r from-primary to-secondary text-white font-bold"
                >
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "متابعة"}
                </Button>
              </form>
            )}

            {step === "login" && (
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="relative">
                  <button type="button" onClick={() => setShowPass(p => !p)} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60">
                    {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                  <Input
                    type={showPass ? "text" : "password"}
                    placeholder="كلمة المرور"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="bg-white/5 border-white/15 rounded-xl text-white placeholder:text-white/25 focus-visible:border-primary pl-10 h-12"
                  />
                </div>
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full h-12 rounded-xl bg-gradient-to-r from-primary to-secondary text-white font-bold"
                >
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "تسجيل الدخول"}
                </Button>
                <button type="button" onClick={() => setStep("email")} className="w-full text-center text-xs text-white/40 hover:text-white/60 transition-colors">
                  تغيير البريد
                </button>
              </form>
            )}

            {step === "register" && (
              <form onSubmit={handleRegister} className="space-y-4">
                <div className="relative">
                  <User className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                  <Input
                    placeholder="الاسم الكامل"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                    className="bg-white/5 border-white/15 rounded-xl text-white placeholder:text-white/25 focus-visible:border-primary pr-10 h-12"
                  />
                </div>
                <div className="relative">
                  <button type="button" onClick={() => setShowPass(p => !p)} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60">
                    {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                  <Input
                    type={showPass ? "text" : "password"}
                    placeholder="كلمة المرور (6 أحرف على الأقل)"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                    className="bg-white/5 border-white/15 rounded-xl text-white placeholder:text-white/25 focus-visible:border-primary pl-10 h-12"
                  />
                </div>
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full h-12 rounded-xl bg-gradient-to-r from-primary to-secondary text-white font-bold"
                >
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "إنشاء حساب والمتابعة"}
                </Button>
                <button type="button" onClick={() => setStep("email")} className="w-full text-center text-xs text-white/40 hover:text-white/60 transition-colors">
                  تغيير البريد
                </button>
              </form>
            )}

            <p className="mt-6 text-center text-xs text-white/20">
              بالمتابعة توافق على شروط الخدمة وسياسة الخصوصية
            </p>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
