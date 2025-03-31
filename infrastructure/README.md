# CompliTracker Infrastructure

This directory contains all infrastructure configurations for deploying and managing the CompliTracker microservices architecture.

## Components

- **Docker Compose**: Development environment setup
- **Kubernetes**: Production deployment manifests
- **Prometheus & Grafana**: Monitoring and metrics
- **GitHub Actions**: CI/CD pipeline

## Prerequisites

- Docker and Docker Compose
- Kubernetes cluster (for production)
- GitHub account (for CI/CD)

## Local Development

1. Start all services using Docker Compose:
```bash
docker-compose up -d
```

2. Access services:
- API Gateway: http://localhost:8080
- Eureka Dashboard: http://localhost:8761
- Prometheus: http://localhost:9090
- Grafana: http://localhost:3000

## Kubernetes Deployment

1. Apply Kubernetes manifests:
```bash
kubectl apply -f kubernetes/
```

2. Verify deployments:
```bash
kubectl get pods
kubectl get services
```

## Monitoring

### Prometheus
- Metrics are collected from all services via /actuator/prometheus endpoint
- Configure additional metrics in prometheus/prometheus.yml

### Grafana
- Default credentials: admin/admin
- Import JVM and Spring Boot dashboards for monitoring

## CI/CD Pipeline

The GitHub Actions workflow (.github/workflows/ci-cd.yml) handles:
1. Building and testing services
2. Creating Docker images
3. Deploying to Kubernetes

Required secrets:
- DOCKER_USERNAME
- DOCKER_PASSWORD
- KUBE_CONFIG

## Service Discovery

Eureka Server handles service registration and discovery:
- All services register with Eureka
- API Gateway routes requests using Eureka service registry

## Security

- API Gateway handles authentication and authorization
- Services communicate securely within Docker/Kubernetes network
- Prometheus and Grafana require authentication