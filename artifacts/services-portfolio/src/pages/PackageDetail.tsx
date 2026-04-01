import { useState } from "react";
import { motion } from "framer-motion";
import { useParams, useLocation } from "wouter";
import { CheckCircle2, Upload, ArrowRight, X, FileText, ImageIcon, Loader2, User, LogOut, LayoutDashboard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import AuthModal from "@/components/AuthModal";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");
const WHATSAPP_NUMBER = "966533170903";

const packagesData = {
  basic: {
    name: "الباقة الأساسية",
    subtitle: "مثالية للمشاريع الناشئة والتعريفية",
    color: "from-blue-600 to-cyan-500",
    glowColor: "rgba(59,130,246,0.4)",
    features: [
      "موقع بسيط واحترافي",
      "تصميم متجاوب على جميع الأجهزة",
      "حتى 5 صفحات",
      "نموذج تواصل",
      "تسليم خلال 7 أيام",
    ],
  },
  pro: {
    name: "الباقة الاحترافية",
    subtitle: "للمشاريع المتوسطة والأعمال المتنامية",
    color: "from-purple-600 to-violet-500",
    glowColor: "rgba(124,58,237,0.5)",
    features: [
      "موقع متكامل متعدد الوظائف",
      "لوحة تحكم مخصصة",
      "حتى 15 صفحة",
      "قاعدة بيانات متطورة",
      "نظام إدارة محتوى",
      "تسليم خلال 21 يوم",
    ],
  },
  premium: {
    name: "الباقة المميزة",
    subtitle: "حلول شاملة للشركات الكبرى",
    color: "from-purple-500 to-pink-500",
    glowColor: "rgba(168,85,247,0.4)",
    features: [
      "حل برمجي متكامل",
      "تطبيق جوال (iOS و Android)",
      "دعم فني لمدة 3 أشهر",
      "تكامل مع الأنظمة الخارجية",
      "خادم مخصص وأداء عالي",
      "تسليم خلال 45 يوم",
    ],
  },
};

type PackageId = keyof typeof packagesData;

export default function PackageDetail() {
  const { id } = useParams<{ id: string }>();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const { customer, loading: authLoading, logout } = useAuth();

  const pkg = packagesData[id as PackageId];
  const [file, setFile] = useState<File | null>(null);
  const [loadingSubmit, setLoadingSubmit] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);

  if (!pkg) { navigate("/"); return null; }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const allowed = ["image/jpeg", "image/jpg", "image/png", "application/pdf"];
    if (!allowed.includes(f.type)) {
      toast({ title: "نوع الملف غير مدعوم", description: "يرجى رفع صورة (JPG/PNG) أو ملف PDF", variant: "destructive" });
      return;
    }
    if (f.size > 10 * 1024 * 1024) {
      toast({ title: "الملف كبير جداً", description: "الحد الأقصى 10 ميغابايت", variant: "destructive" });
      return;
    }
    setFile(f);
  };

  const submitOrder = async () => {
    if (!file) {
      toast({ title: "الإيصال مطلوب", description: "يرجى إرفاق إيصال التحويل", variant: "destructive" });
      return;
    }
    if (!customer) { setShowAuthModal(true); return; }

    setLoadingSubmit(true);
    try {
      const formData = new FormData();
      formData.append("packageId", id!);
      formData.append("packageName", pkg.name);
      formData.append("customerName", customer.fullName);
      formData.append("receipt", file);

      const res = await fetch(`${BASE}/api/orders`, { method: "POST", body: formData, credentials: "include" });
      if (!res.ok) {
        const err = await res.json() as { error: string };
        throw new Error(err.error || "حدث خطأ");
      }
      setSubmitted(true);
    } catch (err) {
      toast({ title: "حدث خطأ", description: err instanceof Error ? err.message : "حاول مرة أخرى", variant: "destructive" });
    } finally {
      setLoadingSubmit(false);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customer) { setShowAuthModal(true); return; }
    void submitOrder();
  };

  const handleWhatsAppDirect = () => {
    const text = `مرحبا، اريد الاستفسار عن ${pkg.name}`;
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`, "_blank");
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4" dir="rtl">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full glass-panel p-10 rounded-3xl text-center"
        >
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", delay: 0.2 }}
            className="w-20 h-20 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-10 h-10 text-green-400" />
          </motion.div>
          <h2 className="text-2xl font-bold mb-3">تم استلام طلبك</h2>
          <p className="text-white/60 mb-3">شكراً {customer?.fullName}! تم إرسال طلبك بنجاح.</p>
          <p className="text-white/40 text-sm mb-8">سيتم مراجعة التحويل وإعلامك عبر البريد الإلكتروني بحالة طلبك.</p>
          <div className="flex flex-col gap-3">
            <Button onClick={() => navigate("/dashboard")} className="rounded-full bg-gradient-to-r from-primary to-secondary hover:opacity-90 text-white px-8">
              عرض طلباتي
            </Button>
            <Button onClick={() => navigate("/")} variant="outline" className="rounded-full border-white/15 text-white/60 hover:bg-white/5">
              العودة للرئيسية
            </Button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background" dir="rtl">
      {showAuthModal && (
        <AuthModal
          packageName={pkg.name}
          onClose={() => setShowAuthModal(false)}
          onSuccess={() => { setShowAuthModal(false); void submitOrder(); }}
        />
      )}

      {/* Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className={`absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] rounded-full bg-gradient-to-r ${pkg.color} opacity-10 blur-[100px]`} />
      </div>

      {/* Top bar */}
      <div className="relative z-10 border-b border-white/5 bg-black/10 backdrop-blur-sm">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <button onClick={() => navigate("/")} className="flex items-center gap-2 text-white/60 hover:text-white transition-colors text-sm">
            <ArrowRight className="w-4 h-4" />
            الرئيسية
          </button>
          {!authLoading && (
            customer ? (
              <div className="flex items-center gap-3 text-sm">
                <button onClick={() => navigate("/dashboard")} className="flex items-center gap-1.5 text-white/60 hover:text-white transition-colors">
                  <LayoutDashboard className="w-4 h-4" />
                  <span className="hidden sm:block">طلباتي</span>
                </button>
                <div className="flex items-center gap-2 text-white/80">
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                    <User className="w-3.5 h-3.5 text-white" />
                  </div>
                  <span className="hidden sm:block text-sm">{customer.fullName.split(" ")[0]}</span>
                </div>
                <button onClick={logout} className="text-white/30 hover:text-red-400 transition-colors">
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button onClick={() => setShowAuthModal(true)} className="text-sm text-white/50 hover:text-white transition-colors">
                تسجيل الدخول
              </button>
            )
          )}
        </div>
      </div>

      <main className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 py-12">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-14">
          <div className={`inline-block px-5 py-2 rounded-full bg-gradient-to-r ${pkg.color} text-white text-sm font-bold mb-4`}>
            {pkg.subtitle}
          </div>
          <h1 className="text-4xl md:text-5xl font-black mb-3">{pkg.name}</h1>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left */}
          <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }} className="space-y-6">
            <div className="glass-panel p-8 rounded-3xl">
              <h3 className="text-xl font-bold mb-6 text-white/90">ما يشمله هذه الباقة</h3>
              <ul className="space-y-4">
                {pkg.features.map((feature, i) => (
                  <motion.li key={i} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 + i * 0.07 }} className="flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-green-400 shrink-0" />
                    <span className="text-white/80">{feature}</span>
                  </motion.li>
                ))}
              </ul>
            </div>

            <div className="glass-panel p-8 rounded-3xl border border-yellow-500/20">
              <h3 className="text-xl font-bold mb-2">بيانات التحويل البنكي</h3>
              <p className="text-white/50 text-sm mb-6">قم بالتحويل ثم أرفق الإيصال في النموذج</p>
              <div className="space-y-3">
                {[
                  { label: "البنك", value: "مصرف الإنماء" },
                  { label: "اسم المستفيد", value: "محمد عبدالله القحطاني" },
                  { label: "رقم الآيبان", value: "SA21 0500 0000 1234 5678 9012" },
                  { label: "رقم الحساب", value: "1234567890" },
                ].map((item, i) => (
                  <div key={i} className="flex justify-between items-center py-3 border-b border-white/5 last:border-0">
                    <span className="text-white/50 text-sm">{item.label}</span>
                    <span className="font-mono font-bold text-sm">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>

            <button onClick={handleWhatsAppDirect} className="w-full glass-panel p-4 rounded-2xl border border-green-500/20 text-green-400 hover:bg-green-500/10 transition-colors text-sm font-medium">
              تفضل التواصل عبر واتساب مباشرة؟ اضغط هنا
            </button>
          </motion.div>

          {/* Right: order form */}
          <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.15 }}>
            <div className="glass-panel p-8 rounded-3xl border border-primary/20 sticky top-8">
              {customer && (
                <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10 mb-6">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center shrink-0">
                    <User className="w-4 h-4 text-white" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-white truncate">{customer.fullName}</p>
                    <p className="text-xs text-white/40 truncate">{customer.email}</p>
                  </div>
                </div>
              )}

              <h3 className="text-xl font-bold mb-2">أكمل طلبك</h3>
              <p className="text-white/50 text-sm mb-8">بعد التحويل البنكي، أرفق الإيصال وأرسل طلبك</p>

              <form onSubmit={handleFormSubmit} className="space-y-6">
                {!customer && (
                  <div className="p-4 rounded-xl bg-primary/10 border border-primary/20 text-sm text-white/70 text-center">
                    سيُطلب منك تسجيل الدخول أو إنشاء حساب عند الإرسال
                  </div>
                )}

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-white/70 block">إيصال التحويل</label>
                  <div className="relative">
                    <input type="file" accept="image/jpeg,image/jpg,image/png,application/pdf" onChange={handleFileChange} className="hidden" id="receipt-upload" />
                    {file ? (
                      <div className="flex items-center justify-between gap-3 p-4 rounded-xl bg-white/5 border border-primary/30">
                        <div className="flex items-center gap-3 min-w-0">
                          {file.type === "application/pdf" ? <FileText className="w-5 h-5 text-primary shrink-0" /> : <ImageIcon className="w-5 h-5 text-primary shrink-0" />}
                          <span className="text-sm text-white/80 truncate">{file.name}</span>
                        </div>
                        <button type="button" onClick={() => setFile(null)} className="shrink-0 text-white/40 hover:text-white">
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <label htmlFor="receipt-upload" className="flex flex-col items-center justify-center gap-3 p-8 rounded-xl border-2 border-dashed border-white/15 hover:border-primary/50 cursor-pointer transition-colors group">
                        <Upload className="w-8 h-8 text-white/30 group-hover:text-primary transition-colors" />
                        <div className="text-center">
                          <p className="text-sm font-medium text-white/60">اضغط لرفع الإيصال</p>
                          <p className="text-xs text-white/30 mt-1">صورة JPG/PNG أو ملف PDF (حتى 10MB)</p>
                        </div>
                      </label>
                    )}
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={loadingSubmit}
                  className={`w-full h-14 rounded-xl text-white text-base font-bold bg-gradient-to-r ${pkg.color} hover:opacity-90 flex items-center justify-center gap-3`}
                >
                  {loadingSubmit ? (
                    <><Loader2 className="w-5 h-5 animate-spin" />جاري الإرسال...</>
                  ) : (
                    <><CheckCircle2 className="w-5 h-5" />{customer ? "أرسل الطلب" : "المتابعة وإرسال الطلب"}</>
                  )}
                </Button>

                <p className="text-xs text-white/30 text-center">بعد إرسال طلبك سنتحقق من التحويل ونتواصل معك عبر البريد</p>
              </form>
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
}
