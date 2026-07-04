# 05 — Data Model Overview

## 1. Triết lý dữ liệu

Gia phả không phải là một cây đơn giản. Nó là một graph có hướng, trong đó node là người và edge là quan hệ. Ngoài quan hệ huyết thống còn có hôn nhân, con nuôi, con riêng, quan hệ chưa xác minh, nguồn chứng cứ, tài liệu, sự kiện, chi/phái, phân quyền và lịch sử chỉnh sửa.

---

## 2. Các entity lõi

| Entity | Vai trò |
|---|---|
| `families` | Một gia phả/dòng họ/tenant |
| `branches` | Chi, phái, nhánh trong một family |
| `people` | Hồ sơ người trong gia phả |
| `person_names` | Nhiều tên của một người: tên khai sinh, tên húy, tên hiệu... |
| `parent_child_relationships` | Quan hệ cha/mẹ/con |
| `partnerships` | Quan hệ vợ/chồng/hôn nhân/tái hôn |
| `events` | Sự kiện: sinh, mất, giỗ, an táng, học vấn, thành tựu... |
| `places` | Địa danh hiện tại/lịch sử |
| `media_assets` | File upload metadata |
| `media_links` | Liên kết file với người/sự kiện/nguồn/mộ phần |
| `sources` | Nguồn chứng cứ |
| `source_citations` | Nguồn gắn với field/entity cụ thể |
| `users` | Tài khoản đăng nhập |
| `memberships` | Vai trò user trong family |
| `invites` | Link mời thành viên |
| `change_requests` | Đề xuất chỉnh sửa |
| `audit_logs` | Lịch sử thay đổi |
| `security_logs` | Log truy cập/tải/export dữ liệu nhạy cảm |

---

## 3. Multi-family nhẹ từ đầu

Mặc dù Level 1 chỉ có một gia phả, database phải hỗ trợ nhiều gia phả.

Các bảng tenant-scoped cần có `family_id`:

```text
branches
people
person_names
parent_child_relationships
partnerships
events
places
media_assets
media_links
sources
source_citations
memberships
invites
change_requests
audit_logs
security_logs
```

Lưu ý: `users` có thể là global. `memberships` liên kết user với family.

---

## 4. User khác Person

### Sai

```text
users = people
```

### Đúng

```text
users
people
user_person_links
```

Ví dụ:

- Ông cố trong gia phả là `people`, không có tài khoản.
- Bạn là `user`, đồng thời có thể link với một `person` trong cây.
- Admin kỹ thuật có thể là `user` nhưng không nằm trong gia phả.

---

## 5. Mô hình quan hệ cha/mẹ/con

Không lưu `father_id`/`mother_id` trong `people` làm dữ liệu chính.

Dùng:

```text
parent_child_relationships
  parent_id
  child_id
  parent_role
  relationship_type
  child_order
  certainty_level
```

Ưu điểm:

- Hỗ trợ cha/mẹ ruột.
- Hỗ trợ cha/mẹ nuôi.
- Hỗ trợ mẹ kế/cha dượng.
- Hỗ trợ con riêng.
- Hỗ trợ quan hệ chưa xác minh.
- Hỗ trợ tranh chấp dữ liệu.

---

## 6. Mô hình vợ/chồng

Không lưu `spouse_id` trong `people`.

Dùng:

```text
partnerships
  person1_id
  person2_id
  partnership_type
  status
  start_date
  end_date
```

Ưu điểm:

- Nhiều vợ/chồng.
- Tái hôn.
- Ly hôn.
- Góa.
- Hôn nhân không rõ ngày.

---

## 7. Mô hình ngày tháng

Gia phả cần nhiều kiểu ngày:

- Ngày dương lịch chính xác.
- Ngày âm lịch.
- Chỉ biết năm.
- Biết khoảng năm.
- Không rõ, chỉ có ghi chú.

Vì vậy không nên chỉ dùng một cột `date` đơn giản cho mọi thứ.

### Đề xuất pattern

Cho những ngày quan trọng trong `people` và `events`, dùng nhóm field:

```text
date_value            -- date ISO nếu biết chính xác hoặc gần đúng
date_year             -- nếu chỉ biết năm
date_from_year        -- nếu khoảng năm
date_to_year          -- nếu khoảng năm
date_precision        -- exact, year_only, approximate, range, unknown
date_calendar         -- gregorian, lunar, unknown
date_text             -- text gốc user nhập, ví dụ "khoảng năm 1920", "12 tháng Giêng"
```

Level 1 có thể triển khai đơn giản hơn nhưng schema nên đủ mở rộng.

---

## 8. Đời thứ

Có hai nguồn đời thứ:

1. Tính tự động từ root ancestor.
2. Admin nhập tay theo gia phả giấy.

Đề xuất lưu:

```text
generation_calculated
generation_manual
generation_display
generation_source: calculated | manual | mixed
```

UI hiển thị `generation_display`. Backend có job/tác vụ tính lại khi quan hệ thay đổi.

---

## 9. Chi/phái/nhánh

Một branch có thể có branch cha, người sáng lập, tên, mô tả.

```text
branches
  family_id
  parent_branch_id
  founder_person_id
  name
  slug
```

Một người có `branch_id`, nhưng cũng cần hiểu rằng người kết hôn vào một chi có thể liên quan đến nhiều nhánh. Level 1 chưa cần phức tạp hóa, nhưng schema không nên cấm mở rộng.

---

## 10. Nguồn chứng cứ

Nguồn có reliability:

```text
confirmed
likely
unverified
disputed
```

Một nguồn có thể gắn với:

- Person.
- Relationship.
- Event.
- Field cụ thể như birth_date.
- Media/document.

Level 1 UI có thể chỉ lưu nguồn ở mức person/relationship, nhưng database nên có `source_citations` để mở rộng.

---

## 11. Audit log

Audit log cần lưu trước/sau bằng JSONB.

Không dùng audit log để render UI chính. Audit là hồ sơ thay đổi, không phải bảng dữ liệu nghiệp vụ.

---

## 12. Privacy masking

Database lưu đủ dữ liệu, nhưng API trả ra phải tùy viewer.

Ví dụ `maskPersonForViewer(person, viewerContext)`:

```json
{
  "id": "p1",
  "displayName": "Nguyễn Văn A",
  "isLiving": true,
  "birthDate": null,
  "birthYear": 1985,
  "phone": null,
  "email": null,
  "avatarUrl": null,
  "privacyMasked": true
}
```

---

## 13. Tree API model

Không trả một JSON tree lồng sâu làm data model chính. API tree nên trả graph:

```json
{
  "nodes": [
    { "id": "p1", "label": "Nguyễn Văn A", "generation": 1 }
  ],
  "edges": [
    { "from": "p1", "to": "p2", "type": "parent_child" }
  ],
  "meta": {
    "rootPersonId": "p1",
    "depth": 4,
    "direction": "descendants"
  }
}
```

---

## 14. Ràng buộc dữ liệu tối thiểu

- `parent_id != child_id`.
- `person1_id != person2_id` trong partnership.
- Không tạo vòng lặp tổ tiên.
- Một child không nên có nhiều biological father confirmed active.
- Một child không nên có nhiều biological mother confirmed active.
- Archive thay vì delete.
- Mọi entity tenant-scoped phải kiểm `family_id` nhất quán.
