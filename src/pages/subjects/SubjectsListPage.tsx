import { useState } from 'react';
import { getSubjects } from '@/content-runtime';
import { type AcademicBranch, getCourseCinematicAsset } from '@/data/cinematicAssets';
import { SearchBar } from '@/features/search';
import { SubjectCard } from '@/features/subject';
import { ROUTES } from '@/shared/config/routes';
import { cn } from '@/shared/lib/cn';
import { FadeIn } from '@/shared/motion/FadeIn';
import { Breadcrumb } from '@/shared/ui';

type BranchFilter = 'all' | AcademicBranch;

export function SubjectsListPage() {
  const subjects = getSubjects();
  const [activeBranch, setActiveBranch] = useState<BranchFilter>('all');

  const filteredSubjects = subjects.filter((subject) => {
    if (activeBranch === 'all') {
      return true;
    }
    return getCourseCinematicAsset(subject.slug).branch === activeBranch;
  });

  return (
    <FadeIn className="mx-auto max-w-5xl space-y-8 bg-[#FAF7F2] text-stone-900">
      {/* Tiêu đề đầu trang & Đoạn dẫn cô đọng */}
      <div className="space-y-4">
        <Breadcrumb
          items={[{ label: 'Trang chủ', href: ROUTES.home }, { label: 'Danh mục Học phần' }]}
        />

        <div className="space-y-2">
          <h1 className="font-serif text-3xl font-bold tracking-tight text-stone-900 sm:text-5xl dark:text-stone-100">
            Danh mục Học phần
          </h1>
          <p className="max-w-2xl text-base leading-relaxed text-stone-700">
            Chương trình đào tạo đại học chuẩn mực gồm các học phần Toán học nền tảng và Khoa học
            Giáo dục dành cho sinh viên Sư phạm Toán học.
          </p>
        </div>
      </div>

      {/* Thanh bộ lọc tối giản: Tất cả | Toán học | Khoa học Giáo dục cùng ô tìm kiếm */}
      <div className="flex flex-col justify-between gap-4 border-b border-stone-200/80 pb-5 sm:flex-row sm:items-center">
        <div
          role="tablist"
          aria-label="Bộ lọc danh mục học phần"
          className="flex flex-wrap items-center gap-2"
        >
          {[
            { id: 'all' as const, label: 'Tất cả' },
            { id: 'math' as const, label: 'Toán học' },
            { id: 'pedagogy' as const, label: 'Khoa học Giáo dục' },
          ].map((tab) => {
            const isActive = activeBranch === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={isActive}
                onClick={() => setActiveBranch(tab.id)}
                className={cn(
                  'cursor-pointer rounded-full px-4 py-2 text-xs font-semibold transition-all',
                  isActive
                    ? 'bg-stone-900 text-[#FAF7F2] shadow-2xs'
                    : 'border border-stone-300/80 bg-[#FAF7F2] text-stone-700 hover:border-stone-400 hover:text-stone-950',
                )}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        <SearchBar className="w-full sm:max-w-sm" />
      </div>

      {/* Lưới thẻ môn học phong cách Apple Card */}
      <section aria-label="Danh sách các học phần" className="grid gap-6 md:grid-cols-2">
        {filteredSubjects.map((subject) => (
          <SubjectCard key={subject.id} subject={subject} />
        ))}
      </section>
    </FadeIn>
  );
}

export default SubjectsListPage;
