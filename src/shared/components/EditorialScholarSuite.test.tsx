import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { LessonProvider } from '@/content-runtime';
import { Proof } from '@/content-runtime/components/Proof';
import { LessonView, ReadingSpine } from '@/features/courses';
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

  it('kết xuất bố cục bài đọc LessonView chuẩn nền giấy Dó #FAF7F2, khung trắng bg-white rounded-3xl và mục lục bg-white/80', () => {
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
    expect(grid.className).toContain('bg-[#FAF7F2]');
    expect(grid.className).toContain('text-stone-900');
    expect(grid.className).toContain('lg:grid-cols-12');

    const mainCol = screen.getByTestId('scholar-main-column');
    expect(mainCol.className).toContain('bg-white');
    expect(mainCol.className).toContain('rounded-3xl');
    expect(mainCol.className).toContain('border-stone-200/80');
    expect(mainCol.className).toContain('shadow-sm');

    const sidenotesCol = screen.getByTestId('scholar-sidenotes-column');
    expect(sidenotesCol.className).toContain('bg-white/80');
    expect(sidenotesCol.className).toContain('backdrop-blur');
    expect(sidenotesCol.className).toContain('rounded-2xl');

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
});
