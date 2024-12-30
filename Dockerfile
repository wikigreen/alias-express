# Stage 1: Install dependencies and build the project
FROM node:20 AS build

# Set working directory to /app
WORKDIR /app

# Copy the entire project (frontend, backend, etc.)
COPY . .

# Install dependencies for the root project
RUN npm install

# Install dependencies for backend and frontend
RUN npm install --prefix backend
RUN npm install --prefix frontend

# Build the frontend and backend
RUN npm run build

# Stage 2: Production image
FROM node:20 AS production

# Set working directory to /app
WORKDIR /app

# Copy the backend build and frontend build artifacts from the build stage
COPY --from=build /app/dist /app/dist

# Expose the backend port
EXPOSE 3000

# Command to run the backend server
CMD ["node", "./dist/index.js"]
