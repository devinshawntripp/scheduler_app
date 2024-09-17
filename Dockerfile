# Use an official Node runtime as the base image
FROM node:20-alpine

# Set the working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm ci

RUN apk add --no-cache netcat-openbsd

# Copy the rest of the application code
COPY . .

# Build the application
RUN npm run build

# Copy the entrypoint script
COPY entrypoint.sh .

# Make the entrypoint script executable
RUN chmod +x .entrypoint.sh

# Expose the port the app runs on
EXPOSE 3001

ENTRYPOINT ["./entrypoint.sh"]

# Start the application
CMD ["npm", "start"]