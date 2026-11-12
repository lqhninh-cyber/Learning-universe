import type { CompiledLessonModule } from '@/content-runtime/loader';
import {
  CaseStudyBox,
  ComparativeTable,
  LegalReferenceBox,
  NumberedProcessFlow,
  PedagogyMetadataBar,
  PrincipleMatrix,
  ScholarQuote,
} from '@/features/pedagogy';
import { Sidenote } from '@/shared/components/Sidenote';
import {
  BookOpen,
  Compass,
  GraduationCap,
  HelpCircle,
  Layers,
  Scale,
  Sparkles,
  Target,
} from 'lucide-react';
import { createElement, useState, type FC } from 'react';
import type { PedagogicalCaseStudy } from './course';

// ============================================================================
// 1. COMPONENT BÀI 3.1: KHÁI QUÁT VỀ GIÁO DỤC PHỔ THÔNG VIỆT NAM (TR. 32–39)
// ============================================================================

export const Lesson3_1View: FC = () => {
  const caseStudy3_1: PedagogicalCaseStudy = {
    id: 301,
    title: 'Tư vấn chọn tổ hợp môn học ở lớp 10 và định hướng phân luồng theo CT GDPT 2018',
    context:
      'Đầu năm học lớp 10, phụ huynh em N. kiên quyết bắt con đăng ký tổ hợp môn Khoa học Tự nhiên (Vật lí, Hóa học, Sinh học) để sau này thi ngành Y theo truyền thống gia đình, mặc dù em N. có năng lực vượt trội và niềm đam mê rõ rệt với lĩnh vực Thiết kế đồ họa, Tin học và Ngoại ngữ. Em N. căng thẳng và tìm gặp giáo viên để xin lời khuyên.',
    question:
      'Vận dụng kiến thức về Hệ thống giáo dục quốc dân (Luật Giáo dục 2019, QĐ 1981/QĐ-TTg) và định hướng giai đoạn Giáo dục định hướng nghề nghiệp trong Chương trình GDPT 2018 (Giáo trình HCMUE tr. 32–39), anh/chị hãy xử lí tình huống theo quy trình 5 bước.',
    principlesApplied: [
      'Định hướng Chương trình GDPT 2018 (Thông tư 32/2018): Giai đoạn giáo dục định hướng nghề nghiệp ở cấp THPT (Giáo trình tr. 34–36)',
      'Luật Giáo dục 2019 (Điều 9: Hướng nghiệp và phân luồng trong giáo dục)',
      'Nguyên tắc tôn trọng nhân cách học sinh kết hợp với phù hợp đặc điểm cá nhân',
    ],
    solutionSteps: [
      {
        step: 1,
        title: 'Bước 1: Nhận diện sự việc và xác định vấn đề cần giải quyết',
        content:
          'Xung đột giữa kỳ vọng áp đặt của phụ huynh và năng lực, sở trường, nguyện vọng nghề nghiệp thực tế của học sinh N. ở ngưỡng cửa giai đoạn Giáo dục định hướng nghề nghiệp (cấp THPT).',
      },
      {
        step: 2,
        title: 'Bước 2: Thu thập thông tin và phân tích nguyên nhân theo CT GDPT 2018',
        content:
          'Theo Chương trình GDPT 2018 (Giáo trình tr. 34–36), cấp THPT là giai đoạn giáo dục định hướng nghề nghiệp, cho phép học sinh lựa chọn các môn học và chuyên đề học tập phù hợp với năng lực, sở thích và định hướng nghề nghiệp tương lai. Việc ép học sinh học tổ hợp trái sở trường dễ dẫn đến quá tải và chán học.',
      },
      {
        step: 3,
        title: 'Bước 3: Đề xuất các phương án giải quyết khả thi',
        content:
          'Phương án 1: Khuyên em N. nhẫn nhịn nghe lời bố mẹ để tránh mâu thuẫn gia đình (không giải quyết tận gốc). Phương án 2: Tổ chức buổi tư vấn hướng nghiệp 3 bên (GV – Phụ huynh – Học sinh) dựa trên hồ sơ học bạ, kết quả trắc nghiệm hướng nghiệp và cấu trúc tổ hợp môn của nhà trường.',
      },
      {
        step: 4,
        title: 'Bước 4: Lựa chọn phương án tối ưu và tổ chức thực hiện tác động sư phạm',
        content:
          'Giáo viên gặp gỡ phụ huynh em N., phân tích minh chứng năng lực Toán – Tin – Ngoại ngữ của em, giải thích cơ hội nghề nghiệp rộng mở của ngành Công nghệ số & Thiết kế trong nền kinh tế hiện đại để phụ huynh thấu hiểu và đồng thuận.',
      },
      {
        step: 5,
        title: 'Bước 5: Đánh giá kết quả, theo dõi hỗ trợ và rút kinh nghiệm sư phạm',
        content:
          'Hỗ trợ em N. hoàn tất đăng ký tổ hợp môn phù hợp, theo dõi kết quả học tập học kỳ 1 và thông tin thường xuyên cho gia đình yên tâm.',
      },
    ],
    pitfallsToAvoid: [
      'Phê phán gay gắt quan điểm của phụ huynh khiến phụ huynh tự ái và càng áp đặt con cái.',
      'Tư vấn chọn tổ hợp môn cảm tính mà không dựa trên căn cứ năng lực học tập và xu hướng nghề nghiệp.',
    ],
    coreLesson:
      'Giai đoạn giáo dục định hướng nghề nghiệp ở cấp THPT (CT GDPT 2018) đòi hỏi người giáo viên phải là nhà tư vấn khoa học, giúp kết nối hài hòa giữa sở trường của học sinh với sự đồng hành của gia đình.',
  };

  return createElement(
    'div',
    { className: 'space-y-8 text-[#29383D] leading-relaxed' },

    // 1. THANH METADATA & ĐỐI CHIẾU ĐẦU BÀI
    createElement(PedagogyMetadataBar, {
      courseCode: 'EDUC2802',
      lessonCode: 'EDUC2802-C3-L1',
      clos: ['CLO3', 'CLO4'],
      textbookPages: 'Giáo trình Giáo dục học HCMUE (Trang 32 – 39)',
      legalRefs: [
        'Luật Giáo dục 2019 (Điều 4, Điều 27, Điều 28)',
        'Quyết định 1981/QĐ-TTg (Khung cơ cấu HTGDQD)',
        'Nghị quyết 29-NQ/TW & NQ 88/2014/QH13',
        'Điều lệ trường học 2020 (TT 28/2020 & TT 32/2020)',
      ],
      sessionNote: 'Mục 3.1 · Trang 32 – 39',
    }),

    // PHẦN I: KHUNG CƠ CẤU HỆ THỐNG GIÁO DỤC QUỐC DÂN VIỆT NAM (TRANG 32 – 34)
    createElement(
      'section',
      { id: '1-khung-co-cau-htgdqd', className: 'space-y-4' },
      createElement(
        'div',
        {
          className:
            'flex items-center gap-2 border-b border-[#CFDADB] pb-2 font-serif text-xl font-bold text-[#29383D]',
        },
        createElement(BookOpen, { className: 'h-5 w-5 text-[#3F6570]' }),
        createElement(
          'h3',
          null,
          '1. Khung Cơ cấu Hệ thống Giáo dục Quốc dân Việt Nam (Trang 32 – 34)',
        ),
      ),
      createElement(
        'div',
        {
          className:
            'callout-highlight-box my-5 space-y-3 rounded-xl border border-stone-200/90 bg-[#F8FAF9] p-6 text-zinc-800 border-l-4 border-[#2E6B4F] shadow-sm dark:border-[#2C4D3B] dark:bg-[#12241C] dark:text-[#E4EFE9] dark:border-l-4 dark:border-[#C5A262] dark:shadow-none',
        },
        createElement(
          'span',
          {
            className:
              'tag-badge inline-flex items-center rounded-md border border-[#2E6B4F]/30 bg-[#E8EFEB] px-2.5 py-0.5 font-mono text-xs font-semibold text-[#2E6B4F] dark:border-[#C5A262]/40 dark:bg-[#1A382B] dark:text-[#E2C48D]',
          },
          'Định nghĩa & Khung Pháp lý Nền tảng',
        ),
        createElement(
          'p',
          { className: 'text-sm leading-relaxed text-zinc-800 dark:text-[#E4EFE9]' },
          createElement(
            'strong',
            { className: 'text-zinc-900 dark:text-[#F1F5F3]' },
            'Hệ thống giáo dục quốc dân',
          ),
          ' là tổng thể các cơ sở giáo dục và đào tạo được phân chia thành các bậc học, cấp học, ngành học theo quy hoạch của Nhà nước nhằm thực hiện mục đích giáo dục. Theo Điều 4 Luật Giáo dục 2019 và Quyết định 1981/QĐ-TTg (2016), hệ thống giáo dục quốc dân Việt Nam được xây dựng theo mô hình ',
          createElement(
            'strong',
            { className: 'text-[#2E6B4F] dark:text-[#C5A262]' },
            'mở, linh hoạt và liên thông',
          ),
          ' giữa các cấp học và trình độ đào tạo, gồm hai tiểu hệ thống: giáo dục chính quy và giáo dục thường xuyên.',
        ),
      ),
      createElement(
        'p',
        null,
        'Cơ cấu hệ thống giáo dục quốc dân Việt Nam được phân tầng khoa học thành 4 cấp học và trình độ đào tạo liên kết chặt chẽ với nhau:',
        createElement(
          Sidenote,
          { type: 'pedagogy', number: 1 },
          'Nguyên tắc liên thông: Giáo dục thường xuyên thực hiện chương trình tương đương giáo dục phổ thông, đảm bảo quyền học tập suốt đời và chuyển tiếp linh hoạt sang giáo dục nghề nghiệp.',
        ),
      ),
      createElement(ComparativeTable, {
        title:
          'Bảng Ma trận Phân tầng Cấp học và Trình độ Đào tạo trong Hệ thống Giáo dục Quốc dân (QĐ 1981/QĐ-TTg)',
        subtitle:
          'Cấu trúc phân tầng các cấp học, độ tuổi và văn bằng chứng chỉ tương ứng theo chuẩn Giáo trình HCMUE (Trang 32 – 34).',
        badge: 'Khung Cơ cấu QĐ 1981/QĐ-TTg',
        columns: [
          { key: 'level', header: 'Phân tầng cấp học', widthClass: 'w-1/4' },
          { key: 'stages', header: 'Các cấp học & Độ tuổi quy định', widthClass: 'w-1/3' },
          { key: 'function', header: 'Chức năng đào tạo & Định hướng phát triển' },
        ],
        rows: [
          {
            level: 'Cấp 1: Giáo dục mầm non',
            stages: 'Nhà trẻ (3 tháng – 3 tuổi); Mẫu giáo (3 – 6 tuổi).',
            function:
              'Nuôi dưỡng, chăm sóc, giáo dục trẻ em; chuẩn bị tâm lý và thể chất cho trẻ bước vào lớp 1.',
          },
          {
            level: 'Cấp 2: Giáo dục phổ thông',
            stages:
              'Tiểu học (5 năm, từ lớp 1; 6 tuổi); THCS (4 năm, từ lớp 6; 11 tuổi); THPT (3 năm, từ lớp 10; 15 tuổi).',
            function:
              'Trang bị học vấn phổ thông toàn diện; chia thành 2 giai đoạn: Giáo dục cơ bản (Lớp 1 – 9) và Giáo dục định hướng nghề nghiệp (Lớp 10 – 12).',
          },
          {
            level: 'Cấp 3: Giáo dục nghề nghiệp',
            stages: 'Sơ cấp (dưới 1 năm); Trung cấp (1 – 2 năm); Cao đẳng (2 – 3 năm).',
            function:
              'Đào tạo nhân lực kỹ thuật trực tiếp trong sản xuất, kinh doanh và dịch vụ; tiếp nhận phân luồng học sinh sau THCS và THPT.',
          },
          {
            level: 'Cấp 4: Giáo dục đại học',
            stages:
              'Đại học cử nhân/kỹ sư (3 – 5 năm); Thạc sĩ định hướng nghiên cứu/ứng dụng (1 – 2 năm); Tiến sĩ (3 – 4 năm).',
            function:
              'Đào tạo nguồn nhân lực trình độ cao, bồi dưỡng nhân tài; nghiên cứu khoa học và phát triển công nghệ phục vụ đất nước.',
          },
        ],
        footerNote:
          'Nguồn đối chiếu: Luật Giáo dục 2019 (Điều 4, Điều 6) & Quyết định 1981/QĐ-TTg của Thủ tướng Chính phủ.',
      }),
    ),

    // PHẦN II: VAI TRÒ, MỤC TIÊU VÀ ĐỊNH HƯỚNG ĐỔI MỚI GIÁO DỤC PHỔ THÔNG (TRANG 34 – 36)
    createElement(
      'section',
      { id: '2-vai-tro-muc-tieu-doi-moi', className: 'space-y-4' },
      createElement(
        'div',
        {
          className:
            'flex items-center gap-2 border-b border-[#CFDADB] pb-2 font-serif text-xl font-bold text-[#29383D]',
        },
        createElement(Target, { className: 'h-5 w-5 text-[#3F6570]' }),
        createElement(
          'h3',
          null,
          '2. Vai trò, Mục tiêu và Định hướng Đổi mới Giáo dục Phổ thông (Trang 34 – 36)',
        ),
      ),
      createElement(
        'p',
        null,
        'Trong hệ thống giáo dục quốc dân, giáo dục phổ thông giữ ',
        createElement('strong', null, 'vị trí chiến lược nền tảng'),
        ': là nền tảng văn hóa của đất nước, đơn vị cơ sở của toàn bộ hệ thống, đặt nền móng vững chắc cho việc phát triển toàn diện nhân cách thế hệ trẻ.',
      ),
      createElement(LegalReferenceBox, {
        lawTitle: 'Luật Giáo dục 2019 (Luật số 43/2019/QH14)',
        article: 'Điều 27. Mục tiêu của giáo dục phổ thông',
        quote:
          'Giáo dục phổ thông nhằm phát triển toàn diện cho người học về đạo đức, trí tuệ, thể chất, thẩm mỹ và các kỹ năng cơ bản, phát triển năng lực cá nhân, tính năng động và sáng tạo; hình thành nhân cách con người Việt Nam xã hội chủ nghĩa và trách nhiệm công dân; chuẩn bị cho người học tiếp tục học chương trình giáo dục đại học, giáo dục nghề nghiệp hoặc tham gia lao động, xây dựng và bảo vệ Tổ quốc.',
        source: 'Luật Giáo dục số 43/2019/QH14 (Giáo trình HCMUE Trang 34)',
        significance:
          'Xác lập mục tiêu bao quát chuyển từ tiếp cận nội dung sang phát triển toàn diện nhân cách công dân.',
      }),
      createElement(
        'div',
        {
          className: 'rounded-2xl border border-[#CFDADB] bg-[#E8EFEB]/60 p-5 shadow-2xs space-y-2',
        },
        createElement(
          'h4',
          { className: 'font-serif text-base font-bold text-[#3F6570]' },
          'Định hướng Đổi mới Căn bản theo Nghị quyết 88/2014/QH13 và Nghị quyết 29-NQ/TW',
        ),
        createElement(
          'p',
          { className: 'text-sm text-[#29383D] leading-relaxed' },
          'Nghị quyết số 88/2014/QH13 của Quốc hội xác lập cuộc đổi mới mang tính bước ngoặt: Chuyển căn bản từ nền giáo dục ',
          createElement('strong', null, '"nặng về truyền thụ kiến thức"'),
          ' một chiều sang nền giáo dục ',
          createElement(
            'strong',
            { className: 'text-[#3F6570]' },
            '"phát triển toàn diện cả phẩm chất và năng lực"',
          ),
          ', hài hòa đức - trí - thể - mỹ; dạy chữ gắn liền với dạy người và dạy nghề.',
        ),
      ),
    ),

    // PHẦN III: KHUNG KẾ HOẠCH GIÁO DỤC PHỔ THÔNG 2018 (TRANG 34 – 36)
    createElement(
      'section',
      { id: '3-khung-ke-hoach-gdpt-2018', className: 'space-y-4' },
      createElement(
        'div',
        {
          className:
            'flex items-center gap-2 border-b border-[#CFDADB] pb-2 font-serif text-xl font-bold text-[#29383D]',
        },
        createElement(GraduationCap, { className: 'h-5 w-5 text-[#3F6570]' }),
        createElement(
          'h3',
          null,
          '3. Khung Kế hoạch Giáo dục Phổ thông 2018 (Thông tư 32/2018/TT-BGDĐT, Trang 34 – 36)',
        ),
      ),
      createElement(NumberedProcessFlow, {
        title: 'Kế hoạch Phân kỳ 2 Giai đoạn Giáo dục Phổ thông 2018',
        subtitle:
          'Quy định chi tiết thời gian thực học 35 tuần/năm và cấu trúc môn học theo Thông tư 32/2018/TT-BGDĐT.',
        badge: 'Kế hoạch GDPT 2018',
        columns: 1,
        steps: [
          {
            number: 1,
            title: 'Giai đoạn Giáo dục cơ bản (Lớp 1 đến Lớp 9)',
            description:
              'Thực hiện giáo dục toàn diện, tích hợp cao ở Tiểu học và phân hóa dần ở THCS; bắt buộc chung thống nhất trên toàn quốc; trang bị tri thức nền tảng vững chắc và thực hiện phân luồng sau THCS.',
            keyAction:
              'Tổ chức dạy học tích hợp (KHTN, Lịch sử và Địa lí) và hoạt động trải nghiệm bắt buộc.',
            deliverable:
              'Học sinh hoàn thành giáo dục cơ bản có đủ năng lực học vấn để vào THPT hoặc học nghề.',
          },
          {
            number: 2,
            title: 'Giai đoạn Giáo dục định hướng nghề nghiệp (Lớp 10 đến Lớp 12)',
            description:
              'Thực hiện giáo dục phân hóa sâu; học sinh học các môn bắt buộc chung (Ngữ văn, Toán, Ngoại ngữ 1, Lịch sử, GDTC, GDQPAN, HĐTN-HN, GD địa phương) và tự chọn 4 môn từ nhóm môn lựa chọn + 3 cụm chuyên đề học tập (35 tiết/năm/môn) phù hợp sở trường và định hướng nghề nghiệp.',
            keyAction:
              'Tư vấn hướng nghiệp, sắp xếp các tổ hợp môn lựa chọn và cụm chuyên đề học tập theo nguyện vọng.',
            deliverable:
              'Học sinh phát triển năng lực chuyên sâu, sẵn sàng bước vào đại học, cao đẳng hoặc thị trường lao động.',
          },
        ],
      }),
      createElement(
        'p',
        { className: 'text-xs text-[#55676B] italic' },
        'Quy chuẩn thời gian: Toàn bộ các cấp học phổ thông thực hiện 35 tuần thực học/năm học; các nhà trường chủ động tổ chức dạy 1 buổi/ngày hoặc 2 buổi/ngày nhưng đều phải bảo đảm hoàn thành đầy đủ nội dung bắt buộc chung.',
      ),
    ),

    // PHẦN IV: CƠ CẤU TỔ CHỨC BỘ MÁY NHÀ TRƯỜNG PHỔ THÔNG (ĐIỀU LỆ 2020, TRANG 36 – 39)
    createElement(
      'section',
      { id: '4-co-cau-to-chuc-nha-truong', className: 'space-y-4' },
      createElement(
        'div',
        {
          className:
            'flex items-center gap-2 border-b border-[#CFDADB] pb-2 font-serif text-xl font-bold text-[#29383D]',
        },
        createElement(Layers, { className: 'h-5 w-5 text-[#3F6570]' }),
        createElement(
          'h3',
          null,
          '4. Cơ cấu Tổ chức Bộ máy Nhà trường Phổ thông theo Điều lệ 2020 (Trang 36 – 39)',
        ),
      ),
      createElement(ComparativeTable, {
        title:
          'Bảng Cơ cấu Tổ chức Bộ máy Nhà trường Phổ thông theo Điều lệ Trường học 2020 (Trang 36 – 39)',
        subtitle:
          'Quy định pháp lý về chức năng, thẩm quyền của các khối thiết chế trong nhà trường phổ thông (Thông tư 32/2020/TT-BGDĐT).',
        badge: 'Cơ cấu Tổ chức Điều lệ 2020',
        columns: [
          { key: 'organ', header: 'Khối cơ cấu tổ chức', widthClass: 'w-1/4' },
          { key: 'composition', header: 'Thành phần nhân sự quy định', widthClass: 'w-1/3' },
          { key: 'function', header: 'Chức năng, nhiệm vụ và thẩm quyền' },
        ],
        rows: [
          {
            organ: '1. Bộ máy Lãnh đạo & Quản lý',
            composition:
              'Cấp ủy Đảng lãnh đạo toàn diện; Hiệu trưởng (người đứng đầu, nhiệm kỳ 5 năm); các Phó Hiệu trưởng giúp việc.',
            function:
              'Hiệu trưởng chịu trách nhiệm cao nhất về tổ chức, quản lý chuyên môn và chất lượng giáo dục toàn diện của nhà trường.',
          },
          {
            organ: '2. Hội đồng trường',
            composition:
              'Từ 9 đến 13 thành viên: Bí thư cấp ủy, Hiệu trưởng, Chủ tịch Công đoàn, Bí thư Đoàn, đại diện tổ chuyên môn, tổ văn phòng và chính quyền địa phương.',
            function:
              'Cơ quan quyền lực quyết định phương hướng hoạt động, chiến lược phát triển, huy động và giám sát việc sử dụng các nguồn lực của nhà trường.',
          },
          {
            organ: '3. Tổ chuyên môn',
            composition:
              'Gồm giáo viên bộ môn, viên chức làm công tác thư viện, thiết bị dạy học, tư vấn tâm lý học đường; có Tổ trưởng và Tổ phó.',
            function:
              'Sinh hoạt định kỳ ít nhất 2 tuần/lần; thực hiện kế hoạch giáo dục, đổi mới phương pháp, kiểm tra đánh giá và sinh hoạt chuyên môn theo hướng nghiên cứu bài học.',
          },
          {
            organ: '4. Tổ văn phòng',
            composition:
              'Viên chức làm công tác văn thư, kế toán, thủ quỹ, y tế trường học và nhân viên bảo vệ, phục vụ.',
            function:
              'Bảo đảm công tác tài chính, hậu cần, y tế học đường, quản trị hồ sơ và hỗ trợ các hoạt động giáo dục trong nhà trường.',
          },
          {
            organ: '5. Các Hội đồng tư vấn',
            composition:
              'Hội đồng thi đua khen thưởng; Hội đồng kỷ luật học sinh (thành lập theo vụ việc, có đại diện Ban đại diện CMHS tham gia).',
            function:
              'Tham mưu, tư vấn cho Hiệu trưởng ra quyết định khen thưởng hoặc áp dụng biện pháp kỷ luật tích cực đúng quy chế.',
          },
          {
            organ: '6. Tổ chức lớp học sinh',
            composition:
              'Lớp học là đơn vị cơ sở (Tiểu học: không quá 35 HS; Trung học: không quá 45 HS); có Ban cán sự lớp (nhiệm kỳ không quá 2 học kỳ trong 1 cấp học); các tổ/nhóm.',
            function:
              'Thực hiện nền nếp học tập, rèn luyện; phát huy năng lực tự quản, tinh thần hợp tác và xây dựng tập thể lớp vững mạnh.',
          },
        ],
        footerNote:
          'Nguồn đối chiếu: Thông tư 28/2020/TT-BGDĐT (Điều lệ Tiểu học) và Thông tư 32/2020/TT-BGDĐT (Điều lệ Trung học).',
      }),
    ),

    // PHẦN V: TÌNH HUỐNG THỰC HÀNH 5 BƯỚC CUỐI BÀI
    createElement(
      'section',
      { id: '5-tinh-huong-thuc-hanh', className: 'space-y-4' },
      createElement(
        'div',
        {
          className:
            'flex items-center gap-2 border-b border-[#CFDADB] pb-2 font-serif text-xl font-bold text-[#29383D]',
        },
        createElement(HelpCircle, { className: 'h-5 w-5 text-[#3F6570]' }),
        createElement(
          'h3',
          null,
          '5. Tình huống Thực hành 5 Bước: Định hướng Nghề nghiệp ở Trường THPT',
        ),
      ),
      createElement(CaseStudyBox, { caseStudy: caseStudy3_1, defaultOpenSolution: false }),
    ),
  );
};

// ============================================================================
// 2. COMPONENT BÀI 3.2: BẢN CHẤT, ĐẶC ĐIỂM VÀ NGUYÊN TẮC HOẠT ĐỘNG GIÁO DỤC (TR. 39–47)
// ============================================================================

export const Lesson3_2View: FC = () => {
  const caseStudy3_2: PedagogicalCaseStudy = {
    id: 302,
    title: 'Giáo viên áp dụng hình phạt tập thể cứng nhắc khiến lớp học nảy sinh chia rẽ',
    context:
      'Trong giờ tự học, có một học sinh giấu phấn viết bảng của lớp nhưng không ai nhận. Giáo viên chủ nhiệm tức giận tuyên bố: "Nếu trong 5 phút người giấu phấn không tự giác đứng lên, cô sẽ phạt cả lớp chép phạt 20 lần nội quy và hạ một bậc hạnh kiểm của toàn bộ ban cán sự lớp." Cả lớp bức xúc, nghi kỵ đổ lỗi cho nhau và ban cán sự lớp đồng loạt xin từ chức.',
    question:
      'Vận dụng bản chất hoạt động giáo dục và hệ thống 6 nguyên tắc hoạt động giáo dục (đặc biệt là Nguyên tắc giáo dục trong tập thể và bằng tập thể; Nguyên tắc tôn trọng nhân cách học sinh kết hợp với yêu cầu hợp lí — Giáo trình HCMUE tr. 39–47), anh/chị hãy xử lí tình huống theo quy trình 5 bước.',
    principlesApplied: [
      'Bản chất hoạt động giáo dục: Thống nhất biện chứng giữa vai trò chủ đạo của GV và chủ thể tự giáo dục của HS (Giáo trình tr. 39–41)',
      'Nguyên tắc giáo dục trong tập thể và bằng tập thể (Giáo trình tr. 45)',
      'Nguyên tắc tôn trọng nhân cách học sinh kết hợp với yêu cầu hợp lí (Giáo trình tr. 45–46)',
    ],
    solutionSteps: [
      {
        step: 1,
        title: 'Bước 1: Nhận diện sự việc và xác định vấn đề cần giải quyết',
        content:
          'GVCN đã lạm dụng hình phạt liên đới tập thể một cách độc đoán, làm biến dạng nguyên tắc "giáo dục bằng tập thể", khiến tập thể lớp bị chia rẽ và ban cán sự lớp mất tinh thần tự quản.',
      },
      {
        step: 2,
        title: 'Bước 2: Thu thập thông tin và phân tích nguyên nhân theo Giáo trình HCMUE',
        content:
          'Theo Giáo trình HCMUE (tr. 45–46), giáo dục bằng tập thể là xây dựng dư luận tập thể lành mạnh để cảm hóa cá nhân, chứ không phải dùng hình phạt tập thể để tạo áp lực thù địch. Mặt khác, yêu cầu hợp lí phải gắn liền với sự công bằng và tôn trọng phẩm giá của từng học sinh.',
      },
      {
        step: 3,
        title: 'Bước 3: Đề xuất các phương án giải quyết khả thi',
        content:
          'Phương án 1: Giữ nguyên lệnh phạt để bảo vệ uy quyền của giáo viên (làm khủng hoảng trầm trọng hơn). Phương án 2: Hủy bỏ hình phạt chép phạt cả lớp, động viên ban cán sự lớp và mở kênh phản hồi riêng tư để học sinh trót mắc lỗi tự giác nhận lỗi với giáo viên.',
      },
      {
        step: 4,
        title: 'Bước 4: Lựa chọn phương án tối ưu và tổ chức thực hiện tác động sư phạm',
        content:
          'GVCN bình tĩnh thu hồi quyết định phạt tập thể, ghi nhận nỗ lực của ban cán sự lớp; đồng thời nhắn nhủ nhẹ nhàng nhưng nghiêm túc để học sinh trót giấu phấn có cơ hội gặp riêng hoặc gửi tin nhắn nhận lỗi mà không bị bêu riếu trước lớp.',
      },
      {
        step: 5,
        title: 'Bước 5: Đánh giá kết quả, theo dõi hỗ trợ và rút kinh nghiệm sư phạm',
        content:
          'Sau khi học sinh tự giác nhận lỗi riêng, GVCN hướng dẫn em khắc phục bằng một việc làm tích cực cho lớp, giữ kín danh tính để bảo vệ lòng tự trọng của em và củng cố sự đoàn kết của tập thể.',
      },
    ],
    pitfallsToAvoid: [
      'Dùng hình phạt tập thể ("một người làm cả lớp chịu") gây tâm lí bất mãn và đối kháng trong học sinh.',
      'Đổ trách nhiệm hành chính lên đầu ban cán sự lớp khiến học sinh sợ làm cán bộ lớp.',
    ],
    coreLesson:
      'Sức mạnh của nguyên tắc "Tôn trọng nhân cách kết hợp với yêu cầu hợp lí" nằm ở chỗ: mở cho học sinh một lối thoát danh dự để các em tự giác sửa sai bằng chính lòng tự trọng của mình.',
  };

  return createElement(
    'div',
    { className: 'space-y-8 text-[#29383D] leading-relaxed' },

    // 1. THANH METADATA & ĐỐI CHIẾU ĐẦU BÀI
    createElement(PedagogyMetadataBar, {
      courseCode: 'EDUC2802',
      lessonCode: 'EDUC2802-C3-L2',
      clos: ['CLO3', 'CLO4'],
      textbookPages: 'Giáo trình Giáo dục học HCMUE (Trang 39 – 47)',
      legalRefs: [
        'Giáo trình Giáo dục học HCMUE (Mục 3.2, Trang 39 – 47)',
        'Luật Giáo dục 2019 (Điều 3)',
      ],
      sessionNote: 'Mục 3.2 · Trang 39 – 47',
    }),

    // PHẦN I: BẢN CHẤT CỦA HOẠT ĐỘNG GIÁO DỤC (TRANG 39 – 41)
    createElement(
      'section',
      { id: '1-ban-chat-hoat-dong-giao-duc', className: 'space-y-4' },
      createElement(
        'div',
        {
          className:
            'flex items-center gap-2 border-b border-[#CFDADB] pb-2 font-serif text-xl font-bold text-[#29383D]',
        },
        createElement(Target, { className: 'h-5 w-5 text-[#3F6570]' }),
        createElement(
          'h3',
          null,
          '1. Bản chất của Hoạt động Giáo dục: Tương tác Biện chứng Hai mặt (Trang 39 – 41)',
        ),
      ),
      createElement(
        'div',
        {
          className: 'rounded-2xl border border-[#CFDADB] bg-[#F7FAFA] p-6 shadow-2xs space-y-4',
        },
        createElement(
          'span',
          {
            className:
              'inline-flex items-center rounded-md border border-[#718C7E]/30 bg-[#E8EFEB] px-2.5 py-0.5 font-mono text-xs font-semibold text-[#3F6570]',
          },
          'Bản chất Biện chứng Hai mặt',
        ),
        createElement(
          'p',
          { className: 'text-sm text-[#29383D] leading-relaxed' },
          'Theo Giáo trình Giáo dục học HCMUE (Trang 39 – 41), hoạt động giáo dục tổng thể là sự thống nhất hữu cơ, biện chứng giữa hai mặt:',
        ),
        createElement(
          'div',
          { className: 'grid gap-4 md:grid-cols-2' },
          createElement(
            'div',
            { className: 'rounded-xl border border-[#CFDADB] bg-[#EAF0F1]/70 p-4 space-y-2' },
            createElement(
              'h4',
              { className: 'font-serif text-base font-bold text-[#3F6570]' },
              'Vai trò chủ đạo của Nhà giáo dục (Giáo viên)',
            ),
            createElement(
              'p',
              { className: 'text-sm text-[#29383D] leading-relaxed' },
              'Định hướng mục tiêu phát triển nhân cách, thiết kế nội dung, tổ chức môi trường hoạt động và giao lưu, dẫn dắt, kiểm tra, đánh giá và điều chỉnh tác động sư phạm.',
            ),
          ),
          createElement(
            'div',
            { className: 'rounded-xl border border-[#CFDADB] bg-[#E8EFEB]/60 p-4 space-y-2' },
            createElement(
              'h4',
              { className: 'font-serif text-base font-bold text-[#3F6570]' },
              'Tính chủ thể tích cực của Người được giáo dục (Học sinh)',
            ),
            createElement(
              'p',
              { className: 'text-sm text-[#29383D] leading-relaxed' },
              'Tiếp nhận, hưởng ứng, tự ý thức và chủ động chuyển hóa các chuẩn mực xã hội thành niềm tin, tình cảm và hành vi thực tiễn thông qua quá trình tự rèn luyện và tự giáo dục.',
            ),
          ),
        ),
        createElement(
          'div',
          {
            className: 'rounded-xl border border-[#CFDADB] bg-[#F7FAFA] p-4 text-xs text-[#55676B]',
          },
          createElement('strong', { className: 'text-[#29383D]' }, 'Cơ chế chuyển hóa: '),
          'Quá trình giáo dục thực chất là quá trình xã hội hóa con người, biến các yêu cầu khách quan của xã hội thành nhu cầu chủ quan bên trong của nhân cách người học.',
        ),
      ),
    ),

    // PHẦN II: 4 ĐẶC ĐIỂM CỐT LÕI CỦA HOẠT ĐỘNG GIÁO DỤC (TRANG 41 – 43)
    createElement(
      'section',
      { id: '2-bon-dac-diem-hoat-dong-giao-duc', className: 'space-y-4' },
      createElement(
        'div',
        {
          className:
            'flex items-center gap-2 border-b border-[#CFDADB] pb-2 font-serif text-xl font-bold text-[#29383D]',
        },
        createElement(Layers, { className: 'h-5 w-5 text-[#3F6570]' }),
        createElement(
          'h3',
          null,
          '2. Bốn Đặc điểm Cốt lõi của Hoạt động Giáo dục (Giáo trình HCMUE Trang 41 – 43)',
        ),
      ),
      createElement(NumberedProcessFlow, {
        title: 'Hệ thống 4 Đặc điểm Đặc trưng Chi phối Tiến trình Sư phạm',
        subtitle:
          'Bốn quy luật vận động đòi hỏi tính bền bỉ, linh hoạt và nghệ thuật đối xử của người giáo viên (Trang 41 – 43).',
        badge: '4 Đặc điểm Hoạt động Giáo dục',
        columns: 1,
        steps: [
          {
            number: 1,
            title: '01. Tính mục đích',
            description:
              'Mọi tác động sư phạm đều phải quy tụ về mô hình nhân cách cần đào tạo theo yêu cầu thời đại; mục đích là sợi chỉ đỏ định hướng toàn bộ nội dung, phương pháp và hình thức tổ chức giáo dục.',
            keyAction:
              'Quán triệt mục tiêu phát triển phẩm chất, năng lực trong từng hoạt động giáo dục cụ thể.',
            deliverable:
              'Đảm bảo hoạt động giáo dục không bị lệch hướng hoặc rơi vào phong trào hình thức.',
          },
          {
            number: 2,
            title: '02. Tính phức hợp, lâu dài và liên tục',
            description:
              'Học sinh chịu tác động đa chiều từ nhà trường, gia đình và xã hội (cả tác động tích cực lẫn lực nhiễu tiêu cực); nhân cách hình thành qua nhiều mâu thuẫn, đòi hỏi tác động bền bỉ, không ngắt quãng; có hiện tượng "giáo dục lại" đối với học sinh cá biệt.',
            keyAction:
              'Kiên trì đồng hành, không nóng vội; thiết lập sự liên tục giữa các cấp học và môi trường sống.',
            deliverable:
              'Niềm tin đạo đức và thói quen hành vi được củng cố vững chắc, có sức đề kháng cao.',
          },
          {
            number: 3,
            title: '03. Tính cá biệt',
            description:
              'Mỗi học sinh có tâm sinh lý, hoàn cảnh, kinh nghiệm sống riêng biệt nên phản ứng khác nhau trước cùng một tác động sư phạm; cấm kỵ áp đặt rập khuôn, máy móc.',
            keyAction:
              'Tìm hiểu sâu sắc hoàn cảnh và tâm lý riêng biệt của từng học sinh để cá biệt hóa tác động.',
            deliverable: 'Phát huy tối đa tiềm năng riêng và lòng tự trọng của mỗi học sinh.',
          },
          {
            number: 4,
            title: '04. Tính thống nhất hệ thống',
            description:
              'Hoạt động giáo dục tổng thể thống nhất giữa hoạt động dạy học (chức năng trội là lĩnh hội tri thức, kỹ năng bộ môn) và hoạt động trải nghiệm, giáo dục ngoài giờ (chức năng trội là lĩnh hội giá trị sống, chuẩn mực xã hội).',
            keyAction:
              'Dạy chữ gắn liền với dạy người; lồng ghép giá trị đạo đức trong mọi tiết dạy văn hóa.',
            deliverable: 'Sự phát triển hài hòa, toàn diện về Đức – Trí – Thể – Mỹ của người học.',
          },
        ],
      }),
    ),

    // PHẦN III: BẢNG MA TRẬN HỆ THỐNG 6 NGUYÊN TẮC HOẠT ĐỘNG GIÁO DỤC (TRANG 43 – 47)
    createElement(
      'section',
      { id: '3-sau-nguyen-tac-hoat-dong-giao-duc', className: 'space-y-4' },
      createElement(
        'div',
        {
          className:
            'flex items-center gap-2 border-b border-[#CFDADB] pb-2 font-serif text-xl font-bold text-[#29383D]',
        },
        createElement(Compass, { className: 'h-5 w-5 text-[#3F6570]' }),
        createElement(
          'h3',
          null,
          '3. Bảng Ma trận Hệ thống 6 Nguyên tắc Hoạt động Giáo dục (Giáo trình HCMUE Trang 43 – 47)',
        ),
      ),
      createElement(ScholarQuote, {
        quote:
          'Yêu cầu đối với con người càng cao bao nhiêu thì càng phải tôn trọng nhân cách của họ bấy nhiêu.',
        author: 'A. S. Makarenko (1888 – 1939)',
        title:
          'Nhà giáo dục học lỗi lạc · Lý luận về Giáo dục Tập thể & Chủ nghĩa Nhân đạo Sư phạm',
        source: 'Giáo trình Giáo dục học HCMUE, Chương 3, Trang 45',
        historicalContext:
          'Luận điểm kinh điển đặt nền móng cho Nguyên tắc tôn trọng nhân cách học sinh kết hợp với yêu cầu hợp lí và Nguyên tắc giáo dục trong tập thể và bằng tập thể.',
      }),
      createElement(ComparativeTable, {
        title: 'Bảng Ma trận Hệ thống 6 Nguyên tắc Chỉ đạo Hoạt động Giáo dục ở Trường Phổ thông',
        subtitle:
          'Hệ thống các nguyên tắc mang tính quy luật chỉ đạo toàn bộ hành vi sư phạm của người giáo viên (Trang 43 – 47).',
        badge: '6 Nguyên tắc Hoạt động Giáo dục',
        columns: [
          { key: 'principle', header: 'Hệ thống 6 Nguyên tắc', widthClass: 'w-1/4' },
          { key: 'essence', header: 'Bản chất lý luận sư phạm' },
          { key: 'requirement', header: 'Yêu cầu thực thi đối với người giáo viên' },
        ],
        rows: [
          {
            principle: 'Nguyên tắc 1: Đảm bảo tính mục đích',
            essence:
              'Mọi hoạt động giáo dục phải quán triệt và hướng tới mục tiêu phát triển toàn diện phẩm chất và năng lực người học theo yêu cầu của xã hội.',
            requirement:
              'Quán triệt mục tiêu chung của hệ thống giáo dục quốc dân đến từng hoạt động cụ thể; kết hợp giữa mục tiêu môn học và mục tiêu hình thành phẩm chất.',
          },
          {
            principle:
              'Nguyên tắc 2: Gắn với thực tiễn đời sống, phối hợp Nhà trường - Gia đình - Xã hội',
            essence:
              'Hoạt động giáo dục phải bắt nguồn từ thực tiễn và phục vụ thực tiễn; thống nhất đồng bộ ba môi trường giáo dục.',
            requirement:
              'Nội dung giáo dục phải gần gũi thực tế; học sinh được trải nghiệm giải quyết vấn đề thực tế; nhà trường giữ vai trò chủ đạo liên kết 3 lực lượng.',
          },
          {
            principle: 'Nguyên tắc 3: Giáo dục trong tập thể và bằng tập thể',
            essence:
              'Tập thể học sinh vừa là môi trường, vừa là phương tiện giáo dục hữu hiệu; dư luận tập thể lành mạnh giúp điều chỉnh hành vi cá nhân.',
            requirement:
              'Xây dựng tập thể lớp đoàn kết, có dư luận lành mạnh; biến tập thể vừa thành môi trường, vừa thành phương tiện tự giáo dục; kết hợp hài hòa lợi ích cá nhân và tập thể.',
          },
          {
            principle: 'Nguyên tắc 4: Tôn trọng nhân cách kết hợp yêu cầu hợp lý đối với học sinh',
            essence:
              'Tôn trọng phẩm giá là cơ sở tạo niềm tin; yêu cầu hợp lý là động lực thúc đẩy học sinh vươn lên hoàn thiện nhân cách.',
            requirement:
              'Tôn trọng phẩm giá, lắng nghe học sinh, tuyệt đối không xúc phạm thân thể/tinh thần; đồng thời phải đặt ra yêu cầu cao, nghiêm túc, vừa sức để học sinh phấn đấu vươn lên.',
          },
          {
            principle: 'Nguyên tắc 5: Phù hợp đặc điểm lứa tuổi và cá tính học sinh',
            essence:
              'Mỗi độ tuổi và mỗi cá nhân có đặc điểm tâm sinh lý, kinh nghiệm sống riêng biệt đòi hỏi tác động sư phạm thích ứng.',
            requirement:
              'Nắm vững tâm sinh lý lứa tuổi và hoàn cảnh cá biệt; phối hợp giữa tính vừa sức chung (đại trà) và biện pháp tác động riêng (cá biệt hóa).',
          },
          {
            principle: 'Nguyên tắc 6: Đảm bảo tính hệ thống và tính liên tục',
            essence:
              'Nhân cách hình thành qua quá trình tích lũy liên tục; sự gián đoạn hay mâu thuẫn tác động sẽ phá vỡ thành quả giáo dục.',
            requirement:
              'Kế hoạch giáo dục nâng dần độ khó theo vòng xoáy ốc; tiến hành liên tục về thời gian, nhất quán về không gian; củng cố thường xuyên thành quả giáo dục.',
          },
        ],
        footerNote:
          'Nguồn đối chiếu: Giáo trình Giáo dục học HCMUE (Chương 3, Mục 3.2.3, Trang 43 – 47).',
      }),
      createElement(PrincipleMatrix, { defaultPrincipleId: 1 }),
    ),

    // PHẦN IV: TÌNH HUỐNG THỰC HÀNH 5 BƯỚC CUỐI BÀI
    createElement(
      'section',
      { id: '4-tinh-huong-thuc-hanh', className: 'space-y-4' },
      createElement(
        'div',
        {
          className:
            'flex items-center gap-2 border-b border-[#CFDADB] pb-2 font-serif text-xl font-bold text-[#29383D]',
        },
        createElement(HelpCircle, { className: 'h-5 w-5 text-[#3F6570]' }),
        createElement(
          'h3',
          null,
          '4. Tình huống Thực hành 5 Bước: Vận dụng 6 Nguyên tắc Hoạt động Giáo dục',
        ),
      ),
      createElement(CaseStudyBox, { caseStudy: caseStudy3_2, defaultOpenSolution: false }),
    ),
  );
};

// ============================================================================
// 3. COMPONENT BÀI 3.3: CẤU TRÚC THÀNH TỐ, PHƯƠNG PHÁP VÀ ĐÁNH GIÁ KẾT QUẢ HĐGD (TR. 47–65)
// ============================================================================

export const Lesson3_3View: FC = () => {
  const caseStudy3_3: PedagogicalCaseStudy = {
    id: 303,
    title: 'Lạm dụng phương pháp trách phạt bằng cách bắt học sinh đứng góc lớp và hạ điểm học tập',
    context:
      'Trong giờ học, em Q. (lớp 8) quên mang vở bài tập và nói chuyện riêng với bạn. Giáo viên bộ môn tức giận bắt em Q. đứng úp mặt vào góc tường suốt 45 phút trước lớp, đồng thời ghi điểm 0 vào cột điểm kiểm tra thường xuyên của môn học để răn đe.',
    question:
      'Vận dụng lý luận về 3 nhóm phương pháp giáo dục (đặc biệt là phương pháp Trách phạt trong nhóm Kích thích – điều chỉnh hành vi) và quy định đánh giá học sinh theo Thông tư 22/2021/TT-BGDĐT (Giáo trình HCMUE tr. 56–65), anh/chị hãy xử lí tình huống theo quy trình 5 bước.',
    principlesApplied: [
      '5 Nguyên tắc vàng khi sử dụng phương pháp Trách phạt (Giáo trình tr. 61–62)',
      'Thông tư 22/2021/TT-BGDĐT: Không dùng điểm số học tập để kỷ luật hành vi đạo đức/chuyên cần',
      'Nguyên tắc tôn trọng nhân cách học sinh kết hợp với yêu cầu hợp lí',
    ],
    solutionSteps: [
      {
        step: 1,
        title: 'Bước 1: Nhận diện sự việc và xác định vấn đề cần giải quyết',
        content:
          'Giáo viên đã mắc hai sai lầm nghiêm trọng: (1) Sử dụng hình phạt làm tổn thương danh dự học sinh trước tập thể (bắt úp mặt vào tường cả tiết); (2) Đánh đồng kết quả rèn luyện hành vi với điểm số đánh giá kết quả học tập, trái với quy định của Thông tư 22/2021/TT-BGDĐT.',
      },
      {
        step: 2,
        title: 'Bước 2: Thu thập thông tin và phân tích nguyên nhân theo Giáo trình HCMUE',
        content:
          'Theo Giáo trình HCMUE (tr. 61–62), phương pháp trách phạt chỉ có giá trị giáo dục khi đảm bảo sự công bằng, khách quan, giúp học sinh nhận thức được lỗi lầm và tuyệt đối không xúc phạm nhân phẩm hay thân thể người học. Đồng thời, Thông tư 22/2021 tách bạch rõ đánh giá kết quả rèn luyện và đánh giá kết quả học tập.',
      },
      {
        step: 3,
        title: 'Bước 3: Đề xuất các phương án giải quyết khả thi',
        content:
          'Phương án 1: Giữ nguyên điểm 0 để làm gương (vi phạm quy chế chuyên môn). Phương án 2: Hủy bỏ điểm 0 kỷ luật, cho em Q. cơ hội nộp bổ sung vở bài tập vào buổi sau kèm bài tập rèn luyện trách nhiệm cá nhân.',
      },
      {
        step: 4,
        title: 'Bước 4: Lựa chọn phương án tối ưu và tổ chức thực hiện tác động sư phạm',
        content:
          'Giáo viên trao đổi riêng với em Q. sau tiết học để tìm hiểu nguyên nhân quên vở, nhắc nhở rõ yêu cầu kỷ luật giờ học, yêu cầu em hoàn thành bài tập bù và chấm điểm công bằng theo đúng năng lực thực chất.',
      },
      {
        step: 5,
        title: 'Bước 5: Đánh giá kết quả, theo dõi hỗ trợ và rút kinh nghiệm sư phạm',
        content:
          'Kịp thời khích lệ khi em Q. chuẩn bị bài đầy đủ ở tiết học kế tiếp; thực hiện nghiêm quy chế đánh giá vì sự tiến bộ của học sinh theo Thông tư 22/2021/TT-BGDĐT.',
      },
    ],
    pitfallsToAvoid: [
      'Dùng điểm số học lực (điểm 0, điểm 1) làm công cụ trừng phạt vi phạm nội quy, tác phong.',
      'Trách phạt học sinh trong lúc giáo viên đang nóng giận hoặc làm nhục học sinh trước mặt tập thể lớp.',
    ],
    coreLesson:
      'Trong giáo dục hiện đại, khen thưởng là chủ đạo; trách phạt phải tuân thủ 5 nguyên tắc vàng, đúng quy chế pháp luật và luôn hướng tới việc khơi dậy ý thức tự sửa chữa của người học.',
  };

  return createElement(
    'div',
    { className: 'space-y-8 text-[#29383D] leading-relaxed' },

    // 1. THANH METADATA & ĐỐI CHIẾU ĐẦU BÀI
    createElement(PedagogyMetadataBar, {
      courseCode: 'EDUC2802',
      lessonCode: 'EDUC2802-C3-L3',
      clos: ['CLO4', 'CLO5'],
      textbookPages: 'Giáo trình Giáo dục học HCMUE (Trang 47 – 65)',
      legalRefs: [
        'Chương trình GDPT 2018 (TT 32/2018)',
        'Thông tư 27/2020/TT-BGDĐT (Đánh giá HS Tiểu học)',
        'Thông tư 22/2021/TT-BGDĐT (Đánh giá HS THCS & THPT)',
      ],
      sessionNote: 'Mục 3.3.1 – 3.3.5 · Trang 47 – 65',
    }),

    // PHẦN I: CẤU TRÚC MỤC TIÊU THEO CT GDPT 2018 (BẢNG 3.1)
    createElement(
      'section',
      { id: '1-cau-truc-muc-tieu-ct2018', className: 'space-y-4' },
      createElement(
        'div',
        {
          className:
            'flex items-center gap-2 border-b border-[#CFDADB] pb-2 font-serif text-xl font-bold text-[#29383D]',
        },
        createElement(Target, { className: 'h-5 w-5 text-[#3F6570]' }),
        createElement(
          'h3',
          null,
          '1. Cấu trúc Mục tiêu theo Chương trình GDPT 2018: 5 Phẩm chất & 10 Năng lực (Trang 47 – 51)',
        ),
      ),
      createElement(ComparativeTable, {
        title:
          'Bảng 3.1: Hệ thống 5 Phẩm chất Chủ yếu và 10 Năng lực Cốt lõi theo Chương trình GDPT 2018 (Trang 48 – 51)',
        subtitle:
          'Mô hình chuẩn đầu ra nhân cách người học xuyên suốt từ Lớp 1 đến Lớp 12 trong Giáo trình HCMUE.',
        badge: 'Bảng 3.1 · CT GDPT 2018',
        columns: [
          { key: 'category', header: 'Khối thành tố nhân cách', widthClass: 'w-1/4' },
          {
            key: 'components',
            header: 'Hệ thống các thành phần chuẩn đầu ra',
            widthClass: 'w-1/3',
          },
          { key: 'pathway', header: 'Con đường hình thành & Biểu hiện hành vi' },
        ],
        rows: [
          {
            category: '5 Phẩm chất chủ yếu',
            components: '1. Yêu nước; 2. Nhân ái; 3. Chăm chỉ; 4. Trung thực; 5. Trách nhiệm.',
            pathway:
              'Hình thành qua nội dung dạy học đạo đức, lối sống, văn hóa học đường, lao động tự phục vụ, công ích và các hoạt động tình nguyện vì cộng đồng.',
          },
          {
            category: '3 Năng lực chung',
            components:
              '1. Năng lực tự chủ và tự học; 2. Năng lực giao tiếp và hợp tác; 3. Năng lực giải quyết vấn đề và sáng tạo.',
            pathway:
              'Hình thành thông qua mọi môn học và hoạt động giáo dục ở tất cả các cấp học; là năng lực nền tảng cho việc học tập suốt đời.',
          },
          {
            category: '7 Năng lực đặc thù',
            components:
              '1. Ngôn ngữ; 2. Tính toán; 3. Khoa học; 4. Công nghệ; 5. Tin học; 6. Thẩm mỹ; 7. Thể chất.',
            pathway:
              'Hình thành và phát triển chủ yếu thông qua các môn học và hoạt động giáo dục chuyên biệt tương ứng (Toán, Ngữ văn, KHTN, Tin học, Nghệ thuật, GDTC...).',
          },
        ],
        footerNote:
          'Nguồn: Chương trình GDPT 2018 Tổng thể & Giáo trình Giáo dục học HCMUE (Trang 48 – 51).',
      }),
    ),

    // PHẦN II: KẾ HOẠCH GIÁO DỤC 3 CẤP HỌC (ĐỐI CHIẾU BẢNG 3.2, 3.3, 3.4)
    createElement(
      'section',
      { id: '2-ke-hoach-giao-duc-3-cap-hoc', className: 'space-y-4' },
      createElement(
        'div',
        {
          className:
            'flex items-center gap-2 border-b border-[#CFDADB] pb-2 font-serif text-xl font-bold text-[#29383D]',
        },
        createElement(BookOpen, { className: 'h-5 w-5 text-[#3F6570]' }),
        createElement(
          'h3',
          null,
          '2. Kế hoạch Giáo dục 3 Cấp học theo Chương trình GDPT 2018 (Trang 51 – 55)',
        ),
      ),
      createElement(ComparativeTable, {
        title:
          'Bảng Đối chiếu Kế hoạch Giáo dục 3 Cấp học (Tiểu học, THCS, THPT — Bảng 3.2, 3.3, 3.4 Giáo trình HCMUE)',
        subtitle:
          'Thời lượng học tập và cơ cấu môn học bắt buộc, môn lựa chọn và hoạt động giáo dục theo từng cấp học.',
        badge: 'Kế hoạch 3 Cấp học · CT 2018',
        columns: [
          { key: 'level', header: 'Cấp học phổ thông', widthClass: 'w-1/5' },
          { key: 'timeNorm', header: 'Thời lượng & Định mức tiết', widthClass: 'w-1/4' },
          { key: 'curriculumStructure', header: 'Cơ cấu các môn học và Hoạt động giáo dục' },
        ],
        rows: [
          {
            level: 'Cấp Tiểu học (5 năm)',
            timeNorm:
              '1050 tiết/năm (Lớp 4, 5); 875 tiết/năm (Lớp 1, 2); dạy học 2 buổi/ngày (không quá 7 tiết/ngày; 35 phút/tiết).',
            curriculumStructure:
              '10 môn học bắt buộc + 01 Hoạt động trải nghiệm (105 tiết/năm): Tiếng Việt, Toán, Đạo đức, Ngoại ngữ 1 (lớp 3–5), Tự nhiên và Xã hội (lớp 1–3), Lịch sử và Địa lí, Khoa học, Tin học và Công nghệ (lớp 3–5), GD thể chất, Nghệ thuật (Âm nhạc, Mĩ thuật).',
          },
          {
            level: 'Cấp THCS (4 năm)',
            timeNorm:
              'Khoảng 29 – 29.5 tiết/tuần; mỗi ngày học 1 buổi (không quá 5 tiết/buổi; 45 phút/tiết; khuyến khích 2 buổi/ngày).',
            curriculumStructure:
              'Các môn bắt buộc tích hợp: KHTN (140 tiết/năm), Lịch sử và Địa lí (105 tiết/năm), Ngữ văn, Toán, Ngoại ngữ 1, GD công dân, Công nghệ, Tin học, GD thể chất, Nghệ thuật, HĐTN-HN (105 tiết/năm), Nội dung giáo dục địa phương (35 tiết/năm).',
          },
          {
            level: 'Cấp THPT (3 năm)',
            timeNorm:
              'Khoảng 28 – 29 tiết/tuần; tổ chức dạy học phân hóa sâu theo nguyện vọng và năng lực học sinh.',
            curriculumStructure:
              'Bắt buộc: Ngữ văn, Toán, Ngoại ngữ 1, Lịch sử, GD thể chất, GDQPAN, HĐTN-HN (105 tiết/năm), GD địa phương (35 tiết/năm); Chọn 4 môn từ 9 môn lựa chọn (Địa lí, KT&PL, Vật lí, Hóa học, Sinh học, Công nghệ, Tin học, Âm nhạc, Mĩ thuật) + 3 cụm chuyên đề (105 tiết/năm).',
          },
        ],
        footerNote:
          'Nguồn: Chương trình GDPT 2018 (Thông tư 32/2018/TT-BGDĐT) & Giáo trình HCMUE Trang 51 – 55.',
      }),
    ),

    // PHẦN III: 3 NHÓM PHƯƠNG PHÁP GIÁO DỤC PHỔ THÔNG & LƯU ĐỒ THỰC HIỆN (TRANG 56 – 62)
    createElement(
      'section',
      { id: '3-ba-nhom-phuong-phap-giao-duc', className: 'space-y-4' },
      createElement(
        'div',
        {
          className:
            'flex items-center gap-2 border-b border-[#CFDADB] pb-2 font-serif text-xl font-bold text-[#29383D]',
        },
        createElement(Layers, { className: 'h-5 w-5 text-[#3F6570]' }),
        createElement(
          'h3',
          null,
          '3. Ba Nhóm Phương pháp Giáo dục Phổ thông & Lưu đồ Thực hiện (Trang 56 – 62)',
        ),
      ),
      createElement(
        'p',
        null,
        'Hệ thống phương pháp giáo dục tác động đồng bộ lên nhận thức, tình cảm và hành vi của học sinh thông qua ',
        createElement('strong', null, '3 nhóm phương pháp chính'),
        ' kèm quy trình thực hiện chuẩn mực:',
        createElement(
          Sidenote,
          { type: 'caution', number: 1 },
          '5 Nguyên tắc vàng khi trách phạt: (1) Mang tính giáo dục, tôn trọng nhân cách; (2) Khách quan, công bằng, để người vi phạm tự nhận lỗi; (3) Tuyệt đối không trách phạt cả tập thể; (4) Không trách phạt thường xuyên gây chai lì tâm lý; (5) Không nhắc lại lỗi cũ sau khi học sinh đã khắc phục.',
        ),
      ),
      createElement(NumberedProcessFlow, {
        title: '3 Nhóm Phương pháp Giáo dục Phổ thông và Lưu đồ Quy trình Chi tiết',
        subtitle:
          'Hệ thống các phương pháp giáo dục nhận thức, rèn luyện hành vi và kích thích động cơ (Giáo trình HCMUE Trang 56 – 62).',
        badge: '3 Nhóm Phương pháp GD',
        columns: 1,
        steps: [
          {
            number: 1,
            title: 'Nhóm 1: Phương pháp sử dụng ngôn ngữ (Giáo dục nhận thức và tình cảm)',
            description:
              'Thuyết trình - giảng giải: Trình bày logic, truyền cảm, kết hợp phương tiện trực quan để khơi gợi cảm xúc đạo đức. Đàm thoại: Gồm đàm thoại có chuẩn bị trước (theo hệ thống câu hỏi gợi mở dân chủ) và đàm thoại riêng biệt (tế nhị, chân tình với học sinh cá biệt). Kèm theo phương pháp Nêu gương sáng.',
            keyAction:
              'Sử dụng ngôn từ chuẩn mực, dẫn chứng thực tế sống động và đối thoại cởi mở.',
            deliverable: 'Nâng cao nhận thức đúng – sai và bồi đắp niềm tin đạo đức cho học sinh.',
          },
          {
            number: 2,
            title:
              'Nhóm 2: Phương pháp khám phá, thực hành, trải nghiệm (Hình thành hành vi và thói quen)',
            description:
              'Bao gồm 4 phương pháp cốt lõi: (1) Giải quyết vấn đề (Lưu đồ 4 bước: 1. Nhận biết mâu thuẫn -> 2. Lập kế hoạch & đề xuất giả thuyết -> 3. Tổ chức giải quyết -> 4. Kiểm tra, đánh giá); (2) Thực hành: Nắm vững quy tắc -> Thực hành mẫu -> Uốn nắn -> Luyện tập thường xuyên; (3) Hợp tác nhóm (3 bước: Tổ chức giao việc -> Hoạt động tự lực -> Báo cáo tổng kết); (4) Dự án (3 giai đoạn: Chuẩn bị -> Thực hiện -> Báo cáo đánh giá).',
            keyAction:
              'Tổ chức cho học sinh tự trải nghiệm, hợp tác và giải quyết các tình huống thực tế.',
            deliverable:
              'Kỹ năng hành động, thói quen đạo đức và năng lực sáng tạo trong đời sống.',
          },
          {
            number: 3,
            title: 'Nhóm 3: Phương pháp kích thích và điều chỉnh hoạt động (Củng cố động cơ)',
            description:
              'Thi đua: Kích thích nhu cầu khẳng định mình; thi đua công khai, khách quan, có ý nghĩa giáo dục. Khen thưởng: Biểu dương kịp thời, khen cả động cơ và sự nỗ lực tiến bộ; tránh khen thưởng chiếu lệ. Trách phạt: Phản đối hành vi sai trái, giúp người vi phạm hối hận sửa chữa (tuân thủ nghiêm ngặt 5 nguyên tắc vàng khi trách phạt).',
            keyAction:
              'Lấy khen thưởng làm chủ đạo; trách phạt đúng người, đúng mức và tôn trọng nhân phẩm.',
            deliverable:
              'Tạo động lực thi đua lành mạnh và tự giác điều chỉnh các hành vi lệch chuẩn.',
          },
        ],
      }),
    ),

    // PHẦN IV: ĐÁNH GIÁ KẾT QUẢ HOẠT ĐỘNG GIÁO DỤC (TT 27/2020 & TT 22/2021, TRANG 62–65)
    createElement(
      'section',
      { id: '4-danh-gia-ket-qua-tt27-tt22', className: 'space-y-4' },
      createElement(
        'div',
        {
          className:
            'flex items-center gap-2 border-b border-[#CFDADB] pb-2 font-serif text-xl font-bold text-[#29383D]',
        },
        createElement(Scale, { className: 'h-5 w-5 text-[#3F6570]' }),
        createElement(
          'h3',
          null,
          '4. Đánh giá Kết quả Hoạt động Giáo dục theo Thông tư 27/2020 và Thông tư 22/2021 (Trang 62–65)',
        ),
      ),
      createElement(ComparativeTable, {
        title:
          'Bảng Đối sánh Quy định Đánh giá Kết quả Hoạt động Giáo dục (Thông tư 27/2020 & Thông tư 22/2021)',
        subtitle:
          'Mục đích, nguyên tắc đánh giá vì sự tiến bộ và các mức xếp loại rèn luyện theo chuẩn Giáo trình HCMUE (Trang 62 – 65).',
        badge: 'Thông tư 27/2020 & TT 22/2021',
        columns: [
          { key: 'criteria', header: 'Tiêu chí đánh giá', widthClass: 'w-1/4' },
          { key: 'tt27', header: 'Cấp Tiểu học (Thông tư 27/2020/TT-BGDĐT)' },
          { key: 'tt22', header: 'Cấp THCS & THPT (Thông tư 22/2021/TT-BGDĐT)' },
        ],
        rows: [
          {
            criteria: 'Mục đích & Triết lý đánh giá',
            tt27: 'Đánh giá vì sự tiến bộ của học sinh; coi trọng việc động viên, khuyến khích sự cố gắng; không so sánh học sinh với nhau.',
            tt22: 'Cung cấp thông tin chính xác, kịp thời để học sinh điều chỉnh hoạt động rèn luyện; giáo viên điều chỉnh phương pháp dạy học và giáo dục.',
          },
          {
            criteria: 'Các mức đánh giá kết quả rèn luyện',
            tt27: 'Đánh giá sự hình thành phẩm chất, năng lực theo 3 mức: Tốt – Đạt – Cần cố gắng.',
            tt22: 'Đánh giá kết quả rèn luyện theo 4 mức: Tốt – Khá – Đạt – Chưa đạt trong từng học kỳ và cả năm học.',
          },
          {
            criteria: 'Đánh giá Hoạt động trải nghiệm / HĐTN, hướng nghiệp',
            tt27: 'Đánh giá bằng nhận xét theo 2 mức: Hoàn thành tốt (HTT), Hoàn thành (HT) và Chưa hoàn thành (CHT).',
            tt22: 'Môn học đánh giá bằng nhận xét (không cho điểm số), xếp loại 2 mức: Đạt (Đ) hoặc Chưa đạt (CĐ).',
          },
          {
            criteria: 'Đa dạng hóa công cụ đánh giá',
            tt27: 'Bảng kiểm (checklist), hồ sơ học tập (portfolio), phiếu tự đánh giá và đánh giá đồng đẳng.',
            tt22: 'Bảng kiểm, thang đo (rubric), hồ sơ học tập, bài kiểm tra viết, quan sát hành vi, khảo sát sản phẩm dự án.',
          },
        ],
        footerNote:
          'Nguồn: Thông tư 27/2020/TT-BGDĐT và Thông tư 22/2021/TT-BGDĐT (Giáo trình HCMUE Trang 62 – 65).',
      }),
    ),

    // PHẦN V: TÌNH HUỐNG THỰC HÀNH 5 BƯỚC CUỐI BÀI
    createElement(
      'section',
      { id: '5-tinh-huong-thuc-hanh', className: 'space-y-4' },
      createElement(
        'div',
        {
          className:
            'flex items-center gap-2 border-b border-[#CFDADB] pb-2 font-serif text-xl font-bold text-[#29383D]',
        },
        createElement(HelpCircle, { className: 'h-5 w-5 text-[#3F6570]' }),
        createElement(
          'h3',
          null,
          '5. Tình huống Thực hành 5 Bước: Phương pháp Trách phạt và Quy chế Đánh giá',
        ),
      ),
      createElement(CaseStudyBox, { caseStudy: caseStudy3_3, defaultOpenSolution: false }),
    ),
  );
};

// ============================================================================
// 4. COMPONENT BÀI 3.4: KĨ NĂNG VÀ QUY TRÌNH XỬ LÍ TÌNH HUỐNG GIÁO DỤC (TR. 65–66)
// ============================================================================

export const Lesson3_4View: FC = () => {
  const [openEssayId, setOpenEssayId] = useState<number | null>(1);

  const caseStudy3_4: PedagogicalCaseStudy = {
    id: 304,
    title:
      'Học sinh lớp 11 giật tài liệu vò nát nuốt vào miệng và thách thức giáo viên trong giờ kiểm tra',
    context:
      'Trong giờ kiểm tra 1 tiết môn Toán lớp 11, giáo viên phát hiện học sinh N. đang sử dụng tài liệu chép bài. Khi giáo viên bước đến yêu cầu nộp tài liệu, N. giật lại, vò nát mảnh giấy nhét vào miệng nuốt và có thái độ thách thức trước mặt cả lớp: "Thầy không có bằng chứng thì đừng vu khống em!".',
    question:
      'Vận dụng Quy trình 5 bước giải quyết tình huống giáo dục chuẩn mực theo Mục 3.3.6 Giáo trình HCMUE (tr. 65–66) và Điều 31, Điều 38 Thông tư 32/2020/TT-BGDĐT, anh/chị hãy xử lí tình huống sư phạm trên.',
    principlesApplied: [
      'Quy trình 5 bước giải quyết tình huống giáo dục (Mục 3.3.6 Giáo trình HCMUE tr. 65–66)',
      'Nguyên tắc tôn trọng nhân cách học sinh kết hợp với yêu cầu hợp lý',
      'Nguyên tắc đảm bảo tính mục đích trong hoạt động giáo dục',
      'Điều 31 & Điều 38 Thông tư 32/2020/TT-BGDĐT (Điều lệ trường trung học)',
    ],
    solutionSteps: [
      {
        step: 1,
        title: 'Bước 1 (Phân tích dữ kiện)',
        content:
          'Học sinh N. có hành vi gian lận thi cử nhưng dùng hành động tiêu cực để tiêu hủy bằng chứng; phản ứng thách thức xuất phát từ tâm lý hoảng loạn, sợ bị kỷ luật và nhu cầu tự vệ trước tập thể lớp.',
      },
      {
        step: 2,
        title: 'Bước 2 (Biểu đạt vấn đề)',
        content:
          'Mâu thuẫn giữa tính nghiêm túc, công bằng của kỳ thi và hành vi chống đối bột phát của học sinh; nguy cơ phá vỡ bầu không khí kiểm tra và tổn hại uy tín sư phạm nếu giáo viên nổi nóng đôi co.',
      },
      {
        step: 3,
        title: 'Bước 3 (Giả thuyết phương án & Chọn tối ưu)',
        content:
          'Phương án sai: Quát mắng, lôi học sinh lên phòng giám thị ngay lập tức (làm lớp mất tập trung, đẩy mâu thuẫn lên đỉnh điểm). Phương án tối ưu: Giữ bình tĩnh tuyệt đối; nói nhẹ nhàng nhưng dứt khoát: "Em tiếp tục làm bài của mình, việc đúng sai thầy trò mình sẽ làm việc riêng sau giờ thi"; lập biên bản sự việc bất thường cuối giờ với sự chứng kiến của cán bộ lớp; gặp riêng N. sau giờ kiểm tra để phân tích tâm lý, cho học sinh cơ hội tự nhận lỗi và làm bài kiểm tra lại.',
      },
      {
        step: 4,
        title: 'Bước 4 (Chứng minh khoa học)',
        content:
          'Vận dụng nguyên tắc "Tôn trọng nhân cách kết hợp yêu cầu hợp lý" (không dồn học sinh vào chân tường trước tập thể) và nguyên tắc "Đảm bảo tính mục đích" (giáo dục ý thức trung thực quan trọng hơn việc trừng phạt hành vi).',
      },
      {
        step: 5,
        title: 'Bước 5 (Kết luận sư phạm)',
        content:
          'Trong mọi xung đột sư phạm, sự điềm tĩnh và tôn trọng học sinh là công cụ mạnh nhất giúp hóa giải khủng hoảng tâm lý của học sinh.',
      },
    ],
    pitfallsToAvoid: [
      'Đôi co gay gắt hoặc dùng vũ lực giằng co mảnh giấy với học sinh ngay giữa giờ thi.',
      'Bêu riếu học sinh trước cả lớp khiến em nảy sinh tâm lý bất cần và chống đối cực đoan.',
    ],
    coreLesson:
      'Bản lĩnh sư phạm trong Quy trình 5 bước thể hiện ở "khoảng dừng chiến thuật": người thầy giữ cái đầu lạnh và trái tim nhân ái để hóa giải cơn bốc đồng của học sinh bằng sự điềm tĩnh và công bằng.',
  };

  return createElement(
    'div',
    { className: 'space-y-8 text-[#29383D] leading-relaxed' },

    // 1. THANH METADATA & ĐỐI CHIẾU ĐẦU BÀI
    createElement(PedagogyMetadataBar, {
      courseCode: 'EDUC2802',
      lessonCode: 'EDUC2802-C3-L4',
      clos: ['CLO4', 'CLO5'],
      textbookPages: 'Giáo trình Giáo dục học HCMUE (Trang 65 – 66)',
      legalRefs: [
        'Giáo trình Giáo dục học HCMUE (Mục 3.3.6, Trang 65 – 66)',
        'Thông tư 32/2020/TT-BGDĐT (Điều 31, 38)',
      ],
      sessionNote: 'Mục 3.3.6 · Trang 65 – 66',
    }),

    // PHẦN I: KHÁI NIỆM & ĐẶC TRƯNG TÌNH HUỐNG SƯ PHẠM (TRANG 65)
    createElement(
      'section',
      { id: '1-khai-niem-va-dac-trung', className: 'space-y-4' },
      createElement(
        'div',
        {
          className:
            'flex items-center gap-2 border-b border-[#CFDADB] pb-2 font-serif text-xl font-bold text-[#29383D]',
        },
        createElement(Sparkles, { className: 'h-5 w-5 text-[#3F6570]' }),
        createElement('h3', null, '1. Khái niệm và Đặc trưng của Tình huống Sư phạm (Trang 65)'),
      ),
      createElement(
        'div',
        {
          className: 'rounded-2xl border border-[#CFDADB] bg-[#F7FAFA] p-6 shadow-2xs space-y-3',
        },
        createElement(
          'span',
          {
            className:
              'inline-flex items-center rounded-md border border-[#718C7E]/30 bg-[#E8EFEB] px-2.5 py-0.5 font-mono text-xs font-semibold text-[#3F6570]',
          },
          'Định nghĩa Khoa học theo Giáo trình HCMUE',
        ),
        createElement(
          'p',
          { className: 'text-sm text-[#29383D] leading-relaxed' },
          createElement('strong', null, 'Tình huống giáo dục (tình huống sư phạm)'),
          ' là toàn bộ những sự việc, hiện tượng, hoàn cảnh có vấn đề bức xúc nảy sinh trong hoạt động và quan hệ giáo dục, buộc giáo viên phải tư duy khoa học và đưa ra cách giải quyết tối ưu nhằm đưa quan hệ giáo dục vào ổn định và phát triển.',
        ),
        createElement(
          'p',
          { className: 'text-xs text-[#55676B] leading-relaxed' },
          'Tính chất: Mang tính nghệ thuật, tính khoa học và sáng tạo cao; phản ánh các mâu thuẫn phức tạp, đa phương giữa học sinh với học sinh, học sinh với giáo viên, hoặc học sinh với gia đình/xã hội.',
        ),
      ),
    ),

    // PHẦN II: QUY TRÌNH 5 BƯỚC GIẢI QUYẾT TÌNH HUỐNG CHUẨN MỰC (TRANG 65 – 66)
    createElement(
      'section',
      { id: '2-quy-trinh-5-buoc-chuan-muc', className: 'space-y-4' },
      createElement(
        'div',
        {
          className:
            'flex items-center gap-2 border-b border-[#CFDADB] pb-2 font-serif text-xl font-bold text-[#29383D]',
        },
        createElement(Target, { className: 'h-5 w-5 text-[#3F6570]' }),
        createElement(
          'h3',
          null,
          '2. Quy trình 5 Bước Giải quyết Tình huống Giáo dục Chuẩn mực (Mục 3.3.6, Trang 65 – 66)',
        ),
      ),
      createElement(NumberedProcessFlow, {
        title: 'Quy trình 5 Bước Giải quyết Tình huống Sư phạm Tối ưu',
        subtitle:
          'Khung thao tác chuẩn mực ứng dụng xuyên suốt trong học phần Giáo dục học (Giáo trình HCMUE Trang 65 – 66).',
        badge: 'Quy trình 5 Bước · Mục 3.3.6',
        columns: 1,
        steps: [
          {
            number: 1,
            title: 'Bước 01: Phân tích dữ kiện đã cho và xác định dữ kiện quan trọng, chủ yếu',
            description:
              'Nghiên cứu kỹ bối cảnh, đối tượng tham gia, thời gian, không gian; bóc tách nguyên nhân bề nổi và nguyên nhân sâu xa; nhận diện dữ kiện then chốt của sự việc.',
            keyAction:
              'Lắng nghe đa chiều, kiềm chế cảm xúc tức giận và thu thập đầy đủ thông tin khách quan.',
            deliverable:
              'Bản phân tích đúng bản chất sự việc, không bị đánh lừa bởi hiện tượng nhất thời.',
          },
          {
            number: 2,
            title: 'Bước 02: Biểu đạt vấn đề cần giải quyết',
            description:
              'Phát biểu chính xác mâu thuẫn trung tâm; xác định rõ mục tiêu cần đạt được sau khi xử lý (giáo dục nhận thức, giải tỏa bức xúc tâm lý hay khôi phục trật tự lớp học).',
            keyAction: 'Xác định rõ trọng tâm sư phạm cần tháo gỡ cả về ngắn hạn và dài hạn.',
            deliverable: 'Mục tiêu giáo dục rõ ràng, nhân văn và định hướng tương lai.',
          },
          {
            number: 3,
            title:
              'Bước 03: Nêu giả thuyết về các phương án giải quyết và lựa chọn phương án tối ưu',
            description:
              'Liệt kê các cách xử lý khả dĩ (bao gồm các phản ứng sai lầm, cảm tính thường gặp); so sánh ưu - nhược điểm của từng cách; chọn ra giải pháp hợp lý và nhân văn nhất.',
            keyAction:
              'Loại bỏ giải pháp tiêu cực (xúc phạm, áp đặt độc đoán) và chọn phương án tối ưu.',
            deliverable:
              'Kịch bản xử lý tối ưu, vừa nghiêm khắc về nguyên tắc vừa bao dung về tình cảm.',
          },
          {
            number: 4,
            title: 'Bước 04: Chứng minh giả thuyết (Cơ sở khoa học của phương án tối ưu)',
            description:
              'Vận dụng các nguyên tắc giáo dục (tôn trọng nhân cách, giáo dục trong tập thể, phù hợp lứa tuổi), quy luật tâm sinh lý và chuẩn mực đạo đức sư phạm để biện giải cho phương án đã chọn.',
            keyAction:
              'Hành động khéo léo theo kịch bản tối ưu, tôn trọng lòng tự trọng của học sinh.',
            deliverable:
              'Hóa giải mâu thuẫn, giúp học sinh tự giác nhận ra lỗi lầm và khôi phục trật tự sư phạm.',
          },
          {
            number: 5,
            title: 'Bước 05: Rút ra kết luận sư phạm',
            description:
              'Đúc kết bài học nghiệp vụ cho bản thân và tập thể sư phạm nhằm chủ động phòng ngừa các tình huống tương tự trong tương lai; tiếp tục theo dõi, giúp đỡ học sinh tiến bộ.',
            keyAction:
              'Ghi chép nhật ký phản tư sư phạm và đồng hành hỗ trợ học sinh khắc phục khuyết điểm.',
            deliverable:
              'Sự trưởng thành về đạo đức của học sinh và nâng cao bản lĩnh nghề nghiệp của người thầy.',
          },
        ],
      }),
      createElement(LegalReferenceBox, {
        lawTitle: 'Thông tư số 32/2020/TT-BGDĐT (Điều lệ trường trung học)',
        article: 'Điều 31 (Hành vi, ứng xử của giáo viên) & Điều 38 (Khen thưởng và kỷ luật)',
        quote:
          'Giáo viên không được xúc phạm danh dự, nhân phẩm; xâm phạm thân thể của học sinh và đồng nghiệp. Học sinh vi phạm khuyết điểm trong quá trình học tập, rèn luyện được giáo dục hoặc xử lý kỷ luật theo các hình thức: Nhắc nhở, hỗ trợ, giúp đỡ trực tiếp; Khiển trách, thông báo với cha mẹ học sinh nhằm phối hợp giúp đỡ; Tạm dừng học ở trường có thời hạn.',
        source: 'Thông tư 32/2020/TT-BGDĐT (Giáo trình HCMUE Trang 64–66)',
        significance:
          'Hành lang pháp lý bắt buộc yêu cầu người giáo viên tuyệt đối không dùng nhục hình hay hạ nhục học sinh khi xử lí tình huống.',
      }),
    ),

    // PHẦN III: TÌNH HUỐNG THỰC HÀNH MẪU 5 BƯỚC (ỨNG DỤNG TOÀN DIỆN)
    createElement(
      'section',
      { id: '3-tinh-huong-thuc-hanh', className: 'space-y-4' },
      createElement(
        'div',
        {
          className:
            'flex items-center gap-2 border-b border-[#CFDADB] pb-2 font-serif text-xl font-bold text-[#29383D]',
        },
        createElement(HelpCircle, { className: 'h-5 w-5 text-[#3F6570]' }),
        createElement('h3', null, '3. Khung Tình huống Thực hành Mẫu 5 Bước: Ứng dụng Toàn diện'),
      ),
      createElement(CaseStudyBox, { caseStudy: caseStudy3_4, defaultOpenSolution: true }),
    ),

    // PHẦN IV: CÂU HỎI TỰ LUẬN ÔN TẬP CHƯƠNG 3
    createElement(
      'section',
      { id: '4-on-tap-va-de-cuong-chuong-3', className: 'space-y-5' },
      createElement(
        'div',
        {
          className:
            'flex items-center gap-2 border-b border-[#CFDADB] pb-2 font-serif text-xl font-bold text-[#29383D]',
        },
        createElement(Sparkles, { className: 'h-5 w-5 text-[#3F6570]' }),
        createElement(
          'h3',
          null,
          '4. Đề cương Câu hỏi Tự luận Trọng tâm Chương 3 (Giáo trình HCMUE)',
        ),
      ),
      createElement(
        'div',
        { className: 'space-y-3 pt-2' },
        [
          {
            id: 1,
            question:
              'Câu 1: Phân tích 4 đặc điểm của hoạt động giáo dục và làm rõ mối quan hệ biện chứng giữa vai trò chủ đạo của giáo viên và tính chủ thể tự giáo dục của học sinh.',
            outline: [
              'Bản chất hai mặt thống nhất biện chứng: giáo viên chủ đạo, học sinh chủ thể tự giáo dục (Giáo trình tr. 39–41).',
              'Phân tích 4 đặc điểm: Tính mục đích, Tính phức hợp - lâu dài - liên tục, Tính cá biệt, Tính thống nhất hệ thống (tr. 41–43).',
              'Cơ chế chuyển hóa: Giáo dục biến thành tự giáo dục, biến chuẩn mực xã hội thành nhu cầu nội tâm của học sinh.',
              'Liên hệ thực tiễn giảng dạy môn Toán ở trường THPT.',
            ],
          },
          {
            id: 2,
            question:
              'Câu 2: Trình bày hệ thống 6 nguyên tắc hoạt động giáo dục. Vì sao nói nguyên tắc "Tôn trọng nhân cách kết hợp với yêu cầu hợp lý" là hòn đá tảng của chủ nghĩa nhân đạo sư phạm?',
            outline: [
              'Khái niệm nguyên tắc hoạt động giáo dục và hệ thống 6 nguyên tắc (Giáo trình tr. 43–47).',
              'Phân tích luận điểm của A. S. Makarenko: "Yêu cầu càng cao bao nhiêu thì càng phải tôn trọng nhân cách bấy nhiêu".',
              'Hậu quả của việc tách rời: tôn trọng mà không yêu cầu dẫn đến buông lỏng; yêu cầu cao mà không tôn trọng dẫn đến độc đoán, áp đặt.',
              'Vận dụng giải quyết các bất đồng trong quan hệ thầy - trò hiện nay.',
            ],
          },
          {
            id: 3,
            question:
              'Câu 3: Phân tích 3 nhóm phương pháp giáo dục phổ thông. Nêu rõ 5 nguyên tắc vàng khi vận dụng phương pháp trách phạt đối với học sinh.',
            outline: [
              'Cơ sở phân loại: Nhận thức (Nhóm ngôn ngữ) – Hành vi (Nhóm thực hành trải nghiệm) – Động cơ (Nhóm kích thích điều chỉnh) (Giáo trình tr. 56–62).',
              'Phân tích nội dung và lưu đồ quy trình của từng nhóm phương pháp.',
              '5 nguyên tắc vàng khi trách phạt: 1. Mang tính giáo dục tôn trọng nhân cách; 2. Khách quan công bằng để HS tự nhận lỗi; 3. Không phạt cả tập thể; 4. Không phạt thường xuyên; 5. Không nhắc lại lỗi cũ sau khi đã sửa chữa (tr. 61–62).',
              'Đánh giá kết quả rèn luyện học sinh theo Thông tư 22/2021/TT-BGDĐT.',
            ],
          },
        ].map((item) =>
          createElement(
            'div',
            {
              key: item.id,
              className:
                'overflow-hidden rounded-2xl border border-[#CFDADB] bg-[#F7FAFA] shadow-2xs',
            },
            createElement(
              'button',
              {
                type: 'button',
                onClick: () => setOpenEssayId(openEssayId === item.id ? null : item.id),
                className:
                  'flex w-full items-center justify-between p-4 text-left font-serif text-sm font-bold text-[#29383D] transition-colors hover:bg-[#E1E9EA]/50 sm:text-base',
              },
              createElement('span', null, item.question),
              createElement(
                'span',
                { className: 'ml-3 shrink-0 font-mono text-xs text-[#3F6570]' },
                openEssayId === item.id ? 'Thu gọn' : 'Xem dàn ý',
              ),
            ),
            openEssayId === item.id &&
              createElement(
                'div',
                {
                  className:
                    'border-t border-[#CFDADB] bg-[#EAF0F1]/50 p-4 text-xs leading-relaxed text-[#29383D] sm:text-sm',
                },
                createElement(
                  'p',
                  { className: 'mb-2 font-semibold text-[#3F6570]' },
                  'Dàn ý trọng tâm theo Giáo trình Giáo dục học HCMUE:',
                ),
                createElement(
                  'ul',
                  { className: 'list-disc space-y-1.5 pl-5 text-[#55676B]' },
                  item.outline.map((point, idx) => createElement('li', { key: idx }, point)),
                ),
              ),
          ),
        ),
      ),
    ),
  );
};

// ============================================================================
// 5. BỘ ĐIỀU PHỐI (MODULE DISPATCHER) CHO CHƯƠNG 3 (EDUC2802)
// ============================================================================

export function getChapter3LessonModule(lessonId: string): CompiledLessonModule | null {
  if (
    lessonId === 'gdh-c3-b1-khai-quat-ve-giao-duc-pho-thong-viet-nam' ||
    lessonId === 'gdh-c3-b1-co-cau-to-chuc-truong-pho-thong-va-khai-niem-hoat-dong-giao-duc'
  ) {
    return {
      default: Lesson3_1View,
      frontmatter: {
        title: 'Bài 3.1: Khái quát về giáo dục phổ thông Việt Nam',
        description:
          'Khảo sát cấu trúc Hệ thống giáo dục quốc dân theo Luật Giáo dục 2019 và Quyết định 1981/QĐ-TTg, vai trò nền tảng và mục tiêu đổi mới giáo dục phổ thông theo Nghị quyết 29-NQ/TW và Nghị quyết 88/2014/QH13, phân tích kế hoạch giáo dục theo Chương trình GDPT 2018 và cơ cấu bộ máy tổ chức nhà trường phổ thông.',
        level: 'basic',
        tags: [
          'EDUC2802-C3-L1',
          'CLO3',
          'CLO4',
          'Hệ thống giáo dục quốc dân',
          'CT GDPT 2018',
          'Giáo trình tr. 32-39',
        ],
      },
      lessonMeta: {
        chapterNumber: 3,
        lessonNumber: 1,
        headings: [
          {
            id: '1-khung-co-cau-htgdqd',
            text: '1. Khung Cơ cấu Hệ thống Giáo dục Quốc dân Việt Nam (Trang 32 – 34)',
            depth: 2,
          },
          {
            id: '2-vai-tro-muc-tieu-doi-moi',
            text: '2. Vai trò, Mục tiêu và Định hướng Đổi mới Giáo dục Phổ thông (Trang 34 – 36)',
            depth: 2,
          },
          {
            id: '3-khung-ke-hoach-gdpt-2018',
            text: '3. Khung Kế hoạch Giáo dục Phổ thông 2018 (Trang 34 – 36)',
            depth: 2,
          },
          {
            id: '4-co-cau-to-chuc-nha-truong',
            text: '4. Cơ cấu Tổ chức Bộ máy Nhà trường Phổ thông theo Điều lệ 2020 (Trang 36 – 39)',
            depth: 2,
          },
          {
            id: '5-tinh-huong-thuc-hanh',
            text: '5. Tình huống Thực hành 5 Bước: Định hướng Nghề nghiệp ở Trường THPT',
            depth: 2,
          },
        ],
        blocks: [],
      },
    };
  }

  if (
    lessonId === 'gdh-c3-b2-ban-chat-dac-diem-va-nguyen-tac-cua-hoat-dong-giao-duc' ||
    lessonId === 'gdh-c3-b2-he-thong-6-nguyen-tac-giao-duc-hoc-sinh-pho-thong'
  ) {
    return {
      default: Lesson3_2View,
      frontmatter: {
        title: 'Bài 3.2: Bản chất, đặc điểm và nguyên tắc hoạt động giáo dục',
        description:
          'Khám phá bản chất tương tác biện chứng hai mặt giữa vai trò chủ đạo của giáo viên và tính tích cực tự giáo dục của học sinh; 4 đặc điểm chi phối tiến trình sư phạm và hệ thống 6 nguyên tắc chỉ đạo toàn vẹn hoạt động giáo dục trong trường phổ thông.',
        level: 'intermediate',
        tags: [
          'EDUC2802-C3-L2',
          'CLO3',
          'CLO4',
          'Bản chất HĐGD',
          '4 Đặc điểm HĐGD',
          '6 Nguyên tắc giáo dục',
          'Giáo trình tr. 39-47',
        ],
      },
      lessonMeta: {
        chapterNumber: 3,
        lessonNumber: 2,
        headings: [
          {
            id: '1-ban-chat-hoat-dong-giao-duc',
            text: '1. Bản chất của Hoạt động Giáo dục: Tương tác Biện chứng Hai mặt (Trang 39 – 41)',
            depth: 2,
          },
          {
            id: '2-bon-dac-diem-hoat-dong-giao-duc',
            text: '2. Bốn Đặc điểm Cốt lõi của Hoạt động Giáo dục (Trang 41 – 43)',
            depth: 2,
          },
          {
            id: '3-sau-nguyen-tac-hoat-dong-giao-duc',
            text: '3. Bảng Ma trận Hệ thống 6 Nguyên tắc Hoạt động Giáo dục (Trang 43 – 47)',
            depth: 2,
          },
          {
            id: '4-tinh-huong-thuc-hanh',
            text: '4. Tình huống Thực hành 5 Bước: Vận dụng 6 Nguyên tắc Hoạt động Giáo dục',
            depth: 2,
          },
        ],
        blocks: [],
      },
    };
  }

  if (
    lessonId === 'gdh-c3-b3-cau-truc-thanh-to-phuong-phap-va-danh-gia-ket-qua-hoat-dong-giao-duc' ||
    lessonId === 'gdh-c3-b3-muc-tieu-pham-chat-nang-luc-va-phuong-phap-giao-duc'
  ) {
    return {
      default: Lesson3_3View,
      frontmatter: {
        title: 'Bài 3.3: Cấu trúc thành tố, phương pháp và đánh giá giáo dục',
        description:
          'Hệ thống hóa mục tiêu theo 5 phẩm chất và 10 năng lực (CT GDPT 2018), đối chiếu kế hoạch giáo dục 3 cấp học, phân tích 3 nhóm phương pháp giáo dục phổ thông kèm lưu đồ quy trình, và chuẩn hóa phương pháp đánh giá kết quả theo Thông tư 27/2021 và Thông tư 22/2021.',
        level: 'intermediate',
        tags: [
          'EDUC2802-C3-L3',
          'CLO4',
          'CLO5',
          '5 Phẩm chất 10 Năng lực',
          '3 Nhóm phương pháp GD',
          'Giáo trình tr. 47-65',
        ],
      },
      lessonMeta: {
        chapterNumber: 3,
        lessonNumber: 3,
        headings: [
          {
            id: '1-cau-truc-muc-tieu-ct2018',
            text: '1. Cấu trúc Mục tiêu theo Chương trình GDPT 2018: 5 Phẩm chất & 10 Năng lực (Trang 47 – 51)',
            depth: 2,
          },
          {
            id: '2-ke-hoach-giao-duc-3-cap-hoc',
            text: '2. Kế hoạch Giáo dục 3 Cấp học theo Chương trình GDPT 2018 (Trang 51 – 55)',
            depth: 2,
          },
          {
            id: '3-ba-nhom-phuong-phap-giao-duc',
            text: '3. Ba Nhóm Phương pháp Giáo dục Phổ thông & Lưu đồ Thực hiện (Trang 56 – 62)',
            depth: 2,
          },
          {
            id: '4-danh-gia-ket-qua-tt27-tt22',
            text: '4. Đánh giá Kết quả Hoạt động Giáo dục theo Thông tư 27/2020 và Thông tư 22/2021 (Trang 62–65)',
            depth: 2,
          },
          {
            id: '5-tinh-huong-thuc-hanh',
            text: '5. Tình huống Thực hành 5 Bước: Phương pháp Trách phạt và Quy chế Đánh giá',
            depth: 2,
          },
        ],
        blocks: [],
      },
    };
  }

  if (lessonId === 'gdh-c3-b4-ki-nang-va-quy-trinh-xu-li-tinh-huong-giao-duc') {
    return {
      default: Lesson3_4View,
      frontmatter: {
        title: 'Bài 3.4: Kĩ năng và quy trình xử lí tình huống giáo dục',
        description:
          'Nhận diện khái niệm tình huống sư phạm, phân tích các nguyên nhân gây xung đột trong quan hệ giáo dục, chuẩn hóa quy trình 5 bước giải quyết tình huống giáo dục tối ưu và bài tập thực hành tình huống điển hình.',
        level: 'advanced',
        tags: [
          'EDUC2802-C3-L4',
          'CLO4',
          'CLO5',
          'Tình huống giáo dục',
          'Quy trình 5 bước',
          'Mục 3.3.6',
          'Giáo trình tr. 65-66',
        ],
      },
      lessonMeta: {
        chapterNumber: 3,
        lessonNumber: 4,
        headings: [
          {
            id: '1-khai-niem-va-dac-trung',
            text: '1. Khái niệm và Đặc trưng của Tình huống Sư phạm (Trang 65)',
            depth: 2,
          },
          {
            id: '2-quy-trinh-5-buoc-chuan-muc',
            text: '2. Quy trình 5 Bước Giải quyết Tình huống Giáo dục Chuẩn mực (Trang 65 – 66)',
            depth: 2,
          },
          {
            id: '3-tinh-huong-thuc-hanh',
            text: '3. Khung Tình huống Thực hành Mẫu 5 Bước: Ứng dụng Toàn diện',
            depth: 2,
          },
          {
            id: '4-on-tap-va-de-cuong-chuong-3',
            text: '4. Đề cương Câu hỏi Tự luận Trọng tâm Chương 3',
            depth: 2,
          },
        ],
        blocks: [],
      },
    };
  }

  return null;
}
