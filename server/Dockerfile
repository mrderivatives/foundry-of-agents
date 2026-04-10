FROM golang:1.24-alpine AS builder
WORKDIR /app
COPY go.mod go.sum ./
RUN go mod download
COPY . .
RUN CGO_ENABLED=0 go build -o server ./cmd/server
RUN CGO_ENABLED=0 go build -o worker ./cmd/worker
RUN CGO_ENABLED=0 go build -o migrate ./cmd/migrate

FROM alpine:3.20
RUN apk add --no-cache ca-certificates poppler-utils
WORKDIR /app
COPY --from=builder /app/server /app/worker /app/migrate ./
COPY --from=builder /app/migrations ./migrations
COPY start.sh ./
RUN chmod +x start.sh
EXPOSE 8080
CMD ["./start.sh"]
