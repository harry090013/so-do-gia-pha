# 12 — Risks & Open Questions

## 1. Rủi ro lớn nhất

| Rủi ro | Mức độ | Lý do | Giảm thiểu |
|---|---|---|---|
| Lạc database lần nữa | Cao | Gia phả không phải cây đơn giản | Schema relationship-first, family_id, audit, privacy từ đầu |
| Phình scope Level 1 | Cao | Level 1 đang gồm nhiều feature | Chia sprint, cắt export/notification nếu cần |
| Lộ dữ liệu người còn sống | Cao | Dữ liệu rất nhạy cảm | Invite-only, server-side privacy masking, logs |
| Mất dữ liệu | Cao | Dữ liệu gia phả có giá trị dài hạn | Backup hằng ngày + restore test |
| Phone OTP vượt ngân sách | Trung bình/Cao | SMS thường tốn phí | AuthAdapter, dev fallback email/fake OTP |
| 49GB storage vượt free tier | Cao | Ảnh/video/audio nặng | Quota, nén ảnh, object storage riêng, cắt video/audio nếu cần |
| Data residency Việt Nam | Cao | Vercel/Supabase có thể không lưu tại VN | VPS/managed service tại Việt Nam cho production |
| Cây lớn bị chậm | Trung bình | Tương lai 500–1.000 người | Lazy loading, branch filter, depth limit |
| Tranh chấp thông tin | Trung bình | Gia phả có nhiều nguồn mâu thuẫn | Source/certainty/change request/audit |
| Người dùng lớn tuổi khó dùng | Trung bình | UI phức tạp | Form step-by-step, chữ lớn, ít thao tác |

---

## 2. Mâu thuẫn/yêu cầu cần xử lý

### 2.1. “Chỉ mình tôi đăng nhập” và “ai có link mời đều được”

Cách hiểu hợp lý:

- Ban đầu chỉ Owner dùng.
- Sau đó Owner/Admin mời người khác bằng link.
- Không mở public signup.

### 2.2. “User không thuộc nhiều gia phả” nhưng sau này muốn nhiều gia tộc tự đăng ký

Cách xử lý:

- Schema vẫn dùng `memberships` để hỗ trợ nhiều family.
- UI Level 1 giới hạn một family active cho user.
- Không hard-code giới hạn vào database.

### 2.3. “Admin chọn một bản đúng” khi có mâu thuẫn nguồn

Đây là cách đơn giản nhưng có nguy cơ mất dấu lịch sử. Đề xuất:

- UI Level 1: admin chọn một giá trị chính.
- DB vẫn lưu `certainty_level`, `note`, `source_citations` để giữ dấu nguồn khác.

### 2.4. “Dữ liệu ở Việt Nam” và “dùng Supabase/Vercel”

Cần quyết định trước khi nhập dữ liệu thật nhạy cảm:

- Dùng Supabase/Vercel cho demo.
- Chuyển sang VPS Việt Nam cho production nếu bắt buộc data residency.

### 2.5. “49GB Level 1” và “gần như miễn phí”

49GB file upload có thể vượt free tier. Cần:

- Giới hạn file size.
- Nén ảnh.
- Trì hoãn video/audio nếu cần.
- Đưa quota vào settings.

---

## 3. Open questions cần chốt sau

### Product

1. Tên sản phẩm/tên miền mong muốn là gì?
2. Có cần branding riêng cho từng gia tộc không?
3. Khách public sau này có được xem người đã mất không?
4. Sách gia phả cần format theo mẫu truyền thống nào?

### Data

1. Root ancestor Level 1 là ai?
2. Đời thứ theo gia phả giấy bắt đầu từ mấy?
3. Chi/phái hiện tại đã có danh sách chưa?
4. Quy tắc gán branch theo cha, founder hay admin chọn thủ công?
5. Có dữ liệu ngày âm cụ thể cần chuyển sang dương không?

### Security

1. Phone OTP dùng provider nào?
2. Có cần whitelist số điện thoại được mời không?
3. Thành viên đã xác minh có xem được ảnh người còn sống không?
4. Người còn sống có quyền tự yêu cầu ẩn thông tin không?

### Infrastructure

1. Dữ liệu đặt tại Việt Nam là yêu cầu cứng hay mong muốn?
2. VPS Việt Nam provider nào?
3. Ai chịu trách nhiệm vận hành server?
4. Backup lưu ở đâu ngoài server chính?
5. Có chấp nhận dùng Supabase Singapore cho pilot không?

### Legal/Trust

1. Có cần điều khoản sử dụng/chính sách riêng tư không?
2. Ai có quyền quyết định dữ liệu tranh chấp?
3. Quy trình xóa dữ liệu khi thành viên yêu cầu?
4. Nếu gia tộc ngừng dùng, retention bao lâu?

---

## 4. Những điều không nên bỏ qua

- Dữ liệu gia phả có thể gây tranh cãi trong gia đình/dòng họ.
- Người lớn tuổi có thể không dùng được UI phức tạp.
- Thông tin người còn sống là dữ liệu nhạy cảm, không nên để mặc định lộ cho mọi thành viên.
- Backup storage cũng quan trọng như backup database.
- Export dữ liệu có thể là rủi ro lộ thông tin lớn.
- Cây đẹp không cứu được database sai.

---

## 5. Quyết định đề xuất hiện tại

| Vấn đề | Quyết định đề xuất |
|---|---|
| MVP stack | Next.js + PostgreSQL + Tailwind |
| Hạ tầng demo | Vercel + Supabase |
| Hạ tầng chính thức nếu data VN bắt buộc | VPS Việt Nam + Docker + PostgreSQL + object storage |
| Auth | AuthAdapter, production hướng phone OTP, dev fallback email/fake OTP |
| Public access | Tắt Level 1 |
| User nhiều family | Schema hỗ trợ, UI Level 1 giới hạn |
| Source/citation | Schema có, UI Level 1 đơn giản |
| Export | Có log + watermark khi triển khai |
| Media | Private storage, no public bucket |
