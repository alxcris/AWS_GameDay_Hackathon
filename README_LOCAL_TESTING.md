# Flask App Local Testing Guide

## Overview
This guide helps you test the Flask application locally, particularly the new `/report` endpoint for the async processing task.

## Prerequisites
- Docker and Docker Compose installed
- Port 5001 available for Flask app (mapped from container's 5000)
- Port 5433 available for PostgreSQL (mapped from container's 5432)
- AWS credentials configured (via AWS CLI or environment variables)
- Access to the AWS account with the GameDay resources

## Setup and Running

1. **Ensure AWS credentials are available:**
   ```bash
   # Check if credentials are configured
   aws sts get-caller-identity
   ```

2. **Start the services:**
   ```bash
   cd flask_app
   docker-compose up --build
   ```

2. **Wait for services to be ready:**
   - PostgreSQL should be healthy (check docker-compose logs)
   - Flask app should show "Running on http://0.0.0.0:5000"

3. **Test the endpoints:**
   ```bash
   ./test_endpoints.sh
   ```

## Testing the /report Endpoint

### Synchronous Mode (default)
When no SQS queue is configured, the endpoint processes reports synchronously with a 5-10 second delay:

```bash
curl -X POST http://localhost:5001/report \
  -H "Content-Type: application/json" \
  -d '{"report_type": "usage", "period": "daily"}'
```

Expected response (after 5-10 seconds):
```json
{
  "message": "Report generated successfully",
  "report": {
    "report_id": "...",
    "generated_at": "...",
    "processing_signature": "...",
    "data": {
      "total_requests": 1247,
      "successful_requests": 1189,
      "error_rate": "4.65%",
      "avg_response_time": "1.34s",
      "peak_usage_hour": "14:00-15:00"
    }
  }
}
```

### Async Mode (with SQS)
To enable async processing, create an SQS queue and store its URL in Parameter Store:

```bash
# Create SQS queue
aws sqs create-queue --queue-name unicorn-rentals-reports-${TEAM_ID}

# Get the queue URL
QUEUE_URL=$(aws sqs get-queue-url --queue-name unicorn-rentals-reports-${TEAM_ID} --query 'QueueUrl' --output text)

# Store in Parameter Store
aws ssm put-parameter \
  --name "/unicorn-rentals/sqs-queue-url" \
  --value "$QUEUE_URL" \
  --type String \
  --overwrite
```

Expected response (immediate):
```json
{
  "message": "Report request queued for processing",
  "message_id": "...",
  "status": "queued"
}
```

## Architecture Notes

The `/report` endpoint implements the async processing pattern:

1. **Without SQS Configuration**: Processes reports synchronously using the secret_sauce binary to simulate processing time (5-10 seconds)

2. **With SQS Configuration**: Checks AWS Systems Manager Parameter Store for `/unicorn-rentals/sqs-queue-url`. If found, sends the request to SQS and returns immediately.

This demonstrates the cost optimization principle where synchronous processing (requiring provisioning for peak load) can be replaced with async processing (scaling based on actual demand).

## Troubleshooting

1. **Port already in use:**
   ```bash
   # Change ports in docker-compose.yaml or stop conflicting services
   lsof -i :5001
   lsof -i :5433
   ```

2. **Database connection issues:**
   - Ensure PostgreSQL container is healthy
   - Check logs: `docker-compose logs db`

3. **Binary execution errors:**
   - The secret_sauce binaries need execute permissions
   - Architecture detection handles both x86_64 and ARM64

## Cleanup

```bash
docker-compose down -v  # Remove containers and volumes
rm -rf pg_volume/       # Remove PostgreSQL data
```