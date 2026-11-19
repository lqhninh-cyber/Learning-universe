import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { describe, expect, it, vi } from 'vitest';
import {
  ATMOSPHERIC_PALETTES,
  interpolateAtmospherePalette,
} from '@/components/home/atmosphereThemes';
import { ChladniManifestoSection } from '@/components/home/ChladniManifestoSection';
import {
  PIPELINE_LAYER_NAMES,
  buildAtmosphereSpriteCache,
  createAtmosphereWorld,
  renderAtmosphereFrame,
  spawnHarmonicContourPulse,
  spawnShootingStar,
} from '@/components/home/heroAtmosphereEngine';
import {
  angleLerp,
  ARMILLARY_RINGS,
  BLUEPRINT_SYMBOLS,
  CORE_TIER1_SCALE,
  formatAlidadeAngle,
  HARMONIC_WAVE_POINTS,
  ICO_FACES,
  ICO_TIER1_SCALE,
  ICO_VERTICES,
  LIGHT_DIR,
  SHININESS_BLINN,
  SPHERICAL_WAVE_TRIG,
  WORLD_R_DIAL,
} from '@/components/home/heroSculptureGeometry';
import {
  buildHeroTerrainGeometry,
  buildHeroTerrainLayerCache,
} from '@/components/home/heroTerrainBuilder';
import { HeroPhysicsCanvas } from '@/components/home/HeroPhysicsCanvas';
import { HeroSonHaDiorama } from '@/components/home/HeroSonHaDiorama';
import { SubjectStageCanvas } from '@/components/home/SubjectStageCanvas';
import { getSubjects } from '@/content-runtime';
import { ArchivalIndexView } from '@/pages/home/ArchivalIndexView';
import { HERITAGE_ARTWORKS, HeritageArtShowcase } from '@/pages/home/HeritageArtShowcase';
import { HomePage } from '@/pages/home/HomePage';
import { KnowledgeThread, KNOWLEDGE_THREAD_STATIONS } from '@/pages/home/KnowledgeThread';
import { QuickKaTeXDrawer } from '@/pages/home/QuickKaTeXDrawer';
import { RotatingScholarlyQuote, SCHOLARLY_QUOTES } from '@/pages/home/RotatingScholarlyQuote';
import { ViewModeToggle } from '@/pages/home/ViewModeToggle';
import { LearningSpacePage } from '@/pages/learning-space/LearningSpacePage';

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
      expect(screen.getByText(/01 \/ 32/i)).toBeInTheDocument();

      // Tác phẩm 1 mặc định: Khuê Văn Các (không chứa Hán tự)
      expect(screen.getByRole('heading', { name: /Khuê Văn Các/i })).toBeInTheDocument();
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
        name: /Chuyển đến tác phẩm 2: Thầy đồ Cóc/i,
      });
      fireEvent.click(artwork2Button);
      expect(artwork2Button).toBeInTheDocument();
    });

    it('chứa toàn bộ 32 tác phẩm di sản đích thực theo yêu cầu (Khuê Văn Các đầu tiên)', () => {
      expect(HERITAGE_ARTWORKS).toHaveLength(32);
      const ids = HERITAGE_ARTWORKS.map((a) => a.id);
      expect(ids).toEqual([
        'khue-van-cac',
        'thay-do-coc',
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
        'dai-thanh-toan-phap',
        'lap-thanh-toan-phap',
        'thap-but-dai-nghien-1865',
        'ngo-mon-dien-thai-hoa',
        'cuu-dinh-hoang-cung-hue',
        'truong-quoc-hoc-hue-1896',
        'hoang-thanh-thang-long',
        'thap-cham-my-son',
        'thap-pho-minh',
        'rhind-mathematical-papyrus',
        'archimedes-palimpsest',
        'gac-chuong-chua-keo-1632',
        'la-geometrie-descartes',
        'principia-mathematica-newton',
        'disquisitiones-arithmeticae-gauss',
        'moc-ban-quoc-tu-giam-trieu-nguyen',
        'dai-hoc-dong-duong-1906',
      ]);

      const ngocLu = HERITAGE_ARTWORKS.find((a) => a.id === 'trong-dong-ngoc-lu');
      expect(ngocLu).toBeDefined();
      expect(ngocLu?.imageSrc).toContain('Ngoc_Lu.jpg');
      expect(ngocLu?.imageSrc).not.toContain('.svg');
    });

    it('hiển thị bộ đếm tác phẩm dạng 01 / 32', () => {
      render(<HeritageArtShowcase />);
      expect(screen.getByText('01 / 32')).toBeInTheDocument();
    });

    it('hiển thị SVG minh họa học thuật sắc nét khi ảnh 03 / 32 (Melencolia I) gặp lỗi tải và khóa chữ tương phản cao', async () => {
      render(<HeritageArtShowcase />);

      const art3Dot = screen.getByRole('button', {
        name: /Chuyển đến tác phẩm 3:.*Melencolia I/i,
      });
      fireEvent.click(art3Dot);

      expect(await screen.findByText('03 / 32')).toBeInTheDocument();
      const heading = screen.getByRole('heading', { name: /Melencolia I/i });
      expect(heading.className).toContain('text-[#F8F6F0]');

      const img = screen.getByAltText(HERITAGE_ARTWORKS[2]!.alt);
      fireEvent.error(img);

      const svgFallback = screen.getByTestId('heritage-svg-fallback');
      expect(svgFallback).toBeInTheDocument();
      expect(svgFallback.querySelector('svg')).toBeInTheDocument();
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

  describe('LearningSpacePage & HomePage Integration with Scholarly Upgrades', () => {
    it('LearningSpacePage hiển thị Sanctuary Banner chuẩn hóa, khối 3D thuần trang trí, Spotlight Hover, Biểu đồ Radar và Mạng lưới Liên kết Tri thức', () => {
      render(
        <MemoryRouter>
          <LearningSpacePage />
        </MemoryRouter>,
      );

      expect(
        screen.getByRole('heading', { level: 1, name: /^Không Gian Học Tập$/i }),
      ).toBeInTheDocument();
      expect(screen.getByText(/ACADEMIC SANCTUARY · HỆ THỐNG HỌC PHẦN$/i)).toBeInTheDocument();
      const statStrip = screen.getByTestId('hero-unified-stat-strip');
      expect(statStrip).toHaveTextContent(/04 học phần/i);
      expect(statStrip).toHaveTextContent(/\d+ chương · \d+ bài giảng/i);
      expect(statStrip).toHaveTextContent(/Tiến độ cá nhân:\s*\d+%/i);
      expect(screen.queryByText(/học phần cốt lõi/i)).not.toBeInTheDocument();
      expect(screen.getByText(/^HỆ THỐNG HỌC PHẦN$/i)).toBeInTheDocument();
      expect(screen.queryByText(/SPATIAL SUBJECT GALLERY/i)).not.toBeInTheDocument();

      // Khối Điêu khắc Đa diện & Thiên cầu 3D thuần trang trí (không còn nút pill 01. CTĐS .. 04. GDH)
      expect(screen.getByTestId('learning-space-celestial-rings')).toBeInTheDocument();
      expect(screen.queryByTestId('orbital-subject-node-cau-truc-dai-so')).not.toBeInTheDocument();
      expect(screen.queryByTestId('orbital-subject-node-hinh-hoc-affine')).not.toBeInTheDocument();
      expect(
        screen.queryByTestId('orbital-subject-node-giai-tich-ham-mot-bien'),
      ).not.toBeInTheDocument();
      expect(screen.queryByTestId('orbital-subject-node-giao-duc-hoc')).not.toBeInTheDocument();

      // Khung minh họa môn học tinh khiết, không nhãn mô tả góc
      expect(screen.queryByText(/CAYLEY · ĐỐI XỨNG NHÓM/i)).not.toBeInTheDocument();
      expect(screen.queryByText(/HYPERBOLOID · MỤC TIÊU AFFINE/i)).not.toBeInTheDocument();
      expect(screen.queryByText(/TAYLOR · TÍCH PHÂN RIEMANN/i)).not.toBeInTheDocument();
      expect(screen.queryByText(/Kéo để xoay 3D/i)).not.toBeInTheDocument();

      expect(screen.getByTestId('topographic-waterlines')).toBeInTheDocument();
      expect(screen.getByTestId('golden-compass-spine')).toBeInTheDocument();

      // Dấu ấn chìm môn học, quầng sáng Spotlight & đủ lưới 4 môn học 2 cột trong chế độ Atlas
      const atlasGrid = screen.getByTestId('atlas-subjects-grid');
      expect(atlasGrid).toHaveClass('grid-cols-1', 'md:grid-cols-2', 'gap-7');
      expect(screen.getByTestId('subject-watermark-cau-truc-dai-so')).toBeInTheDocument();
      expect(screen.getByTestId('subject-watermark-hinh-hoc-affine')).toBeInTheDocument();
      expect(screen.getByTestId('subject-watermark-giai-tich-ham-mot-bien')).toBeInTheDocument();
      expect(screen.getByTestId('subject-watermark-giao-duc-hoc')).toBeInTheDocument();
      expect(screen.getByTestId('card-spotlight-cau-truc-dai-so')).toBeInTheDocument();
      expect(
        screen.getByRole('link', { name: /Vào học phần Cấu trúc đại số/i }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole('link', { name: /Vào học phần Hình học Affine/i }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole('link', { name: /Vào học phần Giải tích hàm một biến/i }),
      ).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /Vào học phần Giáo dục học/i })).toBeInTheDocument();

      // Nút ViewModeToggle & Quick search chips & Hệ kiến trúc fx tinh gọn (Unified Stat Strip, không còn fluted-glass gây sọc)
      expect(screen.getByTestId('homepage-view-mode-toggle')).toBeInTheDocument();
      expect(screen.getByTestId('quick-search-chips')).toBeInTheDocument();
      const heroFrame = screen.getByTestId('hero-blueprint-frame');
      expect(heroFrame).toBeInTheDocument();
      // Hero chỉ giữ đúng 4 dấu + kim loại ở 4 góc ngoài cùng (không trùng cặp ở đường ngăn dưới DOC. LU-2026)
      expect(heroFrame.querySelectorAll('svg[width="12"][height="12"]')).toHaveLength(4);
      expect(screen.getByTestId('engraved-ground-canvas')).toBeInTheDocument();
      expect(screen.getByTestId('hero-eyebrow-badge')).toBeInTheDocument();
      expect(screen.queryByTestId('hero-eyebrow-fluted')).not.toBeInTheDocument();
      expect(screen.queryByTestId('fluted-glass-surface')).not.toBeInTheDocument();
      expect(screen.getByTestId('hero-unified-stat-strip')).toBeInTheDocument();
      expect(screen.getByTestId('architectural-band')).toBeInTheDocument();
      expect(screen.getByTestId('atlas-blueprint-frame')).toBeInTheDocument();
      expect(screen.getByTestId('orbit-blueprint-frame')).toBeInTheDocument();
      expect(screen.getByText(/DOC\. LU-2026 \/\/ ACADEMIC SANCTUARY/i)).toBeInTheDocument();
      // Chỉ giữ duy nhất 1 bộ đếm tọa độ XY ở thanh Telemetry trên cùng Hero (không lặp lại ở SPECIMEN ATLAS)
      expect(screen.getAllByTestId('telemetry-pointer-coords')).toHaveLength(1);
      // Xóa nhãn thừa 3D.STAGE // 120FPS và khóa overflow-hidden trên cả 4 sân khấu học phần
      expect(screen.queryByText(/3D\.STAGE \/\/ 120FPS/i)).not.toBeInTheDocument();
      expect(screen.getByTestId('subject-stage-giao-duc-hoc')).toHaveClass('overflow-hidden');
      expect(screen.getByText(/SPECIMEN № 01 \/\/ ALGEBRAIC STRUCTURES/)).toBeInTheDocument();
      expect(screen.getByTestId('stage-vertical-ruler-cau-truc-dai-so')).toBeInTheDocument();
      expect(screen.getByTestId('almanac-chapter-index-cau-truc-dai-so')).toBeInTheDocument();
      expect(screen.getByTestId('axiom-band-toggle')).toBeInTheDocument();
      expect(screen.getAllByTestId('specimen-fx-bars').length).toBeGreaterThanOrEqual(4);

      fireEvent.click(screen.getByRole('button', { name: 'Định lý Lagrange' }));
      expect(screen.getByTestId('spotlight-search-popover')).toBeInTheDocument();

      expect(screen.getByTestId('subject-progress-badge-cau-truc-dai-so')).toBeInTheDocument();
      expect(screen.getByTestId('subject-footer-progress-cau-truc-dai-so')).toHaveTextContent(
        /Tiến độ:\s*\d+%/,
      );
      const roadmapToggle = screen.getByTestId('roadmap-toggle-cau-truc-dai-so');
      fireEvent.click(roadmapToggle);
      expect(screen.getByTestId('roadmap-drawer-cau-truc-dai-so')).toBeInTheDocument();

      expect(screen.getByTestId('learning-bento-grid')).toBeInTheDocument();
      expect(screen.getByTestId('up-next-queue')).toBeInTheDocument();
      const matrixCard = screen.getByTestId('progress-matrix-4-subjects');
      expect(matrixCard).toBeInTheDocument();
      expect(matrixCard).toHaveTextContent(/Ma Trận Tiến Độ & Phân Bố 4 Học Phần/i);

      // Không còn 2 thẻ tiện ích cũ và không còn dải màu tối cuối trang
      expect(
        screen.queryByRole('heading', { name: /Ngân hàng Thuật ngữ KaTeX/i }),
      ).not.toBeInTheDocument();
      expect(
        screen.queryByRole('heading', { name: /Phòng Lab Hình học 3D/i }),
      ).not.toBeInTheDocument();
      expect(screen.queryByTestId('learning-space-footer-transition')).not.toBeInTheDocument();

      // Mô hình 1 & Mô hình 2: Biểu đồ Radar Năng lực & Mạng lưới Liên kết Tri thức tương tác
      expect(screen.getByTestId('curriculum-radar-card')).toBeInTheDocument();
      fireEvent.click(screen.getByTestId('radar-axis-hinh-hoc-affine'));
      expect(screen.getByTestId('radar-detail-panel')).toHaveTextContent(/Không gian & Biến hình/i);

      expect(screen.getByTestId('knowledge-constellation-card')).toBeInTheDocument();
      fireEvent.click(screen.getByTestId('constellation-node-polynomial-series'));
      expect(screen.getByTestId('constellation-insight-panel')).toHaveTextContent(
        /Vành đa thức & Chuỗi lũy thừa/i,
      );
    });

    it('HomePage tái cấu trúc 3 màn hình Bạch Ngọc Khoáng Thạch liền mạch: Hero Bình Minh -> Bảo tàng Di sản sáng -> Tuyên ngôn × Đài Chladni', async () => {
      render(
        <MemoryRouter>
          <HomePage />
        </MemoryRouter>,
      );

      // Hero Screen 1
      expect(screen.getByText(/Đi một ngày đàng/i)).toBeInTheDocument();
      expect(screen.getByText(/học một sàng khôn/i)).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /Khám phá Không gian học tập/i })).toHaveAttribute(
        'href',
        '/learning-space',
      );
      expect(screen.getByRole('link', { name: /Thưởng lãm Di sản/i })).toHaveAttribute(
        'href',
        '#khong-gian-di-san',
      );

      const diorama = screen.getByTestId('son-ha-diorama');
      const canvas = screen.getByTestId('hero-physics-canvas');
      expect(diorama).toHaveAttribute('data-landscape', 'hoang-lien-son');
      expect(diorama).toHaveAttribute('data-phase', 'binh-minh-bach-ngoc');
      expect(canvas).toHaveAttribute('data-phase', 'binh-minh-bach-ngoc');
      expect(screen.getByTestId('hero-text-contrast-scrim')).toBeInTheDocument();

      // Đã xóa bỏ hoàn toàn thanh chọn THỜI KHẮC
      expect(screen.queryByTestId('atmospheric-time-dial')).not.toBeInTheDocument();
      expect(screen.queryByText(/Đêm Ngân Hà/i)).not.toBeInTheDocument();

      expect(screen.getByTestId('dong-son-star-motif')).toBeInTheDocument();
      expect(screen.getByTestId('fansipan-peaks')).toHaveAttribute(
        'data-terrain-mode',
        'topographic-dong-son-6layer',
      );
      expect(screen.queryByTestId('hoang-lien-cranes')).not.toBeInTheDocument();
      expect(canvas).toHaveAttribute('data-pipeline-layers', '6');
      expect(canvas).toHaveAttribute('data-landscape-style', 'topographic-dong-son');
      expect(screen.getByTestId('hero-text-contrast-scrim')).toBeInTheDocument();
      expect(screen.getByTestId('hero-quote-contrast-scrim')).toBeInTheDocument();
      expect(screen.getByTestId('hero-bottom-mist-transition')).toBeInTheDocument();
      expect(screen.getByTestId('quote-progress-bar')).toBeInTheDocument();
      expect(screen.getByTestId('quote-discipline-badge')).toHaveTextContent(/Triết học Giáo dục/i);

      // Screen 2 — Phòng Trưng Bày Di Sản Bảo Tàng Thạch Cao Sáng (#khong-gian-di-san)
      const showcase = screen.getByTestId('heritage-art-showcase');
      expect(showcase).toHaveAttribute('id', 'khong-gian-di-san');
      expect(showcase.className).toContain('bg-[#EEF2F0]');
      expect(showcase.className).toContain('pt-28');
      expect(showcase.className).toContain('scroll-mt-24');
      expect(showcase.textContent).toContain('Khuê Văn Các');
      expect(showcase.textContent).not.toMatch(/[\u4E00-\u9FFF]/);
      expect(screen.getByTestId('heritage-filmstrip')).toBeInTheDocument();

      // Không còn dải lọc phân loại cũ; thay bằng Thanh Điều Khiển Trình Chiếu Trung Tâm + Filmstrip 32 tác phẩm
      expect(
        screen.queryByRole('tablist', { name: /Phân loại tác phẩm di sản/i }),
      ).not.toBeInTheDocument();

      // Bảo đảm 32 tác phẩm không trùng id, tiêu đề hay imageSrc
      expect(HERITAGE_ARTWORKS).toHaveLength(32);
      expect(new Set(HERITAGE_ARTWORKS.map((item) => item.id)).size).toBe(32);
      expect(new Set(HERITAGE_ARTWORKS.map((item) => item.title)).size).toBe(32);
      expect(new Set(HERITAGE_ARTWORKS.map((item) => item.imageSrc)).size).toBe(32);

      const controlBar = screen.getByTestId('heritage-control-bar');
      expect(controlBar).toBeInTheDocument();
      expect(screen.getByTestId('heritage-index-indicator')).toHaveTextContent('01 / 32');
      expect(screen.getByRole('button', { name: /Tác phẩm trước/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Tác phẩm tiếp/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Cuộn danh mục sang trái/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Cuộn danh mục sang phải/i })).toBeInTheDocument();

      // Kiểm tra mục 16 (Đại thành Toán pháp) dùng bản vẽ điển tịch Giấy Dó SVG nội bộ (không ảnh thẻ tre)
      const daiThanhBtn = screen.getByRole('button', {
        name: /Chọn tác phẩm 16: Đại thành Toán pháp/i,
      });
      fireEvent.click(daiThanhBtn);
      expect(await screen.findByTestId('heritage-svg-fallback')).toBeInTheDocument();

      // Chọn trực tiếp tác phẩm thứ 32 (Đại học Đông Dương 1906) trên dải Filmstrip & mở Lightbox
      const dongDuongBtn = screen.getByRole('button', {
        name: /Chọn tác phẩm 32: Đại học Đông Dương/i,
      });
      fireEvent.click(dongDuongBtn);
      await waitFor(() => {
        expect(screen.getByTestId('heritage-index-indicator')).toHaveTextContent('32 / 32');
      });
      fireEvent.click(screen.getByRole('button', { name: /Phóng to tác phẩm/i }));
      expect(screen.getByRole('dialog')).toBeInTheDocument();
      fireEvent.click(screen.getByRole('button', { name: /Đóng xem toàn màn hình/i }));
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

      // Cầu nối sương mượt Screen 1->2 và Screen 3 Tuyên ngôn × Đài cộng hưởng Chladni (không còn Hồ Sen)
      const shoreline = screen.getByTestId('shoreline-wave-bridge');
      expect(shoreline).toBeInTheDocument();
      expect(shoreline.querySelector('svg')).toHaveAttribute('viewBox', '0 0 1440 140');
      expect(screen.queryByTestId('lakeshore-lotus-transition')).not.toBeInTheDocument();
      expect(screen.queryByLabelText(/Đại cảnh Hồ Sen Tri Thức/i)).not.toBeInTheDocument();

      const chladniSection = screen.getByTestId('chladni-manifesto-section');
      expect(chladniSection).toBeInTheDocument();
      expect(screen.getByText(/SEC\. 03 \/\/ KIẾN TRÚC TRI THỨC/i)).toBeInTheDocument();
      expect(
        screen.getByRole('heading', { name: /Khi trực giác hình học gặp gỡ chiều sâu tiên đề\./i }),
      ).toBeInTheDocument();
      expect(screen.getByTestId('chladni-resonance-canvas')).toBeInTheDocument();
      expect(screen.getByTestId('chladni-footer-seam')).toBeInTheDocument();
      expect(screen.getByTestId('chladni-mode-indicator')).toHaveTextContent('(m, n) =(3, 5)');

      fireEvent.click(screen.getByRole('button', { name: 'Đông Sơn (6, 9)' }));
      expect(screen.getByTestId('chladni-mode-indicator')).toHaveTextContent('(m, n) =(6, 9)');
      expect(screen.getByRole('link', { name: /Bước vào Không gian học tập/i })).toHaveAttribute(
        'href',
        '/learning-space',
      );
      expect(screen.getByRole('link', { name: /Khám phá Kho Thuật ngữ/i })).toHaveAttribute(
        'href',
        '/thuat-ngu',
      );
    });
  });

  describe('Hero Diorama, Physics Canvas & Sơn Thủy Trắc Địa + Thiên Cầu Đông Sơn Engine', () => {
    it('HeroSonHaDiorama & HeroPhysicsCanvas vận hành chuẩn 5 tầng núi sương mù, 24-28 đồng mức 0.75px, Thiên Cầu Đông Sơn & tương tác 120fps', () => {
      const { container } = render(
        <div className="relative h-96 w-full">
          <HeroSonHaDiorama />
          <HeroPhysicsCanvas />
        </div>,
      );

      expect(container.querySelector('[data-testid="son-ha-layer-1"]')).toBeInTheDocument();
      expect(container.querySelector('[data-testid="son-ha-layer-4"]')).not.toBeInTheDocument();
      expect(screen.getByTestId('hoang-lien-dawn-glow')).toBeInTheDocument();
      const fansipanAnchor = screen.getByTestId('fansipan-peaks');
      expect(fansipanAnchor).toHaveAttribute('data-terrain-mode', 'topographic-dong-son-6layer');
      expect(fansipanAnchor.querySelectorAll('path')).toHaveLength(0);
      expect(screen.queryByTestId('hoang-lien-cranes')).not.toBeInTheDocument();

      const canvas = screen.getByTestId('hero-physics-canvas');
      expect(canvas).toBeInTheDocument();
      expect(canvas).toHaveAttribute('data-pipeline-layers', '6');
      expect(canvas).toHaveAttribute('data-landscape-style', 'topographic-dong-son');

      // Hai lớp tương phản AAA & dải sương mặt hồ đáy Hero nằm trên Canvas (z-10)
      expect(screen.getByTestId('hero-bottom-mist-transition').className).toContain('z-10');
      expect(screen.getByTestId('hero-text-contrast-scrim').className).toContain('z-10');
      expect(screen.getByTestId('hero-quote-contrast-scrim').className).toContain('z-10');

      // 1. 5 Tầng núi sương mù Fourier mượt, 22-28 đường đồng mức (0.75px) trên 4 tầng núi & Đài Thiên Cầu Đông Sơn
      expect(PIPELINE_LAYER_NAMES).toHaveLength(6);
      const terrain = buildHeroTerrainGeometry(1440, 900);
      expect(terrain.mountainLayers).toHaveLength(5);
      expect(terrain.contours.length).toBeGreaterThanOrEqual(22);
      expect(terrain.contours.length).toBeLessThanOrEqual(28);
      expect(terrain.contours.every((c) => c.lineWidth === 0.75)).toBe(true);
      expect(new Set(terrain.contours.map((c) => c.layerIndex))).toEqual(new Set([1, 2, 3, 4]));
      expect(new Set(terrain.contours.map((c) => c.tone))).toEqual(new Set(['gold', 'cyan']));

      // Đài Thiên Cầu Đông Sơn (72% x 33%, 14 cánh sao, 4 vòng chia độ 5°/30°, 2 cung hoàng đạo)
      expect(terrain.astrolabe.cx).toBeCloseTo(1440 * 0.72, 2);
      expect(terrain.astrolabe.cy).toBeCloseTo(900 * 0.33, 2);
      expect(terrain.astrolabe.starRays).toBe(14);
      expect(terrain.astrolabe.rings).toHaveLength(4);
      expect(
        terrain.astrolabe.rings.every((r) => r.tickStepDeg === 5 && r.majorStepDeg === 30),
      ).toBe(true);
      expect(Math.abs(terrain.astrolabe.rings[0]!.angularSpeedRadSec)).toBeCloseTo(0.04, 3);
      expect(terrain.astrolabe.eclipticArcs).toHaveLength(2);

      // Tinh vân / sương khí quyển & 3 lớp Biển Sương OffscreenCanvas
      expect(terrain.nebulaHalos.length).toBeGreaterThanOrEqual(5);
      expect(
        terrain.nebulaHalos.every(
          (h) => h.radius >= 250 && h.radius <= 450 && h.alpha >= 0.03 && h.alpha <= 0.06,
        ),
      ).toBe(true);

      const layerCache = buildHeroTerrainLayerCache(
        1440,
        900,
        'binh-minh-bach-ngoc',
        ATMOSPHERIC_PALETTES['binh-minh-bach-ngoc'],
      );
      expect(layerCache.width).toBe(1440);
      expect(layerCache.height).toBe(900);
      expect(layerCache.phase).toBe('binh-minh-bach-ngoc');
      expect(layerCache.geometry.mountainLayers).toHaveLength(5);
      expect(layerCache.valleyMistLayers).toHaveLength(3);

      // 2. Bầu trời 280 ngôi sao (gồm 15 sao chữ thập r=1.3px), 3 Đa diện Tinh Tú 3D, 25 tinh tú vàng & suối ánh sao
      const world = createAtmosphereWorld();
      expect(world.stars).toHaveLength(280);
      expect(world.polyhedralConstellations3D).toHaveLength(3);
      const flareStars = world.stars.filter((s) => s.crossFlare);
      expect(flareStars).toHaveLength(15);
      expect(
        flareStars.every((s) => s.baseRadius === 1.3 && s.flareLength >= 8 && s.flareLength <= 14),
      ).toBe(true);

      expect(world.ascendingStarlights).toHaveLength(25);
      expect(world.ascendingStarlights.every((m) => m.radius === 1.5)).toBe(true);
      expect(world.mistRipples.length).toBeGreaterThanOrEqual(20);
      expect(world.mistRipples.length).toBeLessThanOrEqual(30);
      expect(world.mistRipples.every((r) => r.ny >= 0.76 && r.ny <= 0.98)).toBe(true);

      // Chòm sao hình học toán học (4-5 cụm sao gồm Scorpion), bụi sao 3D (56 hạt) & sao băng định kỳ (5-9s)
      expect(world.constellations).toHaveLength(5);
      expect(world.constellations.some((c) => c.id === 'scorpion')).toBe(true);
      expect(world.stardust3D).toHaveLength(56);
      expect(world.nextShootingStarInSec).toBeGreaterThanOrEqual(5);
      expect(world.nextShootingStarInSec).toBeLessThanOrEqual(9);
      spawnShootingStar(world, true);
      expect(world.shootingStars.some((s) => s.active && s.vx > 0)).toBe(true);

      // Kiểm chứng renderAtmosphereFrame chạy an toàn trong môi trường Canvas giả lập
      const spriteCache = buildAtmosphereSpriteCache();
      expect(spriteCache).toHaveProperty('warmStarSprite');
      expect(typeof renderAtmosphereFrame).toBe('function');

      // Sóng Ngân Trống Đồng (Harmonic Contour Pulse R: 0 -> 600px)
      spawnHarmonicContourPulse(world, 720, 480, 600);
      expect(world.pulses.some((p) => p.active && p.maxRadius === 600)).toBe(true);

      // Kiểm chứng bảng màu Bình Minh Bạch Ngọc & nội suy khí quyển
      const dawnPalette = ATMOSPHERIC_PALETTES['binh-minh-bach-ngoc'];
      expect(dawnPalette.sky0).toEqual([237, 243, 241]);
      expect(dawnPalette.sky2).toEqual([221, 234, 230]);
      expect(dawnPalette.sky4).toEqual([246, 239, 224]);
      const lerped = interpolateAtmospherePalette(dawnPalette, dawnPalette, 0.5);
      expect(lerped.sky0).toEqual(dawnPalette.sky0);
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
      expect(screen.getAllByText(HERITAGE_ARTWORKS[1]!.title).length).toBeGreaterThan(0);
    });

    it('SubjectStageCanvas Giáo dục học vẽ 3 vành sinh thái, Tam giác Sư phạm 2 chiều & Đường xoắn ốc trưởng thành (không có 3D.STAGE // 120FPS)', () => {
      const drawnLabels: string[] = [];
      const noop = vi.fn();
      const gradMock = { addColorStop: noop };
      const ctxSpy = {
        save: noop,
        restore: noop,
        setTransform: noop,
        translate: noop,
        scale: noop,
        rotate: noop,
        clearRect: noop,
        fillRect: noop,
        strokeRect: noop,
        rect: noop,
        beginPath: noop,
        closePath: noop,
        moveTo: noop,
        lineTo: noop,
        quadraticCurveTo: noop,
        bezierCurveTo: noop,
        arc: noop,
        ellipse: noop,
        fill: noop,
        stroke: noop,
        clip: noop,
        setLineDash: noop,
        drawImage: noop,
        fillText: (text: string) => {
          drawnLabels.push(text);
        },
        measureText: () => ({ width: 24 }),
        createLinearGradient: () => gradMock,
        createRadialGradient: () => gradMock,
        globalAlpha: 1,
        fillStyle: '#000',
        strokeStyle: '#000',
        lineWidth: 1,
        lineCap: 'butt',
        lineJoin: 'miter',
        font: '12px sans-serif',
        textAlign: 'left',
        textBaseline: 'alphabetic',
      } as unknown as CanvasRenderingContext2D;

      const getContextSpy = vi
        .spyOn(HTMLCanvasElement.prototype, 'getContext')
        .mockReturnValue(ctxSpy);

      try {
        render(<SubjectStageCanvas slug="giao-duc-hoc" isCardHovered />);
        const stage = screen.getByTestId('subject-stage-giao-duc-hoc');
        expect(stage).toHaveClass('overflow-hidden');
        expect(screen.queryByText(/3D\.STAGE \/\/ 120FPS/i)).not.toBeInTheDocument();
        expect(drawnLabels).toEqual(
          expect.arrayContaining([
            'SƯ PHẠM',
            'NHÀ TRƯỜNG',
            'HƯỚNG NGHIỆP',
            'GIÁO VIÊN',
            'NGƯỜI HỌC',
            'TRI THỨC',
          ]),
        );
      } finally {
        getContextSpy.mockRestore();
      }
    });

    it('heroSculptureGeometry: phân tầng 3 khu vực bán kính theo R_dial, ánh sáng Blinn-Phong, 4 hạt khoáng thạch và Alidade angleLerp', () => {
      expect(ICO_VERTICES).toHaveLength(12);
      expect(ICO_FACES).toHaveLength(20);
      expect(ICO_TIER1_SCALE / WORLD_R_DIAL).toBeLessThanOrEqual(0.34);
      expect(CORE_TIER1_SCALE).toBeLessThan(ICO_TIER1_SCALE);

      for (const ring of ARMILLARY_RINGS) {
        expect(ring.radiusX).toBeLessThanOrEqual(0.78 * WORLD_R_DIAL + 1e-6);
        expect(ring.radiusY).toBeGreaterThanOrEqual(0.48 * WORLD_R_DIAL - 1e-6);
      }

      expect(SHININESS_BLINN).toBe(12);
      expect(Math.hypot(LIGHT_DIR.x, LIGHT_DIR.y, LIGHT_DIR.z)).toBeCloseTo(1, 5);
      expect(LIGHT_DIR.z).toBeGreaterThan(0.68);

      expect(SPHERICAL_WAVE_TRIG).toHaveLength(HARMONIC_WAVE_POINTS);
      expect(HARMONIC_WAVE_POINTS).toBe(120);
      expect(BLUEPRINT_SYMBOLS.map((s) => s.symbol)).toEqual([
        '∫',
        '∂',
        '∑',
        'π',
        '∆',
        'φ',
        '∀',
        '≃',
      ]);
      expect(ARMILLARY_RINGS.map((r) => r.cometColor)).toEqual([
        '#9C7A4C',
        '#49768F',
        '#3B7A65',
        '#9E6356',
      ]);

      const wrapped = angleLerp(Math.PI - 0.1, -Math.PI + 0.1, 0.5);
      expect(Math.abs(Math.sin(wrapped))).toBeCloseTo(0, 5);
      expect(Math.cos(wrapped)).toBeLessThan(-0.99);
      expect(formatAlidadeAngle((3 * Math.PI) / 4)).toBe('135° · 3π/4');
      expect(formatAlidadeAngle(Math.PI / 2)).toBe('90° · π/2');
    });

    it('ChladniManifestoSection vẽ đĩa cộng hưởng 2.600 hạt khoáng thạch và chuyển đổi 4 chế độ (m, n) không lỗi', () => {
      const fillStyles: string[] = [];
      const noop = vi.fn();
      const gradMock = { addColorStop: noop };
      const ctxSpy = {
        save: noop,
        restore: noop,
        setTransform: noop,
        translate: noop,
        scale: noop,
        rotate: noop,
        clearRect: noop,
        fillRect: noop,
        strokeRect: noop,
        rect: noop,
        beginPath: noop,
        closePath: noop,
        moveTo: noop,
        lineTo: noop,
        arc: noop,
        fill: function (this: { fillStyle: string }) {
          fillStyles.push(this.fillStyle);
        },
        stroke: noop,
        clip: noop,
        setLineDash: noop,
        createRadialGradient: () => gradMock,
        globalAlpha: 1,
        fillStyle: '#000',
        strokeStyle: '#000',
        lineWidth: 1,
      } as unknown as CanvasRenderingContext2D;

      const getContextSpy = vi
        .spyOn(HTMLCanvasElement.prototype, 'getContext')
        .mockReturnValue(ctxSpy);

      try {
        render(
          <MemoryRouter>
            <ChladniManifestoSection />
          </MemoryRouter>,
        );

        const canvas = screen.getByTestId('chladni-resonance-canvas');
        expect(canvas).toBeInTheDocument();
        expect(fillStyles).toContain('rgba(30, 51, 46, 0.82)');
        expect(fillStyles).toContain('rgba(156, 122, 76, 0.88)');

        const presets: [string, string][] = [
          ['Đối xứng (3, 5)', '(m, n) =(3, 5)'],
          ['Giao thoa (4, 7)', '(m, n) =(4, 7)'],
          ['Hội tụ (5, 8)', '(m, n) =(5, 8)'],
          ['Đông Sơn (6, 9)', '(m, n) =(6, 9)'],
        ];
        for (const [label, expectedMode] of presets) {
          const btn = screen.getByRole('button', { name: label });
          fireEvent.click(btn);
          expect(btn).toHaveAttribute('aria-pressed', 'true');
          expect(screen.getByTestId('chladni-mode-indicator')).toHaveTextContent(expectedMode);
        }
      } finally {
        getContextSpy.mockRestore();
      }
    });
  });
});
