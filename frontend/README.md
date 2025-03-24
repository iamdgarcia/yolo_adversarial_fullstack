# 🖼️ Frontend – Adversarial YOLO UI

This is the **React-based frontend** of the Adversarial YOLO project. It provides a user-friendly interface to upload images, apply adversarial corruptions, and visualize how YOLO object detection models respond to these perturbations.

---

## ⚙️ Tech Stack

- **React + Vite**
- **TailwindCSS**
- **Lucide Icons**
- **Sonner** (for toast notifications)
- **ShadCN/UI components**

---

## 🚀 Available Features

- ✅ Upload original image
- ✅ Select YOLO model variant (`yolov8n`, `yolov11s`, etc.)
- ✅ Choose corruption type (`vanishing`, `fabrication`)
- ✅ Set number of iterations (`-1`, `min`, or any positive integer)
- ✅ Generate corrupted images + noise pattern
- ✅ Run detection on both original and corrupted images
- ✅ Download corrupted results

---

## 🔧 Running Locally

This frontend is designed to run independently or as part of the full Docker setup.

### ➤ Run with Docker

```bash
docker build -t adv-yolo-frontend .
docker run -p 3000:3000 adv-yolo-frontend
```

### ➤ Run with Vite (local dev)

```bash
npm install
npm run dev
```

> Make sure the backend is running at `http://localhost:8000` or update the fetch URLs in the code if needed.

---

## 🧠 Architecture

- The frontend sends images and parameters to the backend (`/upload` and `/detect` endpoints)
- Adversarial images are received in base64 format and rendered dynamically
- User actions trigger toast notifications to enhance UX

---

## 🌍 Environment

You can configure the backend base URL in your codebase (`.env` support can be added if needed).

---

## 📁 File Structure Highlights

```
src/
├── components/      # Custom UI components
├── pages/           # Main page (ImageProcessor)
├── lib/utils.ts     # Utility helpers
├── App.tsx
└── main.tsx
```

---

## 📸 Demo Screenshot

Coming soon...

---

## 📌 Notes

- This app expects the backend to be running and available for image corruption + detection.
- It’s designed to work with YOLOv8 and YOLOv11 models, but can be extended to support others.

---

## 🧪 Example Use

1. Upload an image
2. Select model: `yolov8n`
3. Corruption type: `vanishing`
4. Iterations: `3`
5. Click `Generate Corrupted Image`
6. Click `Run YOLO Detection` to compare both

---

## 📬 Feedback & Contributions

Feel free to submit PRs or ideas to improve UX, add model comparison tools, or visualize confidence changes!

