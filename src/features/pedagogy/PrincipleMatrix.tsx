import { AlertCircle, CheckCircle2, ChevronRight, Compass, Lightbulb, Search } from 'lucide-react';
import { useMemo, useState } from 'react';
import { EDUCATIONAL_PRINCIPLES } from '@/data/courses/giao-duc-hoc/course';
import { cn } from '@/shared/lib/cn';
import { Badge } from '@/shared/ui';

export interface PrincipleMatrixProps {
  readonly className?: string;
  readonly defaultPrincipleId?: number;
}

/**
 * Bảng tra cứu tương tác 6 nguyên tắc giáo dục học sinh phổ thông.
 * Cung cấp cái nhìn toàn diện: Bản chất -> Yêu cầu thực hiện -> Bẫy sư phạm thường gặp -> Tình huống minh họa.
 */
export function PrincipleMatrix({ className, defaultPrincipleId = 1 }: PrincipleMatrixProps) {
  const [selectedId, setSelectedId] = useState<number>(defaultPrincipleId);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredPrinciples = useMemo(() => {
    if (!searchQuery.trim()) return EDUCATIONAL_PRINCIPLES;
    const q = searchQuery.toLowerCase();
    return EDUCATIONAL_PRINCIPLES.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.essence.toLowerCase().includes(q) ||
        p.requirements.some((r) => r.toLowerCase().includes(q)) ||
        p.commonPitfalls.some((pit) => pit.toLowerCase().includes(q)),
    );
  }, [searchQuery]);

  const fallbackPrinciple = EDUCATIONAL_PRINCIPLES[0]!;
  const activePrinciple = useMemo(
    () =>
      filteredPrinciples.find((p) => p.id === selectedId) ??
      filteredPrinciples[0] ??
      fallbackPrinciple,
    [filteredPrinciples, selectedId, fallbackPrinciple],
  );

  return (
    <div
      className={cn(
        'rounded-2xl border border-stone-200/90 bg-white p-5 shadow-xs transition-all sm:p-6',
        className,
      )}
    >
      {/* Header */}
      <div className="flex flex-col gap-3 border-b border-stone-100 pb-4 md:flex-row md:items-center md:justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-teal-200 bg-teal-50 px-2.5 py-0.5 text-xs font-bold text-teal-800">
              <Compass className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Ma trận 6 Nguyên tắc Giáo dục</span>
            </span>
            <Badge variant="neutral">Lý luận &amp; Thực hành Sư phạm</Badge>
          </div>
          <h3 className="text-lg font-bold text-stone-900 sm:text-xl">
            Hệ thống Nguyên tắc Giáo dục Học sinh Phổ thông
          </h3>
          <p className="text-xs text-stone-500">
            Tra cứu nhanh bản chất, yêu cầu thực hiện, bẫy sư phạm và ví dụ thực tế của 6 nguyên tắc
            cốt lõi.
          </p>
        </div>

        {/* Thanh tìm kiếm */}
        <div className="relative w-full md:w-64">
          <Search className="absolute top-1/2 left-3 h-3.5 w-3.5 -translate-y-1/2 text-stone-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm theo nguyên tắc, từ khóa..."
            className="w-full rounded-xl border border-stone-200 bg-stone-50/70 py-1.5 pr-3 pl-8 text-xs text-stone-800 placeholder:text-stone-400 focus:border-teal-600 focus:bg-white focus:outline-none"
          />
        </div>
      </div>

      {/* Grid: Menu chọn 6 nguyên tắc bên trái + Chi tiết bên phải */}
      <div className="mt-5 grid gap-5 md:grid-cols-12">
        {/* Cột 1: Danh sách 6 nguyên tắc (Desktop 4 cột) */}
        <div className="space-y-2 md:col-span-5">
          {filteredPrinciples.map((principle) => {
            const isSelected = principle.id === activePrinciple.id;
            return (
              <button
                key={principle.id}
                type="button"
                onClick={() => setSelectedId(principle.id)}
                className={cn(
                  'flex w-full items-start gap-3 rounded-xl border p-3 text-left transition-all',
                  isSelected
                    ? 'border-teal-600 bg-teal-50/70 shadow-2xs'
                    : 'border-stone-200/80 bg-white hover:border-stone-300 hover:bg-stone-50/80',
                )}
              >
                <span
                  className={cn(
                    'flex h-6 w-6 shrink-0 items-center justify-center rounded-lg text-xs font-bold',
                    isSelected ? 'bg-teal-700 text-white' : 'bg-stone-100 text-stone-600',
                  )}
                >
                  {principle.id}
                </span>
                <div className="min-w-0 flex-1">
                  <h4
                    className={cn(
                      'text-xs leading-snug font-bold',
                      isSelected ? 'text-teal-950' : 'text-stone-800',
                    )}
                  >
                    {principle.name}
                  </h4>
                  <p className="mt-1 line-clamp-2 text-[11px] leading-relaxed text-stone-500">
                    {principle.essence}
                  </p>
                </div>
                <ChevronRight
                  className={cn(
                    'mt-0.5 h-4 w-4 shrink-0 transition-transform',
                    isSelected ? 'translate-x-0.5 text-teal-700' : 'text-stone-300',
                  )}
                />
              </button>
            );
          })}
        </div>

        {/* Cột 2: Nội dung chi tiết nguyên tắc đang chọn (Desktop 7 cột) */}
        <div className="space-y-4 rounded-xl border border-stone-200/90 bg-stone-50/40 p-4.5 sm:p-5 md:col-span-7">
          {/* Tiêu đề & Bản chất */}
          <div className="border-b border-stone-200/80 pb-3">
            <span className="text-xs font-bold tracking-wider text-teal-800 uppercase">
              Nguyên tắc số {activePrinciple.id}
            </span>
            <h4 className="mt-1 text-base font-bold text-stone-900 sm:text-lg">
              {activePrinciple.name}
            </h4>
            <div className="mt-2.5 rounded-lg border border-teal-200/80 bg-teal-50/50 p-3 text-xs leading-relaxed text-teal-950">
              <span className="font-bold text-teal-900">Bản chất lý luận: </span>
              <span>{activePrinciple.essence}</span>
            </div>
          </div>

          {/* Yêu cầu thực hiện (Cần làm) */}
          <div className="space-y-2">
            <span className="flex items-center gap-1.5 text-xs font-bold tracking-wide text-emerald-800 uppercase">
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
              <span>Yêu cầu thực hiện đối với Giáo viên (Cần làm)</span>
            </span>
            <ul className="space-y-1.5 pl-1 text-xs leading-relaxed text-stone-700">
              {activePrinciple.requirements.map((req, idx) => (
                <li key={`req-${idx}`} className="flex items-start gap-2">
                  <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-600" />
                  <span>{req}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Bẫy sư phạm thường gặp (Cần tránh) */}
          <div className="space-y-2 rounded-lg border border-rose-200 bg-rose-50/60 p-3 text-xs leading-relaxed text-rose-900">
            <span className="flex items-center gap-1.5 font-bold tracking-wide text-rose-800 uppercase">
              <AlertCircle className="h-4 w-4 text-rose-600" />
              <span>Bẫy sư phạm thường gặp (Cần tránh)</span>
            </span>
            <ul className="space-y-1 pl-1 text-rose-900/90">
              {activePrinciple.commonPitfalls.map((pit, idx) => (
                <li key={`pit-${idx}`} className="flex items-start gap-2">
                  <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-rose-600" />
                  <span>{pit}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Tình huống minh họa */}
          <div className="rounded-lg border border-amber-200/90 bg-amber-50/60 p-3 text-xs leading-relaxed text-amber-950">
            <div className="flex items-center gap-1.5 font-bold text-amber-900">
              <Lightbulb className="h-4 w-4" />
              <span>Ví dụ tình huống thực tế</span>
            </div>
            <p className="mt-1 text-stone-700">{activePrinciple.caseExample}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
