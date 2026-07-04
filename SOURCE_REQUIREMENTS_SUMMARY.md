# Source Requirements Summary

Tóm tắt yêu cầu do chủ dự án cung cấp trong file `NGHIÊN CỨU DỰ ÁN.docx`.

## 1. Vision

- Level 1: gia đình 4 thế hệ, dưới 100 người.
- Tương lai: gia tộc nhiều chi/phái, nhiều nhánh, 500–1.000 người.
- Xa hơn: nền tảng nhiều gia tộc, có thể thu phí theo gia tộc/dung lượng/người dùng hoặc dịch vụ số hóa gia phả.

## 2. Must-have Level 1

- Đăng nhập/private access.
- Thành viên qua link mời.
- Admin thêm/sửa người và quan hệ.
- Upload ảnh/tài liệu.
- Ngày giỗ âm/dương.
- Cây dọc từ tổ tiên xuống con cháu, zoom/pan.
- Người còn sống cần bảo mật.
- Audit log.
- Backup hằng ngày.

## 3. Data model decisions

- `User` tách khỏi `Person`.
- Level 1 một gia phả nhưng schema hỗ trợ nhiều gia phả.
- Quan hệ cha/mẹ/con dùng bảng riêng `parent_child_relationships`.
- Quan hệ vợ/chồng dùng bảng riêng `partnerships`.
- Audit log có từ Level 1.
- Soft delete/archive, không hard delete.

## 4. Security

- Guest không xem được gì ở Level 1.
- Member xem theo quyền admin cấp.
- Invite-only.
- Chống Google index.
- Log login/download/export/role change.
- Mask thông tin người còn sống.

## 5. Infrastructure

- Ưu tiên chi phí thấp.
- Có Vercel/Supabase.
- Mong muốn server riêng và dữ liệu tại Việt Nam.
- Backup tự động hằng ngày.
- Level 1 target file limit 49GB nhưng cần kiểm hạ tầng.

## 6. Critical interpretation

Yêu cầu Level 1 nhỏ nhưng tương lai lớn, nên không được code như app demo một cây gia đình. Phải xây schema có `family_id`, branch, roles, audit, privacy từ đầu.
