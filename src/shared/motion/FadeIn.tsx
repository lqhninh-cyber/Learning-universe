import * as m from 'motion/react-m';
import type { ReactNode } from 'react';
import { useReducedMotion } from '@/shared/hooks/useReducedMotion';
import { EASE_OUT_EXPO } from '@/shared/motion/variants';

export interface FadeInProps {
  readonly children: ReactNode;
  readonly className?: string;
  readonly delay?: number;
  readonly yOffset?: number;
}

export function FadeIn({ children, className, delay = 0, yOffset = 8 }: FadeInProps) {
  const prefersReducedMotion = useReducedMotion();
  // Chuyển đổi an toàn nếu giá trị truyền vào lỡ ở đơn vị mili-giây (> 5)
  const delaySec = delay > 5 ? delay / 1000 : delay;

  if (prefersReducedMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <m.div
      className={className}
      initial={{ opacity: 0, y: yOffset }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28, delay: delaySec, ease: EASE_OUT_EXPO }}
    >
      {children}
    </m.div>
  );
}
