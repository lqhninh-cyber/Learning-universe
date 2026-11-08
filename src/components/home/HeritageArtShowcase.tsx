import {
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Compass,
  Landmark,
  Pause,
  Play,
  X,
  ZoomIn,
} from 'lucide-react';
import {
  type MouseEvent as ReactMouseEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import { useReducedMotion } from '@/shared/hooks/useReducedMotion';
import { cn } from '@/shared/lib/cn';

export interface HeritageArtwork {
  readonly id: string;
  readonly title: string;
  readonly originalTitle: string;
  readonly artistOrOrigin: string;
  readonly yearOrEra: string;
  readonly eraAndPeriod: string;
  readonly materialAndTechnique: string;
  readonly archivalLocation: string;
  readonly caption: string;
  readonly academicSignificance: string;
  readonly coreAcademicValue: string;
  readonly imageSrc: string;
  readonly alt: string;
}

/**
 * 05 Kiệt tác nghệ thuật & tư liệu lịch sử đích thực đại diện cho
 * sự giao hòa giữa Toán học, Hình học, Triết học và Nghệ thuật Sư phạm.
 */
export const HERITAGE_ARTWORKS: readonly HeritageArtwork[] = [
  {
    id: 'thay-do-coc',
    title: 'Tranh Thầy đồ Cóc',
    originalTitle: 'Thầy đồ Cóc (Lão Oa giảng học — Tranh khắc gỗ dân gian Đông Hồ)',
    artistOrOrigin: 'Tranh dân gian Đông Hồ',
    yearOrEra: 'Bắc Ninh, Việt Nam',
    eraAndPeriod: 'Thế kỷ XVII – XIX · Thời Lê Trung Hưng – Nguyễn (Làng Đông Hồ, Bắc Ninh)',
    materialAndTechnique:
      'Khắc gỗ thủ công truyền thống (ván in nét gỗ thị, màu tự nhiên từ gạch non, lá chàm, hoa hòe, sỏi son) in trên nền giấy dó quét điệp tự nhiên.',
    archivalLocation:
      'Bảo tàng Mỹ thuật Việt Nam (Hà Nội) & Trung tâm Bảo tồn Tranh dân gian Đông Hồ (Bắc Ninh)',
    caption: 'Tranh dân gian Đông Hồ · Tinh thần tôn sư trọng đạo và hiếu học dân tộc',
    academicSignificance:
      'Bức tranh khắc gỗ mộc mạc biểu trưng sâu sắc cho truyền thống tôn sư trọng đạo ngàn đời. Người thầy đồ Cóc uy nghiêm trên sập gụ giảng bài cho đàn môn sinh ếch nhái hiếu học, thể hiện đạo học bình dân mà cao quý của người Việt.',
    coreAcademicValue:
      'Tác phẩm phản ánh sinh động triết lý giáo dục đại chúng và truyền thống tôn sư trọng đạo của dân tộc Việt Nam. Hình ảnh lớp học thầy đồ Cóc khẳng định vai trò chủ đạo của nhà giáo trong việc khai tâm, truyền thụ tri thức và rèn luyện nhân cách cho người học.',
    imageSrc:
      'https://upload.wikimedia.org/wikipedia/commons/6/67/%E1%BA%BEch_%C4%91i_h%E1%BB%8Dc.JPG',
    alt: 'Tranh dân gian Đông Hồ Thầy đồ Cóc dạy học',
  },
  {
    id: 'khue-van-cac',
    title: 'Khuê Văn Các',
    originalTitle: 'Khuê Văn Các (Gác vẻ đẹp của Sao Khuê — Văn Miếu Quốc Tử Giám)',
    artistOrOrigin: 'Văn Miếu – Quốc Tử Giám',
    yearOrEra: '1805 · Thăng Long – Hà Nội',
    eraAndPeriod: 'Năm Ất Sửu 1805 (Niên hiệu Gia Long thứ 4, Triều Nguyễn) · Thăng Long – Hà Nội',
    materialAndTechnique:
      'Kiến trúc cổ truyền hai tầng tám mái (trùng thiềm điệp ốc); tầng dưới bốn trụ gạch Bát Tràng vuông, tầng trên kết cấu gỗ lim sơn son thếp vàng với cửa tròn tám tiếp tuyến.',
    archivalLocation:
      'Khu di tích Quốc gia Đặc biệt Văn Miếu – Quốc Tử Giám (Số 58 Quốc Tử Giám, Đống Đa, Hà Nội)',
    caption: 'Khuê Văn Các · Biểu tượng văn hiến và đỉnh cao học thuật Thăng Long',
    academicSignificance:
      'Gác Khuê Văn tròn vuông giao hòa soi bóng giếng Thiên Quang, biểu tượng cho sao Khuê chủ quản văn sự. Nơi hội tụ tinh hoa học vấn, đề cao người hiền tài — nguyên khí quốc gia của nền giáo dục khoa cử nghìn năm.',
    coreAcademicValue:
      'Công trình vận dụng chuẩn mực phép đối xứng trục và triết lý hình học Trời tròn Đất vuông (Thiên viên Địa phương), kết tinh tư tưởng hiền tài là nguyên khí quốc gia. Bốn mặt cửa tròn tỏa tám tia tiếp tuyến biểu trưng cho ánh sáng sao Khuê soi rọi văn chương, toán pháp và đạo học.',
    imageSrc:
      'https://images.unsplash.com/photo-1583417319070-4a69db38a482?auto=format&fit=crop&w=1600&q=80',
    alt: 'Kiến trúc Khuê Văn Các soi bóng mặt nước tại Văn Miếu Quốc Tử Giám',
  },
  {
    id: 'melencolia-i',
    title: 'Melencolia I',
    originalTitle: 'Melencolia I (Meisterstiche — Bản khắc bậc thầy số I)',
    artistOrOrigin: 'Albrecht Dürer',
    yearOrEra: '1514 · Nuremberg',
    eraAndPeriod: 'Năm 1514 · Thời kỳ Phục hưng Bắc Âu (Northern Renaissance, Nuremberg, Đức)',
    materialAndTechnique:
      'Bản khắc đồng tinh xảo bằng mũi đục thép (Burin Engraving on Copperplate) in trên giấy sợi bông thủ công, kích thước nguyên bản 24.0 × 18.8 cm.',
    archivalLocation:
      'Staatliche Kunsthalle Karlsruhe (Đức) & Bộ sưu tập Bản khắc tại The Metropolitan Museum of Art (New York)',
    caption: 'Albrecht Dürer (1514) · Sự giao hòa giữa cấu trúc hình học và tư tưởng hàn lâm',
    academicSignificance:
      'Kiệt tác khắc đồng quy tụ khối đa diện cụt (Dürer solid), quả cầu hình học trắc lượng, ma phương bậc 4 và com-pa đo đạc. Tác phẩm kinh điển ghi lại sự chiêm nghiệm sâu sắc của tư duy toán học và hình học trước vũ trụ.',
    coreAcademicValue:
      'Tác phẩm hội tụ các cấu trúc toán học kinh điển: khối đa diện cụt 8 mặt (Dürer Solid), hình cầu chuẩn mực và bảng ma phương bậc 4 có tổng mọi hàng, cột, đường chéo đều bằng 34 (hai ô cuối ghép thành năm 1514). Bản khắc tôn vinh năng lực tư duy trừu tượng của hình học và đại số trong việc giải mã vũ trụ.',
    imageSrc:
      'https://upload.wikimedia.org/wikipedia/commons/1/18/D%C3%BCrer_Melancholia_I.jpg',
    alt: 'Bản khắc đồng Melencolia I của Albrecht Dürer năm 1514',
  },
  {
    id: 'truong-hoc-athena',
    title: 'Trường học Athena (Scuola di Atene)',
    originalTitle: 'La Scuola di Atene (Trường học Athena — Bích họa Phục hưng)',
    artistOrOrigin: 'Raphael (Raffaello Sanzio)',
    yearOrEra: '1509–1511 · Vatican',
    eraAndPeriod: 'Giai đoạn 1509 – 1511 · Đỉnh cao Phục hưng Ý (High Renaissance, Rome)',
    materialAndTechnique:
      'Bích họa trên vữa thạch cao ướt (Buon Fresco), kích thước 500 × 770 cm, kiến tạo theo phép phối cảnh tuyến tính một điểm tụ trung tâm chuẩn xác.',
    archivalLocation:
      'Phòng Chữ ký (Stanza della Segnatura), Điện Tông tòa Vatican (Palazzo Apostolico, Vatican)',
    caption:
      'Raphael (1509–1511) · Đỉnh cao triết học, toán học và tinh thần khai phóng tri thức nhân loại',
    academicSignificance:
      'Bức bích họa đại diện cho sự thống nhất giữa triết học tự nhiên và toán học. Ở trung tâm là Plato chỉ tay lên trời cao ý niệm và Aristotle hướng lòng bàn tay xuống thực tại thế gian; bao quanh là Pythagoras, Euclid và Ptolemy cùng thảo luận định luật vũ trụ.',
    coreAcademicValue:
      'Bức bích họa kiến tạo không gian đối thoại học thuật vĩ đại giữa Plato (Thế giới Ý niệm) và Aristotle (Thực nghiệm luận). Ở tiền cảnh, Pythagoras giảng giải tỷ lệ điều hòa số học và Euclid dùng com-pa chứng minh định lý hình học cho các môn đệ, khẳng định sự gắn kết hữu cơ giữa Toán học và Sư phạm.',
    imageSrc:
      'https://upload.wikimedia.org/wikipedia/commons/4/49/%22The_School_of_Athens%22_by_Raffaello_Sanzio_da_Urbino.jpg',
    alt: 'Bức bích họa Trường học Athena của Raphael tại điện Vatican',
  },
  {
    id: 'nguoi-vitruvius',
    title: "Người Vitruvius (L'Uomo Vitruviano)",
    originalTitle:
      "Le proporzioni del corpo umano secondo Vitruvio (L'Uomo Vitruviano — Người Vitruvius)",
    artistOrOrigin: 'Leonardo da Vinci',
    yearOrEra: 'Khoảng 1490 · Milan',
    eraAndPeriod: 'Khoảng năm 1490 · Thời kỳ Phục hưng Ý (Renaissance, Milan, Italy)',
    materialAndTechnique:
      'Bút sắt, mực nâu (Iron gall ink) và màu nước nhạt trên giấy thủ công, kèm ghi chú bằng chữ viết ngược qua gương (Mirror writing), kích thước 34.6 × 25.5 cm.',
    archivalLocation:
      "Phòng Trưng bày Hàn lâm Venice — Gallerie dell'Accademia (Gabinetto dei Disegni e delle Stampe, Venice, Ý)",
    caption:
      'Leonardo da Vinci (1490) · Tỷ lệ hình học chuẩn mực và sự giao hòa giữa toán học với vẻ đẹp con người',
    academicSignificance:
      'Bản vẽ nghiên cứu kinh điển đặt cơ thể người vào đồng thời hình tròn và hình vuông theo tỷ lệ vàng (Golden Ratio). Tác phẩm minh chứng cho sự hài hòa tuyệt đối giữa giải phẫu học cơ thể con người và định luật hình học vũ trụ.',
    coreAcademicValue:
      'Bản vẽ giải quyết bài toán hình học cổ điển qua việc đặt cơ thể người nội tiếp đồng thời trong hình vuông và hình tròn đồng điệu theo tỷ lệ chuẩn của kiến trúc sư Vitruvius. Tác phẩm là biểu tượng bất hủ của tinh thần nhân văn, nơi con người đứng ở tâm điểm giao hòa giữa chuẩn mực toán học và tự nhiên.',
    imageSrc:
      'https://upload.wikimedia.org/wikipedia/commons/2/22/Da_Vinci_Vitruve_Luc_Viatour.jpg',
    alt: 'Bản vẽ tỷ lệ Người Vitruvius của Leonardo da Vinci',
  },
] as const;

const ROTATION_INTERVAL_MS = 20000;
const FADE_TRANSITION_MS = 350;

export function HeritageArtShowcase() {
  const prefersReducedMotion = useReducedMotion();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFading, setIsFading] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [isMetadataOpen, setIsMetadataOpen] = useState(false);

  // Trạng thái Kính lúp khảo sát vi mô (Archival Zoom Lens)
  const [isLensActive, setIsLensActive] = useState(false);
  const [lensPosition, setLensPosition] = useState<{
    x: number;
    y: number;
    percentX: number;
    percentY: number;
  }>({
    x: 120,
    y: 90,
    percentX: 50,
    percentY: 50,
  });

  const frameRef = useRef<HTMLDivElement>(null);

  const totalArtworks = HERITAGE_ARTWORKS.length;
  const currentArtwork = HERITAGE_ARTWORKS[currentIndex] ?? HERITAGE_ARTWORKS[0]!;

  const goToArtwork = useCallback(
    (newIndex: number) => {
      setImageError(false);
      if (prefersReducedMotion) {
        setCurrentIndex((newIndex + totalArtworks) % totalArtworks);
        return;
      }
      setIsFading(true);
      window.setTimeout(() => {
        setCurrentIndex((newIndex + totalArtworks) % totalArtworks);
        setIsFading(false);
      }, FADE_TRANSITION_MS);
    },
    [prefersReducedMotion, totalArtworks],
  );

  const handleNext = useCallback(() => {
    goToArtwork(currentIndex + 1);
  }, [currentIndex, goToArtwork]);

  const handlePrev = useCallback(() => {
    goToArtwork(currentIndex - 1);
  }, [currentIndex, goToArtwork]);

  // Luân phiên tự động mỗi 20 giây khi không tạm dừng do hover hoặc đang đọc lược sử
  useEffect(() => {
    if (isPaused || isMetadataOpen) {
      return;
    }
    const timer = window.setInterval(() => {
      handleNext();
    }, ROTATION_INTERVAL_MS);

    return () => {
      window.clearInterval(timer);
    };
  }, [handleNext, isMetadataOpen, isPaused]);

  const handleFrameMouseMove = (event: ReactMouseEvent<HTMLDivElement>) => {
    if (!frameRef.current || imageError) {
      return;
    }
    const rect = frameRef.current.getBoundingClientRect();
    if (rect.width <= 0 || rect.height <= 0) {
      return;
    }
    const rawX = event.clientX - rect.left;
    const rawY = event.clientY - rect.top;
    const clampedX = Math.max(0, Math.min(rect.width, rawX));
    const clampedY = Math.max(0, Math.min(rect.height, rawY));
    const percentX = Math.max(0, Math.min(100, (clampedX / rect.width) * 100));
    const percentY = Math.max(0, Math.min(100, (clampedY / rect.height) * 100));

    setLensPosition({
      x: clampedX,
      y: clampedY,
      percentX,
      percentY,
    });
  };

  const formattedIndex = String(currentIndex + 1).padStart(2, '0');
  const formattedTotal = String(totalArtworks).padStart(2, '0');

  return (
    <div
      data-testid="heritage-art-showcase"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => {
        setIsPaused(false);
        setIsLensActive(false);
      }}
      className="relative mx-auto flex w-full max-w-2xl flex-col rounded-3xl border border-[#CFDADB] bg-[#F7FAFA]/85 p-5 shadow-sm backdrop-blur-md transition-all duration-300 hover:border-[#3F6570]/40 sm:p-6"
    >
      {/* Top Header Bar */}
      <div className="mb-3 flex items-center justify-between gap-2 border-b border-[#CFDADB]/60 pb-3">
        <div className="flex items-center gap-2">
          <Landmark className="h-3.5 w-3.5 text-[#3F6570]" aria-hidden="true" />
          <span className="font-mono text-[10px] font-semibold tracking-widest text-[#3F6570] uppercase">
            DI SẢN HỌC THUẬT &amp; NGHỆ THUẬT
          </span>
        </div>

        <div className="flex items-center gap-2.5">
          <span className="font-mono text-[11px] font-medium text-[#55676B]">
            {formattedIndex} / {formattedTotal}
          </span>

          {/* Dots Indicator */}
          <div className="hidden items-center gap-1.5 sm:flex" role="tablist">
            {HERITAGE_ARTWORKS.map((art, idx) => (
              <button
                key={art.id}
                type="button"
                onClick={() => goToArtwork(idx)}
                aria-label={`Chuyển đến tác phẩm ${idx + 1}: ${art.title}`}
                className={cn(
                  'h-1.5 rounded-full transition-all duration-300',
                  idx === currentIndex
                    ? 'w-5 bg-[#3F6570]'
                    : 'w-1.5 bg-[#CFDADB] hover:bg-[#5E786D]',
                )}
              />
            ))}
          </div>

          {/* Nút điều khiển lật trang */}
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={handlePrev}
              aria-label="Tác phẩm trước"
              className="inline-flex h-6 w-6 cursor-pointer items-center justify-center rounded-lg border border-[#CFDADB] bg-[#F7FAFA] text-[#55676B] transition-colors hover:border-[#3F6570] hover:text-[#29383D]"
            >
              <ChevronLeft className="h-3.5 w-3.5" aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={() => setIsPaused((prev) => !prev)}
              aria-label={isPaused ? 'Tiếp tục trình chiếu tác phẩm' : 'Tạm dừng trình chiếu'}
              className="inline-flex h-6 w-6 cursor-pointer items-center justify-center rounded-lg border border-[#CFDADB] bg-[#F7FAFA] text-[#55676B] transition-colors hover:border-[#3F6570] hover:text-[#29383D]"
            >
              {isPaused ? (
                <Play className="h-3 w-3" aria-hidden="true" />
              ) : (
                <Pause className="h-3 w-3" aria-hidden="true" />
              )}
            </button>
            <button
              type="button"
              onClick={handleNext}
              aria-label="Tác phẩm tiếp theo"
              className="inline-flex h-6 w-6 cursor-pointer items-center justify-center rounded-lg border border-[#CFDADB] bg-[#F7FAFA] text-[#55676B] transition-colors hover:border-[#3F6570] hover:text-[#29383D]"
            >
              <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>

      {/* Frame Trưng bày Hình ảnh Tác phẩm đích thực + Kính lúp khảo sát 2x */}
      <div
        ref={frameRef}
        data-testid="heritage-art-frame"
        onMouseEnter={() => {
          if (!imageError) {
            setIsLensActive(true);
          }
        }}
        onMouseLeave={() => setIsLensActive(false)}
        onMouseMove={handleFrameMouseMove}
        className={cn(
          'relative aspect-[16/10] w-full overflow-hidden rounded-2xl border border-[#CFDADB] bg-[#E1E9EA]/60 shadow-inner',
          !imageError && 'cursor-crosshair',
        )}
      >
        {imageError ? (
          <div className="flex h-full w-full flex-col items-center justify-center p-6 text-center text-[#55676B]">
            <Compass className="h-8 w-8 text-[#3F6570] opacity-50" aria-hidden="true" />
            <p className="mt-2 font-serif text-sm font-semibold text-[#29383D]">
              {currentArtwork.title}
            </p>
            <p className="mt-1 font-mono text-xs text-[#55676B]">{currentArtwork.caption}</p>
          </div>
        ) : (
          <img
            src={currentArtwork.imageSrc}
            alt={currentArtwork.alt}
            onError={() => setImageError(true)}
            className={cn(
              'h-full w-full object-cover object-center transition-opacity duration-700 ease-in-out select-none',
              isFading ? 'opacity-0' : 'opacity-100',
            )}
          />
        )}

        {/* Vòng tròn Kính lúp Khảo sát Vi mô 2x (Archival Zoom Lens) */}
        {isLensActive && !imageError && (
          <div
            data-testid="archival-zoom-lens"
            aria-hidden="true"
            className="pointer-events-none absolute z-20 h-24 w-24 -translate-x-1/2 -translate-y-1/2 rounded-full border border-[#718C7E] bg-white/20 shadow-xl backdrop-contrast-125"
            style={{
              left: `${lensPosition.x}px`,
              top: `${lensPosition.y}px`,
              backgroundImage: `url("${currentArtwork.imageSrc}")`,
              backgroundRepeat: 'no-repeat',
              backgroundSize: '220% 220%',
              backgroundPosition: `${lensPosition.percentX}% ${lensPosition.percentY}%`,
            }}
          >
            {/* Thập tự tâm điểm vi mô */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="h-3 w-[1px] bg-[#718C7E]/60" />
              <div className="absolute h-[1px] w-3 bg-[#718C7E]/60" />
            </div>
            <span className="absolute bottom-1 left-1/2 -translate-x-1/2 rounded bg-[#29383D]/80 px-1.5 py-0.5 font-mono text-[8px] tracking-wider text-[#F7FAFA]">
              2.0x
            </span>
          </div>
        )}

        {/* Nhãn chỉ dẫn Kính lúp góc trái trên */}
        {!imageError && (
          <div className="pointer-events-none absolute top-3 left-3 inline-flex items-center gap-1.5 rounded-lg border border-[#CFDADB]/60 bg-[#F7FAFA]/85 px-2.5 py-1 text-[10px] font-medium text-[#55676B] backdrop-blur-md">
            <ZoomIn className="h-3 w-3 text-[#3F6570]" aria-hidden="true" />
            <span className="font-mono">Kính lúp khảo sát 2x</span>
          </div>
        )}

        {/* Lớp bóng mờ nhẹ bên dưới ảnh tạo độ sâu học thuật */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#29383D]/40 via-transparent to-transparent"
        />

        {/* Thẻ năm tháng / xuất xứ ở góc ảnh */}
        <div className="pointer-events-none absolute right-3 bottom-3 rounded-lg border border-[#CFDADB]/60 bg-[#F7FAFA]/90 px-2.5 py-1 backdrop-blur-md">
          <span className="font-mono text-[10px] font-semibold text-[#3F6570]">
            {currentArtwork.yearOrEra}
          </span>
        </div>
      </div>

      {/* Thông tin tác phẩm, Chú giải học thuật & Nút [Lược sử tác phẩm] */}
      <div
        className={cn(
          'mt-4 transition-opacity duration-700 ease-in-out',
          isFading ? 'opacity-0' : 'opacity-100',
        )}
      >
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h3 className="font-serif text-base font-bold text-[#29383D] sm:text-lg">
            {currentArtwork.title}
          </h3>
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-semibold text-[#3F6570]">
              {currentArtwork.artistOrOrigin}
            </span>
            <button
              type="button"
              onClick={() => setIsMetadataOpen((prev) => !prev)}
              aria-expanded={isMetadataOpen}
              data-testid="archival-metadata-trigger"
              className="cursor-pointer rounded-md border border-[#CFDADB] bg-[#F7FAFA]/90 px-2.5 py-1 font-mono text-[11px] text-[#3F6570] transition-colors hover:bg-[#E1E9EA]"
            >
              [Lược sử tác phẩm]
            </button>
          </div>
        </div>

        <p className="mt-1 font-serif text-xs text-[#718C7E] italic">{currentArtwork.caption}</p>

        <p className="mt-2 text-xs leading-relaxed text-[#55676B]">
          {currentArtwork.academicSignificance}
        </p>

        {/* Thẻ Lược sử Văn bản (Archival Metadata Popover / Drawer) */}
        {isMetadataOpen && (
          <div
            data-testid="archival-metadata-popover"
            role="region"
            aria-label={`Hồ sơ văn khố: ${currentArtwork.title}`}
            className="mt-4 rounded-2xl border border-[#CFDADB] bg-[#EAF0F1]/90 p-4 text-xs shadow-xs"
          >
            <div className="mb-3 flex items-center justify-between border-b border-[#CFDADB] pb-2">
              <div className="flex items-center gap-2 font-mono text-[10px] font-semibold tracking-wider text-[#3F6570] uppercase">
                <BookOpen className="h-3.5 w-3.5" aria-hidden="true" />
                <span>HỒ SƠ LƯỢC SỬ &amp; VĂN KHỐ TÁC PHẨM</span>
              </div>
              <button
                type="button"
                onClick={() => setIsMetadataOpen(false)}
                aria-label="Đóng lược sử tác phẩm"
                className="inline-flex h-5 w-5 cursor-pointer items-center justify-center rounded border border-[#CFDADB] bg-[#F7FAFA] text-[#55676B] hover:text-[#29383D]"
              >
                <X className="h-3 w-3" aria-hidden="true" />
              </button>
            </div>

            <dl className="space-y-2 text-xs leading-relaxed">
              <div className="grid grid-cols-1 gap-0.5 sm:grid-cols-12 sm:gap-2">
                <dt className="font-mono text-[11px] font-semibold text-[#3F6570] sm:col-span-4">
                  Tác phẩm:
                </dt>
                <dd className="font-serif font-medium text-[#29383D] sm:col-span-8">
                  {currentArtwork.originalTitle}
                </dd>
              </div>

              <div className="grid grid-cols-1 gap-0.5 sm:grid-cols-12 sm:gap-2">
                <dt className="font-mono text-[11px] font-semibold text-[#3F6570] sm:col-span-4">
                  Niên đại &amp; Thời kỳ:
                </dt>
                <dd className="text-[#29383D] sm:col-span-8">{currentArtwork.eraAndPeriod}</dd>
              </div>

              <div className="grid grid-cols-1 gap-0.5 sm:grid-cols-12 sm:gap-2">
                <dt className="font-mono text-[11px] font-semibold text-[#3F6570] sm:col-span-4">
                  Chất liệu &amp; Kỹ thuật:
                </dt>
                <dd className="text-[#55676B] sm:col-span-8">
                  {currentArtwork.materialAndTechnique}
                </dd>
              </div>

              <div className="grid grid-cols-1 gap-0.5 sm:grid-cols-12 sm:gap-2">
                <dt className="font-mono text-[11px] font-semibold text-[#3F6570] sm:col-span-4">
                  Nơi lưu trữ gốc:
                </dt>
                <dd className="text-[#29383D] sm:col-span-8">{currentArtwork.archivalLocation}</dd>
              </div>

              <div className="grid grid-cols-1 gap-0.5 border-t border-[#CFDADB]/70 pt-2 sm:grid-cols-12 sm:gap-2">
                <dt className="font-mono text-[11px] font-semibold text-[#92714F] sm:col-span-4">
                  Giá trị học thuật cốt lõi:
                </dt>
                <dd className="text-[#29383D] sm:col-span-8">
                  {currentArtwork.coreAcademicValue}
                </dd>
              </div>
            </dl>
          </div>
        )}
      </div>
    </div>
  );
}
