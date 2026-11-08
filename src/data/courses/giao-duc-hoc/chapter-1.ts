import type { CompiledLessonModule } from '@/content-runtime/loader';
import {
  CaseStudyBox,
  ComparativeTable,
  LegalReferenceBox,
  NumberedProcessFlow,
  PedagogyMetadataBar,
  PersonalDevelopmentPlan,
  ScholarQuote,
  TeacherStandardsMatrix,
} from '@/features/pedagogy';
import { Sidenote } from '@/shared/components/Sidenote';
import {
  Award,
  BookOpen,
  Compass,
  FileText,
  HelpCircle,
  Layers,
  Scale,
  Sparkles,
  Target,
  UserCheck,
} from 'lucide-react';
import { createElement, useState, type FC } from 'react';
import type { PedagogicalCaseStudy } from './course';

// ============================================================================
// 1. COMPONENT BÀI 1.1: HOẠT ĐỘNG SƯ PHẠM CỦA NGƯỜI GIÁO VIÊN (TR. 1–7)
// ============================================================================

export const Lesson1_1View: FC = () => {
  const caseStudy1_1: PedagogicalCaseStudy = {
    id: 101,
    title: 'Giáo viên dạy giỏi chuyên môn nhưng nóng nảy, xúc phạm học sinh trên lớp',
    context:
      'Thầy V. là giáo viên dạy môn Toán có chuyên môn vững vàng, nhiều học sinh đạt điểm cao trong các kỳ thi. Tuy nhiên, trên lớp thầy rất nóng tính và khắt khe. Khi học sinh không làm được bài hoặc hỏi lại kiến thức cơ bản, thầy thường đập bàn và mắng học sinh là "chậm hiểu", "đầu óc để đi đâu". Nhiều học sinh sợ hãi không dám hỏi bài, dần nảy sinh tâm lý tự ti và chán ghét môn Toán.',
    question:
      'Vận dụng đặc điểm "Nhân cách người giáo viên là công cụ lao động sư phạm chủ yếu" (Giáo trình HCMUE tr. 5–6) và quy định về nhiệm vụ, quyền hạn của giáo viên theo Luật Giáo dục 2019, anh/chị hãy xử lí tình huống theo quy trình 5 bước.',
    principlesApplied: [
      'Đặc điểm công cụ lao động sư phạm: Nhân cách người giáo viên (Giáo trình tr. 5–6)',
      'Điều 69, 72 Luật Giáo dục 2019 & Điều 27, 31 Thông tư 32/2020/TT-BGDĐT',
      'Nguyên tắc tôn trọng nhân cách học sinh kết hợp với yêu cầu hợp lí',
    ],
    solutionSteps: [
      {
        step: 1,
        title: 'Bước 1: Nhận diện sự việc và xác định vấn đề cần giải quyết',
        content:
          'Mâu thuẫn cốt lõi nằm ở sự bất cân xứng giữa năng lực chuyên môn bộ môn (cao) và tác phong ứng xử sư phạm (thiếu chuẩn mực) của thầy V., dẫn đến làm tổn thương tâm lí người học và triệt tiêu động lực học tập.',
      },
      {
        step: 2,
        title: 'Bước 2: Thu thập thông tin và phân tích nguyên nhân khách quan, chủ quan',
        content:
          'Xét theo 5 đặc điểm hoạt động sư phạm, công cụ lao động đặc trưng nhất của người thầy chính là nhân cách của bản thân. Hành vi đập bàn, mắng học sinh vi phạm quy định "tôn trọng nhân cách, không xúc phạm danh dự người học" tại Điều 69, 72 Luật Giáo dục 2019.',
      },
      {
        step: 3,
        title: 'Bước 3: Đề xuất các phương án giải quyết khả thi',
        content:
          'Phương án 1: Giữ nguyên cách dạy nghiêm khắc để ép điểm số (loại vì phản sư phạm). Phương án 2: Điều chỉnh kỹ năng quản trị cảm xúc, phân hóa câu hỏi vừa sức và thiết lập quy tắc đối thoại tôn trọng trong giờ Toán (lựa chọn tối ưu).',
      },
      {
        step: 4,
        title: 'Bước 4: Lựa chọn phương án tối ưu và tổ chức thực hiện tác động sư phạm',
        content:
          'Thầy V. chủ động thay đổi bầu không khí lớp học, cởi mở lắng nghe khó khăn nhận thức của học sinh, hướng dẫn từng bước cho học sinh trung bình – yếu và tuyệt đối không dùng ngôn từ miệt thị.',
      },
      {
        step: 5,
        title: 'Bước 5: Đánh giá kết quả, theo dõi hỗ trợ và rút kinh nghiệm sư phạm',
        content:
          'Theo dõi mức độ chủ động phát biểu của học sinh trong các tiết học tiếp theo; tự phản tư định kỳ về phong cách giao tiếp sư phạm theo Tiêu chuẩn 1 của Thông tư 20/2018/TT-BGDĐT.',
      },
    ],
    pitfallsToAvoid: [
      'Biện minh rằng "vì muốn học sinh giỏi nên mới mắng nặng lời" để hợp thức hóa hành vi thiếu kiềm chế cảm xúc.',
      'Tách rời nhiệm vụ giảng dạy kiến thức khỏi nhiệm vụ giáo dục và bảo vệ nhân phẩm người học.',
    ],
    coreLesson:
      'Trong hoạt động sư phạm, tri thức chuyên môn mới là điều kiện cần; nhân cách mẫu mực và lòng bao dung của người thầy mới là công cụ lao động quyết định chạm tới tâm hồn người học.',
  };

  return createElement(
    'div',
    { className: 'space-y-8 text-[#29383D] leading-relaxed' },

    // 1. THANH METADATA & ĐỐI CHIẾU ĐẦU BÀI
    createElement(PedagogyMetadataBar, {
      courseCode: 'EDUC2802',
      clos: ['CLO1', 'CLO2'],
      textbookPages: 'Tr. 1–7 (Chương 1, Mục 1.1)',
      legalRefs: [
        'Luật Giáo dục 2019 (Điều 66, 69, 70, 72)',
        'Điều lệ trường Tiểu học (TT 28/2020)',
        'Điều lệ trường Trung học (TT 32/2020)',
      ],
      sessionNote: 'Lý thuyết & Thảo luận Chương 1',
    }),

    // PHẦN I: VAI TRÒ VÀ CHỨC NĂNG CỦA NGƯỜI GIÁO VIÊN
    createElement(
      'section',
      { id: '1-vai-tro-chuc-nang', className: 'space-y-4' },
      createElement(
        'div',
        {
          className:
            'flex items-center gap-2 border-b border-[#CFDADB] pb-2 font-serif text-xl font-bold text-[#29383D]',
        },
        createElement(BookOpen, { className: 'h-5 w-5 text-[#3F6570]' }),
        createElement('h3', null, '1. Vai trò và chức năng của người giáo viên (Tr. 1–2)'),
      ),
      createElement(
        'p',
        null,
        'Theo Giáo trình Giáo dục học HCMUE (tr. 1–2), ',
        createElement('strong', { className: 'font-semibold text-[#29383D]' }, 'hoạt động sư phạm'),
        ' là hoạt động nghề nghiệp chuyên biệt của người giáo viên trong nhà trường phổ thông, được tổ chức một cách khoa học, có mục đích và có kế hoạch nhằm thực hiện hai chức năng thống nhất: ',
        createElement('strong', null, 'dạy học'),
        ' và ',
        createElement('strong', null, 'giáo dục'),
        ' để hình thành, phát triển toàn diện phẩm chất, năng lực người học.',
        createElement(
          Sidenote,
          { type: 'history', number: 1 },
          'J. A. Cômenxki (1592–1670) khẳng định: "Người giáo viên là người chuyển giao ngọn đuốc của nền văn minh, là sợi dây chuyền giữa các thế hệ. Dưới ánh mặt trời này không có chức vụ nào ưu việt cho bằng."',
        ),
      ),
      createElement(ScholarQuote, {
        quote:
          'Nghề thầy giáo là nghề cao quý nhất trong những nghề cao quý, nghề sáng tạo nhất trong những nghề sáng tạo vì nó đã sáng tạo ra những con người sáng tạo.',
        author: 'Phạm Văn Đồng (1906 – 2000)',
        title: 'Cố Thủ tướng Chính phủ nước Cộng hòa Xã hội Chủ nghĩa Việt Nam',
        source: 'Giáo trình Giáo dục học HCMUE, Chương 1, tr. 2',
        historicalContext:
          'Luận điểm khẳng định vị thế xã hội đặc biệt của người giáo viên trong việc đào tạo nguồn nhân lực chất lượng cao và bồi dưỡng nhân cách thế hệ trẻ.',
      }),
    ),

    // PHẦN II: NHIỆM VỤ VÀ QUYỀN HẠN THEO LUẬT GIÁO DỤC 2019 & ĐIỀU LỆ 2020
    createElement(
      'section',
      { id: '2-nhiem-vu-va-quyen-han', className: 'space-y-4' },
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
          '2. Nhiệm vụ và quyền hạn của giáo viên theo Luật Giáo dục 2019 và Điều lệ trường học 2020 (Tr. 2–4)',
        ),
      ),
      createElement(LegalReferenceBox, {
        lawTitle: 'Luật Giáo dục 2019 (Luật số 43/2019/QH14)',
        article: 'Điều 66, Điều 69 và Điều 70',
        quote:
          'Nhà giáo làm nhiệm vụ giảng dạy, giáo dục trong cơ sở giáo dục. Nhà giáo có nhiệm vụ: Giảng dạy, giáo dục theo mục tiêu, nguyên lý giáo dục, thực hiện đầy đủ và có chất lượng chương trình giáo dục; Gương mẫu thực hiện nghĩa vụ công dân, điều lệ nhà trường, quy tắc ứng xử của nhà giáo; Giữ gìn phẩm chất, uy tín, danh dự của nhà giáo; tôn trọng, đối xử công bằng với người học, bảo vệ các quyền, lợi ích chính đáng của người học; Học tập, rèn luyện để nâng cao phẩm chất đạo đức, trình độ chính trị, chuyên môn, nghiệp vụ, đổi mới phương pháp giảng dạy, nêu gương tốt cho người học.',
        source: 'Luật Giáo dục số 43/2019/QH14 (Giáo trình HCMUE tr. 2–3)',
        significance:
          'Xác lập hành lang pháp lý chuẩn mực về 4 nhóm nhiệm vụ và 5 nhóm quyền của nhà giáo trong toàn bộ hệ thống giáo dục quốc dân.',
      }),

      createElement(ComparativeTable, {
        title:
          'Bảng đối sánh Nhiệm vụ & Quyền hạn của Giáo viên theo Điều lệ trường học năm 2020 (Giáo trình tr. 3–4)',
        subtitle:
          'Đối chiếu quy định pháp quy giữa Điều lệ trường Tiểu học (Thông tư 28/2020/TT-BGDĐT) và Điều lệ trường THCS, THPT (Thông tư 32/2020/TT-BGDĐT).',
        badge: 'Ma trận Pháp quy · Điều lệ 2020',
        columns: [
          { key: 'criteria', header: 'Tiêu chí đối sánh', widthClass: 'w-1/4' },
          { key: 'primary', header: 'Giáo viên Tiểu học (TT 28/2020/TT-BGDĐT)' },
          { key: 'secondary', header: 'Giáo viên THCS & THPT (TT 32/2020/TT-BGDĐT)' },
        ],
        rows: [
          {
            criteria: 'Thực hiện chương trình & kế hoạch giáo dục',
            primary:
              'Thực hiện chương trình GDPT cấp tiểu học; chủ động xây dựng và thực hiện kế hoạch giáo dục, dạy học tích hợp và phân hóa theo đặc điểm tâm sinh lí học sinh nhỏ tuổi.',
            secondary:
              'Tổ chức hoạt động dạy học, giáo dục theo kế hoạch giáo dục của nhà trường và tổ chuyên môn; kiểm tra, đánh giá học sinh theo quy định của Bộ GD&ĐT (TT 22/2021).',
          },
          {
            criteria: 'Đạo đức, tác phong & Bảo vệ quyền lợi học sinh',
            primary:
              'Rèn luyện đạo đức, giữ gìn phẩm chất, danh dự, uy tín nhà giáo; thương yêu, tôn trọng, đối xử bình đẳng với học sinh, bảo vệ quyền và lợi ích hợp pháp của trẻ em.',
            secondary:
              'Giữ gìn phẩm chất, danh dự, uy tín của nhà giáo; gương mẫu trước học sinh, thương yêu, tôn trọng, đối xử công bằng với học sinh; kiên quyết phòng chống bạo lực học đường.',
          },
          {
            criteria: 'Phối hợp các lực lượng giáo dục',
            primary:
              'Phối hợp chặt chẽ với cha mẹ học sinh, Tổng phụ trách Đội TNTP Hồ Chí Minh và các tổ chức xã hội liên quan để giáo dục và chăm sóc học sinh.',
            secondary:
              'Phối hợp với giáo viên chủ nhiệm, các giáo viên bộ môn khác, gia đình học sinh, Đoàn TNCS Hồ Chí Minh, Đội TNTP Hồ Chí Minh trong dạy học và hoạt động trải nghiệm, hướng nghiệp.',
          },
          {
            criteria: 'Quyền hạn chuyên môn & Dân chủ',
            primary:
              'Được tự chủ thực hiện nhiệm vụ chuyên môn với sự hỗ trợ của tổ chuyên môn và nhà trường; được hưởng lương, phụ cấp, đào tạo nâng chuẩn trình độ.',
            secondary:
              'Được tự chủ thực hiện nhiệm vụ chuyên môn (lựa chọn phương pháp, học liệu); được dự giờ, tham gia hội đồng thi đua khen thưởng và kỷ luật khi giải quyết vấn đề liên quan đến học sinh.',
          },
        ],
        footerNote:
          'Nguồn đối chiếu: Điều 27, 29, 31 Thông tư 28/2020/TT-BGDĐT và Điều 27, 29, 31 Thông tư 32/2020/TT-BGDĐT (Giáo trình HCMUE tr. 3–4).',
      }),
    ),

    // PHẦN III: 5 ĐẶC ĐIỂM CỦA HOẠT ĐỘNG SƯ PHẠM (TR. 4–7)
    createElement(
      'section',
      { id: '3-nam-dac-diem-hoat-dong-su-pham', className: 'space-y-4' },
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
          '3. Phân tích 5 đặc điểm của hoạt động sư phạm (Giáo trình HCMUE tr. 4–7)',
        ),
      ),
      createElement(
        'p',
        null,
        'Hoạt động sư phạm là một dạng lao động xã hội đặc thù. Tính đặc thù đó được thể hiện tập trung qua 5 thành tố cấu trúc của quá trình lao động sư phạm:',
        createElement(
          Sidenote,
          { type: 'caution', number: 2 },
          'Bẫy sư phạm thực tế: Nhiều giáo viên trẻ chỉ tập trung trau dồi kiến thức môn học mà xem nhẹ việc rèn luyện tác phong, ngôn ngữ và cảm xúc cá nhân — tức làm suy yếu chính "công cụ nhân cách" của mình.',
        ),
      ),
      createElement(NumberedProcessFlow, {
        title: 'Hệ thống 5 Đặc điểm Đặc trưng của Hoạt động Sư phạm',
        subtitle:
          'Cấu trúc 5 phương diện phân biệt lao động của người giáo viên với các loại hình lao động nghề nghiệp khác trong xã hội (Giáo trình HCMUE tr. 4–7).',
        badge: '5 Đặc điểm Hoạt động Sư phạm',
        columns: 1,
        steps: [
          {
            number: 1,
            title: 'Mục đích của hoạt động sư phạm',
            description:
              'Hướng tới việc hình thành và phát triển toàn diện nhân cách người học (phẩm chất và năng lực) theo yêu cầu của xã hội. Mục đích sư phạm luôn mang tính định hướng tương lai lâu dài.',
            keyAction:
              'Chuyển hóa mục đích giáo dục vĩ mô của xã hội thành mục tiêu cụ thể của từng bài học và từng hoạt động giáo dục.',
            deliverable:
              'Sự trưởng thành về phẩm chất đạo đức, trí tuệ và năng lực hành động của thế hệ trẻ.',
          },
          {
            number: 2,
            title: 'Đối tượng của hoạt động sư phạm',
            description:
              'Là con người (học sinh) đang trong quá trình phát triển mạnh mẽ về thể chất và tâm lí – xã hội. Học sinh vừa là khách thể tiếp nhận tác động sư phạm, vừa là chủ thể tự ý thức, tự giáo dục.',
            keyAction:
              'Tôn trọng tính chủ thể, cá tính sáng tạo và kích hoạt năng lực tự học, tự rèn luyện của học sinh.',
            deliverable:
              'Mối quan hệ tương tác chủ thể – chủ thể dân chủ, tích cực giữa thầy và trò.',
          },
          {
            number: 3,
            title: 'Công cụ của hoạt động sư phạm (Công cụ nhân cách)',
            description:
              'Ngoài hệ thống tri thức khoa học, phương tiện dạy học và phương pháp sư phạm, công cụ lao động chủ yếu, đặc trưng và quyết định nhất chính là NHÂN CÁCH CỦA NGƯỜI GIÁO VIÊN.',
            keyAction:
              'Giáo dục bằng tấm gương sống động về đạo đức, trí tuệ, thái độ công bằng và lòng nhân ái ("Dùng nhân cách để tác động vào nhân cách").',
            deliverable:
              'Uy tín sư phạm đích thực và sức cảm hóa sâu sắc đối với tâm hồn học sinh.',
          },
          {
            number: 4,
            title: 'Sản phẩm của hoạt động sư phạm',
            description:
              'Là nhân cách phát triển toàn diện của người học (sản phẩm tinh thần, phi vật chất). Sản phẩm này kết tinh công sức của người thầy, tập thể sư phạm, gia đình, xã hội và chính nỗ lực của học sinh; tuyệt đối không cho phép tạo ra "phế phẩm".',
            keyAction:
              'Kiên trì đồng hành, hỗ trợ cá biệt hóa và đánh giá vì sự tiến bộ của từng học sinh.',
            deliverable:
              'Những công dân có phẩm chất tốt đẹp và năng lực thích ứng, sáng tạo trong đời sống.',
          },
          {
            number: 5,
            title: 'Môi trường và điều kiện của hoạt động sư phạm',
            description:
              'Diễn ra trong không gian sư phạm chuẩn mực (trong và ngoài nhà trường) nhưng luôn biến đổi linh hoạt về thời gian, không gian và tình huống tâm lí; đòi hỏi lao động trí óc cường độ cao và tính sáng tạo liên tục.',
            keyAction:
              'Rèn luyện bản lĩnh sư phạm, năng lực thích ứng và kỹ năng xử lí linh hoạt các tình huống sư phạm phát sinh.',
            deliverable:
              'Môi trường giáo dục an toàn, lành mạnh, thân thiện và giàu tính nhân văn.',
          },
        ],
      }),
    ),

    // PHẦN IV: HỘP TÌNH HUỐNG THỰC HÀNH 5 BƯỚC CUỐI BÀI
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
          '4. Tình huống Thực hành 5 Bước: Công cụ nhân cách trong hoạt động sư phạm',
        ),
      ),
      createElement(CaseStudyBox, { caseStudy: caseStudy1_1, defaultOpenSolution: false }),
    ),
  );
};

// ============================================================================
// 2. COMPONENT BÀI 1.2: NHÂN CÁCH VÀ CHUẨN NGHỀ NGHIỆP GIÁO VIÊN (TR. 7–9)
// ============================================================================

export const Lesson1_2View: FC = () => {
  const caseStudy1_2: PedagogicalCaseStudy = {
    id: 102,
    title: 'Giáo viên đăng ảnh bài kiểm tra của học sinh lên mạng xã hội để châm biếm',
    context:
      'Sau đợt kiểm tra giữa kì, cô K. (giáo viên trẻ mới vào nghề) chụp ảnh phần bài làm có câu trả lời sai ngây ngô của một học sinh trong lớp rồi đăng lên trang mạng xã hội cá nhân ở chế độ công khai kèm lời bình châm biếm. Bài viết nhanh chóng bị học sinh trong trường chia sẻ. Em học sinh có bài kiểm tra bị bạn bè trêu chọc, xấu hổ đến mức khủng hoảng tâm lí và xin nghỉ học.',
    question:
      'Đối chiếu với yêu cầu về phẩm chất, năng lực nhà giáo (Điều 67 Luật Giáo dục 2019) và Chuẩn nghề nghiệp giáo viên phổ thông (Thông tư 20/2018/TT-BGDĐT), anh/chị hãy phân tích và giải quyết tình huống theo quy trình 5 bước.',
    principlesApplied: [
      'Tiêu chuẩn 1 (Thông tư 20/2018): Đạo đức nhà giáo (Tiêu chí 1) & Phong cách nhà giáo (Tiêu chí 2)',
      'Tiêu chuẩn 3 (Thông tư 20/2018): Xây dựng văn hóa nhà trường & Trường học an toàn (Tiêu chí 8, 10)',
      'Nguyên tắc tôn trọng nhân cách học sinh kết hợp với yêu cầu hợp lí',
    ],
    solutionSteps: [
      {
        step: 1,
        title: 'Bước 1: Nhận diện sự việc và xác định vấn đề cần giải quyết',
        content:
          'Cô K. đã vi phạm quy tắc ứng xử và đạo đức nhà giáo trên không gian mạng, xâm phạm quyền riêng tư và danh dự của học sinh, gây khủng hoảng tâm lí học đường nghiêm trọng.',
      },
      {
        step: 2,
        title: 'Bước 2: Thu thập thông tin và phân tích nguyên nhân theo Thông tư 20/2018',
        content:
          'Đối chiếu Thông tư 20/2018/TT-BGDĐT, hành vi này vi phạm Tiêu chí 1 (Đạo đức nhà giáo), Tiêu chí 2 (Phong cách nhà giáo) và Tiêu chí 10 (Xây dựng trường học an toàn, phòng chống bạo lực học đường). Nguyên nhân do cô K. thiếu nhận thức về ranh giới bảo mật hồ sơ học tập và chuẩn mực văn hóa số.',
      },
      {
        step: 3,
        title: 'Bước 3: Đề xuất các phương án giải quyết khả thi',
        content:
          'Phương án 1: Chỉ xóa bài âm thầm và coi như không có chuyện gì (không giải quyết được tổn thương của học sinh). Phương án 2: Gỡ bài ngay lập tức, trực tiếp xin lỗi học sinh và phụ huynh, đồng thời phối hợp với GVCN ổn định dư luận lớp học (phương án chuẩn mực).',
      },
      {
        step: 4,
        title: 'Bước 4: Lựa chọn phương án tối ưu và tổ chức thực hiện tác động sư phạm',
        content:
          'Cô K. gỡ bỏ toàn bộ bài đăng, gặp riêng học sinh và gia đình để nhận lỗi chân thành; phối hợp cùng GVCN tuyên truyền trong lớp về sự tôn trọng lẫn nhau và khích lệ học sinh tự tin quay lại học tập.',
      },
      {
        step: 5,
        title: 'Bước 5: Đánh giá kết quả, theo dõi hỗ trợ và rút kinh nghiệm sư phạm',
        content:
          'Theo dõi sự hòa nhập và tâm lí của học sinh sau khi trở lại lớp; phụ đạo riêng phần kiến thức em còn hổng; nghiêm túc tự đánh giá và rèn luyện lại chuẩn nghề nghiệp theo Thông tư 20/2018.',
      },
    ],
    pitfallsToAvoid: [
      'Thanh minh rằng "đăng cho vui, đã che tên học sinh" để trốn tránh trách nhiệm đạo đức nhà giáo.',
      'Đổ lỗi cho học sinh hoặc bạn bè bình luận tiêu cực trên mạng xã hội.',
    ],
    coreLesson:
      'Phong cách nhà giáo (Tiêu chí 2 – Thông tư 20/2018) đòi hỏi sự chuẩn mực nhất quán cả trên bục giảng lẫn trên không gian mạng. Mọi thông tin đánh giá học sinh chỉ được sử dụng vì mục đích hỗ trợ sự tiến bộ của người học.',
  };

  return createElement(
    'div',
    { className: 'space-y-8 text-[#29383D] leading-relaxed' },

    // 1. THANH METADATA & ĐỐI CHIẾU ĐẦU BÀI
    createElement(PedagogyMetadataBar, {
      courseCode: 'EDUC2802',
      clos: ['CLO1', 'CLO2'],
      textbookPages: 'Tr. 7–9 (Chương 1, Mục 1.2)',
      legalRefs: [
        'Luật Giáo dục 2019 (Điều 67)',
        'Thông tư 20/2018/TT-BGDĐT (5 Tiêu chuẩn · 15 Tiêu chí)',
      ],
      sessionNote: 'Lý thuyết & Thảo luận Chương 1',
    }),

    // PHẦN I: YÊU CẦU VỀ PHẨM CHẤT & 5 NHÓM NĂNG LỰC NGHỀ NGHIỆP (TR. 7–8)
    createElement(
      'section',
      { id: '1-pham-chat-va-nang-luc', className: 'space-y-4' },
      createElement(
        'div',
        {
          className:
            'flex items-center gap-2 border-b border-[#CFDADB] pb-2 font-serif text-xl font-bold text-[#29383D]',
        },
        createElement(UserCheck, { className: 'h-5 w-5 text-[#3F6570]' }),
        createElement(
          'h3',
          null,
          '1. Yêu cầu về phẩm chất và 5 nhóm năng lực nghề nghiệp của người giáo viên (Tr. 7–8)',
        ),
      ),
      createElement(
        'p',
        null,
        'Nhân cách người giáo viên phổ thông là sự thống nhất biện chứng giữa ',
        createElement('strong', null, 'Phẩm chất đạo đức (Đức)'),
        ' và ',
        createElement('strong', null, 'Năng lực sư phạm (Tài)'),
        '. Theo Điều 67 Luật Giáo dục 2019 và Giáo trình Giáo dục học HCMUE (tr. 7–8), người giáo viên cần đáp ứng chuẩn trình độ đào tạo và hệ thống phẩm chất, năng lực chuyên biệt:',
        createElement(
          Sidenote,
          { type: 'pedagogy', number: 1 },
          'Chủ tịch Hồ Chí Minh căn dặn: "Có tài mà không có đức là người vô dụng. Có đức mà không có tài thì làm việc gì cũng khó." Đối với người thầy, đạo đức là cái gốc, năng lực sư phạm là phương tiện hiện thực hóa sứ mệnh giáo dục.',
        ),
      ),
      createElement(LegalReferenceBox, {
        lawTitle: 'Luật Giáo dục 2019 (Luật số 43/2019/QH14)',
        article: 'Điều 67. Tiêu chuẩn của nhà giáo',
        quote:
          'Nhà giáo phải có những tiêu chuẩn sau đây: 1. Có phẩm chất, tư tưởng, đạo đức tốt; 2. Đạt chuẩn trình độ được đào tạo theo quy định; 3. Đủ sức khỏe theo yêu cầu nghề nghiệp; 4. Lý lịch bản thân rõ ràng.',
        source: 'Luật số 43/2019/QH14 (Giáo trình HCMUE tr. 7)',
        significance:
          'Là cơ sở pháp lý để Bộ Giáo dục và Đào tạo cụ thể hóa thành Chuẩn nghề nghiệp giáo viên cơ sở giáo dục phổ thông.',
      }),

      createElement(NumberedProcessFlow, {
        title: 'Hệ thống 5 Nhóm Năng lực Nghề nghiệp Cốt lõi của Giáo viên Phổ thông',
        subtitle:
          'Cấu trúc năng lực thực thi hoạt động dạy học và giáo dục theo Giáo trình Giáo dục học HCMUE (tr. 7–8).',
        badge: '5 Nhóm Năng lực Sư phạm',
        columns: 1,
        steps: [
          {
            number: 1,
            title: 'Nhóm năng lực tìm hiểu người học và môi trường giáo dục',
            description:
              'Năng lực nắm bắt đặc điểm tâm sinh lí lứa tuổi, hoàn cảnh gia đình, trình độ nhận thức, nhu cầu của học sinh và khảo sát điều kiện kinh tế – văn hóa – xã hội của địa phương.',
            keyAction:
              'Sử dụng quan sát sư phạm, trò chuyện, nghiên cứu hồ sơ và phối hợp gia đình để thấu hiểu từng học sinh.',
          },
          {
            number: 2,
            title: 'Nhóm năng lực dạy học (Chuyên môn & Nghiệp vụ dạy học)',
            description:
              'Nắm vững kiến thức khoa học bộ môn và Chương trình GDPT 2018; thiết kế kế hoạch bài dạy; vận dụng linh hoạt các phương pháp, kĩ thuật dạy học tích cực và kiểm tra đánh giá vì sự tiến bộ của học sinh.',
            keyAction:
              'Tổ chức hoạt động học tập phát triển phẩm chất và năng lực đặc thù môn học cho học sinh.',
          },
          {
            number: 3,
            title: 'Nhóm năng lực giáo dục và công tác chủ nhiệm lớp',
            description:
              'Năng lực thiết kế và tổ chức các hoạt động giáo dục đạo đức, lối sống, hoạt động trải nghiệm – hướng nghiệp; xây dựng tập thể học sinh tự quản, tư vấn tâm lí và xử lí tình huống sư phạm.',
            keyAction:
              'Quản lí lớp học tích cực, cảm hóa học sinh và điều phối các lực lượng giáo dục trong và ngoài trường.',
          },
          {
            number: 4,
            title: 'Nhóm năng lực giao tiếp và ứng xử sư phạm',
            description:
              'Sử dụng ngôn ngữ và phi ngôn ngữ chuẩn mực, giàu sức thuyết phục; lắng nghe thấu cảm; thiết lập quan hệ tôn trọng, hợp tác với học sinh, đồng nghiệp và cha mẹ học sinh.',
            keyAction:
              'Giải quyết hài hòa các mâu thuẫn nảy sinh và tạo dựng bầu không khí tâm lí an toàn, dân chủ.',
          },
          {
            number: 5,
            title: 'Nhóm năng lực tự học, nghiên cứu khoa học và phát triển nghề nghiệp',
            description:
              'Khả năng tự đánh giá bản thân theo Chuẩn nghề nghiệp, lập kế hoạch tự bồi dưỡng thường xuyên, nghiên cứu khoa học sư phạm ứng dụng, sử dụng ngoại ngữ và công nghệ thông tin.',
            keyAction:
              'Cập nhật tri thức mới, chia sẻ kinh nghiệm trong cộng đồng học tập chuyên môn (PLC).',
          },
        ],
      }),
    ),

    // PHẦN II: CHUẨN NGHỀ NGHIỆP GIÁO VIÊN PHỔ THÔNG THEO THÔNG TƯ 20/2018 (TR. 8–9)
    createElement(
      'section',
      { id: '2-chuan-nghe-nghiep-tt20', className: 'space-y-4' },
      createElement(
        'div',
        {
          className:
            'flex items-center gap-2 border-b border-[#CFDADB] pb-2 font-serif text-xl font-bold text-[#29383D]',
        },
        createElement(Award, { className: 'h-5 w-5 text-[#3F6570]' }),
        createElement(
          'h3',
          null,
          '2. Chuẩn nghề nghiệp giáo viên phổ thông theo Thông tư 20/2018/TT-BGDĐT (Tr. 8–9)',
        ),
      ),
      createElement(
        'p',
        null,
        'Thông tư số 20/2018/TT-BGDĐT ngày 22/8/2018 của Bộ trưởng Bộ Giáo dục và Đào tạo ban hành Quy định chuẩn nghề nghiệp giáo viên cơ sở giáo dục phổ thông gồm ',
        createElement('strong', null, '5 tiêu chuẩn và 15 tiêu chí'),
        ', mỗi tiêu chí được phân chia thành 3 mức độ đánh giá: ',
        createElement('strong', null, 'Mức Đạt – Mức Khá – Mức Tốt'),
        '.',
        createElement(
          Sidenote,
          { type: 'pedagogy', number: 2 },
          'Chu kỳ đánh giá theo Thông tư 20/2018: Giáo viên tự đánh giá theo chu kỳ 01 năm/lần vào cuối năm học; người đứng đầu cơ sở giáo dục phổ thông tổ chức đánh giá giáo viên theo chu kỳ 02 năm/lần.',
        ),
      ),

      createElement(ComparativeTable, {
        title:
          'Bảng tổng hợp Cấu trúc 5 Tiêu chuẩn – 15 Tiêu chí Chuẩn nghề nghiệp Giáo viên phổ thông (Thông tư 20/2018/TT-BGDĐT)',
        subtitle:
          'Khung tham chiếu toàn diện về phẩm chất và năng lực nghề nghiệp của giáo viên Tiểu học, THCS và THPT (Giáo trình HCMUE tr. 8–9).',
        badge: 'Thông tư 20/2018/TT-BGDĐT',
        columns: [
          { key: 'standard', header: 'Tiêu chuẩn (Điều khoản)', widthClass: 'w-1/4' },
          { key: 'count', header: 'Số tiêu chí', widthClass: 'w-28' },
          { key: 'criteriaList', header: 'Các tiêu chí thành phần (15 Tiêu chí)' },
          { key: 'focus', header: 'Trọng tâm đánh giá' },
        ],
        rows: [
          {
            standard: 'Tiêu chuẩn 1: Phẩm chất nhà giáo (Điều 4)',
            count: '02 tiêu chí',
            criteriaList: 'Tiêu chí 1: Đạo đức nhà giáo; Tiêu chí 2: Phong cách nhà giáo.',
            focus:
              'Tuân thủ quy định đạo đức, lối sống trung thực, tác phong mẫu mực và ứng xử văn hóa.',
          },
          {
            standard: 'Tiêu chuẩn 2: Phát triển chuyên môn, nghiệp vụ (Điều 5)',
            count: '05 tiêu chí',
            criteriaList:
              'TC 3: Phát triển chuyên môn bản thân; TC 4: Xây dựng kế hoạch dạy học và GD; TC 5: Sử dụng PPDH và GD; TC 6: Kiểm tra, đánh giá; TC 7: Tư vấn và hỗ trợ học sinh.',
            focus:
              'Năng lực cốt lõi về dạy học, giáo dục và đánh giá theo hướng phát triển phẩm chất, năng lực học sinh.',
          },
          {
            standard: 'Tiêu chuẩn 3: Xây dựng môi trường giáo dục (Điều 6)',
            count: '03 tiêu chí',
            criteriaList:
              'TC 8: Xây dựng văn hóa nhà trường; TC 9: Thực hiện quyền dân chủ trong nhà trường; TC 10: Xây dựng trường học an toàn, phòng chống bạo lực học đường.',
            focus:
              'Kiến tạo không gian học đường lành mạnh, dân chủ, an toàn về thể chất và tâm lí cho người học.',
          },
          {
            standard:
              'Tiêu chuẩn 4: Phát triển mối quan hệ giữa nhà trường, gia đình và xã hội (Điều 7)',
            count: '02 tiêu chí',
            criteriaList:
              'TC 11: Tạo dựng mối quan hệ hợp tác với cha mẹ hoặc người giám hộ của học sinh; TC 12: Phối hợp giữa nhà trường, gia đình, xã hội để thực hiện HĐGD.',
            focus:
              'Kết nối đồng thuận giữa giáo viên với phụ huynh và các lực lượng xã hội trong dạy học và giáo dục đạo đức.',
          },
          {
            standard:
              'Tiêu chuẩn 5: Sử dụng ngoại ngữ hoặc tiếng dân tộc, ứng dụng CNTT, khai thác và sử dụng thiết bị công nghệ trong dạy học, giáo dục (Điều 8)',
            count: '03 tiêu chí',
            criteriaList:
              'TC 13: Sử dụng ngoại ngữ hoặc tiếng dân tộc; TC 14: Ứng dụng CNTT, khai thác và sử dụng thiết bị công nghệ; TC 15: Báo cáo, chia sẻ kinh nghiệm (tích hợp trong phát triển chuyên môn).',
            focus:
              'Năng lực hội nhập, chuyển đổi số, khai thác thiết bị dạy học hiện đại và lan tỏa kinh nghiệm sư phạm.',
          },
        ],
        footerNote:
          'Căn cứ: Thông tư số 20/2018/TT-BGDĐT ngày 22/8/2018 của Bộ Giáo dục và Đào tạo (Giáo trình HCMUE tr. 8–9).',
      }),

      createElement(
        'div',
        { className: 'pt-2' },
        createElement(TeacherStandardsMatrix, { defaultStandardId: 1 }),
      ),
    ),

    // PHẦN III: TÌNH HUỐNG THỰC HÀNH 5 BƯỚC CUỐI BÀI
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
        createElement(
          'h3',
          null,
          '3. Tình huống Thực hành 5 Bước: Đạo đức và phong cách nhà giáo theo Thông tư 20/2018',
        ),
      ),
      createElement(CaseStudyBox, { caseStudy: caseStudy1_2, defaultOpenSolution: false }),
    ),
  );
};

// ============================================================================
// 3. COMPONENT BÀI 1.3: PHÁT TRIỂN NGHỀ NGHIỆP GIÁO VIÊN PHỔ THÔNG (TR. 9–12)
// ============================================================================

export const Lesson1_3View: FC = () => {
  const [openEssayId, setOpenEssayId] = useState<number | null>(1);

  const caseStudy1_3: PedagogicalCaseStudy = {
    id: 103,
    title: 'Giáo viên lâu năm ngại đổi mới phương pháp và từ chối sinh hoạt chuyên môn theo NCBH',
    context:
      'Tại tổ Toán của trường THPT X., khi tổ trưởng triển khai sinh hoạt chuyên môn theo hướng nghiên cứu bài học (NCBH) và ứng dụng phần mềm mô phỏng hình học động để dạy Chương trình GDPT 2018, thầy M. (giáo viên có 18 năm thâm niên) phản đối: "Tôi dạy bảng phấn truyền thống bao năm nay học sinh vẫn đậu đại học. Mấy cái cộng đồng học tập với công nghệ số chỉ mất thời gian, dành cho giáo viên trẻ mới ra trường thôi."',
    question:
      'Dưới góc độ lý luận về Phát triển nghề nghiệp giáo viên phổ thông (Giáo trình HCMUE tr. 9–12) và Thông tư 20/2018/TT-BGDĐT, anh/chị hãy phân tích và giải quyết tình huống theo quy trình 5 bước.',
    principlesApplied: [
      'Bản chất phát triển nghề nghiệp giáo viên là quá trình học tập suốt đời (Giáo trình tr. 9–12)',
      '5 định hướng hình thức phát triển nghề nghiệp: Sinh hoạt tổ chuyên môn, Cộng đồng học tập chuyên môn (PLC), Ứng dụng CNTT',
      'Tiêu chí 3 & Tiêu chí 14 của Thông tư 20/2018/TT-BGDĐT',
    ],
    solutionSteps: [
      {
        step: 1,
        title: 'Bước 1: Nhận diện sự việc và xác định vấn đề cần giải quyết',
        content:
          'Thầy M. đang có tâm lí bảo thủ kinh nghiệm, hiểu chưa đúng bản chất phát triển nghề nghiệp liên tục và e ngại rào cản công nghệ khi chuyển sang Chương trình GDPT 2018.',
      },
      {
        step: 2,
        title: 'Bước 2: Thu thập thông tin và phân tích nguyên nhân',
        content:
          'Theo Giáo trình HCMUE (tr. 9–10), phát triển nghề nghiệp giáo viên không chỉ dành cho giáo viên mới mà là yêu cầu bắt buộc đối với mọi giáo viên trong suốt sự nghiệp nhằm thích ứng với sự thay đổi của chương trình và người học. Thầy M. có thế mạnh về kinh nghiệm giải toán nhưng thiếu sự hỗ trợ kỹ thuật CNTT.',
      },
      {
        step: 3,
        title: 'Bước 3: Đề xuất các phương án giải quyết khả thi',
        content:
          'Phương án 1: Phê bình thầy M. trong cuộc họp hội đồng (gây đối kháng). Phương án 2: Tổ trưởng ghi nhận bề dày kinh nghiệm của thầy M., đồng thời ghép cặp hỗ trợ hai chiều giữa thầy M. (cố vấn chiều sâu toán học) và giáo viên trẻ (hỗ trợ thiết kế học liệu số GeoGebra) trong Cộng đồng học tập chuyên môn.',
      },
      {
        step: 4,
        title: 'Bước 4: Lựa chọn phương án tối ưu và tổ chức thực hiện tác động sư phạm',
        content:
          'Thực hiện mô hình Cộng đồng học tập chuyên môn (PLC) tôn trọng và chia sẻ: mời thầy M. chủ trì phân tích mạch kiến thức bài học minh họa, còn giáo viên trẻ hỗ trợ thao tác kỹ thuật số, giúp thầy M. thấy rõ hiệu quả trực quan của công nghệ đối với sự hứng thú của học sinh.',
      },
      {
        step: 5,
        title: 'Bước 5: Đánh giá kết quả, theo dõi hỗ trợ và rút kinh nghiệm sư phạm',
        content:
          'Tổng kết sau đợt sinh hoạt chuyên môn, ghi nhận đóng góp của thầy M. và nhân rộng mô hình kết nối thế hệ giáo viên trong tổ bộ môn.',
      },
    ],
    pitfallsToAvoid: [
      'Phủ nhận sạch trơn kinh nghiệm quý báu của giáo viên lâu năm khi triển khai phương pháp mới.',
      'Biến sinh hoạt chuyên môn thành buổi thanh tra, bắt lỗi cá nhân thay vì cùng suy ngẫm về việc học của học sinh.',
    ],
    coreLesson:
      'Phát triển nghề nghiệp giáo viên là hành trình suốt đời. Sự kết hợp giữa bản lĩnh kinh nghiệm và năng lực đổi mới công nghệ trong Cộng đồng học tập chuyên môn (PLC) là chìa khóa nâng cao chất lượng giáo dục.',
  };

  return createElement(
    'div',
    { className: 'space-y-8 text-[#29383D] leading-relaxed' },

    // 1. THANH METADATA & ĐỐI CHIẾU ĐẦU BÀI
    createElement(PedagogyMetadataBar, {
      courseCode: 'EDUC2802',
      clos: ['CLO1', 'CLO2'],
      textbookPages: 'Tr. 9–12 (Chương 1, Mục 1.3)',
      legalRefs: [
        'Thông tư 20/2018/TT-BGDĐT (Tiêu chuẩn 2 & Tiêu chuẩn 5)',
        'Luật Giáo dục 2019 (Điều 69, 73)',
      ],
      sessionNote: 'Lý thuyết, Thảo luận & Tự học Chương 1',
    }),

    // PHẦN I: KHÁI NIỆM VÀ YÊU CẦU PHÁT TRIỂN NGHỀ NGHIỆP GIÁO VIÊN (TR. 9–10)
    createElement(
      'section',
      { id: '1-khai-niem-va-yeu-cau', className: 'space-y-4' },
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
          '1. Khái niệm và yêu cầu phát triển nghề nghiệp giáo viên phổ thông (Tr. 9–10)',
        ),
      ),
      createElement(
        'p',
        null,
        'Theo Giáo trình Giáo dục học HCMUE (tr. 9), ',
        createElement(
          'strong',
          { className: 'font-semibold text-[#29383D]' },
          'phát triển nghề nghiệp giáo viên phổ thông',
        ),
        ' là quá trình người giáo viên thường xuyên học tập, bồi dưỡng, tích lũy kinh nghiệm và phản tư thực tiễn nhằm hoàn thiện phẩm chất đạo đức và nâng cao năng lực chuyên môn, nghiệp vụ sư phạm trong suốt cuộc đời hành nghề.',
        createElement(
          Sidenote,
          { type: 'history', number: 1 },
          'Nhà giáo dục học A. F. Đixtecvec (1790–1866) từng khẳng định: "Người giáo viên chỉ có thể giáo dục học sinh chừng nào bản thân mình còn tiếp tục tự học tập và tự giáo dục."',
        ),
      ),
      createElement(LegalReferenceBox, {
        lawTitle: 'Thông tư số 20/2018/TT-BGDĐT',
        article: 'Khoản 1 Điều 5 — Tiêu chí 3: Phát triển chuyên môn bản thân',
        quote:
          'Mức Đạt: Đạt chuẩn trình độ đào tạo và hoàn thành đầy đủ các khóa đào tạo, bồi dưỡng kiến thức chuyên môn theo quy định; có kế hoạch thường xuyên học tập, bồi dưỡng phát triển chuyên môn bản thân. Mức Khá: Chủ động nghiên cứu, cập nhật kịp thời yêu cầu đổi mới về kiến thức chuyên môn; vận dụng sáng tạo, phù hợp các hình thức, phương pháp và lựa chọn nội dung học tập, bồi dưỡng, nâng cao năng lực chuyên môn của bản thân. Mức Tốt: Hướng dẫn, hỗ trợ đồng nghiệp và chia sẻ kinh nghiệm về phát triển chuyên môn của bản thân nhằm đáp ứng yêu cầu đổi mới giáo dục.',
        source: 'Thông tư 20/2018/TT-BGDĐT (Giáo trình HCMUE tr. 9–10)',
        significance:
          'Xác định rõ lộ trình thăng tiến năng lực tự học và hỗ trợ đồng nghiệp từ mức Đạt lên mức Khá và mức Tốt.',
      }),

      createElement(ComparativeTable, {
        title: 'Bảng các Yêu cầu Cốt lõi đối với Phát triển Nghề nghiệp Giáo viên Phổ thông',
        subtitle:
          'Bốn yêu cầu định hướng quá trình tự đào tạo và bồi dưỡng liên tục của người giáo viên (Giáo trình HCMUE tr. 9–10).',
        badge: 'Yêu cầu Phát triển Nghề nghiệp',
        columns: [
          { key: 'requirement', header: 'Yêu cầu trọng tâm', widthClass: 'w-1/4' },
          { key: 'nature', header: 'Bản chất lý luận' },
          { key: 'practice', header: 'Biểu hiện thực hành của giáo viên / sinh viên sư phạm' },
        ],
        rows: [
          {
            requirement: '1. Tính tự giác, chủ động và suốt đời',
            nature:
              'Biến yêu cầu chuẩn hóa từ bên ngoài của ngành Giáo dục thành nhu cầu tự hoàn thiện nội tại của bản thân.',
            practice:
              'Xây dựng kế hoạch phát triển cá nhân hàng năm dựa trên kết quả tự đánh giá 15 tiêu chí Thông tư 20/2018.',
          },
          {
            requirement: '2. Gắn kết chặt chẽ với thực tiễn lớp học',
            nature:
              'Mọi hoạt động bồi dưỡng phải xuất phát từ những vướng mắc thực tế trong dạy học và giáo dục học sinh.',
            practice:
              'Thực hiện nghiên cứu khoa học sư phạm ứng dụng và nghiên cứu bài học để tháo gỡ khó khăn nhận thức của học sinh.',
          },
          {
            requirement: '3. Tính hợp tác và chia sẻ cộng đồng',
            nature:
              'Phát triển nghề nghiệp không diễn ra đơn độc mà thông qua sự tương tác, học hỏi lẫn nhau trong tập thể sư phạm.',
            practice:
              'Tham gia tích cực vào tổ chuyên môn và các cộng đồng học tập chuyên môn (PLC) trong và ngoài trường.',
          },
          {
            requirement: '4. Thích ứng với chuyển đổi số và hội nhập',
            nature:
              'Làm chủ công nghệ giáo dục hiện đại, học liệu số và ngoại ngữ để mở rộng không gian tri thức.',
            practice:
              'Khai thác hiệu quả LMS, phần mềm mô phỏng chuyên ngành (GeoGebra, Desmos) và tài liệu quốc tế.',
          },
        ],
      }),
    ),

    // PHẦN II: 5 ĐỊNH HƯỚNG HÌNH THỨC PHÁT TRIỂN NGHỀ NGHIỆP (TR. 10–12)
    createElement(
      'section',
      { id: '2-nam-dinh-huong-hinh-thuc', className: 'space-y-4' },
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
          '2. Năm định hướng hình thức phát triển nghề nghiệp giáo viên phổ thông (Giáo trình HCMUE tr. 10–12)',
        ),
      ),
      createElement(
        'p',
        null,
        'Giáo trình Giáo dục học HCMUE (tr. 10–12) xác lập ',
        createElement(
          'strong',
          null,
          '5 định hướng hình thức phát triển nghề nghiệp giáo viên phổ thông',
        ),
        ' kết hợp đồng bộ giữa tự bồi dưỡng cá nhân với bồi dưỡng tại nhà trường và trên nền tảng số:',
      ),
      createElement(NumberedProcessFlow, {
        title: '5 Định hướng Hình thức Phát triển Nghề nghiệp Giáo viên Phổ thông',
        subtitle:
          'Hệ thống các con đường và phương thức bồi dưỡng năng lực nghề nghiệp theo Giáo trình Giáo dục học HCMUE (tr. 10–12).',
        badge: '5 Hình thức Phát triển Nghề nghiệp',
        columns: 1,
        steps: [
          {
            number: 1,
            title: 'Tự bồi dưỡng và tự học thường xuyên của cá nhân giáo viên',
            description:
              'Hình thức nền tảng và bền vững nhất. Giáo viên tự đọc sách chuyên khảo, nghiên cứu chương trình, viết nhật ký phản tư sau giờ dạy và tự đánh giá theo Chuẩn nghề nghiệp.',
            keyAction:
              'Xây dựng kế hoạch tự bồi dưỡng cá nhân theo chu kỳ năm học và kiên trì thực hiện.',
            deliverable: 'Hồ sơ tự học, nhật ký phản tư sư phạm và sản phẩm chuyên môn cá nhân.',
          },
          {
            number: 2,
            title: 'Sinh hoạt chuyên môn tại tổ/nhóm bộ môn ở nhà trường phổ thông',
            description:
              'Đổi mới sinh hoạt tổ chuyên môn theo hướng Nghiên cứu bài học (Lesson Study): cùng thiết kế bài học minh họa, dự giờ quan sát việc học của học sinh và suy ngẫm giải pháp cải tiến.',
            keyAction:
              'Chuyển trọng tâm dự giờ từ "đánh giá người dạy" sang "phân tích hoạt động học của học sinh".',
            deliverable:
              'Kế hoạch bài dạy minh họa và biên bản phân tích bài học của tổ chuyên môn.',
          },
          {
            number: 3,
            title: 'Tham gia các chương trình tập huấn, bồi dưỡng thường xuyên',
            description:
              'Tham gia đầy đủ các mô đun bồi dưỡng thường xuyên do Bộ GD&ĐT, Sở GD&ĐT và các trường đại học sư phạm tổ chức (như chuỗi Mô đun 1–9 triển khai Chương trình GDPT 2018).',
            keyAction:
              'Học tập nghiêm túc các mô đun bồi dưỡng và chuyển hóa nội dung tập huấn vào thực tiễn giảng dạy tại trường.',
            deliverable:
              'Chứng nhận hoàn thành mô đun bồi dưỡng và sản phẩm thực hành ứng dụng tại cơ sở.',
          },
          {
            number: 4,
            title: 'Tham gia Cộng đồng học tập chuyên môn (Professional Learning Community – PLC)',
            description:
              'Kết nối với đồng nghiệp cùng môn học hoặc liên môn trong trường, cụm trường và trên toàn quốc để chia sẻ học liệu, thảo luận tình huống sư phạm và hỗ trợ đồng đẳng (Mentoring/Coaching).',
            keyAction:
              'Chủ động đóng góp chuyên đề, chia sẻ sáng kiến kinh nghiệm và học hỏi từ giáo viên cốt cán.',
            deliverable:
              'Mạng lưới hợp tác chuyên môn, chuyên đề báo cáo và sáng kiến kinh nghiệm.',
          },
          {
            number: 5,
            title: 'Ứng dụng công nghệ thông tin, chuyển đổi số và khai thác học liệu số',
            description:
              'Sử dụng hệ thống quản lí học tập trực tuyến (LMS/TEMIS), kho học liệu số mở, phần mềm dạy học chuyên ngành để tự bồi dưỡng mọi lúc, mọi nơi và hiện đại hóa phương pháp sư phạm.',
            keyAction:
              'Thiết kế bài giảng điện tử tương tác, học liệu số và tham gia các khóa học trực tuyến mở (MOOCs).',
            deliverable:
              'Kho học liệu số bộ môn, hồ sơ năng lực số trên hệ thống TEMIS và bài giảng E-Learning.',
          },
        ],
      }),
    ),

    // PHẦN III: CÔNG CỤ LẬP KẾ HOẠCH RÈN LUYỆN NGHỀ NGHIỆP 4 NĂM ĐẠI HỌC
    createElement(
      'section',
      { id: '3-ke-hoach-ren-luyen-ca-nhan', className: 'space-y-4' },
      createElement(
        'div',
        {
          className:
            'flex items-center gap-2 border-b border-[#CFDADB] pb-2 font-serif text-xl font-bold text-[#29383D]',
        },
        createElement(FileText, { className: 'h-5 w-5 text-[#3F6570]' }),
        createElement(
          'h3',
          null,
          '3. Thực hành: Thiết kế Kế hoạch học tập và phát triển nghề nghiệp cá nhân (4 năm đại học)',
        ),
      ),
      createElement(
        'p',
        null,
        'Vận dụng 5 định hướng phát triển nghề nghiệp (Giáo trình tr. 9–12) và 15 tiêu chí Thông tư 20/2018/TT-BGDĐT, sinh viên thực hành thiết kế bản kế hoạch rèn luyện nghề nghiệp trong 4 năm đại học dưới đây:',
      ),
      createElement(PersonalDevelopmentPlan),
    ),

    // PHẦN IV: CÂU HỎI TỰ LUẬN ÔN TẬP CHƯƠNG 1 & TÌNH HUỐNG 5 BƯỚC
    createElement(
      'section',
      { id: '4-on-tap-va-tinh-huong', className: 'space-y-5' },
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
          '4. Tình huống Thực hành 5 Bước & Đề cương Tự luận Trọng tâm Chương 1',
        ),
      ),
      createElement(CaseStudyBox, { caseStudy: caseStudy1_3, defaultOpenSolution: false }),

      createElement(
        'div',
        { className: 'space-y-3 pt-2' },
        [
          {
            id: 1,
            question:
              'Câu 1: Phân tích 5 đặc điểm của hoạt động sư phạm. Vì sao nói trong hoạt động sư phạm, nhân cách của người giáo viên là công cụ lao động chủ yếu nhất?',
            outline: [
              'Khái niệm hoạt động sư phạm và vị trí của người giáo viên theo Luật Giáo dục 2019 (Giáo trình tr. 1–3).',
              'Phân tích hệ thống 5 đặc điểm: Mục đích, Đối tượng, Công cụ, Sản phẩm, Môi trường (Giáo trình tr. 4–7).',
              'Chứng minh nhân cách là công cụ chủ yếu: đối tượng là nhân cách đang hình thành của học sinh, do đó chỉ có thể dùng nhân cách mẫu mực để cảm hóa và định hướng nhân cách.',
              'Rút ra kết luận sư phạm đối với quá trình tu dưỡng đạo đức và tác phong của sinh viên sư phạm.',
            ],
          },
          {
            id: 2,
            question:
              'Câu 2: Trình bày cấu trúc Chuẩn nghề nghiệp giáo viên cơ sở giáo dục phổ thông theo Thông tư 20/2018/TT-BGDĐT và ý nghĩa của Chuẩn đối với sự phát triển nghề nghiệp giáo viên.',
            outline: [
              'Cơ sở pháp lý và mục đích ban hành Thông tư 20/2018/TT-BGDĐT (Giáo trình tr. 8–9).',
              'Phân tích cấu trúc 5 Tiêu chuẩn – 15 Tiêu chí và 3 mức độ đánh giá (Đạt, Khá, Tốt).',
              'Làm rõ 5 định hướng hình thức phát triển nghề nghiệp giáo viên phổ thông (Tự bồi dưỡng, Sinh hoạt tổ chuyên môn, Tập huấn thường xuyên, Cộng đồng học tập chuyên môn PLC, Ứng dụng CNTT – Giáo trình tr. 9–12).',
              'Liên hệ kế hoạch rèn luyện bản thân của sinh viên ngành Sư phạm Toán học.',
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

// Giữ export alias Lesson1_4View trỏ về Lesson1_3View để tương thích ngược tuyệt đối
export const Lesson1_4View: FC = Lesson1_3View;

// ============================================================================
// 4. BỘ ĐIỀU PHỐI (MODULE DISPATCHER) CHO CHƯƠNG 1 (EDUC2802)
// ============================================================================

export function getChapter1LessonModule(lessonId: string): CompiledLessonModule | null {
  if (lessonId === 'gdh-c1-b1-hoat-dong-su-pham-cua-nguoi-giao-vien') {
    return {
      default: Lesson1_1View,
      frontmatter: {
        title: 'Bài 1.1: Hoạt động sư phạm của người giáo viên',
        description:
          'Vai trò, chức năng; Nhiệm vụ & quyền hạn theo Luật Giáo dục 2019 và Điều lệ trường học 2020; 5 đặc điểm hoạt động sư phạm (Giáo trình HCMUE tr. 1–7).',
        level: 'basic',
        tags: ['CLO1', 'CLO2', 'Hoạt động sư phạm', '5 Đặc điểm HĐSP', 'Giáo trình tr. 1-7'],
      },
      lessonMeta: {
        chapterNumber: 1,
        lessonNumber: 1,
        headings: [
          {
            id: '1-vai-tro-chuc-nang',
            text: '1. Vai trò và chức năng của người giáo viên (Tr. 1–2)',
            depth: 2,
          },
          {
            id: '2-nhiem-vu-va-quyen-han',
            text: '2. Nhiệm vụ và quyền hạn theo Luật GD 2019 & Điều lệ 2020 (Tr. 2–4)',
            depth: 2,
          },
          {
            id: '3-nam-dac-diem-hoat-dong-su-pham',
            text: '3. Phân tích 5 đặc điểm của hoạt động sư phạm (Tr. 4–7)',
            depth: 2,
          },
          {
            id: '4-tinh-huong-thuc-hanh',
            text: '4. Tình huống Thực hành 5 Bước: Công cụ nhân cách',
            depth: 2,
          },
        ],
        blocks: [],
      },
    };
  }

  if (lessonId === 'gdh-c1-b2-nhan-cach-va-chuan-nghe-nghiep-giao-vien-pho-thong') {
    return {
      default: Lesson1_2View,
      frontmatter: {
        title: 'Bài 1.2: Nhân cách và Chuẩn nghề nghiệp giáo viên phổ thông',
        description:
          'Phẩm chất & 5 nhóm năng lực nghề nghiệp theo Điều 67 Luật GD 2019; Chuẩn nghề nghiệp GVPT theo Thông tư 20/2018/TT-BGDĐT gồm 5 tiêu chuẩn, 15 tiêu chí (Giáo trình HCMUE tr. 7–9).',
        level: 'basic',
        tags: ['CLO1', 'CLO2', 'Nhân cách giáo viên', 'Thông tư 20/2018', 'Giáo trình tr. 7-9'],
      },
      lessonMeta: {
        chapterNumber: 1,
        lessonNumber: 2,
        headings: [
          {
            id: '1-pham-chat-va-nang-luc',
            text: '1. Yêu cầu về phẩm chất và 5 nhóm năng lực nghề nghiệp (Tr. 7–8)',
            depth: 2,
          },
          {
            id: '2-chuan-nghe-nghiep-tt20',
            text: '2. Chuẩn nghề nghiệp GVPT theo Thông tư 20/2018/TT-BGDĐT (Tr. 8–9)',
            depth: 2,
          },
          {
            id: '3-tinh-huong-thuc-hanh',
            text: '3. Tình huống Thực hành 5 Bước: Đạo đức và phong cách nhà giáo',
            depth: 2,
          },
        ],
        blocks: [],
      },
    };
  }

  if (
    lessonId === 'gdh-c1-b3-phat-trien-nghe-nghiep-giao-vien-pho-thong' ||
    lessonId === 'gdh-c1-b3-ren-luyen-de-tro-thanh-nguoi-giao-vien-hieu-qua' ||
    lessonId === 'gdh-c1-b4-tinh-huong-su-pham-va-de-cuong-on-tap-chuong-1'
  ) {
    return {
      default: Lesson1_3View,
      frontmatter: {
        title: 'Bài 1.3: Phát triển nghề nghiệp giáo viên phổ thông',
        description:
          'Khái niệm, yêu cầu và 5 định hướng hình thức phát triển nghề nghiệp: Tự bồi dưỡng, Sinh hoạt tổ chuyên môn, Tập huấn thường xuyên, Cộng đồng học tập chuyên môn, Ứng dụng CNTT và học liệu số (Giáo trình HCMUE tr. 9–12).',
        level: 'intermediate',
        tags: ['CLO1', 'CLO2', 'Phát triển nghề nghiệp', 'PLC', 'Giáo trình tr. 9-12'],
      },
      lessonMeta: {
        chapterNumber: 1,
        lessonNumber: 3,
        headings: [
          {
            id: '1-khai-niem-va-yeu-cau',
            text: '1. Khái niệm và yêu cầu phát triển nghề nghiệp GVPT (Tr. 9–10)',
            depth: 2,
          },
          {
            id: '2-nam-dinh-huong-hinh-thuc',
            text: '2. Năm định hướng hình thức phát triển nghề nghiệp (Tr. 10–12)',
            depth: 2,
          },
          {
            id: '3-ke-hoach-ren-luyen-ca-nhan',
            text: '3. Thực hành: Thiết kế Kế hoạch phát triển nghề nghiệp cá nhân',
            depth: 2,
          },
          {
            id: '4-on-tap-va-tinh-huong',
            text: '4. Tình huống Thực hành 5 Bước & Đề cương Tự luận Chương 1',
            depth: 2,
          },
        ],
        blocks: [],
      },
    };
  }

  return null;
}
