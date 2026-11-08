/**
 * ============================================================================
 * LEARNING UNIVERSE — KHỐI THỰC HÀNH NGHIỆP VỤ SƯ PHẠM (EDUC2802)
 * Đối chiếu: Giáo trình Giáo dục học HCMUE (Mục 3.3.6 tr. 65–66, Tr. 70–82, Tr. 110–124)
 * Chuẩn đầu ra: CLO6, CLO8, CLO9 | Đề cương chi tiết EDUC2802 (K50-51)
 * ============================================================================
 */

import type { PedagogicalCaseStudy } from './courses/giao-duc-hoc/course';

// ============================================================================
// 1. ĐỊNH NGHĨA KIỂU DỮ LIỆU
// ============================================================================

export type PracticalCaseGroup = 'A' | 'B' | 'C' | 'D';

export interface PracticalPedagogicalCase extends PedagogicalCaseStudy {
  readonly code: string; // 'A1' - 'A5', 'B1' - 'B5', 'C1' - 'C5', 'D1' - 'D5'
  readonly group: PracticalCaseGroup;
  readonly groupName: string;
  readonly targetGrade: string;
  readonly category: 'insubordination' | 'romance' | 'bullying' | 'integrity' | 'parent';
}

export interface FiveStepTheoryStep {
  readonly stepNumber: number;
  readonly badge: string;
  readonly title: string;
  readonly coreAction: string;
  readonly detailedMethod: string;
  readonly theoreticalBasis: string;
  readonly commonErrors: string;
}

export interface HomeroomPlanSection {
  readonly sectionNumber: number;
  readonly title: string;
  readonly badge: string;
  readonly description: string;
  readonly keyComponents: readonly string[];
  readonly concreteExample: string;
}

export interface ScriptActivityDetail {
  readonly timeRange: string;
  readonly durationMinutes: number;
  readonly activityName: string;
  readonly inCharge: string;
  readonly contentAndMethod: string;
  readonly studentAction: string;
  readonly expectedOutcome: string;
}

export interface RubricCriterion {
  readonly criterion: string;
  readonly weight: string;
  readonly notMet: string;
  readonly met: string;
  readonly good: string;
}

// ============================================================================
// 2. KHUNG LÝ THUYẾT CHỈ ĐẠO: QUY TRÌNH 5 BƯỚC XỬ LÝ TÌNH HUỐNG SƯ PHẠM
// (Mục 3.3.6 Giáo trình Giáo dục học HCMUE, tr. 65–66)
// ============================================================================

export const FIVE_STEP_PRACTICAL_FRAMEWORK: readonly FiveStepTheoryStep[] = [
  {
    stepNumber: 1,
    badge: 'Bước 01 · Thu thập & Nhận diện',
    title: 'Phân tích dữ kiện đã cho và xác định dữ kiện quan trọng, chủ yếu',
    coreAction: 'Lọc nhiễu thông tin, phân biệt hiện tượng bề ngoài với dữ kiện thực chất.',
    detailedMethod:
      'Người giáo viên cần giữ sự điềm tĩnh sư phạm ("dừng 5 giây"), thu thập thông tin đa chiều từ học sinh, ban cán sự, sổ đầu bài, giáo viên bộ môn và phụ huynh. Xác định rõ đối tượng trung tâm, hoàn cảnh diễn ra (trong giờ học, ngoài sân trường, trên mạng xã hội) và mức độ cấp bách của tình huống.',
    theoreticalBasis:
      'Quy luật tri giác và tư duy phân tích sư phạm; tránh phán xét vội vàng dựa trên định kiến cá nhân.',
    commonErrors:
      'Chỉ nghe một phía, vội vã quy chụp lỗi lầm, để cảm xúc bực tức chi phối việc tiếp nhận thông tin.',
  },
  {
    stepNumber: 2,
    badge: 'Bước 02 · Chuẩn đoán bản chất',
    title: 'Biểu đạt vấn đề cần giải quyết (xác định mâu thuẫn trung tâm)',
    coreAction: 'Gọi tên chính xác mâu thuẫn trung tâm và xung đột sư phạm tiềm ẩn.',
    detailedMethod:
      'Chỉ ra mâu thuẫn giữa: (a) Yêu cầu kỷ cương của tập thể với nhu cầu thể hiện "cái tôi" cá nhân; (b) Nhu cầu khẳng định bản thân với sự thiếu hụt kỹ năng kiểm soát cảm xúc; (c) Kỳ vọng của gia đình với áp lực quá tải của học sinh; (d) Mục tiêu sư phạm của thầy cô với tính nhạy cảm, dễ tổn thương của lứa tuổi học sinh phổ thông.',
    theoreticalBasis:
      'Mâu thuẫn là động lực của sự phát triển (Triết học duy vật biện chứng & Tâm lý học phát triển lứa tuổi).',
    commonErrors:
      'Chỉ nhìn thấy hành vi sai phạm bề mặt (chống đối, trốn tiết) mà không thấy được nguyên nhân tâm lý sâu xa (tự ti, stress, khủng hoảng gia đình).',
  },
  {
    stepNumber: 3,
    badge: 'Bước 03 · Đề xuất & Lựa chọn',
    title: 'Nêu giả thuyết các phương án giải quyết và lựa chọn phương án tối ưu',
    coreAction: 'Thiết kế ít nhất 2–3 kịch bản xử lý và chọn phương án nhân văn, khả thi nhất.',
    detailedMethod:
      'Dự kiến các phương án: Phương án tức thời (hạ nhiệt xung đột tại chỗ, ổn định trật tự tập thể); Phương án trung gian (gặp gỡ, đối thoại riêng sau giờ học); Phương án mở rộng (phối hợp gia đình, chuyên viên tâm lý, BGH). So sánh ưu/nhược điểm từng phương án để chọn phương án vừa bảo toàn kỷ cương, vừa bảo vệ lòng tự trọng của học sinh.',
    theoreticalBasis:
      'Lý thuyết giải quyết vấn đề và ra quyết định sư phạm tối ưu (T.A. Ilyina & Giáo trình HCMUE tr. 65).',
    commonErrors:
      'Chỉ nghĩ ra một phương án cực đoan (đuổi học, phạt trực nhật nặng, báo ngay cho phụ huynh đòi kỷ luật) mà không có kịch bản mềm dẻo.',
  },
  {
    stepNumber: 4,
    badge: 'Bước 04 · Luận giải khoa học',
    title: 'Chứng minh cơ sở khoa học của phương án tối ưu',
    coreAction:
      'Đối chiếu phương án đã chọn với hệ thống 6 nguyên tắc giáo dục và quy luật tâm lý.',
    detailedMethod:
      'Luận giải rõ phương án đã vận dụng những nguyên tắc nào: Nguyên tắc tôn trọng nhân cách kết hợp yêu cầu hợp lý; Nguyên tắc giáo dục trong tập thể và bằng tập thể; Nguyên tắc đảm bảo tính hệ thống, phù hợp đặc điểm cá nhân; Nguyên tắc gắn liền với thực tiễn. Trích dẫn quy định pháp lý (Điều lệ trường trung học Thông tư 32/2020, Thông tư 20/2018).',
    theoreticalBasis:
      'Hệ thống 6 nguyên tắc hoạt động giáo dục (Giáo trình HCMUE tr. 44–47) và Luật Giáo dục 2019.',
    commonErrors:
      'Xử lý hoàn toàn theo cảm tính, kinh nghiệm vụn vặt mà không chứng minh được tính sư phạm khoa học.',
  },
  {
    stepNumber: 5,
    badge: 'Bước 05 · Đúc kết & Phòng ngừa',
    title: 'Rút ra kết luận sư phạm và bài học kinh nghiệm',
    coreAction: 'Chuyển hóa tình huống xung đột thành cơ hội giáo dục và phòng ngừa tái diễn.',
    detailedMethod:
      'Đánh giá hiệu quả sau can thiệp: Theo dõi sự chuyển biến thái độ, học lực của học sinh trong 2–4 tuần tiếp theo. Rút ra bài học nghệ thuật giao tiếp sư phạm cho bản thân; điều chỉnh phương pháp quản lý lớp; tham mưu cho tổ chuyên môn và nhà trường các giải pháp phòng ngừa từ sớm.',
    theoreticalBasis:
      'Chu trình học tập qua trải nghiệm (David Kolb) và năng lực tự phản tư sư phạm của nhà giáo.',
    commonErrors:
      'Sau khi giải quyết xong vụ việc thì bỏ mặc học sinh, không theo dõi tiến trình hồi phục tâm lý và tái hòa nhập.',
  },
];

// ============================================================================
// 3. NGÂN HÀNG 20 TÌNH HUỐNG SƯ PHẠM THỰC CHIẾN (CHUẨN 4 NHÓM A, B, C, D)
// ============================================================================

export const GDH_20_PRACTICAL_CASES: readonly PracticalPedagogicalCase[] = [
  // --------------------------------------------------------------------------
  // NHÓM A: XUNG ĐỘT TRONG GIỜ HỌC (TÌNH HUỐNG A1 - A5)
  // --------------------------------------------------------------------------
  {
    id: 1,
    code: 'A1',
    group: 'A',
    groupName: 'Nhóm A: Xung đột trong giờ học',
    title:
      'Học sinh công khai phản đối cách chấm điểm của giáo viên ngay trong giờ học (Học sinh công khai cãi lại và bất hợp tác trong giờ học)',
    category: 'insubordination',
    targetGrade: 'Lớp 10 / 11 (THPT)',
    context:
      'Trong tiết học môn Toán, học sinh công khai cãi lại và bất hợp tác trong giờ học khi trả bài kiểm tra 1 tiết: sau khi nhận bài, học sinh T. đập mạnh bút xuống bàn, đứng phắt dậy nói lớn tiếng trước cả lớp: "Cô chấm bất công! Bài em làm cùng một cách giải với bạn K. mà bạn được 9 điểm còn em chỉ được 6 điểm. Cô thiên vị cán bộ lớp!". Cả lớp lập tức xôn xao, nhiều học sinh quay lại nhìn cô giáo xem phản ứng.',
    question:
      'Nếu là giáo viên bộ môn trong tình huống này, Thầy/Cô sẽ xử lý thế nào theo quy trình 5 bước để vừa duy trì kỷ cương giờ học, bảo đảm tính công bằng minh bạch, vừa không làm bùng phát xung đột căng thẳng với học sinh?',
    principlesApplied: [
      'Nguyên tắc tôn trọng nhân cách kết hợp với yêu cầu hợp lý đối với học sinh',
      'Nguyên tắc kiềm chế cảm xúc sư phạm và chuyển hướng tình huống',
      'Nguyên tắc công khai, minh bạch và dân chủ trong đánh giá học sinh',
    ],
    solutionSteps: [
      {
        step: 1,
        title: 'Bước 1: Phân tích dữ kiện và giữ bình tĩnh tuyệt đối ("Dừng 5 giây")',
        content:
          'Dữ kiện quan trọng: T. bức xúc vì so sánh bài mình với bạn K.; em phản ứng bộc phát ngay trước tập thể lớp. Giáo viên hít thở sâu, giữ nét mặt điềm tĩnh, không quát mắng hay quy chụp T. là "vô lễ" ngay tại chỗ.',
      },
      {
        step: 2,
        title: 'Bước 2: Biểu đạt mâu thuẫn trung tâm',
        content:
          'Mâu thuẫn giữa nhu cầu đòi hỏi tính công bằng, minh bạch của học sinh với hành vi phản ứng sai lệch quy tắc ứng xử học đường (cắt ngang tiết dạy, to tiếng trước tập thể).',
      },
      {
        step: 3,
        title: 'Bước 3: Lựa chọn phương án tối ưu',
        content:
          'Phương án tối ưu: Ổn định lớp bằng lời nói dứt khoát nhưng từ tốn: "Cô ghi nhận thắc mắc của em T. về thang điểm. Đánh giá công bằng là nguyên tắc hàng đầu của cô. Tuy nhiên, bây giờ lớp cần nghe cô chữa lỗi chung cho cả lớp. Cuối giờ, cô mời T. và K. cùng mang bài lên bàn giáo viên đối chiếu barem điểm". Tiếp tục điều hành tiết học.',
      },
      {
        step: 4,
        title: 'Bước 4: Chứng minh cơ sở khoa học & Xử lý sau giờ học',
        content:
          'Vận dụng nguyên tắc tôn trọng nhân cách và quy tắc dân chủ: Sau tiết học, giáo viên cùng T. và K. xem lại từng bước giải. Nếu chấm sót bước của T., giáo viên thẳng thắn nhận lỗi và sửa điểm; nếu T. hiểu sai lập luận, giáo viên kiên nhẫn chỉ rõ điểm trừ. Đồng thời nhắc nhở nhẹ nhàng T. về văn hóa góp ý văn minh.',
      },
      {
        step: 5,
        title: 'Bước 5: Rút ra bài học sư phạm',
        content:
          'Bài học: Người thầy cần công khai barem điểm và hướng dẫn chấm trước khi trả bài. Thái độ cầu thị và minh bạch của giáo viên chính là bài học đạo đức sống động nhất về sự liêm chính cho học sinh.',
      },
    ],
    pitfallsToAvoid: [
      'Nổi giận đập bàn, đe dọa hạ hạnh kiểm hoặc đuổi học sinh ra khỏi lớp.',
      'Đôi co tranh cãi tay đôi từng bước giải làm mất 20–30 phút của cả tập thể lớp.',
      'Bảo thủ không nhận lỗi khi thực sự có sơ suất trong quá trình chấm thi.',
    ],
    coreLesson:
      'Sự minh bạch, điềm tĩnh và tôn trọng quyền được giải trình của học sinh giúp chuyển hóa một xung đột điểm số thành bài học văn hóa ứng xử.',
  },
  {
    id: 2,
    code: 'A2',
    group: 'A',
    groupName: 'Nhóm A: Xung đột trong giờ học',
    title: 'Học sinh phát hiện giáo viên ghi sai kiến thức trên bảng và có thái độ chế giễu',
    category: 'insubordination',
    targetGrade: 'Lớp 11 / 12 (THPT)',
    context:
      'Trong lúc giảng bài Hình học không gian, giáo viên sơ ý ghi nhầm một công thức định lý trên bảng. Phía dưới lớp, một nhóm nam sinh khúc khích cười, trong đó em N. nói to đủ cả lớp nghe thấy: "Thầy dạy đội tuyển mà công thức cơ bản lớp 11 cũng viết sai, thế mà lúc nào cũng bắt học sinh không được nhầm!".',
    question:
      'Vận dụng quy trình 5 bước và nguyên tắc tôn trọng nhân cách, Thầy/Cô hãy xử lý tình huống trên để bảo toàn uy tín khoa học của nhà giáo mà không tạo sự đối đầu với học sinh.',
    principlesApplied: [
      'Nguyên tắc đảm bảo tính khoa học và tính giáo dục trong dạy học',
      'Nguyên tắc tôn trọng nhân cách kết hợp tính nghiêm túc sư phạm',
      'Nghệ thuật ứng biến sư phạm linh hoạt, biến sai sót thành cơ hội học tập',
    ],
    solutionSteps: [
      {
        step: 1,
        title: 'Bước 1: Phân tích dữ kiện',
        content:
          'Giáo viên quả thực đã ghi nhầm công thức; học sinh phát hiện đúng nhưng thể hiện qua lời lẽ mỉa mai, công kích cá nhân trước tập thể.',
      },
      {
        step: 2,
        title: 'Bước 2: Biểu đạt mâu thuẫn trung tâm',
        content:
          'Mâu thuẫn giữa tính chính xác tuyệt đối của tri thức khoa học với tâm lý ngạo mạn, thích thể hiện sự "vượt trội" hơn thầy cô của học sinh lứa tuổi THPT.',
      },
      {
        step: 3,
        title: 'Bước 3: Lựa chọn phương án tối ưu',
        content:
          'Phương án tối ưu: Bình tĩnh dừng lại nhìn lên bảng, mỉm cười nhẹ nhàng và tuyên dương sự tinh mắt của học sinh: "Rất cảm ơn em N. đã phát hiện rất nhanh chỗ nhầm dấu ở công thức này. Điều này chứng tỏ các em đang theo dõi bài rất tập trung". Giáo viên sửa lại công thức chuẩn xác, sau đó phân tích vì sao lỗi nhầm này rất dễ xảy ra khi thi cử.',
      },
      {
        step: 4,
        title: 'Bước 4: Chứng minh cơ sở khoa học & Nhắc nhở khéo léo',
        content:
          'Dựa trên nguyên tắc biến sai sót thành bài học: Giáo viên giải thích: "Trong khoa học, sai sót nhỏ có thể xảy ra, quan trọng là phát hiện và sửa chữa kịp thời". Sau giờ học, gặp riêng em N., ghi nhận năng lực của em nhưng nhắc nhở chân thành: "Thầy rất phục sự nhanh nhạy của em, nhưng giá như em giơ tay phát biểu góp ý lịch sự thì em còn nhận được sự nể trọng lớn hơn nhiều từ thầy và các bạn".',
      },
      {
        step: 5,
        title: 'Bước 5: Rút ra bài học sư phạm',
        content:
          'Bài học: Người thầy không phải là cuốn bách khoa toàn thư không tì vết. Bản lĩnh của người thầy thể hiện ở sự dũng cảm đối diện với sai sót và thái độ độ lượng trước sự bồng bột của tuổi trẻ.',
      },
    ],
    pitfallsToAvoid: [
      'Tự ái, cố tình cãi chày cãi cối rằng mình không sai hoặc viện lý do "thầy chỉ đang thử xem lớp có chú ý không".',
      'Mắng mỏ học sinh N. là "láo xược", ghi sổ đầu bài để trả đũa.',
    ],
    coreLesson:
      'Uy tín thực sự của người thầy không nằm ở việc không bao giờ sai, mà ở thái độ chân thành trước chân lý khoa học.',
  },
  {
    id: 3,
    code: 'A3',
    group: 'A',
    groupName: 'Nhóm A: Xung đột trong giờ học',
    title: 'Nhóm học sinh ngồi cuối lớp lén lút truyền tay nhau thiết bị điện tử để chơi game',
    category: 'integrity',
    targetGrade: 'Lớp 8 / 9 (THCS)',
    context:
      'Trong lúc giáo viên đang say sưa phân tích bài học, ở góc bàn cuối lớp, 3 học sinh nam chụm đầu che sách giáo khoa để lén chơi game online trên điện thoại. Khi một em bất ngờ reo lên vì thắng trận, cả lớp giật mình quay lại nhìn. Bị giáo viên bắt quả tang, một em nhanh tay giấu điện thoại vào ba lô và chối: "Tụi em có làm gì đâu, tụi em đang chỉ bài cho nhau mà!".',
    question:
      'Thầy/Cô hãy vận dụng quy trình 5 bước và các quy định của Thông tư 32/2020 về sử dụng điện thoại để giải quyết tình huống trên một cách nghiêm minh nhưng giàu tính thuyết phục.',
    principlesApplied: [
      'Nguyên tắc thống nhất giữa tính nghiêm minh của kỷ luật với lòng nhân ái',
      'Quy định Điều lệ trường trung học (Thông tư 32/2020/TT-BGDĐT Điều 37)',
      'Nguyên tắc phối hợp chặt chẽ giữa giáo viên bộ môn, GVCN và cha mẹ học sinh',
    ],
    solutionSteps: [
      {
        step: 1,
        title: 'Bước 1: Phân tích dữ kiện',
        content:
          'Học sinh sử dụng thiết bị điện tử sai mục đích trong giờ học, gây mất trật tự và có hành vi nói dối để né tránh trách nhiệm.',
      },
      {
        step: 2,
        title: 'Bước 2: Biểu đạt mâu thuẫn trung tâm',
        content:
          'Mâu thuẫn giữa sự hấp dẫn của trò chơi công nghệ số với trách nhiệm học tập và sự tuân thủ nội quy lớp học.',
      },
      {
        step: 3,
        title: 'Bước 3: Lựa chọn phương án tối ưu',
        content:
          'Phương án tối ưu: Đi xuống tận nơi, yêu cầu học sinh bình tĩnh lấy thiết bị đặt lên bàn giáo viên tạm giữ: "Thầy không kiểm tra nội dung riêng tư của các em. Thầy tạm giữ thiết bị theo quy định của lớp và chúng ta sẽ làm việc cụ thể sau tiết học". Cho cả 3 em tiếp tục mở sách vở học bài, không đình chỉ giờ học.',
      },
      {
        step: 4,
        title: 'Bước 4: Chứng minh cơ sở khoa học & Xử lý giáo dục tích cực',
        content:
          'Cuối buổi, mời 3 em cùng GVCN gặp gỡ. Phân tích tác hại của việc nghiện game làm suy giảm trí nhớ và kết quả học. Trích dẫn Điều 37 Điều lệ trường học: Thiết bị điện tử chỉ dùng khi phục vụ học tập và được giáo viên cho phép. Yêu cầu viết bản cam kết và hẹn phụ huynh đến nhận lại thiết bị.',
      },
      {
        step: 5,
        title: 'Bước 5: Rút ra bài học sư phạm',
        content:
          'Bài học: Chuyển hóa phương pháp dạy học theo hướng tăng cường hoạt động nhóm, giao nhiệm vụ liên tục để học sinh không có thời gian nhàn rỗi phân tán tư tưởng.',
      },
    ],
    pitfallsToAvoid: [
      'Tịch thu điện thoại rồi tự ý mở đọc tin nhắn, hình ảnh riêng tư của học sinh (vi phạm nghiêm trọng quyền riêng tư theo Bộ luật Dân sự).',
      'Đập vỡ hoặc đe dọa tịch thu vĩnh viễn thiết bị.',
    ],
    coreLesson:
      'Kỷ luật công nghệ cần sự nghiêm minh trong giám sát nhưng phải tôn trọng tuyệt đối quyền riêng tư và danh dự của người học.',
  },
  {
    id: 4,
    code: 'A4',
    group: 'A',
    groupName: 'Nhóm A: Xung đột trong giờ học',
    title: 'Học sinh kiên quyết không chịu đứng dậy trả lời câu hỏi bài cũ dù bị gọi tên nhiều lần',
    category: 'insubordination',
    targetGrade: 'Lớp 10 (THPT)',
    context:
      'Đầu giờ học, giáo viên kiểm tra miệng bài cũ và gọi tên em H. Học sinh H. ngồi im, mắt nhìn chằm chằm xuống mặt bàn. Giáo viên nhắc lại lần 2 và lần 3 với giọng nghiêm khắc hơn: "Em H. có nghe cô gọi không? Đứng dậy trả lời!". H. vẫn bất động, hai tay khoanh trước ngực, môi mím chặt và biểu hiện thái độ chống đối ngầm.',
    question:
      'Là giáo viên trên bục giảng, Thầy/Cô sẽ xử lý thế nào theo quy trình 5 bước để không làm đông cứng không khí lớp học và tìm ra nguyên nhân sâu xa đằng sau phản ứng của H.?',
    principlesApplied: [
      'Nguyên tắc tôn trọng nhân cách kết hợp sự thấu hiểu tâm lý lứa tuổi',
      'Nguyên tắc tìm hiểu kỹ đặc điểm cá nhân và hoàn cảnh học sinh',
      'Kỹ thuật hạ nhiệt xung đột và bảo đảm tiến độ giờ học',
    ],
    solutionSteps: [
      {
        step: 1,
        title: 'Bước 1: Phân tích dữ kiện',
        content:
          'H. không đứng dậy không hẳn vì vô lễ mà có thể do bất an tột độ, không thuộc bài nên xấu hổ, hoặc vừa trải qua cú sốc tâm lý trước giờ học.',
      },
      {
        step: 2,
        title: 'Bước 2: Biểu đạt mâu thuẫn trung tâm',
        content:
          'Mâu thuẫn giữa yêu cầu kiểm tra đánh giá kiến thức của giáo viên với trạng thái phòng vệ tâm lý tiêu cực của học sinh.',
      },
      {
        step: 3,
        title: 'Bước 3: Lựa chọn phương án tối ưu',
        content:
          'Phương án tối ưu: Không tiếp tục ép buộc H. đứng dậy để tránh đẩy mâu thuẫn lên đỉnh điểm. Giáo viên nói nhẹ nhàng: "Cô nhận thấy hôm nay sức khỏe hoặc tâm trạng của H. không được tốt. Cô cho phép em ngồi nghỉ và theo dõi bài giảng. Cuối giờ ở lại chia sẻ với cô nhé". Sau đó mời một học sinh khác trả lời để giờ học tiếp diễn.',
      },
      {
        step: 4,
        title: 'Bước 4: Chứng minh cơ sở khoa học & Tìm hiểu căn nguyên',
        content:
          'Sau giờ học, gặp riêng H. trong phòng chờ. Với thái độ ấm áp, giáo viên hỏi thăm: "Hôm nay em có chuyện gì buồn hay áp lực không?". Tìm hiểu nguyên nhân (gia đình có biến cố, bị bạn trêu chọc hay sợ bị điểm kém). Giúp em cởi bỏ áp lực và hướng dẫn cách học lại bài để gỡ điểm vào buổi sau.',
      },
      {
        step: 5,
        title: 'Bước 5: Rút ra bài học sư phạm',
        content:
          'Bài học: Đằng sau sự "bất hợp tác" của học sinh thường là sự cầu cứu trong câm lặng. Sự bao dung và tinh tế của giáo viên sẽ mở khóa những tâm hồn đang khép kín.',
      },
    ],
    pitfallsToAvoid: [
      'Quát tháo: "Em coi thường giáo viên à?", lập tức cho 0 điểm vào sổ điểm và đuổi ra khỏi lớp.',
      'Bỏ mặc học sinh suốt cả tiết học mà không tìm hiểu nguyên nhân sau đó.',
    ],
    coreLesson:
      'Im lặng đôi khi không phải là chống đối, mà là tiếng kêu cứu của một tâm hồn đang bị tổn thương.',
  },
  {
    id: 5,
    code: 'A5',
    group: 'A',
    groupName: 'Nhóm A: Xung đột trong giờ học',
    title: 'Học sinh có hành vi gian lận kiểm tra và cố tình tiêu hủy tài liệu khi bị phát hiện',
    category: 'integrity',
    targetGrade: 'Lớp 11 (THPT)',
    context:
      'Trong lúc giám thị đi lại kiểm tra bài thi giữa kỳ, phát hiện em B. đang lén xem một mảnh "phao" thi dưới ngăn bàn. Khi giáo viên bước tới yêu cầu nộp tài liệu, B. lập tức vo tròn mảnh giấy và bỏ nhanh vào miệng nhai nuốt để phi tang chứng cứ, sau đó thản nhiên nói: "Em có làm gì đâu, thầy cô vu khống em!".',
    question:
      'Thầy/Cô hãy vận dụng quy trình 5 bước và các quy chế thi cử hiện hành để giải quyết hành vi phi tang chứng cứ trên một cách chặt chẽ, nhân văn và mang tính răn đe giáo dục.',
    principlesApplied: [
      'Nguyên tắc giáo dục tính trung thực và liêm chính học thuật',
      'Nguyên tắc khách quan, công bằng và có căn cứ pháp lý trong xử lý kỷ luật',
      'Quy chế thi và kiểm tra đánh giá theo Thông tư 22/2021/TT-BGDĐT',
    ],
    solutionSteps: [
      {
        step: 1,
        title: 'Bước 1: Phân tích dữ kiện',
        content:
          'Học sinh có hành vi gian lận thi cử và có phản ứng cực đoan (nuốt tài liệu) nhằm chối tội, thể hiện sự hoảng sợ tột độ và suy nghĩ bồng bột.',
      },
      {
        step: 2,
        title: 'Bước 2: Biểu đạt mâu thuẫn trung tâm',
        content:
          'Mâu thuẫn giữa áp lực bệnh thành tích, điểm số với phẩm chất trung thực; mâu thuẫn giữa nỗi sợ bị kỷ luật với hành vi phi tang nguy hiểm đến sức khỏe.',
      },
      {
        step: 3,
        title: 'Bước 3: Lựa chọn phương án tối ưu',
        content:
          'Phương án tối ưu: Ưu tiên an toàn sức khỏe của học sinh trước: Yêu cầu B. uống nước và kiểm tra hô hấp để tránh bị nghẹn. Sau đó mời giám thị 2 và hai học sinh ngồi cạnh ký biên bản xác nhận sự việc chứng kiến B. sử dụng và nuốt tài liệu. Thu bài thi của B. và cho em về chỗ ngồi trật tự đến hết giờ.',
      },
      {
        step: 4,
        title: 'Bước 4: Chứng minh cơ sở khoa học & Giáo dục lương tri',
        content:
          'Sau buổi thi, đưa B. xuống phòng y tế kiểm tra rồi làm việc cùng BGH và GVCN. Phân tích cho B. thấy: Hành vi nuốt giấy không chỉ nguy hiểm đến tính mạng mà còn làm mất đi lòng tự trọng. Xử lý vi phạm theo Quy chế thi (cho điểm 0 bài thi) nhưng mở cho em cơ hội làm lại bài kiểm tra bù để em hiểu rằng: "Điểm số có thể cải thiện, nhưng sự trung thực một khi đã mất thì rất khó tìm lại".',
      },
      {
        step: 5,
        title: 'Bước 5: Rút ra bài học sư phạm',
        content:
          'Bài học: Cần đổi mới phương pháp kiểm tra đánh giá (tăng cường câu hỏi mở, đánh giá quá trình) để giảm thiểu áp lực học vẹt dẫn đến gian lận thi cử.',
      },
    ],
    pitfallsToAvoid: [
      'Xông vào bóp cổ, móc họng học sinh để lấy tài liệu gây nguy hiểm đến tính mạng.',
      'Bêu riếu hành vi của học sinh trước toàn trường làm em mang vết nhơ tâm lý suốt đời.',
    ],
    coreLesson:
      'Giáo dục sự trung thực không bắt đầu bằng những hình phạt tàn khốc, mà bằng môi trường học tập không tôn sùng điểm số hư ảo.',
  },

  // --------------------------------------------------------------------------
  // NHÓM B: QUAN HỆ GIỮA HỌC SINH VÀ HỌC SINH (TÌNH HUỐNG B1 - B5)
  // --------------------------------------------------------------------------
  {
    id: 6,
    code: 'B1',
    group: 'B',
    groupName: 'Nhóm B: Quan hệ giữa học sinh và học sinh',
    title: 'Một học sinh có hoàn cảnh nghèo bị cả lớp cô lập, tẩy chay trên mạng xã hội',
    category: 'bullying',
    targetGrade: 'Lớp 10 (THPT)',
    context:
      'Em M. là học sinh có hoàn cảnh gia đình khó khăn, mặc đồng phục cũ và không có điện thoại thông minh đắt tiền. Trong lớp, một nhóm học sinh khá giả đã lập nhóm chat riêng trên Facebook để chế giễu hoàn cảnh của M., đặt biệt danh khiếm nhã và rủ nhau không ai được ngồi cùng bàn hay nói chuyện với M. Em M. trở nên lầm lũi, thường xuyên khóc một mình trong giờ ra chơi và có ý định bỏ học.',
    question:
      'Với tư cách là Giáo viên chủ nhiệm, Thầy/Cô hãy triển khai quy trình 5 bước để xóa bỏ nạn bạo lực tinh thần này, chữa lành tổn thương cho em M. và xây dựng lại tinh thần đoàn kết của tập thể lớp.',
    principlesApplied: [
      'Nguyên tắc giáo dục trong tập thể và bằng tập thể',
      'Nguyên tắc tôn trọng nhân cách và bảo vệ quyền học sinh',
      'Nguyên tắc phối hợp giáo dục giữa nhà trường và gia đình',
    ],
    solutionSteps: [
      {
        step: 1,
        title: 'Bước 1: Phân tích dữ kiện và tiếp cận kín đáo',
        content:
          'Dữ kiện: M. bị bắt nạt tinh thần tập thể (cô lập xã hội và bắt nạt trên không gian mạng); em có dấu hiệu sang chấn tâm lý và muốn bỏ học. GVCN cần can thiệp tế nhị, không làm M. cảm thấy bị thương hại.',
      },
      {
        step: 2,
        title: 'Bước 2: Biểu đạt mâu thuẫn trung tâm',
        content:
          'Mâu thuẫn giữa lối sống phân biệt giàu nghèo, ích kỷ của một bộ phận học sinh với các chuẩn mực đạo đức nhân ái, tương thân tương ái trong trường học.',
      },
      {
        step: 3,
        title: 'Bước 3: Lựa chọn phương án tối ưu',
        content:
          'Phương án tối ưu: Không mang sự việc ra phê bình chì chiết trước lớp khiến M. càng bị chú ý tiêu cực. Gặp riêng nhóm học sinh cầm đầu nhóm chat để phân tích mức độ vi phạm pháp luật (Luật An ninh mạng và Điều lệ trường học). Tổ chức tiết Sinh hoạt lớp chủ đề "Thấu cảm và Tình bạn không biên giới" với các hoạt động trải nghiệm hợp tác nhóm.',
      },
      {
        step: 4,
        title: 'Bước 4: Chứng minh cơ sở khoa học & Tác động tập thể',
        content:
          'Vận dụng nguyên tắc giáo dục trong tập thể: Phân công M. phụ trách một nội dung mà em có thế mạnh (ví dụ: vẽ tranh, tính toán) vào cùng nhóm với học sinh nòng cốt để các em nhận ra giá trị của M. Yêu cầu nhóm học sinh kia giải tán nhóm chat độc hại và chủ động có hành vi xin lỗi tế nhị.',
      },
      {
        step: 5,
        title: 'Bước 5: Rút ra bài học sư phạm',
        content:
          'Bài học: Xây dựng dư luận tập thể lành mạnh là "lá chắn" tốt nhất chống lại bạo lực học đường. GVCN phải luôn là người quan sát nhạy bén để dập tắt mầm mống cô lập từ sớm.',
      },
    ],
    pitfallsToAvoid: [
      'Công khai kêu gọi quyên góp từ thiện cho M. trước lớp một cách ồn ào làm tổn thương lòng tự trọng của em.',
      'Xử phạt đình chỉ học nhóm học sinh kia mà không làm các em thức tỉnh lương tâm, dẫn đến việc các em trả thù ngầm M.',
    ],
    coreLesson:
      'Sự cô lập tập thể là nhát dao vô hình nhưng tàn nhẫn nhất. Sức mạnh của tình thầy trò là biến sự khác biệt thành nhịp cầu thấu hiểu.',
  },
  {
    id: 7,
    code: 'B2',
    group: 'B',
    groupName: 'Nhóm B: Quan hệ giữa học sinh và học sinh',
    title:
      'Hai nhóm học sinh hẹn nhau sau giờ học ở cổng trường để giải quyết mâu thuẫn bằng bạo lực',
    category: 'bullying',
    targetGrade: 'Lớp 11 (THPT)',
    context:
      'Vào tiết 4 buổi chiều, lớp trưởng hớt hải chạy lên phòng giáo viên báo tin: Do va chạm trong giải bóng đá của trường, nhóm nam sinh lớp 11A do em D. cầm đầu đã hẹn nhóm nam sinh lớp 11B gặp nhau tại bãi đất trống gần cổng trường sau giờ tan học để "nói chuyện bằng tay chân", có mang theo hung khí giấu trong cốp xe.',
    question:
      'Là giáo viên nhận được tin báo khẩn cấp này, Thầy/Cô sẽ tiến hành quy trình 5 bước xử lý tình huống khẩn cấp như thế nào để ngăn chặn tuyệt đối một vụ ẩu đả có nguy cơ thương vong?',
    principlesApplied: [
      'Nguyên tắc ưu tiên an toàn tính mạng và phòng ngừa rủi ro bạo lực học đường',
      'Nguyên tắc phối hợp liên ngành: Nhà trường - Công an địa phương - Gia đình',
      'Nguyên tắc xử lý tình huống khẩn cấp theo chuỗi bảo vệ',
    ],
    solutionSteps: [
      {
        step: 1,
        title: 'Bước 1: Phân tích dữ kiện & Báo động khẩn cấp',
        content:
          'Tình huống khẩn cấp cấp độ cao: Có nguy cơ bạo lực tập thể sử dụng hung khí bên ngoài cổng trường. Không được tự ý hành động đơn độc.',
      },
      {
        step: 2,
        title: 'Bước 2: Biểu đạt mâu thuẫn trung tâm',
        content:
          'Mâu thuẫn bộc phát từ tinh thần hiếu thắng trong thể thao bị biến tướng thành hành vi côn đồ do thiếu kỹ năng kiểm soát xung động lứa tuổi thanh thiếu niên.',
      },
      {
        step: 3,
        title: 'Bước 3: Lựa chọn phương án tối ưu',
        content:
          'Phương án tối ưu: Báo cáo ngay lập tức cho Hiệu trưởng, Đoàn thanh niên và Đội bảo vệ; liên hệ Công an khu vực chốt chặn tại bãi đất trống. Đồng thời GVCN hai lớp xuống ngay phòng học giữ hai nhóm học sinh lại với lý do họp đột xuất chuẩn bị giải thể thao.',
      },
      {
        step: 4,
        title: 'Bước 4: Chứng minh cơ sở khoa học & Giải tỏa xung đột',
        content:
          'Tại phòng họp chung có sự hiện diện của BGH và công an: Yêu cầu học sinh giao nộp hung khí (nếu có). Phân tích trách nhiệm hình sự của tội gây rối trật tự công cộng và cố ý gây thương tích (Bộ luật Hình sự). Cho hai bên giải tỏa ức chế về trận bóng, bắt tay hòa giải và ký cam kết không tái phạm trước sự chứng kiến của cha mẹ.',
      },
      {
        step: 5,
        title: 'Bước 5: Rút ra bài học sư phạm',
        content:
          'Bài học: Trong các hoạt động phong trào thể thao học đường, cần lồng ghép giáo dục văn hóa fair-play và tinh thần tôn trọng đối thủ.',
      },
    ],
    pitfallsToAvoid: [
      'Một mình giáo viên chạy ra bãi đất trống để can ngăn hai nhóm đang cầm hung khí gây nguy hiểm đến tính mạng.',
      'Xem nhẹ lời cảnh báo, cho rằng "học sinh dọa nhau thôi" để rồi hậu quả đáng tiếc xảy ra.',
    ],
    coreLesson:
      'Trong xung đột bạo lực, một phút chậm trễ có thể đánh đổi bằng cả tương lai của học trò. Ngăn chặn từ sớm là biện pháp sư phạm tối thượng.',
  },
  {
    id: 8,
    code: 'B3',
    group: 'B',
    groupName: 'Nhóm B: Quan hệ giữa học sinh và học sinh',
    title: 'Phát hiện nghi vấn mất trộm tiền quỹ lớp trong giờ ra chơi',
    category: 'integrity',
    targetGrade: 'Lớp 9 (THCS)',
    context:
      'Hết giờ ra chơi, thủ quỹ lớp 9B khóc nức nở báo với GVCN: Chiếc ví đựng 2.500.000 đồng tiền quỹ lớp để đóng tiền tham quan dã ngoại để trong cặp sách của em đã bị ai đó rút trộm. Cả lớp nhao nhao nghi ngờ lẫn nhau, một số học sinh chỉ đích danh em V. vì thấy V. lảng vảng ở lại phòng học trong giờ ra chơi. Em V. phản ứng giận dữ, thề thốt không lấy và đòi đánh những bạn nghi ngờ mình.',
    question:
      'Thầy/Cô hãy vận dụng quy trình 5 bước để điều tra làm rõ sự việc mà không gây tổn thương nhân phẩm học sinh, không biến lớp học thành phòng thẩm vấn hình sự.',
    principlesApplied: [
      'Nguyên tắc suy đoán vô tội và bảo vệ danh dự, nhân phẩm học sinh',
      'Nguyên tắc xử lý tế nhị, kín đáo, không tạo dư luận nghi kỵ trong tập thể',
      'Nguyên tắc giáo dục tính trung thực và trách nhiệm bảo quản tài sản',
    ],
    solutionSteps: [
      {
        step: 1,
        title: 'Bước 1: Phân tích dữ kiện',
        content:
          'Tài sản bị mất là tiền quỹ chung; chưa có chứng cứ rõ ràng nhưng tập thể đã vội vã đổ tội cho V., gây nguy cơ bùng phát bạo lực và rạn nứt niềm tin tập thể.',
      },
      {
        step: 2,
        title: 'Bước 2: Biểu đạt mâu thuẫn trung tâm',
        content:
          'Mâu thuẫn giữa nhu cầu tìm lại tài sản bị mất với nguy cơ xúc phạm danh dự và cô lập oan uổng một học sinh.',
      },
      {
        step: 3,
        title: 'Bước 3: Lựa chọn phương án tối ưu',
        content:
          'Phương án tối ưu: Trấn an tập thể lớp ngay lập tức: "Cô nghiêm cấm việc võ đoán, đổ lỗi khi chưa có chứng cứ xác thực. Việc nghi ngờ vô căn cứ là làm tổn thương bạn mình". Tuyệt đối không lục soát cặp sách hay khám người học sinh (vi phạm pháp luật). Tuyên bố: Cho phép người lỡ cầm số tiền có cơ hội sửa sai bằng cách gửi trả lại kín đáo vào hòm thư góp ý của lớp trước 17h cùng ngày.',
      },
      {
        step: 4,
        title: 'Bước 4: Chứng minh cơ sở khoa học & Xác minh kín đáo',
        content:
          'Vận dụng nguyên tắc bảo vệ danh dự: Trích xuất camera hành lang trường học cùng ban bảo vệ; gặp riêng V. động viên em giữ bình tĩnh. Nếu tìm ra người lấy, gặp riêng học sinh đó và phụ huynh, phân tích động cơ để giáo dục sửa đổi, bảo mật danh tính để học sinh tiếp tục học tập.',
      },
      {
        step: 5,
        title: 'Bước 5: Rút ra bài học sư phạm',
        content:
          'Bài học: Hướng dẫn học sinh kỹ năng quản lý tài chính; tiền quỹ lớp phải chuyển khoản hoặc gửi giáo viên/thủ quỹ nhà trường quản lý, không để học sinh giữ số tiền lớn trong lớp.',
      },
    ],
    pitfallsToAvoid: [
      'Cho đóng cửa lớp rồi lục soát cặp sách, túi quần áo của từng học sinh (vi phạm nghiêm trọng quyền bất khả xâm phạm về thân thể).',
      'Công khai danh tính học sinh trót lấy trộm trước toàn trường khiến em bị xã hội ruồng bỏ.',
    ],
    coreLesson:
      'Lòng tin một khi bị đánh cắp còn quý giá hơn tiền bạc. Người thầy phải giữ gìn lòng tự trọng cho học trò ngay cả khi các em phạm sai lầm.',
  },
  {
    id: 9,
    code: 'B4',
    group: 'B',
    groupName: 'Nhóm B: Quan hệ giữa học sinh và học sinh',
    title:
      'Học sinh lớp 11 nảy sinh tình cảm yêu đương làm ảnh hưởng nghiêm trọng đến kết quả học tập',
    category: 'romance',
    targetGrade: 'Lớp 11 (THPT)',
    context:
      'Em P. (học sinh giỏi Toán) và em Q. (học sinh giỏi Văn) nảy sinh tình cảm yêu đương từ đầu học kỳ II. Gần đây, hai em thường xuyên nhắn tin thâu đêm, ngủ gật trong giờ học và điểm kiểm tra giữa kỳ đồng loạt tụt dốc thảm hại. Phụ huynh em Q. phát hiện nhật ký của con đã đùng đùng nổi giận đến trường yêu cầu GVCN phải can thiệp cấm đoán, chuyển lớp hoặc tách rời hai em ra.',
    question:
      'Vận dụng quy trình 5 bước và đặc điểm tâm sinh lý lứa tuổi thanh thiếu niên, Thầy/Cô hãy đóng vai trò "người dẫn đường" giúp hai em định hướng tình cảm trong sáng mà không làm tổn thương tâm lý.',
    principlesApplied: [
      'Nguyên tắc tôn trọng quy luật phát triển tình cảm lứa tuổi học trò',
      'Nguyên tắc giáo dục giới tính và kỹ năng sống tích cực',
      'Nguyên tắc phối hợp khéo léo giữa nhà trường và gia đình',
    ],
    solutionSteps: [
      {
        step: 1,
        title: 'Bước 1: Phân tích dữ kiện',
        content:
          'Tình cảm học đường là hiện tượng tâm lý bình thường ở tuổi 17; vấn đề nằm ở việc thiếu kỹ năng quản lý thời gian dẫn đến sa sút học tập và phản ứng gay gắt của phụ huynh.',
      },
      {
        step: 2,
        title: 'Bước 2: Biểu đạt mâu thuẫn trung tâm',
        content:
          'Mâu thuẫn giữa nhu cầu tình cảm lãng mạn tự nhiên của tuổi trẻ với nhiệm vụ học tập chuẩn bị cho kỳ thi tốt nghiệp và định hướng tương lai.',
      },
      {
        step: 3,
        title: 'Bước 3: Lựa chọn phương án tối ưu',
        content:
          'Phương án tối ưu: Trấn an phụ huynh trước, giải thích rằng cấm đoán thô bạo sẽ tạo "hiệu ứng Romeo và Juliet" khiến các em bỏ nhà đi hoặc chống đối ngầm. Sau đó gặp riêng từng em trong không khí như một người anh/người chị tin cậy, lắng nghe và đồng cảm.',
      },
      {
        step: 4,
        title: 'Bước 4: Chứng minh cơ sở khoa học & Định hướng hành động',
        content:
          'Vận dụng nguyên tắc biến tình cảm thành động lực: Giáo viên phân tích cho hai em thấy: Tình yêu đẹp ở tuổi học trò là cùng nhau tiến bộ. Đặt ra "giao ước đôi bạn cùng tiến": Đặt mục tiêu cùng đỗ vào trường đại học mơ ước; quy định khung giờ học tập không nhắn tin; nếu điểm bài tới không phục hồi sẽ tự nguyện giãn cách.',
      },
      {
        step: 5,
        title: 'Bước 5: Rút ra bài học sư phạm',
        content:
          'Bài học: Tình yêu tuổi học trò như dòng nước mát, không thể ngăn đắp chặn đứng mà cần được khơi thông dòng chảy hướng về tương lai tươi sáng.',
      },
    ],
    pitfallsToAvoid: [
      'Chế giễu, bêu riếu chuyện tình cảm của học sinh trước lớp hoặc trong các buổi họp phụ huynh.',
      'Đồng tình với phụ huynh áp dụng biện pháp bạo lực, thu giữ điện thoại thô bạo đẩy học sinh vào suy nghĩ tiêu cực.',
    ],
    coreLesson:
      'Đừng dập tắt ngọn lửa rung động đầu đời của tuổi trẻ, hãy dùng sự thấu hiểu sư phạm để biến nó thành nguồn năng lượng thắp sáng tương lai.',
  },
  {
    id: 10,
    code: 'B5',
    group: 'B',
    groupName: 'Nhóm B: Quan hệ giữa học sinh và học sinh',
    title: 'Học sinh khuyết tật hòa nhập bị bạn bè trong lớp trêu chọc về ngoại hình',
    category: 'bullying',
    targetGrade: 'Lớp 6 / 7 (THCS)',
    context:
      'Lớp 6A tiếp nhận em K. là học sinh khuyết tật vận động nhẹ, bước đi khập khiễng và giọng nói hơi ngọng. Giờ ra chơi, một nhóm học sinh nam đã tụ tập nhại lại dáng đi và giọng nói của K. để làm trò cười cho cả lớp. Em K. tủi thân ngồi co ro ở góc lớp, từ chối tham gia mọi hoạt động chung.',
    question:
      'Thầy/Cô hãy áp dụng quy trình 5 bước để xây dựng văn hóa tôn trọng sự khác biệt và môi trường giáo dục hòa nhập an toàn, nhân ái cho học sinh khuyết tật.',
    principlesApplied: [
      'Nguyên tắc giáo dục hòa nhập và bình đẳng cơ hội học tập',
      'Luật Người khuyết tật và Công ước Quốc tế về Quyền Trẻ em',
      'Nguyên tắc bồi dưỡng lòng nhân ái và sự đồng cảm cho học sinh',
    ],
    solutionSteps: [
      {
        step: 1,
        title: 'Bước 1: Phân tích dữ kiện',
        content:
          'Em K. bị kỳ thị ngoại hình; học sinh trêu chọc chủ yếu do thiếu hiểu biết và vô tâm chứ chưa hẳn có ác ý sâu xa.',
      },
      {
        step: 2,
        title: 'Bước 2: Biểu đạt mâu thuẫn trung tâm',
        content:
          'Mâu thuẫn giữa nhu cầu được tôn trọng, hòa nhập bình đẳng của trẻ yếu thế với sự thiếu hụt lòng thấu cảm và nhận thức của học sinh đầu cấp THCS.',
      },
      {
        step: 3,
        title: 'Bước 3: Lựa chọn phương án tối ưu',
        content:
          'Phương án tối ưu: Can thiệp ngay lập tức để bảo vệ K. Nhắc nhở nhóm học sinh dừng lại. Tiết sinh hoạt cuối tuần, tổ chức chuyên đề trải nghiệm "Một giờ làm người khuyết tật": Cho học sinh thử bịt mắt vẽ tranh, buộc chân đi lại để các em tự cảm nhận những khó khăn mà bạn K. phải vượt qua mỗi ngày.',
      },
      {
        step: 4,
        title: 'Bước 4: Chứng minh cơ sở khoa học & Khơi dậy lòng trắc ẩn',
        content:
          'Dựa trên phương thức trải nghiệm và quy luật cảm xúc: Khi học sinh tự mình trải qua khó khăn, lòng trắc ẩn sẽ tự động được đánh thức. Nhóm học sinh trêu chọc sẽ tự giác nói lời xin lỗi K. Giao cho K. những nhiệm vụ phù hợp để em khẳng định năng lực cá nhân trong lớp.',
      },
      {
        step: 5,
        title: 'Bước 5: Rút ra bài học sư phạm',
        content:
          'Bài học: Thước đo sự văn minh của một lớp học chính là cách tập thể ấy đối xử với những thành viên yếu thế nhất.',
      },
    ],
    pitfallsToAvoid: [
      'Mắng mỏ học sinh vi phạm bằng những lời lẽ nhục mạ biến mình thành người bắt nạt thứ hai.',
      'Xem sự việc là "trẻ con đùa vui thôi" mà bỏ qua, dung túng cho mầm mống kỳ thị phát triển.',
    ],
    coreLesson:
      'Giáo dục hòa nhập không chỉ là đưa trẻ khuyết tật vào lớp học, mà là đưa tình thương và sự tôn trọng vào trái tim của mọi đứa trẻ.',
  },

  // --------------------------------------------------------------------------
  // NHÓM C: QUAN HỆ GIỮA GIÁO VIÊN VÀ CHA MẸ HỌC SINH (TÌNH HUỐNG C1 - C5)
  // --------------------------------------------------------------------------
  {
    id: 11,
    code: 'C1',
    group: 'C',
    groupName: 'Nhóm C: Quan hệ giữa giáo viên và cha mẹ học sinh',
    title:
      'Phụ huynh đến trường to tiếng xúc phạm giáo viên vì cho rằng con mình bị đối xử bất công',
    category: 'parent',
    targetGrade: 'Lớp 10 / 11 (THPT)',
    context:
      'Ngay đầu giờ sáng, phụ huynh của em H. xông thẳng vào phòng chờ giáo viên, chỉ tay vào mặt cô giáo chủ nhiệm to tiếng quát mắng trước sự chứng kiến của nhiều đồng nghiệp và học sinh: "Cô dạy dỗ kiểu gì mà trù dập con tôi? Con tôi đi học thêm cô thì điểm cao, đợt này tôi cho nghỉ học thêm là cô hạ xuống điểm kém ngay! Đừng tưởng làm giáo viên mà muốn làm gì thì làm!".',
    question:
      'Trong tình thế bất ngờ và bị xúc phạm công khai như vậy, Thầy/Cô sẽ xử lý theo quy trình 5 bước như thế nào để giữ vững phẩm giá nhà giáo, bảo đảm an toàn và làm sáng tỏ sự việc?',
    principlesApplied: [
      'Nguyên tắc kiềm chế cảm xúc sư phạm và bảo vệ phẩm giá nhà giáo',
      'Quy chuẩn văn hóa ứng xử trường học theo Thông tư 06/2019/TT-BGDĐT',
      'Nguyên tắc giải quyết tranh chấp dựa trên minh chứng và pháp lý',
    ],
    solutionSteps: [
      {
        step: 1,
        title: 'Bước 1: Phân tích dữ kiện & Bảo vệ không gian sư phạm',
        content:
          'Phụ huynh đang ở đỉnh điểm của cơn thịnh nộ, mất kiểm soát hành vi và có lời lẽ xúc phạm danh dự nhà giáo tại không gian công cộng.',
      },
      {
        step: 2,
        title: 'Bước 2: Biểu đạt mâu thuẫn trung tâm',
        content:
          'Mâu thuẫn giữa định kiến tiêu cực của phụ huynh về việc "trù dập vì không học thêm" với nguyên tắc đánh giá khách quan của giáo viên.',
      },
      {
        step: 3,
        title: 'Bước 3: Lựa chọn phương án tối ưu',
        content:
          'Phương án tối ưu: Tuyệt đối không đôi co tranh cãi tại phòng chờ. Điềm tĩnh nói: "Tôi rất hiểu sự lo lắng của phụ huynh đối với kết quả của cháu. Tuy nhiên đây là phòng chờ giáo viên trước giờ lên lớp. Kính mời phụ huynh sang Phòng tiếp dân của nhà trường để chúng ta cùng làm việc văn minh". Đồng thời báo cho bộ phận bảo vệ và Ban Giám hiệu.',
      },
      {
        step: 4,
        title: 'Bước 4: Chứng minh cơ sở khoa học & Đối thoại bằng minh chứng',
        content:
          'Tại phòng tiếp dân có sự tham gia của BGH: Mời phụ huynh uống nước để hạ hỏa. Mang toàn bộ bài kiểm tra, đề thi, barem điểm chuẩn và bảng điểm của cả lớp ra đối chiếu. Chứng minh rõ bài kiểm tra của em H. bị điểm kém do những lỗi kiến thức cụ thể nào. Khẳng định giáo viên không tổ chức dạy thêm sai quy định và luôn công tâm.',
      },
      {
        step: 5,
        title: 'Bước 5: Rút ra bài học sư phạm',
        content:
          'Bài học: Sự minh bạch và điềm đạm trước cơn giận là vũ khí sắc bén nhất bảo vệ nhân cách nhà giáo. Sau buổi làm việc, phụ huynh sẽ nhận thức được sự hấp tấp của mình và tôn trọng giáo viên hơn.',
      },
    ],
    pitfallsToAvoid: [
      'Nổi nóng cãi nhau tay đôi, dùng lời lẽ xúc phạm đáp trả phụ huynh làm sụp đổ hình ảnh nhà giáo.',
      'Sợ hãi nhận lỗi bừa hoặc hứa nâng điểm cho học sinh để xong chuyện.',
    ],
    coreLesson:
      'Điềm tĩnh trước sự giận dữ của phụ huynh không phải là yếu thế, mà là biểu hiện của bản lĩnh sư phạm và sự tự tin vào tính liêm chính của mình.',
  },
  {
    id: 12,
    code: 'C2',
    group: 'C',
    groupName: 'Nhóm C: Quan hệ giữa giáo viên và cha mẹ học sinh',
    title: 'Phụ huynh kiên quyết phó mặc việc giáo dục con cho nhà trường với lý do bận kinh doanh',
    category: 'parent',
    targetGrade: 'Lớp 8 / 9 (THCS)',
    context:
      'Trong buổi họp cha mẹ học sinh đầu năm, khi GVCN trao đổi về việc em T. thường xuyên thiếu bài tập về nhà và đề nghị gia đình dành 30 phút mỗi tối đồng hành cùng con, bố em T. (một doanh nhân thành đạt) ngắt lời: "Tôi bận trăm công nghìn việc kiếm tiền, thời gian đâu mà kèm con! Tôi đóng đủ tiền học phí, tiền bán trú cho trường thì trách nhiệm dạy dỗ con nên người là của thầy cô. Trường nhận tiền mà còn đùn đẩy việc cho phụ huynh à?".',
    question:
      'Thầy/Cô hãy áp dụng quy trình 5 bước và Luật Giáo dục 2019 để thuyết phục phụ huynh hiểu đúng về vai trò không thể thay thế của gia đình trong việc phát triển nhân cách trẻ.',
    principlesApplied: [
      'Nguyên tắc phối hợp ba môi trường giáo dục: Nhà trường - Gia đình - Xã hội (Luật Giáo dục 2019 Điều 89–93)',
      'Tâm lý học lứa tuổi về nhu cầu gắn kết tình cảm gia đình',
      'Nghệ thuật giao tiếp và thuyết phục phụ huynh học sinh',
    ],
    solutionSteps: [
      {
        step: 1,
        title: 'Bước 1: Phân tích dữ kiện',
        content:
          'Phụ huynh có nhận thức sai lệch, xem giáo dục là dịch vụ mua bán thuần túy và ngộ nhận rằng tiền bạc có thể thay thế tình cảm và sự đồng hành của cha mẹ.',
      },
      {
        step: 2,
        title: 'Bước 2: Biểu đạt mâu thuẫn trung tâm',
        content:
          'Mâu thuẫn giữa nhu cầu tình cảm, sự hướng dẫn của gia đình ở lứa tuổi dậy thì với lối sống bận rộn, phó mặc của phụ huynh.',
      },
      {
        step: 3,
        title: 'Bước 3: Lựa chọn phương án tối ưu',
        content:
          'Phương án tối ưu: Lắng nghe và thấu cảm với sự vất vả mưu sinh của phụ huynh: "Nhà trường vô cùng trân trọng sự vất vả của anh để lo cho cháu một tương lai đủ đầy vật chất. Tuy nhiên, có những điều tiền bạc của anh không thể mua được, đó là sự hiện diện của người cha trong quá trình trưởng thành của con".',
      },
      {
        step: 4,
        title: 'Bước 4: Chứng minh cơ sở khoa học & Đề xuất giải pháp khả thi',
        content:
          'Trích dẫn Điều 90 Luật Giáo dục 2019 về trách nhiệm của cha mẹ. Chia sẻ tâm sự của chính em T. trong bài văn: "Em thèm một bữa cơm có bố ngồi cùng". Đề xuất giải pháp thực tế: Không yêu cầu phụ huynh phải dạy kiến thức nâng cao, chỉ cần 15 phút mỗi tối hỏi thăm con một câu: "Hôm nay ở trường có gì vui không con?".',
      },
      {
        step: 5,
        title: 'Bước 5: Rút ra bài học sư phạm',
        content:
          'Bài học: Người thầy cần là chiếc cầu nối hàn gắn mối quan hệ giữa cha mẹ và con cái, giúp phụ huynh thức tỉnh trước khi quá muộn.',
      },
    ],
    pitfallsToAvoid: [
      'Chỉ trích phụ huynh là "thiếu trách nhiệm, tham tiền bỏ rơi con cái" gây phản ứng tự ái và cắt đứt liên lạc.',
      'Đồng ý với phụ huynh nhận dạy kèm riêng có thu tiền để làm thay trách nhiệm gia đình.',
    ],
    coreLesson:
      'Nhà trường dạy tri thức, nhưng gia đình mới là cái nôi nuôi dưỡng tâm hồn. Không của cải nào bù đắp được sự thiếu vắng tình thương cha mẹ.',
  },
  {
    id: 13,
    code: 'C3',
    group: 'C',
    groupName: 'Nhóm C: Quan hệ giữa giáo viên và cha mẹ học sinh',
    title: 'Phụ huynh muốn chuyển lớp cho con vì không đồng tình với phong cách giảng dạy của GVCN',
    category: 'parent',
    targetGrade: 'Lớp 10 (THPT)',
    context:
      'Sau một tháng đầu năm học, phụ huynh của em A. nộp đơn lên Ban Giám hiệu xin chuyển lớp cho con sang lớp chọn khác. Phụ huynh nêu lý do: GVCN hiện tại quá khắt khe, thường xuyên giao bài tập dự án phức tạp bắt học sinh phải làm việc nhóm nhiều, làm mất thời gian tự học của con họ để thi các chứng chỉ quốc tế IELTS/SAT.',
    question:
      'Với vai trò là GVCN trong tình huống này, Thầy/Cô sẽ tiến hành quy trình 5 bước như thế nào để đối thoại với phụ huynh và BGH, bảo vệ triết lý đổi mới giáo dục phát triển năng lực?',
    principlesApplied: [
      'Nguyên tắc đổi mới phương pháp dạy học theo định hướng phát triển phẩm chất, năng lực (CT GDPT 2018)',
      'Nguyên tắc dân chủ và cầu thị lắng nghe ý kiến phụ huynh',
      'Kỹ năng truyền thông và giải thích chủ trương giáo dục cho cha mẹ học sinh',
    ],
    solutionSteps: [
      {
        step: 1,
        title: 'Bước 1: Phân tích dữ kiện',
        content:
          'Phụ huynh có tư duy truyền thống (chỉ chú trọng điểm số thi cử cá nhân), chưa hiểu được mục tiêu phát triển kỹ năng mềm (làm việc nhóm, thuyết trình) của Chương trình 2018.',
      },
      {
        step: 2,
        title: 'Bước 2: Biểu đạt mâu thuẫn trung tâm',
        content:
          'Mâu thuẫn giữa định hướng giáo dục toàn diện của nhà trường với mục tiêu thực dụng trước mắt của phụ huynh.',
      },
      {
        step: 3,
        title: 'Bước 3: Lựa chọn phương án tối ưu',
        content:
          'Phương án tối ưu: Chủ động xin gặp phụ huynh và BGH trong buổi trao đổi chân tình. Lắng nghe nguyện vọng của phụ huynh; khẳng định ủng hộ mục tiêu thi chứng chỉ quốc tế của em A.',
      },
      {
        step: 4,
        title: 'Bước 4: Chứng minh cơ sở khoa học & Điều chỉnh khối lượng',
        content:
          'Phân tích cho phụ huynh thấy: Kỹ năng hợp tác nhóm và giải quyết vấn đề chính là tiêu chí tuyển sinh hàng đầu của các trường đại học quốc tế. Đưa ra các minh chứng về sự tiến bộ của em A. sau 1 tháng. Đồng thời cam kết sẽ cân đối lại thời lượng dự án để học sinh không bị quá tải.',
      },
      {
        step: 5,
        title: 'Bước 5: Rút ra bài học sư phạm',
        content:
          'Bài học: Mọi sự đổi mới phương pháp giảng dạy đều cần đi đôi với công tác truyền thông, giải thích rõ ràng cho phụ huynh để nhận được sự đồng thuận.',
      },
    ],
    pitfallsToAvoid: [
      'Tự ái, nói với phụ huynh: "Thích chuyển thì cứ chuyển đi, lớp này không giữ".',
      'Hoảng sợ lập tức hủy bỏ toàn bộ phương pháp dạy học dự án tích cực để quay về dạy học truyền thụ một chiều.',
    ],
    coreLesson:
      'Đổi mới giáo dục chỉ thành công khi người thầy biết kiên trì thuyết phục và đưa phụ huynh trở thành đối tác đồng hành thay vì lực cản.',
  },
  {
    id: 14,
    code: 'C4',
    group: 'C',
    groupName: 'Nhóm C: Quan hệ giữa giáo viên và cha mẹ học sinh',
    title: 'Phụ huynh đề nghị tặng quà giá trị lớn để giáo viên nâng điểm tổng kết cho học sinh',
    category: 'integrity',
    targetGrade: 'Lớp 12 (THPT)',
    context:
      'Cuối năm học lớp 12, để đủ điều kiện xét tuyển học bạ vào một trường đại học tốp đầu, học sinh K. cần điểm trung bình môn Toán đạt từ 8.5 trở lên, trong khi điểm thực tế của em chỉ đạt 7.6. Phụ huynh em K. đã đến tận nhà riêng của giáo viên, mang theo phong bì tiền mặt trị giá 20 triệu đồng và thiết tha xin cô giáo "nâng đỡ sửa điểm bài kiểm tra cuối kỳ cho cháu vì tương lai cả đời của cháu".',
    question:
      'Thầy/Cô hãy áp dụng quy trình 5 bước và các chuẩn mực đạo đức nhà giáo để từ chối món quà trên một cách kiên quyết nhưng khéo léo, giữ vững danh dự người thầy mà không làm bẽ mặt phụ huynh.',
    principlesApplied: [
      'Chuẩn nghề nghiệp giáo viên cơ sở GDPT (Thông tư 20/2018/TT-BGDĐT — Tiêu chuẩn 1: Đạo đức nhà giáo)',
      'Quy chế đánh giá học sinh THPT (Thông tư 22/2021/TT-BGDĐT)',
      'Nghệ thuật từ chối tinh tế và nhân văn',
    ],
    solutionSteps: [
      {
        step: 1,
        title: 'Bước 1: Phân tích dữ kiện',
        content:
          'Hành vi xin điểm bằng vật chất có dấu hiệu hối lộ, vi phạm nghiêm trọng đạo đức nhà giáo và quy chế chuyên môn.',
      },
      {
        step: 2,
        title: 'Bước 2: Biểu đạt mâu thuẫn trung tâm',
        content:
          'Mâu thuẫn giữa tình thương con mù quáng của phụ huynh với sự liêm chính học thuật và tính công bằng đối với mọi học sinh trong trường.',
      },
      {
        step: 3,
        title: 'Bước 3: Lựa chọn phương án tối ưu',
        content:
          'Phương án tối ưu: Tuyệt đối không chạm vào phong bì. Giữ thái độ hòa nhã, pha trà mời phụ huynh và nói lời từ chối dứt khoát nhưng thấu cảm: "Tôi rất hiểu lòng cha mẹ thương con và khát khao của gia đình. Nhưng tôi xin phép từ chối nhận món quà này. Nghề giáo chúng tôi coi danh dự quý hơn tiền bạc. Nếu tôi sửa điểm, tôi không chỉ vi phạm pháp luật mà còn dạy cho cháu bài học sai lầm rằng đồng tiền có thể mua được sự bất công".',
      },
      {
        step: 4,
        title: 'Bước 4: Chứng minh cơ sở khoa học & Tư vấn giải pháp đúng đắn',
        content:
          'Phân tích cho phụ huynh thấy: Hiện nay các trường đại học có nhiều phương thức xét tuyển (kết hợp thi tốt nghiệp, thi đánh giá năng lực). Năng lực thực chất của em K. là 7.6 hoàn toàn có thể thi đỗ vào các ngành học phù hợp. Động viên gia đình đồng hành cùng con ôn thi nghiêm túc trong giai đoạn nước rút.',
      },
      {
        step: 5,
        title: 'Bước 5: Rút ra bài học sư phạm',
        content:
          'Bài học: Người thầy giữ được sự trong sạch trước cám dỗ vật chất chính là tấm gương sáng nhất về nhân cách cho học trò noi theo suốt đời.',
      },
    ],
    pitfallsToAvoid: [
      'Gật đầu nhận quà và sửa điểm trong hệ thống quản lý điểm số (vi phạm pháp luật, bị xử lý kỷ luật hoặc truy cứu trách nhiệm hình sự).',
      'Quát mắng, đuổi phụ huynh ra khỏi nhà hoặc đem chuyện gia đình đi kể cho các giáo viên khác nghe.',
    ],
    coreLesson:
      'Điểm số giả tạo chỉ mang lại sự đỗ đạt nhất thời, nhưng cái giá phải trả là sự tha hóa nhân cách của cả thầy và trò.',
  },
  {
    id: 15,
    code: 'C5',
    group: 'C',
    groupName: 'Nhóm C: Quan hệ giữa giáo viên và cha mẹ học sinh',
    title:
      'Phụ huynh phản đối việc con tham gia các hoạt động thiện nguyện, trải nghiệm của trường',
    category: 'parent',
    targetGrade: 'Lớp 10 / 11 (THPT)',
    context:
      'Đoàn trường phát động chiến dịch "Mùa hè xanh" và hoạt động trải nghiệm dọn dẹp vệ sinh môi trường, thăm hỏi mẹ Việt Nam anh hùng tại địa phương trong 1 ngày thứ Bảy. Khi học sinh đem phiếu đồng thuận về ký, phụ huynh em T. đã viết giấy phản đối gửi GVCN: "Gia đình tôi cho con đi học văn hóa để thi đại học chứ không phải để đi làm lao động không công cho nhà trường. Thứ Bảy cháu phải đi học thêm, tôi cấm tuyệt đối không cho tham gia!".',
    question:
      'Thầy/Cô hãy áp dụng quy trình 5 bước để giải thích cho phụ huynh hiểu rõ giá trị nhân văn và tính pháp lý của Hoạt động trải nghiệm theo Chương trình GDPT 2018.',
    principlesApplied: [
      'Nguyên tắc giáo dục gắn liền với lao động và thực tiễn xã hội',
      'Mục tiêu giáo dục toàn diện phẩm chất Nhân ái và Trách nhiệm (CT GDPT 2018)',
      'Quy định pháp lý của Thông tư 32/2018: HĐTN là hoạt động giáo dục bắt buộc',
    ],
    solutionSteps: [
      {
        step: 1,
        title: 'Bước 1: Phân tích dữ kiện',
        content:
          'Phụ huynh ngộ nhận hoạt động trải nghiệm là việc làm vô bổ, thiếu thông tin về tính bắt buộc trong chương trình giáo dục quốc gia.',
      },
      {
        step: 2,
        title: 'Bước 2: Biểu đạt mâu thuẫn trung tâm',
        content:
          'Mâu thuẫn giữa lối sống khép kín, vị kỷ, coi nhẹ kỹ năng xã hội với mục tiêu đào tạo con người có trách nhiệm cộng đồng.',
      },
      {
        step: 3,
        title: 'Bước 3: Lựa chọn phương án tối ưu',
        content:
          'Phương án tối ưu: Gọi điện thoại trao đổi riêng với phụ huynh trong không khí cởi mở. Giải thích rõ ràng về căn cứ pháp lý: Hoạt động trải nghiệm là môn học/hoạt động bắt buộc có đánh giá xếp loại theo quy định của Bộ GD&ĐT.',
      },
      {
        step: 4,
        title: 'Bước 4: Chứng minh cơ sở khoa học & Phân tích giá trị giáo dục',
        content:
          'Chỉ ra cho phụ huynh thấy: Những học sinh chỉ vùi đầu vào sách vở thường thiếu kỹ năng giao tiếp và khả năng thích ứng cuộc sống. Một buổi đi thăm mẹ Việt Nam anh hùng sẽ bồi đắp lòng biết ơn sâu sắc hơn hàng trăm bài giảng đạo đức khô khan. Cam kết nhà trường đảm bảo an toàn tuyệt đối cho các em.',
      },
      {
        step: 5,
        title: 'Bước 5: Rút ra bài học sư phạm',
        content:
          'Bài học: Kế hoạch tổ chức hoạt động trải nghiệm cần được phổ biến chi tiết đến phụ huynh từ đầu năm, nêu rõ mục tiêu giáo dục để gia đình hoàn toàn yên tâm.',
      },
    ],
    pitfallsToAvoid: [
      'Đe dọa hạ hạnh kiểm học sinh nếu không tham gia khiến phụ huynh bức xúc khiếu nại.',
      'Dễ dãi cho học sinh nghỉ mà không có tác động giáo dục làm các học sinh khác bắt chước né tránh.',
    ],
    coreLesson:
      'Học tập không chỉ diễn ra sau bốn bức tường lớp học. Bước ra ngoài cuộc đời để cống hiến chính là bài học lớn nhất của sự trưởng thành.',
  },

  // --------------------------------------------------------------------------
  // NHÓM D: GIÁO DỤC HỌC SINH CÁ BIỆT & HOÀN CẢNH ĐẶC BIỆT (TÌNH HUỐNG D1 - D5)
  // --------------------------------------------------------------------------
  {
    id: 16,
    code: 'D1',
    group: 'D',
    groupName: 'Nhóm D: Giáo dục học sinh cá biệt & hoàn cảnh đặc biệt',
    title: 'Học sinh có biểu hiện trầm cảm, tự cô lập và thường xuyên bỏ tiết không rõ lý do',
    category: 'insubordination',
    targetGrade: 'Lớp 11 (THPT)',
    context:
      'Gần đây, em L. (học sinh nữ lớp 11) có những biểu hiện tâm lý bất thường: em luôn mặc áo khoác trùm kín đầu, mắt thâm quầng, từ chối giao tiếp với bạn bè. Trong 2 tuần qua, L. đã bỏ 6 tiết học, thường xuyên trốn một mình ở góc cầu thang tối. Lớp trưởng phát hiện trên cổ tay L. có nhiều vết rạch nông còn rớm máu.',
    question:
      'Nhận diện dấu hiệu của khủng hoảng tâm lý và hành vi tự hại, Thầy/Cô hãy triển khai quy trình 5 bước xử lý khẩn cấp để cứu giúp học sinh, bảo đảm tính mạng và phục hồi sức khỏe tinh thần.',
    principlesApplied: [
      'Nguyên tắc ưu tiên an toàn tính mạng và can thiệp khủng hoảng tâm lý học đường',
      'Quy trình tư vấn tâm lý học đường theo Thông tư 31/2017/TT-BGDĐT',
      'Nguyên tắc bảo mật thông tin nhạy cảm của người học',
    ],
    solutionSteps: [
      {
        step: 1,
        title: 'Bước 1: Phân tích dữ kiện & Đánh giá mức độ nguy hiểm',
        content:
          'Học sinh có dấu hiệu trầm cảm nặng và hành vi tự hại (self-harm), đây là tình trạng báo động đỏ về an toàn tính mạng.',
      },
      {
        step: 2,
        title: 'Bước 2: Biểu đạt mâu thuẫn trung tâm',
        content:
          'Mâu thuẫn giữa nỗi đau khổ dồn nén bên trong tâm lý học sinh với sự bất lực không thể tìm ra lối thoát hoặc không thể giãi bày cùng gia đình.',
      },
      {
        step: 3,
        title: 'Bước 3: Lựa chọn phương án tối ưu',
        content:
          'Phương án tối ưu: Không để học sinh ở một mình bất kỳ phút nào. Phân công cán sự nữ đồng hành kín đáo. Báo cáo ngay với BGH và chuyên viên tư vấn tâm lý học đường. Liên hệ khẩn cấp với cha mẹ học sinh đến trường để thông báo tình hình với thái độ thấu cảm, không phán xét.',
      },
      {
        step: 4,
        title: 'Bước 4: Chứng minh cơ sở khoa học & Can thiệp chuyên sâu',
        content:
          'Khuyên gia đình đưa L. đến bệnh viện tâm thần hoặc trung tâm trị liệu tâm lý uy tín để được bác sĩ chuyên khoa thăm khám và điều trị kịp thời. GVCN và bạn bè trong lớp gửi những thông điệp yêu thương, không tạo áp lực học tập và bài thi trong giai đoạn này.',
      },
      {
        step: 5,
        title: 'Bước 5: Rút ra bài học sư phạm',
        content:
          'Bài học: Nhà trường cần đẩy mạnh công tác tư vấn tâm lý học đường và xây dựng "hộp thư điều em muốn nói" để phát hiện sớm các dấu hiệu trầm cảm tuổi học trò.',
      },
    ],
    pitfallsToAvoid: [
      'Xem nhẹ, phán xét: "Bày đặt trầm cảm, làm màu để trốn học".',
      'Lan truyền câu chuyện tự hại của học sinh làm em cảm thấy bị coi là "kẻ điên" và thúc đẩy hành vi tự sát.',
    ],
    coreLesson:
      'Lắng nghe không phán xét trước nỗi đau của học trò có thể cứu sống một mạng người. Sự nhạy cảm sư phạm là ngọn hải đăng trong bóng tối.',
  },
  {
    id: 17,
    code: 'D2',
    group: 'D',
    groupName: 'Nhóm D: Giáo dục học sinh cá biệt & hoàn cảnh đặc biệt',
    title:
      'Học sinh giỏi có cá tính dị biệt, không chấp hành các quy định sinh hoạt tập thể của lớp',
    category: 'insubordination',
    targetGrade: 'Lớp 11 / 12 (THPT)',
    context:
      'Em K. là học sinh đạt giải Nhất kỳ thi Học sinh giỏi cấp tỉnh môn Tin học, nhưng lại có cá tính rất ngang bướng: em không bao giờ chịu mặc đồng phục đúng ngày, từ chối tham gia trực nhật lớp, không tham gia các buổi sinh hoạt ngoại khóa và thường có lời lẽ coi thường các bạn học lực trung bình: "Mấy việc lau bảng quét lớp là việc của mấy đứa lười học, tôi phải dành thời gian nghiên cứu thuật toán".',
    question:
      'Thầy/Cô hãy áp dụng quy trình 5 bước để uốn nắn thái độ ngạo mạn của K., giúp em phát triển tài năng đi đôi với nhân cách mà không làm thui chột niềm đam mê khoa học.',
    principlesApplied: [
      'Nguyên tắc giáo dục toàn diện "Tài phải đi đôi với Đức"',
      'Nguyên tắc giáo dục trong tập thể và phát huy ưu điểm để khắc phục nhược điểm',
      'Phương pháp giao việc và khơi gợi trách nhiệm xã hội của người có năng khiếu',
    ],
    solutionSteps: [
      {
        step: 1,
        title: 'Bước 1: Phân tích dữ kiện',
        content:
          'K. có tài năng thực sự nhưng bị lệch lạc về nhận thức, ngộ nhận rằng người giỏi có quyền đứng trên kỷ luật tập thể.',
      },
      {
        step: 2,
        title: 'Bước 2: Biểu đạt mâu thuẫn trung tâm',
        content:
          'Mâu thuẫn giữa sự phát triển vượt trội về trí tuệ với sự non nớt về trí tuệ cảm xúc (EQ) và ý thức công dân.',
      },
      {
        step: 3,
        title: 'Bước 3: Lựa chọn phương án tối ưu',
        content:
          'Phương án tối ưu: Không dùng quyền lực thầy cô để triệt hạ cái tôi của K., nhưng kiên quyết không thỏa hiệp với thái độ coi thường kỷ luật. Gặp riêng K., thừa nhận tài năng của em nhưng phân tích: "Một thuật toán xuất sắc nếu phục vụ một con người ích kỷ thì không mang lại giá trị cho xã hội. Người thành công lớn là người biết hòa nhập và nâng đỡ người khác".',
      },
      {
        step: 4,
        title: 'Bước 4: Chứng minh cơ sở khoa học & Giao trọng trách tập thể',
        content:
          'Vận dụng nguyên tắc phát huy ưu điểm: Giao cho K. phụ trách câu lạc bộ Tin học của trường hoặc làm trưởng nhóm dự án chuyển đổi số của lớp, phân công em dạy kèm tin học cho các bạn còn yếu. Qua việc dạy bạn, K. sẽ học được tính kiên nhẫn, sự tôn trọng và hiểu được giá trị của sự phục vụ.',
      },
      {
        step: 5,
        title: 'Bước 5: Rút ra bài học sư phạm',
        content:
          'Bài học: Đào tạo học sinh giỏi không chỉ là luyện giải bài tập khó, mà là rèn luyện tấm lòng phụng sự cộng đồng.',
      },
    ],
    pitfallsToAvoid: [
      'Nuông chiều, cho phép học sinh giỏi được miễn trừ mọi nội quy trường học tạo tiền lệ xấu cho cả lớp.',
      'Trù dập, cấm học sinh đi thi học sinh giỏi để "bẻ gãy ý chí" của em.',
    ],
    coreLesson:
      'Tài năng không đi kèm nhân cách mẫu mực chỉ tạo ra những cỗ máy thông minh ích kỷ. Người thầy vĩ đại là người biết uốn nắn cái tài thành cái tâm.',
  },
  {
    id: 18,
    code: 'D3',
    group: 'D',
    groupName: 'Nhóm D: Giáo dục học sinh cá biệt & hoàn cảnh đặc biệt',
    title: 'Học sinh có bố mẹ vừa ly hôn, tâm lý xáo trộn dẫn đến sa sút học lực đột ngột',
    category: 'parent',
    targetGrade: 'Lớp 8 (THCS)',
    context:
      'Em N. vốn là một nữ sinh ngoan ngoãn, học lực giỏi của lớp 8. Một tháng nay, bố mẹ N. ly hôn và tranh chấp tài sản ồn ào. N. phải chuyển về sống với bà ngoại già yếu. Em trở nên cáu kỉnh, thường xuyên không chép bài, điểm số tụt dốc thê thảm và bắt đầu kết bạn với nhóm thanh niên lêu lổng ngoài cổng trường để tìm sự quan tâm.',
    question:
      'Thầy/Cô hãy áp dụng quy trình 5 bước để trở thành chỗ dựa tinh thần cho em N., ngăn chặn nguy cơ sa ngã và giúp em vững vàng vượt qua biến cố gia đình.',
    principlesApplied: [
      'Nguyên tắc đảm bảo tính nhân văn và tình thương yêu sư phạm sâu sắc',
      'Nguyên tắc phối hợp linh hoạt giữa nhà trường và người giám hộ thực tế',
      'Liệu pháp nâng đỡ tâm lý cho trẻ trải qua sang chấn ly hôn gia đình',
    ],
    solutionSteps: [
      {
        step: 1,
        title: 'Bước 1: Phân tích dữ kiện',
        content:
          'N. đang bị tổn thương tinh thần sâu sắc do gia đình tan vỡ; em tìm đến nhóm bạn xấu vì cảm giác bị bỏ rơi và thiếu thốn tình cảm.',
      },
      {
        step: 2,
        title: 'Bước 2: Biểu đạt mâu thuẫn trung tâm',
        content:
          'Mâu thuẫn giữa nhu cầu có một mái ấm bình yên với thực tế đổ vỡ của người lớn khiến học sinh mất phương hướng sống.',
      },
      {
        step: 3,
        title: 'Bước 3: Lựa chọn phương án tối ưu',
        content:
          'Phương án tối ưu: Chủ động đến nhà thăm em và bà ngoại. Trò chuyện ấm áp, lắng nghe em khóc và giải tỏa nỗi ấm ức: "Bố mẹ có quyết định riêng của người lớn, nhưng điều đó không làm thay đổi giá trị của con và con không có lỗi trong chuyện này". Khẳng định cô và cả lớp luôn là gia đình thứ hai của em.',
      },
      {
        step: 4,
        title: 'Bước 4: Chứng minh cơ sở khoa học & Mạng lưới hỗ trợ',
        content:
          'Liên hệ trực tiếp với cả bố và mẹ N., cảnh báo họ về nguy cơ con gái bị sa ngã và yêu cầu họ gạt bỏ bất hòa để cùng có trách nhiệm quan tâm đến con. Trong lớp, phân công nhóm bạn thân rủ N. cùng học bài và tham gia hoạt động thể thao ngoại khóa để em không có khoảng trống cảm xúc tiêu cực.',
      },
      {
        step: 5,
        title: 'Bước 5: Rút ra bài học sư phạm',
        content:
          'Bài học: Khi gia đình của học sinh không còn là bến đỗ bình yên, thì lớp học của người thầy phải trở thành ngôi nhà che chở cho các em.',
      },
    ],
    pitfallsToAvoid: [
      'Chỉ trích em học hành sa sút trước lớp hoặc phê bình trong sổ liên lạc gửi phụ huynh.',
      'Tò mò bàn tán chuyện bố mẹ học sinh ly hôn với người ngoài làm tổn thương danh dự của em.',
    ],
    coreLesson:
      'Những đứa trẻ mang vết thương gia đình cần nhiều hơn gấp đôi tình thương từ thầy cô để không bị gục ngã trước ngưỡng cửa cuộc đời.',
  },
  {
    id: 19,
    code: 'D4',
    group: 'D',
    groupName: 'Nhóm D: Giáo dục học sinh cá biệt & hoàn cảnh đặc biệt',
    title: 'Học sinh thường xuyên đi học trễ do phải phụ giúp gia đình mưu sinh lúc rạng sáng',
    category: 'parent',
    targetGrade: 'Lớp 10 (THPT)',
    context:
      'Em V. trong 3 tuần qua đã đi học trễ 8 lần (thường đến lớp lúc 7h30 sau khi tiết 1 đã bắt đầu 15 phút). Giám thị nhắc nhở và lớp bị trừ điểm thi đua nề nếp. Khi bị GVCN hỏi, V. chỉ cúi đầu xin lỗi mà không giải thích. Tìm hiểu qua hàng xóm, cô giáo mới biết mẹ V. bị suy thận giai đoạn cuối, sáng nào từ 3h đến 6h30 em cũng phải đi phụ bốc vác rau củ ở chợ đầu mối kiếm tiền thuốc men cho mẹ rồi mới vội vã đạp xe đến trường.',
    question:
      'Biết được hoàn cảnh ngặt nghèo của học sinh, Thầy/Cô hãy xử lý tình huống theo quy trình 5 bước để vừa hỗ trợ em tiếp tục học tập, vừa bảo đảm kỷ cương nề nếp chung.',
    principlesApplied: [
      'Nguyên tắc kết hợp tính nghiêm túc của kỷ cương với lòng nhân ái bao dung',
      'Nguyên tắc tìm hiểu kỹ hoàn cảnh thực tế của học sinh',
      'Huy động sức mạnh tương thân tương ái của các lực lượng xã hội',
    ],
    solutionSteps: [
      {
        step: 1,
        title: 'Bước 1: Phân tích dữ kiện',
        content:
          'Học sinh vi phạm nề nếp vì lý do hoàn cảnh mưu sinh éo le, hiếu thảo với mẹ nhưng đang đứng trước nguy cơ bị kỷ luật và bỏ học vì kiệt sức.',
      },
      {
        step: 2,
        title: 'Bước 2: Biểu đạt mâu thuẫn trung tâm',
        content:
          'Mâu thuẫn giữa quy định nghiêm ngặt của nội quy giờ giấc với hoàn cảnh sinh tồn khắc nghiệt của học sinh nghèo.',
      },
      {
        step: 3,
        title: 'Bước 3: Lựa chọn phương án tối ưu',
        content:
          'Phương án tối ưu: Gặp riêng V., nắm tay em và nói lời xúc động: "Cô đã biết lý do em đi trễ. Cô rất khâm phục tấm lòng hiếu thảo của em, nhưng em không thể đơn độc gánh vác việc này mãi được". Đề xuất với BGH và Đoàn trường cơ chế hỗ trợ đặc thù cho em, tạm thời linh hoạt điểm danh trong khi tìm giải pháp căn cơ.',
      },
      {
        step: 4,
        title: 'Bước 4: Chứng minh cơ sở khoa học & Vận động nguồn lực hỗ trợ',
        content:
          'GVCN kết nối với Hội Khuyến học nhà trường, Hội Cha mẹ học sinh và các nhà hảo tâm xin học bổng toàn phần và hỗ trợ chi phí chạy thận cho mẹ V. Phân công các bạn trong tổ ghi chép bài tiết 1 giúp V. và hướng dẫn em phương pháp tự học bù.',
      },
      {
        step: 5,
        title: 'Bước 5: Rút ra bài học sư phạm',
        content:
          'Bài học: Kỷ luật trường học sinh ra là vì con người chứ không phải để nghiền nát con người. Sự thấu hiểu hoàn cảnh là khởi đầu của giáo dục nhân văn.',
      },
    ],
    pitfallsToAvoid: [
      'Cứng nhắc trừ điểm thi đua, bắt học sinh đứng ngoài cổng trường hoặc đình chỉ học vì đi trễ quá số buổi quy định.',
      'Kể lể hoàn cảnh của em một cách bi lụy làm tổn thương lòng tự trọng của một người con giàu nghị lực.',
    ],
    coreLesson:
      'Đằng sau mỗi lần đi trễ có thể là một gánh nặng mưu sinh nhọc nhằn. Trái tim người thầy phải đủ rộng để ôm trọn nỗi nhọc nhằn của trò.',
  },
  {
    id: 20,
    code: 'D5',
    group: 'D',
    groupName: 'Nhóm D: Giáo dục học sinh cá biệt & hoàn cảnh đặc biệt',
    title: 'Học sinh có dấu hiệu bị bạo lực gia đình nhưng giấu giếm không dám chia sẻ',
    category: 'parent',
    targetGrade: 'Lớp 7 / 8 (THCS)',
    context:
      'Trong giờ học Thể dục, khi em T. thay đồng phục, giáo viên thể dục phát hiện trên lưng và bắp chân em có nhiều vết bầm tím dài như vết lằn của roi đóm và thắt lưng da. Khi cô gặng hỏi, T. hoảng sợ van xin: "Cô đừng nói với ai, bố em biết là bố đánh em chết mất!". Tìm hiểu thêm được biết bố T. thường xuyên say rượu và trút những trận đòn roi tàn nhẫn lên người em.',
    question:
      'Phát hiện dấu hiệu bạo lực gia đình nghiêm trọng đối với trẻ em, Thầy/Cô hãy triển khai quy trình 5 bước theo Luật Trẻ em 2016 để bảo vệ khẩn cấp tính mạng, an toàn thân thể cho học sinh.',
    principlesApplied: [
      'Luật Trẻ em 2016 (Điều 47, 48 về bảo vệ trẻ em khỏi bạo lực gia đình)',
      'Quy trình tiếp nhận và xử lý thông tin bảo vệ trẻ em khẩn cấp (Tổng đài 111)',
      'Nguyên tắc bảo vệ an toàn tuyệt đối và bảo mật thông tin nạn nhân',
    ],
    solutionSteps: [
      {
        step: 1,
        title: 'Bước 1: Phân tích dữ kiện & Đánh giá rủi ro an toàn',
        content:
          'Học sinh là nạn nhân của bạo lực gia đình nghiêm trọng kéo dài, đang ở trong tình trạng sợ hãi tột cùng và có nguy cơ tổn thương thân thể liên tục.',
      },
      {
        step: 2,
        title: 'Bước 2: Biểu đạt mâu thuẫn trung tâm',
        content:
          'Mâu thuẫn giữa quyền được sống an toàn, được bảo vệ của trẻ em với sự vi phạm pháp luật nghiêm trọng của người cha say xỉn bạo lực.',
      },
      {
        step: 3,
        title: 'Bước 3: Lựa chọn phương án tối ưu',
        content:
          'Phương án tối ưu: Đưa em xuống phòng y tế chăm sóc vết thương và trấn an: "Ở trường có thầy cô và pháp luật bảo vệ, con sẽ tuyệt đối an toàn". Báo cáo khẩn cấp ngay lập tức cho Hiệu trưởng; gọi điện đến Tổng đài Quốc gia Bảo vệ Trẻ em 111 và Công an phường/xã nơi em cư trú để can thiệp pháp lý khẩn cấp.',
      },
      {
        step: 4,
        title: 'Bước 4: Chứng minh cơ sở khoa học & Can thiệp bảo vệ liên ngành',
        content:
          'Theo Luật Trẻ em 2016, giáo viên có nghĩa vụ tố giác hành vi bạo hành trẻ em. Phối hợp với công an và cán bộ bảo trợ xã hội lập biên bản tạm giữ người cha để điều tra; tạm thời bố trí em T. ở tại nhà người thân an toàn (nhà cô dì, ông bà) hoặc nhà tạm lánh xã hội.',
      },
      {
        step: 5,
        title: 'Bước 5: Rút ra bài học sư phạm',
        content:
          'Bài học: Người thầy không chỉ là người truyền dạy kiến thức mà còn là người bảo vệ công lý và quyền trẻ em nơi tuyến đầu.',
      },
    ],
    pitfallsToAvoid: [
      'Tự ý gọi điện cho người cha đến trường tra hỏi khiến người cha nổi điên về nhà đánh đập em tàn bạo hơn để trả thù.',
      'Thờ ơ, coi đó là "chuyện nội bộ của gia đình người ta, mình can thiệp vào làm gì phiền toái".',
    ],
    coreLesson:
      'Im lặng trước bạo lực là đồng lõa với tội ác. Người thầy phải là lá chắn thép bảo vệ học trò trước mọi sự áp bức, bất công.',
  },
];

// ============================================================================
// 4. TRIỂN KHAI TOÀN VĂN 2 TÌNH HUỐNG ĐIỂN HÌNH THEO CHUẨN 5 BƯỚC
// (Mẫu 1: Tình huống A1 | Mẫu 2: Tình huống B1)
// ============================================================================

export interface FullyDevelopedModelCase {
  readonly modelId: string;
  readonly code: string;
  readonly title: string;
  readonly context: string;
  readonly detailedFiveSteps: readonly {
    readonly stepNumber: number;
    readonly stepTitle: string;
    readonly executionActions: readonly string[];
    readonly pedagogicalDialogues?: readonly {
      readonly speaker: string;
      readonly words: string;
    }[];
    readonly scienceJustification: string;
  }[];
  readonly pedagogicalPrinciplesApplied: readonly string[];
  readonly reflectionLessons: string;
}

export const FULLY_DEVELOPED_MODEL_CASES: readonly FullyDevelopedModelCase[] = [
  {
    modelId: 'MODEL-01',
    code: 'A1',
    title: 'Mẫu 1: Xử lý Tranh luận Điểm số Công khai giữa Giờ học (Tình huống A1)',
    context:
      'Trong tiết trả bài kiểm tra 1 tiết Hình học không gian lớp 11A, học sinh T. đập bút xuống bàn, đứng dậy to tiếng trước cả lớp: "Cô chấm bất công! Bài em làm giống bạn K. mà bạn được 9 điểm còn em chỉ được 6 điểm. Cô thiên vị cán bộ lớp!". Cả lớp xôn xao, nhiều học sinh hùa theo phản ứng.',
    pedagogicalPrinciplesApplied: [
      'Nguyên tắc tôn trọng nhân cách kết hợp với yêu cầu hợp lý đối với học sinh (Giáo trình HCMUE tr. 45–46)',
      'Nguyên tắc đảm bảo tính khoa học, công khai và minh bạch trong kiểm tra đánh giá (Thông tư 22/2021)',
      'Nghệ thuật làm chủ cảm xúc và kỹ thuật chuyển hướng xung đột sư phạm',
    ],
    detailedFiveSteps: [
      {
        stepNumber: 1,
        stepTitle: 'Bước 01: Phân tích dữ kiện đã cho và xác định dữ kiện quan trọng, chủ yếu',
        executionActions: [
          'Dữ kiện bề mặt: Học sinh T. to tiếng phản đối điểm số, cáo buộc cô giáo "thiên vị cán bộ lớp" ngay trước tập thể 40 học sinh.',
          'Dữ kiện thực chất: T. cảm thấy lòng tự trọng bị tổn thương khi bị điểm thấp hơn bạn; em thiếu kỹ năng kiềm chế cảm xúc nên bộc phát phản ứng chống đối công khai.',
          'Dữ kiện tình thế: Tiết học mới bắt đầu được 10 phút, còn 35 phút cần tiến hành chữa bài và truyền tải nội dung mới.',
          'Hành động của giáo viên: Hít sâu, thực hiện quy tắc "dừng 5 giây", không đỏ mặt quát tháo, giữ nét mặt bình thản và nhìn thẳng vào mắt T. với sự điềm đạm.',
        ],
        scienceJustification:
          'Theo tâm lý học thần kinh, phản ứng bộc phát của học sinh kích hoạt hạch hạnh nhân (amygdala). Nếu giáo viên nổi nóng đáp trả, xung đột sẽ lập tức leo thang thành khủng hoảng sư phạm không thể cứu vãn.',
      },
      {
        stepNumber: 2,
        stepTitle: 'Bước 02: Biểu đạt vấn đề cần giải quyết (xác định mâu thuẫn trung tâm)',
        executionActions: [
          'Xác định mâu thuẫn trung tâm: Mâu thuẫn giữa nhu cầu chính đáng được đối xử công bằng của học sinh với hành vi vi phạm chuẩn mực văn hóa ứng xử trong lớp học.',
          'Vấn đề sư phạm cốt lõi: Làm sao vừa bảo toàn kỷ cương và sự tôn nghiêm của giờ dạy, vừa bảo đảm quyền khiếu nại dân chủ của học sinh mà không làm tổn thương lòng tự trọng của em.',
        ],
        scienceJustification:
          'Xác định đúng mâu thuẫn giúp giáo viên tách bạch rạch ròi giữa "nội dung khiếu nại" (điểm số - cần minh bạch) và "thái độ khiếu nại" (to tiếng - cần uốn nắn), tránh bẫy quy kết đạo đức một chiều.',
      },
      {
        stepNumber: 3,
        stepTitle: 'Bước 03: Nêu giả thuyết các phương án giải quyết và lựa chọn phương án tối ưu',
        executionActions: [
          'Phương án 1 (Tiêu cực): Quát mắng T. là "hỗn láo", ghi sổ đầu bài và đuổi ra khỏi lớp. -> Hậu quả: Đẩy T. vào thế đối đầu, cả lớp nghĩ cô có lỗi nên mới "bịt miệng" học sinh.',
          'Phương án 2 (Thụ động): Dừng cả lớp lại, mang bài của T. và K. ra soi từng câu trước 40 học sinh. -> Hậu quả: Mất 30 phút giờ học, làm K. xấu hổ và T. càng thêm kích động.',
          'Phương án 3 (Tối ưu - Lựa chọn): Ổn định lớp tại chỗ trong 60 giây bằng ngôn ngữ dứt khoát, hẹn giải quyết riêng sau giờ học, sau đó tiếp tục tiết dạy bình thường.',
        ],
        pedagogicalDialogues: [
          {
            speaker: 'Giáo viên (nói với âm lượng vừa phải, đĩnh đạc)',
            words:
              'Cô ghi nhận ý kiến phản hồi của em T. Đánh giá công bằng và chính xác là nguyên tắc danh dự của cô. Tuy nhiên, thái độ và thời điểm thắc mắc của em chưa đúng quy định. Bây giờ cả lớp cần 35 phút để nghe phân tích lỗi sai chung. Cuối giờ, cô mời em T. và bạn K. cùng mang bài lên bàn giáo viên để đối chiếu barem điểm chi tiết.',
          },
          {
            speaker: 'Giáo viên (chuyển hướng cả lớp)',
            words:
              'Bây giờ, cô mời cả lớp mở vở, chúng ta cùng phân tích câu hỏi số 3 - câu hỏi có nhiều bạn nhầm lẫn nhất.',
          },
        ],
        scienceJustification:
          'Phương án tối ưu bảo đảm nguyên tắc "hạ nhiệt tại chỗ" và bảo vệ thời gian học tập của 39 học sinh còn lại, đồng thời thể hiện phong thái đĩnh đạc, không né tránh sự thật của nhà giáo.',
      },
      {
        stepNumber: 4,
        stepTitle: 'Bước 04: Chứng minh cơ sở khoa học của phương án tối ưu',
        executionActions: [
          'Sau giờ học tại bàn giáo viên: Cho T. và K. cùng ngồi xuống. Mở barem điểm chi tiết của tổ chuyên môn.',
          'Đối chiếu khoa học: Chỉ rõ bài của K. có bước chứng minh điều kiện vuông góc trước khi tính góc; bài của T. nhảy bước nên theo barem bị trừ 1.5 điểm, cộng với lỗi tính toán ở câu 2.',
          'Nếu giáo viên có sơ sót chấm sót: Thẳng thắn nhận lỗi trước hai em: "Chỗ này cô có sơ suất nhìn sót ý của em, cô cộng bù điểm ngay cho em và cảm ơn em đã phát hiện".',
          'Uốn nắn thái độ: "Em thấy đấy, cô luôn cầu thị và công tâm. Nhưng nếu lúc nãy em gặp cô sau giờ học để hỏi lịch sự, em sẽ nhận được trọn vẹn sự tôn trọng thay vì sự bức xúc của cả lớp".',
        ],
        scienceJustification:
          'Vận dụng nguyên tắc thống nhất giữa tính nghiêm minh và tình thương yêu; nguyên tắc tôn trọng nhân cách. Dạy học sinh văn hóa đối thoại bằng luận cứ và số liệu thay vì cảm xúc giận dữ.',
      },
      {
        stepNumber: 5,
        stepTitle: 'Bước 05: Rút ra kết luận sư phạm và bài học kinh nghiệm',
        executionActions: [
          'Kết luận sư phạm: Học sinh nhận thức rõ lỗi sai kiến thức, tâm phục khẩu phục và tự nguyện nói lời xin lỗi cô giáo vì đã to tiếng trong giờ học.',
          'Bài học chuyên môn: Trước khi trả bài kiểm tra, giáo viên cần chiếu barem điểm lên màn hình và giải thích các lỗi trừ điểm phổ biến để học sinh tự chấm chéo trước.',
          'Bài học giao tiếp: Sự điềm tĩnh và thái độ minh bạch của người thầy có sức mạnh cảm hóa lớn hơn hàng ngàn lời quát mắng.',
        ],
        scienceJustification:
          'Hoàn tất chu trình học qua trải nghiệm (David Kolb), chuyển hóa một nguy cơ khủng hoảng uy tín thành bài học sâu sắc về sự liêm chính và văn hóa phản biện văn minh.',
      },
    ],
    reflectionLessons:
      'Trong hoạt động sư phạm, sự tự ái và tức giận của người thầy là mồi lửa thiêu rụi uy tín. Sự điềm tĩnh, công khai và tôn trọng học trò là tấm khiên vững chắc nhất bảo vệ phẩm giá nhà giáo.',
  },
  {
    modelId: 'MODEL-02',
    code: 'B1',
    title:
      'Mẫu 2: Xử lý Vấn nạn Cô lập và Tẩy chay Học sinh Nghèo trên Mạng Xã hội (Tình huống B1)',
    context:
      'Em M. là học sinh có hoàn cảnh gia đình nghèo khó, mặc đồng phục cũ sờn. Một nhóm học sinh trong lớp lập nhóm chat riêng đặt biệt danh chế giễu hoàn cảnh em và rủ cả lớp tẩy chay, không ai được chơi cùng. Em M. suy sụp, thường xuyên khóc một mình và có ý định bỏ học.',
    pedagogicalPrinciplesApplied: [
      'Nguyên tắc giáo dục trong tập thể và bằng tập thể (Giáo trình HCMUE tr. 45)',
      'Nguyên tắc đảm bảo tính nhân văn, bảo vệ học sinh yếu thế khỏi bạo lực tinh thần',
      'Luật Trẻ em 2016 và Bộ luật Dân sự về quyền bất khả xâm phạm về danh dự, nhân phẩm',
    ],
    detailedFiveSteps: [
      {
        stepNumber: 1,
        stepTitle: 'Bước 01: Phân tích dữ kiện đã cho và xác định dữ kiện quan trọng, chủ yếu',
        executionActions: [
          'Dữ kiện cốt lõi: M. là nạn nhân của bạo lực tinh thần có tổ chức (cyberbullying và cô lập xã hội); mức độ nghiêm trọng: em đã xuất hiện ý định bỏ học.',
          'Nhóm vi phạm: Một nhóm học sinh nòng cốt có điều kiện kinh tế khá giả dẫn dắt, các học sinh khác hùa theo do tâm lý bầy đàn sợ bị cô lập lây.',
          'Hành động tức thời: Tiếp cận M. kín đáo, an ủi và lắng nghe em giải tỏa nỗi đau; cam kết bảo mật tuyệt đối và bảo vệ an toàn cho em.',
        ],
        scienceJustification:
          'Tâm lý học xã hội chỉ ra rằng: Bạo lực cô lập (ostracism) kích hoạt cùng vùng não xử lý nỗi đau thể xác (anterior cingulate cortex). Người giáo viên phải hành động khẩn cấp như cấp cứu một ca chấn thương.',
      },
      {
        stepNumber: 2,
        stepTitle: 'Bước 02: Biểu đạt mâu thuẫn cần giải quyết (xác định mâu thuẫn trung tâm)',
        executionActions: [
          'Xác định mâu thuẫn: Mâu thuẫn giữa lối sống vật chất thực dụng, thiếu thấu cảm của một bộ phận học sinh với các giá trị đạo đức cơ bản về tình bạn và lòng nhân ái.',
          'Mâu thuẫn sư phạm: Làm sao xử lý nhóm học sinh vi phạm mà không làm chúng quay lại trả thù M., đồng thời thức tỉnh lương tri của toàn bộ tập thể lớp.',
        ],
        scienceJustification:
          'Nếu chỉ phạt nhóm cầm đầu, chúng sẽ nghĩ M. là "kẻ mách lẻo" và tiếp tục cô lập ngầm tinh vi hơn. Cần giải quyết tận gốc rễ nhận thức và xây dựng lại dư luận tập thể.',
      },
      {
        stepNumber: 3,
        stepTitle: 'Bước 03: Nêu giả thuyết các phương án giải quyết và lựa chọn phương án tối ưu',
        executionActions: [
          'Phương án 1 (Trừng phạt hành chính): Mang sự việc ra phê bình gay gắt trước lớp, hạ hạnh kiểm nhóm học sinh kia. -> Hậu quả: M. càng bị chú ý, nhóm kia sinh hận thù.',
          'Phương án 2 (Kêu gọi từ thiện ồn ào): Kêu gọi lớp quyên góp tiền mua đồng phục mới cho M. -> Hậu quả: Biến M. thành đối tượng bị thương hại, tổn thương lòng tự trọng.',
          'Phương án 3 (Tối ưu - Lựa chọn): Gặp riêng răn đe nhóm cầm đầu; tổ chức chuỗi hoạt động trải nghiệm đánh thức lòng thấu cảm; tạo cơ hội cho M. tỏa sáng qua năng lực thực tế.',
        ],
        scienceJustification:
          'Phương án tối ưu kết hợp nhuần nhuyễn giữa "răn đe kín đáo bằng pháp lý" và "chuyển hóa tập thể bằng trải nghiệm", bảo đảm an toàn tâm lý dài lâu cho nạn nhân.',
      },
      {
        stepNumber: 4,
        stepTitle: 'Bước 04: Chứng minh cơ sở khoa học của phương án tối ưu',
        executionActions: [
          'Tác động nhóm cầm đầu (Gặp riêng): Trích dẫn Luật An ninh mạng và Điều 34 Bộ luật Dân sự. Phân tích: Hành vi xúc phạm danh dự người khác trên mạng xã hội có thể bị xử lý pháp luật. Yêu cầu xóa nhóm chat và chủ động hòa giải.',
          'Tác động tập thể (Tiết Sinh hoạt lớp): Tổ chức diễn đàn "Thấu cảm – Đặt mình vào vị trí của người khác". Chiếu một video ngắn về hậu quả của nạn cô lập học đường để cả lớp tự soi chiếu và thảo luận.',
          'Tác động vị thế của M.: Phân công M. làm nhóm trưởng phần thiết kế mô hình STEM của lớp (lĩnh vực M. rất khéo tay). Khi nhóm đạt giải Nhất, cả lớp nhìn nhận M. bằng sự nể phục thực sự.',
        ],
        scienceJustification:
          'Vận dụng nguyên tắc giáo dục trong tập thể và bằng tập thể của A.S. Makarenko: Thay đổi vị thế của cá nhân trong cấu trúc xã hội của lớp học là biện pháp bền vững nhất xóa bỏ sự kỳ thị.',
      },
      {
        stepNumber: 5,
        stepTitle: 'Bước 05: Rút ra kết luận sư phạm và bài học kinh nghiệm',
        executionActions: [
          'Kết quả: Em M. vui vẻ trở lại, tự tin hòa nhập; nhóm học sinh khá giả tự giác thay đổi hành vi và trở thành bạn thân của M.',
          'Bài học quản nhiệm: GVCN cần theo dõi sát sao đời sống tâm lý mạng xã hội của học sinh; không để xuất hiện các "nhóm kín độc hại" phân chia đẳng cấp trong lớp.',
          'Bài học nhân văn: Giá trị của một tập thể lớp không đo bằng sự giàu có của các gia đình, mà đo bằng sự ấm áp mà tập thể đó dành cho thành viên thiệt thòi nhất.',
        ],
        scienceJustification:
          'Khép lại quy trình bằng sự chuyển hóa nhân cách bền vững của cả người bị hại và người vi phạm theo đúng mục tiêu phát triển phẩm chất Nhân ái của CT GDPT 2018.',
      },
    ],
    reflectionLessons:
      'Lòng tốt không phải là bản năng tự nhiên của mọi đứa trẻ, nó cần được người thầy gieo mầm và nuôi dưỡng qua từng bài học thấu cảm.',
  },
];

// ============================================================================
// 5. BÀI THỰC HÀNH 2: CẤU TRÚC KẾ HOẠCH CHỦ NHIỆM & KỊCH BẢN TIẾT SINH HOẠT LỚP
// (Đáp ứng Chuẩn đầu ra: CLO8 | Thời lượng: 6 tiết thực hành)
// ============================================================================

export const HOMEROOM_PLAN_6_PARTS: readonly HomeroomPlanSection[] = [
  {
    sectionNumber: 1,
    badge: 'Phần 1 · Khảo sát thực địa',
    title: 'Phân tích bối cảnh và đặc điểm tình hình lớp học',
    description:
      'Khảo sát toàn diện thực trạng học sinh, gia đình, nhà trường và địa bàn theo mô hình SWOT (Điểm mạnh, Điểm yếu, Thời cơ, Thách thức).',
    keyComponents: [
      'Tổng số học sinh, tỉ lệ nam/nữ, cơ cấu đoàn viên/đội viên.',
      'Phân loại học lực, hạnh kiểm năm học trước (hoặc kết quả tuyển sinh đầu cấp).',
      'Đặc điểm gia đình: Số học sinh mồ côi, hộ nghèo, cha mẹ ly hôn, sống với ông bà.',
      'Thuận lợi: Đội ngũ cán bộ lớp nhiệt tình, sự quan tâm của ban giám hiệu.',
      'Khó khăn: Một bộ phận học sinh nghiện game, học lệch, tâm lý đầu cấp rụt rè.',
    ],
    concreteExample:
      'Lớp 10A1: Sĩ số 42 học sinh (18 nam, 24 nữ); 100% trúng tuyển nguyện vọng 1; 3 học sinh có hoàn cảnh đặc biệt khó khăn; 5 học sinh có năng khiếu văn nghệ, thể thao nổi trội.',
  },
  {
    sectionNumber: 2,
    badge: 'Phần 2 · Mục tiêu & Chỉ tiêu',
    title: 'Mục tiêu và các chỉ tiêu phấn đấu trong năm học',
    description:
      'Xác định hệ thống chỉ tiêu định lượng và định tính có tính khả thi, bám sát Nghị quyết Đại hội Chi bộ và Kế hoạch giáo dục của nhà trường.',
    keyComponents: [
      'Mục tiêu xây dựng tập thể: Đạt danh hiệu "Tập thể học sinh tiên tiến xuất sắc", không có bạo lực học đường.',
      'Chỉ tiêu rèn luyện (Hạnh kiểm): 90% xếp loại Tốt, 10% Khá, không có học sinh Chưa đạt.',
      'Chỉ tiêu học tập (Học lực): 40% Tốt (Xuất sắc & Giỏi), 55% Khá, tối đa 5% Đạt, không có học sinh lưu ban.',
      'Chỉ tiêu phong trào: Đạt giải Nhất/Nhì Hội diễn văn nghệ 20/11; 100% học sinh tham gia ít nhất 1 CLB.',
    ],
    concreteExample:
      'Xây dựng lớp học "Hạnh phúc - Kỷ cương - Sáng tạo", 100% học sinh cam kết thực hiện văn hóa ứng xử số văn minh.',
  },
  {
    sectionNumber: 3,
    badge: 'Phần 3 · Trọng tâm giáo dục',
    title: 'Nội dung giáo dục toàn diện theo các mặt hoạt động',
    description:
      'Hệ thống hóa các nhiệm vụ giáo dục theo 5 trụ cột phát triển nhân cách học sinh THPT.',
    keyComponents: [
      'Giáo dục đạo đức, nề nếp và pháp luật: Thực hiện nghiêm túc nội quy trường học, Luật ATGT và An ninh mạng.',
      'Giáo dục học tập và phát triển trí tuệ: Đổi mới phương pháp tự học, đôi bạn cùng tiến, học theo trạm.',
      'Giáo dục thể chất và thẩm mỹ: Rèn luyện thể dục buổi sáng, giữ gìn vệ sinh lớp học xanh - sạch - đẹp.',
      'Hoạt động trải nghiệm và hướng nghiệp: Tham gia đầy đủ 105 tiết HĐTN theo chương trình Bộ GD&ĐT.',
      'Giáo dục kỹ năng sống và lao động: Tự phục vụ, quản lý tài chính cá nhân, phòng chống xâm hại.',
    ],
    concreteExample:
      'Mỗi tháng tổ chức 1 chủ đề trọng điểm: Tháng 9 (An toàn học đường); Tháng 10 (Phương pháp học đại học); Tháng 11 (Tri ân thầy cô); Tháng 12 (Nghề tương lai).',
  },
  {
    sectionNumber: 4,
    badge: 'Phần 4 · Biện pháp thực thi',
    title: 'Hệ thống các biện pháp thực hiện khoa học',
    description:
      'Các giải pháp quản lý sư phạm mang tính đột phá nhằm hiện thực hóa các chỉ tiêu đã đề ra.',
    keyComponents: [
      'Xây dựng và bồi dưỡng đội ngũ cán bộ lớp tự quản: Bầu cử dân chủ, tập huấn kỹ năng điều hành sinh hoạt lớp.',
      'Phát động phong trào thi đua: Thiết kế bảng theo dõi thi đua theo tổ, khen thưởng kịp thời theo tuần.',
      'Phân hóa biện pháp giáo dục: Lập hồ sơ theo dõi học sinh yếu kém để phụ đạo; giao nhiệm vụ thử thách cho học sinh giỏi.',
      'Tạo dựng môi trường lớp học tích cực: Góc vinh danh tiến bộ, hòm thư "Điều em muốn nói".',
    ],
    concreteExample:
      'Áp dụng mô hình "Tổ tự quản xoay vòng" và "Ngân hàng hoa điểm tốt" tạo động lực học tập tự thân cho học sinh.',
  },
  {
    sectionNumber: 5,
    badge: 'Phần 5 · Phối hợp & Tiến độ',
    title: 'Phân công lực lượng giáo dục và tiến độ thời gian theo tháng',
    description:
      'Phối hợp đa lực lượng (GVCN, Giáo viên bộ môn, Ban đại diện CMHS, Đoàn trường) theo tiến trình 9 tháng học.',
    keyComponents: [
      'Trách nhiệm GVCN: Cố vấn, định hướng, theo dõi hồ sơ học sinh, chủ trì họp phụ huynh 3 lần/năm.',
      'Trách nhiệm Ban cán sự lớp: Điều hành sổ theo dõi nề nếp, tổ chức sinh hoạt lớp thứ Bảy.',
      'Trách nhiệm Ban đại diện CMHS: Đồng hành hỗ trợ cơ sở vật chất, kinh phí dã ngoại, phối hợp quản lý giờ giấc.',
      'Kế hoạch theo tháng: Lộ trình cụ thể từ Tháng 9 (Ổn định nề nếp) đến Tháng 5 (Tổng kết năm học và hướng nghiệp).',
    ],
    concreteExample:
      'Định kỳ ngày 25 hàng tháng họp giao ban giữa GVCN và Ban cán sự lớp để đánh giá tiến độ và tháo gỡ vướng mắc.',
  },
  {
    sectionNumber: 6,
    badge: 'Phần 6 · Đánh giá & Giám sát',
    title: 'Tiêu chí đánh giá, giám sát và cơ chế điều chỉnh kế hoạch',
    description:
      'Quy trình kiểm tra tiến độ, thu thập phản hồi và linh hoạt điều chỉnh khi có biến động thực tế.',
    keyComponents: [
      'Công cụ giám sát: Sổ theo dõi nề nếp, bảng kiểm hành vi (checklist), phiếu khảo sát ý kiến học sinh.',
      'Cơ chế sơ kết - tổng kết: Sơ kết giữa kỳ I, cuối kỳ I và tổng kết năm học.',
      'Quy trình điều chỉnh: Khi bối cảnh thay đổi (ví dụ: dịch bệnh, thay đổi thời khóa biểu), GVCN họp lấy ý kiến tập thể và báo cáo BGH phê duyệt điều chỉnh.',
    ],
    concreteExample:
      'Khảo sát ẩn danh mức độ hài lòng của học sinh về môi trường lớp học vào cuối mỗi học kỳ để cải tiến công tác chủ nhiệm.',
  },
];

export const HOMEROOM_MEETING_SCRIPT_45MIN: readonly ScriptActivityDetail[] = [
  // --------------------------------------------------------------------------
  // PHẦN 1: NỘI DUNG HÀNH CHÍNH & TỰ QUẢN TẬP THỂ (15 PHÚT)
  // --------------------------------------------------------------------------
  {
    timeRange: '00:00 – 05:00',
    durationMinutes: 5,
    activityName: 'Lớp trưởng điều hành & Các tổ trưởng báo cáo sơ kết thi đua tuần',
    inCharge: 'Lớp trưởng chủ trì · 4 Tổ trưởng báo cáo',
    contentAndMethod:
      'Lớp trưởng mời 4 tổ trưởng lần lượt báo cáo nhanh (1 phút/tổ) về các mặt: Chuyên cần (đi trễ, nghỉ học), Nề nếp (đồng phục, vệ sinh), Học tập (điểm tốt, điểm chưa tốt, thiếu bài tập).',
    studentAction: 'Các tổ trưởng trình bày số liệu cụ thể; học sinh cả lớp lắng nghe đối chiếu.',
    expectedOutcome:
      'Bức tranh số liệu toàn cảnh về kỷ cương của lớp trong tuần được công khai minh bạch.',
  },
  {
    timeRange: '05:00 – 10:00',
    durationMinutes: 5,
    activityName: 'Lớp phó học tập & Lớp phó kỷ luật nhận xét chung và thảo luận giải pháp',
    inCharge: 'Lớp phó học tập · Lớp phó kỷ luật · Toàn thể học sinh',
    contentAndMethod:
      'Lớp phó học tập phân tích môn học có nhiều điểm dưới trung bình; Lớp phó kỷ luật nhắc nhở hiện tượng dùng điện thoại. Mời đại diện học sinh có tiến bộ chia sẻ kinh nghiệm học tập.',
    studentAction:
      'Học sinh thảo luận sôi nổi, đề xuất giải pháp (như cử bạn học khá kèm bạn học yếu môn Tiếng Anh).',
    expectedOutcome:
      'Tập thể lớp đồng thuận với các biện pháp khắc phục tồn tại cho tuần học tiếp theo.',
  },
  {
    timeRange: '10:00 – 15:00',
    durationMinutes: 5,
    activityName: 'Giáo viên chủ nhiệm nhận xét, tuyên dương và định hướng tuần tới',
    inCharge: 'Giáo viên chủ nhiệm lớp',
    contentAndMethod:
      'GVCN nhận xét ngắn gọn, điềm đạm: Tuyên dương Tổ 2 xuất sắc nhất tuần; khen ngợi 3 học sinh có tiến bộ vượt bậc; chấn chỉnh nhẹ nhàng hiện tượng nói chuyện riêng; phổ biến kế hoạch thi giữa kỳ.',
    studentAction: 'Cả lớp vỗ tay chúc mừng các bạn được khen và ghi chép dặn dò vào sổ tay.',
    expectedOutcome:
      'Tạo bầu không khí ấm áp, khích lệ tinh thần phấn đấu, kết thúc phần hành chính đúng 15 phút.',
  },

  // --------------------------------------------------------------------------
  // PHẦN 2: NỘI DUNG TRẢI NGHIỆM THEO CHỦ ĐỀ GIÁO DỤC (30 PHÚT)
  // Chủ đề: "Xây dựng tình bạn đẹp – Nói không với bạo lực học đường"
  // --------------------------------------------------------------------------
  {
    timeRange: '15:00 – 20:00',
    durationMinutes: 5,
    activityName: 'Hoạt động 1: Khởi động — Trò chơi tương tác "Hiểu ý đồng đội"',
    inCharge: 'Bí thư Chi đoàn điều hành · GVCN cố vấn',
    contentAndMethod:
      'Mỗi tổ cử 2 đại diện (1 bạn diễn tả bằng hành động không lời, 1 bạn đoán từ khóa). Các từ khóa: "Chia sẻ", "Lắng nghe", "Tha thứ", "Tình bạn". Tổ nào đoán nhanh nhất được thưởng tràng pháo tay.',
    studentAction:
      'Học sinh tham gia nhiệt tình, không khí lớp học trở nên sôi nổi, gắn kết và tiếng cười rộn rã.',
    expectedOutcome:
      'Xóa tan sự căng thẳng sau phần hành chính, dẫn nhập tự nhiên vào chủ đề tình bạn.',
  },
  {
    timeRange: '20:00 – 32:00',
    durationMinutes: 12,
    activityName: 'Hoạt động 2: Khám phá & Thảo luận — Nhận diện nguy cơ bạo lực ngôn từ trên mạng',
    inCharge: '4 Nhóm học sinh · GVCN định hướng',
    contentAndMethod:
      'GVCN chiếu 1 tình huống thực tế: "Một bạn bị chụp lén ảnh dìm và bị chế giễu trên confession". Chia 4 nhóm thảo luận: (Nhóm 1) Hành vi này có phải bạo lực không? (Nhóm 2) Cảm xúc của nạn nhân? (Nhóm 3) Trách nhiệm của người xem và like? (Nhóm 4) Cách ứng xử văn minh?',
    studentAction:
      'Mỗi nhóm viết ý kiến lên giấy A3 bằng bút dạ, dán lên bảng lớp và cử đại diện thuyết trình 2 phút.',
    expectedOutcome:
      'Học sinh nhận thức rõ: Bạo lực ngôn từ trên mạng để lại vết thương tâm lý sâu sắc không kém bạo lực thể xác.',
  },
  {
    timeRange: '32:00 – 40:00',
    durationMinutes: 8,
    activityName: 'Hoạt động 3: Trình bày & Sân khấu hóa — Xử lý tình huống can ngăn xung đột',
    inCharge: 'Đội kịch của lớp (4 học sinh)',
    contentAndMethod:
      'Biểu diễn tiểu phẩm ngắn (3 phút): Hai bạn tranh cãi gay gắt suýt đánh nhau vì va chạm ở cầu thang. Đến nút thắt cao trào, tiểu phẩm dừng lại. GVCN mời 2 học sinh bất kỳ dưới lớp lên sân khấu đóng vai người bạn can ngăn và hòa giải.',
    studentAction:
      'Học sinh nhập vai tự nhiên, đưa ra các câu nói thấu tình đạt lý giúp hai nhân vật hạ hỏa bắt tay nhau.',
    expectedOutcome:
      'Rèn luyện kỹ năng thực tế giải quyết xung đột bằng đối thoại hòa bình thay vì bạo lực.',
  },
  {
    timeRange: '40:00 – 45:00',
    durationMinutes: 5,
    activityName: 'Hoạt động 4: Thông điệp & Cam kết — Xây dựng "Cây cam kết tình bạn"',
    inCharge: 'GVCN đúc kết · Toàn thể học sinh',
    contentAndMethod:
      'GVCN đúc kết thông điệp nhân văn: "Tình bạn là tài sản quý giá nhất của tuổi thanh xuân. Nói không với bạo lực là bảo vệ chính bản thân mình". Mỗi học sinh viết 1 lời hứa hành động lên chiếc lá giấy màu và dán lên bức tranh "Cây tình bạn" của lớp.',
    studentAction:
      'Lần lượt từng bàn bước lên dán chiếc lá cam kết và cùng đọc vang khẩu hiệu của lớp.',
    expectedOutcome:
      'Bức tranh "Cây tình bạn" hoàn thiện treo ở cuối lớp nhắc nhở hành vi ứng xử mỗi ngày. Tiết sinh hoạt kết thúc trong sự lắng đọng và xúc động.',
  },
];

// ============================================================================
// 6. BÀI THỰC HÀNH 3: KHUNG KẾ HOẠCH BÀI DẠY HĐTN CHUẨN CÔNG VĂN 5512
// Tích hợp Tài liệu Bồi dưỡng Cốt cán Mô đun 2 (12.HDTN_tai-lieu-THPT_9.10.20-24h.pdf)
// ============================================================================

export interface LessonPlanActivity5512 {
  readonly activityNumber: number;
  readonly activityName: string;
  readonly durationText: string;
  readonly objective: string;
  readonly content: string;
  readonly product: string;
  readonly implementationSteps: readonly {
    readonly stepName: string;
    readonly teacherAction: string;
    readonly studentAction: string;
  }[];
}

export interface Full5512LessonPlanSample {
  readonly topicTitle: string;
  readonly targetGrade: string;
  readonly totalDuration: string;
  readonly moduleOrigin: string;
  readonly objectives: {
    readonly specificCompetencies: readonly string[];
    readonly generalCompetencies: readonly string[];
    readonly coreQualities: readonly string[];
  };
  readonly equipmentAndMaterials: {
    readonly teacherPrep: readonly string[];
    readonly studentPrep: readonly string[];
  };
  readonly pedagogicalActivities: readonly LessonPlanActivity5512[];
  readonly assessmentRubric: readonly RubricCriterion[];
}

export const SAMPLE_5512_EXPERIENTIAL_PLAN: Full5512LessonPlanSample = {
  topicTitle: 'Chủ đề: Khám phá bản thân và xu hướng nghề nghiệp trong kỷ nguyên số',
  targetGrade: 'Khối lớp 10 (Cấp THPT)',
  totalDuration: '03 tiết (135 phút thực hiện)',
  moduleOrigin:
    'Tài liệu bồi dưỡng giáo viên cốt cán Mô đun 2 cấp THPT (Mã tài liệu: 12.HDTN_tai-lieu-THPT_9.10.20-24h.pdf) & Thông tư 32/2018/TT-BGDĐT',
  objectives: {
    specificCompetencies: [
      'Năng lực thích ứng với cuộc sống: Nhận diện được điểm mạnh, điểm yếu, sở thích, tính cách và giá trị bản thân trong tương quan với yêu cầu nghề nghiệp thời đại số.',
      'Năng lực định hướng nghề nghiệp: Nắm vững xu hướng phát triển của thị trường lao động trong cuộc Cách mạng Công nghiệp 4.0; xác định được các phẩm chất, kỹ năng cần thiết cho nghề mơ ước.',
      'Năng lực thiết kế và tổ chức hoạt động: Tự thiết lập được Bản kế hoạch rèn luyện nghề nghiệp cá nhân cho 3 năm học THPT.',
    ],
    generalCompetencies: [
      'Năng lực tự chủ và tự học: Tự tìm kiếm thông tin về ngành nghề qua Internet và các kênh hướng nghiệp tin cậy.',
      'Năng lực giao tiếp và hợp tác: Tương tác, thảo luận nhóm để xây dựng cẩm nang nghề nghiệp tương lai.',
      'Năng lực giải quyết vấn đề và sáng tạo: Thiết kế sản phẩm số (infographic, video ngắn) giới thiệu về nghề nghiệp tương lai.',
    ],
    coreQualities: [
      'Chăm chỉ: Có tinh thần chủ động tìm tòi, kiên trì theo đuổi mục tiêu học tập và rèn luyện.',
      'Trách nhiệm: Có trách nhiệm với tương lai của chính bản thân và sự phát triển kinh tế - xã hội của đất nước.',
    ],
  },
  equipmentAndMaterials: {
    teacherPrep: [
      'Kế hoạch bài dạy chi tiết (Giáo án CV 5512); máy chiếu, màn hình tương tác, loa kéo.',
      'Video phóng sự "Thị trường lao động và những ngành nghề biến mất trong kỷ nguyên AI" (Thời lượng 3 phút).',
      'Phiếu học tập số 1 (Trắc nghiệm tính cách Holland rút gọn) và Phiếu học tập số 2 (Kế hoạch rèn luyện cá nhân).',
      'Bảng tiêu chí đánh giá Rubric dành cho giáo viên và bảng tự đánh giá của học sinh.',
    ],
    studentPrep: [
      'Sách giáo khoa Hoạt động trải nghiệm, hướng nghiệp 10.',
      'Smartphone hoặc máy tính bảng kết nối Internet để tra cứu thông tin nghề nghiệp (theo quy định).',
      'Giấy A0, bút màu dạ, sticker chấm điểm cho hoạt động trưng bày dự án nhóm.',
    ],
  },
  pedagogicalActivities: [
    {
      activityNumber: 1,
      activityName: 'Hoạt động 1: Khởi động / Khám phá — Trò chơi "Ai là ai trong thế giới số?"',
      durationText: '15 phút (Tiết 1)',
      objective:
        'Tạo tâm thế hứng khởi, kích thích trí tò mò của học sinh về sự xuất hiện của các ngành nghề mới trong kỷ nguyên số.',
      content:
        'Xem clip ngắn về công việc của kỹ sư AI, chuyên viên dữ liệu lớn, nhà sáng tạo nội dung số; tham gia trò chơi đoán tên nghề nghiệp qua gợi ý hình ảnh.',
      product: 'Câu trả lời của các nhóm và danh mục 10 nghề nghiệp mới xuất hiện trong 5 năm qua.',
      implementationSteps: [
        {
          stepName: 'Chuyển giao nhiệm vụ',
          teacherAction:
            'Chiếu slide chứa 5 hình ảnh gợi ý bí ẩn về công việc của một chuyên gia an ninh mạng. Yêu cầu các tổ giơ cờ bấm chuông trả lời.',
          studentAction: 'Quan sát hình ảnh gợi ý, hội ý nhanh trong tổ để đưa ra tên nghề nghiệp.',
        },
        {
          stepName: 'Thực hiện nhiệm vụ',
          teacherAction:
            'Quan sát, điều phối lượt trả lời của các tổ và ghi nhận điểm số lên bảng.',
          studentAction:
            'Đại diện tổ trả lời và giải thích vì sao nghề này lại quan trọng hiện nay.',
        },
        {
          stepName: 'Báo cáo & Thảo luận',
          teacherAction:
            'Chiếu video clip 2 phút tóm tắt sự thay đổi của thế giới nghề nghiệp dưới tác động của AI.',
          studentAction: 'Lắng nghe, ghi chép nhanh các từ khóa về kỹ năng số vào vở.',
        },
        {
          stepName: 'Đúc kết & Kết nối',
          teacherAction:
            'Kết luận: Thế giới nghề nghiệp biến đổi không ngừng, để chọn đúng nghề, trước hết ta phải hiểu rõ chính bản thân mình.',
          studentAction: 'Sẵn sàng tâm thế bước vào hoạt động khám phá bản thân.',
        },
      ],
    },
    {
      activityNumber: 2,
      activityName:
        'Hoạt động 2: Hình thành kiến thức / Kết nối trải nghiệm — Giải mã "ADN nghề nghiệp"',
      durationText: '30 phút (Tiết 1 & Tiết 2)',
      objective:
        'Học sinh nhận diện được sở thích, tính cách bản thân theo mô hình Holland và đối chiếu với các nhóm ngành nghề.',
      content:
        'Thực hiện trắc nghiệm Holland trên Phiếu học tập số 1; phân tích 6 nhóm tính cách (R - Khám phá, I - Nghiên cứu, A - Nghệ thuật, S - Xã hội, E - Quản lý, C - Nghiệp vụ).',
      product:
        'Phiếu trắc nghiệm Holland cá nhân đã hoàn thành với mã 3 chữ cái đặc trưng của mỗi học sinh.',
      implementationSteps: [
        {
          stepName: 'Chuyển giao nhiệm vụ',
          teacherAction:
            'Phát Phiếu học tập số 1; hướng dẫn học sinh cách chấm điểm trung thực cho 30 nhận định về sở thích và năng lực cá nhân.',
          studentAction: 'Nhận phiếu học tập, đọc kỹ hướng dẫn thang đo từ 1 đến 5 điểm.',
        },
        {
          stepName: 'Thực hiện nhiệm vụ',
          teacherAction:
            'Đi lại giữa các bàn học, hỗ trợ giải đáp các thắc mắc về thuật ngữ tính cách cho học sinh.',
          studentAction:
            'Làm việc độc lập trong 15 phút, cộng điểm cho từng nhóm chữ cái và tìm ra 2 nhóm có điểm cao nhất.',
        },
        {
          stepName: 'Báo cáo & Thảo luận',
          teacherAction:
            'Tổ chức cho các học sinh có cùng nhóm chữ cái cao nhất về ngồi cùng một bàn chuyên gia để trao đổi.',
          studentAction:
            'Thảo luận trong nhóm chuyên gia: "Những người nhóm S (Xã hội) như chúng mình phù hợp với nghề giáo viên, bác sĩ, nhà tâm lý học".',
        },
        {
          stepName: 'Đúc kết & Kết nối',
          teacherAction:
            'Khẳng định: Không có nhóm tính cách nào tốt hơn nhóm nào, quan trọng là tìm được môi trường nghề nghiệp tương thích để thăng hoa.',
          studentAction: 'Ghi nhớ mã tính cách cá nhân để làm căn cứ cho hoạt động thực hành.',
        },
      ],
    },
    {
      activityNumber: 3,
      activityName:
        'Hoạt động 3: Luyện tập / Thực hành trải nghiệm — Xây dựng "Bản đồ hướng nghiệp 4.0"',
      durationText: '45 phút (Tiết 2 & Tiết 3)',
      objective:
        'Học sinh rèn luyện kỹ năng tra cứu, phân tích yêu cầu tuyển dụng thực tế và thiết kế sơ đồ nghề nghiệp theo nhóm.',
      content:
        'Chia 6 nhóm tương ứng 6 nhóm Holland. Mỗi nhóm chọn 1 nghề tiêu biểu trong kỷ nguyên số, tra cứu trên Internet về yêu cầu trình độ, kỹ năng, mức lương và lộ trình thăng tiến; thiết kế Infographic trên giấy A0.',
      product:
        'Bản Infographic A0 về nghề nghiệp tương lai kèm bài thuyết trình 3 phút của mỗi nhóm.',
      implementationSteps: [
        {
          stepName: 'Chuyển giao nhiệm vụ',
          teacherAction:
            'Giao nhiệm vụ thiết kế Infographic nghề nghiệp theo cấu trúc: (1) Tên nghề; (2) Mô tả công việc; (3) Phẩm chất & Kỹ năng cần có; (4) Khối thi THPT & Trường đào tạo.',
          studentAction:
            'Nhận giấy A0, phân công nhiệm vụ: 1 bạn tra cứu mạng, 2 bạn vẽ sơ đồ, 1 bạn viết nội dung, 1 bạn chuẩn bị thuyết trình.',
        },
        {
          stepName: 'Thực hiện nhiệm vụ',
          teacherAction:
            'Giám sát các nhóm làm việc, nhắc nhở quản lý thời gian (20 phút làm sản phẩm).',
          studentAction:
            'Hợp tác tích cực, ứng dụng công cụ tìm kiếm để lấy dữ liệu tuyển dụng thực tế năm 2026.',
        },
        {
          stepName: 'Báo cáo & Thảo luận',
          teacherAction:
            'Tổ chức "Phòng triển lãm tranh" (Gallery Walk): Đại diện nhóm đứng tại chỗ thuyết trình, các nhóm khác đi xem và dán sticker chấm điểm.',
          studentAction:
            'Thuyết trình tự tin, đặt câu hỏi phản biện cho nhóm bạn về cơ hội việc làm của ngành nghề.',
        },
        {
          stepName: 'Đúc kết & Kết nối',
          teacherAction:
            'Đánh giá nhận xét sản phẩm các nhóm theo Rubric; khen ngợi sự sáng tạo và tư duy thực tế của học sinh.',
          studentAction: 'Lắng nghe nhận xét và rút kinh nghiệm cho bản kế hoạch cá nhân.',
        },
      ],
    },
    {
      activityNumber: 4,
      activityName: 'Hoạt động 4: Vận dụng / Mở rộng — Thiết lập "Hộ chiếu nghề nghiệp 3 năm THPT"',
      durationText: '45 phút (Tiết 3)',
      objective:
        'Mỗi học sinh tự xây dựng được Bản kế hoạch hành động cá nhân cụ thể cho từng năm học từ lớp 10 đến lớp 12 để hiện thực hóa ước mơ nghề nghiệp.',
      content:
        'Điền Bản kế hoạch rèn luyện cá nhân trên Phiếu học tập số 2: Xác định tổ hợp môn học lựa chọn, chứng chỉ ngoại ngữ/tin học cần đạt, hoạt động tình nguyện cần tham gia.',
      product: 'Bản kế hoạch hành động cá nhân có chữ ký cam kết của học sinh và phụ huynh.',
      implementationSteps: [
        {
          stepName: 'Chuyển giao nhiệm vụ',
          teacherAction:
            'Chiếu mẫu "Hộ chiếu nghề nghiệp"; giải thích các tiêu chí SMART (Cụ thể, Đo lường được, Khả thi, Thực tế, Có thời hạn).',
          studentAction:
            'Nghiên cứu mẫu kế hoạch và đối chiếu với năng lực học tập hiện tại của bản thân.',
        },
        {
          stepName: 'Thực hiện nhiệm vụ',
          teacherAction:
            'Gặp gỡ, tư vấn riêng cho các học sinh còn đang băn khoăn giữa hai ngành nghề.',
          studentAction:
            'Tự viết bản kế hoạch: Năm lớp 10 (học chắc Toán - Tin, thi chứng chỉ MOS); Năm lớp 11 (ôn IELTS đạt 6.5, tham gia CLB Lập trình); Năm lớp 12 (luyện đề thi ĐGNL).',
        },
        {
          stepName: 'Báo cáo & Thảo luận',
          teacherAction:
            'Mời 2 học sinh đại diện chia sẻ bản kế hoạch trước lớp; khuyến khích các bạn góp ý xây dựng.',
          studentAction: 'Lắng nghe bạn chia sẻ và hoàn thiện bản kế hoạch của mình.',
        },
        {
          stepName: 'Đúc kết & Kết nối',
          teacherAction:
            'Tổng kết chủ đề bằng thông điệp: "Tương lai không phải là nơi ta sẽ đến, mà là nơi ta đang tạo ra từ hành động hôm nay". Dặn dò đem về trao đổi cùng cha mẹ.',
          studentAction:
            'Lưu bản kế hoạch vào Hồ sơ học tập (Portfolio) và cam kết thực hiện nghiêm túc.',
        },
      ],
    },
  ],
  assessmentRubric: [
    {
      criterion: '1. Nhận thức bản thân và xu hướng nghề nghiệp (CLO8)',
      weight: '30%',
      notMet:
        'Chưa thực hiện trắc nghiệm hoặc không xác định được mã tính cách bản thân; mơ hồ về các ngành nghề trong kỷ nguyên số.',
      met: 'Hoàn thành trắc nghiệm Holland, gọi tên đúng nhóm tính cách và liệt kê được 3–5 nghề nghiệp tương thích cơ bản.',
      good: 'Phân tích sâu sắc sự tương thích giữa phẩm chất cá nhân với yêu cầu nghề nghiệp số; dẫn chứng dữ liệu thị trường lao động thực tế.',
    },
    {
      criterion: '2. Kỹ năng hợp tác và chất lượng sản phẩm nhóm (CLO9)',
      weight: '30%',
      notMet:
        'Sản phẩm sơ sài, thiếu thông tin cốt lõi; không tích cực tham gia hoạt động nhóm trong quá trình thiết kế Infographic.',
      met: 'Infographic đầy đủ 4 nội dung chuẩn; trình bày rõ ràng, thẩm mỹ; có sự phân công và phối hợp nhịp nhàng giữa các thành viên.',
      good: 'Infographic sáng tạo vượt trội, có tính trực quan cao; bài thuyết trình thuyết phục, xử lý câu hỏi phản biện sắc bén và logic.',
    },
    {
      criterion: '3. Bản kế hoạch hành động cá nhân (CLO8, CLO9)',
      weight: '40%',
      notMet:
        'Kế hoạch chung chung, không có mục tiêu thời gian cụ thể (chỉ ghi "sẽ cố gắng học giỏi"); thiếu tính khả thi.',
      met: 'Bản kế hoạch đạt tiêu chuẩn SMART; xác định rõ mục tiêu từng năm học 10, 11, 12 gắn với tổ hợp môn xét tuyển đại học.',
      good: 'Kế hoạch hành động chi tiết đến từng học kỳ; có phương án dự phòng khi gặp khó khăn; có cam kết phối hợp rõ ràng với gia đình.',
    },
  ],
};
