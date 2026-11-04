import type { CompiledLessonModule } from '@/content-runtime/loader';
import { useLearningStore } from '@/features/learning';
import { CaseStudyBox, LegalQuoteCard, ScholarQuote } from '@/features/pedagogy';
import { Badge, Button, Card } from '@/shared/ui';
import {
  Award,
  BookOpen,
  CheckCircle2,
  Compass,
  GraduationCap,
  Heart,
  HelpCircle,
  Layers,
  Lightbulb,
  Scale,
  ShieldAlert,
  Sparkles,
  Target,
  TrendingUp,
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
// 1. COMPONENT BÀI 2.1: BẢN CHẤT VÀ CÁC CHỨC NĂNG XÃ HỘI CỦA GIÁO DỤC
// ============================================================================

export const Lesson2_1View: FC = () => {
  const [activeTab, setActiveTab] = useState<'kinh-te' | 'chinh-tri' | 'van-hoa'>('kinh-te');

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
          'Chương 2: Bản chất giáo dục, Vai trò của giáo dục và Giáo dục học',
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
        'Bài 2.1: Bản chất và các Chức năng xã hội của Giáo dục',
      ),
      createElement(
        'p',
        { className: 'mt-2 text-sm leading-relaxed text-stone-600 sm:text-base' },
        'Khám phá giáo dục như một hiện tượng xã hội đặc biệt — cơ chế truyền đạt và lĩnh hội kinh nghiệm lịch sử - xã hội (di truyền xã hội), tính lịch sử, tính giai cấp và phân tích sâu sắc 3 chức năng xã hội nền tảng: Kinh tế - sản xuất, Chính trị - xã hội và Tư tưởng - văn hóa.',
      ),
    ),

    // PHẦN I: BẢN CHẤT CỦA GIÁO DỤC
    createElement(
      'section',
      { id: '1-ban-chat-hien-tuong-xa-hoi', className: 'space-y-4' },
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
          '1. Bản chất của Giáo dục: Hiện tượng xã hội đặc biệt & Cơ chế di truyền xã hội',
        ),
      ),
      createElement(
        'p',
        null,
        'Trong lịch sử văn minh nhân loại, ',
        createElement('strong', { className: 'text-stone-900 font-semibold' }, 'Giáo dục'),
        ' không phải là một hiện tượng ngẫu nhiên hay thuần túy sinh học, mà là ',
        createElement(
          'strong',
          { className: 'text-amber-900 font-semibold' },
          'một hiện tượng xã hội đặc biệt',
        ),
        ' chỉ có ở con người. Giáo dục nảy sinh từ chính nhu cầu tất yếu của sự sinh tồn và phát triển của xã hội loài người.',
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
            createElement(Sparkles, { className: 'h-5 w-5 text-amber-800' }),
            createElement('span', null, 'Cơ chế "Di truyền xã hội"'),
          ),
          createElement(
            'p',
            { className: 'mt-2 text-xs leading-relaxed text-stone-600' },
            'Khác với thế giới động vật chỉ truyền lại bản năng sinh học qua gen di truyền sinh học, loài người duy trì và phát triển nền văn minh thông qua cơ chế truyền đạt (thế hệ đi trước) và lĩnh hội (thế hệ đi sau) hệ thống kinh nghiệm lịch sử - xã hội (tri thức, công cụ, kỹ năng sống, đạo lý). Giáo dục chính là phương thức thực hiện cơ chế di truyền xã hội đó.',
          ),
        ),
        createElement(
          Card,
          { className: 'p-5 rounded-2xl border-amber-900/15 bg-[#faf8f2]' },
          createElement(
            'div',
            { className: 'flex items-center gap-2 text-amber-900 font-bold text-base' },
            createElement(Scale, { className: 'h-5 w-5 text-amber-800' }),
            createElement('span', null, 'Tính Lịch sử & Tính Giai cấp'),
          ),
          createElement(
            'p',
            { className: 'mt-2 text-xs leading-relaxed text-stone-600' },
            'Giáo dục biến đổi không ngừng theo sự vận động của các hình thái kinh tế - xã hội (tính lịch sử). Đồng thời, trong xã hội có phân chia giai cấp, giáo dục phản ánh lợi ích của giai cấp thống trị, trở thành công cụ định hình tư tưởng và duy trì trật tự xã hội (tính giai cấp), nhưng đồng thời luôn chứa đựng khát vọng giải phóng con người.',
          ),
        ),
      ),
      createElement(ScholarQuote, {
        quote: 'Vì lợi ích mười năm thì phải trồng cây, vì lợi ích trăm năm thì phải trồng người.',
        author: 'Chủ tịch Hồ Chí Minh',
        title: 'Lãnh tụ vĩ đại của dân tộc Việt Nam, Danh nhân văn hóa thế giới',
        source: 'Bài nói chuyện tại lớp hướng dẫn giáo viên cấp II, III toàn miền Bắc (13/9/1958)',
        historicalContext:
          'Khẳng định tầm nhìn chiến lược trường tồn của sự nghiệp giáo dục: trồng người là công việc lâu dài, quyết định vận mệnh và tương lai của đất nước.',
      }),
    ),

    // PHẦN II: 3 CHỨC NĂNG XÃ HỘI CỦA GIÁO DỤC
    createElement(
      'section',
      { id: '2-ba-chuc-nang-xa-hoi', className: 'space-y-4' },
      createElement(
        'div',
        {
          className:
            'flex items-center gap-2 text-amber-900 font-serif font-bold text-xl border-b border-stone-200 pb-2',
        },
        createElement(Layers, { className: 'h-5 w-5 text-amber-800' }),
        createElement('h3', null, '2. Ba Chức năng Xã hội Cơ bản của Giáo dục'),
      ),
      createElement(
        'p',
        null,
        'Giáo dục thực hiện chức năng xã hội hóa con người, tác động mạnh mẽ đến cả ba trụ cột cơ bản của đời sống xã hội: Kinh tế, Chính trị và Văn hóa tinh thần.',
      ),

      // Tab chuyển đổi 3 chức năng
      createElement(
        'div',
        { className: 'flex flex-wrap gap-2 rounded-xl bg-stone-100 p-1.5 text-xs font-semibold' },
        createElement(
          'button',
          {
            type: 'button',
            onClick: () => setActiveTab('kinh-te'),
            className: `flex items-center gap-1.5 rounded-lg px-3 py-2 transition-all ${
              activeTab === 'kinh-te'
                ? 'bg-white text-teal-900 shadow-2xs font-bold'
                : 'text-stone-600 hover:text-stone-900'
            }`,
          },
          createElement(TrendingUp, { className: 'h-4 w-4' }),
          '1. Chức năng Kinh tế - Sản xuất',
        ),
        createElement(
          'button',
          {
            type: 'button',
            onClick: () => setActiveTab('chinh-tri'),
            className: `flex items-center gap-1.5 rounded-lg px-3 py-2 transition-all ${
              activeTab === 'chinh-tri'
                ? 'bg-white text-teal-900 shadow-2xs font-bold'
                : 'text-stone-600 hover:text-stone-900'
            }`,
          },
          createElement(Users, { className: 'h-4 w-4' }),
          '2. Chức năng Chính trị - Xã hội',
        ),
        createElement(
          'button',
          {
            type: 'button',
            onClick: () => setActiveTab('van-hoa'),
            className: `flex items-center gap-1.5 rounded-lg px-3 py-2 transition-all ${
              activeTab === 'van-hoa'
                ? 'bg-white text-teal-900 shadow-2xs font-bold'
                : 'text-stone-600 hover:text-stone-900'
            }`,
          },
          createElement(Heart, { className: 'h-4 w-4' }),
          '3. Chức năng Tư tưởng - Văn hóa',
        ),
      ),

      // Nội dung chi tiết theo Tab
      activeTab === 'kinh-te' &&
        createElement(
          Card,
          { className: 'p-6 rounded-2xl border-teal-900/15 bg-white shadow-xs space-y-4' },
          createElement(
            'div',
            { className: 'flex items-center gap-2 text-teal-900 font-bold text-lg' },
            createElement(TrendingUp, { className: 'h-5 w-5 text-teal-700' }),
            createElement('h4', null, 'Chức năng Kinh tế - Sản xuất (Tái sản xuất sức lao động)'),
          ),
          createElement(
            'p',
            { className: 'text-sm text-stone-700' },
            'Giáo dục là điều kiện tiên quyết cho sự tái sản xuất mở rộng của xã hội thông qua việc đào tạo và nâng cao chất lượng nguồn nhân lực:',
          ),
          createElement(
            'ul',
            { className: 'space-y-2 text-sm text-stone-700 list-disc pl-5' },
            createElement(
              'li',
              null,
              createElement('strong', null, 'Tái sản xuất sức lao động xã hội:'),
              ' Cung cấp cho nền kinh tế lực lượng lao động có trình độ văn hóa, năng lực chuyên môn nghề nghiệp, kỹ năng thực hành và tác phong công nghiệp.',
            ),
            createElement(
              'li',
              null,
              createElement('strong', null, 'Nâng cao năng suất lao động:'),
              ' Người lao động được đào tạo bài bản có khả năng tiếp thu công nghệ mới, thích ứng nhanh chóng và tạo ra giá trị thặng dư cao hơn nhiều lần so với lao động giản đơn.',
            ),
            createElement(
              'li',
              null,
              createElement('strong', null, 'Biến tri thức thành lực lượng sản xuất trực tiếp:'),
              ' Giáo dục là cầu nối chuyển giao các phát minh khoa học - công nghệ từ phòng thí nghiệm vào quy trình sản xuất thực tiễn của doanh nghiệp.',
            ),
            createElement(
              'li',
              null,
              createElement('strong', null, 'Hiệu quả đầu tư kinh tế cao nhất:'),
              ' Các nhà kinh tế học hiện đại (như Theodore Schultz - Nobel Kinh tế) đã chứng minh rằng đầu tư vào vốn con người thông qua giáo dục mang lại tỷ suất lợi nhuận kinh tế dài hạn cao hơn đầu tư vào máy móc vật chất.',
            ),
          ),
        ),

      activeTab === 'chinh-tri' &&
        createElement(
          Card,
          { className: 'p-6 rounded-2xl border-teal-900/15 bg-white shadow-xs space-y-4' },
          createElement(
            'div',
            { className: 'flex items-center gap-2 text-teal-900 font-bold text-lg' },
            createElement(Users, { className: 'h-5 w-5 text-teal-700' }),
            createElement(
              'h4',
              null,
              'Chức năng Chính trị - Xã hội (Củng cố thể chế & Dân chủ hóa)',
            ),
          ),
          createElement(
            'p',
            { className: 'text-sm text-stone-700' },
            'Giáo dục tác động sâu sắc đến cấu trúc giai cấp và sự ổn định của hệ thống chính trị:',
          ),
          createElement(
            'ul',
            { className: 'space-y-2 text-sm text-stone-700 list-disc pl-5' },
            createElement(
              'li',
              null,
              createElement('strong', null, 'Tác động đến cấu trúc xã hội:'),
              ' Tạo điều kiện cho sự dịch chuyển xã hội (social mobility), giúp người học từ các tầng lớp khác nhau có cơ hội bình đẳng tiếp cận tri thức và nâng cao vị thế xã hội.',
            ),
            createElement(
              'li',
              null,
              createElement('strong', null, 'Đào tạo công dân cho nhà nước:'),
              ' Giáo dục bồi dưỡng ý thức công dân, tinh thần tôn trọng Hiến pháp và pháp luật, hiểu rõ quyền hạn và trách nhiệm đối với sự nghiệp xây dựng và bảo vệ Tổ quốc.',
            ),
            createElement(
              'li',
              null,
              createElement('strong', null, 'Củng cố thể chế và đồng thuận xã hội:'),
              ' Tuyên truyền và hiện thực hóa các chủ trương, chính sách của Đảng và Nhà nước, tạo sự đồng thuận về lý tưởng và mục tiêu phát triển chung.',
            ),
          ),
        ),

      activeTab === 'van-hoa' &&
        createElement(
          Card,
          { className: 'p-6 rounded-2xl border-teal-900/15 bg-white shadow-xs space-y-4' },
          createElement(
            'div',
            { className: 'flex items-center gap-2 text-teal-900 font-bold text-lg' },
            createElement(Heart, { className: 'h-5 w-5 text-teal-700' }),
            createElement(
              'h4',
              null,
              'Chức năng Tư tưởng - Văn hóa (Bảo tồn & Sáng tạo giá trị mới)',
            ),
          ),
          createElement(
            'p',
            { className: 'text-sm text-stone-700' },
            'Giáo dục là chiếc nôi lưu giữ hồn cốt dân tộc và thúc đẩy sự thăng hoa của văn minh nhân loại:',
          ),
          createElement(
            'ul',
            { className: 'space-y-2 text-sm text-stone-700 list-disc pl-5' },
            createElement(
              'li',
              null,
              createElement('strong', null, 'Xây dựng hệ tư tưởng và nhân sinh quan tiến bộ:'),
              ' Giúp người học hình thành thế giới quan khoa học, niềm tin nhân văn, phân biệt đúng - sai, thiện - ác, đẹp - xấu.',
            ),
            createElement(
              'li',
              null,
              createElement('strong', null, 'Bảo tồn và lưu giữ di sản văn hóa:'),
              ' Truyền thụ các giá trị văn hóa truyền thống, tiếng nói, chữ viết, phong tục tập quán tốt đẹp của dân tộc qua các thế hệ học sinh.',
            ),
            createElement(
              'li',
              null,
              createElement('strong', null, 'Hội nhập và sáng tạo văn hóa:'),
              ' Tiếp thu có chọn lọc tinh hoa văn hóa và khoa học của nhân loại, đồng thời thúc đẩy nghiên cứu và sáng tạo các giá trị văn hóa mới trong thời đại số.',
            ),
          ),
        ),
    ),

    // PHẦN III: TỔNG KẾT & BẢNG SO SÁNH
    createElement(
      'section',
      { id: '3-bang-doi-chieu', className: 'space-y-4' },
      createElement(
        'div',
        {
          className:
            'flex items-center gap-2 text-amber-900 font-serif font-bold text-xl border-b border-stone-200 pb-2',
        },
        createElement(Compass, { className: 'h-5 w-5 text-amber-800' }),
        createElement('h3', null, '3. Bảng Đối chiếu Mối quan hệ giữa 3 Chức năng Xã hội'),
      ),
      createElement(
        'div',
        { className: 'overflow-x-auto rounded-xl border border-stone-200' },
        createElement(
          'table',
          { className: 'w-full text-left text-xs sm:text-sm' },
          createElement(
            'thead',
            { className: 'bg-[#faf8f2] text-stone-900 font-bold border-b border-stone-200' },
            createElement(
              'tr',
              null,
              createElement('th', { className: 'p-3' }, 'Chức năng xã hội'),
              createElement('th', { className: 'p-3' }, 'Mục tiêu trọng tâm'),
              createElement('th', { className: 'p-3' }, 'Sản phẩm trực tiếp'),
              createElement('th', { className: 'p-3' }, 'Ý nghĩa thời đại'),
            ),
          ),
          createElement(
            'tbody',
            { className: 'divide-y divide-stone-100 text-stone-700' },
            createElement(
              'tr',
              { className: 'hover:bg-stone-50' },
              createElement(
                'td',
                { className: 'p-3 font-semibold text-teal-900' },
                'Kinh tế - sản xuất',
              ),
              createElement('td', { className: 'p-3' }, 'Tái sản xuất sức lao động'),
              createElement('td', { className: 'p-3' }, 'Đội ngũ lao động có tay nghề và tri thức'),
              createElement(
                'td',
                { className: 'p-3' },
                'Động lực phát triển kinh tế tri thức và công nghiệp hóa',
              ),
            ),
            createElement(
              'tr',
              { className: 'hover:bg-stone-50' },
              createElement(
                'td',
                { className: 'p-3 font-semibold text-teal-900' },
                'Chính trị - xã hội',
              ),
              createElement('td', { className: 'p-3' }, 'Củng cố thể chế, bình đẳng hóa cơ hội'),
              createElement('td', { className: 'p-3' }, 'Công dân gương mẫu, thượng tôn pháp luật'),
              createElement(
                'td',
                { className: 'p-3' },
                'Xây dựng nhà nước pháp quyền xã hội chủ nghĩa',
              ),
            ),
            createElement(
              'tr',
              { className: 'hover:bg-stone-50' },
              createElement(
                'td',
                { className: 'p-3 font-semibold text-teal-900' },
                'Tư tưởng - văn hóa',
              ),
              createElement('td', { className: 'p-3' }, 'Bồi dưỡng tâm hồn và nhân sinh quan'),
              createElement(
                'td',
                { className: 'p-3' },
                'Con người phát triển toàn diện (Đức - Trí - Thể - Mỹ)',
              ),
              createElement(
                'td',
                { className: 'p-3' },
                'Xây dựng nền văn hóa Việt Nam tiên tiến, đậm đà bản sắc',
              ),
            ),
          ),
        ),
      ),
    ),

    // NÚT HOÀN THÀNH BÀI HỌC
    createElement(LessonCompletionCard, {
      lessonId: 'gdh-c2-b1-ban-chat-va-cac-chuc-nang-xa-hoi-cua-giao-duc',
      lessonTitle: 'Bài 2.1: Bản chất và các chức năng xã hội của giáo dục',
    }),
  );
};

// ============================================================================
// 2. COMPONENT BÀI 2.2: GIÁO DỤC VÀ SỰ PHÁT TRIỂN NHÂN CÁCH
// ============================================================================

export const Lesson2_2View: FC = () => {
  const [selectedFactor, setSelectedFactor] = useState<number>(4);

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
          'Chương 2: Bản chất giáo dục, Vai trò của giáo dục và Giáo dục học',
        ),
        createElement(
          'span',
          { className: 'rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-bold text-amber-900' },
          'Chuẩn đầu ra: CLO 2 (Trọng tâm thi tự luận)',
        ),
      ),
      createElement(
        'h2',
        { className: 'mt-3 font-serif text-2xl font-bold text-stone-900 sm:text-3xl' },
        'Bài 2.2: Giáo dục và Sự phát triển nhân cách',
      ),
      createElement(
        'p',
        { className: 'mt-2 text-sm leading-relaxed text-stone-600 sm:text-base' },
        'Phân tích bản chất khái niệm nhân cách, phê phán các quan niệm sai lầm cực đoan và luận giải sâu sắc mối quan hệ biện chứng giữa 4 yếu tố: Bẩm sinh di truyền (tiền đề vật chất), Môi trường (điều kiện thực tế), Hoạt động cá nhân (quyết định trực tiếp) và Giáo dục giữ vai trò CHỦ ĐẠO.',
      ),
    ),

    // PHẦN I: KHÁI NIỆM NHÂN CÁCH VÀ PHÊ PHÁN CÁC THUYẾT SAI LẦM
    createElement(
      'section',
      { id: '1-khai-niem-nhan-cach', className: 'space-y-4' },
      createElement(
        'div',
        {
          className:
            'flex items-center gap-2 text-amber-900 font-serif font-bold text-xl border-b border-stone-200 pb-2',
        },
        createElement(Target, { className: 'h-5 w-5 text-amber-800' }),
        createElement('h3', null, '1. Khái niệm Nhân cách & Hai quan niệm sai lầm cực đoan'),
      ),
      createElement(
        'p',
        null,
        'Trong Giáo dục học và Tâm lý học Mác-xít, ',
        createElement('strong', { className: 'text-stone-900 font-semibold' }, 'Nhân cách'),
        ' là tổ hợp những đặc điểm, thuộc tính tâm lý ổn định của một cá nhân quy định giá trị xã hội và hành vi của người đó trong các mối quan hệ với tự nhiên, xã hội và chính bản thân mình.',
      ),
      createElement(
        'div',
        { className: 'grid gap-4 sm:grid-cols-2' },
        createElement(
          Card,
          { className: 'p-5 rounded-2xl border-rose-900/15 bg-rose-50/30' },
          createElement(
            'div',
            { className: 'flex items-center gap-2 text-rose-900 font-bold text-sm' },
            createElement(ShieldAlert, { className: 'h-4 w-4 text-rose-700' }),
            createElement('span', null, 'Thuyết Tiền định (Tuyệt đối hóa Di truyền)'),
          ),
          createElement(
            'p',
            { className: 'mt-2 text-xs leading-relaxed text-stone-600' },
            'Cho rằng mọi đặc điểm nhân cách, tài năng và phẩm chất đạo đức của con người đã được định đoạt sẵn ngay từ khi sinh ra bởi gen di truyền hoặc đấng siêu nhiên ("Cha mẹ sinh con trời sinh tính", thuyết dòng dõi ưu sinh). Sai lầm: Phủ nhận vai trò cải tạo của hoàn cảnh xã hội, hạ thấp giáo dục và cổ súy phân biệt đối xử.',
          ),
        ),
        createElement(
          Card,
          { className: 'p-5 rounded-2xl border-rose-900/15 bg-rose-50/30' },
          createElement(
            'div',
            { className: 'flex items-center gap-2 text-rose-900 font-bold text-sm' },
            createElement(ShieldAlert, { className: 'h-4 w-4 text-rose-700' }),
            createElement('span', null, 'Thuyết Duy cảm máy móc (Tuyệt đối hóa Môi trường)'),
          ),
          createElement(
            'p',
            { className: 'mt-2 text-xs leading-relaxed text-stone-600' },
            'Coi tâm hồn trẻ sơ sinh như một "tờ giấy trắng" (Tabula Rasa - J. Locke), nhân cách hoàn toàn là sản phẩm thụ động được nhào nặn bởi môi trường bên ngoài. Sai lầm: Xem con người như cỗ máy vô hồn, phủ nhận tính tích cực chủ quan, khả năng tự ý thức và ý chí tự biến đổi của con người.',
          ),
        ),
      ),
    ),

    // PHẦN II: BIỆN CHỨNG 4 YẾU TỐ PHÁT TRIỂN NHÂN CÁCH
    createElement(
      'section',
      { id: '2-bien-chung-4-yeu-to', className: 'space-y-4' },
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
          '2. Mối quan hệ Biện chứng giữa 4 Yếu tố Hình thành & Phát triển Nhân cách',
        ),
      ),
      createElement(
        'p',
        null,
        'Khoa học giáo dục hiện đại khẳng định: Sự hình thành và phát triển nhân cách là kết quả tương tác biện chứng tổng hợp của 4 yếu tố, trong đó mỗi yếu tố giữ một vị trí và chức năng đặc thù không thể thay thế:',
      ),

      // Bộ chọn 4 yếu tố
      createElement(
        'div',
        { className: 'grid grid-cols-2 gap-2 sm:grid-cols-4' },
        [
          { id: 1, label: '1. Bẩm sinh - Di truyền', role: 'Tiền đề vật chất', color: 'slate' },
          { id: 2, label: '2. Môi trường', role: 'Điều kiện & Bối cảnh', color: 'slate' },
          {
            id: 3,
            label: '3. Hoạt động & Giao tiếp',
            role: 'Quyết định trực tiếp',
            color: 'amber',
          },
          { id: 4, label: '4. Giáo dục', role: 'Giữ vai trò CHỦ ĐẠO', color: 'teal' },
        ].map((f) =>
          createElement(
            'button',
            {
              key: f.id,
              type: 'button',
              onClick: () => setSelectedFactor(f.id),
              className: `p-3 rounded-xl border text-left transition-all ${
                selectedFactor === f.id
                  ? 'border-amber-800 bg-amber-50/70 shadow-2xs ring-1 ring-amber-800'
                  : 'border-stone-200 bg-white hover:border-stone-300'
              }`,
            },
            createElement('div', { className: 'text-xs font-bold text-stone-900' }, f.label),
            createElement(
              'span',
              {
                className: `inline-block mt-1 text-[11px] font-semibold ${
                  f.id === 4 ? 'text-teal-800' : f.id === 3 ? 'text-amber-800' : 'text-stone-500'
                }`,
              },
              f.role,
            ),
          ),
        ),
      ),

      // Khung nội dung chi tiết yếu tố được chọn
      createElement(
        Card,
        { className: 'p-6 rounded-2xl border-stone-200 bg-white shadow-xs' },
        selectedFactor === 1 &&
          createElement(
            'div',
            { className: 'space-y-3' },
            createElement(
              'div',
              { className: 'flex items-center gap-2 text-stone-900 font-bold text-base' },
              createElement(Badge, { variant: 'neutral' }, 'Yếu tố 1'),
              createElement('h4', null, 'Bẩm sinh - Di truyền: Tiền đề vật chất của sự phát triển'),
            ),
            createElement(
              'ul',
              { className: 'list-disc pl-5 space-y-2 text-xs sm:text-sm text-stone-700' },
              createElement(
                'li',
                null,
                createElement('strong', null, 'Khái niệm:'),
                ' Là sự truyền lại từ cha mẹ cho con cái những đặc điểm giải phẫu sinh lý như cấu tạo cơ thể, màu mắt, nhóm máu, đặc điểm của hệ thần kinh trung ương và các giác quan.',
              ),
              createElement(
                'li',
                null,
                createElement('strong', null, 'Ý nghĩa tiền đề:'),
                ' Tạo ra tư chất ban đầu (tư chất về thính giác, thị giác, sự linh hoạt thần kinh). Không có tiền đề sinh học bình thường thì các chức năng tâm lý cấp cao rất khó hình thành.',
              ),
              createElement(
                'li',
                null,
                createElement('strong', null, 'Giới hạn:'),
                ' Di truyền KHÔNG quyết định trước giới hạn hay nội dung xã hội của nhân cách. Tư chất chỉ là mầm mống; có phát triển thành tài năng hay không phụ thuộc hoàn toàn vào môi trường rèn luyện và giáo dục.',
              ),
            ),
          ),

        selectedFactor === 2 &&
          createElement(
            'div',
            { className: 'space-y-3' },
            createElement(
              'div',
              { className: 'flex items-center gap-2 text-stone-900 font-bold text-base' },
              createElement(Badge, { variant: 'neutral' }, 'Yếu tố 2'),
              createElement(
                'h4',
                null,
                'Môi trường: Điều kiện, phương tiện và bối cảnh phát triển',
              ),
            ),
            createElement(
              'ul',
              { className: 'list-disc pl-5 space-y-2 text-xs sm:text-sm text-stone-700' },
              createElement(
                'li',
                null,
                createElement('strong', null, 'Phân loại:'),
                ' Gồm môi trường tự nhiên (khí hậu, địa lý) và môi trường xã hội (vĩ mô: thể chế kinh tế - chính trị; vi mô: gia đình, bạn bè, hàng xóm).',
              ),
              createElement(
                'li',
                null,
                createElement('strong', null, 'Vai trò điều kiện:'),
                ' Cung cấp nguồn nguyên liệu, điều kiện sinh hoạt và các mối quan hệ xã hội để cá nhân gia nhập vào đời sống thực tế. Con người tách khỏi xã hội loài người (như các trường hợp trẻ em người sói) thì không thể phát triển nhân cách người.',
              ),
              createElement(
                'li',
                null,
                createElement('strong', null, 'Tính tương đối:'),
                ' Môi trường không tác động một chiều thụ động; mức độ tác động tùy thuộc vào thái độ lựa chọn và hành động tích cực của cá nhân đối với môi trường.',
              ),
            ),
          ),

        selectedFactor === 3 &&
          createElement(
            'div',
            { className: 'space-y-3' },
            createElement(
              'div',
              { className: 'flex items-center gap-2 text-amber-900 font-bold text-base' },
              createElement(Badge, { variant: 'subjectSolid' }, 'Yếu tố 3 — Trọng tâm'),
              createElement(
                'h4',
                null,
                'Hoạt động và Giao tiếp của cá nhân: Yếu tố QUYẾT ĐỊNH TRỰC TIẾP',
              ),
            ),
            createElement(
              'ul',
              { className: 'list-disc pl-5 space-y-2 text-xs sm:text-sm text-stone-700' },
              createElement(
                'li',
                null,
                createElement('strong', null, 'Bản chất chủ thể:'),
                ' Con người không thụ động ngồi chờ hoàn cảnh tác động mà là chủ thể tích cực của hoạt động (học tập, lao động, nghiên cứu) và các mối quan hệ giao tiếp xã hội.',
              ),
              createElement(
                'li',
                null,
                createElement('strong', null, 'Cơ chế quyết định trực tiếp:'),
                ' Thông qua hoạt động có ý thức, con người vừa biến đổi thế giới bên ngoài, vừa đồng thời ',
                createElement(
                  'strong',
                  { className: 'text-amber-900' },
                  'tự biến đổi chính cấu trúc tâm lý và nhân cách của bản thân mình',
                ),
                ' (chuyển hóa tri thức nhân loại thành năng lực của riêng mình).',
              ),
              createElement(
                'li',
                null,
                createElement('strong', null, 'Ý nghĩa sư phạm:'),
                ' Người thầy không thể "nhét" tri thức hay đạo đức vào đầu học sinh. Muốn hình thành nhân cách cho học sinh, giáo viên bắt buộc phải tổ chức các hoạt động phong phú để học sinh tự làm, tự trải nghiệm và tự rút ra bài học.',
              ),
            ),
          ),

        selectedFactor === 4 &&
          createElement(
            'div',
            { className: 'space-y-3' },
            createElement(
              'div',
              { className: 'flex items-center gap-2 text-teal-900 font-bold text-base' },
              createElement(Badge, { variant: 'subject' }, 'Yếu tố 4 — Vai trò Chủ đạo'),
              createElement(
                'h4',
                null,
                'Giáo dục: Giữ vai trò CHỦ ĐẠO trong sự phát triển nhân cách',
              ),
            ),
            createElement(
              'p',
              { className: 'text-xs sm:text-sm text-stone-700 font-semibold' },
              'Giáo dục giữ vai trò chủ đạo bởi vì giáo dục thực hiện 5 sứ mệnh then chốt sau:',
            ),
            createElement(
              'ol',
              { className: 'list-decimal pl-5 space-y-2 text-xs sm:text-sm text-stone-700' },
              createElement(
                'li',
                null,
                createElement('strong', null, 'Định hướng mục tiêu phát triển:'),
                ' Giáo dục vạch ra mô hình nhân cách tương lai của thế hệ trẻ phù hợp với đòi hỏi tiến bộ của xã hội, dẫn dắt quá trình hình thành nhân cách theo chiều hướng tích cực.',
              ),
              createElement(
                'li',
                null,
                createElement('strong', null, 'Tổ chức, dẫn dắt các hoạt động và giao lưu:'),
                ' Giáo dục chọn lọc những tác động tích cực của môi trường, hạn chế những tác động tiêu cực, đồng thời thiết kế các hoạt động khoa học để người học rèn luyện.',
              ),
              createElement(
                'li',
                null,
                createElement('strong', null, 'Can thiệp, điều chỉnh và uốn nắn những sai lệch:'),
                ' Kịp thời bù đắp những khiếm khuyết bẩm sinh (giáo dục đặc biệt cho trẻ khuyết tật) và khắc phục những ảnh hưởng tiêu cực từ môi trường sống phức tạp.',
              ),
              createElement(
                'li',
                null,
                createElement('strong', null, 'Đi trước đón đầu sự phát triển:'),
                ' Dựa trên quy luật "Vùng phát triển gần nhất" (L.S. Vygotsky), giáo dục không dừng lại ở mức độ hiện tại mà đưa ra những yêu cầu cao hơn, kéo theo sự phát triển nhận thức của học sinh.',
              ),
              createElement(
                'li',
                null,
                createElement('strong', null, 'Tạo tiền đề và chuyển hóa thành tự giáo dục:'),
                ' Đích đến cao nhất của giáo dục là biến quá trình "được giáo dục" thành "tự giáo dục", giúp học sinh có khả năng tự hoàn thiện suốt đời.',
              ),
            ),
          ),
      ),
    ),

    // PHẦN III: HƯỚNG DẪN DÀN Ý CÂU HỎI THI TỰ LUẬN
    createElement(
      'section',
      { id: '3-dan-y-thi-tu-luan', className: 'space-y-4' },
      createElement(
        'div',
        {
          className:
            'flex items-center gap-2 text-amber-900 font-serif font-bold text-xl border-b border-stone-200 pb-2',
        },
        createElement(HelpCircle, { className: 'h-5 w-5 text-amber-800' }),
        createElement(
          'h3',
          null,
          '3. Hướng dẫn Dàn ý Câu hỏi Tự luận Kinh điển (Kiểm tra A1.10 & Thi Học phần)',
        ),
      ),
      createElement(
        Card,
        { className: 'p-5 rounded-2xl border-amber-900/15 bg-[#faf8f2] space-y-3' },
        createElement(
          'div',
          { className: 'text-sm font-bold text-amber-950 font-serif' },
          'Đề bài: "Tại sao nói trong sự hình thành và phát triển nhân cách, giáo dục giữ vai trò chủ đạo nhưng hoạt động cá nhân mới giữ vai trò quyết định trực tiếp? Nêu bài học sư phạm đối với người giáo viên phổ thông."',
        ),
        createElement(
          'div',
          { className: 'text-xs text-stone-700 space-y-2' },
          createElement(
            'p',
            null,
            createElement('strong', null, 'Gợi ý cấu trúc chấm điểm chuẩn:'),
          ),
          createElement(
            'p',
            null,
            '• ',
            createElement('strong', null, 'Ý 1 (Khái niệm nhân cách & 4 yếu tố):'),
            ' Nêu định nghĩa nhân cách và liệt kê 4 yếu tố biện chứng (0.5 điểm).',
          ),
          createElement(
            'p',
            null,
            '• ',
            createElement('strong', null, 'Ý 2 (Chứng minh Giáo dục giữ vai trò chủ đạo):'),
            ' Trình bày 5 luận điểm: Định hướng mục tiêu; Tổ chức môi trường; Điều chỉnh uốn nắn sai lệch; Đi trước đón đầu (Vygotsky); Đưa đến tự giáo dục (1.5 điểm).',
          ),
          createElement(
            'p',
            null,
            '• ',
            createElement(
              'strong',
              null,
              'Ý 3 (Chứng minh Hoạt động cá nhân quyết định trực tiếp):',
            ),
            ' Phân tích tính chủ thể của con người; cơ chế chuyển hóa kinh nghiệm loài người thành phẩm chất cá nhân thông qua hành động thực tiễn; không ai có thể học thay (1.0 điểm).',
          ),
          createElement(
            'p',
            null,
            '• ',
            createElement('strong', null, 'Ý 4 (Bài học sư phạm cho giáo viên):'),
            ' Giáo viên không áp đặt, giáo điều; phải biến người học thành chủ thể; đa dạng hóa các hoạt động trải nghiệm, dự án, thảo luận để học sinh tự chiếm lĩnh tri thức và đạo đức (1.0 điểm).',
          ),
        ),
      ),
    ),

    // NÚT HOÀN THÀNH BÀI HỌC
    createElement(LessonCompletionCard, {
      lessonId: 'gdh-c2-b2-giao-duc-va-su-phat-trien-nhan-cach',
      lessonTitle: 'Bài 2.2: Giáo dục và Sự phát triển nhân cách',
    }),
  );
};

// ============================================================================
// 3. COMPONENT BÀI 2.3: GIÁO DỤC HỌC LÀ MỘT KHOA HỌC, MỤC ĐÍCH & NGUYÊN LÝ GD
// ============================================================================

export const Lesson2_3View: FC = () => {
  // Case Study: Phụ huynh phó mặc việc giáo dục con cho nhà trường
  const caseStudyParentalDuty: PedagogicalCaseStudy = {
    id: 101,
    title: 'Phụ huynh phó mặc việc dạy dỗ con em cho nhà trường theo quan điểm "khoán trắng"',
    context:
      'Trong buổi họp cha mẹ học sinh đầu năm lớp 10, phụ huynh của em T. (học sinh thường xuyên vi phạm nề nếp và ngủ gật trong giờ) phát biểu thẳng thắn trước GVCN: "Gia đình tôi kinh doanh bận tối mắt tối mũi từ sáng đến khuya. Chúng tôi đã đóng góp đầy đủ các khoản tiền học, tiền bán trú và quỹ trường theo đúng quy định. Việc dạy dỗ cháu nên người, ngoan ngoãn là trách nhiệm hoàn toàn của nhà trường và thầy cô. Ở nhà cháu hư thì thầy cô cứ đánh phạt thoải mái, gia đình không có thời gian quản thúc!"',
    question:
      'Dưới góc độ Nguyên lý giáo dục thứ 3 ("Giáo dục nhà trường kết hợp với giáo dục gia đình và giáo dục xã hội" - Điều 5 Luật Giáo dục 2019), thầy/cô chủ nhiệm sẽ trao đổi và xử lý như thế nào để phụ huynh hiểu rõ trách nhiệm và đồng hành cùng nhà trường?',
    principlesApplied: [
      'Nguyên tắc phối hợp chặt chẽ giữa Nhà trường - Gia đình - Xã hội (Điều 5 Luật GD 2019)',
      'Nguyên tắc tôn trọng nhân cách kết hợp với yêu cầu cao',
      'Kỹ năng truyền thông và tư vấn giáo dục gia đình của người giáo viên',
    ],
    solutionSteps: [
      {
        step: 1,
        title: 'Giữ thái độ điềm tĩnh, chia sẻ sự vất vả của cha mẹ',
        content:
          'Không phê phán hay phản bác gay gắt phụ huynh ngay trước hội đồng cha mẹ học sinh. Bày tỏ sự thấu hiểu chân thành với nỗi vất vả mưu sinh của gia đình để tạo sự gắn kết tâm lý ban đầu.',
      },
      {
        step: 2,
        title: 'Mời phụ huynh trao đổi riêng sau buổi họp',
        content:
          'Tránh làm phụ huynh mất thể diện trước đám đông. Gặp gỡ riêng tại văn phòng với không khí cởi mở, trang trọng để phân tích sâu sắc bản chất vấn đề.',
      },
      {
        step: 3,
        title: 'Phân tích bản chất của Nguyên lý giáo dục kết hợp 3 môi trường',
        content:
          'Khéo léo chỉ ra: Học sinh chỉ ở trường 4-6 tiếng/ngày, thời gian còn lại phần lớn ở gia đình và môi trường xã hội. Tình cảm ruột thịt và tấm gương của cha mẹ là trường học đạo đức đầu tiên và sâu đậm nhất mà nhà trường không thể thay thế.',
      },
      {
        step: 4,
        title: 'Cùng phụ huynh lập "Quy ước đồng hành tối thiểu"',
        content:
          'Không đòi hỏi cha mẹ phải ngồi dạy kèm con, chỉ cần cam kết những việc vừa sức: Dành 15 phút mỗi tối lắng nghe con chia sẻ về trường lớp, kiểm tra giờ giấc sinh hoạt và ký sổ theo dõi định kỳ.',
      },
      {
        step: 5,
        title: 'Thường xuyên cập nhật thông tin tích cực của học sinh',
        content:
          'Chủ động gọi điện hoặc nhắn tin cho phụ huynh khi T. có những tiến bộ dù nhỏ nhất (như một buổi học tích cực, một điểm kiểm tra tốt), giúp cha mẹ cảm nhận được niềm hạnh phúc khi cùng đồng hành giáo dục con.',
      },
    ],
    pitfallsToAvoid: [
      'Đôi co, chỉ trích phụ huynh vô trách nhiệm ngay tại buổi họp làm phụ huynh xấu hổ và tự ái.',
      'Đồng thuận với việc "đánh phạt thoải mái" của phụ huynh (vi phạm nghiêm trọng Điều lệ trường học và Luật Trẻ em).',
      'Buông xuôi, phó mặc học sinh vì nghĩ gia đình đã bất cần.',
    ],
    coreLesson:
      'Giáo dục một đứa trẻ cần sự chung tay của cả một ngôi làng. Nhà trường là ngọn đèn soi sáng tri thức, nhưng gia đình mãi mãi là bến đỗ bình yên định hình nhân cách.',
  };

  return createElement(
    'div',
    { className: 'space-y-8 text-stone-800 leading-relaxed' },

    // Khung Tiêu đề & Chuẩn đầu ra CLO 1, CLO 2
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
          'Chương 2: Bản chất giáo dục, Vai trò của giáo dục và Giáo dục học',
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
        'Bài 2.3: Giáo dục học là một khoa học, Mục đích & Nguyên lý giáo dục',
      ),
      createElement(
        'p',
        { className: 'mt-2 text-sm leading-relaxed text-stone-600 sm:text-base' },
        'Hệ thống hóa đối tượng, nhiệm vụ và phương pháp nghiên cứu của Giáo dục học; phân tích mục tiêu giáo dục phổ thông 3 cấp học theo Điều 28 và 3 nguyên lý giáo dục nền tảng theo Điều 5 Luật Giáo dục 2019 kèm tình huống sư phạm thực tiễn.',
      ),
    ),

    // PHẦN I: GIÁO DỤC HỌC LÀ MỘT KHOA HỌC
    createElement(
      'section',
      { id: '1-giao-duc-hoc-la-khoa-hoc', className: 'space-y-4' },
      createElement(
        'div',
        {
          className:
            'flex items-center gap-2 text-amber-900 font-serif font-bold text-xl border-b border-stone-200 pb-2',
        },
        createElement(BookOpen, { className: 'h-5 w-5 text-amber-800' }),
        createElement('h3', null, '1. Đối tượng, Nhiệm vụ và Phương pháp Nghiên cứu của GDH'),
      ),
      createElement(
        'p',
        null,
        'Giáo dục học là một ngành khoa học xã hội độc lập nghiên cứu bản chất, các quy luật và công nghệ của quá trình giáo dục toàn diện con người:',
      ),
      createElement(
        'div',
        { className: 'grid gap-4 sm:grid-cols-3' },
        createElement(
          Card,
          { className: 'p-5 rounded-2xl border-stone-200 bg-white' },
          createElement(
            'div',
            { className: 'flex items-center gap-2 text-teal-900 font-bold text-sm' },
            createElement(Target, { className: 'h-4 w-4' }),
            createElement('span', null, 'Đối tượng nghiên cứu'),
          ),
          createElement(
            'p',
            { className: 'mt-2 text-xs leading-relaxed text-stone-600' },
            'Bản chất, các quy luật phát triển nhân cách, nội dung, nguyên tắc, phương pháp và hình thức tổ chức quá trình giáo dục (bao gồm quá trình dạy học và quá trình giáo dục nghĩa hẹp).',
          ),
        ),
        createElement(
          Card,
          { className: 'p-5 rounded-2xl border-stone-200 bg-white' },
          createElement(
            'div',
            { className: 'flex items-center gap-2 text-teal-900 font-bold text-sm' },
            createElement(Award, { className: 'h-4 w-4' }),
            createElement('span', null, 'Nhiệm vụ trọng tâm'),
          ),
          createElement(
            'p',
            { className: 'mt-2 text-xs leading-relaxed text-stone-600' },
            'Giải thích các hiện tượng giáo dục; phát hiện các quy luật khách quan; xây dựng lý luận dạy học tiên tiến; chỉ dẫn thực tiễn sư phạm và dự báo các xu thế đổi mới giáo dục.',
          ),
        ),
        createElement(
          Card,
          { className: 'p-5 rounded-2xl border-stone-200 bg-white' },
          createElement(
            'div',
            { className: 'flex items-center gap-2 text-teal-900 font-bold text-sm' },
            createElement(Compass, { className: 'h-4 w-4' }),
            createElement('span', null, 'Phương pháp nghiên cứu'),
          ),
          createElement(
            'p',
            { className: 'mt-2 text-xs leading-relaxed text-stone-600' },
            'Quan sát sư phạm, trò chuyện/phỏng vấn sâu, điều tra bảng hỏi (anket), thực nghiệm sư phạm có đối chứng, nghiên cứu hồ sơ sản phẩm học tập và tổng kết kinh nghiệm giáo dục.',
          ),
        ),
      ),
    ),

    // PHẦN II: MỤC TIÊU GDPT THEO ĐIỀU 28 LUẬT GIÁO DỤC 2019
    createElement(
      'section',
      { id: '2-muc-tieu-gdpt-dieu-28', className: 'space-y-4' },
      createElement(
        'div',
        {
          className:
            'flex items-center gap-2 text-amber-900 font-serif font-bold text-xl border-b border-stone-200 pb-2',
        },
        createElement(Scale, { className: 'h-5 w-5 text-amber-800' }),
        createElement('h3', null, '2. Mục tiêu Giáo dục Phổ thông theo Điều 28 Luật Giáo dục 2019'),
      ),
      createElement(LegalQuoteCard, {
        lawTitle: 'Luật Giáo dục 2019 (Luật số 43/2019/QH14)',
        article: 'Điều 28. Mục tiêu của giáo dục phổ thông',
        quote:
          '1. Giáo dục phổ thông nhằm phát triển toàn diện cho người học về đạo đức, trí tuệ, thể chất, thẩm mỹ, kỹ năng cơ bản, phát triển năng lực cá nhân, tính năng động và sáng tạo; hình thành nhân cách con người Việt Nam xã hội chủ nghĩa và trách nhiệm công dân; chuẩn bị cho người học tiếp tục học chương trình giáo dục đại học, giáo dục nghề nghiệp hoặc tham gia vào cuộc sống lao động.\n2. Giáo dục tiểu học nhằm hình thành cơ sở ban đầu cho sự phát triển toàn diện về đạo đức, trí tuệ, thể chất, thẩm mỹ, năng lực của học sinh...\n3. Giáo dục trung học cơ sở nhằm củng cố và phát triển những kết quả của giáo dục tiểu học; bảo đảm cho học sinh có học vấn phổ thông nền tảng, hiểu biết ban đầu về kỹ thuật và hướng nghiệp...\n4. Giáo dục trung học phổ thông nhằm hoàn thiện học vấn phổ thông; có hiểu biết về kỹ thuật và hướng nghiệp; có cơ hội phát triển năng lực cá nhân để lựa chọn hướng phát triển tiếp tục học đại học, giáo dục nghề nghiệp hoặc tham gia vào cuộc sống lao động.',
        source: 'Quốc hội nước CHXHCN Việt Nam khóa XIV, thông qua ngày 14/6/2019',
        sourceUrl: '/docs/giao-duc-hoc/Luat_Giao_duc_2019.pdf',
        significance:
          'Căn cứ pháp lý cao nhất xác định rõ sự phân tầng mục tiêu: Tiểu học đặt nền móng, THCS củng cố và định hướng luồng ban đầu, THPT hoàn thiện học vấn và định hướng nghề nghiệp cụ thể.',
      }),
    ),

    // PHẦN III: 3 NGUYÊN LÝ GIÁO DỤC NỀN TẢNG (ĐIỀU 5)
    createElement(
      'section',
      { id: '3-ba-nguyen-ly-giao-duc', className: 'space-y-4' },
      createElement(
        'div',
        {
          className:
            'flex items-center gap-2 text-amber-900 font-serif font-bold text-xl border-b border-stone-200 pb-2',
        },
        createElement(Compass, { className: 'h-5 w-5 text-amber-800' }),
        createElement('h3', null, '3. Ba Nguyên lý Giáo dục Nền tảng (Điều 5 Luật Giáo dục 2019)'),
      ),
      createElement(LegalQuoteCard, {
        lawTitle: 'Luật Giáo dục 2019',
        article: 'Điều 5, Khoản 2. Nguyên lý giáo dục',
        quote:
          'Hoạt động giáo dục được thực hiện theo nguyên lý học đi đôi với hành, lý luận gắn liền với thực tiễn, giáo dục nhà trường kết hợp với giáo dục gia đình và giáo dục xã hội.',
        source: 'Luật Giáo dục số 43/2019/QH14',
        sourceUrl: '/docs/giao-duc-hoc/Luat_Giao_duc_2019.pdf',
        significance:
          'Nguyên tắc vàng chỉ đạo phương pháp và tổ chức mọi hoạt động dạy học, giáo dục nhân cách ở trường phổ thông.',
      }),
      createElement(
        'div',
        { className: 'grid gap-4 sm:grid-cols-3' },
        createElement(
          Card,
          { className: 'p-5 rounded-2xl border-amber-900/15 bg-[#faf8f2]' },
          createElement(
            'div',
            { className: 'flex items-center gap-2 text-amber-900 font-bold text-sm' },
            createElement(CheckCircle2, { className: 'h-4 w-4 text-amber-700' }),
            createElement('span', null, 'Học đi đôi với hành'),
          ),
          createElement(
            'p',
            { className: 'mt-2 text-xs leading-relaxed text-stone-600' },
            'Tránh lối học vẹt, học sách vở giáo điều. Mọi tri thức tiếp thu được phải được đưa vào thực hành rèn luyện kỹ năng, làm bài tập, thí nghiệm và áp dụng vào cuộc sống hằng ngày.',
          ),
        ),
        createElement(
          Card,
          { className: 'p-5 rounded-2xl border-amber-900/15 bg-[#faf8f2]' },
          createElement(
            'div',
            { className: 'flex items-center gap-2 text-amber-900 font-bold text-sm' },
            createElement(CheckCircle2, { className: 'h-4 w-4 text-amber-700' }),
            createElement('span', null, 'Lý luận gắn với thực tiễn'),
          ),
          createElement(
            'p',
            { className: 'mt-2 text-xs leading-relaxed text-stone-600' },
            'Khoa học bắt nguồn từ thực tiễn và quay trở lại phục vụ thực tiễn. Bài giảng của giáo viên phải luôn liên hệ với bối cảnh xã hội, các vấn đề thời sự và môi trường sống của học sinh.',
          ),
        ),
        createElement(
          Card,
          { className: 'p-5 rounded-2xl border-amber-900/15 bg-[#faf8f2]' },
          createElement(
            'div',
            { className: 'flex items-center gap-2 text-amber-900 font-bold text-sm' },
            createElement(CheckCircle2, { className: 'h-4 w-4 text-amber-700' }),
            createElement('span', null, 'Nhà trường - Gia đình - Xã hội'),
          ),
          createElement(
            'p',
            { className: 'mt-2 text-xs leading-relaxed text-stone-600' },
            'Tam giác giáo dục tạo thành sức mạnh cộng hưởng tổng hợp. Nếu ba lực lượng này mâu thuẫn hoặc buông lỏng một mắt xích thì hiệu quả giáo dục nhân cách sẽ bị suy giảm nghiêm trọng.',
          ),
        ),
      ),
    ),

    // PHẦN IV: TÌNH HUỐNG SƯ PHẠM MINH HỌA
    createElement(
      'section',
      { id: '4-tinh-huong-su-pham-nguyen-ly-3', className: 'space-y-4' },
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
          '4. Phòng nghiệm Sư phạm: Xử lý Tình huống Phối hợp Nhà trường & Gia đình',
        ),
      ),
      createElement(CaseStudyBox, { caseStudy: caseStudyParentalDuty }),
    ),

    // NÚT HOÀN THÀNH BÀI HỌC
    createElement(LessonCompletionCard, {
      lessonId: 'gdh-c2-b3-giao-duc-hoc-la-mot-khoa-hoc-muc-dich-va-nguyen-ly-giao-duc',
      lessonTitle: 'Bài 2.3: Giáo dục học là một khoa học, Mục đích & Nguyên lý giáo dục',
    }),
  );
};

// ============================================================================
// 4. DISPATCHER TRÌNH NẠP BÀI HỌC CHƯƠNG 2 (GETCHAPTER2LESSONMODULE)
// ============================================================================

export function getChapter2LessonModule(lessonId: string): CompiledLessonModule | null {
  if (lessonId === 'gdh-c2-b1-ban-chat-va-cac-chuc-nang-xa-hoi-cua-giao-duc') {
    return {
      default: Lesson2_1View,
      frontmatter: {
        title: 'Bài 2.1: Bản chất và các chức năng xã hội của giáo dục',
        description:
          'Khái niệm giáo dục như một hiện tượng xã hội đặc biệt; cơ chế di truyền xã hội; phân tích chuyên sâu 3 chức năng xã hội: Kinh tế - sản xuất, Chính trị - xã hội, Tư tưởng - văn hóa.',
        level: 'basic',
        tags: ['Bản chất giáo dục', 'Chức năng xã hội', 'Di truyền xã hội', 'CLO 2'],
      },
      lessonMeta: {
        chapterNumber: 2,
        lessonNumber: 1,
        headings: [
          {
            id: '1-ban-chat-hien-tuong-xa-hoi',
            text: '1. Bản chất của Giáo dục: Hiện tượng xã hội đặc biệt & Cơ chế di truyền xã hội',
            depth: 2,
          },
          {
            id: '2-ba-chuc-nang-xa-hoi',
            text: '2. Ba Chức năng Xã hội Cơ bản của Giáo dục',
            depth: 2,
          },
          {
            id: '3-bang-doi-chieu',
            text: '3. Bảng Đối chiếu Mối quan hệ giữa 3 Chức năng Xã hội',
            depth: 2,
          },
        ],
        blocks: [],
      },
    };
  }

  if (lessonId === 'gdh-c2-b2-giao-duc-va-su-phat-trien-nhan-cach') {
    return {
      default: Lesson2_2View,
      frontmatter: {
        title: 'Bài 2.2: Giáo dục và Sự phát triển nhân cách',
        description:
          'Khái niệm nhân cách, phê phán thuyết tiền định và thuyết duy cảm; phân tích mối quan hệ biện chứng giữa 4 yếu tố: Di truyền, Môi trường, Hoạt động cá nhân và Giáo dục giữ vai trò chủ đạo.',
        level: 'intermediate',
        tags: [
          'Phát triển nhân cách',
          'Biện chứng 4 yếu tố',
          'Vai trò chủ đạo',
          'Thi tự luận',
          'CLO 2',
        ],
      },
      lessonMeta: {
        chapterNumber: 2,
        lessonNumber: 2,
        headings: [
          {
            id: '1-khai-niem-nhan-cach',
            text: '1. Khái niệm Nhân cách & Hai quan niệm sai lầm cực đoan',
            depth: 2,
          },
          {
            id: '2-bien-chung-4-yeu-to',
            text: '2. Mối quan hệ Biện chứng giữa 4 Yếu tố Hình thành & Phát triển Nhân cách',
            depth: 2,
          },
          {
            id: '3-dan-y-thi-tu-luan',
            text: '3. Hướng dẫn Dàn ý Câu hỏi Tự luận Kinh điển (Kiểm tra A1.10 & Thi Học phần)',
            depth: 2,
          },
        ],
        blocks: [],
      },
    };
  }

  if (lessonId === 'gdh-c2-b3-giao-duc-hoc-la-mot-khoa-hoc-muc-dich-va-nguyen-ly-giao-duc') {
    return {
      default: Lesson2_3View,
      frontmatter: {
        title: 'Bài 2.3: Giáo dục học là một khoa học, Mục đích & Nguyên lý giáo dục',
        description:
          'Đối tượng, nhiệm vụ của GDH; mục tiêu GDPT 3 cấp học theo Điều 28 và 3 nguyên lý giáo dục nền tảng theo Điều 5 Luật Giáo dục 2019; giải quyết tình huống phụ huynh phó mặc việc giáo dục.',
        level: 'basic',
        tags: [
          'Khoa học Giáo dục',
          'Luật Giáo dục 2019',
          'Mục tiêu GDPT',
          'Nguyên lý giáo dục',
          'CLO 1',
          'CLO 2',
        ],
      },
      lessonMeta: {
        chapterNumber: 2,
        lessonNumber: 3,
        headings: [
          {
            id: '1-giao-duc-hoc-la-khoa-hoc',
            text: '1. Đối tượng, Nhiệm vụ và Phương pháp Nghiên cứu của GDH',
            depth: 2,
          },
          {
            id: '2-muc-tieu-gdpt-dieu-28',
            text: '2. Mục tiêu Giáo dục Phổ thông theo Điều 28 Luật Giáo dục 2019',
            depth: 2,
          },
          {
            id: '3-ba-nguyen-ly-giao-duc',
            text: '3. Ba Nguyên lý Giáo dục Nền tảng (Điều 5 Luật Giáo dục 2019)',
            depth: 2,
          },
          {
            id: '4-tinh-huong-su-pham-nguyen-ly-3',
            text: '4. Phòng nghiệm Sư phạm: Xử lý Tình huống Phối hợp Nhà trường & Gia đình',
            depth: 2,
          },
        ],
        blocks: [],
      },
    };
  }

  return null;
}
