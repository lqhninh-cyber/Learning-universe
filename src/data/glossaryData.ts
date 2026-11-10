export type GlossarySubject = 'GDH' | 'GTHMB' | 'HHAVE' | 'CHUNG';

export interface GlossaryEntry {
  readonly id: string;
  readonly term: string;
  readonly notation: string;
  readonly shortDefinition: string;
  readonly subject: GlossarySubject;
  readonly targetUrl: string;
}

export const GLOSSARY_DATA: readonly GlossaryEntry[] = [
  {
    id: 'supremum',
    term: 'Supremum',
    notation: '$\\sup(E)$',
    shortDefinition:
      'Cận trên nhỏ nhất của một tập hợp số thực bị chặn trên. Khác với phần tử lớn nhất, supremum không nhất thiết phải thuộc vào chính tập hợp đó.',
    subject: 'GTHMB',
    targetUrl: '/glossary#supremum',
  },
  {
    id: 'infimum',
    term: 'Infimum',
    notation: '$\\inf(E)$',
    shortDefinition:
      'Cận dưới lớn nhất của một tập hợp số thực bị chặn dưới. Tương tự như supremum, infimum không nhất thiết phải là phần tử thuộc vào tập hợp đó.',
    subject: 'GTHMB',
    targetUrl: '/glossary#infimum',
  },
  {
    id: 'sieu-phang',
    term: 'Siêu phẳng',
    notation: '$\\dim(\\alpha) = n - 1$',
    shortDefinition:
      'Một phẳng con trong không gian afin $A^n$ có số chiều nhỏ hơn chiều không gian đúng một đơn vị. Siêu phẳng chia không gian thành hai nửa không gian afin phân biệt.',
    subject: 'HHAVE',
    targetUrl: '/glossary#sieu-phang',
  },
  {
    id: 'doc-lap-afin',
    term: 'Độc lập afin',
    notation: '$\\{A_0, A_1, \\dots, A_k\\}$',
    shortDefinition:
      'Hệ điểm trong không gian afin sao cho hệ vectơ gốc nối từ một điểm tới các điểm còn lại là độc lập tuyến tính. Hệ $k+1$ điểm độc lập afin sẽ sinh ra một $k$-phẳng duy nhất.',
    subject: 'HHAVE',
    targetUrl: '/glossary#doc-lap-afin',
  },
  {
    id: 'm-phang',
    term: 'm-phẳng',
    notation: '$\\alpha = P + V_k$',
    shortDefinition:
      'Tập hợp các điểm trong không gian afin tạo với điểm gốc các vectơ thuộc một không gian con vectơ $k$ chiều. Khi $k=1$ ta có đường thẳng afin, $k=2$ là mặt phẳng afin.',
    subject: 'HHAVE',
    targetUrl: '/glossary#m-phang',
  },
  {
    id: 'ban-chat-xa-hoi',
    term: 'Bản chất xã hội',
    notation: 'Social Essence',
    shortDefinition:
      'Bản chất cốt tử khẳng định giáo dục chỉ nảy sinh, tồn tại và phát triển trong đời sống xã hội loài người. Giáo dục phản ánh nhu cầu truyền thụ kinh nghiệm lịch sử - xã hội và biến đổi theo từng hình thái kinh tế - xã hội cụ thể.',
    subject: 'GDH',
    targetUrl: '/mon-hoc/giao-duc-hoc',
  },
  {
    id: 'chuc-nang-kinh-te-san-xuat',
    term: 'Chức năng kinh tế - sản xuất',
    notation: 'Economic Function',
    shortDefinition:
      'Chức năng tái sản xuất sức lao động xã hội và nâng cao năng suất của người học. Giáo dục trực tiếp đào tạo nguồn nhân lực chất lượng cao, biến tri thức thành lực lượng sản xuất trực tiếp.',
    subject: 'GDH',
    targetUrl: '/mon-hoc/giao-duc-hoc',
  },
  {
    id: 'chuan-nghe-nghiep-gvpt',
    term: 'Chuẩn nghề nghiệp giáo viên',
    notation: 'TT 20/2018/TT-BGDĐT',
    shortDefinition:
      'Hệ thống các yêu cầu về phẩm chất và năng lực nghề nghiệp mà giáo viên cơ sở giáo dục phổ thông cần đạt được theo Thông tư số 20/2018/TT-BGDĐT.',
    subject: 'GDH',
    targetUrl: '/mon-hoc/giao-duc-hoc',
  },
  {
    id: 'xung-dot-su-pham',
    term: 'Xung đột sư phạm',
    notation: 'Pedagogical Conflict',
    shortDefinition:
      'Mâu thuẫn nảy sinh giữa thầy và trò hoặc giữa các học sinh trong quá trình giáo dục, đòi hỏi giáo viên phải nhận diện và giải quyết thấu đáo theo 5 bước.',
    subject: 'GDH',
    targetUrl: '/mon-hoc/giao-duc-hoc',
  },
];

export const GLOSSARY_MAP: Readonly<Record<string, GlossaryEntry>> = Object.freeze(
  GLOSSARY_DATA.reduce<Record<string, GlossaryEntry>>((acc, item) => {
    acc[item.id] = item;
    return acc;
  }, {}),
);

export function getGlossaryEntry(id: string): GlossaryEntry | undefined {
  return GLOSSARY_MAP[id];
}

export default GLOSSARY_DATA;
