# Stage 1: Build
FROM node:20.9.0-alpine as builder

# Install pnpm globally
RUN npm install -g pnpm

WORKDIR /app

# Copy package files and install dependencies
COPY package.json pnpm-lock.yaml ./
RUN pnpm install

# Rebuild bcrypt for the container's architecture
RUN pnpm rebuild bcrypt

# Copy application code and build
COPY . .

# Generate Prisma client
RUN pnpm prisma generate

# Build app
RUN pnpm run build

# Stage 2: Run
FROM node:20.9.0-alpine

# Install pnpm globally
RUN npm install -g pnpm

WORKDIR /app

# Copy only necessary files for production
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --prod

# Copy build files from the builder stage
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules ./node_modules

# Command to run the application
CMD ["pnpm", "start:prod"]
