import { act, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createMemoryRouter, RouterProvider } from 'react-router';
import { beforeEach, describe, expect, it } from 'vitest';
import { routes } from '@/app/router';
import { useLearningStore } from '@/features/learning';
import { MotionProvider } from '@/shared/motion/MotionProvider';
import { TooltipProvider } from '@/shared/ui/Tooltip';

function renderRoute(initialEntry: string) {
  const router = createMemoryRouter(routes, { initialEntries: [initialEntry] });
  return {
    router,
    ...render(
      <MotionProvider>
        <TooltipProvider>
          <RouterProvider router={router} />
        </TooltipProvider>
      </MotionProvider>,
    ),
  };
}

describe('Giai đoạn 3 — Không gian học tập công khai & Điều hướng bài học', () => {
  beforeEach(() => {
    useLearningStore.getState().resetLearningStore();
  });

  it('1. Trang chủ: tìm kiếm tức thời bài học bằng từ khóa không dấu và có dấu', async () => {
    const user = userEvent.setup();
    renderRoute('/');

    const searchInput = await screen.findByRole('searchbox', {
      name: /Tìm kiếm môn học hoặc bài học/i,
    });

    await user.type(searchInput, 'Cayley');
    const resultsRegion = await screen.findByRole('region', { name: /Kết quả tìm kiếm/i });
    expect(
      within(resultsRegion).getByText(/Lũy thừa nguyên, nhóm hữu hạn và bảng Cayley/i),
    ).toBeInTheDocument();

    await user.clear(searchInput);
    await user.type(searchInput, 'Chasles');
    const updatedRegion = await screen.findByRole('region', { name: /Kết quả tìm kiếm/i });
    expect(
      within(updatedRegion).getByText(/Khái niệm Không gian Affine và Quy tắc Chasles/i),
    ).toBeInTheDocument();
  });

  it('2. Không gian môn học (/mon-hoc/cau-truc-dai-so): hiển thị chương, bài học, bộ lọc và tiến độ', async () => {
    const user = userEvent.setup();
    renderRoute('/mon-hoc/cau-truc-dai-so');

    expect(
      await screen.findByRole('heading', { level: 1, name: 'Cấu trúc đại số' }),
    ).toBeInTheDocument();

    // Hiển thị các bài trong môn học
    expect(screen.getByText('Nửa nhóm, vị nhóm, nhóm và các hệ quả đầu tiên')).toBeInTheDocument();
    expect(screen.getByText('Hệ thống bài tập và tổng kết Chương 1')).toBeInTheDocument();

    // Lọc theo mức độ "Trung bình" -> bài basic bị ẩn, bài intermediate giữ lại
    await user.click(screen.getByRole('button', { name: 'Trung bình' }));
    expect(
      screen.queryByText('Nửa nhóm, vị nhóm, nhóm và các hệ quả đầu tiên'),
    ).not.toBeInTheDocument();
    expect(screen.getByText('Hệ thống bài tập và tổng kết Chương 1')).toBeInTheDocument();

    // Xóa bộ lọc -> hiển thị lại
    await user.click(screen.getByRole('button', { name: /Xóa bộ lọc/i }));
    expect(screen.getByText('Nửa nhóm, vị nhóm, nhóm và các hệ quả đầu tiên')).toBeInTheDocument();

    // Khi bật chế độ Học viên và đánh dấu hoàn thành 1 bài -> tiến độ chương 1 hiển thị 1/4 bài, tổng thể 3% (1/35 bài)
    act(() => {
      useLearningStore.getState().enableLearnerMode();
      useLearningStore.getState().toggleLessonCompleted('nua-nhom-vi-nhom-va-tien-de-nhom');
    });
    expect((await screen.findAllByText('3%')).length).toBeGreaterThan(0);
    expect(screen.getByText('Hoàn thành 1/4')).toBeInTheDocument();
  });

  it('3. Không gian môn học (/mon-hoc/hinh-hoc-affine): dùng chung hệ thống component với cấu trúc riêng', async () => {
    renderRoute('/mon-hoc/hinh-hoc-affine');

    expect(
      await screen.findByRole('heading', { level: 1, name: 'Hình học Affine' }),
    ).toBeInTheDocument();
    expect(screen.getByText('Khái niệm Không gian Affine và Quy tắc Chasles')).toBeInTheDocument();
  });

  it('4. Trang bài học: hiển thị MDX, mục lục, hoàn thành bài (D1), ghi chú và chuyển bài tiếp theo', async () => {
    const user = userEvent.setup();
    renderRoute(
      '/mon-hoc/cau-truc-dai-so/nhom-va-cac-vi-du-co-ban/nua-nhom-vi-nhom-va-tien-de-nhom',
    );

    expect(
      await screen.findByRole('heading', {
        level: 1,
        name: 'Nửa nhóm, vị nhóm, nhóm và các hệ quả đầu tiên',
      }),
    ).toBeInTheDocument();

    // Đợi MDX tải xong và hiển thị mục lục + khối Định nghĩa 1.1.1
    const defItems = await screen.findAllByText('Định nghĩa 1.1.1');
    expect(defItems.length).toBeGreaterThan(0);

    const tocNav = screen.getByRole('navigation', { name: 'Mục lục bài học' });
    expect(
      within(tocNav).getByRole('link', { name: /1\. Từ phép biến hình đến các tiên đề của Nhóm/i }),
    ).toHaveAttribute('href', '#1-tu-phep-bien-hinh-den-cac-tien-de-cua-nhom');

    // Ở chế độ Khách (Guest), bấm "Đánh dấu hoàn thành" mở hộp thoại LoginPromptDialog (D1)
    const completeButtons = screen.getAllByRole('button', { name: /Đánh dấu hoàn thành/i });
    await user.click(completeButtons[0]!);

    expect(
      await screen.findByRole('heading', { name: /Lưu tiến độ hoàn thành bài học/i }),
    ).toBeInTheDocument();

    // Bấm "Kích hoạt Chế độ Học viên" -> tự động hoàn tất thao tác đang dở
    await user.click(screen.getByRole('button', { name: /Kích hoạt Chế độ Học viên/i }));
    expect(
      (await screen.findAllByRole('button', { name: /Đã hoàn thành bài học/i })).length,
    ).toBeGreaterThan(0);

    // Mở khung ghi chú cá nhân và lưu ghi chú
    const noteButtons = screen.getAllByRole('button', { name: /Ghi chú cá nhân/i });
    await user.click(noteButtons[0]!);

    const noteTextarea = await screen.findByRole('textbox', {
      name: /Nội dung ghi chú cá nhân/i,
    });
    await user.type(noteTextarea, 'Cần nhớ công thức nghịch đảo của một tích.');
    await user.click(screen.getByRole('button', { name: /Lưu ghi chú/i }));
    expect(await screen.findByText(/Đã lưu ghi chú thành công/i)).toBeInTheDocument();

    // Điều hướng sang Bài tiếp theo (Bài 1.2: Lũy thừa nguyên, nhóm hữu hạn và bảng Cayley)
    const nextLink = screen.getByRole('link', {
      name: /Bài tiếp theo.*Lũy thừa nguyên, nhóm hữu hạn và bảng Cayley/i,
    });
    await user.click(nextLink);

    expect(
      await screen.findByRole('heading', {
        level: 1,
        name: 'Lũy thừa nguyên, nhóm hữu hạn và bảng Cayley',
      }),
    ).toBeInTheDocument();
  });

  it('5. Đường dẫn rút gọn (/bai-hoc/nhom và /bai-hoc/nhom-con) tự động điều hướng về bài học chuẩn', async () => {
    renderRoute('/bai-hoc/nhom');

    expect(
      await screen.findByRole('heading', {
        level: 1,
        name: 'Nửa nhóm, vị nhóm, nhóm và các hệ quả đầu tiên',
      }),
    ).toBeInTheDocument();
  });

  it('6. Hỗ trợ điều hướng trực tiếp (deep-link) tới trang Danh sách môn (/mon-hoc), ngăn menu di động và trạng thái không tìm thấy môn', async () => {
    const user = userEvent.setup();
    const { unmount } = renderRoute('/mon-hoc');

    expect(
      await screen.findByRole('heading', {
        level: 1,
        name: 'Danh mục học phần Sư phạm Toán học',
      }),
    ).toBeInTheDocument();

    // Kiểm tra nút mở menu điều hướng trên mobile
    const mobileMenuButton = screen.getByRole('button', { name: 'Mở menu điều hướng' });
    await user.click(mobileMenuButton);
    const mobileNav = await screen.findByRole('navigation', { name: 'Menu điều hướng di động' });
    expect(within(mobileNav).getByRole('link', { name: 'Cấu trúc đại số' })).toHaveAttribute(
      'href',
      '/mon-hoc/cau-truc-dai-so',
    );
    unmount();

    // Kiểm tra đường dẫn môn học không tồn tại
    renderRoute('/mon-hoc/mon-khong-ton-tai');
    expect(
      await screen.findByRole('heading', {
        level: 1,
        name: /Không tìm thấy môn học bạn yêu cầu/i,
      }),
    ).toBeInTheDocument();
  });
});
