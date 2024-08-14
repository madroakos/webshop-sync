# Use the official Node.js image as the base image
FROM node:18-alpine

# Set the working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY ./package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the frontend code
COPY . .

## Build the frontend
#RUN npm run build

## Install serve to serve the build
#RUN npm install -g serve

# Expose the port the app runs on
EXPOSE 5656

# Start the frontend server
CMD ["npm", "start"]