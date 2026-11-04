import type { CompiledLessonModule } from '@/content-runtime/loader';
import { useLearningStore } from '@/features/learning';
import { CaseStudyBox, LegalQuoteCard, ScholarQuote } from '@/features/pedagogy';
import { Badge, Button, Card } from '@/shared/ui';
import {
  Award,
  Calendar,
  CheckCircle2,
  Clock,
  Compass,
  FileText,
  GraduationCap,
  Heart,
  HelpCircle,
  Layers,
  Lightbulb,
  MessageSquare,
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
// 1. COMPONENT BÀI 4.1: VỊ TRÍ, CHỨC NĂNG VÀ NHIỆM VỤ CỦA GVCN
// ============================================================================

export const Lesson4_1View: FC = () => {
  const [activeFuncTab, setActiveFuncTab] = useState<number>(1);

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
          'Chương 4: Công tác của Người giáo viên chủ nhiệm lớp',
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
        'Bài 4.1: Vị trí, Chức năng và Nhiệm vụ của Giáo viên chủ nhiệm (GVCN)',
      ),
      createElement(
        'p',
        { className: 'mt-2 text-sm leading-relaxed text-stone-600 sm:text-base' },
        'Làm rõ vị thế hạt nhân của người GVCN — linh hồn của lớp học, nhà quản lý sư phạm vi mô, cố vấn phát triển nhân cách; phân tích 4 chức năng nòng cốt theo Giáo trình HCMUE và quy chuẩn pháp lý nhiệm vụ, quyền hạn theo Thông tư 32/2020/TT-BGDĐT.',
      ),
    ),

    // SCHOLAR QUOTE
    createElement(ScholarQuote, {
      quote:
        'Nhà giáo dục không phải là người đứng ngoài quan sát mà là người tổ chức đời sống của trẻ, thổi vào đời sống ấy ngọn lửa của lý tưởng cao đẹp và tình yêu thương.',
      author: 'Anton Semyonovich Makarenko',
      title: 'Bậc thầy lý luận và thực hành sư phạm tập thể',
      source: 'Kỷ luật và đạo đức trong trường học, 1938',
      historicalContext:
        'Khẳng định vai trò dẫn dắt tối cao của giáo viên chủ nhiệm trong việc kiến tạo môi trường phát triển nhân cách học sinh.',
    }),

    // PHẦN I: VỊ TRÍ, VAI TRÒ CỦA GVCN
    createElement(
      'section',
      { id: '1-vi-tri-vai-tro-gvcn', className: 'space-y-4' },
      createElement(
        'div',
        {
          className:
            'flex items-center gap-2 text-amber-900 font-serif font-bold text-xl border-b border-stone-200 pb-2',
        },
        createElement(Users, { className: 'h-5 w-5 text-amber-800' }),
        createElement('h3', null, '1. Vị trí và Vai trò của Giáo viên Chủ nhiệm trong Nhà trường'),
      ),
      createElement(
        'p',
        null,
        'Ở trường phổ thông, GVCN là người được Hiệu trưởng phân công thay mặt nhà trường trực tiếp chịu trách nhiệm quản lý, tổ chức và giáo dục toàn diện học sinh của một lớp học:',
      ),
      createElement(
        'div',
        { className: 'grid gap-4 sm:grid-cols-2 lg:grid-cols-4' },
        [
          {
            title: 'Linh hồn của lớp',
            desc: 'Người định hình văn hóa, phong cách, nề nếp và truyền cảm hứng gắn kết mọi thành viên trong tập thể lớp.',
          },
          {
            title: 'Nhà quản lý vi mô',
            desc: 'Điều hành, lập kế hoạch, phân công cán sự và giám sát mọi mặt học tập, rèn luyện của 40-45 học sinh.',
          },
          {
            title: 'Cố vấn nhân cách',
            desc: 'Thấu hiểu tâm lý lứa tuổi, lắng nghe tâm tư, tư vấn định hướng giá trị sống và nghề nghiệp tương lai.',
          },
          {
            title: 'Hạt nhân kết nối',
            desc: 'Cầu nối liên kết hữu cơ giữa Nhà trường, Giáo viên bộ môn, Đoàn - Đội, Gia đình và Xã hội.',
          },
        ].map((item, idx) =>
          createElement(
            Card,
            { key: idx, className: 'p-4 rounded-xl border-stone-200 bg-[#faf8f2]' },
            createElement(
              'div',
              { className: 'font-bold text-xs text-amber-900 flex items-center gap-1.5' },
              createElement(Sparkles, { className: 'h-3.5 w-3.5 text-amber-700' }),
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

    // PHẦN II: 4 CHỨC NĂNG NÒNG CỐT
    createElement(
      'section',
      { id: '2-bon-chuc-nang-nong-cot', className: 'space-y-4' },
      createElement(
        'div',
        {
          className:
            'flex items-center gap-2 text-amber-900 font-serif font-bold text-xl border-b border-stone-200 pb-2',
        },
        createElement(Layers, { className: 'h-5 w-5 text-amber-800' }),
        createElement('h3', null, '2. Bốn Chức năng Nòng cốt của Người Giáo viên Chủ nhiệm'),
      ),
      createElement(
        'div',
        { className: 'grid grid-cols-2 gap-2 sm:grid-cols-4' },
        [
          { id: 1, label: '1. Quản lý & Giáo dục', desc: 'Giáo dục toàn diện' },
          { id: 2, label: '2. Cố vấn tự quản', desc: 'Phát huy tính chủ động' },
          { id: 3, label: '3. Cầu nối nội bộ', desc: 'BGH, Đoàn-Đội, GVBM' },
          { id: 4, label: '4. Phối hợp ngoại vi', desc: 'Gia đình & Xã hội' },
        ].map((f) =>
          createElement(
            'button',
            {
              key: f.id,
              type: 'button',
              onClick: () => setActiveFuncTab(f.id),
              className: `p-3 rounded-xl border text-left transition-all ${
                activeFuncTab === f.id
                  ? 'border-amber-800 bg-amber-50/80 font-bold text-amber-950 shadow-2xs ring-1 ring-amber-800'
                  : 'border-stone-200 bg-white text-stone-600 hover:border-stone-300'
              }`,
            },
            createElement('div', { className: 'text-xs' }, f.label),
            createElement(
              'div',
              { className: 'mt-1 text-[11px] text-stone-500 font-medium' },
              f.desc,
            ),
          ),
        ),
      ),
      createElement(
        Card,
        { className: 'p-5 rounded-2xl border-stone-200 bg-white shadow-xs' },
        activeFuncTab === 1 &&
          createElement(
            'div',
            { className: 'space-y-3' },
            createElement(
              'h4',
              { className: 'font-bold text-sm text-teal-900' },
              'Chức năng 1: Quản lý và giáo dục toàn diện học sinh một lớp học',
            ),
            createElement(
              'p',
              { className: 'text-xs sm:text-sm text-stone-700' },
              'GVCN nắm bắt đặc điểm tâm sinh lý, hoàn cảnh gia đình, năng khiếu và khó khăn của từng học sinh; lập kế hoạch giáo dục toàn diện (học tập, đạo đức, thể chất, thẩm mỹ); theo dõi tiến độ rèn luyện và tổ chức đánh giá, xếp loại khách quan, công bằng theo quy định.',
            ),
          ),
        activeFuncTab === 2 &&
          createElement(
            'div',
            { className: 'space-y-3' },
            createElement(
              'h4',
              { className: 'font-bold text-sm text-teal-900' },
              'Chức năng 2: Cố vấn cho hoạt động tự quản của tập thể học sinh',
            ),
            createElement(
              'p',
              { className: 'text-xs sm:text-sm text-stone-700' },
              'GVCN không bao biện làm thay mà giữ vai trò cố vấn, hướng dẫn ban cán sự lớp tự đề ra kế hoạch, tự điều hành các hoạt động, tự giám sát nề nếp và xử lý các vấn đề nội bộ; qua đó rèn luyện năng lực lãnh đạo, tính tự giác và tinh thần trách nhiệm cho học sinh.',
            ),
          ),
        activeFuncTab === 3 &&
          createElement(
            'div',
            { className: 'space-y-3' },
            createElement(
              'h4',
              { className: 'font-bold text-sm text-teal-900' },
              'Chức năng 3: Cầu nối giữa tập thể lớp với Ban giám hiệu, các tổ chức đoàn thể và GVBM',
            ),
            createElement(
              'p',
              { className: 'text-xs sm:text-sm text-stone-700' },
              'Truyền đạt chính xác các chủ trương của nhà trường, phong trào của Đoàn - Đội đến học sinh; đồng thời phản ánh tâm tư, nguyện vọng của học sinh lên BGH; phối hợp với các giáo viên bộ môn để thống nhất yêu cầu giảng dạy và nắm bắt tình hình học tập từng môn.',
            ),
          ),
        activeFuncTab === 4 &&
          createElement(
            'div',
            { className: 'space-y-3' },
            createElement(
              'h4',
              { className: 'font-bold text-sm text-teal-900' },
              'Chức năng 4: Phối hợp, liên kết các lực lượng giáo dục ngoài nhà trường',
            ),
            createElement(
              'p',
              { className: 'text-xs sm:text-sm text-stone-700' },
              'Chủ trì mối liên hệ với Ban đại diện Cha mẹ học sinh của lớp; định kỳ trao đổi về sự tiến bộ hoặc bất thường của học sinh; phối hợp với chính quyền, công an địa phương và các tổ chức cộng đồng để bảo đảm môi trường giáo dục an toàn, lành mạnh ngoài cổng trường.',
            ),
          ),
      ),
    ),

    // PHẦN III: NHIỆM VỤ VÀ QUYỀN HẠN THEO TT32/2020
    createElement(
      'section',
      { id: '3-nhiem-vu-quyen-han-tt32', className: 'space-y-4' },
      createElement(
        'div',
        {
          className:
            'flex items-center gap-2 text-amber-900 font-serif font-bold text-xl border-b border-stone-200 pb-2',
        },
        createElement(Scale, { className: 'h-5 w-5 text-amber-800' }),
        createElement(
          'h3',
          null,
          '3. Nhiệm vụ và Quyền hạn của GVCN theo Điều lệ Trường học (Thông tư 32/2020)',
        ),
      ),
      createElement(LegalQuoteCard, {
        lawTitle: 'Điều lệ trường trung học cơ sở, trường trung học phổ thông',
        article: 'Thông tư số 32/2020/TT-BGDĐT (Điều 29, 30)',
        quote:
          '1. Giáo viên chủ nhiệm có các nhiệm vụ:\n- Xây dựng kế hoạch các hoạt động giáo dục thể hiện rõ mục tiêu, nội dung, phương pháp giáo dục bảo đảm tính khả thi, phù hợp với đặc điểm học sinh, với hoàn cảnh và điều kiện thực tế;\n- Thực hiện các hoạt động giáo dục theo kế hoạch đã xây dựng;\n- Phối hợp chặt chẽ với cha mẹ học sinh hoặc người giám hộ, giáo viên bộ môn, Đoàn TNCS Hồ Chí Minh, Đội TNTP Hồ Chí Minh, các tổ chức xã hội có liên quan để tổ chức các hoạt động giáo dục và hỗ trợ, giám sát việc học tập, rèn luyện của học sinh;\n- Đánh giá, xếp loại học sinh theo quy định của Bộ GD&ĐT; nhận xét học bạ, lập danh sách học sinh đề nghị khen thưởng, kỷ luật.\n2. Giáo viên chủ nhiệm có các quyền hạn đặc thù:\n- Được dự các giờ học, hoạt động giáo dục khác của học sinh lớp mình chủ nhiệm;\n- Được dự các cuộc họp của Hội đồng khen thưởng và Hội đồng kỷ luật khi giải quyết những vấn đề có liên quan đến học sinh của lớp mình chủ nhiệm;\n- Được giảm định mức tiết dạy theo quy định của Bộ GD&ĐT (được giảm 4 tiết/tuần đối với GVCN cấp THCS và THPT).',
        source: 'Bộ Giáo dục và Đào tạo, ban hành ngày 15/9/2020',
        sourceUrl: '/docs/giao-duc-hoc/Dieu_le_truong_trung_hoc_TT32.pdf',
        significance:
          'Khung pháp quy chuẩn xác định rõ quyền hạn giám sát chuyên môn, thẩm quyền tham gia đánh giá học sinh và chế độ giảm định mức tiết dạy của người GVCN.',
      }),
    ),

    // NÚT HOÀN THÀNH BÀI HỌC
    createElement(LessonCompletionCard, {
      lessonId: 'gdh-c4-b1-vi-tri-chuc-nang-va-nhiem-vu-cua-gvcn',
      lessonTitle: 'Bài 4.1: Vị trí, Chức năng và Nhiệm vụ của GVCN',
    }),
  );
};

// ============================================================================
// 2. COMPONENT BÀI 4.2: NỘI DUNG VÀ PHƯƠNG PHÁP GIÁO DỤC CỦA GVCN LỚP
// ============================================================================

export const Lesson4_2View: FC = () => {
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
          'Chương 4: Công tác của Người giáo viên chủ nhiệm lớp',
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
        'Bài 4.2: Nội dung và Phương pháp giáo dục của GVCN lớp',
      ),
      createElement(
        'p',
        { className: 'mt-2 text-sm leading-relaxed text-stone-600 sm:text-base' },
        'Khám phá quy trình xây dựng tập thể học sinh qua 3 giai đoạn của A.S. Makarenko, kỹ thuật bồi dưỡng cán sự lớp tự quản và thực hành chuyên sâu phương pháp Kỷ luật tích cực (Positive Discipline) của Jane Nelsen thay thế các hình phạt trừng phạt tiêu cực.',
      ),
    ),

    // PHẦN I: XÂY DỰNG VÀ PHÁT TRIỂN TẬP THỂ HỌC SINH
    createElement(
      'section',
      { id: '1-xay-dung-tap-the-hoc-sinh', className: 'space-y-4' },
      createElement(
        'div',
        {
          className:
            'flex items-center gap-2 text-amber-900 font-serif font-bold text-xl border-b border-stone-200 pb-2',
        },
        createElement(Users, { className: 'h-5 w-5 text-amber-800' }),
        createElement(
          'h3',
          null,
          '1. Ba Giai đoạn Phát triển Tập thể Học sinh (Lý luận Makarenko)',
        ),
      ),
      createElement(
        'p',
        null,
        'Một lớp học khi mới tập hợp chưa phải là một tập thể thực sự. Tập thể học sinh chỉ hình thành qua quá trình hoạt động chung và phát triển tuần tự qua 3 giai đoạn:',
      ),
      createElement(
        'div',
        { className: 'grid gap-4 sm:grid-cols-3' },
        [
          {
            stage: 'Giai đoạn 1',
            name: 'Tập thể mới hình thành',
            feature:
              'Học sinh chưa hiểu nhau, chưa có mục tiêu chung và chưa có ban cán sự vững mạnh.',
            role: 'GVCN đóng vai trò trung tâm, đưa ra các yêu cầu trực tiếp, kiên quyết và tỉ mỉ để xác lập kỷ cương nề nếp ban đầu.',
          },
          {
            stage: 'Giai đoạn 2',
            name: 'Hình thành hạt nhân tích cực',
            feature:
              'Xuất hiện nhóm học sinh tích cực (ban cán sự, tổ trưởng) có uy tín và tự giác hỗ trợ thầy cô.',
            role: 'GVCN chuyển sang tác động thông qua hạt nhân tự quản; các yêu cầu của lớp do cán sự đề xuất và chỉ đạo thực hiện.',
          },
          {
            stage: 'Giai đoạn 3',
            name: 'Tập thể phát triển cao',
            feature:
              'Dư luận tập thể lành mạnh được xác lập; đa số học sinh tự giác ủng hộ cái đúng, phản đối cái sai.',
            role: 'Tập thể trở thành công cụ giáo dục mạnh mẽ nhất ("Phương pháp song hành"); GVCN chỉ giữ vai trò cố vấn tinh tế từ xa.',
          },
        ].map((item, idx) =>
          createElement(
            Card,
            {
              key: idx,
              className: 'p-5 rounded-2xl border-stone-200 bg-white shadow-xs space-y-2',
            },
            createElement(
              'div',
              { className: 'flex items-center gap-2' },
              createElement(Badge, { variant: 'subjectSolid' }, item.stage),
              createElement('h4', { className: 'text-xs font-bold text-stone-900' }, item.name),
            ),
            createElement(
              'p',
              { className: 'text-xs text-stone-600 leading-relaxed' },
              createElement('strong', null, 'Đặc điểm: '),
              item.feature,
            ),
            createElement(
              'p',
              { className: 'text-xs text-teal-800 leading-relaxed' },
              createElement('strong', null, 'Vai trò GVCN: '),
              item.role,
            ),
          ),
        ),
      ),
    ),

    // PHẦN II: TIẾP CẬN KỶ LUẬT TÍCH CỰC
    createElement(
      'section',
      { id: '2-ky-luat-tich-cuc-jane-nelsen', className: 'space-y-4' },
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
          '2. Phương pháp Kỷ luật Tích cực (Tài liệu Positive Discipline - Jane Nelsen)',
        ),
      ),
      createElement(
        'p',
        null,
        'Kỷ luật tích cực không đồng nghĩa với buông lỏng hay nhu nhược, mà là ',
        createElement(
          'strong',
          null,
          'sự kết hợp giữa lòng tốt (tôn trọng nhân phẩm) và sự kiên quyết (yêu cầu kỷ cương)',
        ),
        ':',
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
                'Khía cạnh so sánh',
              ),
              createElement(
                'th',
                { className: 'py-3 px-4 font-semibold text-rose-800' },
                'Trừng phạt tiêu cực',
              ),
              createElement(
                'th',
                { className: 'py-3 px-4 font-semibold text-teal-900' },
                'Kỷ luật tích cực (Hệ quả logic)',
              ),
            ),
          ),
          createElement(
            'tbody',
            { className: 'divide-y divide-stone-100 text-stone-700' },
            createElement(
              'tr',
              { className: 'hover:bg-stone-50/80 transition-colors' },
              createElement('td', { className: 'py-3 px-4 font-semibold' }, 'Mục đích'),
              createElement(
                'td',
                { className: 'py-3 px-4 text-rose-700' },
                'Bắt học sinh phải trả giá, chịu đau đớn, nhục nhã',
              ),
              createElement(
                'td',
                { className: 'py-3 px-4 text-teal-900' },
                'Dạy học sinh kỹ năng giải quyết vấn đề và chịu trách nhiệm',
              ),
            ),
            createElement(
              'tr',
              { className: 'hover:bg-stone-50/80 transition-colors' },
              createElement(
                'td',
                { className: 'py-3 px-4 font-semibold' },
                'Thái độ của giáo viên',
              ),
              createElement(
                'td',
                { className: 'py-3 px-4 text-rose-700' },
                'Giận dữ, mỉa mai, công kích cá nhân, áp đặt',
              ),
              createElement(
                'td',
                { className: 'py-3 px-4 text-teal-900' },
                'Điềm tĩnh, tôn trọng, đồng cảm, lắng nghe',
              ),
            ),
            createElement(
              'tr',
              { className: 'hover:bg-stone-50/80 transition-colors' },
              createElement(
                'td',
                { className: 'py-3 px-4 font-semibold' },
                'Mối liên hệ với vi phạm',
              ),
              createElement(
                'td',
                { className: 'py-3 px-4 text-rose-700' },
                'Tùy tiện (ví dụ: vẽ bẩn lên bàn thì phạt chép phạt 100 lần)',
              ),
              createElement(
                'td',
                { className: 'py-3 px-4 text-teal-900' },
                'Có liên quan trực tiếp (vẽ bẩn bàn thì phải ở lại lau sạch bàn)',
              ),
            ),
            createElement(
              'tr',
              { className: 'hover:bg-stone-50/80 transition-colors' },
              createElement('td', { className: 'py-3 px-4 font-semibold' }, 'Kết quả lâu dài'),
              createElement(
                'td',
                { className: 'py-3 px-4 text-rose-700' },
                'Học sinh sinh lòng oán hận, chống đối ngầm hoặc tự ti buông xuôi',
              ),
              createElement(
                'td',
                { className: 'py-3 px-4 text-teal-900' },
                'Học sinh hiểu ra bản chất sai phạm và tự giác điều chỉnh hành vi',
              ),
            ),
          ),
        ),
      ),

      // 4 mục tiêu sai lệch đằng sau hành vi học sinh
      createElement(
        'div',
        { className: 'mt-4 space-y-2' },
        createElement(
          'h4',
          { className: 'font-bold text-xs sm:text-sm text-stone-900 flex items-center gap-2' },
          createElement(HelpCircle, { className: 'h-4 w-4 text-amber-800' }),
          'Kỹ thuật phát hiện 4 Mục tiêu Sai lệch đằng sau hành vi vi phạm:',
        ),
        createElement(
          'div',
          { className: 'grid grid-cols-1 md:grid-cols-2 gap-4' },
          [
            {
              target: '1. Tìm sự chú ý',
              signal: 'Làm hề, nói leo, trêu bạn',
              reaction:
                'Phớt lờ lúc đang làm hề; giao việc phụ trách cụ thể để được chú ý tích cực.',
            },
            {
              target: '2. Tranh giành quyền lực',
              signal: 'Ngang bướng, thách thức, cãi lại',
              reaction:
                'Không đôi co tay đôi; cho học sinh quyền lựa chọn trong giới hạn cho phép.',
            },
            {
              target: '3. Trả đũa / Phục thù',
              signal: 'Phá hoại tài sản, nói xấu, bạo lực',
              reaction:
                'Thấu hiểu tổn thương sâu kín; kiên nhẫn hàn gắn niềm tin và chữa lành tâm lý.',
            },
            {
              target: '4. Buông xuôi / Bất lực',
              signal: 'Ngủ gật, không làm bài, bất cần',
              reaction: 'Chia nhỏ nhiệm vụ vừa sức; khích lệ từng tiến bộ nhỏ nhất, không chê bai.',
            },
          ].map((item, i) =>
            createElement(
              Card,
              {
                key: i,
                className:
                  'p-4 sm:p-5 rounded-xl border border-stone-200/90 bg-[#faf8f2] shadow-2xs',
              },
              createElement(
                'div',
                { className: 'text-base font-semibold text-amber-950' },
                item.target,
              ),
              createElement(
                'div',
                { className: 'mt-2 text-[14.5px] leading-relaxed text-stone-600' },
                createElement(
                  'strong',
                  { className: 'font-semibold text-stone-700' },
                  'Biểu hiện: ',
                ),
                item.signal,
              ),
              createElement(
                'div',
                { className: 'mt-2 text-[14.5px] leading-relaxed text-teal-900' },
                createElement('strong', { className: 'font-semibold text-teal-950' }, 'Ứng xử: '),
                item.reaction,
              ),
            ),
          ),
        ),
      ),
    ),

    // NÚT HOÀN THÀNH BÀI HỌC
    createElement(LessonCompletionCard, {
      lessonId: 'gdh-c4-b2-noi-dung-va-phuong-phap-giao-duc-cua-gvcn-lop',
      lessonTitle: 'Bài 4.2: Nội dung và Phương pháp giáo dục của GVCN lớp',
    }),
  );
};

// ============================================================================
// 3. COMPONENT BÀI 4.3: YÊU CẦU PHẨM CHẤT, NĂNG LỰC & 3 HOẠT ĐỘNG CHỦ NHIỆM
// ============================================================================

export const Lesson4_3View: FC = () => {
  const [activePlanTab, setActivePlanTab] = useState<
    'ke-hoach-thang' | 'hop-phu-huynh' | 'sinh-hoat-lop'
  >('ke-hoach-thang');

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
          'Chương 4: Công tác của Người giáo viên chủ nhiệm lớp',
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
        'Bài 4.3: Yêu cầu về phẩm chất, năng lực của GVCN & Thiết kế hoạt động chủ nhiệm trọng tâm',
      ),
      createElement(
        'p',
        { className: 'mt-2 text-sm leading-relaxed text-stone-600 sm:text-base' },
        'Hệ thống hóa các yêu cầu chuẩn mực về phẩm chất đạo đức và năng lực nghiệp vụ sư phạm của người thầy chủ nhiệm; cung cấp cẩm nang hướng dẫn chi tiết thiết kế 3 hoạt động thực tế cốt lõi: Kế hoạch chủ nhiệm tháng, Kịch bản họp cha mẹ học sinh hiện đại và Tiết sinh hoạt lớp tự quản.',
      ),
    ),

    // PHẦN I: PHẨM CHẤT VÀ NĂNG LỰC CỦA GVCN
    createElement(
      'section',
      { id: '1-pham-chat-nang-luc-gvcn', className: 'space-y-4' },
      createElement(
        'div',
        {
          className:
            'flex items-center gap-2 text-amber-900 font-serif font-bold text-xl border-b border-stone-200 pb-2',
        },
        createElement(Award, { className: 'h-5 w-5 text-amber-800' }),
        createElement(
          'h3',
          null,
          '1. Yêu cầu về Phẩm chất và Năng lực của Người Giáo viên Chủ nhiệm',
        ),
      ),
      createElement(
        'div',
        { className: 'grid gap-4 sm:grid-cols-2' },
        createElement(
          Card,
          { className: 'p-5 rounded-2xl border-stone-200 bg-white shadow-xs space-y-3' },
          createElement(
            'div',
            { className: 'flex items-center gap-2 text-teal-900 font-bold text-sm' },
            createElement(Heart, { className: 'h-4 w-4 text-teal-700' }),
            createElement('span', null, 'Phẩm chất Nhà giáo Chủ nhiệm (Đức)'),
          ),
          createElement(
            'ul',
            { className: 'list-disc pl-5 space-y-2 text-xs text-stone-700' },
            createElement(
              'li',
              null,
              createElement('strong', null, 'Lòng yêu thương và bao dung sư phạm:'),
              ' Coi học sinh như con em mình, sẵn sàng thấu hiểu và tha thứ khi các em biết ăn năn sửa sai.',
            ),
            createElement(
              'li',
              null,
              createElement('strong', null, 'Sự công bằng và khách quan tuyệt đối:'),
              ' Không thiên vị học sinh khá giỏi hay kỳ thị học sinh cá biệt, nghèo khó.',
            ),
            createElement(
              'li',
              null,
              createElement('strong', null, 'Tính mẫu mực và kiên nhẫn cao độ:'),
              ' Giữ gìn ngôn phong, tác phong chuẩn mực; kiên trì uốn nắn hành vi không nóng vội bỏ cuộc.',
            ),
          ),
        ),
        createElement(
          Card,
          { className: 'p-5 rounded-2xl border-stone-200 bg-white shadow-xs space-y-3' },
          createElement(
            'div',
            { className: 'flex items-center gap-2 text-amber-900 font-bold text-sm' },
            createElement(Target, { className: 'h-4 w-4 text-amber-700' }),
            createElement('span', null, 'Năng lực Nghiệp vụ Chuyên sâu (Tài)'),
          ),
          createElement(
            'ul',
            { className: 'list-disc pl-5 space-y-2 text-xs text-stone-700' },
            createElement(
              'li',
              null,
              createElement('strong', null, 'Năng lực thấu hiểu tâm lý học sinh:'),
              ' Nắm bắt các quy luật phát triển lứa tuổi dậy thì và các biến cố tâm lý học đường.',
            ),
            createElement(
              'li',
              null,
              createElement('strong', null, 'Năng lực quản lý và tổ chức tập thể:'),
              ' Lập kế hoạch khoa học, phân công công việc rõ ràng, phát huy tính tự quản của cán sự lớp.',
            ),
            createElement(
              'li',
              null,
              createElement('strong', null, 'Năng lực giao tiếp và tư vấn tâm lý:'),
              ' Đối thoại khéo léo với phụ huynh, đồng cảm và gỡ rối tâm lý khi học sinh gặp khủng hoảng.',
            ),
          ),
        ),
      ),
    ),

    // PHẦN II: THIẾT KẾ 3 HOẠT ĐỘNG CHỦ NHIỆM THỰC TẾ
    createElement(
      'section',
      { id: '2-thiet-ke-3-hoat-dong-chu-nhiem', className: 'space-y-4' },
      createElement(
        'div',
        {
          className:
            'flex items-center gap-2 text-amber-900 font-serif font-bold text-xl border-b border-stone-200 pb-2',
        },
        createElement(Calendar, { className: 'h-5 w-5 text-amber-800' }),
        createElement(
          'h3',
          null,
          '2. Cẩm nang Thiết kế 3 Hoạt động Chủ nhiệm Trọng tâm (Buổi 11 Đề cương)',
        ),
      ),

      // Tab chọn hoạt động
      createElement(
        'div',
        { className: 'flex flex-wrap gap-2 rounded-xl bg-stone-100 p-1.5 text-xs font-semibold' },
        createElement(
          'button',
          {
            type: 'button',
            onClick: () => setActivePlanTab('ke-hoach-thang'),
            className: `flex items-center gap-1.5 rounded-lg px-3 py-2 transition-all ${
              activePlanTab === 'ke-hoach-thang'
                ? 'bg-white text-teal-900 shadow-2xs font-bold'
                : 'text-stone-600 hover:text-stone-900'
            }`,
          },
          createElement(Calendar, { className: 'h-4 w-4' }),
          '1. Kế hoạch chủ nhiệm tháng',
        ),
        createElement(
          'button',
          {
            type: 'button',
            onClick: () => setActivePlanTab('hop-phu-huynh'),
            className: `flex items-center gap-1.5 rounded-lg px-3 py-2 transition-all ${
              activePlanTab === 'hop-phu-huynh'
                ? 'bg-white text-teal-900 shadow-2xs font-bold'
                : 'text-stone-600 hover:text-stone-900'
            }`,
          },
          createElement(MessageSquare, { className: 'h-4 w-4' }),
          '2. Kịch bản Họp cha mẹ học sinh',
        ),
        createElement(
          'button',
          {
            type: 'button',
            onClick: () => setActivePlanTab('sinh-hoat-lop'),
            className: `flex items-center gap-1.5 rounded-lg px-3 py-2 transition-all ${
              activePlanTab === 'sinh-hoat-lop'
                ? 'bg-white text-teal-900 shadow-2xs font-bold'
                : 'text-stone-600 hover:text-stone-900'
            }`,
          },
          createElement(Clock, { className: 'h-4 w-4' }),
          '3. Tiết sinh hoạt lớp tự quản',
        ),
      ),

      // Nội dung theo Tab
      activePlanTab === 'ke-hoach-thang' &&
        createElement(
          Card,
          { className: 'p-6 rounded-2xl border-stone-200 bg-white shadow-xs space-y-4' },
          createElement(
            'div',
            { className: 'font-bold text-sm text-teal-900 flex items-center gap-2' },
            createElement(FileText, { className: 'h-4 w-4' }),
            createElement('span', null, 'Cấu trúc Kế hoạch Chủ nhiệm Lớp trong 1 Tháng'),
          ),
          createElement(
            'div',
            { className: 'space-y-3 text-xs sm:text-sm text-stone-700' },
            createElement(
              'p',
              null,
              createElement('strong', null, '1. Mục tiêu trọng tâm của tháng:'),
              ' Căn cứ vào chủ đề tháng của nhà trường và tình hình thực tế của lớp (ví dụ: "Tháng thi đua học tập tốt chào mừng Ngày Nhà giáo Việt Nam 20/11").',
            ),
            createElement(
              'p',
              null,
              createElement('strong', null, '2. Phân bổ công việc chi tiết theo 4 tuần:'),
            ),
            createElement(
              'ul',
              { className: 'list-disc pl-5 space-y-1.5 text-xs text-stone-600' },
              createElement(
                'li',
                null,
                'Tuần 1: Ổn định nề nếp, chấn chỉnh hiện tượng đi học muộn và kiểm tra dụng cụ học tập.',
              ),
              createElement(
                'li',
                null,
                'Tuần 2: Tổ chức phong trào "Đôi bạn cùng tiến" và rà soát các môn có kết quả kiểm tra yếu.',
              ),
              createElement(
                'li',
                null,
                'Tuần 3: Tập luyện văn nghệ, làm bích báo hoặc chuẩn bị quà tri ân thầy cô.',
              ),
              createElement(
                'li',
                null,
                'Tuần 4: Đánh giá xếp loại thi đua tháng, khen thưởng các cá nhân/tổ có tiến bộ vượt bậc.',
              ),
            ),
            createElement(
              'p',
              null,
              createElement('strong', null, '3. Phân công trách nhiệm:'),
              ' Giao việc cụ thể cho Lớp trưởng, Lớp phó, các Tổ trưởng và Bí thư chi đoàn kèm thời hạn báo cáo.',
            ),
          ),
        ),

      activePlanTab === 'hop-phu-huynh' &&
        createElement(
          Card,
          { className: 'p-6 rounded-2xl border-stone-200 bg-white shadow-xs space-y-4' },
          createElement(
            'div',
            { className: 'font-bold text-sm text-teal-900 flex items-center gap-2' },
            createElement(MessageSquare, { className: 'h-4 w-4' }),
            createElement('span', null, 'Kịch bản Cuộc họp Cha mẹ Học sinh Hiện đại (5 Bước)'),
          ),
          createElement(
            'div',
            { className: 'space-y-3 text-xs sm:text-sm text-stone-700' },
            createElement(
              'p',
              { className: 'text-amber-900 font-semibold text-xs' },
              '★ Nguyên tắc vàng: Tránh biến buổi họp thành "buổi đọc bảng điểm và thu tiền". Hãy biến buổi họp thành ngày hội kết nối tình cảm gia đình - nhà trường.',
            ),
            createElement(
              'ol',
              { className: 'list-decimal pl-5 space-y-2 text-xs text-stone-600' },
              createElement(
                'li',
                null,
                createElement('strong', null, 'Bước 1: Chào đón ấm áp:'),
                ' Chiếu video/hình ảnh học sinh học tập, sinh hoạt; thư tay của học sinh để trên bàn gửi gắm lời cảm ơn cha mẹ.',
              ),
              createElement(
                'li',
                null,
                createElement('strong', null, 'Bước 2: Báo cáo tình hình chung:'),
                ' Nêu những điểm mạnh nổi bật của tập thể; các phương pháp đổi mới dạy học và kiểm tra đánh giá theo CT GDPT 2018.',
              ),
              createElement(
                'li',
                null,
                createElement('strong', null, 'Bước 3: Thảo luận chuyên đề:'),
                ' Chia nhóm phụ huynh cùng thảo luận chủ đề thiết thực (ví dụ: "Đồng hành cùng con tuổi dậy thì", "Quản lý việc sử dụng smartphone hợp lý").',
              ),
              createElement(
                'li',
                null,
                createElement('strong', null, 'Bước 4: Trao đổi riêng tế nhị:'),
                ' Không nêu tên phê bình học sinh kém trước hội trường; gửi phiếu kết quả cá nhân niêm phong và hẹn gặp riêng sau buổi họp.',
              ),
              createElement(
                'li',
                null,
                createElement('strong', null, 'Bước 5: Thống nhất kênh liên lạc:'),
                ' Bầu Ban đại diện CMHS lớp và quy ước nguyên tắc giao tiếp trong nhóm Zalo lớp văn minh, tôn trọng.',
              ),
            ),
          ),
        ),

      activePlanTab === 'sinh-hoat-lop' &&
        createElement(
          Card,
          { className: 'p-6 rounded-2xl border-stone-200 bg-white shadow-xs space-y-4' },
          createElement(
            'div',
            { className: 'font-bold text-sm text-teal-900 flex items-center gap-2' },
            createElement(Clock, { className: 'h-4 w-4' }),
            createElement('span', null, 'Tiến trình 45 phút Tiết Sinh hoạt Lớp Tự quản'),
          ),
          createElement(
            'div',
            { className: 'space-y-3 text-xs sm:text-sm text-stone-700' },
            createElement(
              'ul',
              { className: 'list-disc pl-5 space-y-2 text-xs text-stone-600' },
              createElement(
                'li',
                null,
                createElement('strong', null, 'Phần 1: Khởi động & Văn nghệ (5 phút):'),
                ' Tạo không khí vui tươi, giải tỏa căng thẳng sau tuần học.',
              ),
              createElement(
                'li',
                null,
                createElement(
                  'strong',
                  null,
                  'Phần 2: Sơ kết tuần qua do Ban cán sự chủ trì (10 phút):',
                ),
                ' Các tổ trưởng báo cáo nhanh; Lớp trưởng tuyên dương cá nhân xuất sắc; đề xuất giải pháp khắc phục tồn tại nhẹ nhàng.',
              ),
              createElement(
                'li',
                null,
                createElement(
                  'strong',
                  null,
                  'Phần 3: Sinh hoạt theo Chủ đề trải nghiệm (20 phút):',
                ),
                ' Luân phiên các tổ chuẩn bị diễn đàn, trò chơi, tranh biện về một chủ đề giáo dục (Ví dụ: Kỹ năng quản lý thời gian, Văn hóa ứng xử trên mạng).',
              ),
              createElement(
                'li',
                null,
                createElement(
                  'strong',
                  null,
                  'Phần 4: GVCN cố vấn và định hướng tuần tới (10 phút):',
                ),
                ' Lắng nghe, nhận xét động viên, thống nhất kế hoạch tuần mới và gửi gắm thông điệp sống tích cực.',
              ),
            ),
          ),
        ),
    ),

    // NÚT HOÀN THÀNH BÀI HỌC
    createElement(LessonCompletionCard, {
      lessonId: 'gdh-c4-b3-yeu-cau-pham-chat-nang-luc-gvcn-va-thiet-ke-hoat-dong-chu-nhiem',
      lessonTitle:
        'Bài 4.3: Yêu cầu về phẩm chất, năng lực của GVCN & Thiết kế hoạt động chủ nhiệm trọng tâm',
    }),
  );
};

// ============================================================================
// 4. COMPONENT BÀI 4.4: THỰC HÀNH XỬ LÝ TÌNH HUỐNG SƯ PHẠM THEO RUBRIC A.1.2
// ============================================================================

export const Lesson4_4View: FC = () => {
  // Tình huống 1: Học sinh cá biệt thường xuyên trốn tiết, gây rối và không tôn trọng GV bộ môn
  const caseStudyDisruptiveStudent: PedagogicalCaseStudy = {
    id: 401,
    title:
      'Học sinh cá biệt thường xuyên trốn tiết, gây rối và tỏ thái độ vô lễ với giáo viên bộ môn',
    context:
      'Em Q. (học sinh lớp 10) gần đây thường xuyên trốn tiết học buổi chiều, hút thuốc lá điện tử trong nhà vệ sinh và trong giờ học môn Sử đã nhiều lần gác chân lên bàn, nói chen ngang làm gián đoạn bài giảng. Khi giáo viên bộ môn nhắc nhở, Q. cười cợt và nói: "Thầy dạy chán òm, em ngồi đây nghe là may lắm rồi!". Giáo viên bộ môn rất bức xúc đã ghi sổ đầu bài loại Yếu và xuống gặp GVCN đề nghị đưa Q. ra Hội đồng kỷ luật đình chỉ học 1 tuần.',
    question:
      'Vận dụng Quy trình 5 bước giải quyết tình huống giáo dục và tiêu chí Rubric A.1.2, thầy/cô chủ nhiệm sẽ xử lý như thế nào để vừa bảo vệ uy tín đồng nghiệp, vừa giữ vững kỷ cương trường học và giúp em Q. phục thiện?',
    principlesApplied: [
      'Nguyên tắc tôn trọng nhân cách kết hợp với yêu cầu cao đối với học sinh',
      'Nguyên tắc kết hợp phù hợp đặc điểm lứa tuổi và cá biệt hóa giáo dục',
      'Nguyên tắc phối hợp chặt chẽ giữa Nhà trường - Gia đình - Xã hội',
      'Tiếp cận Kỷ luật tích cực (hậu quả logic thay cho trừng phạt hạ nhục)',
    ],
    solutionSteps: [
      {
        step: 1,
        title: 'Bước 1: Tiếp nhận thông tin & Lắng nghe, trấn an đồng nghiệp',
        content:
          'GVCN lắng nghe trọn vẹn sự việc từ giáo viên bộ môn với thái độ đồng cảm, tôn trọng; ghi nhận bức xúc chính đáng và khẳng định trách nhiệm sẽ phối hợp xử lý nghiêm minh, đúng quy chế để bảo vệ uy tín nhà giáo.',
      },
      {
        step: 2,
        title: 'Bước 2: Tìm hiểu nguyên nhân gốc rễ (Tâm lý học & Giáo dục học)',
        content:
          'Gặp riêng Q. tại văn phòng yên tĩnh. Không kết tội vội vã mà tạo không gian tin cậy để tìm hiểu động cơ bên dưới hành vi (Q. đang tìm kiếm sự chú ý do cha mẹ mới ly hôn, thiếu thốn tình cảm và bị hổng kiến thức căn bản nên chán học, muốn gây sự chú ý để khẳng định "bản lĩnh" với bạn bè).',
      },
      {
        step: 3,
        title: 'Bước 3: Chỉ rõ hành vi sai phạm & Áp dụng kỷ luật tích cực',
        content:
          'Phân tích cho Q. nhận thức rõ: Việc xúc phạm thầy cô và trốn tiết là vi phạm nghiêm trọng Điều lệ trường học (Điều 34 TT32). Yêu cầu Q. viết bản kiểm điểm tự nhìn nhận lỗi và trực tiếp đến gặp xin lỗi giáo viên bộ môn một cách chân thành. Áp dụng hệ quả logic: Cam kết không tái phạm, phụ trách chăm sóc bồn hoa của trường sau giờ học để rèn tính kiên nhẫn.',
      },
      {
        step: 4,
        title: 'Bước 4: Phối hợp chặt chẽ với cha mẹ học sinh',
        content:
          'Mời cha mẹ Q. đến trao đổi riêng trên tinh thần đồng hành giúp đỡ con, phân tích nguyên nhân tâm lý và thống nhất chế độ giám sát giờ giấc học tập chặt chẽ giữa gia đình và GVCN.',
      },
      {
        step: 5,
        title: 'Bước 5: Kèm cặp, giao việc có ích và khích lệ sự tiến bộ',
        content:
          'Phân công bạn học giỏi kèm cặp Q. học tập; giao cho Q. làm tổ phó phụ trách thể thao của lớp để chuyển hóa năng lượng thừa vào các hoạt động có ích; GVCN thường xuyên quan sát, khen ngợi kịp thời khi em có chuyển biến tích cực.',
      },
    ],
    pitfallsToAvoid: [
      'Vội vã đình chỉ học ngay lập tức đẩy học sinh ra đường chơi bời với các phần tử xấu ngoài xã hội.',
      'Bênh vực học sinh làm mất uy tín và lòng tin của giáo viên bộ môn.',
      'Sỉ nhục, bêu tên học sinh trước toàn trường dưới cờ gây tổn thương danh dự nặng nề.',
    ],
    coreLesson:
      'Đằng sau mỗi học sinh cá biệt luôn là một đứa trẻ đang chịu tổn thương tâm lý và khao khát được công nhận. Người thầy giỏi là người biết biến gai nhọn thành hoa thơm.',
  };

  // Tình huống 2: Bạo lực học đường tinh vi trên mạng xã hội
  const caseStudyCyberbullying: PedagogicalCaseStudy = {
    id: 402,
    title:
      'Bạo lực học đường tinh vi: Nhóm nữ sinh cô lập, tẩy chay và lập nhóm chat bôi nhọ bạn cùng lớp',
    context:
      'Em M. (nữ sinh lớp 11 tính tình hiền lành, học giỏi) gần đây có biểu hiện trầm cảm, thường xuyên khóc một mình trong giờ ra chơi và xin phép nghỉ học nhiều buổi. Phụ huynh em M. hốt hoảng báo với GVCN rằng M. phát hiện một nhóm nữ sinh trong lớp do em L. (lớp phó văn thể) cầm đầu đã lập nhóm chat Facebook kín, lấy ảnh đời tư của M. cắt ghép chế giễu, cô lập M. không cho ai chơi cùng và đe dọa sẽ "chặn đường đánh dằn mặt" nếu M. dám mách thầy cô.',
    question:
      'Là GVCN lớp, thầy/cô sẽ giải quyết tình huống bạo lực học đường tâm lý tinh vi này như thế nào theo chuẩn Rubric A.1.2 để bảo vệ an toàn cho em M. và chấm dứt dứt điểm nạn bắt nạt?',
    principlesApplied: [
      'Nguyên tắc bảo vệ quyền trẻ em, an toàn thân thể và tinh thần học sinh',
      'Nguyên tắc giáo dục trong tập thể và bằng tập thể',
      'Nguyên tắc tôn trọng nhân cách kết hợp với yêu cầu cao',
      'Quy trình can thiệp và phòng chống bạo lực học đường theo Nghị định 80/2017/NĐ-CP',
    ],
    solutionSteps: [
      {
        step: 1,
        title: 'Bước 1: Bảo vệ an toàn tâm lý và trấn an học sinh bị bắt nạt',
        content:
          'Gặp gỡ riêng em M. và phụ huynh tại phòng tư vấn tâm lý; khẳng định nhà trường sẽ bảo vệ em an toàn tuyệt đối; hướng dẫn em chụp lại toàn bộ bằng chứng tin nhắn bôi nhọ để xử lý theo quy định.',
      },
      {
        step: 2,
        title: 'Bước 2: Xác minh tế nhị và bảo mật thông tin',
        content:
          'GVCN triệu tập riêng nhóm nữ sinh liên quan (đặc biệt là em L.); tuyệt đối không làm ầm ĩ trước lớp để tránh việc trả thù ngấm ngầm; cho các em xem lại bằng chứng và chỉ rõ hành vi xúc phạm danh dự trên không gian mạng là vi phạm Luật An ninh mạng và Điều lệ trường học.',
      },
      {
        step: 3,
        title: 'Bước 3: Phân tích trách nhiệm và yêu cầu khắc phục hậu quả',
        content:
          'Giúp L. và nhóm bạn nhận thức sâu sắc nỗi đau khổ tâm lý của bạn M.; yêu cầu giải tán ngay nhóm chat, xóa bỏ mọi hình ảnh cắt ghép xúc phạm và trực tiếp xin lỗi M. trước sự chứng kiến của GVCN và phụ huynh hai bên.',
      },
      {
        step: 4,
        title: 'Bước 4: Tổ chức sinh hoạt chuyên đề giáo dục lòng thấu cảm cho cả lớp',
        content:
          'Lồng ghép vào tiết sinh hoạt lớp chuyên đề "Tình bạn đẹp và văn hóa ứng xử trên mạng xã hội", hướng dẫn cả lớp nhận diện các hình thức bạo lực tinh thần, xây dựng dư luận tập thể kiên quyết nói không với cô lập bạn bè.',
      },
      {
        step: 5,
        title: 'Bước 5: Đồng hành theo dõi dài hạn',
        content:
          'Tiếp tục theo dõi mối quan hệ trong lớp qua các tuần tiếp theo; bố trí học sinh thân thiện cùng tổ hỗ trợ M. hòa nhập lại; kịp thời can thiệp nếu có dấu hiệu tái diễn.',
      },
    ],
    pitfallsToAvoid: [
      'Coi thường coi đây chỉ là "chuyện xích mích trẻ con của con gái" dẫn đến hậu quả học sinh tự tử vì trầm cảm.',
      'Tổ chức phê bình công khai gay gắt khiến mâu thuẫn âm ỉ bùng phát trả thù ngoài cổng trường.',
    ],
    coreLesson:
      'Vết thương thể xác có thể mau lành, nhưng vết thương tinh thần do bạo lực mạng để lại có thể hủy hoại cả cuộc đời một đứa trẻ. GVCN phải là tấm lá chắn tin cậy nhất của học sinh.',
  };

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
          'Chương 4: Công tác của Người giáo viên chủ nhiệm lớp',
        ),
        createElement(
          'span',
          { className: 'rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-bold text-amber-900' },
          'Chuẩn đầu ra: CLO 1, CLO 2, CLO 3 (Đánh giá quá trình A.1.2 - 10%)',
        ),
      ),
      createElement(
        'h2',
        { className: 'mt-3 font-serif text-2xl font-bold text-stone-900 sm:text-3xl' },
        'Bài 4.4: Thực hành xử lý tình huống sư phạm theo Rubric A.1.2',
      ),
      createElement(
        'p',
        { className: 'mt-2 text-sm leading-relaxed text-stone-600 sm:text-base' },
        'Nắm vững quy trình khoa học 5 bước giải quyết tình huống giáo dục theo chuẩn Giáo trình HCMUE; đối chiếu bảng tiêu chí Rubric đánh giá A.1.2 chính thức và thực hành giải quyết 2 tình huống sư phạm phức tạp: Học sinh cá biệt gây rối vô lễ và Bạo lực học đường mạng xã hội.',
      ),
    ),

    // PHẦN I: QUY TRÌNH 5 BƯỚC KHOA HỌC
    createElement(
      'section',
      { id: '1-quy-trinh-5-buoc-xu-ly-tinh-huong', className: 'space-y-4' },
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
          '1. Quy trình 5 Bước Giải quyết Tình huống Giáo dục Khoa học (HCMUE)',
        ),
      ),
      createElement(
        'div',
        { className: 'grid gap-3 sm:grid-cols-5' },
        [
          {
            step: '1',
            title: 'Tiếp nhận & Định dạng',
            desc: 'Xác định ai, ở đâu, khi nào, mức độ khẩn cấp.',
          },
          {
            step: '2',
            title: 'Biểu đạt vấn đề',
            desc: 'Chỉ ra mâu thuẫn bản chất cần giải quyết.',
          },
          {
            step: '3',
            title: 'Đề xuất giả thuyết',
            desc: 'Nêu các phương án và chọn giải pháp tối ưu.',
          },
          {
            step: '4',
            title: 'Chứng minh giải thuyết',
            desc: 'Căn cứ cơ sở lý luận Tâm lý học và Giáo dục học.',
          },
          {
            step: '5',
            title: 'Rút ra kết luận',
            desc: 'Bài học sư phạm và biện pháp rèn luyện bản thân.',
          },
        ].map((s) =>
          createElement(
            Card,
            { key: s.step, className: 'p-4 rounded-xl border-stone-200 bg-[#faf8f2] text-center' },
            createElement(
              'span',
              {
                className:
                  'inline-flex h-6 w-6 items-center justify-center rounded-full bg-amber-800 text-white font-bold text-xs mb-2',
              },
              s.step,
            ),
            createElement('div', { className: 'font-bold text-xs text-amber-950' }, s.title),
            createElement('p', { className: 'mt-1.5 text-[11px] text-stone-600' }, s.desc),
          ),
        ),
      ),
    ),

    // PHẦN II: NGUYÊN VĂN BẢNG RUBRIC A.1.2
    createElement(
      'section',
      { id: '2-bang-rubric-a12', className: 'space-y-4' },
      createElement(
        'div',
        {
          className:
            'flex items-center gap-2 text-amber-900 font-serif font-bold text-xl border-b border-stone-200 pb-2',
        },
        createElement(Award, { className: 'h-5 w-5 text-amber-800' }),
        createElement(
          'h3',
          null,
          '2. Bảng Tiêu chí Rubric Đánh giá Bài tập Xử lý Tình huống (A.1.2 - 10%)',
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
                'Tiêu chí đánh giá',
              ),
              createElement(
                'th',
                { className: 'py-3 px-4 font-semibold text-stone-900' },
                'Điểm tối đa',
              ),
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
              { className: 'hover:bg-stone-50/80 transition-colors' },
              createElement(
                'td',
                { className: 'py-3 px-4 font-semibold text-teal-900' },
                'Tiêu chí 1: Xác định vấn đề cần giải quyết',
              ),
              createElement('td', { className: 'py-3 px-4 font-bold text-amber-900' }, '1.0 điểm'),
              createElement(
                'td',
                { className: 'py-3 px-4' },
                'Xác định đầy đủ, chính xác, làm nổi bật được mâu thuẫn bản chất của tình huống.',
              ),
            ),
            createElement(
              'tr',
              { className: 'hover:bg-stone-50/80 transition-colors' },
              createElement(
                'td',
                { className: 'py-3 px-4 font-semibold text-teal-900' },
                'Tiêu chí 2: Phân tích nguyên nhân',
              ),
              createElement('td', { className: 'py-3 px-4 font-bold text-amber-900' }, '2.0 điểm'),
              createElement(
                'td',
                { className: 'py-3 px-4' },
                'Các nguyên nhân được phân tích rõ ràng, toàn diện, có cơ sở khoa học Tâm lý học và Giáo dục học thuyết phục.',
              ),
            ),
            createElement(
              'tr',
              { className: 'hover:bg-stone-50/80 transition-colors' },
              createElement(
                'td',
                { className: 'py-3 px-4 font-semibold text-teal-900' },
                'Tiêu chí 3: Phương án giải quyết',
              ),
              createElement('td', { className: 'py-3 px-4 font-bold text-amber-900' }, '5.0 điểm'),
              createElement(
                'td',
                { className: 'py-3 px-4' },
                'Phương án giải quyết phù hợp, giải quyết triệt để vấn đề, có tính khả thi cao, tuân thủ đúng quy định pháp quy và chuẩn nghề nghiệp giáo viên.',
              ),
            ),
            createElement(
              'tr',
              { className: 'hover:bg-stone-50/80 transition-colors' },
              createElement(
                'td',
                { className: 'py-3 px-4 font-semibold text-teal-900' },
                'Tiêu chí 4: Bài học sư phạm rút ra',
              ),
              createElement('td', { className: 'py-3 px-4 font-bold text-amber-900' }, '2.0 điểm'),
              createElement(
                'td',
                { className: 'py-3 px-4' },
                'Bài học sư phạm rút ra sâu sắc, thuyết phục và có tính ứng dụng cao cho bản thân sinh viên sư phạm.',
              ),
            ),
          ),
        ),
      ),
    ),

    // PHẦN III: 2 TÌNH HUỐNG THỰC HÀNH CHUẨN RUBRIC
    createElement(
      'section',
      { id: '3-hai-tinh-huong-thuc-hanh', className: 'space-y-6' },
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
          '3. Phòng Nghiệm Sư phạm: 2 Tình huống Điển hình Thực hành theo Rubric A.1.2',
        ),
      ),
      createElement(CaseStudyBox, { caseStudy: caseStudyDisruptiveStudent }),
      createElement(CaseStudyBox, { caseStudy: caseStudyCyberbullying }),
    ),

    // NÚT HOÀN THÀNH BÀI HỌC
    createElement(LessonCompletionCard, {
      lessonId: 'gdh-c4-b4-thuc-hanh-xu-ly-tinh-huong-su-pham-theo-rubric-a12',
      lessonTitle: 'Bài 4.4: Thực hành xử lý tình huống sư phạm theo Rubric A.1.2',
    }),
  );
};

// ============================================================================
// 5. DISPATCHER TRÌNH NẠP BÀI HỌC CHƯƠNG 4 (GETCHAPTER4LESSONMODULE)
// ============================================================================

export function getChapter4LessonModule(lessonId: string): CompiledLessonModule | null {
  if (lessonId === 'gdh-c4-b1-vi-tri-chuc-nang-va-nhiem-vu-cua-gvcn') {
    return {
      default: Lesson4_1View,
      frontmatter: {
        title: 'Bài 4.1: Vị trí, Chức năng và Nhiệm vụ của GVCN',
        description:
          'Vị trí vai trò hạt nhân của GVCN; 4 chức năng nòng cốt theo HCMUE; nhiệm vụ, quyền hạn theo Thông tư 32/2020/TT-BGDĐT.',
        level: 'basic',
        tags: [
          'GVCN',
          'Chức năng GVCN',
          'Quyền hạn nhiệm vụ',
          'Thông tư 32/2020',
          'CLO 1',
          'CLO 2',
        ],
      },
      lessonMeta: {
        chapterNumber: 4,
        lessonNumber: 1,
        headings: [
          {
            id: '1-vi-tri-vai-tro-gvcn',
            text: '1. Vị trí và Vai trò của Giáo viên Chủ nhiệm trong Nhà trường',
            depth: 2,
          },
          {
            id: '2-bon-chuc-nang-nong-cot',
            text: '2. Bốn Chức năng Nòng cốt của Người Giáo viên Chủ nhiệm',
            depth: 2,
          },
          {
            id: '3-nhiem-vu-quyen-han-tt32',
            text: '3. Nhiệm vụ và Quyền hạn của GVCN theo Điều lệ Trường học (Thông tư 32/2020)',
            depth: 2,
          },
        ],
        blocks: [],
      },
    };
  }

  if (lessonId === 'gdh-c4-b2-noi-dung-va-phuong-phap-giao-duc-cua-gvcn-lop') {
    return {
      default: Lesson4_2View,
      frontmatter: {
        title: 'Bài 4.2: Nội dung và Phương pháp giáo dục của GVCN lớp',
        description:
          'Lý luận 3 giai đoạn xây dựng tập thể học sinh theo Makarenko; phương pháp Kỷ luật tích cực theo Jane Nelsen; kỹ thuật nhận diện 4 mục tiêu sai lệch.',
        level: 'intermediate',
        tags: [
          'Tập thể học sinh',
          'Kỷ luật tích cực',
          'Makarenko',
          'Jane Nelsen',
          'CLO 1',
          'CLO 2',
        ],
      },
      lessonMeta: {
        chapterNumber: 4,
        lessonNumber: 2,
        headings: [
          {
            id: '1-xay-dung-tap-the-hoc-sinh',
            text: '1. Ba Giai đoạn Phát triển Tập thể Học sinh (Lý luận Makarenko)',
            depth: 2,
          },
          {
            id: '2-ky-luat-tich-cuc-jane-nelsen',
            text: '2. Phương pháp Kỷ luật Tích cực (Tài liệu Positive Discipline - Jane Nelsen)',
            depth: 2,
          },
        ],
        blocks: [],
      },
    };
  }

  if (lessonId === 'gdh-c4-b3-yeu-cau-pham-chat-nang-luc-gvcn-va-thiet-ke-hoat-dong-chu-nhiem') {
    return {
      default: Lesson4_3View,
      frontmatter: {
        title:
          'Bài 4.3: Yêu cầu về phẩm chất, năng lực của GVCN & Thiết kế hoạt động chủ nhiệm trọng tâm',
        description:
          'Phẩm chất đạo đức và năng lực của GVCN; hướng dẫn thiết kế 3 hoạt động thực tế: Kế hoạch chủ nhiệm tháng, Kịch bản họp cha mẹ học sinh và Tiết sinh hoạt lớp tự quản.',
        level: 'advanced',
        tags: [
          'Phẩm chất GVCN',
          'Kế hoạch tháng',
          'Họp phụ huynh',
          'Sinh hoạt lớp',
          'CLO 1',
          'CLO 3',
        ],
      },
      lessonMeta: {
        chapterNumber: 4,
        lessonNumber: 3,
        headings: [
          {
            id: '1-pham-chat-nang-luc-gvcn',
            text: '1. Yêu cầu về Phẩm chất và Năng lực của Người Giáo viên Chủ nhiệm',
            depth: 2,
          },
          {
            id: '2-thiet-ke-3-hoat-dong-chu-nhiem',
            text: '2. Cẩm nang Thiết kế 3 Hoạt động Chủ nhiệm Trọng tâm (Buổi 11 Đề cương)',
            depth: 2,
          },
        ],
        blocks: [],
      },
    };
  }

  if (lessonId === 'gdh-c4-b4-thuc-hanh-xu-ly-tinh-huong-su-pham-theo-rubric-a12') {
    return {
      default: Lesson4_4View,
      frontmatter: {
        title: 'Bài 4.4: Thực hành xử lý tình huống sư phạm theo Rubric A.1.2',
        description:
          'Quy trình khoa học 5 bước xử lý tình huống giáo dục HCMUE; Bảng tiêu chí Rubric đánh giá A.1.2; giải quyết 2 tình huống sư phạm kinh điển: học sinh cá biệt và bạo lực học đường mạng xã hội.',
        level: 'advanced',
        tags: [
          'Tình huống sư phạm',
          'Rubric A.1.2',
          'Học sinh cá biệt',
          'Bạo lực mạng',
          'CLO 1',
          'CLO 2',
          'CLO 3',
        ],
      },
      lessonMeta: {
        chapterNumber: 4,
        lessonNumber: 4,
        headings: [
          {
            id: '1-quy-trinh-5-buoc-xu-ly-tinh-huong',
            text: '1. Quy trình 5 Bước Giải quyết Tình huống Giáo dục Khoa học (HCMUE)',
            depth: 2,
          },
          {
            id: '2-bang-rubric-a12',
            text: '2. Bảng Tiêu chí Rubric Đánh giá Bài tập Xử lý Tình huống (A.1.2 - 10%)',
            depth: 2,
          },
          {
            id: '3-hai-tinh-huong-thuc-hanh',
            text: '3. Phòng Nghiệm Sư phạm: 2 Tình huống Điển hình Thực hành theo Rubric A.1.2',
            depth: 2,
          },
        ],
        blocks: [],
      },
    };
  }

  return null;
}
