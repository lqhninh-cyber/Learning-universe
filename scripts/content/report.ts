import { validateContent } from '../../build/content-validator.ts';

function main(): void {
  const projectRoot = process.cwd();
  const result = validateContent({ projectRoot });

  const statusCounts = {
    draft: 0,
    review: 0,
    approved: 0,
    published: 0,
  };

  for (const lesson of result.lessons) {
    statusCounts[lesson.status] += 1;
  }

  console.log('==============================================================');
  console.log('  LEARNING UNIVERSE — BÁO CÁO THỐNG KÊ KHO NỘI DUNG');
  console.log('==============================================================');
  console.log(`- Tổng số môn học         : ${result.manifest.subjects.length}`);
  console.log(
    `- Tổng số chương          : ${result.manifest.subjects.reduce((acc, s) => acc + s.chapters.length, 0)}`,
  );
  console.log(`- Tổng số bài học         : ${result.lessons.length}`);
  console.log(
    `  + Đã xuất bản (published): ${statusCounts.published} | Đã duyệt (approved): ${statusCounts.approved}`,
  );
  console.log(
    `  + Đang duyệt (review)    : ${statusCounts.review} | Bản nháp (draft)   : ${statusCounts.draft}`,
  );
  console.log(`- Thư mục tài liệu nguồn  : ${result.manifest.bibliography.length} mục`);
  console.log('');
  console.log('Chi tiết từng bài học:');
  for (const lesson of result.lessons) {
    const lockTag = lesson.isLocked ? '🔒 Đã khóa' : '🔓 Chưa khóa';
    console.log(
      `  • [${lesson.status.toUpperCase()}] ${lesson.id} (v${lesson.version}) — "${lesson.title}" | ${lesson.blocks.length} khối đánh số | ${lesson.citedSources.length} nguồn | ${lockTag}`,
    );
  }
}

main();
