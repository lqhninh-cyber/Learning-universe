import type { CompiledLessonModule } from '@/content-runtime/loader';
import {
  CaseStudyBox,
  ComparativeTable,
  LegalReferenceBox,
  NumberedProcessFlow,
  PedagogyMetadataBar,
  ScholarQuote,
} from '@/features/pedagogy';
import { Sidenote } from '@/shared/components/Sidenote';
import { BookOpen, Compass, HelpCircle, Layers, Scale, Sparkles, Target } from 'lucide-react';
import { createElement, type FC } from 'react';
import type { PedagogicalCaseStudy } from './course';

// ============================================================================
// 1. COMPONENT BÀI 5.1: BẢN CHẤT, MỤC TIÊU VÀ NỘI DUNG HOẠT ĐỘNG TRẢI NGHIỆM Ở TRƯỜNG PHỔ THÔNG (TR. 83–87)
// ============================================================================

export const Lesson5_1View: FC = () => {
  const caseStudy5_1: PedagogicalCaseStudy = {
    id: 501,
    title: 'Khắc phục lối tổ chức Hoạt động trải nghiệm hình thức và phát triển 3 năng lực đặc thù',
    context:
      'Tại một trường THPT, khi triển khai Hoạt động trải nghiệm, hướng nghiệp khối 11, một số giáo viên chỉ chiếu slide thuyết giảng một chiều trên bục giảng suốt 45 phút như một tiết dạy học lý thuyết thông thường, học sinh ngồi nghe thụ động và chép bài vào vở mà không có bất kỳ hoạt động thực hành, chiêm nghiệm hay vận dụng nào.',
    question:
      'Vận dụng kiến thức về Bản chất phương thức giáo dục qua trải nghiệm, 3 năng lực đặc thù và 4 mạch nội dung của Hoạt động trải nghiệm, hướng nghiệp (Giáo trình Giáo dục học HCMUE tr. 83–87; CT GDPT 2018), anh/chị hãy xử lí tình huống theo quy trình 5 bước.',
    principlesApplied: [
      'Bản chất phương thức giáo dục qua trải nghiệm (Chu trình học tập qua trải nghiệm của David Kolb & Giáo trình HCMUE tr. 83–84)',
      'Mục tiêu phát triển 3 năng lực đặc thù của HĐTN, HN (Thông tư 32/2018/TT-BGDĐT & Giáo trình tr. 84–85)',
      'Nguyên tắc gắn giáo dục với thực tiễn đời sống và phát huy tính chủ thể của học sinh',
    ],
    solutionSteps: [
      {
        step: 1,
        title: 'Bước 1: Nhận diện sự việc và xác định vấn đề cần giải quyết',
        content:
          'Giáo viên đã đồng nhất Hoạt động trải nghiệm, hướng nghiệp với tiết dạy học truyền thụ kiến thức lý thuyết một chiều, làm mất đi bản chất "học qua làm – chiêm nghiệm – khái quát hóa – vận dụng" của hoạt động giáo dục bắt buộc này.',
      },
      {
        step: 2,
        title: 'Bước 2: Thu thập thông tin và phân tích nguyên nhân theo lý luận Chương 5',
        content:
          'Theo Giáo trình HCMUE (tr. 83–85), bản chất của HĐTN là đặt học sinh vào các tình huống thực tiễn đa dạng để các em trực tiếp huy động tổng hợp kiến thức, kỹ năng, cảm xúc nhằm tạo ra kinh nghiệm mới và hình thành 3 năng lực đặc thù (Thích ứng với cuộc sống, Thiết kế và tổ chức hoạt động, Định hướng nghề nghiệp).',
      },
      {
        step: 3,
        title: 'Bước 3: Đề xuất các phương án giải quyết khả thi',
        content:
          'Phương án 1: Tiếp tục duy trì hình thức thuyết giảng cho dễ quản lí trật tự lớp học. Phương án 2: Tổ bộ môn/Tổ chủ nhiệm tổ chức sinh hoạt chuyên đề tái cấu trúc kịch bản HĐTN theo chu trình trải nghiệm 4 pha, chuyển học sinh thành chủ thể thiết kế và thực hiện.',
      },
      {
        step: 4,
        title: 'Bước 4: Lựa chọn phương án tối ưu và tổ chức thực hiện tác động sư phạm',
        content:
          'Triển khai Phương án 2: Chuyển tiết giảng lý thuyết thành chuỗi hoạt động trải nghiệm (Khởi động kết nối kinh nghiệm -> Khám phá/Chiêm nghiệm qua xử lí tình huống, thảo luận trạm -> Rèn luyện kỹ năng qua đóng vai/lập kế hoạch -> Vận dụng thực tế ngoài lớp học).',
      },
      {
        step: 5,
        title: 'Bước 5: Đánh giá kết quả, theo dõi hỗ trợ và rút kinh nghiệm sư phạm',
        content:
          'Dự giờ trao đổi kinh nghiệm giữa các giáo viên trong khối và khảo sát mức độ hứng thú, sản phẩm hoạt động thực tế của học sinh sau mỗi chủ đề.',
      },
    ],
    pitfallsToAvoid: [
      'Biến tiết Hoạt động trải nghiệm, hướng nghiệp thành tiết đọc – chép lý thuyết khô khan hoặc ngược lại biến thành giờ giải trí tự do không có mục tiêu sư phạm.',
      'Tách rời hoạt động khỏi việc chiêm nghiệm, phản tư khiến học sinh chỉ "vui chơi xong rồi quên" mà không đúc kết được bài học giá trị.',
    ],
    coreLesson:
      'Trải nghiệm chỉ thực sự trở thành giáo dục khi người học được trực tiếp tham gia hành động, được dẫn dắt chiêm nghiệm cảm xúc – nhận thức và tự mình chuyển hóa thành năng lực hành động mới.',
  };

  return createElement(
    'div',
    { className: 'space-y-8 text-[#29383D] leading-relaxed' },

    // 1. THANH METADATA & ĐỐI CHIẾU ĐẦU BÀI
    createElement(PedagogyMetadataBar, {
      courseCode: 'EDUC2802',
      clos: ['CLO8'],
      textbookPages: 'Tr. 83–87 (Chương 5, Mục 5.1 – 5.3)',
      legalRefs: [
        'Thông tư 32/2018/TT-BGDĐT (Chương trình Hoạt động trải nghiệm và HĐTN, hướng nghiệp)',
        'Tài liệu bồi dưỡng Mô đun 2 THCS & THPT (BGDĐT)',
      ],
      sessionNote: 'Lý thuyết & Thảo luận Chương 5',
    }),

    // PHẦN I: BẢN CHẤT PHƯƠNG THỨC GIÁO DỤC QUA TRẢI NGHIỆM (TR. 83–84)
    createElement(
      'section',
      { id: '1-ban-chat-phuong-thuc-trai-nghiem', className: 'space-y-4' },
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
          '1. Khái niệm và bản chất phương thức giáo dục qua trải nghiệm (Giáo trình tr. 83–84)',
        ),
      ),
      createElement(
        'div',
        { className: 'text-sm text-[#29383D]' },
        'Trong Chương trình GDPT 2018 (',
        createElement('strong', null, 'Giáo trình Giáo dục học HCMUE tr. 83–84'),
        '), ',
        createElement('strong', null, 'Hoạt động trải nghiệm'),
        ' (ở cấp Tiểu học) và ',
        createElement('strong', null, 'Hoạt động trải nghiệm, hướng nghiệp'),
        ' (ở cấp THCS và THPT) là hoạt động giáo dục bắt buộc từ lớp 1 đến lớp 12 với thời lượng ',
        createElement('strong', null, '105 tiết/năm học'),
        ' (tương đương 3 tiết/tuần).',
        createElement(
          Sidenote,
          {
            number: 1,
            type: 'pedagogy',
            title: 'Định vị pháp lý của HĐTN, HN trong CT GDPT 2018',
          },
          'Hoạt động trải nghiệm, hướng nghiệp không phải là hoạt động ngoại khóa tự chọn mà là hoạt động giáo dục bắt buộc do nhà giáo dục định hướng, thiết kế và hướng dẫn thực hiện trong và ngoài nhà trường.',
        ),
      ),

      createElement(ScholarQuote, {
        scholar: 'David A. Kolb (1984)',
        work: 'Experiential Learning: Experience as the Source of Learning and Development',
        quote:
          'Học tập là quá trình mà tri thức và năng lực được kiến tạo thông qua sự chuyển hóa kinh nghiệm.',
        analysis:
          'Giáo trình HCMUE (tr. 83–84) khẳng định bản chất của phương thức trải nghiệm là quá trình học sinh trực tiếp tham gia vào các loại hình hoạt động thực tiễn dưới sự định hướng của nhà giáo dục, qua đó chuyển hóa kinh nghiệm cảm tính thành nhận thức lý tính, giá trị sống và năng lực hành động.',
      }),

      createElement(NumberedProcessFlow, {
        title:
          'Chu trình 4 pha của Phương thức Giáo dục qua Trải nghiệm (Giáo trình HCMUE tr. 83–84)',
        subtitle:
          'Cơ sở tâm lí – giáo dục học cho việc thiết kế mọi chủ đề Hoạt động trải nghiệm, hướng nghiệp.',
        columns: 2,
        steps: [
          {
            number: 1,
            title: 'Pha 1: Trải nghiệm cụ thể (Concrete Experience)',
            badge: 'Trực tiếp tham gia',
            description:
              'Học sinh trực tiếp tham gia vào tình huống, sự kiện, trò chơi, dự án hoặc hoạt động thực tiễn bằng các giác quan, cảm xúc và kinh nghiệm sẵn có.',
          },
          {
            number: 2,
            title: 'Pha 2: Quan sát phản tỉnh / Chiêm nghiệm (Reflective Observation)',
            badge: 'Phản tư & Phân tích',
            description:
              'Học sinh nhìn nhận lại những gì vừa trải qua, chia sẻ cảm xúc, phân tích các khía cạnh thành công hay vướng mắc dưới câu hỏi dẫn dắt của giáo viên.',
          },
          {
            number: 3,
            title: 'Pha 3: Khái quát hóa / Trừu tượng hóa (Abstract Conceptualization)',
            badge: 'Đúc kết quy luật',
            description:
              'Từ các quan sát và chiêm nghiệm, học sinh tổng kết thành khái niệm, bài học kinh nghiệm, quy trình hành động hoặc hệ giá trị sống đúng đắn.',
          },
          {
            number: 4,
            title: 'Pha 4: Thử nghiệm tích cực / Vận dụng mới (Active Experimentation)',
            badge: 'Hành động thực tiễn',
            description:
              'Học sinh đưa những bài học, quy trình vừa đúc kết vào giải quyết các nhiệm vụ mới trong học tập, đời sống gia đình và cộng đồng xã hội.',
          },
        ],
      }),
    ),

    // PHẦN II: MỤC TIÊU VÀ 3 NĂNG LỰC ĐẶC THÙ CỦA HĐTN, HƯỚNG NGHIỆP (TR. 84–85)
    createElement(
      'section',
      { id: '2-muc-tieu-va-3-nang-luc-dac-thu', className: 'space-y-4' },
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
          '2. Mục tiêu các cấp học và 3 năng lực đặc thù của Hoạt động trải nghiệm, hướng nghiệp (Giáo trình tr. 84–85)',
        ),
      ),

      createElement(LegalReferenceBox, {
        documentTitle:
          'Thông tư số 32/2018/TT-BGDĐT (Chương trình Hoạt động trải nghiệm và HĐTN, hướng nghiệp)',
        article:
          'Mục tiêu chung và Yêu cầu cần đạt về năng lực đặc thù (Giáo trình HCMUE tr. 84–85)',
        quote:
          'Hoạt động trải nghiệm và Hoạt động trải nghiệm, hướng nghiệp hình thành, phát triển ở học sinh năng lực thích ứng với cuộc sống, năng lực thiết kế và tổ chức hoạt động, năng lực định hướng nghề nghiệp; đồng thời góp phần hình thành, phát triển các phẩm chất chủ yếu và năng lực chung quy định trong Chương trình tổng thể.',
        pedagogicalAnalysis:
          'Mục tiêu HĐTN được thiết kế đồng tâm và phát triển nâng cao dần qua 3 cấp học: Tiểu học tập trung vào thói quen sinh hoạt nền nếp và kỹ năng tự phục vụ; THCS tập trung vào hoàn thiện nhân cách, kỹ năng xã hội và khám phá sở trường nghề nghiệp; THPT tập trung vào phẩm chất công dân, bản lĩnh thích ứng và đưa ra quyết định lựa chọn nghề nghiệp phù hợp.',
      }),

      createElement(ComparativeTable, {
        title:
          'Cấu trúc 3 Năng lực đặc thù của Hoạt động trải nghiệm, hướng nghiệp (Giáo trình HCMUE tr. 85)',
        subtitle: 'Ba trụ cột năng lực đặc thù được đánh giá xuyên suốt từ lớp 1 đến lớp 12.',
        headers: [
          'Năng lực đặc thù',
          'Các thành tố năng lực cốt lõi',
          'Biểu hiện hành vi cần đạt ở học sinh',
        ],
        rows: [
          [
            '1. Năng lực thích ứng với cuộc sống',
            '(1) Hiểu biết về bản thân và môi trường sống; (2) Kĩ năng điều chỉnh bản thân và đáp ứng với sự thay đổi.',
            'Nhận diện được điểm mạnh, điểm yếu của bản thân; làm chủ cảm xúc, ứng phó tích cực với áp lực, rủi ro và thích nghi với môi trường học tập, sinh hoạt mới.',
          ],
          [
            '2. Năng lực thiết kế và tổ chức hoạt động',
            '(1) Kĩ năng lập kế hoạch; (2) Kĩ năng thực hiện kế hoạch và điều chỉnh hoạt động; (3) Kĩ năng đánh giá hoạt động.',
            'Biết xác định mục tiêu, xây dựng kế hoạch cá nhân/nhóm, hợp tác điều phối nguồn lực để hoàn thành nhiệm vụ và tự đánh giá, rút kinh nghiệm sau hoạt động.',
          ],
          [
            '3. Năng lực định hướng nghề nghiệp',
            '(1) Hiểu biết về nghề nghiệp; (2) Hiểu biết và rèn luyện phẩm chất, năng lực liên quan đến nghề; (3) Kĩ năng ra quyết định và lập kế hoạch học tập theo định hướng nghề.',
            'Tìm hiểu thông tin thế giới nghề nghiệp và nhu cầu thị trường lao động; đối chiếu phẩm chất, năng lực bản thân để chọn tổ hợp môn học và ngành nghề tương lai.',
          ],
        ],
      }),
    ),

    // PHẦN III: 4 MẠCH NỘI DUNG CHÍNH CỦA HOẠT ĐỘNG TRẢI NGHIỆM, HƯỚNG NGHIỆP (TR. 85–87)
    createElement(
      'section',
      { id: '3-bon-mach-noi-dung-hdtn', className: 'space-y-4' },
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
          '3. Bốn mạch nội dung chính của Hoạt động trải nghiệm, hướng nghiệp (Giáo trình tr. 85–87)',
        ),
      ),

      createElement(NumberedProcessFlow, {
        title:
          '4 Mạch nội dung và các hoạt động thành phần của HĐTN, HN (Giáo trình HCMUE tr. 85–87)',
        subtitle:
          'Bốn mạch nội dung triển khai xuyên suốt cả 3 cấp học với tỷ trọng phân bổ phù hợp theo đặc điểm tâm sinh lí lứa tuổi.',
        columns: 2,
        steps: [
          {
            number: 1,
            title: 'Mạch 1: Hoạt động hướng vào bản thân',
            badge: 'Khám phá & Rèn luyện bản thân',
            description:
              'Gồm: (a) Hoạt động khám phá bản thân (nhận diện đặc điểm cá nhân, sở thích, giá trị sống); (b) Hoạt động rèn luyện bản thân (tự phục vụ, quản lí thời gian, quản lí tài chính cá nhân, làm chủ cảm xúc và thích ứng).',
          },
          {
            number: 2,
            title: 'Mạch 2: Hoạt động hướng đến xã hội',
            badge: 'Gia đình · Nhà trường · Cộng đồng',
            description:
              'Gồm: (a) Hoạt động chăm sóc gia đình (xây dựng gia đình hạnh phúc); (b) Hoạt động xây dựng nhà trường (tình bạn, tình thầy trò, văn hóa học đường); (c) Hoạt động xây dựng cộng đồng (thiện nguyện, nhân đạo, giao lưu văn hóa).',
          },
          {
            number: 3,
            title: 'Mạch 3: Hoạt động hướng đến tự nhiên',
            badge: 'Cảnh quan & Môi trường',
            description:
              'Gồm: (a) Hoạt động tìm hiểu và bảo tồn cảnh quan thiên nhiên, danh lam thắng cảnh địa phương; (b) Hoạt động tìm hiểu và bảo vệ môi trường sinh thái, ứng phó với biến đổi khí hậu.',
          },
          {
            number: 4,
            title: 'Mạch 4: Hoạt động hướng nghiệp',
            badge: 'Nghề nghiệp & Định hướng tương lai',
            description:
              'Gồm: (a) Hoạt động tìm hiểu nghề nghiệp (ý nghĩa, yêu cầu, an toàn lao động); (b) Hoạt động rèn luyện phẩm chất, năng lực phù hợp với định hướng nghề nghiệp; (c) Hoạt động lựa chọn hướng nghề nghiệp và lập kế hoạch học tập.',
          },
        ],
      }),
    ),

    // PHẦN IV: CÂU HỎI ÔN TẬP & TÌNH HUỐNG THỰC HÀNH
    createElement(
      'section',
      { id: '4-on-tap-va-tinh-huong-bai-5-1', className: 'space-y-6' },
      createElement(
        'div',
        {
          className:
            'flex items-center gap-2 border-b border-[#CFDADB] pb-2 font-serif text-xl font-bold text-[#29383D]',
        },
        createElement(HelpCircle, { className: 'h-5 w-5 text-[#3F6570]' }),
        createElement('h3', null, '4. Câu hỏi tự luận ôn tập và Tình huống vận dụng (CLO8)'),
      ),
      createElement(
        'div',
        { className: 'rounded-2xl border border-[#CFDADB] bg-[#F7FAFA] p-5 space-y-2' },
        createElement(
          'p',
          { className: 'text-sm font-bold text-[#29383D]' },
          'Câu hỏi ôn tập (Giáo trình HCMUE tr. 124): Phân tích bản chất của phương thức giáo dục qua trải nghiệm, 3 năng lực đặc thù và 4 mạch nội dung chính của Hoạt động trải nghiệm, hướng nghiệp trong Chương trình GDPT 2018.',
        ),
        createElement(
          'p',
          { className: 'text-xs text-[#55676B]' },
          'Gợi ý trả lời: Làm rõ chu trình trải nghiệm 4 pha, 3 năng lực đặc thù (Thích ứng với cuộc sống; Thiết kế và tổ chức hoạt động; Định hướng nghề nghiệp) và 4 mạch nội dung (Hướng vào bản thân; Hướng đến xã hội; Hướng đến tự nhiên; Hướng nghiệp).',
        ),
      ),
      createElement(CaseStudyBox, { caseStudy: caseStudy5_1 }),
    ),
  );
};

// ============================================================================
// 2. COMPONENT BÀI 5.2: PHƯƠNG THỨC VÀ LOẠI HÌNH TỔ CHỨC HOẠT ĐỘNG TRẢI NGHIỆM (TR. 88–110)
// ============================================================================

export const Lesson5_2View: FC = () => {
  const caseStudy5_2: PedagogicalCaseStudy = {
    id: 502,
    title: 'Vận dụng phương pháp Sân khấu tương tác (5 bước) và loại hình Sinh hoạt dưới cờ',
    context:
      'Được phân công phụ trách tiết Sinh hoạt dưới cờ tuần tới với chủ đề "Phòng chống bắt nạt trên không gian mạng", ban đầu nhóm giáo viên dự định đọc một bài diễn văn tuyên truyền dài 30 phút. Tuy nhiên, Hiệu trưởng yêu cầu phải đổi mới theo đúng phương thức Khám phá và Thể nghiệm, tương tác để thu hút toàn bộ 800 học sinh toàn trường.',
    question:
      'Vận dụng lý luận về 4 nhóm phương thức (đặc biệt là quy trình 5 bước của Sân khấu tương tác và quy trình Diễn đàn) cùng 4 loại hình tổ chức HĐTN (Giáo trình Giáo dục học HCMUE tr. 88–110), anh/chị hãy xử lí tình huống theo quy trình 5 bước.',
    principlesApplied: [
      '4 nhóm phương thức tổ chức HĐTN: Phương thức Thể nghiệm, tương tác — Sân khấu tương tác 5 bước (Giáo trình tr. 91–96)',
      '4 loại hình tổ chức HĐTN: Loại hình Sinh hoạt dưới cờ gồm phần Nghi lễ và phần Sinh hoạt theo chủ đề (Giáo trình tr. 108–109)',
      'Nguyên tắc phát huy tính tích cực, chủ động, sáng tạo của học sinh',
    ],
    solutionSteps: [
      {
        step: 1,
        title: 'Bước 1: Nhận diện sự việc và xác định vấn đề cần giải quyết',
        content:
          'Cần chuyển đổi hình thức tiết Sinh hoạt dưới cờ từ đọc diễn văn một chiều sang phương thức Thể nghiệm, tương tác (kết hợp Sân khấu tương tác và Diễn đàn) để học sinh toàn trường trực tiếp tham gia giải quyết tình huống.',
      },
      {
        step: 2,
        title: 'Bước 2: Thu thập thông tin và phân tích nguyên nhân theo lý luận Chương 5',
        content:
          'Theo Giáo trình HCMUE (tr. 93–95 & tr. 108–109), Sinh hoạt dưới cờ có ưu thế quy mô lớn, tạo hiệu ứng truyền thông mạnh mẽ. Phương pháp Sân khấu tương tác (5 bước) cho phép dừng vở kịch ở nút thắt cao trào để khán giả (học sinh dưới sân trường) thảo luận và lên sân khấu đóng vai thay đổi cái kết.',
      },
      {
        step: 3,
        title: 'Bước 3: Đề xuất các phương án giải quyết khả thi',
        content:
          'Phương án 1: Rút ngắn bài diễn văn xuống 15 phút và chiếu thêm 1 video. Phương án 2: Tổ chức phần Sinh hoạt chủ đề dưới cờ (30 phút sau nghi lễ chào cờ) bằng vở kịch tương tác 5 bước do CLB Kịch của trường biểu diễn.',
      },
      {
        step: 4,
        title: 'Bước 4: Lựa chọn phương án tối ưu và tổ chức thực hiện tác động sư phạm',
        content:
          'Triển khai quy trình 5 bước Sân khấu tương tác (Giáo trình tr. 93–95): (Bước 1) Chuẩn bị kịch bản ngắn về một học sinh bị chế ảnh trêu chọc trên mạng, dừng ở cảnh nhân vật chính khủng hoảng; (Bước 2) Sáng tác/tập luyện với đội kịch nòng cốt; (Bước 3) Biểu diễn phần mở đầu đến nút thắt xung đột; (Bước 4) Người điều phối mời học sinh dưới sân trường thảo luận nhanh và mời 2–3 học sinh lên sân khấu nhập vai người bạn chứng kiến để tháo gỡ nút thắt; (Bước 5) Tổng kết thông điệp ứng xử văn minh trên không gian mạng.',
      },
      {
        step: 5,
        title: 'Bước 5: Đánh giá kết quả, theo dõi hỗ trợ và rút kinh nghiệm sư phạm',
        content:
          'Chuyển giao nhiệm vụ tiếp nối về cho tiết Sinh hoạt lớp cuối tuần để từng lớp ký cam kết "Lớp học không bạo lực mạng".',
      },
    ],
    pitfallsToAvoid: [
      'Biến phần Sinh hoạt dưới cờ thành buổi tổng kết phê bình lỗi vi phạm nề nếp nặng nề kéo dài cả tiết học.',
      'Diễn kịch một chiều từ đầu đến cuối mà không có bước tương tác, đối thoại với học sinh toàn trường.',
    ],
    coreLesson:
      'Sự kết hợp nhuần nhuyễn giữa các loại hình (Sinh hoạt dưới cờ – Sinh hoạt lớp) với quy trình chuẩn của các phương pháp trải nghiệm (Sân khấu tương tác, Diễn đàn) giúp biến sân trường thành không gian giáo dục sống động.',
  };

  return createElement(
    'div',
    { className: 'space-y-8 text-[#29383D] leading-relaxed' },

    // 1. THANH METADATA & ĐỐI CHIẾU ĐẦU BÀI
    createElement(PedagogyMetadataBar, {
      courseCode: 'EDUC2802',
      clos: ['CLO8', 'CLO9'],
      textbookPages: 'Tr. 88–110 (Chương 5, Mục 5.4 – 5.5)',
      legalRefs: [
        'Thông tư 32/2018/TT-BGDĐT (Phương thức và Loại hình tổ chức HĐTN, HN)',
        'Tài liệu Phương thức tổ chức HĐTN & Mô đun 2 THCS, THPT',
      ],
      sessionNote: 'Lý thuyết, Thảo luận & Thực hành 3',
    }),

    // PHẦN I: 4 NHÓM PHƯƠNG THỨC VÀ QUY TRÌNH CÁC PHƯƠNG PHÁP TỔ CHỨC HĐTN (TR. 88–107)
    createElement(
      'section',
      { id: '1-bon-nhom-phuong-thuc-to-chuc-hdtn', className: 'space-y-4' },
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
          '1. Hệ thống 4 nhóm phương thức và quy trình các phương pháp tổ chức HĐTN (Giáo trình tr. 88–107)',
        ),
      ),
      createElement(
        'div',
        { className: 'text-sm text-[#29383D]' },
        'Theo Chương trình GDPT 2018 và ',
        createElement('strong', null, 'Giáo trình Giáo dục học HCMUE (tr. 88–107)'),
        ', hoạt động trải nghiệm, hướng nghiệp được tổ chức thông qua ',
        createElement('strong', null, '4 nhóm phương thức chủ đạo'),
        ', mỗi nhóm bao gồm các phương pháp tổ chức có quy trình bước thực hiện rất chặt chẽ.',
        createElement(
          Sidenote,
          {
            number: 1,
            type: 'pedagogy',
            title: 'Ghi nhớ số bước quy trình của các phương pháp trọng tâm (Tr. 88–107)',
          },
          'Khi làm bài thi hoặc thiết kế chủ đề, cần nắm chắc quy trình chuẩn trong Giáo trình HCMUE: Tham quan (3 bước); Lao động công ích (4 bước); Sân khấu tương tác (5 bước); Tình nguyện (5 bước); Dự án (5 bước); Nghiên cứu khoa học (8 bước).',
        ),
      ),

      createElement(NumberedProcessFlow, {
        title:
          '4 Nhóm phương thức tổ chức Hoạt động trải nghiệm, hướng nghiệp (Giáo trình HCMUE tr. 88–107)',
        subtitle:
          'Phân loại đầy đủ các phương pháp và quy trình từng bước theo đúng Mục 5.4 Giáo trình Giáo dục học HCMUE.',
        columns: 2,
        steps: [
          {
            number: 1,
            title: 'Nhóm 1: Phương thức Khám phá (Tr. 88–91)',
            badge: 'Thực địa · Thực tế',
            description:
              'Là phương thức tổ chức cho học sinh trải nghiệm thế giới tự nhiên, thực tế cuộc sống và công việc. Phương pháp điển hình: Tổ chức tham quan, dã ngoại theo Quy trình 3 bước: Bước 1: Chuẩn bị tham quan -> Bước 2: Tiến hành tham quan -> Bước 3: Tổng kết, đánh giá sau tham quan.',
          },
          {
            number: 2,
            title: 'Nhóm 2: Phương thức Thể nghiệm, tương tác (Tr. 91–96)',
            badge: 'Diễn đàn · Trò chơi · Sân khấu',
            description:
              'Tạo cơ hội cho học sinh giao lưu, tác nghiệp và thể hiện ý tưởng. Gồm: (a) Tổ chức Hội thảo, Diễn đàn; (b) Tổ chức Trò chơi; (c) Tổ chức Sân khấu tương tác theo Quy trình 5 bước: Bước 1: Chuẩn bị -> Bước 2: Sáng tác vở diễn -> Bước 3: Biểu diễn mở đầu -> Bước 4: Tương tác với khán giả giải quyết vấn đề -> Bước 5: Tổng kết, đánh giá.',
          },
          {
            number: 3,
            title: 'Nhóm 3: Phương thức Cống hiến (Tr. 96–101)',
            badge: 'Tình nguyện · Lao động công ích',
            description:
              'Mang lại giá trị xã hội thực tế qua sự đóng góp của học sinh. Gồm: (a) Hoạt động tình nguyện, nhân đạo theo Quy trình 5 bước (Khảo sát nhu cầu -> Lập kế hoạch -> Chuẩn bị -> Thực hiện tình nguyện -> Đánh giá, tổng kết); (b) Hoạt động lao động công ích theo Quy trình 4 bước (Xác định nhiệm vụ -> Chuẩn bị -> Tổ chức lao động -> Kiểm tra, đánh giá).',
          },
          {
            number: 4,
            title: 'Nhóm 4: Phương thức Nghiên cứu (Tr. 101–107)',
            badge: 'NCKH 8 bước · Dự án 5 bước',
            description:
              'Gồm: (a) Tổ chức Nghiên cứu khoa học của học sinh theo Quy trình 8 bước (Xác định đề tài -> Xây dựng đề cương -> Thu thập thông tin -> Xử lí dữ liệu -> Viết báo cáo -> Trình bày kết quả -> Đánh giá -> Công bố/ứng dụng); (b) Tổ chức Dự án học tập/trải nghiệm theo Quy trình 5 bước (Xác định chủ đề -> Lập kế hoạch -> Thực hiện dự án -> Giới thiệu sản phẩm -> Đánh giá dự án).',
          },
        ],
      }),

      createElement(ComparativeTable, {
        title:
          'Bảng tổng hợp Quy trình các phương pháp tổ chức HĐTN cụ thể (Giáo trình HCMUE tr. 88–107)',
        subtitle: 'Đối chiếu mục đích sư phạm và chuỗi các bước tổ chức của từng phương pháp.',
        headers: [
          'Tên phương pháp tổ chức',
          'Thuộc nhóm phương thức',
          'Quy trình chuẩn trong Giáo trình HCMUE (Tr. 88–107)',
        ],
        rows: [
          [
            '1. Tổ chức Hội thảo & Diễn đàn (Tr. 91–93)',
            'Thể nghiệm, tương tác',
            'Xác định chủ đề tranh biện/thảo luận -> Chuẩn bị nội dung và khách mời/điều phối viên -> Tổ chức trình bày tham luận & đối thoại mở -> Tổng kết thông điệp.',
          ],
          [
            '2. Tổ chức Sân khấu tương tác (Tr. 93–95)',
            'Thể nghiệm, tương tác',
            'Quy trình 5 bước: (1) Chuẩn bị -> (2) Sáng tác vở diễn có tình huống mở -> (3) Biểu diễn phần đầu -> (4) Tương tác khán giả nhập vai tháo gỡ -> (5) Tổng kết, đánh giá.',
          ],
          [
            '3. Tổ chức Tham quan, dã ngoại (Tr. 88–91)',
            'Khám phá',
            'Quy trình 3 bước: (1) Chuẩn bị (mục tiêu, địa điểm, an toàn, phiếu thu hoạch) -> (2) Tiến hành tham quan, trải nghiệm tại hiện trường -> (3) Tổng kết, báo cáo sản phẩm.',
          ],
          [
            '4. Hoạt động Tình nguyện (Tr. 96–99)',
            'Cống hiến',
            'Quy trình 5 bước: (1) Khảo sát, xác định đối tượng -> (2) Lập kế hoạch tình nguyện -> (3) Chuẩn bị nguồn lực -> (4) Tổ chức thực hiện -> (5) Đánh giá và rút kinh nghiệm.',
          ],
          [
            '5. Lao động công ích (Tr. 99–101)',
            'Cống hiến',
            'Quy trình 4 bước: (1) Xác định mục tiêu, nhiệm vụ lao động -> (2) Chuẩn bị dụng cụ, phân công -> (3) Tổ chức lao động an toàn, kỷ luật -> (4) Nghiệm thu, đánh giá.',
          ],
          [
            '6. Nghiên cứu khoa học & Dự án (Tr. 101–107)',
            'Nghiên cứu',
            'NCKH (8 bước): Chọn đề tài -> Đề cương -> Thu thập -> Xử lí -> Viết báo cáo -> Báo cáo -> Đánh giá -> Ứng dụng. Dự án (5 bước): Chọn chủ đề -> Lập kế hoạch -> Thực hiện -> Trình bày sản phẩm -> Đánh giá.',
          ],
        ],
      }),
    ),

    // PHẦN II: 4 LOẠI HÌNH TỔ CHỨC HOẠT ĐỘNG TRẢI NGHIỆM, HƯỚNG NGHIỆP (TR. 108–110)
    createElement(
      'section',
      { id: '2-bon-loai-hinh-to-chuc-hdtn', className: 'space-y-4' },
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
          '2. Bốn loại hình tổ chức Hoạt động trải nghiệm, hướng nghiệp (Giáo trình tr. 108–110)',
        ),
      ),

      createElement(ComparativeTable, {
        title:
          'Bảng đối sánh 4 Loại hình tổ chức Hoạt động trải nghiệm, hướng nghiệp (Giáo trình HCMUE tr. 108–110)',
        subtitle:
          'Ba loại hình bắt buộc định kỳ hàng tuần/tháng và một loại hình tự chọn theo sở thích, năng khiếu.',
        headers: [
          'Loại hình tổ chức',
          'Tính chất & Quy mô',
          'Cấu trúc nội dung và Yêu cầu sư phạm (Tr. 108–110)',
        ],
        rows: [
          [
            '1. Sinh hoạt dưới cờ',
            'Bắt buộc (1 tiết/tuần) · Quy mô toàn trường hoặc khối lớp',
            'Gồm 2 phần: (1) Phần Nghi lễ hành chính (chào cờ, tổng kết ngắn gọn, trang nghiêm); (2) Phần Sinh hoạt theo chủ đề (diễn đàn, sân khấu hóa, giao lưu gương người tốt việc tốt).',
          ],
          [
            '2. Sinh hoạt lớp',
            'Bắt buộc (1 tiết/tuần) · Quy mô lớp học',
            'Gồm 2 phần: (1) Sơ kết công tác tuần và triển khai kế hoạch tuần mới do Ban cán sự tự quản điều hành; (2) Sinh hoạt theo chủ đề trải nghiệm gắn với mạch nội dung tháng.',
          ],
          [
            '3. Hoạt động giáo dục theo chủ đề',
            'Bắt buộc · Quy mô lớp hoặc khối lớp (Thường xuyên & Định kỳ)',
            'Tổ chức thường xuyên (1 tiết/tuần tại lớp) hoặc định kỳ theo quy mô lớn (tham quan, hội trại, dự án trải nghiệm nghề nghiệp) nhằm giải quyết trọn vẹn yêu cầu cần đạt của chủ đề.',
          ],
          [
            '4. Hoạt động câu lạc bộ (CLB)',
            'Tự chọn (Ngoài giờ chính khóa) · Nhóm học sinh cùng sở thích',
            'Tổ chức theo nguyên tắc tự nguyện (CLB học thuật, STEM, nghệ thuật, thể thao, thiện nguyện) nhằm phát triển sâu năng khiếu cá nhân và định hướng nghề nghiệp chuyên biệt.',
          ],
        ],
      }),

      createElement(LegalReferenceBox, {
        documentTitle: 'Thông tư số 32/2018/TT-BGDĐT & Tài liệu Bồi dưỡng Mô đun 2 THCS/THPT',
        article: 'Quy định về tổ chức 4 loại hình Hoạt động trải nghiệm, hướng nghiệp',
        quote:
          'Hoạt động trải nghiệm và Hoạt động trải nghiệm, hướng nghiệp được tổ chức trong và ngoài lớp học, trong và ngoài trường học; theo quy mô nhóm, lớp học, khối lớp hoặc quy mô trường; với bốn loại hình hoạt động chủ yếu là Sinh hoạt dưới cờ, Sinh hoạt lớp, Hoạt động giáo dục theo chủ đề và Hoạt động câu lạc bộ.',
        pedagogicalAnalysis:
          'Ba loại hình đầu (Sinh hoạt dưới cờ, Hoạt động giáo dục theo chủ đề, Sinh hoạt lớp) kết nối với nhau thành một chu trình khép kín trong tuần: Phát động chủ đề ở giờ Chào cờ đầu tuần -> Khám phá, rèn luyện chuyên sâu ở tiết Chủ đề giữa tuần -> Phản hồi, đúc kết và cam kết hành động ở tiết Sinh hoạt lớp cuối tuần.',
      }),
    ),

    // PHẦN III: CÂU HỎI ÔN TẬP & TÌNH HUỐNG THỰC HÀNH
    createElement(
      'section',
      { id: '3-on-tap-va-tinh-huong-bai-5-2', className: 'space-y-6' },
      createElement(
        'div',
        {
          className:
            'flex items-center gap-2 border-b border-[#CFDADB] pb-2 font-serif text-xl font-bold text-[#29383D]',
        },
        createElement(HelpCircle, { className: 'h-5 w-5 text-[#3F6570]' }),
        createElement('h3', null, '3. Câu hỏi tự luận ôn tập và Tình huống vận dụng (CLO8, CLO9)'),
      ),
      createElement(
        'div',
        { className: 'rounded-2xl border border-[#CFDADB] bg-[#F7FAFA] p-5 space-y-2' },
        createElement(
          'p',
          { className: 'text-sm font-bold text-[#29383D]' },
          'Câu hỏi ôn tập (Giáo trình HCMUE tr. 124): Trình bày 4 nhóm phương thức (kèm quy trình các phương pháp cụ thể) và 4 loại hình tổ chức Hoạt động trải nghiệm, hướng nghiệp ở trường phổ thông.',
        ),
        createElement(
          'p',
          { className: 'text-xs text-[#55676B]' },
          'Gợi ý trả lời: Hệ thống hóa 4 phương thức (Khám phá, Thể nghiệm – tương tác, Cống hiến, Nghiên cứu) cùng số bước quy trình của từng phương pháp và phân tích mối liên hệ giữa 4 loại hình tổ chức.',
        ),
      ),
      createElement(CaseStudyBox, { caseStudy: caseStudy5_2 }),
    ),
  );
};

// ============================================================================
// 3. COMPONENT BÀI 5.3: ĐÁNH GIÁ KẾT QUẢ, ĐIỀU KIỆN TỔ CHỨC VÀ QUY TRÌNH THIẾT KẾ CHỦ ĐỀ HĐTN (TR. 110–124)
// ============================================================================

export const Lesson5_3View: FC = () => {
  const caseStudy5_3: PedagogicalCaseStudy = {
    id: 503,
    title:
      'Đánh giá kết quả Hoạt động trải nghiệm, hướng nghiệp và thiết kế chủ đề theo tiến trình chuẩn',
    context:
      'Cuối học kỳ I, khi thực hiện đánh giá kết quả Hoạt động trải nghiệm, hướng nghiệp cho học sinh lớp 10, một giáo viên chỉ dùng một bài kiểm tra viết trên giấy trong 45 phút để xếp loại "Đạt" hoặc "Chưa đạt", hoàn toàn bỏ qua quá trình tham gia hoạt động của học sinh trong suốt học kỳ cũng như không thu thập ý kiến tự đánh giá, đánh giá đồng đẳng và phản hồi từ gia đình.',
    question:
      'Vận dụng lý luận về 6 phương pháp đánh giá kết quả HĐTN và quy trình thiết kế chủ đề HĐTN (Giáo trình Giáo dục học HCMUE tr. 110–124; Thông tư 22/2021/TT-BGDĐT), anh/chị hãy xử lí tình huống theo quy trình 5 bước.',
    principlesApplied: [
      'Mục đích, nội dung và 6 phương pháp đánh giá kết quả HĐTN, HN (Giáo trình tr. 110–114)',
      'Thông tư 22/2021/TT-BGDĐT (Đánh giá bằng nhận xét Đạt/Chưa đạt kết hợp đánh giá thường xuyên và định kỳ)',
      'Quy trình thiết kế kế hoạch chủ đề HĐTN (Giáo trình tr. 116–124)',
    ],
    solutionSteps: [
      {
        step: 1,
        title: 'Bước 1: Nhận diện sự việc và xác định vấn đề cần giải quyết',
        content:
          'Giáo viên đã đánh giá sai lệch bản chất của Hoạt động trải nghiệm, hướng nghiệp khi chỉ dùng một bài kiểm tra lý thuyết trên giấy thay vì đánh giá năng lực hành động và sự trưởng thành qua quá trình trải nghiệm thực tế.',
      },
      {
        step: 2,
        title: 'Bước 2: Thu thập thông tin và phân tích nguyên nhân theo lý luận Chương 5',
        content:
          'Theo Giáo trình HCMUE (tr. 110–114), đánh giá HĐTN phải kết hợp đa dạng 6 phương pháp (Tự đánh giá, Đánh giá đồng đẳng, Quan sát, Đánh giá qua hồ sơ/sản phẩm, Khảo sát, Phỏng vấn) và tổng hợp từ nhiều chủ thể (GV, HS, CMHS, cộng đồng).',
      },
      {
        step: 3,
        title: 'Bước 3: Đề xuất các phương án giải quyết khả thi',
        content:
          'Phương án 1: Giữ nguyên kết quả bài kiểm tra giấy để kịp tiến độ vào điểm. Phương án 2: Kết hợp bài thu hoạch với việc rà soát hồ sơ sản phẩm hoạt động cả học kỳ, phiếu tự đánh giá và đánh giá đồng đẳng của tổ học tập.',
      },
      {
        step: 4,
        title: 'Bước 4: Lựa chọn phương án tối ưu và tổ chức thực hiện tác động sư phạm',
        content:
          'Áp dụng Phương án 2: Sử dụng Bảng kiểm (Checklist) và Thang đo (Rubric) để đánh giá dựa trên minh chứng thực tế: (1) Mức độ tham gia các chủ đề tháng; (2) Sản phẩm dự án/hồ sơ học tập; (3) Kết quả tự đánh giá của cá nhân và nhận xét của nhóm bạn.',
      },
      {
        step: 5,
        title: 'Bước 5: Đánh giá kết quả, theo dõi hỗ trợ và rút kinh nghiệm sư phạm',
        content:
          'Công bố tiêu chí đánh giá ngay từ đầu mỗi chủ đề ở học kỳ II để học sinh chủ động lưu giữ minh chứng trải nghiệm và tự điều chỉnh hành vi.',
      },
    ],
    pitfallsToAvoid: [
      'Đánh giá HĐTN như một môn học văn hóa thuần túy lý thuyết bằng bài thi viết học thuộc lòng.',
      'Thiết kế chủ đề HĐTN mà không xác định rõ sản phẩm đầu ra và công cụ đánh giá tương ứng với từng hoạt động.',
    ],
    coreLesson:
      'Đánh giá trong Hoạt động trải nghiệm, hướng nghiệp là đánh giá vì sự tiến bộ của người học thông qua minh chứng hành động, sản phẩm thực tiễn và sự phản tư của chính học sinh.',
  };

  return createElement(
    'div',
    { className: 'space-y-8 text-[#29383D] leading-relaxed' },

    // 1. THANH METADATA & ĐỐI CHIẾU ĐẦU BÀI
    createElement(PedagogyMetadataBar, {
      courseCode: 'EDUC2802',
      clos: ['CLO8', 'CLO9'],
      textbookPages: 'Tr. 110–124 (Chương 5, Mục 5.6 – 5.8)',
      legalRefs: [
        'Thông tư 27/2020/TT-BGDĐT & Thông tư 22/2021/TT-BGDĐT',
        'Tài liệu Quy trình thiết kế chủ đề HĐTN & Mô đun 2 THCS, THPT',
      ],
      sessionNote: 'Lý thuyết, Thảo luận & Thực hành 3',
    }),

    // PHẦN I: 6 PHƯƠNG PHÁP ĐÁNH GIÁ KẾT QUẢ HOẠT ĐỘNG TRẢI NGHIỆM (TR. 110–114)
    createElement(
      'section',
      { id: '1-sau-phuong-phap-danh-gia-hdtn', className: 'space-y-4' },
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
          '1. Sáu phương pháp đánh giá kết quả Hoạt động trải nghiệm, hướng nghiệp (Giáo trình tr. 110–114)',
        ),
      ),
      createElement(
        'div',
        { className: 'text-sm text-[#29383D]' },
        'Theo ',
        createElement('strong', null, 'Giáo trình Giáo dục học HCMUE (tr. 110–114)'),
        ', đánh giá kết quả Hoạt động trải nghiệm, hướng nghiệp phải bảo đảm tính toàn diện, khách quan, kết hợp đánh giá quá trình với đánh giá tổng kết thông qua ',
        createElement('strong', null, '6 phương pháp đánh giá chủ yếu'),
        '.',
        createElement(
          Sidenote,
          {
            number: 1,
            type: 'pedagogy',
            title: 'Cơ chế xếp loại kết quả HĐTN, HN',
          },
          'Kết quả đánh giá HĐTN được tổng hợp thành 2 mức: "Đạt" và "Chưa đạt" (ở cấp THCS, THPT theo Thông tư 22/2021) hoặc "Hoàn thành tốt", "Hoàn thành", "Chưa hoàn thành" (ở cấp Tiểu học theo Thông tư 27/2020) và được ghi vào Học bạ.',
        ),
      ),

      createElement(ComparativeTable, {
        title:
          'Hệ thống 6 Phương pháp đánh giá kết quả Hoạt động trải nghiệm, hướng nghiệp (Giáo trình HCMUE tr. 111–114)',
        subtitle:
          'Phối hợp đa phương pháp và đa công cụ để thu thập minh chứng xác thực về 3 năng lực đặc thù của học sinh.',
        headers: [
          'Phương pháp đánh giá',
          'Bản chất và Cách thức tiến hành',
          'Công cụ & Minh chứng đánh giá đi kèm',
        ],
        rows: [
          [
            '1. Phương pháp tự đánh giá (Self-assessment)',
            'Học sinh tự đối chiếu hành vi, thái độ và kết quả thực hiện nhiệm vụ của bản thân với mục tiêu/tiêu chí của chủ đề để tự nhận xét điểm mạnh và hạn chế.',
            'Phiếu tự đánh giá cá nhân, nhật ký trải nghiệm, bảng kiểm tự quan sát sau mỗi chủ đề.',
          ],
          [
            '2. Đánh giá đồng đẳng (Peer-assessment)',
            'Các thành viên trong tổ, nhóm học sinh nhận xét, góp ý chéo cho nhau về tinh thần hợp tác, trách nhiệm và mức độ đóng góp vào nhiệm vụ chung.',
            'Phiếu đánh giá đồng đẳng trong nhóm, biên bản họp tổ/nhóm, phiếu bình bầu tích cực.',
          ],
          [
            '3. Phương pháp quan sát sư phạm',
            'Giáo viên, phụ huynh hoặc người hướng dẫn quan sát trực tiếp cử chỉ, lời nói, thái độ và hành động thực tế của học sinh trong suốt quá trình tham gia hoạt động.',
            'Sổ theo dõi của GV, bảng kiểm quan sát (Checklist), thang đo mức độ tham gia (Rating scale), ảnh/video tư liệu.',
          ],
          [
            '4. Đánh giá qua hồ sơ và sản phẩm hoạt động',
            'Phân tích chất lượng các sản phẩm vật chất hoặc tinh thần do cá nhân/nhóm học sinh tạo ra trong và sau quá trình trải nghiệm.',
            'Hồ sơ học tập (Portfolio), kế hoạch cá nhân, báo cáo thu hoạch, poster, mô hình STEM, sản phẩm thiện nguyện, Rubric chấm sản phẩm.',
          ],
          [
            '5. Phương pháp khảo sát (Điều tra bảng hỏi)',
            'Thu thập thông tin diện rộng về nhận thức, thái độ, hứng thú và nhu cầu của học sinh hoặc ý kiến phản hồi của cha mẹ học sinh, cộng đồng.',
            'Phiếu khảo sát trước và sau hoạt động, phiếu xin ý kiến nhận xét của gia đình và địa phương.',
          ],
          [
            '6. Phương pháp phỏng vấn / Vấn đáp nhanh',
            'Trao đổi, đặt câu hỏi trực tiếp với cá nhân hoặc nhóm học sinh để làm rõ mức độ hiểu biết, cảm xúc chiêm nghiệm và dự định vận dụng của các em.',
            'Hệ thống câu hỏi phỏng vấn bán cấu trúc, câu hỏi phản tư (Debriefing questions) cuối hoạt động.',
          ],
        ],
      }),
    ),

    // PHẦN II: ĐIỀU KIỆN TỔ CHỨC VÀ QUY TRÌNH THIẾT KẾ CHỦ ĐỀ HĐTN (TR. 114–124)
    createElement(
      'section',
      { id: '2-dieu-kien-va-quy-trinh-thiet-ke-chu-de-hdtn', className: 'space-y-4' },
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
          '2. Điều kiện tổ chức và Quy trình thiết kế chủ đề Hoạt động trải nghiệm, hướng nghiệp (Giáo trình tr. 114–124)',
        ),
      ),

      createElement(LegalReferenceBox, {
        documentTitle: 'Giáo trình Giáo dục học HCMUE (Tr. 114–116) & Thông tư 32/2018/TT-BGDĐT',
        article: 'Điều kiện thực hiện chương trình Hoạt động trải nghiệm, hướng nghiệp',
        quote:
          'Để tổ chức hiệu quả Hoạt động trải nghiệm, hướng nghiệp cần bảo đảm đồng bộ 3 nhóm điều kiện: (1) Đội ngũ nhân sự thực hiện (Ban giám hiệu, GVCN, GV bộ môn, Tổng phụ trách Đội, Bí thư Đoàn trường, chuyên gia/nghệ nhân ngoài trường); (2) Cơ sở vật chất, thiết bị và nguồn kinh phí; (3) Không gian tổ chức trong và ngoài nhà trường an toàn, sư phạm.',
        pedagogicalAnalysis:
          'Khi thiết kế kế hoạch chủ đề HĐTN (Mục 5.8 Giáo trình tr. 116–124 và Tài liệu bồi dưỡng Mô đun 2 THCS/THPT), giáo viên phải tuân thủ quy trình khoa học từ xác định chủ đề, mục tiêu đến chuỗi hoạt động theo tiến trình trải nghiệm.',
      }),

      createElement(NumberedProcessFlow, {
        title:
          'Quy trình thiết kế kế hoạch chủ đề Hoạt động trải nghiệm, hướng nghiệp (Giáo trình HCMUE tr. 116–124)',
        subtitle:
          'Quy trình chuẩn áp dụng cho việc soạn Kế hoạch giáo dục chủ đề HĐTN ở cấp THCS & THPT (phục vụ trực tiếp Bài Thực hành 3).',
        columns: 2,
        steps: [
          {
            number: 1,
            title: 'Bước 1: Xác định tên chủ đề và thời lượng thực hiện',
            badge: 'Định danh chủ đề',
            description:
              'Căn cứ vào 4 mạch nội dung trong Chương trình HĐTN, HN của từng khối lớp, đặc điểm học sinh và điều kiện thực tế địa phương để đặt tên chủ đề ngắn gọn, giàu sức gợi và xác định số tiết.',
          },
          {
            number: 2,
            title: 'Bước 2: Xác định mục tiêu (Yêu cầu cần đạt) của chủ đề',
            badge: 'Năng lực & Phẩm chất',
            description:
              'Viết mục tiêu bằng động từ hành động đo lường được theo 3 nhóm: (a) Năng lực đặc thù HĐTN; (b) Năng lực chung; (c) Phẩm chất chủ yếu.',
          },
          {
            number: 3,
            title: 'Bước 3: Chuẩn bị thiết bị giáo dục, học liệu và điều kiện thực hiện',
            badge: 'Chuẩn bị của GV & HS',
            description:
              'Liệt kê cụ thể sự chuẩn bị của Giáo viên (kịch bản, phiếu học tập, công cụ đánh giá, phương án an toàn) và sự chuẩn bị trước của Học sinh (sưu tầm tư liệu, dụng cụ, tâm thế).',
          },
          {
            number: 4,
            title: 'Bước 4: Thiết kế chuỗi các hoạt động cụ thể theo tiến trình trải nghiệm',
            badge: 'Khởi động -> Khám phá -> Luyện tập -> Vận dụng',
            description:
              'Thiết kế từng hoạt động theo cấu trúc 4 thành phần: (1) Mục tiêu hoạt động; (2) Nội dung hoạt động; (3) Sản phẩm cần đạt; (4) Tổ chức thực hiện (Chuyển giao nhiệm vụ -> Thực hiện -> Báo cáo, thảo luận -> Kết luận, nhận định).',
          },
          {
            number: 5,
            title: 'Bước 5: Thiết kế phương án và công cụ kiểm tra, đánh giá chủ đề',
            badge: 'Bảng kiểm & Rubric',
            description:
              'Xây dựng tiêu chí đánh giá quá trình và sản phẩm (Phiếu tự đánh giá, Phiếu đánh giá đồng đẳng, Rubric đánh giá của giáo viên) gắn chặt với mục tiêu đã đề ra ở Bước 2.',
          },
          {
            number: 6,
            title: 'Bước 6: Rà soát, hoàn thiện kế hoạch và rút kinh nghiệm sau tổ chức',
            badge: 'Hoàn thiện hồ sơ',
            description:
              'Kiểm tra tính khả thi về phân bố thời gian, tính liên thông giữa Sinh hoạt dưới cờ – Chủ đề – Sinh hoạt lớp và dự kiến các tình huống sư phạm phát sinh.',
          },
        ],
      }),
    ),

    // PHẦN III: CÂU HỎI ÔN TẬP & TÌNH HUỐNG THỰC HÀNH
    createElement(
      'section',
      { id: '3-on-tap-va-tinh-huong-bai-5-3', className: 'space-y-6' },
      createElement(
        'div',
        {
          className:
            'flex items-center gap-2 border-b border-[#CFDADB] pb-2 font-serif text-xl font-bold text-[#29383D]',
        },
        createElement(HelpCircle, { className: 'h-5 w-5 text-[#3F6570]' }),
        createElement('h3', null, '3. Câu hỏi tự luận ôn tập và Tình huống vận dụng (CLO8, CLO9)'),
      ),
      createElement(
        'div',
        { className: 'rounded-2xl border border-[#CFDADB] bg-[#F7FAFA] p-5 space-y-2' },
        createElement(
          'p',
          { className: 'text-sm font-bold text-[#29383D]' },
          'Câu hỏi ôn tập (Giáo trình HCMUE tr. 124): Phân tích 6 phương pháp đánh giá kết quả Hoạt động trải nghiệm, hướng nghiệp và trình bày quy trình thiết kế kế hoạch tổ chức một chủ đề Hoạt động trải nghiệm ở trường phổ thông.',
        ),
        createElement(
          'p',
          { className: 'text-xs text-[#55676B]' },
          'Gợi ý trả lời: Trình bày 6 phương pháp đánh giá (Tự đánh giá, Đồng đẳng, Quan sát, Hồ sơ/sản phẩm, Khảo sát, Phỏng vấn) và 6 bước thiết kế kế hoạch chủ đề HĐTN theo tiến trình trải nghiệm.',
        ),
      ),
      createElement(CaseStudyBox, { caseStudy: caseStudy5_3 }),
    ),
  );
};

// Bí danh tương thích ngược
export const Lesson5_4View: FC = Lesson5_3View;

// ============================================================================
// 4. DISPATCHER TRÌNH NẠP BÀI HỌC CHƯƠNG 5 (GETCHAPTER5LESSONMODULE)
// ============================================================================

export function getChapter5LessonModule(lessonId: string): CompiledLessonModule | null {
  if (
    lessonId ===
      'gdh-c5-b1-ban-chat-muc-tieu-va-noi-dung-hoat-dong-trai-nghiem-o-truong-pho-thong' ||
    lessonId === 'gdh-c5-b1-khai-niem-ban-chat-va-muc-tieu-hoat-dong-trai-nghiem'
  ) {
    return {
      default: Lesson5_1View,
      frontmatter: {
        title: 'Bài 5.1: Bản chất, mục tiêu và nội dung hoạt động trải nghiệm ở trường phổ thông',
        description:
          'Bản chất phương thức giáo dục qua trải nghiệm; mục tiêu hình thành 3 năng lực đặc thù (Thích ứng với cuộc sống, Thiết kế và tổ chức hoạt động, Định hướng nghề nghiệp) và 4 mạch nội dung chính: Hướng vào bản thân, Hướng đến xã hội, Hướng đến tự nhiên, Hướng nghiệp (Giáo trình HCMUE tr. 83–87).',
        level: 'basic',
        tags: [
          'CLO8',
          'HĐTN & Hướng nghiệp',
          '3 Năng lực đặc thù',
          '4 Mạch nội dung',
          'Giáo trình tr. 83-87',
        ],
      },
      lessonMeta: {
        chapterNumber: 5,
        lessonNumber: 1,
        headings: [
          {
            id: '1-ban-chat-phuong-thuc-trai-nghiem',
            text: '1. Khái niệm và bản chất phương thức giáo dục qua trải nghiệm (Giáo trình tr. 83–84)',
            depth: 2,
          },
          {
            id: '2-muc-tieu-va-3-nang-luc-dac-thu',
            text: '2. Mục tiêu các cấp học và 3 năng lực đặc thù của Hoạt động trải nghiệm, hướng nghiệp (Giáo trình tr. 84–85)',
            depth: 2,
          },
          {
            id: '3-bon-mach-noi-dung-hdtn',
            text: '3. Bốn mạch nội dung chính của Hoạt động trải nghiệm, hướng nghiệp (Giáo trình tr. 85–87)',
            depth: 2,
          },
          {
            id: '4-on-tap-va-tinh-huong-bai-5-1',
            text: '4. Câu hỏi tự luận ôn tập và Tình huống vận dụng (CLO8)',
            depth: 2,
          },
        ],
        blocks: [],
      },
    };
  }

  if (
    lessonId === 'gdh-c5-b2-phuong-thuc-va-loai-hinh-to-chuc-hoat-dong-trai-nghiem' ||
    lessonId === 'gdh-c5-b2-noi-dung-va-phuong-thuc-to-chuc-hoat-dong-trai-nghiem'
  ) {
    return {
      default: Lesson5_2View,
      frontmatter: {
        title: 'Bài 5.2: Phương thức và loại hình tổ chức hoạt động trải nghiệm',
        description:
          '4 nhóm phương thức và quy trình chi tiết: Hội thảo, Diễn đàn, Trò chơi, Sân khấu tương tác (5 bước), Tham quan (3 bước), Tình nguyện (5 bước), Lao động công ích (4 bước), Nghiên cứu khoa học (8 bước), Dự án (5 bước); cùng 4 loại hình: Sinh hoạt dưới cờ, Sinh hoạt lớp, Hoạt động theo chủ đề và Câu lạc bộ (Giáo trình HCMUE tr. 88–110).',
        level: 'intermediate',
        tags: [
          'CLO8',
          'CLO9',
          '4 Nhóm phương thức',
          '4 Loại hình HĐTN',
          'Sân khấu tương tác',
          'Giáo trình tr. 88-110',
        ],
      },
      lessonMeta: {
        chapterNumber: 5,
        lessonNumber: 2,
        headings: [
          {
            id: '1-bon-nhom-phuong-thuc-to-chuc-hdtn',
            text: '1. Hệ thống 4 nhóm phương thức và quy trình các phương pháp tổ chức HĐTN (Giáo trình tr. 88–107)',
            depth: 2,
          },
          {
            id: '2-bon-loai-hinh-to-chuc-hdtn',
            text: '2. Bốn loại hình tổ chức Hoạt động trải nghiệm, hướng nghiệp (Giáo trình tr. 108–110)',
            depth: 2,
          },
          {
            id: '3-on-tap-va-tinh-huong-bai-5-2',
            text: '3. Câu hỏi tự luận ôn tập và Tình huống vận dụng (CLO8, CLO9)',
            depth: 2,
          },
        ],
        blocks: [],
      },
    };
  }

  if (
    lessonId ===
      'gdh-c5-b3-danh-gia-ket-qua-dieu-kien-to-chuc-va-quy-trinh-thiet-ke-chu-de-hoat-dong-trai-nghiem' ||
    lessonId === 'gdh-c5-b3-quy-trinh-thiet-ke-ke-hoach-chu-de-hdtn-va-tien-trinh-4-buoc' ||
    lessonId === 'gdh-c5-b4-danh-gia-ket-qua-hdtn-va-thuc-hanh-xay-dung-ke-hoach-rubric-a19'
  ) {
    return {
      default: Lesson5_3View,
      frontmatter: {
        title:
          'Bài 5.3: Đánh giá kết quả, điều kiện tổ chức và quy trình thiết kế chủ đề hoạt động trải nghiệm',
        description:
          '6 phương pháp đánh giá kết quả Hoạt động trải nghiệm, hướng nghiệp; các điều kiện đảm bảo tổ chức hoạt động và quy trình thiết kế kế hoạch chủ đề HĐTN theo cấu trúc chuẩn của Giáo trình HCMUE & Tài liệu Mô đun 2 (Giáo trình HCMUE tr. 110–124).',
        level: 'advanced',
        tags: [
          'CLO8',
          'CLO9',
          '6 Phương pháp đánh giá HĐTN',
          'Quy trình thiết kế chủ đề',
          'Mô đun 2 THCS & THPT',
          'Giáo trình tr. 110-124',
        ],
      },
      lessonMeta: {
        chapterNumber: 5,
        lessonNumber: 3,
        headings: [
          {
            id: '1-sau-phuong-phap-danh-gia-hdtn',
            text: '1. Sáu phương pháp đánh giá kết quả Hoạt động trải nghiệm, hướng nghiệp (Giáo trình tr. 110–114)',
            depth: 2,
          },
          {
            id: '2-dieu-kien-va-quy-trinh-thiet-ke-chu-de-hdtn',
            text: '2. Điều kiện tổ chức và Quy trình thiết kế chủ đề Hoạt động trải nghiệm, hướng nghiệp (Giáo trình tr. 114–124)',
            depth: 2,
          },
          {
            id: '3-on-tap-va-tinh-huong-bai-5-3',
            text: '3. Câu hỏi tự luận ôn tập và Tình huống vận dụng (CLO8, CLO9)',
            depth: 2,
          },
        ],
        blocks: [],
      },
    };
  }

  return null;
}
