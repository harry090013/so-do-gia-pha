# 15 — Backlog & Tasks

## 1. Priority legend

| Priority | Nghĩa |
|---|---|
| P0 | Bắt buộc cho Level 1 |
| P1 | Rất nên có cho Level 1 |
| P2 | Có nếu kịp, hoặc Level 2 |
| P3 | Level 3+ |
| P4 | Tương lai xa |

---

## 2. Epic: Foundation

| ID | Task | Priority |
|---|---|---|
| FND-001 | Khởi tạo Next.js + TypeScript + Tailwind | P0 |
| FND-002 | Cấu hình env validation | P0 |
| FND-003 | Cấu hình database/ORM | P0 |
| FND-004 | Tạo migration schema core | P0 |
| FND-005 | Seed demo family 4 thế hệ nhỏ | P0 |
| FND-006 | Cấu hình lint/format | P1 |
| FND-007 | Docker Compose local optional | P1 |

---

## 3. Epic: Auth & Permissions

| ID | Task | Priority |
|---|---|---|
| AUTH-001 | Tạo users/memberships/invites | P0 |
| AUTH-002 | Login/invite accept skeleton | P0 |
| AUTH-003 | Permission helpers | P0 |
| AUTH-004 | Privacy masking helper | P0 |
| AUTH-005 | Role management UI basic | P1 |
| AUTH-006 | Phone OTP production integration | P2 |
| AUTH-007 | 2FA | P4 |

---

## 4. Epic: People

| ID | Task | Priority |
|---|---|---|
| PPL-001 | People list API/UI | P0 |
| PPL-002 | Add person form | P0 |
| PPL-003 | Edit person form | P0 |
| PPL-004 | Archive person | P0 |
| PPL-005 | Person names | P1 |
| PPL-006 | Flexible dates | P1 |
| PPL-007 | Biography/achievements | P1 |
| PPL-008 | Contact/private fields | P1 |

---

## 5. Epic: Relationships

| ID | Task | Priority |
|---|---|---|
| REL-001 | Parent-child schema/API | P0 |
| REL-002 | Partnership schema/API | P0 |
| REL-003 | Relationship forms | P0 |
| REL-004 | No self-parent validation | P0 |
| REL-005 | No cycle validation | P0 |
| REL-006 | Child order | P0 |
| REL-007 | Date/age warnings | P1 |
| REL-008 | Relationship source/certainty UI | P2 |

---

## 6. Epic: Tree

| ID | Task | Priority |
|---|---|---|
| TREE-001 | Tree graph API nodes/edges | P0 |
| TREE-002 | Descendants depth query | P0 |
| TREE-003 | Tree UI vertical layout | P0 |
| TREE-004 | Zoom/pan | P0 |
| TREE-005 | Right panel | P0 |
| TREE-006 | Add relative from node | P1 |
| TREE-007 | Branch filter | P1 |
| TREE-008 | Search/focus node | P1 |
| TREE-009 | Lazy expand branch | P2 |
| TREE-010 | Export image/PDF | P2 |

---

## 7. Epic: Profile

| ID | Task | Priority |
|---|---|---|
| PROF-001 | Profile header | P0 |
| PROF-002 | Basic info tab | P0 |
| PROF-003 | Relationships tab | P0 |
| PROF-004 | Biography tab | P1 |
| PROF-005 | Events tab | P1 |
| PROF-006 | Media tab | P1 |
| PROF-007 | Sources tab | P2 |
| PROF-008 | Audit tab admin | P1 |
| PROF-009 | Graves tab | P2 |

---

## 8. Epic: Media

| ID | Task | Priority |
|---|---|---|
| MED-001 | Media metadata table | P0 |
| MED-002 | Storage adapter | P0 |
| MED-003 | Upload avatar | P0 |
| MED-004 | Upload document/photo to person | P1 |
| MED-005 | Signed URL download | P0 |
| MED-006 | MIME/size validation | P0 |
| MED-007 | Thumbnail generation | P2 |
| MED-008 | Video/audio support | P2 |

---

## 9. Epic: Admin

| ID | Task | Priority |
|---|---|---|
| ADM-001 | Admin dashboard stats | P1 |
| ADM-002 | Members list | P1 |
| ADM-003 | Invites management | P1 |
| ADM-004 | Audit log list | P1 |
| ADM-005 | Data quality list | P1 |
| ADM-006 | Settings privacy | P1 |
| ADM-007 | Export jobs | P2 |

---

## 10. Epic: Calendar/ngày giỗ

| ID | Task | Priority |
|---|---|---|
| CAL-001 | Lưu ngày giỗ âm/dương | P1 |
| CAL-002 | Danh sách ngày giỗ | P1 |
| CAL-003 | Upcoming memorials widget | P2 |
| CAL-004 | Email notification | P3 |
| CAL-005 | Zalo/Telegram notification | P4 |
| CAL-006 | iCal/Google Calendar | P4 |

---

## 11. Epic: Export

| ID | Task | Priority |
|---|---|---|
| EXP-001 | Export Excel people list | P2 |
| EXP-002 | Export tree image | P2 |
| EXP-003 | Export PDF basic | P2 |
| EXP-004 | Watermark | P2 |
| EXP-005 | Book generator | P4 |
| EXP-006 | GEDCOM | P3 |

---

## 12. Epic: Infrastructure

| ID | Task | Priority |
|---|---|---|
| INF-001 | Deploy demo to Vercel/Supabase | P1 |
| INF-002 | Backup script/database | P0 |
| INF-003 | Restore guide | P0 |
| INF-004 | VPS Docker Compose | P2 |
| INF-005 | MinIO/self-host storage | P2 |
| INF-006 | Monitoring/logging | P2 |

---

## 13. First 10 tasks nên giao cho Antigravity

1. Initialize Next.js + Tailwind + TypeScript.
2. Add env validation.
3. Add ORM + database connection.
4. Create schema/migration for core tables.
5. Seed demo family.
6. Implement auth placeholder and invite skeleton.
7. Implement permissions module.
8. Implement people CRUD.
9. Implement parent-child/partnership CRUD.
10. Implement tree graph API.
