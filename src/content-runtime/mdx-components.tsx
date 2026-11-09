import type { MDXComponents } from 'mdx/types';
import { type ComponentPropsWithoutRef, isValidElement } from 'react';
import { AcademicPopover } from '@/shared/components/AcademicPopover';
import { Sidenote } from '@/shared/components/Sidenote';
import { Note, Remark, Warning } from './components/CalloutBlock';
import { Cite } from './components/Cite';
import { Counterexample, Example } from './components/ExampleBlock';
import { Exercise, Hint, Solution } from './components/ExerciseBlock';
import { Figure } from './components/Figure';
import { KeyTakeaways } from './components/KeyTakeaways';
import { Chapter0KnowledgeMap } from './components/Chapter0KnowledgeMap';
import { Chapter1KnowledgeMap } from './components/Chapter1KnowledgeMap';
import { Chapter3KnowledgeMap } from './components/Chapter3KnowledgeMap';
import { Chapter5KnowledgeMap } from './components/Chapter5KnowledgeMap';
import { Chapter6KnowledgeMap } from './components/Chapter6KnowledgeMap';
import { Chapter7KnowledgeMap } from './components/Chapter7KnowledgeMap';
import { CayleyTable } from './components/CayleyTable';
import { MermaidChart } from './components/MermaidChart';
import { Proof } from './components/Proof';
import { Ref } from './components/Ref';
import { Corollary, Definition, Lemma, Proposition, Theorem } from './components/TheoryBlock';
import {
  LazyAffineFrame,
  LazyAffineLine,
  LazyAffineMapDemo,
  LazyAffinePlane,
  LazyBarycenter,
  LazyDraggablePoint,
  LazyParallelogram,
  LazyRiemannDarbouxSumDemo,
  LazySequenceEpsilonDemo,
  LazySupremumEpsilonDemo,
  LazyTaylorPolynomialDemo,
  LazyUniformContinuityDemo,
  LazyVectorArrow,
  LazyWeierstrassMTestDemo,
} from './figure-kit/LazyFigureKit';

/**
 * Bảng ánh xạ thẻ MDX và 18 Academic Components dùng chung cho mọi bài học.
 */
export const mdxComponents: MDXComponents = {
  // 1. Khối lý thuyết (Bộ đếm `theory`: Chương.Bài.Số)
  Definition,
  Theorem,
  Lemma,
  Proposition,
  Corollary,

  // 2. Khối chứng minh thu gọn
  Proof,

  // 3. Khối ví dụ & phản ví dụ (Bộ đếm `example` độc lập: Chương.Bài.Số)
  Example,
  Counterexample,

  // 4. Khối nhận xét, ghi chú, cảnh báo (Không đánh số)
  Remark,
  Note,
  Warning,

  // 5. Khối bài tập, gợi ý, lời giải (Bộ đếm `exercise` độc lập: Chương.Bài.Số)
  Exercise,
  Hint,
  Solution,

  // 6. Trích dẫn, tham chiếu chéo, hình biểu diễn & tóm tắt cuối bài
  Cite,
  Ref,
  Figure,
  Sidenote,
  AcademicPopover,
  AcademicTerm: AcademicPopover,
  KeyTakeaways,
  Chapter0KnowledgeMap,
  Chapter1KnowledgeMap,
  Chapter3KnowledgeMap,
  Chapter5KnowledgeMap,
  Chapter6KnowledgeMap,
  Chapter7KnowledgeMap,
  CayleyTable,
  MermaidChart,
  Mermaid: MermaidChart,

  // 7. Figure Kit 2D tương tác cho Hình học Affine (nạp lười qua React.lazy)
  AffinePlane: LazyAffinePlane,
  DraggablePoint: LazyDraggablePoint,
  VectorArrow: LazyVectorArrow,
  AffineLine: LazyAffineLine,
  AffineFrame: LazyAffineFrame,
  Parallelogram: LazyParallelogram,
  Barycenter: LazyBarycenter,
  AffineMapDemo: LazyAffineMapDemo,
  SupremumEpsilonDemo: LazySupremumEpsilonDemo,
  SequenceEpsilonDemo: LazySequenceEpsilonDemo,
  UniformContinuityDemo: LazyUniformContinuityDemo,
  TaylorPolynomialDemo: LazyTaylorPolynomialDemo,
  RiemannDarbouxSumDemo: LazyRiemannDarbouxSumDemo,
  WeierstrassMTestDemo: LazyWeierstrassMTestDemo,

  // 8. Tinh chỉnh các thẻ HTML chuẩn trong bài học (chuẩn hóa bảng công thức và bảng học thuật)
  table: (props: ComponentPropsWithoutRef<'table'>) => (
    <div className="my-6 overflow-hidden overflow-x-auto rounded-2xl border border-stone-200/90 bg-white/70 p-0 shadow-sm dark:border dark:border-[#1D3629] dark:bg-[#0B1712]">
      <table
        className="w-full border-collapse text-left text-sm text-stone-800 dark:text-[#E8F1EC]"
        {...props}
      />
    </div>
  ),
  thead: (props: ComponentPropsWithoutRef<'thead'>) => (
    <thead
      className="border-b border-stone-200/80 bg-stone-100/80 font-serif text-xs tracking-wider text-stone-900 uppercase dark:border-b dark:border-[#1F3D2E] dark:bg-[#12241C] dark:text-[#C5A262]"
      {...props}
    />
  ),
  tbody: (props: ComponentPropsWithoutRef<'tbody'>) => (
    <tbody className="divide-y divide-stone-200/60 dark:divide-[#152B20]" {...props} />
  ),
  tr: (props: ComponentPropsWithoutRef<'tr'>) => (
    <tr
      className="border-b border-stone-200/60 transition-colors hover:bg-stone-50/50 dark:border-b dark:border-[#152B20] dark:text-[#E8F1EC] hover:dark:bg-[#102219]"
      {...props}
    />
  ),
  th: (props: ComponentPropsWithoutRef<'th'>) => (
    <th
      className="border-b border-stone-200/80 px-4 py-3 text-left font-serif text-xs font-bold tracking-wider text-stone-900 uppercase dark:border-b dark:border-[#1F3D2E] dark:bg-[#12241C] dark:text-[#C5A262]"
      {...props}
    />
  ),
  td: (props: ComponentPropsWithoutRef<'td'>) => (
    <td
      className="border-b border-stone-200/60 px-4 py-3 text-left text-sm leading-relaxed text-stone-800 transition-colors dark:border-b dark:border-[#152B20] dark:text-[#E8F1EC] [&_.katex]:text-stone-900 dark:[&_.katex]:text-[#F5F2EB] [&:first-child]:font-mono [&:first-child]:font-bold dark:[&:first-child]:text-[#739B88]"
      {...props}
    />
  ),
  blockquote: (props: ComponentPropsWithoutRef<'blockquote'>) => (
    <blockquote
      className="my-6 rounded-r-lg border-l-4 border-amber-800/70 bg-[#faf8f2]/50 py-2 pr-4 pl-4 font-serif text-[15.5px] leading-relaxed text-stone-800 italic"
      {...props}
    />
  ),
  hr: (props: ComponentPropsWithoutRef<'hr'>) => (
    <hr className="my-8 border-stone-200" {...props} />
  ),
  pre: (props: ComponentPropsWithoutRef<'pre'>) => {
    const child = props.children;
    if (isValidElement<{ className?: string; children?: unknown }>(child)) {
      const childProps = child.props;
      if (
        typeof childProps.className === 'string' &&
        childProps.className.includes('language-mermaid')
      ) {
        const code =
          typeof childProps.children === 'string'
            ? childProps.children
            : String(childProps.children ?? '');
        const trimmed = code.trim();
        if (
          trimmed.includes('Tập hợp gốc X') ||
          trimmed.includes('Công cụ số học trên Z') ||
          trimmed.includes('Tiêu chuẩn xác định tốt')
        ) {
          return <Chapter0KnowledgeMap />;
        }
        if (
          trimmed.includes('Nửa nhóm (Semigroup)') &&
          trimmed.includes('Vị nhóm (Monoid)') &&
          trimmed.includes('Nhóm (Group)')
        ) {
          return <Chapter1KnowledgeMap />;
        }
        if (
          trimmed.includes('Lớp kề trái gH') &&
          (trimmed.includes('Định lý Lagrange') || trimmed.includes('Phân hoạch: G = ⨆ gᵢH'))
        ) {
          return <Chapter3KnowledgeMap />;
        }
        if (
          trimmed.includes('Định lý Đẳng cấu I') ||
          trimmed.includes('Định lý Đẳng cấu II') ||
          (trimmed.includes('Đồng cấu nhóm') && trimmed.includes('Định lý Đẳng cấu'))
        ) {
          return <Chapter5KnowledgeMap />;
        }
        if (
          trimmed.includes('HỆ THỐNG HAI PHÉP TOÁN') ||
          trimmed.includes('Nhóm cộng Abel (R, +)') ||
          (trimmed.includes('VÀNH TỔNG QUÁT') && trimmed.includes('TRƯỜNG (Field)'))
        ) {
          return <Chapter6KnowledgeMap />;
        }
        if (
          trimmed.includes('IdeanCacLoai') ||
          trimmed.includes('Khái niệm và Phép toán Iđêan') ||
          trimmed.includes('Iđêan trái: rI ⊆ I')
        ) {
          return <Chapter7KnowledgeMap />;
        }
        return <MermaidChart chart={trimmed} />;
      }
    }
    return (
      <pre
        className="my-6 overflow-x-auto rounded-xl border border-stone-800 bg-[#1c1917] p-4 text-[14px] text-stone-100"
        {...props}
      />
    );
  },
};
