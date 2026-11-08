import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { HERITAGE_ARTWORKS, HeritageArtShowcase } from '@/pages/home/HeritageArtShowcase';
import { RotatingScholarlyQuote, SCHOLARLY_QUOTES } from '@/pages/home/RotatingScholarlyQuote';

describe('Home Editorial Components: RotatingScholarlyQuote & HeritageArtShowcase', () => {
  describe('RotatingScholarlyQuote Component', () => {
    it('hiển thị danh ngôn học thuật đầu tiên với đầy đủ nội dung, tác giả và bộ đếm', () => {
      render(<RotatingScholarlyQuote />);

      expect(screen.getByTestId('rotating-scholarly-quote')).toBeInTheDocument();
      expect(screen.getByText(/DANH NGÔN HỌC THUẬT/i)).toBeInTheDocument();
      expect(screen.getByText(/01 \/ 15/i)).toBeInTheDocument();

      // Câu đầu tiên: Hồ Chí Minh
      expect(screen.getByText(new RegExp(SCHOLARLY_QUOTES[0]!.author, 'i'))).toBeInTheDocument();
      expect(screen.getByText(new RegExp(SCHOLARLY_QUOTES[0]!.content, 'i'))).toBeInTheDocument();
    });

    it('có thể chuyển câu danh ngôn khi bấm nút điều khiển', () => {
      render(<RotatingScholarlyQuote />);

      const nextButton = screen.getByRole('button', { name: /Câu danh ngôn tiếp theo/i });
      fireEvent.click(nextButton);

      // Nút điều khiển hoạt động ổn định
      expect(nextButton).toBeInTheDocument();
    });

    it('chứa toàn bộ 15 câu danh ngôn học thuật theo yêu cầu sư phạm', () => {
      expect(SCHOLARLY_QUOTES).toHaveLength(15);
      const authors = SCHOLARLY_QUOTES.map((q) => q.author);
      expect(authors).toContain('Hồ Chí Minh');
      expect(authors).toContain('Karl Marx');
      expect(authors).toContain('V. I. Lênin');
      expect(authors).toContain('J. A. Cômenxki (Comenius)');
      expect(authors).toContain('Thân Nhân Trung');
      expect(authors).toContain('Lê Quý Đôn');
      expect(authors).toContain('Nelson Mandela');
      expect(authors).toContain('Albert Einstein');
      expect(authors).toContain('Friedrich Engels');
      expect(authors).toContain('A. F. Đixtecvec (Diesterweg)');
      expect(authors).toContain('Aristotle');
      expect(authors).toContain('Galileo Galilei');
      expect(authors).toContain('René Descartes');
      expect(authors).toContain('Khổng Tử');
      expect(authors).toContain('Phạm Văn Đồng');
    });
  });

  describe('HeritageArtShowcase Component', () => {
    it('hiển thị tác phẩm di sản đầu tiên kèm chú giải học thuật và hình ảnh', () => {
      render(<HeritageArtShowcase />);

      expect(screen.getByTestId('heritage-art-showcase')).toBeInTheDocument();
      expect(screen.getByText(/DI SẢN HỌC THUẬT & NGHỆ THUẬT/i)).toBeInTheDocument();
      expect(screen.getByText(/01 \/ 05/i)).toBeInTheDocument();

      // Tác phẩm 1: Thầy đồ Cóc
      expect(screen.getByText(new RegExp(HERITAGE_ARTWORKS[0]!.title, 'i'))).toBeInTheDocument();
      expect(
        screen.getAllByText(new RegExp(HERITAGE_ARTWORKS[0]!.artistOrOrigin, 'i')).length,
      ).toBeGreaterThan(0);
      expect(screen.getByAltText(HERITAGE_ARTWORKS[0]!.alt)).toBeInTheDocument();
    });

    it('có thể chuyển đổi tác phẩm khi bấm nút lật trang hoặc nút chọn', () => {
      render(<HeritageArtShowcase />);

      const nextButton = screen.getByRole('button', { name: /Tác phẩm tiếp theo/i });
      fireEvent.click(nextButton);

      expect(nextButton).toBeInTheDocument();

      const artwork2Button = screen.getByRole('button', {
        name: /Chuyển đến tác phẩm 2: Khuê Văn Các/i,
      });
      fireEvent.click(artwork2Button);
      expect(artwork2Button).toBeInTheDocument();
    });

    it('chứa toàn bộ 5 tác phẩm di sản đích thực theo yêu cầu', () => {
      expect(HERITAGE_ARTWORKS).toHaveLength(5);
      const ids = HERITAGE_ARTWORKS.map((a) => a.id);
      expect(ids).toContain('thay-do-coc');
      expect(ids).toContain('khue-van-cac');
      expect(ids).toContain('melencolia-i');
      expect(ids).toContain('truong-hoc-athena');
      expect(ids).toContain('nguoi-vitruvius');
    });
  });
});
