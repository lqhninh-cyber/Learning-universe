import { SubjectOverviewPage } from '@/pages/subjects/SubjectOverviewPage';

/**
 * Trang chi tiết môn học (Cinematic Course Detail Page — `/courses/:subjectSlug`).
 * Kết xuất đồng bộ Cinematic Course Cover tràn viền 100vw cùng hệ thống Tab Lộ trình,
 * Tài liệu Giáo trình (Drive), Ngân hàng Đề thi & Lời giải và Chuẩn đầu ra CLOs.
 */
export function CourseDetailPage() {
  return <SubjectOverviewPage />;
}

export default CourseDetailPage;
