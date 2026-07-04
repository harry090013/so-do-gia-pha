# 04 — Business Flows

## 1. Flow tạo gia phả ban đầu

### Mục tiêu

Owner tạo một family rỗng rồi nhập người đầu tiên/root person.

### Luồng

1. User đăng nhập.
2. Nếu chưa có family, hiển thị onboarding.
3. User nhập:
   - Tên gia phả.
   - Slug.
   - Mô tả.
   - Chính sách privacy mặc định.
4. Hệ thống tạo `families`.
5. Hệ thống tạo membership Owner.
6. User chọn cách bắt đầu:
   - Từ ông/bà cố/root ancestor.
   - Từ bản thân rồi thêm ngược lên.
   - Tạo family rỗng.
7. User tạo root person.
8. Redirect đến tree/dashboard.

### Acceptance

- Family có owner.
- Root person có `family_id`.
- Audit log ghi family/person created.

---

## 2. Flow thêm người từ sơ đồ

### Mục tiêu

Admin bấm vào người A trên cây và thêm cha/mẹ/vợ/chồng/con.

### Luồng

1. User mở tree.
2. Click node người A.
3. Panel bên phải mở.
4. Nếu có quyền, hiện menu:
   - Thêm cha.
   - Thêm mẹ.
   - Thêm vợ/chồng.
   - Thêm con.
   - Thêm anh/chị/em nếu đủ dữ liệu cha/mẹ.
5. User chọn loại quan hệ.
6. Form nhập người mới tối thiểu:
   - Tên hiển thị.
   - Giới tính optional.
   - Trạng thái sống/mất optional.
   - Thứ tự con nếu thêm con.
7. Backend tạo `people`.
8. Backend tạo quan hệ trong bảng phù hợp.
9. Backend chạy validation:
   - Không tự làm cha/mẹ.
   - Không tạo vòng lặp tổ tiên.
   - Cảnh báo ngày tháng vô lý nếu có.
10. Backend audit log.
11. Tree refresh hoặc append node.

### Acceptance

- Người mới xuất hiện đúng vị trí trên cây.
- Không tạo dữ liệu mồ côi nếu quan hệ tạo thất bại.
- Dùng transaction.

---

## 3. Flow thêm người từ danh sách

1. User vào `People List`.
2. Click `Thêm người`.
3. Nhập hồ sơ người.
4. Có thể chọn cha/mẹ/vợ/chồng/con từ autocomplete.
5. Save.
6. Hệ thống tạo person và relationship trong transaction.
7. Redirect sang profile hoặc tree.

---

## 4. Flow sửa hồ sơ cá nhân

1. User mở profile.
2. Click edit nếu có quyền.
3. Sửa theo tab:
   - Basic.
   - Names.
   - Biography.
   - Dates.
   - Contact/private.
   - Media.
4. Backend validate input.
5. Backend mask/permission check theo data group.
6. Save.
7. Audit log lưu before/after.

---

## 5. Flow upload ảnh/tài liệu

1. User mở profile hoặc media tab.
2. Click upload.
3. Client kiểm file type/size cơ bản.
4. Server xác thực quyền upload.
5. Server tạo upload target/signed upload hoặc nhận file.
6. File lưu vào private storage.
7. DB tạo `media_assets`.
8. DB tạo `media_links` đến person/event/source/grave.
9. Nếu là avatar, update `people.profile_photo_media_id`.
10. Audit log.

### Quy tắc

- Không upload vào public bucket.
- Không cho executable/script.
- Video/audio cần size cap.
- Tài liệu nhạy cảm cần visibility `sensitive`.

---

## 6. Flow xem file private

1. User click file.
2. Backend kiểm quyền `canDownloadMedia`.
3. Nếu được phép, trả signed URL ngắn hạn.
4. Ghi security log nếu file nhạy cảm.
5. Nếu không, trả 403.

---

## 7. Flow mời thành viên

1. Owner/Admin vào Members.
2. Nhập email/phone hoặc tạo link mời.
3. Chọn role và branch scope.
4. Hệ thống tạo `invites` với token hash.
5. User nhận link.
6. User đăng nhập/verify OTP.
7. Hệ thống accept invite và tạo membership.
8. Owner/Admin thấy thành viên mới.

---

## 8. Flow đề xuất chỉnh sửa

Level 2 trở lên, nhưng schema nên chuẩn bị.

1. Member mở profile.
2. Click `Đề xuất sửa`.
3. Nhập thay đổi đề xuất.
4. Hệ thống tạo `change_requests`.
5. Admin/Branch Manager nhận thông báo.
6. Người duyệt xem diff.
7. Chọn approve/reject/dispute.
8. Nếu approve, hệ thống apply change trong transaction.
9. Audit log.

---

## 9. Flow xử lý tranh chấp thông tin

1. Một thông tin bị phản đối.
2. Admin đánh dấu `disputed` hoặc tạo source/citation khác.
3. Dữ liệu hiển thị một giá trị chính nhưng có ghi chú tranh chấp.
4. Sau này có thể lưu nhiều giả thuyết.

Level 1 theo yêu cầu hiện tại: Admin chọn một bản đúng. Tuy nhiên nên giữ schema `certainty_level` và `note` để không mất dấu nguồn mâu thuẫn.

---

## 10. Flow export dữ liệu

1. User chọn export.
2. Backend kiểm `canExportFamily`.
3. Ghi security log.
4. Tạo export job.
5. Generate file Excel/PDF/image.
6. Lưu vào private storage.
7. Trả signed URL.
8. Watermark nếu cần.

---

## 11. Flow backup/restore

1. Cron/job chạy hằng ngày.
2. Dump PostgreSQL.
3. Backup storage metadata và file.
4. Nén/mã hóa nếu production.
5. Lưu bản backup ngoài server chính.
6. Ghi log kết quả backup.
7. Restore drill định kỳ.

---

## 12. Flow kiểm tra dữ liệu vô lý

Trigger khi tạo/sửa người hoặc quan hệ:

- Người là cha/mẹ của chính mình.
- Vòng lặp tổ tiên.
- Con sinh trước cha/mẹ.
- Người kết hôn sau ngày mất.
- Người sinh sau ngày mất.
- Trùng tên/ngày sinh nghi vấn.

Kết quả:

- Lỗi nghiêm trọng: chặn save.
- Lỗi có thể là dữ liệu lịch sử thiếu/chưa rõ: cảnh báo, cho admin xác nhận.
