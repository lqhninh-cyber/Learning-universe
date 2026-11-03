import type { MDXComponents } from 'mdx/types';
import type { ComponentPropsWithoutRef } from 'react';
import { Note, Remark, Warning } from './components/CalloutBlock';
import { Cite } from './components/Cite';
import { Counterexample, Example } from './components/ExampleBlock';
import { Exercise, Hint, Solution } from './components/ExerciseBlock';
import { Figure } from './components/Figure';
import { KeyTakeaways } from './components/KeyTakeaways';
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
  KeyTakeaways,

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

  // 8. Tinh chỉnh các thẻ HTML chuẩn trong bài học
  table: (props: ComponentPropsWithoutRef<'table'>) => (
    <div className="my-4 overflow-x-auto">
      <table className="w-full border-collapse text-sm text-stone-800" {...props} />
    </div>
  ),
  th: (props: ComponentPropsWithoutRef<'th'>) => (
    <th
      className="border border-stone-200 bg-stone-100/80 px-3 py-2 font-semibold text-stone-900"
      {...props}
    />
  ),
  td: (props: ComponentPropsWithoutRef<'td'>) => (
    <td className="border border-stone-200 px-3 py-2" {...props} />
  ),
  blockquote: (props: ComponentPropsWithoutRef<'blockquote'>) => (
    <blockquote
      className="my-4 border-l-3 border-stone-300 pl-4 text-stone-600 italic"
      {...props}
    />
  ),
  hr: (props: ComponentPropsWithoutRef<'hr'>) => (
    <hr className="my-8 border-stone-200" {...props} />
  ),
};
