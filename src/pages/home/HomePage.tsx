import { isSupabaseConfigured } from '@/services/supabase/client';

export function HomePage() {
  return (
    <section className="mx-auto max-w-3xl space-y-8 py-8">
      <div className="space-y-4">
        <p className="text-xs font-semibold tracking-widest text-stone-500 uppercase">
          Chương trình Sư phạm Toán học
        </p>
        <h1 className="text-3xl font-semibold tracking-tight text-stone-900 sm:text-4xl">
          Không gian học tập Toán học đại học
        </h1>
        <p className="text-base leading-relaxed text-stone-600">
          Nền tảng tổng hợp lý thuyết, định nghĩa, định lý, chứng minh và mô phỏng trực quan cho các
          học phần chuyên ngành Sư phạm Toán học, bắt đầu với{' '}
          <strong className="font-medium text-stone-900">Cấu trúc đại số</strong> và{' '}
          <strong className="font-medium text-stone-900">Hình học Affine</strong>.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <article className="rounded-2xl border border-indigo-200/80 bg-white p-6">
          <span className="inline-block rounded-md bg-indigo-50 px-2.5 py-1 text-xs font-medium text-indigo-700">
            Cấu trúc đại số
          </span>
          <h2 className="mt-3 text-lg font-semibold text-stone-900">Nhóm, Vành và Trường</h2>
          <p className="mt-2 text-sm leading-relaxed text-stone-600">
            Hệ thống hóa khái niệm đại số trừu tượng, đồng cấu và cấu trúc thương kèm đối chiếu giáo
            trình gốc.
          </p>
        </article>

        <article className="rounded-2xl border border-teal-200/80 bg-white p-6">
          <span className="inline-block rounded-md bg-teal-50 px-2.5 py-1 text-xs font-medium text-teal-700">
            Hình học Affine
          </span>
          <h2 className="mt-3 text-lg font-semibold text-stone-900">Không gian và Ánh xạ Affine</h2>
          <p className="mt-2 text-sm leading-relaxed text-stone-600">
            Trực quan hóa không gian affine, cái nhìn hình học về hệ tọa độ, tâm tỉ cự và phép biến
            hình.
          </p>
        </article>
      </div>

      <div className="rounded-xl border border-stone-200 bg-stone-100/70 px-4 py-3 text-xs text-stone-600">
        Trạng thái kết nối dữ liệu:{' '}
        <span className="font-medium text-stone-900">
          {isSupabaseConfigured
            ? 'Đã cấu hình Supabase (sẵn sàng cho đồng bộ tiến độ)'
            : 'Chế độ khách chỉ đọc (chưa cấu hình Supabase)'}
        </span>
      </div>
    </section>
  );
}

export default HomePage;
