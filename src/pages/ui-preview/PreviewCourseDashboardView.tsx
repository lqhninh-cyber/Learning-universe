import {
  ArrowRight,
  CheckCircle2,
  ChevronDown,
  Clock,
  FileQuestion,
  FileText,
  Layers,
  Lightbulb,
  Play,
  Sparkles,
  Trophy,
} from 'lucide-react';
import { type FC, useMemo, useState } from 'react';
import { EXTERNAL_LINKS, GOOGLE_DRIVE_DOCS_URL } from '@/shared/config/routes';
import { cn } from '@/shared/lib/cn';
import { type PreviewCourseSlug, type VisualDirection, VISUAL_DIRECTIONS } from './types';

export interface PreviewCourseDashboardViewProps {
  readonly direction: VisualDirection;
  readonly courseSlug: PreviewCourseSlug;
  readonly onCourseSlugChange: (slug: PreviewCourseSlug) => void;
  readonly motionEnabled: boolean;
}

export const PreviewCourseDashboardView: FC<PreviewCourseDashboardViewProps> = ({
  direction,
  courseSlug,
  onCourseSlugChange,
  motionEnabled,
}) => {
  const meta = VISUAL_DIRECTIONS[direction];
  const [activeTab, setActiveTab] = useState<'roadmap' | 'documents' | 'practice'>('roadmap');
  const [expandedChapter, setExpandedChapter] = useState<number | null>(1);
  const [activeExamYear, setActiveExamYear] = useState('2025-2026');

  const isCalculus = courseSlug === 'giai-tich-ham-mot-bien';

  // Dữ liệu mẫu phong phú cho 2 môn học
  const courseData = useMemo(() => {
    if (isCalculus) {
      return {
        slug: 'giai-tich-ham-mot-bien',
        title: 'Giải tích hàm một biến',
        credits: '3 Tín chỉ',
        badge: 'Khối Toán học',
        instructor: 'GV. Trần Trí Dũng (Khoa Toán - Tin, HCMUE)',
        description:
          'Nghiên cứu cấu trúc tập số thực, lý thuyết giới hạn dãy số và hàm số, hàm liên tục, phép tính vi phân và tích phân Riemann một biến thực cùng chuỗi số học thuật.',
        clos: [
          'CLO 1: Nắm vững nguyên lý Supremum & tính trù mật của số thực',
          'CLO 2: Thành thạo ngôn ngữ epsilon - N và tiêu chuẩn Cauchy',
          'CLO 3: Ứng dụng định lý giá trị trung gian và khai triển Taylor',
        ],
        stats: {
          totalLessons: 24,
          completedLessons: 16,
          percent: 67,
          totalHours: '45 giờ',
          examsCount: 6,
          docsCount: 8,
        },
        chapters: [
          {
            number: 1,
            title: 'Tập hợp số thực và Tiên đề Supremum',
            lessonsCount: 3,
            completedCount: 3,
            progress: 100,
            duration: '4.5 giờ',
            lessons: [
              {
                id: '1-1',
                title: 'Tiên đề tập số thực và tính chất thứ tự',
                type: 'theory',
                duration: '25 min',
                done: true,
              },
              {
                id: '1-2',
                title: 'Cận trên, Cận dưới và Tiên đề Supremum',
                type: 'theorem',
                duration: '35 min',
                done: true,
              },
              {
                id: '1-3',
                title: 'Nguyên lý Archimedes & Tính trù mật của Q',
                type: 'exercise',
                duration: '30 min',
                done: true,
              },
            ],
          },
          {
            number: 2,
            title: 'Dãy số thực và Giới hạn dãy số',
            lessonsCount: 4,
            completedCount: 3,
            progress: 75,
            duration: '6.0 giờ',
            lessons: [
              {
                id: '2-1',
                title: 'Định nghĩa giới hạn dãy theo ngôn ngữ ε - N',
                type: 'theory',
                duration: '30 min',
                done: true,
              },
              {
                id: '2-2',
                title: 'Định lý kẹp và các phép toán giới hạn',
                type: 'theorem',
                duration: '40 min',
                done: true,
              },
              {
                id: '2-3',
                title: 'Định lý hội tụ đơn điệu Weierstrass',
                type: 'theorem',
                duration: '35 min',
                done: true,
              },
              {
                id: '2-4',
                title: 'Dãy con và Định lý Bolzano-Weierstrass',
                type: 'theorem',
                duration: '45 min',
                done: false,
              },
            ],
          },
          {
            number: 3,
            title: 'Giới hạn hàm số và Hàm liên tục',
            lessonsCount: 4,
            completedCount: 2,
            progress: 50,
            duration: '6.5 giờ',
            lessons: [
              {
                id: '3-1',
                title: 'Định nghĩa giới hạn hàm số (ngôn ngữ ε - δ)',
                type: 'theory',
                duration: '35 min',
                done: true,
              },
              {
                id: '3-2',
                title: 'Tính liên tục tại một điểm và trên một đoạn',
                type: 'theorem',
                duration: '30 min',
                done: true,
              },
              {
                id: '3-3',
                title: 'Định lý giá trị trung gian Bolzano-Cauchy',
                type: 'theorem',
                duration: '40 min',
                done: false,
              },
              {
                id: '3-4',
                title: 'Tính liên tục đều và Định lý Cantor',
                type: 'exercise',
                duration: '35 min',
                done: false,
              },
            ],
          },
          {
            number: 4,
            title: 'Đạo hàm và Vi phân hàm một biến',
            lessonsCount: 5,
            completedCount: 3,
            progress: 60,
            duration: '8.0 giờ',
            lessons: [
              {
                id: '4-1',
                title: 'Ý nghĩa hình học & vật lý của đạo hàm',
                type: 'theory',
                duration: '30 min',
                done: true,
              },
              {
                id: '4-2',
                title: 'Các quy tắc tính đạo hàm và đạo hàm hàm hợp',
                type: 'exercise',
                duration: '40 min',
                done: true,
              },
              {
                id: '4-3',
                title: 'Định lý Rolle, Lagrange và Cauchy',
                type: 'theorem',
                duration: '45 min',
                done: true,
              },
              {
                id: '4-4',
                title: 'Quy tắc L’Hôpital khử dạng vô định',
                type: 'exercise',
                duration: '35 min',
                done: false,
              },
              {
                id: '4-5',
                title: 'Công thức Taylor và xấp xỉ đa thức',
                type: 'theorem',
                duration: '50 min',
                done: false,
              },
            ],
          },
          {
            number: 5,
            title: 'Tích phân Riemann và Ứng dụng',
            lessonsCount: 4,
            completedCount: 2,
            progress: 50,
            duration: '7.0 giờ',
            lessons: [
              {
                id: '5-1',
                title: 'Tổng Darboux và Định nghĩa tích phân Riemann',
                type: 'theory',
                duration: '40 min',
                done: true,
              },
              {
                id: '5-2',
                title: 'Tiêu chuẩn khả tích Riemann',
                type: 'theorem',
                duration: '35 min',
                done: true,
              },
              {
                id: '5-3',
                title: 'Định lý cơ bản của Giải tích (Newton-Leibniz)',
                type: 'theorem',
                duration: '45 min',
                done: false,
              },
              {
                id: '5-4',
                title: 'Các phương pháp đổi biến và tích phân từng phần',
                type: 'exercise',
                duration: '40 min',
                done: false,
              },
            ],
          },
        ],
      };
    }

    return {
      slug: 'giao-duc-hoc',
      title: 'Giáo dục học',
      credits: '04 Tín chỉ',
      badge: 'Khối Khoa học Giáo dục',
      instructor: 'TS. Lê Thị Thu Liễu (Khoa Khoa học Giáo dục, HCMUE)',
      description:
        'Trang bị hệ thống tri thức nền tảng về bản chất, chức năng xã hội của giáo dục, các nguyên tắc tổ chức hoạt động giáo dục học sinh, nghiệp vụ công tác giáo viên chủ nhiệm và năng lực giải quyết tình huống sư phạm.',
      clos: [
        'CLO 1: Phân tích sâu sắc bản chất hiện tượng xã hội của giáo dục',
        'CLO 2: Vận dụng chuẩn mực 6 nguyên tắc giáo dục vào thực tiễn phổ thông',
        'CLO 3: Thành thạo quy trình 5 bước xử lý tình huống sư phạm & kỷ luật tích cực',
      ],
      stats: {
        totalLessons: 20,
        completedLessons: 14,
        percent: 70,
        totalHours: '45 giờ',
        examsCount: 20, // 20 case studies
        docsCount: 14,
      },
      chapters: [
        {
          number: 1,
          title: 'Hoạt động sư phạm và Người giáo viên phổ thông',
          lessonsCount: 4,
          completedCount: 4,
          progress: 100,
          duration: '6.0 giờ',
          lessons: [
            {
              id: '1-1',
              title: 'Hoạt động sư phạm của người giáo viên',
              type: 'theory',
              duration: '30 min',
              done: true,
            },
            {
              id: '1-2',
              title: 'Nhân cách & Chuẩn nghề nghiệp GVPT (TT20)',
              type: 'theorem',
              duration: '40 min',
              done: true,
            },
            {
              id: '1-3',
              title: 'Rèn luyện để trở thành người giáo viên hiệu quả',
              type: 'exercise',
              duration: '35 min',
              done: true,
            },
            {
              id: '1-4',
              title: 'Tình huống sư phạm & Cẩm nang ôn tập Ch.1',
              type: 'case-study',
              duration: '45 min',
              done: true,
            },
          ],
        },
        {
          number: 2,
          title: 'Bản chất giáo dục, Vai trò và Giáo dục học',
          lessonsCount: 3,
          completedCount: 3,
          progress: 100,
          duration: '5.0 giờ',
          lessons: [
            {
              id: '2-1',
              title: 'Bản chất và các Chức năng xã hội của Giáo dục',
              type: 'theory',
              duration: '35 min',
              done: true,
            },
            {
              id: '2-2',
              title: 'Vai trò của Giáo dục đối với sự phát triển',
              type: 'theory',
              duration: '40 min',
              done: true,
            },
            {
              id: '2-3',
              title: 'Mục đích & Mục tiêu giáo dục Việt Nam (CT GDPT 2018)',
              type: 'exercise',
              duration: '30 min',
              done: true,
            },
          ],
        },
        {
          number: 3,
          title: 'Quá trình giáo dục và 6 Nguyên tắc cơ bản',
          lessonsCount: 3,
          completedCount: 2,
          progress: 67,
          duration: '6.0 giờ',
          lessons: [
            {
              id: '3-1',
              title: 'Bản chất và cấu trúc quá trình giáo dục',
              type: 'theory',
              duration: '35 min',
              done: true,
            },
            {
              id: '3-2',
              title: 'Hệ thống 6 Nguyên tắc giáo dục học sinh',
              type: 'theorem',
              duration: '45 min',
              done: true,
            },
            {
              id: '3-3',
              title: 'Vận dụng nguyên tắc vào giải quyết tình huống',
              type: 'case-study',
              duration: '40 min',
              done: false,
            },
          ],
        },
        {
          number: 4,
          title: 'Công tác của Người Giáo viên Chủ nhiệm lớp',
          lessonsCount: 4,
          completedCount: 3,
          progress: 75,
          duration: '7.5 giờ',
          lessons: [
            {
              id: '4-1',
              title: 'Vị trí, chức năng & nhiệm vụ của GVCN (TT32)',
              type: 'theory',
              duration: '35 min',
              done: true,
            },
            {
              id: '4-2',
              title: 'Phương pháp kỷ luật tích cực & 4 mục tiêu sai lệch',
              type: 'theorem',
              duration: '40 min',
              done: true,
            },
            {
              id: '4-3',
              title: 'Xây dựng tập thể học sinh tự quản đoàn kết',
              type: 'exercise',
              duration: '35 min',
              done: true,
            },
            {
              id: '4-4',
              title: 'Phối hợp gia đình, nhà trường và xã hội',
              type: 'case-study',
              duration: '40 min',
              done: false,
            },
          ],
        },
        {
          number: 5,
          title: 'Hoạt động trải nghiệm & Hướng nghiệp trong nhà trường',
          lessonsCount: 4,
          completedCount: 2,
          progress: 50,
          duration: '6.0 giờ',
          lessons: [
            {
              id: '5-1',
              title: 'Bản chất & mục tiêu Hoạt động trải nghiệm 2018',
              type: 'theory',
              duration: '30 min',
              done: true,
            },
            {
              id: '5-2',
              title: '4 mạch nội dung & 4 hình thức tổ chức',
              type: 'theorem',
              duration: '35 min',
              done: true,
            },
            {
              id: '5-3',
              title: 'Thiết kế kế hoạch hoạt động trải nghiệm',
              type: 'exercise',
              duration: '45 min',
              done: false,
            },
            {
              id: '5-4',
              title: 'Đánh giá năng lực theo Rubric chuẩn A.1.9',
              type: 'exercise',
              duration: '35 min',
              done: false,
            },
          ],
        },
        {
          number: 6,
          title: 'Cẩm nang Xử lý Tình huống & Đề cương Ôn thi Tổng hợp',
          lessonsCount: 2,
          completedCount: 0,
          progress: 0,
          duration: '5.0 giờ',
          lessons: [
            {
              id: '6-1',
              title: 'Ngân hàng 20 tình huống sư phạm thực tế',
              type: 'case-study',
              duration: '60 min',
              done: false,
            },
            {
              id: '6-2',
              title: 'Đề cương ôn tập & Hệ thống 20 câu trắc nghiệm',
              type: 'exercise',
              duration: '50 min',
              done: false,
            },
          ],
        },
      ],
    };
  }, [isCalculus]);

  return (
    <div className="space-y-10 pt-24 pb-28 sm:pt-28" data-motion={motionEnabled}>
      {/* =========================================================================
          1. COURSE EDITORIAL HEADER & FLOATING PROGRESS PANEL
          ========================================================================= */}
      <section className="mx-auto max-w-[1360px] px-4 sm:px-6 lg:px-8">
        {/* Bộ chuyển đổi nhanh môn học mẫu */}
        <div className="mb-6 flex items-center justify-between border-b border-stone-200/80 pb-4">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold tracking-wider text-stone-500 uppercase">
              Chuyển đổi môn mẫu:
            </span>
            <div className="inline-flex rounded-xl border border-stone-300 bg-white p-1 shadow-2xs">
              <button
                type="button"
                onClick={() => onCourseSlugChange('giai-tich-ham-mot-bien')}
                className={cn(
                  'cursor-pointer rounded-lg px-3 py-1 text-xs font-semibold transition-all',
                  isCalculus
                    ? 'bg-amber-900 text-white shadow-2xs'
                    : 'text-stone-600 hover:text-stone-900',
                )}
              >
                Giải tích hàm một biến (Toán)
              </button>
              <button
                type="button"
                onClick={() => onCourseSlugChange('giao-duc-hoc')}
                className={cn(
                  'cursor-pointer rounded-lg px-3 py-1 text-xs font-semibold transition-all',
                  !isCalculus
                    ? 'bg-teal-900 text-white shadow-2xs'
                    : 'text-stone-600 hover:text-stone-900',
                )}
              >
                Giáo dục học (Sư phạm)
              </button>
            </div>
          </div>

          <span className="hidden text-xs text-stone-500 sm:inline">
            Khung nhìn: <strong className="text-stone-900">{meta.name}</strong>
          </span>
        </div>

        {/* Khung Header chính: Editorial Header (Left) + Floating Progress Panel (Right) */}
        <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-12 lg:gap-10">
          {/* CỘT TRÁI (Header Thông tin học thuật - 8 Cols) */}
          <div className="space-y-4 lg:col-span-8">
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={cn(
                  'rounded-full px-3 py-0.5 text-xs font-bold uppercase',
                  isCalculus ? 'bg-amber-100 text-amber-900' : 'bg-teal-100 text-teal-900',
                )}
              >
                {courseData.badge}
              </span>
              <span className="rounded-full border border-stone-300/80 bg-white px-2.5 py-0.5 text-xs font-medium text-stone-700">
                {courseData.credits}
              </span>
            </div>

            <h1
              className={cn(
                'text-3xl leading-[1.15] font-bold tracking-tight text-stone-900 sm:text-4xl lg:text-5xl',
                direction === 'atelier' && 'font-sans',
                direction === 'spatial' && 'font-serif text-stone-900',
                direction === 'editorial' && 'font-serif text-stone-900 italic',
              )}
            >
              {courseData.title}
            </h1>

            <p className="text-xs font-medium text-stone-500 sm:text-sm">
              Giảng viên phụ trách:{' '}
              <strong className="text-stone-800">{courseData.instructor}</strong>
            </p>

            <p className="max-w-3xl text-sm leading-relaxed text-stone-700 sm:text-base sm:leading-relaxed">
              {courseData.description}
            </p>

            {/* CLO Pills */}
            <div className="pt-2">
              <span className="text-xs font-bold tracking-wider text-stone-500 uppercase">
                Chuẩn đầu ra học phần (Course Learning Outcomes):
              </span>
              <div className="mt-2 space-y-1.5">
                {courseData.clos.map((clo, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-2 rounded-xl border border-stone-200/80 bg-stone-50/80 px-3 py-1.5 text-xs text-stone-700"
                  >
                    <CheckCircle2
                      className="h-3.5 w-3.5 shrink-0 text-emerald-600"
                      aria-hidden="true"
                    />
                    <span>{clo}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* CỘT PHẢI: FLOATING PROGRESS PANEL (Bảng tiến độ không gian riêng - 4 Cols) */}
          <div className="lg:col-span-4">
            <div
              className={cn(
                'rounded-3xl border p-6 transition-all duration-300',
                direction === 'atelier' && 'border-stone-300 bg-white shadow-xs',
                direction === 'spatial' &&
                  'border-white/80 bg-white/85 shadow-xl ring-1 ring-stone-900/5 backdrop-blur-xl',
                direction === 'editorial' && 'border-stone-300 bg-[#faf8f2] shadow-sm',
              )}
            >
              <div className="flex items-center justify-between border-b border-stone-100 pb-3">
                <span className="text-xs font-bold tracking-wider text-stone-500 uppercase">
                  Tiến độ học phần
                </span>
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-900">
                  <Trophy className="h-3 w-3" aria-hidden="true" />
                  <span>Đang dẫn đầu</span>
                </span>
              </div>

              {/* Progress Ring & Big Percent */}
              <div className="my-5 flex items-center justify-around gap-4">
                <div className="relative flex h-24 w-24 items-center justify-center">
                  {/* SVG Progress Ring */}
                  <svg className="h-full w-full -rotate-90" viewBox="0 0 36 36">
                    <path
                      className="text-stone-200"
                      strokeWidth="3.5"
                      stroke="currentColor"
                      fill="none"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                    <path
                      className={isCalculus ? 'text-amber-800' : 'text-teal-800'}
                      strokeDasharray={`${courseData.stats.percent}, 100`}
                      strokeWidth="3.5"
                      strokeLinecap="round"
                      stroke="currentColor"
                      fill="none"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                  </svg>
                  <div className="absolute flex flex-col items-center">
                    <span className="font-mono text-xl font-black text-stone-900">
                      {courseData.stats.percent}%
                    </span>
                    <span className="text-[9px] text-stone-500">Đã học</span>
                  </div>
                </div>

                <div className="space-y-1.5 text-xs">
                  <div>
                    <span className="font-bold text-stone-900">
                      {courseData.stats.completedLessons} / {courseData.stats.totalLessons}
                    </span>
                    <p className="text-[11px] text-stone-500">Bài học hoàn thành</p>
                  </div>
                  <div>
                    <span className="font-bold text-stone-900">{courseData.stats.totalHours}</span>
                    <p className="text-[11px] text-stone-500">Thời lượng học tập</p>
                  </div>
                </div>
              </div>

              {/* Action Button: Tiếp tục bài học */}
              <button
                type="button"
                className={cn(
                  'flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl py-3 text-xs font-bold text-white shadow-md transition-all',
                  isCalculus
                    ? 'bg-amber-900 shadow-amber-900/10 hover:bg-amber-950'
                    : 'bg-teal-900 shadow-teal-900/10 hover:bg-teal-950',
                )}
              >
                <Play className="h-3.5 w-3.5" aria-hidden="true" />
                <span>Tiếp tục bài học kế tiếp</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          2. INTERACTIVE TABS CÓ ANIMATED TAB INDICATOR
          ========================================================================= */}
      <section className="mx-auto max-w-[1360px] px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between border-b border-stone-200/90 pb-3">
          {/* Animated Tab Bar */}
          <div
            className="relative inline-flex items-center gap-1 rounded-2xl border border-stone-200 bg-stone-100/90 p-1"
            role="tablist"
            aria-label="Các phân khu chức năng môn học"
          >
            {/* Tab 1: Lộ trình */}
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'roadmap'}
              onClick={() => setActiveTab('roadmap')}
              className={cn(
                'relative z-10 flex cursor-pointer items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all sm:text-sm',
                activeTab === 'roadmap'
                  ? 'bg-white text-stone-900 shadow-xs'
                  : 'text-stone-600 hover:text-stone-900',
              )}
            >
              <Layers className="h-4 w-4" aria-hidden="true" />
              <span>Lộ trình bài học ({courseData.stats.totalLessons})</span>
            </button>

            {/* Tab 2: Tài liệu & Văn bản */}
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'documents'}
              onClick={() => setActiveTab('documents')}
              className={cn(
                'relative z-10 flex cursor-pointer items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all sm:text-sm',
                activeTab === 'documents'
                  ? 'bg-white text-stone-900 shadow-xs'
                  : 'text-stone-600 hover:text-stone-900',
              )}
            >
              <FileText className="h-4 w-4" aria-hidden="true" />
              <span>Không gian Tài liệu ({courseData.stats.docsCount})</span>
            </button>

            {/* Tab 3: Đề thi / Tình huống */}
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'practice'}
              onClick={() => setActiveTab('practice')}
              className={cn(
                'relative z-10 flex cursor-pointer items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all sm:text-sm',
                activeTab === 'practice'
                  ? 'bg-white text-stone-900 shadow-xs'
                  : 'text-stone-600 hover:text-stone-900',
              )}
            >
              {isCalculus ? (
                <>
                  <FileQuestion className="h-4 w-4" aria-hidden="true" />
                  <span>Ôn tập ({courseData.stats.examsCount})</span>
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" aria-hidden="true" />
                  <span>20 Tình huống Sư phạm</span>
                </>
              )}
            </button>
          </div>

          <div className="hidden text-xs text-stone-500 lg:block">
            Tự động đồng bộ tiến độ học tập qua Git &amp; Supabase
          </div>
        </div>

        {/* =======================================================================
            TAB 1: LỘ TRÌNH BÀI HỌC (LAYERED EXPANDABLE CARDS + STICKY SIDEBAR)
            ======================================================================= */}
        {activeTab === 'roadmap' && (
          <div className="mt-8 grid grid-cols-1 items-start gap-8 lg:grid-cols-12">
            {/* CỘT PHỤ (Sticky Chapter Quick-Nav - 3 Cols) */}
            <aside className="hidden lg:col-span-3 lg:block">
              <div className="sticky top-28 space-y-2 rounded-2xl border border-stone-200/90 bg-white/80 p-4 shadow-xs backdrop-blur-sm">
                <div className="flex items-center justify-between border-b border-stone-100 pb-2.5">
                  <span className="text-xs font-bold tracking-wider text-stone-500 uppercase">
                    Điều hướng chương
                  </span>
                  <span className="font-mono text-xs font-bold text-stone-600">
                    {courseData.chapters.length} Chương
                  </span>
                </div>

                <div className="space-y-1 pt-1">
                  {courseData.chapters.map((ch) => (
                    <button
                      key={ch.number}
                      type="button"
                      onClick={() => setExpandedChapter(ch.number)}
                      className={cn(
                        'flex w-full cursor-pointer items-center justify-between rounded-xl px-3 py-2 text-left text-xs transition-all',
                        expandedChapter === ch.number
                          ? 'border border-amber-900/20 bg-amber-900/10 font-bold text-amber-950'
                          : 'text-stone-700 hover:bg-stone-100',
                      )}
                    >
                      <span className="truncate">
                        Chương {ch.number}: {ch.title}
                      </span>
                      <span className="ml-2 shrink-0 font-mono text-[10px] font-bold text-stone-500">
                        {ch.progress}%
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </aside>

            {/* CỘT CHÍNH (Layered Expandable Chapter Cards - 9 Cols) */}
            <div className="space-y-4 lg:col-span-9">
              {courseData.chapters.map((ch) => {
                const isExpanded = expandedChapter === ch.number;
                return (
                  <div
                    key={ch.number}
                    className={cn(
                      'rounded-3xl border transition-all duration-300',
                      isExpanded
                        ? 'border-amber-900/30 bg-white shadow-md ring-1 ring-amber-900/5'
                        : 'border-stone-200/90 bg-white/90 shadow-2xs hover:border-stone-300',
                    )}
                  >
                    {/* Chapter Card Header */}
                    <div
                      onClick={() => setExpandedChapter(isExpanded ? null : ch.number)}
                      className="flex cursor-pointer flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6"
                    >
                      <div className="flex items-start gap-4">
                        <div
                          className={cn(
                            'flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl font-serif text-base font-bold shadow-2xs',
                            ch.progress === 100
                              ? 'bg-emerald-100 text-emerald-900'
                              : 'bg-amber-100 text-amber-900',
                          )}
                        >
                          {ch.progress === 100 ? (
                            <CheckCircle2 className="h-6 w-6 text-emerald-700" />
                          ) : (
                            <span>{ch.number}</span>
                          )}
                        </div>
                        <div>
                          <span className="text-[11px] font-bold tracking-wider text-amber-900/80 uppercase">
                            Chương {ch.number} · {ch.duration}
                          </span>
                          <h3 className="text-base font-bold text-stone-900 sm:text-lg">
                            {ch.title}
                          </h3>
                        </div>
                      </div>

                      {/* Right Meta & Toggle */}
                      <div className="flex items-center justify-between gap-4 sm:justify-end">
                        <div className="flex flex-col text-right">
                          <span className="font-mono text-xs font-bold text-stone-900">
                            {ch.completedCount}/{ch.lessonsCount} Bài
                          </span>
                          <span className="text-[10px] text-stone-500">
                            {ch.progress}% Hoàn thành
                          </span>
                        </div>
                        <div
                          className={cn(
                            'flex h-8 w-8 items-center justify-center rounded-full bg-stone-100 text-stone-600 transition-transform duration-200',
                            isExpanded && 'rotate-180 bg-amber-900 text-white',
                          )}
                        >
                          <ChevronDown className="h-4 w-4" />
                        </div>
                      </div>
                    </div>

                    {/* Expandable Lessons List */}
                    {isExpanded && (
                      <div className="border-t border-stone-100 bg-[#faf8f2]/40 p-5 sm:p-6">
                        <div className="space-y-2.5">
                          {ch.lessons.map((lesson) => (
                            <div
                              key={lesson.id}
                              className="group flex flex-col justify-between gap-2 rounded-2xl border border-stone-200/80 bg-white p-3.5 shadow-2xs transition-all hover:border-amber-400 sm:flex-row sm:items-center sm:p-4"
                            >
                              <div className="flex items-center gap-3">
                                <span
                                  className={cn(
                                    'flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs',
                                    lesson.done
                                      ? 'bg-emerald-100 text-emerald-800'
                                      : 'border border-stone-300 text-stone-400',
                                  )}
                                >
                                  {lesson.done ? <CheckCircle2 className="h-4 w-4" /> : '○'}
                                </span>
                                <div>
                                  <div className="flex items-center gap-2">
                                    <span className="rounded bg-stone-100 px-1.5 py-0.5 text-[10px] font-bold text-stone-600 uppercase">
                                      {lesson.type}
                                    </span>
                                    <h4 className="text-xs font-bold text-stone-900 group-hover:text-amber-900 sm:text-sm">
                                      {lesson.title}
                                    </h4>
                                  </div>
                                </div>
                              </div>

                              <div className="flex items-center justify-between gap-3 sm:justify-end">
                                <span className="inline-flex items-center gap-1 text-[11px] text-stone-500">
                                  <Clock className="h-3 w-3" />
                                  <span>{lesson.duration}</span>
                                </span>
                                <button
                                  type="button"
                                  className="inline-flex cursor-pointer items-center gap-1 rounded-lg border border-stone-200 bg-stone-50 px-2.5 py-1 text-xs font-medium text-stone-700 transition-colors hover:bg-stone-900 hover:text-white"
                                >
                                  <span>Đọc bài</span>
                                  <ArrowRight className="h-3 w-3" />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* =======================================================================
            TAB 2: KHÔNG GIAN TÀI LIỆU SỐ
            ======================================================================= */}
        {activeTab === 'documents' && (
          <div className="mt-8 space-y-6">
            <div className="rounded-3xl border border-stone-200/90 bg-white p-6 shadow-xs sm:p-8">
              <div className="flex flex-col justify-between gap-4 border-b border-stone-100 pb-5 sm:flex-row sm:items-center">
                <div>
                  <h3 className="font-serif text-xl font-bold text-stone-900">
                    Kho Lưu Trữ Tài Liệu &amp; Văn Bản Pháp Quy
                  </h3>
                  <p className="text-xs text-stone-600">
                    Toàn bộ tài liệu được số hóa dạng PDF, có thể đọc trực tiếp trong ứng dụng hoặc
                    tải về máy.
                  </p>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <span className="rounded-full bg-teal-100 px-3 py-1 font-bold text-teal-900">
                    {courseData.stats.docsCount} Tài liệu chính thức
                  </span>
                </div>
              </div>

              {/* Lưới tài liệu */}
              <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                {isCalculus ? (
                  <>
                    <div className="rounded-2xl border border-stone-200/90 bg-white p-4.5 shadow-2xs">
                      <span className="text-[10px] font-bold text-amber-800 uppercase">
                        Giáo trình chính thức
                      </span>
                      <h4 className="mt-1 text-sm font-bold text-stone-900">
                        Giáo trình Giải tích hàm một biến — GV. Trần Trí Dũng
                      </h4>
                      <p className="mt-1 text-xs text-stone-500">
                        Toàn văn giáo trình chuẩn mực giảng dạy tại Khoa Toán - Tin, ĐH Sư phạm
                        TP.HCM.
                      </p>
                      <div className="mt-4 flex items-center justify-between border-t border-stone-100 pt-2 text-xs">
                        <span className="text-stone-400">PDF · Google Drive</span>
                        <a
                          href={EXTERNAL_LINKS.giaiTichHamMotBienPdf}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-bold text-amber-900 hover:underline"
                        >
                          Xem PDF
                        </a>
                      </div>
                    </div>
                    <div className="rounded-2xl border border-stone-200/90 bg-white p-4.5 shadow-2xs">
                      <span className="text-[10px] font-bold text-amber-800 uppercase">
                        Đề cương chi tiết
                      </span>
                      <h4 className="mt-1 text-sm font-bold text-stone-900">
                        Nội dung Ôn tập kết thúc học phần &amp; Đề mẫu
                      </h4>
                      <p className="mt-1 text-xs text-stone-500">
                        Trọng tâm lý thuyết và cẩm nang giải toán 6 chương cốt lõi.
                      </p>
                      <div className="mt-4 flex items-center justify-between border-t border-stone-100 pt-2 text-xs">
                        <span className="text-stone-400">PDF · Google Drive</span>
                        <a
                          href={EXTERNAL_LINKS.giaiTichDeCuongPdf}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-bold text-amber-900 hover:underline"
                        >
                          Xem PDF
                        </a>
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="rounded-2xl border border-stone-200/90 bg-white p-4.5 shadow-2xs">
                      <span className="text-[10px] font-bold text-teal-800 uppercase">
                        Giáo trình HCMUE
                      </span>
                      <h4 className="mt-1 text-sm font-bold text-stone-900">
                        Giáo trình Giáo dục học — Trường ĐHSP TP.HCM
                      </h4>
                      <p className="mt-1 text-xs text-stone-500">
                        Hệ thống hóa đầy đủ lao động sư phạm, nguyên tắc và công tác GVCN lớp.
                      </p>
                      <div className="mt-4 flex items-center justify-between border-t border-stone-100 pt-2 text-xs">
                        <span className="text-stone-400">PDF · Google Drive</span>
                        <a
                          href={EXTERNAL_LINKS.giaoDucHocPdf}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-bold text-teal-900 hover:underline"
                        >
                          Xem PDF
                        </a>
                      </div>
                    </div>
                    <div className="rounded-2xl border border-stone-200/90 bg-white p-4.5 shadow-2xs">
                      <span className="text-[10px] font-bold text-teal-800 uppercase">
                        Văn bản pháp quy
                      </span>
                      <h4 className="mt-1 text-sm font-bold text-stone-900">
                        Chiến lược phát triển giáo dục Việt Nam
                      </h4>
                      <p className="mt-1 text-xs text-stone-500">
                        Định hướng chiến lược, mục tiêu đổi mới căn bản toàn diện giáo dục đào tạo.
                      </p>
                      <div className="mt-4 flex items-center justify-between border-t border-stone-100 pt-2 text-xs">
                        <span className="text-stone-400">PDF · Google Drive</span>
                        <a
                          href={GOOGLE_DRIVE_DOCS_URL}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-bold text-teal-900 hover:underline"
                        >
                          Xem PDF
                        </a>
                      </div>
                    </div>
                    <div className="rounded-2xl border border-stone-200/90 bg-white p-4.5 shadow-2xs">
                      <span className="text-[10px] font-bold text-teal-800 uppercase">
                        Chuẩn nghề nghiệp
                      </span>
                      <h4 className="mt-1 text-sm font-bold text-stone-900">
                        Thông tư 20/2018/TT-BGDĐT Chuẩn nghề nghiệp GVPT
                      </h4>
                      <p className="mt-1 text-xs text-stone-500">
                        5 tiêu chuẩn và 15 tiêu chí đánh giá năng lực nghề nghiệp giáo viên phổ
                        thông.
                      </p>
                      <div className="mt-4 flex items-center justify-between border-t border-stone-100 pt-2 text-xs">
                        <span className="text-stone-400">PDF · Google Drive</span>
                        <a
                          href={GOOGLE_DRIVE_DOCS_URL}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-bold text-teal-900 hover:underline"
                        >
                          Xem PDF
                        </a>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        )}

        {/* =======================================================================
            TAB 3: ĐỀ THI & THỰC HÀNH TÌNH HUỐNG
            ======================================================================= */}
        {activeTab === 'practice' && (
          <div className="mt-8 space-y-6">
            <div className="rounded-3xl border border-stone-200/90 bg-white p-6 shadow-xs sm:p-8">
              {isCalculus ? (
                /* Giao diện Ngân hàng Đề thi Giải tích */
                <div className="space-y-6">
                  <div className="flex flex-col justify-between gap-4 border-b border-stone-100 pb-4 sm:flex-row sm:items-center">
                    <div>
                      <h3 className="font-serif text-xl font-bold text-stone-900">
                        Ôn tập môn Giải tích hàm một biến (6 Bộ Đề)
                      </h3>
                      <p className="text-xs text-stone-600">
                        Các đề thi chính thức từ năm 2018 đến 2026 kèm thang điểm và gợi ý định lý.
                      </p>
                    </div>

                    <div className="inline-flex rounded-xl border border-stone-300 bg-stone-100 p-1">
                      {['2025-2026', '2024-2025', '2021', '2020-2021'].map((yr) => (
                        <button
                          key={yr}
                          type="button"
                          onClick={() => setActiveExamYear(yr)}
                          className={cn(
                            'cursor-pointer rounded-lg px-2.5 py-1 text-xs font-semibold transition-all',
                            activeExamYear === yr
                              ? 'bg-amber-900 text-white shadow-2xs'
                              : 'text-stone-600 hover:text-stone-900',
                          )}
                        >
                          {yr}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Bài toán mẫu đề thi */}
                  <div className="space-y-3 rounded-2xl border border-stone-200/80 bg-stone-50/50 p-5">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-bold text-amber-900">
                        Câu 1 (2.0 điểm) · Năm học {activeExamYear}
                      </span>
                      <span className="text-xs text-stone-500">Giới hạn dãy số</span>
                    </div>
                    <p className="font-serif text-sm leading-relaxed text-stone-800">
                      {
                        'Cho dãy số thực (x_n) thỏa mãn điều kiện x₁ = √2 và x_{n+1} = √(2 + x_n) với mọi n ≥ 1. Chứng minh rằng dãy số (x_n) hội tụ và tìm lim_{n → ∞} x_n.'
                      }
                    </p>
                    <div className="flex items-center gap-3 pt-2">
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-900">
                        <Lightbulb className="h-3.5 w-3.5" />
                        <span>Định lý hội tụ đơn điệu Weierstrass</span>
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                /* Giao diện 20 Tình huống Sư phạm */
                <div className="space-y-6">
                  <div>
                    <h3 className="font-serif text-xl font-bold text-stone-900">
                      Ngân Hàng 20 Tình Huống Sư Phạm Thực Tế &amp; Cẩm Nang Xử Lý 5 Bước
                    </h3>
                    <p className="text-xs text-stone-600">
                      Bám sát tiêu chí Rubric đánh giá năng lực nghiệp vụ sư phạm (HCMUE).
                    </p>
                  </div>

                  <div className="space-y-3 rounded-2xl border border-teal-200/90 bg-teal-50/40 p-5">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-bold text-teal-950">
                        Tình huống 01: Học sinh cá biệt gây rối trật tự
                      </span>
                      <span className="rounded bg-teal-100 px-2 py-0.5 text-[10px] font-bold text-teal-900">
                        Kỷ luật tích cực
                      </span>
                    </div>
                    <p className="text-sm leading-relaxed text-stone-800">
                      Trong giờ sinh hoạt lớp, em N thường xuyên ngắt lời giáo viên và trêu chọc các
                      bạn xung quanh khiến không khí lớp bị gián đoạn...
                    </p>
                    <div className="flex items-center gap-2 pt-1 text-xs font-semibold text-teal-900">
                      <span>
                        Quy trình xử lý 5 bước: Lắng nghe thấu cảm &rarr; Nhận diện mục tiêu sai
                        lệch &rarr; Thỏa thuận quy ước chung
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </section>
    </div>
  );
};
