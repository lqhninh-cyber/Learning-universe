import { useEffect, useId, useState } from 'react';
import { cn } from '@/shared/lib/cn';

export interface MermaidChartProps {
  readonly chart: string;
  readonly className?: string;
  readonly title?: string;
}

const isTestOrSsr = typeof window === 'undefined' || import.meta.env.MODE === 'test';

export function MermaidChart({ chart, className, title }: MermaidChartProps) {
  const [svgHtml, setSvgHtml] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(!isTestOrSsr);
  const [showRawCode, setShowRawCode] = useState<boolean>(false);
  const rawId = useId();
  const safeId = `mermaid-${rawId.replace(/[^a-zA-Z0-9_-]/g, '')}`;

  useEffect(() => {
    let isMounted = true;

    // Trong môi trường kiểm thử jsdom (Vitest) hoặc SSR, bỏ qua render SVG DOM
    if (isTestOrSsr) {
      return;
    }

    async function renderChart() {
      try {
        const mermaidModule = await import('mermaid');
        const mermaid = mermaidModule.default;

        mermaid.initialize({
          startOnLoad: false,
          theme: 'neutral',
          fontFamily: 'inherit',
          securityLevel: 'loose',
          flowchart: {
            useMaxWidth: true,
            htmlLabels: true,
            curve: 'basis',
          },
        });

        // Xóa sạch phần tử DOM tạm thời nếu mermaid từng render id này trước đó
        const existingEl = document.getElementById(safeId);
        if (existingEl) {
          existingEl.remove();
        }

        const { svg } = await mermaid.render(safeId, chart);
        if (isMounted) {
          setSvgHtml(svg);
          setIsLoading(false);
        }
      } catch (err) {
        if (isMounted) {
          console.warn('Lỗi kết xuất sơ đồ Mermaid:', err);
          setError(err instanceof Error ? err.message : String(err));
          setIsLoading(false);
        }
      }
    }

    renderChart();

    return () => {
      isMounted = false;
      const el = document.getElementById(safeId);
      if (el) {
        el.remove();
      }
    };
  }, [chart, safeId]);

  return (
    <div
      data-testid="mermaid-chart"
      className={cn(
        'my-8 overflow-hidden rounded-2xl border border-stone-200/90 bg-[#faf8f2]/80 shadow-sm transition-all duration-200',
        className,
      )}
    >
      {/* Thanh tiêu đề & điều khiển thanh lịch */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-stone-200/80 bg-white/70 px-5 py-3">
        <div className="flex items-center gap-2">
          <span className="flex h-6 w-6 items-center justify-center rounded-md bg-amber-800/10 text-xs text-amber-900">
            📊
          </span>
          <span className="font-serif text-[15px] font-semibold text-stone-900">
            {title || 'Sơ đồ tư duy & Bản đồ tri thức trực quan'}
          </span>
        </div>
        <button
          type="button"
          onClick={() => setShowRawCode((prev) => !prev)}
          className="rounded-lg border border-stone-200 bg-white px-2.5 py-1 text-xs font-medium text-stone-600 shadow-2xs transition-colors hover:bg-stone-50 hover:text-stone-900"
        >
          {showRawCode ? 'Ẩn mã sơ đồ' : 'Xem mã nguồn sơ đồ'}
        </button>
      </div>

      {/* Nội dung kết xuất */}
      {showRawCode ? (
        <div className="overflow-x-auto bg-stone-900 p-4 font-mono text-xs text-stone-200">
          <pre>{chart}</pre>
        </div>
      ) : (
        <div className="p-6">
          {isLoading && (
            <div className="flex items-center justify-center py-12 text-sm text-stone-500">
              <span className="animate-pulse">Đang kết xuất đồ họa vector...</span>
            </div>
          )}

          {!isLoading && error && (
            <div className="rounded-xl border border-amber-200 bg-amber-50/70 p-4 text-xs text-amber-900">
              <p className="mb-1 font-semibold">
                Không thể hiển thị đồ họa vector (Lỗi phân tích cú pháp Mermaid):
              </p>
              <pre className="mt-2 overflow-x-auto rounded-lg border border-amber-200/60 bg-white/80 p-3 font-mono text-[11.5px] text-stone-700">
                {chart}
              </pre>
            </div>
          )}

          {!isLoading && !error && svgHtml && (
            <div
              className="flex justify-center overflow-x-auto [&_svg]:mx-auto [&_svg]:h-auto [&_svg]:max-w-full"
              dangerouslySetInnerHTML={{ __html: svgHtml }}
            />
          )}

          {!isLoading && !error && !svgHtml && (
            // Dành cho môi trường test Vitest không có DOM SVG
            <div className="py-6 text-center text-xs text-stone-500 italic">
              [Sơ đồ tư duy trực quan — Bản đồ cấu trúc đại số]
            </div>
          )}
        </div>
      )}
    </div>
  );
}
