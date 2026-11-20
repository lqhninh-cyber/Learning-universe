#!/usr/bin/env node
/**
 * Kiểm toán tự động toàn bộ 122 bài giảng (103 bài MDX trong `content/` + 19 bài Giáo dục học trong `src/data/courses/giao-duc-hoc/`).
 *
 * Kiểm tra 3 nhóm lỗi kỹ thuật:
 * 1. Cân bằng dấu toán học `$ ... $` và `$$ ... $$` (bỏ qua frontmatter, fenced code blocks, inline code và `\$`).
 * 2. Biên dịch thử 100% biểu thức toán học trích xuất được qua `katex.renderToString(expr, { throwOnError: true, strict: false })`
 *    với đầy đủ macro từ `content/_shared/katex-macros.json`.
 * 3. Phát hiện các mẫu vỡ định dạng do chuyển đổi Markdown/HTML (chuỗi bold-slash vỡ, italic-backslash vỡ,
 *    dấu `$` tách dòng sai quy cách và thẻ JSX/MDX học thuật chưa đóng hoặc sai cặp).
 */

import { readdirSync, readFileSync, statSync } from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import katex from 'katex';

const ROOT_DIR = process.cwd();
const CONTENT_DIR = path.resolve(ROOT_DIR, 'content');
const PEDAGOGY_DIR = path.resolve(ROOT_DIR, 'src/data/courses/giao-duc-hoc');
const MACROS_PATH = path.resolve(CONTENT_DIR, '_shared/katex-macros.json');

const KATEX_MACROS = JSON.parse(readFileSync(MACROS_PATH, 'utf8'));

const CHECKED_JSX_TAGS = new Set([
  'Definition',
  'Theorem',
  'Lemma',
  'Proposition',
  'Corollary',
  'Property',
  'Proof',
  'Example',
  'Counterexample',
  'Remark',
  'Note',
  'Warning',
  'Exercise',
  'Solution',
  'Hint',
  'KeyTakeaways',
  'Figure',
  'MermaidChart',
  'CayleyTable',
]);

/** Thu thập đệ quy toàn bộ file bài giảng .mdx trong content/ */
function collectMdxFiles(dir) {
  const results = [];
  for (const entry of readdirSync(dir)) {
    if (entry.startsWith('_') || entry.startsWith('.')) continue;
    const full = path.join(dir, entry);
    const stat = statSync(full);
    if (stat.isDirectory()) {
      results.push(...collectMdxFiles(full));
    } else if (full.endsWith('.mdx')) {
      results.push(full);
    }
  }
  return results.sort();
}

/** Thu thập 19 bài giảng Giáo dục học định nghĩa trong course.ts và các file chapter-*.ts(x) */
function collectPedagogyLessons(dir) {
  const courseFile = path.join(dir, 'course.ts');
  const lessonIds = [];
  try {
    const raw = readFileSync(courseFile, 'utf8');
    const idRegex = /id:\s*['"](gdh-[^'"]+)['"]/g;
    let m;
    while ((m = idRegex.exec(raw)) !== null) {
      lessonIds.push(m[1]);
    }
  } catch {
    return { lessonIds: [], chapterFiles: [] };
  }

  const chapterFiles = [];
  try {
    for (const entry of readdirSync(dir).sort()) {
      if (/^chapter-\d+\.tsx?$/.test(entry)) {
        chapterFiles.push(path.join(dir, entry));
      }
    }
  } catch {
    // Bỏ qua nếu không tồn tại
  }

  return { lessonIds, chapterFiles };
}

/** Tính bảng offset đầu dòng (1-based) */
function buildLineOffsetTable(text) {
  const offsets = [0];
  for (let i = 0; i < text.length; i += 1) {
    if (text[i] === '\n') {
      offsets.push(i + 1);
    }
  }
  return offsets;
}

function getLineNumber(lineOffsets, index) {
  let lo = 0;
  let hi = lineOffsets.length - 1;
  while (lo <= hi) {
    const mid = (lo + hi) >> 1;
    if (lineOffsets[mid] <= index) {
      lo = mid + 1;
    } else {
      hi = mid - 1;
    }
  }
  return hi + 1;
}

/**
 * Thay thế vùng không kiểm toán (frontmatter, fenced code, inline code, ESM import/export, JSX comment)
 * bằng khoảng trắng trong khi bảo toàn số dòng và vị trí ký tự.
 */
function maskNonContentRegions(raw) {
  const chars = Array.from(raw);
  const blank = (start, end) => {
    for (let i = start; i < end && i < chars.length; i += 1) {
      if (chars[i] !== '\n') chars[i] = ' ';
    }
  };

  // 1. YAML Frontmatter
  const fmMatch = raw.match(/^---\r?\n[\s\S]*?\r?\n---(?:\r?\n|$)/);
  let startIdx = 0;
  if (fmMatch) {
    blank(0, fmMatch[0].length);
    startIdx = fmMatch[0].length;
  }

  // 2. Fenced code blocks ``` ... ``` hoặc ~~~ ... ~~~
  const lines = raw.split('\n');
  let offset = 0;
  let inFence = false;
  let fenceMarker = '';
  for (const line of lines) {
    const lineEnd = offset + line.length;
    const trimmed = line.trimStart();
    if (!inFence) {
      const m = trimmed.match(/^(`{3,}|~{3,})/);
      if (m && offset >= startIdx) {
        inFence = true;
        fenceMarker = m[1][0];
        blank(offset, lineEnd);
      } else if (offset >= startIdx && /^(?:import|export)\s+/.test(trimmed)) {
        blank(offset, lineEnd);
      }
    } else {
      blank(offset, lineEnd);
      if (trimmed.startsWith(fenceMarker.repeat(3))) {
        inFence = false;
        fenceMarker = '';
      }
    }
    offset = lineEnd + 1;
  }

  // 3. Inline code `...` và JSX comments {/* ... */}
  let i = startIdx;
  while (i < chars.length) {
    if (chars[i] === '`') {
      let tickCount = 0;
      while (i + tickCount < chars.length && chars[i + tickCount] === '`') tickCount += 1;
      const closeStr = '`'.repeat(tickCount);
      const closeIdx = raw.indexOf(closeStr, i + tickCount);
      if (closeIdx !== -1) {
        blank(i, closeIdx + tickCount);
        i = closeIdx + tickCount;
        continue;
      }
    }
    if (chars[i] === '{' && raw.slice(i, i + 3) === '{/*') {
      const closeIdx = raw.indexOf('*/}', i + 3);
      if (closeIdx !== -1) {
        blank(i, closeIdx + 3);
        i = closeIdx + 3;
        continue;
      }
    }
    i += 1;
  }

  return chars.join('');
}

/** Kiểm tra cân bằng thẻ JSX/MDX học thuật (xử lý đúng dấu < hoặc > nằm trong chuỗi thuộc tính "...") */
function auditJsxTags(masked, lineOffsets, issues) {
  const stack = [];
  const len = masked.length;
  let i = 0;

  while (i < len) {
    if (masked[i] !== '<') {
      i += 1;
      continue;
    }

    const isClosing = masked[i + 1] === '/';
    const nameStart = isClosing ? i + 2 : i + 1;
    if (nameStart >= len || !/[A-Z]/.test(masked[nameStart])) {
      i += 1;
      continue;
    }

    let nameEnd = nameStart;
    while (nameEnd < len && /[A-Za-z0-9]/.test(masked[nameEnd])) {
      nameEnd += 1;
    }
    const tagName = masked.slice(nameStart, nameEnd);
    if (!CHECKED_JSX_TAGS.has(tagName)) {
      i = nameEnd;
      continue;
    }

    // Quét tới dấu '>' kết thúc thẻ, bỏ qua các ký tự bên trong "..." hoặc '...' hoặc {...}
    let j = nameEnd;
    let inQuote = null;
    let braceDepth = 0;
    let foundGt = -1;
    while (j < len) {
      const ch = masked[j];
      if (inQuote) {
        if (ch === '\\') {
          j += 2;
          continue;
        }
        if (ch === inQuote) {
          inQuote = null;
        }
      } else {
        if (ch === '"' || ch === "'") {
          inQuote = ch;
        } else if (ch === '{') {
          braceDepth += 1;
        } else if (ch === '}') {
          braceDepth = Math.max(0, braceDepth - 1);
        } else if (ch === '>' && braceDepth === 0) {
          foundGt = j;
          break;
        }
      }
      j += 1;
    }

    const line = getLineNumber(lineOffsets, i);
    if (foundGt === -1) {
      issues.push({
        line,
        kind: 'jsx-malformed',
        message: `Thẻ <${isClosing ? '/' : ''}${tagName}> không có dấu '>' đóng thẻ.`,
      });
      i = nameEnd;
      continue;
    }

    const beforeGt = masked.slice(nameEnd, foundGt).trimEnd();
    const isSelfClosing = !isClosing && beforeGt.endsWith('/');

    if (!isSelfClosing) {
      if (isClosing) {
        if (stack.length === 0) {
          issues.push({
            line,
            kind: 'jsx-unmatched-close',
            message: `Thẻ đóng </${tagName}> không có thẻ mở tương ứng.`,
          });
        } else {
          const top = stack[stack.length - 1];
          if (top.tagName === tagName) {
            stack.pop();
          } else {
            issues.push({
              line,
              kind: 'jsx-mismatch',
              message: `Thẻ đóng </${tagName}> không khớp thẻ mở <${top.tagName}> (dòng ${top.line}).`,
            });
            const idxInStack = stack.findLastIndex((s) => s.tagName === tagName);
            if (idxInStack !== -1) {
              stack.splice(idxInStack, 1);
            }
          }
        }
      } else {
        stack.push({ tagName, line });
      }
    }

    i = foundGt + 1;
  }

  for (const unclosed of stack) {
    issues.push({
      line: unclosed.line,
      kind: 'jsx-unclosed',
      message: `Thẻ mở <${unclosed.tagName}> chưa được đóng.`,
    });
  }
}

/** Kiểm tra mẫu vỡ định dạng Markdown ngoài biểu thức toán học */
function auditBrokenMarkdownArtifacts(textOutsideMath, lineOffsets, issues) {
  const patterns = [
    {
      regex: /\*\*\/\*\*/g,
      kind: 'broken-markdown-artifact',
      label: 'Phát hiện mẫu vỡ chuyển đổi Markdown `**/**`',
    },
    {
      regex: /\*\\\*/g,
      kind: 'broken-markdown-artifact',
      label: 'Phát hiện mẫu vỡ chuyển đổi Markdown `*\\*`',
    },
  ];

  for (const { regex, kind, label } of patterns) {
    let m;
    while ((m = regex.exec(textOutsideMath)) !== null) {
      issues.push({
        line: getLineNumber(lineOffsets, m.index),
        kind,
        message: label,
      });
    }
  }
}

/** Trích xuất & kiểm định toàn bộ biểu thức `$ ... $` và `$$ ... $$` bằng KaTeX */
function auditMathExpressions(masked, lineOffsets, issues) {
  const outsideChars = Array.from(masked);
  const blankOutside = (start, end) => {
    for (let i = start; i < end && i < outsideChars.length; i += 1) {
      if (outsideChars[i] !== '\n') outsideChars[i] = ' ';
    }
  };

  let mathCount = 0;
  let i = 0;
  const len = masked.length;

  while (i < len) {
    if (masked[i] === '\\' && masked[i + 1] === '$') {
      i += 2;
      continue;
    }

    if (masked[i] !== '$') {
      i += 1;
      continue;
    }

    const startLine = getLineNumber(lineOffsets, i);

    // 1. Display math $$ ... $$
    if (masked[i + 1] === '$') {
      let j = i + 2;
      let foundClose = -1;
      while (j < len) {
        if (masked[j] === '\\' && masked[j + 1] === '$') {
          j += 2;
          continue;
        }
        if (masked[j] === '$' && masked[j + 1] === '$') {
          foundClose = j;
          break;
        }
        j += 1;
      }

      if (foundClose === -1) {
        issues.push({
          line: startLine,
          kind: 'unclosed-display-math',
          message: 'Khối công thức display `$$` không có cặp đóng `$$`.',
        });
        break;
      }

      const expr = masked.slice(i + 2, foundClose).trim();
      blankOutside(i, foundClose + 2);
      mathCount += 1;

      if (!expr) {
        issues.push({
          line: startLine,
          kind: 'empty-math',
          message: 'Khối công thức `$$ $$` rỗng.',
        });
      } else {
        try {
          katex.renderToString(expr, {
            displayMode: true,
            throwOnError: true,
            strict: false,
            macros: { ...KATEX_MACROS },
          });
        } catch (err) {
          issues.push({
            line: startLine,
            kind: 'katex-display-error',
            message: `Lỗi KaTeX (display): ${err instanceof Error ? err.message : String(err)}`,
            snippet: expr.slice(0, 120).replace(/\s+/g, ' '),
          });
        }
      }

      i = foundClose + 2;
      continue;
    }

    // 2. Inline math $ ... $
    let j = i + 1;
    let foundClose = -1;
    let crossedBlankLine = false;
    while (j < len) {
      if (masked[j] === '\\' && masked[j + 1] === '$') {
        j += 2;
        continue;
      }
      if (masked[j] === '\n' && masked[j + 1] === '\n') {
        crossedBlankLine = true;
        break;
      }
      if (masked[j] === '$' && masked[j + 1] !== '$') {
        foundClose = j;
        break;
      }
      j += 1;
    }

    if (foundClose === -1) {
      const nextChunk = masked.slice(i, Math.min(len, i + 40)).replace(/\s+/g, ' ');
      issues.push({
        line: startLine,
        kind: crossedBlankLine ? 'inline-math-multiline-unclosed' : 'unclosed-inline-math',
        message: crossedBlankLine
          ? `Dấu \`$\` không được đóng trước dòng trống: "${nextChunk}"`
          : `Dấu \`$\` không có cặp đóng: "${nextChunk}"`,
      });
      i += 1;
      continue;
    }

    const rawExpr = masked.slice(i + 1, foundClose);
    const expr = rawExpr.trim();
    blankOutside(i, foundClose + 1);
    mathCount += 1;

    if (rawExpr.includes('\n') && /\n\s*\n/.test(rawExpr)) {
      issues.push({
        line: startLine,
        kind: 'inline-math-blank-line',
        message: 'Biểu thức inline `$ ... $` chứa dòng trống bên trong.',
        snippet: expr.slice(0, 100).replace(/\s+/g, ' '),
      });
    }

    if (!expr) {
      issues.push({
        line: startLine,
        kind: 'empty-math',
        message: 'Biểu thức inline `$ $` rỗng.',
      });
    } else {
      try {
        katex.renderToString(expr, {
          displayMode: false,
          throwOnError: true,
          strict: false,
          macros: { ...KATEX_MACROS },
        });
      } catch (err) {
        issues.push({
          line: startLine,
          kind: 'katex-inline-error',
          message: `Lỗi KaTeX (inline): ${err instanceof Error ? err.message : String(err)}`,
          snippet: expr.slice(0, 120).replace(/\s+/g, ' '),
        });
      }
    }

    i = foundClose + 1;
  }

  return { mathCount, textOutsideMath: outsideChars.join('') };
}

function main() {
  const mdxFiles = collectMdxFiles(CONTENT_DIR);
  const { lessonIds: pedagogyIds, chapterFiles: pedagogyFiles } =
    collectPedagogyLessons(PEDAGOGY_DIR);
  const totalLessonCount = mdxFiles.length + pedagogyIds.length;

  let totalMathCount = 0;
  let totalErrors = 0;
  const failingFiles = [];

  for (const filePath of mdxFiles) {
    const raw = readFileSync(filePath, 'utf8');
    const lineOffsets = buildLineOffsetTable(raw);
    const masked = maskNonContentRegions(raw);
    const issues = [];

    auditJsxTags(masked, lineOffsets, issues);
    const { mathCount, textOutsideMath } = auditMathExpressions(masked, lineOffsets, issues);
    auditBrokenMarkdownArtifacts(textOutsideMath, lineOffsets, issues);

    totalMathCount += mathCount;

    if (issues.length > 0) {
      totalErrors += issues.length;
      failingFiles.push({
        relPath: path.relative(ROOT_DIR, filePath).replace(/\\/g, '/'),
        issues,
      });
    }
  }

  // Kiểm toán thêm các file chương Giáo dục học (kiểm tra mẫu vỡ Markdown nếu có)
  for (const filePath of pedagogyFiles) {
    const raw = readFileSync(filePath, 'utf8');
    const lineOffsets = buildLineOffsetTable(raw);
    const issues = [];
    auditBrokenMarkdownArtifacts(raw, lineOffsets, issues);
    if (issues.length > 0) {
      totalErrors += issues.length;
      failingFiles.push({
        relPath: path.relative(ROOT_DIR, filePath).replace(/\\/g, '/'),
        issues,
      });
    }
  }

  console.log('===================================================================');
  console.log(
    `KIỂM TOÁN MDX / KATEX — ${totalLessonCount} BÀI GIẢNG (${mdxFiles.length} MDX + ${pedagogyIds.length} Giáo dục học)`,
  );
  console.log(`Tổng số biểu thức toán học đã biên dịch KaTeX: ${totalMathCount}`);
  console.log(`Số tệp có lỗi: ${failingFiles.length}`);
  console.log(`Tổng số lỗi phát hiện: ${totalErrors}`);
  console.log('===================================================================');

  for (const entry of failingFiles) {
    console.log(`\n[FAIL] ${entry.relPath} (${entry.issues.length} lỗi)`);
    for (const issue of entry.issues) {
      const extra = issue.snippet ? ` | snippet: ${issue.snippet}` : '';
      console.log(`  - Dòng ${issue.line} [${issue.kind}]: ${issue.message}${extra}`);
    }
  }

  if (totalErrors > 0) {
    process.exit(1);
  }
  console.log(
    `\n[PASS] 0 errors — Toàn bộ ${totalLessonCount}/${totalLessonCount} bài giảng đều hợp lệ!`,
  );
}

main();
