#!/bin/bash

# Function to check if a command was successful
check_status() {
    if [ $? -ne 0 ]; then
        echo "Error: $1 failed"
        exit 1
    fi
}

# Function to kill process by port
kill_port() {
    local port=$1
    local pid=$(lsof -ti:$port)
    if [ ! -z "$pid" ]; then
        echo "Stopping process on port $port (PID: $pid)"
        kill -15 $pid
        sleep 2
        # Force kill if still running
        if ps -p $pid > /dev/null; then
            kill -9 $pid
        fi
    fi
}

# Function to compile a Java service
compile_service() {
    local service_dir=$1
    echo "Compiling $service_dir..."
    cd "$service_dir"
    ./mvnw clean install -DskipTests
    check_status "Maven build for $service_dir"
    cd -
}

# Set working directory to project root
cd "$(dirname "$0")/.." || exit 1

# Compile all Java services
services=("services/eureka-server" "api-gateway" "services/auth-service" "services/core-service" "services/document-service" "services/email-service" "services/notification-service")

for service in "${services[@]}"; do
    compile_service "$service"
done

# Start services in order
echo "Starting services..."

# Kill existing Eureka Server if running
echo "Checking for existing Eureka Server..."
kill_port 8761

# Start Eureka Server
cd services/eureka-server
./mvnw spring-boot:run &
check_status "Starting Eureka Server"
cd ../..

# Wait for Eureka Server to be ready
sleep 15

# Start API Gateway
cd api-gateway
./mvnw spring-boot:run &
check_status "Starting API Gateway"
cd ..

# Wait for API Gateway to be ready
sleep 10

# Start Frontend
echo "Starting frontend application..."
cd frontend
npm install
check_status "Frontend npm install"
npm run dev &
check_status "Starting frontend"

echo "All services started successfully!"
echo "Frontend should be available at http://localhost:5173"

# Keep script running
wait