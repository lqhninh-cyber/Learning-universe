import { Award, CheckCircle2, ChevronDown, Search, Sparkles } from 'lucide-react';
import { useMemo, useState } from 'react';
import { cn } from '@/shared/lib/cn';
import { Badge } from '@/shared/ui';

export interface CriterionLevel {
  readonly level: 'dat' | 'kha' | 'tot';
  readonly label: string;
  readonly description: string;
}

export interface TeacherCriterion {
  readonly id: number;
  readonly number: number;
  readonly name: string;
  readonly description: string;
  readonly levels: {
    readonly dat: string;
    readonly kha: string;
    readonly tot: string;
  };
}

export interface TeacherStandard {
  readonly id: number;
  readonly title: string;
  readonly description: string;
  readonly criteria: readonly TeacherCriterion[];
}

// eslint-disable-next-line react-refresh/only-export-components
export const TEACHER_STANDARDS_TT20: readonly TeacherStandard[] = [
  {
    id: 1,
    title: 'Tiêu chuẩn 1: Phẩm chất nhà giáo',
    description:
      'Tuân thủ các quy định và rèn luyện đạo đức nhà giáo; chia sẻ kinh nghiệm, hỗ trợ đồng nghiệp trong rèn luyện đạo đức và tạo dựng phong cách nhà giáo.',
    criteria: [
      {
        id: 1,
        number: 1,
        name: 'Đạo đức nhà giáo',
        description:
          'Thực hiện nghiêm túc các quy định về đạo đức nhà giáo, có lối sống lành mạnh, trung thực, trách nhiệm.',
        levels: {
          dat: 'Thực hiện nghiêm túc các quy định về đạo đức nhà giáo; không vi phạm quy định về dạy thêm, học thêm sai quy định và các hành vi bị cấm.',
          kha: 'Có tinh thần tự học, tự rèn luyện và phấn đấu nâng cao phẩm chất đạo đức nhà giáo; được đồng nghiệp và học sinh tin tưởng, quý mến.',
          tot: 'Là tấm gương mẫu mực về đạo đức nhà giáo; chia sẻ kinh nghiệm, hỗ trợ đồng nghiệp trong việc rèn luyện và giữ gìn phẩm chất đạo đức người thầy.',
        },
      },
      {
        id: 2,
        number: 2,
        name: 'Phong cách nhà giáo',
        description: 'Tác phong sư phạm mẫu mực, chuẩn mực trong giao tiếp, ứng xử và trang phục.',
        levels: {
          dat: 'Có tác phong sư phạm chuẩn mực, trang phục gọn gàng, lịch sự; ngôn ngữ giao tiếp đúng mực với học sinh, phụ huynh và đồng nghiệp.',
          kha: 'Có phong cách làm việc khoa học, gần gũi, công bằng và tôn trọng nhân cách học sinh; tạo được bầu không khí học tập tích cực.',
          tot: 'Là tấm gương sáng về phong cách nhà giáo; có ảnh hưởng tích cực và lan tỏa phong cách sư phạm mẫu mực trong tập thể sư phạm nhà trường.',
        },
      },
    ],
  },
  {
    id: 2,
    title: 'Tiêu chuẩn 2: Phát triển chuyên môn, nghiệp vụ',
    description:
      'Nắm vững chuyên môn môn học và nghiệp vụ sư phạm; thường xuyên cập nhật, nâng cao năng lực chuyên môn và nghiệp vụ đáp ứng yêu cầu đổi mới GDPT.',
    criteria: [
      {
        id: 3,
        number: 3,
        name: 'Phát triển chuyên môn bản thân',
        description:
          'Lập kế hoạch và thực hiện học tập, bồi dưỡng nâng cao năng lực chuyên môn Toán học/bộ môn.',
        levels: {
          dat: 'Đạt chuẩn trình độ đào tạo theo quy định; tham gia đầy đủ các lớp tập huấn, bồi dưỡng chuyên môn nghiệp vụ thường xuyên do cấp trên tổ chức.',
          kha: 'Chủ động xây dựng và thực hiện kế hoạch tự học, tự bồi dưỡng nâng cao năng lực chuyên môn; thường xuyên cập nhật kiến thức bộ môn mới.',
          tot: 'Hướng dẫn, hỗ trợ đồng nghiệp phát triển chuyên môn; có sáng kiến kinh nghiệm hoặc đề tài nghiên cứu khoa học sư phạm ứng dụng hiệu quả.',
        },
      },
      {
        id: 4,
        number: 4,
        name: 'Xây dựng kế hoạch dạy học và giáo dục',
        description:
          'Thiết kế kế hoạch giáo dục môn học và kế hoạch bài dạy (giáo án) phù hợp với định hướng phát triển phẩm chất, năng lực.',
        levels: {
          dat: 'Xây dựng được kế hoạch dạy học và giáo dục môn học theo chương trình; thiết kế bài dạy đáp ứng yêu cầu cơ bản của môn học.',
          kha: 'Chủ động điều chỉnh kế hoạch bài dạy linh hoạt, phù hợp với đặc điểm đối tượng học sinh và điều kiện thực tế của lớp học, nhà trường.',
          tot: 'Kế hoạch dạy học được đồng nghiệp đánh giá cao, chọn làm bài học minh họa cho sinh hoạt tổ chuyên môn hoặc cấp cụm trường.',
        },
      },
      {
        id: 5,
        number: 5,
        name: 'Sử dụng phương pháp dạy học và giáo dục',
        description:
          'Vận dụng linh hoạt các phương pháp, kỹ thuật dạy học tích cực nhằm phát huy tính chủ động của học sinh.',
        levels: {
          dat: 'Áp dụng được các phương pháp dạy học phát triển phẩm chất, năng lực học sinh theo hướng dẫn chuyên môn của tổ bộ môn.',
          kha: 'Vận dụng linh hoạt, kết hợp đa dạng các phương pháp và kỹ thuật dạy học tích cực; tổ chức cho học sinh tự học, làm việc nhóm hiệu quả.',
          tot: 'Sáng tạo trong phương pháp dạy học; hỗ trợ đồng nghiệp áp dụng các phương pháp giáo dục tiên tiến (STEM, dạy học theo dự án).',
        },
      },
      {
        id: 6,
        number: 6,
        name: 'Kiểm tra, đánh giá kết quả học tập và rèn luyện',
        description:
          'Sử dụng các hình thức, phương pháp kiểm tra đánh giá theo hướng phát triển năng lực, vì sự tiến bộ của người học.',
        levels: {
          dat: 'Sử dụng đúng các hình thức kiểm tra đánh giá theo quy định; đánh giá công bằng, khách quan kết quả học tập của học sinh.',
          kha: 'Vận dụng các phương pháp đánh giá quá trình (đánh giá thường xuyên) phong phú; cung cấp phản hồi tích cực giúp học sinh tự sửa sai.',
          tot: 'Thiết kế ma trận, bảng đặc tả và ngân hàng câu hỏi phân hóa cao; chia sẻ công cụ đánh giá năng lực người học cho đồng nghiệp.',
        },
      },
      {
        id: 7,
        number: 7,
        name: 'Tư vấn và hỗ trợ học sinh',
        description:
          'Nắm bắt tâm lý, hỗ trợ học sinh gặp khó khăn trong học tập và rèn luyện nhân cách.',
        levels: {
          dat: 'Nắm được hoàn cảnh gia đình và đặc điểm tâm sinh lý cơ bản của học sinh; hỗ trợ học sinh yếu kém khi có yêu cầu.',
          kha: 'Chủ động phát hiện và tư vấn tâm lý, hướng nghiệp cho học sinh; phối hợp hiệu quả với gia đình để tháo gỡ vướng mắc cho các em.',
          tot: 'Có kinh nghiệm xử lý các ca tư vấn tâm lý phức tạp (học sinh khủng hoảng tuổi dậy thì, áp lực thi cử); hướng dẫn đồng nghiệp kỹ năng tham vấn.',
        },
      },
    ],
  },
  {
    id: 3,
    title: 'Tiêu chuẩn 3: Xây dựng môi trường giáo dục',
    description:
      'Xây dựng văn hóa nhà trường lành mạnh, thực hiện quy chế dân chủ, kiến tạo môi trường học đường an toàn, không bạo lực.',
    criteria: [
      {
        id: 8,
        number: 8,
        name: 'Xây dựng văn hóa nhà trường',
        description:
          'Tạo dựng môi trường giao tiếp văn hóa, tôn trọng, yêu thương và hợp tác giữa thầy - trò, trò - trò.',
        levels: {
          dat: 'Chấp hành nghiêm túc quy tắc ứng xử văn hóa trong nhà trường; xây dựng mối quan hệ chuẩn mực, tôn trọng học sinh.',
          kha: 'Chủ động đề xuất các giải pháp kiến tạo không gian văn hóa học đường thân thiện; được tập thể lớp và đồng nghiệp quý trọng.',
          tot: 'Là nhân tố tích cực lan tỏa nét đẹp văn hóa nhà trường; giải quyết hài hòa, chuẩn mực các xung đột trong quan hệ học đường.',
        },
      },
      {
        id: 9,
        number: 9,
        name: 'Thực hiện quyền dân chủ trong nhà trường',
        description:
          'Phát huy tiếng nói của học sinh, đồng nghiệp và cha mẹ học sinh trong các hoạt động giáo dục.',
        levels: {
          dat: 'Tôn trọng ý kiến đóng góp của học sinh và đồng nghiệp trong các cuộc họp lớp và sinh hoạt chuyên môn.',
          kha: 'Khuyến khích học sinh chủ động bày tỏ quan điểm cá nhân, tham gia xây dựng nội quy và kế hoạch hoạt động của lớp.',
          tot: 'Bảo vệ quyền lợi chính đáng và tiếng nói dân chủ của học sinh và phụ huynh; thúc đẩy văn hóa phản biện mang tính xây dựng.',
        },
      },
      {
        id: 10,
        number: 10,
        name: 'Xây dựng trường học an toàn, phòng chống bạo lực học đường',
        description:
          'Đảm bảo an toàn thể chất và tinh thần cho học sinh, chủ động phòng ngừa và ngăn chặn bạo lực học đường.',
        levels: {
          dat: 'Thực hiện nghiêm túc các quy định về an toàn trường học; không xâm phạm thân thể, danh dự của học sinh.',
          kha: 'Chủ động phát hiện sớm các dấu hiệu bắt nạt, cô lập, bạo lực mạng và can thiệp kịp thời bảo vệ an toàn cho học sinh.',
          tot: 'Xây dựng chuyên đề giáo dục kỹ năng phòng chống bạo lực học đường hiệu quả; hỗ trợ nhà trường hoàn thiện quy trình bảo vệ trẻ em.',
        },
      },
    ],
  },
  {
    id: 4,
    title: 'Tiêu chuẩn 4: Phát triển mối quan hệ giữa nhà trường, gia đình và xã hội',
    description:
      'Hợp tác chặt chẽ với cha mẹ học sinh và các tổ chức xã hội nhằm nâng cao hiệu quả giáo dục toàn diện.',
    criteria: [
      {
        id: 11,
        number: 11,
        name: 'Tạo dựng mối quan hệ hợp tác với cha mẹ học sinh',
        description:
          'Thiết lập kênh liên lạc thường xuyên, tôn trọng và tin cậy với gia đình học sinh.',
        levels: {
          dat: 'Thông báo đầy đủ, kịp thời tình hình học tập và rèn luyện của học sinh cho gia đình theo quy định.',
          kha: 'Tổ chức họp phụ huynh sáng tạo, cởi mở, lắng nghe tâm tư và tạo sự đồng thuận cao với phụ huynh trong định hướng giáo dục con em.',
          tot: 'Xây dựng mối quan hệ đối tác giáo dục gắn kết; huy động được sự đồng hành tích cực của phụ huynh vào các hoạt động trải nghiệm của lớp.',
        },
      },
      {
        id: 12,
        number: 12,
        name: 'Phối hợp giữa nhà trường, gia đình và xã hội',
        description:
          'Kết nối các nguồn lực xã hội, đoàn thể tại địa phương hỗ trợ hoạt động học tập và giáo dục học sinh.',
        levels: {
          dat: 'Tham gia các hoạt động phối hợp giáo dục giữa nhà trường với chính quyền địa phương và các đoàn thể (Đoàn, Đội).',
          kha: 'Chủ động huy động các nguồn lực xã hội hợp pháp để hỗ trợ học sinh có hoàn cảnh khó khăn vươn lên trong học tập.',
          tot: 'Kết nối hiệu quả với các chuyên gia, cựu học sinh, doanh nghiệp để tổ chức hoạt động trải nghiệm hướng nghiệp đa dạng cho học sinh.',
        },
      },
    ],
  },
  {
    id: 5,
    title: 'Tiêu chuẩn 5: Ngoại ngữ, Tin học & Báo cáo chia sẻ kinh nghiệm',
    description:
      'Sử dụng ngoại ngữ hoặc tiếng dân tộc, ứng dụng CNTT và thiết bị công nghệ hiện đại trong giảng dạy; chia sẻ sáng kiến nghề nghiệp.',
    criteria: [
      {
        id: 13,
        number: 13,
        name: 'Sử dụng ngoại ngữ hoặc tiếng dân tộc',
        description:
          'Sử dụng được ngoại ngữ hoặc tiếng dân tộc thiểu số phục vụ dạy học và giao tiếp.',
        levels: {
          dat: 'Có chứng chỉ hoặc sử dụng được ngoại ngữ bậc 2 (A2) hoặc tiếng dân tộc ở mức giao tiếp đơn giản.',
          kha: 'Đọc hiểu tài liệu chuyên môn Toán học/sư phạm bằng ngoại ngữ; giao tiếp tốt với học sinh vùng đồng bào dân tộc thiểu số.',
          tot: 'Ứng dụng ngoại ngữ trong giảng dạy môn học (dạy Toán bằng tiếng Anh); tham gia các diễn đàn học thuật quốc tế.',
        },
      },
      {
        id: 14,
        number: 14,
        name: 'Ứng dụng công nghệ thông tin và thiết bị công nghệ',
        description:
          'Khai thác hiệu quả phần mềm dạy học Toán học (GeoGebra, Desmos) và thiết bị kỹ thuật số.',
        levels: {
          dat: 'Sử dụng thành thạo máy tính, phần mềm trình chiếu (PowerPoint) và các thiết bị nghe nhìn thông thường.',
          kha: 'Ứng dụng thành thạo các phần mềm mô phỏng toán học chuyên biệt (GeoGebra, Mafs), hệ thống quản lý học tập (LMS, Google Classroom).',
          tot: 'Thiết kế học liệu số, bài giảng tương tác sáng tạo; hỗ trợ đồng nghiệp chuyển đổi số trong kiểm tra đánh giá và quản lý lớp học.',
        },
      },
      {
        id: 15,
        number: 15,
        name: 'Báo cáo và chia sẻ kinh nghiệm nghề nghiệp',
        description:
          'Đúc kết kinh nghiệm thực tiễn và chia sẻ với đồng nghiệp qua sinh hoạt chuyên môn.',
        levels: {
          dat: 'Tham gia thảo luận, đóng góp ý kiến trong các buổi sinh hoạt tổ chuyên môn và thao giảng.',
          kha: 'Báo cáo chuyên đề đổi mới phương pháp dạy học hoặc giáo dục đạo đức học sinh ở cấp tổ chuyên môn, nhà trường.',
          tot: 'Có bài báo khoa học hoặc chuyên đề báo cáo cấp huyện/tỉnh; chủ trì các buổi tập huấn chuyên môn liên trường.',
        },
      },
    ],
  },
];

export interface TeacherStandardsMatrixProps {
  readonly defaultStandardId?: number;
  readonly className?: string;
}

/**
 * Bảng ma trận tương tác 5 Tiêu chuẩn - 15 Tiêu chí Chuẩn nghề nghiệp giáo viên (Thông tư 20/2018/TT-BGDĐT).
 * Hỗ trợ chuyển đổi tab giữa các tiêu chuẩn, xem chi tiết 3 mức Đạt - Khá - Tốt và tìm kiếm nhanh.
 */
export function TeacherStandardsMatrix({
  defaultStandardId = 1,
  className,
}: TeacherStandardsMatrixProps) {
  const [selectedStandardId, setSelectedStandardId] = useState<number>(defaultStandardId);
  const [expandedCriteria, setExpandedCriteria] = useState<Record<number, boolean>>({
    1: true,
    2: true,
  });
  const [searchQuery, setSearchQuery] = useState('');

  const activeStandard =
    TEACHER_STANDARDS_TT20.find((s) => s.id === selectedStandardId) || TEACHER_STANDARDS_TT20[0]!;

  const toggleCriterion = (id: number) => {
    setExpandedCriteria((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const filteredCriteria = useMemo(() => {
    if (!searchQuery.trim()) return activeStandard.criteria;
    const q = searchQuery.toLowerCase();
    return activeStandard.criteria.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.description.toLowerCase().includes(q) ||
        c.levels.dat.toLowerCase().includes(q) ||
        c.levels.kha.toLowerCase().includes(q) ||
        c.levels.tot.toLowerCase().includes(q),
    );
  }, [activeStandard, searchQuery]);

  return (
    <div
      className={cn(
        'rounded-2xl border border-stone-200/90 bg-white p-5 shadow-xs transition-all sm:p-6',
        className,
      )}
    >
      {/* Header ma trận */}
      <div className="flex flex-col gap-3 border-b border-stone-100 pb-4 md:flex-row md:items-center md:justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-teal-200 bg-teal-50 px-2.5 py-0.5 text-xs font-bold text-teal-800">
              <Award className="h-3.5 w-3.5 text-teal-800" aria-hidden="true" />
              <span>Thông tư 20/2018/TT-BGDĐT</span>
            </span>
            <Badge variant="neutral" className="text-xs font-medium text-stone-600">
              5 Tiêu chuẩn · 15 Tiêu chí
            </Badge>
          </div>
          <h3 className="text-lg font-bold text-stone-900 sm:text-xl">
            Ma trận Chuẩn nghề nghiệp Giáo viên phổ thông
          </h3>
          <p className="text-xs text-stone-500">
            Khung đánh giá năng lực nghề nghiệp cốt lõi và lộ trình rèn luyện 3 mức (Đạt - Khá -
            Tốt) cho sinh viên sư phạm.
          </p>
        </div>

        {/* Ô tìm kiếm tiêu chí */}
        <div className="relative w-full md:w-64">
          <Search className="absolute top-1/2 left-3 h-3.5 w-3.5 -translate-y-1/2 text-stone-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm theo tiêu chí, từ khóa..."
            className="w-full rounded-xl border border-stone-200 bg-stone-50/70 py-1.5 pr-3 pl-8 text-xs text-stone-800 placeholder:text-stone-400 focus:border-teal-600 focus:bg-white focus:outline-none"
          />
        </div>
      </div>

      {/* Tabs chọn 5 tiêu chuẩn */}
      <div className="mt-4 flex flex-wrap gap-2 border-b border-stone-100 pb-3">
        {TEACHER_STANDARDS_TT20.map((standard) => {
          const isSelected = standard.id === selectedStandardId;
          return (
            <button
              key={standard.id}
              type="button"
              onClick={() => {
                setSelectedStandardId(standard.id);
                // Mặc định mở tiêu chí đầu tiên của tiêu chuẩn đó
                if (standard.criteria[0]) {
                  setExpandedCriteria((prev) => ({ ...prev, [standard.criteria[0]!.id]: true }));
                }
              }}
              className={cn(
                'flex items-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-semibold transition-all',
                isSelected
                  ? 'border-teal-700 bg-teal-800 text-white shadow-2xs'
                  : 'border-stone-200 bg-stone-50/70 text-stone-700 hover:border-stone-300 hover:bg-stone-100',
              )}
            >
              <span
                className={cn(
                  'flex h-5 w-5 items-center justify-center rounded-md text-[11px] font-bold',
                  isSelected ? 'bg-white/20 text-white' : 'bg-stone-200 text-stone-600',
                )}
              >
                {standard.id}
              </span>
              <span>{standard.title.split(':')[0]}</span>
            </button>
          );
        })}
      </div>

      {/* Thông tin tiêu chuẩn hiện tại */}
      <div className="mt-4 rounded-xl border border-teal-200/80 bg-teal-50/50 p-4 text-xs leading-relaxed text-teal-950">
        <div className="font-bold text-teal-900 sm:text-sm">{activeStandard.title}</div>
        <p className="mt-1 text-teal-900/90">{activeStandard.description}</p>
      </div>

      {/* Danh sách các tiêu chí (Accordion) */}
      <div className="mt-4 space-y-3">
        {filteredCriteria.length === 0 ? (
          <div className="rounded-xl border border-dashed border-stone-200 p-8 text-center text-xs text-stone-500">
            Không tìm thấy tiêu chí phù hợp với từ khóa "{searchQuery}" trong tiêu chuẩn này.
          </div>
        ) : (
          filteredCriteria.map((criterion) => {
            const isExpanded = Boolean(expandedCriteria[criterion.id]);
            return (
              <div
                key={criterion.id}
                className="overflow-hidden rounded-xl border border-stone-200 bg-white shadow-2xs transition-all hover:border-stone-300"
              >
                {/* Header Tiêu chí */}
                <button
                  type="button"
                  onClick={() => toggleCriterion(criterion.id)}
                  className="flex w-full items-center justify-between p-4 text-left transition-colors hover:bg-stone-50/70"
                >
                  <div className="flex items-start gap-3">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-teal-100 text-xs font-bold text-teal-900">
                      {criterion.number}
                    </span>
                    <div>
                      <h4 className="text-sm font-bold text-stone-900">
                        Tiêu chí {criterion.number}: {criterion.name}
                      </h4>
                      <p className="mt-0.5 text-xs text-stone-500">{criterion.description}</p>
                    </div>
                  </div>

                  <ChevronDown
                    className={cn(
                      'h-4 w-4 shrink-0 text-stone-400 transition-transform duration-200',
                      isExpanded && 'rotate-180 text-teal-700',
                    )}
                  />
                </button>

                {/* Nội dung 3 mức Đạt - Khá - Tốt */}
                {isExpanded && (
                  <div className="border-t border-stone-100 bg-stone-50/40 p-4 pt-3">
                    <div className="mb-2 text-[11px] font-bold tracking-wider text-stone-500 uppercase">
                      3 Mức độ năng lực chuẩn hóa
                    </div>

                    <div className="grid gap-3 sm:grid-cols-3">
                      {/* Mức Đạt */}
                      <div className="rounded-xl border border-stone-200 bg-white p-3.5 shadow-2xs">
                        <div className="flex items-center gap-1.5 text-xs font-bold text-stone-800">
                          <CheckCircle2 className="h-3.5 w-3.5 text-stone-500" />
                          <span>Mức ĐẠT (Cơ bản)</span>
                        </div>
                        <p className="mt-2 text-xs leading-relaxed text-stone-600">
                          {criterion.levels.dat}
                        </p>
                      </div>

                      {/* Mức Khá */}
                      <div className="rounded-xl border border-teal-200 bg-teal-50/40 p-3.5 shadow-2xs">
                        <div className="flex items-center gap-1.5 text-xs font-bold text-teal-900">
                          <CheckCircle2 className="h-3.5 w-3.5 text-teal-700" />
                          <span>Mức KHÁ (Thành thạo)</span>
                        </div>
                        <p className="mt-2 text-xs leading-relaxed text-stone-700">
                          {criterion.levels.kha}
                        </p>
                      </div>

                      {/* Mức Tốt */}
                      <div className="rounded-xl border border-amber-200 bg-amber-50/40 p-3.5 shadow-2xs">
                        <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900">
                          <Sparkles className="h-3.5 w-3.5 text-amber-700" />
                          <span>Mức TỐT (Mẫu mực)</span>
                        </div>
                        <p className="mt-2 text-xs leading-relaxed text-stone-700">
                          {criterion.levels.tot}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

export default TeacherStandardsMatrix;
