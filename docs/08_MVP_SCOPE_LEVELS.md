# 08 — MVP Scope Levels

## 1. Tổng quan phân cấp dự án

Dự án được chia thành 6 level để tránh phình scope và tránh lạc database.

| Level | Tên | Mục tiêu |
|---|---|---|
| Level 0 | Foundation | Khóa yêu cầu, schema, kiến trúc, security baseline |
| Level 1 | Gia đình 4 thế hệ | Dùng thật cho một gia đình nhỏ |
| Level 2 | Gia phả gia đình mở rộng | Nhiều người cùng dùng, có duyệt dữ liệu |
| Level 3 | Gia tộc nhiều chi/phái | Scale cho dòng họ lớn |
| Level 4 | Nền tảng nhiều gia tộc | Multi-tenant/SaaS |
| Level 5 | Mở rộng thông minh | AI/OCR/sách gia phả/mobile/API |

---

## 2. Level 0 — Foundation

### Mục tiêu

Hoàn thiện nền tảng để Antigravity code không lạc hướng.

### Deliverables

- Product requirement docs.
- Database design.
- Permission model.
- API specification.
- UI sitemap.
- Deployment plan.
- Security baseline.

### Definition of Done

- Có docs đủ để code Level 1.
- Có schema draft.
- Có role/permission matrix.
- Có API draft.
- Có danh sách risk/open questions.

---

## 3. Level 1 — Gia đình 4 thế hệ

### Mục tiêu

Dùng thật cho một gia đình nhỏ dưới 100 người.

### Scope chính

- Đăng nhập/private access.
- Tạo một gia phả.
- Thêm/sửa người.
- Thêm/sửa cha/mẹ/con/vợ/chồng.
- Xem sơ đồ cơ bản.
- Xem hồ sơ cá nhân.
- Tìm kiếm người.
- Ẩn dữ liệu người còn sống theo quyền.
- Admin quản lý dữ liệu.
- Upload ảnh/tài liệu cơ bản.
- Ngày giỗ âm/dương ở mức dữ liệu.
- Audit log cơ bản.
- Backup cơ bản.

### Level 1 chia nhỏ thành sprint

#### Sprint 1 — App + Auth + Database base

- Next.js/TypeScript/Tailwind.
- Database connection.
- ORM schema/migrations.
- Users, families, memberships, invites.
- Auth/invite flow.
- Permission helpers.

#### Sprint 2 — People + Relationships

- People CRUD.
- Person names.
- Parent-child relationships.
- Partnerships.
- Basic validation.
- Audit log.

#### Sprint 3 — Tree + Search

- Tree API `nodes/edges`.
- Cây dọc từ ancestor xuống descendants.
- Zoom/pan.
- Panel tóm tắt.
- Search người.

#### Sprint 4 — Profile + Media + Privacy

- Profile tabs.
- Upload avatar/media.
- Signed URL/private file.
- Privacy masking người còn sống.

#### Sprint 5 — Admin + Backup + Export cơ bản

- Dashboard thống kê.
- Danh sách người thiếu thông tin.
- Duplicate warning cơ bản.
- Export ảnh/PDF/Excel nếu kịp.
- Backup job/doc.

### Out of scope Level 1 nếu cần cắt bớt

- GEDCOM.
- OCR.
- Billing.
- SaaS signup.
- Sách gia phả đầy đủ.
- App mobile native.
- Tìm quan hệ A-B nâng cao.

---

## 4. Level 2 — Gia phả gia đình mở rộng

### Mục tiêu

Nhiều người cùng dùng, dữ liệu có kiểm soát.

### Features

- Mời thành viên.
- Phân quyền Owner/Admin/Member/Viewer hoàn chỉnh.
- Đề xuất chỉnh sửa và duyệt.
- Upload ảnh/tài liệu tốt hơn.
- Lịch sử chỉnh sửa hiển thị rõ.
- Chi/phái cơ bản.
- Ngày giỗ, thông báo trong app/email.
- Xuất PDF/ảnh sơ đồ cơ bản.

---

## 5. Level 3 — Gia tộc nhiều chi/phái

### Mục tiêu

Scale cho dòng họ lớn 500–1.000 người.

### Features

- Quản lý nhiều chi/phái/nhánh.
- Trưởng chi quản lý dữ liệu chi mình.
- Sơ đồ lớn lazy loading.
- Tìm kiếm nâng cao.
- Kiểm tra lỗi dữ liệu.
- Gộp người trùng.
- Nguồn chứng cứ/certainty.
- Mộ phần/bản đồ.
- Import/export Excel/GEDCOM.

---

## 6. Level 4 — Nền tảng nhiều gia tộc

### Mục tiêu

Cho nhiều gia đình/gia tộc cùng sử dụng.

### Features

- Multi-tenant hoàn chỉnh.
- Mỗi gia phả có trang riêng.
- Self-service signup nếu cần.
- Gói miễn phí/trả phí.
- Quản trị hệ thống.
- Giới hạn dung lượng/người dùng.
- Billing.
- Audit/security nâng cao.
- Custom domain/subdomain.

---

## 7. Level 5 — Mở rộng thông minh

### Mục tiêu

Nâng cấp thành nền tảng gia phả mạnh.

### Features

- AI hỗ trợ nhập liệu.
- OCR tài liệu cũ.
- Tạo sách gia phả.
- Phân tích quan hệ giữa hai người.
- Bản đồ di cư/mộ phần.
- Mobile app.
- API public/private.

---

## 8. Ưu tiên 3–6 tháng đầu

Nên tập trung vào:

```text
Level 0 hoàn chỉnh + Level 1 chạy được với dữ liệu thật.
```

Không nên triển khai Level 4/5 trước khi:

- Gia đình thật đã dùng Level 1.
- Database đã chứng minh không vỡ khi nhập 4 thế hệ.
- Người lớn tuổi/thành viên đã phản hồi UI.
- Bảo mật/private access đã kiểm tra.

---

## 9. Scope control

Nếu dự án chậm, cắt theo thứ tự:

1. Cắt export PDF/sách gia phả.
2. Cắt video/audio upload, chỉ giữ ảnh/PDF.
3. Cắt change request, admin sửa trực tiếp trước.
4. Cắt ngày giỗ notification, chỉ lưu dữ liệu.
5. Cắt tìm quan hệ A-B, để Level 3.

Không được cắt:

- Schema relationship-first.
- Auth/private access.
- Privacy người còn sống.
- Audit log cơ bản.
- Soft delete.
- Backup.
