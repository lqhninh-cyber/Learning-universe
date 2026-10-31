import { ArrowRight, Compass, Sigma } from 'lucide-react';
import { isSupabaseConfigured } from '@/services/supabase/client';
import { FadeIn } from '@/shared/motion/FadeIn';
import { SubjectThemeProvider } from '@/shared/theme/SubjectThemeProvider';
import {
  Badge,
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  ProgressRing,
} from '@/shared/ui';

export function HomePage() {
  return (
    <FadeIn className="mx-auto max-w-4xl space-y-10 py-6">
      <div className="space-y-4">
        <Badge variant="neutral">Chương trình Sư phạm Toán học</Badge>
        <h1 className="text-3xl font-semibold tracking-tight text-stone-900 sm:text-4xl">
          Không gian học tập Toán học đại học
        </h1>
        <p className="max-w-2xl text-base leading-relaxed text-stone-600">
          Nền tảng tổng hợp lý thuyết, định nghĩa, định lý, chứng minh và mô phỏng trực quan cho các
          học phần chuyên ngành Sư phạm Toán học, bắt đầu với{' '}
          <strong className="font-medium text-stone-900">Cấu trúc đại số</strong> và{' '}
          <strong className="font-medium text-stone-900">Hình học Affine</strong>.
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <SubjectThemeProvider subject="algebraic-structures">
          <Card accent="subjectTop" interactive className="flex h-full flex-col justify-between">
            <div>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <Badge variant="subject">
                    <Sigma className="h-3.5 w-3.5" aria-hidden="true" />
                    <span>Cấu trúc đại số</span>
                  </Badge>
                  <ProgressRing value={0} size={36} strokeWidth={3.5} />
                </div>
                <CardTitle className="mt-2">Nhóm, Vành và Trường</CardTitle>
                <CardDescription>
                  Hệ thống hóa khái niệm đại số trừu tượng, đồng cấu và cấu trúc thương kèm đối
                  chiếu giáo trình gốc.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-1.5">
                  <Badge variant="neutral">Nhóm & Nhóm con</Badge>
                  <Badge variant="neutral">Đồng cấu nhóm</Badge>
                  <Badge variant="neutral">Vành & Trường</Badge>
                </div>
              </CardContent>
            </div>
            <CardFooter className="text-subject-700 text-xs font-medium">
              <span>Không gian môn học (Giai đoạn 4)</span>
              <ArrowRight className="text-subject-600 h-4 w-4" aria-hidden="true" />
            </CardFooter>
          </Card>
        </SubjectThemeProvider>

        <SubjectThemeProvider subject="affine-geometry">
          <Card accent="subjectTop" interactive className="flex h-full flex-col justify-between">
            <div>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <Badge variant="subject">
                    <Compass className="h-3.5 w-3.5" aria-hidden="true" />
                    <span>Hình học Affine</span>
                  </Badge>
                  <ProgressRing value={0} size={36} strokeWidth={3.5} />
                </div>
                <CardTitle className="mt-2">Không gian và Ánh xạ Affine</CardTitle>
                <CardDescription>
                  Trực quan hóa không gian affine, cái nhìn hình học về hệ tọa độ, tâm tỉ cự và phép
                  biến hình.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-1.5">
                  <Badge variant="neutral">Không gian Affine</Badge>
                  <Badge variant="neutral">Tâm tỉ cự</Badge>
                  <Badge variant="neutral">Ánh xạ Affine</Badge>
                </div>
              </CardContent>
            </div>
            <CardFooter className="text-subject-700 text-xs font-medium">
              <span>Không gian môn học (Giai đoạn 4)</span>
              <ArrowRight className="text-subject-600 h-4 w-4" aria-hidden="true" />
            </CardFooter>
          </Card>
        </SubjectThemeProvider>
      </div>

      <div className="rounded-xl border border-stone-200 bg-stone-100/70 px-4 py-3 text-xs text-stone-600">
        Trạng thái kết nối dữ liệu:{' '}
        <span className="font-medium text-stone-900">
          {isSupabaseConfigured
            ? 'Đã cấu hình Supabase (sẵn sàng cho đồng bộ tiến độ)'
            : 'Chế độ khách chỉ đọc (chưa cấu hình Supabase)'}
        </span>
      </div>
    </FadeIn>
  );
}

export default HomePage;
