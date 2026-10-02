import { createClient } from '@/lib/supabase/client';
import { Category } from '@/lib/types';
import { mockCategories } from '@/lib/mock-data';

export async function getCategories(): Promise<Category[]> {
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('is_active', true)
      .order('name');

    if (error || !data || data.length === 0) {
      return mockCategories;
    }

    return data as Category[];
  } catch (err) {
    console.warn('Supabase getCategories error, using fallback:', err);
    return mockCategories;
  }
}

export async function getAllAdminCategories(): Promise<Category[]> {
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('created_at', { ascending: false });

    if (error || !data || data.length === 0) {
      return mockCategories;
    }

    return data as Category[];
  } catch (err) {
    console.warn('Supabase getAllAdminCategories error:', err);
    return mockCategories;
  }
}

export async function saveCategoryToDb(category: Partial<Category>): Promise<{ success: boolean; data?: Category; error?: string }> {
  try {
    const supabase = createClient();
    const catId = category.id || `cat-${Date.now()}`;

    const { data, error } = await supabase
      .from('categories')
      .upsert({
        id: catId,
        name: category.name,
        slug: category.slug,
        description: category.description,
        image_url: category.image_url,
        is_active: category.is_active ?? true,
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, data: data as Category };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function deleteCategoryFromDb(id: string): Promise<boolean> {
  try {
    const supabase = createClient();
    const { error } = await supabase.from('categories').delete().eq('id', id);
    if (error) {
      console.error('deleteCategoryFromDb error:', error);
      return false;
    }
    return true;
  } catch (err) {
    console.error('deleteCategoryFromDb error:', err);
    return false;
  }
}
