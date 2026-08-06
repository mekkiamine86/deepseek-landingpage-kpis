import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import { Order } from '@/types/product';

const ORDERS_FILE_PATH = path.join(process.cwd(), 'src', 'data', 'orders.json');

async function readOrders(): Promise<Order[]> {
  try {
    const data = await fs.readFile(ORDERS_FILE_PATH, 'utf-8');
    return JSON.parse(data) as Order[];
  } catch {
    return [];
  }
}

async function writeOrders(orders: Order[]): Promise<void> {
  await fs.writeFile(ORDERS_FILE_PATH, JSON.stringify(orders, null, 2), 'utf-8');
}

export async function GET() {
  try {
    const orders = await readOrders();
    return NextResponse.json(orders);
  } catch (error) {
    console.error('Orders read error:', error);
    return NextResponse.json({ error: 'فشل في قراءة الطلبات' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const requiredFields = ['productSlug', 'name', 'phone', 'wilaya', 'baladiya', 'quantity', 'total'];
    for (const field of requiredFields) {
      if (body[field] === undefined || body[field] === null) {
        return NextResponse.json({ error: `حقل مفقود: ${field}` }, { status: 400 });
      }
    }

    const newOrder: Order = {
      id: `ORD-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      productSlug: body.productSlug,
      name: body.name,
      phone: body.phone,
      wilaya: body.wilaya,
      baladiya: body.baladiya,
      quantity: Number(body.quantity),
      size: body.selectedSize || undefined,
      color: body.selectedColor || undefined,
      total: Number(body.total),
      status: 'pending',
      date: new Date().toISOString(),
    };

    const orders = await readOrders();
    orders.push(newOrder);
    await writeOrders(orders);

    return NextResponse.json({ success: true, order: newOrder }, { status: 201 });
  } catch (error) {
    console.error('Order creation error:', error);
    return NextResponse.json({ error: 'فشل في معالجة الطلب' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, status } = body as { id: string; status: string };

    if (!id || !status) {
      return NextResponse.json({ error: 'حقل مفقود: id أو status' }, { status: 400 });
    }

    const validStatuses = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: 'حالة غير صالحة' }, { status: 400 });
    }

    const orders = await readOrders();
    const index = orders.findIndex((o) => o.id === id);
    if (index === -1) {
      return NextResponse.json({ error: 'الطلب غير موجود' }, { status: 404 });
    }

    orders[index].status = status as Order['status'];
    await writeOrders(orders);

    return NextResponse.json({ success: true, order: orders[index] });
  } catch (error) {
    console.error('Order update error:', error);
    return NextResponse.json({ error: 'فشل في تحديث الطلب' }, { status: 500 });
  }
}
