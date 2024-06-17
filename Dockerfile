# Use the latest Node.js LTS version
FROM node:lts-alpine

# Set the working directory
WORKDIR /app

# Copy package.json and package-lock.json (if available)
COPY package*.json ./

# Install dependencies
RUN npm install --production

# Copy the entire project
COPY . .

# Generate the Prisma client
RUN npx prisma generate

# Build the Next.js application
RUN npm run build

# Expose the port on which the application will run
EXPOSE 3000

# Start the Next.js application
CMD ["npm", "start"]