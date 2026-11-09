import type { CompiledLessonModule } from '@/content-runtime/loader';
import {
  FIVE_STEP_PRACTICAL_FRAMEWORK,
  FULLY_DEVELOPED_MODEL_CASES,
  GDH_20_PRACTICAL_CASES,
  HOMEROOM_MEETING_SCRIPT_45MIN,
  HOMEROOM_PLAN_6_PARTS,
  SAMPLE_5512_EXPERIENTIAL_PLAN,
  type PracticalPedagogicalCase,
} from '@/data/gdhPracticalData';
import {
  CaseStudyBox,
  ComparativeTable,
  LegalReferenceBox,
  NumberedProcessFlow,
  PedagogyMetadataBar,
  ScholarQuote,
} from '@/features/pedagogy';
import { Sidenote } from '@/shared/components/Sidenote';
import { Badge, Button } from '@/shared/ui';
import {
  AlertTriangle,
  BookOpen,
  Calendar,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Compass,
  FileText,
  HelpCircle,
  Layers,
  Scale,
  Sparkles,
  Target,
  XCircle,
} from 'lucide-react';
import { useState, type FC } from 'react';
import type { PedagogicalCaseStudy } from './course';

// ============================================================================
// DỮ LIỆU NGÂN HÀNG 20 TÌNH HUỐNG SƯ PHẠM ĐIỂN HÌNH (HCMUE STANDARDS)
// ============================================================================

export interface ExtendedCaseStudy extends PedagogicalCaseStudy {
  readonly category: 'insubordination' | 'romance' | 'bullying' | 'integrity' | 'parent';
  readonly categoryName: string;
  readonly targetGrade: string;
}

export const PEDAGOGICAL_20_CASE_STUDIES: readonly ExtendedCaseStudy[] = GDH_20_PRACTICAL_CASES.map(
  (cs) => ({
    ...cs,
    categoryName: cs.groupName,
  }),
);

// ============================================================================
// 1. COMPONENT THỰC HÀNH 1 (BÀI 6.1): PHÂN TÍCH VÀ XỬ LÍ TÌNH HUỐNG GIÁO DỤC PHỔ THÔNG
// ============================================================================

export const Lesson6_1View: FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [expandedCaseId, setExpandedCaseId] = useState<number | null>(1);
  const [reflections, setReflections] = useState<Record<number, string>>({});
  const [savedStatus, setSavedStatus] = useState<Record<number, boolean>>({});

  const filteredCases = PEDAGOGICAL_20_CASE_STUDIES.filter((c) => {
    if (selectedCategory === 'all') return true;
    if (selectedCategory === 'A' || selectedCategory === 'insubordination')
      return (
        (c as unknown as PracticalPedagogicalCase).group === 'A' || c.category === 'insubordination'
      );
    if (
      selectedCategory === 'B' ||
      selectedCategory === 'bullying' ||
      selectedCategory === 'romance'
    )
      return (
        (c as unknown as PracticalPedagogicalCase).group === 'B' ||
        c.category === 'bullying' ||
        c.category === 'romance'
      );
    if (selectedCategory === 'C' || selectedCategory === 'parent')
      return (c as unknown as PracticalPedagogicalCase).group === 'C' || c.category === 'parent';
    if (selectedCategory === 'D') return (c as unknown as PracticalPedagogicalCase).group === 'D';
    if (selectedCategory === 'integrity') return c.category === 'integrity';
    return true;
  });

  const handleToggleCase = (id: number) => {
    setExpandedCaseId((prev) => (prev === id ? null : id));
  };

  const handleSaveReflection = (id: number) => {
    if (reflections[id]?.trim()) {
      setSavedStatus((prev) => ({ ...prev, [id]: true }));
      setTimeout(() => {
        setSavedStatus((prev) => ({ ...prev, [id]: false }));
      }, 2500);
    }
  };

  return (
    <div className="space-y-8 leading-relaxed text-[#29383D]">
      {/* 1. THANH METADATA & ĐỐI CHIẾU ĐẦU BÀI */}
      <PedagogyMetadataBar
        courseCode="EDUC2802"
        lessonCode="EDUC2802-PRACTICE-01"
        clos={['CLO6']}
        textbookPages="Mục 3.3.6 Giáo trình HCMUE (Trang 65 – 66)"
        legalRefs={[
          'Luật Giáo dục 2019 (Điều 69, 70)',
          'Thông tư 32/2020/TT-BGDĐT (Điều 38 — Khen thưởng và kỷ luật)',
          'Tài liệu Kỷ luật tích cực (Jane Nelsen)',
        ]}
        sessionNote="Thực hành 1 · 8 tiết thực hành · 20 Tình huống Sư phạm"
      />

      {/* CỤM NÚT TÁC VỤ (TEXT THUẦN TÚY) */}
      <div className="flex flex-wrap items-center gap-2 rounded-xl border border-[#CFDADB] bg-[#F7FAFA] px-4 py-2.5 text-xs text-[#55676B] shadow-2xs">
        {['Đánh dấu hoàn thành', 'Lưu bài', 'Ghi chú', 'Thuật ngữ: Bật'].map((actionText) => (
          <button
            type="button"
            key={actionText}
            className="rounded-lg border border-[#CFDADB] bg-[#E1E9EA]/60 px-3 py-1 font-medium text-[#29383D] transition-colors hover:bg-[#CFDADB]"
          >
            {actionText}
          </button>
        ))}
      </div>

      {/* ==================================================================== */}
      {/* PHẦN I: QUY TRÌNH KHOA HỌC 5 BƯỚC XỬ LÝ TÌNH HUỐNG SƯ PHẠM (MỤC 3.3.6) */}
      {/* ==================================================================== */}
      <section className="space-y-4">
        <div className="flex items-center gap-2 border-b border-[#CFDADB] pb-2 font-serif text-xl font-bold text-[#29383D]">
          <Scale className="h-5 w-5 text-[#3F6570]" />
          <h2 id="1-quy-trinh-khoa-hoc-5-buoc">
            1. Quy trình Khoa học 5 Bước Xử lý Tình huống Sư phạm (Giáo trình HCMUE tr. 65–66)
          </h2>
        </div>

        <div className="text-sm text-[#29383D]">
          Theo <strong>Mục 3.3.6 Giáo trình Giáo dục học HCMUE (tr. 65–66)</strong>, xử lí tình
          huống giáo dục không phải là phản xạ cảm tính nhất thời mà là một quy trình giải quyết vấn
          đề có phương pháp luận khoa học gồm <strong>5 bước chuẩn mực</strong>:
          <Sidenote
            number={1}
            type="pedagogy"
            title="Nguyên tắc 'Dừng 5 giây' và Tác động song hành"
          >
            Trong mọi tình huống xung đột học đường, sự điềm tĩnh của người thầy ở Bước 1 quyết định
            80% thành công của các bước tiếp theo. Tuyệt đối không đôi co tay đôi trước tập thể lớp.
          </Sidenote>
        </div>

        <NumberedProcessFlow
          title="Lưu đồ 5 Bước Chuẩn Mực Giải Quyết Tình Huống Sư Phạm (Mục 3.3.6 Giáo trình HCMUE)"
          subtitle="Khung phương pháp luận bắt buộc áp dụng khi phân tích và giải quyết 20 tình huống thực hành."
          badge="Quy trình 5 Bước"
          columns={1}
          steps={FIVE_STEP_PRACTICAL_FRAMEWORK.map((item) => ({
            number: item.stepNumber,
            title: item.title,
            badge: item.badge,
            description: item.detailedMethod,
            keyAction: item.coreAction,
            deliverable: `Cơ sở khoa học: ${item.theoreticalBasis} · Lưu ý: ${item.commonErrors}`,
          }))}
        />

        <ComparativeTable
          title="Bảng Tiêu chí Rubric Đánh giá Bài tập Thực hành Xử lý Tình huống Sư phạm (EDUC2802)"
          subtitle="Tiêu chuẩn chấm điểm bài thực hành phân tích tình huống sư phạm theo chuẩn đầu ra CLO6."
          badge="Rubric Thực hành 1"
          columns={[
            { key: 'criterion', header: 'Tiêu chí đánh giá', widthClass: 'w-1/3' },
            { key: 'weight', header: 'Trọng số điểm', widthClass: 'w-1/6' },
            { key: 'requirement', header: 'Yêu cầu cần đạt ở mức Tốt (8.5 – 10 điểm)' },
          ]}
          rows={[
            {
              criterion: 'Tiêu chí 1: Nhận diện vấn đề & Nguyên nhân tâm lí',
              weight: '2.5 điểm',
              requirement:
                'Xác định chính xác mâu thuẫn sư phạm cốt lõi; phân tích sâu sắc nguyên nhân tâm sinh lí lứa tuổi, hoàn cảnh gia đình và động cơ hành vi của học sinh.',
            },
            {
              criterion: 'Tiêu chí 2: Vận dụng nguyên tắc & Căn cứ pháp lý',
              weight: '2.5 điểm',
              requirement:
                'Chỉ rõ và phân tích đúng các nguyên tắc giáo dục (trong 6 nguyên tắc HCMUE) và điều khoản pháp lý liên quan (Luật Giáo dục 2019, Thông tư 20/2018, Thông tư 32/2020).',
            },
            {
              criterion: 'Tiêu chí 3: Giải quyết theo Quy trình 5 bước',
              weight: '3.5 điểm',
              requirement:
                'Trình bày mạch lạc, khả thi và nhân văn cả 5 bước xử lí (xử lí tức thời tại lớp -> gặp riêng lắng nghe -> phối hợp lực lượng -> theo dõi hỗ trợ).',
            },
            {
              criterion: 'Tiêu chí 4: Nhận diện bẫy sai lầm & Bài học sư phạm',
              weight: '1.5 điểm',
              requirement:
                'Chỉ ra được các bẫy sai lầm giáo viên dễ mắc phải và rút ra thông điệp sư phạm sâu sắc, thuyết phục.',
            },
          ]}
        />

        <LegalReferenceBox
          documentTitle="Thông tư số 32/2020/TT-BGDĐT (Điều lệ trường THCS, THPT và trường phổ thông có nhiều cấp học)"
          article="Điều 38 (Khen thưởng và kỷ luật) & Điều 31 (Quyền của giáo viên)"
          quote="Học sinh vi phạm khuyết điểm trong quá trình học tập, rèn luyện được giáo dục hoặc xử lý kỷ luật theo các hình thức: Nhắc nhở, hỗ trợ, giúp đỡ trực tiếp để học sinh khắc phục khuyết điểm; Khiển trách, thông báo với cha mẹ học sinh nhằm phối hợp giúp đỡ học sinh khắc phục khuyết điểm; Tạm dừng học ở trường có thời hạn và thực hiện các biện pháp giáo dục khác theo quy định của Bộ Giáo dục và Đào tạo."
          pedagogicalAnalysis="Thông tư 32/2020 đã bãi bỏ hoàn toàn hình thức phê bình trước toàn trường và đuổi học 1 năm, khẳng định triết lý kỷ luật tích cực: mọi biện pháp xử lí tình huống phải hướng tới hỗ trợ học sinh nhận ra lỗi và tiến bộ, tuyệt đối không xúc phạm danh dự, nhân phẩm hay thân thể người học."
        />

        <ScholarQuote
          quote="Nghệ thuật sư phạm không phải là nghệ thuật áp đặt, mà là nghệ thuật dẫn dắt học sinh tự nhận thức ra chân lý và tự hoàn thiện nhân cách của chính mình."
          author="K.D. Ushinsky"
          historicalContext="Nhà giáo dục học kinh điển người Nga"
        />
      </section>

      {/* ==================================================================== */}
      {/* PHẦN II: NGÂN HÀNG 20 TÌNH HUỐNG SƯ PHẠM ĐIỂN HÌNH (4 NHÓM A, B, C, D) */}
      {/* ==================================================================== */}
      <section className="space-y-6">
        <div className="flex flex-col gap-2 border-b border-[#CFDADB] pb-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <Target className="h-5 w-5 text-[#3F6570]" />
            <h2
              id="2-ngan-hang-20-tinh-huong"
              className="font-serif text-xl font-bold text-[#29383D]"
            >
              2. Ngân hàng 20 Tình huống Sư phạm Thực tế & Phương án Chuẩn 5 Bước
            </h2>
          </div>
          <Badge variant="subject">Đầy đủ 20 Tình huống Thực chiến (4 Nhóm)</Badge>
        </div>

        {/* Bộ lọc phân loại 4 nhóm tình huống */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setSelectedCategory('all')}
            className={`cursor-pointer rounded-lg px-3.5 py-2 text-xs font-semibold transition-all sm:text-sm ${
              selectedCategory === 'all'
                ? 'bg-[#3F6570] text-white shadow-2xs'
                : 'bg-[#E1E9EA] text-[#29383D] hover:bg-[#D7E1E2]'
            }`}
          >
            Tất cả 20 Tình huống
          </button>
          <button
            type="button"
            onClick={() => setSelectedCategory('A')}
            className={`cursor-pointer rounded-lg px-3.5 py-2 text-xs font-semibold transition-all sm:text-sm ${
              selectedCategory === 'A' || selectedCategory === 'insubordination'
                ? 'bg-[#3F6570] text-white shadow-2xs'
                : 'bg-[#E1E9EA] text-[#29383D] hover:bg-[#D7E1E2]'
            }`}
          >
            Nhóm A: Xung đột trong giờ học (Chống đối & Kỷ cương — TH A1 – A5)
          </button>
          <button
            type="button"
            onClick={() => setSelectedCategory('B')}
            className={`cursor-pointer rounded-lg px-3.5 py-2 text-xs font-semibold transition-all sm:text-sm ${
              selectedCategory === 'B' ||
              selectedCategory === 'bullying' ||
              selectedCategory === 'romance'
                ? 'bg-[#3F6570] text-white shadow-2xs'
                : 'bg-[#E1E9EA] text-[#29383D] hover:bg-[#D7E1E2]'
            }`}
          >
            Nhóm B: Quan hệ giữa HS và HS (Tình bạn & Bắt nạt — TH B1 – B5)
          </button>
          <button
            type="button"
            onClick={() => setSelectedCategory('C')}
            className={`cursor-pointer rounded-lg px-3.5 py-2 text-xs font-semibold transition-all sm:text-sm ${
              selectedCategory === 'C' || selectedCategory === 'parent'
                ? 'bg-[#3F6570] text-white shadow-2xs'
                : 'bg-[#E1E9EA] text-[#29383D] hover:bg-[#D7E1E2]'
            }`}
          >
            Nhóm C: Quan hệ giữa GV và Cha mẹ HS (Phối hợp Phụ huynh — TH C1 – C5)
          </button>
          <button
            type="button"
            onClick={() => setSelectedCategory('D')}
            className={`cursor-pointer rounded-lg px-3.5 py-2 text-xs font-semibold transition-all sm:text-sm ${
              selectedCategory === 'D'
                ? 'bg-[#3F6570] text-white shadow-2xs'
                : 'bg-[#E1E9EA] text-[#29383D] hover:bg-[#D7E1E2]'
            }`}
          >
            Nhóm D: Giáo dục HS cá biệt & Hoàn cảnh đặc biệt (TH D1 – D5)
          </button>
        </div>

        {/* Danh sách thẻ tình huống sư phạm */}
        <div className="space-y-5">
          {filteredCases.map((cs) => {
            const practicalCase = cs as unknown as PracticalPedagogicalCase;
            const isExpanded = expandedCaseId === cs.id;
            return (
              <div
                key={cs.id}
                id={`tinh-huong-${cs.id}`}
                className="pedagogy-case-card overflow-hidden rounded-2xl border border-[#CFDADB] bg-[#F7FAFA] shadow-xs transition-all hover:border-[#718C7E]"
              >
                {/* Header thanh tiêu đề có thể click mở/gập */}
                <button
                  type="button"
                  onClick={() => handleToggleCase(cs.id)}
                  className="flex w-full cursor-pointer items-center justify-between gap-4 p-5 text-left transition-colors hover:bg-[#EAF0F1]/70 sm:p-6"
                >
                  <div className="flex items-center gap-4">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#3F6570] font-mono text-xs font-bold text-white shadow-2xs">
                      {practicalCase.code ?? String(cs.id).padStart(2, '0')}
                    </span>
                    <div>
                      <div className="mb-1 flex items-center gap-2">
                        <span className="text-xs font-semibold text-[#3F6570] uppercase sm:text-sm">
                          {practicalCase.groupName ?? cs.categoryName}
                        </span>
                        <span className="text-xs font-medium text-[#55676B] sm:text-sm">
                          · {cs.targetGrade}
                        </span>
                      </div>
                      <h3 className="text-base leading-snug font-bold text-[#29383D] sm:text-lg">
                        {cs.title}
                      </h3>
                    </div>
                  </div>

                  <div className="flex shrink-0 items-center gap-2">
                    <span className="hidden text-sm font-medium text-[#55676B] sm:inline">
                      {isExpanded ? 'Thu gọn' : 'Xem phân tích'}
                    </span>
                    {isExpanded ? (
                      <ChevronUp className="h-5 w-5 text-[#3F6570]" />
                    ) : (
                      <ChevronDown className="h-5 w-5 text-[#55676B]" />
                    )}
                  </div>
                </button>

                {/* Nội dung chi tiết tình huống khi mở */}
                {isExpanded && (
                  <div className="space-y-5 border-t border-[#CFDADB] bg-[#EAF0F1]/50 p-5 sm:p-7">
                    {/* Bối cảnh thực tế */}
                    <div className="rounded-xl border border-[#CFDADB] bg-[#F7FAFA] p-5 text-[#29383D] shadow-2xs">
                      <div className="flex items-center gap-2 text-xs font-bold text-[#3F6570] uppercase sm:text-sm">
                        <BookOpen className="h-4 w-4" />
                        <span>Bối cảnh tình huống thực tế</span>
                      </div>
                      <p className="mt-2 text-[16px] leading-relaxed text-[#29383D] sm:text-[16.5px]">
                        {cs.context}
                      </p>
                    </div>

                    {/* Câu hỏi sư phạm */}
                    <div className="flex items-start gap-3 rounded-xl border border-[#718C7E]/40 bg-[#E8EFEB] p-4 text-[16px] leading-relaxed font-semibold text-[#29383D] sm:text-[16.5px]">
                      <HelpCircle className="mt-1 h-5 w-5 shrink-0 text-[#3F6570]" />
                      <p>{cs.question}</p>
                    </div>

                    {/* Khung phản tư cá nhân */}
                    <div className="space-y-3 rounded-xl border border-[#CFDADB] bg-[#F7FAFA] p-5">
                      <label
                        htmlFor={`reflect-${cs.id}`}
                        className="block text-sm font-bold text-[#29383D] sm:text-[15px]"
                      >
                        Phản tư cá nhân: Thầy/Cô sẽ xử lý tình huống này theo quy trình 5 bước như
                        thế nào trước khi xem phương án chuẩn?
                      </label>
                      <textarea
                        id={`reflect-${cs.id}`}
                        rows={2}
                        value={reflections[cs.id] ?? ''}
                        onChange={(e) =>
                          setReflections((prev) => ({ ...prev, [cs.id]: e.target.value }))
                        }
                        placeholder="Nhập suy nghĩ, bước can thiệp hoặc nguyên tắc của bạn..."
                        className="w-full rounded-lg border border-[#CFDADB] bg-[#EAF0F1]/60 p-3 text-sm leading-relaxed text-[#29383D] placeholder:text-[#55676B] focus:border-[#3F6570] focus:bg-[#F7FAFA] focus:outline-none sm:text-[15.5px]"
                      />
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-[#55676B] sm:text-sm">
                          {savedStatus[cs.id] ? (
                            <span className="inline-flex items-center gap-1 font-semibold text-[#4F7967]">
                              <CheckCircle2 className="h-4 w-4" /> Đã lưu phản tư thành công!
                            </span>
                          ) : (
                            'Ghi lại phản tư giúp rèn luyện năng lực giải quyết vấn đề sư phạm (CLO6)'
                          )}
                        </span>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleSaveReflection(cs.id)}
                          className="h-8 text-xs sm:text-sm"
                        >
                          Lưu phản tư
                        </Button>
                      </div>
                    </div>

                    {/* Nguyên tắc GDH áp dụng */}
                    <div className="space-y-2">
                      <span className="text-xs font-bold tracking-wider text-[#29383D] uppercase sm:text-sm">
                        Nguyên tắc Giáo dục học vận dụng:
                      </span>
                      <div className="flex flex-wrap gap-2">
                        {cs.principlesApplied.map((p, idx) => (
                          <span
                            key={idx}
                            className="rounded-lg border border-[#718C7E]/35 bg-[#E8EFEB] px-3 py-1 text-xs font-medium text-[#29383D] sm:text-sm"
                          >
                            {p}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Phương án xử lý tối ưu 5 bước chuẩn */}
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-xs font-bold tracking-wider text-[#3F6570] uppercase sm:text-sm">
                        <CheckCircle2 className="h-4 w-4 text-[#4F7967]" />
                        <span>Phương án xử lý tối ưu theo chuẩn Sư phạm (Quy trình 5 bước):</span>
                      </div>
                      <div className="grid gap-3 sm:grid-cols-2">
                        {cs.solutionSteps.map((step) => (
                          <div
                            key={step.step}
                            className="rounded-xl border border-[#CFDADB] bg-[#F7FAFA] p-4 shadow-2xs"
                          >
                            <div className="flex items-center gap-2 text-sm font-bold text-[#29383D] sm:text-base">
                              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-[#E8EFEB] font-serif text-xs font-bold text-[#3F6570]">
                                {String(step.step).padStart(2, '0')}
                              </span>
                              <span>{step.title}</span>
                            </div>
                            <p className="mt-2 text-[15px] leading-relaxed text-[#29383D] sm:text-[15.5px]">
                              {step.content}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Bẫy sư phạm cần tránh */}
                    <div className="rounded-xl border border-[#A65D59]/35 bg-[#A65D59]/8 p-4 text-[#29383D] sm:p-5">
                      <div className="flex items-center gap-2 text-xs font-bold tracking-wider text-[#A65D59] uppercase sm:text-sm">
                        <AlertTriangle className="h-4 w-4 text-[#A65D59]" />
                        <span>Bẫy sư phạm cần tránh tuyệt đối:</span>
                      </div>
                      <ul className="mt-2 list-disc space-y-1.5 pl-5 text-sm leading-relaxed text-[#29383D] sm:text-[15.5px]">
                        {cs.pitfallsToAvoid.map((pitfall, pIdx) => (
                          <li key={pIdx}>{pitfall}</li>
                        ))}
                      </ul>
                    </div>

                    {/* Bài học sư phạm cốt lõi */}
                    <div className="rounded-xl border border-[#718C7E]/40 bg-[#E8EFEB] p-4 text-sm leading-relaxed font-medium text-[#29383D] sm:text-[16px]">
                      <span className="font-bold text-[#3F6570]">Bài học cốt lõi: </span>
                      {cs.coreLesson}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* ==================================================================== */}
      {/* PHẦN III: TRIỂN KHAI TOÀN VĂN 2 TÌNH HUỐNG ĐIỂN HÌNH THEO CHUẨN 5 BƯỚC */}
      {/* ==================================================================== */}
      <section className="space-y-6">
        <div className="flex items-center gap-2 border-b border-[#CFDADB] pb-2 font-serif text-xl font-bold text-[#29383D]">
          <Compass className="h-5 w-5 text-[#3F6570]" />
          <h2 id="3-tinh-huong-mau-tong-hop">
            3. Mô hình Mẫu Trình bày Bài làm Xử lý Tình huống Sư phạm 5 Bước
          </h2>
        </div>

        <p className="text-sm text-[#29383D]">
          Dưới đây là <strong>2 kịch bản sư phạm mẫu điển hình</strong> được phát triển toàn văn
          theo đúng quy trình 5 bước của Mục 3.3.6 Giáo trình HCMUE (tr. 65–66) phục vụ làm mẫu bài
          thi thực hành và bài tập lớn:
        </p>

        <div className="space-y-6">
          {FULLY_DEVELOPED_MODEL_CASES.map((modelCase) => (
            <div
              key={modelCase.modelId}
              className="space-y-4 rounded-2xl border border-[#CFDADB] bg-[#F7FAFA] p-6 shadow-xs"
            >
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#CFDADB] pb-3">
                <div className="flex items-center gap-2">
                  <span className="rounded-lg bg-[#3F6570] px-2.5 py-1 font-mono text-xs font-bold text-white">
                    {modelCase.code}
                  </span>
                  <h3 className="font-serif text-lg font-bold text-[#29383D]">{modelCase.title}</h3>
                </div>
                <Badge variant="subject">Toàn văn 5 Bước Chuẩn Mực</Badge>
              </div>

              <div className="rounded-xl border border-[#CFDADB] bg-[#EAF0F1]/50 p-4">
                <span className="text-xs font-bold tracking-wider text-[#3F6570] uppercase">
                  Bối cảnh tình huống thực tế:
                </span>
                <p className="mt-1 text-sm leading-relaxed text-[#29383D]">{modelCase.context}</p>
              </div>

              <div className="space-y-3">
                <span className="text-xs font-bold tracking-wider text-[#3F6570] uppercase">
                  Quy trình 5 bước xử lý khoa học:
                </span>
                <div className="space-y-3">
                  {modelCase.detailedFiveSteps.map((step) => (
                    <div
                      key={step.stepNumber}
                      className="space-y-2 rounded-xl border border-[#CFDADB] bg-white p-4 dark:border-[#1E362A] dark:bg-[#12241C]"
                    >
                      <div className="flex items-center gap-2 font-serif text-sm font-bold text-[#3F6570] dark:text-[#C5A262]">
                        <span className="flex h-5 w-5 items-center justify-center rounded-md bg-[#E8EFEB] text-xs dark:bg-[#1E362A] dark:text-[#C5A262]">
                          0{step.stepNumber}
                        </span>
                        <span>{step.stepTitle}</span>
                      </div>
                      <ul className="list-disc space-y-1 pl-5 text-xs text-[#29383D] dark:text-[#A8C4B5]">
                        {step.executionActions.map((action, aIdx) => (
                          <li key={aIdx}>{action}</li>
                        ))}
                      </ul>
                      {step.pedagogicalDialogues && step.pedagogicalDialogues.length > 0 && (
                        <div className="space-y-1.5 rounded-lg border border-[#718C7E]/30 bg-[#E8EFEB]/60 p-3 text-xs dark:border-[#2C4D3B] dark:bg-[#142A20] dark:text-[#D1E0D7]">
                          <span className="font-bold text-[#3F6570]">Đối thoại sư phạm mẫu:</span>
                          {step.pedagogicalDialogues.map((dlg, dIdx) => (
                            <div key={dIdx} className="space-y-0.5">
                              <span className="font-semibold text-[#29383D]">{dlg.speaker}: </span>
                              <span className="text-[#55676B] italic">"{dlg.words}"</span>
                            </div>
                          ))}
                        </div>
                      )}
                      <p className="text-[11px] text-[#55676B] italic">
                        Luận giải khoa học: {step.scienceJustification}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-xl border border-[#718C7E]/40 bg-[#E8EFEB] p-4 text-xs">
                <span className="font-bold text-[#3F6570]">Bài học sư phạm cốt lõi: </span>
                <span className="text-[#29383D]">{modelCase.reflectionLessons}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="pt-2">
          <CaseStudyBox caseStudy={PEDAGOGICAL_20_CASE_STUDIES[0]!} />
        </div>
      </section>
    </div>
  );
};

// ============================================================================
// DỮ LIỆU BÀI 6.2: 10 CÂU HỎI TỰ LUẬN ÔN TẬP KINH ĐIỂN VÀ BAREM ĐIỂM
// ============================================================================

export interface EssayExamQuestion {
  readonly id: number;
  readonly title: string;
  readonly points: number;
  readonly chapterOrigin: string;
  readonly clos: string;
  readonly questionText: string;
  readonly outlineSections: readonly {
    readonly sectionTitle: string;
    readonly pointsAllocation: string;
    readonly contentItems: readonly string[];
  }[];
  readonly teachingMathContext?: string;
}

export const ESSAY_EXAM_QUESTIONS: readonly EssayExamQuestion[] = [
  {
    id: 1,
    title: 'Đặc điểm lao động sư phạm & Nhân cách người thầy là công cụ chủ yếu',
    points: 2.0,
    chapterOrigin: 'Chương 1',
    clos: 'CLO 1, CLO 2',
    questionText:
      'Phân tích 5 đặc điểm của lao động sư phạm. Bằng lý luận và thực tiễn, hãy chứng minh luận điểm: "Trong hoạt động sư phạm, nhân cách của người thầy giáo là công cụ lao động chủ yếu và quan trọng nhất".',
    outlineSections: [
      {
        sectionTitle: 'Phần 1: Phân tích 5 đặc điểm của lao động sư phạm (1.0 điểm)',
        pointsAllocation: '1.0 điểm (mỗi đặc điểm 0.2đ)',
        contentItems: [
          'Mục đích lao động: Đào tạo thế hệ trẻ thành những con người phát triển toàn diện (5 phẩm chất, 10 năng lực), đáp ứng yêu cầu công nghiệp hóa, hiện đại hóa và hội nhập quốc tế.',
          'Đối tượng lao động: Con người đang trong quá trình phát triển mạnh mẽ về thể chất, tâm lý và xã hội, có tính tích cực cá nhân và cá tính độc đáo.',
          'Công cụ lao động: Nhân cách của chính người thầy, bao gồm tri thức khoa học, lý tưởng sống, thế giới quan, năng lực sư phạm, nghệ thuật ứng xử và tác phong mẫu mực.',
          'Sản phẩm lao động: Nhân cách của học sinh. Sản phẩm này có giá trị xã hội to lớn, tác động trực tiếp và lâu dài đến tương lai dân tộc.',
          'Thời gian và không gian lao động: Lao động sư phạm không bị giới hạn trong 45 phút trên bục giảng hay 8 tiếng hành chính; nó diễn ra liên tục cả ngày đêm, ở trường học, gia đình và trên không gian số.',
        ],
      },
      {
        sectionTitle:
          'Phần 2: Chứng minh nhân cách người thầy là công cụ lao động chủ yếu (1.0 điểm)',
        pointsAllocation: '1.0 điểm (mỗi luận cứ 0.25đ)',
        contentItems: [
          'Về cơ chế giáo dục: Giáo dục nhân cách diễn ra theo cơ chế lây lan cảm xúc, bắt chước và đồng nhất hóa. Học sinh nhìn vào hành vi, lời nói thực tế của người thầy để noi theo ("Thân giáo hơn khẩu giáo").',
          'Về tính chất công cụ: Khác với công cụ cơ học hay trí tuệ nhân tạo, nhân cách người thầy truyền tải ngọn lửa đam mê, niềm tin đạo đức và lý tưởng sống - điều mà máy móc không thể có.',
          'Về tính chủ động: Người thầy sử dụng vốn sống, phẩm chất và kinh nghiệm của mình để biến đổi tình huống sư phạm, biến khó khăn thành bài học nhân văn cho học trò.',
          'Dẫn chiếu danh ngôn: Dẫn chứng nhận định của K.D. Ushinsky: "Nhân cách của người thầy là sức mạnh có ảnh hưởng to lớn đối với học sinh mà không một cuốn sách giáo khoa nào, không một lời khuyên bảo nào có thể thay thế được".',
        ],
      },
    ],
    teachingMathContext:
      'Liên hệ Sư phạm Toán: Thầy cô dạy Toán không chỉ dạy công thức hay thuật toán mà bằng sự mẫu mực về tính chính xác, tư duy logic, sự kiên nhẫn khi chữa một bài toán khó, thầy cô đã rèn luyện cho học sinh đức tính trung thực và kiên trì suốt đời.',
  },
  {
    id: 2,
    title: 'Chuẩn nghề nghiệp giáo viên cơ sở GDPT (Thông tư 20/2018) & Tiêu chuẩn 2',
    points: 2.0,
    chapterOrigin: 'Chương 1',
    clos: 'CLO 2, CLO 3',
    questionText:
      'Trình bày 5 tiêu chuẩn chuẩn nghề nghiệp giáo viên cơ sở giáo dục phổ thông theo Thông tư 20/2018/TT-BGDĐT. Để đáp ứng tốt Tiêu chuẩn 2 (Phát triển chuyên môn, nghiệp vụ), sinh viên sư phạm cần rèn luyện những năng lực cốt lõi nào?',
    outlineSections: [
      {
        sectionTitle: 'Phần 1: 5 tiêu chuẩn chuẩn nghề nghiệp theo TT 20/2018 (1.0 điểm)',
        pointsAllocation: '1.0 điểm (mỗi tiêu chuẩn 0.2đ)',
        contentItems: [
          'Tiêu chuẩn 1: Phẩm chất nhà giáo (Gồm 2 tiêu chí: Đạo đức nhà giáo và Phong cách nhà giáo).',
          'Tiêu chuẩn 2: Phát triển chuyên môn, nghiệp vụ (Gồm 5 tiêu chí: Phát triển chuyên môn, Xây dựng kế hoạch dạy học, Sử dụng PPDH, Ứng dụng CNTT, Sử dụng ngoại ngữ).',
          'Tiêu chuẩn 3: Xây dựng môi trường giáo dục (Gồm 3 tiêu chí: Xây dựng văn hóa nhà trường, Môi trường an toàn phòng chống bạo lực, Thực hiện quyền dân chủ).',
          'Tiêu chuẩn 4: Phát triển mối quan hệ giữa nhà trường, gia đình và xã hội (Gồm 3 tiêu chí: Phối hợp cha mẹ học sinh, Phối hợp các lực lượng xã hội, Tổ chức các hoạt động cộng đồng).',
          'Tiêu chuẩn 5: Sử dụng ngoại ngữ hoặc tiếng dân tộc, ứng dụng CNTT, khai thác và sử dụng thiết bị công nghệ trong dạy học và giáo dục (Gồm 2 tiêu chí).',
        ],
      },
      {
        sectionTitle:
          'Phần 2: Phương hướng rèn luyện Tiêu chuẩn 2 cho sinh viên sư phạm (1.0 điểm)',
        pointsAllocation: '1.0 điểm',
        contentItems: [
          'Về tri thức khoa học bộ môn: Nắm vững hệ thống kiến thức Toán học đại học để có tầm nhìn sâu rộng khi dạy toán phổ thông CT 2018.',
          'Về năng lực sư phạm: Rèn luyện thành thạo kỹ năng thiết kế kế hoạch bài dạy theo định hướng phát triển năng lực (Công văn 5512/BGDĐT); làm chủ các phương pháp dạy học tích cực.',
          'Về công nghệ số: Khai thác thành thạo các phần mềm toán học (GeoGebra, Desmos) và ứng dụng AI hỗ trợ soạn giảng thông minh.',
          'Về tự học và nghiên cứu khoa học: Thường xuyên đọc tạp chí chuyên ngành, tham gia nghiên cứu khoa học sinh viên và thực tập sư phạm nghiêm túc.',
        ],
      },
    ],
  },
  {
    id: 3,
    title: '4 yếu tố hình thành nhân cách & Vai trò CHỦ ĐẠO của giáo dục',
    points: 2.5,
    chapterOrigin: 'Chương 2',
    clos: 'CLO 1, CLO 2',
    questionText:
      'Phân tích vai trò của 4 yếu tố (Bẩm sinh - di truyền, Môi trường, Hoạt động cá nhân, Giáo dục) đối với sự hình thành và phát triển nhân cách. Tại sao khẳng định giáo dục giữ vai trò CHỦ ĐẠO?',
    outlineSections: [
      {
        sectionTitle: 'Phần 1: Phân tích vai trò của 4 yếu tố đối với nhân cách (1.25 điểm)',
        pointsAllocation: '1.25 điểm',
        contentItems: [
          'Bẩm sinh - di truyền (Tiền đề vật chất): Cung cấp mầm mống, tư chất tự nhiên; tạo tiền đề cho sự phát triển nhưng không quyết định trước nội dung đạo đức và tài năng của nhân cách.',
          'Môi trường xã hội (Điều kiện thực tế): Hoàn cảnh sống, quan hệ gia đình, bạn bè định hình nội dung trải nghiệm; nhưng cá nhân có thể cải tạo môi trường.',
          'Hoạt động cá nhân & Giao lưu (Yếu tố QUYẾT ĐỊNH TRỰC TIẾP): Nhân cách chỉ được hình thành thông qua chính hoạt động tích cực của chủ thể.',
          'Giáo dục (Yếu tố CHỦ ĐẠO): Định hướng, dẫn dắt, tổ chức môi trường và hoạt động nhằm tối ưu hóa sự phát triển nhân cách theo mục tiêu xã hội.',
        ],
      },
      {
        sectionTitle:
          'Phần 2: Chứng minh vì sao Giáo dục giữ vai trò CHỦ ĐẠO (1.25 điểm - 5 luận cứ cốt lõi)',
        pointsAllocation: '1.25 điểm (mỗi luận cứ 0.25đ)',
        contentItems: [
          '1. Giáo dục vạch ra phương hướng phát triển nhân cách theo mục tiêu lý tưởng của xã hội.',
          '2. Giáo dục đi trước sự phát triển, định hướng và kéo theo sự phát triển (Vùng phát triển gần nhất - L.S. Vygotsky).',
          '3. Giáo dục có thể bù đắp, uốn nắn những khiếm khuyết do di truyền hoặc tật nguyền gây ra.',
          '4. Giáo dục có khả năng thanh lọc, hạn chế những tác động tiêu cực từ môi trường tự phát.',
          '5. Giáo dục khơi dậy và phát huy tính tự giác, tự giáo dục của mỗi cá nhân.',
        ],
      },
    ],
  },
  {
    id: 4,
    title: '3 chức năng xã hội của giáo dục & Nguồn vốn nhân lực',
    points: 2.0,
    chapterOrigin: 'Chương 2',
    clos: 'CLO 1, CLO 3',
    questionText:
      'Trình bày 3 chức năng xã hội của giáo dục (Kinh tế - sản xuất, Chính trị - xã hội, Tư tưởng - văn hóa). Phân tích luận điểm: Đầu tư cho giáo dục là đầu tư cho phát triển bền vững.',
    outlineSections: [
      {
        sectionTitle: 'Phần 1: 3 chức năng xã hội của giáo dục (1.25 điểm)',
        pointsAllocation: '1.25 điểm',
        contentItems: [
          'Chức năng Kinh tế - sản xuất: Tái sản xuất sức lao động xã hội, nâng cao năng suất lao động, biến tri thức thành lực lượng sản xuất trực tiếp.',
          'Chức năng Chính trị - xã hội: Tác động đến cấu trúc xã hội, thúc đẩy công bằng và bồi dưỡng ý thức công dân.',
          'Chức năng Tư tưởng - văn hóa: Bảo tồn và phát huy di sản văn hóa dân tộc, xây dựng hệ giá trị chuẩn mực.',
        ],
      },
      {
        sectionTitle: 'Phần 2: Đầu tư giáo dục là đầu tư phát triển (0.75 điểm)',
        pointsAllocation: '0.75 điểm',
        contentItems: [
          'Lý thuyết nguồn vốn nhân lực (Human Capital): Giáo dục mang lại tỷ suất sinh lợi xã hội cao nhất.',
          'Trong kỷ nguyên kinh tế tri thức và AI, chất lượng nguồn nhân lực quyết định năng lực cạnh tranh quốc gia.',
        ],
      },
    ],
  },
  {
    id: 5,
    title: 'Hệ thống 6 nguyên tắc giáo dục & Phân tích Nguyên tắc Tôn trọng nhân cách',
    points: 2.5,
    chapterOrigin: 'Chương 3',
    clos: 'CLO 3, CLO 4',
    questionText:
      'Liệt kê hệ thống 6 nguyên tắc giáo dục trong Giáo trình HCMUE. Phân tích nội dung và yêu cầu thực hiện của "Nguyên tắc tôn trọng nhân cách học sinh kết hợp với yêu cầu hợp lí".',
    outlineSections: [
      {
        sectionTitle: 'Phần 1: Hệ thống 6 nguyên tắc giáo dục HCMUE (0.75 điểm)',
        pointsAllocation: '0.75 điểm',
        contentItems: [
          '1. Nguyên tắc đảm bảo tính mục đích của hoạt động giáo dục.',
          '2. Nguyên tắc hoạt động giáo dục gắn với đời sống, thực tiễn xã hội.',
          '3. Nguyên tắc đảm bảo sự thống nhất giữa ý thức và hành vi.',
          '4. Nguyên tắc giáo dục trong tập thể và bằng tập thể.',
          '5. Nguyên tắc tôn trọng nhân cách học sinh kết hợp với yêu cầu hợp lí.',
          '6. Nguyên tắc đảm bảo tính hệ thống, kế thừa và phù hợp đặc điểm cá nhân.',
        ],
      },
      {
        sectionTitle: 'Phần 2: Phân tích Nguyên tắc Tôn trọng nhân cách (1.75 điểm)',
        pointsAllocation: '1.75 điểm',
        contentItems: [
          'Bản chất: Tôn trọng nhân phẩm, danh dự và quyền của học sinh là nền tảng; yêu cầu hợp lý là động lực thúc đẩy tiến bộ.',
          'Yêu cầu thực hiện: Tuyệt đối không nhục mạ thân thể/tinh thần; đặt yêu cầu vừa sức và nâng dần mức độ; kiên trì đồng hành.',
          'Bẫy sai lầm: Dễ dãi buông lỏng kỷ luật hoặc ngược lại độc đoán, áp đặt thô bạo.',
        ],
      },
    ],
  },
  {
    id: 6,
    title: 'Phương pháp giáo dục & Kỷ luật tích cực (Thay thế trừng phạt)',
    points: 2.0,
    chapterOrigin: 'Chương 3',
    clos: 'CLO 4, CLO 5',
    questionText:
      'Trình bày 3 nhóm phương pháp giáo dục (Thuyết phục, Tổ chức hoạt động, Khen thưởng - kỷ luật). Vì sao giáo dục hiện đại đề cao Kỷ luật tích cực thay cho trừng phạt bạo lực?',
    outlineSections: [
      {
        sectionTitle: 'Phần 1: 3 nhóm phương pháp giáo dục (1.0 điểm)',
        pointsAllocation: '1.0 điểm',
        contentItems: [
          'Nhóm 1: Các phương pháp hình thành ý thức cá nhân (Thuyết phục: giảng giải, đàm thoại, nêu gương).',
          'Nhóm 2: Các phương pháp tổ chức hoạt động và hình thành kinh nghiệm ứng xử (Tập luyện, rèn luyện, giao việc).',
          'Nhóm 3: Các phương pháp kích thích và điều chỉnh hành vi (Khen thưởng, khiển trách tích cực).',
        ],
      },
      {
        sectionTitle: 'Phần 2: Ưu thế của Kỷ luật tích cực (1.0 điểm)',
        pointsAllocation: '1.0 điểm',
        contentItems: [
          'Kỷ luật tích cực hướng vào giải pháp và sự tiến bộ, giúp học sinh hiểu nguyên nhân lỗi sai và tự nguyện sửa chữa.',
          'Trừng phạt bạo lực chỉ tạo sự sợ hãi bề ngoài nhưng gây tổn thương tinh thần sâu sắc và kích hoạt tâm lý phản kháng ngầm.',
        ],
      },
    ],
  },
  {
    id: 7,
    title: '4 chức năng của GVCN & Bản kế hoạch giáo dục lớp chủ nhiệm',
    points: 2.5,
    chapterOrigin: 'Chương 4',
    clos: 'CLO 6, CLO 7',
    questionText:
      'Phân tích 4 chức năng cốt lõi của giáo viên chủ nhiệm lớp. Trình bày quy trình 6 bước lập kế hoạch giáo dục của lớp chủ nhiệm theo Giáo trình HCMUE.',
    outlineSections: [
      {
        sectionTitle: 'Phần 1: 4 chức năng của GVCN (1.25 điểm)',
        pointsAllocation: '1.25 điểm',
        contentItems: [
          'Chức năng 1: Tìm hiểu, nắm vững và phân loại toàn diện học sinh lớp chủ nhiệm.',
          'Chức năng 2: Tổ chức, xây dựng và phát triển tập thể học sinh thành tập thể tự quản đoàn kết.',
          'Chức năng 3: Tổ chức thực hiện các hoạt động giáo dục toàn diện (học tập, nề nếp, trải nghiệm).',
          'Chức năng 4: Cầu nối phối hợp thống nhất giữa các lực lượng giáo dục (Nhà trường - Gia đình - Xã hội).',
        ],
      },
      {
        sectionTitle: 'Phần 2: Quy trình 6 bước lập kế hoạch chủ nhiệm (1.25 điểm)',
        pointsAllocation: '1.25 điểm',
        contentItems: [
          'Bước 1: Nghiên cứu chủ trương, nhiệm vụ năm học của trường và ngành.',
          'Bước 2: Tìm hiểu, phân tích tình hình thực tế của lớp (điểm mạnh, khó khăn).',
          'Bước 3: Xác định mục tiêu, chỉ tiêu phấn đấu cho năm học/tháng.',
          'Bước 4: Xác định nội dung và hệ thống biện pháp thực hiện.',
          'Bước 5: Dự kiến phân công lực lượng và lịch trình thời gian.',
          'Bước 6: Hoàn thiện văn bản kế hoạch, thông qua tập thể và trình Hiệu trưởng phê duyệt.',
        ],
      },
    ],
  },
  {
    id: 8,
    title: '3 giai đoạn phát triển tập thể học sinh (A.S. Makarenko)',
    points: 2.0,
    chapterOrigin: 'Chương 4',
    clos: 'CLO 6, CLO 7',
    questionText:
      'Trình bày đặc điểm và biện pháp tác động sư phạm của GVCN qua 3 giai đoạn phát triển tập thể học sinh theo lý luận của A.S. Makarenko.',
    outlineSections: [
      {
        sectionTitle: 'Giai đoạn 1: Tập thể mới hình thành (0.7đ)',
        pointsAllocation: '0.7 điểm',
        contentItems: [
          'Đặc điểm: Học sinh chưa hiểu nhau, chưa có sự gắn kết, chưa có cán sự nòng cốt.',
          'Biện pháp: GVCN trực tiếp chỉ định ban cán sự lâm thời, đặt ra nội quy rõ ràng, tổ chức các hoạt động chung để tạo sự giao lưu.',
        ],
      },
      {
        sectionTitle: 'Giai đoạn 2: Tập thể có nhóm nòng cốt hoạt động (0.7đ)',
        pointsAllocation: '0.7 điểm',
        contentItems: [
          'Đặc điểm: Ban cán sự đã tự tin điều hành, dư luận tập thể lành mạnh bắt đầu định hình.',
          'Biện pháp: GVCN chuyển sang vai trò cố vấn, tác động gián tiếp qua ban cán sự, bồi dưỡng kỹ năng tự quản.',
        ],
      },
      {
        sectionTitle: 'Giai đoạn 3: Tập thể phát triển cao độ (0.6đ)',
        pointsAllocation: '0.6 điểm',
        contentItems: [
          'Đặc điểm: Cả lớp đồng lòng, tinh thần tự quản tuyệt đối, mỗi cá nhân đều có ý thức vì tập thể.',
          'Biện pháp: GVCN đặt ra các mục tiêu cao hơn (dự án xã hội, hoạt động cộng đồng), duy trì truyền thống tốt đẹp của lớp.',
        ],
      },
    ],
  },
  {
    id: 9,
    title: 'Bản chất Hoạt động trải nghiệm & Chu trình 4 pha David Kolb',
    points: 2.5,
    chapterOrigin: 'Chương 5',
    clos: 'CLO 8, CLO 9',
    questionText:
      'Phân tích bản chất của Hoạt động trải nghiệm theo Chương trình GDPT 2018. Trình bày Chu trình học tập qua trải nghiệm 4 pha của David Kolb và sự vận dụng trong thiết kế chủ đề.',
    outlineSections: [
      {
        sectionTitle: 'Phần 1: Bản chất của HĐTN theo CT GDPT 2018 (1.0 điểm)',
        pointsAllocation: '1.0 điểm',
        contentItems: [
          'Là hoạt động giáo dục bắt buộc từ lớp 1 đến lớp 12 (105 tiết/năm).',
          'Bản chất: Học sinh trực tiếp tham gia, thao tác, thể nghiệm cảm xúc và chuyển hóa kinh nghiệm cá nhân thành năng lực mới.',
        ],
      },
      {
        sectionTitle: 'Phần 2: Chu trình 4 pha của David Kolb (1.5 điểm)',
        pointsAllocation: '1.5 điểm',
        contentItems: [
          'Pha 1: Trải nghiệm cụ thể (Hành động trực tiếp với đối tượng/tình huống).',
          'Pha 2: Quan sát phản tư / Chiêm nghiệm (Chia sẻ cảm xúc, phân tích thành bại).',
          'Pha 3: Khái quát hóa khái niệm (Đúc kết bài học, quy luật, chuẩn mực mới).',
          'Pha 4: Thử nghiệm tích cực / Vận dụng mới (Ứng dụng giải quyết vấn đề đời sống thực tế).',
        ],
      },
    ],
  },
  {
    id: 10,
    title: 'Quy trình thiết kế kế hoạch bài dạy HĐTN theo Công văn 5512',
    points: 2.5,
    chapterOrigin: 'Chương 5',
    clos: 'CLO 8, CLO 9',
    questionText:
      'Trình bày cấu trúc kế hoạch bài dạy một chủ đề Hoạt động trải nghiệm, hướng nghiệp theo Công văn 5512/BGDĐT-GDTrH và 4 hoạt động sư phạm chuẩn.',
    outlineSections: [
      {
        sectionTitle: 'Phần 1: Khung cấu trúc CV 5512 (1.0 điểm)',
        pointsAllocation: '1.0 điểm',
        contentItems: [
          'Tên chủ đề & thời lượng; I. Mục tiêu (Năng lực đặc thù, Năng lực chung, Phẩm chất); II. Thiết bị và học liệu; III. Tiến trình tổ chức; IV. Hồ sơ & Đánh giá.',
        ],
      },
      {
        sectionTitle: 'Phần 2: Tiến trình chuỗi 4 hoạt động trải nghiệm (1.5 điểm)',
        pointsAllocation: '1.5 điểm',
        contentItems: [
          'Hoạt động 1: Khởi động / Khám phá (Tạo tâm thế, khơi gợi kinh nghiệm sẵn có).',
          'Hoạt động 2: Hình thành kiến thức / Kết nối trải nghiệm mới.',
          'Hoạt động 3: Luyện tập / Thực hành trải nghiệm (Rèn luyện kỹ năng giải quyết tình huống).',
          'Hoạt động 4: Vận dụng / Mở rộng (Ứng dụng vào thực tiễn gia đình, xã hội).',
          'Mỗi hoạt động nêu rõ: Mục tiêu, Nội dung, Sản phẩm và Tổ chức thực hiện 4 bước.',
        ],
      },
    ],
  },
];

// ============================================================================
// DỮ LIỆU BÀI 6.2: BỘ 20 CÂU TRẮC NGHIỆM KHÁCH QUAN ÔN TẬP CUỐI KỲ
// ============================================================================

export interface QuizQuestion {
  readonly id: number;
  readonly question: string;
  readonly options: readonly string[];
  readonly correctIndex: number;
  readonly explanation: string;
}

export const QUIZ_20_QUESTIONS: readonly QuizQuestion[] = [
  {
    id: 1,
    question:
      'Trong hoạt động sư phạm, yếu tố nào giữ vai trò là "công cụ lao động chủ yếu và quan trọng nhất"?',
    options: [
      'A. Sách giáo khoa và tài liệu tham khảo',
      'B. Nhân cách của người thầy giáo',
      'C. Phương tiện công nghệ và máy chiếu hiện đại',
      'D. Kế hoạch bài dạy (giáo án)',
    ],
    correctIndex: 1,
    explanation:
      'Theo Giáo trình HCMUE, công cụ lao động chủ yếu của người thầy chính là nhân cách của bản thân, tác động đến học sinh theo cơ chế lây lan cảm xúc và noi gương mẫu mực.',
  },
  {
    id: 2,
    question:
      'Theo Thông tư 20/2018/TT-BGDĐT, Chuẩn nghề nghiệp giáo viên cơ sở GDPT gồm bao nhiêu tiêu chuẩn và tiêu chí?',
    options: [
      'A. 4 tiêu chuẩn, 12 tiêu chí',
      'B. 5 tiêu chuẩn, 15 tiêu chí',
      'C. 6 tiêu chuẩn, 18 tiêu chí',
      'D. 5 tiêu chuẩn, 20 tiêu chí',
    ],
    correctIndex: 1,
    explanation:
      'Thông tư 20/2018/TT-BGDĐT ban hành gồm chính xác 5 tiêu chuẩn và 15 tiêu chí đánh giá mức độ nghề nghiệp.',
  },
  {
    id: 3,
    question:
      'Yếu tố nào giữ vai trò là "Tiền đề vật chất, tư chất tự nhiên" đối với sự hình thành nhân cách?',
    options: [
      'A. Bẩm sinh - di truyền',
      'B. Môi trường xã hội',
      'C. Giáo dục nhà trường',
      'D. Hoạt động cá nhân',
    ],
    correctIndex: 0,
    explanation:
      'Bẩm sinh - di truyền cung cấp mầm mống thể chất và tư chất thần kinh ban đầu, đóng vai trò là tiền đề vật chất nhưng không quyết định nội dung nhân cách.',
  },
  {
    id: 4,
    question:
      'Yếu tố nào giữ vai trò "Quyết định trực tiếp" sự hình thành và phát triển nhân cách của cá nhân?',
    options: [
      'A. Giáo dục nhà trường',
      'B. Môi trường địa phương',
      'C. Hoạt động và giao lưu cá nhân',
      'D. Gen di truyền của gia đình',
    ],
    correctIndex: 2,
    explanation:
      'Nhân cách được hình thành thông qua chính hoạt động tích cực của chủ thể. Hoạt động và giao lưu là nhân tố quyết định trực tiếp.',
  },
  {
    id: 5,
    question: 'Vì sao khẳng định Giáo dục giữ vai trò "Chủ đạo" đối với sự hình thành nhân cách?',
    options: [
      'A. Vì giáo dục có thể thay thế hoàn toàn gen di truyền',
      'B. Vì giáo dục vạch ra phương hướng, đi trước định hướng sự phát triển và bù đắp khiếm khuyết',
      'C. Vì giáo dục quyết định 100% số phận của mỗi con người',
      'D. Vì học sinh chỉ nghe lời thầy cô giáo',
    ],
    correctIndex: 1,
    explanation:
      'Giáo dục giữ vai trò chủ đạo vì nó định hướng theo mục tiêu xã hội, đi trước sự phát triển (vùng phát triển gần nhất Vygotsky) và có thể thanh lọc tác động môi trường tiêu cực.',
  },
  {
    id: 6,
    question:
      'Ba chức năng xã hội cơ bản của giáo dục được phân loại trong Giáo trình GDH gồm những chức năng nào?',
    options: [
      'A. Dạy chữ, dạy người, dạy nghề',
      'B. Kinh tế - sản xuất, Chính trị - xã hội, Tư tưởng - văn hóa',
      'C. Giáo dục đạo đức, Giáo dục trí tuệ, Giáo dục thẩm mỹ',
      'D. Nhà trường, Gia đình, Xã hội',
    ],
    correctIndex: 1,
    explanation:
      'Giáo dục học mac-xit phân loại 3 chức năng xã hội vĩ mô: Kinh tế - sản xuất; Chính trị - xã hội; Tư tưởng - văn hóa.',
  },
  {
    id: 7,
    question: 'Điều 5 Luật Giáo dục 2019 khẳng định nguyên lý giáo dục nào sau đây?',
    options: [
      'A. Thầy đọc, trò chép; thi cử nghiêm túc',
      'B. Học đi đôi với hành, lý luận gắn liền với thực tiễn, giáo dục nhà trường kết hợp gia đình và xã hội',
      'C. Ưu tiên đào tạo mũi nhọn, học sinh giỏi quốc tế',
      'D. Xã hội hóa hoàn toàn chi phí giáo dục',
    ],
    correctIndex: 1,
    explanation:
      'Điều 5 Luật Giáo dục 2019 quy định: "Học đi đôi với hành, lý luận gắn liền với thực tiễn, giáo dục nhà trường kết hợp với giáo dục gia đình và giáo dục xã hội".',
  },
  {
    id: 8,
    question: 'Nhà giáo dục A.S. Makarenko nổi tiếng với nguyên tắc và phương pháp giáo dục nào?',
    options: [
      'A. Giáo dục trong tập thể và bằng tập thể (Phương pháp tác động song hành)',
      'B. Giáo dục tự do hoàn toàn không kỷ luật',
      'C. Giáo dục bằng trừng phạt roi vọt',
      'D. Giáo dục qua màn hình máy tính',
    ],
    correctIndex: 0,
    explanation:
      'Makarenko là bậc thầy về lý luận xây dựng tập thể học sinh và phương pháp tác động song hành (vừa tác động cá nhân vừa tác động qua dư luận tập thể).',
  },
  {
    id: 9,
    question:
      'Câu nói: "Yêu cầu càng cao bao nhiêu thì càng phải tôn trọng bấy nhiêu" thể hiện nguyên tắc giáo dục nào?',
    options: [
      'A. Nguyên tắc đảm bảo tính mục đích',
      'B. Nguyên tắc tôn trọng nhân cách kết hợp với yêu cầu cao đối với học sinh',
      'C. Nguyên tắc giáo dục vừa sức',
      'D. Nguyên tắc hệ thống liên tục',
    ],
    correctIndex: 1,
    explanation:
      'Đây là luận điểm kinh điển của A.S. Makarenko thuộc nguyên tắc tôn trọng nhân cách kết hợp với yêu cầu cao đối với học sinh.',
  },
  {
    id: 10,
    question:
      'Theo Thông tư 32/2020/TT-BGDĐT, giáo viên chủ nhiệm lớp ở trường trung học được quyền cho phép học sinh nghỉ học tối đa mấy ngày liên tục?',
    options: [
      'A. Không quá 01 ngày',
      'B. Không quá 03 ngày',
      'C. Không quá 05 ngày',
      'D. Không có quyền cho nghỉ',
    ],
    correctIndex: 1,
    explanation:
      'Khoản 2 Điều 29 Điều lệ trường trung học (TT 32/2020) quy định GVCN được quyền cho phép cá nhân học sinh nghỉ học có lý do không quá 03 ngày liên tục.',
  },
  {
    id: 11,
    question:
      'Theo lý thuyết Kỷ luật tích cực của Jane Nelsen, đâu KHÔNG PHẢI là một trong 4 động cơ tiềm ẩn đằng sau hành vi tiêu cực của học sinh?',
    options: [
      'A. Thu hút sự chú ý không chính đáng',
      'B. Tranh giành quyền lực',
      'C. Bản chất bẩm sinh xấu xa từ bé',
      'D. Trả đũa / trả thù',
    ],
    correctIndex: 2,
    explanation:
      'Lý thuyết Jane Nelsen khẳng định không có đứa trẻ nào bẩm sinh xấu xa. Bốn động cơ tiềm ẩn là: Thu hút chú ý, Tranh giành quyền lực, Trả thù, Tỏ ra bất lực.',
  },
  {
    id: 12,
    question:
      'Theo Chương trình GDPT 2018, Hoạt động trải nghiệm có thời lượng bắt buộc là bao nhiêu tiết trong một năm học?',
    options: ['A. 35 tiết/năm', 'B. 70 tiết/năm', 'C. 105 tiết/năm', 'D. 140 tiết/năm'],
    correctIndex: 2,
    explanation:
      'Chương trình GDPT 2018 quy định Hoạt động trải nghiệm (tiểu học) và HĐTN hướng nghiệp (trung học) có thời lượng bắt buộc là 105 tiết/năm học.',
  },
  {
    id: 13,
    question:
      'Chu trình học tập qua trải nghiệm của nhà tâm lý học David Kolb gồm bao nhiêu giai đoạn?',
    options: [
      'A. 3 giai đoạn',
      'B. 4 giai đoạn (Trải nghiệm cụ thể -> Quan sát phản tư -> Khái quát hóa -> Thử nghiệm tích cực)',
      'C. 5 giai đoạn',
      'D. 6 giai đoạn',
    ],
    correctIndex: 1,
    explanation:
      'Chu trình Kolb nổi tiếng gồm 4 giai đoạn: Trải nghiệm cụ thể -> Quan sát phản tư -> Khái quát hóa -> Thử nghiệm tích cực.',
  },
  {
    id: 14,
    question: 'Bốn mạch nội dung của Hoạt động trải nghiệm theo CT GDPT 2018 gồm:',
    options: [
      'A. Toán, Văn, Sử, Địa',
      'B. Bản thân, Xã hội, Tự nhiên, Hướng nghiệp',
      'C. Chào cờ, Sinh hoạt lớp, Lao động, Vui chơi',
      'D. Nhận thức, Thái độ, Kỹ năng, Hành vi',
    ],
    correctIndex: 1,
    explanation:
      'Bốn mạch nội dung xuyên suốt là: Hoạt động hướng vào bản thân; Hoạt động hướng đến xã hội; Hoạt động hướng đến tự nhiên; Hoạt động hướng nghiệp.',
  },
  {
    id: 15,
    question:
      'Khi xảy ra xung đột gay gắt giữa hai học sinh trong lớp, hành động đầu tiên giáo viên cần làm là gì?',
    options: [
      'A. Tát mỗi em một cái để răn đe ngay lập tức',
      'B. Đuổi cả hai em ra khỏi trường',
      'C. Giữ bình tĩnh, tách hai học sinh ra hai vị trí an toàn để làm nguội cảm xúc',
      'D. Gọi công an phường đến bắt giữ',
    ],
    correctIndex: 2,
    explanation:
      'Nguyên tắc xử lý tình huống khẩn cấp: Tách các bên xung đột ra hai không gian độc lập để làm nguội cảm xúc kích động, sau đó mới tiến hành xác minh khách quan.',
  },
  {
    id: 16,
    question:
      'Theo Thông tư 32/2020, hình thức kỷ luật nào sau đây ĐÃ BỊ LOẠI BỎ hoàn toàn đối với học sinh phổ thông?',
    options: [
      'A. Khiển trách trước lớp',
      'B. Đuổi học 1 năm học',
      'C. Tạm dừng học tập có thời hạn',
      'D. Nhắc nhở, hỗ trợ khắc phục khuyết điểm',
    ],
    correctIndex: 1,
    explanation:
      'Thông tư 32/2020 nhân văn hóa các biện pháp kỷ luật, bãi bỏ hình thức đuổi học 1 năm mang tính trừng phạt triệt đường học tập của học sinh.',
  },
  {
    id: 17,
    question:
      'Khi học sinh thú nhận bị người thân bạo hành gia đình nghiêm trọng, trách nhiệm pháp lý đầu tiên của giáo viên là gì?',
    options: [
      'A. Giữ bí mật tuyệt đối và không nói với ai',
      'B. Khuyên học sinh nên chịu đựng để giữ hòa khí gia đình',
      'C. Báo cáo Ban Giám hiệu, liên hệ Tổng đài bảo vệ trẻ em 111 và chính quyền địa phương can thiệp khẩn cấp',
      'D. Đăng bài lên mạng xã hội để xin viện trợ',
    ],
    correctIndex: 2,
    explanation:
      'Theo Luật Trẻ em 2016, giáo viên có nghĩa vụ pháp lý phải thông báo ngay cho cơ quan có thẩm quyền hoặc Tổng đài 111 khi phát hiện trẻ em bị bạo hành.',
  },
  {
    id: 18,
    question:
      'Trong dạy học môn Toán, việc cho học sinh giải bài toán tính lượng gạch cần mua để lát nền một căn phòng thực tế phản ánh nguyên lý giáo dục nào?',
    options: [
      'A. Học đi đôi với hành, lý luận gắn liền với thực tiễn',
      'B. Tôn trọng kết hợp yêu cầu cao',
      'C. Giáo dục trong tập thể',
      'D. Tính kế thừa và liên tục',
    ],
    correctIndex: 0,
    explanation:
      'Vận dụng kiến thức diện tích hình học để giải bài toán chi phí thực tế là minh chứng sinh động của nguyên lý "Học đi đôi với hành, lý luận gắn liền với thực tiễn".',
  },
  {
    id: 19,
    question:
      'Mục tiêu chung về phẩm chất học sinh trong Chương trình GDPT 2018 gồm 5 phẩm chất chủ yếu nào?',
    options: [
      'A. Cần, kiệm, liêm, chính, chí công vô tư',
      'B. Yêu nước, Nhân ái, Chăm chỉ, Trung thực, Trách nhiệm',
      'C. Tự tin, Tự trọng, Tự lực, Tự cường, Tự giác',
      'D. Thông minh, Dũng cảm, Khéo léo, Năng động, Sáng tạo',
    ],
    correctIndex: 1,
    explanation:
      'Khung CT GDPT 2018 xác định 5 phẩm chất chủ yếu cốt lõi: Yêu nước, Nhân ái, Chăm chỉ, Trung thực, Trách nhiệm.',
  },
  {
    id: 20,
    question:
      'Điểm số trong đánh giá theo định hướng phát triển năng lực của CT GDPT 2018 có ý nghĩa cốt lõi là gì?',
    options: [
      'A. Phân loại thứ bậc học sinh cao thấp để khen thưởng và trừng phạt',
      'B. Đánh giá vì sự tiến bộ của học sinh, phản hồi để người học tự điều chỉnh cách học và giáo viên đổi mới cách dạy',
      'C. Tạo áp lực để học sinh phải đi học thêm',
      'D. Thước đo duy nhất quyết định giá trị con người',
    ],
    correctIndex: 1,
    explanation:
      'Triết lý đánh giá hiện đại (Assessment for learning): Đánh giá không phải để xếp loại trừng phạt, mà là công cụ phản hồi vì sự tiến bộ không ngừng của người học.',
  },
];

// ============================================================================
// 2. COMPONENT THỰC HÀNH 2 (BÀI 6.2): THIẾT KẾ KẾ HOẠCH CHỦ NHIỆM VÀ KỊCH BẢN TIẾT SINH HOẠT LỚP
// ============================================================================

export const Lesson6_2View: FC = () => {
  const [expandedQuestionId, setExpandedQuestionId] = useState<number | null>(1);
  const [userAnswers, setUserAnswers] = useState<Record<number, number>>({});

  const caseStudy6_2: PedagogicalCaseStudy = {
    id: 602,
    title: 'Đổi mới tiết Sinh hoạt lớp từ "phiên tòa kiểm điểm" sang diễn đàn tự quản theo chủ đề',
    context:
      'Tại lớp 10A2, mỗi khi đến tiết Sinh hoạt lớp chiều thứ Sáu, không khí lớp học rất nặng nề vì giáo viên chủ nhiệm dành trọn 40 phút để đọc tên từng học sinh vi phạm nề nếp, trừ điểm thi đua và phạt chép phạt. Học sinh ngồi im chịu trận, Ban cán sự lớp chỉ làm nhiệm vụ "mách lẻo" lỗi của bạn.',
    question:
      'Vận dụng quy trình lập kế hoạch chủ nhiệm và kỹ thuật thiết kế tiết Sinh hoạt lớp tự quản (Giáo trình Giáo dục học HCMUE tr. 71–82), anh/chị hãy tái thiết kế tiết Sinh hoạt lớp này theo quy trình 5 bước.',
    principlesApplied: [
      'Chức năng cố vấn tự quản và Quy trình 6 bước lập kế hoạch chủ nhiệm (Giáo trình tr. 67–73)',
      'Loại hình Sinh hoạt lớp trong Chương trình GDPT 2018 (Giáo trình tr. 108–109)',
      'Nguyên tắc tôn trọng nhân cách học sinh và giáo dục trong tập thể',
    ],
    solutionSteps: [
      {
        step: 1,
        title: 'Bước 1: Nhận diện sự việc và xác định vấn đề cần giải quyết',
        content:
          'Tiết Sinh hoạt lớp đang bị biến tướng thành buổi kiểm điểm hành chính một chiều, làm mất chức năng tự quản của học sinh và không thực hiện được mạch nội dung giáo dục theo chủ đề.',
      },
      {
        step: 2,
        title: 'Bước 2: Thu thập thông tin và phân tích nguyên nhân theo lý luận Chương 4 & 5',
        content:
          'Theo Giáo trình HCMUE (tr. 71–77 & tr. 108–109), tiết Sinh hoạt lớp chuẩn phải gồm 2 phần cân đối: Phần 1 (15 phút) do Ban cán sự tự quản điều hành sơ kết tuần và lập kế hoạch tuần tới; Phần 2 (30 phút) tổ chức sinh hoạt theo chủ đề trải nghiệm hấp dẫn.',
      },
      {
        step: 3,
        title: 'Bước 3: Đề xuất các phương án giải quyết khả thi',
        content:
          'Phương án 1: Giảm thời gian phê bình xuống 25 phút, thời gian còn lại cho học sinh tự học. Phương án 2: Bồi dưỡng Ban cán sự điều hành kịch bản Sinh hoạt lớp 2 phần theo mô hình "3 khen – 1 góp ý xây dựng" kết hợp sinh hoạt chủ đề tháng.',
      },
      {
        step: 4,
        title: 'Bước 4: Lựa chọn phương án tối ưu và tổ chức thực hiện tác động sư phạm',
        content:
          'Triển khai Phương án 2: Hướng dẫn Lớp trưởng và các Tổ trưởng họp trù bị thứ Năm; trong tiết Sinh hoạt lớp, Ban cán sự tuyên dương các gương người tốt việc tốt trước, thảo luận giải pháp khắc phục hạn chế tuần qua, sau đó tổ chức hoạt động chủ đề (hái hoa dân chủ, diễn đàn nhỏ, chúc mừng sinh nhật tháng).',
      },
      {
        step: 5,
        title: 'Bước 5: Đánh giá kết quả, theo dõi hỗ trợ và rút kinh nghiệm sư phạm',
        content:
          'Sau tiết học, GVCN nhận xét ngắn gọn để khích lệ Ban cán sự và lấy phiếu phản hồi nhanh của học sinh để tiếp tục nâng cao chất lượng tiết Sinh hoạt lớp tuần tiếp theo.',
      },
    ],
    pitfallsToAvoid: [
      'GVCN độc thoại và phê bình cá nhân gay gắt suốt 45 phút tiết Sinh hoạt lớp.',
      'Giao trắng tiết Sinh hoạt lớp cho học sinh mà không hướng dẫn kịch bản trước.',
    ],
    coreLesson:
      'Tiết Sinh hoạt lớp phải là giờ học được học sinh mong đợi nhất trong tuần — nơi mỗi thành viên được lắng nghe, được ghi nhận sự tiến bộ và được rèn luyện năng lực tự quản.',
  };

  const handleToggleQuestion = (id: number) => {
    setExpandedQuestionId((prev) => (prev === id ? null : id));
  };

  const handleSelectQuizOption = (questionId: number, optionIndex: number) => {
    setUserAnswers((prev) => ({ ...prev, [questionId]: optionIndex }));
  };

  return (
    <div className="space-y-8 leading-relaxed text-[#29383D]">
      {/* 1. THANH METADATA & ĐỐI CHIẾU ĐẦU BÀI */}
      <PedagogyMetadataBar
        courseCode="EDUC2802"
        lessonCode="EDUC2802-PRACTICE-02"
        clos={['CLO8']}
        textbookPages="Chương 4 Giáo trình HCMUE (Trang 70 – 82)"
        legalRefs={[
          'Thông tư 32/2020/TT-BGDĐT (Điều 29, 31)',
          'Thông tư 20/2018/TT-BGDĐT (Tiêu chuẩn 3 & 4)',
          'Đề cương chi tiết EDUC2802 (K50–51)',
        ]}
        sessionNote="Thực hành 2 · 6 tiết thực hành · Kế hoạch chủ nhiệm & Sinh hoạt lớp"
      />

      {/* CỤM NÚT TÁC VỤ (TEXT THUẦN TÚY) */}
      <div className="flex flex-wrap items-center gap-2 rounded-xl border border-[#CFDADB] bg-[#F7FAFA] px-4 py-2.5 text-xs text-[#55676B] shadow-2xs">
        {['Đánh dấu hoàn thành', 'Lưu bài', 'Ghi chú', 'Thuật ngữ: Bật'].map((actionText) => (
          <button
            type="button"
            key={actionText}
            className="rounded-lg border border-[#CFDADB] bg-[#E1E9EA]/60 px-3 py-1 font-medium text-[#29383D] transition-colors hover:bg-[#CFDADB]"
          >
            {actionText}
          </button>
        ))}
      </div>

      {/* ==================================================================== */}
      {/* PHẦN I: THỰC HÀNH LẬP KẾ HOẠCH CHỦ NHIỆM & THIẾT KẾ TIẾT SINH HOẠT LỚP */}
      {/* ==================================================================== */}
      <section className="space-y-6">
        <div className="flex items-center gap-2 border-b border-[#CFDADB] pb-2 font-serif text-xl font-bold text-[#29383D]">
          <FileText className="h-5 w-5 text-[#3F6570]" />
          <h2 id="1-ma-tran-de-thi">
            1. Thực hành Lập Kế hoạch Giáo dục Lớp Chủ nhiệm & Ma trận Đề thi Tự luận
          </h2>
        </div>

        <div className="text-sm text-[#29383D]">
          Bài Thực hành 2 trang bị cho sinh viên quy trình thực chiến lập{' '}
          <strong>Kế hoạch giáo dục lớp chủ nhiệm theo 6 bước</strong> (Giáo trình HCMUE tr. 71–73),
          cấu trúc kịch bản <strong>tiết Sinh hoạt lớp tự quản 45 phút</strong>, đồng thời tích hợp{' '}
          <strong>Ma trận Đề thi & Phương pháp Làm bài Tự luận Đạt Điểm Cao</strong> cho toàn học
          phần <code>EDUC2802</code>.
          <Sidenote number={1} type="pedagogy" title="Cấu trúc 2 phần của tiết Sinh hoạt lớp">
            Một kịch bản tiết Sinh hoạt lớp đạt chuẩn luôn kết hợp hài hòa giữa phần Sơ kết – Lập kế
            hoạch tuần do Ban cán sự tự quản điều hành (15 phút) và phần Sinh hoạt theo chủ đề giáo
            dục/trải nghiệm (30 phút).
          </Sidenote>
        </div>

        {/* CẤU TRÚC BẢN KẾ HOẠCH GIÁO DỤC LỚP CHỦ NHIỆM (KHUNG 6 PHẦN CHUẨN) */}
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#CFDADB] pb-2">
            <h3 className="font-serif text-lg font-bold text-[#3F6570]">
              Cấu trúc Bản Kế hoạch Giáo dục Lớp Chủ nhiệm (Khung 6 Phần Chuẩn)
            </h3>
            <Badge variant="subject">Chuẩn Giáo trình HCMUE tr. 71–73</Badge>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {HOMEROOM_PLAN_6_PARTS.map((sec) => (
              <div
                key={sec.sectionNumber}
                className="space-y-3 rounded-2xl border border-[#CFDADB] bg-[#F7FAFA] p-5 shadow-2xs"
              >
                <div className="flex items-center justify-between">
                  <span className="rounded-md border border-[#CFDADB] bg-[#E1E9EA]/60 px-2 py-0.5 font-mono text-xs font-bold text-[#3F6570]">
                    {sec.badge}
                  </span>
                  <span className="font-mono text-xs font-bold text-[#55676B]">
                    0{sec.sectionNumber}
                  </span>
                </div>
                <h4 className="font-serif text-base font-bold text-[#29383D]">{sec.title}</h4>
                <p className="text-xs leading-relaxed text-[#55676B]">{sec.description}</p>
                <div className="space-y-1">
                  <span className="text-[11px] font-bold tracking-wider text-[#3F6570] uppercase">
                    Các thành phần bắt buộc:
                  </span>
                  <ul className="list-disc space-y-1 pl-4 text-xs text-[#29383D]">
                    {sec.keyComponents.map((comp, cIdx) => (
                      <li key={cIdx}>{comp}</li>
                    ))}
                  </ul>
                </div>
                <div className="rounded-lg border border-[#718C7E]/30 bg-[#E8EFEB]/60 p-2.5 text-xs text-[#29383D]">
                  <span className="font-bold text-[#3F6570]">Ví dụ thực tế Lớp 10A1: </span>
                  {sec.concreteExample}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* TIẾP NỐI: KỊCH BẢN CHI TIẾT TIẾT SINH HOẠT LỚP CHUẨN MỰC (45 PHÚT) */}
        <div className="space-y-4 pt-2">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#CFDADB] pb-2">
            <h3 className="font-serif text-lg font-bold text-[#3F6570]">
              Kịch bản Chi tiết Tiết Sinh hoạt Lớp Chuẩn Mực (45 phút)
            </h3>
            <Badge variant="subject">Hai Phần Chuẩn: 15p Hành chính + 30p Trải nghiệm</Badge>
          </div>

          <div className="space-y-3">
            {HOMEROOM_MEETING_SCRIPT_45MIN.map((act, actIdx) => (
              <div
                key={actIdx}
                className="space-y-2 rounded-xl border border-[#CFDADB] bg-[#F7FAFA] p-4 shadow-2xs"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="rounded-md bg-[#3F6570] px-2 py-0.5 font-mono text-xs font-bold text-white">
                      {act.timeRange}
                    </span>
                    <h4 className="font-serif text-sm font-bold text-[#29383D]">
                      {act.activityName}
                    </h4>
                  </div>
                  <span className="rounded-md border border-[#CFDADB] bg-[#E1E9EA]/60 px-2 py-0.5 text-xs font-medium text-[#55676B]">
                    Phụ trách: {act.inCharge}
                  </span>
                </div>
                <p className="text-xs leading-relaxed text-[#29383D]">
                  <strong>Nội dung & Cách tiến hành:</strong> {act.contentAndMethod}
                </p>
                <div className="grid gap-2 text-xs sm:grid-cols-2">
                  <div className="rounded-lg border border-[#CFDADB] bg-white p-2.5 dark:border-[#1E362A] dark:bg-[#12241C]">
                    <span className="font-semibold text-[#3F6570] dark:text-[#C5A262]">
                      Hành động của học sinh:{' '}
                    </span>
                    <span className="text-[#55676B] dark:text-[#A8C4B5]">{act.studentAction}</span>
                  </div>
                  <div className="rounded-lg border border-[#718C7E]/30 bg-[#E8EFEB]/60 p-2.5 dark:border-[#2C4D3B] dark:bg-[#142A20]">
                    <span className="font-semibold text-[#718C7E] dark:text-[#C5A262]">
                      Kết quả kỳ vọng:{' '}
                    </span>
                    <span className="text-[#29383D] dark:text-[#D1E0D7]">
                      {act.expectedOutcome}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <NumberedProcessFlow
          title="Cấu trúc 4 Pha Thiết kế Kịch bản Tiết Sinh hoạt Lớp Tự quản (45 phút)"
          subtitle="Mô hình chuẩn áp dụng cho thực hành công tác chủ nhiệm lớp ở trường THCS và THPT."
          badge="4 Pha Thiết kế"
          columns={2}
          steps={[
            {
              number: 1,
              title: 'Pha 1: Công tác chuẩn bị trước giờ Sinh hoạt lớp (Thứ Năm hàng tuần)',
              badge: 'Họp trù bị Ban cán sự',
              description:
                'GVCN họp nhanh 10 phút với Lớp trưởng, các Lớp phó, Bí thư Chi đoàn và Tổ trưởng để tổng hợp số liệu chuyên cần, học tập, rèn luyện và thống nhất kịch bản điều hành.',
            },
            {
              number: 2,
              title: 'Pha 2: Sơ kết tuần qua và thảo luận phương hướng tuần tới (15 phút đầu giờ)',
              badge: 'Học sinh tự quản điều hành',
              description:
                'Lớp trưởng điều hành: các Tổ trưởng và Lớp phó báo cáo ưu điểm nổi bật, tuyên dương cá nhân/tổ xuất sắc và góp ý khắc phục hạn chế trên tinh thần kỷ luật tích cực.',
            },
            {
              number: 3,
              title: 'Pha 3: Sinh hoạt theo chủ đề giáo dục / trải nghiệm tuần (30 phút trọng tâm)',
              badge: 'Hoạt động trải nghiệm chủ đề',
              description:
                'Tổ trực tuần hoặc BCH Chi đoàn tổ chức hoạt động theo chủ đề tháng (diễn đàn mini, xử lí tình huống đạo đức, trò chơi gắn kết tập thể, định hướng nghề nghiệp).',
            },
            {
              number: 4,
              title: 'Pha 4: Ý kiến cố vấn của GVCN và cam kết hành động (5 phút cuối giờ)',
              badge: 'Định hướng & Khích lệ',
              description:
                'GVCN tổng kết ngắn gọn, ghi nhận nỗ lực tự quản của Ban cán sự, giải đáp kiến nghị của học sinh và truyền cảm hứng cho mục tiêu tuần học mới.',
            },
          ]}
        />

        <ComparativeTable
          title="Khung Mẫu Kế hoạch Giáo dục Lớp Chủ nhiệm Năm học / Tháng (Giáo trình HCMUE tr. 71–73)"
          subtitle="Cấu trúc hồ sơ thực hành lập kế hoạch chủ nhiệm đáp ứng chuẩn đầu ra CLO8."
          badge="Hồ sơ Kế hoạch Chủ nhiệm"
          columns={[
            { key: 'category', header: 'Hạng mục kế hoạch', widthClass: 'w-1/4' },
            { key: 'content', header: 'Nội dung chi tiết cần trình bày trong hồ sơ' },
            { key: 'indicators', header: 'Chỉ báo kiểm tra & Minh chứng', widthClass: 'w-1/3' },
          ]}
          rows={[
            {
              category: 'I. Căn cứ xây dựng kế hoạch',
              content:
                'Căn cứ Kế hoạch năm học của nhà trường, Kế hoạch công tác Đoàn/Đội và đặc điểm tình hình thực tế của lớp chủ nhiệm (sĩ số, cơ cấu học lực, hạnh kiểm, hoàn cảnh đặc biệt).',
              indicators: 'Bảng thống kê phân loại học sinh đầu năm và biên bản họp lớp/họp CMHS.',
            },
            {
              category: 'II. Mục tiêu phấn đấu của lớp',
              content:
                'Chỉ tiêu cụ thể về: (1) Rèn luyện 5 phẩm chất; (2) Kết quả học tập các môn và 10 năng lực; (3) Nề nếp chuyên cần, an toàn học đường; (4) Danh hiệu thi đua tập thể.',
              indicators:
                'Hệ thống chỉ tiêu định lượng và định tính khả thi, phù hợp đặc điểm lớp.',
            },
            {
              category: 'III. Nội dung và biện pháp trọng tâm',
              content:
                'Thiết kế biện pháp cho 4 mảng: Xây dựng tập thể tự quản; Tổ chức học tập & phụ đạo/bồi dưỡng; Tổ chức hoạt động trải nghiệm; Phối hợp GV bộ môn, Đoàn/Đội và CMHS.',
              indicators: 'Bảng phân công nhiệm vụ Ban cán sự và sơ đồ mạng lưới phối hợp.',
            },
            {
              category: 'IV. Lịch trình hoạt động theo tháng/tuần',
              content:
                'Ma trận kế hoạch từng tháng (từ tháng 9 đến tháng 5): Chủ đề tháng -> Hoạt động trọng tâm -> Thời gian -> Lực lượng phụ trách -> Điều kiện thực hiện.',
              indicators: 'Sổ chủ nhiệm, biên bản tiết Sinh hoạt lớp và sản phẩm hoạt động tháng.',
            },
          ]}
        />

        <LegalReferenceBox
          documentTitle="Thông tư số 32/2020/TT-BGDĐT (Điều lệ trường THCS, THPT và trường phổ thông có nhiều cấp học)"
          article="Điều 29 — Nhiệm vụ lập kế hoạch giáo dục của Giáo viên chủ nhiệm"
          quote="Giáo viên chủ nhiệm có nhiệm vụ tìm hiểu và nắm vững học sinh trong lớp về mọi mặt để có biện pháp tổ chức giáo dục sát đối tượng, nhằm thúc đẩy sự tiến bộ của cả lớp và của từng học sinh; xây dựng kế hoạch các hoạt động giáo dục thể hiện rõ mục tiêu, nội dung, phương pháp giáo dục bảo đảm tính khả thi."
          pedagogicalAnalysis="Kế hoạch giáo dục của GVCN không phải là văn bản hành chính đối phó mà là bản thiết kế sư phạm toàn diện, kết nối kế hoạch năm học của nhà trường với nhu cầu phát triển thực tế của từng học sinh trong lớp."
        />

        <div className="grid gap-5 md:grid-cols-2">
          {/* Cấu trúc ma trận */}
          <div className="space-y-3 rounded-xl border border-[#CFDADB] bg-[#F7FAFA] p-5 shadow-xs sm:p-6">
            <h3 className="flex items-center gap-2 text-base font-bold tracking-wide text-[#29383D] uppercase">
              <Calendar className="h-4 w-4 text-[#3F6570]" />
              Cấu trúc Đề thi Tự luận Chuẩn (90 phút)
            </h3>
            <ul className="space-y-3 text-[16px] leading-relaxed text-[#29383D] sm:text-[16.5px]">
              <li className="flex items-start gap-2.5">
                <span className="shrink-0 font-bold text-[#3F6570]">Câu 1 (2.0 đ):</span>
                <span>
                  Lý luận giáo dục nền tảng: Hoạt động sư phạm / 3 Chức năng xã hội / Vai trò chủ
                  đạo của giáo dục (Chương 1 – 2).
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="shrink-0 font-bold text-[#3F6570]">Câu 2 (2.0 đ):</span>
                <span>
                  Văn bản pháp quy: Luật Giáo dục 2019 / Thông tư 20/2018 Chuẩn nghề nghiệp / Điều
                  lệ trường học 2020.
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="shrink-0 font-bold text-[#3F6570]">Câu 3 (2.5 đ):</span>
                <span>
                  Hệ thống 6 nguyên tắc, 3 nhóm phương pháp giáo dục & Nghiệp vụ GVCN (Chương 3 –
                  4).
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="shrink-0 font-bold text-[#3F6570]">Câu 4 (3.5 đ):</span>
                <span>
                  Tổ chức Hoạt động trải nghiệm, hướng nghiệp (Chương 5) hoặc Xử lý tình huống sư
                  phạm theo quy trình 5 bước.
                </span>
              </li>
            </ul>
          </div>

          {/* Tiêu chuẩn vàng đạt điểm 9-10 */}
          <div className="space-y-3 rounded-xl border border-[#718C7E]/40 bg-[#E8EFEB] p-5 shadow-xs sm:p-6">
            <h3 className="flex items-center gap-2 text-base font-bold tracking-wide text-[#29383D] uppercase">
              <Sparkles className="h-4 w-4 text-[#3F6570]" />
              Tiêu chuẩn Vàng Đạt Điểm 9 – 10
            </h3>
            <ul className="space-y-3 text-[16px] leading-relaxed text-[#29383D] sm:text-[16.5px]">
              <li className="flex items-start gap-2.5">
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-[#3F6570] font-serif text-xs font-bold text-white">
                  01
                </span>
                <span>
                  <strong>Khái niệm chuẩn xác:</strong> Nắm vững định nghĩa gốc trong Giáo trình
                  HCMUE và trích dẫn chuẩn số hiệu văn bản pháp quy (Điều, Khoản).
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-[#3F6570] font-serif text-xs font-bold text-white">
                  02
                </span>
                <span>
                  <strong>Luận cứ logic, đa chiều:</strong> Trình bày mạch lạc theo cấu trúc luận
                  điểm rõ ràng, giải thích bản chất vì sao trước khi nêu hiện tượng.
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-[#3F6570] font-serif text-xs font-bold text-white">
                  03
                </span>
                <span>
                  <strong>Liên hệ thực tiễn ngành Sư phạm Toán:</strong> Minh họa bằng tình huống
                  dạy học hình học, đại số hoặc xử lý vi phạm trong giờ Toán để gây ấn tượng mạnh
                  với giám khảo.
                </span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* ==================================================================== */}
      {/* PHẦN II: 10 CÂU HỎI TỰ LUẬN ÔN TẬP KINH ĐIỂN VÀ BAREM ĐIỂM */}
      {/* ==================================================================== */}
      <section className="space-y-6">
        <div className="flex flex-col gap-2 border-b border-[#CFDADB] pb-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-[#3F6570]" />
            <h2 id="2-10-cau-hoi-tu-luan" className="font-serif text-xl font-bold text-[#29383D]">
              2. Tuyển tập 10 Câu hỏi Tự luận Kinh điển & Barem Điểm Chi tiết
            </h2>
          </div>
          <Badge variant="subject">Bao quát toàn bộ 5 Chương lý thuyết</Badge>
        </div>

        <div className="space-y-4">
          {ESSAY_EXAM_QUESTIONS.map((item) => {
            const isExpanded = expandedQuestionId === item.id;
            return (
              <div
                key={item.id}
                className="overflow-hidden rounded-2xl border border-[#CFDADB] bg-[#F7FAFA] shadow-xs transition-all hover:border-[#718C7E] dark:border-[#1E362A] dark:bg-[#122018]"
              >
                <button
                  type="button"
                  onClick={() => handleToggleQuestion(item.id)}
                  className="flex w-full cursor-pointer items-center justify-between gap-4 p-5 text-left transition-colors hover:bg-[#EAF0F1]/70 sm:p-6 dark:hover:bg-[#162920]"
                >
                  <div className="flex items-center gap-3">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#3F6570] font-serif text-sm font-bold text-white shadow-2xs dark:bg-[#2C4D3B]">
                      {item.id}
                    </span>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-[#3F6570] dark:text-[#C5A262]">
                          [{item.chapterOrigin}]
                        </span>
                        <span className="text-xs text-[#55676B] dark:text-[#A8C4B5]">
                          · {item.clos}
                        </span>
                        <span className="rounded bg-[#E1E9EA] px-2 py-0.5 text-xs font-bold text-[#29383D] dark:bg-[#1E362A] dark:text-[#D1E0D7]">
                          {item.points.toFixed(1)} điểm
                        </span>
                      </div>
                      <h3 className="mt-1 text-base font-bold text-[#29383D] sm:text-lg dark:text-[#F1F5F3]">
                        {item.title}
                      </h3>
                    </div>
                  </div>

                  <div className="flex shrink-0 items-center gap-2">
                    <span className="hidden text-sm font-medium text-[#55676B] sm:inline dark:text-[#A8C4B5]">
                      {isExpanded ? 'Thu gọn dàn ý' : 'Xem dàn ý chuẩn'}
                    </span>
                    {isExpanded ? (
                      <ChevronUp className="h-5 w-5 text-[#3F6570] dark:text-[#C5A262]" />
                    ) : (
                      <ChevronDown className="h-5 w-5 text-[#55676B] dark:text-[#A8C4B5]" />
                    )}
                  </div>
                </button>

                {isExpanded && (
                  <div className="accordion-content mt-3 space-y-5 rounded-xl border border-transparent bg-zinc-50 p-4 text-zinc-800 md:p-5 dark:border dark:border-[#1E362A] dark:bg-[#0E1A14] dark:text-[#D1E0D7]">
                    <div className="rounded-xl border border-[#CFDADB] bg-[#F7FAFA] p-5 shadow-2xs dark:border-[#1E362A] dark:bg-[#12241C]">
                      <div className="text-xs font-bold text-[#3F6570] uppercase dark:text-[#C5A262]">
                        Đề bài chi tiết:
                      </div>
                      <p className="mt-2 text-[16px] leading-relaxed font-semibold text-[#29383D] sm:text-[17px] dark:text-[#F1F5F3]">
                        {item.questionText}
                      </p>
                    </div>

                    <div className="space-y-4">
                      <div className="text-xs font-bold tracking-wider text-[#3F6570] uppercase dark:text-[#C5A262]">
                        Dàn ý trả lời & Barem điểm chi tiết:
                      </div>
                      {item.outlineSections.map((sec, sIdx) => (
                        <div
                          key={sIdx}
                          className="space-y-2 rounded-xl border border-[#CFDADB] bg-[#F7FAFA] p-4 shadow-2xs dark:border-[#1E362A] dark:bg-[#12241C]"
                        >
                          <div className="flex items-center justify-between border-b border-[#CFDADB] pb-2 text-sm font-bold text-[#29383D] dark:border-[#1E362A] dark:text-[#F1F5F3]">
                            <span>{sec.sectionTitle}</span>
                            <span className="text-xs font-semibold text-[#3F6570] dark:text-[#C5A262]">
                              {sec.pointsAllocation}
                            </span>
                          </div>
                          <ul className="list-disc space-y-1.5 pl-5 text-[15px] leading-relaxed text-[#29383D] sm:text-[15.5px] dark:text-[#A8C4B5]">
                            {sec.contentItems.map((ci, cIdx) => (
                              <li key={cIdx}>{ci}</li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>

                    {item.teachingMathContext && (
                      <div className="rounded-xl border border-[#718C7E]/40 bg-[#E8EFEB] p-4 text-[#29383D] dark:border-[#2C4D3B] dark:bg-[#142A20] dark:text-[#D1E0D7]">
                        <div className="text-xs font-bold text-[#3F6570] uppercase dark:text-[#C5A262]">
                          Gợi ý liên hệ Bộ môn Sư phạm Toán (Điểm cộng sáng tạo):
                        </div>
                        <p className="mt-1 text-[15px] leading-relaxed text-[#29383D] italic dark:text-[#A8C4B5]">
                          {item.teachingMathContext}
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* ==================================================================== */}
      {/* PHẦN III: BỘ 20 CÂU HỎI TRẮC NGHIỆM KHÁCH QUAN ÔN TẬP CUỐI KỲ */}
      {/* ==================================================================== */}
      <section className="space-y-6">
        <div className="flex flex-col gap-2 border-b border-[#CFDADB] pb-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-[#3F6570]" />
            <h2 id="3-trac-nghiem-on-tap" className="font-serif text-xl font-bold text-[#29383D]">
              3. Bộ 20 Câu hỏi Trắc nghiệm Khách quan Ôn tập Cuối kỳ
            </h2>
          </div>
          <Badge variant="subject">Tự luyện & Phản hồi Tức thì</Badge>
        </div>

        <div className="space-y-6">
          {QUIZ_20_QUESTIONS.map((q) => {
            const selectedOpt = userAnswers[q.id];
            const isAnswered = selectedOpt !== undefined;
            const isCorrect = selectedOpt === q.correctIndex;

            return (
              <div
                key={q.id}
                className="space-y-4 rounded-2xl border border-[#CFDADB] bg-[#F7FAFA] p-5 shadow-xs sm:p-6"
              >
                <div className="flex items-start gap-3">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#3F6570] font-serif text-sm font-bold text-white shadow-2xs">
                    {q.id}
                  </span>
                  <div className="text-base leading-snug font-bold text-[#29383D] sm:text-lg">
                    {q.question}
                  </div>
                </div>

                <div className="grid gap-2.5 sm:grid-cols-2">
                  {q.options.map((opt, optIdx) => {
                    let optStyle =
                      'border-[#CFDADB] bg-[#EAF0F1]/60 text-[#29383D] hover:bg-[#E1E9EA]';

                    if (isAnswered) {
                      if (optIdx === q.correctIndex) {
                        optStyle = 'border-[#4F7967] bg-[#4F7967]/15 font-semibold text-[#4F7967]';
                      } else if (selectedOpt === optIdx) {
                        optStyle = 'border-[#A65D59] bg-[#A65D59]/15 text-[#A65D59]';
                      } else {
                        optStyle = 'border-[#CFDADB] bg-[#F7FAFA] opacity-50 text-[#55676B]';
                      }
                    }

                    return (
                      <button
                        key={optIdx}
                        type="button"
                        onClick={() => handleSelectQuizOption(q.id, optIdx)}
                        className={`flex w-full cursor-pointer items-center justify-between rounded-xl border p-3.5 text-left text-sm leading-relaxed transition-all sm:text-[15px] ${optStyle}`}
                      >
                        <span>{opt}</span>
                        {isAnswered && optIdx === q.correctIndex && (
                          <CheckCircle2 className="h-5 w-5 shrink-0 text-[#4F7967]" />
                        )}
                        {isAnswered && selectedOpt === optIdx && !isCorrect && (
                          <XCircle className="h-5 w-5 shrink-0 text-[#A65D59]" />
                        )}
                      </button>
                    );
                  })}
                </div>

                {isAnswered && (
                  <div
                    className={`rounded-xl border p-4 text-sm leading-relaxed transition-all ${
                      isCorrect
                        ? 'border-[#4F7967]/40 bg-[#4F7967]/10 text-[#29383D]'
                        : 'border-[#987343]/40 bg-[#987343]/10 text-[#29383D]'
                    }`}
                  >
                    <div className="font-bold">{isCorrect ? 'Chính xác!' : 'Chưa chính xác!'}</div>
                    <div className="mt-1 text-[14.5px]">{q.explanation}</div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* ==================================================================== */}
      {/* PHẦN IV: TÌNH HUỐNG THỰC HÀNH THIẾT KẾ TIẾT SINH HOẠT LỚP */}
      {/* ==================================================================== */}
      <section className="space-y-4">
        <div className="flex items-center gap-2 border-b border-[#CFDADB] pb-2 font-serif text-xl font-bold text-[#29383D]">
          <HelpCircle className="h-5 w-5 text-[#3F6570]" />
          <h2 id="4-tinh-huong-thuc-hanh-chu-nhiem">
            4. Tình huống Thực hành Thiết kế Tiết Sinh hoạt Lớp (CLO8)
          </h2>
        </div>
        <CaseStudyBox caseStudy={caseStudy6_2} />
      </section>
    </div>
  );
};

// ============================================================================
// 3. COMPONENT THỰC HÀNH 3 (BÀI 6.3): THIẾT KẾ KẾ HOẠCH CHỦ ĐỀ HOẠT ĐỘNG TRẢI NGHIỆM, HƯỚNG NGHIỆP
// ============================================================================

export const Lesson6_3View: FC = () => {
  const caseStudy6_3: PedagogicalCaseStudy = {
    id: 603,
    title:
      'Điều chỉnh kế hoạch chủ đề Hoạt động trải nghiệm, hướng nghiệp khi điều kiện thực tế thay đổi',
    context:
      'Tổ giáo viên khối 10 đã thiết kế chủ đề Hoạt động trải nghiệm, hướng nghiệp tháng 3: "Tham quan và tìm hiểu quy trình sản xuất tại Khu Công nghệ cao" (thuộc phương thức Khám phá ngoài nhà trường). Tuy nhiên, sát ngày tổ chức thì thời tiết mưa bão kéo dài và doanh nghiệp thông báo tạm dừng đón đoàn khách tham quan.',
    question:
      'Vận dụng quy trình thiết kế chủ đề HĐTN, HN (Giáo trình Giáo dục học HCMUE tr. 116–124 và Tài liệu bồi dưỡng Mô đun 2 THPT), anh/chị hãy xử lí tình huống và điều chỉnh kế hoạch theo quy trình 5 bước.',
    principlesApplied: [
      'Quy trình thiết kế và điều kiện tổ chức Hoạt động trải nghiệm, hướng nghiệp (Giáo trình tr. 114–124)',
      'Linh hoạt chuyển đổi giữa 4 nhóm phương thức tổ chức HĐTN (Khám phá -> Thể nghiệm, tương tác & Nghiên cứu)',
      'Nguyên tắc đảm bảo tính mục đích và an toàn tuyệt đối cho học sinh',
    ],
    solutionSteps: [
      {
        step: 1,
        title: 'Bước 1: Nhận diện sự việc và xác định vấn đề cần giải quyết',
        content:
          'Hoạt động tham quan thực địa ngoài trường không thể diễn ra do yếu tố khách quan (thời tiết và đối tác), đòi hỏi phải kích hoạt phương án dự phòng ngay tại trường mà vẫn giữ nguyên Yêu cầu cần đạt về năng lực định hướng nghề nghiệp.',
      },
      {
        step: 2,
        title: 'Bước 2: Thu thập thông tin và phân tích nguyên nhân theo Tài liệu Mô đun 2',
        content:
          'Theo Tài liệu Mô đun 2 THPT và Giáo trình HCMUE (tr. 116–124), mục tiêu cốt lõi của chủ đề là giúp học sinh tìm hiểu yêu cầu nghề nghiệp và phẩm chất người lao động thời đại số; hình thức tham quan là phương tiện chứ không phải mục đích duy nhất.',
      },
      {
        step: 3,
        title: 'Bước 3: Đề xuất các phương án giải quyết khả thi',
        content:
          'Phương án 1: Hủy bỏ hoàn toàn chủ đề hướng nghiệp tháng 3 và cho học sinh nghỉ. Phương án 2: Chuyển đổi sang hình thức "Diễn đàn Tọa đàm Hướng nghiệp Trực tiếp kết hợp Trực tuyến (Virtual Tour)" ngay tại Hội trường nhà trường.',
      },
      {
        step: 4,
        title: 'Bước 4: Lựa chọn phương án tối ưu và tổ chức thực hiện tác động sư phạm',
        content:
          'Thực hiện Phương án 2 theo tiến trình 4 hoạt động: (1) Khởi động: Trò chơi nhận diện xu hướng nghề nghiệp 4.0; (2) Khám phá: Xem video Virtual Tour dây chuyền sản xuất và kết nối giao lưu trực tuyến 30 phút với kỹ sư của Khu Công nghệ cao; (3) Luyện tập: Các nhóm thiết kế Infographic "Hồ sơ năng lực nghề nghiệp tương lai"; (4) Vận dụng: Xây dựng kế hoạch rèn luyện môn học tổ hợp STEM cá nhân.',
      },
      {
        step: 5,
        title: 'Bước 5: Đánh giá kết quả, theo dõi hỗ trợ và rút kinh nghiệm sư phạm',
        content:
          'Đánh giá sản phẩm Infographic của các nhóm bằng Rubric và rút kinh nghiệm luôn xây dựng "Phương án B (Trong nhà trường)" khi thiết kế các chủ đề HĐTN ngoài trường.',
      },
    ],
    pitfallsToAvoid: [
      'Cố tình tổ chức đi tham quan bất chấp thời tiết mưa bão gây nguy hiểm cho học sinh.',
      'Khi hủy chuyến tham quan thì biến giờ HĐTN thành giờ tự học trống không có hoạt động thay thế.',
    ],
    coreLesson:
      'Một bản kế hoạch chủ đề Hoạt động trải nghiệm, hướng nghiệp chuyên nghiệp luôn bám chặt vào Yêu cầu cần đạt (Mục tiêu năng lực) và có phương án dự phòng linh hoạt trước mọi biến động của điều kiện thực tế.',
  };

  return (
    <div className="space-y-8 leading-relaxed text-[#29383D]">
      {/* 1. THANH METADATA & ĐỐI CHIẾU ĐẦU BÀI */}
      <PedagogyMetadataBar
        courseCode="EDUC2802"
        lessonCode="EDUC2802-PRACTICE-03"
        clos={['CLO9']}
        textbookPages="Chương 5 Giáo trình HCMUE (Trang 116 – 124) & Mô đun 2"
        legalRefs={[
          'Thông tư 32/2018/TT-BGDĐT (CT HĐTN & HĐTN, HN)',
          'Công văn 5512/BGDĐT-GDTrH (Xây dựng kế hoạch bài dạy)',
          '12.HDTN_tai-lieu-THPT_9.10.20-24h.pdf (Mô đun 2 THPT)',
        ]}
        sessionNote="Thực hành 3 · 6 tiết thực hành · Thiết kế Kế hoạch Chủ đề HĐTN"
      />

      {/* CỤM NÚT TÁC VỤ (TEXT THUẦN TÚY) */}
      <div className="flex flex-wrap items-center gap-2 rounded-xl border border-[#CFDADB] bg-[#F7FAFA] px-4 py-2.5 text-xs text-[#55676B] shadow-2xs">
        {['Đánh dấu hoàn thành', 'Lưu bài', 'Ghi chú', 'Thuật ngữ: Bật'].map((actionText) => (
          <button
            type="button"
            key={actionText}
            className="rounded-lg border border-[#CFDADB] bg-[#E1E9EA]/60 px-3 py-1 font-medium text-[#29383D] transition-colors hover:bg-[#CFDADB]"
          >
            {actionText}
          </button>
        ))}
      </div>

      {/* ==================================================================== */}
      {/* PHẦN I: TÍCH HỢP TÀI LIỆU MÔ ĐUN 2 & KHUNG KẾ HOẠCH BÀI DẠY CHUẨN CÔNG VĂN 5512 */}
      {/* ==================================================================== */}
      <section className="space-y-4">
        <div className="flex items-center gap-2 border-b border-[#CFDADB] pb-2 font-serif text-xl font-bold text-[#29383D]">
          <Layers className="h-5 w-5 text-[#3F6570]" />
          <h2 id="1-doi-sanh-mo-dun-2-thcs-thpt">
            1. Tích hợp Tài liệu Mô đun 2: Đặc thù Thiết kế Chủ đề HĐTN, HN cấp THCS và THPT
          </h2>
        </div>

        <div className="text-sm text-[#29383D]">
          Dựa trên <strong>Giáo trình Giáo dục học HCMUE (tr. 116–124)</strong> và bộ đôi tài liệu
          bồi dưỡng giáo viên phổ thông cốt cán{' '}
          <strong>Mô đun 2 cấp THCS và cấp THPT của Bộ GD&ĐT</strong>, việc thiết kế kế hoạch chủ đề
          Hoạt động trải nghiệm, hướng nghiệp phải phản ánh rõ sự phân hóa mục tiêu giữa giai đoạn
          giáo dục cơ bản (THCS) và giai đoạn giáo dục định hướng nghề nghiệp (THPT).
          <Sidenote
            number={1}
            type="pedagogy"
            title="Điểm cốt lõi của Tài liệu Mô đun 2 THCS & THPT"
          >
            Tài liệu Mô đun 2 nhấn mạnh: Mỗi hoạt động trong chủ đề HĐTN phải thể hiện rõ chuỗi tác
            động sư phạm (Khởi động -&gt; Khám phá/Chiêm nghiệm -&gt; Rèn luyện kỹ năng -&gt; Vận
            dụng/Mở rộng) và phải chỉ rõ sản phẩm học tập cụ thể có thể quan sát, đánh giá được.
          </Sidenote>
        </div>

        <ComparativeTable
          title="Bảng Đối sánh Thiết kế Chủ đề HĐTN, HN giữa Cấp THCS và Cấp THPT (Tài liệu Mô đun 2 & Giáo trình tr. 84–124)"
          subtitle="Căn cứ để sinh viên lựa chọn đúng trọng tâm phương thức và sản phẩm khi làm bài tập Thực hành 3."
          badge="Đối sánh THCS vs THPT"
          columns={[
            { key: 'criterion', header: 'Tiêu chí đối sánh', widthClass: 'w-1/4' },
            { key: 'thcs', header: 'Cấp THCS (Mô đun 2 THCS — Lớp 6 đến Lớp 9)' },
            { key: 'thpt', header: 'Cấp THPT (Mô đun 2 THPT — Lớp 10 đến Lớp 12)' },
          ]}
          rows={[
            {
              criterion: '1. Định vị giai đoạn giáo dục',
              thcs: 'Thuộc giai đoạn Giáo dục cơ bản: Tập trung khám phá bản thân ở tuổi dậy thì, rèn luyện kỹ năng giao tiếp xã hội và bước đầu tìm hiểu nghề truyền thống/địa phương.',
              thpt: 'Thuộc giai đoạn Giáo dục định hướng nghề nghiệp: Tập trung phát triển bản lĩnh công dân, đánh giá sự phù hợp nghề và ra quyết định chọn ngành, chọn nghề.',
            },
            {
              criterion: '2. Tỷ trọng 4 mạch nội dung',
              thcs: 'Hướng vào bản thân (~35%), Hướng đến xã hội (~25%), Hướng đến tự nhiên (~20%), Hướng nghiệp (~20% — tăng mạnh ở lớp 8, 9 để phân luồng sau THCS).',
              thpt: 'Hướng vào bản thân (~30%), Hướng đến xã hội (~25%), Hướng đến tự nhiên (~15%), Hướng nghiệp (~30% — trọng tâm xuyên suốt cả 3 khối 10, 11, 12).',
            },
            {
              criterion: '3. Phương thức tổ chức ưu tiên',
              thcs: 'Trò chơi trải nghiệm, Sân khấu tương tác, Tham quan dã ngoại, Hoạt động tình nguyện vừa sức và Dự án khám phá thực tiễn.',
              thpt: 'Diễn đàn tranh biện, Hội thảo hướng nghiệp, Dự án nghiên cứu khoa học (8 bước), Thực hành trải nghiệm thực tế tại cơ sở sản xuất/trường ĐH/CĐ.',
            },
            {
              criterion: '4. Sản phẩm đánh giá điển hình',
              thcs: 'Sổ tay khám phá bản thân, kịch bản đóng vai xử lí tình huống bạn bè, sản phẩm tái chế bảo vệ môi trường, báo cáo thu hoạch tham quan.',
              thpt: 'Bản kế hoạch phát triển nghề nghiệp cá nhân, hồ sơ dự án nghiên cứu thị trường lao động, sản phẩm STEM hướng nghiệp, chiến dịch truyền thông cộng đồng.',
            },
          ]}
        />

        <LegalReferenceBox
          documentTitle="Tài liệu Bồi dưỡng Mô đun 2 THCS & THPT (Bộ GD&ĐT) & Giáo trình HCMUE (Tr. 116–124)"
          article="Quy chuẩn cấu trúc một Hoạt động thành phần trong Kế hoạch chủ đề HĐTN, HN"
          quote="Mỗi hoạt động cụ thể trong kế hoạch tổ chức chủ đề Hoạt động trải nghiệm, hướng nghiệp phải được thiết kế đầy đủ 4 thành phần: (1) Mục tiêu của hoạt động; (2) Nội dung hoạt động; (3) Sản phẩm dự kiến của học sinh; (4) Tổ chức thực hiện gồm 4 bước: Chuyển giao nhiệm vụ -> Học sinh thực hiện trải nghiệm -> Báo cáo, thảo luận và chiêm nghiệm -> Kết luận, nhận định của giáo viên."
          pedagogicalAnalysis="Việc tuân thủ cấu trúc 4 thành phần và 4 bước tổ chức thực hiện giúp giáo viên kiểm soát chặt chẽ tính khả thi trên lớp, đồng thời chuyển giao vai trò hoạt động thực sự cho học sinh."
        />
      </section>

      {/* ==================================================================== */}
      {/* PHẦN II: TIẾN TRÌNH 4 HOẠT ĐỘNG TRẢI NGHIỆM & BẢNG RUBRIC ĐÁNH GIÁ */}
      {/* ==================================================================== */}
      <section className="space-y-4">
        <div className="flex items-center gap-2 border-b border-[#CFDADB] pb-2 font-serif text-xl font-bold text-[#29383D]">
          <Target className="h-5 w-5 text-[#3F6570]" />
          <h2 id="2-quy-trinh-va-rubric-chu-de-hdtn">
            2. Tiến trình 4 Hoạt động Trải nghiệm & Bảng Rubric Đánh giá Thực hành 3
          </h2>
        </div>

        <NumberedProcessFlow
          title="Tiến trình 4 Hoạt động Chuẩn trong Thiết kế Chủ đề HĐTN, HN (Giáo trình HCMUE tr. 118–123)"
          subtitle="Chuỗi tiến trình sư phạm chuyển hóa từ kinh nghiệm ban đầu thành năng lực hành động bền vững."
          badge="Chuỗi 4 Hoạt động"
          columns={2}
          steps={[
            {
              number: 1,
              title: 'Hoạt động 1: Khởi động — Kết nối kinh nghiệm (10 – 15% thời lượng)',
              badge: 'Tạo tâm thế & Huy động kinh nghiệm',
              description:
                'Tổ chức trò chơi, tình huống ngắn hoặc câu hỏi gợi mở để huy động vốn kinh nghiệm sẵn có của học sinh và dẫn dắt vào vấn đề trung tâm của chủ đề.',
            },
            {
              number: 2,
              title: 'Hoạt động 2: Khám phá — Chiêm nghiệm (30 – 35% thời lượng)',
              badge: 'Phản tư & Nhận thức giá trị mới',
              description:
                'Học sinh thảo luận nhóm, phân tích trường hợp điển hình, phỏng vấn hoặc quan sát thực tế để tự rút ra quy trình, khái niệm hoặc thông điệp cốt lõi.',
            },
            {
              number: 3,
              title: 'Hoạt động 3: Rèn luyện / Luyện tập kỹ năng (35 – 40% thời lượng)',
              badge: 'Thực hành giải quyết tình huống',
              description:
                'Học sinh trực tiếp đóng vai, lập kế hoạch, thực hành kỹ năng trong các tình huống giả định hoặc thực tế tại lớp để hình thành năng lực đặc thù.',
            },
            {
              number: 4,
              title: 'Hoạt động 4: Vận dụng — Mở rộng (10 – 15% thời lượng & Ngoài giờ học)',
              badge: 'Cam kết hành động thực tiễn',
              description:
                'Giao nhiệm vụ cho học sinh vận dụng kỹ năng đã học vào đời sống thực tế tại gia đình, cộng đồng và ghi nhận kết quả vào hồ sơ trải nghiệm.',
            },
          ]}
        />

        <ComparativeTable
          title="Bảng Tiêu chí Rubric Đánh giá Bài tập Thực hành 3: Thiết kế Kế hoạch Chủ đề HĐTN, HN"
          subtitle="Thang đánh giá năng lực thiết kế và tổ chức HĐTN, HN theo chuẩn đầu ra CLO9 (3 Mức chất lượng)."
          badge="Rubric Thực hành 3 (CV 5512)"
          columns={[
            { key: 'criterion', header: 'Tiêu chí đánh giá', widthClass: 'w-1/4' },
            { key: 'weight', header: 'Trọng số', widthClass: 'w-1/12' },
            { key: 'notMet', header: 'Mức Chưa đạt', widthClass: 'w-1/4' },
            { key: 'met', header: 'Mức Đạt', widthClass: 'w-1/4' },
            { key: 'good', header: 'Mức Tốt' },
          ]}
          rows={SAMPLE_5512_EXPERIENTIAL_PLAN.assessmentRubric.map((r) => ({
            criterion: r.criterion,
            weight: r.weight,
            notMet: r.notMet,
            met: r.met,
            good: r.good,
          }))}
        />
      </section>

      {/* ==================================================================== */}
      {/* PHẦN III: HỒ SƠ KẾ HOẠCH CHỦ ĐỀ HĐTN, HN MẪU CHUẨN CÔNG VĂN 5512 */}
      {/* ==================================================================== */}
      <section className="space-y-6">
        <div className="flex items-center gap-2 border-b border-[#CFDADB] pb-2 font-serif text-xl font-bold text-[#29383D]">
          <BookOpen className="h-5 w-5 text-[#3F6570]" />
          <h2 id="3-ke-hoach-chu-de-hdtn-mau">
            3. Hồ sơ Kế hoạch Chủ đề Hoạt động Trải nghiệm, Hướng nghiệp Mẫu (Chuẩn Mô đun 2)
          </h2>
        </div>

        <div className="space-y-6 rounded-2xl border border-[#CFDADB] bg-[#F7FAFA] p-6 shadow-xs">
          <div className="border-b border-[#CFDADB] pb-4">
            <div className="text-xs font-bold tracking-wider text-[#3F6570] uppercase">
              Kế hoạch Giáo dục Chủ đề Hoạt động Trải nghiệm, Hướng nghiệp · Khối 10 (Thời lượng: 03
              tiết)
            </div>
            <h3 className="mt-1 font-serif text-2xl font-bold text-[#29383D]">
              {SAMPLE_5512_EXPERIENTIAL_PLAN.topicTitle}
            </h3>
            <p className="mt-1 text-xs text-[#55676B]">
              Nguồn trích xuất: {SAMPLE_5512_EXPERIENTIAL_PLAN.moduleOrigin}
            </p>
          </div>

          {/* I. MỤC TIÊU */}
          <div className="space-y-3 rounded-xl border border-[#CFDADB] bg-[#EAF0F1]/50 p-5 dark:border-[#1E362A] dark:bg-[#0E1A14]">
            <h4 className="font-serif text-sm font-bold tracking-wider text-[#3F6570] uppercase dark:text-[#C5A262]">
              I. Mục tiêu Chủ đề (Yêu cầu cần đạt)
            </h4>
            <div className="grid gap-3 text-xs md:grid-cols-3">
              <div className="space-y-1 rounded-lg border border-[#CFDADB] bg-white p-3 dark:border-[#1E362A] dark:bg-[#12241C]">
                <span className="font-bold text-[#3F6570] dark:text-[#C5A262]">
                  1. Năng lực đặc thù HĐTN:
                </span>
                <ul className="list-disc space-y-1 pl-4 text-[#29383D] dark:text-[#A8C4B5]">
                  {SAMPLE_5512_EXPERIENTIAL_PLAN.objectives.specificCompetencies.map((c, i) => (
                    <li key={i}>{c}</li>
                  ))}
                </ul>
              </div>
              <div className="space-y-1 rounded-lg border border-[#CFDADB] bg-white p-3 dark:border-[#1E362A] dark:bg-[#12241C]">
                <span className="font-bold text-[#718C7E] dark:text-[#739B88]">
                  2. Năng lực chung:
                </span>
                <ul className="list-disc space-y-1 pl-4 text-[#29383D] dark:text-[#A8C4B5]">
                  {SAMPLE_5512_EXPERIENTIAL_PLAN.objectives.generalCompetencies.map((c, i) => (
                    <li key={i}>{c}</li>
                  ))}
                </ul>
              </div>
              <div className="space-y-1 rounded-lg border border-[#CFDADB] bg-white p-3 dark:border-[#1E362A] dark:bg-[#12241C]">
                <span className="font-bold text-[#987343] dark:text-[#E2C48D]">
                  3. Phẩm chất chủ yếu:
                </span>
                <ul className="list-disc space-y-1 pl-4 text-[#29383D] dark:text-[#A8C4B5]">
                  {SAMPLE_5512_EXPERIENTIAL_PLAN.objectives.coreQualities.map((c, i) => (
                    <li key={i}>{c}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* II. THIẾT BỊ DẠY HỌC VÀ HỌC LIỆU */}
          <div className="space-y-3 rounded-xl border border-[#CFDADB] bg-[#EAF0F1]/50 p-5 dark:border-[#1E362A] dark:bg-[#0E1A14]">
            <h4 className="font-serif text-sm font-bold tracking-wider text-[#3F6570] uppercase dark:text-[#C5A262]">
              II. Thiết bị Dạy học và Học liệu
            </h4>
            <div className="grid gap-3 text-xs sm:grid-cols-2">
              <div className="rounded-lg border border-[#CFDADB] bg-white p-3 dark:border-[#1E362A] dark:bg-[#12241C]">
                <span className="font-bold text-[#3F6570] dark:text-[#C5A262]">
                  Chuẩn bị của Giáo viên:
                </span>
                <ul className="mt-1 list-disc space-y-1 pl-4 text-[#29383D] dark:text-[#A8C4B5]">
                  {SAMPLE_5512_EXPERIENTIAL_PLAN.equipmentAndMaterials.teacherPrep.map(
                    (item, i) => (
                      <li key={i}>{item}</li>
                    ),
                  )}
                </ul>
              </div>
              <div className="rounded-lg border border-[#CFDADB] bg-white p-3 dark:border-[#1E362A] dark:bg-[#12241C]">
                <span className="font-bold text-[#718C7E] dark:text-[#739B88]">
                  Phương tiện của Học sinh:
                </span>
                <ul className="mt-1 list-disc space-y-1 pl-4 text-[#29383D] dark:text-[#A8C4B5]">
                  {SAMPLE_5512_EXPERIENTIAL_PLAN.equipmentAndMaterials.studentPrep.map(
                    (item, i) => (
                      <li key={i}>{item}</li>
                    ),
                  )}
                </ul>
              </div>
            </div>
          </div>

          {/* III. TIẾN TRÌNH TỔ CHỨC 4 HOẠT ĐỘNG TRẢI NGHIỆM */}
          <div className="space-y-4">
            <h4 className="font-serif text-sm font-bold tracking-wider text-[#3F6570] uppercase dark:text-[#C5A262]">
              III. Tiến trình Tổ chức Hoạt động Trải nghiệm (Chu trình 4 Hoạt động CV 5512)
            </h4>
            <div className="space-y-4">
              {SAMPLE_5512_EXPERIENTIAL_PLAN.pedagogicalActivities.map((act) => (
                <div
                  key={act.activityNumber}
                  className="space-y-3 rounded-xl border border-[#CFDADB] bg-white p-5 shadow-2xs dark:border-[#1E362A] dark:bg-[#12241C]"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#CFDADB] pb-2 dark:border-[#1E362A]">
                    <h5 className="font-serif text-base font-bold text-[#29383D] dark:text-[#F1F5F3]">
                      {act.activityName}
                    </h5>
                    <span className="rounded-md bg-[#3F6570] px-2.5 py-0.5 font-mono text-xs font-bold text-white dark:bg-[#2C4D3B]">
                      {act.durationText}
                    </span>
                  </div>

                  <div className="grid gap-2 text-xs sm:grid-cols-3">
                    <div className="rounded-lg bg-[#EAF0F1]/50 p-2.5">
                      <span className="font-bold text-[#3F6570]">Mục tiêu: </span>
                      <span className="text-[#29383D]">{act.objective}</span>
                    </div>
                    <div className="rounded-lg bg-[#EAF0F1]/50 p-2.5">
                      <span className="font-bold text-[#718C7E]">Nội dung: </span>
                      <span className="text-[#29383D]">{act.content}</span>
                    </div>
                    <div className="rounded-lg bg-[#EAF0F1]/50 p-2.5">
                      <span className="font-bold text-[#987343]">Sản phẩm dự kiến: </span>
                      <span className="text-[#29383D]">{act.product}</span>
                    </div>
                  </div>

                  <div className="space-y-2 pt-1">
                    <span className="text-[11px] font-bold tracking-wider text-[#3F6570] uppercase">
                      Tổ chức thực hiện (4 bước sư phạm):
                    </span>
                    <div className="grid gap-2 text-xs sm:grid-cols-2">
                      {act.implementationSteps.map((st, stIdx) => (
                        <div
                          key={stIdx}
                          className="space-y-1 rounded-lg border border-[#CFDADB] bg-[#F7FAFA] p-3"
                        >
                          <span className="font-serif font-bold text-[#3F6570]">
                            {st.stepName}:
                          </span>
                          <p className="text-[#29383D]">
                            <strong>GV:</strong> {st.teacherAction}
                          </p>
                          <p className="text-[#55676B]">
                            <strong>HS:</strong> {st.studentAction}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ==================================================================== */}
      {/* PHẦN IV: TÌNH HUỐNG THỰC HÀNH ĐIỀU CHỈNH CHỦ ĐỀ HĐTN */}
      {/* ==================================================================== */}
      <section className="space-y-4">
        <div className="flex items-center gap-2 border-b border-[#CFDADB] pb-2 font-serif text-xl font-bold text-[#29383D]">
          <HelpCircle className="h-5 w-5 text-[#3F6570]" />
          <h2 id="4-tinh-huong-thuc-hanh-hdtn">
            4. Tình huống Thực hành Điều chỉnh Kế hoạch Chủ đề HĐTN, HN (CLO8, CLO9)
          </h2>
        </div>
        <CaseStudyBox caseStudy={caseStudy6_3} />
      </section>
    </div>
  );
};

// ============================================================================
// 4. EXPORT TRÌNH NẠP MODULE KHỐI THỰC HÀNH (CHƯƠNG 6 DYNAMIC LOADER)
// ============================================================================

export function getChapter6LessonModule(lessonId: string): CompiledLessonModule | null {
  if (
    lessonId === 'gdh-th-b1-phan-tich-va-giai-quyet-20-tinh-huong-su-pham-thuc-te' ||
    lessonId === 'phan-tich-va-giai-quyet-20-tinh-huong-su-pham-thuc-te' ||
    lessonId === 'thuc-hanh-1' ||
    lessonId === 'gdh-c6-b1-ngan-hang-20-tinh-huong-su-pham-thuc-te' ||
    lessonId === 'ngan-hang-20-tinh-huong-su-pham-thuc-te' ||
    lessonId === '6-1' ||
    lessonId === 'bai-6-1' ||
    lessonId === 'c6-b1' ||
    lessonId === 'tinh-huong-su-pham' ||
    lessonId === 'educ2802-practice-01' ||
    lessonId === 'practice-01' ||
    lessonId === 'thuc-hanh-01' ||
    lessonId === 'educ2802-p1'
  ) {
    return {
      default: Lesson6_1View,
      frontmatter: {
        title:
          'Bài Thực hành 1: Kĩ năng phân tích và xử lí tình huống giáo dục phổ thông (Ngân hàng 20 tình huống sư phạm)',
        description:
          'Vận dụng hệ thống 6 nguyên tắc hoạt động giáo dục và quy trình 5 bước (Mục 3.3.6 Giáo trình HCMUE tr. 65–66) để phân tích, xử lí 20 tình huống sư phạm điển hình ở trường phổ thông.',
        level: 'advanced',
        tags: [
          'CLO6',
          'Thực hành 1',
          'EDUC2802-PRACTICE-01',
          '20 Tình huống sư phạm',
          'Quy trình 5 bước',
          'Giáo trình tr. 65-66',
        ],
      },
      lessonMeta: {
        chapterNumber: 6,
        lessonNumber: 1,
        headings: [
          {
            id: '1-quy-trinh-khoa-hoc-5-buoc',
            text: '1. Quy trình Khoa học 5 Bước Xử lý Tình huống Sư phạm (Giáo trình HCMUE tr. 65–66)',
            depth: 2,
          },
          {
            id: '2-ngan-hang-20-tinh-huong',
            text: '2. Ngân hàng 20 Tình huống Sư phạm Thực tế & Phương án Chuẩn 5 Bước',
            depth: 2,
          },
          {
            id: '3-tinh-huong-mau-tong-hop',
            text: '3. Mô hình Mẫu Trình bày Bài làm Xử lý Tình huống Sư phạm 5 Bước',
            depth: 2,
          },
        ],
        blocks: [],
      },
    };
  }

  if (
    lessonId === 'gdh-th-b2-lap-ke-hoach-giao-duc-lop-chu-nhiem-va-thiet-ke-tiet-sinh-hoat-lop' ||
    lessonId === 'lap-ke-hoach-giao-duc-lop-chu-nhiem-va-thiet-ke-tiet-sinh-hoat-lop' ||
    lessonId === 'thuc-hanh-2' ||
    lessonId === 'gdh-c6-b2-de-cuong-cau-hoi-on-thi-tu-luan-trong-tam-va-dan-y-dap-an' ||
    lessonId === 'de-cuong-cau-hoi-on-thi-tu-luan-trong-tam-va-dan-y-dap-an' ||
    lessonId === '6-2' ||
    lessonId === 'bai-6-2' ||
    lessonId === 'c6-b2' ||
    lessonId === 'de-cuong-on-tap' ||
    lessonId === 'educ2802-practice-02' ||
    lessonId === 'practice-02' ||
    lessonId === 'thuc-hanh-02' ||
    lessonId === 'educ2802-p2'
  ) {
    return {
      default: Lesson6_2View,
      frontmatter: {
        title:
          'Bài Thực hành 2: Thiết kế kế hoạch chủ nhiệm và kịch bản tiết Sinh hoạt lớp (Đề cương câu hỏi ôn thi tự luận)',
        description:
          'Thực hành xây dựng kế hoạch giáo dục lớp chủ nhiệm theo quy trình 6 bước (Giáo trình HCMUE tr. 71–73), thiết kế kịch bản tiết Sinh hoạt lớp tự quản và hệ thống 10 câu hỏi tự luận, 20 câu trắc nghiệm ôn tập.',
        level: 'advanced',
        tags: [
          'CLO8',
          'Thực hành 2',
          'EDUC2802-PRACTICE-02',
          'Kế hoạch chủ nhiệm',
          'Tiết Sinh hoạt lớp',
          'Đề cương ôn thi',
        ],
      },
      lessonMeta: {
        chapterNumber: 6,
        lessonNumber: 2,
        headings: [
          {
            id: '1-ma-tran-de-thi',
            text: '1. Thực hành Lập Kế hoạch Giáo dục Lớp Chủ nhiệm & Ma trận Đề thi Tự luận',
            depth: 2,
          },
          {
            id: '2-10-cau-hoi-tu-luan',
            text: '2. Tuyển tập 10 Câu hỏi Tự luận Kinh điển & Barem Điểm Chi tiết',
            depth: 2,
          },
          {
            id: '3-trac-nghiem-on-tap',
            text: '3. Bộ 20 Câu hỏi Trắc nghiệm Khách quan Ôn tập Cuối kỳ',
            depth: 2,
          },
          {
            id: '4-tinh-huong-thuc-hanh-chu-nhiem',
            text: '4. Tình huống Thực hành Thiết kế Tiết Sinh hoạt Lớp (CLO8)',
            depth: 2,
          },
        ],
        blocks: [],
      },
    };
  }

  if (
    lessonId === 'gdh-th-b3-thiet-ke-ke-hoach-chu-de-hoat-dong-trai-nghiem-huong-nghiep' ||
    lessonId === 'thiet-ke-ke-hoach-chu-de-hoat-dong-trai-nghiem-huong-nghiep' ||
    lessonId === 'thuc-hanh-3' ||
    lessonId === 'thiet-ke-chu-de-hdtn' ||
    lessonId === '6-3' ||
    lessonId === 'bai-6-3' ||
    lessonId === 'c6-b3' ||
    lessonId === 'educ2802-practice-03' ||
    lessonId === 'practice-03' ||
    lessonId === 'thuc-hanh-03' ||
    lessonId === 'educ2802-p3'
  ) {
    return {
      default: Lesson6_3View,
      frontmatter: {
        title:
          'Bài Thực hành 3: Thiết kế kế hoạch chủ đề Hoạt động trải nghiệm, hướng nghiệp (Chuẩn Công văn 5512 & Mô đun 2)',
        description:
          'Thực hành thiết kế kế hoạch chủ đề Hoạt động trải nghiệm, hướng nghiệp theo quy trình chuẩn Công văn 5512 và Giáo trình HCMUE (tr. 116–124) kết hợp Tài liệu bồi dưỡng giáo viên cốt cán Mô đun 2 cấp THCS & THPT và Rubric đánh giá thực hành.',
        level: 'advanced',
        tags: [
          'CLO9',
          'Thực hành 3',
          'EDUC2802-PRACTICE-03',
          'Mô đun 2 THCS & THPT',
          'Kế hoạch chủ đề HĐTN',
          'Giáo trình tr. 110-124',
        ],
      },
      lessonMeta: {
        chapterNumber: 6,
        lessonNumber: 3,
        headings: [
          {
            id: '1-doi-sanh-mo-dun-2-thcs-thpt',
            text: '1. Tích hợp Tài liệu Mô đun 2: Đặc thù Thiết kế Chủ đề HĐTN, HN cấp THCS và THPT',
            depth: 2,
          },
          {
            id: '2-quy-trinh-va-rubric-chu-de-hdtn',
            text: '2. Tiến trình 4 Hoạt động Trải nghiệm & Bảng Rubric Đánh giá Thực hành 3',
            depth: 2,
          },
          {
            id: '3-ke-hoach-chu-de-hdtn-mau',
            text: '3. Hồ sơ Kế hoạch Chủ đề Hoạt động Trải nghiệm, Hướng nghiệp Mẫu (Chuẩn Mô đun 2)',
            depth: 2,
          },
          {
            id: '4-tinh-huong-thuc-hanh-hdtn',
            text: '4. Tình huống Thực hành Điều chỉnh Kế hoạch Chủ đề HĐTN, HN (CLO8, CLO9)',
            depth: 2,
          },
        ],
        blocks: [],
      },
    };
  }

  return null;
}
