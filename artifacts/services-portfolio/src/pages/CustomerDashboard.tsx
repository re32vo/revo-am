import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useLocation } from "wouter";
import { Package, Clock, CheckCircle2, XCircle, Zap, LogOut, User, Search, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

interface Order {
  id: number;
  package_id: string;
  package_name: string;
  status: string;
  created_at: string;
  has_receipt: boolean;
}

const statusConfig: Record<string, { label: string; color: string; bg: string; icon: React.ReactNode }> = {
  pending_review: { label: "تحت المراجعة", color: "#f59e0b", bg: "rgba(245,158,11,0.15)", icon: <Search className="w-4 h-4" /> },
  in_progress:    { label: "جاري التجهيز", color: "#3b82f6", bg: "rgba(59,130,246,0.15)", icon: <Zap className="w-4 h-4" /> },
  completed:      { label: "مكتمل",         color: "#22c55e", bg: "rgba(34,197,94,0.15)",  icon: <CheckCircle2 className="w-4 h-4" /> },
  cancelled:      { label: "ملغي",           color: "#ef4444", bg: "rgba(239,68,68,0.15)", icon: <XCircle className="w-4 h-4" /> },
};

export default function CustomerDashboard() {
  const { customer, loading, logout } = useAuth();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(true);

  useEffect(() => {
    if (!loading && !customer) navigate("/");
  }, [loading, customer, navigate]);

  useEffect(() => {
    if (!customer) return;
    void (async () => {
      try {
        const res = await fetch(`${BASE}/api/customer/orders`, { credentials: "include" });
        const data = await res.json() as { orders: Order[] };
        setOrders(data.orders);
      } catch {
        toast({ title: "تعذر تحميل الطلبات", variant: "destructive" });
      } finally {
        setOrdersLoading(false);
      }
    })();
  }, [customer]);

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!customer) return null;

  const stats = {
    total: orders.length,
    pending_review: orders.filter(o => o.status === "pending_review").length,
    in_progress: orders.filter(o => o.status === "in_progress").length,
    completed: orders.filter(o => o.status === "completed").length,
  };

  return (
    <div className="min-h-screen bg-background" dir="rtl">
      {/* Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-0 right-0 w-[600px] h-[400px] rounded-full bg-purple-600/10 blur-[100px]" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[300px] rounded-full bg-blue-600/10 blur-[100px]" />
      </div>

      {/* Header */}
      <div className="relative z-10 border-b border-white/5 bg-black/20 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <button onClick={() => navigate("/")} className="flex items-center gap-2 text-white/60 hover:text-white transition-colors text-sm">
            <ArrowRight className="w-4 h-4" />
            الرئيسية
          </button>
          <div className="flex items-center gap-2 text-sm">
            <span className="text-primary font-bold">ستوديو</span>
            <span className="text-white font-bold">كود</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-sm text-white/60">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                <User className="w-4 h-4 text-white" />
              </div>
              <span className="hidden sm:block">{customer.fullName}</span>
            </div>
            <button onClick={handleLogout} className="flex items-center gap-1 text-white/40 hover:text-red-400 transition-colors text-sm">
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      <main className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 py-10">
        {/* Welcome */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
          <h1 className="text-3xl font-black mb-1">مرحباً، {customer.fullName.split(" ")[0]} 👋</h1>
          <p className="text-white/50">{customer.email}</p>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10"
        >
          {[
            { label: "إجمالي الطلبات", value: stats.total, color: "#7c3aed", icon: <Package className="w-5 h-5" /> },
            { label: "تحت المراجعة",   value: stats.pending_review, color: "#f59e0b", icon: <Search className="w-5 h-5" /> },
            { label: "جاري التجهيز",   value: stats.in_progress,   color: "#3b82f6", icon: <Zap className="w-5 h-5" /> },
            { label: "مكتملة",          value: stats.completed,      color: "#22c55e", icon: <CheckCircle2 className="w-5 h-5" /> },
          ].map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 + i * 0.05 }}
              className="glass-panel p-5 rounded-2xl"
              style={{ borderColor: `${stat.color}30` }}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: `${stat.color}20`, color: stat.color }}>
                  {stat.icon}
                </div>
                <span className="text-3xl font-black" style={{ color: stat.color }}>{stat.value}</span>
              </div>
              <p className="text-white/50 text-sm">{stat.label}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* Orders */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-panel rounded-3xl overflow-hidden"
        >
          <div className="p-6 border-b border-white/5">
            <h2 className="text-xl font-bold">طلباتي</h2>
          </div>

          {ordersLoading ? (
            <div className="p-20 flex justify-center">
              <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : orders.length === 0 ? (
            <div className="p-20 text-center">
              <Package className="w-12 h-12 text-white/20 mx-auto mb-4" />
              <p className="text-white/40 mb-6">لا توجد طلبات حتى الآن</p>
              <Button
                onClick={() => navigate("/")}
                className="rounded-full bg-gradient-to-r from-primary to-secondary text-white px-8"
              >
                استعرض الباقات
              </Button>
            </div>
          ) : (
            <div className="divide-y divide-white/5">
              {orders.map((order, i) => {
                const cfg = statusConfig[order.status] ?? statusConfig.pending_review;
                return (
                  <motion.div
                    key={order.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.05 * i }}
                    className="p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center gap-4"
                  >
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/30 to-secondary/30 flex items-center justify-center shrink-0">
                      <Package className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-white truncate">{order.package_name}</p>
                      <p className="text-white/40 text-sm mt-0.5">
                        #{order.id} · {new Date(order.created_at).toLocaleDateString("ar-SA", { year: "numeric", month: "long", day: "numeric" })}
                        {!order.has_receipt && <span className="text-yellow-400/70 mr-2">· لم يُرفع إيصال</span>}
                      </p>
                    </div>

                    {/* Status timeline */}
                    <div className="flex items-center gap-2">
                      {["pending_review", "in_progress", "completed"].map((s, idx) => {
                        const active = s === order.status;
                        const done = order.status === "completed" && idx < 2 ||
                                     order.status === "in_progress" && idx < 1;
                        const sCfg = statusConfig[s];
                        if (!sCfg) return null;
                        return (
                          <div key={s} className="flex items-center gap-1">
                            <div
                              className="w-2 h-2 rounded-full transition-all"
                              style={{ background: active ? sCfg.color : done ? "#22c55e" : "rgba(255,255,255,0.15)", boxShadow: active ? `0 0 8px ${sCfg.color}` : "none" }}
                            />
                            {idx < 2 && <div className="w-4 h-px" style={{ background: done ? "#22c55e" : "rgba(255,255,255,0.1)" }} />}
                          </div>
                        );
                      })}
                    </div>

                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-semibold shrink-0" style={{ background: cfg.bg, color: cfg.color }}>
                      {cfg.icon}
                      {cfg.label}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </motion.div>

        {/* New order CTA */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-6 text-center"
        >
          <Button
            onClick={() => navigate("/")}
            variant="outline"
            className="rounded-full border-white/15 text-white/60 hover:text-white hover:bg-white/5 px-8"
          >
            طلب باقة جديدة
          </Button>
        </motion.div>
      </main>
    </div>
  );
}
