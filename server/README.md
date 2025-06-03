# PDF-RAG Server

This is the server component of the PDF-RAG application that allows users to chat with their PDF documents using Retrieval Augmented Generation.

## Docker Setup

### Prerequisites
- Docker and Docker Compose installed
- Mistral AI API key

### Getting Started

1. **Set up environment variables**

   Copy the example environment file and add your Mistral API key:
   ```
   make setup
   ```
   
   Then edit the `.env` file and add your Mistral API key.

2. **Build and start the Docker containers**

   For development:
   ```
   make dev
   ```

   For production:
   ```
   make prod
   ```

3. **Access the application**

   The server will be available at: http://localhost:8080

## Running the Server with Docker

### 1. Using Docker Compose

The easiest way to run the application is using Docker Compose with our prepared configuration:

```bash
# Start all services in development mode
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up -d

# Start all services in production mode
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d
```

### 2. Environment Variables

There are several ways to pass environment variables to the Docker containers:

#### a) Using .env file (Recommended)

Create a `.env` file in the project root:

```bash
cp .env.example .env
# Edit .env file with your values
nano .env  # or use your preferred editor
```

Docker Compose will automatically load variables from this file.

#### b) Using command line

```bash
MISTRAL_API_KEY=your_api_key_here docker-compose up -d
```

#### c) Modifying docker-compose.yml

Edit the `environment` section in docker-compose.yml directly (not recommended for secrets).

### 3. Building Docker Images

If you've made changes to the code and need to rebuild:

```bash
# Build for development
docker-compose -f docker-compose.yml -f docker-compose.dev.yml build

# Build for production
docker-compose -f docker-compose.yml -f docker-compose.prod.yml build
```

### 4. Managing Containers

```bash
# Stop all containers
docker-compose down

# Stop and remove volumes (data will be lost)
docker-compose down -v

# View logs
docker-compose logs -f

# Restart a specific service
docker-compose restart app
```

### 5. Accessing Container Shell

```bash
# Get a shell inside the app container
docker-compose exec app sh
```

### 6. Data Persistence

- PDF uploads are stored in the `./uploads` directory which is mounted as a volume
- Qdrant data is persisted using a named volume (`qdrant-data`)
- Valkey/Redis data is persisted using a named volume (`valkey-data`)

### Docker Commands

Use the Makefile for easier command execution:

- Start development environment:
  ```
  make dev
  ```

- Start production environment:
  ```
  make prod
  ```

- Build development images:
  ```
  make build-dev
  ```

- Build production images:
  ```
  make build-prod
  ```

- Stop containers:
  ```
  make down
  ```

- Clean up everything (including volumes):
  ```
  make clean
  ```

- View logs:
  ```
  make logs
  make logs-app
  make logs-qdrant
  make logs-valkey
  ```

## Troubleshooting Docker Issues

### Container won't start

Check for errors in the logs:
```bash
docker-compose logs app
```

### Can't connect to services

Ensure all services are running:
```bash
docker-compose ps
```

### Check network connectivity between containers

Access a container and ping other services:
```bash
docker-compose exec app sh
ping valkey
ping qdrant
```

### Redis connection issues

Test the Redis connection:
```bash
docker-compose exec valkey redis-cli ping
```

### Qdrant connection issues

Test the Qdrant API:
```bash
curl http://localhost:6333/collections
```

### Port conflicts

If you have port conflicts, change the mapping in docker-compose.yml:
```yaml
ports:
  - "8081:8080"  # Now accessible via port 8081
```

## Architecture

The Docker setup includes:

- **API Server**: Node.js/Express server handling API requests
- **Worker Process**: Background worker for processing PDF documents
- **Qdrant**: Vector database for document embeddings
- **Valkey**: Redis-compatible message broker for job queues

The application runs in a single container with two processes (API and worker) for simplicity, but can be split into separate services for better scalability.

## Development Without Docker

If you prefer to run the application without Docker:

1. Start Valkey (Redis) and Qdrant separately
2. Configure the `.env` file with their connection details
3. Run:
   ```
   npm install
   npm run dev
   ```
   
4. In another terminal, start the worker:
   ```
   npm run dev:worker
   ```

## API Endpoints

- `POST /upload/pdf`: Upload a PDF file
- `GET /chat?message=your_question`: Ask a question about the uploaded PDF
- `GET /pdf/:filename`: Retrieve a PDF file

## Environment Variables

- `MISTRAL_API_KEY`: API key for Mistral AI
- `QDRANT_URL`: URL for Qdrant vector database
- `REDIS_HOST`: Hostname for Redis/Valkey
- `REDIS_PORT`: Port for Redis/Valkey
- `NODE_ENV`: Environment (development/production)
- `PORT`: Server port (default: 8080)
- `QDRANT_COLLECTION_NAME`: Name of collection in Qdrant
