import {
  DEFAULT_WEEKLY_GOAL,
  isWorkspaceSubjectSlug,
  type ExamMilestoneItem,
  type StudyTaskItem,
  type WeeklyStudyGoal,
} from '@/features/workspace/types';
import { isSupabaseConfigured, supabase } from './client';

export interface CloudWorkspacePayload {
  readonly tasks: readonly StudyTaskItem[];
  readonly milestones: readonly ExamMilestoneItem[];
  readonly weeklyGoal?: WeeklyStudyGoal;
  readonly pomodoroLogs?: readonly string[];
}

export async function fetchUserWorkspaceData(
  userId: string,
): Promise<CloudWorkspacePayload | null> {
  if (!supabase || !isSupabaseConfigured || import.meta.env.MODE === 'test') return null;

  try {
    const [tasksRes, milestonesRes, prefsRes] = await Promise.all([
      supabase.from('user_study_tasks').select('*').eq('user_id', userId),
      supabase.from('user_exam_milestones').select('*').eq('user_id', userId),
      supabase.from('user_study_preferences').select('*').eq('user_id', userId).maybeSingle(),
    ]);

    const tasks: StudyTaskItem[] = [];
    if (!tasksRes.error && Array.isArray(tasksRes.data)) {
      for (const raw of tasksRes.data) {
        const row = raw as Record<string, unknown>;
        const id = typeof row.id === 'string' ? row.id : '';
        const title = typeof row.title === 'string' ? row.title : '';
        const dueDate = typeof row.due_date === 'string' ? row.due_date.slice(0, 10) : '';
        if (!id || !title || !dueDate) continue;
        tasks.push({
          id,
          title,
          dueDate,
          subjectSlug: isWorkspaceSubjectSlug(row.subject_slug) ? row.subject_slug : null,
          priority: row.priority === 'high' ? 'high' : 'normal',
          completed: Boolean(row.completed),
          completedAt: typeof row.completed_at === 'string' ? row.completed_at : null,
          createdAt: typeof row.created_at === 'string' ? row.created_at : new Date().toISOString(),
          updatedAt: typeof row.updated_at === 'string' ? row.updated_at : new Date().toISOString(),
        });
      }
    }

    const milestones: ExamMilestoneItem[] = [];
    if (!milestonesRes.error && Array.isArray(milestonesRes.data)) {
      for (const raw of milestonesRes.data) {
        const row = raw as Record<string, unknown>;
        const id = typeof row.id === 'string' ? row.id : '';
        const title = typeof row.title === 'string' ? row.title : '';
        const examDate = typeof row.exam_date === 'string' ? row.exam_date.slice(0, 10) : '';
        if (!id || !title || !examDate) continue;
        milestones.push({
          id,
          title,
          examDate,
          subjectSlug: isWorkspaceSubjectSlug(row.subject_slug) ? row.subject_slug : null,
          createdAt: typeof row.created_at === 'string' ? row.created_at : new Date().toISOString(),
        });
      }
    }

    let weeklyGoal: WeeklyStudyGoal | undefined;
    let pomodoroLogs: string[] | undefined;
    if (!prefsRes.error && prefsRes.data) {
      const prefRow = prefsRes.data as Record<string, unknown>;
      const targetLessons = Number(prefRow.weekly_lesson_goal);
      const targetPomodoros = Number(prefRow.weekly_pomodoro_goal);
      weeklyGoal = {
        targetLessons:
          Number.isFinite(targetLessons) && targetLessons >= 1
            ? targetLessons
            : DEFAULT_WEEKLY_GOAL.targetLessons,
        targetPomodoros:
          Number.isFinite(targetPomodoros) && targetPomodoros >= 1
            ? targetPomodoros
            : DEFAULT_WEEKLY_GOAL.targetPomodoros,
      };
      if (Array.isArray(prefRow.pomodoro_logs)) {
        pomodoroLogs = prefRow.pomodoro_logs.filter(
          (item): item is string => typeof item === 'string',
        );
      }
    }

    // Nếu cả 3 bảng đều báo lỗi (chưa chạy migration SQL), trả về null để không ghi đè dữ liệu cục bộ
    if (tasksRes.error && milestonesRes.error && prefsRes.error) {
      return null;
    }

    return { tasks, milestones, weeklyGoal, pomodoroLogs };
  } catch (err) {
    console.warn('[Learning Universe] Không thể nạp dữ liệu không gian cá nhân từ Supabase:', err);
    return null;
  }
}

export async function syncStudyTaskToSupabase(userId: string, task: StudyTaskItem): Promise<void> {
  if (!supabase || !isSupabaseConfigured || import.meta.env.MODE === 'test') return;
  try {
    await supabase.from('user_study_tasks').upsert({
      user_id: userId,
      id: task.id,
      title: task.title,
      due_date: task.dueDate,
      subject_slug: task.subjectSlug,
      priority: task.priority,
      completed: task.completed,
      completed_at: task.completedAt,
      created_at: task.createdAt,
      updated_at: task.updatedAt,
    });
  } catch (err) {
    console.warn('[Learning Universe] Không thể đồng bộ nhiệm vụ học tập:', err);
  }
}

export async function deleteStudyTaskFromSupabase(userId: string, taskId: string): Promise<void> {
  if (!supabase || !isSupabaseConfigured || import.meta.env.MODE === 'test') return;
  try {
    await supabase.from('user_study_tasks').delete().eq('user_id', userId).eq('id', taskId);
  } catch (err) {
    console.warn('[Learning Universe] Không thể xóa nhiệm vụ trên Supabase:', err);
  }
}

export async function syncExamMilestoneToSupabase(
  userId: string,
  milestone: ExamMilestoneItem,
): Promise<void> {
  if (!supabase || !isSupabaseConfigured || import.meta.env.MODE === 'test') return;
  try {
    await supabase.from('user_exam_milestones').upsert({
      user_id: userId,
      id: milestone.id,
      title: milestone.title,
      exam_date: milestone.examDate,
      subject_slug: milestone.subjectSlug,
      created_at: milestone.createdAt,
    });
  } catch (err) {
    console.warn('[Learning Universe] Không thể đồng bộ mốc kỳ thi:', err);
  }
}

export async function deleteExamMilestoneFromSupabase(
  userId: string,
  milestoneId: string,
): Promise<void> {
  if (!supabase || !isSupabaseConfigured || import.meta.env.MODE === 'test') return;
  try {
    await supabase
      .from('user_exam_milestones')
      .delete()
      .eq('user_id', userId)
      .eq('id', milestoneId);
  } catch (err) {
    console.warn('[Learning Universe] Không thể xóa mốc kỳ thi trên Supabase:', err);
  }
}

export async function syncStudyPreferencesToSupabase(
  userId: string,
  weeklyGoal: WeeklyStudyGoal,
  pomodoroLogs: readonly string[],
): Promise<void> {
  if (!supabase || !isSupabaseConfigured || import.meta.env.MODE === 'test') return;
  try {
    await supabase.from('user_study_preferences').upsert({
      user_id: userId,
      weekly_lesson_goal: weeklyGoal.targetLessons,
      weekly_pomodoro_goal: weeklyGoal.targetPomodoros,
      pomodoro_logs: pomodoroLogs.slice(-240),
      updated_at: new Date().toISOString(),
    });
  } catch (err) {
    console.warn('[Learning Universe] Không thể đồng bộ mục tiêu tuần & Pomodoro:', err);
  }
}
