/**
 * Kiểu dữ liệu chuẩn hóa cho Ngân hàng Đề thi, Ma trận Đặc tả và Đề ôn tập mẫu.
 * Tương thích hoàn toàn với `ExamProblem` / `ExamPaper` của hệ thống đề thi hiện tại.
 */

export type ExamQuestionPrefix = 'Câu' | 'Bài';

export interface ExamProblemPart {
  readonly label: string;
  readonly points?: number;
  readonly statement: string;
  readonly hint?: string;
  readonly solution: string;
}

export interface ExamSheetHeader {
  readonly leftLines: readonly string[];
  readonly rightTitle: string;
  readonly rightSubtitle: string;
  readonly metaRows: readonly string[];
}

export interface ExamProblem {
  readonly id: string;
  readonly number: number;
  readonly points: number;
  readonly labelPrefix?: ExamQuestionPrefix;
  readonly title?: string;
  readonly sheetHeading?: string;
  readonly inlineSheetHeading?: boolean;
  readonly partDelimiter?: ')' | '.';
  readonly statement?: string;
  readonly hint?: string;
  readonly solution?: string;
  readonly solutionRubric?: string;
  readonly parts?: readonly ExamProblemPart[];
}

export interface ExamPaper {
  readonly id: string;
  readonly year: string;
  readonly semester: string;
  readonly examCourseCode?: string;
  readonly allowedMaterials?: string;
  readonly durationMinutes: number;
  readonly title: string;
  readonly description: string;
  readonly questionPrefix?: ExamQuestionPrefix;
  readonly originalImagePath?: string;
  readonly sheetHeader?: ExamSheetHeader;
  readonly endMarker?: string;
  readonly sheetNotesHeading?: string;
  readonly sheetNotes?: readonly string[];
  readonly isMockExam?: boolean;
  readonly mockBannerLabel?: string;
  readonly problems: readonly ExamProblem[];
}

export interface MatrixDistributionSegment {
  readonly id: string;
  readonly label: string;
  readonly percentage: number;
  readonly pointsSummary: string;
  readonly description: string;
  readonly tone: 'primary' | 'secondary' | 'accent';
}

export interface MatrixSpecificationRow {
  readonly id: string;
  readonly itemLabel: string;
  readonly points: string;
  readonly topic: string;
  readonly coreSkills: string;
  readonly examStrategy: string;
}

export interface FocusChecklistItem {
  readonly id: string;
  readonly title: string;
  readonly summary: string;
  readonly keyFormulas?: readonly string[];
}

export interface FocusChecklistGroup {
  readonly id: string;
  readonly title: string;
  readonly badge: string;
  readonly description?: string;
  readonly items: readonly FocusChecklistItem[];
}

export interface ExamMatrixAnalysis {
  readonly headline: string;
  readonly summary: string;
  readonly structureSummary: string;
  readonly distribution: readonly MatrixDistributionSegment[];
  readonly specificationRows: readonly MatrixSpecificationRow[];
  readonly focusChecklists: readonly FocusChecklistGroup[];
}

export interface CourseExamBank {
  readonly subjectSlug: 'cau-truc-dai-so' | 'hinh-hoc-affine';
  readonly courseCode: 'MATH1301' | 'MATH1302';
  readonly examCourseCode: string;
  readonly courseTitle: string;
  readonly subtitle: string;
  readonly officialExams: readonly ExamPaper[];
  readonly matrixAnalysis: ExamMatrixAnalysis;
  readonly mockExams: readonly ExamPaper[];
}
