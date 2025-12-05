const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, '../database/grownex.db');

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
  } else {
    console.log('Connected to SQLite database');
    initializeTables();
  }
});

function initializeTables() {
  const soilDataTable = `
    CREATE TABLE IF NOT EXISTS soil_data (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      land_area REAL NOT NULL,
      location TEXT NOT NULL,
      soil_type TEXT NOT NULL,
      irrigation TEXT NOT NULL,
      ph_level REAL NOT NULL,
      nitrogen REAL NOT NULL,
      phosphorus REAL NOT NULL,
      potassium REAL NOT NULL,
      organic_carbon REAL NOT NULL,
      zinc REAL NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `;

  const recommendationsTable = `
    CREATE TABLE IF NOT EXISTS recommendations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      soil_data_id INTEGER NOT NULL,
      soil_score REAL NOT NULL,
      fertilizers TEXT NOT NULL,
      pesticides TEXT NOT NULL,
      recommended_crops TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (soil_data_id) REFERENCES soil_data (id)
    )
  `;

  db.run(soilDataTable);
  db.run(recommendationsTable);
}

module.exports = db;
