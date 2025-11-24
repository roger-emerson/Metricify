# Metricify Makefile
# Quick commands for Docker management

.PHONY: help dev prod up down logs clean db-init festival-sync

help: ## Show this help message
	@echo "Metricify - Docker Commands"
	@echo "============================"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-20s\033[0m %s\n", $$1, $$2}'

dev: ## Start development environment (PostgreSQL + pgAdmin)
	docker-compose -f docker-compose.dev.yml up -d
	@echo "✅ Development environment started!"
	@echo "   PostgreSQL: localhost:5432"
	@echo "   pgAdmin: http://localhost:5050"

dev-postgres: ## Start only PostgreSQL for local development
	docker-compose -f docker-compose.dev.yml up postgres -d
	@echo "✅ PostgreSQL started on localhost:5432"
	@echo "   Run 'npm run dev' to start Next.js locally"

prod: ## Start production environment
	docker-compose up -d --build
	@echo "✅ Production environment started!"
	@echo "   Application: http://localhost:3000"

up: prod ## Alias for prod

down: ## Stop all services
	docker-compose down
	docker-compose -f docker-compose.dev.yml down
	@echo "✅ All services stopped"

clean: ## Stop services and remove volumes
	docker-compose down -v
	docker-compose -f docker-compose.dev.yml down -v
	@echo "⚠️  All data removed!"

logs: ## Show logs (use 'make logs SERVICE=postgres' for specific service)
	@if [ -z "$(SERVICE)" ]; then \
		docker-compose logs -f; \
	else \
		docker-compose logs -f $(SERVICE); \
	fi

db-init: ## Initialize database schema
	@echo "Initializing database..."
	docker exec metricify-app npm run db:init
	@echo "✅ Database initialized!"

db-shell: ## Open PostgreSQL shell
	docker exec -it metricify-postgres psql -U metricify_user -d metricify

db-backup: ## Backup database to backups/
	@mkdir -p backups
	@TIMESTAMP=$$(date +%Y%m%d_%H%M%S); \
	docker exec metricify-postgres pg_dump -U metricify_user metricify > backups/metricify_$$TIMESTAMP.sql; \
	echo "✅ Backup created: backups/metricify_$$TIMESTAMP.sql"

db-restore: ## Restore database from backup (use BACKUP=filename)
	@if [ -z "$(BACKUP)" ]; then \
		echo "❌ Please specify BACKUP=filename"; \
		echo "   Example: make db-restore BACKUP=backups/metricify_20250123_120000.sql"; \
	else \
		cat $(BACKUP) | docker exec -i metricify-postgres psql -U metricify_user -d metricify; \
		echo "✅ Database restored from $(BACKUP)"; \
	fi

festival-sync: ## Sync festival data from EDMTrain
	docker exec metricify-app npm run festivals:sync
	@echo "✅ Festival data synced!"

interest-calc: ## Calculate user festival interests
	docker exec metricify-app npm run interests:calculate
	@echo "✅ Interests calculated!"

cache-clear: ## Clear API cache
	docker exec metricify-app npm run cache:clear
	@echo "✅ Cache cleared!"

shell: ## Access app container shell
	docker exec -it metricify-app sh

rebuild: ## Rebuild and restart services
	docker-compose up -d --build --force-recreate
	@echo "✅ Services rebuilt!"

status: ## Show container status
	@echo "Development containers:"
	@docker-compose -f docker-compose.dev.yml ps
	@echo "\nProduction containers:"
	@docker-compose ps

reset: clean prod db-init ## Full reset: clean, rebuild, and initialize
	@echo "✅ Full reset complete!"
