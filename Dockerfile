# Stage 1: Build
FROM node:20-alpine as builder

# Install pnpm globally
RUN npm install -g pnpm

WORKDIR /app

# Copy package files and install dependencies
COPY package.json pnpm-lock.yaml ./
RUN pnpm install

# Copy application code and build
COPY . .
RUN pnpm run build

# Stage 2: Run
FROM node:20-alpine

# Install pnpm globally
RUN npm install -g pnpm

WORKDIR /app

# Copy only necessary files for production
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --prod

# Copy build files from the builder stage
COPY --from=builder /app/dist ./dist

# Command to run the application
CMD ["node", "dist/main.js"]
