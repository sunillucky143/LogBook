# Build Script for OCI Deployment (Windows -> Linux/AMD64)

Write-Host "🚧 Building Backend for Linux/AMD64..." -ForegroundColor Cyan

$env:GOOS = "linux"
$env:GOARCH = "amd64"
$env:CGO_ENABLED = "0"

Set-Location "backend"
go build -ldflags="-w -s" -o server_linux_amd64 ./cmd/server/main.go
if ($LASTEXITCODE -ne 0) { Write-Error "Backend build failed"; exit 1 }

# Reset env vars
$env:GOOS = $null
$env:GOARCH = $null
$env:CGO_ENABLED = $null

Set-Location ".."

Write-Host "`n✅ Build Complete!" -ForegroundColor Green
Write-Host "File ready to upload:"
Write-Host "  - backend/server_linux_amd64"
