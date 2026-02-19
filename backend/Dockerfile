# Build Stage
FROM golang:1.22-alpine AS builder

WORKDIR /app

# Install build dependencies
RUN apk add --no-cache git

# Copy module files first (caching)
COPY go.mod go.sum ./
RUN go mod download

# Copy source code
COPY . .

# Build for Linux/ARM64 (OCI Ampere)
# CGO_ENABLED=0 creates a statically linked binary
RUN CGO_ENABLED=0 GOOS=linux GOARCH=arm64 go build -ldflags="-w -s" -o server ./cmd/server/main.go

# Runtime Stage
FROM alpine:latest

WORKDIR /root/

# Install CA certificates for HTTPS
RUN apk --no-cache add ca-certificates tzdata

# Copy binary from builder
COPY --from=builder /app/server .
# Copy templates if you have any (adjust path if needed)
# COPY --from=builder /app/internal/templates ./internal/templates

EXPOSE 8080

CMD ["./server"]
