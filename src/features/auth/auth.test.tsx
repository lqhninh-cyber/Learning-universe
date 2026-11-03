import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it } from 'vitest';
import { MemoryRouter, Route, Routes } from 'react-router';
import { useLearningStore } from '@/features/learning';
import {
  AuthProvider,
  useAuth,
  AuthModal,
  PendingNoticeDialog,
  ProtectedRoute,
  DEMO_ADMIN,
  DEMO_APPROVED_STUDENT,
  DEMO_PENDING_STUDENT,
} from './index';

function TestAuthConsumer() {
  const {
    user,
    isAuthenticated,
    isAdmin,
    isPending,
    isApprovedStudent,
    openAuthModal,
    openPendingNotice,
    signOut,
    setMockUser,
  } = useAuth();

  return (
    <div>
      <div data-testid="auth-status">
        {isAuthenticated ? `Logged in as ${user?.email}` : 'Guest'}
      </div>
      <div data-testid="is-admin">{isAdmin ? 'yes' : 'no'}</div>
      <div data-testid="is-pending">{isPending ? 'yes' : 'no'}</div>
      <div data-testid="is-approved">{isApprovedStudent ? 'yes' : 'no'}</div>

      <button type="button" onClick={openAuthModal}>
        Mở đăng nhập
      </button>
      <button type="button" onClick={openPendingNotice}>
        Mở thông báo chờ
      </button>
      <button type="button" onClick={() => setMockUser(DEMO_ADMIN)}>
        Chọn Admin
      </button>
      <button type="button" onClick={() => setMockUser(DEMO_APPROVED_STUDENT)}>
        Chọn Học viên duyệt
      </button>
      <button type="button" onClick={() => setMockUser(DEMO_PENDING_STUDENT)}>
        Chọn Chờ duyệt
      </button>
      <button type="button" onClick={() => void signOut()}>
        Đăng xuất
      </button>

      <AuthModal />
      <PendingNoticeDialog />
    </div>
  );
}

describe('Hệ thống Xác thực & Phân quyền (Auth Module)', () => {
  beforeEach(() => {
    window.localStorage.clear();
    useLearningStore.getState().resetLearningStore();
  });

  it('1. Khởi tạo ở chế độ Khách (Guest) mặc định', async () => {
    render(
      <AuthProvider>
        <TestAuthConsumer />
      </AuthProvider>,
    );

    await waitFor(() => {
      expect(screen.getByTestId('auth-status')).toHaveTextContent('Guest');
    });
    expect(screen.getByTestId('is-admin')).toHaveTextContent('no');
    expect(screen.getByTestId('is-approved')).toHaveTextContent('no');
    expect(screen.getByTestId('is-pending')).toHaveTextContent('no');
  });

  it('2. Chuyển đổi sang vai trò Học viên chờ duyệt và hiển thị thông báo Chờ duyệt', async () => {
    const user = userEvent.setup();

    render(
      <AuthProvider>
        <TestAuthConsumer />
      </AuthProvider>,
    );

    await user.click(screen.getByRole('button', { name: 'Chọn Chờ duyệt' }));

    expect(screen.getByTestId('auth-status')).toHaveTextContent(DEMO_PENDING_STUDENT.email!);
    expect(screen.getByTestId('is-pending')).toHaveTextContent('yes');
    expect(screen.getByTestId('is-approved')).toHaveTextContent('no');

    // Mở hộp thoại thông báo chờ duyệt
    await user.click(screen.getByRole('button', { name: 'Mở thông báo chờ' }));
    expect(screen.getByText('Tài khoản đang chờ phê duyệt')).toBeInTheDocument();
    expect(
      screen.getByText(
        new RegExp(
          `Tài khoản của bạn \\(${DEMO_PENDING_STUDENT.email}\\) hiện đang trong danh sách chờ`,
          'i',
        ),
      ),
    ).toBeInTheDocument();
  });

  it('3. Chuyển đổi sang vai trò Học viên đã duyệt và kích hoạt Learner store', async () => {
    const user = userEvent.setup();

    render(
      <AuthProvider>
        <TestAuthConsumer />
      </AuthProvider>,
    );

    await user.click(screen.getByRole('button', { name: 'Chọn Học viên duyệt' }));

    expect(screen.getByTestId('is-approved')).toHaveTextContent('yes');
    expect(screen.getByTestId('is-pending')).toHaveTextContent('no');
    // Kiểm tra learningStore được kích hoạt tương ứng
    expect(useLearningStore.getState().isAuthenticated).toBe(true);

    // Khi đăng xuất, learning store cũng quay về trạng thái chưa xác thực
    await user.click(screen.getByRole('button', { name: 'Đăng xuất' }));
    expect(screen.getByTestId('auth-status')).toHaveTextContent('Guest');
    expect(useLearningStore.getState().isAuthenticated).toBe(false);
  });

  it('4. Chuyển đổi sang Quản trị viên (Admin) và kiểm soát truy cập ProtectedRoute', async () => {
    const user = userEvent.setup();

    render(
      <MemoryRouter initialEntries={['/admin/users']}>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<div>Trang chủ công khai</div>} />
            <Route
              path="/admin/users"
              element={
                <ProtectedRoute requireAdmin>
                  <div>Khu vực Quản trị viên</div>
                </ProtectedRoute>
              }
            />
          </Routes>
          <TestAuthConsumer />
        </AuthProvider>
      </MemoryRouter>,
    );

    // Chờ xác thực ban đầu: do là guest -> ProtectedRoute tự chuyển hướng về '/'
    await waitFor(() => {
      expect(screen.getByText('Trang chủ công khai')).toBeInTheDocument();
    });
    expect(screen.queryByText('Khu vực Quản trị viên')).not.toBeInTheDocument();

    // Thiết lập vai trò Admin
    await user.click(screen.getByRole('button', { name: 'Chọn Admin' }));
    expect(screen.getByTestId('is-admin')).toHaveTextContent('yes');
  });

  it('5. Hộp thoại Đăng nhập (AuthModal) mở và hiển thị đầy đủ thông tin học thuật', async () => {
    const user = userEvent.setup();

    render(
      <AuthProvider>
        <TestAuthConsumer />
      </AuthProvider>,
    );

    await user.click(screen.getByRole('button', { name: 'Mở đăng nhập' }));

    expect(screen.getByText('Đăng nhập Không gian Học viên')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Đăng nhập với Google/i })).toBeInTheDocument();
    expect(screen.getByText(/Chính sách Học thuật Mở/i)).toBeInTheDocument();
  });
});
