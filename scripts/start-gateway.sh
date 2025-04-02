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

# Function to check if a service is healthy
check_service_health() {
    local service_name=$1
    local port=$2
    local health_endpoint=$3
    local max_attempts=30
    local attempt=1

    echo "Waiting for $service_name to be healthy..."
    while [ $attempt -le $max_attempts ]; do
        if curl -s "http://localhost:${port}${health_endpoint}" > /dev/null 2>&1; then
            echo "$service_name is healthy!"
            return 0
        fi
        echo "Waiting for $service_name to be healthy (attempt $attempt/$max_attempts)..."
        sleep 2
        attempt=$((attempt + 1))
    done

    echo "Error: $service_name failed to become healthy after $max_attempts attempts"
    exit 1
}

# Set working directory to project root
cd "$(dirname "$0")/.." || exit 1

# Check if Eureka Server is running, start it if not
if ! curl -s "http://localhost:8761/actuator/health" > /dev/null; then
    echo "Eureka Server is not running. Starting it now..."
    ./scripts/start-eureka.sh &
    
    # Wait for Eureka Server to be healthy
    check_service_health "Eureka Server" "8761" "/actuator/health"
fi

# Stop API Gateway if running
echo "Stopping API Gateway if running..."
kill_port 8080

# Compile API Gateway
echo "Compiling API Gateway..."
cd api-gateway
./mvnw clean install -DskipTests
check_status "Maven build for API Gateway"

# Start API Gateway
echo "Starting API Gateway..."
# ./mvnw spring-boot:run -Dspring-boot.run.profiles=local&
./mvnw spring-boot:run &
check_status "Starting API Gateway"

# Wait for API Gateway to be healthy
check_service_health "API Gateway" "8080" "/actuator/health"

echo "API Gateway started successfully!"
echo "API Gateway is available at http://localhost:8080"

# Keep script running
wait