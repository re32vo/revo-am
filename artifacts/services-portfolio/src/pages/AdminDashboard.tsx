import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useLocation } from "wouter";
import {
  Package, CheckCircle2, XCircle, Zap, LogOut, TerminalSquare,
  Download, RefreshCw, Loader2, Users, Search, Mail, Phone, ChevronDown
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

type OrderStatus = "pending_review" | "in_progress" | "completed" | "cancelled";

interface Order {
  id: number;
  package_id: string;
  package_name: string;
  customer_name: string;
  customer_email: string | null;
  receipt_filename: string | null;
  has_receipt: boolean;
  status: OrderStatus;
  created_at: string;
  notes: string | null;
  c_full_name: string | null;
  c_phone: string | null;
}

interface Customer {
  id: number;
  email: string;
  full_name: string;
  phone: string | null;
  created_at: string;
  order_count: string;
}

interface Stats {
  total: string;
  pending_review: string;
  in_progress: string;
  completed: string;
  cancelled: string;
  total_customers: string;
}

const statusConfig: Record<OrderStatus, { label: string; textColor: string; bg: string; border: string; icon: React.ElementType }> = {
  pending_review: { label: "تحت المراجعة", textColor: "text-amber-400",  bg: "bg-amber-400/10",  border: "border-amber-400/25",  icon: Search },
  in_progress:    { label: "جاري التجهيز", textColor: "text-blue-400",   bg: "bg-blue-400/10",   border: "border-blue-400/25",   icon: Zap },
  completed:      { label: "مكتمل",         textColor: "text-green-400",  bg: "bg-green-400/10",  border: "border-green-400/25",  icon: CheckCircle2 },
  cancelled:      { label: "ملغي",          textColor: "text-red-400",    bg: "bg-red-400/10",    border: "border-red-400/25",    icon: XCircle },
};

const ALL_STATUSES: OrderStatus[] = ["pending_review", "in_progress", "completed", "cancelled"];

export default function AdminDashboard() {
  const [, navigate] = useLocation();
  const { toast } = useToast();

  const [orders, setOrders] = useState<Order[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const [tab, setTab] = useState<"orders" | "customers">("orders");
  const [expandedOrder, setExpandedOrder] = useState<number | null>(null);
  const [filterStatus, setFilterStatus] = useState<OrderStatus | "all">("all");

  const checkAuth = async () => {
    const res = await fetch(`${BASE}/api/auth/me`, { credentials: "include" });
    const data = await res.json() as { authenticated: boolean };
    if (!data.authenticated) navigate("/admin");
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const [ordersRes, statsRes, customersRes] = await Promise.all([
        fetch(`${BASE}/api/admin/orders`, { credentials: "include" }),
        fetch(`${BASE}/api/admin/stats`, { credentials: "include" }),
        fetch(`${BASE}/api/admin/customers`, { credentials: "include" }),
      ]);
      if (ordersRes.status === 401) { navigate("/admin"); return; }
      const ordersData = await ordersRes.json() as { orders: Order[] };
      const statsData = await statsRes.json() as Stats;
      const customersData = await customersRes.json() as { customers: Customer[] };
      setOrders(ordersData.orders);
      setStats(statsData);
      setCustomers(customersData.customers);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void checkAuth().then(fetchData); }, []);

  const handleStatusUpdate = async (orderId: number, newStatus: OrderStatus) => {
    setUpdatingId(orderId);
    try {
      const res = await fetch(`${BASE}/api/admin/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
        credentials: "include",
      });
      if (!res.ok) throw new Error();
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
      toast({ title: "تم تحديث الحالة وإشعار العميل" });
    } catch {
      toast({ title: "خطأ في التحديث", variant: "destructive" });
    } finally {
      setUpdatingId(null);
    }
  };

  const handleLogout = async () => {
    await fetch(`${BASE}/api/auth/logout`, { method: "POST", credentials: "include" });
    navigate("/");
  };

  const filteredOrders = filterStatus === "all" ? orders : orders.filter(o => o.status === filterStatus);

  return (
    <div className="min-h-screen bg-background" dir="rtl">
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute -top-40 -right-40 w-[600px] h-[600px] rounded-full bg-primary/10 blur-[100px]" />
      </div>

      {/* Topbar */}
      <nav className="sticky top-0 z-50 glass-panel border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
              <TerminalSquare className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-sm sm:text-base">ستوديو.كود — لوحة التحكم</span>
          </div>
          <div className="flex items-center gap-2">
            <Button onClick={fetchData} variant="outline" size="sm" className="glass-panel border-white/10 gap-1.5 rounded-full text-xs">
              <RefreshCw className="w-3 h-3" /> تحديث
            </Button>
            <Button onClick={handleLogout} variant="outline" size="sm" className="glass-panel border-red-500/20 text-red-400 hover:bg-red-500/10 gap-1.5 rounded-full text-xs">
              <LogOut className="w-3 h-3" /> خروج
            </Button>
          </div>
        </div>
      </nav>

      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-8">
            {[
              { label: "إجمالي الطلبات", value: stats.total,            color: "#7c3aed", icon: Package },
              { label: "تحت المراجعة",   value: stats.pending_review,   color: "#f59e0b", icon: Search },
              { label: "جاري التجهيز",   value: stats.in_progress,      color: "#3b82f6", icon: Zap },
              { label: "مكتملة",          value: stats.completed,        color: "#22c55e", icon: CheckCircle2 },
              { label: "ملغاة",           value: stats.cancelled,        color: "#ef4444", icon: XCircle },
              { label: "العملاء",          value: stats.total_customers,  color: "#06b6d4", icon: Users },
            ].map((s, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
                className="glass-panel p-4 rounded-2xl cursor-pointer hover:scale-105 transition-transform"
                onClick={() => { if (i < 5) { setTab("orders"); setFilterStatus(i === 0 ? "all" : ALL_STATUSES[i - 1]); } else setTab("customers"); }}>
                <s.icon style={{ color: s.color }} className="w-5 h-5 mb-2" />
                <div className="text-2xl font-black" style={{ color: s.color }}>{s.value}</div>
                <div className="text-xs text-white/40 mt-0.5">{s.label}</div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          {[
            { id: "orders", label: "الطلبات", icon: Package },
            { id: "customers", label: "العملاء", icon: Users },
          ].map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id as "orders" | "customers")}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold transition-all ${tab === t.id ? "bg-primary text-white" : "glass-panel text-white/50 hover:text-white border-white/10"}`}
            >
              <t.icon className="w-4 h-4" />
              {t.label}
            </button>
          ))}

          {tab === "orders" && (
            <div className="flex gap-2 mr-auto flex-wrap">
              {([["all", "الكل"], ["pending_review", "مراجعة"], ["in_progress", "تجهيز"], ["completed", "مكتمل"], ["cancelled", "ملغي"]] as [string, string][]).map(([val, lbl]) => (
                <button
                  key={val}
                  onClick={() => setFilterStatus(val as OrderStatus | "all")}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${filterStatus === val ? "bg-white/20 text-white" : "text-white/40 hover:text-white"}`}
                >
                  {lbl}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Orders Tab */}
        {tab === "orders" && (
          <div className="glass-panel rounded-3xl overflow-hidden border border-white/10">
            {loading ? (
              <div className="flex items-center justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
            ) : filteredOrders.length === 0 ? (
              <div className="text-center py-20 text-white/40"><Package className="w-12 h-12 mx-auto mb-3 opacity-30" />لا توجد طلبات</div>
            ) : (
              <div className="divide-y divide-white/5">
                {filteredOrders.map((order, i) => {
                  const sc = statusConfig[order.status] ?? statusConfig.pending_review;
                  const StatusIcon = sc.icon;
                  const isExpanded = expandedOrder === order.id;

                  return (
                    <motion.div key={order.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}>
                      {/* Main row */}
                      <div
                        className="flex flex-col sm:flex-row sm:items-center gap-4 p-5 hover:bg-white/3 transition-colors cursor-pointer"
                        onClick={() => setExpandedOrder(isExpanded ? null : order.id)}
                      >
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center shrink-0">
                            <Package className="w-4 h-4 text-primary" />
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-bold text-white">{order.customer_name}</span>
                              <span className="text-white/30 text-xs">#{order.id}</span>
                            </div>
                            <div className="text-white/50 text-sm truncate">{order.package_name}</div>
                            {order.customer_email && (
                              <div className="flex items-center gap-1 text-white/30 text-xs mt-0.5">
                                <Mail className="w-3 h-3" />
                                {order.customer_email}
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-3 shrink-0">
                          <span className="text-white/40 text-xs hidden sm:block">
                            {new Date(order.created_at).toLocaleDateString("ar-SA", { day: "numeric", month: "short" })}
                          </span>
                          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-medium ${sc.textColor} ${sc.bg} ${sc.border}`}>
                            <StatusIcon className="w-3 h-3" />
                            {sc.label}
                          </span>
                          {order.has_receipt && (
                            <a href={`${BASE}/api/admin/orders/${order.id}/receipt`} target="_blank" rel="noreferrer"
                              onClick={e => e.stopPropagation()}
                              className="flex items-center gap-1 text-primary hover:underline text-xs shrink-0">
                              <Download className="w-3.5 h-3.5" /> إيصال
                            </a>
                          )}
                          <ChevronDown className={`w-4 h-4 text-white/30 transition-transform ${isExpanded ? "rotate-180" : ""}`} />
                        </div>
                      </div>

                      {/* Expanded details */}
                      {isExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="border-t border-white/5 bg-white/3 px-5 py-5"
                        >
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            {/* Customer info */}
                            <div>
                              <h4 className="text-xs font-bold text-white/40 uppercase tracking-wider mb-3">بيانات العميل</h4>
                              <div className="space-y-2 text-sm">
                                <div className="flex items-center gap-2"><span className="text-white/40">الاسم:</span><span>{order.c_full_name || order.customer_name}</span></div>
                                {order.customer_email && <div className="flex items-center gap-2"><Mail className="w-3.5 h-3.5 text-white/30" /><span className="text-white/70">{order.customer_email}</span></div>}
                                {order.c_phone && <div className="flex items-center gap-2"><Phone className="w-3.5 h-3.5 text-white/30" /><span dir="ltr">{order.c_phone}</span></div>}
                                <div className="flex items-center gap-2"><span className="text-white/40">التاريخ:</span><span className="text-white/60">{new Date(order.created_at).toLocaleString("ar-SA")}</span></div>
                              </div>
                            </div>

                            {/* Status update */}
                            <div>
                              <h4 className="text-xs font-bold text-white/40 uppercase tracking-wider mb-3">تحديث الحالة</h4>
                              <div className="grid grid-cols-2 gap-2">
                                {ALL_STATUSES.map(s => {
                                  const cfg = statusConfig[s];
                                  const SIcon = cfg.icon;
                                  const isCurrent = order.status === s;
                                  return (
                                    <button
                                      key={s}
                                      disabled={isCurrent || updatingId === order.id}
                                      onClick={() => handleStatusUpdate(order.id, s)}
                                      className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold border transition-all ${isCurrent ? `${cfg.bg} ${cfg.textColor} ${cfg.border}` : "border-white/10 text-white/40 hover:border-white/25 hover:text-white"}`}
                                    >
                                      {updatingId === order.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <SIcon className="w-3 h-3" />}
                                      {cfg.label}
                                    </button>
                                  );
                                })}
                              </div>
                              <p className="text-white/25 text-xs mt-2">سيتلقى العميل إشعار بريدي عند التحديث</p>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Customers Tab */}
        {tab === "customers" && (
          <div className="glass-panel rounded-3xl overflow-hidden border border-white/10">
            {loading ? (
              <div className="flex items-center justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
            ) : customers.length === 0 ? (
              <div className="text-center py-20 text-white/40"><Users className="w-12 h-12 mx-auto mb-3 opacity-30" />لا يوجد عملاء مسجلون</div>
            ) : (
              <div className="divide-y divide-white/5">
                <div className="grid grid-cols-4 px-5 py-3 text-white/30 text-xs uppercase tracking-wider border-b border-white/5">
                  <span>العميل</span><span>البريد</span><span>عدد الطلبات</span><span>تاريخ التسجيل</span>
                </div>
                {customers.map((c, i) => (
                  <motion.div key={c.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.04 }}
                    className="grid grid-cols-4 items-center px-5 py-4 hover:bg-white/3 transition-colors gap-4">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary/30 to-secondary/30 flex items-center justify-center text-xs font-bold shrink-0">
                        {c.full_name?.charAt(0) || "?"}
                      </div>
                      <span className="font-medium text-sm truncate">{c.full_name || "—"}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-white/60 text-sm truncate">
                      <Mail className="w-3.5 h-3.5 shrink-0" />{c.email}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-lg font-black text-primary">{c.order_count}</span>
                      <span className="text-white/40 text-xs">طلب</span>
                    </div>
                    <span className="text-white/40 text-xs">
                      {new Date(c.created_at).toLocaleDateString("ar-SA", { year: "numeric", month: "short", day: "numeric" })}
                    </span>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
