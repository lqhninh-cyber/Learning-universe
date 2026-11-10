import { act, fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';
import {
  FONT_SIZE_LABELS,
  ReadingSettingsProvider,
  useReadingSettings,
} from './ReadingSettingsContext';

function TestConsumer() {
  const {
    theme,
    toggleTheme,
    fontFamily,
    toggleFontFamily,
    fontSize,
    increaseFontSize,
    decreaseFontSize,
    isZenMode,
    toggleZenMode,
    typographyClasses,
  } = useReadingSettings();

  return (
    <div>
      <span data-testid="theme-val">{theme}</span>
      <button data-testid="theme-btn" onClick={toggleTheme}>
        Toggle Theme
      </button>

      <span data-testid="font-val">{fontFamily}</span>
      <button data-testid="font-btn" onClick={toggleFontFamily}>
        Toggle Font
      </button>

      <span data-testid="size-val">{fontSize}</span>
      <span data-testid="size-label">{FONT_SIZE_LABELS[fontSize]}</span>
      <button data-testid="size-inc" onClick={increaseFontSize}>
        Inc
      </button>
      <button data-testid="size-dec" onClick={decreaseFontSize}>
        Dec
      </button>

      <span data-testid="zen-val">{String(isZenMode)}</span>
      <button data-testid="zen-btn" onClick={toggleZenMode}>
        Toggle Zen
      </button>

      <span data-testid="typo-classes">{typographyClasses}</span>
    </div>
  );
}

describe('ReadingSettingsContext', () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.classList.remove('dark');
    document.body.removeAttribute('data-zen-mode');
  });

  it('khởi tạo với các giá trị mặc định chính xác', () => {
    render(
      <ReadingSettingsProvider>
        <TestConsumer />
      </ReadingSettingsProvider>,
    );

    expect(screen.getByTestId('theme-val').textContent).toBe('light');
    expect(screen.getByTestId('font-val').textContent).toBe('serif');
    expect(screen.getByTestId('size-val').textContent).toBe('base');
    expect(screen.getByTestId('size-label').textContent).toBe('Vừa');
    expect(screen.getByTestId('zen-val').textContent).toBe('false');
    expect(screen.getByTestId('typo-classes').textContent).toContain('font-serif');
    expect(screen.getByTestId('typo-classes').textContent).toContain('text-[17px]');
    expect(document.documentElement.classList.contains('dark')).toBe(false);
  });

  it('chuyển đổi theme và đồng bộ class dark lên html và localStorage', () => {
    render(
      <ReadingSettingsProvider>
        <TestConsumer />
      </ReadingSettingsProvider>,
    );

    const themeBtn = screen.getByTestId('theme-btn');
    act(() => {
      fireEvent.click(themeBtn);
    });

    expect(screen.getByTestId('theme-val').textContent).toBe('dark');
    expect(document.documentElement.classList.contains('dark')).toBe(true);
    expect(localStorage.getItem('lu_reading_theme')).toBe('dark');

    act(() => {
      fireEvent.click(themeBtn);
    });

    expect(screen.getByTestId('theme-val').textContent).toBe('light');
    expect(document.documentElement.classList.contains('dark')).toBe(false);
    expect(localStorage.getItem('lu_reading_theme')).toBe('light');
  });

  it('chuyển đổi phông chữ giữa Serif và Sans và cập nhật typographyClasses', () => {
    render(
      <ReadingSettingsProvider>
        <TestConsumer />
      </ReadingSettingsProvider>,
    );

    const fontBtn = screen.getByTestId('font-btn');
    act(() => {
      fireEvent.click(fontBtn);
    });

    expect(screen.getByTestId('font-val').textContent).toBe('sans');
    expect(screen.getByTestId('typo-classes').textContent).toContain('font-sans');
    expect(localStorage.getItem('lu_reading_font_family')).toBe('sans');

    act(() => {
      fireEvent.click(fontBtn);
    });

    expect(screen.getByTestId('font-val').textContent).toBe('serif');
    expect(screen.getByTestId('typo-classes').textContent).toContain('font-serif');
  });

  it('tăng/giảm cỡ chữ đúng 4 mức (sm, base, lg, xl) và không vượt quá giới hạn biên', () => {
    render(
      <ReadingSettingsProvider>
        <TestConsumer />
      </ReadingSettingsProvider>,
    );

    const incBtn = screen.getByTestId('size-inc');
    const decBtn = screen.getByTestId('size-dec');

    // Mặc định: base -> Lớn
    act(() => {
      fireEvent.click(incBtn);
    });
    expect(screen.getByTestId('size-val').textContent).toBe('lg');
    expect(screen.getByTestId('size-label').textContent).toBe('Lớn');
    expect(screen.getByTestId('typo-classes').textContent).toContain('text-[19px]');

    // Lớn -> Đại (xl)
    act(() => {
      fireEvent.click(incBtn);
    });
    expect(screen.getByTestId('size-val').textContent).toBe('xl');
    expect(screen.getByTestId('size-label').textContent).toBe('Đại');
    expect(screen.getByTestId('typo-classes').textContent).toContain('text-[21px]');

    // Bấm tăng tiếp không vượt quá xl
    act(() => {
      fireEvent.click(incBtn);
    });
    expect(screen.getByTestId('size-val').textContent).toBe('xl');

    // Giảm: xl -> lg -> base -> sm
    act(() => {
      fireEvent.click(decBtn);
    });
    expect(screen.getByTestId('size-val').textContent).toBe('lg');

    act(() => {
      fireEvent.click(decBtn);
    });
    expect(screen.getByTestId('size-val').textContent).toBe('base');

    act(() => {
      fireEvent.click(decBtn);
    });
    expect(screen.getByTestId('size-val').textContent).toBe('sm');
    expect(screen.getByTestId('size-label').textContent).toBe('Nhỏ');
    expect(screen.getByTestId('typo-classes').textContent).toContain('text-[15px]');

    // Bấm giảm tiếp không vượt quá sm
    act(() => {
      fireEvent.click(decBtn);
    });
    expect(screen.getByTestId('size-val').textContent).toBe('sm');
  });

  it('bật/tắt chế độ Zen Mode và đồng bộ data-zen-mode lên body', () => {
    render(
      <ReadingSettingsProvider>
        <TestConsumer />
      </ReadingSettingsProvider>,
    );

    const zenBtn = screen.getByTestId('zen-btn');
    act(() => {
      fireEvent.click(zenBtn);
    });

    expect(screen.getByTestId('zen-val').textContent).toBe('true');
    expect(document.body.getAttribute('data-zen-mode')).toBe('true');
    expect(localStorage.getItem('lu_zen_mode')).toBe('true');

    act(() => {
      fireEvent.click(zenBtn);
    });

    expect(screen.getByTestId('zen-val').textContent).toBe('false');
    expect(document.body.getAttribute('data-zen-mode')).toBeNull();
  });
});
