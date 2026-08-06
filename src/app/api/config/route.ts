import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

const CONFIG_PATH = path.join(process.cwd(), 'src', 'data', 'config.json');

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

const DEFAULT_CONFIG: StoreConfig = {
  shopify: { enabled: false, shopDomain: '', accessToken: '', webhookSecret: '' },
  woocommerce: { enabled: false, siteUrl: '', consumerKey: '', consumerSecret: '', webhookSecret: '' },
  storeName: 'متجري',
  storeCurrency: 'DZD',
  whatsappNumber: '',
  defaultMetaPixelId: '',
  defaultTiktokPixelId: '',
  defaultSnapchatPixelId: '',
  defaultGoogleAdsId: '',
};

async function readConfig(): Promise<StoreConfig> {
  try {
    const data = await fs.readFile(CONFIG_PATH, 'utf-8');
    return { ...DEFAULT_CONFIG, ...JSON.parse(data) };
  } catch {
    return DEFAULT_CONFIG;
  }
}

async function writeConfig(config: StoreConfig): Promise<void> {
  await fs.writeFile(CONFIG_PATH, JSON.stringify(config, null, 2), 'utf-8');
}

export async function GET() {
  try {
    const config = await readConfig();
    return NextResponse.json(config);
  } catch (error) {
    console.error('Config read error:', error);
    return NextResponse.json({ error: 'فشل في قراءة الإعدادات' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const current = await readConfig();
    const updated = { ...current, ...body };
    await writeConfig(updated);
    return NextResponse.json({ success: true, config: updated });
  } catch (error) {
    console.error('Config update error:', error);
    return NextResponse.json({ error: 'فشل في حفظ الإعدادات' }, { status: 500 });
  }
}
