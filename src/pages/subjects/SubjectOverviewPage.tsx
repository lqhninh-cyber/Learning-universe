import type { ManifestChapter } from '@schemas/index';
import { ArrowLeft } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Link, useParams } from 'react-router';
import { getSubjectBySlug, getSubjectStats } from '@/content-runtime';
import {
  ChapterAccordionList,
  type LessonLevelFilter,
  SubjectBibliography,
  SubjectFilterBar,
  SubjectHero,
} from '@/features/subject';
import { ROUTES } from '@/shared/config/routes';
import { matchesVietnameseQuery } from '@/shared/lib/vietnamese';
import { FadeIn } from '@/shared/motion/FadeIn';
import { Button, Card } from '@/shared/ui';

export function SubjectOverviewPage() {
  const { subjectSlug } = useParams<{ subjectSlug: string }>();
  const subject = subjectSlug ? getSubjectBySlug(subjectSlug) : undefined;

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLevel, setSelectedLevel] = useState<LessonLevelFilter>('all');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  const stats = useMemo(() => (subject ? getSubjectStats(subject) : null), [subject]);

  const popularTags = useMemo(() => {
    if (!subject) return [];
    const frequency = new Map<string, number>();
    for (const chapter of subject.chapters) {
      for (const lesson of chapter.lessons) {
        for (const tag of lesson.tags) {
          frequency.set(tag, (frequency.get(tag) ?? 0) + 1);
        }
      }
    }
    return [...frequency.entries()]
      .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
      .map(([tag]) => tag);
  }, [subject]);

  const filteredChapters = useMemo<readonly ManifestChapter[]>(() => {
    if (!subject) {
      return [];
    }

    const hasFilter =
      searchQuery.trim().length > 0 || selectedLevel !== 'all' || selectedTag !== null;
    if (!hasFilter) {
      return subject.chapters;
    }

    const result: ManifestChapter[] = [];
    for (const chapter of subject.chapters) {
      const matchingLessons = chapter.lessons.filter((lesson) => {
        if (selectedLevel !== 'all' && lesson.level !== selectedLevel) {
          return false;
        }
        if (selectedTag !== null && !lesson.tags.includes(selectedTag)) {
          return false;
        }
        if (searchQuery.trim().length > 0) {
          const text = `${lesson.title} ${lesson.description} ${lesson.tags.join(' ')} ${chapter.title}`;
          if (!matchesVietnameseQuery(text, searchQuery)) {
            return false;
          }
        }
        return true;
      });

      if (matchingLessons.length > 0) {
        result.push({
          ...chapter,
          lessons: matchingLessons,
        });
      }
    }

    return result;
  }, [subject, searchQuery, selectedLevel, selectedTag]);

  const shownLessonCount = useMemo(
    () => filteredChapters.reduce((sum, chapter) => sum + chapter.lessons.length, 0),
    [filteredChapters],
  );

  if (!subject || !stats) {
    return (
      <FadeIn className="mx-auto max-w-xl py-12 text-center">
        <Card className="space-y-4 p-8">
          <h1 className="text-2xl font-bold text-stone-900">Không tìm thấy môn học bạn yêu cầu</h1>
          <p className="text-sm text-stone-600">
            Đường dẫn môn học <code className="font-mono text-stone-800">{subjectSlug}</code> không
            tồn tại hoặc chưa được xuất bản.
          </p>
          <div className="flex justify-center gap-3 pt-2">
            <Button asChild variant="primary" size="sm">
              <Link to={ROUTES.home}>
                <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                <span>Về trang chủ</span>
              </Link>
            </Button>
          </div>
        </Card>
      </FadeIn>
    );
  }

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedLevel('all');
    setSelectedTag(null);
  };

  return (
    <FadeIn className="mx-auto max-w-5xl space-y-8">
      <SubjectHero subject={subject} />

      {subject.chapters.length > 0 ? (
        <>
          <SubjectFilterBar
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            selectedLevel={selectedLevel}
            onLevelChange={setSelectedLevel}
            selectedTag={selectedTag}
            onTagChange={setSelectedTag}
            availableTags={popularTags}
            shownCount={shownLessonCount}
            totalCount={stats.lessonCount}
            onReset={handleResetFilters}
          />

          <ChapterAccordionList subject={subject} chapters={filteredChapters} />
        </>
      ) : (
        <Card className="p-8 text-center">
          <p className="text-base font-medium text-stone-800">
            Các bài học của môn {subject.title} đang trong quá trình thẩm định học thuật.
          </p>
          <p className="mt-1 text-sm text-stone-500">
            Nội dung sẽ được hiển thị ngay khi chuyển sang trạng thái xuất bản.
          </p>
        </Card>
      )}
      <SubjectBibliography subject={subject} />
    </FadeIn>
  );
}

export default SubjectOverviewPage;
