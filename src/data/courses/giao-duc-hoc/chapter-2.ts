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
// 1. COMPONENT BÀI 2.1: GIÁO DỤC LÀ MỘT HIỆN TƯỢNG XÃ HỘI ĐẶC BIỆT (TR. 13–20)
// ============================================================================

export const Lesson2_1View: FC = () => {
  const caseStudy2_1: PedagogicalCaseStudy = {
    id: 201,
    title:
      'Phụ huynh học sinh lớp 8 phó mặc buôn bán bận rộn, khoán trắng cho nhà trường và cho rằng số phận quy định',
    context:
      'Một phụ huynh học sinh lớp 8 đến gặp giáo viên chủ nhiệm với tâm lý phó mặc: "Gia đình tôi buôn bán bận rộn, gửi gắm cháu hoàn toàn cho nhà trường, thầy cô dạy bảo sao cho nên người, học dở hay hư hỏng là do số phận cháu nó quy định rồi".',
    question:
      'Vận dụng lý luận về bản chất hiện tượng giáo dục, 3 quan điểm phát triển nhân cách và vai trò chủ đạo của giáo dục trong mối quan hệ với di truyền, môi trường gia đình và hoạt động cá nhân (Giáo trình HCMUE tr. 13–20), anh/chị hãy xử lý tình huống theo quy trình 5 bước.',
    principlesApplied: [
      'Nguyên lý giáo dục: Giáo dục nhà trường kết hợp với giáo dục gia đình và giáo dục xã hội (Điều 3, Luật Giáo dục 2019)',
      'Quan điểm Duy vật Biện chứng: Giáo dục giữ VAI TRÒ CHỦ ĐẠO trong mối tương tác với di truyền (tiền đề vật chất), môi trường (điều kiện) và hoạt động cá nhân (quyết định trực tiếp)',
      'Nguyên tắc tôn trọng nhân cách học sinh kết hợp với yêu cầu hợp lý',
    ],
    solutionSteps: [
      {
        step: 1,
        title: 'Bước 1 (Phân tích dữ kiện)',
        content:
          'Phụ huynh có quan niệm sai lệch mang tính "thuyết tiền định" (cho rằng số phận, bẩm sinh đã an bài tính cách và học lực) kết hợp với tâm lý khoán trắng cho nhà trường (thuyết duy cảm, xem giáo dục là vạn năng một chiều).',
      },
      {
        step: 2,
        title: 'Bước 2 (Biểu đạt vấn đề)',
        content:
          'Mâu thuẫn giữa yêu cầu phối hợp đồng bộ ba môi trường giáo dục (Nhà trường – Gia đình – Xã hội) và sự buông lỏng trách nhiệm đồng hành từ phía gia đình; nguy cơ học sinh thiếu điểm tựa tình cảm và buông xuôi nỗ lực cá nhân.',
      },
      {
        step: 3,
        title: 'Bước 3 (Giả thuyết phương án)',
        content:
          'Tránh chỉ trích phụ huynh gay gắt (gây tâm lý tự ái, đối kháng). Chọn giải pháp đàm thoại sư phạm: Giải thích khoa học về vai trò nền tảng của gia đình, chia sẻ tiến bộ cụ thể của học sinh tại lớp để củng cố niềm tin, và thống nhất kênh liên lạc định kỳ tiện lợi nhất cho lịch buôn bán.',
      },
      {
        step: 4,
        title: 'Bước 4 (Chứng minh cơ sở khoa học)',
        content:
          'Căn cứ nguyên lý giáo dục "kết hợp nhà trường, gia đình và xã hội" và luận điểm khoa học: giáo dục giữ vai trò chủ đạo nhưng cần sự hợp tác của môi trường gia đình để khích lệ, phát huy tính tích cực hoạt động của học sinh (nhân tố quyết định trực tiếp).',
      },
      {
        step: 5,
        title: 'Bước 5 (Kết luận sư phạm)',
        content:
          'Giáo viên không chỉ giáo dục học sinh mà còn phải là nhà tham vấn, tuyên truyền giáo dục thuyết phục phụ huynh đồng hành.',
      },
    ],
    pitfallsToAvoid: [
      'Chỉ trích gay gắt hoặc đổ lỗi hoàn toàn cho hoàn cảnh buôn bán bận rộn của phụ huynh.',
      'Đồng tình buông xuôi, chấp nhận quan niệm số phận định đoạt việc học của học sinh.',
    ],
    coreLesson:
      'Giáo viên không chỉ dạy học sinh mà còn giữ sứ mệnh tham vấn, thuyết phục gia đình cùng đồng hành, bởi giáo dục nhà trường chỉ phát huy tối đa vai trò chủ đạo khi có sự hợp tác bền chặt từ nền tảng gia đình.',
  };

  return createElement(
    'div',
    { className: 'space-y-8 text-[#29383D] leading-relaxed' },

    // 1. THANH METADATA & ĐỐI CHIẾU ĐẦU BÀI
    createElement(PedagogyMetadataBar, {
      courseCode: 'EDUC2802',
      lessonCode: 'EDUC2802-C2-L1',
      clos: ['CLO1', 'CLO3'],
      textbookPages: 'Giáo trình Giáo dục học HCMUE (Trang 13 – 20)',
      legalRefs: [
        'Luật Giáo dục 2019 (Điều 3, Điều 5)',
        'Giáo trình Giáo dục học HCMUE (Chương 2, Mục 2.1)',
      ],
      sessionNote: 'Mục 2.1 · Trang 13 – 20',
    }),

    // PHẦN I: BẢN CHẤT CỦA HIỆN TƯỢNG GIÁO DỤC (TRANG 13 – 14)
    createElement(
      'section',
      { id: '1-ban-chat-hien-tuong-giao-duc', className: 'space-y-4' },
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
          '1. Bản chất của Hiện tượng Giáo dục: Cơ chế Di sản Xã hội (Trang 13 – 14)',
        ),
      ),
      createElement(
        'div',
        {
          className: 'rounded-2xl border border-[#CFDADB] bg-[#F7FAFA] p-6 shadow-2xs space-y-4',
        },
        createElement(
          'div',
          { className: 'flex flex-wrap items-center justify-between gap-2' },
          createElement(
            'span',
            {
              className:
                'inline-flex items-center rounded-md border border-[#718C7E]/30 bg-[#E8EFEB] px-2.5 py-0.5 font-mono text-xs font-semibold text-[#3F6570]',
            },
            'Hiện tượng Xã hội Đặc biệt · Cơ chế Di sản Xã hội',
          ),
          createElement(
            'span',
            { className: 'font-mono text-xs text-[#55676B]' },
            'Giáo trình HCMUE · Trang 13 – 14',
          ),
        ),
        createElement(
          'div',
          { className: 'grid gap-4 md:grid-cols-3' },
          createElement(
            'div',
            {
              className: 'rounded-xl border border-[#CFDADB] bg-[#EAF0F1]/70 p-4 space-y-2',
            },
            createElement(
              'h4',
              { className: 'font-serif text-base font-bold text-[#29383D]' },
              'Cơ chế di sản xã hội',
            ),
            createElement(
              'p',
              { className: 'text-sm text-[#29383D] leading-relaxed' },
              'Giáo dục là hiện tượng xã hội đặc biệt chỉ có ở xã hội loài người, xuất phát từ nhu cầu tất yếu của sự tiến bộ xã hội nhằm truyền đạt và lĩnh hội kinh nghiệm lịch sử - xã hội tích lũy qua các thế hệ.',
            ),
          ),
          createElement(
            'div',
            {
              className: 'rounded-xl border border-[#CFDADB] bg-[#E8EFEB]/60 p-4 space-y-2',
            },
            createElement(
              'h4',
              { className: 'font-serif text-base font-bold text-[#29383D]' },
              'Tái sản xuất văn hóa',
            ),
            createElement(
              'p',
              { className: 'text-sm text-[#29383D] leading-relaxed' },
              'Không có giáo dục thì không thể có sự chuyển giao tinh hoa văn hóa, văn minh, đạo đức; con người không thể tồn tại và phát triển với tư cách là con người xã hội.',
            ),
          ),
          createElement(
            'div',
            {
              className: 'rounded-xl border border-[#CFDADB] bg-[#EAF0F1]/70 p-4 space-y-2',
            },
            createElement(
              'h4',
              { className: 'font-serif text-base font-bold text-[#29383D]' },
              'Chức năng trọng yếu',
            ),
            createElement(
              'p',
              { className: 'text-sm text-[#29383D] leading-relaxed' },
              'Hình thành và phát triển toàn diện nhân cách con người, chuyển hóa các giá trị văn hóa nhân loại tích lũy từ bên ngoài thành phẩm chất và năng lực bên trong của mỗi cá nhân.',
            ),
          ),
        ),
      ),
      createElement(
        'p',
        null,
        'Khác với bản năng sinh học truyền thụ qua di truyền ở loài vật, thế hệ trẻ loài người chỉ có thể trở thành con người xã hội thực thụ thông qua việc lĩnh hội kho tàng kinh nghiệm lịch sử – xã hội do các thế hệ tiền bối truyền lại.',
        createElement(
          Sidenote,
          { type: 'history', number: 1 },
          'Triết học duy vật lịch sử khẳng định: Con người là tổng hòa các quan hệ xã hội. Thông qua giáo dục, di sản văn hóa xã hội được tái sản xuất liên tục từ thế hệ này sang thế hệ khác.',
        ),
      ),
    ),

    // PHẦN II: BẢNG MA TRẬN 4 TÍNH CHẤT CƠ BẢN CỦA GIÁO DỤC (TRANG 14 – 15)
    createElement(
      'section',
      { id: '2-bon-tinh-chat-co-ban', className: 'space-y-4' },
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
          '2. Bảng Ma trận 4 Tính chất Cơ bản của Giáo dục (Giáo trình HCMUE Trang 14 – 15)',
        ),
      ),
      createElement(
        'p',
        null,
        'Sự vận động và phát triển của giáo dục trong lịch sử nhân loại bị chi phối bởi ',
        createElement('strong', null, '4 tính chất cơ bản'),
        ' phản ánh nguồn gốc, quy luật và bản chất xã hội của nó:',
        createElement(
          Sidenote,
          { type: 'caution', number: 2 },
          'Cảnh báo giáo điều: Tuyệt đối không sao chép nguyên bản mô hình giáo dục của quốc gia này áp đặt cơ học cho quốc gia khác, hoặc của giai đoạn lịch sử này cho giai đoạn lịch sử khác.',
        ),
      ),
      createElement(ComparativeTable, {
        title: 'Bảng Ma trận 4 Tính chất Cơ bản của Giáo dục (Giáo trình HCMUE Trang 14 – 15)',
        subtitle:
          'Hệ thống các quy luật khách quan chi phối sự tồn tại, vận động và đổi mới của hiện tượng giáo dục.',
        badge: '4 Tính chất Cơ bản của Giáo dục',
        columns: [
          { key: 'property', header: 'Tính chất cơ bản', widthClass: 'w-1/4' },
          { key: 'essence', header: 'Bản chất lý luận (Giáo trình HCMUE)' },
          { key: 'manifestation', header: 'Biểu hiện thực tiễn & Ý nghĩa phương pháp luận' },
        ],
        rows: [
          {
            property: '1. Tính phổ biến và vĩnh hằng',
            essence:
              'Giáo dục xuất hiện cùng với sự xuất hiện của xã hội loài người và chỉ mất đi khi xã hội loài người mất đi; tồn tại trong mọi thời kỳ, mọi chế độ kinh tế - xã hội.',
            manifestation:
              'Chừng nào xã hội loài người còn tồn tại và phát triển thì chừng đó giáo dục còn tồn tại như một nhu cầu sinh tồn và tiến hóa tất yếu.',
          },
          {
            property: '2. Tính nhân văn',
            essence:
              'Phản ánh các giá trị chung vì con người, hướng con người tới chân - thiện - mỹ, bảo tồn bản sắc văn hóa dân tộc và hòa nhập với văn minh nhân loại.',
            manifestation:
              'Tôn trọng phẩm giá, phát triển toàn diện tiềm năng của từng cá nhân; loại trừ bạo lực, kỳ thị và áp đặt độc đoán trong giáo dục.',
          },
          {
            property: '3. Tính xã hội - lịch sử',
            essence:
              'Giáo dục chịu sự quy định của trình độ phát triển kinh tế, quan hệ sản xuất và kiến trúc thượng tầng xã hội trong từng giai đoạn; giáo dục biến đổi theo sự biến đổi lịch sử, không nhất thành bất biến.',
            manifestation:
              'Mục đích, nội dung, phương pháp giáo dục luôn vận động để đáp ứng yêu cầu của thời đại mới (như chuyển dịch từ truyền thụ kiến thức sang phát triển phẩm chất, năng lực).',
          },
          {
            property: '4. Tính giai cấp',
            essence:
              'Trong xã hội có giai cấp đối kháng, giáo dục là công cụ duy trì sự thống trị và truyền bá tư tưởng của giai cấp cầm quyền; trong xã hội XHCN, giáo dục mang tính dân chủ, nhân đạo, phục vụ quyền lợi của toàn thể nhân dân lao động.',
            manifestation:
              'Đảm bảo công bằng trong cơ hội tiếp cận giáo dục chất lượng cao cho mọi tầng lớp nhân dân, đặc biệt là vùng sâu, vùng xa và nhóm yếu thế.',
          },
        ],
        footerNote: 'Nguồn đối chiếu: Giáo trình Giáo dục học HCMUE (Chương 2, Trang 14 – 15).',
      }),
    ),

    // PHẦN III: 3 CHỨC NĂNG XÃ HỘI CỦA GIÁO DỤC (TRANG 15 – 17)
    createElement(
      'section',
      { id: '3-ba-chuc-nang-xa-hoi', className: 'space-y-4' },
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
          '3. Ba Chức năng Xã hội của Giáo dục (Phân tích Hệ thống, Trang 15 – 17)',
        ),
      ),
      createElement(
        'p',
        null,
        'Với tư cách là một thiết chế vĩ mô, giáo dục giữ vai trò động lực thúc đẩy sự phát triển toàn diện của xã hội qua ',
        createElement('strong', null, '3 chức năng xã hội cơ bản'),
        ':',
      ),
      createElement(NumberedProcessFlow, {
        title: 'Hệ thống 3 Chức năng Xã hội Vĩ mô của Giáo dục',
        subtitle:
          'Phân tích cơ chế tác động của giáo dục đối với kinh tế, chính trị và văn hóa xã hội (Giáo trình HCMUE Trang 15 – 17).',
        badge: '3 Chức năng Xã hội Vĩ mô',
        columns: 1,
        steps: [
          {
            number: 1,
            title: '01. Chức năng Kinh tế - Sản xuất',
            description:
              'Đào tạo nguồn nhân lực chất lượng cao, tái sản xuất sức lao động xã hội tinh xảo hơn để thay thế sức lao động cũ. Nguồn vốn nhân lực (Human Capital) là nguồn vốn quan trọng nhất, giữ vai trò chủ thể quyết định hiệu quả của các nguồn vốn tài nguyên, vốn vật chất và khoa học công nghệ.',
            keyAction:
              'Đào tạo nhân lực đáp ứng nhu cầu phát triển kinh tế tri thức và công nghiệp hóa, hiện đại hóa.',
            deliverable:
              'Đội ngũ lao động có tay nghề cao, tác phong công nghiệp và năng lực đổi mới sáng tạo.',
          },
          {
            number: 2,
            title: '02. Chức năng Chính trị - Tư tưởng',
            description:
              'Truyền bá đường lối, chủ trương, thế giới quan và hệ tư tưởng của giai cấp lãnh đạo; đào tạo công dân có trách nhiệm bảo vệ và xây dựng chế độ xã hội; nâng cao tính cố kết và đồng thuận xã hội.',
            keyAction:
              'Giáo dục lòng yêu nước, lý tưởng độc lập dân tộc gắn liền với chủ nghĩa xã hội và ý thức thượng tôn pháp luật.',
            deliverable:
              'Thế hệ công dân trung thành với Tổ quốc, có bản lĩnh chính trị và trách nhiệm xã hội cao.',
          },
          {
            number: 3,
            title: '03. Chức năng Văn hóa - Xã hội',
            description:
              'Nâng cao dân trí, bảo tồn và phát triển văn hóa dân tộc; tiếp thu tinh hoa văn hóa nhân loại; tác động lành mạnh hóa cấu trúc xã hội, thu hẹp khoảng cách giai tầng, tạo sự bình đẳng xã hội.',
            keyAction:
              'Xây dựng xã hội học tập, văn hóa học đường văn minh và thúc đẩy dịch chuyển xã hội tích cực.',
            deliverable:
              'Nền tảng dân trí vững chắc, bản sắc văn hóa dân tộc được bảo tồn và phát huy trong hội nhập.',
          },
        ],
      }),
      createElement(LegalReferenceBox, {
        lawTitle: 'Luật Giáo dục 2019 (Luật số 43/2019/QH14)',
        article: 'Điều 3. Tính chất, nguyên lý giáo dục',
        quote:
          'Nền giáo dục Việt Nam là nền giáo dục xã hội chủ nghĩa có tính nhân dân, dân tộc, khoa học, hiện đại, lấy chủ nghĩa Mác - Lênin và tư tưởng Hồ Chí Minh làm nền tảng.',
        source: 'Luật Giáo dục 2019 (Giáo trình HCMUE Trang 16 – 17)',
        significance:
          'Khẳng định bản chất chính trị – tư tưởng và định hướng xã hội chủ nghĩa nhất quán của toàn bộ hệ thống giáo dục quốc dân Việt Nam.',
      }),
    ),

    // PHẦN IV: BẢNG SO SÁNH 3 QUAN ĐIỂM VỀ SỰ PHÁT TRIỂN NHÂN CÁCH (TRANG 17 – 20)
    createElement(
      'section',
      { id: '4-ba-quan-diem-phat-trien-nhan-cach', className: 'space-y-4' },
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
          '4. Bảng So sánh 3 Quan điểm & Vai trò Chủ đạo của Giáo dục (Trang 17 – 20)',
        ),
      ),
      createElement(ScholarQuote, {
        quote: 'Hiền dữ phải đâu là tính sẵn, phần nhiều do giáo dục mà nên.',
        author: 'Chủ tịch Hồ Chí Minh (1890 – 1969)',
        title: 'Anh hùng giải phóng dân tộc · Danh nhân văn hóa thế giới',
        source: 'Nhật ký trong tù (1943) — Giáo trình Giáo dục học HCMUE Trang 19',
        historicalContext:
          'Bác khẳng định tính linh hoạt, khả biến của nhân cách con người và nhấn mạnh vai trò quyết định của công tác giáo dục trong việc cải tạo con người.',
      }),
      createElement(ComparativeTable, {
        title:
          'Bảng So sánh 3 Quan điểm Triết học – Giáo dục học về Sự Phát triển Nhân cách (Trang 17 – 19)',
        subtitle:
          'Phân tích sự khác biệt bản chất giữa các học thuyết và xác lập quan điểm duy vật biện chứng khoa học.',
        badge: '3 Quan điểm Phát triển Nhân cách',
        columns: [
          { key: 'theory', header: 'Học thuyết / Quan điểm', widthClass: 'w-1/4' },
          { key: 'essence', header: 'Luận điểm cốt lõi' },
          { key: 'critique', header: 'Đánh giá khoa học & Hệ quả sư phạm' },
        ],
        rows: [
          {
            theory: 'Thuyết Tiền định (Duy tâm / Sinh vật hóa)',
            essence:
              'Tuyệt đối hóa yếu tố bẩm sinh - di truyền, xem môi trường và giáo dục là vô nghĩa; nhân cách đã được an bài từ trước khi đứa trẻ chào đời.',
            critique:
              'Quan điểm sai lầm, duy tâm; dẫn đến thái độ buông xuôi, bất lực trong sư phạm, phân biệt đối xử và phủ nhận tiềm năng vươn lên của học sinh.',
          },
          {
            theory: 'Thuyết Duy cảm (Duy vật máy móc / Xã hội hóa cực đoan)',
            essence:
              'Tuyệt đối hóa vai trò môi trường và giáo dục, xem trẻ em như "tờ giấy trắng", coi giáo dục là vạn năng, có thể nhào nặn ra bất kỳ mẫu người nào.',
            critique:
              'Quan điểm sai lầm, máy móc; bỏ qua tư chất tiền đề bẩm sinh và phủ nhận tính chủ thể tích cực tự giáo dục của cá nhân học sinh.',
          },
          {
            theory: 'Quan điểm Duy vật Biện chứng (Mác - Lênin & HCMUE)',
            essence:
              'Giáo dục không phải là vạn năng nhưng giữ VAI TRÒ CHỦ ĐẠO trong mối tương tác với di truyền (tiền đề vật chất), môi trường (điều kiện) và hoạt động cá nhân (yếu tố quyết định trực tiếp).',
            critique:
              'Quan điểm khoa học, biện chứng; định hướng cho người giáo viên không ngừng sáng tạo, kiên trì cảm hóa và khơi dậy động lực tự hoàn thiện của học sinh.',
          },
        ],
        footerNote: 'Nguồn đối chiếu: Giáo trình Giáo dục học HCMUE (Chương 2, Trang 17 – 20).',
      }),

      // Cơ chế vai trò chủ đạo của giáo dục
      createElement(
        'div',
        {
          className: 'rounded-2xl border border-[#CFDADB] bg-[#F7FAFA] p-6 shadow-2xs space-y-4',
        },
        createElement(
          'h4',
          { className: 'font-serif text-lg font-bold text-[#29383D]' },
          'Phân tích Cơ chế Vai trò Chủ đạo của Giáo dục đối với Sự Phát triển Nhân cách',
        ),
        createElement(
          'p',
          { className: 'text-sm text-[#55676B]' },
          'Giáo trình Giáo dục học HCMUE (Trang 18 – 20) chỉ rõ vai trò chủ đạo của giáo dục được thực hiện qua 4 cơ chế tác động cốt lõi sau:',
        ),
        createElement(
          'div',
          { className: 'grid gap-3 md:grid-cols-2' },
          createElement(
            'div',
            { className: 'rounded-xl border border-[#CFDADB] bg-[#EAF0F1]/70 p-4 space-y-1.5' },
            createElement(
              'p',
              { className: 'font-serif text-sm font-bold text-[#3F6570]' },
              '1. Định hướng và dẫn dắt sự phát triển',
            ),
            createElement(
              'p',
              { className: 'text-sm text-[#29383D]' },
              'Định hướng và tổ chức dẫn dắt quá trình hình thành nhân cách theo mục tiêu định trước; giáo dục luôn đi trước đón đầu sự phát triển, kéo theo sự phát triển tâm lý của học sinh.',
            ),
          ),
          createElement(
            'div',
            { className: 'rounded-xl border border-[#CFDADB] bg-[#EAF0F1]/70 p-4 space-y-1.5' },
            createElement(
              'p',
              { className: 'font-serif text-sm font-bold text-[#3F6570]' },
              '2. Can thiệp, điều chỉnh yếu tố di truyền',
            ),
            createElement(
              'p',
              { className: 'text-sm text-[#29383D]' },
              'Can thiệp, điều chỉnh các yếu tố bẩm sinh – di truyền: bù trừ cho các khiếm khuyết cơ thể (giáo dục đặc biệt) và phát hiện, phát triển những tư chất bẩm sinh trở thành tài năng thực sự.',
            ),
          ),
          createElement(
            'div',
            { className: 'rounded-xl border border-[#CFDADB] bg-[#EAF0F1]/70 p-4 space-y-1.5' },
            createElement(
              'p',
              { className: 'font-serif text-sm font-bold text-[#3F6570]' },
              '3. Cải tạo và lành mạnh hóa môi trường sống',
            ),
            createElement(
              'p',
              { className: 'text-sm text-[#29383D]' },
              'Cải tạo và lành mạnh hóa môi trường sống xung quanh học sinh; xây dựng không gian văn hóa học đường tích cực và trang bị cho học sinh "bộ lọc", "sức đề kháng" trước ảnh hưởng tiêu cực của xã hội.',
            ),
          ),
          createElement(
            'div',
            { className: 'rounded-xl border border-[#CFDADB] bg-[#EAF0F1]/70 p-4 space-y-1.5' },
            createElement(
              'p',
              { className: 'font-serif text-sm font-bold text-[#3F6570]' },
              '4. Tổ chức hoạt động kích hoạt tính chủ thể',
            ),
            createElement(
              'p',
              { className: 'text-sm text-[#29383D]' },
              'Tổ chức các loại hình hoạt động và giao lưu đa dạng, phong phú để kích hoạt tính chủ thể tự ý thức, tự rèn luyện và tự giáo dục của học sinh (nhân tố quyết định trực tiếp).',
            ),
          ),
        ),
      ),
    ),

    // PHẦN V: KHUNG TÌNH HUỐNG THỰC HÀNH 5 BƯỚC (CASE STUDY 201)
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
          '5. Khung Tình huống Thực hành 5 Bước: Vai trò Chủ đạo của Giáo dục (Mục 3.3.6 HCMUE)',
        ),
      ),
      createElement(CaseStudyBox, { caseStudy: caseStudy2_1, defaultOpenSolution: true }),
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
      'Một nhóm sinh viên kiến tập sư phạm thiết kế hoạt động giáo dục chuyên đề "Tư duy tài chính thông minh" cho học sinh lớp 7. Nhóm thiết kế trò chơi rất sôi động (Phương pháp/Hình thức), nhưng cuối buổi học sinh chỉ nhớ phần thưởng trò chơi mà không rút ra được bài học gì về cách lập kế hoạch chi tiêu cá nhân (Mục tiêu & Kết quả), cũng không có công cụ đánh giá mức độ nhận thức của học sinh.',
    question:
      'Vận dụng lý luận về tính chỉnh thể hệ thống của 7 thành tố cấu trúc hoạt động giáo dục (Giáo trình HCMUE tr. 20–24), anh/chị hãy phân tích và xử lý tình huống theo quy trình 5 bước.',
    principlesApplied: [
      'Tính chỉnh thể hệ thống của 7 thành tố trong quá trình giáo dục tổng thể (Giáo trình tr. 21–22)',
      'Nguyên tắc đảm bảo tính mục đích trong hoạt động giáo dục',
      'Mối quan hệ biện chứng giữa Mục tiêu, Nội dung, Phương pháp và Đánh giá kết quả',
    ],
    solutionSteps: [
      {
        step: 1,
        title: 'Bước 1 (Phân tích dữ kiện)',
        content:
          'Hoạt động giáo dục rơi vào bệnh hình thức bề nổi: thành tố Phương pháp/Hình thức tổ chức (trò chơi vui nhộn) bị tách rời hoàn toàn khỏi thành tố Mục đích, Nội dung giáo dục và khâu Đánh giá kết quả.',
      },
      {
        step: 2,
        title: 'Bước 2 (Biểu đạt vấn đề)',
        content:
          'Mâu thuẫn giữa sự hào hứng bên ngoài của học sinh và sự trống rỗng về năng lực thực chất sau giờ học; vi phạm nguyên lý 7 thành tố cấu trúc phải tạo thành một hệ thống đồng bộ.',
      },
      {
        step: 3,
        title: 'Bước 3 (Giả thuyết phương án)',
        content:
          'Tránh quay lại cách dạy thuyết giảng khô khan. Chọn giải pháp tái cấu trúc bài học: Giữ lại hoạt động tương tác nhưng neo chặt mỗi thử thách của trò chơi vào một tình huống chi tiêu thực tế, đồng thời bổ sung phiếu phản tư tài chính ở cuối buổi.',
      },
      {
        step: 4,
        title: 'Bước 4 (Chứng minh cơ sở khoa học)',
        content:
          'Theo Giáo trình HCMUE (tr. 21–22), 7 thành tố cấu trúc có mối quan hệ biện chứng chặt chẽ: Mục tiêu giữ vai trò dẫn đường, Nội dung là chất liệu, Phương pháp là con đường, và Kết quả phản ánh sự chuyển hóa bên trong của học sinh.',
      },
      {
        step: 5,
        title: 'Bước 5 (Kết luận sư phạm)',
        content:
          'Mọi sự đổi mới phương pháp và hình thức tổ chức giáo dục chỉ thực sự có giá trị khi phục vụ trực tiếp cho việc hiện thực hóa mục tiêu phẩm chất, năng lực và được kiểm chứng qua sự chuyển biến thực chất của người học.',
      },
    ],
    pitfallsToAvoid: [
      'Chạy theo trò chơi giải trí đơn thuần biến giờ giáo dục thành giờ hoạt náo vô mục đích.',
      'Bỏ qua khâu đánh giá và phản tư kết quả giáo dục.',
    ],
    coreLesson:
      'Quá trình giáo dục là một hệ thống toàn vẹn gồm 7 thành tố; bất kỳ sự đứt gãy nào giữa phương pháp với mục tiêu và đánh giá đều dẫn đến sự hình thức hóa giáo dục.',
  };

  return createElement(
    'div',
    { className: 'space-y-8 text-[#29383D] leading-relaxed' },

    // 1. THANH METADATA & ĐỐI CHIẾU ĐẦU BÀI
    createElement(PedagogyMetadataBar, {
      courseCode: 'EDUC2802',
      lessonCode: 'EDUC2802-C2-L2',
      clos: ['CLO1', 'CLO3'],
      textbookPages: 'Giáo trình Giáo dục học HCMUE (Trang 20 – 24)',
      legalRefs: [
        'Giáo trình Giáo dục học HCMUE (Mục 2.2, Trang 20 – 24)',
        'Tài liệu Phương pháp nghiên cứu khoa học Giáo dục học',
      ],
      sessionNote: 'Mục 2.2 · Trang 20 – 24',
    }),

    // PHẦN I: TIẾN TRÌNH LỊCH SỬ HÌNH THÀNH GIÁO DỤC HỌC (TRANG 20 – 21)
    createElement(
      'section',
      { id: '1-tien-trinh-lich-su-giao-duc-hoc', className: 'space-y-4' },
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
          '1. Tiến trình Lịch sử Hình thành Giáo dục học thành Khoa học Độc lập (Trang 20 – 21)',
        ),
      ),
      createElement(
        'p',
        null,
        'Khoa học Giáo dục học không xuất hiện ngẫu nhiên mà là kết quả của một tiến trình lịch sử lâu dài, đúc kết từ kinh nghiệm thực tiễn và tư tưởng triết học nhân loại qua 4 giai đoạn lớn:',
      ),
      createElement(NumberedProcessFlow, {
        title: 'Bốn Giai đoạn Lịch sử Đưa Giáo dục học Trở thành Khoa học Độc lập',
        subtitle:
          'Từ kinh nghiệm dân gian, triết học cổ đại đến mốc son thời kỳ Phục Hưng của J. A. Cômenxki (Giáo trình HCMUE Trang 20 – 21).',
        badge: 'Tiến trình Lịch sử Giáo dục học',
        columns: 1,
        steps: [
          {
            number: 1,
            title: 'Giai đoạn tích lũy kinh nghiệm tự phát',
            description:
              'Các kinh nghiệm dạy dỗ, nuôi dưỡng trẻ em được đúc kết tự phát trong văn hóa dân gian qua các câu ca dao, tục ngữ, truyện cổ tích và truyền miệng trong cộng đồng.',
            keyAction: 'Đúc kết kinh nghiệm giáo dục tự nhiên gắn liền với đời sống lao động.',
            deliverable:
              'Kho tàng tri thức dân gian về đạo lý làm người và kinh nghiệm ứng xử trong gia đình.',
          },
          {
            number: 2,
            title: 'Giai đoạn tích hợp trong triết học cổ đại',
            description:
              'Các tư tưởng giáo dục bắt đầu được khái quát hóa nhưng vẫn nằm trong lòng các học thuyết triết học và tôn giáo (như tư tưởng của Khổng Tử ở phương Đông; Socrates, Plato, Aristotle ở Hy Lạp cổ đại).',
            keyAction: 'Gắn mục đích giáo dục với lý tưởng đạo đức và trật tự nhà nước lý tưởng.',
            deliverable:
              'Các tư tưởng triết học giáo dục sơ khai về bồi dưỡng người quân tử, công dân hiền triết.',
          },
          {
            number: 3,
            title: 'Bước ngoặt thời kỳ Phục Hưng: Trở thành khoa học độc lập',
            description:
              'Đầu thế kỷ XVII, với sự ra đời của kiệt tác "Didactica Magna" (Phép giảng dạy vĩ đại, 1632) của nhà giáo dục học Jan Amos Cômenxki (1592 – 1670), Giáo dục học chính thức tách khỏi triết học để trở thành một khoa học độc lập.',
            keyAction:
              'Xây dựng hệ thống lý luận dạy học khoa học, chế độ lớp – bài, niên chế năm học và nguyên tắc dạy học trực quan.',
            deliverable:
              'Đặt nền móng khoa học vững chắc cho toàn bộ hệ thống trường học cận – hiện đại.',
          },
          {
            number: 4,
            title: 'Giai đoạn phát triển và hoàn thiện phương pháp luận',
            description:
              'Sự đóng góp to lớn của các đại biểu kiệt xuất: John Locke, J. J. Rousseau, Pestalozzi, Diesterweg, Usinsky; và phát triển đỉnh cao trên nền tảng phương pháp luận duy vật biện chứng Mác - Lênin.',
            keyAction:
              'Vận dụng quan điểm lịch sử – cụ thể, thực tiễn và toàn diện vào nghiên cứu con người.',
            deliverable:
              'Hệ thống lý luận Giáo dục học hiện đại với tính khoa học, cách mạng và nhân văn sâu sắc.',
          },
        ],
      }),
    ),

    // PHẦN II: ĐỐI TƯỢNG NGHIÊN CỨU & BẢNG LƯỚI 7 THÀNH TỐ (TRANG 21 – 22)
    createElement(
      'section',
      { id: '2-doi-tuong-va-7-thanh-to', className: 'space-y-4' },
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
          '2. Đối tượng Nghiên cứu & Hệ thống 7 Thành tố Cấu trúc (Trang 21 – 22)',
        ),
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
          'Đối tượng Nghiên cứu của Giáo dục học',
        ),
        createElement(
          'p',
          { className: 'text-base font-serif font-bold text-[#29383D]' },
          'Theo Giáo trình Giáo dục học HCMUE (Trang 21), đối tượng nghiên cứu của Giáo dục học là hoạt động giáo dục tổng thể (quá trình hình thành và phát triển toàn diện nhân cách con người được tổ chức có mục đích, có kế hoạch tại nhà trường và các thiết chế xã hội).',
        ),
      ),
      createElement(
        'p',
        null,
        'Hoạt động giáo dục tổng thể vận hành như một hệ thống cấu trúc hoàn chỉnh bao gồm ',
        createElement('strong', null, '7 thành tố cơ bản'),
        ':',
        createElement(
          Sidenote,
          { type: 'pedagogy', number: 1 },
          'Mối quan hệ biện chứng: 7 thành tố tạo thành một hệ thống chỉnh thể; khi một thành tố thay đổi (ví dụ: đổi mới mục tiêu sang phát triển năng lực) thì tất cả các thành tố còn lại (nội dung, phương pháp, đánh giá) đều phải thay đổi tương ứng.',
        ),
      ),
      createElement(ComparativeTable, {
        title:
          'Bảng Lưới 7 Thành tố Cấu trúc của Hoạt động Giáo dục (Giáo trình HCMUE Trang 21 – 22)',
        subtitle:
          'Khung hệ thống toàn vẹn về các thành tố cấu thành quá trình sư phạm tổng thể trong nhà trường.',
        badge: '7 Thành tố Hoạt động Giáo dục',
        columns: [
          { key: 'component', header: 'Thành tố cấu trúc', widthClass: 'w-1/4' },
          { key: 'role', header: 'Vị trí & Bản chất thành tố' },
          { key: 'function', header: 'Chức năng vận hành trong hệ thống' },
        ],
        rows: [
          {
            component: '01. Chủ thể giáo dục',
            role: 'Nhà giáo dục (giáo viên)',
            function:
              'Giữ vai trò chủ đạo, định hướng tổ chức, điều khiển, cố vấn và khích lệ toàn bộ hoạt động học tập, rèn luyện của học sinh.',
          },
          {
            component: '02. Đối tượng giáo dục',
            role: 'Người được giáo dục (học sinh)',
            function:
              'Vừa là đối tượng tiếp nhận tác động sư phạm, vừa là chủ thể tích cực, độc lập, có ý thức tự giáo dục để hoàn thiện nhân cách.',
          },
          {
            component: '03. Mục đích giáo dục',
            role: 'Mô hình nhân cách tương lai',
            function:
              'Mô hình dự kiến về nhân cách mà xã hội yêu cầu; giữ vai trò dẫn đường, định hướng cho toàn bộ các thành tố còn lại trong hệ thống.',
          },
          {
            component: '04. Nội dung giáo dục',
            role: 'Chất liệu giáo dục được gia công sư phạm',
            function:
              'Hệ thống tri thức, kỹ năng, thái độ, giá trị đạo đức và kinh nghiệm hoạt động sáng tạo được tinh lọc đưa vào chương trình.',
          },
          {
            component: '05. Phương pháp & Phương tiện',
            role: 'Con đường và công cụ phối hợp',
            function:
              'Cách thức, công cụ hoạt động phối hợp tương tác hai chiều giữa thầy và trò cùng các phương tiện công nghệ, học liệu hỗ trợ.',
          },
          {
            component: '06. Kết quả giáo dục',
            role: 'Sản phẩm chuyển hóa thực tế',
            function:
              'Mức độ chuyển biến phẩm chất, năng lực thực tế của học sinh so với mục tiêu đề ra; là căn cứ kiểm định hiệu quả của cả hệ thống.',
          },
          {
            component: '07. Môi trường & Điều kiện',
            role: 'Không gian và bối cảnh sinh tồn',
            function:
              'Không gian tự nhiên, xã hội bên ngoài và điều kiện cơ sở vật chất, văn hóa học đường bên trong tác động trực tiếp lên quá trình giáo dục.',
          },
        ],
        footerNote: 'Nguồn đối chiếu: Giáo trình Giáo dục học HCMUE (Chương 2, Trang 21 – 22).',
      }),
    ),

    // PHẦN III: 3 NHÓM PHƯƠNG PHÁP NGHIÊN CỨU GIÁO DỤC HỌC (TRANG 22 – 24)
    createElement(
      'section',
      { id: '3-ba-nhom-phuong-phap-nghien-cuu', className: 'space-y-4' },
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
          '3. Ba Nhóm Phương pháp Nghiên cứu Giáo dục học (Giáo trình HCMUE Trang 22 – 24)',
        ),
      ),
      createElement(
        'p',
        null,
        'Nghiên cứu khoa học Giáo dục học đòi hỏi sự kết hợp đồng bộ giữa lý luận, thực tiễn và công cụ toán học thông qua ',
        createElement('strong', null, '3 nhóm phương pháp nghiên cứu cốt lõi'),
        ':',
      ),
      createElement(NumberedProcessFlow, {
        title: 'Hệ thống 3 Nhóm Phương pháp Nghiên cứu Sư phạm',
        subtitle:
          'Hệ phương pháp thu thập, phân tích và xử lý dữ liệu khoa học trong nghiên cứu Giáo dục học (Trang 22 – 24).',
        badge: '3 Nhóm Phương pháp Nghiên cứu',
        columns: 1,
        steps: [
          {
            number: 1,
            title: '01. Nhóm phương pháp nghiên cứu lý luận',
            description:
              'Phân tích, tổng hợp, phân loại, hệ thống hóa các tài liệu khoa học, văn bản nghị quyết, công trình nghiên cứu trong và ngoài nước để xây dựng luận cứ lý thuyết, khung khái niệm và giả thuyết khoa học.',
            keyAction:
              'Đọc, phân tích, tổng hợp tài liệu chuyên khảo và văn bản quy phạm pháp luật giáo dục.',
            deliverable:
              'Khung cơ sở lý luận và hệ thống giả thuyết khoa học của đề tài nghiên cứu.',
          },
          {
            number: 2,
            title: '02. Nhóm phương pháp nghiên cứu thực tiễn',
            description:
              'Gồm các phương pháp tác động và khảo sát trực tiếp: (1) Quan sát sư phạm; (2) Điều tra giáo dục (phỏng vấn, phiếu hỏi Anket); (3) Tổng kết kinh nghiệm giáo dục & lấy ý kiến chuyên gia; (4) Thực nghiệm sư phạm (so sánh đối chứng lớp thực nghiệm và lớp đối chứng); (5) Nghiên cứu sản phẩm hoạt động học tập.',
            keyAction:
              'Khảo sát thực trạng, tiến hành thực nghiệm sư phạm và đo lường sản phẩm học tập.',
            deliverable:
              'Hệ thống số liệu thực tiễn và bằng chứng kiểm nghiệm tính khả thi của giải pháp sư phạm.',
          },
          {
            number: 3,
            title: '03. Nhóm phương pháp thống kê toán học',
            description:
              'Xử lý số liệu thực nghiệm, tính toán các tham số thống kê mô tả (điểm trung bình, độ lệch chuẩn), kiểm định giả thuyết thống kê (T-test, ANOVA) bằng phần mềm SPSS hoặc Excel nhằm phát hiện các quy luật khách quan, bảo đảm tính tin cậy của kết quả.',
            keyAction:
              'Định lượng hóa số liệu nghiên cứu và kiểm định độ tin cậy, độ giá trị khoa học.',
            deliverable:
              'Bảng biểu, biểu đồ thống kê định lượng và kết luận khoa học có sức thuyết phục cao.',
          },
        ],
      }),
    ),

    // PHẦN IV: TÌNH HUỐNG THỰC HÀNH 5 BƯỚC CUỐI BÀI (CASE STUDY 202)
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
          '4. Tình huống Thực hành 5 Bước: Vận dụng 7 Thành tố Quá trình Giáo dục',
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
  const [openEssayId, setOpenEssayId] = useState<number | null>(1);

  const caseStudy2_3: PedagogicalCaseStudy = {
    id: 203,
    title: 'Dạy học nặng về luyện giải đề mẹo mực, tách rời thực hành và đời sống thực tiễn',
    context:
      'Tại lớp 11A, thầy T. khi dạy chủ đề Cấp số nhân và Hàm số mũ chỉ tập trung cho học sinh chép các công thức giải nhanh để khoanh trắc nghiệm. Khi một học sinh hỏi: "Thưa thầy, kiến thức này ứng dụng như thế nào trong tính lãi suất ngân hàng hay sự tăng trưởng quần thể sinh học ạ?", thầy T. gạt đi: "Các em không cần quan tâm thực tế làm gì cho mất thời gian, cứ thuộc lòng công thức bấm máy tính để thi đạt điểm cao là được."',
    question:
      'Đối chiếu với Mục đích giáo dục và Nguyên lý giáo dục Việt Nam theo Điều 3, Điều 5, Điều 28 Luật Giáo dục 2019 (Giáo trình HCMUE tr. 25–30), anh/chị hãy phân tích và giải quyết tình huống theo quy trình 5 bước.',
    principlesApplied: [
      'Nguyên lý giáo dục Việt Nam (Điều 3, Luật Giáo dục 2019): Học đi đôi với hành, lý luận gắn liền với thực tiễn',
      'Mục đích giáo dục cá nhân: Phát triển toàn diện phẩm chất và năng lực (Chương trình GDPT 2018)',
      'Nguyên tắc hoạt động giáo dục gắn với đời sống, với thực tiễn xã hội',
    ],
    solutionSteps: [
      {
        step: 1,
        title: 'Bước 1 (Phân tích dữ kiện)',
        content:
          'Thầy T. đang áp dụng lối dạy học ứng thí thực dụng cực đoan, biến môn Toán thành kỹ xảo bấm máy tính mẹo mực, phớt lờ câu hỏi liên hệ thực tế chính đáng của học sinh.',
      },
      {
        step: 2,
        title: 'Bước 2 (Biểu đạt vấn đề)',
        content:
          'Vi phạm trực tiếp nguyên lý "Học đi đôi với hành, lý luận gắn liền với thực tiễn"; làm mất đi ý nghĩa thực tiễn sống động của toán học và triệt tiêu hứng thú tìm tòi khoa học của người học.',
      },
      {
        step: 3,
        title: 'Bước 3 (Giả thuyết phương án)',
        content:
          'Tránh phớt lờ câu hỏi của học sinh. Chọn phương án tối ưu: Biểu dương câu hỏi mang tính phát hiện của học sinh; dành 10 phút xây dựng bài toán mô hình hóa lãi suất ngân hàng và tăng trưởng sinh học từ cấp số nhân; giao bài tập thực hành ứng dụng về nhà.',
      },
      {
        step: 4,
        title: 'Bước 4 (Chứng minh cơ sở khoa học)',
        content:
          'Theo Giáo trình HCMUE (tr. 28–30), thực tiễn là cơ sở, động lực và thước đo của nhận thức. Khi lý luận toán học gắn với bài toán thực tiễn, học sinh không chỉ hiểu sâu bản chất kiến thức mà còn hình thành năng lực mô hình hóa toán học.',
      },
      {
        step: 5,
        title: 'Bước 5 (Kết luận sư phạm)',
        content:
          'Chuyển từ dạy học nhồi nhét mẹo làm bài sang dạy học phát triển năng lực đòi hỏi người thầy phải biến tri thức sách vở thành công cụ giải quyết vấn đề thực tế cuộc sống cho học sinh.',
      },
    ],
    pitfallsToAvoid: [
      'Biến giờ dạy học thành giờ luyện mẹo bấm máy tính tách rời bản chất khoa học.',
      'Dập tắt tính tò mò, sáng tạo của học sinh vì áp lực điểm số thi cử ngắn hạn.',
    ],
    coreLesson:
      'Thực hiện nguyên lý "Học đi đôi với hành, lý luận gắn liền với thực tiễn" là con đường tất yếu để chuyển hóa tri thức lý thuyết thành năng lực sống động của học sinh.',
  };

  return createElement(
    'div',
    { className: 'space-y-8 text-[#29383D] leading-relaxed' },

    // 1. THANH METADATA & ĐỐI CHIẾU ĐẦU BÀI
    createElement(PedagogyMetadataBar, {
      courseCode: 'EDUC2802',
      lessonCode: 'EDUC2802-C2-L3',
      clos: ['CLO1', 'CLO3'],
      textbookPages: 'Giáo trình Giáo dục học HCMUE (Trang 25 – 30)',
      legalRefs: [
        'Luật Giáo dục 2019 (Điều 2, Điều 3, Điều 5, Điều 28)',
        'Chương trình GDPT 2018 Tổng thể (TT 32/2018)',
      ],
      sessionNote: 'Mục 2.3 · Trang 25 – 30',
    }),

    // PHẦN I: MỤC ĐÍCH GIÁO DỤC TRÊN BÌNH DIỆN XÃ HỘI & CÁ NHÂN (TRANG 25 – 28)
    createElement(
      'section',
      { id: '1-muc-dich-giao-duc', className: 'space-y-4' },
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
          '1. Mục đích Giáo dục trên Bình diện Xã hội và Cá nhân (Trang 25 – 28)',
        ),
      ),
      createElement(
        'p',
        null,
        'Mục đích giáo dục là phạm trù cơ bản định hướng cho toàn bộ chiến lược phát triển con người của một quốc gia. Theo Giáo trình Giáo dục học HCMUE (Trang 25 – 28), mục đích giáo dục Việt Nam được xác lập hài hòa trên ',
        createElement('strong', null, 'hai bình diện: xã hội (vĩ mô) và cá nhân (vi mô)'),
        ':',
      ),
      createElement(ComparativeTable, {
        title: 'Bảng Hệ thống hóa Mục đích Giáo dục Việt Nam trên Bình diện Xã hội & Cá nhân',
        subtitle:
          'Sự kết hợp biện chứng giữa 3 mục tiêu vĩ mô quốc gia và mô hình nhân cách toàn diện của người học (Trang 25 – 28).',
        badge: 'Mục đích Giáo dục Việt Nam',
        columns: [
          { key: 'dimension', header: 'Bình diện xác lập', widthClass: 'w-1/4' },
          { key: 'pillar', header: 'Hệ thống mục tiêu thành phần', widthClass: 'w-1/4' },
          { key: 'content', header: 'Nội dung cốt lõi & Yêu cầu thực thi (Giáo trình HCMUE)' },
        ],
        rows: [
          {
            dimension: 'Bình diện Xã hội (Vĩ mô)',
            pillar: '1. Nâng cao dân trí',
            content:
              'Phổ cập giáo dục, nâng cao trình độ học vấn, dân trí pháp luật và khoa học; tạo dựng nền tảng văn hóa dân tộc vững chắc cho toàn thể nhân dân.',
          },
          {
            dimension: 'Bình diện Xã hội (Vĩ mô)',
            pillar: '2. Đào tạo nhân lực',
            content:
              'Đào tạo nguồn vốn lao động có tay nghề, phẩm chất đạo đức nghề nghiệp, năng lực sáng tạo và khả năng thích ứng linh hoạt với cuộc Cách mạng công nghiệp 4.0.',
          },
          {
            dimension: 'Bình diện Xã hội (Vĩ mô)',
            pillar: '3. Bồi dưỡng nhân tài',
            content:
              'Phát hiện sớm tư chất, đào tạo nhân tài khoa học công nghệ mũi nhọn theo thang phát triển 4 tầng: Khiếu → Năng lực → Tài năng → Thiên tài.',
          },
          {
            dimension: 'Bình diện Cá nhân (Vi mô)',
            pillar: '5 Phẩm chất & 10 Năng lực (CT 2018)',
            content:
              'Phát triển toàn diện nhân cách hài hòa Đức - Trí - Thể - Mỹ: 5 phẩm chất chủ yếu (Yêu nước, Nhân ái, Chăm chỉ, Trung thực, Trách nhiệm), 3 năng lực chung và 7 năng lực đặc thù.',
          },
        ],
        footerNote: 'Nguồn đối chiếu: Giáo trình Giáo dục học HCMUE (Chương 2, Trang 25 – 28).',
      }),
    ),

    // PHẦN II: PHÂN KỲ MỤC TIÊU GIÁO DỤC PHỔ THÔNG (ĐIỀU 28, LUẬT GD 2019)
    createElement(
      'section',
      { id: '2-phan-ky-muc-tieu-gdpt', className: 'space-y-4' },
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
          '2. Phân kỳ Mục tiêu Giáo dục Phổ thông theo 2 Giai đoạn (Điều 28, Luật Giáo dục 2019)',
        ),
      ),
      createElement(
        'p',
        null,
        'Luật Giáo dục 2019 và Chương trình GDPT 2018 phân kỳ rõ ràng hệ thống giáo dục phổ thông thành ',
        createElement('strong', null, 'hai giai đoạn giáo dục tiếp nối có mục tiêu riêng biệt'),
        ':',
      ),
      createElement(NumberedProcessFlow, {
        title: 'Mục tiêu Giáo dục Phổ thông theo 2 Giai đoạn Chiến lược',
        subtitle:
          'Đối chiếu quy chuẩn Điều 28 Luật Giáo dục 2019 và Chương trình GDPT 2018 (Giáo trình HCMUE Trang 27 – 28).',
        badge: 'Giai đoạn Giáo dục Cơ bản & Định hướng Nghề nghiệp',
        columns: 1,
        steps: [
          {
            number: 1,
            title: 'Giai đoạn Giáo dục Cơ bản (Từ Lớp 1 đến Lớp 9)',
            description:
              'Gồm 2 cấp học: (1) Cấp Tiểu học (5 năm): Hình thành những cơ sở ban đầu cho sự phát triển đúng đắn và lâu dài về đạo đức, trí tuệ, thể chất, thẩm mỹ; rèn luyện nền nếp học tập, tình yêu gia đình và cộng đồng. (2) Cấp THCS (4 năm): Củng cố, phát triển kết quả giáo dục tiểu học; hoàn thiện hệ thống tri thức phổ thông nền tảng; hình thành hiểu biết ban đầu về kỹ thuật và định hướng phân luồng nghề nghiệp sau THCS.',
            keyAction:
              'Trang bị học vấn phổ thông nền tảng vững chắc và chuẩn bị tâm thế phân luồng.',
            deliverable:
              'Học sinh có đầy đủ năng lực học vấn cốt lõi để bước vào THPT hoặc học nghề.',
          },
          {
            number: 2,
            title: 'Giai đoạn Giáo dục Định hướng Nghề nghiệp (Từ Lớp 10 đến Lớp 12)',
            description:
              'Cấp Trung học phổ thông (3 năm): Hoàn thiện học vấn phổ thông toàn diện; tổ chức dạy học phân hóa sâu theo nhóm môn lựa chọn và chuyên đề học tập dựa trên năng lực, sở trường của học sinh; trang bị năng lực tự học suốt đời, kỹ năng định hướng nghề nghiệp và thích ứng với môi trường làm việc trong tương lai.',
            keyAction:
              'Tổ chức dạy học phân hóa theo nguyện vọng, định hướng nghề nghiệp và bồi dưỡng năng khiếu chuyên sâu.',
            deliverable:
              'Học sinh có phẩm chất, năng lực định hướng rõ ràng cho con đường học lên đại học, cao đẳng hoặc tham gia thị trường lao động.',
          },
        ],
      }),
    ),

    // PHẦN III: BẢNG MA TRẬN 3 NỘI DUNG NGUYÊN LÍ GIÁO DỤC VIỆT NAM (TRANG 28 – 30)
    createElement(
      'section',
      { id: '3-nguyen-li-giao-duc-viet-nam', className: 'space-y-4' },
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
          '3. Bảng Ma trận 3 Nội dung Nguyên lí Giáo dục Việt Nam (Giáo trình HCMUE Trang 28 – 30)',
        ),
      ),
      createElement(LegalReferenceBox, {
        lawTitle: 'Luật Giáo dục 2019 (Luật số 43/2019/QH14)',
        article: 'Điều 5. Yêu cầu về nội dung, phương pháp giáo dục & Điều 3 Khoản 2',
        quote:
          'Hoạt động giáo dục được thực hiện theo nguyên lý học đi đôi với hành, lý luận gắn liền với thực tiễn, giáo dục nhà trường kết hợp với giáo dục gia đình và giáo dục xã hội.',
        source: 'Luật Giáo dục 2019 (Giáo trình HCMUE Trang 28 – 29)',
        significance:
          'Nguyên lý giáo dục là kim chỉ nam bất biến chỉ đạo mọi phương thức dạy học, biên soạn học liệu và xây dựng môi trường giáo dục ở Việt Nam.',
      }),
      createElement(ComparativeTable, {
        title:
          'Bảng Phân tích Sâu sắc 3 Nội dung Cốt lõi của Nguyên lí Giáo dục Việt Nam (Trang 28 – 30)',
        subtitle:
          'Lý giải bản chất khoa học, yêu cầu hành động và bài học sư phạm đối với người giáo viên.',
        badge: '3 Trụ cột Nguyên lí Giáo dục',
        columns: [
          { key: 'principle', header: 'Trụ cột nguyên lí', widthClass: 'w-1/4' },
          { key: 'essence', header: 'Bản chất khoa học (Giáo trình HCMUE)' },
          { key: 'practice', header: 'Yêu cầu hành động thực tế đối với người giáo viên' },
        ],
        rows: [
          {
            principle: '01. Học đi đôi với hành',
            essence:
              'Lý luận phải đi kèm luyện tập, rèn luyện kỹ năng; biến tri thức sách vở thành thói quen hành vi và năng lực giải quyết vấn đề thực tế cuộc sống; "học" soi sáng cho "hành", "hành" kiểm nghiệm và làm sâu sắc "học".',
            practice:
              'Tăng cường thí nghiệm thực hành, ứng dụng phần mềm mô phỏng (GeoGebra, Desmos trong Toán), giải quyết các bài toán thực tế thay vì chỉ dạy mẹo làm bài thi.',
          },
          {
            principle: '02. Lí luận gắn liền với thực tiễn',
            essence:
              'Thực tiễn là cơ sở, động lực và thước đo chân lý của lý luận; giáo dục phải khai thác chất liệu thực tiễn và phục vụ trực tiếp sự phát triển kinh tế - xã hội địa phương.',
            practice:
              'Tổ chức dạy học gắn với đời sống văn hóa, kinh tế của cộng đồng; đưa các chủ đề STEM, bảo vệ môi trường, tài chính cá nhân vào kế hoạch bài dạy.',
          },
          {
            principle: '03. Giáo dục nhà trường kết hợp giáo dục gia đình và giáo dục xã hội',
            essence:
              'Nhà trường giữ vai trò chủ đạo, gia đình giữ vai trò nền tảng, xã hội giữ vai trò phối hợp tích cực; tạo nên một môi trường đồng thuận thống nhất không có xung đột giáo dục.',
            practice:
              'Chủ động kết nối với cha mẹ học sinh qua sổ liên lạc điện tử, họp phụ huynh đối thoại; phối hợp chặt chẽ với Đoàn, Đội và chính quyền địa phương.',
          },
        ],
        footerNote: 'Nguồn đối chiếu: Giáo trình Giáo dục học HCMUE (Chương 2, Trang 28 – 30).',
      }),
    ),

    // PHẦN IV: CÂU HỎI TỰ LUẬN ÔN TẬP CHƯƠNG 2 & TÌNH HUỐNG 5 BƯỚC
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
          '4. Tình huống Thực hành 5 Bước & Đề cương Tự luận Trọng tâm Chương 2',
        ),
      ),
      createElement(CaseStudyBox, { caseStudy: caseStudy2_3, defaultOpenSolution: false }),

      createElement(
        'div',
        { className: 'space-y-3 pt-2' },
        [
          {
            id: 1,
            question:
              'Câu 1: Phân tích 4 tính chất cơ bản của giáo dục và 3 chức năng xã hội vĩ mô. Vì sao nói Nguồn vốn nhân lực (Human Capital) là nguồn vốn quan trọng nhất?',
            outline: [
              'Khái niệm giáo dục là hiện tượng xã hội đặc biệt và cơ chế di sản xã hội (Giáo trình tr. 13–14).',
              'Phân tích 4 tính chất: Phổ biến & vĩnh hằng, Nhân văn, Xã hội - lịch sử, Giai cấp (tr. 14–15).',
              'Phân tích 3 chức năng xã hội: Kinh tế - sản xuất, Chính trị - tư tưởng, Văn hóa - xã hội (tr. 15–17).',
              'Chứng minh Human Capital là quan trọng nhất: con người có tri thức và kỹ năng là chủ thể duy nhất sáng tạo, vận hành và phát huy hiệu quả của nguồn vốn vật chất, tài nguyên và công nghệ.',
            ],
          },
          {
            id: 2,
            question:
              'Câu 2: Phân tích vai trò chủ đạo của giáo dục đối với sự phát triển cá nhân trong mối quan hệ với Di truyền, Môi trường và Hoạt động cá nhân. Rút ra kết luận sư phạm.',
            outline: [
              'So sánh 3 quan điểm: Thuyết tiền định, Thuyết duy cảm và Quan điểm duy vật biện chứng (tr. 17–19).',
              'Làm rõ vai trò của 4 yếu tố: Di truyền (tiền đề vật chất), Môi trường (điều kiện), Giáo dục (vai trò chủ đạo), Hoạt động cá nhân (quyết định trực tiếp).',
              'Phân tích 4 cơ chế vai trò chủ đạo của giáo dục: định hướng, can thiệp di truyền, cải tạo môi trường, tổ chức hoạt động kích hoạt tính chủ thể (tr. 18–20).',
              'Rút ra kết luận sư phạm đối với thái độ và phương pháp giáo dục của giáo viên phổ thông.',
            ],
          },
          {
            id: 3,
            question:
              'Câu 3: Trình bày cấu trúc 7 thành tố của quá trình giáo dục và phân tích 3 nội dung Nguyên lý giáo dục Việt Nam theo Luật Giáo dục 2019.',
            outline: [
              'Đối tượng nghiên cứu của Giáo dục học là hoạt động giáo dục tổng thể (tr. 21).',
              'Cấu trúc và mối quan hệ biện chứng của 7 thành tố: Chủ thể, Đối tượng, Mục đích, Nội dung, Phương pháp & Phương tiện, Kết quả, Môi trường (tr. 21–22).',
              'Phân tích 3 nội dung Nguyên lý giáo dục theo Điều 3, Điều 5 Luật Giáo dục 2019: Học đi đôi với hành; Lý luận gắn liền với thực tiễn; Nhà trường kết hợp gia đình và xã hội (tr. 28–30).',
              'Liên hệ thực tiễn dạy học môn chuyên ngành ở trường trung học hiện nay.',
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
          'Khảo sát bản chất cơ chế di sản xã hội của giáo dục, 4 tính chất cơ bản chi phối sự vận động lịch sử, 3 chức năng xã hội vĩ mô và phân tích vai trò chủ đạo của giáo dục đối với sự hình thành, phát triển nhân cách cá nhân.',
        level: 'basic',
        tags: [
          'EDUC2802-C2-L1',
          'CLO1',
          'CLO3',
          'Hiện tượng xã hội đặc biệt',
          '3 Chức năng xã hội',
          'Vai trò chủ đạo',
          'Giáo trình tr. 13-20',
        ],
      },
      lessonMeta: {
        chapterNumber: 2,
        lessonNumber: 1,
        headings: [
          {
            id: '1-ban-chat-hien-tuong-giao-duc',
            text: '1. Bản chất của Hiện tượng Giáo dục: Cơ chế Di sản Xã hội (Trang 13 – 14)',
            depth: 2,
          },
          {
            id: '2-bon-tinh-chat-co-ban',
            text: '2. Bảng Ma trận 4 Tính chất Cơ bản của Giáo dục (Trang 14 – 15)',
            depth: 2,
          },
          {
            id: '3-ba-chuc-nang-xa-hoi',
            text: '3. Ba Chức năng Xã hội của Giáo dục (Trang 15 – 17)',
            depth: 2,
          },
          {
            id: '4-ba-quan-diem-phat-trien-nhan-cach',
            text: '4. Bảng So sánh 3 Quan điểm & Vai trò Chủ đạo của Giáo dục (Trang 17 – 20)',
            depth: 2,
          },
          {
            id: '5-tinh-huong-thuc-hanh',
            text: '5. Khung Tình huống Thực hành 5 Bước: Vai trò Chủ đạo của Giáo dục',
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
          'Khái quát tiến trình lịch sử đưa Giáo dục học trở thành khoa học độc lập từ mốc son J. A. Cômenxki, bóc tách cấu trúc 7 thành tố của hoạt động giáo dục tổng thể, xác lập các nhiệm vụ nghiên cứu và 3 nhóm phương pháp nghiên cứu sư phạm.',
        level: 'intermediate',
        tags: [
          'EDUC2802-C2-L2',
          'CLO1',
          'CLO3',
          'Khoa học Giáo dục học',
          '7 Thành tố',
          'Phương pháp nghiên cứu',
          'Giáo trình tr. 20-24',
        ],
      },
      lessonMeta: {
        chapterNumber: 2,
        lessonNumber: 2,
        headings: [
          {
            id: '1-tien-trinh-lich-su-giao-duc-hoc',
            text: '1. Tiến trình Lịch sử Hình thành Giáo dục học (Trang 20 – 21)',
            depth: 2,
          },
          {
            id: '2-doi-tuong-va-7-thanh-to',
            text: '2. Đối tượng Nghiên cứu & Hệ thống 7 Thành tố Cấu trúc (Trang 21 – 22)',
            depth: 2,
          },
          {
            id: '3-ba-nhom-phuong-phap-nghien-cuu',
            text: '3. Ba Nhóm Phương pháp Nghiên cứu Giáo dục học (Trang 22 – 24)',
            depth: 2,
          },
          {
            id: '4-tinh-huong-thuc-hanh',
            text: '4. Tình huống Thực hành 5 Bước: Vận dụng 7 Thành tố Quá trình Giáo dục',
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
          'Phân tích mục đích giáo dục trên bình diện xã hội (3 mục tiêu: Dân trí - Nhân lực - Nhân tài) và bình diện cá nhân (5 phẩm chất, 10 năng lực), mục tiêu phân kỳ giáo dục phổ thông, cùng 3 nội dung bất biến của Nguyên lý giáo dục Việt Nam.',
        level: 'basic',
        tags: [
          'EDUC2802-C2-L3',
          'CLO1',
          'CLO3',
          'Mục đích giáo dục',
          'Nguyên lí giáo dục',
          'Luật Giáo dục 2019',
          'Giáo trình tr. 25-30',
        ],
      },
      lessonMeta: {
        chapterNumber: 2,
        lessonNumber: 3,
        headings: [
          {
            id: '1-muc-dich-giao-duc',
            text: '1. Mục đích Giáo dục trên Bình diện Xã hội và Cá nhân (Trang 25 – 28)',
            depth: 2,
          },
          {
            id: '2-phan-ky-muc-tieu-gdpt',
            text: '2. Phân kỳ Mục tiêu Giáo dục Phổ thông theo 2 Giai đoạn (Trang 27 – 28)',
            depth: 2,
          },
          {
            id: '3-nguyen-li-giao-duc-viet-nam',
            text: '3. Bảng Ma trận 3 Nội dung Nguyên lí Giáo dục Việt Nam (Trang 28 – 30)',
            depth: 2,
          },
          {
            id: '4-on-tap-va-tinh-huong',
            text: '4. Tình huống Thực hành 5 Bước & Đề cương Tự luận Chương 2',
            depth: 2,
          },
        ],
        blocks: [],
      },
    };
  }

  return null;
}
