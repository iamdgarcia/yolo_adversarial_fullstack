from typing import Union

from fastapi import FastAPI, UploadFile, File,Query
from fastapi.middleware.cors import CORSMiddleware
from modules.tog.base import TOG,CF_Type
import base64
import cv2
from PIL import Image
import io
from enum import Enum
from fastapi import UploadFile, File, Form
import base64
import io
from PIL import Image
from ultralytics import YOLO

def modify_image(image,model_path,device,n_iters="min",cf_type: CF_Type = CF_Type.VANISHING, shape: tuple = (384, 640)):
    tog = TOG(model_path=model_path,device=device)
    img_adv, n = tog(image, n_iters=n_iters ,cf_type=cf_type, new_shape=shape)
    return img_adv, n

app = FastAPI()
# CORS setup for frontend dev
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Or specify your frontend origin
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"Hello": "World"}


class DeviceEnum(str, Enum):
    cpu = "cpu"
    cuda = "cuda"

class CTypeEnum(str, Enum):
    vanishing = "vanishing"
    fabrication = "fabrication"

@app.post("/upload")
async def upload_image(
    file: UploadFile = File(...),
    model: str = Form("yolov8n.pt"),
    device: str = Form("cpu"),
    n_iters: str = Form("2"),
    ctype: str = Form("vanishing")
):
    print(n_iters)
    n_iters = int(n_iters)
    if ctype == "vanishing":
        ctype = CF_Type.VANISHING
    elif ctype == "fabrication":
        ctype = CF_Type.FABRICATION
    if n_iters == -1:
        n_iters = 'min'
    contents = await file.read()
    image = Image.open(io.BytesIO(contents))
    # Process the image here...
    img_adv, img_noise = modify_image(image,model,device,n_iters,ctype)
    # Convert the numpy image to bytes (JPEG)
    _, buffer = cv2.imencode(".jpg", img_adv)
    img_bytes = buffer.tobytes()
    
    # Encode to base64 string
    img_base64 = base64.b64encode(img_bytes).decode("utf-8")

    _, noise_buffer = cv2.imencode(".jpg", img_noise)
    img_noise_bytes = noise_buffer.tobytes()
    
    # Encode to base64 string
    img_noise_base64 = base64.b64encode(img_noise_bytes).decode("utf-8")

    return {
        "filename": file.filename,
        "format": image.format,
        "adv_image_base64": img_base64,
        "noise": img_noise_base64
    }



@app.post("/detect")
async def detect_image(
    file: UploadFile = File(...),
    model: str = Form("yolov8n.pt")
):
    # Read and load the image
    contents = await file.read()
    image = Image.open(io.BytesIO(contents))

    # Run YOLO detection
    model_instance = YOLO(model)
    results = model_instance(image)

    boxes = results[0].boxes
    classes = boxes.cls.cpu().numpy()
    confs = boxes.conf.cpu().numpy()
    names = results[0].names

    if len(classes) == 0:
        return {"result": "Nothing detected"}

    output = [
        f"{names[int(cls)]} ({int(conf * 100)}%)"
        for cls, conf in zip(classes, confs)
    ]
    return {"result": ", ".join(output)}
