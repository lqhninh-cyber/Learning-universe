export type UserRole = 'student' | 'admin';
export type UserStatus = 'pending' | 'approved' | 'rejected';

export interface UserProfile {
  readonly id: string;
  readonly email: string | null;
  readonly fullName: string | null;
  readonly avatarUrl: string | null;
  readonly role: UserRole;
  readonly status: UserStatus;
  readonly createdAt: string;
  readonly updatedAt: string;
}

export interface AuthContextValue {
  readonly user: UserProfile | null;
  readonly isLoading: boolean;
  readonly isAuthenticated: boolean;
  readonly isApprovedStudent: boolean;
  readonly isAdmin: boolean;
  readonly isPending: boolean;
  readonly isRejected: boolean;
  readonly isMockMode: boolean;
  readonly isAuthModalOpen: boolean;
  readonly isPendingNoticeOpen: boolean;
  readonly openAuthModal: () => void;
  readonly closeAuthModal: () => void;
  readonly openPendingNotice: () => void;
  readonly closePendingNotice: () => void;
  readonly signInWithGoogle: () => Promise<void>;
  readonly signOut: () => Promise<void>;
  readonly setMockUser: (profile: UserProfile | null) => void;
}
