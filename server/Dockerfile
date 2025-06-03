FROM node:18-alpine

WORKDIR /app

# Copy package files first for better caching
COPY package*.json ./

# Set NODE_ENV based on build argument
ARG NODE_ENV=production
ENV NODE_ENV=$NODE_ENV

# Install dependencies based on NODE_ENV
RUN if [ "$NODE_ENV" = "production" ]; then \
        npm ci --only=production; \
    else \
        npm install; \
    fi

# Copy the rest of the application
COPY . .

# Set proper permissions for the startup script
RUN mkdir -p uploads && \
    chmod +x startup.sh

EXPOSE 8080

# Use different CMD based on environment
CMD ["./startup.sh"]
