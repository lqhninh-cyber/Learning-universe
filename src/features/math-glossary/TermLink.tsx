import { MathGlossaryTerm, type MathGlossaryTermProps } from './MathGlossaryTerm';

export interface TermLinkProps extends MathGlossaryTermProps {
  readonly term?: string;
  readonly scope?: string;
}

/**
 * Component liên kết tra cứu nhanh thuật ngữ (Quick Glossary Popover Trigger).
 * Hỗ trợ nhận prop term, scope, currentCourseId:
 * - Tự động nhận diện ngữ cảnh môn học từ route hiện tại.
 * - Hỗ trợ prop scope ghi đè nếu bài viết muốn nhắc đến môn khác (ví dụ: scope="cau-truc-dai-so").
 */
export function TermLink(props: TermLinkProps) {
  return <MathGlossaryTerm {...props} />;
}

export default TermLink;
