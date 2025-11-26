# Deployment Guide

This guide covers deploying the Echo application to various environments.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Docker Deployment](#docker-deployment)
- [Kubernetes Deployment](#kubernetes-deployment)
- [Cloud Deployments](#cloud-deployments)
- [Environment Configuration](#environment-configuration)
- [Database Migrations](#database-migrations)
- [Monitoring & Logging](#monitoring--logging)
- [Scaling](#scaling)
- [Troubleshooting](#troubleshooting)

## Prerequisites

- Docker 20.10+ and Docker Compose 2.0+
- Kubernetes 1.24+ (for K8s deployment)
- kubectl configured with cluster access
- PostgreSQL 14+
- Redis 7+
- Node.js 18+ (for local builds)
- Python 3.11+ (for backend)

## Docker Deployment

### Development Environment

```bash
# Clone the repository
git clone https://github.com/yourusername/echo.git
cd echo

# Copy environment file
cp .env.example .env

# Edit .env with your configuration
vim .env

# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Access the application
# Frontend: http://localhost:3000
# Backend API: http://localhost:8000
# API Docs: http://localhost:8000/docs
```

### Production Build

```bash
# Build production images
docker-compose -f docker-compose.prod.yml build

# Start production services
docker-compose -f docker-compose.prod.yml up -d

# Scale services
docker-compose -f docker-compose.prod.yml up -d --scale backend=3
```

## Kubernetes Deployment

### Setup

```bash
# Create namespace
kubectl create namespace echo-production

# Create secrets
kubectl create secret generic echo-secrets \
  --from-env-file=.env \
  --namespace=echo-production

# Apply configurations
kubectl apply -f k8s/production/
```

### Deploy Services

```bash
# Deploy database
kubectl apply -f k8s/production/postgres-deployment.yaml

# Deploy Redis
kubectl apply -f k8s/production/redis-deployment.yaml

# Deploy backend
kubectl apply -f k8s/production/backend-deployment.yaml

# Deploy frontend
kubectl apply -f k8s/production/frontend-deployment.yaml

# Deploy ingress
kubectl apply -f k8s/production/ingress.yaml
```

### Verify Deployment

```bash
# Check pods
kubectl get pods -n echo-production

# Check services
kubectl get svc -n echo-production

# Check ingress
kubectl get ingress -n echo-production

# View logs
kubectl logs -f deployment/backend -n echo-production
```

## Cloud Deployments

### AWS ECS

```bash
# Build and push images to ECR
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin <account-id>.dkr.ecr.us-east-1.amazonaws.com

docker build -t echo-backend backend/
docker tag echo-backend:latest <account-id>.dkr.ecr.us-east-1.amazonaws.com/echo-backend:latest
docker push <account-id>.dkr.ecr.us-east-1.amazonaws.com/echo-backend:latest

# Deploy using ECS CLI or CloudFormation
ecs-cli compose --file docker-compose.prod.yml up
```

### Google Cloud Run

```bash
# Build and push to GCR
gcloud builds submit --tag gcr.io/PROJECT_ID/echo-backend backend/
gcloud builds submit --tag gcr.io/PROJECT_ID/echo-frontend frontend/

# Deploy to Cloud Run
gcloud run deploy echo-backend \
  --image gcr.io/PROJECT_ID/echo-backend \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated

gcloud run deploy echo-frontend \
  --image gcr.io/PROJECT_ID/echo-frontend \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated
```

### Azure Container Instances

```bash
# Login to Azure
az login

# Create resource group
az group create --name echo-rg --location eastus

# Create container registry
az acr create --resource-group echo-rg --name echoregistry --sku Basic

# Build and push images
az acr build --registry echoregistry --image echo-backend:latest backend/
az acr build --registry echoregistry --image echo-frontend:latest frontend/

# Deploy container group
az container create \
  --resource-group echo-rg \
  --name echo-app \
  --image echoregistry.azurecr.io/echo-backend:latest \
  --dns-name-label echo-app \
  --ports 8000
```

## Environment Configuration

### Required Environment Variables

```env
# Core
DATABASE_URL=postgresql://...
REDIS_URL=redis://...
SECRET_KEY=<generate-with-openssl>

# External Services
OPENAI_API_KEY=<your-key>
STRIPE_SECRET_KEY=<your-key>
SENTRY_DSN=<your-dsn>

# Production Settings
ENVIRONMENT=production
DEBUG=false
CORS_ORIGINS=https://yourdomain.com
```

### Generate Secrets

```bash
# Generate SECRET_KEY
openssl rand -hex 32

# Generate SESSION_SECRET_KEY
openssl rand -hex 32
```

## Database Migrations

### Run Migrations

```bash
# Using Docker
docker-compose exec backend alembic upgrade head

# Using kubectl
kubectl exec -it deployment/backend -n echo-production -- alembic upgrade head

# Locally
cd backend
alembic upgrade head
```

### Create New Migration

```bash
# Auto-generate migration
alembic revision --autogenerate -m "Description of changes"

# Review the generated migration
# Edit if necessary

# Apply migration
alembic upgrade head
```

### Rollback Migration

```bash
# Rollback one revision
alembic downgrade -1

# Rollback to specific revision
alembic downgrade <revision_id>
```

## Monitoring & Logging

### Prometheus Metrics

```bash
# Access metrics endpoint
curl http://localhost:8000/metrics

# Deploy Prometheus
kubectl apply -f k8s/monitoring/prometheus.yaml

# Deploy Grafana
kubectl apply -f k8s/monitoring/grafana.yaml
```

### Centralized Logging

```bash
# ELK Stack
kubectl apply -f k8s/logging/elasticsearch.yaml
kubectl apply -f k8s/logging/logstash.yaml
kubectl apply -f k8s/logging/kibana.yaml

# Or use cloud-native solutions
# - AWS CloudWatch
# - Google Cloud Logging
# - Azure Monitor
```

## Scaling

### Horizontal Pod Autoscaling (K8s)

```yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: backend-hpa
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: backend
  minReplicas: 2
  maxReplicas: 10
  metrics:
    - type: Resource
      resource:
        name: cpu
        target:
          type: Utilization
          averageUtilization: 70
```

### Database Scaling

```bash
# PostgreSQL Read Replicas
# Configure in your cloud provider

# Redis Cluster
# Update REDIS_URL to cluster endpoints
```

## Troubleshooting

### Common Issues

#### 1. Database Connection Errors

```bash
# Check database connectivity
docker-compose exec backend python -c "from app.config.database import engine; print('Connected')"

# Check PostgreSQL logs
kubectl logs -f statefulset/postgres -n echo-production
```

#### 2. Memory Issues

```bash
# Check memory usage
kubectl top pods -n echo-production

# Increase resource limits
kubectl edit deployment backend -n echo-production
```

#### 3. SSL/TLS Certificate Issues

```bash
# Using cert-manager for automatic certificates
kubectl apply -f https://github.com/cert-manager/cert-manager/releases/download/v1.13.0/cert-manager.yaml

# Create ClusterIssuer
kubectl apply -f k8s/production/cert-issuer.yaml
```

### Health Checks

```bash
# Backend health
curl http://localhost:8000/health

# Frontend health
curl http://localhost:3000

# Database health
docker-compose exec postgres pg_isready

# Redis health
docker-compose exec redis redis-cli ping
```

### Rollback Deployment

```bash
# Kubernetes
kubectl rollout undo deployment/backend -n echo-production
kubectl rollout status deployment/backend -n echo-production

# Docker Compose
docker-compose down
git checkout <previous-commit>
docker-compose up -d --build
```

## Security Checklist

- [ ] All secrets stored in secure secret management (not in code)
- [ ] SSL/TLS certificates configured
- [ ] Firewall rules configured
- [ ] Database encryption at rest enabled
- [ ] Regular security updates scheduled
- [ ] Backup strategy implemented
- [ ] Rate limiting configured
- [ ] CORS properly configured
- [ ] Security headers enabled
- [ ] Monitoring and alerting set up

## Backup & Recovery

### Database Backup

```bash
# Manual backup
docker-compose exec postgres pg_dump -U user echo_db > backup_$(date +%Y%m%d_%H%M%S).sql

# Automated backup (cron)
0 2 * * * docker-compose exec postgres pg_dump -U user echo_db | gzip > /backups/backup_$(date +\%Y\%m\%d).sql.gz
```

### Restore Database

```bash
# Restore from backup
docker-compose exec -T postgres psql -U user echo_db < backup.sql
```

## Performance Optimization

### Frontend

- Enable CDN for static assets
- Implement browser caching
- Use image optimization
- Enable HTTP/2

### Backend

- Configure Redis caching
- Optimize database queries
- Use connection pooling
- Enable compression

## Support

For issues and questions:

- GitHub Issues: https://github.com/yourusername/echo/issues
- Documentation: https://docs.echo.com
- Email: support@echo.com
