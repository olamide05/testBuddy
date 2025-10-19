# syntax=docker/dockerfile:1.6

# Use a slim Python base image
FROM python:3.11-slim AS base

# Prevent Python from writing .pyc files and buffer stdout/err
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

# Install system deps (build tools for uvloop/httptools on some platforms, and curl for healthcheck/debug)
RUN apt-get update \
    && apt-get install -y --no-install-recommends build-essential curl \
    && rm -rf /var/lib/apt/lists/*

# Set workdir
WORKDIR /app

# Create a non-root user
RUN groupadd -r app && useradd -r -g app app

# Install Python dependencies first (better layer caching)
COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY app ./app
COPY data ./data

# Expose the default port
EXPOSE 8000

# Switch to non-root
USER app

# Healthcheck (optional)
HEALTHCHECK --interval=30s --timeout=5s --retries=3 CMD curl -fsS http://localhost:8000/ || exit 1

# Start the FastAPI app with Uvicorn
# Bind to all interfaces for container runtime
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
