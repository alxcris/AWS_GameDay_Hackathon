FROM python:3.10-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements and install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Make secret_sauce binaries executable
RUN chmod +x secret_sauce_*

# Set environment variables for local development
ENV ENVIRONMENT=local
ENV POSTGRES_USER=unicorn_admin
ENV POSTGRES_PASSWORD=nimda_nrocinu
ENV POSTGRES_PORT=5432
ENV POSTGRES_DB_NAME=unicorn_rentals
ENV POSTGRES_HOST=db
ENV IMAGES_BUCKET=test-bucket
ENV IMAGES_BUCKET_PREFIX=images/
ENV AWS_DEFAULT_REGION=us-east-1

# Expose port
EXPOSE 5000

# Run the application
CMD ["python", "app.py"]