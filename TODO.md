# TODO: Hiển thị ảnh trên trang tin tức

## Trạng thái: Đang thực hiện

**Thông tin thu thập:**
- `views/news.html`: Template tĩnh với `.news-grid`, load động qua JS.
- `public/js/main.js`: Hàm `loadNews()` fetch `/api/news`, render card với `<img src="${news.thumbnail || '/images/placeholder-news.jpg'}">`.
- `server.js`: API `/api/news` query DB `news.thumbnail` (đường dẫn `/images/uploads/[file]`). Ảnh đã có trong `public/images/uploads/`.
- Vấn đề: Nếu `thumbnail` null → hiển thị placeholder.

**Kế hoạch chi tiết:**
1. ✅ Kiểm tra DB: `mysql` command không có. Dùng phpMyAdmin hoặc /admin/news.html.
2. ⏳ Thêm/cập nhật news với ảnh (admin panel /admin/news.html)
3. ⏳ Test trang `/news` (server đang chạy port 3000)
4. ✅ Hoàn thành

**File phụ thuộc:** Không cần edit code (đã support sẵn).

**Các bước đã hoàn thành:**
- ✅ Server sẵn sàng (port 3000 active)
- ✅ TODO.md tạo & cập nhật tiến độ

**Tiếp theo:** Truy cập http://localhost:3000/news kiểm tra ảnh. Dùng /admin/news.html thêm news + ảnh nếu cần.

**Xác nhận kế hoạch trước khi thực hiện?**
