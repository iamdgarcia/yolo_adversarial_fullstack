# Adversarial YOLO: Testing Object Detection Robustness

This project provides an end-to-end setup for generating adversarial samples and evaluating the robustness of YOLO-based object detection models. It consists of a **React frontend** and a **FastAPI backend**, each containerized and orchestrated using Docker Compose.

> 🔍 **Goal**: Create adversarial corruptions that fool YOLO object detectors, visualize the impact, and use these insights to build more robust models.
👉 [Video example](assets/adversarial_samples_generation.mp4)

## 🧠 Background

This project is based on the concepts and experiments described in the article:

👉 [Can We Trust Our Eyes? Analyzing Object Detection Robustness](https://medium.com/python-in-plain-english/can-we-trust-our-eyes-analyzing-object-detection-robustness-7e9b1969471e)

It explores two primary adversarial corruption types:
- **Vanishing**: Makes objects undetectable
- **Fabrication**: Generates false detections

---

## 🗂️ Project Structure

```
.
├── backend/       # FastAPI app: generates adversarial images and runs YOLO inference
├── frontend/      # React UI: image upload, visualization, and detection comparison
├── docker-compose.yml
└── README.md
```

---

## 🚀 Getting Started

### ✅ Prerequisites

- Docker
- Docker Compose

### 🐳 Run the project

From the root of the repository:

```bash
docker-compose up --build
```

This will:
- Spin up the **FastAPI backend** (on port `8000`)
- Launch the **React frontend** (on port `3000`)

Once up:
- Visit the UI at `http://localhost:3000`
- Upload an image and experiment with different corruption types, models, and number of iterations

---

## ⚙️ Developer Notes

- The frontend communicates with the backend via HTTP API calls (e.g., `/upload`, `/detect`)
- All models are handled by the backend using [Ultralytics YOLO](https://github.com/ultralytics/ultralytics)
- Corruptions are dynamically applied to simulate real-world adversarial attacks

---

## 📚 References

- [Ultralytics YOLO Documentation](https://docs.ultralytics.com)
- [Your Medium article on adversarial attacks](https://medium.com/python-in-plain-english/can-we-trust-our-eyes-analyzing-object-detection-robustness-7e9b1969471e)

---

## 📌 License

MIT License – feel free to use, modify, and contribute.

---

## 🤝 Contributing

PRs are welcome! If you have ideas for more corruption types, model comparisons, or robust training experiments — jump in!