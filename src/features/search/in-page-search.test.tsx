import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { useRef, useState } from 'react';
import { MemoryRouter, useLocation } from 'react-router';
import { ReadingSettingsProvider } from '@/context/ReadingSettingsContext';
import { describe, expect, it, vi } from 'vitest';
import { InPageSearchNavigator, useInPageSearch } from '@/features/search';

function InPageTestHarness() {
  const containerRef = useRef<HTMLDivElement>(null);
  const location = useLocation();
  const [exampleOpen, setExampleOpen] = useState(false);

  const inPageSearch = useInPageSearch({
    containerRef,
    contentReadyKey: 'test-ready',
  });

  return (
    <div>
      <div data-testid="current-url">
        {location.pathname}
        {location.search}
        {location.hash}
      </div>

      <InPageSearchNavigator
        query={inPageSearch.query}
        totalMatches={inPageSearch.totalMatches}
        activeIndex={inPageSearch.activeIndex}
        onPrev={inPageSearch.goToPrev}
        onNext={inPageSearch.goToNext}
        onClear={inPageSearch.clearSearch}
      />

      <article ref={containerRef}>
        <section id="dinh-nghia-1-1-1" data-kind="def">
          <h4>Định nghĩa tâm tỉ cự</h4>
          <p>Trong không gian affine, điểm G là tâm tỉ cự của hệ điểm gắn trọng số.</p>
          <span className="katex">
            <span className="katex-html">tâm tỉ cự</span>
          </span>
        </section>

        <details id="vi-du-1-1-1" open={exampleOpen}>
          <summary
            onClick={(e) => {
              e.preventDefault();
              setExampleOpen((prev) => !prev);
            }}
          >
            Ví dụ minh họa trọng tâm
          </summary>
          <div>
            <p>Khi các hệ số bằng nhau, tâm tỉ cự trở thành trọng tâm tam giác.</p>
          </div>
        </details>
      </article>
    </div>
  );
}

describe('useInPageSearch & InPageSearchNavigator', () => {
  it('tự động mở <details> đang đóng, cuộn tới #id và gắn class flash highlight 1.8s', async () => {
    const scrollSpy = vi.fn();
    Element.prototype.scrollIntoView = scrollSpy;

    render(
      <MemoryRouter initialEntries={['/bai-hoc?q=tam+ti+cu#vi-du-1-1-1']}>
        <ReadingSettingsProvider>
          <InPageTestHarness />
        </ReadingSettingsProvider>
      </MemoryRouter>,
    );

    const detailsEl = document.getElementById('vi-du-1-1-1') as HTMLDetailsElement;
    expect(detailsEl).toBeTruthy();

    await waitFor(() => {
      expect(detailsEl.open).toBe(true);
    });

    await waitFor(() => {
      expect(detailsEl.classList.contains('search-flash-highlight')).toBe(true);
      expect(scrollSpy).toHaveBeenCalled();
    });

    // Thanh duyệt phải đếm đủ 3 cụm "tâm tỉ cự" bên ngoài .katex (tự nhảy tới kết quả #3 trong #vi-du-1-1-1) và giữ nguyên .katex
    expect(screen.getByTestId('inpage-search-counter').textContent).toBe('3 / 3 kết quả');
    const katexMarks = document.querySelectorAll('.katex mark');
    expect(katexMarks.length).toBe(0);

    // Nhấn Trước / Sau để nhảy vòng tròn qua các kết quả
    fireEvent.click(screen.getByRole('button', { name: 'Kết quả sau' }));
    expect(screen.getByTestId('inpage-search-counter').textContent).toBe('1 / 3 kết quả');

    fireEvent.click(screen.getByRole('button', { name: 'Kết quả trước' }));
    expect(screen.getByTestId('inpage-search-counter').textContent).toBe('3 / 3 kết quả');

    // Nhấn Xóa highlight sẽ gỡ sạch <mark> và xóa ?q= khỏi URL (giữ #hash)
    fireEvent.click(screen.getByRole('button', { name: 'Xóa highlight' }));
    await waitFor(() => {
      expect(document.querySelectorAll('mark[data-inpage-mark="true"]').length).toBe(0);
      expect(screen.queryByTestId('inpage-search-counter')).not.toBeInTheDocument();
      expect(screen.getByTestId('current-url').textContent).toBe('/bai-hoc#vi-du-1-1-1');
    });
  });
});
