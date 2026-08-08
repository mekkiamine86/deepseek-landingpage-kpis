'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import dynamic from 'next/dynamic';
import { Product } from '@/types/product';
import { deferMarketingScripts } from '@/lib/tracking';

const SizeColorSelector = dynamic(() => import('@/components/SizeColorSelector'));

const CheckoutForm = dynamic(() => import('@/components/CheckoutForm'), {
  ssr: false,
  loading: () => (
    <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 space-y-4 animate-pulse">
      <div className="h-6 w-32 rounded-lg bg-neutral-800" />
      <div className="h-14 w-full rounded-xl bg-neutral-800" />
      <div className="h-14 w-full rounded-xl bg-neutral-800" />
    </div>
  ),
});

interface Props {
  product: Product;
}

export default function ProductPageClient({ product }: Props) {
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);

  useEffect(() => {
    deferMarketingScripts(product);
  }, [product]);

  const sizes = product.sizes || [];
  const colors = product.colors || [];

  return (
    <div className="min-h-screen bg-[#001a0b] text-white">
      <div className="max-w-7xl mx-auto px-4 py-10">
        <div className="mb-6 bg-red-900/20 border border-red-800 rounded-xl p-4 text-center">
          <span className="text-red-400 font-bold text-lg">
            متبقي {product.stockCount} نسخة فقط، اطلب الآن قبل نفاد الكمية!
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          <div className="space-y-6">
            <div className="relative aspect-square bg-gradient-to-br from-neutral-800 to-neutral-900 rounded-3xl flex items-center justify-center border border-neutral-800 overflow-hidden">
              {product.imageUrl ? (
                <Image src={product.imageUrl} alt={product.title} width={600} height={600} sizes="(max-width: 1024px) 100vw, 50vw" className="w-full h-full object-cover" />
              ) : product.type === 'digital' ? (
                <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
                  <Image
                    src="https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=1200&q=80"
                    alt="Fast food"
                    fill
                    sizes="(max-width: 1024px) 100vw, 50vw"
                    className="object-cover opacity-20"
                  />
                  <div className="absolute inset-0 bg-gradient-to-br from-[#001a0b]/60 to-[#001a0b]/90" />
                  <div
                    className="hero-orb w-80 h-80"
                    style={{ '--orb-color': 'rgba(16, 185, 129, 0.3)' } as React.CSSProperties}
                    aria-hidden
                  />
                  <div
                    className="relative rotate-[-6deg] hover:rotate-0 transition-transform duration-700"
                    style={{ filter: 'drop-shadow(0 40px 60px rgba(0,200,83,0.35))' }}
                  >
                    <div className="w-48 md:w-64 rounded-2xl overflow-hidden bg-gradient-to-br from-[#00562a] via-[#003a17] to-[#00260f] p-6 shadow-2xl border border-emerald-300/30">
                      <div className="text-6xl mb-8">🍽️</div>
                      <div className="text-white font-black text-xl leading-snug text-center">
                        كيف لا يغلق
                        <br />
                        مطعمك
                      </div>
                      <div className="mt-4 text-center text-emerald-50/90 text-sm leading-tight">
                        الدليل الشامل لأصحاب المطاعم والكافيهات
                      </div>
                      <div className="mt-5 pt-3 border-t border-white/20 text-center text-emerald-50/90 text-xs font-semibold tracking-widest">
                        PDF · 7 أقسام · تسليم فوري
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center space-y-4 p-8">
                  <div className="text-7xl">🛍️</div>
                  <p className="text-neutral-500 text-sm">صورة المنتج</p>
                </div>
              )}
            </div>

            <div>
              <h1 className="text-3xl lg:text-4xl font-extrabold mb-3">{product.title}</h1>
              <p className="text-neutral-400 text-lg leading-relaxed">{product.description}</p>
              <div className="flex items-baseline gap-3 mt-4">
                <span dir="ltr" className="text-3xl font-bold text-white leading-none">90</span>
                <span dir="ltr" className="text-xl font-bold text-white leading-none">$</span>
              </div>

              {product.type === 'digital' && (
                <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {[
                    { icon: '⚡', label: 'تحميل فوري' },
                    { icon: '📱', label: 'قراءة على كل الأجهزة' },
                    { icon: '📄', label: 'صيغة PDF' },
                    { icon: '🛡️', label: 'تحديثات مجانية' },
                  ].map((item) => (
                    <div key={item.label} className="glass rounded-xl p-3 text-center">
                      <div className="text-2xl mb-1">{item.icon}</div>
                      <div className="text-xs text-neutral-300">{item.label}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {sizes.length > 0 && (
              <SizeColorSelector
                sizes={sizes}
                colors={colors}
                selectedSize={selectedSize}
                setSelectedSize={setSelectedSize}
                selectedColor={selectedColor}
                setSelectedColor={setSelectedColor}
              />
            )}
          </div>

          <div>
            <CheckoutForm
              product={product}
              selectedSize={selectedSize}
              selectedColor={selectedColor}
            />
          </div>
        </div>

        {product.type === 'digital' && (
          <div className="mt-16">
            <div className="text-center mb-10">
              <h2 className="text-2xl md:text-3xl font-black mb-2">محتوى الكتاب</h2>
              <p className="text-neutral-400">5 أنظمة عملية تحمي مطعمك من الانهيار</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {[
                { num: '01', title: 'معادلة تسعير الوجبات القاتلة', desc: 'كيف تسعر أطباقك بدقة لضمان هامش ربح صافٍ يغطي التكاليف التشغيلية.' },
                { num: '02', title: 'التحكم المطلق في المخزون', desc: 'استراتيجيات ذكية للقضاء على الهدر وتتبع المواد الأولية من الاستلام حتى البيع.' },
                { num: '03', title: 'لوحة القيادة المالية', desc: 'كيف تقرأ الميزانية وقوائم الأرباح والخسائر بنفسك دون شهادة محاسبية.' },
                { num: '04', title: 'حماية السيولة النقدية', desc: 'طرق مؤكدة لتجنب العجز المالي المفاجئ وإدارة التدفقات النقدية بكفاءة.' },
                { num: '05', title: 'أتمتة العمليات اليومية', desc: 'تنظيم حركة المطبخ وخدمة العملاء لتقليل التكاليف ورفع كفاءة الفريق.' },
                { num: '06', title: 'دراسات حالة واقعية', desc: 'حالات مطاعم وكافيهات نجحت في الخروج من الأزمة وتحقيق الربحية.' },
              ].map((chapter, i) => (
                <div
                  key={chapter.num}
                  className="glass rounded-2xl p-6 scroll-reveal group hover:-translate-y-1 transition-transform"
                  style={{ animationDelay: `${i * 0.08}s` }}
                >
                  <div className="text-4xl font-black text-gradient mb-3">{chapter.num}</div>
                  <h3 className="font-bold text-lg mb-2 group-hover:text-emerald-400 transition-colors">{chapter.title}</h3>
                  <p className="text-neutral-400 text-sm leading-relaxed">{chapter.desc}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
