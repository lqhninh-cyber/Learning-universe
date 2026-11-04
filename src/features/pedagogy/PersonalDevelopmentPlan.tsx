import { type FC, type ChangeEvent, useState, useEffect, useCallback } from 'react';
import {
  Calendar,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Download,
  Printer,
  Sparkles,
  Wand2,
} from 'lucide-react';
import { Button, Card, Badge } from '@/shared/ui';
import { SAMPLE_TEMPLATES, TT20_CRITERIA, type PlanStorageMap } from './personal-plan-data';

const STORAGE_KEY = 'learning-universe:personal-plan-v1';

export const PersonalDevelopmentPlan: FC = () => {
  const [selectedYear, setSelectedYear] = useState<number>(1);
  const [plans, setPlans] = useState<PlanStorageMap>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored) as PlanStorageMap;
      }
    } catch {
      // Ignore localStorage errors
    }
    return {
      1: { criteria: [1, 2, 3, 13], goalsText: '' },
      2: { criteria: [4, 5, 14], goalsText: '' },
      3: { criteria: [6, 7, 8, 11], goalsText: '' },
      4: { criteria: [1, 2, 3, 4, 5, 6, 7, 8, 10, 11, 13, 14, 15], goalsText: '' },
    };
  });

  const [savedNotification, setSavedNotification] = useState<string | null>(null);
  const [isSampleOpen, setIsSampleOpen] = useState(false);
  const [sampleYearView, setSampleYearView] = useState<number>(1);

  // Lấy dữ liệu năm hiện tại
  const currentPlan = plans[selectedYear] || { criteria: [1, 2, 3, 13], goalsText: '' };

  // Tự động lưu vào localStorage khi plans thay đổi
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(plans));
    } catch {
      // Ignore localStorage errors
    }
  }, [plans]);

  // Cập nhật tiêu chí cho năm hiện tại
  const toggleCriterion = useCallback(
    (cId: number) => {
      setPlans((prev) => {
        const yearPlan = prev[selectedYear] || { criteria: [], goalsText: '' };
        const exists = yearPlan.criteria.includes(cId);
        const nextCriteria = exists
          ? yearPlan.criteria.filter((id) => id !== cId)
          : [...yearPlan.criteria, cId];

        return {
          ...prev,
          [selectedYear]: {
            ...yearPlan,
            criteria: nextCriteria,
            updatedAt: new Date().toISOString(),
          },
        };
      });
    },
    [selectedYear],
  );

  // Cập nhật văn bản mục tiêu
  const handleTextChange = useCallback(
    (e: ChangeEvent<HTMLTextAreaElement>) => {
      const text = e.target.value;
      setPlans((prev) => {
        const yearPlan = prev[selectedYear] || { criteria: [], goalsText: '' };
        return {
          ...prev,
          [selectedYear]: {
            ...yearPlan,
            goalsText: text,
            updatedAt: new Date().toISOString(),
          },
        };
      });
    },
    [selectedYear],
  );

  // Điền nội dung mẫu tương ứng vào bài làm (Load Template)
  const handleLoadTemplate = (targetYear: number = selectedYear) => {
    const template = SAMPLE_TEMPLATES[targetYear];
    if (!template) return;

    setPlans((prev) => ({
      ...prev,
      [targetYear]: {
        criteria: [...template.criteria],
        goalsText: template.content,
        updatedAt: new Date().toISOString(),
      },
    }));

    setSavedNotification(`✓ Đã điền nội dung mẫu cho Năm ${targetYear}!`);
    setTimeout(() => setSavedNotification(null), 3000);
  };

  // Nút Lưu thủ công
  const handleManualSave = () => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(plans));
      setSavedNotification('✓ Đã lưu bản kế hoạch vào máy (localStorage)');
      setTimeout(() => setSavedNotification(null), 2500);
    } catch {
      setSavedNotification('⚠️ Không thể lưu vào bộ nhớ trình duyệt');
      setTimeout(() => setSavedNotification(null), 2500);
    }
  };

  // Xuất file text (.txt)
  const handleDownloadTxt = () => {
    const yearPlan = plans[selectedYear] || { criteria: [], goalsText: '' };
    const criteriaNames = TT20_CRITERIA.filter((c) => yearPlan.criteria.includes(c.id)).map(
      (c) => c.name,
    );

    const textContent = `TRƯỜNG ĐẠI HỌC SƯ PHẠM TP. HỒ CHÍ MINH
KHOA TOÁN - TIN HỌC / HỌC PHẦN GIÁO DỤC HỌC (EDUT1401)
========================================================================
BẢN KẾ HOẠCH HỌC TẬP VÀ RÈN LUYỆN NGHỀ NGHIỆP SƯ PHẠM
NĂM HỌC THỨ ${selectedYear} (Đại học Chính quy — Ngành Sư phạm Toán học)
* Yêu cầu đánh giá tự học Buổi 2 - Đề cương TS. Lê Thị Thu Liễu (CLO 3)
* Bám sát 15 tiêu chí Chuẩn nghề nghiệp GVPT (Thông tư 20/2018/TT-BGDĐT)
========================================================================

Họ và tên sinh viên: .....................................................
Mã số sinh viên:     .....................................................
Lớp sinh hoạt:       .....................................................

I. CÁC TIÊU CHÍ TRỌNG TÂM THEO THÔNG TƯ 20/2018 ĐÃ CHỌN RÈN LUYỆN:
${criteriaNames.length > 0 ? criteriaNames.map((c) => `  [X] ${c}`).join('\n') : '  (Chưa chọn tiêu chí)'}

II. MỤC TIÊU VÀ BIỆN PHÁP HÀNH ĐỘNG CỤ THỂ:
${yearPlan.goalsText || '(Chưa nhập nội dung kế hoạch)'}

------------------------------------------------------------------------
Thời gian cập nhật: ${new Date().toLocaleDateString('vi-VN')}
Sinh viên lập kế hoạch: (Ký và ghi rõ họ tên)
`;

    const blob = new Blob(['\uFEFF' + textContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Ke_hoach_ren_luyen_su_pham_Nam_${selectedYear}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Xuất bản in / Lưu PDF
  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const yearPlan = plans[selectedYear] || { criteria: [], goalsText: '' };
    const criteriaNames = TT20_CRITERIA.filter((c) => yearPlan.criteria.includes(c.id)).map(
      (c) => c.name,
    );

    const safeGoalsText = (yearPlan.goalsText || '(Sinh viên chưa nhập nội dung kế hoạch)')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');

    const html = `<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="utf-8" />
  <title>Kế hoạch Học tập & Rèn luyện Nghề nghiệp Sư phạm - Năm ${selectedYear}</title>
  <style>
    @page { size: A4; margin: 20mm 15mm 20mm 15mm; }
    body { font-family: "Times New Roman", Times, serif; font-size: 13pt; line-height: 1.5; color: #111; margin: 0; padding: 20px; }
    .header { display: flex; justify-content: space-between; margin-bottom: 20px; text-align: center; }
    .left-header { width: 45%; }
    .right-header { width: 50%; font-weight: bold; }
    .school-name { font-weight: bold; font-size: 11pt; text-transform: uppercase; }
    .sub-school { font-size: 11pt; margin-top: 2px; }
    .motto { font-size: 11pt; }
    .line { width: 120px; height: 1px; background: #000; margin: 5px auto; }
    .title { text-align: center; margin: 25px 0 15px 0; }
    .title h1 { font-size: 15pt; font-weight: bold; text-transform: uppercase; margin: 0; }
    .title h2 { font-size: 13pt; font-weight: normal; font-style: italic; margin-top: 5px; }
    .student-info { margin: 15px 0; font-size: 12pt; border: 1px dashed #aaa; padding: 10px 14px; border-radius: 4px; }
    .info-row { display: flex; justify-content: space-between; margin-bottom: 5px; }
    .section-title { font-weight: bold; font-size: 13pt; margin-top: 20px; margin-bottom: 8px; text-transform: uppercase; color: #1a365d; border-bottom: 1px solid #cbd5e0; padding-bottom: 4px; }
    .criteria-box { background: #f8fafc; border: 1px solid #e2e8f0; padding: 10px 14px; border-radius: 6px; font-size: 11.5pt; }
    .criteria-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 4px 10px; }
    .criteria-item { margin-bottom: 3px; }
    .content-box { white-space: pre-wrap; font-size: 12pt; text-align: justify; margin-top: 10px; line-height: 1.6; }
    .signature-block { display: flex; justify-content: space-between; margin-top: 40px; page-break-inside: avoid; }
    .signature-box { text-align: center; width: 45%; font-size: 12pt; }
    .signature-space { height: 70px; }
  </style>
</head>
<body>
  <div class="header">
    <div class="left-header">
      <div class="school-name">TRƯỜNG ĐẠI HỌC SƯ PHẠM TP.HCM</div>
      <div class="sub-school">KHOA TOÁN - TIN HỌC</div>
      <div class="line"></div>
      <div style="font-size: 10pt; font-style: italic;">Học phần: Giáo dục học (EDUT1401)</div>
    </div>
    <div class="right-header">
      <div class="school-name">CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</div>
      <div class="motto">Độc lập - Tự do - Hạnh phúc</div>
      <div class="line"></div>
    </div>
  </div>

  <div class="title">
    <h1>BẢN KẾ HOẠCH HỌC TẬP VÀ RÈN LUYỆN NGHỀ NGHIỆP SƯ PHẠM</h1>
    <h2>NĂM THỨ ${selectedYear} (Đại học Chính quy — Ngành Sư phạm Toán học)</h2>
    <div style="font-size: 10.5pt; color: #4a5568; margin-top: 4px;">
      Bám sát Chuẩn nghề nghiệp giáo viên cơ sở giáo dục phổ thông (Thông tư 20/2018/TT-BGDĐT)
    </div>
  </div>

  <div class="student-info">
    <div class="info-row">
      <div><strong>Họ và tên sinh viên:</strong> ................................................................</div>
      <div><strong>Mã số sinh viên:</strong> ....................................</div>
    </div>
    <div class="info-row">
      <div><strong>Lớp sinh hoạt:</strong> ........................................................................</div>
      <div><strong>Khóa đào tạo:</strong> .......................................</div>
    </div>
    <div style="font-size: 10pt; color: #666; margin-top: 5px; font-style: italic;">
      * Bài tập tự học cá nhân theo yêu cầu Buổi 2 - Đề cương TS. Lê Thị Thu Liễu (Chuẩn đầu ra CLO 3).
    </div>
  </div>

  <div class="section-title">I. CÁC TIÊU CHÍ TRỌNG TÂM THEO THÔNG TƯ 20/2018/TT-BGDĐT</div>
  <div class="criteria-box">
    <div class="criteria-grid">
      ${
        criteriaNames.length > 0
          ? criteriaNames.map((c) => `<div class="criteria-item">☑ ${c}</div>`).join('')
          : '<div>(Chưa chọn tiêu chí nào)</div>'
      }
    </div>
  </div>

  <div class="section-title">II. MỤC TIÊU VÀ BIỆN PHÁP HÀNH ĐỘNG CỤ THỂ</div>
  <div class="content-box">${safeGoalsText}</div>

  <div class="signature-block">
    <div class="signature-box">
      <div><strong>XÁC NHẬN CỦA GIẢNG VIÊN / CỐ VẤN</strong></div>
      <div style="font-style: italic; font-size: 10pt;">(Ký và ghi rõ họ tên)</div>
      <div class="signature-space"></div>
    </div>
    <div class="signature-box">
      <div style="font-style: italic;">TP. Hồ Chí Minh, ngày ..... tháng ..... năm 20....</div>
      <div><strong>SINH VIÊN LẬP KẾ HOẠCH</strong></div>
      <div style="font-style: italic; font-size: 10pt;">(Ký và ghi rõ họ tên)</div>
      <div class="signature-space"></div>
    </div>
  </div>

  <script>
    window.onload = function() {
      window.print();
    };
  </script>
</body>
</html>`;

    printWindow.document.open();
    printWindow.document.write(html);
    printWindow.document.close();
  };

  return (
    <Card className="space-y-6 rounded-2xl border-indigo-200/90 bg-indigo-50/30 p-5 shadow-xs sm:p-6">
      {/* 1. Header Khối bài tập & Chú thích chuẩn CLO 3 */}
      <div className="space-y-2 border-b border-indigo-100 pb-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-100 text-indigo-800">
              <Calendar className="h-5 w-5" aria-hidden="true" />
            </div>
            <div>
              <h4 className="font-serif text-base font-bold text-stone-900 sm:text-lg">
                Bản Kế hoạch Học tập &amp; Rèn luyện Nghề nghiệp Sư phạm
              </h4>
              <p className="text-xs font-medium text-indigo-900/80">
                Bài tập tự học cá nhân theo yêu cầu Buổi 2 — Đề cương TS. Lê Thị Thu Liễu (CLO 3).
              </p>
            </div>
          </div>

          {/* Chọn Năm học 1 - 4 */}
          <div className="flex items-center gap-1.5 rounded-xl border border-indigo-200/80 bg-white p-1 shadow-2xs">
            {[1, 2, 3, 4].map((year) => {
              const isSelected = selectedYear === year;
              return (
                <button
                  key={`year-select-${year}`}
                  type="button"
                  onClick={() => setSelectedYear(year)}
                  className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                    isSelected
                      ? 'bg-indigo-700 text-white shadow-xs'
                      : 'text-stone-600 hover:bg-stone-100 hover:text-stone-900'
                  }`}
                >
                  Năm {year}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* 2. Thanh Accordion xem Kế hoạch Mẫu tham khảo (Ngành Sư phạm Toán) */}
      <div className="rounded-xl border border-amber-200/90 bg-amber-50/60 p-3.5 transition-all">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <button
            type="button"
            onClick={() => setIsSampleOpen(!isSampleOpen)}
            className="flex items-center gap-2 text-left text-xs font-bold text-amber-950 transition-colors hover:text-amber-800"
          >
            <Sparkles className="h-4 w-4 text-amber-600" aria-hidden="true" />
            <span>Xem Kế hoạch Mẫu Tham khảo (Ngành Sư phạm Toán)</span>
            <Badge variant="neutral" className="border-amber-300/80 bg-white/80 text-[10px]">
              Lộ trình 4 Năm · Chuẩn TT20
            </Badge>
            {isSampleOpen ? (
              <ChevronUp className="h-4 w-4 text-amber-700" />
            ) : (
              <ChevronDown className="h-4 w-4 text-amber-700" />
            )}
          </button>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => handleLoadTemplate(selectedYear)}
            className="h-8 gap-1.5 border-amber-300 bg-white text-xs font-semibold text-amber-900 shadow-2xs hover:bg-amber-100"
          >
            <Wand2 className="h-3.5 w-3.5 text-amber-600" />
            <span>Điền nội dung mẫu vào bài làm (Năm {selectedYear})</span>
          </Button>
        </div>

        {/* Nội dung chi tiết Accordion Mẫu */}
        {isSampleOpen && (
          <div className="mt-3.5 space-y-3 border-t border-amber-200/70 pt-3">
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
              {[1, 2, 3, 4].map((y) => (
                <button
                  key={`sample-tab-${y}`}
                  type="button"
                  onClick={() => setSampleYearView(y)}
                  className={`rounded-lg px-2.5 py-1 font-semibold transition-all ${
                    sampleYearView === y
                      ? 'bg-amber-800 text-white'
                      : 'bg-white/90 text-stone-700 hover:bg-white'
                  }`}
                >
                  Năm {y}: {SAMPLE_TEMPLATES[y]?.badge}
                </button>
              ))}
            </div>

            {SAMPLE_TEMPLATES[sampleYearView] && (
              <div className="rounded-xl border border-amber-200/80 bg-white p-3.5 text-xs text-stone-800 shadow-2xs">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h5 className="font-bold text-amber-950">
                    {SAMPLE_TEMPLATES[sampleYearView].title}
                  </h5>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedYear(sampleYearView);
                      handleLoadTemplate(sampleYearView);
                    }}
                    className="inline-flex items-center gap-1 text-[11px] font-bold text-indigo-700 hover:underline"
                  >
                    <span>Áp dụng mẫu này cho Năm {sampleYearView}</span>
                    <Wand2 className="h-3 w-3" />
                  </button>
                </div>
                <p className="mt-1 text-[11px] text-stone-600 italic">
                  {SAMPLE_TEMPLATES[sampleYearView].subtitle}
                </p>

                <div className="mt-2.5 rounded-lg bg-stone-50 p-2.5 font-sans text-[11.5px] leading-relaxed whitespace-pre-wrap text-stone-700">
                  {SAMPLE_TEMPLATES[sampleYearView].content}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* 3. Chọn các tiêu chí Thông tư 20/2018 trọng tâm */}
      <div className="space-y-2.5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <label className="block text-xs font-bold tracking-wider text-stone-800 uppercase">
            🎯 Chọn các tiêu chí TT20 trọng tâm cần rèn luyện trong Năm {selectedYear}:
          </label>
          <span className="text-[11px] font-medium text-stone-500">
            Đã chọn: <strong className="text-indigo-900">{currentPlan.criteria.length} / 15</strong>{' '}
            tiêu chí
          </span>
        </div>

        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {TT20_CRITERIA.map((criterion) => {
            const isChecked = currentPlan.criteria.includes(criterion.id);
            return (
              <button
                key={`crit-${criterion.id}`}
                type="button"
                onClick={() => toggleCriterion(criterion.id)}
                className={`flex items-start gap-2.5 rounded-xl border p-2.5 text-left text-xs transition-all ${
                  isChecked
                    ? 'border-indigo-600 bg-indigo-50/80 font-medium text-indigo-950 shadow-2xs'
                    : 'border-stone-200 bg-white text-stone-600 hover:border-stone-300 hover:bg-stone-50'
                }`}
              >
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={() => {}}
                  aria-label={criterion.name}
                  className="mt-0.5 rounded border-stone-300 text-indigo-600 focus:ring-indigo-500"
                />
                <div className="min-w-0">
                  <span className="block leading-snug">{criterion.name}</span>
                  <span className="block text-[10px] text-stone-600">{criterion.standard}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 4. Ô nhập Mục tiêu và Hành động cụ thể (Tự động lưu vào LocalStorage) */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <label className="block text-xs font-bold tracking-wider text-stone-800 uppercase">
            ✍️ Mục tiêu &amp; Biện pháp hành động cụ thể (GPA, Ngoại ngữ, Kỹ năng mềm, NCKH):
          </label>
          <span className="text-[10px] text-stone-500">Tự động lưu vào trình duyệt</span>
        </div>
        <textarea
          rows={7}
          value={currentPlan.goalsText}
          onChange={handleTextChange}
          placeholder={`Nhập kế hoạch chi tiết cho Năm ${selectedYear}...\n\nVí dụ:\n- Đạt điểm rèn luyện Tốt/Xuất sắc, GPA chuyên ngành Toán >= 3.2\n- Thi đạt chứng chỉ ngoại ngữ B1 / IELTS 5.5+\n- Luyện chữ viết bảng chuẩn mực và tham gia Câu lạc bộ Sư phạm Toán\n- Tự học thành thạo phần mềm GeoGebra 2D/3D và soạn thảo LaTeX`}
          className="w-full rounded-xl border border-stone-200 bg-white p-3.5 text-xs leading-relaxed text-stone-800 placeholder:text-stone-400 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 focus:outline-none"
        />
      </div>

      {/* 5. Hàng nút hành động: Điền mẫu, Lưu bản kế hoạch, Xuất bản in PDF, Tải TXT */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-indigo-100 pt-3">
        <div className="flex items-center gap-2">
          {savedNotification ? (
            <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-800">
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
              <span>{savedNotification}</span>
            </span>
          ) : (
            <span className="text-[11px] text-stone-500">
              Dữ liệu được lưu trữ tự động trên thiết bị cá nhân của bạn.
            </span>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleDownloadTxt}
            className="h-8 gap-1.5 text-xs font-semibold text-stone-700 shadow-2xs hover:bg-stone-100"
          >
            <Download className="h-3.5 w-3.5 text-stone-500" />
            <span>Tải bản thảo (.txt)</span>
          </Button>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handlePrint}
            className="h-8 gap-1.5 border-indigo-300 bg-white text-xs font-semibold text-indigo-900 shadow-2xs hover:bg-indigo-50"
          >
            <Printer className="h-3.5 w-3.5 text-indigo-600" />
            <span>🖨️ Xuất bản in / Lưu PDF</span>
          </Button>

          <Button
            type="button"
            variant="subject"
            size="sm"
            onClick={handleManualSave}
            className="h-8 gap-1.5 bg-indigo-700 text-xs font-semibold text-white shadow-2xs hover:bg-indigo-800"
          >
            <CheckCircle2 className="h-3.5 w-3.5" />
            <span>Lưu bản kế hoạch cá nhân</span>
          </Button>
        </div>
      </div>
    </Card>
  );
};
