# 14 — Data Validation Rules

## 1. Mục tiêu

Dữ liệu gia phả dễ bị loạn nếu không kiểm tra từ đầu. Tài liệu này quy định các rule tối thiểu để chặn lỗi nghiêm trọng và cảnh báo lỗi có thể chấp nhận được.

---

## 2. Phân loại validation

| Loại | Hành vi |
|---|---|
| Hard error | Chặn lưu |
| Soft warning | Cảnh báo, admin có thể xác nhận |
| Data quality flag | Lưu được nhưng đưa vào dashboard thiếu/sai dữ liệu |

---

## 3. Person validation

### 3.1. Required fields

Hard error:

- `primary_name` rỗng.
- `family_id` rỗng.

### 3.2. Date validation

Hard error:

- `birth_date_value` sau `death_date_value` nếu cả hai exact.
- `birth_year` sau `death_year` nếu cả hai có.

Soft warning:

- Người có `life_status = living` nhưng có death date.
- Người có `life_status = deceased` nhưng không có death date.
- Ngày sinh/mất trong tương lai.
- Ngày âm lịch thiếu ngày hoặc tháng.

Data quality flag:

- Thiếu ngày sinh.
- Thiếu ngày mất với người deceased.
- Thiếu giới tính.
- Thiếu ảnh.
- Thiếu nguồn xác minh.

---

## 4. Parent-child validation

### 4.1. Hard errors

- `parent_id == child_id`.
- Parent và child không cùng `family_id`.
- Tạo vòng lặp tổ tiên.
- Tạo confirmed biological father thứ 2 cho cùng child.
- Tạo confirmed biological mother thứ 2 cho cùng child.
- Parent hoặc child đã archived.

### 4.2. Soft warnings

- Con sinh trước cha/mẹ nếu ngày/năm đủ rõ.
- Cha/mẹ sinh con khi tuổi quá nhỏ hoặc quá lớn.
- Parent đã mất trước khi child sinh quá lâu.
- Child order trùng với anh/chị/em khác.
- Parent_role không khớp gender nếu gender known, ví dụ father nhưng gender female.

### 4.3. Age thresholds đề xuất

Không nên hard-code như luật tuyệt đối, vì dữ liệu lịch sử có thể thiếu/chưa chính xác. Dùng warning.

| Rule | Warning threshold |
|---|---|
| Mẹ sinh con dưới 12 tuổi | warning |
| Mẹ sinh con trên 60 tuổi | warning |
| Cha sinh con dưới 12 tuổi | warning |
| Cha sinh con trên 90 tuổi | warning |

---

## 5. Cycle detection

Khi thêm `parent_id -> child_id`, cần kiểm tra child có phải tổ tiên của parent không.

Pseudo:

```ts
async function wouldCreateCycle(parentId, childId) {
  if (parentId === childId) return true
  const ancestorsOfParent = await getAncestors(parentId)
  return ancestorsOfParent.includes(childId)
}
```

PostgreSQL có thể dùng recursive CTE. App code cũng cần timeout/depth limit để tránh query quá sâu nếu data lỗi.

---

## 6. Partnership validation

### 6.1. Hard errors

- `person1_id == person2_id`.
- Hai người không cùng `family_id`.
- Một trong hai người archived.
- Duplicate active partnership cùng cặp nếu không có lý do rõ.

### 6.2. Soft warnings

- Kết hôn sau ngày mất của một người.
- Kết hôn trước ngày sinh.
- Tuổi kết hôn quá nhỏ.
- Partnership status active nhưng một người đã mất và status chưa cập nhật widowed.

---

## 7. Branch validation

Hard error:

- Branch không cùng family với founder.
- Branch tự làm parent branch của chính nó.
- Cycle trong branch tree.
- Duplicate slug trong family.

Soft warning:

- Branch không có founder.
- Người thuộc branch nhưng không liên quan đến founder theo cây quan hệ.

---

## 8. Media validation

Hard error:

- File size vượt cap.
- MIME type không nằm trong whitelist.
- Target entity không cùng family.
- User không có quyền upload vào target.

Soft warning:

- File quá lớn nên nén.
- Duplicate checksum trong cùng family.
- File nhạy cảm nhưng visibility quá rộng.

---

## 9. Privacy validation

Hard error:

- Guest gọi API private.
- Viewer tải media sensitive.
- API tree/profile trả dữ liệu unmasked cho người không đủ quyền.

Soft warning:

- Người còn sống có phone/email/address nhưng privacy level normal.
- Family bật public access nhưng living policy không strict.

---

## 10. Duplicate detection

Level 1 chỉ cần cảnh báo trùng tên/ngày sinh.

Candidate duplicate nếu:

- Tên giống/near-similar.
- Cùng birth_year hoặc birth_date.
- Cùng cha/mẹ.
- Cùng spouse.

Không tự động merge ở Level 1. Chỉ cảnh báo.

---

## 11. Data quality dashboard flags

Các flag nên có:

```text
missing_birth_date
missing_death_date
missing_parents
missing_photo
missing_branch
missing_generation
missing_source
possible_duplicate
date_conflict
relationship_conflict
privacy_risk
```

---

## 12. Validation implementation location

```text
lib/validators/person.ts
lib/validators/relationships.ts
lib/validators/partnerships.ts
lib/validators/branches.ts
lib/validators/media.ts
lib/validators/privacy.ts
```

Mọi API mutation gọi validator trước khi ghi DB.
