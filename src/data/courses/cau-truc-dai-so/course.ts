export interface CourseDocument {
  readonly id: string;
  readonly title: string;
  readonly categoryLabel?: string;
  readonly description?: string;
  readonly badge?: string;
  readonly url: string;
  readonly filename?: string;
  readonly size?: string;
}

export const ALGEBRAIC_STRUCTURES_DOCUMENTS: readonly CourseDocument[] = [
  {
    id: 'gt-cau-truc-dai-so',
    title: 'Giáo trình Cấu trúc Đại số: Nhóm • Vành • Trường',
    categoryLabel: 'Giáo trình chuẩn',
    badge: 'Chính thức',
    url: 'https://drive.google.com/file/d/17drWozpQN-4jt4si1hhCHoXslUFkYtKm/view?usp=drive_link',
    filename: 'Giao_trinh_Cau_truc_dai_so.pdf',
    description:
      'Giáo trình Cấu trúc Đại số: Nhóm • Vành • Trường (Đồng cấu, cấu trúc thương và các định lý đẳng cấu) — TS. Huỳnh Việt Khánh.',
  },
];
