import { Sparkles } from 'lucide-react';
import type { ReactNode } from 'react';

export interface KeyTakeawaysProps {
  readonly title?: string;
  readonly children: ReactNode;
}

export function KeyTakeaways({ title = 'Trọng tâm cần nhớ', children }: KeyTakeawaysProps) {
  return (
    <section
      aria-label={title}
      className="border-subject-200/90 bg-subject-50/70 my-8 rounded-xl border p-6 shadow-2xs transition-colors dark:border-l-4 dark:border-[#284C3A] dark:border-l-[#C5A262] dark:bg-[#13261D] dark:text-[#E8F2EC] dark:shadow-none"
    >
      <header className="mb-3 flex items-center gap-2">
        <Sparkles className="text-subject-600 h-4 w-4 dark:text-[#C5A262]" aria-hidden="true" />
        <h3 className="text-subject-950 m-0 text-base font-semibold dark:text-[#C5A262]">
          {title}
        </h3>
      </header>
      <div className="space-y-2.5 text-[16px] leading-relaxed text-stone-800 sm:text-[16.5px] dark:text-[#E8F2EC]">
        {children}
      </div>
    </section>
  );
}
