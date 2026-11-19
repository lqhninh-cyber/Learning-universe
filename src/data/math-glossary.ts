import { normalizeSearchQuery } from '@/utils/vietnamese-text';
import rawGlossary from './math-glossary.json';

export type MathGlossarySubject =
  'cau-truc-dai-so' | 'hinh-hoc-affine' | 'giai-tich-ham-mot-bien' | 'giao-duc-hoc';

export interface MathGlossaryEntry {
  readonly id: string;
  readonly slug?: string;
  readonly term?: string;
  readonly subject: MathGlossarySubject;
  readonly courseId?: string;
  readonly courseName?: string;
  readonly patterns: readonly string[];
  readonly symbol: string;
  readonly formula?: string;
  readonly nameVi: string;
  readonly name?: string;
  readonly nameEn: string;
  readonly englishName?: string;
  readonly brief: string;
  readonly summary?: string;
  readonly intuition: string;
  readonly relatedLesson: string;
  readonly lessonUrl?: string;
}

export const GDH_GLOSSARY_ENTRIES: readonly MathGlossaryEntry[] = [
  {
    id: 'gdh-ban-chat-xa-hoi',
    slug: 'ban-chat-xa-hoi',
    term: 'Bản chất xã hội',
    subject: 'giao-duc-hoc',
    courseId: 'giao-duc-hoc',
    courseName: 'Giáo dục học',
    patterns: ['ban chat xa hoi', 'bản chất xã hội', 'social essence', 'xa hoi hoa'],
    symbol: '\\text{Social}',
    formula: '\\text{Edu} \\subset \\text{Society}',
    nameVi: 'Bản chất xã hội của giáo dục',
    name: 'Bản chất xã hội',
    nameEn: 'Social Nature of Education',
    englishName: 'Social Essence of Education',
    brief:
      'Bản chất cốt tử khẳng định giáo dục chỉ nảy sinh, tồn tại và phát triển trong đời sống xã hội loài người. Giáo dục phản ánh nhu cầu truyền thụ kinh nghiệm lịch sử - xã hội.',
    summary:
      'Giáo dục chỉ nảy sinh, tồn tại và phát triển trong xã hội loài người nhằm đáp ứng nhu cầu duy trì và phát triển phương thức sản xuất.',
    intuition:
      'Không có cá nhân nào trưởng thành người ngoài môi trường xã hội; giáo dục là phương thức tái sinh văn hóa và kinh nghiệm lịch sử của nhân loại.',
    relatedLesson: '/mon-hoc/giao-duc-hoc',
    lessonUrl: '/mon-hoc/giao-duc-hoc',
  },
  {
    id: 'gdh-chuc-nang-kinh-te-san-xuat',
    slug: 'chuc-nang-kinh-te-san-xuat',
    term: 'Chức năng kinh tế - sản xuất',
    subject: 'giao-duc-hoc',
    courseId: 'giao-duc-hoc',
    courseName: 'Giáo dục học',
    patterns: [
      'chuc nang kinh te san xuat',
      'kinh te san xuat',
      'chức năng kinh tế',
      'economic function',
    ],
    symbol: '\\text{Econ}',
    formula: '\\text{Education} \\to \\text{Human Capital}',
    nameVi: 'Chức năng kinh tế - sản xuất',
    name: 'Chức năng kinh tế - sản xuất',
    nameEn: 'Economic-Productive Function',
    englishName: 'Economic and Productive Function',
    brief:
      'Chức năng tái sản xuất sức lao động xã hội và nâng cao năng suất của người học. Giáo dục đào tạo nguồn nhân lực và biến tri thức thành lực lượng sản xuất trực tiếp.',
    summary:
      'Giáo dục cung ứng nguồn nhân lực chất lượng cao, thúc đẩy chuyển giao công nghệ và tăng năng suất lao động xã hội.',
    intuition:
      'Đầu tư cho giáo dục là đầu tư sinh lợi xã hội cao nhất; đào tạo người học năng lực giải quyết vấn đề thực tiễn của nền kinh tế.',
    relatedLesson: '/mon-hoc/giao-duc-hoc',
    lessonUrl: '/mon-hoc/giao-duc-hoc',
  },
  {
    id: 'gdh-chuan-nghe-nghiep-gvpt',
    slug: 'chuan-nghe-nghiep-gvpt',
    term: 'Chuẩn nghề nghiệp giáo viên',
    subject: 'giao-duc-hoc',
    courseId: 'giao-duc-hoc',
    courseName: 'Giáo dục học',
    patterns: [
      'chuan nghe nghiep',
      'chuẩn nghề nghiệp giáo viên',
      'thong tu 20',
      'professional standards',
    ],
    symbol: '\\text{TT20}',
    formula: '5\\,\\text{TC} \\times 15\\,\\text{TChi}',
    nameVi: 'Chuẩn nghề nghiệp giáo viên phổ thông',
    name: 'Chuẩn nghề nghiệp GVPT',
    nameEn: 'Teacher Professional Standards',
    englishName: 'Professional Standards for General Education Teachers',
    brief:
      'Hệ thống phẩm chất và năng lực nghề nghiệp mà giáo viên phổ thông cần đạt được theo Thông tư số 20/2018/TT-BGDĐT.',
    summary:
      'Gồm 5 tiêu chuẩn: Phẩm chất nhà giáo, Phát triển chuyên môn/nghiệp vụ, Xây dựng môi trường giáo dục, Phát triển mối quan hệ nhà trường - gia đình - xã hội, Sử dụng ngoại ngữ và công nghệ.',
    intuition:
      'Hệ quy chiếu giúp nhà giáo tự soi, tự rèn và hoạch định lộ trình phát triển năng lực sư phạm suốt đời.',
    relatedLesson: '/mon-hoc/giao-duc-hoc',
    lessonUrl: '/mon-hoc/giao-duc-hoc',
  },
  {
    id: 'gdh-xung-dot-su-pham',
    slug: 'xung-dot-su-pham',
    term: 'Xung đột sư phạm',
    subject: 'giao-duc-hoc',
    courseId: 'giao-duc-hoc',
    courseName: 'Giáo dục học',
    patterns: ['xung dot su pham', 'tinh huong su pham', 'an le su pham', 'pedagogical conflict'],
    symbol: '\\Delta_{\\text{SP}}',
    formula: '\\text{Issue} \\xrightarrow{\\text{5 steps}} \\text{Resolution}',
    nameVi: 'Xung đột sư phạm & Án lệ thực hành',
    name: 'Xung đột sư phạm',
    nameEn: 'Pedagogical Conflict',
    englishName: 'Pedagogical Conflict and Resolution',
    brief:
      'Mâu thuẫn hoặc tình huống căng thẳng nảy sinh trong giao tiếp sư phạm giữa thầy - trò hoặc giữa các học sinh trong tập thể.',
    summary:
      'Xử lý qua 5 bước chuẩn hóa: Kiềm chế cảm xúc, Thu thập thông tin khách quan, Phân tích động cơ, Đưa ra giải pháp mang tính giáo dục, Theo dõi và đánh giá tác động.',
    intuition:
      'Biến xung đột thành cơ hội vàng giáo dục phẩm chất và kỹ năng sống cho học sinh bằng tình thương và sự tôn trọng nhân cách.',
    relatedLesson:
      '/mon-hoc/giao-duc-hoc/ly-luan-hoat-dong-giao-duc-o-nha-truong-pho-thong/ki-nang-va-quy-trinh-xu-li-tinh-huong-giao-duc',
    lessonUrl:
      '/mon-hoc/giao-duc-hoc/ly-luan-hoat-dong-giao-duc-o-nha-truong-pho-thong/ki-nang-va-quy-trinh-xu-li-tinh-huong-giao-duc',
  },
  {
    id: 'gdh-hoat-dong-su-pham',
    slug: 'hoat-dong-su-pham',
    term: 'Hoạt động sư phạm',
    subject: 'giao-duc-hoc',
    courseId: 'giao-duc-hoc',
    courseName: 'Giáo dục học',
    patterns: ['hoat dong su pham', 'hoạt động sư phạm', 'pedagogical activity'],
    symbol: '\\text{HĐSP}',
    formula: '\\text{GV} \\leftrightarrow \\text{HS} \\text{ qua Tri thức}',
    nameVi: 'Hoạt động sư phạm',
    name: 'Hoạt động sư phạm',
    nameEn: 'Pedagogical Activity',
    englishName: 'Pedagogical Activity',
    brief:
      'Hoạt động nghề nghiệp đặc thù của người giáo viên nhằm tổ chức, dẫn dắt người học lĩnh hội nền văn hóa xã hội và hình thành, phát triển nhân cách toàn diện.',
    intuition:
      'Điểm cốt lõi của hoạt động sư phạm là tính chủ thể kép: người dạy tổ chức, người học tự giác kiến tạo tri thức và giá trị sống của chính mình.',
    relatedLesson:
      '/mon-hoc/giao-duc-hoc/hoat-dong-su-pham-va-nhan-cach-nguoi-giao-vien/hoat-dong-su-pham-cua-nguoi-giao-vien',
    lessonUrl:
      '/mon-hoc/giao-duc-hoc/hoat-dong-su-pham-va-nhan-cach-nguoi-giao-vien/hoat-dong-su-pham-cua-nguoi-giao-vien',
  },
  {
    id: 'gdh-nhan-cach-nguoi-giao-vien',
    slug: 'nhan-cach-nguoi-giao-vien',
    term: 'Nhân cách người giáo viên',
    subject: 'giao-duc-hoc',
    courseId: 'giao-duc-hoc',
    courseName: 'Giáo dục học',
    patterns: ['nhan cach nguoi giao vien', 'nhân cách người giáo viên', 'teacher personality'],
    symbol: '\\text{NCGV}',
    formula: '\\text{Phẩm chất} \\cup \\text{Năng lực sư phạm}',
    nameVi: 'Nhân cách người giáo viên',
    name: 'Nhân cách người giáo viên',
    nameEn: 'Teacher Personality',
    englishName: 'Teacher Personality',
    brief:
      'Tổng hòa thống nhất giữa hệ thống phẩm chất đạo đức nghề nghiệp (lý tưởng, lòng yêu nghề – mến trẻ, đạo đức mẫu mực) và hệ thống năng lực dạy học – giáo dục của nhà giáo.',
    intuition:
      'Trong giáo dục, chính nhân cách người thầy là công cụ tác động trực tiếp và sâu sắc nhất để hình thành nhân cách học sinh.',
    relatedLesson:
      '/mon-hoc/giao-duc-hoc/hoat-dong-su-pham-va-nhan-cach-nguoi-giao-vien/nhan-cach-va-chuan-nghe-nghiep-giao-vien-pho-thong',
    lessonUrl:
      '/mon-hoc/giao-duc-hoc/hoat-dong-su-pham-va-nhan-cach-nguoi-giao-vien/nhan-cach-va-chuan-nghe-nghiep-giao-vien-pho-thong',
  },
  {
    id: 'gdh-tam-giac-su-pham',
    slug: 'tam-giac-su-pham',
    term: 'Tam giác sư phạm',
    subject: 'giao-duc-hoc',
    courseId: 'giao-duc-hoc',
    courseName: 'Giáo dục học',
    patterns: ['tam giac su pham', 'tam giác sư phạm', 'pedagogical triangle'],
    symbol: '\\triangle_{\\text{SP}}',
    formula: '(\\text{Giáo viên},\\; \\text{Người học},\\; \\text{Tri thức})',
    nameVi: 'Tam giác sư phạm',
    name: 'Tam giác sư phạm',
    nameEn: 'Pedagogical Triangle',
    englishName: 'Pedagogical Triangle',
    brief:
      'Mô hình cấu trúc biểu diễn mối quan hệ tương tác ba cực giữa Giáo viên (người tổ chức), Người học (chủ thể nhận thức) và Tri thức (nội dung văn hóa – khoa học).',
    intuition:
      'Khi cả ba cạnh của tam giác cân bằng — thầy truyền cảm hứng, trò tích cực khám phá, tri thức có ý nghĩa — quá trình dạy học đạt hiệu quả cao nhất.',
    relatedLesson:
      '/mon-hoc/giao-duc-hoc/hoat-dong-su-pham-va-nhan-cach-nguoi-giao-vien/hoat-dong-su-pham-cua-nguoi-giao-vien',
    lessonUrl:
      '/mon-hoc/giao-duc-hoc/hoat-dong-su-pham-va-nhan-cach-nguoi-giao-vien/hoat-dong-su-pham-cua-nguoi-giao-vien',
  },
  {
    id: 'gdh-vung-phat-trien-gan-zpd',
    slug: 'vung-phat-trien-gan-zpd',
    term: 'Vùng phát triển gần (ZPD)',
    subject: 'giao-duc-hoc',
    courseId: 'giao-duc-hoc',
    courseName: 'Giáo dục học',
    patterns: ['vung phat trien gan', 'vùng phát triển gần', 'zpd', 'vygotsky'],
    symbol: '\\text{ZPD}',
    formula: 'ZPD = [\\text{Hiện tại},\\; \\text{Tiềm năng có hỗ trợ}]',
    nameVi: 'Vùng phát triển gần (ZPD)',
    name: 'Vùng phát triển gần',
    nameEn: 'Zone of Proximal Development',
    englishName: 'Zone of Proximal Development',
    brief:
      'Khoảng cách giữa trình độ phát triển hiện tại mà người học tự giải quyết được vấn đề và trình độ tiềm năng có thể đạt tới dưới sự hướng dẫn của giáo viên hoặc hợp tác cùng bạn bè (L. S. Vygotsky).',
    intuition:
      'Dạy học tốt phải đi trước sự phát triển một bước — đặt nhiệm vụ vừa sức nhưng đủ thách thức trong vùng ZPD kèm giàn giáo (scaffolding) phù hợp.',
    relatedLesson:
      '/mon-hoc/giao-duc-hoc/nhung-van-de-chung-cua-giao-duc-hoc/giao-duc-hoc-la-mot-khoa-hoc-ve-giao-duc-con-nguoi',
    lessonUrl:
      '/mon-hoc/giao-duc-hoc/nhung-van-de-chung-cua-giao-duc-hoc/giao-duc-hoc-la-mot-khoa-hoc-ve-giao-duc-con-nguoi',
  },
  {
    id: 'gdh-qua-trinh-giao-duc',
    slug: 'qua-trinh-giao-duc',
    term: 'Quá trình giáo dục',
    subject: 'giao-duc-hoc',
    courseId: 'giao-duc-hoc',
    courseName: 'Giáo dục học',
    patterns: ['qua trinh giao duc', 'quá trình giáo dục', 'educational process'],
    symbol: '\\text{QTGD}',
    formula: '\\text{Tác động GD} \\rightleftharpoons \\text{Tự giáo dục}',
    nameVi: 'Quá trình giáo dục',
    name: 'Quá trình giáo dục',
    nameEn: 'Educational Process',
    englishName: 'Educational Process',
    brief:
      'Quá trình tương tác có mục đích, có kế hoạch và có hệ thống giữa nhà giáo dục và người được giáo dục nhằm chuyển hóa các chuẩn mực xã hội thành niềm tin, thái độ và hành vi bền vững.',
    intuition:
      'Bản chất của quá trình giáo dục là quá trình tổ chức đời sống, hoạt động và giao lưu cho học sinh để các em tự trải nghiệm và trưởng thành.',
    relatedLesson:
      '/mon-hoc/giao-duc-hoc/ly-luan-hoat-dong-giao-duc-o-nha-truong-pho-thong/ban-chat-dac-diem-va-nguyen-tac-cua-hoat-dong-giao-duc',
    lessonUrl:
      '/mon-hoc/giao-duc-hoc/ly-luan-hoat-dong-giao-duc-o-nha-truong-pho-thong/ban-chat-dac-diem-va-nguyen-tac-cua-hoat-dong-giao-duc',
  },
  {
    id: 'gdh-tu-giao-duc',
    slug: 'tu-giao-duc',
    term: 'Tự giáo dục',
    subject: 'giao-duc-hoc',
    courseId: 'giao-duc-hoc',
    courseName: 'Giáo dục học',
    patterns: ['tu giao duc', 'tự giáo dục', 'self-education', 'tu ren luyen'],
    symbol: '\\text{TGD}',
    formula: '\\text{Tự nhận thức} \\to \\text{Tự rèn luyện}',
    nameVi: 'Tự giáo dục',
    name: 'Tự giáo dục',
    nameEn: 'Self-Education',
    englishName: 'Self-Education',
    brief:
      'Hoạt động tự giác, tích cực và có ý thức của mỗi cá nhân nhằm tự hoàn thiện phẩm chất, năng lực và điều chỉnh hành vi theo lý tưởng, mục tiêu phát triển bản thân.',
    intuition:
      'Giáo dục từ bên ngoài chỉ thực sự đạt đích khi khơi dậy được động lực tự giáo dục từ bên trong người học.',
    relatedLesson:
      '/mon-hoc/giao-duc-hoc/ly-luan-hoat-dong-giao-duc-o-nha-truong-pho-thong/ban-chat-dac-diem-va-nguyen-tac-cua-hoat-dong-giao-duc',
    lessonUrl:
      '/mon-hoc/giao-duc-hoc/ly-luan-hoat-dong-giao-duc-o-nha-truong-pho-thong/ban-chat-dac-diem-va-nguyen-tac-cua-hoat-dong-giao-duc',
  },
  {
    id: 'gdh-nguyen-tac-giao-duc',
    slug: 'nguyen-tac-giao-duc',
    term: 'Nguyên tắc giáo dục',
    subject: 'giao-duc-hoc',
    courseId: 'giao-duc-hoc',
    courseName: 'Giáo dục học',
    patterns: ['nguyen tac giao duc', 'nguyên tắc giáo dục', 'principles of education'],
    symbol: '\\text{NTGD}',
    formula: '\\text{Tôn trọng} \\land \\text{Yêu cầu hợp lý}',
    nameVi: 'Nguyên tắc giáo dục',
    name: 'Nguyên tắc giáo dục',
    nameEn: 'Principles of Education',
    englishName: 'Principles of Education',
    brief:
      'Hệ thống những luận điểm cơ bản có tính quy luật chỉ đạo toàn bộ nội dung, phương pháp và hình thức tổ chức hoạt động giáo dục (như đảm bảo tính mục đích, gắn giáo dục với đời sống, tôn trọng nhân cách kết hợp yêu cầu hợp lý).',
    intuition:
      'Là kim chỉ nam giữ cho mọi biện pháp sư phạm luôn nhân văn, nhất quán và đi đúng quỹ đạo phát triển phẩm chất học sinh.',
    relatedLesson:
      '/mon-hoc/giao-duc-hoc/ly-luan-hoat-dong-giao-duc-o-nha-truong-pho-thong/ban-chat-dac-diem-va-nguyen-tac-cua-hoat-dong-giao-duc',
    lessonUrl:
      '/mon-hoc/giao-duc-hoc/ly-luan-hoat-dong-giao-duc-o-nha-truong-pho-thong/ban-chat-dac-diem-va-nguyen-tac-cua-hoat-dong-giao-duc',
  },
  {
    id: 'gdh-tap-the-hoc-sinh',
    slug: 'tap-the-hoc-sinh',
    term: 'Tập thể học sinh',
    subject: 'giao-duc-hoc',
    courseId: 'giao-duc-hoc',
    courseName: 'Giáo dục học',
    patterns: ['tap the hoc sinh', 'tập thể học sinh', 'student collective', 'tu quan'],
    symbol: '\\text{TTHS}',
    formula: '\\text{Mục tiêu chung} + \\text{Tự quản} + \\text{Dư luận lành mạnh}',
    nameVi: 'Tập thể học sinh',
    name: 'Tập thể học sinh',
    nameEn: 'Student Collective',
    englishName: 'Student Collective',
    brief:
      'Một nhóm học sinh có tổ chức chặt chẽ, liên kết bởi mục tiêu học tập – rèn luyện chung có giá trị xã hội, có cơ quan tự quản và bầu không khí tâm lý tích cực.',
    intuition:
      'Tập thể lớp vững mạnh vừa là môi trường an toàn, vừa là chủ thể giáo dục hỗ trợ từng cá nhân phát huy sở trường.',
    relatedLesson:
      '/mon-hoc/giao-duc-hoc/cong-tac-giao-vien-chu-nhiem-lop/tim-hieu-hoc-sinh-lap-ke-hoach-va-xay-dung-tap-the-hoc-sinh',
    lessonUrl:
      '/mon-hoc/giao-duc-hoc/cong-tac-giao-vien-chu-nhiem-lop/tim-hieu-hoc-sinh-lap-ke-hoach-va-xay-dung-tap-the-hoc-sinh',
  },
  {
    id: 'gdh-cong-tac-chu-nhiem-lop',
    slug: 'cong-tac-chu-nhiem-lop',
    term: 'Công tác chủ nhiệm lớp',
    subject: 'giao-duc-hoc',
    courseId: 'giao-duc-hoc',
    courseName: 'Giáo dục học',
    patterns: ['cong tac chu nhiem lop', 'công tác chủ nhiệm lớp', 'homeroom management', 'gvcn'],
    symbol: '\\text{GVCN}',
    formula: '\\text{Nhà trường} \\leftrightarrow \\text{Gia đình} \\leftrightarrow \\text{Xã hội}',
    nameVi: 'Công tác chủ nhiệm lớp',
    name: 'Công tác chủ nhiệm lớp',
    nameEn: 'Homeroom Teacher Management',
    englishName: 'Homeroom Class Management',
    brief:
      'Hệ thống hoạt động quản lý, giáo dục toàn diện, tư vấn học sinh và kết nối ba môi trường nhà trường – gia đình – xã hội do giáo viên chủ nhiệm trực tiếp điều phối.',
    intuition:
      'Người giáo viên chủ nhiệm là cầu nối tin cậy và là kiến trúc sư xây dựng văn hóa lớp học hạnh phúc, tôn trọng lẫn nhau.',
    relatedLesson:
      '/mon-hoc/giao-duc-hoc/cong-tac-giao-vien-chu-nhiem-lop/chuc-nang-va-nhiem-vu-cua-nguoi-giao-vien-chu-nhiem-lop',
    lessonUrl:
      '/mon-hoc/giao-duc-hoc/cong-tac-giao-vien-chu-nhiem-lop/chuc-nang-va-nhiem-vu-cua-nguoi-giao-vien-chu-nhiem-lop',
  },
  {
    id: 'gdh-hoat-dong-trai-nghiem-huong-nghiep',
    slug: 'hoat-dong-trai-nghiem-huong-nghiep',
    term: 'Hoạt động trải nghiệm – hướng nghiệp',
    subject: 'giao-duc-hoc',
    courseId: 'giao-duc-hoc',
    courseName: 'Giáo dục học',
    patterns: [
      'hoat dong trai nghiem',
      'huong nghiep',
      'hoạt động trải nghiệm',
      'experiential learning',
    ],
    symbol: '\\text{HĐTN}',
    formula: '\\text{Trải nghiệm} \\to \\text{Chiêm nghiệm} \\to \\text{Vận dụng}',
    nameVi: 'Hoạt động trải nghiệm – hướng nghiệp',
    name: 'Hoạt động trải nghiệm – hướng nghiệp',
    nameEn: 'Experiential and Career Guidance Activities',
    englishName: 'Experiential and Career Guidance Activities',
    brief:
      'Hoạt động giáo dục bắt buộc trong Chương trình GDPT 2018 giúp học sinh trực tiếp tham gia thực tiễn qua 4 mạch nội dung (hướng vào bản thân, xã hội, tự nhiên và hướng nghiệp) để hình thành năng lực thích ứng.',
    intuition:
      'Học sinh trưởng thành qua hành động có phản tư: tự khám phá năng lực cá nhân, gắn bó cộng đồng và định vị nghề nghiệp tương lai.',
    relatedLesson:
      '/mon-hoc/giao-duc-hoc/to-chuc-hoat-dong-trai-nghiem-huong-nghiep/ban-chat-muc-tieu-va-noi-dung-hoat-dong-trai-nghiem-o-truong-pho-thong',
    lessonUrl:
      '/mon-hoc/giao-duc-hoc/to-chuc-hoat-dong-trai-nghiem-huong-nghiep/ban-chat-muc-tieu-va-noi-dung-hoat-dong-trai-nghiem-o-truong-pho-thong',
  },
];

export const CALCULUS_EXTRA_GLOSSARY_ENTRIES: readonly MathGlossaryEntry[] = [
  {
    id: 'gthmb-can-tren-dung-supremum',
    slug: 'can-tren-dung-supremum',
    term: 'Cận trên đúng (Supremum)',
    subject: 'giai-tich-ham-mot-bien',
    courseId: 'giai-tich-ham-mot-bien',
    courseName: 'Giải tích hàm một biến',
    patterns: ['sup', '\\sup', 'supremum', 'can tren dung', 'cận trên đúng'],
    symbol: '\\sup A',
    formula:
      's = \\sup A \\iff (\\forall x \\in A, x \\le s) \\land (\\forall \\varepsilon > 0, \\exists x \\in A : x > s - \\varepsilon)',
    nameVi: 'Cận trên đúng (Supremum)',
    name: 'Cận trên đúng',
    nameEn: 'Least Upper Bound (Supremum)',
    englishName: 'Supremum',
    brief:
      'Số thực $s = \\sup A$ là cận trên nhỏ nhất của tập hợp $A \\subset \\mathbb{R}$: mọi phần tử $x \\in A$ đều thỏa $x \\le s$ và với mọi $\\varepsilon > 0$ luôn tồn tại $x \\in A$ sao cho $x > s - \\varepsilon$.',
    intuition:
      'Tiên đề đầy đủ của $\\mathbb{R}$ khẳng định mọi tập khác rỗng bị chặn trên đều có $\\sup A \\in \\mathbb{R}$, ngay cả khi tập đó không có phần tử lớn nhất (như khoảng mở $(0, 1)$ có $\\sup = 1$).',
    relatedLesson:
      '/mon-hoc/giai-tich-ham-mot-bien/tap-hop-so-thuc/can-tren-can-duoi-supremum-infimum-va-tien-de-day-du',
    lessonUrl:
      '/mon-hoc/giai-tich-ham-mot-bien/tap-hop-so-thuc/can-tren-can-duoi-supremum-infimum-va-tien-de-day-du',
  },
  {
    id: 'gthmb-can-duoi-dung-infimum',
    slug: 'can-duoi-dung-infimum',
    term: 'Cận dưới đúng (Infimum)',
    subject: 'giai-tich-ham-mot-bien',
    courseId: 'giai-tich-ham-mot-bien',
    courseName: 'Giải tích hàm một biến',
    patterns: ['inf', '\\inf', 'infimum', 'can duoi dung', 'cận dưới đúng'],
    symbol: '\\inf A',
    formula:
      'm = \\inf A \\iff (\\forall x \\in A, x \\ge m) \\land (\\forall \\varepsilon > 0, \\exists x \\in A : x < m + \\varepsilon)',
    nameVi: 'Cận dưới đúng (Infimum)',
    name: 'Cận dưới đúng',
    nameEn: 'Greatest Lower Bound (Infimum)',
    englishName: 'Infimum',
    brief:
      'Số thực $m = \\inf A$ là cận dưới lớn nhất của tập hợp $A \\subset \\mathbb{R}$: mọi $x \\in A$ thỏa $x \\ge m$ và mọi số lớn hơn $m$ đều không còn là cận dưới của $A$.',
    intuition:
      'Là khái niệm đối ngẫu của $\\sup A$: $\\inf A = -\\sup(-A)$, đóng vai trò then chốt trong định nghĩa tổng Darboux dưới và tích phân Riemann.',
    relatedLesson:
      '/mon-hoc/giai-tich-ham-mot-bien/tap-hop-so-thuc/can-tren-can-duoi-supremum-infimum-va-tien-de-day-du',
    lessonUrl:
      '/mon-hoc/giai-tich-ham-mot-bien/tap-hop-so-thuc/can-tren-can-duoi-supremum-infimum-va-tien-de-day-du',
  },
  {
    id: 'gthmb-day-cauchy',
    slug: 'day-cauchy',
    term: 'Dãy Cauchy',
    subject: 'giai-tich-ham-mot-bien',
    courseId: 'giai-tich-ham-mot-bien',
    courseName: 'Giải tích hàm một biến',
    patterns: ['day cauchy', 'dãy cauchy', 'cauchy sequence', 'tieu chuan cauchy'],
    symbol: '|x_m - x_n| < \\varepsilon',
    formula:
      '\\forall \\varepsilon > 0,\\; \\exists N \\in \\mathbb{N} : \\forall m, n \\ge N,\\; |x_m - x_n| < \\varepsilon',
    nameVi: 'Dãy Cauchy',
    name: 'Dãy Cauchy',
    nameEn: 'Cauchy Sequence',
    englishName: 'Cauchy Sequence',
    brief:
      'Dãy số thực $(x_n)$ gọi là dãy Cauchy nếu với mọi $\\varepsilon > 0$, tồn tại $N \\in \\mathbb{N}$ sao cho $|x_m - x_n| < \\varepsilon$ với mọi $m, n \\ge N$.',
    intuition:
      'Trong $\\mathbb{R}$, một dãy số hội tụ khi và chỉ khi nó là dãy Cauchy — cho phép chứng minh sự hội tụ mà không cần biết trước giá trị giới hạn.',
    relatedLesson:
      '/mon-hoc/giai-tich-ham-mot-bien/gioi-han-cua-day-so/day-con-dinh-ly-bolzano-weierstrass-va-tieu-chuan-cauchy',
    lessonUrl:
      '/mon-hoc/giai-tich-ham-mot-bien/gioi-han-cua-day-so/day-con-dinh-ly-bolzano-weierstrass-va-tieu-chuan-cauchy',
  },
  {
    id: 'gthmb-gioi-han-ham-so',
    slug: 'gioi-han-ham-so',
    term: 'Giới hạn hàm số',
    subject: 'giai-tich-ham-mot-bien',
    courseId: 'giai-tich-ham-mot-bien',
    courseName: 'Giải tích hàm một biến',
    patterns: ['gioi han ham so', 'giới hạn hàm số', 'limit of a function', 'epsilon delta'],
    symbol: '\\lim_{x \\to x_0} f(x)',
    formula:
      '\\forall \\varepsilon > 0, \\exists \\delta > 0 : 0 < |x - x_0| < \\delta \\implies |f(x) - L| < \\varepsilon',
    nameVi: 'Giới hạn hàm số (Ngôn ngữ ε–δ)',
    name: 'Giới hạn hàm số',
    nameEn: 'Limit of a Function (ε–δ Definition)',
    englishName: 'Limit of a Function',
    brief:
      'Ta viết $\\lim_{x \\to x_0} f(x) = L$ nếu với mọi $\\varepsilon > 0$ tồn tại $\\delta > 0$ sao cho mọi $x$ thuộc tập xác định thỏa $0 < |x - x_0| < \\delta$ đều có $|f(x) - L| < \\varepsilon$.',
    intuition:
      'Giá trị giới hạn chỉ phụ thuộc vào hành vi của $f(x)$ trong lân cận thủng quanh $x_0$, không yêu cầu $f$ phải xác định tại chính điểm $x_0$.',
    relatedLesson:
      '/mon-hoc/giai-tich-ham-mot-bien/gioi-han-va-lien-tuc-cua-ham-so/gioi-han-cua-ham-so-va-gioi-han-mot-phia',
    lessonUrl:
      '/mon-hoc/giai-tich-ham-mot-bien/gioi-han-va-lien-tuc-cua-ham-so/gioi-han-cua-ham-so-va-gioi-han-mot-phia',
  },
  {
    id: 'gthmb-tinh-lien-tuc-deu',
    slug: 'tinh-lien-tuc-deu',
    term: 'Tính liên tục đều',
    subject: 'giai-tich-ham-mot-bien',
    courseId: 'giai-tich-ham-mot-bien',
    courseName: 'Giải tích hàm một biến',
    patterns: ['lien tuc deu', 'liên tục đều', 'uniform continuity', 'dinh ly cantor'],
    symbol: '\\delta(\\varepsilon)',
    formula:
      '\\forall \\varepsilon > 0, \\exists \\delta > 0, \\forall x, y \\in D : |x - y| < \\delta \\implies |f(x) - f(y)| < \\varepsilon',
    nameVi: 'Tính liên tục đều',
    name: 'Tính liên tục đều',
    nameEn: 'Uniform Continuity',
    englishName: 'Uniform Continuity',
    brief:
      'Hàm số $f$ liên tục đều trên miền $D$ nếu với mọi $\\varepsilon > 0$ tồn tại một hằng số $\\delta > 0$ chỉ phụ thuộc vào $\\varepsilon$ (không phụ thuộc vào vị trí $x, y \\in D$) sao cho $|x - y| < \\delta \\implies |f(x) - f(y)| < \\varepsilon$.',
    intuition:
      'Theo định lý Cantor, mọi hàm liên tục trên đoạn đóng bị chặn $[a, b]$ đều liên tục đều — đảm bảo khả năng xấp xỉ đồng đều và tính khả tích Riemann.',
    relatedLesson:
      '/mon-hoc/giai-tich-ham-mot-bien/gioi-han-va-lien-tuc-cua-ham-so/ham-so-lien-tuc-deu-va-dinh-ly-cantor',
    lessonUrl:
      '/mon-hoc/giai-tich-ham-mot-bien/gioi-han-va-lien-tuc-cua-ham-so/ham-so-lien-tuc-deu-va-dinh-ly-cantor',
  },
  {
    id: 'gthmb-dao-ham',
    slug: 'dao-ham',
    term: 'Đạo hàm',
    subject: 'giai-tich-ham-mot-bien',
    courseId: 'giai-tich-ham-mot-bien',
    courseName: 'Giải tích hàm một biến',
    patterns: ['dao ham', 'đạo hàm', 'derivative', 'he so goc tiep tuyen'],
    symbol: "f'(x_0)",
    formula: "f'(x_0) = \\lim_{h \\to 0} \\frac{f(x_0 + h) - f(x_0)}{h}",
    nameVi: 'Đạo hàm của hàm số',
    name: 'Đạo hàm',
    nameEn: 'Derivative',
    englishName: 'Derivative',
    brief:
      "Đạo hàm của $f$ tại điểm $x_0$ là giới hạn hữu hạn $f'(x_0) = \\lim_{x \\to x_0} \\dfrac{f(x) - f(x_0)}{x - x_0}$ đo tốc độ biến thiên tức thời của hàm số.",
    intuition:
      "Về mặt hình học, $f'(x_0)$ là hệ số góc tiếp tuyến của đồ thị tại $(x_0, f(x_0))$ — phép xấp xỉ tuyến tính tốt nhất của $f$ quanh $x_0$.",
    relatedLesson:
      '/mon-hoc/giai-tich-ham-mot-bien/phep-tinh-vi-phan/khai-niem-dao-ham-vi-phan-va-dao-ham-ham-nguoc',
    lessonUrl:
      '/mon-hoc/giai-tich-ham-mot-bien/phep-tinh-vi-phan/khai-niem-dao-ham-vi-phan-va-dao-ham-ham-nguoc',
  },
  {
    id: 'gthmb-dinh-ly-rolle',
    slug: 'dinh-ly-rolle',
    term: 'Định lý Rolle',
    subject: 'giai-tich-ham-mot-bien',
    courseId: 'giai-tich-ham-mot-bien',
    courseName: 'Giải tích hàm một biến',
    patterns: ['dinh ly rolle', 'định lý rolle', 'rolle theorem'],
    symbol: "f'(c) = 0",
    formula: "f(a) = f(b) \\implies \\exists c \\in (a, b) : f'(c) = 0",
    nameVi: 'Định lý Rolle',
    name: 'Định lý Rolle',
    nameEn: "Rolle's Theorem",
    englishName: "Rolle's Theorem",
    brief:
      "Nếu $f$ liên tục trên $[a, b]$, khả vi trên $(a, b)$ và $f(a) = f(b)$ thì tồn tại ít nhất một điểm $c \\in (a, b)$ sao cho $f'(c) = 0$.",
    intuition:
      'Một đường cong trơn đi lên rồi quay lại cùng độ cao nhất thiết phải có ít nhất một đỉnh hoặc đáy mà tại đó tiếp tuyến nằm ngang.',
    relatedLesson:
      '/mon-hoc/giai-tich-ham-mot-bien/phep-tinh-vi-phan/cac-dinh-ly-gia-tri-trung-binh',
    lessonUrl: '/mon-hoc/giai-tich-ham-mot-bien/phep-tinh-vi-phan/cac-dinh-ly-gia-tri-trung-binh',
  },
  {
    id: 'gthmb-cong-thuc-taylor',
    slug: 'cong-thuc-taylor',
    term: 'Công thức Taylor',
    subject: 'giai-tich-ham-mot-bien',
    courseId: 'giai-tich-ham-mot-bien',
    courseName: 'Giải tích hàm một biến',
    patterns: ['cong thuc taylor', 'công thức taylor', 'khai trien taylor', 'taylor formula'],
    symbol: 'P_n(x) + R_n(x)',
    formula: 'f(x) = \\sum_{k=0}^{n} \\frac{f^{(k)}(x_0)}{k!}(x - x_0)^k + R_n(x)',
    nameVi: 'Công thức khai triển Taylor',
    name: 'Công thức Taylor',
    nameEn: "Taylor's Formula",
    englishName: "Taylor's Theorem",
    brief:
      'Biểu diễn hàm khả vi cấp $n$ quanh điểm $x_0$ thành đa thức Taylor bậc $n$ cộng với phần dư $R_n(x)$ (dạng Peano hoặc dạng Lagrange): $f(x) = \\sum_{k=0}^{n} \\dfrac{f^{(k)}(x_0)}{k!}(x - x_0)^k + R_n(x)$.',
    intuition:
      'Cho phép xấp xỉ cục bộ những hàm siêu việt phức tạp ($e^x, \\sin x, \\ln(1+x)$) bằng đa thức với sai số được kiểm soát định lượng.',
    relatedLesson:
      '/mon-hoc/giai-tich-ham-mot-bien/phep-tinh-vi-phan/quy-tac-lhopital-va-khai-trien-taylor-maclaurin',
    lessonUrl:
      '/mon-hoc/giai-tich-ham-mot-bien/phep-tinh-vi-phan/quy-tac-lhopital-va-khai-trien-taylor-maclaurin',
  },
  {
    id: 'gthmb-tich-phan-riemann',
    slug: 'tich-phan-riemann',
    term: 'Tích phân Riemann',
    subject: 'giai-tich-ham-mot-bien',
    courseId: 'giai-tich-ham-mot-bien',
    courseName: 'Giải tích hàm một biến',
    patterns: ['tich phan riemann', 'tích phân riemann', 'riemann integral', '\\int'],
    symbol: '\\int_a^b f(x)\\,dx',
    formula: '\\int_a^b f(x)\\,dx = \\lim_{\\|P\\| \\to 0} \\sum_{i=1}^{n} f(\\xi_i)\\Delta x_i',
    nameVi: 'Tích phân xác định Riemann',
    name: 'Tích phân Riemann',
    nameEn: 'Riemann Integral',
    englishName: 'Riemann Integral',
    brief:
      'Giới hạn chung của các tổng tích phân Riemann $\\sum_{i=1}^{n} f(\\xi_i)\\Delta x_i$ khi đường kính phân hoạch $\\|P\\| \\to 0$, độc lập với cách chọn phân hoạch và điểm mẫu $\\xi_i$.',
    intuition:
      'Cộng dồn diện tích có dấu của vô số dải hình chữ nhật siêu mảnh dưới đồ thị $y = f(x)$, nối kết với phép lấy nguyên hàm qua Định lý Cơ bản của Giải tích.',
    relatedLesson:
      '/mon-hoc/giai-tich-ham-mot-bien/phep-tinh-tich-phan/tong-riemann-tinh-chat-co-ban-va-dinh-ly-co-ban-cua-giai-tich',
    lessonUrl:
      '/mon-hoc/giai-tich-ham-mot-bien/phep-tinh-tich-phan/tong-riemann-tinh-chat-co-ban-va-dinh-ly-co-ban-cua-giai-tich',
  },
  {
    id: 'gthmb-chuoi-so-hoi-tu',
    slug: 'chuoi-so-hoi-tu',
    term: 'Chuỗi số hội tụ',
    subject: 'giai-tich-ham-mot-bien',
    courseId: 'giai-tich-ham-mot-bien',
    courseName: 'Giải tích hàm một biến',
    patterns: ['chuoi so hoi tu', 'chuỗi số hội tụ', 'convergent series', '\\sum'],
    symbol: '\\sum_{n=1}^{\\infty} a_n',
    formula: 'S = \\lim_{N \\to \\infty} S_N = \\lim_{N \\to \\infty} \\sum_{n=1}^{N} a_n',
    nameVi: 'Chuỗi số hội tụ',
    name: 'Chuỗi số hội tụ',
    nameEn: 'Convergent Infinite Series',
    englishName: 'Convergent Series',
    brief:
      'Chuỗi số $\\sum_{n=1}^{\\infty} a_n$ hội tụ về tổng $S \\in \\mathbb{R}$ nếu dãy các tổng riêng phần $S_N = \\sum_{n=1}^{N} a_n$ hội tụ về $S$ khi $N \\to \\infty$.',
    intuition:
      'Điều kiện cần để chuỗi hội tụ là $\\lim_{n \\to \\infty} a_n = 0$, nhưng chưa đủ (như chuỗi điều hòa $\\sum \\frac{1}{n}$ phân kỳ).',
    relatedLesson:
      '/mon-hoc/giai-tich-ham-mot-bien/chuoi-so-chuoi-ham/khai-niem-chuoi-so-chuoi-so-duong-va-tieu-chuan-cauchy',
    lessonUrl:
      '/mon-hoc/giai-tich-ham-mot-bien/chuoi-so-chuoi-ham/khai-niem-chuoi-so-chuoi-so-duong-va-tieu-chuan-cauchy',
  },
];

export const MATH_GLOSSARY: readonly MathGlossaryEntry[] = [
  ...(rawGlossary as MathGlossaryEntry[]),
  ...CALCULUS_EXTRA_GLOSSARY_ENTRIES,
  ...GDH_GLOSSARY_ENTRIES,
];

const GLOSSARY_MAP = new Map<string, MathGlossaryEntry>(
  MATH_GLOSSARY.map((entry) => [entry.id, entry]),
);

export function getAllGlossaryEntries(): readonly MathGlossaryEntry[] {
  return MATH_GLOSSARY;
}

/**
 * Trích xuất mã môn học từ đường dẫn URL (pathname).
 */
export function detectCourseIdFromPath(pathname?: string): string | undefined {
  if (!pathname) return undefined;
  if (pathname.includes('giao-duc-hoc') || pathname.includes('gdh')) {
    return 'giao-duc-hoc';
  }
  if (pathname.includes('giai-tich-ham-mot-bien') || pathname.includes('gthmb')) {
    return 'giai-tich-ham-mot-bien';
  }
  if (pathname.includes('cau-truc-dai-so') || pathname.includes('ctds')) {
    return 'cau-truc-dai-so';
  }
  if (pathname.includes('hinh-hoc-affine') || pathname.includes('hha')) {
    return 'hinh-hoc-affine';
  }
  const match = pathname.match(/\/mon-hoc\/([^/]+)/);
  if (match) {
    return match[1];
  }
  return undefined;
}

/**
 * Lấy một mục thuật ngữ theo ID, hỗ trợ đối chiếu theo ngữ cảnh môn học hiện tại.
 */
export function getGlossaryEntryById(
  id: string,
  currentCourseId?: string,
): MathGlossaryEntry | undefined {
  if (id === 'ban-chat-xa-hoi') {
    return GLOSSARY_MAP.get('gdh-ban-chat-xa-hoi') || GLOSSARY_MAP.get('ban-chat-xa-hoi');
  }
  if (id === 'chuc-nang-kinh-te-san-xuat') {
    return (
      GLOSSARY_MAP.get('gdh-chuc-nang-kinh-te-san-xuat') ||
      GLOSSARY_MAP.get('chuc-nang-kinh-te-san-xuat')
    );
  }
  if (id === 'chuan-nghe-nghiep-gvpt') {
    return GLOSSARY_MAP.get('gdh-chuan-nghe-nghiep-gvpt');
  }
  if (id === 'xung-dot-su-pham') {
    return GLOSSARY_MAP.get('gdh-xung-dot-su-pham');
  }
  if (id === 'nhom-con-chuan-tac') {
    return GLOSSARY_MAP.get('ctds-nhom-con-chuan-tac') || GLOSSARY_MAP.get('nhom-con-chuan-tac');
  }
  if (id === 'dinh-ly-dang-cau-1' || id === 'dang-cau-1') {
    return GLOSSARY_MAP.get('ctds-dinh-ly-dang-cau-1');
  }
  if (id === 'tieu-chuan-eisenstein') {
    return GLOSSARY_MAP.get('ctds-tieu-chuan-eisenstein');
  }
  if (id === 'dinh-ly-euler') {
    return GLOSSARY_MAP.get('ctds-dinh-ly-euler');
  }
  if (id === 'dinh-ly-lagrange') {
    return currentCourseId === 'giai-tich-ham-mot-bien'
      ? GLOSSARY_MAP.get('gthmb-dinh-ly-lagrange')
      : GLOSSARY_MAP.get('ctds-dinh-ly-lagrange');
  }
  if (id === 'dinh-ly-fermat') {
    return currentCourseId === 'giai-tich-ham-mot-bien'
      ? GLOSSARY_MAP.get('gthmb-dinh-ly-fermat')
      : GLOSSARY_MAP.get('ctds-dinh-ly-fermat');
  }
  if (id === 'dinh-ly-cauchy') {
    return currentCourseId === 'giai-tich-ham-mot-bien'
      ? GLOSSARY_MAP.get('gthmb-dinh-ly-cauchy')
      : GLOSSARY_MAP.get('ctds-dinh-ly-cauchy');
  }
  return GLOSSARY_MAP.get(id);
}

/**
 * Tìm kiếm mục thuật ngữ khớp chính xác nhất với từ khóa/ký hiệu, ưu tiên môn học hiện tại (currentCourseId).
 */
export function findGlossaryEntry(
  termOrPatternOrId: string,
  currentCourseId?: string,
): MathGlossaryEntry | undefined {
  if (!termOrPatternOrId) return undefined;
  const clean = termOrPatternOrId.trim();
  const normalized = normalizeSearchQuery(clean);

  // 1. Khớp trực tiếp theo ID (có ưu tiên môn nếu là ID tương đương)
  const byId = getGlossaryEntryById(clean, currentCourseId);
  if (byId) return byId;

  // 2. Thu thập các ứng viên khớp theo term, slug, nameVi, name hoặc patterns
  const candidates: MathGlossaryEntry[] = [];
  for (const entry of MATH_GLOSSARY) {
    if (entry.id === clean || (entry.slug && entry.slug === clean)) {
      candidates.push(entry);
      continue;
    }
    if (entry.term && normalizeSearchQuery(entry.term) === normalized) {
      candidates.push(entry);
      continue;
    }
    if (
      normalizeSearchQuery(entry.nameVi) === normalized ||
      (entry.name && normalizeSearchQuery(entry.name) === normalized)
    ) {
      candidates.push(entry);
      continue;
    }
    if (
      entry.patterns.some(
        (p) => normalizeSearchQuery(p) === normalized || p.toLowerCase() === clean.toLowerCase(),
      )
    ) {
      candidates.push(entry);
      continue;
    }
  }

  // Khớp bán phần nếu chưa tìm thấy
  if (candidates.length === 0) {
    for (const entry of MATH_GLOSSARY) {
      if (
        entry.patterns.some(
          (p) =>
            normalizeSearchQuery(p).includes(normalized) ||
            normalized.includes(normalizeSearchQuery(p)),
        )
      ) {
        candidates.push(entry);
      }
    }
  }

  if (candidates.length === 0) return undefined;

  // Ưu tiên bản ghi khớp đúng môn học hiện tại
  if (currentCourseId) {
    const matchedCourse = candidates.find(
      (c) => c.subject === currentCourseId || c.courseId === currentCourseId,
    );
    if (matchedCourse) return matchedCourse;
  }

  return candidates[0];
}

export interface SearchGlossaryOptions {
  readonly subject?: MathGlossarySubject | 'all';
  readonly courseId?: string;
  readonly query?: string;
}

/**
 * Tìm kiếm thuật ngữ theo từ khóa tiếng Việt không dấu, ký hiệu TeX hoặc tên tiếng Anh.
 */
export function searchGlossary({
  subject = 'all',
  courseId,
  query = '',
}: SearchGlossaryOptions = {}): readonly MathGlossaryEntry[] {
  const targetSubject = courseId || subject;
  const normalizedQuery = normalizeSearchQuery(query);

  return MATH_GLOSSARY.filter((entry) => {
    if (
      targetSubject !== 'all' &&
      entry.subject !== targetSubject &&
      entry.courseId !== targetSubject
    ) {
      return false;
    }

    if (!normalizedQuery) {
      return true;
    }

    // Kiểm tra term và tên tiếng Việt
    if (entry.term && normalizeSearchQuery(entry.term).includes(normalizedQuery)) {
      return true;
    }

    const nameViNorm = normalizeSearchQuery(entry.nameVi);
    if (nameViNorm.includes(normalizedQuery)) {
      return true;
    }
    if (entry.name && normalizeSearchQuery(entry.name).includes(normalizedQuery)) {
      return true;
    }

    // Kiểm tra tên tiếng Anh
    const nameEnNorm = normalizeSearchQuery(entry.nameEn);
    if (nameEnNorm.includes(normalizedQuery)) {
      return true;
    }
    if (entry.englishName && normalizeSearchQuery(entry.englishName).includes(normalizedQuery)) {
      return true;
    }

    // Kiểm tra ký hiệu và patterns
    const symbolNorm = entry.symbol.toLowerCase();
    if (symbolNorm.includes(normalizedQuery.toLowerCase())) {
      return true;
    }
    if (entry.formula && entry.formula.toLowerCase().includes(normalizedQuery.toLowerCase())) {
      return true;
    }

    const matchPattern = entry.patterns.some((pattern) => {
      const pNorm = normalizeSearchQuery(pattern);
      return pNorm.includes(normalizedQuery) || pattern.toLowerCase().includes(normalizedQuery);
    });
    if (matchPattern) {
      return true;
    }

    // Kiểm tra trong định nghĩa và trực quan
    const briefNorm = normalizeSearchQuery(entry.brief);
    if (briefNorm.includes(normalizedQuery)) {
      return true;
    }
    if (entry.summary && normalizeSearchQuery(entry.summary).includes(normalizedQuery)) {
      return true;
    }

    const intuitionNorm = normalizeSearchQuery(entry.intuition);
    if (intuitionNorm.includes(normalizedQuery)) {
      return true;
    }

    return false;
  });
}
