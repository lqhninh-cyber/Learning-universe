import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { env } from '@/shared/config/env';

function createSupabaseClient(): SupabaseClient | null {
  if (!env.isSupabaseConfigured || !env.supabaseUrl || !env.supabaseAnonKey) {
    if (import.meta.env.DEV && import.meta.env.MODE !== 'test') {
      console.warn(
        '[Learning Universe] Chưa cấu hình Supabase (VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY). Ứng dụng đang chạy ở chế độ chỉ đọc dành cho khách.',
      );
    }
    return null;
  }

  return createClient(env.supabaseUrl, env.supabaseAnonKey, {
    auth: {
      flowType: 'pkce',
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  });
}

export const supabase: SupabaseClient | null = createSupabaseClient();
export const isSupabaseConfigured: boolean = env.isSupabaseConfigured;

export async function verifySupabaseConnection(): Promise<void> {
  if (!supabase || !import.meta.env.DEV || import.meta.env.MODE === 'test') {
    return;
  }

  const { error } = await supabase.auth.getSession();
  if (error) {
    console.warn('[Learning Universe] Không thể kiểm tra phiên Supabase:', error.message);
    return;
  }

  console.info('[Learning Universe] Đã kết nối Supabase thành công.');
}
