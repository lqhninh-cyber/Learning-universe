import type { CompiledLessonModule } from '@/content-runtime/loader';
import {
  CaseStudyBox,
  ComparativeTable,
  LegalReferenceBox,
  NumberedProcessFlow,
  PedagogyMetadataBar,
  PersonalDevelopmentPlan,
  ScholarQuote,
  TeacherStandardsMatrix,
} from '@/features/pedagogy';
import { Sidenote } from '@/shared/components/Sidenote';
import {
  Award,
  BookOpen,
  Compass,
  FileText,
  HelpCircle,
  Layers,
  Scale,
  Sparkles,
  Target,
  UserCheck,
} from 'lucide-react';
import { createElement, useState, type FC } from 'react';
import type { PedagogicalCaseStudy } from './course';

// ============================================================================
// 1. COMPONENT BÀI 1.1: HOẠT ĐỘNG SƯ PHẠM CỦA NGƯỜI GIÁO VIÊN (TR. 1–7)
// ============================================================================

export const Lesson1_1View: FC = () => {
  const caseStudy1_1: PedagogicalCaseStudy = {
    id: 101,
    title:
      'Học sinh lớp 10 có học lực khá chống đối ngầm, không ghi bài và xúi giục bạn bè làm mất trật tự',
    context:
      'Trong giờ học Toán lớp 10, một học sinh có học lực khá nhưng thường xuyên chống đối ngầm, không ghi bài và xúi giục các bạn xung quanh làm mất trật tự khi giáo viên đang giảng giải.',
    question:
      'Vận dụng đặc điểm công cụ nhân cách của hoạt động sư phạm (Giáo trình HCMUE tr. 1–7) và quy trình 5 bước xử lý tình huống giáo dục theo Mục 3.3.6 Giáo trình HCMUE, anh/chị hãy đề xuất phương án xử lý tối ưu.',
    principlesApplied: [
      'Nguyên tắc tôn trọng nhân cách học sinh kết hợp với yêu cầu hợp lý',
      'Đặc điểm công cụ lao động sư phạm: CÔNG CỤ QUAN TRỌNG NHẤT LÀ NHÂN CÁCH NGƯỜI THẦY (dùng nhân cách tác động trực tiếp vào nhân cách)',
      'Luật Giáo dục 2019 & Điều lệ trường THCS, THPT (Thông tư 32/2020/TT-BGDĐT)',
    ],
    solutionSteps: [
      {
        step: 1,
        title: 'Bước 1 (Phân tích dữ kiện)',
        content:
          'Học sinh có năng lực (học lực khá) nhưng có nhu cầu khẳng định mình sai lệch; hành vi chống đối ngầm, không ghi bài và xúi giục bạn bè làm mất trật tự diễn ra giữa tập thể lớp khi giáo viên đang giảng bài.',
      },
      {
        step: 2,
        title: 'Bước 2 (Biểu đạt vấn đề)',
        content:
          'Mâu thuẫn giữa nhu cầu tự thể hiện của học sinh và kỷ luật trật tự lớp học; cần giữ thể diện cho học sinh trước tập thể và giữ vững uy tín sư phạm của giáo viên.',
      },
      {
        step: 3,
        title: 'Bước 3 (Giả thuyết & Chọn tối ưu)',
        content:
          'Tránh mắng mỏ, đuổi học sinh ra khỏi lớp (phương án sai lầm gây đối kháng). Chọn phương án tối ưu: Dừng lại nhắc nhở chung bằng ánh mắt/ngữ điệu điềm tĩnh, giao bài tập nâng cao thách thức tư duy tại chỗ cho học sinh đó, và gặp riêng sau giờ học để đàm thoại chân tình.',
      },
      {
        step: 4,
        title: 'Bước 4 (Chứng minh khoa học)',
        content:
          'Vận dụng nguyên tắc "Tôn trọng nhân cách kết hợp yêu cầu hợp lý" và đặc điểm công cụ nhân cách mẫu mực của người thầy: giao nhiệm vụ vừa sức – nâng cao giúp chuyển hóa năng lượng dư thừa và nhu cầu tự khẳng định của học sinh khá sang hoạt động nhận thức tích cực.',
      },
      {
        step: 5,
        title: 'Bước 5 (Kết luận sư phạm)',
        content:
          'Uy tín sư phạm không đến từ quyền lực áp đặt mà đến từ sự thấu hiểu tâm lý và nghệ thuật ứng xử khéo léo.',
      },
    ],
    pitfallsToAvoid: [
      'Nóng giận quát mắng, xúc phạm hoặc đuổi học sinh ra khỏi lớp ngay trong tiết học.',
      'Bỏ mặc hành vi chống đối ngầm khiến kỷ cương lớp học bị phá vỡ.',
    ],
    coreLesson:
      'Uy tín sư phạm không đến từ quyền lực áp đặt mà đến từ sự thấu hiểu tâm lý và nghệ thuật ứng xử khéo léo bằng chính nhân cách mẫu mực của người thầy.',
  };

  return createElement(
    'div',
    { className: 'space-y-8 text-[#29383D] leading-relaxed' },

    // 1. THANH METADATA & ĐỐI CHIẾU ĐẦU BÀI
    createElement(PedagogyMetadataBar, {
      courseCode: 'EDUC2802',
      lessonCode: 'EDUC2802-C1-L1',
      clos: ['CLO1', 'CLO2'],
      textbookPages: 'Giáo trình Giáo dục học HCMUE (Trang 1 – 7)',
      legalRefs: [
        'Luật Giáo dục 2019 (Điều 66, 69, 70, 72)',
        'Điều lệ trường Tiểu học 2020 (TT 28/2020)',
        'Điều lệ trường THCS, THPT 2020 (TT 32/2020)',
      ],
      sessionNote: 'Mục 1.1 · Trang 1 – 7',
    }),

    // PHẦN I: KHÁI NIỆM & NGUỒN GỐC SƯ PHẠM (DEFINITION CARD)
    createElement(
      'section',
      { id: '1-khai-niem-nguon-goc-su-pham', className: 'space-y-4' },
      createElement(
        'div',
        {
          className:
            'flex items-center gap-2 border-b border-[#CFDADB] pb-2 font-serif text-xl font-bold text-[#29383D]',
        },
        createElement(BookOpen, { className: 'h-5 w-5 text-[#3F6570]' }),
        createElement('h3', null, '1. Khái niệm & Nguồn gốc Sư phạm (Mục 1.1, Trang 1 – 2)'),
      ),
      createElement(
        'div',
        {
          className: 'rounded-2xl border border-[#CFDADB] bg-[#F7FAFA] p-6 shadow-2xs space-y-4',
        },
        createElement(
          'div',
          { className: 'flex flex-wrap items-center justify-between gap-2' },
          createElement(
            'span',
            {
              className:
                'inline-flex items-center rounded-md border border-[#718C7E]/30 bg-[#E8EFEB] px-2.5 py-0.5 font-mono text-xs font-semibold text-[#3F6570]',
            },
            'Định nghĩa & Chiết tự Hán - Việt',
          ),
          createElement(
            'span',
            { className: 'font-mono text-xs text-[#55676B]' },
            'Giáo trình HCMUE · Trang 1',
          ),
        ),
        createElement(
          'div',
          { className: 'grid gap-4 md:grid-cols-2' },
          createElement(
            'div',
            {
              className: 'rounded-xl border border-[#CFDADB] bg-[#EAF0F1]/70 p-4 space-y-2',
            },
            createElement(
              'h4',
              { className: 'font-serif text-base font-bold text-[#29383D]' },
              'Phân tích chiết tự "Sư phạm"',
            ),
            createElement(
              'p',
              { className: 'text-sm text-[#29383D] leading-relaxed' },
              'Theo Hán - Việt, ',
              createElement('strong', { className: 'text-[#3F6570]' }, '"Sư"'),
              ' là người thầy, ',
              createElement('strong', { className: 'text-[#3F6570]' }, '"Phạm"'),
              ' là khuôn thước, mẫu mực. Nghĩa thông thường chỉ người thầy mẫu mực làm gương sáng; nghĩa khoa học là khoa học giáo dục con người.',
            ),
          ),
          createElement(
            'div',
            {
              className: 'rounded-xl border border-[#CFDADB] bg-[#E8EFEB]/60 p-4 space-y-2',
            },
            createElement(
              'h4',
              { className: 'font-serif text-base font-bold text-[#29383D]' },
              'Định nghĩa khoa học về Hoạt động sư phạm',
            ),
            createElement(
              'p',
              { className: 'text-sm text-[#29383D] leading-relaxed' },
              createElement('strong', null, 'Hoạt động sư phạm'),
              ' là hoạt động được tổ chức có mục đích, có kế hoạch khoa học hướng vào việc hình thành và phát triển toàn diện nhân cách con người nhằm đào tạo nguồn nhân lực cho xã hội.',
            ),
          ),
        ),
      ),
    ),

    // PHẦN II: VAI TRÒ VÀ CHỨC NĂNG CỦA GIÁO VIÊN (NỘI DUNG & SIDENOTES)
    createElement(
      'section',
      { id: '2-vai-tro-va-chuc-nang-giao-vien', className: 'space-y-4' },
      createElement(
        'div',
        {
          className:
            'flex items-center gap-2 border-b border-[#CFDADB] pb-2 font-serif text-xl font-bold text-[#29383D]',
        },
        createElement(UserCheck, { className: 'h-5 w-5 text-[#3F6570]' }),
        createElement('h3', null, '2. Vai trò và Chức năng của Giáo viên (Trang 1 – 2)'),
      ),
      createElement(
        'p',
        null,
        'Trong tiến trình phát triển của nhân loại, người giáo viên là lực lượng trực tiếp giáo dục, đào tạo thế hệ trẻ; đóng vai trò là ',
        createElement('strong', { className: 'text-[#3F6570]' }, '"dấu nối"'),
        ' giữa nền văn hóa xã hội và việc tái sản xuất nền văn hóa đó ở thế hệ trẻ.',
        createElement(
          Sidenote,
          { type: 'history', number: 1 },
          'J. A. Cômenxki coi giáo viên là người "chuyển giao ngọn đuốc của nền văn minh", "sợi dây chuyền giữa các thế hệ".',
        ),
      ),
      createElement(
        'p',
        null,
        'Với sứ mệnh bồi đắp tâm hồn và trí tuệ, người giáo viên được tôn vinh là người ',
        createElement('strong', { className: 'text-[#3F6570]' }, '"kĩ sư thiết kế tâm hồn"'),
        ' người học. Người thầy không chỉ truyền đạt tri thức có sẵn mà còn khơi dậy khát vọng khám phá, đánh thức năng lực tự học và tự hoàn thiện nhân cách ở mỗi học sinh.',
        createElement(
          Sidenote,
          { type: 'history', number: 2 },
          'Nhà sư phạm Đức A. F. Đixtecvec khẳng định: "Người giáo viên bình thường mang chân lí đến cho trò, người giáo viên giỏi biết dạy cho trò đi tìm chân lí".',
        ),
      ),
      createElement(
        'p',
        null,
        'Trong giáo dục nhà trường, giáo viên giữ vai trò là ',
        createElement('strong', null, 'lực lượng chủ đạo'),
        ': thực hiện các tác động có mục đích, có chương trình, nội dung và phương pháp khoa học phù hợp với đặc điểm tâm sinh lý lứa tuổi. Trong kỷ nguyên số hiện đại, công nghệ dù tiên tiến đến đâu cũng không thể thay thế nhân cách người thầy.',
        createElement(
          Sidenote,
          { type: 'history', number: 3 },
          'Thi hào R. Tagore viết: "Giáo dục một người đàn ông được một người đàn ông, giáo dục một người đàn bà được cả một gia đình, giáo dục một người thầy được cả một xã hội".',
        ),
      ),
    ),

    // PHẦN III: BẢNG MA TRẬN ĐỐI CHIẾU NHIỆM VỤ & QUYỀN HẠN GIÁO VIÊN (3 CỘT)
    createElement(
      'section',
      { id: '3-nhiem-vu-va-quyen-han', className: 'space-y-4' },
      createElement(
        'div',
        {
          className:
            'flex items-center gap-2 border-b border-[#CFDADB] pb-2 font-serif text-xl font-bold text-[#29383D]',
        },
        createElement(Scale, { className: 'h-5 w-5 text-[#3F6570]' }),
        createElement(
          'h3',
          null,
          '3. Bảng Ma trận Đối chiếu Nhiệm vụ & Quyền hạn Giáo viên (Trang 2 – 4)',
        ),
      ),
      createElement(LegalReferenceBox, {
        lawTitle: 'Luật Giáo dục 2019 (Luật số 43/2019/QH14)',
        article: 'Điều 66, Điều 69 và Điều 70',
        quote:
          'Nhà giáo làm nhiệm vụ giảng dạy, giáo dục trong cơ sở giáo dục. Nhà giáo có nhiệm vụ giảng dạy, giáo dục theo mục tiêu, nguyên lý giáo dục, thực hiện đầy đủ và có chất lượng chương trình giáo dục; gương mẫu thực hiện nghĩa vụ công dân, điều lệ nhà trường, quy tắc ứng xử của nhà giáo; giữ gìn phẩm chất, uy tín, danh dự của nhà giáo; tôn trọng, đối xử công bằng với người học, bảo vệ các quyền, lợi ích chính đáng của người học.',
        source: 'Luật Giáo dục số 43/2019/QH14 (Giáo trình HCMUE tr. 2–3)',
        significance:
          'Cơ sở pháp lý nền tảng quy định nhiệm vụ, quyền hạn của giáo viên được cụ thể hóa trong Điều lệ trường tiểu học 2020 và Điều lệ trường THCS, THPT 2020.',
      }),

      createElement(ComparativeTable, {
        title:
          'Bảng Ma trận Đối chiếu Nhiệm vụ & Quyền hạn Giáo viên theo Điều lệ Trường học 2020 (Trang 3 – 4)',
        subtitle:
          'Đối sánh quy định pháp lý giữa Cấp Tiểu học (Thông tư 28/2020/TT-BGDĐT) và Cấp Trung học (Thông tư 32/2020/TT-BGDĐT).',
        badge: 'Ma trận Đối chiếu 3 Cột · Điều lệ 2020',
        columns: [
          { key: 'criteria', header: 'Tiêu chí so sánh', widthClass: 'w-1/4' },
          {
            key: 'primary',
            header: 'Cấp Tiểu học (Theo Điều lệ trường tiểu học 2020)',
          },
          {
            key: 'secondary',
            header: 'Cấp Trung học (Theo Điều lệ trường THCS, THPT 2020)',
          },
        ],
        rows: [
          {
            criteria: 'Nhiệm vụ cốt lõi',
            primary:
              'Tự chủ chuyên môn, chịu trách nhiệm kế hoạch giáo dục lớp phụ trách; đánh giá học sinh; tham gia lựa chọn SGK; phối hợp Đội TNTP Hồ Chí Minh, gia đình và cộng đồng.',
            secondary:
              'Tổ chức dạy học và giáo dục theo kế hoạch của tổ chuyên môn/nhà trường; quản lý học sinh trong các hoạt động giáo dục do nhà trường tổ chức; tham gia phổ cập GD THCS; phối hợp Đoàn/Đội.',
          },
          {
            criteria: 'Quyền hạn chuyên môn',
            primary:
              'Được tự chủ thực hiện nhiệm vụ chuyên môn với sự hỗ trợ của tổ chuyên môn và nhà trường trong việc lựa chọn, điều chỉnh nội dung, phương pháp dạy học và đánh giá học sinh.',
            secondary:
              'Được tự chủ chuyên môn; hợp đồng thỉnh giảng và nghiên cứu khoa học tại các trường, cơ sở giáo dục khác khi được sự đồng ý của Hiệu trưởng bằng văn bản.',
          },
          {
            criteria: 'Quyền tự chủ & bảo vệ',
            primary:
              'Được bảo vệ danh dự, nhân phẩm, thân thể; được hưởng lương, phụ cấp ưu đãi theo nghề, được đào tạo, bồi dưỡng nâng cao trình độ chính trị, chuyên môn, nghiệp vụ.',
            secondary:
              'Được tôn trọng, bảo vệ nhân phẩm, danh dự và thân thể; được nghỉ hè và các ngày nghỉ khác theo quy định của pháp luật; được hưởng lương, chế độ phụ cấp và chính sách ưu đãi.',
          },
        ],
        footerNote:
          'Đối chiếu Giáo trình Giáo dục học HCMUE (Trang 3 – 4): Thông tư 28/2020/TT-BGDĐT và Thông tư 32/2020/TT-BGDĐT.',
      }),
    ),

    // PHẦN IV: PHÂN TÍCH 5 ĐẶC ĐIỂM HOẠT ĐỘNG SƯ PHẠM (TRANG 4 – 7)
    createElement(
      'section',
      { id: '4-nam-dac-diem-hoat-dong-su-pham', className: 'space-y-4' },
      createElement(
        'div',
        {
          className:
            'flex items-center gap-2 border-b border-[#CFDADB] pb-2 font-serif text-xl font-bold text-[#29383D]',
        },
        createElement(Layers, { className: 'h-5 w-5 text-[#3F6570]' }),
        createElement(
          'h3',
          null,
          '4. Phân tích 5 Đặc điểm Hoạt động Sư phạm (Giáo trình HCMUE Trang 4 – 7)',
        ),
      ),
      createElement(
        'p',
        null,
        'Hoạt động sư phạm của người giáo viên mang tính đặc thù sâu sắc so với các loại hình lao động xã hội khác, được kết tinh qua ',
        createElement('strong', null, '5 đặc điểm cốt lõi'),
        ' về mục đích, đối tượng, công cụ, sản phẩm và môi trường điều kiện:',
        createElement(
          Sidenote,
          { type: 'caution', number: 4 },
          'V. A. Xu-khôm-lin-xki cảnh báo: "Người thầy giáo phải lao động từ năm này sang năm khác để thấy được đối tượng sáng tạo của mình... Không có thứ lao động nào mà những sai lầm lại dẫn đến hậu quả nặng nề như lao động của người giáo viên".',
        ),
      ),
      createElement(ScholarQuote, {
        quote: 'Nghề dạy học là nghề sáng tạo bậc nhất vì nó sáng tạo ra những con người sáng tạo.',
        author: 'Phạm Văn Đồng (1906 – 2000)',
        title: 'Cố Thủ tướng Chính phủ nước Cộng hòa Xã hội Chủ nghĩa Việt Nam',
        source: 'Giáo trình Giáo dục học HCMUE, Chương 1, Trang 4 – 5',
        historicalContext:
          'Khẳng định đặc điểm mục đích cao cả và tính sáng tạo đặc trưng của hoạt động sư phạm trong việc đào tạo con người.',
      }),
      createElement(NumberedProcessFlow, {
        title: '5 Đặc điểm Cốt lõi Cấu thành Hoạt động Sư phạm',
        subtitle:
          'Hệ thống 5 đặc điểm phản ánh bản chất khoa học và nghệ thuật của lao động sư phạm (Giáo trình HCMUE Trang 4 – 7).',
        badge: '5 Đặc điểm Hoạt động Sư phạm',
        columns: 1,
        steps: [
          {
            number: 1,
            title: '01. Mục đích của hoạt động sư phạm',
            description:
              'Hình thành và phát triển toàn diện nhân cách, sáng tạo ra con người, tái sản xuất sức lao động xã hội. Như Cố Thủ tướng Phạm Văn Đồng khẳng định: "Nghề dạy học là nghề sáng tạo bậc nhất vì nó sáng tạo ra những con người sáng tạo".',
            keyAction:
              'Định hướng mọi hoạt động dạy học và giáo dục vào việc bồi dưỡng phẩm chất đạo đức và năng lực sáng tạo của người học.',
            deliverable:
              'Nguồn nhân lực có nhân cách toàn diện, đáp ứng yêu cầu phát triển của xã hội.',
          },
          {
            number: 2,
            title: '02. Đối tượng của hoạt động sư phạm',
            description:
              'Con người (người học) - thế hệ trẻ đang phát triển nhân cách, có đời sống tâm lý phong phú, vừa là đối tượng chịu tác động sư phạm của nhà giáo dục, vừa là chủ thể tích cực, độc lập, có ý thức tự giáo dục.',
            keyAction:
              'Tôn trọng tính chủ thể, phát huy tính tích cực nhận thức và năng lực tự giáo dục của học sinh.',
            deliverable:
              'Sự chuyển hóa từ quá trình giáo dục của nhà trường thành quá trình tự giáo dục của người học.',
          },
          {
            number: 3,
            title: '03. Công cụ của hoạt động sư phạm',
            description:
              'Tri thức, kỹ năng, phương tiện dạy học, phương pháp sư phạm... và CÔNG CỤ QUAN TRỌNG NHẤT LÀ NHÂN CÁCH NGƯỜI THẦY (dùng nhân cách tác động trực tiếp vào nhân cách).',
            keyAction:
              'Không ngừng tu dưỡng đạo đức, tác phong mẫu mực và năng lực chuyên môn để giáo dục học sinh bằng chính tấm gương sống động của người thầy.',
            deliverable: 'Sức cảm hóa sâu sắc từ nhân cách người thầy sang nhân cách người học.',
          },
          {
            number: 4,
            title: '04. Sản phẩm của hoạt động sư phạm',
            description:
              'Nhân cách toàn diện của học sinh - dạng sản phẩm "phi vật chất", khó đo lường trực tiếp, đòi hỏi thời gian lâu dài và tuyệt đối không cho phép tạo ra "phế phẩm" (theo cảnh báo của V. A. Xu-khôm-lin-xki).',
            keyAction:
              'Thận trọng, kiên trì, nhân văn trong từng quyết định sư phạm; đánh giá vì sự tiến bộ lâu dài của học sinh.',
            deliverable: 'Nhân cách phát triển toàn diện về Đức – Trí – Thể – Mỹ của thế hệ trẻ.',
          },
          {
            number: 5,
            title: '05. Môi trường & Điều kiện của hoạt động sư phạm',
            description:
              'Môi trường sư phạm được chọn lựa, định hướng có mục đích bao gồm nhà trường, gia đình và cộng đồng xã hội; trong đó các tình huống sư phạm luôn biến đổi đa dạng, đòi hỏi tính linh hoạt và sáng tạo cao.',
            keyAction:
              'Xây dựng môi trường sư phạm an toàn, chuẩn mực và phối hợp chặt chẽ giữa Nhà trường – Gia đình – Xã hội.',
            deliverable: 'Không gian giáo dục thống nhất, lành mạnh và giàu tính nhân văn.',
          },
        ],
      }),
    ),

    // PHẦN V: KHUNG TÌNH HUỐNG THỰC HÀNH 5 BƯỚC (CASE STUDY BOX)
    createElement(
      'section',
      { id: '5-tinh-huong-thuc-hanh', className: 'space-y-4' },
      createElement(
        'div',
        {
          className:
            'flex items-center gap-2 border-b border-[#CFDADB] pb-2 font-serif text-xl font-bold text-[#29383D]',
        },
        createElement(HelpCircle, { className: 'h-5 w-5 text-[#3F6570]' }),
        createElement(
          'h3',
          null,
          '5. Khung Tình huống Thực hành 5 Bước (Theo chuẩn Mục 3.3.6 Giáo trình HCMUE)',
        ),
      ),
      createElement(CaseStudyBox, { caseStudy: caseStudy1_1, defaultOpenSolution: true }),
    ),
  );
};

// ============================================================================
// 2. COMPONENT BÀI 1.2: NHÂN CÁCH VÀ CHUẨN NGHỀ NGHIỆP GIÁO VIÊN (TR. 7–9)
// ============================================================================

export const Lesson1_2View: FC = () => {
  const caseStudy1_2: PedagogicalCaseStudy = {
    id: 102,
    title: 'Giáo viên đăng ảnh bài kiểm tra của học sinh lên mạng xã hội để châm biếm',
    context:
      'Sau đợt kiểm tra giữa kì, cô K. (giáo viên trẻ mới vào nghề) chụp ảnh phần bài làm có câu trả lời sai ngây ngô của một học sinh trong lớp rồi đăng lên trang mạng xã hội cá nhân ở chế độ công khai kèm lời bình châm biếm. Bài viết nhanh chóng bị học sinh trong trường chia sẻ. Em học sinh có bài kiểm tra bị bạn bè trêu chọc, xấu hổ đến mức khủng hoảng tâm lí và xin nghỉ học.',
    question:
      'Đối chiếu với yêu cầu về phẩm chất, 5 nhóm năng lực cốt lõi (Điều 67 Luật Giáo dục 2019) và Chuẩn nghề nghiệp giáo viên phổ thông (Thông tư 20/2018/TT-BGDĐT), anh/chị hãy phân tích và giải quyết tình huống theo quy trình 5 bước.',
    principlesApplied: [
      'Tiêu chuẩn 1 (Thông tư 20/2018): Đạo đức nhà giáo (TC 1) & Phong cách nhà giáo (TC 2)',
      'Tiêu chuẩn 3 (Thông tư 20/2018): Xây dựng văn hóa nhà trường (TC 8) & Xây dựng trường học an toàn, phòng chống bạo lực học đường (TC 10)',
      'Nguyên tắc tôn trọng nhân cách học sinh kết hợp với yêu cầu hợp lí',
    ],
    solutionSteps: [
      {
        step: 1,
        title: 'Bước 1 (Phân tích dữ kiện)',
        content:
          'Cô K. đã công khai bài làm của học sinh kèm lời bình châm biếm lên mạng xã hội, dẫn đến việc học sinh bị trêu chọc, tổn thương danh dự và khủng hoảng tâm lí muốn nghỉ học.',
      },
      {
        step: 2,
        title: 'Bước 2 (Biểu đạt vấn đề)',
        content:
          'Vi phạm nghiêm trọng Đạo đức nhà giáo (TC 1), Phong cách nhà giáo (TC 2) và Xây dựng trường học an toàn (TC 10) theo Thông tư 20/2018/TT-BGDĐT; cần khôi phục niềm tin, bảo vệ tâm lí học sinh và chấn chỉnh tác phong nghề nghiệp của giáo viên.',
      },
      {
        step: 3,
        title: 'Bước 3 (Giả thuyết & Chọn tối ưu)',
        content:
          'Loại bỏ phương án chỉ xóa bài âm thầm hoặc đổ lỗi cho mạng xã hội. Chọn phương án tối ưu: Gỡ bài ngay lập tức, trực tiếp gặp gỡ xin lỗi học sinh và phụ huynh, phối hợp với GVCN ổn định tâm lí tập thể lớp và hỗ trợ học tập riêng cho em.',
      },
      {
        step: 4,
        title: 'Bước 4 (Chứng minh khoa học)',
        content:
          'Theo Giáo trình HCMUE (tr. 7–9), tình yêu con người, yêu thương học sinh và tính kỷ luật, gương mẫu là phẩm chất cốt lõi của nhân cách người thầy; đánh giá học sinh (TC 6) và tư vấn hỗ trợ (TC 7) phải vì sự tiến bộ của người học.',
      },
      {
        step: 5,
        title: 'Bước 5 (Kết luận sư phạm)',
        content:
          'Phong cách và đạo đức nhà giáo phải được giữ gìn nhất quán cả trên bục giảng lẫn trên không gian số; tuyệt đối tôn trọng phẩm giá và quyền riêng tư của học sinh.',
      },
    ],
    pitfallsToAvoid: [
      'Thanh minh rằng "đăng cho vui, đã che tên học sinh" để trốn tránh trách nhiệm đạo đức nhà giáo.',
      'Đổ lỗi cho học sinh hoặc bạn bè bình luận tiêu cực trên mạng xã hội.',
    ],
    coreLesson:
      'Chuẩn nghề nghiệp theo Thông tư 20/2018/TT-BGDĐT đặt Tiêu chuẩn 1 (Phẩm chất nhà giáo) lên vị trí hàng đầu vì đạo đức và phong cách mẫu mực là nền tảng của mọi hoạt động sư phạm.',
  };

  return createElement(
    'div',
    { className: 'space-y-8 text-[#29383D] leading-relaxed' },

    // 1. THANH METADATA & ĐỐI CHIẾU ĐẦU BÀI
    createElement(PedagogyMetadataBar, {
      courseCode: 'EDUC2802',
      lessonCode: 'EDUC2802-C1-L2',
      clos: ['CLO2'],
      textbookPages: 'Giáo trình Giáo dục học HCMUE (Trang 7 – 9)',
      legalRefs: [
        'Luật Giáo dục 2019 (Điều 67)',
        'Thông tư 20/2018/TT-BGDĐT (5 Tiêu chuẩn · 15 Tiêu chí)',
      ],
      sessionNote: 'Mục 1.2.1 – 1.2.2 · Trang 7 – 9',
    }),

    // PHẦN I: CẤU TRÚC PHẨM CHẤT & 5 NHÓM NĂNG LỰC NGHỀ NGHIỆP CỐT LÕI (TRANG 7 – 8)
    createElement(
      'section',
      { id: '1-pham-chat-va-nang-luc', className: 'space-y-4' },
      createElement(
        'div',
        {
          className:
            'flex items-center gap-2 border-b border-[#CFDADB] pb-2 font-serif text-xl font-bold text-[#29383D]',
        },
        createElement(UserCheck, { className: 'h-5 w-5 text-[#3F6570]' }),
        createElement(
          'h3',
          null,
          '1. Cấu trúc Phẩm chất & 5 Nhóm Năng lực Nghề nghiệp Cốt lõi (Trang 7 – 8)',
        ),
      ),
      createElement(LegalReferenceBox, {
        lawTitle: 'Luật Giáo dục 2019 (Luật số 43/2019/QH14)',
        article: 'Điều 67. Tiêu chuẩn của nhà giáo',
        quote:
          'Nhà giáo phải có những tiêu chuẩn sau đây: 1. Có phẩm chất, tư tưởng, đạo đức tốt; 2. Đạt chuẩn trình độ được đào tạo theo quy định; 3. Đủ sức khỏe theo yêu cầu nghề nghiệp; 4. Lý lịch bản thân rõ ràng.',
        source: 'Luật số 43/2019/QH14 (Giáo trình HCMUE Trang 7)',
        significance:
          'Cơ sở pháp lý xác định cấu trúc nhân cách nghề nghiệp của người giáo viên phổ thông gồm hai mặt thống nhất: Phẩm chất nghề nghiệp và Năng lực nghề nghiệp.',
      }),

      // Khối Phẩm chất nghề nghiệp
      createElement(
        'div',
        {
          className: 'rounded-2xl border border-[#CFDADB] bg-[#F7FAFA] p-5 shadow-2xs space-y-3',
        },
        createElement(
          'div',
          { className: 'flex items-center justify-between gap-2' },
          createElement(
            'h4',
            { className: 'font-serif text-lg font-bold text-[#29383D]' },
            'Hệ thống Phẩm chất Nghề nghiệp của Người Giáo viên',
          ),
          createElement(
            'span',
            {
              className:
                'rounded-md border border-[#718C7E]/30 bg-[#E8EFEB] px-2.5 py-0.5 font-mono text-xs font-semibold text-[#3F6570]',
            },
            'Mục 1.2.1 · Trang 7',
          ),
        ),
        createElement(
          'div',
          { className: 'grid gap-3 md:grid-cols-3' },
          createElement(
            'div',
            { className: 'rounded-xl border border-[#CFDADB] bg-[#EAF0F1]/70 p-4' },
            createElement(
              'p',
              { className: 'font-serif text-sm font-bold text-[#3F6570]' },
              '1. Thế giới quan & Lập trường',
            ),
            createElement(
              'p',
              { className: 'mt-1 text-sm text-[#29383D]' },
              'Thế giới quan khoa học, lập trường tư tưởng chính trị vững vàng, kiên định với mục tiêu và lý tưởng giáo dục.',
            ),
          ),
          createElement(
            'div',
            { className: 'rounded-xl border border-[#CFDADB] bg-[#EAF0F1]/70 p-4' },
            createElement(
              'p',
              { className: 'font-serif text-sm font-bold text-[#3F6570]' },
              '2. Lòng yêu người, yêu nghề',
            ),
            createElement(
              'p',
              { className: 'mt-1 text-sm text-[#29383D]' },
              'Tình yêu con người, yêu nghề dạy học, yêu thương, tôn trọng và bao dung đối với học sinh.',
            ),
          ),
          createElement(
            'div',
            { className: 'rounded-xl border border-[#CFDADB] bg-[#EAF0F1]/70 p-4' },
            createElement(
              'p',
              { className: 'font-serif text-sm font-bold text-[#3F6570]' },
              '3. Tác phong & Trách nhiệm',
            ),
            createElement(
              'p',
              { className: 'mt-1 text-sm text-[#29383D]' },
              'Tính kỷ luật, gương mẫu, tận tâm, công bằng và tinh thần trách nhiệm cao trong hoạt động sư phạm.',
            ),
          ),
        ),
      ),

      createElement(NumberedProcessFlow, {
        title: '5 Nhóm Năng lực Nghề nghiệp Cốt lõi của Giáo viên Phổ thông',
        subtitle:
          'Cấu trúc 5 nhóm năng lực thực thi hoạt động sư phạm theo Giáo trình Giáo dục học HCMUE (Mục 1.2.1, Trang 7 – 8).',
        badge: '5 Nhóm Năng lực Cốt lõi',
        columns: 1,
        steps: [
          {
            number: 1,
            title: '01. Năng lực tìm hiểu và nắm vững đặc điểm học sinh',
            description:
              'Xác định nội dung, cách thức tìm hiểu; lập kế hoạch, thu thập và xử lý thông tin về đặc điểm tâm sinh lý, hoàn cảnh, nhu cầu của học sinh; vận dụng các biện pháp tác động sư phạm phù hợp với từng đối tượng.',
            keyAction:
              'Lập kế hoạch, thu thập thông tin và vận dụng biện pháp giáo dục cá biệt hóa phù hợp.',
          },
          {
            number: 2,
            title: '02. Năng lực tổ chức dạy học và giáo dục',
            description:
              'Thiết kế kế hoạch dạy học và giáo dục theo hướng phát triển phẩm chất, năng lực; tổ chức thực hiện hiệu quả các phương pháp, hình thức dạy học – giáo dục tích cực; kiểm tra, đánh giá vì sự tiến bộ của học sinh.',
            keyAction:
              'Thiết kế kế hoạch, tổ chức thực hiện và kiểm tra đánh giá phát triển phẩm chất, năng lực.',
          },
          {
            number: 3,
            title: '03. Năng lực nghiên cứu khoa học sư phạm ứng dụng',
            description:
              'Phát hiện vấn đề nảy sinh từ thực tiễn lớp học; lập đề cương nghiên cứu; tổ chức thực hiện nghiên cứu khoa học sư phạm ứng dụng; đánh giá, công bố và vận dụng kết quả nghiên cứu để cải tiến chất lượng giáo dục.',
            keyAction:
              'Phát hiện vấn đề, lập đề cương, tổ chức nghiên cứu, đánh giá và công bố kết quả.',
          },
          {
            number: 4,
            title: '04. Năng lực hoạt động xã hội',
            description:
              'Phối hợp chặt chẽ các lực lượng giáo dục (nhà trường, gia đình, xã hội); thực hiện công tác tham vấn, tư vấn và hỗ trợ tâm lý học đường; xử lý linh hoạt, chuẩn mực các tình huống sư phạm và xã hội.',
            keyAction:
              'Phối hợp lực lượng giáo dục, tham vấn tư vấn hỗ trợ học sinh và xử lý tình huống.',
          },
          {
            number: 5,
            title: '05. Năng lực tự học, tự bồi dưỡng, phát triển bản thân',
            description:
              'Chủ động thích ứng với những thay đổi của chương trình và xã hội; duy trì năng lực học tập suốt đời; ứng dụng hiệu quả công nghệ thông tin (CNTT) và sử dụng ngoại ngữ/tiếng dân tộc trong hoạt động nghề nghiệp.',
            keyAction:
              'Thích ứng thay đổi, học tập suốt đời, ứng dụng CNTT và ngoại ngữ trong chuyên môn.',
          },
        ],
      }),
    ),

    // PHẦN II: BẢNG MA TRẬN 5 TIÊU CHUẨN & 15 TIÊU CHÍ CHUẨN NGHỀ NGHIỆP (THÔNG TƯ 20/2018/TT-BGDĐT)
    createElement(
      'section',
      { id: '2-chuan-nghe-nghiep-tt20', className: 'space-y-4' },
      createElement(
        'div',
        {
          className:
            'flex items-center gap-2 border-b border-[#CFDADB] pb-2 font-serif text-xl font-bold text-[#29383D]',
        },
        createElement(Award, { className: 'h-5 w-5 text-[#3F6570]' }),
        createElement(
          'h3',
          null,
          '2. Bảng Ma trận 5 Tiêu chuẩn & 15 Tiêu chí Chuẩn nghề nghiệp (Thông tư 20/2018/TT-BGDĐT, Trang 8 – 9)',
        ),
      ),
      createElement(
        'p',
        null,
        'Chuẩn nghề nghiệp giáo viên cơ sở giáo dục phổ thông ban hành kèm theo ',
        createElement('strong', null, 'Thông tư 20/2018/TT-BGDĐT'),
        ' bao gồm ',
        createElement('strong', null, '5 Tiêu chuẩn và 15 Tiêu chí'),
        ' được đánh giá theo 3 mức độ tăng dần: ',
        createElement('strong', null, 'Đạt – Khá – Tốt'),
        '.',
        createElement(
          Sidenote,
          { type: 'pedagogy', number: 1 },
          'Mỗi tiêu chí trong 15 tiêu chí của Thông tư 20/2018/TT-BGDĐT đều là căn cứ pháp lý để giáo viên tự đánh giá hàng năm và xây dựng lộ trình phát triển nghề nghiệp liên tục.',
        ),
      ),

      createElement(ComparativeTable, {
        title:
          'Bảng Ma trận 5 Tiêu chuẩn & 15 Tiêu chí Chuẩn nghề nghiệp Giáo viên Phổ thông (Thông tư 20/2018/TT-BGDĐT)',
        subtitle: 'Đối chiếu chính xác theo Mục 1.2.2 Giáo trình Giáo dục học HCMUE (Trang 8 – 9).',
        badge: '5 Tiêu chuẩn · 15 Tiêu chí · TT 20/2018',
        columns: [
          { key: 'standard', header: 'Tiêu chuẩn (Thông tư 20/2018)', widthClass: 'w-1/4' },
          { key: 'count', header: 'Số lượng', widthClass: 'w-28' },
          { key: 'criteriaList', header: 'Hệ thống 15 Tiêu chí chi tiết' },
        ],
        rows: [
          {
            standard: 'Tiêu chuẩn 1: Phẩm chất nhà giáo',
            count: '02 tiêu chí (TC 1 – TC 2)',
            criteriaList: 'TC 1: Đạo đức nhà giáo; TC 2: Phong cách nhà giáo.',
          },
          {
            standard: 'Tiêu chuẩn 2: Phát triển chuyên môn, nghiệp vụ',
            count: '05 tiêu chí (TC 3 – TC 7)',
            criteriaList:
              'TC 3: Phát triển chuyên môn bản thân; TC 4: Xây dựng kế hoạch dạy học và giáo dục theo hướng phát triển phẩm chất, năng lực học sinh; TC 5: Sử dụng phương pháp dạy học và giáo dục theo hướng phát triển phẩm chất, năng lực học sinh; TC 6: Kiểm tra, đánh giá theo hướng phát triển phẩm chất, năng lực học sinh; TC 7: Tư vấn và hỗ trợ học sinh.',
          },
          {
            standard: 'Tiêu chuẩn 3: Xây dựng môi trường giáo dục',
            count: '03 tiêu chí (TC 8 – TC 10)',
            criteriaList:
              'TC 8: Xây dựng văn hóa nhà trường; TC 9: Thực hiện quyền dân chủ trong nhà trường; TC 10: Thực hiện và xây dựng trường học an toàn, phòng chống bạo lực học đường.',
          },
          {
            standard: 'Tiêu chuẩn 4: Phát triển mối quan hệ giữa nhà trường, gia đình và xã hội',
            count: '03 tiêu chí (TC 11 – TC 13)',
            criteriaList:
              'TC 11: Tạo dựng mối quan hệ hợp tác với cha mẹ hoặc người giám hộ của học sinh và các bên liên quan; TC 12: Phối hợp giữa nhà trường, gia đình, xã hội để thực hiện hoạt động dạy học cho học sinh; TC 13: Phối hợp giữa nhà trường, gia đình, xã hội để thực hiện giáo dục đạo đức, lối sống cho học sinh.',
          },
          {
            standard:
              'Tiêu chuẩn 5: Sử dụng ngoại ngữ hoặc tiếng dân tộc, ứng dụng CNTT, khai thác và sử dụng thiết bị công nghệ trong dạy học, giáo dục',
            count: '02 tiêu chí (TC 14 – TC 15)',
            criteriaList:
              'TC 14: Sử dụng ngoại ngữ hoặc tiếng dân tộc; TC 15: Ứng dụng công nghệ thông tin, khai thác và sử dụng thiết bị công nghệ trong dạy học, giáo dục.',
          },
        ],
        footerNote:
          'Nguồn đối chiếu: Thông tư số 20/2018/TT-BGDĐT ngày 22/8/2018 của Bộ GD&ĐT & Giáo trình Giáo dục học HCMUE (Trang 8 – 9).',
      }),

      createElement(
        'div',
        { className: 'pt-2' },
        createElement(TeacherStandardsMatrix, { defaultStandardId: 1 }),
      ),
    ),

    // PHẦN III: TÌNH HUỐNG THỰC HÀNH 5 BƯỚC CUỐI BÀI
    createElement(
      'section',
      { id: '3-tinh-huong-thuc-hanh', className: 'space-y-4' },
      createElement(
        'div',
        {
          className:
            'flex items-center gap-2 border-b border-[#CFDADB] pb-2 font-serif text-xl font-bold text-[#29383D]',
        },
        createElement(HelpCircle, { className: 'h-5 w-5 text-[#3F6570]' }),
        createElement(
          'h3',
          null,
          '3. Tình huống Thực hành 5 Bước: Vận dụng Chuẩn nghề nghiệp Thông tư 20/2018',
        ),
      ),
      createElement(CaseStudyBox, { caseStudy: caseStudy1_2, defaultOpenSolution: false }),
    ),
  );
};

// ============================================================================
// 3. COMPONENT BÀI 1.3: PHÁT TRIỂN NGHỀ NGHIỆP GIÁO VIÊN PHỔ THÔNG (TR. 9–12)
// ============================================================================

export const Lesson1_3View: FC = () => {
  const [openEssayId, setOpenEssayId] = useState<number | null>(1);

  const caseStudy1_3: PedagogicalCaseStudy = {
    id: 103,
    title: 'Giáo viên lâu năm ngại đổi mới phương pháp và từ chối sinh hoạt chuyên môn theo NCBH',
    context:
      'Tại tổ Toán của trường THPT X., khi tổ trưởng triển khai sinh hoạt chuyên môn theo hướng nghiên cứu bài học (Lesson Study) và ứng dụng phần mềm mô phỏng hình học động để dạy Chương trình GDPT 2018, thầy M. (giáo viên có 18 năm thâm niên) phản đối: "Tôi dạy bảng phấn truyền thống bao năm nay học sinh vẫn đậu đại học. Mấy cái cộng đồng học tập với công nghệ số chỉ mất thời gian, dành cho giáo viên trẻ mới ra trường thôi."',
    question:
      'Dưới góc độ lý luận về Phát triển nghề nghiệp giáo viên phổ thông theo OECD (2009), Bautista & Ortega-Ruiz (2015) trong Giáo trình HCMUE (Trang 9 – 12) và Thông tư 20/2018/TT-BGDĐT, anh/chị hãy phân tích và giải quyết tình huống theo quy trình 5 bước.',
    principlesApplied: [
      'Định nghĩa phát triển nghề nghiệp của OECD (2009) và tính tất yếu trong kỷ nguyên bùng nổ thông tin (Giáo trình tr. 9–10)',
      '5 định hướng hình thức phát triển nghề nghiệp: Sinh hoạt tổ chuyên môn (Bautista & Ortega-Ruiz 2015), Hợp tác mentoring, Ứng dụng CNTT & học liệu số',
      'Tiêu chí 3 & Tiêu chí 15 của Thông tư 20/2018/TT-BGDĐT',
    ],
    solutionSteps: [
      {
        step: 1,
        title: 'Bước 1 (Phân tích dữ kiện)',
        content:
          'Thầy M. có bề dày kinh nghiệm giải toán nhưng mang tâm lý bảo thủ, chưa nhận thức đúng tính tất yếu của việc phát triển nghề nghiệp liên tục và e ngại công nghệ số.',
      },
      {
        step: 2,
        title: 'Bước 2 (Biểu đạt vấn đề)',
        content:
          'Trong kỷ nguyên số, học sinh tiếp nhận tri thức đa kênh; nếu giáo viên ngừng tự đổi mới sẽ đánh mất vai trò chủ đạo. Cần kết nối kinh nghiệm sư phạm của thầy M. với năng lực công nghệ của giáo viên trẻ trong Cộng đồng học tập chuyên môn.',
      },
      {
        step: 3,
        title: 'Bước 3 (Giả thuyết & Chọn tối ưu)',
        content:
          'Tránh phê bình hành chính gây đối kháng. Chọn phương án tối ưu: Ghép cặp hợp tác hai chiều (mentoring đảo chiều) — mời thầy M. cố vấn chiều sâu bản chất toán học cho giáo viên trẻ, đồng thời giáo viên trẻ hỗ trợ thầy M. khai thác học liệu số và mô phỏng tương tác.',
      },
      {
        step: 4,
        title: 'Bước 4 (Chứng minh khoa học)',
        content:
          'Vận dụng quan điểm của OECD (2009) về phát triển nghề nghiệp suốt đời và mô hình Cộng đồng học tập chuyên môn (Bautista & Ortega-Ruiz 2015) thông qua Nghiên cứu bài học (Lesson Study).',
      },
      {
        step: 5,
        title: 'Bước 5 (Kết luận sư phạm)',
        content:
          'Phát triển nghề nghiệp là hành trình liên tục của mọi giáo viên nhằm thích ứng với biến đổi xã hội và nâng cao chất lượng giáo dục.',
      },
    ],
    pitfallsToAvoid: [
      'Phủ nhận sạch trơn kinh nghiệm quý báu của giáo viên lâu năm khi triển khai phương pháp mới.',
      'Biến sinh hoạt chuyên môn thành buổi thanh tra, bắt lỗi cá nhân thay vì cùng suy ngẫm về việc học của học sinh.',
    ],
    coreLesson:
      'Phát triển nghề nghiệp giáo viên (OECD 2009) đòi hỏi sự kết hợp hài hòa giữa tự bồi dưỡng, cộng đồng học tập chuyên môn (Lesson Study), hỗ trợ đồng nghiệp (mentoring) và làm chủ học liệu số.',
  };

  return createElement(
    'div',
    { className: 'space-y-8 text-[#29383D] leading-relaxed' },

    // 1. THANH METADATA & ĐỐI CHIẾU ĐẦU BÀI
    createElement(PedagogyMetadataBar, {
      courseCode: 'EDUC2802',
      lessonCode: 'EDUC2802-C1-L3',
      clos: ['CLO2'],
      textbookPages: 'Giáo trình Giáo dục học HCMUE (Trang 9 – 12)',
      legalRefs: [
        'Thông tư 20/2018/TT-BGDĐT (Tiêu chuẩn 2 & Tiêu chuẩn 5)',
        'OECD (2009) & Bautista, Ortega-Ruiz (2015)',
      ],
      sessionNote: 'Mục 1.2.3 · Trang 9 – 12',
    }),

    // PHẦN I: BẢN CHẤT PHÁT TRIỂN NGHỀ NGHIỆP & TÍNH TẤT YẾU (TRANG 9 – 10)
    createElement(
      'section',
      { id: '1-ban-chat-phat-trien-nghe-nghiep', className: 'space-y-4' },
      createElement(
        'div',
        {
          className:
            'flex items-center gap-2 border-b border-[#CFDADB] pb-2 font-serif text-xl font-bold text-[#29383D]',
        },
        createElement(Target, { className: 'h-5 w-5 text-[#3F6570]' }),
        createElement(
          'h3',
          null,
          '1. Bản chất Phát triển Nghề nghiệp & Tính tất yếu trong Kỷ nguyên Thông tin (Trang 9 – 10)',
        ),
      ),
      createElement(
        'div',
        {
          className: 'rounded-2xl border border-[#CFDADB] bg-[#F7FAFA] p-6 shadow-2xs space-y-4',
        },
        createElement(
          'div',
          { className: 'grid gap-4 md:grid-cols-2' },
          createElement(
            'div',
            { className: 'rounded-xl border border-[#CFDADB] bg-[#EAF0F1]/70 p-4 space-y-2' },
            createElement(
              'span',
              {
                className:
                  'inline-flex items-center rounded-md border border-[#718C7E]/30 bg-[#E8EFEB] px-2.5 py-0.5 font-mono text-xs font-semibold text-[#3F6570]',
              },
              'Định nghĩa khoa học (OECD 2009)',
            ),
            createElement(
              'p',
              { className: 'text-sm text-[#29383D] leading-relaxed' },
              createElement('strong', null, 'Phát triển nghề nghiệp giáo viên'),
              ' là quá trình tạo ra sự thay đổi trong phẩm chất, năng lực nghề nghiệp thông qua học tập, nghiên cứu và tích lũy kinh nghiệm nhằm thích ứng với những biến đổi xã hội và nâng cao chất lượng giáo dục (',
              createElement('strong', { className: 'text-[#3F6570]' }, 'OECD 2009'),
              ').',
            ),
          ),
          createElement(
            'div',
            { className: 'rounded-xl border border-[#CFDADB] bg-[#E8EFEB]/60 p-4 space-y-2' },
            createElement(
              'span',
              {
                className:
                  'inline-flex items-center rounded-md border border-[#718C7E]/30 bg-[#F7FAFA] px-2.5 py-0.5 font-mono text-xs font-semibold text-[#3F6570]',
              },
              'Tính tất yếu trong kỷ nguyên số',
            ),
            createElement(
              'p',
              { className: 'text-sm text-[#29383D] leading-relaxed' },
              'Trong thời đại công nghệ số và bùng nổ thông tin, học sinh có khả năng tiếp nhận tri thức đa kênh; nếu người thầy không phát triển liên tục sẽ đánh mất ',
              createElement('strong', null, 'vai trò chủ đạo'),
              ' trong hoạt động giáo dục.',
            ),
          ),
        ),
      ),
      createElement(
        'p',
        null,
        'Quá trình phát triển nghề nghiệp không chỉ diễn ra ở giai đoạn đào tạo tại trường sư phạm mà kéo dài xuyên suốt cuộc đời hành nghề của người giáo viên, gắn liền với việc tự đánh giá và phấn đấu nâng bậc theo Chuẩn nghề nghiệp (từ mức Đạt lên mức Khá và mức Tốt).',
        createElement(
          Sidenote,
          { type: 'history', number: 1 },
          'Theo Bautista & Ortega-Ruiz (2015), phát triển nghề nghiệp hiệu quả nhất khi đặt trong bối cảnh hợp tác của Cộng đồng học tập chuyên môn tại chính nhà trường phổ thông.',
        ),
      ),
    ),

    // PHẦN II: 5 ĐỊNH HƯỚNG HÌNH THỨC PHÁT TRIỂN NGHỀ NGHIỆP (LƯU ĐỒ 5 BƯỚC, TRANG 10 – 12)
    createElement(
      'section',
      { id: '2-nam-dinh-huong-hinh-thuc', className: 'space-y-4' },
      createElement(
        'div',
        {
          className:
            'flex items-center gap-2 border-b border-[#CFDADB] pb-2 font-serif text-xl font-bold text-[#29383D]',
        },
        createElement(Compass, { className: 'h-5 w-5 text-[#3F6570]' }),
        createElement(
          'h3',
          null,
          '2. 5 Định hướng Hình thức Phát triển Nghề nghiệp Giáo viên Phổ thông (Trang 10 – 12)',
        ),
      ),
      createElement(NumberedProcessFlow, {
        title: 'Lưu đồ 5 Định hướng Hình thức Phát triển Nghề nghiệp Thực chiến',
        subtitle:
          'Hệ thống 5 định hướng hình thức phát triển nghề nghiệp cho giáo viên phổ thông theo Giáo trình Giáo dục học HCMUE (Mục 1.2.3, Trang 10 – 12).',
        badge: '5 Định hướng Phát triển Nghề nghiệp',
        columns: 1,
        steps: [
          {
            number: 1,
            title: '01. Tự định hướng, tự bồi dưỡng',
            description:
              'Tự đánh giá năng lực bản thân theo Chuẩn nghề nghiệp giáo viên phổ thông, nhận diện chính xác các điểm nghẽn chuyên môn – nghiệp vụ và chủ động xây dựng kế hoạch tự học suốt đời.',
            keyAction:
              'Tự đánh giá năng lực theo chuẩn, nhận diện điểm nghẽn, xây dựng kế hoạch tự học suốt đời.',
            deliverable: 'Kế hoạch tự bồi dưỡng cá nhân và nhật ký phản tư nghề nghiệp hàng năm.',
          },
          {
            number: 2,
            title: '02. Sinh hoạt tổ, nhóm chuyên môn',
            description:
              'Xây dựng Cộng đồng học tập chuyên môn (Bautista & Ortega-Ruiz 2015), tổ chức sinh hoạt chuyên đề theo hướng "nghiên cứu bài học" (Lesson Study), cùng thiết kế bài dạy, dự giờ quan sát việc học của học sinh và rút kinh nghiệm.',
            keyAction:
              'Sinh hoạt Cộng đồng học tập chuyên môn (Bautista & Ortega-Ruiz 2015) và Nghiên cứu bài học (Lesson Study).',
            deliverable:
              'Bài học minh họa và văn hóa hợp tác chuyên môn lấy việc học của học sinh làm trung tâm.',
          },
          {
            number: 3,
            title: '03. Tham gia các chương trình tập huấn thường xuyên',
            description:
              'Tham gia đầy đủ các khóa bồi dưỡng thường xuyên theo quy định của ngành Giáo dục, tiếp cận trực tiếp các chuyên gia đầu ngành và mở rộng đối thoại chuyên môn liên trường, liên cụm.',
            keyAction:
              'Bồi dưỡng theo quy định ngành, tiếp cận chuyên gia đầu ngành và đối thoại chuyên môn liên trường.',
            deliverable:
              'Hoàn thành các mô đun bồi dưỡng thường xuyên và chuyển giao mô hình dạy học mới.',
          },
          {
            number: 4,
            title: '04. Hợp tác, chia sẻ và hỗ trợ đồng nghiệp',
            description:
              'Triển khai mô hình huấn luyện kèm cặp (mentoring) tại cơ sở giáo dục: giáo viên cốt cán, giàu kinh nghiệm đồng hành, tư vấn và hỗ trợ giáo viên mới vào nghề vượt qua bỡ ngỡ thực tiễn.',
            keyAction:
              'Thực hiện mô hình huấn luyện kèm cặp (mentoring), giáo viên giàu kinh nghiệm hỗ trợ giáo viên mới.',
            deliverable:
              'Mạng lưới đồng nghiệp hỗ trợ đồng đẳng và sự trưởng thành vững chắc của đội ngũ kế cận.',
          },
          {
            number: 5,
            title: '05. Ứng dụng công nghệ thông tin và học liệu số',
            description:
              'Khai thác hiệu quả kho học liệu số, giáo trình điện tử, phần mềm mô phỏng tương tác (như GeoGebra, Desmos trong dạy học Toán) và tổ chức trao đổi, bồi dưỡng chuyên môn qua các nền tảng trực tuyến.',
            keyAction:
              'Khai thác kho học liệu số, giáo trình điện tử, mô phỏng tương tác và trao đổi qua nền tảng trực tuyến.',
            deliverable:
              'Hệ sinh thái học liệu số bộ môn và năng lực sư phạm số hiện đại (Tiêu chí 15 – TT 20/2018).',
          },
        ],
      }),
    ),

    // PHẦN III: CÔNG CỤ LẬP KẾ HOẠCH RÈN LUYỆN NGHỀ NGHIỆP 4 NĂM ĐẠI HỌC
    createElement(
      'section',
      { id: '3-ke-hoach-ren-luyen-ca-nhan', className: 'space-y-4' },
      createElement(
        'div',
        {
          className:
            'flex items-center gap-2 border-b border-[#CFDADB] pb-2 font-serif text-xl font-bold text-[#29383D]',
        },
        createElement(FileText, { className: 'h-5 w-5 text-[#3F6570]' }),
        createElement(
          'h3',
          null,
          '3. Thực hành: Thiết kế Kế hoạch học tập và phát triển nghề nghiệp cá nhân (4 năm đại học)',
        ),
      ),
      createElement(
        'p',
        null,
        'Vận dụng 5 định hướng phát triển nghề nghiệp (Giáo trình HCMUE Trang 9 – 12) và 15 tiêu chí Thông tư 20/2018/TT-BGDĐT, sinh viên thực hành thiết kế bản kế hoạch rèn luyện nghề nghiệp trong 4 năm đại học dưới đây:',
      ),
      createElement(PersonalDevelopmentPlan),
    ),

    // PHẦN IV: CÂU HỎI TỰ LUẬN ÔN TẬP CHƯƠNG 1 & TÌNH HUỐNG 5 BƯỚC
    createElement(
      'section',
      { id: '4-on-tap-va-tinh-huong', className: 'space-y-5' },
      createElement(
        'div',
        {
          className:
            'flex items-center gap-2 border-b border-[#CFDADB] pb-2 font-serif text-xl font-bold text-[#29383D]',
        },
        createElement(Sparkles, { className: 'h-5 w-5 text-[#3F6570]' }),
        createElement(
          'h3',
          null,
          '4. Tình huống Thực hành 5 Bước & Đề cương Tự luận Trọng tâm Chương 1',
        ),
      ),
      createElement(CaseStudyBox, { caseStudy: caseStudy1_3, defaultOpenSolution: false }),

      createElement(
        'div',
        { className: 'space-y-3 pt-2' },
        [
          {
            id: 1,
            question:
              'Câu 1: Phân tích 5 đặc điểm của hoạt động sư phạm. Vì sao nói trong hoạt động sư phạm, CÔNG CỤ QUAN TRỌNG NHẤT LÀ NHÂN CÁCH NGƯỜI THẦY?',
            outline: [
              'Chiết tự thuật ngữ "Sư phạm" (Sư: người thầy; Phạm: khuôn thước, mẫu mực) và định nghĩa khoa học về hoạt động sư phạm (Giáo trình tr. 1–2).',
              'Phân tích hệ thống 5 đặc điểm: 01. Mục đích (trích dẫn Phạm Văn Đồng), 02. Đối tượng, 03. Công cụ, 04. Sản phẩm (trích dẫn V. A. Xu-khôm-lin-xki), 05. Môi trường & Điều kiện (Giáo trình tr. 4–7).',
              'Chứng minh nhân cách là công cụ quan trọng nhất: đối tượng của hoạt động sư phạm là nhân cách đang hình thành của học sinh, do đó người thầy phải dùng chính nhân cách mẫu mực của mình để tác động trực tiếp vào nhân cách người học.',
              'Rút ra kết luận sư phạm đối với quá trình rèn luyện đạo đức và năng lực của sinh viên sư phạm.',
            ],
          },
          {
            id: 2,
            question:
              'Câu 2: Trình bày cấu trúc 5 Tiêu chuẩn – 15 Tiêu chí của Chuẩn nghề nghiệp giáo viên phổ thông (Thông tư 20/2018/TT-BGDĐT) và 5 định hướng hình thức phát triển nghề nghiệp.',
            outline: [
              'Yêu cầu về phẩm chất và 5 nhóm năng lực cốt lõi theo Điều 67 Luật Giáo dục 2019 (Giáo trình tr. 7–8).',
              'Hệ thống 5 Tiêu chuẩn và 15 Tiêu chí theo Thông tư 20/2018/TT-BGDĐT (TC 1–2: Phẩm chất; TC 3–7: Chuyên môn nghiệp vụ; TC 8–10: Môi trường GD; TC 11–13: Quan hệ nhà trường, gia đình, xã hội; TC 14–15: Ngoại ngữ & CNTT).',
              'Bản chất phát triển nghề nghiệp theo OECD (2009) và 5 định hướng hình thức phát triển nghề nghiệp (Tự định hướng tự bồi dưỡng; Sinh hoạt tổ chuyên môn – Bautista & Ortega-Ruiz 2015 / Lesson Study; Tập huấn thường xuyên; Hợp tác mentoring; Ứng dụng CNTT & học liệu số – Giáo trình tr. 9–12).',
              'Liên hệ kế hoạch rèn luyện bản thân của sinh viên ngành Sư phạm Toán học.',
            ],
          },
        ].map((item) =>
          createElement(
            'div',
            {
              key: item.id,
              className:
                'overflow-hidden rounded-2xl border border-[#CFDADB] bg-[#F7FAFA] shadow-2xs',
            },
            createElement(
              'button',
              {
                type: 'button',
                onClick: () => setOpenEssayId(openEssayId === item.id ? null : item.id),
                className:
                  'flex w-full items-center justify-between p-4 text-left font-serif text-sm font-bold text-[#29383D] transition-colors hover:bg-[#E1E9EA]/50 sm:text-base',
              },
              createElement('span', null, item.question),
              createElement(
                'span',
                { className: 'ml-3 shrink-0 font-mono text-xs text-[#3F6570]' },
                openEssayId === item.id ? 'Thu gọn' : 'Xem dàn ý',
              ),
            ),
            openEssayId === item.id &&
              createElement(
                'div',
                {
                  className:
                    'border-t border-[#CFDADB] bg-[#EAF0F1]/50 p-4 text-xs leading-relaxed text-[#29383D] sm:text-sm',
                },
                createElement(
                  'p',
                  { className: 'mb-2 font-semibold text-[#3F6570]' },
                  'Dàn ý trọng tâm theo Giáo trình Giáo dục học HCMUE:',
                ),
                createElement(
                  'ul',
                  { className: 'list-disc space-y-1.5 pl-5 text-[#55676B]' },
                  item.outline.map((point, idx) => createElement('li', { key: idx }, point)),
                ),
              ),
          ),
        ),
      ),
    ),
  );
};

// Giữ export alias Lesson1_4View trỏ về Lesson1_3View để tương thích ngược tuyệt đối
export const Lesson1_4View: FC = Lesson1_3View;

// ============================================================================
// 4. BỘ ĐIỀU PHỐI (MODULE DISPATCHER) CHO CHƯƠNG 1 (EDUC2802)
// ============================================================================

export function getChapter1LessonModule(lessonId: string): CompiledLessonModule | null {
  if (lessonId === 'gdh-c1-b1-hoat-dong-su-pham-cua-nguoi-giao-vien') {
    return {
      default: Lesson1_1View,
      frontmatter: {
        title: 'Bài 1.1: Hoạt động sư phạm của người giáo viên',
        description:
          'Khảo sát nguồn gốc thuật ngữ Hán - Việt, vai trò then chốt của người giáo viên trong xã hội hiện đại, đối chiếu ma trận nhiệm vụ - quyền hạn theo Luật Giáo dục 2019 và Điều lệ trường học 2020, cùng 5 đặc điểm cốt lõi cấu thành hoạt động sư phạm.',
        level: 'basic',
        tags: [
          'EDUC2802-C1-L1',
          'CLO1',
          'CLO2',
          'Hoạt động sư phạm',
          '5 Đặc điểm HĐSP',
          'Giáo trình tr. 1-7',
        ],
      },
      lessonMeta: {
        chapterNumber: 1,
        lessonNumber: 1,
        headings: [
          {
            id: '1-khai-niem-nguon-goc-su-pham',
            text: '1. Khái niệm & Nguồn gốc Sư phạm (Trang 1 – 2)',
            depth: 2,
          },
          {
            id: '2-vai-tro-va-chuc-nang-giao-vien',
            text: '2. Vai trò và Chức năng của Giáo viên (Trang 1 – 2)',
            depth: 2,
          },
          {
            id: '3-nhiem-vu-va-quyen-han',
            text: '3. Bảng Ma trận Đối chiếu Nhiệm vụ & Quyền hạn Giáo viên (Trang 2 – 4)',
            depth: 2,
          },
          {
            id: '4-nam-dac-diem-hoat-dong-su-pham',
            text: '4. Phân tích 5 Đặc điểm Hoạt động Sư phạm (Trang 4 – 7)',
            depth: 2,
          },
          {
            id: '5-tinh-huong-thuc-hanh',
            text: '5. Khung Tình huống Thực hành 5 Bước (Mục 3.3.6)',
            depth: 2,
          },
        ],
        blocks: [],
      },
    };
  }

  if (lessonId === 'gdh-c1-b2-nhan-cach-va-chuan-nghe-nghiep-giao-vien-pho-thong') {
    return {
      default: Lesson1_2View,
      frontmatter: {
        title: 'Bài 1.2: Nhân cách và Chuẩn nghề nghiệp giáo viên phổ thông',
        description:
          'Phân tích các yêu cầu nền tảng về phẩm chất và 5 nhóm năng lực cốt lõi theo Điều 67 Luật Giáo dục 2019, giải mã chi tiết hệ thống 5 Tiêu chuẩn và 15 Tiêu chí Chuẩn nghề nghiệp giáo viên phổ thông theo Thông tư 20/2018/TT-BGDĐT.',
        level: 'basic',
        tags: [
          'EDUC2802-C1-L2',
          'CLO2',
          'Nhân cách giáo viên',
          'Thông tư 20/2018',
          'Giáo trình tr. 7-9',
        ],
      },
      lessonMeta: {
        chapterNumber: 1,
        lessonNumber: 2,
        headings: [
          {
            id: '1-pham-chat-va-nang-luc',
            text: '1. Cấu trúc Phẩm chất & 5 Nhóm Năng lực Nghề nghiệp Cốt lõi (Trang 7 – 8)',
            depth: 2,
          },
          {
            id: '2-chuan-nghe-nghiep-tt20',
            text: '2. Bảng Ma trận 5 Tiêu chuẩn & 15 Tiêu chí Chuẩn nghề nghiệp (Trang 8 – 9)',
            depth: 2,
          },
          {
            id: '3-tinh-huong-thuc-hanh',
            text: '3. Tình huống Thực hành 5 Bước: Vận dụng Chuẩn nghề nghiệp TT 20/2018',
            depth: 2,
          },
        ],
        blocks: [],
      },
    };
  }

  if (
    lessonId === 'gdh-c1-b3-phat-trien-nghe-nghiep-giao-vien-pho-thong' ||
    lessonId === 'gdh-c1-b3-ren-luyen-de-tro-thanh-nguoi-giao-vien-hieu-qua' ||
    lessonId === 'gdh-c1-b4-tinh-huong-su-pham-va-de-cuong-on-tap-chuong-1'
  ) {
    return {
      default: Lesson1_3View,
      frontmatter: {
        title: 'Bài 1.3: Phát triển nghề nghiệp giáo viên phổ thông',
        description:
          'Bản chất của phát triển nghề nghiệp theo định nghĩa của OECD, các yêu cầu tất yếu trong kỷ nguyên bùng nổ thông tin và 5 định hướng hình thức phát triển nghề nghiệp thực chiến cho giáo viên phổ thông.',
        level: 'intermediate',
        tags: [
          'EDUC2802-C1-L3',
          'CLO2',
          'Phát triển nghề nghiệp',
          'OECD 2009',
          'Giáo trình tr. 9-12',
        ],
      },
      lessonMeta: {
        chapterNumber: 1,
        lessonNumber: 3,
        headings: [
          {
            id: '1-ban-chat-phat-trien-nghe-nghiep',
            text: '1. Bản chất Phát triển Nghề nghiệp & Tính tất yếu (Trang 9 – 10)',
            depth: 2,
          },
          {
            id: '2-nam-dinh-huong-hinh-thuc',
            text: '2. 5 Định hướng Hình thức Phát triển Nghề nghiệp (Trang 10 – 12)',
            depth: 2,
          },
          {
            id: '3-ke-hoach-ren-luyen-ca-nhan',
            text: '3. Thực hành: Thiết kế Kế hoạch phát triển nghề nghiệp cá nhân',
            depth: 2,
          },
          {
            id: '4-on-tap-va-tinh-huong',
            text: '4. Tình huống Thực hành 5 Bước & Đề cương Tự luận Chương 1',
            depth: 2,
          },
        ],
        blocks: [],
      },
    };
  }

  return null;
}
