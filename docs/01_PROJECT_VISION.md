# 01 — Project Vision

## 1. Mục tiêu sản phẩm

Website Gia Phả được xây dựng để số hóa, bảo tồn và mở rộng dữ liệu gia đình/dòng họ. Giai đoạn đầu phục vụ một gia đình 4 thế hệ. Giai đoạn sau mở rộng thành hệ thống cho gia tộc nhiều chi/phái, nhiều nhánh, nhiều người cùng đóng góp và quản trị.

---

## 2. Động lực xây dựng

Các lý do chính:

- Giữ lại thông tin gia đình cho thế hệ sau.
- Dễ tra cứu quan hệ họ hàng.
- Quản lý ngày giỗ, mộ phần.
- Số hóa gia phả giấy.
- Cho mọi người trong họ cùng đóng góp.
- Tương lai có thể phát triển thành sản phẩm/dịch vụ số hóa gia phả.

---

## 3. Định vị sản phẩm

Sản phẩm cuối cùng không chỉ là “website vẽ cây gia phả”. Định vị đúng hơn là:

> Hệ thống quản lý dữ liệu gia phả, tài liệu lịch sử gia đình, ngày giỗ, mộ phần và cộng tác nội bộ dòng họ.

Các lớp giá trị:

1. **Sơ đồ gia phả:** giúp nhìn thấy quan hệ.
2. **Hồ sơ cá nhân:** lưu đời sống, sự kiện, thành tựu, ảnh, tài liệu.
3. **Kho tư liệu:** gia phả giấy, ảnh, file scan, bia mộ, lời kể.
4. **Cộng tác gia đình:** thành viên đề xuất, trưởng chi duyệt, admin kiểm soát.
5. **Bảo mật:** phân quyền, ẩn người còn sống, log truy cập.
6. **Mở rộng:** nhiều gia tộc, quota, billing, dịch vụ số hóa.

---

## 4. Người dùng mục tiêu

| Nhóm | Nhu cầu |
|---|---|
| Owner/Admin chính | Quản lý toàn bộ gia phả, phân quyền, kiểm soát dữ liệu |
| Admin gia đình nhỏ | Nhập/sửa dữ liệu nhánh nhỏ |
| Trưởng chi | Duyệt đề xuất, quản lý dữ liệu chi/phái |
| Thành viên gia đình | Xem cây, xem hồ sơ, gửi đề xuất sửa |
| Người lớn tuổi | Xem thông tin đơn giản, chữ rõ, thao tác ít |
| Con cháu trẻ | Tra cứu quan hệ, tìm người, xem ảnh/tư liệu |
| Người nghiên cứu gia phả | Xem nguồn, tài liệu, địa danh, mộ phần |

---

## 5. Thành công của Level 1

Level 1 thành công khi:

- Nhập được gia đình 4 thế hệ dưới 100 người.
- Mỗi hồ sơ cá nhân có thể lưu đủ thông tin cơ bản, ảnh, tiểu sử, thành tựu, tài liệu.
- Xem được cây gia phả đẹp và dễ hiểu.
- Thành viên đăng nhập xem được theo quyền.
- Admin thêm/sửa được người và quan hệ.
- Có thể chia sẻ link mời cho người thân.
- Không lộ dữ liệu người còn sống.
- Có nền database đủ chắc để mở rộng lên nhiều chi/phái.

---

## 6. Nguyên tắc thiết kế sản phẩm

### 6.1. Đơn giản cho người dùng, chặt chẽ ở dữ liệu

Người dùng lớn tuổi không cần nhìn thấy sự phức tạp của database. Form nhập liệu có thể đơn giản, nhưng backend phải lưu được dữ liệu phức tạp: nhiều tên, nhiều loại quan hệ, ngày âm/dương, nguồn chứng cứ, độ tin cậy.

### 6.2. Nhập thiếu vẫn phải dùng được

Gia phả thực tế thường thiếu ngày sinh, ngày mất, tên đầy đủ hoặc nguồn xác minh. Hệ thống không được bắt buộc quá nhiều trường. Trường bắt buộc tối thiểu nên là tên hoặc nhãn hiển thị.

### 6.3. Dữ liệu người còn sống cần bảo vệ mặc định

Thông tin như ngày sinh đầy đủ, số điện thoại, email, địa chỉ, ảnh, tên con nhỏ, tiểu sử không được hiển thị cho người không có quyền.

### 6.4. Có thể mở rộng nhưng không overbuild

Không cần làm billing/GEDCOM/OCR/mobile app ở Level 1, nhưng schema và kiến trúc không được chặn các hướng đó.

---

## 7. Không nằm trong scope Level 1

- Mạng xã hội đầy đủ.
- Bình luận/thảo luận realtime.
- GEDCOM import/export.
- OCR tài liệu cũ.
- Sách gia phả hoàn chỉnh.
- Billing/SaaS.
- App mobile native.
- Phân tích quan hệ nâng cao giữa hai người nếu chưa xong lõi.

---

## 8. Tầm nhìn 3–6 tháng đầu

Mục tiêu thực tế trong 3–6 tháng đầu nên là:

1. Có bản MVP nhập và xem được 4 thế hệ.
2. Gia đình thật dùng thử được.
3. Lấy phản hồi về UI cây và form nhập liệu.
4. Kiểm chứng mô hình phân quyền.
5. Kiểm chứng nhu cầu upload/tư liệu/ngày giỗ.
6. Chuẩn bị kế hoạch xin kinh phí từ gia tộc dựa trên bản demo thật.
