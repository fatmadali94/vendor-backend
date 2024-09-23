# Use an official Node.js runtime as a parent image
FROM node:16-alpine

# Install PM2 globally
RUN npm install -g pm2

# Set the working directory
WORKDIR /usr/src/app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install --production

# Install TypeScript globally
RUN npm install -g typescript ts-node

# Copy the rest of the application
COPY . .

# Build the TypeScript application
RUN tsc

# Expose the port your app runs on (3004)
EXPOSE 3004

# Start the app using PM2
CMD ["pm2-runtime", "start", "dist/index.js"]
