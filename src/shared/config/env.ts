import { z } from 'zod';

const rawEnvSchema = z.object({
  VITE_SUPABASE_URL: z
    .string()
    .trim()
    .optional()
    .transform((val) => (val === '' ? undefined : val))
    .pipe(z.url('VITE_SUPABASE_URL phải là một URL hợp lệ').optional()),
  VITE_SUPABASE_ANON_KEY: z
    .string()
    .trim()
    .optional()
    .transform((val) => (val === '' ? undefined : val))
    .pipe(z.string().min(20, 'VITE_SUPABASE_ANON_KEY không hợp lệ').optional()),
  VITE_SUPABASE_PUBLISHABLE_KEY: z
    .string()
    .trim()
    .optional()
    .transform((val) => (val === '' ? undefined : val))
    .pipe(z.string().min(20, 'VITE_SUPABASE_PUBLISHABLE_KEY không hợp lệ').optional()),
  VITE_SITE_URL: z
    .string()
    .trim()
    .optional()
    .transform((val) => (val === '' ? undefined : val))
    .pipe(z.url('VITE_SITE_URL phải là một URL hợp lệ').optional()),
});

export interface AppEnv {
  readonly supabaseUrl: string | undefined;
  readonly supabaseAnonKey: string | undefined;
  readonly siteUrl: string;
  readonly isSupabaseConfigured: boolean;
}

export function parseEnv(input: Record<string, string | undefined>): AppEnv {
  const parsed = rawEnvSchema.safeParse(input);

  if (!parsed.success) {
    const details = parsed.error.issues
      .map((issue) => `${issue.path.join('.')}: ${issue.message}`)
      .join('; ');
    throw new Error(`Cấu hình biến môi trường không hợp lệ: ${details}`);
  }

  const supabaseUrl = parsed.data.VITE_SUPABASE_URL;
  const supabaseAnonKey =
    parsed.data.VITE_SUPABASE_ANON_KEY ?? parsed.data.VITE_SUPABASE_PUBLISHABLE_KEY;
  const siteUrl = parsed.data.VITE_SITE_URL ?? 'http://localhost:5173';
  const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

  return {
    supabaseUrl,
    supabaseAnonKey,
    siteUrl,
    isSupabaseConfigured,
  };
}

export const env: AppEnv = parseEnv({
  VITE_SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL,
  VITE_SUPABASE_ANON_KEY: import.meta.env.VITE_SUPABASE_ANON_KEY,
  VITE_SUPABASE_PUBLISHABLE_KEY: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
  VITE_SITE_URL: import.meta.env.VITE_SITE_URL,
});
