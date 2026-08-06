import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import { Product } from '@/types/product';

const PRODUCTS_FILE_PATH = path.join(process.cwd(), 'src', 'data', 'products.json');

async function readProducts(): Promise<Product[]> {
  const data = await fs.readFile(PRODUCTS_FILE_PATH, 'utf-8');
  return JSON.parse(data) as Product[];
}

async function writeProducts(products: Product[]): Promise<void> {
  await fs.writeFile(PRODUCTS_FILE_PATH, JSON.stringify(products, null, 2), 'utf-8');
}

export async function GET() {
  try {
    const products = await readProducts();
    return NextResponse.json(products);
  } catch (error) {
    console.error('Products read error:', error);
    return NextResponse.json({ error: 'فشل في قراءة المنتجات' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, updates } = body as { id: string; updates: Partial<Product> };

    if (!id || !updates) {
      return NextResponse.json({ error: 'حقل مفقود' }, { status: 400 });
    }

    const products = await readProducts();
    const index = products.findIndex((p) => p.id === id);
    if (index === -1) {
      return NextResponse.json({ error: 'المنتج غير موجود' }, { status: 404 });
    }

    products[index] = { ...products[index], ...updates };
    await writeProducts(products);

    return NextResponse.json({ success: true, product: products[index] });
  } catch (error) {
    console.error('Product update error:', error);
    return NextResponse.json({ error: 'فشل في تحديث المنتج' }, { status: 500 });
  }
}
