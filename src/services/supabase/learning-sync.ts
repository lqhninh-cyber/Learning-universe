import { isSupabaseConfigured, supabase } from './client';
import type { LessonNoteEntry } from '@/features/learning/learning-store';

export async function syncProgressToSupabase(
  userId: string,
  lessonId: string,
  isCompleted: boolean,
): Promise<void> {
  if (!supabase || !isSupabaseConfigured || import.meta.env.MODE === 'test') return;
  try {
    if (isCompleted) {
      const now = new Date().toISOString();
      // Ưu tiên cấu trúc (user_id, lesson_id, completed, updated_at) theo schema người dùng
      const { error } = await supabase.from('user_progress').upsert({
        user_id: userId,
        lesson_id: lessonId,
        completed: true,
        updated_at: now,
      });

      // Nếu cơ sở dữ liệu dùng cấu trúc completed_at (migration cũ)
      if (error) {
        const fallbackRes = await supabase.from('user_progress').upsert({
          user_id: userId,
          lesson_id: lessonId,
          completed_at: now,
        });
        if (fallbackRes.error) {
          console.warn(
            '[Learning Universe] Lỗi đồng bộ tiến độ với Supabase:',
            fallbackRes.error.message,
          );
        }
      }
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
  if (!supabase || !isSupabaseConfigured || import.meta.env.MODE === 'test') return;
  try {
    if (isBookmarked) {
      const now = new Date().toISOString();
      const { error } = await supabase.from('user_bookmarks').upsert({
        user_id: userId,
        lesson_id: lessonId,
        created_at: now,
      });
      if (error) {
        // Dự phòng nếu bảng dùng updated_at
        const fallbackRes = await supabase.from('user_bookmarks').upsert({
          user_id: userId,
          lesson_id: lessonId,
          updated_at: now,
        });
        if (fallbackRes.error) {
          console.warn(
            '[Learning Universe] Lỗi đồng bộ bài yêu thích với Supabase:',
            fallbackRes.error.message,
          );
        }
      }
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
  if (!supabase || !isSupabaseConfigured || import.meta.env.MODE === 'test') return;
  try {
    const trimmed = body.trim();
    if (trimmed) {
      const now = new Date().toISOString();
      // Ưu tiên schema với cột content (user_id, lesson_id, content, updated_at)
      const { error } = await supabase.from('user_notes').upsert({
        user_id: userId,
        lesson_id: lessonId,
        content: trimmed,
        updated_at: now,
      });

      // Nếu cơ sở dữ liệu dùng cột body (cấu trúc migration cũ)
      if (error) {
        const fallbackRes = await supabase.from('user_notes').upsert({
          user_id: userId,
          lesson_id: lessonId,
          body: trimmed,
          updated_at: now,
        });
        if (fallbackRes.error) {
          console.warn(
            '[Learning Universe] Lỗi đồng bộ ghi chú với Supabase:',
            fallbackRes.error.message,
          );
        }
      }
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
  if (!supabase || !isSupabaseConfigured || import.meta.env.MODE === 'test') return null;
  try {
    // Dùng .select('*') để không bị lỗi 400 khi tên cột khác nhau giữa các schema
    const [progressRes, bookmarksRes, notesRes] = await Promise.all([
      supabase.from('user_progress').select('*').eq('user_id', userId),
      supabase.from('user_bookmarks').select('*').eq('user_id', userId),
      supabase.from('user_notes').select('*').eq('user_id', userId),
    ]);

    const completedLessons: Record<string, string> = {};
    if (progressRes.data && Array.isArray(progressRes.data)) {
      for (const raw of progressRes.data) {
        const row = raw as Record<string, unknown>;
        const lessonId = String(row.lesson_id ?? row.lessonId ?? '');
        if (!lessonId) continue;

        // Nếu cột completed là boolean và là false thì bỏ qua
        if (row.completed === false) continue;

        const timestamp =
          (typeof row.completed_at === 'string' && row.completed_at) ||
          (typeof row.completed === 'string' && row.completed) ||
          (typeof row.updated_at === 'string' && row.updated_at) ||
          (typeof row.created_at === 'string' && row.created_at) ||
          new Date().toISOString();

        completedLessons[lessonId] = timestamp;
      }
    }

    const bookmarkedLessons: Record<string, string> = {};
    if (bookmarksRes.data && Array.isArray(bookmarksRes.data)) {
      for (const raw of bookmarksRes.data) {
        const row = raw as Record<string, unknown>;
        const lessonId = String(row.lesson_id ?? row.lessonId ?? '');
        if (!lessonId) continue;

        if (row.bookmarked === false || row.is_bookmarked === false) continue;

        const timestamp =
          (typeof row.created_at === 'string' && row.created_at) ||
          (typeof row.updated_at === 'string' && row.updated_at) ||
          new Date().toISOString();

        bookmarkedLessons[lessonId] = timestamp;
      }
    }

    const lessonNotes: Record<string, LessonNoteEntry> = {};
    if (notesRes.data && Array.isArray(notesRes.data)) {
      for (const raw of notesRes.data) {
        const row = raw as Record<string, unknown>;
        const lessonId = String(row.lesson_id ?? row.lessonId ?? '');
        if (!lessonId) continue;

        const noteText =
          (typeof row.content === 'string' && row.content) ||
          (typeof row.body === 'string' && row.body) ||
          (typeof row.notes === 'string' && row.notes) ||
          (typeof row.note === 'string' && row.note) ||
          '';

        const timestamp =
          (typeof row.updated_at === 'string' && row.updated_at) ||
          (typeof row.created_at === 'string' && row.created_at) ||
          new Date().toISOString();

        if (noteText) {
          lessonNotes[lessonId] = {
            body: noteText,
            updatedAt: timestamp,
          };
        }
      }
    }

    return { completedLessons, bookmarkedLessons, lessonNotes };
  } catch (err) {
    console.warn('[Learning Universe] Lỗi nạp dữ liệu học tập từ Supabase:', err);
    return null;
  }
}
