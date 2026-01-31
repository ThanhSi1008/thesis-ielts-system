# Multi-stage Dockerfile for FastAPI AI Service

# Stage 1: Base image with Python and dependencies
FROM python:3.11-slim AS base

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    g++ \
    ffmpeg \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements
COPY requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Stage 2: Production image
FROM python:3.11-slim AS production

WORKDIR /app

# Install runtime dependencies
RUN apt-get update && apt-get install -y \
    ffmpeg \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Copy Python packages from base stage
COPY --from=base /usr/local/lib/python3.11/site-packages /usr/local/lib/python3.11/site-packages
COPY --from=base /usr/local/bin /usr/local/bin

# Copy application code
COPY ./app ./app

# Create non-root user
RUN useradd -m -u 1001 aiuser && \
    chown -R aiuser:aiuser /app

# Create directories for temporary files
RUN mkdir -p /tmp/audio && \
    chown -R aiuser:aiuser /tmp/audio

# Switch to non-root user
USER aiuser

# Expose port
EXPOSE 8000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD python -c "import requests; requests.get('http://localhost:8000/health')"

# Start application
CMD ["python", "-m", "uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]

