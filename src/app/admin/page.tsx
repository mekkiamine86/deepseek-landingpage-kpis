'use client';

import { useState, useEffect } from 'react';
import { Product, Order, OrderStatus } from '@/types/product';
import { ALGERIA_SHIPPING_MATRIX } from '@/data/algeriaShippingMatrix';

const STATUS_LABELS: Record<OrderStatus, string> = {
  pending: 'قيد الانتظار',
  confirmed: 'مؤكد',
  shipped: 'تم الشحن',
  delivered: 'تم التوصيل',
  cancelled: 'ملغي',
};

const STATUS_COLORS: Record<OrderStatus, string> = {
  pending: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/30',
  confirmed: 'text-blue-400 bg-blue-400/10 border-blue-400/30',
  shipped: 'text-purple-400 bg-purple-400/10 border-purple-400/30',
  delivered: 'text-green-400 bg-green-400/10 border-green-400/30',
  cancelled: 'text-red-400 bg-red-400/10 border-red-400/30',
};

interface StoreConfig {
  shopify: { enabled: boolean; shopDomain: string; accessToken: string; webhookSecret: string };
  woocommerce: { enabled: boolean; siteUrl: string; consumerKey: string; consumerSecret: string; webhookSecret: string };
  storeName: string;
  storeCurrency: string;
  whatsappNumber: string;
  defaultMetaPixelId: string;
  defaultTiktokPixelId: string;
  defaultSnapchatPixelId: string;
  defaultGoogleAdsId: string;
}

export default function AdminPage() {
  const [password, setPassword] = useState('');
  const [authenticated, setAuthenticated] = useState(false);
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [config, setConfig] = useState<StoreConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'orders' | 'products' | 'settings'>('orders');
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    if (!authenticated) return;
    let cancelled = false;
    (async () => {
      try {
        const [ordersRes, productsRes, configRes] = await Promise.all([
          fetch('/api/orders'),
          fetch('/api/products'),
          fetch('/api/config'),
        ]);
        if (!cancelled) {
          if (ordersRes.ok) setOrders(await ordersRes.json());
          if (productsRes.ok) setProducts(await productsRes.json());
          if (configRes.ok) setConfig(await configRes.json());
        }
      } catch {
        // silent
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [authenticated, refreshKey]);

  const handleLogin = () => {
    if (password === (process.env.NEXT_PUBLIC_ADMIN_PASSWORD || 'admin123')) {
      setAuthenticated(true);
    } else {
      alert('كلمة مرور خاطئة');
    }
  };

  const grossRevenue = orders.reduce((sum, o) => sum + o.total, 0);
  const totalOrders = orders.length;
  const pendingOrders = orders.filter((o) => o.status === 'pending').length;
  const deliveredOrders = orders.filter((o) => o.status === 'delivered').length;
  const conversionRate = totalOrders > 0 ? ((deliveredOrders / totalOrders) * 100).toFixed(1) : '0.0';
  const avgOrderValue = totalOrders > 0 ? (grossRevenue / totalOrders).toFixed(0) : '0';

  const updateOrderStatus = async (orderId: string, newStatus: OrderStatus) => {
    try {
      const res = await fetch('/api/orders', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: orderId, status: newStatus }),
      });
      if (!res.ok) throw new Error('Failed');
      setOrders((prev) => prev.map((o) => o.id === orderId ? { ...o, status: newStatus } : o));
    } catch {
      alert('فشل تحديث الحالة');
    }
  };

  const saveProduct = async (product: Product) => {
    try {
      const res = await fetch('/api/products', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: product.id, updates: product }),
      });
      if (!res.ok) throw new Error('Failed');
      alert('تم حفظ التغييرات');
    } catch {
      alert('فشل حفظ التغييرات');
    }
  };

  const saveConfig = async () => {
    if (!config) return;
    try {
      const res = await fetch('/api/config', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      });
      if (!res.ok) throw new Error('Failed');
      alert('تم حفظ الإعدادات');
    } catch {
      alert('فشل حفظ الإعدادات');
    }
  };

  const exportOrders = (format: string) => {
    window.open(`/api/export?format=${format}`, '_blank');
  };

  const exportShippingRates = () => {
    const header = 'Code,Name,HomeDeliveryPrice,DeskDeliveryPrice,Baladiyas';
    const rows = ALGERIA_SHIPPING_MATRIX.map(
      (w) => `${w.code},${w.name},${w.homeDeliveryPrice},${w.deskDeliveryPrice},"${w.baladiyas.join(';')}"`
    );
    const csv = [header, ...rows].join('\n');
    downloadBlob(csv, 'shipping-matrix.csv', 'text/csv');
  };

  const importOrdersCSV = (file: File) => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const text = e.target?.result as string;
        const lines = text.split('\n').filter((line) => line.trim());
        let imported = 0;
        for (let i = 1; i < lines.length; i++) {
          const cols = lines[i].split(',');
          if (cols.length < 10) continue;
          const payload = {
            productSlug: cols[1],
            name: cols[2],
            phone: cols[3],
            wilaya: cols[4],
            baladiya: cols[5],
            quantity: parseInt(cols[6]),
            selectedSize: cols[7] || undefined,
            selectedColor: cols[8] || undefined,
            total: parseFloat(cols[9]),
          };
          const res = await fetch('/api/orders', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
          });
          if (res.ok) imported++;
        }
        const ordersRes = await fetch('/api/orders');
        if (ordersRes.ok) setOrders(await ordersRes.json());
        alert(`تم استيراد ${imported} طلب بنجاح`);
      } catch {
        alert('فشل استيراد الملف.');
      }
    };
    reader.readAsText(file);
  };

  const downloadBlob = (content: string, fileName: string, mimeType: string) => {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>, type: 'orders' | 'shipping') => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (type === 'orders') importOrdersCSV(file);
    e.target.value = '';
  };

  const toggleProductSetting = (productId: string, field: keyof Product) => {
    setProducts((prev) =>
      prev.map((p) => {
        if (p.id === productId) {
          const value = p[field];
          if (typeof value === 'boolean') {
            return { ...p, [field]: !value };
          }
        }
        return p;
      })
    );
  };

  const updateProductField = (productId: string, field: keyof Product, value: string | number) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === productId ? { ...p, [field]: value } : p))
    );
  };

  const updateConfigField = (field: string, value: string | boolean) => {
    setConfig((prev) => {
      if (!prev) return prev;
      const keys = field.split('.');
      if (keys.length === 2) {
        const section = prev[keys[0] as keyof StoreConfig] as Record<string, unknown>;
        return { ...prev, [keys[0]]: { ...section, [keys[1]]: value } };
      }
      return { ...prev, [field]: value };
    });
  };

  if (!authenticated) {
    return (
      <div className="min-h-screen bg-neutral-950 flex items-center justify-center p-8">
        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-8 w-full max-w-md space-y-6">
          <h1 className="text-2xl font-bold text-white text-center">لوحة التحكم</h1>
          <input
            type="password"
            placeholder="كلمة المرور"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
            className="w-full bg-neutral-950 border border-neutral-800 text-white p-3 rounded-xl focus:border-orange-600 focus:outline-none"
          />
          <button
            onClick={handleLogin}
            className="w-full bg-orange-600 hover:bg-orange-500 text-white py-3 rounded-xl font-bold transition-all"
          >
            دخول
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-950 text-white p-8">
      <div className="max-w-7xl mx-auto space-y-10">
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h1 className="text-3xl font-extrabold">لوحة التحكم</h1>
          <button onClick={() => setRefreshKey((k) => k + 1)} className="bg-neutral-800 hover:bg-neutral-700 text-white px-6 py-2 rounded-xl text-sm transition">
            {loading ? 'جاري التحديث...' : 'تحديث البيانات'}
          </button>
        </header>

        {/* KPIs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <KPICard title="الإيرادات" value={`${grossRevenue.toLocaleString()} د.ج`} />
          <KPICard title="الطلبات" value={totalOrders.toString()} />
          <KPICard title="نسبة التحويل" value={`${conversionRate}%`} />
          <KPICard title="قيد الانتظار" value={pendingOrders.toString()} />
          <KPICard title="متوسط الطلب" value={`${avgOrderValue} د.ج`} />
        </div>

        {/* Data Hub */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6">
          <h2 className="text-lg font-bold mb-4">مركز العمليات</h2>
          <div className="flex flex-wrap gap-3">
            <button onClick={() => exportOrders('csv')} className="bg-neutral-950 hover:bg-neutral-800 text-white border border-neutral-800 py-3 px-4 rounded-xl text-xs">
              تصدير الطلبات CSV
            </button>
            <button onClick={() => exportOrders('xlsx')} className="bg-neutral-950 hover:bg-neutral-800 text-white border border-neutral-800 py-3 px-4 rounded-xl text-xs">
              تصدير الطلبات Excel
            </button>
            <button onClick={() => exportOrders('json')} className="bg-neutral-950 hover:bg-neutral-800 text-white border border-neutral-800 py-3 px-4 rounded-xl text-xs">
              تصدير الطلبات JSON
            </button>
            <label className="bg-neutral-950 hover:bg-neutral-800 text-white border border-neutral-800 py-3 px-4 rounded-xl text-xs cursor-pointer">
              استيراد الطلبات CSV
              <input type="file" accept=".csv" className="hidden" onChange={(e) => handleFileSelect(e, 'orders')} />
            </label>
            <button onClick={exportShippingRates} className="bg-neutral-950 hover:bg-neutral-800 text-white border border-neutral-800 py-3 px-4 rounded-xl text-xs">
              تصدير مصفوفة الشحن CSV
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 border-b border-neutral-800 pb-2">
          {[
            { key: 'orders' as const, label: `الطلبات (${totalOrders})` },
            { key: 'products' as const, label: `المنتجات (${products.length})` },
            { key: 'settings' as const, label: 'الإعدادات' },
          ].map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`px-6 py-2 rounded-xl text-sm font-bold transition ${activeTab === key ? 'bg-orange-600 text-white' : 'text-neutral-400 hover:text-white'}`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Orders Tab */}
        {activeTab === 'orders' && (
          <div className="space-y-4">
            {loading ? (
              <p className="text-neutral-500 text-center py-10">جاري التحميل...</p>
            ) : orders.length === 0 ? (
              <p className="text-neutral-500 text-center py-10">لا توجد طلبات بعد</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-neutral-800 text-neutral-400">
                      <th className="text-right py-3 px-2">رقم الطلب</th>
                      <th className="text-right py-3 px-2">المنتج</th>
                      <th className="text-right py-3 px-2">الاسم</th>
                      <th className="text-right py-3 px-2">الهاتف</th>
                      <th className="text-right py-3 px-2">الولاية</th>
                      <th className="text-right py-3 px-2">الكمية</th>
                      <th className="text-right py-3 px-2">المجموع</th>
                      <th className="text-right py-3 px-2">الحالة</th>
                      <th className="text-right py-3 px-2">التاريخ</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((order) => (
                      <tr key={order.id} className="border-b border-neutral-800/50 hover:bg-neutral-900/50">
                        <td className="py-3 px-2 font-mono text-xs">{order.id}</td>
                        <td className="py-3 px-2">{order.productSlug}</td>
                        <td className="py-3 px-2">{order.name}</td>
                        <td className="py-3 px-2" dir="ltr">{order.phone}</td>
                        <td className="py-3 px-2">{order.wilaya}</td>
                        <td className="py-3 px-2">{order.quantity}</td>
                        <td className="py-3 px-2 font-bold text-orange-500">{order.total.toLocaleString()} د.ج</td>
                        <td className="py-3 px-2">
                          <select
                            value={order.status}
                            onChange={(e) => updateOrderStatus(order.id, e.target.value as OrderStatus)}
                            className={`text-xs rounded-lg px-2 py-1 border bg-transparent ${STATUS_COLORS[order.status]}`}
                          >
                            {(Object.keys(STATUS_LABELS) as OrderStatus[]).map((s) => (
                              <option key={s} value={s} className="bg-neutral-900 text-white">{STATUS_LABELS[s]}</option>
                            ))}
                          </select>
                        </td>
                        <td className="py-3 px-2 text-xs text-neutral-500">{new Date(order.date).toLocaleDateString('ar-DZ')}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Products Tab */}
        {activeTab === 'products' && (
          <div className="space-y-6">
            {products.map((product) => (
              <div key={product.id} className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 space-y-6">
                <div className="flex justify-between items-start">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1">
                    <input
                      type="text"
                      value={product.title}
                      onChange={(e) => updateProductField(product.id, 'title', e.target.value)}
                      className="bg-neutral-950 border border-neutral-800 text-white p-3 rounded-xl focus:border-orange-600 focus:outline-none"
                      placeholder="اسم المنتج"
                    />
                    <input
                      type="number"
                      value={product.price}
                      onChange={(e) => updateProductField(product.id, 'price', Number(e.target.value))}
                      className="bg-neutral-950 border border-neutral-800 text-white p-3 rounded-xl focus:border-orange-600 focus:outline-none"
                      placeholder="السعر"
                    />
                  </div>
                  <button
                    onClick={() => saveProduct(product)}
                    className="bg-orange-600 hover:bg-orange-500 text-white px-6 py-3 rounded-xl font-bold text-sm transition mr-4"
                  >
                    حفظ
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <input
                    type="text"
                    value={product.metaPixelId || ''}
                    onChange={(e) => updateProductField(product.id, 'metaPixelId', e.target.value)}
                    className="bg-neutral-950 border border-neutral-800 text-white p-3 rounded-xl focus:border-orange-600 focus:outline-none"
                    placeholder="Meta Pixel ID"
                  />
                  <input
                    type="text"
                    value={product.tiktokPixelId || ''}
                    onChange={(e) => updateProductField(product.id, 'tiktokPixelId', e.target.value)}
                    className="bg-neutral-950 border border-neutral-800 text-white p-3 rounded-xl focus:border-orange-600 focus:outline-none"
                    placeholder="TikTok Pixel ID"
                  />
                  <input
                    type="text"
                    value={product.snapchatPixelId || ''}
                    onChange={(e) => updateProductField(product.id, 'snapchatPixelId', e.target.value)}
                    className="bg-neutral-950 border border-neutral-800 text-white p-3 rounded-xl focus:border-orange-600 focus:outline-none"
                    placeholder="Snapchat Pixel ID"
                  />
                  <input
                    type="text"
                    value={product.googleAdsId || ''}
                    onChange={(e) => updateProductField(product.id, 'googleAdsId', e.target.value)}
                    className="bg-neutral-950 border border-neutral-800 text-white p-3 rounded-xl focus:border-orange-600 focus:outline-none"
                    placeholder="Google Ads ID"
                  />
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
                  {[
                    { key: 'enableCodForm' as keyof Product, label: 'نموذج COD' },
                    { key: 'enablePaymentLink' as keyof Product, label: 'رابط الدفع' },
                    { key: 'enableWhatsApp' as keyof Product, label: 'واتساب' },
                    { key: 'enableNameField' as keyof Product, label: 'الاسم' },
                    { key: 'enablePhoneField' as keyof Product, label: 'الهاتف' },
                    { key: 'enableWilayaSelect' as keyof Product, label: 'الولاية' },
                    { key: 'enableBaladiyaSelect' as keyof Product, label: 'البلدية' },
                    { key: 'enableQuantityInput' as keyof Product, label: 'الكمية' },
                    { key: 'enableHomeDelivery' as keyof Product, label: 'توصيل منزلي' },
                    { key: 'enableDeskDelivery' as keyof Product, label: 'استلام مكتب' },
                    { key: 'freeShipping' as keyof Product, label: 'شحن مجاني' },
                  ].map(({ key, label }) => (
                    <label key={key} className={`flex items-center gap-2 bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 cursor-pointer ${product[key] ? 'border-orange-600' : ''}`}>
                      <input
                        type="checkbox"
                        checked={product[key] as boolean}
                        onChange={() => toggleProductSetting(product.id, key)}
                        className="accent-orange-600 w-4 h-4"
                      />
                      <span className={`text-sm ${product[key] ? 'text-orange-500 font-semibold' : 'text-neutral-400'}`}>{label}</span>
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && config && (
          <div className="space-y-6">
            {/* Store Settings */}
            <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 space-y-4">
              <h2 className="text-lg font-bold">إعدادات المتجر</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs text-neutral-400 mb-1">اسم المتجر</label>
                  <input type="text" value={config.storeName} onChange={(e) => updateConfigField('storeName', e.target.value)} className="w-full bg-neutral-950 border border-neutral-800 text-white p-3 rounded-xl focus:border-orange-600 focus:outline-none" />
                </div>
                <div>
                  <label className="block text-xs text-neutral-400 mb-1">رقم الواتساب</label>
                  <input type="text" value={config.whatsappNumber} onChange={(e) => updateConfigField('whatsappNumber', e.target.value)} className="w-full bg-neutral-950 border border-neutral-800 text-white p-3 rounded-xl focus:border-orange-600 focus:outline-none" placeholder="213xxxxxxxxx" dir="ltr" />
                </div>
                <div>
                  <label className="block text-xs text-neutral-400 mb-1">العملة</label>
                  <input type="text" value={config.storeCurrency} onChange={(e) => updateConfigField('storeCurrency', e.target.value)} className="w-full bg-neutral-950 border border-neutral-800 text-white p-3 rounded-xl focus:border-orange-600 focus:outline-none" />
                </div>
              </div>
            </div>

            {/* Default Pixels */}
            <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 space-y-4">
              <h2 className="text-lg font-bold"> Pixles الافتراضية</h2>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-xs text-neutral-400 mb-1">Meta Pixel ID</label>
                  <input type="text" value={config.defaultMetaPixelId} onChange={(e) => updateConfigField('defaultMetaPixelId', e.target.value)} className="w-full bg-neutral-950 border border-neutral-800 text-white p-3 rounded-xl focus:border-orange-600 focus:outline-none" />
                </div>
                <div>
                  <label className="block text-xs text-neutral-400 mb-1">TikTok Pixel ID</label>
                  <input type="text" value={config.defaultTiktokPixelId} onChange={(e) => updateConfigField('defaultTiktokPixelId', e.target.value)} className="w-full bg-neutral-950 border border-neutral-800 text-white p-3 rounded-xl focus:border-orange-600 focus:outline-none" />
                </div>
                <div>
                  <label className="block text-xs text-neutral-400 mb-1">Snapchat Pixel ID</label>
                  <input type="text" value={config.defaultSnapchatPixelId} onChange={(e) => updateConfigField('defaultSnapchatPixelId', e.target.value)} className="w-full bg-neutral-950 border border-neutral-800 text-white p-3 rounded-xl focus:border-orange-600 focus:outline-none" />
                </div>
                <div>
                  <label className="block text-xs text-neutral-400 mb-1">Google Ads ID</label>
                  <input type="text" value={config.defaultGoogleAdsId} onChange={(e) => updateConfigField('defaultGoogleAdsId', e.target.value)} className="w-full bg-neutral-950 border border-neutral-800 text-white p-3 rounded-xl focus:border-orange-600 focus:outline-none" />
                </div>
              </div>
            </div>

            {/* Shopify Settings */}
            <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold">Shopify Mazzamana</h2>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={config.shopify.enabled} onChange={(e) => updateConfigField('shopify.enabled', e.target.checked)} className="accent-orange-600 w-4 h-4" />
                  <span className={`text-sm font-semibold ${config.shopify.enabled ? 'text-green-400' : 'text-neutral-500'}`}>{config.shopify.enabled ? 'مفعّل' : 'معطّل'}</span>
                </label>
              </div>
              {config.shopify.enabled && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs text-neutral-400 mb-1">Shop Domain</label>
                    <input type="text" value={config.shopify.shopDomain} onChange={(e) => updateConfigField('shopify.shopDomain', e.target.value)} className="w-full bg-neutral-950 border border-neutral-800 text-white p-3 rounded-xl focus:border-orange-600 focus:outline-none" placeholder="your-store.myshopify.com" />
                  </div>
                  <div>
                    <label className="block text-xs text-neutral-400 mb-1">Access Token</label>
                    <input type="password" value={config.shopify.accessToken} onChange={(e) => updateConfigField('shopify.accessToken', e.target.value)} className="w-full bg-neutral-950 border border-neutral-800 text-white p-3 rounded-xl focus:border-orange-600 focus:outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs text-neutral-400 mb-1">Webhook Secret</label>
                    <input type="password" value={config.shopify.webhookSecret} onChange={(e) => updateConfigField('shopify.webhookSecret', e.target.value)} className="w-full bg-neutral-950 border border-neutral-800 text-white p-3 rounded-xl focus:border-orange-600 focus:outline-none" />
                  </div>
                </div>
              )}
              <div className="bg-neutral-950 border border-neutral-800 rounded-xl p-4 text-xs text-neutral-400 space-y-1">
                <p className="font-bold text-neutral-300">Webhook URLs (لإعدادها في Shopify Admin):</p>
                <p dir="ltr">Orders: <code className="text-orange-400">{typeof window !== 'undefined' ? window.location.origin : ''}/api/webhooks/shopify</code></p>
                <p dir="ltr">Topic: <code className="text-orange-400">orders/create, products/update, products/create, products/delete</code></p>
              </div>
            </div>

            {/* WooCommerce Settings */}
            <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold">WooCommerce Mazzamana</h2>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={config.woocommerce.enabled} onChange={(e) => updateConfigField('woocommerce.enabled', e.target.checked)} className="accent-orange-600 w-4 h-4" />
                  <span className={`text-sm font-semibold ${config.woocommerce.enabled ? 'text-green-400' : 'text-neutral-500'}`}>{config.woocommerce.enabled ? 'مفعّل' : 'معطّل'}</span>
                </label>
              </div>
              {config.woocommerce.enabled && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-xs text-neutral-400 mb-1">Site URL</label>
                    <input type="text" value={config.woocommerce.siteUrl} onChange={(e) => updateConfigField('woocommerce.siteUrl', e.target.value)} className="w-full bg-neutral-950 border border-neutral-800 text-white p-3 rounded-xl focus:border-orange-600 focus:outline-none" placeholder="https://your-store.com" />
                  </div>
                  <div>
                    <label className="block text-xs text-neutral-400 mb-1">Consumer Key</label>
                    <input type="password" value={config.woocommerce.consumerKey} onChange={(e) => updateConfigField('woocommerce.consumerKey', e.target.value)} className="w-full bg-neutral-950 border border-neutral-800 text-white p-3 rounded-xl focus:border-orange-600 focus:outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs text-neutral-400 mb-1">Consumer Secret</label>
                    <input type="password" value={config.woocommerce.consumerSecret} onChange={(e) => updateConfigField('woocommerce.consumerSecret', e.target.value)} className="w-full bg-neutral-950 border border-neutral-800 text-white p-3 rounded-xl focus:border-orange-600 focus:outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs text-neutral-400 mb-1">Webhook Secret</label>
                    <input type="password" value={config.woocommerce.webhookSecret} onChange={(e) => updateConfigField('woocommerce.webhookSecret', e.target.value)} className="w-full bg-neutral-950 border border-neutral-800 text-white p-3 rounded-xl focus:border-orange-600 focus:outline-none" />
                  </div>
                </div>
              )}
              <div className="bg-neutral-950 border border-neutral-800 rounded-xl p-4 text-xs text-neutral-400 space-y-1">
                <p className="font-bold text-neutral-300">Webhook URLs (لإعدادها في WooCommerce Settings &gt; Advanced &gt; Webhooks):</p>
                <p dir="ltr">Orders: <code className="text-orange-400">{typeof window !== 'undefined' ? window.location.origin : ''}/api/webhooks/woocommerce</code></p>
                <p dir="ltr">Topic: <code className="text-orange-400">order.created, product.updated, product.created, product.deleted</code></p>
              </div>
            </div>

            <button onClick={saveConfig} className="bg-orange-600 hover:bg-orange-500 text-white px-8 py-3 rounded-xl font-bold transition-all">
              حفظ الإعدادات
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function KPICard({ title, value }: { title: string; value: string }) {
  return (
    <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6">
      <p className="text-neutral-400 text-sm mb-1">{title}</p>
      <p className="text-2xl font-bold text-white">{value}</p>
    </div>
  );
}
