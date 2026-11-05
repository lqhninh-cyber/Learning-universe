import { MathGlossaryTerm, type MathGlossaryTermProps } from './MathGlossaryTerm';

export interface TermLinkProps extends MathGlossaryTermProps {
  readonly term?: string;
}

/**
 * Component liên kết tra cứu nhanh thuật ngữ (Quick Glossary Popover Trigger).
 * Hỗ trợ nhận prop term và currentCourseId, tự động truy xuất từ điển phù hợp ngữ cảnh môn học.
 */
export function TermLink(props: TermLinkProps) {
  return <MathGlossaryTerm {...props} />;
}

export default TermLink;
