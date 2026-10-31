import { Parallelogram } from '@/content-runtime/figure-kit';

/**
 * Hình tương tác 2: Minh họa Quy tắc hình bình hành (AB = DC ⇔ AD = BC).
 */
export function ParallelogramRuleFigure() {
  return (
    <Parallelogram
      title="Mô hình tương tác: Quy tắc Hình bình hành (AB = DC ⇔ AD = BC)"
      mode="parallelogram"
      height={330}
    />
  );
}

export default ParallelogramRuleFigure;
