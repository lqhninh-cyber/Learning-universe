import { fireEvent, render, screen } from '@testing-library/react';
import { createRef } from 'react';
import { beforeEach, describe, expect, it, vi, type MockInstance } from 'vitest';
import { FoliageReadingProgress } from './FoliageReadingProgress';

describe('FoliageReadingProgress Component (Vạch tiến độ mầm cây sinh trưởng)', () => {
  let scrollToSpy: MockInstance;
  let scrollIntoViewSpy: MockInstance;

  beforeEach(() => {
    scrollToSpy = vi.spyOn(window, 'scrollTo').mockImplementation(() => {});

    if (!Element.prototype.scrollIntoView) {
      Element.prototype.scrollIntoView = () => {};
    }
    scrollIntoViewSpy = vi.spyOn(Element.prototype, 'scrollIntoView').mockImplementation(() => {});

    // Cho phép requestAnimationFrame chạy đồng bộ trong môi trường kiểm thử
    vi.spyOn(window, 'requestAnimationFrame').mockImplementation((cb) => {
      cb(performance.now());
      return 1;
    });
  });

  it('kết xuất thành công cấu trúc trục thân cây, hạt mầm khởi nguyên và đóa hoa ở chân trục', () => {
    const articleRef = createRef<HTMLElement>();
    render(
      <div>
        <article ref={articleRef} data-reading-article>
          <h2>Mục tiêu bài học</h2>
          <p>Nội dung bài học...</p>
        </article>
        <FoliageReadingProgress articleContainerRef={articleRef} />
      </div>,
    );

    const nav = screen.getByRole('navigation', {
      name: /Vạch tiến độ mầm cây sinh trưởng/i,
    });
    expect(nav).toBeInTheDocument();
    expect(screen.getByTitle('Khởi điểm bài học (0%)')).toBeInTheDocument();
    expect(screen.getByTestId('foliage-bloom-flower')).toBeInTheDocument();
  });

  it('quét các đề mục H2 & H3 trong bài viết và hiển thị tooltip khi hover', () => {
    const articleRef = createRef<HTMLElement>();
    render(
      <div>
        <article ref={articleRef} data-reading-article>
          <h2 id="section-1">1. Khung lý luận sư phạm</h2>
          <p>Nội dung phần 1</p>
          <h3 id="section-2">1.1. Bản chất quá trình giáo dục</h3>
          <p>Nội dung phần 1.1</p>
        </article>
        <FoliageReadingProgress articleContainerRef={articleRef} />
      </div>,
    );

    expect(
      screen.getByLabelText('Chuyển tới đề mục: 1. Khung lý luận sư phạm'),
    ).toBeInTheDocument();
    expect(
      screen.getByLabelText('Chuyển tới đề mục: 1.1. Bản chất quá trình giáo dục'),
    ).toBeInTheDocument();

    // Cả thẻ h2/h3 và thẻ span trong tooltip đều chứa tên đề mục
    expect(screen.getAllByText('1. Khung lý luận sư phạm')).toHaveLength(2);
    expect(screen.getAllByText('1.1. Bản chất quá trình giáo dục')).toHaveLength(2);
    expect(screen.getByText('H2')).toBeInTheDocument();
    expect(screen.getByText('H3')).toBeInTheDocument();
  });

  it('cuộn mượt tới đề mục khi người dùng nhấp vào nụ/mầm lá', () => {
    const articleRef = createRef<HTMLElement>();
    render(
      <div>
        <article ref={articleRef} data-reading-article>
          <h2 id="section-target">Đề mục đích</h2>
        </article>
        <FoliageReadingProgress articleContainerRef={articleRef} />
      </div>,
    );

    const leafNode = screen.getByLabelText('Chuyển tới đề mục: Đề mục đích');
    fireEvent.click(leafNode);

    expect(scrollIntoViewSpy).toHaveBeenCalledWith({
      behavior: 'smooth',
      block: 'start',
    });
  });

  it('nhấp vào thân cây kích hoạt cuộn trang đến vị trí tương ứng', () => {
    const articleRef = createRef<HTMLElement>();
    render(
      <div>
        <article ref={articleRef} data-reading-article style={{ height: '2000px' }}>
          <h2>Tiêu đề</h2>
        </article>
        <FoliageReadingProgress articleContainerRef={articleRef} />
      </div>,
    );

    const track = screen.getByTitle(/Tiến độ đọc: 0% — Bấm để cuộn nhanh/i);
    expect(track).toBeInTheDocument();

    // Mock getBoundingClientRect cho track
    vi.spyOn(track, 'getBoundingClientRect').mockReturnValue({
      top: 100,
      bottom: 600,
      left: 20,
      right: 44,
      width: 24,
      height: 500,
      x: 20,
      y: 100,
      toJSON: () => {},
    });

    fireEvent.click(track, { clientY: 350 }); // click 50%
    expect(scrollToSpy).toHaveBeenCalled();
  });

  it('bung nở đóa hoa sen tri thức khi bài học hoàn thành và không có tag chữ', () => {
    const articleRef = createRef<HTMLElement>();
    render(
      <div>
        <article ref={articleRef} data-reading-article>
          <h2>Bài học kết thúc</h2>
        </article>
        <FoliageReadingProgress articleContainerRef={articleRef} />
      </div>,
    );

    // Tuyệt đối không có tag chữ "Đắc thụ 100%"
    expect(screen.queryByText(/Đắc thụ/i)).not.toBeInTheDocument();

    const flowerBtn = screen.getByTestId('foliage-bloom-flower');
    expect(flowerBtn).toBeInTheDocument();

    // Ban đầu hoa ở trạng thái búp khép kín
    expect(flowerBtn.querySelector('svg')).toHaveClass('scale-75');

    // Giả lập article đã cuộn hết tới đáy
    if (articleRef.current) {
      vi.spyOn(articleRef.current, 'getBoundingClientRect').mockReturnValue({
        top: -1500,
        bottom: 500,
        left: 0,
        right: 800,
        width: 800,
        height: 2000,
        x: 0,
        y: -1500,
        toJSON: () => {},
      });
    }

    // Kích hoạt scroll event
    fireEvent.scroll(window);

    // Tuyệt đối không có tag chữ "Đắc thụ 100%" hay tooltip chữ nào ở cuối
    expect(screen.queryByText(/Đắc thụ/i)).not.toBeInTheDocument();

    // Hoa sen đã chuyển sang trạng thái bung nở viên mãn
    expect(flowerBtn.querySelector('svg')).toHaveClass('scale-100');

    // Bấm đóa hoa để cuộn lên đầu trang
    fireEvent.click(flowerBtn);
    expect(scrollToSpy).toHaveBeenCalledWith({ top: 0, behavior: 'smooth' });
  });
});
