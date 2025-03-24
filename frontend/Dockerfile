# Stage 1: Building the app
FROM node:20-alpine AS builder
 
# Set the working directory in the Docker container
WORKDIR /app

# Install pnpm globally
RUN npm install -g pnpm

# Copy package files first (for better caching)
COPY package*.json pnpm-lock.yaml ./
# COPY pnpm-lock.yaml ./

# Install dependencies
RUN --mount=type=cache,target=/root/.local/share/pnpm/store \
    pnpm install && \
    pnpm cache clean
# Copy the rest of the code
COPY . .

# Expose port 3000
EXPOSE 3000

# Start development server
CMD ["pnpm", "dev"]