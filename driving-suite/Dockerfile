# Use Node.js runtime to build the React app
FROM node:18 AS build-stage

# Set working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json
COPY package.json package-lock.json ./

# Install dependencies
RUN npm install

# Copy the entire project to the container
COPY . .

# Build the React app for production
RUN npm run build

# Production stage for serving the app
FROM nginx:stable-alpine AS production-stage

# Copy the React build output from the previous stage to the Nginx webroot
COPY --from=build-stage /app/build /usr/share/nginx/html

# Expose port 8080
EXPOSE 80

# Start Nginx when the container starts
CMD ["nginx", "-g", "daemon off;"]