'use client';

import { useState, useMemo } from 'react';
import { Product } from '@/types/product';
import { ALGERIA_SHIPPING_MATRIX } from '@/data/algeriaShippingMatrix';
import { formatPrice } from '@/lib/format';
import WhopCheckoutButton from '@/components/WhopCheckoutButton';
import { loadProductPixels } from '@/lib/tracking';

// Complete Algerian Wilaya data moved to data/algeriaShippingMatrix.ts

interface Window {
  fbq?: (...args: unknown[]) => void;
  ttq?: { track: (event: string) => void };
  snaptr?: (...args: unknown[]) => void;
  gtag?: (...args: unknown[]) => void;
}

declare const window: Window & globalThis.Window;

interface CheckoutFormProps {
  product: Product;
  selectedSize: string | null;
  selectedColor: string | null;
}

export default function CheckoutForm({ product, selectedSize, selectedColor }: CheckoutFormProps) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [selectedWilaya, setSelectedWilaya] = useState('');
  const [selectedBaladiya, setSelectedBaladiya] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [shippingMethod, setShippingMethod] = useState<'home' | 'desk' | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // Get full Wilaya object from code
  const wilayaObj = ALGERIA_SHIPPING_MATRIX.find((w) => w.code === selectedWilaya) || null;

  // Filter baladiyas based on selected wilaya
  const availableBaladiyas = useMemo(() => {
    if (!selectedWilaya || !wilayaObj) return [];
    return wilayaObj.baladiyas;
  }, [selectedWilaya, wilayaObj]);

  // Shipping cost
  const shippingCost = useMemo(() => {
    if (product.freeShipping) return 0;
    if (!shippingMethod || !wilayaObj) return 0;
    return shippingMethod === 'home' ? wilayaObj.homeDeliveryPrice : wilayaObj.deskDeliveryPrice;
  }, [shippingMethod, wilayaObj, product.freeShipping]);

  // Total calculation
  const subtotal = product.price * quantity;
  const total = subtotal + shippingCost;

  // Disable submit button logic
  const canSubmit = useMemo(() => {
    let valid = true;
    if (product.enableNameField && !name.trim()) valid = false;
    if (product.enablePhoneField && !phone.trim()) valid = false;
    if (product.enableWilayaSelect && !selectedWilaya) valid = false;
    if (product.enableBaladiyaSelect && !selectedBaladiya) valid = false;
    if (product.enableQuantityInput && quantity < 1) valid = false;
    if ((product.enableHomeDelivery || product.enableDeskDelivery) && !shippingMethod) valid = false;
    return valid;
  }, [product, name, phone, selectedWilaya, selectedBaladiya, quantity, shippingMethod]);

  // Pixel dispatch after order creation
  const fireConversionEvents = () => {
    const eventName = product.pixelEventMode === 'lead' ? 'Lead' : 'Purchase';
    try {
      // Ensure pixel SDKs are queued even if deferred loading hasn't fired yet
      loadProductPixels(product);

      // Meta Pixel
      if (product.metaPixelId && typeof window !== 'undefined' && window.fbq) {
        window.fbq('track', eventName);
      }
      // TikTok Pixel
      if (product.tiktokPixelId && typeof window !== 'undefined' && window.ttq) {
        const tiktokEvent = product.pixelEventMode === 'lead' ? 'SubmitForm' : 'CompletePayment';
        window.ttq.track(tiktokEvent);
      }
      // Snapchat Pixel
      if (product.snapchatPixelId && typeof window !== 'undefined' && window.snaptr) {
        const snapEvent = product.pixelEventMode === 'lead' ? 'SIGNUP' : 'PURCHASE';
        window.snaptr('track', snapEvent);
      }
      // Google Ads
      if (product.googleAdsId && typeof window !== 'undefined' && window.gtag) {
        window.gtag('event', 'conversion', {
          send_to: product.googleAdsId,
          value: total,
          currency: 'USD',
        });
      }
    } catch (pixelError) {
      console.error('Pixel tracking error', pixelError);
    }
  };

  const handleSubmit = async () => {
    if (!canSubmit || isSubmitting) return;
    setIsSubmitting(true);

    const orderPayload = {
      productSlug: product.slug,
      name: product.enableNameField ? name : 'بدون اسم',
      phone: product.enablePhoneField ? phone : 'N/A',
      wilaya: selectedWilaya || 'N/A',
      baladiya: selectedBaladiya || 'N/A',
      quantity: product.enableQuantityInput ? quantity : 1,
      selectedSize: selectedSize || undefined,
      selectedColor: selectedColor || undefined,
      total: total,
    };

    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderPayload),
      });
      if (!response.ok) throw new Error('Failed to create order');
      fireConversionEvents();
      setSubmitted(true);
    } catch {
      alert('حدث خطأ أثناء الطلب. الرجاء المحاولة مرة أخرى.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // WhatsApp message template
  const whatsappMessage = () => {
    let msg = `أود طلب منتج: ${product.title}\n`;
    if (selectedSize) msg += `المقاس: ${selectedSize}\n`;
    if (selectedColor) msg += `اللون: ${selectedColor}\n`;
    if (product.enableQuantityInput) msg += `الكمية: ${quantity}\n`;
    if (product.enableNameField && name) msg += `الاسم: ${name}\n`;
    if (product.enablePhoneField && phone) msg += `الهاتف: ${phone}\n`;
    if (selectedWilaya) msg += `الولاية: ${ALGERIA_SHIPPING_MATRIX.find(w => w.code === selectedWilaya)?.name}\n`;
    if (selectedBaladiya) msg += `البلدية: ${selectedBaladiya}\n`;
    msg += `الإجمالي: ${formatPrice(total)}`;
    return encodeURIComponent(msg);
  };

  if (submitted) {
    return (
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 text-center space-y-4">
        <div className="text-5xl">✅</div>
        <h3 className="text-2xl font-bold text-white">تم استلام طلبك بنجاح!</h3>
        <p className="text-neutral-400">سيتم التواصل معك قريباً لتأكيد الطلب.</p>
      </div>
    );
  }

  return (
    <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 space-y-6">
      <h2 className="text-xl font-bold text-white">إتمام الطلب</h2>

      {/* Name Field */}
      {product.enableNameField && (
        <div>
          <label className="block text-sm font-medium text-neutral-300 mb-2">الاسم الكامل</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full bg-neutral-950 border border-neutral-700 rounded-xl px-4 py-3 text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            placeholder="أدخل الاسم الكامل"
          />
        </div>
      )}

      {/* Phone Field */}
      {product.enablePhoneField && (
        <div>
          <label className="block text-sm font-medium text-neutral-300 mb-2">رقم الهاتف</label>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full bg-neutral-950 border border-neutral-700 rounded-xl px-4 py-3 text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            placeholder="05xxxxxxxx"
            dir="ltr"
          />
        </div>
      )}

      {/* Wilaya Select */}
      {product.enableWilayaSelect && (
        <div>
          <label className="block text-sm font-medium text-neutral-300 mb-2">الولاية</label>
          <select
            value={selectedWilaya}
            onChange={(e) => { setSelectedWilaya(e.target.value); setSelectedBaladiya(''); }}
            className="w-full bg-neutral-950 border border-neutral-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="">اختر الولاية</option>
            {ALGERIA_SHIPPING_MATRIX.map((w) => (
              <option key={w.code} value={w.code}>{w.name}</option>
            ))}
          </select>
        </div>
      )}

      {/* Baladiya Select (cascading) */}
      {product.enableBaladiyaSelect && selectedWilaya && (
        <div>
          <label className="block text-sm font-medium text-neutral-300 mb-2">البلدية</label>
          <select
            value={selectedBaladiya}
            onChange={(e) => setSelectedBaladiya(e.target.value)}
            className="w-full bg-neutral-950 border border-neutral-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="">اختر البلدية</option>
            {availableBaladiyas.map((b) => (
              <option key={b} value={b}>{b}</option>
            ))}
          </select>
        </div>
      )}

      {/* Quantity Input */}
      {product.enableQuantityInput && (
        <div>
          <label className="block text-sm font-medium text-neutral-300 mb-2">الكمية</label>
          <input
            type="number"
            min={1}
            max={product.stockCount}
            value={quantity}
            onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
            className="w-full bg-neutral-950 border border-neutral-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>
      )}

      {/* Shipping Method Radio Grid */}
      {(product.enableHomeDelivery || product.enableDeskDelivery) && selectedWilaya && (
        <div>
          <label className="block text-sm font-medium text-neutral-300 mb-3">طريقة التوصيل</label>
          <div className="grid grid-cols-2 gap-3">
            {product.enableHomeDelivery && (
              <button
                type="button"
                onClick={() => setShippingMethod('home')}
                className={`rounded-xl border py-3 px-2 text-center text-sm transition-all
                  ${shippingMethod === 'home' ? 'bg-green-600 border-green-600 text-white' : 'bg-neutral-950 border-neutral-700 text-neutral-300 hover:border-neutral-500'}`}
              >
                <span className="block font-bold">توصيل إلى المنزل</span>
                <span className="block text-xs mt-1">{product.freeShipping ? 'مجاني' : wilayaObj ? `${wilayaObj.homeDeliveryPrice} د.ج` : 'اختر الولاية أولاً'}</span>
              </button>
            )}
            {product.enableDeskDelivery && (
              <button
                type="button"
                onClick={() => setShippingMethod('desk')}
                className={`rounded-xl border py-3 px-2 text-center text-sm transition-all
                  ${shippingMethod === 'desk' ? 'bg-green-600 border-green-600 text-white' : 'bg-neutral-950 border-neutral-700 text-neutral-300 hover:border-neutral-500'}`}
              >
                <span className="block font-bold">استلام من المكتب</span>
                <span className="block text-xs mt-1">{product.freeShipping ? 'مجاني' : wilayaObj ? `${wilayaObj.deskDeliveryPrice} د.ج` : 'اختر الولاية أولاً'}</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Live Invoicing Box */}
      {product.enableCodForm && (
        <div className="bg-neutral-950 border border-neutral-800 rounded-xl p-4 space-y-2 text-white">
          <div className="flex justify-between text-sm">
            <span className="text-neutral-400">سعر المنتج × الكمية</span>
            <span className="font-bold">{formatPrice(subtotal)}</span>
          </div>
          {shippingCost > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-neutral-400">سعر الشحن</span>
              <span className="font-bold">{formatPrice(shippingCost)}</span>
            </div>
          )}
          <div className="border-t border-neutral-800 pt-2 flex justify-between text-lg font-bold">
            <span>المجموع الكلي</span>
            <span className="text-emerald-400">{formatPrice(total)}</span>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="space-y-3">
        {/* Payment Link Button */}
        {product.enablePaymentLink && product.paymentUrl && (
          product.whopPlanId ? (
            <WhopCheckoutButton
              planId={product.whopPlanId}
              className="btn-buy block w-full text-white text-center py-4 rounded-xl font-bold text-lg"
            >
              اشترِ الآن وحمل فوراً
            </WhopCheckoutButton>
          ) : (
            <a
              href={product.paymentUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-buy block w-full text-white text-center py-4 rounded-xl font-bold text-lg"
            >
              اشترِ الآن وحمل فوراً
            </a>
          )
        )}

        {/* WhatsApp Button */}
        {product.enableWhatsApp && (
          <a
            href={`https://wa.me/?text=${whatsappMessage()}`}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-buy block w-full text-white text-center py-4 rounded-xl font-bold text-lg transition-all flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
            اطلب عبر الواتساب
          </a>
        )}

        {/* COD Submit Button */}
        {product.enableCodForm && (
          <button
            onClick={handleSubmit}
            disabled={!canSubmit || isSubmitting}
            className={`w-full py-4 rounded-xl font-bold text-lg transition-all ${
              canSubmit && !isSubmitting
                ? 'bg-green-600 hover:bg-green-500 shadow-lg shadow-emerald-600/20 text-white'
                : 'bg-neutral-800 text-neutral-500 cursor-not-allowed'
            }`}
          >
            {isSubmitting ? 'جاري الإرسال...' : 'تأكيد الطلب'}
          </button>
        )}
      </div>
    </div>
  );
}