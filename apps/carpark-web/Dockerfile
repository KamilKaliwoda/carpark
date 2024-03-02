FROM node:19.3.0-alpine

# Set the working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json to the working directory
COPY package.json ./

COPY webpack.config.js ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

EXPOSE 9131

# Start the application
CMD ["npm", "start"]