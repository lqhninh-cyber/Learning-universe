import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import { useLearningStore } from '@/features/learning';
import { isSupabaseConfigured, supabase } from '@/services/supabase/client';
import { AuthContext } from './auth-context-def';
import { DEMO_PENDING_STUDENT } from './mock-users';
import type { AuthContextValue, UserProfile } from './types';

const AUTH_STORAGE_KEY = 'learning_universe_current_user_v1';

function loadStoredUser(): UserProfile | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(AUTH_STORAGE_KEY);
    if (raw) {
      return JSON.parse(raw) as UserProfile;
    }
  } catch {
    // Bỏ qua lỗi
  }
  return null;
}

function saveStoredUser(user: UserProfile | null): void {
  if (typeof window === 'undefined') return;
  try {
    if (user) {
      window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
    } else {
      window.localStorage.removeItem(AUTH_STORAGE_KEY);
    }
  } catch {
    // Bỏ qua lỗi
  }
}

export function AuthProvider({ children }: { readonly children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(loadStoredUser);
  const [isLoading, setIsLoading] = useState<boolean>(() =>
    Boolean(supabase && isSupabaseConfigured),
  );
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [isPendingNoticeOpen, setIsPendingNoticeOpen] = useState<boolean>(false);

  // Đồng bộ với learningStore: chỉ khi là Học viên đã duyệt mới kích hoạt lưu tiến độ
  useEffect(() => {
    if (user && user.status === 'approved') {
      useLearningStore.getState().enableLearnerMode(user.fullName || user.email || undefined);
    } else {
      useLearningStore.getState().signOutLearnerMode();
    }
    saveStoredUser(user);
  }, [user]);

  // Khởi tạo Supabase Auth Listener (nếu đã cấu hình)
  useEffect(() => {
    let isMounted = true;

    if (!supabase || !isSupabaseConfigured) {
      return;
    }

    async function fetchSupabaseProfile(userId: string, email: string | null) {
      if (!supabase) return null;
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .maybeSingle();

        if (error) {
          console.warn('[Learning Universe] Lỗi truy vấn profile:', error.message);
          return null;
        }

        if (data) {
          return {
            id: data.id,
            email: data.email ?? email,
            fullName: data.full_name,
            avatarUrl: data.avatar_url,
            role: data.role === 'admin' ? 'admin' : 'student',
            status:
              data.status === 'approved' || data.status === 'rejected' ? data.status : 'pending',
            createdAt: data.created_at,
            updatedAt: data.updated_at,
          } as UserProfile;
        }
      } catch (err) {
        console.warn('[Learning Universe] Ngoại lệ khi lấy profile Supabase:', err);
      }
      return null;
    }

    supabase.auth
      .getSession()
      .then(async ({ data: { session } }) => {
        if (!isMounted) return;
        if (session?.user) {
          const profile = await fetchSupabaseProfile(session.user.id, session.user.email ?? null);
          if (isMounted) {
            if (profile) {
              setUser(profile);
            } else {
              setUser({
                id: session.user.id,
                email: session.user.email ?? null,
                fullName:
                  session.user.user_metadata?.full_name ??
                  session.user.user_metadata?.name ??
                  session.user.email?.split('@')[0] ??
                  'Người dùng',
                avatarUrl: session.user.user_metadata?.avatar_url ?? null,
                role: 'student',
                status: 'pending',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
              });
            }
          }
        }
      })
      .catch((err) => {
        console.warn('[Learning Universe] Lỗi getSession:', err);
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (!isMounted) return;
      if (session?.user) {
        const profile = await fetchSupabaseProfile(session.user.id, session.user.email ?? null);
        if (isMounted) {
          if (profile) {
            setUser(profile);
          } else {
            setUser({
              id: session.user.id,
              email: session.user.email ?? null,
              fullName:
                session.user.user_metadata?.full_name ??
                session.user.user_metadata?.name ??
                session.user.email?.split('@')[0] ??
                'Người dùng',
              avatarUrl: session.user.user_metadata?.avatar_url ?? null,
              role: 'student',
              status: 'pending',
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            });
          }
        }
      } else {
        if (isMounted) setUser(null);
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const openAuthModal = useCallback(() => setIsAuthModalOpen(true), []);
  const closeAuthModal = useCallback(() => setIsAuthModalOpen(false), []);
  const openPendingNotice = useCallback(() => setIsPendingNoticeOpen(true), []);
  const closePendingNotice = useCallback(() => setIsPendingNoticeOpen(false), []);

  const signInWithGoogle = useCallback(async () => {
    if (supabase && isSupabaseConfigured) {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: typeof window !== 'undefined' ? window.location.origin : undefined,
        },
      });
      if (error) {
        throw error;
      }
    } else {
      setUser(DEMO_PENDING_STUDENT);
      setIsAuthModalOpen(false);
    }
  }, []);

  const signOut = useCallback(async () => {
    if (supabase && isSupabaseConfigured) {
      try {
        await supabase.auth.signOut();
      } catch (err) {
        console.warn('[Learning Universe] Lỗi khi đăng xuất Supabase:', err);
      }
    }
    setUser(null);
    setIsAuthModalOpen(false);
    setIsPendingNoticeOpen(false);
  }, []);

  const setMockUser = useCallback((profile: UserProfile | null) => {
    setUser(profile);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isLoading,
      isAuthenticated: Boolean(user),
      isApprovedStudent: Boolean(user && user.status === 'approved'),
      isAdmin: Boolean(user && user.role === 'admin'),
      isPending: Boolean(user && user.status === 'pending'),
      isRejected: Boolean(user && user.status === 'rejected'),
      isMockMode: !isSupabaseConfigured,
      isAuthModalOpen,
      isPendingNoticeOpen,
      openAuthModal,
      closeAuthModal,
      openPendingNotice,
      closePendingNotice,
      signInWithGoogle,
      signOut,
      setMockUser,
    }),
    [
      user,
      isLoading,
      isAuthModalOpen,
      isPendingNoticeOpen,
      openAuthModal,
      closeAuthModal,
      openPendingNotice,
      closePendingNotice,
      signInWithGoogle,
      signOut,
      setMockUser,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
