# 02 — Requirements

## 1. Phạm vi Level 1

Level 1 là bản dùng thật cho một gia đình 4 thế hệ, dưới 100 người, chủ yếu bên nội. Website cần đăng nhập riêng tư, có phân quyền, nhập được hồ sơ người và quan hệ, xem được sơ đồ gia phả, bảo vệ dữ liệu người còn sống và lưu được ảnh/tài liệu.

---

## 2. Functional requirements

### 2.1. Auth & access

| ID | Requirement | Priority |
|---|---|---|
| AUTH-01 | Người dùng truy cập website phải đăng nhập trước khi xem dữ liệu gia phả | P0 |
| AUTH-02 | Hệ thống hỗ trợ invite link để mời thành viên | P0 |
| AUTH-03 | Invite có trạng thái pending/accepted/revoked/expired | P1 |
| AUTH-04 | Login production mong muốn bằng số điện thoại + mã code | P1 |
| AUTH-05 | Dev/MVP có thể dùng email OTP hoặc fake OTP nếu chưa có SMS provider | P1 |
| AUTH-06 | Sau này hỗ trợ 2FA | P3 |

### 2.2. Family management

| ID | Requirement | Priority |
|---|---|---|
| FAM-01 | Owner tạo được một gia phả mới | P0 |
| FAM-02 | Gia phả có tên, slug, mô tả, chính sách riêng tư | P0 |
| FAM-03 | Schema hỗ trợ nhiều gia phả bằng `family_id` | P0 |
| FAM-04 | Level 1 UI có thể chỉ cho một gia phả hoạt động | P0 |
| FAM-05 | Sau này mỗi gia phả có trang riêng/subdomain/path riêng | P3 |

### 2.3. People profile

| ID | Requirement | Priority |
|---|---|---|
| PPL-01 | Thêm được người mới với tối thiểu tên hiển thị | P0 |
| PPL-02 | Lưu họ tên đầy đủ, tên thường gọi, tên khai sinh, tên húy/tự/hiệu | P0 |
| PPL-03 | Lưu giới tính, trạng thái sống/mất/không rõ | P0 |
| PPL-04 | Lưu ngày sinh/ngày mất với nhiều mức chính xác | P0 |
| PPL-05 | Hỗ trợ ngày âm lịch/dương lịch và ghi chú ngày không rõ | P1 |
| PPL-06 | Lưu ngày giỗ âm/dương | P1 |
| PPL-07 | Lưu tiểu sử, nghề nghiệp, học vấn, thành tựu | P1 |
| PPL-08 | Lưu quê quán, nơi sinh, nơi mất, nơi an táng | P1 |
| PPL-09 | Lưu số điện thoại, email, địa chỉ hiện tại dưới nhóm dữ liệu nhạy cảm | P1 |
| PPL-10 | Lưu ghi chú riêng tư | P1 |
| PPL-11 | Hỗ trợ người chưa rõ tên hoặc vô danh | P1 |

### 2.4. Relationship management

| ID | Requirement | Priority |
|---|---|---|
| REL-01 | Thêm/sửa/xóa mềm quan hệ cha/mẹ/con | P0 |
| REL-02 | Hỗ trợ cha/mẹ ruột, cha/mẹ nuôi, cha dượng/mẹ kế, con riêng | P0 |
| REL-03 | Thêm/sửa/xóa mềm quan hệ vợ/chồng | P0 |
| REL-04 | Hỗ trợ nhiều vợ/chồng, tái hôn, ly hôn, góa, không rõ ngày | P0 |
| REL-05 | Ghi thứ tự con trong gia đình | P0 |
| REL-06 | Hỗ trợ quan hệ chưa xác minh/tranh chấp | P1 |
| REL-07 | Chống quan hệ vô lý: tự làm cha/mẹ, vòng lặp tổ tiên | P0 |
| REL-08 | Cảnh báo tuổi/ ngày tháng vô lý | P1 |

### 2.5. Branches/generations

| ID | Requirement | Priority |
|---|---|---|
| BR-01 | Có bảng chi/phái/nhánh từ đầu | P0 |
| BR-02 | Người có thể gán vào chi/phái theo người sáng lập nhánh hoặc admin chọn | P1 |
| BR-03 | Có thể lọc sơ đồ theo chi/phái | P1 |
| BR-04 | Sau này trưởng chi quản lý và duyệt dữ liệu chi mình | P2 |
| GEN-01 | Hỗ trợ tự tính đời từ ông tổ/root person | P1 |
| GEN-02 | Hỗ trợ admin nhập tay đời thứ theo gia phả giấy | P1 |

### 2.6. Tree visualization

| ID | Requirement | Priority |
|---|---|---|
| TREE-01 | Hiển thị cây từ tổ tiên xuống con cháu, dạng dọc | P0 |
| TREE-02 | Zoom/pan/kéo thả | P0 |
| TREE-03 | Click người để mở popup/panel tóm tắt | P0 |
| TREE-04 | Panel có thao tác thêm cha/mẹ/vợ/chồng/con nếu user có quyền | P1 |
| TREE-05 | Cây lớn chỉ hiển thị vài đời quanh root và mở rộng từng nhánh | P1 |
| TREE-06 | Tìm kiếm rồi nhảy đến người trong cây | P1 |
| TREE-07 | Xuất ảnh/PDF/in cây gia phả | P2 |

### 2.7. Search & statistics

| ID | Requirement | Priority |
|---|---|---|
| SRCH-01 | Tìm theo họ tên/tên thường gọi | P0 |
| SRCH-02 | Tìm theo đời thứ, chi/phái | P1 |
| SRCH-03 | Tìm theo năm sinh/năm mất | P1 |
| SRCH-04 | Tìm theo quê quán/nơi an táng | P2 |
| SRCH-05 | Sau này tìm quan hệ giữa hai người | P3 |
| STAT-01 | Dashboard tổng số người, sống/mất, thiếu ngày sinh, thiếu cha/mẹ, chưa có ảnh | P1 |

### 2.8. Media & documents

| ID | Requirement | Priority |
|---|---|---|
| MED-01 | Upload ảnh đại diện từng người | P0 |
| MED-02 | Upload ảnh gia đình, ảnh mộ, giấy tờ/tài liệu | P1 |
| MED-03 | Hỗ trợ JPG/PNG/PDF/Word/Excel/video/audio theo whitelist | P1 |
| MED-04 | File private theo quyền | P0 |
| MED-05 | Metadata file lưu DB, binary lưu storage | P0 |
| MED-06 | Quota Level 1 target 49GB/family nhưng phụ thuộc hạ tầng | P2 |
| MED-07 | Nén ảnh/tạo thumbnail | P2 |

### 2.9. Sources & evidence

| ID | Requirement | Priority |
|---|---|---|
| SRC-01 | Lưu nguồn chứng cứ: gia phả giấy, lời kể, bia mộ, giấy khai sinh, ảnh/file scan | P1 |
| SRC-02 | Nguồn có reliability: chắc chắn, khả năng cao, chưa xác minh, tranh chấp | P1 |
| SRC-03 | Gắn nguồn vào thông tin/quan hệ là optional ở Level 1, schema có từ đầu | P2 |

### 2.10. Change requests & audit

| ID | Requirement | Priority |
|---|---|---|
| AUD-01 | Ghi audit log cho mọi thay đổi quan trọng | P0 |
| CR-01 | Thành viên gửi đề xuất sửa, admin duyệt | P2 |
| CR-02 | Trưởng chi duyệt đề xuất trong chi mình | P3 |
| CR-03 | Nếu bị phản đối, đưa vào trạng thái tranh chấp | P3 |

### 2.11. Export & sharing

| ID | Requirement | Priority |
|---|---|---|
| EXP-01 | Chia sẻ bằng link riêng tư/invite | P0 |
| EXP-02 | Mời qua email hoặc copy invite link | P1 |
| EXP-03 | Xuất ảnh sơ đồ | P2 |
| EXP-04 | Xuất Excel/PDF | P2 |
| EXP-05 | Watermark/hạn chế tải xuống | P2 |
| EXP-06 | Tạo sách gia phả | P4 |

---

## 3. Non-functional requirements

### 3.1. Security

- Private by default.
- No data for unauthenticated guests in Level 1.
- Role-based access control.
- Data-group privacy for living persons.
- Audit/security logs.
- No public bucket for sensitive files.
- No indexing by search engines.

### 3.2. Performance

| Level | Target |
|---|---|
| Level 1 | Dưới 100 people, cây 4 thế hệ mượt |
| Level 3 | 500–1.000 people, tree lazy loading |
| Level 4 | Nhiều family, cần tenant isolation, quota, caching |

### 3.3. Usability

- Giao diện tiếng Việt trước.
- Chuẩn bị i18n Việt-Anh.
- Người lớn tuổi: chữ rõ, thao tác ít, label dễ hiểu.
- Desktop ưu tiên, mobile sau nhưng không vỡ layout.

### 3.4. Data portability

- Có export trước khi xóa gia phả.
- Không khóa dữ liệu trong JSON tree khó chuyển.
- Sau này hỗ trợ GEDCOM/Excel.

---

## 4. Acceptance criteria Level 1

1. Owner tạo được family và root person.
2. Admin nhập được ít nhất 20 người demo với quan hệ đa thế hệ.
3. Cây hiển thị đúng đời, cha/mẹ/con, vợ/chồng.
4. Không thể tạo quan hệ vòng lặp.
5. Guest không xem được dữ liệu.
6. Member chỉ xem được dữ liệu theo quyền.
7. Người còn sống được mask dữ liệu nhạy cảm.
8. Upload avatar và tài liệu hoạt động với private access.
9. Audit log hiển thị được thay đổi gần đây.
10. Có hướng backup/restore tối thiểu.
