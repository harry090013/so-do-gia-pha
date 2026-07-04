# 10 — API Spec Draft

## 1. API conventions

### 1.1. Base pattern

```text
/api/families/:familyId/...
/api/people/:personId/...
```

Tất cả API private phải:

1. Require auth.
2. Check membership.
3. Check role/scope.
4. Apply privacy masking.
5. Write audit log nếu mutation.

### 1.2. Response envelope

```json
{
  "data": {},
  "meta": {},
  "error": null
}
```

Error:

```json
{
  "data": null,
  "error": {
    "code": "FORBIDDEN",
    "message": "Bạn không có quyền thực hiện thao tác này.",
    "details": {}
  }
}
```

### 1.3. Common error codes

```text
UNAUTHENTICATED
FORBIDDEN
NOT_FOUND
VALIDATION_ERROR
CONFLICT
RATE_LIMITED
INTERNAL_ERROR
```

---

## 2. Auth & invites

### POST `/api/invites`

Tạo invite.

Required role: Owner/Family Admin.

Request:

```json
{
  "familyId": "uuid",
  "email": "member@example.com",
  "phone": null,
  "role": "member",
  "branchId": null,
  "expiresInDays": 7
}
```

Response:

```json
{
  "data": {
    "inviteId": "uuid",
    "inviteUrl": "https://app.example.com/invite/token_plaintext_once"
  }
}
```

Security:

- DB lưu token hash.
- Plain token chỉ trả một lần.

### POST `/api/invites/accept`

Request:

```json
{
  "token": "plaintext-token"
}
```

Response:

```json
{
  "data": {
    "familyId": "uuid",
    "membershipId": "uuid",
    "role": "member"
  }
}
```

---

## 3. Families

### GET `/api/families/:familyId`

Trả thông tin family theo quyền.

### PATCH `/api/families/:familyId/settings`

Update cấu hình privacy, noindex, invite policy.

Required role: Owner/Family Admin.

---

## 4. Branches

### GET `/api/families/:familyId/branches`

Danh sách chi/phái.

### POST `/api/families/:familyId/branches`

Request:

```json
{
  "name": "Chi trưởng",
  "parentBranchId": null,
  "founderPersonId": "uuid",
  "description": "..."
}
```

---

## 5. People

### GET `/api/families/:familyId/people`

Query params:

```text
q
branchId
generation
lifeStatus
missing=birthDate|parents|photo|source
page
pageSize
```

Response item phải đã mask theo viewer.

### POST `/api/families/:familyId/people`

Request tối thiểu:

```json
{
  "primaryName": "Nguyễn Văn A",
  "gender": "unknown",
  "lifeStatus": "unknown",
  "branchId": null,
  "birth": {
    "dateValue": null,
    "year": null,
    "precision": "unknown",
    "calendar": "unknown",
    "text": null
  },
  "biographyPublic": null
}
```

Response:

```json
{
  "data": {
    "id": "uuid",
    "primaryName": "Nguyễn Văn A"
  }
}
```

### GET `/api/people/:personId`

Trả profile chi tiết đã mask.

### PATCH `/api/people/:personId`

Update hồ sơ. Ghi audit.

### POST `/api/people/:personId/archive`

Soft delete/archive. Required Owner/Admin.

---

## 6. Names

### POST `/api/people/:personId/names`

```json
{
  "name": "Cụ Đồ A",
  "nameType": "alias",
  "language": "vi",
  "isPrimary": false,
  "note": "Tên thường gọi trong họ"
}
```

---

## 7. Parent-child relationships

### POST `/api/families/:familyId/relationships/parent-child`

Request:

```json
{
  "parentId": "uuid",
  "childId": "uuid",
  "parentRole": "father",
  "relationshipType": "biological",
  "childOrder": 1,
  "childOrderLabel": "Con trưởng",
  "certaintyLevel": "confirmed",
  "sourceId": null,
  "note": null
}
```

Validation:

- parentId != childId.
- Same family.
- No ancestry cycle.
- Confirmed biological father/mother uniqueness.

### PATCH `/api/relationships/parent-child/:relationshipId`

Update quan hệ.

### POST `/api/relationships/parent-child/:relationshipId/archive`

Soft delete.

---

## 8. Partnerships

### POST `/api/families/:familyId/relationships/partnerships`

Request:

```json
{
  "person1Id": "uuid",
  "person2Id": "uuid",
  "partnershipType": "marriage",
  "status": "active",
  "startDateText": null,
  "certaintyLevel": "confirmed",
  "note": null
}
```

Validation:

- person1Id != person2Id.
- Same family.
- Warn nếu kết hôn sau ngày mất.

---

## 9. Tree APIs

### GET `/api/families/:familyId/tree`

Query params:

```text
rootPersonId=uuid
direction=descendants|ancestors|nuclear
depth=4
branchId=uuid optional
includeSpouses=true
```

Response:

```json
{
  "data": {
    "nodes": [
      {
        "id": "uuid",
        "label": "Nguyễn Văn A",
        "gender": "male",
        "lifeStatus": "deceased",
        "generation": 1,
        "branchId": "uuid",
        "avatarUrl": "signed-or-null",
        "privacyMasked": false
      }
    ],
    "edges": [
      {
        "id": "uuid",
        "from": "uuid",
        "to": "uuid",
        "type": "parent_child",
        "relationshipType": "biological"
      }
    ]
  },
  "meta": {
    "rootPersonId": "uuid",
    "direction": "descendants",
    "depth": 4
  }
}
```

---

## 10. Search

### GET `/api/families/:familyId/search/people?q=...`

Trả danh sách người đã mask.

---

## 11. Media

### POST `/api/families/:familyId/media/upload-intent`

Tạo upload intent/signed upload.

Request:

```json
{
  "fileName": "anh-gia-dinh.jpg",
  "mimeType": "image/jpeg",
  "fileSizeBytes": 123456,
  "visibility": "family",
  "link": {
    "entityType": "person",
    "entityId": "uuid"
  }
}
```

Response:

```json
{
  "data": {
    "mediaAssetId": "uuid",
    "uploadUrl": "...",
    "storagePath": "families/.../media/..."
  }
}
```

### GET `/api/media/:mediaAssetId/download-url`

Kiểm quyền rồi trả signed URL.

---

## 12. Sources

### POST `/api/families/:familyId/sources`

```json
{
  "title": "Gia phả giấy bản 1980",
  "sourceType": "family_book",
  "reliabilityLevel": "likely",
  "description": "...",
  "primaryMediaAssetId": "uuid"
}
```

---

## 13. Change requests

Level 2+.

### POST `/api/families/:familyId/change-requests`

```json
{
  "targetEntityType": "person",
  "targetEntityId": "uuid",
  "action": "update",
  "proposedData": {
    "birthYear": 1922
  }
}
```

### POST `/api/change-requests/:id/approve`

Admin/Branch Manager approve.

---

## 14. Dashboard

### GET `/api/families/:familyId/admin/stats`

Response:

```json
{
  "data": {
    "totalPeople": 85,
    "livingPeople": 52,
    "deceasedPeople": 30,
    "unknownLifeStatus": 3,
    "missingBirthDate": 40,
    "missingParents": 12,
    "missingPhoto": 70,
    "pendingChangeRequests": 2,
    "newMediaThisMonth": 10
  }
}
```

---

## 15. Export

### POST `/api/families/:familyId/export-jobs`

```json
{
  "exportType": "excel",
  "scope": {
    "branchId": null,
    "includeLivingSensitiveData": false
  },
  "watermark": true
}
```

Required: Owner/Admin.

---

## 16. API implementation warnings

- Không trả full person object cho client rồi mới mask ở frontend.
- Không tạo signed URL nếu chưa check permission.
- Không cho route tree/search bỏ qua auth.
- Không dùng `familyId` từ request mà không kiểm membership.
- Không để branch manager sửa branch khác.
- Không apply change request nếu không ghi audit log.
