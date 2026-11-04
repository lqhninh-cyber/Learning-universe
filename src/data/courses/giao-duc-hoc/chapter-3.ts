import type { CompiledLessonModule } from '@/content-runtime/loader';
import { useLearningStore } from '@/features/learning';
import { CaseStudyBox, LegalQuoteCard, PrincipleMatrix, ScholarQuote } from '@/features/pedagogy';
import { Badge, Button, Card } from '@/shared/ui';
import {
  Award,
  Building,
  CheckCircle2,
  Compass,
  GraduationCap,
  Heart,
  Layers,
  Lightbulb,
  Scale,
  ShieldCheck,
  Sparkles,
  Target,
  Users,
} from 'lucide-react';
import { createElement, useState, type FC } from 'react';
import type { PedagogicalCaseStudy } from './course';

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
// 1. COMPONENT BÀI 3.1: CƠ CẤU TỔ CHỨC TRƯỜNG PHỔ THÔNG & HĐGD
// ============================================================================

export const Lesson3_1View: FC = () => {
  const [selectedUnit, setSelectedUnit] = useState<string>('bgh');

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
          'Chương 3: Những vấn đề chung về Hoạt động giáo dục ở trường phổ thông',
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
        'Bài 3.1: Cơ cấu tổ chức trường phổ thông & Khái niệm Hoạt động giáo dục',
      ),
      createElement(
        'p',
        { className: 'mt-2 text-sm leading-relaxed text-stone-600 sm:text-base' },
        'Tìm hiểu bộ máy tổ chức nhà trường theo Điều lệ trường trung học (Thông tư 32/2020/TT-BGDĐT), phân tích cấu trúc hệ thống 6 thành tố và 4 đặc điểm cốt lõi của hoạt động giáo dục trong trường phổ thông hiện đại.',
      ),
    ),

    // PHẦN I: CƠ CẤU TỔ CHỨC THEO THÔNG TƯ 32/2020
    createElement(
      'section',
      { id: '1-co-cau-to-chuc-nha-truong', className: 'space-y-4' },
      createElement(
        'div',
        {
          className:
            'flex items-center gap-2 text-amber-900 font-serif font-bold text-xl border-b border-stone-200 pb-2',
        },
        createElement(Building, { className: 'h-5 w-5 text-amber-800' }),
        createElement('h3', null, '1. Cơ cấu Tổ chức Nhà trường theo Thông tư 32/2020/TT-BGDĐT'),
      ),
      createElement(LegalQuoteCard, {
        lawTitle: 'Điều lệ trường trung học cơ sở, trường trung học phổ thông',
        article: 'Thông tư số 32/2020/TT-BGDĐT (Ban hành ngày 15/9/2020)',
        quote:
          'Cơ cấu tổ chức trường trung học gồm: Hội đồng trường; Hiệu trưởng và các Phó Hiệu trưởng; Hội đồng thi đua khen thưởng, Hội đồng kỷ luật, Hội đồng tư vấn; Tổ chuyên môn; Tổ văn phòng; Tổ chức Đảng Cộng sản Việt Nam; Công đoàn, Đoàn TNCS Hồ Chí Minh, Đội TNTP Hồ Chí Minh; Lớp học và các tổ chức tự quản của học sinh.',
        source: 'Bộ Giáo dục và Đào tạo, có hiệu lực từ ngày 01/11/2020',
        sourceUrl: '/docs/giao-duc-hoc/Dieu_le_truong_trung_hoc_TT32.pdf',
        significance:
          'Khung pháp lý chuẩn xác quy định quyền hạn, trách nhiệm và mối quan hệ cộng tác giữa các bộ phận trong nhà trường trung học.',
      }),

      // Sơ đồ tương tác bộ máy tổ chức
      createElement(
        'div',
        { className: 'grid gap-2 sm:grid-cols-4' },
        [
          { id: 'bgh', title: 'Ban Giám hiệu', role: 'Lãnh đạo, quản lý toàn diện' },
          { id: 'hdt', title: 'Hội đồng trường', role: 'Cơ quan quản trị chiến lược' },
          { id: 'tcm', title: 'Tổ Chuyên môn', role: 'Sinh hoạt nghiệp vụ dạy học' },
          { id: 'doan-doi', title: 'Đoàn - Đội & Tự quản', role: 'Phong trào & Tự rèn luyện' },
        ].map((unit) =>
          createElement(
            'button',
            {
              key: unit.id,
              type: 'button',
              onClick: () => setSelectedUnit(unit.id),
              className: `p-3.5 rounded-xl border text-left transition-all ${
                selectedUnit === unit.id
                  ? 'border-amber-800 bg-amber-50/80 shadow-2xs ring-1 ring-amber-800'
                  : 'border-stone-200 bg-white hover:border-stone-300'
              }`,
            },
            createElement('div', { className: 'text-xs font-bold text-stone-900' }, unit.title),
            createElement(
              'div',
              { className: 'mt-1 text-[11px] text-stone-500 font-medium' },
              unit.role,
            ),
          ),
        ),
      ),

      // Chi tiết bộ phận
      createElement(
        Card,
        { className: 'p-5 rounded-2xl border-stone-200 bg-white shadow-xs' },
        selectedUnit === 'bgh' &&
          createElement(
            'div',
            { className: 'space-y-2' },
            createElement(
              'h4',
              { className: 'font-bold text-sm text-amber-950' },
              'Hiệu trưởng & Phó Hiệu trưởng (Điều 11 Điều lệ)',
            ),
            createElement(
              'p',
              { className: 'text-xs sm:text-sm text-stone-700' },
              'Hiệu trưởng là người chịu trách nhiệm quản lý, điều hành các hoạt động và bảo đảm chất lượng giáo dục của nhà trường; bổ nhiệm các tổ trưởng chuyên môn, phê duyệt kế hoạch giáo dục nhà trường, ký học bạ và quyết định khen thưởng, kỷ luật học sinh theo quy định.',
            ),
          ),
        selectedUnit === 'hdt' &&
          createElement(
            'div',
            { className: 'space-y-2' },
            createElement(
              'h4',
              { className: 'font-bold text-sm text-amber-950' },
              'Hội đồng trường (Điều 10 Điều lệ)',
            ),
            createElement(
              'p',
              { className: 'text-xs sm:text-sm text-stone-700' },
              'Cơ quan quản trị nhà trường, quyết định mục tiêu, chiến lược, dự án, kế hoạch phát triển của nhà trường; giám sát các hoạt động tuyển sinh, tài chính, nhân sự và việc thực hiện các nghị quyết của Hội đồng trường.',
            ),
          ),
        selectedUnit === 'tcm' &&
          createElement(
            'div',
            { className: 'space-y-2' },
            createElement(
              'h4',
              { className: 'font-bold text-sm text-amber-950' },
              'Tổ chuyên môn & Giáo viên bộ môn (Điều 14 Điều lệ)',
            ),
            createElement(
              'p',
              { className: 'text-xs sm:text-sm text-stone-700' },
              'Gồm các giáo viên cùng môn học hoặc nhóm môn học. Sinh hoạt chuyên môn định kỳ ít nhất 2 tuần/lần để xây dựng kế hoạch dạy học, nghiên cứu bài học (Lesson Study), đổi mới phương pháp và kiểm tra đánh giá theo hướng phát triển năng lực học sinh.',
            ),
          ),
        selectedUnit === 'doan-doi' &&
          createElement(
            'div',
            { className: 'space-y-2' },
            createElement(
              'h4',
              { className: 'font-bold text-sm text-amber-950' },
              'Đoàn TNCS HCM, Đội TNTP HCM & Ban cán sự lớp (Điều 17 Điều lệ)',
            ),
            createElement(
              'p',
              { className: 'text-xs sm:text-sm text-stone-700' },
              'Tổ chức nòng cốt tập hợp học sinh, phát huy quyền làm chủ và tinh thần tự quản. Thông qua các phong trào thi đua, hoạt động tình nguyện, câu lạc bộ sở thích để rèn luyện kỹ năng mềm và tinh thần đoàn kết.',
            ),
          ),
      ),
    ),

    // PHẦN II: CẤU TRÚC HỆ THỐNG CỦA HOẠT ĐỘNG GIÁO DỤC
    createElement(
      'section',
      { id: '2-cau-truc-he-thong-hdgd', className: 'space-y-4' },
      createElement(
        'div',
        {
          className:
            'flex items-center gap-2 text-amber-900 font-serif font-bold text-xl border-b border-stone-200 pb-2',
        },
        createElement(Layers, { className: 'h-5 w-5 text-amber-800' }),
        createElement('h3', null, '2. Cấu trúc Hệ thống 6 Thành tố của Hoạt động Giáo dục'),
      ),
      createElement(
        'p',
        null,
        'Hoạt động giáo dục (HĐGD) là một hệ thống toàn vẹn, vận động không ngừng và được cấu thành bởi 6 thành tố có mối quan hệ tương hỗ chặt chẽ:',
      ),
      createElement(
        'div',
        { className: 'grid gap-3 sm:grid-cols-2 lg:grid-cols-3' },
        [
          {
            num: '1',
            title: 'Chủ thể giáo dục',
            desc: 'Người giáo viên, nhà giáo dục giữ vai trò chủ đạo, định hướng, thiết kế và điều phối các tác động sư phạm.',
          },
          {
            num: '2',
            title: 'Khách thể / Đối tượng',
            desc: 'Học sinh, tập thể lớp — vừa là đối tượng thụ hưởng giáo dục, vừa là chủ thể tích cực tự giáo dục chính mình.',
          },
          {
            num: '3',
            title: 'Mục tiêu giáo dục',
            desc: 'Mô hình chuẩn nhân cách (phẩm chất và năng lực) cần hình thành ở học sinh theo từng giai đoạn phát triển.',
          },
          {
            num: '4',
            title: 'Nội dung giáo dục',
            desc: 'Hệ thống chuẩn mực đạo đức, pháp luật, giá trị thẩm mỹ, kỹ năng sống và văn hóa ứng xử được chọn lọc khoa học.',
          },
          {
            num: '5',
            title: 'Phương pháp & Phương tiện',
            desc: 'Cách thức tương tác phối hợp giữa thầy và trò cùng các công cụ, phương tiện kỹ thuật hỗ trợ giáo dục.',
          },
          {
            num: '6',
            title: 'Kết quả giáo dục',
            desc: 'Mức độ biến đổi về phẩm chất, năng lực và hành vi thực tế của học sinh sau quá trình tác động giáo dục.',
          },
        ].map((item) =>
          createElement(
            Card,
            { key: item.num, className: 'p-4 rounded-xl border-stone-200 bg-[#faf8f2]' },
            createElement(
              'div',
              { className: 'flex items-center gap-2 font-bold text-xs text-amber-900' },
              createElement(
                'span',
                {
                  className:
                    'flex h-5 w-5 items-center justify-center rounded-full bg-amber-800 text-white text-[10px]',
                },
                item.num,
              ),
              createElement('span', null, item.title),
            ),
            createElement(
              'p',
              { className: 'mt-2 text-xs leading-relaxed text-stone-600' },
              item.desc,
            ),
          ),
        ),
      ),
    ),

    // PHẦN III: 4 ĐẶC ĐIỂM CỦA HĐGD Ở TRƯỜNG PHỔ THÔNG
    createElement(
      'section',
      { id: '3-bon-dac-diem-hdgd', className: 'space-y-4' },
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
          '3. Bốn Đặc điểm Cốt lõi của Hoạt động Giáo dục ở Trường Phổ thông',
        ),
      ),
      createElement(
        'div',
        { className: 'space-y-3' },
        [
          {
            title: 'Đặc điểm 1: Có tính mục đích sâu sắc',
            content:
              'Mọi hoạt động (từ tiết chào cờ, giờ sinh hoạt lớp đến chuyến đi trải nghiệm) không bao giờ diễn ra tự phát mà đều nhằm phục vụ mục tiêu chuẩn hóa phẩm chất và năng lực của học sinh.',
          },
          {
            title: 'Đặc điểm 2: Là một quá trình phức hợp, lâu dài và liên tục',
            content:
              'Sự hình thành nhân cách không thể diễn ra trong "một sớm một chiều" mà đòi hỏi sự tích lũy bền bỉ về lượng để dẫn tới chuyển hóa về chất. Những biến chuyển đạo đức cần thời gian thử thách trong đời sống thực tế.',
          },
          {
            title: 'Đặc điểm 3: Mang tính cá biệt hóa cao',
            content:
              'Mỗi học sinh phổ thông có một cá tính, hoàn cảnh sống gia đình, nhịp độ tâm lý và tổn thương tâm lý riêng. Người thầy không thể dùng một khuôn mẫu cứng nhắc để giáo dục cho tất cả.',
          },
          {
            title: 'Đặc điểm 4: Thống nhất biện chứng giữa dạy học, trải nghiệm và tự giáo dục',
            content:
              'Dạy học cung cấp tri thức cơ sở, hoạt động trải nghiệm tạo môi trường kiểm nghiệm và biến tri thức thành niềm tin, còn tự giáo dục là đích đến tối hậu của quá trình phát triển nhân cách.',
          },
        ].map((feat, idx) =>
          createElement(
            Card,
            { key: idx, className: 'p-4 rounded-xl border-stone-200 bg-white' },
            createElement(
              'div',
              { className: 'font-bold text-xs sm:text-sm text-teal-900 flex items-center gap-2' },
              createElement(CheckCircle2, { className: 'h-4 w-4 text-teal-700' }),
              createElement('span', null, feat.title),
            ),
            createElement(
              'p',
              { className: 'mt-1.5 text-xs sm:text-sm text-stone-600 pl-6' },
              feat.content,
            ),
          ),
        ),
      ),
    ),

    // NÚT HOÀN THÀNH BÀI HỌC
    createElement(LessonCompletionCard, {
      lessonId: 'gdh-c3-b1-co-cau-to-chuc-truong-pho-thong-va-khai-niem-hoat-dong-giao-duc',
      lessonTitle: 'Bài 3.1: Cơ cấu tổ chức trường phổ thông & Khái niệm hoạt động giáo dục',
    }),
  );
};

// ============================================================================
// 2. COMPONENT BÀI 3.2: HỆ THỐNG 6 NGUYÊN TẮC GIÁO DỤC HỌC SINH PHỔ THÔNG
// ============================================================================

export const Lesson3_2View: FC = () => {
  return createElement(
    'div',
    { className: 'space-y-8 text-stone-800 leading-relaxed' },

    // Khung Tiêu đề & Chuẩn đầu ra CLO 1
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
          'Chương 3: Những vấn đề chung về Hoạt động giáo dục ở trường phổ thông',
        ),
        createElement(
          'span',
          { className: 'rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-bold text-amber-900' },
          'Chuẩn đầu ra: CLO 1 (Trọng tâm thực hành)',
        ),
      ),
      createElement(
        'h2',
        { className: 'mt-3 font-serif text-2xl font-bold text-stone-900 sm:text-3xl' },
        'Bài 3.2: Hệ thống 6 Nguyên tắc Giáo dục học sinh phổ thông',
      ),
      createElement(
        'p',
        { className: 'mt-2 text-sm leading-relaxed text-stone-600 sm:text-base' },
        'Khám phá hệ thống 6 nguyên tắc giáo dục nền tảng qua ma trận tra cứu tương tác chuyên sâu: từ cơ sở khoa học, yêu cầu sư phạm thực thi đến các bẫy sai lầm thực tế học đường theo Giáo trình Giáo dục học HCMUE.',
      ),
    ),

    // DANH NGÔN SƯ PHẠM
    createElement(ScholarQuote, {
      quote:
        'Càng tôn trọng con người bao nhiêu thì càng phải đòi hỏi cao ở họ bấy nhiêu. Yêu cầu càng cao bao nhiêu thì càng phải tôn trọng bấy nhiêu.',
      author: 'Anton Semyonovich Makarenko',
      title: 'Nhà giáo dục vĩ đại người Nga, bậc thầy về lý luận giáo dục tập thể',
      source: 'Bài giảng về giáo dục trẻ em, 1937',
      historicalContext:
        'Luận điểm cốt lõi tạo nên cuộc cách mạng trong sư phạm: tôn trọng là điểm tựa nhân văn, còn yêu cầu cao là động lực thôi thúc học sinh vươn lên hoàn thiện nhân cách.',
    }),

    // MA TRẬN 6 NGUYÊN TẮC GIÁO DỤC TƯƠNG TÁC
    createElement(
      'section',
      { id: '1-ma-tran-6-nguyen-tac', className: 'space-y-4' },
      createElement(
        'div',
        {
          className:
            'flex items-center gap-2 text-amber-900 font-serif font-bold text-xl border-b border-stone-200 pb-2',
        },
        createElement(Compass, { className: 'h-5 w-5 text-amber-800' }),
        createElement('h3', null, '1. Bảng Tra cứu Tương tác 6 Nguyên tắc Giáo dục'),
      ),
      createElement(PrincipleMatrix, { defaultPrincipleId: 1 }),
    ),

    // PHẦN II: TỔNG HỢP YÊU CẦU THỰC THI & LỖI SAI THƯỜNG GẶP
    createElement(
      'section',
      { id: '2-yeu-cau-va-loi-sai', className: 'space-y-4' },
      createElement(
        'div',
        {
          className:
            'flex items-center gap-2 text-amber-900 font-serif font-bold text-xl border-b border-stone-200 pb-2',
        },
        createElement(ShieldCheck, { className: 'h-5 w-5 text-amber-800' }),
        createElement(
          'h3',
          null,
          '2. Bảng Đối chiếu Nhanh: Nguyên tắc - Yêu cầu Giáo viên - Lỗi sai Cần tránh',
        ),
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
                'Nguyên tắc giáo dục',
              ),
              createElement(
                'th',
                { className: 'py-3 px-4 font-semibold text-stone-900' },
                'Yêu cầu hành động của giáo viên',
              ),
              createElement(
                'th',
                { className: 'py-3 px-4 font-semibold text-stone-900' },
                'Lỗi sai & Bẫy sư phạm thường gặp',
              ),
            ),
          ),
          createElement(
            'tbody',
            { className: 'divide-y divide-stone-100 text-stone-700' },
            createElement(
              'tr',
              { className: 'hover:bg-stone-50/80 transition-colors' },
              createElement(
                'td',
                { className: 'py-3 px-4 font-semibold text-teal-900' },
                '1. Đảm bảo tính mục đích',
              ),
              createElement(
                'td',
                { className: 'py-3 px-4' },
                'Xác định rõ ràng mục tiêu phẩm chất - năng lực cần hình thành trước khi tổ chức bất kỳ hoạt động nào.',
              ),
              createElement(
                'td',
                { className: 'py-3 px-4 text-rose-700' },
                'Chạy theo phong trào hình thức, vui chơi giải trí đơn thuần, quên mất mục tiêu rèn người.',
              ),
            ),
            createElement(
              'tr',
              { className: 'hover:bg-stone-50/80 transition-colors' },
              createElement(
                'td',
                { className: 'py-3 px-4 font-semibold text-teal-900' },
                '2. Gắn với thực tiễn',
              ),
              createElement(
                'td',
                { className: 'py-3 px-4' },
                'Gắn bài học đạo đức với các vấn đề thời sự, đời sống gia đình và thực tiễn địa phương.',
              ),
              createElement(
                'td',
                { className: 'py-3 px-4 text-rose-700' },
                'Thuyết giảng lý thuyết suông, giáo điều, xa rời mối bận tâm thực tế của học sinh.',
              ),
            ),
            createElement(
              'tr',
              { className: 'hover:bg-stone-50/80 transition-colors' },
              createElement(
                'td',
                { className: 'py-3 px-4 font-semibold text-teal-900' },
                '3. Giáo dục trong & bằng tập thể',
              ),
              createElement(
                'td',
                { className: 'py-3 px-4' },
                'Xây dựng dư luận tập thể lành mạnh; phát huy vai trò tự quản của ban cán sự lớp.',
              ),
              createElement(
                'td',
                { className: 'py-3 px-4 text-rose-700' },
                'Giáo viên bao biện làm thay, hoặc lợi dụng tập thể để gây áp lực trừng phạt, cô lập cá nhân.',
              ),
            ),
            createElement(
              'tr',
              { className: 'hover:bg-stone-50/80 transition-colors' },
              createElement(
                'td',
                { className: 'py-3 px-4 font-semibold text-teal-900' },
                '4. Tôn trọng nhân cách & Yêu cầu cao',
              ),
              createElement(
                'td',
                { className: 'py-3 px-4' },
                'Bảo vệ lòng tự trọng học sinh, tin tưởng sự tiến bộ; đưa ra đòi hỏi nhất quán, công bằng.',
              ),
              createElement(
                'td',
                { className: 'py-3 px-4 text-rose-700' },
                'Dễ dãi buông lỏng hoặc xúc phạm danh dự, miệt thị học sinh trước đám đông.',
              ),
            ),
            createElement(
              'tr',
              { className: 'hover:bg-stone-50/80 transition-colors' },
              createElement(
                'td',
                { className: 'py-3 px-4 font-semibold text-teal-900' },
                '5. Phù hợp lứa tuổi & Cá biệt hóa',
              ),
              createElement(
                'td',
                { className: 'py-3 px-4' },
                'Nắm bắt đặc điểm tâm lý lứa tuổi dậy thì; tìm hiểu hoàn cảnh riêng của từng em có khó khăn.',
              ),
              createElement(
                'td',
                { className: 'py-3 px-4 text-rose-700' },
                'Áp dụng một công thức giáo dục cứng nhắc, rập khuôn cho tất cả mọi học sinh.',
              ),
            ),
            createElement(
              'tr',
              { className: 'hover:bg-stone-50/80 transition-colors' },
              createElement(
                'td',
                { className: 'py-3 px-4 font-semibold text-teal-900' },
                '6. Hệ thống & Liên tục',
              ),
              createElement(
                'td',
                { className: 'py-3 px-4' },
                'Kiên trì củng cố các thói quen hành vi tốt xuyên suốt năm học và giữa các cấp học.',
              ),
              createElement(
                'td',
                { className: 'py-3 px-4 text-rose-700' },
                'Làm việc tùy tiện, "đánh trống bỏ dùi", trống đánh xuôi kèn thổi ngược với gia đình.',
              ),
            ),
          ),
        ),
      ),
    ),

    // NÚT HOÀN THÀNH BÀI HỌC
    createElement(LessonCompletionCard, {
      lessonId: 'gdh-c3-b2-he-thong-6-nguyen-tac-giao-duc-hoc-sinh-pho-thong',
      lessonTitle: 'Bài 3.2: Hệ thống 6 Nguyên tắc giáo dục học sinh phổ thông',
    }),
  );
};

// ============================================================================
// 3. COMPONENT BÀI 3.3: MỤC TIÊU PHẨM CHẤT - NĂNG LỰC & PHƯƠNG PHÁP GD
// ============================================================================

export const Lesson3_3View: FC = () => {
  const [selectedQuality, setSelectedQuality] = useState<string>('yeu-nuoc');

  // Case study: Xử lý học sinh vi phạm kỷ luật chơi game bằng Tôn trọng & Kỷ luật tích cực
  const caseStudyPositiveDiscipline: PedagogicalCaseStudy = {
    id: 102,
    title: 'Học sinh lén chơi game trong giờ học và có phản ứng cộc cằn khi bị nhắc nhở',
    context:
      'Trong tiết học môn Toán, giáo viên phát hiện em K. (học sinh lớp 11) giấu điện thoại dưới ngăn bàn để chơi game online cùng bạn. Khi giáo viên bước xuống đứng cạnh và yêu cầu nhẹ nhàng: "K. cất điện thoại vào cặp và mở sách bài tập trang 45", K. giật mình tắt máy nhưng tỏ vẻ càu nhàu, đập mạnh cuốn sách xuống bàn và nói lẩm bẩm: "Người ta vừa vào trận dở, suốt ngày soi mói!". Cả lớp quay lại nhìn K. với ánh mắt sững sờ.',
    question:
      'Vận dụng nguyên tắc "Tôn trọng nhân cách kết hợp yêu cầu hợp lý" và phương pháp "Kỷ luật tích cực", thầy/cô sẽ xử lý tình huống này như thế nào ngay trong tiết học và sau giờ học?',
    principlesApplied: [
      'Nguyên tắc tôn trọng nhân cách kết hợp yêu cầu cao',
      'Phương pháp kỷ luật tích cực (thay thế trừng phạt, tập trung vào hậu quả logic)',
      'Nghệ thuật kiểm soát cảm xúc sư phạm & bảo vệ uy tín lớp học',
    ],
    solutionSteps: [
      {
        step: 1,
        title: 'Giữ thái độ điềm tĩnh tuyệt đối & Không phản ứng gay gắt tức thì',
        content:
          'Giáo viên không nổi giận giật lấy điện thoại hay lớn tiếng mắng mỏ "Em vô lễ, mất dạy!", vì hành động đó sẽ biến xung đột thành cuộc chạm trán tay đôi trước mặt cả lớp.',
      },
      {
        step: 2,
        title: 'Xác lập ranh giới kỷ cương ngay tại lớp',
        content:
          'Nhìn thẳng vào K. với ánh mắt nghiêm nghị nhưng bình tĩnh: "Quy định lớp học là không sử dụng điện thoại vào việc riêng trong giờ học. Việc em đập bàn và có thái độ vừa rồi là chưa đúng mực. Bây giờ cả lớp tiếp tục hoàn thành bài tập, cuối giờ cô/thầy và em sẽ làm việc riêng về vấn đề này." Sau đó chuyển trọng tâm bài giảng sang cả lớp.',
      },
      {
        step: 3,
        title: 'Gặp gỡ riêng sau tiết học & Lắng nghe em giãi bày',
        content:
          'Cuối buổi, giữ K. ở lại phòng chờ giáo viên. Bắt đầu bằng câu hỏi nhẹ nhàng: "Cô/thầy nhận thấy hôm nay em có vẻ căng thẳng hoặc có điều gì bực bội phải không?". Để K. tự nói ra sự bức bối của mình trước khi đi vào phân tích vi phạm.',
      },
      {
        step: 4,
        title: 'Áp dụng hậu quả logic thay cho trừng phạt hạ nhục',
        content:
          'Phân tích cho K. hiểu: Việc chơi game không chỉ ảnh hưởng đến kết quả của em mà còn thể hiện sự thiếu tôn trọng công sức của thầy cô và bạn bè. Đưa ra thỏa thuận: K. cam kết tự giác gửi điện thoại vào hộp bảo quản đầu giờ và hoàn thành bù phần bài tập bị bỏ lỡ trên lớp.',
      },
      {
        step: 5,
        title: 'Theo dõi và khích lệ sự phục hồi hành vi',
        content:
          'Trong các tiết học sau, chủ động gọi K. lên phát biểu những câu hỏi vừa sức và dành lời khen ngợi chân thành khi em tập trung, giúp em lấy lại động lực và tự tin.',
      },
    ],
    pitfallsToAvoid: [
      'Tịch thu điện thoại rồi tự ý mở đọc tin nhắn riêng tư của học sinh (vi phạm quyền riêng tư).',
      'Đuổi học sinh ra khỏi lớp đứng hành lang làm bẽ mặt em.',
      'Bỏ qua cho xong chuyện khiến những học sinh khác bắt chước vi phạm.',
    ],
    coreLesson:
      'Kỷ luật tích cực không phải là sự nhu nhược bỏ qua khuyết điểm, mà là sự kiên quyết bằng tình yêu thương và sự tôn trọng nhân phẩm.',
  };

  return createElement(
    'div',
    { className: 'space-y-8 text-stone-800 leading-relaxed' },

    // Khung Tiêu đề & Chuẩn đầu ra CLO 1
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
          'Chương 3: Những vấn đề chung về Hoạt động giáo dục ở trường phổ thông',
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
        'Bài 3.3: Mục tiêu Phẩm chất - Năng lực và Phương pháp giáo dục theo CT GDPT 2018',
      ),
      createElement(
        'p',
        { className: 'mt-2 text-sm leading-relaxed text-stone-600 sm:text-base' },
        'Nắm vững ma trận 5 phẩm chất chủ yếu và 10 năng lực cốt lõi theo Chương trình GDPT 2018; phân loại các nhóm phương pháp giáo dục phổ biến, chuyên đề Kỷ luật tích cực và giải quyết tình huống sư phạm thực chiến.',
      ),
    ),

    // PHẦN I: MA TRẬN 5 PHẨM CHẤT CHỦ YẾU
    createElement(
      'section',
      { id: '1-nam-pham-chat-chu-yeu', className: 'space-y-4' },
      createElement(
        'div',
        {
          className:
            'flex items-center gap-2 text-amber-900 font-serif font-bold text-xl border-b border-stone-200 pb-2',
        },
        createElement(Award, { className: 'h-5 w-5 text-amber-800' }),
        createElement('h3', null, '1. Khung 5 Phẩm chất Chủ yếu của Học sinh (CT GDPT 2018)'),
      ),
      createElement(
        'p',
        null,
        'Chương trình Giáo dục phổ thông 2018 chuyển đổi căn bản từ truyền thụ kiến thức sang hình thành và phát triển toàn diện ',
        createElement('strong', { className: 'text-stone-900' }, '5 Phẩm chất chủ yếu'),
        ':',
      ),

      // Tab chọn 5 phẩm chất
      createElement(
        'div',
        { className: 'grid grid-cols-2 gap-2 sm:grid-cols-5' },
        [
          { id: 'yeu-nuoc', name: 'Yêu nước', icon: Heart },
          { id: 'nhan-ai', name: 'Nhân ái', icon: Users },
          { id: 'cham-chi', name: 'Chăm chỉ', icon: Sparkles },
          { id: 'trung-thuc', name: 'Trung thực', icon: Scale },
          { id: 'trach-nhiem', name: 'Trách nhiệm', icon: ShieldCheck },
        ].map((q) =>
          createElement(
            'button',
            {
              key: q.id,
              type: 'button',
              onClick: () => setSelectedQuality(q.id),
              className: `p-3 rounded-xl border text-center transition-all ${
                selectedQuality === q.id
                  ? 'border-amber-800 bg-amber-50/80 font-bold text-amber-950 shadow-2xs'
                  : 'border-stone-200 bg-white text-stone-600 hover:border-stone-300'
              }`,
            },
            createElement(q.icon, {
              className: `h-4 w-4 mx-auto mb-1 ${
                selectedQuality === q.id ? 'text-amber-800' : 'text-stone-400'
              }`,
            }),
            createElement('div', { className: 'text-xs' }, q.name),
          ),
        ),
      ),

      // Khung mô tả chi tiết phẩm chất
      createElement(
        Card,
        { className: 'p-5 rounded-2xl border-stone-200 bg-white shadow-xs' },
        selectedQuality === 'yeu-nuoc' &&
          createElement(
            'div',
            { className: 'space-y-2' },
            createElement(
              'h4',
              { className: 'font-bold text-sm text-teal-900' },
              'Phẩm chất 1: Yêu nước',
            ),
            createElement(
              'p',
              { className: 'text-xs sm:text-sm text-stone-700' },
              'Yêu quê hương đất nước, tự hào về truyền thống vẻ vang của dân tộc; có ý thức bảo vệ di sản thiên nhiên và văn hóa; tôn trọng quốc kỳ, quốc ca; tích cực tham gia các hoạt động xây dựng và bảo vệ Tổ quốc.',
            ),
          ),
        selectedQuality === 'nhan-ai' &&
          createElement(
            'div',
            { className: 'space-y-2' },
            createElement(
              'h4',
              { className: 'font-bold text-sm text-teal-900' },
              'Phẩm chất 2: Nhân ái',
            ),
            createElement(
              'p',
              { className: 'text-xs sm:text-sm text-stone-700' },
              'Yêu quý mọi người, không phân biệt đối xử; tôn trọng sự khác biệt về văn hóa, hoàn cảnh; sẵn sàng chia sẻ, giúp đỡ người gặp khó khăn; kiên quyết chống lại bạo lực học đường.',
            ),
          ),
        selectedQuality === 'cham-chi' &&
          createElement(
            'div',
            { className: 'space-y-2' },
            createElement(
              'h4',
              { className: 'font-bold text-sm text-teal-900' },
              'Phẩm chất 3: Chăm chỉ',
            ),
            createElement(
              'p',
              { className: 'text-xs sm:text-sm text-stone-700' },
              'Luôn cố gắng vươn lên đạt kết quả tốt trong học tập; có ý thức tự học, tự đọc sách; yêu lao động, tích cực tham gia công việc gia đình và các hoạt động lao động tập thể tại trường.',
            ),
          ),
        selectedQuality === 'trung-thuc' &&
          createElement(
            'div',
            { className: 'space-y-2' },
            createElement(
              'h4',
              { className: 'font-bold text-sm text-teal-900' },
              'Phẩm chất 4: Trung thực',
            ),
            createElement(
              'p',
              { className: 'text-xs sm:text-sm text-stone-700' },
              'Thật thà, ngay thẳng trong học tập và sinh hoạt; dũng cảm nhận lỗi và sửa sai; tôn trọng lẽ phải; không gian lận trong thi cử và kiên quyết phản đối hành vi thiếu trung thực.',
            ),
          ),
        selectedQuality === 'trach-nhiem' &&
          createElement(
            'div',
            { className: 'space-y-2' },
            createElement(
              'h4',
              { className: 'font-bold text-sm text-teal-900' },
              'Phẩm chất 5: Trách nhiệm',
            ),
            createElement(
              'p',
              { className: 'text-xs sm:text-sm text-stone-700' },
              'Có trách nhiệm với bản thân (giữ gìn vệ sinh, sức khỏe); có trách nhiệm với gia đình, nhà trường và cộng đồng; tuân thủ pháp luật và nội quy; có ý thức bảo vệ môi trường chung.',
            ),
          ),
      ),
    ),

    // PHẦN II: 10 NĂNG LỰC CỐT LÕI (3 CHUNG + 7 ĐẶC THÙ)
    createElement(
      'section',
      { id: '2-muoi-nang-luc-cot-loi', className: 'space-y-4' },
      createElement(
        'div',
        {
          className:
            'flex items-center gap-2 text-amber-900 font-serif font-bold text-xl border-b border-stone-200 pb-2',
        },
        createElement(Target, { className: 'h-5 w-5 text-amber-800' }),
        createElement(
          'h3',
          null,
          '2. Hệ thống 10 Năng lực Cốt lõi (3 Năng lực Chung & 7 Năng lực Đặc thù)',
        ),
      ),
      createElement(
        'div',
        { className: 'grid gap-4 sm:grid-cols-2' },
        createElement(
          Card,
          { className: 'p-5 rounded-2xl border-teal-900/15 bg-white shadow-xs space-y-3' },
          createElement(
            'div',
            { className: 'flex items-center gap-2 text-teal-900 font-bold text-sm' },
            createElement(Badge, { variant: 'subject' }, '3 Năng lực Chung'),
            createElement('span', null, 'Hình thành xuyên suốt mọi môn học'),
          ),
          createElement(
            'ul',
            { className: 'list-disc pl-5 space-y-2 text-xs text-stone-700' },
            createElement(
              'li',
              null,
              createElement('strong', null, '1. Năng lực Tự chủ và Tự học:'),
              ' Tự quản lý bản thân, xác định mục tiêu học tập, lập kế hoạch và kiên trì thực hiện kế hoạch.',
            ),
            createElement(
              'li',
              null,
              createElement('strong', null, '2. Năng lực Giao tiếp và Hợp tác:'),
              ' Diễn đạt ý tưởng rõ ràng, lắng nghe tích cực, làm việc nhóm hiệu quả và giải quyết xung đột xây dựng.',
            ),
            createElement(
              'li',
              null,
              createElement('strong', null, '3. Năng lực Giải quyết vấn đề và Sáng tạo:'),
              ' Phát hiện vấn đề mới, đề xuất các giải pháp khả thi và sáng tạo sản phẩm mới.',
            ),
          ),
        ),
        createElement(
          Card,
          { className: 'p-5 rounded-2xl border-amber-900/15 bg-white shadow-xs space-y-3' },
          createElement(
            'div',
            { className: 'flex items-center gap-2 text-amber-900 font-bold text-sm' },
            createElement(Badge, { variant: 'subjectSolid' }, '7 Năng lực Đặc thù'),
            createElement('span', null, 'Gắn liền với môn học chuyên biệt'),
          ),
          createElement(
            'ul',
            { className: 'list-disc pl-5 space-y-1.5 text-xs text-stone-700' },
            createElement(
              'li',
              null,
              createElement('strong', null, '1. Năng lực Ngôn ngữ:'),
              ' Sử dụng thành thạo tiếng Việt và ngoại ngữ.',
            ),
            createElement(
              'li',
              null,
              createElement('strong', null, '2. Năng lực Tính toán (Toán học):'),
              ' Tư duy logic, mô hình hóa toán học, giải toán.',
            ),
            createElement(
              'li',
              null,
              createElement('strong', null, '3. Năng lực Khoa học:'),
              ' Tìm hiểu tự nhiên, giải thích hiện tượng khoa học.',
            ),
            createElement(
              'li',
              null,
              createElement('strong', null, '4. Năng lực Công nghệ:'),
              ' Thiết kế, sử dụng công nghệ an toàn, hiệu quả.',
            ),
            createElement(
              'li',
              null,
              createElement('strong', null, '5. Năng lực Tin học:'),
              ' Ứng dụng CNTT, an toàn thông tin số.',
            ),
            createElement(
              'li',
              null,
              createElement('strong', null, '6. Năng lực Thẩm mỹ:'),
              ' Cảm thụ nghệ thuật, sáng tạo cái đẹp.',
            ),
            createElement(
              'li',
              null,
              createElement('strong', null, '7. Năng lực Thể chất:'),
              ' Rèn luyện thân thể, thói quen vận động khỏe mạnh.',
            ),
          ),
        ),
      ),
    ),

    // PHẦN III: PHƯƠNG PHÁP GIÁO DỤC & KỶ LUẬT TÍCH CỰC
    createElement(
      'section',
      { id: '3-phuong-phap-ky-luat-tich-cuc', className: 'space-y-4' },
      createElement(
        'div',
        {
          className:
            'flex items-center gap-2 text-amber-900 font-serif font-bold text-xl border-b border-stone-200 pb-2',
        },
        createElement(Compass, { className: 'h-5 w-5 text-amber-800' }),
        createElement('h3', null, '3. Hệ thống Phương pháp Giáo dục & Tiếp cận Kỷ luật Tích cực'),
      ),
      createElement(
        'div',
        { className: 'grid gap-3 sm:grid-cols-3' },
        createElement(
          Card,
          { className: 'p-4 rounded-xl border-stone-200 bg-[#faf8f2]' },
          createElement(
            'div',
            { className: 'font-bold text-xs text-amber-900' },
            'Nhóm 1: Xây dựng ý thức (Dùng lời)',
          ),
          createElement(
            'p',
            { className: 'mt-1.5 text-xs text-stone-600' },
            'Thuyết trình, đàm thoại, giảng giải, nêu gương và tọa đàm chuyên đề nhằm định hình nhận thức và niềm tin đạo đức.',
          ),
        ),
        createElement(
          Card,
          { className: 'p-4 rounded-xl border-stone-200 bg-[#faf8f2]' },
          createElement(
            'div',
            { className: 'font-bold text-xs text-amber-900' },
            'Nhóm 2: Tổ chức hoạt động thực tiễn',
          ),
          createElement(
            'p',
            { className: 'mt-1.5 text-xs text-stone-600' },
            'Tập luyện thói quen nề nếp, giao việc, phân công trách nhiệm, trò chơi đóng vai và dự án trải nghiệm cộng đồng.',
          ),
        ),
        createElement(
          Card,
          { className: 'p-4 rounded-xl border-stone-200 bg-[#faf8f2]' },
          createElement(
            'div',
            { className: 'font-bold text-xs text-amber-900' },
            'Nhóm 3: Kích thích & Kỷ luật tích cực',
          ),
          createElement(
            'p',
            { className: 'mt-1.5 text-xs text-stone-600' },
            'Thi đua lành mạnh, khen thưởng công bằng; trách phạt bằng hậu quả logic thay vì trừng phạt thân thể hay sỉ nhục nhân phẩm.',
          ),
        ),
      ),
    ),

    // PHẦN IV: TÌNH HUỐNG SƯ PHẠM MINH HỌA
    createElement(
      'section',
      { id: '4-tinh-huong-ky-luat-tich-cuc', className: 'space-y-4' },
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
          '4. Phòng nghiệm Sư phạm: Xử lý Tình huống theo Tiếp cận Kỷ luật Tích cực',
        ),
      ),
      createElement(CaseStudyBox, { caseStudy: caseStudyPositiveDiscipline }),
    ),

    // NÚT HOÀN THÀNH BÀI HỌC
    createElement(LessonCompletionCard, {
      lessonId: 'gdh-c3-b3-muc-tieu-pham-chat-nang-luc-va-phuong-phap-giao-duc',
      lessonTitle: 'Bài 3.3: Mục tiêu Phẩm chất - Năng lực và Phương pháp giáo dục',
    }),
  );
};

// ============================================================================
// 4. DISPATCHER TRÌNH NẠP BÀI HỌC CHƯƠNG 3 (GETCHAPTER3LESSONMODULE)
// ============================================================================

export function getChapter3LessonModule(lessonId: string): CompiledLessonModule | null {
  if (lessonId === 'gdh-c3-b1-co-cau-to-chuc-truong-pho-thong-va-khai-niem-hoat-dong-giao-duc') {
    return {
      default: Lesson3_1View,
      frontmatter: {
        title: 'Bài 3.1: Cơ cấu tổ chức trường phổ thông & Khái niệm hoạt động giáo dục',
        description:
          'Bộ máy tổ chức nhà trường theo Thông tư 32/2020; cấu trúc hệ thống 6 thành tố và 4 đặc điểm cốt lõi của hoạt động giáo dục ở trường trung học.',
        level: 'basic',
        tags: ['Điều lệ trường học', 'Thông tư 32/2020', 'Cơ cấu tổ chức', 'HĐGD', 'CLO 2'],
      },
      lessonMeta: {
        chapterNumber: 3,
        lessonNumber: 1,
        headings: [
          {
            id: '1-co-cau-to-chuc-nha-truong',
            text: '1. Cơ cấu Tổ chức Nhà trường theo Thông tư 32/2020/TT-BGDĐT',
            depth: 2,
          },
          {
            id: '2-cau-truc-he-thong-hdgd',
            text: '2. Cấu trúc Hệ thống 6 Thành tố của Hoạt động Giáo dục',
            depth: 2,
          },
          {
            id: '3-bon-dac-diem-hdgd',
            text: '3. Bốn Đặc điểm Cốt lõi của Hoạt động Giáo dục ở Trường Phổ thông',
            depth: 2,
          },
        ],
        blocks: [],
      },
    };
  }

  if (lessonId === 'gdh-c3-b2-he-thong-6-nguyen-tac-giao-duc-hoc-sinh-pho-thong') {
    return {
      default: Lesson3_2View,
      frontmatter: {
        title: 'Bài 3.2: Hệ thống 6 Nguyên tắc giáo dục học sinh phổ thông',
        description:
          'Ma trận tra cứu tương tác 6 nguyên tắc giáo dục toàn diện; phân tích cơ sở khoa học, yêu cầu sư phạm thực thi và các bẫy sai lầm thực tế học đường.',
        level: 'intermediate',
        tags: ['Nguyên tắc giáo dục', '6 Nguyên tắc', 'Thực hành sư phạm', 'Makarenko', 'CLO 1'],
      },
      lessonMeta: {
        chapterNumber: 3,
        lessonNumber: 2,
        headings: [
          {
            id: '1-ma-tran-6-nguyen-tac',
            text: '1. Bảng Tra cứu Tương tác 6 Nguyên tắc Giáo dục',
            depth: 2,
          },
          {
            id: '2-yeu-cau-va-loi-sai',
            text: '2. Bảng Đối chiếu Nhanh: Nguyên tắc - Yêu cầu Giáo viên - Lỗi sai Cần tránh',
            depth: 2,
          },
        ],
        blocks: [],
      },
    };
  }

  if (lessonId === 'gdh-c3-b3-muc-tieu-pham-chat-nang-luc-va-phuong-phap-giao-duc') {
    return {
      default: Lesson3_3View,
      frontmatter: {
        title: 'Bài 3.3: Mục tiêu Phẩm chất - Năng lực và Phương pháp giáo dục',
        description:
          'Ma trận 5 phẩm chất, 10 năng lực theo CT GDPT 2018; phân loại phương pháp giáo dục; chuyên đề Kỷ luật tích cực và giải quyết tình huống học sinh vi phạm kỷ luật.',
        level: 'intermediate',
        tags: [
          '5 Phẩm chất 10 Năng lực',
          'CT GDPT 2018',
          'Phương pháp giáo dục',
          'Kỷ luật tích cực',
          'CLO 1',
          'CLO 2',
        ],
      },
      lessonMeta: {
        chapterNumber: 3,
        lessonNumber: 3,
        headings: [
          {
            id: '1-nam-pham-chat-chu-yeu',
            text: '1. Khung 5 Phẩm chất Chủ yếu của Học sinh (CT GDPT 2018)',
            depth: 2,
          },
          {
            id: '2-muoi-nang-luc-cot-loi',
            text: '2. Hệ thống 10 Năng lực Cốt lõi (3 Năng lực Chung & 7 Năng lực Đặc thù)',
            depth: 2,
          },
          {
            id: '3-phuong-phap-ky-luat-tich-cuc',
            text: '3. Hệ thống Phương pháp Giáo dục & Tiếp cận Kỷ luật Tích cực',
            depth: 2,
          },
          {
            id: '4-tinh-huong-ky-luat-tich-cuc',
            text: '4. Phòng nghiệm Sư phạm: Xử lý Tình huống theo Tiếp cận Kỷ luật Tích cực',
            depth: 2,
          },
        ],
        blocks: [],
      },
    };
  }

  return null;
}
