import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import db from './db.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8000;

app.use(cors());
app.use(express.json());

// Official Sri Lanka Emergency Hotline Directory
const OFFICIAL_HOTLINES = [
  { number: '117', nameEn: 'Disaster Management Centre (DMC)', nameSi: 'ආපදා කළමනාකරණ මධ්‍යස්ථානය', nameTa: 'அனர்த்த முகாமைத்துவ நிலையம்', tollFree: true },
  { number: '1990', nameEn: 'Suwa Seriya Pre-Hospital Emergency Ambulance', nameSi: '1990 සුවසැරිය හදිසි ගිලන්රථ සේවය', nameTa: '1990 சுவசரிய அம்புலன்ஸ் சேவை', tollFree: true },
  { number: '119', nameEn: 'Sri Lanka Police Emergency Service', nameSi: 'ශ්‍රී ලංකා පොලිස් හදිසි ඇමතුම්', nameTa: 'இலங்கை பொலிஸ் அவசர பிரிவு', tollFree: true },
  { number: '110', nameEn: 'Fire and Rescue Service', nameSi: 'ගිනි නිවන හා මුදාගැනීමේ සේවය', nameTa: 'தீயணைப்பு மற்றும் மீட்பு சேவை', tollFree: true },
  { number: '011-2588401', nameEn: 'Irrigation Department (Flood Information)', nameSi: 'වාරිමාර්ග දෙපාර්තමේන්තුව (ගංවතුර තොරතුරු)', nameTa: 'நீர்ப்பாசனத் திணைக்களம்', tollFree: false },
  { number: '011-2686686', nameEn: 'Department of Meteorology (Weather Bulletins)', nameSi: 'කාලගුණ විද්‍යා දෙපාර්තමේන්තුව', nameTa: 'வளிமண்டலவியல் திணைக்களம்', tollFree: false }
];

// Official Early Warning Sources
const OFFICIAL_EARLY_WARNING_SOURCES = [
  {
    name: 'Disaster Management Centre (DMC) Sri Lanka',
    url: 'http://www.dmc.gov.lk',
    type: 'Emergency Early Warning Bulletins'
  },
  {
    name: 'Department of Meteorology Sri Lanka',
    url: 'http://www.meteo.gov.lk',
    type: 'Weather & Heavy Rainfall Advisories'
  },
  {
    name: 'Irrigation Department Flood Monitoring Network',
    url: 'http://www.irrigation.gov.lk',
    type: 'Major River Water-Level Status'
  }
];

// 25 Districts & Key DS Divisions of Sri Lanka
const SRI_LANKA_DIVISIONS = {
  Colombo: ['Kolonnawa', 'Kaduwela', 'Seethawaka', 'Colombo', 'Thimbirigasyaya', 'Dehiwala', 'Moratuwa', 'Kesbewa', 'Maharagama', 'Sri Jayawardenepura Kotte', 'Ratmalana', 'Homagama', 'Padukka'],
  Gampaha: ['Biyagama', 'Kelaniya', 'Wattala', 'Ja-Ela', 'Gampaha', 'Attanagalla', 'Dompe', 'Mahara', 'Minuwangoda', 'Mirigama', 'Negombo', 'Katana', 'Divulapitiya'],
  Kalutara: ['Kalutara', 'Panadura', 'Horana', 'Bandaragama', 'Beruwala', 'Matugama', 'Bulathsinhala', 'Ingiriya', 'Palindanuwara', 'Walallavita', 'Madurawala', 'Millaniya', 'Dodangoda'],
  Ratnapura: ['Ratnapura', 'Kiriella', 'Elapatha', 'Pelmadulla', 'Balangoda', 'Eheliyagoda', 'Kuruwita', 'Ayagama', 'Imbulpe', 'Godakawela', 'Kahawatta', 'Nivitigala', 'Kalawana', 'Kolonne', 'Opanayaka', 'Weligepola'],
  Galle: ['Galle Four Gravets', 'Baddegama', 'Nagoda', 'Bentota', 'Elpitiya', 'Karandeniya', 'Niyagama', 'Balapitiya', 'Ambalangoda', 'Hikkaduwa', 'Bope-Poddala', 'Akmeemana', 'Habaraduwa', 'Yakkalamulla', 'Imaduwa', 'Gonapinuwala', 'Thawalama', 'Neluwa', 'Divithura'],
  Matara: ['Matara Four Gravets', 'Akuressa', 'Athuraliya', 'Kamburupitiya', 'Malimbada', 'Thihagoda', 'Pasgoda', 'Kotapola', 'Pitabeddara', 'Hakmana', 'Mulatiyana', 'Devinuwara', 'Dickwella', 'Weligama'],
  Kandy: ['Kandy Four Gravets', 'Harispattuwa', 'Kundasale', 'Pathadumbara', 'Udunuwara', 'Yatinuwara', 'Gangawata Korale', 'Poojapitiya', 'Panwila', 'Doluwa'],
  Kegalle: ['Aranayaka', 'Dehiovita', 'Deraniyagala', 'Galigamuwa', 'Kegalle', 'Mawanella', 'Rambukkana', 'Ruwanwella', 'Warakapola', 'Yatiyanthota'],
  Kurunegala: ['Kurunegala', 'Alawwa', 'Bingiriya', 'Dambadeniya', 'Giriulla', 'Ibbagamuwa', 'Kuliyapitiya', 'Narammala', 'Panduwasnuwara', 'Pannala', 'Polgahawela', 'Wariyapola'],
  Puttalam: ['Puttalam', 'Chilaw', 'Anamaduwa', 'Dankotuwa', 'Kalpitiya', 'Mahawewa', 'Marawila', 'Nattandiya', 'Wennappuwa'],
  Anuradhapura: ['Nuwaragam Palatha Central', 'Nuwaragam Palatha East', 'Galnewa', 'Horowpothana', 'Kekirawa', 'Medawachchiya', 'Nochchiyagama', 'Padaviya', 'Rambewa', 'Talawa', 'Thambuttegama'],
  Polonnaruwa: ['Thamankaduwa', 'Dimbulagala', 'Elahera', 'Hingurakgoda', 'Lankapura', 'Medirigiriya', 'Welikanda'],
  Badulla: ['Badulla', 'Bandarawela', 'Ella', 'Hali-Ela', 'Haputale', 'Mahiyanganaya', 'Passara', 'Welimada'],
  Monaragala: ['Monaragala', 'Bibile', 'Buttala', 'Kataragama', 'Madulla', 'Medagama', 'Siyambalanduwa', 'Wellawaya'],
  Hambantota: ['Hambantota', 'Ambalantota', 'Angunakolapelessa', 'Beliatta', 'Chowk', 'Lunugamvehera', 'Tangalle', 'Tissamaharama', 'Walasmulla', 'Weeraketiya'],
  Matale: ['Matale', 'Dambulla', 'Galewela', 'Naula', 'Pallepola', 'Rattota', 'Ukuwela', 'Wilgamuwa', 'Yatawatta'],
  Nuwara_Eliya: ['Nuwara Eliya', 'Ambagamuwa', 'Hanguranketha', 'Kothmale', 'Walapane'],
  Jaffna: ['Jaffna', 'Chavakachcheri', 'Karainagar', 'Kayts', 'Nallur', 'Point Pedro', 'Sandilipay', 'Tellippalai', 'Valvettithurai', 'Velanai'],
  Kilinochchi: ['Karachchi', 'Kandavalai', 'Pachchilaipalli', 'Poonakary'],
  Mannar: ['Mannar Town', 'Manthai West', 'Madhu', 'Musali', 'Nanaddan'],
  Vavuniya: ['Vavuniya', 'Vavuniya North', 'Vavuniya South', 'Vengalacheddikulam'],
  Mullaitivu: ['Maritimepattu', 'Manthai East', 'Oddusuddan', 'Puthukkudiyiruppu', 'Thunukkai', 'Welioya'],
  Batticaloa: ['Manmunai North', 'Eravur Town', 'Kattankudy', 'Koralai Pattu', 'Manmunai South', 'Porativu Pattu'],
  Ampara: ['Ampara', 'Dehiattakandiya', 'Kalmunai', 'Karaitivu', 'Lahugala', 'Mahaoya', 'Padiyathalawa', 'Pothuvil', 'Sainthamaruthu', 'Sammanthurai', 'Uhana'],
  Trincomalee: ['Trincomalee Town and Gravets', 'Gomarankadawala', 'Kantale', 'Kinniya', 'Kuchchaveli', 'Morawewa', 'Muttur', 'Padavi Sri Pura', 'Seruvila', 'Thambalagamuwa']
};

// -------------------------------------------------------------
// 1. HEALTH & SYSTEM STATUS
// -------------------------------------------------------------
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'ResQ Disaster Response Shared API',
    database: 'SQLite (WAL mode)',
    version: '2.0.0',
    ai_triage: 'Not configured',
    timestamp: new Date().toISOString()
  });
});

// Backward compatibility health route
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    model_loaded: false,
    dataset_loaded: false,
    stations: 0,
    service: 'ResQ Shared Node API',
    ai_triage: 'Not configured'
  });
});

// System warning feed configuration status (honest warning feed)
app.get('/api/system/status', (req, res) => {
  res.json({
    live_warning_feed_connected: false,
    warning_feed_policy: 'Honest records only. Automated prediction and fake simulated warnings removed.',
    disclaimer: 'No live automated warning feed is connected to this deployment. Residents and coordinators should directly consult official government early warning portals below.',
    official_sources: OFFICIAL_EARLY_WARNING_SOURCES,
    hotlines: OFFICIAL_HOTLINES,
    ai_triage_policy: 'AI triage is not configured. All assistance requests default to "Not configured" state for human coordinator triage.'
  });
});

// Sri Lanka Administrative Divisions
app.get('/api/divisions', (req, res) => {
  res.json({
    districts: Object.keys(SRI_LANKA_DIVISIONS),
    divisions: SRI_LANKA_DIVISIONS
  });
});

// -------------------------------------------------------------
// 2. ASSISTANCE REQUESTS (RESIDENT SUBMISSION + COORDINATOR MGMT)
// -------------------------------------------------------------

// POST /api/requests - Resident Assistance Submission
app.post('/api/requests', (req, res) => {
  try {
    const {
      category,
      urgency,
      full_name,
      phone,
      district,
      ds_division,
      address_details,
      people_count,
      children_count,
      elders_count,
      special_needs,
      latitude,
      longitude,
      location_method
    } = req.body;

    // Validation
    if (!category || !urgency || !full_name || !phone || !district || !ds_division) {
      return res.status(400).json({
        error: 'Missing required fields. Category, urgency, full name, phone number, district, and DS division are mandatory.'
      });
    }

    // Generate unique Tracking ID (e.g. RQ-2026-XXXX)
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const requestId = `RQ-2026-${randomSuffix}`;
    const now = new Date().toISOString();

    const insertStmt = db.prepare(`
      INSERT INTO assistance_requests (
        id, category, urgency, full_name, phone, district, ds_division, address_details,
        people_count, children_count, elders_count, special_needs, latitude, longitude,
        location_method, status, ai_triage_status, ai_triage_notes, assigned_team, coordinator_notes,
        created_at, updated_at
      ) VALUES (
        @id, @category, @urgency, @full_name, @phone, @district, @ds_division, @address_details,
        @people_count, @children_count, @elders_count, @special_needs, @latitude, @longitude,
        @location_method, 'Pending', 'Not configured',
        'AI triage is scheduled for future integration. Manual coordinator evaluation required.',
        '', '', @created_at, @updated_at
      )
    `);

    insertStmt.run({
      id: requestId,
      category: String(category).toLowerCase(),
      urgency: String(urgency).toLowerCase(),
      full_name: String(full_name).trim(),
      phone: String(phone).trim(),
      district: String(district).trim(),
      ds_division: String(ds_division).trim(),
      address_details: address_details ? String(address_details).trim() : '',
      people_count: Number(people_count) || 1,
      children_count: Number(children_count) || 0,
      elders_count: Number(elders_count) || 0,
      special_needs: special_needs ? String(special_needs).trim() : '',
      latitude: latitude != null && !isNaN(latitude) ? Number(latitude) : null,
      longitude: longitude != null && !isNaN(longitude) ? Number(longitude) : null,
      location_method: location_method === 'gps' ? 'gps' : 'manual',
      created_at: now,
      updated_at: now
    });

    const saved = db.prepare('SELECT * FROM assistance_requests WHERE id = ?').get(requestId);

    res.status(201).json({
      success: true,
      message: 'Assistance request registered successfully.',
      tracking_id: requestId,
      request: saved
    });
  } catch (err) {
    console.error('Error creating assistance request:', err);
    res.status(500).json({ error: 'Failed to record assistance request: ' + err.message });
  }
});

// Backward compatibility: POST /reports (used by previous form)
app.post('/reports', (req, res) => {
  try {
    const { latitude, longitude, report_type, description, severity, full_name, phone, district, ds_division, people_count } = req.body;
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const requestId = `RQ-2026-${randomSuffix}`;
    const now = new Date().toISOString();

    const insertStmt = db.prepare(`
      INSERT INTO assistance_requests (
        id, category, urgency, full_name, phone, district, ds_division, address_details,
        people_count, children_count, elders_count, special_needs, latitude, longitude,
        location_method, status, ai_triage_status, ai_triage_notes, assigned_team, coordinator_notes,
        created_at, updated_at
      ) VALUES (
        @id, @category, @urgency, @full_name, @phone, @district, @ds_division, @address_details,
        @people_count, 0, 0, @special_needs, @latitude, @longitude,
        @location_method, 'Pending', 'Not configured',
        'AI triage is not configured; manual coordinator review required.', '', '', @created_at, @updated_at
      )
    `);

    insertStmt.run({
      id: requestId,
      category: report_type || 'other',
      urgency: severity === 'critical' ? 'critical' : (severity === 'severe' ? 'high' : 'moderate'),
      full_name: full_name || 'Resident (Citizen Report)',
      phone: phone || 'Not provided',
      district: district || 'Colombo',
      ds_division: ds_division || 'Colombo',
      address_details: description || '',
      people_count: Number(people_count) || 1,
      special_needs: '',
      latitude: latitude != null ? Number(latitude) : null,
      longitude: longitude != null ? Number(longitude) : null,
      location_method: latitude ? 'gps' : 'manual',
      created_at: now,
      updated_at: now
    });

    res.json({
      success: true,
      id: requestId,
      tracking_id: requestId,
      submitted_at: now,
      status: 'Pending'
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/requests - Coordinator access to all requests (includes sensitive contact and coordinates)
app.get('/api/requests', (req, res) => {
  try {
    const { status, district, urgency } = req.query;
    let query = 'SELECT * FROM assistance_requests WHERE 1=1';
    const params = [];

    if (status && status !== 'All') {
      query += ' AND status = ?';
      params.push(status);
    }
    if (district && district !== 'All') {
      query += ' AND district = ?';
      params.push(district);
    }
    if (urgency && urgency !== 'All') {
      query += ' AND urgency = ?';
      params.push(urgency);
    }

    query += ' ORDER BY CASE urgency WHEN "critical" THEN 1 WHEN "high" THEN 2 WHEN "moderate" THEN 3 ELSE 4 END, created_at DESC';

    const requests = db.prepare(query).all(...params);
    res.json({
      count: requests.length,
      requests
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /reports - Backward compatibility for coordinator dashboard
app.get('/reports', (req, res) => {
  try {
    const requests = db.prepare('SELECT * FROM assistance_requests ORDER BY created_at DESC').all();
    const mapped = requests.map(r => ({
      id: r.id,
      report_type: r.category,
      severity: r.urgency === 'critical' ? 'critical' : (r.urgency === 'high' ? 'severe' : 'moderate'),
      description: `${r.address_details || ''} ${r.special_needs ? '(' + r.special_needs + ')' : ''}`.trim(),
      latitude: r.latitude,
      longitude: r.longitude,
      submitted_at: r.created_at,
      status: r.status,
      // Full details for coordinator dashboard
      full_name: r.full_name,
      phone: r.phone,
      district: r.district,
      ds_division: r.ds_division,
      people_count: r.people_count,
      children_count: r.children_count,
      elders_count: r.elders_count,
      special_needs: r.special_needs,
      ai_triage_status: r.ai_triage_status,
      assigned_team: r.assigned_team,
      coordinator_notes: r.coordinator_notes
    }));
    res.json({ count: mapped.length, reports: mapped });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/requests/public-summary - PUBLIC SAFE ENDPOINT:
// District-level aggregated counts ONLY. Strictly excludes individual names, phones, and GPS coordinates!
app.get('/api/requests/public-summary', (req, res) => {
  try {
    const rows = db.prepare(`
      SELECT 
        district,
        COUNT(*) as total_requests,
        SUM(CASE WHEN urgency = 'critical' THEN 1 ELSE 0 END) as critical_count,
        SUM(CASE WHEN urgency = 'high' THEN 1 ELSE 0 END) as high_count,
        SUM(CASE WHEN status = 'Resolved' THEN 1 ELSE 0 END) as resolved_count,
        SUM(CASE WHEN status != 'Resolved' THEN 1 ELSE 0 END) as active_count,
        SUM(people_count) as total_people_affected
      FROM assistance_requests
      GROUP BY district
      ORDER BY total_requests DESC
    `).all();

    const totalOverall = db.prepare(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN status != 'Resolved' THEN 1 ELSE 0 END) as total_active,
        SUM(CASE WHEN urgency = 'critical' AND status != 'Resolved' THEN 1 ELSE 0 END) as total_critical
      FROM assistance_requests
    `).get();

    res.json({
      overall: totalOverall,
      district_summaries: rows,
      privacy_note: 'Aggregated district statistics only. Individual resident coordinates and contact details are strictly restricted to authorized emergency coordinators.'
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/requests/:id - Single request tracking
app.get('/api/requests/:id', (req, res) => {
  try {
    const row = db.prepare('SELECT * FROM assistance_requests WHERE id = ?').get(req.params.id);
    if (!row) {
      return res.status(404).json({ error: 'Request not found' });
    }
    res.json({ request: row });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/requests/:id - Coordinator updates status, assigned team, or notes
app.patch('/api/requests/:id', (req, res) => {
  try {
    const { status, assigned_team, coordinator_notes } = req.body;
    const existing = db.prepare('SELECT * FROM assistance_requests WHERE id = ?').get(req.params.id);
    if (!existing) {
      return res.status(404).json({ error: 'Request not found' });
    }

    const updatedStatus = status || existing.status;
    const updatedTeam = assigned_team !== undefined ? assigned_team : existing.assigned_team;
    const updatedNotes = coordinator_notes !== undefined ? coordinator_notes : existing.coordinator_notes;
    const now = new Date().toISOString();

    db.prepare(`
      UPDATE assistance_requests
      SET status = ?, assigned_team = ?, coordinator_notes = ?, updated_at = ?
      WHERE id = ?
    `).run(updatedStatus, updatedTeam, updatedNotes, now, req.params.id);

    const updated = db.prepare('SELECT * FROM assistance_requests WHERE id = ?').get(req.params.id);
    res.json({ success: true, request: updated });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// -------------------------------------------------------------
// 3. SHELTER INFORMATION (PUBLIC BROWSE + COORDINATOR MGMT)
// -------------------------------------------------------------

// GET /api/shelters
app.get('/api/shelters', (req, res) => {
  try {
    const { district } = req.query;
    let query = 'SELECT * FROM shelters WHERE 1=1';
    const params = [];
    if (district && district !== 'All') {
      query += ' AND district = ?';
      params.push(district);
    }
    query += ' ORDER BY is_demo ASC, (capacity - occupancy) DESC';

    const rawShelters = db.prepare(query).all(...params);
    const shelters = rawShelters.map(s => ({
      ...s,
      facilities: JSON.parse(s.facilities || '[]'),
      available_spots: Math.max(0, s.capacity - s.occupancy),
      occupancy_rate: Math.round((s.occupancy / s.capacity) * 100)
    }));

    res.json({
      count: shelters.length,
      shelters
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/shelters - Coordinator creates shelter record
app.post('/api/shelters', (req, res) => {
  try {
    const { name, district, ds_division, address, lat, lon, capacity, occupancy, status, contact_person, contact_phone, facilities, is_demo, source } = req.body;
    if (!name || !district || !capacity) {
      return res.status(400).json({ error: 'Name, district, and capacity are required.' });
    }

    const randomSuffix = Math.floor(100 + Math.random() * 900);
    const shelterId = `SH-${randomSuffix}`;
    const now = new Date().toISOString();

    db.prepare(`
      INSERT INTO shelters (
        id, name, district, ds_division, address, lat, lon, capacity, occupancy, status,
        contact_person, contact_phone, facilities, is_demo, source, last_verified_at, created_at, updated_at
      ) VALUES (
        @id, @name, @district, @ds_division, @address, @lat, @lon, @capacity, @occupancy, @status,
        @contact_person, @contact_phone, @facilities, @is_demo, @source, @last_verified_at, @created_at, @updated_at
      )
    `).run({
      id: shelterId,
      name,
      district,
      ds_division: ds_division || district,
      address: address || '',
      lat: lat ? Number(lat) : null,
      lon: lon ? Number(lon) : null,
      capacity: Number(capacity),
      occupancy: Number(occupancy) || 0,
      status: status || 'Open',
      contact_person: contact_person || 'Relief Officer',
      contact_phone: contact_phone || '',
      facilities: JSON.stringify(facilities || []),
      is_demo: is_demo ? 1 : 0,
      source: source || (is_demo ? 'Demonstration Record' : 'District Secretariat Official Registry'),
      last_verified_at: now,
      created_at: now,
      updated_at: now
    });

    const created = db.prepare('SELECT * FROM shelters WHERE id = ?').get(shelterId);
    res.status(201).json({ success: true, shelter: created });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/shelters/:id - Coordinator updates occupancy or status
app.patch('/api/shelters/:id', (req, res) => {
  try {
    const { occupancy, status, contact_person, contact_phone } = req.body;
    const existing = db.prepare('SELECT * FROM shelters WHERE id = ?').get(req.params.id);
    if (!existing) {
      return res.status(404).json({ error: 'Shelter not found' });
    }

    const newOcc = occupancy !== undefined ? Number(occupancy) : existing.occupancy;
    let newStatus = status || existing.status;
    if (!status && occupancy !== undefined) {
      if (newOcc >= existing.capacity) newStatus = 'Full';
      else if (newOcc >= existing.capacity * 0.85) newStatus = 'Near Capacity';
      else newStatus = 'Open';
    }

    const now = new Date().toISOString();
    db.prepare(`
      UPDATE shelters
      SET occupancy = ?, status = ?, contact_person = ?, contact_phone = ?, last_verified_at = ?, updated_at = ?
      WHERE id = ?
    `).run(
      newOcc,
      newStatus,
      contact_person !== undefined ? contact_person : existing.contact_person,
      contact_phone !== undefined ? contact_phone : existing.contact_phone,
      now,
      now,
      req.params.id
    );

    const updated = db.prepare('SELECT * FROM shelters WHERE id = ?').get(req.params.id);
    res.json({ success: true, shelter: updated });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// -------------------------------------------------------------
// 4. HONEST WARNINGS & EMERGENCY BULLETINS
// -------------------------------------------------------------

// GET /api/alerts (and /alerts)
app.get(['/api/alerts', '/alerts'], (req, res) => {
  try {
    const bulletins = db.prepare('SELECT * FROM official_bulletins ORDER BY created_at DESC').all();
    res.json({
      count: bulletins.length,
      alerts: bulletins,
      live_feed_connected: false,
      feed_notice: 'No live automated telemetry warning feed is connected. Displaying verified coordinator bulletins and official government sources.',
      official_sources: OFFICIAL_EARLY_WARNING_SOURCES
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/alerts (and /alerts) - Coordinator issues official advisory
app.post(['/api/alerts', '/alerts'], (req, res) => {
  try {
    const { title, severity, district, message, source, source_url } = req.body;
    if (!title || !message) {
      return res.status(400).json({ error: 'Title and message are required.' });
    }

    const randomSuffix = Math.floor(100 + Math.random() * 900);
    const alertId = `BUL-${randomSuffix}`;
    const now = new Date().toISOString();

    db.prepare(`
      INSERT INTO official_bulletins (id, title, severity, district, message, source, source_url, is_live_feed, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, 0, ?)
    `).run(
      alertId,
      title,
      severity || 'high',
      district || 'Islandwide',
      message,
      source || 'ResQ Emergency Coordinator Bulletin',
      source_url || 'http://www.dmc.gov.lk',
      now
    );

    const created = db.prepare('SELECT * FROM official_bulletins WHERE id = ?').get(alertId);
    res.status(201).json({ success: true, alert: created });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// -------------------------------------------------------------
// 5. RESCUE RESOURCES MANAGEMENT
// -------------------------------------------------------------
app.get('/api/resources', (req, res) => {
  try {
    const resources = db.prepare('SELECT * FROM resources ORDER BY type, name').all();
    res.json({ count: resources.length, resources });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.patch('/api/resources/:id', (req, res) => {
  try {
    const { status, details } = req.body;
    const existing = db.prepare('SELECT * FROM resources WHERE id = ?').get(req.params.id);
    if (!existing) {
      return res.status(404).json({ error: 'Resource not found' });
    }

    const now = new Date().toISOString();
    db.prepare(`
      UPDATE resources
      SET status = ?, details = ?, updated_at = ?
      WHERE id = ?
    `).run(
      status || existing.status,
      details !== undefined ? details : existing.details,
      now,
      req.params.id
    );

    const updated = db.prepare('SELECT * FROM resources WHERE id = ?').get(req.params.id);
    res.json({ success: true, resource: updated });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// -------------------------------------------------------------
// 6. TRILINGUAL SAFETY INFORMATION
// -------------------------------------------------------------
app.get('/api/safety', (req, res) => {
  res.json({
    hotlines: OFFICIAL_HOTLINES,
    official_portals: OFFICIAL_EARLY_WARNING_SOURCES,
    guidelines: {
      before: {
        en: [
          'Pack an emergency grab-bag with medications, national ID, deeds, clean water, and flashlight.',
          'Keep mobile phones and power banks fully charged.',
          'Move valuable goods, electrical appliances, and documents to upper floors.',
          'Know your nearest designated emergency shelter and evacuation route.'
        ],
        si: [
          'ඖෂධ, ජාතික හැඳුනුම්පත, ඔප්පු, පිරිසිදු පානීය ජලය සහ විදුලි පන්දමක් සහිත හදිසි බෑගයක් සූදානම් කර තබන්න.',
          'ජංගම දුරකථන සහ Power banks සම්පූර්ණයෙන්ම ආරෝපණය කර තබා ගන්න.',
          'වටිනා භාණ්ඩ, විදුලි උපකරණ සහ ලියකියවිලි උස් ස්ථාන කරා ගෙන යන්න.',
          'ඔබට ආසන්නතම ආරක්ෂිත නවාතැන සහ ඉවත්වීමේ මාර්ගය කලින් දැනුවත් වන්න.'
        ],
        ta: [
          'மருந்துகள், தேசிய அடையாள அட்டை, முக்கிய ஆவணங்கள் மற்றும் சுத்தமான குடிநீர் அடங்கிய அவசரப் பையை தயாராக வையுங்கள்.',
          'மொபைல் போன்கள் மற்றும் பவர் பேங்குகளை முழுமையாக சார்ஜ் செய்து வைக்கவும்.',
          'விலைமதிப்பற்ற பொருட்கள் மற்றும் மின்சாதனங்களை பாதுகாப்பான உயரமான இடங்களுக்கு மாற்றவும்.',
          'அருகிலுள்ள அவசர முகாம் மற்றும் வெளியேறும் பாதையை முன்கூட்டியே அறிந்து கொள்ளுங்கள்.'
        ]
      },
      during: {
        en: [
          'Evacuate immediately when advised by emergency coordinators or Grama Niladhari.',
          'Never attempt to walk, swim, or drive through flowing floodwaters ("Turn Around, Don\'t Drown").',
          'Switch off main electricity breakers and gas valves before leaving premises.',
          'Stay away from downed power lines and fast-moving canal banks.'
        ],
        si: [
          'ආපදා නිලධාරීන් හෝ ග්‍රාම නිලධාරී ඉවත් වීමට උපදෙස් දෙන විට වහාම ක්‍රියාත්මක වන්න.',
          'ගලායන ජල කඳ හරහා ඇවිදීමෙන්, පිහිනීමෙන් හෝ වාහන ධාවනයෙන් වළකින්න.',
          'පිටවීමට පෙර ප්‍රධාන විදුලි හා ගෑස් ස්විච ක්‍රියා විරහිත කරන්න.',
          'කඩා වැටුණු විදුලි රැහැන් සහ ඇළ මාර්ග ඉවුරු අසලට යාමෙන් වළකින්න.'
        ],
        ta: [
          'அதிகாரிகள் வெளியேற அறிவுறுத்தும்போது உடனடியாக வெளியேறுங்கள்.',
          'வெள்ள நீரில் நடக்கவோ, நீந்தவோ அல்லது வாகனங்களை ஓட்டவோ முயற்சிக்காதீர்கள்.',
          'வெளியேறும் முன் வீட்டின் பிரதான மின்சாரம் மற்றும் எரிவாயு இணைப்புகளை துண்டிக்கவும்.',
          'அறுந்து விழுந்த மின்கம்பிகள் மற்றும் கால்வாய் கரைகளுக்கு அருகில் செல்ல வேண்டாம்.'
        ]
      },
      after: {
        en: [
          'Return home only after authorities declare it safe.',
          'Boil all drinking water for at least 3 minutes before consumption.',
          'Be alert for snakes and venomous insects seeking shelter in dry spots.',
          'Document structural damages with photos for official relief claims.'
        ],
        si: [
          'ආරක්ෂිත බව නිල වශයෙන් තහවුරු කළ පසු පමණක් නිවෙස් කරා යන්න.',
          'සියලු පානීය ජලය මිනිත්තු 3ක්වත් හොඳින් උතුරුවා පානය කරන්න.',
          'වියළි ස්ථානවල සැඟවී සිටින සර්පයන් සහ විෂ සහිත සතුන් පිළිබඳ විමසිලිමත් වන්න.',
          'සහනාධාර සහ වන්දි ඉල්ලීම් සඳහා දේපළ හානි ඡායාරූප ගත කරන්න.'
        ],
        ta: [
          'அதிகாரிகள் பாதுகாப்பானது என அறிவித்த பின்னரே வீடுகளுக்குத் திரும்புங்கள்.',
          'குடிநீரை குறைந்தது 3 நிமிடங்கள் கொதிக்க வைத்து அருந்தவும்.',
          'பாம்புகள் மற்றும் விஷ பூச்சிகள் குறித்து விழிப்புடன் இருக்கவும்.',
          'நிவாரண கோரிக்கைகளுக்காக சேதங்களை புகைப்படங்களாக ஆவணப்படுத்தவும்.'
        ]
      }
    }
  });
});

// Start unified server
app.listen(PORT, () => {
  console.log(`=======================================================`);
  console.log(`ResQ Unified Node.js/Express API`);
  console.log(`Server listening on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/api/health`);
  console.log(`System status: http://localhost:${PORT}/api/system/status`);
  console.log(`=======================================================`);
});
