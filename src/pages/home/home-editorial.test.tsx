import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { describe, expect, it, vi } from 'vitest';
import { IslandProvider } from '@/context/IslandContext';
import {
  ATMOSPHERIC_PALETTES,
  interpolateAtmospherePalette,
} from '@/components/home/atmosphereThemes';
import {
  applyEightOnBreakDecision,
  applyIllegalBreakDecision,
  buildOfficial15BallRack,
  clampBreakCueBallPlacement,
  computeAiShotPlan,
  computeStereoPan,
  computeTableMetrics,
  createBilliardsWorld,
  isCueBallPlacementValid,
  isInBreakKitchen,
  isShootingForEightBall,
  stepBilliardsPhysicsFrame,
} from '@/components/home/billiardsEngine';
import { MineralBilliardsStage } from '@/components/home/MineralBilliardsStage';
import {
  BILLIARD_COMBO_NOTES,
  playBallClack,
  playCueStrike,
  playCushionBounce,
  playJawRattle,
  playMarbleRoll,
  playPocketDrop,
  playRackClear,
  playTrickShotReward,
  setBilliardSoundEnabled,
  updateBilliardRollingSound,
} from '@/utils/billiardAudio';
import {
  applyCushionEnglishBounce,
  computeShotLaunchSpeed,
  initializeCueBallShot,
  integrateClothSlideToRollSubstep,
  resolveRigidBallPairCollision,
  SUBSTEPS,
} from '@/utils/billiardPhysics';
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
import { createGlowSpriteCache } from '@/shared/lib/canvasSprites';
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
      expect(screen.getByText(/01 \/ 40/i)).toBeInTheDocument();

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

    it('chứa toàn bộ 40 tác phẩm di sản xác thực 100% (không còn mục giả lập SVG)', () => {
      expect(HERITAGE_ARTWORKS).toHaveLength(40);
      const ids = HERITAGE_ARTWORKS.map((a) => a.id);
      expect(ids[0]).toBe('khue-van-cac');
      expect(ids).not.toContain('dai-thanh-toan-phap');
      expect(ids).not.toContain('lap-thanh-toan-phap');
      expect(ids).toEqual(
        expect.arrayContaining([
          'van-mieu-mao-dien',
          'den-tho-luong-the-vinh',
          'chau-ban-trieu-nguyen',
          'van-thanh-mieu-vinh-long',
          'thanh-nha-ho-1397',
          'plimpton-322',
          'antikythera-mechanism',
          'sidereus-nuncius-galileo',
          'the-ambassadors-holbein',
          'pantheon-rome-oculus',
        ]),
      );

      // Không có bất kỳ tác phẩm nào sử dụng hình SVG tự vẽ giả lập
      expect(HERITAGE_ARTWORKS.every((a) => a.imageSrc.startsWith('https://'))).toBe(true);
      expect(HERITAGE_ARTWORKS.some((a) => a.imageSrc.startsWith('svg://'))).toBe(false);

      const ngocLu = HERITAGE_ARTWORKS.find((a) => a.id === 'trong-dong-ngoc-lu');
      expect(ngocLu).toBeDefined();
      expect(ngocLu?.imageSrc).toContain('Ngoc_Lu.jpg');
      expect(ngocLu?.imageSrc).not.toContain('.svg');
    });

    it('hiển thị bộ đếm tác phẩm dạng 01 / 40', () => {
      render(<HeritageArtShowcase />);
      expect(screen.getByText('01 / 40')).toBeInTheDocument();
    });

    it('hiển thị fallback học thuật khi ảnh 03 / 40 (Melencolia I) gặp lỗi mạng và khóa chữ tương phản cao', async () => {
      render(<HeritageArtShowcase />);

      const art3Dot = screen.getByRole('button', {
        name: /Chuyển đến tác phẩm 3:.*Melencolia I/i,
      });
      fireEvent.click(art3Dot);

      expect(await screen.findByText('03 / 40')).toBeInTheDocument();
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
      expect(screen.getByTestId('archival-subject-badge-cau-truc-dai-so')).toHaveTextContent(
        'CTĐS',
      );
      expect(screen.getByTestId('archival-subject-badge-hinh-hoc-affine')).toHaveTextContent(
        'HHAVE',
      );
      expect(screen.getByTestId('archival-subject-badge-giai-tich-ham-mot-bien')).toHaveTextContent(
        'GTHMB',
      );
      expect(screen.getByTestId('archival-subject-badge-giao-duc-hoc')).toHaveTextContent('GDH');
      expect(screen.queryByText(/MATH1301|MATH1302|MATH1303|EDUC2802/i)).not.toBeInTheDocument();

      // Có các bộ lọc CLO
      expect(screen.getByRole('button', { name: /CLO1/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /CLO6/i })).toBeInTheDocument();
    });
  });

  describe('LearningSpacePage & HomePage Integration with Scholarly Upgrades', () => {
    it('LearningSpacePage tinh gọn theo chuẩn Swiss Neo-Editorial, giữ nguyên đa diện 3D, 4 học phần, Biểu đồ Radar và Mạng lưới Liên kết Tri thức', () => {
      render(
        <MemoryRouter>
          <LearningSpacePage />
        </MemoryRouter>,
      );

      expect(screen.getByTestId('learning-space-page')).toBeInTheDocument();
      expect(
        screen.getByRole('heading', { level: 1, name: /^Không Gian Học Tập$/i }),
      ).toBeInTheDocument();
      expect(screen.getByText(/04 học phần/i)).toBeInTheDocument();
      expect(screen.getByText(/Hoàn thành \d+%/i)).toBeInTheDocument();

      // Đã gỡ bỏ hoàn toàn lớp trang trí kỹ thuật (blueprint, spy rail, engraved ground, specimen chrome)
      expect(screen.queryByTestId('observatory-vignette')).not.toBeInTheDocument();
      expect(screen.queryByTestId('learning-space-perimeter-frame')).not.toBeInTheDocument();
      expect(screen.queryByTestId('geodesic-corner-brackets')).not.toBeInTheDocument();
      expect(screen.queryByTestId('learning-space-spy-rail')).not.toBeInTheDocument();
      expect(screen.queryByTestId('ambient-geodesic-wings')).not.toBeInTheDocument();
      expect(screen.queryByTestId('hero-blueprint-grid')).not.toBeInTheDocument();
      expect(screen.queryByTestId('hero-blueprint-frame')).not.toBeInTheDocument();
      expect(screen.queryByTestId('engraved-ground-canvas')).not.toBeInTheDocument();
      expect(screen.queryByTestId('architectural-band')).not.toBeInTheDocument();
      expect(screen.queryByTestId('atlas-blueprint-frame')).not.toBeInTheDocument();
      expect(screen.queryByTestId('orbit-blueprint-frame')).not.toBeInTheDocument();
      expect(screen.queryByTestId('topographic-waterlines')).not.toBeInTheDocument();
      expect(screen.queryByTestId('golden-compass-spine')).not.toBeInTheDocument();
      expect(screen.queryByTestId('fx-search-glow')).not.toBeInTheDocument();
      expect(screen.queryByText(/DOC\. LU-2026 \/\/ ACADEMIC SANCTUARY/i)).not.toBeInTheDocument();
      expect(screen.queryByText(/SPECIMEN №/i)).not.toBeInTheDocument();

      // Khối Điêu khắc Đa diện 3D thuần trang trí (có thể kéo xoay)
      expect(screen.getByTestId('learning-space-celestial-rings')).toBeInTheDocument();
      expect(screen.queryByTestId('orbital-subject-node-cau-truc-dai-so')).not.toBeInTheDocument();

      // Lưới 4 môn học 2 cột trong chế độ Atlas
      const atlasGrid = screen.getByTestId('atlas-subjects-grid');
      expect(atlasGrid).toHaveClass('grid-cols-1', 'md:grid-cols-2');
      expect(screen.getByTestId('subject-watermark-cau-truc-dai-so')).toBeInTheDocument();
      expect(screen.getByTestId('subject-watermark-hinh-hoc-affine')).toBeInTheDocument();
      expect(screen.getByTestId('subject-watermark-giai-tich-ham-mot-bien')).toBeInTheDocument();
      expect(screen.getByTestId('subject-watermark-giao-duc-hoc')).toBeInTheDocument();
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

      // Nút ViewModeToggle & Quick search chips & Chỉ mục chương
      expect(screen.getByTestId('homepage-view-mode-toggle')).toBeInTheDocument();
      expect(screen.getByTestId('quick-search-chips')).toBeInTheDocument();
      expect(screen.getByTestId('subject-stage-giao-duc-hoc')).toHaveClass('overflow-hidden');
      expect(screen.getByTestId('almanac-chapter-index-cau-truc-dai-so')).toBeInTheDocument();
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

    it('HomePage tái cấu trúc thành Workspace Dashboard 1 màn hình tối giản Academic OS (kèm chuyển tiếp Di sản 40 tác phẩm & Bida 8-Ball)', async () => {
      render(
        <MemoryRouter>
          <IslandProvider initialPathname="/">
            <HomePage />
          </IslandProvider>
        </MemoryRouter>,
      );

      // A. Header Row: Không gian Tổng quan + Danh ngôn 1 dòng có nút đổi câu + Ngày hôm nay
      expect(screen.getByTestId('workspace-dashboard')).toBeInTheDocument();
      expect(
        screen.getByRole('heading', { level: 1, name: /Không gian Tổng quan/i }),
      ).toBeInTheDocument();
      expect(screen.getByTestId('dashboard-date')).toBeInTheDocument();

      const quoteEl = screen.getByTestId('dashboard-quote-text');
      const initialQuoteText = quoteEl.textContent ?? '';
      fireEvent.click(screen.getByTestId('dashboard-quote-next'));
      expect(screen.getByTestId('dashboard-quote-text').textContent).not.toBe(initialQuoteText);

      // Đã gỡ bỏ Sơn Thủy cuộn dài khỏi luồng mặc định của /
      expect(screen.queryByTestId('son-ha-diorama')).not.toBeInTheDocument();
      expect(screen.queryByTestId('hero-physics-canvas')).not.toBeInTheDocument();
      expect(screen.queryByTestId('shoreline-wave-bridge')).not.toBeInTheDocument();

      // B. Bento Row 1: Tiếp tục học tập (7 cột) + Nhịp độ & Pomodoro nhanh (5 cột)
      const resumeCard = screen.getByTestId('dashboard-resume-card');
      expect(resumeCard).toHaveTextContent(/ĐANG HỌC DỞ/i);
      expect(screen.getByRole('link', { name: /Vào bài học ngay/i })).toBeInTheDocument();

      const metricsCard = screen.getByTestId('dashboard-metrics-card');
      expect(metricsCard).toHaveTextContent(/Bài hoàn thành/i);
      expect(metricsCard).toHaveTextContent(/Tiến độ tổng/i);
      expect(metricsCard).toHaveTextContent(/Kho Thuật ngữ/i);
      const pomodoroBar = screen.getByTestId('dashboard-pomodoro-bar');
      expect(pomodoroBar).toHaveTextContent('25:00');
      fireEvent.click(screen.getByTestId('dashboard-pomodoro-start'));
      expect(pomodoroBar).toHaveTextContent(/Tạm dừng/i);

      // C. Bento Row 2: Lưới 4 học phần đồng đều (CTĐS, HHAVE, GTHMB, GDH)
      const subjectsGrid = screen.getByTestId('dashboard-subjects-grid');
      expect(subjectsGrid).toHaveTextContent('CTĐS');
      expect(subjectsGrid).toHaveTextContent('HHAVE');
      expect(subjectsGrid).toHaveTextContent('GTHMB');
      expect(subjectsGrid).toHaveTextContent('GDH');
      expect(screen.getByTestId('dashboard-subject-card-cau-truc-dai-so')).toHaveAttribute(
        'href',
        '/mon-hoc/cau-truc-dai-so',
      );
      expect(screen.getByTestId('dashboard-subject-card-hinh-hoc-affine')).toHaveAttribute(
        'href',
        '/mon-hoc/hinh-hoc-affine',
      );
      expect(screen.getByTestId('dashboard-subject-card-giai-tich-ham-mot-bien')).toHaveAttribute(
        'href',
        '/mon-hoc/giai-tich-ham-mot-bien',
      );
      expect(screen.getByTestId('dashboard-subject-card-giao-duc-hoc')).toHaveAttribute(
        'href',
        '/mon-hoc/giao-duc-hoc',
      );

      // D. Bento Row 3: Di sản trong ngày (có nút shuffle) + Thuật ngữ KaTeX + Sảnh Bida 8-Ball
      const heritageCard = screen.getByTestId('dashboard-heritage-card');
      expect(heritageCard).toHaveTextContent(/Di sản trong ngày/i);
      const initialHeritageTitle = heritageCard.querySelector('h3')?.textContent ?? '';
      fireEvent.click(screen.getByTestId('dashboard-heritage-shuffle'));
      expect(heritageCard.querySelector('h3')?.textContent).not.toBe(initialHeritageTitle);

      expect(screen.getByTestId('dashboard-glossary-card')).toHaveTextContent(
        /Thuật ngữ ngẫu nhiên/i,
      );
      expect(screen.getByTestId('dashboard-billiards-card')).toHaveTextContent(
        /Sảnh Bida 8-Ball WPA/i,
      );

      // Khu vực chuyển tiếp — Phòng Trưng Bày 40 Di Sản (#khong-gian-di-san)
      const showcase = screen.getByTestId('heritage-art-showcase');
      expect(showcase).toHaveAttribute('id', 'khong-gian-di-san');
      expect(showcase.textContent).toContain('Khuê Văn Các');
      expect(showcase.textContent).not.toMatch(/[\u4E00-\u9FFF]/);
      expect(screen.getByTestId('heritage-filmstrip')).toBeInTheDocument();

      // Bảo đảm 40 tác phẩm không trùng id, tiêu đề hay imageSrc
      expect(HERITAGE_ARTWORKS).toHaveLength(40);
      expect(new Set(HERITAGE_ARTWORKS.map((item) => item.id)).size).toBe(40);
      expect(new Set(HERITAGE_ARTWORKS.map((item) => item.title)).size).toBe(40);
      expect(new Set(HERITAGE_ARTWORKS.map((item) => item.imageSrc)).size).toBe(40);

      expect(screen.getByTestId('heritage-index-indicator')).toHaveTextContent('01 / 40');
      const pantheonBtn = screen.getByRole('button', {
        name: /Chọn tác phẩm 40: Đền Pantheon/i,
      });
      fireEvent.click(pantheonBtn);
      await waitFor(() => {
        expect(screen.getByTestId('heritage-index-indicator')).toHaveTextContent('40 / 40');
      });
      fireEvent.click(screen.getByRole('button', { name: /Phóng to tác phẩm/i }));
      expect(screen.getByRole('dialog')).toBeInTheDocument();
      fireEvent.click(screen.getByRole('button', { name: /Đóng xem toàn màn hình/i }));
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

      fireEvent.click(screen.getByRole('tab', { name: /Toán học & Thiên văn/i }));
      expect(screen.getByTestId('heritage-index-indicator')).toHaveTextContent('01 / 13');

      // Khu vực chuyển tiếp — Sân khấu Bida 8-Ball WPA (#ban-bida-khoang-thach)
      const billiardsStage = await screen.findByTestId('mineral-billiards-stage');
      expect(billiardsStage).toBeInTheDocument();
      expect(screen.getByTestId('billiards-match-hud')).toBeInTheDocument();
      expect(screen.getByTestId('billiards-status-pill')).toHaveTextContent('Khai cuộc');
      expect(screen.getByTestId('billiards-power-slider')).toBeInTheDocument();
      expect(screen.getByTestId('mineral-billiards-canvas')).toBeInTheDocument();
      expect(screen.getByTestId('billiards-new-rack-btn')).toHaveTextContent('Ván mới');
      expect(screen.getByTestId('billiards-rules-btn')).toHaveTextContent('Luật & Trọng tài');
      expect(screen.getByTestId('billiards-screen-lock-btn')).toHaveTextContent('Khóa màn hình');
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

      // Đài Thiên Cầu Đông Sơn (72% x 33%, 14 cánh sao, 4 vòng chia độ 5°/30°, 2 cung hoàng đạo, 2 cung quỹ đạo mở rộng)
      expect(terrain.astrolabe.cx).toBeCloseTo(1440 * 0.72, 2);
      expect(terrain.astrolabe.cy).toBeCloseTo(900 * 0.33, 2);
      expect(terrain.astrolabe.starRays).toBe(14);
      expect(terrain.astrolabe.rings).toHaveLength(4);
      expect(terrain.astrolabe.expandedOrbitRadii).toHaveLength(2);
      expect(
        terrain.astrolabe.rings.every((r) => r.tickStepDeg === 5 && r.majorStepDeg === 30),
      ).toBe(true);
      expect(Math.abs(terrain.astrolabe.rings[0]!.angularSpeedRadSec)).toBeCloseTo(0.04, 3);
      expect(terrain.astrolabe.eclipticArcs).toHaveLength(2);

      // Tinh vân / sương khí quyển & 5 tầng OffscreenCanvas núi FBM + 3 lớp Biển Sương
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
      expect(layerCache.mountainLayerSurfaces).toHaveLength(5);
      expect(layerCache.valleyMistLayers).toHaveLength(3);

      // 2. Đã xóa bỏ 3 đa diện trôi tự do; thay bằng 3 Khí cụ Hỗn thiên nghi neo quỹ đạo, 4 chim Lạc Bézier, 36 hạt phấn nắng & 12 caustics
      const world = createAtmosphereWorld();
      expect('polyhedralConstellations3D' in world).toBe(false);
      expect(world.orbitAstrolabeNodes).toHaveLength(3);
      expect(world.orbitAstrolabeNodes.map((n) => [n.id, n.radiusPx])).toEqual([
        ['armillary', 16],
        ['vernier', 13],
        ['lunar', 11],
      ]);
      expect(
        world.orbitAstrolabeNodes.every(
          (n) => Math.abs(n.angularSpeedRadSec) >= 0.03 && Math.abs(n.angularSpeedRadSec) <= 0.06,
        ),
      ).toBe(true);

      expect(world.lacBirds).toHaveLength(4);
      expect(world.lacBirds.every((b) => b.scale >= 0.65 && b.scale <= 1.15)).toBe(true);

      expect(world.sunlitMotes).toHaveLength(36);
      expect(world.sunlitMotes.every((m) => m.radius >= 0.8 && m.radius <= 2.0)).toBe(true);

      expect(world.waterCaustics.length).toBeGreaterThanOrEqual(10);
      expect(world.waterCaustics.length).toBeLessThanOrEqual(14);

      expect(world.stars).toHaveLength(280);
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

      // Chòm sao & sao băng
      expect(world.constellations).toHaveLength(5);
      expect(world.constellations.some((c) => c.id === 'scorpion')).toBe(true);
      expect(world.stardust3D).toHaveLength(56);
      expect(world.nextShootingStarInSec).toBeGreaterThanOrEqual(5);
      expect(world.nextShootingStarInSec).toBeLessThanOrEqual(9);
      spawnShootingStar(world, true);
      expect(world.shootingStars.some((s) => s.active && s.vx > 0)).toBe(true);

      // Kiểm chứng renderAtmosphereFrame vẽ đàn chim Lạc Bézier & tia tiếp tuyến chuột gần thiên cầu an toàn
      const spriteCache = buildAtmosphereSpriteCache();
      expect(spriteCache).toHaveProperty('warmStarSprite');
      expect(typeof renderAtmosphereFrame).toBe('function');

      const bezierSpy = vi.fn();
      const noop = vi.fn();
      const gradMock = { addColorStop: noop };
      const frameCtxSpy = {
        save: noop,
        restore: noop,
        setTransform: noop,
        translate: noop,
        scale: noop,
        rotate: noop,
        clearRect: noop,
        fillRect: noop,
        strokeRect: noop,
        beginPath: noop,
        closePath: noop,
        moveTo: noop,
        lineTo: noop,
        quadraticCurveTo: noop,
        bezierCurveTo: bezierSpy,
        arc: noop,
        ellipse: noop,
        fill: noop,
        stroke: noop,
        clip: noop,
        setLineDash: noop,
        drawImage: noop,
        createLinearGradient: () => gradMock,
        createRadialGradient: () => gradMock,
        globalAlpha: 1,
        fillStyle: '#000',
        strokeStyle: '#000',
        lineWidth: 1,
        lineCap: 'butt',
        lineJoin: 'miter',
      } as unknown as CanvasRenderingContext2D;

      renderAtmosphereFrame({
        ctx: frameCtxSpy,
        width: 1440,
        height: 900,
        tSec: 3.2,
        dtSeconds: 0.0083,
        dtScale: 0.5,
        scrollProgress: 0,
        animate: true,
        palette: ATMOSPHERIC_PALETTES['binh-minh-bach-ngoc'],
        sprites: spriteCache,
        glowSprites: createGlowSpriteCache(),
        mouse: {
          active: true,
          x: 1440 * 0.72 - 90,
          y: 900 * 0.33 - 40,
          vx: 0,
          vy: 0,
          normX: 0.4,
          normY: -0.3,
        },
        world,
        terrainLayers: { prev: layerCache, next: layerCache, blend: 1 },
      });
      // 4 chim Lạc x 2 cung Bézier đối xứng = 8 lần gọi bezierCurveTo
      expect(bezierSpy).toHaveBeenCalledTimes(8);

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

    it('HomePage tuyệt đối không tự động cuộn xuống phòng trưng bày theo timer, chỉ cuộn khi người dùng bấm Mở phòng trưng bày 40 Di sản', () => {
      vi.useFakeTimers();
      const origScrollIntoView = Element.prototype.scrollIntoView;
      const scrollIntoViewSpy = vi.fn();
      Element.prototype.scrollIntoView = scrollIntoViewSpy;
      const scrollToSpy = vi.spyOn(window, 'scrollTo').mockImplementation(() => undefined);

      try {
        render(
          <MemoryRouter>
            <IslandProvider initialPathname="/">
              <HomePage />
            </IslandProvider>
          </MemoryRouter>,
        );

        act(() => {
          vi.advanceTimersByTime(30000);
        });
        expect(scrollIntoViewSpy).not.toHaveBeenCalled();
        expect(scrollToSpy).not.toHaveBeenCalled();

        const heritageCta = screen.getByRole('button', { name: /Mở phòng trưng bày 40 Di sản/i });
        fireEvent.click(heritageCta);
        expect(scrollIntoViewSpy).toHaveBeenCalledTimes(1);
      } finally {
        Element.prototype.scrollIntoView = origScrollIntoView;
        scrollToSpy.mockRestore();
        vi.useRealTimers();
      }
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

    it('MineralBilliardsStage & billiardAudio vận hành bàn bida 8 Ball Pool 15 bi, SUBSTEPS=8, vật lý trượt-lăn 3D, Kitchen & Call-Pocket Bi 8', () => {
      const drawnNumbers: string[] = [];
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
        roundRect: noop,
        ellipse: noop,
        quadraticCurveTo: noop,
        drawImage: noop,
        createPattern: () => null,
        beginPath: noop,
        closePath: noop,
        moveTo: noop,
        lineTo: noop,
        arc: noop,
        fill: noop,
        stroke: noop,
        clip: noop,
        setLineDash: noop,
        fillText: (text: string) => {
          drawnNumbers.push(text);
        },
        createLinearGradient: () => gradMock,
        createRadialGradient: () => gradMock,
        globalAlpha: 1,
        fillStyle: '#000',
        strokeStyle: '#000',
        lineWidth: 1,
        lineCap: 'round',
        font: '10px monospace',
        textAlign: 'center',
        textBaseline: 'middle',
      } as unknown as CanvasRenderingContext2D;

      const getContextSpy = vi
        .spyOn(HTMLCanvasElement.prototype, 'getContext')
        .mockReturnValue(ctxSpy);

      try {
        // Kiểm tra toàn bộ hàm tổng hợp âm thanh Web Audio API (gồm roll mặt nỉ, jaw rattle & trick-shot)
        expect(BILLIARD_COMBO_NOTES).toEqual([587.33, 659.25, 783.99, 880.0, 987.77, 1174.66]);
        setBilliardSoundEnabled(true);
        expect(() => playCueStrike(0.75)).not.toThrow();
        expect(() => playBallClack(0.85)).not.toThrow();
        expect(() => playCushionBounce(0.6)).not.toThrow();
        expect(() => playJawRattle(0.55, -0.4)).not.toThrow();
        expect(() => playPocketDrop(2)).not.toThrow();
        expect(() => playRackClear()).not.toThrow();
        expect(() => playTrickShotReward('bank')).not.toThrow();
        expect(() => playTrickShotReward('double')).not.toThrow();
        expect(() => playCueStrike(0.75, -0.5, 0.8)).not.toThrow();
        expect(() => playBallClack(0.85, 0.4)).not.toThrow();
        expect(() => playCushionBounce(0.6, -0.7)).not.toThrow();
        expect(() => playPocketDrop(2, 0.75)).not.toThrow();
        expect(() => playMarbleRoll(0.65, 0.8)).not.toThrow();
        expect(() => updateBilliardRollingSound(0.45)).not.toThrow();
        expect(() => updateBilliardRollingSound(0)).not.toThrow();
        setBilliardSoundEnabled(false);

        render(
          <MemoryRouter>
            <MineralBilliardsStage />
          </MemoryRouter>,
        );

        const canvas = screen.getByTestId('mineral-billiards-canvas');
        expect(canvas).toBeInTheDocument();
        expect(SUBSTEPS).toBe(8);
        expect(canvas).toHaveAttribute('data-substeps', '8');
        expect(canvas).toHaveAttribute('data-target-balls', '15');
        expect(canvas).toHaveAttribute('data-pocket-jaws', '12');
        expect(screen.getByTestId('mineral-billiards-stage')).toHaveAttribute(
          'data-hide-cursor-ring',
          'true',
        );

        // 15 bi trơn/sọc/bi 8 (1..15) được vẽ trên Canvas
        expect(drawnNumbers).toEqual(
          expect.arrayContaining([
            '1',
            '2',
            '3',
            '4',
            '5',
            '6',
            '7',
            '8',
            '9',
            '10',
            '11',
            '12',
            '13',
            '14',
            '15',
          ]),
        );

        // Kiểm chứng khoảng cách xếp tam giác >= 2 * R_ball + 0.4px & hình học miệng lỗ chuẩn WPA
        const rackMetrics = computeTableMetrics(1200, 625);
        expect(rackMetrics.ballRadius / rackMetrics.feltWidth).toBeCloseTo(0.0172, 3);
        expect(rackMetrics.pocketRadius / rackMetrics.ballRadius).toBeCloseTo(1.65, 2);
        expect(rackMetrics.pocketFacings).toHaveLength(12);
        const cornerClearMouth =
          Math.hypot(
            rackMetrics.pocketJaws[0]!.x - rackMetrics.pocketJaws[1]!.x,
            rackMetrics.pocketJaws[0]!.y - rackMetrics.pocketJaws[1]!.y,
          ) -
          rackMetrics.pocketJaws[0]!.r * 2;
        const sideClearMouth =
          Math.hypot(
            rackMetrics.pocketJaws[2]!.x - rackMetrics.pocketJaws[3]!.x,
            rackMetrics.pocketJaws[2]!.y - rackMetrics.pocketJaws[3]!.y,
          ) -
          rackMetrics.pocketJaws[2]!.r * 2;
        expect(cornerClearMouth / (rackMetrics.ballRadius * 2)).toBeGreaterThanOrEqual(2.05);
        expect(sideClearMouth).toBeGreaterThan(cornerClearMouth);
        expect(rackMetrics.returnRailW).toBe(Math.round(rackMetrics.ballRadius * 2 + 10));
        expect(rackMetrics.returnRailBottomY - rackMetrics.returnRailTopY).toBe(
          rackMetrics.tableHeight,
        );
        const rackBalls = buildOfficial15BallRack(rackMetrics);
        expect(rackBalls).toHaveLength(16);
        for (let i = 1; i < rackBalls.length; i += 1) {
          for (let j = i + 1; j < rackBalls.length; j += 1) {
            const bi = rackBalls[i]!;
            const bj = rackBalls[j]!;
            const dist = Math.hypot(bi.x - bj.x, bi.y - bj.y);
            expect(dist).toBeGreaterThanOrEqual(rackMetrics.ballRadius * 2 + 0.4);
          }
        }

        // Kiểm chứng bi lăn dọc sát băng (Rail-Hugging) vào lỗ góc mượt & lăn qua lỗ giữa không bị hút nhầm
        {
          const railCornerWorld = createBilliardsWorld(1200, 625, 'free');
          railCornerWorld.isBreakShot = false;
          for (const b of railCornerWorld.balls) {
            if (b.id !== 0 && b.id !== 1) b.pocketed = true;
          }
          const b1Rail = railCornerWorld.balls.find((b) => b.id === 1)!;
          b1Rail.x = railCornerWorld.metrics.feltLeft + railCornerWorld.metrics.ballRadius * 10;
          b1Rail.y = railCornerWorld.metrics.feltTop + railCornerWorld.metrics.ballRadius + 0.05;
          b1Rail.vx = -5;
          b1Rail.vy = 0;
          b1Rail.sx = -5;
          b1Rail.sy = 0;
          for (let f = 0; f < 400; f += 1) {
            stepBilliardsPhysicsFrame(railCornerWorld, 1 / 120, 0.5, () => undefined);
            if (b1Rail.pocketed || b1Rail.sinking) break;
          }
          expect(b1Rail.pocketed || b1Rail.sinking).toBe(true);

          const railSidePassWorld = createBilliardsWorld(1200, 625, 'free');
          railSidePassWorld.isBreakShot = false;
          for (const b of railSidePassWorld.balls) {
            if (b.id !== 0 && b.id !== 2) b.pocketed = true;
          }
          const b2Rail = railSidePassWorld.balls.find((b) => b.id === 2)!;
          const midFeltX =
            railSidePassWorld.metrics.feltLeft + railSidePassWorld.metrics.feltWidth * 0.5;
          b2Rail.x = midFeltX + railSidePassWorld.metrics.ballRadius * 5;
          b2Rail.y =
            railSidePassWorld.metrics.feltTop + railSidePassWorld.metrics.ballRadius + 0.05;
          b2Rail.vx = -6;
          b2Rail.vy = 0;
          b2Rail.sx = -6;
          b2Rail.sy = 0;
          for (let f = 0; f < 80; f += 1) {
            stepBilliardsPhysicsFrame(railSidePassWorld, 1 / 120, 0.5, () => undefined);
          }
          expect(b2Rail.pocketed || b2Rail.sinking).toBe(false);
          expect(b2Rail.x).toBeLessThan(midFeltX - railSidePassWorld.metrics.ballRadius);
        }

        // Kiểm chứng hàm spinY liên tục qua 0, quãng lăn Coulomb chuẩn bàn thật, Follow/Draw & SIT/Gear Effect
        expect(computeShotLaunchSpeed(0.3)).toBeLessThan(computeShotLaunchSpeed(0.8));
        const cueTinyTop = { x: 0, y: 0, vx: 0, vy: 0, sx: 0, sy: 0, omegaZ: 0 };
        initializeCueBallShot(cueTinyTop, 0, 0.7, 0, 0.02);
        expect(cueTinyTop.sx).toBeGreaterThan(0);
        expect(cueTinyTop.sx).toBeLessThan(cueTinyTop.vx * 0.1);

        // Kiểm chứng quãng lăn Coulomb tại 50% lực >= 1.6 chiều dài bàn (sửa lỗi nỉ dính 0.84 TL cũ)
        const cueRoll50 = { x: 0, y: 0, vx: 0, vy: 0, sx: 0, sy: 0, omegaZ: 0 };
        initializeCueBallShot(cueRoll50, 0, 0.5, 0, 0);
        for (let step = 0; step < 12000; step += 1) {
          integrateClothSlideToRollSubstep(cueRoll50, 1 / SUBSTEPS);
          if (Math.hypot(cueRoll50.vx, cueRoll50.vy) === 0) break;
        }
        expect(cueRoll50.x / rackMetrics.feltWidth).toBeGreaterThanOrEqual(1.6);

        const cueFollow = { x: 0, y: 0, vx: 0, vy: 0, sx: 0, sy: 0, omegaZ: 0 };
        const cueDraw = { x: 0, y: 0, vx: 0, vy: 0, sx: 0, sy: 0, omegaZ: 0 };
        const objA = { x: 25, y: 0, vx: 0, vy: 0, sx: 0, sy: 0, omegaZ: 0 };
        const objB = { x: 25, y: 0, vx: 0, vy: 0, sx: 0, sy: 0, omegaZ: 0 };
        initializeCueBallShot(cueFollow, 0, 0.7, 0, 0.9);
        initializeCueBallShot(cueDraw, 0, 0.7, 0, -0.9);
        expect(cueFollow.sx).toBeGreaterThan(cueFollow.vx);
        expect(cueDraw.sx).toBeLessThan(0);
        resolveRigidBallPairCollision(cueFollow, objA, 1, 0);
        resolveRigidBallPairCollision(cueDraw, objB, 1, 0);
        for (let s = 0; s < 120; s += 1) {
          integrateClothSlideToRollSubstep(cueFollow, 1 / SUBSTEPS);
          integrateClothSlideToRollSubstep(cueDraw, 1 / SUBSTEPS);
        }
        expect(cueFollow.vx).toBeGreaterThan(2.5);
        expect(cueDraw.vx).toBeLessThan(-2.5);

        // Kiểm chứng Spin-Induced Throw (SIT): đánh thẳng với ép phê phải (omegaZ > 0) đẩy bi mục tiêu sang trái (vy < 0) & truyền xoáy ngược (gear)
        const cueSit = { x: 0, y: 0, vx: 10, vy: 0, sx: 0, sy: 0, omegaZ: 1.0 };
        const objSit = { x: 25, y: 0, vx: 0, vy: 0, sx: 0, sy: 0, omegaZ: 0 };
        resolveRigidBallPairCollision(cueSit, objSit, 1, 0);
        expect(objSit.vy).toBeLessThan(-0.05);
        expect(objSit.omegaZ).toBeLessThan(0);

        const englishBall = { x: 0, y: 0, vx: -6, vy: 2, sx: -6, sy: 2, omegaZ: 0.9 };
        applyCushionEnglishBounce(englishBall, 1, 0, 6);
        expect(englishBall.vx).toBeGreaterThan(0);
        expect(Math.abs(englishBall.omegaZ)).toBeLessThan(0.9);

        // Kiểm chứng Luật Khai Cuộc WPA 3.3:
        // (1) Rơi Bi 8 khi khai cuộc KHÔNG thua -> Bi 8 được đặt lại Foot Spot, chờ quyết định 2 phương án
        const eightBreakWorld = createBilliardsWorld(1200, 625, 'two-player');
        eightBreakWorld.isBreakShot = true;
        eightBreakWorld.shotInProgress = true;
        eightBreakWorld.firstHitBallIdThisTurn = 1;
        eightBreakWorld.pocketedIdsThisTurn = [8];
        const eightOnBreak = eightBreakWorld.balls.find((b) => b.id === 8)!;
        eightOnBreak.pocketed = true;
        for (const b of eightBreakWorld.balls) {
          b.vx = 0;
          b.vy = 0;
        }
        stepBilliardsPhysicsFrame(eightBreakWorld, 0.016, 1, () => undefined);
        expect(eightBreakWorld.rackCleared).toBe(false);
        expect(eightOnBreak.pocketed).toBe(false);
        expect(eightBreakWorld.p1Group).toBeNull();
        expect(eightBreakWorld.pendingDecision).toEqual({
          type: 'eight-on-break',
          decidingPlayer: 1,
          breaker: 1,
          scratched: false,
        });
        applyEightOnBreakDecision(eightBreakWorld, 'spot-and-continue');
        expect(eightBreakWorld.pendingDecision).toBeNull();
        expect(eightBreakWorld.currentPlayer).toBe(1);

        // (2) Rơi bi cái lúc khai cuộc (Scratch on Break) -> Ball-in-Hand giới hạn Trong Bếp (kitchen) & mustShootOutOfKitchen
        const scratchBreakWorld = createBilliardsWorld(1200, 625, 'two-player');
        scratchBreakWorld.isBreakShot = true;
        scratchBreakWorld.shotInProgress = true;
        scratchBreakWorld.scratchedThisTurn = true;
        scratchBreakWorld.firstHitBallIdThisTurn = 1;
        scratchBreakWorld.breakRailHitBallIds = [1, 2, 3, 4];
        for (const b of scratchBreakWorld.balls) {
          b.vx = 0;
          b.vy = 0;
        }
        stepBilliardsPhysicsFrame(scratchBreakWorld, 0.016, 1, () => undefined);
        expect(scratchBreakWorld.ballInHand).toBe(true);
        expect(scratchBreakWorld.ballInHandScope).toBe('kitchen');
        expect(scratchBreakWorld.mustShootOutOfKitchen).toBe(true);
        expect(scratchBreakWorld.currentPlayer).toBe(2);

        // (3) Khai cuộc không đủ 4 bi chạm băng & không ăn bi -> Kích hoạt quyết định Illegal Break 3 phương án
        const illegalBreakWorld = createBilliardsWorld(1200, 625, 'two-player');
        illegalBreakWorld.isBreakShot = true;
        illegalBreakWorld.shotInProgress = true;
        illegalBreakWorld.firstHitBallIdThisTurn = 1;
        illegalBreakWorld.breakRailHitBallIds = [1, 2];
        for (const b of illegalBreakWorld.balls) {
          b.vx = 0;
          b.vy = 0;
        }
        stepBilliardsPhysicsFrame(illegalBreakWorld, 0.016, 1, () => undefined);
        expect(illegalBreakWorld.currentPlayer).toBe(2);
        expect(illegalBreakWorld.pendingDecision).toEqual({
          type: 'illegal-break',
          decidingPlayer: 2,
          breaker: 1,
        });
        applyIllegalBreakDecision(illegalBreakWorld, 'accept-table');
        expect(illegalBreakWorld.pendingDecision).toBeNull();
        expect(illegalBreakWorld.currentPlayer).toBe(2);
        expect(illegalBreakWorld.refereeLog.length).toBeGreaterThanOrEqual(2);

        // Kiểm chứng Break Kitchen ("Trong Bếp") & WPA Call-Pocket Bi 8 & Luật No-Rail Foul
        const wpaWorld = createBilliardsWorld(1200, 625, 'two-player');
        expect(isInBreakKitchen(wpaWorld)).toBe(true);
        const clampedKitchen = clampBreakCueBallPlacement(
          wpaWorld,
          wpaWorld.metrics.headStringX + 120,
          wpaWorld.metrics.centerY,
        );
        expect(clampedKitchen.x).toBeLessThanOrEqual(wpaWorld.metrics.headStringX + 1e-3);

        wpaWorld.isBreakShot = false;
        wpaWorld.p1Group = 'solids';
        wpaWorld.p2Group = 'stripes';
        for (const b of wpaWorld.balls) {
          if (b.id >= 1 && b.id <= 7) b.pocketed = true;
        }
        expect(isShootingForEightBall(wpaWorld, 1)).toBe(true);

        // Chạm bi hợp lệ xong dừng mà không có bi nào chạm băng hoặc rơi lỗ -> No-Rail Foul
        const railFoulWorld = createBilliardsWorld(1200, 625, 'two-player');
        railFoulWorld.isBreakShot = false;
        railFoulWorld.p1Group = 'solids';
        railFoulWorld.p2Group = 'stripes';
        railFoulWorld.shotInProgress = true;
        railFoulWorld.firstHitBallIdThisTurn = 1;
        railFoulWorld.railOrPocketAfterFirstHitThisTurn = false;
        for (const b of railFoulWorld.balls) {
          b.vx = 0;
          b.vy = 0;
        }
        stepBilliardsPhysicsFrame(railFoulWorld, 0.016, 1, () => undefined);
        expect(railFoulWorld.ballInHand).toBe(true);
        expect(railFoulWorld.foulMessage).toContain('Không chạm băng');

        // Kiểm chứng AI nhánh dự phòng khi bi mục tiêu bị snooker toàn bộ vẫn tính được cú đánh không treo lượt
        const snookerWorld = createBilliardsWorld(1020, 490, 'vs-ai');
        snookerWorld.isBreakShot = false;
        snookerWorld.currentPlayer = 2;
        snookerWorld.p1Group = 'solids';
        snookerWorld.p2Group = 'stripes';
        const aiCue = snookerWorld.balls[0]!;
        aiCue.x = rackMetrics.feltLeft + 80;
        aiCue.y = rackMetrics.centerY;
        for (const b of snookerWorld.balls) {
          if (b.id === 0) continue;
          if (b.id !== 9 && b.id !== 1 && b.id !== 2 && b.id !== 3) {
            b.pocketed = true;
          }
        }
        const stripeTarget = snookerWorld.balls.find((b) => b.id === 9)!;
        stripeTarget.x = rackMetrics.feltLeft + 260;
        stripeTarget.y = rackMetrics.centerY;
        const b1 = snookerWorld.balls.find((b) => b.id === 1)!;
        const b2 = snookerWorld.balls.find((b) => b.id === 2)!;
        const b3 = snookerWorld.balls.find((b) => b.id === 3)!;
        b1.x = rackMetrics.feltLeft + 170;
        b1.y = rackMetrics.centerY;
        b2.x = rackMetrics.feltLeft + 170;
        b2.y = rackMetrics.centerY - rackMetrics.ballRadius * 2.3;
        b3.x = rackMetrics.feltLeft + 170;
        b3.y = rackMetrics.centerY + rackMetrics.ballRadius * 2.3;
        const snookerPlan = computeAiShotPlan(snookerWorld);
        expect(Number.isFinite(snookerPlan.targetAngle)).toBe(true);
        expect(snookerPlan.targetPower).toBeGreaterThanOrEqual(0.4);

        // Bảng tỷ số 3 phần phía trên: Bạn (7 ô) - Điều khiển trung tâm - Máy AI (7 ô)
        expect(screen.getByTestId('billiards-match-hud')).toBeInTheDocument();
        expect(screen.getByTestId('billiards-p1-card')).toHaveAttribute('data-active', 'true');
        expect(screen.getByTestId('billiards-p2-card')).toHaveAttribute('data-active', 'false');
        expect(screen.getByTestId('p1-slots')).toBeInTheDocument();
        expect(screen.getByTestId('p2-slots')).toBeInTheDocument();
        expect(screen.getByTestId('billiards-status-pill')).toHaveTextContent('Khai cuộc');

        // 3 chế độ chơi: Đấu Máy (mặc định) · 2 Người · Tập tự do
        const vsAiBtn = screen.getByTestId('billiards-mode-vs-ai');
        const twoPlayerBtn = screen.getByTestId('billiards-mode-two-player');
        const freeModeBtn = screen.getByTestId('billiards-mode-free');
        expect(vsAiBtn).toHaveAttribute('aria-pressed', 'true');

        fireEvent.click(twoPlayerBtn);
        expect(twoPlayerBtn).toHaveAttribute('aria-pressed', 'true');
        expect(screen.getByTestId('billiards-p2-card')).toHaveTextContent('Người chơi 2');

        // Ở Tập tự do: ẩn 7 vòng tròn rỗng, thay bằng Số cơ · Combo · Kỷ lục, Đã ăn X / 15 & nút Thử lại cú vừa rồi
        fireEvent.click(freeModeBtn);
        expect(freeModeBtn).toHaveAttribute('aria-pressed', 'true');
        expect(screen.queryByTestId('billiards-p2-card')).not.toBeInTheDocument();
        expect(screen.queryByTestId('p1-slots')).not.toBeInTheDocument();
        expect(screen.getByTestId('billiards-free-stats')).toBeInTheDocument();
        expect(screen.getByTestId('billiards-shot-count')).toHaveTextContent('Số cơ: 0');
        expect(screen.getByTestId('billiards-combo-count')).toHaveTextContent('Combo: x0');
        expect(screen.getByTestId('billiards-best-record')).toHaveTextContent('Kỷ lục:');
        expect(screen.getByTestId('billiards-free-progress')).toHaveTextContent('Đã ăn: 0 / 15');
        const retryBtn = screen.getByTestId('billiards-retry-shot-btn');
        expect(retryBtn).toHaveTextContent('Thử lại cú vừa rồi');
        expect(retryBtn).toBeDisabled();

        // Đánh 1 cơ ở Tập tự do -> mở khóa nút Thử lại cú vừa rồi -> bấm khôi phục thế bi về Số cơ: 0
        const powerSliderFree = screen.getByTestId('billiards-power-slider');
        fireEvent.pointerDown(powerSliderFree, { clientX: 20, clientY: 100, pointerId: 3 });
        fireEvent.pointerMove(powerSliderFree, { clientX: 20, clientY: 220, pointerId: 3 });
        fireEvent.pointerUp(powerSliderFree, { clientX: 20, clientY: 220, pointerId: 3 });
        expect(screen.getByTestId('billiards-shot-count')).toHaveTextContent('Số cơ: 1');
        expect(retryBtn).toBeEnabled();
        fireEvent.click(retryBtn);
        expect(screen.getByTestId('billiards-shot-count')).toHaveTextContent('Số cơ: 0');

        // Kiểm chứng tính hợp lệ Ball-in-Hand & Stereo Panning (-0.85..+0.85)
        expect(computeStereoPan(rackMetrics.feltLeft, rackMetrics)).toBeCloseTo(-0.85, 2);
        expect(computeStereoPan(rackMetrics.feltRight, rackMetrics)).toBeCloseTo(0.85, 2);
        expect(
          isCueBallPlacementValid(
            snookerWorld,
            snookerWorld.metrics.feltLeft + 1,
            snookerWorld.metrics.centerY,
          ),
        ).toBe(false);
        expect(
          isCueBallPlacementValid(
            snookerWorld,
            snookerWorld.metrics.feltLeft + 80,
            snookerWorld.metrics.feltTop + 80,
          ),
        ).toBe(true);

        fireEvent.click(vsAiBtn);
        expect(vsAiBtn).toHaveAttribute('aria-pressed', 'true');
        expect(screen.queryByTestId('billiards-retry-shot-btn')).not.toBeInTheDocument();

        // Nút XOÁY chuyển sang đỉnh cột trái & Popover chỉnh xoáy bi cái 116x116px
        expect(screen.getByText('XOÁY')).toBeInTheDocument();
        expect(screen.queryByTestId('billiards-spin-popover')).not.toBeInTheDocument();
        fireEvent.click(screen.getByTestId('billiards-spin-popup-trigger'));
        expect(screen.getByTestId('billiards-spin-popover')).toBeInTheDocument();
        const spinSelector = screen.getByTestId('billiards-spin-selector');
        expect(spinSelector).toHaveStyle({ width: '116px', height: '116px' });
        expect(screen.getByTestId('billiards-spin-tip')).toBeInTheDocument();
        expect(screen.getByTestId('billiards-spin-mode-label')).toHaveTextContent('Tâm · Stun');
        fireEvent.doubleClick(spinSelector);
        expect(spinSelector).toHaveAttribute('data-spin-x', '0.00');
        expect(spinSelector).toHaveAttribute('data-spin-y', '0.00');

        // Các nút nâng cấp mới: Cấp tia ngắm (Đầy đủ -> CLB -> Pro), Trình độ AI (CLB -> Cơ thủ -> Tập sự) & Chỉ định lỗ WPA
        const guidelineToggle = screen.getByTestId('billiards-guideline-toggle');
        expect(guidelineToggle).toHaveAttribute('data-guideline-mode', 'full');
        fireEvent.click(guidelineToggle);
        expect(guidelineToggle).toHaveAttribute('data-guideline-mode', 'club');
        fireEvent.click(guidelineToggle);
        expect(guidelineToggle).toHaveAttribute('data-guideline-mode', 'pro');
        fireEvent.click(guidelineToggle);
        expect(guidelineToggle).toHaveAttribute('data-guideline-mode', 'full');

        const aiLevelToggle = screen.getByTestId('billiards-ai-level-toggle');
        expect(aiLevelToggle).toHaveAttribute('data-ai-difficulty', 'club');
        fireEvent.click(aiLevelToggle);
        expect(aiLevelToggle).toHaveAttribute('data-ai-difficulty', 'pro');
        fireEvent.click(aiLevelToggle);
        expect(aiLevelToggle).toHaveAttribute('data-ai-difficulty', 'rookie');
        fireEvent.click(aiLevelToggle);
        expect(aiLevelToggle).toHaveAttribute('data-ai-difficulty', 'club');

        const callShotToggle = screen.getByTestId('billiards-callshot-toggle');
        expect(callShotToggle).toHaveTextContent('Luật: CLB');
        expect(callShotToggle).toHaveAttribute('data-rule-set', 'club');
        expect(callShotToggle).toHaveAttribute('aria-pressed', 'false');
        fireEvent.click(callShotToggle);
        expect(callShotToggle).toHaveTextContent('Luật: WPA Pro');
        expect(callShotToggle).toHaveAttribute('data-rule-set', 'wpa-pro');
        expect(callShotToggle).toHaveAttribute('aria-pressed', 'true');
        fireEvent.click(callShotToggle);
        expect(callShotToggle).toHaveAttribute('aria-pressed', 'false');

        const safetyToggle = screen.getByTestId('billiards-safety-toggle');
        expect(safetyToggle).toHaveTextContent('Chạy đạn (Safety)');
        expect(safetyToggle).toBeDisabled(); // Đang cú khai cuộc chưa được tuyên bố Safety

        // 5 vạch khắc mảnh bên trái thanh lực dọc, nút vi chỉnh góc (- / +) & chỉ số KÉO ↓ -> XX%
        expect(screen.getByTestId('billiards-power-ticks').children).toHaveLength(5);
        expect(screen.getByTestId('billiards-power-readout')).toHaveTextContent('KÉO ↓');
        expect(canvas).toHaveClass('bg-transparent');
        fireEvent.click(screen.getByTestId('billiards-fine-aim-minus'));
        fireEvent.click(screen.getByTestId('billiards-fine-aim-plus'));

        // Nút Luật nhanh & Khóa màn hình (Zero-Shift Scroll Lock) & Bối cảnh Sảnh Kiến Trúc
        expect(screen.queryByRole('link', { name: /Bước vào Không gian học tập/i })).toBeNull();
        expect(screen.queryByRole('link', { name: /Kho Thuật ngữ/i })).toBeNull();
        expect(screen.getByTestId('billiards-salon-backdrop')).toBeInTheDocument();
        expect(screen.getByTestId('billiards-salon-backdrop-svg')).toBeInTheDocument();
        expect(screen.getByTestId('billiards-salon-eyebrow')).toBeInTheDocument();
        expect(screen.getByTestId('billiards-ruler-left')).toHaveTextContent(
          'SALON 03 // 9-FT MINERAL TABLE',
        );
        expect(screen.getByTestId('billiards-ruler-right')).toHaveTextContent(
          'WPA 8-BALL // 15 BALLS · 120FPS',
        );
        expect(screen.getByTestId('billiards-focus-vignette')).toBeInTheDocument();

        const lockBtn = screen.getByTestId('billiards-screen-lock-btn');
        expect(lockBtn).toHaveAttribute('aria-pressed', 'false');
        expect(lockBtn).toHaveTextContent('Khóa màn hình');
        fireEvent.click(lockBtn);
        expect(lockBtn).toHaveAttribute('aria-pressed', 'true');
        expect(lockBtn).toHaveTextContent('Đã khóa màn hình · Mở');
        expect(screen.getByTestId('mineral-billiards-stage')).toHaveAttribute(
          'data-screen-locked',
          'true',
        );
        expect(document.documentElement.style.overflow).toBe('hidden');
        expect(document.body.style.overflow).toBe('hidden');
        expect(document.body.style.paddingRight).toMatch(/^\d+px$/);

        fireEvent.keyDown(window, { key: 'Escape' });
        expect(lockBtn).toHaveAttribute('aria-pressed', 'false');
        expect(document.documentElement.style.overflow).toBe('');
        expect(document.body.style.overflow).toBe('');

        fireEvent.keyDown(window, { key: 'l' });
        expect(lockBtn).toHaveAttribute('aria-pressed', 'true');
        fireEvent.keyDown(window, { key: 'L' });
        expect(lockBtn).toHaveAttribute('aria-pressed', 'false');

        fireEvent.click(screen.getByTestId('billiards-rules-btn'));
        expect(screen.getByTestId('billiards-rules-popover')).toHaveTextContent(/Nhấn phím L/i);
        fireEvent.click(screen.getByTestId('rules-tab-wpa'));
        expect(screen.getByTestId('billiards-rules-popover')).toHaveTextContent(
          /không áp dụng.*3 lỗi liên tiếp/i,
        );
        fireEvent.click(screen.getByTestId('rules-tab-log'));
        expect(screen.getByTestId('billiards-referee-log-list')).toBeInTheDocument();
        fireEvent.click(screen.getByTestId('billiards-rules-close-btn'));
        expect(screen.queryByTestId('billiards-rules-popover')).not.toBeInTheDocument();

        const soundBtn = screen.getByTestId('billiards-sound-toggle');
        expect(soundBtn).toHaveAttribute('aria-pressed', 'false');
        fireEvent.click(soundBtn);
        expect(soundBtn).toHaveAttribute('aria-pressed', 'true');

        // Kéo xoay gậy ngắm trên mặt bàn & kéo Thanh lực dọc bên trái để đánh
        fireEvent.pointerDown(canvas, { clientX: 280, clientY: 220, pointerId: 1 });
        fireEvent.pointerMove(canvas, { clientX: 300, clientY: 205, pointerId: 1 });
        fireEvent.pointerUp(canvas, { clientX: 300, clientY: 205, pointerId: 1 });

        const powerSlider = screen.getByTestId('billiards-power-slider');
        expect(powerSlider).toHaveAttribute('data-power', '0');
        fireEvent.pointerDown(powerSlider, { clientX: 20, clientY: 100, pointerId: 2 });
        fireEvent.pointerMove(powerSlider, { clientX: 20, clientY: 220, pointerId: 2 });
        expect(Number(powerSlider.getAttribute('data-power'))).toBeGreaterThanOrEqual(50);
        expect(screen.getByTestId('billiards-power-readout').textContent).toMatch(/^\d+%$/);
        fireEvent.pointerUp(powerSlider, { clientX: 20, clientY: 220, pointerId: 2 });
        expect(powerSlider).toHaveAttribute('data-power', '0');

        // Nút Ván mới đưa trạng thái về Khai cuộc
        fireEvent.click(screen.getByTestId('billiards-new-rack-btn'));
        expect(screen.getByTestId('billiards-status-pill')).toHaveTextContent('Khai cuộc');
      } finally {
        getContextSpy.mockRestore();
      }
    });
  });
});
