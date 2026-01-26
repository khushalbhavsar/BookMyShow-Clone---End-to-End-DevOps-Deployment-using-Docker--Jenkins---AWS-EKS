# ---------- BUILD STAGE ----------
FROM node:18-alpine AS build

WORKDIR /app

# Copy package files
COPY package.json package-lock.json ./

# Install dependencies
RUN npm install --legacy-peer-deps

# Copy source code
COPY . .

# Set environment variable to prevent OpenSSL errors during build
ENV NODE_OPTIONS=--openssl-legacy-provider

# Build the React app for production
RUN npm run build

# ---------- RUN STAGE ----------
FROM nginx:alpine

# Copy built static files to Nginx
COPY --from=build /app/build /usr/share/nginx/html

# Expose port 80
EXPOSE 80

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]
