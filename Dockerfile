# Build stage
FROM node:18-alpine AS build

WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy the rest of the application
COPY . .

# Build the app
RUN npm run build

# Production stage with nginx for the frontend
FROM nginx:alpine as frontend

# Copy built assets from the build stage
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Server stage for backend
FROM node:18-alpine as backend

WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./
COPY server/ ./server/

# Install only production dependencies
RUN npm ci --only=production

EXPOSE 3001

CMD ["node", "server/index.js"]

# Final stage: Combined container with both frontend and backend
FROM nginx:alpine

# Copy frontend files
COPY --from=frontend /usr/share/nginx/html /usr/share/nginx/html
COPY --from=frontend /etc/nginx/conf.d/default.conf /etc/nginx/conf.d/default.conf

# Install Node.js
RUN apk add --update nodejs npm

# Create app directory for backend
WORKDIR /app

# Copy backend files
COPY --from=backend /app /app

# Expose ports
EXPOSE 80 3001

# Start both services
COPY start.sh /start.sh
RUN chmod +x /start.sh

CMD ["/start.sh"]