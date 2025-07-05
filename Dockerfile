# Use an official Node.js image as the base image
FROM node:18-alpine AS base

# Set the working directory
WORKDIR /app

# Install build dependencies for SQLite3
RUN apk add --no-cache python3 make g++ sqlite

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy the application code
COPY . .

# Set next environment to production
ENV NEXT_TELEMETRY_DISABLED 1
ENV NODE_ENV production

# Build the Next.js application with sqlite-specific handling
RUN npm run build

# Use a smaller image for the production build
FROM node:18-alpine AS runner

# Set the working directory
WORKDIR /app

# Install runtime dependencies for SQLite3
RUN apk add --no-cache sqlite-dev

# Copy necessary files from base image
COPY --from=base /app/.next ./.next
COPY --from=base /app/node_modules ./node_modules
COPY --from=base /app/package.json ./package.json
COPY --from=base /app/public ./public
# Initialize an empty SQLite database
RUN mkdir -p /app/data
RUN touch /app/data/cardzen.db

# Set environment variables
ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

# Expose the port the app runs on
EXPOSE 3000

# Run the application
CMD ["npm", "start"]