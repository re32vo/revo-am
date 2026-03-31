import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useLocation } from "wouter";
import {
  Package, Clock, CheckCircle2, Truck, XCircle,
  LogOut, TerminalSquare, Download, RefreshCw, Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

type OrderStatus = "pending" | "confirmed" | "delivered" | "cancelled";

interface Order {
  id: number;
  package_id: string;
  package_name: string;
  customer_name: string;
  receipt_filename: string | null;
  has_receipt: boolean;
  status: OrderStatus;
  created_at: string;
}

interface Stats {
  total: string;
  pending: string;
  confirmed: string;
  delivered: string;
}

const statusConfig: Record<OrderStatus, { label: string; color: string; icon: React.ElementType }> = {
  pending:   { label: "قيد الانتظار", color: "text-yellow-400 bg-yellow-400/10 border-yellow-400/20", icon: Clock },
  confirmed: { label: "مؤكد",         color: "text-blue-400 bg-blue-400/10 border-blue-400/20",   icon: CheckCircle2 },
  delivered: { label: "تم التسليم",   color: "text-green-400 bg-green-400/10 border-green-400/20", icon: Truck },
  cancelled: { label: "ملغي",         color: "text-red-400 bg-red-400/10 border-red-400/20",     icon: XCircle },
};

const statusFlow: Record<OrderStatus, OrderStatus | null> = {
  pending: "confirmed",
  confirmed: "delivered",
  delivered: null,
  cancelled: null,
};

export default function AdminDashboard() {
  const [, navigate] = useLocation();
  const { toast } = useToast();

  const [orders, setOrders] = useState<Order[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  const checkAuth = async () => {
    const res = await fetch("/api/auth/me", { credentials: "include" });
    const data = await res.json() as { authenticated: boolean };
    if (!data.authenticated) navigate("/admin");
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const [ordersRes, statsRes] = await Promise.all([
        fetch("/api/admin/orders", { credentials: "include" }),
        fetch("/api/admin/stats", { credentials: "include" }),
      ]);
      if (ordersRes.status === 401) { navigate("/admin"); return; }
      const ordersData = await ordersRes.json() as { orders: Order[] };
      const statsData = await statsRes.json() as Stats;
      setOrders(ordersData.orders);
      setStats(statsData);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAuth().then(fetchData);
  }, []);

  const handleStatusUpdate = async (orderId: number, newStatus: OrderStatus) => {
    setUpdatingId(orderId);
    try {
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
        credentials: "include",
      });
      if (!res.ok) throw new Error();
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
      toast({ title: "تم تحديث الحالة" });
    } catch {
      toast({ title: "خطأ في التحديث", variant: "destructive" });
    } finally {
      setUpdatingId(null);
    }
  };

  const handleCancelOrder = async (orderId: number) => {
    await handleStatusUpdate(orderId, "cancelled");
  };

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-background" dir="rtl">
      {/* Background */}
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
            <span className="font-bold">ستوديو.كود — لوحة التحكم</span>
          </div>
          <div className="flex items-center gap-3">
            <Button onClick={fetchData} variant="outline" size="sm" className="glass-panel border-white/10 gap-2 rounded-full">
              <RefreshCw className="w-3 h-3" />
              تحديث
            </Button>
            <Button onClick={handleLogout} variant="outline" size="sm" className="glass-panel border-red-500/20 text-red-400 hover:bg-red-500/10 gap-2 rounded-full">
              <LogOut className="w-3 h-3" />
              خروج
            </Button>
          </div>
        </div>
      </nav>

      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-10">
        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
            {[
              { label: "إجمالي الطلبات", value: stats.total, color: "text-white", icon: Package },
              { label: "قيد الانتظار",   value: stats.pending,   color: "text-yellow-400", icon: Clock },
              { label: "مؤكدة",          value: stats.confirmed, color: "text-blue-400",   icon: CheckCircle2 },
              { label: "مسلّمة",         value: stats.delivered, color: "text-green-400",  icon: Truck },
            ].map((s, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.07 }}
                className="glass-panel p-6 rounded-2xl"
              >
                <s.icon className={`w-6 h-6 mb-3 ${s.color}`} />
                <div className={`text-3xl font-black ${s.color}`}>{s.value}</div>
                <div className="text-xs text-white/50 mt-1">{s.label}</div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Orders */}
        <div className="glass-panel rounded-3xl overflow-hidden border border-white/10">
          <div className="px-6 py-5 border-b border-white/10">
            <h2 className="text-lg font-bold">الطلبات</h2>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : orders.length === 0 ? (
            <div className="text-center py-20 text-white/40">
              <Package className="w-12 h-12 mx-auto mb-3 opacity-30" />
              لا توجد طلبات بعد
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/5 text-white/40 text-xs uppercase tracking-wider">
                    <th className="text-right px-6 py-4">#</th>
                    <th className="text-right px-6 py-4">العميل</th>
                    <th className="text-right px-6 py-4">الباقة</th>
                    <th className="text-right px-6 py-4">الإيصال</th>
                    <th className="text-right px-6 py-4">التاريخ</th>
                    <th className="text-right px-6 py-4">الحالة</th>
                    <th className="text-right px-6 py-4">الإجراءات</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order, i) => {
                    const sc = statusConfig[order.status];
                    const StatusIcon = sc.icon;
                    const nextStatus = statusFlow[order.status];

                    return (
                      <motion.tr
                        key={order.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.04 }}
                        className="border-b border-white/5 hover:bg-white/3 transition-colors"
                      >
                        <td className="px-6 py-4 text-white/40 text-sm">#{order.id}</td>
                        <td className="px-6 py-4 font-medium">{order.customer_name}</td>
                        <td className="px-6 py-4 text-white/70 text-sm">{order.package_name}</td>
                        <td className="px-6 py-4">
                          {order.has_receipt ? (
                            <a
                              href={`/api/admin/orders/${order.id}/receipt`}
                              target="_blank"
                              rel="noreferrer"
                              className="flex items-center gap-1.5 text-primary hover:underline text-sm"
                            >
                              <Download className="w-3.5 h-3.5" />
                              عرض
                            </a>
                          ) : (
                            <span className="text-white/30 text-sm">لا يوجد</span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-white/50 text-sm">
                          {new Date(order.created_at).toLocaleDateString("ar-SA", { day: "numeric", month: "short", year: "numeric" })}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-medium ${sc.color}`}>
                            <StatusIcon className="w-3 h-3" />
                            {sc.label}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            {nextStatus && (
                              <Button
                                size="sm"
                                onClick={() => handleStatusUpdate(order.id, nextStatus)}
                                disabled={updatingId === order.id}
                                className="h-8 text-xs rounded-full bg-primary/20 hover:bg-primary/40 text-primary border border-primary/30"
                              >
                                {updatingId === order.id ? <Loader2 className="w-3 h-3 animate-spin" /> : statusConfig[nextStatus].label}
                              </Button>
                            )}
                            {order.status !== "cancelled" && order.status !== "delivered" && (
                              <Button
                                size="sm"
                                onClick={() => handleCancelOrder(order.id)}
                                disabled={updatingId === order.id}
                                variant="ghost"
                                className="h-8 text-xs rounded-full text-red-400 hover:bg-red-500/10"
                              >
                                إلغاء
                              </Button>
                            )}
                          </div>
                        </td>
                      </motion.tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
