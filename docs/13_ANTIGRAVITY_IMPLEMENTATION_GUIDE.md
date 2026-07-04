# 13 — Antigravity Implementation Guide

## 1. Mục tiêu của Antigravity

Antigravity sẽ code dự án dựa trên bộ spec này. Nhiệm vụ không phải làm tất cả Level 1 trong một lần, mà triển khai có thứ tự, an toàn, có migration rõ ràng và không phá vỡ các quyết định dữ liệu lõi.

---

## 2. Stack đề xuất mặc định

```text
Next.js App Router
TypeScript
Tailwind CSS
PostgreSQL
Prisma ORM hoặc Drizzle ORM
Supabase Auth/Storage hoặc adapter tương đương
```

Nếu chưa có quyết định ORM, ưu tiên Prisma vì schema dễ đọc, dễ cho AI sinh code và dễ review. Nếu cần SQL/RLS sâu hơn, Drizzle cũng phù hợp.

---

## 3. Repository structure đề xuất

```text
.
├── README.md
├── AGENTS.md
├── docs/
├── app/
│   ├── (auth)/
│   ├── (app)/
│   └── api/
├── components/
│   ├── tree/
│   ├── people/
│   ├── media/
│   ├── admin/
│   └── ui/
├── lib/
│   ├── auth/
│   ├── audit/
│   ├── db/
│   ├── permissions/
│   ├── privacy/
│   ├── storage/
│   ├── tree/
│   └── validators/
├── prisma/
│   ├── schema.prisma
│   └── migrations/
├── scripts/
│   ├── backup/
│   └── seed/
└── tests/
```

---

## 4. Implementation order

### Task 1 — Initialize app

- Create Next.js TypeScript app.
- Add Tailwind.
- Add env validation.
- Add database client.
- Add README dev commands.

Acceptance:

- App runs locally.
- Env missing throws clear error.

### Task 2 — Database schema migration 001

Create tables:

- users
- families
- family_settings
- branches
- people
- person_names
- parent_child_relationships
- partnerships
- memberships
- invites
- audit_logs

Acceptance:

- Migration runs clean.
- Seed creates one demo family, owner, root person, 2–3 descendants.

### Task 3 — Permission core

Implement:

```text
requireAuth
requireFamilyAccess
getMembership
canViewPerson
canEditPerson
canManageBranch
maskPersonForViewer
```

Acceptance:

- Guest cannot read family/people/tree.
- Owner can read/write.
- Viewer cannot see living sensitive fields.

### Task 4 — People CRUD

- People list.
- Add person.
- Edit person.
- Archive person.
- Audit log.

Acceptance:

- Form only requires primary name.
- Archive does not hard delete.
- Audit log includes before/after.

### Task 5 — Relationships

- Parent-child create/update/archive.
- Partnership create/update/archive.
- Validation no self-parent.
- Validation no ancestry cycle.
- Warning for date conflicts.

Acceptance:

- Cannot create A parent of A.
- Cannot create A -> B -> C -> A cycle.
- Tree can query relationships.

### Task 6 — Tree service/API

- Build descendants query.
- Build graph response nodes/edges.
- Depth param.
- Branch filter param.
- Privacy masking.

Acceptance:

- API returns correct 4-generation demo tree.
- Guest blocked.
- Living sensitive fields masked.

### Task 7 — Tree UI

- Tree page.
- Render nodes/edges.
- Zoom/pan.
- Click node opens panel.
- Add quick actions if role permits.

Acceptance:

- Demo family tree viewable.
- Clicking node shows summary.
- Search/focus basic if implemented.

### Task 8 — Profile page

- Profile header.
- Basic info tab.
- Family relationships tab.
- Biography tab.
- Media placeholder.
- Audit tab for admin.

Acceptance:

- Profile respects privacy masking.
- Admin can edit.

### Task 9 — Media upload

- Storage adapter.
- Media metadata tables.
- Upload image/PDF.
- Link to person.
- Signed URL download.

Acceptance:

- No public URL for sensitive files.
- Permission checked before download URL.

### Task 10 — Admin dashboard

- Stats endpoint.
- Stats UI.
- Members/invites basic.
- Audit log UI.

---

## 5. Coding standards

- TypeScript strict.
- Validate inputs with Zod or equivalent.
- Use transactions for multi-table mutations.
- All API errors return consistent shape.
- Do not duplicate permission logic in many places.
- Keep UI components dumb; use server/API for permissioned data.
- Use enum constants, not magic strings.
- Do not leak env secrets to client.

---

## 6. Testing priorities

### Unit tests

- Permission helpers.
- Privacy masking.
- Relationship validation.
- Date validation.

### Integration tests

- Create person + parent-child in transaction.
- Tree API returns correct nodes/edges.
- Viewer cannot see living sensitive data.
- Archive does not delete.
- Audit log created.

### Manual QA

- Login/invite.
- Add 4 generations.
- Add multiple spouses.
- Add child order.
- Upload private file.
- Export only if role allowed.

---

## 7. Seed data đề xuất

Seed nên có:

- 1 family.
- 1 owner.
- 1 admin.
- 1 viewer.
- 1 root ancestor deceased.
- 4 generations.
- 1 living person.
- 1 person with unknown date.
- 1 partnership.
- 1 child order.
- 1 branch.
- 1 media placeholder.

---

## 8. Prompt mẫu cho Antigravity

### Prompt Sprint 1

```text
Read README.md, AGENTS.md, docs/00_MASTER_SPEC.md, docs/05_DATA_MODEL_OVERVIEW.md, docs/06_DATABASE_SCHEMA_DRAFT.md, docs/07_SECURITY_AND_PRIVACY.md.
Implement Sprint 1 only: Next.js app foundation, database schema/migration, seed data, auth placeholder/invite skeleton, permission helpers.
Do not implement tree UI yet. Do not simplify the data model by adding father_id/mother_id/spouse_id to people.
```

### Prompt Sprint 2

```text
Implement People CRUD and relationship CRUD using the existing schema. Add validation for no self-parent and no ancestry cycle. Add audit logs for create/update/archive. Keep privacy masking server-side.
```

### Prompt Sprint 3

```text
Implement tree API returning nodes/edges for descendants with depth and branch filter. Then create a basic tree UI with zoom/pan and right panel summary. Ensure backend masks living sensitive data before returning nodes.
```

---

## 9. Definition of Done per PR/task

- Migration included if schema changes.
- Permission check included for API/server action.
- Audit log included for mutation.
- Validation included for input.
- Manual test steps documented.
- No hard delete.
- No public sensitive file URL.
- No secrets committed.

---

## 10. Không được làm

- Không viết một file component khổng lồ xử lý tất cả logic.
- Không dùng localStorage để lưu dữ liệu gia phả chính.
- Không bỏ qua DB transaction.
- Không trả sensitive fields cho frontend rồi ẩn bằng CSS.
- Không tạo schema chỉ phục vụ demo 4 thế hệ.
- Không implement billing/SaaS trước khi Level 1 chạy được.
