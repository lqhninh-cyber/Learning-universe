import { ArrowLeft } from 'lucide-react';
import { Link, Navigate, useParams } from 'react-router';
import { resolveLessonShortcut } from '@/content-runtime';
import { ROUTES } from '@/shared/config/routes';
import { FadeIn } from '@/shared/motion/FadeIn';
import { Button, Card } from '@/shared/ui';

/**
 * Trang phân giải đường dẫn rút gọn `/bai-hoc/:lessonSlug` (ví dụ `/bai-hoc/nhom`
 * hoặc `/bai-hoc/dinh-nghia-nhom`) về đường dẫn đầy đủ của bài học.
 */
export function LessonShortcutRedirectPage() {
  const { lessonSlug } = useParams<{ lessonSlug: string }>();
  const resolved = lessonSlug ? resolveLessonShortcut(lessonSlug) : undefined;

  if (resolved) {
    return (
      <Navigate
        to={ROUTES.lesson(resolved.subject.slug, resolved.chapter.slug, resolved.lesson.slug)}
        replace
      />
    );
  }

  return (
    <FadeIn className="mx-auto max-w-xl py-12 text-center">
      <Card className="space-y-4 p-8">
        <h1 className="text-2xl font-bold text-stone-900">Không tìm thấy bài học</h1>
        <p className="text-sm text-stone-600">
          Không tìm thấy bài học hoặc chương nào khớp với mã{' '}
          <code className="font-mono text-stone-800">{lessonSlug}</code>.
        </p>
        <div className="flex justify-center pt-2">
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

export default LessonShortcutRedirectPage;
