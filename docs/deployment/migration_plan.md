# Kế hoạch Migration — 1 VM n2-standard-4 + Monitoring

> **Mục tiêu:** Chuyển toàn bộ backend từ Cloud Run sang 1 VM lớn ở Singapore, bổ sung observability stack nhẹ (Grafana Alloy → Grafana Cloud)
> **Thời gian thực hiện:** 45 ngày
> **Budget:** ~$235 / $300 credit

---

## 1. Tổng quan kiến trúc

### Trước (hiện tại)
```
Internet
   │
   ├── Cloud Run frontend-web    (asia-southeast1)
   ├── Cloud Run backend-core    (asia-southeast1)
   └── Cloud Run backend-ai      (asia-southeast1)
```

### Sau (mục tiêu)
```
Internet
   │
   ├── Cloud Run frontend-web              (giữ nguyên)
   │
   └── n2-standard-4 VM (16GB RAM)        asia-southeast1-b
         ├── Nginx (reverse proxy + SSL)
         ├── backend-core  :3000
         ├── backend-ai    :8000  (Whisper base, cached)
         └── Grafana Alloy :12345 (agent — ship lên Grafana Cloud)
```

---

## 2. Chi phí ước tính

| Service | Loại | Giá/45 ngày |
|---|---|---|
| n2-standard-4 VM | 4 vCPU, 16GB, Singapore | ~$210 |
| Cloud Run frontend-web | min-instances=1 | ~$15 |
| Network + Storage | Egress, disk | ~$10 |
| Grafana Cloud | Free tier | $0 |
| **Tổng** | | **~$235** |
| **Buffer còn lại** | | **~$65** |

---

## 3. Phân bổ RAM trên VM

```
Hệ điều hành + Docker daemon      ~1.0 GB
Nginx                              ~0.1 GB
backend-core (NestJS)              ~0.5 GB
Grafana Alloy (agent)              ~0.2 GB
─────────────────────────────────────────
Còn lại cho backend-ai            ~14.2 GB
  └── Whisper base model loaded    ~1.5 GB
  └── Buffer concurrent inference  ~2.0 GB
  └── Headroom thực tế             ~10.7 GB ✓
```

---

## 4. Cấu trúc thư mục trên VM

```
/opt/app/
├── docker-compose.yml
├── .env.backend-core
├── .env.backend-ai
├── .env.alloy
├── nginx/
│   ├── nginx.conf
│   └── ssl/
│       ├── fullchain.pem
│       └── privkey.pem
└── monitoring/
    └── alloy-config.alloy
```

---

## 5. Kế hoạch step-by-step

---

### Phase 1 — Chuẩn bị (local, không ảnh hưởng production)

#### Step 1.1: Tạo VM trên GCP

```bash
gcloud compute instances create app-vm \
  --zone=asia-southeast1-b \
  --machine-type=n2-standard-4 \
  --image-family=debian-12 \
  --boot-disk-size=50GB \
  --tags=http-server,https-server
```

**Checklist:**
- [ ] VM tạo thành công
- [ ] Zone đúng `asia-southeast1-b`
- [ ] Disk 50GB (chứa Whisper model ~1.5GB + Docker images)

---

#### Step 1.2: Mở firewall ports

```bash
# HTTP/HTTPS cho Nginx
gcloud compute firewall-rules create allow-http-https \
  --allow tcp:80,tcp:443 \
  --target-tags http-server,https-server

# Grafana Alloy UI — chỉ mở cho IP của bạn, KHÔNG mở public
gcloud compute firewall-rules create allow-alloy-ui \
  --allow tcp:12345 \
  --source-ranges YOUR_IP/32 \
  --target-tags http-server
```

> ⚠️ **Bảo mật:** Không mở port monitoring ra public internet.
> Nếu cần xem Grafana Cloud dashboard, truy cập trực tiếp tại grafana.com.

**Ports cần mở:**
- [ ] 80 (HTTP → redirect sang HTTPS)
- [ ] 443 (HTTPS)
- [ ] 12345 (Grafana Alloy UI — giới hạn IP)

---

#### Step 1.3: Cài Docker + xác thực GCR

```bash
# SSH vào VM
gcloud compute ssh app-vm --zone=asia-southeast1-b

# Cài Docker
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER
newgrp docker

# Xác thực với GCR để pull image
gcloud auth configure-docker gcr.io
```

**Checklist:**
- [ ] `docker --version` chạy được
- [ ] `docker compose version` chạy được
- [ ] Pull test image thành công

---

#### Step 1.4: Đăng ký Grafana Cloud (free tier)

1. Tạo tài khoản tại [grafana.com](https://grafana.com)
2. Tạo stack mới → chọn region **Singapore** hoặc gần nhất
3. Lấy thông tin kết nối:
   - **Prometheus remote_write URL** + username + API key
   - **Loki push URL** + username + API key
4. Lưu vào `.env.alloy`

**Checklist:**
- [ ] Tạo tài khoản Grafana Cloud thành công
- [ ] Lấy được Prometheus endpoint + credentials
- [ ] Lấy được Loki endpoint + credentials

---

### Phase 2 — Setup cấu hình (trên VM)

#### Step 2.1: Tạo file .env cho từng service

**`.env.backend-core`**
```env
NODE_ENV=production
API_PREFIX=api/v1
DATABASE_URL=postgresql://...pooler...:6543/postgres?pgbouncer=true
DIRECT_URL=postgresql://...pooler...:5432/postgres
REDIS_URL=rediss://...upstash.io:6379
RABBITMQ_URL=amqps://...cloudamqp.com/vhost
JWT_SECRET=...
JWT_REFRESH_SECRET=...
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
CORS_ORIGIN=https://frontend-web-972613399189.asia-southeast1.run.app
```

**`.env.backend-ai`**
```env
DATABASE_URL=postgresql://...pooler...:5432/postgres  # direct, không pgbouncer
RABBITMQ_URL=amqps://...cloudamqp.com/vhost
GEMINI_API_KEY=...
WHISPER_MODEL=base
WHISPER_COMPUTE_TYPE=int8
MAX_WORKERS=2
PORT=8000
ENVIRONMENT=production
```

**`.env.alloy`**
```env
GRAFANA_CLOUD_PROM_URL=https://prometheus-prod-xx.grafana.net/api/prom/push
GRAFANA_CLOUD_PROM_USER=123456
GRAFANA_CLOUD_PROM_API_KEY=glc_xxx...
GRAFANA_CLOUD_LOKI_URL=https://logs-prod-xx.grafana.net/loki/api/v1/push
GRAFANA_CLOUD_LOKI_USER=654321
GRAFANA_CLOUD_LOKI_API_KEY=glc_xxx...
```

**Checklist:**
- [ ] Không commit bất kỳ file .env nào lên Git (kiểm tra `.gitignore`)
- [ ] `DATABASE_URL` backend-ai dùng port 5432 (không pgbouncer)
- [ ] `WHISPER_MODEL=base` và `MAX_WORKERS=2`

---

#### Step 2.2: Tạo docker-compose.yml

```yaml
version: '3.8'
services:
  nginx:
    image: nginx:alpine
    ports: ["80:80", "443:443"]
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf:ro
      - ./nginx/ssl:/etc/nginx/ssl:ro
    depends_on: [backend-core, backend-ai]
    logging:
      driver: "json-file"
      options:
        max-size: "50m"
        max-file: "5"
    restart: unless-stopped

  backend-core:
    image: gcr.io/ielts-master-495612/backend-core:latest
    expose: ["3000"]
    env_file: .env.backend-core
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/api/v1/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s
    logging:
      driver: "json-file"
      options:
        max-size: "50m"
        max-file: "5"
    restart: unless-stopped

  backend-ai:
    image: gcr.io/ielts-master-495612/backend-ai:latest
    expose: ["8000"]
    env_file: .env.backend-ai
    volumes:
      - whisper-cache:/root/.cache/huggingface
      - /tmp/audio:/tmp/audio
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8000/health"]
      interval: 30s
      timeout: 15s
      retries: 3
      start_period: 90s    # Whisper load model lần đầu ~2-3 phút
    deploy:
      resources:
        limits:
          memory: 10G
          cpus: '3'
    logging:
      driver: "json-file"
      options:
        max-size: "100m"
        max-file: "5"
    restart: unless-stopped

  alloy:
    image: grafana/alloy:latest
    ports: ["12345:12345"]    # UI — chỉ truy cập qua IP giới hạn
    volumes:
      - ./monitoring/alloy-config.alloy:/etc/alloy/config.alloy:ro
      - /var/run/docker.sock:/var/run/docker.sock:ro
      - /var/lib/docker/containers:/var/lib/docker/containers:ro
    env_file: .env.alloy
    restart: unless-stopped

volumes:
  whisper-cache:
```

> **Lưu ý về log rotation:** Mỗi service đều có `logging` config để tránh
> disk 50GB bị đầy sau vài tuần hoạt động liên tục.

---

#### Step 2.3: Tạo Grafana Alloy config

```alloy
// monitoring/alloy-config.alloy

// ─── 1. Thu thập metrics từ Docker containers ───────────────────────────────
prometheus.scrape "backend_core" {
  targets = [{ __address__ = "backend-core:3000" }]
  metrics_path = "/metrics"
  forward_to = [prometheus.remote_write.grafana_cloud.receiver]
}

prometheus.scrape "backend_ai" {
  targets = [{ __address__ = "backend-ai:8000" }]
  metrics_path = "/metrics"
  forward_to = [prometheus.remote_write.grafana_cloud.receiver]
}

// ─── 2. Ship metrics lên Grafana Cloud ──────────────────────────────────────
prometheus.remote_write "grafana_cloud" {
  endpoint {
    url = env("GRAFANA_CLOUD_PROM_URL")
    basic_auth {
      username = env("GRAFANA_CLOUD_PROM_USER")
      password = env("GRAFANA_CLOUD_PROM_API_KEY")
    }
  }
}

// ─── 3. Thu thập logs từ Docker containers ──────────────────────────────────
discovery.docker "containers" {
  host = "unix:///var/run/docker.sock"
}

loki.source.docker "docker_logs" {
  host    = "unix:///var/run/docker.sock"
  targets = discovery.docker.containers.targets
  forward_to = [loki.write.grafana_cloud.receiver]
}

// ─── 4. Ship logs lên Grafana Cloud ─────────────────────────────────────────
loki.write "grafana_cloud" {
  endpoint {
    url = env("GRAFANA_CLOUD_LOKI_URL")
    basic_auth {
      username = env("GRAFANA_CLOUD_LOKI_USER")
      password = env("GRAFANA_CLOUD_LOKI_API_KEY")
    }
  }
}
```

---

#### Step 2.4: Tạo Nginx config

```nginx
# nginx/nginx.conf

# Redirect HTTP → HTTPS
server {
    listen 80;
    server_name _;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl;
    server_name your-domain.com;   # thay bằng domain thật

    ssl_certificate     /etc/nginx/ssl/fullchain.pem;
    ssl_certificate_key /etc/nginx/ssl/privkey.pem;
    ssl_protocols       TLSv1.2 TLSv1.3;

    # backend-core
    location /api/v1/ {
        proxy_pass http://backend-core:3000;
        proxy_set_header Host              $host;
        proxy_set_header X-Real-IP         $remote_addr;
        proxy_set_header X-Forwarded-For   $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        proxy_connect_timeout 60s;
        proxy_send_timeout    60s;
        proxy_read_timeout    60s;
    }

    # backend-ai — timeout dài hơn vì Whisper xử lý audio
    location /ai/ {
        proxy_pass http://backend-ai:8000;
        proxy_set_header Host              $host;
        proxy_set_header X-Real-IP         $remote_addr;
        proxy_set_header X-Forwarded-For   $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        proxy_connect_timeout  60s;
        proxy_send_timeout    120s;
        proxy_read_timeout    120s;    # Whisper có thể mất 30-60s
    }
}
```

> **SSL:** Nếu chưa có domain, dùng IP tạm với HTTP trong Phase 3 để test,
> sau đó thêm domain + Let's Encrypt (Certbot) trước khi go live.

---

### Phase 3 — Deploy và kiểm tra

#### Step 3.1: Pull images và khởi động tuần tự

```bash
cd /opt/app

# Pull tất cả images trước
docker compose pull

# Khởi động từng bước để kiểm tra từng service
docker compose up -d backend-core
docker compose logs -f backend-core
# Chờ thấy: ✅ Database connected | ✅ Redis connected | ✅ RabbitMQ connected

docker compose up -d backend-ai
docker compose logs -f backend-ai
# Chờ thấy: ✅ Whisper model loaded | ✅ Pronunciation consumer started
# (có thể mất 2-3 phút lần đầu do download model)

docker compose up -d nginx alloy
docker compose logs -f alloy
# Chờ thấy: Grafana Alloy started | Sending metrics/logs to Grafana Cloud
```

**Checklist:**
- [ ] `backend-core` log: `✅ Database connected`
- [ ] `backend-core` log: `✅ Redis connected`
- [ ] `backend-core` log: `✅ RabbitMQ connected`
- [ ] `backend-ai` log: `✅ Whisper model loaded`
- [ ] `backend-ai` log: `✅ Pronunciation consumer started`
- [ ] Grafana Alloy UI accessible tại `http://[VM-IP]:12345`
- [ ] Metrics/logs hiển thị trên Grafana Cloud dashboard

---

#### Step 3.2: Test health check

```bash
# Lấy external IP
EXTERNAL_IP=$(gcloud compute instances describe app-vm \
  --zone=asia-southeast1-b \
  --format='value(networkInterfaces[0].accessConfigs[0].natIP)')

# Test qua Nginx
curl http://$EXTERNAL_IP/api/v1/health
# → {"status":"healthy"}

curl http://$EXTERNAL_IP/ai/health
# → {"status":"healthy"}

# Kiểm tra healthcheck container
docker compose ps
# Cột STATUS phải là "healthy" cho cả backend-core và backend-ai
```

---

#### Step 3.3: Đo latency so sánh

```bash
# Đo TTFB từ máy local
curl -o /dev/null -s -w "TTFB: %{time_starttransfer}s\n" \
  http://$EXTERNAL_IP/api/v1/health

# Kỳ vọng: < 50ms (không còn Cloud Run cold start overhead)
```

---

### Phase 4 — Cập nhật CI/CD

#### Step 4.1: Cập nhật deploy.yml

Thay 2 jobs Cloud Run bằng 1 job deploy lên VM, đảm bảo nhất quán SHA tag:

```yaml
deploy-backend:
  needs: changes
  if: |
    needs.changes.outputs.backend-core == 'true' ||
    needs.changes.outputs.backend-ai == 'true'
  runs-on: ubuntu-latest
  env:
    PROJECT_ID: ielts-master-495612
    SHA: ${{ github.sha }}
  steps:
    - uses: actions/checkout@v4

    - uses: google-github-actions/auth@v2
      with:
        credentials_json: ${{ secrets.GCP_SA_KEY }}

    - uses: google-github-actions/setup-gcloud@v2

    - name: Configure Docker for GCR
      run: gcloud auth configure-docker gcr.io

    - name: Build and push changed images
      run: |
        if [ "${{ needs.changes.outputs.backend-core }}" == "true" ]; then
          docker build -t gcr.io/$PROJECT_ID/backend-core:$SHA \
                       -t gcr.io/$PROJECT_ID/backend-core:latest \
                       ./backend-core
          docker push gcr.io/$PROJECT_ID/backend-core:$SHA
          docker push gcr.io/$PROJECT_ID/backend-core:latest
        fi
        if [ "${{ needs.changes.outputs.backend-ai }}" == "true" ]; then
          docker build -t gcr.io/$PROJECT_ID/backend-ai:$SHA \
                       -t gcr.io/$PROJECT_ID/backend-ai:latest \
                       ./backend-ai
          docker push gcr.io/$PROJECT_ID/backend-ai:$SHA
          docker push gcr.io/$PROJECT_ID/backend-ai:latest
        fi

    - name: Deploy to VM
      run: |
        gcloud compute ssh app-vm \
          --zone=asia-southeast1-b \
          --command='
            cd /opt/app
            if [ "${{ needs.changes.outputs.backend-core }}" == "true" ]; then
              docker compose pull backend-core
              docker compose up -d --no-deps backend-core
            fi
            if [ "${{ needs.changes.outputs.backend-ai }}" == "true" ]; then
              docker compose pull backend-ai
              docker compose up -d --no-deps backend-ai
            fi
            # Dọn images cũ, giữ disk sạch
            docker image prune -f
          '
```

---

#### Step 4.2: Cập nhật GitHub Secrets

| Secret | Giá trị mới |
|---|---|
| `NEXT_PUBLIC_API_URL` | `https://your-domain.com/api/v1` |
| `CORS_ORIGIN` | `https://frontend-web-...asia-southeast1.run.app` |

---

### Phase 5 — Dọn dẹp Cloud Run cũ

#### Step 5.1: Xóa Cloud Run backends (giữ frontend)

```bash
# Chỉ xóa SAU KHI VM đã chạy ổn định ít nhất 24h
gcloud run services delete backend-core \
  --region asia-southeast1 --quiet

gcloud run services delete backend-ai \
  --region asia-southeast1 --quiet
```

> ⚠️ **Không xóa vội** — chờ test kỹ, xác nhận tất cả features hoạt động
> đúng trên VM trước khi xóa Cloud Run.

---

### Phase 6 — Setup Grafana Cloud Dashboard & Alerts

#### Step 6.1: Import dashboard có sẵn

Vào **Dashboards → Import** trên Grafana Cloud, dùng ID:

| Dashboard ID | Nội dung |
|---|---|
| **1860** | Node Exporter Full — CPU, RAM, disk VM |
| **13639** | NestJS metrics |
| **15141** | Docker containers |

#### Step 6.2: Tạo alert cơ bản

| Alert | Điều kiện | Kênh thông báo |
|---|---|---|
| High Memory | RAM > 80% trong 5 phút | Email / Slack |
| Service Down | Health check fail 3 lần liên tiếp | Email / Slack |
| Slow Response | TTFB > 1000ms | Email |
| Whisper OOM | backend-ai RAM > 9GB | Email / Slack |

---

## 6. Rollback Plan

Nếu VM gặp vấn đề, rollback về Cloud Run trong < 5 phút:

```bash
gcloud run deploy backend-core \
  --image gcr.io/ielts-master-495612/backend-core:latest \
  --region asia-southeast1 \
  --allow-unauthenticated

gcloud run deploy backend-ai \
  --image gcr.io/ielts-master-495612/backend-ai:latest \
  --region asia-southeast1 \
  --allow-unauthenticated
```

---

## 7. Checklist tổng kết

### Phase 1 — Chuẩn bị VM
- [ ] Tạo VM n2-standard-4 asia-southeast1-b
- [ ] Mở firewall: 80, 443 (public), 12345 (giới hạn IP)
- [ ] Cài Docker + Docker Compose
- [ ] Xác thực GCR
- [ ] Tạo tài khoản Grafana Cloud, lấy credentials

### Phase 2 — Cấu hình
- [ ] Tạo `.env.backend-core`
- [ ] Tạo `.env.backend-ai` (DATABASE_URL port 5432, MAX_WORKERS=2)
- [ ] Tạo `.env.alloy` (Grafana Cloud credentials)
- [ ] Tạo `docker-compose.yml` (với healthcheck + log rotation)
- [ ] Tạo `alloy-config.alloy`
- [ ] Tạo `nginx.conf` (với timeout config)
- [ ] Thêm `.env.*` vào `.gitignore`

### Phase 3 — Deploy & Test
- [ ] Pull images thành công
- [ ] `backend-core` healthy
- [ ] `backend-ai` healthy + Whisper loaded
- [ ] Grafana Alloy gửi data lên Grafana Cloud
- [ ] Health check qua Nginx OK
- [ ] Latency < 50ms từ VN

### Phase 4 — CI/CD
- [ ] Cập nhật `deploy.yml` (tag cả SHA + latest)
- [ ] Cập nhật GitHub Secrets
- [ ] Test push code → tự deploy đúng service
- [ ] Xác nhận `docker image prune` chạy sau mỗi deploy

### Phase 5 — Dọn dẹp
- [ ] Chạy ổn 24h trên VM
- [ ] Xóa `backend-core` Cloud Run
- [ ] Xóa `backend-ai` Cloud Run

### Phase 6 — Grafana Cloud
- [ ] Import dashboards (1860, 13639, 15141)
- [ ] Tạo alerts cơ bản (RAM, service down, slow response, Whisper OOM)

---

## 8. Rủi ro và cách xử lý

| Rủi ro | Khả năng | Xử lý |
|---|---|---|
| VM crash — toàn bộ services down | Thấp | Rollback Cloud Run ngay (< 5 phút) |
| Whisper OOM dù có 10GB limit | Rất thấp | Giảm `MAX_WORKERS=1`, alert Grafana sẽ cảnh báo trước |
| Nginx config sai → 502 | Trung bình | Test kỹ từng endpoint ở Phase 3 trước khi cutover |
| GCR auth hết hạn trên VM | Thấp | `gcloud auth configure-docker gcr.io` lại |
| Disk đầy do logs | Thấp | Log rotation đã config, monitor qua Grafana dashboard |
| Grafana Cloud hết free tier | Rất thấp | 50GB logs + 10k metrics series/tháng — đủ cho giai đoạn này |
| Hết $300 credit sớm | Thấp | Monitor billing hàng tuần trên GCP Console |

---

*Tài liệu này là kế hoạch — thực hiện từng Phase theo thứ tự, không bỏ qua bước kiểm tra.*
*Phiên bản: 2.0 — cập nhật Grafana Alloy, healthcheck, log rotation, SSL, CI/CD fix.*