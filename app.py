import os
import sys

# 1. Tell Python where to find your backend code
# This adds the 'backend' folder to the system path
sys.path.append(os.path.join(os.path.dirname(__file__), "backend"))

# 2. Import your FastAPI app from backend/app.py
from backend.app import app

# 3. This is what Hugging Face looks for to "Start" the app
if __name__ == "__main__":
    import uvicorn
    # Port 7860 is mandatory for Hugging Face Spaces
    uvicorn.run(app, host="0.0.0.0", port=7860)
