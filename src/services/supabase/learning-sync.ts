import { isSupabaseConfigured, supabase } from './client';
import type { LessonNoteEntry } from '@/features/learning/learning-store';

export async function syncProgressToSupabase(
  userId: string,
  lessonId: string,
  isCompleted: boolean,
): Promise<void> {
  if (!supabase || !isSupabaseConfigured) return;
  try {
    if (isCompleted) {
      await supabase.from('user_progress').upsert({
        user_id: userId,
        lesson_id: lessonId,
        completed_at: new Date().toISOString(),
      });
    } else {
      await supabase.from('user_progress').delete().eq('user_id', userId).eq('lesson_id', lessonId);
    }
  } catch (err) {
    console.warn('[Learning Universe] Lỗi đồng bộ tiến độ với Supabase:', err);
  }
}

export async function syncBookmarkToSupabase(
  userId: string,
  lessonId: string,
  isBookmarked: boolean,
): Promise<void> {
  if (!supabase || !isSupabaseConfigured) return;
  try {
    if (isBookmarked) {
      await supabase.from('user_bookmarks').upsert({
        user_id: userId,
        lesson_id: lessonId,
        created_at: new Date().toISOString(),
      });
    } else {
      await supabase
        .from('user_bookmarks')
        .delete()
        .eq('user_id', userId)
        .eq('lesson_id', lessonId);
    }
  } catch (err) {
    console.warn('[Learning Universe] Lỗi đồng bộ bài yêu thích với Supabase:', err);
  }
}

export async function syncNoteToSupabase(
  userId: string,
  lessonId: string,
  body: string,
): Promise<void> {
  if (!supabase || !isSupabaseConfigured) return;
  try {
    const trimmed = body.trim();
    if (trimmed) {
      await supabase.from('user_notes').upsert({
        user_id: userId,
        lesson_id: lessonId,
        body: trimmed,
        updated_at: new Date().toISOString(),
      });
    } else {
      await supabase.from('user_notes').delete().eq('user_id', userId).eq('lesson_id', lessonId);
    }
  } catch (err) {
    console.warn('[Learning Universe] Lỗi đồng bộ ghi chú với Supabase:', err);
  }
}

export async function fetchUserLearningData(userId: string): Promise<{
  completedLessons: Record<string, string>;
  bookmarkedLessons: Record<string, string>;
  lessonNotes: Record<string, LessonNoteEntry>;
} | null> {
  if (!supabase || !isSupabaseConfigured) return null;
  try {
    const [progressRes, bookmarksRes, notesRes] = await Promise.all([
      supabase.from('user_progress').select('lesson_id, completed_at').eq('user_id', userId),
      supabase.from('user_bookmarks').select('lesson_id, created_at').eq('user_id', userId),
      supabase.from('user_notes').select('lesson_id, body, updated_at').eq('user_id', userId),
    ]);

    const completedLessons: Record<string, string> = {};
    if (progressRes.data) {
      for (const row of progressRes.data) {
        completedLessons[row.lesson_id] = row.completed_at;
      }
    }

    const bookmarkedLessons: Record<string, string> = {};
    if (bookmarksRes.data) {
      for (const row of bookmarksRes.data) {
        bookmarkedLessons[row.lesson_id] = row.created_at;
      }
    }

    const lessonNotes: Record<string, LessonNoteEntry> = {};
    if (notesRes.data) {
      for (const row of notesRes.data) {
        lessonNotes[row.lesson_id] = {
          body: row.body,
          updatedAt: row.updated_at,
        };
      }
    }

    return { completedLessons, bookmarkedLessons, lessonNotes };
  } catch (err) {
    console.warn('[Learning Universe] Lỗi nạp dữ liệu học tập từ Supabase:', err);
    return null;
  }
}
