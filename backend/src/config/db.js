const mysql = require('mysql2/promise');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');
const dotenv = require('dotenv');

dotenv.config();

const DB_CONFIG = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT, 10) || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'event_management',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  dateStrings: true
};

let dbPool = null;
let isFallbackSqlite = false;
let sqliteDb = null;

// Helper to initialize fallback SQLite DB if MySQL is offline
async function initSqliteFallback() {
  return new Promise((resolve, reject) => {
    const dbPath = path.join(__dirname, '..', '..', 'data', 'fallback_eventhub.db');
    const dataDir = path.dirname(dbPath);
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }

    sqliteDb = new sqlite3.Database(dbPath, (err) => {
      if (err) return reject(err);

      console.log('📦 Fallback storage initialized at', dbPath);
      
      sqliteDb.serialize(() => {
        sqliteDb.run('PRAGMA foreign_keys = OFF'); // Disable during table setup

        sqliteDb.run(`
          CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT NOT NULL UNIQUE,
            password TEXT NOT NULL,
            role TEXT NOT NULL DEFAULT 'student' CHECK(role IN ('student', 'admin')),
            student_id TEXT,
            department TEXT,
            phone TEXT,
            avatar_url TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
          )
        `);

        sqliteDb.run(`
          CREATE TABLE IF NOT EXISTS events (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            description TEXT NOT NULL,
            category TEXT NOT NULL CHECK(category IN ('Technical', 'Cultural', 'Sports', 'Workshop', 'Academic', 'Gaming', 'Entrepreneurship', 'Arts')),
            date DATE NOT NULL,
            time TEXT NOT NULL,
            venue TEXT NOT NULL,
            capacity INTEGER NOT NULL CHECK(capacity > 0),
            organizer TEXT NOT NULL,
            image_url TEXT,
            status TEXT DEFAULT 'Upcoming' CHECK(status IN ('Upcoming', 'Ongoing', 'Completed', 'Cancelled')),
            created_by INTEGER,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
          )
        `);

        sqliteDb.run(`
          CREATE TABLE IF NOT EXISTS registrations (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            event_id INTEGER NOT NULL,
            registration_date DATETIME DEFAULT CURRENT_TIMESTAMP,
            status TEXT NOT NULL DEFAULT 'Registered' CHECK(status IN ('Registered', 'Attended', 'Cancelled')),
            notes TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
            FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE,
            UNIQUE(user_id, event_id)
          )
        `);

        // Check if users exist, otherwise insert seeds
        sqliteDb.get('SELECT COUNT(*) as count FROM users', (countErr, row) => {
          if (!countErr && (!row || row.count === 0)) {
            console.log('🌱 Seeding initial records into database...');
            
            const insertUsers = [
              [1, 'Admin Officer', 'admin@eventhub.com', '$2a$10$Ci28hw0TK6HWYqJ9oe6t3OSrTp4CV7m4m0ZyFUSl64d9p02cbwU/K', 'admin', 'ADM-001', 'Student Affairs', '+1-555-0199'],
              [2, 'Aarav Sharma', 'aarav.sharma@college.edu', '$2a$10$z9ziqxlE21XxOXt99/CHH.ICjZ1z0jYd0q65mlxNWIvYm8RbGmXIe', 'student', 'CS2023-042', 'Computer Science', '+1-555-0101'],
              [3, 'Sophia Chen', 'sophia.chen@college.edu', '$2a$10$z9ziqxlE21XxOXt99/CHH.ICjZ1z0jYd0q65mlxNWIvYm8RbGmXIe', 'student', 'EC2023-118', 'Electronics & Comm', '+1-555-0102'],
              [4, 'Marcus Johnson', 'marcus.j@college.edu', '$2a$10$z9ziqxlE21XxOXt99/CHH.ICjZ1z0jYd0q65mlxNWIvYm8RbGmXIe', 'student', 'ME2022-089', 'Mechanical Eng', '+1-555-0103'],
              [5, 'Ananya Patel', 'ananya.patel@college.edu', '$2a$10$z9ziqxlE21XxOXt99/CHH.ICjZ1z0jYd0q65mlxNWIvYm8RbGmXIe', 'student', 'BT2024-015', 'Biotechnology', '+1-555-0104'],
              [6, 'Liam Rodriguez', 'liam.r@college.edu', '$2a$10$z9ziqxlE21XxOXt99/CHH.ICjZ1z0jYd0q65mlxNWIvYm8RbGmXIe', 'student', 'DS2023-067', 'Data Science', '+1-555-0105']
            ];

            insertUsers.forEach(u => {
              sqliteDb.run('INSERT OR IGNORE INTO users (id, name, email, password, role, student_id, department, phone) VALUES (?, ?, ?, ?, ?, ?, ?, ?)', u);
            });

            const insertEvents = [
              [1, 'HackForge 2026: 36-Hour National Hackathon', 'Join the premier annual inter-college hackathon! Build game-changing solutions in AI, Web3, and GreenTech with industry mentors and $10k in prizes.', 'Technical', '2026-10-15', '09:00 AM', 'Main Auditorium & CS Labs', 150, 'ACM Student Chapter', 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=800&auto=format&fit=crop&q=80', 'Upcoming', 1],
              [2, 'Nexus Cultural Fest & Musical Night', 'A vibrant celebration of music, dance, theatrical acts, and battle of the bands featuring headline performances and art installations.', 'Cultural', '2026-10-22', '05:30 PM', 'Open Air Amphitheatre', 300, 'Cultural Committee', 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800&auto=format&fit=crop&q=80', 'Upcoming', 1],
              [3, 'Applied GenAI & LLM Masterclass', 'Hands-on practical workshop covering retrieval augmented generation (RAG), fine-tuning local models, and deploying production AI agents.', 'Workshop', '2026-10-08', '02:00 PM', 'Seminar Hall B', 60, 'AI & Robotics Club', 'https://images.unsplash.com/photo-1677442136019-21780efad99a?w=800&auto=format&fit=crop&q=80', 'Upcoming', 1],
              [4, 'Inter-College Esports Championship', 'Compete in Valorant, Rocket League, and EA Sports FC tournaments for collegiate bragging rights and streaming showcase.', 'Gaming', '2026-10-18', '11:00 AM', 'Student Activity Center', 80, 'Esports Society', 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&auto=format&fit=crop&q=80', 'Upcoming', 1],
              [5, 'Campus Basketball League - Finals', 'Cheer on your department team in the thrilling final matches of the autumn basketball tournament. Refreshments and halftime contests included!', 'Sports', '2026-10-05', '04:00 PM', 'Indoor Sports Complex', 120, 'Sports Council', 'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=800&auto=format&fit=crop&q=80', 'Upcoming', 1],
              [6, 'InnovateX: Startup Pitch & VC Summit', 'Pitch your entrepreneurial venture to angel investors, network with founders, and learn how to secure seed funding.', 'Entrepreneurship', '2026-11-02', '10:00 AM', 'Executive Conference Hall', 50, 'E-Cell & Incubator', 'https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=800&auto=format&fit=crop&q=80', 'Upcoming', 1],
              [7, 'Quantum Computing & Algorithms Symposium', 'Distinguished faculty lecture and research paper symposium delving into quantum supremacy, Qiskit simulations, and cryptographic implications.', 'Academic', '2026-11-10', '01:30 PM', 'Science Block Aud-2', 75, 'Physics & Computing Dept', 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=800&auto=format&fit=crop&q=80', 'Upcoming', 1],
              [8, 'Canvas & Clay: Visual Arts Exhibition', 'Showcase of contemporary student artwork, pottery demonstrations, live portrait sketching, and gallery auction.', 'Arts', '2026-11-14', '11:00 AM', 'Fine Arts Gallery', 90, 'Fine Arts Guild', 'https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?w=800&auto=format&fit=crop&q=80', 'Upcoming', 1]
            ];

            insertEvents.forEach(e => {
              sqliteDb.run('INSERT OR IGNORE INTO events (id, title, description, category, date, time, venue, capacity, organizer, image_url, status, created_by) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', e);
            });

            const insertRegs = [
              [2, 1, 'Registered', 'Looking forward to the hackathon!'],
              [2, 3, 'Registered', 'Interested in LLM agents'],
              [3, 1, 'Registered', 'Team lead for HackForge'],
              [3, 2, 'Registered', 'Performing in acoustic set'],
              [4, 5, 'Registered', 'Center player for Mech team'],
              [5, 3, 'Registered', 'Bioinformatics application focus'],
              [6, 4, 'Registered', 'Valorant captain']
            ];

            insertRegs.forEach(r => {
              sqliteDb.run('INSERT OR IGNORE INTO registrations (user_id, event_id, status, notes) VALUES (?, ?, ?, ?)', r);
            });
          }

          sqliteDb.run('PRAGMA foreign_keys = ON', (pragmaErr) => {
            if (pragmaErr) console.warn('Pragma error:', pragmaErr);
            resolve(sqliteDb);
          });
        });
      });
    });
  });
}

// Initialize database connection
async function initDB() {
  try {
    const testPool = mysql.createPool(DB_CONFIG);
    const conn = await testPool.getConnection();
    await conn.ping();
    conn.release();

    dbPool = testPool;
    isFallbackSqlite = false;
    console.log(`✅ MySQL connected successfully to '${DB_CONFIG.database}' on ${DB_CONFIG.host}:${DB_CONFIG.port}`);

    // Auto-create database & tables if needed from schema file
    try {
      const schemaPath = path.join(__dirname, '..', '..', '..', 'database', 'event_management.sql');
      if (fs.existsSync(schemaPath)) {
        const [tables] = await dbPool.query("SHOW TABLES LIKE 'users'");
        if (tables.length === 0) {
          console.log('⚡ Initializing MySQL schema and seed data...');
          const schemaSql = fs.readFileSync(schemaPath, 'utf8');
          const statements = schemaSql
            .split(';')
            .map(s => s.trim())
            .filter(s => s.length > 0 && !s.toLowerCase().startsWith('create database') && !s.toLowerCase().startsWith('use '));
          
          for (const stmt of statements) {
            await dbPool.query(stmt);
          }
          console.log('✅ MySQL schema seeded successfully.');
        }
      }
    } catch (schemaErr) {
      console.warn('Note on schema initialization:', schemaErr.message);
    }
  } catch (err) {
    console.warn(`⚠️ MySQL is not reachable (${err.message}). Switching gracefully to local relational engine for seamless execution.`);
    isFallbackSqlite = true;
    await initSqliteFallback();
  }
}

// Unified query wrapper matching mysql2 [rows, fields] signature
async function query(sql, params = []) {
  if (!isFallbackSqlite && dbPool) {
    return await dbPool.query(sql, params);
  }

  return new Promise((resolve, reject) => {
    if (!sqliteDb) {
      return reject(new Error('Database not initialized'));
    }

    const trimmedSql = sql.trim();
    const isSelect = trimmedSql.toUpperCase().startsWith('SELECT') || trimmedSql.toUpperCase().startsWith('PRAGMA');

    // Adapt LIMIT ?, ? or LIMIT ? OFFSET ? if needed
    if (isSelect) {
      sqliteDb.all(trimmedSql, params, (err, rows) => {
        if (err) return reject(err);
        resolve([rows || [], null]);
      });
    } else {
      sqliteDb.run(trimmedSql, params, function (err) {
        if (err) return reject(err);
        resolve([{
          insertId: this.lastID,
          affectedRows: this.changes,
          changedRows: this.changes
        }, null]);
      });
    }
  });
}

// Execute wrapper
async function execute(sql, params = []) {
  return await query(sql, params);
}

module.exports = {
  initDB,
  query,
  execute,
  getPool: () => dbPool,
  isFallback: () => isFallbackSqlite
};
