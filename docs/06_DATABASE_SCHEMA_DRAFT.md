# 06 — Database Schema Draft

> Bản này là schema draft để Antigravity triển khai migration đầu tiên. Có thể dùng Prisma/Drizzle/SQL, nhưng không được phá vỡ các quan hệ cốt lõi.

---

## 1. Naming conventions

- Table: snake_case plural.
- Primary key: `id` UUID.
- Tenant key: `family_id` UUID.
- Timestamps: `created_at`, `updated_at`.
- Soft delete/archive: `archived_at`, `archived_by` hoặc `status`.
- JSON: dùng `jsonb` nếu PostgreSQL.

---

## 2. Enums đề xuất

```text
user_status:
  active
  disabled
  pending

membership_role:
  owner
  family_admin
  branch_manager
  editor
  member
  viewer

membership_status:
  pending
  active
  suspended
  revoked

person_gender:
  male
  female
  other
  unknown

life_status:
  living
  deceased
  unknown

privacy_level:
  normal
  restricted
  sensitive
  private

name_type:
  primary
  birth_name
  common_name
  alias
  courtesy_name
  art_name
  taboo_name
  unknown

parent_role:
  father
  mother
  parent
  unknown

parent_child_type:
  biological
  adoptive
  step
  foster
  guardian
  ritual_heir
  unknown

partnership_type:
  marriage
  remarriage
  partner
  concubine
  unknown

partnership_status:
  active
  ended
  divorced
  widowed
  unknown

certainty_level:
  confirmed
  likely
  unverified
  disputed

date_precision:
  exact
  year_only
  approximate
  range
  unknown

date_calendar:
  gregorian
  lunar
  unknown

media_visibility:
  family
  branch
  restricted
  sensitive
  private

source_type:
  family_book
  oral_history
  tombstone
  birth_certificate
  death_certificate
  photo
  scan
  document
  gedcom_import
  other

audit_action:
  create
  update
  archive
  restore
  delete_request
  approve
  reject
  login
  logout
  export
  download
  role_change
```

---

## 3. Core tables

## 3.1. `users`

Tài khoản đăng nhập toàn hệ thống.

| Column | Type | Notes |
|---|---|---|
| id | uuid pk | Internal user id |
| auth_provider_user_id | text unique nullable | Supabase/Auth provider id |
| display_name | text | Tên hiển thị |
| email | text nullable unique | Dùng nếu login email/magic link |
| phone | text nullable unique | Dùng nếu login phone OTP |
| avatar_url | text nullable | Avatar tài khoản |
| status | user_status | active/disabled/pending |
| last_login_at | timestamptz nullable | Lần đăng nhập gần nhất |
| created_at | timestamptz |  |
| updated_at | timestamptz |  |

Indexes:

```text
unique(email) where email is not null
unique(phone) where phone is not null
unique(auth_provider_user_id) where auth_provider_user_id is not null
```

---

## 3.2. `families`

Một gia phả/dòng họ/tenant.

| Column | Type | Notes |
|---|---|---|
| id | uuid pk |  |
| name | text | Tên gia phả |
| slug | text unique | URL slug |
| description | text nullable |  |
| origin_place_id | uuid nullable | FK places |
| root_person_id | uuid nullable | Người gốc/ông tổ |
| visibility | text | private/invite_only/public_later |
| living_person_policy | text | strict/family_members/custom |
| default_locale | text | vi mặc định |
| timezone | text | Asia/Ho_Chi_Minh |
| storage_quota_bytes | bigint nullable | quota theo family |
| created_by_user_id | uuid fk users |  |
| created_at | timestamptz |  |
| updated_at | timestamptz |  |
| archived_at | timestamptz nullable |  |

---

## 3.3. `family_settings`

Có thể tách khỏi `families` để dễ mở rộng.

| Column | Type | Notes |
|---|---|---|
| family_id | uuid pk fk families |  |
| allow_public_access | boolean | false Level 1 |
| block_search_index | boolean | true Level 1 |
| require_invite | boolean | true |
| living_person_policy | text | strict/family_members/custom |
| enable_lunar_calendar | boolean | true |
| enable_email_notifications | boolean | false/true tùy cấu hình |
| enable_phone_otp | boolean | tùy SMS provider |
| custom_domain | text nullable | Level 4 |
| created_at | timestamptz |  |
| updated_at | timestamptz |  |

---

## 3.4. `branches`

Chi/phái/nhánh.

| Column | Type | Notes |
|---|---|---|
| id | uuid pk |  |
| family_id | uuid fk families |  |
| parent_branch_id | uuid nullable fk branches | Nhánh cha |
| founder_person_id | uuid nullable fk people | Người sáng lập nhánh |
| name | text | Tên chi/phái |
| slug | text | unique trong family |
| description | text nullable |  |
| sort_order | int |  |
| created_by_user_id | uuid fk users |  |
| created_at | timestamptz |  |
| updated_at | timestamptz |  |
| archived_at | timestamptz nullable |  |

Indexes:

```text
index(family_id)
unique(family_id, slug)
index(parent_branch_id)
```

---

## 3.5. `people`

Hồ sơ người trong cây gia phả.

| Column | Type | Notes |
|---|---|---|
| id | uuid pk |  |
| family_id | uuid fk families | required |
| branch_id | uuid nullable fk branches | chi/phái hiện tại |
| primary_name | text | tên hiển thị, bắt buộc |
| gender | person_gender | unknown allowed |
| life_status | life_status | living/deceased/unknown |
| is_living | boolean | denormalized for privacy |
| birth_date_value | date nullable | nếu biết chính xác/gần đúng |
| birth_year | int nullable | nếu chỉ biết năm |
| birth_date_precision | date_precision | exact/year_only/approx... |
| birth_date_calendar | date_calendar | gregorian/lunar/unknown |
| birth_date_text | text nullable | text gốc |
| death_date_value | date nullable |  |
| death_year | int nullable |  |
| death_date_precision | date_precision |  |
| death_date_calendar | date_calendar |  |
| death_date_text | text nullable |  |
| memorial_date_value | date nullable | ngày giỗ nếu dùng date |
| memorial_lunar_day | int nullable | 1-30 |
| memorial_lunar_month | int nullable | 1-12 |
| memorial_lunar_is_leap_month | boolean nullable |  |
| memorial_date_text | text nullable | text gốc |
| generation_calculated | int nullable | tính từ root |
| generation_manual | int nullable | admin nhập |
| generation_display | int nullable | dùng UI |
| generation_source | text | calculated/manual/mixed |
| biography_public | text nullable | tiểu sử công khai nội bộ |
| biography_private | text nullable | ghi chú/tiểu sử riêng tư |
| achievements | text nullable | thành tựu |
| occupation | text nullable | nghề nghiệp |
| education | text nullable | học vấn |
| hometown_place_id | uuid nullable fk places | quê quán |
| birth_place_id | uuid nullable fk places | nơi sinh |
| death_place_id | uuid nullable fk places | nơi mất |
| burial_place_id | uuid nullable fk places | nơi an táng |
| phone | text nullable | sensitive |
| email | text nullable | sensitive |
| current_address | text nullable | sensitive |
| profile_photo_media_id | uuid nullable fk media_assets | avatar |
| privacy_level | privacy_level | normal/restricted/sensitive/private |
| status | text | active/archived/merged |
| merged_into_person_id | uuid nullable fk people | nếu gộp trùng sau này |
| created_by_user_id | uuid fk users |  |
| updated_by_user_id | uuid nullable fk users |  |
| created_at | timestamptz |  |
| updated_at | timestamptz |  |
| archived_at | timestamptz nullable | soft delete |
| archived_by_user_id | uuid nullable fk users |  |

Indexes:

```text
index(family_id)
index(family_id, branch_id)
index(family_id, primary_name)
index(family_id, generation_display)
index(family_id, is_living)
index(family_id, birth_year)
index(family_id, death_year)
```

Notes:

- `is_living` có thể suy ra từ `life_status`, nhưng lưu denormalized để privacy check nhanh.
- Form Level 1 chỉ bắt buộc `primary_name`.

---

## 3.6. `person_names`

Nhiều tên của một người.

| Column | Type | Notes |
|---|---|---|
| id | uuid pk |  |
| family_id | uuid fk families |  |
| person_id | uuid fk people |  |
| name | text |  |
| name_type | name_type | primary/common/birth... |
| language | text nullable | vi/en/hán nôm sau này |
| is_primary | boolean |  |
| sort_order | int |  |
| note | text nullable |  |
| created_at | timestamptz |  |
| updated_at | timestamptz |  |

Indexes:

```text
index(family_id, person_id)
index(family_id, name)
```

---

## 3.7. `parent_child_relationships`

Quan hệ cha/mẹ/con.

| Column | Type | Notes |
|---|---|---|
| id | uuid pk |  |
| family_id | uuid fk families |  |
| parent_id | uuid fk people |  |
| child_id | uuid fk people |  |
| parent_role | parent_role | father/mother/parent/unknown |
| relationship_type | parent_child_type | biological/adoptive/step... |
| child_order | int nullable | thứ tự con |
| child_order_label | text nullable | con trưởng/con út nam... |
| certainty_level | certainty_level | confirmed/likely/unverified/disputed |
| source_id | uuid nullable fk sources |  |
| note | text nullable |  |
| status | text | active/archived |
| created_by_user_id | uuid fk users |  |
| created_at | timestamptz |  |
| updated_at | timestamptz |  |
| archived_at | timestamptz nullable |  |

Constraints:

```text
check(parent_id <> child_id)
index(family_id, parent_id)
index(family_id, child_id)
index(family_id, parent_id, child_id)
```

Recommended partial unique indexes:

```sql
-- Một cha ruột confirmed active cho một child
CREATE UNIQUE INDEX unique_confirmed_biological_father
ON parent_child_relationships (family_id, child_id)
WHERE parent_role = 'father'
  AND relationship_type = 'biological'
  AND certainty_level = 'confirmed'
  AND archived_at IS NULL;

-- Một mẹ ruột confirmed active cho một child
CREATE UNIQUE INDEX unique_confirmed_biological_mother
ON parent_child_relationships (family_id, child_id)
WHERE parent_role = 'mother'
  AND relationship_type = 'biological'
  AND certainty_level = 'confirmed'
  AND archived_at IS NULL;
```

---

## 3.8. `partnerships`

Quan hệ vợ/chồng/hôn nhân.

| Column | Type | Notes |
|---|---|---|
| id | uuid pk |  |
| family_id | uuid fk families |  |
| person1_id | uuid fk people |  |
| person2_id | uuid fk people |  |
| partnership_type | partnership_type | marriage/remarriage/partner... |
| status | partnership_status | active/divorced/widowed... |
| start_date_value | date nullable |  |
| start_year | int nullable |  |
| start_date_precision | date_precision |  |
| start_date_calendar | date_calendar |  |
| start_date_text | text nullable |  |
| end_date_value | date nullable |  |
| end_year | int nullable |  |
| end_date_precision | date_precision |  |
| end_date_calendar | date_calendar |  |
| end_date_text | text nullable |  |
| certainty_level | certainty_level |  |
| source_id | uuid nullable fk sources |  |
| note | text nullable |  |
| status_record | text | active/archived |
| created_by_user_id | uuid fk users |  |
| created_at | timestamptz |  |
| updated_at | timestamptz |  |
| archived_at | timestamptz nullable |  |

Constraints:

```text
check(person1_id <> person2_id)
index(family_id, person1_id)
index(family_id, person2_id)
```

Implementation note:

- Để tránh duplicate partnership A-B và B-A, code nên chuẩn hóa `person1_id < person2_id` theo UUID lexical hoặc dùng function canonical pair.

---

## 3.9. `events`

Sự kiện đời người/gia đình.

| Column | Type | Notes |
|---|---|---|
| id | uuid pk |  |
| family_id | uuid fk families |  |
| person_id | uuid nullable fk people | event của người |
| partnership_id | uuid nullable fk partnerships | event của hôn nhân |
| branch_id | uuid nullable fk branches | event của chi/phái |
| event_type | text | birth/death/burial/memorial/education/achievement... |
| title | text |  |
| description | text nullable |  |
| event_date_value | date nullable |  |
| event_year | int nullable |  |
| event_date_precision | date_precision |  |
| event_date_calendar | date_calendar |  |
| event_date_text | text nullable |  |
| place_id | uuid nullable fk places |  |
| privacy_level | privacy_level |  |
| source_id | uuid nullable fk sources |  |
| created_by_user_id | uuid fk users |  |
| created_at | timestamptz |  |
| updated_at | timestamptz |  |
| archived_at | timestamptz nullable |  |

---

## 3.10. `places`

Địa danh hiện tại/lịch sử.

| Column | Type | Notes |
|---|---|---|
| id | uuid pk |  |
| family_id | uuid nullable fk families | nullable nếu dùng place global sau này |
| parent_place_id | uuid nullable fk places | tỉnh/huyện/xã/làng |
| name | text | tên hiển thị |
| current_name | text nullable | tên hiện tại |
| historical_name | text nullable | tên cũ |
| place_type | text | country/province/district/commune/village/cemetery/other |
| address | text nullable |  |
| latitude | numeric nullable |  |
| longitude | numeric nullable |  |
| note | text nullable |  |
| created_at | timestamptz |  |
| updated_at | timestamptz |  |

---

## 3.11. `graves`

Thông tin mộ phần. Level 1 có thể chưa UI đầy đủ nhưng schema có thể chuẩn bị hoặc để Level 2.

| Column | Type | Notes |
|---|---|---|
| id | uuid pk |  |
| family_id | uuid fk families |  |
| person_id | uuid fk people |  |
| place_id | uuid nullable fk places |  |
| cemetery_name | text nullable |  |
| address | text nullable |  |
| latitude | numeric nullable |  |
| longitude | numeric nullable |  |
| google_maps_url | text nullable |  |
| caretaker_name | text nullable |  |
| caretaker_contact | text nullable | sensitive |
| reburial_note | text nullable | cải táng |
| note | text nullable |  |
| created_at | timestamptz |  |
| updated_at | timestamptz |  |
| archived_at | timestamptz nullable |  |

---

## 3.12. `media_assets`

Metadata file upload.

| Column | Type | Notes |
|---|---|---|
| id | uuid pk |  |
| family_id | uuid fk families |  |
| uploaded_by_user_id | uuid fk users |  |
| storage_provider | text | supabase/s3/minio/local |
| storage_bucket | text |  |
| storage_path | text | path private |
| original_file_name | text |  |
| mime_type | text |  |
| file_size_bytes | bigint |  |
| checksum_sha256 | text nullable | duplicate detection |
| title | text nullable |  |
| description | text nullable |  |
| visibility | media_visibility | family/branch/restricted/sensitive/private |
| status | text | active/archived/processing/failed |
| metadata | jsonb nullable | width/height/duration... |
| created_at | timestamptz |  |
| updated_at | timestamptz |  |
| archived_at | timestamptz nullable |  |

Indexes:

```text
index(family_id)
index(family_id, visibility)
index(family_id, mime_type)
```

---

## 3.13. `media_links`

Liên kết file với entity khác.

| Column | Type | Notes |
|---|---|---|
| id | uuid pk |  |
| family_id | uuid fk families |  |
| media_asset_id | uuid fk media_assets |  |
| entity_type | text | person/event/source/grave/branch/family |
| entity_id | uuid | polymorphic target |
| caption | text nullable |  |
| sort_order | int |  |
| created_at | timestamptz |  |

Index:

```text
index(family_id, entity_type, entity_id)
```

---

## 3.14. `sources`

Nguồn chứng cứ.

| Column | Type | Notes |
|---|---|---|
| id | uuid pk |  |
| family_id | uuid fk families |  |
| title | text |  |
| source_type | source_type |  |
| author | text nullable |  |
| source_date_text | text nullable |  |
| description | text nullable |  |
| reliability_level | certainty_level | confirmed/likely/unverified/disputed |
| primary_media_asset_id | uuid nullable fk media_assets | file scan chính |
| created_by_user_id | uuid fk users |  |
| created_at | timestamptz |  |
| updated_at | timestamptz |  |
| archived_at | timestamptz nullable |  |

---

## 3.15. `source_citations`

Gắn nguồn với entity/field. Level 1 có thể dùng đơn giản.

| Column | Type | Notes |
|---|---|---|
| id | uuid pk |  |
| family_id | uuid fk families |  |
| source_id | uuid fk sources |  |
| entity_type | text | person/relationship/event/field |
| entity_id | uuid |  |
| field_name | text nullable | birth_date, death_date, parent_id... |
| quote | text nullable | trích đoạn ngắn |
| note | text nullable |  |
| certainty_level | certainty_level |  |
| created_at | timestamptz |  |

---

## 3.16. `memberships`

User thuộc family với role/scope.

| Column | Type | Notes |
|---|---|---|
| id | uuid pk |  |
| user_id | uuid fk users |  |
| family_id | uuid fk families |  |
| role | membership_role |  |
| branch_id | uuid nullable fk branches | nếu scope theo branch |
| status | membership_status | active/pending... |
| invited_by_user_id | uuid nullable fk users |  |
| created_at | timestamptz |  |
| updated_at | timestamptz |  |
| revoked_at | timestamptz nullable |  |

Indexes:

```text
unique(user_id, family_id) where revoked_at is null
index(family_id, role)
index(family_id, branch_id)
```

Policy Level 1:

- UI có thể giới hạn một user chỉ active trong một family.
- Schema vẫn hỗ trợ nhiều membership cho tương lai.

---

## 3.17. `user_person_links`

Liên kết user với person trong gia phả.

| Column | Type | Notes |
|---|---|---|
| id | uuid pk |  |
| family_id | uuid fk families |  |
| user_id | uuid fk users |  |
| person_id | uuid fk people |  |
| verification_status | text | pending/verified/rejected |
| verified_by_user_id | uuid nullable fk users |  |
| created_at | timestamptz |  |
| updated_at | timestamptz |  |

---

## 3.18. `invites`

Link mời thành viên.

| Column | Type | Notes |
|---|---|---|
| id | uuid pk |  |
| family_id | uuid fk families |  |
| invited_email | text nullable |  |
| invited_phone | text nullable |  |
| role | membership_role | role sau khi accept |
| branch_id | uuid nullable fk branches | scope |
| token_hash | text | không lưu plaintext token |
| status | text | pending/accepted/expired/revoked |
| expires_at | timestamptz |  |
| created_by_user_id | uuid fk users |  |
| accepted_by_user_id | uuid nullable fk users |  |
| accepted_at | timestamptz nullable |  |
| created_at | timestamptz |  |
| updated_at | timestamptz |  |

---

## 3.19. `change_requests`

Đề xuất chỉnh sửa.

| Column | Type | Notes |
|---|---|---|
| id | uuid pk |  |
| family_id | uuid fk families |  |
| branch_id | uuid nullable fk branches |  |
| target_entity_type | text | person/relationship/event/media |
| target_entity_id | uuid nullable | null nếu create new |
| action | text | create/update/archive |
| proposed_data | jsonb | dữ liệu đề xuất |
| before_data | jsonb nullable | snapshot |
| status | text | pending/approved/rejected/disputed/cancelled |
| submitted_by_user_id | uuid fk users |  |
| reviewed_by_user_id | uuid nullable fk users |  |
| review_note | text nullable |  |
| created_at | timestamptz |  |
| reviewed_at | timestamptz nullable |  |

---

## 3.20. `audit_logs`

Lịch sử thay đổi.

| Column | Type | Notes |
|---|---|---|
| id | uuid pk |  |
| family_id | uuid nullable fk families | nullable cho system events |
| actor_user_id | uuid nullable fk users | null nếu system |
| action | audit_action/text | create/update/archive... |
| entity_type | text |  |
| entity_id | uuid nullable |  |
| before_data | jsonb nullable |  |
| after_data | jsonb nullable |  |
| metadata | jsonb nullable |  |
| ip_address | inet nullable |  |
| user_agent | text nullable |  |
| created_at | timestamptz |  |

Indexes:

```text
index(family_id, created_at desc)
index(family_id, entity_type, entity_id)
index(actor_user_id, created_at desc)
```

---

## 3.21. `security_logs`

Log bảo mật riêng, đặc biệt cho xem/tải/export dữ liệu nhạy cảm.

| Column | Type | Notes |
|---|---|---|
| id | uuid pk |  |
| family_id | uuid nullable fk families |  |
| actor_user_id | uuid nullable fk users |  |
| event_type | text | login/view_sensitive/download/export/role_change |
| entity_type | text nullable |  |
| entity_id | uuid nullable |  |
| metadata | jsonb nullable |  |
| ip_address | inet nullable |  |
| user_agent | text nullable |  |
| created_at | timestamptz |  |

---

## 3.22. `export_jobs`

Xuất dữ liệu.

| Column | Type | Notes |
|---|---|---|
| id | uuid pk |  |
| family_id | uuid fk families |  |
| requested_by_user_id | uuid fk users |  |
| export_type | text | excel/pdf/tree_image/book |
| status | text | queued/processing/succeeded/failed |
| options | jsonb nullable | watermark, scope, branch... |
| output_media_asset_id | uuid nullable fk media_assets | file kết quả |
| error_message | text nullable |  |
| created_at | timestamptz |  |
| completed_at | timestamptz nullable |  |

---

## 4. Validation service bắt buộc

Database constraints không đủ. Cần service code:

```ts
validatePersonDates(person)
validateParentChildRelationship(parent, child, relationship)
validateNoAncestryCycle(parentId, childId)
validatePartnership(person1, person2, partnership)
validateFamilyScopeConsistency(entityA, entityB)
validateMediaUpload(file, user, targetEntity)
```

---

## 5. Transaction rules

Các thao tác sau phải chạy trong transaction:

- Tạo person + relationship.
- Archive person + archive related relationships nếu cần.
- Approve change request + apply changes + audit log.
- Accept invite + create membership.
- Upload metadata + media link.

---

## 6. Search indexes tương lai

Level 1 có thể dùng `ILIKE`. Level 3 nên cân nhắc:

- PostgreSQL full-text search.
- Trigram index cho tìm tên tiếng Việt không dấu/có dấu.
- Normalized name search column.

Đề xuất thêm ở Level 1:

```text
people.search_text
person_names.normalized_name
```

Có thể sinh bằng app code.
