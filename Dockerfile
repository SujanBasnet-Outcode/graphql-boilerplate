# Use the official Node.js 18 alpine image as the base image
FROM node:18-alpine

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json to the working directory
COPY package.json yarn.lock /app/

# Install project dependencies using Yarn
RUN yarn install

# Copy the rest of the application code
COPY . /app/

# Build the TypeScript code
RUN yarn build

# Expose the port your application listens on
EXPOSE 4300

# Command to run your application
CMD ["yarn", "start"]
