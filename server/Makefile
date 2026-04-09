.PHONY: dev worker build migrate-up test lint sqlc setup

dev:
	go run cmd/server/main.go

worker:
	go run cmd/worker/main.go

build:
	go build -o bin/server cmd/server/main.go
	go build -o bin/worker cmd/worker/main.go

migrate-up:
	go run cmd/migrate/main.go

test:
	go test ./...

lint:
	golangci-lint run

sqlc:
	sqlc generate

setup:
	go mod download
