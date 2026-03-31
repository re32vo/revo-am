import { motion } from "framer-motion";
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
  TerminalSquare
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export default function Home() {
  const fadeIn = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 }
  };

  const staggerContainer = {
    animate: {
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  return (
    <div className="min-h-screen bg-background selection:bg-primary selection:text-white">
      {/* Decorative background gradients */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-primary/20 blur-[120px]" />
        <div className="absolute top-[40%] -right-[10%] w-[40%] h-[40%] rounded-full bg-secondary/20 blur-[120px]" />
        <div className="absolute -bottom-[20%] left-[20%] w-[60%] h-[60%] rounded-full bg-[#4a1082]/20 blur-[150px]" />
      </div>

      {/* Navbar */}
      <nav className="fixed top-0 w-full z-50 glass-panel border-b-0 border-white/5">
        <div className="container mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-[0_0_15px_rgba(124,58,237,0.5)]">
              <TerminalSquare className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-xl tracking-wide">ستوديو<span className="text-primary">.كود</span></span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-white/80">
            <a href="#services" className="hover:text-white transition-colors nav-link">الخدمات</a>
            <a href="#packages" className="hover:text-white transition-colors nav-link">الباقات</a>
            <a href="#stats" className="hover:text-white transition-colors nav-link">لماذا أنا</a>
            <Button className="rounded-full bg-white text-background hover:bg-white/90 font-bold px-6">
              تواصل معي
            </Button>
          </div>
        </div>
      </nav>

      <main className="relative z-10 pt-20">
        {/* Hero Section */}
        <section className="min-h-[90vh] flex items-center pt-20 pb-32">
          <div className="container mx-auto px-6">
            <div className="max-w-4xl mx-auto text-center">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.7, ease: "easeOut" }}
              >
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-panel mb-8 border-primary/30 text-primary-foreground/80 text-sm">
                  <span className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-secondary opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-secondary"></span>
                  </span>
                  متاح لاستقبال مشاريع جديدة
                </div>
                <h1 className="text-5xl md:text-7xl lg:text-8xl font-black mb-6 leading-tight">
                  أحوّل أفكارك إلى <br />
                  <span className="gradient-text">واقع رقمي مبهر</span>
                </h1>
                <p className="text-lg md:text-xl text-white/70 mb-12 max-w-2xl mx-auto leading-relaxed">
                  مطور برمجيات محترف متخصص في بناء تطبيقات ويب وجوال متطورة، سريعة، ومصممة خصيصاً لتنمية أعمالك في العصر الرقمي.
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                  <Button size="lg" className="w-full sm:w-auto h-14 px-8 text-lg rounded-full bg-primary hover:bg-primary/90 text-white shadow-[0_0_20px_rgba(124,58,237,0.4)] hover:shadow-[0_0_30px_rgba(124,58,237,0.6)] transition-all">
                    ابدأ مشروعك الآن
                    <ChevronLeft className="mr-2 w-5 h-5" />
                  </Button>
                  <Button size="lg" variant="outline" className="w-full sm:w-auto h-14 px-8 text-lg rounded-full border-white/10 hover:bg-white/5 glass-panel">
                    استعرض أعمالي
                  </Button>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Services Section */}
        <section id="services" className="py-24 relative">
          <div className="container mx-auto px-6">
            <motion.div 
              initial="initial"
              whileInView="animate"
              viewport={{ once: true, margin: "-100px" }}
              variants={fadeIn}
              className="text-center mb-16"
            >
              <h2 className="text-3xl md:text-5xl font-bold mb-4">خدمات <span className="text-primary">برمجية متكاملة</span></h2>
              <p className="text-white/60 max-w-2xl mx-auto">كل ما تحتاجه لبناء وتطوير منتجك التقني بأعلى معايير الجودة العالمية</p>
            </motion.div>

            <motion.div 
              initial="initial"
              whileInView="animate"
              viewport={{ once: true }}
              variants={staggerContainer}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {[
                { icon: LayoutTemplate, title: "تطوير المواقع الإلكترونية", desc: "مواقع سريعة، متجاوبة، ومبنية بأحدث التقنيات لتعكس احترافية علامتك التجارية." },
                { icon: Smartphone, title: "تطوير تطبيقات الجوال", desc: "تطبيقات أصلية (Native) وهجينة توفر تجربة مستخدم سلسة على أنظمة iOS و Android." },
                { icon: ShoppingCart, title: "متاجر إلكترونية", desc: "منصات تجارة إلكترونية متكاملة مع بوابات دفع آمنة ولوحات تحكم لإدارة مبيعاتك." },
                { icon: Database, title: "تطوير APIs والخدمات الخلفية", desc: "بنى تحتية قوية وقابلة للتوسع (Scalable) لضمان أداء مستقر لتطبيقاتك." },
                { icon: Code2, title: "تصميم واجهات المستخدم", desc: "تصاميم UX/UI حديثة تركز على سهولة الاستخدام وجاذبية المظهر." },
                { icon: Lightbulb, title: "الاستشارات التقنية", desc: "توجيه تقني لاختيار أفضل التقنيات والحلول لضمان نجاح مشروعك بأقل التكاليف." }
              ].map((service, idx) => (
                <motion.div 
                  key={idx}
                  variants={fadeIn}
                  className="glass-panel p-8 rounded-3xl hover:-translate-y-2 transition-transform duration-300 glow-box group"
                >
                  <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center mb-6 group-hover:bg-primary/20 transition-colors">
                    <service.icon className="w-7 h-7 text-secondary group-hover:text-primary transition-colors" />
                  </div>
                  <h3 className="text-xl font-bold mb-3">{service.title}</h3>
                  <p className="text-white/60 leading-relaxed">{service.desc}</p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* Packages Section */}
        <section id="packages" className="py-24 relative z-10">
          <div className="container mx-auto px-6">
            <motion.div 
              initial="initial"
              whileInView="animate"
              viewport={{ once: true }}
              variants={fadeIn}
              className="text-center mb-16"
            >
              <h2 className="text-3xl md:text-5xl font-bold mb-4">باقات <span className="text-secondary">التسعير</span></h2>
              <p className="text-white/60 max-w-2xl mx-auto">خطط مدروسة لتناسب حجم مشروعك وميزانيتك</p>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center max-w-6xl mx-auto">
              {/* Basic */}
              <motion.div 
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                className="glass-panel p-8 rounded-3xl border border-white/10"
              >
                <div className="mb-8">
                  <h3 className="text-2xl font-bold mb-2">الباقة الأساسية</h3>
                  <p className="text-white/50 text-sm">مثالية للمشاريع الناشئة والتعريفية</p>
                </div>
                <ul className="space-y-4 mb-8">
                  {['موقع بسيط', 'تصميم متجاوب', '5 صفحات', 'تسليم في 7 أيام'].map((feature, i) => (
                    <li key={i} className="flex items-center gap-3 text-white/80">
                      <CheckCircle2 className="w-5 h-5 text-secondary" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                <Button className="w-full rounded-full glass-panel hover:bg-white/10 border-white/10" variant="outline">
                  اطلب الباقة
                </Button>
              </motion.div>

              {/* Professional */}
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="glass-panel p-10 rounded-3xl border-2 border-primary relative transform lg:-translate-y-4 shadow-[0_0_30px_rgba(124,58,237,0.2)]"
              >
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-primary to-secondary px-4 py-1 rounded-full text-xs font-bold shadow-lg">
                  الأكثر شعبية
                </div>
                <div className="mb-8 text-center">
                  <h3 className="text-3xl font-bold mb-2 text-primary-foreground glow-text">الباقة الاحترافية</h3>
                  <p className="text-white/70 text-sm">للمشاريع المتوسطة والأعمال المتنامية</p>
                </div>
                <ul className="space-y-5 mb-10">
                  {['موقع متكامل', 'لوحة تحكم مخصصة', '15 صفحة', 'قاعدة بيانات متطورة', 'تسليم في 21 يوم'].map((feature, i) => (
                    <li key={i} className="flex items-center gap-3 font-medium">
                      <CheckCircle2 className="w-6 h-6 text-primary" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                <Button className="w-full rounded-full bg-primary hover:bg-primary/90 text-white h-12 text-lg shadow-[0_0_15px_rgba(124,58,237,0.5)]">
                  ابدأ الآن
                </Button>
              </motion.div>

              {/* Premium */}
              <motion.div 
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="glass-panel p-8 rounded-3xl border border-white/10"
              >
                <div className="mb-8">
                  <h3 className="text-2xl font-bold mb-2 text-secondary">الباقة المميزة</h3>
                  <p className="text-white/50 text-sm">حلول شاملة للشركات الكبرى</p>
                </div>
                <ul className="space-y-4 mb-8">
                  {['حل برمجي متكامل', 'تطبيق جوال (iOS & Android)', 'دعم فني لمدة 3 أشهر', 'تسليم في 45 يوم'].map((feature, i) => (
                    <li key={i} className="flex items-center gap-3 text-white/80">
                      <CheckCircle2 className="w-5 h-5 text-secondary" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                <Button className="w-full rounded-full glass-panel hover:bg-white/10 border-white/10" variant="outline">
                  اطلب الباقة
                </Button>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Why Choose Me / Stats Section */}
        <section id="stats" className="py-24 relative overflow-hidden">
          <div className="absolute inset-0 bg-[#4a1082]/10 skew-y-3 transform origin-bottom-left z-0"></div>
          <div className="container mx-auto px-6 relative z-10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
              <motion.div 
                initial={{ opacity: 0, x: 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
              >
                <h2 className="text-3xl md:text-5xl font-bold mb-6">لماذا <span className="gradient-text">تختارني؟</span></h2>
                <p className="text-lg text-white/70 mb-8 leading-relaxed">
                  لا أقدم مجرد سطور من الأكواد، بل أقدم حلولاً تقنية ذكية مصممة خصيصاً لحل مشكلاتك وتنمية أعمالك. أجمع بين الخبرة العميقة والشغف بالابتكار لضمان تسليم مشاريع تتجاوز التوقعات.
                </p>
                <div className="space-y-6">
                  {[
                    { title: "جودة لا يعلى عليها", desc: "كود نظيف، قابل للصيانة والتطوير مستقبلاً." },
                    { title: "التزام بالمواعيد", desc: "احترام تام للجدول الزمني المتفق عليه." },
                    { title: "تواصل شفاف", desc: "متابعة مستمرة وإطلاع دائم على سير العمل." }
                  ].map((item, i) => (
                    <div key={i} className="flex gap-4">
                      <div className="w-12 h-12 shrink-0 rounded-full bg-white/5 flex items-center justify-center">
                        <CheckCircle2 className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <h4 className="text-xl font-bold mb-1">{item.title}</h4>
                        <p className="text-white/60">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>

              <motion.div 
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="grid grid-cols-2 gap-6"
              >
                {[
                  { value: "+50", label: "مشروع مكتمل" },
                  { value: "100%", label: "رضا العملاء" },
                  { value: "+5", label: "سنوات خبرة" },
                  { value: "24/7", label: "دعم فني" }
                ].map((stat, i) => (
                  <div key={i} className="glass-panel p-8 rounded-3xl text-center glow-box">
                    <div className="text-4xl md:text-5xl font-black gradient-text mb-2">{stat.value}</div>
                    <div className="text-sm md:text-base font-medium text-white/80">{stat.label}</div>
                  </div>
                ))}
              </motion.div>
            </div>
          </div>
        </section>

        {/* CTA / Contact Section */}
        <section className="py-24 relative">
          <div className="container mx-auto px-6">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="max-w-4xl mx-auto glass-panel p-10 md:p-16 rounded-[3rem] text-center relative overflow-hidden border-primary/20"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-secondary/10 z-0"></div>
              
              <div className="relative z-10">
                <h2 className="text-4xl md:text-5xl font-bold mb-6">هل أنت جاهز لبدء <span className="text-secondary">مشروعك؟</span></h2>
                <p className="text-lg text-white/70 mb-10 max-w-2xl mx-auto">
                  دعنا نتحدث عن فكرتك وكيف يمكننا تحويلها إلى منتج رقمي ناجح. تواصل معي الآن للحصول على استشارة مجانية.
                </p>
                
                <form className="max-w-md mx-auto space-y-4 text-right" onSubmit={(e) => e.preventDefault()}>
                  <Input 
                    placeholder="الاسم الكريم" 
                    className="bg-white/5 border-white/10 h-14 rounded-xl focus:border-primary focus:ring-primary/50 text-white placeholder:text-white/40"
                  />
                  <Input 
                    placeholder="البريد الإلكتروني" 
                    type="email"
                    className="bg-white/5 border-white/10 h-14 rounded-xl focus:border-primary focus:ring-primary/50 text-white placeholder:text-white/40"
                  />
                  <Textarea 
                    placeholder="تفاصيل المشروع أو الفكرة..." 
                    className="bg-white/5 border-white/10 min-h-[120px] rounded-xl focus:border-primary focus:ring-primary/50 text-white placeholder:text-white/40 resize-none"
                  />
                  <Button className="w-full h-14 rounded-xl bg-gradient-to-r from-primary to-secondary hover:opacity-90 text-white text-lg font-bold shadow-[0_0_20px_rgba(124,58,237,0.3)] transition-all flex items-center justify-center gap-2 mt-4">
                    <span>إرسال الرسالة</span>
                    <Send className="w-5 h-5 rotate-180" />
                  </Button>
                </form>
              </div>
            </motion.div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/5 py-8 mt-12 text-center text-white/40 text-sm">
        <p>جميع الحقوق محفوظة &copy; {new Date().getFullYear()} - ستوديو.كود</p>
      </footer>
    </div>
  );
}
