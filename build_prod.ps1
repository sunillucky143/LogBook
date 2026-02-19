# Build Script for OCI Deployment (Windows -> Linux/ARM64)

Write-Host "🚧 Starting Build Process..." -ForegroundColor Cyan

# 1. Build Frontend
Write-Host "`n📦 Building Frontend..." -ForegroundColor Yellow
Set-Location "frontend"
npm run build
if ($LASTEXITCODE -ne 0) { Write-Error "Frontend build failed"; exit 1 }
Set-Location ".."

# 2. Build Backend (Cross-Compile for Linux ARM64)
Write-Host "`n🔥 Building Backend (Linux/ARM64)..." -ForegroundColor Yellow
$env:GOOS = "linux"
$env:GOARCH = "arm64"
$env:CGO_ENABLED = "0"

Set-Location "backend"
go build -ldflags="-w -s" -o server_linux_arm64 ./cmd/server/main.go
if ($LASTEXITCODE -ne 0) { Write-Error "Backend build failed"; exit 1 }

# Reset env vars (optional, but good practice in current session)
$env:GOOS = $null
$env:GOARCH = $null
$env:CGO_ENABLED = $null

Write-Host "`n✅ Build Complete!" -ForegroundColor Green
Write-Host "Files ready to upload:"
Write-Host "  - backend/server_linux_arm64"
Write-Host "  - frontend/dist/"
Set-Location ".."
