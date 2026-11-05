import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import type { BibliographyEntry } from '@schemas/index';
import {
  Chapter0KnowledgeMap,
  Chapter6KnowledgeMap,
  Chapter7KnowledgeMap,
  Cite,
  Definition,
  getLessonById,
  getLessonBySlug,
  getManifest,
  getSubjects,
  LessonMdxView,
  LessonProvider,
  loadLessonModule,
  MermaidChart,
} from '@/content-runtime';
import { TooltipProvider } from '@/shared/ui';

describe('Giai đoạn 2 — Runtime Content Engine, KaTeX & Academic Components', () => {
  it('nạp đúng thư mục tài liệu và nguồn giáo trình đã khai báo', () => {
    const manifest = getManifest();
    expect(manifest.bibliography.length).toBeGreaterThanOrEqual(1);
    expect(manifest.bibliography.some((b) => b.id === 'gt-ctds-hvk-2026')).toBe(true);

    const ctds = getSubjects().find((s) => s.id === 'algebraic-structures');
    expect(ctds?.sources.primary).toBe('gt-ctds-hvk-2026');

    const affine = getSubjects().find((s) => s.id === 'affine-geometry');
    expect(affine?.sources.primary).toBe('gt-hhcc-nmh-2004');
  });

  it('nạp và hiển thị bài học mẫu Cấu trúc đại số với đầy đủ số hiệu, KaTeX, Ref và Proof', async () => {
    const user = userEvent.setup();
    const location = getLessonBySlug(
      'algebraic-structures',
      'nhom-va-cac-vi-du-co-ban',
      'nua-nhom-vi-nhom-va-tien-de-nhom',
    );
    expect(location).toBeDefined();
    expect(getLessonById('nua-nhom-vi-nhom-va-tien-de-nhom')?.lesson.title).toBe(
      'Nửa nhóm, vị nhóm, nhóm và các hệ quả đầu tiên',
    );

    const compiled = await loadLessonModule('nua-nhom-vi-nhom-va-tien-de-nhom');
    expect(compiled.lessonMeta.blocks.map((b) => b.label)).toEqual([
      'Định nghĩa 1.1.1',
      'Ví dụ 1.1.1',
      'Phản ví dụ 1.1.2',
      'Định lý 1.1.2',
      'Hệ quả 1.1.3',
      'Bài tập 1.1.1',
      'Bài tập 1.1.2',
      'Bài tập 1.1.3',
      'Bài tập 1.1.4',
    ]);

    const { container } = render(
      <LessonMdxView Content={compiled.default} lessonMeta={compiled.lessonMeta} />,
    );

    // Kiểm tra KaTeX đã sinh MathML và hiển thị tiếng Việt trong \text{...}
    expect(container.querySelector('.katex-mathml')).not.toBeNull();
    expect(container.textContent).toContain('với mọi');

    // Kiểm tra các nhãn khối đã đánh số tự động (bao gồm cả thẻ khối và tham chiếu <Ref />)
    expect(screen.getAllByText('Định nghĩa 1.1.1').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Định lý 1.1.2').length).toBeGreaterThanOrEqual(2);
    expect(screen.getByText('Ví dụ 1.1.1')).toBeInTheDocument();
    expect(screen.getByText('Phản ví dụ 1.1.2')).toBeInTheDocument();
    expect(screen.getByText('Bài tập 1.1.1')).toBeInTheDocument();

    // Kiểm tra tham chiếu chéo <Ref to="def-c1-b1-nua-nhom-vi-nhom-nhom" />
    const refLinks = screen.getAllByRole('link', { name: 'Định nghĩa 1.1.1' });
    expect(refLinks.length).toBeGreaterThan(0);
    expect(refLinks[0]).toHaveAttribute('href', '#def-c1-b1-nua-nhom-vi-nhom-nhom');

    // Kiểm tra đóng/mở chứng minh của Hệ quả 1.1.3
    const proofTrigger = screen.getByRole('button', {
      name: /Chứng minh \(Hệ quả 1\.1\.3\)/i,
    });
    await user.click(proofTrigger);
    expect(screen.getAllByLabelText('Kết thúc chứng minh').length).toBeGreaterThan(0);
  }, 30000);

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

  it('kết xuất khung Bản đồ tri thức chuẩn mực, không còn nút xem mã nguồn và không còn khối text thô', () => {
    const mermaidCode = `flowchart TD
      A["Vành"] --> B["Miền nguyên"]
      B --> C["Trường"]`;

    render(<MermaidChart chart={mermaidCode} />);

    // Kiểm tra đã kết xuất khung Bản đồ tri thức với tiêu đề mặc định
    expect(screen.getByTestId('mermaid-chart')).toBeInTheDocument();
    expect(screen.getByText('Bản đồ tri thức')).toBeInTheDocument();

    // Không còn nút chuyển đổi xem mã nguồn
    expect(screen.queryByRole('button', { name: /Xem mã nguồn/i })).toBeNull();
    // Không còn hộp đen pre code hiển thị cú pháp thô
    expect(screen.queryByText(/flowchart TD/)).toBeNull();
  });

  it('kết xuất thành công Bản đồ tri thức native Chương 0 (Chapter0KnowledgeMap) với 4 tầng khái niệm', () => {
    render(<Chapter0KnowledgeMap />);

    expect(screen.getByTestId('chapter0-knowledge-map')).toBeInTheDocument();
    expect(screen.getByText(/TẦNG 1 · ĐỐI TƯỢNG & QUAN HỆ CƠ SỞ/i)).toBeInTheDocument();
    expect(screen.getByText(/TẦNG 2 · CƠ CHẾ PHÂN HOẠCH & TẬP THƯƠNG/i)).toBeInTheDocument();
    expect(screen.getByText(/TẦNG 3 · TRỌNG TÂM ĐẠI SỐ: TÍNH XÁC ĐỊNH TỐT/i)).toBeInTheDocument();
    expect(screen.getByText(/TẦNG 4 · HAI NHÁNH PHÂN CẤP KẾT QUẢ/i)).toBeInTheDocument();
    expect(screen.getByText(/Chương 0 · Ngôn ngữ & Công cụ Đại số/i)).toBeInTheDocument();
  });

  it('kết xuất thành công Bản đồ tri thức native Chương 6 (Chapter6KnowledgeMap) với 4 tầng logic', () => {
    render(<Chapter6KnowledgeMap />);

    expect(screen.getByTestId('chapter6-knowledge-map')).toBeInTheDocument();
    expect(screen.getByText(/TẦNG 1 · NỀN TẢNG HAI PHÉP TOÁN/i)).toBeInTheDocument();
    expect(screen.getByText(/TẦNG 2 · VÀNH TỔNG QUÁT \(RING\)/i)).toBeInTheDocument();
    expect(screen.getByText(/TẦNG 3 · THANG BẬC PHÂN HÓA CẤU TRÚC/i)).toBeInTheDocument();
    expect(screen.getByText(/TẦNG 4 · ĐỈNH CAO CẤU TRÚC — TRƯỜNG \(FIELD\)/i)).toBeInTheDocument();
    expect(screen.getByText(/Chương 6 · Vành & các Cấu trúc/i)).toBeInTheDocument();
  });

  it('kết xuất thành công Bản đồ tri thức native Chương 7 (Chapter7KnowledgeMap) với 4 khối cấu trúc', () => {
    render(<Chapter7KnowledgeMap />);

    expect(screen.getByTestId('chapter7-knowledge-map')).toBeInTheDocument();
    expect(screen.getByText('1. Khái niệm & Phép toán Iđêan')).toBeInTheDocument();
    expect(screen.getByText('2. Vành thương & Tính toán')).toBeInTheDocument();
    expect(screen.getByText('3. Phân loại Iđêan (R giao hoán có 1)')).toBeInTheDocument();
    expect(screen.getByText('4. Các Định lý Sâu sắc')).toBeInTheDocument();
    expect(screen.getByText('Chương 7 · Cấu trúc đại số')).toBeInTheDocument();
  });

  it('nạp và kết xuất thành công bài tổng kết Chương 0, Chương 6 và Chương 7', async () => {
    // 1. Kiểm tra Bài tổng kết Chương 0 (Native Knowledge Map)
    const moduleC0 = await loadLessonModule('bai-tap-va-tong-ket-chuong-0');
    expect(moduleC0).toBeDefined();
    const { container: containerC0 } = render(
      <LessonMdxView Content={moduleC0.default} lessonMeta={moduleC0.lessonMeta} />,
    );
    expect(containerC0.querySelector('[data-testid="chapter0-knowledge-map"]')).not.toBeNull();

    // 2. Kiểm tra Bài tổng kết Chương 6 (Native Knowledge Map)
    const moduleC6 = await loadLessonModule('bai-tap-va-tong-ket-chuong-6');
    expect(moduleC6).toBeDefined();
    const { container: containerC6 } = render(
      <LessonMdxView Content={moduleC6.default} lessonMeta={moduleC6.lessonMeta} />,
    );
    expect(containerC6.querySelector('[data-testid="chapter6-knowledge-map"]')).not.toBeNull();

    // 3. Kiểm tra Bài tổng kết Chương 7 (Native Knowledge Map)
    const moduleC7 = await loadLessonModule('bai-tap-va-tong-ket-chuong-7');
    expect(moduleC7).toBeDefined();
    const { container: containerC7 } = render(
      <LessonMdxView Content={moduleC7.default} lessonMeta={moduleC7.lessonMeta} />,
    );
    expect(containerC7.querySelector('[data-testid="chapter7-knowledge-map"]')).not.toBeNull();
  });
});
