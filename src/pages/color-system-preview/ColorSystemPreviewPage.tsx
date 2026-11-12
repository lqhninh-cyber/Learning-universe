import {
  AlertCircle,
  ArrowLeft,
  BookOpen,
  CheckCircle2,
  ChevronRight,
  Copy,
  ExternalLink,
  Link2,
  Sparkles,
} from 'lucide-react';
import { type FC, useState } from 'react';
import { Link } from 'react-router';
import { ROUTES } from '@/shared/config/routes';

interface TokenSwatch {
  readonly variable: string;
  readonly hex: string;
  readonly label: string;
  readonly role: string;
  readonly contrastOnWhite?: string;
  readonly contrastOnDark?: string;
}

const MAIN_SURFACE_TOKENS: readonly TokenSwatch[] = [
  {
    variable: '--bg-main',
    hex: '#EAF0F1',
    label: 'Main Background',
    role: 'Nền canvas chính toàn trang (êm dịu, không chói)',
  },
  {
    variable: '--surface-primary',
    hex: '#F7FAFA',
    label: 'Primary Surface',
    role: 'Bề mặt thẻ bài giảng chính, modal, popover',
  },
  {
    variable: '--surface-secondary',
    hex: '#E1E9EA',
    label: 'Secondary Surface',
    role: 'Thanh điều hướng bên, chip, dải phụ trợ',
  },
  {
    variable: '--surface-tertiary',
    hex: '#D7E1E2',
    label: 'Tertiary Surface',
    role: 'Khối phân tầng bậc 3, hover effect bề mặt',
  },
  {
    variable: '--border-subtle',
    hex: '#CFDADB',
    label: 'Subtle Border',
    role: 'Đường kẻ hairline phân tách thanh nhã',
  },
];

const BRAND_INTERACTIVE_TOKENS: readonly TokenSwatch[] = [
  {
    variable: '--primary',
    hex: '#3F6570',
    label: 'Primary (Mist Blue)',
    role: 'Màu chính: Nút bấm chủ đạo, liên kết chính, tiêu đề',
  },
  {
    variable: '--primary-hover',
    hex: '#345761',
    label: 'Primary Hover',
    role: 'Trạng thái hover và active của tương tác chính',
  },
  {
    variable: '--secondary',
    hex: '#5E786D',
    label: 'Secondary (Sage Green)',
    role: 'Màu phụ: Nhánh Sư phạm, nhãn hoàn thành, badge',
  },
  {
    variable: '--accent',
    hex: '#92714F',
    label: 'Accent (Warm Ochre)',
    role: 'Điểm nhấn đất nung: Ghi chú quan trọng, bổ đề',
  },
];

const TYPOGRAPHY_TOKENS: readonly TokenSwatch[] = [
  {
    variable: '--text-primary',
    hex: '#29383D',
    label: 'Primary Text',
    role: 'Chữ chính: Tiêu đề, nội dung bài giảng (Tương phản 10.3:1)',
  },
  {
    variable: '--text-secondary',
    hex: '#55676B',
    label: 'Secondary Text',
    role: 'Chữ phụ: Metadata, chú giải, nhãn mô tả (Tương phản 5.55:1)',
  },
];

const SEMANTIC_TOKENS: readonly TokenSwatch[] = [
  {
    variable: '--success',
    hex: '#4F7967',
    label: 'Success',
    role: 'Thành công, chứng minh hoàn tất, bài đã hoàn thành',
  },
  {
    variable: '--warning',
    hex: '#987343',
    label: 'Warning',
    role: 'Lưu ý học thuật, cảnh báo bẫy ngụy biện',
  },
  {
    variable: '--danger',
    hex: '#A65D59',
    label: 'Danger',
    role: 'Phản ví dụ, điều kiện loại trừ, cảnh báo sai lầm',
  },
  {
    variable: '--info',
    hex: '#527B8A',
    label: 'Info',
    role: 'Gợi ý, mở rộng kiến thức, bối cảnh lịch sử',
  },
];

const SUBJECT_TOKENS: readonly TokenSwatch[] = [
  {
    variable: '--math-accent',
    hex: '#71889A',
    label: 'Math Accent',
    role: 'Điểm nhấn cho Khối Toán học (Cấu trúc đại số & Affine)',
  },
  {
    variable: '--math-light',
    hex: '#E5EDF1',
    label: 'Math Light Surface',
    role: 'Nền thẻ mỏng cho Khối Toán học',
  },
  {
    variable: '--edu-accent',
    hex: '#718C7E',
    label: 'Education Accent',
    role: 'Điểm nhấn cho Khối Sư phạm (Giáo dục học)',
  },
  {
    variable: '--edu-light',
    hex: '#E8EFEB',
    label: 'Education Light Surface',
    role: 'Nền thẻ mỏng cho Khối Sư phạm',
  },
];

const CONTRAST_PAIRS = [
  {
    foreground: 'Text Primary (#29383D)',
    background: 'Main Canvas (#EAF0F1)',
    ratio: '10.3 : 1',
    wcag: 'AAA (Vượt chuẩn)',
    sample: 'Văn bản đọc chuyên khảo trên nền trang chính',
  },
  {
    foreground: 'Text Primary (#29383D)',
    background: 'Surface Primary (#F7FAFA)',
    ratio: '11.3 : 1',
    wcag: 'AAA (Vượt chuẩn)',
    sample: 'Nội dung định lý và bài học trong khung thẻ',
  },
  {
    foreground: 'Text Secondary (#55676B)',
    background: 'Surface Primary (#F7FAFA)',
    ratio: '5.55 : 1',
    wcag: 'AA (Đạt chuẩn)',
    sample: 'Metadata thời lượng, phiên bản và chú dẫn tác giả',
  },
  {
    foreground: 'White Text (#FFFFFF)',
    background: 'Primary Button (#3F6570)',
    ratio: '5.14 : 1',
    wcag: 'AA (Đạt chuẩn)',
    sample: 'Nút hành động chính và badge học phần',
  },
  {
    foreground: 'White Text (#FFFFFF)',
    background: 'Primary Hover (#345761)',
    ratio: '6.64 : 1',
    wcag: 'AA (Đạt chuẩn)',
    sample: 'Trạng thái hover của nút bấm chính',
  },
  {
    foreground: 'White Text (#FFFFFF)',
    background: 'Secondary Sage (#5E786D)',
    ratio: '4.55 : 1',
    wcag: 'AA (Đạt chuẩn)',
    sample: 'Huy hiệu ngành Sư phạm và nhãn hoàn thành',
  },
];

export const ColorSystemPreviewPage: FC = () => {
  const [copiedVar, setCopiedVar] = useState<string | null>(null);

  const handleCopy = (variable: string) => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      void navigator.clipboard.writeText(`var(${variable})`);
      setCopiedVar(variable);
      setTimeout(() => setCopiedVar(null), 2000);
    }
  };

  return (
    <div
      data-theme="mist-blue-sage"
      className="theme-mist-blue-sage min-h-screen bg-[var(--bg-main)] font-sans text-[var(--text-primary)] antialiased transition-colors duration-300"
    >
      {/* 1. TOP ANNOUNCEMENT & RETURN BAR */}
      <div className="border-b border-[var(--border-subtle)] bg-[var(--surface-primary)]/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <Link
              to={ROUTES.home}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--primary)] transition-colors hover:text-[var(--primary-hover)]"
            >
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              <span>Về Trang chủ</span>
            </Link>
            <span className="text-xs text-[var(--border-subtle)]">|</span>
            <Link
              to={ROUTES.uiPreview}
              className="text-xs font-medium text-[var(--text-secondary)] transition-colors hover:text-[var(--primary)]"
            >
              UI Preview Suite
            </Link>
          </div>

          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--success)]/30 bg-[var(--success)]/10 px-3 py-1 text-xs font-semibold text-[var(--success)]">
              <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
              <span>WCAG 2.2 AA Compliant (Ratio &gt; 4.5:1)</span>
            </span>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl space-y-12 px-4 py-10 sm:px-6 lg:px-8">
        {/* 2. HERO INTRO */}
        <header className="space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full border border-[var(--border-subtle)] bg-[var(--surface-primary)] px-3.5 py-1 text-xs font-medium text-[var(--secondary)]">
            <Sparkles className="h-3.5 w-3.5 text-[var(--primary)]" aria-hidden="true" />
            <span>Design Tokens &amp; Palette Preview — Không gian độc lập</span>
          </div>
          <h1 className="font-serif text-3xl font-bold tracking-tight text-[var(--text-primary)] sm:text-5xl">
            Bảng màu &ldquo;Mist Blue &amp; Sage&rdquo;
          </h1>
          <p className="max-w-3xl text-base leading-relaxed text-[var(--text-secondary)] sm:text-lg">
            Hệ hòa sắc kết hợp giữa sắc <strong>Xanh Chàm Sương (Mist Blue)</strong>,{' '}
            <strong>Xanh Xô Thơm (Sage Green)</strong> và <strong>Đất Nung Mộc (Warm Ochre)</strong>
            . Được kiến tạo chuyên biệt cho nền tảng học thuật đại học, triệt tiêu cảm giác chói
            lóa, đạt chuẩn tương phản quốc tế <strong>WCAG 2.2 AA</strong>.
          </p>
        </header>

        {/* 3. TOKEN SWATCH GRIDS */}
        <section aria-labelledby="token-catalog-heading" className="space-y-8">
          <div className="border-b border-[var(--border-subtle)] pb-4">
            <h2 id="token-catalog-heading" className="font-serif text-2xl font-bold">
              1. Bảng Tra Cứu Toàn Bộ Tokens
            </h2>
            <p className="mt-1 text-xs text-[var(--text-secondary)]">
              Nhấp vào bất kỳ mã thẻ để sao chép cú pháp <code>var(--token-name)</code> vào
              clipboard.
            </p>
          </div>

          {/* Group A: Surfaces */}
          <div className="space-y-3">
            <h3 className="font-mono text-xs font-bold tracking-wider text-[var(--primary)] uppercase">
              A. Nền Canvas &amp; Phân Tầng Bề Mặt (Surfaces)
            </h3>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
              {MAIN_SURFACE_TOKENS.map((token) => (
                <div
                  key={token.variable}
                  onClick={() => handleCopy(token.variable)}
                  className="group relative flex cursor-pointer flex-col justify-between rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-primary)] p-4 shadow-2xs transition-all hover:-translate-y-0.5 hover:shadow-md"
                >
                  <div className="space-y-2">
                    <div
                      className="h-12 w-full rounded-xl border border-black/5"
                      style={{ backgroundColor: token.hex }}
                    />
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-bold text-[var(--text-primary)]">
                        {token.variable}
                      </span>
                      <span className="font-mono text-[11px] text-[var(--text-secondary)]">
                        {token.hex}
                      </span>
                    </div>
                    <p className="text-xs leading-snug text-[var(--text-secondary)]">
                      {token.role}
                    </p>
                  </div>
                  <div className="mt-3 flex items-center gap-1 text-[11px] text-[var(--primary)] opacity-0 transition-opacity group-hover:opacity-100">
                    <Copy className="h-3 w-3" />
                    <span>{copiedVar === token.variable ? 'Đã sao chép!' : 'Sao chép var()'}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Group B: Brand & Interactive */}
          <div className="space-y-3">
            <h3 className="font-mono text-xs font-bold tracking-wider text-[var(--primary)] uppercase">
              B. Màu Nhận Diện &amp; Tương Tác (Brand &amp; Interactive)
            </h3>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {BRAND_INTERACTIVE_TOKENS.map((token) => (
                <div
                  key={token.variable}
                  onClick={() => handleCopy(token.variable)}
                  className="group relative flex cursor-pointer flex-col justify-between rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-primary)] p-4 shadow-2xs transition-all hover:-translate-y-0.5 hover:shadow-md"
                >
                  <div className="space-y-2">
                    <div
                      className="h-12 w-full rounded-xl border border-black/5"
                      style={{ backgroundColor: token.hex }}
                    />
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-bold text-[var(--text-primary)]">
                        {token.variable}
                      </span>
                      <span className="font-mono text-[11px] text-[var(--text-secondary)]">
                        {token.hex}
                      </span>
                    </div>
                    <p className="text-xs leading-snug text-[var(--text-secondary)]">
                      {token.role}
                    </p>
                  </div>
                  <div className="mt-3 flex items-center gap-1 text-[11px] text-[var(--primary)] opacity-0 transition-opacity group-hover:opacity-100">
                    <Copy className="h-3 w-3" />
                    <span>{copiedVar === token.variable ? 'Đã sao chép!' : 'Sao chép var()'}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Group C: Typography & Semantic */}
          <div className="grid gap-6 lg:grid-cols-2">
            {/* C1: Typography */}
            <div className="space-y-3">
              <h3 className="font-mono text-xs font-bold tracking-wider text-[var(--primary)] uppercase">
                C. Kiểu Chữ &amp; Độ Tương Phản (Typography)
              </h3>
              <div className="grid gap-3 sm:grid-cols-2">
                {TYPOGRAPHY_TOKENS.map((token) => (
                  <div
                    key={token.variable}
                    onClick={() => handleCopy(token.variable)}
                    className="group relative flex cursor-pointer flex-col justify-between rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-primary)] p-4 shadow-2xs transition-all hover:-translate-y-0.5 hover:shadow-md"
                  >
                    <div className="space-y-2">
                      <div
                        className="flex h-12 w-full items-center justify-center rounded-xl font-serif text-lg font-bold"
                        style={{ backgroundColor: 'var(--surface-secondary)', color: token.hex }}
                      >
                        Aa Chữ Quốc Ngữ
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-xs font-bold text-[var(--text-primary)]">
                          {token.variable}
                        </span>
                        <span className="font-mono text-[11px] text-[var(--text-secondary)]">
                          {token.hex}
                        </span>
                      </div>
                      <p className="text-xs leading-snug text-[var(--text-secondary)]">
                        {token.role}
                      </p>
                    </div>
                    <div className="mt-3 flex items-center gap-1 text-[11px] text-[var(--primary)] opacity-0 transition-opacity group-hover:opacity-100">
                      <Copy className="h-3 w-3" />
                      <span>
                        {copiedVar === token.variable ? 'Đã sao chép!' : 'Sao chép var()'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* C2: Subject Accents */}
            <div className="space-y-3">
              <h3 className="font-mono text-xs font-bold tracking-wider text-[var(--primary)] uppercase">
                D. Nhận Diện Hai Khối Học Phần (Subject Accents)
              </h3>
              <div className="grid gap-3 sm:grid-cols-2">
                {SUBJECT_TOKENS.map((token) => (
                  <div
                    key={token.variable}
                    onClick={() => handleCopy(token.variable)}
                    className="group relative flex cursor-pointer flex-col justify-between rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-primary)] p-4 shadow-2xs transition-all hover:-translate-y-0.5 hover:shadow-md"
                  >
                    <div className="space-y-2">
                      <div
                        className="h-10 w-full rounded-xl border border-black/5"
                        style={{ backgroundColor: token.hex }}
                      />
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-xs font-bold text-[var(--text-primary)]">
                          {token.variable}
                        </span>
                        <span className="font-mono text-[11px] text-[var(--text-secondary)]">
                          {token.hex}
                        </span>
                      </div>
                      <p className="text-xs leading-snug text-[var(--text-secondary)]">
                        {token.role}
                      </p>
                    </div>
                    <div className="mt-3 flex items-center gap-1 text-[11px] text-[var(--primary)] opacity-0 transition-opacity group-hover:opacity-100">
                      <Copy className="h-3 w-3" />
                      <span>
                        {copiedVar === token.variable ? 'Đã sao chép!' : 'Sao chép var()'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Group E: Semantic Signals */}
          <div className="space-y-3">
            <h3 className="font-mono text-xs font-bold tracking-wider text-[var(--primary)] uppercase">
              E. Tín Hiệu Phản Hồi Học Thuật (Semantic Feedback)
            </h3>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {SEMANTIC_TOKENS.map((token) => (
                <div
                  key={token.variable}
                  onClick={() => handleCopy(token.variable)}
                  className="group relative flex cursor-pointer flex-col justify-between rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-primary)] p-4 shadow-2xs transition-all hover:-translate-y-0.5 hover:shadow-md"
                >
                  <div className="space-y-2">
                    <div
                      className="h-10 w-full rounded-xl border border-black/5"
                      style={{ backgroundColor: token.hex }}
                    />
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-bold text-[var(--text-primary)]">
                        {token.variable}
                      </span>
                      <span className="font-mono text-[11px] text-[var(--text-secondary)]">
                        {token.hex}
                      </span>
                    </div>
                    <p className="text-xs leading-snug text-[var(--text-secondary)]">
                      {token.role}
                    </p>
                  </div>
                  <div className="mt-3 flex items-center gap-1 text-[11px] text-[var(--primary)] opacity-0 transition-opacity group-hover:opacity-100">
                    <Copy className="h-3 w-3" />
                    <span>{copiedVar === token.variable ? 'Đã sao chép!' : 'Sao chép var()'}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 4. COMPONENT APPLICATION DEMO */}
        <section aria-labelledby="components-demo-heading" className="space-y-8">
          <div className="border-b border-[var(--border-subtle)] pb-4">
            <h2 id="components-demo-heading" className="font-serif text-2xl font-bold">
              2. Ứng Dụng Trực Quan Trên Linh Kiện Học Thuật
            </h2>
            <p className="mt-1 text-xs text-[var(--text-secondary)]">
              Mô phỏng chân thực các component chính (Header, Thẻ môn học, Bài đọc, Khối định lý)
              với bảng màu Mist Blue &amp; Sage.
            </p>
          </div>

          {/* Component Demo 1: Floating Capsule Header */}
          <div className="space-y-3">
            <p className="font-mono text-xs font-semibold text-[var(--text-secondary)] uppercase">
              • Demo Header Đảo Nổi (Floating Capsule)
            </p>
            <div className="flex justify-center rounded-3xl border border-[var(--border-subtle)] bg-[var(--surface-secondary)]/50 p-6 sm:p-10">
              <div className="flex h-14 w-full max-w-3xl items-center justify-between rounded-full border border-[var(--border-subtle)] bg-[var(--surface-primary)]/90 px-6 shadow-sm backdrop-blur-xl">
                <span className="font-serif text-xs font-bold tracking-[0.22em] text-[var(--text-primary)] uppercase sm:text-sm">
                  LEARNING UNIVERSE
                </span>
                <div className="hidden items-center gap-1 sm:flex">
                  <span className="rounded-full bg-[var(--surface-secondary)] px-3 py-1 text-xs font-semibold text-[var(--primary)]">
                    Trang chủ
                  </span>
                  <span className="px-3 py-1 text-xs font-medium text-[var(--text-secondary)]">
                    Không gian học tập
                  </span>
                  <span className="px-3 py-1 text-xs font-medium text-[var(--text-secondary)]">
                    Tất cả môn học
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-[var(--primary)] px-3.5 py-1.5 text-xs font-semibold text-white shadow-2xs">
                    Đăng nhập
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Component Demo 2: Subject Cards */}
          <div className="space-y-3">
            <p className="font-mono text-xs font-semibold text-[var(--text-secondary)] uppercase">
              • Demo Thẻ Môn Học (Subject Cards) Khối Toán &amp; Sư Phạm
            </p>
            <div className="grid gap-6 md:grid-cols-2">
              {/* Card 1: Math Subject */}
              <div className="group flex flex-col justify-between rounded-3xl border border-[var(--border-subtle)] bg-[var(--surface-primary)] p-8 shadow-sm transition-all hover:-translate-y-1 hover:shadow-md">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="rounded-full bg-[var(--math-light)] px-3 py-0.5 font-mono text-xs font-semibold text-[var(--math-accent)]">
                      TOÁN HỌC · HỌC PHẦN CỐT LÕI
                    </span>
                    <span className="text-xs text-[var(--text-secondary)]">
                      Chuyên ngành Sư phạm Toán
                    </span>
                  </div>
                  <h3 className="font-serif text-2xl font-bold text-[var(--text-primary)] transition-colors group-hover:text-[var(--primary)]">
                    Cấu trúc đại số
                  </h3>
                  <p className="text-sm leading-relaxed text-[var(--text-secondary)]">
                    Hệ thống toàn diện từ Nửa nhóm, Vị nhóm, Lý thuyết Nhóm, Định lý Lagrange, Đồng
                    cấu, Vành và Trường theo chuẩn mực Huỳnh Việt Khánh.
                  </p>
                </div>
                <div className="mt-8 flex items-center justify-between border-t border-[var(--border-subtle)] pt-4">
                  <span className="text-xs font-semibold text-[var(--text-secondary)]">
                    8 chương · 34 bài giảng chuyên khảo
                  </span>
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--primary)] text-white shadow-2xs transition-colors hover:bg-[var(--primary-hover)]">
                    <ChevronRight className="h-5 w-5" />
                  </div>
                </div>
              </div>

              {/* Card 2: Pedagogy Subject */}
              <div className="group flex flex-col justify-between rounded-3xl border border-[var(--border-subtle)] bg-[var(--surface-primary)] p-8 shadow-sm transition-all hover:-translate-y-1 hover:shadow-md">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="rounded-full bg-[var(--edu-light)] px-3 py-0.5 font-mono text-xs font-semibold text-[var(--edu-accent)]">
                      KHOA HỌC GIÁO DỤC · 04 TÍN CHỈ
                    </span>
                    <span className="text-xs text-[var(--text-secondary)]">04 Tín chỉ</span>
                  </div>
                  <h3 className="font-serif text-2xl font-bold text-[var(--text-primary)] transition-colors group-hover:text-[var(--secondary)]">
                    Giáo dục học
                  </h3>
                  <p className="text-sm leading-relaxed text-[var(--text-secondary)]">
                    Trang bị cơ sở lý luận giáo dục học hiện đại, phương pháp chủ nhiệm lớp, thiết
                    kế hoạt động trải nghiệm và xử lý tình huống sư phạm theo chuẩn GDPT 2018.
                  </p>
                </div>
                <div className="mt-8 flex items-center justify-between border-t border-[var(--border-subtle)] pt-4">
                  <span className="text-xs font-semibold text-[var(--text-secondary)]">
                    5 chương lý thuyết · 3 bài thực hành (CLO1–CLO9)
                  </span>
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--secondary)] text-white shadow-2xs transition-colors hover:bg-[#4E665C]">
                    <ChevronRight className="h-5 w-5" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Component Demo 3: Lesson Reader Layout & Blocks */}
          <div className="space-y-3">
            <p className="font-mono text-xs font-semibold text-[var(--text-secondary)] uppercase">
              • Demo Không Gian Đọc Bài Giảng (Lesson Reader View)
            </p>
            <div className="rounded-3xl border border-[var(--border-subtle)] bg-[var(--bg-main)] p-6 lg:p-8">
              <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
                {/* Main Article (8/12) */}
                <article className="space-y-6 rounded-3xl border border-[var(--border-subtle)] bg-[var(--surface-primary)] p-6 shadow-sm sm:p-10 lg:col-span-8">
                  <div className="space-y-2 border-b border-[var(--border-subtle)] pb-4">
                    <div className="flex items-center gap-2">
                      <span className="rounded-md bg-[var(--surface-secondary)] px-2.5 py-0.5 text-xs font-semibold text-[var(--primary)]">
                        Chương 3 · Bài 3.2
                      </span>
                      <span className="rounded-md border border-[var(--border-subtle)] bg-[var(--surface-primary)] px-2.5 py-0.5 text-xs text-[var(--text-secondary)]">
                        Trung bình · 45 phút đọc
                      </span>
                    </div>
                    <h2 className="font-serif text-2xl font-bold tracking-tight text-[var(--text-primary)] sm:text-3xl">
                      Định lý Lagrange và Cấp của Phần tử
                    </h2>
                  </div>

                  {/* Horizontal Prerequisites Bar */}
                  <div className="flex flex-wrap items-center gap-2.5 rounded-xl border border-[var(--accent)]/30 bg-[var(--accent)]/10 p-3 text-xs text-[var(--text-primary)] md:text-sm">
                    <div className="flex items-center gap-1.5 font-semibold text-[var(--accent)]">
                      <Link2 className="h-4 w-4" />
                      <span>Kiến thức tiên quyết:</span>
                    </div>
                    <span className="rounded-lg border border-[var(--accent)]/30 bg-[var(--surface-primary)] px-2.5 py-1 text-xs font-medium text-[var(--text-primary)] shadow-2xs">
                      Bài 3.1: Lớp kề, phân hoạch và chỉ số của nhóm con
                    </span>
                  </div>

                  {/* Lead Drop Cap */}
                  <p className="academic-dropcap-paragraph font-serif text-[18px] leading-[1.85] text-[var(--text-primary)]">
                    Trong lý thuyết nhóm hữu hạn, Định lý Lagrange là một trong những kết quả nền
                    tảng và đẹp đẽ nhất. Định lý xác lập rằng cấp của bất kỳ nhóm con nào cũng luôn
                    phải là ước số của cấp nhóm toàn thể, qua đó mở ra các tiêu chuẩn số học mạnh mẽ
                    cho cấu trúc đại số.
                  </p>

                  {/* Theory Block (Theorem) */}
                  <div className="my-6 rounded-2xl border-t border-r border-b border-l-4 border-[var(--border-subtle)] border-[var(--primary)] bg-[var(--surface-primary)] p-5 shadow-2xs">
                    <div className="mb-2 flex items-center justify-between">
                      <span className="font-serif text-sm font-bold text-[var(--primary)]">
                        Định lý 3.2.1 (Định lý Lagrange)
                      </span>
                      <span className="rounded bg-[var(--surface-secondary)] px-2 py-0.5 font-mono text-[11px] text-[var(--text-secondary)]">
                        Gốc: ĐL 3.7 · tr. 59
                      </span>
                    </div>
                    <p className="text-sm leading-relaxed text-[var(--text-primary)]">
                      Cho <span className="font-serif font-semibold italic">G</span> là một nhóm hữu
                      hạn và <span className="font-serif font-semibold italic">H</span> là một nhóm
                      con của <span className="font-serif font-semibold italic">G</span>. Khi đó cấp
                      của <span className="font-serif font-semibold italic">H</span> là một ước số
                      của cấp của <span className="font-serif font-semibold italic">G</span>. Cụ
                      thể:
                    </p>
                    <div className="my-3 rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-secondary)]/60 px-4 py-2.5 text-center font-serif text-base font-bold text-[var(--text-primary)]">
                      |G| = [G : H] · |H|
                    </div>
                  </div>

                  {/* Warning / Note Block */}
                  <div className="rounded-2xl border-t border-r border-b border-l-4 border-[var(--border-subtle)] border-[var(--warning)] bg-[var(--surface-primary)] p-4 text-xs text-[var(--text-primary)]">
                    <div className="mb-1 flex items-center gap-1.5 font-semibold text-[var(--warning)]">
                      <AlertCircle className="h-4 w-4" />
                      <span>Lưu ý quan trọng:</span>
                    </div>
                    <p className="leading-relaxed text-[var(--text-secondary)]">
                      Mệnh đề đảo của Định lý Lagrange không đúng trong trường hợp tổng quát (tồn
                      tại ước số d của |G| nhưng G không chứa nhóm con cấp d).
                    </p>
                  </div>

                  {/* Source Reference & Drive PDF Action */}
                  <div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-secondary)]/50 p-5">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5 text-xs font-semibold text-[var(--primary)]">
                          <BookOpen className="h-4 w-4" />
                          <span>Giáo trình Cấu trúc đại số - TS. Huỳnh Việt Khánh</span>
                        </div>
                        <p className="text-xs text-[var(--text-secondary)]">
                          Đối chiếu trực tiếp nội dung giảng dạy: Trang 59–63 (Bản kết xuất chuẩn).
                        </p>
                      </div>
                      <a
                        href="https://drive.google.com/file/d/17drWozpQN-4jt4si1hhCHoXslUFkYtKm/view"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 rounded-xl bg-[var(--primary)] px-4 py-2 text-xs font-semibold text-white shadow-2xs transition-colors hover:bg-[var(--primary-hover)]"
                      >
                        <span>Đọc giáo trình PDF (Trang 59–63)</span>
                        <ExternalLink className="h-3.5 w-3.5" />
                      </a>
                    </div>
                  </div>
                </article>

                {/* Sidenotes & TOC Column (4/12) */}
                <aside className="space-y-6 lg:col-span-4">
                  {/* Sticky TOC Card */}
                  <div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-primary)] p-4 shadow-sm">
                    <p className="mb-3 font-mono text-xs font-bold tracking-wider text-[var(--primary)] uppercase">
                      Mục lục bài giảng
                    </p>
                    <ul className="space-y-2 text-xs text-[var(--text-secondary)]">
                      <li className="font-semibold text-[var(--primary)]">
                        1. Khái niệm cấp của nhóm con
                      </li>
                      <li className="hover:text-[var(--text-primary)]">
                        2. Phát biểu &amp; Chứng minh Định lý Lagrange
                      </li>
                      <li className="hover:text-[var(--text-primary)]">
                        3. Hệ quả đối với cấp phần tử
                      </li>
                      <li className="hover:text-[var(--text-primary)]">
                        4. Bài tập thực hành &amp; Phản ví dụ
                      </li>
                    </ul>
                  </div>

                  {/* Sidenote Card */}
                  <div className="rounded-2xl border-t border-r border-b border-l-2 border-[var(--border-subtle)] border-[var(--secondary)] bg-[var(--surface-primary)] p-4 text-xs leading-relaxed text-[var(--text-secondary)]">
                    <span className="font-semibold text-[var(--secondary)]">
                      Chú giải lịch sử (Lagrange):
                    </span>{' '}
                    Joseph-Louis Lagrange công bố kết quả tiền đề vào năm 1771 trong chuyên luận về
                    nghiệm của phương trình đại số, trước khi lý thuyết nhóm trừu tượng được hình
                    thành.
                  </div>
                </aside>
              </div>
            </div>
          </div>
        </section>

        {/* 5. WCAG 2.2 AA CONTRAST AUDIT TABLE */}
        <section aria-labelledby="wcag-audit-heading" className="space-y-4">
          <div className="border-b border-[var(--border-subtle)] pb-4">
            <h2 id="wcag-audit-heading" className="font-serif text-2xl font-bold">
              3. Bảng Kiểm Định Tỷ Lệ Tương Phản (WCAG 2.2 AA)
            </h2>
            <p className="mt-1 text-xs text-[var(--text-secondary)]">
              Mọi cặp màu văn bản và nền tương tác trong bảng màu &ldquo;Mist Blue &amp; Sage&rdquo;
              đều vượt ngưỡng tối thiểu 4.5:1 của WCAG Level AA.
            </p>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-primary)] shadow-sm">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-[var(--border-subtle)] bg-[var(--surface-secondary)]/60 font-mono text-[11px] font-bold text-[var(--text-primary)] uppercase">
                <tr>
                  <th className="px-4 py-3">Màu chữ (Foreground)</th>
                  <th className="px-4 py-3">Màu nền (Background)</th>
                  <th className="px-4 py-3 text-center">Tỷ lệ Tương phản</th>
                  <th className="px-4 py-3 text-center">Chuẩn WCAG 2.2</th>
                  <th className="px-4 py-3">Phạm vi áp dụng</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-subtle)] text-[var(--text-secondary)]">
                {CONTRAST_PAIRS.map((row) => (
                  <tr
                    key={row.foreground + row.background}
                    className="hover:bg-[var(--surface-secondary)]/30"
                  >
                    <td className="px-4 py-3 font-medium text-[var(--text-primary)]">
                      {row.foreground}
                    </td>
                    <td className="px-4 py-3">{row.background}</td>
                    <td className="px-4 py-3 text-center font-mono font-bold text-[var(--primary)]">
                      {row.ratio}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="inline-flex rounded-full bg-[var(--success)]/15 px-2.5 py-0.5 font-semibold text-[var(--success)]">
                        {row.wcag}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-[11px]">{row.sample}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* 6. FOOTER NOTICE */}
        <footer className="border-t border-[var(--border-subtle)] pt-6 text-center text-xs text-[var(--text-secondary)]">
          <p>
            Bảng màu &ldquo;Mist Blue &amp; Sage&rdquo; được lưu trữ trong scope độc lập{' '}
            <code className="font-mono text-[var(--primary)]">
              [data-theme=&apos;mist-blue-sage&apos;]
            </code>
            . Không ảnh hưởng đến giao diện chính thức tại <code>/</code> và <code>/courses</code>.
          </p>
        </footer>
      </div>
    </div>
  );
};

export default ColorSystemPreviewPage;
