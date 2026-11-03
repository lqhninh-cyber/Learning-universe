import {
  AlertTriangle,
  BookOpen,
  CheckCircle2,
  ChevronDown,
  GraduationCap,
  HelpCircle,
  Lightbulb,
} from 'lucide-react';
import { useState } from 'react';
import type { PedagogicalCaseStudy } from '@/data/courses/giao-duc-hoc/course';
import { cn } from '@/shared/lib/cn';
import { Badge, Button } from '@/shared/ui';

export interface CaseStudyBoxProps {
  readonly caseStudy: PedagogicalCaseStudy;
  readonly defaultOpenSolution?: boolean;
  readonly className?: string;
}

/**
 * Khối bài tập tình huống sư phạm tương tác.
 * Luồng tương tác:
 * 1. Nêu bối cảnh tình huống thực tế & câu hỏi mở.
 * 2. Ô nhập phản tư cá nhân để người học chủ động suy nghĩ trước.
 * 3. Nút bấm mở gợi ý xử lý 5 bước chuẩn mực, nguyên tắc áp dụng & bẫy sai lầm cần tránh.
 */
export function CaseStudyBox({
  caseStudy,
  defaultOpenSolution = false,
  className,
}: CaseStudyBoxProps) {
  const [reflectionText, setReflectionText] = useState('');
  const [showSolution, setShowSolution] = useState(defaultOpenSolution);
  const [savedReflection, setSavedReflection] = useState(false);

  const handleSaveReflection = () => {
    if (reflectionText.trim()) {
      setSavedReflection(true);
      setTimeout(() => setSavedReflection(false), 2500);
    }
  };

  return (
    <div
      className={cn(
        'rounded-2xl border border-stone-200/90 bg-white p-5 shadow-xs transition-all hover:border-stone-300 sm:p-6',
        className,
      )}
    >
      {/* Tiêu đề tình huống */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-stone-100 pb-3.5">
        <div className="flex items-center gap-2.5">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-800 text-xs font-bold text-white shadow-2xs">
            {caseStudy.id}
          </span>
          <h3 className="text-base font-bold text-stone-900 sm:text-lg">
            Tình huống {caseStudy.id}: {caseStudy.title}
          </h3>
        </div>

        <Badge
          variant="neutral"
          className="border-amber-200/80 bg-amber-50 text-xs font-medium text-amber-900"
        >
          Thực hành Sư phạm
        </Badge>
      </div>

      {/* Mô tả bối cảnh tình huống */}
      <div className="mt-4 rounded-xl border border-amber-800/15 bg-gradient-to-br from-[#fcfbf7] to-amber-50/30 p-4 text-sm leading-relaxed text-stone-800">
        <div className="flex items-center gap-1.5 text-xs font-bold tracking-wider text-amber-900 uppercase">
          <BookOpen className="h-4 w-4" aria-hidden="true" />
          <span>Bối cảnh tình huống thực tế</span>
        </div>
        <p className="mt-2 leading-relaxed text-stone-700">{caseStudy.context}</p>
      </div>

      {/* Câu hỏi phản tư */}
      <div className="mt-4 flex items-start gap-2 text-sm font-semibold text-stone-900">
        <HelpCircle className="mt-0.5 h-4 w-4 shrink-0 text-amber-700" aria-hidden="true" />
        <p>{caseStudy.question}</p>
      </div>

      {/* Ô nhập phản tư cá nhân */}
      <div className="mt-3 space-y-2">
        <label
          htmlFor={`reflection-${caseStudy.id}`}
          className="block text-xs font-medium text-stone-600"
        >
          ✍️ Phản tư cá nhân: Thầy/Cô sẽ xử lý tình huống này như thế nào trước khi xem lời giải
          mẫu?
        </label>
        <textarea
          id={`reflection-${caseStudy.id}`}
          rows={3}
          value={reflectionText}
          onChange={(e) => setReflectionText(e.target.value)}
          placeholder="Nhập suy nghĩ, bước xử lý hoặc nguyên tắc mà bạn sẽ áp dụng..."
          className="w-full rounded-xl border border-stone-200 bg-stone-50/60 p-3 text-xs leading-relaxed text-stone-800 placeholder:text-stone-400 focus:border-amber-700 focus:bg-white focus:outline-none"
        />
        <div className="flex items-center justify-between text-xs">
          <span className="text-stone-400">
            {reflectionText.length > 0 ? `${reflectionText.length} ký tự` : 'Chưa nhập phản tư'}
          </span>
          <div className="flex items-center gap-2">
            {reflectionText.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleSaveReflection}
                className="h-7 text-xs text-stone-600"
              >
                <span>{savedReflection ? '✓ Đã ghi nhận' : 'Lưu phản tư'}</span>
              </Button>
            )}
            <Button
              variant={showSolution ? 'secondary' : 'subject'}
              size="sm"
              onClick={() => setShowSolution(!showSolution)}
              className="h-7 gap-1 text-xs"
            >
              <Lightbulb className="h-3.5 w-3.5" aria-hidden="true" />
              <span>{showSolution ? 'Thu gọn gợi ý' : '📝 Xem gợi ý xử lý chuẩn'}</span>
              <ChevronDown
                className={cn(
                  'h-3.5 w-3.5 transition-transform duration-200',
                  showSolution && 'rotate-180',
                )}
                aria-hidden="true"
              />
            </Button>
          </div>
        </div>
      </div>

      {/* Khung Hướng dẫn xử lý chuẩn & Cơ sở lý luận */}
      {showSolution && (
        <div className="mt-5 space-y-4 rounded-xl border border-stone-200 bg-stone-50/50 p-4.5 sm:p-5">
          {/* Nguyên tắc sư phạm vận dụng */}
          <div>
            <span className="block text-xs font-bold tracking-wider text-stone-700 uppercase">
              🎯 Cơ sở lý luận &amp; Nguyên tắc sư phạm áp dụng
            </span>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {caseStudy.principlesApplied.map((principle, idx) => (
                <span
                  key={`principle-${idx}`}
                  className="rounded-md border border-teal-200 bg-teal-50 px-2 py-0.5 text-xs font-medium text-teal-800"
                >
                  {principle}
                </span>
              ))}
            </div>
          </div>

          {/* Quy trình 5 bước xử lý khoa học */}
          <div className="space-y-2.5">
            <span className="flex items-center gap-1.5 text-xs font-bold tracking-wider text-stone-700 uppercase">
              <CheckCircle2 className="h-4 w-4 text-emerald-600" aria-hidden="true" />
              <span>Quy trình 5 bước xử lý khoa học</span>
            </span>

            <div className="space-y-2">
              {caseStudy.solutionSteps.map((step) => (
                <div
                  key={`step-${step.step}`}
                  className="flex items-start gap-3 rounded-lg border border-stone-200/80 bg-white p-3 text-xs leading-relaxed"
                >
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-amber-100 font-bold text-amber-900">
                    {step.step}
                  </span>
                  <div>
                    <h5 className="font-bold text-stone-900">{step.title}</h5>
                    <p className="mt-1 text-stone-600">{step.content}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Bẫy sư phạm cần tránh */}
          {caseStudy.pitfallsToAvoid.length > 0 && (
            <div className="rounded-lg border border-rose-200 bg-rose-50/60 p-3 text-xs text-rose-900">
              <div className="flex items-center gap-1.5 font-bold text-rose-800">
                <AlertTriangle className="h-4 w-4" aria-hidden="true" />
                <span>⚠️ Bẫy sư phạm thường gặp (Tuyệt đối tránh)</span>
              </div>
              <ul className="mt-1.5 list-disc space-y-1 pl-5 text-rose-800/90">
                {caseStudy.pitfallsToAvoid.map((pitfall, pIdx) => (
                  <li key={`pitfall-${pIdx}`}>{pitfall}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Bài học cốt lõi */}
          <div className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50/70 p-3 text-xs text-amber-950">
            <GraduationCap className="mt-0.5 h-4 w-4 shrink-0 text-amber-800" aria-hidden="true" />
            <div>
              <span className="font-bold text-amber-900">Bài học cốt lõi: </span>
              <span>{caseStudy.coreLesson}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
