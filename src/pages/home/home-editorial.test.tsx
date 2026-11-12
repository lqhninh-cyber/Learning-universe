import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { describe, expect, it } from 'vitest';
import { HeroPhysicsCanvas } from '@/components/home/HeroPhysicsCanvas';
import { HeroSonHaDiorama } from '@/components/home/HeroSonHaDiorama';
import { getSubjects } from '@/content-runtime';
import { ArchivalIndexView } from '@/pages/home/ArchivalIndexView';
import { HERITAGE_ARTWORKS, HeritageArtShowcase } from '@/pages/home/HeritageArtShowcase';
import { HomePage } from '@/pages/home/HomePage';
import { KnowledgeThread, KNOWLEDGE_THREAD_STATIONS } from '@/pages/home/KnowledgeThread';
import { QuickKaTeXDrawer } from '@/pages/home/QuickKaTeXDrawer';
import { RotatingScholarlyQuote, SCHOLARLY_QUOTES } from '@/pages/home/RotatingScholarlyQuote';
import { ViewModeToggle } from '@/pages/home/ViewModeToggle';

describe('Home Editorial Components & Scholarly Upgrades', () => {
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

    it('cụm tác giả được căn phải với định dạng "— [Tên Tác Giả] · [Chức danh / Xuất xứ]"', () => {
      const { container } = render(<RotatingScholarlyQuote />);

      // Khối bọc tác giả căn phải với border-t
      const authorContainer = container.querySelector(
        '.w-full.flex.justify-end.items-center.mt-2.pt-2',
      );
      expect(authorContainer).toBeInTheDocument();

      const authorFooter = container.querySelector('footer.text-right.font-mono.text-xs');
      expect(authorFooter).toBeInTheDocument();
      expect(authorFooter?.textContent).toContain(`— ${SCHOLARLY_QUOTES[0]!.author}`);
      expect(authorFooter?.textContent).toContain(`· ${SCHOLARLY_QUOTES[0]!.roleOrEra}`);
    });

    it('có thể chuyển câu danh ngôn khi bấm nút điều khiển', () => {
      render(<RotatingScholarlyQuote />);

      const nextButton = screen.getByRole('button', { name: /Câu danh ngôn tiếp theo/i });
      fireEvent.click(nextButton);

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
      expect(screen.getByText(/01 \/ 15/i)).toBeInTheDocument();

      // Tác phẩm 1: Thầy đồ Cóc
      expect(screen.getByRole('heading', { name: /Thầy đồ Cóc/i })).toBeInTheDocument();
      expect(
        screen.getAllByText(new RegExp(HERITAGE_ARTWORKS[0]!.artistOrOrigin, 'i')).length,
      ).toBeGreaterThan(0);
      expect(screen.getByAltText(HERITAGE_ARTWORKS[0]!.alt)).toBeInTheDocument();
    });

    it('khung tranh sạch sẽ, chỉ chứa duy nhất ảnh tranh, không có nhãn che hoặc kính lúp', () => {
      const { container } = render(<HeritageArtShowcase />);

      const frame = screen.getByTestId('heritage-art-frame');
      expect(frame.className).toContain('h-[350px]');
      expect(frame.className).toContain('md:h-[425px]');
      expect(frame.className).toContain('xl:h-[460px]');

      // Khung chứa tranh không còn kính lúp overlay
      expect(screen.queryByTestId('archival-zoom-lens')).not.toBeInTheDocument();
      expect(screen.queryByText(/Kính lúp khảo sát/i)).not.toBeInTheDocument();

      // Khung chỉ chứa duy nhất thẻ ảnh img
      const imgs = frame.querySelectorAll('img');
      expect(imgs).toHaveLength(1);
      expect(imgs[0]?.className).toContain('object-contain');

      // Nhãn thời gian & địa danh đã được chuyển ra ngoài khung tranh xuống hàng metadata
      const metaBadge = container.querySelector(
        '.inline-flex.items-center.rounded-md.bg-\\[\\#EBECE6\\], .inline-flex.items-center.rounded-md.bg-\\[\\#E1E9EA\\]',
      );
      expect(metaBadge).toBeInTheDocument();
      expect(metaBadge?.textContent).toContain(HERITAGE_ARTWORKS[0]!.yearOrEra);
    });

    it('Khuê Văn Các sử dụng ảnh kiến trúc đích thực, không nhầm ảnh skyline đô thị', () => {
      const khueVanCac = HERITAGE_ARTWORKS.find((a) => a.id === 'khue-van-cac');
      expect(khueVanCac).toBeDefined();
      expect(khueVanCac?.imageSrc).toContain('Khu%C3%AA_v%C4%83n_c%C3%A1c.jpg');
      expect(khueVanCac?.imageSrc).not.toContain('unsplash');
    });

    it('bấm [Lược sử tác phẩm] mở rộng hồ sơ văn khố với đầy đủ thông số', () => {
      render(<HeritageArtShowcase />);

      const trigger = screen.getByTestId('archival-metadata-trigger');
      expect(screen.queryByTestId('archival-metadata-popover')).not.toBeInTheDocument();

      fireEvent.click(trigger);
      expect(screen.getByTestId('archival-metadata-popover')).toBeInTheDocument();
      expect(screen.getByText(/HỒ SƠ LƯỢC SỬ & VĂN KHỐ TÁC PHẨM/i)).toBeInTheDocument();
      expect(screen.getByText(/Niên đại & Thời kỳ/i)).toBeInTheDocument();
      expect(screen.getByText(/Chất liệu & Kỹ thuật/i)).toBeInTheDocument();
      expect(screen.getByText(/Nơi lưu trữ gốc/i)).toBeInTheDocument();
      expect(screen.getByText(/Giá trị học thuật cốt lõi/i)).toBeInTheDocument();
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

    it('chứa toàn bộ 15 tác phẩm di sản đích thực theo yêu cầu', () => {
      expect(HERITAGE_ARTWORKS).toHaveLength(15);
      const ids = HERITAGE_ARTWORKS.map((a) => a.id);
      expect(ids).toEqual([
        'thay-do-coc',
        'khue-van-cac',
        'melencolia-i',
        'truong-hoc-athena',
        'nguoi-vitruvius',
        'bia-tien-si',
        'trong-dong-ngoc-lu',
        'euclid-elements-1482',
        'nguoi-chiem-tinh',
        'de-divina-proportione',
        'ban-do-hong-duc',
        'tuong-quan-am-but-thap',
        'copernicus-1543',
        'kepler-1596',
        'chua-mot-cot-1049',
      ]);

      const ngocLu = HERITAGE_ARTWORKS.find((a) => a.id === 'trong-dong-ngoc-lu');
      expect(ngocLu).toBeDefined();
      expect(ngocLu?.imageSrc).toContain('Ngoc_Lu.jpg');
      expect(ngocLu?.imageSrc).not.toContain('.svg');
    });

    it('hiển thị bộ đếm tác phẩm dạng 01 / 15', () => {
      render(<HeritageArtShowcase />);
      expect(screen.getByText('01 / 15')).toBeInTheDocument();
    });
  });

  describe('KnowledgeThread Component & Floral Bloom Animation', () => {
    it('hiển thị SVG đường dẫn The Knowledge Thread và các trạm mốc', () => {
      render(
        <KnowledgeThread
          pageScrollProgress={0}
          leadTip={{ x: 720, y: 140 }}
          prefersReducedMotion={false}
        />,
      );

      expect(screen.getByTestId('the-knowledge-thread')).toBeInTheDocument();
      expect(KNOWLEDGE_THREAD_STATIONS).toHaveLength(4);

      KNOWLEDGE_THREAD_STATIONS.forEach((station) => {
        expect(
          screen.getByTestId(`knowledge-thread-station-${station.threshold}`),
        ).toBeInTheDocument();
      });
    });

    it('kích hoạt hiệu ứng hoa sen bung nở (Authentic Lotus Bloom) khi cuộn tới trạm', () => {
      // Khi pageScrollProgress = 0.35 (chạm tới trạm thứ 2: threshold 0.32)
      render(
        <KnowledgeThread
          pageScrollProgress={0.35}
          leadTip={{ x: 1120, y: 860 }}
          prefersReducedMotion={false}
        />,
      );

      const station2 = screen.getByTestId('knowledge-thread-station-0.32');
      expect(station2).toBeInTheDocument();

      const bloomGroup = station2.querySelector('[data-testid="floral-bloom-group"]');
      expect(bloomGroup).toBeInTheDocument();
      expect(bloomGroup?.getAttribute('transform')).toContain('scale(1)');
      expect(bloomGroup?.getAttribute('opacity')).toBe('1');

      // 6 cánh hoa lớn lớp ngoài xòe rộng với gradient lotusOuterPetal
      const outerPetals = station2.querySelectorAll('path[fill="url(#lotusOuterPetal)"]');
      expect(outerPetals.length).toBe(6);

      // 4 cánh hoa nhỏ lớp trong ôm nhẹ với gradient lotusInnerPetal
      const innerPetals = station2.querySelectorAll('path[fill="url(#lotusInnerPetal)"]');
      expect(innerPetals.length).toBe(4);

      // Tâm đài sen tròn màu vàng nhụy (lotusCore) với 5 chấm li ti biểu trưng hạt sen
      const core = station2.querySelector('circle[fill="url(#lotusCore)"]');
      expect(core).toBeInTheDocument();

      const seeds = station2.querySelectorAll('circle[fill="#5A4010"]');
      expect(seeds.length).toBe(5);

      // Có vòng phát xung animate-ping khi đang bung nở
      const pingRing = station2.querySelector('.animate-ping');
      expect(pingRing).toBeInTheDocument();

      // Kiểm tra trạm 1 (threshold 0.02) đã chuyển sang trạng thái Settled Bloom (opacity-45 scale-95)
      const station1 = screen.getByTestId('knowledge-thread-station-0.02');
      const settledBloom1 = station1.querySelector('[data-testid="floral-bloom-group"]');
      expect(settledBloom1?.getAttribute('transform')).toContain('scale(0.95)');
      expect(settledBloom1?.getAttribute('opacity')).toBe('0.45');
    });

    it('hỗ trợ chế độ giảm chuyển động prefers-reduced-motion', () => {
      render(
        <KnowledgeThread
          pageScrollProgress={0.5}
          leadTip={{ x: 1120, y: 860 }}
          prefersReducedMotion={true}
        />,
      );

      // Ở chế độ reduced motion, trạm đã cuộn qua (station 1, 2) hiển thị tĩnh, không có vòng animate-ping
      const pingRings = document.querySelectorAll('.animate-ping');
      expect(pingRings).toHaveLength(0);
    });
  });

  describe('QuickKaTeXDrawer Component', () => {
    it('hiển thị bảng tra cứu KaTeX, các tab phân loại và ô tìm kiếm khi mở', () => {
      render(
        <MemoryRouter>
          <QuickKaTeXDrawer isOpen={true} onClose={() => {}} />
        </MemoryRouter>,
      );

      expect(screen.getByTestId('quick-katex-drawer-panel')).toBeInTheDocument();
      expect(screen.getByText(/Tra cứu Thuật ngữ & Ký hiệu KaTeX/i)).toBeInTheDocument();
      expect(screen.getByPlaceholderText(/Tìm tên thuật ngữ/i)).toBeInTheDocument();

      // Các tab phân loại
      expect(screen.getByRole('tab', { name: /Tất cả/i })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: /Đại số/i })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: /Hình học/i })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: /Giải tích/i })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: /Logic/i })).toBeInTheDocument();

      // Nút đóng
      expect(screen.getByRole('button', { name: /Đóng \(Esc\)/i })).toBeInTheDocument();
    });

    it('có thể lọc ký hiệu theo từ khóa tìm kiếm', () => {
      render(
        <MemoryRouter>
          <QuickKaTeXDrawer isOpen={true} onClose={() => {}} />
        </MemoryRouter>,
      );

      const searchInput = screen.getByPlaceholderText(/Tìm tên thuật ngữ/i);
      fireEvent.change(searchInput, { target: { value: 'Newton' } });

      expect(screen.getByText(/Công thức Newton – Leibniz/i)).toBeInTheDocument();
      expect(screen.queryByText(/Định lý Đẳng cấu thứ nhất/i)).not.toBeInTheDocument();
    });
  });

  describe('ViewModeToggle & ArchivalIndexView Components', () => {
    it('ViewModeToggle cho phép chuyển đổi giữa Atlas và Archival Index', () => {
      let currentMode = 'atlas';
      const handleModeChange = (next: string) => {
        currentMode = next;
      };

      const { rerender } = render(<ViewModeToggle mode="atlas" onChange={handleModeChange} />);

      const archivalBtn = screen.getByRole('button', {
        name: /Văn khố Thư mục/i,
      });
      fireEvent.click(archivalBtn);
      expect(currentMode).toBe('archival');

      rerender(<ViewModeToggle mode="archival" onChange={handleModeChange} />);
      const atlasBtn = screen.getByRole('button', {
        name: /Bản đồ Không gian/i,
      });
      fireEvent.click(atlasBtn);
      expect(currentMode).toBe('atlas');
    });

    it('ArchivalIndexView hiển thị 4 học phần chuyên khảo và cây thư mục', () => {
      const subjects = getSubjects();
      render(
        <MemoryRouter>
          <ArchivalIndexView subjects={subjects} activeBranch="all" externalQuery="" />
        </MemoryRouter>,
      );

      expect(screen.getByTestId('archival-index-view')).toBeInTheDocument();
      expect(screen.getByTestId('archival-module-cau-truc-dai-so')).toBeInTheDocument();
      expect(screen.getByTestId('archival-module-hinh-hoc-affine')).toBeInTheDocument();
      expect(screen.getByTestId('archival-module-giai-tich-ham-mot-bien')).toBeInTheDocument();
      expect(screen.getByTestId('archival-module-giao-duc-hoc')).toBeInTheDocument();
      expect(screen.queryByText(/MATH1301|MATH1302|MATH1303|EDUC2802/i)).not.toBeInTheDocument();

      // Có các bộ lọc CLO
      expect(screen.getByRole('button', { name: /CLO1/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /CLO6/i })).toBeInTheDocument();
    });
  });

  describe('HomePage Integration with Scholarly Upgrades', () => {
    it('hiển thị đầy đủ chế độ Atlas với SubjectWatermarkSignature và mở KaTeX Drawer khi tương tác', () => {
      render(
        <MemoryRouter>
          <HomePage />
        </MemoryRouter>,
      );

      // Hero
      expect(screen.getByText(/Đi một ngày đàng/i)).toBeInTheDocument();
      expect(screen.getByText(/học một sàng khôn/i)).toBeInTheDocument();

      // Dấu ấn chìm môn học trong chế độ Atlas
      expect(screen.getByTestId('subject-watermark-cau-truc-dai-so')).toBeInTheDocument();
      expect(screen.getByTestId('subject-watermark-hinh-hoc-affine')).toBeInTheDocument();
      expect(screen.getByTestId('subject-watermark-giai-tich-ham-mot-bien')).toBeInTheDocument();
      expect(screen.getByTestId('subject-watermark-giao-duc-hoc')).toBeInTheDocument();

      // Nút ViewModeToggle
      expect(screen.getByTestId('homepage-view-mode-toggle')).toBeInTheDocument();

      // Bấm vào CTA Tra cứu thuật ngữ KaTeX mở Drawer
      const katexTrigger = screen.getByRole('link', { name: /Tra cứu thuật ngữ KaTeX/i });
      fireEvent.click(katexTrigger);

      expect(screen.getByTestId('quick-katex-drawer-panel')).toBeInTheDocument();
    });

    it('khóa cố định duy nhất cảnh quan Vịnh Hạ Long, ẩn bộ chuyển đổi cảnh quan, dải chữ đáy và Hán tự', () => {
      render(
        <MemoryRouter>
          <HomePage />
        </MemoryRouter>,
      );

      const diorama = screen.getByTestId('son-ha-diorama');
      expect(diorama).toHaveAttribute('data-landscape', 'vinh-ha-long');
      expect(screen.queryByTestId('atmosphere-switcher')).not.toBeInTheDocument();
      expect(screen.queryByTestId('atmosphere-option-dawn')).not.toBeInTheDocument();
      expect(screen.queryByTestId('atmosphere-option-night')).not.toBeInTheDocument();
      expect(screen.getByTestId('dong-son-star-motif')).toBeInTheDocument();
      expect(screen.getByTestId('hon-trong-mai')).toBeInTheDocument();
      expect(screen.getByTestId('halong-junk-boat-far')).toBeInTheDocument();
      expect(screen.getByTestId('halong-junk-boat-near')).toBeInTheDocument();
      expect(screen.queryByTestId('cinnabar-imperial-seal')).not.toBeInTheDocument();
      expect(screen.queryByText(/TOÁN HỌC & KHOA HỌC GIÁO DỤC · HCMUE/i)).not.toBeInTheDocument();
      expect(screen.queryByText(/04 HỌC PHẦN · 123 BÀI GIẢNG/i)).not.toBeInTheDocument();
      expect(screen.queryByText(/Ruộng Bậc Thang/i)).not.toBeInTheDocument();
      expect(screen.queryByText(/Hang Sơn Đoòng/i)).not.toBeInTheDocument();
    });
  });

  describe('Hero Diorama, Physics Canvas & 3D Stack Components', () => {
    it('HeroSonHaDiorama render đủ 4 lớp Karst Vịnh Hạ Long, Hòn Trống Mái, Thuyền buồm cánh dơi và HeroPhysicsCanvas', () => {
      const { container } = render(
        <div className="relative h-96 w-full">
          <HeroSonHaDiorama />
          <HeroPhysicsCanvas />
        </div>,
      );

      for (let i = 1; i <= 4; i += 1) {
        expect(container.querySelector(`[data-testid="son-ha-layer-${i}"]`)).toBeInTheDocument();
      }
      expect(screen.getByTestId('hon-trong-mai')).toBeInTheDocument();
      expect(screen.getByTestId('halong-junk-boat-far')).toBeInTheDocument();
      expect(screen.getByTestId('halong-junk-boat-near')).toBeInTheDocument();
      expect(screen.getByTestId('hero-physics-canvas')).toBeInTheDocument();
    });

    it('HeritageArtShowcase cố định thẻ thẳng góc (rotate-0), nút bấm h-8 w-8 rounded-full và chuyển tác phẩm mượt', async () => {
      render(<HeritageArtShowcase />);

      const activeCard = screen.getByTestId('heritage-active-card');
      expect(activeCard).toHaveClass('rotate-0');
      expect(screen.getByRole('button', { name: 'Tác phẩm tiếp theo' })).toHaveClass(
        'h-8',
        'w-8',
        'rounded-full',
      );
      expect(screen.getByTestId('heritage-ambient-glow')).toBeInTheDocument();
      expect(screen.getByTestId('heritage-stack-card-2')).toBeInTheDocument();
      expect(screen.getByTestId('heritage-stack-card-3')).toBeInTheDocument();
      expect(screen.getByTestId('heritage-foil-glare')).toBeInTheDocument();
      const expectedTotal = String(HERITAGE_ARTWORKS.length).padStart(2, '0');
      expect(screen.getByText(new RegExp(`01 / ${expectedTotal}`))).toBeInTheDocument();

      fireEvent.click(screen.getByTestId('heritage-stack-card-2'));
      expect(await screen.findByText(new RegExp(`02 / ${expectedTotal}`))).toBeInTheDocument();
      expect(
        screen.getAllByText(new RegExp(HERITAGE_ARTWORKS[1]!.title, 'i')).length,
      ).toBeGreaterThan(0);
    });
  });
});
