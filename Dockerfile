# Use an official Node.js image as the base image
FROM node:latest as base

# Set the working directory
WORKDIR /app

# Copy the package.json and package-lock.json files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Build the Next.js application
RUN npm run build

# Use a smaller image for the production build
FROM node:slim as runner

# Set the working directory
WORKDIR /app

# Copy the built application from the base image
COPY --from=base /app/.next ./.next
COPY --from=base /app/node_modules ./node_modules
COPY --from=base /app/package.json ./package.json
COPY --from=base /app/public ./public
# Copy the SQLite database file
COPY --from=base /app/cardzen.db ./cardzen.db


# Expose the port the app runs on
EXPOSE 3000

# Run the application
CMD ["npm", "start"]