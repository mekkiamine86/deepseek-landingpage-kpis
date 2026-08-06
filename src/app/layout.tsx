import './globals.css';
import type { Metadata } from 'next';
import { gretaArabic } from './fonts';

export const metadata: Metadata = {
  metadataBase: new URL('https://www.matjaroq.com'),
  title: 'كيف لا يُغلق مطعمك؟ — الدليل العملي للسوق السعودي',
  description: 'دليل عملي لأصحاب المطاعم والمقاهي في السعودية: الأنظمة المالية والتشغيلية التي تحمي مشروعك من الانهيار وتحوّل أرقامك إلى أرباح مستدامة.',
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    title: 'كيف لا يُغلق مطعمك؟ — الدليل العملي للسوق السعودي',
    description: 'أصول تشغيلية لأصحاب المطاعم: مصفوفة الفحص المالي، إدارة التدفقات النقدية، وضبط التكاليف في السوق السعودي.',
    type: 'website',
    locale: 'ar_SA',
    siteName: 'كيف لا يُغلق مطعمك؟',
    images: [{ url: '/images/cover.webp', width: 640, height: 1137, alt: 'غلاف كتاب كيف لا يُغلق مطعمك' }],
  },
};

const schema = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Book',
      '@id': '#book',
      name: 'كيف لا يُغلق مطعمك؟ أسرار الاستمرار والنمو وضبط التكاليف في السوق السعودي',
      alternateName: 'كيف لا يُغلق مطعمك؟',
      inLanguage: 'ar-SA',
      bookFormat: 'https://schema.org/EBook',
      genre: 'إدارة مطاعم',
      description:
        'دليل عملي شامل لأصحاب المطاعم والمقاهي في السعودية: دراسة الجدوى، التراخيص، هندسة المنيو، الكادر البشري، التسويق، وبروتوكول التدقيق المالي الأسبوعي.',
      image: '/images/cover.webp',
      numberOfPages: 200,
      isAccessibleForFree: false,
      author: {
        '@type': 'Organization',
        name: 'الدليل السعودي العملي للمطاعم',
      },
      publisher: {
        '@type': 'Organization',
        name: 'كيف لا يُغلق مطعمك',
      },
      offers: {
        '@type': 'Offer',
        url: 'https://whop.com/checkout/plan_7cJ0OBbJRxlYA',
        price: '90',
        priceCurrency: 'USD',
        priceValidUntil: '2026-12-31',
        availability: 'https://schema.org/InStock',
        itemCondition: 'https://schema.org/NewCondition',
      },
    },
    {
      '@type': 'Product',
      name: 'كيف لا يُغلق مطعمك؟ — الدليل العملي للسوق السعودي',
      description:
        'حزمة الأصول التشغيلية لأصحاب المطاعم في السعودية: الدليل الشامل (8 فصول) + 3 أنظمة إكسيل احترافية.',
      image: '/images/cover.webp',
      brand: { '@type': 'Brand', name: 'كيف لا يُغلق مطعمك' },
      offers: {
        '@type': 'Offer',
        url: 'https://whop.com/checkout/plan_7cJ0OBbJRxlYA',
        price: '90',
        priceCurrency: 'USD',
        availability: 'https://schema.org/InStock',
      },
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: '4.9',
        reviewCount: '120',
      },
    },
    {
      '@type': 'FAQPage',
      '@id': '#faq',
      mainEntity: [
        {
          '@type': 'Question',
          name: 'كيف أحصل على الكتاب بعد الدفع؟',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'بعد إتمام الدفع عبر Whop ستحصل فوراً على رابط تحميل الكتاب بصيغة PDF، ويمكنك قراءته على أي جهاز: هاتف، حاسوب، أو جهاز لوحي.',
          },
        },
        {
          '@type': 'Question',
          name: 'هل المحتوى مخصص للسوق السعودي؟',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'نعم، الكتاب مبني على واقع السوق السعودي: التراخيص، الاشتراطات البلدية، سلوك الزبائن، والتسعير في مدن المملكة.',
          },
        },
        {
          '@type': 'Question',
          name: 'هل الكتاب مناسب لمن يخطط للفتح لأول مرة؟',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'تماماً. الفصول الأولى تغطي دراسة الجدوى والمتطلبات القانونية خطوة بخطوة لتجنب أخطر أخطاء المبتدئين.',
          },
        },
        {
          '@type': 'Question',
          name: 'هل يمكنني القراءة على الهاتف؟',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'نعم، نسخة PDF عالية الجودة متوافقة مع كافة الأجهزة، بالإضافة إلى نسخة إلكترونية سهلة التصفح.',
          },
        },
      ],
    },
    {
      '@type': 'WebPage',
      name: 'كيف لا يُغلق مطعمك؟ — الدليل العملي للسوق السعودي',
      url: '/',
      inLanguage: 'ar-SA',
      isPartOf: { '@id': '#book' },
    },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ar" dir="rtl" className={gretaArabic.variable}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      </head>
      <body className="bg-[#001a0b] text-white min-h-screen">
        <link
          rel="preconnect"
          href="https://js.whop.com"
          crossOrigin="anonymous"
        />
        <link
          rel="preconnect"
          href="https://whop.com"
          crossOrigin="anonymous"
        />
        {children}
      </body>
    </html>
  );
}
