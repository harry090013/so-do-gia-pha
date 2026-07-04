# 09 — Deployment & Infrastructure

## 1. Yêu cầu hạ tầng từ dự án

Từ yêu cầu sản phẩm:

- Tối ưu chi phí thấp ở MVP.
- Có thể gần như miễn phí lúc đầu, sau scale khoảng 10 USD/tháng.
- Có Vercel và Supabase.
- Muốn dữ liệu lưu ở server riêng.
- Có yêu cầu dữ liệu đặt tại Việt Nam.
- Không cần dev/staging/production phức tạp ở MVP.
- Cần backup tự động hằng ngày.
- Level 1 target storage 49GB nhưng có thể tối ưu/nâng cấp sau.

---

## 2. Nhận định thẳng

Có 3 yêu cầu đang kéo ngược nhau:

1. **Gần như miễn phí.**
2. **Phone OTP + 49GB storage.**
3. **Dữ liệu đặt tại Việt Nam/server riêng.**

Ba điều này khó đạt đồng thời ngay từ ngày đầu. Vì vậy nên tách thành 2 chế độ:

- **Prototype/MVP nhanh:** Vercel + Supabase, dùng để code nhanh, demo và thử nghiệm.
- **Production chính thức cho gia tộc:** VPS/managed service tại Việt Nam nếu yêu cầu data residency là bắt buộc.

---

## 3. Phương án A — MVP nhanh, ít vận hành

### Stack

```text
Frontend/Backend: Next.js on Vercel
Database: Supabase PostgreSQL
Auth: Supabase Auth
Storage: Supabase Storage private buckets
```

### Ưu điểm

- Code nhanh.
- Ít quản trị server.
- Dễ cho Antigravity triển khai.
- Có sẵn Auth/Storage/Postgres.
- Phù hợp demo, thuyết phục gia đình/gia tộc.

### Nhược điểm

- Cần kiểm tra region và giới hạn gói.
- Nếu yêu cầu dữ liệu phải ở Việt Nam nghiêm ngặt, phương án này có thể không đạt.
- Phone OTP có thể phát sinh phí SMS.
- 49GB storage có thể không phù hợp free tier.

### Khi dùng

- Giai đoạn build demo.
- Dữ liệu thử nghiệm hoặc dữ liệu thật nhưng giới hạn.
- Chưa có kinh phí VPS/ops.

---

## 4. Phương án B — Production chính thức trên VPS Việt Nam

### Stack đề xuất

```text
VPS Việt Nam
  ├─ Docker Compose
  ├─ Next.js Node server
  ├─ PostgreSQL
  ├─ MinIO hoặc filesystem/object storage
  ├─ Nginx/Caddy reverse proxy
  ├─ SSL Let's Encrypt
  ├─ Backup job
  └─ Optional: Redis cho cache/job queue sau này
```

### Ưu điểm

- Kiểm soát dữ liệu tốt hơn.
- Có thể đáp ứng yêu cầu đặt dữ liệu tại Việt Nam.
- Chủ động backup/migration.
- Có thể tối ưu chi phí nếu tự quản trị tốt.

### Nhược điểm

- Cần vận hành server.
- Cần tự quản bảo mật, update, backup, SSL.
- Nếu server hỏng mà backup kém thì rủi ro cao.
- Upload 49GB cần disk/backup/storage strategy rõ.

### Khi dùng

- Khi gia tộc chính thức dùng dữ liệu thật.
- Khi yêu cầu data residency không thể bỏ qua.
- Khi có người chịu trách nhiệm vận hành.

---

## 5. Phương án C — Hybrid

```text
Vercel: frontend/Next.js app
Database + storage: VPS Việt Nam
```

### Ưu điểm

- Vẫn deploy frontend dễ.
- Dữ liệu chính nằm ở Việt Nam.

### Nhược điểm

- Latency giữa Vercel region và VPS có thể tăng.
- Cần cấu hình bảo mật database không public bừa bãi.
- Nên để backend API chạy cùng VPS nếu dữ liệu nhạy cảm.

---

## 6. Khuyến nghị theo giai đoạn

### Giai đoạn dev/demo

```text
Vercel + Supabase
```

Nhưng chỉ nhập dữ liệu thật ở mức kiểm soát và không upload tài liệu quá nhạy cảm nếu chưa chốt chính sách dữ liệu.

### Giai đoạn family pilot

```text
Nếu chấp nhận region gần Việt Nam: Vercel + Supabase region APAC/Singapore.
Nếu bắt buộc dữ liệu ở Việt Nam: chuyển sang VPS Việt Nam.
```

### Giai đoạn gia tộc chính thức

```text
VPS/managed infrastructure tại Việt Nam + backup ngoài máy chủ chính.
```

---

## 7. Docker Compose skeleton cho VPS

```yaml
services:
  app:
    image: genealogy-app:latest
    env_file: .env.production
    depends_on:
      - postgres
    ports:
      - "3000:3000"

  postgres:
    image: postgres:16
    environment:
      POSTGRES_DB: genealogy
      POSTGRES_USER: genealogy
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "127.0.0.1:5432:5432"

  minio:
    image: minio/minio
    command: server /data --console-address ":9001"
    environment:
      MINIO_ROOT_USER: ${MINIO_ROOT_USER}
      MINIO_ROOT_PASSWORD: ${MINIO_ROOT_PASSWORD}
    volumes:
      - minio_data:/data
    ports:
      - "127.0.0.1:9000:9000"
      - "127.0.0.1:9001:9001"

volumes:
  postgres_data:
  minio_data:
```

Production thật cần reverse proxy, SSL, firewall, backup, monitoring.

---

## 8. Environment variables đề xuất

```text
DATABASE_URL=
NEXT_PUBLIC_APP_URL=
AUTH_PROVIDER=
SUPABASE_URL=
SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
STORAGE_PROVIDER=
STORAGE_BUCKET_PRIVATE=
STORAGE_SIGNED_URL_TTL_SECONDS=900
INVITE_TOKEN_TTL_DAYS=7
BACKUP_RETENTION_DAYS=30
APP_ENV=development|production
```

Nếu dùng SMS:

```text
SMS_PROVIDER=
SMS_API_KEY=
SMS_SENDER_ID=
OTP_TTL_SECONDS=300
OTP_RATE_LIMIT_SECONDS=60
```

---

## 9. Backup strategy

### 9.1. Database

- `pg_dump` hằng ngày.
- Nén file backup.
- Lưu tối thiểu 7 bản gần nhất.
- Nếu production: mã hóa backup.
- Lưu ngoài server chính nếu có thể.

### 9.2. Storage

- Backup metadata nằm trong DB chưa đủ; file object cũng phải backup.
- Nếu dùng Supabase Storage, cần export/sync strategy.
- Nếu dùng MinIO/filesystem, cần `rclone`/snapshot sang nơi khác.

### 9.3. Restore drill

Mỗi tháng hoặc trước khi nhập dữ liệu thật lớn:

1. Restore DB sang database test.
2. Kiểm tra app đọc được dữ liệu.
3. Kiểm tra file signed URL/download.

---

## 10. Storage strategy

### Level 1

- Avatar + ảnh + PDF là ưu tiên.
- Word/Excel/video/audio có thể hỗ trợ nhưng phải có size cap.
- Tạo thumbnail ảnh.
- Không cho upload file nguy hiểm.
- Quota per family.

### Level 2+

- Object storage S3-compatible.
- Lifecycle policy nếu có.
- Virus scan nếu mở cho nhiều gia đình.
- Background job nén ảnh/video.

---

## 11. Region/data residency

Nếu dữ liệu bắt buộc ở Việt Nam, cần lựa chọn provider có máy chủ/lưu trữ tại Việt Nam hoặc tự quản VPS Việt Nam. Vercel/Supabase hữu ích cho MVP nhưng cần kiểm chứng region trước khi dùng dữ liệu nhạy cảm.

---

## 12. Publish checklist

- [ ] Domain/subdomain trỏ đúng.
- [ ] HTTPS bật.
- [ ] Env secrets cấu hình production.
- [ ] Database migration chạy.
- [ ] Không bật public access cho storage.
- [ ] robots/noindex bật.
- [ ] Admin account tạo an toàn.
- [ ] Invite flow hoạt động.
- [ ] Backup job chạy thử.
- [ ] Restore test thành công.
- [ ] Log error/audit hoạt động.
- [ ] Rate limit auth/upload.

---

## 13. Tài liệu chính thức cần kiểm tra trước khi triển khai

- Next.js deployment options: https://nextjs.org/docs/pages/getting-started/deploying
- Vercel Next.js deployment: https://vercel.com/docs/frameworks/full-stack/nextjs
- Vercel Function regions: https://vercel.com/docs/functions/configuring-functions/region
- Supabase regions: https://supabase.com/docs/guides/platform/regions
- Supabase Storage buckets: https://supabase.com/docs/guides/storage/buckets/fundamentals
- Supabase Storage access control: https://supabase.com/docs/guides/storage/security/access-control
- Supabase phone login: https://supabase.com/docs/guides/auth/phone-login
