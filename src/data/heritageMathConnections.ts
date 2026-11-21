import type { WorkspaceSubjectSlug } from '@/features/workspace/types';

export interface HeritageMathConnection {
  readonly subjectSlug: WorkspaceSubjectSlug;
  readonly subjectCode: 'CTĐS' | 'HHAVE' | 'GTHMB' | 'GDH';
  readonly connection: string;
}

/**
 * Ánh xạ toàn bộ 40 tác phẩm Di sản sang tư duy toán học / sư phạm và 1 trong 4 học phần trọng tâm.
 * Mỗi câu liên hệ rút trực tiếp từ đặc trưng hình học, đại số, giải tích hoặc lịch sử giáo dục xác thực của tác phẩm.
 */
export const HERITAGE_MATH_CONNECTIONS: Readonly<Record<string, HeritageMathConnection>> = {
  'khue-van-cac': {
    subjectSlug: 'hinh-hoc-affine',
    subjectCode: 'HHAVE',
    connection:
      'Cửa tròn tám tiếp tuyến và mặt bằng vuông đối xứng gợi mở nhóm phép dời hình bảo toàn tâm và trực giao Euclid.',
  },
  'thay-do-coc': {
    subjectSlug: 'giao-duc-hoc',
    subjectCode: 'GDH',
    connection:
      'Minh họa trực quan mối quan hệ sư phạm thầy – trò và truyền thống tổ chức lớp học nhân văn của giáo dục Việt Nam.',
  },
  'melencolia-i': {
    subjectSlug: 'cau-truc-dai-so',
    subjectCode: 'CTĐS',
    connection:
      'Ma phương bậc 4 (tổng hằng số 34) và khối đa diện cụt Dürer thể hiện cấu trúc tổ hợp và bất biến đối xứng.',
  },
  'truong-hoc-athena': {
    subjectSlug: 'hinh-hoc-affine',
    subjectCode: 'HHAVE',
    connection:
      'Phối cảnh tuyến tính một điểm tụ biến các đường thẳng song song thành đồng quy — trực giác cốt lõi của hình học xạ ảnh.',
  },
  'nguoi-vitruvius': {
    subjectSlug: 'hinh-hoc-affine',
    subjectCode: 'HHAVE',
    connection:
      'Nghiên cứu phép vị tự, tỉ lệ đồng dạng và sự giao thoa giữa đường tròn tâm rốn với hình vuông ngoại tiếp.',
  },
  'bia-tien-si': {
    subjectSlug: 'giao-duc-hoc',
    subjectCode: 'GDH',
    connection:
      'Tư tưởng "Hiền tài là nguyên khí của quốc gia" đặt nền tảng triết lý đào tạo và đánh giá năng lực người học.',
  },
  'trong-dong-ngoc-lu': {
    subjectSlug: 'cau-truc-dai-so',
    subjectCode: 'CTĐS',
    connection:
      'Ngôi sao 14 cánh và các vành hoa văn đồng tâm minh họa rõ cấu trúc nhóm quay cyclic C₁₄ trong mặt phẳng.',
  },
  'euclid-elements-1482': {
    subjectSlug: 'hinh-hoc-affine',
    subjectCode: 'HHAVE',
    connection:
      'Hệ tiên đề Euclid khai sinh phương pháp suy diễn chặt chẽ, nền tảng trực tiếp của không gian Affine và Euclid.',
  },
  'nguoi-chiem-tinh': {
    subjectSlug: 'giai-tich-ham-mot-bien',
    subjectCode: 'GTHMB',
    connection:
      'Đo đạc vị trí thiên thể trên quả cầu thiên văn đòi hỏi phép xấp xỉ hàm lượng giác và tính liên tục của quỹ đạo.',
  },
  'de-divina-proportione': {
    subjectSlug: 'hinh-hoc-affine',
    subjectCode: 'HHAVE',
    connection:
      'Năm khối đa diện đều Platon và tỉ lệ vàng làm sáng tỏ cấu trúc lồi và đối xứng không gian 3 chiều.',
  },
  'ban-do-hong-duc': {
    subjectSlug: 'hinh-hoc-affine',
    subjectCode: 'HHAVE',
    connection:
      'Phép chiếu bản đồ hành chính là ứng dụng sớm của phép biến đổi tọa độ từ bề mặt địa lý sang mặt phẳng.',
  },
  'tuong-quan-am-but-thap': {
    subjectSlug: 'hinh-hoc-affine',
    subjectCode: 'HHAVE',
    connection:
      'Hệ 952 cánh tay phụ xếp lớp tỏa tròn tạo nên cấu trúc đối xứng quay và phân tầng đồng tâm chuẩn xác trong không gian.',
  },
  'copernicus-1543': {
    subjectSlug: 'giai-tich-ham-mot-bien',
    subjectCode: 'GTHMB',
    connection:
      'Mô hình chuyển động tuần hoàn quanh Mặt Trời mở đường cho khảo sát quỹ đạo bằng hàm số và đạo hàm theo thời gian.',
  },
  'kepler-1596': {
    subjectSlug: 'hinh-hoc-affine',
    subjectCode: 'HHAVE',
    connection:
      'Phép lồng ghép 5 khối đa diện Platon giữa các mặt cầu minh họa tư duy phân loại bất biến hình học trong không gian.',
  },
  'chua-mot-cot-1049': {
    subjectSlug: 'hinh-hoc-affine',
    subjectCode: 'HHAVE',
    connection:
      'Đài vuông đặt trên trụ tròn đối xứng trục phản ánh nguyên lý cân bằng trọng tâm và trực giao trong không gian Euclid.',
  },
  'van-mieu-mao-dien': {
    subjectSlug: 'giao-duc-hoc',
    subjectCode: 'GDH',
    connection:
      'Không gian văn miếu địa phương khẳng định vai trò cộng đồng và môi trường học thuật trong sự nghiệp trồng người.',
  },
  'den-tho-luong-the-vinh': {
    subjectSlug: 'giao-duc-hoc',
    subjectCode: 'GDH',
    connection:
      'Tác phẩm Đại Thành Toán Pháp của Trạng Lường là mẫu mực về diễn đạt khái niệm toán học dễ hiểu, gần gũi người học.',
  },
  'thap-but-dai-nghien-1865': {
    subjectSlug: 'hinh-hoc-affine',
    subjectCode: 'HHAVE',
    connection:
      'Bóng đỉnh Tháp Bút chiếu đúng lòng Đài Nghiên vào chính ngọ là bài toán thực tiễn về phép chiếu song song theo phương tia sáng.',
  },
  'ngo-mon-dien-thai-hoa': {
    subjectSlug: 'hinh-hoc-affine',
    subjectCode: 'HHAVE',
    connection:
      'Trục thần đạo đối xứng gương và quy hoạch thành lũy Vauban ứng dụng trực tiếp phép phản xạ và góc nhọn hình học.',
  },
  'cuu-dinh-hoang-cung-hue': {
    subjectSlug: 'cau-truc-dai-so',
    subjectCode: 'CTĐS',
    connection:
      'Cách phân loại 162 hình tượng trên 9 đỉnh thể hiện tư duy phân hoạch tập hợp thành các lớp tương đương chặt chẽ.',
  },
  'truong-quoc-hoc-hue-1896': {
    subjectSlug: 'giao-duc-hoc',
    subjectCode: 'GDH',
    connection:
      'Cái nôi đào tạo nhiều thế hệ nhà giáo và học giả, biểu trưng cho sự gắn kết giữa kỷ luật học đường và tự do tư duy.',
  },
  'hoang-thanh-thang-long': {
    subjectSlug: 'hinh-hoc-affine',
    subjectCode: 'HHAVE',
    connection:
      'Cấu trúc vòm cuốn chịu nén và lăng trụ bát giác thu tầng thể hiện mối liên hệ giữa thiết diện bậc hai và độ ổn định hình học.',
  },
  'thap-cham-my-son': {
    subjectSlug: 'giai-tich-ham-mot-bien',
    subjectCode: 'GTHMB',
    connection:
      'Cấu trúc thu nhỏ lặp lại theo từng tầng tháp gợi liên hệ tới dãy số hội tụ và hình học tự đồng dạng (fractal).',
  },
  'thap-pho-minh': {
    subjectSlug: 'cau-truc-dai-so',
    subjectCode: 'CTĐS',
    connection:
      'Tiết diện vuông và hoa văn sen 8 cánh lặp tuần hoàn qua 14 tầng minh họa nhóm đối xứng nhị diện D₄ và D₈.',
  },
  'rhind-mathematical-papyrus': {
    subjectSlug: 'giao-duc-hoc',
    subjectCode: 'GDH',
    connection:
      'Giáo trình bài tập mẫu cổ nhất lịch sử: trình bày lý thuyết đi kèm bài toán có lời giải từng bước để người học tự rèn luyện.',
  },
  'archimedes-palimpsest': {
    subjectSlug: 'giai-tich-ham-mot-bien',
    subjectCode: 'GTHMB',
    connection:
      'Phép chia lát cắt vô cùng bé kết hợp phương pháp vét kiệt là tiền thân trực tiếp của khái niệm tích phân xác định.',
  },
  'gac-chuong-chua-keo-1632': {
    subjectSlug: 'hinh-hoc-affine',
    subjectCode: 'HHAVE',
    connection:
      'Hệ đấu củng phân tán lực theo nhiều phương vectơ chứng minh sức mạnh của tổng vectơ cân bằng trong không gian 3 chiều.',
  },
  'la-geometrie-descartes': {
    subjectSlug: 'hinh-hoc-affine',
    subjectCode: 'HHAVE',
    connection:
      'Gắn hệ tọa độ vào mặt phẳng biến bài toán hình học thành phương trình đại số — nền móng của hình học Affine tọa độ.',
  },
  'principia-mathematica-newton': {
    subjectSlug: 'giai-tich-ham-mot-bien',
    subjectCode: 'GTHMB',
    connection:
      'Khái niệm tỉ số cực hạn (fluxions) đặt nền tảng trực tiếp cho đạo hàm, vi phân và giới hạn trong Giải tích hàm một biến.',
  },
  'disquisitiones-arithmeticae-gauss': {
    subjectSlug: 'cau-truc-dai-so',
    subjectCode: 'CTĐS',
    connection:
      'Khai sinh số học đồng dư Z/nZ và nhóm đơn vị U(n) — ví dụ nền tảng xuyên suốt các chương Nhóm và Vành trong CTĐS.',
  },
  'moc-ban-quoc-tu-giam-trieu-nguyen': {
    subjectSlug: 'hinh-hoc-affine',
    subjectCode: 'HHAVE',
    connection:
      'Nghệ thuật khắc chữ ngược trên ván gỗ là hiện thân của phép đối xứng gương (phép biến đổi phản xạ bậc 2, f² = id).',
  },
  'dai-hoc-dong-duong-1906': {
    subjectSlug: 'giao-duc-hoc',
    subjectCode: 'GDH',
    connection:
      'Dấu mốc hình thành mô hình đào tạo đại học nghiên cứu khoa học cơ bản và bồi dưỡng đội ngũ giảng viên Việt Nam.',
  },
  'chau-ban-trieu-nguyen': {
    subjectSlug: 'giao-duc-hoc',
    subjectCode: 'GDH',
    connection:
      'Hệ thống tư liệu gốc chuẩn hóa về quy chế thi cử, tuyển chọn và kiểm định chất lượng giáo dục trong lịch sử.',
  },
  'van-thanh-mieu-vinh-long': {
    subjectSlug: 'giao-duc-hoc',
    subjectCode: 'GDH',
    connection:
      'Tụy Văn Lâu khẳng định bản chất văn hóa của giáo dục: bảo tồn tri thức, nuôi dưỡng đạo lý và kết nối cộng đồng học thuật.',
  },
  'thanh-nha-ho-1397': {
    subjectSlug: 'hinh-hoc-affine',
    subjectCode: 'HHAVE',
    connection:
      'Cung vòm đá hình thang ghép khít không chất kết dính ứng dụng hình học đường cong chịu nén và quy hoạch vuông góc.',
  },
  'plimpton-322': {
    subjectSlug: 'cau-truc-dai-so',
    subjectCode: 'CTĐS',
    connection:
      'Bảng bộ ba số Pythagoras trên cơ số 60 phản ánh cấu trúc chia hết và tính chất số học trong vành số nguyên Z.',
  },
  'antikythera-mechanism': {
    subjectSlug: 'cau-truc-dai-so',
    subjectCode: 'CTĐS',
    connection:
      'Tỉ số số răng giữa các bánh răng đồng tâm mô phỏng chu kỳ thiên văn bằng lý thuyết ước chung, bội chung và phân số liên tục.',
  },
  'sidereus-nuncius-galileo': {
    subjectSlug: 'giai-tich-ham-mot-bien',
    subjectCode: 'GTHMB',
    connection:
      'Tính chiều cao núi Mặt Trăng từ chiều dài bóng đổ kết hợp quan sát định lượng với hàm lượng giác và xấp xỉ liên tục.',
  },
  'the-ambassadors-holbein': {
    subjectSlug: 'hinh-hoc-affine',
    subjectCode: 'HHAVE',
    connection:
      'Hình hộp sọ biến dạng chỉ rõ khi nhìn góc nghiêng là minh họa kinh điển cho phép biến đổi xạ ảnh (projective anamorphosis).',
  },
  'pantheon-rome-oculus': {
    subjectSlug: 'hinh-hoc-affine',
    subjectCode: 'HHAVE',
    connection:
      'Khối mái vòm nội tiếp đúng một hình cầu đường kính 43,3m là biểu tượng hoàn hảo của hình học mặt cầu trong không gian Euclid.',
  },
};

export function getHeritageMathConnection(artworkId: string): HeritageMathConnection {
  return (
    HERITAGE_MATH_CONNECTIONS[artworkId] ?? {
      subjectSlug: 'hinh-hoc-affine',
      subjectCode: 'HHAVE',
      connection:
        'Giao điểm giữa cảm quan không gian, quy luật cấu trúc và phương pháp tư duy toán học chuẩn xác.',
    }
  );
}
