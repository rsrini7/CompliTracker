#!/bin/bash

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

echo "Stopping all services..."

# Stop Frontend (typically runs on 5173)
kill_port 5173

# Stop API Gateway (typically runs on 8080)
kill_port 8080

# Stop other services (adjust ports as needed)
kill_port 8761  # Eureka Server
kill_port 8081  # Auth Service
kill_port 8082  # Core Service
kill_port 8083  # Document Service
kill_port 8084  # Email Service
kill_port 8085  # Notification Service

echo "All services stopped successfully!"