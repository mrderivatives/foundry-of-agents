package main

import (
	"context"
	"fmt"
	"os"
	"path/filepath"
	"sort"
	"strings"

	"github.com/jackc/pgx/v5"
	"github.com/rs/zerolog"
	"github.com/rs/zerolog/log"
)

func main() {
	zerolog.TimeFieldFormat = zerolog.TimeFormatUnix
	log.Logger = zerolog.New(os.Stdout).With().Timestamp().Caller().Logger()

	dbURL := os.Getenv("DATABASE_URL")
	if dbURL == "" {
		log.Fatal().Msg("DATABASE_URL is required")
	}

	ctx := context.Background()

	conn, err := pgx.Connect(ctx, dbURL)
	if err != nil {
		log.Fatal().Err(err).Msg("failed to connect to database")
	}
	defer conn.Close(ctx)

	_, err = conn.Exec(ctx, `
		CREATE TABLE IF NOT EXISTS schema_migrations (
			version TEXT PRIMARY KEY,
			applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
		)
	`)
	if err != nil {
		log.Fatal().Err(err).Msg("failed to create schema_migrations table")
	}

	migrationsDir := "migrations"
	if len(os.Args) > 1 {
		migrationsDir = os.Args[1]
	}

	entries, err := os.ReadDir(migrationsDir)
	if err != nil {
		log.Fatal().Err(err).Str("dir", migrationsDir).Msg("failed to read migrations directory")
	}

	var files []string
	for _, e := range entries {
		if strings.HasSuffix(e.Name(), ".up.sql") {
			files = append(files, e.Name())
		}
	}
	sort.Strings(files)

	for _, f := range files {
		version := strings.TrimSuffix(f, ".up.sql")

		var exists bool
		err := conn.QueryRow(ctx, "SELECT EXISTS(SELECT 1 FROM schema_migrations WHERE version = $1)", version).Scan(&exists)
		if err != nil {
			log.Fatal().Err(err).Str("version", version).Msg("failed to check migration")
		}
		if exists {
			log.Info().Str("version", version).Msg("already applied, skipping")
			continue
		}

		sql, err := os.ReadFile(filepath.Join(migrationsDir, f))
		if err != nil {
			log.Fatal().Err(err).Str("file", f).Msg("failed to read migration file")
		}

		tx, err := conn.Begin(ctx)
		if err != nil {
			log.Fatal().Err(err).Msg("failed to begin transaction")
		}

		if _, err := tx.Exec(ctx, string(sql)); err != nil {
			_ = tx.Rollback(ctx)
			log.Fatal().Err(err).Str("version", version).Msg("migration failed")
		}

		if _, err := tx.Exec(ctx, "INSERT INTO schema_migrations (version) VALUES ($1)", version); err != nil {
			_ = tx.Rollback(ctx)
			log.Fatal().Err(err).Str("version", version).Msg("failed to record migration")
		}

		if err := tx.Commit(ctx); err != nil {
			log.Fatal().Err(err).Str("version", version).Msg("failed to commit migration")
		}

		fmt.Printf("Applied: %s\n", version)
	}

	log.Info().Msg("all migrations applied")
}
