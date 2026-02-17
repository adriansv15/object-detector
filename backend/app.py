import os
from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from ultralytics import YOLO
from PIL import Image
import io
import base64
from dotenv import load_dotenv

# Load variables from .env file
load_dotenv()

app = FastAPI()

# Get the string from .env and split it into a list
origins_str = os.getenv("ALLOWED_ORIGINS", "http://localhost:3000")
origins = origins_str.split(",")

# Enable CORS for React (port 5173 or 3000)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load the YOLO model once when starting the server
model = YOLO("models/yolo26n.pt") 

@app.post("/upload")
async def process_yolo(file: UploadFile = File(...)):
    # 1. Read uploaded file into memory
    contents = await file.read()
    img = Image.open(io.BytesIO(contents)).convert("RGB")

    # 2. Run YOLO inference
    results = model(img)
    
    # 3. Plot bounding boxes on the image
    # plot() returns a numpy array (BGR for OpenCV)
    annotated_img_array = results[0].plot() 
    
    # 4. Convert the numpy array back to a PIL image and then to Base64
    annotated_img = Image.fromarray(annotated_img_array[..., ::-1]) # Convert BGR to RGB
    buffered = io.BytesIO()
    annotated_img.save(buffered, format="JPEG")
    img_base64 = base64.b64encode(buffered.getvalue()).decode("utf-8")

    return {
        "status": "success",
        "image": f"data:image/jpeg;base64,{img_base64}",
        "count": len(results[0].boxes) # Optional: number of objects detected
    }
