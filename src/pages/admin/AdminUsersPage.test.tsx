import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it } from 'vitest';
import { resetMockUsersStorage } from '@/features/auth';
import { AdminUsersPage } from './AdminUsersPage';

describe('Trang Quản lý & Phê duyệt Học viên (/admin/users)', () => {
  beforeEach(() => {
    window.localStorage.clear();
    resetMockUsersStorage();
  });

  it('1. Hiển thị tiêu đề, thẻ thống kê KPI và danh sách học viên ban đầu', async () => {
    render(<AdminUsersPage />);

    expect(
      screen.getByRole('heading', { name: 'Phê duyệt & Quản lý Học viên' }),
    ).toBeInTheDocument();
    expect(screen.getByText('Tổng số học viên')).toBeInTheDocument();
    expect(screen.getByText('Đang chờ duyệt')).toBeInTheDocument();
    expect(screen.getByText('Đã duyệt')).toBeInTheDocument();
    expect(screen.getByText('Từ chối / Đã khóa')).toBeInTheDocument();

    // Chờ danh sách nạp xong
    await waitFor(() => {
      expect(screen.getByText('Nguyễn Văn Minh')).toBeInTheDocument();
      expect(screen.getByText('Trần Thị Thu Trang')).toBeInTheDocument();
    });
  });

  it('2. Lọc học viên theo tab trạng thái (Chờ duyệt / Đã duyệt / Từ chối)', async () => {
    const user = userEvent.setup();
    render(<AdminUsersPage />);

    await waitFor(() => {
      expect(screen.getByText('Trần Thị Thu Trang')).toBeInTheDocument();
    });

    // Chuyển sang tab "Chờ duyệt"
    const pendingTab = screen.getByRole('tab', { name: /Chờ duyệt/i });
    await user.click(pendingTab);

    // Học viên chờ duyệt phải hiển thị
    expect(screen.getByText('Trần Thị Thu Trang')).toBeInTheDocument();
    // Học viên đã duyệt không được hiển thị trong tab chờ duyệt
    expect(screen.queryByText('Nguyễn Văn Minh')).not.toBeInTheDocument();

    // Chuyển sang tab "Đã duyệt"
    const approvedTab = screen.getByRole('tab', { name: /Đã duyệt/i });
    await user.click(approvedTab);

    expect(screen.getByText('Nguyễn Văn Minh')).toBeInTheDocument();
    expect(screen.queryByText('Trần Thị Thu Trang')).not.toBeInTheDocument();
  });

  it('3. Tìm kiếm học viên bằng từ khóa tiếng Việt không dấu', async () => {
    const user = userEvent.setup();
    render(<AdminUsersPage />);

    await waitFor(() => {
      expect(screen.getByText('Nguyễn Văn Minh')).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText(/Tìm theo họ tên hoặc email/i);

    // Nhập "van minh" không dấu
    await user.type(searchInput, 'van minh');

    expect(screen.getByText('Nguyễn Văn Minh')).toBeInTheDocument();
    expect(screen.queryByText('Trần Thị Thu Trang')).not.toBeInTheDocument();

    // Nhập email
    await user.clear(searchInput);
    await user.type(searchInput, 'choduyet.tran');

    expect(screen.getByText('Trần Thị Thu Trang')).toBeInTheDocument();
    expect(screen.queryByText('Nguyễn Văn Minh')).not.toBeInTheDocument();
  });

  it('4. Phê duyệt học viên chờ duyệt thành công khi bấm nút Duyệt', async () => {
    const user = userEvent.setup();
    render(<AdminUsersPage />);

    // Lọc sang tab Chờ duyệt
    await user.click(screen.getByRole('tab', { name: /Chờ duyệt/i }));

    await waitFor(() => {
      expect(screen.getByText('Trần Thị Thu Trang')).toBeInTheDocument();
    });

    // Tìm dòng của học viên chờ duyệt
    const row = screen.getByTestId('user-row-usr-pending-01');
    const approveBtn = row.querySelector('button');
    expect(approveBtn).toHaveTextContent('Duyệt');

    if (approveBtn) {
      await user.click(approveBtn);
    }

    // Hiển thị thông báo duyệt thành công
    await waitFor(() => {
      expect(
        screen.getByText(/Đã phê duyệt thành công tài khoản "Trần Thị Thu Trang"/i),
      ).toBeInTheDocument();
    });
  });

  it('5. Từ chối / Khóa tài khoản khi bấm nút Từ chối', async () => {
    const user = userEvent.setup();
    render(<AdminUsersPage />);

    await waitFor(() => {
      expect(screen.getByText('Trần Thị Thu Trang')).toBeInTheDocument();
    });

    const row = screen.getByTestId('user-row-usr-pending-01');
    const rejectBtn = row.querySelectorAll('button')[1];
    expect(rejectBtn).toHaveTextContent('Từ chối');

    if (rejectBtn) {
      await user.click(rejectBtn);
    }

    await waitFor(() => {
      expect(
        screen.getByText(/Đã từ chối thành công tài khoản "Trần Thị Thu Trang"/i),
      ).toBeInTheDocument();
    });
  });
});
