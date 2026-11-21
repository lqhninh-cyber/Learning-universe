import { fireEvent, render, screen, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { beforeEach, describe, expect, it } from 'vitest';
import { HERITAGE_ARTWORKS } from '@/components/home/HeritageArtShowcase';
import { IslandProvider } from '@/context/IslandContext';
import { LayoutProvider } from '@/context/LayoutContext';
import { ReadingSettingsProvider } from '@/context/ReadingSettingsContext';
import { HERITAGE_MATH_CONNECTIONS } from '@/data/heritageMathConnections';
import { AuthProvider } from '@/features/auth';
import { useLearningStore } from '@/features/learning';
import {
  addDaysLocal,
  computeStudyActivityMetrics,
  getVietnameseTimeGreeting,
  selectActiveWorkspaceBucket,
  toLocalDateKey,
  useWorkspaceStore,
} from '@/features/workspace';
import { HomePage } from '@/pages/home/HomePage';

function renderHome() {
  return render(
    <MemoryRouter initialEntries={['/']}>
      <AuthProvider>
        <LayoutProvider>
          <ReadingSettingsProvider>
            <IslandProvider initialPathname="/">
              <HomePage />
            </IslandProvider>
          </ReadingSettingsProvider>
        </LayoutProvider>
      </AuthProvider>
    </MemoryRouter>,
  );
}

describe('Tính năng Cá nhân hóa Trang Tổng quan (Step 1)', () => {
  beforeEach(() => {
    useWorkspaceStore.getState().resetWorkspaceStore();
    useLearningStore.getState().resetLearningStore();
    window.localStorage.clear();
  });

  it('Lời chào thích ứng đổi đúng sắc thái theo 4 khung giờ và gắn tên học viên tự nhiên', () => {
    const morning = getVietnameseTimeGreeting(new Date(2026, 10, 22, 8, 15), 'Nguyễn Văn Minh');
    expect(morning.period).toBe('morning');
    expect(morning.headline).toBe('Chào buổi sáng, Văn Minh');

    const afternoon = getVietnameseTimeGreeting(new Date(2026, 10, 22, 14, 30), 'Lan Anh');
    expect(afternoon.period).toBe('afternoon');
    expect(afternoon.headline).toBe('Phiên học chiều, Lan Anh');

    const evening = getVietnameseTimeGreeting(new Date(2026, 10, 22, 19, 45), null);
    expect(evening.period).toBe('evening');
    expect(evening.headline).toBe('Buổi tối ôn luyện');

    const night = getVietnameseTimeGreeting(new Date(2026, 10, 22, 23, 50), 'Hoàng');
    expect(night.period).toBe('night');
    expect(night.headline).toBe('Tĩnh lặng đêm khuya, Hoàng');
  });

  it('tách biệt tuyệt đối dữ liệu To-Do, mốc kỳ thi, mục tiêu tuần và Pomodoro theo từng tài khoản (user.id)', () => {
    const store = useWorkspaceStore.getState();

    // Tài khoản A thêm nhiệm vụ, mốc thi và chỉnh mục tiêu tuần
    store.setActiveAccount('user-alpha');
    store.addTask({ title: 'Ôn định lý Lagrange', subjectSlug: 'cau-truc-dai-so' });
    store.addMilestone({
      title: 'Thi giữa kỳ CTĐS',
      examDate: '2026-12-10',
      subjectSlug: 'cau-truc-dai-so',
    });
    store.updateWeeklyGoal({ targetLessons: 8, targetPomodoros: 10 });
    store.recordPomodoroCompleted('2026-11-22T08:00:00.000Z');

    const alphaBucket = selectActiveWorkspaceBucket(useWorkspaceStore.getState());
    expect(alphaBucket.tasks).toHaveLength(1);
    expect(alphaBucket.milestones).toHaveLength(1);
    expect(alphaBucket.weeklyGoal.targetLessons).toBe(8);
    expect(alphaBucket.pomodoroLogs).toHaveLength(1);

    // Chuyển sang Tài khoản B -> hoàn toàn sạch, không rò rỉ dữ liệu của Tài khoản A
    store.setActiveAccount('user-beta');
    const betaBucket = selectActiveWorkspaceBucket(useWorkspaceStore.getState());
    expect(betaBucket.tasks).toHaveLength(0);
    expect(betaBucket.milestones).toHaveLength(0);
    expect(betaBucket.weeklyGoal.targetLessons).toBe(5);
    expect(betaBucket.pomodoroLogs).toHaveLength(0);

    // Quay lại Tài khoản A -> dữ liệu vẫn nguyên vẹn
    store.setActiveAccount('user-alpha');
    const restoredAlpha = selectActiveWorkspaceBucket(useWorkspaceStore.getState());
    expect(restoredAlpha.tasks[0]?.title).toBe('Ôn định lý Lagrange');
    expect(restoredAlpha.milestones[0]?.title).toBe('Thi giữa kỳ CTĐS');
  });

  it('tính chính xác chuỗi ngày học (Streak), bản đồ nhiệt 28 ngày và thống kê tuần', () => {
    const now = new Date(2026, 10, 22, 15, 0, 0); // Chủ Nhật 22/11/2026
    const d0 = now.toISOString();
    const d1 = addDaysLocal(now, -1).toISOString();
    const d2 = addDaysLocal(now, -2).toISOString();

    const metrics = computeStudyActivityMetrics({
      completedLessons: {
        'lesson-1': d0,
        'lesson-2': d1,
      },
      tasks: [
        {
          id: 't1',
          title: 'Giải bài tập nhóm thương',
          dueDate: toLocalDateKey(addDaysLocal(now, -2)),
          subjectSlug: 'cau-truc-dai-so',
          priority: 'normal',
          completed: true,
          completedAt: d2,
          createdAt: d2,
          updatedAt: d2,
        },
      ],
      pomodoroLogs: [d0, d0],
      now,
    });

    expect(metrics.currentStreak).toBe(3);
    expect(metrics.bestStreak).toBe(3);
    expect(metrics.activeDaysLast28).toBe(3);
    expect(metrics.weekLessonsCount).toBe(2);
    expect(metrics.weekPomodorosCount).toBe(2);
    expect(metrics.heatmapDays).toHaveLength(28);
    expect(metrics.heatmapDays[27]?.count).toBe(3);
    expect(metrics.heatmapDays[27]?.level).toBe(2);
  });

  it('ánh xạ đầy đủ 40/40 tác phẩm Di sản với câu liên hệ Toán học / Sư phạm gắn chặt 4 học phần', () => {
    expect(HERITAGE_ARTWORKS).toHaveLength(40);
    for (const artwork of HERITAGE_ARTWORKS) {
      const mapping = HERITAGE_MATH_CONNECTIONS[artwork.id];
      expect(mapping, `Thiếu liên hệ toán học cho tác phẩm: ${artwork.id}`).toBeDefined();
      expect(mapping?.connection.length).toBeGreaterThan(20);
    }
  });

  it('HomePage không lặp tìm kiếm ở Hero, dùng SVG toán học (0 ảnh phong cảnh) cho 4 môn và vận hành đầy đủ To-Do, Lịch, Mốc thi, Mục tiêu tuần & Flashcard', () => {
    renderHome();

    // 1. Hero có lời chào thích ứng & KHÔNG lặp thanh tìm kiếm
    expect(screen.getByTestId('hero-time-greeting')).toBeInTheDocument();
    expect(screen.getByTestId('hero-period-badge')).toBeInTheDocument();
    expect(screen.queryByTestId('hero-floating-pill')).not.toBeInTheDocument();

    // 2. 4 thẻ môn học dùng đồ họa vector toán học SVG thuần, KHÔNG có thẻ <img> phong cảnh và có lối tắt bài gần nhất
    const subjectsGrid = screen.getByTestId('dashboard-subjects-grid');
    expect(subjectsGrid.querySelectorAll('img')).toHaveLength(0);
    expect(screen.getByTestId('subject-svg-cau-truc-dai-so')).toBeInTheDocument();
    expect(screen.getByTestId('subject-svg-hinh-hoc-affine')).toBeInTheDocument();
    expect(screen.getByTestId('subject-svg-giai-tich-ham-mot-bien')).toBeInTheDocument();
    expect(screen.getByTestId('subject-svg-giao-duc-hoc')).toBeInTheDocument();
    expect(screen.getByTestId('dashboard-subject-recent-cau-truc-dai-so')).toBeInTheDocument();

    // 3. Thêm & hoàn thành 1 nhiệm vụ To-Do -> tự động cập nhật chuỗi ngày học
    const todoInput = screen.getByTestId('todo-title-input');
    fireEvent.change(todoInput, { target: { value: 'Chứng minh Định lý đẳng cấu thứ nhất' } });
    fireEvent.submit(screen.getByTestId('todo-add-form'));

    const todoItems = screen.getAllByTestId('todo-item');
    expect(todoItems).toHaveLength(1);
    expect(todoItems[0]).toHaveTextContent('Chứng minh Định lý đẳng cấu thứ nhất');

    const checkBtn = within(todoItems[0]!).getByRole('button', {
      name: /Đánh dấu hoàn thành: Chứng minh Định lý đẳng cấu thứ nhất/i,
    });
    fireEvent.click(checkBtn);
    expect(screen.getByTestId('study-streak-value')).toHaveTextContent('1');

    // 4. Ghim 1 mốc đếm ngược kỳ thi trên Lịch biểu
    fireEvent.click(screen.getByTestId('exam-milestone-toggle'));
    const examInput = screen.getByLabelText('Tên mốc kỳ thi hoặc hạn nộp');
    fireEvent.change(examInput, { target: { value: 'Thi cuối kỳ Hình học Affine' } });
    fireEvent.submit(screen.getByTestId('exam-milestone-form'));
    expect(screen.getByTestId('exam-milestone-item')).toHaveTextContent(
      'Thi cuối kỳ Hình học Affine',
    );

    // 5. Chỉnh mục tiêu học tập theo tuần
    fireEvent.click(screen.getByTestId('weekly-goal-edit-toggle'));
    fireEvent.change(screen.getByLabelText('Mục tiêu số bài mỗi tuần'), {
      target: { value: '9' },
    });
    fireEvent.submit(screen.getByTestId('weekly-goal-form'));
    expect(screen.getByTestId('weekly-goal-lessons-ratio')).toHaveTextContent('/9');

    // 6. Di sản trong ngày có dòng Liên hệ Toán học / Học phần
    expect(screen.getByTestId('heritage-math-connection')).toHaveTextContent(/Liên hệ học phần/i);

    // 7. Chế độ Flashcard ôn nhanh trên thẻ Thuật ngữ ngẫu nhiên
    fireEvent.click(screen.getByTestId('glossary-flashcard-toggle'));
    expect(screen.getByTestId('glossary-flashcard-stage')).toBeInTheDocument();
    expect(screen.queryByTestId('glossary-flashcard-answer')).not.toBeInTheDocument();
    fireEvent.click(screen.getByTestId('glossary-flashcard-reveal'));
    expect(screen.getByTestId('glossary-flashcard-answer')).toBeInTheDocument();
  });
});
