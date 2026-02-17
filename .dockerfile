# Use Python 3.13-slim as the base
FROM python:3.13-slim

# Install system dependencies for OpenCV/YOLO
RUN apt-get update && apt-get install -y libgl1 libglib2.0-0 && rm -rf /var/lib/apt/lists/*

# Hugging Face requires a non-root user (UID 1000)
RUN useradd -m -u 1000 user
USER user
ENV PATH="/home/user/.local/bin:${PATH}"

WORKDIR /app

# 1. Install dependencies first for better caching
# Note: ultralytics-opencv-headless ensures no GUI dependencies are pulled
COPY --chown=user backend/requirements.txt .
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir torch torchvision --index-url https://download.pytorch.org && \
    pip install --no-cache-dir -r requirements.txt

# 2. Copy only the backend code into the container
COPY --chown=user backend/ /app/

# 3. Set the environment variable so Python finds your 'backend' package
ENV PYTHONPATH=/app

# 4. Start the FastAPI server on port 7860 (Hugging Face default)
# Point to the app object INSIDE the backend folder
CMD ["uvicorn", "app:app", "--host", "0.0.0.0", "--port", "7860"]

