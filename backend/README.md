# ResQ Unified Node.js / Express API

A single, shared disaster response backend powering both the **Mobile-First Resident Web Application** and the **Coordinator Operations Dashboard**.

## Key Design Principles
1. **Single Unified Backend**: No disconnected secondary backend. Both public residents and authorized emergency coordinators query and persist against the same SQLite database.
2. **Privacy First**: Sensitive resident personal details (full name, phone number, exact coordinates, street address) are strictly restricted to authorized emergency coordinators. The public API only exposes district-level aggregated demand counts (`/api/requests/public-summary`).
3. **Honest Records Policy**:
   - Shelter records explicitly display verification sources and update timestamps (`source`, `last_verified_at`), or are prominently flagged as demonstration records (`is_demo = 1`).
   - Warnings feed honestly indicates whether a real telemetry feed is connected (`live_warning_feed_connected: false`) and provides direct links to official government sources (DMC Sri Lanka, Department of Meteorology, Irrigation Department). No fabricated or simulated warnings.
4. **No Fabricated AI Triage**: AI triage state is explicitly stored as `"Not configured"` with notes indicating manual human evaluation is required until official model integration.

---

## Environment Variables

| Variable | Default | Description |
|---|---|---|
| `PORT` | `8000` | Port for the Express HTTP server |
| `DB_PATH` | `./resq.db` | Path to the SQLite database file |
| `NODE_ENV` | `development` | Runtime environment mode |

---

## REST API Endpoints

### 1. System & Health
- `GET /api/health` — Service health check and database status.
- `GET /api/system/status` — Live telemetry status, warning feed disclaimer, official portal links, and emergency hotlines.
- `GET /api/divisions` — Comprehensive Sri Lankan administrative data (25 districts and respective Divisional Secretariat divisions).
- `GET /api/safety` — Trilingual (English, Sinhala, Tamil) disaster preparedness guides and 24/7 hotline directory.

### 2. Assistance Requests
- `POST /api/requests` — **Public Resident Endpoint**: Submit emergency assistance requests.
  - Body: `{ category, urgency, full_name, phone, district, ds_division, address_details, people_count, children_count, elders_count, special_needs, latitude, longitude, location_method }`
  - Returns unique tracking code (e.g., `RQ-2026-1042`).
- `GET /api/requests/public-summary` — **Public Map Endpoint**: Returns aggregated request counts per district. Strictly excludes personal coordinates or contact info.
- `GET /api/requests` — **Coordinator Endpoint**: View all requests with full contact information, notes, and filters (`status`, `district`, `urgency`).
- `GET /api/requests/:id` — Single request lookup for status tracking.
- `PATCH /api/requests/:id` — **Coordinator Endpoint**: Update request status (`Pending`, `Assigned`, `In Progress`, `Resolved`), assign teams, and append notes.

### 3. Evacuation Shelters
- `GET /api/shelters` — Public directory of shelters with capacity, real-time occupancy, available spots, facilities, and verification source.
- `POST /api/shelters` — **Coordinator Endpoint**: Register a verified shelter or demonstration record.
- `PATCH /api/shelters/:id` — **Coordinator Endpoint**: Update occupancy and status (`Open`, `Near Capacity`, `Full`, `Closed`).

### 4. Bulletins & Warnings
- `GET /api/alerts` — Verified bulletins and official government early warning links.
- `POST /api/alerts` — **Coordinator Endpoint**: Broadcast an official emergency advisory.

### 5. Rescue Resources
- `GET /api/resources` — List rescue boats, paramedic units, and relief distribution supplies.
- `PATCH /api/resources/:id` — Update status (`Available`, `Deployed`, `Maintenance`).
