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
import { GOOGLE_DRIVE_DOCS_URL } from '@/shared/config/routes';
import {
  BookOpen,
  Compass,
  ExternalLink,
  FileText,
  HelpCircle,
  Layers,
  Scale,
  Sparkles,
  Target,
} from 'lucide-react';
import { createElement, type FC } from 'react';
import type { PedagogicalCaseStudy } from './course';

// ============================================================================
// 1. COMPONENT BÀI 5.1: BẢN CHẤT, MỤC TIÊU VÀ NỘI DUNG HOẠT ĐỘNG TRẢI NGHIỆM (TR. 83–87)
// ============================================================================

export const Lesson5_1View: FC = () => {
  const caseStudy5_1: PedagogicalCaseStudy = {
    id: 501,
    title: 'Khắc phục lối tổ chức Hoạt động trải nghiệm hình thức và phát triển 3 năng lực đặc thù',
    context:
      'Tại một trường THPT, khi triển khai Hoạt động trải nghiệm, hướng nghiệp khối 11, một số giáo viên chỉ chiếu slide thuyết giảng một chiều trên bục giảng suốt 45 phút như một tiết dạy học lý thuyết thông thường, học sinh ngồi nghe thụ động và chép bài vào vở mà không có bất kỳ hoạt động thực hành, chiêm nghiệm hay vận dụng nào.',
    question:
      'Vận dụng kiến thức về Bản chất phương thức giáo dục qua trải nghiệm, 3 năng lực đặc thù và 4 mạch nội dung của Hoạt động trải nghiệm, hướng nghiệp (Giáo trình Giáo dục học HCMUE tr. 83–87; CT GDPT 2018), anh/chị hãy xử lí tình huống theo quy trình 5 bước chuẩn mực.',
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
          'Phương án 1: Tiếp tục duy trì hình thức thuyết giảng cho dễ quản lý trật tự lớp học. Phương án tối ưu: Tổ bộ môn/Tổ chủ nhiệm tổ chức sinh hoạt chuyên đề tái cấu trúc kịch bản HĐTN theo chu trình trải nghiệm 4 pha, chuyển học sinh thành chủ thể thiết kế và thực hiện.',
      },
      {
        step: 4,
        title: 'Bước 4: Lựa chọn phương án tối ưu và tổ chức thực hiện tác động sư phạm',
        content:
          'Triển khai phương án đổi mới: Chuyển tiết giảng lý thuyết thành chuỗi hoạt động trải nghiệm: (1) Khởi động kết nối kinh nghiệm sẵn có; (2) Trải nghiệm thực tế qua xử lý tình huống, thảo luận trạm; (3) Rèn luyện kỹ năng qua đóng vai, lập kế hoạch; (4) Vận dụng thực tế ngoài lớp học.',
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
      'Tách rời hoạt động khỏi việc chiêm nghiệm, phản tư khiến học sinh chỉ vui chơi bề nổi mà không đúc kết được bài học giá trị.',
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
      lessonCode: 'EDUC2802-C5-L1',
      clos: ['CLO8'],
      textbookPages: 'Giáo trình Giáo dục học HCMUE (Trang 83 – 87)',
      legalRefs: [
        'Thông tư 32/2018/TT-BGDĐT (Chương trình Hoạt động trải nghiệm và HĐTN, hướng nghiệp)',
        'Tài liệu bồi dưỡng giáo viên cốt cán Mô đun 2 THCS & THPT (Bộ GD&ĐT)',
      ],
      sessionNote: 'Mục 5.1 – 5.2 · Trang 83 – 87',
    }),

    // CỤM NÚT TÁC VỤ (TEXT THUẦN TÚY)
    createElement(
      'div',
      {
        className:
          'flex flex-wrap items-center gap-2 rounded-xl border border-[#CFDADB] bg-[#F7FAFA] px-4 py-2.5 text-xs text-[#55676B] shadow-2xs',
      },
      ['Đánh dấu hoàn thành', 'Lưu bài', 'Ghi chú', 'Thuật ngữ: Bật'].map((actionText) =>
        createElement(
          'span',
          {
            key: actionText,
            className:
              'rounded-lg border border-[#CFDADB] bg-[#E1E9EA]/60 px-3 py-1 font-medium text-[#29383D]',
          },
          actionText,
        ),
      ),
    ),

    // PHẦN I: BẢN CHẤT CỦA HOẠT ĐỘNG TRẢI NGHIỆM Ở TRƯỜNG PHỔ THÔNG (TRANG 83 – 84)
    createElement(
      'section',
      { id: '1-ban-chat-hoat-dong-trai-nghiem', className: 'space-y-4' },
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
          '1. Khái niệm và Bản chất của Hoạt động Trải nghiệm ở Trường Phổ thông (Trang 83 – 84)',
        ),
      ),
      createElement(
        'div',
        { className: 'space-y-3 text-sm text-[#29383D]' },
        createElement(
          'p',
          null,
          createElement(
            'strong',
            { className: 'text-[#3F6570]' },
            'Khái niệm Trải nghiệm (Experience): ',
          ),
          'Quá trình cá nhân tiếp xúc thực tế, thao tác với đối tượng, cảm nhận, suy ngẫm và đúc kết kinh nghiệm mới để chuyển hóa thành tri thức, kỹ năng, xúc cảm và giá trị sống.',
        ),
        createElement(
          'div',
          { className: 'rounded-xl border border-[#CFDADB] bg-[#F7FAFA] p-4 space-y-2' },
          createElement(
            'h4',
            { className: 'font-serif text-sm font-bold text-[#3F6570]' },
            'Định vị trong Chương trình GDPT 2018 (Thông tư 32/2018/TT-BGDĐT):',
          ),
          createElement(
            'ul',
            { className: 'list-disc space-y-1 pl-4 text-xs text-[#55676B]' },
            createElement(
              'li',
              null,
              'Cấp Tiểu học: Mang tên ',
              createElement('strong', { className: 'text-[#29383D]' }, '"Hoạt động trải nghiệm"'),
              '.',
            ),
            createElement(
              'li',
              null,
              'Cấp THCS và THPT: Mang tên ',
              createElement(
                'strong',
                { className: 'text-[#29383D]' },
                '"Hoạt động trải nghiệm, hướng nghiệp"',
              ),
              '.',
            ),
            createElement(
              'li',
              null,
              'Tính chất pháp lý: Là ',
              createElement(
                'strong',
                { className: 'text-[#3F6570]' },
                'hoạt động giáo dục bắt buộc',
              ),
              ' với thời lượng ',
              createElement('strong', { className: 'text-[#29383D]' }, '105 tiết/năm học'),
              ' xuyên suốt từ lớp 1 đến lớp 12 (tương đương 3 tiết/tuần).',
            ),
          ),
        ),
        createElement(
          'p',
          null,
          createElement('strong', { className: 'text-[#3F6570]' }, 'Bản chất giáo dục học: '),
          'Hoạt động do nhà giáo dục định hướng, thiết kế và hướng dẫn; học sinh trực tiếp tham gia, thể nghiệm cảm xúc tích cực, khai thác vốn kinh nghiệm sẵn có và huy động kiến thức liên môn để giải quyết vấn đề thực tiễn.',
        ),
        createElement(
          Sidenote,
          {
            number: 1,
            type: 'pedagogy',
            title: 'Điểm đổi mới căn bản',
          },
          'Chuyển từ "dạy chữ" sang cân bằng "dạy chữ" và "dạy người", hoạt động của học sinh, do học sinh, vì học sinh dưới vai trò định hướng của thầy cô.',
        ),
      ),
      createElement(ScholarQuote, {
        scholar: 'David A. Kolb (1984)',
        work: 'Experiential Learning: Experience as the Source of Learning and Development',
        quote:
          'Học tập là quá trình mà tri thức và năng lực được kiến tạo thông qua sự chuyển hóa kinh nghiệm.',
        analysis:
          'Giáo trình HCMUE (tr. 83–84) khẳng định bản chất của phương thức trải nghiệm là chu trình học tập khép kín: học sinh trực tiếp hành động, chiêm nghiệm phản tư, đúc kết quy luật và vận dụng vào hoàn cảnh thực tiễn mới.',
      }),
      createElement(NumberedProcessFlow, {
        title:
          'Chu trình 4 Pha của Phương thức Giáo dục qua Trải nghiệm (David Kolb & HCMUE tr. 83–84)',
        subtitle:
          'Quy luật tâm lý – sư phạm chi phối mọi thiết kế bài dạy và chủ đề hoạt động trải nghiệm ở trường phổ thông.',
        badge: 'Chu trình Trải nghiệm 4 Pha',
        columns: 2,
        steps: [
          {
            number: 1,
            title: 'Pha 1: Trải nghiệm cụ thể (Concrete Experience)',
            badge: 'Hành động trực tiếp',
            description:
              'Học sinh trực tiếp tham gia vào tình huống, sự kiện, trò chơi, dự án hoặc hoạt động thực tiễn bằng các giác quan, cảm xúc và kinh nghiệm sẵn có.',
            keyAction: 'Học sinh tiếp xúc thực tế và thao tác trực tiếp với đối tượng.',
            deliverable: 'Cảm xúc ban đầu và vốn trải nghiệm trực quan sống động.',
          },
          {
            number: 2,
            title: 'Pha 2: Quan sát phản tỉnh / Chiêm nghiệm (Reflective Observation)',
            badge: 'Phản tư & Suy ngẫm',
            description:
              'Học sinh nhìn nhận lại những gì vừa trải qua, chia sẻ cảm xúc, phân tích các khía cạnh thành công hay vướng mắc dưới câu hỏi dẫn dắt của giáo viên.',
            keyAction: 'Chia sẻ cảm xúc, thảo luận nhóm và đối thoại phản tư.',
            deliverable: 'Ý thức rõ ràng về nguyên nhân thành công hoặc thất bại trong hành động.',
          },
          {
            number: 3,
            title: 'Pha 3: Khái quát hóa / Trừu tượng hóa (Abstract Conceptualization)',
            badge: 'Đúc kết bài học',
            description:
              'Từ các quan sát và chiêm nghiệm, học sinh tổng kết thành khái niệm, bài học kinh nghiệm, quy trình hành động hoặc hệ giá trị sống đúng đắn.',
            keyAction: 'Khái quát hóa kinh nghiệm cảm tính thành tri thức và nguyên tắc hành vi.',
            deliverable: 'Quy tắc ứng xử, bài học đạo đức và kỹ năng sống mới.',
          },
          {
            number: 4,
            title: 'Pha 4: Thử nghiệm tích cực / Vận dụng mới (Active Experimentation)',
            badge: 'Ứng dụng thực tiễn',
            description:
              'Học sinh đưa những bài học, quy trình vừa đúc kết vào giải quyết các nhiệm vụ mới trong học tập, đời sống gia đình và cộng đồng xã hội.',
            keyAction: 'Chuyển hóa bài học thành hành động thực tế trong đời sống hàng ngày.',
            deliverable: 'Năng lực hành động thực tế và thói quen tích cực bền vững.',
          },
        ],
      }),
    ),

    // PHẦN II: MỤC TIÊU PHÁT TRIỂN NĂNG LỰC TRONG HOẠT ĐỘNG TRẢI NGHIỆM (TRANG 84 – 85)
    createElement(
      'section',
      { id: '2-muc-tieu-phat-trien-nang-luc', className: 'space-y-4' },
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
          '2. Mục tiêu Phát triển Năng lực trong Hoạt động Trải nghiệm (Trang 84 – 85)',
        ),
      ),
      createElement(
        'div',
        { className: 'space-y-3 text-sm text-[#29383D]' },
        createElement(
          'p',
          null,
          createElement('strong', { className: 'text-[#3F6570]' }, 'Mục tiêu chung: '),
          'Giúp học sinh khám phá bản thân, phát triển tâm hồn phong phú, hình thành quan niệm sống đúng đắn, bồi dưỡng tình yêu quê hương đất nước; hình thành 5 phẩm chất chủ yếu và 3 năng lực chung quy định trong Chương trình tổng thể.',
        ),
      ),
      createElement(ComparativeTable, {
        title:
          'Cấu trúc 3 Năng lực Đặc thù của Hoạt động Trải nghiệm, Hướng nghiệp (Trang 84 – 85)',
        subtitle:
          'Ba trụ cột năng lực chuyên biệt được hình thành và đánh giá liên tục từ lớp 1 đến lớp 12 (Thông tư 32/2018).',
        badge: '3 Năng lực Đặc thù HĐTN',
        columns: [
          { key: 'competency', header: 'Năng lực đặc thù', widthClass: 'w-1/4' },
          { key: 'components', header: 'Các thành tố năng lực cốt lõi', widthClass: 'w-3/8' },
          { key: 'indicators', header: 'Biểu hiện hành vi cần đạt ở học sinh' },
        ],
        rows: [
          {
            competency: '1. Năng lực thích ứng với cuộc sống',
            components:
              'Hiểu biết về bản thân và môi trường sống; kỹ năng điều chỉnh bản thân và ứng phó với biến đổi môi trường/xã hội.',
            indicators:
              'Nhận diện rõ điểm mạnh, điểm yếu của bản thân; kiểm soát cảm xúc tiêu cực, ứng phó linh hoạt trước các thay đổi và áp lực cuộc sống.',
          },
          {
            competency: '2. Năng lực thiết kế và tổ chức hoạt động',
            components:
              'Lập kế hoạch hoạt động; thực hiện và điều chỉnh kế hoạch; đánh giá hoạt động tập thể và dự án thực tiễn.',
            indicators:
              'Chủ động đề xuất ý tưởng, phân công công việc, phối hợp điều phối nguồn lực nhóm và tự đánh giá, rút kinh nghiệm sau hoạt động.',
          },
          {
            competency: '3. Năng lực định hướng nghề nghiệp',
            components:
              'Hiểu biết nghề nghiệp; tự đánh giá phẩm chất, năng lực phù hợp nghề; đưa ra quyết định chọn nghề và lập kế hoạch rèn luyện.',
            indicators:
              'Nắm vững thông tin thị trường lao động, đối chiếu sở trường bản thân để chọn tổ hợp môn học THPT và ngành nghề tương lai phù hợp.',
          },
        ],
        footerNote:
          'Nguồn: Chương trình GDPT 2018 (Thông tư 32/2018/TT-BGDĐT) & Giáo trình HCMUE Trang 84 – 85.',
      }),
      createElement(
        'div',
        { className: 'rounded-xl border border-[#CFDADB] bg-[#F7FAFA] p-4 space-y-2' },
        createElement(
          'h4',
          { className: 'font-serif text-sm font-bold text-[#3F6570]' },
          'Mục tiêu phân kỳ theo 3 cấp học:',
        ),
        createElement(
          'ul',
          { className: 'list-disc space-y-1.5 pl-4 text-xs text-[#55676B]' },
          createElement(
            'li',
            null,
            createElement('strong', { className: 'text-[#29383D]' }, 'Cấp Tiểu học: '),
            'Hình thành thói quen sinh hoạt nề nếp, kỹ năng tự phục vụ, hành vi ứng xử văn hóa, tình cảm gia đình và trách nhiệm với bản thân.',
          ),
          createElement(
            'li',
            null,
            createElement('strong', { className: 'text-[#29383D]' }, 'Cấp THCS: '),
            'Phát triển trách nhiệm cá nhân với cộng đồng, kỹ năng tổ chức công việc khoa học, hiểu biết bước đầu về các lĩnh vực nghề nghiệp để chuẩn bị phân luồng sau lớp 9.',
          ),
          createElement(
            'li',
            null,
            createElement('strong', { className: 'text-[#29383D]' }, 'Cấp THPT: '),
            'Phát triển năng lực tự chủ, quản lý bản thân, thích ứng với cách mạng công nghiệp mới; trọng tâm là định hướng và đưa ra quyết định lựa chọn nghề nghiệp tương lai.',
          ),
        ),
      ),
    ),

    // PHẦN III: BẢNG MA TRẬN 4 MẠCH NỘI DUNG HOẠT ĐỘNG TRẢI NGHIỆM (TRANG 85 – 87)
    createElement(
      'section',
      { id: '3-ma-tran-4-mach-noi-dung', className: 'space-y-4' },
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
          '3. Bảng Ma trận 4 Mạch Nội dung Hoạt động Trải nghiệm theo Cấp học (Trang 85 – 87)',
        ),
      ),
      createElement(ComparativeTable, {
        title:
          'Bảng Ma trận 4 Mạch Nội dung Hoạt động Trải nghiệm gắn với Phân kỳ Cấp học (Trang 85 – 87)',
        subtitle:
          'Cấu trúc mạch nội dung đồng tâm và mở rộng, phân bổ thời lượng thích ứng với từng giai đoạn lứa tuổi.',
        badge: '4 Mạch Nội dung HĐTN',
        columns: [
          { key: 'strand', header: 'Mạch nội dung', widthClass: 'w-1/4' },
          { key: 'subStrands', header: 'Các hoạt động phân nhánh cụ thể', widthClass: 'w-3/8' },
          { key: 'focus', header: 'Trọng tâm cấp học phân bổ' },
        ],
        rows: [
          {
            strand: 'Mạch 1: Hoạt động hướng vào bản thân',
            subStrands:
              'Khám phá bản thân (nhận diện hình thể, cảm xúc, sở thích, tính cách); Rèn luyện bản thân (tự phục vụ, quản lý cảm xúc, quản lý thời gian, chi tiêu an toàn).',
            focus:
              'Chiếm ưu thế ở cấp Tiểu học; tiếp tục phát triển ở cấp THCS và THPT theo chiều sâu nhận thức bản sắc cá nhân.',
          },
          {
            strand: 'Mạch 2: Hoạt động hướng đến xã hội',
            subStrands:
              'Chăm sóc gia đình (lòng hiếu thảo, gắn kết gia đình); Xây dựng nhà trường (văn hóa học đường, tôn sư trọng đạo, tình bạn); Xây dựng cộng đồng (thiện nguyện, ứng xử công cộng).',
            focus:
              'Mở rộng mạnh mẽ ở cấp THCS và THPT thông qua các dự án tình nguyện và hoạt động truyền thông văn hóa xã hội.',
          },
          {
            strand: 'Mạch 3: Hoạt động hướng đến tự nhiên',
            subStrands:
              'Tìm hiểu và bảo tồn cảnh quan thiên nhiên, di tích địa phương; Bảo vệ môi trường sống, ứng phó với biến đổi khí hậu và giảm thiểu rác thải nhựa.',
            focus:
              'Triển khai liên tục qua các dự án thực địa, trải nghiệm sinh thái và hành động bảo vệ môi trường từ Tiểu học đến THPT.',
          },
          {
            strand: 'Mạch 4: Hoạt động hướng nghiệp',
            subStrands:
              'Tìm hiểu nghề nghiệp địa phương và thế giới nghề; Rèn luyện phẩm chất/năng lực theo nghề; Lựa chọn hướng nghề và lập kế hoạch học tập nghề nghiệp.',
            focus:
              'Sơ khởi hình thành ở cấp THCS (khám phá nghề) và trở thành TRỌNG TÂM CHIẾM ƯU THẾ ở cấp THPT (chọn tổ hợp môn và quyết định nghề).',
          },
        ],
        footerNote: 'Nguồn: Giáo trình Giáo dục học HCMUE (Mục 5.2, Trang 85 – 87).',
      }),
    ),

    // PHẦN IV: KHUNG TÌNH HUỐNG THỰC HÀNH 5 BƯỚC (CASE STUDY 501)
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
          '4. Tình huống Thực hành 5 Bước: Đổi mới Phương thức Giáo dục qua Trải nghiệm',
        ),
      ),
      createElement(CaseStudyBox, { caseStudy: caseStudy5_1, defaultOpenSolution: false }),
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
      'Vận dụng lý luận về 4 nhóm phương thức (đặc biệt là quy trình 5 bước của Sân khấu tương tác và quy trình Diễn đàn) cùng 4 loại hình tổ chức HĐTN (Giáo trình Giáo dục học HCMUE tr. 88–110), anh/chị hãy xử lí tình huống theo quy trình 5 bước chuẩn mực.',
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
          'Phương án 1: Rút ngắn bài diễn văn xuống 15 phút và chiếu thêm 1 video. Phương án tối ưu: Tổ chức phần Sinh hoạt chủ đề dưới cờ (30 phút sau nghi lễ chào cờ) bằng vở kịch tương tác 5 bước do CLB Kịch của trường biểu diễn.',
      },
      {
        step: 4,
        title: 'Bước 4: Lựa chọn phương án tối ưu và tổ chức thực hiện tác động sư phạm',
        content:
          'Triển khai quy trình 5 bước Sân khấu tương tác (Giáo trình tr. 93–95): (Bước 1) Chuẩn bị kịch bản ngắn về một học sinh bị chế ảnh trêu chọc trên mạng; (Bước 2) Tập luyện diễn xuất với đội kịch nòng cốt; (Bước 3) Biểu diễn phần mở đầu đến nút thắt xung đột thì dừng lại; (Bước 4) Mời học sinh dưới sân trường lên sân khấu nhập vai người bạn tháo gỡ nút thắt; (Bước 5) Chuyên gia tổng kết thông điệp ứng xử văn minh không gian mạng.',
      },
      {
        step: 5,
        title: 'Bước 5: Đánh giá kết quả, theo dõi hỗ trợ và rút kinh nghiệm sư phạm',
        content:
          'Chuyển giao nhiệm vụ tiếp nối về cho tiết Sinh hoạt lớp cuối tuần để từng lớp thảo luận sâu và ký cam kết "Lớp học không bạo lực mạng".',
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
      lessonCode: 'EDUC2802-C5-L2',
      clos: ['CLO8', 'CLO9'],
      textbookPages: 'Giáo trình Giáo dục học HCMUE (Trang 88 – 110)',
      legalRefs: [
        'Thông tư 32/2018/TT-BGDĐT (Phương thức và Loại hình tổ chức HĐTN, HN)',
        'Tài liệu Phương thức tổ chức HĐTN ở trường phổ thông (Bộ GD&ĐT)',
      ],
      sessionNote: 'Mục 5.3 · Trang 88 – 110',
    }),

    // PHẦN I: 4 NHÓM PHƯƠNG THỨC VÀ QUY TRÌNH CÁC PHƯƠNG PHÁP (TRANG 88 – 107)
    createElement(
      'section',
      { id: '1-bon-nhom-phuong-thuc-va-quy-trinh', className: 'space-y-4' },
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
          '1. Hệ thống 4 Nhóm Phương thức Tổ chức Hoạt động Trải nghiệm & Quy trình Chi tiết (Trang 88 – 107)',
        ),
      ),
      createElement(
        'div',
        { className: 'space-y-3 text-sm text-[#29383D]' },
        createElement(
          'p',
          null,
          'Theo ',
          createElement('strong', null, 'Giáo trình Giáo dục học HCMUE (tr. 88–107)'),
          ', hoạt động trải nghiệm, hướng nghiệp được phân chia thành ',
          createElement('strong', { className: 'text-[#3F6570]' }, '4 nhóm phương thức chủ đạo'),
          ' kèm theo quy trình số bước được chuẩn hóa rất chặt chẽ:',
          createElement(
            Sidenote,
            {
              number: 1,
              type: 'pedagogy',
              title: 'Ghi nhớ số bước quy trình chuẩn',
            },
            'Tham quan (3 bước); Lao động công ích (4 bước); Sân khấu tương tác (5 bước); Tình nguyện (5 bước); Dự án (5 bước); Nghiên cứu khoa học (8 bước).',
          ),
        ),
      ),
      createElement(NumberedProcessFlow, {
        title: 'Hệ thống 4 Nhóm Phương thức Tổ chức Hoạt động Trải nghiệm',
        subtitle:
          'Bốn phương thức chuyển hóa từ tri giác thực địa, tương tác nghệ thuật, hành động cống hiến đến nghiên cứu khoa học.',
        badge: '4 Nhóm Phương thức HĐTN',
        columns: 2,
        steps: [
          {
            number: 1,
            title: 'Nhóm 1: Hình thức Thể nghiệm, tương tác (Tr. 91–96)',
            badge: 'Tương tác & Nghệ thuật',
            description:
              'Tạo cơ hội cho học sinh giao lưu, thể nghiệm và đối thoại. Gồm: Tọa đàm/Hội thảo (4 bước: Lập kế hoạch -> Chuẩn bị -> Thảo luận -> Kết thúc); Diễn đàn/Giao lưu (4 bước: Lập kế hoạch -> Chuẩn bị -> Thực hiện tương tác -> Tổng kết); Trò chơi (3 bước: Chuẩn bị -> Tiến hành -> Kết thúc); Sân khấu tương tác (5 bước kinh điển).',
            keyAction: 'Khuyến khích học sinh đối thoại, nhập vai và thể hiện chính kiến.',
            deliverable: 'Kỹ năng giao tiếp, giải quyết vấn đề và làm chủ cảm xúc.',
          },
          {
            number: 2,
            title: 'Nhóm 2: Hình thức Khám phá (Tr. 88–91)',
            badge: 'Thực địa & Trực quan',
            description:
              'Tổ chức cho học sinh tiếp xúc trực tiếp với tự nhiên và đời sống thực tiễn. Phương pháp điển hình là Tham quan thực địa theo Quy trình 3 bước: Bước 1: Chuẩn bị (tiền trạm địa bàn, xin phép pháp lý, phổ biến nội quy) -> Bước 2: Tiến hành tham quan (quan sát, thu thập dữ liệu) -> Bước 3: Tổng kết (viết bài thu hoạch, triển lãm sản phẩm).',
            keyAction: 'Khảo sát thực địa, thu thập thông tin và trải nghiệm thế giới tự nhiên.',
            deliverable: 'Báo cáo thu hoạch thực địa và sản phẩm hình ảnh/tư liệu.',
          },
          {
            number: 3,
            title: 'Nhóm 3: Hình thức Cống hiến (Tr. 96–101)',
            badge: 'Tình nguyện & Lao động',
            description:
              'Tạo ra giá trị thực tế cho xã hội qua sự đóng góp của học sinh. Gồm: Hoạt động tình nguyện (5 bước: Khảo sát địa bàn -> Lập kế hoạch -> Huy động nguồn lực -> Triển khai -> Đánh giá); Lao động công ích (4 bước: Xác định nhiệm vụ -> Chuẩn bị dụng cụ bảo hộ -> Thực hiện an toàn -> Tổng kết giá trị lao động).',
            keyAction: 'Trực tiếp lao động, cống hiến vì lợi ích cộng đồng xã hội.',
            deliverable: 'Phẩm chất nhân ái, chăm chỉ và trách nhiệm công dân.',
          },
          {
            number: 4,
            title: 'Nhóm 4: Hình thức Nghiên cứu (Tr. 101–107)',
            badge: 'NCKH & Dự án',
            description:
              'Gồm: Nghiên cứu khoa học học sinh theo Quy trình 8 bước (Chọn đề tài -> Xây dựng đề cương -> Lập kế hoạch -> Xử lý lý luận -> Khảo sát thực tiễn -> Đề xuất giải pháp -> Viết báo cáo -> Nghiệm thu); Phương pháp Dự án theo Quy trình 5 bước (Chọn chủ đề -> Lập kế hoạch -> Thực hiện -> Báo cáo sản phẩm -> Đánh giá dự án).',
            keyAction: 'Nghiên cứu khoa học và thực hiện dự án thực tế liên môn.',
            deliverable: 'Sản phẩm khoa học, mô hình sáng tạo và báo cáo nghiên cứu.',
          },
        ],
      }),
      createElement(ComparativeTable, {
        title:
          'Bảng Tổng hợp Quy trình Chi tiết các Phương pháp Trải nghiệm Trọng tâm (Trang 88 – 107)',
        subtitle:
          'Hệ thống hóa số bước và nội dung từng bước của các phương pháp phục vụ trực tiếp kỳ thi học phần Giáo dục học.',
        badge: 'Quy trình Chuẩn Giáo trình',
        columns: [
          { key: 'method', header: 'Tên phương pháp tổ chức', widthClass: 'w-1/4' },
          { key: 'group', header: 'Thuộc nhóm phương thức', widthClass: 'w-1/4' },
          { key: 'procedure', header: 'Quy trình thực hiện chi tiết chuẩn mực' },
        ],
        rows: [
          {
            method: '1. Sân khấu tương tác (5 bước)',
            group: 'Thể nghiệm, tương tác',
            procedure:
              'Bước 1: Chuẩn bị kịch bản có nút thắt xung đột -> Bước 2: Tập luyện diễn xuất -> Bước 3: Biểu diễn phần mở đầu đến cao trào thì dừng lại -> Bước 4: Tương tác khán giả (mời học sinh lên sân khấu nhập vai giải quyết) -> Bước 5: Tổng kết thông điệp giáo dục.',
          },
          {
            method: '2. Tọa đàm & Diễn đàn (4 bước)',
            group: 'Thể nghiệm, tương tác',
            procedure:
              'Bước 1: Lập kế hoạch (xác định chủ đề, mục tiêu, khách mời) -> Bước 2: Chuẩn bị nội dung, tham luận -> Bước 3: Tiến hành thảo luận, tranh biện đa chiều -> Bước 4: Đúc kết thông điệp và lập biên bản hành động.',
          },
          {
            method: '3. Tham quan thực địa (3 bước)',
            group: 'Khám phá',
            procedure:
              'Bước 1: Chuẩn bị (tiền trạm địa bàn, pháp lý, kế hoạch an toàn, phổ biến nội quy) -> Bước 2: Tiến hành tham quan (hướng dẫn quan sát, thu thập dữ liệu) -> Bước 3: Tổng kết (viết bài thu hoạch, trưng bày sản phẩm).',
          },
          {
            method: '4. Hoạt động Tình nguyện (5 bước)',
            group: 'Cống hiến',
            procedure:
              'Bước 1: Khảo sát địa bàn và nhu cầu đối tượng -> Bước 2: Lập kế hoạch chi tiết -> Bước 3: Huy động nguồn lực xã hội -> Bước 4: Triển khai thực tế an toàn -> Bước 5: Đánh giá, tổng kết và rút kinh nghiệm.',
          },
          {
            method: '5. Lao động công ích (4 bước)',
            group: 'Cống hiến',
            procedure:
              'Bước 1: Xác định địa điểm và nội dung vừa sức -> Bước 2: Chuẩn bị dụng cụ bảo hộ an toàn -> Bước 3: Hướng dẫn thực hiện kỷ luật -> Bước 4: Nghiệm thu và tổng kết đúc kết giá trị lao động.',
          },
          {
            method: '6. Nghiên cứu khoa học (8 bước)',
            group: 'Nghiên cứu',
            procedure:
              'Bước 1: Chọn đề tài -> Bước 2: Xây dựng đề cương -> Bước 3: Lập kế hoạch -> Bước 4: Xử lý lý luận -> Bước 5: Khảo sát thực tiễn -> Bước 6: Đề xuất can thiệp -> Bước 7: Viết báo cáo -> Bước 8: Nghiệm thu công bố.',
          },
        ],
        footerNote: 'Nguồn: Giáo trình Giáo dục học HCMUE (Mục 5.3, Trang 88 – 107).',
      }),
    ),

    // PHẦN II: 4 LOẠI HÌNH TỔ CHỨC HOẠT ĐỘNG TRẢI NGHIỆM (TRANG 108 – 110)
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
          '2. Bốn Loại hình Tổ chức Hoạt động Trải nghiệm ở Trường Phổ thông (Trang 108 – 110)',
        ),
      ),
      createElement(ComparativeTable, {
        title:
          'Bảng Ma trận 4 Loại hình Tổ chức Hoạt động Trải nghiệm theo Thông tư 32/2018 (Trang 108 – 110)',
        subtitle:
          'Ba loại hình bắt buộc định kỳ hàng tuần/tháng và một loại hình tự chọn phát triển năng khiếu.',
        badge: '4 Loại hình HĐTN',
        columns: [
          { key: 'form', header: 'Loại hình tổ chức', widthClass: 'w-1/4' },
          { key: 'scale', header: 'Tính chất & Quy mô thực hiện', widthClass: 'w-1/4' },
          { key: 'structure', header: 'Cấu trúc nội dung và Yêu cầu sư phạm' },
        ],
        rows: [
          {
            form: '1. Sinh hoạt dưới cờ',
            scale: 'Bắt buộc (1 tiết/tuần) · Quy mô toàn trường hoặc khối',
            structure:
              'Tích hợp nghi lễ chào cờ trang nghiêm và hoạt động giáo dục theo chủ đề; mở đầu chuỗi hoạt động tuần/tháng bằng các hình thức sân khấu hóa, diễn đàn truyền thông.',
          },
          {
            form: '2. Sinh hoạt lớp',
            scale: 'Bắt buộc (1 tiết/tuần) · Quy mô từng lớp học',
            structure:
              'Cấu trúc 2 phần: Phần 1 - Hành chính sơ kết tuần do Ban cán sự tự quản điều hành; Phần 2 - Sinh hoạt trải nghiệm theo chủ đề giáo dục do GVCN cố vấn, học sinh tự quản.',
          },
          {
            form: '3. Hoạt động giáo dục theo chủ đề',
            scale: 'Bắt buộc · Quy mô lớp, khối lớp hoặc toàn trường',
            structure:
              'Hoạt động thường xuyên: Xếp trong thời khóa biểu lớp (3 - 4 tuần/chủ đề); Hoạt động định kỳ: Quy mô khối/trường (1 - 2 lần/học kỳ, như tham quan, dã ngoại, hội trại).',
          },
          {
            form: '4. Hoạt động Câu lạc bộ (CLB)',
            scale: 'Tự chọn (Ngoài giờ chính khóa) · Nhóm sở thích',
            structure:
              'Tổ chức theo nguyên tắc tự nguyện (CLB Nghiên cứu khoa học, CLB Robot, CLB Truyền thông, CLB Nghệ thuật) nhằm phát triển sâu sở thích, năng khiếu và định hướng nghề nghiệp.',
          },
        ],
        footerNote: 'Nguồn: Thông tư 32/2018/TT-BGDĐT & Giáo trình HCMUE Trang 108 – 110.',
      }),
      createElement(LegalReferenceBox, {
        documentTitle: 'Thông tư 32/2018/TT-BGDĐT & Mô đun 2 Hoạt động trải nghiệm, hướng nghiệp',
        article: 'Cơ chế phối hợp nhịp nhàng giữa 4 loại hình tổ chức',
        quote:
          'Ba loại hình bắt buộc (Sinh hoạt dưới cờ, Hoạt động giáo dục theo chủ đề, Sinh hoạt lớp) được liên kết thành chu trình khép kín hàng tuần: Phát động chủ đề ở giờ Chào cờ đầu tuần -> Khám phá, rèn luyện chuyên sâu ở tiết Chủ đề giữa tuần -> Phản hồi, đúc kết và tự đánh giá ở tiết Sinh hoạt lớp cuối tuần.',
        pedagogicalAnalysis:
          'Giáo viên chủ nhiệm và tổ chuyên môn cần lập kế hoạch liên thông cả 3 loại hình này để các tác động giáo dục không bị rời rạc, chắp vá.',
      }),
    ),

    // PHẦN III: KHUNG TÌNH HUỐNG THỰC HÀNH 5 BƯỚC (CASE STUDY 502)
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
          '3. Tình huống Thực hành 5 Bước: Đổi mới Sinh hoạt Dưới Cờ bằng Sân khấu Tương tác',
        ),
      ),
      createElement(CaseStudyBox, { caseStudy: caseStudy5_2, defaultOpenSolution: false }),
    ),
  );
};

// ============================================================================
// 3. COMPONENT BÀI 5.3: ĐÁNH GIÁ, ĐIỀU KIỆN TỔ CHỨC VÀ QUY TRÌNH THIẾT KẾ KẾ HOẠCH CHỦ ĐỀ HĐTN (TR. 110–124)
// ============================================================================

export const Lesson5_3View: FC = () => {
  const caseStudy5_3: PedagogicalCaseStudy = {
    id: 503,
    title:
      'Đánh giá kết quả Hoạt động trải nghiệm, hướng nghiệp và thiết kế chủ đề theo tiến trình chuẩn',
    context:
      'Cuối học kỳ I, khi thực hiện đánh giá kết quả Hoạt động trải nghiệm, hướng nghiệp cho học sinh lớp 10, một giáo viên chỉ dùng một bài kiểm tra viết trên giấy trong 45 phút để xếp loại "Đạt" hoặc "Chưa đạt", hoàn toàn bỏ qua quá trình tham gia hoạt động của học sinh trong suốt học kỳ cũng như không thu thập ý kiến tự đánh giá, đánh giá đồng đẳng và phản hồi từ gia đình.',
    question:
      'Vận dụng lý luận về 6 phương pháp đánh giá kết quả HĐTN và quy trình thiết kế chủ đề HĐTN (Giáo trình Giáo dục học HCMUE tr. 110–124; Thông tư 22/2021/TT-BGDĐT), anh/chị hãy xử lí tình huống theo quy trình 5 bước chuẩn mực.',
    principlesApplied: [
      'Mục đích, nội dung và 6 phương pháp đánh giá kết quả HĐTN, HN (Giáo trình tr. 110–114)',
      'Thông tư 22/2021/TT-BGDĐT (Đánh giá bằng nhận xét Đạt/Chưa đạt kết hợp đánh giá thường xuyên và định kỳ)',
      'Quy trình thiết kế kế hoạch chủ đề HĐTN theo Công văn 5512 (Giáo trình tr. 116–124)',
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
          'Phương án 1: Giữ nguyên kết quả bài kiểm tra giấy để kịp tiến độ vào điểm. Phương án tối ưu: Kết hợp bài thu hoạch với việc rà soát hồ sơ sản phẩm hoạt động cả học kỳ, phiếu tự đánh giá và đánh giá đồng đẳng của tổ học tập.',
      },
      {
        step: 4,
        title: 'Bước 4: Lựa chọn phương án tối ưu và tổ chức thực hiện tác động sư phạm',
        content:
          'Áp dụng phương án đổi mới: Sử dụng Bảng kiểm (Checklist) và Thang đo (Rubric) để đánh giá dựa trên minh chứng thực tế: (1) Mức độ tham gia các chủ đề tháng; (2) Sản phẩm dự án/hồ sơ học tập; (3) Kết quả tự đánh giá của cá nhân và nhận xét của nhóm bạn.',
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
      lessonCode: 'EDUC2802-C5-L3',
      clos: ['CLO8', 'CLO9'],
      textbookPages: 'Giáo trình Giáo dục học HCMUE (Trang 110 – 124)',
      legalRefs: [
        'Thông tư 27/2020/TT-BGDĐT & Thông tư 22/2021/TT-BGDĐT (Đánh giá học sinh)',
        'Công văn 5512/BGDĐT-GDTrH (Xây dựng kế hoạch bài dạy và kế hoạch giáo dục)',
        'Tài liệu bồi dưỡng Mô đun 2 THCS & THPT (Bộ GD&ĐT)',
      ],
      sessionNote: 'Mục 5.4 – 5.6 · Trang 110 – 124',
    }),

    // PHẦN I: 6 PHƯƠNG PHÁP ĐÁNH GIÁ KẾT QUẢ HOẠT ĐỘNG TRẢI NGHIỆM (TRANG 110 – 114)
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
          '1. Phương pháp Đánh giá Kết quả Hoạt động Trải nghiệm theo Tiếp cận Năng lực (Trang 110 – 114)',
        ),
      ),
      createElement(
        'div',
        { className: 'space-y-3 text-sm text-[#29383D]' },
        createElement(
          'p',
          null,
          createElement('strong', { className: 'text-[#3F6570]' }, 'Nguyên tắc đánh giá: '),
          'Đánh giá kết quả Hoạt động trải nghiệm, hướng nghiệp kết hợp chặt chẽ giữa ',
          createElement('strong', null, 'đánh giá thường xuyên (quá trình)'),
          ' và ',
          createElement('strong', null, 'đánh giá định kỳ (tổng kết)'),
          '; kết hợp đánh giá của giáo viên với sự tự đánh giá của học sinh, đánh giá đồng đẳng trong nhóm và phản hồi từ cha mẹ học sinh, cộng đồng.',
        ),
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
          'Bảng Lưới 6 Phương pháp Đánh giá Năng lực trong Hoạt động Trải nghiệm (Trang 111 – 114)',
        subtitle:
          'Hệ thống công cụ và minh chứng thực chứng giúp lượng hóa sự tiến bộ của từng học sinh.',
        badge: '6 Phương pháp Đánh giá',
        columns: [
          { key: 'method', header: 'Phương pháp đánh giá', widthClass: 'w-1/4' },
          { key: 'essence', header: 'Bản chất và Cách thức tiến hành', widthClass: 'w-3/8' },
          { key: 'tools', header: 'Công cụ và Minh chứng thu thập' },
        ],
        rows: [
          {
            method: '1. Phương pháp Trắc nghiệm',
            essence:
              'Đo lường mức độ nhận thức, hiểu biết của học sinh về bản thân, các chuẩn mực hành vi, giá trị sống và thế giới nghề nghiệp.',
            tools:
              'Bảng hỏi KWLH, phiếu trắc nghiệm nhận thức, bài kiểm tra nhanh về sở thích và hứng thú nghề nghiệp.',
          },
          {
            method: '2. Phương pháp Quan sát',
            essence:
              'Giáo viên, ban cán sự hoặc phụ huynh theo dõi trực tiếp thái độ, kỹ năng hợp tác, sự chủ động và khả năng xử lý tình huống của học sinh.',
            tools:
              'Ghi chép sự kiện thường nhật (Anecdotal records), bảng kiểm hành vi (Checklist), thang đo mức độ tham gia (Rating scale).',
          },
          {
            method: '3. Khảo sát phản hồi',
            essence:
              'Thu thập thông tin phản ánh cảm xúc, mức độ hài lòng, hứng thú và sự tự nhận thức về sự tiến bộ của bản thân sau mỗi hoạt động.',
            tools:
              'Phiếu khảo sát cảm xúc, phiếu thu thập ý kiến sau chủ đề, phiếu lấy ý kiến đóng góp của cha mẹ học sinh.',
          },
          {
            method: '4. Đánh giá sản phẩm',
            essence:
              'Đánh giá chất lượng và giá trị thực tế của các sản phẩm vật chất hoặc sản phẩm số do cá nhân/nhóm học sinh sáng tạo trong quá trình trải nghiệm.',
            tools:
              'Tiêu chí Rubric đánh giá video, bài thuyết trình, mô hình STEM, poster, tập san, ấn phẩm truyền thông học đường.',
          },
          {
            method: '5. Đánh giá hồ sơ hoạt động (Portfolio)',
            essence:
              'Tập hợp có hệ thống các minh chứng phản ánh toàn bộ tiến trình nỗ lực, rèn luyện và tiến bộ của học sinh trong suốt học kỳ/năm học.',
            tools:
              'Tuyển tập hồ sơ học tập (Portfolio), nhật ký trải nghiệm cá nhân, các bài thu hoạch tự chiêm nghiệm, minh chứng dự án.',
          },
          {
            method: '6. Trao đổi ý kiến bên liên quan',
            essence:
              'Phỏng vấn, trao đổi trực tiếp hoặc gián tiếp với các lực lượng phối hợp giáo dục để có góc nhìn đa chiều về học sinh.',
            tools:
              'Phiếu phỏng vấn bán cấu trúc, biên bản trao đổi với phụ huynh học sinh, ban giám hiệu và đại diện cơ sở sản xuất/cộng đồng.',
          },
        ],
        footerNote: 'Nguồn: Giáo trình Giáo dục học HCMUE (Mục 5.4, Trang 111 – 114).',
      }),
    ),

    // PHẦN II: 3 NHÓM ĐIỀU KIỆN TỔ CHỨC HOẠT ĐỘNG TRẢI NGHIỆM (TRANG 114 – 116)
    createElement(
      'section',
      { id: '2-ba-nhom-dieu-kien-to-chuc', className: 'space-y-4' },
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
          '2. Ba Nhóm Điều kiện Bảo đảm Tổ chức Hoạt động Trải nghiệm Thành công (Trang 114 – 116)',
        ),
      ),
      createElement(NumberedProcessFlow, {
        title: '3 Nhóm Điều kiện Bảo đảm Thực thi Chương trình Hoạt động Trải nghiệm',
        subtitle:
          'Ba yếu tố nền tảng quyết định tính khả thi và chất lượng sư phạm của hoạt động (Giáo trình HCMUE tr. 114–116).',
        badge: '3 Nhóm Điều kiện',
        columns: 3,
        steps: [
          {
            number: 1,
            title: '1. Năng lực đội ngũ quản lý và giáo viên',
            badge: 'Nhân lực Sư phạm',
            description:
              'Hiệu trưởng chỉ đạo xây dựng kế hoạch giáo dục tổng thể; giáo viên có năng lực thiết kế, dẫn dắt và tâm thế sẵn sàng đổi mới; bồi dưỡng, tập huấn nghiệp vụ thường xuyên cho GVCN và GV bộ môn.',
            keyAction: 'Bồi dưỡng năng lực thiết kế chủ đề và phương pháp dẫn dắt trải nghiệm.',
            deliverable: 'Đội ngũ giáo viên tự tin làm chủ phương thức giáo dục qua trải nghiệm.',
          },
          {
            number: 2,
            title: '2. Cơ sở vật chất và tài chính',
            badge: 'Cơ sở Vật chất & Tài chính',
            description:
              'Phòng học đa chức năng, sân bãi thể thao, trang thiết bị công nghệ, hạ tầng Internet; dự trù ngân sách khả thi, khai thác linh hoạt và an toàn các nguồn lực xã hội hóa tại địa phương.',
            keyAction: 'Quy hoạch không gian trải nghiệm trong trường và dự trù ngân sách hợp lý.',
            deliverable: 'Cơ sở vật chất đầy đủ, an toàn và học liệu phong phú cho học sinh.',
          },
          {
            number: 3,
            title: '3. Sự đồng thuận và phối hợp xã hội',
            badge: 'Phối hợp Xã hội',
            description:
              'Tham mưu cấp ủy, chính quyền địa phương; liên kết chặt chẽ với cha mẹ học sinh và các tổ chức đoàn thể xã hội, doanh nghiệp để tạo môi trường trải nghiệm thực tế rộng mở cho học sinh.',
            keyAction: 'Ký kết phối hợp với các cơ sở thực địa và hội cha mẹ học sinh.',
            deliverable: 'Mạng lưới đối tác hỗ trợ địa bàn trải nghiệm phong phú, tin cậy.',
          },
        ],
      }),
    ),

    // PHẦN III: QUY TRÌNH THIẾT KẾ KẾ HOẠCH CHỦ ĐỀ HĐTN CHUẨN CÔNG VĂN 5512 (TRANG 116 – 124)
    createElement(
      'section',
      { id: '3-quy-trinh-thiet-ke-chu-de-5512', className: 'space-y-4' },
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
          '3. Quy trình Thiết kế Kế hoạch Chủ đề Hoạt động Trải nghiệm theo Công văn 5512 (Trang 116 – 124)',
        ),
      ),
      createElement(NumberedProcessFlow, {
        title:
          'Quy trình Thiết kế Kế hoạch Chủ đề Hoạt động Trải nghiệm Chuẩn mực (Mô hình 4 Hoạt động)',
        subtitle:
          'Khung thiết kế theo Công văn 5512/BGDĐT-GDTrH và Giáo trình HCMUE (tr. 116–124) phục vụ trực tiếp Bài Thực hành 3.',
        badge: 'Khung Thiết kế CV 5512',
        columns: 2,
        steps: [
          {
            number: 1,
            title: 'Bước 1: Xác định tên chủ đề, mục tiêu và thời lượng thực hiện',
            badge: 'Mục tiêu & Thời lượng',
            description:
              'Căn cứ mạch nội dung chương trình để chọn tên chủ đề ngắn gọn, hấp dẫn. Xác định rõ mục tiêu cần đạt gồm 3 nhóm: (a) Phẩm chất chủ yếu; (b) Năng lực chung; (c) Năng lực đặc thù HĐTN (được lượng hóa bằng động từ hành động).',
            keyAction: 'Xác định yêu cầu cần đạt theo chuẩn và phân bổ số tiết hợp lý.',
            deliverable: 'Mục tiêu chủ đề đo lường được và định danh chủ đề rõ ràng.',
          },
          {
            number: 2,
            title: 'Bước 2: Chuẩn bị thiết bị dạy học và học liệu',
            badge: 'Chuẩn bị GV & HS',
            description:
              'Liệt kê chi tiết sự chuẩn bị của Giáo viên (kịch bản tổ chức, video tư liệu, phiếu học tập, phiếu đánh giá, phương án an toàn) và của Học sinh (dụng cụ học tập, bài trình chiếu, tư liệu điều tra thực tế).',
            keyAction: 'Bảo đảm đầy đủ công cụ và tâm thế cho cả thầy và trò.',
            deliverable: 'Bộ tài liệu học tập, phiếu hướng dẫn và thiết bị cần thiết.',
          },
          {
            number: 3,
            title: 'Bước 3: Tiến trình tổ chức hoạt động trải nghiệm (4 Hoạt động sư phạm)',
            badge: 'Tiến trình 4 Hoạt động',
            description:
              'Thiết kế theo chu trình học qua trải nghiệm: Hoạt động 1: Khởi động / Khám phá (khơi gợi kinh nghiệm sẵn có, tạo tâm thế); Hoạt động 2: Kết nối / Trải nghiệm thực tế (thao tác trực tiếp, tiếp cận tri thức mới); Hoạt động 3: Phân tích / Suy ngẫm - Luyện tập (xử lý tình huống, phản hồi cảm xúc, đúc kết bài học); Hoạt động 4: Vận dụng / Mở rộng (ứng dụng giải quyết vấn đề thực tế gia đình và xã hội).',
            keyAction: 'Mỗi hoạt động nêu rõ: Mục tiêu, Nội dung, Sản phẩm và Cách thức tổ chức.',
            deliverable: 'Kịch bản sư phạm sống động, khơi dậy tối đa tính chủ động của học sinh.',
          },
          {
            number: 4,
            title: 'Bước 4: Hồ sơ dạy học & Tiêu chí kiểm tra, đánh giá kết quả chủ đề',
            badge: 'Đánh giá & Hồ sơ',
            description:
              'Xây dựng các công cụ đánh giá đi kèm chủ đề: Bảng kiểm (Checklist), Thang đo Rubric đánh giá sản phẩm, Phiếu tự đánh giá của học sinh và Phiếu đánh giá đồng đẳng trong nhóm; hướng dẫn học sinh lưu hồ sơ học tập.',
            keyAction: 'Thiết kế Rubric đánh giá bám sát mục tiêu cần đạt của chủ đề.',
            deliverable: 'Hệ thống công cụ đánh giá minh bạch, khách quan và khoa học.',
          },
        ],
      }),
    ),

    // PHẦN IV: TÀI LIỆU THAM KHẢO CHƯƠNG 5 (LIÊN KẾT DRIVE LEARNING UNIVERSE)
    createElement(
      'section',
      { id: '4-tai-lieu-tham-khao-chuong-5', className: 'space-y-4' },
      createElement(
        'div',
        {
          className:
            'flex items-center gap-2 border-b border-[#CFDADB] pb-2 font-serif text-xl font-bold text-[#29383D]',
        },
        createElement(FileText, { className: 'h-5 w-5 text-[#3F6570]' }),
        createElement('h3', null, '4. Tài liệu Tham khảo & Học liệu Số Chương 5 (Google Drive)'),
      ),
      createElement(
        'div',
        { className: 'grid grid-cols-1 md:grid-cols-3 gap-3 pt-1' },
        [
          {
            index: '1',
            title: 'Giáo trình Giáo dục học HCMUE (Chương 5, Tr. 83–124)',
            description: 'Tài liệu lý luận nền tảng chính thức của Trường ĐH Sư phạm TP.HCM.',
            url: 'https://drive.google.com/file/d/1Jc3J6XZd7HKHOCsJu9w6C84FIsCNS3iM/view?usp=drive_link',
            badge: 'HCMUE Official',
          },
          {
            index: '2',
            title: 'Tài liệu bồi dưỡng giáo viên cốt cán Mô đun 2 THCS',
            description: '11.HDTN_tai-lieu-THCS_9.10.20.20-24h.pdf (Bộ Giáo dục và Đào tạo).',
            url: GOOGLE_DRIVE_DOCS_URL,
            badge: 'Mô đun 2 THCS',
          },
          {
            index: '3',
            title: 'Tài liệu bồi dưỡng giáo viên cốt cán Mô đun 2 THPT',
            description: '12.HDTN_tai-lieu-THPT_9.10.20-24h.pdf (Bộ Giáo dục và Đào tạo).',
            url: GOOGLE_DRIVE_DOCS_URL,
            badge: 'Mô đun 2 THPT',
          },
        ].map((doc) =>
          createElement(
            'a',
            {
              key: doc.index,
              href: doc.url,
              target: '_blank',
              rel: 'noopener noreferrer',
              className:
                'group flex flex-col justify-between rounded-xl border border-[#CFDADB] bg-[#F7FAFA] p-4 transition-all hover:border-[#3F6570] hover:shadow-xs',
            },
            createElement(
              'div',
              { className: 'space-y-2' },
              createElement(
                'div',
                { className: 'flex items-center justify-between gap-2' },
                createElement(
                  'span',
                  {
                    className:
                      'rounded-md border border-[#CFDADB] bg-[#E1E9EA]/60 px-2 py-0.5 font-mono text-[11px] font-bold text-[#3F6570]',
                  },
                  doc.badge,
                ),
                createElement(ExternalLink, {
                  className:
                    'h-4 w-4 text-[#718C7E] transition-transform group-hover:translate-x-0.5',
                }),
              ),
              createElement(
                'h4',
                {
                  className:
                    'font-serif text-sm font-bold text-[#29383D] group-hover:text-[#3F6570]',
                },
                `[${doc.index}] ${doc.title}`,
              ),
              createElement(
                'p',
                { className: 'text-xs text-[#55676B] leading-relaxed' },
                doc.description,
              ),
            ),
            createElement(
              'span',
              {
                className:
                  'mt-3 inline-flex items-center gap-1 text-[11px] font-semibold text-[#3F6570] underline-offset-2 group-hover:underline',
              },
              'Mở tài liệu trên Google Drive',
            ),
          ),
        ),
      ),
    ),

    // PHẦN V: KHUNG TÌNH HUỐNG THỰC HÀNH 5 BƯỚC (CASE STUDY 503)
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
          '5. Tình huống Thực hành 5 Bước: Đổi mới Phương thức Đánh giá Năng lực HĐTN',
        ),
      ),
      createElement(CaseStudyBox, { caseStudy: caseStudy5_3, defaultOpenSolution: false }),
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
    lessonId === 'gdh-c5-b1-khai-niem-ban-chat-va-muc-tieu-hoat-dong-trai-nghiem' ||
    lessonId === 'educ2802-c5-l1' ||
    lessonId === 'ban-chat-muc-tieu-va-noi-dung-hoat-dong-trai-nghiem-o-truong-pho-thong'
  ) {
    return {
      default: Lesson5_1View,
      frontmatter: {
        title: 'Bài 5.1: Bản chất, mục tiêu và nội dung hoạt động trải nghiệm',
        description:
          'Bản chất của hoạt động trải nghiệm theo CT GDPT 2018, sự chuyển dịch từ "hoạt động giáo dục ngoài giờ lên lớp" sang hoạt động giáo dục bắt buộc, 3 nhóm năng lực đặc thù và cấu trúc 4 mạch nội dung cốt lõi từ Tiểu học đến THPT.',
        level: 'basic',
        tags: [
          'EDUC2802-C5-L1',
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
            id: '1-ban-chat-hoat-dong-trai-nghiem',
            text: '1. Khái niệm và Bản chất của Hoạt động Trải nghiệm ở Trường Phổ thông (Trang 83 – 84)',
            depth: 2,
          },
          {
            id: '2-muc-tieu-phat-trien-nang-luc',
            text: '2. Mục tiêu Phát triển Năng lực trong Hoạt động Trải nghiệm (Trang 84 – 85)',
            depth: 2,
          },
          {
            id: '3-ma-tran-4-mach-noi-dung',
            text: '3. Bảng Ma trận 4 Mạch Nội dung Hoạt động Trải nghiệm theo Cấp học (Trang 85 – 87)',
            depth: 2,
          },
          {
            id: '4-tinh-huong-thuc-hanh',
            text: '4. Tình huống Thực hành 5 Bước: Đổi mới Phương thức Giáo dục qua Trải nghiệm',
            depth: 2,
          },
        ],
        blocks: [],
      },
    };
  }

  if (
    lessonId === 'gdh-c5-b2-phuong-thuc-va-loai-hinh-to-chuc-hoat-dong-trai-nghiem' ||
    lessonId === 'gdh-c5-b2-noi-dung-va-phuong-thuc-to-chuc-hoat-dong-trai-nghiem' ||
    lessonId === 'educ2802-c5-l2' ||
    lessonId === 'phuong-thuc-va-loai-hinh-to-chuc-hoat-dong-trai-nghiem'
  ) {
    return {
      default: Lesson5_2View,
      frontmatter: {
        title: 'Bài 5.2: Phương thức và loại hình tổ chức hoạt động trải nghiệm',
        description:
          'Hệ thống hóa 4 nhóm phương thức tổ chức (Thể nghiệm - tương tác, Khám phá, Cống hiến, Nghiên cứu) kèm các quy trình tổ chức chuẩn hóa, phân tích 4 loại hình tổ chức bắt buộc và tự chọn trong trường phổ thông.',
        level: 'intermediate',
        tags: [
          'EDUC2802-C5-L2',
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
            id: '1-bon-nhom-phuong-thuc-va-quy-trinh',
            text: '1. Hệ thống 4 Nhóm Phương thức Tổ chức Hoạt động Trải nghiệm & Quy trình Chi tiết (Trang 88 – 107)',
            depth: 2,
          },
          {
            id: '2-bon-loai-hinh-to-chuc-hdtn',
            text: '2. Bốn Loại hình Tổ chức Hoạt động Trải nghiệm ở Trường Phổ thông (Trang 108 – 110)',
            depth: 2,
          },
          {
            id: '3-tinh-huong-thuc-hanh',
            text: '3. Tình huống Thực hành 5 Bước: Đổi mới Sinh hoạt Dưới Cờ bằng Sân khấu Tương tác',
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
    lessonId === 'gdh-c5-b4-danh-gia-ket-qua-hdtn-va-thuc-hanh-xay-dung-ke-hoach-rubric-a19' ||
    lessonId === 'educ2802-c5-l3' ||
    lessonId ===
      'danh-gia-ket-qua-dieu-kien-to-chuc-va-quy-trinh-thiet-ke-chu-de-hoat-dong-trai-nghiem'
  ) {
    return {
      default: Lesson5_3View,
      frontmatter: {
        title: 'Bài 5.3: Đánh giá, điều kiện tổ chức và quy trình thiết kế kế hoạch chủ đề HĐTN',
        description:
          'Hệ thống 6 phương pháp đánh giá kết quả trải nghiệm theo tiếp cận năng lực, 3 nhóm điều kiện bảo đảm tổ chức thành công và quy trình chuẩn mực thiết kế kế hoạch chủ đề Hoạt động trải nghiệm theo Công văn 5512.',
        level: 'advanced',
        tags: [
          'EDUC2802-C5-L3',
          'CLO8',
          'CLO9',
          '6 Phương pháp đánh giá HĐTN',
          'Quy trình thiết kế chủ đề',
          'Công văn 5512',
          'Giáo trình tr. 110-124',
        ],
      },
      lessonMeta: {
        chapterNumber: 5,
        lessonNumber: 3,
        headings: [
          {
            id: '1-sau-phuong-phap-danh-gia-hdtn',
            text: '1. Phương pháp Đánh giá Kết quả Hoạt động Trải nghiệm theo Tiếp cận Năng lực (Trang 110 – 114)',
            depth: 2,
          },
          {
            id: '2-ba-nhom-dieu-kien-to-chuc',
            text: '2. Ba Nhóm Điều kiện Bảo đảm Tổ chức Hoạt động Trải nghiệm Thành công (Trang 114 – 116)',
            depth: 2,
          },
          {
            id: '3-quy-trinh-thiet-ke-chu-de-5512',
            text: '3. Quy trình Thiết kế Kế hoạch Chủ đề Hoạt động Trải nghiệm theo Công văn 5512 (Trang 116 – 124)',
            depth: 2,
          },
          {
            id: '4-tai-lieu-tham-khao-chuong-5',
            text: '4. Tài liệu Tham khảo & Học liệu Số Chương 5 (Google Drive)',
            depth: 2,
          },
          {
            id: '5-tinh-huong-thuc-hanh',
            text: '5. Tình huống Thực hành 5 Bước: Đổi mới Phương thức Đánh giá Năng lực HĐTN',
            depth: 2,
          },
        ],
        blocks: [],
      },
    };
  }

  return null;
}
