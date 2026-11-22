export type ExamPartKind = 'multiple-choice' | 'true-false' | 'short-answer' | 'essay';

export type OptionColumnsMode = 'auto' | 1 | 2 | 4;

export type OptionLetter = 'A' | 'B' | 'C' | 'D';

export type StatementLetter = 'a' | 'b' | 'c' | 'd';

export interface ExamChoiceOption {
  readonly label: OptionLetter;
  readonly content: string;
}

export interface ExamTrueFalseStatement {
  readonly label: StatementLetter;
  readonly content: string;
  readonly isTrue: boolean | null;
}

export interface ExamImageAttachment {
  readonly id: string;
  readonly dataUrl: string;
  readonly caption?: string;
  readonly widthPercent: number;
}

export interface ExamQuestion {
  readonly id: string;
  readonly kind: ExamPartKind;
  /** Số thứ tự hiển thị (1, 2, 3...) trong phạm vi phần hiện tại */
  readonly number: number;
  /** Thân câu hỏi (có thể chứa công thức toán, bảng Markdown, gạch đầu dòng `+ ...`) */
  readonly stem: string;
  /** Phương án cho câu Trắc nghiệm nhiều lựa chọn (PHẦN I) */
  readonly options?: readonly ExamChoiceOption[];
  readonly correctOption?: OptionLetter | null;
  readonly columnsMode?: OptionColumnsMode;
  /** 4 ý a), b), c), d) cho câu Đúng/Sai (PHẦN II) */
  readonly statements?: readonly ExamTrueFalseStatement[];
  /** Đáp án ngắn (PHẦN III) hoặc gợi ý chấm (PHẦN IV) */
  readonly shortAnswer?: string;
  /** Hình vẽ minh họa đính kèm trực tiếp cho câu hỏi (lưu cục bộ dạng DataURL) */
  readonly image?: ExamImageAttachment | null;
}

export interface ExamPart {
  readonly id: string;
  readonly kind: ExamPartKind;
  /** Nhãn phần, VD: "PHẦN I", "PHẦN II", "PHẦN III" */
  readonly label: string;
  /** Dòng hướng dẫn làm bài chuẩn PDF, VD: "Thí sinh trả lời từ câu 1 đến câu 12..." */
  readonly instruction: string;
  readonly questions: readonly ExamQuestion[];
}

export interface ExamDocument {
  readonly id: string;
  /** CHỈ giữ Tên đề kiểm tra ở đầu trang (không in khối Bộ GD&ĐT / Họ tên / SBD / Mã đề) */
  readonly title: string;
  /** Văn bản nguồn ở chế độ Soạn nhanh thông minh */
  readonly rawMarkup: string;
  /** Bật tự động nhận diện ký hiệu toán học viết tắt khi biên đề */
  readonly autoRecognizeMath: boolean;
  /** Hiển thị dòng "---------- HẾT ----------" ở cuối đề */
  readonly showEndLine: boolean;
  /** Hiển thị bảng đáp án cuối đề */
  readonly showAnswerKey: boolean;
  /** Kho ảnh cục bộ tham chiếu trong văn bản qua cú pháp `[HÌNH:img-id]` */
  readonly images: Readonly<Record<string, ExamImageAttachment>>;
  readonly updatedAt: string;
}

export interface ParsedExamStructure {
  readonly title: string;
  readonly parts: readonly ExamPart[];
  readonly totalQuestions: number;
}
