import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { getSubjectBySlug, getSubjects } from '@/content-runtime';
import { getChapter1LessonModule } from '@/data/courses/giao-duc-hoc/chapter-1';
import {
  EDUCATIONAL_PRINCIPLES,
  GIAO_DUC_HOC_SUBJECT,
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
      expect(gdh?.curriculum?.lessonCount).toBe(18);
    });

    it('đảm bảo tất cả 18 bài học có đầy đủ estimatedMinutes và status published', () => {
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
      expect(totalLessons).toBe(18);
    });

    it('Chương 1 có đủ 4 bài học chi tiết theo chuẩn CLO 1, CLO 2, CLO 3', () => {
      const ch1 = GIAO_DUC_HOC_SUBJECT.chapters[0]!;
      expect(ch1.lessons.length).toBe(4);
      expect(ch1.lessons[0]!.slug).toBe('hoat-dong-su-pham-cua-nguoi-giao-vien');
      expect(ch1.lessons[1]!.slug).toBe('nhan-cach-va-chuan-nghe-nghiep-giao-vien-pho-thong');
      expect(ch1.lessons[2]!.slug).toBe('ren-luyen-de-tro-thanh-nguoi-giao-vien-hieu-qua');
      expect(ch1.lessons[3]!.slug).toBe('tinh-huong-su-pham-va-de-cuong-on-tap-chuong-1');
    });

    it('tích hợp đủ 13 tài liệu học phần và văn bản pháp quy', () => {
      expect(PEDAGOGY_DOCUMENTS.length).toBe(13);
      expect(PEDAGOGY_DOCUMENTS.some((d) => d.id === 'gt-gdh-hcmue')).toBe(true);
      expect(PEDAGOGY_DOCUMENTS.some((d) => d.id === 'luat-giao-duc-2019')).toBe(true);
      expect(PEDAGOGY_DOCUMENTS.some((d) => d.id === 'chuan-nghe-nghiep-gv-tt20')).toBe(true);
      expect(PEDAGOGY_DOCUMENTS.some((d) => d.id === 'dieu-le-truong-trung-hoc-tt32')).toBe(true);
      expect(PEDAGOGY_DOCUMENTS.some((d) => d.id === 'tt17-sua-doi-ctgdpt')).toBe(true);
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
});
