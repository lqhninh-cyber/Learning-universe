export type DiagramKind =
  | 'chapter-0-map'
  | 'chapter-1-map'
  | 'chapter-2-cyclic-map'
  | 'chapter-3-map'
  | 'chapter-5-map'
  | 'chapter-6-map'
  | 'chapter-7-map'
  | 'chapter-8-ring-hom-map'
  | 'chapter-9-evolution-map'
  | 'z12-subgroup-lattice'
  | 'z20-subgroup-lattice'
  | 'ring-hierarchy'
  | 'subring-unity-cases'
  | 'poly-quotient-trio'
  | 'comm-tri-ring-quotient'
  | 'comm-tri-ring-char'
  | 'comm-tri-frac-universal'
  | 'prime-subfield-dichotomy'
  | 'generic-flowchart';

export interface DiagramMetadata {
  readonly kind: DiagramKind;
  readonly heading: string;
  readonly badge: string;
}

/**
 * Xác định sơ đồ SVG tĩnh tương ứng từ nguồn khai báo flowchart trong bài giảng MDX.
 * Hoàn toàn thay thế thư viện runtime `mermaid` bằng đồ họa vector nhẹ chuẩn CSS token.
 */
export function resolveDiagramMetadata(chart: string): DiagramMetadata {
  if (
    chart.includes('Tập hợp gốc X') ||
    chart.includes('Công cụ số học trên Z') ||
    chart.includes('Tiêu chuẩn xác định tốt')
  ) {
    return { kind: 'chapter-0-map', heading: 'Bản đồ tri thức', badge: 'Chương 0' };
  }
  if (
    chart.includes('Nửa nhóm (Semigroup)') &&
    chart.includes('Vị nhóm (Monoid)') &&
    chart.includes('Nhóm (Group)')
  ) {
    return { kind: 'chapter-1-map', heading: 'Bản đồ tri thức', badge: 'Chương 1' };
  }
  if (chart.includes('Z/12Z (cấp 12)')) {
    return {
      kind: 'z12-subgroup-lattice',
      heading: 'Mạng nhóm con của ℤ/12ℤ',
      badge: 'Sơ đồ mạng · Nhóm cyclic',
    };
  }
  if (chart.includes('Z/20Z (cấp 20)')) {
    return {
      kind: 'z20-subgroup-lattice',
      heading: 'Mạng nhóm con của ℤ/20ℤ',
      badge: 'Sơ đồ mạng · Nhóm cyclic',
    };
  }
  if (chart.includes('Nhóm con cyclic') && chart.includes('Mạng nhóm con')) {
    return {
      kind: 'chapter-2-cyclic-map',
      heading: 'Bản đồ tri thức · Nhóm con & Nhóm Cyclic',
      badge: 'Chương 2',
    };
  }
  if (
    chart.includes('Lớp kề trái gH') &&
    (chart.includes('Định lý Lagrange') || chart.includes('Phân hoạch: G = ⨆ gᵢH'))
  ) {
    return { kind: 'chapter-3-map', heading: 'Bản đồ tri thức', badge: 'Chương 3' };
  }
  if (
    chart.includes('Định lý Đẳng cấu I') &&
    (chart.includes('Đồng cấu nhóm') || chart.includes('Định lý Cayley'))
  ) {
    return { kind: 'chapter-5-map', heading: 'Bản đồ tri thức', badge: 'Chương 5' };
  }
  if (chart.includes('HỆ THỐNG HAI PHÉP TOÁN') || chart.includes('Nhóm cộng Abel (R, +)')) {
    return { kind: 'chapter-6-map', heading: 'Bản đồ tri thức', badge: 'Chương 6' };
  }
  if (chart.includes('VÀNH TỔNG QUÁT (Ring)') && chart.includes('Vành giao hoán có 1')) {
    return {
      kind: 'ring-hierarchy',
      heading: 'Thang bậc cấu trúc Vành → Trường',
      badge: 'Chương 6 · Phân loại',
    };
  }
  if (chart.includes('Mẹ có 1, Con KHÔNG có 1')) {
    return {
      kind: 'subring-unity-cases',
      heading: 'Ba tình huống đơn vị của Vành con',
      badge: 'Chương 6 · Vành con',
    };
  }
  if (
    chart.includes('IdeanCacLoai') ||
    chart.includes('Khái niệm và Phép toán Iđêan') ||
    chart.includes('Iđêan trái: rI ⊆ I')
  ) {
    return { kind: 'chapter-7-map', heading: 'Bản đồ tri thức', badge: 'Chương 7' };
  }
  if (chart.includes('Đa thức bậc hai f(x) trên ℝ')) {
    return {
      kind: 'poly-quotient-trio',
      heading: 'Bộ ba vành thương đa thức kinh điển trên ℝ',
      badge: 'Chương 7 · Vành thương',
    };
  }
  if (chart.includes('DongCauSec') || chart.includes('Ba Định lý Đẳng cấu Vành')) {
    return {
      kind: 'chapter-8-ring-hom-map',
      heading: 'Bản đồ tri thức · Đồng cấu & Đẳng cấu Vành',
      badge: 'Chương 8',
    };
  }
  if (chart.includes('π_I') && chart.includes('R / I')) {
    return {
      kind: 'comm-tri-ring-quotient',
      heading: 'Tam giác giao hoán · Phân tích qua thương',
      badge: 'Chương 8 · Tính phổ dụng',
    };
  }
  if (chart.includes('η_R') && chart.includes('(char R)ℤ')) {
    return {
      kind: 'comm-tri-ring-char',
      heading: 'Tam giác giao hoán · Đồng cấu đặc số η_R',
      badge: 'Chương 8 · Đặc số vành',
    };
  }
  if (chart.includes('Trường bất kỳ F') && chart.includes('Đặc số char(F)')) {
    return {
      kind: 'prime-subfield-dichotomy',
      heading: 'Phân loại Trường con nguyên tố theo char(F)',
      badge: 'Chương 9 · Đặc số trường',
    };
  }
  if (chart.includes('Frac(R)') && chart.includes('ι_R')) {
    return {
      kind: 'comm-tri-frac-universal',
      heading: 'Tính chất phổ dụng của Trường các thương Frac(R)',
      badge: 'Chương 9 · Tính phổ dụng',
    };
  }
  if (chart.includes('TienHoaSec') || chart.includes('Tiến hóa Cấu trúc Đại số')) {
    return {
      kind: 'chapter-9-evolution-map',
      heading: 'Bản đồ tổng kết học phần · Tiến hóa Cấu trúc Đại số',
      badge: 'Chương 0 – 9',
    };
  }

  return {
    kind: 'generic-flowchart',
    heading: 'Bản đồ tri thức',
    badge: 'Sơ đồ vector',
  };
}
