# Fullstack Application

This project is a fullstack application consisting of a frontend built with Vite (TypeScript) and a backend built with Node.js (TypeScript). The frontend is built and served by the backend after compiling. This guide will walk you through setting up the project manually and using Docker.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Manual Setup](#manual-setup)
    - [Install dependencies](#install-dependencies)
    - [Build the project](#build-the-project)
    - [Run the backend](#run-the-backend)
- [Docker Setup](#docker-setup)
    - [Docker Setup with Docker Compose](#docker-setup-with-docker-compose)

## Prerequisites

Ensure that you have the following installed:

- [Node.js](https://nodejs.org) (version 20 or above)
- [Docker](https://www.docker.com)
- [Docker Compose](https://docs.docker.com/compose/)

## Manual Setup

Follow these steps to run the application manually:

### Install Dependencies

1. Clone the repository to your local machine.

   ```bash
   git clone https://github.com/your-repo/fullstack-app.git
   cd fullstack-app

### Install Dependencies

2. Install the dependencies for the root project, backend, and frontend:

   ```bash
   npm install
   npm install --prefix backend
   npm install --prefix frontend

### 3. Build and Run the Project

#### Build the Project

To compile both the frontend and backend, run the following command from the root project directory:

```bash
npm run build
```
This will:

- Build the frontend using Vite (it will compile TypeScript files and bundle assets).
- Build the backend TypeScript files using `tsc`.

#### Run the Backend

Once the build process is complete, start the backend by running:

```bash
node ./dist/index.js
```

Your backend will now be running and accessible at http://localhost:3000 (or the port specified in your environment variables).

If you want to use different environment variables (e.g., for Redis), you can configure them in your .env file or specify them directly in the terminal when running the application.

## Docker Setup

This project includes a `Dockerfile` and `docker-compose.yml` for running the application in Docker containers.

### Docker Setup with Docker Compose

1. Ensure you have **Docker** and **Docker Compose** installed on your machine.

2. Build and start the Docker containers by running the following command from the root directory of your project:

   ```bash
   docker-compose up --build
