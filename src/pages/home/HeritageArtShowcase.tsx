import { ChevronLeft, ChevronRight, Compass, Landmark, Pause, Play } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { useReducedMotion } from '@/shared/hooks/useReducedMotion';
import { cn } from '@/shared/lib/cn';

export interface HeritageArtwork {
  readonly id: string;
  readonly title: string;
  readonly artistOrOrigin: string;
  readonly yearOrEra: string;
  readonly caption: string;
  readonly academicSignificance: string;
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
    artistOrOrigin: 'Tranh dân gian Đông Hồ',
    yearOrEra: 'Bắc Ninh, Việt Nam',
    caption: 'Tranh dân gian Đông Hồ · Tinh thần tôn sư trọng đạo và hiếu học dân tộc',
    academicSignificance:
      'Bức tranh khắc gỗ mộc mạc biểu trưng sâu sắc cho truyền thống tôn sư trọng đạo ngàn đời. Người thầy đồ Cóc uy nghiêm trên sập gụ giảng bài cho đàn môn sinh ếch nhái hiếu học, thể hiện đạo học bình dân mà cao quý của người Việt.',
    imageSrc:
      'https://upload.wikimedia.org/wikipedia/commons/6/67/%E1%BA%BEch_%C4%91i_h%E1%BB%8Dc.JPG',
    alt: 'Tranh dân gian Đông Hồ Thầy đồ Cóc dạy học',
  },
  {
    id: 'khue-van-cac',
    title: 'Khuê Văn Các',
    artistOrOrigin: 'Văn Miếu – Quốc Tử Giám',
    yearOrEra: '1805 · Thăng Long – Hà Nội',
    caption: 'Khuê Văn Các · Biểu tượng văn hiến và đỉnh cao học thuật Thăng Long',
    academicSignificance:
      'Gác Khuê Văn tròn vuông giao hòa soi bóng giếng Thiên Quang, biểu tượng cho sao Khuê chủ quản văn sự. Nơi hội tụ tinh hoa học vấn, đề cao người hiền tài — nguyên khí quốc gia của nền giáo dục khoa cử nghìn năm.',
    imageSrc:
      'https://images.unsplash.com/photo-1583417319070-4a69db38a482?auto=format&fit=crop&w=1600&q=80',
    alt: 'Kiến trúc Khuê Văn Các soi bóng mặt nước tại Văn Miếu Quốc Tử Giám',
  },
  {
    id: 'melencolia-i',
    title: 'Melencolia I',
    artistOrOrigin: 'Albrecht Dürer',
    yearOrEra: '1514 · Nuremberg',
    caption: 'Albrecht Dürer (1514) · Sự giao hòa giữa cấu trúc hình học và tư tưởng hàn lâm',
    academicSignificance:
      'Kiệt tác khắc đồng quy tụ khối đa diện cụt (Dürer solid), quả cầu hình học trắc lượng, ma phương bậc 4 và com-pa đo đạc. Tác phẩm kinh điển ghi lại sự chiêm nghiệm sâu sắc của tư duy toán học và hình học trước vũ trụ.',
    imageSrc: 'https://upload.wikimedia.org/wikipedia/commons/1/18/D%C3%BCrer_Melancholia_I.jpg',
    alt: 'Bản khắc đồng Melencolia I của Albrecht Dürer năm 1514',
  },
  {
    id: 'truong-hoc-athena',
    title: 'Trường học Athena (Scuola di Atene)',
    artistOrOrigin: 'Raphael (Raffaello Sanzio)',
    yearOrEra: '1509–1511 · Vatican',
    caption:
      'Raphael (1509–1511) · Đỉnh cao triết học, toán học và tinh thần khai phóng tri thức nhân loại',
    academicSignificance:
      'Bức bích họa đại diện cho sự thống nhất giữa triết học tự nhiên và toán học. Ở trung tâm là Plato chỉ tay lên trời cao ý niệm và Aristotle hướng lòng bàn tay xuống thực tại thế gian; bao quanh là Pythagoras, Euclid và Ptolemy cùng thảo luận định luật vũ trụ.',
    imageSrc:
      'https://upload.wikimedia.org/wikipedia/commons/4/49/%22The_School_of_Athens%22_by_Raffaello_Sanzio_da_Urbino.jpg',
    alt: 'Bức bích họa Trường học Athena của Raphael tại điện Vatican',
  },
  {
    id: 'nguoi-vitruvius',
    title: "Người Vitruvius (L'Uomo Vitruviano)",
    artistOrOrigin: 'Leonardo da Vinci',
    yearOrEra: 'Khoảng 1490 · Milan',
    caption:
      'Leonardo da Vinci (1490) · Tỷ lệ hình học chuẩn mực và sự giao hòa giữa toán học với vẻ đẹp con người',
    academicSignificance:
      'Bản vẽ nghiên cứu kinh điển đặt cơ thể người vào đồng thời hình tròn và hình vuông theo tỷ lệ vàng (Golden Ratio). Tác phẩm minh chứng cho sự hài hòa tuyệt đối giữa giải phẫu học cơ thể con người và định luật hình học vũ trụ.',
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

  // Luân phiên tự động mỗi 20 giây khi không tạm dừng do hover
  useEffect(() => {
    if (isPaused) {
      return;
    }
    const timer = window.setInterval(() => {
      handleNext();
    }, ROTATION_INTERVAL_MS);

    return () => {
      window.clearInterval(timer);
    };
  }, [handleNext, isPaused]);

  const formattedIndex = String(currentIndex + 1).padStart(2, '0');
  const formattedTotal = String(totalArtworks).padStart(2, '0');

  return (
    <div
      data-testid="heritage-art-showcase"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
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

      {/* Frame Trưng bày Hình ảnh Tác phẩm đích thực */}
      <div className="relative aspect-[16/10] w-full overflow-hidden rounded-2xl border border-[#CFDADB] bg-[#E1E9EA]/60 shadow-inner">
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
              'h-full w-full object-cover object-center transition-opacity duration-700 ease-in-out',
              isFading ? 'opacity-0' : 'opacity-100',
            )}
          />
        )}

        {/* Lớp bóng mờ nhẹ bên dưới ảnh tạo độ sâu học thuật */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#29383D]/40 via-transparent to-transparent"
        />

        {/* Thẻ năm tháng / xuất xứ ở góc ảnh */}
        <div className="absolute right-3 bottom-3 rounded-lg border border-[#CFDADB]/60 bg-[#F7FAFA]/90 px-2.5 py-1 backdrop-blur-md">
          <span className="font-mono text-[10px] font-semibold text-[#3F6570]">
            {currentArtwork.yearOrEra}
          </span>
        </div>
      </div>

      {/* Thông tin tác phẩm & Chú giải học thuật */}
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
          <span className="font-mono text-xs font-semibold text-[#3F6570]">
            {currentArtwork.artistOrOrigin}
          </span>
        </div>

        <p className="mt-1 font-serif text-xs text-[#718C7E] italic">{currentArtwork.caption}</p>

        <p className="mt-2 text-xs leading-relaxed text-[#55676B]">
          {currentArtwork.academicSignificance}
        </p>
      </div>
    </div>
  );
}
