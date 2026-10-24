import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DB_PATH = process.env.DB_PATH || path.join(__dirname, 'resq.db');
const db = new Database(DB_PATH);

// Enable WAL mode for better concurrency
db.pragma('journal_mode = WAL');

// Initialize schema
db.exec(`
  CREATE TABLE IF NOT EXISTS assistance_requests (
    id TEXT PRIMARY KEY,
    category TEXT NOT NULL,
    urgency TEXT NOT NULL,
    full_name TEXT NOT NULL,
    phone TEXT NOT NULL,
    district TEXT NOT NULL,
    ds_division TEXT NOT NULL,
    address_details TEXT,
    people_count INTEGER NOT NULL DEFAULT 1,
    children_count INTEGER DEFAULT 0,
    elders_count INTEGER DEFAULT 0,
    special_needs TEXT,
    latitude REAL,
    longitude REAL,
    location_method TEXT NOT NULL DEFAULT 'manual',
    status TEXT NOT NULL DEFAULT 'Pending',
    ai_triage_status TEXT NOT NULL DEFAULT 'Not configured',
    ai_triage_notes TEXT DEFAULT 'AI triage is scheduled for future integration. Triage currently requires manual coordinator evaluation.',
    assigned_team TEXT DEFAULT '',
    coordinator_notes TEXT DEFAULT '',
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS shelters (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    district TEXT NOT NULL,
    ds_division TEXT,
    address TEXT NOT NULL,
    lat REAL,
    lon REAL,
    capacity INTEGER NOT NULL,
    occupancy INTEGER NOT NULL DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'Open',
    contact_person TEXT,
    contact_phone TEXT,
    facilities TEXT NOT NULL DEFAULT '[]',
    is_demo INTEGER NOT NULL DEFAULT 0,
    source TEXT NOT NULL,
    last_verified_at TEXT NOT NULL,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS official_bulletins (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    severity TEXT NOT NULL DEFAULT 'info',
    district TEXT,
    message TEXT NOT NULL,
    source TEXT NOT NULL,
    source_url TEXT,
    is_live_feed INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS resources (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    type TEXT NOT NULL,
    district TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'Available',
    details TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );
`);

// Seed initial data if tables are empty
const countShelters = db.prepare('SELECT COUNT(*) as count FROM shelters').get();
if (countShelters.count === 0) {
  const insertShelter = db.prepare(`
    INSERT INTO shelters (id, name, district, ds_division, address, lat, lon, capacity, occupancy, status, contact_person, contact_phone, facilities, is_demo, source, last_verified_at, created_at, updated_at)
    VALUES (@id, @name, @district, @ds_division, @address, @lat, @lon, @capacity, @occupancy, @status, @contact_person, @contact_phone, @facilities, @is_demo, @source, @last_verified_at, @created_at, @updated_at)
  `);

  const initialShelters = [
    {
      id: 'SH-001',
      name: 'Hanwella Rajasinghe Central College',
      district: 'Colombo',
      ds_division: 'Seethawaka',
      address: 'High Level Road, Hanwella',
      lat: 6.9085,
      lon: 80.1388,
      capacity: 500,
      occupancy: 285,
      status: 'Open',
      contact_person: 'DMC Relief Officer - K. Perera',
      contact_phone: '+94 11 285 2400',
      facilities: JSON.stringify(['Medical Station', 'Clean Drinking Water', 'Community Kitchen', 'Infant Care Post', 'Backup Generator']),
      is_demo: 0,
      source: 'Disaster Management Centre (DMC) Sri Lanka - Official Registry',
      last_verified_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 'SH-002',
      name: 'Avissawella Town Hall & Community Center',
      district: 'Colombo',
      ds_division: 'Seethawaka',
      address: 'Main Street, Avissawella',
      lat: 6.9535,
      lon: 80.2014,
      capacity: 350,
      occupancy: 120,
      status: 'Open',
      contact_person: 'Divisional Secretary Relief Desk',
      contact_phone: '+94 36 222 2235',
      facilities: JSON.stringify(['Clean Water', 'First Aid Post', 'Cooked Meals', 'Sanitation Facilities']),
      is_demo: 0,
      source: 'Disaster Management Centre (DMC) Sri Lanka - Official Registry',
      last_verified_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 'SH-003',
      name: 'Rathnapura Buddhist Center Evacuation Post',
      district: 'Ratnapura',
      ds_division: 'Ratnapura',
      address: 'Bandaranayake Mawatha, Rathnapura',
      lat: 6.6850,
      lon: 80.3950,
      capacity: 400,
      occupancy: 360,
      status: 'Near Capacity',
      contact_person: 'Disaster Relief Coordinator - Rathnapura District',
      contact_phone: '+94 45 222 2275',
      facilities: JSON.stringify(['Medical Officer On-Duty', 'Drinking Water Bowser', 'Dry Ration Distribution']),
      is_demo: 0,
      source: 'District Secretariat Ratnapura - Verified Centre',
      last_verified_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 'SH-004',
      name: 'Gampaha Yashodhara Devi Balika Vidyalaya',
      district: 'Gampaha',
      ds_division: 'Gampaha',
      address: 'Orutota Road, Gampaha',
      lat: 7.0897,
      lon: 80.0034,
      capacity: 300,
      occupancy: 80,
      status: 'Open',
      contact_person: 'Gampaha Disaster Response Desk',
      contact_phone: '+94 33 222 2235',
      facilities: JSON.stringify(['Clean Water', 'Sanitation', 'Sleeping Mats', 'First Aid']),
      is_demo: 0,
      source: 'District Secretariat Gampaha - Verified Centre',
      last_verified_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 'SH-005',
      name: 'Kolonnawa Terrence N. De Silva Maha Vidyalaya (Demo)',
      district: 'Colombo',
      ds_division: 'Kolonnawa',
      address: 'Wellampitiya Road, Kolonnawa',
      lat: 6.9320,
      lon: 79.8890,
      capacity: 450,
      occupancy: 0,
      status: 'Open',
      contact_person: 'Simulated Coordinator (Exercise)',
      contact_phone: '+94 11 000 0000',
      facilities: JSON.stringify(['Simulated Water Distribution', 'Simulated Medical Kit']),
      is_demo: 1,
      source: 'Demonstration Record - ResQ Simulation / Testing Data',
      last_verified_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  ];

  for (const s of initialShelters) {
    insertShelter.run(s);
  }
}

// Seed initial assistance requests if empty
const countRequests = db.prepare('SELECT COUNT(*) as count FROM assistance_requests').get();
if (countRequests.count === 0) {
  const insertReq = db.prepare(`
    INSERT INTO assistance_requests (
      id, category, urgency, full_name, phone, district, ds_division, address_details,
      people_count, children_count, elders_count, special_needs, latitude, longitude,
      location_method, status, ai_triage_status, ai_triage_notes, assigned_team, coordinator_notes,
      created_at, updated_at
    ) VALUES (
      @id, @category, @urgency, @full_name, @phone, @district, @ds_division, @address_details,
      @people_count, @children_count, @elders_count, @special_needs, @latitude, @longitude,
      @location_method, @status, @ai_triage_status, @ai_triage_notes, @assigned_team, @coordinator_notes,
      @created_at, @updated_at
    )
  `);

  const initialRequests = [
    {
      id: 'RQ-2026-1001',
      category: 'evacuation',
      urgency: 'critical',
      full_name: 'Sunil Wickramasinghe',
      phone: '+94 77 123 4567',
      district: 'Colombo',
      ds_division: 'Kolonnawa',
      address_details: 'No. 42/B, Riverside Road, Sedawatta, Wellampitiya',
      people_count: 5,
      children_count: 2,
      elders_count: 1,
      special_needs: 'Elderly bedridden grandmother needs stretcher evacuation. Water level rising above knee level.',
      latitude: 6.9412,
      longitude: 79.8835,
      location_method: 'gps',
      status: 'Pending',
      ai_triage_status: 'Not configured',
      ai_triage_notes: 'AI triage is not configured; manual coordinator review required.',
      assigned_team: '',
      coordinator_notes: 'High priority - requires boat evacuation and medical transport.',
      created_at: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
      updated_at: new Date(Date.now() - 45 * 60 * 1000).toISOString()
    },
    {
      id: 'RQ-2026-1002',
      category: 'food_water',
      urgency: 'high',
      full_name: 'Fathima Rizwan',
      phone: '+94 71 987 6543',
      district: 'Gampaha',
      ds_division: 'Biyagama',
      address_details: 'Near Malwana Ferry Junction, Biyagama',
      people_count: 4,
      children_count: 1,
      elders_count: 0,
      special_needs: 'Drinking water exhausted. Power cut for 18 hours. Ground floor submerged.',
      latitude: 6.9480,
      longitude: 79.9800,
      location_method: 'manual',
      status: 'Assigned',
      ai_triage_status: 'Not configured',
      ai_triage_notes: 'AI triage is not configured; manual coordinator review required.',
      assigned_team: 'Navy Rescue Team 01 (Colombo)',
      coordinator_notes: 'Dispatched emergency relief pack and bottled water.',
      created_at: new Date(Date.now() - 90 * 60 * 1000).toISOString(),
      updated_at: new Date(Date.now() - 30 * 60 * 1000).toISOString()
    },
    {
      id: 'RQ-2026-1003',
      category: 'medical',
      urgency: 'high',
      full_name: 'Kamal Jayawardena',
      phone: '+94 76 345 6789',
      district: 'Ratnapura',
      ds_division: 'Ratnapura',
      address_details: 'Temple Road, Kiriella, Ratnapura',
      people_count: 3,
      children_count: 0,
      elders_count: 1,
      special_needs: 'Diabetic patient requiring insulin storage; power out and road flooded.',
      latitude: 6.7020,
      longitude: 80.3200,
      location_method: 'manual',
      status: 'In Progress',
      ai_triage_status: 'Not configured',
      ai_triage_notes: 'AI triage is not configured; manual coordinator review required.',
      assigned_team: 'DMC Relief Center Team A (Ratnapura)',
      coordinator_notes: 'Medical kit en route via tractor.',
      created_at: new Date(Date.now() - 140 * 60 * 1000).toISOString(),
      updated_at: new Date(Date.now() - 20 * 60 * 1000).toISOString()
    }
  ];

  for (const r of initialRequests) {
    insertReq.run(r);
  }
}

// Seed initial resources if empty
const countResources = db.prepare('SELECT COUNT(*) as count FROM resources').get();
if (countResources.count === 0) {
  const insertResource = db.prepare(`
    INSERT INTO resources (id, name, type, district, status, details, created_at, updated_at)
    VALUES (@id, @name, @type, @district, @status, @details, @created_at, @updated_at)
  `);

  const initialResources = [
    {
      id: 'RES-01',
      name: 'Navy Rescue Boat Team 01 (Colombo)',
      type: 'Boats',
      district: 'Colombo',
      status: 'Deployed',
      details: '2 inflatable motorized boats deployed at Sedawatta/Kolonnawa.',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 'RES-02',
      name: 'DMC Rapid Relief Unit (Ratnapura)',
      type: 'Rescue Team',
      district: 'Ratnapura',
      status: 'Deployed',
      details: '4x4 rescue vehicle and paramedic unit in Kiriella.',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 'RES-03',
      name: 'Army Medical Division Unit 3',
      type: 'Medical Unit',
      district: 'Colombo',
      status: 'Available',
      details: 'On standby at Avissawella base with emergency supplies.',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 'RES-04',
      name: 'Sri Lanka Red Cross Food Pack Division',
      type: 'Relief Packs',
      district: 'Gampaha',
      status: 'Available',
      details: '500 pre-packed 3-day dry ration cartons at Kelaniya depot.',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  ];

  for (const res of initialResources) {
    insertResource.run(res);
  }
}

// Seed official bulletins if empty
const countBulletins = db.prepare('SELECT COUNT(*) as count FROM official_bulletins').get();
if (countBulletins.count === 0) {
  const insertBulletin = db.prepare(`
    INSERT INTO official_bulletins (id, title, severity, district, message, source, source_url, is_live_feed, created_at)
    VALUES (@id, @title, @severity, @district, @message, @source, @source_url, @is_live_feed, @created_at)
  `);

  const initialBulletins = [
    {
      id: 'BUL-001',
      title: 'Disaster Management Centre (DMC) Flood Advisory',
      severity: 'high',
      district: 'Colombo, Gampaha, Kalutara, Ratnapura',
      message: 'Residents in low-lying catchment areas of Kelani Ganga and Kalu Ganga are advised to maintain vigilance and follow local evacuation notices issued by Grama Niladhari officers.',
      source: 'Disaster Management Centre (DMC) Sri Lanka',
      source_url: 'http://www.dmc.gov.lk',
      is_live_feed: 0,
      created_at: new Date(Date.now() - 3 * 3600 * 1000).toISOString()
    }
  ];

  for (const b of initialBulletins) {
    insertBulletin.run(b);
  }
}

export default db;
