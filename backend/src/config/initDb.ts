import db from './database';

const initDatabase = () => {
  // Users table (both farmers and lenders)
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      name TEXT NOT NULL,
      role TEXT NOT NULL CHECK(role IN ('farmer', 'lender', 'admin')),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Farms table
  db.exec(`
    CREATE TABLE IF NOT EXISTS farms (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      name TEXT NOT NULL,
      location TEXT NOT NULL,
      latitude REAL NOT NULL,
      longitude REAL NOT NULL,
      total_hectares REAL NOT NULL,
      crop_type TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  // Satellite data table
  db.exec(`
    CREATE TABLE IF NOT EXISTS satellite_data (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      farm_id INTEGER NOT NULL,
      date DATE NOT NULL,
      ndvi_value REAL NOT NULL,
      health_status TEXT NOT NULL,
      cloud_coverage REAL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (farm_id) REFERENCES farms(id) ON DELETE CASCADE
    )
  `);

  // Loan requests table
  db.exec(`
    CREATE TABLE IF NOT EXISTS loan_requests (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      farmer_id INTEGER NOT NULL,
      farm_id INTEGER NOT NULL,
      amount REAL NOT NULL,
      purpose TEXT NOT NULL,
      duration_months INTEGER NOT NULL,
      interest_rate REAL,
      risk_score REAL,
      status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending', 'approved', 'rejected', 'active', 'completed')),
      lender_id INTEGER,
      approved_at DATETIME,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (farmer_id) REFERENCES users(id),
      FOREIGN KEY (farm_id) REFERENCES farms(id),
      FOREIGN KEY (lender_id) REFERENCES users(id)
    )
  `);

  // Payments table
  db.exec(`
    CREATE TABLE IF NOT EXISTS payments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      loan_id INTEGER NOT NULL,
      amount REAL NOT NULL,
      payment_date DATE NOT NULL,
      status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending', 'completed', 'overdue')),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (loan_id) REFERENCES loan_requests(id)
    )
  `);

  console.log('Database initialized successfully!');
};

// Run initialization if this file is executed directly
if (require.main === module) {
  initDatabase();
  process.exit(0);
}

export default initDatabase;
