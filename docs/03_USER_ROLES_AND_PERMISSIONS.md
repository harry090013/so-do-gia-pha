# 03 — User Roles & Permissions

## 1. Nguyên tắc phân quyền

Phân quyền phải theo 3 lớp:

1. **Role:** Owner, Admin, Branch Manager, Editor, Member, Viewer, Guest.
2. **Scope:** toàn family hoặc một branch/chi/phái.
3. **Data group:** thông tin cơ bản, dữ liệu người còn sống, liên hệ, file nhạy cảm, ghi chú riêng tư, audit/security.

Không nên phân quyền từng field rời rạc ngay từ Level 1 vì sẽ làm UI và backend phức tạp. Nhưng schema và policy nên chia theo nhóm dữ liệu để sau này mở rộng.

---

## 2. Vai trò

| Role | Scope | Mô tả |
|---|---|---|
| Super Admin | System | Quản trị nền tảng, dùng khi thành SaaS |
| Owner | Family | Chủ gia phả, quyền cao nhất trong một family |
| Family Admin | Family hoặc Branch | Admin gia đình nhỏ, quản lý dữ liệu theo phạm vi được cấp |
| Branch Manager | Branch | Trưởng chi/phái, quản lý/duyệt dữ liệu chi mình |
| Editor | Family hoặc Branch | Nhập/sửa dữ liệu theo quyền |
| Member | Family | Thành viên đã xác minh, xem và có thể đề xuất sửa |
| Viewer | Family hoặc Branch | Chỉ xem dữ liệu được cấp |
| Guest/Public | None/Public | Level 1 không xem được dữ liệu |

---

## 3. Permission matrix Level 1

| Hành động | Owner | Family Admin | Branch Manager | Editor | Member | Viewer | Guest |
|---|---:|---:|---:|---:|---:|---:|---:|
| Xem family | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ |
| Xem cây | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ |
| Xem người đã mất | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ |
| Xem dữ liệu nhạy cảm người còn sống | ✅ | ✅ | Theo quyền | Theo quyền | Theo quyền | ❌ | ❌ |
| Thêm người | ✅ | ✅ | Trong branch | ✅ nếu được cấp | ❌/đề xuất | ❌ | ❌ |
| Sửa hồ sơ người | ✅ | ✅ | Trong branch | ✅ nếu được cấp | Đề xuất | ❌ | ❌ |
| Archive người | ✅ | ✅ hạn chế | ❌ | ❌ | ❌ | ❌ | ❌ |
| Thêm/sửa quan hệ | ✅ | ✅ | Trong branch | ✅ nếu được cấp | Đề xuất | ❌ | ❌ |
| Upload media | ✅ | ✅ | Trong branch | ✅ nếu được cấp | Có thể đề xuất | ❌ | ❌ |
| Tải file nhạy cảm | ✅ | ✅ | Theo quyền | Theo quyền | Theo quyền | ❌ | ❌ |
| Mời thành viên | ✅ | ✅ | Đề xuất mời | ❌ | Có thể gửi yêu cầu mời | ❌ | ❌ |
| Duyệt thành viên | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Duyệt đề xuất sửa | ✅ | ✅ | Trong branch | ❌ | ❌ | ❌ | ❌ |
| Xuất dữ liệu | ✅ | ✅ nếu được cấp | ❌/theo quyền | ❌ | ❌ | ❌ | ❌ |
| Xem audit log | ✅ | ✅ | Trong branch nếu cần | ❌ | ❌ | ❌ | ❌ |
| Đổi cấu hình privacy | ✅ | ✅ hạn chế | ❌ | ❌ | ❌ | ❌ | ❌ |

---

## 4. Data groups

| Data group | Ví dụ | Mặc định Level 1 |
|---|---|---|
| BASIC_PROFILE | tên, giới tính, đời, chi, năm sinh/năm mất rút gọn | Member/Viewer xem được nếu đăng nhập |
| LIFE_DATES_FULL | ngày sinh/mất đầy đủ, ngày giỗ | Theo quyền |
| CONTACT_INFO | số điện thoại, email, địa chỉ hiện tại | Admin/Owner hoặc quyền riêng |
| LIVING_PERSON_PRIVATE | ảnh, tên con nhỏ, tiểu sử người còn sống | Mask mặc định nếu không đủ quyền |
| MEDIA_PUBLIC_WITHIN_FAMILY | ảnh gia đình được phép xem nội bộ | Member theo quyền |
| MEDIA_SENSITIVE | giấy tờ, tài liệu cá nhân, file scan nhạy cảm | Admin/Owner/theo quyền |
| PRIVATE_NOTES | ghi chú riêng tư, tranh chấp | Admin/Owner |
| SOURCES | nguồn chứng cứ | Member xem một phần, Admin xem đầy đủ |
| AUDIT_SECURITY | audit log, security log | Owner/Admin |

---

## 5. Chính sách khách chưa đăng nhập

Level 1:

```text
Guest/Public không xem được gì ngoài màn hình đăng nhập/giới thiệu tối giản.
```

Không có public tree. Không có public profile. Không cho Google index dữ liệu gia phả.

---

## 6. Chính sách người còn sống

Mỗi `family` có setting:

```text
living_person_privacy_policy:
  STRICT
  FAMILY_MEMBERS
  CUSTOM
```

Đề xuất mặc định:

- Level 1: `STRICT` hoặc `CUSTOM`, nhưng nếu chưa cấu hình thì xử lý như `STRICT`.
- Khách: không xem.
- Viewer: không xem dữ liệu nhạy cảm người còn sống.
- Member: xem theo quyền được cấp.
- Admin/Owner: xem đầy đủ.

Dữ liệu nên mask:

- Ngày sinh đầy đủ.
- Địa chỉ.
- Số điện thoại.
- Email.
- Ảnh.
- Tên con nhỏ.
- Tiểu sử.

---

## 7. Invite model

### 7.1. Trạng thái invite

```text
pending
accepted
expired
revoked
```

### 7.2. Invite chứa

```text
family_id
role
branch_id optional
invited_email optional
invited_phone optional
token_hash
expires_at
created_by
accepted_by
```

### 7.3. Quy tắc

- Token phải được hash trong database, không lưu plaintext.
- Token có hạn sử dụng.
- Khi accept, tạo hoặc liên kết user.
- Member có thể yêu cầu mời người khác, nhưng Owner/Admin duyệt.

---

## 8. Helper functions cần có trong code

```ts
requireAuth()
getCurrentUser()
getMembership(userId, familyId)
requireFamilyAccess(userId, familyId)
canViewPerson(user, person, dataGroup)
canEditPerson(user, person)
canManageBranch(user, branchId)
canUploadMedia(user, familyId, targetEntity)
canDownloadMedia(user, mediaAsset)
canExportFamily(user, familyId)
maskPersonForViewer(person, viewerContext)
```

---

## 9. Lỗi cần tránh

- Kiểm tra role ở frontend nhưng backend không kiểm tra.
- Dùng `isAdmin` boolean thay vì role/scope rõ ràng.
- Tạo signed URL file trước khi kiểm quyền.
- Cho Viewer/Member thấy full object rồi mới ẩn ở UI.
- Để Guest gọi API search và suy ra dữ liệu.
- Không log thao tác export/tải file nhạy cảm.
