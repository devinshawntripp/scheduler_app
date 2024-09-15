# Use an official Node runtime as the base image
FROM node:20-alpine

# Set the working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy prisma schema
COPY prisma ./prisma/
ENV DATABASE_URL=postgresql://postgres:postgres@db:5432/scheduler
# Generate Prisma client
RUN npx prisma generate

RUN npx prisma db push


# Copy the rest of the application code
COPY . .

# Build the application
RUN npm run build

# Expose the port the app runs on
EXPOSE 3001

ENV PORT=3001

# Start the application
CMD ["npm", "start"]
