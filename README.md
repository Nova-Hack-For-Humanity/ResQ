# ResQ — Intelligent Flood Risk Prediction & Emergency Response System

[![FastAPI](https://img.shields.io/badge/FastAPI-005571?style=for-the-badge&logo=fastapi)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://react.dev/)
[![Expo](https://img.shields.io/badge/Expo-000020?style=for-the-badge&logo=expo&logoColor=white)](https://expo.dev/)
[![Node.js](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![Python](https://img.shields.io/badge/Python_3.10+-3776AB?style=for-the-badge&logo=python&logoColor=white)](https://www.python.org/)
[![Scikit-Learn](https://img.shields.io/badge/Scikit--Learn-F7931E?style=for-the-badge&logo=scikit-learn&logoColor=white)](https://scikit-learn.org/)

**ResQ** is a comprehensive disaster management and flood response platform designed for Sri Lanka's river basins (including Kelani Ganga, Kalu Ganga, Maha Oya, Gin Ganga, and Attanagalu Oya). Built in alignment with Disaster Management Centre (DMC) operational workflows, ResQ bridges predictive hydrological machine learning, real-time authority command centers, and resident mobile emergency response.

---

## 📌 System Architecture

```text
                                  ┌──────────────────────────────┐
                                  │   Hydrological Sensor &      │
                                  │   Irrigation Dept. Telemetry │
                                  └──────────────┬───────────────┘
                                                 │
                                                 ▼
┌─────────────────────────────────┐   ┌─────────────────────────────────┐
│       Citizen Mobile App        │   │    FastAPI Predictive Engine    │
│       (React Native / Expo)     │   │      (Python + Scikit-Learn)    │
│                                 │   │                                 │
│  • SOS / Incident Reporting     │   │  • Random Forest ML Inference   │
│  • Evacuation Shelter Discovery │   │  • River Water Level Lag Models │
│  • Real-time Early Warnings     │   │  • Threshold Risk Mapping       │
└──────────────┬──────────────────┘   └──────────────┬──────────────────┘
               │                                     │
               └──────────────────┬──────────────────┘
                                  ▼
┌───────────────────────────────────────────────────────────────────────┐
│                    DMC Emergency Command Dashboard                    │
│                        (React + Vite + Leaflet)                       │
│                                                                       │
│  • Interactive GIS Map with Station Flood Markers & Citizen Reports   │
│  • Actual vs. Predicted Hydrograph Comparison Charts                  │
│  • Early Warning Bulletin Broadcast & Shelter Capacity Management     │
└───────────────────────────────────────────────────────────────────────┘
```

---

## 🚀 Key Features

### 1. 🌊 Predictive Hydrological Modeling
- **Next-Hour Forecasting:** Random Forest ensemble model predicting next-step river water levels based on 12-hour rainfall, multi-step lag features, rolling moving averages, and cyclical diurnal elements.
- **Dynamic Risk Classification:** Automatically evaluates predictions against Irrigation Department hydrological thresholds:
  - **Normal / Low Risk:** Below alert limits.
  - **Moderate Risk:** Approaching or exceeding station alert level.
  - **High Risk:** Crossing minor flood threshold.
  - **Very High Risk (Critical):** Exceeding major flood limit.

### 2. 🗺️ Command Center Dashboard (`frontend/`)
- **Interactive GIS Map:** Real-time Leaflet visualization of 55 river telemetry stations with color-coded risk indicators (pulse animations).
- **Comparative Trend Analytics:** Visual bar/trend charts comparing actual vs. ML-predicted river heights.
- **Incident & SOS Triage:** Live feed of geo-tagged citizen flood reports with severity tagging (`minor`, `moderate`, `severe`, `critical`).
- **Emergency Bulletins:** Broadcast official warnings directly to vulnerable downstream communities.
- **Shelter & Resource Tracking:** Monitor capacity, occupancy, and status of designated evacuation shelters and rescue boats.

### 3. 📱 Citizen Mobile Application (`mobile/`)
- **Emergency Reporting:** Residents can submit geo-tagged incident reports with water depth, severity, and photo attachments.
- **Safe Evacuation Navigation:** Discover nearby verified shelters with live occupancy status and distance calculation.
- **Official Warning Bulletins:** Direct feed of DMC and Department of Meteorology alerts to eliminate misinformation.

---

## 📂 Project Directory Structure

```text
ResQ/
├── app/                  # FastAPI Machine Learning Service
│   ├── database.py       # SQLite connection & session management
│   ├── models.py         # SQLAlchemy ORM models (logs, reports, alerts)
│   └── main.py           # REST API endpoints & ML prediction pipeline
│
├── backend/              # Node.js / Express Disaster Coordination Service
│   ├── server.js         # Express REST API for shelter & assistance tracking
│   ├── db.js             # SQLite schema & database seeders
│   └── package.json
│
├── frontend/             # Disaster Management Authority Dashboard
│   ├── src/
│   │   ├── components/   # Leaflet MapView & reusable UI widgets
│   │   ├── pages/        # AdminDashboard, Alerts, ReportFlood
│   │   └── services/     # API connector for backend telemetry
│   └── package.json
│
├── mobile/               # Resident Mobile Application
│   ├── app/              # Expo Router file-based screens
│   ├── components/       # Cross-platform mobile UI elements
│   ├── services/         # API clients & offline storage queue
│   └── package.json
│
├── outputs/              # ML pipeline artifacts & processed hydrological datasets
│   ├── clean_water_levels.csv
│   ├── ml_features_fixed.csv
│   └── ml/models/        # Trained model checkpoints (*.pkl excluded from git)
│
└── requirements.txt      # Python dependencies
```

---

## 🛠️ Quickstart & Setup Guide

### Prerequisites
- **Node.js** (v18.0 or higher) & **npm**
- **Python** (3.10, 3.11, or 3.12)
- **Git**

---

### 1. Backend / ML API Setup (`app/`)

1. Install Python dependencies:
   ```bash
   pip install -r requirements.txt
   ```
2. Start the FastAPI server on port `8000`:
   ```bash
   python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
   ```
3. Verify the service is online by opening [http://127.0.0.1:8000/health](http://127.0.0.1:8000/health) or [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs) (Swagger UI).

---

### 2. Admin Command Dashboard (`frontend/`)

1. Open a new terminal and navigate to `frontend`:
   ```bash
   cd frontend
   npm install
   ```
2. Launch the Vite development server:
   ```bash
   npm run dev
   ```
3. Open [http://localhost:5173](http://localhost:5173) in your browser.

---

### 3. Resident Mobile App (`mobile/`)

1. Open a new terminal and navigate to `mobile`:
   ```bash
   cd mobile
   npm install
   ```
2. Start the Expo development bundler:
   ```bash
   npm start
   ```
3. **Run Options:**
   - **On Phone:** Download **Expo Go** ([Android](https://play.google.com/store/apps/details?id=host.exp.exponent) / [iOS](https://apps.apple.com/app/expo-go/id982107779)) and scan the terminal QR code. *(Ensure phone and PC are on the same Wi-Fi network)*.
   - **In Web Browser:** Press <kbd>w</kbd> or run `npm run web`.
   - **On Android Emulator:** Press <kbd>a</kbd>.

---

## 🌐 API Reference (FastAPI Engine)

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/health` | Check ML model readiness and dataset status |
| `GET` | `/stations` | List all 55 monitored river gauging stations |
| `GET` | `/station/{name}` | Current telemetry, alert thresholds, and ML forecast for a station |
| `GET` | `/predict/{name}` | Run prediction and log the timestamped forecast to the database |
| `GET` | `/priority-areas` | Query stations actively exceeding alert or flood thresholds |
| `GET` | `/reports` | Retrieve citizen crowd-sourced flood incident reports |
| `POST` | `/reports` | Submit a new citizen incident report with geo-coordinates |
| `GET` | `/alerts` | Active emergency warnings and evacuation advisories |
| `POST` | `/alerts` | Authority endpoint to broadcast a high-priority flood warning |

---

## 📊 Machine Learning Model Details

- **Deployment Model:** Random Forest Regressor (`random_forest_fixed.pkl`)
- **Key Input Features:**
  - `water_level_current`, `water_level_previous`, `water_level_lag_1`, `water_level_lag_2`, `water_level_lag_3`
  - `rainfall_12hr`, `rainfall_lag_1`, `rainfall_lag_2`, `rainfall_rolling_3`, `water_level_rolling_3`
  - `hour_sin`, `hour_cos`, `month_sin`, `month_cos` (Cyclical time transformations)
  - `alert_level`, `minor_flood_level`, `major_flood_level` (Irrigation Department benchmarks)
- **Model Justification:** Outperforms baseline and hybrid approaches on critical **High & Very High Risk Recall**, ensuring extreme flood surges are detected early.

---

## 🛡️ License & Acknowledgments

- **Developed for:** Nova Hack for Humanity.
- **Hydrological References:** Department of Irrigation Sri Lanka & Disaster Management Centre (DMC).
- **Map Data:** © [OpenStreetMap](https://www.openstreetmap.org/copyright) contributors.
