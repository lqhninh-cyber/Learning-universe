import { CheckSquare, Clock, Eye, FileText, ShieldAlert, Sparkles } from 'lucide-react';
import { useMemo, useState } from 'react';
import type { ExamPaper } from '@/data/courses/exam-bank-types';
import { ExamProblemCard } from '@/features/exams/ExamProblemCard';
import { MathText } from '@/features/exams/MathText';
import { Badge, Button } from '@/shared/ui';

export interface ExamPaperPracticeViewProps {
  readonly paper: ExamPaper;
  readonly variantLabel: string;
}

/**
 * Hiển thị một đề thi hoàn chỉnh kèm thanh điều khiển ẩn/hiện gợi ý và lời giải từng câu
 * để sinh viên tự luyện tập trước khi đối chiếu đáp án chuẩn.
 */
export function ExamPaperPracticeView({ paper, variantLabel }: ExamPaperPracticeViewProps) {
  const [expandAllSolutions, setExpandAllSolutions] = useState(false);
  const [expandAllHints, setExpandAllHints] = useState(false);
  const [prevPaperId, setPrevPaperId] = useState(paper.id);

  if (prevPaperId !== paper.id) {
    setPrevPaperId(paper.id);
    setExpandAllSolutions(false);
    setExpandAllHints(false);
  }

  const totalPoints = useMemo(
    () => paper.problems.reduce((sum, problem) => sum + problem.points, 0),
    [paper.problems],
  );

  const hasAnyHint = useMemo(
    () =>
      paper.problems.some(
        (problem) => Boolean(problem.hint) || Boolean(problem.parts?.some((p) => Boolean(p.hint))),
      ),
    [paper.problems],
  );

  const prefix = paper.questionPrefix ?? 'Câu';

  return (
    <div className="space-y-5">
      {/* Thẻ thông tin chung của đề thi & Bộ nút điều khiển */}
      <div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-5 shadow-xs sm:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="space-y-2.5">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="subject">{variantLabel}</Badge>
              <Badge variant="neutral">
                {paper.year} · {paper.semester}
              </Badge>
              {paper.examCourseCode && (
                <Badge variant="neutral" className="font-mono text-[11px]">
                  Mã HP: {paper.examCourseCode}
                </Badge>
              )}
            </div>

            <h3 className="font-serif text-lg font-bold tracking-tight text-[var(--text-main)] sm:text-xl">
              {paper.title}
            </h3>

            <div className="text-xs leading-relaxed text-[var(--text-muted)] sm:text-sm">
              <MathText text={paper.description} />
            </div>

            <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 pt-1 text-xs text-[var(--text-muted)]">
              <span className="inline-flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5 text-[var(--accent-primary)]" aria-hidden="true" />
                <span>Thời gian: {paper.durationMinutes} phút</span>
              </span>
              <span className="inline-flex items-center gap-1.5">
                <CheckSquare
                  className="h-3.5 w-3.5 text-[var(--accent-primary)]"
                  aria-hidden="true"
                />
                <span>Thang điểm: {totalPoints.toFixed(1)} / 10 điểm</span>
              </span>
              {paper.allowedMaterials && (
                <span className="inline-flex items-center gap-1.5">
                  <ShieldAlert className="h-3.5 w-3.5 text-[var(--gold-text)]" aria-hidden="true" />
                  <span>{paper.allowedMaterials}</span>
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Thanh công cụ luyện đề */}
        <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-[var(--border-subtle)] pt-3.5 text-xs">
          <span className="inline-flex items-center gap-1.5 font-medium text-[var(--text-muted)]">
            <FileText className="h-4 w-4" aria-hidden="true" />
            <span>
              Gồm {paper.problems.length} {prefix.toLowerCase()} tự luận · Nhấn nút ở từng câu để tự
              kiểm tra đáp án
            </span>
          </span>

          <div className="flex flex-wrap items-center gap-2">
            {hasAnyHint && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setExpandAllHints((prev) => !prev)}
                className="h-8 gap-1.5 text-xs transition-all duration-200 active:scale-[0.98]"
              >
                <Sparkles className="h-3.5 w-3.5 text-amber-600" aria-hidden="true" />
                <span>{expandAllHints ? 'Ẩn tất cả gợi ý' : 'Hiện tất cả gợi ý'}</span>
              </Button>
            )}

            <Button
              variant={expandAllSolutions ? 'secondary' : 'subject'}
              size="sm"
              onClick={() => setExpandAllSolutions((prev) => !prev)}
              className="h-8 gap-1.5 text-xs transition-all duration-200 active:scale-[0.98]"
            >
              <Eye className="h-3.5 w-3.5" aria-hidden="true" />
              <span>{expandAllSolutions ? 'Thu gọn tất cả lời giải' : 'Mở tất cả lời giải'}</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Danh sách câu hỏi & lời giải từng câu */}
      <div className="space-y-4">
        {paper.problems.map((problem) => (
          <ExamProblemCard
            key={`${paper.id}-${problem.id}`}
            problem={problem}
            questionPrefix={paper.questionPrefix}
            defaultExpandSolution={expandAllSolutions}
            defaultExpandHint={expandAllHints}
          />
        ))}
      </div>
    </div>
  );
}
