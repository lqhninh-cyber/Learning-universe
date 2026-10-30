import { describe, expect, it } from 'vitest';
import { parseEnv } from '@/shared/config/env';

describe('parseEnv', () => {
  it('hoạt động ở chế độ chỉ đọc khi không cấu hình biến Supabase (D1)', () => {
    const result = parseEnv({});

    expect(result.isSupabaseConfigured).toBe(false);
    expect(result.supabaseUrl).toBeUndefined();
    expect(result.supabaseAnonKey).toBeUndefined();
    expect(result.siteUrl).toBe('http://localhost:5173');
  });

  it('nhận diện cấu hình hợp lệ với VITE_SUPABASE_URL và VITE_SUPABASE_ANON_KEY', () => {
    const result = parseEnv({
      VITE_SUPABASE_URL: 'https://example.supabase.co',
      VITE_SUPABASE_ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.valid-anon-key',
      VITE_SITE_URL: 'https://learning-universe.vercel.app',
    });

    expect(result.isSupabaseConfigured).toBe(true);
    expect(result.supabaseUrl).toBe('https://example.supabase.co');
    expect(result.siteUrl).toBe('https://learning-universe.vercel.app');
  });

  it('ném lỗi rõ ràng khi VITE_SUPABASE_URL sai định dạng URL', () => {
    expect(() =>
      parseEnv({
        VITE_SUPABASE_URL: 'not-a-valid-url',
      }),
    ).toThrow(/VITE_SUPABASE_URL/);
  });
});
