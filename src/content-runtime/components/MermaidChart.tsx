import { useEffect, useId, useState } from 'react';
import { cn } from '@/shared/lib/cn';
import { Chapter0KnowledgeMap } from './Chapter0KnowledgeMap';
import { Chapter7KnowledgeMap } from './Chapter7KnowledgeMap';

export interface MermaidChartProps {
  readonly chart: string;
  readonly className?: string;
  readonly title?: string;
}

const isTestOrSsr = typeof window === 'undefined' || import.meta.env.MODE === 'test';

export function MermaidChart({ chart, className, title = 'Bản đồ tri thức' }: MermaidChartProps) {
  const isChapter0 =
    chart.includes('Tập hợp gốc X') ||
    chart.includes('Công cụ số học trên Z') ||
    chart.includes('Tiêu chuẩn xác định tốt');

  const isChapter7 =
    chart.includes('IdeanCacLoai') ||
    chart.includes('Khái niệm và Phép toán Iđêan') ||
    chart.includes('Iđêan trái: rI ⊆ I');

  const isNativeMap = isChapter0 || isChapter7;

  const [svgHtml, setSvgHtml] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(!isTestOrSsr && !isNativeMap);
  const rawId = useId();
  const safeId = `mermaid-${rawId.replace(/[^a-zA-Z0-9_-]/g, '')}`;

  useEffect(() => {
    let isMounted = true;

    // Trong môi trường kiểm thử jsdom (Vitest), SSR hoặc sơ đồ Native Map, bỏ qua render SVG DOM
    if (isTestOrSsr || isNativeMap) {
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
  }, [chart, isNativeMap, safeId]);

  if (isChapter0) {
    return <Chapter0KnowledgeMap className={className} title={title} />;
  }

  if (isChapter7) {
    return <Chapter7KnowledgeMap className={className} title={title} />;
  }

  return (
    <div
      data-testid="mermaid-chart"
      className={cn(
        'my-8 overflow-hidden rounded-2xl border border-stone-200/90 bg-[#faf8f2]/80 shadow-sm transition-all duration-200',
        className,
      )}
    >
      {/* Khung tiêu đề học thuật duy nhất: "Bản đồ tri thức" */}
      <div className="flex items-center gap-2 border-b border-stone-200/80 bg-white/70 px-5 py-3">
        <span className="flex h-6 w-6 items-center justify-center rounded-md bg-amber-800/10 text-xs text-amber-900">
          📊
        </span>
        <span className="font-serif text-[15px] font-semibold text-stone-900">{title}</span>
      </div>

      {/* Nội dung đồ họa vector trực quan */}
      <div className="p-6">
        {isLoading && (
          <div className="flex items-center justify-center py-12 text-sm text-stone-500">
            <span className="animate-pulse">Đang kết xuất đồ họa vector...</span>
          </div>
        )}

        {!isLoading && error && (
          <div className="rounded-xl border border-stone-200 bg-white/80 p-6 text-center text-xs text-stone-600">
            <p className="font-medium">
              Sơ đồ đang được tối ưu hóa hiển thị. Vui lòng tải lại trang.
            </p>
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
            [Bản đồ tri thức trực quan — Đại số trừu tượng]
          </div>
        )}
      </div>
    </div>
  );
}
