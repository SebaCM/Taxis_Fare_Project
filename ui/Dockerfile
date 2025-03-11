# ui/Dockerfile
FROM node:14

# Set the working directory
WORKDIR /app

# Copy package.json and install dependencies
COPY package.json ./
RUN npm install

# Copy the UI source code
COPY . .

# Build the UI
RUN npm run build

# Expose the port the UI runs on
EXPOSE 3000

# Command to run the UI
CMD ["npm", "start"]