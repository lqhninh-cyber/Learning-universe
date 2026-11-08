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
import { Badge, Button } from '@/shared/ui';
import {
  AlertTriangle,
  BookOpen,
  Calendar,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Compass,
  FileText,
  HelpCircle,
  Layers,
  Scale,
  Sparkles,
  Target,
  XCircle,
} from 'lucide-react';
import { useState, type FC } from 'react';
import type { PedagogicalCaseStudy } from './course';

// ============================================================================
// DỮ LIỆU NGÂN HÀNG 20 TÌNH HUỐNG SƯ PHẠM ĐIỂN HÌNH (HCMUE STANDARDS)
// ============================================================================

export interface ExtendedCaseStudy extends PedagogicalCaseStudy {
  readonly category: 'insubordination' | 'romance' | 'bullying' | 'integrity' | 'parent';
  readonly categoryName: string;
  readonly targetGrade: string;
}

const BASE_PEDAGOGICAL_20_CASE_STUDIES: readonly ExtendedCaseStudy[] = [
  // --------------------------------------------------------------------------
  // NHÓM 1: CHỐNG ĐỐI, VÔ LỄ & VI PHẠM NỘI QUY (TÌNH HUỐNG 1 - 4)
  // --------------------------------------------------------------------------
  {
    id: 1,
    title: 'Học sinh công khai cãi lại và bất hợp tác trong giờ học',
    category: 'insubordination',
    categoryName: 'Chống đối & Vi phạm nội quy',
    targetGrade: 'Lớp 10 / 11 (THPT)',
    context:
      'Trong tiết học môn Toán, giáo viên gọi em H. lên bảng giải bài tập. H. không lên mà ngồi im, mắt nhìn ra cửa sổ. Khi giáo viên nhắc lại lần hai, H. vỗ mạnh tay xuống bàn và nói lớn tiếng trước cả lớp: "Thầy dạy chán phèo, bắt làm bài khó làm gì, em không thích học nên không lên đấy!". Cả lớp xôn xao, nhiều học sinh quay lại nhìn xem phản ứng của giáo viên.',
    question:
      'Nếu là giáo viên bộ môn trong tình huống này, Thầy/Cô sẽ xử lý thế nào để vừa duy trì kỷ cương lớp học, vừa không làm bùng phát xung đột căng thẳng với học sinh?',
    principlesApplied: [
      'Nguyên tắc tôn trọng nhân cách kết hợp yêu cầu cao đối với học sinh',
      'Nguyên tắc kiềm chế cảm xúc sư phạm và biến đổi tình huống',
      'Nguyên tắc giáo dục trong tập thể và bằng tập thể',
    ],
    solutionSteps: [
      {
        step: 1,
        title: 'Giữ bình tĩnh tuyệt đối ("Dừng 5 giây") & Không đối đầu tay đôi',
        content:
          'Hít thở sâu, giữ nét mặt điềm đạm, không nổi giận, không mắng mỏ sỉ nhục hay đôi co tay đôi với học sinh trước mặt tập thể, tránh để học sinh rơi vào bẫy tâm lý muốn khẳng định "cái tôi anh hùng" trước bạn bè.',
      },
      {
        step: 2,
        title: 'Ổn định lớp & Đặt ranh giới quy chuẩn rõ ràng',
        content:
          'Nói dứt khoát với âm lượng vừa phải: "Ý kiến về độ khó bài tập hay phương pháp giảng dạy là cảm nhận cá nhân của em, thầy ghi nhận. Tuy nhiên, thái độ phản ứng trong giờ học cần tuân thủ nội quy chung của lớp. Thầy và em sẽ có buổi trao đổi riêng sau giờ học để giải quyết khó khăn của em. Bây giờ thầy mời một bạn khác lên hỗ trợ lớp." Sau đó tiếp tục tiết dạy bình thường.',
      },
      {
        step: 3,
        title: 'Gặp gỡ riêng sau giờ học & Lắng nghe nguyên nhân thực sự',
        content:
          'Cuối buổi học, hẹn H. ở lại phòng chờ giáo viên hoặc góc yên tĩnh. Không tra hỏi kết tội mà lắng nghe tích cực: "Hôm nay điều gì khiến em cảm thấy quá tải hoặc bức xúc đến mức phản ứng như vậy?". Khám phá xem em có bị hổng kiến thức căn bản môn Toán, gặp áp lực điểm số hay khúc mắc chuyện gia đình.',
      },
      {
        step: 4,
        title: 'Chỉ rõ sai phạm, giao ước khắc phục & Phối hợp GVCN',
        content:
          'Giúp H. nhận thức rõ việc vô lễ trước tập thể là vi phạm chuẩn mực văn hóa học đường. Đề nghị em chuẩn bị lại bài và gửi lời xin lỗi chân thành đến giáo viên. Phối hợp với GVCN để cùng theo dõi, hỗ trợ phụ đạo kiến thức bị hổng và động viên kịp thời khi em có tiến bộ.',
      },
    ],
    pitfallsToAvoid: [
      'Tức giận quát tháo, xông lại đập bàn hoặc đuổi ngay học sinh ra khỏi lớp (vi phạm Điều lệ trường học).',
      'Đôi co tranh cãi tay đôi làm cả lớp bị ngắt quãng giờ học và biến mình thành tâm điểm chỉ trích.',
      'Im lặng bỏ qua xem như không có chuyện gì khiến uy tín người thầy và kỷ cương lớp học bị sụp đổ.',
    ],
    coreLesson:
      'Sự điềm đạm và ranh giới rõ ràng của người thầy trước sự khiêu khích chính là bản lĩnh sư phạm tối cao.',
  },
  {
    id: 2,
    title: 'Học sinh thường xuyên trốn tiết, chơi game và rủ rê bạn bè',
    category: 'insubordination',
    categoryName: 'Chống đối & Vi phạm nội quy',
    targetGrade: 'Lớp 8 / 9 (THCS)',
    context:
      'GVCN nhận được phản ánh từ giám thị và giáo viên bộ môn: Em K. (học sinh nam) trong 2 tuần qua đã bỏ 5 tiết học buổi chiều, rủ thêm 2 bạn cùng lớp ra quán Internet gần trường chơi game online. Khi bị lớp trưởng nhắc nhở, K. đe dọa sẽ "xử lý" nếu lớp trưởng dám báo với cô chủ nhiệm.',
    question:
      'Là GVCN, Thầy/Cô sẽ tiến hành can thiệp như thế nào để vừa chấm dứt tình trạng trốn tiết của K., vừa bảo vệ cán bộ lớp và không đẩy học sinh vào trạng thái chán học bỏ trường?',
    principlesApplied: [
      'Nguyên tắc phối hợp giáo dục giữa Nhà trường, Gia đình và Xã hội',
      'Nguyên tắc phát huy ưu điểm để khắc phục nhược điểm',
      'Nguyên tắc đảm bảo tính nhân văn và kỷ luật tích cực',
    ],
    solutionSteps: [
      {
        step: 1,
        title: 'Xác minh thông tin đa chiều & Bảo vệ an toàn cho cán bộ lớp',
        content:
          'Kiểm tra lại sổ đầu bài, làm việc kín đáo với giám thị và 2 học sinh cùng đi chơi game để có bằng chứng khách quan, tránh đối chất làm lộ việc lớp trưởng báo tin nhằm bảo đảm an toàn tâm lý cho lớp trưởng.',
      },
      {
        step: 2,
        title: 'Gặp riêng học sinh K. & Phân tích tâm lý ham thích công nghệ',
        content:
          'Gặp riêng K. trong không khí cởi mở, tìm hiểu nguyên nhân em mê game (do cảm giác chiến thắng ảo, buồn chán việc học hay ảnh hưởng của nhóm bạn ngoài xã hội). Công nhận thế mạnh về phản xạ nhanh và sự am hiểu công nghệ của em.',
      },
      {
        step: 3,
        title: 'Hợp tác chặt chẽ với cha mẹ học sinh trên tinh thần đồng hành',
        content:
          'Mời cha mẹ K. đến trường trao đổi riêng. Phân tích cụ thể thời gian biểu và tác hại của việc trốn học. Hướng dẫn cha mẹ cách quản lý giờ giấc, kiểm soát thiết bị và tiền tiêu vặt mà không dùng đòn roi bạo lực.',
      },
      {
        step: 4,
        title: 'Chuyển hóa năng lượng & Giao trách nhiệm gắn kết tập thể',
        content:
          'Giao cho K. phụ trách tổ kỹ thuật âm thanh, máy chiếu của lớp trong các tiết sinh hoạt và hoạt động trải nghiệm. Ký cam kết thi đua có sự giám sát của tổ trưởng và cha mẹ.',
      },
    ],
    pitfallsToAvoid: [
      'Đọc tên, bêu riếu học sinh trước toàn trường dưới cờ khiến học sinh xấu hổ, bất cần và bỏ học hẳn.',
      'Chỉ trích cha mẹ học sinh không biết dạy con, khiến gia đình bức xúc và buông xuôi.',
    ],
    coreLesson:
      'Nghiện game thường là triệu chứng của sự thiếu vắng niềm vui và sự ghi nhận trong đời sống thực tế.',
  },
  {
    id: 3,
    title: 'Học sinh mang điện thoại dùng việc riêng, quay lén thầy cô đưa lên mạng xã hội',
    category: 'insubordination',
    categoryName: 'Chống đối & Vi phạm nội quy',
    targetGrade: 'Lớp 11 / 12 (THPT)',
    context:
      'Trong giờ học văn, một học sinh nữ đã lén dùng điện thoại quay lại khoảnh khắc giáo viên sơ ý nói nhịu một từ ngữ nhạy cảm. Em này đã lồng ghép nhạc chế giễu và đăng video lên tài khoản TikTok cá nhân. Đoạn video nhanh chóng đạt hơn 50.000 lượt xem và hàng trăm bình luận khiếm nhã nhắm vào giáo viên.',
    question:
      'Nếu phát hiện tình huống này, giáo viên và nhà trường cần xử lý khủng hoảng truyền thông học đường này như thế nào để vừa bảo vệ danh dự nhà giáo, vừa giáo dục ý thức pháp luật số cho học sinh?',
    principlesApplied: [
      'Nguyên tắc giáo dục gắn liền với thực tiễn và pháp luật (Luật An ninh mạng, Điều lệ trường học)',
      'Nguyên tắc tôn trọng kết hợp yêu cầu nghiêm minh',
      'Nguyên tắc xử lý tình huống khẩn cấp có tính sư phạm',
    ],
    solutionSteps: [
      {
        step: 1,
        title: 'Xử lý khủng hoảng kỹ thuật số & Ngăn chặn phát tán',
        content:
          'Báo cáo ngay với Ban Giám hiệu và bộ phận Đoàn thanh niên. Tiếp cận học sinh đăng tải yêu cầu gỡ bỏ video ngay lập tức; báo cáo vi phạm tiêu chuẩn cộng đồng để nền tảng mạng xã hội khóa video.',
      },
      {
        step: 2,
        title: 'Làm việc riêng với học sinh và cha mẹ có sự hiện diện của BGH',
        content:
          'Tổ chức cuộc họp kín với học sinh và phụ huynh. Trích dẫn Điều 31 Bộ luật Dân sự (Quyền của cá nhân đối với hình ảnh) và Luật An ninh mạng để học sinh hiểu rõ hành vi quay lén và bôi nhọ người khác là vi phạm pháp luật nghiêm trọng chứ không đơn thuần là "trò đùa".',
      },
      {
        step: 3,
        title: 'Yêu cầu học sinh xin lỗi công khai và khắc phục hậu quả',
        content:
          'Yêu cầu học sinh viết bản kiểm điểm nhận thức rõ lỗi sai, đăng bài đính chính xin lỗi giáo viên trên trang cá nhân và trực tiếp xin lỗi thầy/cô trước sự chứng kiến của phụ huynh.',
      },
      {
        step: 4,
        title: 'Tổ chức chuyên đề văn hóa ứng xử trên không gian mạng',
        content:
          'Nhà trường tổ chức tiết sinh hoạt chuyên đề toàn trường về "Công dân số có trách nhiệm & Đạo đức trên mạng xã hội", hướng dẫn học sinh kỹ năng sử dụng điện thoại thông minh đúng quy định theo Thông tư 32/2020.',
      },
    ],
    pitfallsToAvoid: [
      'Giáo viên tự ý lên mạng xã hội bình luận tranh cãi hoặc đăng bài tố cáo học sinh làm tình hình lan rộng thêm.',
      'Áp dụng hình thức kỷ luật đình chỉ học tập cực đoan mà không giải thích rõ khía cạnh pháp luật và đạo đức.',
    ],
    coreLesson:
      'Không gian mạng là ảo, nhưng tổn thương tinh thần và trách nhiệm pháp lý luôn là có thật.',
  },
  {
    id: 4,
    title: 'Cả lớp đồng loạt phản đối, tẩy chay phương pháp giảng dạy của giáo viên bộ môn',
    category: 'insubordination',
    categoryName: 'Chống đối & Vi phạm nội quy',
    targetGrade: 'Lớp 11 (THPT)',
    context:
      'Tập thể lớp 11A đồng loạt ký vào một lá đơn gửi lên Ban Giám hiệu và GVCN đề nghị đổi giáo viên dạy môn Tiếng Anh. Các em phản ánh cô giáo dạy quá nhanh, thường xuyên cáu gắt, cho bài kiểm tra quá khó và có lời lẽ hạ thấp học sinh. Trong các tiết Tiếng Anh gần đây, cả lớp giữ thái độ im lặng bất hợp tác, không ai giơ tay phát biểu.',
    question:
      'Với vai trò là Giáo viên chủ nhiệm lớp, Thầy/Cô sẽ làm chiếc cầu nối như thế nào giữa tập thể học sinh, giáo viên bộ môn và Ban Giám hiệu để giải quyết xung đột sư phạm này?',
    principlesApplied: [
      'Nguyên tắc giáo dục trong tập thể và bằng tập thể',
      'Nguyên tắc kết hợp khéo léo tính nguyên tắc và nghệ thuật ứng xử sư phạm',
      'Nguyên tắc đồng thuận giữa các lực lượng giáo dục',
    ],
    solutionSteps: [
      {
        step: 1,
        title: 'Lắng nghe khách quan tiếng nói của tập thể học sinh',
        content:
          'GVCN gặp gỡ ban cán sự lớp và đại diện học sinh trong không khí lắng nghe, thấu cảm; yêu cầu các em phản ánh trung thực, cụ thể, không dùng ngôn từ công kích cá nhân; giải thích quy trình giải quyết nguyện vọng học sinh theo đúng quy định.',
      },
      {
        step: 2,
        title: 'Trao đổi chân thành và tế nhị với giáo viên bộ môn',
        content:
          'Gặp riêng giáo viên bộ môn với thái độ tôn trọng đồng nghiệp: chia sẻ về đặc điểm tiếp thu của học sinh lớp mình, truyền đạt lại những khó khăn của học sinh một cách khéo léo để đồng nghiệp không cảm thấy bị xúc phạm hay mất uy tín.',
      },
      {
        step: 3,
        title: 'Tổ chức buổi đối thoại cởi mở có sự điều phối của GVCN',
        content:
          'Tổ chức 15 phút đầu giờ sinh hoạt lớp để cô giáo bộ môn và cả lớp cùng thẳng thắn giãi bày tâm tư. Cô giáo chia sẻ về mục tiêu rèn luyện nghiêm túc, học sinh cam kết nỗ lực học tập và cô giáo đồng ý điều chỉnh tốc độ giảng dạy phù hợp hơn.',
      },
      {
        step: 4,
        title: 'Báo cáo BGH và theo dõi chuyển biến của cả hai phía',
        content:
          'Báo cáo kết quả hòa giải lên Ban Giám hiệu; định kỳ hỏi thăm học sinh và giáo viên bộ môn để đảm bảo không khí học tập tích cực được duy trì lâu dài.',
      },
    ],
    pitfallsToAvoid: [
      'GVCN đứng về một phía để chỉ trích giáo viên bộ môn hoặc ngược lại mắng mỏ học sinh là "nổi loạn, vô ơn".',
      'Giấu giếm thông tin để mâu thuẫn âm ỉ kéo dài dẫn đến đơn thư vượt cấp lên Sở GD&ĐT.',
    ],
    coreLesson:
      'Cầu nối của GVCN chỉ thực sự vững chắc khi được xây dựng bằng sự khách quan, lòng tôn trọng đồng nghiệp và tình yêu thương học trò.',
  },

  // --------------------------------------------------------------------------
  // NHÓM 2: TÌNH BẠN, TÌNH YÊU HỌC ĐƯỜNG & RUNG ĐỘNG LỨA TUỔI (TÌNH HUỐNG 5 - 8)
  // --------------------------------------------------------------------------
  {
    id: 5,
    title: 'Đôi bạn trong lớp thể hiện tình cảm quá mức trong khuôn viên trường',
    category: 'romance',
    categoryName: 'Tình cảm học đường & Rung động lứa tuổi',
    targetGrade: 'Lớp 10 / 11 (THPT)',
    context:
      'Giờ ra chơi, giám thị phát hiện hai học sinh T. (nam) và M. (nữ) học cùng lớp đang ôm nhau và có hành vi thân mật quá mức tại khu vực cầu thang vắng vẻ phía sau thư viện. Nhiều học sinh đi ngang qua đã nhìn thấy, quay video ngắn và bàn tán rôm rả. Giám thị đã ghi tên hai em vào sổ kỷ luật và báo về cho GVCN.',
    question:
      'Là GVCN, Thầy/Cô sẽ xử lý tình huống này ra sao để giúp hai em nhận thức được ranh giới hành vi nơi công cộng mà không tạo ra chấn thương tâm lý xấu hổ cho các em?',
    principlesApplied: [
      'Nguyên tắc phù hợp đặc điểm tâm sinh lý lứa tuổi vị thành niên',
      'Nguyên tắc tôn trọng nhân cách kết hợp yêu cầu cao',
      'Nguyên tắc bảo vệ danh dự và sự kín đáo sư phạm',
    ],
    solutionSteps: [
      {
        step: 1,
        title: 'Thu hồi video, dập tắt dư luận tiêu cực trong lớp',
        content:
          'Ngay lập tức gặp riêng các học sinh có video, yêu cầu xóa bỏ hoàn toàn, không phát tán lên mạng xã hội; quán triệt tinh thần tôn trọng sự riêng tư của bạn bè trong toàn lớp.',
      },
      {
        step: 2,
        title: 'Trò chuyện riêng với từng em trong không gian kín đáo',
        content:
          'Gặp riêng em T. và em M. Thấu hiểu rằng cảm xúc yêu thương tuổi học trò là tự nhiên, nhưng nhấn mạnh sự khác biệt giữa tình cảm riêng tư và hành vi nơi văn hóa học đường công cộng.',
      },
      {
        step: 3,
        title: 'Phân tích hệ lụy và đặt ra ranh giới ứng xử chuẩn mực',
        content:
          'Chỉ rõ cho hai em thấy hành vi thiếu tế nhị sẽ làm giảm giá trị của tình cảm đẹp, khiến bản thân bị phán xét và cha mẹ lo lắng. Yêu cầu hai em giữ khoảng cách đúng mực trong trường học.',
      },
      {
        step: 4,
        title: 'Trao đổi tế nhị với phụ huynh & Lồng ghép giáo dục giới tính',
        content:
          'Liên hệ với cha mẹ hai em với tinh thần cùng phối hợp quản lý nhẹ nhàng, tránh việc phụ huynh về nhà đánh mắng cực đoan; tổ chức chuyên đề kỹ năng sống về tình bạn, tình yêu tuổi trẻ.',
      },
    ],
    pitfallsToAvoid: [
      'Đọc biên bản kỷ luật hoặc phê bình hai em trước giờ sinh hoạt lớp hay chào cờ.',
      'Quy kết đạo đức học sinh là "hư hỏng, mất nết" khiến các em chuyển sang trạng thái bất cần.',
    ],
    coreLesson:
      'Hãy định hướng cho tình cảm học trò bằng sự thấu hiểu và lòng bao dung, thay vì cấm đoán bằng sự kỳ thị.',
  },
  {
    id: 6,
    title: 'Học sinh suy sụp tinh thần, bỏ bê học tập sau khi chia tay người yêu',
    category: 'romance',
    categoryName: 'Tình cảm học đường & Rung động lứa tuổi',
    targetGrade: 'Lớp 11 / 12 (THPT)',
    context:
      'Em N. (học sinh nữ giỏi của lớp) bỗng nhiên thay đổi hoàn toàn: thường xuyên gục đầu xuống bàn khóc trong giờ học, không làm bài tập về nhà, kết quả kiểm tra liên tục bị điểm kém. Lớp phó học tập bí mật báo với cô chủ nhiệm là N. vừa chia tay bạn trai học lớp trên, em có biểu hiện tuyệt vọng, đăng tải các dòng trạng thái bi quan trên mạng xã hội và có vết cào xước trên cổ tay.',
    question:
      'Nhận diện nguy cơ khủng hoảng tâm lý và hành vi tự hại ở học sinh, GVCN cần có biện pháp can thiệp khẩn cấp nào để bảo vệ sức khỏe tâm thần và tính mạng cho học sinh?',
    principlesApplied: [
      'Nguyên tắc ưu tiên an toàn tính mạng và sức khỏe tâm thần học sinh',
      'Nguyên tắc tiếp cận cá biệt và phối hợp chuyên môn tâm lý',
      'Nguyên tắc kiên trì, yêu thương và bảo mật thông tin',
    ],
    solutionSteps: [
      {
        step: 1,
        title: 'Can thiệp khẩn cấp & Kết nối phòng tư vấn tâm lý học đường',
        content:
          'Mời N. vào phòng tư vấn tâm lý học đường ngay lập tức với sự hỗ trợ của chuyên viên tâm lý hoặc GVCN có kỹ năng; lắng nghe không phán xét, tạo cảm giác an toàn tuyệt đối cho em.',
      },
      {
        step: 2,
        title: 'Đánh giá mức độ nguy cơ tự hại & Thông báo bảo mật cho gia đình',
        content:
          'Xác định xem em có kế hoạch tự tử hay chỉ là hành vi tự hại do quá tải cảm xúc; liên hệ khẩn cấp với phụ huynh để gia đình túc trực bên con 24/24, tuyệt đối không để em ở một mình.',
      },
      {
        step: 3,
        title: 'Tạo mạng lưới nâng đỡ cảm xúc tại lớp học',
        content:
          'Nhờ 1-2 bạn thân thiết, đáng tin cậy trong lớp kín đáo quan tâm, rủ N. đi ăn trưa, học nhóm cùng, giúp em dần hòa nhập lại với các hoạt động chung của tập thể.',
      },
      {
        step: 4,
        title: 'Đồng hành phục hồi học tập từng bước',
        content:
          'Trao đổi với các giáo viên bộ môn tạo điều kiện cho N. làm lại bài kiểm tra khi tinh thần đã ổn định hơn; không gây thêm áp lực thành tích học tập trong giai đoạn này.',
      },
    ],
    pitfallsToAvoid: [
      'Coi thường dấu hiệu vết cào trên tay và các status bi quan là "học đòi làm màu, tuổi dở hơi".',
      'Trách mắng học sinh: "Sắp thi đại học rồi mà chỉ lo yêu đương vớ vẩn" khiến em càng bế tắc hơn.',
    ],
    coreLesson:
      'Khi học sinh rơi vào hố sâu khủng hoảng, sự có mặt và lắng nghe không phán xét của người thầy chính là chiếc phao cứu sinh.',
  },
  {
    id: 7,
    title: 'Tình trạng ghen tuông tuổi học trò dẫn đến nguy cơ xung đột giữa hai nhóm học sinh',
    category: 'romance',
    categoryName: 'Tình cảm học đường & Rung động lứa tuổi',
    targetGrade: 'Lớp 10 / 11 (THPT)',
    context:
      'Hai nam sinh A (lớp 10A1) và B (lớp 10A2) cùng đem lòng thích một nữ sinh lớp 10A3. Gần đây, hai bên thường xuyên nhìn đểu nhau ở căng tin và lên mạng xã hội bình luận thách thức. Cuối buổi học hôm nay, có tin báo hai bên đã hẹn nhóm bạn sau giờ tan học tụ tập tại công viên gần trường để "nói chuyện bằng tay chân".',
    question:
      'Phát hiện nguy cơ ẩu đả bạo lực học đường trước giờ tan học, các GVCN và lực lượng giám thị cần phối hợp hành động khẩn cấp như thế nào?',
    principlesApplied: [
      'Nguyên tắc phòng ngừa từ xa và can thiệp kịp thời',
      'Nguyên tắc phối hợp liên lớp và lực lượng bảo vệ/công an địa phương',
      'Nguyên tắc giải quyết tận gốc nguyên nhân mâu thuẫn',
    ],
    solutionSteps: [
      {
        step: 1,
        title: 'Chặn đứng nguy cơ xô xát ngay trong khuôn viên trường',
        content:
          'GVCN hai lớp cùng giám thị giữ cả hai nam sinh A và B ở lại trường sau tiếng trống tan học; báo lực lượng bảo vệ và công an khu vực tăng cường tuần tra tại điểm hẹn ngoài cổng trường.',
      },
      {
        step: 2,
        title: 'Tách riêng hai bên & Cho học sinh viết tường trình',
        content:
          'Đưa A và B vào hai phòng riêng biệt, yêu cầu viết bản tường trình chi tiết về nguồn cơn mâu thuẫn, các lời đe dọa trên mạng và danh sách những bạn được rủ tham gia.',
      },
      {
        step: 3,
        title: 'Tổ chức buổi gặp hòa giải có sự giám sát của BGH và Phụ huynh',
        content:
          'Mời phụ huynh cả hai em đến trường; phân tích rõ trách nhiệm pháp lý nếu xảy ra thương tích theo Bộ luật Hình sự; để hai em nhận thức được sự dại dột khi dùng nắm đấm để tranh giành tình cảm; bắt tay hòa giải và xóa các bài đăng khiêu khích.',
      },
      {
        step: 4,
        title: 'Giám sát hành vi sau can thiệp',
        content:
          'Hai GVCN tiếp tục theo dõi quan hệ giữa hai em trong các tuần tiếp theo, không để mâu thuẫn âm ỉ bùng phát trở lại.',
      },
    ],
    pitfallsToAvoid: [
      'Nghĩ rằng "chuyện trẻ con cãi nhau vài câu rồi thôi" dẫn đến hậu quả xô xát gây thương tích nặng nề ngoài cổng trường.',
      'Chỉ phạt răn đe một bên khiến bên kia hả hê và mâu thuẫn càng thêm sâu sắc.',
    ],
    coreLesson:
      'Ngăn chặn một vụ bạo lực từ trong trứng nước luôn dễ dàng gấp trăm lần xử lý hậu quả của nó.',
  },
  {
    id: 8,
    title: 'Học sinh có biểu hiện tình cảm đơn phương hướng về chính giáo viên chủ nhiệm',
    category: 'romance',
    categoryName: 'Tình cảm học đường & Rung động lứa tuổi',
    targetGrade: 'Lớp 11 / 12 (THPT)',
    context:
      'Một giáo viên nam trẻ mới về trường làm chủ nhiệm lớp 11. Em H. (học sinh nữ trong lớp) thường xuyên nhắn tin Zalo đêm khuya tâm sự những chuyện riêng tư, tặng quà đắt tiền nhân các dịp lễ và trong bức thư chúc mừng 20/11, em đã thẳng thắn thổ lộ tình cảm yêu đương tha thiết với thầy giáo.',
    question:
      'Đứng trước tình huống nhạy cảm này, người giáo viên cần ứng xử khéo léo như thế nào để vừa giữ đúng chuẩn mực đạo đức nhà giáo, vừa không làm tổn thương lòng tự trọng của học sinh?',
    principlesApplied: [
      'Nguyên tắc giữ gìn chuẩn mực đạo đức nhà giáo (Thông tư 20/2018)',
      'Nguyên tắc thấu cảm tâm lý lứa tuổi nhưng kiên quyết về nguyên tắc sư phạm',
      'Nguyên tắc công khai minh bạch để bảo vệ bản thân và học trò',
    ],
    solutionSteps: [
      {
        step: 1,
        title: 'Báo cáo kín đáo với tổ chuyên môn hoặc Ban Giám hiệu',
        content:
          'Chia sẻ trung thực tình huống với giáo viên kỳ cựu hoặc Ban Giám hiệu để nhận được sự tư vấn chuyên môn và tạo sự minh bạch, bảo vệ bản thân trước những hiểu lầm có thể xảy ra.',
      },
      {
        step: 2,
        title: 'Thiết lập ngay ranh giới giao tiếp chuyên nghiệp',
        content:
          'Không nhắn tin riêng tư vào đêm khuya, không trả lời những câu hỏi vượt quá phạm vi học tập; chuyển mọi kênh trao đổi sang nhóm chung của lớp hoặc gặp trực tiếp tại trường.',
      },
      {
        step: 3,
        title: 'Trò chuyện trực tiếp, thẳng thắn nhưng tế nhị tại phòng giáo viên',
        content:
          'Hẹn gặp em H. tại văn phòng trường (nơi có người qua lại). Bày tỏ sự trân trọng tình cảm quý mến của em dành cho người thầy, nhưng giải thích rõ ràng và dứt khoát rằng ranh giới giữa thầy và trò là quy chuẩn đạo đức thiêng liêng không thể vượt qua.',
      },
      {
        step: 4,
        title: 'Định hướng học sinh tập trung vào mục tiêu tương lai',
        content:
          'Động viên em chuyển hóa sự ngưỡng mộ thầy thành động lực học tập tốt để thi đỗ vào trường đại học mơ ước; giữ thái độ cư xử bình đẳng, không xa lánh nhưng không có hành vi gây hiểu nhầm.',
      },
    ],
    pitfallsToAvoid: [
      'Lập lờ cảm xúc, đáp lại tin nhắn tình cảm hoặc trêu đùa dẫn đến vi phạm nghiêm trọng đạo đức nhà giáo.',
      'Đem chuyện bức thư tình ra kể làm trò cười cho đồng nghiệp hoặc bêu tên em trước lớp làm em nhục nhã bỏ học.',
    ],
    coreLesson:
      'Sự ngưỡng mộ của học trò đối với người thầy là điều đáng quý, nhưng người thầy bản lĩnh phải biết giữ mình trong khuôn khổ mẫu mực.',
  },

  // --------------------------------------------------------------------------
  // NHÓM 3: BẠO LỰC HỌC ĐƯỜNG, CÔ LẬP TẬP THỂ & BẮT NẠT MẠNG (TÌNH HUỐNG 9 - 12)
  // --------------------------------------------------------------------------
  {
    id: 9,
    title: 'Học sinh nhút nhát, có hoàn cảnh đặc biệt bị cả lớp tẩy chay, cô lập',
    category: 'bullying',
    categoryName: 'Bạo lực học đường & Bắt nạt',
    targetGrade: 'Lớp 7 / 8 (THCS)',
    context:
      'Em Q. mồ côi mẹ, sống với bà ngoại, tính tình rụt rè, quần áo cũ kỹ và có mùi cơ thể. Trong lớp, các học sinh khác liên tục xa lánh, khi phân chia nhóm thảo luận thì không nhóm nào chịu nhận Q. Mỗi khi Q. đi qua, một số bạn bịt mũi cười khúc khích. Q. ngày càng thu mình lại, thường trốn vào góc sân trường giờ ra chơi và nói với bà không muốn đi học nữa.',
    question:
      'Bạo lực lạnh (cô lập tinh thần) nguy hiểm không kém bạo lực thể xác. GVCN cần xây dựng kế hoạch giáo dục tập thể lớp như thế nào để khơi dậy lòng trắc ẩn và hòa nhập em Q. vào lớp?',
    principlesApplied: [
      'Nguyên tắc giáo dục trong tập thể và bằng tập thể (A.S. Makarenko)',
      'Nguyên tắc tôn trọng nhân cách kết hợp tình thương sư phạm',
      'Nguyên tắc phát huy dư luận tập thể lành mạnh',
    ],
    solutionSteps: [
      {
        step: 1,
        title: 'Tìm hiểu sâu sắc hoàn cảnh và hỗ trợ tế nhị cho học sinh',
        content:
          'Đến thăm gia đình em Q. để nắm rõ điều kiện sinh hoạt; vận động quỹ khuyến học của trường hoặc các nguồn lực hỗ trợ em đồng phục mới, xà phòng, hướng dẫn em vệ sinh cá nhân một cách hết sức tế nhị.',
      },
      {
        step: 2,
        title: 'Tác động song hành qua ban cán sự lớp và đội ngũ nòng cốt',
        content:
          'Họp kín với ban cán sự lớp và các học sinh có uy tín: khơi gợi lòng trắc ẩn và tinh thần trách nhiệm của người cán bộ lớp; phân công các bạn nữ chu đáo chủ động rủ Q. tham gia nhóm học tập.',
      },
      {
        step: 3,
        title: 'Tổ chức giờ sinh hoạt lớp chuyên đề "Lòng trắc ẩn & Sự hòa nhập"',
        content:
          'Chiếu phim ngắn hoặc kể câu chuyện về sự đồng cảm; cho cả lớp thảo luận về cảm giác bị cô lập; xây dựng thông điệp chung: "Lớp chúng ta là một gia đình, không ai bị bỏ lại phía sau".',
      },
      {
        step: 4,
        title: 'Tạo cơ hội để học sinh tỏa sáng thế mạnh riêng',
        content:
          'Tìm kiếm điểm mạnh của Q. (ví dụ em vẽ rất đẹp hoặc tính toán cẩn thận) để giao nhiệm vụ vẽ báo tường hoặc thủ thư lớp; biểu dương công khai sự đóng góp của em trước lớp.',
      },
    ],
    pitfallsToAvoid: [
      'Chỉ trích gay gắt cả lớp trước mặt Q. khiến các bạn càng thêm ghét và ngấm ngầm cô lập em sâu hơn.',
      'Ép buộc một nhóm nhận Q. với thái độ ban ơn khiến em càng mặc cảm tự ti.',
    ],
    coreLesson:
      'Một tập thể lớp chỉ thực sự phát triển khi biết yêu thương và nâng đỡ thành viên yếu thế nhất của mình.',
  },
  {
    id: 10,
    title: 'Xuất hiện nhóm kín trên mạng xã hội nói xấu, chế ảnh bôi nhọ danh dự bạn học',
    category: 'bullying',
    categoryName: 'Bạo lực học đường & Bắt nạt',
    targetGrade: 'Lớp 8 / 9 (THCS) & Lớp 10 (THPT)',
    context:
      'Phụ huynh em D. bức xúc mang đến gặp GVCN hình ảnh chụp từ một nhóm kín Facebook có tên "Hội những người ghét con D.". Trong nhóm này có hơn 20 học sinh trong lớp tham gia, liên tục đăng tải ảnh chế nhạo ngoại hình (body shaming), bịa đặt chuyện D. lẳng lơ và dùng những từ ngữ xúc phạm danh dự cực kỳ nặng nề khiến D. hoảng loạn tinh thần.',
    question:
      'Xử lý bắt nạt qua mạng (Cyberbullying) đòi hỏi sự phối hợp chặt chẽ. GVCN và nhà trường cần có quy trình xử lý kỷ luật và giáo dục nhận thức như thế nào?',
    principlesApplied: [
      'Nguyên tắc kỷ luật tích cực kết hợp giáo dục pháp luật',
      'Nguyên tắc phối hợp Nhà trường và Gia đình',
      'Nguyên tắc bảo vệ nạn nhân và trị liệu tâm lý học đường',
    ],
    solutionSteps: [
      {
        step: 1,
        title: 'Bảo vệ chứng cứ & Yêu cầu giải tán ngay nhóm kín',
        content:
          'Lưu lại toàn bộ ảnh chụp màn hình vi phạm; làm việc khẩn cấp với học sinh lập nhóm (admin), yêu cầu giải tán nhóm kín ngay lập tức và cam kết chấm dứt mọi hành vi bôi nhọ.',
      },
      {
        step: 2,
        title: 'Chăm sóc tâm lý và trấn an học sinh bị hại',
        content:
          'GVCN và chuyên viên tâm lý đồng hành cùng em D., giúp em hiểu em không có lỗi và nhà trường sẽ bảo vệ em an toàn; phụ huynh hỗ trợ giám sát tâm lý tại nhà.',
      },
      {
        step: 3,
        title: 'Họp với các học sinh liên quan và phụ huynh của các em',
        content:
          'Mời phụ huynh của nhóm học sinh tham gia bình luận xúc phạm. Phân tích rõ hành vi này cấu thành tội làm nhục người khác theo quy định pháp luật. Yêu cầu từng em viết thư xin lỗi chân thành đến D. và phụ huynh em.',
      },
      {
        step: 4,
        title: 'Xử lý kỷ luật mang tính giáo dục và phục hồi',
        content:
          'Hội đồng kỷ luật áp dụng hình thức khiển trách, thực hiện lao động công ích trong trường học (chăm sóc vườn hoa, dọn dẹp thư viện) để các em học cách đóng góp giá trị cho cộng đồng.',
      },
    ],
    pitfallsToAvoid: [
      'Xem nhẹ việc nói xấu trên mạng vì nghĩ "chưa đánh nhau ngoài đời là chưa sao".',
      'Phê bình học sinh bị hại là "chắc có làm sao thì các bạn mới ghét".',
    ],
    coreLesson:
      'Lời nói trên mạng xã hội có thể là lưỡi dao sắc nhọn; giáo dục học sinh lòng nhân ái trên không gian số là nhiệm vụ cấp bách của thời đại 4.0.',
  },
  {
    id: 11,
    title: 'Nguy cơ đánh nhau tập thể ngoài cổng trường sau giờ tan học do xích mích trên mạng',
    category: 'bullying',
    categoryName: 'Bạo lực học đường & Bắt nạt',
    targetGrade: 'Lớp 10 / 11 (THPT)',
    context:
      'Qua công tác nắm bắt thông tin từ Đội cờ đỏ, GVCN biết được sau giờ tan học chiều nay, nhóm của em P. (lớp 10A5) và nhóm học sinh trường bạn đã chuẩn bị sẵn hung khí (gậy gộc, mũ bảo hiểm) hẹn nhau tại bãi đất trống cách trường 200m để giải quyết mâu thuẫn do bình luận khiêu khích nhau trên TikTok.',
    question:
      'Đối mặt với tình huống bạo lực có tổ chức và hung khí cận kề, GVCN cần kích hoạt quy trình phối hợp khẩn cấp nào để ngăn chặn hậu quả nghiêm trọng?',
    principlesApplied: [
      'Nguyên tắc ưu tiên an toàn tuyệt đối cho học sinh và trật tự công cộng',
      'Nguyên tắc phối hợp liên ngành: Nhà trường - Công an - Địa phương',
      'Nguyên tắc xử lý kiên quyết, đúng thẩm quyền',
    ],
    solutionSteps: [
      {
        step: 1,
        title: 'Kích hoạt phương án can thiệp khẩn cấp liên ngành',
        content:
          'Báo cáo ngay với Ban Giám hiệu, Trưởng ban an ninh trường và gọi điện trực tiếp cho Công an phường/xã địa bàn yêu cầu cử lực lượng đến chốt chặn tại điểm hẹn.',
      },
      {
        step: 2,
        title: 'Giữ nhóm học sinh tại trường và thu hồi hung khí (nếu có)',
        content:
          'GVCN và tổ giám thị mời toàn bộ nhóm học sinh có liên quan lên văn phòng Đoàn trước giờ tan học; kiểm tra cặp sách và cốp xe theo đúng thẩm quyền an ninh trường học.',
      },
      {
        step: 3,
        title: 'Mời phụ huynh và lực lượng công an làm việc trực tiếp',
        content:
          'Công an khu vực cùng nhà trường và phụ huynh lập biên bản răn đe, giáo dục pháp luật về hành vi cố ý gây thương tích và gây rối trật tự công cộng; yêu cầu phụ huynh đưa con về nhà an toàn.',
      },
      {
        step: 4,
        title: 'Xem xét kỷ luật nghiêm khắc kết hợp giám sát lâu dài',
        content:
          'Hội đồng kỷ luật họp và đưa ra mức kỷ luật tạm dừng học tập có thời hạn theo Thông tư 32; giao trách nhiệm cho gia đình và Đoàn trường kèm cặp rèn luyện.',
      },
    ],
    pitfallsToAvoid: [
      'Một mình giáo viên tự ý chạy ra bãi đất trống can ngăn khi các em đã có hung khí trong tay rất nguy hiểm.',
      'Bỏ qua vì cho rằng "sự việc xảy ra ngoài khuôn viên trường học, không thuộc trách nhiệm của mình".',
    ],
    coreLesson:
      'Bảo vệ an toàn tính mạng của học sinh là ranh giới đỏ không bao giờ được phép chủ quan hay chậm trễ.',
  },
  {
    id: 12,
    title: 'Học sinh bị bạn cùng lớp đe dọa, trấn lột tiền tiêu vặt nhiều lần',
    category: 'bullying',
    categoryName: 'Bạo lực học đường & Bắt nạt',
    targetGrade: 'Lớp 6 / 7 (THCS)',
    context:
      'Phụ huynh em S. (học sinh lớp 6) gọi điện cho cô chủ nhiệm thông báo dạo gần đây S. liên tục xin tiền ăn sáng gấp đôi, thậm chí lén lấy trộm tiền trong ví của mẹ. Khi gặng hỏi, S. vừa khóc vừa run rẩy kể rằng em bị một nhóm 3 bạn cùng lớp đe dọa: mỗi ngày phải nộp 20.000 đồng, nếu không sẽ bị chặn đánh trong nhà vệ sinh trường.',
    question:
      'Trấn lột học đường là hành vi vi phạm pháp luật và gây sang chấn nặng cho học sinh nhỏ tuổi. GVCN cần tiến hành xác minh và xử lý triệt để tình trạng này như thế nào?',
    principlesApplied: [
      'Nguyên tắc bảo vệ quyền trẻ em và môi trường học đường an toàn',
      'Nguyên tắc kết hợp giáo dục nghiêm minh và phục hồi hành vi',
      'Nguyên tắc phối hợp ba môi trường giáo dục',
    ],
    solutionSteps: [
      {
        step: 1,
        title: 'Tiếp nhận thông tin kín đáo & Cam kết bảo vệ an toàn cho học sinh',
        content:
          'Trấn an phụ huynh và em S., cam kết bảo vệ danh tính của em; hướng dẫn em các kỹ năng tự bảo vệ và luôn đi cùng bạn bè, giám thị.',
      },
      {
        step: 2,
        title: 'Tách riêng từng học sinh trong nhóm trấn lột để xác minh',
        content:
          'Mời từng em trong nhóm 3 học sinh lên phòng riêng vào các thời điểm khác nhau để tránh thông đồng lời khai; đưa ra những chứng cứ cụ thể (thời gian, địa điểm, số tiền) để các em tự giác nhận lỗi.',
      },
      {
        step: 3,
        title: 'Yêu cầu bồi hoàn và xin lỗi có sự chứng kiến của phụ huynh',
        content:
          'Tổ chức buổi làm việc giữa gia đình các bên. Cha mẹ nhóm học sinh vi phạm xin lỗi gia đình em S. và hoàn trả toàn bộ số tiền đã lấy; nhóm học sinh viết bản kiểm điểm và ký cam kết không tái phạm.',
      },
      {
        step: 4,
        title: 'Kỷ luật răn đe và phân công theo dõi chặt chẽ khu vực nhà vệ sinh',
        content:
          'Áp dụng hình thức kỷ luật phù hợp theo Thông tư 32; nhà trường tăng cường camera an ninh và giám thị tuần tra tại các góc khuất và nhà vệ sinh.',
      },
    ],
    pitfallsToAvoid: [
      'Cho đối chất trực tiếp giữa em S. và nhóm bắt nạt trước lớp khiến em S. càng thêm sợ hãi bị trả thù.',
      'Chỉ cảnh cáo miệng qua loa mà không yêu cầu phụ huynh hoàn trả tiền và chịu trách nhiệm.',
    ],
    coreLesson:
      'Im lặng trước bạo lực chính là tiếp tay cho cái ác; người thầy phải là lá chắn tin cậy nhất của học trò.',
  },

  // --------------------------------------------------------------------------
  // NHÓM 4: GIAN LẬN THI CỬ, NGHI VẤN TRỘM CẮP & TÍNH TRUNG THỰC (TÌNH HUỐNG 13 - 16)
  // --------------------------------------------------------------------------
  {
    id: 13,
    title: 'Bắt quả tang học sinh sử dụng thiết bị công nghệ cao gian lận trong kỳ thi',
    category: 'integrity',
    categoryName: 'Trung thực & Kỷ luật học đường',
    targetGrade: 'Lớp 11 / 12 (THPT)',
    context:
      'Trong kỳ thi học kỳ 1 môn Toán, giám thị phát hiện em V. có biểu hiện bất thường, thường xuyên lẩm bẩm và nhìn vào tay áo. Tiến hành kiểm tra, giám thị thu giữ một tai nghe siêu nhỏ gắn sâu trong tai và thiết bị phát sóng 4G gắn dưới cổ áo để truyền đề thi ra ngoài nhờ người giải hộ.',
    question:
      'Hành vi gian lận thi cử có tổ chức bằng thiết bị công nghệ cao vi phạm quy chế thi nghiêm trọng. Cán bộ coi thi và Hội đồng thi cần xử lý đúng quy trình như thế nào?',
    principlesApplied: [
      'Nguyên tắc công bằng, khách quan và nghiêm minh trong đánh giá giáo dục',
      'Nguyên tắc tuân thủ tuyệt đối quy chế thi của Bộ GD&ĐT',
      'Nguyên tắc tính sư phạm trong xử lý kỷ luật',
    ],
    solutionSteps: [
      {
        step: 1,
        title: 'Lập biên bản vi phạm quy chế thi tại chỗ & Thu giữ tang vật',
        content:
          'Giám thị lập biên bản đình chỉ thi ngay tại phòng thi, niêm phong tang vật thiết bị điện tử có chữ ký của giám thị 1, giám thị 2 và thí sinh vi phạm; đưa học sinh về phòng Hội đồng thi.',
      },
      {
        step: 2,
        title: 'Làm việc với Hội đồng thi & Xác định nguồn tiếp tay bên ngoài',
        content:
          'Chủ tịch Hội đồng thi làm việc với học sinh V., yêu cầu khai báo rõ nguồn đề thi được truyền cho ai bên ngoài để kịp thời ngăn chặn việc lộ lọt đề thi ra diện rộng.',
      },
      {
        step: 3,
        title: 'Mời phụ huynh đến thông báo quyết định xử lý kỷ luật',
        content:
          'Thông báo cho phụ huynh, cho học sinh điểm 0 môn thi và hạ bậc hạnh kiểm học kỳ theo đúng Quy chế đánh giá xếp loại học sinh.',
      },
      {
        step: 4,
        title: 'Tư vấn tâm lý và định hướng học tập trung thực cho kỳ sau',
        content:
          'GVCN gặp gỡ, phân tích cho V. hiểu rằng giá trị của tri thức thật sự quý hơn điểm số ảo; giúp em vượt qua mặc cảm thất bại để nỗ lực ôn tập lại đàng hoàng trong kỳ thi lại.',
      },
    ],
    pitfallsToAvoid: [
      'Giám thị tự ý bỏ qua vì nể nang học sinh quen biết làm mất tính công bằng của kỳ thi.',
      'Sỉ nhục, mạt sát học sinh trước toàn thể thí sinh trong phòng thi.',
    ],
    coreLesson:
      'Sự trung thực trong học tập là nền tảng cốt lõi của nhân cách; thà nhận một điểm kém trung thực còn hơn một điểm mười dối trá.',
  },
  {
    id: 14,
    title: 'Lớp học xảy ra vụ mất tiền giá trị lớn, nghi vấn dồn vào học sinh nghèo',
    category: 'integrity',
    categoryName: 'Trung thực & Kỷ luật học đường',
    targetGrade: 'Lớp 10 / 11 (THPT)',
    context:
      'Sau tiết thể dục ngoài sân trở về, em T. hốt hoảng khóc báo với lớp bị mất 2.000.000 đồng để trong ví để đóng tiền học thêm. Nhiều bạn trong lớp nhìn sang em H. (học sinh có hoàn cảnh gia đình khó khăn, bố mẹ làm thuê) với ánh mắt nghi ngờ vì có bạn thấy H. quay lại lớp uống nước trong giờ thể dục. Lớp bắt đầu xôn xao đòi lục cặp của H.',
    question:
      'Xử lý nghi án mất trộm trong lớp là một thử thách sư phạm đỉnh cao. GVCN làm thế nào để giải quyết công bằng, tìm ra sự thật mà không gây tổn thương lòng tự trọng của học sinh nghèo?',
    principlesApplied: [
      'Nguyên tắc suy đoán vô tội và bảo vệ quyền tự do thân thể của học sinh',
      'Nguyên tắc tôn trọng nhân cách kết hợp yêu cầu cao',
      'Nguyên tắc bảo vệ danh dự và tâm lý học sinh',
    ],
    solutionSteps: [
      {
        step: 1,
        title: 'Dập tắt ngay ý định khám xét tùy tiện & Ổn định lớp',
        content:
          'Nghiêm cấm tuyệt đối mọi hành vi tự ý lục lọi đồ đạc, cặp sách của người khác; nhấn mạnh nguyên tắc pháp luật: không ai được quyền quy kết người khác khi chưa có bằng chứng.',
      },
      {
        step: 2,
        title: 'Xác minh kỹ lưỡng với học sinh báo mất tiền',
        content:
          'Hỏi rõ em T. về số tiền, mệnh giá, để ở đâu, có khả năng rơi rớt trên đường đi hay ở căng tin không; cùng em rà soát lại các địa điểm.',
      },
      {
        step: 3,
        title: 'Trò chuyện riêng với H. trên tinh thần thấu hiểu và bảo vệ',
        content:
          'Mời H. ra nói chuyện riêng: "Thầy/Cô tin tưởng vào sự trung thực của em. Thầy/Cô chỉ muốn hỏi em quay lại lớp uống nước có nhìn thấy ai khác ra vào phòng học không?". Giúp H. cảm thấy mình là người cộng tác chứ không phải tội phạm.',
      },
      {
        step: 4,
        title: 'Mở rộng điều tra & Tạo lối thoát danh dự cho người lỡ lấy',
        content:
          'Trích xuất camera hành lang trường học; đồng thời thông báo trước lớp: "Nếu bạn nào nhặt được hoặc lỡ cầm nhầm, hãy để lại vào hộp thư góp ý của lớp trước 17h chiều nay, mọi việc sẽ được coi là hiểu lầm và bỏ qua".',
      },
    ],
    pitfallsToAvoid: [
      'Cả nể cho ban cán sự lớp lục cặp từng học sinh (vi phạm pháp luật và tạo bầu không khí nghi kỵ độc hại).',
      'Vội vàng quy chụp học sinh nghèo là thủ phạm gây chấn thương tâm lý suốt đời cho đứa trẻ.',
    ],
    coreLesson:
      'Một số tiền bị mất có thể quyên góp bù đắp được, nhưng lòng tự trọng bị chà đạp của một đứa trẻ thì không bao giờ lấy lại được.',
  },
  {
    id: 15,
    title: 'Học sinh làm bài hộ bạn hoặc sao chép nguyên xi sản phẩm dự án để lấy điểm',
    category: 'integrity',
    categoryName: 'Trung thực & Kỷ luật học đường',
    targetGrade: 'Lớp 10 / 11 (THPT)',
    context:
      'Trong bài kiểm tra đánh giá theo dự án STEM môn Toán, giáo viên phát hiện nhóm của em B. nộp một báo cáo và mô hình giống hệt sản phẩm của một nhóm lớp khóa trước đã đạt giải cấp trường. Khi phỏng vấn trực tiếp, các thành viên nhóm B. đều ấp úng không giải thích được các thông số tính toán trong mô hình.',
    question:
      'Đánh giá năng lực theo CT GDPT 2018 đòi hỏi sự trung thực học thuật. Giáo viên cần xử lý vấn đề "đạo văn / sao chép dự án" này như thế nào để vừa mang tính giáo dục, vừa công bằng?',
    principlesApplied: [
      'Nguyên tắc gắn học tập với nghiên cứu thực chất',
      'Nguyên tắc kỷ luật tích cực: tạo cơ hội học tập từ sai lầm',
      'Nguyên tắc đánh giá vì sự tiến bộ của người học',
    ],
    solutionSteps: [
      {
        step: 1,
        title: 'Đưa ra bằng chứng đối chiếu khách quan',
        content:
          'Mời nhóm B. ở lại sau giờ học, đưa ra bản dự án gốc của khóa trước và bản dự án nhóm nộp, chỉ rõ từng đoạn văn, sơ đồ sao chép nguyên xi mà không trích dẫn nguồn.',
      },
      {
        step: 2,
        title: 'Phân tích về liêm chính học thuật (Academic Integrity)',
        content:
          'Giải thích cho học sinh hiểu: tham khảo ý tưởng người khác là tốt, nhưng sao chép nguyên xi và nhận là của mình là hành vi gian dối học thuật, đánh mất cơ hội rèn luyện tư duy thực tế của chính các em.',
      },
      {
        step: 3,
        title: 'Hủy điểm sản phẩm sao chép & Cho cơ hội làm lại',
        content:
          'Không cho điểm sản phẩm sao chép; yêu cầu nhóm tự chọn một chủ đề mới và cho thời hạn 1 tuần để tự tay thiết kế lại từ đầu, điểm số tối đa của bài làm lại sẽ bị trừ một tỷ lệ nhất định để đảm bảo công bằng.',
      },
      {
        step: 4,
        title: 'Hướng dẫn kỹ năng nghiên cứu và trích dẫn khoa học',
        content:
          'Dành 15 phút tiết học tiếp theo để hướng dẫn cả lớp cách tìm tài liệu, trích dẫn nguồn tác giả và nguyên tắc bản quyền trong thực hiện dự án học tập.',
      },
    ],
    pitfallsToAvoid: [
      'Cho điểm 0 trực tiếp rồi chấm dứt mà không giải thích hay cho cơ hội sửa chữa.',
      'Dễ dãi cho qua khiến các nhóm khác cảm thấy bất công và mất động lực tự làm.',
    ],
    coreLesson:
      'Mục tiêu của dự án học tập không phải là một mô hình hoàn hảo để trưng bày, mà là sự trưởng thành trí tuệ và phẩm chất trung thực của học sinh.',
  },
  {
    id: 16,
    title: 'Học sinh giả mạo chữ ký phụ huynh trong sổ liên lạc / đơn xin nghỉ học',
    category: 'integrity',
    categoryName: 'Trung thực & Kỷ luật học đường',
    targetGrade: 'Lớp 9 (THCS) & Lớp 10 (THPT)',
    context:
      'GVCN phát hiện một lá đơn xin phép nghỉ học 2 ngày có chữ ký của phụ huynh em L. có nét chữ nghiêng và mực giống hệt nét chữ trong bài kiểm tra của em L. Khi giáo viên gọi điện xác minh với mẹ em, phụ huynh ngỡ ngàng thông báo hai ngày đó em L. vẫn mặc đồng phục dắt xe ra khỏi nhà đi học bình thường.',
    question:
      'Học sinh giả mạo chữ ký để trốn học là hành vi dối trá hai đầu (cả nhà trường lẫn gia đình). GVCN cần phối hợp xử lý như thế nào để cắt đứt chuỗi hành vi nguy cơ này?',
    principlesApplied: [
      'Nguyên tắc phối hợp chặt chẽ giữa Nhà trường và Gia đình',
      'Nguyên tắc tôn trọng kết hợp yêu cầu nghiêm khắc',
      'Nguyên tắc tìm hiểu gốc rễ nguyên nhân tâm lý',
    ],
    solutionSteps: [
      {
        step: 1,
        title: 'Giữ kín thông tin & Hẹn gặp riêng học sinh',
        content:
          'Không bêu tên L. trước lớp; gặp riêng em vào cuối buổi, đưa tờ đơn ra và hỏi nhẹ nhàng: "Em có điều gì muốn nói thật với cô về tờ đơn này không?". Khuyến khích em tự giác thú nhận.',
      },
      {
        step: 2,
        title: 'Lắng nghe nguyên nhân học sinh trốn học 2 ngày qua',
        content:
          'Tìm hiểu xem trong 2 ngày nghỉ học em đã đi đâu, làm gì (đi chơi với ai, có bị ép buộc hay cám dỗ không). Thấu hiểu áp lực khiến em phải nói dối cha mẹ và thầy cô.',
      },
      {
        step: 3,
        title: 'Mời phụ huynh đến trường trên tinh thần xây dựng',
        content:
          'Tổ chức buổi gặp 3 bên (GVCN - Phụ huynh - Học sinh). Yêu cầu L. trực tiếp xin lỗi cha mẹ và giáo viên; phân tích cho cha mẹ hiểu nguyên nhân tâm lý để gia đình không dùng đòn roi bạo lực.',
      },
      {
        step: 4,
        title: 'Ký cam kết kiểm soát thông tin liên lạc điện tử',
        content:
          'Chuyển đổi hoàn toàn việc xin nghỉ học qua ứng dụng sổ liên lạc điện tử có xác thực mã OTP của phụ huynh để triệt tiêu việc giả mạo chữ ký giấy.',
      },
    ],
    pitfallsToAvoid: [
      'Mách bố mẹ ngay lập tức theo kiểu "xả giận" khiến học sinh bị gia đình đánh đập dã man và bỏ nhà đi.',
      'Bỏ qua xem như chuyện nhỏ vì học sinh đã đi học lại.',
    ],
    coreLesson:
      'Mỗi lời nói dối của học trò thường là bức bình phong che đậy một nỗi sợ hãi; hãy gỡ bỏ nỗi sợ đó thay vì chỉ phá hủy bức bình phong.',
  },

  // --------------------------------------------------------------------------
  // NHÓM 5: PHỐI HỢP CHA MẸ HỌC SINH & MÂU THUẪN GIA ĐÌNH (TÌNH HUỐNG 17 - 20)
  // --------------------------------------------------------------------------
  {
    id: 17,
    title: 'Phụ huynh đến trường to tiếng, chỉ trích giáo viên trù dập điểm số của con',
    category: 'parent',
    categoryName: 'Phối hợp Cha mẹ & Mâu thuẫn gia đình',
    targetGrade: 'Lớp 10 / 11 (THPT)',
    context:
      'Một phụ huynh học sinh xông vào văn phòng trường trong giờ ra chơi, đập bàn và nói lớn tiếng trước mặt nhiều giáo viên và học sinh: "Cô giáo trù dập con tôi! Con tôi đi học thêm ở trung tâm toàn được 9, 10 điểm mà bài kiểm tra trên lớp cô chỉ cho 5 điểm! Cô không có đạo đức nghề nghiệp!".',
    question:
      'Đứng trước sự giận dữ và xúc phạm công khai từ phụ huynh học sinh, người giáo viên và tập thể sư phạm cần ứng xử bình tĩnh và chuyên nghiệp như thế nào?',
    principlesApplied: [
      'Nguyên tắc kiềm chế cảm xúc và ứng xử văn hóa sư phạm',
      'Nguyên tắc làm việc dựa trên hồ sơ chứng cứ chuyên môn minh bạch',
      'Nguyên tắc phối hợp với Ban Giám hiệu và Công đoàn nhà trường',
    ],
    solutionSteps: [
      {
        step: 1,
        title: 'Chuyển không gian làm việc sang phòng riêng kín đáo',
        content:
          'Giữ thái độ nhã nhặn, không đôi co to tiếng trước mặt học sinh; mời phụ huynh vào phòng tiếp dân hoặc phòng làm việc riêng của Ban Giám hiệu, rót nước mời phụ huynh ngồi để hạ nhiệt cảm xúc.',
      },
      {
        step: 2,
        title: 'Lắng nghe trọn vẹn bức xúc của phụ huynh',
        content:
          'Để phụ huynh trình bày hết những băn khoăn mà không ngắt lời; thể hiện sự đồng cảm: "Tôi rất hiểu sự quan tâm và lo lắng của anh/chị đối với kết quả học tập của cháu".',
      },
      {
        step: 3,
        title: 'Đưa ra bài kiểm tra gốc và barem điểm chấm chi tiết',
        content:
          'Lấy bài kiểm tra gốc của học sinh cùng đáp án, barem điểm chuẩn của tổ chuyên môn. Phân tích cụ thể từng câu hỏi, chỉ rõ những lỗi sai kiến thức, thiếu bước lập luận của học sinh dẫn đến việc bị trừ điểm theo đúng quy chế.',
      },
      {
        step: 4,
        title: 'Thống nhất kế hoạch đồng hành hỗ trợ học sinh',
        content:
          'Khi phụ huynh đã hiểu và dịu xuống, đề xuất giải pháp: giáo viên sẽ hướng dẫn thêm cho em các kỹ năng làm bài tự luận chuẩn; đề nghị phụ huynh theo sát việc tự học ở nhà của con thay vì chỉ dựa vào điểm số ở trung tâm.',
      },
    ],
    pitfallsToAvoid: [
      'Cãi nhau tay đôi, thách thức phụ huynh hoặc đuổi phụ huynh ra khỏi trường.',
      'Sợ hãi nhận lỗi sai và tự ý nâng điểm vô nguyên tắc cho học sinh.',
    ],
    coreLesson:
      'Trước cơn giận dữ của phụ huynh, sự bình tĩnh, văn minh và bằng chứng chuyên môn minh bạch chính là vũ khí tự vệ mạnh mẽ nhất của người thầy.',
  },
  {
    id: 18,
    title: 'Phụ huynh phó mặc hoàn toàn việc dạy dỗ con cho nhà trường',
    category: 'parent',
    categoryName: 'Phối hợp Cha mẹ & Mâu thuẫn gia đình',
    targetGrade: 'Lớp 6 / 7 (THCS)',
    context:
      'Trong buổi họp cha mẹ học sinh đầu năm, khi GVCN trao đổi về việc em M. thường xuyên không làm bài tập về nhà và mải chơi điện thoại, bố của em đứng dậy phát biểu: "Tôi đóng tiền học đầy đủ cho nhà trường rồi, trăm sự nhờ thầy cô dạy dỗ. Vợ chồng tôi bận buôn bán từ sáng đến khuya, ở nhà nói nó không nghe, nhà trường muốn phạt sao thì phạt!".',
    question:
      'Tâm lý "khoán trắng" việc giáo dục con cho nhà trường khá phổ biến ở một bộ phận phụ huynh. GVCN cần thuyết phục và kết nối phụ huynh này như thế nào theo Luật Giáo dục 2019?',
    principlesApplied: [
      'Nguyên tắc phối hợp Nhà trường, Gia đình và Xã hội (Điều 89 Luật Giáo dục 2019)',
      'Nguyên tắc kiên trì thuyết phục và chia sẻ trách nhiệm',
      'Nguyên tắc đồng hành vì sự phát triển toàn diện của học sinh',
    ],
    solutionSteps: [
      {
        step: 1,
        title: 'Chia sẻ và thấu cảm với gánh nặng mưu sinh của cha mẹ',
        content:
          'Gặp riêng phụ huynh sau buổi họp, bày tỏ sự cảm thông chân thành với sự vất vả mưu sinh nuôi nấng con cái của gia đình; tạo niềm tin rằng giáo viên luôn sẵn sàng chia sẻ khó khăn cùng cha mẹ.',
      },
      {
        step: 2,
        title: 'Phân tích vai trò độc nhất vô nhị của tình cảm gia đình',
        content:
          'Khéo léo phân tích: Nhà trường dạy chữ, dạy người nhưng không thể thay thế được vòng tay yêu thương và sự quan tâm của cha mẹ. Đứa trẻ thiếu sự chú ý của cha mẹ sẽ dễ tìm kiếm sự công nhận ở thế giới ảo.',
      },
      {
        step: 3,
        title: 'Đưa ra các giải pháp đồng hành đơn giản, khả thi',
        content:
          'Không đòi hỏi phụ huynh phải ngồi kèm con học bài; chỉ cần cha mẹ dành ra 15 phút mỗi tối hỏi han con: "Hôm nay ở trường có gì vui không?", ký sổ báo bài và động viên con trước khi ngủ.',
      },
      {
        step: 4,
        title: 'Duy trì kênh liên lạc ngắn gọn, tích cực thường xuyên',
        content:
          'Định kỳ nhắn tin thông báo những tiến bộ nhỏ nhất của em M. cho phụ huynh biết, giúp cha mẹ cảm nhận được niềm hạnh phúc khi thấy con tiến bộ và chủ động phối hợp hơn.',
      },
    ],
    pitfallsToAvoid: [
      'Phán xét, trách móc phụ huynh là "vô trách nhiệm, chỉ biết kiếm tiền".',
      'Buông xuôi bỏ mặc học sinh vì nghĩ "bố mẹ nó còn không lo thì mình lo làm gì".',
    ],
    coreLesson:
      'Giáo dục gia đình là chiếc nôi đầu tiên định hình nhân cách; không trường học nào có thể thay thế được bữa cơm gia đình đầm ấm.',
  },
  {
    id: 19,
    title: 'Học sinh tâm sự bị bạo hành gia đình, muốn bỏ học đi làm sớm',
    category: 'parent',
    categoryName: 'Phối hợp Cha mẹ & Mâu thuẫn gia đình',
    targetGrade: 'Lớp 9 (THCS) & Lớp 10 (THPT)',
    context:
      'Em H. (học sinh nữ 15 tuổi) xin gặp riêng cô chủ nhiệm trong giờ giải lao. Em khóc nức nở và vén áo cho cô xem những vết lằn roi bầm tím trên lưng do bị người cha dượng nghiện rượu đánh đập đêm qua. H. tâm sự em không chịu nổi nữa, muốn bỏ học vào miền Nam làm công nhân thuê để thoát khỏi địa ngục gia đình.',
    question:
      'Đây là tình huống khẩn cấp liên quan đến bạo hành trẻ em và vi phạm quyền trẻ em nghiêm trọng. GVCN cần thực hiện quy trình can thiệp pháp lý và bảo vệ học sinh như thế nào?',
    principlesApplied: [
      'Nguyên tắc bảo vệ trẻ em theo Luật Trẻ em 2016 và Luật Phòng chống bạo lực gia đình',
      'Nguyên tắc ưu tiên an toàn thể chất và tinh thần của học sinh',
      'Nguyên tắc phối hợp liên ngành: Trường học - Chính quyền - Hội Phụ nữ',
    ],
    solutionSteps: [
      {
        step: 1,
        title: 'Sơ cứu vết thương, trấn an tâm lý & Thu thập bằng chứng y tế',
        content:
          'Đưa em H. xuống phòng y tế trường kiểm tra, sơ cứu vết thương; chụp ảnh lưu lại chứng cứ thương tích có sự chứng kiến của nhân viên y tế trường; tuyệt đối bảo đảm an toàn tinh thần cho em.',
      },
      {
        step: 2,
        title: 'Báo cáo Ban Giám hiệu & Kích hoạt mạng lưới bảo vệ trẻ em',
        content:
          'Báo cáo khẩn cấp với Hiệu trưởng nhà trường; gọi điện đến Tổng đài Quốc gia Bảo vệ Trẻ em 111 và liên hệ với UBND, Công an xã/phường nơi em cư trú để can thiệp bảo vệ khẩn cấp.',
      },
      {
        step: 3,
        title: 'Làm việc với mẹ ruột của học sinh và đại diện chính quyền',
        content:
          'Mời mẹ ruột em H. đến trường làm việc cùng đại diện Hội Phụ nữ và Công an địa phương; răn đe người cha dượng, có biện pháp cách ly an toàn nếu cần thiết.',
      },
      {
        step: 4,
        title: 'Vận động nguồn lực học bổng giúp em tiếp tục đến trường',
        content:
          'Nhà trường miễn giảm các khoản đóng góp, vận động học bổng hỗ trợ sinh hoạt để H. yên tâm học tập, giải thích cho em hiểu con đường học vấn là chiếc chìa khóa duy nhất giúp em tự chủ cuộc đời sau này.',
      },
    ],
    pitfallsToAvoid: [
      'Coi bạo hành gia đình là "chuyện nội bộ nhà người ta, giáo viên không can thiệp được".',
      'Khuyên học sinh cam chịu tiếp tục sống trong môi trường nguy hiểm đe dọa tính mạng.',
    ],
    coreLesson:
      'Khi mái ấm gia đình biến thành nơi giông bão, trường học phải là bến đỗ an toàn và công lý che chở cho các em.',
  },
  {
    id: 20,
    title: 'Mâu thuẫn gay gắt giữa hai gia đình phụ huynh sau vụ việc học sinh xô xát',
    category: 'parent',
    categoryName: 'Phối hợp Cha mẹ & Mâu thuẫn gia đình',
    targetGrade: 'Lớp 10 / 11 (THPT)',
    context:
      'Hai nam sinh lớp 10 xô xát trong giờ thể dục khiến một em bị rách mí mắt phải khâu 3 mũi. Sau khi từ bệnh viện về, phụ huynh của học sinh bị thương kéo cả người nhà đến trường làm ầm ĩ, đòi phụ huynh học sinh kia phải bồi thường 50 triệu đồng và đe dọa gửi đơn kiện ra tòa án, hai bên phụ huynh to tiếng xúc phạm nhau ngay tại sân trường.',
    question:
      'Để giải quyết xung đột gay gắt giữa hai gia đình học sinh, Ban Giám hiệu và GVCN cần tổ chức hòa giải sư phạm theo quy trình như thế nào để giữ vững trật tự học đường?',
    principlesApplied: [
      'Nguyên tắc giải quyết tranh chấp trên tinh thần thượng tôn pháp luật và tình nghĩa sư phạm',
      'Nguyên tắc tách biệt các bên để làm nguội cảm xúc',
      'Nguyên tắc giải quyết vì lợi ích tốt nhất của hai đứa trẻ',
    ],
    solutionSteps: [
      {
        step: 1,
        title: 'Tách hai gia đình vào hai phòng riêng & Giữ gìn an ninh',
        content:
          'Bảo vệ trường học mời hai nhóm phụ huynh vào hai phòng chức năng riêng biệt để cắt đứt cuộc cãi vã; mời cán bộ công an khu vực tham gia phối hợp giữ trật tự.',
      },
      {
        step: 2,
        title: 'Làm việc riêng với từng gia đình để lắng nghe và định hướng',
        content:
          'Ban Giám hiệu và GVCN làm việc với từng bên: động viên gia đình có con bị thương, ghi nhận chi phí viện phí thực tế hợp lý; phân tích cho gia đình học sinh đánh bạn hiểu rõ trách nhiệm dân sự bồi thường và giáo dục con.',
      },
      {
        step: 3,
        title: 'Tổ chức buổi hòa giải chung có biên bản pháp lý rõ ràng',
        content:
          'Mời hai bên ngồi lại với sự chủ trì của Hiệu trưởng: gia đình học sinh vi phạm xin lỗi chân thành và thanh toán toàn bộ chi phí y tế thực tế; gia đình học sinh bị thương ký cam kết rút đơn hòa giải; hai học sinh bắt tay nhận lỗi.',
      },
      {
        step: 4,
        title: 'Thực hiện quy trình kỷ luật nội bộ và hàn gắn quan hệ học trò',
        content:
          'Hội đồng kỷ luật nhà trường xem xét hình thức kỷ luật phù hợp; GVCN theo sát hỗ trợ hai học sinh bình thường hóa quan hệ bạn bè trong lớp.',
      },
    ],
    pitfallsToAvoid: [
      'Để hai gia đình xô xát, hành hung nhau ngay trong khuôn viên trường học.',
      'Giáo viên thiên vị một bên phụ huynh quen biết làm mất tính trung lập của trọng tài sư phạm.',
    ],
    coreLesson:
      'Mâu thuẫn giữa những đứa trẻ sẽ nhanh chóng qua đi, nhưng hiềm khích giữa người lớn chỉ có thể hóa giải bằng sự công tâm, văn minh và tinh thần thượng tôn pháp luật.',
  },
];

const STEP_5_BY_CASE_ID: Record<number, { readonly title: string; readonly content: string }> = {
  1: {
    title: 'Bước 5: Đánh giá kết quả, theo dõi hỗ trợ và rút kinh nghiệm sư phạm',
    content:
      'Trong các tiết Toán tiếp theo, giáo viên gọi H. trả lời các câu hỏi vừa sức để khích lệ sự tự tin, ghi nhận sự thay đổi thái độ hợp tác của em và rút kinh nghiệm về việc phân hóa bài tập trên lớp.',
  },
  2: {
    title: 'Bước 5: Đánh giá kết quả, theo dõi hỗ trợ và rút kinh nghiệm sư phạm',
    content:
      'Định kỳ hàng tuần đối chiếu sổ chuyên cần và trao đổi với phụ huynh em K.; biểu dương em trong giờ Sinh hoạt lớp khi hoàn thành tốt nhiệm vụ kỹ thuật viên của tập thể.',
  },
  3: {
    title: 'Bước 5: Đánh giá kết quả, theo dõi hỗ trợ và rút kinh nghiệm sư phạm',
    content:
      'Theo dõi tâm lý học sinh sau khi gỡ video để tránh việc em bị bạn bè cô lập ngược lại; rút kinh nghiệm toàn trường về quy chế quản lý thiết bị di động trong giờ học.',
  },
  4: {
    title: 'Bước 5: Đánh giá kết quả, theo dõi hỗ trợ và rút kinh nghiệm sư phạm',
    content:
      'Sau 2 tuần đối thoại, GVCN dự giờ thăm lớp và thu thập phản hồi từ cả giáo viên bộ môn Tiếng Anh lẫn Ban cán sự lớp 11A để củng cố bầu không khí hợp tác bền vững.',
  },
  5: {
    title: 'Bước 5: Đánh giá kết quả, theo dõi hỗ trợ và rút kinh nghiệm sư phạm',
    content:
      'Quan sát tinh tế thái độ của T. và M. trong các hoạt động tập thể, khích lệ hai em cùng giúp nhau tiến bộ trong học tập và giữ gìn nét đẹp văn hóa học đường.',
  },
  6: {
    title: 'Bước 5: Đánh giá kết quả, theo dõi hỗ trợ và rút kinh nghiệm sư phạm',
    content:
      'Duy trì lịch gặp định kỳ hàng tuần giữa em N. với chuyên viên tư vấn tâm lý học đường và gia đình cho đến khi em vượt qua khủng hoảng cảm xúc và ổn định nhịp độ học tập.',
  },
  7: {
    title: 'Bước 5: Đánh giá kết quả, theo dõi hỗ trợ và rút kinh nghiệm sư phạm',
    content:
      'Tổ chức hoạt động giao lưu thể thao liên lớp 10A1 – 10A2 để hóa giải hoàn toàn hiềm khích giữa hai nhóm nam sinh và xây dựng tình bạn lành mạnh.',
  },
  8: {
    title: 'Bước 5: Đánh giá kết quả, theo dõi hỗ trợ và rút kinh nghiệm sư phạm',
    content:
      'Giữ thái độ chuẩn mực, công bằng với em H. như mọi học sinh khác trong lớp; đánh giá sự chuyển biến tâm lý của em qua kết quả học tập và hoạt động tập thể.',
  },
  9: {
    title: 'Bước 5: Đánh giá kết quả, theo dõi hỗ trợ và rút kinh nghiệm sư phạm',
    content:
      'Đánh giá mức độ hòa nhập của em Q. qua sự gắn kết trong nhóm học tập và nụ cười của em khi đến trường; tiếp tục bồi dưỡng dư luận tập thể nhân ái trong lớp.',
  },
  10: {
    title: 'Bước 5: Đánh giá kết quả, theo dõi hỗ trợ và rút kinh nghiệm sư phạm',
    content:
      'Theo dõi sát sao không gian mạng của lớp để ngăn chặn tái phát nhóm kín mới; ghi nhận sự tiến bộ của nhóm học sinh vi phạm qua các hoạt động lao động công ích và thiện nguyện.',
  },
  11: {
    title: 'Bước 5: Đánh giá kết quả, theo dõi hỗ trợ và rút kinh nghiệm sư phạm',
    content:
      'Phối hợp lâu dài giữa Nhà trường – Gia đình – Công an phường để giám sát hành vi của nhóm học sinh sau kỷ luật, đồng thời thu hút các em vào các câu lạc bộ thể thao võ thuật chính quy.',
  },
  12: {
    title: 'Bước 5: Đánh giá kết quả, theo dõi hỗ trợ và rút kinh nghiệm sư phạm',
    content:
      'Kiểm tra định kỳ qua kênh thông tin mật với em S. và phụ huynh để bảo đảm hành vi trấn lột đã chấm dứt triệt để; giáo dục kỹ năng quản lý tài chính và tự vệ cho học sinh đầu cấp.',
  },
  13: {
    title: 'Bước 5: Đánh giá kết quả, theo dõi hỗ trợ và rút kinh nghiệm sư phạm',
    content:
      'Đồng hành cùng em V. trong quá trình ôn tập chuẩn bị cho kỳ kiểm tra lại, ghi nhận nỗ lực tự học trung thực của em để phục hồi danh dự cá nhân.',
  },
  14: {
    title: 'Bước 5: Đánh giá kết quả, theo dõi hỗ trợ và rút kinh nghiệm sư phạm',
    content:
      'Sau khi làm sáng tỏ sự việc, tổ chức sinh hoạt lớp rút kinh nghiệm về kỹ năng bảo quản tài sản cá nhân và củng cố niềm tin, sự tôn trọng danh dự lẫn nhau giữa các thành viên.',
  },
  15: {
    title: 'Bước 5: Đánh giá kết quả, theo dõi hỗ trợ và rút kinh nghiệm sư phạm',
    content:
      'Đánh giá công tâm sản phẩm dự án làm lại của nhóm em B., biểu dương nỗ lực tự nghiên cứu của nhóm và hoàn thiện quy định hướng dẫn trích dẫn học thuật ngay từ đầu dự án.',
  },
  16: {
    title: 'Bước 5: Đánh giá kết quả, theo dõi hỗ trợ và rút kinh nghiệm sư phạm',
    content:
      'Theo dõi chuyên cần hàng ngày của em L. qua hệ thống điểm danh thông minh và khích lệ kịp thời khi em duy trì nề nếp đi học đúng giờ, trung thực với cha mẹ.',
  },
  17: {
    title: 'Bước 5: Đánh giá kết quả, theo dõi hỗ trợ và rút kinh nghiệm sư phạm',
    content:
      'Chủ động gửi thông báo kết quả tiến bộ của học sinh trong bài kiểm tra tiếp theo cho phụ huynh, củng cố mối quan hệ hợp tác tôn trọng lẫn nhau giữa gia đình và nhà trường.',
  },
  18: {
    title: 'Bước 5: Đánh giá kết quả, theo dõi hỗ trợ và rút kinh nghiệm sư phạm',
    content:
      'Đánh giá sự thay đổi của cả phụ huynh và em M. sau 1 tháng thực hiện cam kết "15 phút đồng hành mỗi tối", biểu dương sự tiến bộ của em trong kỳ họp CMHS sơ kết học kỳ.',
  },
  19: {
    title: 'Bước 5: Đánh giá kết quả, theo dõi hỗ trợ và rút kinh nghiệm sư phạm',
    content:
      'Phối hợp với cán bộ bảo trợ xã hội phường/xã kiểm tra định kỳ môi trường sống của em H., đảm bảo em được an toàn tuyệt đối và duy trì việc học tập đến khi tốt nghiệp.',
  },
  20: {
    title: 'Bước 5: Đánh giá kết quả, theo dõi hỗ trợ và rút kinh nghiệm sư phạm',
    content:
      'Theo dõi mối quan hệ giữa hai nam sinh sau hòa giải, phân công hai em cùng tham gia một đội bóng hoặc nhóm học tập để xóa bỏ hoàn toàn khoảng cách giữa hai gia đình.',
  },
};

export const PEDAGOGICAL_20_CASE_STUDIES: readonly ExtendedCaseStudy[] =
  BASE_PEDAGOGICAL_20_CASE_STUDIES.map((cs) => ({
    ...cs,
    solutionSteps:
      cs.solutionSteps.length >= 5
        ? cs.solutionSteps
        : [
            ...cs.solutionSteps,
            {
              step: 5,
              title:
                STEP_5_BY_CASE_ID[cs.id]?.title ??
                'Bước 5: Đánh giá kết quả, theo dõi hỗ trợ và rút kinh nghiệm sư phạm',
              content:
                STEP_5_BY_CASE_ID[cs.id]?.content ??
                'Theo dõi sự chuyển biến hành vi lâu dài của học sinh, phối hợp với gia đình để động viên kịp thời và đúc kết bài học kinh nghiệm sư phạm.',
            },
          ],
  }));

// ============================================================================
// 1. COMPONENT THỰC HÀNH 1 (BÀI 6.1): PHÂN TÍCH VÀ GIẢI QUYẾT 20 TÌNH HUỐNG SƯ PHẠM THỰC TẾ THEO QUY TRÌNH 5 BƯỚC
// ============================================================================

export const Lesson6_1View: FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [expandedCaseId, setExpandedCaseId] = useState<number | null>(1);
  const [reflections, setReflections] = useState<Record<number, string>>({});
  const [savedStatus, setSavedStatus] = useState<Record<number, boolean>>({});

  const filteredCases =
    selectedCategory === 'all'
      ? PEDAGOGICAL_20_CASE_STUDIES
      : PEDAGOGICAL_20_CASE_STUDIES.filter((c) => c.category === selectedCategory);

  const handleToggleCase = (id: number) => {
    setExpandedCaseId((prev) => (prev === id ? null : id));
  };

  const handleSaveReflection = (id: number) => {
    if (reflections[id]?.trim()) {
      setSavedStatus((prev) => ({ ...prev, [id]: true }));
      setTimeout(() => {
        setSavedStatus((prev) => ({ ...prev, [id]: false }));
      }, 2500);
    }
  };

  return (
    <div className="space-y-8 leading-relaxed text-[#29383D]">
      {/* 1. THANH METADATA & ĐỐI CHIẾU ĐẦU BÀI */}
      <PedagogyMetadataBar
        courseCode="EDUC2802"
        clos={['CLO4', 'CLO5']}
        textbookPages="Tr. 65–66 (Chương 3, Mục 3.3.6 — Quy trình 5 bước)"
        legalRefs={[
          'Luật Giáo dục 2019 (Điều 69, 70)',
          'Thông tư 32/2020/TT-BGDĐT (Điều 38 — Khen thưởng và kỷ luật)',
          'Tài liệu Kỷ luật tích cực (Jane Nelsen)',
        ]}
        sessionNote="Thực hành 1 · 20 Tình huống Sư phạm"
      />

      {/* ==================================================================== */}
      {/* PHẦN I: QUY TRÌNH KHOA HỌC 5 BƯỚC XỬ LÝ TÌNH HUỐNG SƯ PHẠM (MỤC 3.3.6) */}
      {/* ==================================================================== */}
      <section className="space-y-4">
        <div className="flex items-center gap-2 border-b border-[#CFDADB] pb-2 font-serif text-xl font-bold text-[#29383D]">
          <Scale className="h-5 w-5 text-[#3F6570]" />
          <h2 id="1-quy-trinh-khoa-hoc-5-buoc">
            1. Quy trình Khoa học 5 Bước Xử lý Tình huống Sư phạm (Giáo trình HCMUE tr. 65–66)
          </h2>
        </div>

        <div className="text-sm text-[#29383D]">
          Theo <strong>Mục 3.3.6 Giáo trình Giáo dục học HCMUE (tr. 65–66)</strong>, xử lí tình
          huống giáo dục không phải là phản xạ cảm tính nhất thời mà là một quy trình giải quyết vấn
          đề có phương pháp luận khoa học gồm <strong>5 bước chuẩn mực</strong>.
          <Sidenote
            number={1}
            type="pedagogy"
            title="Nguyên tắc 'Dừng 5 giây' và Tác động song hành"
          >
            Trong mọi tình huống xung đột học đường, sự điềm tĩnh của người thầy ở Bước 1 quyết định
            80% thành công của các bước tiếp theo. Tuyệt đối không đôi co tay đôi trước tập thể lớp.
          </Sidenote>
        </div>

        <NumberedProcessFlow
          title="Quy trình Khoa học 5 Bước Giải quyết Tình huống Giáo dục (Mục 3.3.6 Giáo trình HCMUE)"
          subtitle="Khung phương pháp luận bắt buộc áp dụng khi phân tích và giải quyết 20 tình huống thực hành dưới đây."
          columns={1}
          steps={[
            {
              number: 1,
              title: 'Bước 1: Nhận diện sự việc và xác định vấn đề cần giải quyết',
              badge: 'Kiềm chế cảm xúc & Bảo đảm an toàn',
              description:
                'Giữ bình tĩnh tuyệt đối, ổn định trật tự lớp học, bảo đảm an toàn thể chất và tâm lí cho học sinh; xác định đúng bản chất mâu thuẫn sư phạm cần tháo gỡ.',
            },
            {
              number: 2,
              title: 'Bước 2: Thu thập thông tin và phân tích nguyên nhân đa chiều',
              badge: 'Giải mã tâm lí & Hoàn cảnh',
              description:
                'Tìm hiểu thông tin khách quan từ nhiều phía (học sinh, bạn bè, gia đình); giải mã nguyên nhân tâm sinh lí lứa tuổi và 4 động cơ sai lệch (theo Jane Nelsen).',
            },
            {
              number: 3,
              title: 'Bước 3: Đề xuất các phương án giải quyết khả thi',
              badge: 'Đối chiếu 6 nguyên tắc giáo dục',
              description:
                'Hình dung các phương án can thiệp khác nhau dựa trên hệ thống 6 nguyên tắc hoạt động giáo dục và quy định pháp luật (Luật Giáo dục 2019, Điều lệ trường học 2020).',
            },
            {
              number: 4,
              title: 'Bước 4: Lựa chọn phương án tối ưu và tổ chức thực hiện tác động sư phạm',
              badge: 'Lắng nghe thấu cảm & Kỷ luật tích cực',
              description:
                'Lựa chọn phương án đảm bảo tính nhân văn, kín đáo, tôn trọng danh dự học sinh; tiến hành trao đổi riêng, dẫn dắt học sinh tự nhận thức và phối hợp các lực lượng giáo dục.',
            },
            {
              number: 5,
              title: 'Bước 5: Đánh giá kết quả, theo dõi hỗ trợ và rút kinh nghiệm sư phạm',
              badge: 'Đồng hành lâu dài & Phản tư nghề nghiệp',
              description:
                'Theo dõi sự chuyển biến hành vi của học sinh sau can thiệp, động viên kịp thời những tiến bộ nhỏ nhất và đúc kết bài học kinh nghiệm nghề nghiệp cho bản thân.',
            },
          ]}
        />

        <ComparativeTable
          title="Bảng Tiêu chí Rubric Đánh giá Bài tập Thực hành Xử lý Tình huống Sư phạm (EDUC2802)"
          subtitle="Tiêu chuẩn chấm điểm bài thực hành phân tích tình huống sư phạm theo chuẩn đầu ra CLO4, CLO5."
          headers={[
            'Tiêu chí đánh giá',
            'Trọng số điểm',
            'Yêu cầu cần đạt ở mức Tốt (8.5 – 10 điểm)',
          ]}
          rows={[
            [
              'Tiêu chí 1: Nhận diện vấn đề & Nguyên nhân tâm lí',
              '2.5 điểm',
              'Xác định chính xác mâu thuẫn sư phạm cốt lõi; phân tích sâu sắc nguyên nhân tâm sinh lí lứa tuổi, hoàn cảnh gia đình và động cơ hành vi của học sinh.',
            ],
            [
              'Tiêu chí 2: Vận dụng nguyên tắc & Căn cứ pháp lý',
              '2.5 điểm',
              'Chỉ rõ và phân tích đúng các nguyên tắc giáo dục (trong 6 nguyên tắc HCMUE) và điều khoản pháp lý liên quan (Luật Giáo dục 2019, Thông tư 20/2018, Thông tư 32/2020).',
            ],
            [
              'Tiêu chí 3: Giải quyết theo Quy trình 5 bước',
              '3.5 điểm',
              'Trình bày mạch lạc, khả thi và nhân văn cả 5 bước xử lí (xử lí tức thời tại lớp -> gặp riêng lắng nghe -> phối hợp lực lượng -> theo dõi hỗ trợ).',
            ],
            [
              'Tiêu chí 4: Nhận diện bẫy sai lầm & Bài học sư phạm',
              '1.5 điểm',
              'Chỉ ra được các bẫy sai lầm giáo viên dễ mắc phải và rút ra thông điệp sư phạm sâu sắc, thuyết phục.',
            ],
          ]}
        />

        <LegalReferenceBox
          documentTitle="Thông tư số 32/2020/TT-BGDĐT (Điều lệ trường THCS, THPT và trường phổ thông có nhiều cấp học)"
          article="Điều 38 (Khen thưởng và kỷ luật) & Điều 31 (Quyền của giáo viên)"
          quote="Học sinh vi phạm khuyết điểm trong quá trình học tập, rèn luyện được giáo dục hoặc xử lý kỷ luật theo các hình thức: Nhắc nhở, hỗ trợ, giúp đỡ trực tiếp để học sinh khắc phục khuyết điểm; Khiển trách, thông báo với cha mẹ học sinh nhằm phối hợp giúp đỡ học sinh khắc phục khuyết điểm; Tạm dừng học ở trường có thời hạn và thực hiện các biện pháp giáo dục khác theo quy định của Bộ Giáo dục và Đào tạo."
          pedagogicalAnalysis="Thông tư 32/2020 đã bãi bỏ hoàn toàn hình thức phê bình trước toàn trường và đuổi học 1 năm, khẳng định triết lý kỷ luật tích cực: mọi biện pháp xử lí tình huống phải hướng tới hỗ trợ học sinh nhận ra lỗi và tiến bộ, tuyệt đối không xúc phạm danh dự, nhân phẩm hay thân thể người học."
        />

        <ScholarQuote
          quote="Nghệ thuật sư phạm không phải là nghệ thuật áp đặt, mà là nghệ thuật dẫn dắt học sinh tự nhận thức ra chân lý và tự hoàn thiện nhân cách của chính mình."
          author="K.D. Ushinsky"
          historicalContext="Nhà giáo dục học kinh điển người Nga"
        />
      </section>

      {/* ==================================================================== */}
      {/* PHẦN II: NGÂN HÀNG 20 TÌNH HUỐNG SƯ PHẠM ĐIỂN HÌNH */}
      {/* ==================================================================== */}
      <section className="space-y-6">
        <div className="flex flex-col gap-2 border-b border-[#CFDADB] pb-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <Target className="h-5 w-5 text-[#3F6570]" />
            <h2
              id="2-ngan-hang-20-tinh-huong"
              className="font-serif text-xl font-bold text-[#29383D]"
            >
              2. Ngân hàng 20 Tình huống Sư phạm Thực tế & Phương án Chuẩn 5 Bước
            </h2>
          </div>
          <Badge variant="subject">Đầy đủ 20 Tình huống Thực chiến</Badge>
        </div>

        {/* Bộ lọc phân loại 5 nhóm tình huống */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setSelectedCategory('all')}
            className={`cursor-pointer rounded-lg px-3.5 py-2 text-xs font-semibold transition-all sm:text-sm ${
              selectedCategory === 'all'
                ? 'bg-[#3F6570] text-white shadow-2xs'
                : 'bg-[#E1E9EA] text-[#29383D] hover:bg-[#D7E1E2]'
            }`}
          >
            Tất cả 20 Tình huống
          </button>
          <button
            type="button"
            onClick={() => setSelectedCategory('insubordination')}
            className={`cursor-pointer rounded-lg px-3.5 py-2 text-xs font-semibold transition-all sm:text-sm ${
              selectedCategory === 'insubordination'
                ? 'bg-[#3F6570] text-white shadow-2xs'
                : 'bg-[#E1E9EA] text-[#29383D] hover:bg-[#D7E1E2]'
            }`}
          >
            Nhóm 1: Chống đối & Kỷ cương (TH 1 - 4)
          </button>
          <button
            type="button"
            onClick={() => setSelectedCategory('romance')}
            className={`cursor-pointer rounded-lg px-3.5 py-2 text-xs font-semibold transition-all sm:text-sm ${
              selectedCategory === 'romance'
                ? 'bg-[#3F6570] text-white shadow-2xs'
                : 'bg-[#E1E9EA] text-[#29383D] hover:bg-[#D7E1E2]'
            }`}
          >
            Nhóm 2: Tình bạn & Tình yêu (TH 5 - 8)
          </button>
          <button
            type="button"
            onClick={() => setSelectedCategory('bullying')}
            className={`cursor-pointer rounded-lg px-3.5 py-2 text-xs font-semibold transition-all sm:text-sm ${
              selectedCategory === 'bullying'
                ? 'bg-[#3F6570] text-white shadow-2xs'
                : 'bg-[#E1E9EA] text-[#29383D] hover:bg-[#D7E1E2]'
            }`}
          >
            Nhóm 3: Bạo lực & Bắt nạt (TH 9 - 12)
          </button>
          <button
            type="button"
            onClick={() => setSelectedCategory('integrity')}
            className={`cursor-pointer rounded-lg px-3.5 py-2 text-xs font-semibold transition-all sm:text-sm ${
              selectedCategory === 'integrity'
                ? 'bg-[#3F6570] text-white shadow-2xs'
                : 'bg-[#E1E9EA] text-[#29383D] hover:bg-[#D7E1E2]'
            }`}
          >
            Nhóm 4: Trung thực & Thi cử (TH 13 - 16)
          </button>
          <button
            type="button"
            onClick={() => setSelectedCategory('parent')}
            className={`cursor-pointer rounded-lg px-3.5 py-2 text-xs font-semibold transition-all sm:text-sm ${
              selectedCategory === 'parent'
                ? 'bg-[#3F6570] text-white shadow-2xs'
                : 'bg-[#E1E9EA] text-[#29383D] hover:bg-[#D7E1E2]'
            }`}
          >
            Nhóm 5: Phối hợp Phụ huynh (TH 17 - 20)
          </button>
        </div>

        {/* Danh sách thẻ tình huống sư phạm */}
        <div className="space-y-5">
          {filteredCases.map((cs) => {
            const isExpanded = expandedCaseId === cs.id;
            return (
              <div
                key={cs.id}
                id={`tinh-huong-${cs.id}`}
                className="pedagogy-case-card overflow-hidden rounded-2xl border border-[#CFDADB] bg-[#F7FAFA] shadow-xs transition-all hover:border-[#718C7E]"
              >
                {/* Header thanh tiêu đề có thể click mở/gập */}
                <button
                  type="button"
                  onClick={() => handleToggleCase(cs.id)}
                  className="flex w-full cursor-pointer items-center justify-between gap-4 p-5 text-left transition-colors hover:bg-[#EAF0F1]/70 sm:p-6"
                >
                  <div className="flex items-center gap-4">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#3F6570] font-serif text-sm font-bold text-white shadow-2xs">
                      {String(cs.id).padStart(2, '0')}
                    </span>
                    <div>
                      <div className="mb-1 flex items-center gap-2">
                        <span className="text-xs font-semibold text-[#3F6570] uppercase sm:text-sm">
                          {cs.categoryName}
                        </span>
                        <span className="text-xs font-medium text-[#55676B] sm:text-sm">
                          · {cs.targetGrade}
                        </span>
                      </div>
                      <h3 className="text-base leading-snug font-bold text-[#29383D] sm:text-lg">
                        {cs.title}
                      </h3>
                    </div>
                  </div>

                  <div className="flex shrink-0 items-center gap-2">
                    <span className="hidden text-sm font-medium text-[#55676B] sm:inline">
                      {isExpanded ? 'Thu gọn' : 'Xem phân tích'}
                    </span>
                    {isExpanded ? (
                      <ChevronUp className="h-5 w-5 text-[#3F6570]" />
                    ) : (
                      <ChevronDown className="h-5 w-5 text-[#55676B]" />
                    )}
                  </div>
                </button>

                {/* Nội dung chi tiết tình huống khi mở */}
                {isExpanded && (
                  <div className="space-y-5 border-t border-[#CFDADB] bg-[#EAF0F1]/50 p-5 sm:p-7">
                    {/* Bối cảnh thực tế */}
                    <div className="rounded-xl border border-[#CFDADB] bg-[#F7FAFA] p-5 text-[#29383D] shadow-2xs">
                      <div className="flex items-center gap-2 text-xs font-bold text-[#3F6570] uppercase sm:text-sm">
                        <BookOpen className="h-4 w-4" />
                        <span>Bối cảnh tình huống thực tế</span>
                      </div>
                      <p className="mt-2 text-[16px] leading-relaxed text-[#29383D] sm:text-[16.5px]">
                        {cs.context}
                      </p>
                    </div>

                    {/* Câu hỏi sư phạm */}
                    <div className="flex items-start gap-3 rounded-xl border border-[#718C7E]/40 bg-[#E8EFEB] p-4 text-[16px] leading-relaxed font-semibold text-[#29383D] sm:text-[16.5px]">
                      <HelpCircle className="mt-1 h-5 w-5 shrink-0 text-[#3F6570]" />
                      <p>{cs.question}</p>
                    </div>

                    {/* Khung phản tư cá nhân */}
                    <div className="space-y-3 rounded-xl border border-[#CFDADB] bg-[#F7FAFA] p-5">
                      <label
                        htmlFor={`reflect-${cs.id}`}
                        className="block text-sm font-bold text-[#29383D] sm:text-[15px]"
                      >
                        Phản tư cá nhân: Thầy/Cô sẽ xử lý tình huống này theo quy trình 5 bước như
                        thế nào trước khi xem phương án chuẩn?
                      </label>
                      <textarea
                        id={`reflect-${cs.id}`}
                        rows={2}
                        value={reflections[cs.id] ?? ''}
                        onChange={(e) =>
                          setReflections((prev) => ({ ...prev, [cs.id]: e.target.value }))
                        }
                        placeholder="Nhập suy nghĩ, bước can thiệp hoặc nguyên tắc của bạn..."
                        className="w-full rounded-lg border border-[#CFDADB] bg-[#EAF0F1]/60 p-3 text-sm leading-relaxed text-[#29383D] placeholder:text-[#55676B] focus:border-[#3F6570] focus:bg-[#F7FAFA] focus:outline-none sm:text-[15.5px]"
                      />
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-[#55676B] sm:text-sm">
                          {savedStatus[cs.id] ? (
                            <span className="inline-flex items-center gap-1 font-semibold text-[#4F7967]">
                              <CheckCircle2 className="h-4 w-4" /> Đã lưu phản tư thành công!
                            </span>
                          ) : (
                            'Ghi lại phản tư giúp rèn luyện năng lực giải quyết vấn đề sư phạm (CLO4, CLO5)'
                          )}
                        </span>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleSaveReflection(cs.id)}
                          className="h-8 text-xs sm:text-sm"
                        >
                          Lưu phản tư
                        </Button>
                      </div>
                    </div>

                    {/* Nguyên tắc GDH áp dụng */}
                    <div className="space-y-2">
                      <span className="text-xs font-bold tracking-wider text-[#29383D] uppercase sm:text-sm">
                        Nguyên tắc Giáo dục học vận dụng:
                      </span>
                      <div className="flex flex-wrap gap-2">
                        {cs.principlesApplied.map((p, idx) => (
                          <span
                            key={idx}
                            className="rounded-lg border border-[#718C7E]/35 bg-[#E8EFEB] px-3 py-1 text-xs font-medium text-[#29383D] sm:text-sm"
                          >
                            {p}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Phương án xử lý tối ưu 5 bước chuẩn */}
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-xs font-bold tracking-wider text-[#3F6570] uppercase sm:text-sm">
                        <CheckCircle2 className="h-4 w-4 text-[#4F7967]" />
                        <span>Phương án xử lý tối ưu theo chuẩn Sư phạm (Quy trình 5 bước):</span>
                      </div>
                      <div className="grid gap-3 sm:grid-cols-2">
                        {cs.solutionSteps.map((step) => (
                          <div
                            key={step.step}
                            className="rounded-xl border border-[#CFDADB] bg-[#F7FAFA] p-4 shadow-2xs"
                          >
                            <div className="flex items-center gap-2 text-sm font-bold text-[#29383D] sm:text-base">
                              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-[#E8EFEB] font-serif text-xs font-bold text-[#3F6570]">
                                {String(step.step).padStart(2, '0')}
                              </span>
                              <span>{step.title}</span>
                            </div>
                            <p className="mt-2 text-[15px] leading-relaxed text-[#29383D] sm:text-[15.5px]">
                              {step.content}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Bẫy sư phạm cần tránh */}
                    <div className="rounded-xl border border-[#A65D59]/35 bg-[#A65D59]/8 p-4 text-[#29383D] sm:p-5">
                      <div className="flex items-center gap-2 text-xs font-bold tracking-wider text-[#A65D59] uppercase sm:text-sm">
                        <AlertTriangle className="h-4 w-4 text-[#A65D59]" />
                        <span>Bẫy sư phạm cần tránh tuyệt đối:</span>
                      </div>
                      <ul className="mt-2 list-disc space-y-1.5 pl-5 text-sm leading-relaxed text-[#29383D] sm:text-[15.5px]">
                        {cs.pitfallsToAvoid.map((pitfall, pIdx) => (
                          <li key={pIdx}>{pitfall}</li>
                        ))}
                      </ul>
                    </div>

                    {/* Bài học sư phạm cốt lõi */}
                    <div className="rounded-xl border border-[#718C7E]/40 bg-[#E8EFEB] p-4 text-sm leading-relaxed font-medium text-[#29383D] sm:text-[16px]">
                      <span className="font-bold text-[#3F6570]">Bài học cốt lõi: </span>
                      {cs.coreLesson}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* PHẦN III: TÌNH HUỐNG TỔNG HỢP MINH HỌA TRỰC TIẾP QUA CASESTUDYBOX */}
      <section className="space-y-4">
        <div className="flex items-center gap-2 border-b border-[#CFDADB] pb-2 font-serif text-xl font-bold text-[#29383D]">
          <Compass className="h-5 w-5 text-[#3F6570]" />
          <h2 id="3-tinh-huong-mau-tong-hop">
            3. Mô hình Mẫu Trình bày Bài làm Xử lý Tình huống Sư phạm 5 Bước
          </h2>
        </div>
        <CaseStudyBox caseStudy={PEDAGOGICAL_20_CASE_STUDIES[0]!} />
      </section>
    </div>
  );
};

// ============================================================================
// DỮ LIỆU BÀI 6.2: 10 CÂU HỎI TỰ LUẬN ÔN TẬP KINH ĐIỂN VÀ BAREM ĐIỂM
// ============================================================================

export interface EssayExamQuestion {
  readonly id: number;
  readonly title: string;
  readonly points: number;
  readonly chapterOrigin: string;
  readonly clos: string;
  readonly questionText: string;
  readonly outlineSections: readonly {
    readonly sectionTitle: string;
    readonly pointsAllocation: string;
    readonly contentItems: readonly string[];
  }[];
  readonly teachingMathContext?: string;
}

export const ESSAY_EXAM_QUESTIONS: readonly EssayExamQuestion[] = [
  {
    id: 1,
    title: 'Đặc điểm lao động sư phạm & Nhân cách người thầy là công cụ chủ yếu',
    points: 2.0,
    chapterOrigin: 'Chương 1',
    clos: 'CLO 1, CLO 2',
    questionText:
      'Phân tích 5 đặc điểm của lao động sư phạm. Bằng lý luận và thực tiễn, hãy chứng minh luận điểm: "Trong hoạt động sư phạm, nhân cách của người thầy giáo là công cụ lao động chủ yếu và quan trọng nhất".',
    outlineSections: [
      {
        sectionTitle: 'Phần 1: Phân tích 5 đặc điểm của lao động sư phạm (1.0 điểm)',
        pointsAllocation: '1.0 điểm (mỗi đặc điểm 0.2đ)',
        contentItems: [
          'Mục đích lao động: Đào tạo thế hệ trẻ thành những con người phát triển toàn diện (5 phẩm chất, 10 năng lực), đáp ứng yêu cầu công nghiệp hóa, hiện đại hóa và hội nhập quốc tế.',
          'Đối tượng lao động: Con người đang trong quá trình phát triển mạnh mẽ về thể chất, tâm lý và xã hội, có tính tích cực cá nhân và cá tính độc đáo.',
          'Công cụ lao động: Nhân cách của chính người thầy, bao gồm tri thức khoa học, lý tưởng sống, thế giới quan, năng lực sư phạm, nghệ thuật ứng xử và tác phong mẫu mực.',
          'Sản phẩm lao động: Nhân cách của học sinh. Sản phẩm này có giá trị xã hội to lớn, tác động trực tiếp và lâu dài đến tương lai dân tộc.',
          'Thời gian và không gian lao động: Lao động sư phạm không bị giới hạn trong 45 phút trên bục giảng hay 8 tiếng hành chính; nó diễn ra liên tục cả ngày đêm, ở trường học, gia đình và trên không gian số.',
        ],
      },
      {
        sectionTitle:
          'Phần 2: Chứng minh nhân cách người thầy là công cụ lao động chủ yếu (1.0 điểm)',
        pointsAllocation: '1.0 điểm (mỗi luận cứ 0.25đ)',
        contentItems: [
          'Về cơ chế giáo dục: Giáo dục nhân cách diễn ra theo cơ chế lây lan cảm xúc, bắt chước và đồng nhất hóa. Học sinh nhìn vào hành vi, lời nói thực tế của người thầy để noi theo ("Thân giáo hơn khẩu giáo").',
          'Về tính chất công cụ: Khác với công cụ cơ học hay trí tuệ nhân tạo, nhân cách người thầy truyền tải ngọn lửa đam mê, niềm tin đạo đức và lý tưởng sống - điều mà máy móc không thể có.',
          'Về tính chủ động: Người thầy sử dụng vốn sống, phẩm chất và kinh nghiệm của mình để biến đổi tình huống sư phạm, biến khó khăn thành bài học nhân văn cho học trò.',
          'Dẫn chiếu danh ngôn: Dẫn chứng nhận định của K.D. Ushinsky: "Nhân cách của người thầy là sức mạnh có ảnh hưởng to lớn đối với học sinh mà không một cuốn sách giáo khoa nào, không một lời khuyên bảo nào có thể thay thế được".',
        ],
      },
    ],
    teachingMathContext:
      'Liên hệ Sư phạm Toán: Thầy cô dạy Toán không chỉ dạy công thức hay thuật toán mà bằng sự mẫu mực về tính chính xác, tư duy logic, sự kiên nhẫn khi chữa một bài toán khó, thầy cô đã rèn luyện cho học sinh đức tính trung thực và kiên trì suốt đời.',
  },
  {
    id: 2,
    title: 'Chuẩn nghề nghiệp giáo viên cơ sở GDPT (Thông tư 20/2018) & Tiêu chuẩn 2',
    points: 2.0,
    chapterOrigin: 'Chương 1',
    clos: 'CLO 2, CLO 3',
    questionText:
      'Trình bày 5 tiêu chuẩn chuẩn nghề nghiệp giáo viên cơ sở giáo dục phổ thông theo Thông tư 20/2018/TT-BGDĐT. Để đáp ứng tốt Tiêu chuẩn 2 (Phát triển chuyên môn, nghiệp vụ), sinh viên sư phạm cần rèn luyện những năng lực cốt lõi nào?',
    outlineSections: [
      {
        sectionTitle: 'Phần 1: 5 tiêu chuẩn chuẩn nghề nghiệp theo TT 20/2018 (1.0 điểm)',
        pointsAllocation: '1.0 điểm (mỗi tiêu chuẩn 0.2đ)',
        contentItems: [
          'Tiêu chuẩn 1: Phẩm chất nhà giáo (Gồm 2 tiêu chí: Đạo đức nhà giáo và Phong cách nhà giáo).',
          'Tiêu chuẩn 2: Phát triển chuyên môn, nghiệp vụ (Gồm 5 tiêu chí: Phát triển chuyên môn, Xây dựng kế hoạch dạy học, Sử dụng PPDH, Ứng dụng CNTT, Sử dụng ngoại ngữ).',
          'Tiêu chuẩn 3: Xây dựng môi trường giáo dục (Gồm 3 tiêu chí: Xây dựng văn hóa nhà trường, Môi trường an toàn phòng chống bạo lực, Thực hiện quyền dân chủ).',
          'Tiêu chuẩn 4: Phát triển mối quan hệ giữa nhà trường, gia đình và xã hội (Gồm 3 tiêu chí: Phối hợp cha mẹ học sinh, Phối hợp các lực lượng xã hội, Tổ chức các hoạt động cộng đồng).',
          'Tiêu chuẩn 5: Sử dụng ngoại ngữ hoặc tiếng dân tộc tộc, ứng dụng CNTT, khai thác và sử dụng thiết bị công nghệ trong dạy học và giáo dục (Gồm 2 tiêu chí).',
        ],
      },
      {
        sectionTitle:
          'Phần 2: Phương hướng rèn luyện Tiêu chuẩn 2 cho sinh viên sư phạm (1.0 điểm)',
        pointsAllocation: '1.0 điểm',
        contentItems: [
          'Về tri thức khoa học bộ môn: Nắm vững hệ thống kiến thức Toán học đại học (Đại số, Giải tích, Hình học) để có tầm nhìn sâu rộng khi dạy toán phổ thông CT 2018.',
          'Về năng lực sư phạm: Rèn luyện thành thạo kỹ năng thiết kế kế hoạch bài dạy (giáo án) theo định hướng phát triển năng lực (Công văn 5512/BGDĐT); làm chủ các phương pháp dạy học tích cực (Dạy học khám phá, Dạy học giải quyết vấn đề, Dạy học dự án STEM).',
          'Về công nghệ số: Khai thác thành thạo các phần mềm toán học (GeoGebra, Desmos) và ứng dụng AI hỗ trợ soạn giảng thông minh.',
          'Về tự học và nghiên cứu khoa học: Thường xuyên đọc tạp chí chuyên ngành, tham gia nghiên cứu khoa học sinh viên và thực tập sư phạm nghiêm túc.',
        ],
      },
    ],
  },
  {
    id: 3,
    title: '4 yếu tố hình thành nhân cách & Vai trò CHỦ ĐẠO của giáo dục',
    points: 2.5,
    chapterOrigin: 'Chương 2',
    clos: 'CLO 1, CLO 2',
    questionText:
      'Phân tích vai trò của 4 yếu tố (Bẩm sinh - di truyền, Môi trường, Hoạt động cá nhân, Giáo dục) đối với sự hình thành và phát triển nhân cách. Tại sao khẳng định giáo dục giữ vai trò CHỦ ĐẠO?',
    outlineSections: [
      {
        sectionTitle: 'Phần 1: Phân tích vai trò của 4 yếu tố đối với nhân cách (1.25 điểm)',
        pointsAllocation: '1.25 điểm',
        contentItems: [
          'Bẩm sinh - di truyền (Tiền đề vật chất): Cung cấp mầm mống, tư chất tự nhiên; tạo tiền đề cho sự phát triển nhưng không quyết định trước nội dung đạo đức và tài năng của nhân cách.',
          'Môi trường xã hội (Điều kiện thực tế): Hoàn cảnh sống, quan hệ gia đình, làng xóm, bạn bè định hình nội dung trải nghiệm; nhưng cá nhân không thụ động chấp nhận mà có thể cải tạo môi trường.',
          'Hoạt động cá nhân & Giao lưu (Yếu tố QUYẾT ĐỊNH TRỰC TIẾP): Nhân cách chỉ được hình thành thông qua chính hoạt động tích cực của chủ thể. Không ai có thể học thay hay rèn luyện thay cho cá nhân.',
          'Giáo dục (Yếu tố CHỦ ĐẠO): Định hướng, dẫn dắt, tổ chức môi trường và hoạt động nhằm tối ưu hóa sự phát triển nhân cách theo mục tiêu xã hội.',
        ],
      },
      {
        sectionTitle:
          'Phần 2: Chứng minh vì sao Giáo dục giữ vai trò CHỦ ĐẠO (1.25 điểm - 5 luận cứ cốt lõi)',
        pointsAllocation: '1.25 điểm (mỗi luận cứ 0.25đ)',
        contentItems: [
          '1. Giáo dục vạch ra phương hướng phát triển nhân cách theo mục tiêu lý tưởng của xã hội (5 phẩm chất, 10 năng lực theo CT 2018).',
          '2. Giáo dục đi trước sự phát triển, định hướng và kéo theo sự phát triển (Khái niệm "Vùng phát triển gần nhất" - L.S. Vygotsky).',
          '3. Giáo dục có thể bù đắp, uốn nắn những khiếm khuyết do di truyền hoặc tật nguyền gây ra (Ví dụ giáo dục đặc biệt cho trẻ khuyết tật).',
          '4. Giáo dục có khả năng "thanh lọc", hạn chế những tác động tiêu cực, độc hại từ môi trường tự phát (mạng xã hội độc hại, tệ nạn).',
          '5. Giáo dục khơi dậy và phát huy tính tự giác, tự giáo dục của mỗi cá nhân - đỉnh cao của sự phát triển nhân cách.',
        ],
      },
    ],
  },
  {
    id: 4,
    title: '3 chức năng xã hội của giáo dục & Sứ mệnh đổi mới GD hiện nay',
    points: 2.0,
    chapterOrigin: 'Chương 2',
    clos: 'CLO 1, CLO 2',
    questionText:
      'Phân tích 3 chức năng xã hội cơ bản của giáo dục (Kinh tế - sản xuất, Chính trị - xã hội, Tư tưởng - văn hóa). Hãy liên hệ với chủ trương: "Đổi mới căn bản, toàn diện giáo dục và đào tạo" theo tinh thần Nghị quyết 29-NQ/TW của Đảng.',
    outlineSections: [
      {
        sectionTitle: 'Phần 1: 3 chức năng xã hội cơ bản của giáo dục (1.2 điểm)',
        pointsAllocation: '1.2 điểm (mỗi chức năng 0.4đ)',
        contentItems: [
          'Chức năng Kinh tế - sản xuất: Tái sản xuất sức lao động xã hội, nâng cao năng suất lao động, đào tạo nguồn nhân lực chất lượng cao phục vụ trực tiếp cho tăng trưởng kinh tế và công nghiệp hóa.',
          'Chức năng Chính trị - xã hội: Tác động đến cơ cấu xã hội, củng cố thể chế chính trị, đào tạo công dân có ý thức chấp hành pháp luật, bảo đảm công bằng xã hội và ổn định chính trị.',
          'Chức năng Tư tưởng - văn hóa: Truyền bá và phát triển hệ giá trị văn hóa dân tộc, nâng cao dân trí, xây dựng lối sống văn minh, gạn đục khơi trong tinh hoa văn hóa nhân loại.',
        ],
      },
      {
        sectionTitle: 'Phần 2: Liên hệ với Nghị quyết 29-NQ/TW về Đổi mới GD (0.8 điểm)',
        pointsAllocation: '0.8 điểm',
        contentItems: [
          'Đổi mới mục tiêu: Chuyển mạnh từ trang bị kiến thức rời rạc sang phát triển toàn diện phẩm chất và năng lực người học.',
          'Đổi mới phương pháp: Lấy học sinh làm trung tâm, học đi đôi với hành, phát triển tư duy sáng tạo.',
          'Khẳng định tầm nhìn: "Giáo dục và đào tạo là quốc sách hàng đầu, là động lực then chốt để phát triển đất nước bền vững".',
        ],
      },
    ],
  },
  {
    id: 5,
    title: '3 nguyên lý giáo dục (Điều 5 Luật GD 2019) & Dạy học môn Toán',
    points: 2.0,
    chapterOrigin: 'Chương 2',
    clos: 'CLO 1, CLO 3',
    questionText:
      'Phân tích 3 nguyên lý giáo dục được quy định tại Điều 5 Luật Giáo dục 2019. Lấy ví dụ minh họa việc thực hiện nguyên lý: "Học đi đôi với hành, lý luận gắn liền với thực tiễn" trong dạy học môn Toán.',
    outlineSections: [
      {
        sectionTitle: 'Phần 1: 3 nguyên lý giáo dục theo Điều 5 Luật Giáo dục 2019 (1.0 điểm)',
        pointsAllocation: '1.0 điểm',
        contentItems: [
          'Nguyên lý 1: Học đi đôi với hành, lý luận gắn liền với thực tiễn.',
          'Nguyên lý 2: Giáo dục nhà trường kết hợp với giáo dục gia đình và giáo dục xã hội.',
          'Nguyên lý 3: Hoạt động giáo dục thực hiện theo nguyên tắc dân chủ, công bằng, bảo đảm môi trường giáo dục an toàn, thân thiện.',
        ],
      },
      {
        sectionTitle: 'Phần 2: Ví dụ minh họa nguyên lý trong dạy học Toán (1.0 điểm)',
        pointsAllocation: '1.0 điểm',
        contentItems: [
          'Về bản chất: Toán học không phải là các ký hiệu trừu tượng xa rời đời sống mà bắt nguồn từ thực tiễn và quay trở lại phục vụ thực tiễn.',
          'Ví dụ thực tiễn: Khi dạy bài "Đạo hàm và Ứng dụng" (Toán 12), giáo viên không chỉ dạy công thức tính đạo hàm mà tổ chức cho học sinh giải bài toán tối ưu hóa kinh tế: Tìm kích thước lon nước ngọt dạng hình trụ để tốn ít nguyên liệu vỏ nhôm nhất với dung tích cho trước 330ml.',
          'Tác dụng giáo dục: Học sinh thấy được vẻ đẹp hữu ích của Toán học, kích thích hứng thú học tập và rèn luyện năng lực mô hình hóa toán học.',
        ],
      },
    ],
  },
  {
    id: 6,
    title: 'Hệ thống 6 nguyên tắc giáo dục & Phân tích sâu nguyên tắc số 4',
    points: 2.5,
    chapterOrigin: 'Chương 3',
    clos: 'CLO 1, CLO 2',
    questionText:
      'Trình bày hệ thống 6 nguyên tắc giáo dục học sinh phổ thông. Phân tích sâu nguyên tắc: "Tôn trọng nhân cách kết hợp với yêu cầu hợp lý đối với học sinh". Những sai lầm giáo viên cần tránh khi vận dụng nguyên tắc này?',
    outlineSections: [
      {
        sectionTitle: 'Phần 1: Khái quát hệ thống 6 nguyên tắc giáo dục (1.0 điểm)',
        pointsAllocation: '1.0 điểm',
        contentItems: [
          '1. Nguyên tắc đảm bảo tính mục đích của giáo dục.',
          '2. Nguyên tắc giáo dục gắn liền với đời sống, thực tiễn và lao động.',
          '3. Nguyên tắc giáo dục trong tập thể và bằng tập thể.',
          '4. Nguyên tắc tôn trọng nhân cách kết hợp với yêu cầu cao đối với học sinh.',
          '5. Nguyên tắc kết hợp phù hợp đặc điểm lứa tuổi và cá biệt hóa giáo dục.',
          '6. Nguyên tắc đảm bảo tính hệ thống, kế thừa và liên tục trong giáo dục.',
        ],
      },
      {
        sectionTitle: 'Phần 2: Phân tích sâu nguyên tắc số 4 & Sai lầm cần tránh (1.5 điểm)',
        pointsAllocation: '1.5 điểm',
        contentItems: [
          'Cơ sở khoa học: Tôn trọng nhân cách tạo điểm tựa niềm tin và lòng tự trọng; yêu cầu cao tạo động lực phấn đấu. Luận điểm Makarenko: "Càng yêu cầu cao bao nhiêu thì càng phải tôn trọng bấy nhiêu".',
          'Biểu hiện của sự tôn trọng: Lắng nghe, tin tưởng, bảo vệ danh dự, không xúc phạm thân thể và tinh thần học sinh.',
          'Biểu hiện của yêu cầu cao: Yêu cầu phải rõ ràng, công bằng, kiên quyết và nhất quán, phù hợp với năng lực thực tế.',
          'Sai lầm cực đoan 1 (Dễ dãi, buông lỏng): Nuông chiều, xuê xoa trước các sai phạm dưới danh nghĩa "dạy học thân thiện", làm suy sụp kỷ cương.',
          'Sai lầm cực đoan 2 (Hà khắc, độc đoán): Đưa ra yêu cầu quá cao, dùng đòn roi, lời lẽ thóa mạ bêu riếu học sinh trước đám đông.',
        ],
      },
    ],
  },
  {
    id: 7,
    title: '4 chức năng nòng cốt & Quyền hạn của GVCN (Thông tư 32/2020)',
    points: 2.0,
    chapterOrigin: 'Chương 4',
    clos: 'CLO 2, CLO 3',
    questionText:
      'Phân tích 4 chức năng nòng cốt của giáo viên chủ nhiệm lớp ở trường phổ thông. Trình bày các quyền hạn đặc thù của người GVCN theo quy định tại Điều 29 Điều lệ trường trung học (Thông tư 32/2020/TT-BGDĐT).',
    outlineSections: [
      {
        sectionTitle: 'Phần 1: 4 chức năng nòng cốt của GVCN (1.2 điểm)',
        pointsAllocation: '1.2 điểm (mỗi chức năng 0.3đ)',
        contentItems: [
          '1. Nhà quản lý vi mô lớp học: Lập kế hoạch, tổ chức, điều khiển và giám sát mọi hoạt động học tập, rèn luyện của tập thể lớp.',
          '2. Nhà giáo dục và phát triển nhân cách: Cố vấn, định hướng giá trị đạo đức, lối sống, tư vấn tâm lý học đường cho từng cá nhân học sinh.',
          '3. Hạt nhân kết nối các lực lượng giáo dục: Làm cầu nối phối hợp giữa GV bộ môn - Nhà trường - Ban đại diện Cha mẹ học sinh - Đoàn/Đội.',
          '4. Người bảo vệ quyền lợi hợp pháp của học sinh: Đại diện tiếng nói chính đáng của học sinh trước Ban Giám hiệu và xã hội.',
        ],
      },
      {
        sectionTitle: 'Phần 2: Quyền hạn đặc thù của GVCN theo Điều 29 TT 32/2020 (0.8 điểm)',
        pointsAllocation: '0.8 điểm',
        contentItems: [
          'Được dự các giờ học, hoạt động giáo dục khác của học sinh lớp mình chủ nhiệm.',
          'Được dự các cuộc họp của hội đồng thi đua khen thưởng và hội đồng kỷ luật khi xem xét các vấn đề liên quan đến học sinh lớp mình.',
          'Được quyền cho phép cá nhân học sinh nghỉ học có lý do không quá 03 ngày liên tục.',
          'Được giảm định mức tiết dạy theo quy định của Bộ GD&ĐT (được giảm 4 tiết/tuần đối với THCS và THPT).',
        ],
      },
    ],
  },
  {
    id: 8,
    title: 'So sánh Trừng phạt vs Kỷ luật tích cực & 4 động cơ tiềm ẩn của Jane Nelsen',
    points: 2.0,
    chapterOrigin: 'Chương 4',
    clos: 'CLO 1, CLO 2',
    questionText:
      'Lập bảng so sánh sự khác nhau giữa Biện pháp trừng phạt truyền thống và Phương pháp Kỷ luật tích cực. Phân tích 4 động cơ tiềm ẩn đằng sau hành vi tiêu cực của học sinh theo lý thuyết của Jane Nelsen.',
    outlineSections: [
      {
        sectionTitle: 'Phần 1: So sánh Trừng phạt vs Kỷ luật tích cực (1.0 điểm)',
        pointsAllocation: '1.0 điểm (mỗi tiêu chí 0.2đ)',
        contentItems: [
          'Mục tiêu: Trừng phạt hướng vào sự phục tùng sợ hãi tức thì; Kỷ luật tích cực hướng vào sự tự giác nhận thức và học kỹ năng sống lâu dài.',
          'Trọng tâm: Trừng phạt tập trung vào lỗi lầm quá khứ và ai phải trả giá; Kỷ luật tích cực tập trung vào hiện tại và tìm giải pháp sửa chữa.',
          'Cảm xúc tạo ra: Trừng phạt tạo ra oán giận, phục thù, lén lút dối trá; Kỷ luật tích cực tạo ra sự tôn trọng, thấu hiểu và tin cậy.',
          'Hậu quả lâu dài: Trừng phạt làm xói mòn lòng tự trọng; Kỷ luật tích cực xây dựng lòng tự trọng và tinh thần trách nhiệm.',
          'Vai trò của giáo viên: Trừng phạt đóng vai thẩm phán phán xét; Kỷ luật tích cực đóng vai người đồng hành hướng dẫn.',
        ],
      },
      {
        sectionTitle: 'Phần 2: 4 động cơ tiềm ẩn theo Jane Nelsen (1.0 điểm)',
        pointsAllocation: '1.0 điểm (mỗi động cơ 0.25đ)',
        contentItems: [
          '1. Gây sự chú ý không chính đáng (Undue Attention): Học sinh tin rằng mình chỉ thuộc về tập thể khi được mọi người để mắt đến. Ứng xử GV: Không phản ứng khiêu khích, chú ý tích cực lúc em làm việc tốt.',
          '2. Tranh giành quyền lực (Misguided Power): Học sinh tin rằng mình chỉ có giá trị khi làm chủ tình hình, không ai ép được mình. Ứng xử GV: Không đôi co đối đầu tay đôi, trao cho em quyền tự quản có giới hạn.',
          '3. Trả đũa / Trả thù (Revenge): Học sinh bị tổn thương nên muốn làm tổn thương người khác để thỏa mãn. Ứng xử GV: Thấu cảm nỗi đau ẩn giấu, xây dựng lại niềm tin yêu thương.',
          '4. Tỏ ra bất lực / Buông xuôi (Assumed Inadequacy): Học sinh tin rằng mình dốt nát, vô dụng nên bỏ mặc. Ứng xử GV: Chia nhỏ nhiệm vụ, khuyến khích từng bước tiến bộ nhỏ.',
        ],
      },
    ],
  },
  {
    id: 9,
    title: 'Bản chất, mục tiêu & 4 mạch nội dung của Hoạt động trải nghiệm (CT 2018)',
    points: 2.0,
    chapterOrigin: 'Chương 5',
    clos: 'CLO 1, CLO 2',
    questionText:
      'Trình bày bản chất, mục tiêu và 4 mạch nội dung xuyên suốt của Hoạt động trải nghiệm, Hoạt động trải nghiệm hướng nghiệp theo Chương trình GDPT 2018. Hoạt động này có thời lượng bắt buộc bao nhiêu tiết/năm học?',
    outlineSections: [
      {
        sectionTitle: 'Phần 1: Bản chất, mục tiêu và thời lượng bắt buộc (0.8 điểm)',
        pointsAllocation: '0.8 điểm',
        contentItems: [
          'Bản chất: Là hoạt động giáo dục BẮT BUỘC trong chương trình, trong đó học sinh dựa trên sự huy động tổng hợp kiến thức, kỹ năng từ nhiều môn học để trực tiếp trải nghiệm, phản tư và kiến tạo kinh nghiệm mới.',
          'Mục tiêu tổng quát: Hình thành và phát triển ở học sinh các năng lực thích ứng với cuộc sống, năng lực thiết kế và tổ chức hoạt động, năng lực định hướng nghề nghiệp.',
          'Thời lượng bắt buộc: 105 tiết/năm học xuyên suốt từ lớp 1 đến lớp 12 (trung bình 3 tiết/tuần).',
        ],
      },
      {
        sectionTitle: 'Phần 2: 4 mạch nội dung xuyên suốt (1.2 điểm)',
        pointsAllocation: '1.2 điểm (mỗi mạch 0.3đ)',
        contentItems: [
          '1. Hoạt động hướng vào bản thân: Khám phá, rèn luyện phẩm chất, hình thành thói quen tích cực, rèn luyện tư duy và điều chỉnh cảm xúc cá nhân.',
          '2. Hoạt động hướng đến xã hội: Xây dựng tình bạn đẹp, phòng chống bạo lực, xây dựng gia đình hạnh phúc, tham gia thiện nguyện và hoạt động vì cộng đồng.',
          '3. Hoạt động hướng đến tự nhiên: Tìm hiểu cảnh quan thiên nhiên, bảo vệ môi trường, thích ứng với biến đổi khí hậu.',
          '4. Hoạt động hướng nghiệp: Tìm hiểu thế giới nghề nghiệp, rèn luyện phẩm chất người lao động, xây dựng kế hoạch học tập và chọn ngành nghề phù hợp.',
        ],
      },
    ],
  },
  {
    id: 10,
    title: 'Quy trình 6 bước thiết kế chủ đề HĐTN & Tiến trình 4 bước tổ chức',
    points: 2.5,
    chapterOrigin: 'Chương 5',
    clos: 'CLO 1, CLO 3',
    questionText:
      'Trình bày quy trình khoa học 6 bước thiết kế kế hoạch giáo dục chủ đề Hoạt động trải nghiệm theo chuẩn HCMUE. Trình bày tiến trình 4 bước tổ chức một hoạt động trải nghiệm cụ thể trong tiết sinh hoạt lớp.',
    outlineSections: [
      {
        sectionTitle: 'Phần 1: Quy trình 6 bước thiết kế kế hoạch chủ đề HĐTN (1.25 điểm)',
        pointsAllocation: '1.25 điểm',
        contentItems: [
          'Bước 1: Xác định tên chủ đề, căn cứ pháp lý và đối tượng tham gia.',
          'Bước 2: Xác định mục tiêu chủ đề (gồm Yêu cầu cần đạt về Phẩm chất và Năng lực).',
          'Bước 3: Chuẩn bị điều kiện thực hiện (phương tiện, thiết bị, địa điểm, phân công học sinh).',
          'Bước 4: Thiết kế chuỗi các hoạt động cụ thể (mỗi hoạt động có mục tiêu, nội dung, sản phẩm, cách thức tổ chức).',
          'Bước 5: Thiết kế công cụ đánh giá (bảng tiêu chí Rubric, bảng kiểm kiểm tra sản phẩm).',
          'Bước 6: Dự kiến các phương án rủi ro và giải pháp dự phòng an toàn.',
        ],
      },
      {
        sectionTitle:
          'Phần 2: Tiến trình 4 bước tổ chức một hoạt động trải nghiệm cụ thể (1.25 điểm)',
        pointsAllocation: '1.25 điểm (mỗi bước theo chu trình Kolb)',
        contentItems: [
          'Hoạt động 1: Khởi động / Tạo tâm thế (Trải nghiệm cụ thể): Trò chơi, câu đố, video ngắn kích hoạt cảm xúc và sự chú ý của học sinh.',
          'Hoạt động 2: Khám phá / Trải nghiệm thực tế (Quan sát phản tư): Học sinh trực tiếp đóng vai, thảo luận nhóm, giải quyết tình huống để nhận diện vấn đề.',
          'Hoạt động 3: Luyện tập / Khái quát hóa (Hình thành khái niệm trừu tượng): Rút ra bài học, thông điệp, quy tắc hành vi và hệ thống hóa kiến thức kỹ năng.',
          'Hoạt động 4: Vận dụng / Mở rộng (Thử nghiệm tích cực): Cam kết hành động thực tế trong đời sống hàng ngày ở trường và ở nhà.',
        ],
      },
    ],
  },
];

// ============================================================================
// DỮ LIỆU BÀI 6.2: BỘ 20 CÂU TRẮC NGHIỆM KHÁCH QUAN ÔN TẬP CUỐI KỲ
// ============================================================================

export interface QuizQuestion {
  readonly id: number;
  readonly question: string;
  readonly options: readonly string[];
  readonly correctIndex: number;
  readonly explanation: string;
}

export const QUIZ_20_QUESTIONS: readonly QuizQuestion[] = [
  {
    id: 1,
    question:
      'Trong hoạt động sư phạm, yếu tố nào giữ vai trò là "công cụ lao động chủ yếu và quan trọng nhất"?',
    options: [
      'A. Sách giáo khoa và tài liệu tham khảo',
      'B. Nhân cách của người thầy giáo',
      'C. Phương tiện công nghệ và máy chiếu hiện đại',
      'D. Kế hoạch bài dạy (giáo án)',
    ],
    correctIndex: 1,
    explanation:
      'Theo Giáo trình HCMUE, công cụ lao động chủ yếu của người thầy chính là nhân cách của bản thân, tác động đến học sinh theo cơ chế lây lan cảm xúc và noi gương mẫu mực.',
  },
  {
    id: 2,
    question:
      'Theo Thông tư 20/2018/TT-BGDĐT, Chuẩn nghề nghiệp giáo viên cơ sở GDPT gồm bao nhiêu tiêu chuẩn và tiêu chí?',
    options: [
      'A. 4 tiêu chuẩn, 12 tiêu chí',
      'B. 5 tiêu chuẩn, 15 tiêu chí',
      'C. 6 tiêu chuẩn, 18 tiêu chí',
      'D. 5 tiêu chuẩn, 20 tiêu chí',
    ],
    correctIndex: 1,
    explanation:
      'Thông tư 20/2018/TT-BGDĐT ban hành gồm chính xác 5 tiêu chuẩn và 15 tiêu chí đánh giá mức độ nghề nghiệp.',
  },
  {
    id: 3,
    question:
      'Yếu tố nào giữ vai trò là "Tiền đề vật chất, tư chất tự nhiên" đối với sự hình thành nhân cách?',
    options: [
      'A. Bẩm sinh - di truyền',
      'B. Môi trường xã hội',
      'C. Giáo dục nhà trường',
      'D. Hoạt động cá nhân',
    ],
    correctIndex: 0,
    explanation:
      'Bẩm sinh - di truyền cung cấp mầm mống thể chất và tư chất thần kinh ban đầu, đóng vai trò là tiền đề vật chất nhưng không quyết định nội dung nhân cách.',
  },
  {
    id: 4,
    question:
      'Yếu tố nào giữ vai trò "Quyết định trực tiếp" sự hình thành và phát triển nhân cách của cá nhân?',
    options: [
      'A. Giáo dục nhà trường',
      'B. Môi trường địa phương',
      'C. Hoạt động và giao lưu cá nhân',
      'D. Gen di truyền của gia đình',
    ],
    correctIndex: 2,
    explanation:
      'Nhân cách được hình thành thông qua chính hoạt động tích cực của chủ thể. Hoạt động và giao lưu là nhân tố quyết định trực tiếp.',
  },
  {
    id: 5,
    question: 'Vì sao khẳng định Giáo dục giữ vai trò "Chủ đạo" đối với sự hình thành nhân cách?',
    options: [
      'A. Vì giáo dục có thể thay thế hoàn toàn gen di truyền',
      'B. Vì giáo dục vạch ra phương hướng, đi trước định hướng sự phát triển và bù đắp khiếm khuyết',
      'C. Vì giáo dục quyết định 100% số phận của mỗi con người',
      'D. Vì học sinh chỉ nghe lời thầy cô giáo',
    ],
    correctIndex: 1,
    explanation:
      'Giáo dục giữ vai trò chủ đạo vì nó định hướng theo mục tiêu xã hội, đi trước sự phát triển (vùng phát triển gần nhất Vygotsky) và có thể thanh lọc tác động môi trường tiêu cực.',
  },
  {
    id: 6,
    question:
      'Ba chức năng xã hội cơ bản của giáo dục được phân loại trong Giáo trình GDH gồm những chức năng nào?',
    options: [
      'A. Dạy chữ, dạy người, dạy nghề',
      'B. Kinh tế - sản xuất, Chính trị - xã hội, Tư tưởng - văn hóa',
      'C. Giáo dục đạo đức, Giáo dục trí tuệ, Giáo dục thẩm mỹ',
      'D. Nhà trường, Gia đình, Xã hội',
    ],
    correctIndex: 1,
    explanation:
      'Giáo dục học mac-xit phân loại 3 chức năng xã hội vĩ mô: Kinh tế - sản xuất; Chính trị - xã hội; Tư tưởng - văn hóa.',
  },
  {
    id: 7,
    question: 'Điều 5 Luật Giáo dục 2019 khẳng định nguyên lý giáo dục nào sau đây?',
    options: [
      'A. Thầy đọc, trò chép; thi cử nghiêm túc',
      'B. Học đi đôi với hành, lý luận gắn liền với thực tiễn, giáo dục nhà trường kết hợp gia đình và xã hội',
      'C. Ưu tiên đào tạo mũi nhọn, học sinh giỏi quốc tế',
      'D. Xã hội hóa hoàn toàn chi phí giáo dục',
    ],
    correctIndex: 1,
    explanation:
      'Điều 5 Luật Giáo dục 2019 quy định: "Học đi đôi với hành, lý luận gắn liền với thực tiễn, giáo dục nhà trường kết hợp với giáo dục gia đình và giáo dục xã hội".',
  },
  {
    id: 8,
    question: 'Nhà giáo dục A.S. Makarenko nổi tiếng với nguyên tắc và phương pháp giáo dục nào?',
    options: [
      'A. Giáo dục trong tập thể và bằng tập thể (Phương pháp tác động song hành)',
      'B. Giáo dục tự do hoàn toàn không kỷ luật',
      'C. Giáo dục bằng trừng phạt roi vọt',
      'D. Giáo dục qua màn hình máy tính',
    ],
    correctIndex: 0,
    explanation:
      'Makarenko là bậc thầy về lý luận xây dựng tập thể học sinh và phương pháp tác động song hành (vừa tác động cá nhân vừa tác động qua dư luận tập thể).',
  },
  {
    id: 9,
    question:
      'Câu nói: "Yêu cầu càng cao bao nhiêu thì càng phải tôn trọng bấy nhiêu" thể hiện nguyên tắc giáo dục nào?',
    options: [
      'A. Nguyên tắc đảm bảo tính mục đích',
      'B. Nguyên tắc tôn trọng nhân cách kết hợp với yêu cầu cao đối với học sinh',
      'C. Nguyên tắc giáo dục vừa sức',
      'D. Nguyên tắc hệ thống liên tục',
    ],
    correctIndex: 1,
    explanation:
      'Đây là luận điểm kinh điển của A.S. Makarenko thuộc nguyên tắc tôn trọng nhân cách kết hợp với yêu cầu cao đối với học sinh.',
  },
  {
    id: 10,
    question:
      'Theo Thông tư 32/2020/TT-BGDĐT, giáo viên chủ nhiệm lớp ở trường trung học được quyền cho phép học sinh nghỉ học tối đa mấy ngày liên tục?',
    options: [
      'A. Không quá 01 ngày',
      'B. Không quá 03 ngày',
      'C. Không quá 05 ngày',
      'D. Không có quyền cho nghỉ',
    ],
    correctIndex: 1,
    explanation:
      'Khoản 2 Điều 29 Điều lệ trường trung học (TT 32/2020) quy định GVCN được quyền cho phép cá nhân học sinh nghỉ học có lý do không quá 03 ngày liên tục.',
  },
  {
    id: 11,
    question:
      'Theo lý thuyết Kỷ luật tích cực của Jane Nelsen, đâu KHÔNG PHẢI là một trong 4 động cơ tiềm ẩn đằng sau hành vi tiêu cực của học sinh?',
    options: [
      'A. Thu hút sự chú ý không chính đáng',
      'B. Tranh giành quyền lực',
      'C. Bản chất bẩm sinh xấu xa từ bé',
      'D. Trả đũa / trả thù',
    ],
    correctIndex: 2,
    explanation:
      'Lý thuyết Jane Nelsen khẳng định không có đứa trẻ nào bẩm sinh xấu xa. Bốn động cơ tiềm ẩn là: Thu hút chú ý, Tranh giành quyền lực, Trả thù, Tỏ ra bất lực.',
  },
  {
    id: 12,
    question:
      'Theo Chương trình GDPT 2018, Hoạt động trải nghiệm có thời lượng bắt buộc là bao nhiêu tiết trong một năm học?',
    options: ['A. 35 tiết/năm', 'B. 70 tiết/năm', 'C. 105 tiết/năm', 'D. 140 tiết/năm'],
    correctIndex: 2,
    explanation:
      'Chương trình GDPT 2018 quy định Hoạt động trải nghiệm (tiểu học) và HĐTN hướng nghiệp (trung học) có thời lượng bắt buộc là 105 tiết/năm học.',
  },
  {
    id: 13,
    question:
      'Chu trình học tập qua trải nghiệm của nhà tâm lý học David Kolb gồm bao nhiêu giai đoạn?',
    options: [
      'A. 3 giai đoạn',
      'B. 4 giai đoạn (Trải nghiệm cụ thể -> Quan sát phản tư -> Khái quát hóa -> Thử nghiệm tích cực)',
      'C. 5 giai đoạn',
      'D. 6 giai đoạn',
    ],
    correctIndex: 1,
    explanation:
      'Chu trình Kolb nổi tiếng gồm 4 giai đoạn: Trải nghiệm cụ thể -> Quan sát phản tư -> Khái quát hóa -> Thử nghiệm tích cực.',
  },
  {
    id: 14,
    question: 'Bốn mạch nội dung của Hoạt động trải nghiệm theo CT GDPT 2018 gồm:',
    options: [
      'A. Toán, Văn, Sử, Địa',
      'B. Bản thân, Xã hội, Tự nhiên, Hướng nghiệp',
      'C. Chào cờ, Sinh hoạt lớp, Lao động, Vui chơi',
      'D. Nhận thức, Thái độ, Kỹ năng, Hành vi',
    ],
    correctIndex: 1,
    explanation:
      'Bốn mạch nội dung xuyên suốt là: Hoạt động hướng vào bản thân; Hoạt động hướng đến xã hội; Hoạt động hướng đến tự nhiên; Hoạt động hướng nghiệp.',
  },
  {
    id: 15,
    question:
      'Khi xảy ra xung đột gay gắt giữa hai học sinh trong lớp, hành động đầu tiên giáo viên cần làm là gì?',
    options: [
      'A. Tát mỗi em một cái để răn đe ngay lập tức',
      'B. Đuổi cả hai em ra khỏi trường',
      'C. Giữ bình tĩnh, tách hai học sinh ra hai vị trí an toàn để làm nguội cảm xúc',
      'D. Gọi công an phường đến bắt giữ',
    ],
    correctIndex: 2,
    explanation:
      'Nguyên tắc xử lý tình huống khẩn cấp: Tách các bên xung đột ra hai không gian độc lập để làm nguội cảm xúc kích động, sau đó mới tiến hành xác minh khách quan.',
  },
  {
    id: 16,
    question:
      'Theo Thông tư 32/2020, hình thức kỷ luật nào sau đây ĐÃ BỊ LOẠI BỎ hoàn toàn đối với học sinh phổ thông?',
    options: [
      'A. Khiển trách trước lớp',
      'B. Đuổi học 1 năm học',
      'C. Tạm dừng học tập có thời hạn',
      'D. Nhắc nhở, hỗ trợ khắc phục khuyết điểm',
    ],
    correctIndex: 1,
    explanation:
      'Thông tư 32/2020 nhân văn hóa các biện pháp kỷ luật, bãi bỏ hình thức đuổi học 1 năm mang tính trừng phạt triệt đường học tập của học sinh.',
  },
  {
    id: 17,
    question:
      'Khi học sinh thú nhận bị người thân bạo hành gia đình nghiêm trọng, trách nhiệm pháp lý đầu tiên của giáo viên là gì?',
    options: [
      'A. Giữ bí mật tuyệt đối và không nói với ai',
      'B. Khuyên học sinh nên chịu đựng để giữ hòa khí gia đình',
      'C. Báo cáo Ban Giám hiệu, liên hệ Tổng đài bảo vệ trẻ em 111 và chính quyền địa phương can thiệp khẩn cấp',
      'D. Đăng bài lên mạng xã hội để xin viện trợ',
    ],
    correctIndex: 2,
    explanation:
      'Theo Luật Trẻ em 2016, giáo viên có nghĩa vụ pháp lý phải thông báo ngay cho cơ quan có thẩm quyền hoặc Tổng đài 111 khi phát hiện trẻ em bị bạo hành.',
  },
  {
    id: 18,
    question:
      'Trong dạy học môn Toán, việc cho học sinh giải bài toán tính lượng gạch cần mua để lát nền một căn phòng thực tế phản ánh nguyên lý giáo dục nào?',
    options: [
      'A. Học đi đôi với hành, lý luận gắn liền với thực tiễn',
      'B. Tôn trọng kết hợp yêu cầu cao',
      'C. Giáo dục trong tập thể',
      'D. Tính kế thừa và liên tục',
    ],
    correctIndex: 0,
    explanation:
      'Vận dụng kiến thức diện tích hình học để giải bài toán chi phí thực tế là minh chứng sinh động của nguyên lý "Học đi đôi với hành, lý luận gắn liền với thực tiễn".',
  },
  {
    id: 19,
    question:
      'Mục tiêu chung về phẩm chất học sinh trong Chương trình GDPT 2018 gồm 5 phẩm chất chủ yếu nào?',
    options: [
      'A. Cần, kiệm, liêm, chính, chí công vô tư',
      'B. Yêu nước, Nhân ái, Chăm chỉ, Trung thực, Trách nhiệm',
      'C. Tự tin, Tự trọng, Tự lực, Tự cường, Tự giác',
      'D. Thông minh, Dũng cảm, Khéo léo, Năng động, Sáng tạo',
    ],
    correctIndex: 1,
    explanation:
      'Khung CT GDPT 2018 xác định 5 phẩm chất chủ yếu cốt lõi: Yêu nước, Nhân ái, Chăm chỉ, Trung thực, Trách nhiệm.',
  },
  {
    id: 20,
    question:
      'Điểm số trong đánh giá theo định hướng phát triển năng lực của CT GDPT 2018 có ý nghĩa cốt lõi là gì?',
    options: [
      'A. Phân loại thứ bậc học sinh cao thấp để khen thưởng và trừng phạt',
      'B. Đánh giá vì sự tiến bộ của học sinh, phản hồi để người học tự điều chỉnh cách học và giáo viên đổi mới cách dạy',
      'C. Tạo áp lực để học sinh phải đi học thêm',
      'D. Thước đo duy nhất quyết định giá trị con người',
    ],
    correctIndex: 1,
    explanation:
      'Triết lý đánh giá hiện đại (Assessment for learning): Đánh giá không phải để xếp loại trừng phạt, mà là công cụ phản hồi vì sự tiến bộ không ngừng của người học.',
  },
];

// ============================================================================
// 2. COMPONENT THỰC HÀNH 2 (BÀI 6.2): LẬP KẾ HOẠCH GIÁO DỤC LỚP CHỦ NHIỆM, THIẾT KẾ TIẾT SINH HOẠT LỚP & ĐỀ CƯƠNG ÔN TẬP
// ============================================================================

export const Lesson6_2View: FC = () => {
  const [expandedQuestionId, setExpandedQuestionId] = useState<number | null>(1);
  const [userAnswers, setUserAnswers] = useState<Record<number, number>>({});

  const caseStudy6_2: PedagogicalCaseStudy = {
    id: 602,
    title: 'Đổi mới tiết Sinh hoạt lớp từ "phiên tòa kiểm điểm" sang diễn đàn tự quản theo chủ đề',
    context:
      'Tại lớp 10A2, mỗi khi đến tiết Sinh hoạt lớp chiều thứ Sáu, không khí lớp học rất nặng nề vì giáo viên chủ nhiệm dành trọn 40 phút để đọc tên từng học sinh vi phạm nề nếp, trừ điểm thi đua và phạt chép phạt. Học sinh ngồi im chịu trận, Ban cán sự lớp chỉ làm nhiệm vụ "mách lẻo" lỗi của bạn.',
    question:
      'Vận dụng quy trình lập kế hoạch chủ nhiệm và kỹ thuật thiết kế tiết Sinh hoạt lớp tự quản (Giáo trình Giáo dục học HCMUE tr. 71–82), anh/chị hãy tái thiết kế tiết Sinh hoạt lớp này theo quy trình 5 bước.',
    principlesApplied: [
      'Chức năng cố vấn tự quản và Quy trình 6 bước lập kế hoạch chủ nhiệm (Giáo trình tr. 67–73)',
      'Loại hình Sinh hoạt lớp trong Chương trình GDPT 2018 (Giáo trình tr. 108–109)',
      'Nguyên tắc tôn trọng nhân cách học sinh và giáo dục trong tập thể',
    ],
    solutionSteps: [
      {
        step: 1,
        title: 'Bước 1: Nhận diện sự việc và xác định vấn đề cần giải quyết',
        content:
          'Tiết Sinh hoạt lớp đang bị biến tướng thành buổi kiểm điểm hành chính một chiều, làm mất chức năng tự quản của học sinh và không thực hiện được mạch nội dung giáo dục theo chủ đề.',
      },
      {
        step: 2,
        title: 'Bước 2: Thu thập thông tin và phân tích nguyên nhân theo lý luận Chương 4 & 5',
        content:
          'Theo Giáo trình HCMUE (tr. 71–77 & tr. 108–109), tiết Sinh hoạt lớp chuẩn phải gồm 2 phần cân đối: Phần 1 (15 phút) do Ban cán sự tự quản điều hành sơ kết tuần và lập kế hoạch tuần tới; Phần 2 (25–30 phút) tổ chức sinh hoạt theo chủ đề trải nghiệm hấp dẫn.',
      },
      {
        step: 3,
        title: 'Bước 3: Đề xuất các phương án giải quyết khả thi',
        content:
          'Phương án 1: Giảm thời gian phê bình xuống 25 phút, thời gian còn lại cho học sinh tự học. Phương án 2: Bồi dưỡng Ban cán sự điều hành kịch bản Sinh hoạt lớp 2 phần theo mô hình "3 khen – 1 góp ý xây dựng" kết hợp sinh hoạt chủ đề tháng.',
      },
      {
        step: 4,
        title: 'Bước 4: Lựa chọn phương án tối ưu và tổ chức thực hiện tác động sư phạm',
        content:
          'Triển khai Phương án 2: Hướng dẫn Lớp trưởng và các Tổ trưởng họp trù bị thứ Năm; trong tiết Sinh hoạt lớp, Ban cán sự tuyên dương các gương người tốt việc tốt trước, thảo luận giải pháp khắc phục hạn chế tuần qua, sau đó tổ chức hoạt động chủ đề (hái hoa dân chủ, diễn đàn nhỏ, chúc mừng sinh nhật tháng).',
      },
      {
        step: 5,
        title: 'Bước 5: Đánh giá kết quả, theo dõi hỗ trợ và rút kinh nghiệm sư phạm',
        content:
          'Sau tiết học, GVCN nhận xét ngắn gọn để khích lệ Ban cán sự và lấy phiếu phản hồi nhanh của học sinh để tiếp tục nâng cao chất lượng tiết Sinh hoạt lớp tuần tiếp theo.',
      },
    ],
    pitfallsToAvoid: [
      'GVCN độc thoại và phê bình cá nhân gay gắt suốt 45 phút tiết Sinh hoạt lớp.',
      'Giao trắng tiết Sinh hoạt lớp cho học sinh mà không hướng dẫn kịch bản trước.',
    ],
    coreLesson:
      'Tiết Sinh hoạt lớp phải là giờ học được học sinh mong đợi nhất trong tuần — nơi mỗi thành viên được lắng nghe, được ghi nhận sự tiến bộ và được rèn luyện năng lực tự quản.',
  };

  const handleToggleQuestion = (id: number) => {
    setExpandedQuestionId((prev) => (prev === id ? null : id));
  };

  const handleSelectQuizOption = (questionId: number, optionIndex: number) => {
    setUserAnswers((prev) => ({ ...prev, [questionId]: optionIndex }));
  };

  const calculateQuizScore = () => {
    let correctCount = 0;
    QUIZ_20_QUESTIONS.forEach((q) => {
      if (userAnswers[q.id] === q.correctIndex) {
        correctCount += 1;
      }
    });
    return correctCount;
  };

  return (
    <div className="space-y-8 leading-relaxed text-[#29383D]">
      {/* 1. THANH METADATA & ĐỐI CHIẾU ĐẦU BÀI */}
      <PedagogyMetadataBar
        courseCode="EDUC2802"
        clos={['CLO6', 'CLO7']}
        textbookPages="Tr. 70–82 (Chương 4 — Kế hoạch chủ nhiệm & Sinh hoạt lớp)"
        legalRefs={[
          'Thông tư 32/2020/TT-BGDĐT (Điều 29, 31)',
          'Thông tư 20/2018/TT-BGDĐT (Tiêu chuẩn 3 & 4)',
          'Đề cương chi tiết EDUC2802 (K50–51)',
        ]}
        sessionNote="Thực hành 2 & Đề cương Ôn tập Tổng hợp"
      />

      {/* ==================================================================== */}
      {/* PHẦN I: THỰC HÀNH LẬP KẾ HOẠCH CHỦ NHIỆM & THIẾT KẾ TIẾT SINH HOẠT LỚP */}
      {/* ==================================================================== */}
      <section className="space-y-4">
        <div className="flex items-center gap-2 border-b border-[#CFDADB] pb-2 font-serif text-xl font-bold text-[#29383D]">
          <FileText className="h-5 w-5 text-[#3F6570]" />
          <h2 id="1-ma-tran-de-thi">
            1. Thực hành Lập Kế hoạch Giáo dục Lớp Chủ nhiệm & Ma trận Đề thi Tự luận
          </h2>
        </div>

        <div className="text-sm text-[#29383D]">
          Bài Thực hành 2 trang bị cho sinh viên quy trình thực chiến lập{' '}
          <strong>Kế hoạch giáo dục lớp chủ nhiệm theo 6 bước</strong> (Giáo trình HCMUE tr. 71–73),
          cấu trúc kịch bản <strong>tiết Sinh hoạt lớp tự quản 45 phút</strong>, đồng thời tích hợp{' '}
          <strong>Ma trận Đề thi & Phương pháp Làm bài Tự luận Đạt Điểm Cao</strong> cho toàn học
          phần <code>EDUC2802</code>.
          <Sidenote number={1} type="pedagogy" title="Cấu trúc 2 phần của tiết Sinh hoạt lớp">
            Một kịch bản tiết Sinh hoạt lớp đạt chuẩn luôn kết hợp hài hòa giữa phần Sơ kết – Lập kế
            hoạch tuần do Ban cán sự tự quản điều hành (15 phút) và phần Sinh hoạt theo chủ đề giáo
            dục/trải nghiệm (25 phút), khép lại bằng thông điệp cố vấn của GVCN (5 phút).
          </Sidenote>
        </div>

        <NumberedProcessFlow
          title="Cấu trúc 4 Pha Thiết kế Kịch bản Tiết Sinh hoạt Lớp Tự quản (45 phút)"
          subtitle="Mô hình chuẩn áp dụng cho thực hành công tác chủ nhiệm lớp ở trường THCS và THPT."
          columns={2}
          steps={[
            {
              number: 1,
              title: 'Pha 1: Công tác chuẩn bị trước giờ Sinh hoạt lớp (Thứ Năm hàng tuần)',
              badge: 'Họp trù bị Ban cán sự',
              description:
                'GVCN họp nhanh 10 phút với Lớp trưởng, các Lớp phó, Bí thư Chi đoàn và Tổ trưởng để tổng hợp số liệu chuyên cần, học tập, rèn luyện và thống nhất kịch bản điều hành.',
            },
            {
              number: 2,
              title: 'Pha 2: Sơ kết tuần qua và thảo luận phương hướng tuần tới (15 phút đầu giờ)',
              badge: 'Học sinh tự quản điều hành',
              description:
                'Lớp trưởng điều hành: các Tổ trưởng và Lớp phó báo cáo ưu điểm nổi bật, tuyên dương cá nhân/tổ xuất sắc và góp ý khắc phục hạn chế trên tinh thần kỷ luật tích cực.',
            },
            {
              number: 3,
              title: 'Pha 3: Sinh hoạt theo chủ đề giáo dục / trải nghiệm tuần (25 phút trọng tâm)',
              badge: 'Hoạt động trải nghiệm chủ đề',
              description:
                'Tổ trực tuần hoặc BCH Chi đoàn tổ chức hoạt động theo chủ đề tháng (diễn đàn mini, xử lí tình huống đạo đức, trò chơi gắn kết tập thể, định hướng nghề nghiệp).',
            },
            {
              number: 4,
              title: 'Pha 4: Ý kiến cố vấn của GVCN và cam kết hành động (5 phút cuối giờ)',
              badge: 'Định hướng & Khích lệ',
              description:
                'GVCN tổng kết ngắn gọn, ghi nhận nỗ lực tự quản của Ban cán sự, giải đáp kiến nghị của học sinh và truyền cảm hứng cho mục tiêu tuần học mới.',
            },
          ]}
        />

        <ComparativeTable
          title="Khung Mẫu Kế hoạch Giáo dục Lớp Chủ nhiệm Năm học / Tháng (Giáo trình HCMUE tr. 71–73)"
          subtitle="Cấu trúc hồ sơ thực hành lập kế hoạch chủ nhiệm đáp ứng chuẩn đầu ra CLO6, CLO7."
          headers={[
            'Hạng mục kế hoạch',
            'Nội dung chi tiết cần trình bày trong hồ sơ',
            'Chỉ báo kiểm tra & Minh chứng',
          ]}
          rows={[
            [
              'I. Căn cứ xây dựng kế hoạch',
              'Căn cứ Kế hoạch năm học của nhà trường, Kế hoạch công tác Đoàn/Đội và đặc điểm tình hình thực tế của lớp chủ nhiệm (sĩ số, cơ cấu học lực, hạnh kiểm, hoàn cảnh đặc biệt).',
              'Bảng thống kê phân loại học sinh đầu năm và biên bản họp lớp/họp CMHS.',
            ],
            [
              'II. Mục tiêu phấn đấu của lớp',
              'Chỉ tiêu cụ thể về: (1) Rèn luyện 5 phẩm chất; (2) Kết quả học tập các môn và 10 năng lực; (3) Nề nếp chuyên cần, an toàn học đường; (4) Danh hiệu thi đua tập thể.',
              'Hệ thống chỉ tiêu định lượng và định tính khả thi, phù hợp đặc điểm lớp.',
            ],
            [
              'III. Nội dung và biện pháp trọng tâm',
              'Thiết kế biện pháp cho 4 mảng: Xây dựng tập thể tự quản; Tổ chức học tập & phụ đạo/bồi dưỡng; Tổ chức hoạt động trải nghiệm; Phối hợp GV bộ môn, Đoàn/Đội và CMHS.',
              'Bảng phân công nhiệm vụ Ban cán sự và sơ đồ mạng lưới phối hợp.',
            ],
            [
              'IV. Lịch trình hoạt động theo tháng/tuần',
              'Ma trận kế hoạch từng tháng (từ tháng 9 đến tháng 5): Chủ đề tháng -> Hoạt động trọng tâm -> Thời gian -> Lực lượng phụ trách -> Điều kiện thực hiện.',
              'Sổ chủ nhiệm, biên bản tiết Sinh hoạt lớp và sản phẩm hoạt động tháng.',
            ],
          ]}
        />

        <LegalReferenceBox
          documentTitle="Thông tư số 32/2020/TT-BGDĐT (Điều lệ trường THCS, THPT và trường phổ thông có nhiều cấp học)"
          article="Điều 29 — Nhiệm vụ lập kế hoạch giáo dục của Giáo viên chủ nhiệm"
          quote="Giáo viên chủ nhiệm có nhiệm vụ tìm hiểu và nắm vững học sinh trong lớp về mọi mặt để có biện pháp tổ chức giáo dục sát đối tượng, nhằm thúc đẩy sự tiến bộ của cả lớp và của từng học sinh; xây dựng kế hoạch các hoạt động giáo dục thể hiện rõ mục tiêu, nội dung, phương pháp giáo dục bảo đảm tính khả thi."
          pedagogicalAnalysis="Kế hoạch giáo dục của GVCN không phải là văn bản hành chính đối phó mà là bản thiết kế sư phạm toàn diện, kết nối kế hoạch năm học của nhà trường với nhu cầu phát triển thực tế của từng học sinh trong lớp."
        />

        <div className="grid gap-5 md:grid-cols-2">
          {/* Cấu trúc ma trận */}
          <div className="space-y-3 rounded-xl border border-[#CFDADB] bg-[#F7FAFA] p-5 shadow-xs sm:p-6">
            <h3 className="flex items-center gap-2 text-base font-bold tracking-wide text-[#29383D] uppercase">
              <Calendar className="h-4 w-4 text-[#3F6570]" />
              Cấu trúc Đề thi Tự luận Chuẩn (90 phút)
            </h3>
            <ul className="space-y-3 text-[16px] leading-relaxed text-[#29383D] sm:text-[16.5px]">
              <li className="flex items-start gap-2.5">
                <span className="shrink-0 font-bold text-[#3F6570]">Câu 1 (2.0 đ):</span>
                <span>
                  Lý luận giáo dục nền tảng: Hoạt động sư phạm / 3 Chức năng xã hội / Vai trò chủ
                  đạo của giáo dục (Chương 1 – 2).
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="shrink-0 font-bold text-[#3F6570]">Câu 2 (2.0 đ):</span>
                <span>
                  Văn bản pháp quy: Luật Giáo dục 2019 / Thông tư 20/2018 Chuẩn nghề nghiệp / Điều
                  lệ trường học 2020.
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="shrink-0 font-bold text-[#3F6570]">Câu 3 (2.5 đ):</span>
                <span>
                  Hệ thống 6 nguyên tắc, 3 nhóm phương pháp giáo dục & Nghiệp vụ GVCN (Chương 3 –
                  4).
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="shrink-0 font-bold text-[#3F6570]">Câu 4 (3.5 đ):</span>
                <span>
                  Tổ chức Hoạt động trải nghiệm, hướng nghiệp (Chương 5) hoặc Xử lý tình huống sư
                  phạm theo quy trình 5 bước.
                </span>
              </li>
            </ul>
          </div>

          {/* Tiêu chí vàng đạt điểm 9-10 */}
          <div className="space-y-3 rounded-xl border border-[#718C7E]/40 bg-[#E8EFEB] p-5 shadow-xs sm:p-6">
            <h3 className="flex items-center gap-2 text-base font-bold tracking-wide text-[#29383D] uppercase">
              <Sparkles className="h-4 w-4 text-[#3F6570]" />
              Tiêu chuẩn Vàng Đạt Điểm 9 – 10
            </h3>
            <ul className="space-y-3 text-[16px] leading-relaxed text-[#29383D] sm:text-[16.5px]">
              <li className="flex items-start gap-2.5">
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-[#3F6570] font-serif text-xs font-bold text-white">
                  01
                </span>
                <span>
                  <strong className="text-[#29383D]">Cấu trúc 3 phần chặt chẽ:</strong> Đặt vấn đề
                  (khái niệm), Giải quyết vấn đề (luận điểm + dẫn chứng) và Kết luận (ý nghĩa sư
                  phạm).
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-[#3F6570] font-serif text-xs font-bold text-white">
                  02
                </span>
                <span>
                  <strong className="text-[#29383D]">Trích dẫn pháp lý chính xác:</strong> Nêu rõ số
                  hiệu Thông tư (TT 20/2018, TT 32/2020, TT 22/2021), điều khoản Luật Giáo dục 2019.
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-[#3F6570] font-serif text-xs font-bold text-white">
                  03
                </span>
                <span>
                  <strong className="text-[#29383D]">Liên hệ chuyên môn Sư phạm Toán:</strong> Đưa
                  ví dụ cụ thể về dạy học Toán tích hợp, mô hình hóa và giáo dục nhân cách.
                </span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* ==================================================================== */}
      {/* PHẦN II: 10 CÂU HỎI TỰ LUẬN KINH ĐIỂN VÀ BAREM ĐIỂM CHI TIẾT */}
      {/* ==================================================================== */}
      <section className="space-y-6">
        <div className="flex flex-col gap-2 border-b border-[#CFDADB] pb-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-[#3F6570]" />
            <h2
              id="2-10-cau-hoi-tu-luan"
              className="font-serif text-xl font-bold text-[#29383D] sm:text-2xl"
            >
              2. Tuyển tập 10 Câu hỏi Tự luận Kinh điển & Barem Điểm Chi tiết
            </h2>
          </div>
          <Badge variant="subject">Barem chuẩn 10.0 Điểm</Badge>
        </div>

        <div className="essay-accordion space-y-4">
          {ESSAY_EXAM_QUESTIONS.map((q) => {
            const isExpanded = expandedQuestionId === q.id;
            return (
              <div
                key={q.id}
                id={`cau-hoi-${q.id}`}
                className="overflow-hidden rounded-2xl border border-[#CFDADB] bg-[#F7FAFA] shadow-xs transition-all hover:border-[#718C7E]"
              >
                {/* Header thanh câu hỏi */}
                <button
                  type="button"
                  onClick={() => handleToggleQuestion(q.id)}
                  className="flex w-full cursor-pointer items-center justify-between gap-4 p-5 text-left transition-colors hover:bg-[#EAF0F1]/70 sm:p-6"
                >
                  <div className="flex items-center gap-4">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#3F6570] font-serif text-sm font-bold text-white shadow-2xs">
                      C{q.id}
                    </span>
                    <div>
                      <div className="mb-1.5 flex flex-wrap items-center gap-2">
                        <span className="text-xs font-semibold tracking-wide text-[#3F6570] uppercase sm:text-sm">
                          {q.chapterOrigin}
                        </span>
                        <span className="rounded-md bg-[#E8EFEB] px-2.5 py-1 text-xs font-medium text-[#3F6570] sm:text-sm">
                          {q.points} Điểm
                        </span>
                        <span className="text-xs font-medium text-[#55676B] sm:text-sm">
                          · {q.clos}
                        </span>
                      </div>
                      <h3 className="essay-title font-serif text-lg leading-snug font-bold tracking-tight text-[#29383D] sm:text-[19px]">
                        {q.title}
                      </h3>
                    </div>
                  </div>

                  <div className="flex shrink-0 items-center gap-2">
                    <span className="hidden text-sm font-medium text-[#55676B] sm:inline">
                      {isExpanded ? 'Thu gọn' : 'Xem dàn ý & Barem'}
                    </span>
                    {isExpanded ? (
                      <ChevronUp className="h-5 w-5 text-[#3F6570]" />
                    ) : (
                      <ChevronDown className="h-5 w-5 text-[#55676B]" />
                    )}
                  </div>
                </button>

                {/* Nội dung dàn ý & Barem chi tiết */}
                {isExpanded && (
                  <div className="space-y-5 border-t border-[#CFDADB] bg-[#EAF0F1]/50 p-5 sm:p-7">
                    {/* Đề bài chi tiết */}
                    <div className="rounded-xl border border-[#CFDADB] bg-[#F7FAFA] p-5 shadow-2xs">
                      <span className="mb-2 block text-xs font-bold tracking-wider text-[#3F6570] uppercase sm:text-sm">
                        Đề bài chi tiết:
                      </span>
                      <p className="text-[16.5px] leading-relaxed font-medium text-[#29383D]">
                        {q.questionText}
                      </p>
                    </div>

                    {/* Các phần dàn ý kèm phân bổ điểm */}
                    <div className="space-y-4">
                      {q.outlineSections.map((sec, sIdx) => (
                        <div
                          key={sIdx}
                          className="space-y-3 rounded-xl border border-[#CFDADB] bg-[#F7FAFA] p-5 shadow-2xs"
                        >
                          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#CFDADB] pb-3">
                            <h4 className="text-[17px] leading-snug font-bold text-[#29383D]">
                              {sec.sectionTitle}
                            </h4>
                            <span className="rounded-full border border-[#718C7E]/40 bg-[#E8EFEB] px-3 py-1 text-xs font-semibold text-[#3F6570] sm:text-sm">
                              {sec.pointsAllocation}
                            </span>
                          </div>
                          <ul className="space-y-3">
                            {sec.contentItems.map((item, iIdx) => (
                              <li
                                key={iIdx}
                                className="essay-content-item flex items-start gap-3 text-[17.5px] leading-[1.8] text-[#29383D]"
                              >
                                <span className="mt-1 font-bold text-[#3F6570] select-none">•</span>
                                <span className="leading-[1.8]">{item}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>

                    {/* Ví dụ liên hệ Sư phạm Toán (nếu có) */}
                    {q.teachingMathContext && (
                      <div className="rounded-xl border border-[#718C7E]/40 bg-[#E8EFEB] p-4 text-[16px] leading-relaxed font-normal text-[#29383D] shadow-2xs">
                        <span className="font-bold text-[#3F6570]">
                          Gợi ý liên hệ Bộ môn Sư phạm Toán:{' '}
                        </span>
                        {q.teachingMathContext}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* ==================================================================== */}
      {/* PHẦN III: BỘ 20 CÂU TRẮC NGHIỆM KHÁCH QUAN TƯƠNG TÁC */}
      {/* ==================================================================== */}
      <section className="space-y-6">
        <div className="flex flex-col gap-2 border-b border-[#CFDADB] pb-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-[#3F6570]" />
            <h2
              id="3-trac-nghiem-on-tap"
              className="font-serif text-xl font-bold text-[#29383D] sm:text-2xl"
            >
              3. Bộ 20 Câu hỏi Trắc nghiệm Khách quan Ôn tập Cuối kỳ
            </h2>
          </div>
          <Badge variant="neutral">Tự kiểm tra Nhanh</Badge>
        </div>

        <p className="text-[16.5px] leading-[1.8] text-[#29383D] sm:text-[17px]">
          Chọn đáp án bạn cho là chính xác nhất. Hệ thống sẽ hiển thị phản hồi ngay lập tức cùng cơ
          sở lý luận trích dẫn từ Giáo trình chuẩn HCMUE và các văn bản quy phạm pháp luật:
        </p>

        {/* Danh sách 20 câu trắc nghiệm */}
        <div className="quiz-container space-y-6">
          {QUIZ_20_QUESTIONS.map((q) => {
            const selectedOpt = userAnswers[q.id];
            const isAnswered = selectedOpt !== undefined;
            const isCorrect = isAnswered && selectedOpt === q.correctIndex;

            return (
              <div
                key={q.id}
                className="quiz-card space-y-4 rounded-2xl border border-[#CFDADB] bg-[#F7FAFA] p-6 shadow-xs"
              >
                <div className="flex items-start gap-3">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-[#3F6570] font-serif text-sm font-bold text-white shadow-2xs">
                    {String(q.id).padStart(2, '0')}
                  </span>
                  <p className="quiz-question-title mb-4 text-lg leading-snug font-semibold text-[#29383D] sm:text-[19px]">
                    {q.question}
                  </p>
                </div>

                <div className="grid gap-3 pt-1 sm:grid-cols-2">
                  {q.options.map((opt, optIdx) => {
                    const isSelected = selectedOpt === optIdx;
                    let btnStyle =
                      'border-[#CFDADB] bg-[#EAF0F1]/60 text-[#29383D] hover:border-[#3F6570] hover:bg-[#E1E9EA]';

                    if (isAnswered) {
                      if (optIdx === q.correctIndex) {
                        btnStyle =
                          'border-[#4F7967] bg-[#E8EFEB] text-[#29383D] font-semibold ring-1 ring-[#4F7967]/30';
                      } else if (isSelected) {
                        btnStyle =
                          'border-[#A65D59] bg-[#A65D59]/10 text-[#29383D] ring-1 ring-[#A65D59]/30';
                      } else {
                        btnStyle = 'border-[#CFDADB]/60 bg-[#EAF0F1]/30 text-[#55676B] opacity-60';
                      }
                    }

                    return (
                      <button
                        key={optIdx}
                        type="button"
                        onClick={() => handleSelectQuizOption(q.id, optIdx)}
                        className={`quiz-option-button flex cursor-pointer items-start gap-3 rounded-xl border px-5 py-3.5 text-left text-[16px] font-normal transition-all sm:text-[16.5px] ${btnStyle}`}
                      >
                        <span className="quiz-option-letter shrink-0 text-base font-bold text-[#29383D]">
                          {String.fromCharCode(65 + optIdx)}.
                        </span>
                        <span className="leading-relaxed text-[#29383D]">{opt.substring(3)}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Khung giải thích khi đã chọn */}
                {isAnswered && (
                  <div
                    className={`quiz-explanation rounded-xl border p-4 text-[16px] leading-relaxed ${
                      isCorrect
                        ? 'border-[#4F7967]/40 bg-[#E8EFEB] text-[#29383D]'
                        : 'border-[#A65D59]/40 bg-[#A65D59]/10 text-[#29383D]'
                    }`}
                  >
                    <div className="mb-2 flex items-center gap-2 text-[16.5px] font-bold">
                      {isCorrect ? (
                        <>
                          <CheckCircle2 className="h-5 w-5 shrink-0 text-[#4F7967]" />
                          <span className="text-[#4F7967]">Chính xác!</span>
                        </>
                      ) : (
                        <>
                          <XCircle className="h-5 w-5 shrink-0 text-[#A65D59]" />
                          <span className="text-[#A65D59]">
                            Chưa chính xác! Đáp án đúng là{' '}
                            {String.fromCharCode(65 + q.correctIndex)}
                          </span>
                        </>
                      )}
                    </div>
                    <p className="text-[16px] leading-relaxed text-[#29383D]">{q.explanation}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Bảng tổng kết kết quả làm trắc nghiệm */}
        <div className="space-y-4 rounded-2xl border border-[#CFDADB] bg-[#F7FAFA] p-6 text-center shadow-xs sm:p-8">
          <h3 className="font-serif text-xl font-bold text-[#29383D] sm:text-2xl">
            Kết quả Tự kiểm tra Trắc nghiệm
          </h3>
          <p className="text-base text-[#55676B]">
            Bạn đã trả lời {Object.keys(userAnswers).length} / {QUIZ_20_QUESTIONS.length} câu hỏi.
          </p>
          <div className="flex items-baseline justify-center gap-1 font-serif text-4xl font-bold text-[#3F6570] sm:text-5xl">
            <span>{calculateQuizScore()}</span>
            <span className="font-sans text-lg font-normal text-[#55676B]">
              / {QUIZ_20_QUESTIONS.length} câu đúng
            </span>
          </div>
          <p className="text-sm font-medium text-[#55676B]">
            (Đạt {Math.round((calculateQuizScore() / QUIZ_20_QUESTIONS.length) * 100)}% yêu cầu lý
            thuyết học phần)
          </p>
        </div>
      </section>

      {/* PHẦN IV: TÌNH HUỐNG THỰC HÀNH CÔNG TÁC CHỦ NHIỆM */}
      <section className="space-y-4">
        <div className="flex items-center gap-2 border-b border-[#CFDADB] pb-2 font-serif text-xl font-bold text-[#29383D]">
          <HelpCircle className="h-5 w-5 text-[#3F6570]" />
          <h2 id="4-tinh-huong-thuc-hanh-chu-nhiem">
            4. Tình huống Thực hành Thiết kế Tiết Sinh hoạt Lớp (CLO6, CLO7)
          </h2>
        </div>
        <CaseStudyBox caseStudy={caseStudy6_2} />
      </section>
    </div>
  );
};

// ============================================================================
// 3. COMPONENT THỰC HÀNH 3 (BÀI 6.3): THIẾT KẾ KẾ HOẠCH CHỦ ĐỀ HOẠT ĐỘNG TRẢI NGHIỆM, HƯỚNG NGHIỆP (MÔ ĐUN 2 THCS & THPT)
// ============================================================================

export const Lesson6_3View: FC = () => {
  const caseStudy6_3: PedagogicalCaseStudy = {
    id: 603,
    title:
      'Điều chỉnh kế hoạch chủ đề Hoạt động trải nghiệm, hướng nghiệp khi điều kiện thực tế thay đổi',
    context:
      'Tổ giáo viên khối 10 đã thiết kế chủ đề Hoạt động trải nghiệm, hướng nghiệp tháng 3: "Tham quan và tìm hiểu quy trình sản xuất tại Khu Công nghệ cao" (thuộc phương thức Khám phá ngoài nhà trường). Tuy nhiên, sát ngày tổ chức thì thời tiết mưa bão kéo dài và doanh nghiệp thông báo tạm dừng đón đoàn khách tham quan.',
    question:
      'Vận dụng quy trình thiết kế chủ đề HĐTN, HN (Giáo trình Giáo dục học HCMUE tr. 116–124 và Tài liệu bồi dưỡng Mô đun 2 THPT), anh/chị hãy xử lí tình huống và điều chỉnh kế hoạch theo quy trình 5 bước.',
    principlesApplied: [
      'Quy trình thiết kế và điều kiện tổ chức Hoạt động trải nghiệm, hướng nghiệp (Giáo trình tr. 114–124)',
      'Linh hoạt chuyển đổi giữa 4 nhóm phương thức tổ chức HĐTN (Khám phá -> Thể nghiệm, tương tác & Nghiên cứu)',
      'Nguyên tắc đảm bảo tính mục đích và an toàn tuyệt đối cho học sinh',
    ],
    solutionSteps: [
      {
        step: 1,
        title: 'Bước 1: Nhận diện sự việc và xác định vấn đề cần giải quyết',
        content:
          'Hoạt động tham quan thực địa ngoài trường không thể diễn ra do yếu tố khách quan (thời tiết và đối tác), đòi hỏi phải kích hoạt phương án dự phòng ngay tại trường mà vẫn giữ nguyên Yêu cầu cần đạt về năng lực định hướng nghề nghiệp.',
      },
      {
        step: 2,
        title: 'Bước 2: Thu thập thông tin và phân tích nguyên nhân theo Tài liệu Mô đun 2',
        content:
          'Theo Tài liệu Mô đun 2 THPT và Giáo trình HCMUE (tr. 116–124), mục tiêu cốt lõi của chủ đề là giúp học sinh tìm hiểu yêu cầu nghề nghiệp và phẩm chất người lao động thời đại số; hình thức tham quan là phương tiện chứ không phải mục đích duy nhất.',
      },
      {
        step: 3,
        title: 'Bước 3: Đề xuất các phương án giải quyết khả thi',
        content:
          'Phương án 1: Hủy bỏ hoàn toàn chủ đề hướng nghiệp tháng 3 và cho học sinh nghỉ. Phương án 2: Chuyển đổi sang hình thức "Diễn đàn Tọa đàm Hướng nghiệp Trực tiếp kết hợp Trực tuyến (Virtual Tour)" ngay tại Hội trường nhà trường.',
      },
      {
        step: 4,
        title: 'Bước 4: Lựa chọn phương án tối ưu và tổ chức thực hiện tác động sư phạm',
        content:
          'Thực hiện Phương án 2 theo tiến trình 4 hoạt động: (1) Khởi động: Trò chơi nhận diện xu hướng nghề nghiệp 4.0; (2) Khám phá: Xem video Virtual Tour dây chuyền sản xuất và kết nối giao lưu trực tuyến 30 phút với kỹ sư của Khu Công nghệ cao; (3) Luyện tập: Các nhóm thiết kế Infographic "Hồ sơ năng lực nghề nghiệp tương lai"; (4) Vận dụng: Xây dựng kế hoạch rèn luyện môn học tổ hợp STEM cá nhân.',
      },
      {
        step: 5,
        title: 'Bước 5: Đánh giá kết quả, theo dõi hỗ trợ và rút kinh nghiệm sư phạm',
        content:
          'Đánh giá sản phẩm Infographic của các nhóm bằng Rubric và rút kinh nghiệm luôn xây dựng "Phương án B (Trong nhà trường)" khi thiết kế các chủ đề HĐTN ngoài trường.',
      },
    ],
    pitfallsToAvoid: [
      'Cố tình tổ chức đi tham quan bất chấp thời tiết mưa bão gây nguy hiểm cho học sinh.',
      'Khi hủy chuyến tham quan thì biến giờ HĐTN thành giờ tự học trống không có hoạt động thay thế.',
    ],
    coreLesson:
      'Một bản kế hoạch chủ đề Hoạt động trải nghiệm, hướng nghiệp chuyên nghiệp luôn bám chặt vào Yêu cầu cần đạt (Mục tiêu năng lực) và có phương án dự phòng linh hoạt trước mọi biến động của điều kiện thực tế.',
  };

  return (
    <div className="space-y-8 leading-relaxed text-[#29383D]">
      {/* 1. THANH METADATA & ĐỐI CHIẾU ĐẦU BÀI */}
      <PedagogyMetadataBar
        courseCode="EDUC2802"
        clos={['CLO8', 'CLO9']}
        textbookPages="Tr. 110–124 (Chương 5) · Tài liệu Mô đun 2 THCS & THPT"
        legalRefs={[
          'Thông tư 32/2018/TT-BGDĐT (CT HĐTN & HĐTN, HN)',
          '11.HDTN_tai-lieu-THCS_9.10.20.20-24h.pdf (Mô đun 2 THCS)',
          '12.HDTN_tai-lieu-THPT_9.10.20-24h.pdf (Mô đun 2 THPT)',
        ]}
        sessionNote="Thực hành 3 · Thiết kế Kế hoạch Chủ đề HĐTN, HN"
      />

      {/* PHẦN I: ĐỐI SÁNH ĐẶC THÙ THIẾT KẾ CHỦ ĐỀ HĐTN CẤP THCS VÀ CẤP THPT (MÔ ĐUN 2) */}
      <section className="space-y-4">
        <div className="flex items-center gap-2 border-b border-[#CFDADB] pb-2 font-serif text-xl font-bold text-[#29383D]">
          <Layers className="h-5 w-5 text-[#3F6570]" />
          <h2 id="1-doi-sanh-mo-dun-2-thcs-thpt">
            1. Tích hợp Tài liệu Mô đun 2: Đặc thù Thiết kế Chủ đề HĐTN, HN cấp THCS và THPT
          </h2>
        </div>

        <div className="text-sm text-[#29383D]">
          Dựa trên <strong>Giáo trình Giáo dục học HCMUE (tr. 116–124)</strong> và bộ đôi tài liệu
          bồi dưỡng giáo viên phổ thông cốt cán{' '}
          <strong>Mô đun 2 cấp THCS và cấp THPT của Bộ GD&ĐT</strong>, việc thiết kế kế hoạch chủ đề
          Hoạt động trải nghiệm, hướng nghiệp phải phản ánh rõ sự phân hóa mục tiêu giữa giai đoạn
          giáo dục cơ bản (THCS) và giai đoạn giáo dục định hướng nghề nghiệp (THPT).
          <Sidenote
            number={1}
            type="pedagogy"
            title="Điểm cốt lõi của Tài liệu Mô đun 2 THCS & THPT"
          >
            Tài liệu Mô đun 2 nhấn mạnh: Mỗi hoạt động trong chủ đề HĐTN phải thể hiện rõ chuỗi tác
            động sư phạm (Khởi động -&gt; Khám phá/Chiêm nghiệm -&gt; Rèn luyện kỹ năng -&gt; Vận
            dụng/Mở rộng) và phải chỉ rõ sản phẩm học tập cụ thể có thể quan sát, đánh giá được.
          </Sidenote>
        </div>

        <ComparativeTable
          title="Bảng Đối sánh Thiết kế Chủ đề HĐTN, HN giữa Cấp THCS và Cấp THPT (Tài liệu Mô đun 2 & Giáo trình tr. 84–124)"
          subtitle="Căn cứ để sinh viên lựa chọn đúng trọng tâm phương thức và sản phẩm khi làm bài tập Thực hành 3."
          headers={[
            'Tiêu chí đối sánh',
            'Cấp THCS (Mô đun 2 THCS — Lớp 6 đến Lớp 9)',
            'Cấp THPT (Mô đun 2 THPT — Lớp 10 đến Lớp 12)',
          ]}
          rows={[
            [
              '1. Định vị giai đoạn giáo dục',
              'Thuộc giai đoạn Giáo dục cơ bản: Tập trung khám phá bản thân ở tuổi dậy thì, rèn luyện kỹ năng giao tiếp xã hội và bước đầu tìm hiểu nghề truyền thống/địa phương.',
              'Thuộc giai đoạn Giáo dục định hướng nghề nghiệp: Tập trung phát triển bản lĩnh công dân, đánh giá sự phù hợp nghề và ra quyết định chọn ngành, chọn nghề.',
            ],
            [
              '2. Tỷ trọng 4 mạch nội dung',
              'Hướng vào bản thân (~35%), Hướng đến xã hội (~25%), Hướng đến tự nhiên (~20%), Hướng nghiệp (~20% — tăng mạnh ở lớp 8, 9 để phân luồng sau THCS).',
              'Hướng vào bản thân (~30%), Hướng đến xã hội (~25%), Hướng đến tự nhiên (~15%), Hướng nghiệp (~30% — trọng tâm xuyên suốt cả 3 khối 10, 11, 12).',
            ],
            [
              '3. Phương thức tổ chức ưu tiên',
              'Trò chơi trải nghiệm, Sân khấu tương tác, Tham quan dã ngoại, Hoạt động tình nguyện vừa sức và Dự án khám phá thực tiễn.',
              'Diễn đàn tranh biện, Hội thảo hướng nghiệp, Dự án nghiên cứu khoa học (8 bước), Thực hành trải nghiệm thực tế tại cơ sở sản xuất/trường ĐH/CĐ.',
            ],
            [
              '4. Sản phẩm đánh giá điển hình',
              'Sổ tay khám phá bản thân, kịch bản đóng vai xử lí tình huống bạn bè, sản phẩm tái chế bảo vệ môi trường, báo cáo thu hoạch tham quan.',
              'Bản kế hoạch phát triển nghề nghiệp cá nhân, hồ sơ dự án nghiên cứu thị trường lao động, sản phẩm STEM hướng nghiệp, chiến dịch truyền thông cộng đồng.',
            ],
          ]}
        />

        <LegalReferenceBox
          documentTitle="Tài liệu Bồi dưỡng Mô đun 2 THCS & THPT (Bộ GD&ĐT) & Giáo trình HCMUE (Tr. 116–124)"
          article="Quy chuẩn cấu trúc một Hoạt động thành phần trong Kế hoạch chủ đề HĐTN, HN"
          quote="Mỗi hoạt động cụ thể trong kế hoạch tổ chức chủ đề Hoạt động trải nghiệm, hướng nghiệp phải được thiết kế đầy đủ 4 thành phần: (1) Mục tiêu của hoạt động; (2) Nội dung hoạt động; (3) Sản phẩm dự kiến của học sinh; (4) Tổ chức thực hiện gồm 4 bước: Chuyển giao nhiệm vụ -> Học sinh thực hiện trải nghiệm -> Báo cáo, thảo luận và chiêm nghiệm -> Kết luận, nhận định của giáo viên."
          pedagogicalAnalysis="Việc tuân thủ cấu trúc 4 thành phần và 4 bước tổ chức thực hiện giúp giáo viên kiểm soát chặt chẽ tính khả thi trên lớp, đồng thời chuyển giao vai trò hoạt động thực sự cho học sinh."
        />
      </section>

      {/* PHẦN II: QUY TRÌNH CHUẨN & RUBRIC ĐÁNH GIÁ KẾ HOẠCH CHỦ ĐỀ HĐTN */}
      <section className="space-y-4">
        <div className="flex items-center gap-2 border-b border-[#CFDADB] pb-2 font-serif text-xl font-bold text-[#29383D]">
          <Target className="h-5 w-5 text-[#3F6570]" />
          <h2 id="2-quy-trinh-va-rubric-chu-de-hdtn">
            2. Tiến trình 4 Hoạt động Trải nghiệm & Bảng Rubric Đánh giá Thực hành 3
          </h2>
        </div>

        <NumberedProcessFlow
          title="Tiến trình 4 Hoạt động Chuẩn trong Thiết kế Chủ đề HĐTN, HN (Giáo trình HCMUE tr. 118–123)"
          subtitle="Chuỗi tiến trình sư phạm chuyển hóa từ kinh nghiệm ban đầu thành năng lực hành động bền vững."
          columns={2}
          steps={[
            {
              number: 1,
              title: 'Hoạt động 1: Khởi động — Kết nối kinh nghiệm (10 – 15% thời lượng)',
              badge: 'Tạo tâm thế & Huy động kinh nghiệm',
              description:
                'Tổ chức trò chơi, tình huống ngắn hoặc câu hỏi gợi mở để huy động vốn kinh nghiệm sẵn có của học sinh và dẫn dắt vào vấn đề trung tâm của chủ đề.',
            },
            {
              number: 2,
              title: 'Hoạt động 2: Khám phá — Chiêm nghiệm (30 – 35% thời lượng)',
              badge: 'Phản tư & Nhận thức giá trị mới',
              description:
                'Học sinh thảo luận nhóm, phân tích trường hợp điển hình, phỏng vấn hoặc quan sát thực tế để tự rút ra quy trình, khái niệm hoặc thông điệp cốt lõi.',
            },
            {
              number: 3,
              title: 'Hoạt động 3: Rèn luyện / Luyện tập kỹ năng (35 – 40% thời lượng)',
              badge: 'Thực hành giải quyết tình huống',
              description:
                'Học sinh trực tiếp đóng vai, lập kế hoạch, thực hành kỹ năng trong các tình huống giả định hoặc thực tế tại lớp để hình thành năng lực đặc thù.',
            },
            {
              number: 4,
              title: 'Hoạt động 4: Vận dụng — Mở rộng (10 – 15% thời lượng & Ngoài giờ học)',
              badge: 'Cam kết hành động thực tiễn',
              description:
                'Giao nhiệm vụ cho học sinh vận dụng kỹ năng đã học vào đời sống thực tế tại gia đình, cộng đồng và ghi nhận kết quả vào hồ sơ trải nghiệm.',
            },
          ]}
        />

        <ComparativeTable
          title="Bảng Tiêu chí Rubric Đánh giá Bài tập Thực hành 3: Thiết kế Kế hoạch Chủ đề HĐTN, HN"
          subtitle="Thang đánh giá năng lực thiết kế và tổ chức HĐTN, HN theo chuẩn đầu ra CLO8, CLO9."
          headers={['Tiêu chí đánh giá', 'Trọng số', 'Mô tả mức chất lượng Tốt (8.5 – 10 điểm)']}
          rows={[
            [
              '1. Xác định Mục tiêu chủ đề (Yêu cầu cần đạt)',
              '2.0 điểm',
              'Xác định đúng, đủ và viết bằng động từ đo lường được cho cả 3 nhóm: Năng lực đặc thù HĐTN, Năng lực chung và Phẩm chất chủ yếu.',
            ],
            [
              '2. Chuẩn bị thiết bị, học liệu của GV và HS',
              '1.5 điểm',
              'Liệt kê cụ thể, khả thi các học liệu, phiếu trải nghiệm, phương tiện kỹ thuật của GV và nhiệm vụ chuẩn bị trước ở nhà của HS.',
            ],
            [
              '3. Thiết kế chuỗi 4 Hoạt động trải nghiệm',
              '4.5 điểm',
              'Đầy đủ 4 hoạt động (Khởi động -> Khám phá -> Rèn luyện -> Vận dụng); mỗi hoạt động có đủ Mục tiêu, Nội dung, Sản phẩm và 4 bước tổ chức thực hiện.',
            ],
            [
              '4. Thiết kế Công cụ kiểm tra, đánh giá',
              '2.0 điểm',
              'Có công cụ đánh giá cụ thể (Bảng kiểm hoặc Rubric) kết hợp tự đánh giá của HS, đánh giá đồng đẳng và đánh giá của GV.',
            ],
          ]}
        />
      </section>

      {/* PHẦN III: HỒ SƠ KẾ HOẠCH CHỦ ĐỀ HĐTN, HN MẪU CHUẨN MỨC TỐT */}
      <section className="space-y-4">
        <div className="flex items-center gap-2 border-b border-[#CFDADB] pb-2 font-serif text-xl font-bold text-[#29383D]">
          <BookOpen className="h-5 w-5 text-[#3F6570]" />
          <h2 id="3-ke-hoach-chu-de-hdtn-mau">
            3. Hồ sơ Kế hoạch Chủ đề Hoạt động Trải nghiệm, Hướng nghiệp Mẫu (Chuẩn Mô đun 2)
          </h2>
        </div>

        <div className="space-y-5 rounded-2xl border border-[#CFDADB] bg-[#F7FAFA] p-6 shadow-xs">
          <div className="border-b border-[#CFDADB] pb-4">
            <div className="text-xs font-bold tracking-wider text-[#3F6570] uppercase">
              Kế hoạch Giáo dục Chủ đề Hoạt động Trải nghiệm, Hướng nghiệp · Lớp 10 (Thời lượng: 02
              tiết)
            </div>
            <h3 className="mt-1 font-serif text-xl font-bold text-[#29383D]">
              Chủ đề: Xây dựng Tình bạn Đẹp và Văn hóa Ứng xử An toàn trên Không gian Mạng
            </h3>
            <p className="mt-1 text-xs text-[#55676B]">
              Mạch nội dung: Hoạt động hướng đến xã hội (Hoạt động xây dựng nhà trường & cộng đồng)
              · Loại hình: Hoạt động giáo dục theo chủ đề
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2 rounded-xl border border-[#CFDADB] bg-[#EAF0F1]/50 p-4">
              <h4 className="text-xs font-bold tracking-wider text-[#3F6570] uppercase">
                I. Mục tiêu Chủ đề (Yêu cầu cần đạt)
              </h4>
              <ul className="space-y-1.5 text-sm text-[#29383D]">
                <li>
                  • <strong>Năng lực thích ứng với cuộc sống:</strong> Nhận diện được các biểu hiện
                  của bắt nạt học đường và bắt nạt trên không gian mạng; thực hành quy tắc ứng xử an
                  toàn, văn minh.
                </li>
                <li>
                  • <strong>Năng lực thiết kế và tổ chức hoạt động:</strong> Lập kế hoạch và thực
                  hiện sản phẩm truyền thông "Lớp học hạnh phúc – Không bạo lực mạng".
                </li>
                <li>
                  • <strong>Phẩm chất:</strong> Nhân ái (thấu cảm, tôn trọng sự khác biệt của bạn
                  bè) và Trách nhiệm (bảo vệ lẽ phải, không tiếp tay phát tán thông tin xấu độc).
                </li>
              </ul>
            </div>

            <div className="space-y-2 rounded-xl border border-[#CFDADB] bg-[#EAF0F1]/50 p-4">
              <h4 className="text-xs font-bold tracking-wider text-[#3F6570] uppercase">
                II. Thiết bị Giáo dục và Học liệu
              </h4>
              <ul className="space-y-1.5 text-sm text-[#29383D]">
                <li>
                  • <strong>Chuẩn bị của Giáo viên:</strong> Bộ thẻ tình huống Sân khấu tương tác,
                  video phóng sự ngắn (3 phút), giấy A0, bút dạ và Phiếu đánh giá Rubric.
                </li>
                <li>
                  • <strong>Chuẩn bị của Học sinh:</strong> Sưu tầm các câu chuyện thực tế về văn
                  hóa ứng xử trên mạng xã hội; chuẩn bị vật liệu thiết kế góc thông điệp tình bạn.
                </li>
              </ul>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="text-xs font-bold tracking-wider text-[#3F6570] uppercase">
              III. Tiến trình Tổ chức Chuỗi 4 Hoạt động Trải nghiệm
            </h4>
            <div className="grid gap-3 md:grid-cols-2">
              <div className="space-y-1.5 rounded-xl border border-[#CFDADB] bg-white p-4">
                <div className="text-sm font-bold text-[#29383D]">
                  Hoạt động 1: Khởi động (10 phút) — Trò chơi "Dấu ấn lời nói"
                </div>
                <p className="text-xs leading-relaxed text-[#55676B]">
                  <strong>Sản phẩm:</strong> Chia sẻ cảm nhận của HS về tờ giấy bị vò nhàu.{' '}
                  <strong>Tổ chức:</strong> HS thực hành vò tờ giấy và cố vuốt phẳng lại, từ đó
                  chiêm nghiệm rằng những lời nói tổn thương trên mạng dù xóa đi vẫn để lại vết hằn
                  tâm lí.
                </p>
              </div>
              <div className="space-y-1.5 rounded-xl border border-[#CFDADB] bg-white p-4">
                <div className="text-sm font-bold text-[#29383D]">
                  Hoạt động 2: Khám phá – Chiêm nghiệm (25 phút) — Diễn đàn 4 Trạm
                </div>
                <p className="text-xs leading-relaxed text-[#55676B]">
                  <strong>Sản phẩm:</strong> Sơ đồ tư duy 4 trạm của 4 tổ. <strong>Tổ chức:</strong>{' '}
                  Các nhóm luân chuyển qua 4 trạm: (1) Nhận diện hành vi; (2) Hệ lụy tâm lí & pháp
                  lý; (3) Trách nhiệm người chứng kiến; (4) Quy tắc ứng xử 5K trên mạng.
                </p>
              </div>
              <div className="space-y-1.5 rounded-xl border border-[#CFDADB] bg-white p-4">
                <div className="text-sm font-bold text-[#29383D]">
                  Hoạt động 3: Rèn luyện kỹ năng (35 phút) — Sân khấu tương tác 5 bước
                </div>
                <p className="text-xs leading-relaxed text-[#55676B]">
                  <strong>Sản phẩm:</strong> Phần nhập vai giải quyết tình huống của HS.{' '}
                  <strong>Tổ chức:</strong> Nhóm kịch biểu diễn tình huống bạn học bị lập nhóm nói
                  xấu đến nút thắt cao trào; mời các HS dưới lớp lên nhập vai tháo gỡ xung đột.
                </p>
              </div>
              <div className="space-y-1.5 rounded-xl border border-[#CFDADB] bg-white p-4">
                <div className="text-sm font-bold text-[#29383D]">
                  Hoạt động 4: Vận dụng – Mở rộng (20 phút) — Chiến dịch "Thông điệp Xanh"
                </div>
                <p className="text-xs leading-relaxed text-[#55676B]">
                  <strong>Sản phẩm:</strong> Bộ quy tắc ứng xử số của lớp 10A và cam kết cá nhân.{' '}
                  <strong>Tổ chức:</strong> Mỗi HS viết 1 cam kết hành động dán lên Bảng truyền
                  thông lớp và lan tỏa thông điệp tích cực trong 1 tuần tiếp theo.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* PHẦN IV: TÌNH HUỐNG THỰC HÀNH THIẾT KẾ & ĐIỀU CHỈNH CHỦ ĐỀ HĐTN */}
      <section className="space-y-4">
        <div className="flex items-center gap-2 border-b border-[#CFDADB] pb-2 font-serif text-xl font-bold text-[#29383D]">
          <HelpCircle className="h-5 w-5 text-[#3F6570]" />
          <h2 id="4-tinh-huong-thuc-hanh-hdtn">
            4. Tình huống Thực hành Điều chỉnh Kế hoạch Chủ đề HĐTN, HN (CLO8, CLO9)
          </h2>
        </div>
        <CaseStudyBox caseStudy={caseStudy6_3} />
      </section>
    </div>
  );
};

// ============================================================================
// 4. EXPORT TRÌNH NẠP MODULE KHỐI THỰC HÀNH (CHƯƠNG 6 DYNAMIC LOADER)
// ============================================================================

export function getChapter6LessonModule(lessonId: string): CompiledLessonModule | null {
  if (
    lessonId === 'gdh-th-b1-phan-tich-va-giai-quyet-20-tinh-huong-su-pham-thuc-te' ||
    lessonId === 'phan-tich-va-giai-quyet-20-tinh-huong-su-pham-thuc-te' ||
    lessonId === 'thuc-hanh-1' ||
    lessonId === 'gdh-c6-b1-ngan-hang-20-tinh-huong-su-pham-thuc-te' ||
    lessonId === 'ngan-hang-20-tinh-huong-su-pham-thuc-te' ||
    lessonId === '6-1' ||
    lessonId === 'bai-6-1' ||
    lessonId === 'c6-b1' ||
    lessonId === 'tinh-huong-su-pham'
  ) {
    return {
      default: Lesson6_1View,
      frontmatter: {
        title:
          'Thực hành 1: Phân tích và giải quyết 20 tình huống sư phạm thực tế theo quy trình 5 bước (Ngân hàng 20 tình huống sư phạm)',
        description:
          'Vận dụng hệ thống 6 nguyên tắc hoạt động giáo dục và quy trình 5 bước (Mục 3.3.6 Giáo trình HCMUE tr. 65–66) để phân tích, xử lí 20 tình huống sư phạm điển hình ở trường phổ thông.',
        level: 'advanced',
        tags: [
          'CLO4',
          'CLO5',
          'Thực hành 1',
          '20 Tình huống sư phạm',
          'Quy trình 5 bước',
          'Giáo trình tr. 65-66',
        ],
      },
      lessonMeta: {
        chapterNumber: 6,
        lessonNumber: 1,
        headings: [
          {
            id: '1-quy-trinh-khoa-hoc-5-buoc',
            text: '1. Quy trình Khoa học 5 Bước Xử lý Tình huống Sư phạm (Giáo trình HCMUE tr. 65–66)',
            depth: 2,
          },
          {
            id: '2-ngan-hang-20-tinh-huong',
            text: '2. Ngân hàng 20 Tình huống Sư phạm Thực tế & Phương án Chuẩn 5 Bước',
            depth: 2,
          },
          {
            id: '3-tinh-huong-mau-tong-hop',
            text: '3. Mô hình Mẫu Trình bày Bài làm Xử lý Tình huống Sư phạm 5 Bước',
            depth: 2,
          },
        ],
        blocks: [],
      },
    };
  }

  if (
    lessonId === 'gdh-th-b2-lap-ke-hoach-giao-duc-lop-chu-nhiem-va-thiet-ke-tiet-sinh-hoat-lop' ||
    lessonId === 'lap-ke-hoach-giao-duc-lop-chu-nhiem-va-thiet-ke-tiet-sinh-hoat-lop' ||
    lessonId === 'thuc-hanh-2' ||
    lessonId === 'gdh-c6-b2-de-cuong-cau-hoi-on-thi-tu-luan-trong-tam-va-dan-y-dap-an' ||
    lessonId === 'de-cuong-cau-hoi-on-thi-tu-luan-trong-tam-va-dan-y-dap-an' ||
    lessonId === '6-2' ||
    lessonId === 'bai-6-2' ||
    lessonId === 'c6-b2' ||
    lessonId === 'de-cuong-on-tap'
  ) {
    return {
      default: Lesson6_2View,
      frontmatter: {
        title:
          'Thực hành 2: Lập kế hoạch giáo dục lớp chủ nhiệm và thiết kế tiết Sinh hoạt lớp (Đề cương câu hỏi ôn thi tự luận)',
        description:
          'Thực hành xây dựng kế hoạch giáo dục lớp chủ nhiệm theo quy trình 6 bước (Giáo trình HCMUE tr. 71–73), thiết kế kịch bản tiết Sinh hoạt lớp tự quản và hệ thống 10 câu hỏi tự luận, 20 câu trắc nghiệm ôn tập.',
        level: 'advanced',
        tags: [
          'CLO6',
          'CLO7',
          'Thực hành 2',
          'Kế hoạch chủ nhiệm',
          'Tiết Sinh hoạt lớp',
          'Đề cương ôn thi',
        ],
      },
      lessonMeta: {
        chapterNumber: 6,
        lessonNumber: 2,
        headings: [
          {
            id: '1-ma-tran-de-thi',
            text: '1. Thực hành Lập Kế hoạch Giáo dục Lớp Chủ nhiệm & Ma trận Đề thi Tự luận',
            depth: 2,
          },
          {
            id: '2-10-cau-hoi-tu-luan',
            text: '2. Tuyển tập 10 Câu hỏi Tự luận Kinh điển & Barem Điểm Chi tiết',
            depth: 2,
          },
          {
            id: '3-trac-nghiem-on-tap',
            text: '3. Bộ 20 Câu hỏi Trắc nghiệm Khách quan Ôn tập Cuối kỳ',
            depth: 2,
          },
          {
            id: '4-tinh-huong-thuc-hanh-chu-nhiem',
            text: '4. Tình huống Thực hành Thiết kế Tiết Sinh hoạt Lớp (CLO6, CLO7)',
            depth: 2,
          },
        ],
        blocks: [],
      },
    };
  }

  if (
    lessonId === 'gdh-th-b3-thiet-ke-ke-hoach-chu-de-hoat-dong-trai-nghiem-huong-nghiep' ||
    lessonId === 'thiet-ke-ke-hoach-chu-de-hoat-dong-trai-nghiem-huong-nghiep' ||
    lessonId === 'thuc-hanh-3' ||
    lessonId === 'thiet-ke-chu-de-hdtn' ||
    lessonId === '6-3' ||
    lessonId === 'bai-6-3' ||
    lessonId === 'c6-b3'
  ) {
    return {
      default: Lesson6_3View,
      frontmatter: {
        title:
          'Thực hành 3: Thiết kế kế hoạch chủ đề Hoạt động trải nghiệm, hướng nghiệp (Tích hợp tài liệu Mô đun 2 THCS & THPT)',
        description:
          'Thực hành thiết kế kế hoạch chủ đề Hoạt động trải nghiệm, hướng nghiệp theo quy trình chuẩn Giáo trình HCMUE (tr. 116–124) kết hợp Tài liệu bồi dưỡng giáo viên cốt cán Mô đun 2 cấp THCS & THPT và Rubric đánh giá thực hành.',
        level: 'advanced',
        tags: [
          'CLO8',
          'CLO9',
          'Thực hành 3',
          'Mô đun 2 THCS & THPT',
          'Kế hoạch chủ đề HĐTN',
          'Giáo trình tr. 110-124',
        ],
      },
      lessonMeta: {
        chapterNumber: 6,
        lessonNumber: 3,
        headings: [
          {
            id: '1-doi-sanh-mo-dun-2-thcs-thpt',
            text: '1. Tích hợp Tài liệu Mô đun 2: Đặc thù Thiết kế Chủ đề HĐTN, HN cấp THCS và THPT',
            depth: 2,
          },
          {
            id: '2-quy-trinh-va-rubric-chu-de-hdtn',
            text: '2. Tiến trình 4 Hoạt động Trải nghiệm & Bảng Rubric Đánh giá Thực hành 3',
            depth: 2,
          },
          {
            id: '3-ke-hoach-chu-de-hdtn-mau',
            text: '3. Hồ sơ Kế hoạch Chủ đề Hoạt động Trải nghiệm, Hướng nghiệp Mẫu (Chuẩn Mô đun 2)',
            depth: 2,
          },
          {
            id: '4-tinh-huong-thuc-hanh-hdtn',
            text: '4. Tình huống Thực hành Điều chỉnh Kế hoạch Chủ đề HĐTN, HN (CLO8, CLO9)',
            depth: 2,
          },
        ],
        blocks: [],
      },
    };
  }

  return null;
}
