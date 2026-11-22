/**
 * Bộ xuất PDF đa trang chuẩn PDF 1.4 thuần TypeScript (Zero external dependency).
 * Nhúng trực tiếp ảnh JPEG HiDPI (/Filter /DCTDecode) cho từng trang vở để tạo file .pdf
 * chuẩn xác, mở trực tiếp trên trình duyệt, Adobe Acrobat, Foxit và máy in.
 */

export interface PdfPageImageSpec {
  readonly jpegBytes: Uint8Array;
  readonly pixelWidth: number;
  readonly pixelHeight: number;
  /** Kích thước trang theo điểm in PDF (pt): mặc định A4 dọc 595.28 × 841.89 hoặc A4 ngang */
  readonly pageWidthPt: number;
  readonly pageHeightPt: number;
}

const textEncoder = new TextEncoder();

function encodeAscii(str: string): Uint8Array {
  return textEncoder.encode(str);
}

/** Chuyển DataURL (`data:image/jpeg;base64,...`) thành mảng byte nhị phân Uint8Array */
export function dataUrlToUint8Array(dataUrl: string): Uint8Array {
  const commaIndex = dataUrl.indexOf(',');
  const base64 = commaIndex >= 0 ? dataUrl.slice(commaIndex + 1) : dataUrl;
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

/**
 * Xây dựng dữ liệu nhị phân file PDF 1.4 hoàn chỉnh từ danh sách các trang ảnh JPEG.
 * Bảo đảm bảng `xref` có byte offset chuẩn xác tuyệt đối 10 chữ số cho từng đối tượng PDF.
 */
export function buildMultiPagePdfBytes(pages: readonly PdfPageImageSpec[]): Uint8Array {
  if (pages.length === 0) {
    throw new Error('Cần ít nhất 1 trang để xuất file PDF.');
  }

  // Số hiệu đối tượng PDF:
  // 1: Catalog
  // 2: Pages root
  // Với mỗi trang i (0..N-1):
  //   pageObjId    = 3 + i * 3
  //   imageObjId   = 4 + i * 3
  //   contentObjId = 5 + i * 3
  const chunks: Uint8Array[] = [];
  let cursor = 0;

  const pushBytes = (bytes: Uint8Array) => {
    chunks.push(bytes);
    cursor += bytes.length;
  };
  const pushStr = (str: string) => pushBytes(encodeAscii(str));

  // Header PDF 1.4 kèm 4 byte nhị phân nhận diện binary PDF
  pushStr('%PDF-1.4\n');
  pushBytes(new Uint8Array([0x25, 0xe2, 0xe3, 0xcf, 0xd3, 0x0a]));

  const totalObjects = 2 + pages.length * 3;
  const offsets: number[] = new Array<number>(totalObjects + 1).fill(0);

  const kidRefs = pages.map((_, idx) => `${3 + idx * 3} 0 R`).join(' ');

  // Object 1: Catalog
  offsets[1] = cursor;
  pushStr('1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n');

  // Object 2: Pages
  offsets[2] = cursor;
  pushStr(`2 0 obj\n<< /Type /Pages /Kids [${kidRefs}] /Count ${pages.length} >>\nendobj\n`);

  for (let i = 0; i < pages.length; i += 1) {
    const page = pages[i]!;
    const pageObjId = 3 + i * 3;
    const imageObjId = 4 + i * 3;
    const contentObjId = 5 + i * 3;

    const wPt = page.pageWidthPt.toFixed(2);
    const hPt = page.pageHeightPt.toFixed(2);

    // Page Object
    offsets[pageObjId] = cursor;
    pushStr(
      `${pageObjId} 0 obj\n` +
        `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${wPt} ${hPt}] ` +
        `/Resources << /XObject << /Im${i} ${imageObjId} 0 R >> >> ` +
        `/Contents ${contentObjId} 0 R >>\n` +
        `endobj\n`,
    );

    // Image XObject (DCTDecode JPEG)
    offsets[imageObjId] = cursor;
    pushStr(
      `${imageObjId} 0 obj\n` +
        `<< /Type /XObject /Subtype /Image /Width ${Math.max(1, Math.round(page.pixelWidth))} ` +
        `/Height ${Math.max(1, Math.round(page.pixelHeight))} ` +
        `/ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode ` +
        `/Length ${page.jpegBytes.length} >>\nstream\n`,
    );
    pushBytes(page.jpegBytes);
    pushStr('\nendstream\nendobj\n');

    // Content Stream (vẽ ảnh phủ vừa khít trang)
    const contentStream = `q\n${wPt} 0 0 ${hPt} 0 0 cm\n/Im${i} Do\nQ\n`;
    const contentBytes = encodeAscii(contentStream);
    offsets[contentObjId] = cursor;
    pushStr(`${contentObjId} 0 obj\n<< /Length ${contentBytes.length} >>\nstream\n`);
    pushBytes(contentBytes);
    pushStr('endstream\nendobj\n');
  }

  // Bảng tham chiếu chéo xref
  const xrefStart = cursor;
  pushStr(`xref\n0 ${totalObjects + 1}\n`);
  pushStr('0000000000 65535 f \n');
  for (let id = 1; id <= totalObjects; id += 1) {
    const off = String(offsets[id] ?? 0).padStart(10, '0');
    pushStr(`${off} 00000 n \n`);
  }

  pushStr(
    `trailer\n<< /Size ${totalObjects + 1} /Root 1 0 R >>\n` + `startxref\n${xrefStart}\n%%EOF\n`,
  );

  // Ghép các đoạn thành một Uint8Array duy nhất
  const out = new Uint8Array(cursor);
  let pos = 0;
  for (const chunk of chunks) {
    out.set(chunk, pos);
    pos += chunk.length;
  }
  return out;
}

export function downloadPdfFile(pdfBytes: Uint8Array, filename: string): void {
  const safeName = filename.endsWith('.pdf') ? filename : `${filename}.pdf`;
  const copy = new Uint8Array(pdfBytes.byteLength);
  copy.set(pdfBytes);
  const blob = new Blob([copy.buffer], { type: 'application/pdf' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = safeName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1500);
}

/**
 * Kết xuất nhanh nội dung đề đang soạn ở Xưởng Soạn Đề (/soan-de) thành ảnh phiếu bài tập sạch đẹp
 * để gắn làm nền khóa cố định trên trang vở viết toán.
 */
export function renderExamTextToWorksheetDataUrl(
  title: string,
  rawMarkup: string,
  width = 960,
  height = 680,
): string | null {
  if (typeof document === 'undefined') return null;
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, 0, width, height);

  // Viền tinh tế kiểu phiếu bài tập
  ctx.strokeStyle = '#D5DFDC';
  ctx.lineWidth = 2;
  ctx.strokeRect(24, 24, width - 48, height - 48);

  // Tiêu đề đề kiểm tra
  ctx.fillStyle = '#17332C';
  ctx.font = '700 22px "Be Vietnam Pro", system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(title.trim() || 'PHIẾU BÀI TẬP TOÁN HỌC', width / 2, 66);

  ctx.strokeStyle = '#17332C';
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.moveTo(width * 0.25, 80);
  ctx.lineTo(width * 0.75, 80);
  ctx.stroke();

  // Trích gọn các dòng văn bản câu hỏi (bỏ thẻ hình & dấu $ thô để dễ nhìn)
  const cleanLines = rawMarkup
    .split(/\r?\n/)
    .map((line) =>
      line
        .replace(/\[HÌNH:[^\]]+\]/g, '')
        .replace(/\$/g, '')
        .trim(),
    )
    .filter((line) => line.length > 0 && !line.startsWith('---'));

  ctx.textAlign = 'left';
  ctx.fillStyle = '#111827';
  const maxTextW = width - 104;
  let y = 114;

  for (const line of cleanLines) {
    if (y > height - 46) break;
    const isHeading = /^(PHẦN|Câu\s+\d+)/i.test(line);
    ctx.font = isHeading
      ? '700 16px "Be Vietnam Pro", system-ui, sans-serif'
      : '400 15px "Be Vietnam Pro", system-ui, sans-serif';

    const words = line.split(/\s+/);
    let current = '';
    for (const word of words) {
      const candidate = current ? `${current} ${word}` : word;
      if (ctx.measureText(candidate).width > maxTextW && current) {
        ctx.fillText(current, 52, y);
        y += 24;
        current = word;
        if (y > height - 46) break;
      } else {
        current = candidate;
      }
    }
    if (current && y <= height - 46) {
      ctx.fillText(current, 52, y);
      y += isHeading ? 28 : 24;
    }
  }

  return canvas.toDataURL('image/png');
}
