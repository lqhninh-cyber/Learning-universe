import { estimateVisualTextLength, normalizeSmartMathText } from './smartMathNormalize';
import type {
  ExamChoiceOption,
  ExamDocument,
  ExamImageAttachment,
  ExamPart,
  ExamPartKind,
  ExamQuestion,
  ExamTrueFalseStatement,
  OptionColumnsMode,
  OptionLetter,
  ParsedExamStructure,
  StatementLetter,
} from './types';

const OPTION_LETTERS: readonly OptionLetter[] = ['A', 'B', 'C', 'D'];
const STATEMENT_LETTERS: readonly StatementLetter[] = ['a', 'b', 'c', 'd'];

export function getDefaultPartInstruction(kind: ExamPartKind, count: number): string {
  const safeCount = Math.max(1, count);
  if (kind === 'multiple-choice') {
    return `Thí sinh trả lời từ câu 1 đến câu ${safeCount}. Mỗi câu hỏi thí sinh chỉ chọn một phương án.`;
  }
  if (kind === 'true-false') {
    return `Thí sinh trả lời từ câu 1 đến câu ${safeCount}. Trong mỗi ý a), b), c), d) ở mỗi câu, thí sinh chọn đúng hoặc sai.`;
  }
  if (kind === 'short-answer') {
    return `Thí sinh trả lời từ câu 1 đến câu ${safeCount}.`;
  }
  return `Thí sinh trình bày chi tiết lời giải từ câu 1 đến câu ${safeCount}.`;
}

export function getDefaultPartLabel(kind: ExamPartKind, index: number): string {
  const roman = ['I', 'II', 'III', 'IV', 'V'][index] ?? String(index + 1);
  if (kind === 'multiple-choice' && index === 0) return 'PHẦN I';
  if (kind === 'true-false' && index === 1) return 'PHẦN II';
  if (kind === 'short-answer' && index === 2) return 'PHẦN III';
  return `PHẦN ${roman}`;
}

/**
 * Quyết định số cột hiển thị A/B/C/D giống hệt đề Toán THPT 2025:
 * - Cả 4 phương án ngắn -> 4 cột (1 hàng)
 * - Có phương án trung bình -> 2 cột (2 hàng)
 * - Có phương án dài -> 1 cột (4 hàng)
 */
export function resolveOptionColumns(
  options: readonly ExamChoiceOption[],
  mode: OptionColumnsMode = 'auto',
): 1 | 2 | 4 {
  if (mode === 1 || mode === 2 || mode === 4) return mode;
  if (options.length === 0) return 4;
  const maxLen = Math.max(...options.map((opt) => estimateVisualTextLength(opt.content)));
  const hasDisplayMath = options.some((opt) => opt.content.includes('$$'));
  if (hasDisplayMath || maxLen > 56) return 1;
  if (maxLen > 24) return 2;
  return 4;
}

function inferPartKindFromHeader(headerLine: string, partIndex: number): ExamPartKind {
  const lower = headerLine.toLowerCase();
  if (lower.includes('đúng') && lower.includes('sai')) return 'true-false';
  if (lower.includes('a), b), c), d)')) return 'true-false';
  if (lower.includes('trả lời ngắn')) return 'short-answer';
  if (lower.includes('tự luận')) return 'essay';
  if (lower.includes('nhiều phương án') || lower.includes('một phương án'))
    return 'multiple-choice';

  if (/\b(?:phần|phan)\s+(?:ii|2)\b/i.test(headerLine)) return 'true-false';
  if (/\b(?:phần|phan)\s+(?:iii|3)\b/i.test(headerLine)) return 'short-answer';
  if (/\b(?:phần|phan)\s+(?:iv|4)\b/i.test(headerLine)) return 'essay';
  if (/\b(?:phần|phan)\s+(?:i|1)\b/i.test(headerLine)) return 'multiple-choice';

  if (partIndex === 1) return 'true-false';
  if (partIndex === 2) return 'short-answer';
  if (partIndex >= 3) return 'essay';
  return 'multiple-choice';
}

interface RawPartBlock {
  label: string;
  customInstruction: string | null;
  kindHint: ExamPartKind | null;
  lines: string[];
}

/**
 * Tách một dòng có chứa nhiều phương án A. ... B. ... C. ... D. ... viết ngang trên 1 dòng
 */
function splitInlineChoiceLine(
  line: string,
): readonly { letter: OptionLetter; isCorrect: boolean; content: string }[] | null {
  const regex = /(?:^|\s)(\*?)([A-D])\.\s+/g;
  const matches: Array<{
    index: number;
    fullLen: number;
    isCorrect: boolean;
    letter: OptionLetter;
  }> = [];
  let m: RegExpExecArray | null;
  while ((m = regex.exec(line)) !== null) {
    const leadingSpace = m[0].startsWith(' ') || m[0].startsWith('\t') ? 1 : 0;
    matches.push({
      index: m.index + leadingSpace,
      fullLen: m[0].length - leadingSpace,
      isCorrect: m[1] === '*',
      letter: m[2] as OptionLetter,
    });
  }

  if (matches.length === 0) return null;
  // Chỉ coi là dòng phương án nếu phần tử đầu tiên nằm ngay đầu dòng (bỏ khoảng trắng đầu)
  const firstNonSpace = line.search(/\S/);
  if (matches[0]!.index !== firstNonSpace) return null;

  return matches.map((cur, idx) => {
    const start = cur.index + cur.fullLen;
    const end = idx + 1 < matches.length ? matches[idx + 1]!.index : line.length;
    return {
      letter: cur.letter,
      isCorrect: cur.isCorrect,
      content: line.slice(start, end).trim(),
    };
  });
}

function parseQuestionBlock(
  lines: readonly string[],
  fallbackKind: ExamPartKind,
  questionNumber: number,
  autoRecognizeMath: boolean,
  images: Readonly<Record<string, ExamImageAttachment>>,
): ExamQuestion {
  const stemLines: string[] = [];
  const optionsMap = new Map<OptionLetter, string>();
  const statementsMap = new Map<StatementLetter, ExamTrueFalseStatement>();
  let correctOption: OptionLetter | null = null;
  let columnsMode: OptionColumnsMode = 'auto';
  let shortAnswer = '';
  let hasExplicitShortAnswerTag = false;
  let image: ExamImageAttachment | null = null;

  let activeSection: 'stem' | 'option' | 'statement' = 'stem';
  let activeOptionLetter: OptionLetter | null = null;
  let activeStatementLetter: StatementLetter | null = null;

  for (let i = 0; i < lines.length; i += 1) {
    const rawLine = lines[i]!;
    const trimmed = rawLine.trim();

    // Nhận diện thẻ ảnh cục bộ `[HÌNH:img-id]` hoặc `[HINH:img-id]`
    const imageTagMatch = trimmed.match(/^\[(?:HÌNH|HINH|IMG):([^\]]+)\]$/i);
    if (imageTagMatch?.[1]) {
      const imgId = imageTagMatch[1].trim();
      if (images[imgId]) {
        image = images[imgId]!;
        continue;
      }
    }

    // Nhận diện thẻ cấu hình cột `[CỘT:2]` / `[COT:4]`
    const colMatch = trimmed.match(/^\[(?:CỘT|COT|COLS?):(1|2|4|auto)\]$/i);
    if (colMatch?.[1]) {
      const val = colMatch[1].toLowerCase();
      columnsMode = val === 'auto' ? 'auto' : (Number(val) as 1 | 2 | 4);
      continue;
    }

    // Nhận diện thẻ đáp án `[Đáp án: ...]` / `[ĐA: ...]` (kể cả khi để trống `[Đáp án: ]`)
    const ansMatch = trimmed.match(/^\[(?:Đáp án|Dap an|ĐA|DA)\s*:\s*([^\]]*)\]$/i);
    if (ansMatch) {
      const value = (ansMatch[1] ?? '').trim();
      const singleLetter = value.toUpperCase();
      if (
        singleLetter === 'A' ||
        singleLetter === 'B' ||
        singleLetter === 'C' ||
        singleLetter === 'D'
      ) {
        correctOption = singleLetter;
      } else {
        shortAnswer = value;
        if (optionsMap.size === 0 && statementsMap.size === 0 && fallbackKind !== 'essay') {
          hasExplicitShortAnswerTag = true;
        }
      }
      continue;
    }

    // Kiểm tra dòng phương án Trắc nghiệm: A. ... B. ... C. ... D. ...
    const inlineChoices = splitInlineChoiceLine(rawLine);
    if (inlineChoices && inlineChoices.length > 0) {
      activeSection = 'option';
      for (const choice of inlineChoices) {
        optionsMap.set(choice.letter, choice.content);
        if (choice.isCorrect) {
          correctOption = choice.letter;
        }
        activeOptionLetter = choice.letter;
      }
      continue;
    }

    // Kiểm tra dòng mệnh đề Đúng/Sai: a) ... b) ... c) ... d) ...
    const tfMatch = trimmed.match(/^(\*?)([a-d])\)\s*(.*)$/);
    if (tfMatch && tfMatch[2]) {
      const isStarred = tfMatch[1] === '*';
      const letter = tfMatch[2] as StatementLetter;
      let content = (tfMatch[3] ?? '').trim();
      let isTrue: boolean | null = isStarred ? true : null;

      const tailFlag = content.match(/\s*\[(Đ|D|Đúng|Dung|S|Sai)\]\s*$/i);
      if (tailFlag?.[1]) {
        const flag = tailFlag[1].toLowerCase();
        isTrue = flag === 'đ' || flag === 'd' || flag === 'đúng' || flag === 'dung';
        content = content.slice(0, tailFlag.index).trim();
      }

      statementsMap.set(letter, { label: letter, content, isTrue });
      activeSection = 'statement';
      activeStatementLetter = letter;
      continue;
    }

    // Dòng tiếp nối của thân câu hỏi, phương án hoặc mệnh đề
    if (activeSection === 'option' && activeOptionLetter && trimmed) {
      const prev = optionsMap.get(activeOptionLetter) ?? '';
      optionsMap.set(activeOptionLetter, prev ? `${prev} ${trimmed}` : trimmed);
    } else if (activeSection === 'statement' && activeStatementLetter && trimmed) {
      const prev = statementsMap.get(activeStatementLetter);
      if (prev) {
        statementsMap.set(activeStatementLetter, {
          ...prev,
          content: prev.content ? `${prev.content} ${trimmed}` : trimmed,
        });
      }
    } else {
      stemLines.push(rawLine);
    }
  }

  // Chuẩn hóa toán học cho thân câu, phương án, mệnh đề
  const norm = (s: string) => normalizeSmartMathText(s, autoRecognizeMath);

  const options: ExamChoiceOption[] = [];
  for (const letter of OPTION_LETTERS) {
    const content = optionsMap.get(letter);
    if (content !== undefined) {
      options.push({ label: letter, content: norm(content) });
    }
  }

  const statements: ExamTrueFalseStatement[] = [];
  for (const letter of STATEMENT_LETTERS) {
    const st = statementsMap.get(letter);
    if (st) {
      statements.push({ ...st, content: norm(st.content) });
    }
  }

  // Tự suy luận dạng câu hỏi nếu trong phần đó có rõ A-D, a)-d) hoặc thẻ [Đáp án: ...]
  let resolvedKind: ExamPartKind = fallbackKind;
  if (options.length >= 2) {
    resolvedKind = 'multiple-choice';
  } else if (statements.length >= 2) {
    resolvedKind = 'true-false';
  } else if (hasExplicitShortAnswerTag) {
    resolvedKind = 'short-answer';
  }

  const cleanedStem = stemLines
    .map((line) => {
      // Giữ nguyên dòng bảng Markdown | ... | và chuẩn hóa từng ô bên trong
      if (line.trim().startsWith('|') && line.trim().endsWith('|')) {
        return line
          .split('|')
          .map((cell, idx, arr) => {
            if (idx === 0 || idx === arr.length - 1) return cell;
            if (/^\s*:?-+:?\s*$/.test(cell)) return cell;
            return ` ${norm(cell.trim())} `;
          })
          .join('|');
      }
      return norm(line);
    })
    .join('\n')
    .trim();

  return {
    id: `q-${resolvedKind}-${questionNumber}`,
    kind: resolvedKind,
    number: questionNumber,
    stem: cleanedStem,
    options: resolvedKind === 'multiple-choice' ? options : undefined,
    correctOption: resolvedKind === 'multiple-choice' ? correctOption : undefined,
    columnsMode: resolvedKind === 'multiple-choice' ? columnsMode : undefined,
    statements: resolvedKind === 'true-false' ? statements : undefined,
    shortAnswer:
      resolvedKind === 'short-answer' || resolvedKind === 'essay' ? shortAnswer : undefined,
    image,
  };
}

/**
 * Phân tích văn bản soạn nhanh (Smart Exam Markup) thành cấu trúc đề chuẩn PDF Toán 2025.
 */
export function parseExamMarkupToStructure(
  doc: Pick<ExamDocument, 'title' | 'rawMarkup' | 'autoRecognizeMath' | 'images'>,
): ParsedExamStructure {
  const rawLines = doc.rawMarkup.replace(/\r\n/g, '\n').split('\n');
  const partBlocks: RawPartBlock[] = [];
  let currentPart: RawPartBlock | null = null;

  const partHeaderRegex = /^\s*(?:#+\s*)?(PHẦN|PHAN)\s+([IVX]+|\d+)\s*(?:[.:–—-]\s*(.*))?$/i;

  for (const line of rawLines) {
    const match = line.match(partHeaderRegex);
    if (match) {
      const romanOrNum = (match[2] ?? 'I').toUpperCase();
      const normalizedRoman =
        romanOrNum === '1'
          ? 'I'
          : romanOrNum === '2'
            ? 'II'
            : romanOrNum === '3'
              ? 'III'
              : romanOrNum === '4'
                ? 'IV'
                : romanOrNum;
      const tail = (match[3] ?? '').trim();
      const label = `PHẦN ${normalizedRoman}`;
      const kindHint = inferPartKindFromHeader(`${label}. ${tail}`, partBlocks.length);

      currentPart = {
        label,
        customInstruction: tail || null,
        kindHint,
        lines: [],
      };
      partBlocks.push(currentPart);
      continue;
    }

    if (!currentPart) {
      if (!line.trim()) continue;
      currentPart = {
        label: 'PHẦN I',
        customInstruction: null,
        kindHint: null,
        lines: [line],
      };
      partBlocks.push(currentPart);
    } else {
      currentPart.lines.push(line);
    }
  }

  const questionStartRegex = /^\s*(?:Câu|Cau|Bài|Bai)\s*(?:\d+)?\s*[.:]\s*(.*)$/i;

  const parsedParts: ExamPart[] = [];
  let totalQuestions = 0;

  partBlocks.forEach((block, partIndex) => {
    const rawQuestionChunks: string[][] = [];
    let currentChunk: string[] | null = null;

    for (const line of block.lines) {
      const qMatch = line.match(questionStartRegex);
      if (qMatch) {
        currentChunk = [(qMatch[1] ?? '').trim()];
        rawQuestionChunks.push(currentChunk);
      } else if (currentChunk) {
        currentChunk.push(line);
      } else if (line.trim() && !block.customInstruction) {
        // Dòng mô tả ngay sau "PHẦN I." trước Câu 1
        block.customInstruction = line.trim();
      }
    }

    if (rawQuestionChunks.length === 0) return;

    const fallbackKind: ExamPartKind = block.kindHint ?? 'multiple-choice';
    const questions = rawQuestionChunks.map((chunk, qIdx) =>
      parseQuestionBlock(chunk, fallbackKind, qIdx + 1, doc.autoRecognizeMath, doc.images),
    );

    const dominantKind: ExamPartKind = questions[0]?.kind ?? fallbackKind;
    const instruction =
      block.customInstruction && block.customInstruction.length >= 12
        ? block.customInstruction
        : getDefaultPartInstruction(dominantKind, questions.length);

    totalQuestions += questions.length;
    parsedParts.push({
      id: `part-${partIndex + 1}-${dominantKind}`,
      kind: dominantKind,
      label: block.label || getDefaultPartLabel(dominantKind, partIndex),
      instruction,
      questions,
    });
  });

  return {
    title: doc.title.trim() || 'ĐỀ KIỂM TRA MÔN TOÁN',
    parts: parsedParts,
    totalQuestions,
  };
}

/**
 * Chuyển ngược từ cấu trúc đã phân tích (dùng khi chỉnh sửa trên Visual Card Builder hoặc sau khi Trộn đề)
 * thành văn bản Smart Exam Markup gọn gàng, sạch sẽ.
 */
export function serializePartsToExamMarkup(parts: readonly ExamPart[]): string {
  const sections: string[] = [];

  for (const part of parts) {
    const lines: string[] = [];
    lines.push(`${part.label}. ${part.instruction}`);
    lines.push('');

    part.questions.forEach((q, idx) => {
      const qNum = idx + 1;
      const stemLines = q.stem.split('\n');
      lines.push(`Câu ${qNum}: ${stemLines[0] ?? ''}`);
      for (let i = 1; i < stemLines.length; i += 1) {
        lines.push(stemLines[i]!);
      }

      if (q.image?.id) {
        lines.push(`[HÌNH:${q.image.id}]`);
      }

      if (q.kind === 'multiple-choice' && q.options) {
        if (q.columnsMode && q.columnsMode !== 'auto') {
          lines.push(`[CỘT:${q.columnsMode}]`);
        }
        for (const opt of q.options) {
          const prefix = q.correctOption === opt.label ? `*${opt.label}.` : `${opt.label}.`;
          lines.push(`${prefix} ${opt.content}`);
        }
      } else if (q.kind === 'true-false' && q.statements) {
        for (const st of q.statements) {
          const flag = st.isTrue === true ? ' [Đ]' : st.isTrue === false ? ' [S]' : '';
          lines.push(`${st.label}) ${st.content}${flag}`);
        }
      } else if (q.shortAnswer?.trim()) {
        lines.push(`[Đáp án: ${q.shortAnswer.trim()}]`);
      }

      lines.push('');
    });

    sections.push(lines.join('\n').trimEnd());
  }

  return sections.join('\n\n');
}

function fisherYatesShuffle<T>(items: readonly T[]): T[] {
  const arr = [...items];
  for (let i = arr.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    const tmp = arr[i]!;
    arr[i] = arr[j]!;
    arr[j] = tmp;
  }
  return arr;
}

/**
 * Xáo trộn thứ tự câu hỏi trong từng phần và xáo trộn phương án A–D (bảo toàn đáp án đúng).
 */
export function shuffleExamParts(parts: readonly ExamPart[]): readonly ExamPart[] {
  return parts.map((part) => {
    const shuffledQuestions = fisherYatesShuffle(part.questions).map((q, idx) => {
      if (q.kind === 'multiple-choice' && q.options && q.options.length === 4) {
        const tagged = q.options.map((opt) => ({
          content: opt.content,
          isCorrect: q.correctOption === opt.label,
        }));
        const mixed = fisherYatesShuffle(tagged);
        let nextCorrect: OptionLetter | null = null;
        const nextOptions: ExamChoiceOption[] = mixed.map((item, optIdx) => {
          const letter = OPTION_LETTERS[optIdx]!;
          if (item.isCorrect) nextCorrect = letter;
          return { label: letter, content: item.content };
        });
        return {
          ...q,
          number: idx + 1,
          options: nextOptions,
          correctOption: nextCorrect,
        };
      }
      return { ...q, number: idx + 1 };
    });

    return {
      ...part,
      questions: shuffledQuestions,
    };
  });
}

/**
 * Xuất đề sang mã LaTeX (.tex) chuẩn Tiếng Việt (XeLaTeX / Overleaf),
 * chỉ gồm Tên đề kiểm tra (không in khối Bộ GD&ĐT / SBD / Mã đề) và cấu trúc 3 phần chuẩn PDF.
 */
export function exportExamToLatex(
  structure: ParsedExamStructure,
  options: { readonly showEndLine?: boolean; readonly showAnswerKey?: boolean } = {},
): string {
  const lines: string[] = [
    '% Biên dịch khuyến nghị bằng XeLaTeX hoặc LuaLaTeX (hỗ trợ tiếng Việt UTF-8 & Times New Roman)',
    '\\documentclass[12pt,a4paper]{article}',
    '\\usepackage[a4paper,top=1.8cm,bottom=1.8cm,left=2cm,right=1.8cm]{geometry}',
    '\\usepackage{amsmath,amssymb,amsfonts}',
    '\\usepackage{array,booktabs,enumitem}',
    '\\usepackage{fontspec}',
    '\\setmainfont{Times New Roman}',
    '\\setlength{\\parindent}{0pt}',
    '\\setlength{\\parskip}{4pt}',
    '',
    '\\begin{document}',
    '',
    '\\begin{center}',
    `  {\\Large\\bfseries ${structure.title.toUpperCase()}}`,
    '\\end{center}',
    '\\vspace{6pt}',
    '',
  ];

  for (const part of structure.parts) {
    lines.push(`\\noindent\\textbf{${part.label}.} ${part.instruction}`);
    lines.push('\\vspace{4pt}');
    lines.push('');

    for (const q of part.questions) {
      lines.push(`\\noindent\\textbf{Câu ${q.number}:} ${q.stem}`);
      if (q.kind === 'multiple-choice' && q.options && q.options.length > 0) {
        const cols = resolveOptionColumns(q.options, q.columnsMode);
        if (cols === 4) {
          lines.push('\\begin{center}');
          lines.push('\\begin{tabular*}{\\textwidth}{@{\\extracolsep{\\fill}}llll}');
          lines.push(
            q.options.map((o) => `\\textbf{${o.label}.} ${o.content}`).join(' & ') + ' \\\\',
          );
          lines.push('\\end{tabular*}');
          lines.push('\\end{center}');
        } else if (cols === 2) {
          lines.push('\\begin{center}');
          lines.push('\\begin{tabular*}{\\textwidth}{@{\\extracolsep{\\fill}}ll}');
          lines.push(
            `\\textbf{${q.options[0]?.label ?? 'A'}.} ${q.options[0]?.content ?? ''} & \\textbf{${q.options[1]?.label ?? 'B'}.} ${q.options[1]?.content ?? ''} \\\\`,
          );
          lines.push(
            `\\textbf{${q.options[2]?.label ?? 'C'}.} ${q.options[2]?.content ?? ''} & \\textbf{${q.options[3]?.label ?? 'D'}.} ${q.options[3]?.content ?? ''} \\\\`,
          );
          lines.push('\\end{tabular*}');
          lines.push('\\end{center}');
        } else {
          lines.push('\\begin{enumerate}[label=\\textbf{\\Alph*.}, leftmargin=1.5em, itemsep=2pt]');
          for (const o of q.options) {
            lines.push(`  \\item ${o.content}`);
          }
          lines.push('\\end{enumerate}');
        }
      } else if (q.kind === 'true-false' && q.statements && q.statements.length > 0) {
        lines.push('\\begin{enumerate}[label=\\textbf{\\alph*)}, leftmargin=1.8em, itemsep=2pt]');
        for (const st of q.statements) {
          lines.push(`  \\item ${st.content}`);
        }
        lines.push('\\end{enumerate}');
      }
      lines.push('');
    }
  }

  if (options.showEndLine !== false) {
    lines.push('\\begin{center}');
    lines.push('  \\textbf{---------- HẾT ----------}');
    lines.push('\\end{center}');
  }

  if (options.showAnswerKey) {
    lines.push('');
    lines.push('\\newpage');
    lines.push('\\begin{center}\\textbf{\\large BẢNG ĐÁP ÁN}\\end{center}');
    for (const part of structure.parts) {
      lines.push(`\\noindent\\textbf{${part.label}:}`);
      lines.push('\\begin{itemize}[leftmargin=1.5em, itemsep=1pt]');
      for (const q of part.questions) {
        if (q.kind === 'multiple-choice') {
          lines.push(`  \\item Câu ${q.number}: \\textbf{${q.correctOption ?? '—'}}`);
        } else if (q.kind === 'true-false') {
          const summary = (q.statements ?? [])
            .map((s) => `${s.label}) ${s.isTrue === true ? 'Đ' : s.isTrue === false ? 'S' : '?'}`)
            .join('; ');
          lines.push(`  \\item Câu ${q.number}: ${summary}`);
        } else {
          lines.push(`  \\item Câu ${q.number}: \\textbf{${q.shortAnswer || '—'}}`);
        }
      }
      lines.push('\\end{itemize}');
    }
  }

  lines.push('');
  lines.push('\\end{document}');
  return lines.join('\n');
}
