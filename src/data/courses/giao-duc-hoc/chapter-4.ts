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
  HelpCircle,
  Layers,
  Scale,
  ShieldCheck,
  Target,
  Users,
} from 'lucide-react';
import { createElement, type FC } from 'react';
import type { PedagogicalCaseStudy } from './course';

// ============================================================================
// 1. COMPONENT BÀI 4.1: CHỨC NĂNG VÀ NHIỆM VỤ CỦA NGƯỜI GIÁO VIÊN CHỦ NHIỆM LỚP (TR. 67–69)
// ============================================================================

export const Lesson4_1View: FC = () => {
  const caseStudy4_1: PedagogicalCaseStudy = {
    id: 401,
    title: 'Phát huy chức năng cố vấn tự quản và quyền hạn của GVCN theo Điều lệ trường học 2020',
    context:
      'Trong học kỳ I, giáo viên chủ nhiệm lớp 10B vì muốn lớp đạt danh hiệu Tiên tiến xuất sắc nên đã tự mình làm thay toàn bộ công việc của Ban cán sự lớp: từ phân công trực nhật, ghi sổ đầu bài, thu quỹ lớp đến điều hành tiết Sinh hoạt lớp. Hậu quả là đội ngũ cán bộ lớp trở nên thụ động, ỷ lại; mỗi khi vắng mặt GVCN là lớp học mất trật tự và không ai đứng ra nhắc nhở.',
    question:
      'Vận dụng lý luận về 4 chức năng và hệ thống nhiệm vụ, quyền hạn của người giáo viên chủ nhiệm lớp (Giáo trình Giáo dục học HCMUE tr. 67–69; Điều lệ trường trung học TT 32/2020/TT-BGDĐT), anh/chị hãy phân tích sai lầm trên và xử lí tình huống theo quy trình 5 bước.',
    principlesApplied: [
      '4 chức năng của GVCN: Đặc biệt là Chức năng cố vấn cho hoạt động tự quản của tập thể học sinh (Giáo trình tr. 67–68)',
      'Điều 29 và Điều 31 Thông tư 32/2020/TT-BGDĐT (Nhiệm vụ và quyền hạn của GVCN lớp)',
      'Nguyên tắc tôn trọng nhân cách học sinh kết hợp với yêu cầu hợp lí và giáo dục trong tập thể',
    ],
    solutionSteps: [
      {
        step: 1,
        title: 'Bước 1: Nhận diện sự việc và xác định vấn đề cần giải quyết',
        content:
          'Giáo viên chủ nhiệm đã rơi vào khuynh hướng "bao biện, làm thay", đánh đồng chức năng quản lí với việc làm thay học sinh, làm triệt tiêu năng lực tự quản của Ban cán sự và tập thể lớp 10B.',
      },
      {
        step: 2,
        title: 'Bước 2: Thu thập thông tin và phân tích nguyên nhân theo lý luận Chương 4',
        content:
          'Theo Giáo trình HCMUE (tr. 67–68), chức năng cốt lõi của GVCN không phải là cai quản hành chính mà là cố vấn, hướng dẫn để học sinh chuyển từ đối tượng quản lí sang chủ thể tự quản. Khi GVCN ôm đồm mọi việc, cán bộ lớp không có cơ hội rèn luyện kỹ năng tổ chức và mất uy tín trước các bạn.',
      },
      {
        step: 3,
        title: 'Bước 3: Đề xuất các phương án giải quyết khả thi',
        content:
          'Phương án 1: Thay toàn bộ Ban cán sự lớp mới vì cho rằng các em yếu kém (sai lầm vì nguyên nhân xuất phát từ cách quản lí của GVCN). Phương án 2: Tổ chức họp Ban cán sự lớp, phân권 rõ ràng gắn với bồi dưỡng kỹ năng điều hành và chuyển vai trò của GVCN sang vị trí cố vấn.',
      },
      {
        step: 4,
        title: 'Bước 4: Lựa chọn phương án tối ưu và tổ chức thực hiện tác động sư phạm',
        content:
          'GVCN lựa chọn Phương án 2: (1) Thiết lập bảng phân công nhiệm vụ cụ thể cho Lớp trưởng, các Lớp phó và Tổ trưởng; (2) Hướng dẫn Ban cán sự chuẩn bị nội dung và trực tiếp điều hành tiết Sinh hoạt lớp cuối tuần; (3) GVCN ngồi dự với tư cách cố vấn, chỉ can thiệp hoặc định hướng khi có vấn đề vượt quá khả năng giải quyết của học sinh.',
      },
      {
        step: 5,
        title: 'Bước 5: Đánh giá kết quả, theo dõi hỗ trợ và rút kinh nghiệm sư phạm',
        content:
          'Sau mỗi tuần, GVCN họp ngắn 10 phút với Ban cán sự để rút kinh nghiệm, biểu dương sự chủ động của các em trước lớp nhằm củng cố uy tín cho đội ngũ tự quản.',
      },
    ],
    pitfallsToAvoid: [
      'Bao biện, làm thay mọi việc của học sinh vì tâm lý thiếu tin tưởng vào năng lực của các em.',
      'Ngược lại, buông lỏng hoàn toàn ("khoán trắng" cho lớp trưởng) mà không có sự kiểm tra, cố vấn sư phạm.',
    ],
    coreLesson:
      'Người giáo viên chủ nhiệm giỏi không phải là người làm thay học sinh mọi việc, mà là nhà cố vấn biết trao quyền và bồi dưỡng để tập thể học sinh tự vận hành một cách dân chủ, kỉ cương.',
  };

  return createElement(
    'div',
    { className: 'space-y-8 text-[#29383D] leading-relaxed' },

    // 1. THANH METADATA & ĐỐI CHIẾU ĐẦU BÀI
    createElement(PedagogyMetadataBar, {
      courseCode: 'EDUC2802',
      clos: ['CLO6'],
      textbookPages: 'Tr. 67–69 (Chương 4, Mục 4.1)',
      legalRefs: [
        'Thông tư 28/2020/TT-BGDĐT (Điều lệ trường Tiểu học — Điều 27, 29)',
        'Thông tư 32/2020/TT-BGDĐT (Điều lệ trường THCS, THPT — Điều 29, 31)',
        'Luật Giáo dục 2019 (Điều 69, 70)',
      ],
      sessionNote: 'Lý thuyết & Thảo luận Chương 4',
    }),

    // PHẦN I: 4 CHỨC NĂNG CỐT LÕI CỦA NGƯỜI GIÁO VIÊN CHỦ NHIỆM LỚP (TR. 67–68)
    createElement(
      'section',
      { id: '1-bon-chuc-nang-cua-gvcn', className: 'space-y-4' },
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
          '1. Vị trí và 4 chức năng cốt lõi của người giáo viên chủ nhiệm lớp (Giáo trình tr. 67–68)',
        ),
      ),
      createElement(
        'div',
        { className: 'text-sm text-[#29383D]' },
        'Theo ',
        createElement('strong', null, 'Giáo trình Giáo dục học HCMUE (tr. 67–68)'),
        ', giáo viên chủ nhiệm (GVCN) là người thay mặt Hiệu trưởng quản lí toàn diện một lớp học, là linh hồn của tập thể học sinh và là lực lượng nòng cốt điều phối mọi tác động sư phạm đối với lớp mình phụ trách.',
        createElement(
          Sidenote,
          {
            number: 1,
            type: 'pedagogy',
            title: 'Chuyển dịch từ "Người cai quản" sang "Nhà cố vấn tự quản"',
          },
          'Trong nhà trường hiện đại theo Chương trình GDPT 2018, GVCN không phải là "người giám thị" giám sát lỗi lầm của học sinh, mà là nhà cố vấn sư phạm giúp học sinh phát triển năng lực tự chủ, tự quản và hợp tác.',
        ),
      ),

      createElement(NumberedProcessFlow, {
        title:
          'Hệ thống 4 chức năng của người giáo viên chủ nhiệm lớp (Giáo trình HCMUE tr. 67–68)',
        subtitle:
          'Bốn chức năng gắn kết hữu cơ, phản ánh vai trò quản lí, cố vấn, đại diện và điều phối của GVCN ở trường phổ thông.',
        columns: 2,
        steps: [
          {
            number: 1,
            title: 'Chức năng quản lí – giáo dục toàn diện học sinh lớp chủ nhiệm',
            badge: 'Chức năng 1',
            description:
              'Thay mặt Hiệu trưởng quản lí, theo dõi, tổ chức và đánh giá sự phát triển toàn diện về phẩm chất và năng lực của từng học sinh cũng như toàn bộ tập thể lớp theo mục tiêu cấp học.',
          },
          {
            number: 2,
            title: 'Chức năng cố vấn cho hoạt động tự quản của tập thể học sinh',
            badge: 'Chức năng 2',
            description:
              'Định hướng, bồi dưỡng đội ngũ cán bộ lớp, cán bộ Đoàn/Đội; hướng dẫn học sinh tự lập kế hoạch, tự tổ chức hoạt động và tự đánh giá, chuyển từ quản lí của thầy sang tự quản của trò.',
          },
          {
            number: 3,
            title: 'Chức năng cầu nối giữa các lực lượng giáo dục trong nhà trường',
            badge: 'Chức năng 3',
            description:
              'Là cầu nối hai chiều giữa Hiệu trưởng, các giáo viên bộ môn, tổ chức Đoàn Thanh niên, Đội Thiếu niên Tiền phong với tập thể lớp; đồng thời đại diện bảo vệ quyền và lợi ích chính đáng của học sinh.',
          },
          {
            number: 4,
            title: 'Chức năng phối hợp các lực lượng giáo dục ngoài nhà trường',
            badge: 'Chức năng 4',
            description:
              'Chủ động liên kết, thống nhất yêu cầu và phương pháp giáo dục giữa Nhà trường với Cha mẹ học sinh (Ban đại diện CMHS) và các tổ chức chính trị – xã hội tại địa phương.',
          },
        ],
      }),
    ),

    // PHẦN II: NHIỆM VỤ VÀ QUYỀN HẠN CỦA GVCN THEO ĐIỀU LỆ TRƯỜNG HỌC 2020 (TR. 68–69)
    createElement(
      'section',
      { id: '2-nhiem-vu-va-quyen-han-cua-gvcn', className: 'space-y-4' },
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
          '2. Nhiệm vụ và quyền hạn của GVCN theo Điều lệ trường học 2020 (Giáo trình tr. 68–69)',
        ),
      ),

      createElement(LegalReferenceBox, {
        documentTitle:
          'Thông tư số 32/2020/TT-BGDĐT (Điều lệ trường THCS, THPT và trường phổ thông có nhiều cấp học)',
        article: 'Điều 29 (Nhiệm vụ của GVCN) & Điều 31 (Quyền của GVCN)',
        quote:
          'Giáo viên chủ nhiệm có nhiệm vụ xây dựng kế hoạch các hoạt động giáo dục thể hiện rõ mục tiêu, nội dung, phương pháp giáo dục bảo đảm tính khả thi, phù hợp với đặc điểm học sinh, với hoàn cảnh và điều kiện thực tế nhằm thúc đẩy sự tiến bộ của cả lớp và của từng học sinh; phối hợp chặt chẽ với cha mẹ học sinh hoặc người giám hộ, giáo viên bộ môn, Đoàn TNCS Hồ Chí Minh, Đội TNTP Hồ Chí Minh và các tổ chức xã hội có liên quan.',
        pedagogicalAnalysis:
          'Điều lệ 2020 trao cho GVCN 5 quyền hạn đặc thù tại Khoản 2 Điều 31: (a) Được dự các giờ học, hoạt động giáo dục khác của học sinh lớp mình; (b) Được dự các cuộc họp của hội đồng khen thưởng và hội đồng kỷ luật khi giải quyết những vấn đề có liên quan đến học sinh của lớp mình; (c) Được dự các lớp bồi dưỡng, hội nghị chuyên đề về công tác chủ nhiệm; (d) Được quyền cho phép cá nhân học sinh có lý do chính đáng nghỉ học không quá 03 ngày liên tục; (đ) Được giảm định mức giờ dạy mỗi tuần (04 tiết/tuần ở THCS, THPT; 03 tiết/tuần ở Tiểu học).',
      }),

      createElement(ComparativeTable, {
        title:
          'Bảng đối sánh Nhiệm vụ và Quyền hạn của Giáo viên chủ nhiệm theo Điều lệ trường học 2020',
        subtitle:
          'Tổng hợp theo Thông tư 28/2020/TT-BGDĐT (Tiểu học), Thông tư 32/2020/TT-BGDĐT (THCS, THPT) và Giáo trình HCMUE tr. 68–69.',
        headers: [
          'Khía cạnh pháp lý – sư phạm',
          'Nội dung nhiệm vụ trọng tâm của GVCN',
          'Quyền hạn tương ứng của GVCN',
        ],
        rows: [
          [
            '1. Tìm hiểu & Quản lí học sinh',
            'Tìm hiểu, nắm vững hoàn cảnh, đặc điểm tâm sinh lí, phẩm chất, năng lực của từng học sinh trong lớp; lập kế hoạch giáo dục lớp chủ nhiệm khả thi.',
            'Được dự các giờ học và hoạt động giáo dục khác của học sinh lớp mình chủ nhiệm để quan sát, nắm bắt tình hình thực tế.',
          ],
          [
            '2. Tổ chức hoạt động & Tự quản',
            'Tổ chức tiết Sinh hoạt lớp, các hoạt động trải nghiệm, hướng nghiệp và bồi dưỡng đội ngũ cán bộ lớp tự quản.',
            'Được giảm định mức tiết dạy hàng tuần (03 tiết ở Tiểu học; 04 tiết ở THCS và THPT) và được tham dự các lớp bồi dưỡng nghiệp vụ chủ nhiệm.',
          ],
          [
            '3. Đánh giá, Khen thưởng & Kỷ luật',
            'Phối hợp với giáo viên bộ môn đánh giá kết quả rèn luyện và học tập của học sinh theo Thông tư 27/2020 (Tiểu học) và Thông tư 22/2021 (THCS, THPT).',
            'Được dự họp Hội đồng khen thưởng và Hội đồng kỷ luật khi giải quyết các vấn đề liên quan đến học sinh lớp mình chủ nhiệm.',
          ],
          [
            '4. Quản lí chuyên cần & Phối hợp gia đình',
            'Theo dõi chuyên cần, phối hợp thường xuyên với cha mẹ học sinh và các đoàn thể xã hội để hỗ trợ học sinh có hoàn cảnh khó khăn hoặc nguy cơ bỏ học.',
            'Được quyền cho phép cá nhân học sinh có lý do chính đáng nghỉ học không quá 03 ngày liên tục (trên 03 ngày thuộc thẩm quyền của Hiệu trưởng).',
          ],
        ],
      }),
    ),

    // PHẦN III: CÂU HỎI ÔN TẬP & TÌNH HUỐNG THỰC HÀNH
    createElement(
      'section',
      { id: '3-on-tap-va-tinh-huong-bai-4-1', className: 'space-y-6' },
      createElement(
        'div',
        {
          className:
            'flex items-center gap-2 border-b border-[#CFDADB] pb-2 font-serif text-xl font-bold text-[#29383D]',
        },
        createElement(HelpCircle, { className: 'h-5 w-5 text-[#3F6570]' }),
        createElement('h3', null, '3. Câu hỏi tự luận ôn tập và Tình huống vận dụng (CLO6)'),
      ),
      createElement(
        'div',
        { className: 'rounded-2xl border border-[#CFDADB] bg-[#F7FAFA] p-5 space-y-2' },
        createElement(
          'p',
          { className: 'text-sm font-bold text-[#29383D]' },
          'Câu hỏi ôn tập (Giáo trình HCMUE tr. 82): Phân tích 4 chức năng của người giáo viên chủ nhiệm lớp. Tại sao nói chức năng cố vấn cho hoạt động tự quản của tập thể học sinh có ý nghĩa quyết định đối với việc hình thành năng lực tự chủ của học sinh phổ thông?',
        ),
        createElement(
          'p',
          { className: 'text-xs text-[#55676B]' },
          'Gợi ý trả lời: Làm rõ 4 chức năng (Quản lí – giáo dục toàn diện; Cố vấn tự quản; Cầu nối trong trường; Phối hợp ngoài trường). Nhấn mạnh chức năng cố vấn giúp chuyển hóa yêu cầu sư phạm của GVCN thành nhu cầu tự rèn luyện của tập thể học sinh.',
        ),
      ),
      createElement(CaseStudyBox, { caseStudy: caseStudy4_1 }),
    ),
  );
};

// ============================================================================
// 2. COMPONENT BÀI 4.2: TÌM HIỂU HỌC SINH, LẬP KẾ HOẠCH VÀ XÂY DỰNG TẬP THỂ HỌC SINH (TR. 70–77)
// ============================================================================

export const Lesson4_2View: FC = () => {
  const caseStudy4_2: PedagogicalCaseStudy = {
    id: 402,
    title:
      'Xây dựng tập thể học sinh đầu cấp và hóa giải hiện tượng chia bè phái trong lớp chủ nhiệm',
    context:
      'Bước vào học kỳ I lớp 10, tập thể lớp 10A4 gồm 42 học sinh đến từ 6 trường THCS khác nhau. Trong 4 tuần đầu, các em chỉ chơi theo nhóm đồng hương trường cũ, thiếu sự gắn kết chung. Khi thảo luận bầu Ban cán sự lớp và phân công chuẩn bị hội trại 26/3, các nhóm bất đồng ý kiến gay gắt và đùn đẩy trách nhiệm cho nhau.',
    question:
      'Vận dụng lý luận về Quy trình 6 bước lập kế hoạch chủ nhiệm, 3 giai đoạn phát triển tập thể học sinh và 4 biện pháp xây dựng tập thể vững mạnh (Giáo trình Giáo dục học HCMUE tr. 70–77), anh/chị hãy xử lí tình huống theo quy trình 5 bước.',
    principlesApplied: [
      'Quy trình 6 bước xây dựng kế hoạch giáo dục lớp chủ nhiệm (Giáo trình tr. 71–73)',
      '3 giai đoạn phát triển tập thể học sinh của A.S. Makarenko và 4 biện pháp xây dựng tập thể (Giáo trình tr. 73–77)',
      'Nguyên tắc giáo dục trong tập thể và bằng tập thể',
    ],
    solutionSteps: [
      {
        step: 1,
        title: 'Bước 1: Nhận diện sự việc và xác định vấn đề cần giải quyết',
        content:
          'Lớp 10A4 đang ở Giai đoạn 1 (Giai đoạn tổng hợp sơ bộ: học sinh chưa hiểu nhau, xuất hiện các nhóm tự phát theo trường cũ, chưa có đội ngũ cốt cán đủ uy tín và viễn cảnh chung).',
      },
      {
        step: 2,
        title: 'Bước 2: Thu thập thông tin và phân tích nguyên nhân theo lý luận Chương 4',
        content:
          'GVCN sử dụng phiếu khảo sát đầu năm và quan sát thực tế để nắm bắt sở trường, tính cách và nguyện vọng của 42 học sinh (Mục 4.2.1 Giáo trình tr. 70–71), nhận diện những cá nhân tích cực ở mỗi nhóm trường cũ có khả năng làm hạt nhân đoàn kết.',
      },
      {
        step: 3,
        title: 'Bước 3: Đề xuất các phương án giải quyết khả thi',
        content:
          'Phương án 1: GVCN dùng mệnh lệnh hành chính ép buộc các nhóm phải làm theo phân công của giáo viên. Phương án 2: Tổ chức lại sơ đồ chỗ ngồi xen kẽ, kiện toàn Ban cán sự đại diện các nhóm và thiết lập hệ thống viễn cảnh gần – trung bình – xa để gắn kết tập thể.',
      },
      {
        step: 4,
        title: 'Bước 4: Lựa chọn phương án tối ưu và tổ chức thực hiện tác động sư phạm',
        content:
          'Áp dụng 4 biện pháp xây dựng tập thể (Giáo trình tr. 75–77): (1) Tổ chức hoạt động phá băng "Hành trình kết nối 10A4" và xếp tổ học tập đa dạng thành viên; (2) Bầu Ban cán sự lâm thời có đại diện năng nổ từ các nhóm để tạo "cơ quan ngôn luận" chuyển tải yêu cầu của GVCN (chuyển sang Giai đoạn 2); (3) Đặt viễn cảnh gần hấp dẫn là dự án Hội trại với sự phân công theo sở trường (nhóm thiết kế, nhóm ẩm thực, nhóm văn nghệ) thay vì chia theo trường cũ.',
      },
      {
        step: 5,
        title: 'Bước 5: Đánh giá kết quả, theo dõi hỗ trợ và rút kinh nghiệm sư phạm',
        content:
          'Tổng kết hoạt động Hội trại trong tiết Sinh hoạt lớp, biểu dương tinh thần hợp tác liên nhóm, tiến tới bầu Ban cán sự chính thức và xây dựng truyền thống, dư luận tập thể lành mạnh (hướng tới Giai đoạn 3).',
      },
    ],
    pitfallsToAvoid: [
      'Nóng vội áp dụng cơ chế tự quản toàn diện ngay từ tuần đầu tiên khi tập thể còn ở Giai đoạn 1 (chưa có hạt nhân cốt cán).',
      'Bầu Ban cán sự chỉ tập trung vào một nhóm đồng hương khiến các nhóm khác cảm thấy bị phân biệt đối xử.',
    ],
    coreLesson:
      'Xây dựng tập thể học sinh là một quá trình phát triển có tính giai đoạn: GVCN phải đi từ yêu cầu kiên quyết gắn với tìm hiểu học sinh (Giai đoạn 1), qua bồi dưỡng đội ngũ cốt cán (Giai đoạn 2), đến phát huy dư luận tập thể tự quản (Giai đoạn 3).',
  };

  return createElement(
    'div',
    { className: 'space-y-8 text-[#29383D] leading-relaxed' },

    // 1. THANH METADATA & ĐỐI CHIẾU ĐẦU BÀI
    createElement(PedagogyMetadataBar, {
      courseCode: 'EDUC2802',
      clos: ['CLO6', 'CLO7'],
      textbookPages: 'Tr. 70–77 (Chương 4, Mục 4.2.1 – 4.2.3)',
      legalRefs: [
        'Thông tư 32/2020/TT-BGDĐT (Điều 29 — Kế hoạch giáo dục của GVCN)',
        'Thông tư 20/2018/TT-BGDĐT (Tiêu chuẩn 3: Xây dựng môi trường giáo dục)',
      ],
      sessionNote: 'Lý thuyết, Thảo luận & Thực hành 2',
    }),

    // PHẦN I: NỘI DUNG VÀ CÁCH THỨC TÌM HIỂU, PHÂN LOẠI HỌC SINH (TR. 70–71)
    createElement(
      'section',
      { id: '1-tim-hieu-va-phan-loai-hoc-sinh', className: 'space-y-4' },
      createElement(
        'div',
        {
          className:
            'flex items-center gap-2 border-b border-[#CFDADB] pb-2 font-serif text-xl font-bold text-[#29383D]',
        },
        createElement(Users, { className: 'h-5 w-5 text-[#3F6570]' }),
        createElement(
          'h3',
          null,
          '1. Tìm hiểu và phân loại học sinh lớp chủ nhiệm (Giáo trình tr. 70–71)',
        ),
      ),
      createElement(
        'div',
        { className: 'text-sm text-[#29383D]' },
        'Theo ',
        createElement('strong', null, 'Giáo trình Giáo dục học HCMUE (tr. 70–71)'),
        ', tìm hiểu học sinh là khâu mở đầu tiên quyết của công tác chủ nhiệm lớp. Muốn giáo dục con người về mọi mặt thì trước hết phải hiểu con người về mọi mặt.',
        createElement(
          Sidenote,
          {
            number: 1,
            type: 'history',
            title: 'K.D. Ushinsky về tầm quan trọng của việc hiểu học sinh',
          },
          '"Nếu giáo dục học muốn giáo dục con người về mọi mặt thì trước hết nó phải hiểu con người về mọi mặt." Việc phân loại học sinh nhằm mục đích cá biệt hóa tác động hỗ trợ, tuyệt đối không phải để dán nhãn hay kỳ thị.',
        ),
      ),

      createElement(ComparativeTable, {
        title:
          'Ma trận Nội dung và Phương pháp tìm hiểu học sinh lớp chủ nhiệm (Giáo trình tr. 70–71)',
        subtitle:
          'Kết hợp đồng bộ các kênh thu thập thông tin để có bức tranh toàn diện, khách quan về từng học sinh và cả lớp.',
        headers: [
          'Nhóm nội dung cần tìm hiểu',
          'Các chỉ báo thông tin cụ thể',
          'Phương pháp & Cách thức thu thập',
        ],
        rows: [
          [
            '1. Hoàn cảnh gia đình & Đời sống xã hội',
            'Điều kiện kinh tế, cấu trúc gia đình, nghề nghiệp và quan điểm giáo dục của cha mẹ, môi trường cư trú, nhóm bạn bè ngoài trường.',
            'Nghiên cứu hồ sơ học sinh, phiếu thông tin đầu năm, trao đổi trực tiếp với phụ huynh, thăm gia đình học sinh khi cần thiết.',
          ],
          [
            '2. Đặc điểm thể chất & Tâm sinh lí',
            'Tình trạng sức khỏe, thị lực, bệnh lí đặc biệt; khí chất, tính cách, hứng thú, nguyện vọng, những khó khăn tâm lí lứa tuổi.',
            'Quan sát sư phạm trong giờ học và giờ ra chơi, trò chuyện thân mật, phối hợp với nhân viên y tế và bộ phận tư vấn tâm lí học đường.',
          ],
          [
            '3. Phẩm chất đạo đức & Năng lực học tập',
            'Thái độ học tập, ý thức tổ chức kỷ luật, kết quả học tập các môn, năng khiếu đặc biệt và vị thế của học sinh trong tập thể lớp.',
            'Phân tích học bạ năm trước, trao đổi với GVCN cũ, GV bộ môn, Ban cán sự lớp và phân tích sản phẩm hoạt động của học sinh.',
          ],
        ],
      }),
    ),

    // PHẦN II: QUY TRÌNH 6 BƯỚC XÂY DỰNG KẾ HOẠCH GIÁO DỤC LỚP CHỦ NHIỆM (TR. 71–73)
    createElement(
      'section',
      { id: '2-quy-trinh-6-buoc-lap-ke-hoach-chu-nhiem', className: 'space-y-4' },
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
          '2. Quy trình 6 bước xây dựng kế hoạch giáo dục lớp chủ nhiệm (Giáo trình tr. 71–73)',
        ),
      ),

      createElement(NumberedProcessFlow, {
        title:
          'Quy trình 6 bước xây dựng kế hoạch giáo dục lớp chủ nhiệm (Giáo trình HCMUE tr. 71–73)',
        subtitle:
          'Quy trình chuẩn áp dụng cho việc lập kế hoạch năm học, học kỳ, tháng và tuần của giáo viên chủ nhiệm (phục vụ trực tiếp Bài Thực hành 2).',
        columns: 2,
        steps: [
          {
            number: 1,
            title: 'Bước 1: Nghiên cứu mục tiêu, kế hoạch năm học của nhà trường và tình hình lớp',
            badge: 'Khảo sát căn cứ',
            description:
              'Nghiên cứu phương hướng nhiệm vụ năm học của trường, kế hoạch của Đoàn/Đội và kết hợp kết quả điều tra đặc điểm (thuận lợi, khó khăn) của lớp chủ nhiệm.',
          },
          {
            number: 2,
            title: 'Bước 2: Xác định mục tiêu và phương hướng chung của lớp chủ nhiệm',
            badge: 'Định vị mục tiêu',
            description:
              'Xác định rõ các chỉ tiêu phấn đấu về phẩm chất, năng lực học tập, nề nếp chuyên cần, các hoạt động phong trào và danh hiệu tập thể lớp trong năm học.',
          },
          {
            number: 3,
            title: 'Bước 3: Xác định nội dung, hình thức, biện pháp và lịch trình thực hiện',
            badge: 'Thiết kế chi tiết',
            description:
              'Cụ thể hóa từng mảng công tác (học tập, rèn luyện đạo đức, hoạt động trải nghiệm, phối hợp CMHS) gắn với thời gian (từng tháng/tuần), người phụ trách và nguồn lực.',
          },
          {
            number: 4,
            title: 'Bước 4: Tổ chức lấy ý kiến đóng góp và thông qua kế hoạch',
            badge: 'Dân chủ hóa kế hoạch',
            description:
              'Đưa bản dự thảo kế hoạch ra thảo luận dân chủ với đội ngũ cán bộ lớp, tập thể học sinh, hội nghị Cha mẹ học sinh đầu năm và trình Ban giám hiệu phê duyệt.',
          },
          {
            number: 5,
            title: 'Bước 5: Tổ chức triển khai thực hiện kế hoạch',
            badge: 'Tổ chức hành động',
            description:
              'Chuyển hóa kế hoạch năm học thành kế hoạch tháng/tuần; phân công nhiệm vụ rõ ràng cho các tổ, nhóm và hướng dẫn, đôn đốc học sinh thực hiện.',
          },
          {
            number: 6,
            title: 'Bước 6: Kiểm tra, đánh giá và điều chỉnh kế hoạch',
            badge: 'Phản hồi & Điều chỉnh',
            description:
              'Định kỳ kiểm tra tiến độ trong các tiết Sinh hoạt lớp, đánh giá kết quả đạt được, kịp thời điều chỉnh hoặc bổ sung các biện pháp phù hợp với diễn biến thực tiễn.',
          },
        ],
      }),
    ),

    // PHẦN III: 3 GIAI ĐOẠN PHÁT TRIỂN VÀ 4 BIỆN PHÁP XÂY DỰNG TẬP THỂ HỌC SINH (TR. 73–77)
    createElement(
      'section',
      { id: '3-xay-dung-tap-the-hoc-sinh', className: 'space-y-4' },
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
          '3. Ba giai đoạn phát triển tập thể và 4 biện pháp xây dựng tập thể học sinh vững mạnh (Giáo trình tr. 73–77)',
        ),
      ),

      createElement(ScholarQuote, {
        scholar: 'A.S. Makarenko (1888–1939)',
        work: 'Tác động song hành và Quy luật vận động của tập thể học sinh',
        quote:
          'Ngừng đặt ra những viễn cảnh mới đối với tập thể cũng có nghĩa là làm ngừng sự sống của tập thể. Tập thể học sinh chỉ thực sự trở thành môi trường giáo dục khi có mục đích chung, cơ quan tự quản có uy tín và dư luận tập thể lành mạnh.',
        analysis:
          'Giáo trình HCMUE (tr. 73–77) phân tích sự phát triển của tập thể học sinh qua 3 giai đoạn từ thấp đến cao, đòi hỏi GVCN phải thay đổi linh hoạt phương pháp lãnh đạo tương ứng với từng giai đoạn.',
      }),

      createElement(ComparativeTable, {
        title:
          'Bảng đối sánh 3 Giai đoạn phát triển của tập thể học sinh (Giáo trình HCMUE tr. 74–75)',
        subtitle:
          'Sự chuyển hóa biện chứng từ yêu cầu đơn phương của GVCN sang cơ chế tự quản của toàn thể tập thể lớp.',
        headers: [
          'Giai đoạn phát triển',
          'Đặc điểm của tập thể học sinh',
          'Phương thức tác động chủ đạo của GVCN',
        ],
        rows: [
          [
            'Giai đoạn 1: Tập thể mới hình thành (Tổng hợp sơ bộ)',
            'Học sinh chưa hiểu rõ về nhau, còn bỡ ngỡ hoặc tụ tập theo nhóm nhỏ tự phát; chưa có đội ngũ cán bộ lớp đủ năng lực và uy tín.',
            'GVCN là người trực tiếp đề ra các yêu cầu sư phạm rõ ràng, kiên quyết, dứt khoát; đồng thời tích cực quan sát để phát hiện các hạt nhân tích cực.',
          ],
          [
            'Giai đoạn 2: Hình thành đội ngũ cốt cán (Phân hóa & liên kết)',
            'Đã xuất hiện đội ngũ cán bộ lớp và nhóm học sinh tích cực ủng hộ yêu cầu của GVCN; tập thể bắt đầu đi vào nề nếp hoạt động.',
            'GVCN chuyển giao dần quyền điều hành cho Ban cán sự lớp; thông qua đội ngũ cốt cán để đặt ra yêu cầu đối với các thành viên trong lớp.',
          ],
          [
            'Giai đoạn 3: Tập thể phát triển vững mạnh (Tự quản cao)',
            'Đa số học sinh gắn bó đoàn kết, có dư luận tập thể lành mạnh; mỗi thành viên tự giác đặt ra yêu cầu cao đối với bản thân và bạn bè.',
            'GVCN đóng vai trò cố vấn sư phạm; phát huy tối đa sức mạnh của dư luận tập thể và truyền thống lớp trong việc tự giáo dục.',
          ],
        ],
      }),

      createElement(NumberedProcessFlow, {
        title: '4 Biện pháp xây dựng tập thể học sinh vững mạnh (Giáo trình HCMUE tr. 75–77)',
        subtitle:
          'Hệ thống biện pháp nghiệp vụ giúp GVCN đưa lớp học tiến nhanh từ Giai đoạn 1 lên Giai đoạn 3.',
        columns: 2,
        steps: [
          {
            number: 1,
            title:
              'Biện pháp 1: Tổ chức các hoạt động chung đa dạng, hấp dẫn và xây dựng hệ thống viễn cảnh',
            badge: 'Viễn cảnh gần · trung bình · xa',
            description:
              'Thiết lập hệ thống viễn cảnh nối tiếp nhau (viễn cảnh gần như buổi dã ngoại tuần tới; viễn cảnh trung bình như hội diễn học kỳ; viễn cảnh xa như mục tiêu tốt nghiệp, hướng nghiệp) để lôi cuốn mọi học sinh cùng hành động.',
          },
          {
            number: 2,
            title: 'Biện pháp 2: Lựa chọn, kiện toàn và bồi dưỡng đội ngũ cán bộ tự quản của lớp',
            badge: 'Bồi dưỡng cốt cán',
            description:
              'Kết hợp bầu cử dân chủ với định hướng sư phạm để chọn Ban cán sự có năng lực, uy tín; hướng dẫn phương pháp làm việc và thực hiện luân phiên chức vụ để nhiều học sinh được rèn luyện.',
          },
          {
            number: 3,
            title: 'Biện pháp 3: Xây dựng truyền thống tốt đẹp và dư luận tập thể lành mạnh',
            badge: 'Dư luận tập thể',
            description:
              'Định hướng nhận thức đúng đắn của tập thể trước cái tốt và cái xấu; biến dư luận tập thể thành "bộ lọc đạo đức" khích lệ hành vi tích cực và ngăn chặn hành vi lệch chuẩn.',
          },
          {
            number: 4,
            title:
              'Biện pháp 4: Xây dựng bầu không khí tâm lí đoàn kết, thân ái và kỉ luật tự giác',
            badge: 'Kỷ luật tích cực',
            description:
              'Xây dựng bộ nội quy lớp học do chính học sinh tham gia soạn thảo; giải quyết kịp thời các mâu thuẫn nội bộ trên tinh thần tôn trọng, công bằng và nhân ái.',
          },
        ],
      }),

      createElement(LegalReferenceBox, {
        documentTitle:
          'Thông tư số 20/2018/TT-BGDĐT (Chuẩn nghề nghiệp giáo viên cơ sở giáo dục phổ thông)',
        article: 'Tiêu chuẩn 3 (Xây dựng môi trường giáo dục) — Tiêu chí 8 & Tiêu chí 9',
        quote:
          'Xây dựng văn hóa nhà trường lành mạnh, thực hiện quyền dân chủ trong nhà trường (Tiêu chí 8): Học sinh được tham gia xây dựng, thực hiện nội quy, quy tắc ứng xử văn hóa của lớp học, trường học; giáo viên lắng nghe và giải quyết thỏa đáng các ý kiến, nguyện vọng chính đáng của học sinh.',
        pedagogicalAnalysis:
          'Bốn biện pháp xây dựng tập thể học sinh trong Giáo trình HCMUE (tr. 75–77) chính là công cụ nghiệp vụ trực tiếp để người giáo viên chủ nhiệm đạt mức Khá và Tốt ở Tiêu chuẩn 3 của Chuẩn nghề nghiệp giáo viên phổ thông.',
      }),
    ),

    // PHẦN IV: CÂU HỎI ÔN TẬP & TÌNH HUỐNG THỰC HÀNH
    createElement(
      'section',
      { id: '4-on-tap-va-tinh-huong-bai-4-2', className: 'space-y-6' },
      createElement(
        'div',
        {
          className:
            'flex items-center gap-2 border-b border-[#CFDADB] pb-2 font-serif text-xl font-bold text-[#29383D]',
        },
        createElement(HelpCircle, { className: 'h-5 w-5 text-[#3F6570]' }),
        createElement('h3', null, '4. Câu hỏi tự luận ôn tập và Tình huống vận dụng (CLO6, CLO7)'),
      ),
      createElement(
        'div',
        { className: 'rounded-2xl border border-[#CFDADB] bg-[#F7FAFA] p-5 space-y-2' },
        createElement(
          'p',
          { className: 'text-sm font-bold text-[#29383D]' },
          'Câu hỏi ôn tập (Giáo trình HCMUE tr. 82): Trình bày quy trình 6 bước xây dựng kế hoạch giáo dục của giáo viên chủ nhiệm lớp và phân tích 3 giai đoạn phát triển tập thể học sinh cùng các biện pháp xây dựng tập thể vững mạnh.',
        ),
        createElement(
          'p',
          { className: 'text-xs text-[#55676B]' },
          'Gợi ý trả lời: Trình bày đầy đủ 6 bước lập kế hoạch chủ nhiệm (tr. 71–73); phân tích đặc điểm 3 giai đoạn phát triển tập thể và 4 biện pháp (hoạt động chung & viễn cảnh; bồi dưỡng cốt cán; dư luận & truyền thống; không khí đoàn kết & kỷ luật tích cực).',
        ),
      ),
      createElement(CaseStudyBox, { caseStudy: caseStudy4_2 }),
    ),
  );
};

// ============================================================================
// 3. COMPONENT BÀI 4.3: TỔ CHỨC GIÁO DỤC TOÀN DIỆN, MÔI TRƯỜNG LỚP HỌC VÀ PHỐI HỢP CÁC LỰC LƯỢNG GIÁO DỤC (TR. 78–82)
// ============================================================================

export const Lesson4_3View: FC = () => {
  const caseStudy4_3: PedagogicalCaseStudy = {
    id: 403,
    title: 'Đổi mới cuộc họp Cha mẹ học sinh và tháo gỡ xung đột giữa GV bộ môn với học sinh',
    context:
      'Trước kỳ họp Cha mẹ học sinh sơ kết học kỳ I, một số học sinh lớp 11C phản ánh với GVCN rằng các em rất sợ cuộc họp phụ huynh vì "thầy cô chỉ đọc bảng điểm, phê bình tên từng học sinh yếu kém trước cả lớp khiến bố mẹ về nhà mắng chửi nặng nề". Đồng thời, trong lớp đang có căng thẳng giữa một nhóm học sinh với giáo viên bộ môn Hóa học do các em cho rằng cô chấm điểm quá khắt khe.',
    question:
      'Vận dụng lý luận về xây dựng môi trường tâm lí – xã hội an toàn và phối hợp giữa GVCN với Giáo viên bộ môn, Gia đình học sinh (Giáo trình Giáo dục học HCMUE tr. 78–82), anh/chị hãy xử lí tình huống theo quy trình 5 bước.',
    principlesApplied: [
      'Xây dựng môi trường lớp học an toàn, thân thiện (Môi trường vật chất & Môi trường tâm lí – xã hội, Giáo trình tr. 79–80)',
      'Phối hợp đồng bộ giữa GVCN với Giáo viên bộ môn và Cha mẹ học sinh (Giáo trình tr. 80–82)',
      'Nguyên tắc tôn trọng nhân cách học sinh và thống nhất các lực lượng giáo dục',
    ],
    solutionSteps: [
      {
        step: 1,
        title: 'Bước 1: Nhận diện sự việc và xác định vấn đề cần giải quyết',
        content:
          'Có hai vấn đề cần giải quyết đồng thời: (1) Tâm lý lo sợ của học sinh trước hình thức họp phụ huynh nặng về phê bình công khai; (2) Sự thiếu thấu hiểu giữa học sinh lớp 11C với giáo viên bộ môn Hóa học.',
      },
      {
        step: 2,
        title: 'Bước 2: Thu thập thông tin và phân tích nguyên nhân theo lý luận Chương 4',
        content:
          'Theo Giáo trình HCMUE (tr. 80–82), cuộc họp CMHS là diễn đàn đồng hành sư phạm chứ không phải "phiên tòa" phán xét lỗi lầm của trẻ. Về phía môn Hóa học, GVCN cần trao đổi riêng với GV bộ môn để nắm rõ yêu cầu chuyên môn và lắng nghe tâm tư của học sinh để làm cầu nối hòa giải.',
      },
      {
        step: 3,
        title: 'Bước 3: Đề xuất các phương án giải quyết khả thi',
        content:
          'Phương án 1: Vẫn tổ chức họp phụ huynh theo lối cũ (đọc báo cáo điểm số chung) và phê bình học sinh phàn nàn về GV bộ môn. Phương án 2: Đổi mới kịch bản họp CMHS theo hướng tích cực, bảo mật nhận xét cá nhân và tổ chức cầu nối trao đổi phương pháp học tập môn Hóa học.',
      },
      {
        step: 4,
        title: 'Bước 4: Lựa chọn phương án tối ưu và tổ chức thực hiện tác động sư phạm',
        content:
          'Thực hiện đồng bộ: (1) Với GV bộ môn Hóa: GVCN trao đổi chân thành với cô về tâm lý của lớp, mời cô chia sẻ rõ tiêu chí chấm bài và bí quyết học tốt môn Hóa để học sinh hiểu thiện chí của cô; (2) Với cuộc họp CMHS: Cho học sinh viết "Thư gửi bố mẹ" đặt trên bàn; báo cáo chung tập trung vào sự trưởng thành của tập thể; kết quả điểm số và những vấn đề cần khắc phục của từng em được gửi qua phiếu kín riêng cho từng phụ huynh kèm giải pháp tư vấn.',
      },
      {
        step: 5,
        title: 'Bước 5: Đánh giá kết quả, theo dõi hỗ trợ và rút kinh nghiệm sư phạm',
        content:
          'Thu thập phản hồi từ phụ huynh sau cuộc họp và theo dõi sự chuyển biến thái độ học tập môn Hóa của lớp 11C trong các tuần tiếp theo.',
      },
    ],
    pitfallsToAvoid: [
      'Công khai điểm số thấp và lỗi vi phạm của cá nhân học sinh trước toàn thể phụ huynh gây tổn thương lòng tự trọng của cả học sinh lẫn cha mẹ.',
      'Bênh vực học sinh một chiều hoặc phê bình ngược lại đồng nghiệp trước mặt học sinh làm suy giảm uy tín của tập thể sư phạm.',
    ],
    coreLesson:
      'GVCN là nhạc trưởng kết nối các lực lượng giáo dục: phải bảo vệ danh dự của học sinh và phụ huynh bằng sự tinh tế, đồng thời giữ vững sự thống nhất sư phạm với giáo viên bộ môn.',
  };

  return createElement(
    'div',
    { className: 'space-y-8 text-[#29383D] leading-relaxed' },

    // 1. THANH METADATA & ĐỐI CHIẾU ĐẦU BÀI
    createElement(PedagogyMetadataBar, {
      courseCode: 'EDUC2802',
      clos: ['CLO6', 'CLO7'],
      textbookPages: 'Tr. 78–82 (Chương 4, Mục 4.2.4 – 4.2.6)',
      legalRefs: [
        'Luật Giáo dục 2019 (Điều 89, 90, 91 — Phối hợp Nhà trường, Gia đình và Xã hội)',
        'Thông tư 20/2018/TT-BGDĐT (Tiêu chuẩn 3 & Tiêu chuẩn 4)',
        'Thông tư 32/2020/TT-BGDĐT (Điều 29, 44)',
      ],
      sessionNote: 'Lý thuyết & Thảo luận Chương 4',
    }),

    // PHẦN I: TỔ CHỨC GIÁO DỤC TOÀN DIỆN VÀ XÂY DỰNG MÔI TRƯỜNG LỚP HỌC (TR. 78–80)
    createElement(
      'section',
      { id: '1-to-chuc-giao-duc-toan-dien-va-moi-truong-lop-hoc', className: 'space-y-4' },
      createElement(
        'div',
        {
          className:
            'flex items-center gap-2 border-b border-[#CFDADB] pb-2 font-serif text-xl font-bold text-[#29383D]',
        },
        createElement(ShieldCheck, { className: 'h-5 w-5 text-[#3F6570]' }),
        createElement(
          'h3',
          null,
          '1. Tổ chức giáo dục toàn diện và xây dựng môi trường lớp học an toàn, thân thiện (Giáo trình tr. 78–80)',
        ),
      ),
      createElement(
        'div',
        { className: 'text-sm text-[#29383D]' },
        'Theo ',
        createElement('strong', null, 'Giáo trình Giáo dục học HCMUE (tr. 78–80)'),
        ', GVCN tổ chức giáo dục toàn diện thông qua việc thúc đẩy động cơ học tập tích cực, rèn luyện kỹ năng sống, tổ chức hoạt động trải nghiệm và kiến tạo môi trường lớp học hạnh phúc trên cả hai phương diện: ',
        createElement('strong', null, 'môi trường vật chất'),
        ' và ',
        createElement('strong', null, 'môi trường tâm lí – xã hội'),
        '.',
        createElement(
          Sidenote,
          {
            number: 1,
            type: 'caution',
            title: 'An toàn tâm lí trong lớp học',
          },
          'Một lớp học có cơ sở vật chất hiện đại nhưng tồn tại sự chế giễu, cô lập bạn bè hoặc áp lực thành tích nặng nề thì chưa phải là môi trường giáo dục an toàn. An toàn tâm lí là điều kiện tiên quyết để học sinh dám bộc lộ bản thân và sáng tạo.',
        ),
      ),

      createElement(ComparativeTable, {
        title: 'Bảng đối sánh Hai thành tố của Môi trường lớp học (Giáo trình HCMUE tr. 79–80)',
        subtitle:
          'Kiến tạo không gian sư phạm xanh – sạch – đẹp về vật chất và dân chủ – tôn trọng – nhân ái về tâm lí xã hội.',
        headers: [
          'Thành tố môi trường',
          'Nội dung và Tiêu chuẩn cốt lõi',
          'Vai trò & Biện pháp tổ chức của GVCN',
        ],
        rows: [
          [
            '1. Môi trường vật chất của lớp học',
            'Không gian phòng học thông thoáng, đủ ánh sáng, bàn ghế đúng quy chuẩn lứa tuổi, góc học tập/thư viện lớp, cây xanh, khẩu hiệu hành động thẩm mỹ và an toàn.',
            'Hướng dẫn học sinh tự trang trí lớp học xanh – sạch – đẹp, phân công tổ trực nhật duy trì vệ sinh và bảo quản tài sản chung của lớp.',
          ],
          [
            '2. Môi trường tâm lí – xã hội của lớp học',
            'Hệ thống quan hệ ứng xử thầy – trò và bạn – bạn dựa trên sự tôn trọng, đồng cảm, dân chủ, công bằng; không có bạo lực học đường hay kỳ thị.',
            'Xây dựng quy tắc ứng xử tích cực, lắng nghe học sinh không phán xét, phát hiện sớm và hóa giải kịp thời các xung đột tâm lí hoặc nguy cơ bắt nạt học đường.',
          ],
        ],
      }),
    ),

    // PHẦN II: PHỐI HỢP GIỮA GVCN VỚI CÁC LỰC LƯỢNG GIÁO DỤC (TR. 80–82)
    createElement(
      'section',
      { id: '2-phoi-hop-cac-luc-luong-giao-duc', className: 'space-y-4' },
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
          '2. Phối hợp giữa GVCN với Đoàn/Đội, Giáo viên bộ môn và Gia đình học sinh (Giáo trình tr. 80–82)',
        ),
      ),

      createElement(NumberedProcessFlow, {
        title:
          'Cơ chế phối hợp 3 trục lực lượng giáo dục của Giáo viên chủ nhiệm (Giáo trình HCMUE tr. 80–82)',
        subtitle:
          'Đảm bảo sự thống nhất mục tiêu, nội dung và phương pháp tác động tới học sinh lớp chủ nhiệm.',
        columns: 3,
        steps: [
          {
            number: 1,
            title: 'Trục 1: Phối hợp với Đoàn TNCS Hồ Chí Minh và Đội TNTP Hồ Chí Minh',
            badge: 'Tổ chức Đoàn · Đội',
            description:
              'Đồng hành cùng Chi đoàn lớp / Chi đội trong việc thiết kế hoạt động phong trào, rèn luyện đoàn viên – đội viên và phát huy vai trò tự quản của BCH Chi đoàn/Chi đội gắn với Ban cán sự lớp.',
          },
          {
            number: 2,
            title: 'Trục 2: Phối hợp với đội ngũ Giáo viên bộ môn giảng dạy tại lớp',
            badge: 'Giáo viên bộ môn',
            description:
              'Cung cấp thông tin đặc điểm học sinh cho GV bộ môn đầu năm; thường xuyên trao đổi về nề nếp, thái độ học tập từng môn; thống nhất biện pháp phụ đạo học sinh chưa đạt và bồi dưỡng học sinh năng khiếu.',
          },
          {
            number: 3,
            title: 'Trục 3: Phối hợp với Gia đình học sinh và Ban đại diện CMHS',
            badge: 'Gia đình & Xã hội',
            description:
              'Thiết lập kênh liên lạc hai chiều thường xuyên (sổ liên lạc điện tử, trao đổi cá nhân, họp CMHS đổi mới); tư vấn kiến thức tâm lí – giáo dục gia đình để cha mẹ đồng hành cùng nhà trường.',
          },
        ],
      }),

      createElement(LegalReferenceBox, {
        documentTitle: 'Luật Giáo dục số 43/2019/QH14 & Thông tư 20/2018/TT-BGDĐT',
        article: 'Điều 89, 90, 91 Luật Giáo dục 2019 & Tiêu chuẩn 4 Thông tư 20/2018/TT-BGDĐT',
        quote:
          'Nhà trường có trách nhiệm chủ động phối hợp với gia đình và xã hội để tổ chức hoặc tham gia các hoạt động giáo dục theo kế hoạch của nhà trường, bảo đảm an toàn cho người dạy và người học; thông báo về kết quả học tập, rèn luyện của người học cho cha mẹ hoặc người giám hộ.',
        pedagogicalAnalysis:
          'Tại Tiêu chuẩn 4 (Phát triển mối quan hệ giữa nhà trường, gia đình và xã hội) của Thông tư 20/2018/TT-BGDĐT, GVCN giữ vai trò hạt nhân trong việc tạo dựng mối quan hệ hợp tác tin cậy với cha mẹ học sinh và huy động nguồn lực xã hội hóa hợp pháp phục vụ hoạt động giáo dục.',
      }),
    ),

    // PHẦN III: CÂU HỎI ÔN TẬP & TÌNH HUỐNG THỰC HÀNH
    createElement(
      'section',
      { id: '3-on-tap-va-tinh-huong-bai-4-3', className: 'space-y-6' },
      createElement(
        'div',
        {
          className:
            'flex items-center gap-2 border-b border-[#CFDADB] pb-2 font-serif text-xl font-bold text-[#29383D]',
        },
        createElement(HelpCircle, { className: 'h-5 w-5 text-[#3F6570]' }),
        createElement('h3', null, '3. Câu hỏi tự luận ôn tập và Tình huống vận dụng (CLO6, CLO7)'),
      ),
      createElement(
        'div',
        { className: 'rounded-2xl border border-[#CFDADB] bg-[#F7FAFA] p-5 space-y-2' },
        createElement(
          'p',
          { className: 'text-sm font-bold text-[#29383D]' },
          'Câu hỏi ôn tập (Giáo trình HCMUE tr. 82): Phân tích nội dung xây dựng môi trường lớp học và cơ chế phối hợp giữa giáo viên chủ nhiệm với các lực lượng giáo dục trong và ngoài nhà trường.',
        ),
        createElement(
          'p',
          { className: 'text-xs text-[#55676B]' },
          'Gợi ý trả lời: Làm rõ 2 thành tố môi trường lớp học (vật chất và tâm lí – xã hội) và 3 trục phối hợp lực lượng giáo dục (Đoàn/Đội, Giáo viên bộ môn, Gia đình & cộng đồng).',
        ),
      ),
      createElement(CaseStudyBox, { caseStudy: caseStudy4_3 }),
    ),
  );
};

// Bí danh tương thích ngược
export const Lesson4_4View: FC = Lesson4_3View;

// ============================================================================
// 4. DISPATCHER TRÌNH NẠP BÀI HỌC CHƯƠNG 4 (GETCHAPTER4LESSONMODULE)
// ============================================================================

export function getChapter4LessonModule(lessonId: string): CompiledLessonModule | null {
  if (
    lessonId === 'gdh-c4-b1-chuc-nang-va-nhiem-vu-cua-nguoi-giao-vien-chu-nhiem-lop' ||
    lessonId === 'gdh-c4-b1-vi-tri-chuc-nang-va-nhiem-vu-cua-gvcn'
  ) {
    return {
      default: Lesson4_1View,
      frontmatter: {
        title: 'Bài 4.1: Chức năng và nhiệm vụ của người giáo viên chủ nhiệm lớp',
        description:
          'Phân tích 4 chức năng cốt lõi của GVCN (Quản lí – giáo dục toàn diện, Cố vấn tự quản, Cầu nối trong trường, Phối hợp ngoài trường) và đối sánh nhiệm vụ, quyền hạn của GVCN theo Điều lệ trường học 2020 (Giáo trình HCMUE tr. 67–69).',
        level: 'basic',
        tags: [
          'CLO6',
          'GVCN',
          '4 Chức năng GVCN',
          'Điều lệ trường học 2020',
          'Giáo trình tr. 67-69',
        ],
      },
      lessonMeta: {
        chapterNumber: 4,
        lessonNumber: 1,
        headings: [
          {
            id: '1-bon-chuc-nang-cua-gvcn',
            text: '1. Vị trí và 4 chức năng cốt lõi của người giáo viên chủ nhiệm lớp (Giáo trình tr. 67–68)',
            depth: 2,
          },
          {
            id: '2-nhiem-vu-va-quyen-han-cua-gvcn',
            text: '2. Nhiệm vụ và quyền hạn của GVCN theo Điều lệ trường học 2020 (Giáo trình tr. 68–69)',
            depth: 2,
          },
          {
            id: '3-on-tap-va-tinh-huong-bai-4-1',
            text: '3. Câu hỏi tự luận ôn tập và Tình huống vận dụng (CLO6)',
            depth: 2,
          },
        ],
        blocks: [],
      },
    };
  }

  if (
    lessonId === 'gdh-c4-b2-tim-hieu-hoc-sinh-lap-ke-hoach-va-xay-dung-tap-the-hoc-sinh' ||
    lessonId === 'gdh-c4-b2-noi-dung-va-phuong-phap-giao-duc-cua-gvcn-lop'
  ) {
    return {
      default: Lesson4_2View,
      frontmatter: {
        title: 'Bài 4.2: Tìm hiểu học sinh, lập kế hoạch và xây dựng tập thể học sinh',
        description:
          'Nội dung và phương pháp tìm hiểu, phân loại học sinh lớp chủ nhiệm; Quy trình 6 bước xây dựng kế hoạch giáo dục lớp chủ nhiệm; 3 giai đoạn phát triển tập thể học sinh và 4 biện pháp xây dựng tập thể vững mạnh (Giáo trình HCMUE tr. 70–77).',
        level: 'intermediate',
        tags: [
          'CLO6',
          'CLO7',
          'Quy trình 6 bước GVCN',
          '3 Giai đoạn tập thể',
          'Tìm hiểu học sinh',
          'Giáo trình tr. 70-77',
        ],
      },
      lessonMeta: {
        chapterNumber: 4,
        lessonNumber: 2,
        headings: [
          {
            id: '1-tim-hieu-va-phan-loai-hoc-sinh',
            text: '1. Tìm hiểu và phân loại học sinh lớp chủ nhiệm (Giáo trình tr. 70–71)',
            depth: 2,
          },
          {
            id: '2-quy-trinh-6-buoc-lap-ke-hoach-chu-nhiem',
            text: '2. Quy trình 6 bước xây dựng kế hoạch giáo dục lớp chủ nhiệm (Giáo trình tr. 71–73)',
            depth: 2,
          },
          {
            id: '3-xay-dung-tap-the-hoc-sinh',
            text: '3. Ba giai đoạn phát triển tập thể và 4 biện pháp xây dựng tập thể học sinh vững mạnh (Giáo trình tr. 73–77)',
            depth: 2,
          },
          {
            id: '4-on-tap-va-tinh-huong-bai-4-2',
            text: '4. Câu hỏi tự luận ôn tập và Tình huống vận dụng (CLO6, CLO7)',
            depth: 2,
          },
        ],
        blocks: [],
      },
    };
  }

  if (
    lessonId ===
      'gdh-c4-b3-to-chuc-giao-duc-toan-dien-xay-dung-moi-truong-lop-hoc-va-phoi-hop-cac-luc-luong-giao-duc' ||
    lessonId === 'gdh-c4-b3-yeu-cau-pham-chat-nang-luc-gvcn-va-thiet-ke-hoat-dong-chu-nhiem' ||
    lessonId === 'gdh-c4-b4-thuc-hanh-xu-ly-tinh-huong-su-pham-theo-rubric-a12'
  ) {
    return {
      default: Lesson4_3View,
      frontmatter: {
        title:
          'Bài 4.3: Tổ chức giáo dục toàn diện, xây dựng môi trường lớp học và phối hợp các lực lượng giáo dục',
        description:
          'Tổ chức các hoạt động học tập và trải nghiệm toàn diện; xây dựng môi trường lớp học (môi trường vật chất và môi trường tâm lí – xã hội an toàn, thân thiện); phối hợp giữa GVCN với Đoàn/Đội, giáo viên bộ môn và gia đình học sinh (Giáo trình HCMUE tr. 78–82).',
        level: 'advanced',
        tags: [
          'CLO6',
          'CLO7',
          'Giáo dục toàn diện',
          'Môi trường lớp học',
          'Phối hợp lực lượng GD',
          'Giáo trình tr. 78-82',
        ],
      },
      lessonMeta: {
        chapterNumber: 4,
        lessonNumber: 3,
        headings: [
          {
            id: '1-to-chuc-giao-duc-toan-dien-va-moi-truong-lop-hoc',
            text: '1. Tổ chức giáo dục toàn diện và xây dựng môi trường lớp học an toàn, thân thiện (Giáo trình tr. 78–80)',
            depth: 2,
          },
          {
            id: '2-phoi-hop-cac-luc-luong-giao-duc',
            text: '2. Phối hợp giữa GVCN với Đoàn/Đội, Giáo viên bộ môn và Gia đình học sinh (Giáo trình tr. 80–82)',
            depth: 2,
          },
          {
            id: '3-on-tap-va-tinh-huong-bai-4-3',
            text: '3. Câu hỏi tự luận ôn tập và Tình huống vận dụng (CLO6, CLO7)',
            depth: 2,
          },
        ],
        blocks: [],
      },
    };
  }

  return null;
}
