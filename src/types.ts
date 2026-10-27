export interface Category {
  id: string;
  name: string;
  description?: string;
  imageUrl: string;
  imageZoom?: number;
  isActive?: boolean;
  orderIndex?: number;
  updatedAt?: string;
}

export interface Product {
  id: string;
  name: string;
  shortDescription: string;
  price: number;
  originalPrice?: number;
  categoryId?: string;
  category?: string;
  weightOrVolume?: string;
  badge?: string;
  imageUrl?: string;
  imageZoom?: number;
  isActive?: boolean;
  orderIndex?: number;
  updatedAt?: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export type AppView = 'catalog' | 'cart' | 'success';

export interface DistributorConfig {
  name: string;
  slogan: string;
  phone: string;
  whatsappNumber: string;
  pixKey: string;
  pixType: string;
  addressInfo: string;
  openingHours?: string;
  openingHoursWeekdays?: string;
  openingHoursSaturday?: string;
  openingHoursSundayHolidays?: string;
  bannerImage?: string;
  bannerZoom?: number;
  logoImage?: string;
  logoZoom?: number;
  brandNameImage?: string;
  brandNameZoom?: number;
  footerYear?: string;
  updatedAt?: string;
}
