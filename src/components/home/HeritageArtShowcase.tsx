import { BookOpen, ChevronLeft, ChevronRight, Landmark, Pause, Play, X } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useReducedMotion } from '@/shared/hooks/useReducedMotion';
import { computeFrameDelta, frameDampFactor } from '@/shared/lib/canvasSprites';
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
 * 15 Kiệt tác nghệ thuật & tư liệu lịch sử đích thực đại diện cho
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
    title: 'Bản đồ Hồng Đức (Hồng Đức bản đồ, 1490)',
    originalTitle:
      'Hồng Đức bản đồ sách (洪德版圖冊 — Bản đồ Thăng Long kinh thành & 13 thừa tuyên)',
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
    title: 'Kiến trúc Chùa Một Cột (Diên Hựu Tự, 1049)',
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
] as const;

const ROTATION_INTERVAL_MS = 20000;
const SLIDE_TRANSITION_MS = 350;

/**
 * Minh họa vector học thuật dự phòng (SVG) sắc nét khi ảnh gốc không thể tải (offline / 429),
 * đảm bảo không bao giờ xuất hiện khung đen rỗng (đặc biệt cho bản khắc đồng Melencolia I 03/15).
 */
function HeritageFallbackIllustration({ artwork }: { readonly artwork: HeritageArtwork }) {
  if (artwork.id === 'melencolia-i') {
    return (
      <svg
        viewBox="0 0 440 320"
        className="h-full w-full max-w-[420px] select-none"
        aria-label={`Minh họa học thuật cho ${artwork.title}`}
      >
        <defs>
          <linearGradient id="lu-melencolia-paper" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#213E37" />
            <stop offset="100%" stopColor="#122722" />
          </linearGradient>
        </defs>
        <rect
          x="14"
          y="14"
          width="412"
          height="292"
          rx="14"
          fill="url(#lu-melencolia-paper)"
          stroke="#E5C158"
          strokeOpacity="0.45"
          strokeWidth="1.2"
        />
        {/* Tia sáng sao chổi trên mặt biển phía xa */}
        <circle cx="96" cy="76" r="22" fill="#E5C158" fillOpacity="0.16" />
        <circle cx="96" cy="76" r="7" fill="#F8F6F0" fillOpacity="0.88" />
        <path
          d="M 96 76 L 164 42 M 96 76 L 178 72 M 96 76 L 160 112"
          stroke="#E5C158"
          strokeOpacity="0.5"
          strokeWidth="1"
          strokeDasharray="3 4"
        />

        {/* Khối đa diện cụt nổi tiếng của Dürer (Truncated Rhombohedron) */}
        <g stroke="#F8F6F0" strokeWidth="1.6" strokeLinejoin="round">
          <polygon
            points="126,118 190,104 222,158 196,232 132,246 98,194"
            fill="#2B5248"
            fillOpacity="0.82"
          />
          <polygon points="126,118 190,104 176,144 134,154" fill="#E5C158" fillOpacity="0.22" />
          <line x1="134" y1="154" x2="176" y2="144" stroke="#E5C158" strokeWidth="1.3" />
          <line x1="176" y1="144" x2="222" y2="158" stroke="#E5C158" strokeWidth="1.3" />
          <line x1="176" y1="144" x2="164" y2="212" stroke="#D1DCD6" strokeOpacity="0.8" />
          <line x1="164" y1="212" x2="196" y2="232" stroke="#D1DCD6" strokeOpacity="0.8" />
          <line x1="164" y1="212" x2="132" y2="246" stroke="#D1DCD6" strokeOpacity="0.8" />
          <line x1="134" y1="154" x2="98" y2="194" stroke="#D1DCD6" strokeOpacity="0.8" />
        </g>

        {/* Quả cầu trắc lượng & Compa hình học */}
        <circle cx="236" cy="242" r="26" fill="#1B3932" stroke="#E5C158" strokeWidth="1.4" />
        <ellipse
          cx="236"
          cy="242"
          rx="26"
          ry="9"
          fill="none"
          stroke="#D1DCD6"
          strokeOpacity="0.55"
          strokeWidth="0.9"
          strokeDasharray="3 3"
        />
        <g stroke="#E5C158" strokeWidth="1.5" fill="none" strokeLinecap="round">
          <circle cx="294" cy="186" r="4" fill="#E5C158" />
          <path d="M 294 190 L 270 258 M 294 190 L 320 256" />
          <path d="M 278 228 Q 295 234 312 228" strokeOpacity="0.8" />
        </g>

        {/* Ma phương bậc 4 kinh điển của Dürer (tổng mỗi hàng/cột = 34, đáy ghi năm 1514) */}
        <g transform="translate(274, 50)">
          <rect
            x="0"
            y="0"
            width="124"
            height="108"
            rx="6"
            fill="#11241F"
            stroke="#E5C158"
            strokeWidth="1.3"
          />
          <g stroke="#E5C158" strokeOpacity="0.35" strokeWidth="0.9">
            <line x1="31" y1="0" x2="31" y2="108" />
            <line x1="62" y1="0" x2="62" y2="108" />
            <line x1="93" y1="0" x2="93" y2="108" />
            <line x1="0" y1="27" x2="124" y2="27" />
            <line x1="0" y1="54" x2="124" y2="54" />
            <line x1="0" y1="81" x2="124" y2="81" />
          </g>
          <g
            fill="#F8F6F0"
            fontFamily="monospace"
            fontSize="11"
            fontWeight="600"
            textAnchor="middle"
          >
            <text x="15.5" y="17">
              16
            </text>
            <text x="46.5" y="17">
              3
            </text>
            <text x="77.5" y="17">
              2
            </text>
            <text x="108.5" y="17">
              13
            </text>
            <text x="15.5" y="44">
              5
            </text>
            <text x="46.5" y="44">
              10
            </text>
            <text x="77.5" y="44">
              11
            </text>
            <text x="108.5" y="44">
              8
            </text>
            <text x="15.5" y="71">
              9
            </text>
            <text x="46.5" y="71">
              6
            </text>
            <text x="77.5" y="71">
              7
            </text>
            <text x="108.5" y="71">
              12
            </text>
            <text x="15.5" y="98">
              4
            </text>
            <text x="46.5" y="98" fill="#E5C158">
              15
            </text>
            <text x="77.5" y="98" fill="#E5C158">
              14
            </text>
            <text x="108.5" y="98">
              1
            </text>
          </g>
        </g>

        <text
          x="220"
          y="292"
          textAnchor="middle"
          fill="#E5C158"
          fontFamily="monospace"
          fontSize="10"
          letterSpacing="1.8"
        >
          MELENCOLIA I · DÜRER SOLID &amp; MAGIC SQUARE (1514)
        </text>
      </svg>
    );
  }

  const isCelestial =
    artwork.id === 'copernicus-1543' ||
    artwork.id === 'kepler-1596' ||
    artwork.id === 'nguoi-chiem-tinh';
  const isPolyhedron =
    artwork.id === 'de-divina-proportione' ||
    artwork.id === 'nguoi-vitruvius' ||
    artwork.id === 'euclid-elements-1482';

  return (
    <svg
      viewBox="0 0 440 320"
      className="h-full w-full max-w-[420px] select-none"
      aria-label={`Minh họa học thuật cho ${artwork.title}`}
    >
      <rect
        x="14"
        y="14"
        width="412"
        height="292"
        rx="14"
        fill="#162E28"
        stroke="#E5C158"
        strokeOpacity="0.45"
        strokeWidth="1.2"
      />
      <rect
        x="24"
        y="24"
        width="392"
        height="272"
        rx="10"
        fill="none"
        stroke="#D1DCD6"
        strokeOpacity="0.16"
        strokeDasharray="4 4"
      />
      {isCelestial ? (
        <g stroke="#E5C158" fill="none" strokeWidth="1.3">
          <circle cx="220" cy="145" r="14" fill="#E5C158" fillOpacity="0.25" />
          <circle cx="220" cy="145" r="42" strokeOpacity="0.65" />
          <ellipse cx="220" cy="145" rx="82" ry="62" stroke="#F8F6F0" strokeOpacity="0.7" />
          <circle cx="220" cy="145" r="102" strokeDasharray="5 5" strokeOpacity="0.45" />
          <polygon points="220,76 280,180 160,180" stroke="#8EE5CE" strokeOpacity="0.55" />
          <circle cx="262" cy="145" r="4.5" fill="#F8F6F0" />
          <circle cx="152" cy="108" r="4" fill="#8EE5CE" />
        </g>
      ) : isPolyhedron ? (
        <g stroke="#E5C158" fill="none" strokeWidth="1.35">
          <circle cx="220" cy="148" r="82" strokeOpacity="0.45" />
          <rect x="150" y="78" width="140" height="140" stroke="#F8F6F0" strokeOpacity="0.6" />
          <polygon
            points="220,66 286,114 260,192 180,192 154,114"
            fill="#E5C158"
            fillOpacity="0.12"
          />
          <polygon points="220,88 264,182 176,182" stroke="#8EE5CE" strokeOpacity="0.72" />
        </g>
      ) : (
        <g stroke="#E5C158" fill="none" strokeWidth="1.35">
          <circle cx="220" cy="145" r="76" strokeOpacity="0.55" />
          <circle
            cx="220"
            cy="145"
            r="52"
            stroke="#F8F6F0"
            strokeOpacity="0.45"
            strokeDasharray="3 4"
          />
          <path
            d="M 220 78 L 231 124 L 278 112 L 240 142 L 284 156 L 238 164 L 266 202 L 226 174 L 220 214 L 214 174 L 174 202 L 202 164 L 156 156 L 200 142 L 162 112 L 209 124 Z"
            fill="#E5C158"
            fillOpacity="0.2"
          />
        </g>
      )}
      <text
        x="220"
        y="264"
        textAnchor="middle"
        fill="#F8F6F0"
        fontFamily="serif"
        fontSize="13.5"
        fontWeight="600"
      >
        {artwork.title}
      </text>
      <text x="220" y="284" textAnchor="middle" fill="#E5C158" fontFamily="monospace" fontSize="10">
        {artwork.yearOrEra}
      </text>
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
    'radial-gradient(circle at 50% 45%, rgba(232, 168, 90, 0.34), rgba(28, 78, 69, 0.32) 48%, transparent 75%)';

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
      {/* Quầng sáng dịu tiệp hoàng hôn Vịnh Hạ Long */}
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
          {imageError ? (
            <div
              data-testid="heritage-svg-fallback"
              className="flex h-full w-full items-center justify-center p-2"
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
