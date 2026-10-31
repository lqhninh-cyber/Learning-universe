import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import type { BibliographyEntry } from '@schemas/index';
import {
  Cite,
  Definition,
  getLessonById,
  getLessonBySlug,
  getManifest,
  getSubjects,
  LessonMdxView,
  LessonProvider,
  loadLessonModule,
} from '@/content-runtime';
import { TooltipProvider } from '@/shared/ui';

describe('Giai đoạn 2 — Runtime Content Engine, KaTeX & Academic Components', () => {
  it('giữ content/_shared/bibliography.yaml rỗng và không tự tạo giáo trình trong content/', () => {
    const manifest = getManifest();
    expect(manifest.bibliography).toEqual([]);

    for (const subject of getSubjects()) {
      expect(subject.sources.primary).toBeNull();
      expect(subject.sources.references).toEqual([]);
    }
  });

  it('nạp và hiển thị bài học mẫu Cấu trúc đại số với đầy đủ số hiệu, KaTeX, Ref và Proof', async () => {
    const user = userEvent.setup();
    const location = getLessonBySlug('algebraic-structures', 'nhom', 'dinh-nghia-nhom');
    expect(location).toBeDefined();
    expect(getLessonById('dinh-nghia-nhom')?.lesson.title).toBe(
      'Định nghĩa Nhóm và các tính chất cơ bản',
    );

    const compiled = await loadLessonModule('dinh-nghia-nhom');
    expect(compiled.lessonMeta.blocks.map((b) => b.label)).toEqual([
      'Định nghĩa 1.1.1',
      'Định nghĩa 1.1.2',
      'Mệnh đề 1.1.3',
      'Định lý 1.1.4',
      'Hệ quả 1.1.5',
      'Ví dụ 1.1.1',
      'Phản ví dụ 1.1.2',
      'Bài tập 1.1.1',
    ]);

    const { container } = render(
      <LessonMdxView Content={compiled.default} lessonMeta={compiled.lessonMeta} />,
    );

    // Kiểm tra KaTeX đã sinh MathML và hiển thị tiếng Việt trong \text{...}
    expect(container.querySelector('.katex-mathml')).not.toBeNull();
    expect(container.textContent).toContain('với mọi');

    // Kiểm tra các nhãn khối đã đánh số tự động (bao gồm cả thẻ khối và tham chiếu <Ref />)
    expect(screen.getByText('Định nghĩa 1.1.1')).toBeInTheDocument();
    expect(screen.getAllByText('Định lý 1.1.4').length).toBeGreaterThanOrEqual(2);
    expect(screen.getByText('Ví dụ 1.1.1')).toBeInTheDocument();
    expect(screen.getByText('Phản ví dụ 1.1.2')).toBeInTheDocument();
    expect(screen.getByText('Bài tập 1.1.1')).toBeInTheDocument();

    // Kiểm tra tham chiếu chéo <Ref to="def-nhom" />
    const refLinks = screen.getAllByRole('link', { name: 'Định nghĩa 1.1.2' });
    expect(refLinks.length).toBeGreaterThan(0);
    expect(refLinks[0]).toHaveAttribute('href', '#def-nhom');

    // Kiểm tra đóng/mở chứng minh của Mệnh đề 1.1.3
    const proofTrigger = screen.getByRole('button', {
      name: /Chứng minh \(Mệnh đề 1\.1\.3\)/i,
    });
    await user.click(proofTrigger);
    expect(screen.getAllByLabelText('Kết thúc chứng minh').length).toBeGreaterThan(0);
  });

  it('nạp và hiển thị bài học mẫu Hình học Affine với macro \\Aff và \\vect', async () => {
    const compiled = await loadLessonModule('khong-gian-affine');
    expect(compiled.lessonMeta.blocks.map((b) => b.label)).toEqual([
      'Định nghĩa 1.1.1',
      'Bổ đề 1.1.2',
      'Định lý 1.1.3',
      'Ví dụ 1.1.1',
      'Bài tập 1.1.1',
    ]);

    const { container } = render(
      <LessonMdxView Content={compiled.default} lessonMeta={compiled.lessonMeta} />,
    );

    expect(container.querySelector('.katex-mathml')).not.toBeNull();
    expect(screen.getByText('Quy tắc hình bình hành trong không gian Affine')).toBeInTheDocument();
  });

  it('hiển thị đối chiếu nguồn giáo trình và <Cite /> khi dùng dữ liệu fixture', () => {
    const fixtureBib: readonly BibliographyEntry[] = [
      {
        id: 'nguon-kiem-thu',
        type: 'textbook',
        title: '[DỮ LIỆU KIỂM THỬ] Giáo trình giả lập',
        authors: ['Tác giả kiểm thử'],
        year: 2000,
        publisher: 'Nhà xuất bản kiểm thử',
      },
    ];

    render(
      <TooltipProvider>
        <LessonProvider bibliography={fixtureBib}>
          <Definition
            id="def-fixture"
            number="1.1.1"
            anchorId="def-fixture"
            title="Khái niệm kiểm thử"
            original="Định nghĩa 1.1"
            source="nguon-kiem-thu"
            page="10"
          >
            Nội dung tham khảo <Cite source="nguon-kiem-thu" page="10" />.
          </Definition>
        </LessonProvider>
      </TooltipProvider>,
    );

    expect(
      screen.getByText('Định nghĩa 1.1 · Tác giả kiểm thử (2000) · tr. 10'),
    ).toBeInTheDocument();
    expect(screen.getByText('[Tác giả kiểm thử, 2000, tr. 10]')).toBeInTheDocument();
  });
});
