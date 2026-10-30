import { Link } from 'react-router';
import { ROUTES } from '@/shared/config/routes';

export function NotFoundPage() {
  return (
    <section className="mx-auto max-w-xl py-16 text-center">
      <p className="text-xs font-semibold tracking-widest text-stone-400 uppercase">Lỗi 404</p>
      <h1 className="mt-3 text-2xl font-semibold tracking-tight text-stone-900 sm:text-3xl">
        Không tìm thấy trang bạn yêu cầu
      </h1>
      <p className="mt-3 text-sm leading-relaxed text-stone-600">
        Đường dẫn có thể đã thay đổi hoặc bài học chưa được xuất bản. Bạn có thể quay về trang chủ
        để tiếp tục tra cứu các môn học.
      </p>
      <div className="mt-8">
        <Link
          to={ROUTES.home}
          className="inline-flex items-center rounded-lg bg-stone-900 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-stone-800"
        >
          Về trang chủ
        </Link>
      </div>
    </section>
  );
}

export default NotFoundPage;
