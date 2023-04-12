# Set the base image to the official Node.js image
FROM node:lts

RUN apt-get update && apt-get install -y build-essential python3

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install dependencies
RUN npm i

# Copy the rest of the application code to the working directory
COPY . .

# Expose the port the app will run on
EXPOSE 3000

# Start the application
CMD ["npm", "start"]