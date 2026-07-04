# 07 — Security & Privacy

## 1. Mục tiêu bảo mật

Website chứa dữ liệu gia đình nhạy cảm, bao gồm người còn sống, ảnh trẻ em, thông tin liên hệ, tài liệu cá nhân, vị trí mộ phần và tranh chấp nội bộ. Vì vậy bảo mật không phải tính năng phụ mà là yêu cầu nền tảng.

---

## 2. Security baseline Level 1

| Yêu cầu | Chính sách |
|---|---|
| Public access | Tắt. Guest không xem được dữ liệu |
| Login | Invite-only |
| Search engine | Chặn index |
| Người còn sống | Mask dữ liệu theo quyền |
| File upload | Private storage |
| Download file | Signed URL ngắn hạn |
| Export | Chỉ Owner/Admin, ghi log, watermark nếu cần |
| Delete | Soft delete/archive |
| Audit | Ghi log mọi mutation quan trọng |
| Backup | Hằng ngày |

---

## 3. Threat model tối thiểu

| Mối đe dọa | Ví dụ | Giảm thiểu |
|---|---|---|
| Guest xem dữ liệu | API search trả dữ liệu không cần auth | Auth middleware toàn API |
| Thành viên xem quá quyền | Member xem phone/email người còn sống | Permission + privacy masking server-side |
| Link file bị lộ | Public URL tài liệu | Private bucket + signed URL expiry |
| Sửa sai dữ liệu | Editor sửa tổ tiên | Role/scope + audit + change request |
| Xóa dữ liệu | Admin nhầm xóa người | Soft delete + audit + restore sau này |
| Mất dữ liệu | Server hỏng | Backup DB + storage + restore drill |
| Token invite bị leak | Người ngoài vào | Token expiry + revoke + role thấp mặc định |
| SMS OTP abuse | Spam OTP | Rate limit + CAPTCHA sau này + provider quota |
| Search engine index | Google index tên/ảnh | noindex + robots + auth wall |
| Export lộ dữ liệu | Member export toàn gia phả | Export permission + security log + watermark |

---

## 4. Auth policy

### 4.1. Desired production login

- Số điện thoại + mã OTP.
- Sau này có 2FA.

### 4.2. Thực tế MVP

Phone OTP có thể phát sinh chi phí SMS và phụ thuộc provider. Vì vậy code nên có abstraction:

```ts
interface AuthAdapter {
  sendOtp(destination: string): Promise<void>
  verifyOtp(destination: string, code: string): Promise<AuthUser>
}
```

Môi trường:

| Env | Auth mode |
|---|---|
| local | fake OTP hoặc email OTP |
| staging/demo | email OTP hoặc phone OTP nếu có provider |
| production | phone OTP nếu đã cấu hình SMS provider |

---

## 5. Invite security

- Token phải dài, random, không đoán được.
- DB chỉ lưu `token_hash`, không lưu token plaintext.
- Invite có hạn sử dụng.
- Invite có thể revoke.
- Invite chỉ cấp role thấp/trung bình mặc định, Owner/Admin duyệt role cao.
- Khi accept invite, ghi security log.

---

## 6. Authorization policy

Mọi API phải đi qua:

1. Auth check.
2. Family membership check.
3. Role/scope check.
4. Data-group privacy check.
5. Entity family consistency check.

Ví dụ:

```ts
const user = await requireAuth()
const membership = await requireFamilyAccess(user.id, familyId)
assertCanEditPerson(membership, person)
```

---

## 7. Privacy masking người còn sống

### 7.1. Dữ liệu cần mask

- Ngày sinh đầy đủ.
- Địa chỉ.
- Số điện thoại.
- Email.
- Ảnh.
- Tên con nhỏ.
- Tiểu sử.
- Ghi chú riêng tư.

### 7.2. Mask ở server, không chỉ ở UI

Sai:

```text
API trả toàn bộ dữ liệu, frontend tự ẩn.
```

Đúng:

```text
API trả dữ liệu đã mask theo viewer.
```

### 7.3. Response mẫu

```json
{
  "id": "person_123",
  "primaryName": "Nguyễn Văn A",
  "lifeStatus": "living",
  "birthYear": 1985,
  "birthDate": null,
  "phone": null,
  "email": null,
  "avatarUrl": null,
  "privacyMasked": true
}
```

---

## 8. File security

### 8.1. Bucket policy

- Avatar có thể là `restricted/family`, không public nếu person sống.
- Tài liệu cá nhân luôn `sensitive/private`.
- File scan giấy tờ không public.
- Signed URL ngắn hạn, ví dụ 5–15 phút.

### 8.2. MIME whitelist

Level 1 cho phép:

```text
image/jpeg
image/png
image/webp
application/pdf
application/msword
application/vnd.openxmlformats-officedocument.wordprocessingml.document
application/vnd.ms-excel
application/vnd.openxmlformats-officedocument.spreadsheetml.sheet
video/mp4
audio/mpeg
audio/mp4
audio/wav
```

Không cho:

```text
application/x-msdownload
application/x-sh
text/html
image/svg+xml nếu chưa sanitize
application/javascript
```

### 8.3. Size cap đề xuất

| File type | Max Level 1 đề xuất |
|---|---:|
| Avatar | 5 MB |
| Ảnh thường | 15 MB |
| PDF/Word/Excel | 50 MB |
| Audio | 100 MB |
| Video | 300 MB hoặc tạm disable nếu storage hạn chế |

Quota 49GB là target product, không nên mặc định upload không giới hạn.

---

## 9. Audit log policy

Ghi audit log cho:

- Tạo/sửa/archive person.
- Tạo/sửa/archive relationship.
- Tạo/sửa/archive partnership.
- Upload/archive media.
- Đổi vai trò.
- Invite/accept/revoke.
- Export.
- Approve/reject change request.

### Không ghi vào audit log

- Password/OTP/token plaintext.
- File binary.
- Dữ liệu quá lớn không cần thiết.

---

## 10. Security log policy

Ghi security log cho:

- Login/logout.
- Login failed nếu có.
- Xem dữ liệu nhạy cảm nếu triển khai.
- Tải file nhạy cảm.
- Export dữ liệu.
- Thay đổi quyền.

---

## 11. Noindex policy

Level 1 cần:

- `<meta name="robots" content="noindex,nofollow" />` trên app private.
- `robots.txt` chặn crawling.
- Không có public sitemap chứa profile/cây.
- Route private cần auth wall, không chỉ noindex.

---

## 12. Backup & restore security

- Backup database hằng ngày.
- Backup storage hoặc ít nhất metadata + file object sync.
- Backup nên mã hóa nếu lưu ngoài server.
- Tối thiểu giữ 7 bản hằng ngày.
- Có hướng restore bằng script.
- Không chỉ backup code; dữ liệu mới là tài sản chính.

---

## 13. Deletion policy

Theo yêu cầu hiện tại:

- Thành viên yêu cầu xóa: admin xử lý thủ công.
- Gia tộc ngừng dùng: cho export trước rồi xóa thủ công.
- Trong app: archive/soft delete, không hard delete.

Production/SaaS sau này cần quy trình xóa dữ liệu rõ hơn.

---

## 14. Security checklist trước khi publish

- [ ] Tất cả route private yêu cầu auth.
- [ ] Tất cả API kiểm `family_id` và membership.
- [ ] Không có public storage bucket chứa dữ liệu nhạy cảm.
- [ ] Signed URL có expiry.
- [ ] Guest không gọi được API search/tree/profile.
- [ ] Người còn sống bị mask đúng.
- [ ] Audit log chạy.
- [ ] Security log export/download chạy.
- [ ] robots/noindex đã bật.
- [ ] Env secrets không commit.
- [ ] Backup chạy thử.
- [ ] Restore test ít nhất một lần trước khi nhập dữ liệu thật.
