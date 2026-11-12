import katex from 'katex';
import { describe, expect, it } from 'vitest';
import { MATH1301_EXAM_BANK } from '@/data/courses/cau-truc-dai-so/exam-bank';
import { CTDS_EXAM_PAPERS } from '@/data/courses/cau-truc-dai-so/exams';
import { CTDS_FINAL_REVIEW_SYLLABUS } from '@/data/courses/cau-truc-dai-so/final-review';
import { GTHMB_EXAM_PAPERS } from '@/data/courses/giai-tich-ham-mot-bien/exams';
import type { ExamPaper } from '@/data/courses/giai-tich-ham-mot-bien/exams';
import { MATH1302_EXAM_BANK } from '@/data/courses/hinh-hoc-affine/exam-bank';
import { HHAVE_EXAM_PAPERS } from '@/data/courses/hinh-hoc-affine/exams';
import mathGlossary from '@/data/math-glossary.json';

interface Segment {
  context: string;
  math: string;
  display: boolean;
}

function extractMathSegments(text: string, context: string): Segment[] {
  const segments: Segment[] = [];
  let i = 0;

  while (i < text.length) {
    if (text[i] === '\\' && text[i + 1] === '$') {
      i += 2;
      continue;
    }

    if (text.startsWith('$$', i)) {
      const closeIdx = text.indexOf('$$', i + 2);
      if (closeIdx === -1) {
        throw new Error(`Unclosed $$ in ${context}: ${text.slice(i, i + 80)}`);
      }
      segments.push({ context, math: text.slice(i + 2, closeIdx).trim(), display: true });
      i = closeIdx + 2;
      continue;
    }

    if (text[i] === '$') {
      let closeIdx = i + 1;
      while (closeIdx < text.length) {
        if (text[closeIdx] === '\\' && text[closeIdx + 1] === '$') {
          closeIdx += 2;
          continue;
        }
        if (text[closeIdx] === '$') break;
        closeIdx += 1;
      }
      if (closeIdx >= text.length) {
        throw new Error(`Unclosed $ in ${context}: ${text.slice(i, i + 80)}`);
      }
      segments.push({ context, math: text.slice(i + 1, closeIdx).trim(), display: false });
      i = closeIdx + 1;
      continue;
    }

    i += 1;
  }

  return segments;
}

function collectPaperStrings(papers: readonly ExamPaper[], prefix: string) {
  const out: Array<{ context: string; text: string }> = [];
  for (const paper of papers) {
    out.push({ context: `${prefix}.${paper.id}.title`, text: paper.title });
    out.push({ context: `${prefix}.${paper.id}.description`, text: paper.description });
    for (const p of paper.problems) {
      if (p.title) out.push({ context: `${prefix}.${p.id}.title`, text: p.title });
      if (p.statement) out.push({ context: `${prefix}.${p.id}.statement`, text: p.statement });
      if (p.hint) out.push({ context: `${prefix}.${p.id}.hint`, text: p.hint });
      if (p.solution) out.push({ context: `${prefix}.${p.id}.solution`, text: p.solution });
      for (const part of p.parts ?? []) {
        if (part.statement) {
          out.push({
            context: `${prefix}.${p.id}.${part.label}.statement`,
            text: part.statement,
          });
        }
        if (part.hint)
          out.push({ context: `${prefix}.${p.id}.${part.label}.hint`, text: part.hint });
        if (part.solution) {
          out.push({
            context: `${prefix}.${p.id}.${part.label}.solution`,
            text: part.solution,
          });
        }
      }
    }
  }
  return out;
}

describe('Kiểm chuẩn Ký hiệu Toán học & KaTeX (Toàn bộ dữ liệu ôn tập & từ điển)', () => {
  it('tất cả chuỗi toán học trong Đề thi, Đề cương ôn tập & Từ điển biên dịch KaTeX không lỗi', () => {
    const texts: Array<{ context: string; text: string }> = [
      ...collectPaperStrings(CTDS_EXAM_PAPERS, 'ctds-exams'),
      ...collectPaperStrings(HHAVE_EXAM_PAPERS, 'hhave-exams'),
      ...collectPaperStrings(GTHMB_EXAM_PAPERS, 'gthmb-exams'),
    ];

    for (const mod of CTDS_FINAL_REVIEW_SYLLABUS.modules) {
      for (const thm of mod.coreTheorems) {
        texts.push({ context: `final-review.${mod.id}.coreTheorem`, text: thm });
      }
      for (const topic of mod.topics) {
        texts.push({ context: `final-review.${mod.id}.topic.title`, text: topic.title });
        texts.push({ context: `final-review.${mod.id}.topic.desc`, text: topic.description });
        if (topic.keyFormula) {
          texts.push({
            context: `final-review.${mod.id}.topic.keyFormula`,
            text: `$${topic.keyFormula}$`,
          });
        }
      }
      for (const trap of mod.examTraps) {
        texts.push({ context: `final-review.${mod.id}.trap.mistake`, text: trap.mistake });
        texts.push({
          context: `final-review.${mod.id}.trap.expl`,
          text: trap.counterExampleOrExplanation,
        });
        texts.push({
          context: `final-review.${mod.id}.trap.approach`,
          text: trap.correctApproach,
        });
      }
      for (const q of mod.typicalQuestions) {
        texts.push({ context: `final-review.${mod.id}.q`, text: q });
      }
    }

    for (const entry of mathGlossary) {
      if (entry.symbol) {
        texts.push({ context: `glossary.${entry.id}.symbol`, text: `$${entry.symbol}$` });
      }
      if (entry.formula) {
        texts.push({ context: `glossary.${entry.id}.formula`, text: `$${entry.formula}$` });
      }
    }

    let compiledCount = 0;
    for (const item of texts) {
      if (!item.text) continue;
      const segments = extractMathSegments(item.text, item.context);
      for (const seg of segments) {
        expect(() =>
          katex.renderToString(seg.math, {
            displayMode: seg.display,
            throwOnError: true,
            strict: 'ignore',
          }),
        ).not.toThrow();
        compiledCount += 1;
      }
    }

    expect(compiledCount).toBeGreaterThan(300);
  });

  it('không còn ký hiệu viết tắt non-standard hoặc Unicode toán thô trong dữ liệu CTĐS & HHAVE', () => {
    const serializedBanks = JSON.stringify([MATH1301_EXAM_BANK, MATH1302_EXAM_BANK]);

    expect(serializedBanks).not.toContain('\\text{ord}');
    expect(serializedBanks).not.toContain('\\text{sgn}');
    expect(serializedBanks).not.toContain('\\text{im }');
    expect(serializedBanks).not.toContain('\\text{af}');
    expect(serializedBanks).not.toMatch(/[³⁴ⁿℤₙ≤⇔⊴∪]/u);

    const glossaryJson = JSON.stringify(mathGlossary);
    expect(glossaryJson).not.toContain('\\\\vec{GA_i}');
    expect(glossaryJson).not.toContain('\\\\vec{AB}');
    expect(glossaryJson).not.toContain('\\\\vec{f(A)f(B)}');
  });

  it('không còn ký hiệu viết tắt non-standard trong đề thi & đề cương CTĐS, HHAVE, GTHMB', () => {
    const serializedPapers = JSON.stringify([
      CTDS_EXAM_PAPERS,
      CTDS_FINAL_REVIEW_SYLLABUS,
      HHAVE_EXAM_PAPERS,
      GTHMB_EXAM_PAPERS,
    ]);

    expect(serializedPapers).not.toContain('\\\\text{ord}');
    expect(serializedPapers).not.toContain('\\\\text{sgn}');
    expect(serializedPapers).not.toContain('\\\\text{af}');
    expect(serializedPapers).not.toContain('\\\\text{im }');
  });
});
