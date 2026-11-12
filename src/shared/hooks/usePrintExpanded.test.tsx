import { act, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { TooltipProvider } from '@/shared/ui/Tooltip';
import { Collapsible } from '@/shared/ui/Collapsible';
import { ExamSheetPaperView } from '@/features/exams/ExamSheetPaperView';
import { MATH1301_EXAM_BANK } from '@/data/courses/cau-truc-dai-so/exam-bank';

describe('Tự động mở rộng nội dung thu gọn khi in (beforeprint / afterprint)', () => {
  it('mở tạm thời khối Collapsible khi in và khôi phục trạng thái đóng sau khi in', () => {
    render(
      <Collapsible title="Chứng minh định lý" defaultOpen={false}>
        <p>Nội dung chứng minh chi tiết cần xuất hiện khi in.</p>
      </Collapsible>,
    );

    expect(screen.queryByText('Nội dung chứng minh chi tiết cần xuất hiện khi in.')).toBeNull();

    act(() => {
      window.dispatchEvent(new Event('beforeprint'));
    });

    expect(
      screen.getByText('Nội dung chứng minh chi tiết cần xuất hiện khi in.'),
    ).toBeInTheDocument();

    act(() => {
      window.dispatchEvent(new Event('afterprint'));
    });

    expect(screen.queryByText('Nội dung chứng minh chi tiết cần xuất hiện khi in.')).toBeNull();
  });

  it('tự động bung phần lời giải trên Tờ đề thi (ExamSheetPaperView) trong khi in', () => {
    render(
      <TooltipProvider>
        <ExamSheetPaperView paper={MATH1301_EXAM_BANK.officialExams[0]!} />
      </TooltipProvider>,
    );

    const toggleBtn = screen.getByRole('button', { name: /Hiện lời giải chi tiết/i });
    expect(toggleBtn).toHaveAttribute('aria-expanded', 'false');

    act(() => {
      window.dispatchEvent(new Event('beforeprint'));
    });

    expect(screen.getByRole('button', { name: /Ẩn lời giải chi tiết/i })).toHaveAttribute(
      'aria-expanded',
      'true',
    );

    act(() => {
      window.dispatchEvent(new Event('afterprint'));
    });

    expect(screen.getByRole('button', { name: /Hiện lời giải chi tiết/i })).toHaveAttribute(
      'aria-expanded',
      'false',
    );
  });
});
