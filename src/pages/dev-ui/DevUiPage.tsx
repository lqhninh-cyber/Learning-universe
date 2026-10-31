import { BookOpen, Compass, Info, PanelLeft, Search, Sigma } from 'lucide-react';
import { useState } from 'react';
import { FadeIn } from '@/shared/motion/FadeIn';
import { SUBJECT_THEMES, type SubjectThemeId } from '@/shared/theme/subject-themes';
import { SubjectThemeProvider } from '@/shared/theme/SubjectThemeProvider';
import {
  Badge,
  Breadcrumb,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Collapsible,
  Drawer,
  Kbd,
  ProgressRing,
  Skeleton,
  Tooltip,
} from '@/shared/ui';

const THEME_IDS: readonly SubjectThemeId[] = [
  'default',
  'algebraic-structures',
  'affine-geometry',
] as const;

const SWATCHES = [
  { label: '50', className: 'bg-subject-50 text-subject-900 border border-subject-200' },
  { label: '100', className: 'bg-subject-100 text-subject-900' },
  { label: '200', className: 'bg-subject-200 text-subject-900' },
  { label: '300', className: 'bg-subject-300 text-subject-950' },
  { label: '400', className: 'bg-subject-400 text-white' },
  { label: '500', className: 'bg-subject-500 text-white' },
  { label: '600', className: 'bg-subject-600 text-white' },
  { label: '700', className: 'bg-subject-700 text-white' },
  { label: '800', className: 'bg-subject-800 text-white' },
  { label: '900', className: 'bg-subject-900 text-white' },
  { label: '950', className: 'bg-subject-950 text-white' },
] as const;

export function DevUiPage() {
  const [activeTheme, setActiveTheme] = useState<SubjectThemeId>('algebraic-structures');
  const currentMeta = SUBJECT_THEMES[activeTheme];

  return (
    <SubjectThemeProvider subject={activeTheme} className="space-y-12 pb-16">
      <FadeIn className="space-y-4">
        <Breadcrumb
          items={[
            { label: 'Trang chủ', href: '/' },
            { label: 'Design System & Subject Theming (/dev/ui)' },
          ]}
        />
        <div className="flex flex-col justify-between gap-4 border-b border-stone-200 pb-6 sm:flex-row sm:items-end">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Badge variant="subject">Giai đoạn 1</Badge>
              <Badge variant="neutral">OKLCH CSS Variables</Badge>
            </div>
            <h1 className="text-2xl font-semibold tracking-tight text-stone-900 sm:text-3xl">
              Design System & Subject Theming
            </h1>
            <p className="max-w-2xl text-sm text-stone-600">
              Kiểm thử trực quan bộ UI primitives và cơ chế đổi màu nhận diện theo từng môn học mà
              không dùng class Tailwind ghép chuỗi động.
            </p>
          </div>

          <div
            role="group"
            aria-label="Chọn bảng màu môn học"
            className="inline-flex flex-wrap gap-1.5 rounded-xl border border-stone-200 bg-white p-1.5"
          >
            {THEME_IDS.map((themeId) => {
              const meta = SUBJECT_THEMES[themeId];
              const isSelected = activeTheme === themeId;
              return (
                <Button
                  key={themeId}
                  size="sm"
                  variant={isSelected ? 'subject' : 'ghost'}
                  onClick={() => setActiveTheme(themeId)}
                >
                  {themeId === 'algebraic-structures' && <Sigma className="h-3.5 w-3.5" />}
                  {themeId === 'affine-geometry' && <Compass className="h-3.5 w-3.5" />}
                  <span>{meta.name}</span>
                </Button>
              );
            })}
          </div>
        </div>
      </FadeIn>

      {/* 1. Subject Palette */}
      <section className="space-y-4">
        <div className="flex items-baseline justify-between">
          <h2 className="text-lg font-semibold text-stone-900">
            1. Bảng màu nhận diện ({currentMeta.name} — Hue {currentMeta.hue})
          </h2>
          <span className="font-mono text-xs text-stone-500">
            data-subject=&quot;{activeTheme}&quot;
          </span>
        </div>
        <p className="text-sm text-stone-600">{currentMeta.description}</p>
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-6 lg:grid-cols-11">
          {SWATCHES.map((swatch) => (
            <div
              key={swatch.label}
              className={`flex h-20 flex-col justify-between rounded-xl p-2.5 font-mono text-xs font-medium ${swatch.className}`}
            >
              <span>subject</span>
              <span>{swatch.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* 2. Buttons & Badges */}
      <section className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>2. Buttons (`Button`)</CardTitle>
            <CardDescription>
              Các biến thể nút hành động tự động thích ứng với màu môn học hiện hành.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap items-center gap-2.5">
              <Button variant="primary">Primary</Button>
              <Button variant="subject">Subject Action</Button>
              <Button variant="subjectOutline">Subject Outline</Button>
              <Button variant="secondary">Secondary</Button>
              <Button variant="outline">Outline</Button>
              <Button variant="ghost">Ghost</Button>
              <Button variant="subject" disabled>
                Disabled
              </Button>
            </div>
            <div className="flex flex-wrap items-center gap-2.5 border-t border-stone-100 pt-4">
              <Button size="sm" variant="subject">
                Cỡ nhỏ (sm)
              </Button>
              <Button size="md" variant="subject">
                Cỡ vừa (md)
              </Button>
              <Button size="lg" variant="subject">
                Cỡ lớn (lg)
              </Button>
              <Tooltip content="Tìm kiếm nhanh bài học (Giai đoạn sau)">
                <Button size="icon" variant="outline" aria-label="Tìm kiếm">
                  <Search className="h-4 w-4" />
                </Button>
              </Tooltip>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>3. Badges, Tooltip & Kbd</CardTitle>
            <CardDescription>
              Nhãn môn học, trạng thái duyệt bài (draft → published) và phím tắt.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="subject">{currentMeta.name}</Badge>
              <Badge variant="subjectSolid">{currentMeta.shortName}</Badge>
              <Badge variant="neutral">Chương 1</Badge>
              <Badge variant="draft">draft</Badge>
              <Badge variant="review">review</Badge>
              <Badge variant="approved">approved</Badge>
              <Badge variant="published">published</Badge>
            </div>
            <div className="flex flex-wrap items-center gap-4 border-t border-stone-100 pt-4 text-xs text-stone-600">
              <span className="inline-flex items-center gap-1.5">
                Phím tắt tra cứu: <Kbd>Ctrl</Kbd> + <Kbd>K</Kbd>
              </span>
              <Tooltip content="Đối chiếu trực tiếp số trang và số hiệu định lý trong giáo trình gốc.">
                <span className="text-subject-700 inline-flex cursor-help items-center gap-1 font-medium underline decoration-dotted">
                  <Info className="h-3.5 w-3.5" />
                  <span>Chú thích nguồn tham khảo (di chuột)</span>
                </span>
              </Tooltip>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* 3. Academic Blocks & Collapsible */}
      <section className="grid gap-6 lg:grid-cols-2">
        <Card accent="subjectLeft">
          <CardHeader>
            <div className="flex items-center justify-between">
              <Badge variant="subject">Định lý 1.1.2 (Mô phỏng)</Badge>
              <span className="font-mono text-xs text-stone-500">
                accent=&quot;subjectLeft&quot;
              </span>
            </div>
            <CardTitle>Khung khối lý thuyết & Chứng minh thu gọn</CardTitle>
            <CardDescription>
              Minh họa cách kết hợp `Card` viền trái theo màu môn và `Collapsible` cho phần chứng
              minh hoặc lời giải bài tập.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Collapsible
              title="Chứng minh"
              badge={<Badge variant="neutral">Thu gọn / Mở rộng</Badge>}
              defaultOpen
            >
              Giả sử <code className="font-mono">(G, *)</code> là một nhóm. Khi đó phần tử đơn vị{' '}
              <code className="font-mono">e</code> là duy nhất và mọi phần tử đều có nghịch đảo duy
              nhất. ∎
            </Collapsible>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>4. Tiến độ (`ProgressRing`), `Drawer` & `Skeleton`</CardTitle>
            <CardDescription>
              Vòng tròn tiến độ theo màu môn, ngăn kéo điều hướng mobile và khung tải dữ liệu.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="flex flex-wrap items-center gap-6">
              <div className="flex items-center gap-3">
                <ProgressRing value={0} />
                <ProgressRing value={35} />
                <ProgressRing value={75} />
                <ProgressRing value={100} />
              </div>

              <Drawer
                title={`Đề cương: ${currentMeta.name}`}
                description="Ngăn kéo điều hướng chương/bài trên thiết bị di động"
                trigger={
                  <Button variant="subjectOutline" size="sm">
                    <PanelLeft className="h-4 w-4" />
                    <span>Mở thử Drawer</span>
                  </Button>
                }
              >
                <div className="space-y-3 text-sm text-stone-700">
                  <div className="bg-subject-50 text-subject-800 rounded-lg px-3 py-2 font-medium">
                    Chương 1. Khái niệm cơ sở
                  </div>
                  <ul className="space-y-1 pl-3 text-xs text-stone-600">
                    <li className="text-subject-700 py-1 font-medium">
                      Bài 1.1. Định nghĩa mở đầu
                    </li>
                    <li className="py-1">Bài 1.2. Các tính chất sơ cấp</li>
                  </ul>
                </div>
              </Drawer>
            </div>

            <div className="space-y-2 border-t border-stone-100 pt-4">
              <p className="text-xs font-medium text-stone-500">Khung tải (`Skeleton`):</p>
              <div className="flex items-center gap-3">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-3.5 w-2/5" />
                  <Skeleton className="h-3 w-4/5" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* 4. Typography & Prose */}
      <section>
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <BookOpen className="text-subject-600 h-4 w-4" />
              <CardTitle>5. Typography học thuật tiếng Việt (`.lu-prose`)</CardTitle>
            </div>
            <CardDescription>
              Font chữ <strong>Be Vietnam Pro</strong> kết hợp <strong>JetBrains Mono</strong>, độ
              rộng đọc tối đa <code>70ch</code>, hỗ trợ đầy đủ dấu tiếng Việt.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <article className="lu-prose rounded-xl border border-stone-100 bg-stone-50/60 p-6">
              <h2>1. Cấu trúc đại số và Không gian Affine</h2>
              <p>
                Trong chương trình <strong>Sư phạm Toán học</strong>, việc nắm vững mối liên hệ giữa
                cấu trúc đại số trừu tượng và trực quan hình học đóng vai trò nền tảng. Một không
                gian affine thực chất là một tập hợp điểm đi kèm tác động tự do và bắc cầu của một
                không gian vectơ.
              </p>
              <h3>Quy ước ký hiệu và định danh</h3>
              <ul>
                <li>
                  Mọi định nghĩa, định lý, hệ quả được đánh số tự động theo dạng{' '}
                  <code>Chương.Bài.Số</code> (ví dụ: <code>Định lý 1.1.2</code>).
                </li>
                <li>Ví dụ minh họa và Bài tập sử dụng bộ đếm độc lập để người học dễ tra cứu.</li>
              </ul>
            </article>
          </CardContent>
        </Card>
      </section>
    </SubjectThemeProvider>
  );
}

export default DevUiPage;
