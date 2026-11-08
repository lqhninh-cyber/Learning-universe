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
// 1. COMPONENT BÀI 2.1: GIÁO DỤC LÀ MỘT HIỆN TƯỢNG XÃ HỘI ĐẶC BIỆT (TR. 13–20)
// ============================================================================

export const Lesson2_1View: FC = () => {
  const caseStudy2_1: PedagogicalCaseStudy = {
    id: 201,
    title: 'Quan niệm định kiến "Cha mẹ sinh con trời sinh tính" và buông xuôi học sinh yếu',
    context:
      'Em H. (lớp 10) có học lực môn Toán yếu và hay ngủ gật trong giờ học. Hoàn cảnh gia đình em phức tạp, bố mẹ đi làm ăn xa, em ở với bà ngoại già yếu. Trong buổi họp giao ban, một giáo viên bộ môn nhận xét: "Em H. vốn không có năng khiếu bẩm sinh về Toán, hoàn cảnh gia đình lại như vậy, có dạy thế nào cũng không thay đổi được đâu, cứ để em ấy ngồi yên không quậy phá là được rồi."',
    question:
      'Vận dụng lý luận về vai trò chủ đạo của giáo dục đối với sự phát triển nhân cách trong mối quan hệ biện chứng với Bẩm sinh – di truyền, Môi trường và Hoạt động cá nhân (Giáo trình HCMUE tr. 17–20), anh/chị hãy xử lí tình huống theo quy trình 5 bước.',
    principlesApplied: [
      'Vai trò chủ đạo của giáo dục đối với sự phát triển nhân cách (Giáo trình tr. 17–20)',
      'Mối quan hệ biện chứng giữa 4 yếu tố: Bẩm sinh – di truyền, Môi trường, Giáo dục, Hoạt động cá nhân',
      'Nguyên tắc tôn trọng nhân cách học sinh kết hợp với yêu cầu hợp lí',
    ],
    solutionSteps: [
      {
        step: 1,
        title: 'Bước 1: Nhận diện sự việc và xác định vấn đề cần giải quyết',
        content:
          'Giáo viên bộ môn đang mắc sai lầm nhận thức khi tuyệt đối hóa yếu tố bẩm sinh – di truyền và hoàn cảnh môi trường gia đình, từ đó phủ nhận vai trò chủ đạo của giáo dục nhà trường và buông xuôi trách nhiệm đối với học sinh H.',
      },
      {
        step: 2,
        title: 'Bước 2: Thu thập thông tin và phân tích nguyên nhân theo Giáo trình HCMUE',
        content:
          'Theo Giáo trình HCMUE (tr. 17–20), bẩm sinh – di truyền chỉ là tiền đề vật chất chứ không định sẵn nhân cách hay học lực; môi trường gia đình khó khăn có thể được bù đắp và cải biến nhờ sự can thiệp có mục đích của giáo dục nhà trường. Em H. ngủ gật có thể do thiếu sự quan tâm sinh hoạt ở nhà và mất gốc kiến thức.',
      },
      {
        step: 3,
        title: 'Bước 3: Đề xuất các phương án giải quyết khả thi',
        content:
          'Phương án 1: Đồng tình bỏ mặc em H. miễn là em không gây mất trật tự (vi phạm đạo đức nghề nghiệp và Luật Giáo dục). Phương án 2: Trao đổi thuyết phục đồng nghiệp, tìm hiểu lịch sinh hoạt của em H. và thiết kế lộ trình phụ đạo vừa sức kết hợp đôi bạn cùng tiến.',
      },
      {
        step: 4,
        title: 'Bước 4: Lựa chọn phương án tối ưu và tổ chức thực hiện tác động sư phạm',
        content:
          'Phối hợp với GVCN thăm hỏi bà ngoại và em H., sắp xếp bạn học khá ngồi cạnh hỗ trợ, giao các bài tập Toán cơ bản vừa sức để em H. từng bước lấy lại cảm giác thành công và hứng thú học tập.',
      },
      {
        step: 5,
        title: 'Bước 5: Đánh giá kết quả, theo dõi hỗ trợ và rút kinh nghiệm sư phạm',
        content:
          'Theo dõi sự tiến bộ của em H. qua từng tuần, kịp thời khen ngợi những nỗ lực nhỏ nhất để kích hoạt yếu tố "Hoạt động cá nhân và tự giáo dục" — yếu tố quyết định trực tiếp sự phát triển nhân cách.',
      },
    ],
    pitfallsToAvoid: [
      'Tuyệt đối hóa yếu tố di truyền ("Thuyết định mệnh do di truyền") hoặc hoàn cảnh xuất thân ("Thuyết định mệnh do môi trường").',
      'Kỳ vọng giáo dục vạn năng một chiều mà không khơi dậy tính tích cực hoạt động tự giác của chính học sinh.',
    ],
    coreLesson:
      'Giáo dục giữ vai trò chủ đạo vì nó không chỉ định hướng sự phát triển nhân cách mà còn có khả năng bù đắp những thiếu hụt do hoàn cảnh môi trường và điều chỉnh những lệch lạc hành vi của người học.',
  };

  return createElement(
    'div',
    { className: 'space-y-8 text-[#29383D] leading-relaxed' },

    // 1. THANH METADATA & ĐỐI CHIẾU ĐẦU BÀI
    createElement(PedagogyMetadataBar, {
      courseCode: 'EDUC2802',
      clos: ['CLO1', 'CLO3'],
      textbookPages: 'Tr. 13–20 (Chương 2, Mục 2.1)',
      legalRefs: [
        'Luật Giáo dục 2019 (Điều 2, Điều 5)',
        'Giáo trình Giáo dục học HCMUE (Chương 2)',
      ],
      sessionNote: 'Lý thuyết & Thảo luận Chương 2',
    }),

    // PHẦN I: BẢN CHẤT HIỆN TƯỢNG XÃ HỘI ĐẶC BIỆT & 4 TÍNH CHẤT CƠ BẢN (TR. 13–15)
    createElement(
      'section',
      { id: '1-ban-chat-va-4-tinh-chat', className: 'space-y-4' },
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
          '1. Bản chất của hiện tượng giáo dục và 4 tính chất cơ bản (Tr. 13–15)',
        ),
      ),
      createElement(
        'p',
        null,
        'Để xã hội loài người tồn tại và phát triển, thế hệ đi trước tất yếu phải truyền lại cho thế hệ đi sau những kinh nghiệm lịch sử – xã hội đã tích lũy được qua lao động và đấu tranh sinh tồn. Theo Giáo trình Giáo dục học HCMUE (tr. 13–14), ',
        createElement(
          'strong',
          null,
          'bản chất của giáo dục là quá trình truyền thụ và lĩnh hội có ý thức những kinh nghiệm lịch sử – xã hội từ thế hệ trước cho thế hệ sau',
        ),
        ' nhằm chuẩn bị cho thế hệ trẻ tham gia vào đời sống xã hội và lao động sản xuất.',
        createElement(
          Sidenote,
          { type: 'pedagogy', number: 1 },
          'Khác với hành vi bắt chước bản năng ở động vật, giáo dục chỉ có ở xã hội loài người: thế hệ sau không chỉ tiếp nhận mà còn chọn lọc, cải tạo và làm giàu thêm kho tàng văn hóa nhân loại.',
        ),
      ),

      createElement(NumberedProcessFlow, {
        title: '4 Thành phần Kinh nghiệm Lịch sử – Xã hội và 4 Tính chất Cơ bản của Giáo dục',
        subtitle:
          'Cấu trúc nội dung truyền thụ – lĩnh hội và các tính chất quy định sự vận động của giáo dục trong xã hội (Giáo trình HCMUE tr. 13–15).',
        badge: 'Bản chất & 4 Tính chất Giáo dục',
        columns: 2,
        steps: [
          {
            number: 1,
            title: 'Tính phổ biến và vĩnh hằng của giáo dục',
            description:
              'Giáo dục xuất hiện cùng với sự ra đời của xã hội loài người, tồn tại ở mọi cộng đồng và chỉ mất đi khi xã hội loài người không còn tồn tại.',
            keyAction:
              'Thành phần kinh nghiệm 1: Hệ thống tri thức khoa học về tự nhiên, xã hội, tư duy và cách thức hoạt động.',
          },
          {
            number: 2,
            title: 'Tính nhân văn của giáo dục',
            description:
              'Giáo dục luôn hướng tới con người, vì sự phát triển hoàn thiện nhân cách con người, tôn vinh các giá trị Chân – Thiện – Mỹ.',
            keyAction:
              'Thành phần kinh nghiệm 2: Hệ thống kỹ năng, kỹ xảo thực hiện các phương thức hoạt động đã biết.',
          },
          {
            number: 3,
            title: 'Tính lịch sử – xã hội (và tính giai cấp)',
            description:
              'Ở mỗi giai đoạn lịch sử, mỗi chế độ chính trị – kinh tế khác nhau, giáo dục có mục đích, nội dung, phương pháp và mô hình tổ chức tương ứng.',
            keyAction:
              'Thành phần kinh nghiệm 3: Kinh nghiệm hoạt động sáng tạo giúp giải quyết các vấn đề mới của thời đại.',
          },
          {
            number: 4,
            title: 'Tính dân tộc và tính thời đại',
            description:
              'Giáo dục bảo tồn bản sắc văn hóa dân tộc đồng thời tiếp thu tinh hoa văn minh nhân loại và xu thế phát triển của thời đại.',
            keyAction:
              'Thành phần kinh nghiệm 4: Hệ thống các chuẩn mực thái độ, giá trị đạo đức, cảm xúc đối với thế giới và con người.',
          },
        ],
      }),
    ),

    // PHẦN II: 3 CHỨC NĂNG XÃ HỘI CỦA GIÁO DỤC (TR. 15–17)
    createElement(
      'section',
      { id: '2-ba-chuc-nang-xa-hoi', className: 'space-y-4' },
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
          '2. Ba chức năng xã hội của giáo dục (Giáo trình HCMUE tr. 15–17)',
        ),
      ),
      createElement(
        'p',
        null,
        'Với tư cách là một thiết chế xã hội trọng yếu, giáo dục tác động toàn diện đến sự phát triển của xã hội thông qua ',
        createElement('strong', null, '3 chức năng xã hội cơ bản'),
        ' có quan hệ mật thiết với nhau:',
      ),
      createElement(ComparativeTable, {
        title: 'Bảng Ma trận 3 Chức năng Xã hội của Giáo dục (Giáo trình HCMUE tr. 15–17)',
        subtitle:
          'Phân tích nội dung tác động và yêu cầu thực tiễn của từng chức năng xã hội trong bối cảnh đổi mới giáo dục hiện nay.',
        badge: '3 Chức năng Xã hội',
        columns: [
          { key: 'func', header: 'Chức năng xã hội', widthClass: 'w-1/4' },
          { key: 'content', header: 'Bản chất & Biểu hiện tác động' },
          { key: 'requirement', header: 'Yêu cầu đối với nền giáo dục Việt Nam hiện đại' },
        ],
        rows: [
          {
            func: '1. Chức năng kinh tế – sản xuất',
            content:
              'Giáo dục tái sản xuất sức lao động xã hội có trình độ chuyên môn, kỹ thuật và năng suất cao; biến khoa học công nghệ thành lực lượng sản xuất trực tiếp thúc đẩy tăng trưởng kinh tế.',
            requirement:
              'Đào tạo gắn với nhu cầu thị trường lao động, chú trọng giáo dục STEM, hướng nghiệp phân luồng và phát triển năng lực giải quyết vấn đề.',
          },
          {
            func: '2. Chức năng chính trị – tư tưởng (xã hội)',
            content:
              'Tuyên truyền, bồi dưỡng hệ tư tưởng chính trị, pháp luật, ý thức công dân; góp phần thay đổi cơ cấu xã hội, nâng cao tính dịch chuyển xã hội và đảm bảo công bằng xã hội.',
            requirement:
              'Giáo dục lý tưởng độc lập dân tộc gắn với chủ nghĩa xã hội, nâng cao dân trí, hỗ trợ học sinh vùng khó khăn và thực hiện bình đẳng cơ hội học tập.',
          },
          {
            func: '3. Chức năng văn hóa – xã hội',
            content:
              'Bảo tồn, chọn lọc và truyền bá các giá trị văn hóa dân tộc và nhân loại từ thế hệ trước sang thế hệ sau; nâng cao trình độ văn hóa, lối sống văn minh và sáng tạo giá trị văn hóa mới.',
            requirement:
              'Xây dựng văn hóa học đường lành mạnh, phát triển xã hội học tập, giữ gìn bản sắc văn hóa Việt Nam trong quá trình hội nhập quốc tế.',
          },
        ],
        footerNote: 'Nguồn: Giáo trình Giáo dục học HCMUE, Chương 2, Mục 2.1.3, tr. 15–17.',
      }),
    ),

    // PHẦN III: VAI TRÒ CHỦ ĐẠO CỦA GIÁO DỤC ĐỐI VỚI SỰ PHÁT TRIỂN CÁ NHÂN (TR. 17–20)
    createElement(
      'section',
      { id: '3-vai-tro-chu-dao-cua-giao-duc', className: 'space-y-4' },
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
          '3. Vai trò chủ đạo của giáo dục đối với sự phát triển cá nhân (Giáo trình HCMUE tr. 17–20)',
        ),
      ),
      createElement(ScholarQuote, {
        quote: 'Hiền dữ phải đâu là tính sẵn, phần nhiều do giáo dục mà nên.',
        author: 'Chủ tịch Hồ Chí Minh (1890 – 1969)',
        title: 'Anh hùng giải phóng dân tộc · Danh nhân văn hóa thế giới',
        source: 'Nhật ký trong tù (1943) — Giáo trình Giáo dục học HCMUE tr. 19',
        historicalContext:
          'Luận điểm bác bỏ quan niệm định mệnh duy tâm về bẩm sinh, khẳng định sức mạnh cải biến và định hướng chủ đạo của giáo dục đối với sự hình thành nhân cách con người.',
      }),
      createElement(
        'p',
        null,
        'Sự hình thành và phát triển nhân cách cá nhân chịu sự tác động tổng hợp của ',
        createElement('strong', null, '4 yếu tố'),
        ': (1) Bẩm sinh – di truyền; (2) Môi trường sống; (3) Giáo dục; và (4) Hoạt động cá nhân. Trong hệ thống đó, ',
        createElement('strong', null, 'Giáo dục giữ vai trò chủ đạo'),
        '.',
        createElement(
          Sidenote,
          { type: 'caution', number: 2 },
          'Bẫy sư phạm: Tuyệt đối không đồng nhất "vai trò chủ đạo của giáo dục" với "vai trò quyết định trực tiếp của hoạt động cá nhân". Mọi tác động giáo dục chỉ phát huy hiệu quả khi thông qua sự tự giác hoạt động và tự giáo dục của học sinh.',
        ),
      ),

      createElement(ComparativeTable, {
        title:
          'Bảng Đối sánh Mối quan hệ Biện chứng giữa 4 Yếu tố đối với Sự phát triển Nhân cách (Tr. 17–20)',
        subtitle:
          'Định vị chính xác vai trò của từng yếu tố và kết luận sư phạm tương ứng theo Giáo trình Giáo dục học HCMUE.',
        badge: '4 Yếu tố Phát triển Nhân cách',
        columns: [
          { key: 'factor', header: 'Yếu tố tác động', widthClass: 'w-1/5' },
          { key: 'role', header: 'Vai trò định vị chuẩn', widthClass: 'w-1/5' },
          { key: 'mechanism', header: 'Cơ chế tác động đến sự phát triển cá nhân' },
          { key: 'pedagogy', header: 'Kết luận sư phạm đối với người giáo viên' },
        ],
        rows: [
          {
            factor: '1. Bẩm sinh – Di truyền',
            role: 'Tiền đề vật chất (Điều kiện cần)',
            mechanism:
              'Tạo ra sức sống tự nhiên và những tư chất giải phẫu – sinh lí làm tiền đề cho sự phát triển; không quy định sẵn nhân cách hay giới hạn trình độ phát triển.',
            pedagogy:
              'Phát hiện sớm tư chất, năng khiếu của học sinh để bồi dưỡng; không định kiến trước những hạn chế bẩm sinh của người học.',
          },
          {
            factor: '2. Môi trường (Tự nhiên & Xã hội)',
            role: 'Điều kiện, phương tiện phát triển',
            mechanism:
              'Môi trường xã hội (gia đình, cộng đồng, văn hóa, truyền thông) cung cấp nội dung, điều kiện cho sự giao lưu; tuy nhiên tác động của môi trường thường mang tính tự phát.',
            pedagogy:
              'Gắn giáo dục nhà trường với thực tiễn xã hội; giúp học sinh có "sức đề kháng" trước các ảnh hưởng tiêu cực từ môi trường và mạng xã hội.',
          },
          {
            factor: '3. Giáo dục (Nhà trường)',
            role: 'Vai trò CHỦ ĐẠO',
            mechanism:
              'Định hướng mục tiêu phát triển; tổ chức có kế hoạch, phương pháp khoa học; phát huy tối đa tư chất di truyền, cải biến ảnh hưởng môi trường và uốn nắn các phẩm chất lệch lạc.',
            pedagogy:
              'Không ngừng nâng cao chất lượng dạy học – giáo dục, cá biệt hóa tác động sư phạm và phối hợp Nhà trường – Gia đình – Xã hội.',
          },
          {
            factor: '4. Hoạt động cá nhân (và giao tiếp)',
            role: 'Vai trò QUYẾT ĐỊNH TRỰC TIẾP',
            mechanism:
              'Thông qua hoạt động và giao tiếp tự giác, cá nhân chuyển hóa các yêu cầu, giá trị xã hội từ bên ngoài vào bên trong thành phẩm chất và năng lực của chính mình (tự giáo dục).',
            pedagogy:
              'Tổ chức đa dạng các hoạt động học tập, trải nghiệm sáng tạo để phát huy tính tích cực, tự chủ và năng lực tự giáo dục của học sinh.',
          },
        ],
        footerNote: 'Nguồn: Giáo trình Giáo dục học HCMUE, Chương 2, Mục 2.1.4, tr. 17–20.',
      }),

      createElement(LegalReferenceBox, {
        lawTitle: 'Luật Giáo dục 2019 (Luật số 43/2019/QH14)',
        article: 'Điều 5. Yêu cầu về nội dung, phương pháp giáo dục',
        quote:
          'Nội dung giáo dục phải bảo đảm tính cơ bản, toàn diện, thiết thực, hiện đại, có hệ thống và được cập nhật thường xuyên; coi trọng giáo dục tư tưởng, phẩm chất đạo đức và ý thức công dân; kế thừa và phát huy truyền thống tốt đẹp, bản sắc văn hóa dân tộc, tiếp thu tinh hoa văn hóa nhân loại; phù hợp với sự phát triển về thể chất, trí tuệ, tâm sinh lý lứa tuổi và khả năng của người học.',
        source: 'Luật số 43/2019/QH14 (Giáo trình HCMUE tr. 19–20)',
        significance:
          'Khẳng định nguyên tắc phát huy vai trò chủ đạo của giáo dục phải luôn gắn liền với việc tôn trọng khả năng cá nhân và phát huy tính tích cực của người học.',
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
          '4. Tình huống Thực hành 5 Bước: Vai trò chủ đạo của giáo dục đối với sự phát triển nhân cách',
        ),
      ),
      createElement(CaseStudyBox, { caseStudy: caseStudy2_1, defaultOpenSolution: false }),
    ),
  );
};

// ============================================================================
// 2. COMPONENT BÀI 2.2: GIÁO DỤC HỌC LÀ MỘT KHOA HỌC VỀ GIÁO DỤC CON NGƯỜI (TR. 20–24)
// ============================================================================

export const Lesson2_2View: FC = () => {
  const caseStudy2_2: PedagogicalCaseStudy = {
    id: 202,
    title:
      'Đổi mới phương pháp giáo dục nhưng tách rời các thành tố cấu trúc của quá trình sư phạm',
    context:
      'Một nhóm sinh viên kiến tập sư phạm thiết kế hoạt động giáo dục chuyên đề "Tư duy tài chính thông minh" cho học sinh lớp 7. Nhóm thiết kế trò chơi rất sôi động (Phương pháp/Hình thức), nhưng cuối buổi học sinh chỉ nhớ phần thưởng trò chơi mà không rút ra được bài học gì về cách lập kế hoạch chi tiêu cá nhân (Mục tiêu & Kết quả), cũng không có phiếu đánh giá mức độ nhận thức của học sinh.',
    question:
      'Vận dụng lý luận về đối tượng nghiên cứu của Giáo dục học và tính hệ thống của 7 thành tố cấu trúc quá trình giáo dục (Giáo trình HCMUE tr. 21–23), anh/chị hãy phân tích và giải quyết tình huống theo quy trình 5 bước.',
    principlesApplied: [
      'Cấu trúc hệ thống 7 thành tố của quá trình giáo dục tổng thể (Giáo trình tr. 21–22)',
      'Nguyên tắc đảm bảo tính mục đích trong hoạt động giáo dục',
      'Phương pháp nghiên cứu thực tiễn (Tổng kết kinh nghiệm & Nghiên cứu sản phẩm hoạt động)',
    ],
    solutionSteps: [
      {
        step: 1,
        title: 'Bước 1: Nhận diện sự việc và xác định vấn đề cần giải quyết',
        content:
          'Hoạt động giáo dục rơi vào tình trạng "vui chơi hình thức": thành tố Phương pháp và Hình thức tổ chức bị tách rời khỏi thành tố Mục đích/Mục tiêu, Nội dung cốt lõi và Đánh giá kết quả giáo dục.',
      },
      {
        step: 2,
        title: 'Bước 2: Thu thập thông tin và phân tích nguyên nhân theo cấu trúc 7 thành tố',
        content:
          'Theo Giáo trình HCMUE (tr. 21–22), quá trình giáo dục là một hệ thống toàn vẹn gồm 7 thành tố có quan hệ hữu cơ. Khi sinh viên chỉ đầu tư vào trò chơi bề nổi mà không neo chặt vào Mục tiêu cần đạt và bước Kết luận – Đánh giá, quá trình chuyển hóa nhận thức ở học sinh (Người được giáo dục) không diễn ra trọn vẹn.',
      },
      {
        step: 3,
        title: 'Bước 3: Đề xuất các phương án giải quyết khả thi',
        content:
          'Phương án 1: Bỏ hẳn trò chơi, chuyển sang đọc chép lý thuyết (làm mất hứng thú). Phương án 2: Cải tiến cấu trúc kế hoạch theo đúng mối liên hệ giữa 7 thành tố: xác định rõ mục tiêu đầu ra, lồng ghép nội dung chi tiêu vào luật chơi và bổ sung phiếu phản tư – đánh giá cuối hoạt động.',
      },
      {
        step: 4,
        title: 'Bước 4: Lựa chọn phương án tối ưu và tổ chức thực hiện tác động sư phạm',
        content:
          'Hướng dẫn nhóm sinh viên điều chỉnh kịch bản: sau mỗi vòng chơi, giáo viên (Nhà giáo dục) đặt câu hỏi thảo luận để học sinh (Người được giáo dục) tự rút ra quy tắc tài chính và lập bảng kế hoạch tiết kiệm tuần (Kết quả giáo dục).',
      },
      {
        step: 5,
        title: 'Bước 5: Đánh giá kết quả, theo dõi hỗ trợ và rút kinh nghiệm sư phạm',
        content:
          'Sử dụng phương pháp nghiên cứu sản phẩm hoạt động (phiếu kế hoạch chi tiêu của học sinh) và phương pháp quan sát sư phạm để kiểm chứng mức độ đạt mục tiêu của chuyên đề.',
      },
    ],
    pitfallsToAvoid: [
      'Tuyệt đối hóa một thành tố đơn lẻ (chỉ chạy theo phương pháp/trò chơi bắt mắt) mà làm đứt gãy mối liên hệ với mục tiêu và nội dung giáo dục.',
      'Bỏ qua khâu kiểm tra, đánh giá và phản hồi kết quả giáo dục cuối hoạt động.',
    ],
    coreLesson:
      'Quá trình giáo dục là một chỉnh thể hệ thống gồm 7 thành tố; trong đó Mục tiêu giữ vai trò định hướng, Nội dung là chất liệu, Phương pháp – Hình thức là con đường, và sự tương tác giữa Nhà giáo dục với Người được giáo dục quyết định Kết quả giáo dục.',
  };

  return createElement(
    'div',
    { className: 'space-y-8 text-[#29383D] leading-relaxed' },

    // 1. THANH METADATA & ĐỐI CHIẾU ĐẦU BÀI
    createElement(PedagogyMetadataBar, {
      courseCode: 'EDUC2802',
      clos: ['CLO1', 'CLO3'],
      textbookPages: 'Tr. 20–24 (Chương 2, Mục 2.2)',
      legalRefs: [
        'Giáo trình Giáo dục học HCMUE (Tr. 20–24)',
        'Tài liệu Phương pháp nghiên cứu khoa học Giáo dục học',
      ],
      sessionNote: 'Lý thuyết & Thảo luận Chương 2',
    }),

    // PHẦN I: LỊCH SỬ HÌNH THÀNH & ĐỐI TƯỢNG NGHIÊN CỨU — 7 THÀNH TỐ (TR. 20–22)
    createElement(
      'section',
      { id: '1-doi-tuong-va-7-thanh-to', className: 'space-y-4' },
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
          '1. Lịch sử hình thành, đối tượng nghiên cứu và 7 thành tố của quá trình giáo dục (Tr. 20–22)',
        ),
      ),
      createElement(
        'p',
        null,
        'Các tư tưởng giáo dục ban đầu nằm trong lòng Triết học (Khổng Tử ở phương Đông; Socrates, Plato, Aristotle ở phương Tây). Đến thế kỷ XVII, với sự ra đời của tác phẩm ',
        createElement('em', null, 'Didactica Magna (Đại lý luận dạy học, 1632)'),
        ' của nhà giáo dục học Tiệp Khắc ',
        createElement('strong', null, 'J. A. Cômenxki (1592–1670)'),
        ', Giáo dục học chính thức tách ra trở thành một ngành khoa học độc lập.',
        createElement(
          Sidenote,
          { type: 'history', number: 1 },
          'J. A. Cômenxki là người đầu tiên xây dựng hệ thống lý luận về "Chế độ lớp – bài", năm học, kỳ nghỉ và các nguyên tắc dạy học trực quan mà các trường phổ thông trên toàn thế giới vẫn đang kế thừa.',
        ),
      ),
      createElement(
        'p',
        null,
        'Theo Giáo trình Giáo dục học HCMUE (tr. 21–22), ',
        createElement(
          'strong',
          null,
          'đối tượng nghiên cứu của Giáo dục học là hoạt động giáo dục tổng thể (quá trình sư phạm tổng thể)',
        ),
        ' được tổ chức có mục đích trong nhà trường và xã hội. Quá trình này vận hành như một hệ thống toàn vẹn gồm ',
        createElement('strong', null, '7 thành tố cấu trúc cơ bản'),
        ':',
      ),

      createElement(NumberedProcessFlow, {
        title: 'Hệ thống 7 Thành tố Cấu trúc của Quá trình Giáo dục Tổng thể',
        subtitle:
          'Mô hình cấu trúc hệ thống của hoạt động giáo dục tổng thể thuộc đối tượng nghiên cứu của Giáo dục học (Giáo trình HCMUE tr. 21–22).',
        badge: '7 Thành tố Quá trình Giáo dục',
        columns: 2,
        steps: [
          {
            number: 1,
            title: 'Mục đích và mục tiêu giáo dục',
            description:
              'Dự kiến trước kết quả cần đạt về phẩm chất và năng lực nhân cách người học; giữ vai trò định hướng toàn bộ quá trình giáo dục.',
            keyAction: 'Trả lời câu hỏi: Giáo dục nhằm đào tạo ra mẫu người như thế nào?',
          },
          {
            number: 2,
            title: 'Nội dung giáo dục',
            description:
              'Hệ thống tri thức khoa học, kỹ năng, chuẩn mực đạo đức, giá trị văn hóa và kinh nghiệm hoạt động sáng tạo được chọn lọc đưa vào chương trình.',
            keyAction: 'Trả lời câu hỏi: Dạy và giáo dục cho người học những gì?',
          },
          {
            number: 3,
            title: 'Phương pháp và phương tiện giáo dục',
            description:
              'Hệ thống cách thức hoạt động phối hợp giữa nhà giáo dục và người được giáo dục cùng các công cụ vật chất, công nghệ hỗ trợ.',
            keyAction: 'Trả lời câu hỏi: Giáo dục bằng cách nào và bằng phương tiện gì?',
          },
          {
            number: 4,
            title: 'Hình thức tổ chức giáo dục',
            description:
              'Cách thức sắp xếp không gian, thời gian và quy mô tổ chức hoạt động (lớp – bài, hoạt động câu lạc bộ, tham quan, dự án, sinh hoạt tập thể).',
            keyAction:
              'Trả lời câu hỏi: Tổ chức hoạt động giáo dục trong không gian, thời gian nào?',
          },
          {
            number: 5,
            title: 'Nhà giáo dục (Giáo viên & các lực lượng giáo dục)',
            description:
              'Chủ thể giữ vai trò tổ chức, định hướng, dẫn dắt, cố vấn và điều khiển quá trình sư phạm bằng chuyên môn và nhân cách mẫu mực.',
            keyAction: 'Giữ vai trò chủ đạo trong việc thiết kế và điều phối hoạt động giáo dục.',
          },
          {
            number: 6,
            title: 'Người được giáo dục (Học sinh)',
            description:
              'Vừa là đối tượng tiếp nhận tác động sư phạm, vừa là chủ thể tự giác nhận thức, trải nghiệm và tự giáo dục để hoàn thiện nhân cách.',
            keyAction: 'Giữ vai trò chủ động, tích cực quyết định trực tiếp kết quả rèn luyện.',
          },
          {
            number: 7,
            title: 'Kết quả giáo dục (Đầu ra & Kiểm tra đánh giá)',
            description:
              'Mức độ hình thành phẩm chất và năng lực thực tế ở người học so với mục tiêu đề ra; cung cấp thông tin phản hồi để điều chỉnh toàn hệ thống.',
            keyAction: 'Đánh giá thường xuyên và định kỳ vì sự tiến bộ của học sinh.',
          },
        ],
      }),
    ),

    // PHẦN II: NHIỆM VỤ & 3 NHÓM PHƯƠNG PHÁP NGHIÊN CỨU GIÁO DỤC HỌC (TR. 22–24)
    createElement(
      'section',
      { id: '2-nhiem-vu-va-phuong-phap-nghien-cuu', className: 'space-y-4' },
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
          '2. Nhiệm vụ và 3 nhóm phương pháp nghiên cứu Giáo dục học (Giáo trình HCMUE tr. 22–24)',
        ),
      ),
      createElement(
        'p',
        null,
        'Để phát hiện bản chất và quy luật của quá trình giáo dục, Giáo dục học sử dụng hệ thống phương pháp luận duy vật biện chứng kết hợp với ',
        createElement('strong', null, '3 nhóm phương pháp nghiên cứu khoa học cụ thể'),
        ' (Giáo trình HCMUE tr. 23–24):',
      ),

      createElement(ComparativeTable, {
        title: 'Bảng Phân loại 3 Nhóm Phương pháp Nghiên cứu Khoa học Giáo dục học (Tr. 23–24)',
        subtitle:
          'Hệ thống các phương pháp thu thập, phân tích và xử lí dữ liệu trong nghiên cứu Giáo dục học.',
        badge: '3 Nhóm Phương pháp Nghiên cứu',
        columns: [
          { key: 'group', header: 'Nhóm phương pháp', widthClass: 'w-1/4' },
          { key: 'methods', header: 'Các phương pháp thành phần' },
          { key: 'purpose', header: 'Mục đích & Yêu cầu vận dụng trong nghiên cứu sư phạm' },
        ],
        rows: [
          {
            group: '1. Nhóm phương pháp nghiên cứu lý luận',
            methods:
              'Phân tích và tổng hợp lý thuyết; Phân loại và hệ thống hóa tài liệu; Mô hình hóa; Nghiên cứu lịch sử giáo dục.',
            purpose:
              'Tổng quan cơ sở lý luận từ sách chuyên khảo, văn bản pháp quy, công trình khoa học trong và ngoài nước để xây dựng khung khái niệm và giả thuyết khoa học.',
          },
          {
            group: '2. Nhóm phương pháp nghiên cứu thực tiễn',
            methods:
              'Quan sát sư phạm; Điều tra giáo dục (bằng bảng hỏi Anket, phỏng vấn, trắc nghiệm); Tổng kết kinh nghiệm giáo dục; Thực nghiệm sư phạm; Nghiên cứu sản phẩm hoạt động của học sinh; Phương pháp chuyên gia.',
            purpose:
              'Khảo sát thực trạng hoạt động dạy học – giáo dục tại trường phổ thông và kiểm chứng tính khả thi, hiệu quả của các biện pháp tác động sư phạm mới.',
          },
          {
            group: '3. Nhóm phương pháp toán học (Thống kê toán học)',
            methods:
              'Thống kê mô tả (tần số, tỉ lệ %, điểm trung bình, độ lệch chuẩn); Kiểm định giả thuyết thống kê (T-test, tương quan, phân tích phương sai) và phần mềm xử lí dữ liệu.',
            purpose:
              'Định lượng hóa kết quả điều tra và thực nghiệm sư phạm, đảm bảo tính khách quan, độ tin cậy và giá trị khoa học của các kết luận nghiên cứu.',
          },
        ],
        footerNote: 'Nguồn: Giáo trình Giáo dục học HCMUE, Chương 2, Mục 2.2.3, tr. 23–24.',
      }),

      createElement(LegalReferenceBox, {
        lawTitle: 'Luật Giáo dục 2019 (Luật số 43/2019/QH14)',
        article: 'Điều 18. Hoạt động khoa học và công nghệ trong giáo dục',
        quote:
          'Nhà nước tạo điều kiện cho cơ sở giáo dục tổ chức nghiên cứu, ứng dụng, phổ biến tiến bộ khoa học và công nghệ; kết hợp đào tạo với nghiên cứu khoa học và sản xuất nhằm nâng cao chất lượng giáo dục.',
        source: 'Luật số 43/2019/QH14',
        significance:
          'Khuyến khích giảng viên, giáo viên phổ thông và sinh viên sư phạm thực hiện nghiên cứu khoa học giáo dục và nghiên cứu khoa học sư phạm ứng dụng.',
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
          '3. Tình huống Thực hành 5 Bước: Tính hệ thống của 7 thành tố quá trình giáo dục',
        ),
      ),
      createElement(CaseStudyBox, { caseStudy: caseStudy2_2, defaultOpenSolution: false }),
    ),
  );
};

// ============================================================================
// 3. COMPONENT BÀI 2.3: MỤC ĐÍCH VÀ NGUYÊN LÍ GIÁO DỤC VIỆT NAM (TR. 25–30)
// ============================================================================

export const Lesson2_3View: FC = () => {
  const caseStudy2_3: PedagogicalCaseStudy = {
    id: 203,
    title: 'Dạy học nặng về luyện giải đề mẹo mực, tách rời thực hành và đời sống thực tiễn',
    context:
      'Tại lớp 11A, thầy T. khi dạy chủ đề Cấp số nhân và Hàm số mũ chỉ tập trung cho học sinh chép các công thức giải nhanh để khoanh trắc nghiệm. Khi một học sinh hỏi: "Thưa thầy, kiến thức này ứng dụng như thế nào trong tính lãi suất ngân hàng hay sự tăng trưởng quần thể sinh học ạ?", thầy T. gạt đi: "Các em không cần quan tâm thực tế làm gì cho mất thời gian, cứ thuộc lòng công thức bấm máy tính để thi đạt điểm cao là được."',
    question:
      'Đối chiếu với Mục đích giáo dục và Nguyên lí giáo dục Việt Nam theo Điều 2, Điều 3 Luật Giáo dục 2019 (Giáo trình HCMUE tr. 25–30), anh/chị hãy phân tích và giải quyết tình huống theo quy trình 5 bước.',
    principlesApplied: [
      'Nguyên lí giáo dục Việt Nam (Điều 3 Luật Giáo dục 2019): Học đi đôi với hành, lý luận gắn liền với thực tiễn',
      'Mục đích giáo dục cấp độ cá nhân: Phát triển phẩm chất và năng lực vận dụng kiến thức vào thực tiễn (CT GDPT 2018)',
      'Nguyên tắc hoạt động giáo dục gắn với đời sống, với thực tiễn xã hội',
    ],
    solutionSteps: [
      {
        step: 1,
        title: 'Bước 1: Nhận diện sự việc và xác định vấn đề cần giải quyết',
        content:
          'Thầy T. đang dạy học theo lối ứng thí máy móc, vi phạm trực tiếp nguyên lí "Học đi đôi với hành, lý luận gắn liền với thực tiễn" và làm triệt tiêu hứng thú khám phá khoa học của học sinh.',
      },
      {
        step: 2,
        title: 'Bước 2: Thu thập thông tin và phân tích nguyên nhân theo Luật Giáo dục 2019',
        content:
          'Theo Điều 3 Luật Giáo dục 2019 và Giáo trình HCMUE (tr. 28–30), mục đích của giáo dục phổ thông hiện đại không phải là nhồi nhét mẹo làm bài mà là hình thành năng lực giải quyết vấn đề thực tiễn. Câu hỏi của học sinh về lãi suất kép và tăng trưởng sinh học chính là cơ hội quý giá để kết nối Toán học với đời sống.',
      },
      {
        step: 3,
        title: 'Bước 3: Đề xuất các phương án giải quyết khả thi',
        content:
          'Phương án 1: Tiếp tục phớt lờ câu hỏi ứng dụng để chạy kịp tiến độ luyện đề (sai lệch nguyên lí giáo dục). Phương án 2: Biểu dương câu hỏi của học sinh và thiết kế bài toán thực tiễn về lãi suất ngân hàng / mô hình tăng trưởng để học sinh tự thiết lập công thức từ bản chất toán học.',
      },
      {
        step: 4,
        title: 'Bước 4: Lựa chọn phương án tối ưu và tổ chức thực hiện tác động sư phạm',
        content:
          'Giáo viên khen ngợi tư duy liên hệ thực tế của học sinh, dành 10 phút hướng dẫn cả lớp giải bài toán lãi kép thực tế và giao dự án nhỏ tìm hiểu ứng dụng hàm số mũ trong đời sống.',
      },
      {
        step: 5,
        title: 'Bước 5: Đánh giá kết quả, theo dõi hỗ trợ và rút kinh nghiệm sư phạm',
        content:
          'Đánh giá năng lực mô hình hóa toán học của học sinh qua sản phẩm dự án; điều chỉnh kế hoạch bài dạy của tổ chuyên môn theo đúng tinh thần Chương trình GDPT 2018.',
      },
    ],
    pitfallsToAvoid: [
      'Biến giờ học thành giờ luyện mẹo bấm máy tính tách rời bản chất khoa học và ứng dụng thực tiễn.',
      'Dập tắt sự tò mò, câu hỏi liên hệ thực tế của học sinh vì áp lực điểm số ngắn hạn.',
    ],
    coreLesson:
      'Thực hiện nguyên lí "Học đi đôi với hành, lý luận gắn liền với thực tiễn" là con đường tất yếu để chuyển hóa tri thức sách vở thành năng lực hành động sống động của người học.',
  };

  return createElement(
    'div',
    { className: 'space-y-8 text-[#29383D] leading-relaxed' },

    // 1. THANH METADATA & ĐỐI CHIẾU ĐẦU BÀI
    createElement(PedagogyMetadataBar, {
      courseCode: 'EDUC2802',
      clos: ['CLO1', 'CLO3'],
      textbookPages: 'Tr. 25–30 (Chương 2, Mục 2.3)',
      legalRefs: [
        'Luật Giáo dục 2019 (Điều 2, Điều 3, Điều 29)',
        'Chương trình GDPT 2018 Tổng thể (TT 32/2018/TT-BGDĐT)',
      ],
      sessionNote: 'Lý thuyết & Thảo luận Chương 2',
    }),

    // PHẦN I: MỤC ĐÍCH GIÁO DỤC VIỆT NAM Ở 2 CẤP ĐỘ (TR. 25–28)
    createElement(
      'section',
      { id: '1-muc-dich-giao-duc-viet-nam', className: 'space-y-4' },
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
          '1. Mục đích giáo dục Việt Nam trên bình diện xã hội (vĩ mô) và cá nhân (Tr. 25–28)',
        ),
      ),
      createElement(
        'p',
        null,
        'Theo Giáo trình Giáo dục học HCMUE (tr. 25), ',
        createElement('strong', null, 'mục đích giáo dục'),
        ' là mô hình dự kiến về nhân cách con người (sản phẩm của giáo dục) đáp ứng yêu cầu phát triển của xã hội trong một giai đoạn lịch sử nhất định. Ở Việt Nam, mục đích giáo dục được xác định thống nhất trên ',
        createElement(
          'strong',
          null,
          'hai bình diện: bình diện xã hội (vĩ mô) và bình diện cá nhân (nhân cách người học)',
        ),
        '.',
        createElement(
          Sidenote,
          { type: 'pedagogy', number: 1 },
          'Phân biệt thuật ngữ (Giáo trình tr. 25): "Mục đích giáo dục" mang tính chiến lược, khái quát lâu dài ở tầm quốc gia; còn "Mục tiêu giáo dục" là sự cụ thể hóa mục đích giáo dục vào từng cấp học, môn học, bài học và có thể đo lường, đánh giá được.',
        ),
      ),

      createElement(LegalReferenceBox, {
        lawTitle: 'Luật Giáo dục 2019 (Luật số 43/2019/QH14)',
        article: 'Điều 2 (Mục tiêu giáo dục) & Điều 29 (Mục tiêu của giáo dục phổ thông)',
        quote:
          'Điều 2: Mục tiêu giáo dục nhằm phát triển toàn diện con người Việt Nam có đạo đức, tri thức, văn hóa, sức khỏe, thẩm mỹ và nghề nghiệp; có phẩm chất, năng lực và ý thức công dân; có lòng yêu nước, tinh thần dân tộc, trung thành với lý tưởng độc lập dân tộc và chủ nghĩa xã hội; phát huy tiềm năng, khả năng sáng tạo của mỗi cá nhân; nâng cao dân trí, phát triển nguồn nhân lực, bồi dưỡng nhân tài, đáp ứng yêu cầu của sự nghiệp xây dựng, bảo vệ Tổ quốc và hội nhập quốc tế.',
        source: 'Luật Giáo dục số 43/2019/QH14 (Giáo trình HCMUE tr. 26–27)',
        significance:
          'Xác lập chuẩn mực pháp lý cao nhất về mục đích giáo dục tổng quát và mục tiêu giáo dục phổ thông Việt Nam.',
      }),

      createElement(ComparativeTable, {
        title:
          'Bảng Hệ thống hóa Mục đích Giáo dục Việt Nam ở Hai Cấp độ (Giáo trình HCMUE tr. 26–28)',
        subtitle:
          'Sự thống nhất giữa mục tiêu chiến lược phát triển quốc gia và mục tiêu phát triển nhân cách người học.',
        badge: 'Mục đích Giáo dục Việt Nam',
        columns: [
          { key: 'level', header: 'Bình diện / Cấp độ', widthClass: 'w-1/4' },
          { key: 'pillar', header: 'Trụ cột cốt lõi', widthClass: 'w-1/4' },
          {
            key: 'description',
            header: 'Nội dung học thuật & Yêu cầu thực hiện (Giáo trình tr. 26–28)',
          },
        ],
        rows: [
          {
            level: 'Cấp độ Vĩ mô (Bình diện Xã hội)',
            pillar: '1. Nâng cao dân trí',
            description:
              'Phổ cập giáo dục, nâng cao trình độ học vấn, hiểu biết pháp luật, khoa học và văn hóa chung cho toàn dân; tạo nền tảng dân chủ và văn minh xã hội.',
          },
          {
            level: 'Cấp độ Vĩ mô (Bình diện Xã hội)',
            pillar: '2. Đào tạo nhân lực',
            description:
              'Xây dựng đội ngũ lao động có trình độ chuyên môn, kỹ năng nghề nghiệp, tác phong công nghiệp và đạo đức nghề nghiệp phục vụ công nghiệp hóa, hiện đại hóa.',
          },
          {
            level: 'Cấp độ Vĩ mô (Bình diện Xã hội)',
            pillar: '3. Bồi dưỡng nhân tài',
            description:
              'Phát hiện sớm, ươm mầm và phát triển những cá nhân có năng khiếu, trí tuệ xuất sắc và năng lực sáng tạo đột phá trở thành lực lượng tinh hoa dẫn dắt sự phát triển đất nước.',
          },
          {
            level: 'Cấp độ Cá nhân (Nhân cách người học)',
            pillar: '5 Phẩm chất & 10 Năng lực cốt lõi',
            description:
              'Phát triển hài hòa Đức – Trí – Thể – Mỹ; hình thành 5 phẩm chất chủ yếu (Yêu nước, Nhân ái, Chăm chỉ, Trung thực, Trách nhiệm) và 10 năng lực cốt lõi (3 năng lực chung + 7 năng lực đặc thù) theo CT GDPT 2018.',
          },
        ],
        footerNote: 'Nguồn: Giáo trình Giáo dục học HCMUE, Chương 2, Mục 2.3.1, tr. 25–28.',
      }),
    ),

    // PHẦN II: NGUYÊN LÍ GIÁO DỤC VIỆT NAM THEO ĐIỀU 3 LUẬT GIÁO DỤC 2019 (TR. 28–30)
    createElement(
      'section',
      { id: '2-nguyen-li-giao-duc-viet-nam', className: 'space-y-4' },
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
          '2. Nguyên lí giáo dục Việt Nam và 3 nội dung cốt lõi (Giáo trình HCMUE tr. 28–30)',
        ),
      ),
      createElement(
        'p',
        null,
        'Theo Giáo trình Giáo dục học HCMUE (tr. 28), ',
        createElement('strong', null, 'nguyên lí giáo dục'),
        ' là những luận điểm khái quát nhất có tính quy luật của lý luận giáo dục, được xác lập trên cơ sở pháp lý để chỉ đạo toàn bộ phương hướng tổ chức hoạt động giáo dục trong phạm vi cả nước.',
      ),
      createElement(LegalReferenceBox, {
        lawTitle: 'Luật Giáo dục 2019 (Luật số 43/2019/QH14)',
        article: 'Khoản 2 Điều 3. Tính chất, nguyên lý giáo dục',
        quote:
          'Hoạt động giáo dục được thực hiện theo nguyên lý học đi đôi với hành, lý luận gắn liền với thực tiễn, giáo dục nhà trường kết hợp với giáo dục gia đình và giáo dục xã hội.',
        source: 'Luật Giáo dục số 43/2019/QH14 (Giáo trình HCMUE tr. 28)',
        significance:
          'Là kim chỉ nam bắt buộc cho việc xây dựng chương trình, biên soạn sách giáo khoa, đổi mới phương pháp dạy học và tổ chức hoạt động giáo dục.',
      }),

      createElement(NumberedProcessFlow, {
        title: 'Phân tích 3 Nội dung Cốt lõi của Nguyên lí Giáo dục Việt Nam',
        subtitle:
          'Ba phương diện thống nhất quy định con đường hình thành phẩm chất và năng lực người học (Giáo trình HCMUE tr. 28–30).',
        badge: '3 Nội dung Nguyên lí Giáo dục',
        columns: 1,
        steps: [
          {
            number: 1,
            title: 'Học đi đôi với hành',
            description:
              'Học tập lĩnh hội tri thức lý thuyết phải luôn gắn chặt với rèn luyện kỹ năng thực hành, vận dụng. "Học" soi sáng cho "Hành" khỏi mò mẫm; "Hành" kiểm nghiệm, củng cố và làm sâu sắc thêm điều đã "Học".',
            keyAction:
              'Tăng cường thí nghiệm, thực hành, giải quyết bài toán thực tế và trải nghiệm sáng tạo trong từng môn học.',
            deliverable: 'Khắc phục triệt để lối dạy học từ chương, học vẹt, đọc chép thụ động.',
          },
          {
            number: 2,
            title: 'Lý luận gắn liền với thực tiễn',
            description:
              'Mọi nội dung giáo dục trong nhà trường phải bắt nguồn từ thực tiễn đời sống kinh tế – văn hóa – xã hội của đất nước và hướng tới phục vụ sự phát triển của thực tiễn đó.',
            keyAction:
              'Đưa các vấn đề thực tiễn địa phương, sản xuất, bảo vệ môi trường và định hướng nghề nghiệp vào bài giảng.',
            deliverable:
              'Giúp học sinh hiểu rõ ý nghĩa thực tiễn của tri thức khoa học và phát triển năng lực thích ứng cuộc sống.',
          },
          {
            number: 3,
            title: 'Giáo dục nhà trường kết hợp với giáo dục gia đình và giáo dục xã hội',
            description:
              'Sự hình thành nhân cách học sinh diễn ra trong nhiều môi trường. Giáo dục nhà trường giữ vai trò chủ đạo, định hướng sư phạm để thống nhất mục tiêu, nội dung và phương pháp với gia đình và cộng đồng xã hội.',
            keyAction:
              'Xây dựng cơ chế phối hợp thường xuyên, đồng thuận giữa Giáo viên chủ nhiệm – Cha mẹ học sinh – Đoàn thể và địa phương.',
            deliverable:
              'Tạo lập môi trường giáo dục đồng bộ, lành mạnh, khép kín các khoảng trống quản lí học sinh.',
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
          '3. Tình huống Thực hành 5 Bước: Vận dụng Nguyên lí giáo dục vào dạy học ở trường phổ thông',
        ),
      ),
      createElement(CaseStudyBox, { caseStudy: caseStudy2_3, defaultOpenSolution: false }),
    ),
  );
};

// ============================================================================
// 4. BỘ ĐIỀU PHỐI (MODULE DISPATCHER) CHO CHƯƠNG 2 (EDUC2802)
// ============================================================================

export function getChapter2LessonModule(lessonId: string): CompiledLessonModule | null {
  if (
    lessonId === 'gdh-c2-b1-giao-duc-la-mot-hien-tuong-xa-hoi-dac-biet' ||
    lessonId === 'gdh-c2-b1-ban-chat-va-cac-chuc-nang-xa-hoi-cua-giao-duc'
  ) {
    return {
      default: Lesson2_1View,
      frontmatter: {
        title: 'Bài 2.1: Giáo dục là một hiện tượng xã hội đặc biệt',
        description:
          'Bản chất truyền thụ – lĩnh hội kinh nghiệm lịch sử – xã hội; 4 tính chất cơ bản; 3 chức năng xã hội và vai trò chủ đạo của giáo dục đối với sự phát triển cá nhân (Giáo trình HCMUE tr. 13–20).',
        level: 'basic',
        tags: [
          'CLO1',
          'CLO3',
          'Hiện tượng xã hội đặc biệt',
          '3 Chức năng xã hội',
          'Giáo trình tr. 13-20',
        ],
      },
      lessonMeta: {
        chapterNumber: 2,
        lessonNumber: 1,
        headings: [
          {
            id: '1-ban-chat-va-4-tinh-chat',
            text: '1. Bản chất của hiện tượng giáo dục và 4 tính chất cơ bản (Tr. 13–15)',
            depth: 2,
          },
          {
            id: '2-ba-chuc-nang-xa-hoi',
            text: '2. Ba chức năng xã hội của giáo dục (Tr. 15–17)',
            depth: 2,
          },
          {
            id: '3-vai-tro-chu-dao-cua-giao-duc',
            text: '3. Vai trò chủ đạo của giáo dục đối với sự phát triển cá nhân (Tr. 17–20)',
            depth: 2,
          },
          {
            id: '4-tinh-huong-thuc-hanh',
            text: '4. Tình huống Thực hành 5 Bước: Vai trò chủ đạo của giáo dục',
            depth: 2,
          },
        ],
        blocks: [],
      },
    };
  }

  if (
    lessonId === 'gdh-c2-b2-giao-duc-hoc-la-mot-khoa-hoc-ve-giao-duc-con-nguoi' ||
    lessonId === 'gdh-c2-b2-giao-duc-va-su-phat-trien-nhan-cach'
  ) {
    return {
      default: Lesson2_2View,
      frontmatter: {
        title: 'Bài 2.2: Giáo dục học là một khoa học về giáo dục con người',
        description:
          'Lịch sử hình thành; đối tượng nghiên cứu là hoạt động giáo dục tổng thể và 7 thành tố; nhiệm vụ và 3 nhóm phương pháp nghiên cứu (Giáo trình HCMUE tr. 20–24).',
        level: 'intermediate',
        tags: ['CLO1', 'CLO3', 'Khoa học Giáo dục học', '7 Thành tố', 'Giáo trình tr. 20-24'],
      },
      lessonMeta: {
        chapterNumber: 2,
        lessonNumber: 2,
        headings: [
          {
            id: '1-doi-tuong-va-7-thanh-to',
            text: '1. Lịch sử hình thành, đối tượng nghiên cứu và 7 thành tố (Tr. 20–22)',
            depth: 2,
          },
          {
            id: '2-nhiem-vu-va-phuong-phap-nghien-cuu',
            text: '2. Nhiệm vụ và 3 nhóm phương pháp nghiên cứu Giáo dục học (Tr. 22–24)',
            depth: 2,
          },
          {
            id: '3-tinh-huong-thuc-hanh',
            text: '3. Tình huống Thực hành 5 Bước: Tính hệ thống của 7 thành tố',
            depth: 2,
          },
        ],
        blocks: [],
      },
    };
  }

  if (
    lessonId === 'gdh-c2-b3-muc-dich-va-nguyen-li-giao-duc-viet-nam' ||
    lessonId === 'gdh-c2-b3-giao-duc-hoc-la-mot-khoa-hoc-muc-dich-va-nguyen-ly-giao-duc'
  ) {
    return {
      default: Lesson2_3View,
      frontmatter: {
        title: 'Bài 2.3: Mục đích và nguyên lí giáo dục Việt Nam',
        description:
          'Mục đích vĩ mô (Dân trí – Nhân lực – Nhân tài) và cá nhân (Phẩm chất & Năng lực theo Luật GD 2019 và CT GDPT 2018); 3 nội dung Nguyên lí giáo dục (Giáo trình HCMUE tr. 25–30).',
        level: 'basic',
        tags: ['CLO1', 'CLO3', 'Mục đích giáo dục', 'Nguyên lí giáo dục', 'Giáo trình tr. 25-30'],
      },
      lessonMeta: {
        chapterNumber: 2,
        lessonNumber: 3,
        headings: [
          {
            id: '1-muc-dich-giao-duc-viet-nam',
            text: '1. Mục đích giáo dục Việt Nam ở bình diện xã hội và cá nhân (Tr. 25–28)',
            depth: 2,
          },
          {
            id: '2-nguyen-li-giao-duc-viet-nam',
            text: '2. Nguyên lí giáo dục Việt Nam và 3 nội dung cốt lõi (Tr. 28–30)',
            depth: 2,
          },
          {
            id: '3-tinh-huong-thuc-hanh',
            text: '3. Tình huống Thực hành 5 Bước: Vận dụng Nguyên lí giáo dục',
            depth: 2,
          },
        ],
        blocks: [],
      },
    };
  }

  return null;
}
