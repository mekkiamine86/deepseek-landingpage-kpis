import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import { Order } from '@/types/product';

const ORDERS_PATH = path.join(process.cwd(), 'src', 'data', 'orders.json');

async function readOrders(): Promise<Order[]> {
  try {
    const data = await fs.readFile(ORDERS_PATH, 'utf-8');
    return JSON.parse(data) as Order[];
  } catch {
    return [];
  }
}

export async function GET(request: NextRequest) {
  try {
    const format = request.nextUrl.searchParams.get('format') || 'csv';
    const orders = await readOrders();

    if (format === 'csv') {
      const header = 'ID,Product,Name,Phone,Wilaya,Baladiya,Quantity,Size,Color,Total,Status,Date';
      const rows = orders.map(
        (o) => `${o.id},${o.productSlug},${o.name},${o.phone},${o.wilaya},${o.baladiya},${o.quantity},${o.size || ''},${o.color || ''},${o.total},${o.status},${o.date}`
      );
      const csv = [header, ...rows].join('\n');
      return new NextResponse(csv, {
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': 'attachment; filename=orders.csv',
        },
      });
    }

    if (format === 'json') {
      return new NextResponse(JSON.stringify(orders, null, 2), {
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
          'Content-Disposition': 'attachment; filename=orders.json',
        },
      });
    }

    if (format === 'xlsx') {
      const lines: string[] = [];
      lines.push('ID,Product,Name,Phone,Wilaya,Baladiya,Quantity,Size,Color,Total,Status,Date');
      for (const o of orders) {
        lines.push(`${o.id},${o.productSlug},${o.name},${o.phone},${o.wilaya},${o.baladiya},${o.quantity},${o.size || ''},${o.color || ''},${o.total},${o.status},${o.date}`);
      }
      const xmlContent = `<?xml version="1.0" encoding="UTF-8"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">
 <Worksheet ss:Name="Orders">
  <Table>
   ${lines.map((line) => `<Row>${line.split(',').map((cell) => `<Cell><Data ss:Type="String">${cell}</Data></Cell>`).join('')}</Row>`).join('\n   ')}
  </Table>
 </Worksheet>
</Workbook>`;
      return new NextResponse(xmlContent, {
        headers: {
          'Content-Type': 'application/vnd.ms-excel',
          'Content-Disposition': 'attachment; filename=orders.xls',
        },
      });
    }

    return NextResponse.json({ error: 'Format not supported. Use csv, json, or xlsx.' }, { status: 400 });
  } catch (error) {
    console.error('Export error:', error);
    return NextResponse.json({ error: 'Export failed' }, { status: 500 });
  }
}
