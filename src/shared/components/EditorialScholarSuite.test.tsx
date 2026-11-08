import type { LessonMeta, ManifestLesson } from '@schemas/index';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { LessonProvider } from '@/content-runtime';
import { Proof } from '@/content-runtime/components/Proof';
import { LessonView, ReadingSpine } from '@/features/courses';
import { SourcePanel } from '@/features/lesson-reader';
import { AcademicPopover } from './AcademicPopover';
import { PaperGrain } from './PaperGrain';
import { Sidenote } from './Sidenote';

describe('Editorial Scholar Suite (Hệ màu Giấy Dó đồng nhất)', () => {
  it('kết xuất lớp phủ vi chất liệu Giấy Dó (PaperGrain) với bộ lọc feTurbulence nội dòng', () => {
    const { container } = render(<PaperGrain />);
    const svg = screen.getByTestId('paper-grain-overlay');

    expect(svg).toBeInTheDocument();
    expect(svg.getAttribute('class') ?? '').toContain('fixed');
    expect(svg.getAttribute('class') ?? '').toContain('opacity-[0.032]');

    const feTurbulence = container.querySelector('feTurbulence');
    expect(feTurbulence).not.toBeNull();
    expect(feTurbulence).toHaveAttribute('type', 'fractalNoise');
    expect(feTurbulence).toHaveAttribute('baseFrequency', '0.8');
    expect(feTurbulence).toHaveAttribute('numOctaves', '3');
    expect(feTurbulence).toHaveAttribute('stitchTiles', 'stitch');
  });

  it('kết xuất bố cục bài đọc LessonView với 2 thanh điều hướng sticky, khung sáng bg-[#F7FAFA] rounded-3xl và mục lục bg-[#E1E9EA]/80', () => {
    render(
      <LessonView
        title="Định lý Lagrange và Cấp của Phần tử"
        lead="Trong lý thuyết nhóm hữu hạn, Định lý Lagrange thiết lập mối liên hệ nền tảng giữa cấp của nhóm con và cấp của toàn bộ nhóm."
        sidebar={<div>Menu chương bài học</div>}
        marginalia={<div>Mục lục chuyên khảo</div>}
        prerequisites={<div data-testid="horizontal-prereqs">Kiến thức tiên quyết</div>}
      >
        <p id="doan-1">
          Nội dung định lý chính kèm chú giải lề
          <Sidenote id="sn-lagrange" anchor="doan-1" type="history" number={1}>
            Joseph-Louis Lagrange công bố kết quả sơ khởi vào năm 1771.
          </Sidenote>
        </p>
      </LessonView>,
    );

    const grid = screen.getByTestId('asymmetric-scholar-grid');
    expect(grid.className).toContain('bg-[#EAF0F1]');
    expect(grid.className).toContain('text-[#29383D]');
    expect(grid.className).toContain('lg:grid-cols-12');

    const sidebar = screen.getByLabelText('Danh mục chương bài');
    expect(sidebar.className).toContain('sticky');
    expect(sidebar.className).toContain('top-24');
    expect(sidebar.className).toContain('self-start');
    expect(sidebar.className).toContain('scrollbar-thin');

    const mainCol = screen.getByTestId('scholar-main-column');
    expect(mainCol.className).toContain('bg-[#F7FAFA]');
    expect(mainCol.className).toContain('rounded-3xl');
    expect(mainCol.className).toContain('border-[#CFDADB]');
    expect(mainCol.className).toContain('shadow-sm');

    const sidenotesCol = screen.getByTestId('scholar-sidenotes-column');
    expect(sidenotesCol.className).toContain('bg-[#E1E9EA]/80');
    expect(sidenotesCol.className).toContain('backdrop-blur');
    expect(sidenotesCol.className).toContain('rounded-2xl');
    expect(sidenotesCol.className).toContain('border-[#CFDADB]');
    expect(sidenotesCol.className).toContain('sticky');
    expect(sidenotesCol.className).toContain('top-24');
    expect(sidenotesCol.className).toContain('self-start');
    expect(sidenotesCol.className).toContain('scrollbar-thin');

    const prereqs = screen.getByTestId('horizontal-prereqs');
    expect(prereqs).toBeInTheDocument();

    const leadParagraph = screen.getByTestId('scholar-lead-paragraph');
    expect(leadParagraph.className).toContain('academic-dropcap');

    const sidenoteMatches = screen.getAllByText(
      /Joseph-Louis Lagrange công bố kết quả sơ khởi vào năm 1771/i,
    );
    expect(sidenoteMatches.length).toBeGreaterThan(0);
  });

  it('kết xuất AcademicPopover (Kính lúp tri thức Gwern-style) với KaTeX và nút Ghim (Pin)', () => {
    const { container } = render(
      <AcademicPopover
        term="dinh-ly-lagrange"
        title="Định lý Lagrange"
        formula="|G| = [G : H] \cdot |H|"
        summary="Cấp của mọi nhóm con H của nhóm hữu hạn G đều là ước số của cấp nhóm G."
        courseLabel="Cấu trúc đại số"
      >
        Định lý Lagrange
      </AcademicPopover>,
    );

    const trigger = container.querySelector('[data-academic-term="dinh-ly-lagrange"]');
    expect(trigger).not.toBeNull();

    fireEvent.mouseEnter(trigger!);

    const dialog = screen.getByRole('dialog', { name: /Kính lúp tri thức: Định lý Lagrange/i });
    expect(dialog).toBeInTheDocument();
    expect(dialog.className).toContain('backdrop-blur-xl');
    expect(dialog.className).toContain('w-80');

    expect(dialog.querySelector('.katex')).not.toBeNull();
    expect(
      screen.getByText(/Cấp của mọi nhóm con H của nhóm hữu hạn G đều là ước số/i),
    ).toBeInTheDocument();

    const pinButton = screen.getByRole('button', { name: /Ghim cố định thẻ tra cứu/i });
    fireEvent.click(pinButton);
    expect(pinButton).toHaveAttribute('aria-pressed', 'true');

    fireEvent.mouseLeave(trigger!);
    expect(
      screen.getByRole('dialog', { name: /Kính lúp tri thức: Định lý Lagrange/i }),
    ).toBeInTheDocument();
  });

  it('hủy kích hoạt hoàn toàn Trục tọa độ đọc (ReadingSpine) để giải phóng lề trái', () => {
    const { container } = render(<ReadingSpine activeIndex={2} />);
    expect(container.firstChild).toBeNull();
  });

  it('kết xuất dấu kết chứng minh Q.E.D hình thoi khắc kỷ hà di sản Việt Nam trong <Proof>', () => {
    const { container } = render(
      <LessonProvider lessonMeta={{ chapterNumber: 1, lessonNumber: 1, headings: [], blocks: [] }}>
        <Proof defaultOpen>
          <p>Do đó hai lớp ghép trái hoặc rời nhau hoặc trùng nhau.</p>
        </Proof>
      </LessonProvider>,
    );

    const qedContainer = screen.getByLabelText('Kết thúc chứng minh');
    expect(qedContainer).toBeInTheDocument();

    const lozengeSvg = container.querySelector('[data-qed-glyph="vietnamese-lozenge"]');
    expect(lozengeSvg).not.toBeNull();
  });

  it('SourcePanel chuẩn hóa thông tin giáo trình TS. Huỳnh Việt Khánh, nút mở PDF Drive và lưới micro-cards đối chiếu', () => {
    const mockLesson: ManifestLesson = {
      id: 'bai-lagrange-test',
      slug: 'dinh-ly-lagrange',
      number: 2,
      file: '/content/algebraic-structures/03-cac-dinh-ly-ve-nhom/02-dinh-ly-lagrange-va-ung-dung-so-hoc.mdx',
      title: 'Định lý Lagrange',
      description: 'Mô tả bài học',
      estimatedMinutes: 45,
      level: 'intermediate',
      prerequisites: [],
      tags: [],
      sources: [
        {
          source: 'gt-ctds-hvk-2026',
          pages: '59–63',
          sections: 'Chương 3, §3.2',
        },
      ],
      status: 'published',
      version: '1.0.0',
      aliases: [],
    };

    const mockMeta: LessonMeta = {
      chapterNumber: 3,
      lessonNumber: 2,
      headings: [],
      blocks: [
        {
          name: 'Theorem',
          id: 'thm-lagrange',
          anchorId: 'thm-lagrange',
          number: '3.2.1',
          label: 'Định lý 3.2.1',
          title: 'Định lý Lagrange',
          original: 'Định lý 3.7',
          source: 'gt-ctds-hvk-2026',
          page: '59',
        },
      ],
    };

    render(<SourcePanel lesson={mockLesson} lessonMeta={mockMeta} />);

    // Kiểm tra tên chuẩn hóa ngắn gọn
    const titles = screen.getAllByText('Giáo trình Cấu trúc đại số - TS. Huỳnh Việt Khánh');
    expect(titles.length).toBeGreaterThan(0);

    // Kiểm tra nút Đọc giáo trình PDF
    const pdfButton = screen.getByRole('link', {
      name: /Đọc giáo trình PDF \(Trang 59–63\)/i,
    });
    expect(pdfButton).toBeInTheDocument();
    expect(pdfButton).toHaveAttribute(
      'href',
      'https://drive.google.com/file/d/17drWozpQN-4jt4si1hhCHoXslUFkYtKm/view',
    );
    expect(pdfButton).toHaveAttribute('target', '_blank');

    // Kiểm tra micro-card đối chiếu
    expect(screen.getByText('ĐL 3.2.1 · Lagrange')).toBeInTheDocument();
    expect(screen.getByText('Gốc: ĐL 3.7')).toBeInTheDocument();
    expect(screen.getByText('tr. 59')).toBeInTheDocument();
  });

  it('kết xuất LessonView ở Chế độ Đêm Học Giả (Dark Reading Mode) với canvas #14171A, card #1C2024 và chú giải #1A1E22', () => {
    render(
      <LessonView
        readingTheme="dark"
        title="Định lý Lagrange và Cấp của Phần tử"
        lead="Trong lý thuyết nhóm hữu hạn, Định lý Lagrange thiết lập mối liên hệ nền tảng."
        sidebar={<div>Menu chương bài học</div>}
        marginalia={<div>Mục lục chuyên khảo</div>}
      >
        <p>Nội dung chi tiết trong đêm học giả.</p>
      </LessonView>,
    );

    const grid = screen.getByTestId('asymmetric-scholar-grid');
    expect(grid).toHaveAttribute('data-reading-theme', 'dark');
    expect(grid.className).toContain('bg-[#14171A]');
    expect(grid.className).toContain('text-[#E2E8F0]');

    const mainCol = screen.getByTestId('scholar-main-column');
    expect(mainCol.className).toContain('bg-[#1C2024]');
    expect(mainCol.className).toContain('border-[#2D3339]');
    expect(mainCol.className).toContain('text-[#E2E8F0]');

    const sidenotesCol = screen.getByTestId('scholar-sidenotes-column');
    expect(sidenotesCol.className).toContain('bg-[#1A1E22]');
    expect(sidenotesCol.className).toContain('border-[#2D3339]');
    expect(sidenotesCol.className).toContain('text-[#94A3B8]');

    // Đảm bảo html và body không bị gán class 'dark'
    expect(document.documentElement.classList.contains('dark')).toBe(false);
    expect(document.body.classList.contains('dark')).toBe(false);
  });
});
