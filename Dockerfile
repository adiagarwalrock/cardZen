# Use an official Node.js image as the base image
FROM node:18-alpine AS base

# Set the working directory
WORKDIR /app

# Install build dependencies
RUN apk add --no-cache python3 make g++

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy the application code
COPY . .

# Set next environment to production
ENV NEXT_TELEMETRY_DISABLED 1
ENV NODE_ENV production

# Build the Next.js application
RUN npm run build

# Use a smaller image for the production build
FROM node:18-alpine AS runner

# Set the working directory
WORKDIR /app

# Copy necessary files from base image
COPY --from=base /app/.next ./.next
COPY --from=base /app/node_modules ./node_modules
COPY --from=base /app/package.json ./package.json
COPY --from=base /app/public ./public
COPY --from=base /app/src ./src

# Create data directory for JSON files
RUN mkdir -p /app/data/json

# Set environment variables
ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

# Create non-root user and give proper permissions
RUN addgroup -g 1001 -S nodejs && \
    adduser -S -u 1001 -G nodejs nextjs && \
    chown -R nextjs:nodejs /app

# Set the working directory permissions
RUN chown -R nextjs:nodejs /app/data

# Change to non-root user
USER nextjs

# Expose the port the app runs on
EXPOSE 3000

# Create a volume for persistent data storage
VOLUME ["/app/data"]

# Run the application
CMD ["npm", "start"]