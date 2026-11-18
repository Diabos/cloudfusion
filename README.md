# CloudFusion ☁️🔀

> **An explainable adaptive multi-account cloud storage orchestration system.**

CloudFusion is an incremental academic extension of the open-source CloudMerge project. It preserves the original Google Drive workflow and adds selectable first-fit, round-robin and adaptive placement plus a deterministic storage simulator.

CloudMerge solves the problem of fragmented cloud storage. Instead of manually juggling multiple Google accounts with 15 GB quotas and encountering "storage full" errors, CloudMerge treats your connected Google accounts as a single, unified drive.

---

## 🚀 Key Highlights

- **Unified Drive Interface**: Browse, create folders, rename, delete, and download files across all accounts in a single file explorer.
- **Explainable placement**: Choose first-fit, round-robin or adaptive scoring for each upload.
- **Safe simulator**: Compare all algorithms without OAuth or real cloud mutations.
- **Automatic Quota Failover**: If an account exhausts its storage mid-upload (`storageQuotaExceeded`), the upload service catches the error and retries the next best candidate automatically.
- **Drive-specific quota tracking**: Storage analytics use Google Drive usage rather than organization-wide Workspace usage.
- **Bank-Grade Security**:
  - Google OAuth access and refresh tokens are **encrypted at rest** using **AES-256-GCM** with authenticated checksums.
  - User authentication with short-lived JWTs and bcrypt-hashed refresh token rotation.
- **Modern Full-Stack Architecture**: React 19 + TypeScript frontend with an Express + Prisma + MySQL backend.

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: React 19 + TypeScript + Vite
- **State & Theme**: Custom CSS Variables, reactive context providers
- **Icons**: SVG sprite system

### Backend
- **Runtime**: Node.js + Express + TypeScript
- **ORM & Database**: Prisma ORM with MySQL
- **Integrations**: Google Drive API (`googleapis`, `google-auth-library`)
- **Security**: AES-256-GCM token encryption, JWT with rotation, bcrypt

---

## 🏛️ System Architecture

```text
User / Browser (React 19 Dashboard)
         │
         │ REST API (JWT Authenticated)
         ▼
Express + TypeScript Backend
         ├── Auth Service (Bcrypt + Token Rotation)
         ├── Upload Service ──► Strategy Selector (mostFreeSpaceStrategy)
         │                           │
         ├── File / Folder Service   ▼
         │                 Google Drive Client (AES-256-GCM Decryption)
         ▼                           │
Prisma ORM (MySQL)                   ▼
                           Google Drive API (Multi-account)
```

---

## 🚦 Getting Started

### Prerequisites
- Node.js 18+
- MySQL database
- Google Cloud project with Google Drive API enabled and OAuth credentials

### 1. Clone & Install
```bash
git clone https://github.com/LOVENISH87/CloudMerge.git
cd CloudMerge

# Install backend dependencies
cd backend && npm install

# Install frontend dependencies
cd ../frontend && npm install
```

### 2. Configure Environment Variables
Copy `.env.example` in `backend` and fill in your values:
```env
PORT=4000
DATABASE_URL="mysql://user:password@localhost:3306/cloudmerge"
JWT_ACCESS_SECRET="your_access_secret"
JWT_REFRESH_SECRET="your_refresh_secret"
TOKEN_ENCRYPTION_KEY="your_32_byte_encryption_key"
GOOGLE_CLIENT_ID="your_google_client_id"
GOOGLE_CLIENT_SECRET="your_google_client_secret"
GOOGLE_REDIRECT_URI="http://localhost:4000/connected-accounts/google/callback"
FRONTEND_URL="http://localhost:5173"
```

In `frontend`, configure `.env`:
```env
VITE_API_URL="http://localhost:4000"
```

### 3. Run Migrations & Start Development
```bash
# In backend/
npx prisma migrate dev
npm run dev

# In frontend/
npm run dev
```

### 4. Free deployment

CloudFusion needs a frontend, a persistent Node backend, and a MySQL-compatible database:

1. Push this repository to a private GitHub repository.
2. Create a free TiDB Cloud Starter MySQL-compatible cluster and copy its connection string.
3. In Render, create a Blueprint from `render.yaml`. Set `DATABASE_URL`, `TOKEN_ENCRYPTION_KEY`, Google OAuth values, and the final Vercel URL.
4. Deploy the `frontend` directory as a Vercel project with `VITE_API_URL` set to the Render API URL.
5. In Google Cloud OAuth, set the callback to:
   `https://<render-service>.onrender.com/connected-accounts/google/callback`
6. Set the same production frontend URL in Render as `FRONTEND_URL`.

The backend runs Prisma migrations during startup. Never commit `.env` files or OAuth secrets.

---

## 🧪 Testing
```bash
cd backend
npm test
```

See [ARCHITECTURE.md](./ARCHITECTURE.md), [ALGORITHM.md](./ALGORITHM.md), [INSTALLATION.md](./INSTALLATION.md), [TESTING.md](./TESTING.md), and [PROJECT_REPORT.md](./PROJECT_REPORT.md) for the academic implementation details and current limitations.

---

## 📄 License
MIT
