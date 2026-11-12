import { Barycenter } from '@/content-runtime/figure-kit';

/**
 * Hình tương tác 3: Minh họa biểu thức vectơ của trung điểm & tâm tỉ cự 2 điểm (OI = 1/2 (OA + OB)).
 */
export function MidpointBarycenterFigure() {
  return (
    <Barycenter
      title="Mô hình tương tác: Trung điểm & Tâm tỉ cự hai điểm (OI = 1/2 (OA + OB))"
      pointCount={2}
      showOriginVectors
      height={340}
    />
  );
}

export default MidpointBarycenterFigure;
