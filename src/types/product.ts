// src/types/product.ts

export type ProductType = 'physical' | 'digital';
export type PixelEventMode = 'lead' | 'purchase';
export type OrderStatus = 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';

export interface ProductVariant {
  name: string;
  hex?: string;
}

export interface Product {
  id: string;
  title: string;
  slug: string;
  description: string;
  imageUrl?: string;
  bookImageUrl?: string;
  bookVideoUrl?: string;
  price: number; // DZD
  compareAtPrice?: number | null;
  stockCount: number;
  type: ProductType;
  paymentUrl?: string;
  whopPlanId?: string;
  subtitle?: string;
  pixelEventMode: PixelEventMode;
  metaPixelId?: string | null;
  tiktokPixelId?: string | null;
  snapchatPixelId?: string | null;
  googleAdsId?: string | null;
  sizes?: string[];
  colors?: ProductVariant[];
  enableCodForm: boolean;
  enablePaymentLink: boolean;
  enableWhatsApp: boolean;
  enableNameField: boolean;
  enablePhoneField: boolean;
  enableWilayaSelect: boolean;
  enableBaladiyaSelect: boolean;
  enableQuantityInput: boolean;
  enableHomeDelivery: boolean;
  enableDeskDelivery: boolean;
  freeShipping: boolean;
}

export interface WilayaData {
  code: string;
  name: string;
  homeDeliveryPrice: number; // DZD
  deskDeliveryPrice: number; // DZD
  baladiyas: string[];
}

export interface Order {
  id: string;
  productSlug: string;
  name: string;
  phone: string;
  wilaya: string;
  baladiya: string;
  quantity: number;
  size?: string;
  color?: string;
  total: number; // DZD
  status: OrderStatus;
  date: string; // ISO string
}