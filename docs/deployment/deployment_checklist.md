# Deployment Checklist — VM Migration

## Phase 1 — Chuẩn bị VM

> Tạo và cấu hình VM trên GCP, cài công cụ cần thiết

- [x] [ME] Tạo VM `app-vm` — `n2-standard-4`, zone `asia-southeast1-b`, disk 50GB, tags `http-server,https-server`
- [x] [ME] Tạo firewall rule `allow-http-https` — mở port 80, 443 cho public
- [x] [ME] Tạo firewall rule `allow-alloy-ui` — mở port 12345 giới hạn IP cá nhân
- [x] [ME] SSH vào VM, cài Docker + Docker Compose — chạy `curl -fsSL https://get.docker.com | sh`
- [x] [ME] Xác thực GCR trên VM — `gcloud auth configure-docker gcr.io`
- [x] [ME] Tạo tài khoản Grafana Cloud (grafana.com), chọn stack region Singapore
- [ ] [ME] Lấy Prometheus remote_write URL + username + API key từ Grafana Cloud
- [ ] [ME] Lấy Loki push URL + username + API key từ Grafana Cloud

---

## Phase 2 — Setup cấu hình

> Tạo toàn bộ file config trên VM tại `/opt/app/`

- [x] [AI] Tạo template `.env.backend-core` — `docs/deployment/vm-config/.env.backend-core`
- [x] [ME] Điền credentials thật vào `.env.backend-core` — DB, Redis, RabbitMQ, JWT, Cloudinary, Google OAuth
- [x] [AI] Tạo template `.env.backend-ai` — `docs/deployment/vm-config/.env.backend-ai`
- [x] [ME] Điền credentials thật vào `.env.backend-ai` — DATABASE_URL, RABBITMQ_URL, GEMINI_API_KEY
- [ ] [AI] Tạo template `.env.alloy` — (tạm gác, sẽ làm sau)
- [ ] [ME] Điền credentials Grafana Cloud vào `.env.alloy` — (tạm gác)
- [x] [AI] Tạo `docker-compose.yml` — `docs/deployment/vm-config/docker-compose.yml`
- [ ] [AI] Tạo `monitoring/alloy-config.alloy` — (tạm gác)
- [x] [AI] Tạo `nginx/nginx.conf` — `docs/deployment/vm-config/nginx/nginx.conf`
- [x] [ME] Điền domain thật vào `nginx.conf` — `dedangdown.io.vn`, HTTP→HTTPS redirect + SSL
- [x] [ME] Đặt SSL cert (`fullchain.pem`, `privkey.pem`) vào `nginx/ssl/` trên VM
- [x] [ME] Kiểm tra `.gitignore` — đảm bảo `.env.*` không bị commit

---

## Phase 3 — Deploy và kiểm tra

> Khởi động services tuần tự, verify từng bước

- [x] [ME] Copy files lên VM — tạo trực tiếp `/opt/app/` trên VM
- [x] [ME] Copy `.env.backend-core` và `.env.backend-ai` lên VM (không qua git)
- [x] [ME] Chạy `docker compose pull` — pull tất cả images từ GCR
- [x] [ME] Khởi động `backend-core` — healthy, log thấy Database + Redis + RabbitMQ connected
- [x] [ME] Khởi động `backend-ai` — healthy, Whisper loaded + tất cả consumers started
- [x] [ME] Khởi động `nginx` — cả 3 containers healthy
- [x] [ME] Test health check qua Nginx — `http://34.143.226.199/api/v1/health` ✅ và `http://34.143.226.199/ai/health` ✅
- [x] [ME] Đo TTFB — 72ms (HTTP, Singapore → VN, chấp nhận được)
- [x] [ME] Test HTTPS — `https://dedangdown.io.vn/api/v1/health` ✅ và `https://dedangdown.io.vn/ai/health` ✅
- [x] [ME] Fix CORS — `CORS_ORIGIN` hỗ trợ comma-separated, đã thêm `https://ielts-master.io.vn`

---

## Phase 4 — Cập nhật CI/CD

> Chuyển deploy target từ Cloud Run sang VM

- [x] [AI] Tạo `deploy.yml` mới — `.github/workflows/deploy.yml`, dùng SSH key thay gcloud ssh
- [x] [ME] Tạo SSH key pair — `ssh-keygen -t ed25519 -f ~/.ssh/vm_deploy_key -N ""`
- [x] [ME] Thêm public key vào VM — `gcloud compute ssh app-vm ... --command "echo '...' >> ~/.ssh/authorized_keys"`
- [x] [ME] Thêm GitHub Secret `VM_SSH_PRIVATE_KEY` — nội dung `~/.ssh/vm_deploy_key`
- [x] [ME] Cập nhật GitHub Secret `NEXT_PUBLIC_API_URL` — `https://dedangdown.io.vn/api/v1`
- [x] [ME] Cập nhật `CORS_ORIGIN` trong `.env.backend-core` trên VM — `https://ielts-master.io.vn,https://dedangdown.io.vn`
- [ ] [ME+AI] Test push code → verify CI/CD chạy đúng, chỉ build service có thay đổi

---

## Phase 5 — Dọn dẹp Cloud Run

> Xóa Cloud Run backends sau khi VM ổn định

- [ ] [ME] Chờ VM chạy ổn định ít nhất 24h liên tục
- [ ] [ME] Xác nhận toàn bộ features hoạt động đúng trên VM (pronunciation, grading, chat...)
- [ ] [ME] Xóa `backend-core` Cloud Run — `gcloud run services delete backend-core --region asia-southeast1`
- [ ] [ME] Xóa `backend-ai` Cloud Run — `gcloud run services delete backend-ai --region asia-southeast1`

---

## Phase 6 — Grafana Cloud Dashboard & Alerts

> Thiết lập observability cho VM mới

- [ ] [ME] Import dashboard Node Exporter Full (ID **1860**) — CPU, RAM, disk VM
- [ ] [ME] Import dashboard NestJS metrics (ID **13639**)
- [ ] [ME] Import dashboard Docker containers (ID **15141**)
- [ ] [ME+AI] Tạo alert "High Memory" — RAM > 80% trong 5 phút → email/Slack
- [ ] [ME+AI] Tạo alert "Service Down" — health check fail 3 lần liên tiếp → email/Slack
- [ ] [ME+AI] Tạo alert "Slow Response" — TTFB > 1000ms → email
- [ ] [ME+AI] Tạo alert "Whisper OOM" — backend-ai RAM > 9GB → email/Slack
