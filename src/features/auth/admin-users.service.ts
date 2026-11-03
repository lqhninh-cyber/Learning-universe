import { isSupabaseConfigured, supabase } from '@/services/supabase/client';
import { INITIAL_DEMO_USERS } from './mock-users';
import type { UserProfile, UserRole, UserStatus } from './types';

const MOCK_STORAGE_KEY = 'learning_universe_mock_profiles_v1';

interface SupabaseProfileRow {
  id: string;
  email: string | null;
  full_name: string | null;
  avatar_url: string | null;
  role: string;
  status: string;
  created_at: string;
  updated_at: string;
}

function mapRowToProfile(row: SupabaseProfileRow): UserProfile {
  return {
    id: row.id,
    email: row.email,
    fullName: row.full_name,
    avatarUrl: row.avatar_url,
    role: row.role === 'admin' ? 'admin' : 'student',
    status: row.status === 'approved' || row.status === 'rejected' ? row.status : 'pending',
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function getLocalMockUsers(): UserProfile[] {
  if (typeof window === 'undefined') {
    return [...INITIAL_DEMO_USERS];
  }

  try {
    const raw = window.localStorage.getItem(MOCK_STORAGE_KEY);
    if (!raw) {
      window.localStorage.setItem(MOCK_STORAGE_KEY, JSON.stringify(INITIAL_DEMO_USERS));
      return [...INITIAL_DEMO_USERS];
    }
    const parsed = JSON.parse(raw) as UserProfile[];
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
  } catch {
    // Dự phòng lỗi phân tích JSON
  }

  return [...INITIAL_DEMO_USERS];
}

function saveLocalMockUsers(users: readonly UserProfile[]): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(MOCK_STORAGE_KEY, JSON.stringify(users));
  } catch {
    // Bỏ qua lỗi ghi localStorage nếu có
  }
}

export async function fetchUsersList(): Promise<UserProfile[]> {
  if (supabase && isSupabaseConfigured && import.meta.env.MODE !== 'test') {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.warn(
          '[Learning Universe] Không thể tải danh sách profiles từ Supabase, chuyển sang chế độ dự phòng:',
          error.message,
        );
        return getLocalMockUsers();
      }

      if (data && data.length > 0) {
        return (data as SupabaseProfileRow[]).map(mapRowToProfile);
      }
    } catch (err) {
      console.warn('[Learning Universe] Lỗi kết nối Supabase profiles:', err);
      return getLocalMockUsers();
    }
  }

  return getLocalMockUsers();
}

export async function updateUserStatus(
  userId: string,
  newStatus: UserStatus,
): Promise<UserProfile> {
  const now = new Date().toISOString();

  if (supabase && isSupabaseConfigured && import.meta.env.MODE !== 'test') {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .update({ status: newStatus, updated_at: now })
        .eq('id', userId)
        .select()
        .single();

      if (!error && data) {
        return mapRowToProfile(data as SupabaseProfileRow);
      }
      console.warn(
        '[Learning Universe] Không thể cập nhật trạng thái trên Supabase:',
        error?.message,
      );
    } catch (err) {
      console.warn('[Learning Universe] Lỗi mạng khi cập nhật trạng thái:', err);
    }
  }

  // Cập nhật trên dữ liệu mock cục bộ
  const users = getLocalMockUsers();
  const index = users.findIndex((u) => u.id === userId);
  if (index === -1) {
    throw new Error(`Không tìm thấy người dùng có id "${userId}"`);
  }

  const existing = users[index];
  if (!existing) {
    throw new Error(`Không tìm thấy người dùng có id "${userId}"`);
  }

  const updated: UserProfile = {
    ...existing,
    status: newStatus,
    updatedAt: now,
  };

  const nextUsers = [...users];
  nextUsers[index] = updated;
  saveLocalMockUsers(nextUsers);

  return updated;
}

export async function updateUserRole(userId: string, newRole: UserRole): Promise<UserProfile> {
  const now = new Date().toISOString();

  if (supabase && isSupabaseConfigured && import.meta.env.MODE !== 'test') {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .update({ role: newRole, updated_at: now })
        .eq('id', userId)
        .select()
        .single();

      if (!error && data) {
        return mapRowToProfile(data as SupabaseProfileRow);
      }
    } catch (err) {
      console.warn('[Learning Universe] Lỗi mạng khi cập nhật vai trò:', err);
    }
  }

  const users = getLocalMockUsers();
  const index = users.findIndex((u) => u.id === userId);
  if (index === -1) {
    throw new Error(`Không tìm thấy người dùng có id "${userId}"`);
  }

  const existing = users[index];
  if (!existing) {
    throw new Error(`Không tìm thấy người dùng có id "${userId}"`);
  }

  const updated: UserProfile = {
    ...existing,
    role: newRole,
    updatedAt: now,
  };

  const nextUsers = [...users];
  nextUsers[index] = updated;
  saveLocalMockUsers(nextUsers);

  return updated;
}

export function resetMockUsersStorage(): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.removeItem(MOCK_STORAGE_KEY);
  } catch {
    // Bỏ qua
  }
}
