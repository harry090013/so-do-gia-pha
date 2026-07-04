# 16 — Glossary

## 1. Thuật ngữ gia phả Việt Nam

| Thuật ngữ | Nghĩa trong hệ thống |
|---|---|
| Gia phả | Toàn bộ dữ liệu một family/dòng họ |
| Dòng họ | Một family/tenant |
| Chi | Nhánh lớn trong dòng họ |
| Phái | Nhánh/chi theo cách gọi truyền thống |
| Nhánh | Branch con trong hệ thống |
| Đời thứ | Generation number từ ông tổ/root ancestor |
| Ông tổ/root ancestor | Người gốc dùng để tính đời và hiển thị cây |
| Trưởng chi | Branch Manager |
| Trưởng nam | Con trai trưởng |
| Thứ nam | Con trai thứ |
| Con trưởng | Người con đầu theo thứ tự gia đình |
| Con út | Người con cuối |
| Con út nam | Con trai cuối |
| Con út nữ | Con gái cuối |
| Tên húy | Tên kiêng gọi, thường dùng trong gia phả truyền thống |
| Tên tự | Tên chữ/tên tự |
| Tên hiệu | Tên hiệu, bút danh, danh xưng |
| Ngày giỗ | Memorial date, thường dùng âm lịch |
| Mộ phần | Grave/burial record |
| Từ đường | Ancestral house/shrine |
| Gia phả giấy | Family book/source document |
| Lời kể | Oral history/source |

---

## 2. Thuật ngữ kỹ thuật

| Thuật ngữ | Nghĩa |
|---|---|
| Tenant | Một gia phả/family trong hệ thống nhiều gia phả |
| Multi-tenant | Nhiều gia phả dùng chung hệ thống |
| RBAC | Role-based access control |
| Privacy masking | Ẩn dữ liệu nhạy cảm tùy quyền |
| Soft delete/archive | Không xóa cứng, chỉ đánh dấu lưu trữ |
| Audit log | Lịch sử thay đổi dữ liệu |
| Security log | Log hành vi nhạy cảm như login/download/export |
| Signed URL | Link file có thời hạn |
| Object storage | Nơi lưu file, không phải database |
| Recursive query | Truy vấn tổ tiên/con cháu nhiều đời |
| Graph | Dữ liệu node/edge để biểu diễn quan hệ |
| GEDCOM | Chuẩn trao đổi dữ liệu gia phả, dùng sau này |

---

## 3. Enum mapping tiếng Việt

### life_status

| Value | Label |
|---|---|
| living | Còn sống |
| deceased | Đã mất |
| unknown | Không rõ |

### gender

| Value | Label |
|---|---|
| male | Nam |
| female | Nữ |
| other | Khác |
| unknown | Không rõ |

### relationship_type

| Value | Label |
|---|---|
| biological | Ruột |
| adoptive | Nuôi |
| step | Kế/dượng |
| foster | Bảo trợ/chăm sóc |
| guardian | Giám hộ |
| ritual_heir | Thừa tự/hương hỏa |
| unknown | Không rõ |

### certainty_level

| Value | Label |
|---|---|
| confirmed | Chắc chắn |
| likely | Khả năng cao |
| unverified | Chưa xác minh |
| disputed | Tranh chấp |

### membership_role

| Value | Label |
|---|---|
| owner | Chủ gia phả |
| family_admin | Admin gia phả |
| branch_manager | Trưởng chi |
| editor | Người nhập liệu |
| member | Thành viên |
| viewer | Chỉ xem |

---

## 4. UI labels đề xuất

| Action | Label tiếng Việt |
|---|---|
| Add person | Thêm người |
| Add father | Thêm cha |
| Add mother | Thêm mẹ |
| Add spouse | Thêm vợ/chồng |
| Add child | Thêm con |
| Archive | Lưu trữ |
| Edit | Chỉnh sửa |
| View tree | Xem cây gia phả |
| Invite member | Mời thành viên |
| Pending approval | Chờ duyệt |
| Privacy masked | Đã ẩn theo quyền riêng tư |
| Download | Tải xuống |
| Export | Xuất dữ liệu |

---

## 5. Các cụm từ nên tránh trong UI

- “Xóa vĩnh viễn” nếu thực tế là archive.
- “Public” nếu người dùng không hiểu; dùng “Công khai”.
- “Tenant” trong UI người dùng; dùng “Gia phả” hoặc “Dòng họ”.
- “Node/edge” trong UI; dùng “Người/quan hệ”.
