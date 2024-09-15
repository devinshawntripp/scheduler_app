# Use an official Node runtime as the base image
FROM node:20-alpine

# Set the working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm ci

# Install 'netcat-openbsd' for the 'nc' command used in the entrypoint script
RUN apk add --no-cache netcat-openbsd

# Copy prisma schema
COPY prisma ./prisma/
ENV DATABASE_URL=postgresql://postgres:postgres@db:5432/scheduler
# Generate Prisma client
RUN npx prisma generate

# Copy the rest of the application code
COPY . .

# Build the application
RUN npm run build

#ENV PORT=3001
# Copy the entrypoint script
COPY entrypoint.sh ./

# Make the entrypoint script executable
RUN chmod +x ./entrypoint.sh

# Expose the port the app runs on
EXPOSE 3001

# Set the entrypoint
ENTRYPOINT ["./entrypoint.sh"]

# Start the application
#CMD ["npm", "start"]
