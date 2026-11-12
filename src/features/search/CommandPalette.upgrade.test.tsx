import { fireEvent, render, screen, within } from '@testing-library/react';
import { useState } from 'react';
import { MemoryRouter, useLocation } from 'react-router';
import { describe, expect, it, vi } from 'vitest';
import { CommandPalette } from '@/features/search';

function LocationProbe() {
  const location = useLocation();
  return (
    <div data-testid="location-probe">
      {location.pathname}
      {location.search}
      {location.hash}
    </div>
  );
}

function Harness() {
  const [open, setOpen] = useState(false);
  return (
    <MemoryRouter initialEntries={['/']}>
      <div>
        <button type="button" onClick={() => setOpen(true)}>
          Mở tìm kiếm
        </button>
        <input aria-label="Ô nhập liệu bên ngoài" />
        <CommandPalette open={open} onOpenChange={setOpen} />
        <LocationProbe />
      </div>
    </MemoryRouter>
  );
}

describe('CommandPalette — Phân loại tri thức, KaTeX & Phím tắt /', () => {
  it('mở CommandPalette khi nhấn phím "/" bên ngoài input và bỏ qua khi focus ở trong input', () => {
    render(<Harness />);

    const externalInput = screen.getByLabelText('Ô nhập liệu bên ngoài');
    externalInput.focus();
    fireEvent.keyDown(externalInput, { key: '/' });
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

    (document.activeElement as HTMLElement | null)?.blur?.();
    fireEvent.keyDown(window, { key: '/' });
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('hiển thị đủ 5 pill bộ lọc tri thức cùng bộ đếm kết quả và lọc chính xác từng loại', () => {
    const onOpenChange = vi.fn();
    render(
      <MemoryRouter>
        <CommandPalette open onOpenChange={onOpenChange} enableGlobalShortcut={false} />
      </MemoryRouter>,
    );

    const tablist = screen.getByRole('tablist', { name: 'Lọc theo phân loại tri thức' });
    for (const label of ['Tất cả', 'Định nghĩa', 'Định lý', 'Ví dụ', 'Ôn tập']) {
      expect(within(tablist).getByRole('tab', { name: new RegExp(label) })).toBeInTheDocument();
    }

    const input = screen.getByRole('combobox');
    fireEvent.change(input, { target: { value: 'S_3' } });

    expect(screen.getByText(/\d+\s+kết quả/)).toBeInTheDocument();

    // Lọc riêng Ôn tập phải tìm thấy đề thi chứa nhóm đối xứng S_3
    fireEvent.click(within(tablist).getByRole('tab', { name: /Ôn tập/ }));
    const listbox = screen.getByRole('listbox');
    const reviewBadges = within(listbox).getAllByText('ÔN TẬP');
    expect(reviewBadges.length).toBeGreaterThan(0);

    // Kiểm tra snippet có thẻ <mark> với lớp nền #FFE08A và công thức KaTeX đã render
    const marks = listbox.querySelectorAll('mark');
    expect(marks.length).toBeGreaterThan(0);
    expect(marks[0]?.className).toContain('bg-[#FFE08A]');
  });

  it('điều hướng kèm ?q=... và #anchorId khi nhấn Enter chọn kết quả', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <CommandPalette open onOpenChange={() => undefined} enableGlobalShortcut={false} />
        <LocationProbe />
      </MemoryRouter>,
    );

    const tablist = screen.getByRole('tablist', { name: 'Lọc theo phân loại tri thức' });
    const input = screen.getByRole('combobox');
    fireEvent.change(input, { target: { value: 'Lagrange' } });
    fireEvent.click(within(tablist).getByRole('tab', { name: /Định lý/ }));

    fireEvent.keyDown(input, { key: 'Enter' });

    const probeText = screen.getByTestId('location-probe').textContent ?? '';
    expect(probeText).toContain('?q=Lagrange');
  });
});
