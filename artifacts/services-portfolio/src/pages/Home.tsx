import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, useScroll, useTransform, useMotionValue, useSpring, useInView } from "framer-motion";
import { 
  Code2, 
  Smartphone, 
  ShoppingCart, 
  Database, 
  LayoutTemplate, 
  Lightbulb, 
  CheckCircle2, 
  Send, 
  ChevronLeft,
  TerminalSquare,
  X,
  Zap,
  Shield,
  Star
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

const WHATSAPP_NUMBER = "966533170903";

const navLinks = [
  { href: "#services", label: "الخدمات" },
  { href: "#packages", label: "الباقات" },
  { href: "#stats", label: "لماذا أنا" },
  { href: "#contact", label: "تواصل معي" },
];

const packages = [
  {
    id: "basic",
    name: "الباقة الأساسية",
    subtitle: "مثالية للمشاريع الناشئة",
    icon: Zap,
    color: "from-blue-500/20 to-cyan-500/20",
    borderColor: "border-blue-500/30",
    glowColor: "rgba(59,130,246,0.3)",
    textColor: "text-blue-400",
    features: ["موقع بسيط", "تصميم متجاوب", "5 صفحات", "تسليم في 7 أيام"],
    popular: false,
  },
  {
    id: "pro",
    name: "الباقة الاحترافية",
    subtitle: "للمشاريع المتوسطة والمتنامية",
    icon: Star,
    color: "from-primary/30 to-secondary/30",
    borderColor: "border-primary",
    glowColor: "rgba(124,58,237,0.4)",
    textColor: "text-primary",
    features: ["موقع متكامل", "لوحة تحكم مخصصة", "15 صفحة", "قاعدة بيانات متطورة", "تسليم في 21 يوم"],
    popular: true,
  },
  {
    id: "premium",
    name: "الباقة المميزة",
    subtitle: "حلول شاملة للشركات الكبرى",
    icon: Shield,
    color: "from-purple-500/20 to-pink-500/20",
    borderColor: "border-purple-500/30",
    glowColor: "rgba(168,85,247,0.3)",
    textColor: "text-purple-400",
    features: ["حل برمجي متكامل", "تطبيق جوال iOS & Android", "دعم فني 3 أشهر", "تسليم في 45 يوم"],
    popular: false,
  },
];

function CountUp({ target, suffix = "" }: { target: number; suffix?: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true });

  useEffect(() => {
    if (!inView) return;
    let start = 0;
    const duration = 1800;
    const step = target / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= target) { setCount(target); clearInterval(timer); }
      else setCount(Math.floor(start));
    }, 16);
    return () => clearInterval(timer);
  }, [inView, target]);

  return <div ref={ref}>{count}{suffix}</div>;
}

function FloatingOrb({ className }: { className: string }) {
  return (
    <motion.div
      className={`absolute rounded-full blur-[80px] pointer-events-none ${className}`}
      animate={{ scale: [1, 1.2, 1], opacity: [0.4, 0.7, 0.4] }}
      transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
    />
  );
}

function MagneticCard({ children, className }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useSpring(useTransform(y, [-50, 50], [8, -8]), { stiffness: 300, damping: 30 });
  const rotateY = useSpring(useTransform(x, [-50, 50], [-8, 8]), { stiffness: 300, damping: 30 });

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    x.set(e.clientX - rect.left - rect.width / 2);
    y.set(e.clientY - rect.top - rect.height / 2);
  };
  const handleMouseLeave = () => { x.set(0); y.set(0); };

  return (
    <motion.div
      ref={ref}
      style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export default function Home() {
  const [name, setName] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);

  const { scrollYProgress } = useScroll();
  const heroY = useTransform(scrollYProgress, [0, 0.3], [0, -80]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.25], [1, 0]);

  const handleWhatsApp = (e: React.FormEvent) => {
    e.preventDefault();
    const text =
      `مرحبا، عندي استفسار\n\n` +
      `الاسم: ${name}\n` +
      `الموضوع: ${subject}\n\n` +
      `الرسالة:\n${message}`;
    const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`;
    window.open(url, "_blank");
  };

  const handlePackageWhatsApp = (pkg: typeof packages[0]) => {
    const featuresList = pkg.features.map((f) => `- ${f}`).join("\n");
    const text =
      `مرحبا، اريد الاستفسار عن ${pkg.name}\n\n` +
      `تفاصيل الباقة:\n${featuresList}\n\n` +
      `ارجو التواصل معي لمعرفة المزيد`;
    const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`;
    window.open(url, "_blank");
  };

  const fadeUp = {
    initial: { opacity: 0, y: 40 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] }
  };

  const stagger = {
    animate: { transition: { staggerChildren: 0.12 } }
  };

  return (
    <div className="min-h-screen bg-background overflow-x-hidden selection:bg-primary selection:text-white">

      {/* Ambient background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <FloatingOrb className="w-[600px] h-[600px] -top-40 -right-40 bg-primary/25" />
        <FloatingOrb className="w-[500px] h-[500px] top-1/2 -left-32 bg-secondary/20" />
        <FloatingOrb className="w-[700px] h-[700px] -bottom-60 left-1/3 bg-[#4a1082]/20" />
        {/* Grid overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(124,58,237,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(124,58,237,0.03)_1px,transparent_1px)] bg-[size:60px_60px]" />
      </div>

      {/* Scroll progress bar */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-primary via-secondary to-blue-400 z-[100] origin-left"
        style={{ scaleX: scrollYProgress }}
      />

      {/* Navbar */}
      <nav className="fixed top-0 w-full z-50 glass-panel border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-20 flex items-center justify-between">
          <motion.div
            className="flex items-center gap-2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <motion.div
              className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-[0_0_15px_rgba(124,58,237,0.5)]"
              whileHover={{ rotate: 360 }}
              transition={{ duration: 0.6 }}
            >
              <TerminalSquare className="w-5 h-5 text-white" />
            </motion.div>
            <span className="font-bold text-xl tracking-wide">ستوديو<span className="text-primary">.كود</span></span>
          </motion.div>

          <motion.div
            className="hidden md:flex items-center gap-8 text-sm font-medium text-white/80"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            {navLinks.slice(0, 3).map((link, i) => (
              <motion.a
                key={link.href}
                href={link.href}
                className="hover:text-white transition-colors relative group"
                whileHover={{ y: -2 }}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + i * 0.05 }}
              >
                {link.label}
                <span className="absolute -bottom-1 left-0 w-0 h-[2px] bg-gradient-to-r from-primary to-secondary group-hover:w-full transition-all duration-300 rounded-full" />
              </motion.a>
            ))}
          </motion.div>

          <div className="flex items-center gap-3">
            <motion.a
              href="#contact"
              className="hidden md:block"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <Button className="rounded-full bg-white text-background hover:bg-white/90 font-bold px-6">
                تواصل معي
              </Button>
            </motion.a>
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="md:hidden flex flex-col justify-center items-center w-10 h-10 rounded-xl glass-panel gap-1.5 shrink-0"
              aria-label="القائمة"
            >
              <AnimatePresence mode="wait">
                {menuOpen ? (
                  <motion.div key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }}>
                    <X className="w-5 h-5 text-white" />
                  </motion.div>
                ) : (
                  <motion.div key="open" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} className="flex flex-col gap-1.5">
                    <span className="w-5 h-0.5 bg-white rounded-full" />
                    <span className="w-5 h-0.5 bg-white rounded-full" />
                    <span className="w-5 h-0.5 bg-white rounded-full" />
                  </motion.div>
                )}
              </AnimatePresence>
            </button>
          </div>
        </div>

        <AnimatePresence>
          {menuOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="md:hidden glass-panel border-t border-white/10 overflow-hidden"
            >
              <div className="px-4 py-3 flex flex-col gap-1">
                {navLinks.map((link, i) => (
                  <motion.a
                    key={link.href}
                    href={link.href}
                    onClick={() => setMenuOpen(false)}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.06 }}
                    className="text-white/80 hover:text-white text-base font-medium py-3 px-4 rounded-xl hover:bg-white/5 transition-colors text-right"
                  >
                    {link.label}
                  </motion.a>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      <main className="relative z-10 pt-20">

        {/* ═══ HERO ═══ */}
        <section className="min-h-[95vh] flex items-center pt-16 pb-24 relative">
          <motion.div style={{ y: heroY, opacity: heroOpacity }} className="max-w-7xl mx-auto px-4 sm:px-6 w-full">
            <div className="max-w-4xl mx-auto text-center">

              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-panel mb-8 text-sm text-white/80"
              >
                <motion.span
                  className="relative flex h-3 w-3"
                  animate={{ scale: [1, 1.3, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-secondary opacity-75" />
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-secondary" />
                </motion.span>
                متاح لاستقبال مشاريع جديدة
              </motion.div>

              {"أحوّل أفكارك إلى".split("").map((_, i) => null) && null}

              <div className="overflow-hidden mb-2">
                <motion.h1
                  className="text-5xl md:text-7xl lg:text-8xl font-black leading-tight"
                  initial={{ y: 120 }}
                  animate={{ y: 0 }}
                  transition={{ duration: 0.8, delay: 0.1, ease: [0.25, 0.46, 0.45, 0.94] }}
                >
                  أحوّل أفكارك إلى
                </motion.h1>
              </div>
              <div className="overflow-hidden mb-8">
                <motion.h1
                  className="text-5xl md:text-7xl lg:text-8xl font-black leading-tight gradient-text"
                  initial={{ y: 120 }}
                  animate={{ y: 0 }}
                  transition={{ duration: 0.8, delay: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }}
                >
                  واقع رقمي مبهر
                </motion.h1>
              </div>

              <motion.p
                className="text-lg md:text-xl text-white/60 mb-12 max-w-2xl mx-auto leading-relaxed"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.4 }}
              >
                مطور برمجيات محترف متخصص في بناء تطبيقات ويب وجوال متطورة، سريعة، ومصممة خصيصاً لتنمية أعمالك في العصر الرقمي.
              </motion.p>

              <motion.div
                className="flex flex-col sm:flex-row items-center justify-center gap-4"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.5 }}
              >
                <motion.a href="#contact" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}>
                  <Button size="lg" className="h-14 px-10 text-lg rounded-full bg-primary hover:bg-primary/90 text-white shadow-[0_0_30px_rgba(124,58,237,0.5)] hover:shadow-[0_0_50px_rgba(124,58,237,0.7)] transition-all">
                    ابدأ مشروعك الآن
                    <ChevronLeft className="mr-2 w-5 h-5" />
                  </Button>
                </motion.a>
                <motion.a href="#services" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}>
                  <Button size="lg" variant="outline" className="h-14 px-10 text-lg rounded-full border-white/15 hover:bg-white/5 glass-panel">
                    استعرض خدماتي
                  </Button>
                </motion.a>
              </motion.div>
            </div>
          </motion.div>

          {/* Floating shapes decoration */}
          <motion.div
            className="absolute left-8 top-1/3 w-4 h-4 rounded-full bg-secondary/60 hidden lg:block"
            animate={{ y: [-20, 20, -20], opacity: [0.6, 1, 0.6] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            className="absolute right-12 top-1/2 w-6 h-6 rounded-full border-2 border-primary/50 hidden lg:block"
            animate={{ y: [20, -20, 20], rotate: [0, 180, 360] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            className="absolute left-1/4 bottom-24 w-3 h-3 rounded-sm bg-primary/40 hidden lg:block"
            animate={{ y: [-15, 15, -15], rotate: [0, 90, 0] }}
            transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
          />
        </section>

        {/* ═══ SERVICES ═══ */}
        <section id="services" className="py-28 relative">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <motion.div
              initial="initial"
              whileInView="animate"
              viewport={{ once: true, margin: "-80px" }}
              variants={fadeUp}
              className="text-center mb-20"
            >
              <motion.span
                className="inline-block text-sm font-semibold tracking-widest text-secondary uppercase mb-4 opacity-80"
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
              >
                ما أقدمه
              </motion.span>
              <h2 className="text-3xl md:text-5xl font-bold mb-4">
                خدمات <span className="text-primary">برمجية متكاملة</span>
              </h2>
              <p className="text-white/50 max-w-xl mx-auto">
                كل ما تحتاجه لبناء وتطوير منتجك التقني بأعلى معايير الجودة
              </p>
            </motion.div>

            <motion.div
              initial="initial"
              whileInView="animate"
              viewport={{ once: true }}
              variants={stagger}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {[
                { icon: LayoutTemplate, title: "تطوير المواقع الإلكترونية", desc: "مواقع سريعة، متجاوبة، ومبنية بأحدث التقنيات لتعكس احترافية علامتك التجارية." },
                { icon: Smartphone, title: "تطوير تطبيقات الجوال", desc: "تطبيقات أصلية وهجينة توفر تجربة مستخدم سلسة على iOS و Android." },
                { icon: ShoppingCart, title: "متاجر إلكترونية", desc: "منصات تجارة إلكترونية متكاملة مع بوابات دفع آمنة ولوحات تحكم." },
                { icon: Database, title: "تطوير APIs والخدمات الخلفية", desc: "بنى تحتية قوية وقابلة للتوسع لضمان أداء مستقر لتطبيقاتك." },
                { icon: Code2, title: "تصميم واجهات المستخدم", desc: "تصاميم UX/UI حديثة تركز على سهولة الاستخدام وجاذبية المظهر." },
                { icon: Lightbulb, title: "الاستشارات التقنية", desc: "توجيه تقني لاختيار أفضل التقنيات لضمان نجاح مشروعك بأقل التكاليف." }
              ].map((service, idx) => (
                <motion.div
                  key={idx}
                  variants={fadeUp}
                  whileHover={{ y: -8, scale: 1.02 }}
                  className="glass-panel p-8 rounded-3xl glow-box group relative overflow-hidden cursor-default"
                >
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-br from-primary/5 to-secondary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                  />
                  <div className="relative z-10">
                    <motion.div
                      className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center mb-6 group-hover:bg-primary/20 transition-colors duration-300"
                      whileHover={{ rotate: [0, -10, 10, 0] }}
                      transition={{ duration: 0.4 }}
                    >
                      <service.icon className="w-7 h-7 text-secondary group-hover:text-primary transition-colors duration-300" />
                    </motion.div>
                    <h3 className="text-xl font-bold mb-3">{service.title}</h3>
                    <p className="text-white/55 leading-relaxed text-sm">{service.desc}</p>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* ═══ PACKAGES ═══ */}
        <section id="packages" className="py-28 relative z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <motion.div
              initial="initial"
              whileInView="animate"
              viewport={{ once: true }}
              variants={fadeUp}
              className="text-center mb-20"
            >
              <motion.span
                className="inline-block text-sm font-semibold tracking-widest text-secondary uppercase mb-4 opacity-80"
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
              >
                الأسعار
              </motion.span>
              <h2 className="text-3xl md:text-5xl font-bold mb-4">
                اختر <span className="text-secondary">باقتك المناسبة</span>
              </h2>
              <p className="text-white/50 max-w-xl mx-auto">خطط مدروسة لتناسب حجم مشروعك وميزانيتك</p>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center max-w-5xl mx-auto">
              {packages.map((pkg, idx) => {
                const Icon = pkg.icon;
                return (
                  <MagneticCard key={pkg.id} className="relative">
                    <motion.div
                      initial={{ opacity: 0, y: 60, scale: 0.9 }}
                      whileInView={{ opacity: 1, y: pkg.popular ? -16 : 0, scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.7, delay: idx * 0.15, ease: [0.25, 0.46, 0.45, 0.94] }}
                      className={`relative glass-panel rounded-3xl overflow-hidden border ${pkg.borderColor} ${pkg.popular ? "shadow-[0_0_60px_rgba(124,58,237,0.3)] border-2" : ""}`}
                    >
                      {/* Animated gradient bg */}
                      <motion.div
                        className={`absolute inset-0 bg-gradient-to-br ${pkg.color} opacity-60`}
                        animate={{ opacity: [0.4, 0.7, 0.4] }}
                        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: idx * 0.5 }}
                      />

                      {/* Shimmer effect */}
                      {pkg.popular && (
                        <motion.div
                          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -skew-x-12"
                          animate={{ x: ["-200%", "200%"] }}
                          transition={{ duration: 3, repeat: Infinity, ease: "linear", repeatDelay: 2 }}
                        />
                      )}

                      {/* Popular badge */}
                      {pkg.popular && (
                        <motion.div
                          className="absolute -top-px left-0 right-0 flex justify-center"
                          initial={{ y: -20, opacity: 0 }}
                          whileInView={{ y: 0, opacity: 1 }}
                          viewport={{ once: true }}
                          transition={{ delay: 0.5 }}
                        >
                          <div className="bg-gradient-to-r from-primary to-secondary px-6 py-1.5 rounded-b-2xl text-xs font-bold shadow-lg">
                            الاكثر طلبا
                          </div>
                        </motion.div>
                      )}

                      <div className="relative z-10 p-8 pt-10">
                        {/* Icon */}
                        <motion.div
                          className={`w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center mb-6`}
                          whileHover={{ rotate: 360, scale: 1.1 }}
                          transition={{ duration: 0.6 }}
                          animate={pkg.popular ? { boxShadow: [`0 0 0px ${pkg.glowColor}`, `0 0 20px ${pkg.glowColor}`, `0 0 0px ${pkg.glowColor}`] } : {}}
                        >
                          <Icon className={`w-7 h-7 ${pkg.textColor}`} />
                        </motion.div>

                        <h3 className={`text-2xl font-bold mb-1 ${pkg.popular ? "text-white" : ""}`}>{pkg.name}</h3>
                        <p className="text-white/50 text-sm mb-8">{pkg.subtitle}</p>

                        <ul className="space-y-4 mb-10">
                          {pkg.features.map((feature, fi) => (
                            <motion.li
                              key={fi}
                              initial={{ opacity: 0, x: 20 }}
                              whileInView={{ opacity: 1, x: 0 }}
                              viewport={{ once: true }}
                              transition={{ delay: idx * 0.15 + fi * 0.08 }}
                              className="flex items-center gap-3 text-white/80"
                            >
                              <motion.div
                                whileHover={{ scale: 1.3, rotate: 360 }}
                                transition={{ duration: 0.3 }}
                              >
                                <CheckCircle2 className={`w-5 h-5 shrink-0 ${pkg.textColor}`} />
                              </motion.div>
                              <span className="text-sm font-medium">{feature}</span>
                            </motion.li>
                          ))}
                        </ul>

                        <motion.div
                          whileHover={{ scale: 1.03 }}
                          whileTap={{ scale: 0.97 }}
                        >
                          <Button
                            onClick={() => handlePackageWhatsApp(pkg)}
                            className={`w-full h-13 rounded-2xl font-bold text-base transition-all duration-300 ${
                              pkg.popular
                                ? "bg-gradient-to-r from-primary to-secondary hover:opacity-90 text-white shadow-[0_0_25px_rgba(124,58,237,0.5)]"
                                : "glass-panel hover:bg-white/15 border border-white/15 text-white"
                            }`}
                          >
                            اطلب هذه الباقة
                          </Button>
                        </motion.div>
                      </div>

                      {/* Corner decoration */}
                      <motion.div
                        className={`absolute bottom-0 left-0 w-24 h-24 rounded-tr-full bg-gradient-to-tr ${pkg.color} opacity-30`}
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 4, repeat: Infinity, delay: idx * 0.5 }}
                      />
                    </motion.div>
                  </MagneticCard>
                );
              })}
            </div>
          </div>
        </section>

        {/* ═══ WHY ME / STATS ═══ */}
        <section id="stats" className="py-28 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/5 to-transparent pointer-events-none" />
          <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
              <motion.div
                initial={{ opacity: 0, x: 60 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
              >
                <motion.span
                  className="inline-block text-sm font-semibold tracking-widest text-secondary uppercase mb-4 opacity-80"
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                >
                  لماذا أنا
                </motion.span>
                <h2 className="text-3xl md:text-5xl font-bold mb-6">
                  لماذا <span className="gradient-text">تختارني؟</span>
                </h2>
                <p className="text-white/60 mb-10 leading-relaxed">
                  لا أقدم مجرد سطور من الأكواد، بل حلولاً تقنية ذكية مصممة خصيصاً لحل مشكلاتك وتنمية أعمالك.
                </p>
                <div className="space-y-6">
                  {[
                    { title: "جودة لا يعلى عليها", desc: "كود نظيف، قابل للصيانة والتطوير مستقبلاً." },
                    { title: "التزام بالمواعيد", desc: "احترام تام للجدول الزمني المتفق عليه." },
                    { title: "تواصل شفاف", desc: "متابعة مستمرة وإطلاع دائم على سير العمل." }
                  ].map((item, i) => (
                    <motion.div
                      key={i}
                      className="flex gap-4 group"
                      initial={{ opacity: 0, x: 40 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.15, duration: 0.6 }}
                      whileHover={{ x: -4 }}
                    >
                      <motion.div
                        className="w-12 h-12 shrink-0 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-primary/20 transition-colors"
                        whileHover={{ rotate: 360 }}
                        transition={{ duration: 0.5 }}
                      >
                        <CheckCircle2 className="w-6 h-6 text-primary" />
                      </motion.div>
                      <div>
                        <h4 className="text-xl font-bold mb-1">{item.title}</h4>
                        <p className="text-white/55 text-sm">{item.desc}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>

              <motion.div
                className="grid grid-cols-2 gap-6"
                initial={{ opacity: 0, x: -60 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
              >
                {[
                  { target: 50, suffix: "+", label: "مشروع مكتمل" },
                  { target: 100, suffix: "%", label: "رضا العملاء" },
                  { target: 5, suffix: "+", label: "سنوات خبرة" },
                  { target: 247, suffix: "", label: "دعم فني" }
                ].map((stat, i) => (
                  <motion.div
                    key={i}
                    className="glass-panel p-8 rounded-3xl text-center glow-box relative overflow-hidden group"
                    initial={{ opacity: 0, scale: 0.7 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1, duration: 0.5, type: "spring", stiffness: 200 }}
                    whileHover={{ scale: 1.05, y: -4 }}
                  >
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-br from-primary/10 to-secondary/10 opacity-0 group-hover:opacity-100 transition-opacity"
                    />
                    <div className="text-4xl md:text-5xl font-black gradient-text mb-2 relative z-10">
                      <CountUp target={stat.target} suffix={stat.suffix} />
                    </div>
                    <div className="text-sm font-medium text-white/70 relative z-10">
                      {i === 3 ? "24/7" : ""}{stat.label}
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            </div>
          </div>
        </section>

        {/* ═══ CONTACT ═══ */}
        <section id="contact" className="py-28 relative">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <motion.div
              initial={{ opacity: 0, y: 60, scale: 0.95 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
              className="max-w-2xl mx-auto glass-panel p-8 md:p-14 rounded-[2.5rem] relative overflow-hidden border border-primary/25"
            >
              <motion.div
                className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-secondary/10"
                animate={{ opacity: [0.5, 0.9, 0.5] }}
                transition={{ duration: 4, repeat: Infinity }}
              />
              <motion.div
                className="absolute -top-20 -right-20 w-40 h-40 rounded-full bg-primary/20 blur-3xl"
                animate={{ scale: [1, 1.4, 1] }}
                transition={{ duration: 3, repeat: Infinity }}
              />

              <div className="relative z-10 text-center">
                <motion.h2
                  className="text-3xl md:text-4xl font-bold mb-4"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                >
                  هل أنت جاهز لبدء <span className="text-secondary">مشروعك؟</span>
                </motion.h2>
                <p className="text-white/60 mb-10 leading-relaxed">
                  تواصل معي الآن للحصول على استشارة مجانية وتحويل فكرتك إلى منتج رقمي ناجح.
                </p>

                <form className="space-y-5 text-right" onSubmit={handleWhatsApp}>
                  {[
                    { label: "الاسم الكريم", placeholder: "أدخل اسمك الكريم", value: name, onChange: setName, type: "input" },
                    { label: "عنوان الرسالة", placeholder: "موضوع رسالتك أو طلبك", value: subject, onChange: setSubject, type: "input" },
                  ].map((field, i) => (
                    <motion.div
                      key={i}
                      className="space-y-1.5"
                      initial={{ opacity: 0, x: 20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.1 }}
                    >
                      <label className="text-sm font-semibold text-white/70 block">{field.label}</label>
                      <Input
                        required
                        placeholder={field.placeholder}
                        value={field.value}
                        onChange={(e) => field.onChange(e.target.value)}
                        className="bg-white/5 border-white/15 h-14 rounded-xl text-white placeholder:text-white/25 focus-visible:ring-primary/50 focus-visible:border-primary transition-all"
                      />
                    </motion.div>
                  ))}
                  <motion.div
                    className="space-y-1.5"
                    initial={{ opacity: 0, x: 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.2 }}
                  >
                    <label className="text-sm font-semibold text-white/70 block">نص الرسالة</label>
                    <Textarea
                      required
                      placeholder="اكتب تفاصيل مشروعك أو فكرتك هنا..."
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      className="bg-white/5 border-white/15 min-h-[140px] rounded-xl text-white placeholder:text-white/25 focus-visible:ring-primary/50 focus-visible:border-primary resize-none transition-all"
                    />
                  </motion.div>

                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Button
                      type="submit"
                      className="w-full h-14 rounded-xl bg-gradient-to-r from-primary to-secondary hover:opacity-90 text-white text-lg font-bold shadow-[0_0_25px_rgba(124,58,237,0.4)] transition-all flex items-center justify-center gap-3 mt-2"
                    >
                      <Send className="w-5 h-5 rotate-180" />
                      <span>ارسال عبر واتساب</span>
                    </Button>
                  </motion.div>
                </form>
              </div>
            </motion.div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/5 py-10 text-center text-white/35 text-sm">
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          جميع الحقوق محفوظة &copy; {new Date().getFullYear()} — ستوديو.كود
        </motion.p>
      </footer>
    </div>
  );
}
