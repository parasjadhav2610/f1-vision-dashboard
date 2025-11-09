# Use official Python image
FROM python:3.11-slim

# Set working directory
WORKDIR /app

# Copy requirements if exists, install dependencies
COPY requirements.txt ./
RUN apt-get update && apt-get install -y --no-install-recommends \
    && pip install --no-cache-dir -r requirements.txt || true

# Copy application code
COPY . .

# Expose port 8000
EXPOSE 8000

# Run the app
CMD ["python", "app.py"]