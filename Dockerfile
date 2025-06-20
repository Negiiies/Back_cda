# Stage 1: Build
FROM node:18-alpine AS builder
WORKDIR /app

# Copy package files
COPY package.json yarn.lock ./
# Install ALL dependencies (including dev)
RUN yarn install --frozen-lockfile

# Copy source code
COPY . .
# Build the application
RUN yarn build

# Stage 2: Production
FROM node:18-alpine AS production
WORKDIR /app

# Copy package files
COPY package.json yarn.lock ./
# Install ONLY production dependencies
RUN yarn install --production --frozen-lockfile && yarn cache clean

# Copy built application from builder stage
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/src ./src

# Set environment
EXPOSE 3000
ENV PORT=3000

# Start the application
CMD ["node", "dist/app.js"]