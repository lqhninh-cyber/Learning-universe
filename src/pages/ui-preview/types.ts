export type VisualDirection = 'atelier' | 'spatial' | 'editorial';

export type PreviewView = 'homepage' | 'course';

export type PreviewCourseSlug = 'giai-tich-ham-mot-bien' | 'giao-duc-hoc';

export interface VisualDirectionMeta {
  readonly id: VisualDirection;
  readonly name: string;
  readonly subtitle: string;
  readonly description: string;
  readonly badge: string;
  readonly aestheticTokens: {
    readonly cardBorder: string;
    readonly cardBg: string;
    readonly cardHover: string;
    readonly shadowClass: string;
    readonly accentColor: string;
    readonly fontHero: string;
    readonly containerClass: string;
  };
}

export const VISUAL_DIRECTIONS: Record<VisualDirection, VisualDirectionMeta> = {
  atelier: {
    id: 'atelier',
    name: 'Architectural Atelier',
    subtitle: 'Dynamic Bento Grid & Lưới kiến trúc học thuật',
    description:
      'Lấy cảm hứng từ xưởng vẽ kiến trúc duy lý. Đường nét hairline 1px sắc gọn, tỉ lệ mô đun vàng, mặt bằng bento đa ô ngăn nắp và tính chuẩn xác toán học cao độ.',
    badge: 'Direction 1',
    aestheticTokens: {
      cardBorder: 'border-stone-300/90',
      cardBg: 'bg-white/95',
      cardHover: 'hover:border-stone-500 hover:shadow-md hover:-translate-y-1',
      shadowClass: 'shadow-2xs',
      accentColor: '#3C2C1C',
      fontHero: 'font-sans font-bold',
      containerClass: 'border border-stone-200/90 bg-[#faf8f2]/60',
    },
  },
  spatial: {
    id: 'spatial',
    name: 'Spatial Glass & 2.5D Depth',
    subtitle: 'Giao diện đa lớp kính mờ & Thẻ nổi 2.5D',
    description:
      'Không gian số đa chiều hiện đại. Kính mờ siêu mịn (backdrop-blur-xl), viền phản quang ring-1 ring-white/70, thẻ nổi nâng độ cao 2.5D khi hover và chiều sâu ánh sáng tán xạ.',
    badge: 'Direction 2',
    aestheticTokens: {
      cardBorder: 'border-white/60 ring-1 ring-stone-900/5',
      cardBg: 'bg-white/80 backdrop-blur-xl',
      cardHover:
        'hover:border-amber-300/80 hover:ring-2 hover:ring-amber-400/30 hover:shadow-2xl hover:-translate-y-2 hover:scale-[1.01]',
      shadowClass: 'shadow-lg shadow-stone-900/5',
      accentColor: '#1A73E8',
      fontHero: 'font-serif font-bold',
      containerClass:
        'border border-white/60 bg-gradient-to-b from-white/70 via-stone-50/50 to-white/80 backdrop-blur-md shadow-inner',
    },
  },
  editorial: {
    id: 'editorial',
    name: 'Kinetic Editorial Folio',
    subtitle: 'Bố cục tạp chí bất đối xứng & Typography phân cấp mạnh',
    description:
      'Tôn vinh nghệ thuật biên tập sách chuyên khảo cao cấp. Typography Crimson Pro cỡ lớn phóng khoáng, số La Mã bản thảo, bố cục bất đối xứng và nhịp điệu đọc trang nhã.',
    badge: 'Direction 3',
    aestheticTokens: {
      cardBorder: 'border-stone-300/70',
      cardBg: 'bg-[#fcfbf7]',
      cardHover:
        'hover:border-amber-800/60 hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300',
      shadowClass: 'shadow-xs',
      accentColor: '#8B302D',
      fontHero: 'font-serif font-bold italic',
      containerClass: 'border-y border-stone-300/60 bg-[#f9f6ef]/70',
    },
  },
};
