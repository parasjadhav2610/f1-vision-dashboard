# F1 Vision Dashboard - Docker Deployment

## Quick Start

### Local Development with Docker

1. **Build and run all services:**

   ```bash
   docker-compose up --build
   ```

2. **Access the application:**

   - Frontend: http://localhost
   - Backend API: http://localhost:8000/api

3. **Stop the containers:**
   ```bash
   docker-compose down
   ```

### Production Deployment

#### AWS ECS/Fargate

1. **Build and push images to ECR:**

   ```bash
   # Authenticate to ECR
   aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin <account-id>.dkr.ecr.us-east-1.amazonaws.com

   # Build and tag backend
   docker build -t f1-backend:latest ./backend
   docker tag f1-backend:latest <account-id>.dkr.ecr.us-east-1.amazonaws.com/f1-backend:latest
   docker push <account-id>.dkr.ecr.us-east-1.amazonaws.com/f1-backend:latest

   # Build and tag frontend
   docker build -t f1-frontend:latest ./frontend
   docker tag f1-frontend:latest <account-id>.dkr.ecr.us-east-1.amazonaws.com/f1-frontend:latest
   docker push <account-id>.dkr.ecr.us-east-1.amazonaws.com/f1-frontend:latest
   ```

2. **Deploy using ECS:**
   - Create ECS cluster
   - Create task definitions for backend and frontend
   - Create services with desired count
   - Configure Application Load Balancer

#### Azure Container Apps

1. **Build and push to ACR:**

   ```bash
   # Login to Azure
   az login

   # Login to ACR
   az acr login --name <registry-name>

   # Build and push backend
   docker build -t f1-backend:latest ./backend
   docker tag f1-backend:latest <registry-name>.azurecr.io/f1-backend:latest
   docker push <registry-name>.azurecr.io/f1-backend:latest

   # Build and push frontend
   docker build -t f1-frontend:latest ./frontend
   docker tag f1-frontend:latest <registry-name>.azurecr.io/f1-frontend:latest
   docker push <registry-name>.azurecr.io/f1-frontend:latest
   ```

2. **Deploy to Container Apps:**

   ```bash
   # Create container apps
   az containerapp create --name f1-backend \
     --resource-group <rg-name> \
     --environment <env-name> \
     --image <registry-name>.azurecr.io/f1-backend:latest \
     --target-port 8000 \
     --ingress external

   az containerapp create --name f1-frontend \
     --resource-group <rg-name> \
     --environment <env-name> \
     --image <registry-name>.azurecr.io/f1-frontend:latest \
     --target-port 80 \
     --ingress external
   ```

## Architecture

- **Backend**: Python Flask API (Port 8000)
  - FastF1 library for F1 data
  - Persistent cache volume for performance
- **Frontend**: React + Vite (Port 80)
  - Nginx for serving static files
  - API proxy to backend

## Environment Variables

### Backend

- `FLASK_ENV`: Set to `production` for production deployments
- `PYTHONUNBUFFERED`: Set to `1` for real-time logging

### Frontend

- API endpoint configured via nginx proxy (`/api` -> `backend:8000/api`)

## Volumes

- `./backend/cache`: FastF1 cache directory (persisted to avoid re-downloading race data)

## Troubleshooting

### Rate Limit Errors

The Ergast API has a limit of 200 calls/hour. The backend is configured to process only the last 10 races to avoid hitting this limit. If you still see rate limit errors:

- Wait for the rate limit to reset (1 hour)
- Data will be loaded from cache on subsequent requests

### Container Won't Start

Check logs:

```bash
docker-compose logs -f backend
docker-compose logs -f frontend
```

### Cache Issues

Clear the cache if you encounter stale data:

```bash
rm -rf backend/cache/*
docker-compose restart backend
```

## Health Checks

Both containers include health checks:

- Backend: HTTP check on port 8000
- Frontend: HTTP check on port 80

## Scaling

For production, consider:

- Multiple backend replicas for high availability
- CDN for frontend static assets (CloudFront/Azure CDN)
- Persistent storage for cache (EFS/Azure Files)
- Redis for distributed caching
