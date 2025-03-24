# 🧠 Backend – Adversarial YOLO API (FastAPI)

This is the **FastAPI backend** for the Adversarial YOLO project. It provides endpoints to:

- ✅ Apply adversarial corruptions to input images
- ✅ Run YOLOv8/YOLOv11 object detection on images
- ✅ Compare original vs. corrupted detection results

The backend uses Ultralytics' YOLO models under the hood, and exposes a clean HTTP interface for frontend integration.

---

## 🚀 Endpoints

### `POST /upload`

Generates a corrupted (adversarial) version of the uploaded image.

**Params** (as `multipart/form-data`):

| Field     | Type   | Description                               |
|-----------|--------|-------------------------------------------|
| `file`    | File   | Original image to corrupt                 |
| `model`   | str    | Model name (e.g., `yolov8n.pt`)           |
| `device`  | str    | Device to run inference (`cpu` or `cuda`) |
| `n_iters` | str    | Number of iterations (`-1`, `"min"`, or any positive integer) |
| `ctype`   | str    | Corruption type (`vanishing` or `fabrication`) |

**Returns**:

```json
{
  "adv_image_base64": "<base64-encoded corrupted image>",
  "noise": "<base64-encoded noise pattern>"
}
```

---

### `POST /detect`

Runs YOLO detection on a single image.

**Params** (as `multipart/form-data`):

| Field     | Type   | Description                     |
|-----------|--------|---------------------------------|
| `file`    | File   | Image to analyze                |
| `model`   | str    | YOLO model (e.g., `yolov8n.pt`) |

**Returns**:

```json
{
  "result": "Detected: Person (98%), Car (85%)"
}
```

---

## 🧪 Running Locally

### ➤ With Docker

```bash
docker build -t adv-yolo-backend .
docker run -p 8000:8000 adv-yolo-backend
```

### ➤ With Python (Dev)

```bash
pip install -r requirements.txt
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

> Make sure you have Ultralytics' YOLO package installed:
> ```bash
> pip install ultralytics
> ```

---

## 📂 File Structure

```
backend/
├── main.py            # FastAPI application
├── modules    # Adversarial corruption logic
├── requirements.txt
└── Dockerfile
```

---

## ⚙️ Features

- Built-in support for **YOLOv8** and **YOLOv11**
- Uses `Pillow` and `OpenCV` for image processing
- Simple to extend with new corruption types or detection backends
- Fully compatible with frontend React client via REST API

---

## 📖 Article Behind This

This API is part of a broader project explained in this article:

👉 [Can We Trust Our Eyes? Analyzing Object Detection Robustness](https://medium.com/python-in-plain-english/can-we-trust-our-eyes-analyzing-object-detection-robustness-7e9b1969471e?sk=f0e61ca0239ed1b131c19ad38fdf86aa)

---

## 📌 Notes

- The backend expects base64 images when comparing adversarial vs original
- Errors and validations are handled gracefully using HTTP status codes
- Corruption types and iteration behavior can be customized

---

## 🤝 Contributions

New adversarial methods? Better YOLO preprocessing? Improvements are welcome — submit a PR!