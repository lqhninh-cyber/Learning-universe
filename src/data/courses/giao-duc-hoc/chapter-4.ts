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
  Sparkles,
  Target,
  Users,
} from 'lucide-react';
import { createElement, type FC } from 'react';
import type { PedagogicalCaseStudy } from './course';

// ============================================================================
// 1. COMPONENT BÀI 4.1: CHỨC NĂNG VÀ NHIỆM VỤ CỦA GIÁO VIÊN CHỦ NHIỆM LỚP (TR. 67–69)
// ============================================================================

export const Lesson4_1View: FC = () => {
  const caseStudy4_1: PedagogicalCaseStudy = {
    id: 401,
    title: 'Xử lý xung đột giữa giáo viên bộ môn và nhóm học sinh vi phạm kỷ luật giờ học',
    context:
      'Giữa học kỳ 1, giáo viên bộ môn Tiếng Anh phản ánh gay gắt với GVCN lớp 10A rằng: "Lớp này rất vô kỷ luật, trong giờ của tôi có 4-5 học sinh nam ngồi bàn cuối liên tục bấm điện thoại, khi tôi nhắc nhở thì các em tỏ thái độ thách thức, cười cợt. Nếu lớp không chấn chỉnh, tôi sẽ từ chối vào lớp dạy".',
    question:
      'Vận dụng lý luận về 4 chức năng của GVCN (đặc biệt là chức năng Cầu nối trong nhà trường) và nguyên tắc Tôn trọng nhân cách kết hợp yêu cầu hợp lý đối với học sinh, anh/chị hãy xử lí tình huống theo quy trình 5 bước chuẩn mực (Mục 3.3.6 Giáo trình HCMUE).',
    principlesApplied: [
      'Chức năng cầu nối giữa tập thể học sinh với các lực lượng giáo dục trong nhà trường (Giáo trình HCMUE tr. 67–68)',
      'Điều 29 và Điều 31 Thông tư 32/2020/TT-BGDĐT (Nhiệm vụ và quyền hạn của GVCN)',
      'Nguyên tắc tôn trọng nhân cách học sinh kết hợp với yêu cầu hợp lý đối với học sinh',
    ],
    solutionSteps: [
      {
        step: 1,
        title: 'Bước 1: Phân tích dữ kiện khách quan',
        content:
          'Xảy ra xung đột giữa GV bộ môn và một nhóm học sinh cá biệt trong giờ học; GV bộ môn bị tổn thương uy tín nghề nghiệp và có phản ứng tiêu cực; GVCN đứng giữa hai bên với tư cách cầu nối phối hợp lực lượng giáo dục.',
      },
      {
        step: 2,
        title: 'Bước 2: Biểu đạt mâu thuẫn trung tâm',
        content:
          'Mâu thuẫn giữa nề nếp kỷ luật giờ học bộ môn và hành vi vi phạm của học sinh; cần bảo vệ uy tín của GV bộ môn, giải tỏa xung đột mà không đẩy học sinh vào thế đối đầu gay gắt.',
      },
      {
        step: 3,
        title: 'Bước 3: Giả thuyết và lựa chọn phương án tối ưu',
        content:
          'Phương án sai: Trách phạt, đình chỉ học nhóm học sinh ngay trước lớp theo đề nghị của GV bộ môn (khiến học sinh ức chế, đào sâu mâu thuẫn). Phương án tối ưu: Lắng nghe, chia sẻ và xoa dịu cảm xúc của GV bộ môn, khẳng định GVCN sẽ vào cuộc xử lý nghiêm túc; gặp riêng 4-5 học sinh để tìm hiểu nguyên nhân vi phạm (mất căn bản môn học hay ảnh hưởng từ game); yêu cầu học sinh viết bản tự kiểm điểm nhận lỗi và trực tiếp xin lỗi GV bộ môn; bố trí cán bộ lớp hỗ trợ nhóm này trong các giờ học sau.',
      },
      {
        step: 4,
        title: 'Bước 4: Chứng minh khoa học và thực hiện tác động sư phạm',
        content:
          'Vận dụng chức năng "Cầu nối giữa tập thể học sinh với lực lượng giáo dục trong trường" và nguyên tắc "Tôn trọng nhân cách kết hợp yêu cầu hợp lý đối với học sinh".',
      },
      {
        step: 5,
        title: 'Bước 5: Đúc kết kinh nghiệm sư phạm',
        content:
          'GVCN phải là người giữ vai trò trung gian hòa giải, bình tĩnh bảo vệ môi trường sư phạm đoàn kết, tuyệt đối không thiên vị hoặc xử lý theo cảm xúc nhất thời.',
      },
    ],
    pitfallsToAvoid: [
      'Bênh vực học sinh một chiều làm tổn thương uy tín của giáo viên bộ môn.',
      'Trút giận hoặc phạt nặng học sinh ngay giữa lớp mà không tìm hiểu rõ động cơ và tâm lý đằng sau hành vi vi phạm.',
    ],
    coreLesson:
      'GVCN là cầu nối trung gian hòa giải: luôn giữ sự điềm tĩnh sư phạm để bảo vệ khối đoàn kết tập thể giáo viên và khơi dậy ý thức tự giác sửa sai của học trò.',
  };

  return createElement(
    'div',
    { className: 'space-y-8 text-[#29383D] leading-relaxed' },

    // 1. THANH METADATA & ĐỐI CHIẾU ĐẦU BÀI
    createElement(PedagogyMetadataBar, {
      courseCode: 'EDUC2802',
      lessonCode: 'EDUC2802-C4-L1',
      clos: ['CLO6'],
      textbookPages: 'Giáo trình Giáo dục học HCMUE (Trang 67 – 69)',
      legalRefs: [
        'Thông tư 28/2020/TT-BGDĐT (Điều lệ trường Tiểu học — Điều 27, 29)',
        'Thông tư 32/2020/TT-BGDĐT (Điều lệ trường THCS, THPT — Điều 29, 31)',
        'Luật Giáo dục 2019 (Điều 69, 70)',
      ],
      sessionNote: 'Mục 4.1 · Trang 67 – 69',
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

    // PHẦN I: VỊ TRÍ VÀ KHÁI NIỆM GIÁO VIÊN CHỦ NHIỆM (TRANG 67)
    createElement(
      'section',
      { id: '1-vi-tri-va-khai-niem-gvcn', className: 'space-y-4' },
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
          '1. Vị trí và Khái niệm Giáo viên Chủ nhiệm Lớp (Giáo trình HCMUE Trang 67)',
        ),
      ),
      createElement(
        'div',
        { className: 'space-y-3 text-sm text-[#29383D]' },
        createElement(
          'p',
          null,
          createElement('strong', { className: 'text-[#3F6570]' }, 'Vị trí pháp lý: '),
          'Giáo viên chủ nhiệm (GVCN) là giáo viên có năng lực, uy tín và kinh nghiệm giáo dục được Hiệu trưởng phân công phụ trách một lớp học; thay mặt Hiệu trưởng quản lý, tổ chức giáo dục toàn diện học sinh của lớp.',
        ),
        createElement(
          'p',
          null,
          createElement('strong', { className: 'text-[#3F6570]' }, 'Bản chất kép của GVCN: '),
          'GVCN vừa là một ',
          createElement('strong', null, 'nhà giáo dục trực tiếp'),
          ' (giữ vai trò chủ đạo trong sự phát triển nhân cách học sinh), vừa là một ',
          createElement('strong', null, 'nhà quản lý lớp học ở cấp vi mô'),
          ' (chịu trách nhiệm pháp lý trước Hiệu trưởng về nề nếp, trật tự và chất lượng giáo dục của tập thể lớp).',
        ),
        createElement(
          Sidenote,
          {
            number: 1,
            type: 'pedagogy',
            title: 'Chuyển dịch vai trò GVCN',
          },
          'Trong nhà trường hiện đại theo Chương trình GDPT 2018, GVCN không phải là "người cai quản" giám sát lỗi lầm của học sinh, mà là nhà cố vấn sư phạm giúp học sinh phát triển năng lực tự chủ, tự quản và hợp tác.',
        ),
      ),
    ),

    // PHẦN II: 4 CHỨC NĂNG CỐT LÕI CỦA GIÁO VIÊN CHỦ NHIỆM (TRANG 67 – 68)
    createElement(
      'section',
      { id: '2-bon-chuc-nang-cot-loi-gvcn', className: 'space-y-4' },
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
          '2. Bốn Chức năng Cốt lõi của Giáo viên Chủ nhiệm (Giáo trình HCMUE Trang 67 – 68)',
        ),
      ),
      createElement(
        'div',
        { className: 'space-y-3' },
        createElement(
          'p',
          { className: 'text-sm text-[#29383D]' },
          'Hệ thống 4 chức năng gắn kết hữu cơ cấu thành vị thế đặc thù của người giáo viên chủ nhiệm trong nhà trường phổ thông:',
          createElement(
            Sidenote,
            {
              number: 2,
              type: 'caution',
              title: 'Cảnh báo bẫy nghiệp vụ',
            },
            'GVCN tuyệt đối không trực tiếp làm thay, bao biện công việc của cán bộ lớp; ngược lại, cũng không được "khoán trắng", buông lỏng hoặc thả nổi tập thể học sinh.',
          ),
        ),
        createElement(NumberedProcessFlow, {
          title: 'Hệ thống 4 Chức năng Cốt lõi của Giáo viên Chủ nhiệm Lớp',
          subtitle:
            'Nền tảng nghiệp vụ phân định vai trò quản lý, cố vấn, đại diện và điều phối theo Mục 4.1 Giáo trình HCMUE.',
          badge: '4 Chức năng GVCN',
          columns: 2,
          steps: [
            {
              number: 1,
              title: '01. Quản lý – giáo dục toàn diện học sinh một lớp học',
              badge: 'Chức năng Quản lý - Giáo dục',
              description:
                'Nắm vững đặc điểm chung của lớp và hoàn cảnh cá biệt của từng học sinh. Xây dựng kế hoạch phát triển tập thể, tổ chức chỉ đạo các hoạt động giáo dục toàn diện. Kiểm tra, đánh giá kết quả học tập và rèn luyện của học sinh; kết hợp chặt chẽ giữa quản lý và giáo dục (quản lý tốt để giáo dục tốt, giáo dục tốt để nâng cao hiệu quả quản lý).',
              keyAction:
                'Nắm bắt đặc điểm học sinh, lập kế hoạch lớp và theo dõi toàn diện sự tiến bộ.',
              deliverable:
                'Hồ sơ chủ nhiệm hoàn chỉnh và sự chuyển biến tích cực của từng học sinh.',
            },
            {
              number: 2,
              title: '02. Cố vấn cho hoạt động tự quản của tập thể học sinh',
              badge: 'Chức năng Cố vấn Tự quản',
              description:
                'Định hướng, hướng dẫn và hỗ trợ học sinh xây dựng kế hoạch, lựa chọn nội dung và cách thức tổ chức hoạt động. Bồi dưỡng năng lực tự quản, kích thích tiềm năng sáng tạo của đội ngũ cán sự lớp và các phần tử tích cực. Tránh hai cực đoan: bao biện làm thay hoặc buông lỏng khoán trắng.',
              keyAction:
                'Tập huấn kỹ năng điều hành cho cán sự lớp và định hướng giờ Sinh hoạt lớp.',
              deliverable: 'Bộ máy tự quản lớp vận hành tự giác, dân chủ và có kỷ cương vững chắc.',
            },
            {
              number: 3,
              title: '03. "Cầu nối" giữa tập thể học sinh với các lực lượng giáo dục trong trường',
              badge: 'Chức năng Cầu nối',
              description:
                'Đại diện cho nhà trường: Truyền đạt chủ trương, nội quy, kế hoạch giáo dục của Ban Giám hiệu đến lớp bằng phương pháp thuyết phục, dân chủ; gợi ý giải pháp phù hợp với điều kiện thực tế của lớp. Đại diện cho học sinh: Lắng nghe, tập hợp tâm tư, nguyện vọng chính đáng của học sinh để phản ánh lên Ban Giám hiệu và các bộ phận chức năng; bảo vệ quyền lợi hợp pháp của học sinh.',
              keyAction:
                'Truyền đạt kế hoạch nhà trường và bảo vệ quyền lợi chính đáng của học sinh.',
              deliverable:
                'Môi trường sư phạm thông suốt, đồng thuận và giải tỏa xung đột kịp thời.',
            },
            {
              number: 4,
              title: '04. Người tổ chức phối hợp các lực lượng giáo dục ngoài nhà trường',
              badge: 'Chức năng Phối hợp Xã hội',
              description:
                'Đóng vai trò nòng cốt liên kết gia đình học sinh (thông qua Ban đại diện cha mẹ học sinh lớp, sổ liên lạc điện tử, trao đổi trực tiếp). Phối hợp với chính quyền, đoàn thể và các tổ chức xã hội tại địa phương để quản lý và tổ chức các hoạt động trải nghiệm, thiện nguyện.',
              keyAction:
                'Chủ trì các kỳ họp CMHS đổi mới và kết nối nguồn lực giáo dục địa phương.',
              deliverable: 'Thế trận giáo dục liên hoàn giữa Nhà trường, Gia đình và Xã hội.',
            },
          ],
        }),
      ),
    ),

    // PHẦN III: BẢNG MA TRẬN ĐỐI CHIẾU NHIỆM VỤ GVCN THEO ĐIỀU LỆ 2020 (TRANG 68 – 69)
    createElement(
      'section',
      { id: '3-doi-chieu-nhiem-vu-dieu-le-2020', className: 'space-y-4' },
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
          '3. Ma trận Đối chiếu Nhiệm vụ GVCN Cấp Tiểu học và Trung học theo Điều lệ 2020 (Trang 68 – 69)',
        ),
      ),
      createElement(LegalReferenceBox, {
        documentTitle:
          'Thông tư 28/2020/TT-BGDĐT (Điều lệ Tiểu học) & Thông tư 32/2020/TT-BGDĐT (Điều lệ Trung học)',
        article: 'Điều 27, 29 Thông tư 28/2020 & Điều 29, 31 Thông tư 32/2020',
        quote:
          'Giáo viên chủ nhiệm có nhiệm vụ xây dựng kế hoạch giáo dục của lớp; quản lý học sinh trong các hoạt động giáo dục do nhà trường tổ chức; phối hợp chặt chẽ với cha mẹ học sinh, giáo viên bộ môn, Đoàn, Đội; thực hiện đánh giá, xếp loại học sinh theo quy định; được giảm định mức tiết dạy (03 tiết ở Tiểu học, 04 tiết ở Trung học) và quyền cho phép học sinh nghỉ học có lý do không quá 03 ngày liên tục.',
        pedagogicalAnalysis:
          'Điều lệ 2020 xác lập cơ sở pháp lý vững chắc cho GVCN: vừa phân định rõ ràng trách nhiệm giáo dục toàn diện, vừa trao quyền tự chủ chuyên môn và các đặc quyền giảm tải giờ dạy để đầu tư cho công tác phát triển nhân cách học sinh.',
      }),
      createElement(ComparativeTable, {
        title:
          'Bảng Ma trận Đối chiếu Nhiệm vụ GVCN Cấp Tiểu học và Cấp Trung học theo Điều lệ 2020 (Trang 68 – 69)',
        subtitle:
          'So sánh chi tiết 4 nhóm nhiệm vụ trọng tâm giữa Điều lệ trường tiểu học (TT 28/2020) và Điều lệ trường trung học (TT 32/2020).',
        badge: 'Đối chiếu Điều lệ 2020',
        columns: [
          { key: 'criterion', header: 'Tiêu chí so sánh', widthClass: 'w-1/4' },
          {
            key: 'primary',
            header: 'Cấp Tiểu học (Thông tư 28/2020/TT-BGDĐT)',
            widthClass: 'w-3/8',
          },
          {
            key: 'secondary',
            header: 'Cấp Trung học - THCS & THPT (Thông tư 32/2020/TT-BGDĐT)',
            widthClass: 'w-3/8',
          },
        ],
        rows: [
          {
            criterion: '1. Nắm bắt thông tin học sinh',
            primary:
              'Chủ động tìm hiểu, nắm vững hoàn cảnh gia đình, đặc điểm thể chất, tâm lý và năng lực học tập của từng học sinh trong lớp để có biện pháp giáo dục cá biệt hóa.',
            secondary:
              'Tìm hiểu, nắm vững đặc điểm tâm sinh lý lứa tuổi dậy thì/vị thành niên, hoàn cảnh gia đình, năng khiếu và định hướng nghề nghiệp của từng học sinh; được dự các giờ học khác của lớp để quan sát thực tế.',
          },
          {
            criterion: '2. Lập và thực hiện kế hoạch',
            primary:
              'Xây dựng và thực hiện kế hoạch hoạt động giáo dục của lớp đã được Hiệu trưởng phê duyệt; tổ chức các hoạt động trải nghiệm, rèn luyện kỹ năng tự phục vụ và nề nếp cơ bản.',
            secondary:
              'Thực hiện nhiệm vụ dạy học và giáo dục theo kế hoạch của trường và tổ chuyên môn; quản lý học sinh trong mọi hoạt động do trường tổ chức; xây dựng kế hoạch chủ nhiệm theo quy trình 6 bước.',
          },
          {
            criterion: '3. Đánh giá học tập & khen thưởng',
            primary:
              'Phối hợp với giáo viên môn học, Tổng phụ trách Đội; tổng hợp nhận xét, đánh giá cuối kỳ I và cuối năm theo Thông tư 27/2020; hướng dẫn bình bầu khen thưởng, lập danh sách học sinh rèn luyện lại hoặc đề nghị giữ lại lớp; hoàn chỉnh học bạ.',
            secondary:
              'Thực hiện kiểm tra, đánh giá thường xuyên và định kỳ kết quả rèn luyện của học sinh; ghi học bạ và nhận xét hạnh kiểm học sinh theo Thông tư 22/2021; được dự họp Hội đồng khen thưởng và kỷ luật khi xét học sinh lớp mình.',
          },
          {
            criterion: '4. Báo cáo & Phối hợp lực lượng',
            primary:
              'Báo cáo định kỳ hoặc đột xuất với Hiệu trưởng về tình hình lớp; phối hợp thường xuyên với cha mẹ học sinh và Ban đại diện CMHS lớp.',
            secondary:
              'Phối hợp chặt chẽ với Đội TNTP, Đoàn TNCS Hồ Chí Minh, Hội LHTN Việt Nam, gia đình học sinh; tham gia phổ cập GD THCS tại địa phương; báo cáo định kỳ và đề xuất giải pháp với Ban Giám hiệu.',
          },
        ],
        footerNote:
          'Nguồn đối chiếu: Thông tư 28/2020/TT-BGDĐT (Điều 27, 29) và Thông tư 32/2020/TT-BGDĐT (Điều 29, 31).',
      }),
    ),

    // PHẦN IV: KHUNG TÌNH HUỐNG THỰC HÀNH 5 BƯỚC (CASE STUDY 401)
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
          '4. Tình huống Thực hành 5 Bước: Xử lý Xung đột Sư phạm Giờ học Bộ môn',
        ),
      ),
      createElement(CaseStudyBox, { caseStudy: caseStudy4_1, defaultOpenSolution: false }),
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
      'Vận dụng lý luận về Quy trình 6 bước lập kế hoạch chủ nhiệm, 3 giai đoạn phát triển tập thể học sinh và 4 biện pháp xây dựng tập thể vững mạnh (Giáo trình Giáo dục học HCMUE tr. 70–77), anh/chị hãy xử lí tình huống theo quy trình 5 bước chuẩn mực.',
    principlesApplied: [
      'Quy trình 6 bước xây dựng kế hoạch giáo dục lớp chủ nhiệm (Giáo trình HCMUE tr. 71–73)',
      '3 giai đoạn phát triển tập thể học sinh theo lý luận A. S. Makarenko (Giáo trình tr. 73–75)',
      '4 biện pháp cơ bản xây dựng tập thể học sinh vững mạnh (Giáo trình tr. 75–77)',
      'Nguyên tắc giáo dục trong tập thể và bằng tập thể',
    ],
    solutionSteps: [
      {
        step: 1,
        title: 'Bước 1: Nhận diện sự việc và xác định vấn đề cần giải quyết',
        content:
          'Lớp 10A4 đang ở Giai đoạn 1 (tập thể hình thành: học sinh chưa hiểu nhau, xuất hiện các nhóm tự phát theo trường cũ, chưa có đội ngũ cốt cán đủ uy tín và thiếu vắng mục tiêu chung). Mâu thuẫn chia rẽ có nguy cơ cản trở hoạt động tự quản nếu không có can thiệp sư phạm kịp thời.',
      },
      {
        step: 2,
        title: 'Bước 2: Thu thập thông tin và phân tích nguyên nhân theo lý luận Chương 4',
        content:
          'GVCN sử dụng phiếu khảo sát đầu năm, hồ sơ học bạ và quan sát thực tế để nắm bắt sở trường, tính cách và nguyện vọng của 42 học sinh (Mục 4.2.1 Giáo trình tr. 70–71). Nhận diện những cá nhân tích cực ở mỗi nhóm trường cũ có khả năng làm hạt nhân đoàn kết.',
      },
      {
        step: 3,
        title: 'Bước 3: Đề xuất các phương án giải quyết khả thi',
        content:
          'Phương án 1: GVCN dùng mệnh lệnh hành chính ép buộc các nhóm phải làm theo phân công của giáo viên (không kích hoạt được tính tự giác). Phương án tối ưu: Tổ chức lại sơ đồ chỗ ngồi xen kẽ các trường cũ, kiện toàn Ban cán sự lâm thời có đại diện từ các nhóm và thiết lập hệ thống viễn cảnh gần – trung bình – xa để gắn kết tập thể.',
      },
      {
        step: 4,
        title: 'Bước 4: Lựa chọn phương án tối ưu và tổ chức thực hiện tác động sư phạm',
        content:
          'Áp dụng 4 biện pháp xây dựng tập thể (Giáo trình tr. 75–77): (1) Tổ chức hoạt động phá băng "Hành trình kết nối 10A4" và xếp tổ học tập đa dạng thành viên; (2) Bầu Ban cán sự lâm thời có đại diện năng nổ từ các nhóm để tạo hạt nhân chuyển tải yêu cầu của GVCN (chuyển sang Giai đoạn 2); (3) Đặt viễn cảnh gần hấp dẫn là dự án Hội trại với sự phân công theo sở trường (nhóm thiết kế, ẩm thực, văn nghệ) thay vì chia theo trường cũ.',
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
      'Bầu Ban cán sự chỉ tập trung vào một nhóm trường cũ khiến các nhóm khác cảm thấy bị cô lập.',
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
      lessonCode: 'EDUC2802-C4-L2',
      clos: ['CLO6', 'CLO7'],
      textbookPages: 'Giáo trình Giáo dục học HCMUE (Trang 70 – 77)',
      legalRefs: [
        'Thông tư 32/2020/TT-BGDĐT (Điều 29 — Kế hoạch giáo dục của GVCN)',
        'Thông tư 20/2018/TT-BGDĐT (Tiêu chuẩn 3: Xây dựng môi trường giáo dục)',
      ],
      sessionNote: 'Mục 4.2.1 – 4.2.3 · Trang 70 – 77',
    }),

    // PHẦN I: PHƯƠNG PHÁP TÌM HIỂU HỌC SINH LỚP CHỦ NHIỆM (TRANG 70 – 71)
    createElement(
      'section',
      { id: '1-phuong-phap-tim-hieu-hoc-sinh', className: 'space-y-4' },
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
          '1. Phương pháp Tìm hiểu Toàn diện Học sinh Lớp Chủ nhiệm (Trang 70 – 71)',
        ),
      ),
      createElement(
        'div',
        { className: 'space-y-3 text-sm text-[#29383D]' },
        createElement(
          'p',
          null,
          createElement('strong', { className: 'text-[#3F6570]' }, 'Mục đích: '),
          'Nắm vững đối tượng là điều kiện tiên quyết để định hình biện pháp tác động phù hợp, biến quá trình giáo dục thành quá trình tự giáo dục. Muốn giáo dục con người về mọi mặt thì trước hết phải hiểu con người về mọi mặt.',
        ),
        createElement(
          'div',
          { className: 'grid grid-cols-1 md:grid-cols-2 gap-3 pt-1' },
          createElement(
            'div',
            { className: 'rounded-xl border border-[#CFDADB] bg-[#F7FAFA] p-4 space-y-1.5' },
            createElement(
              'h4',
              { className: 'font-serif text-sm font-bold text-[#3F6570]' },
              'Tìm hiểu tập thể học sinh',
            ),
            createElement(
              'p',
              { className: 'text-xs text-[#55676B] leading-relaxed' },
              'Trình độ phát triển, truyền thống, bầu không khí tâm lý, các mối quan hệ chính thức và các nhóm tự phát, thủ lĩnh phi chính thức của lớp.',
            ),
          ),
          createElement(
            'div',
            { className: 'rounded-xl border border-[#CFDADB] bg-[#F7FAFA] p-4 space-y-1.5' },
            createElement(
              'h4',
              { className: 'font-serif text-sm font-bold text-[#3F6570]' },
              'Tìm hiểu cá nhân từng học sinh',
            ),
            createElement(
              'p',
              { className: 'text-xs text-[#55676B] leading-relaxed' },
              'Đặc điểm tâm sinh lý, sức khỏe, học lực, năng khiếu, tư tưởng, hoàn cảnh gia đình, nhóm bạn bè trong và ngoài nhà trường.',
            ),
          ),
        ),
        createElement(
          Sidenote,
          {
            number: 1,
            type: 'pedagogy',
            title: 'Nguyên tắc tìm hiểu học sinh',
          },
          'Tìm hiểu học sinh là quá trình thường xuyên, liên tục trong cả năm học, không được làm chóng vánh theo kiểu "chiếu lệ" ở đầu năm; tránh suy diễn chủ quan, thành kiến.',
        ),
      ),
      createElement(ComparativeTable, {
        title:
          'Bảng Ma trận Nội dung và Kênh Phương pháp Thu thập Dữ liệu Học sinh (Trang 70 – 71)',
        subtitle:
          'Kết hợp đồng bộ các kênh điều tra để có bức tranh khách quan, toàn diện về đối tượng giáo dục.',
        badge: 'Kênh Thu thập Thông tin',
        columns: [
          { key: 'group', header: 'Nhóm thông tin cần tìm hiểu', widthClass: 'w-1/4' },
          { key: 'indicators', header: 'Chỉ báo thông tin cụ thể', widthClass: 'w-3/8' },
          { key: 'methods', header: 'Phương pháp & Công cụ thu thập' },
        ],
        rows: [
          {
            group: '1. Hoàn cảnh gia đình & Đời sống xã hội',
            indicators:
              'Điều kiện kinh tế, cấu trúc gia đình, nghề nghiệp và quan điểm giáo dục của cha mẹ, môi trường cư trú, nhóm bạn bè ngoài trường.',
            methods:
              'Nghiên cứu hồ sơ học sinh, phiếu khảo sát đầu năm, đàm thoại trực tiếp với phụ huynh, thăm gia đình học sinh đặc biệt.',
          },
          {
            group: '2. Đặc điểm thể chất & Tâm sinh lý',
            indicators:
              'Tình trạng sức khỏe, thị lực, bệnh lý mãn tính; khí chất, tính cách, hứng thú, nguyện vọng, khó khăn tâm lý lứa tuổi.',
            methods:
              'Quan sát có chủ định trong giờ học và giờ chơi, đàm thoại cá nhân tế nhị, phối hợp với cán bộ y tế và phòng tư vấn tâm lý học đường.',
          },
          {
            group: '3. Phẩm chất đạo đức & Năng lực học tập',
            indicators:
              'Thái độ học tập, ý thức tổ chức kỷ luật, kết quả học tập các môn, năng khiếu đặc thù và vị thế của học sinh trong tập thể lớp.',
            methods:
              'Nghiên cứu hồ sơ học bạ, trao đổi với GVCN cũ, GV bộ môn, Ban cán sự lớp và phân tích sản phẩm hoạt động học tập của học sinh.',
          },
        ],
        footerNote: 'Nguồn: Giáo trình Giáo dục học HCMUE (Mục 4.2.1, Trang 70 – 71).',
      }),
    ),

    // PHẦN II: LƯU ĐỒ 6 BƯỚC XÂY DỰNG KẾ HOẠCH GIÁO DỤC CỦA LỚP CHỦ NHIỆM (TRANG 71 – 73)
    createElement(
      'section',
      { id: '2-luu-do-6-buoc-lap-ke-hoach', className: 'space-y-4' },
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
          '2. Lưu đồ 6 Bước Xây dựng Kế hoạch Giáo dục của Lớp Chủ nhiệm (Trang 71 – 73)',
        ),
      ),
      createElement(NumberedProcessFlow, {
        title: 'Quy trình 6 Bước Xây dựng Kế hoạch Giáo dục Lớp Chủ nhiệm Chuẩn mực',
        subtitle:
          'Hệ thống các bước logic khoa học từ khâu khảo sát thực trạng đến triển khai, kiểm tra và điều chỉnh kế hoạch.',
        badge: 'Quy trình 6 Bước Lập Kế hoạch',
        columns: 2,
        steps: [
          {
            number: 1,
            title: 'Bước 01: Phân tích, đánh giá tình hình, đặc điểm lớp học',
            badge: 'Bước 01',
            description:
              'Căn cứ nhiệm vụ năm học của ngành, kế hoạch nhà trường; tổng hợp điểm mạnh, điểm yếu, thời cơ, thách thức (SWOT) của tập thể lớp dựa trên kết quả điều tra đầu năm.',
            keyAction: 'Nghiên cứu văn bản chỉ đạo và phân tích thực trạng học sinh.',
            deliverable: 'Bản phân tích đặc điểm lớp với các số liệu minh chứng cụ thể.',
          },
          {
            number: 2,
            title: 'Bước 02: Xác định mục tiêu, chỉ tiêu cần đạt',
            badge: 'Bước 02',
            description:
              'Mục tiêu chung về xây dựng tập thể; chỉ tiêu cụ thể về học lực, rèn luyện; đảm bảo tính đo lường được, phù hợp đặc điểm lớp và có tính vừa sức đối với học sinh.',
            keyAction: 'Xác định hệ thống chỉ tiêu định tính và định lượng cho cả năm và từng kỳ.',
            deliverable: 'Bảng hệ thống chỉ tiêu phấn đấu có tính khả thi.',
          },
          {
            number: 3,
            title: 'Bước 03: Xây dựng nội dung hoạt động giáo dục cụ thể',
            badge: 'Bước 03',
            description:
              'Bao quát toàn diện các mặt: Nề nếp kỷ luật, hoạt động học tập, giáo dục đạo đức, thể chất, thẩm mỹ, lao động công ích và các chủ đề Hoạt động trải nghiệm, hướng nghiệp.',
            keyAction: 'Cụ thể hóa thành các chủ điểm giáo dục theo từng tháng, từng tuần.',
            deliverable: 'Khung nội dung giáo dục toàn diện theo tiến trình năm học.',
          },
          {
            number: 4,
            title: 'Bước 04: Xây dựng các biện pháp và điều kiện thực hiện phù hợp',
            badge: 'Bước 04',
            description:
              'Mô tả chi tiết phương thức tổ chức, công cụ sư phạm, lực lượng phối hợp (Đoàn/Đội, GV bộ môn, Ban đại diện CMHS) và dự trù kinh phí, cơ sở vật chất thực hiện.',
            keyAction: 'Lựa chọn phương thức tác động sư phạm thích ứng với từng nhóm học sinh.',
            deliverable: 'Bảng giải pháp nghiệp vụ và phương án bảo đảm nguồn lực.',
          },
          {
            number: 5,
            title: 'Bước 05: Phân công lực lượng tham gia và tiến độ thời gian',
            badge: 'Bước 05',
            description:
              'Gắn trách nhiệm rõ ràng cho Ban cán sự lớp, các tổ trưởng, giáo viên bộ môn và phụ huynh học sinh; xác định rõ mốc thời gian bắt đầu và hoàn thành cho từng hoạt động.',
            keyAction: 'Giao việc đúng người, đúng việc gắn với mốc tiến độ cụ thể.',
            deliverable: 'Lịch biểu chi tiết và bảng phân công trách nhiệm minh bạch.',
          },
          {
            number: 6,
            title: 'Bước 06: Định hướng kiểm tra, đánh giá và điều chỉnh kế hoạch',
            badge: 'Bước 06',
            description:
              'Xây dựng hệ thống tiêu chí giám sát, thu thập thông tin phản hồi định kỳ trong các tiết Sinh hoạt lớp để kịp thời điều chỉnh kế hoạch thích ứng với thực tế.',
            keyAction: 'Đánh giá tiến độ hàng tuần/tháng và cập nhật biện pháp mới khi cần.',
            deliverable: 'Biên bản sơ kết định kỳ và bản điều chỉnh kế hoạch kịp thời.',
          },
        ],
      }),
    ),

    // PHẦN III: BẢN CHẤT VÀ 3 GIAI ĐOẠN PHÁT TRIỂN TẬP THỂ HỌC SINH (TRANG 73 – 75)
    createElement(
      'section',
      { id: '3-ba-giai-doan-phat-trien-tap-the', className: 'space-y-4' },
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
          '3. Bản chất và 3 Giai đoạn Phát triển Tập thể Học sinh (Trang 73 – 75)',
        ),
      ),
      createElement(
        'div',
        { className: 'space-y-3 text-sm text-[#29383D]' },
        createElement(
          'p',
          null,
          createElement('strong', { className: 'text-[#3F6570]' }, 'Khái niệm tập thể: '),
          'Tập thể là một cộng đồng xã hội đặc biệt, có tổ chức chặt chẽ, hoạt động chung theo mục đích có ý nghĩa xã hội, có kỷ luật tự giác và hệ thống quan hệ phụ thuộc lẫn nhau.',
        ),
        createElement(ScholarQuote, {
          scholar: 'A. S. Makarenko (1888–1939)',
          work: 'Quy luật Vận động của Tập thể Học sinh & Tác động Song hành',
          quote:
            'Ngừng đặt ra những viễn cảnh mới đối với tập thể cũng có nghĩa là làm ngừng sự sống của tập thể. Tập thể học sinh chỉ thực sự trở thành môi trường giáo dục khi có mục đích chung, cơ quan tự quản có uy tín và dư luận tập thể lành mạnh.',
          analysis:
            'Giáo trình HCMUE (tr. 73–75) nhấn mạnh: Tập thể học sinh phát triển qua 3 giai đoạn mang tính quy luật. Ở mỗi giai đoạn, người giáo viên chủ nhiệm phải thay đổi căn bản phương thức tác động từ chỉ đạo trực tiếp sang cố vấn tự quản.',
        }),
      ),
      createElement(ComparativeTable, {
        title:
          'Bảng Ma trận 3 Giai đoạn Phát triển Tập thể Học sinh theo Lý luận A. S. Makarenko (Trang 74 – 75)',
        subtitle:
          'Quy luật chuyển hóa từ yêu cầu đơn phương của GVCN sang yêu cầu tự giác của toàn thể cộng đồng học sinh.',
        badge: '3 Giai đoạn Phát triển Tập thể',
        columns: [
          { key: 'stage', header: 'Giai đoạn phát triển', widthClass: 'w-1/4' },
          {
            key: 'characteristics',
            header: 'Đặc trưng tâm lý & Cấu trúc tập thể',
            widthClass: 'w-3/8',
          },
          { key: 'methods', header: 'Phương thức tác động chủ đạo của GVCN' },
        ],
        rows: [
          {
            stage: 'Giai đoạn 1: Tập thể hình thành (Tổng hợp sơ bộ)',
            characteristics:
              'Đầu năm hoặc đầu cấp học; học sinh chưa hiểu nhau, kỷ luật rời rạc, có xu hướng co cụm thành các nhóm tự phát nhỏ; chưa có đội ngũ cán bộ lớp có uy tín.',
            methods:
              'GVCN trực tiếp đề ra mọi yêu cầu sư phạm kiên quyết, rõ ràng và chỉ đạo chi tiết từng công việc; tích cực quan sát, tìm hiểu học sinh để lựa chọn các hạt nhân tích cực làm cán bộ lớp lâm thời.',
          },
          {
            stage: 'Giai đoạn 2: Tập thể phát triển (Phân hóa & Liên kết)',
            characteristics:
              'Tập thể phân hóa thành 3 nhóm rõ rệt: nhóm tích cực nòng cốt (ủng hộ GVCN), nhóm trung gian thụ động (số đông), nhóm chậm tiến cá biệt; các yêu cầu bắt đầu được nhóm nòng cốt hưởng ứng nhưng tính tự giác chưa đồng đều.',
            methods:
              'GVCN chuyển dần quyền điều hành cho Ban cán sự lớp; áp dụng phương pháp "tác động song hành" (tác động thông qua tập thể và cán sự lớp); bồi dưỡng uy tín và năng lực tổ chức cho đội ngũ cốt cán.',
          },
          {
            stage: 'Giai đoạn 3: Tập thể phát triển vững mạnh (Tự quản cao)',
            characteristics:
              'Hình thành dư luận tập thể lành mạnh; kỷ luật tự giác cao; yêu cầu giáo dục của GVCN được chuyển hóa thành yêu cầu tự giác của chính tập thể lớp; mỗi cá nhân tự đặt yêu cầu cao cho mình và bạn bè.',
            methods:
              'GVCN đóng vai trò cố vấn sư phạm; phát huy tối đa sức mạnh của dư luận tập thể và truyền thống lớp; tôn trọng quyền tự chủ của học sinh và định hướng các viễn cảnh phát triển mới.',
          },
        ],
        footerNote: 'Nguồn: Giáo trình Giáo dục học HCMUE (Mục 4.2.3, Trang 74 – 75).',
      }),
    ),

    // PHẦN IV: 4 BIỆN PHÁP CƠ BẢN XÂY DỰNG VÀ GIÁO DỤC TẬP THỂ HỌC SINH (TRANG 75 – 77)
    createElement(
      'section',
      { id: '4-bon-bien-phap-xay-dung-tap-the', className: 'space-y-4' },
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
          '4. Bốn Biện pháp Cơ bản Xây dựng và Giáo dục Tập thể Học sinh (Trang 75 – 77)',
        ),
      ),
      createElement(NumberedProcessFlow, {
        title: 'Hệ thống 4 Biện pháp Nghiệp vụ Xây dựng Tập thể Lớp Vững mạnh',
        subtitle:
          'Hệ thống giải pháp sư phạm giúp GVCN đưa lớp học tiến nhanh từ Giai đoạn 1 lên Giai đoạn 3 (Giáo trình HCMUE tr. 75–77).',
        badge: '4 Biện pháp Xây dựng Tập thể',
        columns: 2,
        steps: [
          {
            number: 1,
            title: '01. Tổ chức mạng lưới tự quản vững mạnh',
            badge: 'Bồi dưỡng Cốt cán',
            description:
              'Lựa chọn, phân công rõ nhiệm vụ cho Lớp trưởng, các Lớp phó (Học tập, Kỷ luật, Phong trào), Cán sự bộ môn và Tổ trưởng. Hướng dẫn cụ thể kỹ năng điều hành sinh hoạt lớp, kỹ năng ghi chép sổ công tác, kỹ năng vận động quần chúng; bảo vệ uy tín cán bộ lớp trước tập thể; thực hiện luân phiên cán sự phù hợp để nhiều học sinh được rèn luyện.',
            keyAction: 'Bồi dưỡng kỹ năng tự quản và trao quyền dân chủ cho ban cán sự lớp.',
            deliverable: 'Đội ngũ cán sự lớp năng động, gương mẫu và có uy tín trước tập thể.',
          },
          {
            number: 2,
            title: '02. Đề ra hệ thống viễn cảnh (Mục tiêu phát triển tập thể)',
            badge: 'Hệ thống Viễn cảnh',
            description:
              'Viễn cảnh gần (ngắn hạn: 1 tuần, 1 tháng): Các phong trào thi đua tuần, chuẩn bị buổi biểu diễn văn nghệ. Viễn cảnh trung bình & xa (dài hạn: học kỳ, cả năm): Kế hoạch hội trại cuối năm, mục tiêu đỗ tốt nghiệp và tuyển sinh lớp 10/đại học. Các viễn cảnh nối tiếp nhau tạo động lực thúc đẩy tập thể liên tục vươn lên.',
            keyAction:
              'Xây dựng viễn cảnh gần – trung bình – xa hấp dẫn và dẫn dắt học sinh thực hiện.',
            deliverable: 'Tập thể luôn có mục tiêu chung rõ ràng và tinh thần thi đua sôi nổi.',
          },
          {
            number: 3,
            title: '03. Giáo dục kỷ luật tích cực',
            badge: 'Kỷ luật Tích cực',
            description:
              'Kỷ luật không phải là cưỡng bức, phạt đòn mà là ý thức tự giác vì lợi ích chung của cộng đồng lớp học; xây dựng nội quy dựa trên sự đồng thuận của học sinh; hướng dẫn học sinh nhận thức hậu quả tự nhiên của hành vi và tự cam kết sửa đổi.',
            keyAction:
              'Xây dựng quy tắc ứng xử lớp học dựa trên sự tham gia đồng thuận của học sinh.',
            deliverable: 'Nền nếp kỷ luật tự giác, tôn trọng lẫn nhau và không sử dụng nhục phạt.',
          },
          {
            number: 4,
            title: '04. Giáo dục truyền thống tốt và xây dựng dư luận tập thể lành mạnh',
            badge: 'Dư luận Tập thể',
            description:
              'Tổ chức các diễn đàn, tọa đàm, giờ sinh hoạt lớp dân chủ để định hướng dư luận; dùng sức mạnh dư luận tập thể để bảo vệ cái đúng, đẩy lùi hành vi sai trái; kế thừa các truyền thống tốt đẹp của nhà trường và xây dựng nét văn hóa riêng của lớp.',
            keyAction: 'Định hướng các buổi thảo luận dân chủ và xây dựng văn hóa tập thể đặc sắc.',
            deliverable: 'Bầu không khí tập thể lành mạnh, đoàn kết, bảo vệ các giá trị nhân văn.',
          },
        ],
      }),
      createElement(LegalReferenceBox, {
        documentTitle:
          'Thông tư 20/2018/TT-BGDĐT (Chuẩn nghề nghiệp giáo viên cơ sở giáo dục phổ thông)',
        article: 'Tiêu chuẩn 3: Xây dựng môi trường giáo dục (Tiêu chí 8, 9, 10)',
        quote:
          'Xây dựng văn hóa nhà trường, thực hiện quyền dân chủ trong nhà trường và xây dựng trường học an toàn, phòng chống bạo lực học đường: Giáo viên hướng dẫn học sinh thực hiện nội quy, quy tắc ứng xử văn hóa; lắng nghe và giải quyết thấu đáo các ý kiến của học sinh; phát huy vai trò nòng cốt của tập thể trong rèn luyện nhân cách.',
        pedagogicalAnalysis:
          'Bốn biện pháp xây dựng tập thể trong Giáo trình HCMUE (tr. 75–77) chính là cẩm nang nghiệp vụ trực tiếp giúp GVCN hiện thực hóa Tiêu chuẩn 3 của Chuẩn nghề nghiệp giáo viên.',
      }),
    ),

    // PHẦN V: KHUNG TÌNH HUỐNG THỰC HÀNH 5 BƯỚC (CASE STUDY 402)
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
          '5. Tình huống Thực hành 5 Bước: Xây dựng Tập thể và Hóa giải Bè phái Đầu cấp',
        ),
      ),
      createElement(CaseStudyBox, { caseStudy: caseStudy4_2, defaultOpenSolution: false }),
    ),
  );
};

// ============================================================================
// 3. COMPONENT BÀI 4.3: TỔ CHỨC GIÁO DỤC TOÀN DIỆN, MÔI TRƯỜNG LỚP HỌC VÀ PHỐI HỢP CÁC LỰC LƯỢNG (TR. 78–82)
// ============================================================================

export const Lesson4_3View: FC = () => {
  const caseStudy4_3: PedagogicalCaseStudy = {
    id: 403,
    title: 'Đổi mới cuộc họp Cha mẹ học sinh và tháo gỡ xung đột giữa GV bộ môn với học sinh',
    context:
      'Trước kỳ họp Cha mẹ học sinh sơ kết học kỳ I, một số học sinh lớp 11C phản ánh với GVCN rằng các em rất sợ cuộc họp phụ huynh vì "thầy cô chỉ đọc bảng điểm, phê bình tên từng học sinh yếu kém trước cả lớp khiến bố mẹ về nhà mắng chửi nặng nề". Đồng thời, trong lớp đang có căng thẳng giữa một nhóm học sinh với giáo viên bộ môn Hóa học do các em cho rằng cô chấm điểm quá khắt khe.',
    question:
      'Vận dụng lý luận về xây dựng môi trường tâm lý – xã hội an toàn và cơ chế phối hợp giữa GVCN với Giáo viên bộ môn, Gia đình học sinh (Giáo trình Giáo dục học HCMUE tr. 78–82), anh/chị hãy xử lí tình huống theo quy trình 5 bước chuẩn mực.',
    principlesApplied: [
      'Xây dựng môi trường lớp học an toàn (Môi trường vật chất và Môi trường tâm lý – xã hội, Giáo trình tr. 79–80)',
      'Cơ chế phối hợp giữa GVCN với GV bộ môn và Gia đình học sinh (Giáo trình tr. 80–82)',
      'Điều 89, 90 Luật Giáo dục 2019 và Tiêu chuẩn 4 Thông tư 20/2018/TT-BGDĐT',
      'Nguyên tắc tôn trọng nhân cách học sinh kết hợp với yêu cầu hợp lý',
    ],
    solutionSteps: [
      {
        step: 1,
        title: 'Bước 1: Nhận diện sự việc và xác định vấn đề cần giải quyết',
        content:
          'Có hai vấn đề đồng thời nảy sinh: (1) Tâm lý lo sợ của học sinh trước hình thức họp phụ huynh truyền thống nặng về phê bình công khai; (2) Mâu thuẫn thiếu thấu hiểu giữa học sinh và giáo viên bộ môn Hóa học về tiêu chí đánh giá điểm số.',
      },
      {
        step: 2,
        title: 'Bước 2: Thu thập thông tin và phân tích nguyên nhân theo lý luận Chương 4',
        content:
          'Theo Giáo trình HCMUE (tr. 80–82), cuộc họp CMHS là diễn đàn đồng hành sư phạm chứ không phải "phiên tòa" phán xét lỗi lầm của trẻ. Về môn Hóa, GVCN cần lắng nghe tâm tư học sinh và trao đổi chân thành với GV bộ môn để giải tỏa nghi ngại về phương pháp chấm.',
      },
      {
        step: 3,
        title: 'Bước 3: Đề xuất các phương án giải quyết khả thi',
        content:
          'Phương án 1: Tiếp tục họp phụ huynh theo lối cũ (đọc điểm công khai) và bênh vực GV bộ môn tuyệt đối (gây bức xúc cho trò và phụ huynh). Phương án tối ưu: Đổi mới kịch bản họp CMHS theo hướng đồng hành tích cực, bảo mật kết quả cá nhân và tổ chức trao đổi chuyên môn giữa GV bộ môn với học sinh.',
      },
      {
        step: 4,
        title: 'Bước 4: Lựa chọn phương án tối ưu và tổ chức thực hiện tác động sư phạm',
        content:
          'Thực hiện đồng bộ: (1) Với GV bộ môn Hóa: GVCN chia sẻ thiện chí tâm lý của lớp, mời cô giải thích rõ biểu điểm và hướng dẫn kỹ năng làm bài để học sinh thấu hiểu; (2) Với cuộc họp CMHS: Hướng dẫn học sinh viết "Thư gửi bố mẹ"; báo cáo chung nêu bật sự tiến bộ toàn diện của tập thể; gửi phiếu nhận xét và điểm số riêng kín đáo cho từng phụ huynh kèm tư vấn đồng hành tại gia đình.',
      },
      {
        step: 5,
        title: 'Bước 5: Đánh giá kết quả, theo dõi hỗ trợ và rút kinh nghiệm sư phạm',
        content:
          'Thu thập phiếu phản hồi ẩn danh từ phụ huynh sau cuộc họp; theo dõi không khí học tập môn Hóa trong các tuần tiếp theo để bảo đảm chuyển biến tích cực bền vững.',
      },
    ],
    pitfallsToAvoid: [
      'Công khai danh sách điểm kém và lỗi kỷ luật trước toàn thể phụ huynh làm tổn thương lòng tự trọng của học sinh và cha mẹ.',
      'Phê phán giáo viên bộ môn trước mặt học sinh làm suy giảm uy tín của tập thể sư phạm.',
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
      lessonCode: 'EDUC2802-C4-L3',
      clos: ['CLO6', 'CLO7'],
      textbookPages: 'Giáo trình Giáo dục học HCMUE (Trang 78 – 82)',
      legalRefs: [
        'Luật Giáo dục 2019 (Điều 89, 90, 91 — Phối hợp Nhà trường, Gia đình và Xã hội)',
        'Thông tư 20/2018/TT-BGDĐT (Tiêu chuẩn 3 & Tiêu chuẩn 4)',
        'Thông tư 32/2020/TT-BGDĐT (Điều 29, 44)',
      ],
      sessionNote: 'Mục 4.2.4 – 4.2.6 · Trang 78 – 82',
    }),

    // PHẦN I: TỔ CHỨC HOẠT ĐỘNG HỌC TẬP VÀ HOẠT ĐỘNG TRẢI NGHIỆM (TRANG 78 – 79)
    createElement(
      'section',
      { id: '1-to-chuc-hoc-tap-va-trai-nghiem', className: 'space-y-4' },
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
          '1. Tổ chức Hoạt động Học tập và Hoạt động Trải nghiệm Lớp Chủ nhiệm (Trang 78 – 79)',
        ),
      ),
      createElement(
        'div',
        { className: 'space-y-3 text-sm text-[#29383D]' },
        createElement(
          'p',
          null,
          'Theo ',
          createElement('strong', null, 'Giáo trình Giáo dục học HCMUE (tr. 78–79)'),
          ', giáo dục toàn diện đòi hỏi GVCN không chỉ chú trọng kết quả học tập văn hóa mà phải kết hợp hữu cơ giữa hoạt động trí tuệ với các hoạt động trải nghiệm, rèn luyện kỹ năng thực tiễn.',
        ),
        createElement(
          'div',
          { className: 'grid grid-cols-1 md:grid-cols-2 gap-4 pt-1' },
          createElement(
            'div',
            { className: 'rounded-xl border border-[#CFDADB] bg-[#F7FAFA] p-4 space-y-2' },
            createElement(
              'h4',
              { className: 'font-serif text-sm font-bold text-[#3F6570]' },
              'Biện pháp nâng cao kết quả học tập',
            ),
            createElement(
              'ul',
              { className: 'list-disc space-y-1.5 pl-4 text-xs text-[#55676B]' },
              createElement(
                'li',
                null,
                'Xây dựng nề nếp chuyên cần, tinh thần tự giác; chuẩn bị dụng cụ học tập chu đáo trước giờ lên lớp.',
              ),
              createElement(
                'li',
                null,
                'Phối hợp GV bộ môn đổi mới phương pháp dạy học tích cực, đa dạng hóa hoạt động nhóm (học để biết, học để làm, học để chung sống).',
              ),
              createElement(
                'li',
                null,
                'Phát động phong trào thi đua học tập có trọng tâm: "Đôi bạn cùng tiến", "Tuần học tốt", giành điểm xuất sắc.',
              ),
              createElement(
                'li',
                null,
                'Lập kế hoạch phân hóa: Phụ đạo học sinh yếu kém (lấp lỗ hổng kiến thức, khích lệ tiến bộ nhỏ) và bồi dưỡng phát triển học sinh giỏi, có năng khiếu.',
              ),
            ),
          ),
          createElement(
            'div',
            { className: 'rounded-xl border border-[#CFDADB] bg-[#F7FAFA] p-4 space-y-2' },
            createElement(
              'h4',
              { className: 'font-serif text-sm font-bold text-[#3F6570]' },
              'Tổ chức Hoạt động trải nghiệm',
            ),
            createElement(
              'ul',
              { className: 'list-disc space-y-1.5 pl-4 text-xs text-[#55676B]' },
              createElement(
                'li',
                null,
                'Chịu trách nhiệm thiết kế và tổ chức tiết Sinh hoạt lớp theo Chương trình HĐTN (gồm 2 phần: sơ kết hành chính trong tuần và sinh hoạt theo chủ đề giáo dục).',
              ),
              createElement(
                'li',
                null,
                'Tổ chức các hoạt động ngoại khóa phong phú: văn nghệ, thể dục thể thao, lao động công ích, tham quan dã ngoại và hoạt động thiện nguyện xã hội.',
              ),
              createElement(
                'li',
                null,
                'Khuyến khích học sinh trực tiếp tham gia lập kế hoạch, dẫn dắt và đánh giá hoạt động để phát triển năng lực tự chủ.',
              ),
            ),
          ),
        ),
      ),
    ),

    // PHẦN II: XÂY DỰNG VÀ PHÁT TRIỂN MÔI TRƯỜNG GIÁO DỤC LỚP HỌC AN TOÀN (TRANG 79 – 80)
    createElement(
      'section',
      { id: '2-xay-dung-moi-truong-lop-hoc-an-toan', className: 'space-y-4' },
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
          '2. Xây dựng và Phát triển Môi trường Giáo dục Lớp học An toàn (Trang 79 – 80)',
        ),
      ),
      createElement(
        'div',
        { className: 'space-y-3' },
        createElement(
          'p',
          { className: 'text-sm text-[#29383D]' },
          'Môi trường giáo dục lớp học an toàn là điều kiện tiền đề quyết định sức khỏe tinh thần và hiệu quả phát triển nhân cách của học sinh, cấu thành từ hai yếu tố bổ trợ lẫn nhau:',
          createElement(
            Sidenote,
            {
              number: 1,
              type: 'caution',
              title: 'An toàn tâm lý trong lớp học',
            },
            'Một lớp học có cơ sở vật chất hiện đại nhưng tồn tại sự chế giễu, cô lập bạn bè hoặc áp lực thành tích nặng nề thì chưa phải là môi trường giáo dục an toàn. An toàn tâm lý là điều kiện tiên quyết để học sinh dám bộc lộ bản thân và sáng tạo.',
          ),
        ),
        createElement(ComparativeTable, {
          title:
            'Bảng đối sánh Hai Thành tố của Môi trường Lớp học An toàn, Thân thiện (Trang 79 – 80)',
          subtitle:
            'Kiến tạo không gian sư phạm chuẩn mực về vật chất và dân chủ, tôn trọng, yêu thương về tâm lý xã hội.',
          badge: 'Hai Thành tố Môi trường Lớp học',
          columns: [
            { key: 'component', header: 'Thành tố môi trường', widthClass: 'w-1/4' },
            { key: 'standards', header: 'Tiêu chuẩn & Yêu cầu cốt lõi', widthClass: 'w-3/8' },
            { key: 'role', header: 'Vai trò & Biện pháp tổ chức của GVCN' },
          ],
          rows: [
            {
              component: '1. Môi trường vật chất của lớp học',
              standards:
                'Bố trí không gian phòng học khoa học, vệ sinh, thoáng mát, đủ ánh sáng, thẩm mỹ; bàn ghế đúng quy chuẩn tầm vóc lứa tuổi; góc học tập và bảng tin sáng tạo, linh hoạt; trang thiết bị và học liệu đa dạng, giảm thiểu tối đa nguy cơ tai nạn thương tích.',
              role: 'Hướng dẫn học sinh tự trang trí lớp học xanh – sạch – đẹp, phân công tổ trực nhật duy trì vệ sinh và tự giác bảo quản tài sản chung của lớp.',
            },
            {
              component: '2. Môi trường tâm lý – xã hội của lớp học',
              standards:
                'Xây dựng bầu không khí giao tiếp cởi mở, thân thiện, dân chủ; học sinh cảm thấy lớp học là ngôi nhà thứ hai an toàn. Giáo viên gương mẫu, ứng xử tế nhị, ân cần, lắng nghe; không miệt thị, chửi mắng, đánh phạt xúc phạm thân thể hay nhân phẩm học sinh.',
              role: 'Chủ động phát hiện và triệt tiêu các mầm mống cô lập, chia rẽ bè phái, ngăn chặn từ sớm nguy cơ bạo lực học đường (cả bạo lực thể chất và bạo lực mạng).',
            },
          ],
          footerNote: 'Nguồn: Giáo trình Giáo dục học HCMUE (Mục 4.2.5, Trang 79 – 80).',
        }),
      ),
    ),

    // PHẦN III: BẢNG MA TRẬN PHỐI HỢP CÁC LỰC LƯỢNG GIÁO DỤC CỦA GVCN (TRANG 80 – 82)
    createElement(
      'section',
      { id: '3-ma-tran-phoi-hop-cac-luc-luong', className: 'space-y-4' },
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
          '3. Ma trận Phối hợp Các Lực lượng Giáo dục của GVCN (Trang 80 – 82)',
        ),
      ),
      createElement(NumberedProcessFlow, {
        title: 'Cơ chế Phối hợp 3 Trục Lực lượng Giáo dục của Giáo viên Chủ nhiệm Lớp',
        subtitle:
          'Bảo đảm sự thống nhất biện chứng về mục tiêu, nội dung và phương pháp tác động sư phạm theo Giáo trình HCMUE tr. 80–82.',
        badge: '3 Trục Phối hợp Lực lượng GD',
        columns: 3,
        steps: [
          {
            number: 1,
            title: '01. Phối hợp với Đoàn TNCS Hồ Chí Minh & Đội TNTP',
            badge: 'Trục 1: Đoàn · Đội',
            description:
              'Nguyên tắc: Tôn trọng tính độc lập, tự quản của tổ chức Đoàn/Đội; không áp đặt hành chính. Hành động: Cố vấn xây dựng kế hoạch phong trào, bồi dưỡng cán bộ Đội/Đoàn nòng cốt, phối hợp tổ chức các chủ điểm thi đua lớn gắn với mục tiêu giáo dục của trường.',
            keyAction: 'Tôn trọng quyền tự quản và đồng hành cùng phong trào Đoàn/Đội.',
            deliverable: 'Phong trào thiếu nhi/thanh niên của lớp hoạt động sôi nổi, tự giác.',
          },
          {
            number: 2,
            title: '02. Phối hợp với Giáo viên Bộ môn',
            badge: 'Trục 2: GV Bộ môn',
            description:
              'Nguyên tắc: Thống nhất yêu cầu giáo dục và tôn trọng chuyên môn của đồng nghiệp. Hành động: Thường xuyên trao đổi về thái độ và kết quả học tập từng môn; lắng nghe phản ánh của GV bộ môn; cùng bàn bạc biện pháp hỗ trợ học sinh có hoàn cảnh khó khăn; tham khảo ý kiến GV bộ môn khi đánh giá hạnh kiểm cuối kỳ.',
            keyAction: 'Trao đổi hai chiều thường xuyên và tham khảo ý kiến đánh giá học sinh.',
            deliverable: 'Sự nhất quán về chuẩn mực kỷ luật và phương pháp giữa các môn học.',
          },
          {
            number: 3,
            title: '03. Phối hợp với Gia đình Học sinh & Ban đại diện CMHS',
            badge: 'Trục 3: Gia đình',
            description:
              'Nguyên tắc: Hợp tác bình đẳng, tôn trọng, đồng thuận vì sự tiến bộ của học sinh. Hành động: Tổ chức họp phụ huynh định kỳ dân chủ, tập trung tư vấn phương pháp giáo dục thay vì chỉ thông báo điểm số; sử dụng hiệu quả sổ liên lạc điện tử; thăm gia đình học sinh đặc biệt để thấu hiểu hoàn cảnh.',
            keyAction: 'Tư vấn phương pháp đồng hành và tổ chức họp phụ huynh đối thoại dân chủ.',
            deliverable: 'Mối quan hệ cộng tác tin cậy, đồng bộ giữa gia đình và nhà trường.',
          },
        ],
      }),
      createElement(LegalReferenceBox, {
        documentTitle: 'Luật Giáo dục số 43/2019/QH14 & Thông tư 20/2018/TT-BGDĐT',
        article: 'Điều 89, 90, 91 Luật Giáo dục 2019 & Tiêu chuẩn 4 Thông tư 20/2018/TT-BGDĐT',
        quote:
          'Nhà trường có trách nhiệm chủ động phối hợp với gia đình và xã hội để tổ chức hoặc tham gia các hoạt động giáo dục theo kế hoạch của nhà trường, bảo đảm an toàn cho người dạy và người học; thông báo về kết quả học tập, rèn luyện của người học cho cha mẹ hoặc người giám hộ; xây dựng mối quan hệ hợp tác tin cậy và huy động nguồn lực xã hội hóa hợp pháp.',
        pedagogicalAnalysis:
          'GVCN là hạt nhân trung tâm hiện thực hóa nguyên lý giáo dục của quốc gia: Nhà trường kết hợp chặt chẽ với Gia đình và Xã hội để tạo ra sức mạnh giáo dục tổng hợp.',
      }),
    ),

    // PHẦN IV: KHUNG TÌNH HUỐNG THỰC HÀNH 5 BƯỚC (CASE STUDY 403)
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
          '4. Tình huống Thực hành 5 Bước: Đổi mới Họp Cha Mẹ Học Sinh và Hóa giải Xung đột Bộ môn',
        ),
      ),
      createElement(CaseStudyBox, { caseStudy: caseStudy4_3, defaultOpenSolution: false }),
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
    lessonId === 'gdh-c4-b1-vi-tri-chuc-nang-va-nhiem-vu-cua-gvcn' ||
    lessonId === 'educ2802-c4-l1' ||
    lessonId === 'chuc-nang-va-nhiem-vu-cua-nguoi-giao-vien-chu-nhiem-lop'
  ) {
    return {
      default: Lesson4_1View,
      frontmatter: {
        title: 'Bài 4.1: Chức năng và nhiệm vụ của giáo viên chủ nhiệm lớp',
        description:
          'Phân tích vị trí pháp lý đặc biệt của người giáo viên chủ nhiệm trong cơ cấu trường phổ thông, giải mã hệ thống 4 chức năng cốt lõi và lập bảng ma trận đối chiếu nhiệm vụ của GVCN cấp Tiểu học và Trung học theo Điều lệ trường học 2020.',
        level: 'basic',
        tags: [
          'EDUC2802-C4-L1',
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
            id: '1-vi-tri-va-khai-niem-gvcn',
            text: '1. Vị trí và Khái niệm Giáo viên Chủ nhiệm Lớp (Trang 67)',
            depth: 2,
          },
          {
            id: '2-bon-chuc-nang-cot-loi-gvcn',
            text: '2. Bốn Chức năng Cốt lõi của Giáo viên Chủ nhiệm (Trang 67 – 68)',
            depth: 2,
          },
          {
            id: '3-doi-chieu-nhiem-vu-dieu-le-2020',
            text: '3. Ma trận Đối chiếu Nhiệm vụ GVCN Cấp Tiểu học và Trung học theo Điều lệ 2020 (Trang 68 – 69)',
            depth: 2,
          },
          {
            id: '4-tinh-huong-thuc-hanh',
            text: '4. Tình huống Thực hành 5 Bước: Xử lý Xung đột Sư phạm Giờ học Bộ môn',
            depth: 2,
          },
        ],
        blocks: [],
      },
    };
  }

  if (
    lessonId === 'gdh-c4-b2-tim-hieu-hoc-sinh-lap-ke-hoach-va-xay-dung-tap-the-hoc-sinh' ||
    lessonId === 'gdh-c4-b2-noi-dung-va-phuong-phap-giao-duc-cua-gvcn-lop' ||
    lessonId === 'educ2802-c4-l2' ||
    lessonId === 'tim-hieu-hoc-sinh-lap-ke-hoach-va-xay-dung-tap-the-hoc-sinh'
  ) {
    return {
      default: Lesson4_2View,
      frontmatter: {
        title: 'Bài 4.2: Tìm hiểu học sinh, lập kế hoạch và xây dựng tập thể học sinh',
        description:
          'Quy trình tìm hiểu đối tượng giáo dục toàn diện, lưu đồ 6 bước thiết kế kế hoạch giáo dục lớp chủ nhiệm, phân tích 3 giai đoạn tiến hóa của tập thể học sinh và 4 biện pháp xây dựng tập thể lớp vững mạnh.',
        level: 'intermediate',
        tags: [
          'EDUC2802-C4-L2',
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
            id: '1-phuong-phap-tim-hieu-hoc-sinh',
            text: '1. Phương pháp Tìm hiểu Toàn diện Học sinh Lớp Chủ nhiệm (Trang 70 – 71)',
            depth: 2,
          },
          {
            id: '2-luu-do-6-buoc-lap-ke-hoach',
            text: '2. Lưu đồ 6 Bước Xây dựng Kế hoạch Giáo dục của Lớp Chủ nhiệm (Trang 71 – 73)',
            depth: 2,
          },
          {
            id: '3-ba-giai-doan-phat-trien-tap-the',
            text: '3. Bản chất và 3 Giai đoạn Phát triển Tập thể Học sinh (Trang 73 – 75)',
            depth: 2,
          },
          {
            id: '4-bon-bien-phap-xay-dung-tap-the',
            text: '4. Bốn Biện pháp Cơ bản Xây dựng và Giáo dục Tập thể Học sinh (Trang 75 – 77)',
            depth: 2,
          },
          {
            id: '5-tinh-huong-thuc-hanh',
            text: '5. Tình huống Thực hành 5 Bước: Xây dựng Tập thể và Hóa giải Bè phái Đầu cấp',
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
    lessonId === 'gdh-c4-b4-thuc-hanh-xu-ly-tinh-huong-su-pham-theo-rubric-a12' ||
    lessonId === 'educ2802-c4-l3' ||
    lessonId ===
      'to-chuc-giao-duc-toan-dien-xay-dung-moi-truong-lop-hoc-va-phoi-hop-cac-luc-luong-giao-duc'
  ) {
    return {
      default: Lesson4_3View,
      frontmatter: {
        title: 'Bài 4.3: Tổ chức giáo dục toàn diện, môi trường lớp học và phối hợp các lực lượng',
        description:
          'Phương thức tổ chức nâng cao chất lượng học tập và hoạt động trải nghiệm, tiêu chuẩn thiết lập môi trường vật chất và tâm lý - xã hội an toàn trong lớp học, cơ chế phối hợp chặt chẽ giữa GVCN với Đoàn/Đội, giáo viên bộ môn và gia đình học sinh.',
        level: 'advanced',
        tags: [
          'EDUC2802-C4-L3',
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
            id: '1-to-chuc-hoc-tap-va-trai-nghiem',
            text: '1. Tổ chức Hoạt động Học tập và Hoạt động Trải nghiệm Lớp Chủ nhiệm (Trang 78 – 79)',
            depth: 2,
          },
          {
            id: '2-xay-dung-moi-truong-lop-hoc-an-toan',
            text: '2. Xây dựng và Phát triển Môi trường Giáo dục Lớp học An toàn (Trang 79 – 80)',
            depth: 2,
          },
          {
            id: '3-ma-tran-phoi-hop-cac-luc-luong',
            text: '3. Ma trận Phối hợp Các Lực lượng Giáo dục của GVCN (Trang 80 – 82)',
            depth: 2,
          },
          {
            id: '4-tinh-huong-thuc-hanh',
            text: '4. Tình huống Thực hành 5 Bước: Đổi mới Họp Cha Mẹ Học Sinh và Hóa giải Xung đột Bộ môn',
            depth: 2,
          },
        ],
        blocks: [],
      },
    };
  }

  return null;
}
