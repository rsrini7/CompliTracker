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

# Function to check if PostgreSQL is ready
check_postgres() {
    echo "Waiting for PostgreSQL to be ready..."
    local max_attempts=30
    local attempt=1

    while [ $attempt -le $max_attempts ]; do
        if docker compose -f infrastructure/docker-compose.yml ps postgres | grep "5432" > /dev/null 2>&1; then
            for i in {1..5}; do
                if docker compose -f infrastructure/docker-compose.yml exec -T postgres pg_isready -h postgres -U postgres > /dev/null 2>&1; then
                    if docker compose -f infrastructure/docker-compose.yml exec -T postgres bash -c 'PGPASSWORD=postgres psql -h postgres -U postgres -d postgres -c "SELECT 1;" -t 10' > /dev/null 2>&1; then
                        echo "PostgreSQL is ready and accepting connections!"
                        return 0
                    fi
                fi
                echo "Connection attempt $i: Database is not ready yet..."
                sleep 5
            done
        fi
        echo "Waiting for PostgreSQL to be ready (attempt $attempt/$max_attempts)..."
        sleep 5
        attempt=$((attempt + 1))
    done

    echo "Error: PostgreSQL failed to start after $max_attempts attempts"
    exit 1
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

# Check if Eureka Server is running
if ! curl -s "http://localhost:8761/actuator/health" > /dev/null; then
    echo "Eureka Server is not running. Starting it now..."
    ./scripts/start-eureka.sh &
    
    # Wait for Eureka Server to be healthy
    check_service_health "Eureka Server" "8761" "/actuator/health"
fi

# Function to check if LocalStack S3 is ready
check_localstack() {
    echo "Waiting for LocalStack S3 to be ready..."
    local max_attempts=50
    local attempt=1

    while [ $attempt -le $max_attempts ]; do
        if curl -s "http://localhost:4566/_localstack/health" | grep -q '"s3": "running"'; then
            echo "LocalStack S3 is ready!"
            return 0
        fi
        echo "Waiting for LocalStack S3 to be ready (attempt $attempt/$max_attempts)..."
        sleep 2
        attempt=$((attempt + 1))
    done

    echo "Error: LocalStack S3 failed to start after $max_attempts attempts"
    exit 1
}

# Check if PostgreSQL is running, if not start it
if ! docker compose -f infrastructure/docker-compose.yml ps postgres | grep "5432" > /dev/null 2>&1; then
    echo "Starting PostgreSQL..."
    docker compose -f infrastructure/docker-compose.yml up -d postgres
    check_status "Starting PostgreSQL container"
    sleep 10
    check_postgres
fi

# Check if LocalStack is running, if not start it
if ! docker compose -f infrastructure/docker-compose.yml ps localstack | grep "4566" > /dev/null 2>&1; then
    echo "Starting LocalStack S3..."
    # Clean up any existing LocalStack temporary files
    if [ -d "/tmp/localstack" ]; then
        echo "Cleaning up existing LocalStack temporary files..."
        sudo rm -rf /tmp/localstack
    fi
    docker compose -f infrastructure/docker-compose.yml up -d localstack
    check_status "Starting LocalStack container"
    check_localstack
fi

# Stop Document Service if running
echo "Stopping Document Service if running..."
kill_port 8083

# Compile Document Service
echo "Compiling Document Service..."
cd services/document-service
./mvnw clean install -DskipTests
check_status "Maven build for Document Service"

# Start Document Service
echo "Starting Document Service..."
./mvnw spring-boot:run &
check_status "Starting Document Service"

# Wait for Document Service to be healthy
check_service_health "Document Service" "8083" "/api/documents/actuator/health"

echo "Document Service started successfully!"
echo "Document Service is available at http://localhost:8083/api/documents"

# Keep script running
wait