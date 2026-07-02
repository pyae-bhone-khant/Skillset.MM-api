# Use Node.js LTS version
FROM node:20-alpine
# Set working directory
WORKDIR /app
# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Build TypeScript
RUN npm run build

# Set environment variables
ENV NODE_ENV=production
ENV PORT=6000
ENV FRONTEND_URL=https://skillset-mm-app.vercel.app
ENV REDIS_HOST=redis
ENV REDIS_PORT=6379

# Expose port
EXPOSE 6000

# Start the application
CMD ["npm", "start"]
