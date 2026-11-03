import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import { useLearningStore } from '@/features/learning';
import { isSupabaseConfigured, supabase } from '@/services/supabase/client';
import { fetchUserLearningData } from '@/services/supabase/learning-sync';
import { AuthContext } from './auth-context-def';
import { DEMO_PENDING_STUDENT } from './mock-users';
import type { AuthContextValue, UserProfile, UserRole, UserStatus } from './types';

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

  // Đồng bộ với learningStore: chỉ khi là Học viên đã duyệt hoặc Admin mới kích hoạt lưu tiến độ
  useEffect(() => {
    if (user && (user.role === 'admin' || user.status === 'approved')) {
      useLearningStore
        .getState()
        .enableLearnerMode(user.fullName || user.email || undefined, user.id);
      void fetchUserLearningData(user.id).then((cloudData) => {
        if (cloudData) {
          useLearningStore.getState().mergeCloudLearningData(cloudData);
        }
      });
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

    async function loadProfileFromSupabase(
      userId: string,
      userEmail: string | null,
    ): Promise<UserProfile | null> {
      if (!supabase) return null;
      try {
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('role, status, full_name, avatar_url')
          .eq('id', userId)
          .single();

        if (error) {
          console.warn('[Learning Universe] Lỗi truy vấn profile từ Supabase:', error.message);
          return null;
        }

        if (profile) {
          const role: UserRole = profile.role === 'admin' ? 'admin' : 'student';
          const status: UserStatus =
            role === 'admin'
              ? 'approved'
              : profile.status === 'approved' || profile.status === 'rejected'
                ? profile.status
                : 'pending';

          return {
            id: userId,
            email: userEmail,
            fullName: profile.full_name,
            avatarUrl: profile.avatar_url,
            role,
            status,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
        }
      } catch (err) {
        console.warn('[Learning Universe] Ngoại lệ khi lấy profile Supabase:', err);
      }
      return null;
    }

    const syncUserSession = async (sessionUser: {
      id: string;
      email?: string | null;
      user_metadata?: Record<string, unknown>;
      app_metadata?: Record<string, unknown>;
      created_at?: string;
    }) => {
      const profile = await loadProfileFromSupabase(sessionUser.id, sessionUser.email ?? null);
      if (!isMounted) return;

      if (profile) {
        // Cập nhật state chính xác theo dữ liệu từ database profiles
        setUser({
          ...profile,
          email: sessionUser.email ?? profile.email,
          fullName:
            profile.fullName ||
            (sessionUser.user_metadata?.full_name as string) ||
            (sessionUser.user_metadata?.name as string) ||
            sessionUser.email?.split('@')[0] ||
            'Học viên',
          avatarUrl: profile.avatarUrl || (sessionUser.user_metadata?.avatar_url as string) || null,
        });
      } else {
        // Tuyệt đối không hardcode pending nếu database/metadata đã là admin hoặc approved
        setUser((prev) => {
          if (
            prev &&
            prev.id === sessionUser.id &&
            (prev.role === 'admin' || prev.status === 'approved')
          ) {
            return prev;
          }

          const metaRole =
            (sessionUser.app_metadata?.role as string) ||
            (sessionUser.user_metadata?.role as string);
          const metaStatus =
            (sessionUser.app_metadata?.status as string) ||
            (sessionUser.user_metadata?.status as string);
          const isAdmin = metaRole === 'admin';

          return {
            id: sessionUser.id,
            email: sessionUser.email ?? null,
            fullName:
              (sessionUser.user_metadata?.full_name as string) ||
              (sessionUser.user_metadata?.name as string) ||
              sessionUser.email?.split('@')[0] ||
              prev?.fullName ||
              'Người dùng',
            avatarUrl: (sessionUser.user_metadata?.avatar_url as string) || prev?.avatarUrl || null,
            role: isAdmin ? 'admin' : 'student',
            status: isAdmin ? 'approved' : metaStatus === 'approved' ? 'approved' : 'pending',
            createdAt: sessionUser.created_at ?? new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
        });
      }
    };

    supabase.auth
      .getSession()
      .then(async ({ data: { session } }) => {
        if (!isMounted) return;
        if (session?.user) {
          await syncUserSession(session.user);
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
        await syncUserSession(session.user);
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

  const isAdmin = Boolean(user && user.role === 'admin');
  const isApprovedStudent = Boolean(user && (user.role === 'admin' || user.status === 'approved'));
  const isPending = Boolean(user && user.role !== 'admin' && user.status === 'pending');
  const isRejected = Boolean(user && user.role !== 'admin' && user.status === 'rejected');

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isLoading,
      isAuthenticated: Boolean(user),
      isApprovedStudent,
      isAdmin,
      isPending,
      isRejected,
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
      isApprovedStudent,
      isAdmin,
      isPending,
      isRejected,
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
