import { createClient } from '@supabase/supabase-js';
import type { User } from '@supabase/supabase-js';
import { Category, Product, DistributorConfig } from './types';

const SUPABASE_URL = 'https://aavyisvsmxpqheecskly.supabase.co';
const SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFhdnlpc3ZzbXhwcWhlZWNza2x5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTMxMzkxOTcsImV4cCI6MjEwODcxNTE5N30.j2TZb3NXCazvEK-hLwBhKaw1E8pI7j5kJeSuDCLw4yA';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export type { User };

// ─── Mapeamento snake_case (Supabase) ↔ camelCase (App) ──────────────────────

function toDistributorConfig(row: Record<string, unknown>): DistributorConfig {
  return {
    name: (row.name as string) || '',
    slogan: (row.slogan as string) || '',
    phone: (row.phone as string) || '',
    whatsappNumber: (row.whatsapp_number as string) || '',
    pixKey: (row.pix_key as string) || '',
    pixType: (row.pix_type as string) || '',
    addressInfo: (row.address_info as string) || '',
    openingHours: (row.opening_hours as string) || undefined,
    openingHoursWeekdays: (row.opening_hours_weekdays as string) || undefined,
    openingHoursSaturday: (row.opening_hours_saturday as string) || undefined,
    openingHoursSundayHolidays: (row.opening_hours_sunday_holidays as string) || undefined,
    bannerImage: (row.banner_image as string) || '',
    bannerZoom: (row.banner_zoom as number) ?? 100,
    logoImage: (row.logo_image as string) || '',
    logoZoom: (row.logo_zoom as number) ?? 100,
    brandNameImage: (row.brand_name_image as string) || '',
    brandNameZoom: (row.brand_name_zoom as number) ?? 100,
    footerYear: (row.footer_year as string) || '',
  };
}

function toCategory(row: Record<string, unknown>): Category {
  return {
    id: row.id as string,
    name: row.name as string,
    description: (row.description as string) || undefined,
    imageUrl: (row.image_url as string) || '',
    imageZoom: (row.image_zoom as number) ?? 100,
    isActive: (row.is_active as boolean) ?? true,
    orderIndex: (row.order_index as number) ?? 9999,
  };
}

function toProduct(row: Record<string, unknown>): Product {
  return {
    id: row.id as string,
    name: row.name as string,
    shortDescription: (row.short_description as string) || '',
    price: (row.price as number) || 0,
    originalPrice: row.original_price != null ? (row.original_price as number) : undefined,
    categoryId: (row.category_id as string) || undefined,
    category: (row.category as string) || undefined,
    weightOrVolume: (row.weight_or_volume as string) || undefined,
    badge: (row.badge as string) || undefined,
    imageUrl: (row.image_url as string) || undefined,
    imageZoom: row.image_zoom != null ? (row.image_zoom as number) : undefined,
    isActive: (row.is_active as boolean) ?? true,
    orderIndex: (row.order_index as number) ?? 9999,
  };
}

// ─── Teste de conexão ─────────────────────────────────────────────────────────

export async function testSupabaseConnection(): Promise<void> {
  try {
    const { error } = await supabase.from('distributor_settings').select('id').limit(1);
    if (error) {
      console.warn('Supabase: falha ao verificar conexão.', error.message);
    }
  } catch (err) {
    console.warn('Supabase: cliente offline.', err);
  }
}

// ─── Configurações da distribuidora ──────────────────────────────────────────

export function subscribeToDistributorConfig(
  onData: (config: DistributorConfig | null) => void,
  onError?: (err: unknown) => void
): () => void {
  const fetchData = async () => {
    try {
      const { data, error } = await supabase
        .from('distributor_settings')
        .select('*')
        .eq('id', 'main')
        .single();

      // PGRST116 = "no rows" – é normal quando o registro ainda não existe
      if (error && error.code !== 'PGRST116') {
        onError?.(error);
        return;
      }
      onData(data ? toDistributorConfig(data as Record<string, unknown>) : null);
    } catch (err) {
      onError?.(err);
    }
  };

  fetchData();

  const channel = supabase
    .channel('distributor-settings-changes')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'distributor_settings' }, fetchData)
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}

// ─── Categorias ───────────────────────────────────────────────────────────────

export function subscribeToCategories(
  onData: (categories: Category[]) => void,
  onError?: (err: unknown) => void
): () => void {
  const fetchData = async () => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('order_index', { ascending: true })
        .order('name', { ascending: true });

      if (error) {
        onError?.(error);
        return;
      }
      onData((data || []).map((row) => toCategory(row as Record<string, unknown>)));
    } catch (err) {
      onError?.(err);
    }
  };

  fetchData();

  const channel = supabase
    .channel('categories-changes')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'categories' }, fetchData)
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}

// ─── Produtos ─────────────────────────────────────────────────────────────────

export function subscribeToProducts(
  onData: (products: Product[]) => void,
  onError?: (err: unknown) => void
): () => void {
  const fetchData = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('order_index', { ascending: true })
        .order('name', { ascending: true });

      if (error) {
        onError?.(error);
        return;
      }
      onData((data || []).map((row) => toProduct(row as Record<string, unknown>)));
    } catch (err) {
      onError?.(err);
    }
  };

  fetchData();

  const channel = supabase
    .channel('products-changes')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'products' }, fetchData)
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}

// ─── Operações de escrita ─────────────────────────────────────────────────────

export async function saveDistributorConfigToCloud(config: DistributorConfig): Promise<void> {
  const { error } = await supabase.from('distributor_settings').upsert({
    id: 'main',
    name: config.name || '',
    slogan: config.slogan || '',
    phone: config.phone || '',
    whatsapp_number: config.whatsappNumber || '',
    pix_key: config.pixKey || '',
    pix_type: config.pixType || '',
    address_info: config.addressInfo || '',
    opening_hours: config.openingHours || '',
    opening_hours_weekdays: config.openingHoursWeekdays || '',
    opening_hours_saturday: config.openingHoursSaturday || '',
    opening_hours_sunday_holidays: config.openingHoursSundayHolidays || '',
    banner_image: config.bannerImage || '',
    banner_zoom: config.bannerZoom ?? 100,
    logo_image: config.logoImage || '',
    logo_zoom: config.logoZoom ?? 100,
    brand_name_image: config.brandNameImage || '',
    brand_name_zoom: config.brandNameZoom ?? 100,
    footer_year: config.footerYear || '',
    updated_at: new Date().toISOString(),
  });

  if (error) throw error;
}

export async function syncCategoriesToCloud(categories: Category[]): Promise<void> {
  const newIds = categories.map((c) => c.id);

  // Buscar IDs já existentes no banco
  const { data: existing } = await supabase.from('categories').select('id');
  const existingIds = (existing || []).map((r) => r.id as string);
  const toDelete = existingIds.filter((id) => !newIds.includes(id));

  // Remover categorias excluídas
  if (toDelete.length > 0) {
    const { error } = await supabase.from('categories').delete().in('id', toDelete);
    if (error) throw error;
  }

  // Upsert das categorias atuais
  if (categories.length > 0) {
    const rows = categories.map((cat, index) => ({
      id: cat.id,
      name: cat.name,
      description: cat.description || '',
      image_url: cat.imageUrl || '',
      image_zoom: cat.imageZoom ?? 100,
      is_active: cat.isActive ?? true,
      order_index: index,
      updated_at: new Date().toISOString(),
    }));
    const { error } = await supabase.from('categories').upsert(rows);
    if (error) throw error;
  }
}

export async function syncProductsToCloud(products: Product[]): Promise<void> {
  const newIds = products.map((p) => p.id);

  // Buscar IDs já existentes no banco
  const { data: existing } = await supabase.from('products').select('id');
  const existingIds = (existing || []).map((r) => r.id as string);
  const toDelete = existingIds.filter((id) => !newIds.includes(id));

  // Remover produtos excluídos
  if (toDelete.length > 0) {
    const { error } = await supabase.from('products').delete().in('id', toDelete);
    if (error) throw error;
  }

  // Upsert dos produtos atuais
  if (products.length > 0) {
    const rows = products.map((prod, index) => ({
      id: prod.id,
      name: prod.name,
      short_description: prod.shortDescription || '',
      price: Number(prod.price) || 0,
      original_price: prod.originalPrice != null ? Number(prod.originalPrice) : null,
      category_id: prod.categoryId || null,
      category: prod.category || '',
      weight_or_volume: prod.weightOrVolume || '',
      badge: prod.badge || '',
      image_url: prod.imageUrl || '',
      image_zoom: prod.imageZoom ?? 100,
      is_active: prod.isActive ?? true,
      order_index: index,
      updated_at: new Date().toISOString(),
    }));
    const { error } = await supabase.from('products').upsert(rows);
    if (error) throw error;
  }
}

export async function clearCloudData(): Promise<void> {
  await supabase.from('products').delete().neq('id', '');
  await supabase.from('categories').delete().neq('id', '');
  await supabase.from('distributor_settings').upsert({
    id: 'main',
    name: '',
    slogan: '',
    phone: '',
    whatsapp_number: '',
    pix_key: '',
    pix_type: '',
    address_info: '',
    opening_hours: '',
    opening_hours_weekdays: '',
    opening_hours_saturday: '',
    opening_hours_sunday_holidays: '',
    banner_image: '',
    banner_zoom: 100,
    logo_image: '',
    logo_zoom: 100,
    brand_name_image: '',
    brand_name_zoom: 100,
    footer_year: '',
    updated_at: new Date().toISOString(),
  });
}

// ─── Autenticação ─────────────────────────────────────────────────────────────

export async function loginWithSupabase(email: string, password: string) {
  return supabase.auth.signInWithPassword({ email, password });
}

export async function logoutSupabase(): Promise<void> {
  await supabase.auth.signOut();
}

export function onSupabaseAuthStateChange(callback: (user: User | null) => void): () => void {
  const {
    data: { subscription },
  } = supabase.auth.onAuthStateChange((_event, session) => {
    callback(session?.user ?? null);
  });
  return () => subscription.unsubscribe();
}

