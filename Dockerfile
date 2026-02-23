# Use an official Node runtime as the base image
FROM node:20.10-alpine

# Install PostgreSQL client and netcat
RUN apk add --no-cache netcat-openbsd postgresql-client

# Set the working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

RUN rm -rf node_modules && rm -rf .cache && npm cache clean --force

# Install ALL dependencies (including devDeps needed for build like tailwindcss)
# Explicitly set NODE_ENV=development here so npm ci includes devDependencies
RUN NODE_ENV=development npm ci

# Ensure local bin is on PATH so tailwindcss and other devDep binaries are found
ENV PATH /app/node_modules/.bin:$PATH

# Copy the rest of the application code
COPY . .

# Generate Prisma Client
RUN npx prisma generate

RUN ls -la

# Build the application
RUN npm run build

# Copy the entrypoint script after copying the rest of the code
# COPY entrypoint.sh ./

# Ensure Unix-style line endings (in case the file was created on Windows)
# RUN sed -i 's/\r$//' ./entrypoint.sh
# COPY entrypoint.sh /entrypoint.sh


# Make the entrypoint script executable
RUN chmod +x ./entrypoint.sh

# Expose the port the app runs on
EXPOSE 3001

# Set the entrypoint
ENTRYPOINT ["./entrypoint.sh"]


