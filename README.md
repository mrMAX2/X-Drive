# X-Drive — Secure Cloud Storage

> A **Google Drive–style** distributed cloud storage system built with Spring Boot, React, PostgreSQL, and MinIO.

---

## 🏗️ Architecture

```
Browser → React (port 3000)
              ↓ /api/* (Nginx proxy)
         Spring Boot (port 8080)
              ↓ JWT Auth      ↓ File Storage
         PostgreSQL        MinIO (S3-compatible)
         (port 5432)       (port 9000)
```

## ✅ Features Implemented

| Feature | Status |
|---|---|
| Register / Login | ✅ |
| JWT Authentication | ✅ |
| File Upload (up to 100 MB) | ✅ |
| File Download | ✅ |
| My Files (`GET /api/files/my-files`) | ✅ |
| File Delete | ✅ |
| File Sharing (public links) | ✅ |
| Ownership-based access control | ✅ |
| MinIO S3 object storage | ✅ |
| PostgreSQL persistence | ✅ |
| Docker + Docker Compose | ✅ |

---

## 🚀 Quick Start (Docker — Recommended)

### Prerequisites
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) installed and running

### 1. Clone / open the project
```bash
cd xdrive
```

### 2. Build & Start all services
```bash
docker compose up --build
```

> First build takes ~3–5 minutes (downloads Maven deps + npm packages).

### 3. Open the app
| Service | URL |
|---|---|
| **Frontend (App)** | http://localhost:3000 |
| **Backend API** | http://localhost:8080/api/health |
| **MinIO Console** | http://localhost:9001 (admin: `minioadmin` / `minioadmin`) |

### 4. Stop
```bash
docker compose down
```
To also delete stored data (database + files):
```bash
docker compose down -v
```

---

## 🔧 Local Development (Without Docker)

### Prerequisites
- Java 17+
- Maven 3.9+
- Node.js 20+
- PostgreSQL 15 running locally
- MinIO running locally

### Backend
```bash
cd backend
# Set environment variables or edit application.properties
mvn spring-boot:run
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```
Frontend runs at http://localhost:5173, proxies `/api` to `http://localhost:8080`.

---

## 📡 API Reference

### Auth (no JWT needed)
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/register` | Create account |
| POST | `/api/auth/login` | Login, returns JWT |
| GET | `/api/health` | Health check |

### Files (JWT required: `Authorization: Bearer <token>`)
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/files/upload` | Upload a file |
| GET | `/api/files/my-files` | List your files |
| GET | `/api/files/{id}` | Download file |
| DELETE | `/api/files/{id}` | Delete file |
| POST | `/api/files/{id}/share` | Generate share link |
| GET | `/api/files/shared/{token}` | Download via share link (public) |

### Response Format
```json
{
  "status": "success",
  "data": {},
  "message": "Operation result"
}
```

---

## 🔒 Security Rules
1. **No hardcoded users** — always resolved from `SecurityContextHolder`
2. **Ownership enforced** — every file operation validates the owner
3. **JWT stateless** — no sessions, no cookies
4. **Public endpoints** — only `/api/auth/**`, `/api/health`, `/api/files/shared/**`

---

## 🌐 Production Deployment Notes

Before deploying to production, change these in `docker-compose.yml`:

```yaml
JWT_SECRET: <generate a 256-bit random string>
POSTGRES_PASSWORD: <strong password>
MINIO_ROOT_PASSWORD: <strong password>
```

Generate a secure JWT secret:
```bash
openssl rand -base64 64
```
