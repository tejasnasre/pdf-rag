.PHONY: dev prod build-dev build-prod down clean logs logs-app logs-qdrant logs-valkey setup help

# Default environment
ENV ?= development

help:
	@echo "PDF-RAG Server Docker Commands"
	@echo ""
	@echo "Usage:"
	@echo "  make dev           Start development environment"
	@echo "  make prod          Start production environment"
	@echo "  make build-dev     Build development images"
	@echo "  make build-prod    Build production images"
	@echo "  make down          Stop all containers"
	@echo "  make clean         Stop and remove containers, networks, volumes"
	@echo "  make logs          Show logs for all services"
	@echo "  make logs-app      Show logs for the app service"
	@echo "  make logs-qdrant   Show logs for Qdrant"
	@echo "  make logs-valkey   Show logs for Valkey (Redis)"
	@echo "  make setup         Create .env file from example if it doesn't exist"

setup:
	@if [ ! -f .env ]; then \
		echo "Creating .env file from .env.example"; \
		cp .env.example .env; \
		echo "Please update the .env file with your actual values"; \
	else \
		echo ".env file already exists"; \
	fi

dev: setup
	NODE_ENV=development docker-compose up -d

prod: setup
	NODE_ENV=production docker-compose up -d

build-dev:
	NODE_ENV=development docker-compose build

build-prod:
	NODE_ENV=production docker-compose build

down:
	docker-compose down

clean:
	docker-compose down -v

logs:
	docker-compose logs -f

logs-app:
	docker-compose logs -f app

logs-qdrant:
	docker-compose logs -f qdrant

logs-valkey:
	docker-compose logs -f valkey
