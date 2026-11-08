import {
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Compass,
  Landmark,
  Pause,
  Play,
  X,
} from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
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
 * 10 Kiệt tác nghệ thuật & tư liệu lịch sử đích thực đại diện cho
 * sự giao hòa giữa Toán học, Hình học, Triết học và Nghệ thuật Sư phạm.
 */
export const HERITAGE_ARTWORKS: readonly HeritageArtwork[] = [
  {
    id: 'thay-do-coc',
    title: 'Thầy đồ Cóc (Tranh dân gian Đông Hồ)',
    originalTitle: 'Thầy đồ Cóc (Lão Oa giảng học — Tranh khắc gỗ dân gian Đông Hồ)',
    artistOrOrigin: 'Nghệ nhân dân gian Việt Nam',
    yearOrEra: 'Thế kỷ XVII – XIX · Bắc Ninh',
    eraAndPeriod: 'Thế kỷ XVII – XIX · Làng Đông Hồ, Bắc Ninh',
    materialAndTechnique:
      'Khắc gỗ thủ công truyền thống (ván in nét gỗ thị, màu tự nhiên từ gạch non, lá chàm, hoa hòe, sỏi son) in trên nền giấy dó quét điệp tự nhiên.',
    archivalLocation:
      'Bảo tàng Mỹ thuật Việt Nam (Hà Nội) & Trung tâm Bảo tồn Tranh dân gian Đông Hồ (Bắc Ninh)',
    caption: 'Tranh dân gian Đông Hồ · Tinh thần tôn sư trọng đạo và hiếu học dân tộc',
    academicSignificance:
      'Bức tranh khắc gỗ mộc mạc biểu trưng sâu sắc cho truyền thống tôn sư trọng đạo ngàn đời. Người thầy đồ Cóc uy nghiêm trên sập gụ giảng bài cho đàn môn sinh ếch nhái hiếu học, thể hiện đạo học bình dân mà cao quý của người Việt.',
    coreAcademicValue:
      'Tinh thần tôn sư trọng đạo, sự bình đẳng trong tiếp cận con chữ và truyền thống hiếu học ngàn đời của dân tộc.',
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
    eraAndPeriod: '1805 · Thăng Long - Hà Nội',
    materialAndTechnique:
      'Kiến trúc cổ truyền hai tầng tám mái (trùng thiềm điệp ốc); tầng dưới bốn trụ gạch Bát Tràng vuông, tầng trên kết cấu gỗ lim sơn son thếp vàng với cửa tròn tám tiếp tuyến.',
    archivalLocation:
      'Khu di tích Quốc gia Đặc biệt Văn Miếu – Quốc Tử Giám (Số 58 Quốc Tử Giám, Đống Đa, Hà Nội)',
    caption: 'Khuê Văn Các · Biểu tượng văn hiến và đỉnh cao học thuật Thăng Long',
    academicSignificance:
      'Gác Khuê Văn tròn vuông giao hòa soi bóng giếng Thiên Quang, biểu trưng cho sao Khuê chủ quản văn sự và đỉnh cao văn hiến Thăng Long. Nơi hội tụ tinh hoa học vấn, đề cao người hiền tài — nguyên khí quốc gia của nền giáo dục khoa cử nghìn năm.',
    coreAcademicValue:
      'Gác Khuê Văn tròn vuông giao hòa soi bóng giếng Thiên Quang, biểu trưng cho sao Khuê chủ quản văn sự và đỉnh cao văn hiến Thăng Long.',
    imageSrc: 'https://upload.wikimedia.org/wikipedia/commons/7/77/Khu%C3%AA_v%C4%83n_c%C3%A1c.jpg',
    alt: 'Kiến trúc Khuê Văn Các Văn Miếu Thăng Long Hà Nội',
  },
  {
    id: 'melencolia-i',
    title: 'Melencolia I',
    originalTitle: 'Melencolia I (Meisterstiche — Bản khắc bậc thầy số I)',
    artistOrOrigin: 'Albrecht Dürer',
    yearOrEra: '1514 · Nuremberg, Đức',
    eraAndPeriod: '1514 · Nuremberg, Đức',
    materialAndTechnique:
      'Bản khắc đồng tinh xảo bằng mũi đục thép (Burin Engraving on Copperplate) in trên giấy sợi bông thủ công, kích thước nguyên bản 24.0 × 18.8 cm.',
    archivalLocation:
      'Staatliche Kunsthalle Karlsruhe (Đức) & The Metropolitan Museum of Art (New York)',
    caption: 'Albrecht Dürer (1514) · Sự giao hòa giữa cấu trúc hình học và tư tưởng hàn lâm',
    academicSignificance:
      'Kiệt tác khắc đồng quy tụ khối đa diện cụt (Dürer solid), quả cầu hình học trắc lượng, ma phương bậc 4 và com-pa đo đạc. Tác phẩm kinh điển ghi lại sự chiêm nghiệm sâu sắc của tư duy toán học và hình học trước vũ trụ.',
    coreAcademicValue:
      'Sự giao hòa vĩ đại giữa cấu trúc hình học (hình bát diện cụt, ô vuông ma thuật bậc 4) và chiều sâu tư tưởng hàn lâm thời Phục Hưng.',
    imageSrc: 'https://upload.wikimedia.org/wikipedia/commons/1/18/D%C3%BCrer_Melancholia_I.jpg',
    alt: 'Bản khắc đồng Melencolia I của Albrecht Dürer năm 1514',
  },
  {
    id: 'truong-hoc-athena',
    title: 'Trường học Athena (Scuola di Atene)',
    originalTitle: 'La Scuola di Atene (Trường học Athena — Bích họa Phục hưng)',
    artistOrOrigin: 'Raphael (Raffaello Sanzio)',
    yearOrEra: '1509 – 1511 · Vatican',
    eraAndPeriod: '1509 – 1511 · Điện Tông Tòa, Vatican',
    materialAndTechnique:
      'Bích họa trên vữa thạch cao ướt (Buon Fresco), kích thước 500 × 770 cm, kiến tạo theo phép phối cảnh tuyến tính một điểm tụ trung tâm chuẩn xác.',
    archivalLocation:
      'Phòng Chữ ký (Stanza della Segnatura), Điện Tông tòa Vatican (Palazzo Apostolico, Vatican)',
    caption:
      'Raphael (1509–1511) · Đỉnh cao triết học, toán học và tinh thần khai phóng tri thức nhân loại',
    academicSignificance:
      'Bức bích họa đại diện cho sự thống nhất giữa triết học tự nhiên và toán học. Ở trung tâm là Plato chỉ tay lên trời cao ý niệm và Aristotle hướng lòng bàn tay xuống thực tại thế gian; bao quanh là Pythagoras, Euclid và Ptolemy cùng thảo luận định luật vũ trụ.',
    coreAcademicValue:
      'Đỉnh cao triết học, toán học và tinh thần khai phóng tri thức nhân loại với sự hội tụ của Plato, Aristotle, Pythagoras và Euclid.',
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
    yearOrEra: 'Khoảng 1490 · Milan, Ý',
    eraAndPeriod: 'Khoảng 1490 · Milan, Ý',
    materialAndTechnique:
      'Bút sắt, mực nâu (Iron gall ink) và màu nước nhạt trên giấy thủ công, kèm ghi chú bằng chữ viết ngược qua gương (Mirror writing), kích thước 34.6 × 25.5 cm.',
    archivalLocation:
      "Phòng Trưng bày Hàn lâm Venice — Gallerie dell'Accademia (Gabinetto dei Disegni e delle Stampe, Venice, Ý)",
    caption:
      'Leonardo da Vinci (1490) · Tỷ lệ hình học chuẩn mực và sự giao hòa giữa toán học với vẻ đẹp con người',
    academicSignificance:
      'Bản vẽ nghiên cứu kinh điển đặt cơ thể người vào đồng thời hình tròn và hình vuông theo tỷ lệ vàng (Golden Ratio). Tác phẩm minh chứng cho sự hài hòa tuyệt đối giữa giải phẫu học cơ thể con người và định luật hình học vũ trụ.',
    coreAcademicValue:
      'Bản vẽ nghiên cứu đặt cơ thể người vào đồng thời hình tròn và hình vuông theo tỷ lệ vàng, minh chứng cho sự hài hòa giữa giải phẫu học và định luật hình học vũ trụ.',
    imageSrc:
      'https://upload.wikimedia.org/wikipedia/commons/2/22/Da_Vinci_Vitruve_Luc_Viatour.jpg',
    alt: 'Bản vẽ tỷ lệ Người Vitruvius của Leonardo da Vinci',
  },
  {
    id: 'bia-tien-si',
    title: '82 Bia Tiến sĩ Văn Miếu Thăng Long',
    originalTitle: '82 Bia Tiến sĩ Văn Miếu – Quốc Tử Giám (Thạch bi đề danh tiến sĩ khoa thị)',
    artistOrOrigin: 'Triều Lê - Mạc - Lê Trung Hưng',
    yearOrEra: '1484 – 1780 · Hà Nội, Việt Nam',
    eraAndPeriod: '1484 – 1780 · Hà Nội, Việt Nam',
    materialAndTechnique:
      'Đá xanh nguyên khối đục đẽo thủ công, khắc chữ Hán chân phương tinh xảo, dựng trên lưng rùa đá (quy phụ thạch bi) tượng trưng cho sự trường tồn vĩnh cửu.',
    archivalLocation: 'Vườn bia Văn Miếu – Quốc Tử Giám, Hà Nội (Di sản Tư liệu Thế giới UNESCO)',
    caption: 'Triều Lê - Mạc - Lê Trung Hưng · Hiền tài là nguyên khí của quốc gia',
    academicSignificance:
      'Hệ thống 82 bia đá ghi danh các khoa thi tiến sĩ từ năm 1442 đến 1779. Nổi bật là bài văn bia năm 1442 do Thân Nhân Trung soạn thảo với lời răn bất hủ khẳng định vai trò sống còn của giáo dục và tri thức đối với sự hưng thịnh của quốc gia.',
    coreAcademicValue:
      'Di sản Tư liệu Thế giới UNESCO · Tấm gương phản chiếu truyền thống trọng dụng nhân tài với tư tưởng bất hủ "Hiền tài là nguyên khí của quốc gia".',
    imageSrc: 'https://upload.wikimedia.org/wikipedia/commons/c/cd/BiaTienSi1442.jpg',
    alt: 'Bia Tiến sĩ khoa Nhâm Tuất 1442 tại Văn Miếu Quốc Tử Giám Hà Nội',
  },
  {
    id: 'trong-dong-ngoc-lu',
    title: 'Mặt Trống đồng Ngọc Lũ',
    originalTitle: 'Mặt Trống đồng Ngọc Lũ (Bảo vật Quốc gia số 1 — Văn hóa Đông Sơn)',
    artistOrOrigin: 'Cư dân Việt cổ (Bảo vật Quốc gia)',
    yearOrEra: 'Thế kỷ II – III TCN · Văn hóa Đông Sơn',
    eraAndPeriod: 'Thế kỷ II – III TCN · Văn hóa Đông Sơn',
    materialAndTechnique:
      'Đúc đồng bằng khuôn nhiều mang (khuôn sáp chảy kết hợp đất sét chịu nhiệt); chạm khắc chìm hoa văn hình học và biểu tượng nhân sinh cực kỳ tinh vi.',
    archivalLocation: 'Bảo tàng Lịch sử Quốc gia Việt Nam (Hà Nội, Bảo vật Quốc gia Đợt 1)',
    caption: 'Văn hóa Đông Sơn · Đỉnh cao kỹ thuật luyện kim và đối xứng hình học cổ xưa',
    academicSignificance:
      'Mặt trống đồng thể hiện đỉnh cao của nghệ thuật đối xứng tâm hình học với ngôi sao 14 cánh ở trung tâm và 16 vành hoa văn đồng tâm chứa hình chim lạc, hươu sao, nhà sàn và vũ điệu lễ hội, phản ánh hệ thống lịch pháp và tri thức toán học sơ khai.',
    coreAcademicValue:
      'Đỉnh cao kỹ thuật luyện kim đúc đồng, nghệ thuật đối xứng tâm hình học và hệ thống biểu tượng lịch pháp thiên văn cổ xưa.',
    imageSrc: 'https://upload.wikimedia.org/wikipedia/commons/2/2f/Trong_Dong_Ngoc_Lu.svg',
    alt: 'Hoa văn hình học đối xứng tâm trên Mặt Trống đồng Ngọc Lũ Văn hóa Đông Sơn',
  },
  {
    id: 'euclid-elements-1482',
    title: 'Bản in đầu tiên "Cơ sở" của Euclid (1482)',
    originalTitle: 'Elementa geometriae (Bản in đầu tiên bộ Cơ sở hình học của Euclid)',
    artistOrOrigin: 'Euclid (Bản in của Erhard Ratdolt)',
    yearOrEra: '1482 · Venice, Ý',
    eraAndPeriod: '1482 · Venice, Ý',
    materialAndTechnique:
      'In chữ chì di động (Movable metal type) kết hợp khắc gỗ minh họa hình học ở lề trang sách và viền hoa văn mộc bản mạ vàng trên giấy sợi gai dầu / vellum.',
    archivalLocation:
      'Bibliothèque nationale de France (Paris) & Folger Shakespeare Library (Washington D.C.)',
    caption: 'Erhard Ratdolt (1482) · Cột mốc tiên đề hóa hình học và đỉnh cao nghệ thuật in ấn',
    academicSignificance:
      'Cuốn sách toán học in hình học đầu tiên trong lịch sử nhân loại, chuyển dịch từ bản dịch tiếng Ả Rập của Campanus xứ Novara. Hơn 420 hình vẽ hình học chính xác ở lề sách đã mở ra kỷ nguyên phổ biến đại chúng các tiên đề Euclid.',
    coreAcademicValue:
      'Cột mốc vĩ đại của ngành in và toán học, đặt nền móng tiên đề hóa chặt chẽ định hình toàn bộ nền khoa học suy diễn phương Tây.',
    imageSrc: 'https://upload.wikimedia.org/wikipedia/commons/d/d4/Euclid%27s_Elements%2C_1482.jpg',
    alt: 'Trang sách bản in đầu tiên cuốn Cơ sở của Euclid do Erhard Ratdolt ấn hành năm 1482',
  },
  {
    id: 'nguoi-chiem-tinh',
    title: 'Người Chiêm tinh (The Astronomer)',
    originalTitle: 'De astronoom (Người Chiêm tinh / Nhà thiên văn học)',
    artistOrOrigin: 'Johannes Vermeer',
    yearOrEra: '1668 · Delft, Hà Lan',
    eraAndPeriod: '1668 · Delft, Hà Lan',
    materialAndTechnique:
      'Sơn dầu trên toan (Oil on canvas), kích thước 50 × 45 cm, xử lý bậc thầy về ánh sáng xiên tự nhiên từ cửa sổ và độ chính xác của các dụng cụ đo đạc.',
    archivalLocation: 'Bảo tàng Louvre (Musée du Louvre, Paris, Pháp)',
    caption: 'Johannes Vermeer (1668) · Tinh thần Khai sáng và niềm say mê đo đạc vũ trụ',
    academicSignificance:
      'Bức họa khắc họa nhà khoa học đang xoay quả địa cầu thiên văn của Jodocus Hondius, bên cạnh là thước trắc tinh và cuốn sách thiên văn của Adriaan Metius. Tác phẩm biểu trưng cho sự chuyển mình từ quan sát định tính sang khoa học thực nghiệm định lượng.',
    coreAcademicValue:
      'Biểu tượng cho tinh thần Thời kỳ Khai sáng với sự truy vấn kiên định, lòng say mê nghiên cứu thiên văn và các phép đo đạc toán học chính xác.',
    imageSrc:
      'https://upload.wikimedia.org/wikipedia/commons/e/e4/Johannes_Vermeer_-_The_Astronomer_-_1668.jpg',
    alt: 'Bức tranh Người Chiêm tinh của Johannes Vermeer năm 1668 tại bảo tàng Louvre',
  },
  {
    id: 'de-divina-proportione',
    title: 'Các Khối Đa diện Đều (De Divina Proportione)',
    originalTitle: 'De Divina Proportione — Icosaedron Elevatum (Tỷ lệ Thần thánh)',
    artistOrOrigin: 'Leonardo da Vinci & Luca Pacioli',
    yearOrEra: '1509 · Venice, Ý',
    eraAndPeriod: '1509 · Venice, Ý',
    materialAndTechnique:
      'Bản khắc gỗ mộc bản (Woodcut) dựa trên 60 bản vẽ phối cảnh khung rỗng (skeletonic perspective drawings) của Leonardo da Vinci in trên giấy cổ.',
    archivalLocation:
      'Thư viện Ambrosiana (Biblioteca Ambrosiana, Milan) & Thư viện Anh (British Library, London)',
    caption: 'Leonardo da Vinci & Luca Pacioli (1509) · Cấu trúc không gian đa diện và tỷ lệ vàng',
    academicSignificance:
      '60 hình minh họa khối đa diện rỗng (vacua) của Leonardo lần đầu tiên cho phép người quan sát nhìn xuyên thấu các mặt trước và sau trong không gian 3 chiều, kết hợp hoàn hảo giữa toán học Platon và hình học họa hình.',
    coreAcademicValue:
      'Minh họa giải tích không gian 3 chiều và các khối Platon huyền bí, khẳng định vẻ đẹp của tỷ lệ vàng trong cấu trúc không gian toán học.',
    imageSrc:
      'https://upload.wikimedia.org/wikipedia/commons/3/36/De_divina_proportione_-_Icosaedron_Elevatum_Solidum.jpg',
    alt: 'Minh họa khối đa diện đều Icosaedron Elevatum Solidum của Leonardo da Vinci trong De Divina Proportione',
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

      {/* Frame Trưng bày Hình ảnh Tác phẩm đích thực (Hoàn toàn sạch sẽ, không che ảnh) */}
      <div
        data-testid="heritage-art-frame"
        className="relative flex h-[300px] w-full items-center justify-center overflow-hidden rounded-xl border border-[#CFDADB]/60 bg-[#E1E9EA]/30 p-2 shadow-inner md:h-[340px]"
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
              'mx-auto h-full w-full object-contain transition-transform duration-500 select-none',
              isFading ? 'opacity-0' : 'opacity-100',
            )}
          />
        )}
      </div>

      {/* Thông tin tác phẩm, Chú giải học thuật & Nút [Lược sử tác phẩm] */}
      <div
        className={cn(
          'mt-4 transition-opacity duration-700 ease-in-out',
          isFading ? 'opacity-0' : 'opacity-100',
        )}
      >
        <div>
          <h3 className="font-serif text-base font-bold text-[#29383D] sm:text-lg">
            {currentArtwork.title}
          </h3>

          {/* Bố cục hàng Metadata: [Tên tác giả / Nghệ nhân] · [Thời kỳ - Địa danh] · [Nút: Lược sử tác phẩm] */}
          <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
            <span className="font-mono text-xs font-semibold text-[#3F6570]">
              {currentArtwork.artistOrOrigin}
            </span>
            <span className="text-[#55676B]" aria-hidden="true">
              ·
            </span>
            <span className="inline-flex items-center rounded-md border border-[#CFDADB]/60 bg-[#E1E9EA] px-2 py-0.5 font-mono text-[11px] text-[#55676B]">
              {currentArtwork.yearOrEra}
            </span>
            <span className="text-[#55676B]" aria-hidden="true">
              ·
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

        <p className="mt-2 font-serif text-xs text-[#718C7E] italic">{currentArtwork.caption}</p>

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
                <dd className="text-[#29383D] sm:col-span-8">{currentArtwork.coreAcademicValue}</dd>
              </div>
            </dl>
          </div>
        )}
      </div>
    </div>
  );
}
