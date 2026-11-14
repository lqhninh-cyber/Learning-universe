import { Compass, Moon, Sun, Sunrise, Sunset } from 'lucide-react';
import {
  ATMOSPHERIC_PHASE_OPTIONS,
  type AtmosphericPhase,
} from '@/components/home/atmosphereThemes';
import { cn } from '@/shared/lib/cn';

export interface AtmosphericTimeDialProps {
  readonly activePhase: AtmosphericPhase;
  readonly onChangePhase: (phase: AtmosphericPhase) => void;
  readonly className?: string;
}

function PhaseIcon({ id, active }: { readonly id: AtmosphericPhase; readonly active: boolean }) {
  const iconClass = cn('h-3.5 w-3.5 shrink-0', active ? 'text-[#0B192C]' : 'text-[#F6D383]');
  switch (id) {
    case 'dem-ngan-ha':
      return <Moon className={iconClass} aria-hidden="true" />;
    case 'binh-minh':
      return <Sunrise className={iconClass} aria-hidden="true" />;
    case 'nang-ngoc':
      return <Sun className={iconClass} aria-hidden="true" />;
    case 'hoang-hon':
      return <Sunset className={iconClass} aria-hidden="true" />;
  }
}

/**
 * La Bàn 4 Thời Khắc Khí Quyển (Đêm Ngân Hà · Bình Minh · Nắng Ngọc · Hoàng Hôn):
 * Thanh chuyển đổi nhỏ gọn đặt tại góc dưới bên trái vùng cảnh quan Hero mà không đè lên chữ.
 */
export function AtmosphericTimeDial({
  activePhase,
  onChangePhase,
  className,
}: AtmosphericTimeDialProps) {
  return (
    <div
      data-testid="atmospheric-time-dial"
      className={cn(
        'inline-flex flex-wrap items-center gap-1.5 rounded-2xl border border-white/18 bg-[#091522]/72 p-1.5 shadow-[0_12px_30px_rgba(4,9,18,0.45)] backdrop-blur-md',
        className,
      )}
    >
      <span className="hidden items-center gap-1.5 pr-1 pl-2 font-mono text-[10px] tracking-widest text-[#F6D383]/85 uppercase sm:inline-flex">
        <Compass className="h-3.5 w-3.5 text-[#E8A85A]" aria-hidden="true" />
        <span>Thời khắc</span>
      </span>

      <div
        role="group"
        aria-label="Chuyển đổi 4 thời khắc khí quyển"
        className="flex flex-wrap gap-1"
      >
        {ATMOSPHERIC_PHASE_OPTIONS.map((opt) => {
          const isActive = opt.id === activePhase;
          return (
            <button
              key={opt.id}
              type="button"
              data-testid={`time-phase-${opt.id}`}
              aria-pressed={isActive}
              title={opt.description}
              onClick={() => onChangePhase(opt.id)}
              className={cn(
                'inline-flex cursor-pointer items-center gap-1.5 rounded-xl px-2.5 py-1.5 text-xs font-medium transition-all duration-300',
                isActive
                  ? 'bg-gradient-to-r from-[#F6D383] to-[#E8A85A] text-[#0B192C] shadow-sm'
                  : 'text-[#F8F6F0]/80 hover:bg-white/10 hover:text-[#FFF9F0]',
              )}
            >
              <PhaseIcon id={opt.id} active={isActive} />
              <span>{opt.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
