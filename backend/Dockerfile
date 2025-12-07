FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements and install
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt && pip install ddtrace

# Copy application code
COPY . .

# Create cache directory
RUN mkdir -p /app/cache

EXPOSE 5000

# Run the Flask application
CMD ["python", "app.py"]