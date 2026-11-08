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
import { BookOpen, Compass, HelpCircle, Layers, Scale, Sparkles, Target } from 'lucide-react';
import { createElement, type FC } from 'react';
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
      clos: ['CLO3', 'CLO4'],
      textbookPages: 'Tr. 32–39 (Chương 3, Mục 3.1)',
      legalRefs: [
        'Luật Giáo dục 2019 (Điều 6, 9, 28, 29)',
        'Quyết định 1981/QĐ-TTg',
        'Thông tư 32/2018/TT-BGDĐT (CT GDPT 2018)',
        'Điều lệ trường học 2020 (TT 28/2020 & TT 32/2020)',
      ],
      sessionNote: 'Lý thuyết & Thảo luận Chương 3',
    }),

    // PHẦN I: HỆ THỐNG GIÁO DỤC QUỐC DÂN & CHƯƠNG TRÌNH GDPT 2018 (TR. 32–36)
    createElement(
      'section',
      { id: '1-he-thong-gdqd-va-ctgdpt-2018', className: 'space-y-4' },
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
          '1. Hệ thống giáo dục quốc dân và Chương trình GDPT 2018 (Giáo trình HCMUE tr. 32–36)',
        ),
      ),
      createElement(
        'p',
        null,
        'Theo Điều 6 Luật Giáo dục 2019 và Quyết định số 1981/QĐ-TTg phê duyệt Khung cơ cấu hệ thống giáo dục quốc dân Việt Nam (Giáo trình HCMUE tr. 32–34), hệ thống giáo dục quốc dân là hệ thống giáo dục ',
        createElement('strong', null, 'mở, liên thông'),
        ' gồm giáo dục chính quy và giáo dục thường xuyên, được chia thành 4 cấp học và trình độ đào tạo: (1) Giáo dục mầm non; (2) Giáo dục phổ thông; (3) Giáo dục nghề nghiệp; (4) Giáo dục đại học.',
        createElement(
          Sidenote,
          { type: 'pedagogy', number: 1 },
          'Điểm cốt lõi của Chương trình GDPT 2018 (Thông tư 32/2018/TT-BGDĐT): Chuyển từ nền giáo dục nặng về truyền thụ kiến thức ("Học sinh biết được gì?") sang nền giáo dục phát triển toàn diện phẩm chất và năng lực ("Học sinh làm được gì từ những điều đã biết?").',
        ),
      ),
      createElement(LegalReferenceBox, {
        lawTitle: 'Luật Giáo dục 2019 & Quyết định 1981/QĐ-TTg',
        article: 'Điều 28. Cấp học và độ tuổi của giáo dục phổ thông',
        quote:
          'Các cấp học và độ tuổi của giáo dục phổ thông được quy định như sau: a) Giáo dục tiểu học được thực hiện trong 05 năm học, từ lớp một đến hết lớp năm (trẻ em vào học lớp một là 06 tuổi); b) Giáo dục trung học cơ sở được thực hiện trong 04 năm học, từ lớp sáu đến hết lớp chín (học sinh vào lớp sáu là 11 tuổi); c) Giáo dục trung học phổ thông được thực hiện trong 03 năm học, từ lớp mười đến hết lớp mười hai (học sinh vào lớp mười là 15 tuổi).',
        source: 'Luật Giáo dục số 43/2019/QH14 (Giáo trình HCMUE tr. 33–34)',
        significance:
          'Quy định khung thời gian 12 năm giáo dục phổ thông, chia thành 2 giai đoạn rõ rệt trong Chương trình GDPT 2018.',
      }),

      createElement(ComparativeTable, {
        title:
          'Bảng Đối sánh 2 Giai đoạn Giáo dục trong Chương trình GDPT 2018 (Thông tư 32/2018/TT-BGDĐT — Tr. 34–36)',
        subtitle:
          'Phân định mục tiêu, cấp học và định hướng nội dung giữa Giai đoạn giáo dục cơ bản và Giai đoạn giáo dục định hướng nghề nghiệp.',
        badge: 'CT GDPT 2018 · Thông tư 32/2018',
        columns: [
          { key: 'aspect', header: 'Tiêu chí đối sánh', widthClass: 'w-1/4' },
          { key: 'basicStage', header: 'Giai đoạn Giáo dục Cơ bản (9 năm)' },
          { key: 'careerStage', header: 'Giai đoạn Giáo dục Định hướng Nghề nghiệp (3 năm)' },
        ],
        rows: [
          {
            aspect: 'Cấp học bao gồm',
            basicStage: 'Cấp Tiểu học (Lớp 1 – Lớp 5) và Cấp Trung học cơ sở (Lớp 6 – Lớp 9).',
            careerStage: 'Cấp Trung học phổ thông (Lớp 10 – Lớp 12).',
          },
          {
            aspect: 'Mục tiêu trọng tâm',
            basicStage:
              'Bảo đảm trang bị cho học sinh tri thức phổ thông nền tảng, toàn diện; hình thành các phẩm chất chủ yếu và năng lực cốt lõi; chuẩn bị cho việc phân luồng sau THCS.',
            careerStage:
              'Giúp học sinh phát triển phẩm chất, năng lực đã hình thành ở giai đoạn cơ bản; hoàn thiện học vấn phổ thông và lựa chọn môn học, chuyên đề phù hợp định hướng nghề nghiệp.',
          },
          {
            aspect: 'Đặc trưng tích hợp & phân hóa',
            basicStage:
              'Tích hợp cao ở các lớp dưới (Tiểu học), phân hóa dần ở các lớp trên (THCS); lồng ghép nội dung hướng nghiệp để học sinh tự nhận thức bản thân.',
            careerStage:
              'Phân hóa sâu thông qua hệ thống các môn học bắt buộc (Toán, Ngữ văn, Ngoại ngữ 1, Lịch sử, GDTC, GDQP-AN), môn học lựa chọn và các cụm chuyên đề học tập.',
          },
        ],
        footerNote: 'Nguồn: Thông tư 32/2018/TT-BGDĐT và Giáo trình Giáo dục học HCMUE tr. 34–36.',
      }),
    ),

    // PHẦN II: CƠ CẤU TỔ CHỨC BỘ MÁY NHÀ TRƯỜNG PHỔ THÔNG THEO ĐIỀU LỆ 2020 (TR. 36–39)
    createElement(
      'section',
      { id: '2-co-cau-to-chuc-nha-truong', className: 'space-y-4' },
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
          '2. Cơ cấu tổ chức bộ máy nhà trường phổ thông theo Điều lệ trường học 2020 (Tr. 36–39)',
        ),
      ),
      createElement(
        'p',
        null,
        'Theo Điều lệ trường THCS, trường THPT và trường phổ thông có nhiều cấp học (Thông tư số 32/2020/TT-BGDĐT) và Điều lệ trường Tiểu học (Thông tư số 28/2020/TT-BGDĐT), bộ máy tổ chức của nhà trường phổ thông được vận hành đồng bộ giữa các thiết chế quản trị, chuyên môn và đoàn thể (Giáo trình HCMUE tr. 36–39):',
      ),
      createElement(NumberedProcessFlow, {
        title: 'Cấu trúc 6 Khối Thiết chế trong Bộ máy Tổ chức Nhà trường Phổ thông (Điều lệ 2020)',
        subtitle:
          'Hệ thống các thành phần tổ chức và chức năng điều hành trong nhà trường phổ thông (Giáo trình HCMUE tr. 36–39).',
        badge: 'Điều lệ Trường học 2020',
        columns: 2,
        steps: [
          {
            number: 1,
            title: 'Hội đồng trường (Quản trị nhà trường)',
            description:
              'Tổ chức quản trị nhà trường, thực hiện quyền đại diện sở hữu của nhà trường và các bên có lợi ích liên quan; quyết nghị về chiến lược, quy chế tổ chức và giám sát hoạt động của nhà trường.',
            keyAction:
              'Gồm Bí thư cấp ủy, Hiệu trưởng, Chủ tịch Công đoàn, Bí thư Đoàn, đại diện tổ chuyên môn và tổ văn phòng.',
          },
          {
            number: 2,
            title: 'Hiệu trưởng và các Phó Hiệu trưởng (Điều hành)',
            description:
              'Hiệu trưởng là người chịu trách nhiệm tổ chức, quản lí và điều hành toàn bộ các hoạt động và chất lượng giáo dục của nhà trường; Phó Hiệu trưởng giúp việc cho Hiệu trưởng.',
            keyAction: 'Nhiệm kỳ của Hiệu trưởng và Phó Hiệu trưởng là 05 năm.',
          },
          {
            number: 3,
            title: 'Các Hội đồng trong nhà trường',
            description:
              'Bao gồm: Hội đồng thi đua và khen thưởng; Hội đồng kỷ luật học sinh; Hội đồng tư vấn (do Hiệu trưởng thành lập khi cần thiết).',
            keyAction:
              'Đảm bảo tính dân chủ, khách quan và đúng quy chế trong khen thưởng, kỷ luật.',
          },
          {
            number: 4,
            title: 'Tổ chuyên môn và Tổ văn phòng',
            description:
              'Tổ chuyên môn gồm giáo viên, viên chức làm công tác thư viện, thiết bị, tư vấn học đường; sinh hoạt định kỳ ít nhất 01 lần/02 tuần để thực hiện kế hoạch giáo dục và nghiên cứu bài học.',
            keyAction:
              'Tổ chuyên môn là đơn vị trực tiếp quản lí chất lượng chuyên môn của giáo viên.',
          },
          {
            number: 5,
            title: 'Lớp học và Hệ thống tự quản học sinh',
            description:
              'Học sinh được tổ chức theo lớp học. Mỗi lớp có lớp trưởng, các lớp phó do tập thể học sinh bầu hoặc do GVCN chỉ định luân phiên; được chia thành các tổ học sinh.',
            keyAction:
              'Sĩ số chuẩn theo Điều lệ: Tiểu học không quá 35 HS/lớp; THCS và THPT không quá 45 HS/lớp.',
          },
          {
            number: 6,
            title: 'Tổ chức Đảng và các Đoàn thể xã hội',
            description:
              'Tổ chức Đảng Cộng sản Việt Nam lãnh đạo nhà trường; Công đoàn cơ sở, Đoàn TNCS Hồ Chí Minh, Đội TNTP Hồ Chí Minh và Ban đại diện cha mẹ học sinh phối hợp giáo dục toàn diện.',
            keyAction: 'Tạo sức mạnh tổng hợp của các lực lượng giáo dục trong nhà trường.',
          },
        ],
      }),
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
          '3. Tình huống Thực hành 5 Bước: Định hướng nghề nghiệp và chọn tổ hợp môn ở trường THPT',
        ),
      ),
      createElement(CaseStudyBox, { caseStudy: caseStudy3_1, defaultOpenSolution: false }),
    ),
  );
};

// ============================================================================
// 2. COMPONENT BÀI 3.2: BẢN CHẤT, ĐẶC ĐIỂM VÀ NGUYÊN TẮC CỦA HOẠT ĐỘNG GIÁO DỤC (TR. 39–47)
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
      clos: ['CLO4', 'CLO5'],
      textbookPages: 'Tr. 39–47 (Chương 3, Mục 3.2)',
      legalRefs: ['Giáo trình Giáo dục học HCMUE (Tr. 39–47)', 'Luật Giáo dục 2019 (Điều 3)'],
      sessionNote: 'Lý thuyết & Thảo luận Chương 3',
    }),

    // PHẦN I: BẢN CHẤT VÀ 4 ĐẶC ĐIỂM CỦA HOẠT ĐỘNG GIÁO DỤC (TR. 39–43)
    createElement(
      'section',
      { id: '1-ban-chat-va-4-dac-diem', className: 'space-y-4' },
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
          '1. Bản chất và 4 đặc điểm của hoạt động giáo dục ở nhà trường phổ thông (Tr. 39–43)',
        ),
      ),
      createElement(
        'p',
        null,
        'Trong Giáo dục học, khái niệm ',
        createElement('strong', null, 'hoạt động giáo dục (theo nghĩa hẹp)'),
        ' dùng để chỉ quá trình tác động có mục đích, có kế hoạch nhằm hình thành thế giới quan, lý tưởng, niềm tin, phẩm chất đạo đức, thái độ và các hành vi, thói quen ứng xử chuẩn mực cho học sinh (phân biệt nhưng thống chặt chẽ với quá trình dạy học).',
        createElement(
          Sidenote,
          { type: 'pedagogy', number: 1 },
          'Bản chất cốt lõi (Giáo trình HCMUE tr. 40): Hoạt động giáo dục là quá trình tổ chức cuộc sống, hoạt động và giao lưu đa dạng cho học sinh, dưới sự định hướng chủ đạo của nhà giáo dục nhằm chuyển hóa các yêu cầu, chuẩn mực xã hội thành phẩm chất và năng lực nhân cách thông qua quá trình tự giáo dục của học sinh.',
        ),
      ),
      createElement(ComparativeTable, {
        title:
          'Sự Thống nhất Biện chứng giữa Vai trò Chủ đạo của Giáo viên và Chủ thể Tự giáo dục của Học sinh (Tr. 40–41)',
        subtitle:
          'Quy luật động lực bên trong quyết định hiệu quả của mọi hoạt động giáo dục ở nhà trường phổ thông.',
        badge: 'Bản chất Hoạt động Giáo dục',
        columns: [
          { key: 'dimension', header: 'Phương diện phân tích', widthClass: 'w-1/4' },
          { key: 'teacherRole', header: 'Vai trò Chủ đạo của Nhà giáo dục (Giáo viên)' },
          {
            key: 'studentRole',
            header: 'Vai trò Chủ thể Tự giáo dục của Người được giáo dục (Học sinh)',
          },
        ],
        rows: [
          {
            dimension: 'Vị thế trong quá trình',
            teacherRole:
              'Thiết kế mục tiêu, lựa chọn nội dung, tổ chức môi trường hoạt động và định hướng giá trị chuẩn mực.',
            studentRole:
              'Trực tiếp tham gia hoạt động, trải nghiệm cảm xúc, lựa chọn giá trị và tự điều chỉnh hành vi của bản thân.',
          },
          {
            dimension: 'Cơ chế chuyển hóa nội tâm',
            teacherRole:
              'Đưa các chuẩn mực đạo đức, pháp luật, văn hóa xã hội từ bên ngoài đến với nhận thức của học sinh.',
            studentRole:
              'Nội tâm hóa các chuẩn mực xã hội thành niềm tin đạo đức, động cơ và thói quen hành vi bền vững.',
          },
          {
            dimension: 'Tiêu chí thành công',
            teacherRole:
              'Chuyển dần từ sự kiểm soát bên ngoài của giáo viên sang năng lực tự quản, tự kiểm soát của học sinh.',
            studentRole:
              'Hình thành năng lực tự nhận thức, tự đánh giá và tự rèn luyện suốt đời ("Giáo dục biến thành tự giáo dục").',
          },
        ],
      }),

      createElement(NumberedProcessFlow, {
        title: '4 Đặc điểm Đặc trưng của Hoạt động Giáo dục ở Nhà trường Phổ thông (Tr. 41–43)',
        subtitle:
          'Bốn tính chất đặc thù đòi hỏi người giáo viên phải kiên trì, đồng bộ và linh hoạt khi tổ chức giáo dục học sinh.',
        badge: '4 Đặc điểm Hoạt động Giáo dục',
        columns: 2,
        steps: [
          {
            number: 1,
            title: 'Diễn ra dưới những tác động phức hợp của nhiều lực lượng',
            description:
              'Học sinh cùng lúc chịu tác động từ nhà trường, gia đình, nhóm bạn bè, cộng đồng xã hội và truyền thông mạng xã hội (có cả tác động tích cực tự giác và tác động tiêu cực tự phát).',
            keyAction:
              'Nhà trường phải giữ vai trò chủ đạo để thống nhất các tác động tích cực và trung hòa, ngăn chặn các ảnh hưởng tiêu cực.',
          },
          {
            number: 2,
            title: 'Mang tính lâu dài và liên tục',
            description:
              'Sự hình thành niềm tin đạo đức và thói quen hành vi đòi hỏi thời gian rèn luyện bền bỉ, lặp đi lặp lại trong nhiều tình huống thực tiễn và cần đấu tranh khắc phục các thói quen cũ.',
            keyAction:
              'Kiên trì, nhẫn nại, không nóng vội đốt cháy giai đoạn và không "đánh trống bỏ dùi".',
          },
          {
            number: 3,
            title: 'Mang tính cụ thể và cá biệt hóa cao',
            description:
              'Cùng một tác động giáo dục nhưng mỗi học sinh có hoàn cảnh sống, kinh nghiệm tâm lí, khí chất và lứa tuổi khác nhau sẽ tiếp nhận và phản ứng theo cách rất khác nhau.',
            keyAction:
              'Thấu hiểu thế giới nội tâm của từng học sinh để lựa chọn phương thức tác động sát hợp từng cá nhân, từng tình huống.',
          },
          {
            number: 4,
            title: 'Thống nhất chặt chẽ với quá trình dạy học và tự giáo dục',
            description:
              '"Dạy chữ" và "Dạy người" thống nhất hữu cơ với nhau; đồng thời hiệu quả giáo dục phụ thuộc trực tiếp vào mức độ thức tỉnh ý thức tự rèn luyện của học sinh.',
            keyAction:
              'Tích hợp giáo dục phẩm chất trong từng tiết dạy bộ môn và phát huy cơ chế tự quản của học sinh.',
          },
        ],
      }),
    ),

    // PHẦN II: HỆ THỐNG 6 NGUYÊN TẮC CỦA HOẠT ĐỘNG GIÁO DỤC (TR. 43–47)
    createElement(
      'section',
      { id: '2-sau-nguyen-tac-hoat-dong-giao-duc', className: 'space-y-4' },
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
          '2. Hệ thống 6 nguyên tắc của hoạt động giáo dục (Giáo trình HCMUE tr. 43–47)',
        ),
      ),
      createElement(ScholarQuote, {
        quote:
          'Yêu cầu đối với con người càng cao bao nhiêu thì càng phải tôn trọng nhân cách của họ bấy nhiêu.',
        author: 'A. S. Makarenko (1888 – 1939)',
        title:
          'Nhà giáo dục học lỗi lạc · Lý luận về Giáo dục Tập thể & Chủ nghĩa Nhân đạo Sư phạm',
        source: 'Giáo trình Giáo dục học HCMUE, Chương 3, tr. 45',
        historicalContext:
          'Luận điểm kinh điển đặt nền móng cho Nguyên tắc tôn trọng nhân cách học sinh kết hợp với yêu cầu hợp lí và Nguyên tắc giáo dục trong tập thể và bằng tập thể.',
      }),
      createElement(
        'p',
        null,
        'Các nguyên tắc của hoạt động giáo dục là một hệ thống toàn vẹn gồm ',
        createElement('strong', null, '6 nguyên tắc cơ bản'),
        '. Người giáo viên không được tuyệt đối hóa bất kỳ nguyên tắc đơn lẻ nào mà phải vận dụng phối hợp linh hoạt trong từng tình huống sư phạm:',
      ),
      createElement(PrincipleMatrix, { defaultPrincipleId: 1 }),
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
          '3. Tình huống Thực hành 5 Bước: Vận dụng 6 nguyên tắc hoạt động giáo dục',
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
      'Yêu cầu sư phạm khi sử dụng phương pháp Trách phạt (Giáo trình tr. 61–62)',
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
      'Trong giáo dục hiện đại, khen thưởng là chủ đạo; trách phạt phải được sử dụng hết sức thận trọng, đúng quy chế pháp luật và luôn hướng tới việc khơi dậy ý thức tự sửa chữa của người học.',
  };

  return createElement(
    'div',
    { className: 'space-y-8 text-[#29383D] leading-relaxed' },

    // 1. THANH METADATA & ĐỐI CHIẾU ĐẦU BÀI
    createElement(PedagogyMetadataBar, {
      courseCode: 'EDUC2802',
      clos: ['CLO4', 'CLO5'],
      textbookPages: 'Tr. 47–65 (Chương 3, Mục 3.3.1 – 3.3.5)',
      legalRefs: [
        'Chương trình GDPT 2018 (TT 32/2018)',
        'Thông tư 27/2020/TT-BGDĐT (Đánh giá HS Tiểu học)',
        'Thông tư 22/2021/TT-BGDĐT (Đánh giá HS THCS & THPT)',
      ],
      sessionNote: 'Lý thuyết & Thảo luận Chương 3',
    }),

    // PHẦN I: MỤC TIÊU 5 PHẨM CHẤT, 10 NĂNG LỰC & KẾ HOẠCH GIÁO DỤC 3 CẤP HỌC (TR. 47–55)
    createElement(
      'section',
      { id: '1-pham-chat-nang-luc-va-ke-hoach-gd', className: 'space-y-4' },
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
          '1. Hệ thống 5 phẩm chất, 10 năng lực và Kế hoạch giáo dục Tiểu học, THCS, THPT (Tr. 47–55)',
        ),
      ),
      createElement(
        'p',
        null,
        'Theo Chương trình GDPT 2018 (Thông tư 32/2018/TT-BGDĐT) và Giáo trình Giáo dục học HCMUE (tr. 47–55), mục tiêu và nội dung hoạt động giáo dục ở nhà trường phổ thông tập trung hình thành và phát triển cho học sinh ',
        createElement('strong', null, '5 phẩm chất chủ yếu'),
        ' và ',
        createElement('strong', null, '10 năng lực cốt lõi'),
        ' thông qua hệ thống các môn học và hoạt động giáo dục bắt buộc theo từng cấp học.',
      ),

      createElement(ComparativeTable, {
        title:
          'Bảng Hệ thống 5 Phẩm chất Chủ yếu và 10 Năng lực Cốt lõi theo Chương trình GDPT 2018 (Tr. 48–51)',
        subtitle:
          'Khung chuẩn đầu ra nhân cách người học xuyên suốt từ lớp 1 đến lớp 12 trong nhà trường phổ thông Việt Nam.',
        badge: '5 Phẩm chất · 10 Năng lực',
        columns: [
          { key: 'category', header: 'Nhóm cấu trúc nhân cách', widthClass: 'w-1/4' },
          { key: 'items', header: 'Các thành tố cốt lõi', widthClass: 'w-1/3' },
          {
            key: 'indicators',
            header: 'Biểu hiện và con đường hình thành trong nhà trường (Tr. 48–51)',
          },
        ],
        rows: [
          {
            category: '5 Phẩm chất chủ yếu',
            items: '1. Yêu nước; 2. Nhân ái; 3. Chăm chỉ; 4. Trung thực; 5. Trách nhiệm.',
            indicators:
              'Hình thành thông qua nội dung giáo dục đạo đức, lối sống, văn hóa học đường, lao động công ích và hoạt động thiện nguyện xã hội.',
          },
          {
            category: '3 Năng lực chung',
            items:
              '1. Năng lực tự chủ và tự học; 2. Năng lực giao tiếp và hợp tác; 3. Năng lực giải quyết vấn đề và sáng tạo.',
            indicators:
              'Được hình thành và phát triển thông qua tất cả các môn học và hoạt động giáo dục ở cả 3 cấp Tiểu học, THCS, THPT.',
          },
          {
            category: '7 Năng lực đặc thù',
            items:
              '4. Ngôn ngữ; 5. Tính toán; 6. Khoa học; 7. Công nghệ; 8. Tin học; 9. Thẩm mĩ; 10. Thể chất.',
            indicators:
              'Được hình thành và phát triển chủ yếu thông qua một số môn học và hoạt động giáo dục chuyên biệt tương ứng.',
          },
        ],
      }),

      createElement(ComparativeTable, {
        title:
          'Bảng Kế hoạch Giáo dục 3 Cấp học (Tiểu học, THCS, THPT) theo Chương trình GDPT 2018 (Tr. 51–55)',
        subtitle:
          'Cấu trúc các môn học, hoạt động giáo dục bắt buộc và thời lượng tổ chức theo từng cấp học.',
        badge: 'Kế hoạch Giáo dục 3 Cấp học',
        columns: [
          { key: 'gradeLevel', header: 'Cấp học', widthClass: 'w-1/5' },
          { key: 'schedule', header: 'Thời lượng học tập', widthClass: 'w-1/5' },
          {
            key: 'subjectsAndActivities',
            header: 'Các môn học và hoạt động giáo dục bắt buộc / lựa chọn',
          },
        ],
        rows: [
          {
            gradeLevel: 'Cấp Tiểu học (Lớp 1 – Lớp 5)',
            schedule: 'Dạy học 2 buổi/ngày (mỗi ngày không quá 7 tiết; mỗi tiết 35 phút)',
            subjectsAndActivities:
              'Môn học & HĐGD bắt buộc: Tiếng Việt, Toán, Đạo đức, Ngoại ngữ 1 (lớp 3–5), Tự nhiên và Xã hội (lớp 1–3), Lịch sử và Địa lí, Khoa học, Tin học và Công nghệ (lớp 3–5), Giáo dục thể chất, Nghệ thuật (Âm nhạc, Mĩ thuật), Hoạt động trải nghiệm (105 tiết/năm).',
          },
          {
            gradeLevel: 'Cấp THCS (Lớp 6 – Lớp 9)',
            schedule:
              'Mỗi ngày học 1 buổi (không quá 5 tiết/buổi; mỗi tiết 45 phút; khuyến khích 2 buổi/ngày)',
            subjectsAndActivities:
              'Môn học & HĐGD bắt buộc: Ngữ văn, Toán, Ngoại ngữ 1, Giáo dục công dân, Lịch sử và Địa lí, Khoa học tự nhiên, Công nghệ, Tin học, Giáo dục thể chất, Nghệ thuật, Hoạt động trải nghiệm, hướng nghiệp (105 tiết/năm), Nội dung giáo dục của địa phương (35 tiết/năm).',
          },
          {
            gradeLevel: 'Cấp THPT (Lớp 10 – Lớp 12)',
            schedule:
              'Mỗi ngày học 1 buổi (không quá 5 tiết/buổi; mỗi tiết 45 phút; khuyến khích 2 buổi/ngày)',
            subjectsAndActivities:
              'Môn học & HĐGD bắt buộc: Ngữ văn, Toán, Ngoại ngữ 1, Lịch sử, Giáo dục thể chất, Giáo dục quốc phòng và an ninh, Hoạt động trải nghiệm, hướng nghiệp (105 tiết/năm), Nội dung giáo dục của địa phương (35 tiết/năm); kèm các môn học lựa chọn và 3 cụm chuyên đề học tập.',
          },
        ],
        footerNote:
          'Nguồn: Chương trình GDPT Tổng thể (TT 32/2018/TT-BGDĐT & TT 13/2022/TT-BGDĐT) — Giáo trình HCMUE tr. 51–55.',
      }),
    ),

    // PHẦN II: HỆ THỐNG 3 NHÓM PHƯƠNG PHÁP GIÁO DỤC (TR. 56–62)
    createElement(
      'section',
      { id: '2-ba-nhom-phuong-phap-giao-duc', className: 'space-y-4' },
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
          '2. Hệ thống 3 nhóm phương pháp giáo dục ở trường phổ thông (Giáo trình HCMUE tr. 56–62)',
        ),
      ),
      createElement(
        'p',
        null,
        'Dựa trên quy luật hình thành nhân cách (tác động đồng bộ vào Nhận thức – Thái độ/Tình cảm – Hành vi/Thói quen), Giáo trình Giáo dục học HCMUE (tr. 56–62) phân loại hệ thống phương pháp giáo dục thành ',
        createElement('strong', null, '3 nhóm phương pháp chính'),
        ':',
        createElement(
          Sidenote,
          { type: 'caution', number: 1 },
          'Bẫy sư phạm khi dùng phương pháp Trách phạt (Giáo trình tr. 61–62): Tuyệt đối không trách phạt bằng lao động (vì làm học sinh ghét lao động), không dùng điểm số học tập để phạt hành vi và không xúc phạm danh dự học sinh trước tập thể.',
        ),
      ),
      createElement(NumberedProcessFlow, {
        title: '3 Nhóm Phương pháp Giáo dục Học sinh ở Nhà trường Phổ thông',
        subtitle:
          'Cấu trúc các phương pháp thành phần và cơ chế tác động theo Giáo trình Giáo dục học HCMUE (tr. 56–62).',
        badge: '3 Nhóm Phương pháp Giáo dục',
        columns: 1,
        steps: [
          {
            number: 1,
            title:
              'Nhóm phương pháp giáo dục bằng ngôn ngữ (Tác động vào ý thức, nhận thức & tình cảm)',
            description:
              'Bao gồm: Phương pháp Thuyết trình (Giảng giải, diễn giảng đạo đức – pháp luật) và Phương pháp Đàm thoại (Trò chuyện, thảo luận, tranh luận theo chủ đề). Kèm theo phương pháp Nêu gương sáng.',
            keyAction:
              'Sử dụng lí lẽ khoa học, dẫn chứng thực tế sinh động và đối thoại dân chủ để giúp học sinh phân biệt đúng – sai, hình thành niềm tin đạo đức.',
            deliverable:
              'Nâng cao nhận thức chuẩn mực và bồi dưỡng tình cảm đạo đức trong sáng cho học sinh.',
          },
          {
            number: 2,
            title:
              'Nhóm phương pháp khám phá – thực hành – trải nghiệm (Tổ chức hoạt động & hình thành hành vi)',
            description:
              'Bao gồm 4 phương pháp trọng tâm: (1) Phương pháp Giải quyết vấn đề; (2) Phương pháp Thực hành, rèn luyện (Luyện tập thói quen, Giao việc); (3) Phương pháp Hợp tác nhóm; (4) Phương pháp Dự án.',
            keyAction:
              'Đặt học sinh vào các tình huống hoạt động thực tiễn để các em tự khám phá, hợp tác và lặp đi lặp lại các hành vi chuẩn mực.',
            deliverable: 'Chuyển hóa nhận thức thành kỹ năng sống và thói quen hành vi bền vững.',
          },
          {
            number: 3,
            title: 'Nhóm phương pháp kích thích và điều chỉnh hành vi hoạt động của học sinh',
            description:
              'Bao gồm 3 phương pháp: (1) Phương pháp Thi đua (kích thích nỗ lực vươn lên lành mạnh); (2) Phương pháp Khen thưởng (biểu dương, khích lệ hành vi tốt); (3) Phương pháp Trách phạt (nhắc nhở, phê bình, kỷ luật tích cực để ngăn chặn hành vi sai lệch).',
            keyAction:
              'Lấy khen thưởng, khích lệ làm chủ đạo; khi trách phạt phải khách quan, công bằng, đúng mức và tôn trọng nhân phẩm học sinh.',
            deliverable: 'Củng cố động cơ tích cực và tự giác điều chỉnh các hành vi lệch chuẩn.',
          },
        ],
      }),
    ),

    // PHẦN III: ĐÁNH GIÁ KẾT QUẢ HOẠT ĐỘNG GIÁO DỤC THEO TT 27/2020 & TT 22/2021 (TR. 62–65)
    createElement(
      'section',
      { id: '3-danh-gia-ket-qua-tt27-tt22', className: 'space-y-4' },
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
          '3. Đánh giá kết quả hoạt động giáo dục theo Thông tư 27/2020 và Thông tư 22/2021 (Tr. 62–65)',
        ),
      ),
      createElement(LegalReferenceBox, {
        lawTitle: 'Thông tư 27/2020/TT-BGDĐT & Thông tư 22/2021/TT-BGDĐT',
        article: 'Mục đích và nguyên tắc đánh giá học sinh phổ thông',
        quote:
          'Đánh giá nhằm xác định mức độ hoàn thành nhiệm vụ rèn luyện và học tập của học sinh theo yêu cầu cần đạt được quy định trong Chương trình giáo dục phổ thông; cung cấp thông tin chính xác, kịp thời để học sinh điều chỉnh hoạt động rèn luyện và học tập, cán bộ quản lý giáo dục và giáo viên điều chỉnh hoạt động dạy học và giáo dục. Đánh giá vì sự tiến bộ của học sinh; coi trọng việc động viên, khuyến khích sự cố gắng trong rèn luyện và học tập của học sinh; không so sánh học sinh với nhau.',
        source: 'Bộ Giáo dục và Đào tạo (Giáo trình HCMUE tr. 62–65)',
        significance:
          'Chuyển đổi căn bản triết lý đánh giá: từ "đánh giá để xếp hạng" sang "đánh giá vì sự tiến bộ của người học".',
      }),

      createElement(ComparativeTable, {
        title:
          'Bảng Đối sánh Quy định Đánh giá Kết quả Rèn luyện & Giáo dục theo Thông tư 27/2020 và Thông tư 22/2021 (Tr. 63–65)',
        subtitle:
          'Chuẩn hóa cách thức và mức độ đánh giá phẩm chất, năng lực và kết quả rèn luyện ở cấp Tiểu học và cấp THCS, THPT.',
        badge: 'Thông tư 27/2020 & Thông tư 22/2021',
        columns: [
          { key: 'criteria', header: 'Nội dung quy định', widthClass: 'w-1/4' },
          { key: 'tt27', header: 'Cấp Tiểu học (Thông tư 27/2020/TT-BGDĐT)' },
          { key: 'tt22', header: 'Cấp THCS & THPT (Thông tư 22/2021/TT-BGDĐT)' },
        ],
        rows: [
          {
            criteria: 'Đối tượng & Phạm vi đánh giá',
            tt27: 'Đánh giá quá trình học tập, sự tiến bộ và kết quả học tập các môn học, HĐGD; đánh giá sự hình thành và phát triển 5 phẩm chất chủ yếu và 10 năng lực cốt lõi.',
            tt22: 'Đánh giá kết quả rèn luyện (theo yêu cầu cần đạt về 5 phẩm chất chủ yếu và 3 năng lực chung) và kết quả học tập của học sinh từ lớp 6 đến lớp 12.',
          },
          {
            criteria: 'Các mức đánh giá kết quả rèn luyện / phẩm chất, năng lực',
            tt27: 'Đánh giá sự hình thành và phát triển phẩm chất, năng lực theo 3 mức: Tốt – Đạt – Cần cố gắng.',
            tt22: 'Đánh giá kết quả rèn luyện của học sinh trong từng học kỳ và cả năm học theo 4 mức: Tốt – Khá – Đạt – Chưa đạt.',
          },
          {
            criteria: 'Đánh giá môn Hoạt động trải nghiệm, hướng nghiệp',
            tt27: 'Đánh giá bằng nhận xét theo 2 mức: Hoàn thành tốt (HTT), Hoàn thành (HT) và Chưa hoàn thành (CHT).',
            tt22: 'Là môn học đánh giá bằng nhận xét (không cho điểm số), xếp loại kết quả theo 2 mức: Đạt (Đ) hoặc Chưa đạt (CĐ).',
          },
          {
            criteria: 'Chủ thể tham gia đánh giá',
            tt27: 'Giáo viên đánh giá, học sinh tự đánh giá và đánh giá đồng đẳng, cha mẹ học sinh tham gia nhận xét phối hợp.',
            tt22: 'GVCN chủ trì phối hợp với các giáo viên bộ môn, kết hợp tự đánh giá của học sinh, nhận xét của tập thể lớp và gia đình.',
          },
        ],
        footerNote:
          'Nguồn: Thông tư 27/2020/TT-BGDĐT và Thông tư 22/2021/TT-BGDĐT (Giáo trình HCMUE tr. 62–65).',
      }),
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
          '4. Tình huống Thực hành 5 Bước: Sử dụng phương pháp kích thích – điều chỉnh hành vi và đánh giá đúng quy chế',
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
  const caseStudy3_4: PedagogicalCaseStudy = {
    id: 304,
    title:
      'Học sinh đứng lên chất vấn gay gắt về điểm số và thái độ của giáo viên ngay trong giờ học',
    context:
      'Khi giáo viên vừa trả bài kiểm tra giữa kỳ môn Toán, em D. (lớp 11) đột ngột đứng phắt dậy đập bài kiểm tra xuống bàn và nói lớn trước cả lớp: "Thầy chấm bài không công bằng! Bài của em cách giải ra đáp số giống hệt bạn T., tại sao bạn được 9 điểm còn em chỉ được 6 điểm? Thầy có định kiến với em phải không?". Cả lớp im phăng phắc chờ phản ứng của thầy giáo.',
    question:
      'Vận dụng Quy trình 5 bước giải quyết tình huống giáo dục chuẩn mực (Mục 3.3.6 Giáo trình HCMUE tr. 65–66), anh/chị hãy xử lí tình huống sư phạm trên.',
    principlesApplied: [
      'Quy trình 5 bước xử lí tình huống giáo dục (Mục 3.3.6 Giáo trình HCMUE tr. 65–66)',
      'Kĩ năng kiềm chế cảm xúc và làm chủ tình huống bất ngờ trên lớp',
      'Nguyên tắc tôn trọng nhân cách học sinh kết hợp với yêu cầu hợp lí',
    ],
    solutionSteps: [
      {
        step: 1,
        title: 'Bước 1: Nhận diện sự việc và xác định vấn đề cần giải quyết',
        content:
          'Em D. đang bức xúc về điểm số và có hành vi phản ứng nóng nảy trước tập thể lớp. Vấn đề cần giải quyết ngay là: (1) Giữ bình tĩnh để hạ nhiệt căng thẳng và ổn định giờ học; (2) Giải đáp minh bạch thắc mắc chuyên môn mà không làm tổn thương uy tín của thầy lẫn lòng tự trọng của trò.',
      },
      {
        step: 2,
        title: 'Bước 2: Thu thập thông tin và phân tích nguyên nhân khách quan, chủ quan',
        content:
          'Quan sát nhanh bài làm của em D. và bạn T.: có thể em D. ra đúng đáp số cuối nhưng bị thiếu điều kiện xác định hoặc biến đổi sai bản chất ở bước trung gian; mặt khác tâm lí lứa tuổi THPT rất nhạy cảm với sự công bằng.',
      },
      {
        step: 3,
        title: 'Bước 3: Đề xuất các phương án giải quyết khả thi',
        content:
          'Phương án 1: Quát mắng và đuổi em D. ra khỏi lớp vì thái độ vô lễ (đẩy xung đột lên đỉnh điểm). Phương án 2: Bình tĩnh ghi nhận quyền thắc mắc điểm số của em D., hẹn kiểm tra đối chiếu chi tiết theo barem ngay cuối tiết học và nhắc nhở nhẹ nhàng về cách diễn đạt tôn trọng trên lớp (tối ưu).',
      },
      {
        step: 4,
        title: 'Bước 4: Lựa chọn phương án tối ưu và tổ chức thực hiện tác động sư phạm',
        content:
          'Giáo viên điềm tĩnh mỉm cười: "Thầy ghi nhận thắc mắc của D. Mọi điểm số đều dựa trên đáp án chi tiết từng bước, nếu thầy cộng nhầm hoặc sót ý thầy sẵn sàng cộng lại điểm cho em. Bây giờ em ngồi xuống để lớp tiếp tục bài học, cuối giờ thầy trò mình cùng xem lại bài của em và bạn T. nhé."',
      },
      {
        step: 5,
        title: 'Bước 5: Đánh giá kết quả, theo dõi hỗ trợ và rút kinh nghiệm sư phạm',
        content:
          'Cuối giờ, thầy phân tích rõ barem từng bước cho em D. thấy chỗ mất điểm (hoặc sửa điểm ngay nếu chấm sót); đồng thời giúp em D. nhận ra cần trao đổi bình tĩnh, lễ phép thay vì đập bàn nóng nảy.',
      },
    ],
    pitfallsToAvoid: [
      'Đôi co tay đôi với học sinh ngay giữa giờ học làm cháy giáo án và mất uy tín sư phạm.',
      'Từ chối giải thích thắc mắc điểm số của học sinh dưới danh nghĩa "quyền tối thượng của giáo viên".',
    ],
    coreLesson:
      'Bản lĩnh sư phạm trong Quy trình 5 bước thể hiện rõ nhất ở "khoảng dừng chiến thuật" (Bước 1 & Bước 2): người thầy giữ cái đầu lạnh để hóa giải cơn nóng giận của học trò bằng sự minh bạch và công tâm.',
  };

  return createElement(
    'div',
    { className: 'space-y-8 text-[#29383D] leading-relaxed' },

    // 1. THANH METADATA & ĐỐI CHIẾU ĐẦU BÀI
    createElement(PedagogyMetadataBar, {
      courseCode: 'EDUC2802',
      clos: ['CLO4', 'CLO5'],
      textbookPages: 'Tr. 65–66 (Chương 3, Mục 3.3.6)',
      legalRefs: [
        'Giáo trình Giáo dục học HCMUE (Mục 3.3.6, tr. 65–66)',
        'Cẩm nang Phương pháp Giáo dục Kỷ luật tích cực',
      ],
      sessionNote: 'Lý thuyết & Thực hành Kỹ năng Sư phạm Chương 3',
    }),

    // PHẦN I: KHÁI NIỆM & PHÂN LOẠI TÌNH HUỐNG GIÁO DỤC (TR. 65)
    createElement(
      'section',
      { id: '1-khai-niem-tinh-huong-giao-duc', className: 'space-y-4' },
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
          '1. Khái niệm tình huống giáo dục và yêu cầu đối với kĩ năng ứng xử sư phạm (Tr. 65)',
        ),
      ),
      createElement(
        'p',
        null,
        'Theo Giáo trình Giáo dục học HCMUE (tr. 65), ',
        createElement('strong', null, 'tình huống giáo dục (tình huống sư phạm)'),
        ' là những sự việc, hoàn cảnh có chứa đựng mâu thuẫn nảy sinh trong quá trình hoạt động giáo dục ở nhà trường phổ thông (giữa yêu cầu giáo dục với trình độ nhận thức, thái độ, hành vi hiện có của học sinh, hoặc giữa các lực lượng giáo dục), đòi hỏi người giáo viên phải kịp thời tìm ra phương án giải quyết hợp lí nhằm mang lại hiệu quả giáo dục nhân cách.',
        createElement(
          Sidenote,
          { type: 'pedagogy', number: 1 },
          'V. A. Xu-khôm-lin-xki từng nhấn mạnh: "Sự khéo léo đối xử sư phạm là chiếc chìa khóa mở cửa tâm hồn học sinh. Không có sự tinh tế tâm lí và lòng trắc ẩn, mọi phương pháp đều trở nên thô bạo."',
        ),
      ),

      createElement(ComparativeTable, {
        title:
          'Bảng Phân loại Tình huống Giáo dục và Yêu cầu Kĩ năng Sư phạm (Giáo trình HCMUE tr. 65)',
        subtitle:
          'Nhận diện các dạng tình huống thường gặp trong hoạt động sư phạm và yêu cầu tâm lí – đạo đức khi ứng xử.',
        badge: 'Tình huống Sư phạm',
        columns: [
          { key: 'type', header: 'Nhóm tình huống giáo dục', widthClass: 'w-1/4' },
          { key: 'manifestation', header: 'Biểu hiện thực tiễn tại trường phổ thông' },
          { key: 'skillRequirement', header: 'Yêu cầu kĩ năng ứng xử của người giáo viên' },
        ],
        rows: [
          {
            type: '1. Tình huống giữa Giáo viên và Học sinh trên lớp học',
            manifestation:
              'Học sinh mất trật tự, ngủ gật, quên làm bài, gian lận kiểm tra, chất vấn gay gắt hoặc có hành vi chống đối.',
            skillRequirement:
              'Kiềm chế cảm xúc, xử lí nhanh gọn để không làm gián đoạn tiết học; chuyển việc xử lí sâu sang trao đổi riêng sau giờ học.',
          },
          {
            type: '2. Tình huống trong Tập thể học sinh (Giữa HS với HS)',
            manifestation:
              'Mâu thuẫn bè phái, cô lập bạn học, bắt nạt học đường, nói xấu trên mạng xã hội, mất đoàn kết trong thi đua.',
            skillRequirement:
              'Khách quan, lắng nghe đa chiều, bảo vệ nạn nhân, phát huy vai trò hòa giải và dư luận lành mạnh của tập thể lớp.',
          },
          {
            type: '3. Tình huống phối hợp Giáo viên – Gia đình – Xã hội',
            manifestation:
              'Phụ huynh hiểu lầm phương pháp của giáo viên, bênh con vô lý, hoặc thiếu quan tâm phó mặc con cho nhà trường.',
            skillRequirement:
              'Thái độ tôn trọng, cầu thị, dựa trên minh chứng khách quan và luôn đặt lợi ích tốt nhất của học sinh làm điểm chung.',
          },
        ],
      }),
    ),

    // PHẦN II: QUY TRÌNH 5 BƯỚC XỬ LÍ TÌNH HUỐNG GIÁO DỤC CHUẨN MỰC (TR. 65–66)
    createElement(
      'section',
      { id: '2-quy-trinh-5-buoc-xu-li-tinh-huong', className: 'space-y-4' },
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
          '2. Quy trình 5 bước giải quyết tình huống giáo dục chuẩn mực (Mục 3.3.6 Giáo trình HCMUE tr. 65–66)',
        ),
      ),
      createElement(
        'p',
        null,
        'Để tránh phản ứng cảm tính, nóng vội hoặc áp đặt chủ quan, Giáo trình Giáo dục học HCMUE (Mục 3.3.6, tr. 65–66) xác lập ',
        createElement('strong', null, 'Quy trình 5 bước giải quyết tình huống giáo dục'),
        ' làm chuẩn mực hành động cho mọi giáo viên phổ thông:',
      ),

      createElement(NumberedProcessFlow, {
        title:
          'Lưu đồ Quy trình 5 Bước Giải quyết Tình huống Giáo dục (Mục 3.3.6 Giáo trình HCMUE tr. 65–66)',
        subtitle:
          'Quy trình chuẩn hóa ứng dụng xuyên suốt trong phân tích tình huống sư phạm và bài thi thực hành học phần EDUC2802.',
        badge: 'Quy trình 5 Bước · Mục 3.3.6',
        columns: 1,
        steps: [
          {
            number: 1,
            title: 'Bước 1: Nhận diện tình huống và xác định vấn đề cần giải quyết',
            description:
              'Bình tĩnh quan sát hiện tượng, làm chủ cảm xúc cá nhân; xác định chính xác mâu thuẫn cốt lõi trong tình huống là gì và mục tiêu sư phạm cần đạt được khi giải quyết tình huống đó.',
            keyAction:
              'Trả lời câu hỏi: Chuyện gì đang xảy ra? Vấn đề mấu chốt cần ưu tiên giải quyết ngay và giải quyết lâu dài là gì?',
            deliverable:
              'Xác định đúng bản chất mâu thuẫn sư phạm, không bị đánh lừa bởi hiện tượng bề ngoài.',
          },
          {
            number: 2,
            title: 'Bước 2: Thu thập thông tin và phân tích nguyên nhân của tình huống',
            description:
              'Tìm hiểu đầy đủ thông tin từ nhiều phía (học sinh liên quan, bạn bè, phụ huynh, hoàn cảnh gia đình, đặc điểm tâm sinh lí lứa tuổi) để chỉ rõ nguyên nhân chủ quan và khách quan dẫn đến hành vi của học sinh.',
            keyAction:
              'Tuyệt đối không kết luận hay phán xét khi chưa lắng nghe học sinh trình bày lý do.',
            deliverable: 'Chẩn đoán đúng nguyên nhân gốc rễ về mặt tâm lí và giáo dục.',
          },
          {
            number: 3,
            title: 'Bước 3: Đề xuất các phương án giải quyết tình huống',
            description:
              'Dựa trên hệ thống 6 nguyên tắc hoạt động giáo dục và quy định pháp quy (Luật Giáo dục 2019, Điều lệ trường học 2020, Thông tư 20/2018), liệt kê các phương án xử lí có thể thực hiện và dự báo hệ quả của từng phương án.',
            keyAction:
              'Loại bỏ các phương án cực đoan (trừng phạt xúc phạm nhân phẩm hoặc buông xuôi bỏ mặc).',
            deliverable:
              'Các phương án khả thi đảm bảo tính pháp lý, tính khoa học và tính nhân văn.',
          },
          {
            number: 4,
            title: 'Bước 4: Lựa chọn phương án tối ưu và tổ chức thực hiện',
            description:
              'Chọn phương án mang lại hiệu quả giáo dục cao nhất và tiến hành tác động sư phạm khéo léo (kết hợp xử lí tức thời tại hiện trường để ổn định lớp học và xử lí chiều sâu sau giờ học).',
            keyAction:
              'Sử dụng ngôn ngữ tôn trọng, khích lệ kết hợp yêu cầu rõ ràng để học sinh tự giác nhận thức và cam kết sửa đổi.',
            deliverable:
              'Hóa giải mâu thuẫn tình huống và giữ vững uy tín sư phạm, bầu không khí tích cực.',
          },
          {
            number: 5,
            title: 'Bước 5: Đánh giá kết quả, theo dõi hỗ trợ và rút kinh nghiệm sư phạm',
            description:
              'Kiểm tra sự chuyển biến về thái độ, hành vi của học sinh sau khi giải quyết tình huống; tiếp tục đồng hành hỗ trợ, phối hợp các lực lượng giáo dục và đúc kết bài học kinh nghiệm nghề nghiệp.',
            keyAction:
              'Ghi nhận sự tiến bộ của học sinh và tự phản tư để nâng cao năng lực ứng xử sư phạm.',
            deliverable:
              'Sự trưởng thành bền vững của học sinh và bài học kinh nghiệm sư phạm sâu sắc.',
          },
        ],
      }),

      createElement(LegalReferenceBox, {
        lawTitle: 'Thông tư số 32/2020/TT-BGDĐT (Điều lệ trường trung học)',
        article:
          'Điều 31 (Hành vi, ngôn ngữ ứng xử của giáo viên) & Điều 38 (Khen thưởng và kỷ luật)',
        quote:
          'Hành vi, ngôn ngữ ứng xử của giáo viên, nhân viên phải bảo đảm tính sư phạm, đúng mực, có tác dụng giáo dục đối với học sinh. Giáo viên không được xúc phạm danh dự, nhân phẩm; xâm phạm thân thể của học sinh và đồng nghiệp. Học sinh vi phạm khuyết điểm trong quá trình học tập, rèn luyện được giáo dục hoặc xử lý kỷ luật theo các hình thức: Nhắc nhở, hỗ trợ, giúp đỡ trực tiếp để học sinh khắc phục khuyết điểm; Khiển trách, thông báo với cha mẹ học sinh nhằm phối hợp giúp đỡ học sinh khắc phục khuyết điểm; Tạm dừng học ở trường có thời hạn và thực hiện các biện pháp giáo dục khác theo quy định của Bộ GD&ĐT.',
        source: 'Thông tư số 32/2020/TT-BGDĐT (Giáo trình HCMUE tr. 64–66)',
        significance:
          'Đặt ra giới hạn pháp lý và chuẩn mực nhân văn bắt buộc khi giáo viên thực hiện Bước 3 và Bước 4 trong quy trình xử lí tình huống giáo dục.',
      }),
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
          '3. Tình huống Thực hành 5 Bước: Xử lí tình huống bất ngờ trên lớp học',
        ),
      ),
      createElement(CaseStudyBox, { caseStudy: caseStudy3_4, defaultOpenSolution: false }),
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
          'Hệ thống giáo dục quốc dân theo Luật GD 2019 & QĐ 1981/QĐ-TTg; Chương trình GDPT 2018 theo TT 32/2018; Cơ cấu tổ chức bộ máy nhà trường phổ thông theo Điều lệ 2020 (Giáo trình HCMUE tr. 32–39).',
        level: 'basic',
        tags: [
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
            id: '1-he-thong-gdqd-va-ctgdpt-2018',
            text: '1. Hệ thống giáo dục quốc dân và Chương trình GDPT 2018 (Tr. 32–36)',
            depth: 2,
          },
          {
            id: '2-co-cau-to-chuc-nha-truong',
            text: '2. Cơ cấu tổ chức bộ máy nhà trường phổ thông theo Điều lệ 2020 (Tr. 36–39)',
            depth: 2,
          },
          {
            id: '3-tinh-huong-thuc-hanh',
            text: '3. Tình huống Thực hành 5 Bước: Định hướng nghề nghiệp ở trường THPT',
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
        title: 'Bài 3.2: Bản chất, đặc điểm và nguyên tắc của hoạt động giáo dục',
        description:
          'Sự thống nhất biện chứng giữa vai trò chủ đạo của GV và chủ thể tự giáo dục của HS; 4 đặc điểm và 6 nguyên tắc hoạt động giáo dục (Giáo trình HCMUE tr. 39–47).',
        level: 'intermediate',
        tags: ['CLO4', 'CLO5', 'Bản chất HĐGD', '6 Nguyên tắc giáo dục', 'Giáo trình tr. 39-47'],
      },
      lessonMeta: {
        chapterNumber: 3,
        lessonNumber: 2,
        headings: [
          {
            id: '1-ban-chat-va-4-dac-diem',
            text: '1. Bản chất và 4 đặc điểm của hoạt động giáo dục (Tr. 39–43)',
            depth: 2,
          },
          {
            id: '2-sau-nguyen-tac-hoat-dong-giao-duc',
            text: '2. Hệ thống 6 nguyên tắc của hoạt động giáo dục (Tr. 43–47)',
            depth: 2,
          },
          {
            id: '3-tinh-huong-thuc-hanh',
            text: '3. Tình huống Thực hành 5 Bước: Vận dụng 6 nguyên tắc giáo dục',
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
        title: 'Bài 3.3: Cấu trúc thành tố, phương pháp và đánh giá kết quả hoạt động giáo dục',
        description:
          'Bảng 5 phẩm chất & 10 năng lực; Kế hoạch giáo dục Tiểu học, THCS, THPT; 3 nhóm phương pháp giáo dục và đánh giá theo TT 27/2020, TT 22/2021 (Giáo trình HCMUE tr. 47–65).',
        level: 'intermediate',
        tags: [
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
            id: '1-pham-chat-nang-luc-va-ke-hoach-gd',
            text: '1. Hệ thống 5 phẩm chất, 10 năng lực và Kế hoạch giáo dục 3 cấp học (Tr. 47–55)',
            depth: 2,
          },
          {
            id: '2-ba-nhom-phuong-phap-giao-duc',
            text: '2. Hệ thống 3 nhóm phương pháp giáo dục ở trường phổ thông (Tr. 56–62)',
            depth: 2,
          },
          {
            id: '3-danh-gia-ket-qua-tt27-tt22',
            text: '3. Đánh giá kết quả hoạt động giáo dục theo TT 27/2020 và TT 22/2021 (Tr. 62–65)',
            depth: 2,
          },
          {
            id: '4-tinh-huong-thuc-hanh',
            text: '4. Tình huống Thực hành 5 Bước: Sử dụng phương pháp kích thích – điều chỉnh',
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
          'Khái niệm tình huống sư phạm và Quy trình 5 bước giải quyết tình huống giáo dục chuẩn mực theo Mục 3.3.6 Giáo trình HCMUE (tr. 65–66).',
        level: 'advanced',
        tags: ['CLO4', 'CLO5', 'Tình huống giáo dục', 'Quy trình 5 bước', 'Giáo trình tr. 65-66'],
      },
      lessonMeta: {
        chapterNumber: 3,
        lessonNumber: 4,
        headings: [
          {
            id: '1-khai-niem-tinh-huong-giao-duc',
            text: '1. Khái niệm tình huống giáo dục và yêu cầu kĩ năng ứng xử (Tr. 65)',
            depth: 2,
          },
          {
            id: '2-quy-trinh-5-buoc-xu-li-tinh-huong',
            text: '2. Quy trình 5 bước giải quyết tình huống giáo dục chuẩn mực (Tr. 65–66)',
            depth: 2,
          },
          {
            id: '3-tinh-huong-thuc-hanh',
            text: '3. Tình huống Thực hành 5 Bước: Xử lí tình huống bất ngờ trên lớp học',
            depth: 2,
          },
        ],
        blocks: [],
      },
    };
  }

  return null;
}
