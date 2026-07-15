const fs = require('fs');
const path = require('path');

let dbInstance = null;
const dbPath = path.join(__dirname, 'nexus_clone.db');
const jsonDbPath = path.join(__dirname, 'nexus_clone.json');

// Initialize database
function initDb() {
  try {
    // Try to load better-sqlite3 or sqlite3
    const Database = require('better-sqlite3');
    const db = new Database(dbPath);
    console.log('[DB] Connected to SQLite database successfully.');
    
    // Create tables
    db.exec(`
      CREATE TABLE IF NOT EXISTS projects (
          id              INTEGER PRIMARY KEY AUTOINCREMENT,
          url             TEXT NOT NULL,
          project_name    TEXT,
          site_type       TEXT CHECK(site_type IN ('static','spa','unknown')) DEFAULT 'unknown',
          status          TEXT CHECK(status IN ('pending','processing','completed','failed')) DEFAULT 'pending',
          created_at      DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at      DATETIME DEFAULT CURRENT_TIMESTAMP,
          user_id         TEXT,
          config_json     TEXT
      );

      CREATE TABLE IF NOT EXISTS clone_results (
          id              INTEGER PRIMARY KEY AUTOINCREMENT,
          project_id      INTEGER NOT NULL REFERENCES projects(id),
          version         INTEGER NOT NULL DEFAULT 1,
          tool_used       TEXT CHECK(tool_used IN ('decant','site-cloner','both')),
          output_path     TEXT NOT NULL,
          zip_path        TEXT,
          file_size_bytes INTEGER,
          total_pages     INTEGER DEFAULT 1,
          tokens_json_path TEXT,
          diff_from_prev  TEXT,
          created_at      DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS analysis (
          id                  INTEGER PRIMARY KEY AUTOINCREMENT,
          clone_result_id     INTEGER NOT NULL REFERENCES clone_results(id),
          similarity_score    REAL,
          broken_assets_count INTEGER DEFAULT 0,
          broken_assets_list  TEXT,
          ai_suggestions      TEXT,
          scraped_data_path   TEXT,
          analyzed_at         DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `);
    
    dbInstance = {
      type: 'sqlite',
      exec: (sql) => db.exec(sql),
      run: (sql, params = []) => {
        const stmt = db.prepare(sql);
        return stmt.run(params);
      },
      get: (sql, params = []) => {
        const stmt = db.prepare(sql);
        return stmt.get(params);
      },
      all: (sql, params = []) => {
        const stmt = db.prepare(sql);
        return stmt.all(params);
      }
    };
  } catch (err) {
    console.warn('[DB] SQLite failed to initialize, falling back to JSON Database wrapper:', err.message);
    
    // Fallback JSON-based Database implementation
    if (!fs.existsSync(jsonDbPath)) {
      fs.writeFileSync(jsonDbPath, JSON.stringify({
        projects: [],
        clone_results: [],
        analysis: []
      }, null, 2));
    }
    
    const readJson = () => JSON.parse(fs.readFileSync(jsonDbPath, 'utf8'));
    const writeJson = (data) => fs.writeFileSync(jsonDbPath, JSON.stringify(data, null, 2));
    
    dbInstance = {
      type: 'json',
      run: (sql, params = []) => {
        const data = readJson();
        if (sql.includes('INSERT INTO projects')) {
          const id = data.projects.length + 1;
          const project = {
            id,
            url: params[0],
            project_name: params[1],
            site_type: params[2] || 'unknown',
            status: params[3] || 'pending',
            config_json: params[4] || '{}',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          };
          data.projects.push(project);
          writeJson(data);
          return { lastInsertRowid: id, changes: 1 };
        }
        
        if (sql.includes('INSERT INTO clone_results')) {
          const id = data.clone_results.length + 1;
          const result = {
            id,
            project_id: params[0],
            version: params[1] || 1,
            tool_used: params[2],
            output_path: params[3],
            zip_path: params[4],
            file_size_bytes: params[5],
            total_pages: params[6] || 1,
            tokens_json_path: params[7],
            created_at: new Date().toISOString()
          };
          data.clone_results.push(result);
          writeJson(data);
          return { lastInsertRowid: id, changes: 1 };
        }

        if (sql.includes('INSERT INTO analysis')) {
          const id = data.analysis.length + 1;
          const anal = {
            id,
            clone_result_id: params[0],
            similarity_score: params[1],
            broken_assets_count: params[2] || 0,
            broken_assets_list: params[3] || '[]',
            ai_suggestions: params[4] || '',
            scraped_data_path: params[5],
            analyzed_at: new Date().toISOString()
          };
          data.analysis.push(anal);
          writeJson(data);
          return { lastInsertRowid: id, changes: 1 };
        }
        
        if (sql.includes('UPDATE projects SET status = ?')) {
          const id = params[params.length - 1];
          const status = params[0];
          const project = data.projects.find(p => p.id === id);
          if (project) {
            project.status = status;
            project.updated_at = new Date().toISOString();
            writeJson(data);
            return { changes: 1 };
          }
        }
        return { changes: 0 };
      },
      get: (sql, params = []) => {
        const data = readJson();
        if (sql.includes('FROM projects WHERE id = ?')) {
          const id = params[0];
          return data.projects.find(p => p.id === id) || null;
        }
        if (sql.includes('FROM clone_results WHERE project_id = ?')) {
          const projectId = params[0];
          const results = data.clone_results.filter(r => r.project_id === projectId);
          return results[results.length - 1] || null;
        }
        if (sql.includes('FROM analysis WHERE clone_result_id = ?')) {
          const resultId = params[0];
          return data.analysis.find(a => a.clone_result_id === resultId) || null;
        }
        return null;
      },
      all: (sql, params = []) => {
        const data = readJson();
        if (sql.includes('FROM projects')) {
          return data.projects;
        }
        return [];
      }
    };
  }
}

module.exports = {
  initDb,
  getDb: () => {
    if (!dbInstance) initDb();
    return dbInstance;
  }
};
