export const INTRO_STORAGE_KEY = 'lu_intro_seen';
export const EVENT_OPEN_INTRO = 'lu_open_intro';

/**
 * Mở lại màn hình "Chạm mặt nước" thủ công từ bất kỳ đâu (Footer, Menu, v.v.)
 */
export function openWaterTouchIntro(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(INTRO_STORAGE_KEY);
  } catch {
    // Bỏ qua lỗi storage
  }
  window.dispatchEvent(new CustomEvent(EVENT_OPEN_INTRO));
}
