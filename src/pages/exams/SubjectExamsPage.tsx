import {
  ArrowLeft,
  BookOpen,
  Calendar,
  CheckSquare,
  Clock,
  Eye,
  FileText,
  GraduationCap,
  ImageIcon,
  Sparkles,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router';
import { getSubjectBySlug } from '@/content-runtime';
import { GTHMB_EXAM_PAPERS } from '@/data/courses/giai-tich-ham-mot-bien/exams';
import { ExamImageModal } from '@/features/exams/ExamImageModal';
import { ExamProblemCard } from '@/features/exams/ExamProblemCard';
import { MathGlossaryPopover, MathGlossaryProvider } from '@/features/math-glossary';
import { ROUTES } from '@/shared/config/routes';
import { cn } from '@/shared/lib/cn';
import { FadeIn } from '@/shared/motion/FadeIn';
import { Badge, Button, Card } from '@/shared/ui';

export function SubjectExamsPage() {
  const { subjectSlug = 'giai-tich-ham-mot-bien' } = useParams<{ subjectSlug?: string }>();
  const subject = getSubjectBySlug(subjectSlug);
  const [searchParams, setSearchParams] = useSearchParams();

  // Danh sách đề thi theo môn học hiện tại (hiện tại hỗ trợ Giải tích hàm một biến)
  const examPapers = useMemo(() => {
    if (subjectSlug === 'giai-tich-ham-mot-bien') {
      return GTHMB_EXAM_PAPERS;
    }
    return [];
  }, [subjectSlug]);

  // Bộ đề được chọn theo query param hoặc mặc định là đề đầu tiên (mới nhất 2025-2026)
  const selectedExamId = searchParams.get('exam') || examPapers[0]?.id || '';
  const activePaper = useMemo(
    () => examPapers.find((paper) => paper.id === selectedExamId) || examPapers[0],
    [examPapers, selectedExamId],
  );

  // Trạng thái modal xem ảnh đề gốc
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);

  // Trạng thái mở hàng loạt lời giải / gợi ý
  const [expandAllSolutions, setExpandAllSolutions] = useState(false);
  const [expandAllHints, setExpandAllHints] = useState(false);

  const handleSelectExam = (examId: string) => {
    setSearchParams({ exam: examId }, { replace: true });
    // Reset mở rộng khi đổi đề
    setExpandAllSolutions(false);
    setExpandAllHints(false);
  };

  // Tính tổng điểm của đề hiện tại
  const totalPoints = useMemo(() => {
    if (!activePaper) return 10;
    return activePaper.problems.reduce((sum, p) => sum + p.points, 0);
  }, [activePaper]);

  if (!subject) {
    return (
      <FadeIn className="mx-auto max-w-xl py-12 text-center">
        <Card className="space-y-4 p-8">
          <h1 className="text-2xl font-bold text-stone-900">Không tìm thấy môn học</h1>
          <p className="text-sm text-stone-600">
            Đường dẫn môn học <code className="font-mono text-stone-800">{subjectSlug}</code> không
            tồn tại.
          </p>
          <div className="flex justify-center gap-3 pt-2">
            <Button asChild variant="primary" size="sm">
              <Link to={ROUTES.subjects}>
                <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                <span>Danh sách môn học</span>
              </Link>
            </Button>
          </div>
        </Card>
      </FadeIn>
    );
  }

  return (
    <MathGlossaryProvider courseId={subjectSlug}>
      <FadeIn className="mx-auto max-w-5xl space-y-6 pb-16">
        {/* Thanh điều hướng quay lại & Header */}
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-3">
            <Button asChild variant="ghost" size="sm" className="gap-1.5 text-xs text-stone-600">
              <Link to={ROUTES.subjectOverview(subject.slug)}>
                <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                <span>Quay lại tổng quan môn {subject.title}</span>
              </Link>
            </Button>

            <div className="flex items-center gap-2">
              <Badge variant="subject">Toán học</Badge>
              <Badge variant="neutral">MATH1403</Badge>
            </div>
          </div>

          {/* Hero banner */}
          <div className="border-subject-200/90 from-subject-50/50 relative overflow-hidden rounded-3xl border bg-gradient-to-br via-white to-stone-50/70 p-6 shadow-xs sm:p-8">
            <div className="relative z-10 space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-subject-800 bg-subject-100/80 inline-flex items-center gap-1.5 rounded-full px-3 py-0.5 text-xs font-bold">
                  <GraduationCap className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>Ngân hàng Đề thi Chính thức &amp; Lời giải Thực chiến</span>
                </span>
                <Badge variant="neutral">6 Bộ đề qua các năm · 41 Bài toán tự luận</Badge>
              </div>

              <h1 className="font-serif text-2xl font-bold tracking-tight text-stone-900 sm:text-3xl">
                Đề thi Kết thúc Học phần {subject.title}
              </h1>

              <p className="max-w-3xl text-sm leading-relaxed text-stone-600 sm:text-base">
                Hệ thống hóa toàn bộ các đề thi học kỳ chính thức từ năm 2018 đến 2026. Mỗi bài toán
                đều có thang điểm chuẩn, gợi ý định lý trọng tâm và lời giải chi tiết từng bước được
                số hóa 100% bằng KaTeX phục vụ ôn thi đạt điểm tối đa.
              </p>
            </div>
          </div>
        </div>

        {examPapers.length === 0 ? (
          <Card className="p-8 text-center">
            <p className="text-base font-medium text-stone-800">
              Ngân hàng đề thi của môn học này đang trong quá trình biên soạn và số hóa.
            </p>
            <p className="mt-1 text-sm text-stone-500">
              Vui lòng quay lại sau khi dữ liệu đề thi được xuất bản.
            </p>
          </Card>
        ) : (
          <>
            {/* Bộ chọn năm thi (Tabs / Dropdown) */}
            <div className="rounded-2xl border border-stone-200/90 bg-white p-3 shadow-2xs sm:p-4">
              <div className="mb-2 flex items-center justify-between px-1">
                <span className="flex items-center gap-1.5 text-xs font-bold text-stone-700 uppercase">
                  <Calendar className="h-3.5 w-3.5 text-stone-500" aria-hidden="true" />
                  <span>Chọn năm thi &amp; Học kỳ</span>
                </span>
                <span className="text-xs text-stone-500">
                  Đang xem: <strong className="text-stone-800">{activePaper?.year}</strong> (
                  {activePaper?.semester})
                </span>
              </div>

              {/* Desktop / Tablet Tab buttons */}
              <div className="flex flex-wrap gap-2">
                {examPapers.map((paper, idx) => {
                  const isSelected = paper.id === activePaper?.id;
                  return (
                    <button
                      key={paper.id}
                      type="button"
                      onClick={() => handleSelectExam(paper.id)}
                      className={cn(
                        'flex items-center gap-2 rounded-xl border px-3.5 py-2 text-xs font-medium transition-all sm:text-sm',
                        isSelected
                          ? 'border-subject-600 bg-subject-600 text-white shadow-xs'
                          : 'border-stone-200 bg-stone-50/80 text-stone-700 hover:border-stone-300 hover:bg-stone-100',
                      )}
                    >
                      <span>{paper.year}</span>
                      <span
                        className={cn(
                          'rounded-md px-1.5 py-0.5 text-[11px] font-semibold',
                          isSelected ? 'bg-white/20 text-white' : 'bg-stone-200/80 text-stone-600',
                        )}
                      >
                        {paper.semester.replace('Học kỳ ', 'HK')}
                      </span>
                      {idx === 0 && (
                        <span
                          className={cn(
                            'py-0.2 rounded-full px-1.5 text-[10px] font-bold tracking-wider uppercase',
                            isSelected
                              ? 'bg-amber-300 text-stone-900'
                              : 'bg-amber-100 text-amber-800',
                          )}
                        >
                          Mới
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Chi tiết đề thi đang chọn & Thanh tác vụ */}
            {activePaper && (
              <div className="space-y-4">
                <div className="rounded-2xl border border-stone-200/90 bg-white p-5 shadow-xs sm:p-6">
                  <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                    <div className="space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge variant="subject">{activePaper.year}</Badge>
                        <Badge variant="neutral">{activePaper.semester}</Badge>
                        <span className="flex items-center gap-1 text-xs text-stone-500">
                          <Clock className="h-3.5 w-3.5" aria-hidden="true" />
                          <span>Thời gian: {activePaper.durationMinutes} phút</span>
                        </span>
                        <span className="flex items-center gap-1 text-xs text-stone-500">
                          <CheckSquare className="h-3.5 w-3.5" aria-hidden="true" />
                          <span>Thang điểm: {totalPoints.toFixed(1)} / 10 điểm</span>
                        </span>
                      </div>

                      <h2 className="text-lg font-bold text-stone-900 sm:text-xl">
                        {activePaper.title}
                      </h2>

                      <p className="text-xs leading-relaxed text-stone-600 sm:text-sm">
                        {activePaper.description}
                      </p>
                    </div>

                    {/* Nút Xem ảnh đề gốc & Công cụ điều khiển */}
                    <div className="flex shrink-0 flex-wrap items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setIsImageModalOpen(true)}
                        className="border-subject-300 bg-subject-50/60 text-subject-800 hover:bg-subject-100 gap-1.5 text-xs font-semibold"
                      >
                        <ImageIcon className="h-4 w-4" aria-hidden="true" />
                        <span>Xem ảnh đề gốc</span>
                      </Button>
                    </div>
                  </div>

                  {/* Thanh điều khiển hiển thị hàng loạt */}
                  <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-stone-100 pt-3.5 text-xs text-stone-600">
                    <span className="flex items-center gap-1.5 font-medium">
                      <FileText className="h-4 w-4 text-stone-400" aria-hidden="true" />
                      <span>Danh sách {activePaper.problems.length} câu hỏi tự luận</span>
                    </span>

                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setExpandAllHints(!expandAllHints)}
                        className="h-7 text-xs text-amber-700 hover:bg-amber-50"
                      >
                        <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
                        <span>{expandAllHints ? 'Ẩn tất cả gợi ý' : 'Hiện tất cả gợi ý'}</span>
                      </Button>

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setExpandAllSolutions(!expandAllSolutions)}
                        className="text-subject-700 hover:bg-subject-50 h-7 text-xs"
                      >
                        <Eye className="h-3.5 w-3.5" aria-hidden="true" />
                        <span>
                          {expandAllSolutions ? 'Thu gọn tất cả giải' : 'Mở tất cả lời giải'}
                        </span>
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Danh sách các bài toán của đề thi */}
                <div className="space-y-4">
                  {activePaper.problems.map((problem) => (
                    <ExamProblemCard
                      key={`${activePaper.id}-${problem.id}`}
                      problem={problem}
                      defaultExpandSolution={expandAllSolutions}
                      defaultExpandHint={expandAllHints}
                    />
                  ))}
                </div>

                {/* Modal xem ảnh đề gốc */}
                <ExamImageModal
                  open={isImageModalOpen}
                  onOpenChange={setIsImageModalOpen}
                  imagePath={activePaper.originalImagePath}
                  title={activePaper.title}
                  year={`${activePaper.year} (${activePaper.semester})`}
                />
              </div>
            )}

            {/* Chân trang điều hướng */}
            <div className="mt-8 rounded-2xl border border-stone-200/80 bg-white p-5 text-center shadow-2xs sm:p-6">
              <h3 className="text-sm font-bold text-stone-800">Cần ôn lại nền tảng lý thuyết?</h3>
              <p className="mt-1 text-xs text-stone-600">
                Xem lại 7 chương bài học hoặc đề cương trọng tâm và 5 câu tự luận đề mẫu học phần.
              </p>
              <div className="mt-4 flex flex-wrap justify-center gap-3">
                <Button asChild variant="outline" size="sm" className="gap-1.5 text-xs">
                  <Link to={ROUTES.subjectOverview(subject.slug)}>
                    <BookOpen className="h-3.5 w-3.5" aria-hidden="true" />
                    <span>Tổng quan môn học &amp; 7 Chương</span>
                  </Link>
                </Button>
                <Button asChild variant="subject" size="sm" className="gap-1.5 text-xs">
                  <Link to="/mon-hoc/giai-tich-ham-mot-bien/on-tap-cuoi-khoa-va-de-thi-mau/de-cuong-trong-tam-ly-thuyet-va-cam-nang-bai-tap-on-thi">
                    <GraduationCap className="h-3.5 w-3.5" aria-hidden="true" />
                    <span>Đề cương trọng tâm &amp; Đề mẫu</span>
                  </Link>
                </Button>
              </div>
            </div>
          </>
        )}
      </FadeIn>
      <MathGlossaryPopover />
    </MathGlossaryProvider>
  );
}

export default SubjectExamsPage;
