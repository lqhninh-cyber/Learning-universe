#!/usr/bin/env node
/**
 * Sinh chỉ mục ngược tĩnh Thuật ngữ ↔ Bài giảng (Build-Time Glossary Backlinks)
 * cho toàn bộ 122 bài giảng (103 bài MDX trong `content/` + 19 bài Giáo dục học).
 *
 * Đầu ra: `src/data/generated/glossaryBacklinks.json`
 * - `byTerm`: termId -> Array<{ lessonId, lessonCode, lessonTitle, subjectId, href, count }>
 * - `byLesson`: lessonId -> string[] (sắp giảm dần theo tần suất xuất hiện trong bài)
 */

import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { scanContent } from '../build/content-scanner.ts';
import {
  CALCULUS_EXTRA_GLOSSARY_ENTRIES,
  GDH_GLOSSARY_ENTRIES,
} from '../src/data/glossary-extra-entries.ts';

const ROOT_DIR = process.cwd();
const CONTENT_DIR = path.resolve(ROOT_DIR, 'content');
const GDH_DIR = path.resolve(ROOT_DIR, 'src/data/courses/giao-duc-hoc');
const GLOSSARY_JSON_PATH = path.resolve(ROOT_DIR, 'src/data/math-glossary.json');
const OUTPUT_PATH = path.resolve(ROOT_DIR, 'src/data/generated/glossaryBacklinks.json');

const SUBJECT_CODE_MAP = {
  'cau-truc-dai-so': 'CTĐS',
  'hinh-hoc-affine': 'HHAVE',
  'giai-tich-ham-mot-bien': 'GTHMB',
  'giao-duc-hoc': 'GDH',
};

/** Các từ tiếng Anh/ký hiệu ngắn dễ gây khớp nhầm trong văn xuôi (chỉ khớp trong LaTeX hoặc cụm dài). */
const AMBIGUOUS_PROSE_TOKENS = new Set([
  'sup',
  'inf',
  'ker',
  'im',
  'ord',
  'det',
  'dim',
  'mod',
  'hom',
  'aut',
  'gcd',
  'lcm',
  'exp',
  'log',
  'sin',
  'cos',
  'tan',
  'lim',
  'max',
  'min',
  'deg',
  'ring',
  'field',
  'group',
  'ideal',
  'order',
  'norm',
  'unit',
  'span',
  'dot',
  'set',
  'map',
]);

function stripDiacritics(input) {
  return String(input)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D');
}

function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function cleanLessonTitle(title) {
  return title.replace(/^Bài\s+\d+(?:\.\d+)?:\s*/i, '').trim();
}

/**
 * Tách riêng phần văn xuôi sạch (không frontmatter, không fenced code, không tên thẻ JSX)
 * và mảng các biểu thức toán học `$...$` / `$$...$$` từ nội dung MDX.
 */
function extractMdxTextAndMath(rawSource) {
  let text = rawSource.replace(/^\uFEFF?---\r?\n[\s\S]*?\r?\n---(?:\r?\n|$)/, '');

  // Bỏ fenced code blocks (bao gồm mermaid, ts, ...)
  text = text.replace(/^(`{3,}|~{3,})[^\n]*\r?\n[\s\S]*?^\1[ \t]*$/gm, ' ');

  // Bỏ dòng import/export ESM và comment JSX
  text = text.replace(/^(?:import|export)\s+[^\n]*$/gm, ' ');
  text = text.replace(/\{\/\*[\s\S]*?\*\/\}/g, ' ');

  // Giữ lại giá trị title="..." trong các thẻ học thuật trước khi gỡ thẻ JSX
  const jsxTitles = [];
  text = text.replace(/\btitle=(?:"([^"]+)"|'([^']+)')/g, (_m, a, b) => {
    const val = a ?? b ?? '';
    if (val) jsxTitles.push(val);
    return ' ';
  });

  // Trích xuất biểu thức toán học $$...$$ và $...$
  const mathChunks = [];
  text = text.replace(/\$\$([\s\S]*?)\$\$/g, (_m, expr) => {
    mathChunks.push(expr);
    return ' ';
  });
  text = text.replace(/(?<!\\)\$([^$\n]+?)\$/g, (_m, expr) => {
    mathChunks.push(expr);
    return ' ';
  });

  // Gỡ thẻ JSX/HTML còn lại và inline code
  text = text.replace(/<[^>]+>/g, ' ');
  text = text.replace(/`[^`]+`/g, ' ');

  const prose = `${jsxTitles.join(' ')} ${text}`.replace(/\s+/g, ' ').trim();
  const mathText = mathChunks.join(' \n ');

  return { prose, mathText };
}

/**
 * Trích xuất lát cắt mảng cân bằng `[ ... ]` bắt đầu từ vị trí dấu `[` mở đầu (bỏ qua dấu trong chuỗi).
 */
function sliceBalancedArray(source, openBracketIndex) {
  let depth = 0;
  let quote = null;
  let escaped = false;

  for (let i = openBracketIndex; i < source.length; i += 1) {
    const ch = source[i];
    if (quote) {
      if (escaped) {
        escaped = false;
      } else if (ch === '\\') {
        escaped = true;
      } else if (ch === quote) {
        quote = null;
      }
      continue;
    }

    if (ch === "'" || ch === '"' || ch === '`') {
      quote = ch;
    } else if (ch === '[') {
      depth += 1;
    } else if (ch === ']') {
      depth -= 1;
      if (depth === 0) {
        return source.slice(openBracketIndex, i + 1);
      }
    }
  }
  throw new Error('Không đóng được mảng chapters trong course.ts');
}

/**
 * Trích xuất danh sách 19 bài giảng Giáo dục học cùng đoạn mã view tương ứng từ chapter-1..6.
 */
function collectPedagogyLessons() {
  const courseSource = readFileSync(path.join(GDH_DIR, 'course.ts'), 'utf8');
  const subjectStart = courseSource.indexOf('export const GIAO_DUC_HOC_SUBJECT');
  if (subjectStart === -1) {
    throw new Error('Không tìm thấy GIAO_DUC_HOC_SUBJECT trong course.ts');
  }

  const chaptersKeyIdx = courseSource.indexOf('chapters:', subjectStart);
  const openBracketIdx = courseSource.indexOf('[', chaptersKeyIdx);
  const chaptersLiteral = sliceBalancedArray(courseSource, openBracketIdx);
  const parsedChapters = new Function(`return (${chaptersLiteral});`)();

  // Cache nội dung các file chapter-1.ts .. chapter-6.tsx
  const chapterFileCache = new Map();
  const readChapterFile = (relFile) => {
    const abs = path.resolve(ROOT_DIR, relFile.replace(/^\/+/, ''));
    if (!chapterFileCache.has(abs)) {
      chapterFileCache.set(abs, readFileSync(abs, 'utf8'));
    }
    return chapterFileCache.get(abs);
  };

  const lessons = [];

  for (const ch of parsedChapters) {
    for (const item of ch.lessons) {
      // Cắt đúng khối component `export const Lesson{ch}_{l}View` trong file chapter-N.ts(x)
      const fileSource = readChapterFile(item.file);
      const viewName = `Lesson${ch.number}_${item.number}View`;
      const startMarker = `export const ${viewName}`;
      const viewStart = fileSource.indexOf(startMarker);
      let viewSlice = '';
      if (viewStart !== -1) {
        const afterStart = fileSource.slice(viewStart + startMarker.length);
        const nextExportMatch = afterStart.match(
          /\r?\nexport (?:const Lesson\d+_\d+View|function getChapter\d+LessonModule)/,
        );
        viewSlice = nextExportMatch ? afterStart.slice(0, nextExportMatch.index) : afterStart;
      }

      // Trích xuất mọi chuỗi tiếng Việt từ component view (bỏ className / tailwind tokens)
      const extractedStrings = [];
      const cleanedView = viewSlice.replace(/className\s*[:=]\s*(?:'[^']*'|"[^"]*"|`[^`]*`)/g, ' ');
      const strRegex = /'((?:\\.|[^'\\])*)'|"((?:\\.|[^"\\])*)"/g;
      let sm;
      while ((sm = strRegex.exec(cleanedView)) !== null) {
        const val = (sm[1] ?? sm[2] ?? '').trim();
        if (val.length >= 3 && !/^https?:\/\//.test(val) && !/^[a-z0-9_./#-]+$/.test(val)) {
          extractedStrings.push(val);
        }
      }
      // Lấy thêm text giữa thẻ JSX `>...<` cho chapter-6.tsx
      const jsxTextRegex = />([^<>{}\r\n][^<>{}]*)</g;
      let jm;
      while ((jm = jsxTextRegex.exec(cleanedView)) !== null) {
        const val = jm[1].trim();
        if (val.length >= 3) {
          extractedStrings.push(val);
        }
      }

      const tagsText = Array.isArray(item.tags) ? item.tags.join(' ') : '';
      lessons.push({
        lessonId: item.id,
        lessonCode: `${SUBJECT_CODE_MAP['giao-duc-hoc']} ${ch.number}.${item.number}`,
        lessonTitle: cleanLessonTitle(item.title),
        rawTitle: item.title,
        subjectId: 'giao-duc-hoc',
        chapterNumber: ch.number,
        lessonNumber: item.number,
        href: `/mon-hoc/giao-duc-hoc/${ch.slug}/${item.slug}`,
        prose: `${item.title} ${item.description ?? ''} ${tagsText} ${extractedStrings.join(' ')}`,
        mathText: '',
      });
    }
  }

  return lessons;
}

/** Thu thập 103 bài MDX từ build/content-scanner.ts */
function collectMdxLessons() {
  const { manifest } = scanContent({
    projectRoot: ROOT_DIR,
    contentDir: CONTENT_DIR,
    publishedOnly: false,
  });

  const lessons = [];
  for (const subject of manifest.subjects) {
    const codePrefix = SUBJECT_CODE_MAP[subject.slug] ?? subject.slug.toUpperCase();
    for (const chapter of subject.chapters) {
      for (const lesson of chapter.lessons) {
        const absFile = path.resolve(ROOT_DIR, lesson.file.replace(/^\/+/, ''));
        const rawSource = readFileSync(absFile, 'utf8');
        const { prose, mathText } = extractMdxTextAndMath(rawSource);

        lessons.push({
          lessonId: lesson.id,
          lessonCode: `${codePrefix} ${chapter.number}.${lesson.number}`,
          lessonTitle: cleanLessonTitle(lesson.title),
          rawTitle: lesson.title,
          subjectId: subject.slug,
          chapterNumber: chapter.number,
          lessonNumber: lesson.number,
          href: `/mon-hoc/${subject.slug}/${chapter.slug}/${lesson.slug}`,
          prose: `${lesson.title} ${lesson.description ?? ''} ${prose}`,
          mathText,
        });
      }
    }
  }

  return lessons;
}

/**
 * Xây dựng bộ matcher chính xác cho từng mục thuật ngữ:
 * - Văn xuôi: cụm từ dài >= 3 ký tự, tránh các từ ngắn mơ hồ, khớp theo ranh giới từ Unicode.
 * - Toán học: lệnh/biểu thức LaTeX đặc trưng xuất hiện trong `$...$` / `$$...$$`.
 */
function buildTermMatchers(entry) {
  const accentedPhrases = new Set();
  const strippedPhrases = new Set();
  const mathTokens = new Set();

  const addProseCandidate = (raw) => {
    if (!raw || typeof raw !== 'string') return;
    const trimmed = raw.trim();
    if (trimmed.length < 3) return;
    if (trimmed.startsWith('\\')) {
      mathTokens.add(trimmed);
      return;
    }
    // Bỏ qua công thức chứa ký tự LaTeX hoặc ký hiệu toán đặc thù trong văn xuôi
    if (/[\\^_{}=<>|]/.test(trimmed)) {
      if (trimmed.length >= 3) mathTokens.add(trimmed);
      return;
    }

    // Tách phần trước ngoặc đơn nếu dài (vd "Cận trên đúng (Supremum)" -> "Cận trên đúng")
    const baseWithoutParen = trimmed
      .replace(/\s*\([^)]*\)\s*/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
    const candidates =
      baseWithoutParen.length >= 3 && baseWithoutParen !== trimmed
        ? [trimmed, baseWithoutParen]
        : [trimmed];

    for (const cand of candidates) {
      const lower = cand.toLowerCase();
      const stripped = stripDiacritics(lower);
      if (stripped.length < 3) continue;

      const isSingleWord = !/\s/.test(stripped);
      if (isSingleWord && AMBIGUOUS_PROSE_TOKENS.has(stripped)) {
        continue;
      }
      // Với từ đơn ngắn (< 5 ký tự) không dấu, tránh khớp nhầm từ tiếng Việt/Anh phổ thông
      if (isSingleWord && stripped.length < 5 && stripped === lower) {
        continue;
      }

      if (lower !== stripped) {
        accentedPhrases.add(lower);
      } else {
        strippedPhrases.add(stripped);
      }
    }
  };

  addProseCandidate(entry.nameVi);
  if (entry.term) addProseCandidate(entry.term);
  if (entry.name) addProseCandidate(entry.name);
  for (const pat of entry.patterns ?? []) {
    addProseCandidate(pat);
  }

  // Lọc bỏ các cụm ngắn hơn bị chứa hoàn toàn trong cụm dài hơn cùng tập để tránh đếm trùng lặp quá mức
  const compileWordRegexes = (phrases) =>
    Array.from(phrases)
      .sort((a, b) => b.length - a.length)
      .map((phrase) => {
        const escaped = escapeRegex(phrase);
        return new RegExp(`(?<![\\p{L}\\p{N}])${escaped}(?![\\p{L}\\p{N}])`, 'giu');
      });

  // Với biểu thức LaTeX đặc trưng (vd \unlhd, \cong, \operatorname{Frac}, \mathbb{Z}/n\mathbb{Z})
  const distinctiveMathRegexes = Array.from(mathTokens)
    .filter((tok) => {
      const compact = tok.replace(/\s+/g, '');
      // Chỉ dùng các lệnh LaTeX đủ đặc thù (tránh \int hay \sum quá chung trong bài không phải trọng tâm)
      if (compact.length < 3) return false;
      if (compact === '\\int' || compact === '\\sum') return false;
      return true;
    })
    .map((tok) => {
      const escaped = escapeRegex(tok.trim());
      return new RegExp(`${escaped}(?![A-Za-z])`, 'g');
    });

  return {
    accentedRegexes: compileWordRegexes(accentedPhrases),
    strippedRegexes: compileWordRegexes(strippedPhrases),
    mathRegexes: distinctiveMathRegexes,
  };
}

function countUniquePhraseHits(text, regexes) {
  let total = 0;
  for (const regex of regexes) {
    regex.lastIndex = 0;
    const matches = text.match(regex);
    if (matches) {
      total += matches.length;
    }
  }
  return total;
}

function main() {
  const rawJsonGlossary = JSON.parse(readFileSync(GLOSSARY_JSON_PATH, 'utf8'));
  const allEntries = [
    ...rawJsonGlossary,
    ...CALCULUS_EXTRA_GLOSSARY_ENTRIES,
    ...GDH_GLOSSARY_ENTRIES,
  ];

  const mdxLessons = collectMdxLessons();
  const pedagogyLessons = collectPedagogyLessons();
  const allLessons = [...mdxLessons, ...pedagogyLessons];

  // Chuẩn bị trước văn bản đã chuẩn hóa cho từng bài giảng (chỉ làm 1 lần O(N))
  const preparedLessons = allLessons.map((lesson) => ({
    ...lesson,
    titleLower: lesson.rawTitle.toLowerCase(),
    titleStripped: stripDiacritics(lesson.rawTitle).toLowerCase(),
    proseLower: lesson.prose.toLowerCase(),
    proseStripped: stripDiacritics(lesson.prose).toLowerCase(),
  }));

  const lessonByHref = new Map(preparedLessons.map((l) => [l.href, l]));
  const lessonBySlug = new Map(preparedLessons.map((l) => [l.href.split('/').pop(), l]));

  const byTerm = {};
  const lessonTermCounts = new Map();

  for (const entry of allEntries) {
    const matchers = buildTermMatchers(entry);
    const sameSubjectLessons = preparedLessons.filter((l) => l.subjectId === entry.subject);
    const hits = [];

    // Xác định bài giảng đích khai báo trực tiếp trên entry (nếu có)
    const rawTarget = (entry.lessonUrl || entry.relatedLesson || '').split('#')[0].split('?')[0];
    const directLesson =
      lessonByHref.get(rawTarget) ??
      (rawTarget.startsWith('/bai-hoc/')
        ? lessonBySlug.get(rawTarget.slice('/bai-hoc/'.length))
        : undefined);

    for (const lesson of sameSubjectLessons) {
      // Đếm khớp ưu tiên có dấu tiếng Việt; chỉ cộng khớp không dấu nếu bài không khớp có dấu
      let count = countUniquePhraseHits(lesson.proseLower, matchers.accentedRegexes);
      const titleAccentedHits = countUniquePhraseHits(lesson.titleLower, matchers.accentedRegexes);
      count += titleAccentedHits * 2;

      if (count === 0 && matchers.strippedRegexes.length > 0) {
        count += countUniquePhraseHits(lesson.proseStripped, matchers.strippedRegexes);
        count += countUniquePhraseHits(lesson.titleStripped, matchers.strippedRegexes) * 2;
      }

      if (lesson.mathText && matchers.mathRegexes.length > 0) {
        count += countUniquePhraseHits(lesson.mathText, matchers.mathRegexes);
      }

      if (directLesson && directLesson.lessonId === lesson.lessonId && count === 0) {
        count = 1;
      }

      if (count > 0) {
        hits.push({
          lessonId: lesson.lessonId,
          lessonCode: lesson.lessonCode,
          lessonTitle: lesson.lessonTitle,
          subjectId: lesson.subjectId,
          href: lesson.href,
          count,
          _ch: lesson.chapterNumber,
          _ls: lesson.lessonNumber,
        });

        let termMap = lessonTermCounts.get(lesson.lessonId);
        if (!termMap) {
          termMap = new Map();
          lessonTermCounts.set(lesson.lessonId, termMap);
        }
        termMap.set(entry.id, count);
      }
    }

    hits.sort((a, b) => {
      if (b.count !== a.count) return b.count - a.count;
      if (a._ch !== b._ch) return a._ch - b._ch;
      return a._ls - b._ls;
    });

    byTerm[entry.id] = hits.map(({ _ch: _c, _ls: _l, ...rest }) => rest);
  }

  const byLesson = {};
  for (const lesson of preparedLessons) {
    const termMap = lessonTermCounts.get(lesson.lessonId);
    if (!termMap || termMap.size === 0) {
      byLesson[lesson.lessonId] = [];
      continue;
    }
    byLesson[lesson.lessonId] = Array.from(termMap.entries())
      .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
      .map(([termId]) => termId);
  }

  const totalBacklinks = Object.values(byTerm).reduce((sum, list) => sum + list.length, 0);
  const termsWithBacklinks = Object.values(byTerm).filter((list) => list.length > 0).length;
  const lessonsWithBacklinks = Object.values(byLesson).filter((list) => list.length > 0).length;

  const payload = {
    stats: {
      totalLessons: allLessons.length,
      totalTerms: allEntries.length,
      totalBacklinks,
      termsWithBacklinks,
      lessonsWithBacklinks,
    },
    byTerm,
    byLesson,
  };

  mkdirSync(path.dirname(OUTPUT_PATH), { recursive: true });
  writeFileSync(OUTPUT_PATH, `${JSON.stringify(payload, null, 2)}\n`, 'utf8');

  console.log(
    `[glossary:backlinks] Đã lập chỉ mục ${allLessons.length} bài giảng (${mdxLessons.length} MDX + ${pedagogyLessons.length} GDH) × ${allEntries.length} thuật ngữ → ${totalBacklinks} liên kết ngược (${termsWithBacklinks}/${allEntries.length} thuật ngữ, ${lessonsWithBacklinks}/${allLessons.length} bài giảng).`,
  );
}

main();
