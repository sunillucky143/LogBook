# LogBook
A smart work-tracking and documentation tool built for students doing volunteering or unpaid work. Track hours with auto-stop scheduling, log structured entries, and generate date-based summaries instantly. No messy folders, no lost records just clean proof of your contributions, ready to showcase anytime.

**Time-tracking & documentation platform built for OPT students, interns, and volunteers.**  

Log Book helps students track unpaid work hours, maintain structured documentation, and generate clean summaries for reporting, showcasing, or compliance purposes.

No messy folders.  
No lost records.  
No manual reconstruction of timelines.  

Just focus on your work, we handle the rest.

---

## ✨ Features

- ⏱ Smart time tracking with optional auto-stop scheduling  
- 📝 Structured log entries with persistent documentation  
- 📊 Date-range work summaries  
- 📂 Organized storage (no chaotic file naming)  
- 🔐 Secure authentication via Clerk  
- ☁️ Media storage via Cloudflare R2  
- 🗄 PostgreSQL-backed API  

---

## 🏗 Project Structure
```
log_book/
├── backend/ # Go API server
├── frontend/ # React + Vite frontend
├── agents/ # Agent definitions
└── docs/ # Design documentation
```

---

## 🛠 Tech Stack

**Backend**
- Go (1.21+)
- PostgreSQL
- Clerk (Auth)
- Cloudflare R2 (Storage)

**Frontend**
- React
- Vite
- Clerk Authentication

---

## 🚀 Getting Started

### Prerequisites

- Go 1.21+
- Node.js 18+
- PostgreSQL
- Clerk account
- Cloudflare R2 bucket

---

## ⚙️ Backend Setup

```bash
cd backend
cp .env.example .env  # configure your environment variables
go run cmd/server/main.go
```

## 💻 Frontend Setup

```bash
cd frontend
cp .env.example .env  # configure your environment variables
npm install
npm run dev
```

## 🔐 Environment Variables
# Backend
- Variable	Description
- DATABASE_URL	PostgreSQL connection string
- CLERK_SECRET_KEY	Clerk secret key for authentication
- R2_ACCOUNT_ID	Cloudflare R2 account ID
- R2_ACCESS_KEY_ID	R2 access key
- R2_SECRET_ACCESS_KEY	R2 secret key
- R2_BUCKET_NAME	R2 bucket name
# Frontend
- Variable	Description
- VITE_API_URL	Backend API URL (default: http://localhost:8080)
- VITE_CLERK_PUBLISHABLE_KEY	Clerk publishable key

## 🌱 Contributing
We welcome contributions from students, developers, and open-source enthusiasts.

## Ways to contribute:
Improve UI/UX
- Add export formats (PDF, DOCX)
- Improve summary generation
- Add analytics dashboards
- Enhance documentation
- Add testing coverage
Please open an issue first to discuss major changes.

## 📜 License
This project is licensed under the MIT License.
see License [here](LICENSE)
