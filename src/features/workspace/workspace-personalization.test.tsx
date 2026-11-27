import { fireEvent, render, screen, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { beforeEach, describe, expect, it } from 'vitest';
import { HERITAGE_ARTWORKS } from '@/components/home/HeritageArtShowcase';
import { IslandProvider } from '@/context/IslandContext';
import { LayoutProvider } from '@/context/LayoutContext';
import { ReadingSettingsProvider } from '@/context/ReadingSettingsContext';
import { HERITAGE_MATH_CONNECTIONS } from '@/data/heritageMathConnections';
import { getSubjects } from '@/content-runtime/manifest';
import { AuthProvider } from '@/features/auth';
import { useLearningStore } from '@/features/learning';
import {
  addDaysLocal,
  computeDueReviewLessons,
  computeExamPacePlan,
  computeStudyActivityMetrics,
  getVietnameseTimeGreeting,
  normalizeDashboardLayout,
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

    // 1. Hero có câu tục ngữ, nền khí quyển, Chòm sao chương đang học (SVG tĩnh, bỏ khối 3D xoay cũ), sóng điều hòa tập trung & KHÔNG lặp thanh tìm kiếm
    expect(screen.getByTestId('dashboard-ambient-backdrop')).toBeInTheDocument();
    expect(screen.queryByTestId('dashboard-hero-orb-model')).not.toBeInTheDocument();
    const heroConstellation = screen.getByTestId('active-chapter-constellation');
    expect(heroConstellation).toBeInTheDocument();
    expect(within(heroConstellation).getAllByRole('link').length).toBeGreaterThan(0);
    // Sóng điều hòa trang trí & dòng lời chào cá nhân hóa đã gỡ để Hero tinh gọn hơn
    expect(screen.queryByTestId('dashboard-focus-wave')).not.toBeInTheDocument();
    expect(screen.queryByTestId('hero-personal-greeting')).not.toBeInTheDocument();
    expect(screen.getByTestId('calendar-sundial-ornament')).toBeInTheDocument();
    expect(screen.getByTestId('hero-time-greeting')).toBeInTheDocument();
    const periodBadge = screen.getByTestId('hero-period-badge');
    expect(periodBadge).toBeInTheDocument();
    expect(periodBadge).not.toHaveTextContent('Không gian Tổng quan');
    expect(screen.getByTestId('hero-soft-wave-divider')).toBeInTheDocument();
    expect(screen.queryByTestId('hero-floating-pill')).not.toBeInTheDocument();

    // 1b. Thẻ gộp "Nhịp học & Chuyên cần" (7 ngày ↔ Nhiệt đồ 28 ngày, không còn Donut/4 học phần lặp) + Kệ Studio gần đây
    expect(screen.getByTestId('dashboard-analytics-card')).toBeInTheDocument();
    expect(screen.queryByTestId('study-rhythm-card')).not.toBeInTheDocument();
    expect(screen.queryByTestId('analytics-donut-chart')).not.toBeInTheDocument();
    expect(screen.queryByTestId('analytics-mode-subjects')).not.toBeInTheDocument();
    expect(screen.getByTestId('analytics-week-bars')).toBeInTheDocument();
    fireEvent.click(screen.getByTestId('analytics-mode-heatmap'));
    expect(screen.getByTestId('study-activity-heatmap')).toBeInTheDocument();

    // 1c. Chống trùng chip bài trên màn hình rộng (chip chỉ hiện ở mobile, desktop hiện tóm tắt chương)
    expect(screen.getByTestId('resume-chapter-chips-mobile').className).toContain('md:hidden');
    expect(screen.getByTestId('resume-chapter-summary-desktop').className).toContain('md:flex');

    expect(screen.getByTestId('recent-studio-shelf')).toBeInTheDocument();
    const studioStrip = screen.getByTestId('studio-visual-preview-strip');
    expect(studioStrip.querySelectorAll('img')).toHaveLength(2);
    expect(screen.getByTestId('studio-recent-exam')).toBeInTheDocument();
    expect(screen.getByTestId('calendar-studio-section')).toBeInTheDocument();
    expect(screen.getByTestId('todo-empty-illustration')).toBeInTheDocument();

    // 2. 4 thẻ môn học dùng đồ họa vector toán học SVG thuần, KHÔNG có thẻ <img> phong cảnh và có lối tắt bài gần nhất
    const subjectsGrid = screen.getByTestId('dashboard-subjects-grid');
    expect(subjectsGrid.querySelectorAll('img')).toHaveLength(0);
    expect(screen.getByTestId('subject-svg-cau-truc-dai-so')).toBeInTheDocument();
    expect(screen.getByTestId('subject-svg-hinh-hoc-affine')).toBeInTheDocument();
    expect(screen.getByTestId('subject-svg-giai-tich-ham-mot-bien')).toBeInTheDocument();
    expect(screen.getByTestId('subject-svg-giao-duc-hoc')).toBeInTheDocument();
    expect(screen.getByTestId('dashboard-subject-recent-cau-truc-dai-so')).toBeInTheDocument();

    // 3. Kiểm tra nút + Thêm lúc trống hiện nhắc nhẹ + gợi ý nhanh, rồi thêm, sửa & hoàn thành To-Do
    fireEvent.click(screen.getByTestId('todo-add-submit'));
    expect(screen.getByTestId('todo-form-notice')).toHaveTextContent(/Nhập nội dung nhiệm vụ/i);

    const todoInput = screen.getByTestId('todo-title-input');
    fireEvent.change(todoInput, { target: { value: 'Chứng minh Định lý đẳng cấu thứ nhất' } });
    fireEvent.change(screen.getByTestId('todo-time-input'), { target: { value: '20:30' } });
    fireEvent.click(screen.getByTestId('todo-priority-toggle'));
    fireEvent.submit(screen.getByTestId('todo-add-form'));

    expect(screen.getByTestId('todo-form-notice')).toHaveTextContent(/Đã thêm vào lịch/i);
    const todoItems = screen.getAllByTestId('todo-item');
    expect(todoItems).toHaveLength(1);
    expect(todoItems[0]).toHaveTextContent('Chứng minh Định lý đẳng cấu thứ nhất');
    expect(todoItems[0]).toHaveTextContent('20:30');

    // Thẻ "Hôm nay" ở dock trên cùng phản chiếu việc đến hạn hôm nay
    expect(screen.getAllByTestId('today-task-item')).toHaveLength(1);
    expect(screen.getByTestId('today-task-item')).toHaveTextContent(
      'Chứng minh Định lý đẳng cấu thứ nhất',
    );

    // Sửa trực tiếp nhiệm vụ vừa thêm
    const editBtn = within(todoItems[0]!).getByRole('button', {
      name: /Sửa nhiệm vụ: Chứng minh Định lý đẳng cấu thứ nhất/i,
    });
    fireEvent.click(editBtn);
    fireEvent.change(screen.getByLabelText('Sửa tên nhiệm vụ'), {
      target: { value: 'Chứng minh Định lý đẳng cấu thứ nhất (Đã rà)' },
    });
    fireEvent.submit(screen.getByTestId('todo-edit-form'));
    expect(screen.getAllByTestId('todo-item')[0]).toHaveTextContent(
      'Chứng minh Định lý đẳng cấu thứ nhất (Đã rà)',
    );

    const checkBtn = within(screen.getAllByTestId('todo-item')[0]!).getByRole('button', {
      name: /Đánh dấu hoàn thành: Chứng minh Định lý đẳng cấu thứ nhất \(Đã rà\)/i,
    });
    fireEvent.click(checkBtn);
    expect(screen.getByTestId('study-streak-value')).toHaveTextContent('1');

    // 4. Ghim 1 mốc đếm ngược kỳ thi gắn với môn học -> hiển thị tiến độ & nhịp bài/ngày
    fireEvent.click(screen.getByTestId('exam-milestone-toggle'));
    const examInput = screen.getByLabelText('Tên mốc kỳ thi hoặc hạn nộp');
    fireEvent.change(examInput, { target: { value: 'Thi cuối kỳ Hình học Affine' } });
    fireEvent.change(screen.getByLabelText('Học phần kỳ thi'), {
      target: { value: 'hinh-hoc-affine' },
    });
    fireEvent.submit(screen.getByTestId('exam-milestone-form'));
    expect(screen.getByTestId('exam-milestone-item')).toHaveTextContent(
      'Thi cuối kỳ Hình học Affine',
    );
    expect(screen.getByTestId('exam-milestone-pace')).toHaveTextContent(/chưa học/i);

    // 5. Chỉnh mục tiêu học tập theo tuần (nằm ngay trong thẻ Nhịp học & Chuyên cần đã gộp)
    fireEvent.click(screen.getByTestId('weekly-goal-edit-toggle'));
    fireEvent.change(screen.getByLabelText('Mục tiêu số bài mỗi tuần'), {
      target: { value: '9' },
    });
    fireEvent.submit(screen.getByTestId('weekly-goal-form'));
    expect(screen.getByTestId('weekly-goal-lessons-ratio')).toHaveTextContent('/9');

    // 6. Di sản trong ngày có dòng Liên hệ Toán học / Học phần
    expect(screen.getByTestId('heritage-math-connection')).toHaveTextContent(/Liên hệ học phần/i);

    // 7. Chế độ Flashcard ôn nhanh & tab Ôn tập hôm nay trên thẻ Ôn tập
    fireEvent.click(screen.getByTestId('glossary-flashcard-toggle'));
    expect(screen.getByTestId('glossary-flashcard-stage')).toBeInTheDocument();
    expect(screen.queryByTestId('glossary-flashcard-answer')).not.toBeInTheDocument();
    fireEvent.click(screen.getByTestId('glossary-flashcard-reveal'));
    expect(screen.getByTestId('glossary-flashcard-answer')).toBeInTheDocument();

    // 8. Tùy chỉnh ẩn/hiện & sắp xếp các tầng trên Trang Tổng quan
    fireEvent.click(screen.getByTestId('dashboard-layout-trigger'));
    expect(screen.getByTestId('dashboard-layout-panel')).toBeInTheDocument();
    fireEvent.click(screen.getByTestId('layout-toggle-heritage'));
    expect(screen.queryByTestId('dashboard-heritage-card')).not.toBeInTheDocument();
    expect(screen.getByTestId('dashboard-layout-hidden-badge')).toHaveTextContent('Ẩn 1');
    fireEvent.click(screen.getByTestId('dashboard-layout-reset'));
    expect(screen.getByTestId('dashboard-heritage-card')).toBeInTheDocument();
  });

  it('computeExamPacePlan tính chính xác nhịp ôn tập theo số ngày còn lại và bài chưa học', () => {
    const plan = computeExamPacePlan({
      daysUntil: 12,
      completedCount: 4,
      lessonCount: 12,
      subjectCode: 'CTĐS',
    });
    expect(plan).not.toBeNull();
    expect(plan?.remainingLessons).toBe(8);
    expect(plan?.summary).toBe('Còn 8 bài CTĐS chưa học → khoảng 1 bài/ngày');
    expect(plan?.urgency).toBe('comfortable');

    const readyPlan = computeExamPacePlan({
      daysUntil: 5,
      completedCount: 10,
      lessonCount: 10,
      subjectCode: 'HHAVE',
    });
    expect(readyPlan?.urgency).toBe('ready');

    const slowPlan = computeExamPacePlan({
      daysUntil: 20,
      completedCount: 6,
      lessonCount: 10,
      subjectCode: 'GDH',
    });
    expect(slowPlan?.summary).toBe('Còn 4 bài GDH chưa học → khoảng 1 bài/5 ngày');
  });

  it('computeDueReviewLessons lọc chính xác bài cần ôn theo chu kỳ 1 / 3 / 7 ngày và tôn trọng trạng thái đã ôn', () => {
    const now = new Date(2026, 10, 27, 14, 0, 0);
    const d1 = addDaysLocal(now, -1).toISOString();
    const d2 = addDaysLocal(now, -2).toISOString();
    const d3 = addDaysLocal(now, -3).toISOString();
    const d7 = addDaysLocal(now, -7).toISOString();
    const todayKey = toLocalDateKey(now);

    const due = computeDueReviewLessons({
      completedLessons: {
        'ls-1': d1,
        'ls-2': d2,
        'ls-3': d3,
        'ls-7': d7,
      },
      reviewedLessons: {
        'ls-3': todayKey,
      },
      now,
    });

    expect(due.map((d) => [d.lessonId, d.intervalDays, d.reviewedToday])).toEqual([
      ['ls-1', 1, false],
      ['ls-7', 7, false],
      ['ls-3', 3, true],
    ]);
  });

  it('lưu tách biệt thứ tự & ẩn/hiện các tầng Trang Tổng quan theo từng tài khoản', () => {
    const store = useWorkspaceStore.getState();

    store.setActiveAccount('user-layout-a');
    store.toggleDashboardSection('heritage');
    store.moveDashboardSection('planner', 'up');

    const layoutA = normalizeDashboardLayout(
      selectActiveWorkspaceBucket(useWorkspaceStore.getState()).dashboardLayout,
    );
    expect(layoutA.hidden).toEqual(['heritage']);
    expect(layoutA.order.indexOf('planner')).toBe(2);

    // Chuyển sang tài khoản B -> bố cục vẫn là mặc định
    store.setActiveAccount('user-layout-b');
    const layoutB = normalizeDashboardLayout(
      selectActiveWorkspaceBucket(useWorkspaceStore.getState()).dashboardLayout,
    );
    expect(layoutB.hidden).toEqual([]);
    expect(layoutB.order.indexOf('planner')).toBe(3);

    // Quay lại tài khoản A -> vẫn nguyên cấu hình
    store.setActiveAccount('user-layout-a');
    const restoredA = normalizeDashboardLayout(
      selectActiveWorkspaceBucket(useWorkspaceStore.getState()).dashboardLayout,
    );
    expect(restoredA.hidden).toEqual(['heritage']);
    expect(restoredA.order.indexOf('planner')).toBe(2);
  });

  it('HomePage tự động hiển thị danh sách Ôn tập hôm nay khi có bài hoàn thành cách 1/3/7 ngày và cho phép đánh dấu đã ôn', () => {
    const firstLesson = getSubjects()[0]?.chapters[0]?.lessons[0];
    expect(firstLesson).toBeDefined();

    const yesterdayIso = addDaysLocal(new Date(), -1).toISOString();
    useLearningStore.setState({
      completedLessons: {
        [firstLesson!.id]: yesterdayIso,
      },
    });

    renderHome();

    // Có bài đến kỳ ôn -> thẻ mặc định mở tab Ôn tập hôm nay với badge 1
    expect(screen.getByTestId('daily-review-lessons-panel')).toBeInTheDocument();
    expect(screen.getByTestId('review-pending-badge')).toHaveTextContent('1');
    expect(screen.getByTestId('due-review-item')).toHaveTextContent(firstLesson!.title);
    expect(screen.getByTestId('due-review-item')).toHaveTextContent('Sau 1 ngày');

    // Đánh dấu đã ôn hôm nay
    fireEvent.click(screen.getByTestId(`mark-reviewed-${firstLesson!.id}`));
    expect(screen.queryByTestId('review-pending-badge')).not.toBeInTheDocument();
  });
});
