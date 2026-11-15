import type { FC, RefObject } from 'react';
import { BrandLogo } from '@/components/common/BrandLogo';

export interface EightPetalBrandMarkProps {
  readonly roseRef: RefObject<SVGSVGElement | null>;
  readonly isDark?: boolean;
  readonly isSepia?: boolean;
}

/**
 * Biểu tượng Thương hiệu Sao Khuê & Thiên Cầu Đông Sơn trên thanh Island Header
 */
export const EightPetalBrandMark: FC<EightPetalBrandMarkProps> = ({
  roseRef,
  isDark = false,
  isSepia = false,
}) => {
  return <BrandLogo variant="full" size="md" isDark={isDark} isSepia={isSepia} svgRef={roseRef} />;
};
