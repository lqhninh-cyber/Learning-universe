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
      data-case-study-box
      data-testid="case-study-box"
      className={cn(
        'col-span-full clear-both my-6 w-full rounded-2xl border border-[#CFDADB] bg-[#F7FAFA] p-5 shadow-xs transition-all hover:border-[#718C7E] sm:p-6 dark:border-[#1E3A2C] dark:bg-[#0B1A13]',
        className,
      )}
    >
      {/* Tiêu đề tình huống */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#CFDADB] pb-3.5 dark:border-[#1E3A2C]">
        <div className="flex items-center gap-2.5">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#3F6570] font-serif text-xs font-bold text-white shadow-2xs dark:bg-[#1B4332] dark:text-[#C5A262]">
            {String(caseStudy.id).padStart(2, '0')}
          </span>
          <h3 className="font-serif text-base font-bold text-[#29383D] sm:text-lg dark:text-[#F5F2EB]">
            Tình huống {caseStudy.id}: {caseStudy.title}
          </h3>
        </div>

        <Badge
          variant="neutral"
          className="border-[#718C7E]/40 bg-[#E8EFEB] text-xs font-medium text-[#29383D] dark:border-[#284E3B] dark:bg-[#163023] dark:text-[#C5DCD0]"
        >
          Thực hành Sư phạm 5 Bước
        </Badge>
      </div>

      {/* Mô tả bối cảnh tình huống */}
      <div className="mt-4 rounded-xl border border-[#CFDADB] bg-[#E8EFEB]/60 p-4 text-sm leading-relaxed text-[#29383D] dark:border-[#1E3A2C] dark:bg-[#0E2218] dark:text-[#D5E2DA]">
        <div className="flex items-center gap-1.5 font-mono text-xs font-bold tracking-wider text-[#3F6570] uppercase dark:text-[#A1D1B7]">
          <BookOpen className="h-4 w-4 text-[#718C7E] dark:text-[#A1D1B7]" aria-hidden="true" />
          <span>Bối cảnh tình huống thực tế</span>
        </div>
        <p className="mt-2 leading-relaxed text-[#29383D] dark:text-[#D5E2DA]">
          {caseStudy.context}
        </p>
      </div>

      {/* Câu hỏi phản tư */}
      <div className="mt-4 flex items-start gap-2 text-sm font-semibold text-[#29383D] dark:text-[#F5F2EB]">
        <HelpCircle
          className="mt-0.5 h-4 w-4 shrink-0 text-[#3F6570] dark:text-[#E5C378]"
          aria-hidden="true"
        />
        <p>{caseStudy.question}</p>
      </div>

      {/* Ô nhập phản tư cá nhân */}
      <div className="mt-3 space-y-2">
        <label
          htmlFor={`reflection-${caseStudy.id}`}
          className="block text-xs font-medium text-[#55676B] dark:text-[#A8C4B5]"
        >
          Phản tư cá nhân: Thầy/Cô sẽ xử lý tình huống này như thế nào trước khi xem lời giải mẫu?
        </label>
        <textarea
          id={`reflection-${caseStudy.id}`}
          rows={3}
          value={reflectionText}
          onChange={(e) => setReflectionText(e.target.value)}
          placeholder="Nhập suy nghĩ, bước xử lý hoặc nguyên tắc mà bạn sẽ áp dụng..."
          className="w-full rounded-xl border border-[#CFDADB] bg-white p-3 text-xs leading-relaxed text-[#29383D] placeholder:text-[#55676B]/60 focus:border-[#3F6570] focus:bg-white focus:outline-none dark:border-[#1E3A2C] dark:bg-[#0E2218] dark:text-[#F5F2EB] dark:placeholder:text-[#6E8F7E] dark:focus:border-[#A1D1B7]"
        />
        <div className="flex items-center justify-between text-xs">
          <span className="text-[#55676B] dark:text-[#A8C4B5]">
            {reflectionText.length > 0 ? `${reflectionText.length} ký tự` : 'Chưa nhập phản tư'}
          </span>
          <div className="flex items-center gap-2">
            {reflectionText.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleSaveReflection}
                className="h-7 border-[#CFDADB] text-xs text-[#29383D] dark:border-[#284E3A] dark:bg-[#13261D] dark:text-[#C5DCD0] dark:hover:bg-[#1A3327]"
              >
                <span>{savedReflection ? 'Đã ghi nhận' : 'Lưu phản tư'}</span>
              </Button>
            )}
            <Button
              variant={showSolution ? 'secondary' : 'subject'}
              size="sm"
              onClick={() => setShowSolution(!showSolution)}
              className={cn(
                'h-7 gap-1 text-xs',
                'dark:gap-2 dark:rounded-full dark:border dark:border-[#284E3A] dark:bg-[#13261D] dark:px-3.5 dark:py-1.5 dark:font-medium dark:text-[#E5C378] dark:shadow-sm dark:hover:bg-[#1A3327]',
              )}
            >
              <Lightbulb
                className="h-3.5 w-3.5 text-amber-500 dark:text-[#E5C378]"
                aria-hidden="true"
              />
              <span>{showSolution ? 'Thu gọn gợi ý' : 'Xem gợi ý xử lý chuẩn'}</span>
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
        <div className="mt-5 space-y-4 rounded-xl border border-[#CFDADB] bg-[#E1E9EA]/55 p-4.5 sm:p-5 md:rounded-2xl md:p-6 dark:border dark:border-[#1E3A2C] dark:bg-[#0B1A13]">
          {/* Nguyên tắc sư phạm vận dụng */}
          <div>
            <span className="mb-3 block font-mono text-xs font-bold tracking-wider text-[#29383D] uppercase dark:text-[#A1D1B7]">
              Cơ sở lý luận &amp; Nguyên tắc sư phạm áp dụng
            </span>
            <div className="mt-2 flex flex-wrap gap-2">
              {caseStudy.principlesApplied.map((principle, idx) => (
                <span
                  key={`principle-${idx}`}
                  className="mb-2 rounded-xl border border-[#718C7E]/40 bg-[#E8EFEB] px-4 py-2.5 text-xs font-medium text-[#29383D] shadow-none md:text-sm dark:border dark:border-[#234533] dark:bg-[#13271D] dark:text-[#E2ECE6]"
                >
                  {principle}
                </span>
              ))}
            </div>
          </div>

          {/* Quy trình 5 bước xử lý khoa học */}
          <div className="space-y-2.5">
            <span className="flex items-center gap-1.5 font-mono text-xs font-bold tracking-wider text-[#29383D] uppercase dark:text-[#D1E0D7]">
              <CheckCircle2
                className="h-4 w-4 text-[#4F7967] dark:text-[#A1D1B7]"
                aria-hidden="true"
              />
              <span>Quy trình 5 bước xử lý khoa học (Mục 3.3.6 Giáo trình HCMUE)</span>
            </span>

            <div className="space-y-3">
              {caseStudy.solutionSteps.map((step) => (
                <div
                  key={`step-${step.step}`}
                  className="mt-4 flex items-start gap-3 rounded-xl border border-[#CFDADB] bg-[#F7FAFA] p-4 text-xs leading-relaxed md:p-5 dark:border dark:border-[#1C422E] dark:bg-[#0E2218]"
                >
                  <span className="flex shrink-0 items-center justify-center rounded-lg bg-[#E8EFEB] px-2.5 py-1 font-mono text-xs font-bold text-[#3F6570] dark:bg-[#1B4332] dark:text-[#C5A262]">
                    {String(step.step).padStart(2, '0')}
                  </span>
                  <div>
                    <h5 className="text-sm font-semibold text-[#29383D] dark:text-[#F5F2EB]">
                      {step.title}
                    </h5>
                    <p className="mt-2.5 text-sm leading-relaxed text-[#55676B] dark:text-[#D5E2DA]">
                      {step.content}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Bẫy sư phạm cần tránh */}
          {caseStudy.pitfallsToAvoid.length > 0 && (
            <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-rose-950 md:p-5 dark:border-[#4D2027] dark:bg-[#201014] dark:text-[#FCD7D7]">
              <div className="flex items-center gap-2 text-sm font-bold tracking-wide text-red-600 dark:text-[#FF8080]">
                <AlertTriangle className="h-4 w-4 shrink-0" aria-hidden="true" />
                <span>Bẫy sư phạm thường gặp (Tuyệt đối tránh)</span>
              </div>
              <ul className="mt-2 list-disc space-y-1.5 pl-5 text-xs text-rose-950/95 opacity-95 dark:text-[#F5D5D5]">
                {caseStudy.pitfallsToAvoid.map((pitfall, pIdx) => (
                  <li key={`pitfall-${pIdx}`}>{pitfall}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Bài học cốt lõi */}
          <div className="flex items-start gap-2 rounded-xl border border-emerald-200 bg-emerald-50/80 p-4 text-xs text-emerald-950 dark:border-[#224A37] dark:bg-[#10231B] dark:text-[#E4EFE9]">
            <GraduationCap
              className="mt-0.5 h-4 w-4 shrink-0 text-emerald-700 dark:text-[#C5A262]"
              aria-hidden="true"
            />
            <div>
              <span className="font-bold text-emerald-900 dark:text-[#C5A262]">
                Bài học cốt lõi:{' '}
              </span>
              <span className="dark:text-[#E4EFE9]">{caseStudy.coreLesson}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
