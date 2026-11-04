import type { CompiledLessonModule } from '@/content-runtime/loader';
import { useLearningStore } from '@/features/learning';
import { LegalQuoteCard, ScholarQuote } from '@/features/pedagogy';
import { Badge, Button, Card } from '@/shared/ui';
import {
  Award,
  BookOpen,
  Calendar,
  CheckCircle2,
  Compass,
  FileText,
  GraduationCap,
  Layers,
  Lightbulb,
  Target,
} from 'lucide-react';
import { createElement, useState, type FC } from 'react';

// ============================================================================
// COMPONENT TIỆN ÍCH: THẺ TIẾN ĐỘ HOÀN THÀNH BÀI HỌC (SUPABASE SYNC)
// ============================================================================

interface LessonCompletionCardProps {
  readonly lessonId: string;
  readonly lessonTitle: string;
}

const LessonCompletionCard: FC<LessonCompletionCardProps> = ({ lessonId, lessonTitle }) => {
  const isCompleted = useLearningStore((state) => Boolean(state.completedLessons[lessonId]));
  const toggleCompleted = useLearningStore((state) => state.toggleLessonCompleted);

  return createElement(
    'div',
    {
      className:
        'mt-8 rounded-2xl border border-stone-200/90 bg-white p-6 shadow-xs transition-all hover:border-amber-700/30',
    },
    createElement(
      'div',
      { className: 'flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between' },
      createElement(
        'div',
        { className: 'space-y-1' },
        createElement(
          'div',
          { className: 'flex items-center gap-2' },
          createElement(CheckCircle2, {
            className: `h-5 w-5 ${isCompleted ? 'text-emerald-600' : 'text-stone-400'}`,
          }),
          createElement(
            'span',
            { className: 'text-sm font-bold text-stone-900' },
            isCompleted ? 'Bạn đã hoàn thành bài học này!' : 'Ghi nhận tiến độ học tập',
          ),
        ),
        createElement(
          'p',
          { className: 'text-xs text-stone-500' },
          isCompleted
            ? `Tiến độ của bài "${lessonTitle}" đã được đồng bộ với hệ thống học tập của bạn.`
            : 'Nhấn nút bên cạnh để đánh dấu đã hoàn thành và lưu tiến độ lên hệ thống.',
        ),
      ),
      createElement(
        Button,
        {
          variant: isCompleted ? 'subject' : 'outline',
          size: 'sm',
          onClick: () => toggleCompleted(lessonId),
          className: 'shrink-0',
        },
        createElement(CheckCircle2, { className: 'h-4 w-4 mr-1.5' }),
        isCompleted ? 'Đã hoàn thành' : 'Đánh dấu hoàn thành',
      ),
    ),
  );
};

// ============================================================================
// 1. COMPONENT BÀI 5.1: KHÁI NIỆM, BẢN CHẤT VÀ MỤC TIÊU CỦA HĐTN
// ============================================================================

export const Lesson5_1View: FC = () => {
  return createElement(
    'div',
    { className: 'space-y-8 text-stone-800 leading-relaxed' },

    // Header & CLO
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
          'Chương 5: Tổ chức Hoạt động trải nghiệm ở trường phổ thông',
        ),
        createElement(
          'span',
          { className: 'rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-bold text-amber-900' },
          'Chuẩn đầu ra: CLO 1, CLO 2',
        ),
      ),
      createElement(
        'h2',
        { className: 'mt-3 font-serif text-2xl font-bold text-stone-900 sm:text-3xl' },
        'Bài 5.1: Khái niệm, Bản chất và Mục tiêu của Hoạt động trải nghiệm',
      ),
      createElement(
        'p',
        { className: 'mt-2 text-sm leading-relaxed text-stone-600 sm:text-base' },
        'Khám phá định vị của Hoạt động trải nghiệm (HĐTN) và Hoạt động trải nghiệm, hướng nghiệp (HĐTN, HN) như một hoạt động giáo dục bắt buộc trong CT GDPT 2018; phân tích bản chất học tập qua trải nghiệm (Experiential Learning) và mục tiêu phân tầng theo từng cấp học.',
      ),
    ),

    // SCHOLAR QUOTE: JOHN DEWEY
    createElement(ScholarQuote, {
      quote:
        'Giáo dục không phải là sự chuẩn bị cho cuộc sống; giáo dục chính là cuộc sống. Con người chỉ thực sự học được khi hành động và suy ngẫm về hành động đó (Learning by doing).',
      author: 'John Dewey',
      title:
        'Triết gia và nhà giáo dục học vĩ đại người Mỹ, cha đẻ của thuyết Thực dụng và Giáo dục tiến bộ',
      source: 'Dân chủ và Giáo dục (Democracy and Education), 1916',
      historicalContext:
        'Cơ sở triết học và sư phạm nền tảng của phương pháp học tập qua trải nghiệm trong giáo dục hiện đại.',
    }),

    // PHẦN I: KHÁI NIỆM & VỊ TRÍ PHÁP LÝ
    createElement(
      'section',
      { id: '1-khai-niem-vi-tri-hdtn', className: 'space-y-4' },
      createElement(
        'div',
        {
          className:
            'flex items-center gap-2 text-amber-900 font-serif font-bold text-xl border-b border-stone-200 pb-2',
        },
        createElement(BookOpen, { className: 'h-5 w-5 text-amber-800' }),
        createElement('h3', null, '1. Khái niệm và Vị thế Pháp lý theo Chương trình GDPT 2018'),
      ),
      createElement(LegalQuoteCard, {
        lawTitle: 'Chương trình Giáo dục phổ thông 2018',
        article: 'Thông tư số 32/2018/TT-BGDĐT — Chương trình Hoạt động trải nghiệm',
        quote:
          'Hoạt động trải nghiệm (cấp Tiểu học) và Hoạt động trải nghiệm, hướng nghiệp (cấp Trung học cơ sở và cấp Trung học phổ thông) là hoạt động giáo dục bắt buộc do nhà giáo dục định hướng, thiết kế và hướng dẫn thực hiện, tạo cơ hội cho học sinh tiếp cận thực tế, thể nghiệm các cảm xúc tích cực, khai thác những kinh nghiệm đã có và huy động tổng hợp kiến thức, kỹ năng của các môn học để thực hiện những nhiệm vụ được giao hoặc giải quyết những vấn đề của thực tiễn đời sống nhà trường, gia đình, xã hội; qua đó, chuyển hóa những kinh nghiệm đã trải qua thành tri thức mới, hiểu biết mới, kỹ năng mới góp phần phát huy tiềm năng sáng tạo và khả năng thích ứng với cuộc sống, môi trường và nghề nghiệp tương lai.\nThời lượng thực hiện: 105 tiết/năm học cho tất cả các lớp từ lớp 1 đến lớp 12.',
        source: 'Bộ Giáo dục và Đào tạo, ban hành ngày 26/12/2018',
        sourceUrl: '/docs/giao-duc-hoc/CT_Hoat_dong_trai_nghiem.pdf',
        significance:
          'Khẳng định tính chất bắt buộc độc lập với thời lượng 105 tiết/năm (tương đương 3 tiết/tuần), không phải là hoạt động ngoại khóa tùy chọn.',
      }),
    ),

    // PHẦN II: BẢN CHẤT HỌC TẬP QUA TRẢI NGHIỆM (DAVID KOLB)
    createElement(
      'section',
      { id: '2-ban-chat-chu-trinh-kolb', className: 'space-y-4' },
      createElement(
        'div',
        {
          className:
            'flex items-center gap-2 text-amber-900 font-serif font-bold text-xl border-b border-stone-200 pb-2',
        },
        createElement(Compass, { className: 'h-5 w-5 text-amber-800' }),
        createElement(
          'h3',
          null,
          '2. Bản chất Giáo dục qua Trải nghiệm: Chu trình 4 Bước của David Kolb',
        ),
      ),
      createElement(
        'p',
        null,
        'Trải nghiệm không chỉ đơn giản là tham gia một hoạt động bề nổi. Giá trị giáo dục chỉ thực sự xuất hiện khi học sinh trải qua ',
        createElement('strong', null, 'chu trình phản tư và khái quát hóa'),
        ':',
      ),
      createElement(
        'div',
        { className: 'grid gap-3 sm:grid-cols-2 lg:grid-cols-4' },
        [
          {
            step: 'Bước 1',
            title: 'Trải nghiệm cụ thể',
            sub: 'Concrete Experience',
            desc: 'Học sinh trực tiếp tham gia vào một hoạt động, trò chơi, dự án hoặc tình huống thực tế đời sống.',
          },
          {
            step: 'Bước 2',
            title: 'Quan sát & Phản tư',
            sub: 'Reflective Observation',
            desc: 'Học sinh suy ngẫm, chia sẻ cảm xúc: Điều gì đã xảy ra? Mình cảm thấy thế nào? Tại sao lại như vậy?',
          },
          {
            step: 'Bước 3',
            title: 'Khái quát hóa tri thức',
            sub: 'Abstract Conceptualization',
            desc: 'Rút ra bài học, đúc kết thành nguyên tắc ứng xử, quy tắc đạo đức hoặc giải pháp kỹ thuật mới.',
          },
          {
            step: 'Bước 4',
            title: 'Thử nghiệm tích cực',
            sub: 'Active Experimentation',
            desc: 'Ứng dụng ngay bài học và kỹ năng mới vào các tình huống thực tế của học đường và gia đình.',
          },
        ].map((item, idx) =>
          createElement(
            Card,
            { key: idx, className: 'p-4 rounded-xl border-stone-200 bg-[#faf8f2] space-y-1.5' },
            createElement(
              'div',
              { className: 'flex items-center justify-between' },
              createElement(Badge, { variant: 'subjectSolid' }, item.step),
              createElement('span', { className: 'text-[10px] text-stone-500 italic' }, item.sub),
            ),
            createElement('h4', { className: 'font-bold text-xs text-amber-950' }, item.title),
            createElement('p', { className: 'text-xs text-stone-600 leading-relaxed' }, item.desc),
          ),
        ),
      ),
    ),

    // PHẦN III: MỤC TIÊU PHÂN TẦNG THEO CẤP HỌC
    createElement(
      'section',
      { id: '3-muc-tieu-phan-tang-cap-hoc', className: 'space-y-4' },
      createElement(
        'div',
        {
          className:
            'flex items-center gap-2 text-amber-900 font-serif font-bold text-xl border-b border-stone-200 pb-2',
        },
        createElement(Target, { className: 'h-5 w-5 text-amber-800' }),
        createElement('h3', null, '3. Mục tiêu Cốt lõi Phân tầng theo Ba Cấp học'),
      ),
      createElement(
        'div',
        { className: 'grid gap-4 sm:grid-cols-3' },
        [
          {
            level: 'Cấp Tiểu học',
            target: 'Tự chăm sóc & Hình thành thói quen',
            content:
              'Hình thành các thói quen sinh hoạt tích cực, nền nếp tự phục vụ; bước đầu có ý thức tự bảo vệ bản thân, quan tâm và yêu thương người thân trong gia đình.',
          },
          {
            level: 'Cấp Trung học cơ sở',
            target: 'Tự khẳng định & Thích ứng',
            content:
              'Phát triển khả năng tự khẳng định cá tính và giá trị bản thân; hình thành kỹ năng thích ứng với sự biến đổi tâm sinh lý lứa tuổi dậy thì; hiểu biết ban đầu về các ngành nghề để chuẩn bị phân luồng.',
          },
          {
            level: 'Cấp Trung học phổ thông',
            target: 'Tự chủ & Định hướng nghề nghiệp',
            content:
              'Phát triển năng lực tự chủ, phẩm chất trách nhiệm công dân; xác định rõ thiên hướng và năng khiếu bản thân; xây dựng kế hoạch học tập nghề nghiệp tương lai và chuẩn bị gia nhập thị trường lao động.',
          },
        ].map((lvl, idx) =>
          createElement(
            Card,
            {
              key: idx,
              className: 'p-5 rounded-2xl border-stone-200 bg-white shadow-xs space-y-2',
            },
            createElement(
              'div',
              { className: 'flex items-center gap-2' },
              createElement(Badge, { variant: 'subject' }, lvl.level),
              createElement('h4', { className: 'font-bold text-xs text-teal-900' }, lvl.target),
            ),
            createElement(
              'p',
              { className: 'text-xs text-stone-600 leading-relaxed' },
              lvl.content,
            ),
          ),
        ),
      ),
    ),

    // NÚT HOÀN THÀNH BÀI HỌC
    createElement(LessonCompletionCard, {
      lessonId: 'gdh-c5-b1-khai-niem-ban-chat-va-muc-tieu-hoat-dong-trai-nghiem',
      lessonTitle: 'Bài 5.1: Khái niệm, Bản chất và Mục tiêu của Hoạt động trải nghiệm',
    }),
  );
};

// ============================================================================
// 2. COMPONENT BÀI 5.2: NỘI DUNG VÀ PHƯƠNG THỨC TỔ CHỨC HĐTN
// ============================================================================

export const Lesson5_2View: FC = () => {
  const [activeTab, setActiveTab] = useState<'4-mach' | '4-loai-hinh'>('4-mach');

  return createElement(
    'div',
    { className: 'space-y-8 text-stone-800 leading-relaxed' },

    // Header & CLO
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
          'Chương 5: Tổ chức Hoạt động trải nghiệm ở trường phổ thông',
        ),
        createElement(
          'span',
          { className: 'rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-bold text-amber-900' },
          'Chuẩn đầu ra: CLO 1, CLO 2',
        ),
      ),
      createElement(
        'h2',
        { className: 'mt-3 font-serif text-2xl font-bold text-stone-900 sm:text-3xl' },
        'Bài 5.2: Nội dung và Phương thức tổ chức Hoạt động trải nghiệm',
      ),
      createElement(
        'p',
        { className: 'mt-2 text-sm leading-relaxed text-stone-600 sm:text-base' },
        'Phân tích chuyên sâu 4 mạch nội dung cốt lõi xuyên suốt từ lớp 1 đến lớp 12 và 4 loại hình tổ chức cơ bản trong nhà trường phổ thông (Sinh hoạt dưới cờ, Sinh hoạt lớp, HĐGD theo chủ đề, Hoạt động CLB) cùng hệ thống phương pháp phong phú.',
      ),
    ),

    // PHẦN CHUYỂN ĐỔI: 4 MẠCH NỘI DUNG & 4 LOẠI HÌNH
    createElement(
      'div',
      { className: 'flex flex-wrap gap-2 rounded-xl bg-stone-100 p-1.5 text-xs font-semibold' },
      createElement(
        'button',
        {
          type: 'button',
          onClick: () => setActiveTab('4-mach'),
          className: `flex items-center gap-1.5 rounded-lg px-3.5 py-2 transition-all ${
            activeTab === '4-mach'
              ? 'bg-white text-teal-900 shadow-2xs font-bold'
              : 'text-stone-600 hover:text-stone-900'
          }`,
        },
        createElement(Layers, { className: 'h-4 w-4' }),
        'Bốn Mạch Nội dung Xuyên suốt',
      ),
      createElement(
        'button',
        {
          type: 'button',
          onClick: () => setActiveTab('4-loai-hinh'),
          className: `flex items-center gap-1.5 rounded-lg px-3.5 py-2 transition-all ${
            activeTab === '4-loai-hinh'
              ? 'bg-white text-teal-900 shadow-2xs font-bold'
              : 'text-stone-600 hover:text-stone-900'
          }`,
        },
        createElement(Calendar, { className: 'h-4 w-4' }),
        'Bốn Loại hình Tổ chức Cơ bản',
      ),
    ),

    // NỘI DUNG TAB 1: 4 MẠCH NỘI DUNG
    activeTab === '4-mach' &&
      createElement(
        'section',
        { id: '1-bon-mach-noi-dung', className: 'space-y-4' },
        createElement(
          'div',
          { className: 'grid gap-4 sm:grid-cols-2' },
          [
            {
              title: '1. Hoạt động hướng vào bản thân',
              sub: 'Khám phá & Rèn luyện cá nhân',
              desc: 'Giúp học sinh tự nhận thức về điểm mạnh, điểm yếu, sở thích, tính cách; rèn luyện thói quen sinh hoạt khoa học, kỹ năng quản lý thời gian, tự chăm sóc sức khỏe và kiểm soát cảm xúc tiêu cực.',
            },
            {
              title: '2. Hoạt động hướng đến xã hội',
              sub: 'Gia đình, Nhà trường & Cộng đồng',
              desc: 'Chăm sóc và gắn kết tình cảm gia đình, hiếu thảo với cha mẹ; xây dựng tình bạn trong sáng, phòng chống bạo lực học đường; tham gia các hoạt động tình nguyện, đền ơn đáp nghĩa và ứng xử văn minh nơi công cộng.',
            },
            {
              title: '3. Hoạt động hướng đến tự nhiên',
              sub: 'Môi trường sống & Ứng phó thiên tai',
              desc: 'Tìm hiểu và bảo vệ cảnh quan thiên nhiên quê hương; hình thành ý thức tiết kiệm năng lượng, phân loại rác thải tại nguồn; rèn luyện kỹ năng sinh tồn và thích ứng với biến đổi khí hậu.',
            },
            {
              title: '4. Hoạt động hướng nghiệp',
              sub: 'Tìm hiểu nghề & Định hướng tương lai',
              desc: 'Tìm hiểu thế giới nghề nghiệp phong phú và yêu cầu của thị trường lao động; rèn luyện phẩm chất và tác phong của người lao động; đối chiếu sở trường bản thân để lựa chọn ngành học, trường học phù hợp.',
            },
          ].map((m, idx) =>
            createElement(
              Card,
              {
                key: idx,
                className: 'p-5 rounded-2xl border-stone-200 bg-white shadow-xs space-y-2',
              },
              createElement(
                'div',
                { className: 'text-xs font-bold text-teal-900 flex items-center justify-between' },
                createElement('span', null, m.title),
                createElement(Badge, { variant: 'neutral' }, m.sub),
              ),
              createElement('p', { className: 'text-xs text-stone-600 leading-relaxed' }, m.desc),
            ),
          ),
        ),
      ),

    // NỘI DUNG TAB 2: 4 LOẠI HÌNH TỔ CHỨC
    activeTab === '4-loai-hinh' &&
      createElement(
        'section',
        { id: '2-bon-loai-hinh-to-chuc', className: 'space-y-4' },
        createElement(
          'div',
          { className: 'grid gap-4 sm:grid-cols-2' },
          [
            {
              type: 'Sinh hoạt dưới cờ',
              scale: 'Toàn trường / Khối lớp',
              freq: 'Định kỳ sáng thứ Hai hàng tuần',
              desc: 'Tổ chức nghi lễ chào cờ trang nghiêm kết hợp hoạt động giáo dục theo chủ đề tuần/tháng. Do học sinh phối hợp Đoàn trường, Đội thiếu niên thiết kế và dẫn dắt (văn nghệ, kịch ngắn, tọa đàm ngắn).',
            },
            {
              type: 'Sinh hoạt lớp',
              scale: 'Tập thể từng lớp học',
              freq: 'Tiết cuối tuần',
              desc: 'Sơ kết thi đua tuần, lắng nghe tâm tư học sinh và triển khai chủ đề trải nghiệm tuần kế tiếp. Do Ban cán sự lớp chủ trì, GVCN đóng vai trò cố vấn chuyên môn.',
            },
            {
              type: 'Hoạt động giáo dục theo chủ đề',
              scale: 'Quy mô lớp, khối hoặc liên trường',
              freq: 'Theo kế hoạch năm học',
              desc: 'Các buổi chuyên đề trải nghiệm sâu (diễn đàn, hội thi, dự án, sân khấu hóa, tọa đàm với chuyên gia tâm lý hoặc doanh nhân) giúp học sinh đào sâu kiến thức và rèn luyện kỹ năng thực tế.',
            },
            {
              type: 'Hoạt động Câu lạc bộ',
              scale: 'Nhóm học sinh cùng sở thích',
              freq: 'Sau giờ học hoặc cuối tuần',
              desc: 'Môi trường rèn luyện tự nguyện: CLB STEM, Nghệ thuật, Thể thao, Truyền thông, Tiếng Anh, Tình nguyện; tạo đất diễn cho từng cá nhân bộc lộ năng khiếu.',
            },
          ].map((item, idx) =>
            createElement(
              Card,
              { key: idx, className: 'p-5 rounded-2xl border-stone-200 bg-[#faf8f2] space-y-2' },
              createElement(
                'div',
                { className: 'flex items-center justify-between' },
                createElement('h4', { className: 'text-xs font-bold text-amber-950' }, item.type),
                createElement(Badge, { variant: 'subjectSolid' }, item.scale),
              ),
              createElement(
                'div',
                { className: 'text-[11px] text-amber-800 font-semibold' },
                'Thời điểm: ',
                item.freq,
              ),
              createElement(
                'p',
                { className: 'text-xs text-stone-600 leading-relaxed' },
                item.desc,
              ),
            ),
          ),
        ),
      ),

    // NÚT HOÀN THÀNH BÀI HỌC
    createElement(LessonCompletionCard, {
      lessonId: 'gdh-c5-b2-noi-dung-va-phuong-thuc-to-chuc-hoat-dong-trai-nghiem',
      lessonTitle: 'Bài 5.2: Nội dung và Phương thức tổ chức Hoạt động trải nghiệm',
    }),
  );
};

// ============================================================================
// 3. COMPONENT BÀI 5.3: QUY TRÌNH THIẾT KẾ KẾ HOẠCH & TIẾN TRÌNH 4 BƯỚC
// ============================================================================

export const Lesson5_3View: FC = () => {
  return createElement(
    'div',
    { className: 'space-y-8 text-stone-800 leading-relaxed' },

    // Header & CLO
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
          'Chương 5: Tổ chức Hoạt động trải nghiệm ở trường phổ thông',
        ),
        createElement(
          'span',
          { className: 'rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-bold text-amber-900' },
          'Chuẩn đầu ra: CLO 1, CLO 3',
        ),
      ),
      createElement(
        'h2',
        { className: 'mt-3 font-serif text-2xl font-bold text-stone-900 sm:text-3xl' },
        'Bài 5.3: Quy trình thiết kế kế hoạch chủ đề HĐTN và Tiến trình 4 bước tổ chức',
      ),
      createElement(
        'p',
        { className: 'mt-2 text-sm leading-relaxed text-stone-600 sm:text-base' },
        'Nắm vững quy trình thiết kế kế hoạch giáo dục chủ đề HĐTN qua 6 bước bài bản theo Giáo trình HCMUE; làm chủ chuỗi tiến trình 4 bước tổ chức một hoạt động cụ thể: Chuyển giao nhiệm vụ -> Thực hiện nhiệm vụ -> Báo cáo, thảo luận -> Đánh giá, kết luận.',
      ),
    ),

    // PHẦN I: QUY TRÌNH 6 BƯỚC THIẾT KẾ KẾ HOẠCH CHỦ ĐỀ
    createElement(
      'section',
      { id: '1-quy-trinh-6-buoc-thiet-ke-hdtn', className: 'space-y-4' },
      createElement(
        'div',
        {
          className:
            'flex items-center gap-2 text-amber-900 font-serif font-bold text-xl border-b border-stone-200 pb-2',
        },
        createElement(FileText, { className: 'h-5 w-5 text-amber-800' }),
        createElement('h3', null, '1. Quy trình 6 Bước Thiết kế Kế hoạch Chủ đề HĐTN (HCMUE)'),
      ),
      createElement(
        'div',
        { className: 'grid gap-3 sm:grid-cols-2 lg:grid-cols-3' },
        [
          {
            step: 'Bước 1',
            title: 'Xác định chủ đề & mục tiêu',
            desc: 'Chọn tên chủ đề hấp dẫn, phù hợp lứa tuổi; xác định rõ phẩm chất và năng lực cần đạt theo chuẩn CT GDPT 2018.',
          },
          {
            step: 'Bước 2',
            title: 'Thiết kế nội dung hoạt động',
            desc: 'Lựa chọn các nội dung trải nghiệm vừa sức, hấp dẫn, gắn liền với thực tiễn đời sống của học sinh.',
          },
          {
            step: 'Bước 3',
            title: 'Lựa chọn hình thức, phương pháp',
            desc: 'Quyết định hình thức (sân khấu hóa, diễn đàn, trò chơi) và phương tiện học liệu (video, bảng phụ, phiếu khảo sát).',
          },
          {
            step: 'Bước 4',
            title: 'Chuẩn bị điều kiện tổ chức',
            desc: 'Phân công nhiệm vụ học sinh, chuẩn bị địa điểm, thiết bị âm thanh, kịch bản dẫn chương trình và kinh phí dự trù.',
          },
          {
            step: 'Bước 5',
            title: 'Thiết kế tiến trình chi tiết',
            desc: 'Xây dựng chuỗi hoạt động rõ ràng: Khởi động -> Khám phá -> Luyện tập/Thực hành -> Vận dụng thực tế.',
          },
          {
            step: 'Bước 6',
            title: 'Thiết kế công cụ đánh giá',
            desc: 'Xây dựng Rubric tiêu chí đánh giá, bảng kiểm quan sát (checklist) hoặc phiếu phản tư tự đánh giá.',
          },
        ].map((item, idx) =>
          createElement(
            Card,
            {
              key: idx,
              className: 'p-4 rounded-xl border-stone-200 bg-white shadow-xs space-y-1.5',
            },
            createElement(
              'div',
              { className: 'flex items-center gap-2' },
              createElement(Badge, { variant: 'subjectSolid' }, item.step),
              createElement('h4', { className: 'text-xs font-bold text-stone-900' }, item.title),
            ),
            createElement('p', { className: 'text-xs text-stone-600 leading-relaxed' }, item.desc),
          ),
        ),
      ),
    ),

    // PHẦN II: TIẾN TRÌNH 4 BƯỚC TỔ CHỨC HOẠT ĐỘNG
    createElement(
      'section',
      { id: '2-tien-trinh-4-buoc-to-chuc', className: 'space-y-4' },
      createElement(
        'div',
        {
          className:
            'flex items-center gap-2 text-amber-900 font-serif font-bold text-xl border-b border-stone-200 pb-2',
        },
        createElement(Compass, { className: 'h-5 w-5 text-amber-800' }),
        createElement('h3', null, '2. Chuỗi Tiến trình 4 Bước Tổ chức Một Hoạt động Cụ thể'),
      ),
      createElement(
        'div',
        { className: 'space-y-3' },
        [
          {
            num: '1',
            name: 'Chuyển giao nhiệm vụ trải nghiệm',
            detail:
              'Giáo viên giao nhiệm vụ rõ ràng, sinh động, hấp dẫn; nêu rõ sản phẩm cần đạt được (bản vẽ, bài thuyết trình, tiểu phẩm), cách thức làm việc cá nhân/nhóm và thời gian thực hiện.',
          },
          {
            num: '2',
            name: 'Thực hiện nhiệm vụ',
            detail:
              'Học sinh tích cực bắt tay vào hoạt động; giáo viên theo dõi bao quát, quan sát phát hiện khó khăn, can thiệp hỗ trợ kịp thời mà không làm thay học sinh.',
          },
          {
            num: '3',
            name: 'Báo cáo và thảo luận',
            detail:
              'Các nhóm cử đại diện báo cáo kết quả; tạo cơ hội cho các nhóm khác đặt câu hỏi phản biện, tranh luận đa chiều; giáo viên lắng nghe và gợi mở câu hỏi phản tư.',
          },
          {
            num: '4',
            name: 'Nhận xét, đánh giá và kết luận',
            detail:
              'Giáo viên chính xác hóa các nội dung thảo luận, tổng kết bài học, củng cố cảm xúc tích cực và định hướng hành động vận dụng vào đời sống hàng ngày của học sinh.',
          },
        ].map((step, idx) =>
          createElement(
            Card,
            {
              key: idx,
              className: 'p-4 rounded-xl border-stone-200 bg-[#faf8f2] flex items-start gap-3',
            },
            createElement(
              'div',
              {
                className:
                  'flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-teal-800 text-white font-bold text-xs',
              },
              step.num,
            ),
            createElement(
              'div',
              { className: 'space-y-1' },
              createElement(
                'h4',
                { className: 'font-bold text-xs sm:text-sm text-teal-950' },
                step.name,
              ),
              createElement(
                'p',
                { className: 'text-xs text-stone-600 leading-relaxed' },
                step.detail,
              ),
            ),
          ),
        ),
      ),
    ),

    // NÚT HOÀN THÀNH BÀI HỌC
    createElement(LessonCompletionCard, {
      lessonId: 'gdh-c5-b3-quy-trinh-thiet-ke-ke-hoach-chu-de-hdtn-va-tien-trinh-4-buoc',
      lessonTitle: 'Bài 5.3: Quy trình thiết kế kế hoạch chủ đề HĐTN và Tiến trình 4 bước tổ chức',
    }),
  );
};

// ============================================================================
// 4. COMPONENT BÀI 5.4: ĐÁNH GIÁ KẾT QUẢ & THỰC HÀNH KẾ HOẠCH THEO RUBRIC A.1.9
// ============================================================================

export const Lesson5_4View: FC = () => {
  return createElement(
    'div',
    { className: 'space-y-8 text-stone-800 leading-relaxed' },

    // Header & CLO
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
          'Chương 5: Tổ chức Hoạt động trải nghiệm ở trường phổ thông',
        ),
        createElement(
          'span',
          { className: 'rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-bold text-amber-900' },
          'Chuẩn đầu ra: CLO 1, CLO 3 (Đánh giá quá trình A.1.9 - 20%)',
        ),
      ),
      createElement(
        'h2',
        { className: 'mt-3 font-serif text-2xl font-bold text-stone-900 sm:text-3xl' },
        'Bài 5.4: Đánh giá kết quả HĐTN & Thực hành xây dựng Kế hoạch theo Rubric A.1.9',
      ),
      createElement(
        'p',
        { className: 'mt-2 text-sm leading-relaxed text-stone-600 sm:text-base' },
        'Nghiên cứu nguyên văn Bảng tiêu chí Rubric đánh giá bài tập thực hành HĐTN A.1.9 (Thang điểm 10) gồm 2 phần: Xây dựng kế hoạch (5.0 điểm) và Tổ chức thực hành (5.0 điểm); tham khảo Kế hoạch bài dạy mẫu chủ đề "Xây dựng tình bạn đẹp — Phòng chống bạo lực học đường" đạt chuẩn mức Tốt.',
      ),
    ),

    // PHẦN I: NGUYÊN VĂN BẢNG RUBRIC A.1.9
    createElement(
      'section',
      { id: '1-bang-rubric-a19', className: 'space-y-4' },
      createElement(
        'div',
        {
          className:
            'flex items-center gap-2 text-amber-900 font-serif font-bold text-xl border-b border-stone-200 pb-2',
        },
        createElement(Award, { className: 'h-5 w-5 text-amber-800' }),
        createElement('h3', null, '1. Bảng Tiêu chí Rubric Đánh giá Thực hành HĐTN (A.1.9 - 20%)'),
      ),
      createElement(
        'div',
        { className: 'overflow-x-auto rounded-xl border border-stone-200' },
        createElement(
          'table',
          { className: 'w-full text-left text-[15px] text-stone-800' },
          createElement(
            'thead',
            { className: 'bg-[#faf8f2] text-stone-900 font-bold border-b border-stone-200' },
            createElement(
              'tr',
              null,
              createElement(
                'th',
                { className: 'py-3 px-4 font-semibold text-stone-900' },
                'Phần & Tiêu chí đánh giá',
              ),
              createElement('th', { className: 'py-3 px-4 font-semibold text-stone-900' }, 'Điểm'),
              createElement(
                'th',
                { className: 'py-3 px-4 font-semibold text-stone-900' },
                'Yêu cầu đạt mức Tốt (Điểm tối đa)',
              ),
            ),
          ),
          createElement(
            'tbody',
            { className: 'divide-y divide-stone-100 text-stone-700' },
            createElement(
              'tr',
              { className: 'bg-stone-50 font-bold text-amber-950' },
              createElement(
                'td',
                { colSpan: 3, className: 'py-2.5 px-4' },
                'PHẦN A: XÂY DỰNG KẾ HOẠCH TỔ CHỨC HĐTN THEO CHỦ ĐỀ (5.0 ĐIỂM)',
              ),
            ),
            createElement(
              'tr',
              { className: 'hover:bg-stone-50/80 transition-colors' },
              createElement(
                'td',
                { className: 'py-3 px-4 font-semibold' },
                'Tiêu chí 1: Mục tiêu năng lực & phẩm chất',
              ),
              createElement('td', { className: 'py-3 px-4 font-bold text-amber-900' }, '2.0 điểm'),
              createElement(
                'td',
                { className: 'py-3 px-4' },
                'Nêu đầy đủ và chính xác các mục tiêu năng lực chung, năng lực đặc thù và phẩm chất chủ yếu theo CT GDPT 2018.',
              ),
            ),
            createElement(
              'tr',
              { className: 'hover:bg-stone-50/80 transition-colors' },
              createElement(
                'td',
                { className: 'py-3 px-4 font-semibold' },
                'Tiêu chí 2: Nội dung giáo dục',
              ),
              createElement('td', { className: 'py-3 px-4 font-bold text-amber-900' }, '1.0 điểm'),
              createElement(
                'td',
                { className: 'py-3 px-4' },
                'Liệt kê đầy đủ, phù hợp các nội dung giáo dục thiết thực, gắn liền với mạch chủ đề và lứa tuổi.',
              ),
            ),
            createElement(
              'tr',
              { className: 'hover:bg-stone-50/80 transition-colors' },
              createElement(
                'td',
                { className: 'py-3 px-4 font-semibold' },
                'Tiêu chí 3: Thiết kế chuỗi hoạt động',
              ),
              createElement('td', { className: 'py-3 px-4 font-bold text-amber-900' }, '3.0 điểm'),
              createElement(
                'td',
                { className: 'py-3 px-4' },
                'Mỗi hoạt động có rõ ràng mục tiêu, nội dung, sản phẩm dự kiến, cách thức tổ chức và phương tiện học liệu logic.',
              ),
            ),
            createElement(
              'tr',
              { className: 'hover:bg-stone-50/80 transition-colors' },
              createElement(
                'td',
                { className: 'py-3 px-4 font-semibold' },
                'Tiêu chí 4: Phương pháp & Công cụ đánh giá',
              ),
              createElement('td', { className: 'py-3 px-4 font-bold text-amber-900' }, '1.0 điểm'),
              createElement(
                'td',
                { className: 'py-3 px-4' },
                'Lựa chọn phương pháp và thiết kế công cụ đánh giá (rubric, bảng kiểm, phiếu phản tư) khoa học, khả thi.',
              ),
            ),
            createElement(
              'tr',
              { className: 'bg-stone-50 font-bold text-amber-950' },
              createElement(
                'td',
                { colSpan: 3, className: 'py-2.5 px-4' },
                'PHẦN B: TỔ CHỨC THỰC HÀNH HĐTN THEO CHỦ ĐỀ (5.0 ĐIỂM)',
              ),
            ),
            createElement(
              'tr',
              { className: 'hover:bg-stone-50/80 transition-colors' },
              createElement(
                'td',
                { className: 'py-3 px-4 font-semibold' },
                'Tiêu chí 5: Kỹ năng tổ chức hoạt động',
              ),
              createElement('td', { className: 'py-3 px-4 font-bold text-amber-900' }, '3.0 điểm'),
              createElement(
                'td',
                { className: 'py-3 px-4' },
                'Kỹ năng chuyển giao nhiệm vụ rõ ràng; theo dõi hỗ trợ linh hoạt; tổng hợp đánh giá kết quả sâu sắc.',
              ),
            ),
            createElement(
              'tr',
              { className: 'hover:bg-stone-50/80 transition-colors' },
              createElement(
                'td',
                { className: 'py-3 px-4 font-semibold' },
                'Tiêu chí 6: Thiết bị & Trình chiếu trực quan',
              ),
              createElement('td', { className: 'py-3 px-4 font-bold text-amber-900' }, '1.0 điểm'),
              createElement(
                'td',
                { className: 'py-3 px-4' },
                'Sử dụng thiết bị, đạo cụ, slide trình chiếu trực quan, thẩm mỹ, sáng tạo và cuốn hút học sinh.',
              ),
            ),
            createElement(
              'tr',
              { className: 'hover:bg-stone-50/80 transition-colors' },
              createElement(
                'td',
                { className: 'py-3 px-4 font-semibold' },
                'Tiêu chí 7: Tác phong sư phạm & Ngôn ngữ',
              ),
              createElement('td', { className: 'py-3 px-4 font-bold text-amber-900' }, '1.0 điểm'),
              createElement(
                'td',
                { className: 'py-3 px-4' },
                'Trang phục chỉnh tề; ngôn ngữ giao tiếp chuẩn mực, ấm áp, truyền cảm hứng và luôn tôn trọng người học.',
              ),
            ),
          ),
        ),
      ),
    ),

    // PHẦN II: KẾ HOẠCH BÀI DẠY MẪU CHUẨN RUBRIC
    createElement(
      'section',
      { id: '2-ke-hoach-mau-rubric-a19', className: 'space-y-4' },
      createElement(
        'div',
        {
          className:
            'flex items-center gap-2 text-amber-900 font-serif font-bold text-xl border-b border-stone-200 pb-2',
        },
        createElement(Lightbulb, { className: 'h-5 w-5 text-amber-800' }),
        createElement(
          'h3',
          null,
          '2. Kế hoạch Hoạt động Trải nghiệm Mẫu: "Xây dựng Tình bạn Đẹp — Phòng chống Bạo lực Học đường"',
        ),
      ),
      createElement(
        Card,
        {
          className:
            'p-6 rounded-2xl border-stone-200 bg-white shadow-xs space-y-4 text-xs sm:text-sm text-stone-700',
        },
        createElement(
          'div',
          { className: 'border-b border-stone-100 pb-3' },
          createElement(
            'div',
            { className: 'text-xs font-bold uppercase text-amber-800' },
            'Mô-đun Chủ đề Lớp 10 — Thời lượng: 2 Tiết (90 phút)',
          ),
          createElement(
            'h4',
            { className: 'text-base font-serif font-bold text-stone-900 mt-1' },
            'Kế hoạch Tổ chức Chủ đề: "XÂY DỰNG TÌNH BẠN ĐẸP — NÓI KHÔNG VỚI BẠO LỰC HỌC ĐƯỜNG"',
          ),
        ),
        createElement(
          'div',
          { className: 'space-y-2' },
          createElement(
            'h5',
            { className: 'font-bold text-teal-900 text-xs uppercase' },
            'I. Mục tiêu cần đạt',
          ),
          createElement(
            'ul',
            { className: 'list-disc pl-5 space-y-1 text-xs text-stone-600' },
            createElement(
              'li',
              null,
              createElement('strong', null, 'Phẩm chất:'),
              ' Bồi dưỡng lòng Nhân ái (thấu hiểu, chia sẻ) và tinh thần Trách nhiệm (bảo vệ bạn bè, bảo vệ môi trường trường học an toàn).',
            ),
            createElement(
              'li',
              null,
              createElement('strong', null, 'Năng lực chung:'),
              ' Giao tiếp và hợp tác (làm việc nhóm, lắng nghe không phán xét); Giải quyết vấn đề (xử lý tình huống xung đột bạn bè).',
            ),
            createElement(
              'li',
              null,
              createElement('strong', null, 'Năng lực đặc thù:'),
              ' Thích ứng với môi trường sống và thiết lập các mối quan hệ xã hội lành mạnh.',
            ),
          ),
        ),
        createElement(
          'div',
          { className: 'space-y-2' },
          createElement(
            'h5',
            { className: 'font-bold text-teal-900 text-xs uppercase' },
            'II. Chuỗi 4 Hoạt động chi tiết',
          ),
          createElement(
            'div',
            { className: 'space-y-2 text-xs' },
            createElement(
              'div',
              { className: 'p-3 rounded-xl bg-stone-50 border border-stone-200' },
              createElement(
                'span',
                { className: 'font-bold text-amber-900' },
                'Hoạt động 1: Khởi động (10 phút) — Trò chơi "Cùng chung một con thuyền": ',
              ),
              'Các nhóm 6 bạn cùng đứng trên một tấm bạt nhỏ, mỗi vòng gấp đôi bạt lại; học sinh phải ôm chặt nhau tìm cách cùng đứng vững, cảm nhận ý nghĩa của sự đùm bọc, tương trợ bạn bè.',
            ),
            createElement(
              'div',
              { className: 'p-3 rounded-xl bg-stone-50 border border-stone-200' },
              createElement(
                'span',
                { className: 'font-bold text-amber-900' },
                'Hoạt động 2: Khám phá (25 phút) — Diễn đàn "Những tổn thương thầm kín": ',
              ),
              'Xem video ngắn phóng sự về bạo lực mạng và cô lập bạn bè; thảo luận theo 4 trạm: Dấu hiệu nhận diện, Nỗi đau của nạn nhân, Trách nhiệm của người chứng kiến và Pháp luật về bạo lực học đường.',
            ),
            createElement(
              'div',
              { className: 'p-3 rounded-xl bg-stone-50 border border-stone-200' },
              createElement(
                'span',
                { className: 'font-bold text-amber-900' },
                'Hoạt động 3: Luyện tập (35 phút) — Đóng vai xử lý tình huống xung đột: ',
              ),
              'Mỗi tổ bốc thăm 1 tình huống (bị cô lập, bị nói xấu trên mạng, bị chặn đường xin tiền) và thực hành giải quyết theo quy tắc 3K (Không im lặng - Không trả thù - Kịp thời tìm kiếm trợ giúp từ thầy cô).',
            ),
            createElement(
              'div',
              { className: 'p-3 rounded-xl bg-stone-50 border border-stone-200' },
              createElement(
                'span',
                { className: 'font-bold text-amber-900' },
                'Hoạt động 4: Vận dụng (20 phút) — Cây cam kết tình bạn: ',
              ),
              'Mỗi học sinh viết một lời chúc hoặc một lời xin lỗi chân thành lên chiếc lá giấy dán lên "Cây Tình Bạn Lớp 10A" đặt ở cuối lớp.',
            ),
          ),
        ),
        createElement(
          'div',
          { className: 'space-y-2' },
          createElement(
            'h5',
            { className: 'font-bold text-teal-900 text-xs uppercase' },
            'III. Công cụ Đánh giá',
          ),
          createElement(
            'p',
            { className: 'text-xs text-stone-600' },
            'Sử dụng Bảng kiểm quan sát (Checklist) mức độ tham gia thảo luận và Phiếu tự đánh giá cảm xúc cá nhân sau hoạt động.',
          ),
        ),
      ),
    ),

    // NÚT HOÀN THÀNH BÀI HỌC
    createElement(LessonCompletionCard, {
      lessonId: 'gdh-c5-b4-danh-gia-ket-qua-hdtn-va-thuc-hanh-xay-dung-ke-hoach-rubric-a19',
      lessonTitle: 'Bài 5.4: Đánh giá kết quả HĐTN & Thực hành xây dựng Kế hoạch theo Rubric A.1.9',
    }),
  );
};

// ============================================================================
// 5. DISPATCHER TRÌNH NẠP BÀI HỌC CHƯƠNG 5 (GETCHAPTER5LESSONMODULE)
// ============================================================================

export function getChapter5LessonModule(lessonId: string): CompiledLessonModule | null {
  if (lessonId === 'gdh-c5-b1-khai-niem-ban-chat-va-muc-tieu-hoat-dong-trai-nghiem') {
    return {
      default: Lesson5_1View,
      frontmatter: {
        title: 'Bài 5.1: Khái niệm, Bản chất và Mục tiêu của Hoạt động trải nghiệm',
        description:
          'Định vị hoạt động giáo dục bắt buộc theo CT GDPT 2018 (105 tiết/năm); Chu trình 4 bước học tập qua trải nghiệm David Kolb; mục tiêu phân tầng 3 cấp học.',
        level: 'basic',
        tags: ['HĐTN', 'CT GDPT 2018', 'Chu trình Kolb', 'Mục tiêu 3 cấp học', 'CLO 1', 'CLO 2'],
      },
      lessonMeta: {
        chapterNumber: 5,
        lessonNumber: 1,
        headings: [
          {
            id: '1-khai-niem-vi-tri-hdtn',
            text: '1. Khái niệm và Vị thế Pháp lý theo Chương trình GDPT 2018',
            depth: 2,
          },
          {
            id: '2-ban-chat-chu-trinh-kolb',
            text: '2. Bản chất Giáo dục qua Trải nghiệm: Chu trình 4 Bước của David Kolb',
            depth: 2,
          },
          {
            id: '3-muc-tieu-phan-tang-cap-hoc',
            text: '3. Mục tiêu Cốt lõi Phân tầng theo Ba Cấp học',
            depth: 2,
          },
        ],
        blocks: [],
      },
    };
  }

  if (lessonId === 'gdh-c5-b2-noi-dung-va-phuong-thuc-to-chuc-hoat-dong-trai-nghiem') {
    return {
      default: Lesson5_2View,
      frontmatter: {
        title: 'Bài 5.2: Nội dung và Phương thức tổ chức Hoạt động trải nghiệm',
        description:
          'Bốn mạch nội dung xuyên suốt và 4 loại hình tổ chức cơ bản trong nhà trường phổ thông (Sinh hoạt dưới cờ, Sinh hoạt lớp, HĐGD theo chủ đề, CLB).',
        level: 'basic',
        tags: [
          '4 Mạch nội dung',
          '4 Loại hình tổ chức',
          'Sinh hoạt dưới cờ',
          'Sinh hoạt lớp',
          'CLO 1',
          'CLO 2',
        ],
      },
      lessonMeta: {
        chapterNumber: 5,
        lessonNumber: 2,
        headings: [
          {
            id: '1-bon-mach-noi-dung',
            text: 'Bốn Mạch Nội dung Xuyên suốt',
            depth: 2,
          },
          {
            id: '2-bon-loai-hinh-to-chuc',
            text: 'Bốn Loại hình Tổ chức Cơ bản',
            depth: 2,
          },
        ],
        blocks: [],
      },
    };
  }

  if (lessonId === 'gdh-c5-b3-quy-trinh-thiet-ke-ke-hoach-chu-de-hdtn-va-tien-trinh-4-buoc') {
    return {
      default: Lesson5_3View,
      frontmatter: {
        title: 'Bài 5.3: Quy trình thiết kế kế hoạch chủ đề HĐTN và Tiến trình 4 bước tổ chức',
        description:
          'Quy trình 6 bước thiết kế kế hoạch giáo dục chủ đề HĐTN theo chuẩn HCMUE; cấu trúc tiến trình 4 bước tổ chức hoạt động cụ thể.',
        level: 'intermediate',
        tags: ['Quy trình 6 bước', 'Tiến trình 4 bước', 'Thiết kế chủ đề', 'CLO 1', 'CLO 3'],
      },
      lessonMeta: {
        chapterNumber: 5,
        lessonNumber: 3,
        headings: [
          {
            id: '1-quy-trinh-6-buoc-thiet-ke-hdtn',
            text: '1. Quy trình 6 Bước Thiết kế Kế hoạch Chủ đề HĐTN (HCMUE)',
            depth: 2,
          },
          {
            id: '2-tien-trinh-4-buoc-to-chuc',
            text: '2. Chuỗi Tiến trình 4 Bước Tổ chức Một Hoạt động Cụ thể',
            depth: 2,
          },
        ],
        blocks: [],
      },
    };
  }

  if (lessonId === 'gdh-c5-b4-danh-gia-ket-qua-hdtn-va-thuc-hanh-xay-dung-ke-hoach-rubric-a19') {
    return {
      default: Lesson5_4View,
      frontmatter: {
        title: 'Bài 5.4: Đánh giá kết quả HĐTN & Thực hành xây dựng Kế hoạch theo Rubric A.1.9',
        description:
          'Bảng tiêu chí Rubric đánh giá bài tập thực hành HĐTN A.1.9 (20%); Kế hoạch bài dạy chủ đề "Xây dựng tình bạn đẹp — Phòng chống bạo lực học đường" chuẩn mức Tốt.',
        level: 'advanced',
        tags: [
          'Rubric A.1.9',
          'Kế hoạch bài dạy mẫu',
          'Bạo lực học đường',
          'Tình bạn đẹp',
          'CLO 1',
          'CLO 3',
        ],
      },
      lessonMeta: {
        chapterNumber: 5,
        lessonNumber: 4,
        headings: [
          {
            id: '1-bang-rubric-a19',
            text: '1. Bảng Tiêu chí Rubric Đánh giá Thực hành HĐTN (A.1.9 - 20%)',
            depth: 2,
          },
          {
            id: '2-ke-hoach-mau-rubric-a19',
            text: '2. Kế hoạch Hoạt động Trải nghiệm Mẫu: "Xây dựng Tình bạn Đẹp — Phòng chống Bạo lực Học đường"',
            depth: 2,
          },
        ],
        blocks: [],
      },
    };
  }

  return null;
}
