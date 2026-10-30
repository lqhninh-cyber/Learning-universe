# Thư mục Nội dung Học thuật (`content/`)

Thư mục này là **nguồn sự thật (source of truth)** cho toàn bộ nội dung học thuật của Learning Universe.

## Cấu trúc dự kiến (triển khai chi tiết ở Giai đoạn 2)

```text
content/
├── _shared/
│   ├── bibliography.yaml       # Danh mục giáo trình và tài liệu tham khảo dùng chung
│   └── katex-macros.json       # Các macro LaTeX dùng chung (GĐ2)
├── algebraic-structures/       # Môn: Cấu trúc đại số (GĐ2)
│   ├── subject.yaml
│   └── 01-nhom/
│       ├── chapter.yaml
│       └── 01-dinh-nghia-nhom.mdx
└── affine-geometry/            # Môn: Hình học Affine (GĐ2)
    ├── subject.yaml
    └── 01-khong-gian-affine/
        ├── chapter.yaml
        └── 01-dinh-nghia-khong-gian-affine.mdx
```

## Nguyên tắc bắt buộc

1. **Không tự tạo thông tin giáo trình:** File `_shared/bibliography.yaml` khởi tạo rỗng (`sources: []`) và chỉ được cập nhật khi chủ dự án cung cấp thông tin chính thức.
2. **Bảo vệ nội dung đã phê duyệt:** Các bài học ở trạng thái `approved` và `published` không được AI tự ý chỉnh sửa nội dung học thuật.
3. **Định danh bất biến:** Mỗi môn học, chương và bài học đều có `id` cố định để gắn với tiến độ học tập của người dùng trên Supabase.
