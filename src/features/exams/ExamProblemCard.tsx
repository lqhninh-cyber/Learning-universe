import { CheckCircle2, ChevronDown, HelpCircle, Lightbulb } from 'lucide-react';
import { useState } from 'react';
import type { ExamProblem, ExamProblemPart } from '@/data/courses/giai-tich-ham-mot-bien/exams';
import { MathText } from '@/features/exams/MathText';
import { cn } from '@/shared/lib/cn';
import { Badge, Button } from '@/shared/ui';

export interface ExamProblemCardProps {
  readonly problem: ExamProblem;
  readonly defaultExpandSolution?: boolean;
  readonly defaultExpandHint?: boolean;
}

export function ExamProblemCard({
  problem,
  defaultExpandSolution = false,
  defaultExpandHint = false,
}: ExamProblemCardProps) {
  const [userOverrideSolution, setUserOverrideSolution] = useState<boolean | null>(null);
  const [userOverrideHint, setUserOverrideHint] = useState<boolean | null>(null);
  const [prevDefaultSolution, setPrevDefaultSolution] = useState(defaultExpandSolution);
  const [prevDefaultHint, setPrevDefaultHint] = useState(defaultExpandHint);

  if (prevDefaultSolution !== defaultExpandSolution) {
    setPrevDefaultSolution(defaultExpandSolution);
    setUserOverrideSolution(null);
  }
  if (prevDefaultHint !== defaultExpandHint) {
    setPrevDefaultHint(defaultExpandHint);
    setUserOverrideHint(null);
  }

  const showSolution = userOverrideSolution ?? defaultExpandSolution;
  const showHint = userOverrideHint ?? defaultExpandHint;

  const handleToggleHint = () => {
    setUserOverrideHint(!showHint);
  };

  const handleToggleSolution = () => {
    setUserOverrideSolution(!showSolution);
  };

  // Kiểm tra xem bài có gợi ý hoặc lời giải hay không (kể cả trong các phần con)
  const hasRootHint = Boolean(problem.hint);
  const hasRootSolution = Boolean(problem.solution);
  const hasParts = Boolean(problem.parts && problem.parts.length > 0);
  const canToggleHint = hasRootHint || Boolean(problem.parts?.some((p) => p.hint));
  const canToggleSolution = hasRootSolution || hasParts;

  return (
    <div className="rounded-2xl border border-stone-200/90 bg-white p-5 shadow-xs transition-all hover:border-stone-300 sm:p-6">
      {/* Header bài toán */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-stone-100 pb-3.5">
        <div className="flex flex-wrap items-center gap-2.5">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-stone-900 text-xs font-bold text-white">
            {problem.number}
          </span>
          <h3 className="text-base font-bold text-stone-900">
            {problem.title
              ? `Bài ${problem.number}: ${problem.title}`
              : `Bài toán ${problem.number}`}
          </h3>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="neutral" className="font-mono text-xs font-semibold text-stone-800">
            {problem.points.toFixed(1)} điểm
          </Badge>

          {/* Toggle gợi ý */}
          {canToggleHint && (
            <Button
              variant={showHint ? 'secondary' : 'outline'}
              size="sm"
              onClick={handleToggleHint}
              className={cn(
                'h-7 gap-1 px-2.5 text-xs',
                showHint && 'border-amber-300 bg-amber-50 text-amber-800 hover:bg-amber-100',
              )}
            >
              <Lightbulb className="h-3.5 w-3.5" aria-hidden="true" />
              <span>{showHint ? 'Ẩn gợi ý' : '💡 Gợi ý định lý'}</span>
            </Button>
          )}

          {/* Toggle lời giải */}
          {canToggleSolution && (
            <Button
              variant={showSolution ? 'secondary' : 'subject'}
              size="sm"
              onClick={handleToggleSolution}
              className="h-7 gap-1 px-2.5 text-xs"
            >
              <span>{showSolution ? 'Thu gọn lời giải' : '📝 Lời giải chi tiết'}</span>
              <ChevronDown
                className={cn(
                  'h-3.5 w-3.5 transition-transform duration-200',
                  showSolution && 'rotate-180',
                )}
                aria-hidden="true"
              />
            </Button>
          )}
        </div>
      </div>

      {/* Nội dung đề bài chính */}
      {problem.statement && (
        <div className="mt-3.5 text-stone-800">
          <MathText text={problem.statement} />
        </div>
      )}

      {/* Khung Gợi ý định lý (cấp cao nhất) */}
      {hasRootHint && showHint && (
        <div className="mt-3 rounded-xl border border-amber-200/90 bg-amber-50/60 p-4 text-xs text-amber-900">
          <div className="flex items-center gap-1.5 font-bold tracking-wide text-amber-800 uppercase">
            <Lightbulb className="h-4 w-4" aria-hidden="true" />
            <span>Gợi ý định lý &amp; Hướng giải</span>
          </div>
          <div className="mt-2 text-stone-800">
            <MathText text={problem.hint!} />
          </div>
        </div>
      )}

      {/* Khung Lời giải chi tiết (cấp cao nhất) */}
      {hasRootSolution && showSolution && (
        <div className="border-subject-200/80 from-subject-50/20 mt-4 rounded-xl border bg-gradient-to-b to-white p-4.5 sm:p-5">
          <div className="text-subject-900 flex items-center justify-between border-b border-stone-200/80 pb-2.5 text-xs font-bold uppercase">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="text-subject-600 h-4 w-4" aria-hidden="true" />
              <span>Lời giải thực chiến chi tiết</span>
            </span>
            <span className="font-mono text-stone-500">[{problem.points.toFixed(1)} điểm]</span>
          </div>
          <div className="mt-3">
            <MathText text={problem.solution!} />
          </div>
        </div>
      )}

      {/* Danh sách các ý nhỏ (Parts a, b, c) nếu có */}
      {hasParts && (
        <div className="mt-4 space-y-4 pt-2">
          {problem.parts!.map((part, partIdx) => (
            <ProblemPartItem
              key={`part-${problem.id}-${partIdx}`}
              part={part}
              defaultOpenSolution={showSolution}
              defaultOpenHint={showHint}
            />
          ))}
        </div>
      )}
    </div>
  );
}

interface ProblemPartItemProps {
  readonly part: ExamProblemPart;
  readonly defaultOpenSolution: boolean;
  readonly defaultOpenHint: boolean;
}

function ProblemPartItem({ part, defaultOpenSolution, defaultOpenHint }: ProblemPartItemProps) {
  const [userOverridePartSolution, setUserOverridePartSolution] = useState<boolean | null>(null);
  const [userOverridePartHint, setUserOverridePartHint] = useState<boolean | null>(null);
  const [prevDefaultOpenSolution, setPrevDefaultOpenSolution] = useState(defaultOpenSolution);
  const [prevDefaultOpenHint, setPrevDefaultOpenHint] = useState(defaultOpenHint);

  if (prevDefaultOpenSolution !== defaultOpenSolution) {
    setPrevDefaultOpenSolution(defaultOpenSolution);
    setUserOverridePartSolution(null);
  }
  if (prevDefaultOpenHint !== defaultOpenHint) {
    setPrevDefaultOpenHint(defaultOpenHint);
    setUserOverridePartHint(null);
  }

  const showPartSolution = userOverridePartSolution ?? defaultOpenSolution;
  const showPartHint = userOverridePartHint ?? defaultOpenHint;

  const handleTogglePartHint = () => {
    setUserOverridePartHint(!showPartHint);
  };

  const handleTogglePartSolution = () => {
    setUserOverridePartSolution(!showPartSolution);
  };

  return (
    <div className="rounded-xl border border-stone-200/80 bg-stone-50/40 p-4 transition-colors hover:border-stone-300 sm:p-4.5">
      {/* Tiêu đề ý nhỏ & Nút điều khiển */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-stone-100 pb-2.5">
        <div className="flex items-center gap-2">
          <span className="font-mono text-xs font-bold text-stone-900 uppercase">
            Ý {part.label}
          </span>
          {part.points !== undefined && (
            <Badge variant="neutral" className="font-mono text-[11px] text-stone-700">
              {part.points.toFixed(1)} đ
            </Badge>
          )}
        </div>

        <div className="flex items-center gap-2">
          {part.hint && (
            <Button
              variant={showPartHint ? 'secondary' : 'outline'}
              size="sm"
              onClick={handleTogglePartHint}
              className={cn(
                'h-6 gap-1 px-2 text-[11px]',
                showPartHint && 'border-amber-300 bg-amber-50 text-amber-800',
              )}
            >
              <Lightbulb className="h-3 w-3" aria-hidden="true" />
              <span>{showPartHint ? 'Ẩn gợi ý' : '💡 Gợi ý'}</span>
            </Button>
          )}

          <Button
            variant={showPartSolution ? 'secondary' : 'outline'}
            size="sm"
            onClick={handleTogglePartSolution}
            className={cn(
              'h-6 gap-1 px-2 text-[11px]',
              showPartSolution && 'border-subject-300 bg-subject-50 text-subject-800',
            )}
          >
            <span>{showPartSolution ? 'Đóng giải' : '📝 Lời giải'}</span>
            <ChevronDown
              className={cn(
                'h-3 w-3 transition-transform duration-200',
                showPartSolution && 'rotate-180',
              )}
              aria-hidden="true"
            />
          </Button>
        </div>
      </div>

      {/* Đề bài ý nhỏ */}
      <div className="mt-2.5 text-stone-800">
        <MathText text={part.statement} />
      </div>

      {/* Gợi ý định lý cho ý nhỏ */}
      {part.hint && showPartHint && (
        <div className="mt-3 rounded-lg border border-amber-200 bg-amber-50/70 p-3 text-xs text-amber-900">
          <div className="flex items-center gap-1 font-semibold text-amber-800">
            <HelpCircle className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Gợi ý phương pháp</span>
          </div>
          <div className="mt-1.5 text-stone-800">
            <MathText text={part.hint} />
          </div>
        </div>
      )}

      {/* Lời giải chi tiết cho ý nhỏ */}
      {showPartSolution && (
        <div className="border-subject-200 from-subject-50/15 mt-3 rounded-lg border bg-gradient-to-b to-white p-3.5 sm:p-4">
          <div className="text-subject-900 flex items-center justify-between border-b border-stone-200/80 pb-2 text-[11px] font-bold uppercase">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="text-subject-600 h-3.5 w-3.5" aria-hidden="true" />
              <span>Chứng minh / Tính toán chi tiết</span>
            </span>
            {part.points !== undefined && (
              <span className="font-mono text-stone-500">[{part.points.toFixed(1)} đ]</span>
            )}
          </div>
          <div className="mt-2.5">
            <MathText text={part.solution} />
          </div>
        </div>
      )}
    </div>
  );
}
