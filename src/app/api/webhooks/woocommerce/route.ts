import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import crypto from 'crypto';
import { Product, Order } from '@/types/product';

const PRODUCTS_PATH = path.join(process.cwd(), 'src', 'data', 'products.json');
const ORDERS_PATH = path.join(process.cwd(), 'src', 'data', 'orders.json');

function verifyWooSignature(body: string, signatureHeader: string, secret: string): boolean {
  const hash = crypto.createHmac('sha256', secret).update(body, 'utf8').digest('base64');
  return hash === signatureHeader;
}

async function readJson<T>(filePath: string): Promise<T[]> {
  try {
    const data = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(data) as T[];
  } catch {
    return [];
  }
}

async function writeJson<T>(filePath: string, data: T[]): Promise<void> {
  await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf-8');
}

export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.text();
    const topic = request.headers.get('x-wc-webhook-topic') || '';
    const signatureHeader = request.headers.get('x-wc-webhook-signature') || '';

    const configData = await readJson<{ woocommerce?: { webhookSecret?: string } }>(
      path.join(process.cwd(), 'src', 'data', 'config.json')
    );
    const webhookSecret = configData[0]?.woocommerce?.webhookSecret || '';

    if (webhookSecret && !verifyWooSignature(rawBody, signatureHeader, webhookSecret)) {
      return NextResponse.json({ error: 'Invalid webhook signature' }, { status: 401 });
    }

    const payload = JSON.parse(rawBody);

    if (topic === 'order.created') {
      const orders = await readJson<Order>(ORDERS_PATH);
      const newOrder: Order = {
        id: `ORD-WC-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        productSlug: payload.line_items?.[0]?.sku || payload.line_items?.[0]?.name || 'unknown',
        name: `${payload.billing?.first_name || ''} ${payload.billing?.last_name || ''}`.trim() || 'WooCommerce Customer',
        phone: payload.billing?.phone || payload.shipping?.phone || 'N/A',
        wilaya: payload.shipping?.state || payload.billing?.state || 'N/A',
        baladiya: payload.shipping?.city || payload.billing?.city || 'N/A',
        quantity: payload.line_items?.reduce((sum: number, item: { quantity: number }) => sum + item.quantity, 0) || 1,
        total: Number(payload.total) || 0,
        status: 'pending',
        date: new Date().toISOString(),
      };
      orders.push(newOrder);
      await writeJson(ORDERS_PATH, orders);
      return NextResponse.json({ success: true, orderId: newOrder.id });
    }

    if (topic === 'product.updated' || topic === 'product.created') {
      const products = await readJson<Product>(PRODUCTS_PATH);
      const existingIndex = products.findIndex((p) => p.id === String(payload.id));

      const mappedProduct: Product = {
        id: String(payload.id),
        title: payload.name || 'Untitled',
        slug: (payload.slug || payload.name || 'untitled').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
        description: payload.short_description?.replace(/<[^>]*>/g, '').substring(0, 500) || '',
        price: Number(payload.price) || 0,
        compareAtPrice: Number(payload.regular_price) > Number(payload.price) ? Number(payload.regular_price) : null,
        stockCount: Number(payload.stock_quantity) || 0,
        type: 'physical',
        pixelEventMode: 'purchase',
        enableCodForm: true,
        enablePaymentLink: false,
        enableWhatsApp: true,
        enableNameField: true,
        enablePhoneField: true,
        enableWilayaSelect: true,
        enableBaladiyaSelect: true,
        enableQuantityInput: true,
        enableHomeDelivery: true,
        enableDeskDelivery: true,
        freeShipping: false,
        sizes: [],
        colors: [],
      };

      if (existingIndex >= 0) {
        products[existingIndex] = { ...products[existingIndex], ...mappedProduct };
      } else {
        products.push(mappedProduct);
      }

      await writeJson(PRODUCTS_PATH, products);
      return NextResponse.json({ success: true, action: existingIndex >= 0 ? 'updated' : 'created' });
    }

    if (topic === 'product.deleted') {
      const products = await readJson<Product>(PRODUCTS_PATH);
      const filtered = products.filter((p) => p.id !== String(payload.id));
      await writeJson(PRODUCTS_PATH, filtered);
      return NextResponse.json({ success: true, action: 'deleted' });
    }

    return NextResponse.json({ success: true, topic, message: 'Event received but not processed' });
  } catch (error) {
    console.error('WooCommerce webhook error:', error);
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
}
