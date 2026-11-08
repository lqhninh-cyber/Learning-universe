import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Sidenote, SidenoteProvider, type SidenoteType } from './Sidenote';

describe('Sidenote (Academic Marginalia - Tufte/Distill Standard)', () => {
  it('kết xuất thành công các phân loại: history, caution, pedagogy, figure, note', () => {
    const types: SidenoteType[] = ['history', 'caution', 'pedagogy', 'figure', 'note'];

    const { rerender } = render(
      <Sidenote type="history" number={1}>
        Lagrange công bố vào năm 1777.
      </Sidenote>,
    );

    expect(screen.getAllByText('Lịch sử').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Lagrange công bố vào năm 1777.').length).toBeGreaterThanOrEqual(1);

    for (const t of types) {
      rerender(
        <Sidenote type={t} number={2}>
          Nội dung kiểm thử phân loại {t}
        </Sidenote>,
      );
      expect(screen.getAllByText(`Nội dung kiểm thử phân loại ${t}`).length).toBeGreaterThanOrEqual(
        1,
      );
    }
  });

  it('áp dụng chuẩn màu viền Mist Blue & Sage theo từng loại: caution (#9E3D24), pedagogy (#718C7E), figure (#CFDADB)', () => {
    render(
      <div>
        <Sidenote type="caution" number={1}>
          Cảnh báo chiều ngược lại.
        </Sidenote>
        <Sidenote type="pedagogy" number={2}>
          Liên hệ thực tiễn sư phạm phổ thông.
        </Sidenote>
        <Sidenote type="figure" number={3} caption="Hình 1.1: Sơ đồ phân hoạch">
          <svg data-testid="micro-diagram" />
        </Sidenote>
      </div>,
    );

    const cautionNotes = screen.getAllByRole('note');
    expect(cautionNotes[0]?.className).toContain('border-[#9E3D24]');
    expect(cautionNotes[1]?.className).toContain('border-[#718C7E]');
    expect(cautionNotes[2]?.className).toContain('border-[#CFDADB]');
    expect(screen.getByText('Hình 1.1: Sơ đồ phân hoạch')).toBeInTheDocument();
    expect(screen.getByTestId('micro-diagram')).toBeInTheDocument();
  });

  it('tự động đánh số liên tục 1, 2, 3 khi đặt trong SidenoteProvider', () => {
    render(
      <SidenoteProvider>
        <p>
          Đoạn 1 <Sidenote type="note">Ghi chú thứ nhất</Sidenote>
        </p>
        <p>
          Đoạn 2 <Sidenote type="history">Ghi chú thứ hai</Sidenote>
        </p>
        <p>
          Đoạn 3 <Sidenote type="caution">Ghi chú thứ ba</Sidenote>
        </p>
      </SidenoteProvider>,
    );

    expect(screen.getAllByText('[1]').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('[2]').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('[3]').length).toBeGreaterThanOrEqual(1);
  });

  it('trên di động (< lg): nhấn vào badge mở panel nổi mờ Collapsible Callout và nhấn ✕ để đóng', () => {
    render(
      <Sidenote type="caution" number="★" title="Lưu ý quan trọng">
        Không áp dụng định lý này cho nhóm vô hạn cấp.
      </Sidenote>,
    );

    // Ban đầu panel di động đóng
    expect(screen.queryByRole('region')).not.toBeInTheDocument();

    // Nhấp vào nút badge di động [★]
    const toggleButton = screen.getByRole('button', {
      name: /Mở chú giải số ★: Lưu ý quan trọng/i,
    });
    fireEvent.click(toggleButton);

    // Panel xuất hiện
    const panel = screen.getByRole('region', { name: /Nội dung chú giải số ★/i });
    expect(panel).toBeInTheDocument();
    expect(panel).toHaveTextContent('Không áp dụng định lý này cho nhóm vô hạn cấp.');

    // Nhấp vào nút ✕ để đóng
    const closeBtn = screen.getByRole('button', { name: /Đóng chú giải/i });
    fireEvent.click(closeBtn);
    expect(screen.queryByRole('region')).not.toBeInTheDocument();
  });

  it('trên màn hình lớn (lg:): có class clear-both w-full để không chèn ép bảng biểu và khối nội dung chính', () => {
    render(
      <p>
        Văn bản học thuật <Sidenote number={1}>Nội dung lề 1</Sidenote> và tiếp tục đoạn văn{' '}
        <Sidenote number={2}>Nội dung lề 2</Sidenote>
      </p>,
    );

    const notes = screen.getAllByRole('note');
    expect(notes.length).toBe(2);
    expect(notes[0]?.className).toContain('clear-both');
    expect(notes[0]?.className).toContain('w-full');
    expect(notes[0]?.className).toContain('sidenote-academic');
    expect(notes[1]?.className).toContain('clear-both');
    expect(notes[1]?.className).toContain('w-full');
  });

  it('đồng bộ trạng thái hover giữa số mũ trong dòng và khối chú giải lề', () => {
    const { container } = render(
      <Sidenote number={1} type="history">
        Chi tiết lịch sử toán học
      </Sidenote>,
    );

    const wrapper = container.querySelector('.academic-sidenote-wrapper');
    expect(wrapper).toBeInTheDocument();

    if (wrapper) {
      fireEvent.mouseEnter(wrapper);
      const desktopNote = screen.getByRole('note');
      expect(desktopNote.className).toContain('shadow-xs');

      fireEvent.mouseLeave(wrapper);
    }
  });
});
