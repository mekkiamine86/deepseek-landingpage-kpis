import { NextResponse } from 'next/server';
import { ALGERIA_SHIPPING_MATRIX } from '@/data/algeriaShippingMatrix';

export const revalidate = 86400;

export async function GET() {
  try {
    return NextResponse.json(ALGERIA_SHIPPING_MATRIX);
  } catch (error) {
    console.error('Wilayas read error:', error);
    return NextResponse.json({ error: 'فشل في قراءة بيانات الولايات' }, { status: 500 });
  }
}
