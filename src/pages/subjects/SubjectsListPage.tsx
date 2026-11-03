import {
  ArrowRight,
  BookOpen,
  FileText,
  GraduationCap,
  Scale,
  ShieldCheck,
  Sigma,
  Sparkles,
} from 'lucide-react';
import { Link } from 'react-router';
import { getSubjects } from '@/content-runtime';
import { SearchBar } from '@/features/search';
import { SubjectCard } from '@/features/subject';
import { ROUTES } from '@/shared/config/routes';
import { FadeIn } from '@/shared/motion/FadeIn';
import { Badge, Breadcrumb, Card, HeritageDivider } from '@/shared/ui';

export function SubjectsListPage() {
  const subjects = getSubjects();

  // Phân tầng thành 2 khối học thuật theo quy chuẩn Sư phạm:
  // Khối 1: Toán học (Cấu trúc đại số, Hình học Affine, Giải tích hàm một biến)
  // Khối 2: Khoa học Giáo dục & Nghiệp vụ Sư phạm (Giáo dục học)
  const mathSubjects = subjects.filter((s) => s.id !== 'giao-duc-hoc' && s.slug !== 'giao-duc-hoc');
  const pedagogySubjects = subjects.filter(
    (s) => s.id === 'giao-duc-hoc' || s.slug === 'giao-duc-hoc',
  );

  return (
    <FadeIn className="mx-auto max-w-5xl space-y-10">
      {/* =====================================================================
          TIÊU ĐỀ TRANG VÀ THANH TÌM KIẾM
          ===================================================================== */}
      <div className="space-y-4">
        <Breadcrumb
          items={[{ label: 'Trang chủ', href: ROUTES.home }, { label: 'Tất cả môn học' }]}
        />
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 rounded-full border border-amber-900/15 bg-amber-50/70 px-3 py-1 text-xs font-semibold tracking-wider text-amber-900 uppercase">
            <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Chương trình Sư phạm Toán học</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-stone-900 sm:text-4xl">
            Danh mục học phần Toán học &amp; Sư phạm
          </h1>
          <p className="max-w-3xl text-base leading-relaxed text-stone-600">
            Hệ thống hóa toàn bộ các học phần Toán học cao cấp và Khoa học Giáo dục - Nghiệp vụ Sư
            phạm, phục vụ sinh viên ngành Sư phạm Toán học theo chuẩn chương trình đào tạo của
            Trường Đại học Sư phạm TP.HCM (HCMUE) và Chương trình GDPT 2018.
          </p>
        </div>

        <SearchBar className="max-w-xl" />
      </div>

      {/* =====================================================================
          KHỐI 1: TOÁN HỌC CAO CẤP
          ===================================================================== */}
      <section aria-labelledby="heading-math-cluster" className="space-y-6">
        <div className="flex flex-col justify-between gap-3 border-b border-stone-200 pb-4 sm:flex-row sm:items-end">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg border border-amber-200 bg-amber-50 text-amber-800">
                <Sigma className="h-4 w-4" aria-hidden="true" />
              </div>
              <h2
                id="heading-math-cluster"
                className="font-serif text-2xl font-bold tracking-tight text-stone-900"
              >
                Khối 1: Toán học
              </h2>
              <Badge variant="neutral" className="text-xs font-medium">
                {mathSubjects.length} học phần
              </Badge>
            </div>
            <p className="text-sm text-stone-600">
              Cấu trúc đại số trừu tượng, không gian hình học affine - euclide và giải tích hàm một
              biến số thực với các chứng minh toán học tường minh.
            </p>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {mathSubjects.map((subject) => (
            <SubjectCard key={subject.id} subject={subject} />
          ))}
        </div>
      </section>

      <HeritageDivider className="opacity-70" />

      {/* =====================================================================
          KHỐI 2: KHOA HỌC GIÁO DỤC & NGHIỆP VỤ SƯ PHẠM
          ===================================================================== */}
      <section aria-labelledby="heading-pedagogy-cluster" className="space-y-6">
        <div className="flex flex-col justify-between gap-3 border-b border-teal-200/80 pb-4 sm:flex-row sm:items-end">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg border border-teal-200 bg-teal-50 text-teal-800">
                <GraduationCap className="h-4 w-4" aria-hidden="true" />
              </div>
              <h2
                id="heading-pedagogy-cluster"
                className="font-serif text-2xl font-bold tracking-tight text-stone-900"
              >
                Khối 2: Khoa học Giáo dục &amp; Nghiệp vụ Sư phạm
              </h2>
              <span className="rounded-full bg-teal-100 px-2.5 py-0.5 text-xs font-bold text-teal-800">
                GDPT 2018 · Mới
              </span>
            </div>
            <p className="text-sm text-stone-600">
              Lý luận giáo dục nhân cách, chuẩn nghề nghiệp giáo viên theo Thông tư 20, Điều lệ
              trường học TT32, kỹ năng công tác chủ nhiệm lớp và tổ chức hoạt động trải nghiệm.
            </p>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {pedagogySubjects.map((subject) => (
            <SubjectCard key={subject.id} subject={subject} />
          ))}

          {/* Card điểm nhấn: Kho tàng Văn bản & Thư viện Pháp quy Sư phạm */}
          <Card className="flex flex-col justify-between rounded-2xl border border-teal-200/80 bg-teal-50/40 p-6 shadow-2xs">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Scale className="h-5 w-5 text-teal-800" aria-hidden="true" />
                <h3 className="font-serif text-lg font-bold text-stone-900">
                  Thư viện Pháp quy &amp; Nghiệp vụ
                </h3>
              </div>
              <p className="text-xs leading-relaxed text-stone-600">
                Tập hợp đầy đủ 13 tài liệu, giáo trình chuẩn HCMUE, Luật Giáo dục 2019, Thông tư 20,
                Thông tư 32 và Thông tư 17/2025/TT-BGDĐT mới nhất.
              </p>
              <ul className="space-y-1.5 text-xs text-stone-700">
                <li className="flex items-center gap-1.5">
                  <ShieldCheck className="h-3.5 w-3.5 text-teal-700" />
                  <span>Điều lệ trường trung học (TT 32/2020)</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <ShieldCheck className="h-3.5 w-3.5 text-teal-700" />
                  <span>Chuẩn nghề nghiệp giáo viên (TT 20/2018)</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <ShieldCheck className="h-3.5 w-3.5 text-teal-700" />
                  <span>Quy định dạy thêm, học thêm (TT 17/2025)</span>
                </li>
              </ul>
            </div>

            <div className="pt-4">
              <Link
                to={ROUTES.subjectOverview('giao-duc-hoc')}
                className="inline-flex items-center gap-1 text-xs font-semibold text-teal-800 underline underline-offset-4 hover:text-teal-950"
              >
                <span>Tra cứu trong môn học Giáo dục học</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </Card>

          {/* Card điểm nhấn: Thực chiến 20 Tình huống Sư phạm */}
          <Card className="flex flex-col justify-between rounded-2xl border border-amber-200/80 bg-amber-50/40 p-6 shadow-2xs">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-amber-800" aria-hidden="true" />
                <h3 className="font-serif text-lg font-bold text-stone-900">
                  Phòng Nghiệm Sư phạm Thực chiến
                </h3>
              </div>
              <p className="text-xs leading-relaxed text-stone-600">
                20 tình huống sư phạm kinh điển ở trường THCS/THPT (bạo lực học đường, áp lực thi
                cử, gian lận, quan hệ thầy trò) kèm quy trình giải quyết khoa học 5 bước.
              </p>
              <ul className="space-y-1.5 text-xs text-stone-700">
                <li className="flex items-center gap-1.5">
                  <BookOpen className="h-3.5 w-3.5 text-amber-700" />
                  <span>Ma trận 6 nguyên tắc giáo dục cốt lõi</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <BookOpen className="h-3.5 w-3.5 text-amber-700" />
                  <span>Mô hình 5 bước giải quyết tình huống khoa học</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <BookOpen className="h-3.5 w-3.5 text-amber-700" />
                  <span>Bài học sư phạm &amp; Các sai lầm cần tránh</span>
                </li>
              </ul>
            </div>

            <div className="pt-4">
              <Link
                to={ROUTES.subjectOverview('giao-duc-hoc')}
                className="inline-flex items-center gap-1 text-xs font-semibold text-amber-800 underline underline-offset-4 hover:text-amber-950"
              >
                <span>Khám phá 20 tình huống sư phạm</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </Card>
        </div>
      </section>
    </FadeIn>
  );
}

export default SubjectsListPage;
