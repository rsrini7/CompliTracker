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

# Stop all running services first
echo "Stopping any running services..."
kill_port 5173  # Frontend
kill_port 8080  # API Gateway
kill_port 8761  # Eureka Server
kill_port 8081  # Auth Service
kill_port 8082  # Core Service
kill_port 8083  # Document Service
kill_port 8084  # Email Service
kill_port 8085  # Notification Service

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

# Function to check if PostgreSQL is ready
check_postgres() {
    echo "Waiting for PostgreSQL to be ready..."
    local max_attempts=30
    local attempt=1

    while [ $attempt -le $max_attempts ]; do
        # Check if container is running and healthy
        if docker compose -f infrastructure/docker-compose.yml ps postgres | grep "5432" > /dev/null 2>&1; then
            # Multiple connection attempts with increased timeout
            for i in {1..5}; do
                if docker compose -f infrastructure/docker-compose.yml exec -T postgres pg_isready -h postgres -U postgres > /dev/null 2>&1; then
                    # Verify we can actually connect and run a query with increased timeout
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

# Function to check if LocalStack S3 is ready
check_localstack() {
    echo "Waiting for LocalStack S3 to be ready..."
    local max_attempts=30
    local attempt=1

    while [ $attempt -le $max_attempts ]; do
        if curl -s "http://localhost:4566/_localstack/health" | grep -q '"s3":"available"'; then
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

# Start services in order
echo "Starting services..."

# Start PostgreSQL first
echo "Starting PostgreSQL..."
docker compose -f infrastructure/docker-compose.yml up -d postgres
check_status "Starting PostgreSQL container"

# Wait for PostgreSQL to be ready with increased timeout
echo "Waiting for PostgreSQL to initialize (this may take a few minutes)..."
sleep 10
check_postgres

# Start LocalStack S3
echo "Starting LocalStack S3..."
# Clean up any existing LocalStack temporary files
if [ -d "/tmp/localstack" ]; then
    echo "Cleaning up existing LocalStack temporary files..."
    sudo rm -rf /tmp/localstack
fi
docker compose -f infrastructure/docker-compose.yml up -d localstack
check_status "Starting LocalStack container"
check_localstack

# Start Eureka Server first
echo "Starting Eureka Server..."
cd services/eureka-server
./mvnw spring-boot:run &
check_status "Starting Eureka Server"
cd ../..

# Wait for Eureka Server to be healthy
check_service_health "Eureka Server" "8761" "/actuator/health"

# Wait for Eureka Server to be ready
sleep 15

# Start API Gateway
echo "Starting API Gateway..."
cd api-gateway
./mvnw spring-boot:run &
check_status "Starting API Gateway"
cd ..

# Wait for API Gateway to be healthy
check_service_health "API Gateway" "8080" "/actuator/health"

# Start other microservices
echo "Starting microservices..."

# Start Auth Service
cd services/auth-service
./mvnw spring-boot:run &
check_status "Starting Auth Service"
cd ../..
check_service_health "Auth Service" "8081" "/api/auth/actuator/health"

# Start Core Service
cd services/core-service
./mvnw spring-boot:run &
check_status "Starting Core Service"
cd ../..
check_service_health "Core Service" "8082" "/api/core/actuator/health"

# Start Document Service
cd services/document-service
./mvnw spring-boot:run &
check_status "Starting Document Service"
cd ../..
check_service_health "Document Service" "8083" "/api/documents/actuator/health"

# Start Email Service
cd services/email-service
./mvnw spring-boot:run &
check_status "Starting Email Service"
cd ../..
check_service_health "Email Service" "8084" "/api/email/actuator/health"

# Start Notification Service
cd services/notification-service
./mvnw spring-boot:run &
check_status "Starting Notification Service"
cd ../..
check_service_health "Notification Service" "8085" "/api/notifications/actuator/health"

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