# 11 — Frontend Sitemap & Screens

## 1. Frontend principles

- Tiếng Việt trước.
- Giao diện rõ, chữ đủ lớn, phù hợp người lớn tuổi.
- Desktop ưu tiên cho sơ đồ cây.
- Mobile responsive tối thiểu, không vỡ layout.
- Không hiển thị dữ liệu nhạy cảm nếu backend đã mask.
- Không cho người dùng bị lạc khi thêm người/quan hệ.

---

## 2. Sitemap Level 1

```text
/
/login
/invite/[token]
/app
/app/[familySlug]
/app/[familySlug]/tree
/app/[familySlug]/people
/app/[familySlug]/people/[personId]
/app/[familySlug]/branches
/app/[familySlug]/calendar
/app/[familySlug]/media
/app/[familySlug]/admin
/app/[familySlug]/admin/people
/app/[familySlug]/admin/relationships
/app/[familySlug]/admin/members
/app/[familySlug]/admin/invites
/app/[familySlug]/admin/audit
/app/[familySlug]/admin/settings
```

Level 1 có thể ẩn một số route chưa hoàn chỉnh nhưng nên giữ cấu trúc.

---

## 3. Layout chính

### 3.1. Auth layout

- Logo/tên app.
- Login bằng phone/email OTP.
- Nhập mã code.
- Invite accept flow.

### 3.2. App layout

- Sidebar trái:
  - Tổng quan.
  - Cây gia phả.
  - Danh sách người.
  - Chi/phái.
  - Lịch giỗ.
  - Tài liệu.
  - Quản trị.
- Header:
  - Tên gia phả.
  - Search nhanh.
  - User menu.

---

## 4. Screen: Login

### Components

- Phone/email input.
- OTP code input.
- Button gửi mã.
- Button xác nhận.
- Error state.
- Link quay lại nếu invite invalid.

### Notes

- Dev mode có thể hiện fake OTP nếu cấu hình.
- Production không expose OTP.

---

## 5. Screen: Invite accept

### Nội dung

- Tên gia phả được mời.
- Role dự kiến.
- Thời hạn invite.
- Đăng nhập/nhập OTP.
- Sau khi accept chuyển vào `/app/[familySlug]`.

### Error states

- Invite hết hạn.
- Invite đã bị thu hồi.
- Invite đã dùng.
- User không khớp email/phone nếu invite ràng buộc.

---

## 6. Screen: Dashboard

### Widgets Level 1

- Tổng số người.
- Người còn sống.
- Người đã mất.
- Người thiếu ngày sinh.
- Người thiếu cha/mẹ.
- Người chưa có ảnh.
- File mới upload.
- Đề xuất sửa đang chờ nếu Level 2.

### Actions

- Thêm người.
- Mở cây gia phả.
- Mời thành viên.
- Xem dữ liệu cần bổ sung.

---

## 7. Screen: Tree

### Requirements

- Cây dọc từ tổ tiên xuống con cháu.
- Zoom/pan/kéo thả.
- Lọc branch.
- Search rồi focus node.
- Mở rộng/thu gọn nhánh.
- Click node mở right panel.

### Node display

Node nên hiển thị:

- Tên.
- Năm sinh–mất nếu được phép.
- Đời thứ.
- Ảnh/avatar nếu được phép.
- Badge người còn sống/deceased nếu cần.
- Badge privacy masked nếu dữ liệu bị ẩn.

### Right panel

Tabs/sections:

- Tóm tắt.
- Quan hệ: cha mẹ, vợ/chồng, con.
- Hành động nhanh:
  - Thêm cha.
  - Thêm mẹ.
  - Thêm vợ/chồng.
  - Thêm con.
  - Xem hồ sơ.

### Tree performance

- Không render toàn bộ gia tộc lớn.
- Dùng depth limit.
- Lazy load nhánh.
- Backend trả nodes/edges đã mask.

---

## 8. Screen: People list

### Columns

- Tên.
- Đời.
- Chi/phái.
- Trạng thái sống/mất.
- Năm sinh.
- Năm mất.
- Cha/mẹ đã có chưa.
- Ảnh đã có chưa.
- Cập nhật gần nhất.

### Filters

- Search tên.
- Branch.
- Generation.
- Life status.
- Missing data.

### Actions

- Thêm người.
- Import Excel sau này.
- Export Excel nếu có quyền.

---

## 9. Screen: Person profile

### Header

- Avatar.
- Tên chính.
- Tên khác.
- Đời thứ.
- Chi/phái.
- Trạng thái sống/mất.
- Warning privacy masked nếu có.

### Tabs

1. Thông tin cơ bản.
2. Quan hệ gia đình.
3. Tiểu sử.
4. Sự kiện.
5. Ảnh.
6. Tài liệu.
7. Mộ phần.
8. Nguồn xác minh.
9. Lịch sử chỉnh sửa.
10. Bình luận/ghi chú sau này.

### Edit mode

- Form chia section.
- Không bắt buộc quá nhiều field.
- Field nhạy cảm có nhãn rõ.
- Save tạo audit log.

---

## 10. Screen: Add/Edit person form

### Step mode đề xuất

#### Step 1 — Thông tin tối thiểu

- Tên hiển thị.
- Giới tính.
- Trạng thái sống/mất/không rõ.

#### Step 2 — Vị trí trong gia phả

- Chọn cha.
- Chọn mẹ.
- Chọn vợ/chồng.
- Chọn con của ai nếu được tạo từ tree.
- Thứ tự con.

#### Step 3 — Thông tin bổ sung

- Ngày sinh/mất.
- Quê quán.
- Tiểu sử.
- Ảnh.

### UX note

Nếu người dùng thêm từ node trong tree, prefill quan hệ để không phải chọn lại.

---

## 11. Screen: Branches

Level 1 có thể đơn giản:

- Danh sách chi/phái.
- Tên.
- Người sáng lập.
- Số người.
- Nút lọc cây theo chi.

Level 3 mở rộng:

- Tree branch.
- Trưởng chi.
- Quyền duyệt.

---

## 12. Screen: Calendar/ngày giỗ

Level 1:

- Danh sách ngày giỗ.
- Âm/dương.
- Người liên quan.
- Ngày sắp tới.

Level 2+:

- Email notification.
- Zalo/Telegram.
- iCal/Google Calendar.

---

## 13. Screen: Media library

- Danh sách file.
- Filter theo type.
- Filter theo person/source/event.
- Upload.
- Visibility badge.
- Download nếu có quyền.

---

## 14. Screen: Admin members/invites

### Members

- Tên user.
- Email/phone.
- Role.
- Branch scope.
- Status.
- Actions: change role, revoke.

### Invites

- Invite pending.
- Role.
- Expiry.
- Copy link.
- Revoke.

---

## 15. Screen: Admin audit

- Timeline thay đổi.
- Filter actor.
- Filter entity.
- Filter action.
- Xem before/after JSON ở chế độ admin.

---

## 16. Screen: Settings

- Tên gia phả.
- Privacy policy.
- Living person policy.
- Noindex toggle.
- Invite policy.
- Storage quota.
- Export settings/watermark.

---

## 17. Component list

```text
TreeCanvas
PersonNode
PersonRightPanel
PersonSearchBox
PersonForm
RelationshipForm
DateInputFlexible
LunarDateInput
PrivacyBadge
RoleBadge
MediaUploader
SignedMediaViewer
AuditTimeline
InviteDialog
BranchSelector
GenerationBadge
```

---

## 18. UI warnings

- Không dùng thuật ngữ quá kỹ thuật cho người lớn tuổi.
- Không hiện quá nhiều field trên form đầu tiên.
- Không bắt nhập ngày sinh/mất.
- Không để hành động xóa quá dễ bấm.
- Không hiển thị người còn sống đầy đủ nếu API đã báo `privacyMasked`.
- Không render cây khổng lồ trong một lần.
