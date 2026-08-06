import Image from 'next/image';
import productsData from '@/data/products.json';
import { Product } from '@/types/product';
import WhopCheckoutEmbed from '@/components/WhopCheckoutEmbed';
import MetaPixel from '@/components/MetaPixel';

const products = productsData as unknown as Product[];
const book = products[0];

const painPoints = [
  {
    icon: '📉',
    title: 'المبيعات مرتفعة والحساب فارغ',
    desc: 'نهاية الشهر تجد أن المصاريف ابتلعت الأرباح دون أن تدري أين ذهبت الأموال.',
  },
  {
    icon: '🥩',
    title: 'هدر المواد الأولية (Food Cost)',
    desc: 'تلف، سرقة، أو سوء تخزين في المطبخ يلتهم هامش ربحك يوماً بعد يوم.',
  },
  {
    icon: '📊',
    title: 'غياب الرقابة المالية الحقيقية',
    desc: 'الاعتماد على العشوائية والإحساس بدلاً من الأرقام والجداول الدقيقة في الإدارة.',
  },
  {
    icon: '🚨',
    title: 'الخوف المستمر من الإغلاق',
    desc: 'الضغط النفسي والمادي الناتج عن تقلبات التكاليف وارتفاع أسعار المواد.',
  },
];

const chapters = [
  { num: '01', title: 'الاستراتيجية ودراسة الجدوى', desc: 'حجر الأساس: لماذا تفشل 60% من المطاعم، وكيف تنجو أنت عبر خطة مدروسة قبل أول ريال.' },
  { num: '02', title: 'المتطلبات القانونية والتنظيمية', desc: 'درع الحماية: التراخيص والاشتراطات البلدية والصحية في السعودية بلا غرامات ولا إيقافات.' },
  { num: '03', title: 'هندسة الموقع والتجهيزات', desc: 'مصنع الطعام: كيف تصمم مطبخك وموقعك ليخدم الكفاءة ويضاعف إنتاجية الفريق.' },
  { num: '04', title: 'قائمة الطعام والموردون', desc: 'علم الربحية: هندسة المنيو وتكاليف الوصفات وبناء سلسلة إمداد ذكية.' },
  { num: '05', title: 'الكادر البشري والتشغيل القياسي', desc: 'محرك الجودة: التوظيف الذكي، SOPs، والحوافز التي تثبّت أفضل موظفيك.' },
  { num: '06', title: 'التسويق والإطلاق', desc: 'فن الجاذبية: استراتيجية افتتاح صاخبة وتسويق رقمي يناسب السوق السعودي.' },
  { num: '07', title: 'الإدارة التشغيلية اليومية', desc: 'فن السيطرة: رقابة المخزون والصيانة الوقائية وإدارة ذروة الزحام.' },
  { num: '08', title: 'بروتوكول التدقيق الأسبوعي', desc: 'محاسبة المسؤولين: نظام أسبوعي يفضح أي تسريب قبل أن يكبر.' },
];

const audiences = [
  { icon: '🏪', title: 'أصحاب المطاعم القائمة', desc: 'يواجهون صعوبة في تحقيق أرباح حقيقية رغم ازدحام الزبائن.' },
  { icon: '🚀', title: 'رواد الأعمال الجدد', desc: 'يخططون لفتح مطعم أو مشروع فاست فود ويريدون دخول السوق بأمان.' },
  { icon: '⚙️', title: 'مديرو التشغيل', desc: 'يريدون تطوير مهاراتهم الإدارية والمالية لرفع كفاءة المكان.' },
  { icon: '📱', title: 'أصحاب مشاريع الكافيهات', desc: 'البحث عن أنظمة صارمة تحمي الهامش وتحقق النمو في السعودية.' },
];

const faqs = [
  {
    q: 'كيف أحصل على الكتاب بعد الدفع؟',
    a: 'بعد إتمام الدفع عبر Whop ستحصل فوراً على رابط تحميل الكتاب بصيغة PDF، ويمكنك قراءته على أي جهاز: هاتف، حاسوب، أو جهاز لوحي.',
  },
  {
    q: 'هل المحتوى مخصص للسوق السعودي؟',
    a: 'نعم، الكتاب مبني على واقع السوق السعودي: التراخيص، الاشتراطات البلدية، سلوك الزبائن، والتسعير في مدن المملكة.',
  },
  {
    q: 'هل الكتاب مناسب لمن يخطط للفتح لأول مرة؟',
    a: 'تماماً. الفصول الأولى تغطي دراسة الجدوى والمتطلبات القانونية خطوة بخطوة لتجنب أخطر أخطاء المبتدئين.',
  },
  {
    q: 'هل يمكنني القراءة على الهاتف؟',
    a: 'نعم، نسخة PDF عالية الجودة متوافقة مع كافة الأجهزة، بالإضافة إلى نسخة إلكترونية سهلة التصفح.',
  },
];

const excelTools = [
  {
    icon: '📊',
    title: '1. نظام لوحة الاستراتيجية ودراسة الجدوى',
    desc: 'أداة تفاعلية مبكرة لحساب نقطة التعادل، ومؤشرات الأمان المالي، واحتمالية استمرار المطعم في السوق الخليجي.',
  },
  {
    icon: '🧾',
    title: '2. نظام الامتثال والضرائب (النسخة السعودية المحدثة)',
    desc: 'حاسبة آلية دقيقة ومقفلة لحساب ضريبة القيمة المضافة 15%، رسوم الزكاة، تكاليف التأمينات (GOSI)، ورسوم قوى والعمالة لتجنب المخالفات القانونية.',
  },
  {
    icon: '🍽️',
    title: '3. حقيبة بقاء المطاعم والتشغيل اليومي',
    desc: 'المساعد المالي Forensics لكشف تسريبات النقد الخفية، مصفوفة هندسة قائمة الطعام (Menu Engineering)، وقوائم الجرد والتحكم بالهدر التشغيلي.',
  },
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#001a0b] text-white overflow-hidden">
      {book.metaPixelId && (
        <MetaPixel
          pixelId={book.metaPixelId}
          contentName={book.title}
          contentId={book.id}
          price={String(book.price)}
        />
      )}
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-emerald-500/10 bg-[#001a0b]/85 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#00562a] to-[#00260f] border border-emerald-500/30 flex items-center justify-center text-xl">📖</div>
            <div>
              <div className="font-black text-sm leading-tight">كيف لا يُغلق مطعمك؟</div>
              <div className="text-[11px] text-emerald-400 font-semibold">الدليل السعودي العملي</div>
            </div>
          </div>
          <a
            href="#offer"
            className="btn-buy px-5 py-2.5 rounded-xl text-sm inline-block"
          >
            اشترِ الآن
          </a>
        </div>
      </header>

      {/* HERO */}
      <section className="relative min-h-screen flex flex-col justify-center px-4 py-16 overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <Image
            src="/images/photo2.webp"
            alt="Restaurant"
            fill
            priority
            sizes="100vw"
            className="object-cover opacity-20"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#001a0b]/95 via-[#001a0b]/90 to-[#001a0b]" />
        </div>
        <div className="hero-orb w-[500px] h-[500px] bg-emerald-500/15 top-0 -right-40 rounded-full blur-[120px]" aria-hidden />
        <div className="hero-orb w-[400px] h-[400px] bg-red-500/10 bottom-0 -left-40 rounded-full blur-[100px]" aria-hidden />

        <div className="relative z-10 max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
          <div className="text-center lg:text-right">
            <div className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full bg-white/5 border border-ivory/30 backdrop-blur mb-8">
              <span className="w-1.5 h-1.5 rounded-full bg-[#D4AF37]" />
              <span className="text-sm font-semibold tracking-wide text-ivory">🇸🇦 دليل عملي مخصص للسوق السعودي</span>
            </div>

            <h1 className="text-4xl md:text-6xl font-black leading-tight mb-6" style={{ textShadow: '0 0 60px rgba(212,175,55,0.15)' }}>
              هل يدير مطعمك الأموال
              <br />
              أم <span className="text-ivory">ينزفها بصمت؟</span>
            </h1>

            <p className="text-emerald-50 text-lg md:text-xl mb-8 max-w-xl mx-auto lg:mx-0 leading-relaxed">
              اكتشف الأخطاء القاتلة التي تؤدي إلى إغلاق <span className="font-black text-red-400 animate-pulse inline-block">60% من المطاعم في عامها الأول</span>،
              وكيف تحوّل أرقامك الحقيقية إلى ربحية مستدامة في السوق السعودي.
            </p>

            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4">
              <a
                href="#offer"
                className="btn-buy px-10 py-5 rounded-2xl text-xl inline-block"
              >
                احصل على الكتاب الآن
              </a>
              <a
                href="#chapters"
                className="px-8 py-4 rounded-2xl border border-ivory/40 text-ivory font-bold text-lg hover:bg-ivory/10 hover:border-ivory/70 transition-colors"
              >
                استكشف المحتوى
              </a>
            </div>

            <div className="mt-14 flex flex-wrap items-center justify-center lg:justify-start gap-x-6 gap-y-3">
              {[
                { icon: '⚡', label: 'تحميل فوري' },
                { icon: '🔒', label: 'دفع آمن عبر Whop' },
                { icon: '📄', label: 'PDF عالي الجودة' },
                { icon: '🇸🇦', label: 'مخصص للسوق السعودي' },
              ].map((item) => (
                <div key={item.label} className="flex items-center gap-2 text-sm text-neutral-300">
                  <span className="text-lg">{item.icon}</span>
                  <span>{item.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Book cover */}
          <div className="relative flex justify-center">
            <div className="relative animate-float">
              <div className="absolute -inset-8 rounded-[3rem] bg-emerald-500/20 blur-[60px]" aria-hidden />
              <div className="relative w-64 md:w-80 rounded-3xl overflow-hidden shadow-2xl shadow-emerald-900/60 ring-1 ring-emerald-400/30 card-3d">
                <Image
                  src="/images/cover.webp"
                  alt="كيف لا يُغلق مطعمك"
                  width={640}
                  height={1137}
                  sizes="(max-width: 768px) 256px, 320px"
                  className="w-full h-auto"
                  priority
                />
              </div>
              <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 px-5 py-3 rounded-2xl glass backdrop-blur font-bold text-sm whitespace-nowrap animate-float-slow">
                ⭐ 8 فصول عملية · تسليم فوري
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* PAIN POINTS */}
      <section id="problems" className="relative max-w-6xl mx-auto px-4 py-20">
        <div className="text-center mb-14">
          <span className="text-emerald-400 font-semibold mb-2 inline-block">⚠️ هل تعاني من هذه المشكلات في مطعمك اليوم؟</span>
          <h2 className="text-3xl md:text-5xl font-black mb-4">علامات أن مطعمك ينزف</h2>
          <p className="text-neutral-300 max-w-2xl mx-auto">إذا كنت تعيش واحدة من هذه المشكلات، فهذا الكتاب صُمم خصيصاً لك.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {painPoints.map((point, i) => (
            <div
              key={point.title}
              className="glass rounded-3xl p-6 text-center scroll-reveal hover:-translate-y-2 hover:border-red-500/40 transition-all duration-300"
              style={{ animationDelay: `${i * 0.1}s` }}
            >
              <div className="text-5xl mb-4">{point.icon}</div>
              <h3 className="text-lg font-bold mb-2 text-red-300">{point.title}</h3>
              <p className="text-neutral-400 text-sm leading-relaxed">{point.desc}</p>
            </div>
          ))}
        </div>

        <div className="mt-14 glass rounded-3xl p-10 text-center scroll-reveal">
          <div className="text-5xl mb-4 text-emerald-400">❝</div>
          <p className="text-xl md:text-2xl font-bold leading-relaxed max-w-3xl mx-auto">
            الإدارة العشوائية هي المسمار الأول في نعش أي مشروع طعام ناجح.
            <span className="text-gradient"> الأرقام لا تكذب</span>، ومن لا يحسب بدقة.. يخرج من السوق قريباً.
          </p>
        </div>
      </section>

      {/* WHAT'S INSIDE */}
      <section id="chapters" className="relative max-w-6xl mx-auto px-4 py-20">
        <div className="hero-orb w-[400px] h-[400px] bg-emerald-500/15 top-20 right-0 rounded-full blur-[100px]" aria-hidden />
        <div className="text-center mb-14">
          <span className="text-emerald-400 font-semibold mb-2 inline-block">📖 ماذا ستتعلم داخل هذا الدليل الحصري؟</span>
          <h2 className="text-3xl md:text-5xl font-black mb-4">8 فصول تحمي مطعمك من الانهيار</h2>
          <p className="text-neutral-300 max-w-3xl mx-auto leading-relaxed text-lg">
            ليس كتاباً نظرياً طويلاً؛ بل دليل عملي مباشر وخلاصة سنوات من الخبرة في تشغيل وإدارة المشاريع الغذائية
            في السعودية. أنظمة صارمة وسياسات مالية وتشغيلية تحوّل الفوضى إلى أرباح صافية قابلة للقياس والتوسع.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {chapters.map((chapter, i) => (
            <div
              key={chapter.num}
              className="glass rounded-2xl p-6 scroll-reveal group hover:-translate-y-1 hover:border-emerald-500/40 transition-all duration-300"
              style={{ animationDelay: `${i * 0.05}s` }}
            >
              <div className="flex items-start gap-4">
                <div className="text-3xl font-black text-gradient shrink-0">{chapter.num}</div>
                <div>
                  <h3 className="font-bold text-lg mb-1 group-hover:text-emerald-400 transition-colors">{chapter.title}</h3>
                  <p className="text-neutral-400 text-sm leading-relaxed">{chapter.desc}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Bonus */}
        <div className="mt-8 rounded-3xl p-6 bg-gradient-to-l from-[#00562a] to-[#003a17] border border-emerald-500/30 flex flex-col md:flex-row items-center gap-6 scroll-reveal">
          <div className="text-5xl">🎁</div>
          <div className="flex-1 text-center md:text-right">
            <h3 className="font-black text-xl mb-1">ملاحق وأدوات عملية (Toolkit)</h3>
            <p className="text-emerald-50/90 text-sm">
              3 أنظمة إكسيل احترافية كاملة: لوحة الاستراتيجية، الامتثال والضرائب السعودية، وحقيبة التشغيل
              اليومي — تُسلَّم فوراً مع الكتاب عبر Whop.
            </p>
          </div>
        </div>
      </section>

      {/* PHOTOS GALLERY */}
      <section className="relative max-w-6xl mx-auto px-4 py-20">
        <div className="text-center mb-14">
          <span className="text-emerald-400 font-semibold mb-2 inline-block">📸 من داخل الكتاب</span>
          <h2 className="text-3xl md:text-5xl font-black mb-4">أسلوب عملي واضح ومباشر</h2>
          <p className="text-neutral-300 max-w-2xl mx-auto">جداول، أمثلة، وخطوات تطبيقية تصلح للسوق السعودي فوراً.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { src: '/images/photo1.webp', alt: 'محتوى الكتاب', label: 'جداول وتطبيقات عملية' },
            { src: '/images/photo2.webp', alt: 'محتوى الكتاب', label: 'أنظمة تشغيلية واضحة' },
            { src: '/images/photo3.webp', alt: 'محتوى الكتاب', label: 'خطط تسويق وإطلاق' },
          ].map((photo, i) => (
            <div
              key={photo.src}
              className="glass rounded-3xl overflow-hidden scroll-reveal group hover:-translate-y-2 transition-all duration-300"
              style={{ animationDelay: `${i * 0.1}s` }}
            >
              <div className="relative aspect-[4/5] overflow-hidden">
                <Image
                  src={photo.src}
                  alt={photo.alt}
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  className="object-cover group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#001a0b]/90 to-transparent" />
                <div className="absolute bottom-4 right-4 left-4">
                  <span className="glass px-3 py-1.5 rounded-full text-xs font-bold">{photo.label}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* WHO IS IT FOR */}
      <section id="audience" className="relative max-w-6xl mx-auto px-4 py-20">
        <div className="text-center mb-14">
          <span className="text-emerald-400 font-semibold mb-2 inline-block">👥 لمن هذا الكتاب بالذات؟</span>
          <h2 className="text-3xl md:text-5xl font-black mb-4">اختر ملفك.. نعرض الحل الملائم</h2>
          <p className="text-neutral-300 max-w-2xl mx-auto">الكتاب يتكيف مع وضعك الخاص في السوق السعودي.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {audiences.map((aud, i) => (
            <div
              key={aud.title}
              className="glass rounded-3xl p-6 text-center scroll-reveal hover:-translate-y-2 hover:border-emerald-500/40 transition-all duration-300"
              style={{ animationDelay: `${i * 0.1}s` }}
            >
              <div className="text-5xl mb-4">{aud.icon}</div>
              <h3 className="font-bold text-lg mb-2">{aud.title}</h3>
              <p className="text-neutral-400 text-sm leading-relaxed">{aud.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* OFFER */}
      <section id="offer" className="relative max-w-6xl mx-auto px-4 py-20">
        <div className="relative rounded-[2rem] overflow-hidden p-10 md:p-16 bg-gradient-to-br from-[#003a17] to-[#001a0b] border border-emerald-500/20">
          <div className="absolute inset-0">
            <Image
              src="/images/photo1.webp"
              alt="Background"
              fill
              sizes="100vw"
              className="object-cover opacity-10 animate-slow-zoom"
            />
            <div className="absolute inset-0 bg-gradient-to-br from-[#001a0b]/85 to-[#001a0b]/90" />
          </div>

          <div className="relative z-10 grid lg:grid-cols-2 gap-10 items-center">
            <div>
              <span className="text-emerald-300 font-semibold mb-3 inline-block">💰 استثمار صغير.. يحمي مشروعك من خسارة الآلاف</span>
              <h2 className="text-3xl md:text-4xl font-black mb-6">بدلاً من إهدار ميزانيتك على استشارات باهظة</h2>
              <p className="text-emerald-50 text-lg mb-6 leading-relaxed">
                احصل على الخلاصة المباشرة للنجاح المالي والتشغيلي في السوق السعودي. الدفعة الواحدة أقل من ثمن استشارة
                واحدة.. وتبقى معك مدى الحياة.
              </p>

              <div className="space-y-3 mb-8">
                {[
                  { icon: '📄', label: 'كتاب رقمي PDF عالي الجودة' },
                  { icon: '📱', label: 'متوافق مع كافة الأجهزة' },
                  { icon: '⚡', label: 'تسليم فوري بعد الدفع' },
                  { icon: '🇸🇦', label: 'محتوى عملي للسوق السعودي' },
                  { icon: '🔒', label: 'دفع آمن ومشفر عبر Whop' },
                ].map((item) => (
                  <div key={item.label} className="flex items-center gap-3 text-emerald-50">
                    <span className="w-6 h-6 rounded-full bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-sm shrink-0">✓</span>
                    <span>{item.label}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="glass rounded-3xl p-8 text-center">
              <div className="relative w-48 mx-auto mb-6">
                <div className="absolute -inset-6 bg-emerald-500/20 blur-[40px] rounded-full" aria-hidden />
                <div className="relative rounded-2xl overflow-hidden shadow-2xl shadow-emerald-900/60 ring-1 ring-emerald-400/30 rotate-[-4deg] hover:rotate-0 transition-transform duration-500">
                  <Image
                    src="/images/cover.webp"
                    alt="الكتاب"
                    width={640}
                    height={1137}
                    sizes="192px"
                    className="w-full h-auto"
                  />
                </div>
              </div>

              <div className="flex items-baseline justify-center mb-2">
                <span dir="ltr" className="text-5xl font-black text-white leading-none">90</span>
                <span dir="ltr" className="text-2xl font-bold text-white leading-none">$</span>
              </div>
              <p className="mx-auto max-w-md text-sm leading-relaxed text-[#D4AF37] font-medium mb-6">
                الحزمة الحالية تشمل: الدليل الشامل PDF (8 فصول) + أنظمة الإكسيل الثلاثة الكاملة
                (متاحة لأول 100 مشترٍ فقط في السوق السعودي لضمان حصرية الاستراتيجية).
              </p>

              <div className="mt-6 rounded-2xl border border-[#D4AF37]/40 bg-gradient-to-b from-[#D4AF37]/10 to-transparent p-6 text-right">
                <div className="flex items-center gap-3 mb-4">
                  <svg
                    className="w-8 h-8 shrink-0 text-[#D4AF37]"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden
                  >
                    <path d="M12 2l8 3v6c0 5-3.5 9.5-8 11-4.5-1.5-8-6-8-11V5l8-3z" />
                    <path d="M9 12l2 2 4-4" />
                  </svg>
                  <h3 className="text-xl font-black text-white tracking-wide">ضمان الاستثمار الآمن</h3>
                </div>
                <p className="text-sm leading-loose text-neutral-200 tracking-wide">
                  نحن لا نبيع مجرد معلومات، بل نمنحك أصولاً تشغيلية. إذا قمت بتطبيق مصفوفة الفحص
                  المالي الواردة في الدليل على مطعمك ولم تكتشف ثغرة مالية واحدة أو هدرًا خفيًا
                  في التدفقات النقدية خلال أول 14 يومًا، راسلنا عبر البريد الإلكتروني وسنعيد لك
                  كامل مبلغ الاستثمار
                  <span dir="ltr" className="inline-block mx-1 text-[#D4AF37] font-bold">$90</span>
                  فورًا دون تعقيدات.
                </p>
              </div>

              <div className="whop-embed-shell mt-6 rounded-2xl border border-[#D4AF37]/60 bg-white/[0.03] p-3 md:p-5 shadow-[0_8px_40px_-12px_rgba(212,175,55,0.25)]">
                <WhopCheckoutEmbed
                  planId={book.whopPlanId!}
                  className="w-full min-h-[420px] md:min-h-[420px] overflow-hidden rounded-xl"
                />
              </div>

              <div className="mt-4 text-xs text-neutral-400">
                🔒 دفع آمن عبر Whop — لن تغادر هذه الصفحة
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* BONUS: EXCEL TOOLKIT */}
      <section className="relative max-w-6xl mx-auto px-4 py-20">
        <div className="relative rounded-[2rem] overflow-hidden bg-gradient-to-br from-[#FDFBF4] via-[#F9F4E7] to-[#F0E8D2] border-2 border-[#D4AF37]/40 shadow-[0_30px_80px_-20px_rgba(212,175,55,0.35)]">
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-[#D4AF37]/15 rounded-full blur-[90px]" aria-hidden />
          <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-emerald-700/10 rounded-full blur-[90px]" aria-hidden />

          <div className="relative z-10 p-8 md:p-14">
            <div className="text-center mb-12">
              <span className="inline-block px-4 py-1.5 rounded-full bg-[#D4AF37]/15 border border-[#D4AF37]/50 text-[#8a6d1d] font-black text-sm tracking-wide mb-4">🎁 هدية حصرية لأول 100 مشترٍ</span>
              <h2 className="text-3xl md:text-5xl font-black mb-4 text-[#06251a]">
                حقيبة بقاء المطاعم 2026
                <span className="text-[#B8860B] block md:inline"> — 3 أنظمة إكسيل احترافية</span>
              </h2>
              <p className="text-[#3d4d44] max-w-3xl mx-auto text-lg leading-relaxed">
                فصول الدليل الثمانية تُترجم إلى أدوات عمل حقيقية: ثلاثة أنظمة إكسيل كاملة مصممة للبيئة
                التنظيمية السعودية. خلايا الإدخال فقط قابلة للتعديل، وكل الصيغ مقفلة ومحمية بالكامل.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
              {excelTools.map((tool, i) => (
                <div
                  key={tool.title}
                  className="relative rounded-3xl bg-white p-6 shadow-[0_10px_40px_-14px_rgba(6,37,26,0.28)] border border-[#D4AF37]/30 scroll-reveal hover:-translate-y-2 hover:border-[#D4AF37]/70 hover:shadow-[0_22px_55px_-14px_rgba(212,175,55,0.5)] transition-all duration-300"
                  style={{ animationDelay: `${i * 0.08}s` }}
                >
                  <div className="text-5xl mb-4">{tool.icon}</div>
                  <h3 className="font-black text-[#06251a] text-lg mb-2 leading-snug">{tool.title}</h3>
                  <p className="text-[#4a5a50] text-sm leading-relaxed">{tool.desc}</p>
                </div>
              ))}
            </div>

            {/* Bundle emphasis */}
            <div className="relative rounded-3xl bg-gradient-to-br from-[#06251a] via-[#09351f] to-[#0a3a26] text-white p-8 md:p-10 overflow-hidden">
              <div className="absolute top-0 right-0 w-72 h-72 bg-[#D4AF37]/20 rounded-full blur-[80px]" aria-hidden />
              <div className="relative z-10 text-center">
                <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-[#D4AF37]/15 border border-[#D4AF37]/40 text-[#F5D98B] font-black text-sm mb-6">
                  ⚡ استلام فوري فور إتمام الدفع عبر Whop
                </div>
                <h3 className="text-2xl md:text-4xl font-black mb-2">حزمتك الكاملة تشمل:</h3>
                <p className="text-neutral-300 mb-7">استثمار واحد يمنحك كل أصول التشغيل دفعة واحدة.</p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-3xl mx-auto mb-7">
                  <div className="rounded-2xl bg-white/5 border border-white/15 p-5 flex items-center gap-4 text-right hover:border-[#D4AF37]/50 transition-colors">
                    <div className="text-4xl shrink-0">📄</div>
                    <div>
                      <div className="font-black text-lg">الدليل الشامل PDF</div>
                      <div className="text-sm text-neutral-300">8 فصول عملية كاملة من الكتاب</div>
                    </div>
                  </div>
                  <div className="rounded-2xl bg-white/5 border border-white/15 p-5 flex items-center gap-4 text-right hover:border-[#D4AF37]/50 transition-colors">
                    <div className="text-4xl shrink-0">📊</div>
                    <div>
                      <div className="font-black text-lg">3 أنظمة إكسيل كاملة</div>
                      <div className="text-sm text-neutral-300">الاستراتيجية + الامتثال والضرائب + التشغيل اليومي</div>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-sm text-neutral-200">
                  <span className="inline-flex items-center gap-1.5"><span className="text-emerald-400 font-black">✓</span> دفع آمن ومشفر عبر Whop</span>
                  <span className="inline-flex items-center gap-1.5"><span className="text-emerald-400 font-black">✓</span> تحميل فوري بعد الدفع مباشرة</span>
                  <span className="inline-flex items-center gap-1.5"><span className="text-emerald-400 font-black">✓</span> متوافق مع Excel و LibreOffice و Google Sheets</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="relative max-w-3xl mx-auto px-4 py-20">
        <div className="text-center mb-14">
          <span className="text-emerald-400 font-semibold mb-2 inline-block">❓ أسئلة شائعة</span>
          <h2 className="text-3xl md:text-4xl font-black mb-4">كل ما تريد معرفته</h2>
        </div>
        <div className="space-y-4">
          {faqs.map((faq, i) => (
            <details
              key={i}
              className="glass rounded-2xl p-5 group scroll-reveal"
              style={{ animationDelay: `${i * 0.05}s` }}
            >
              <summary className="font-bold text-lg cursor-pointer flex items-center justify-between gap-4 list-none">
                <span>{faq.q}</span>
                <span className="text-emerald-400 text-2xl group-open:rotate-45 transition-transform">+</span>
              </summary>
              <p className="mt-3 text-neutral-400 leading-relaxed">{faq.a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="relative px-4 pb-20">
        <div className="max-w-3xl mx-auto text-center glass rounded-[2rem] p-10 md:p-14 border-emerald-500/20">
          <div className="text-6xl mb-6 animate-float">📖</div>
          <h2 className="text-3xl md:text-5xl font-black mb-4">جاهز لحماية مطعمك ومضاعفة أرباحك؟</h2>
          <p className="text-neutral-300 text-lg mb-8 max-w-xl mx-auto">
            اضغط على الزر أدناه لإتمام الطلب بأمان عبر Whop وتحميل نسختك فوراً.
            سعر الكتاب <span dir="ltr" className="text-white font-black">90$</span> فقط.
          </p>
          <a
            href="#offer"
            className="btn-buy inline-block px-12 py-5 rounded-2xl text-xl"
          >
            اشتري الكتاب الآن
          </a>
          <div className="mt-5 text-xs text-neutral-400">✅ دفع آمن · ✅ تسليم فوري · 🔒 لن تغادر هذه الصفحة</div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-emerald-500/10 py-10">
        <div className="max-w-6xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="text-neutral-400 text-sm">© 2026 كيف لا يُغلق مطعمك؟ — Digital Publishing Project KSA. جميع الحقوق محفوظة.</div>
          <div className="flex items-center gap-6 text-neutral-500 text-sm">
            <a href="#problems" className="hover:text-emerald-400 transition-colors">المشكلات</a>
            <a href="#chapters" className="hover:text-emerald-400 transition-colors">المحتوى</a>
            <a href="#offer" className="hover:text-emerald-400 transition-colors">السعر</a>
            <a href="#offer" className="hover:text-emerald-400 transition-colors">الشراء</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
