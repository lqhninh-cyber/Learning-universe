import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import {
  getLessonBySlug,
  getSubjectBySlug,
  getSubjects,
  resolveLessonShortcut,
} from '@/content-runtime';
import { getChapter1LessonModule } from '@/data/courses/giao-duc-hoc/chapter-1';
import { getChapter2LessonModule } from '@/data/courses/giao-duc-hoc/chapter-2';
import { getChapter3LessonModule } from '@/data/courses/giao-duc-hoc/chapter-3';
import { getChapter4LessonModule } from '@/data/courses/giao-duc-hoc/chapter-4';
import { getChapter5LessonModule } from '@/data/courses/giao-duc-hoc/chapter-5';
import {
  ESSAY_EXAM_QUESTIONS,
  getChapter6LessonModule,
  PEDAGOGICAL_20_CASE_STUDIES,
  QUIZ_20_QUESTIONS,
} from '@/data/courses/giao-duc-hoc/chapter-6';
import {
  EDUCATIONAL_PRINCIPLES,
  GIAO_DUC_HOC_SUBJECT,
  getPedagogyLessonModule,
  PEDAGOGICAL_CASE_STUDIES,
  PEDAGOGY_DOCUMENTS,
} from '@/data/courses/giao-duc-hoc/course';
import {
  CaseStudyBox,
  LegalQuoteCard,
  PrincipleMatrix,
  ScholarQuote,
  TeacherStandardsMatrix,
} from '@/features/pedagogy';

describe('Khoa học Giáo dục & Nghiệp vụ Sư phạm (Pedagogy)', () => {
  describe('Cấu trúc học phần Giáo dục học (course.ts)', () => {
    it('chứa môn học giao-duc-hoc trong getSubjects() và getSubjectBySlug()', () => {
      const subjects = getSubjects();
      const gdh = getSubjectBySlug('giao-duc-hoc');

      expect(subjects.some((s) => s.id === 'giao-duc-hoc')).toBe(true);
      expect(gdh).toBeDefined();
      expect(gdh?.title).toBe('Giáo dục học');
      expect(gdh?.curriculum?.chapterCount).toBe(6);
      expect(gdh?.curriculum?.lessonCount).toBe(20);
    });

    it('đảm bảo tất cả 20 bài học có đầy đủ estimatedMinutes và status published', () => {
      let totalLessons = 0;
      for (const chapter of GIAO_DUC_HOC_SUBJECT.chapters) {
        for (const lesson of chapter.lessons) {
          totalLessons++;
          expect(lesson.estimatedMinutes).toBeGreaterThan(0);
          expect(lesson.status).toBe('published');
          expect(lesson.slug).toBeTruthy();
          expect(lesson.title).toBeTruthy();
        }
      }
      expect(totalLessons).toBe(20);
    });

    it('Chương 1 có đủ 4 bài học chi tiết theo chuẩn CLO 1, CLO 2, CLO 3', () => {
      const ch1 = GIAO_DUC_HOC_SUBJECT.chapters[0]!;
      expect(ch1.lessons.length).toBe(4);
      expect(ch1.lessons[0]!.slug).toBe('hoat-dong-su-pham-cua-nguoi-giao-vien');
      expect(ch1.lessons[1]!.slug).toBe('nhan-cach-va-chuan-nghe-nghiep-giao-vien-pho-thong');
      expect(ch1.lessons[2]!.slug).toBe('ren-luyen-de-tro-thanh-nguoi-giao-vien-hieu-qua');
      expect(ch1.lessons[3]!.slug).toBe('tinh-huong-su-pham-va-de-cuong-on-tap-chuong-1');
    });

    it('tích hợp đủ 19 tài liệu học phần, văn bản pháp quy và cẩm nang hoạt động trải nghiệm', () => {
      expect(PEDAGOGY_DOCUMENTS.length).toBe(19);
      expect(PEDAGOGY_DOCUMENTS.some((d) => d.id === 'gt-gdh-hcmue')).toBe(true);
      expect(PEDAGOGY_DOCUMENTS.some((d) => d.id === 'luat-giao-duc-2019')).toBe(true);
      expect(PEDAGOGY_DOCUMENTS.some((d) => d.id === 'chuan-nghe-nghiep-gv-tt20')).toBe(true);
      expect(PEDAGOGY_DOCUMENTS.some((d) => d.id === 'dieu-le-truong-trung-hoc-tt32')).toBe(true);
      expect(PEDAGOGY_DOCUMENTS.some((d) => d.id === 'tt17-sua-doi-ctgdpt')).toBe(true);
      expect(PEDAGOGY_DOCUMENTS.some((d) => d.id === 'doc-chien-luoc-phat-trien-gd')).toBe(true);
      expect(PEDAGOGY_DOCUMENTS.some((d) => d.id === 'doc-hdtnhn-thcs-modun-4')).toBe(true);
      expect(PEDAGOGY_DOCUMENTS.some((d) => d.id === 'doc-hdtnhn-thpt-modun-4')).toBe(true);
      expect(PEDAGOGY_DOCUMENTS.some((d) => d.id === 'doc-hdtn-thcs-modun-2')).toBe(true);
      expect(PEDAGOGY_DOCUMENTS.some((d) => d.id === 'doc-phuong-thuc-to-chuc-hdtn')).toBe(true);
      expect(PEDAGOGY_DOCUMENTS.some((d) => d.id === 'doc-quy-trinh-thiet-ke-chu-de-hdtn')).toBe(
        true,
      );
    });

    it('chứa đủ 6 nguyên tắc giáo dục và bộ tình huống sư phạm thực tế', () => {
      expect(EDUCATIONAL_PRINCIPLES.length).toBe(6);
      expect(PEDAGOGICAL_CASE_STUDIES.length).toBeGreaterThanOrEqual(3);
    });
  });

  describe('Component ScholarQuote', () => {
    it('hiển thị danh ngôn của Comenius với tác giả và bối cảnh lịch sử', () => {
      render(
        <ScholarQuote
          quote="Người giáo viên là người chuyển giao ngọn đuốc của nền văn minh..."
          author="Jan Amos Comenius"
          title="Ông tổ của nền Sư phạm Cận đại"
          source="Didactica Magna, 1657"
          historicalContext="Comenius khẳng định nghề dạy học là sứ mệnh thiêng liêng."
        />,
      );

      expect(
        screen.getByText(/Người giáo viên là người chuyển giao ngọn đuốc của nền văn minh/i),
      ).toBeInTheDocument();
      expect(screen.getByText('Jan Amos Comenius')).toBeInTheDocument();
      expect(screen.getByText('Ông tổ của nền Sư phạm Cận đại')).toBeInTheDocument();
      expect(screen.getByText('Didactica Magna, 1657')).toBeInTheDocument();
    });
  });

  describe('Component TeacherStandardsMatrix (Thông tư 20/2018)', () => {
    it('hiển thị 5 tiêu chuẩn chuẩn nghề nghiệp và hỗ trợ chuyển tab', () => {
      render(<TeacherStandardsMatrix />);

      expect(screen.getByText('Ma trận Chuẩn nghề nghiệp Giáo viên phổ thông')).toBeInTheDocument();
      expect(screen.getByText(/Tiêu chuẩn 1: Phẩm chất nhà giáo/i)).toBeInTheDocument();

      // Bấm tab Tiêu chuẩn 2
      const tab2 = screen.getByRole('button', { name: /Tiêu chuẩn 2/i });
      fireEvent.click(tab2);

      expect(
        screen.getByText(/Tiêu chuẩn 2: Phát triển chuyên môn, nghiệp vụ/i),
      ).toBeInTheDocument();
    });
  });

  describe('Dispatcher getChapter1LessonModule', () => {
    it('nạp đầy đủ 4 bài học chi tiết của Chương 1', () => {
      const b1 = getChapter1LessonModule('gdh-c1-b1-hoat-dong-su-pham-cua-nguoi-giao-vien');
      const b2 = getChapter1LessonModule(
        'gdh-c1-b2-nhan-cach-va-chuan-nghe-nghiep-giao-vien-pho-thong',
      );
      const b3 = getChapter1LessonModule(
        'gdh-c1-b3-ren-luyen-de-tro-thanh-nguoi-giao-vien-hieu-qua',
      );
      const b4 = getChapter1LessonModule(
        'gdh-c1-b4-tinh-huong-su-pham-va-de-cuong-on-tap-chuong-1',
      );

      expect(b1).toBeDefined();
      expect(b1?.lessonMeta.headings.length).toBeGreaterThan(0);
      expect(b2).toBeDefined();
      expect(b3).toBeDefined();
      expect(b4).toBeDefined();
    });
  });

  describe('Dispatcher getChapter2LessonModule', () => {
    it('nạp đầy đủ 3 bài học chi tiết của Chương 2', () => {
      const b1 = getChapter2LessonModule('gdh-c2-b1-ban-chat-va-cac-chuc-nang-xa-hoi-cua-giao-duc');
      const b2 = getChapter2LessonModule('gdh-c2-b2-giao-duc-va-su-phat-trien-nhan-cach');
      const b3 = getChapter2LessonModule(
        'gdh-c2-b3-giao-duc-hoc-la-mot-khoa-hoc-muc-dich-va-nguyen-ly-giao-duc',
      );

      expect(b1).toBeDefined();
      expect(b1?.lessonMeta.headings.length).toBe(3);
      expect(b2).toBeDefined();
      expect(b2?.lessonMeta.headings.length).toBe(3);
      expect(b3).toBeDefined();
      expect(b3?.lessonMeta.headings.length).toBe(4);
    });
  });

  describe('Dispatcher getChapter3LessonModule', () => {
    it('nạp đầy đủ 3 bài học chi tiết của Chương 3', () => {
      const b1 = getChapter3LessonModule(
        'gdh-c3-b1-co-cau-to-chuc-truong-pho-thong-va-khai-niem-hoat-dong-giao-duc',
      );
      const b2 = getChapter3LessonModule(
        'gdh-c3-b2-he-thong-6-nguyen-tac-giao-duc-hoc-sinh-pho-thong',
      );
      const b3 = getChapter3LessonModule(
        'gdh-c3-b3-muc-tieu-pham-chat-nang-luc-va-phuong-phap-giao-duc',
      );

      expect(b1).toBeDefined();
      expect(b1?.lessonMeta.headings.length).toBe(3);
      expect(b2).toBeDefined();
      expect(b2?.lessonMeta.headings.length).toBe(2);
      expect(b3).toBeDefined();
      expect(b3?.lessonMeta.headings.length).toBe(4);
    });
  });

  describe('Dispatcher getChapter4LessonModule', () => {
    it('nạp đầy đủ 4 bài học chi tiết của Chương 4', () => {
      const b1 = getChapter4LessonModule('gdh-c4-b1-vi-tri-chuc-nang-va-nhiem-vu-cua-gvcn');
      const b2 = getChapter4LessonModule('gdh-c4-b2-noi-dung-va-phuong-phap-giao-duc-cua-gvcn-lop');
      const b3 = getChapter4LessonModule(
        'gdh-c4-b3-yeu-cau-pham-chat-nang-luc-gvcn-va-thiet-ke-hoat-dong-chu-nhiem',
      );
      const b4 = getChapter4LessonModule(
        'gdh-c4-b4-thuc-hanh-xu-ly-tinh-huong-su-pham-theo-rubric-a12',
      );

      expect(b1).toBeDefined();
      expect(b1?.lessonMeta.headings.length).toBe(3);
      expect(b2).toBeDefined();
      expect(b2?.lessonMeta.headings.length).toBe(2);
      expect(b3).toBeDefined();
      expect(b3?.lessonMeta.headings.length).toBe(2);
      expect(b4).toBeDefined();
      expect(b4?.lessonMeta.headings.length).toBe(3);
    });
  });

  describe('Dispatcher getChapter5LessonModule', () => {
    it('nạp đầy đủ 4 bài học chi tiết của Chương 5', () => {
      const b1 = getChapter5LessonModule(
        'gdh-c5-b1-khai-niem-ban-chat-va-muc-tieu-hoat-dong-trai-nghiem',
      );
      const b2 = getChapter5LessonModule(
        'gdh-c5-b2-noi-dung-va-phuong-thuc-to-chuc-hoat-dong-trai-nghiem',
      );
      const b3 = getChapter5LessonModule(
        'gdh-c5-b3-quy-trinh-thiet-ke-ke-hoach-chu-de-hdtn-va-tien-trinh-4-buoc',
      );
      const b4 = getChapter5LessonModule(
        'gdh-c5-b4-danh-gia-ket-qua-hdtn-va-thuc-hanh-xay-dung-ke-hoach-rubric-a19',
      );

      expect(b1).toBeDefined();
      expect(b1?.lessonMeta.headings.length).toBe(3);
      expect(b2).toBeDefined();
      expect(b2?.lessonMeta.headings.length).toBe(2);
      expect(b3).toBeDefined();
      expect(b3?.lessonMeta.headings.length).toBe(2);
      expect(b4).toBeDefined();
      expect(b4?.lessonMeta.headings.length).toBe(2);
    });
  });

  describe('Component LegalQuoteCard', () => {
    it('hiển thị đầy đủ thông tin luật, điều khoản, trích dẫn và nguồn', () => {
      render(
        <LegalQuoteCard
          lawTitle="Luật Giáo dục 2019"
          article="Điều 28, Khoản 1"
          quote="Mục tiêu của giáo dục phổ thông nhằm phát triển toàn diện cho người học..."
          source="Quốc hội khóa XIV, ban hành ngày 14/6/2019"
          sourceUrl="/docs/giao-duc-hoc/Luat_Giao_duc_2019.pdf"
          significance="Kim chỉ nam định hướng mọi hoạt động dạy học và giáo dục nhân cách."
        />,
      );

      expect(screen.getByText('Luật Giáo dục 2019')).toBeInTheDocument();
      expect(screen.getByText('Điều 28, Khoản 1')).toBeInTheDocument();
      expect(
        screen.getByText(/Mục tiêu của giáo dục phổ thông nhằm phát triển toàn diện/i),
      ).toBeInTheDocument();
      expect(screen.getByText(/Kim chỉ nam định hướng mọi hoạt động dạy học/i)).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /Văn bản PDF/i })).toHaveAttribute(
        'href',
        '/docs/giao-duc-hoc/Luat_Giao_duc_2019.pdf',
      );
    });
  });

  describe('Component CaseStudyBox', () => {
    const mockCase = PEDAGOGICAL_CASE_STUDIES[0]!;

    it('hiển thị tiêu đề, bối cảnh, câu hỏi và cho phép nhập phản tư', () => {
      render(<CaseStudyBox caseStudy={mockCase} />);

      expect(screen.getByText(new RegExp(`Tình huống ${mockCase.id}:`, 'i'))).toBeInTheDocument();
      expect(screen.getByText(mockCase.context)).toBeInTheDocument();
      expect(screen.getByText(mockCase.question)).toBeInTheDocument();

      const textarea = screen.getByPlaceholderText(/Nhập suy nghĩ/i);
      fireEvent.change(textarea, {
        target: { value: 'Tôi sẽ giữ bình tĩnh và mời học sinh ra ngoài nói chuyện riêng.' },
      });
      expect(textarea).toHaveValue(
        'Tôi sẽ giữ bình tĩnh và mời học sinh ra ngoài nói chuyện riêng.',
      );
    });

    it('mở rộng hướng dẫn giải quyết 5 bước khi click nút xem gợi ý', () => {
      render(<CaseStudyBox caseStudy={mockCase} />);

      const toggleButton = screen.getByRole('button', { name: /Xem gợi ý xử lý chuẩn/i });
      fireEvent.click(toggleButton);

      expect(screen.getByText(/Nguyên tắc sư phạm áp dụng/i)).toBeInTheDocument();
      expect(screen.getByText(/Quy trình 5 bước xử lý khoa học/i)).toBeInTheDocument();
      expect(screen.getByText(/Bẫy sư phạm thường gặp/i)).toBeInTheDocument();
      expect(screen.getByText(mockCase.coreLesson)).toBeInTheDocument();
    });
  });

  describe('Component PrincipleMatrix', () => {
    it('hiển thị bảng tra cứu 6 nguyên tắc và chuyển đổi tab nguyên tắc', () => {
      render(<PrincipleMatrix />);

      expect(screen.getByText('Ma trận 6 Nguyên tắc Giáo dục')).toBeInTheDocument();

      // Mặc định nguyên tắc 1 được chọn (xuất hiện ở cả menu trái và khung chi tiết phải)
      expect(screen.getAllByText(EDUCATIONAL_PRINCIPLES[0]!.name).length).toBe(2);

      // Chuyển sang nguyên tắc 2 bằng cách click vào tiêu đề của nguyên tắc 2
      const principle2 = screen.getByText(EDUCATIONAL_PRINCIPLES[1]!.name);
      fireEvent.click(principle2);

      expect(screen.getByText('Nguyên tắc số 2')).toBeInTheDocument();
    });

    it('hỗ trợ tìm kiếm từ khóa trong ma trận nguyên tắc', () => {
      render(<PrincipleMatrix />);

      const searchInput = screen.getByPlaceholderText('Tìm theo nguyên tắc, từ khóa...');
      fireEvent.change(searchInput, { target: { value: 'nhân cách' } });

      // Sẽ lọc ra các nguyên tắc liên quan đến nhân cách
      expect(screen.getByText(/Nguyên tắc tôn trọng nhân cách/i)).toBeInTheDocument();
    });
  });

  describe('Chương 6 - Cẩm nang Xử lý Tình huống sư phạm & Đề cương Ôn tập', () => {
    it('chứa đủ 20 tình huống sư phạm thực tế, 10 câu hỏi tự luận, 20 câu trắc nghiệm', () => {
      expect(PEDAGOGICAL_20_CASE_STUDIES.length).toBe(20);
      expect(ESSAY_EXAM_QUESTIONS.length).toBe(10);
      expect(QUIZ_20_QUESTIONS.length).toBe(20);

      const categories = new Set(PEDAGOGICAL_20_CASE_STUDIES.map((c) => c.category));
      expect(categories.has('insubordination')).toBe(true);
      expect(categories.has('romance')).toBe(true);
      expect(categories.has('bullying')).toBe(true);
      expect(categories.has('integrity')).toBe(true);
      expect(categories.has('parent')).toBe(true);

      // Mỗi tình huống có đủ cấu trúc 4 phần
      for (const item of PEDAGOGICAL_20_CASE_STUDIES) {
        expect(item.id).toBeGreaterThan(0);
        expect(item.title).toBeTruthy();
        expect(item.context).toBeTruthy();
        expect(item.question).toBeTruthy();
        expect(item.principlesApplied.length).toBeGreaterThanOrEqual(1);
        expect(item.solutionSteps.length).toBeGreaterThanOrEqual(4);
        expect(item.pitfallsToAvoid.length).toBeGreaterThanOrEqual(1);
        expect(item.coreLesson).toBeTruthy();
      }
    });

    it('nạp đúng module cho Bài 6.1 qua slug chính, shortcut aliases và getPedagogyLessonModule', () => {
      const aliases = [
        'gdh-c6-b1-ngan-hang-20-tinh-huong-su-pham-thuc-te',
        'ngan-hang-20-tinh-huong-su-pham-thuc-te',
        '6-1',
        'bai-6-1',
        'c6-b1',
        'tinh-huong-su-pham',
      ];

      for (const slug of aliases) {
        const mod = getChapter6LessonModule(slug);
        expect(mod).toBeDefined();
        expect(mod?.frontmatter.title).toContain('Ngân hàng 20 tình huống sư phạm');
        expect(mod?.lessonMeta.headings.length).toBeGreaterThanOrEqual(2);
      }

      const viaMain = getPedagogyLessonModule('gdh-c6-b1-ngan-hang-20-tinh-huong-su-pham-thuc-te');
      expect(viaMain).toBeDefined();
      expect(viaMain?.frontmatter.title).toContain('Ngân hàng 20 tình huống sư phạm');
    });

    it('nạp đúng module cho Bài 6.2 qua slug chính, shortcut aliases và getPedagogyLessonModule', () => {
      const aliases = [
        'gdh-c6-b2-de-cuong-cau-hoi-on-thi-tu-luan-trong-tam-va-dan-y-dap-an',
        'de-cuong-cau-hoi-on-thi-tu-luan-trong-tam-va-dan-y-dap-an',
        '6-2',
        'bai-6-2',
        'c6-b2',
        'de-cuong-on-tap',
      ];

      for (const slug of aliases) {
        const mod = getChapter6LessonModule(slug);
        expect(mod).toBeDefined();
        expect(mod?.frontmatter.title).toContain('Đề cương câu hỏi ôn thi tự luận');
        expect(mod?.lessonMeta.headings.length).toBeGreaterThanOrEqual(2);
      }

      const viaMain = getPedagogyLessonModule(
        'gdh-c6-b2-de-cuong-cau-hoi-on-thi-tu-luan-trong-tam-va-dan-y-dap-an',
      );
      expect(viaMain).toBeDefined();
      expect(viaMain?.frontmatter.title).toContain('Đề cương câu hỏi ôn thi tự luận');
    });

    it('hỗ trợ giải quyết đường dẫn qua resolveLessonShortcut và getLessonBySlug', () => {
      const resolved6_1 = resolveLessonShortcut('6-1');
      expect(resolved6_1).toBeDefined();
      expect(resolved6_1?.lesson.title).toContain('Ngân hàng 20 tình huống');

      const resolved6_2 = resolveLessonShortcut('6-2');
      expect(resolved6_2).toBeDefined();
      expect(resolved6_2?.lesson.title).toContain('Đề cương câu hỏi ôn thi');

      const bySlug6_1 = getLessonBySlug('giao-duc-hoc', 'chuong-6', '6-1');
      expect(bySlug6_1).toBeDefined();
      expect(bySlug6_1?.lesson.title).toContain('Ngân hàng 20 tình huống');

      const bySlug6_2 = getLessonBySlug('giao-duc-hoc', 'chuong-6', '6-2');
      expect(bySlug6_2).toBeDefined();
      expect(bySlug6_2?.lesson.title).toContain('Đề cương câu hỏi ôn thi');
    });

    it('render Lesson6_1View và tương tác chọn bộ lọc tình huống và xem gợi ý', () => {
      const mod = getChapter6LessonModule('6-1');
      expect(mod).toBeDefined();
      const Component = mod!.default;
      render(<Component />);

      expect(
        screen.getByText(/Quy trình Khoa học 5 Bước Xử lý Tình huống Sư phạm/i),
      ).toBeInTheDocument();
      expect(
        screen.getByText(/Ngân hàng 20 Tình huống Sư phạm Thực tế & Phương án Chuẩn/i),
      ).toBeInTheDocument();

      // Lọc danh mục: Nhóm 1: Chống đối & Kỷ cương
      const filterBtn = screen.getByRole('button', { name: /Chống đối & Kỷ cương/i });
      fireEvent.click(filterBtn);
      expect(
        screen.getByText(/Học sinh công khai cãi lại và bất hợp tác trong giờ học/i),
      ).toBeInTheDocument();

      // Tình huống 1 đã mở mặc định, kiểm tra nội dung
      expect(screen.getByText(/Bối cảnh tình huống thực tế/i)).toBeInTheDocument();
      expect(screen.getByText(/Phương án xử lý tối ưu theo chuẩn Sư phạm/i)).toBeInTheDocument();
      expect(screen.getByText(/Bẫy sư phạm cần tránh/i)).toBeInTheDocument();
    });

    it('render Lesson6_2View và tương tác mở dàn ý tự luận và làm trắc nghiệm', () => {
      const mod = getChapter6LessonModule('6-2');
      expect(mod).toBeDefined();
      const Component = mod!.default;
      render(<Component />);

      expect(
        screen.getByText(/Ma trận Đề thi & Phương pháp Làm bài Tự luận Đạt Điểm Cao/i),
      ).toBeInTheDocument();
      expect(
        screen.getByText(/Tuyển tập 10 Câu hỏi Tự luận Kinh điển & Barem Điểm Chi tiết/i),
      ).toBeInTheDocument();
      expect(
        screen.getByText(/Bộ 20 Câu hỏi Trắc nghiệm Khách quan Ôn tập Cuối kỳ/i),
      ).toBeInTheDocument();

      // Câu 1 tự luận mở mặc định, kiểm tra đề bài chi tiết và gợi ý Sư phạm Toán
      expect(screen.getByText(/Đề bài chi tiết:/i)).toBeInTheDocument();
      expect(
        screen.getAllByText(/Phân tích 5 đặc điểm của lao động sư phạm/i).length,
      ).toBeGreaterThanOrEqual(1);
      expect(screen.getByText(/Gợi ý liên hệ Bộ môn Sư phạm Toán/i)).toBeInTheDocument();

      // Kiểm tra trắc nghiệm câu 1
      const q1CorrectBtn = screen.getByRole('button', {
        name: /Nhân cách của người thầy giáo/i,
      });
      fireEvent.click(q1CorrectBtn);
      expect(screen.getByText(/Chính xác!/i)).toBeInTheDocument();
      expect(screen.getByText(/Theo Giáo trình HCMUE/i)).toBeInTheDocument();
    });
  });
});
