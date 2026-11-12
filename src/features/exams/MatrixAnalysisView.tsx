import { BarChart3, Check, CheckCircle2, ClipboardList, RotateCcw, Target } from 'lucide-react';
import { useMemo, useState } from 'react';
import type { ExamMatrixAnalysis, MatrixDistributionSegment } from '@/data/courses/exam-bank-types';
import { KatexDisplayFormula, MathText } from '@/features/exams/MathText';
import { cn } from '@/shared/lib/cn';
import { Badge, Button } from '@/shared/ui';

export interface MatrixAnalysisViewProps {
  readonly subjectSlug: string;
  readonly analysis: ExamMatrixAnalysis;
}

const SEGMENT_TONE_CLASSES: Readonly<
  Record<
    MatrixDistributionSegment['tone'],
    { readonly bar: string; readonly badge: string; readonly dot: string }
  >
> = {
  primary: {
    bar: 'bg-[#1B3D2F]',
    badge:
      'border-[#1B3D2F]/25 bg-emerald-50/80 text-[#1B3D2F] dark:border-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-200',
    dot: 'bg-[#1B3D2F]',
  },
  secondary: {
    bar: 'bg-[var(--gold-line)]',
    badge:
      'border-amber-300/80 bg-amber-50/80 text-amber-900 dark:border-amber-700/60 dark:bg-amber-950/40 dark:text-amber-200',
    dot: 'bg-[var(--gold-line)]',
  },
  accent: {
    bar: 'bg-[var(--accent-verandah)]',
    badge:
      'border-emerald-300/80 bg-emerald-50/80 text-emerald-900 dark:border-emerald-700/60 dark:bg-emerald-950/40 dark:text-emerald-200',
    dot: 'bg-[var(--accent-verandah)]',
  },
};

function readChecklistStorage(storageKey: string): Record<string, boolean> {
  if (typeof window === 'undefined') return {};
  try {
    const raw = window.localStorage.getItem(storageKey);
    if (!raw) return {};
    const parsed: unknown = JSON.parse(raw);
    if (typeof parsed !== 'object' || parsed === null) return {};
    const result: Record<string, boolean> = {};
    for (const [key, value] of Object.entries(parsed)) {
      if (typeof value === 'boolean') {
        result[key] = value;
      }
    }
    return result;
  } catch {
    return {};
  }
}

function MatrixAnalysisContent({ subjectSlug, analysis }: MatrixAnalysisViewProps) {
  const storageKey = `lu_exam_checklist_${subjectSlug}`;
  const [checkedMap, setCheckedMap] = useState<Record<string, boolean>>(() =>
    readChecklistStorage(storageKey),
  );

  const updateCheckedMap = (
    updater: (prev: Record<string, boolean>) => Record<string, boolean>,
  ) => {
    setCheckedMap((prev) => {
      const next = updater(prev);
      if (typeof window !== 'undefined') {
        try {
          window.localStorage.setItem(storageKey, JSON.stringify(next));
        } catch {
          // Bỏ qua khi storage bị khóa
        }
      }
      return next;
    });
  };

  const totalChecklistItems = useMemo(
    () => analysis.focusChecklists.reduce((sum, group) => sum + group.items.length, 0),
    [analysis.focusChecklists],
  );

  const completedChecklistItems = useMemo(
    () =>
      analysis.focusChecklists.reduce(
        (sum, group) => sum + group.items.filter((item) => Boolean(checkedMap[item.id])).length,
        0,
      ),
    [analysis.focusChecklists, checkedMap],
  );

  const progressPercent =
    totalChecklistItems > 0 ? Math.round((completedChecklistItems / totalChecklistItems) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* 1. Tổng quan tỷ trọng & Cơ cấu điểm */}
      <section className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-5 shadow-xs sm:p-6">
        <div className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap items-center gap-2">
              <Badge className="border-[#1B3D2F] bg-[#1B3D2F] text-white">
                <BarChart3 className="h-3.5 w-3.5" aria-hidden="true" />
                <span>Phân bổ Tỷ trọng Điểm</span>
              </Badge>
              <Badge variant="neutral">{analysis.structureSummary}</Badge>
            </div>
          </div>

          <h3 className="font-serif text-lg font-bold text-[var(--text-main)] sm:text-xl">
            {analysis.headline}
          </h3>
          <div className="text-xs leading-relaxed text-[var(--text-muted)] sm:text-sm">
            <MathText text={analysis.summary} />
          </div>

          {/* Thanh tỷ trọng trực quan */}
          <div
            className="flex h-3 w-full overflow-hidden rounded-full bg-[var(--bg-sunken)]"
            aria-label="Biểu đồ tỷ trọng điểm theo mảng kiến thức"
          >
            {analysis.distribution.map((segment) => (
              <div
                key={segment.id}
                style={{ width: `${segment.percentage}%` }}
                className={cn(
                  'h-full transition-all duration-300 first:rounded-l-full last:rounded-r-full',
                  SEGMENT_TONE_CLASSES[segment.tone].bar,
                )}
                title={`${segment.label}: ${segment.percentage}%`}
              />
            ))}
          </div>

          {/* Các thẻ chi tiết tỷ trọng */}
          <div
            className={cn(
              'grid gap-4 pt-2',
              analysis.distribution.length === 2 ? 'md:grid-cols-2' : 'md:grid-cols-3',
            )}
          >
            {analysis.distribution.map((segment) => {
              const toneStyle = SEGMENT_TONE_CLASSES[segment.tone];
              return (
                <div
                  key={segment.id}
                  className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-sunken)]/50 p-4 transition-colors duration-200 hover:border-[var(--border-control)]"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="inline-flex items-center gap-2 text-xs font-bold text-[var(--text-main)]">
                      <span className={cn('h-2.5 w-2.5 rounded-full', toneStyle.dot)} />
                      <span>{segment.label}</span>
                    </span>
                    <span
                      className={cn(
                        'rounded-full border px-2.5 py-0.5 font-mono text-xs font-bold',
                        toneStyle.badge,
                      )}
                    >
                      {segment.percentage}%
                    </span>
                  </div>
                  <div className="mt-1.5 font-mono text-[11px] font-semibold text-[var(--text-muted)]">
                    {segment.pointsSummary}
                  </div>
                  <div className="mt-2 text-xs leading-relaxed text-[var(--text-main)]">
                    <MathText text={segment.description} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 2. Bảng Ma trận Đặc tả Đề thi */}
      <section className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-5 shadow-xs sm:p-6">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Target className="h-4 w-4 text-[#1B3D2F]" aria-hidden="true" />
            <h3 className="font-serif text-lg font-bold text-[var(--text-main)]">
              Bảng Ma trận Đặc tả Đề thi
            </h3>
          </div>
          <Badge variant="neutral">Tổng điểm 10.0 · 90 phút</Badge>
        </div>

        <div className="overflow-x-auto rounded-xl border border-[var(--border-subtle)]">
          <table className="w-full min-w-[680px] border-collapse text-left text-xs sm:text-sm">
            <thead>
              <tr className="border-b border-[var(--border-subtle)] bg-[var(--bg-sunken)] text-[11px] font-bold tracking-wider text-[var(--text-muted)] uppercase">
                <th className="px-4 py-3">Câu / Bài</th>
                <th className="px-4 py-3">Thang điểm</th>
                <th className="px-4 py-3">Chủ đề trọng tâm</th>
                <th className="px-4 py-3">Kỹ năng &amp; Nội dung cốt lõi</th>
                <th className="px-4 py-3">Chiến lược làm bài</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-subtle)]">
              {analysis.specificationRows.map((row) => (
                <tr
                  key={row.id}
                  className="bg-[var(--bg-surface)] align-top transition-colors hover:bg-[var(--bg-sunken)]/40"
                >
                  <td className="px-4 py-3.5 font-semibold whitespace-nowrap text-[var(--text-main)]">
                    {row.itemLabel}
                  </td>
                  <td className="px-4 py-3.5 font-mono text-xs font-semibold whitespace-nowrap text-[var(--accent-primary)]">
                    {row.points}
                  </td>
                  <td className="px-4 py-3.5 font-medium text-[var(--text-main)]">
                    <MathText text={row.topic} className="text-xs sm:text-sm" />
                  </td>
                  <td className="px-4 py-3.5 text-[var(--text-main)]">
                    <MathText text={row.coreSkills} className="text-xs sm:text-sm" />
                  </td>
                  <td className="px-4 py-3.5 text-[var(--text-muted)]">
                    <MathText text={row.examStrategy} className="text-xs sm:text-sm" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* 3. Checklist Trọng tâm ôn tập & Công thức cần thuộc lòng */}
      <section className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-5 shadow-xs sm:p-6">
        <div className="mb-5 flex flex-col gap-3 border-b border-[var(--border-subtle)] pb-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <ClipboardList className="h-4 w-4 text-[#1B3D2F]" aria-hidden="true" />
              <h3 className="font-serif text-lg font-bold text-[var(--text-main)]">
                Checklist Trọng tâm Cần Nắm Vững
              </h3>
            </div>
            <p className="text-xs text-[var(--text-muted)]">
              Đánh dấu các chuyên đề, chứng minh kinh điển và phản ví dụ bạn đã tự viết lại thành
              thạo.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <Badge className="border-[#1B3D2F] bg-[#1B3D2F] font-mono text-xs font-bold text-white">
              <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
              <span>
                Đã ôn: {completedChecklistItems}/{totalChecklistItems} ({progressPercent}%)
              </span>
            </Badge>
            {completedChecklistItems > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => updateCheckedMap(() => ({}))}
                className="h-8 gap-1 text-xs"
              >
                <RotateCcw className="h-3 w-3" aria-hidden="true" />
                <span>Đặt lại</span>
              </Button>
            )}
          </div>
        </div>

        <div className="space-y-6">
          {analysis.focusChecklists.map((group) => (
            <div key={group.id} className="space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h4 className="text-sm font-bold text-[var(--text-main)] sm:text-base">
                    {group.title}
                  </h4>
                  {group.description && (
                    <div className="mt-0.5 text-xs text-[var(--text-muted)]">
                      <MathText text={group.description} className="text-xs" />
                    </div>
                  )}
                </div>
                <Badge variant="neutral">{group.badge}</Badge>
              </div>

              <div className="grid gap-3 md:grid-cols-2">
                {group.items.map((item) => {
                  const isChecked = Boolean(checkedMap[item.id]);
                  return (
                    <div
                      key={item.id}
                      id={item.id}
                      className={cn(
                        'flex scroll-mt-24 flex-col justify-between rounded-xl border p-4 transition-all duration-200',
                        isChecked
                          ? 'border-emerald-300/90 bg-emerald-50/40 dark:border-emerald-700/60 dark:bg-emerald-950/20'
                          : 'border-[var(--border-subtle)] bg-[var(--bg-sunken)]/45 hover:border-[var(--border-control)]',
                      )}
                    >
                      <div>
                        <button
                          type="button"
                          role="checkbox"
                          aria-checked={isChecked}
                          onClick={() =>
                            updateCheckedMap((prev) => ({
                              ...prev,
                              [item.id]: !prev[item.id],
                            }))
                          }
                          className="flex min-h-[44px] w-full cursor-pointer items-start gap-3 rounded-lg text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-primary)]"
                        >
                          <span
                            className={cn(
                              'mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition-colors',
                              isChecked
                                ? 'border-emerald-600 bg-emerald-600 text-white'
                                : 'border-[var(--border-control)] bg-[var(--bg-surface)]',
                            )}
                            aria-hidden="true"
                          >
                            {isChecked && <Check className="h-3.5 w-3.5 stroke-[2.5]" />}
                          </span>
                          <span className="space-y-1">
                            <span
                              className={cn(
                                'block text-sm font-bold',
                                isChecked
                                  ? 'text-emerald-900 dark:text-emerald-200'
                                  : 'text-[var(--text-main)]',
                              )}
                            >
                              {item.title}
                            </span>
                          </span>
                        </button>

                        <div className="mt-1 pl-8 text-xs leading-relaxed text-[var(--text-muted)]">
                          <MathText text={item.summary} className="text-xs" />
                        </div>
                      </div>

                      {item.keyFormulas && item.keyFormulas.length > 0 && (
                        <div className="mt-3 space-y-2 pl-0 sm:pl-8">
                          {item.keyFormulas.map((formula, idx) => (
                            <KatexDisplayFormula
                              key={`${item.id}-formula-${idx}`}
                              math={formula}
                              className="my-0 bg-[var(--bg-surface)] py-2 pt-8"
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

/**
 * Hiển thị Phân tích cấu trúc đề thi, Bảng ma trận đặc tả và Checklist trọng tâm ôn tập.
 */
export function MatrixAnalysisView({ subjectSlug, analysis }: MatrixAnalysisViewProps) {
  return <MatrixAnalysisContent key={subjectSlug} subjectSlug={subjectSlug} analysis={analysis} />;
}
