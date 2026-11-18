# Installation

Requirements: Node.js 18+, MySQL, and Google Drive API OAuth credentials for real uploads. The simulator works without Google credentials.

1. Copy `backend/.env.example` to `backend/.env` and set a MySQL `DATABASE_URL`, JWT secrets, a 32-byte token encryption key, and Google OAuth values.
2. Install and initialize the backend:

```powershell
cd backend
npm install
npx prisma migrate dev
npm run dev
```

3. In a second terminal install and run the frontend:

```powershell
cd frontend
npm install
npm run dev
```

Set `VITE_API_URL=http://localhost:4000` in `frontend/.env` if the API is not at the default configured URL.
