import { notFound } from 'next/navigation';
import { Product } from '@/types/product';
import productsData from '@/data/products.json';
import ProductPageClient from './ProductPageClient';

const products = productsData as unknown as Product[];

export const revalidate = 30;

export async function generateStaticParams() {
  return products.map((p) => ({ productSlug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ productSlug: string }> }) {
  const { productSlug } = await params;
  const product = products.find((p) => p.slug === productSlug);
  if (!product) return { title: 'المنتج غير موجود' };
  return {
    title: product.title,
    description: product.description,
    openGraph: {
      title: product.title,
      description: product.description,
      type: 'website',
      ...(product.imageUrl ? { images: [{ url: product.imageUrl }] } : {}),
    },
  };
}

export default async function ProductPage({ params }: { params: Promise<{ productSlug: string }> }) {
  const { productSlug } = await params;
  const product = products.find((p) => p.slug === productSlug);
  if (!product) notFound();
  return <ProductPageClient product={product} />;
}
