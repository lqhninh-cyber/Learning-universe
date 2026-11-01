import type {
  BibliographyEntry,
  LessonMeta,
  ManifestLesson,
  ManifestSubject,
} from '@schemas/index';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createMemoryRouter, RouterProvider } from 'react-router';
import { describe, expect, it } from 'vitest';
import { routes } from '@/app/router';
import { SourcePanel } from '@/features/lesson-reader';
import { SubjectBibliography } from '@/features/subject';
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

// [DỮ LIỆU KIỂM THỬ] Danh mục tài liệu giả lập phục vụ kiểm thử giao diện SourcePanel & SubjectBibliography
const TEST_BIBLIOGRAPHY: readonly BibliographyEntry[] = [
  {
    id: 'giao-trinh-kiem-thu',
    type: 'textbook',
    title: '[DỮ LIỆU KIỂM THỬ] Giáo trình Đại số kiểm thử',
    authors: ['Nguyễn Văn Kiểm Thử'],
    year: 2022,
    publisher: 'NXB Sư phạm Kiểm thử',
    edition: 'Tái bản lần 2',
    numberingNote: 'Đánh số theo Chương.Mục',
  },
];

describe('Giai đoạn 4 — Giao diện SourcePanel, SubjectBibliography & Trang /dev/preview', () => {
  it('1. SourcePanel hiển thị đầy đủ nguồn tham khảo, số trang và bảng đối chiếu số hiệu gốc khi có dữ liệu', () => {
    const mockLesson: ManifestLesson = {
      id: 'bai-kiem-thu-nguon',
      slug: 'bai-kiem-thu-nguon',
      number: 1,
      file: '/tests/fixtures/01-bai-kiem-thu.mdx',
      title: '[KIỂM THỬ] Bài học có nguồn tham khảo',
      description: 'Mô tả kiểm thử',
      estimatedMinutes: 30,
      level: 'basic',
      prerequisites: [],
      tags: [],
      sources: [
        {
          source: 'giao-trinh-kiem-thu',
          pages: '25-31',
          sections: 'Chương 1, §2',
          note: 'Trình bày chi tiết định lý cơ bản',
        },
      ],
      status: 'published',
      version: '1.0.0',
      aliases: [],
    };

    const mockMeta: LessonMeta = {
      chapterNumber: 1,
      lessonNumber: 1,
      headings: [],
      blocks: [
        {
          name: 'Theorem',
          id: 'thm-lagrange-test',
          anchorId: 'thm-lagrange-test',
          number: '1.1.1',
          label: 'Định lý 1.1.1',
          title: 'Định lý kiểm thử',
          original: 'Định lý 3.2',
          source: 'giao-trinh-kiem-thu',
          page: '28',
        },
      ],
    };

    render(
      <SourcePanel
        lesson={mockLesson}
        lessonMeta={mockMeta}
        bibliographyOverride={TEST_BIBLIOGRAPHY}
      />,
    );

    expect(screen.getByText('[DỮ LIỆU KIỂM THỬ] Giáo trình Đại số kiểm thử')).toBeInTheDocument();
    expect(screen.getByText('Trang 25-31')).toBeInTheDocument();
    expect(screen.getByText('Chương 1, §2')).toBeInTheDocument();
    expect(screen.getByText(/Số hiệu gốc: Định lý 3.2/i)).toBeInTheDocument();
  });

  it('2. SubjectBibliography hiển thị giáo trình chính khi môn học đã cấu hình nguồn', () => {
    const mockSubject: ManifestSubject = {
      id: 'mon-kiem-thu',
      slug: 'mon-kiem-thu',
      title: 'Môn Kiểm Thử',
      shortTitle: 'MKT',
      description: 'Mô tả môn kiểm thử',
      order: 1,
      status: 'published',
      theme: { hue: 260 },
      sources: {
        primary: 'giao-trinh-kiem-thu',
        references: [],
      },
      chapters: [],
    };

    render(<SubjectBibliography subject={mockSubject} bibliographyOverride={TEST_BIBLIOGRAPHY} />);

    expect(screen.getByText('[DỮ LIỆU KIỂM THỬ] Giáo trình Đại số kiểm thử')).toBeInTheDocument();
    expect(screen.getByText(/Quy ước đánh số: Đánh số theo Chương\.Mục/i)).toBeInTheDocument();
  });

  it('3. Trang /dev/preview hiển thị thống kê chẩn đoán, lọc bài học theo môn và hiển thị hướng dẫn CLI', async () => {
    const user = userEvent.setup();
    renderRoute('/dev/preview');

    expect(
      await screen.findByRole('heading', {
        level: 1,
        name: /Trung tâm Kiểm định & Xem trước Nội dung Học thuật/i,
      }),
    ).toBeInTheDocument();

    expect(screen.getByText(/0 lỗi kỹ thuật/i)).toBeInTheDocument();
    expect(screen.getByText('Nửa nhóm, vị nhóm, nhóm và các hệ quả đầu tiên')).toBeInTheDocument();
    expect(screen.getByText('Khái niệm Không gian Affine và Quy tắc Chasles')).toBeInTheDocument();

    // Lọc theo môn Hình học Affine
    const subjectGroup = screen.getByRole('group', { name: /Lọc theo môn học/i });
    await user.click(within(subjectGroup).getByRole('button', { name: 'Hình học Affine' }));

    expect(screen.getByText('Khái niệm Không gian Affine và Quy tắc Chasles')).toBeInTheDocument();
    expect(
      screen.queryByText('Nửa nhóm, vị nhóm, nhóm và các hệ quả đầu tiên'),
    ).not.toBeInTheDocument();

    // Kiểm tra hướng dẫn lệnh CLI
    expect(screen.getByText('npm.cmd run content:check')).toBeInTheDocument();
  });

  it('4. Trang bài học hiển thị thanh biên tập DEV và bảng Nguồn tham khảo & Đối chiếu giáo trình', async () => {
    renderRoute(
      '/mon-hoc/cau-truc-dai-so/nhom-va-cac-vi-du-co-ban/nua-nhom-vi-nhom-va-tien-de-nhom',
    );

    expect(
      await screen.findByRole('complementary', { name: /Thanh thông tin biên tập kỹ thuật/i }),
    ).toBeInTheDocument();

    expect(
      screen.getByRole('region', { name: /Nguồn giáo trình và đối chiếu học thuật/i }),
    ).toBeInTheDocument();
  });
});
