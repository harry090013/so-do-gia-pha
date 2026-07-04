# 00 — Đọc trước khi triển khai

Tài liệu này giúp Antigravity hiểu dự án trong 5 phút đầu.

---

## 1. Dự án là gì?

Đây là website gia phả, trước mắt phục vụ một gia đình 4 thế hệ dưới 100 người, sau đó mở rộng thành hệ thống quản lý gia phả cho gia tộc nhiều chi/phái, và xa hơn là nền tảng cho nhiều gia đình/gia tộc cùng sử dụng.

Sản phẩm không chỉ là sơ đồ cây. Sơ đồ cây chỉ là một giao diện hiển thị. Lõi của sản phẩm là hệ thống dữ liệu gia phả có phân quyền, bảo mật, lịch sử chỉnh sửa, nguồn chứng cứ, tài liệu và khả năng mở rộng.

---

## 2. Người dùng mục tiêu

- Owner/Admin chính.
- Admin gia đình nhỏ.
- Trưởng chi/phái.
- Thành viên gia đình.
- Người lớn tuổi cần giao diện đơn giản.
- Con cháu trẻ dùng để tra cứu.
- Người nghiên cứu lịch sử/gia phả.

---

## 3. Level 1 cần làm gì?

- Đăng nhập riêng tư bằng lời mời.
- Tạo một gia phả.
- Nhập người và quan hệ.
- Hiển thị cây dọc từ tổ tiên xuống con cháu.
- Trang hồ sơ cá nhân.
- Upload ảnh/tài liệu.
- Phân quyền cơ bản.
- Ẩn thông tin nhạy cảm người còn sống.
- Audit log.
- Dashboard admin cơ bản.
- Backup hằng ngày.

---

## 4. Level 1 không được làm sai điều gì?

- Không dùng JSON tree làm database gốc.
- Không dùng `father_id`, `mother_id`, `spouse_id` trong `people` làm mô hình chính.
- Không public dữ liệu cho khách chưa đăng nhập.
- Không hard delete.
- Không bỏ qua audit log.
- Không để file upload ở bucket public.
- Không gộp tài khoản đăng nhập với hồ sơ gia phả.

---

## 5. Các quyết định đã chốt

| Nhóm | Quyết định |
|---|---|
| Database | PostgreSQL |
| Schema | Hỗ trợ nhiều gia phả từ đầu bằng `family_id` |
| Quan hệ cha/mẹ/con | Bảng riêng `parent_child_relationships` |
| Quan hệ vợ/chồng | Bảng riêng `partnerships` |
| Tài khoản và hồ sơ | `users` tách khỏi `people` |
| Xóa dữ liệu | Soft delete/archive |
| Bảo mật | Invite-only, khách không xem được dữ liệu Level 1 |
| Người còn sống | Có privacy masking |
| Audit | Có từ Level 1 |
| Upload | File ở storage, metadata ở DB |
| UI | Desktop ưu tiên, mobile sau |
| Ngôn ngữ | Tiếng Việt trước, chuẩn bị i18n Việt-Anh |

---

## 6. Những mâu thuẫn cần xử lý thực dụng

### 6.1. Muốn phone OTP nhưng muốn gần như miễn phí

Phone OTP qua SMS thường phát sinh chi phí và cần nhà cung cấp SMS. Vì vậy code nên có `AuthAdapter` để môi trường dev dùng email OTP/fake OTP, production bật phone OTP khi đã có ngân sách/SMS provider.

### 6.2. Muốn dữ liệu ở Việt Nam nhưng đang có Vercel/Supabase

Vercel/Supabase rất tiện cho MVP, nhưng nếu yêu cầu dữ liệu thật sự phải nằm tại Việt Nam thì cần phương án VPS/managed PostgreSQL tại Việt Nam cho production chính thức.

### 6.3. Level 1 muốn nhiều tính năng

Level 1 đang bao gồm login, cây, hồ sơ, quan hệ, upload, ngày giỗ, privacy, admin, export. Cần chia nhỏ thành các sprint để không bị phình scope.

---

## 7. Câu thần chú khi code

```text
Level 1 nhỏ ở UI, nhưng schema phải đủ lớn để không phải đập đi làm lại.
```
