import type { CompiledLessonModule } from '@/content-runtime/loader';
import {
  CaseStudyBox,
  LegalQuoteCard,
  PersonalDevelopmentPlan,
  ScholarQuote,
  TeacherStandardsMatrix,
} from '@/features/pedagogy';
import { Badge, Card } from '@/shared/ui';
import {
  Award,
  BookOpen,
  Calendar,
  CheckCircle2,
  Compass,
  FileText,
  GraduationCap,
  Heart,
  HelpCircle,
  Layers,
  Lightbulb,
  Scale,
  ShieldAlert,
  Sparkles,
  Target,
  UserCheck,
  Users,
} from 'lucide-react';
import { createElement, useState, type FC } from 'react';
import type { PedagogicalCaseStudy } from './course';

// ============================================================================
// 1. COMPONENT BÀI 1.1: HOẠT ĐỘNG SƯ PHẠM CỦA NGƯỜI GIÁO VIÊN
// ============================================================================

export const Lesson1_1View: FC = () => {
  return createElement(
    'div',
    { className: 'space-y-8 text-stone-800 leading-relaxed' },

    // Khung Tiêu đề & Chuẩn đầu ra CLO 2
    createElement(
      'div',
      {
        className:
          'rounded-2xl border border-amber-800/20 bg-gradient-to-br from-[#fcfbf7] via-[#faf8f2] to-amber-50/40 p-6 shadow-xs',
      },
      createElement(
        'div',
        {
          className:
            'flex flex-wrap items-center justify-between gap-2 border-b border-amber-900/10 pb-3',
        },
        createElement(
          'span',
          {
            className:
              'inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-amber-900',
          },
          createElement(GraduationCap, { className: 'h-4 w-4 text-amber-800' }),
          'Chương 1: Hoạt động sư phạm và Người giáo viên phổ thông',
        ),
        createElement(
          'span',
          { className: 'rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-bold text-amber-900' },
          'Chuẩn đầu ra: CLO 2',
        ),
      ),
      createElement(
        'h2',
        { className: 'mt-3 font-serif text-2xl font-bold text-stone-900 sm:text-3xl' },
        'Bài 1.1: Hoạt động sư phạm của người giáo viên',
      ),
      createElement(
        'p',
        { className: 'mt-2 text-sm leading-relaxed text-stone-600 sm:text-base' },
        'Khám phá nguồn gốc bản chất của nghề dạy học, vai trò lịch sử - xã hội vĩ đại của người thầy và phân tích chuyên sâu 5 đặc điểm độc nhất vô nhị của lao động sư phạm theo Giáo trình Giáo dục học HCMUE.',
      ),
    ),

    // PHẦN I: NGUỒN GỐC THUẬT NGỮ VÀ ĐỊNH NGHĨA
    createElement(
      'section',
      { id: '1-nguon-goc-va-dinh-nghia', className: 'space-y-4' },
      createElement(
        'div',
        {
          className:
            'flex items-center gap-2 text-amber-900 font-serif font-bold text-xl border-b border-stone-200 pb-2',
        },
        createElement(BookOpen, { className: 'h-5 w-5 text-amber-800' }),
        createElement(
          'h3',
          null,
          '1. Nguồn gốc thuật ngữ Hán - Việt & Khái niệm Hoạt động sư phạm',
        ),
      ),
      createElement(
        'p',
        null,
        'Trong tiếng Việt, từ ',
        createElement('strong', { className: 'text-stone-900 font-semibold' }, '“Sư phạm”'),
        ' bắt nguồn từ gốc Hán mang triết lý nhân văn và chuẩn mực sâu sắc:',
      ),
      createElement(
        'div',
        { className: 'grid gap-4 sm:grid-cols-2' },
        createElement(
          Card,
          { className: 'p-5 rounded-2xl border-amber-900/15 bg-[#faf8f2]' },
          createElement(
            'div',
            { className: 'flex items-center gap-2 text-amber-900 font-bold text-base' },
            createElement('span', { className: 'text-2xl font-serif' }, '師'),
            createElement('span', null, 'Sư (Thầy giáo)'),
          ),
          createElement(
            'p',
            { className: 'mt-2 text-xs leading-relaxed text-stone-600' },
            'Chỉ người thầy, người đi trước có học vấn uyên thâm, có đạo đức mẫu mực, có sứ mệnh truyền thụ đạo lý, văn hóa và tri thức cho thế hệ tiếp nối. "Nhất tự vi sư, bán tự vi sư".',
          ),
        ),
        createElement(
          Card,
          { className: 'p-5 rounded-2xl border-teal-900/15 bg-teal-50/30' },
          createElement(
            'div',
            { className: 'flex items-center gap-2 text-teal-900 font-bold text-base' },
            createElement('span', { className: 'text-2xl font-serif' }, '範'),
            createElement('span', null, 'Phạm (Khuôn mẫu)'),
          ),
          createElement(
            'p',
            { className: 'mt-2 text-xs leading-relaxed text-stone-600' },
            'Chỉ khuôn thước, chuẩn mực, mẫu mực chuẩn mực để người khác noi theo (“Khuôn vàng thước ngọc”). Mọi cử chỉ, ngôn ngữ, tác phong của người thầy đều phải là tấm gương chuẩn mực.',
          ),
        ),
      ),
      createElement(
        'div',
        {
          className:
            'rounded-xl border border-amber-800/25 bg-amber-50/50 p-4 text-sm leading-relaxed text-amber-950',
        },
        createElement(
          'span',
          { className: 'font-bold text-amber-900' },
          '📌 Định nghĩa khoa học (Giáo trình HCMUE, tr. 5): ',
        ),
        '“Hoạt động sư phạm là loại hoạt động chuyên nghiệp của người giáo viên, được tổ chức có mục đích, có kế hoạch khoa học nhằm hình thành và phát triển toàn diện nhân cách của thế hệ trẻ theo chuẩn mực xã hội.”',
      ),
    ),

    // PHẦN II: VAI TRÒ VÀ CHỨC NĂNG XÃ HỘI
    createElement(
      'section',
      { id: '2-vai-tro-chuc-nang-xa-hoi', className: 'space-y-4' },
      createElement(
        'div',
        {
          className:
            'flex items-center gap-2 text-amber-900 font-serif font-bold text-xl border-b border-stone-200 pb-2',
        },
        createElement(Sparkles, { className: 'h-5 w-5 text-amber-800' }),
        createElement('h3', null, '2. Vai trò và Chức năng xã hội của Người thầy'),
      ),
      createElement(ScholarQuote, {
        quote:
          'Người giáo viên là người chuyển giao ngọn đuốc của nền văn minh, là sợi dây chuyền giữa các thế hệ. Đó là chức vụ quang vinh mà dưới ánh mặt trời này không có chức vụ nào ưu việt cho bằng.',
        author: 'Jan Amos Comenius (1592 - 1670)',
        title: 'Ông tổ của nền Sư phạm Cận đại · Tác giả kiệt tác "Didactica Magna"',
        source: 'Didactica Magna (Đại lý luận dạy học), 1657',
        historicalContext:
          'Comenius khẳng định nghề dạy học không đơn thuần là truyền thụ chữ nghĩa, mà là sứ mệnh thiêng liêng nối liền quá khứ với tương lai, duy trì dòng chảy văn minh của nhân loại.',
      }),
      createElement(
        'p',
        null,
        'Người thầy giữ 3 chức năng xã hội mang tính chất nền tảng cho sự sinh tồn và phát triển của mọi xã hội:',
      ),
      createElement(
        'div',
        { className: 'space-y-3' },
        createElement(
          'div',
          {
            className:
              'flex items-start gap-3 rounded-xl border border-stone-200 bg-white p-4 shadow-2xs',
          },
          createElement(
            'div',
            {
              className:
                'flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-teal-100 text-sm font-bold text-teal-800',
            },
            '1',
          ),
          createElement(
            'div',
            null,
            createElement(
              'h4',
              { className: 'font-bold text-stone-900 text-sm' },
              'Chức năng tái sản xuất nền văn hóa xã hội ở thế hệ trẻ',
            ),
            createElement(
              'p',
              { className: 'mt-1 text-xs text-stone-600 leading-relaxed' },
              'Người thầy là "đầu nối" lịch sử giữa kho tàng tri thức đồ sộ của nhân loại và người học. Thầy chọn lọc, tinh giản và chuyển hóa nền văn hóa xã hội thành phẩm chất và năng lực của từng học sinh.',
            ),
          ),
        ),
        createElement(
          'div',
          {
            className:
              'flex items-start gap-3 rounded-xl border border-stone-200 bg-white p-4 shadow-2xs',
          },
          createElement(
            'div',
            {
              className:
                'flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-amber-100 text-sm font-bold text-amber-800',
            },
            '2',
          ),
          createElement(
            'div',
            null,
            createElement(
              'h4',
              { className: 'font-bold text-stone-900 text-sm' },
              'Chức năng hình thành và phát triển toàn diện nhân cách',
            ),
            createElement(
              'p',
              { className: 'mt-1 text-xs text-stone-600 leading-relaxed' },
              'Người thầy là "kỹ sư thiết kế tâm hồn", khơi dậy lòng nhân ái, lý tưởng sống cao đẹp, bồi dưỡng thế giới quan khoa học và các năng lực cốt lõi theo Chương trình GDPT 2018.',
            ),
          ),
        ),
        createElement(
          'div',
          {
            className:
              'flex items-start gap-3 rounded-xl border border-stone-200 bg-white p-4 shadow-2xs',
          },
          createElement(
            'div',
            {
              className:
                'flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-rose-100 text-sm font-bold text-rose-800',
            },
            '3',
          ),
          createElement(
            'div',
            null,
            createElement(
              'h4',
              { className: 'font-bold text-stone-900 text-sm' },
              'Chức năng chuẩn bị nguồn nhân lực phát triển kinh tế - xã hội',
            ),
            createElement(
              'p',
              { className: 'mt-1 text-xs text-stone-600 leading-relaxed' },
              'Giáo dục là quốc sách hàng đầu. Sự phát triển bền vững của quốc gia phụ thuộc trực tiếp vào chất lượng nguồn nhân lực mà nhà trường đào tạo ra mỗi năm.',
            ),
          ),
        ),
      ),
    ),

    // PHẦN III: 5 ĐẶC ĐIỂM CỦA LAO ĐỘNG SƯ PHẠM
    createElement(
      'section',
      { id: '3-nam-dac-diem-lao-dong-su-pham', className: 'space-y-5' },
      createElement(
        'div',
        {
          className:
            'flex items-center gap-2 text-amber-900 font-serif font-bold text-xl border-b border-stone-200 pb-2',
        },
        createElement(Layers, { className: 'h-5 w-5 text-amber-800' }),
        createElement(
          'h3',
          null,
          '3. Phân tích Chuyên sâu 5 Đặc điểm của Lao động Sư phạm (Trang 6 Giáo trình HCMUE)',
        ),
      ),
      createElement(
        'p',
        null,
        'So với lao động công nghiệp, nông nghiệp hay dịch vụ, lao động sư phạm có 5 đặc điểm bản chất tạo nên tính cao quý nhưng cũng đầy thách thức:',
      ),

      // Ma trận 5 đặc điểm
      createElement(
        'div',
        { className: 'space-y-4' },

        // Đặc điểm 1
        createElement(
          Card,
          { className: 'p-5 rounded-2xl border-stone-200/90 bg-white' },
          createElement(
            'div',
            { className: 'flex items-center gap-2 font-bold text-stone-900 text-base' },
            createElement(Target, { className: 'h-4 w-4 text-teal-700' }),
            'Đặc điểm 1: Về Mục đích Lao động',
          ),
          createElement(
            'p',
            { className: 'mt-2 text-xs sm:text-sm text-stone-700 leading-relaxed' },
            'Mục đích của lao động sư phạm là đào tạo thế hệ trẻ trở thành những con người phát triển toàn diện (Đức - Trí - Thể - Mỹ), có năng lực làm chủ cuộc sống và cống hiến cho xã hội. Mục đích này luôn mang tính chất ',
            createElement('strong', null, 'hướng tới tương lai'),
            ' (kết quả gieo trồng hôm nay chỉ bộc lộ trọn vẹn sau 10-20 năm khi học sinh bước vào đời).',
          ),
        ),

        // Đặc điểm 2
        createElement(
          Card,
          { className: 'p-5 rounded-2xl border-stone-200/90 bg-white' },
          createElement(
            'div',
            { className: 'flex items-center gap-2 font-bold text-stone-900 text-base' },
            createElement(Users, { className: 'h-4 w-4 text-amber-700' }),
            'Đặc điểm 2: Về Đối tượng Lao động (Con người)',
          ),
          createElement(
            'p',
            { className: 'mt-2 text-xs sm:text-sm text-stone-700 leading-relaxed' },
            'Đối tượng của người thầy là con người đang trong thời kỳ lớn lên và định hình nhân cách. Đối tượng này có tính ',
            createElement('strong', null, 'hai mặt biện chứng'),
            ':',
          ),
          createElement(
            'ul',
            { className: 'mt-2 list-disc pl-5 text-xs text-stone-600 space-y-1' },
            createElement(
              'li',
              null,
              createElement('strong', null, 'Khách thể tiếp nhận:'),
              ' Tiếp nhận có chọn lọc các tác động sư phạm, tri thức từ thầy cô và nhà trường.',
            ),
            createElement(
              'li',
              null,
              createElement('strong', null, 'Chủ thể tự giác:'),
              ' Có thế giới nội tâm phong phú, có nhu cầu tự khẳng định, biết phản tư và tự giáo dục bản thân. Người thầy không thể "đúc khuôn" một chiều mà phải tôn trọng cá tính và kích hoạt tính chủ động của trò.',
            ),
          ),
        ),

        // Đặc điểm 3 (Trọng tâm bậc nhất)
        createElement(
          Card,
          {
            className:
              'p-5 rounded-2xl border-amber-800/40 bg-gradient-to-br from-[#fcfbf7] to-amber-50/60 shadow-xs',
          },
          createElement(
            'div',
            { className: 'flex items-center justify-between' },
            createElement(
              'div',
              { className: 'flex items-center gap-2 font-bold text-amber-950 text-base' },
              createElement(Heart, { className: 'h-4 w-4 text-amber-800' }),
              'Đặc điểm 3: Về Công cụ Lao động (Nhân cách Người thầy là công cụ chủ yếu)',
            ),
            createElement(
              Badge,
              { variant: 'subject', className: 'text-[11px]' },
              'Trọng tâm then chốt',
            ),
          ),
          createElement(
            'p',
            { className: 'mt-2.5 text-xs sm:text-sm text-stone-800 leading-relaxed' },
            'Người thợ mộc dùng cưa đục, bác sĩ dùng dao mổ, người kỹ sư dùng máy móc. Còn người thầy giáo, ngoài tri thức, giáo án, công nghệ dạy học, thì ',
            createElement(
              'strong',
              { className: 'text-amber-900' },
              'CÔNG CỤ LAO ĐỘNG CHỦ YẾU VÀ QUYẾT ĐỊNH NHẤT CHÍNH LÀ NHÂN CÁCH CỦA CHÍNH BẢN THÂN NGƯỜI THẦY',
            ),
            '.',
          ),
          createElement(
            'blockquote',
            { className: 'mt-3 border-l-2 border-amber-800 pl-3 text-xs italic text-amber-900' },
            '“Nhân cách của người thầy là sức mạnh giáo dục màu nhiệm nhất mà không có bất kỳ cuốn sách giáo khoa, bài thuyết giảng hay hệ thống hình phạt nào có thể thay thế được.” — K.D. Ushinsky',
          ),
          createElement(
            'p',
            { className: 'mt-2 text-xs text-stone-600' },
            'Tấm gương đạo đức, sự công tâm, ngôn ngữ nhã nhặn, tình yêu thương học trò và uy tín khoa học của người thầy tác động trực tiếp và vô thức đến việc hình thành thế giới quan của học sinh.',
          ),
        ),

        // Đặc điểm 4
        createElement(
          Card,
          { className: 'p-5 rounded-2xl border-stone-200/90 bg-white' },
          createElement(
            'div',
            { className: 'flex items-center gap-2 font-bold text-stone-900 text-base' },
            createElement(Award, { className: 'h-4 w-4 text-teal-700' }),
            'Đặc điểm 4: Về Sản phẩm Lao động (Sản phẩm "Phi vật chất")',
          ),
          createElement(
            'p',
            { className: 'mt-2 text-xs sm:text-sm text-stone-700 leading-relaxed' },
            'Sản phẩm của người thầy là ',
            createElement('strong', null, 'nhân cách toàn diện của người học'),
            ' (tri thức, thế giới quan, kỹ năng, tình cảm, lối sống). Đây là sản phẩm phi vật chất, vô hình, không tạo ra lợi nhuận tức thời tại nhà xưởng nhưng mang lại giá trị gia tăng khổng lồ cho sự thịnh vượng của quốc gia trong tương lai.',
          ),
        ),

        // Đặc điểm 5
        createElement(
          Card,
          { className: 'p-5 rounded-2xl border-stone-200/90 bg-white' },
          createElement(
            'div',
            { className: 'flex items-center gap-2 font-bold text-stone-900 text-base' },
            createElement(Compass, { className: 'h-4 w-4 text-indigo-700' }),
            'Đặc điểm 5: Về Môi trường và Điều kiện Lao động (Tính Sáng tạo liên tục)',
          ),
          createElement(
            'p',
            { className: 'mt-2 text-xs sm:text-sm text-stone-700 leading-relaxed' },
            'Lao động sư phạm diễn ra trong môi trường đòi hỏi tính mẫu mực cao ở mọi thời điểm. Đây là dạng lao động trí óc căng thẳng cao kết hợp với lao động cảm xúc (Emotional Labor), đòi hỏi người thầy phải giữ được sự bình tĩnh, kiên nhẫn. Đặc biệt, nó mang tính ',
            createElement('strong', null, 'sáng tạo liên tục'),
            ': không thể áp dụng máy móc một giáo án hay một cách kỷ luật cho tất cả học sinh, mà phải luôn ứng biến linh hoạt theo từng tình huống cụ thể.',
          ),
        ),
      ),
    ),
  );
};

// ============================================================================
// 2. COMPONENT BÀI 1.2: NHÂN CÁCH VÀ CHUẨN NGHỀ NGHIỆP GIÁO VIÊN
// ============================================================================

export const Lesson1_2View: FC = () => {
  return createElement(
    'div',
    { className: 'space-y-8 text-stone-800 leading-relaxed' },

    // Khung Tiêu đề & Chuẩn đầu ra CLO 1, CLO 2
    createElement(
      'div',
      {
        className:
          'rounded-2xl border border-teal-800/20 bg-gradient-to-br from-[#f8fbfb] via-[#f3f9f9] to-teal-50/50 p-6 shadow-xs',
      },
      createElement(
        'div',
        {
          className:
            'flex flex-wrap items-center justify-between gap-2 border-b border-teal-900/10 pb-3',
        },
        createElement(
          'span',
          {
            className:
              'inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-teal-900',
          },
          createElement(Award, { className: 'h-4 w-4 text-teal-800' }),
          'Chương 1: Hoạt động sư phạm và Người giáo viên phổ thông',
        ),
        createElement(
          'span',
          { className: 'rounded-full bg-teal-100 px-2.5 py-0.5 text-xs font-bold text-teal-900' },
          'Chuẩn đầu ra: CLO 1 & CLO 2',
        ),
      ),
      createElement(
        'h2',
        { className: 'mt-3 font-serif text-2xl font-bold text-stone-900 sm:text-3xl' },
        'Bài 1.2: Nhân cách và Chuẩn nghề nghiệp của người giáo viên phổ thông',
      ),
      createElement(
        'p',
        { className: 'mt-2 text-sm leading-relaxed text-stone-600 sm:text-base' },
        'Phân tích cấu trúc nhân cách người thầy (Phẩm chất & Năng lực) và làm chủ hệ thống 5 Tiêu chuẩn - 15 Tiêu chí Chuẩn nghề nghiệp giáo viên cơ sở GDPT theo Thông tư 20/2018/TT-BGDĐT.',
      ),
    ),

    // PHẦN I: CẤU TRÚC NHÂN CÁCH NGƯỜI THẦY
    createElement(
      'section',
      { id: '1-cau-truc-nhan-cach', className: 'space-y-4' },
      createElement(
        'div',
        {
          className:
            'flex items-center gap-2 text-teal-950 font-serif font-bold text-xl border-b border-stone-200 pb-2',
        },
        createElement(UserCheck, { className: 'h-5 w-5 text-teal-800' }),
        createElement('h3', null, '1. Cấu trúc Nhân cách Người thầy (Đức & Tài)'),
      ),
      createElement(
        'p',
        null,
        'Nhân cách người giáo viên là một chỉnh thể toàn vẹn gồm hai thành tố cơ bản: ',
        createElement('strong', null, 'Phẩm chất (Đức)'),
        ' và ',
        createElement('strong', null, 'Năng lực (Tài)'),
        ':',
      ),

      createElement(
        'div',
        { className: 'grid gap-4 sm:grid-cols-2' },
        // Khối Phẩm chất
        createElement(
          Card,
          { className: 'p-5 rounded-2xl border-stone-200 bg-white shadow-2xs space-y-3' },
          createElement(
            'div',
            { className: 'flex items-center gap-2 text-rose-800 font-bold text-base' },
            createElement(Heart, { className: 'h-5 w-5' }),
            'A. Phẩm chất Nhân cách (Đức)',
          ),
          createElement(
            'ul',
            { className: 'space-y-2 text-xs leading-relaxed text-stone-700' },
            createElement(
              'li',
              { className: 'flex items-start gap-1.5' },
              createElement(CheckCircle2, {
                className: 'h-3.5 w-3.5 text-rose-700 shrink-0 mt-0.5',
              }),
              'Thế giới quan khoa học, lý tưởng nhân văn và lòng trung thành với sự nghiệp trồng người.',
            ),
            createElement(
              'li',
              { className: 'flex items-start gap-1.5' },
              createElement(CheckCircle2, {
                className: 'h-3.5 w-3.5 text-rose-700 shrink-0 mt-0.5',
              }),
              'Đạo đức trong sáng, liêm chính, không vụ lợi, trung thực trong học thuật.',
            ),
            createElement(
              'li',
              { className: 'flex items-start gap-1.5' },
              createElement(CheckCircle2, {
                className: 'h-3.5 w-3.5 text-rose-700 shrink-0 mt-0.5',
              }),
              'Tình yêu thương học sinh sâu sắc, tôn trọng nhân cách và biết lắng nghe, thấu cảm.',
            ),
            createElement(
              'li',
              { className: 'flex items-start gap-1.5' },
              createElement(CheckCircle2, {
                className: 'h-3.5 w-3.5 text-rose-700 shrink-0 mt-0.5',
              }),
              'Tác phong sư phạm chuẩn mực: điềm đạm, khiêm tốn, lịch sự, công bằng và mẫu mực.',
            ),
          ),
        ),

        // Khối Năng lực
        createElement(
          Card,
          { className: 'p-5 rounded-2xl border-stone-200 bg-white shadow-2xs space-y-3' },
          createElement(
            'div',
            { className: 'flex items-center gap-2 text-teal-800 font-bold text-base' },
            createElement(Lightbulb, { className: 'h-5 w-5' }),
            'B. Năng lực Sư phạm (Tài)',
          ),
          createElement(
            'ul',
            { className: 'space-y-2 text-xs leading-relaxed text-stone-700' },
            createElement(
              'li',
              { className: 'flex items-start gap-1.5' },
              createElement(CheckCircle2, {
                className: 'h-3.5 w-3.5 text-teal-700 shrink-0 mt-0.5',
              }),
              'Năng lực chuyên môn Toán học/bộ môn sâu rộng, hiểu biết liên môn và chương trình GDPT.',
            ),
            createElement(
              'li',
              { className: 'flex items-start gap-1.5' },
              createElement(CheckCircle2, {
                className: 'h-3.5 w-3.5 text-teal-700 shrink-0 mt-0.5',
              }),
              'Năng lực dạy học: thiết kế kế hoạch bài dạy, sử dụng phương pháp tích cực, ứng dụng CNTT.',
            ),
            createElement(
              'li',
              { className: 'flex items-start gap-1.5' },
              createElement(CheckCircle2, {
                className: 'h-3.5 w-3.5 text-teal-700 shrink-0 mt-0.5',
              }),
              'Năng lực giáo dục: công tác chủ nhiệm, xây dựng tập thể lớp, tham vấn tâm lý học sinh.',
            ),
            createElement(
              'li',
              { className: 'flex items-start gap-1.5' },
              createElement(CheckCircle2, {
                className: 'h-3.5 w-3.5 text-teal-700 shrink-0 mt-0.5',
              }),
              'Năng lực giao tiếp sư phạm, nghiên cứu khoa học sư phạm ứng dụng và tự học suốt đời.',
            ),
          ),
        ),
      ),
    ),

    // PHẦN II: THÔNG TƯ 20/2018/TT-BGDĐT
    createElement(
      'section',
      { id: '2-thong-tu-20-chuan-nghe-nghiep', className: 'space-y-4' },
      createElement(
        'div',
        {
          className:
            'flex items-center gap-2 text-teal-950 font-serif font-bold text-xl border-b border-stone-200 pb-2',
        },
        createElement(Scale, { className: 'h-5 w-5 text-teal-800' }),
        createElement(
          'h3',
          null,
          '2. Chuẩn nghề nghiệp Giáo viên Cơ sở GDPT (Thông tư 20/2018/TT-BGDĐT)',
        ),
      ),
      createElement(LegalQuoteCard, {
        lawTitle: 'Thông tư số 20/2018/TT-BGDĐT',
        article: 'Điều 4 đến Điều 8',
        quote:
          'Chuẩn nghề nghiệp giáo viên cơ sở giáo dục phổ thông là hệ thống các yêu cầu về phẩm chất và năng lực mà giáo viên cần đạt được để thực hiện nhiệm vụ dạy học và giáo dục học sinh trong các trường tiểu học, trung học cơ sở và trung học phổ thông.',
        source: 'Bộ Giáo dục và Đào tạo, ban hành ngày 22/08/2018',
        sourceUrl: '/docs/giao-duc-hoc/Chuan_nghe_nghiep_GV_TT20.pdf',
        significance:
          'Là thước đo chuẩn mực quốc gia để giáo viên tự đánh giá phẩm chất, năng lực; là căn cứ để cơ sở đào tạo giáo viên đổi mới chương trình và các cấp quản lý xây dựng chính sách bồi dưỡng.',
      }),

      createElement(
        'div',
        { className: 'mt-6 space-y-4' },
        createElement(
          'div',
          { className: 'flex items-center justify-between' },
          createElement(
            'h4',
            { className: 'font-serif font-bold text-lg text-stone-900' },
            'Bảng ma trận tra cứu 5 Tiêu chuẩn & 15 Tiêu chí tương tác:',
          ),
        ),
        createElement(TeacherStandardsMatrix, { defaultStandardId: 1 }),
      ),
    ),
  );
};

// ============================================================================
// 3. COMPONENT BÀI 1.3: RÈN LUYỆN ĐỂ TRỞ THÀNH NGƯỜI GIÁO VIÊN HIỆU QUẢ
// ============================================================================

export const Lesson1_3View: FC = () => {
  return createElement(
    'div',
    { className: 'space-y-8 text-stone-800 leading-relaxed' },

    // Khung Tiêu đề & Chuẩn đầu ra CLO 1, CLO 3
    createElement(
      'div',
      {
        className:
          'rounded-2xl border border-indigo-800/20 bg-gradient-to-br from-[#f8f9fc] via-[#f3f5fa] to-indigo-50/50 p-6 shadow-xs',
      },
      createElement(
        'div',
        {
          className:
            'flex flex-wrap items-center justify-between gap-2 border-b border-indigo-900/10 pb-3',
        },
        createElement(
          'span',
          {
            className:
              'inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-indigo-900',
          },
          createElement(Compass, { className: 'h-4 w-4 text-indigo-800' }),
          'Chương 1: Hoạt động sư phạm và Người giáo viên phổ thông',
        ),
        createElement(
          'span',
          {
            className: 'rounded-full bg-indigo-100 px-2.5 py-0.5 text-xs font-bold text-indigo-900',
          },
          'Chuẩn đầu ra: CLO 1 & CLO 3',
        ),
      ),
      createElement(
        'h2',
        { className: 'mt-3 font-serif text-2xl font-bold text-stone-900 sm:text-3xl' },
        'Bài 1.3: Rèn luyện để trở thành người giáo viên hiệu quả',
      ),
      createElement(
        'p',
        { className: 'mt-2 text-sm leading-relaxed text-stone-600 sm:text-base' },
        'Nắm vững bản chất của quá trình tự giáo dục nhân cách người thầy và thực hành thiết kế “Kế hoạch học tập và rèn luyện cá nhân trong 4 năm đại học” đối chiếu với 15 tiêu chí Chuẩn nghề nghiệp giáo viên.',
      ),
    ),

    // PHẦN I: BẢN CHẤT TỰ GIÁO DỤC
    createElement(
      'section',
      { id: '1-ban-chat-tu-giao-duc', className: 'space-y-4' },
      createElement(
        'div',
        {
          className:
            'flex items-center gap-2 text-indigo-950 font-serif font-bold text-xl border-b border-stone-200 pb-2',
        },
        createElement(Target, { className: 'h-5 w-5 text-indigo-800' }),
        createElement('h3', null, '1. Bản chất Quá trình Tự rèn luyện của Sinh viên Sư phạm'),
      ),
      createElement(
        'p',
        null,
        'Người thầy không thể chỉ sinh ra mà phải được trui rèn qua quá trình học tập và tự giáo dục bền bỉ. ',
        createElement('strong', null, 'Tự giáo dục'),
        ' là hoạt động có ý thức của sinh viên nhằm tự hoàn thiện nhân cách, biến các yêu cầu khách quan của nghề nghiệp thành nhu cầu nội tại của bản thân.',
      ),
      createElement(
        'div',
        { className: 'grid gap-3 sm:grid-cols-4' },
        createElement(
          'div',
          { className: 'p-4 rounded-xl border border-stone-200 bg-white text-center shadow-2xs' },
          createElement(
            'div',
            { className: 'text-indigo-800 font-bold text-sm' },
            '1. Tự nhận thức',
          ),
          createElement(
            'p',
            { className: 'mt-1 text-xs text-stone-500' },
            'Nhận rõ điểm mạnh, điểm yếu, sở trường và hạn chế của bản thân.',
          ),
        ),
        createElement(
          'div',
          { className: 'p-4 rounded-xl border border-stone-200 bg-white text-center shadow-2xs' },
          createElement(
            'div',
            { className: 'text-indigo-800 font-bold text-sm' },
            '2. Tự đối chiếu',
          ),
          createElement(
            'p',
            { className: 'mt-1 text-xs text-stone-500' },
            'So sánh năng lực với 15 tiêu chí Thông tư 20/2018.',
          ),
        ),
        createElement(
          'div',
          { className: 'p-4 rounded-xl border border-stone-200 bg-white text-center shadow-2xs' },
          createElement(
            'div',
            { className: 'text-indigo-800 font-bold text-sm' },
            '3. Lập kế hoạch',
          ),
          createElement(
            'p',
            { className: 'mt-1 text-xs text-stone-500' },
            'Thiết kế mục tiêu, thời hạn và biện pháp tự rèn luyện cụ thể.',
          ),
        ),
        createElement(
          'div',
          { className: 'p-4 rounded-xl border border-stone-200 bg-white text-center shadow-2xs' },
          createElement(
            'div',
            { className: 'text-indigo-800 font-bold text-sm' },
            '4. Tự kiểm soát',
          ),
          createElement(
            'p',
            { className: 'mt-1 text-xs text-stone-500' },
            'Kiên trì thực hiện, đánh giá định kỳ và điều chỉnh phương pháp.',
          ),
        ),
      ),
    ),

    // PHẦN II: LỘ TRÌNH 4 NĂM ĐẠI HỌC
    createElement(
      'section',
      { id: '2-lo-trinh-4-nam', className: 'space-y-4' },
      createElement(
        'div',
        {
          className:
            'flex items-center gap-2 text-indigo-950 font-serif font-bold text-xl border-b border-stone-200 pb-2',
        },
        createElement(Calendar, { className: 'h-5 w-5 text-indigo-800' }),
        createElement('h3', null, '2. Lộ trình Rèn luyện Toàn diện trong 4 Năm Đại học'),
      ),
      createElement(
        'div',
        { className: 'space-y-3' },
        createElement(
          'div',
          { className: 'rounded-xl border border-stone-200 bg-white p-4' },
          createElement(
            'div',
            { className: 'flex items-center gap-2 font-bold text-stone-900 text-sm' },
            createElement(
              'span',
              { className: 'rounded bg-amber-100 px-2 py-0.5 text-xs text-amber-900' },
              'Năm 1',
            ),
            'Thích ứng & Xây dựng Tác phong Trí thức Sư phạm',
          ),
          createElement(
            'p',
            { className: 'mt-1 text-xs text-stone-600 leading-relaxed' },
            'Làm quen môi trường đại học, xây dựng phương pháp tự học đại học; trau dồi phẩm chất đạo đức, rèn luyện ngoại ngữ cơ bản và kỹ năng giao tiếp; tham gia các hoạt động thiện nguyện, phong trào Đoàn trường.',
          ),
        ),
        createElement(
          'div',
          { className: 'rounded-xl border border-stone-200 bg-white p-4' },
          createElement(
            'div',
            { className: 'flex items-center gap-2 font-bold text-stone-900 text-sm' },
            createElement(
              'span',
              { className: 'rounded bg-teal-100 px-2 py-0.5 text-xs text-teal-900' },
              'Năm 2',
            ),
            'Đào sâu Chuyên môn Toán học & Cơ sở Lý luận Giáo dục',
          ),
          createElement(
            'p',
            { className: 'mt-1 text-xs text-stone-600 leading-relaxed' },
            'Nắm vững kiến thức toán học chuyên sâu (Cấu trúc đại số, Hình học Affine, Giải tích); học tập nghiêm túc học phần Tâm lý học và Giáo dục học; làm gia sư dạy kèm hoặc tình nguyện dạy học để cọ xát với tâm lý học sinh phổ thông.',
          ),
        ),
        createElement(
          'div',
          { className: 'rounded-xl border border-stone-200 bg-white p-4' },
          createElement(
            'div',
            { className: 'flex items-center gap-2 font-bold text-stone-900 text-sm' },
            createElement(
              'span',
              { className: 'rounded bg-indigo-100 px-2 py-0.5 text-xs text-indigo-900' },
              'Năm 3',
            ),
            'Rèn luyện Nghiệp vụ Sư phạm & Làm chủ Công nghệ Dạy học',
          ),
          createElement(
            'p',
            { className: 'mt-1 text-xs text-stone-600 leading-relaxed' },
            'Thực hành tập giảng, soạn giáo án theo Chương trình GDPT 2018; làm chủ phần mềm mô phỏng toán học (GeoGebra, Desmos); đi kiến tập sư phạm tại trường THCS/THPT; nghiên cứu khoa học sư phạm ứng dụng.',
          ),
        ),
        createElement(
          'div',
          { className: 'rounded-xl border border-stone-200 bg-white p-4' },
          createElement(
            'div',
            { className: 'flex items-center gap-2 font-bold text-stone-900 text-sm' },
            createElement(
              'span',
              { className: 'rounded bg-rose-100 px-2 py-0.5 text-xs text-rose-900' },
              'Năm 4',
            ),
            'Thực tập Sư phạm Toàn diện & Tự đánh giá Hồ sơ Năng lực (Portfolio)',
          ),
          createElement(
            'p',
            { className: 'mt-1 text-xs text-stone-600 leading-relaxed' },
            'Thực tập chủ nhiệm lớp và giảng dạy thực tế tại trường phổ thông; hoàn thành khóa luận tốt nghiệp; tự đánh giá năng lực nghề nghiệp dựa trên 15 tiêu chí của Thông tư 20/2018 để tự tin bước vào nghề.',
          ),
        ),
      ),
    ),

    // PHẦN III: BÀI TẬP THỰC HÀNH CÁ NHÂN
    createElement(
      'section',
      { id: '3-bai-tap-lap-ke-hoach', className: 'space-y-4' },
      createElement(
        'div',
        {
          className:
            'flex items-center gap-2 text-indigo-950 font-serif font-bold text-xl border-b border-stone-200 pb-2',
        },
        createElement(FileText, { className: 'h-5 w-5 text-indigo-800' }),
        createElement(
          'h3',
          null,
          '3. Bài tập Thực hành: Thiết kế Kế hoạch Rèn luyện Cá nhân 4 Năm',
        ),
      ),
      createElement(
        'p',
        null,
        'Bám sát yêu cầu đánh giá tự học buổi 2 của Đề cương học phần (TS. Lê Thị Thu Liễu), sinh viên hãy hoàn thiện bản kế hoạch rèn luyện cá nhân dưới đây:',
      ),

      createElement(PersonalDevelopmentPlan),
    ),
  );
};

// ============================================================================
// 4. COMPONENT BÀI 1.4: TÌNH HUỐNG SƯ PHẠM VÀ ĐỀ CƯƠNG TỰ LUẬN ÔN TẬP
// ============================================================================

export const Lesson1_4View: FC = () => {
  // Mock data 2 tình huống sư phạm thực hành Chương 1
  const caseStudy1: PedagogicalCaseStudy = {
    id: 101,
    title: 'Giáo viên dạy giỏi nhưng mất bình tĩnh và xúc phạm nhân phẩm học sinh',
    context:
      'Thầy V. là một giáo viên dạy môn Toán có chuyên môn rất vững vàng, giải được nhiều bài toán khó và thường có học sinh đạt điểm cao trong các kỳ thi. Tuy nhiên, trước lớp thầy rất nóng tính và khắt khe quá mức. Khi học sinh không làm được bài hoặc hỏi lại kiến thức cơ bản, thầy thường đập bàn, mắng học sinh là "chậm hiểu", "đầu óc để đi đâu", "học dốt thế này thì sau này làm được tích sự gì". Một số em học sinh vì sợ thầy mắng nên không dám giơ tay phát biểu hay hỏi lại bài, dần dà nảy sinh tâm lý sợ hãi, chán ghét môn Toán và tự ti về năng lực của bản thân.',
    question:
      'Vận dụng đặc điểm "Nhân cách người thầy là công cụ lao động sư phạm quan trọng nhất" và Chuẩn nghề nghiệp giáo viên (Thông tư 20/2018), anh/chị hãy phân tích sai lầm sư phạm của thầy V. và đề xuất hướng điều chỉnh tác phong sư phạm.',
    principlesApplied: [
      'Đặc điểm công cụ lao động sư phạm: Nhân cách của chính người thầy',
      'Tiêu chuẩn 1 (TT20): Đạo đức nhà giáo & Phong cách nhà giáo',
      'Nguyên tắc tôn trọng nhân cách kết hợp với yêu cầu hợp lý đối với học sinh',
    ],
    solutionSteps: [
      {
        step: 1,
        title: 'Phân tích bản chất sai lầm theo đặc điểm công cụ lao động sư phạm',
        content:
          'Thầy V. đã quên rằng trong hoạt động sư phạm, chuyên môn giỏi mới chỉ là điều kiện cần; "nhân cách người thầy mới là công cụ lao động chủ yếu và quyết định nhất". Lời nói miệt thị của thầy đã trực tiếp phá hủy công cụ lao động sư phạm, làm tổn thương lòng tự trọng của học sinh và làm mất đi uy tín của người thầy.',
      },
      {
        step: 2,
        title: 'Đối chiếu với Chuẩn nghề nghiệp giáo viên (Thông tư 20/2018)',
        content:
          'Hành vi xúc phạm nhân phẩm học sinh vi phạm nghiêm trọng Tiêu chí 1 (Đạo đức nhà giáo: không xúc phạm danh dự, thân thể người học) và Tiêu chí 2 (Phong cách nhà giáo: thiếu sự kiên nhẫn, tác phong chưa chuẩn mực, chưa tạo được môi trường tâm lý an toàn).',
      },
      {
        step: 3,
        title: 'Đề xuất giải pháp điều chỉnh tác phong cho giáo viên',
        content:
          'Thầy V. cần học kỹ năng quản trị cảm xúc (Emotional Regulation); khi học sinh chưa hiểu bài, cần bình tĩnh phân tích xem nguyên nhân do đâu (lỗ hổng kiến thức, phương pháp truyền đạt chưa trực quan, hay tâm lý lo âu) để thay đổi cách tiếp cận thay vì trút giận lên học sinh.',
      },
      {
        step: 4,
        title: 'Khôi phục niềm tin và tâm lý học tập cho học sinh',
        content:
          'Thầy cần chủ động nói lời xin lỗi chân thành trước lớp về sự nóng nảy của mình trong các tiết trước; khuyến khích các em tự tin hỏi bài và xây dựng văn hóa "không sợ sai" trong giờ học Toán.',
      },
      {
        step: 5,
        title: 'Bài học sư phạm cho sinh viên sư phạm',
        content:
          'Người thầy giáo giỏi không phải là người giải được bài toán khó nhất, mà là người biết kiên nhẫn khích lệ học sinh yếu nhất từng bước tiến bộ.',
      },
    ],
    pitfallsToAvoid: [
      'Biện hộ rằng "vì muốn tốt cho học sinh nên mới mắng nặng lời" để che đậy sự thiếu kiềm chế cảm xúc.',
      'Cho rằng có chuyên môn cao thì có quyền áp đặt và miệt thị người khác.',
    ],
    coreLesson:
      'Một lời xúc phạm có thể dập tắt vĩnh viễn niềm đam mê toán học của một đứa trẻ. Thước đo cao quý nhất của người thầy là sự bao dung và kiên nhẫn trước sự non nớt của học trò.',
  };

  const caseStudy2: PedagogicalCaseStudy = {
    id: 102,
    title: 'Giáo viên đăng bài châm biếm bài kiểm tra của học sinh lên mạng xã hội',
    context:
      'Cô K. là một giáo viên trẻ mới ra trường giảng dạy tại một trường THPT. Sau đợt kiểm tra 1 tiết, cô chụp ảnh bài làm có câu trả lời ngây ngô, sai sót buồn cười của một em học sinh trong lớp rồi đăng lên trang Facebook cá nhân ở chế độ công khai kèm dòng trạng thái: "Học sinh thời nay não để quên ở nhà, chấm bài mà muốn sang chấn tâm lý!". Bài đăng thu hút hàng trăm lượt thích và bình luận giễu cợt từ bạn bè của cô. Học sinh này sau đó biết chuyện, em bị các bạn cùng trường chia sẻ bài viết trêu chọc, xấu hổ đến mức suy sụp và không dám đến lớp.',
    question:
      'Dưới góc độ Chuẩn nghề nghiệp giáo viên (Tiêu chí 2: Phong cách nhà giáo và Tiêu chí 8: Xây dựng văn hóa nhà trường), anh/chị hãy phân tích mức độ vi phạm của cô K. và đưa ra quy trình xử lý khủng hoảng sư phạm để bảo vệ danh dự cho học sinh.',
    principlesApplied: [
      'Tiêu chuẩn 1, Tiêu chí 2: Phong cách nhà giáo (Ứng xử chuẩn mực trên không gian mạng)',
      'Tiêu chuẩn 3, Tiêu chí 8: Xây dựng văn hóa nhà trường & Trường học an toàn',
      'Quy định về đạo đức nhà giáo và Luật Trẻ em về bảo vệ bí mật đời sống riêng tư',
    ],
    solutionSteps: [
      {
        step: 1,
        title: 'Xóa bài đăng ngay lập tức & Ngăn chặn phát tán thông tin',
        content:
          'Cô K. phải lập tức gỡ bỏ bài đăng trên mạng xã hội, rà soát và yêu cầu các bên liên quan ngừng chia sẻ hình ảnh bài kiểm tra của học sinh.',
      },
      {
        step: 2,
        title: 'Gặp gỡ riêng và xin lỗi chân thành học sinh và gia đình',
        content:
          'Chủ động liên hệ phụ huynh và gặp gỡ trực tiếp em học sinh với thái độ hối lỗi sâu sắc; thừa nhận hành vi nông nổi của mình và cam kết bảo vệ tâm lý cho em.',
      },
      {
        step: 3,
        title: 'Can thiệp bảo vệ học sinh trước tập thể lớp và nhà trường',
        content:
          'Phối hợp với giáo viên chủ nhiệm và ban giám hiệu nhắc nhở nghiêm khắc toàn trường chấm dứt hành vi trêu chọc, bêu riếu học sinh; hỗ trợ ổn định tâm lý để em yên tâm quay lại trường học.',
      },
      {
        step: 4,
        title: 'Tự kiểm điểm và nâng cao nhận thức về văn hóa số nhà giáo',
        content:
          'Báo cáo trung thực sự việc với ban giám hiệu nhà trường, nghiêm túc kiểm điểm về việc vi phạm quyền riêng tư và quy tắc ứng xử trên mạng xã hội của cán bộ giáo viên.',
      },
      {
        step: 5,
        title: 'Bài học sư phạm cho thế hệ giáo viên trẻ',
        content:
          'Không gian mạng không phải là vùng vô luật pháp. Bài kiểm tra của học sinh là hồ sơ giáo dục riêng tư, tuyệt đối không được mang ra làm công cụ câu view hay giải trí tiêu khiển.',
      },
    ],
    pitfallsToAvoid: [
      'Tranh cãi, thanh minh trên mạng xã hội hoặc đổ lỗi cho bạn bè bình luận tiêu cực.',
      'Bỏ mặc học sinh tự chịu đựng sự kỳ thị của bạn bè dẫn đến trầm cảm hoặc bỏ học.',
    ],
    coreLesson:
      'Sự tôn trọng học sinh phải được thể hiện nhất quán cả ngoài đời thực lẫn trên không gian mạng. Một cú click chuột vô trách nhiệm của người thầy có thể hủy hoại cả tương lai học đường của một học sinh.',
  };

  // Trạng thái đóng/mở câu trả lời tự luận ôn tập
  const [openEssayId, setOpenEssayId] = useState<number | null>(1);

  return createElement(
    'div',
    { className: 'space-y-8 text-stone-800 leading-relaxed' },

    // Khung Tiêu đề & Chuẩn đầu ra CLO 1, CLO 2, CLO 3
    createElement(
      'div',
      {
        className:
          'rounded-2xl border border-rose-800/20 bg-gradient-to-br from-[#fcf8f8] via-[#faf3f3] to-rose-50/50 p-6 shadow-xs',
      },
      createElement(
        'div',
        {
          className:
            'flex flex-wrap items-center justify-between gap-2 border-b border-rose-900/10 pb-3',
        },
        createElement(
          'span',
          {
            className:
              'inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-rose-900',
          },
          createElement(ShieldAlert, { className: 'h-4 w-4 text-rose-800' }),
          'Chương 1: Hoạt động sư phạm và Người giáo viên phổ thông',
        ),
        createElement(
          'span',
          { className: 'rounded-full bg-rose-100 px-2.5 py-0.5 text-xs font-bold text-rose-900' },
          'Chuẩn đầu ra: CLO 1, CLO 2, CLO 3',
        ),
      ),
      createElement(
        'h2',
        { className: 'mt-3 font-serif text-2xl font-bold text-stone-900 sm:text-3xl' },
        'Bài 1.4: Tình huống sư phạm & Đề cương tự luận ôn tập Chương 1',
      ),
      createElement(
        'p',
        { className: 'mt-2 text-sm leading-relaxed text-stone-600 sm:text-base' },
        'Vận dụng lý luận lao động sư phạm và Chuẩn nghề nghiệp GV để giải quyết 2 ca tình huống sư phạm thực chiến, đồng thời ôn luyện 3 câu hỏi tự luận kinh điển phục vụ bài kiểm tra giữa kỳ A1.10.',
      ),
    ),

    // PHẦN I: 2 TÌNH HUỐNG SƯ PHẠM THỰC HÀNH
    createElement(
      'section',
      { id: '1-tinh-huong-su-pham-chuong-1', className: 'space-y-6' },
      createElement(
        'div',
        {
          className:
            'flex items-center gap-2 text-rose-950 font-serif font-bold text-xl border-b border-stone-200 pb-2',
        },
        createElement(HelpCircle, { className: 'h-5 w-5 text-rose-800' }),
        createElement('h3', null, '1. Phòng nghiệm Sư phạm: 2 Tình huống Thực hành Chương 1'),
      ),
      createElement(CaseStudyBox, { caseStudy: caseStudy1, defaultOpenSolution: false }),
      createElement(CaseStudyBox, { caseStudy: caseStudy2, defaultOpenSolution: false }),
    ),

    // PHẦN II: 3 CÂU HỎI TỰ LUẬN TRỌNG TÂM ÔN TẬP
    createElement(
      'section',
      { id: '2-cau-hoi-tu-luan-on-tap', className: 'space-y-4' },
      createElement(
        'div',
        {
          className:
            'flex items-center gap-2 text-rose-950 font-serif font-bold text-xl border-b border-stone-200 pb-2',
        },
        createElement(Award, { className: 'h-5 w-5 text-rose-800' }),
        createElement(
          'h3',
          null,
          '2. Đề cương Tự luận Trọng tâm Ôn thi (Kiểm tra A1.10 & Kết thúc học phần)',
        ),
      ),
      createElement(
        'p',
        null,
        'Hệ thống hóa 3 câu hỏi tự luận cốt lõi với dàn ý đáp án chuẩn mực theo Giáo trình GDH HCMUE:',
      ),

      createElement(
        'div',
        { className: 'space-y-3' },

        // Câu 1
        createElement(
          'div',
          { className: 'rounded-xl border border-stone-200 bg-white overflow-hidden shadow-2xs' },
          createElement(
            'button',
            {
              type: 'button',
              onClick: () => setOpenEssayId(openEssayId === 1 ? null : 1),
              className:
                'w-full flex items-center justify-between p-4 text-left font-bold text-stone-900 hover:bg-stone-50 text-sm sm:text-base',
            },
            createElement(
              'span',
              null,
              'Câu 1: Phân tích luận điểm của Comenius về vai trò của người giáo viên trong xã hội?',
            ),
            createElement(
              'span',
              { className: 'text-xs text-rose-700' },
              openEssayId === 1 ? 'Thu gọn ▲' : 'Xem đáp án ▼',
            ),
          ),
          openEssayId === 1 &&
            createElement(
              'div',
              {
                className:
                  'border-t border-stone-100 bg-stone-50/50 p-4 text-xs sm:text-sm text-stone-700 space-y-2 leading-relaxed',
              },
              createElement(
                'p',
                { className: 'font-semibold text-rose-900' },
                'Dàn ý phân tích đạt điểm tối đa (3.0 điểm):',
              ),
              createElement(
                'ul',
                { className: 'list-disc pl-5 space-y-1' },
                createElement(
                  'li',
                  null,
                  createElement('strong', null, 'Bối cảnh tư tưởng:'),
                  ' J.A. Comenius là ông tổ nền sư phạm cận đại, đặt nền móng cho hệ thống lớp - bài và giáo dục phổ cập.',
                ),
                createElement(
                  'li',
                  null,
                  createElement(
                    'strong',
                    null,
                    'Ý nghĩa hình ảnh “Chuyển giao ngọn đuốc của nền văn minh”:',
                  ),
                  ' Người thầy không tạo ra của cải vật chất tức thời nhưng là người bảo tồn và thắp sáng tri thức, đưa ánh sáng văn minh nhân loại đến cho thế hệ sau.',
                ),
                createElement(
                  'li',
                  null,
                  createElement(
                    'strong',
                    null,
                    'Ý nghĩa hình ảnh “Sợi dây chuyền giữa các thế hệ”:',
                  ),
                  ' Nếu không có người thầy, dòng chảy văn hóa nhân loại sẽ bị đứt gãy. Thế hệ sau sẽ phải mò mẫm lại từ thời đồ đá.',
                ),
                createElement(
                  'li',
                  null,
                  createElement('strong', null, 'Liên hệ thực tiễn GDPT 2018:'),
                  ' Trong kỷ nguyên số và AI, người thầy càng phải là người truyền cảm hứng, định hướng giá trị đạo đức và nhân văn.',
                ),
              ),
            ),
        ),

        // Câu 2
        createElement(
          'div',
          { className: 'rounded-xl border border-stone-200 bg-white overflow-hidden shadow-2xs' },
          createElement(
            'button',
            {
              type: 'button',
              onClick: () => setOpenEssayId(openEssayId === 2 ? null : 2),
              className:
                'w-full flex items-center justify-between p-4 text-left font-bold text-stone-900 hover:bg-stone-50 text-sm sm:text-base',
            },
            createElement(
              'span',
              null,
              'Câu 2: Chứng minh: “Trong hoạt động sư phạm, nhân cách của người thầy là công cụ lao động chủ yếu và quan trọng nhất”?',
            ),
            createElement(
              'span',
              { className: 'text-xs text-rose-700' },
              openEssayId === 2 ? 'Thu gọn ▲' : 'Xem đáp án ▼',
            ),
          ),
          openEssayId === 2 &&
            createElement(
              'div',
              {
                className:
                  'border-t border-stone-100 bg-stone-50/50 p-4 text-xs sm:text-sm text-stone-700 space-y-2 leading-relaxed',
              },
              createElement(
                'p',
                { className: 'font-semibold text-rose-900' },
                'Dàn ý chứng minh luận điểm (3.5 điểm):',
              ),
              createElement(
                'ul',
                { className: 'list-disc pl-5 space-y-1' },
                createElement(
                  'li',
                  null,
                  createElement('strong', null, 'So sánh với các ngành nghề khác:'),
                  ' Công cụ lao động khác là vật chất (máy móc, thiết bị), trong khi công cụ sư phạm mang tính tinh thần và nhân cách.',
                ),
                createElement(
                  'li',
                  null,
                  createElement('strong', null, 'Cơ chế tác động tâm lý:'),
                  ' Trẻ em có xu hướng bắt chước và đồng nhất hóa với hình tượng người thầy. Tấm gương sống động có sức thuyết phục gấp ngàn lần lời nói suông.',
                ),
                createElement(
                  'li',
                  null,
                  createElement('strong', null, 'Tính toàn vẹn:'),
                  ' Thầy giáo tác động đến học trò bằng cả vốn sống, đạo đức, uy tín chuyên môn và phong cách giao tiếp.',
                ),
                createElement(
                  'li',
                  null,
                  createElement('strong', null, 'Bài học rút ra:'),
                  ' Người thầy phải không ngừng tự soi rọi, rèn luyện phẩm chất và giữ gìn tác phong chuẩn mực trong và ngoài lớp học.',
                ),
              ),
            ),
        ),

        // Câu 3
        createElement(
          'div',
          { className: 'rounded-xl border border-stone-200 bg-white overflow-hidden shadow-2xs' },
          createElement(
            'button',
            {
              type: 'button',
              onClick: () => setOpenEssayId(openEssayId === 3 ? null : 3),
              className:
                'w-full flex items-center justify-between p-4 text-left font-bold text-stone-900 hover:bg-stone-50 text-sm sm:text-base',
            },
            createElement(
              'span',
              null,
              'Câu 3: Tại sao nói sản phẩm của hoạt động sư phạm là sản phẩm đặc biệt mang tính “phi vật chất”?',
            ),
            createElement(
              'span',
              { className: 'text-xs text-rose-700' },
              openEssayId === 3 ? 'Thu gọn ▲' : 'Xem đáp án ▼',
            ),
          ),
          openEssayId === 3 &&
            createElement(
              'div',
              {
                className:
                  'border-t border-stone-100 bg-stone-50/50 p-4 text-xs sm:text-sm text-stone-700 space-y-2 leading-relaxed',
              },
              createElement(
                'p',
                { className: 'font-semibold text-rose-900' },
                'Dàn ý trả lời trọng tâm (3.5 điểm):',
              ),
              createElement(
                'ul',
                { className: 'list-disc pl-5 space-y-1' },
                createElement(
                  'li',
                  null,
                  createElement('strong', null, 'Bản chất sản phẩm:'),
                  ' Sản phẩm của giáo dục là nhân cách con người (thế giới quan, tri thức, kỹ năng, tình cảm, hành vi). Đây là thực thể tinh thần, phi vật chất, không thể cân đo đong đếm cơ học ngay lập tức.',
                ),
                createElement(
                  'li',
                  null,
                  createElement('strong', null, 'Tính chậm trễ về thời gian (Độ trễ giáo dục):'),
                  ' Phải mất hàng chục năm để kiểm chứng một con người được giáo dục thành công.',
                ),
                createElement(
                  'li',
                  null,
                  createElement('strong', null, 'Giá trị kinh tế - xã hội to lớn:'),
                  ' Con người có nhân cách phát triển toàn diện sẽ sáng tạo ra của cải vật chất và những giá trị văn hóa vô tận cho xã hội.',
                ),
                createElement(
                  'li',
                  null,
                  createElement('strong', null, 'Hệ quả:'),
                  ' Đầu tư cho giáo dục là đầu tư cho phát triển bền vững lâu dài nhất của một quốc gia.',
                ),
              ),
            ),
        ),
      ),
    ),
  );
};

// ============================================================================
// 5. BỘ ĐIỀU PHỐI (MODULE DISPATCHER) CHO CHƯƠNG 1
// ============================================================================

export function getChapter1LessonModule(lessonId: string): CompiledLessonModule | null {
  if (lessonId === 'gdh-c1-b1-hoat-dong-su-pham-cua-nguoi-giao-vien') {
    return {
      default: Lesson1_1View,
      frontmatter: {
        title: 'Bài 1.1: Hoạt động sư phạm của người giáo viên',
        description:
          'Bản chất nghề dạy học, vai trò của người thầy và 5 đặc điểm cốt lõi của lao động sư phạm theo Giáo trình HCMUE.',
        level: 'basic',
        tags: ['Hoạt động sư phạm', 'Lao động sư phạm', 'Đặc điểm nghề giáo', 'CLO 2'],
      },
      lessonMeta: {
        chapterNumber: 1,
        lessonNumber: 1,
        headings: [
          {
            id: '1-nguon-goc-va-dinh-nghia',
            text: '1. Nguồn gốc thuật ngữ Hán - Việt & Khái niệm Hoạt động sư phạm',
            depth: 2,
          },
          {
            id: '2-vai-tro-chuc-nang-xa-hoi',
            text: '2. Vai trò và Chức năng xã hội của Người thầy',
            depth: 2,
          },
          {
            id: '3-nam-dac-diem-lao-dong-su-pham',
            text: '3. Phân tích Chuyên sâu 5 Đặc điểm của Lao động Sư phạm',
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
        title: 'Bài 1.2: Nhân cách & Chuẩn nghề nghiệp giáo viên phổ thông',
        description:
          'Cấu trúc nhân cách người thầy và ma trận 5 Tiêu chuẩn - 15 Tiêu chí Chuẩn nghề nghiệp theo Thông tư 20/2018/TT-BGDĐT.',
        level: 'basic',
        tags: ['Nhân cách người thầy', 'Thông tư 20', 'Chuẩn nghề nghiệp', 'CLO 1', 'CLO 2'],
      },
      lessonMeta: {
        chapterNumber: 1,
        lessonNumber: 2,
        headings: [
          {
            id: '1-cau-truc-nhan-cach',
            text: '1. Cấu trúc Nhân cách Người thầy (Đức & Tài)',
            depth: 2,
          },
          {
            id: '2-thong-tu-20-chuan-nghe-nghiep',
            text: '2. Chuẩn nghề nghiệp Giáo viên Cơ sở GDPT (Thông tư 20/2018)',
            depth: 2,
          },
        ],
        blocks: [],
      },
    };
  }

  if (lessonId === 'gdh-c1-b3-ren-luyen-de-tro-thanh-nguoi-giao-vien-hieu-qua') {
    return {
      default: Lesson1_3View,
      frontmatter: {
        title: 'Bài 1.3: Rèn luyện để trở thành người giáo viên hiệu quả',
        description:
          'Bản chất tự giáo dục và thực hành thiết kế Kế hoạch học tập, rèn luyện cá nhân trong 4 năm đại học.',
        level: 'intermediate',
        tags: ['Tự giáo dục', 'Kế hoạch rèn luyện', 'CLO 1', 'CLO 3'],
      },
      lessonMeta: {
        chapterNumber: 1,
        lessonNumber: 3,
        headings: [
          {
            id: '1-ban-chat-tu-giao-duc',
            text: '1. Bản chất Quá trình Tự rèn luyện của Sinh viên Sư phạm',
            depth: 2,
          },
          {
            id: '2-lo-trinh-4-nam',
            text: '2. Lộ trình Rèn luyện Toàn diện trong 4 Năm Đại học',
            depth: 2,
          },
          {
            id: '3-bai-tap-lap-ke-hoach',
            text: '3. Bài tập Thực hành: Thiết kế Kế hoạch Rèn luyện Cá nhân 4 Năm',
            depth: 2,
          },
        ],
        blocks: [],
      },
    };
  }

  if (lessonId === 'gdh-c1-b4-tinh-huong-su-pham-va-de-cuong-on-tap-chuong-1') {
    return {
      default: Lesson1_4View,
      frontmatter: {
        title: 'Bài 1.4: Tình huống sư phạm & Đề cương tự luận ôn tập Chương 1',
        description:
          'Giải quyết 2 tình huống sư phạm thực hành và ôn luyện 3 câu hỏi tự luận kinh điển theo đề cương TS. Lê Thị Thu Liễu.',
        level: 'advanced',
        tags: [
          'Tình huống sư phạm',
          'Đề cương ôn tập',
          'Câu hỏi tự luận',
          'CLO 1',
          'CLO 2',
          'CLO 3',
        ],
      },
      lessonMeta: {
        chapterNumber: 1,
        lessonNumber: 4,
        headings: [
          {
            id: '1-tinh-huong-su-pham-chuong-1',
            text: '1. Phòng nghiệm Sư phạm: 2 Tình huống Thực hành Chương 1',
            depth: 2,
          },
          {
            id: '2-cau-hoi-tu-luan-on-tap',
            text: '2. Đề cương Tự luận Trọng tâm Ôn thi (Kiểm tra A1.10)',
            depth: 2,
          },
        ],
        blocks: [],
      },
    };
  }

  return null;
}
