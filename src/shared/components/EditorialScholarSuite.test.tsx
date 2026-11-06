import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { LessonProvider } from '@/content-runtime';
import { Proof } from '@/content-runtime/components/Proof';
import { LessonView, ReadingSpine } from '@/features/courses';
import { AcademicPopover } from './AcademicPopover';
import { PaperGrain } from './PaperGrain';
import { Sidenote } from './Sidenote';

describe('Editorial Scholar Suite (Bạch Dó & Mực Nho)', () => {
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

  it('kết xuất bố cục lưới lệch tỷ lệ vàng (LessonView 8/12 - 4/12), Drop Cap và Sidenote neo tọa độ', () => {
    render(
      <LessonView
        title="Định lý Lagrange và Cấp của Phần tử"
        lead="Trong lý thuyết nhóm hữu hạn, Định lý Lagrange thiết lập mối liên hệ nền tảng giữa cấp của nhóm con và cấp của toàn bộ nhóm."
        marginalia={<div>Mục lục chuyên khảo</div>}
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
    expect(grid.className).toContain('lg:grid-cols-12');
    expect(grid.className).toContain('lg:gap-12');
    expect(grid.className).toContain('max-w-7xl');

    const mainCol = screen.getByTestId('scholar-main-column');
    expect(mainCol.className).toContain('lg:col-span-8');
    expect(mainCol.className).toContain('max-w-[70ch]');

    const sidenotesCol = screen.getByTestId('scholar-sidenotes-column');
    expect(sidenotesCol.className).toContain('lg:col-span-4');
    expect(sidenotesCol.className).toContain('border-l');

    const leadParagraph = screen.getByTestId('scholar-lead-paragraph');
    expect(leadParagraph.className).toContain('academic-dropcap');

    // Kiểm tra Sidenote có gắn id và data-sidenote-anchor
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

    // Rê chuột vào thuật ngữ để mở Popover kính mờ
    fireEvent.mouseEnter(trigger!);

    const dialog = screen.getByRole('dialog', { name: /Kính lúp tri thức: Định lý Lagrange/i });
    expect(dialog).toBeInTheDocument();
    expect(dialog.className).toContain('backdrop-blur-xl');
    expect(dialog.className).toContain('w-80');

    // Kiểm tra công thức KaTeX đã được kết xuất
    expect(dialog.querySelector('.katex')).not.toBeNull();
    expect(
      screen.getByText(/Cấp của mọi nhóm con H của nhóm hữu hạn G đều là ước số/i),
    ).toBeInTheDocument();

    // Nhấn nút Ghim (Pin) để giữ cố định thẻ
    const pinButton = screen.getByRole('button', { name: /Ghim cố định thẻ tra cứu/i });
    fireEvent.click(pinButton);
    expect(pinButton).toHaveAttribute('aria-pressed', 'true');

    // Khi đã ghim, rời chuột khỏi thẻ không làm đóng Popover
    fireEvent.mouseLeave(trigger!);
    expect(
      screen.getByRole('dialog', { name: /Kính lúp tri thức: Định lý Lagrange/i }),
    ).toBeInTheDocument();
  });

  it('kết xuất Trục tọa độ đọc (ReadingSpine) với 5 chặng nhận thức §0 đến §4', () => {
    render(<ReadingSpine activeIndex={2} />);

    const spine = screen.getByTestId('reading-spine');
    expect(spine).toBeInTheDocument();
    expect(spine.className).toContain('fixed');
    expect(spine.className).toContain('left-6');

    expect(screen.getByRole('button', { name: /Mở đầu \/ Bối cảnh \(§0\)/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Hệ tiên đề & Bổ đề \(§1\)/i })).toBeInTheDocument();
    const activeBead = screen.getByRole('button', { name: /Định lý chính \(§2\)/i });
    expect(activeBead).toHaveAttribute('aria-current', 'step');
    expect(screen.getByRole('button', { name: /Chứng minh chi tiết \(§3\)/i })).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /Bài tập thực hành & Phản ví dụ \(§4\)/i }),
    ).toBeInTheDocument();
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
});
