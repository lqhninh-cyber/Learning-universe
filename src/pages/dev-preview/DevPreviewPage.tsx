import type { ContentDiagnosticCategory, LessonStatus } from '@schemas/index';
import {
  AlertTriangle,
  CheckCircle2,
  ExternalLink,
  FileCheck2,
  Lock,
  ShieldAlert,
  ShieldCheck,
  Terminal,
  Unlock,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import { Link } from 'react-router';
import { getContentDiagnostics, getLessonById, getSubjects } from '@/content-runtime';
import { ROUTES } from '@/shared/config/routes';
import { FadeIn } from '@/shared/motion/FadeIn';
import { Badge, Breadcrumb, Button, Card } from '@/shared/ui';

type StatusFilter = 'all' | LessonStatus;

const CATEGORY_LABELS: Record<ContentDiagnosticCategory, string> = {
  structure: 'Cấu trúc thư mục',
  metadata: 'Metadata & ID',
  sources: 'Nguồn học thuật',
  mdx: 'Cú pháp MDX & Whitelist',
  latex: 'Công thức KaTeX',
  references: 'Đánh số & Tham chiếu',
  assets: 'Hình vẽ & Tài nguyên',
  lock: 'Khóa bảo vệ (lock)',
};

export function DevPreviewPage() {
  const diagnostics = getContentDiagnostics();
  const subjects = getSubjects();

  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<StatusFilter>('all');

  const errors = useMemo(
    () => diagnostics.issues.filter((item) => item.severity === 'error'),
    [diagnostics.issues],
  );
  const warnings = useMemo(
    () => diagnostics.issues.filter((item) => item.severity === 'warning'),
    [diagnostics.issues],
  );

  const statusCounts = useMemo(() => {
    const counts: Record<LessonStatus, number> = {
      draft: 0,
      review: 0,
      approved: 0,
      published: 0,
    };
    for (const lesson of diagnostics.lessons) {
      counts[lesson.status] += 1;
    }
    return counts;
  }, [diagnostics.lessons]);

  const filteredLessons = useMemo(() => {
    return diagnostics.lessons.filter((lesson) => {
      if (selectedSubjectId !== 'all' && lesson.subjectId !== selectedSubjectId) {
        return false;
      }
      if (selectedStatus !== 'all' && lesson.status !== selectedStatus) {
        return false;
      }
      return true;
    });
  }, [diagnostics.lessons, selectedSubjectId, selectedStatus]);

  return (
    <FadeIn className="space-y-8 pb-16">
      <Breadcrumb
        items={[
          { label: 'Trang chủ', href: ROUTES.home },
          { label: 'Không gian Xem trước & Kiểm định Nội dung (/dev/preview)' },
        ]}
      />

      <header className="rounded-3xl border border-stone-200/90 bg-white p-6 shadow-2xs sm:p-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="subject">
                <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />
                <span>Giai đoạn 4 — Công cụ Kiểm định & Bảo vệ Nội dung</span>
              </Badge>
              <Badge variant="neutral">Chỉ hiển thị ở DEV / Preview</Badge>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-stone-900 sm:text-3xl">
              Trung tâm Kiểm định & Xem trước Nội dung Học thuật
            </h1>
            <p className="max-w-3xl text-sm leading-relaxed text-stone-600">
              Rà soát trạng thái xuất bản, kiểm tra công thức KaTeX, đối chiếu nguồn giáo trình và
              trạng thái khóa SHA-256 trong{' '}
              <code className="font-mono text-stone-800">content.lock.json</code>.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {errors.length === 0 ? (
              <div className="inline-flex items-center gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-sm font-semibold text-emerald-900">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" aria-hidden="true" />
                <span>0 lỗi kỹ thuật ({warnings.length} cảnh báo)</span>
              </div>
            ) : (
              <div className="inline-flex items-center gap-2 rounded-2xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm font-semibold text-red-900">
                <ShieldAlert className="h-4 w-4 text-red-600" aria-hidden="true" />
                <span>
                  {errors.length} lỗi cần sửa ({warnings.length} cảnh báo)
                </span>
              </div>
            )}
          </div>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl border border-stone-200/80 bg-stone-50/70 p-4">
            <p className="text-xs font-medium text-stone-500">Tổng số bài học</p>
            <p className="mt-1 text-2xl font-bold text-stone-900">{diagnostics.lessons.length}</p>
            <p className="mt-1 text-xs text-stone-600">
              Trên {subjects.length} môn học chuyên ngành
            </p>
          </div>
          <div className="rounded-2xl border border-stone-200/80 bg-stone-50/70 p-4">
            <p className="text-xs font-medium text-stone-500">Đã xuất bản / Đã duyệt</p>
            <p className="mt-1 text-2xl font-bold text-emerald-700">
              {statusCounts.published} / {statusCounts.approved}
            </p>
            <p className="mt-1 text-xs text-stone-600">Khóa bảo vệ bằng SHA-256</p>
          </div>
          <div className="rounded-2xl border border-stone-200/80 bg-stone-50/70 p-4">
            <p className="text-xs font-medium text-stone-500">Đang duyệt / Bản nháp</p>
            <p className="mt-1 text-2xl font-bold text-amber-700">
              {statusCounts.review} / {statusCounts.draft}
            </p>
            <p className="mt-1 text-xs text-stone-600">Ẩn khỏi bản Production chính thức</p>
          </div>
          <div className="rounded-2xl border border-stone-200/80 bg-stone-50/70 p-4">
            <p className="text-xs font-medium text-stone-500">Tổng số khối đánh số</p>
            <p className="mt-1 text-2xl font-bold text-stone-900">
              {diagnostics.lessons.reduce((sum, item) => sum + item.blocks.length, 0)}
            </p>
            <p className="mt-1 text-xs text-stone-600">Quy tắc Chương.Bài.Số tự động</p>
          </div>
        </div>
      </header>

      <section aria-label="Danh sách bài học trong kho nội dung" className="space-y-4">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div
            className="flex flex-wrap items-center gap-2"
            role="group"
            aria-label="Lọc theo môn học"
          >
            <Button
              variant={selectedSubjectId === 'all' ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setSelectedSubjectId('all')}
            >
              Tất cả môn ({diagnostics.lessons.length})
            </Button>
            {subjects.map((subject) => (
              <Button
                key={subject.id}
                variant={selectedSubjectId === subject.id ? 'primary' : 'outline'}
                size="sm"
                onClick={() => setSelectedSubjectId(subject.id)}
              >
                {subject.title}
              </Button>
            ))}
          </div>

          <div
            className="flex flex-wrap items-center gap-1.5"
            role="group"
            aria-label="Lọc theo trạng thái bài học"
          >
            {(['all', 'published', 'approved', 'review', 'draft'] as const).map((status) => (
              <Button
                key={status}
                variant={selectedStatus === status ? 'secondary' : 'ghost'}
                size="sm"
                onClick={() => setSelectedStatus(status)}
              >
                {status === 'all' ? 'Mọi trạng thái' : status}
              </Button>
            ))}
          </div>
        </div>

        <div className="grid gap-4">
          {filteredLessons.map((item) => {
            const loc = getLessonById(item.id);
            const lessonHref = loc
              ? ROUTES.lesson(loc.subject.slug, loc.chapter.slug, loc.lesson.slug)
              : null;

            return (
              <Card key={item.id} className="p-5">
                <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant={item.status}>{item.status}</Badge>
                      <span className="rounded-md bg-stone-100 px-2 py-0.5 font-mono text-xs font-semibold text-stone-800">
                        id: {item.id}
                      </span>
                      <span className="text-xs text-stone-500">v{item.version}</span>
                      {item.isLocked ? (
                        <span className="inline-flex items-center gap-1 rounded-md bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-800">
                          <Lock className="h-3 w-3" aria-hidden="true" />
                          <span>Đã khóa SHA-256 ({item.sha256.slice(0, 8)})</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-md bg-stone-100 px-2 py-0.5 text-xs text-stone-600">
                          <Unlock className="h-3 w-3" aria-hidden="true" />
                          <span>Chưa khóa ({item.sha256.slice(0, 8)})</span>
                        </span>
                      )}
                    </div>

                    <h2 className="text-lg font-bold text-stone-900">{item.title}</h2>

                    <div className="flex flex-wrap items-center gap-4 text-xs text-stone-600">
                      <code className="font-mono text-stone-700">{item.file}</code>
                      <span>{item.blocks.length} khối đánh số</span>
                      <span>{item.citedSources.length} nguồn tham khảo</span>
                      <span>
                        {item.hasKeyTakeaways ? 'Có <KeyTakeaways>' : 'Thiếu <KeyTakeaways>'}
                      </span>
                    </div>
                  </div>

                  {lessonHref && (
                    <div className="flex shrink-0 items-center gap-2">
                      <Button asChild variant="outline" size="sm">
                        <Link to={lessonHref}>
                          <span>Xem bài học</span>
                          <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                        </Link>
                      </Button>
                    </div>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      </section>

      <section aria-label="Báo cáo lỗi và cảnh báo kỹ thuật" className="space-y-4">
        <div className="flex items-center gap-2">
          <FileCheck2 className="h-5 w-5 text-stone-700" aria-hidden="true" />
          <h2 className="text-lg font-bold text-stone-900">
            Báo cáo Chẩn đoán từ <code className="font-mono text-base">content:check</code> (
            {diagnostics.issues.length})
          </h2>
        </div>

        {diagnostics.issues.length === 0 ? (
          <Card className="p-6 text-sm text-emerald-800">
            Không có lỗi hoặc cảnh báo nào trong toàn bộ kho nội dung.
          </Card>
        ) : (
          <div className="space-y-2.5">
            {diagnostics.issues.map((issue, idx) => (
              <div
                key={`${issue.file}-${issue.line ?? 0}-${idx}`}
                className={
                  issue.severity === 'error'
                    ? 'flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50/80 p-4 text-xs text-red-900'
                    : 'flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50/75 p-4 text-xs text-amber-950'
                }
              >
                {issue.severity === 'error' ? (
                  <ShieldAlert
                    className="mt-0.5 h-4 w-4 shrink-0 text-red-600"
                    aria-hidden="true"
                  />
                ) : (
                  <AlertTriangle
                    className="mt-0.5 h-4 w-4 shrink-0 text-amber-600"
                    aria-hidden="true"
                  />
                )}
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-bold uppercase">
                      {issue.severity === 'error' ? 'Lỗi' : 'Cảnh báo'}
                    </span>
                    <Badge variant="neutral">{CATEGORY_LABELS[issue.category]}</Badge>
                    <code className="font-mono font-medium">
                      {issue.file}
                      {issue.line !== undefined ? `:${issue.line}` : ''}
                    </code>
                  </div>
                  <p className="text-sm">{issue.message}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section aria-label="Hướng dẫn lệnh CLI quản lý nội dung">
        <Card className="bg-stone-900 p-6 text-stone-100">
          <div className="flex items-center gap-2 text-sm font-semibold text-amber-300">
            <Terminal className="h-4 w-4" aria-hidden="true" />
            <span>Các lệnh CLI quản lý nội dung (Giai đoạn 4)</span>
          </div>
          <div className="mt-4 grid gap-3 font-mono text-xs sm:grid-cols-2">
            <div className="rounded-xl bg-stone-800/90 p-3">
              <p className="text-stone-400"># 1. Kiểm tra toàn diện 8 nhóm quy tắc</p>
              <p className="mt-1 text-emerald-300">npm.cmd run content:check</p>
            </div>
            <div className="rounded-xl bg-stone-800/90 p-3">
              <p className="text-stone-400"># 2. Tạo khung bài học mới (status: draft)</p>
              <p className="mt-1 text-emerald-300">
                npm.cmd run content:new -- --subject affine-geometry --chapter 01-khong-gian-affine
                --slug toa-do-affine --title &quot;Tọa độ Affine&quot;
              </p>
            </div>
            <div className="rounded-xl bg-stone-800/90 p-3">
              <p className="text-stone-400"># 3. Khóa mã băm SHA-256 vào content.lock.json</p>
              <p className="mt-1 text-emerald-300">
                npm.cmd run content:approve -- &lt;lesson-id&gt;
              </p>
            </div>
            <div className="rounded-xl bg-stone-800/90 p-3">
              <p className="text-stone-400"># 4. Báo cáo thống kê kho nội dung</p>
              <p className="mt-1 text-emerald-300">npm.cmd run content:report</p>
            </div>
          </div>
        </Card>
      </section>
    </FadeIn>
  );
}

export default DevPreviewPage;
