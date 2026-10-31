import { getSubjects } from '@/content-runtime';
import { SearchBar } from '@/features/search';
import { SubjectCard } from '@/features/subject';
import { ROUTES } from '@/shared/config/routes';
import { FadeIn } from '@/shared/motion/FadeIn';
import { Breadcrumb } from '@/shared/ui';

export function SubjectsListPage() {
  const subjects = getSubjects();

  return (
    <FadeIn className="mx-auto max-w-5xl space-y-8">
      <div className="space-y-4">
        <Breadcrumb items={[{ label: 'Trang chủ', href: ROUTES.home }, { label: 'Môn học' }]} />
        <h1 className="text-3xl font-bold tracking-tight text-stone-900">
          Danh mục học phần Sư phạm Toán học
        </h1>
        <p className="max-w-2xl text-base text-stone-600">
          Lựa chọn một học phần để xem đề cương chương mục, lý thuyết chi tiết và hệ thống bài tập.
        </p>
        <SearchBar className="max-w-xl" />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {subjects.map((subject) => (
          <SubjectCard key={subject.id} subject={subject} />
        ))}
      </div>
    </FadeIn>
  );
}

export default SubjectsListPage;
