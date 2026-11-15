import { BookOpen, ChevronLeft, ChevronRight, Landmark, Pause, Play, X } from 'lucide-react';
import { useCallback, useEffect, useId, useRef, useState } from 'react';
import { useReducedMotion } from '@/shared/hooks/useReducedMotion';
import { computeFrameDelta, frameDampFactor } from '@/shared/lib/canvasSprites';
import { cn } from '@/shared/lib/cn';

export type HeritageCategory = 'vietnam-heritage' | 'math-geometry' | 'astronomy-science';

export interface HeritageCategoryTab {
  readonly id: 'all' | HeritageCategory;
  readonly label: string;
}

export const HERITAGE_CATEGORY_TABS: readonly HeritageCategoryTab[] = [
  { id: 'all', label: 'Tất cả' },
  { id: 'vietnam-heritage', label: 'Văn hiến & Khoa bảng Việt Nam' },
  { id: 'math-geometry', label: 'Toán học & Hình học Cổ điển' },
  { id: 'astronomy-science', label: 'Thiên văn & Khoa học Thế giới' },
] as const;

export interface HeritageArtwork {
  readonly id: string;
  readonly category: HeritageCategory;
  readonly shortTitle: string;
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
 * 32 Kiệt tác nghệ thuật, di sản văn hóa – giáo dục Việt Nam & tư liệu khoa học kinh điển
 * đại diện cho sự giao hòa giữa Toán học, Hình học, Thiên văn, Triết học và Nghệ thuật Sư phạm.
 */
export const HERITAGE_ARTWORKS: readonly HeritageArtwork[] = [
  {
    id: 'khue-van-cac',
    category: 'vietnam-heritage',
    shortTitle: 'Khuê Văn Các',
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
    id: 'thay-do-coc',
    category: 'vietnam-heritage',
    shortTitle: 'Thầy đồ Cóc',
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
    id: 'melencolia-i',
    category: 'math-geometry',
    shortTitle: 'Melencolia I',
    title: 'Bản khắc đồng "Melencolia I"',
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
    imageSrc:
      'https://upload.wikimedia.org/wikipedia/commons/thumb/1/18/D%C3%BCrer_Melancholia_I.jpg/960px-D%C3%BCrer_Melancholia_I.jpg',
    alt: 'Bản khắc đồng Melencolia I của Albrecht Dürer năm 1514',
  },
  {
    id: 'truong-hoc-athena',
    category: 'math-geometry',
    shortTitle: 'Trường học Athena',
    title: 'Bích họa "Trường học Athena" (Scuola di Atene)',
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
    category: 'math-geometry',
    shortTitle: 'Người Vitruvius',
    title: 'Bản vẽ "Người Vitruvius" (L\'Uomo Vitruviano)',
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
    category: 'vietnam-heritage',
    shortTitle: '82 Bia Tiến sĩ',
    title: '82 Bia Tiến sĩ Văn Miếu Thăng Long',
    originalTitle: '82 Bia Tiến sĩ Văn Miếu – Quốc Tử Giám (Thạch bi đề danh tiến sĩ khoa thị)',
    artistOrOrigin: 'Triều Lê – Mạc – Lê Trung Hưng',
    yearOrEra: '1484 – 1780 · Hà Nội, Việt Nam',
    eraAndPeriod: '1484 – 1780 · Hà Nội, Việt Nam',
    materialAndTechnique:
      'Đá xanh nguyên khối đục đẽo thủ công, khắc chữ Hán chân phương tinh xảo, dựng trên lưng rùa đá (quy phụ thạch bi) tượng trưng cho sự trường tồn vĩnh cửu.',
    archivalLocation: 'Vườn bia Văn Miếu – Quốc Tử Giám, Hà Nội (Di sản Tư liệu Thế giới UNESCO)',
    caption: 'Triều Lê – Mạc – Lê Trung Hưng · Hiền tài là nguyên khí của quốc gia',
    academicSignificance:
      'Hệ thống 82 bia đá ghi danh các khoa thi tiến sĩ từ năm 1442 đến 1779. Nổi bật là bài văn bia năm 1442 do Thân Nhân Trung soạn thảo với lời răn bất hủ khẳng định vai trò sống còn của giáo dục và tri thức đối với sự hưng thịnh của quốc gia.',
    coreAcademicValue:
      'Di sản Tư liệu Thế giới UNESCO · Tấm gương phản chiếu truyền thống trọng dụng nhân tài với tư tưởng bất hủ "Hiền tài là nguyên khí của quốc gia".',
    imageSrc: 'https://upload.wikimedia.org/wikipedia/commons/c/cd/BiaTienSi1442.jpg',
    alt: 'Bia Tiến sĩ khoa Nhâm Tuất 1442 tại Văn Miếu Quốc Tử Giám Hà Nội',
  },
  {
    id: 'trong-dong-ngoc-lu',
    category: 'vietnam-heritage',
    shortTitle: 'Trống đồng Ngọc Lũ',
    title: 'Mặt Trống đồng Ngọc Lũ',
    originalTitle: 'Mặt Trống đồng Ngọc Lũ I (Bảo vật Quốc gia Đợt 1 — Văn hóa Đông Sơn)',
    artistOrOrigin: 'Cư dân Việt cổ (Bảo vật Quốc gia)',
    yearOrEra: 'Thế kỷ II – III TCN · Văn hóa Đông Sơn',
    eraAndPeriod: 'Thế kỷ II – III TCN · Văn hóa Đông Sơn',
    materialAndTechnique:
      'Đúc đồng bằng khuôn nhiều mang (khuôn sáp chảy kết hợp đất sét chịu nhiệt); chạm khắc chìm hoa văn hình học và biểu tượng nhân sinh cực kỳ tinh vi; sắc độ patina xanh xám rêu phong tự nhiên.',
    archivalLocation: 'Bảo tàng Lịch sử Quốc gia Việt Nam (Hà Nội, Bảo vật Quốc gia Đợt 1)',
    caption: 'Văn hóa Đông Sơn · Đỉnh cao kỹ thuật luyện kim và đối xứng hình học cổ xưa',
    academicSignificance:
      'Mặt trống đồng thể hiện đỉnh cao của nghệ thuật đối xứng tâm hình học với ngôi sao 14 cánh ở trung tâm và 16 vành hoa văn đồng tâm chứa hình chim lạc, hươu sao, nhà sàn và vũ điệu lễ hội, phản ánh hệ thống lịch pháp và tri thức toán học sơ khai.',
    coreAcademicValue:
      'Đỉnh cao kỹ thuật luyện kim đúc đồng, nghệ thuật đối xứng tâm hình học và hệ thống biểu tượng lịch pháp thiên văn cổ xưa.',
    imageSrc: 'https://upload.wikimedia.org/wikipedia/commons/4/48/Ngoc_Lu.jpg',
    alt: 'Ảnh chụp hiện vật bảo tàng Mặt Trống đồng Ngọc Lũ I tại Bảo tàng Lịch sử Quốc gia',
  },
  {
    id: 'euclid-elements-1482',
    category: 'math-geometry',
    shortTitle: 'Cơ sở của Euclid',
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
    imageSrc:
      'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d4/Euclid%27s_Elements%2C_1482.jpg/960px-Euclid%27s_Elements%2C_1482.jpg',
    alt: 'Trang sách bản in đầu tiên cuốn Cơ sở của Euclid do Erhard Ratdolt ấn hành năm 1482',
  },
  {
    id: 'nguoi-chiem-tinh',
    category: 'astronomy-science',
    shortTitle: 'Người Chiêm tinh',
    title: 'Bức họa "Người Chiêm tinh" (The Astronomer)',
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
    category: 'math-geometry',
    shortTitle: 'De Divina Proportione',
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
  {
    id: 'ban-do-hong-duc',
    category: 'vietnam-heritage',
    shortTitle: 'Hồng Đức Bản Đồ',
    title: 'Hồng Đức Bản Đồ (1490)',
    originalTitle: 'Hồng Đức Bản Đồ Sách — Bản đồ Thăng Long kinh thành & 13 thừa tuyên',
    artistOrOrigin: 'Triều đình Lê sơ (Bộ Lễ & Hàn lâm viện)',
    yearOrEra: '1490 · Triều Lê Thánh Tông, Đại Việt',
    eraAndPeriod: '1490 · Thăng Long, Đại Việt (Niên hiệu Hồng Đức thứ 21)',
    materialAndTechnique:
      'Bản đồ trắc địa vẽ trên lụa và mộc bản in trên giấy dó thủ công, sử dụng hệ thống ký hiệu tọa độ địa lý và phương vị cổ truyền.',
    archivalLocation: 'Viện Nghiên cứu Hán Nôm (Hà Nội) & Thư viện Viễn Đông Bác Cổ (EFEO)',
    caption: 'Triều Lê Thánh Tông (1490) · Cột mốc trắc địa và xác lập chủ quyền lãnh thổ Đại Việt',
    academicSignificance:
      'Bộ bản đồ địa lý hành chính và trắc lượng đầu tiên trong lịch sử dân tộc. Bộ bản đồ tổng hợp địa giới kinh thành Thăng Long và 13 thừa tuyên, ghi nhận sông núi, đường sá, hải đảo và đồn lũy, khẳng định chủ quyền lãnh thổ bất khả xâm phạm và tư duy tổ chức không gian quốc gia tiến bộ thời Lê sơ.',
    coreAcademicValue:
      'Bộ bản đồ địa lý hành chính và trắc địa đầu tiên trong lịch sử Việt Nam, xác lập toàn vẹn chủ quyền lãnh thổ và thể hiện tư duy quản trị quốc gia khoa học thời Lê sơ.',
    imageSrc:
      'https://upload.wikimedia.org/wikipedia/commons/6/68/B%E1%BA%A3n_%C4%91%E1%BB%93_kinh_th%C3%A0nh_Th%C4%83ng_Long%2C_theo_H%E1%BB%93ng_%C4%90%E1%BB%A9c_b%E1%BA%A3n_%C4%91%E1%BB%93_s%C3%A1ch_%E6%B4%AA%E5%BE%B7%E7%89%88%E5%9C%96%E5%86%8A_%281490%29.jpg',
    alt: 'Bản đồ kinh thành Thăng Long trong bộ Hồng Đức bản đồ sách năm 1490 triều Lê Thánh Tông',
  },
  {
    id: 'tuong-quan-am-but-thap',
    category: 'vietnam-heritage',
    shortTitle: 'Quan Âm Bút Tháp',
    title: 'Tượng Quan Âm thiên thủ thiên nhãn (Chùa Bút Tháp)',
    originalTitle:
      'Tượng Quan Âm nghìn mắt nghìn tay (Bảo vật Quốc gia — Diên Phúc Tự / Chùa Bút Tháp)',
    artistOrOrigin: 'Trương Thọ Nam (Bảo vật Quốc gia)',
    yearOrEra: '1656 · Bắc Ninh, Việt Nam',
    eraAndPeriod: '1656 · Bút Tháp, Thuận Thành, Bắc Ninh (Thời Lê Trung Hưng)',
    materialAndTechnique:
      'Gỗ mít đục chạm thủ công truyền thống, thếp vàng và phủ sơn son ta nhiều lớp; cao 3.7 m với 42 cánh tay lớn và 952 cánh tay nhỏ tạo quầng hào quang nan quạt.',
    archivalLocation: 'Chùa Bút Tháp (Xã Đình Tổ, Thị xã Thuận Thành, Tỉnh Bắc Ninh)',
    caption: 'Trương Thọ Nam (1656) · Đỉnh cao điêu khắc gỗ và cấu trúc hình học tỏa tròn đối xứng',
    academicSignificance:
      'Kiệt tác điêu khắc gỗ cổ truyền hoàn mỹ bậc nhất lịch sử mỹ thuật Việt Nam. Tượng đài kết hợp 42 cánh tay tạo thế ấn và 952 cánh tay phụ gắn trong một quầng nan quạt elip đồng tâm tỏa rộng, đạt tới sự cân đối hình học tuyệt đối về trọng tâm, tỷ lệ và nhịp điệu không gian 3 chiều.',
    coreAcademicValue:
      'Đỉnh cao nghệ thuật điêu khắc gỗ cổ truyền Việt Nam; kết cấu nan quạt với 952 cánh tay phụ tạo nên cấu trúc hình học tỏa tròn đối xứng hoàn mỹ trong không gian 3 chiều.',
    imageSrc:
      'https://upload.wikimedia.org/wikipedia/commons/7/76/La_statue_de_Quan_Am_dans_la_pagode_But_Thap.jpg',
    alt: 'Tượng Quan Âm thiên thủ thiên nhãn tại Chùa Bút Tháp Bắc Ninh do Trương Thọ Nam tạc năm 1656',
  },
  {
    id: 'copernicus-1543',
    category: 'astronomy-science',
    shortTitle: 'Copernicus (1543)',
    title: 'Về chuyển động quay của các thiên thể (Copernicus, 1543)',
    originalTitle: 'De revolutionibus orbium coelestium (Về sự vận hành của các thiên cầu)',
    artistOrOrigin: 'Nicolaus Copernicus',
    yearOrEra: '1543 · Nuremberg, Đức',
    eraAndPeriod: '1543 · Nuremberg, Đức (Nhà in Johannes Petreius)',
    materialAndTechnique:
      'Bản in mộc bản khắc gỗ (Woodcut) kết hợp chữ chì di động trên giấy sợi bông, trình bày sơ đồ quỹ đạo các thiên cầu đồng tâm đặt Mặt Trời tại tâm điểm.',
    archivalLocation: 'Thư viện Đại học Jagiellonian (Kraków, Ba Lan) & Thư viện Quốc gia Ba Lan',
    caption: 'Nicolaus Copernicus (1543) · Khởi đầu Cách mạng Khoa học và thuyết nhật tâm vũ trụ',
    academicSignificance:
      'Công trình mang tính bước ngoặt phá vỡ vũ trụ quan địa tâm Ptolemy ngàn năm. Copernicus sử dụng mô hình hình học các đường tròn đồng tâm chứng minh Mặt Trời là trung tâm của hệ hành tinh, mở đường cho cuộc Cách mạng Khoa học và phương pháp suy luận toán học hiện đại.',
    coreAcademicValue:
      'Mốc son khởi đầu cuộc Cách mạng Khoa học; dùng cấu trúc quỹ đạo hình học để thiết lập thuyết nhật tâm, giải phóng tư duy nhân loại khỏi định kiến vũ trụ quan trung cổ.',
    imageSrc:
      'https://upload.wikimedia.org/wikipedia/commons/5/5d/Copernican_heliocentrism_diagram.jpg',
    alt: 'Sơ đồ quỹ đạo hệ nhật tâm trong tác phẩm De revolutionibus orbium coelestium của Nicolaus Copernicus năm 1543',
  },
  {
    id: 'kepler-1596',
    category: 'astronomy-science',
    shortTitle: 'Kepler (1596)',
    title: 'Mysterium Cosmographicum (Johannes Kepler, 1596)',
    originalTitle:
      'Mysterium Cosmographicum (Bí mật Vũ trụ học — Mô hình 5 khối đa diện đều Platon)',
    artistOrOrigin: 'Johannes Kepler',
    yearOrEra: '1596 · Tübingen, Đức',
    eraAndPeriod: '1596 · Tübingen, Đức (Nhà in Georg Gruppenbach)',
    materialAndTechnique:
      'Bản khắc đồng (Copperplate engraving) lồng ghép 5 khối đa diện đều Platon vào các mặt cầu quỹ đạo hành tinh.',
    archivalLocation: 'Thư viện Đại học Tübingen (Đức) & Bảo tàng Lịch sử Khoa học Oxford (Anh)',
    caption: 'Johannes Kepler (1596) · Giao thoa giữa hình học thuần túy và quỹ đạo thiên văn học',
    academicSignificance:
      'Tác phẩm đầu tiên công khai bảo vệ hệ nhật tâm Copernic. Kepler đã dùng 5 khối đa diện đều Platon (tứ diện, lập phương, bát diện, mười hai mặt, hai mươi mặt đều) lồng ghép giữa 6 quỹ đạo hành tinh để giải mã tỷ lệ khoảng cách hình học của vũ trụ.',
    coreAcademicValue:
      'Sự giao thoa tuyệt đối giữa thiên văn học và hình học thuần túy; mô hình lồng ghép 5 khối đa diện đều Platon kinh điển để giải mã tỷ lệ khoảng cách giữa các quỹ đạo hành tinh.',
    imageSrc: 'https://upload.wikimedia.org/wikipedia/commons/1/19/Kepler-solar-system-1.png',
    alt: 'Mô hình 5 khối đa diện đều Platon lồng ghép trong Mysterium Cosmographicum của Johannes Kepler năm 1596',
  },
  {
    id: 'chua-mot-cot-1049',
    category: 'vietnam-heritage',
    shortTitle: 'Chùa Một Cột',
    title: 'Chùa Một Cột — Liên Hoa Đài (1049)',
    originalTitle: 'Diên Hựu Tự — Liên Hoa Đài (Chùa Một Cột thời Lý)',
    artistOrOrigin: 'Triều Lý Thái Tông',
    yearOrEra: '1049 · Thăng Long – Hà Nội',
    eraAndPeriod: '1049 · Thăng Long – Hà Nội (Triều Lý Thái Tông)',
    materialAndTechnique:
      'Cột đá nguyên khối tròn đường kính 1.2 m, đỡ đài sen gỗ vuông sơn son tám mái cong, vươn lên giữa hồ sen Linh Chiểu hình vuông.',
    archivalLocation: 'Khu di tích Chùa Một Cột (Phố Chùa Một Cột, Đội Cấn, Ba Đình, Hà Nội)',
    caption:
      'Triều Lý Thái Tông (1049) · Đài sen vuông trên cột tròn — Triết lý không gian trời tròn đất vuông',
    academicSignificance:
      'Đỉnh cao kiến trúc cổ truyền độc bản của văn minh Đại Việt thời Lý. Cấu trúc đài sen hình vuông đặt trên một cột đá tròn vươn lên từ hồ nước vuông thể hiện sâu sắc triết lý vũ trụ luận "trời tròn đất vuông", sự thăng bằng tĩnh tại và vẻ đẹp hình học kiến trúc tôn giáo thuần Việt.',
    coreAcademicValue:
      'Đỉnh cao kiến trúc cổ truyền độc bản; đài sen hình vuông đặt trên một cột đá tròn vươn lên giữa hồ Linh Chiểu, phản chiếu triết lý trời tròn đất vuông và sự cân bằng không gian tuyệt đối.',
    imageSrc: 'https://upload.wikimedia.org/wikipedia/commons/f/f4/Chua_Mot_Cot.jpg',
    alt: 'Kiến trúc Chùa Một Cột Liên Hoa Đài thời Lý tại Thăng Long Hà Nội',
  },
  {
    id: 'dai-thanh-toan-phap',
    category: 'vietnam-heritage',
    shortTitle: 'Đại thành Toán pháp',
    title: 'Đại thành Toán pháp (Lương Thế Vinh)',
    originalTitle: 'Đại thành Toán pháp — Bộ sách toán học kinh điển thời Lê Sơ',
    artistOrOrigin: 'Trạng Lường Lương Thế Vinh',
    yearOrEra: 'Thế kỷ XV · Thời Lê Sơ',
    eraAndPeriod: 'Thế kỷ XV · Thời Lê Sơ (Đại Việt)',
    materialAndTechnique:
      'Văn bản toán học khắc bản gỗ cổ truyền trên nền giấy dó; hệ thống hóa bài toán bằng thơ ca dân tộc và quy tắc bàn tính cửu chương.',
    archivalLocation: 'Thư viện Viện Nghiên cứu Hán Nôm (Hà Nội) & Tư liệu Cổ sử Đại Việt',
    caption:
      'Trạng Lường Lương Thế Vinh · Bản vẽ điển tịch giấy dó về phép đo hình khuyên, bàn tính & tam giác đồng dạng',
    academicSignificance:
      'Bộ sách toán học kinh điển của Việt Nam hệ thống hóa phép đo đạc diện tích ruộng đất, hình khuyên, thể tích hình khối chóp cụt, tam giác đồng dạng và bảng cửu chương. Tác phẩm kết hợp chặt chẽ tư duy tính toán thuật toán với thực tiễn canh tác và quản trị quốc gia.',
    coreAcademicValue:
      'Bộ sách toán học kinh điển của Việt Nam; chuẩn hóa phép đo đạc ruộng đất, hình khuyên, thể tích khối chóp cụt, tam giác đồng dạng và phương pháp dạy toán bằng thơ ca dễ nhớ.',
    imageSrc: 'svg://dai-thanh-toan-phap',
    alt: 'Bản vẽ minh họa điển tịch giấy dó Đại thành Toán pháp của Trạng Lường Lương Thế Vinh',
  },
  {
    id: 'lap-thanh-toan-phap',
    category: 'vietnam-heritage',
    shortTitle: 'Lập thành Toán pháp',
    title: 'Lập thành Toán pháp (Vũ Hữu)',
    originalTitle: 'Lập thành Toán pháp — Toán học ứng dụng kiến trúc & thủy lợi Đại Việt',
    artistOrOrigin: 'Hoàng giáp Vũ Hữu',
    yearOrEra: 'Thế kỷ XV · Thời Lê Sơ',
    eraAndPeriod: 'Thế kỷ XV · Thời Lê Sơ (Đại Việt)',
    materialAndTechnique:
      'Bản vẽ điển tịch giấy dó hệ thống hóa bảng tra lập thành và công thức đo lường trắc địa bằng sào đo, dây giăng và cọc tiêu tam giác đồng dạng.',
    archivalLocation: 'Văn miếu Mao Điền (Hải Dương) & Tư liệu Khoa cử Triều Lê Sơ',
    caption:
      'Hoàng giáp Vũ Hữu · Điển tịch toán học ứng dụng đo đạc tam giác đồng dạng, diện tích hình thang & khối đắp đê',
    academicSignificance:
      'Công trình toán học ứng dụng xuất sắc phục vụ quy hoạch kiến trúc, tính toán vật liệu xây dựng thành lũy và đo đạc thủy lợi Đại Việt. Vũ Hữu cùng Lương Thế Vinh đặt nền móng cho truyền thống toán học thực hành chính xác cao của nước Việt.',
    coreAcademicValue:
      'Toán học ứng dụng xuất sắc phục vụ quy hoạch kiến trúc, tính toán khối lượng vật liệu xây thành và kỹ thuật đo đạc địa hình bằng tam giác đồng dạng.',
    imageSrc: 'svg://lap-thanh-toan-phap',
    alt: 'Bản vẽ minh họa điển tịch giấy dó Lập thành Toán pháp của Hoàng giáp Vũ Hữu',
  },
  {
    id: 'thap-but-dai-nghien-1865',
    category: 'vietnam-heritage',
    shortTitle: 'Tháp Bút — Đài Nghiên',
    title: 'Tháp Bút — Đài Nghiên (Độc Tôn Đài · Đền Ngọc Sơn, 1865)',
    originalTitle: 'Tháp Bút & Đài Nghiên — Độc Tôn Đài bên Hồ Hoàn Kiếm',
    artistOrOrigin: 'Nguyễn Văn Siêu',
    yearOrEra: '1865 · Hồ Hoàn Kiếm, Hà Nội',
    eraAndPeriod: 'Năm 1865 (Thời Tự Đức) · Hồ Hoàn Kiếm, Hà Nội',
    materialAndTechnique:
      'Tháp đá xanh 5 tầng dựng trên đỉnh núi đá Ngọc Bội cao 28 m, đỉnh tạc hình ngòi bút lông vươn thẳng, kết nối cùng Đài Nghiên đá gánh trên lưng ba con thiềm thừ.',
    archivalLocation:
      'Di tích Quốc gia Đặc biệt Đền Ngọc Sơn & Hồ Hoàn Kiếm (Quận Hoàn Kiếm, Hà Nội)',
    caption:
      'Nguyễn Văn Siêu (1865) · "Tả thanh thiên" — Đỉnh cao trắc địa thiên văn đưa bóng ngòi bút chấm lòng Đài Nghiên',
    academicSignificance:
      'Biểu tượng bất hủ của truyền thống hiếu học và khí phách trí thức Việt Nam với thông điệp "Tả thanh thiên" (Viết lên trời xanh). Cấu trúc tháp đá 5 tầng đặt trên núi Ngọc Bội được tính toán trắc địa chuẩn xác để vào chính ngọ, bóng đỉnh bút nghiên chiếu đúng vào lòng Đài Nghiên đá.',
    coreAcademicValue:
      'Kết tinh giữa tinh thần hiếu học "Tả thanh thiên" và kỹ thuật tính toán góc chiếu mặt trời chính ngọ đưa bóng Tháp Bút chấm chuẩn vào lòng Đài Nghiên.',
    imageSrc: 'https://upload.wikimedia.org/wikipedia/commons/0/04/ThapButHG.jpg',
    alt: 'Tháp Bút Đài Nghiên bên Hồ Hoàn Kiếm Đền Ngọc Sơn Hà Nội xây dựng năm 1865',
  },
  {
    id: 'ngo-mon-dien-thai-hoa',
    category: 'vietnam-heritage',
    shortTitle: 'Ngọ Môn & Thái Hòa',
    title: 'Ngọ Môn & Điện Thái Hòa (Kinh thành Huế)',
    originalTitle: 'Ngọ Môn & Điện Thái Hòa — Trục Thần đạo Đối xứng Kinh thành Huế',
    artistOrOrigin: 'Triều Nguyễn',
    yearOrEra: '1804–1833 · Cố đô Huế',
    eraAndPeriod: '1804–1833 · Triều Nguyễn (Cố đô Huế)',
    materialAndTechnique:
      'Đài cổng gạch đá xây kiểu chữ U ôm lấy sân lễ kết hợp Lầu Ngũ Phụng gỗ lim năm gian; trục đối xứng Đông–Tây định vị theo sao Bắc Đẩu.',
    archivalLocation: 'Quần thể Di tích Cố đô Huế (Di sản Văn hóa Thế giới UNESCO, Thừa Thiên Huế)',
    caption:
      'Triều Nguyễn (1804–1833) · Đỉnh cao quy hoạch trục đối xứng tâm kết hợp bình đồ Vauban & kết cấu gỗ',
    academicSignificance:
      'Đỉnh cao quy hoạch kiến trúc trục đối xứng tâm, tỷ lệ hài hòa trên bình đồ Vauban kết hợp hệ kết cấu gỗ truyền thống Việt Nam. Từng khoảng sân, hồ Thái Dịch và điện đài tạo nên chuỗi tỷ lệ không gian nhịp nhàng.',
    coreAcademicValue:
      'Chuẩn mực quy hoạch trục đối xứng tâm và hình học phòng thủ Vauban giao thoa với hệ vì kèo gỗ chồng rường truyền thống Đại Nam.',
    imageSrc:
      'https://upload.wikimedia.org/wikipedia/commons/4/4c/Ng%E1%BB%8D_M%C3%B4n_-_Hu%E1%BA%BF.jpg',
    alt: 'Ngọ Môn và trục đối xứng Kinh thành Huế triều Nguyễn',
  },
  {
    id: 'cuu-dinh-hoang-cung-hue',
    category: 'vietnam-heritage',
    shortTitle: 'Cửu Đỉnh Huế',
    title: 'Cửu Đỉnh Hoàng cung Huế',
    originalTitle: 'Cửu Đỉnh — Chín Đỉnh Đồng Bách khoa Toàn thư trước Thế Miếu Huế',
    artistOrOrigin: 'Thời Minh Mạng',
    yearOrEra: '1835–1837 · Di sản Tư liệu Thế giới',
    eraAndPeriod: '1835–1837 · Triều Minh Mạng (Huế)',
    materialAndTechnique:
      'Đúc đồng nguyên khối theo phương pháp khuôn ghép nhiều mảnh; chạm nổi 162 bức họa tiết thiên văn, địa lý, thủy triều và thảo mộc.',
    archivalLocation:
      'Sân Thế Miếu, Đại Nội Huế (Di sản Tư liệu Thế giới Khu vực Châu Á – Thái Bình Dương)',
    caption:
      'Thời Minh Mạng (1835–1837) · Chín đỉnh đồng khắc 162 họa tiết bầu trời, tinh tú, núi sông và biển đảo',
    academicSignificance:
      'Chín đỉnh đồng khắc nổi 162 họa tiết bách khoa toàn thư về bầu trời, tinh tú, núi sông, biển đảo và sản vật nước Việt. Số 9 (Cửu) phản ánh cấu trúc phân loại không gian thiên – địa – nhân có hệ thống nhất thế kỷ XIX.',
    coreAcademicValue:
      'Tư liệu đúc đồng lưu giữ tri thức thiên văn, bản đồ học sông núi và kỹ thuật hợp kim truyền thống chuẩn xác bậc nhất Đông Nam Á.',
    imageSrc:
      'https://upload.wikimedia.org/wikipedia/commons/1/1f/C%E1%BB%ADu_%C4%91%E1%BB%89nh_Hu%E1%BA%BF.jpg',
    alt: 'Cửu Đỉnh Hoàng cung Huế thời Minh Mạng trước Thế Miếu',
  },
  {
    id: 'truong-quoc-hoc-hue-1896',
    category: 'vietnam-heritage',
    shortTitle: 'Quốc Học Huế (1896)',
    title: 'Trường Quốc Học Huế (1896)',
    originalTitle: 'Trường THPT Chuyên Quốc Học — Huế (Thành lập năm Thành Thái thứ 8)',
    artistOrOrigin: 'Ngôi trường Lịch sử & Khoa bảng',
    yearOrEra: '1896 · Bên bờ sông Hương, Cố đô Huế',
    eraAndPeriod: 'Thành lập năm 1896 · Số 12 Lê Lợi, Bên bờ sông Hương, Thành phố Huế',
    materialAndTechnique:
      'Quần thể kiến trúc giao thoa Á – Âu với cổng tam quan truyền thống sắc đỏ son, dãy giảng đường hành lang vòm đối xứng ẩn mình dưới tán điệp anh đào.',
    archivalLocation: 'Trường THPT Chuyên Quốc Học Huế (Di tích Quốc gia Đặc biệt, Thừa Thiên Huế)',
    caption:
      'Thành lập năm 1896 · Cái nôi giáo dục hiếu học yêu nước bên dòng Hương Giang thơ mộng',
    academicSignificance:
      'Một trong những ngôi trường trung học lâu đời và giàu truyền thống hiếu học, yêu nước bậc nhất Việt Nam — nơi Chủ tịch Hồ Chí Minh cùng nhiều nhà khoa học, danh nhân văn hóa từng theo học. Kiến trúc giao thoa Á – Âu cân xứng hài hòa giữa thiên nhiên xứ Huế.',
    coreAcademicValue:
      'Biểu tượng sống động của truyền thống sư phạm, tinh thần yêu nước và sự kết hợp hài hòa giữa kiến trúc Đông – Tây trong không gian học đường.',
    imageSrc:
      'https://upload.wikimedia.org/wikipedia/commons/3/35/Qu%E1%BB%91c_H%E1%BB%8Dc_Hu%E1%BA%BF.jpg',
    alt: 'Cổng tam quan và khuôn viên Trường Quốc Học Huế thành lập năm 1896 bên bờ sông Hương',
  },
  {
    id: 'hoang-thanh-thang-long',
    category: 'vietnam-heritage',
    shortTitle: 'Đoan Môn & Kỳ Đài',
    title: 'Hoàng thành Thăng Long — Đoan Môn & Kỳ Đài',
    originalTitle: 'Hoàng thành Thăng Long — Kết cấu Vòm cuốn Đoan Môn & Cột cờ Bát giác Hà Nội',
    artistOrOrigin: 'Kinh thành Thăng Long',
    yearOrEra: 'Thế kỷ XI – XIX · Hà Nội',
    eraAndPeriod: 'Thế kỷ XI – XIX · Di sản Văn hóa Thế giới · Hà Nội',
    materialAndTechnique:
      'Gạch vồ và đá phiến xếp theo cung vòm cuốn parabol truyền tải trọng nén đều hai bên; Kỳ Đài cấu trúc lăng trụ bát giác ba tầng thu nhỏ dần.',
    archivalLocation: 'Khu Trung tâm Hoàng thành Thăng Long (Số 19C Hoàng Diệu, Ba Đình, Hà Nội)',
    caption:
      'Thế kỷ XI – XIX · Vòm cuốn đá chịu lực và tháp Cột cờ ba tầng bát giác trường tồn hàng thế kỷ',
    academicSignificance:
      'Cấu trúc vòm cuốn đá chịu lực và tháp Cột cờ ba tầng bát giác thể hiện kỹ thuật kết cấu hình học bền vững qua hàng thế kỷ. Các tầng lăng trụ thu nhỏ theo cấp số tỷ lệ vàng bảo đảm ổn định trọng tâm trước gió bão và thời gian.',
    coreAcademicValue:
      'Hình mẫu xuất sắc về cơ học vòm cuốn chịu nén và hình học lăng trụ bát giác thu tầng đảm bảo tính vững chãi qua nhiều triều đại.',
    imageSrc:
      'https://upload.wikimedia.org/wikipedia/commons/c/c2/%C4%90oan_M%C3%B4n%2C_Ho%C3%A0ng_th%C3%A0nh_Th%C4%83ng_Long%2C_H%C3%A0_N%E1%BB%99i_003.JPG',
    alt: 'Đoan Môn thuộc Hoàng thành Thăng Long Di sản Văn hóa Thế giới tại Hà Nội',
  },
  {
    id: 'thap-cham-my-son',
    category: 'vietnam-heritage',
    shortTitle: 'Tháp Chăm Mỹ Sơn',
    title: 'Tháp Chăm Mỹ Sơn',
    originalTitle: 'Thánh địa Mỹ Sơn — Kiến trúc Kalan Champa Tự đồng dạng',
    artistOrOrigin: 'Văn hóa Champa',
    yearOrEra: 'Thế kỷ IV – XIII · Quảng Nam',
    eraAndPeriod: 'Thế kỷ IV – XIII · Thung lũng Mỹ Sơn, Quảng Nam, Việt Nam',
    materialAndTechnique:
      'Gạch nung mài khít không lộ mạch vữa liên kết bằng nhựa thực vật dầu rái, xếp thu giật cấp tạo hình thái tự đồng dạng (fractal).',
    archivalLocation: 'Khu đền tháp Mỹ Sơn (Duy Xuyên, Quảng Nam · Di sản Văn hóa Thế giới UNESCO)',
    caption:
      'Thế kỷ IV – XIII · Kiến trúc gạch nung không mạch vữa theo cấu trúc tháp tầng tự đồng dạng (fractal)',
    academicSignificance:
      'Nghệ thuật kiến trúc gạch nung không mạch vữa với cấu trúc tháp tầng tự đồng dạng (fractal geometry) và hệ thống trụ đá chạm khắc tinh xảo. Các tháp nhỏ góc mái lặp lại đồng dạng hình khối của thân tháp chính trên từng cấp độ.',
    coreAcademicValue:
      'Ví dụ kinh điển của hình học tự đồng dạng (fractal geometry) và kỹ thuật cân bằng trọng tâm bằng gạch mài khít không mạch vữa.',
    imageSrc:
      'https://upload.wikimedia.org/wikipedia/commons/4/45/Th%C3%A1nh_%C4%91%E1%BB%8Ba_M%E1%BB%B9_S%C6%A1n_2.JPG',
    alt: 'Thánh địa Tháp Chăm Mỹ Sơn tại Quảng Nam Việt Nam',
  },
  {
    id: 'thap-pho-minh',
    category: 'vietnam-heritage',
    shortTitle: 'Tháp Phổ Minh',
    title: 'Tháp Phổ Minh & Vạc Phổ Minh',
    originalTitle: 'Bảo tháp 14 tầng Phổ Minh Tự & An Nam Tứ Đại Khí',
    artistOrOrigin: 'Thời Trần',
    yearOrEra: '1305 · Nam Định',
    eraAndPeriod: '1305 · Thời Trần (Tức Mặc, Nam Định)',
    materialAndTechnique:
      'Bệ đá hoa sen chạm nổi kết hợp 13 tầng gạch nung hoa chanh vươn cao 19.5 m; vạc đồng khổng lồ chứng tỏ trình độ luyện kim thế kỷ XIII–XIV.',
    archivalLocation: 'Chùa Phổ Minh (Phường Lộc Vượng, Thành phố Nam Định, Tỉnh Nam Định)',
    caption:
      'Thời Trần (1305) · Bảo tháp 14 tầng bằng đá và gạch nung minh chứng trình độ tính toán tải trọng',
    academicSignificance:
      'Bảo tháp 14 tầng bằng đá chạm hoa sen và gạch nung thời Trần, minh chứng cho trình độ tính toán tải trọng và kỹ thuật luyện đồng Đại Việt. Mặt cắt các tầng thu nhỏ theo quy luật tuyến tính tạo nên đường biên vươn thanh thoát.',
    coreAcademicValue:
      'Kết tinh trình độ phân bố tải trọng kết cấu nhiều tầng, đối xứng hoa sen 8 cánh và kỹ thuật đúc đồng quy mô lớn thời Trần.',
    imageSrc: 'https://upload.wikimedia.org/wikipedia/commons/7/71/Pho_Minh_tower.jpg',
    alt: 'Tháp Phổ Minh 14 tầng thời Trần tại Nam Định',
  },
  {
    id: 'rhind-mathematical-papyrus',
    category: 'math-geometry',
    shortTitle: 'Papyrus Rhind',
    title: 'Cuộn Papyrus Toán học Rhind',
    originalTitle: 'Rhind Mathematical Papyrus — Bản thảo Toán học của Ký lục Ahmes',
    artistOrOrigin: 'Ahmes',
    yearOrEra: 'Khoảng 1550 TCN · Ai Cập Cổ đại',
    eraAndPeriod: 'Khoảng 1550 TCN · Vương triều Thứ 15 (Ai Cập Cổ đại)',
    materialAndTechnique:
      'Mực đen và mực chu sa chữ thầy tu (Hieratic) viết trên giấy cói papyrus dài hơn 5 mét với hình vẽ minh họa hình thang, tam giác, hình tròn.',
    archivalLocation: 'Bảo tàng Anh (The British Museum, London · EA 10057 & EA 10058)',
    caption:
      'Ahmes (khoảng 1550 TCN) · 84 bài toán về phân số đơn vị, cấp số nhân và phép xấp xỉ diện tích hình tròn',
    academicSignificance:
      'Văn bản toán học cổ đại ghi chép 84 bài toán về phân số đơn vị, cấp số nhân, thể tích kho thóc và phép xấp xỉ diện tích hình tròn tương ứng π ≈ 256/81 ≈ 3.1605. Đây là chứng tích vô giá về nguồn gốc đại số sơ cấp và sư phạm toán học cổ đại.',
    coreAcademicValue:
      'Tài liệu cổ nhất trình bày hệ thống bài toán mẫu sư phạm về phân số đơn vị Ai Cập, phương trình bậc nhất (aha) và xấp xỉ hằng số π.',
    imageSrc: 'https://upload.wikimedia.org/wikipedia/commons/d/d9/Rhind_Mathematical_Papyrus.jpg',
    alt: 'Cuộn giấy cói Toán học Rhind viết khoảng năm 1550 TCN hiện lưu giữ tại Bảo tàng Anh',
  },
  {
    id: 'archimedes-palimpsest',
    category: 'math-geometry',
    shortTitle: 'Archimedes Palimpsest',
    title: 'Phương pháp Các Định lý Cơ học (Archimedes Palimpsest)',
    originalTitle: 'The Method of Mechanical Theorems — Archimedes Palimpsest',
    artistOrOrigin: 'Archimedes xứ Syracuse',
    yearOrEra: 'Thế kỷ III TCN · Syracuse',
    eraAndPeriod: 'Thế kỷ III TCN (Bản chép thế kỷ X · Đế quốc Byzantine)',
    materialAndTechnique:
      'Bản thảo da dê viết đè (palimpsest) được giải mã bằng tia X huỳnh quang, hé lộ hình vẽ cân bằng vi phân hình học của Archimedes.',
    archivalLocation: 'Bảo tàng Nghệ thuật Walters (Walters Art Museum, Baltimore, Maryland)',
    caption:
      'Archimedes (Thế kỷ III TCN) · Nguyên lý đòn bẩy và phép vét kiệt — Tiền thân của Tích phân Riemann',
    academicSignificance:
      'Công trình sử dụng nguyên lý đòn bẩy và phép vét kiệt (tiền thân của tích phân Riemann) để tính thể tích hình cầu, hình nón và paraboloid. Lần đầu tiên trong lịch sử, các lát cắt vô cùng bé và vô hạn thực tại được dùng để khám phá định lý hình học.',
    coreAcademicValue:
      'Đỉnh cao phương pháp giải tích sơ khai: kết hợp trực giác cơ học (cân các lát cắt phẳng) với phép vét kiệt Euclid để mở đường cho Giải tích.',
    imageSrc: 'https://upload.wikimedia.org/wikipedia/commons/1/1b/ArPalimTypPage.jpg',
    alt: 'Trang bản thảo da dê Archimedes Palimpsest phục dựng bằng hình ảnh đa phổ',
  },
  {
    id: 'gac-chuong-chua-keo-1632',
    category: 'vietnam-heritage',
    shortTitle: 'Gác Chuông Chùa Keo',
    title: 'Gác Chuông Chùa Keo (Thái Bình, 1632)',
    originalTitle: 'Thần Quang Tự — Gác chuông gỗ ba tầng 12 mái không đinh sắt',
    artistOrOrigin: 'Nghệ nhân Thời Lê Trung Hưng',
    yearOrEra: '1632 · Vũ Thư, Thái Bình',
    eraAndPeriod: 'Thời Lê Trung Hưng · Năm 1632 · Xã Duy Nhất, Vũ Thư, Thái Bình',
    materialAndTechnique:
      'Kiến trúc gỗ lim cao 11,04 m gồm 3 tầng 12 mái đao cong; lắp ghép hoàn toàn từ hệ con sơn đấu củng và mộng gỗ chính xác tuyệt đối không dùng đinh sắt.',
    archivalLocation: 'Chùa Keo (Di tích Quốc gia Đặc biệt · Huyện Vũ Thư, Tỉnh Thái Bình)',
    caption:
      'Thời Lê Trung Hưng (1632) · Đỉnh cao hình học kết cấu gỗ cổ truyền 3 tầng 12 mái lắp mộng không đinh sắt',
    academicSignificance:
      'Đỉnh cao hình học kết cấu gỗ cổ truyền Việt Nam cao 11,04m gồm 3 tầng 12 mái uốn đao mềm mại. Toàn bộ khung chịu lực được lắp ghép từ hàng trăm con sơn, đấu củng bằng mộng gỗ chính xác tuyệt đối mà không dùng một chiếc đinh sắt nào.',
    coreAcademicValue:
      'Kiệt tác cơ học tĩnh lực và hình học không gian gỗ lim: hàng trăm thanh đấu củng phân tán trọng lực đều đặn qua mộng khớp hoàn hảo.',
    imageSrc: 'https://upload.wikimedia.org/wikipedia/commons/2/2c/Gac_chuong_chua_Keo_3.jpg',
    alt: 'Gác chuông Chùa Keo ba tầng mái cong cổ kính tại Vũ Thư Thái Bình năm 1632',
  },
  {
    id: 'la-geometrie-descartes',
    category: 'math-geometry',
    shortTitle: 'La Géométrie (1637)',
    title: 'La Géométrie (Hình học Giải tích)',
    originalTitle: 'La Géométrie — Phụ lục Phương pháp luận của René Descartes',
    artistOrOrigin: 'René Descartes',
    yearOrEra: '1637 · Leiden',
    eraAndPeriod: '1637 · Leiden, Hà Lan (In tại xưởng Jan Maire)',
    materialAndTechnique:
      'Ấn bản in chữ chì thế kỷ XVII sử dụng ký hiệu lũy thừa x², x³ và chữ cái đầu a, b, c cho hằng số, x, y, z cho ẩn số.',
    archivalLocation: 'Thư viện Quốc gia Pháp (BnF, Paris) & Bảo tàng Lịch sử Khoa học Boerhaave',
    caption:
      'René Descartes (1637) · Kết nối Đại số và Hình học qua hệ tọa độ — Mở đường cho Hình học Affine & Giải tích',
    academicSignificance:
      'Công trình cách mạng kết nối Đại số với Hình học thông qua hệ tọa độ, mở đường cho Hình học Affine, Hình học Euclide và Giải tích hiện đại. Descartes chứng minh rằng mọi đường cong hình học có thể mã hóa thành phương trình đa thức đại số f(x, y) = 0.',
    coreAcademicValue:
      'Cầu nối vĩ đại giữa Hình học không gian và Đại số đa thức, định hình ký hiệu toán học hiện đại (a, b, c vs x, y, z) và hệ trục tọa độ.',
    imageSrc: 'https://upload.wikimedia.org/wikipedia/commons/4/4b/Descartes_La-Geometrie_1637.png',
    alt: 'Trang nhan đề ấn bản gốc La Géométrie năm 1637 của René Descartes',
  },
  {
    id: 'principia-mathematica-newton',
    category: 'astronomy-science',
    shortTitle: 'Principia (1687)',
    title: 'Principia Mathematica (Các Nguyên lý Toán học của Triết học Tự nhiên)',
    originalTitle: 'Philosophiæ Naturalis Principia Mathematica — Ấn bản đầu năm 1687',
    artistOrOrigin: 'Isaac Newton',
    yearOrEra: '1687 · Luân Đôn',
    eraAndPeriod: '1687 · Hội Hoàng gia Luân Đôn (Royal Society, Anh Quốc)',
    materialAndTechnique:
      'Ấn bản sách in folio thế kỷ XVII chứa ba quyển định luật cơ học, lý thuyết tỷ lệ sơ yếu tối hậu (giới hạn) và đồ thị quỹ đạo conic.',
    archivalLocation: 'Thư viện Trinity College, Cambridge & Thư viện Hội Hoàng gia Luân Đôn',
    caption:
      'Isaac Newton (1687) · Đặt nền tảng cho Giải tích, lý thuyết giới hạn và các định luật chuyển động vũ trụ',
    academicSignificance:
      'Tác phẩm đặt nền tảng cho phép tính vi tích phân, lý thuyết giới hạn (Method of First and Last Ratios) và các định luật chuyển động vũ trụ. Newton chứng minh rằng định luật vạn vật hấp dẫn tỷ lệ nghịch bình phương khoảng cách tất yếu suy ra quỹ đạo conic của Kepler.',
    coreAcademicValue:
      'Tượng đài tổng hợp giữa Giải tích vi phân, lý thuyết giới hạn và Vật lý thiên văn, thống nhất cơ học Trái Đất với chuyển động thiên thể.',
    imageSrc:
      'https://upload.wikimedia.org/wikipedia/commons/f/f8/Newton_-_Principia_%281687%29%2C_title%2C_p._5%2C_cropped.jpg',
    alt: 'Trang bìa ấn bản năm 1687 Philosophiae Naturalis Principia Mathematica của Isaac Newton',
  },
  {
    id: 'disquisitiones-arithmeticae-gauss',
    category: 'math-geometry',
    shortTitle: 'Disquisitiones (1801)',
    title: 'Disquisitiones Arithmeticae (Nghiên cứu Số học)',
    originalTitle: 'Disquisitiones Arithmeticae — Kiệt tác Số học Môđulô và Nhóm Aben',
    artistOrOrigin: 'Carl Friedrich Gauss',
    yearOrEra: '1801 · Leipzig',
    eraAndPeriod: '1801 · Leipzig, Đức (In tại Gerh. Fleischer Jun.)',
    materialAndTechnique:
      'Ấn bản in Latin đầu thế kỷ XIX giới thiệu ký hiệu đồng dư thức (≡), luật thuận nghịch bậc hai và phương trình chia đường tròn cyclotomic.',
    archivalLocation: 'Thư viện Bang và Đại học Hạ Saxony (SUB Göttingen, Đức)',
    caption:
      'Carl Friedrich Gauss (1801) · Khai sinh số học môđulô a ≡ b (mod n), cấu trúc nhóm và đa giác đều 17 cạnh',
    academicSignificance:
      'Kiệt tác khai sinh số học môđulô hiện đại a ≡ b (mod n), cấu trúc nhóm các lớp thặng dư khả nghịch và định lý dựng đa giác đều 17 cạnh chỉ bằng thước thẳng và compa. Đây là trụ cột trực tiếp dẫn tới Cấu trúc Đại số hiện đại về nhóm, vành và trường Galois.',
    coreAcademicValue:
      'Khai sinh phép đồng dư (mod n), cấu trúc đại số của nhóm lớp thặng dư khả nghịch U(n) và tiêu chuẩn Gauss–Wantzel về dựng hình đa giác đều.',
    imageSrc: 'https://upload.wikimedia.org/wikipedia/commons/e/e3/Disqvisitiones-800.jpg',
    alt: 'Trang bìa ấn bản đầu Disquisitiones Arithmeticae năm 1801 của Carl Friedrich Gauss',
  },
  {
    id: 'moc-ban-quoc-tu-giam-trieu-nguyen',
    category: 'vietnam-heritage',
    shortTitle: 'Mộc bản Triều Nguyễn',
    title: 'Mộc bản Quốc Tử Giám & Triều Nguyễn (Di sản Tư liệu Thế giới)',
    originalTitle: 'Mộc bản Triều Nguyễn — 34.618 bản khắc gỗ in sách khoa cử & sử liệu',
    artistOrOrigin: 'Quốc sử quán & Nghệ nhân Khắc bản',
    yearOrEra: 'Thế kỷ XVII – XX · Đà Lạt',
    eraAndPeriod: 'Thế kỷ XVII – XX · UNESCO công nhận Di sản Tư liệu Thế giới năm 2009',
    materialAndTechnique:
      'Ván gỗ thị và gỗ nha đồng phơi khô kỹ thuật cao, chạm khắc nổi chữ viết đảo ngược tinh xảo hai mặt dùng để nhân bản sách giáo khoa, lịch sử, toán pháp.',
    archivalLocation: 'Trung tâm Lưu trữ Quốc gia IV (Thành phố Đà Lạt, Tỉnh Lâm Đồng)',
    caption:
      'Di sản Tư liệu Thế giới (UNESCO 2009) · 34.618 tấm ván gỗ thị khắc ngược lưu truyền học thuật quốc gia',
    academicSignificance:
      'Kho tàng 34.618 tấm ván gỗ thị khắc chữ ngược tinh xảo dùng để in sách giáo khoa, lịch sử, địa chí và toán pháp phục vụ giảng dạy tại Quốc Tử Giám và các kỳ thi Hương, thi Hội, thi Đình.',
    coreAcademicValue:
      'Kỹ thuật đối xứng gương trên bản khắc gỗ thị cùng hệ thống văn bản giáo dục chuẩn mực, bảo tồn tri thức quốc gia suốt nhiều thế kỷ.',
    imageSrc:
      'https://upload.wikimedia.org/wikipedia/commons/b/bb/Woodblocks_of_the_Nguy%E1%BB%85n_Dynasty_01.jpg',
    alt: 'Mộc bản Quốc Tử Giám và Triều Nguyễn Di sản Tư liệu Thế giới tại Đà Lạt',
  },
  {
    id: 'dai-hoc-dong-duong-1906',
    category: 'vietnam-heritage',
    shortTitle: 'Đại học Đông Dương (1906)',
    title: 'Tòa nhà Đại học Đông Dương (Đại học Quốc gia Hà Nội, 1906)',
    originalTitle: 'Université Indochinoise — Giảng đường Khoa học Cơ bản 19 Lê Thánh Tông',
    artistOrOrigin: 'Kiến trúc sư Ernest Hébrard',
    yearOrEra: '1906 · 19 Lê Thánh Tông, Hà Nội',
    eraAndPeriod: 'Thành lập năm 1906 · Đầu thế kỷ XX · 19 Lê Thánh Tông, Hoàn Kiếm, Hà Nội',
    materialAndTechnique:
      'Tòa nhà kiến trúc phong cách Đông Dương (Indochine) đối xứng với mái vòm bát giác, hệ mái ngói nhiều tầng Á Đông và giảng đường vòm lấy sáng tự nhiên.',
    archivalLocation:
      'Đại học Quốc gia Hà Nội & Trường Đại học Khoa học Tự nhiên (19 Lê Thánh Tông)',
    caption:
      'Kiến trúc sư Ernest Hébrard · Thiết chế đại học và nghiên cứu khoa học hiện đại đầu tiên tại Việt Nam',
    academicSignificance:
      'Thiết chế giáo dục đại học và nghiên cứu khoa học hiện đại đầu tiên tại Việt Nam. Công trình là biểu tượng của phong cách kiến trúc Đông Dương (Indochine) với mái vòm bát giác đối xứng, hệ cửa lấy sáng tự nhiên và giảng đường học thuật trang nghiêm.',
    coreAcademicValue:
      'Khởi nguồn nền giáo dục đại học – nghiên cứu khoa học cơ bản Việt Nam trong không gian mái vòm bát giác giao thoa Á – Âu chuẩn mực.',
    imageSrc:
      'https://upload.wikimedia.org/wikipedia/commons/6/60/T%C3%B2a_nh%C3%A0_19_L%C3%AA_Th%C3%A1nh_T%C3%B4ng_bi%E1%BB%83u_t%C6%B0%E1%BB%A3ng_%C4%90%E1%BA%A1i_h%E1%BB%8Dc_Qu%E1%BB%91c_gia_H%C3%A0_N%E1%BB%99i.jpg',
    alt: 'Tòa nhà Đại học Đông Dương 19 Lê Thánh Tông biểu tượng Đại học Quốc gia Hà Nội thành lập năm 1906',
  },
] as const;

const ROTATION_INTERVAL_MS = 20000;
const SLIDE_TRANSITION_MS = 350;

/**
 * Kiểm tra xem tác phẩm sử dụng tranh minh họa SVG nội bộ hay URL ảnh mạng.
 */
export function isHeritageInlineSvg(artwork: HeritageArtwork): boolean {
  return artwork.imageSrc.startsWith('svg://');
}

/**
 * Minh họa đồ họa toàn khung (`w-full h-full`) đa lớp Vàng Đồng – Giấy Dó – Chàm Ngọc:
 * - Bản vẽ Điển tịch Giấy Dó Việt Nam sắc nét riêng cho Đại thành Toán pháp (16) & Lập thành Toán pháp (17).
 * - Đồ họa kiến trúc cổ truyền, bản đồ – mộc bản và hình học – thiên văn học kinh điển cho mọi tác phẩm khi ngoại tuyến.
 */
export function HeritageFallbackIllustration({
  artwork,
  compact = false,
}: {
  readonly artwork: HeritageArtwork;
  readonly compact?: boolean;
}) {
  const uid = useId().replace(/:/g, '');
  const indigoBgId = `lu-her-bg-${uid}`;
  const goldGradId = `lu-her-gold-${uid}`;
  const paperGradId = `lu-her-paper-${uid}`;

  const renderHeaderLabel = !compact && (
    <g>
      <rect
        x="110"
        y="344"
        width="420"
        height="42"
        rx="10"
        fill="#0D1824"
        fillOpacity="0.88"
        stroke="#D4A853"
        strokeOpacity="0.45"
        strokeWidth="1"
      />
      <text
        x="320"
        y="362"
        textAnchor="middle"
        fill="#FAF5E8"
        fontFamily="serif"
        fontSize="13.5"
        fontWeight="700"
      >
        {artwork.shortTitle} · {artwork.artistOrOrigin}
      </text>
      <text
        x="320"
        y="378"
        textAnchor="middle"
        fill="#E5B85B"
        fontFamily="monospace"
        fontSize="10"
        letterSpacing="1.2"
      >
        {artwork.yearOrEra}
      </text>
    </g>
  );

  // =====================================================================
  // MỤC 16: ĐẠI THÀNH TOÁN PHÁP — BẢN VẼ ĐIỂN TỊCH GIẤY DÓ VIỆT NAM
  // =====================================================================
  if (artwork.id === 'dai-thanh-toan-phap') {
    return (
      <svg
        viewBox="0 0 640 400"
        preserveAspectRatio="xMidYMid slice"
        className="h-full w-full select-none"
        aria-label={`Minh họa điển tịch giấy dó ${artwork.title}`}
      >
        <defs>
          <linearGradient id={indigoBgId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#0E1D2A" />
            <stop offset="55%" stopColor="#172E42" />
            <stop offset="100%" stopColor="#0B1620" />
          </linearGradient>
          <linearGradient id={paperGradId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FAF2DC" />
            <stop offset="50%" stopColor="#F2E4C2" />
            <stop offset="100%" stopColor="#E6D2A6" />
          </linearGradient>
          <linearGradient id={goldGradId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFF3D1" />
            <stop offset="50%" stopColor="#E5B85B" />
            <stop offset="100%" stopColor="#C8963E" />
          </linearGradient>
        </defs>

        <rect width="640" height="400" fill={`url(#${indigoBgId})`} />
        <rect
          x="14"
          y="14"
          width="612"
          height="372"
          rx="14"
          fill="none"
          stroke={`url(#${goldGradId})`}
          strokeOpacity="0.45"
          strokeWidth="1.2"
        />

        {/* Cuốn điển tịch Giấy Dó cổ mở đôi */}
        <rect
          x="46"
          y="34"
          width="548"
          height="304"
          rx="10"
          fill="#261B12"
          stroke="#D4A853"
          strokeOpacity="0.6"
          strokeWidth="1.4"
        />
        {/* Trang trái & Trang phải */}
        <rect
          x="56"
          y="42"
          width="260"
          height="288"
          rx="4"
          fill={`url(#${paperGradId})`}
          stroke="#B83B2E"
          strokeOpacity="0.45"
          strokeWidth="1"
        />
        <rect
          x="324"
          y="42"
          width="260"
          height="288"
          rx="4"
          fill={`url(#${paperGradId})`}
          stroke="#B83B2E"
          strokeOpacity="0.45"
          strokeWidth="1"
        />
        {/* Đường rãnh gáy sách & 4 nút khâu chỉ đỏ */}
        <line x1="320" y1="42" x2="320" y2="330" stroke="#7A542E" strokeWidth="2.4" />
        {[74, 142, 224, 294].map((ky) => (
          <g key={ky}>
            <line x1="312" y1={ky} x2="328" y2={ky} stroke="#B83B2E" strokeWidth="1.8" />
            <circle cx="320" cy={ky} r="2.2" fill="#B83B2E" />
          </g>
        ))}

        {/* Khung kẻ chỉ chu sa trên hai trang */}
        <rect
          x="68"
          y="54"
          width="236"
          height="264"
          fill="none"
          stroke="#B83B2E"
          strokeOpacity="0.55"
          strokeWidth="0.9"
        />
        <rect
          x="336"
          y="54"
          width="236"
          height="264"
          fill="none"
          stroke="#B83B2E"
          strokeOpacity="0.55"
          strokeWidth="0.9"
        />

        {/* TRANG TRÁI: BÀN TÍNH & PHÉP ĐO HÌNH KHUYÊN */}
        <text
          x="186"
          y="74"
          textAnchor="middle"
          fill="#8C2318"
          fontFamily="serif"
          fontSize="12.5"
          fontWeight="700"
          letterSpacing="0.8"
        >
          ĐẠI THÀNH TOÁN PHÁP
        </text>
        <line x1="94" y1="81" x2="278" y2="81" stroke="#B83B2E" strokeOpacity="0.4" />

        {/* Bàn tính cổ truyền 7 cột */}
        <g transform="translate(88, 92)">
          <rect
            x="0"
            y="0"
            width="196"
            height="74"
            rx="4"
            fill="#E3CE9E"
            stroke="#593B1F"
            strokeWidth="2"
          />
          <line x1="0" y1="22" x2="196" y2="22" stroke="#593B1F" strokeWidth="2" />
          {[24, 49, 74, 98, 123, 148, 172].map((bx, idx) => (
            <g key={bx}>
              <line x1={bx} y1="2" x2={bx} y2="72" stroke="#7A542E" strokeWidth="1.1" />
              <ellipse cx={bx} cy={11} rx="6" ry="3.8" fill="#6E3B1E" />
              <ellipse cx={bx} cy={36 + (idx % 2) * 8} rx="6" ry="3.8" fill="#8C2318" />
              <ellipse cx={bx} cy={54} rx="6" ry="3.8" fill="#6E3B1E" />
              <ellipse cx={bx} cy={63} rx="6" ry="3.8" fill="#6E3B1E" />
            </g>
          ))}
        </g>

        {/* Phép đo Diện tích Hình khuyên (Vành khăn) */}
        <g transform="translate(186, 232)">
          <circle
            cx="0"
            cy="0"
            r="44"
            fill="#D4A853"
            fillOpacity="0.22"
            stroke="#1B3B4B"
            strokeWidth="1.5"
          />
          <circle cx="0" cy="0" r="22" fill="#F2E4C2" stroke="#B83B2E" strokeWidth="1.4" />
          <line x1="0" y1="0" x2="44" y2="0" stroke="#1B3B4B" strokeDasharray="3 2" />
          <line x1="0" y1="0" x2="-15" y2="-16" stroke="#B83B2E" />
          <circle cx="0" cy="0" r="2.2" fill="#1B3B4B" />
          {!compact && (
            <>
              <text
                x="0"
                y="62"
                textAnchor="middle"
                fill="#142834"
                fontFamily="serif"
                fontSize="11"
                fontWeight="700"
              >
                Phép đo hình khuyên: S = π(R² − r²)
              </text>
              <text
                x="0"
                y="-52"
                textAnchor="middle"
                fill="#593B1F"
                fontFamily="serif"
                fontSize="10.5"
                fontWeight="600"
              >
                Bàn tính Cửu chương &amp; Diện tích vành khăn
              </text>
            </>
          )}
        </g>

        {/* TRANG PHẢI: TAM GIÁC ĐỒNG DẠNG & THỂ TÍCH CHÓP CỤT */}
        <text
          x="454"
          y="74"
          textAnchor="middle"
          fill="#142834"
          fontFamily="serif"
          fontSize="12"
          fontWeight="700"
        >
          TRẠNG LƯỜNG LƯƠNG THẾ VINH
        </text>
        <line x1="364" y1="81" x2="544" y2="81" stroke="#B83B2E" strokeOpacity="0.4" />

        {/* Sơ đồ Tam giác đồng dạng đo chiều cao */}
        <g transform="translate(362, 96)">
          <line x1="10" y1="92" x2="184" y2="92" stroke="#593B1F" strokeWidth="1.4" />
          <polygon
            points="24,92 24,22 174,92"
            fill="#1B3B4B"
            fillOpacity="0.1"
            stroke="#1B3B4B"
            strokeWidth="1.5"
          />
          <line x1="94" y1="92" x2="94" y2="55" stroke="#B83B2E" strokeWidth="1.6" />
          <circle cx="24" cy="22" r="3" fill="#B83B2E" />
          <circle cx="94" cy="55" r="2.8" fill="#1B3B4B" />
          {!compact && (
            <text
              x="98"
              y="16"
              textAnchor="middle"
              fill="#142834"
              fontFamily="serif"
              fontSize="10.5"
              fontWeight="600"
            >
              Tam giác đồng dạng đo chiều cao
            </text>
          )}
        </g>

        {/* Khối chóp cụt 3D */}
        <g transform="translate(384, 212)">
          <polygon
            points="26,20 96,20 122,74 0,74"
            fill="#D4A853"
            fillOpacity="0.24"
            stroke="#1B3B4B"
            strokeWidth="1.5"
          />
          <polygon
            points="38,8 106,8 96,20 26,20"
            fill="#E5B85B"
            fillOpacity="0.32"
            stroke="#1B3B4B"
            strokeWidth="1.3"
          />
          <polygon
            points="96,20 106,8 134,60 122,74"
            fill="#8C6A2E"
            fillOpacity="0.22"
            stroke="#1B3B4B"
            strokeWidth="1.3"
          />
          <line x1="61" y1="14" x2="61" y2="68" stroke="#B83B2E" strokeDasharray="3 2" />
          {!compact && (
            <text
              x="64"
              y="92"
              textAnchor="middle"
              fill="#142834"
              fontFamily="serif"
              fontSize="10.5"
              fontWeight="700"
            >
              Thể tích khối chóp cụt
            </text>
          )}
        </g>

        {/* Triện son tác giả */}
        <g transform="translate(528, 266)">
          <rect
            x="0"
            y="0"
            width="36"
            height="36"
            rx="4"
            fill="#B83B2E"
            fillOpacity="0.14"
            stroke="#B83B2E"
            strokeWidth="1.6"
          />
          <text
            x="18"
            y="16"
            textAnchor="middle"
            fill="#B83B2E"
            fontFamily="serif"
            fontSize="8.5"
            fontWeight="700"
          >
            LƯƠNG
          </text>
          <text
            x="18"
            y="28"
            textAnchor="middle"
            fill="#B83B2E"
            fontFamily="serif"
            fontSize="8.5"
            fontWeight="700"
          >
            THẾ VINH
          </text>
        </g>

        {renderHeaderLabel}
      </svg>
    );
  }

  // =====================================================================
  // MỤC 17: LẬP THÀNH TOÁN PHÁP — BẢN VẼ ĐIỂN TỊCH GIẤY DÓ VIỆT NAM
  // =====================================================================
  if (artwork.id === 'lap-thanh-toan-phap') {
    return (
      <svg
        viewBox="0 0 640 400"
        preserveAspectRatio="xMidYMid slice"
        className="h-full w-full select-none"
        aria-label={`Minh họa điển tịch giấy dó ${artwork.title}`}
      >
        <defs>
          <linearGradient id={indigoBgId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#0E1D2A" />
            <stop offset="55%" stopColor="#183246" />
            <stop offset="100%" stopColor="#0B1620" />
          </linearGradient>
          <linearGradient id={paperGradId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FAF2DC" />
            <stop offset="55%" stopColor="#EFE0BC" />
            <stop offset="100%" stopColor="#E4CFA0" />
          </linearGradient>
          <linearGradient id={goldGradId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFF3D1" />
            <stop offset="50%" stopColor="#E5B85B" />
            <stop offset="100%" stopColor="#C8963E" />
          </linearGradient>
        </defs>

        <rect width="640" height="400" fill={`url(#${indigoBgId})`} />
        <rect
          x="14"
          y="14"
          width="612"
          height="372"
          rx="14"
          fill="none"
          stroke={`url(#${goldGradId})`}
          strokeOpacity="0.45"
          strokeWidth="1.2"
        />

        {/* Sách mở đôi trên nền gỗ Chàm */}
        <rect
          x="46"
          y="34"
          width="548"
          height="304"
          rx="10"
          fill="#261B12"
          stroke="#D4A853"
          strokeOpacity="0.6"
          strokeWidth="1.4"
        />
        <rect
          x="56"
          y="42"
          width="260"
          height="288"
          rx="4"
          fill={`url(#${paperGradId})`}
          stroke="#B83B2E"
          strokeOpacity="0.45"
          strokeWidth="1"
        />
        <rect
          x="324"
          y="42"
          width="260"
          height="288"
          rx="4"
          fill={`url(#${paperGradId})`}
          stroke="#B83B2E"
          strokeOpacity="0.45"
          strokeWidth="1"
        />
        <line x1="320" y1="42" x2="320" y2="330" stroke="#7A542E" strokeWidth="2.4" />
        {[74, 142, 224, 294].map((ky) => (
          <g key={ky}>
            <line x1="312" y1={ky} x2="328" y2={ky} stroke="#B83B2E" strokeWidth="1.8" />
            <circle cx="320" cy={ky} r="2.2" fill="#B83B2E" />
          </g>
        ))}

        <rect
          x="68"
          y="54"
          width="236"
          height="264"
          fill="none"
          stroke="#B83B2E"
          strokeOpacity="0.55"
          strokeWidth="0.9"
        />
        <rect
          x="336"
          y="54"
          width="236"
          height="264"
          fill="none"
          stroke="#B83B2E"
          strokeOpacity="0.55"
          strokeWidth="0.9"
        />

        {/* TRANG TRÁI: TRẮC ĐỊA TAM GIÁC ĐỒNG DẠNG & ĐO RUỘNG HÌNH THANG */}
        <text
          x="186"
          y="74"
          textAnchor="middle"
          fill="#8C2318"
          fontFamily="serif"
          fontSize="12.5"
          fontWeight="700"
          letterSpacing="0.8"
        >
          LẬP THÀNH TOÁN PHÁP
        </text>
        <line x1="94" y1="81" x2="278" y2="81" stroke="#B83B2E" strokeOpacity="0.4" />

        {/* Trắc địa cọc tiêu đo chiều rộng sông bằng tam giác đồng dạng */}
        <g transform="translate(86, 94)">
          <path
            d="M 10 40 Q 60 32 104 40 Q 148 48 192 40"
            fill="none"
            stroke="#2B678C"
            strokeOpacity="0.5"
            strokeWidth="2"
          />
          <polygon points="100,12 36,90 164,90" fill="none" stroke="#142834" strokeWidth="1.4" />
          <line x1="64" y1="56" x2="136" y2="56" stroke="#B83B2E" strokeWidth="1.4" />
          <line x1="100" y1="12" x2="100" y2="90" stroke="#142834" strokeDasharray="3 2" />
          <circle cx="100" cy="12" r="3" fill="#B83B2E" />
          {!compact && (
            <text
              x="100"
              y="107"
              textAnchor="middle"
              fill="#142834"
              fontFamily="serif"
              fontSize="10.5"
              fontWeight="600"
            >
              Trắc địa tam giác đồng dạng qua sông
            </text>
          )}
        </g>

        {/* Hình thang đo điền thổ */}
        <g transform="translate(96, 224)">
          <polygon
            points="32,8 148,8 180,68 0,68"
            fill="#D4A853"
            fillOpacity="0.22"
            stroke="#1B3B4B"
            strokeWidth="1.5"
          />
          <line x1="90" y1="8" x2="90" y2="68" stroke="#B83B2E" strokeDasharray="3 2" />
          {!compact && (
            <text
              x="90"
              y="84"
              textAnchor="middle"
              fill="#142834"
              fontFamily="serif"
              fontSize="10.5"
              fontWeight="700"
            >
              Phép đo điền thổ hình thang &amp; hình tròn
            </text>
          )}
        </g>

        {/* TRANG PHẢI: MẶT CẮT ĐẮP ĐÊ CHÓP CỤT & LƯỚI VẬT LIỆU XÂY THÀNH */}
        <text
          x="454"
          y="74"
          textAnchor="middle"
          fill="#142834"
          fontFamily="serif"
          fontSize="12"
          fontWeight="700"
        >
          HOÀNG GIÁP VŨ HỮU
        </text>
        <line x1="364" y1="81" x2="544" y2="81" stroke="#B83B2E" strokeOpacity="0.4" />

        {/* Mô hình khối đê điều (Lăng trụ hình thang 3D) */}
        <g transform="translate(366, 98)">
          <polygon
            points="22,68 48,26 112,26 138,68"
            fill="#D4A853"
            fillOpacity="0.25"
            stroke="#1B3B4B"
            strokeWidth="1.5"
          />
          <polygon
            points="48,26 112,26 156,12 92,12"
            fill="#E5B85B"
            fillOpacity="0.32"
            stroke="#1B3B4B"
            strokeWidth="1.3"
          />
          <polygon
            points="112,26 156,12 180,52 138,68"
            fill="#8C6A2E"
            fillOpacity="0.22"
            stroke="#1B3B4B"
            strokeWidth="1.3"
          />
          {!compact && (
            <text
              x="90"
              y="90"
              textAnchor="middle"
              fill="#142834"
              fontFamily="serif"
              fontSize="10.5"
              fontWeight="600"
            >
              Khối lượng đắp đê &amp; công trình thủy lợi
            </text>
          )}
        </g>

        {/* Bảng lưới lập thành tính gạch xây thành */}
        <g transform="translate(370, 212)">
          <rect
            x="0"
            y="0"
            width="138"
            height="72"
            fill="#E9D6AA"
            stroke="#1B3B4B"
            strokeWidth="1.3"
          />
          <g stroke="#1B3B4B" strokeOpacity="0.45" strokeWidth="0.9">
            <line x1="46" y1="0" x2="46" y2="72" />
            <line x1="92" y1="0" x2="92" y2="72" />
            <line x1="0" y1="24" x2="138" y2="24" />
            <line x1="0" y1="48" x2="138" y2="48" />
          </g>
          {!compact && (
            <text
              x="69"
              y="88"
              textAnchor="middle"
              fill="#142834"
              fontFamily="serif"
              fontSize="10.5"
              fontWeight="700"
            >
              Bảng tra Lập thành vật liệu
            </text>
          )}
        </g>

        {/* Triện son Vũ Hữu */}
        <g transform="translate(526, 266)">
          <rect
            x="0"
            y="0"
            width="36"
            height="36"
            rx="4"
            fill="#B83B2E"
            fillOpacity="0.14"
            stroke="#B83B2E"
            strokeWidth="1.6"
          />
          <text
            x="18"
            y="16"
            textAnchor="middle"
            fill="#B83B2E"
            fontFamily="serif"
            fontSize="9"
            fontWeight="700"
          >
            VŨ
          </text>
          <text
            x="18"
            y="28"
            textAnchor="middle"
            fill="#B83B2E"
            fontFamily="serif"
            fontSize="9"
            fontWeight="700"
          >
            HỮU
          </text>
        </g>

        {renderHeaderLabel}
      </svg>
    );
  }

  // =====================================================================
  // MỤC 03: MELENCOLIA I (ALBRECHT DÜRER, 1514) — ĐỒ HỌA KHẮC ĐỒNG TOÀN KHUNG
  // =====================================================================
  if (artwork.id === 'melencolia-i') {
    return (
      <svg
        viewBox="0 0 640 400"
        preserveAspectRatio="xMidYMid slice"
        className="h-full w-full select-none"
        aria-label={`Minh họa học thuật cho ${artwork.title}`}
      >
        <defs>
          <linearGradient id={indigoBgId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#10212E" />
            <stop offset="55%" stopColor="#183244" />
            <stop offset="100%" stopColor="#0D1822" />
          </linearGradient>
        </defs>
        <rect width="640" height="400" fill={`url(#${indigoBgId})`} />
        <rect
          x="16"
          y="16"
          width="608"
          height="368"
          rx="14"
          fill="none"
          stroke="#D4A853"
          strokeOpacity="0.48"
          strokeWidth="1.2"
        />

        {/* Sao chổi & tia hào quang trên biển */}
        <circle cx="130" cy="96" r="34" fill="#E5B85B" fillOpacity="0.16" />
        <circle cx="130" cy="96" r="10" fill="#FAF5E8" fillOpacity="0.9" />
        <path
          d="M 130 96 L 236 46 M 130 96 L 250 90 M 130 96 L 228 144"
          stroke="#E5B85B"
          strokeOpacity="0.52"
          strokeWidth="1.1"
          strokeDasharray="4 4"
        />

        {/* Khối đa diện cụt nổi tiếng của Dürer */}
        <g stroke="#FAF5E8" strokeWidth="1.7" strokeLinejoin="round">
          <polygon
            points="178,136 266,118 310,190 274,288 188,306 140,238"
            fill="#1B3B4B"
            fillOpacity="0.88"
          />
          <polygon points="178,136 266,118 248,172 188,186" fill="#E5B85B" fillOpacity="0.25" />
          <line x1="188" y1="186" x2="248" y2="172" stroke="#E5B85B" strokeWidth="1.4" />
          <line x1="248" y1="172" x2="310" y2="190" stroke="#E5B85B" strokeWidth="1.4" />
          <line x1="248" y1="172" x2="232" y2="262" stroke="#DCE6E2" strokeOpacity="0.85" />
          <line x1="232" y1="262" x2="274" y2="288" stroke="#DCE6E2" strokeOpacity="0.85" />
          <line x1="232" y1="262" x2="188" y2="306" stroke="#DCE6E2" strokeOpacity="0.85" />
          <line x1="188" y1="186" x2="140" y2="238" stroke="#DCE6E2" strokeOpacity="0.85" />
        </g>

        {/* Quả cầu trắc lượng & Compa */}
        <circle cx="344" cy="284" r="32" fill="#142834" stroke="#E5B85B" strokeWidth="1.6" />
        <ellipse
          cx="344"
          cy="284"
          rx="32"
          ry="11"
          fill="none"
          stroke="#DCE6E2"
          strokeOpacity="0.55"
          strokeDasharray="3 3"
        />
        <g stroke="#E5B85B" strokeWidth="1.7" fill="none" strokeLinecap="round">
          <circle cx="424" cy="222" r="4.5" fill="#E5B85B" />
          <path d="M 424 226 L 392 310 M 424 226 L 456 308" />
          <path d="M 402 276 Q 424 284 446 276" strokeOpacity="0.85" />
        </g>

        {/* Ma phương bậc 4 của Dürer */}
        <g transform="translate(392, 54)">
          <rect
            x="0"
            y="0"
            width="160"
            height="136"
            rx="8"
            fill="#0D1822"
            stroke="#E5B85B"
            strokeWidth="1.4"
          />
          <g stroke="#E5B85B" strokeOpacity="0.35" strokeWidth="0.9">
            <line x1="40" y1="0" x2="40" y2="136" />
            <line x1="80" y1="0" x2="80" y2="136" />
            <line x1="120" y1="0" x2="120" y2="136" />
            <line x1="0" y1="34" x2="160" y2="34" />
            <line x1="0" y1="68" x2="160" y2="68" />
            <line x1="0" y1="102" x2="160" y2="102" />
          </g>
          <g
            fill="#FAF5E8"
            fontFamily="monospace"
            fontSize="13"
            fontWeight="600"
            textAnchor="middle"
          >
            <text x="20" y="22">
              16
            </text>
            <text x="60" y="22">
              3
            </text>
            <text x="100" y="22">
              2
            </text>
            <text x="140" y="22">
              13
            </text>
            <text x="20" y="56">
              5
            </text>
            <text x="60" y="56">
              10
            </text>
            <text x="100" y="56">
              11
            </text>
            <text x="140" y="56">
              8
            </text>
            <text x="20" y="90">
              9
            </text>
            <text x="60" y="90">
              6
            </text>
            <text x="100" y="90">
              7
            </text>
            <text x="140" y="90">
              12
            </text>
            <text x="20" y="124">
              4
            </text>
            <text x="60" y="124" fill="#E5B85B">
              15
            </text>
            <text x="100" y="124" fill="#E5B85B">
              14
            </text>
            <text x="140" y="124">
              1
            </text>
          </g>
        </g>

        {renderHeaderLabel}
      </svg>
    );
  }

  // =====================================================================
  // CÁC TÁC PHẨM KHÁC KHI NGOẠI TUYẾN / LỖI TẢI ẢNH: ĐỒ HỌA KIẾN TRÚC & KHOA HỌC ĐA LỚP TOÀN KHUNG
  // =====================================================================
  const isVnArch =
    artwork.id === 'khue-van-cac' ||
    artwork.id === 'chua-mot-cot-1049' ||
    artwork.id === 'thap-but-dai-nghien-1865' ||
    artwork.id === 'truong-quoc-hoc-hue-1896' ||
    artwork.id === 'gac-chuong-chua-keo-1632' ||
    artwork.id === 'dai-hoc-dong-duong-1906' ||
    artwork.id === 'ngo-mon-dien-thai-hoa' ||
    artwork.id === 'hoang-thanh-thang-long' ||
    artwork.id === 'thap-cham-my-son' ||
    artwork.id === 'thap-pho-minh';

  const isCelestial =
    artwork.category === 'astronomy-science' ||
    artwork.id === 'nguoi-chiem-tinh' ||
    artwork.id === 'nguoi-vitruvius' ||
    artwork.id === 'truong-hoc-athena';

  const isGeometry = artwork.category === 'math-geometry';

  return (
    <svg
      viewBox="0 0 640 400"
      preserveAspectRatio="xMidYMid slice"
      className="h-full w-full select-none"
      aria-label={`Minh họa học thuật cho ${artwork.title}`}
    >
      <defs>
        <linearGradient id={indigoBgId} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#10212E" />
          <stop offset="50%" stopColor="#183244" />
          <stop offset="100%" stopColor="#0C1722" />
        </linearGradient>
        <radialGradient id={paperGradId} cx="50%" cy="45%" r="55%">
          <stop offset="0%" stopColor="#E5B85B" stopOpacity="0.28" />
          <stop offset="55%" stopColor="#D4A853" stopOpacity="0.08" />
          <stop offset="100%" stopColor="#10212E" stopOpacity="0" />
        </radialGradient>
        <linearGradient id={goldGradId} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FFF3D1" />
          <stop offset="50%" stopColor="#E5B85B" />
          <stop offset="100%" stopColor="#C8963E" />
        </linearGradient>
      </defs>

      {/* Nền Chàm Hoàng Gia & Hào quang Hổ Phách */}
      <rect width="640" height="400" fill={`url(#${indigoBgId})`} />
      <circle cx="320" cy="180" r="210" fill={`url(#${paperGradId})`} />

      {/* Đường viền khung bảo tàng kép */}
      <rect
        x="16"
        y="16"
        width="608"
        height="368"
        rx="14"
        fill="none"
        stroke="#D4A853"
        strokeOpacity="0.45"
        strokeWidth="1.2"
      />
      <rect
        x="26"
        y="26"
        width="588"
        height="348"
        rx="10"
        fill="none"
        stroke="#FAF5E8"
        strokeOpacity="0.14"
        strokeDasharray="4 6"
      />

      {/* Họa tiết đồng tâm Trống Đồng mờ */}
      <circle cx="320" cy="182" r="146" fill="none" stroke="#D4A853" strokeOpacity="0.16" />
      <circle
        cx="320"
        cy="182"
        r="116"
        fill="none"
        stroke="#D4A853"
        strokeOpacity="0.22"
        strokeDasharray="5 5"
      />

      {isVnArch ? (
        <g stroke={`url(#${goldGradId})`} fill="none" strokeLinecap="round" strokeLinejoin="round">
          {/* Mái đao cong nhiều tầng cổ truyền Việt Nam & Bóng nước phản chiếu */}
          <path
            d="M 196 156 Q 256 142 320 92 Q 384 142 444 156 Z"
            fill="#E5B85B"
            fillOpacity="0.18"
            strokeWidth="1.8"
          />
          <path
            d="M 224 198 Q 272 186 320 144 Q 368 186 416 198 Z"
            fill="#FAF5E8"
            fillOpacity="0.12"
            strokeWidth="1.6"
          />
          <rect
            x="246"
            y="198"
            width="148"
            height="68"
            fill="#142834"
            fillOpacity="0.72"
            strokeWidth="1.5"
          />
          <circle cx="320" cy="162" r="16" fill="#FAF5E8" fillOpacity="0.18" strokeWidth="1.5" />
          {[268, 294, 346, 372].map((px) => (
            <line key={px} x1={px} y1="198" x2={px} y2="266" strokeWidth="2.1" />
          ))}
          {/* Đường soi bóng mặt hồ */}
          <line x1="170" y1="274" x2="470" y2="274" strokeOpacity="0.6" strokeWidth="1.4" />
          <line
            x1="210"
            y1="288"
            x2="430"
            y2="288"
            stroke="#FAF5E8"
            strokeOpacity="0.32"
            strokeDasharray="8 6"
          />
          <line x1="240" y1="302" x2="400" y2="302" strokeOpacity="0.22" strokeDasharray="5 7" />
        </g>
      ) : isCelestial ? (
        <g stroke={`url(#${goldGradId})`} fill="none" strokeWidth="1.45">
          <circle cx="320" cy="182" r="18" fill="#E5B85B" fillOpacity="0.28" />
          <circle cx="320" cy="182" r="54" strokeOpacity="0.72" />
          <ellipse
            cx="320"
            cy="182"
            rx="124"
            ry="66"
            transform="rotate(-22 320 182)"
            stroke="#FAF5E8"
            strokeOpacity="0.68"
          />
          <ellipse
            cx="320"
            cy="182"
            rx="118"
            ry="58"
            transform="rotate(28 320 182)"
            stroke="#38BDF8"
            strokeOpacity="0.62"
          />
          <polygon points="320,96 394,226 246,226" stroke="#E5B85B" strokeOpacity="0.58" />
          <circle cx="394" cy="152" r="5" fill="#FAF5E8" stroke="none" />
          <circle cx="242" cy="204" r="4.5" fill="#38BDF8" stroke="none" />
        </g>
      ) : isGeometry ? (
        <g stroke={`url(#${goldGradId})`} fill="none" strokeWidth="1.5">
          <rect
            x="230"
            y="92"
            width="180"
            height="180"
            fill="#142834"
            fillOpacity="0.5"
            stroke="#FAF5E8"
            strokeOpacity="0.58"
          />
          <polygon
            points="320,82 414,150 378,260 262,260 226,150"
            fill="#E5B85B"
            fillOpacity="0.16"
          />
          <polygon points="320,104 378,244 262,244" stroke="#38BDF8" strokeOpacity="0.75" />
          <path d="M 188 182 H 452 M 320 68 V 296" stroke="#E5B85B" strokeOpacity="0.32" />
          <circle cx="320" cy="182" r="4" fill="#FAF5E8" stroke="none" />
        </g>
      ) : (
        /* Di sản Bản đồ, Mộc bản, Bia ký & Trống đồng Việt Nam */
        <g stroke={`url(#${goldGradId})`} fill="none" strokeWidth="1.45">
          <rect
            x="200"
            y="84"
            width="240"
            height="196"
            rx="10"
            fill="#FAF5E8"
            fillOpacity="0.08"
            strokeOpacity="0.65"
          />
          <circle cx="320" cy="182" r="70" strokeOpacity="0.6" />
          <circle
            cx="320"
            cy="182"
            r="46"
            stroke="#FAF5E8"
            strokeOpacity="0.45"
            strokeDasharray="3 4"
          />
          <path
            d="M 320 112 L 331 158 L 378 146 L 340 176 L 384 190 L 338 198 L 366 236 L 326 208 L 320 248 L 314 208 L 274 236 L 302 198 L 256 190 L 300 176 L 262 146 L 309 158 Z"
            fill="#E5B85B"
            fillOpacity="0.24"
          />
          <circle cx="320" cy="182" r="4.5" fill="#FAF5E8" stroke="none" />
        </g>
      )}

      {renderHeaderLabel}
    </svg>
  );
}

export function HeritageArtShowcase() {
  const prefersReducedMotion = useReducedMotion();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [slideDirection, setSlideDirection] = useState<'next' | 'prev'>('next');
  const [isPaused, setIsPaused] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [isMetadataOpen, setIsMetadataOpen] = useState(false);

  const imgMotionRef = useRef<HTMLImageElement>(null);
  const glareRef = useRef<HTMLDivElement>(null);
  const motionRafRef = useRef<number>(0);
  const transitionTimerRef = useRef<number>(0);
  const parallaxStateRef = useRef({
    curX: 0,
    curY: 0,
    curScale: 1,
    targetX: 0,
    targetY: 0,
    targetScale: 1,
    px: 0.5,
    py: 0.5,
    active: false,
    lastNow: 0,
  });

  const totalArtworks = HERITAGE_ARTWORKS.length;
  const currentArtwork = HERITAGE_ARTWORKS[currentIndex] ?? HERITAGE_ARTWORKS[0]!;
  const nextIndex = (currentIndex + 1) % totalArtworks;
  const thirdIndex = (currentIndex + 2) % totalArtworks;
  const nextArtwork = HERITAGE_ARTWORKS[nextIndex] ?? HERITAGE_ARTWORKS[0]!;
  const thirdArtwork = HERITAGE_ARTWORKS[thirdIndex] ?? HERITAGE_ARTWORKS[0]!;

  const goToArtwork = useCallback(
    (newIndex: number, direction: 'next' | 'prev' = 'next') => {
      setImageError(false);
      setSlideDirection(direction);
      if (transitionTimerRef.current !== 0) {
        window.clearTimeout(transitionTimerRef.current);
        transitionTimerRef.current = 0;
      }
      if (prefersReducedMotion) {
        setCurrentIndex((newIndex + totalArtworks) % totalArtworks);
        return;
      }
      setIsTransitioning(true);
      transitionTimerRef.current = window.setTimeout(() => {
        transitionTimerRef.current = 0;
        setCurrentIndex((newIndex + totalArtworks) % totalArtworks);
        setIsTransitioning(false);
      }, SLIDE_TRANSITION_MS);
    },
    [prefersReducedMotion, totalArtworks],
  );

  const handleNext = useCallback(() => {
    goToArtwork(currentIndex + 1, 'next');
  }, [currentIndex, goToArtwork]);

  const handlePrev = useCallback(() => {
    goToArtwork(currentIndex - 1, 'prev');
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

  // Dọn dẹp animation frame & timer khi unmount
  useEffect(() => {
    return () => {
      if (motionRafRef.current !== 0) {
        window.cancelAnimationFrame(motionRafRef.current);
      }
      if (transitionTimerRef.current !== 0) {
        window.clearTimeout(transitionTimerRef.current);
      }
    };
  }, []);

  // Chuyển động vi sai tinh tế 120fps+ (±4px + scale 1.03) với exponential damping bên trong khung ảnh
  const ensureParallaxTick = useCallback(() => {
    if (motionRafRef.current !== 0) return;
    parallaxStateRef.current.lastNow = performance.now();

    const step = (now: number) => {
      const state = parallaxStateRef.current;
      const { dtSeconds } = computeFrameDelta(now, state.lastNow || now);
      state.lastNow = now;
      const damp = frameDampFactor(12, dtSeconds);

      state.curX += (state.targetX - state.curX) * damp;
      state.curY += (state.targetY - state.curY) * damp;
      state.curScale += (state.targetScale - state.curScale) * damp;

      if (imgMotionRef.current) {
        imgMotionRef.current.style.transform = `translate3d(${state.curX.toFixed(2)}px, ${state.curY.toFixed(2)}px, 0px) scale(${state.curScale.toFixed(4)})`;
      }
      if (glareRef.current) {
        if (state.active) {
          glareRef.current.style.opacity = '1';
          glareRef.current.style.background = `radial-gradient(circle 220px at ${(state.px * 100).toFixed(1)}% ${(state.py * 100).toFixed(1)}%, rgba(255, 248, 224, 0.24), rgba(229, 184, 105, 0.08) 45%, transparent 72%)`;
        } else {
          glareRef.current.style.opacity = '0';
        }
      }

      const settled =
        Math.abs(state.targetX - state.curX) < 0.02 &&
        Math.abs(state.targetY - state.curY) < 0.02 &&
        Math.abs(state.targetScale - state.curScale) < 0.0005;

      if (!settled) {
        motionRafRef.current = window.requestAnimationFrame(step);
      } else {
        state.curX = state.targetX;
        state.curY = state.targetY;
        state.curScale = state.targetScale;
        if (imgMotionRef.current) {
          imgMotionRef.current.style.transform = `translate3d(${state.curX.toFixed(2)}px, ${state.curY.toFixed(2)}px, 0px) scale(${state.curScale.toFixed(4)})`;
        }
        motionRafRef.current = 0;
      }
    };

    motionRafRef.current = window.requestAnimationFrame(step);
  }, []);

  const handleImageMouseMove = (event: React.MouseEvent<HTMLDivElement>) => {
    if (prefersReducedMotion) return;
    const rect = event.currentTarget.getBoundingClientRect();
    if (rect.width <= 0 || rect.height <= 0) return;

    const px = Math.min(1, Math.max(0, (event.clientX - rect.left) / rect.width));
    const py = Math.min(1, Math.max(0, (event.clientY - rect.top) / rect.height));
    parallaxStateRef.current.targetX = (px - 0.5) * 8;
    parallaxStateRef.current.targetY = (py - 0.5) * 8;
    parallaxStateRef.current.targetScale = 1.03;
    parallaxStateRef.current.px = px;
    parallaxStateRef.current.py = py;
    parallaxStateRef.current.active = true;
    ensureParallaxTick();
  };

  const handleImageMouseLeave = () => {
    parallaxStateRef.current.targetX = 0;
    parallaxStateRef.current.targetY = 0;
    parallaxStateRef.current.targetScale = 1;
    parallaxStateRef.current.active = false;
    if (glareRef.current) {
      glareRef.current.style.opacity = '0';
    }
    if (prefersReducedMotion) {
      if (imgMotionRef.current) {
        imgMotionRef.current.style.transform = 'translate3d(0px, 0px, 0px) scale(1)';
      }
      return;
    }
    ensureParallaxTick();
  };

  const formattedIndex = String(currentIndex + 1).padStart(2, '0');
  const formattedTotal = String(totalArtworks).padStart(2, '0');

  const ambientGlowStyle =
    'radial-gradient(circle at 50% 45%, rgba(212, 163, 115, 0.32), rgba(22, 50, 79, 0.34) 48%, transparent 75%)';

  const stackShellTransition = 'transition-all duration-[350ms] ease-[cubic-bezier(0.22,1,0.36,1)]';

  const slideHiddenClass =
    slideDirection === 'next' ? '-translate-x-5 opacity-0' : 'translate-x-5 opacity-0';

  return (
    <div
      data-testid="heritage-art-showcase"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      className="relative mx-auto w-full max-w-[780px] pb-6"
    >
      {/* Quầng sáng dịu tiệp bầu trời đêm và biển mây Hoàng Liên Sơn */}
      <div
        data-testid="heritage-ambient-glow"
        aria-hidden="true"
        className="pointer-events-none absolute -inset-6 rounded-[2.5rem] blur-3xl transition-all duration-700"
        style={{ background: ambientGlowStyle }}
      />

      {/* LỚP XẾP CHỒNG 3: Thẻ thẳng góc sâu phía sau (z-10) */}
      <button
        type="button"
        onClick={() => goToArtwork(thirdIndex, 'next')}
        aria-label={`Chuyển đến tác phẩm kế thứ hai: ${thirdArtwork.title}`}
        data-testid="heritage-stack-card-3"
        className={cn(
          'absolute inset-x-0 top-0 bottom-6 z-10 origin-bottom cursor-pointer overflow-hidden rounded-3xl border shadow-md',
          'translate-y-4 scale-[0.92] opacity-45 hover:opacity-65',
          stackShellTransition,
          'border-[#E8A85A]/35 bg-[#0E221E]/88',
        )}
      >
        <div className="flex h-full w-full flex-col justify-between p-6 opacity-55">
          <div className="h-4 w-32 rounded bg-[#C5A262]/20" />
          <div className="my-auto flex h-[320px] items-center justify-center overflow-hidden rounded-xl border border-[#C5A262]/20 bg-[#102621]/60">
            <span className="font-mono text-[11px] tracking-widest text-[#E5C158]/70 uppercase">
              {thirdArtwork.yearOrEra}
            </span>
          </div>
          <div className="h-3 w-48 rounded bg-[#C5A262]/20" />
        </div>
      </button>

      {/* LỚP XẾP CHỒNG 2: Thẻ thẳng góc tầng giữa (z-20) */}
      <button
        type="button"
        onClick={handleNext}
        aria-label={`Chuyển sang tác phẩm kế tiếp: ${nextArtwork.title}`}
        data-testid="heritage-stack-card-2"
        className={cn(
          'absolute inset-x-0 top-0 bottom-6 z-20 origin-bottom cursor-pointer overflow-hidden rounded-3xl border shadow-lg',
          'translate-y-2 scale-[0.96] opacity-75 hover:opacity-90',
          stackShellTransition,
          'border-[#E8A85A]/45 bg-[#112722]/92',
        )}
      >
        <div className="flex h-full w-full flex-col justify-between p-6 opacity-80">
          <div className="flex items-center justify-between font-mono text-[10px] tracking-widest text-[#E5C158] uppercase">
            <span>TIẾP THEO</span>
            <span>{nextArtwork.yearOrEra}</span>
          </div>
          <div className="my-auto flex h-[340px] flex-col items-center justify-center gap-2 overflow-hidden rounded-xl border border-[#C5A262]/25 bg-[#102621]/70 p-4 text-center">
            <span className="font-serif text-base font-semibold text-[#F8F6F0]/85">
              {nextArtwork.title}
            </span>
            <span className="font-mono text-[11px] text-[#D1DCD6]/75">
              {nextArtwork.artistOrOrigin}
            </span>
          </div>
          <p className="truncate font-serif text-sm font-semibold text-[#E5C158]">
            {nextArtwork.title}
          </p>
        </div>
      </button>

      {/* LỚP TIỀN CẢNH (z-30): Khung thẻ đứng phẳng 100% (rotate-0), nút bấm cố định dễ thao tác */}
      <div
        data-testid="heritage-active-card"
        className="relative z-30 flex w-full scale-100 rotate-0 flex-col overflow-hidden rounded-3xl border border-[#E8A85A]/50 bg-[#122623]/84 p-5 text-[#FFF9F0] shadow-[0_24px_55px_-16px_rgba(9,24,22,0.65)] backdrop-blur-xl transition-colors duration-700 sm:p-7"
      >
        {/* Viền ánh sáng nhẹ phía trên */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-[#E3B448]/70 to-transparent"
        />

        {/* Top Header Bar */}
        <div className="mb-3 flex items-center justify-between gap-2 border-b border-white/15 pb-3">
          <div className="flex items-center gap-2">
            <Landmark className="h-3.5 w-3.5 text-[#F6D383]" aria-hidden="true" />
            <span className="font-mono text-[10px] font-semibold tracking-widest text-[#F6D383] uppercase">
              DI SẢN HỌC THUẬT &amp; NGHỆ THUẬT
            </span>
          </div>

          <div className="flex items-center gap-2.5">
            <span className="font-mono text-[11px] font-medium text-[#E6E0D4]/85">
              {formattedIndex} / {formattedTotal}
            </span>

            {/* Dots Indicator */}
            <div className="hidden items-center gap-1.5 sm:flex" role="tablist">
              {HERITAGE_ARTWORKS.map((art, idx) => (
                <button
                  key={art.id}
                  type="button"
                  onClick={() => goToArtwork(idx, idx >= currentIndex ? 'next' : 'prev')}
                  aria-label={`Chuyển đến tác phẩm ${idx + 1}: ${art.title}`}
                  className={cn(
                    'h-1.5 cursor-pointer rounded-full transition-all duration-300',
                    idx === currentIndex
                      ? 'w-5 bg-[#F6D383]'
                      : 'w-1.5 bg-white/25 hover:bg-[#86EFAC]',
                  )}
                />
              ))}
            </div>

            {/* Nút điều khiển lật trang (w-8 h-8 rounded-full dễ bấm) */}
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={handlePrev}
                aria-label="Tác phẩm trước"
                className="inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border border-white/25 bg-white/10 text-[#F4F1EA] transition-all duration-200 hover:scale-105 hover:border-[#F6D383] hover:bg-white/20 hover:text-[#F6D383] active:scale-95"
              >
                <ChevronLeft className="h-4 w-4" aria-hidden="true" />
              </button>
              <button
                type="button"
                onClick={() => setIsPaused((prev) => !prev)}
                aria-label={isPaused ? 'Tiếp tục trình chiếu tác phẩm' : 'Tạm dừng trình chiếu'}
                className="inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border border-white/25 bg-white/10 text-[#F4F1EA] transition-all duration-200 hover:scale-105 hover:border-[#F6D383] hover:bg-white/20 hover:text-[#F6D383] active:scale-95"
              >
                {isPaused ? (
                  <Play className="h-3.5 w-3.5" aria-hidden="true" />
                ) : (
                  <Pause className="h-3.5 w-3.5" aria-hidden="true" />
                )}
              </button>
              <button
                type="button"
                onClick={handleNext}
                aria-label="Tác phẩm tiếp theo"
                className="inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border border-white/25 bg-white/10 text-[#F4F1EA] transition-all duration-200 hover:scale-105 hover:border-[#F6D383] hover:bg-white/20 hover:text-[#F6D383] active:scale-95"
              >
                <ChevronRight className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
          </div>
        </div>

        {/* Frame Trưng bày Hình ảnh: Khung ngoài đứng yên, chỉ ảnh bên trong scale(1.03) + vi sai ±4px */}
        <div
          data-testid="heritage-art-frame"
          onMouseMove={handleImageMouseMove}
          onMouseLeave={handleImageMouseLeave}
          className="relative flex h-[350px] w-full items-center justify-center overflow-hidden rounded-xl border border-[#E5B869]/35 bg-[#112722]/85 p-3 shadow-inner transition-colors duration-300 hover:border-[#F6D383]/65 md:h-[425px] xl:h-[460px]"
        >
          {imageError || isHeritageInlineSvg(currentArtwork) ? (
            <div
              data-testid="heritage-svg-fallback"
              className="flex h-full w-full items-center justify-center"
            >
              <HeritageFallbackIllustration artwork={currentArtwork} />
            </div>
          ) : (
            <img
              ref={imgMotionRef}
              src={currentArtwork.imageSrc}
              alt={currentArtwork.alt}
              referrerPolicy="no-referrer"
              onError={() => setImageError(true)}
              style={{ backfaceVisibility: 'hidden' }}
              className={cn(
                'mx-auto h-full w-full object-contain transition-opacity duration-[350ms] ease-[cubic-bezier(0.22,1,0.36,1)] will-change-transform select-none',
                isTransitioning ? slideHiddenClass : 'translate-x-0 opacity-100',
              )}
            />
          )}

          {/* Ánh sáng viền dịu bám theo con trỏ bên trong khung ảnh */}
          <div
            ref={glareRef}
            data-testid="heritage-foil-glare"
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 opacity-0 mix-blend-screen transition-opacity duration-300"
          />
        </div>

        {/* Thông tin tác phẩm trượt ngang + mờ dần khi chuyển trang */}
        <div
          className={cn(
            'mt-4 transition-all duration-[350ms] ease-[cubic-bezier(0.22,1,0.36,1)]',
            isTransitioning ? slideHiddenClass : 'translate-x-0 opacity-100',
          )}
        >
          <div>
            <h3 className="font-serif text-base font-bold text-[#F8F6F0] sm:text-lg">
              {currentArtwork.title}
            </h3>

            {/* Bố cục hàng Metadata */}
            <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
              <span className="font-mono text-xs font-semibold text-[#E5C158]">
                {currentArtwork.artistOrOrigin}
              </span>
              <span className="text-[#D1DCD6]/60" aria-hidden="true">
                ·
              </span>
              <span className="inline-flex items-center rounded-md border border-[#E8A85A]/35 bg-[#EBECE6] px-2 py-0.5 font-mono text-[11px] font-medium text-[#18221D]">
                {currentArtwork.yearOrEra}
              </span>
              <span className="text-[#D1DCD6]/60" aria-hidden="true">
                ·
              </span>
              <button
                type="button"
                onClick={() => setIsMetadataOpen((prev) => !prev)}
                aria-expanded={isMetadataOpen}
                data-testid="archival-metadata-trigger"
                className="cursor-pointer rounded-md border border-[#E5B869]/40 bg-white/10 px-2.5 py-1 font-mono text-[11px] text-[#E5C158] transition-colors hover:bg-white/20"
              >
                [Lược sử tác phẩm]
              </button>
            </div>
          </div>

          <p className="mt-2 font-serif text-xs text-[#E5C158]/95 italic">
            {currentArtwork.caption}
          </p>

          <p className="mt-2 text-xs leading-relaxed text-[#D1DCD6]">
            {currentArtwork.academicSignificance}
          </p>

          {/* Thẻ Lược sử Văn bản (Archival Metadata Popover / Drawer) */}
          {isMetadataOpen && (
            <div
              data-testid="archival-metadata-popover"
              role="region"
              aria-label={`Hồ sơ văn khố: ${currentArtwork.title}`}
              className="mt-4 rounded-2xl border border-[#E5B869]/35 bg-black/35 p-4 text-xs text-[#F4F1EA] shadow-xs"
            >
              <div className="mb-3 flex items-center justify-between border-b border-white/15 pb-2">
                <div className="flex items-center gap-2 font-mono text-[10px] font-semibold tracking-wider text-[#F3C978] uppercase">
                  <BookOpen className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>HỒ SƠ LƯỢC SỬ &amp; VĂN KHỐ TÁC PHẨM</span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsMetadataOpen(false)}
                  aria-label="Đóng lược sử tác phẩm"
                  className="inline-flex h-5 w-5 cursor-pointer items-center justify-center rounded border border-white/20 bg-white/10 text-[#F4F1EA] hover:text-[#F3C978]"
                >
                  <X className="h-3 w-3" aria-hidden="true" />
                </button>
              </div>

              <dl className="space-y-2 text-xs leading-relaxed">
                <div className="grid grid-cols-1 gap-0.5 sm:grid-cols-12 sm:gap-2">
                  <dt className="font-mono text-[11px] font-semibold text-[#F3C978] sm:col-span-4">
                    Tác phẩm:
                  </dt>
                  <dd className="font-serif font-medium sm:col-span-8">
                    {currentArtwork.originalTitle}
                  </dd>
                </div>

                <div className="grid grid-cols-1 gap-0.5 sm:grid-cols-12 sm:gap-2">
                  <dt className="font-mono text-[11px] font-semibold text-[#F3C978] sm:col-span-4">
                    Niên đại &amp; Thời kỳ:
                  </dt>
                  <dd className="sm:col-span-8">{currentArtwork.eraAndPeriod}</dd>
                </div>

                <div className="grid grid-cols-1 gap-0.5 sm:grid-cols-12 sm:gap-2">
                  <dt className="font-mono text-[11px] font-semibold text-[#F3C978] sm:col-span-4">
                    Chất liệu &amp; Kỹ thuật:
                  </dt>
                  <dd className="opacity-85 sm:col-span-8">
                    {currentArtwork.materialAndTechnique}
                  </dd>
                </div>

                <div className="grid grid-cols-1 gap-0.5 sm:grid-cols-12 sm:gap-2">
                  <dt className="font-mono text-[11px] font-semibold text-[#F3C978] sm:col-span-4">
                    Nơi lưu trữ gốc:
                  </dt>
                  <dd className="sm:col-span-8">{currentArtwork.archivalLocation}</dd>
                </div>

                <div className="grid grid-cols-1 gap-0.5 border-t border-white/15 pt-2 sm:grid-cols-12 sm:gap-2">
                  <dt className="font-mono text-[11px] font-semibold text-[#C89738] sm:col-span-4">
                    Giá trị học thuật cốt lõi:
                  </dt>
                  <dd className="sm:col-span-8">{currentArtwork.coreAcademicValue}</dd>
                </div>
              </dl>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
