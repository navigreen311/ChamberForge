# ChamberForge — Local Development Setup

Complete guide to running ChamberForge locally for development.

## Prerequisites

| Tool | Version | Install |
|------|---------|---------|
| Python | 3.12+ | [python.org](https://www.python.org/downloads/) |
| Node.js | 20+ | [nodejs.org](https://nodejs.org/) |
| Docker | 24+ | [docker.com](https://www.docker.com/get-started) |
| Git | 2.40+ | [git-scm.com](https://git-scm.com/) |

## 1. Clone the Repository

```bash
git clone https://github.com/your-org/chamberforge.git
cd chamberforge
```

## 2. Environment Variables

Copy the example environment file and fill in your keys:

```bash
cp .env.example .env
```

At minimum, set these for local development:

```
DATABASE_URL=postgresql://chamberforge:localdev@localhost:5432/chamberforge
REDIS_URL=redis://localhost:6379
JWT_SECRET=local-dev-secret-change-in-production
ANTHROPIC_API_KEY=sk-ant-...  # Required for AI features
```

## 3. Start Infrastructure Services

Docker Compose runs PostgreSQL, Redis, and Elasticsearch:

```bash
docker compose up -d
```

Verify services are healthy:

```bash
docker compose ps
```

Expected output shows `db`, `redis`, and `elasticsearch` all running.

## 4. Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv .venv

# Activate it
# Linux/macOS:
source .venv/bin/activate
# Windows:
.venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Return to repo root and seed the database
cd ..
python -m scripts.seed
```

The seed script creates tables, demo workspace, users, playbooks, sample problems, offers, clients, evidence, and notifications.

## 5. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Create local env (optional — defaults work for local dev)
cat > .env.local << 'EOF'
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=local-dev-secret
EOF
```

## 6. Run the Application

Open two terminal windows:

**Terminal 1 — Backend (FastAPI):**

```bash
cd backend
source .venv/bin/activate   # or .venv\Scripts\activate on Windows
uvicorn app.main:app --reload --port 8000
```

**Terminal 2 — Frontend (Next.js):**

```bash
cd frontend
npm run dev
```

Or use the Makefile shortcut:

```bash
make dev
```

## 7. Access the Application

| Service | URL |
|---------|-----|
| Frontend | [http://localhost:3000](http://localhost:3000) |
| API Docs (Swagger) | [http://localhost:8000/api/docs](http://localhost:8000/api/docs) |
| API Docs (ReDoc) | [http://localhost:8000/api/redoc](http://localhost:8000/api/redoc) |
| Health Check | [http://localhost:8000/api/health](http://localhost:8000/api/health) |

## 8. Test Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | `admin@chamberforge.dev` | `changeme123` |
| Operator | `operator@chamberforge.dev` | `changeme123` |

## Common Tasks

### Reset the database

```bash
bash scripts/reset_db.sh
```

### Run tests

```bash
make test
```

### Run linters

```bash
make lint
```

### Stop all Docker services

```bash
docker compose down
```

### Stop and remove all data

```bash
docker compose down -v
```

## Troubleshooting

**Port 5432 already in use:**
Stop any local PostgreSQL service, or change the port in `docker-compose.yml`.

**Python module not found errors:**
Make sure your virtualenv is activated and you installed requirements: `pip install -r requirements.txt`.

**Frontend can't reach backend:**
Ensure `NEXT_PUBLIC_API_URL=http://localhost:8000` is set in `frontend/.env.local`.

**Database connection refused:**
Run `docker compose ps` to verify the `db` container is running and healthy.
