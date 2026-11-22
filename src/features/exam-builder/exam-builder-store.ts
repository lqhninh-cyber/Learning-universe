import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { createAlgebraSampleExam, createDefaultSampleExam } from './sampleExams';
import type { ExamDocument, ExamImageAttachment } from './types';

export const EXAM_GUEST_ACCOUNT_KEY = 'guest';

export interface UserExamBucket {
  readonly exams: readonly ExamDocument[];
  readonly activeExamId: string;
}

const DEFAULT_SAMPLE_DOC = Object.freeze(createDefaultSampleExam());

const FALLBACK_EXAM_BUCKET: UserExamBucket = Object.freeze({
  exams: Object.freeze([DEFAULT_SAMPLE_DOC]),
  activeExamId: DEFAULT_SAMPLE_DOC.id,
});

function createInitialBucket(): UserExamBucket {
  const sample = createDefaultSampleExam();
  return {
    exams: [sample],
    activeExamId: sample.id,
  };
}

function generateExamId(prefix = 'exam'): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

export interface ExamBuilderState {
  readonly activeAccountKey: string;
  readonly buckets: Readonly<Record<string, UserExamBucket>>;

  setActiveAccount: (userId: string | null) => void;
  selectExam: (examId: string) => void;
  createNewExam: (template?: 'blank' | 'thpt-2025' | 'algebra') => ExamDocument;
  duplicateActiveExam: () => ExamDocument | null;
  deleteExam: (examId: string) => void;
  updateActiveExam: (
    patch: Partial<
      Pick<
        ExamDocument,
        'title' | 'rawMarkup' | 'autoRecognizeMath' | 'showEndLine' | 'showAnswerKey'
      >
    >,
  ) => void;
  attachImageToActiveExam: (image: Omit<ExamImageAttachment, 'id'>) => ExamImageAttachment;
  removeImageFromActiveExam: (imageId: string) => void;
  resetExamBuilderStore: () => void;
}

export function selectActiveExamBucket(state: ExamBuilderState): UserExamBucket {
  return state.buckets[state.activeAccountKey] ?? FALLBACK_EXAM_BUCKET;
}

export function selectActiveExamDocument(state: ExamBuilderState): ExamDocument {
  const bucket = selectActiveExamBucket(state);
  return (
    bucket.exams.find((e) => e.id === bucket.activeExamId) ?? bucket.exams[0] ?? DEFAULT_SAMPLE_DOC
  );
}

const BLANK_EXAM_MARKUP = `PHẦN I. Thí sinh trả lời từ câu 1 đến câu 1. Mỗi câu hỏi thí sinh chỉ chọn một phương án.

Câu 1: Nhập nội dung câu hỏi tại đây...
*A. Phương án A
B. Phương án B
C. Phương án C
D. Phương án D`;

export const useExamBuilderStore = create<ExamBuilderState>()(
  persist(
    (set, get) => ({
      activeAccountKey: EXAM_GUEST_ACCOUNT_KEY,
      buckets: {},

      setActiveAccount: (userId) => {
        const nextKey = userId?.trim() || EXAM_GUEST_ACCOUNT_KEY;
        set((state) =>
          state.activeAccountKey === nextKey ? state : { activeAccountKey: nextKey },
        );
      },

      selectExam: (examId) => {
        const state = get();
        const key = state.activeAccountKey;
        const bucket = state.buckets[key] ?? createInitialBucket();
        if (!bucket.exams.some((e) => e.id === examId)) return;
        set({
          buckets: {
            ...state.buckets,
            [key]: {
              ...bucket,
              activeExamId: examId,
            },
          },
        });
      },

      createNewExam: (template = 'blank') => {
        const state = get();
        const key = state.activeAccountKey;
        const bucket = state.buckets[key] ?? createInitialBucket();
        const nowIso = new Date().toISOString();

        let nextDoc: ExamDocument;
        if (template === 'thpt-2025') {
          const sample = createDefaultSampleExam();
          nextDoc = { ...sample, id: generateExamId('exam'), updatedAt: nowIso };
        } else if (template === 'algebra') {
          nextDoc = { ...createAlgebraSampleExam(), id: generateExamId('exam'), updatedAt: nowIso };
        } else {
          nextDoc = {
            id: generateExamId('exam'),
            title: 'ĐỀ KIỂM TRA MÔN TOÁN',
            rawMarkup: BLANK_EXAM_MARKUP,
            autoRecognizeMath: true,
            showEndLine: true,
            showAnswerKey: false,
            images: {},
            updatedAt: nowIso,
          };
        }

        set({
          buckets: {
            ...state.buckets,
            [key]: {
              exams: [nextDoc, ...bucket.exams],
              activeExamId: nextDoc.id,
            },
          },
        });
        return nextDoc;
      },

      duplicateActiveExam: () => {
        const state = get();
        const key = state.activeAccountKey;
        const bucket = state.buckets[key] ?? createInitialBucket();
        const current = bucket.exams.find((e) => e.id === bucket.activeExamId) ?? bucket.exams[0];
        if (!current) return null;

        const copy: ExamDocument = {
          ...current,
          id: generateExamId('exam'),
          title: `${current.title} (Bản sao)`,
          updatedAt: new Date().toISOString(),
        };

        set({
          buckets: {
            ...state.buckets,
            [key]: {
              exams: [copy, ...bucket.exams],
              activeExamId: copy.id,
            },
          },
        });
        return copy;
      },

      deleteExam: (examId) => {
        const state = get();
        const key = state.activeAccountKey;
        const bucket = state.buckets[key] ?? createInitialBucket();
        const remaining = bucket.exams.filter((e) => e.id !== examId);
        const nextExams = remaining.length > 0 ? remaining : [createDefaultSampleExam()];
        const nextActiveId =
          bucket.activeExamId === examId ? nextExams[0]!.id : bucket.activeExamId;

        set({
          buckets: {
            ...state.buckets,
            [key]: {
              exams: nextExams,
              activeExamId: nextActiveId,
            },
          },
        });
      },

      updateActiveExam: (patch) => {
        const state = get();
        const key = state.activeAccountKey;
        const bucket = state.buckets[key] ?? createInitialBucket();
        const nowIso = new Date().toISOString();

        const nextExams = bucket.exams.map((exam) =>
          exam.id === bucket.activeExamId ? { ...exam, ...patch, updatedAt: nowIso } : exam,
        );

        set({
          buckets: {
            ...state.buckets,
            [key]: {
              ...bucket,
              exams: nextExams,
            },
          },
        });
      },

      attachImageToActiveExam: (imageInput) => {
        const state = get();
        const key = state.activeAccountKey;
        const bucket = state.buckets[key] ?? createInitialBucket();
        const id = generateExamId('hinh');
        const created: ExamImageAttachment = { ...imageInput, id };
        const nowIso = new Date().toISOString();

        const nextExams = bucket.exams.map((exam) =>
          exam.id === bucket.activeExamId
            ? {
                ...exam,
                images: { ...exam.images, [id]: created },
                updatedAt: nowIso,
              }
            : exam,
        );

        set({
          buckets: {
            ...state.buckets,
            [key]: {
              ...bucket,
              exams: nextExams,
            },
          },
        });
        return created;
      },

      removeImageFromActiveExam: (imageId) => {
        const state = get();
        const key = state.activeAccountKey;
        const bucket = state.buckets[key];
        if (!bucket) return;

        const nextExams = bucket.exams.map((exam) => {
          if (exam.id !== bucket.activeExamId || !exam.images[imageId]) return exam;
          const nextImages = { ...exam.images };
          delete nextImages[imageId];
          return {
            ...exam,
            images: nextImages,
            updatedAt: new Date().toISOString(),
          };
        });

        set({
          buckets: {
            ...state.buckets,
            [key]: {
              ...bucket,
              exams: nextExams,
            },
          },
        });
      },

      resetExamBuilderStore: () => {
        set({
          activeAccountKey: EXAM_GUEST_ACCOUNT_KEY,
          buckets: {},
        });
      },
    }),
    {
      name: 'learning-universe-exam-builder-v1',
      partialize: (state) => ({
        activeAccountKey: state.activeAccountKey,
        buckets: state.buckets,
      }),
    },
  ),
);
